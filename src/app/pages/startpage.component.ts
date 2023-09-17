import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ImageSliderComponent } from "@app/app/components/image-slider.component";
import { ImageComponent } from "@app/app/components/image.component";
import { HighlightCodeComponent } from "@app/app/components/highlight-code.component";

@Component({
    standalone: true,
    templateUrl: './startpage.component.html',
    imports: [
        RouterLink,
        ImageSliderComponent,
        ImageComponent,
        HighlightCodeComponent,
    ],
    styleUrls: ['./startpage.component.scss']
})
export class StartpageComponent {
}
