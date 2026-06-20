import { Directive, effect, input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { BaseTooltipDirective } from './base-tooltip.directive';

@Directive({
	selector: '[tooltipHtml]',
	exportAs: 'tooltipHtml',
})
export class TooltipHtmlDirective extends BaseTooltipDirective {

	readonly tooltipHtml = input.required<SafeHtml>();

	constructor() {
		super();

		effect(() => {
			super.setTooltipContent(this.tooltipHtml(), 'html');
		});
	}
}