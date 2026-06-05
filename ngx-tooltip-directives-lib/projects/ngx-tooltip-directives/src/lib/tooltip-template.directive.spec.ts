import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipTemplateDirective } from './tooltip-template.directive';
import { BaseTooltipDirective } from './base-tooltip.directive';

@Component({
	standalone: true,
	imports: [TooltipTemplateDirective],
	template: `
		<ng-template #initialTemplateRef>Initial Tooltip</ng-template>
		<ng-template #updatedTemplateRef>Updated Tooltip</ng-template>

		<div
			[tooltipTemplate]="useUpdatedTemplate() ? updatedTemplateRef : initialTemplateRef"
			[tooltipContext]="context()">
		</div>
	`
})
class HostComponent {
	readonly useUpdatedTemplate = signal(false);
	readonly context = signal<any>({ initial: true });
}

describe('TooltipTemplateDirective', () => {
	let fixture: ComponentFixture<HostComponent>;
	let hostComponent: HostComponent;
	let tooltipDirective: TooltipTemplateDirective;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
			providers: [provideZonelessChangeDetection()],
		}).compileComponents();

		fixture = TestBed.createComponent(HostComponent);
		hostComponent = fixture.componentInstance;

		tooltipDirective = fixture.debugElement
			.query(By.directive(TooltipTemplateDirective))
			.injector
			.get(TooltipTemplateDirective);
	});

	it('should initialize tooltip with template content', async () => {
		// Act
		await fixture.whenStable();

		// Assert
		expect((tooltipDirective as any)._tooltipContent)
			.toBe(tooltipDirective.tooltipTemplate());
	});

	it('should update tooltip when template input changes', async () => {
		// Arrange
		await fixture.whenStable();

		const initialTemplate = tooltipDirective.tooltipTemplate();

		const setTooltipContentSpy = vi.spyOn(BaseTooltipDirective.prototype, 'setTooltipContent');

		setTooltipContentSpy.mockClear();

		// Act
		hostComponent.useUpdatedTemplate.set(true);
		await fixture.whenStable();

		const updatedTemplate = tooltipDirective.tooltipTemplate();

		// Assert
		expect(updatedTemplate).not.toBe(initialTemplate);

		expect(setTooltipContentSpy).toHaveBeenCalledTimes(1);
		expect(setTooltipContentSpy).toHaveBeenCalledWith(
			updatedTemplate,
			'template'
		);

		expect((tooltipDirective as any)._tooltipContent)
			.toBe(updatedTemplate);
	});

	it('should initialize tooltip with context content', async () => {
		// Act
		await fixture.whenStable();

		// Assert
		expect((tooltipDirective as any)._tooltipContext)
			.toBe(tooltipDirective.tooltipContext());

		expect((tooltipDirective as any)._tooltipContext)
			.toEqual({ initial: true });
	});

	it('should update tooltip when context input changes', async () => {
		// Arrange
		await fixture.whenStable();

		const initialContext = tooltipDirective.tooltipContext();
		const updatedContext = { foo: 123 };

		// Act
		hostComponent.context.set(updatedContext);
		await fixture.whenStable();

		// Assert
		expect(tooltipDirective.tooltipContext())
			.not.toBe(initialContext);

		expect((tooltipDirective as any)._tooltipContext)
			.toBe(tooltipDirective.tooltipContext());

		expect((tooltipDirective as any)._tooltipContext)
			.toBe(updatedContext);
	});
});