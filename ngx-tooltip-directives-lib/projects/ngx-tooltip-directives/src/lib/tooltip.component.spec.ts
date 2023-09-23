import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { Renderer2, ElementRef } from '@angular/core';
import { TooltipDto } from './tooltip.dto';
import { defaultOptions } from './default-options.const';


// Mock ElementRef
const mockElementRef = {
  nativeElement: document.createElement('div')
};

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;
  let renderer2: Renderer2;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TooltipComponent],
      providers: [
        { provide: ElementRef, useValue: mockElementRef },
        Renderer2
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    renderer2 = TestBed.inject(Renderer2);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set tooltipState to "show" when showTooltip is called', () => {

    const tooltipDto: TooltipDto = {
      tooltipStr: 'Tooltip Text',
      hostElement: null,
      hostElementPosition: { top: 0, left: 0 },
      options: defaultOptions
    }

    component.showTooltip(tooltipDto);
    expect(component.tooltipState).toBe('show');
  });

  it('should set tooltipState to "hide" when hideTooltip is called', () => {
    component.hideTooltip();
    expect(component.tooltipState).toBe('hide');
  });

  // Add more tests here...

  // Note: You might also want to add tests for DOM manipulations, but these would require
  // a deeper integration test setup or the use of the Renderer2 mock to verify certain calls.

});

