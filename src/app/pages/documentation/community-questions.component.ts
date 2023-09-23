import { ActivatedRoute, RouterLink } from "@angular/router";
import { Component, Input, OnInit } from "@angular/core";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { ControllerClient } from "@app/app/client";
import { CommunityQuestionListItem, projectMap } from "@app/common/models";
import { ContentRenderComponent } from "@app/app/components/content-render.component";

@Component({
    standalone: true,
    imports: [
        NgIf,
        NgForOf,
        ContentRenderComponent,
        RouterLink,
        DatePipe
    ],
    selector: 'render-questions',
    styles: [`
        .question {
            overflow: hidden;
            padding: 15px 25px;
            border-bottom: 1px solid #1E1E1E;

            display: flex;
            flex-direction: row;

            .title {
                display: flex;
                flex-direction: column;
                flex: 1;

                .votes {
                    color: #979797;
                    line-height: 16px;
                    font-size: 13px;
                }
            }

            .actions {
                margin-left: auto;
            }

            .actions .row {
                display: flex;
                flex-direction: row;

                > * {
                    margin-left: 15px;
                }
            }

            .button {
                font-size: 12px;
            }
        }
    `],
    template: `
        <div class="questions app-box">
            <div class="question" *ngFor="let question of questions">
                <div class="title">
                    <div class="votes">
                        {{question.votes}} up-votes
                    </div>
                    <a routerLink="/documentation/questions/post/{{question.id}}">{{question.title}}</a>
                </div>

                <div class="actions">
                    <div class="row">
                        <div class="app-tag">{{projectMap[question.category] || 'General'}}</div>
                        <a class="button" [routerLink]="question.discordUrl">Discord</a>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class RenderQuestions {
    projectMap = projectMap;
    @Input() questions: CommunityQuestionListItem[] = [];
}

@Component({
    standalone: true,
    imports: [
        NgIf,
        NgForOf,
        ContentRenderComponent,
        RouterLink,
        DatePipe,
        RenderQuestions
    ],
    styleUrls: ['./community-questions.component.scss'],
    template: `
        <div class="content-full">
            <h1>Questions & Answers</h1>
            <p>
                All questions answered by our DeepBot Discord bot and in our chat bot on this documentation site are collected here.
            </p>

            <p class="app-note">
                How to ask a question: Join our discord and ping <code>@DeepBot</code>. Alternatively, open a documentation page and
                enter your question in the chat box on the bottom.
            </p>
            <p>
                <a class="button big" href="https://discord.gg/PtfVf7B8UU" target="_blank">Join our Discord</a>
            </p>

            <h2>Top Questions</h2>

            <render-questions [questions]="questions"></render-questions>

            <h2>New Questions</h2>

            <render-questions [questions]="questions"></render-questions>
        </div>

    `
})
export class CommunityQuestionsComponent implements OnInit {
    id: string = '';

    questions: CommunityQuestionListItem[] = [];

    constructor(
        protected activatedRoute: ActivatedRoute,
        protected client: ControllerClient,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.load(params.id);
        });
    }

    async load(id?: string) {
        console.log('load', id);
        // this.id = id;
        // if (!this.id) return;
        this.questions = await this.client.main.getQuestions();
        console.log('questions', this.questions);
    }
}
