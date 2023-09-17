import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-loading',
    standalone: true,
    styles: [`
        div {
            position: fixed;
            z-index: 2147483647;
            top: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: #0088CC;
            border-radius: 1px;
            transition: width 1500ms ease-out, opacity 1400ms linear;
        }

        div.loading {
            width: 100%;
        }

        div dd, div dt {
            position: absolute;
            top: 0;
            height: 2px;
            box-shadow: #0088CC 1px 0 6px 1px;
            border-radius: 100%;
        }

        div dt {
            opacity: .6;
            width: 180px;
            right: -80px;
            clip: rect(-6px, 90px, 14px, -6px);
        }

        div dd {
            opacity: .6;
            width: 20px;
            right: 0;
            clip: rect(-6px, 22px, 14px, 10px);
        }
    `],
    template: `
        <div [class.loading]="loading">
            <dt></dt>
            <dd></dd>
        </div>
    `
})
export class LoadingComponent implements OnInit {
    loading = false;

    constructor(private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.loading = true;
            this.cd.detectChanges();
        }, 10);
    }
}
