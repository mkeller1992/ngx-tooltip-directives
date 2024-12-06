import { Directive, Input, TemplateRef } from "@angular/core";
import { BaseTooltipDirective } from "./base-tooltip.directive";

@Directive({
    selector: '[tooltipTemplate]',
    exportAs: 'tooltipTemplate'
})

export class TooltipTemplateDirective extends BaseTooltipDirective {
    
    @Input('tooltipTemplate')
    set tooltipTemplate(value: TemplateRef<any>) {
        super.setTooltipContent(value, 'template');
    }

    @Input('tooltipContext')
    set tooltipContext(value: any) {
        super.setTooltipContext(value);
    }
}