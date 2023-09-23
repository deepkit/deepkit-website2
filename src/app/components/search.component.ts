import { ChangeDetectorRef, Component } from "@angular/core";
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IndexEntry, Page } from "@app/common/models";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { Router, RouterLink } from "@angular/router";
import { ControllerClient } from "@app/app/client";
import { LoadingComponent } from "@app/app/components/loading";


@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        ReactiveFormsModule,
        FormsModule,
        LoadingComponent,
        RouterLink
    ],
    styles: [`
        .field {
            position: relative;
            //display: flex;
            flex-direction: row;
            height: 28px;
            justify-content: center;
            align-items: center;
            margin: auto;
            width: 150px;
            z-index: 2001;
            max-width: 100%;
            transition: width 0.2s ease-in-out;

            input {
                width: 100%;
            }

            img {
                position: absolute;
                right: 4px;
                top: 5px;
            }
        }

        .search.active {
            .field {
                width: 350px;
            }
        }

        .overlay {
            position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0;
            z-index: 2000;
            background-color: rgba(0, 0, 0, 0.6);
            overflow: hidden;

            .wrapper {
                max-height: 100%;

                .box {
                    padding-top: 80px;
                    background-color: #0E1217;
                    box-shadow: 0 0 10px black;
                    max-width: 650px;
                }

                .box-container {
                    position: relative;
                    padding: 10px 35px;
                    max-height: calc(100vh - 100px);
                }
            }
        }

        .result-item {
            text-align: left;
            border-bottom: 1px solid #282828;
            padding: 15px 10px;

            &:hover {
                background-color: rgba(26, 26, 26, 0.87);
                cursor: pointer;
            }

            .path {
                color: #a2a2a2;
                font-size: 12px;
            }

            .title {
                margin: 5px 0;
                color: white;
            }

            .content {
                font-size: 14px;
            }
        }
    `],
    template: `
        <div class="search" [class.active]="visible">
            <div class="field">
                <input (focus)="visible = true" (keyup)="onKeyUp($event)" (click)="visible=true"
                       placeholder="Search the docs" [(ngModel)]="query" (ngModelChange)="find()"/>
                <img alt="search icon" src="/assets/images/icons-search.svg" style="width: 18px; height: 18px;"/>
            </div>
        </div>

        <div class="overlay" *ngIf="visible" (click)="onOverlayClick($event)">
            <app-loading *ngIf="loading"></app-loading>
            <div class="wrapper">
                <div class="box">
                    <div class="box-container scroll-small">
                        <div class="search-results" *ngIf="results">
                            <div [routerLink]="r.url" (click)="visible=false" class="result-item" *ngFor="let r of results">
                                <div class="path">{{r.path.join(' / ')}}</div>
                                <h3 class="title">{{r.title}}</h3>
                                <div class="content">{{r.content}}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SearchComponent {
    query: string = '';
    results?: IndexEntry[];
    loading = false;

    visible: boolean = false;
    modelChanged = new Subject<string>();

    constructor(
        private client: ControllerClient,
        private cd: ChangeDetectorRef,
        public router: Router,
    ) {
        this.modelChanged.pipe(debounceTime(500), distinctUntilChanged()).subscribe((query) => this._find(query));
    }

    onKeyUp(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            this.visible = false;
        } else {
            this.visible = true;
        }
    }

    onOverlayClick(e: MouseEvent) {
        //check if clicked inside .box-container, if so ignore
        if ((e.target as HTMLElement).closest('.box')) {
            return;
        }
        this.visible = false;
    }

    find() {
        this.modelChanged.next(this.query);
    }

    async _find(query: string) {
        this.loading = true;
        this.cd.detectChanges();
        try {
            this.results = await this.client.main.search(query);
            console.log('this.results', this.results);
        } finally {
            this.loading = false;
            this.cd.detectChanges();
        }
    }
}
