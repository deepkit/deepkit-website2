import { Component } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AppDescription, AppTitle } from "@app/app/components/title";
import { ContentRenderComponent } from "@app/app/components/content-render.component";
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LoadingComponent } from "@app/app/components/loading";
import { AskComponent } from "@app/app/components/ask.component";

@Component({
    standalone: true,
    imports: [
        AppTitle,
        AppDescription,
        ContentRenderComponent,
        NgIf,
        RouterLinkActive,
        RouterLink,
        NgForOf,
        FormsModule,
        LoadingComponent,
        AskComponent,
        RouterOutlet
    ],
    styleUrls: ['./documentation.component.scss'],
    template: `
        <div class="page">
            <nav [class.showMenu]="showMenu">
                <div style="margin-bottom: 25px;">
                    <a routerLinkActive="active" routerLink="/documentation/introduction">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/questions">Questions & Answers</a>
                    <a routerLinkActive="active" routerLink="/documentation/examples">Examples</a>
                    <a href="https://discord.com/invite/PtfVf7B8UU" target="_blank">Join Discord</a>
                    <a routerLinkActive="active" routerLink="/documentation/learn-typescript">Learn TypeScript</a>
                </div>

                <div class="category">
                    <div class="category-title">App</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/app">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/examples">Examples</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/arguments">Arguments & Flags</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/modules">Modules</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/services">Services</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/events">Events</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/logger">Logger</a>
                    <a routerLinkActive="active" routerLink="/documentation/app/configuration">Configuration</a>
                </div>

                <div class="category">
                    <div class="category-title">Framework</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/framework">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/examples">Examples</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/database">Database</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/testing">Testing</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/deployment">Deployment</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/public">Public Assets</a>
                </div>

                <div class="category">
                    <div class="category-title">Runtime Types</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/runtime-types">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/examples">Examples</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/types">Type Annotations</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/reflection">Reflection</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/serialization">Serialization</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/validation">Validation</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/custom-serializer">Custom serializer</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/external-types">External Types</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/bytecode">Bytecode</a>
                </div>

                <div class="category">
                    <div class="category-title">Dependency Injection</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/dependency-injection">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/examples">Examples</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/providers">Providers</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/injection">Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/configuration">Configuration</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/scopes">Scopes</a>
                </div>

                <div class="category">
                    <div class="category-title">HTTP</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/http">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/examples">Examples</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/input-output">Input & Output</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/views">Views</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/events">Events</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/middleware">Middleware</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/security">Security</a>
                </div>

                <div class="category">
                    <div class="category-title">RPC</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/rpc">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/examples">Examples</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/security">Security</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/errors">Errors</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/transport">Transport</a>
                </div>

                <div class="category">
                    <div class="category-title">Database ORM</div>

                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/database">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/examples">Examples</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/entity">Entity</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/session">Session</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/query">Query</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/transaction">Transaction</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/inheritance">Inheritance</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/relations">Relations</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/events">Events</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/migrations">Migrations</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/orm-browser">ORM Browser</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/raw-access">Raw Access</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/seeding">Seeding</a>
                    <a routerLinkActive="active" routerLink="/documentation/database/composite-primary-key">Composite primary key</a>
                    <div class="section-title">Plugins</div>
                    <section>
                        <a routerLinkActive="active" routerLink="/documentation/database/plugin-soft-delete">Soft-Delete</a>
                    </section>
                </div>

<!--                <div class="category">-->
<!--                    <div class="category-title">Desktop UI</div>-->

<!--                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/desktop-ui">Getting started</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/button">Button</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/button-group">Button group</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/dropdown">Dropdown</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/icons">Icons</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/input">Input</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/slider">Slider</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/radiobox">Radiobox</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/selectbox">Selectbox</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/checkbox">Checkbox</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/list">List</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/table">Table</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/window">Window</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/window-menu">Window menu</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/window-toolbar">Window toolbar</a>-->
<!--                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/dialog">Dialog</a>-->
<!--                </div>-->
            </nav>

            <div style="margin-left: 225px; padding-top: 35px;">
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class DocumentationComponent {
    showMenu: boolean = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        public router: Router,
    ) {
        console.log('new DocumentationComponent');
    }
}
