import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { AskComponent } from "@app/app/components/ask.component";
import { FormsModule } from "@angular/forms";
import { ControllerClient } from "@app/app/client";
import { ActivatedRoute, Router } from "@angular/router";
import { CommunityQuestion, CommunityQuestionMessage, projectMap } from "@app/common/models";
import { TextFieldModule } from "@angular/cdk/text-field";
import { CommunityQuestionMessagesComponent } from "@app/app/components/community-question-messages.component";
import { NgIf } from "@angular/common";
import { ErrorComponent } from "@app/app/components/error.component";
import { AppTitle } from "@app/app/components/title";
import { LoadingComponent } from "@app/app/components/loading";

@Component({
    standalone: true,
    imports: [
        AskComponent,
        FormsModule,
        TextFieldModule,
        CommunityQuestionMessagesComponent,
        NgIf,
        ErrorComponent,
        AppTitle,
        LoadingComponent
    ],
    styles: [`
        .actions {
            display: flex;
            flex-direction: row;
            margin-bottom: 25px;

            > * {
                margin-right: 15px;
            }
        }

        textarea {
            width: 100%;
            padding: 10px 15px;
            font-size: 15px;
            line-height: 24px;
            height: 120px;
            min-width: 100%;
            max-width: 100%;
            margin-top: 30px;
        }

    `],
    template: `
        <div class="app-content-full">
            <div class="app-pre-headline">Questions & Answers</div>

            <app-loading *ngIf="loading"></app-loading>

            <ng-container *ngIf="ask">
                <app-title title="Ask a question"></app-title>
                <h1>Ask a question</h1>
            </ng-container>

            <ng-container *ngIf="question">
                <app-title [title]="question.title"></app-title>
                <h1>{{question.title}}</h1>
            </ng-container>

            <div class="actions" *ngIf="question">
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

            <app-community-question *ngIf="question" [question]="question"></app-community-question>

            <app-error [error]="error"></app-error>
            <textarea *ngIf="(question && question.allowEdit) || ask" (keyup)="onKeyUp($event)" placeholder="Send a message" [(ngModel)]="query"></textarea>
        </div>
    `
})
export class CommunityQuestionComponent implements OnInit {
    projectMap = projectMap;

    query = '';
    error?: any;
    loading = false;
    ask = false;

    question?: CommunityQuestion;

    constructor(
        protected client: ControllerClient,
        protected router: Router,
        protected cd: ChangeDetectorRef,
        protected activatedRoute: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params) => {
            this.ask = params.id === 'ask';
            if (params.id && !this.ask) {
                this.load(Number(params.id));
            }
        });
    }

    async load(id: number) {
        //todo, restore old message when reloading-
        console.log('load id', id);
        this.error = undefined;
        this.loading = true;
        this.cd.detectChanges();

        console.log('get question', id, this.getAuthId(id));

        try {
            this.question = await this.client.main.getQuestion(id, this.getAuthId(id));
        } catch (error: any) {
            this.error = error;
        } finally {
            this.loading = false;
            this.cd.detectChanges();
        }
    }

    getAuthId(messageId?: number): string {
        if (!messageId) return '';
        if ('undefined' === typeof localStorage) return '';
        return localStorage.getItem('deepkit/community-question-authId-' + messageId) || '';
    }

    onKeyUp(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            this.prompt();
        }

        // if (this.autosize) {
        //     this.autosize.resizeToFitContent(true);
        // }
    }

    async prompt() {
        if (!this.query) return;
        if (this.loading) return;

        this.loading = true;
        const text = this.query;
        this.query = '';
        this.error = undefined;
        this.cd.detectChanges();

        try {
            const question = await this.client.main.createQuestion(text, this.question?.id, this.getAuthId(this.question?.id));

            console.log('created question', !!this.question, question);

            if (!this.question && question.authId) {
                //store the authId so that we can restore the question when reloading the page
                localStorage.setItem('deepkit/community-question-authId-' + question.id, question.authId);
            }

            if (this.question) {
                this.question.messages.push(question);
            } else {
                this.question = question;
                // redirect to current URL but with new query param, so reload works
                await this.router.navigate(['/documentation/questions/post/' + this.question.id], { replaceUrl: true });
            }

            const response = await this.client.main.createAnswer(question.id);

            let messageToWrite: CommunityQuestionMessage | undefined = undefined;

            response.subscribe((next) => {
                if (!this.question) return;

                console.log('next', next);

                if (next.message) {
                    //if edit message, we have the message already
                    const existing = this.question.messages.find(v => v.id === next.message?.id);
                    if (existing) {
                        messageToWrite = existing;
                        messageToWrite.content.children = [];
                    } else {
                        this.question.messages.push(next.message);
                        messageToWrite = next.message;
                    }
                }

                if (!messageToWrite) return;
                messageToWrite.content.children = messageToWrite.content.children || [];

                //remove the last next.remove items
                if (next.remove) messageToWrite.content.children = messageToWrite.content.children.slice(0, -next.remove);
                messageToWrite.content.children = messageToWrite.content.children.concat(next.next);

                //important to trigger Angular change detection
                messageToWrite.content = { ...messageToWrite.content };

                this.loading = false;
                this.cd.detectChanges();
            });
        } catch (error: any) {
            this.error = error;
        } finally {
            this.loading = false;
            this.cd.detectChanges();
        }
    }
}
