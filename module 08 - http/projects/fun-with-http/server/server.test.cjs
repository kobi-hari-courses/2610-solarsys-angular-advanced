const assert = require('node:assert/strict');
const { once } = require('node:events');
const { copyFileSync, mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { test } = require('node:test');
const { createServer } = require('./index.cjs');
const crypto = require('node:crypto');

test('1,000 unique colors support text search and random delay boundaries', async (t) => {
  const { colors } = JSON.parse(readFileSync(join(__dirname, 'db.json'), 'utf8'));
  assert.equal(colors.length, 1000);
  for (const key of ['id', 'name']) {
    assert.equal(new Set(colors.map((color) => color[key])).size, 1000);
  }
  assert.equal(new Set(colors.map(({ r, g, b }) => `${r},${g},${b}`)).size, 1000);
  for (const color of colors) {
    assert.match(
      color.id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    assert.ok(color.name.length > 0 && color.description.length > 0);
    for (const channel of [color.r, color.g, color.b]) {
      assert.ok(Number.isInteger(channel) && channel >= 0 && channel <= 255);
    }
  }
  const server = createServer();
  t.after(() => new Promise((resolve) => server.close(resolve)));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  let selectedDelay = 1000;
  t.mock.method(crypto, 'randomInt', (min, max) => {
    assert.equal(min, 1000);
    assert.equal(max, 4001);
    return selectedDelay;
  });

  const cases = [
    ['', colors],
    ['?text=', colors],
    ['?text=%20%20', colors],
    ['?text=%20bLuE%20', colors.filter((color) => /blue/i.test(color.name + color.description))],
    ['?text=lue', colors.filter((color) => /lue/i.test(color.name + color.description))],
    ['?text=saturation', colors],
    ['?text=not-a-color-%26%3F', []],
  ];
  assert.ok(cases[3][1].length > 0 && cases[3][1].length < 1000);
  for (selectedDelay of [1000, 4000]) {
    const batchStart = performance.now();
    await Promise.all(
      cases.map(async ([query, expected]) => {
        const start = performance.now();
        const response = await fetch(`${base}/colors${query}`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('access-control-allow-origin'), '*');
        assert.ok(performance.now() - start < 900, 'Headers must not wait for the color delay');
        assert.deepEqual(await response.json(), expected);
        const elapsed = performance.now() - start;
        assert.ok(elapsed >= selectedDelay && elapsed < selectedDelay + 1000, `${elapsed}ms`);
      }),
    );
    assert.ok(
      performance.now() - batchStart < selectedDelay + 1000,
      'Search requests must overlap',
    );
  }
});

test('fake API preserves CRUD, persistence, queries, CORS, and a 3-second delay', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'fake-http-test-'));
  const dataFile = join(directory, 'db.json');
  copyFileSync(join(__dirname, 'db.json'), dataFile);
  const initial = JSON.parse(readFileSync(dataFile, 'utf8'));
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const ids = [...initial.users, ...initial.products].map((record) => record.id);
  ids.forEach((id) => assert.match(id, uuidPattern));
  assert.equal(new Set(ids).size, ids.length);
  const server = createServer({ dataFile });
  t.after(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    rmSync(directory, { recursive: true });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;

  async function request(path, method = 'GET', body, expectedStatus = 200) {
    const start = performance.now();
    const response = await fetch(base + path, {
      method,
      headers: { Origin: 'http://localhost:4200', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    assert.ok(performance.now() - start >= 3000, `${method} ${path} must wait 3 seconds`);
    assert.equal(response.status, expectedStatus, text);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    return { response, body: text ? JSON.parse(text) : undefined };
  }

  const concurrentStart = performance.now();
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      const start = performance.now();
      const response = await fetch(`${base}/users`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.ok(performance.now() - start < 2000, 'Headers must arrive before the body delay');
      assert.deepEqual(await response.json(), initial.users);
      assert.ok(performance.now() - start >= 3000, 'Each body must be delayed');
    }),
  );
  assert.ok(performance.now() - concurrentStart < 6000, 'Identical requests must not queue');

  await Promise.all(
    ['users', 'products'].map(async (resource) => {
      const original = initial[resource];
      assert.deepEqual((await request(`/${resource}`)).body, original);
      assert.deepEqual((await request(`/${resource}/${original[0].id}`)).body, original[0]);
      const created = await request(
        `/${resource}`,
        'POST',
        { name: 'Test', extra: true, id: 123 },
        201,
      );
      const id = created.body.id;
      assert.match(id, uuidPattern);
      assert.ok(!ids.includes(id));
      ids.push(id);
      assert.equal(created.response.headers.get('location'), `/${resource}/${id}`);
      assert.equal(JSON.parse(readFileSync(dataFile, 'utf8'))[resource].at(-1).id, id);
      assert.deepEqual((await request(`/${resource}/${id}`)).body, created.body);
      const patched = await request(`/${resource}/${id}`, 'PATCH', { name: 'Patched', id: 9999 });
      assert.deepEqual(patched.body, { id, name: 'Patched', extra: true });
      const replaced = await request(`/${resource}/${id}`, 'PUT', { name: 'Replaced' });
      assert.deepEqual(replaced.body, { id, name: 'Replaced' });
      await request(`/${resource}/${id}`, 'DELETE');
      await request(`/${resource}/${id}`, 'GET', undefined, 404);
      assert.deepEqual((await request(`/${resource}`)).body, original);
    }),
  );

  await Promise.all([
    (async () => {
      const result = await request('/products?inStock=true');
      assert.deepEqual(
        result.body,
        initial.products.filter((record) => record.inStock),
      );
    })(),
    (async () => {
      const result = await request('/products?_sort=price&_order=desc&_page=1&_limit=2');
      assert.deepEqual(
        result.body,
        [...initial.products].sort((a, b) => b.price - a.price).slice(0, 2),
      );
      assert.equal(result.response.headers.get('x-total-count'), String(initial.products.length));
    })(),
    (async () => {
      const result = await request('/products', 'OPTIONS', undefined, 204);
      assert.ok(result.response.headers.get('access-control-allow-methods').includes('PATCH'));
    })(),
    request('/products', 'HEAD'),
    request('/unknown', 'GET', undefined, 404),
    request('/__proto__', 'GET', undefined, 404),
    request('/products?_page=0', 'GET', undefined, 400),
    request('/products', 'PUT', {}, 405),
    request('/users', 'POST', [], 400),
    (async () => {
      const response = await fetch(`${base}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid',
      });
      assert.equal(response.status, 400);
    })(),
    (async () => {
      const response = await fetch(`${base}/users`, { method: 'POST', body: '{}' });
      assert.equal(response.status, 415);
    })(),
  ]);
  assert.deepEqual(JSON.parse(readFileSync(dataFile, 'utf8')), initial);

  const persisted = await request('/users', 'POST', { name: 'Persisted' }, 201);
  // A new server instance must see records written by the previous instance.
  const restarted = createServer({ dataFile });
  restarted.listen(0, '127.0.0.1');
  await once(restarted, 'listening');
  try {
    const response = await fetch(
      `http://127.0.0.1:${restarted.address().port}/users/${persisted.body.id}`,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), persisted.body);
  } finally {
    await new Promise((resolve) => restarted.close(resolve));
  }
});
