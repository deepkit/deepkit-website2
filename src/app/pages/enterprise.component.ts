import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";


@Component({
    standalone: true,
    styles: [`
        .offering {
            text-align: center;
            padding: 150px 0;

            .wrapper {
                max-width: 870px;
            }

            .app-boxes {
                margin: 35px auto;
                grid-auto-flow: column;
                grid-template-columns: unset;
                justify-content: center;
            }

            &.bg {
                border: 1px solid #262626;
                background: #15191C;
            }
        }

        .app-box {
            position: relative;
            text-align: left;

            width: 260px;

            h2 {
                font-size: 18px;
                margin: 2px 0;
                color: white;
            }

            .price {
                color: #B4B4B4;
                font-size: 18px;
            }

            ul {
                margin-top: 15px;
                font-size: 13px;
                list-style: none;
                padding: 0;

                li {
                    padding: 0;
                }
            }

            .footer {
                font-size: 13px;
                color: var(--color-grey);
            }
        }

        h3.text {
            margin-bottom: 25px;
        }

        .how {
            margin-top: 50px;
            text-align: left;

            h3 {
                font-weight: bold;
                font-size: 18px;
                margin: 15px 0;
            }
        }

    `],
    imports: [
        RouterLink
    ],
    template: `
        <div class="app-content-full">
            <div class="app-banner">
                <div class="wrapper">
                    <img class="deepkit" alt="deepkit logo" src="/assets/images/deepkit_white_text.svg"/>

                    <h1>ENTERPRISE</h1>
                    <h2>GERMAN ENGINEERING</h2>

                    <div>
                        <p>
                            Deepkit is a German software engineering company building high-fidelity and top-notch web
                            applications with over 20 years experience, specialised in
                            machine learning, delivering scalable and innovative solutions.
                        </p>

                        <p>
                            We design and implement complex custom web applications for international and<br/>
                            local clients using our unique high-performance TypeScript tech stack.<br/>
                            If you have a project and need help, contact us or book us now.
                        </p>

                        <div style="margin-top: 50px;">
                            <a href="mailto:info@deepkit.io" class="button big">Contact us</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="offering">
                <div class="wrapper">

                    <h2>Support</h2>

                    <h3 class="text">
                        Need help with your project?<br/>
                        TypeScript, Deepkit, Angular, C++, Python, Machine Learning &hyphen; We got you covered.
                    </h3>

                    <h3 class="text">
                        No matter if you need a jumpstart, a code review, pair programming session,<br/>
                        architecture consulting, or just a helping hand.
                    </h3>

                    <div class="app-boxes">
                        <div class="app-box">
                            <h2>Startup Boost</h2>
                            <div class="price">Free</div>
                            <ul>
                                <li>Unlimited requests</li>
                                <li>Training</li>
                                <li>Architecture</li>
                                <li>Design Patterns</li>
                                <li>Code examples</li>
                                <li>Managed via Discord</li>
                                <li>Deepkit</li>
                            </ul>
                            <p class="footer">
                                For Startups using Deepkit<br/>
                                for the first time.
                            </p>
                            <div class="actions">
                                <a target="_blank" href="https://discord.com/invite/PtfVf7B8UU" class="button big">Join Discord</a>
                            </div>
                        </div>
                        <div class="app-box">
                            <h2>Unlimited Support</h2>
                            <div class="price">Monthly $6,999</div>
                            <ul>
                                <li>Unlimited requests</li>
                                <li>Answer within 12h</li>
                                <li>Pair programming</li>
                                <li>Code examples</li>
                                <li>Managed via Discord</li>
                                <li>Design Patterns</li>
                                <li>Invite your team</li>
                                <li>Deepkit, TypeScript, HTML</li>
                            </ul>
                            <p class="footer">
                                Cancel anytime
                            </p>
                            <div class="actions">
                                <a routerLink="/contact" class="button big">Buy now</a>
                            </div>
                        </div>
                        <div class="app-box">
                            <h2>Teaching</h2>
                            <div class="price">$2,300/day</div>
                            <ul>
                                <li>On-site or remote</li>
                                <li>Deepkit, TypeScript, HTML</li>
                                <li>Design Patterns</li>
                                <li>Architecture</li>
                                <li>Performance</li>
                                <li>Testing</li>
                                <li>Machine Learning</li>
                                <li>Database design</li>
                            </ul>
                            <p class="footer">
                                2-7 days
                            </p>
                            <div class="actions">
                                <a routerLink="/contact" class="button big">Buy now</a>
                            </div>
                        </div>
                    </div>


                    <div class="how">
                        <h3 class="text">
                            How does it work?
                        </h3>

                        <p>
                            You book us and we help you. We use Discord for communication and screen sharing.
                        </p>

                        <p>
                            <strong>Unlimited Support:</strong> Limited to 1 project. Cancel anytime. When you cancel,
                            no money refund. If we cancel, we refund the remaining time.
                            You can invite your team to the Discord channel. Does not include writing code for you,
                            except for code examples. Free bug fix for any bug in Deepkit.
                            See <a routerLink="/terms">Terms of Service</a> for details.
                        </p>
                    </div>
                </div>
            </div>

            <div class="offering bg">
                <div class="wrapper">
                    <h2>Custom Prototypes</h2>

                    <h3 class="text">
                        We put money where our mouth is. We build your prototype in 1-3 weeks.
                    </h3>

                    <h3 class="text">
                        No sales, no project manager, no scrum, no bullshit. Just results.
                    </h3>

                    <div class="app-boxes">
                        <div class="app-box">
                            <h2>Prototype</h2>
                            <div class="price">One-time $18,995</div>
                            <ul>
                                <li>No hidden fees or ongoing costs</li>
                                <li>Test your hypothesis</li>
                                <li>Bootstrap your project</li>
                                <li>Based on your design</li>
                                <li>Low test coverage</li>
                                <li>Essential documentation</li>
                                <li>Modern enterprise patterns</li>
                                <li>TypeScript, HTML, CSS, C++, Python</li>
                            </ul>

                            <p class="footer">
                                1-2 weeks turnaround
                            </p>
                            <div class="actions">
                                <a routerLink="/contact" class="button big">Buy now</a>
                            </div>
                        </div>
                        <div class="app-box">
                            <h2>Prototype+</h2>
                            <div class="price">One-time $28,995</div>
                            <ul>
                                <li>No hidden fees or ongoing costs</li>
                                <li>Test your hypothesis</li>
                                <li>Bootstrap your project</li>
                                <li>Based on your design</li>
                                <li>High test coverage</li>
                                <li>Extensive documentation</li>
                                <li>Modern enterprise patterns</li>
                                <li>TypeScript, HTML, CSS, C++, Python</li>
                            </ul>

                            <p class="footer">
                                3 weeks turnaround
                            </p>
                            <div class="actions">
                                <a routerLink="/contact" class="button big">Buy now</a>
                            </div>
                        </div>
                        <div class="app-box">
                            <h2>Machine Learning</h2>
                            <div class="price">One-time $39,995</div>
                            <ul>
                                <li>No hidden fees or ongoing costs</li>
                                <li>Test your hypothesis</li>
                                <li>Custom architecture/models</li>
                                <li>Data cleaning</li>
                                <li>Data augmentation & gen</li>
                                <li>Python or C++</li>
                                <li>Based on Pytorch/Libtorch</li>
                                <li>Including server/GUI</li>
                                <li>Training costs excluded</li>
                            </ul>

                            <p class="footer">
                                2-3 weeks turnaround
                            </p>
                            <div class="actions">
                                <a routerLink="/contact" class="button big">Buy now</a>
                            </div>
                        </div>
                    </div>

                    <div class="how">
                        <h3 class="text">
                            How does it work?
                        </h3>

                        <p>
                            We use Angular, TypeScript, and Deepkit Framework to build your prototype.
                        </p>
                    </div>
                </div>
            </div>

            <div class="references offering">
                <h2>References</h2>

                <h3 class="text">
                    We build application for startups and enterprises since over 20 years. Here are some of highlights.
                </h3>

                <h3 class="text">
                    Our open-source projects have over 1 million downloads each month.
                </h3>

                <div>
                    // TODO
                    // Auto CMS
                    // AdFlow
                    // TypeRunner
                    // Finnwerk (CMS / Sauna shop)
                    // Deepkit Framework
                    // Deepkit ML
                    // AETROS
                    // JARVES
                </div>
            </div>
        </div>
    `
})
export class EnterpriseComponent {
}
