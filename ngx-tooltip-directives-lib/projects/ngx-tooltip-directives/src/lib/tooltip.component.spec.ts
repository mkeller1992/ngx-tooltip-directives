import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { Renderer2, ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { TooltipDto } from './tooltip.dto';
import { defaultOptions } from './default-options.const';

// Mock ElementRef for component instantiation
const mockElementRef = {
  nativeElement: document.createElement('div')
};

// Optional DOMRect mock (only needed if component logic depends on instanceof DOMRect)
export class DOMRect {
  constructor(private x: number, private y: number, private width: number, private height: number) {}
  // Extend as needed for tests
}

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;
  let renderer2: Renderer2;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
      providers: [
        provideZonelessChangeDetection(),
        Renderer2,
        { provide: ElementRef, useValue: mockElementRef },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    renderer2 = TestBed.inject(Renderer2);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Reset Jest timers to real implementations after each test
    jest.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set properties and position and then show tooltip when showTooltip is called', () => {
    jest.useFakeTimers();

    const tooltipText = 'My Tooltip Text';
    const tooltipDto: TooltipDto = {
      tooltipStr: tooltipText,
      hostElement: document.createElement('div'),
      hostElementPosition: { top: 5, left: 5 },
      options: { ...defaultOptions , placement: 'left' }
    };

    component.showTooltip(tooltipDto);
    jest.advanceTimersByTime(16); // Simulate requestAnimationFrame
    fixture.detectChanges();

    expect(component.tooltipState).toBe('show');
    expect(component.currentContentType).toBe('string');
    expect(component.originalPlacement).toBe('left');
    expect(component.tooltipStr).toBe(tooltipText);

    // Check if tooltip content is correctly rendered in the DOM
    const tooltipLabel = (fixture.nativeElement.querySelector('.tooltip-label') as HTMLDivElement).textContent;
    expect(tooltipLabel?.trim()).toBe(tooltipText);
  });

  it('should set tooltipState to "hide" when hideTooltip is called', () => {
    component.hideTooltip();
    fixture.detectChanges();
    expect(component.tooltipState).toBe('hide');
  });

  it('should calculate correct styles', () => {
    jest.useFakeTimers();

    const setPlacementStylesSpy = jest.spyOn(component as any, 'setPlacementStyles');

    const tooltipText = 'My Tooltip Text';
    const tooltipDto: TooltipDto = {
      tooltipStr: tooltipText,
      hostElement: document.createElement('div'),
      hostElementPosition: { top: 55, left: 33 },
      options: { ...defaultOptions, placement: 'right' }
    };

    component.showTooltip(tooltipDto);
    jest.advanceTimersByTime(16); // Simulate requestAnimationFrame
    fixture.detectChanges();

    expect(setPlacementStylesSpy).toHaveBeenCalledTimes(1);
    expect(component.hostStyleTop).toBe('55px');
    expect(component.hostStyleLeft).toBe('41px');

    // TODO: Add more DOM and style assertions as needed

  });
});
