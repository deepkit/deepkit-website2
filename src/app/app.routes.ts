import { Routes } from '@angular/router';
import { StartpageComponent } from "@app/app/pages/startpage.component";
import { DocumentationComponent } from "@app/app/pages/documentation.component";
import { EmptyComponent } from "@app/app/pages/empty.component";
import { CommunityQuestionsComponent } from "@app/app/pages/documentation/community-questions.component";
import { DocumentationPageComponent } from "@app/app/pages/documentation/page.component";
import { CommunityQuestionComponent } from "@app/app/pages/documentation/community-question.component";
import { LibrariesComponent } from "@app/app/pages/libraries/libraries.component";
import { EnterpriseComponent } from "@app/app/pages/enterprise.component";
import { LibraryComponent } from "@app/app/pages/libraries/library.component";
import { ExamplesComponent } from "@app/app/pages/documentation/examples.component";
import { ExampleComponent } from "@app/app/pages/documentation/example.component";
import { DocuSearchComponent } from "@app/app/pages/documentation/search.component";

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: StartpageComponent },
    { path: 'library', component: LibrariesComponent },
    { path: 'library/:id', component: LibraryComponent },
    { path: 'enterprise', component: EnterpriseComponent },

    {
        path: 'documentation', component: DocumentationComponent, data: { stickyHeader: true, search: true, footer: false }, children: [
            {
                path: 'questions', component: EmptyComponent, children: [
                    { path: 'post/:id', component: CommunityQuestionComponent },
                    { path: '**', component: CommunityQuestionsComponent },
                ]
            },
            { path: 'search', component: DocuSearchComponent },
            { path: 'examples', component: ExamplesComponent },
            { path: ':category/examples/:slug', component: ExampleComponent },
            { path: ':category/examples', component: ExamplesComponent },
            { path: '**', component: DocumentationPageComponent },
        ]
    },
];
