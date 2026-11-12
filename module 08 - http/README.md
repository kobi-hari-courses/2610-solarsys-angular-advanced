# Module 08 - HTTP

## Projects

| Project | Project Description |
| --- | --- |
| [fun-with-http](./projects/fun-with-http/) | Calls a local REST API with `HttpClient`, compares observables with promises and `fetch`, and builds a debounced color search with `rxResource` |

## Summary

### A fake REST API server

The *fun-with-http* project includes a small REST server, written with built-in Node.js modules only, that we ran next to the Angular app:

```bash
npm run server
```

It listens on `http://localhost:3000`, uses [server/db.json](./projects/fun-with-http/server/db.json) as its database, and exposes `/users`, `/products`, and `/colors` with the standard REST verbs (GET, POST, PUT, PATCH, DELETE) plus query parameters for filtering, sorting, and pagination. See the [project README](./projects/fun-with-http/README.md) for the full API.

Two deliberate "features" of the server shaped the whole module:

* **Artificial delays** - user and product requests take 3 seconds, and every color request has its own random delay of 1-4 seconds. This made loading states visible, and made concurrent color responses arrive **out of order**.
* **CORS** is enabled, so the Angular app on port 4200 can call port 3000 directly.

### HttpClient and the data service

We put all HTTP access in one `DataService`, keeping components free of URLs and protocol details. `HttpClient` is injected like any other dependency, and each method is typed with a generic parameter, so consumers get real model types back:

```ts
@Service()
export class DataService {
    readonly #http = inject(HttpClient);
    readonly #baseUrl = 'http://localhost:3000';

    getAllUsers() {
        const url = `${this.#baseUrl}/users`;
        const res = this.#http.get<User[]>(url);
        return res;
    }

    addNewUser(name: string, email: string) {
        const newUser: User = { name, email, id: crypto.randomUUID() };
        const url = `${this.#baseUrl}/users`;
        const res = this.#http.post<User>(url, newUser);
        return res;
    }

    deleteUser(id: string) {
        const url = `${this.#baseUrl}/users/${id}`;
        const res = this.#http.delete<{}>(url);
        return res;
    }

    searchColors(text: string) {
        const url = `${this.#baseUrl}/colors?text=${text}`;
        const res = this.#http.get<Color[]>(url);
        return res;
    }
}
```

Note that in current Angular versions `HttpClient` is available out of the box - we did not need to register anything in `app.config.ts`.

### Observables, and why nothing happens until you subscribe

`HttpClient` methods do not return promises - they return **observables**. We learned that these observables are **cold**: creating one does *not* send the request. The request is sent only when someone **subscribes**, and the callback runs when the response arrives:

```ts
getAllUsers() {
  this.isBusy.set(true);
  const r$ = this.#dataService.getAllUsers();
  console.log('Completed calling getAllUsers'); // prints immediately!
  r$.subscribe((res) => {
    this.isBusy.set(false);
    this.users.set(res);
  });
}
```

The `console.log` proved the point: it printed long before the 3-second response came back, because calling the service method only *built* the request description.

In the subscribe callbacks we connected HTTP to what we already knew: the response updates **signals**, and list changes are **immutable**:

```ts
deleteUser(id: string) {
  this.isBusy.set(true);
  const r$ = this.#dataService.deleteUser(id);
  r$.subscribe(() => {
    this.isBusy.set(false);
    this.users.update(users => users.filter(user => user.id !== id));
  });
}
```

We also managed a manual **busy flag**: set it before subscribing, clear it in the callback, and show a loading indicator while it is on.

### Promises, fetch, and cancellation

For comparison, we wrote the same color search with the browser's `fetch`, which returns a **promise**:

```ts
async searchColorsWithPromise(text: string, abortSignal: AbortSignal) {
    const url = `${this.#baseUrl}/colors?text=${text}`;
    const res = await fetch(url, { signal: abortSignal });
    const data = (await res.json()) as Color[];
    return data;
}
```

The key differences we observed:

* A promise is **eager** - the request is sent the moment `fetch` is called - and it cannot be cancelled by itself. To cancel we must pass an **`AbortSignal`** (created by an `AbortController`) and call `abort()`.
* An observable is **lazy**, and cancellation is built in: **unsubscribing cancels the in-flight browser request**. Angular tooling built on observables gets cancellation for free.

Cancellation is not a luxury here. Because every color request has its own random delay, a fast typist fires several searches at once, and an **older response can arrive after a newer one** and overwrite it. The fix is to cancel the previous request whenever a new one starts.

### A debounced search box

Sending a request on every keystroke is wasteful, so we debounced the search text: the search should fire only after the user stops typing for a moment. The raw text lives in one signal, and `debounced` derives a delayed version of it:

```ts
readonly searchText = signal('');
readonly searchTrigger = debounced(this.searchText, 500);
```

`searchTrigger.value` is a signal that updates 500 ms after the last change, and `searchTrigger.isLoading()` reports the quiet period itself - useful for the busy indicator.

### rxResource - from observables back to signals

Finally, we connected the observable world to the signal world with **`rxResource`**: a resource that re-runs an observable-returning `stream` whenever its `params` signal changes, and exposes the result as signals:

```ts
readonly colorsResource = rxResource({
  params: this.searchTrigger.value,
  stream: (ctx) => this.#dataService.searchColors(ctx.params)
});

readonly busy = computed(() => this.searchTrigger.isLoading() || this.colorsResource.isLoading());
```

The resource gives us everything we built by hand before, without the boilerplate:

* `value()` - the latest result (a signal).
* `status()` and `isLoading()` - the request state, ready for loading indicators.
* **Automatic cancellation** - when `params` changes, the previous in-flight request is unsubscribed, which cancels it. The out-of-order problem disappears: a stale response can never overwrite a newer one.

The template consumes the resource like any other signals:

```html
<input type="search" #searchBox (input)="searchText.set(searchBox.value)">
<h1>Status: {{colorsResource.status()}}</h1>
@if(busy()) {
    <div>loading...</div>
}

<div class="colors">
  @for(clr of colorsResource.value(); track clr.id) {
    <app-color-presenter [color]="clr"/>
  }
</div>
```

### The color presenter

The results are rendered by a small presentational component that stays completely HTTP-free - it receives a `Color` through an `input` and derives its own background with a `computed` bound to a **host style binding**:

```ts
@Component({
  selector: 'app-color-presenter',
  styleUrl: './color-presenter.css',
  templateUrl: './color-presenter.html',
  host: {
    '[style.background-color]': 'rgb()'
  }
})
export class ColorPresenter {
  readonly color = input.required<Color>();

  readonly rgb = computed(() => `rgb(${this.color().r}, ${this.color().g}, ${this.color().b})`);
}
```

The division of labor repeats the pattern of the whole course: the service talks HTTP, signals and resources manage the state, and presentational components just show data they receive.
