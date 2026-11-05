import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { AdditionService } from './services/addition.service';
import { WrongAdditionService } from './services/wrong-addition.service';
import { HISTORY_PREFIX, provideHistoryPrefix } from './tokens/prefix.token';
import { provideNavItem } from './tokens/nav-item.token';

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
