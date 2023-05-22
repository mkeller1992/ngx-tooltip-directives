import { Component, ElementRef, EventEmitter, HostBinding, OnDestroy, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { filter, fromEvent, Subject, takeUntil, tap } from 'rxjs';
import { defaultOptions } from './default-options.const';
import { TooltipDto } from './tooltip.dto';
import { TooltipOptions } from './options.interface';
import { Placement } from './placement.type';
import { ContentType } from './base-tooltip.directive';

interface TooltipStyles {
	placement: Placement;
	topStyle: number;
	leftStyle: number;
	tooltipHeight: number;
	tooltipWidth: number;
	scrollY: number;
	clientWidth: number;
}

@Component({
    selector: 'tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss']
})

export class TooltipComponent implements OnInit, OnDestroy {

    events = new EventEmitter();

    // The observable below will inform error-tooltip-directive when user clicked on tooltip:
    private userClickOnTooltipSubject = new Subject<void>();
    userClickOnTooltip$ = this.userClickOnTooltipSubject.asObservable();    

    destroy$ = new Subject<void>();

	@HostBinding('class.tooltip') tooltipClass = true;
    @HostBinding('style.top') hostStyleTop!: string;
    @HostBinding('style.left') hostStyleLeft!: string;
	@HostBinding('style.padding') hostStylePadding!: string;
    @HostBinding('style.z-index') hostStyleZIndex!: number;
    @HostBinding('style.transition') hostStyleTransition!: string;
    @HostBinding('style.width') hostStyleWidth!: string;
    @HostBinding('style.max-width') hostStyleMaxWidth!: string;
    @HostBinding('style.pointer-events') hostStylePointerEvents!: string;
    @HostBinding('class.tooltip-show') hostClassShow!: boolean;
    @HostBinding('class.tooltip-hide') hostClassHide!: boolean;
    @HostBinding('class.tooltip-display-none') hostClassDisplayNone!: boolean;
    @HostBinding('class.tooltip-shadow') hostClassShadow!: boolean;

	@HostBinding('style.--tooltip-text-color') textColor!: string;
	@HostBinding('style.--tooltip-text-align') textAlign!: string;
	@HostBinding('style.--tooltip-background-color') backgroundColor!: string;
	@HostBinding('style.--tooltip-border-color') borderColor!: string;


    tooltipStr!: string;
    tooltipHtml!: SafeHtml;
    tooltipTemplate!: TemplateRef<any>;

	prioritizedPlacements: Placement[] = [ 'bottom', 'right', 'top', 'left', 'bottom-left', 'top-left' ];

    currentContentType!: ContentType;
    originalPlacement!: Placement; // placement defined by user
    autoPlacement!: boolean;
    hostElement!: any;
    hostElementPosition!: { top: number, left: number } | DOMRect;
    tooltipOffset!: number;

    constructor(private elementRef: ElementRef,
                private renderer: Renderer2) {}

    ngOnInit() {
    	this.listenToFadeInEnd();
    	this.listenToFadeOutEnd();
    }
    

    /* Methods that are invoked by base-tooltip.directive.ts */

    showTooltip(config: TooltipDto) {

        this.setTooltipProperties(config);
    	this.hostClassDisplayNone = false;

    	// 'setTimeout()' prevents the tooltip from 'jumping around' +
        // hostClassDisplayNone has to be called before hostClassShow and hostClassHide
        // to make the transition animation work.
        setTimeout(() => {
    		this.hostClassShow = true;
    		this.hostClassHide = false;
    		this.setPosition();
    	});
    }

    hideTooltip() {
    	this.hostClassShow = false;
    	this.hostClassHide = true;
    }

    setPosition(): void {
		let placementStyles = this.calculateTooltipStylesForPlacement(this.originalPlacement);
		const isInsideVisibleArea = this.isPlacementInsideVisibleArea(placementStyles);

		if (!isInsideVisibleArea && this.autoPlacement) {
			for (let placement of this.prioritizedPlacements) {
				const styles = this.calculateTooltipStylesForPlacement(placement);
				const isVisible = this.isPlacementInsideVisibleArea(styles);

				if(isVisible) {
					placementStyles = styles;
					break;
				}
			}
		}

		this.removeAllPlacementClasses();
		this.setPlacementStyles(placementStyles);
    }


    /* Method that gets invoked by html */

    handleTooltipClick() {
    	this.userClickOnTooltipSubject.next();
    }


	/* Private helper methods */

    private listenToFadeInEnd() {
    	fromEvent(this.elementRef.nativeElement, 'transitionend')
    		.pipe(
    			filter(() => this.hostClassShow),
    			tap(() => this.events.emit({ type: 'shown' })),
    			takeUntil(this.destroy$),
    		)
    		.subscribe();
    }

    private listenToFadeOutEnd() {
    	fromEvent(this.elementRef.nativeElement, 'transitionend')
    		.pipe(
    			filter(() => this.hostClassHide),
    			tap(() => this.hostClassDisplayNone = true),
    			tap(() => this.events.emit({ type: 'hidden' })),
    			takeUntil(this.destroy$),
    		)
    		.subscribe();
    }

    private setTooltipProperties(config: TooltipDto) {
        this.currentContentType = config.options.contentType ?? 'string';

		if (this.currentContentType === 'string' && config.tooltipStr) {
			this.tooltipStr = config.tooltipStr;
		}
		if (this.currentContentType === 'html' && config.tooltipHtml) {
			this.tooltipHtml = config.tooltipHtml;
		}
		if (this.currentContentType === 'template' && config.tooltipTemplate) {
			this.tooltipTemplate = config.tooltipTemplate;
		}

		this.hostElement = config.hostElement;
        this.hostElementPosition = config.hostElementPosition;
        this.originalPlacement = config.options.placement ?? defaultOptions.placement!;
        this.autoPlacement = config.options.autoPlacement ?? defaultOptions.autoPlacement!;
        this.tooltipOffset = !!config.options.offset ? +config.options.offset : +(defaultOptions.offset ?? 0);
        
        this.setCustomClass(config.options);
        this.setZIndex(config.options);
        this.setPointerEvents(config.options);
        this.setAnimationDuration(config.options);
        this.setStyles(config.options);
    }

    private setPlacementStyles(placementStyles: TooltipStyles): void {
    	this.hostStyleTop = `${placementStyles.topStyle}px`;
		this.hostStyleLeft = `${placementStyles.leftStyle}px`;
    	this.renderer.addClass(this.elementRef.nativeElement, `tooltip-${placementStyles.placement ?? ''}`);
    }

    private removeAllPlacementClasses(): void {
    	this.prioritizedPlacements.forEach(placement => {
    		this.renderer.removeClass(this.elementRef.nativeElement, `tooltip-${placement}`);
    	});
    }

	private calculateTooltipStylesForPlacement(placement: Placement): TooltipStyles {
		const isFormCtrlSVG = this.hostElement instanceof SVGElement;
		const tooltip = this.elementRef.nativeElement;
		const tooltipHeight = tooltip.clientHeight;
		const tooltipWidth = tooltip.clientWidth;
		const scrollY = window.scrollY;

		let formControlHeight = isFormCtrlSVG ? this.hostElement.getBoundingClientRect().height : this.hostElement.offsetHeight;
		let formControlWidth = isFormCtrlSVG ? this.hostElement.getBoundingClientRect().width : this.hostElement.offsetWidth;
		// In case the user passed a custom position, the object would just contain {top: number, left: number}
		const isCustomPosition = !(this.hostElementPosition instanceof DOMRect);
	
		if (isCustomPosition) {
			formControlHeight = 0;
			formControlWidth = 0;
		}

		let topStyle;
		let leftStyle;

		if (placement === 'top' || placement === 'top-left') {
			topStyle = (this.hostElementPosition.top + scrollY) - (tooltipHeight + this.tooltipOffset);
		}

		if (placement === 'bottom' || placement === 'bottom-left') {
			topStyle = (this.hostElementPosition.top + scrollY) + formControlHeight + this.tooltipOffset;
		}

		if (placement === 'top' || placement === 'bottom') {
			leftStyle = (this.hostElementPosition.left + formControlWidth / 2) - tooltipWidth / 2;
		}

		if (placement === 'bottom-left' || placement === 'top-left') {
			leftStyle = this.hostElementPosition.left;
		}

		if (placement === 'left') {
			leftStyle = this.hostElementPosition.left - tooltipWidth - this.tooltipOffset;
		}

		if (placement === 'right') {
			leftStyle = this.hostElementPosition.left + formControlWidth + this.tooltipOffset;
		}

		if (placement === 'left' || placement === 'right') {
			topStyle = (this.hostElementPosition.top + scrollY) + formControlHeight / 2 - tooltip.clientHeight / 2;
		}

		return {
			placement,
			topStyle,
			leftStyle,
			tooltipHeight,
			tooltipWidth,
			scrollY,
			clientWidth: document.body.clientWidth
		}
	}

    private isPlacementInsideVisibleArea(styleData: TooltipStyles) {
		const topEdge = styleData.topStyle - styleData.scrollY;
		const bottomEdge = styleData.topStyle + styleData.tooltipHeight;
		const leftEdge = styleData.leftStyle;
		const rightEdge = styleData.leftStyle + styleData.tooltipWidth;
		const bodyHeight = window.innerHeight + styleData.scrollY;
		const bodyWidth = styleData.clientWidth;

		if (topEdge < 0 || bottomEdge > bodyHeight || leftEdge < 0 || rightEdge > bodyWidth) {
			return false;
		}
		
		return true;				
	}

    private setCustomClass(options: TooltipOptions){
        if (options.tooltipClass) {
            options.tooltipClass.split(' ').forEach((className:any) => {
                this.renderer.addClass(this.elementRef.nativeElement, className);
            });
        }
    }

    private setZIndex(options: TooltipOptions): void {
        if (options.zIndex !== 0) {
            this.hostStyleZIndex = options.zIndex ?? defaultOptions.zIndex ?? 0;
        }
    }

    private setPointerEvents(options: TooltipOptions): void {
        if (options.pointerEvents) {
            this.hostStylePointerEvents = options.pointerEvents;
        }
    }

    private setAnimationDuration(options: TooltipOptions) {
    	const animationDuration = !!options.animationDuration ? options.animationDuration : options.animationDurationDefault;
    	this.hostStyleTransition = `opacity ${animationDuration}ms`;
    }

    private setStyles(options: TooltipOptions) {
		this.textColor = options.textColor ?? defaultOptions.textColor!;
		this.textAlign = options.textAlign ?? defaultOptions.textAlign!;
		this.hostStylePadding = options.padding ?? defaultOptions.padding!;
		this.backgroundColor = options.backgroundColor ?? defaultOptions.backgroundColor!;
		this.borderColor = options.borderColor ?? defaultOptions.borderColor!;
        this.hostClassShadow = options.shadow ?? true;        

		if (options.maxWidth) {
			this.hostStyleMaxWidth = options.maxWidth;
		}
		if (options.width) {
			this.hostStyleWidth = options.width;
		}
    }

    ngOnDestroy(): void {
    	this.destroy$.next();
    	this.destroy$.unsubscribe();
    }
}
