import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-image',
    standalone: true,
    template: `
        <div class="image">
            <a target="_blank" href="{{src}}">
                <img alt="{{alt || altFromSrc}}" src="{{src}}"/>
            </a>
        </div>`,
    styles: [`
        :host {
            display: inline-block;
            max-width: 100%;
        }
    `]
})
export class ImageComponent {
    @Input() src!: string;
    @Input() alt?: string;

    get altFromSrc(): string {
        let name = this.src.substr(this.src.lastIndexOf('.'));
        name = name.substr(name.lastIndexOf('/'));
        return name;
    }
}
