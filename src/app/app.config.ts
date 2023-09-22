import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { withZoneModule } from "@app/app/zone";
import { createRpcWebSocketClientProvider } from "@deepkit/rpc";
import { ControllerClient } from "@app/app/client";
import { provideClientHydration } from "@angular/platform-browser";
import { AppMetaStack } from '@app/app/components/title';

export const appConfig: ApplicationConfig = {
    providers: [
        AppMetaStack,
        provideClientHydration(),
        provideRouter(routes, withRouterConfig({}), withInMemoryScrolling({anchorScrolling: 'enabled',  scrollPositionRestoration: 'enabled'})),
        withZoneModule(),
        ControllerClient,
        createRpcWebSocketClientProvider(),
    ]
};
