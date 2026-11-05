import { EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { TodoItem } from "../models/todo-item.model";

export type TodoCondition = (item: TodoItem) => boolean;;

export interface TodoFilter {
    readonly displayName: string;
    readonly predicate: TodoCondition;
}

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