import { ModuleWithProviders, NgModule } from '@angular/core';
import { TooltipOptions } from './config/options.interface';
import { TooltipOptionsService } from './config/tooltip-options.service';
import { TooltipHtmlDirective } from './directives/tooltip-html.directive';
import { TooltipStrDirective } from './directives/tooltip-str.directive';
import { TooltipTemplateDirective } from './directives/tooltip-template.directive';
import { TooltipComponent } from './tooltip/tooltip.component';

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
