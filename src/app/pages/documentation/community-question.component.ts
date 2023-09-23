import { Component, OnInit } from "@angular/core";
import { NgForOf, NgIf } from "@angular/common";
import { ControllerClient } from "@app/app/client";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CommunityQuestion, projectMap } from "@app/common/models";
import { AppTitle } from "@app/app/components/title";
import { ContentRenderComponent } from "@app/app/components/content-render.component";

@Component({
    standalone: true,
    imports: [
        NgIf,
        AppTitle,
        ContentRenderComponent,
        NgForOf,
        RouterLink,
    ],
    styles: [`
        .message {
            padding: 25px 0;
            border-top: 1px solid #1E1E1E;
            display: flex;
            flex-direction: row;
            .image {
                width: 70px;
                text-align: center;
                padding-top: 5px;

                img {
                    width: 40px;
                    border-radius: 100%;
                }
            }

            .content {
                flex: 1;
            }

            app-render-content > *:first-child {
                margin-top: 0;
                padding-top: 0;
            }

            .user {
                color: #2ecc71;
                font-weight: bold;
            }
        }

        .actions {
            display: flex;
            flex-direction: row;
            margin-bottom: 25px;

            > * {
                margin-right: 15px;
            }
        }
    `],
    template: `
        <div class="app-content">
            <div class="app-pre-headline">Questions & Answers</div>
            <ng-container *ngIf="question">
                <app-title [title]="question.title"></app-title>

                <h1>{{question.title}}</h1>

                <div class="actions">
                    <a class="button" [href]="question.answerDiscordUrl" target="_blank">Open in Discord</a>
                    <div class="app-tag">{{projectMap[question.category] || 'General'}}</div>
                    <div class="votes">
                        {{question.votes}} up-votes
                    </div>
                </div>

                <div class="app-note">
                    <strong>Warning</strong>: The answer is generated by an artificial intelligence. It might not be correct.<br/>
                    To adjust rating, open the thread in Discord and click on the up/down vote button.
                </div>

                <div class="message">
                    <div class="image">
                        <img [src]="question.userAvatar" class="avatar" alt="User Avatar"/>
                    </div>
                    <div class="content">
                        <div class="user">@{{question.user}}</div>
                        <app-render-content [content]="question.question"></app-render-content>
                    </div>
                </div>

                <div class="message" *ngFor="let m of question.messages">
                    <div class="image">
                        <img [src]="m.userAvatar" class="avatar" alt="User Avatar"/>
                    </div>
                    <div class="content">
                        <div class="user">@{{m.user}}</div>
                        <app-render-content [content]="m.content"></app-render-content>
                    </div>
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

    protected readonly projectMap = projectMap;
}
