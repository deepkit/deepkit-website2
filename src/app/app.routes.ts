import { Routes } from '@angular/router';
import { StartpageComponent } from "@app/app/pages/startpage.component";
import { DocumentationComponent } from "@app/app/pages/documentation.component";
import { EmptyComponent } from "@app/app/pages/empty.component";

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: StartpageComponent },

    {
        path: 'documentation', component: DocumentationComponent, data: { stickyHeader: true, search: true, footer: false }, children: [
            { path: '**', component: EmptyComponent },
        ]
    },
];
