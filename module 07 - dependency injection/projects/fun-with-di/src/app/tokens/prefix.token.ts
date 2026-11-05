import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from "@angular/core";

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