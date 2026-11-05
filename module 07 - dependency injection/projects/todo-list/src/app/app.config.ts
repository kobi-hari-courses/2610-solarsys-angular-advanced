import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideTodoFilter } from './tokens/todo-filter.token';

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
