import { Component, OnInit } from "@angular/core";
import { NgForOf, NgIf } from "@angular/common";
import { ControllerClient } from "@app/app/client";
import { ActivatedRoute } from "@angular/router";
import { CommunityQuestion } from "@app/common/models";
import { AppTitle } from "@app/app/components/title";
import { ContentRenderComponent } from "@app/app/components/content-render.component";

@Component({
    standalone: true,
    imports: [
        NgIf,
        AppTitle,
        ContentRenderComponent,
        NgForOf,
    ],
    styles: [`
        .answer {
            padding: 25px 0;
            border-top: 1px solid #1E1E1E;
        }
    `],
    template: `
        <div class="content">
            <div class="app-pre-headline">Questions & Answers</div>
            <ng-container *ngIf="question">
                <app-title [title]="question.title"></app-title>

                <h1>{{question.title}}</h1>

                <app-render-content [content]="question.question"></app-render-content>

                <div class="answer" *ngFor="let m of question.messages">
                    <app-render-content [content]="m"></app-render-content>
                </div>
            </ng-container>
        </div>
    `
})
export class CommunityQuestionComponent implements OnInit {
    question?: CommunityQuestion;

    constructor(
        protected client: ControllerClient,
        protected activatedRoute: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.load(params.id);
        });
    }

    async load(id: string) {
        this.question = await this.client.main.getQuestion(Number(id));
    }
}
