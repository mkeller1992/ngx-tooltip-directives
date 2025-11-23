import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, HostBinding, inject, OnDestroy, OnInit, signal, TemplateRef } from '@angular/core';
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
	imports: [NgTemplateOutlet]
})


export class TooltipComponent implements OnInit, OnDestroy {
	private readonly elementRef = inject(ElementRef);

	// The observable below will inform base-tooltip-directive when user clicked outside tooltip:
	private userClickOutsideTooltipSubject = new Subject<MouseEvent>();
	userClickOutsideTooltip$ = this.userClickOutsideTooltipSubject.asObservable();

	// This information is purely for the user to know when the tooltip is shown or hidden:
	private visibilityChangeCompletedSubject = new Subject<{ type: string }>();
	visibilityChangeCompleted$ = this.visibilityChangeCompletedSubject.asObservable();

	// --- Tooltip Content ---
	protected contentType         = signal<ContentType>(defaultOptions.contentType!); // default to 'string'
	protected tooltipStr          = signal<string>('');
	protected tooltipHtml         = signal<SafeHtml | null>(null);
	protected tooltipTemplate!: TemplateRef<any>;
	protected tooltipContext 	  = signal<any | null>(null);
	
	private readonly prioritizedPlacements: Placement[] = [ 'bottom', 'right', 'top', 'left', 'bottom-left', 'top-left' ];

	private autoPlacement!: boolean;
	private hostElement!: any;
	public hostElementPosition!: { top: number, left: number } | DOMRect;
	private tooltipOffset!: number;

	// --- State as signals ---	

	// Initialize all host styles
	public hostPosition = signal<string>('absolute');
	private _hostStyleTop = signal<number>(0);
	private _hostStyleLeft = signal<number>(0);
	private _hostStylePadding = signal<string>(defaultOptions.padding!);
	private _hostStyleZIndex = signal<number>(defaultOptions.zIndex!);
	private _hostStyleWidth = signal<string | null>(null);
	private _hostStyleMinWidth = signal<string | null>(null);
	private _hostStyleMaxWidth = signal<string>(defaultOptions.maxWidth!);
	private _hostStylePointerEvents = signal<string>(defaultOptions.pointerEvents!);
	private _transitionTime = signal<string>(`${defaultOptions.animationDurationDefault}ms`);
	private _textColor = signal<string>(defaultOptions.textColor!);
	private _textAlign = signal<string>(defaultOptions.textAlign!);
	private _backgroundColor = signal<string>(defaultOptions.backgroundColor!);
	private _borderColor = signal<string>(defaultOptions.borderColor!);

	// Initialize all host classes
	private _state      = signal<'show'|'hide'>('hide');
	private _placement  = signal<Placement>(defaultOptions.placement!); // placement defined by user
  	private _placementClass = computed(() => `tooltip-${this._placement()}`);
	private _hasShadow = signal<boolean>(defaultOptions.shadow!);
	private _shadowClass = computed(() => this._hasShadow() ? 'tooltip-shadow' : '');
	private _customClass = signal<string>('');

  	private _classList = computed(() => {
		const parts = [
			'tooltip',               // static base class
			this._state(),           // 'show' | 'hide'
			this._placementClass(),  // e.g. 'tooltip-bottom'
			this._shadowClass(),	 // 'tooltip-shadow' | ''
			this._customClass().trim()
		];
		return parts.filter(Boolean).join(' ');
	});

  	// --- Host-classes reading the signals ---

	@HostBinding('class')
	get hostClasses() { return this._classList(); }

	// --- Host-styles reading the signals ---

	@HostBinding('style.position') // Set 'absolute' or 'fixed' based on whether tooltip is appended to body or not
	get hostStylePosition() { return this.hostPosition(); }

    @HostBinding('style.top')
	get hostStyleTop() { return `${this._hostStyleTop()}px`; }

    @HostBinding('style.left')
	get hostStyleLeft() { return `${this._hostStyleLeft()}px`; }

	@HostBinding('style.padding')
	get hostStylePadding() { return this._hostStylePadding(); }

    @HostBinding('style.z-index')
	get hostStyleZIndex() { return this._hostStyleZIndex(); }

    @HostBinding('style.width')
	get hostStyleWidth() { return this._hostStyleWidth(); }

	@HostBinding('style.min-width')
	get hostStyleMinWidth() { return this._hostStyleMinWidth(); }

    @HostBinding('style.max-width')
	get hostStyleMaxWidth() { return this._hostStyleMaxWidth(); }

    @HostBinding('style.pointer-events')
	get hostStylePointerEvents() { return this._hostStylePointerEvents(); }

	@HostBinding('style.--transition-time')
    get transitionTime() { return this._transitionTime(); }

	@HostBinding('style.--tooltip-text-color')
	get textColor() { return this._textColor(); }

	@HostBinding('style.--tooltip-text-align')
	get textAlign() { return this._textAlign(); }

	@HostBinding('style.--tooltip-background-color')
	get backgroundColor() { return this._backgroundColor(); }

	@HostBinding('style.--tooltip-border-color')
	get borderColor() { return this._borderColor(); }


	private readonly destroy$ = new Subject<void>();


	ngOnInit() {
		this.listenToClicksOutsideTooltip();
    	this.listenToFadeInEnd();
    	this.listenToFadeOutEnd();
	}


	/* Methods that are invoked by base-tooltip.directive.ts */

	showTooltip(config: TooltipDto) {
		this.setTooltipProperties(config);
		this._state.set('show');

		// 'requestAnimationFrame()' prevents the tooltip from 'jumping around'
		requestAnimationFrame(() => {
			const appendToBody = config.options.appendTooltipToBody ?? defaultOptions.appendTooltipToBody!;
			const isFixed = !appendToBody;
			this.setPosition(isFixed);
		});
	}

	hideTooltip() {
		this._state.set('hide');
	}

	setPosition(isFixedPosition: boolean): void {
		const primary = this._placement();

		// 1) Check primary placement
		let primaryStyles = this.calculateTooltipStylesForPlacement(primary, isFixedPosition);
		if (!this.autoPlacement || this.isPlacementInsideVisibleArea(primaryStyles, isFixedPosition)) {
			this.setPlacementStyles(primaryStyles);
			return;
		}

		// 2) Auto-placement fallback

		for (const placement of this.prioritizedPlacements) {

			// Skip primary placement – we already checked it
			if (placement === primary) {
				continue;
			}

			const styles = this.calculateTooltipStylesForPlacement(placement, isFixedPosition);
			if (this.isPlacementInsideVisibleArea(styles, isFixedPosition)) {
				this.setPlacementStyles(styles);
				return;
			}
		}

		// 3) Final fallback (nothing visible) → use primary anyway
  		this.setPlacementStyles(primaryStyles);
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
				filter(event => event.propertyName === 'opacity' && this._state() === 'show'),
				tap(() => { 
						this.visibilityChangeCompletedSubject.next({ type: 'shown' })
					}),
				takeUntil(this.destroy$),
		  )
		  .subscribe();
	}

	private listenToFadeOutEnd() {
		fromEvent<TransitionEvent>(this.elementRef.nativeElement, 'transitionend')
		  .pipe(
				filter(event => event.propertyName === 'opacity' && this._state() === 'hide'),
				tap(() => { 
					this.visibilityChangeCompletedSubject.next({ type: 'hidden' })
				}),
				takeUntil(this.destroy$)
		  )
		  .subscribe();
	}

	private setTooltipProperties(config: TooltipDto) {
		const type = config.options.contentType ?? defaultOptions.contentType!;
		this.contentType.set(type);

		if (type === 'string' && config.tooltipStr) {
			this.tooltipStr.set(config.tooltipStr);
		}
		if (type === 'html' && config.tooltipHtml) {
			this.tooltipHtml.set(config.tooltipHtml);
		}
		if (type === 'template' && config.tooltipTemplate) {
			this.tooltipTemplate = config.tooltipTemplate;
			this.tooltipContext.set(config.tooltipContext ?? null);
		}

		this.hostElement = config.hostElement;
		this.hostElementPosition = config.hostElementPosition;
		this._placement.set(config.options.placement ?? defaultOptions.placement!);
		this.autoPlacement = config.options.autoPlacement ?? defaultOptions.autoPlacement!;
		this.tooltipOffset = !!config.options.offset ? +config.options.offset : +(defaultOptions.offset ?? 0);

		this.applyStyleOptions(config.options);
	}

	private setPlacementStyles(s: TooltipStyles): void {
		// update coordinates
		this._hostStyleTop.set(s.topStyle);
		this._hostStyleLeft.set(s.leftStyle);

		// update placement → recomputes class list automatically
		this._placement.set(s.placement);
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


	private applyStyleOptions(options: TooltipOptions) {
		this._customClass.set(options.tooltipClass ?? '');

		const zIndex = typeof options.zIndex === 'number' ? options.zIndex : (defaultOptions.zIndex ?? 0);
		this._hostStyleZIndex.set(zIndex);

		this._hostStylePointerEvents.set(options.pointerEvents ?? defaultOptions.pointerEvents!);

		const durationMs = (options.animationDuration ?? defaultOptions.animationDurationDefault) + 'ms';
		this._transitionTime.set(durationMs);

		this._textColor.set(options.textColor ?? defaultOptions.textColor!);
		this._textAlign.set(options.textAlign ?? defaultOptions.textAlign!);
		this._hostStylePadding.set(options.padding ?? defaultOptions.padding!);
		this._backgroundColor.set(options.backgroundColor ?? defaultOptions.backgroundColor!);
		this._borderColor.set(options.borderColor ?? defaultOptions.borderColor!);

		this._hasShadow.set(options.shadow ?? defaultOptions.shadow!);

		this._hostStyleMinWidth.set(options.minWidth ?? null);
		this._hostStyleMaxWidth.set(options.maxWidth ?? defaultOptions.maxWidth!);
		this._hostStyleWidth.set(options.width ?? null);
	}

	ngOnDestroy(): void {
    	this.destroy$.next();
    	this.destroy$.unsubscribe();
	}
}
