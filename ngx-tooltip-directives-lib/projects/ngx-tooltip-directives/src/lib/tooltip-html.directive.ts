import { Input } from "@angular/core";
import { Directive } from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";
import { BaseTooltipDirective } from "./base-tooltip.directive";

@Directive({
    selector: '[tooltipHtml]',
    exportAs: 'tooltipHtml',
})

export class TooltipHtmlDirective extends BaseTooltipDirective {
    
    @Input()
    set tooltipHtml(value: SafeHtml) {
        super.initializeTooltip(value, 'html');
    }

}