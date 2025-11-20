import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
declare const global: any;


setupZonelessTestEnv();

class DOMRectMock {
  top: number;
  left: number;
  right: number;
  bottom: number;

  constructor(public x: number = 0, public y: number = 0, public width: number = 0, public height: number = 0) {
    this.top = y;
    this.left = x;
    this.right = x + width;
    this.bottom = y + height;
  }
}

// Assign the mock to global.DOMRect if DOMRect is not defined
if (typeof DOMRect === "undefined") {
  (global as any).DOMRect = DOMRectMock;
}
