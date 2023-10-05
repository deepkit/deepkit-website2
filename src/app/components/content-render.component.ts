import { ApplicationRef, Component, createComponent, EnvironmentInjector, Input, OnChanges, OnInit, reflectComponentType, Renderer2, ViewContainerRef } from '@angular/core';
import { Content } from '@app/common/models';
import { NgForOf, NgIf } from '@angular/common';
import { ScreenComponent, ScreensComponent } from '@app/app/components/screens.component';
import { HighlightCodeComponent } from "@app/app/components/highlight-code.component";
import { Router } from "@angular/router";

const whitelist = ['div', 'p', 'a', 'button', 'pre', 'span', 'code', 'strong', 'hr', 'ul', 'li', 'ol', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'table', 'tbody', 'tr', 'td', 'th', 'boxes', 'box'];


@Component({
    standalone: true,
    selector: 'box',
    host: {
        '[class.app-box]': 'true',
    },
    template: `
        <div class="title">{{title}}</div>
        <ng-content></ng-content>
    `
})
export class ContentRenderBox {
    @Input() title: string = '';
}


@Component({
    standalone: true,
    selector: 'feature',
    host: {
        '[class.app-feature]': 'true',
    },
    styles: [`
        :host {
            display: flex;
            align-items: center;
            margin: 200px 0;
        }

        :host.right {
            flex-direction: row-reverse;

            .text {
                margin: auto;
                margin-left: 55px;
            }
        }

        .text {
            flex: 1;
            margin-right: 55px;
            max-width: 480px;
        }

        .code {
            flex: 1;
        }

    `],
    template: `
        <div class="text">
            <ng-content></ng-content>
        </div>
        <div class="code">
            <ng-content select="highlight-code"></ng-content>
        </div>
    `
})
export class ContentRenderFeature {
}

@Component({
    selector: 'app-render-content',
    standalone: true,
    imports: [NgForOf, NgIf, ScreensComponent, ScreenComponent, HighlightCodeComponent, ContentRenderBox, ContentRenderFeature],
    styles: [`
        :host {
            display: inline;
        }
    `],
    template: ``,
})
export class ContentRenderComponent implements OnInit, OnChanges {
    @Input() content!: (Content | string)[] | Content | string;
    @Input() linkRelativeTo: string = '/';

    constructor(
        private viewRef: ViewContainerRef,
        private renderer: Renderer2,
        private router: Router,
        private injector: EnvironmentInjector,
        private app: ApplicationRef
    ) {
    }

    ngOnChanges() {
        this.render();
    }

    ngOnInit() {
        // console.log('ContentRenderComponent onInit');
        // this.render();
    }

    render() {
        const childNodes = this.viewRef.element.nativeElement.childNodes;
        for (let i = childNodes.length; i > 0; i--) {
            this.renderer.removeChild(this.viewRef.element.nativeElement, childNodes[i - 1]);
        }

        const children = this.renderContent(this.injector, this.content);
        for (const child of children) this.renderer.appendChild(this.viewRef.element.nativeElement, child);
    }

    renderContent(injector: EnvironmentInjector, content: (Content | string)[] | Content | string): Node[] {
        const components: { [name: string]: any } = {
            'app-screens': ScreensComponent,
            'app-screen': ScreenComponent,
            'highlight-code': HighlightCodeComponent,
            'box': ContentRenderBox,
            'feature': ContentRenderFeature,
        };

        if ('string' === typeof content) {
            const element = this.renderer.createText(content);
            return [element];
        } else if (Array.isArray(content)) {
            const children: Node[] = [];
            for (const child of content) {
                children.push(...this.renderContent(injector, child));
            }
            return children;
        } else if (components[content.tag]) {
            // const container = this.renderer.createElement('div');
            const children: Node[] = content.children ? this.renderContent(this.injector, content.children) : [];

            const type = reflectComponentType(components[content.tag]);
            if (!type) return [];

            const projectableNodes: Node[][] = [];
            for (const ngContent of type.ngContentSelectors) {
                const nodes: Node[] = [];
                for (const child of children) {
                    if (child instanceof Text && ngContent === '*') {
                        nodes.push(child);
                    } else if (child instanceof HTMLElement && child.matches(ngContent)) {
                        nodes.push(child);
                    }
                }
                projectableNodes.push(nodes);
            }
            const component = createComponent(components[content.tag], { environmentInjector: this.injector, projectableNodes });
            Object.assign(component.instance as any, content.props || {});
            if (content.props && content.props.class) {
                this.renderer.setAttribute(component.location.nativeElement, 'class', content.props.class);
            }
            this.app.attachView(component.hostView);
            component.changeDetectorRef.detectChanges();
            return [component.location.nativeElement];
        } else {
            if (content.tag === 'pre' && content.children && content.props && typeof content.props.class === 'string' && content.props.class.startsWith('language-')) {
                const component = createComponent(HighlightCodeComponent, { environmentInjector: this.injector });
                component.instance.lang = content.props.class.substr('language-'.length);
                component.instance.code = content.children[0] as string;

                const params = new URLSearchParams(content.props.meta || '');
                component.instance.meta = Object.fromEntries(params.entries());

                this.app.attachView(component.hostView);
                component.changeDetectorRef.detectChanges();
                return [component.location.nativeElement];
            }

            // filter forbidden or dangerous tags. we use a whitelist
            if (!whitelist.includes(content.tag)) {
                return [];
            }

            //what else could be dangerous?
            // <a href="javascript:alert('XSS')">XSS</a>
            // <a href="jAvAsCrIpT:alert('XSS')">XSS</a>
            // <a href="jav&#x09;ascript:alert('XSS')">XSS</a>
            // fix these
            if (content.tag === 'a' && content.props?.href?.toLowerCase().startsWith('javascript:')) {
                return [];
            }

            let element = this.renderer.createElement(content.tag);
            if (content.props) {
                const whitelist = ['href', 'target', 'class', 'id', 'src', 'width', 'height', 'name'];
                for (const [key, value] of Object.entries(content.props)) {
                    if (!whitelist.includes(key)) continue;
                    this.renderer.setAttribute(element, key, value);
                }
            }

            if (content.tag === 'a') {
                //if content.props.href is relative
                // resolve correctly so that ../ and ./ are handled correctly
                if (content.props?.href) {
                    if (content.props.href.startsWith('http://') || content.props.href.startsWith('https://')) {
                        this.renderer.setAttribute(element, 'target', '_blank');
                    } else {
                        const base = new URL('http://none/' + this.router.url);
                        const url = new URL(content.props.href, new URL(this.router.url, base));
                        let href = url.pathname.replace('.md', '');
                        if (url.hash) href += url.hash;
                        this.renderer.setAttribute(element, 'href', href);
                    }
                }
            }
            if (content.tag === 'p' || content.tag === 'div') {
                this.renderer.addClass(element, 'text');
            }

            // if (content.tag.startsWith('h') && content.props && content.props.id) {
            //     const a = this.renderer.createElement('a');
            //     this.renderer.setAttribute(a, 'name', content.props.id);
            //     this.renderer.appendChild(parent, a);
            // }

            if (content.tag === 'img') {
                const wrapperDiv = this.renderer.createElement('div');
                this.renderer.addClass(wrapperDiv, 'image');
                this.renderer.appendChild(wrapperDiv, element);
                element = wrapperDiv;
            } else if (content.tag === 'video') {
                this.renderer.removeAttribute(element, 'width');
                this.renderer.removeAttribute(element, 'height');
                this.renderer.setAttribute(element, 'autoplay', '');
                this.renderer.setAttribute(element, 'controls', '');
                this.renderer.setAttribute(element, 'loop', '');
                this.renderer.setAttribute(element, 'playsinline', '');
                this.renderer.setAttribute(element, 'muted', '');

                const videoDiv = this.renderer.createElement('div');
                this.renderer.addClass(videoDiv, 'video');

                const wrapperDiv = this.renderer.createElement('div');
                this.renderer.addClass(wrapperDiv, 'wrapper');
                this.renderer.appendChild(videoDiv, wrapperDiv);

                this.renderer.appendChild(wrapperDiv, element);
                element = videoDiv;
            }
            if (content.children) {
                const children = this.renderContent(injector, content.children);
                for (const child of children) this.renderer.appendChild(element, child);
            }

            return [element];
        }
    }

}
