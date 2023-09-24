import { Component, ComponentFactoryResolver, Injector, Input, OnChanges, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { Content } from '@app/common/models';
import { NgForOf, NgIf } from '@angular/common';
import { ScreenComponent, ScreensComponent } from '@app/app/components/screens.component';
import { HighlightCodeComponent } from "@app/app/components/highlight-code.component";
import { Router } from "@angular/router";

@Component({
    selector: 'app-render-content',
    standalone: true,
    imports: [NgForOf, NgIf, ScreensComponent, ScreenComponent, HighlightCodeComponent],
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
        private resolver: ComponentFactoryResolver
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

        this.renderContent(this.viewRef.injector, this.viewRef.element.nativeElement, this.content);
    }

    renderContent(injector: Injector, parent: any, content: (Content | string)[] | Content | string) {
        const components: { [name: string]: any } = {
            'app-screens': ScreensComponent,
            'app-screen': ScreenComponent,
            'highlight-code': HighlightCodeComponent,
        };

        if ('string' === typeof content) {
            const element = this.renderer.createText(content);
            this.renderer.appendChild(parent, element);
        } else if (Array.isArray(content)) {
            for (const child of content) {
                this.renderContent(injector, parent, child);
            }
        } else if (components[content.tag]) {
            const component = this.viewRef.createComponent(components[content.tag], { injector });
            this.renderer.appendChild(parent, component.location.nativeElement);

            if (content.props) {
                for (const [key, value] of Object.entries(content.props)) {
                    (component.instance as any)[key] = value;
                }
            }

            if (content.children) this.renderContent(component.injector, component.location.nativeElement, content.children);
        } else {
            if (content.tag === 'pre') {
                const code = content.children && content.children[0];
                if (code && 'string' !== typeof code) {
                    if (code.tag === 'code' && code.children && code.props && typeof code.props.class === 'string' && code.props.class.startsWith('language-')) {
                        const factory = this.resolver.resolveComponentFactory(HighlightCodeComponent);
                        const wrapperDiv = this.renderer.createElement('div');
                        this.renderer.appendChild(parent, wrapperDiv);
                        //although factories are deprecated, it's the only way to define a parent selector, which is needed for ssr hydration
                        const component = factory.create(injector, [], wrapperDiv);
                        // const component = this.viewRef.createComponent(HighlightCodeComponent, { injector });
                        component.instance.lang = code.props.class.substr('language-'.length);
                        component.instance.code = code.children[0] as string;
                        // component.hostView.detectChanges();
                        // this.renderer.appendChild(wrapperDiv, component.location.nativeElement);
                        component.changeDetectorRef.detectChanges();
                        return;
                    }
                }
            }

            // filter forbidden or dangerous tags. we use a whitelist
            if (!['div', 'p', 'a', 'button', 'pre', 'code', 'strong', 'hr', 'ul', 'li', 'ol', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'table', 'tbody', 'tr', 'td', 'th'].includes(content.tag)) {
                return;
            }

            //what else could be dangerous?
            // <a href="javascript:alert('XSS')">XSS</a>
            // <a href="jAvAsCrIpT:alert('XSS')">XSS</a>
            // <a href="jav&#x09;ascript:alert('XSS')">XSS</a>
            // fix these
            if (content.tag === 'a' && content.props?.href?.toLowerCase().startsWith('javascript:')) {
                return;
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
                this.renderer.appendChild(parent, wrapperDiv);
                this.renderer.appendChild(wrapperDiv, element);
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
                this.renderer.appendChild(parent, videoDiv);

                const wrapperDiv = this.renderer.createElement('div');
                this.renderer.addClass(wrapperDiv, 'wrapper');
                this.renderer.appendChild(videoDiv, wrapperDiv);

                this.renderer.appendChild(wrapperDiv, element);
            } else {
                this.renderer.appendChild(parent, element);
            }
            if (content.children) this.renderContent(injector, element, content.children);
        }
    }

}
