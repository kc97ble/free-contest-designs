export type Ratio = number; // 0.0 .. 1.0
export type Length = number; // width, or height
export type Area = number; // width * height
export type AspectRatio = number; // width / height
export type Scalar = number; // a constant for scaling
export type Byte = number; // 0 .. 255

export type Rect = { x: Length; y: Length; w: Length; h: Length };
export type Padd = { t: Length; r: Length; b: Length; l: Length };
export type Rgba = { r: Byte; g: Byte; b: Byte; a: Byte };
export type Quad = [Length, Length, Length, Length];

export const fromRect = ({ x, y, w, h }: Rect): Quad => [x, y, w, h];
export const toRect = ([x, y, w, h]: Quad): Rect => ({ x, y, w, h });
export const fromPadd = ({ t, r, b, l }: Padd): Quad => [t, r, b, l];
export const toPadd = ([t, r, b, l]: Quad): Padd => ({ t, r, b, l });
export const fromRgba = ({ r, g, b, a }: Rgba): Quad => [r, g, b, a];
export const toRgba = ([r, g, b, a]: Quad): Rgba => ({ r, g, b, a });

export const growBy = ({ x, y, w, h }: Rect, { t, r, b, l }: Padd) =>
  toRect([x - l, y - t, w + l + r, h + t + b]);
