import { Component } from "@angular/core";


@Component({
    standalone: true,
    template: `
        <div class="app-content-full">
            <div class="app-banner">
                <div class="wrapper">
                    <img class="deepkit" alt="deepkit logo" src="/assets/images/deepkit_white_text.svg"/>

                    <h1>ENTERPRISE</h1>
                    <h2>GERMAN ENGINEERING</h2>

                    <div>
                        <p>
                            Deepkit is a German software engineering company building high-fidelity and top-notch web applications with over 20 years experience, specialised in
                            machine learning, delivering scalable and innovative solutions.
                        </p>

                        <p>
                            We design and implement complex custom web applications for international and<br/>
                            local clients using our unique high-performance TypeScript tech stack.<br/>
                            If you have a project and need help, contact us or book us now.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class EnterpriseComponent {
}
