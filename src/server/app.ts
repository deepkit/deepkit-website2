import { App, findParentPath } from '@deepkit/app';
import { FrameworkModule, onServerMainBootstrap } from '@deepkit/framework';
import { AppConfig } from './config';
import { MainController } from '@app/server/controller/main.controller';
import { AngularListener } from '@app/server/angular';
import { serveStaticListener } from '@deepkit/http';
import { join } from 'path';
import { Algolia } from "@app/server/algolia";
import { OpenAI } from "openai";
import { mlGenAnswerCommand, mlGenQuestionCommand } from "@app/server/commands/ml-fine-tuning";
import { WebController } from "@app/server/controller/web.controller";
import { PageProcessor } from "@app/server/page-processor";
import { Questions, testQuestions } from "@app/server/questions";
import { registerBot } from "@app/server/commands/discord";
import { MainDatabase } from "@app/server/database";
import { Database } from "@deepkit/orm";
import { Client, GatewayIntentBits } from "discord.js";

(global as any).window = undefined;
(global as any).document = undefined;

new App({
    config: AppConfig,
    controllers: [
        MainController,
        WebController,
    ],
    listeners: [
        AngularListener,
    ],
    providers: [
        PageProcessor,
        Questions,
        Algolia,
        { provide: Database, useClass: MainDatabase },
        {
            provide: OpenAI, useFactory(openaiApiKey: AppConfig['openaiApiKey']) {
                return new OpenAI({ apiKey: openaiApiKey });
            }
        },
        {
            provide: Client, useFactory() {
                return new Client({
                    intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMessages,
                        GatewayIntentBits.MessageContent,
                        GatewayIntentBits.GuildMembers,
                        GatewayIntentBits.GuildMessageReactions,
                    ],
                });
            }
        }
    ],
    imports: [
        new FrameworkModule()
    ]
})
    .command('search:index', (algolia: Algolia) => algolia.index())
    .command('search:find', (query: string, algolia: Algolia) => algolia.find(query))
    .command('ml:gen-questions', mlGenQuestionCommand)
    .command('ml:gen-answers', mlGenAnswerCommand)
    .command('ml:q', testQuestions)
    .listen(onServerMainBootstrap, registerBot)
    .loadConfigFromEnv({ namingStrategy: 'same', prefix: 'app_', envFilePath: ['local.env'] })
    .setup((module) => {
        const assets = findParentPath('dist/', __dirname);
        if (assets) {
            module.addListener(serveStaticListener(module, '/', join(assets, 'app/browser')));
        }
    })
    .run();
