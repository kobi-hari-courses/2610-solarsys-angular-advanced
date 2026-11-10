# FunWithHttp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Fake HTTP API

Install dependencies with `npm install`, then start the fake REST server in a separate terminal:

```bash
npm run server
```

The API runs at `http://localhost:3000` using [db.json](./db.json) as its database.
Keep `npm start` running separately for the Angular application.
CORS is enabled, so Angular can call the API directly from `http://localhost:4200`.

Both `/users` and `/products` support:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/products` | List all products |
| GET | `/products/1` | Get a product by ID |
| POST | `/products` | Create a product (ID is generated) |
| PUT | `/products/1` | Replace a product |
| PATCH | `/products/1` | Update selected fields |
| DELETE | `/products/1` | Delete a product |

Use the same paths with `/users` to manage users. Send JSON bodies with
`Content-Type: application/json` for POST, PUT, and PATCH.

Examples of filtering, sorting, and pagination:

- `http://localhost:3000/products?inStock=true`
- `http://localhost:3000/products?_sort=price&_order=asc`
- `http://localhost:3000/products?_page=1&_limit=2`

Writes persist to `db.json`, including across server restarts. Edit that file to
change or restore the sample data. This server is for local demonstrations only;
it has no authentication or application-level validation.

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
