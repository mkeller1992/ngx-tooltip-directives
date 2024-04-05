import { Directive, Input } from "@angular/core";
import { BaseTooltipDirective } from "./base-tooltip.directive";

@Directive({
    selector: '[tooltipStr]',
    exportAs: 'tooltipStr',
})

export class TooltipStrDirective extends BaseTooltipDirective {
    
    @Input()
    set tooltipStr(value: string) {
        super.setTooltipContent(value, 'string');
    }

}