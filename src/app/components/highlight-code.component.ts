import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { highlight, languages } from "prismjs";
import { ControllerClient } from "@app/app/client";
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

@Component({
    selector: 'highlight-code',
    standalone: true,
    template: `
        <pre class="code codeHighlight" [innerHTML]="html"></pre>
    `,
})
export class HighlightCodeComponent implements OnInit, OnChanges {
    @Input() code: string = '';
    @Input() file: string = '';
    @Input() lang: string = 'typescript';

    html: string = '';

    constructor(private client: ControllerClient) {
    }

    async ngOnInit() {
        await this.render();
    }

    async ngOnChanges() {
        await this.render();
    }

    async render() {
        this.code = this.code.trim();
        if (!this.code) {
            //load from file
            if (!this.file) return;
            this.code = await this.client.main.getAsset(this.file);
        }
        if (!this.code) return;

        let lang = this.lang || 'typescript';
        if (!languages[lang]) lang = 'text';
        this.html = highlight(this.code, languages[lang], lang);
    }
}
