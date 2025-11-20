import { ModuleWithProviders, NgModule } from '@angular/core';
import { TooltipOptions } from './options.interface';
import { TooltipOptionsService } from './options.service';
import { TooltipHtmlDirective } from './tooltip-html.directive';
import { TooltipStrDirective } from './tooltip-str.directive';
import { TooltipTemplateDirective } from './tooltip-template.directive';
import { TooltipComponent } from './tooltip.component';

@NgModule({
  imports: [
    TooltipComponent,
    TooltipStrDirective,
    TooltipHtmlDirective,
    TooltipTemplateDirective,
  ],
  exports: [
    TooltipStrDirective,
    TooltipHtmlDirective,
    TooltipTemplateDirective,
  ]
})

export class NgxTooltipDirectivesModule {
  
	static forRoot(initOptions: TooltipOptions): ModuleWithProviders<NgxTooltipDirectivesModule> {
		return {
			ngModule: NgxTooltipDirectivesModule,
			providers: [
				{
					provide: TooltipOptionsService,
					useValue: initOptions
				}
			]
		};
	}
}
