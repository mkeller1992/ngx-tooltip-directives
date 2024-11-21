import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, SafeHtml } from "@angular/platform-browser";
import { TooltipHtmlDirective } from './tooltip-html.directive';

@Component({
    standalone: false,
    template: `<div [tooltipHtml]="testHtml"></div>`
  })

  class HostComponent {
    testHtml: SafeHtml = '<div>Initial tooltip</div>';
  }

  describe('TooltipHtmlDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let hostComponent: HostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HostComponent],
            imports: [TooltipHtmlDirective]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        hostComponent = fixture.componentInstance;
    });

    it('should initialize tooltip with HTML content', () => {
        // Act
        fixture.detectChanges();

        // Assert
        const tooltipDirective = fixture.debugElement
                                        .query(By.directive(TooltipHtmlDirective))
                                        .injector
                                        .get(TooltipHtmlDirective);
        expect(tooltipDirective.tooltipContent).toBe('<div>Initial tooltip</div>');
    });

    it('should override tooltip with HTML content', () => {
        // Arrange
        const htmlInput = '<div>Sample HTML content</div>';
        hostComponent.testHtml = htmlInput;

        // Act
        fixture.detectChanges();

        // Assert
        const tooltipDirective = fixture.debugElement
                                        .query(By.directive(TooltipHtmlDirective))
                                        .injector
                                        .get(TooltipHtmlDirective);                                       
        expect(tooltipDirective.tooltipContent).toBe(htmlInput);
    });
});