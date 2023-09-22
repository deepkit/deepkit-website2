import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ControllerClient } from "@app/app/client";
import { bodyToString, Content, IndexEntry, Page, parseBody, projectMap } from "@app/common/models";
import { AppDescription, AppTitle } from "@app/app/components/title";
import { ContentRenderComponent } from "@app/app/components/content-render.component";
import { NgForOf, NgIf, ViewportScroller } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { LoadingComponent } from "@app/app/components/loading";

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
        LoadingComponent
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
                    <a routerLinkActive="active" routerLink="/documentation/framework/configuration">Configuration</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/database">Database</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/testing">Testing</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/deployment">Deployment</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/logger">Logger</a>
                    <a routerLinkActive="active" routerLink="/documentation/framework/public-dir">Public directory</a>
                </div>

                <div class="category">
                    <div class="category-title">Runtime Types</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/runtime-types">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/runtime-types/getting-started">Getting started</a>
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
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/providers">Providers</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/injection">Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/configuration">Configuration</a>
                    <a routerLinkActive="active" routerLink="/documentation/dependency-injection/scopes">Scopes</a>
                </div>

                <div class="category">
                    <div class="category-title">CLI</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/cli">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/cli/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/cli/arguments">Arguments & Flags</a>
                    <a routerLinkActive="active" routerLink="/documentation/cli/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/cli/events">Events</a>
                </div>

                <div class="category">
                    <div class="category-title">HTTP</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/http">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/input-output">Input & Output</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/template">Template</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/events">Events</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/middleware">Middleware</a>
                    <a routerLinkActive="active" routerLink="/documentation/http/security">Security</a>
                </div>

                <div class="category">
                    <div class="category-title">RPC</div>
                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/rpc">Introduction</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/getting-started">Getting started</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/dependency-injection">Dependency Injection</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/security">Security</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/errors">Errors</a>
                    <a routerLinkActive="active" routerLink="/documentation/rpc/transport">Transport</a>
                </div>

                <div class="category">
                    <div class="category-title">Database ORM</div>

                    <a routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" routerLink="/documentation/database">Getting
                        started</a>
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
                        <a routerLinkActive="active" routerLink="/documentation/database/plugin/soft-delete">Soft-Delete</a>
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

                <app-loading *ngIf="loading"></app-loading>

                <app-title *ngIf="project" value="{{project}}"></app-title>
                <div class="error" *ngIf="error">
                    {{error}}
                </div>
                <div *ngIf="page">
                    <app-title value="{{page.title}}"></app-title>

                    <app-description [value]="page.title + ' - ' + bodyToString(subline)"></app-description>

                    <div *ngIf="project" class="project">{{project}}</div>
                    <app-render-content [linkRelativeTo]="currentPath" [content]="page.body"></app-render-content>
                </div>

                <div class="ask-question">
                    <div class="wrapper">
                        <div class="box">
                            <input placeholder="Ask a question">
                        </div>
                    </div>
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
    error?: string;
    loading = false;

    subline?: Content;
    currentPath: string = '/';

    public headers: { label: string, indent: number, link: string }[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private client: ControllerClient,
        private cd: ChangeDetectorRef,
        private viewportScroller: ViewportScroller,
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
            } else {
                this.load('');
            }
        });
    }

    async load(path: string, project: string = '') {
        this.project = projectMap[project] || project;
        path = path || 'index';
        if (project) path = project + '/' + path;
        this.error = undefined;
        this.loading = true;
        this.cd.detectChanges();
        this.headers = [];

        try {
            this.page = await this.client.main.getPage('documentation/' + path);
            this.currentPath = 'documentation/' + path;
            if (!this.page) return;

            const parsed = parseBody(this.page.body);
            this.subline = parsed.subline;
            // console.log(this.subline, this.intro, this.rest);
            this.loadTableOfContent();
        } catch (error) {
            this.page = undefined;
            this.error = String(error);
        } finally {
            this.loading = false;
        }
        this.cd.detectChanges();

        const fragment = this.activatedRoute.snapshot.fragment;
        if (fragment) {
            this.viewportScroller.scrollToAnchor(fragment);
        }
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
