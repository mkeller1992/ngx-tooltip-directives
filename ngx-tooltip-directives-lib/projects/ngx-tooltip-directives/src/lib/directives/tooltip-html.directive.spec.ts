import { beforeEach, describe, expect, it } from 'vitest';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, SafeHtml } from '@angular/platform-browser';
import { TooltipHtmlDirective } from './tooltip-html.directive';

@Component({
	standalone: true,
	imports: [TooltipHtmlDirective],
	template: `<div [tooltipHtml]="testHtml()"></div>`
})
class HostComponent {
	readonly testHtml = signal<SafeHtml>('<div>Initial tooltip</div>');
}

describe('TooltipHtmlDirective', () => {
	let fixture: ComponentFixture<HostComponent>;
	let hostComponent: HostComponent;
	let tooltipDirective: TooltipHtmlDirective;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
			providers: [provideZonelessChangeDetection()],
		}).compileComponents();

		fixture = TestBed.createComponent(HostComponent);
		hostComponent = fixture.componentInstance;

		tooltipDirective = fixture.debugElement
			.query(By.directive(TooltipHtmlDirective))
			.injector
			.get(TooltipHtmlDirective);
	});

	it('should initialize tooltip with HTML content', async () => {
		// Act
		await fixture.whenStable();

		// Assert
		expect((tooltipDirective as any)._tooltipContent)
			.toBe('<div>Initial tooltip</div>');
	});

	it('should update tooltip when HTML input changes', async () => {
		// Arrange
		await fixture.whenStable();

		expect((tooltipDirective as any)._tooltipContent)
			.toBe('<div>Initial tooltip</div>');

		// Act
		const htmlInput = '<div>Sample HTML content</div>';

		hostComponent.testHtml.set(htmlInput);
		await fixture.whenStable();

		// Assert
		expect((tooltipDirective as any)._tooltipContent).toBe(htmlInput);
	});
});