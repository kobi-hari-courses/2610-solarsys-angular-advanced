# Module 07 - Dependency Injection

## Projects

| Project | Project Description |
| --- | --- |
| [fun-with-di](./projects/fun-with-di/) | Explores consumers, tokens, injectors and providers, the injector hierarchy, the different provider types, custom tokens with provider functions, and `runInInjectionContext` |
| [todo-list](./projects/todo-list/) | A todo list application combining a signal-based service with a multi-provided custom token, wrapped in `provide...` and `inject...` functions |

## Summary

### Consumer, token, injector, and provider

We learned the four participants of Angular's Dependency Injection system:

* A **consumer** is any code that needs a dependency - a component, a directive, or another service.
* A **token** is the *key* used to ask for a dependency. It can be a class (like `AdditionService`) or an `InjectionToken` for values that have no class.
* A **provider** is the *recipe* that tells Angular **how to create** the value for a token.
* An **injector** is the *container* that holds the recipes and the created instances. When a consumer asks for a token, the injector looks up the provider, creates the instance (once), caches it, and returns it.

The important insight: the consumer never knows *how* its dependency was created - it only names the token. The wiring between token and implementation lives in the providers.

### Creating services: @Service and @Injectable

We saw the `@Service()` decorator, which marks a class as a service and makes it **automatically available** in the DI system - no explicit provider needed. This is how `TodoService` in *todo-list* is declared:

```ts
@Service()
export class TodoService {
  readonly #items = signal<TodoItem[]>([]);
  readonly items = this.#items.asReadonly();

  addItem(caption: string) {
    this.#items.update((v) => [...v, { caption, isCompleted: false }]);
  }
}
```

In contrast, a class decorated with `@Injectable()` (without auto-provision) must be registered explicitly in a providers list - which gives us control over *where* in the injector hierarchy it lives:

```ts
@Injectable()
export class AdditionService {
  readonly historyService = inject(HistoryService);

  add(x: number, y: number) {
    const res = x + y;
    this.historyService.audit(`Addition Service add ${x}, ${y} with result ${res}`);
    return res;
  }
}
```

### The injector hierarchy

Injectors form a **tree**:

* The **root environment injector** is configured in `app.config.ts` and serves the whole application.
* Every component can create its own **element injector** by declaring a `providers` array. Its children (in the DOM tree) will see those providers.

When a consumer asks for a token, resolution starts at the **closest** injector and climbs **up** the tree until a provider is found. The first match wins - so a provider declared lower in the tree *shadows* the same token provided higher up.

In *fun-with-di*, the `Group` component provides `AdditionService` on its own element injector:

```ts
@Component({
  imports: [Calc],
  selector: 'app-group',
  templateUrl: './group.html',
  providers: [
    AdditionService
  ]
})
export class Group {}
```

The app template renders two `<app-group/>` elements and one bare `<app-calc/>`:

```html
<app-group/>
<app-group/>
<hr>
<app-calc/>
```

Each group contains three `<app-calc/>` components. By logging a random `id` in the service constructor we observed:

* All calcs **inside the same group** share one `AdditionService` instance - they resolve it from their group's element injector.
* Each group gets its **own** instance - two groups, two services.
* The bare calc outside any group climbs all the way to the **root** injector and gets the application-wide instance.

### The different provider types

We learned the different provider recipes, all demonstrated in `app.config.ts` of *fun-with-di*:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: WrongAdditionService,
      useClass: WrongAdditionService
    },
    {
      provide: AdditionService,
      useExisting: WrongAdditionService
    },
    provideHistoryPrefix('DATA'),
    provideHistoryPrefix('INFO'),
    provideNavItem('Home'),
    provideNavItem('Movies'),
    provideNavItem('About')
  ]
};
```

* **`useClass`** - instantiate the given class when the token is requested.
* **`useExisting`** - alias: resolve *another token* and return the same instance. Above, anyone asking for `AdditionService` actually receives the `WrongAdditionService` singleton (the one that adds `x + y + 1`) - without the consumer changing a single line.
* **`useValue`** - return a ready-made value as-is.
* **`useFactory`** - run a function to compute the value (great when creation needs logic or other dependencies).
* **`multi: true`** - instead of replacing the previous provider for the token, **accumulate** values into an array. This is how several `provideNavItem(...)` calls produce one `string[]` of nav items.

We also noted that when the same token is provided twice *without* `multi`, the **last provider wins** - that is why only one `HISTORY_PREFIX` ends up being used.

### Custom tokens with provider and injector functions

For values that are not classes we created an `InjectionToken`, and followed the Angular convention of wrapping it in a **`provide...` function** (using `makeEnvironmentProviders`) so consumers never touch the raw provider object:

```ts
export const NAV_ITEM = new InjectionToken<string[]>('NAV_ITEM');

export function provideNavItem(item: string): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: NAV_ITEM,
            useValue: item,
            multi: true
        }
    ])
}
```

A `useFactory` variant computes the value at creation time:

```ts
export const HISTORY_PREFIX = new InjectionToken<string>('HISTORY_PREFIX');

export function provideHistoryPrefix(prefix: string): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: HISTORY_PREFIX,
            useFactory: () => {
                const now = new Date();
                const thisTime = now.toTimeString();
                return `${thisTime} ${prefix}`
            }
        }
    ]);
}
```

In *todo-list* we completed the pattern with a matching **`inject...` function**, so the token itself can stay private to the file - consumers only ever see the two functions:

```ts
const TODO_FILTERS = new InjectionToken<TodoFilter[]>('TODO_FILTERS');

export function provideTodoFilter(displayName: string, predicate: TodoCondition): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: TODO_FILTERS,
            useValue: {displayName, predicate},
            multi: true
        }
    ]);
}

export function injectTodoFilters() {
    return inject(TODO_FILTERS);
}
```

### The inject function and the injection context

We learned that `inject(token)` can only be called inside an **injection context** - essentially, while Angular is constructing something (a component, directive, or service) and therefore knows *which injector* is currently active. That is why we call `inject` in **field initializers** or in the **constructor**:

```ts
export class App {
  readonly navItems = inject(NAV_ITEM);
}
```

Calling `inject` later - in an event handler, after an `await`, or inside a `setTimeout` - throws an error, because by then no injector is "current".

To build intuition, we sketched in `mission.ts` how this mechanism could work: Angular keeps a stack of "current" injectors - it pushes the injector before constructing a class and pops it afterwards, and `inject` simply reads the top of the stack:

```ts
const currentInjector: any[] = [];

function inject() {
    const myCaller = currentInjector[0];
}

function angularMagic() {
    currentInjector.push(Calc);
    Calc();
    currentInjector.pop();
}
```

### Injecting the injector and runInInjectionContext

Sometimes we *do* need a dependency outside the injection context. The trick is twofold:

1. **Inject the `Injector` itself** while we are still in the injection context, and store it.
2. Later, use **`runInInjectionContext`** to run a function *as if* it were inside that injector's injection context - making `inject` legal again.

In the `Calc` component we even resolved a service **after an `await`**, which would normally be impossible:

```ts
export class Calc {
  readonly additionService = inject(AdditionService);
  readonly injector = inject(Injector);

  async calc() {
    const x = await runInInjectionContext(this.injector, async () => {
      const a = inject(AdditionService);
      await new Promise(res => setTimeout(res, 3000));
      return a;
    });

    console.log('MY Addition service is ', x.id);
    const res = this.additionService.add(this.x(), this.y());
    this.result.set(res);
  }
}
```

Because we captured the component's own injector, the service resolved inside `runInInjectionContext` honors the **same hierarchy** - a calc inside a group still gets its group's `AdditionService`.

### The todo-list application

We finished the module with the *todo-list* project, which brought the DI concepts together with what we learned about signals and components:

* **State in a service**: `TodoService` owns a private writable signal and exposes it as read-only, together with immutable update methods (`addItem`, `toggleItem`, `removeItem`).
* **Extensible behavior via multi-providers**: the available filters are not hard-coded in any component - they are *registered* in `app.config.ts`. Adding a new filter is a one-line change:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideTodoFilter('All', (item) => true),
    provideTodoFilter('Completed', item => item.isCompleted),
    provideTodoFilter('Open', item => !item.isCompleted),
    provideTodoFilter('Short', item => item.caption.length < 8)
  ]
};
```

* **The root component consumes both** the service and the injected filters, deriving everything else with `computed`:

```ts
export class App {
  readonly todoService = inject(TodoService);
  readonly filters = injectTodoFilters();
  readonly tabs = computed(() => this.filters.map(f => f.displayName));
  readonly selectedTab = signal('All');
  readonly selectedFilter = computed(() => this.filters.find(f => f.displayName === this.selectedTab())!);

  readonly todos = computed(() =>
    this.todoService.items()
        .filter(item => this.selectedFilter().predicate(item)));
}
```

```html
<app-tabs-strip
  [tabs]="tabs()"
  [(selected)]="selectedTab"/>

<app-add-item
  (added)="todoService.addItem($event)"
/>

@for(item of todos(); track $index) {
  <app-todo-item
    [item]="item"
    (delete)="todoService.removeItem($index)"
    (toggle)="todoService.toggleItem($index)"
    />
}
```

The presentational components (`tabs-strip`, `add-item`, `todo-item`) stay completely DI-free - they communicate only through `input`, `model`, and `output` - while the service and the token do the heavy lifting.
