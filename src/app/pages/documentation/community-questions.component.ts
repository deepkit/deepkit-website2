import { ActivatedRoute } from "@angular/router";
import { Component } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
    standalone: true,
    imports: [
        NgIf
    ],
    template: `
        <div class="content">
            <h1>Questions & Answers</h1>

            <p>

            </p>

            <div *ngIf="id">

            </div>
        </div>

    `
})
export class CommunityQuestionsComponent {
    id: string = '';

    constructor(
        protected activatedRoute: ActivatedRoute,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.firstChild?.params.subscribe(params => {
            this.load(params.id);
        });
    }

    load(id: string) {
        this.id = id;
        if (!this.id) return;
    }

}
