import { ComponentRef, computed, Directive, ElementRef, EventEmitter, inject, Injector, input, OnDestroy, OnInit, Output, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { auditTime, filter, first, fromEvent, merge, race, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { defaultOptions } from '../config/default-options.const';
import { TooltipOptions } from '../config/options.interface';
import { TooltipOptionsService } from '../config/tooltip-options.service';
import { Placement } from '../types/placement.type';
import { TooltipEvent } from '../types/tooltip-event.type';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { TooltipDto } from '../tooltip/tooltip.dto';

export type ContentType = 'string' | 'html' | 'template';

@Directive()

export abstract class BaseTooltipDirective implements OnInit, OnDestroy {
	private readonly hostElementRef = inject(ElementRef<HTMLElement>);
	private readonly viewContainerRef = inject(ViewContainerRef);
	private readonly injector = inject(Injector);

	private readonly initOptions = inject(TooltipOptionsService, {
		optional: true
	});


	// Will be populated by child-directive
	private _tooltipContent!: string | SafeHtml | TemplateRef<any>;
	private _tooltipContext: any | undefined;

	private readonly tooltipContentType = signal<ContentType | undefined>(undefined);

	get contentType(): ContentType | undefined {
		return this.mergedOptions().contentType;
	}

	// Pass options as a single object:
	readonly options = input<TooltipOptions>({});

	readonly id = input<string | number | null>(null);
	readonly placement = input<Placement | null>(null);
	readonly autoPlacement = input<boolean | null>(null);
	readonly textColor = input<string | null>(null);
	readonly backgroundColor = input<string | null>(null);
	readonly borderColor = input<string | null>(null);
	readonly textAlign = input<'left' | 'center' | 'right' | null>(null);
	readonly padding = input<string | null>(null);
	readonly hideDelayTouchscreen = input<number | null>(null);
	readonly zIndex = input<number | null>(null);
	readonly animationDuration = input<number | null>(null);
	readonly trigger = input<'hover' | 'click' | null>(null);
	readonly tooltipClass = input<string | null>(null);
	readonly display = input<boolean | null>(null);
	readonly displayTouchscreen = input<boolean | null>(null);
	readonly shadow = input<boolean | null>(null);
	readonly offset = input<number | null>(null);
	readonly width = input<string | null>(null);
	readonly minWidth = input<string | null>(null);
	readonly maxWidth = input<string | null>(null);
	readonly showDelay = input<number | null>(null);
	readonly hideDelay = input<number | null>(null);
	readonly hideDelayAfterClick = input<number | null>(null);
	readonly pointerEvents = input<'auto' | 'none' | null>(null);
	readonly position = input<{ top: number; left: number } | null>(null);
	readonly appendTooltipToBody = input<boolean | null>(null);

	// A merge of all options that were passed in various ways:
	private readonly mergedOptions = computed<TooltipOptions>(() => ({
		...defaultOptions,
		...(this.initOptions || {}),
		...this.options(),
		...(this.id() != null ? { id: this.id()! } : {}),
		...(this.placement() != null ? { placement: this.placement()! } : {}),
		...(this.autoPlacement() != null ? { autoPlacement: this.autoPlacement()! } : {}),
		...(this.textColor() != null ? { textColor: this.textColor()! } : {}),
		...(this.backgroundColor() != null ? { backgroundColor: this.backgroundColor()! } : {}),
		...(this.borderColor() != null ? { borderColor: this.borderColor()! } : {}),
		...(this.textAlign() != null ? { textAlign: this.textAlign()! } : {}),
		...(this.padding() != null ? { padding: this.padding()! } : {}),
		...(this.hideDelayTouchscreen() != null ? { hideDelayTouchscreen: this.hideDelayTouchscreen()! } : {}),
		...(this.zIndex() != null ? { zIndex: this.zIndex()! } : {}),
		...(this.animationDuration() != null ? { animationDuration: this.animationDuration()! } : {}),
		...(this.trigger() != null ? { trigger: this.trigger()! } : {}),
		...(this.tooltipClass() != null ? { tooltipClass: this.tooltipClass()! } : {}),
		...(this.display() != null ? { display: this.display()! } : {}),
		...(this.displayTouchscreen() != null ? { displayTouchscreen: this.displayTouchscreen()! } : {}),
		...(this.shadow() != null ? { shadow: this.shadow()! } : {}),
		...(this.offset() != null ? { offset: this.offset()! } : {}),
		...(this.width() != null ? { width: this.width()! } : {}),
		...(this.minWidth() != null ? { minWidth: this.minWidth()! } : {}),
		...(this.maxWidth() != null ? { maxWidth: this.maxWidth()! } : {}),
		...(this.showDelay() != null ? { showDelay: this.showDelay()! } : {}),
		...(this.hideDelay() != null ? { hideDelay: this.hideDelay()! } : {}),
		...(this.hideDelayAfterClick() != null ? { hideDelayAfterClick: this.hideDelayAfterClick()! } : {}),
		...(this.pointerEvents() != null ? { pointerEvents: this.pointerEvents()! } : {}),
		...(this.position() != null ? { position: this.position()! } : {}),
		...(this.appendTooltipToBody() != null ? { appendTooltipToBody: this.appendTooltipToBody()! } : {}),
		...(this.tooltipContentType() != null ? { contentType: this.tooltipContentType()! } : {})
	}));


	@Output()
	events = new EventEmitter<TooltipEvent>();


	private refToTooltipComponent: ComponentRef<TooltipComponent> | undefined;
	private tooltipComponent: TooltipComponent | undefined;

	private isTooltipVisible = false;

	private get isTooltipComponentDestroyed(): boolean {
		return !this.refToTooltipComponent?.location.nativeElement.isConnected;
	}

	private get hostElementPosition(): { top: number, left: number } | DOMRect {
		return this.mergedOptions().position ?? this.hostElementRef.nativeElement.getBoundingClientRect();
	}

	private get isDisplayOnHover(): boolean {
		if (this.mergedOptions().display == false ||
			(this.mergedOptions().displayTouchscreen == false && this.isTouchScreen) ||
			this.mergedOptions().trigger !== 'hover') {
			return false;
		}
		return true;
	}

	private get isDisplayOnClick(): boolean {
		if (this.mergedOptions().display == false ||
			(this.mergedOptions().displayTouchscreen == false && this.isTouchScreen) ||
			this.mergedOptions().trigger != 'click') {
			return false;
		}
		return true;
	}

	private get isTouchScreen() {
		return ('ontouchstart' in window) || window.matchMedia('(any-pointer: coarse)').matches;
	}

	private clearTimeouts$ = new Subject<void>();
	private unsubscribeInputListeners$ = new Subject<void>();
	private destroy$ = new Subject<void>();

	ngOnInit(): void {
		this.subscribeToShowTriggers();
	}

	/* Will be called from child-directive */

	setTooltipContent(tooltipContent: string | SafeHtml | TemplateRef<any>, contentType: ContentType) {
		// Set user-inputs:
		this._tooltipContent = tooltipContent;
		this.tooltipContentType.set(contentType);
	}

	setTooltipContext(tooltipContext: any | undefined) {
		// Set user-inputs:
		this._tooltipContext = tooltipContext;
	}

	/* Public methods for library-users */

	public show() {
		this.showTooltip({ subscribeToAutomaticHideListeners: false });
	}

	public hide() {
		this.hideTooltip({ subscribeToAutomaticShowListeners: false });
	}

	private showFromTrigger() {
		this.showTooltip({ subscribeToAutomaticHideListeners: true });
	}

	private hideFromTrigger() {
		this.hideTooltip({ subscribeToAutomaticShowListeners: true });
	}

	private showTooltip(options: { subscribeToAutomaticHideListeners: boolean }) {
		if (this._tooltipContent && this.contentType) {
			// Stop all ongoing processes:
			this.clearTimeouts$.next();
			this.unsubscribeInputListeners$.next();

			if (this.tooltipComponent && !this.isTooltipComponentDestroyed) {
				this.setTooltipVisibility('visible');
				// Subscribe to input-events:
				if (options.subscribeToAutomaticHideListeners) {
					this.subscribeToHideTriggers();
					this.subscribeToResizeEvents();
				}
			}
			else {
				this.createTooltip({
					subscribeToAutomaticHideListeners: options.subscribeToAutomaticHideListeners
				});
			}
		}
	}

	private hideTooltip(options: { subscribeToAutomaticShowListeners: boolean }) {
		if (this.isTooltipVisible) {
			// Stop all ongoing processes:
			this.clearTimeouts$.next();
			this.unsubscribeInputListeners$.next();

			this.setTooltipVisibility('hidden');

			// Subscribe to input-events:
			if (options.subscribeToAutomaticShowListeners) {
				this.subscribeToShowTriggers();
			}
		}
	}


	/** Private library-Methods **/

	private subscribeToShowTriggers() {
		const raceObservables$ = [];

		if (this.isDisplayOnHover) {
			const mouseEnter$ = fromEvent<MouseEvent>(this.hostElementRef.nativeElement, 'mouseenter');
			const focusIn$ = fromEvent<FocusEvent>(this.hostElementRef.nativeElement, 'focusin');
			raceObservables$.push(mouseEnter$, focusIn$);
		}
		else if (this.isDisplayOnClick) {
			const clickOnHostElement$ = fromEvent(this.hostElementRef.nativeElement, 'click');
			raceObservables$.push(clickOnHostElement$);
		}

		if (raceObservables$.length === 0) { return; }

		race(raceObservables$)
			.pipe(
				switchMap(() => {
					this.clearTimeouts$.next();  // Cancel any ongoing hide tooltip actions
					return this.showTooltipAfterDelay(this.mergedOptions().showDelay ?? 0);
				}),
				takeUntil(merge(this.unsubscribeInputListeners$, this.destroy$))
			)
			.subscribe();
	}


	private subscribeToHideTriggers() {
		const raceObservables$ = [fromEvent(document, 'scroll')];

		if (this.isDisplayOnHover) {
			const mouseLeave$ = fromEvent<MouseEvent>(this.hostElementRef.nativeElement, 'mouseleave');
			const focusOut$ = fromEvent<FocusEvent>(this.hostElementRef.nativeElement, 'focusout');
			raceObservables$.push(mouseLeave$, focusOut$);
		}

		// Only add `clickOutside$` if it is defined
		if (this.tooltipComponent) {
			const clickOutsideTooltip$ = this.tooltipComponent.userClickOutsideTooltip$;
			raceObservables$.push(clickOutsideTooltip$);
		}

		race(raceObservables$)
			.pipe(
				switchMap(() => {
					this.clearTimeouts$.next();  // Cancel any ongoing show tooltip actions
					return this.hideTooltipAfterDelay(this.mergedOptions().hideDelay ?? 0);
				}),
				takeUntil(merge(this.unsubscribeInputListeners$, this.destroy$))
			)
			.subscribe();
	}


	/* The tooltip-position needs to be adjusted when user resizes the window */
	private subscribeToResizeEvents() {
		const resize$ = fromEvent(window, 'resize');

		merge(resize$)
			.pipe(
				// For 'auditTime' check the following stackoverflow-article:
				// 'Rxjs: How to use bufferTime while only triggering an emission when new values have arrived'
				auditTime(100),
				filter(() => this.isTooltipVisible && !!this.tooltipComponent),
				tap(() => {
					if (this.tooltipComponent) {
						this.tooltipComponent.hostElementPosition = this.hostElementPosition;
						const appendTooltipToBody = this.mergedOptions().appendTooltipToBody ?? defaultOptions.appendTooltipToBody!;
						const isFixedPosition = !appendTooltipToBody;
						this.tooltipComponent.setPosition(isFixedPosition);
					}
				}),
				takeUntil(merge(this.unsubscribeInputListeners$, this.destroy$))
			)
			.subscribe();
	}

	private createTooltip(options: { subscribeToAutomaticHideListeners: boolean }) {
		// Stop all ongoing processes:
		this.clearTimeouts$.next();

		timer(this.mergedOptions().showDelay ?? 0)
			.pipe(
				first(),
				takeUntil(merge(this.destroy$, this.clearTimeouts$)),
				tap(() => {
					const appendToTooltipBody = this.mergedOptions().appendTooltipToBody ?? defaultOptions.appendTooltipToBody!;
					this.appendTooltipToDomElement(appendToTooltipBody);
					this.setTooltipVisibility('visible');
					// Subscribe to input-events:
					if (options.subscribeToAutomaticHideListeners) {
						this.subscribeToHideTriggers();
						this.subscribeToResizeEvents();
					}
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private showTooltipAfterDelay(delayInMillis: number) {
		return timer(delayInMillis)
			.pipe(
				takeUntil(this.clearTimeouts$),
				tap(() => this.showFromTrigger())
			);
	}

	private hideTooltipAfterDelay(delayInMillis: number) {
		return timer(delayInMillis)
			.pipe(
				takeUntil(this.clearTimeouts$),
				tap(() => this.hideFromTrigger())
			);
	}

	private appendTooltipToDomElement(appendTooltipToBody: boolean): void {
		// Create the component using the ViewContainerRef.
		// This way the component is automatically added to the change detection cycle of the Angular application
		this.refToTooltipComponent = this.viewContainerRef.createComponent(TooltipComponent, { injector: this.injector });
		this.tooltipComponent = this.refToTooltipComponent.instance;
		this.tooltipComponent.hostPosition.set(appendTooltipToBody ? 'absolute' : 'fixed');

		if (!this.tooltipComponent) { return; }

		// Get the DOM element from the component's view.
		const domElemTooltip = (this.refToTooltipComponent.location.nativeElement as HTMLElement);

		// Get the host element from hostElementRef.
		const hostElem = this.hostElementRef.nativeElement;

		if (!appendTooltipToBody && !hostElem) {
			console.warn('Host element not found, appending to body instead.');
			document.body.appendChild(domElemTooltip); // fallback if host element is not available
		}
		else if (!appendTooltipToBody && hostElem) {
			// Append the DOM element (tooltip) to the host element instead of the body.
			hostElem.appendChild(domElemTooltip);
		}
		else {
			// Append the DOM element (tooltip) to the body since appendTooltipToBody is true.
			document.body.appendChild(domElemTooltip);
		}

		// Subscribe to events from the component.
		this.tooltipComponent?.visibilityChangeCompleted$
			.pipe(
				tap(({ type }) => {
					type === 'shown' && this.events.emit({ type: 'shown', position: this.hostElementPosition });
					type === 'hidden' && this.events.emit({ type: 'hidden', position: this.hostElementPosition });
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private setTooltipVisibility(targetVisibility: 'visible' | 'hidden'): void {

		if (targetVisibility === 'visible' && this.tooltipComponent && this._tooltipContent && this.contentType) {

			this.events.emit({ type: 'show', position: this.hostElementPosition });

			// Set the data property of the component instance
			const tooltipData: TooltipDto = this.assembleTooltipData();
			this.showTooltipOnHostComponent(tooltipData);
			this.isTooltipVisible = true;
		}
		else if (targetVisibility === 'hidden' && this.isTooltipVisible && !this.isTooltipComponentDestroyed) {

			this.events.emit({ type: 'hide', position: this.hostElementPosition });

			this.hideTooltipOnHostComponent();
			this.isTooltipVisible = false;
		}
	}

	private showTooltipOnHostComponent(tooltipData: TooltipDto) {
		if (this.tooltipComponent) {
			this.tooltipComponent.showTooltip(tooltipData);
		}
	}

	private hideTooltipOnHostComponent() {
		if (this.tooltipComponent) {
			this.tooltipComponent?.hideTooltip();
		}
	}

	private assembleTooltipData(): TooltipDto {
		return {
			tooltipStr: this.contentType === 'string' ? this._tooltipContent as string : undefined,
			tooltipHtml: this.contentType === 'html' ? this._tooltipContent : undefined,
			tooltipTemplate: this.contentType === 'template' ? this._tooltipContent as TemplateRef<any> : undefined,
			tooltipContext: this.contentType === 'template' ? this._tooltipContext : undefined,
			hostElement: this.hostElementRef.nativeElement,
			hostElementPosition: this.hostElementPosition,
			options: this.mergedOptions()
		};
	}

	private destroyTooltip(): void {
		this.clearTimeouts$?.next();
		this.destroy$?.next();

		if (!this.isTooltipComponentDestroyed && this.refToTooltipComponent) {
			const tooltipVisibleAtStart = this.isTooltipVisible;

			if (tooltipVisibleAtStart) {
				this.events.emit({ type: 'hide', position: this.hostElementPosition });
			}

			this.refToTooltipComponent?.destroy();

			if (tooltipVisibleAtStart) {
				this.events.emit({ type: 'hidden', position: this.hostElementPosition });
			}
		}

		this.tooltipComponent = undefined;
		this.refToTooltipComponent = undefined;
	}


	ngOnDestroy(): void {
		this.destroyTooltip();
		this.clearTimeouts$.unsubscribe();
		this.destroy$.unsubscribe();
	}
}
