import { ChangeDetectorRef, Component } from "@angular/core";
import { NgForOf, NgIf } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IndexEntry } from "@app/common/models";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { Router } from "@angular/router";
import { ControllerClient } from "@app/app/client";


@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        ReactiveFormsModule,
        FormsModule
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
            background-color: rgba(0, 0, 0, 0.2);
            overflow: hidden;

            .wrapper {
                max-height: 100%;

                .box {
                    padding-top: 80px;
                    background-color: #0E1217;
                    box-shadow: 0 0 10px black;
                    max-width: 450px;
                }

                .box-container {
                    padding: 50px;
                    height: 550px;
                    max-height: calc(100% - 80px);
                }
            }
        }
    `],
    template: `
        <div class="search" [class.active]="searchVisible">
            <div class="field">
                <input (focus)="searchVisible = true" placeholder="Search the docs" [(ngModel)]="query" (ngModelChange)="find()"/>
                <img alt="search icon" src="/assets/images/icons-search.svg" style="width: 18px; height: 18px;"/>
            </div>
        </div>

        <div class="overlay" *ngIf="searchVisible">
            <div class="wrapper">
                <div class="box">
                    <div class="box-container scroll-small">
                        <div class="search-results" *ngIf="results">
                            <div *ngFor="let r of results">
                                <div>{{r.title}}</div>
                                <div>{{r.path.join('/')}}</div>
                                <div>{{r.content}}</div>
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

    searchVisible: boolean = false;
    modelChanged = new Subject<string>();

    constructor(
        private client: ControllerClient,
        private cd: ChangeDetectorRef,
        public router: Router,
    ) {
        this.modelChanged.pipe(debounceTime(500), distinctUntilChanged()).subscribe((query) => this._find(query));
    }

    find() {
        this.modelChanged.next(this.query);
    }

    async _find(query: string) {
        this.results = await this.client.main.search(query);
        console.log('this.results', this.results);
        this.cd.detectChanges();
    }
}
