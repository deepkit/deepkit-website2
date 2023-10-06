import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ImageComponent } from "@app/app/components/image.component";
import { HighlightCodeComponent } from "@app/app/components/highlight-code.component";
import { AppImagesComponent } from "@app/app/components/images.component";

@Component({
    standalone: true,
    templateUrl: './startpage.component.html',
    imports: [
        RouterLink,
        AppImagesComponent,
        ImageComponent,
        HighlightCodeComponent,
    ],
    styleUrls: ['./startpage.component.scss']
})
export class StartpageComponent {
}
