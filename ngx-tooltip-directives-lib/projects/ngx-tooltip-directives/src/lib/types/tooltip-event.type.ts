export type TooltipEventType = 'show' | 'shown' | 'hide' | 'hidden';

export interface TooltipEvent {
	type: TooltipEventType;
	position: { top: number, left: number } | DOMRect;
}
