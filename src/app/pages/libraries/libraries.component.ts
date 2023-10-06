import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";



@Component({
    standalone: true,
    styles: [`
        .app-boxes {
            margin-top: 50px;
            grid-gap: 50px;
        }

        .libraries, .app-banner .wrapper {
            max-width: 880px;
        }

        .libraries {
            max-width: 950px;
        }

        .library, .library:link {
            text-align: left;
            display: block;

            color: white;

            &:hover {
                text-decoration: none;
            }

            h3 {
                margin: 0;
                padding: 0;
                font-size: 18px;
                font-style: normal;
                font-weight: 700;
                line-height: normal;
            }

            .subline {
                color: #979797;
                font-size: 14px;
                margin-bottom: 10px;
            }

            p {
                margin: 0;
                padding: 0;
                font-size: 14px;
                line-height: 180%;
            }
        }

    `],
    imports: [
        RouterLink
    ],
    template: `
        <div class="app-content-full">
            <div class="app-banner left">
                <div class="wrapper">
                    <h1>LIBRARIES</h1>

                    <div>
                        <p>
                            A collection of open source TypeScript libraries under MIT license that work standalone or in combination. Each library lives in its own NPM package, is
                            carefully optimised, and follows modern best practises.
                        </p>

                        <p>
                            Progressively adopt Deepkit libraries one by one or use all together in Deepkit Framework.
                        </p>
                    </div>
                </div>
            </div>
            <div class="wrapper libraries">
                <div class="app-boxes">
                    <a routerLink="/library/type" class="app-box hover library">
                        <h3>Runtime Types</h3>
                        <div class="subline">@deepkit/type</div>
                        <p>
                            Runtime TypeScript types with reflection, high-performance serialization and validation, and much more.
                        </p>
                    </a>
                    <a routerLink="/library/app" class="app-box hover library">
                        <h3>Deepkit App</h3>
                        <div class="subline">@deepkit/app</div>
                        <p>
                            A command line interface (CLI) framework for TypeScript with service container, module system,
                            hooks, and easy to define commands.
                        </p>
                    </a>
                    <a routerLink="/library/framework" class="app-box hover library">
                        <h3>Deepkit Framework</h3>
                        <div class="subline">@deepkit/framework</div>
                        <p>
                            A framework that brings together all Deepkit libraries with application server,
                            debugging and profiler tools, and much more.
                        </p>
                    </a>
                    <a routerLink="/library/orm" class="app-box hover library">
                        <h3>Deepkit ORM</h3>
                        <div class="subline">@deepkit/orm</div>
                        <p>
                            High performance TypeScript ORM with Unit Of Work, migrations, and much more.
                            MySQL, PostgreSQL, SQLite, MongoDB.
                        </p>
                    </a>
                    <a routerLink="/library/rpc" class="app-box hover library">
                        <h3>Deepkit RPC</h3>
                        <div class="subline">@deepkit/rpc</div>
                        <p>
                            A end-to-end typesafe and modern high performance Remote Procedure Call (RPC) framework for TypeScript.
                        </p>
                    </a>
                    <a routerLink="/library/http" class="app-box hover library">
                        <h3>Deepkit HTTP</h3>
                        <div class="subline">@deepkit/http</div>
                        <p>
                            A HTTP kernel and router with async controller support based on workflow system and decorators.
                        </p>
                    </a>
                    <a routerLink="/library/injector" class="app-box hover library">
                        <h3>Dependency Injection</h3>
                        <div class="subline">@deepkit/injector</div>
                        <p>
                            The most advanced dependency injection container for TypeScript.
                        </p>
                    </a>
                    <a routerLink="/documentation/http/views" class="app-box hover library">
                        <h3>Template</h3>
                        <div class="subline">@deepkit/template</div>
                        <p>
                            Fully typesafe and fast template engine based on TSX, with support for dependency injection and async templates.
                        </p>
                    </a>
                    <a routerLink="/library/broker" class="app-box hover library">
                        <h3>Broker</h3>
                        <div class="subline">@deepkit/broker</div>
                        <p>
                            Typesafe message bus server for pub/sub pattern, key-value storage, and central atomic app locks.
                        </p>
                    </a>
                    <a routerLink="/documentation/app/logger" class="app-box hover library">
                        <h3>Logger</h3>
                        <div class="subline">@deepkit/logger</div>
                        <p>
                            Logger library with support for colors, scopes, various transporter and formatter.
                        </p>
                    </a>
                    <a routerLink="/documentation/app/events" class="app-box hover library">
                        <h3>Event</h3>
                        <div class="subline">@deepkit/event</div>
                        <p>
                            Async typesafe event dispatcher.
                        </p>
                    </a>



                    <a routerLink="/library/orm-browser" class="app-box hover library">
                        <h3>ORM Browser</h3>
                        <div class="subline">@deepkit/orm-browser</div>
                        <p>
                            Seed, migrate, or display the ER diagram of your database. With interactive query prompt.
                        </p>
                    </a>
                    <a routerLink="/library/api-console" class="app-box hover library">
                        <h3>Deepkit API Console</h3>
                        <div class="subline">@deepkit/api-console</div>
                        <p>
                            Interactive API documentation for Deepkit Framework applications.
                        </p>
                    </a>
                    <a routerLink="/library/desktop-ui" class="app-box hover library">
                        <h3>UI Library</h3>
                        <div class="subline">@deepkit/desktop-ui</div>
                        <p>
                            Angular Desktop GUI library for desktop/web user interfaces, with Electron features.
                        </p>
                    </a>
                </div>
            </div>

            <div class="wrapper products">
                <h2>Products</h2>

            </div>
        </div>
    `
})
export class LibrariesComponent {
}
