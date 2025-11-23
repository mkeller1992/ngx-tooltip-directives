import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { TooltipDto } from './tooltip.dto';
import { defaultOptions } from './default-options.const';

// Mock ElementRef for component
const mockElementRef = { nativeElement: document.createElement('div') };

// Deterministic requestAnimationFrame
let rafSpy: jest.SpyInstance<number, [(ts: number) => void]>;

function mockRequestAnimationFrame() {
	rafSpy = jest
		.spyOn(window, 'requestAnimationFrame')
		.mockImplementation(cb => setTimeout(() => cb(Date.now()), 0) as unknown as number);
}

function restoreRequestAnimationFrame() { rafSpy.mockRestore(); }

function flushRAF() { jest.advanceTimersByTime(0); }

describe('TooltipComponent', () => {
	let fixture: ComponentFixture<TooltipComponent>;
	let component: TooltipComponent;
	let hostEl: HTMLElement;

	// Enable fake timers globally for the entire suite
	beforeAll(() => {
		jest.useFakeTimers();
		mockRequestAnimationFrame();
	});

	afterAll(() => restoreRequestAnimationFrame());

	beforeEach(async () => {
		await TestBed.configureTestingModule({
		imports: [TooltipComponent],
		providers: [
			provideZonelessChangeDetection(),
			{ provide: ElementRef, useValue: mockElementRef }
		]
		}).compileComponents();

		fixture = TestBed.createComponent(TooltipComponent);
		component = fixture.componentInstance;
		hostEl = fixture.nativeElement;

		// Mock size so positioning logic works
		Object.defineProperty(hostEl, 'clientWidth', { value: 50 });
		Object.defineProperty(hostEl, 'clientHeight', { value: 20 });

		fixture.detectChanges();
	});

	// ----------------------------------------------------------------
	//  BASIC CREATION
	// ----------------------------------------------------------------

	it('creates the component', () => {
		expect(component).toBeTruthy();
	});

	// ----------------------------------------------------------------
	//  SHOW / HIDE
	// ----------------------------------------------------------------

	it('showTooltip(): applies classes, placement and renders string content', () => {
		const dto: TooltipDto = {
		tooltipStr: 'Hello Tooltip',
		hostElement: document.createElement('div'),
		hostElementPosition: { top: 5, left: 5 },
		options: { ...defaultOptions, placement: 'left' }
		};

		component.showTooltip(dto);
		flushRAF();
		fixture.detectChanges();

		expect(hostEl.className).toContain('tooltip');
		expect(hostEl.className).toContain('show');
		expect(hostEl.className).toContain('tooltip-left');

		const label = hostEl.querySelector('.tooltip-label') as HTMLDivElement;
		expect(label?.textContent?.trim()).toBe('Hello Tooltip');
	});

	it('hideTooltip(): switches from "show" to "hide"', () => {
		component.showTooltip({
		tooltipStr: 'x',
		hostElement: document.createElement('div'),
		hostElementPosition: { top: 0, left: 0 },
		options: { ...defaultOptions }
		});

		flushRAF();
		fixture.detectChanges();

		expect(hostEl.classList.contains('show')).toBe(true);

		component.hideTooltip();
		fixture.detectChanges();

		expect(hostEl.classList.contains('hide')).toBe(true);
		expect(hostEl.classList.contains('show')).toBe(false);
	});

	// ----------------------------------------------------------------
	//  STYLE OPTIONS
	// ----------------------------------------------------------------

	it('applies style options (zIndex, pointerEvents, CSS vars, custom classes)', () => {
		const dto: TooltipDto = {
		tooltipStr: 'styled',
		hostElement: document.createElement('div'),
		hostElementPosition: { top: 10, left: 20 },
		options: {
			...defaultOptions,
			placement: 'bottom',
			zIndex: 9000,
			pointerEvents: 'none',
			animationDuration: 333,
			textColor: '#abc',
			tooltipClass: 'extra-x extra-y'
		}
		};

		component.showTooltip(dto);
		flushRAF();
		fixture.detectChanges();

		expect(hostEl.classList.contains('tooltip-bottom')).toBe(true);
		expect(hostEl.classList.contains('extra-x')).toBe(true);
		expect(hostEl.classList.contains('extra-y')).toBe(true);

		const s = hostEl.getAttribute('style') || '';
		expect(s).toContain('z-index: 9000');
		expect(s).toContain('pointer-events: none');
		expect(s).toContain('--transition-time: 333ms');
		expect(s).toContain('--tooltip-text-color: #abc');
	});

	// ----------------------------------------------------------------
	//  TRANSITION EVENTS
	// ----------------------------------------------------------------

	it('emits "shown" and "hidden" on opacity transitionend', () => {
		const seen: string[] = [];
		const sub = component.visibilityChangeCompleted$.subscribe(e => seen.push(e.type));

		(component as any)._state.set('show');
		const evShown = new Event('transitionend') as any;
		evShown.propertyName = 'opacity';
		hostEl.dispatchEvent(evShown);

		(component as any)._state.set('hide');
		const evHidden = new Event('transitionend') as any;
		evHidden.propertyName = 'opacity';
		hostEl.dispatchEvent(evHidden);

		expect(seen).toEqual(['shown', 'hidden']);
		sub.unsubscribe();
	});

	// ----------------------------------------------------------------
	//  POSITIONING
	// ----------------------------------------------------------------

	it('showTooltip(): triggers setPosition() inside requestAnimationFrame', () => {
		const spy = jest.spyOn(component as any, 'setPosition');

		component.showTooltip({
			tooltipStr: 'x',
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 10, left: 10 },
			options: { ...defaultOptions, appendTooltipToBody: true }
		});

		flushRAF();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('produces numeric px values for hostStyleTop/Left after showTooltip()', () => {
		component.showTooltip({
			tooltipStr: 'pos',
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 42, left: 24 },
			options: { ...defaultOptions, placement: 'right' }
		});

		flushRAF();
		fixture.detectChanges();

		const topVal = (component as any).hostStyleTop;
		const leftVal = (component as any).hostStyleLeft;

		expect(topVal.endsWith('px')).toBe(true);
		expect(leftVal.endsWith('px')).toBe(true);

		expect(isNaN(parseFloat(topVal))).toBe(false);
		expect(isNaN(parseFloat(leftVal))).toBe(false);
	});

  	it('setPosition(): switches to fallback placement when tooltip would not be visible with primary placement', () => {
		jest.useFakeTimers();

		const initialPlacement = 'bottom';
		const expectedFallback = 'right';

		// First placement check → invisible
		const spyVisible = jest
			.spyOn(component as any, 'isPlacementInsideVisibleArea')
			.mockReturnValueOnce(false)
			.mockReturnValue(true);

		component.showTooltip({
			tooltipStr: 'x',
			hostElement: { offsetHeight: 20, offsetWidth: 20 } as any,
			hostElementPosition: { top: 0, left: 0 },
			options: { ...defaultOptions, autoPlacement: true, placement: initialPlacement }
		});

		flushRAF();
		jest.runOnlyPendingTimers(); 
		fixture.detectChanges();

		expect(spyVisible).toHaveBeenCalledTimes(2);

		// The final placement must NOT be 'left'
		const finalPlacement = (component as any)._placement();
		expect(finalPlacement).not.toBe(initialPlacement);

		// 'right' is the first fallback in the priority array (after 'bottom' fails)
		expect(finalPlacement).toBe(expectedFallback);
  	});

	it('setPosition(): omits checking for fallback-placements when tooltip is visible with primary placement', () => {
		jest.useFakeTimers();

		const initialPlacement = 'bottom';

		// First placement check → invisible
		const spyVisible = jest
			.spyOn(component as any, 'isPlacementInsideVisibleArea')
			.mockReturnValueOnce(true)
			.mockReturnValue(false);

		component.showTooltip({
			tooltipStr: 'x',
			hostElement: { offsetHeight: 20, offsetWidth: 20 } as any,
			hostElementPosition: { top: 0, left: 0 },
			options: { ...defaultOptions, autoPlacement: true, placement: initialPlacement }
		});

		flushRAF();
		jest.runOnlyPendingTimers(); 
		fixture.detectChanges();

		// Method 'isPlacementInsideVisibleArea()' must only be called once:
		expect(spyVisible).toHaveBeenCalledTimes(1);

		// The final placement must equal the initial placement
		const finalPlacement = (component as any)._placement();
		expect(finalPlacement).toBe(initialPlacement);
  	});

	it('setPlacementStyles(): updates placement + coordinates', () => {
		const s = {
			placement: 'right',
			topStyle: 100,
			leftStyle: 200,
			tooltipHeight: 0,
			tooltipWidth: 0,
			clientWidth: 0,
			adjustScrollY: 0
		};

		(component as any).setPlacementStyles(s);

		expect((component as any)._placement()).toBe('right');
		expect((component as any)._hostStyleTop()).toBe(100);
		expect((component as any)._hostStyleLeft()).toBe(200);
	});

	it('calculateTooltipStylesForPlacement(): returns valid numeric coordinates', () => {
		const host = document.createElement('div');
		Object.defineProperty(host, 'offsetWidth', { value: 40 });
		Object.defineProperty(host, 'offsetHeight', { value: 20 });

		component.showTooltip({
			tooltipStr: 'x',
			hostElement: host,
			hostElementPosition: { top: 30, left: 40 },
			options: defaultOptions
		});
		flushRAF();

		const r = (component as any).calculateTooltipStylesForPlacement('bottom', false);

		expect(typeof r.topStyle).toBe('number');
		expect(typeof r.leftStyle).toBe('number');
		expect(r.placement).toBe('bottom');
	});

	it('isPlacementInsideVisibleArea(): detects inside/outside correctly', () => {
		const s = {
			placement: 'bottom',
			topStyle: 10,
			leftStyle: 10,
			tooltipHeight: 50,
			tooltipWidth: 100,
			clientWidth: window.innerWidth,
			adjustScrollY: 0
		};

		expect((component as any).isPlacementInsideVisibleArea(s, true)).toBe(true);

		s.leftStyle = -500;
		expect((component as any).isPlacementInsideVisibleArea(s, true)).toBe(false);
	});

	// ----------------------------------------------------------------
	//  OUTSIDE CLICK HANDLING
	// ----------------------------------------------------------------

	it('emits click event only when clicking outside the tooltip', () => {
		const seen: MouseEvent[] = [];
		component.userClickOutsideTooltip$.subscribe(e => seen.push(e));

		// create an element OUTSIDE the tooltip
		const outside = document.createElement('div');
		document.body.appendChild(outside);

		// inside → ignored
		hostEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(seen.length).toBe(0);

		// dispatch click on the real target
		outside.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

		expect(seen.length).toBe(1);
	});

	// ----------------------------------------------------------------
	//  TEMPLATE HANDLING
	// ----------------------------------------------------------------

	it('stores template + context when contentType="template"', () => {
		const fakeTpl = document.createElement('ng-template') as any;

		const dto: TooltipDto = {
			tooltipTemplate: fakeTpl,
			tooltipContext: { foo: 777 },
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 10, left: 10 },
			options: { ...defaultOptions, contentType: 'template' }
		};

		component.showTooltip(dto);

		expect((component as any).tooltipTemplate).toBe(fakeTpl);
		expect((component as any).tooltipContext()).toEqual({ foo: 777 });
	});
});
