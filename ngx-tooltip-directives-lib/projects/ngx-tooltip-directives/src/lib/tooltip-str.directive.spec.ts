import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from "@angular/platform-browser";
import { TooltipStrDirective } from './tooltip-str.directive';

@Component({
    template: `<div [tooltipStr]="testStr"></div>`
})
class HostComponent {
    testStr: string = 'Initial tooltip';
}

describe('TooltipStrDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let hostComponent: HostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TooltipStrDirective, HostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        hostComponent = fixture.componentInstance;
    });

    it('should initialize tooltip with string content', () => {
        // Act
        fixture.detectChanges();

        // Assert
        const tooltipDirective = fixture.debugElement
                                        .query(By.directive(TooltipStrDirective))
                                        .injector
                                        .get(TooltipStrDirective);
        expect(tooltipDirective.tooltipContent).toBe('Initial tooltip');
    });

    it('should override tooltip with string content', () => {
        // Arrange
        const strInput = 'Sample string content';
        hostComponent.testStr = strInput;

        // Act
        fixture.detectChanges();

        // Assert
        const tooltipDirective = fixture.debugElement
                                        .query(By.directive(TooltipStrDirective))
                                        .injector
                                        .get(TooltipStrDirective);
        expect(tooltipDirective.tooltipContent).toBe(strInput);
    });
});
