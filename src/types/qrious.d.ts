interface QRiousOptions {
  element: HTMLCanvasElement;
  value: string;
  size: number;
  background: string;
  foreground: string;
  level: string;
}

interface QRiousConstructor {
  new (options: QRiousOptions): any;
}

interface Window {
  QRious?: QRiousConstructor;
}
