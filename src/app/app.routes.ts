import { Routes } from '@angular/router';
import { StartpageComponent } from "@app/app/pages/startpage.component";
import { DocumentationComponent } from "@app/app/pages/documentation.component";
import { EmptyComponent } from "@app/app/pages/empty.component";
import { CommunityQuestionsComponent } from "@app/app/pages/documentation/community-questions.component";
import { DocumentationPageComponent } from "@app/app/pages/documentation/page.component";

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: StartpageComponent },

    {
        path: 'documentation', component: DocumentationComponent, data: { stickyHeader: true, search: true, footer: false }, children: [
            {
                path: 'questions', component: CommunityQuestionsComponent, children: [
                    { path: '**', component: EmptyComponent },
                ]
            },
            { path: '**', component: DocumentationPageComponent },
        ]
    },
];
