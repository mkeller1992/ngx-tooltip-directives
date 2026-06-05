import { Directive, effect, input, TemplateRef } from '@angular/core';
import { BaseTooltipDirective } from './base-tooltip.directive';

@Directive({
	selector: '[tooltipTemplate]',
	exportAs: 'tooltipTemplate'
})
export class TooltipTemplateDirective extends BaseTooltipDirective {

	readonly tooltipTemplate = input.required<TemplateRef<any>>();
	readonly tooltipContext = input<any>();

	constructor() {
		super();

		effect(() => {
			super.setTooltipContent(this.tooltipTemplate(), 'template');
		});

		effect(() => {
			super.setTooltipContext(this.tooltipContext());
		});
	}
}