import { Routes } from '@angular/router';
import { StartpageComponent } from "@app/app/pages/startpage.component";
import { DocumentationComponent } from "@app/app/pages/documentation.component";

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: StartpageComponent },
    { path: 'documentation', component: DocumentationComponent },
    { path: 'documentation/:path', component: DocumentationComponent },
    { path: 'documentation/:project/:path', component: DocumentationComponent },
];
