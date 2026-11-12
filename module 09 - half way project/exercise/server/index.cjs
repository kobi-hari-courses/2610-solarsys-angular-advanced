// Solar Dashboard exercise API server.
// A hand-written HTTP server using only built-in Node.js modules.
// Start it with:  node index.cjs   (or `npm run server` from the exercise folder)
//
// The server is read-only (GET). All data is loaded into memory at startup,
// and every request handler is asynchronous, so the server handles any number
// of concurrent requests - the artificial delay never blocks other requests.

const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const PORT = 3000;

// ---------------------------------------------------------------------------
// Data: one JSON file per collection, loaded once at startup.
// ---------------------------------------------------------------------------
function loadCollection(name) {
  const records = JSON.parse(readFileSync(join(__dirname, 'data', `${name}.json`), 'utf8'));
  if (!Array.isArray(records)) {
    throw new Error(`data/${name}.json must contain a JSON array.`);
  }
  return records;
}

const collections = {
  companies: loadCollection('companies'),
  sites: loadCollection('sites'),
  activities: loadCollection('activities'),
  washes: loadCollection('washes'),
};

// ---------------------------------------------------------------------------
// Period filtering. The `period` query parameter is supported on /activities
// and /washes. It is translated to an inclusive 'YYYY-MM-DD' range, and the
// records are filtered by their `day` field. Day strings in this format
// compare correctly as plain strings.
// ---------------------------------------------------------------------------
const PERIOD_COLLECTIONS = new Set(['activities', 'washes']);

function addMonths(date, months) {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

function toIsoDay(date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodRange(kind, today) {
  switch (kind) {
    case 'this-quarter':
      return { from: toIsoDay(addMonths(today, -3)), to: toIsoDay(today) };
    case 'last-year-quarter':
      return { from: toIsoDay(addMonths(today, -15)), to: toIsoDay(addMonths(today, -12)) };
    case 'this-month':
      return { from: toIsoDay(addMonths(today, -1)), to: toIsoDay(today) };
    case 'last-year-month':
      return { from: toIsoDay(addMonths(today, -13)), to: toIsoDay(addMonths(today, -12)) };
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Request handling.
// ---------------------------------------------------------------------------
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function handleRequest(collectionName, id, searchParams) {
  const records = collections[collectionName];
  if (!records) {
    throw new HttpError(404, `Unknown resource '/${collectionName}'. Available: ${Object.keys(collections).join(', ')}.`);
  }

  if (id !== undefined) {
    const record = records.find((r) => r.id === id);
    if (!record) throw new HttpError(404, `No record with id '${id}' in /${collectionName}.`);
    return record;
  }

  let result = records;

  for (const [key, value] of searchParams) {
    if (key === 'period') {
      if (!PERIOD_COLLECTIONS.has(collectionName)) {
        throw new HttpError(400, `The 'period' parameter is only supported on /activities and /washes.`);
      }
      const range = getPeriodRange(value, new Date());
      if (!range) {
        throw new HttpError(
          400,
          `Unknown period '${value}'. Allowed values: this-quarter, last-year-quarter, this-month, last-year-month. Omit the parameter for all time.`,
        );
      }
      result = result.filter((r) => r.day >= range.from && r.day <= range.to);
    } else {
      // Generic equality filter, e.g. ?companyId=... or ?siteId=...
      result = result.filter((r) => String(r[key]) === value);
    }
  }

  return result;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function sendJson(response, status, body) {
  response.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') {
      response.writeHead(204, corsHeaders);
      response.end();
      return;
    }
    if (request.method !== 'GET') {
      throw new HttpError(405, 'Only GET is supported.');
    }

    const url = new URL(request.url, `http://localhost:${PORT}`);
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length === 0 || segments.length > 2) {
      throw new HttpError(404, 'Use /companies, /sites, /activities, or /washes.');
    }

    const body = handleRequest(segments[0], segments[1], url.searchParams);

    // A small artificial delay so loading states are visible in the app.
    // The delay is awaited, not slept, so concurrent requests are unaffected.
    await delay(300 + Math.random() * 500);

    sendJson(response, 200, body);
    console.log(`GET ${url.pathname}${url.search} -> ${Array.isArray(body) ? body.length + ' records' : 'one record'}`);
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.status, { error: error.message });
    } else {
      console.error(error);
      sendJson(response, 500, { error: 'Internal server error.' });
    }
  }
});

server.listen(PORT, () => {
  const counts = Object.entries(collections)
    .map(([name, records]) => `${name}: ${records.length}`)
    .join(', ');
  console.log(`Solar Dashboard API listening on http://localhost:${PORT} (${counts})`);
});
