import { Placement } from "./placement.type";
import { ContentType } from "./base-tooltip.directive";

export interface TooltipOptions {
    id?: string | number;
    placement?: Placement;
    autoPlacement?: boolean;
    contentType?: ContentType;
    textColor?: string,
	backgroundColor?: string,
	borderColor?: string,
    textAlign?: "left" | "center" | "right";
    padding?: string;
    shadow?: boolean;
    showDelay?: number;
    hideDelay?: number;
    hideDelayTouchscreen?: number;
    zIndex?: number;
    animationDuration?: number;
    animationDurationDefault?: number;
    trigger?: "hover" | "click" | "programmatically";
    tooltipClass?: string;
    display?: boolean;
    displayTouchscreen?: boolean;
    offset?: number;
    width?: string;
    maxWidth?: string;
    hideDelayAfterClick?: number;
    pointerEvents?: "auto" | "none";
    position?: {top: number, left: number};
}