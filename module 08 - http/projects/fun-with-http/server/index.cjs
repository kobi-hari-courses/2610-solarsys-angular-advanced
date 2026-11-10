const { createServer: createHttpServer } = require('node:http');
const crypto = require('node:crypto');
const { randomUUID } = crypto;
const { readFileSync, writeFileSync, renameSync } = require('node:fs');
const { join } = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const databasePath = join(__dirname, 'db.json');
const methods = 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS';
const resources = new Set(['users', 'products', 'colors']);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readDatabase(path) {
  const database = JSON.parse(readFileSync(path, 'utf8'));
  if (!database || ![...resources].every((resource) => Array.isArray(database[resource]))) {
    throw new Error('Database must contain users, products, and colors arrays.');
  }
  return database;
}

function writeDatabase(path, database) {
  // Replace the file only after the complete updated database has been written.
  const temporaryPath = `${path}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(database, null, 2)}\n`);
  renameSync(temporaryPath, path);
}

async function readBody(request) {
  if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
    throw new HttpError(415, 'Use Content-Type: application/json.');
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }
  return body;
}

function listRecords(records, params, response) {
  let result = records.filter((record) =>
    [...params].every(([key, value]) => key.startsWith('_') || String(record[key]) === value),
  );
  const sort = params.get('_sort');
  if (sort) {
    const fields = sort.split(',');
    const orders = (params.get('_order') || 'asc').split(',');
    result.sort((left, right) => {
      for (let index = 0; index < fields.length; index++) {
        const a = left[fields[index]];
        const b = right[fields[index]];
        const comparison = a < b ? -1 : a > b ? 1 : 0;
        if (comparison) return comparison * (orders[index] === 'desc' ? -1 : 1);
      }
      return 0;
    });
  }
  if (params.has('_page') || params.has('_limit')) {
    const page = Number(params.get('_page') ?? 1);
    const limit = Number(params.get('_limit') ?? 10);
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1) {
      throw new HttpError(400, '_page and _limit must be positive integers.');
    }
    response.setHeader('X-Total-Count', result.length);
    result = result.slice((page - 1) * limit, page * limit);
  }
  return result;
}

async function sendJson(response, status, body, headOnly = false, delayMs = 3000, signal) {
  signal.throwIfAborted();
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  // Release the browser's identical-URL cache lock before simulating network latency.
  if (!headOnly) response.flushHeaders();
  await delay(delayMs, undefined, { signal });
  response.end(headOnly ? undefined : JSON.stringify(body));
}

function createServer({ dataFile = databasePath } = {}) {
  readDatabase(dataFile);

  const handler = async (request, response) => {
    const controller = new AbortController();
    const { signal } = controller;
    const cancel = () => {
      if (!response.writableFinished && !signal.aborted) {
        controller.abort();
        server.emit('requestCancelled', request.url);
      }
    };
    request.on('aborted', cancel);
    response.on('close', cancel);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', methods);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Location');
    response.setHeader('Cache-Control', 'no-store');

    let responseDelay = 3000;
    try {
      const url = new URL(request.url, 'http://localhost:3000');
      const parts = url.pathname.split('/').filter(Boolean);
      const [resource, id] = parts;
      if (resource === 'colors') responseDelay = crypto.randomInt(1000, 4001);

      if (request.method === 'OPTIONS') {
        response.writeHead(204);
        await delay(responseDelay, undefined, { signal });
        response.end();
        return;
      }

      if (!resources.has(resource) || parts.length > 2) {
        throw new HttpError(404, 'Resource not found.');
      }

      const method = request.method;
      const headOnly = method === 'HEAD';
      const allowed =
        resource === 'colors'
          ? ['GET', 'HEAD']
          : id
            ? ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE']
            : ['GET', 'HEAD', 'POST'];
      if (!allowed.includes(method)) {
        response.setHeader('Allow', [...allowed, 'OPTIONS'].join(', '));
        throw new HttpError(405, 'Method not allowed for this resource.');
      }

      // Read bodies before loading data so concurrent writes cannot use stale snapshots.
      const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(request) : undefined;
      signal.throwIfAborted();
      const database = readDatabase(dataFile);
      let records = database[resource];
      if (resource === 'colors' && id === undefined) {
        const text = (url.searchParams.get('text') ?? '').trim().toLowerCase();
        records = records.filter(
          (color) =>
            color.name.toLowerCase().includes(text) ||
            color.description.toLowerCase().includes(text),
        );
        url.searchParams.delete('text');
      }
      const index = id === undefined ? -1 : records.findIndex((record) => record.id === id);
      if (id !== undefined && index === -1) {
        throw new HttpError(404, 'Record not found.');
      }

      if (method === 'GET' || headOnly) {
        const result =
          id === undefined ? listRecords(records, url.searchParams, response) : records[index];
        await sendJson(response, 200, result, headOnly, responseDelay, signal);
        return;
      }

      let result;
      let status = 200;
      if (method === 'POST') {
        result = { ...body, id: randomUUID() };
        records.push(result);
        status = 201;
      } else if (method === 'DELETE') {
        records.splice(index, 1);
        result = {};
      } else {
        result = {
          ...(method === 'PATCH' ? records[index] : {}),
          ...body,
          id: records[index].id,
        };
        records[index] = result;
      }
      writeDatabase(dataFile, database);
      if (status === 201) response.setHeader('Location', `/${resource}/${result.id}`);
      await sendJson(response, status, result, false, responseDelay, signal);
    } catch (error) {
      if (signal.aborted) return;
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error('Request failed:', error);
      if (response.headersSent) {
        response.destroy(error);
        return;
      }
      try {
        await sendJson(
          response,
          status,
          { error: status === 500 ? 'Internal server error.' : error.message },
          request.method === 'HEAD',
          responseDelay,
          signal,
        );
      } catch (sendError) {
        if (!signal.aborted) {
          console.error('Unable to send error response:', sendError);
          response.destroy(sendError);
        }
      }
    } finally {
      request.off('aborted', cancel);
      response.off('close', cancel);
    }
  };
  const server = createHttpServer(handler);
  return server;
}

if (require.main === module) {
  let server;
  try {
    server = createServer();
  } catch (error) {
    console.error('Unable to load the API database.', error);
    process.exit(1);
  }
  server.on('requestCancelled', (url) => console.log(`Cancelled request: ${url}`));
  server.on('error', (error) => {
    console.error('Unable to start the fake API:', error);
    process.exitCode = 1;
  });
  server.listen(3000, 'localhost', () => {
    console.log('Fake API: http://localhost:3000 (colors: 1-4 seconds; users/products: 3 seconds)');
  });
}

module.exports = { createServer };
