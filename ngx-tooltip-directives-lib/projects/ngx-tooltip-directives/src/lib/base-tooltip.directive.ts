import { ApplicationRef, ComponentRef, Directive, ElementRef, EventEmitter, Inject, Injector, Input, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { auditTime, EMPTY, filter, first, fromEvent, map, merge, race, Subject, switchMap, takeUntil, tap, throttleTime, timer } from 'rxjs';
import { defaultOptions } from './default-options.const';
import { TooltipOptions } from './options.interface';
import { TooltipOptionsService } from './options.service';
import { Placement } from './placement.type';
import { TooltipComponent } from './tooltip.component';
import { TooltipDto } from './tooltip.dto';

export type ContentType = "string" | "html" | "template";

@Directive()

export abstract class BaseTooltipDirective implements OnInit, OnChanges, OnDestroy {

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


    @Output()
    events: EventEmitter<any> = new EventEmitter<any>();


    private refToTooltipComponent: ComponentRef<TooltipComponent> | undefined;
	private tooltipComponent: TooltipComponent | undefined;

    private isTooltipVisible = false;

    private get isTooltipComponentDestroyed(): boolean {        
		return !this.refToTooltipComponent?.location.nativeElement.isConnected;
    }

    private get hostElementPosition(): { top: number, left: number } | DOMRect {
        return this.mergedOptions.position ?? this.hostElementRef.nativeElement.getBoundingClientRect();
    }

    private get isDisplayOnHover(): boolean {
        if (this.mergedOptions.display == false ||
            (this.mergedOptions.displayTouchscreen == false && this.isTouchScreen) ||
            this.mergedOptions.trigger !== 'hover') {
            return false;
        }
        return true;
    }

    private get isDisplayOnClick(): boolean {
        if (this.mergedOptions.display == false ||
            (this.mergedOptions.displayTouchscreen == false && this.isTouchScreen) ||
            this.mergedOptions.trigger != 'click') {
            return false;
        }
        return true;
    }

    private get isTouchScreen() {
        return ('ontouchstart' in window) || window.matchMedia('(any-pointer: coarse)').matches;
    }

    private clearTimeouts$ = new Subject<void>();
	private destroy$ = new Subject<void>();

    constructor(
        @Optional() @Inject(TooltipOptionsService) private initOptions: TooltipOptions,
        private hostElementRef: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private appRef: ApplicationRef,
        private injector: Injector) {}


    ngOnInit(): void {
        // Map tooltip options:
        this.mergedOptions = this.getMergedTooltipOptions();
        // Initialize listeners that capture mouse-, click- and scroll-events
        this.initializeListeners();
    }

    ngOnChanges(changes: SimpleChanges) {
        // Map tooltip options:
        this.mergedOptions = this.getMergedTooltipOptions();
    }

    /* Will be called from child-directive */

    setTooltipContent(tooltipContent: string | SafeHtml | TemplateRef<any>, contentType: ContentType) {
        // Set user-inputs:
        this.tooltipContent = tooltipContent;
        this.collectedOptions.contentType = contentType;
    }

    private initializeListeners() {
        if (this.isDisplayOnClick) {
            this.listenToClickOnHostElement();
        }

        if (this.isDisplayOnHover) {
            this.listenToInteractions();
        }

        // The tooltip-position needs to be adjusted when user resizes the window:
        this.listenToResizeEvents();
    }

    /* Public methods for library-users */

	show() {
		if (this.tooltipContent && this.contentType) {

            if (this.tooltipComponent && !this.isTooltipComponentDestroyed) {
                this.showTooltip();
            }
            else {
                this.createTooltip();
            }                
        }
	}

	hide() {
        if (this.isTooltipVisible) {
            this.hideTooltip();
        }
	}


    /** Private library-Methods **/


    /* Reacts only in 'isDisplayOnClick'-mode */
    private listenToClicksOnTooltip(tooltipComponent: TooltipComponent) {        
		tooltipComponent.userClickOnTooltip$
			.pipe(
                filter(() => this.isDisplayOnClick && this.isTooltipVisible),
                tap(() => this.hideTooltip()),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

    /* Reacts only in 'isDisplayOnClick'-mode */
	private listenToClickOnHostElement() {
        fromEvent(this.hostElementRef.nativeElement, 'click')
            .pipe(
                // 'throttleTime' emits a value from the source observable,
                // then ignores subsequent source values for duration milliseconds, then repeats this process.
				throttleTime(200),
                filter(() => this.isDisplayOnClick),
                map(() => { 
                    if (this.isTooltipVisible) {
                        this.hideTooltip();
                        return false;
                    }
                    else {
                        this.show();
                        return true;
                    }
                }),
                filter((isAboutToDisplayTooltip: boolean) => isAboutToDisplayTooltip && 
                                                             !!this.mergedOptions.hideDelayAfterClick &&
                                                             this.mergedOptions.hideDelayAfterClick > 0),
                // Cancel pipe when further clicks on the host-element are made:
                switchMap(() => {
                    const obsHideTooltipAfterDelay = timer(this.mergedOptions.hideDelayAfterClick ?? 0)
                                                        .pipe(tap(() => this.hideTooltip()));  
                    // Make delay cancellable:                
                    // Executes obsHideTooltipAfterDelay, given clearTimeouts$ isn't called before hideDelay has elapsed:
                    return race(obsHideTooltipAfterDelay, this.clearTimeouts$);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe();
	}

    private listenToInteractions() {
        const mouseEnter$ = fromEvent<MouseEvent>(this.hostElementRef.nativeElement, 'mouseenter');
        const mouseLeave$ = fromEvent<MouseEvent>(this.hostElementRef.nativeElement, 'mouseleave');        
        const focusIn$ = fromEvent<FocusEvent>(this.hostElementRef.nativeElement, 'focusin');
        const focusOut$ = fromEvent<FocusEvent>(this.hostElementRef.nativeElement, 'focusout');
        const scroll$ = fromEvent(document, 'scroll');

        merge(mouseEnter$, mouseLeave$, focusIn$, focusOut$, scroll$)
            .pipe(
                filter((event) => this.isDisplayOnHover && (event instanceof MouseEvent || event.type === 'scroll')),
                switchMap((event: Event) => {

                    if (event.type === 'mouseenter' || event.type === 'focusin') {
                        this.clearTimeouts$.next();  // Cancel any ongoing hide tooltip actions
                        return this.showTooltipAfterDelay(this.mergedOptions.showDelay ?? 0);
                    }
                    else if (event.type === 'mouseleave' ||
                             event.type === 'focusout' ||
                             (this.isTooltipVisible && event.type === 'scroll')) {

                        this.clearTimeouts$.next();  // Cancel any ongoing show tooltip actions
                        return this.hideTooltipAfterDelay(this.mergedOptions.hideDelay ?? 0);
                    }
                    return EMPTY;  // Returns an empty observable when no action is needed
                }),
                takeUntil(this.destroy$)
            )
            .subscribe();
    }


    /* The tooltip-position needs to be adjusted when user resizes the window */
	private listenToResizeEvents() {
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
						this.tooltipComponent.setPosition();
					}
				}),
				takeUntil(this.destroy$),
			)
			.subscribe();
	}

    private createTooltip() {
		// Stop all ongoing processes:
		this.clearTimeouts$.next();

		timer(this.mergedOptions.showDelay ?? 0)
			.pipe(
				first(),
		  		takeUntil(this.destroy$ || this.clearTimeouts$),
		  		tap(() => {
					this.appendComponentToBody();
					this.showTooltip();
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

    private showTooltipAfterDelay(delayInMillis: number) {
        return timer(delayInMillis)
            .pipe(
                takeUntil(this.clearTimeouts$),
                tap(() => this.show())
            );
    }

    private hideTooltipAfterDelay(delayInMillis: number) {
        return timer(delayInMillis)
            .pipe(
                takeUntil(this.clearTimeouts$),
                tap(() => this.hideTooltip())
            );
    }

    private appendComponentToBody(): void {
        // Create the component using the ViewContainerRef.
        // This way the component is automatically added to the change detection cycle of the Angular application
        this.refToTooltipComponent = this.viewContainerRef.createComponent(TooltipComponent, { injector: this.injector });
        this.tooltipComponent = this.refToTooltipComponent.instance;

        // Attach tooltip-click listener:
        if (this.isDisplayOnClick) {
            this.listenToClicksOnTooltip(this.tooltipComponent);
        }

		if(!this.tooltipComponent) { return; }     
      
        // Get the DOM element from the component's view.
        const domElemTooltip = (this.refToTooltipComponent.location.nativeElement as HTMLElement);
      
        // Append the DOM element to the document body.
        document.body.appendChild(domElemTooltip);
      
    	// Subscribe to events from the component.
    	this.tooltipComponent?.events
			.pipe(
				takeUntil(this.destroy$),
				tap(eventType => {
					eventType === 'shown' && this.events.emit({ type: 'shown', position: this.hostElementPosition });
					eventType === 'hidden' && this.events.emit({ type: 'hidden', position: this.hostElementPosition });
				})
			)
            .subscribe();
    }

	private showTooltip(): void {
		if (this.tooltipComponent && this.tooltipContent && this.contentType) {
			// Stop all ongoing processes:
			this.clearTimeouts$.next();

            this.events.emit({ type: 'show', position: this.hostElementPosition });

            // Set the data property of the component instance
            const tooltipData: TooltipDto = {
                tooltipStr: this.contentType === 'string' ? this.tooltipContent as string : undefined,
                tooltipHtml: this.contentType === 'html' ? this.tooltipContent : undefined,
                tooltipTemplate: this.contentType === 'template' ? this.tooltipContent as TemplateRef<any> : undefined,
                hostElement: this.hostElementRef.nativeElement,
                hostElementPosition: this.hostElementPosition,
                options: this.mergedOptions
            };

			this.tooltipComponent.showTooltip(tooltipData);
			this.isTooltipVisible = true;
		}
	}

	private hideTooltip(): void {
		// Make sure no hiding-processes are ongoing:
		this.clearTimeouts$?.next();

    	if (this.isTooltipVisible && !this.isTooltipComponentDestroyed) {

			this.events.emit({ type: 'hide', position: this.hostElementPosition });

			this.tooltipComponent?.hideTooltip();
			this.isTooltipVisible = false;
    	}
	}

	private destroyTooltip(): void {
		this.clearTimeouts$?.next();
        this.destroy$?.next();

		if(!this.isTooltipComponentDestroyed && this.refToTooltipComponent) {
			const tooltipVisibleAtStart = this.isTooltipVisible;

			if (tooltipVisibleAtStart) {
				this.events.emit({ type: 'hide', position: this.hostElementPosition });
			}

            this.appRef.detachView(this.refToTooltipComponent.hostView);
            this.refToTooltipComponent.destroy();

			if (tooltipVisibleAtStart) {
				this.events.emit({ type: 'hidden', position: this.hostElementPosition })
			}
		}

		this.tooltipComponent = undefined;
		this.refToTooltipComponent = undefined;
	}

    private getMergedTooltipOptions(): TooltipOptions {
    	// Merge options: the priority order is as follows:        
		// 1. Individual options passed via @Input
		// 2. The options-object passed via @Input
        // 3. Options passed via module
		// 4. The default options
    	return Object.assign({}, defaultOptions, this.initOptions || {}, this.options, this.collectedOptions);
	}


	ngOnDestroy(): void {
		this.destroyTooltip();
		this.clearTimeouts$.unsubscribe();		
		this.destroy$.unsubscribe();
	}
}
