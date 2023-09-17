import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import { ControllerClient } from "@app/app/client";
import { bodyToString, Content, Page, parseBody } from "@app/common/models";
import { AppDescription, AppTitle } from "@app/app/components/title";
import { ContentRenderComponent } from "@app/app/components/content-render.component";
import { NgIf } from "@angular/common";

@Component({
    standalone: true,
    imports: [
        AppTitle,
        AppDescription,
        ContentRenderComponent,
        NgIf,
        RouterLinkActive,
        RouterLink
    ],
    styleUrls: ['./documentation.component.scss'],
    template: `
        <div class="page">
            <nav [class.showMenu]="showMenu">
                <div style="margin-bottom: 25px;">
                    <a routerLinkActive="active" routerLink="/documentation/introduction">Introduction</a>
                </div>

                <div class="category">
                    <div class="category-title">Framework</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/framework">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/modules">Modules</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/services">Services</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/events">Events</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/cli">CLI</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/configuration">Configuration</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/testing">Testing</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/deployment">Deployment</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/workflow">Workflow</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/logger">Logger</a>
                </div>

                <div class="category">
                    <div class="category-title">Runtime Types</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/runtime-types">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/types">Types</a>
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
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/providers">Providers</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/injection">Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/configuration">Configuration</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/scopes">Scopes</a>
                </div>

                <div class="category">
                    <div class="category-title">HTTP</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/http">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/controller">Controller</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/template">Template</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/events">Events</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/middleware">Middleware</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/security">Security</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/public-dir">Public directory</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/resolver">Resolver</a>
                </div>

                <div class="category">
                    <div class="category-title">RPC</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/rpc">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/rpc/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/rpc/controller">Controller</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/rpc/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/rpc/security">Security</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/rpc/errors">Errors</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/rpc/streaming">Streaming</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/rpc/transport">Transport</a>
                </div>

                <div class="category">
                    <div class="category-title">ORM</div>

                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/orm">Getting
                        started</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/entity">Entity</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/session">Session</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/query">Query</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/transactions">Transactions</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/inheritance">Inheritance</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/relations">Relations</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/events">Events</a>
                    <a routerLinkActive="active" routerLink="/documentation/orm/composite-primary-key">Composite primary key</a>
                    <div class="section-title">Plugins</div>
                    <section>
                        <a routerLinkActive="active" routerLink="/documentation/orm/plugin/soft-delete">Soft-Delete</a>
                    </section>
                </div>

                <!--                <div class="category">-->
                <!--                    <div class="category-title">RPC</div>-->

                <!--                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/rpc">Getting started</a>-->
                <!--                    <a routerLinkActive="active" routerLink="/documentation/rpc/server">Server</a>-->
                <!--                    <a routerLinkActive="active" routerLink="/documentation/rpc/controller">Controller</a>-->
                <!--                    <a routerLinkActive="active" routerLink="/documentation/rpc/client">Client</a>-->
                <!--                    <a routerLinkActive="active" routerLink="/documentation/rpc/query">Stream</a>-->
                <!--                    <a routerLinkActive="active" routerLink="/documentation/rpc/events">Security</a>-->
                <!--                </div>-->

                <div class="category">
                    <div class="category-title">Desktop UI</div>

                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/desktop-ui">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/button">Button</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/button-group">Button group</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/dropdown">Dropdown</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/icons">Icons</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/input">Input</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/slider">Slider</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/radiobox">Radiobox</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/selectbox">Selectbox</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/checkbox">Checkbox</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/list">List</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/table">Table</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/window">Window</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/window-menu">Window menu</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/window-toolbar">Window toolbar</a>
                    <a routerLinkActive="active" routerLink="/documentation/desktop-ui/dialog">Dialog</a>
                </div>
            </nav>
            <div class="content">
                <app-title *ngIf="project" value="{{project}}"></app-title>
                <div *ngIf="page">
                    <app-title value="{{page.title}}"></app-title>

                    <app-description [value]="page.title + ' - ' + bodyToString(subline)"></app-description>

                    <div *ngIf="project" class="project">{{project}}</div>
                    <h1>{{page.title}}</h1>

                    <app-render-content *ngIf="subline" [content]="subline"></app-render-content>
                    <app-render-content [content]="intro"></app-render-content>
                    <app-render-content [content]="rest"></app-render-content>
                </div>
            </div>
        </div>
    `
})
export class DocumentationComponent implements OnInit {
    showMenu: boolean = false;
    project = '';

    page?: Page;

    subline?: Content;
    intro: Content[] = [];
    rest: Content[] = [];

    projectMap: any = {
        'framework': 'Framework',
        'runtime-types': 'Runtime Types',
        'dependency-injection': 'Dependency Injection',
        'http': 'HTTP',
        'rpc': 'RPC',
        'orm': 'ORM',
        'desktop-ui': 'Desktop UI',
    }

    constructor(
        private activatedRoute: ActivatedRoute,
        private client: ControllerClient,
        private cd: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((params) => {
            this.load(params.path, params.project);
        });
    }

    async load(path: string, project: string = '') {
        this.project = this.projectMap[project] || project;
        path = path || 'index';
        if (project) path  = project + '/' + path;
        this.page = await this.client.main.getPage('documentation/' + path);
        if (!this.page) return;

        const parsed = parseBody(this.page.body);
        this.subline = parsed.subline;
        this.intro = parsed.intro;
        this.rest = parsed.rest;
        console.log(this.subline, this.intro, this.rest);
        // this.cd.detectChanges();
    }

    protected readonly bodyToString = bodyToString;
}
