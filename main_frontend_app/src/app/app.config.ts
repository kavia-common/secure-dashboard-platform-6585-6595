import { ApplicationConfig, ENVIRONMENT_INITIALIZER, Injector, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';
import { MockAuthService } from './core/services/mock-auth.service';

/**
 * reads global flag for mock usage from window.NG_APP_FEATURE_FLAGS or NG_APP_USE_MOCK_API
 */
function shouldUseMock(): boolean {
  try {
    const g: any = globalThis as any;
    const flagsStr = g.NG_APP_FEATURE_FLAGS as string | undefined;
    const direct = g.NG_APP_USE_MOCK_API;
    if (typeof direct === 'boolean') return direct;
    if (typeof direct === 'string') return direct === 'true';
    if (flagsStr && typeof flagsStr === 'string') {
      try {
        const flags = JSON.parse(flagsStr);
        if (typeof flags?.useMockApi === 'boolean') return flags.useMockApi;
        if (typeof flags?.mockAuth === 'boolean') return flags.mockAuth;
      } catch {
        // ignore JSON parse errors
      }
    }
  } catch {
    // ignore
  }
  // Default to true since backend is removed
  return true;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    // Swap AuthService implementation based on flag
    {
      provide: AuthService,
      useClass: shouldUseMock() ? MockAuthService : AuthService
    },
    // Optionally log which provider is active on bootstrap
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        return () => {
          console.info('[AppConfig] Auth provider:', shouldUseMock() ? 'MockAuthService' : 'AuthService (live)');
          console.info('[AppConfig] API base:', environment.apiBaseUrl);
        };
      }
    }
  ]
};
