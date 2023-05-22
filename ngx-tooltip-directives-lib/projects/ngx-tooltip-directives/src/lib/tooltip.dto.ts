import { TemplateRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { TooltipOptions } from './options.interface';


export interface TooltipDto {
	tooltipStr: string | undefined;
	tooltipHtml: SafeHtml | undefined;
	tooltipTemplate: TemplateRef<any> | undefined;
	hostElement: any;
	hostElementPosition: { top: number, left: number } | DOMRect;
	options: TooltipOptions;
}
