import { Component, OnInit } from "@angular/core";
import { ControllerClient } from "@app/app/client";
import { ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import { bodyToString, UiCodeExample, Content, Page, parseBody, CommunityQuestion } from "@app/common/models";
import { AppDescription, AppTitle } from "@app/app/components/title";
import { ContentRenderComponent } from "@app/app/components/content-render.component";
import { NgForOf, NgIf } from "@angular/common";
import {LoadingComponent} from "@app/app/components/loading";

@Component({
    standalone: true,
    imports: [
        AppTitle,
        AppDescription,
        ContentRenderComponent,
        NgIf,
        RouterLink,
        RouterLinkActive,
        NgForOf,
        LoadingComponent
    ],
    styleUrls: ['./library.component.scss'],
    template: `
        <div class="app-content-full">
            <div class="wrapper">
                <app-loading *ngIf="!page"></app-loading>

                <div *ngIf="page">
                    <app-title value="{{page.title}}"></app-title>

                    <div class="head">
                        <h1>{{page.title}}</h1>

                        <nav>
                            <a routerLink="/{{page.url}}" class="active">Overview</a>
                            <a routerLink="/documentation/questions" [fragment]="page.params.category">FAQ</a>
                            <a routerLink="/documentation/{{page.params.category}}/examples">Examples</a>
                            <a routerLink="/documentation/{{page.params.doc}}">Documentation</a>
                            <a routerLink="https://api.framework.deepkit.io/modules/{{page.params.api}}.html">API</a>
                        </nav>
                    </div>

                    <app-description [value]="page.title + ' - ' + bodyToString(subline)"></app-description>

                    <div class="package">{{page.params.package}}</div>

                    <app-render-content [content]="page.body"></app-render-content>

                    <h2 id="faq" style="text-align: center">Questions & Answers</h2>

                    <div class="faqs">
                        <div class="faq" *ngFor="let faq of faqs; let i = index">
                            <div class="question">{{i + 1}}. {{faq.title}}</div>
                            <div class="answer">
                                <app-render-content [content]="faq.content"></app-render-content>
                            </div>
                        </div>

                        <div style="text-align: center">
                            <p>
                                No answer for your question? Ask a question or see all questions.
                            </p>
                            <a class="button big" style="margin-right: 25px;" routerLink="/documentation/questions/category/{{page.params.category}}">See all questions</a>
                            <a class="button big" routerLink="/documentation/questions/">Ask a question</a>
                        </div>
                    </div>

                    <h2 id="examples">Examples</h2>

                    <div class="app-examples">
                        <a class="app-example-item" routerLink="/documentation/{{example.category}}/examples/{{example.slug}}" *ngFor="let example of examples">
                            {{example.title}}
                        </a>
                    </div>

                    <div style="text-align: center; margin-top: 50px;">
                        <p>
                            <a class="button big" style="margin-right: 25px;" routerLink="/documentation/{{page.params.category}}/examples">See all examples</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class LibraryComponent implements OnInit {
    subline?: Content;
    page?: Page;
    faqs: CommunityQuestion[] = [];
    examples: UiCodeExample[] = [];

    constructor(
        private client: ControllerClient,
        private activatedRoute: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((params) => {
            this.load(params.id);
        });
    }

    async load(slug: string) {
        this.page = await this.client.main.getPage('library/' + slug);
        if (!this.page) return;
        this.subline = parseBody(this.page.body).subline;
        this.faqs = await this.client.main.getFAQ(this.page.params.category);
        this.examples = await this.client.main.getExamples(this.page.params.category, false, 24);
        console.log('page', this.page);
        console.log('faqs', this.faqs);
        console.log('examples', this.examples);
    }

    protected readonly bodyToString = bodyToString;
}
