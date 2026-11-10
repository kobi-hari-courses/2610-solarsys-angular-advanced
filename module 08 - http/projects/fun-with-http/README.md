# FunWithHttp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Fake HTTP API

The fake REST server uses only built-in Node.js modules (no server dependencies).
All server code, data, and tests are in [server](./server).
Start it in a separate terminal:

```bash
npm run server
```

The API runs at `http://localhost:3000` using [server/db.json](./server/db.json) as its database.
Every request, including errors and CORS preflight requests, is delayed by 3 seconds.
JSON response headers are sent immediately, with the body delayed by 3 seconds.
This prevents browsers from queuing identical URLs while waiting for cache headers;
simultaneous requests complete together rather than one every 3 seconds.
Keep `npm start` running separately for the Angular application.
CORS is enabled, so Angular can call the API directly from `http://localhost:4200`.

Both `/users` and `/products` support:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/products` | List all products |
| GET | `/products/:id` | Get a product by UUID |
| POST | `/products` | Create a product (ID is generated) |
| PUT | `/products/:id` | Replace a product |
| PATCH | `/products/:id` | Update selected fields |
| DELETE | `/products/:id` | Delete a product |

Use the same paths with `/users` to manage users. Send JSON bodies with
`Content-Type: application/json` for POST, PUT, and PATCH.
All user and product IDs are UUID strings. Replace `:id` with the record's UUID,
for example `/products/576cfc24-2b89-40c3-85cb-8a345a20ee89`.
POST generates a UUID using Node.js `crypto.randomUUID()`; PUT and PATCH preserve the existing ID.

Examples of filtering, sorting, and pagination:

- `http://localhost:3000/products?inStock=true`
- `http://localhost:3000/products?_sort=price&_order=asc`
- `http://localhost:3000/products?_page=1&_limit=2`

Writes persist to `server/db.json`, including across server restarts. Edit that file to
change or restore the sample data. This server is for local demonstrations only;
it has no authentication or application-level validation.

Run the server integration tests with `npm run test:server`. They use a temporary
database and a separate available port, leaving your data and running server untouched.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
