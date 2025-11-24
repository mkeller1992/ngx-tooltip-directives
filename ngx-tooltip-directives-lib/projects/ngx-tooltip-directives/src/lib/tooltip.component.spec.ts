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

	it('applyStyleOptions(): applies all explicit style overrides correctly', () => {
		const dto: TooltipDto = {
			tooltipStr: 'styled',
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 10, left: 20 },
			options: {
				...defaultOptions,
				placement: 'bottom',
				tooltipClass: 'extra-x extra-y',
				zIndex: 9000,
				pointerEvents: 'none',
				animationDuration: 333,
				textColor: '#abc',
				padding: '12px',
				backgroundColor: '#123456',
				borderColor: '#654321',
				textAlign: 'center',
				minWidth: '80px',
				maxWidth: '400px',
				width: '200px'
			}
		};

		component.showTooltip(dto);
		flushRAF();
		fixture.detectChanges();

		const s = hostEl.getAttribute('style') || '';

		// classes
		expect(hostEl.classList.contains('tooltip-bottom')).toBe(true);
		expect(hostEl.classList.contains('extra-x')).toBe(true);
		expect(hostEl.classList.contains('extra-y')).toBe(true);

		// explicit style overrides
		expect(s).toContain('z-index: 9000');
		expect(s).toContain('pointer-events: none');
		expect(s).toContain('--transition-time: 333ms');
		expect(s).toContain('--tooltip-text-color: #abc');

		expect(s).toContain('padding: 12px');
		expect(s).toContain('--tooltip-background-color: #123456');
		expect(s).toContain('--tooltip-border-color: #654321');

		expect(s).toContain('--tooltip-text-align: center');
		expect(s).toContain('min-width: 80px');
		expect(s).toContain('max-width: 400px');
		expect(s).toContain('width: 200px');
	});

	it('applyStyleOptions(): falls back to defaults when options object is empty', () => {
		const emptyOptions: any = {};

		(component as any).applyStyleOptions(emptyOptions);

		fixture.detectChanges();

		const s = hostEl.getAttribute('style') || '';

		// tooltipClass fallback
		expect(hostEl.className).not.toContain('undefined');
		expect(hostEl.className).not.toContain('null');

		// zIndex fallback
		expect(s).toContain(`z-index: ${defaultOptions.zIndex}`);

		// pointerEvents fallback
		expect(s).toContain(`pointer-events: ${defaultOptions.pointerEvents}`);

		// animationDuration default
		expect(s).toContain(`--transition-time: ${defaultOptions.animationDurationDefault}ms`);

		// textColor fallback
		expect(s).toContain(`--tooltip-text-color: ${defaultOptions.textColor}`);

		// textAlign fallback
		expect(s).toContain(`--tooltip-text-align: ${defaultOptions.textAlign}`);

		// padding fallback
		expect(s).toContain(`padding: ${defaultOptions.padding}`);

		// backgroundColor fallback
		expect(s).toContain(`--tooltip-background-color: ${defaultOptions.backgroundColor}`);

		// borderColor fallback
		expect(s).toContain(`--tooltip-border-color: ${defaultOptions.borderColor}`);

		// shadow fallback
		if (defaultOptions.shadow) {
			expect(hostEl.classList.contains('tooltip-shadow')).toBe(true);
		} else {
			expect(hostEl.classList.contains('tooltip-shadow')).toBe(false);
		}

		// minWidth fallback: null ⇒ style.minWidth = ''
		expect(hostEl.style.minWidth).toBe('');

		// maxWidth fallback
		expect(hostEl.style.maxWidth).toBe(defaultOptions.maxWidth);

		// width fallback: null ⇒ style.width = ''
		expect(hostEl.style.width).toBe('');
	});

	it('computes shadow class correctly for shadow=true/false', () => {
		const dtoBase = {
			tooltipStr: 'x',
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 0, left: 0 }
		};

		// Case 1: shadow = true
		component.showTooltip({
			...dtoBase,
			options: { ...defaultOptions, shadow: true }
		});
		flushRAF();
		fixture.detectChanges();

		expect(hostEl.classList.contains('tooltip-shadow')).toBe(true);

		// Case 2: shadow = false
		component.showTooltip({
			...dtoBase,
			options: { ...defaultOptions, shadow: false }
		});
		flushRAF();
		fixture.detectChanges();

		expect(hostEl.classList.contains('tooltip-shadow')).toBe(false);
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

	it('showTooltip(): calls setPosition(true) when appendTooltipToBody=false', () => {
		const spy = jest.spyOn(component as any, 'setPosition');

		component.showTooltip({
			tooltipStr: 'x',
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 10, left: 10 },
			options: {
				...defaultOptions,
				appendTooltipToBody: false // ← this triggers the missing branch
			}
		});

		flushRAF();

		// isFixed must be true → setPosition(true) must be called
		expect(spy).toHaveBeenCalledWith(true);
	});

	it('showTooltip(): uses fallback appendTooltipToBody from defaultOptions when undefined', () => {
		const spy = jest.spyOn(component as any, 'setPosition');

		component.showTooltip({
			tooltipStr: 'x',
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 10, left: 10 },
			options: {
				...defaultOptions,
				appendTooltipToBody: undefined as any // ← triggers fallback branch
			}
		});

		flushRAF();

		// fallback determines isFixed = !defaultOptions.appendTooltipToBody
		const expectedIsFixed = !defaultOptions.appendTooltipToBody;
		expect(spy).toHaveBeenCalledWith(expectedIsFixed);
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

	it('calculateTooltipStylesForPlacement(): covers scroll offset, SVG host and DOMRect position', () => {

		/* Arrange */

		Object.defineProperty(window, 'scrollY', { value: 150, configurable: true });

		// --- fake SVG host → triggers SVG branch
		const svgHost = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		Object.defineProperty(svgHost, 'getBoundingClientRect', {
			value: () => ({ width: 80, height: 40 })
		});
		(component as any).hostElement = svgHost;

		// --- DOMRect → isCustomPosition = false
		const rect = new DOMRect(30, 60, 0, 0);
		(component as any).hostElementPosition = rect;

		// --- create fully mockable tooltip element
		const fakeTooltipEl = {};
		Object.defineProperty(fakeTooltipEl, 'clientWidth', {
			get: () => 60,
			configurable: true
		});
		Object.defineProperty(fakeTooltipEl, 'clientHeight', {
			get: () => 30,
			configurable: true
		});

		// override the nativeElement with mock element
		(component as any).elementRef.nativeElement = fakeTooltipEl;

		(component as any).tooltipOffset = 10;

		/* Act */

		const result = (component as any).calculateTooltipStylesForPlacement('top', false);

		/* Assert */

		expect(result.adjustScrollY).toBe(150);

		const expectedTop = rect.top + 150 - (30 + 10);
		expect(result.topStyle).toBe(expectedTop);

		const expectedLeft = (rect.left + 80 / 2) - (60 / 2);
		expect(result.leftStyle).toBe(expectedLeft);

		expect(result.placement).toBe('top');
	});

	it('calculateTooltipStylesForPlacement(): sets adjustScrollY = 0 when isFixedPosition=true', () => {
		// Prepare simple host element (non-SVG)
		const host = document.createElement('div');
		Object.defineProperty(host, 'offsetWidth', { value: 40 });
		Object.defineProperty(host, 'offsetHeight', { value: 20 });
		(component as any).hostElement = host;

		// Use DOMRect? No — we want isCustomPosition=true here? Actually irrelevant.
		(component as any).hostElementPosition = { top: 10, left: 20 };

		// Mock tooltip element size via safe override
		const fakeTooltipEl = {};
		Object.defineProperty(fakeTooltipEl, 'clientWidth', {
			get: () => 50,
			configurable: true
		});
		Object.defineProperty(fakeTooltipEl, 'clientHeight', {
			get: () => 30,
			configurable: true
		});
		(component as any).elementRef.nativeElement = fakeTooltipEl;

		(component as any).tooltipOffset = 10;

		// ACT: fixed-position mode → adjustScrollY MUST be 0
		const result = (component as any).calculateTooltipStylesForPlacement('bottom', true);

		expect(result.adjustScrollY).toBe(0);
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
		const fakeTemplateRef = {
			elementRef: { nativeElement: null },
			createEmbeddedView: jest.fn()
		} as any;

		const dto: TooltipDto = {
			tooltipTemplate: fakeTemplateRef,
			tooltipContext: { foo: 777 },
			hostElement: document.createElement('div'),
			hostElementPosition: { top: 10, left: 10 },
			options: { ...defaultOptions, contentType: 'template' }
		};

		component.showTooltip(dto);

		expect((component as any).tooltipTemplate).toBe(fakeTemplateRef);
		expect((component as any).tooltipContext()).toEqual({ foo: 777 });
	});

	it('setTooltipProperties(): applies all default fallbacks when options are missing', () => {

		const fakeTemplateRef = {
			elementRef: { nativeElement: null },
			createEmbeddedView: jest.fn()
		} as any;

		const dto: TooltipDto = {
			tooltipTemplate: fakeTemplateRef,
			tooltipContext: undefined,
			hostElement: document.createElement('div'),			
			hostElementPosition: { top: 100, left: 50 },

			options: {
				contentType: 'template',				
				placement: undefined as any,
				autoPlacement: undefined as any,
				offset: undefined as any
			} as any
		};

		// call private method directly to avoid showTooltip modifying values
		(component as any).setTooltipProperties(dto);

		expect((component as any).contentType()).toBe('template');

		// tooltipContext → null fallback
		expect((component as any).tooltipContext()).toBeNull();

		// ---------------------------
		// placement fallback
		// ---------------------------
		expect((component as any)._placement()).toBe(defaultOptions.placement);

		// ---------------------------
		// autoPlacement fallback
		// ---------------------------
		expect((component as any).autoPlacement).toBe(defaultOptions.autoPlacement);

		// ---------------------------
		// offset fallback
		// ---------------------------
		expect((component as any).tooltipOffset).toBe(defaultOptions.offset);
	});

	it('setTooltipProperties(): falls back to default contentType when undefined', () => {

		const dto: TooltipDto = {
			tooltipStr: undefined,
			tooltipHtml: undefined,
			tooltipTemplate: undefined,
			tooltipContext: undefined,

			hostElement: document.createElement('div'),
			hostElementPosition: { top: 0, left: 0 },

			options: {
				contentType: undefined,  // ← triggers fallback
				placement: defaultOptions.placement,
				autoPlacement: defaultOptions.autoPlacement,
				offset: defaultOptions.offset
			} as any
		};

		// Call the method directly
		(component as any).setTooltipProperties(dto);

		// ---------------------------
		// contentType fallback
		// ---------------------------
		expect((component as any).contentType()).toBe(defaultOptions.contentType);

		// string/html/template branches must NOT run
		expect((component as any).tooltipStr()).toBe('');
		expect((component as any).tooltipHtml()).toBeNull();
		expect((component as any).tooltipTemplate).toBeUndefined();

		// Context fallback
		expect((component as any).tooltipContext()).toBeNull();
	});


});
