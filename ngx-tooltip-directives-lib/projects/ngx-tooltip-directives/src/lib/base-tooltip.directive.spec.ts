import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseTooltipDirective } from './base-tooltip.directive';
import { TooltipStrDirective } from './tooltip-str.directive';
import { TooltipHtmlDirective } from './tooltip-html.directive';
import { TooltipComponent } from './tooltip.component';
import { TooltipOptions } from './options.interface';

  
  describe('BaseTooltipDirective', () => {
    let fixtureStrTooltip: ComponentFixture<HostWithStrTooltipComponent>;
    let strTooltipDirectiveInstance: TooltipStrDirective;

    let fixtureHtmlTooltip: ComponentFixture<HostWithHtmlTooltipComponent>;
    let htmlTooltipDirectiveInstance: TooltipHtmlDirective;

    let fixtureOptionsTooltip: ComponentFixture<HostWithTooltipWithOptionsComponent>;
    let optionsTooltipDirectiveInstance: TooltipStrDirective; 
  
    beforeEach(async () => {
    
      await TestBed.configureTestingModule({
        declarations: [
          HostWithStrTooltipComponent,
          HostWithHtmlTooltipComponent,
          HostWithTooltipWithOptionsComponent
        ],
        imports: [
          TooltipStrDirective,
          TooltipHtmlDirective
        ]
      })
      .compileComponents();
  
      fixtureStrTooltip = TestBed.createComponent(HostWithStrTooltipComponent);      
      strTooltipDirectiveInstance = fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).injector.get(TooltipStrDirective);

      fixtureHtmlTooltip = TestBed.createComponent(HostWithHtmlTooltipComponent);
      htmlTooltipDirectiveInstance = fixtureHtmlTooltip.debugElement.query(By.directive(TooltipHtmlDirective)).injector.get(TooltipHtmlDirective);

      fixtureOptionsTooltip = TestBed.createComponent(HostWithTooltipWithOptionsComponent);      
      optionsTooltipDirectiveInstance = fixtureOptionsTooltip.debugElement.query(By.directive(TooltipStrDirective)).injector.get(TooltipStrDirective);
    });

    afterEach(() => {
      // Reset Jest's timers to the real implementations after each test
      jest.useRealTimers();
    });

    describe('Initialization', () => {

      it('should call setTooltipContent with correct arguments when tooltipStr is set', () => {

        /* Arrange */
        const setTooltipContentSpy = jest.spyOn(BaseTooltipDirective.prototype, 'setTooltipContent');
  
        /* Act */
        fixtureStrTooltip.detectChanges();
    
        /* Assert */
        expect(setTooltipContentSpy).toHaveBeenCalledWith('Tooltip String Text', 'string');
      });
  
      it('should call setTooltipContent with correct arguments when tooltipHtml is set', () => {

        /* Arrange */
        const setTooltipContentSpy = jest.spyOn(BaseTooltipDirective.prototype, 'setTooltipContent');
        const expectedTooltipContent = {"changingThisBreaksApplicationSecurity": "<div>This is a <strong>tooltip</strong> with HTML</div>"};
  
        /* Act */
        fixtureHtmlTooltip.detectChanges();
    
        /* Assert */
        expect(setTooltipContentSpy).toHaveBeenCalledWith(expectedTooltipContent, 'html');
      });
  
      it('should initialize tooltip with correct options', () => {
  
        /* Arrange */
        jest.spyOn(optionsTooltipDirectiveInstance as any, 'isTouchScreen', 'get').mockReturnValue(true);
  
        /* Act */
        fixtureOptionsTooltip.detectChanges();
    
        /* Assert */
        const mergedOptions = optionsTooltipDirectiveInstance['mergedOptions'] as TooltipOptions;
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
        expect(mergedOptions.maxWidth).toBe('150px');
        expect(mergedOptions.showDelay).toBe(333);
        expect(mergedOptions.hideDelay).toBe(222);
        expect(mergedOptions.hideDelayAfterClick).toBe(111);
        expect(mergedOptions.pointerEvents).toBe('none');
        expect(mergedOptions.position).toEqual({ top: 23, left: 25 });
      });
  
  
      it('should initialize correct listeners when isDisplayOnHover is set', () => {

         /* Arrange */
        const subscribeToShowTriggersSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'subscribeToShowTriggers');
        const subscribeToResizeEventsSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');
  
        // Mock return-values of the getters 'isDisplayOnHover()' and 'isDisplayOnClick()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(false);
  
        /* Act */
        fixtureStrTooltip.detectChanges();
    
        /* Assert */
        expect(subscribeToShowTriggersSpy).toHaveBeenCalledTimes(1);
        expect(subscribeToResizeEventsSpy).toHaveBeenCalledTimes(0);
      });
  
      it('should initialize correct listeners when isDisplayOnClick is set', () => {
        
        /* Arrange */
        const subscribeToShowTriggersSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'subscribeToShowTriggers');
        const subscribeToResizeEventsSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');
  
        // Mock return-values of the getters 'isDisplayOnHover()' and 'isDisplayOnClick()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(false);
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(true);
  
        /* Act */
        fixtureStrTooltip.detectChanges();
    
        /* Assert */
        expect(subscribeToShowTriggersSpy).toHaveBeenCalledTimes(1);
        expect(subscribeToResizeEventsSpy).toHaveBeenCalledTimes(0);
      });
  
  
      // TODO !!!
      // Create same test for tooltip-template !

    });



    describe('Show and modify tooltips', () => {

      it('should trigger re-positioning of tooltip when user resizes window', () => {
        
        /* Arrange */        
        jest.useFakeTimers();

        strTooltipDirectiveInstance['tooltipComponent'] = {
          setPosition(isFixedPosition: boolean) {}
        } as TooltipComponent;
        
        const subscribeToResizeEventsSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');
        const setPositionOnTooltipComponentSpy = jest.spyOn(strTooltipDirectiveInstance['tooltipComponent'], 'setPosition');
        strTooltipDirectiveInstance['isTooltipVisible'] = true;
        (strTooltipDirectiveInstance as any).subscribeToResizeEvents();
        
        /* Act */
        fixtureStrTooltip.detectChanges();
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        jest.advanceTimersByTime(100);
  
        /* Assert */
        expect(subscribeToResizeEventsSpy).toHaveBeenCalledTimes(1);
        expect(setPositionOnTooltipComponentSpy).toHaveBeenCalledTimes(1);
      });
  
      it('should call showTooltipAfterDelay on mouseenter', () => {

        /* Arrange */
        const showTooltipAfterDelaySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'showTooltipAfterDelay');
        
        /* Act */
        fixtureStrTooltip.detectChanges();
        const mouseEnterEvent = new MouseEvent('mouseenter');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseEnterEvent);      
        
        /* Assert */
        expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
      });
  
      it('should call showTooltipAfterDelay on focusin', () => {   
        
        /* Arrange */
        const showTooltipAfterDelaySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'showTooltipAfterDelay');
        
        /* Act */
        fixtureStrTooltip.detectChanges();
        const focusInEvent = new MouseEvent('focusin');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusInEvent);      
        
        /* Assert */
        expect(showTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
      });

      it('should subscribe to correct listeners when tooltip gets displayed for the second time', () => {   
        
        /* Arrange */
        jest.useFakeTimers();
        // Mock return-values of the getter 'isDisplayOnHover()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(false);
        
        /* Act */
        fixtureStrTooltip.detectChanges();
        const focusInEvent = new MouseEvent('focusin');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusInEvent);
        jest.advanceTimersByTime(1);
        const focusOutEvent = new MouseEvent('focusout');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusOutEvent);
        jest.advanceTimersByTime(1);

        /* Arrange */
        const showTooltipAfterDelaySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'showTooltipAfterDelay');
        const setTooltipVisibilitySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
        const subscribeToHideTriggersSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'subscribeToHideTriggers');
        const subscribeToResizeEventsSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'subscribeToResizeEvents');

         /* Act */
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusInEvent);
        jest.advanceTimersByTime(1);
        
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
        jest.useFakeTimers();
        const showSpy = jest.spyOn(strTooltipDirectiveInstance, 'show');
  
        // Mock return-values of the getters 'isDisplayOnHover()' and 'isDisplayOnClick()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(false);
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(true);
  
        /* Act */
        fixtureStrTooltip.detectChanges();
        const clickEvent = new Event('click');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(clickEvent);
        jest.advanceTimersByTime(1);

        /* Assert */
        expect(showSpy).toHaveBeenCalledTimes(1);
        expect(showSpy).toHaveBeenCalledWith(false);
      });
  
      it('should create and show correct tooltip-string when mouse enters element with tooltip', () => {
        
        /* Arrange */
        jest.useFakeTimers();
        
        const createTooltipSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'createTooltip');
        const appendComponentToBodySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'appendComponentToBody');
        const setTooltipVisibilitySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
        const showTooltipOnHostComponentSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'showTooltipOnHostComponent'); 
        
        /* Act */

        fixtureStrTooltip.detectChanges();
        const mouseEnterEvent = new MouseEvent('mouseenter');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseEnterEvent);
        jest.advanceTimersByTime(1);
  
        /* Assert */
        expect(createTooltipSpy).toHaveBeenCalledTimes(1);
        expect(appendComponentToBodySpy).toHaveBeenCalledTimes(1);
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
        jest.useFakeTimers();
        
        const createTooltipSpy = jest.spyOn(htmlTooltipDirectiveInstance as any, 'createTooltip');
        const appendComponentToBodySpy = jest.spyOn(htmlTooltipDirectiveInstance as any, 'appendComponentToBody');
        const setTooltipVisibilitySpy = jest.spyOn(htmlTooltipDirectiveInstance as any, 'setTooltipVisibility');
        const showTooltipOnHostComponentSpy = jest.spyOn(htmlTooltipDirectiveInstance as any, 'showTooltipOnHostComponent');
        const expectedTooltipContent = {"changingThisBreaksApplicationSecurity": "<div>This is a <strong>tooltip</strong> with HTML</div>"};
        
        /* Act */
        fixtureHtmlTooltip.detectChanges();
        const mouseEnterEvent = new MouseEvent('mouseenter');
        fixtureHtmlTooltip.debugElement.query(By.directive(TooltipHtmlDirective)).nativeElement.dispatchEvent(mouseEnterEvent);  
        jest.advanceTimersByTime(1);
  
        /* Assert */
        expect(createTooltipSpy).toHaveBeenCalledTimes(1);
        expect(appendComponentToBodySpy).toHaveBeenCalledTimes(1);
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
  
      // TODO !!!
      // Create same test for tooltip-template !

    });



    describe('Hide tooltips', () => {

      it('should hide tooltip on mouseleave', () => {

        /* Arrange */
        jest.useFakeTimers();
  
        const hideTooltipAfterDelaySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
        const setTooltipVisibilitySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
        const hideTooltipOnHostComponentSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');
  
        strTooltipDirectiveInstance['isTooltipVisible'] = true;
        // Force getter 'isTooltipComponentDestroyed()' to return false:
        jest.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
        // Mock return-values of the getter 'isDisplayOnHover()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
        
        /* Act */
        (strTooltipDirectiveInstance as any).subscribeToHideTriggers();
        fixtureStrTooltip.detectChanges();
        const mouseLeaveEvent = new MouseEvent('mouseleave');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(mouseLeaveEvent);  
        jest.advanceTimersByTime(1);
  
        /* Assert */
        expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
        expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
        expect(setTooltipVisibilitySpy).toHaveBeenCalledWith('hidden');
        expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
        expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
      });
  
      it('should hide tooltip on focusout', () => {

        /* Arrange */
        jest.useFakeTimers();
  
        const hideTooltipAfterDelaySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
        const setTooltipVisibilitySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
        const hideTooltipOnHostComponentSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');
  
        strTooltipDirectiveInstance['isTooltipVisible'] = true;
        // Force getter 'isTooltipComponentDestroyed()' to return false:
        jest.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
        // Mock return-values of the getter 'isDisplayOnHover()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
        
        /* Act */
        (strTooltipDirectiveInstance as any).subscribeToHideTriggers();
        fixtureStrTooltip.detectChanges();
        const focusOutEvent = new MouseEvent('focusout');
        fixtureStrTooltip.debugElement.query(By.directive(TooltipStrDirective)).nativeElement.dispatchEvent(focusOutEvent);  
        jest.advanceTimersByTime(1);
  
        /* Assert */
        expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
        expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
        expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
        expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
      });
  
      it('should hide tooltip on scroll when displayOnHover is set', () => {

        /* Arrange */
        jest.useFakeTimers();
  
        const hideTooltipAfterDelaySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
        const setTooltipVisibilitySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
        const hideTooltipOnHostComponentSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');
  
        strTooltipDirectiveInstance['isTooltipVisible'] = true;
        // Force getter 'isTooltipComponentDestroyed()' to return false:
        jest.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
        // Mock return-values of the getter 'isDisplayOnHover()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(true);
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(false);
        
        /* Act */
        (strTooltipDirectiveInstance as any).subscribeToHideTriggers();
        fixtureStrTooltip.detectChanges();
        const scrollEvent = new Event('scroll');
        document.dispatchEvent(scrollEvent);  
        jest.advanceTimersByTime(1);
  
        /* Assert */
        expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
        expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
        expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
        expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
      });

      it('should hide tooltip on scroll when displayOnClick is set', () => {

        /* Arrange */
        jest.useFakeTimers();
  
        const hideTooltipAfterDelaySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipAfterDelay');
        const setTooltipVisibilitySpy = jest.spyOn(strTooltipDirectiveInstance as any, 'setTooltipVisibility');
        const hideTooltipOnHostComponentSpy = jest.spyOn(strTooltipDirectiveInstance as any, 'hideTooltipOnHostComponent');
  
        strTooltipDirectiveInstance['isTooltipVisible'] = true;
        // Force getter 'isTooltipComponentDestroyed()' to return false:
        jest.spyOn(strTooltipDirectiveInstance as any, 'isTooltipComponentDestroyed', 'get').mockReturnValue(false);
        // Mock return-values of the getter 'isDisplayOnHover()'
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnHover', 'get').mockReturnValue(false);
        jest.spyOn(strTooltipDirectiveInstance as any, 'isDisplayOnClick', 'get').mockReturnValue(true);
        
        /* Act */
        (strTooltipDirectiveInstance as any).subscribeToHideTriggers();
        fixtureStrTooltip.detectChanges();
        const scrollEvent = new Event('scroll');
        document.dispatchEvent(scrollEvent);  
        jest.advanceTimersByTime(1);
  
        /* Assert */
        expect(hideTooltipAfterDelaySpy).toHaveBeenCalledWith(0);
        expect(setTooltipVisibilitySpy).toHaveBeenCalledTimes(1);
        expect(hideTooltipOnHostComponentSpy).toHaveBeenCalledTimes(1);
        expect(strTooltipDirectiveInstance['isTooltipVisible']).toBe(false);
      });      
    });

  });

  /* Mock Components */

  @Component({
    standalone: false,
    template: `
      <button type="button"
        [tooltipStr]="'Tooltip String Text'">
          Button with string tooltip
      </button>`
  })
  class HostWithStrTooltipComponent {}
  
  @Component({
    standalone: false,
    template: `<button type="button" [tooltipHtml]="safeTooltipHtml">Button with Html Tooltip</button>`
  })
  class HostWithHtmlTooltipComponent {
    tooltipHtml = '<div>This is a <strong>tooltip</strong> with HTML</div>';
    safeTooltipHtml!: SafeHtml;
  
    constructor(private sanitizer: DomSanitizer){ }
  
    ngOnInit(): void {
      this.safeTooltipHtml = this.sanitizer.bypassSecurityTrustHtml(this.tooltipHtml);
    }
  }
  
  @Component({
    standalone: false,
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
        [maxWidth]="'150px'"
        [showDelay]="333"
        [hideDelay]="222"
        [hideDelayAfterClick]="111"
        [pointerEvents]="'none'"
        [position]="{top: 23, left: 25}">
          Button with string tooltip
      </button>`
  })
  class HostWithTooltipWithOptionsComponent {}