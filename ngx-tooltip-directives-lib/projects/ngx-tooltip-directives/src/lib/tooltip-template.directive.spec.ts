import { Component, provideZonelessChangeDetection, TemplateRef, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from "@angular/platform-browser";
import { TooltipTemplateDirective } from './tooltip-template.directive';
import { BaseTooltipDirective } from "./base-tooltip.directive";

@Component({
    standalone: false,
    template: `
        <ng-template #templateRef>Initial Tooltip</ng-template>

        <div [tooltipTemplate]="templateRef"
             [tooltipContext]="context">
        </div>
    `
})
class HostComponent {
    @ViewChild('templateRef', { static: true })
    templateRef!: TemplateRef<any>;

    context: any = { initial: true };
}

describe('TooltipTemplateDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let hostComponent: HostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HostComponent],
            imports: [TooltipTemplateDirective],
            providers: [provideZonelessChangeDetection()],
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
        expect((tooltipDirective as any)._tooltipContent).toEqual(templateInput);
    });

	it('should forward tooltipContext input to BaseTooltipDirective', () => {
        // Arrange
        fixture.detectChanges();

        const directive = fixture.debugElement
            .query(By.directive(TooltipTemplateDirective))
            .injector
            .get(TooltipTemplateDirective);

        const spy = jest.spyOn(
            BaseTooltipDirective.prototype as any,
            'setTooltipContext'
        );

        const contextContent = { foo: 123 };

        // Act: call the Input setter directly
        (directive as any).tooltipContext = contextContent;

        // Assert: verify delegation to base class
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(contextContent);
	});

});
