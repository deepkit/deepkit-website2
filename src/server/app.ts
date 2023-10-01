import { App, findParentPath } from '@deepkit/app';
import { FrameworkModule, onServerMainBootstrap } from '@deepkit/framework';
import { AppConfig } from './config';
import { MainController } from '@app/server/controller/main.controller';
import { AngularListener } from '@app/server/angular';
import { serveStaticListener } from '@deepkit/http';
import { join } from 'path';
import { Algolia } from "@app/server/algolia";
import { OpenAI } from "openai";
import { fineTuneTest1, fineTuneTest1Check, fineTuneTest1Model, mlGenAnswerCommand, mlGenQuestionCommand } from "@app/server/commands/ml-fine-tuning";
import { WebController } from "@app/server/controller/web.controller";
import { PageProcessor } from "@app/server/page-processor";
import { Questions, testQuestions, testTestFunction } from "@app/server/questions";
import { registerBot } from "@app/server/commands/discord";
import { MainDatabase } from "@app/server/database";
import { Database } from "@deepkit/orm";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Url } from "@app/server/url";
import { MarkdownParser } from "@app/common/markdown";
import { sql } from "@deepkit/sql";

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
        Url,
        MarkdownParser,
        { provide: Database, useClass: MainDatabase },
        {
            provide: OpenAI, useFactory(openaiApiKey: AppConfig['openaiApiKey']) {
                return new OpenAI({ apiKey: openaiApiKey });
            }
        },
        {
            provide: Client, useFactory() {
                return new Client({
                    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
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
        new FrameworkModule({
            migrateOnStartup: true, //yolo
        })
    ]
})
    .command('search:index', (algolia: Algolia) => algolia.index())
    .command('search:find', (query: string, algolia: Algolia) => algolia.find(query))
    .command('ml:gen-questions', mlGenQuestionCommand)
    .command('ml:gen-answers', mlGenAnswerCommand)
    .command('ml:test', testTestFunction)
    .command('ml:q', testQuestions)
    .command('ml:fine-tune', fineTuneTest1)
    .command('ml:fine-tune:check', fineTuneTest1Check)
    .command('ml:fine-tune:model', fineTuneTest1Model)
    .command('migrate', async (database: Database) => {
        try {
            await database.raw(sql`CREATE EXTENSION vector`).execute();
            console.log("vector engine created");
        } catch (e) {
            console.log(`vector engined loaded already: ${e}`)
        }

        await database.migrate();
    })
    .listen(onServerMainBootstrap, registerBot)
    .listen(onServerMainBootstrap, (event, parser: MarkdownParser) => parser.load())
    .loadConfigFromEnv({ namingStrategy: 'same', prefix: 'app_', envFilePath: ['local.env'] })
    .setup((module) => {
        const assets = findParentPath('dist/', __dirname);
        if (assets) {
            module.addListener(serveStaticListener(module, '/', join(assets, 'app/browser')));
        }
    })
    .run();
