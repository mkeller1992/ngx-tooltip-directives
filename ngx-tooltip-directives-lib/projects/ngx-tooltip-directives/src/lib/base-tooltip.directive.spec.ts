import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BaseTooltipDirective } from './base-tooltip.directive';
import { TooltipStrDirective } from './tooltip-str.directive';

@Component({
    template: `<button type="button" [tooltipStr]="'Initial Tooltip String'" class="big-button">Big button</button>`,
    styles: [`
        .big-button {
            height: 100px;
            width: 200px;
        }
    `]
})
class HostComponent {}
  
  describe('TooltipStrDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let directiveWithTooltipStr: any;
  
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [TooltipStrDirective, HostComponent],
      }).compileComponents();
  
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      directiveWithTooltipStr = fixture.debugElement.query(By.directive(TooltipStrDirective));
    });

    // TODO !!!
    //Try to make it work
    /*
    it('should have non-zero dimensions', () => {
        const hostElement: HTMLElement = fixture.nativeElement;
        const divElement = hostElement.querySelector('button');
        expect(divElement?.clientHeight).toBeGreaterThan(0);
        expect(divElement?.clientWidth).toBeGreaterThan(0);
      });
      */
  
    it('should call initializeTooltip with correct arguments when tooltipStr is set', () => {
      // Get instance of the directive
      const directiveInstance = directiveWithTooltipStr.injector.get(TooltipStrDirective);
  
      // Spy on the initializeTooltip method of the BaseTooltipDirective
      const initializeTooltipSpy = jest.spyOn(BaseTooltipDirective.prototype, 'initializeTooltip');
  
      // Set the tooltipStr input property
      directiveInstance.tooltipStr = 'Test Tooltip String';
      fixture.detectChanges();
  
      // Check that initializeTooltip was called with the correct arguments
      expect(initializeTooltipSpy).toHaveBeenCalledWith('Test Tooltip String', 'string');
    });

    // TODO !!!
    //Try to make it work

    /*
    it('should call showTooltipAfterDelay when mouse moves over the element', fakeAsync(() => {
        // Get instance of the directive
        const directiveInstance = directiveWithTooltipStr.injector.get(TooltipStrDirective);
      
        // Spy on the showTooltipAfterDelay method
        const showTooltipAfterDelaySpy = jest.spyOn(directiveInstance, 'showTooltipAfterDelay');
      
        // Set isDisplayOnHover to true so that the filter allows the event through
        // directiveInstance.isDisplayOnHover = true;
        
        // Trigger the mousemove event on the document
        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 50,
          clientY: 50,
          bubbles: true, // Important to allow event to bubble up to document
        });
        
        // Dispatch the mouse event on the directive element
        directiveWithTooltipStr.nativeElement.dispatchEvent(mouseMoveEvent);
        
        // Run any pending timers - this will execute the showTooltipAfterDelay method if it was scheduled
        tick();
        
        // Check if showTooltipAfterDelay was called
        expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0); // assuming a default delay of 0
      }));
      */      
  });