# Module 04 - Angular Components

## Projects

| Project | Project Description |
| --- | --- |
| [notepad](./projects/notepad/) | Builds a notepad interface to practice CSS layout, component inputs, outputs, and model inputs |

## Summary

In this module, we built the Notepad application. It introduced component communication - input signals, outputs, and model inputs - along with CSS organization, grid layout, computed signals, and host bindings.

### Organizing CSS and building a responsive layout

We organized styles into global styles and component styles. The global stylesheet established baseline sizing and reset rules, and defined custom properties to keep shared CSS values in one place:

```css
html,
body {
  width: 100%;
  height: 100%;
}

:root {
  --divider-color: rgb(187, 187, 187);
  --hover-color: rgb(228, 228, 228);
  --selected-color: rgb(171, 210, 192);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

#### CSS custom properties as shared constants

The `--divider-color`, `--hover-color`, and `--selected-color` declarations are **CSS custom properties**. We used them like named constants: instead of repeating color values in multiple component stylesheets, we give each value a meaningful name and refer to it with `var(...)`. For example, the string selector uses `var(--divider-color)` for each option's border, `var(--hover-color)` for the hover background, and `var(--selected-color)` for the chosen option's background. This makes the styles easier to read and lets us update a shared color in one place. Defining them on `:root` makes them available throughout the document through CSS inheritance.

#### Reset rules, box sizing, and page dimensions

Browsers supply default margins and padding for some elements. Setting both to zero with the universal `*` selector gives the application a predictable starting point instead of leaving those defaults to affect the layout. The reset also chooses one font family consistently.

By default, CSS uses `content-box` sizing: a declared width or height applies to the content, and padding and borders are added outside those dimensions. With `box-sizing: border-box`, the declared width and height include the content, padding, and border. That makes element dimensions easier to reason about and helps prevent padding from unexpectedly making an element larger than its allocated space.

The stylesheet sets both `html` and `body` to `100%` width and height so the page can occupy the available viewport dimensions. The `body` then acts as a column flex container, and the Notepad's root component grows to use available space. With `border-box`, the body's `0.5rem` padding is included within its 100% dimensions rather than added on top of them.

#### CSS Grid and sizing tracks

In the Notepad, CSS Grid arranges the title, formatting controls, and text area into named regions:

```css
:host {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    'title title title'
    'colors fonts sizes'
    'text text text';
  gap: 0.5rem;
}
```

`display: grid` makes the component a grid container. `grid-template-columns` describes its three columns: `repeat(3, 1fr)` creates three equal flexible tracks. An `fr` unit represents a fraction of the available space, so the columns share the remaining width after gaps and other constraints are accounted for.

`grid-template-rows` defines three rows. The first two use `auto`, so their sizes are based on their contents; the last uses `1fr`, so it takes a share of the remaining available height. `flex-grow: 1` lets the component itself use space provided by its flex parent, giving that final flexible row room to grow. `gap` adds consistent spacing between grid cells.

`grid-template-areas` gives the cells readable names and describes how those cells are arranged: the title and text area each span all three columns, while the color, font, and size controls sit beside one another in the middle row. Child elements are assigned to those areas with `grid-area`. Flexible `fr` tracks use available space instead of requiring fixed pixel widths, and named areas make it straightforward to rearrange the layout at a narrower-screen breakpoint. Grid does not do that automatically, so the component adds a media query that redefines the tracks and areas for narrow screens:

```css
@media (max-width: 600px) {
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto;
  grid-template-areas:
    'colors'
    'fonts'
    'sizes'
    'text';
}
```

Below `600px` the same children flow into a single column: the selectors stack on top of each other and the text area sits beneath them. Because the layout is described by named areas, the responsive redesign only needed new track and area definitions - no markup changes.

### Styling from template state

Angular property bindings connect template properties to expressions in the component. The expression is evaluated, and Angular updates the DOM when its value changes.

`[class.chosen]` conditionally adds or removes the CSS class named `chosen`. When the expression is truthy, the class is present; when it is false, the class is removed. The stylesheet can then define what that class looks like. This separates the *state* (which option is selected) from the *presentation* of that state (the `.chosen` CSS rules).

`[style.property]` binds a specific inline style property to an expression. Angular updates that style as the value changes. In the Notepad, these bindings let the user's selected color, font family, and font size directly control the text area's appearance:

```html
<li
  [class.chosen]="item === selectedOption()"
  (click)="selectOption(item)"
>
  {{ item }}
</li>

<textarea
  [style.color]="selectedColor()"
  [style.font-size]="selectedSize()"
  [style.font-family]="selectedFont()"
></textarea>
```

Use a class binding when the value represents a named visual state with a reusable set of CSS rules, such as a chosen option. Use a style binding when the component needs to supply the value of a particular style dynamically, such as a color or font size selected by the user.

### The title component and input signals

We built the `Title` component and passed values into it from its parent. Angular's `input()` and `input.required()` functions declare **read-only input signals**. The child can read the latest value by calling the signal, but it cannot use `.set()` or `.update()` to change the input. The parent owns the value and passes it down; if the child needs to request a change, it should communicate that intention through an output or use a model input when two-way binding is appropriate.

This read-only boundary helps avoid a problem with older, decorator-based Angular inputs, which were ordinary writable component properties. A child could accidentally assign to an input value, creating a second writer for state owned by the parent. Competing updates can make it harder to reason about which value is current and can lead to timing or race-condition-like bugs. A read-only input makes the ownership direction clearer.

`input.required` declares an input that must be supplied by the parent. `input` can declare an optional input and can provide a default value:

```typescript
readonly caption = input.required<string>();
readonly color = input('black');
```

There are two common ways to provide an input value in a template:

```html
<app-title
  caption="Welcome To Notepad"
  [color]="selectedColor()"
/>
```

Without square brackets, an attribute value is supplied as a static string. Here, `caption="Welcome To Notepad"` passes that literal text. With square brackets, Angular evaluates the value as a template expression and passes the result. Here, `[color]="selectedColor()"` reads the current value of the `selectedColor` signal, so the title receives the current selection rather than the literal characters `selectedColor()`. Use brackets when passing a variable, signal value, number, boolean, array, object, or other expression; omit them for a fixed string.

#### Computed signals

A **computed signal** represents a value derived from one or more other signals. Create one with `computed(() => ...)`, and read it like any other signal by calling it. The `Title` component derives two values from its inputs:

```typescript
readonly upperCaption = computed(() => this.caption().toUpperCase());

readonly background = computed(() => getContrastingGray(this.color()));
```

Computed signals are **read-only**: callers can read `background()`, but cannot set or update its value directly. They are also **lazy** and **cached**. Angular does not run the computation until something reads the computed signal. After it runs, Angular caches the result and returns that cached result on later reads as long as its dependencies have not changed.

Angular tracks dependencies while a computed function is running. When the function calls `this.color()`, that signal registers the active computation as a consumer that depends on it. If the color changes, Angular marks the computed value as stale and invalidates its cached result. The next time `background()` is read, Angular recalculates it and caches the new result. This automatic dependency tracking keeps derived values up to date without manually coordinating every change.

Here, the `getContrastingGray` helper uses canvas color parsing and relative luminance to choose between a dark and light gray, so the title's background always contrasts with the selected text color. It demonstrates that computed signals can derive values even when the calculation is more involved than a simple expression.

#### Host bindings

Instead of wrapping its content in an extra element, the `Title` component binds styles and events directly on its **host element** using the `host` metadata of the `@Component` decorator:

```typescript
@Component({
  selector: 'app-title',
  templateUrl: './title.html',
  styleUrl: './title.css',
  host: {
    '[style.color]': 'color()',
    '[style.background]': 'background()',
    '(click)': 'whenClicked()'
  }
})
```

`[style.color]` and `[style.background]` are the same style bindings we used in templates, but applied to the `<app-title>` element itself. `(click)` attaches an event listener to the host element, so clicking anywhere on the title invokes the component's `whenClicked()` method. Host bindings keep the component's outer element part of its API without adding wrapper markup.

### The string-selector component and model inputs

The second component, `StringSelector`, receives an array of options and exposes its selected value as a model input:

```typescript
readonly options = input.required<string[]>();
readonly selectedOption = model('');

selectOption(value: string) {
  this.selectedOption.set(value);
}
```

Unlike a regular input, a model input is **writable** inside the child: clicking an option calls `selectOption`, which sets the model's value. The template renders the options with an `@for` block and marks the chosen one with a class binding.

The parent passes an array of options. `possibleColors()` is an expression that evaluates to an array, so it uses square brackets. The parent also uses two-way binding for the selected value:

```html
<app-string-selector
  [options]="possibleColors()"
  [(selectedOption)]="selectedColor"
/>
```

A model input can be used in three related ways:

1. **As an input:** Bind `[selectedOption]="selectedColor()"` to pass the parent's current value into the child. This sends the value from parent to child. A model input is writable inside the child, but if the parent only binds the input and does not listen for the output, a change made in the child will not update the parent's state.
2. **As an output:** Listen for `(selectedOptionChange)="selectColor($event)"`. A model input automatically provides a matching `selectedOptionChange` output; when the child updates its model value, it emits the new value. The parent can handle that event and decide what to do with `$event`.
3. **As two-way binding ("banana in a box"):** Use `[(selectedOption)]="selectedColor"` to combine the input and output behavior. The parent passes its current value down, and when the child changes the selection, Angular propagates the new value back to the parent. Conceptually, this combines `[selectedOption]` with `(selectedOptionChange)` and an assignment of the emitted value.

The project uses the third form so choosing an option in `StringSelector` updates the corresponding signal in the parent. The app reuses the same component three times — for colors, fonts, and sizes — each bound to its own signal. Model inputs are useful when a child is expected to both receive a value and request changes to that same value; use a regular input when data should flow only from parent to child.

### Outputs

An **output** lets a child component notify its parent about an event. The `Title` component declares an output and uses its host `(click)` listener to detect a triple click — it counts clicks, and on the third one emits how many milliseconds passed since the first:

```typescript
readonly tripleClicked = output<number>();

#clickCount = 0;
#timeOfFirstClick = 0;

whenClicked() {
  if (this.#clickCount === 0) {
    this.#timeOfFirstClick = Date.now();
  }

  this.#clickCount++;

  if (this.#clickCount === 3) {
    this.tripleClicked.emit(Date.now() - this.#timeOfFirstClick);
    this.#clickCount = 0;
  }
}
```

The parent listens for the event with an event binding and receives the emitted value through `$event`:

```html
<app-title
  caption="Welcome To Notepad"
  [color]="selectedColor()"
  (tripleClicked)="whenTripleClicked($event)"
/>
```

```typescript
whenTripleClicked(duration: number) {
  console.log(`Title was triple clicked in ${duration}ms`);
}
```

Outputs complete the component communication picture: inputs pass data from parent to child, outputs send events from child to parent, and model inputs combine both for a single shared value.
