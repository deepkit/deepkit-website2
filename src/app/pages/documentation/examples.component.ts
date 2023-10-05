import { Component, OnInit } from "@angular/core";
import { AppDescription, AppTitle } from "@app/app/components/title";
import { NgIf } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ControllerClient } from "@app/app/client";
import { projectMap } from "@app/common/models";
import { LoadingComponent } from "@app/app/components/loading";


@Component({
    standalone: true,
    imports: [
        AppDescription,
        AppTitle,
        NgIf,
        LoadingComponent
    ],
    template: `
        <div class="app-content-full normalize-text">
            <app-loading *ngIf="loading"></app-loading>

            <app-title value="Examples for Deepkit {{project}}"></app-title>

            <app-description value="Examples for Deepkit {{project}}"></app-description>

            <div *ngIf="project" class="app-pre-headline">{{project}}</div>
            <h1>Examples</h1>
        </div>
    `
})
export class ExamplesComponent implements OnInit {
    project = '';
    loading = true;

    constructor(
        private activatedRoute: ActivatedRoute,
        private client: ControllerClient,
    ) {
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.load(params.id);
        });
    }

    async load(id: string) {
        this.project = projectMap[id] || id;
        this.loading = true;

        try {

        } finally {
            this.loading = false;
        }
    }
}
