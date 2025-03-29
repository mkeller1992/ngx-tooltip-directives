import { TooltipOptions } from "./options.interface";

export const defaultOptions: TooltipOptions = {
	id: 0,
	placement: 'top',
	autoPlacement: true,
	contentType: 'string',
	textColor: 'black',
	backgroundColor: 'white',
	borderColor: 'blue',
	textAlign: 'center',
	padding: '5px 8px',
	shadow: true,
	showDelay: 0,
	hideDelay: 0,
	hideDelayTouchscreen: 0,
	hideDelayAfterClick: 0,
	zIndex: 0,
	animationDuration: 100,
	animationDurationDefault: 100,
	trigger: 'hover',
	tooltipClass: '',
	display: true,
	displayTouchscreen: true,
	offset: 8,
	maxWidth: '200px',
	pointerEvents: 'auto', // 'none' would mean that there is no reaction to clicks
	appendTooltipToBody: true
}
