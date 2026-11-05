import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from "@angular/core";

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