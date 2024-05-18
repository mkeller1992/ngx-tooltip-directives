import { Component, TemplateRef, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from "@angular/platform-browser";
import { TooltipTemplateDirective } from './tooltip-template.directive';

@Component({
    template: `
        <ng-template #templateRef>
            Initial Tooltip
        </ng-template>
        <div [tooltipTemplate]="templateRef"></div>
    `
})
class HostComponent {
    @ViewChild('templateRef', { static: true }) templateRef!: TemplateRef<any>;
}

describe('TooltipTemplateDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let hostComponent: HostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HostComponent],
            imports: [TooltipTemplateDirective]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        hostComponent = fixture.componentInstance;
    });

    it('should initialize tooltip with template content', () => {
        // Arrange
        const templateInput = hostComponent.templateRef;

        // Act
        fixture.detectChanges();

        // Assert
        const tooltipDirective = fixture.debugElement
                                        .query(By.directive(TooltipTemplateDirective))
                                        .injector
                                        .get(TooltipTemplateDirective);
        expect(tooltipDirective.tooltipContent).toEqual(templateInput);
    });
});
