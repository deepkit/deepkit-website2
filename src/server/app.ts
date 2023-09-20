import { App, findParentPath } from '@deepkit/app';
import { FrameworkModule } from '@deepkit/framework';
import { AppConfig } from './config';
import { MainController } from '@app/server/controller/main.controller';
import { AngularListener } from '@app/server/angular';
import { serveStaticListener } from '@deepkit/http';
import { join } from 'path';
import { Algolia } from "@app/server/algolia";
import { OpenAI } from "openai";
import { mlGenAnswerCommand, mlGenQuestionCommand } from "@app/server/commands/ml-fine-tuning";

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
    providers: [
        Algolia,
        {
            provide: OpenAI, useFactory(openaiApiKey: AppConfig['openaiApiKey']) {
                return new OpenAI({ apiKey: openaiApiKey });
            }
        },
    ],
    imports: [
        new FrameworkModule()
    ]
})
    .command('search:index', (algolia: Algolia) => algolia.index())
    .command('search:find', (query: string, algolia: Algolia) => algolia.find(query))
    .command('ml:gen-questions', mlGenQuestionCommand)
    .command('ml:gen-answers', mlGenAnswerCommand)
    .loadConfigFromEnv({ namingStrategy: 'same', prefix: 'app_', envFilePath: ['local.env'] })
    .setup((module) => {
        const assets = findParentPath('dist/', __dirname);
        if (assets) {
            module.addListener(serveStaticListener(module, '/', join(assets, 'app/browser')));
        }
    })
    .run();
