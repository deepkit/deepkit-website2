import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ControllerClient } from "@app/app/client";
import { bodyToString, Content, IndexEntry, Page, parseBody, projectMap } from "@app/common/models";
import { AppDescription, AppTitle } from "@app/app/components/title";
import { ContentRenderComponent } from "@app/app/components/content-render.component";
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";

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
        FormsModule
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
                    <div class="category-title">CLI</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/cli">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/cli/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/cli/controller">Controller</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/cli/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/http/events">Events</a>
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

            <div class="table-of-content" *ngIf="headers.length > 1">
                <a [href]="router.url.split('#')[0] + '#' + h.link" class="intend-{{h.indent}}" *ngFor="let h of headers">
                    {{h.label}}
                </a>
            </div>
        </div>
    `
})
export class DocumentationComponent implements OnInit {
    bodyToString = bodyToString;
    showMenu: boolean = false;
    project = '';

    page?: Page;

    subline?: Content;
    intro: Content[] = [];
    rest: Content[] = [];

    public headers: { label: string, indent: number, link: string }[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private client: ControllerClient,
        private cd: ChangeDetectorRef,
        public router: Router,
    ) {
        console.log('new DocumentationComponent');
    }

    getFragment(value: string): string {
        if ('string' !== typeof value) return '';
        return value.trim().replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    }

    ngAfterViewInit() {
        this.loadTableOfContent();
    }

    onOutlet(event: any) {
        this.loadTableOfContent();
    }

    ngOnInit() {
        this.activatedRoute.firstChild!.url.subscribe((url) => {
            if (url.length > 1) {
                this.load(url[1].path, url[0].path);
            } else if (url.length === 1) {
                this.load(url[0].path);
            }
        });
    }

    async load(path: string, project: string = '') {
        this.project = projectMap[project] || project;
        path = path || 'index';
        if (project) path = project + '/' + path;
        try {
            this.page = await this.client.main.getPage('documentation/' + path);
            if (!this.page) return;

            const parsed = parseBody(this.page.body);
            this.subline = parsed.subline;
            this.intro = parsed.intro;
            this.rest = parsed.rest;
            // console.log(this.subline, this.intro, this.rest);
            this.loadTableOfContent();
        } catch (error) {
            this.page = undefined;
        }
        this.cd.detectChanges();
    }

    loadTableOfContent() {
        this.headers = [];
        if (!this.page) return [];

        console.log('this.page.body', this.page.body);
        for (const child of this.page.body.children || []) {
            if ('string' === typeof child) continue;
            if (!child.children) continue;
            const first = child.children[1];
            if ('string' !== typeof first) continue;
            if (!child.props) continue;

            if (child.tag === 'h2') {
                this.headers.push({ label: first, indent: 0, link: child.props.id });
            } else if (child.tag === 'h3') {
                this.headers.push({ label: first, indent: 1, link: child.props.id });
            }
        }
    }
}
