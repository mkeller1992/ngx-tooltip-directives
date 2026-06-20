import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { Component, inject, provideZonelessChangeDetection, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseTooltipDirective } from './base-tooltip.directive';
import { TooltipStrDirective } from './tooltip-str.directive';
import { TooltipHtmlDirective } from './tooltip-html.directive';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { TooltipOptions } from '../config/options.interface';
import { TooltipOptionsService } from '../config/tooltip-options.service';
import { TooltipTemplateDirective } from './tooltip-template.directive';
import { Subject } from 'rxjs';

describe('BaseTooltipDirective', () => {
	let fixtureStrTooltip: ComponentFixture<HostWithStrTooltipComponent>;
	let strTooltipDirectiveInstance: TooltipStrDirective;

	let fixtureHtmlTooltip: ComponentFixture<HostWithHtmlTooltipComponent>;
	let htmlTooltipDirectiveInstance: TooltipHtmlDirective;

	let fixtureTemplateTooltip: ComponentFixture<HostWithTemplateTooltipComponent>;
	let templateTooltipDirectiveInstance: TooltipTemplateDirective;

	let fixtureOptionsTooltip: ComponentFixture<HostWithTooltipWithOptionsComponent>;
	let optionsTooltipDirectiveInstance: TooltipStrDirective;

	beforeEach(async () => {

		await TestBed.configureTestingModule({
			imports: [
				HostWithStrTooltipComponent,
				HostWithHtmlTooltipComponent,
				HostWithTemplateTooltipComponent,
				HostWithTooltipWithOptionsComponent
			],
			providers: [provideZonelessChangeDetection()],
		})
			.compileComponents();

		fixtureStrTooltip = TestBed.createComponent(HostWithStrTooltipComponent);
		strTooltipDirectiveInstance = fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).injector.get(TooltipStrDirective);

		fixtureHtmlTooltip = TestBed.createComponent(HostWithHtmlTooltipComponent);
		htmlTooltipDirectiveInstance = fixtureHtmlTooltip.debugElement.query(By.directive(TooltipHtmlDirective)).injector.get(TooltipHtmlDirective);

		fixtureTemplateTooltip = TestBed.createComponent(HostWithTemplateTooltipComponent);
		templateTooltipDirectiveInstance = fixtureTemplateTooltip.debugElement.query(By.directive(TooltipTemplateDirective)).injector.get(TooltipTemplateDirective);

		fixtureOptionsTooltip = TestBed.createComponent(HostWithTooltipWithOptionsComponent);
		optionsTooltipDirectiveInstance = fixtureOptionsTooltip.debugElement.query(By.directive(TooltipStrDirective)).injector.get(TooltipStrDirective);
	});

	afterEach(() => {
		// Reset Vitest's timers to the real implementations after each test
		vi.useRealTimers();
	});

	describe('Initialization', () => {

		it('should inject options provided via ngModule and TooltipOptionsService', () => {
			/* Arrange */
			const customOptions: TooltipOptions = { placement: 'right', display: true };

			TestBed.resetTestingModule();

			TestBed.configureTestingModule({
				imports: [HostWithStrTooltipComponent],
				providers: [
					provideZonelessChangeDetection(),
					{ provide: TooltipOptionsService, useValue: customOptions }
				]
			}).compileComponents();

			const fixture = TestBed.createComponent(HostWithStrTooltipComponent);
			const dir = fixture.debugElement.query(By.directive(TooltipStrDirective)).injector.get(TooltipStrDirective);

			/* Act */
			fixture.detectChanges();

			/* Assert */
			const merged = (dir as any)['mergedOptions']();
			expect(merged.placement).toBe('right');
			expect(merged.display).toBe(true);
		});

		it('should call setTooltipContent with correct arguments when tooltipStr is set', () => {

			/* Arrange */
			const setTooltipContentSpy = vi.spyOn(BaseTooltipDirective.prototype, 'setTooltipContent');

			/* Act */
			fixtureStrTooltip.detectChanges();

			/* Assert */
			expect(setTooltipContentSpy).toHaveBeenCalledWith('Tooltip String Text', 'string');
		});

		it('should call setTooltipContent with correct arguments when tooltipHtml is set', () => {

			/* Arrange */
			const setTooltipContentSpy = vi.spyOn(BaseTooltipDirective.prototype, 'setTooltipContent');
			const expectedTooltipContent = { 'changingThisBreaksApplicationSecurity': '<div>This is a <strong>tooltip</strong> with HTML</div>' };

			/* Act */
			fixtureHtmlTooltip.detectChanges();

			/* Assert */
			expect(setTooltipContentSpy).toHaveBeenCalledWith(expectedTooltipContent, 'html');
		});

		it('should call setTooltipContent with correct arguments when tooltipTemplate is set', () => {

			/* Arrange */
			const setTooltipContentSpy = vi.spyOn(
				BaseTooltipDirective.prototype,
				'setTooltipContent'
			);

			const templateRef = fixtureTemplateTooltip.componentInstance.templateRef;

			/* Act */
			fixtureTemplateTooltip.detectChanges();

			/* Assert */
			expect(setTooltipContentSpy).toHaveBeenCalledWith(templateRef, 'template');
		});

		it('should initialize tooltip with correct options', () => {

			/* Arrange */
			vi.spyOn(optionsTooltipDirectiveInstance as any, 'isTouchScreen', 'get').mockReturnValue(true);

			/* Act */
			fixtureOptionsTooltip.detectChanges();

			/* Assert */
			const mergedOptions = optionsTooltipDirectiveInstance['mergedOptions']();
			expect(mergedOptions.id).toBe(3);
			expect(mergedOptions.placement).toBe('left');
			expect(mergedOptions.autoPlacement).toBe(false);
			expect(mergedOptions.textColor).toBe('red');
			expect(mergedOptions.backgroundColor).toBe('yellow');
			expect(mergedOptions.borderColor).toBe('black');
			expect(mergedOptions.textAlign).toBe('right');
			expect(mergedOptions.padding).toBe('5px 8px');
			expect(mergedOptions.hideDelayTouchscreen).toBe(11);
			expect(mergedOptions.zIndex).toBe(1500);
			expect(mergedOptions.animationDuration).toBe(22);
			expect(mergedOptions.trigger).toBe('click');
			expect(mergedOptions.tooltipClass).toBe('custom-class');
			expect(mergedOptions.display).toBe(false);
			expect(mergedOptions.displayTouchscreen).toBe(true);
			expect(mergedOptions.shadow).toBe(true);
			expect(mergedOptions.offset).toBe(20);
			expect(mergedOptions.width).toBe('120px');
			expect(mergedOptions.minWidth).toBe('80px');
			expect(mergedOptions.maxWidth).toBe('150px');
			expect(mergedOptions.showDelay).toBe(333);
			expect(mergedOptions.hideDelay).toBe(222);
			expect(mergedOptions.hideDelayAfterClick).toBe(111);
			expect(mergedOptions.pointerEvents).toBe('none');
			expect(mergedOptions.position).toEqual({ top: 23, left: 25 });
			expect(mergedOptions.appendTooltipToBody).toBe(true);
		});


		it('should initialize correct listeners when isDisplayOnHover is set', () => {

			/* Arrange */
			const subscribeToShowTriggersSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'subscribeToShowTriggers');
			const subscribeToResizeEventsSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');

			// Mock return-values of the getters 'isDisplayOnHover()' and 'isDisplayOnClick()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(false);

			/* Act */
			fixtureStrTooltip.detectChanges();

			/* Assert */
			expect(subscribeToShowTriggersSpy).toHaveBeenCalledTimes(1);
			expect(subscribeToResizeEventsSpy).toHaveBeenCalledTimes(0);
		});

		it('should initialize correct listeners when isDisplayOnClick is set', () => {

			/* Arrange */
			const subscribeToShowTriggersSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'subscribeToShowTriggers');
			const subscribeToResizeEventsSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');

			// Mock return-values of the getters 'isDisplayOnHover()' and 'isDisplayOnClick()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(false);
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(true);

			/* Act */
			fixtureStrTooltip.detectChanges();

			/* Assert */
			expect(subscribeToShowTriggersSpy).toHaveBeenCalledTimes(1);
			expect(subscribeToResizeEventsSpy).toHaveBeenCalledTimes(0);
		});

		it('isDisplayOnClick returns true only when display=true, displayTouchscreen=true and trigger="click"', () => {
			/* Arrange */
			const dir = strTooltipDirectiveInstance;

			// Force touchscreen = false to avoid interference
			vi.spyOn(dir as any, 'isTouchScreen', 'get').mockReturnValue(false);

			vi.spyOn(dir as any, 'mergedOptions').mockReturnValue({
				display: true,
				displayTouchscreen: true,
				trigger: 'click'
			});

			/* Act + Assert */
			expect((dir as any).isDisplayOnClick).toBe(true);
		});

		it('isTouchScreen detects coarse pointers via matchMedia', () => {

			/* Arrange */
			const dir = strTooltipDirectiveInstance;

			// Mock matchMedia
			window.matchMedia = vi.fn().mockReturnValue({ matches: true });

			vi.spyOn(dir as any, 'isTouchScreen', 'get').mockRestore(); // ensure real getter

			/* Act + Assert */
			expect((dir as any).isTouchScreen).toBe(true);
		});

		it('isTouchScreen detects touchstart capability', () => {

			/* Arrange */
			const dir = strTooltipDirectiveInstance;

			// Simulate "ontouchstart" in window
			(window as any).ontouchstart = () => {};

			/* Act + Assert */
			expect((dir as any).isTouchScreen).toBe(true);

			delete (window as any).ontouchstart; // cleanup
		});

		it('appendTooltipToDomElement appends to body and warns when host element is missing', () => {

			/* Arrange */
			const dir = strTooltipDirectiveInstance;

			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// Tooltip element
			const tooltipEl = document.createElement('div');

			// Fake event stream
			const visibility$ = new Subject<{ type: string }>();

			// Fake tooltip component
			const fakeTooltipComponent = {
				hostPosition: { set: vi.fn() },
				visibilityChangeCompleted$: visibility$
			};

			// Fake ComponentRef
			const fakeComponentRef = {
				instance: fakeTooltipComponent,
				location: { nativeElement: tooltipEl },
				destroy: vi.fn()
			};

			// Fake dependencies
			(dir as any).hostElementRef = { nativeElement: null };

			(dir as any).viewContainerRef = {
				createComponent: () => fakeComponentRef
			};

			// Required so cleanup doesn't crash
			(dir as any).refToTooltipComponent = fakeComponentRef;
			(dir as any).tooltipComponent = fakeTooltipComponent;

			/* Act */
			(dir as any).appendTooltipToDomElement(false);

			/* Assert */
			expect(warnSpy).toHaveBeenCalled();
			expect(document.body.contains(tooltipEl)).toBe(true);

			warnSpy.mockRestore();
		});

		it('appendTooltipToDomElement appends tooltip element to host when appendTooltipToBody=false', () => {
			const dir = strTooltipDirectiveInstance;

			// Fake host element
			const host = document.createElement('div');
			(dir as any).hostElementRef = { nativeElement: host };

			// Tooltip element
			const tooltipEl = document.createElement('div');

			// Fake event stream
			const visibility$ = new Subject<{ type: string }>();

			// Fake tooltip component
			const fakeTooltipComponent = {
				hostPosition: { set: vi.fn() },
				visibilityChangeCompleted$: visibility$
			};

			// Fake ComponentRef
			const fakeComponentRef = {
				instance: fakeTooltipComponent,
				location: { nativeElement: tooltipEl },
				destroy: vi.fn()
			};

			// Provide fake viewContainerRef
			(dir as any).viewContainerRef = {
				createComponent: () => fakeComponentRef
			};

			// Required so Angular cleanup doesn't crash
			(dir as any).refToTooltipComponent = fakeComponentRef;
			(dir as any).tooltipComponent = fakeTooltipComponent;

			// Act
			(dir as any).appendTooltipToDomElement(false);

			// Assert
			expect(host.contains(tooltipEl)).toBe(true);
		});
	});



	describe('Show and modify tooltips', () => {

		it('should trigger re-positioning of tooltip when user resizes window', () => {

			/* Arrange */
			vi.useFakeTimers();

			strTooltipDirectiveInstance['tooltipComponent'] = {
				setPosition(isFixedPosition: boolean) {}
			} as TooltipComponent;

			const subscribeToResizeEventsSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');
			const setPositionOnTooltipComponentSpy = vi.spyOn(strTooltipDirectiveInstance['tooltipComponent'], 'setPosition');
			strTooltipDirectiveInstance['isTooltipVisible'] = true;
			(strTooltipDirectiveInstance as any).subscribeToResizeEvents();

			/* Act */
			fixtureStrTooltip.detectChanges();
			const resizeEvent = new Event('resize');
			window.dispatchEvent(resizeEvent);
			vi.advanceTimersByTime(100);

			/* Assert */
			expect(subscribeToResizeEventsSpy).toHaveBeenCalledTimes(1);
			expect(setPositionOnTooltipComponentSpy).toHaveBeenCalledTimes(1);
		});

		it('should call showTooltipAfterDelay on mouseenter', () => {

			/* Arrange */
			const showTooltipAfterDelaySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'showTooltipAfterDelay');

			/* Act */
			fixtureStrTooltip.detectChanges();
			const mouseEnterEvent = new MouseEvent('mouseenter');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseEnterEvent);

			/* Assert */
			expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
		});

		it('should call showTooltipAfterDelay on focusin', () => {

			/* Arrange */
			const showTooltipAfterDelaySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'showTooltipAfterDelay');

			/* Act */
			fixtureStrTooltip.detectChanges();
			const focusInEvent = new MouseEvent('focusin');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusInEvent);

			/* Assert */
			expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
		});

		it('should subscribe to correct listeners when tooltip gets displayed for the second time', () => {

			/* Arrange */
			vi.useFakeTimers();
			// Mock return-values of the getter 'isDisplayOnHover()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(false);

			/* Act */
			fixtureStrTooltip.detectChanges();
			const focusInEvent = new MouseEvent('focusin');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusInEvent);
			vi.advanceTimersByTime(1);
			const focusOutEvent = new MouseEvent('focusout');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusOutEvent);
			vi.advanceTimersByTime(1);

			/* Arrange */
			const showTooltipAfterDelaySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'showTooltipAfterDelay');
			const setTooltipVisibilitySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const subscribeToHideTriggersSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'subscribeToHideTriggers');
			const subscribeToResizeEventsSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');

			/* Act */
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusInEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(showTooltipAfterDelaySpy).toHaveBeenCalledTimes(1);
			expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledWith('visible');
			expect(subscribeToHideTriggersSpy).toHaveBeenCalledTimes(1);
			expect(subscribeToResizeEventsSpy).toHaveBeenCalledTimes(1);
		});

		it('should trigger show() on first user-click when isDisplayOnClick is set', () => {

			/* Arrange */
			vi.useFakeTimers();
			const showSpy = vi.spyOn(strTooltipDirectiveInstance, 'show');

			// Mock return-values of the getters 'isDisplayOnHover()' and 'isDisplayOnClick()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(false);
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(true);

			/* Act */
			fixtureStrTooltip.detectChanges();
			const clickEvent = new Event('click');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(clickEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(showSpy).toHaveBeenCalledTimes(1);
			expect(showSpy).toHaveBeenCalledWith(false);
		});

		it('should create and show correct tooltip-string when mouse enters element with tooltip', () => {

			/* Arrange */
			vi.useFakeTimers();

			const createTooltipSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'createTooltip');
			const appendTooltipToDomElement = vi.spyOn(strTooltipDirectiveInstance as any, 'appendTooltipToDomElement');
			const setTooltipVisibilitySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const showTooltipOnHostComponentSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'showTooltipOnHostComponent');

			/* Act */

			fixtureStrTooltip.detectChanges();
			const mouseEnterEvent = new MouseEvent('mouseenter');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseEnterEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(createTooltipSpy).toHaveBeenCalledTimes(1);
			expect(appendTooltipToDomElement).toHaveBeenCalledTimes(1);
			expect(strTooltipDirectiveInstance['tooltipComponent']).toBeDefined();
			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledWith('visible');

			expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(true);
			expect(showTooltipOnHostComponentSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					tooltipStr: 'Tooltip String Text',
					tooltipHtml: undefined,
					tooltipTemplate: undefined
				})
			);
		});

		it('should create and show correct tooltip-html when mouse enters element with tooltip', () => {

			/* Arrange */
			vi.useFakeTimers();

			const createTooltipSpy = vi.spyOn(htmlTooltipDirectiveInstance as any, 'createTooltip');
			const appendTooltipToDomElement = vi.spyOn(htmlTooltipDirectiveInstance as any, 'appendTooltipToDomElement');
			const setTooltipVisibilitySpy = vi.spyOn(htmlTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const showTooltipOnHostComponentSpy = vi.spyOn(htmlTooltipDirectiveInstance as any, 'showTooltipOnHostComponent');
			const expectedTooltipContent = { 'changingThisBreaksApplicationSecurity': '<div>This is a <strong>tooltip</strong> with HTML</div>' };

			/* Act */
			fixtureHtmlTooltip.detectChanges();
			const mouseEnterEvent = new MouseEvent('mouseenter');
			fixtureHtmlTooltip.debugElement.query(By.directive(TooltipHtmlDirective)).nativeElement.dispatchEvent(mouseEnterEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(createTooltipSpy).toHaveBeenCalledTimes(1);
			expect(appendTooltipToDomElement).toHaveBeenCalledTimes(1);
			expect(htmlTooltipDirectiveInstance['tooltipComponent']).toBeDefined();
			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledWith('visible');

			expect(htmlTooltipDirectiveInstance['isTooltipVisible']).toBe(true);
			expect(showTooltipOnHostComponentSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					tooltipStr: undefined,
					tooltipHtml: expectedTooltipContent,
					tooltipTemplate: undefined
				})
			);
		});

		it('should create and show correct tooltip-template when mouse enters element with tooltip', () => {

			/* Arrange */
			vi.useFakeTimers();

			const createTooltipSpy = vi.spyOn(templateTooltipDirectiveInstance as any, 'createTooltip');
			const appendTooltipToDomElement = vi.spyOn(templateTooltipDirectiveInstance as any, 'appendTooltipToDomElement');
			const setTooltipVisibilitySpy = vi.spyOn(templateTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const showTooltipOnHostComponentSpy = vi.spyOn(templateTooltipDirectiveInstance as any, 'showTooltipOnHostComponent');

			const expectedTemplate = fixtureTemplateTooltip.componentInstance.templateRef;
			const expectedContext = fixtureTemplateTooltip.componentInstance.context;

			/* Act */
			fixtureTemplateTooltip.detectChanges();
			const mouseEnterEvent = new MouseEvent('mouseenter');
			fixtureTemplateTooltip.debugElement
				.query(By.directive(TooltipTemplateDirective))
				.nativeElement.dispatchEvent(mouseEnterEvent);

			vi.advanceTimersByTime(1);

			/* Assert */
			expect(createTooltipSpy).toHaveBeenCalledTimes(1);
			expect(appendTooltipToDomElement).toHaveBeenCalledTimes(1);
			expect(templateTooltipDirectiveInstance['tooltipComponent']).toBeDefined();

			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledWith('visible');

			expect(templateTooltipDirectiveInstance['isTooltipVisible']).toBe(true);

			expect(showTooltipOnHostComponentSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					tooltipStr: undefined,
					tooltipHtml: undefined,
					tooltipTemplate: expectedTemplate,
					tooltipContext: expectedContext
				})
			);
		});

		it('appendTooltipToDomElement forwards shown/hidden events', () => {
			/* Arrange */
			const dir = strTooltipDirectiveInstance;

			const tooltipEl = document.createElement('div');

			const fakeVisibility$ = new Subject<{ type: string }>();

			(dir as any).hostElementRef = { nativeElement: document.createElement('div') };

			// Fake ComponentRef
			const fakeComponentRef = {
				instance: {
					visibilityChangeCompleted$: fakeVisibility$,
					hostPosition: { set: vi.fn() }
				},
				location: { nativeElement: tooltipEl },
				destroy: vi.fn()
			};

			(dir as any).viewContainerRef = {
				createComponent: () => fakeComponentRef
			};

			// Required so ngOnDestroy doesn't crash the test runner
			(dir as any).refToTooltipComponent = fakeComponentRef;
			(dir as any).tooltipComponent = fakeComponentRef.instance;

			const emitSpy = vi.spyOn(dir.events, 'emit');

			/* Act */
			(dir as any).appendTooltipToDomElement(true);

			fakeVisibility$.next({ type: 'shown' });
			fakeVisibility$.next({ type: 'hidden' });

			/* Assert */
			expect(emitSpy).toHaveBeenCalledWith({
				type: 'shown',
				position: expect.any(Object)
			});

			expect(emitSpy).toHaveBeenCalledWith({
				type: 'hidden',
				position: expect.any(Object)
			});
		});
	});



	describe('Hide tooltips', () => {

		it('should hide tooltip on mouseleave', () => {

			/* Arrange */
			vi.useFakeTimers();

			const hideTooltipAfterDelaySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
			const setTooltipVisibilitySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const hideTooltipOnHostComponentSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');

			strTooltipDirectiveInstance['isTooltipVisible'] = true;
			// Force getter 'isTooltipComponentDestroyed()' to return false:
			vi.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
			// Mock return-values of the getter 'isDisplayOnHover()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);

			/* Act */
			(strTooltipDirectiveInstance as any).subscribeToHideTriggers();
			fixtureStrTooltip.detectChanges();
			const mouseLeaveEvent = new MouseEvent('mouseleave');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseLeaveEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledWith('hidden');
			expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
			expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
		});

		it('should hide tooltip on focusout', () => {

			/* Arrange */
			vi.useFakeTimers();

			const hideTooltipAfterDelaySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
			const setTooltipVisibilitySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const hideTooltipOnHostComponentSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');

			strTooltipDirectiveInstance['isTooltipVisible'] = true;
			// Force getter 'isTooltipComponentDestroyed()' to return false:
			vi.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
			// Mock return-values of the getter 'isDisplayOnHover()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);

			/* Act */
			(strTooltipDirectiveInstance as any).subscribeToHideTriggers();
			fixtureStrTooltip.detectChanges();
			const focusOutEvent = new MouseEvent('focusout');
			fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusOutEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
			expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
		});

		it('should hide tooltip on scroll when displayOnHover is set', () => {

			/* Arrange */
			vi.useFakeTimers();

			const hideTooltipAfterDelaySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
			const setTooltipVisibilitySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const hideTooltipOnHostComponentSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');

			strTooltipDirectiveInstance['isTooltipVisible'] = true;
			// Force getter 'isTooltipComponentDestroyed()' to return false:
			vi.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
			// Mock return-values of the getter 'isDisplayOnHover()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(false);

			/* Act */
			(strTooltipDirectiveInstance as any).subscribeToHideTriggers();
			fixtureStrTooltip.detectChanges();
			const scrollEvent = new Event('scroll');
			document.dispatchEvent(scrollEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
			expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
		});

		it('should hide tooltip on scroll when displayOnClick is set', () => {

			/* Arrange */
			vi.useFakeTimers();

			const hideTooltipAfterDelaySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
			const setTooltipVisibilitySpy = vi.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
			const hideTooltipOnHostComponentSpy = vi.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');

			strTooltipDirectiveInstance['isTooltipVisible'] = true;
			// Force getter 'isTooltipComponentDestroyed()' to return false:
			vi.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
			// Mock return-values of the getter 'isDisplayOnHover()'
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(false);
			vi.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(true);

			/* Act */
			(strTooltipDirectiveInstance as any).subscribeToHideTriggers();
			fixtureStrTooltip.detectChanges();
			const scrollEvent = new Event('scroll');
			document.dispatchEvent(scrollEvent);
			vi.advanceTimersByTime(1);

			/* Assert */
			expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
			expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
			expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
			expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
		});
	});

});


/** Mock Components ***/

@Component({
	standalone: true,
	imports: [TooltipStrDirective],
	template: `
		<button type="button" [tooltipStr]="'Tooltip String Text'">
			Button with string tooltip
		</button>
	`
})
class HostWithStrTooltipComponent {}

@Component({
	standalone: true,
	imports: [TooltipHtmlDirective],
	template: `
		<button type="button" [tooltipHtml]="safeTooltipHtml">
			Button with Html Tooltip
		</button>
	`
})
class HostWithHtmlTooltipComponent {
	private readonly sanitizer = inject(DomSanitizer);

	tooltipHtml = '<div>This is a <strong>tooltip</strong> with HTML</div>';
	safeTooltipHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.tooltipHtml);
}

@Component({
	standalone: true,
	imports: [TooltipTemplateDirective],
	template: `
		<ng-template #templateRef>Initial Tooltip</ng-template>

		<div
			[tooltipTemplate]="templateRef"
			[tooltipContext]="context">
		</div>
	`
})
class HostWithTemplateTooltipComponent {
	@ViewChild('templateRef', { static: true })
	templateRef!: TemplateRef<any>;

	context: any = { initial: true };
}

@Component({
	standalone: true,
	imports: [TooltipStrDirective],
	template: `
		<button type="button"
			[tooltipStr]="'Tooltip String Text'"
			[id]="3"
			[placement]="'left'"
			[autoPlacement]="false"
			[textColor]="'red'"
			[backgroundColor]="'yellow'"
			[borderColor]="'black'"
			[textAlign]="'right'"
			[padding]="'5px 8px'"
			[hideDelayTouchscreen]="11"
			[zIndex]="1500"
			[animationDuration]="22"
			[trigger]="'click'"
			[tooltipClass]="'custom-class'"
			[display]="false"
			[displayTouchscreen]="true"
			[shadow]="true"
			[offset]="20"
			[width]="'120px'"
			[minWidth]="'80px'"
			[maxWidth]="'150px'"
			[showDelay]="333"
			[hideDelay]="222"
			[hideDelayAfterClick]="111"
			[pointerEvents]="'none'"
			[position]="{ top: 23, left: 25 }"
			[appendTooltipToBody]="true">
			Button with string tooltip
		</button>
	`
})
class HostWithTooltipWithOptionsComponent {}
