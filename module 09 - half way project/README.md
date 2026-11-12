# Module 09 - Half-Way Project

This module has no new material. It is a **mid-course project**: one exercise that summarizes and connects everything we learned so far, built from scratch and on your own.

## The project

* [Exercise: Solar Dashboard](./exercise/README.md) - a data dashboard that tracks solar panel energy production, with a company picker, a sites sidebar, period selection, and summary, washes, and efficiency sections. The data comes from an API server that is included with the exercise.

## What it brings together

The project is built **in layers**, following the architecture we practiced in the module 07 Mini Shop solution, and it exercises the skills of every module so far:

| Skill | Where it shows up in the project |
| --- | --- |
| TypeScript types and immutable data (modules 02, 05) | The code model: `readonly` interfaces for companies, sites, activities, and washes |
| Components, `input` and `output` (modules 03, 04) | Views, presenters, and widgets - smart components inject services, dumb components only receive and emit |
| Signals, `computed`, derived state (module 05) | One small selection state; everything else - view models included - is derived with `computed` |
| Pure functions and immutable updates (module 05) | View model builders and state updaters are pure and side-effect free |
| CSS basics (module 06) | A minimal, deliberately simple dashboard layout |
| Dependency injection (module 07) | Services with `inject()`, and a custom token with `provide...` / `inject...` functions for the API base URL |
| HTTP, observables, resources (module 08) | A typed data service over `HttpClient`, and `rxResource` reloading automatically when the selection changes |

## Why a half-way project

Until now, every exercise focused on the topic of its own module. This project is different: nothing guides you except the requirements and the architecture. Its goal is to show you how the pieces fit together into a real application - and to show yourself how much you can already build on your own.
