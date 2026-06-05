import { Directive, effect, input } from '@angular/core';
import { BaseTooltipDirective } from './base-tooltip.directive';

@Directive({
	selector: '[tooltipStr]',
	exportAs: 'tooltipStr',
})
export class TooltipStrDirective extends BaseTooltipDirective {

	readonly tooltipStr = input.required<string>();

	constructor() {
		super();

		effect(() => {
			super.setTooltipContent(this.tooltipStr(), 'string');
		});
	}
}