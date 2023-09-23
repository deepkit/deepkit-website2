import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { bodyToString, Content, Page, parseBody, projectMap } from "@app/common/models";
import { AppDescription, AppTitle } from "@app/app/components/title";
import { AskComponent } from "@app/app/components/ask.component";
import { ContentRenderComponent } from "@app/app/components/content-render.component";
import { LoadingComponent } from "@app/app/components/loading";
import { NgForOf, NgIf, ViewportScroller } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ControllerClient } from "@app/app/client";

@Component({
    standalone: true,
    imports: [
        AppDescription,
        AppTitle,
        AskComponent,
        ContentRenderComponent,
        LoadingComponent,
        NgIf,
        NgForOf
    ],
    styleUrls: ['./page.component.scss'],
    template: `
        <div class="content">
            <app-loading *ngIf="loading"></app-loading>

            <app-title *ngIf="project" value="{{project}}"></app-title>
            <div class="error" *ngIf="error">
                {{error}}
            </div>
            <div *ngIf="page">
                <app-title value="{{page.title}}"></app-title>

                <app-description [value]="page.title + ' - ' + bodyToString(subline)"></app-description>

                <div *ngIf="project" class="app-pre-headline">{{project}}</div>
                <app-render-content [content]="page.body"></app-render-content>
            </div>

            <app-ask></app-ask>
        </div>

        <div class="table-of-content" *ngIf="headers.length > 1">
            <a [href]="router.url.split('#')[0] + '#' + h.link" class="intend-{{h.indent}}" *ngFor="let h of headers">
                {{h.label}}
            </a>
        </div>
    `
})
export class DocumentationPageComponent implements OnInit {
    protected readonly bodyToString = bodyToString;
    loading = false;
    error?: string;
    page?: Page;
    project = '';
    subline?: Content;

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

    ngOnInit() {
        this.activatedRoute.url.subscribe((url) => {
            console.log('url', url);
            if (url.length > 1) {
                this.load(url[1].path, url[0].path);
            } else if (url.length === 1) {
                this.load(url[0].path);
            } else {
                this.load('');
            }
        });
    }

    ngAfterViewInit() {
        this.loadTableOfContent();
    }

    onOutlet(event: any) {
        this.loadTableOfContent();
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
            if (!this.page) return;
            this.subline = parseBody(this.page.body).subline;

            this.loadTableOfContent();
        } catch (error) {
            console.log(error);
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

        for (const child of this.page.body.children || []) {
            if ('string' === typeof child) continue;
            if (!child.children) continue;
            const first = child.children[0];
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
