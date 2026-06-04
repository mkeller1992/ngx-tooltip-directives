class DOMRectMock implements DOMRect {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;

  constructor(
    readonly x: number = 0,
    readonly y: number = 0,
    readonly width: number = 0,
    readonly height: number = 0
  ) {
    this.top = y;
    this.left = x;
    this.right = x + width;
    this.bottom = y + height;
  }

  static fromRect(other: DOMRectInit = {}): DOMRect {
    return new DOMRectMock(
      other.x ?? 0,
      other.y ?? 0,
      other.width ?? 0,
      other.height ?? 0
    );
  }

  toJSON(): object {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      top: this.top,
      left: this.left,
      right: this.right,
      bottom: this.bottom
    };
  }
}

// Assign the mock to globalThis.DOMRect if DOMRect is not defined
if (typeof globalThis.DOMRect === 'undefined') {
  globalThis.DOMRect = DOMRectMock;
}