declare module 'spin-wheel' {
  export interface WheelItem {
    label?: string;
    labelColor?: string;
    backgroundColor?: string;
    image?: string | HTMLImageElement;
    imageOpacity?: number;
    imageRadius?: number;
    imageRotation?: number;
    imageScale?: number;
    value?: any;
    weight?: number;
  }

  export interface WheelProps {
    items?: WheelItem[];
    radius?: number;
    itemLabelRadius?: number;
    itemLabelRadiusMax?: number;
    itemLabelRotation?: number;
    itemLabelAlign?: string;
    itemLabelColors?: string[];
    itemLabelBaselineOffset?: number;
    itemLabelFont?: string;
    itemLabelFontSizeMax?: number;
    itemBackgroundColors?: string[];
    backgroundColors?: string[];
    itemBackgroundImage?: string;
    rotationResistance?: number;
    rotationSpeedMax?: number;
    lineWidth?: number;
    lineColor?: string;
    image?: string;
    overlayImage?: string;
    isInteractive?: boolean;
    onRest?: (event: any) => void;
    onSpin?: (event: any) => void;
    onCurrentIndexChange?: (event: any) => void;
    pointerAngle?: number;
    borderWidth?: number;
    borderColor?: string;
    debug?: boolean;
    offset?: { x?: number; y?: number; w?: number; h?: number };
  }

  export class Wheel {
    constructor(container: HTMLElement, props?: WheelProps);
    init(props?: WheelProps): void;
    spin(rotationSpeed?: number): void;
    spinTo(itemIndex?: number, duration?: number, spinToCenter?: boolean, numberOfRevolutions?: number, direction?: number, easingFunction?: (n: number) => number): void;
    spinToItem(itemIndex?: number, duration?: number, spinToCenter?: boolean, numberOfRevolutions?: number, direction?: number, easingFunction?: (n: number) => number): void;
    stop(): void;
    getCurrentIndex(): number;
    remove(): void;
    resize(): void;
    items: WheelItem[];
    radius: number;
    isSpinning: boolean;
    itemLabelRadius: number;
    itemLabelRadiusMax: number;
    itemLabelRotation: number;
    itemLabelAlign: string;
    itemLabelColors: string[];
    itemLabelBaselineOffset: number;
    itemLabelFont: string;
    itemLabelFontSizeMax: number;
    itemBackgroundColors: string[];
    rotationResistance: number;
    rotationSpeedMax: number;
    lineWidth: number;
    lineColor: string;
    overlayImage: string;
    isInteractive: boolean;
    pointerAngle: number;
    borderWidth: number;
    borderColor: string;
    debug: boolean;
    offset: { x: number; y: number; w: number; h: number };
    onRest: ((event: any) => void) | null;
    onSpin: ((event: any) => void) | null;
    onCurrentIndexChange: ((event: any) => void) | null;
  }
}
