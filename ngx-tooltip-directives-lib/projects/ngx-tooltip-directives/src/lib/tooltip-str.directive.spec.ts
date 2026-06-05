import { beforeEach, describe, expect, it } from 'vitest';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipStrDirective } from './tooltip-str.directive';

@Component({
	standalone: true,
	imports: [TooltipStrDirective],
	template: `<div [tooltipStr]="testStr()"></div>`
})
class HostComponent {
	readonly testStr = signal('Initial tooltip');
}

describe('TooltipStrDirective', () => {
	let fixture: ComponentFixture<HostComponent>;
	let hostComponent: HostComponent;
	let tooltipDirective: TooltipStrDirective;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HostComponent],
			providers: [provideZonelessChangeDetection()],
		}).compileComponents();

		fixture = TestBed.createComponent(HostComponent);
		hostComponent = fixture.componentInstance;

		tooltipDirective = fixture.debugElement
			.query(By.directive(TooltipStrDirective))
			.injector
			.get(TooltipStrDirective);
	});

	it('should initialize tooltip with string content', async () => {
		// Act
		await fixture.whenStable();

		// Assert
		expect((tooltipDirective as any)._tooltipContent).toBe('Initial tooltip');
	});

	it('should update tooltip when string input changes', async () => {
		// Arrange
		await fixture.whenStable();

		expect((tooltipDirective as any)._tooltipContent).toBe('Initial tooltip');

		const strInput = 'Sample string content';

		// Act
		hostComponent.testStr.set(strInput);
		await fixture.whenStable();

		// Assert
		expect((tooltipDirective as any)._tooltipContent).toBe(strInput);
	});
});