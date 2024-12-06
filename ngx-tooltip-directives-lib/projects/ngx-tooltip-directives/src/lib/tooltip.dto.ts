import { TemplateRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { TooltipOptions } from './options.interface';


export interface TooltipDto {
	tooltipStr?: string;
	tooltipHtml?: SafeHtml;
	tooltipTemplate?: TemplateRef<any>;
	tooltipContext?: any;
	hostElement: any;
	hostElementPosition: { top: number, left: number } | DOMRect;
	options: TooltipOptions;
}
