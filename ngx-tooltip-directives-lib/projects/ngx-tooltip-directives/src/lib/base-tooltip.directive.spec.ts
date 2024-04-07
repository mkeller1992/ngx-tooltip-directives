import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BaseTooltipDirective } from './base-tooltip.directive';
import { TooltipStrDirective } from './tooltip-str.directive';

@Component({
    template: `<button type="button" [tooltipStr]="'Initial Tooltip String'" class="big-button">Big button</button>`,
})
class HostComponent {}
  
  describe('TooltipStrDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let tooltipDirectiveInstance: TooltipStrDirective; 
  
    beforeEach(async () => {
    
      await TestBed.configureTestingModule({
        declarations: [TooltipStrDirective, HostComponent],
      })
      .compileComponents();
  
      fixture = TestBed.createComponent(HostComponent);
      
      tooltipDirectiveInstance = fixture.debugElement.query(By.directive(TooltipStrDirective)).injector.get(TooltipStrDirective);
      fixture.detectChanges();
    });

    it('should call setTooltipContent with correct arguments when tooltipStr is set', () => {
      // Spy on the initializeTooltip method of the BaseTooltipDirective
      const initializeTooltipSpy = jest.spyOn(BaseTooltipDirective.prototype, 'setTooltipContent');
  
      // Set the tooltipStr input property
      tooltipDirectiveInstance.tooltipStr = 'Test Tooltip String';
  
      // Check that initializeTooltip was called with the correct arguments
      expect(initializeTooltipSpy).toHaveBeenCalledWith('Test Tooltip String', 'string');
    });

    it('should call showTooltipAfterDelay on mouseenter', () => {   
      // Spy on the showTooltipAfterDelay method
      const showTooltipAfterDelaySpy = jest.spyOn(tooltipDirectiveInstance as any, 'showTooltipAfterDelay');
      
      // Dispatch the mouse event on the directive element
      const mouseEnterEvent = new MouseEvent('mouseenter');
      fixture.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseEnterEvent);      
      
      // Check if showTooltipAfterDelay was called
      expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0); // assuming a default delay of 0
    });

    it('should call showTooltipAfterDelay on focusin', () => {   
      // Spy on the showTooltipAfterDelay method
      const showTooltipAfterDelaySpy = jest.spyOn(tooltipDirectiveInstance as any, 'showTooltipAfterDelay');
      
      // Dispatch the mouse event on the directive element
      const focusInEvent = new MouseEvent('focusin');
      fixture.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusInEvent);      
      
      // Check if showTooltipAfterDelay was called
      expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0); // assuming a default delay of 0
    });

    it('should call hideTooltipAfterDelay on mouseleave', () => {   
      // Spy on the hideTooltipAfterDelay method
      const hideTooltipAfterDelaySpy = jest.spyOn(tooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
      
      // Dispatch the mouse event on the directive element
      const mouseLeaveEvent = new MouseEvent('mouseleave');
      fixture.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseLeaveEvent);      
      
      // Check if hideTooltipAfterDelay was called
      expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0); // assuming a default delay of 0
    });

    it('should call hideTooltipAfterDelay on focusout', () => {   
      // Spy on the hideTooltipAfterDelay method
      const hideTooltipAfterDelaySpy = jest.spyOn(tooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
      
      // Dispatch the mouse event on the directive element
      const focusOutEvent = new MouseEvent('focusout');
      fixture.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusOutEvent);      
      
      // Check if hideTooltipAfterDelay was called
      expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0); // assuming a default delay of 0
    });

    it('should call hideTooltipAfterDelay on scroll', () => {
      // Spy on the hideTooltipAfterDelay method
      const hideTooltipAfterDelaySpy = jest.spyOn(tooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
      tooltipDirectiveInstance['isTooltipVisible'] = true;
      
      // Dispatch the mouse event on the directive element
      const scrollEvent = new Event('scroll');
      document.dispatchEvent(scrollEvent);      
      
      fixture.detectChanges();

      // Check if hideTooltipAfterDelay was called
      expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0); // assuming a default delay of 0
    });
    
  });
