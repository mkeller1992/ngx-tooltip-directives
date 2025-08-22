import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { TooltipDto } from './tooltip.dto';
import { defaultOptions } from './default-options.const';

// Mock ElementRef for component instantiation
const mockElementRef = { nativeElement: document.createElement('div') };

// Optional DOMRect mock (only needed if component logic depends on instanceof DOMRect)
export class DOMRect {
  constructor(private x: number, private y: number, private width: number, private height: number) {}
  // Extend as needed for tests
}

describe('TooltipComponent (signals + host bindings)', () => {
  let fixture: ComponentFixture<TooltipComponent>;
  let component: TooltipComponent;
  let hostEl: HTMLElement;

  // Make rAF deterministic so we can flush it in tests
  let rafSpy: jest.SpyInstance<number, [(timestamp: number) => void]>;
  beforeAll(() => {
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 0) as unknown as number;
    });
  });

  afterAll(() => {
    rafSpy.mockRestore();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ElementRef, useValue: mockElementRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    hostEl = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Helper to flush our mocked requestAnimationFrame
  function flushRAF() {
    jest.advanceTimersByTime(0);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('showTooltip: renders string content and sets classes/placement', () => {
    jest.useFakeTimers();

    const dto: TooltipDto = {
      tooltipStr: 'My Tooltip Text',
      hostElement: document.createElement('div'),
      hostElementPosition: { top: 5, left: 5 },
      options: { ...defaultOptions, placement: 'left' }
    };

    component.showTooltip(dto);
    flushRAF();          // resolve requestAnimationFrame
    fixture.detectChanges();

    // Classes come from @HostBinding('class') via computed signals
    expect(hostEl.className).toContain('tooltip');
    expect(hostEl.className).toContain('show');
    expect(hostEl.className).toContain('tooltip-left');

    // DOM content is rendered
    const label = hostEl.querySelector('.tooltip-label') as HTMLDivElement;
    expect(label?.textContent?.trim()).toBe('My Tooltip Text');
  });

  it('hideTooltip: switches to "hide" class', () => {
    jest.useFakeTimers();

    // Show first
    component.showTooltip({
      tooltipStr: 'x',
      hostElement: document.createElement('div'),
      hostElementPosition: { top: 0, left: 0 },
      options: { ...defaultOptions }
    });
    flushRAF();
    fixture.detectChanges();
    expect(hostEl.className).toContain('show');

    // Then hide
    component.hideTooltip();
    fixture.detectChanges();
    expect(hostEl.className).toContain('hide');
    expect(hostEl.className).not.toContain('show');
  });

  it('applies style options via HostBindings (zIndex, pointer-events, CSS variables, custom classes)', () => {
    jest.useFakeTimers();

    const dto: TooltipDto = {
      tooltipStr: 'styled',
      hostElement: document.createElement('div'),
      hostElementPosition: { top: 10, left: 20 },
      options: {
        ...defaultOptions,
        placement: 'bottom',
        zIndex: 1234,
        pointerEvents: 'none',
        animationDuration: 250,
        textColor: '#f00',
        tooltipClass: 'foo bar'
      }
    };

    component.showTooltip(dto);
    flushRAF();
    fixture.detectChanges();

    // Classes include placement and custom classes
    expect(hostEl.classList.contains('tooltip-bottom')).toBe(true);
    expect(hostEl.classList.contains('foo')).toBe(true);
    expect(hostEl.classList.contains('bar')).toBe(true);

    // Inline styles come from HostBindings
    const styleAttr = hostEl.getAttribute('style') ?? '';
    expect(styleAttr).toContain('z-index: 1234');
    expect(styleAttr).toContain('pointer-events: none');
    expect(styleAttr).toContain('--transition-time: 250ms');
    expect(styleAttr).toContain('--tooltip-text-color: #f00');
  });

  it('emits "shown" / "hidden" on transitionend (opacity)', () => {
    const seen: string[] = [];
    const sub = component.visibilityChangeCompleted$.subscribe(e => seen.push(e.type));

    // fire "shown"
    (component as any)._state.set('show');
    const evShown = new Event('transitionend') as any;
    evShown.propertyName = 'opacity';
    (fixture.nativeElement as HTMLElement).dispatchEvent(evShown);

    // fire "hidden"
    (component as any)._state.set('hide');
    const evHidden = new Event('transitionend') as any;
    evHidden.propertyName = 'opacity';
    (fixture.nativeElement as HTMLElement).dispatchEvent(evHidden);

    expect(seen).toEqual(['shown', 'hidden']);
    sub.unsubscribe();
  });

  it('updates top/left HostBindings after positioning', () => {
    jest.useFakeTimers();

    const dto: TooltipDto = {
      tooltipStr: 'pos',
      hostElement: document.createElement('div'),
      hostElementPosition: { top: 42, left: 24 },
      options: { ...defaultOptions, placement: 'right' }
    };

    component.showTooltip(dto);
    flushRAF();
    fixture.detectChanges();

    // Read HostBinding getters (strings with px suffix)
    const topStr = (component as any).hostStyleTop as string;
    const leftStr = (component as any).hostStyleLeft as string;

    expect(topStr.endsWith('px')).toBe(true);
    expect(leftStr.endsWith('px')).toBe(true);

    const topNum = parseFloat(topStr);
    const leftNum = parseFloat(leftStr);
    expect(Number.isNaN(topNum)).toBe(false);
    expect(Number.isNaN(leftNum)).toBe(false);
  });
});