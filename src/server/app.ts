import { App, findParentPath } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';
import { AppConfig } from './config';
import { MainController } from '@app/server/controller/main.controller';
import { AngularListener } from '@app/server/angular';
import { serveStaticListener } from '@deepkit/http';
import { join } from 'path';

(global as any).window = undefined;
(global as any).document = undefined;

new App({
    config: AppConfig,
    controllers: [
        MainController,
    ],
    listeners: [
        AngularListener,
    ],
    providers: [],
    imports: [
        new FrameworkModule()
    ]
})
    .setup((module) => {
        const assets = findParentPath('dist/', __dirname);
        if (assets) {
            module.addListener(serveStaticListener(module, '/', join(assets, 'app/browser')));
        }
    })
    .loadConfigFromEnv({ namingStrategy: 'same', prefix: 'app_' })
    .run();
