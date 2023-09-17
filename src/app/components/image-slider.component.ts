import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { ImageComponent } from './image.component';
import { NgForOf, NgIf } from "@angular/common";

@Component({
    selector: 'image-slider',
    standalone: true,
    template: `
        <ng-container *ngIf="images">
            <div class="image" *ngIf="selected">
                <app-image [alt]="selected.alt" [src]="selected.src"></app-image>
            </div>

            <div class="actions">
                <span (click)="select(image)" [class.selected]="selected === image" *ngFor="let image of images.toArray()">
                    &bullet;
                </span>
            </div>
        </ng-container>
    `,
    imports: [
        NgIf,
        ImageComponent,
        NgForOf
    ],
    styles: [`
        :host {
            display: block;
        }

        .actions span {
            display: inline-block;
            padding: 5px;
            margin: 0 2px;
            font-size: 22px;
        }

        .actions span:hover {
            opacity: 0.4;
            cursor: pointer;
        }

        .actions span.selected {
            color: var(--color-orange);
        }
    `]
})
export class ImageSliderComponent implements AfterViewInit {
    @ContentChildren(ImageComponent) images?: QueryList<ImageComponent>;

    selected?: ImageComponent;

    constructor(protected cd: ChangeDetectorRef) {
    }

    ngAfterViewInit(): void {
        this.selected = this.images?.toArray()[0];
        this.cd.detectChanges();
    }

    select(image: ImageComponent) {
        this.selected = image;
        this.cd.detectChanges();
    }
}
