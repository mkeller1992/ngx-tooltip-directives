import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, inject, OnDestroy, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Subject, filter, fromEvent, takeUntil, tap } from 'rxjs';
import { ContentType } from './base-tooltip.directive';
import { defaultOptions } from './default-options.const';
import { TooltipOptions } from './options.interface';
import { Placement } from './placement.type';
import { TooltipDto } from './tooltip.dto';

interface TooltipStyles {
	placement: Placement;
	topStyle: number;
	leftStyle: number;
	tooltipHeight: number;
	tooltipWidth: number;
	clientWidth: number;
	adjustScrollY: number;
}

@Component({
	selector: 'tooltip',
	templateUrl: './tooltip.component.html',
	styleUrls: ['./tooltip.component.scss'],
	imports: [CommonModule]
})


export class TooltipComponent implements OnInit, OnDestroy {
	private readonly cdRef = inject(ChangeDetectorRef);
	private readonly elementRef = inject(ElementRef);
	private readonly renderer = inject(Renderer2);

	// The observable below will inform base-tooltip-directive when user clicked outside tooltip:
	private userClickOutsideTooltipSubject = new Subject<MouseEvent>();
	userClickOutsideTooltip$ = this.userClickOutsideTooltipSubject.asObservable();

	// This information is purely for the user to know when the tooltip is shown or hidden:
	private visibilityChangeCompletedSubject = new Subject<{ type: string }>();
	visibilityChangeCompleted$ = this.visibilityChangeCompletedSubject.asObservable();

	destroy$ = new Subject<void>();

	@HostBinding('class')
    tooltipState: string = 'hide'; // Control the state of tooltip

	@HostBinding('style.--transition-time')
    transitionTime!: string;

	@HostBinding('class.tooltip') tooltipClass = true;
	@HostBinding('style.position') hostStylePosition!: string; // Set position based on whether tooltip is appended to body or not
    @HostBinding('style.top') hostStyleTop!: string;
    @HostBinding('style.left') hostStyleLeft!: string;
	@HostBinding('style.padding') hostStylePadding!: string;
    @HostBinding('style.z-index') hostStyleZIndex!: number;
    @HostBinding('style.width') hostStyleWidth!: string;
	@HostBinding('style.min-width') hostStyleMinWidth!: string;
    @HostBinding('style.max-width') hostStyleMaxWidth!: string;
    @HostBinding('style.pointer-events') hostStylePointerEvents!: string;
    @HostBinding('class.tooltip-shadow') hostClassShadow!: boolean;

	@HostBinding('style.--tooltip-text-color') textColor!: string;
	@HostBinding('style.--tooltip-text-align') textAlign!: string;
	@HostBinding('style.--tooltip-background-color') backgroundColor!: string;
	@HostBinding('style.--tooltip-border-color') borderColor!: string;

	tooltipStr!: string;
	tooltipHtml!: SafeHtml;
	tooltipTemplate!: TemplateRef<any>;
	tooltipContext: any | undefined;

	prioritizedPlacements: Placement[] = [ 'bottom', 'right', 'top', 'left', 'bottom-left', 'top-left' ];

	currentContentType!: ContentType;
	originalPlacement!: Placement; // placement defined by user
	autoPlacement!: boolean;
	hostElement!: any;
	hostElementPosition!: { top: number, left: number } | DOMRect;
	tooltipOffset!: number;

	ngOnInit() {
		this.listenToClicksOutsideTooltip();
    	this.listenToFadeInEnd();
    	this.listenToFadeOutEnd();
	}


	/* Methods that are invoked by base-tooltip.directive.ts */

	showTooltip(config: TooltipDto) {
		this.setTooltipProperties(config);
		this.tooltipState = 'show';
		this.cdRef.markForCheck(); // To comply with zoneless change detection


		// 'setTimeout()' prevents the tooltip from 'jumping around'
		requestAnimationFrame(() => {
			const appendToBody = config.options.appendTooltipToBody ?? defaultOptions.appendTooltipToBody!;
			const isFixed = !appendToBody;
			this.setPosition(isFixed);
			this.cdRef.markForCheck(); // To comply with zoneless change detection
		});
	}

	hideTooltip() {
		this.tooltipState = 'hide';
		this.cdRef.markForCheck(); // To comply with zoneless change detection
	}

	setPosition(isFixedPosition: boolean): void {
		let placementStyles = this.calculateTooltipStylesForPlacement(this.originalPlacement, isFixedPosition);
		const isInsideVisibleArea = this.isPlacementInsideVisibleArea(placementStyles, isFixedPosition);

		if (!isInsideVisibleArea && this.autoPlacement) {
			for (const placement of this.prioritizedPlacements) {
				const styles = this.calculateTooltipStylesForPlacement(placement, isFixedPosition);
				const isVisible = this.isPlacementInsideVisibleArea(styles, isFixedPosition);

				if(isVisible) {
					placementStyles = styles;
					break;
				}
			}
		}

		this.removeAllPlacementClasses();
		this.setPlacementStyles(placementStyles);
		this.cdRef.markForCheck(); // To comply with zoneless change detection
	}


	/* Private helper methods */

	private listenToClicksOutsideTooltip() {
		fromEvent<MouseEvent>(window, 'click')
		  	.pipe(
				tap((event: MouseEvent) => {
					const targetElement = event.target as HTMLElement;
					// Check if the clicked element is not within the tooltip element
					if (this.elementRef.nativeElement &&
						!this.elementRef.nativeElement.contains(targetElement)) {
						this.userClickOutsideTooltipSubject.next(event);
					}
				}),
				takeUntil(this.destroy$)
			)
		  	.subscribe();
	  }

	private listenToFadeInEnd() {
		fromEvent<TransitionEvent>(this.elementRef.nativeElement, 'transitionend')
		  .pipe(
				filter(event => event.propertyName === 'opacity' && this.tooltipState === 'show'),
				tap(() => { 
						this.visibilityChangeCompletedSubject.next({ type: 'shown' })
						this.cdRef.markForCheck(); // To comply with zoneless change detection
					}),
				takeUntil(this.destroy$),
		  )
		  .subscribe();
	}

	private listenToFadeOutEnd() {
		fromEvent<TransitionEvent>(this.elementRef.nativeElement, 'transitionend')
		  .pipe(
				filter(event => event.propertyName === 'opacity' && this.tooltipState === 'hide'),
				tap(() => { 
					this.visibilityChangeCompletedSubject.next({ type: 'hidden' })
					this.cdRef.markForCheck(); // To comply with zoneless change detection
				}),
				takeUntil(this.destroy$)
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
			this.tooltipContext = config.tooltipContext;
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

	private calculateTooltipStylesForPlacement(placement: Placement, isFixedPosition: boolean): TooltipStyles {
		const isFormCtrlSVG = this.hostElement instanceof SVGElement;
		const tooltip = this.elementRef.nativeElement;
		const tooltipHeight = tooltip.clientHeight;
		const tooltipWidth = tooltip.clientWidth;
		const adjustScrollY = isFixedPosition ? 0 : window.scrollY;

		let formControlHeight = isFormCtrlSVG
			? this.hostElement.getBoundingClientRect().height
			: this.hostElement.offsetHeight;

		let formControlWidth = isFormCtrlSVG
			? this.hostElement.getBoundingClientRect().width
			: this.hostElement.offsetWidth;

		// In case the user passed a custom position, the object would just contain {top: number, left: number}
		const isCustomPosition = !(this.hostElementPosition instanceof DOMRect);

		if (isCustomPosition) {
			formControlHeight = 0;
			formControlWidth = 0;
		}

		let topStyle, leftStyle;

		switch (placement) {
			case 'top':
			case 'top-left':
				topStyle = (this.hostElementPosition.top + adjustScrollY) - (tooltipHeight + this.tooltipOffset);
				break;

			case 'bottom':
			case 'bottom-left':
				topStyle = (this.hostElementPosition.top + adjustScrollY) + (formControlHeight + this.tooltipOffset);
				break;

			case 'left':
			case 'right':
				topStyle = (this.hostElementPosition.top + adjustScrollY) + (formControlHeight / 2) - (tooltip.clientHeight / 2);
				break;
		}

		switch (placement) {
			case 'top':
			case 'bottom':
				leftStyle = (this.hostElementPosition.left + formControlWidth / 2) - (tooltipWidth / 2);
				break;

			case 'top-left':
			case 'bottom-left':
				leftStyle = this.hostElementPosition.left;
				break;

			case 'left':
				leftStyle = this.hostElementPosition.left - tooltipWidth - this.tooltipOffset;
				break;

			case 'right':
				leftStyle = this.hostElementPosition.left + formControlWidth + this.tooltipOffset;
				break;
		}

		return {
			placement,
			topStyle,
			leftStyle,
			tooltipHeight,
			tooltipWidth,
			clientWidth: document.body.clientWidth,
			adjustScrollY
		}
	}

	private isPlacementInsideVisibleArea(styleData: TooltipStyles, isFixedPosition: boolean): boolean {
		const topEdge = isFixedPosition
			? styleData.topStyle
			: styleData.topStyle - styleData.adjustScrollY;

		const bottomEdge = isFixedPosition
			? styleData.topStyle + styleData.tooltipHeight
			: styleData.topStyle + styleData.tooltipHeight - styleData.adjustScrollY;

		const leftEdge = styleData.leftStyle;
		const rightEdge = styleData.leftStyle + styleData.tooltipWidth;

		const bodyHeight = window.innerHeight;
		const bodyWidth = styleData.clientWidth;

		return topEdge >= 0 && bottomEdge <= bodyHeight && leftEdge >= 0 && rightEdge <= bodyWidth;
	}

	private setCustomClass(options: TooltipOptions){
		if (options.tooltipClass) {
			options.tooltipClass.split(' ').forEach((className:any) => {
				this.renderer.addClass(this.elementRef.nativeElement, className);
			});
		}
	}

	private setZIndex(options: TooltipOptions): void {
		if (options.zIndex && options.zIndex > 0) {
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
    	this.transitionTime = `${animationDuration}ms`;
	}

	private setStyles(options: TooltipOptions) {
		this.textColor = options.textColor ?? defaultOptions.textColor!;
		this.textAlign = options.textAlign ?? defaultOptions.textAlign!;
		this.hostStylePadding = options.padding ?? defaultOptions.padding!;
		this.backgroundColor = options.backgroundColor ?? defaultOptions.backgroundColor!;
		this.borderColor = options.borderColor ?? defaultOptions.borderColor!;
		this.hostClassShadow = options.shadow ?? true;

		if (options.minWidth) {
			this.hostStyleMinWidth = options.minWidth;
		}
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
