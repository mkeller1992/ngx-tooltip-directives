import { Directive, Input, NgModule, TemplateRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ContentType } from '../base-tooltip.directive';
import { TooltipOptions } from '../options.interface';
import { Placement } from '../placement.type';

@Directive()

export abstract class MockBaseTooltipDirective {

    // Will be populated by child-directive
    tooltipContent!: string | SafeHtml | TemplateRef<any>;

    get contentType(): ContentType | undefined {
        return this.mergedOptions.contentType;
    }

	// A merge of all options that were passed in various ways:
	private mergedOptions: TooltipOptions = {};

    // Will contain all options collected from the @Inputs
	private collectedOptions: Partial<TooltipOptions> = {};

    // Pass options as a single object:
    @Input()
	options: TooltipOptions = {};

	@Input()
	set id(val: string | number) {
	  	this.collectedOptions.id = val;
	}

	@Input()
	set placement(val: Placement) {
	  	this.collectedOptions.placement = val;
	}

	@Input()
	set autoPlacement(val: boolean) {
	 	 this.collectedOptions.autoPlacement = val;
	}

    @Input()
    set textColor(val: string) {
        this.collectedOptions.textColor = val;
    }

    @Input()
    set backgroundColor(val: string) {
        this.collectedOptions.backgroundColor = val;
    }

    @Input()
    set borderColor(val: string) {
        this.collectedOptions.borderColor = val;
    }

    @Input()
	set textAlign(val: 'left' | 'center' | 'right') {
	 	 this.collectedOptions.textAlign = val;
	}

    @Input()
    set padding(val: string) {
        this.collectedOptions.padding = val;
    }

    @Input()
    set hideDelayTouchscreen(val: number) {
        this.collectedOptions.hideDelayTouchscreen = val;
    }

	@Input()
	set zIndex(val: number) {
	  	this.collectedOptions.zIndex = val;
	}

    @Input()
    set animationDuration(val: number) {
        this.collectedOptions.animationDuration = val;
    }

    @Input()
    set trigger(val: 'hover' | 'click') {
        this.collectedOptions.trigger = val;
    }

    @Input()
    set tooltipClass(val: string) {
        this.collectedOptions.tooltipClass = val;
    }

    @Input()
    set display(val: boolean) {
        this.collectedOptions.display = val;
    }

    @Input()
    set displayTouchscreen(val: boolean) {
        this.collectedOptions.displayTouchscreen = val;
    }

    @Input()
    set shadow(val: boolean) {
        this.collectedOptions.shadow = val;
    }

    @Input()
    set offset(val: number) {
        this.collectedOptions.offset = val;
    }

    @Input()
    set width(val: string) {
        this.collectedOptions.width = val;
    }

    @Input()
    set maxWidth(val: string) {
        this.collectedOptions.maxWidth = val;
    }

    @Input()
    set showDelay(val: number) {
        this.collectedOptions.showDelay = val;
    }
    
    @Input()
    set hideDelay(val: number) {
        this.collectedOptions.hideDelay = val;
    }

    @Input()
    set hideDelayAfterClick(val: number) {
        this.collectedOptions.hideDelayAfterClick = val;
    }

    @Input()
    set pointerEvents(val: 'auto' | 'none') {
        this.collectedOptions.pointerEvents = val;
    }

	@Input()
	set position(val: { top: number; left: number }) {
	 	this.collectedOptions.position = val;
	}
}

@Directive({
  selector: '[tooltipStr]',
  exportAs: 'tooltipStr'
})
export class MockTooltipStrDirective extends MockBaseTooltipDirective {
  @Input() tooltipStr!: string;
}

@Directive({
  selector: '[tooltipHtml]',
  exportAs: 'tooltipHtml'
})
export class MockTooltipHtmlDirective extends MockBaseTooltipDirective {
  @Input() tooltipHtml!: string;
}

@Directive({
  selector: '[tooltipTemplate]',
  exportAs: 'tooltipTemplate'
})
export class MockTooltipTemplateDirective extends MockBaseTooltipDirective {
  @Input() tooltipTemplate!: any;
}

@NgModule({
  declarations: [
    MockTooltipStrDirective,
    MockTooltipHtmlDirective,
    MockTooltipTemplateDirective,
  ],
  exports: [
    MockTooltipStrDirective,
    MockTooltipHtmlDirective,
    MockTooltipTemplateDirective,
  ]
})
export class MockNgxTooltipDirectivesModule {}
