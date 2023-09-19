import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AppTitle } from "@app/app/components/title";
import { HeaderComponent } from "@app/app/components/header.component";
import { FooterComponent } from "@app/app/components/footer.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, AppTitle, HeaderComponent, FooterComponent],
    template: `
        <app-title value="Deepkit High-Performance TypeScript Framework"></app-title>

        <dw-header [sticky]="activeRoute.firstChild?.snapshot?.data?.stickyHeader" [search]="activeRoute.firstChild?.snapshot?.data?.search"></dw-header>

        <router-outlet></router-outlet>

        <dw-footer></dw-footer>
    `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(public activeRoute: ActivatedRoute) {
    }
}
