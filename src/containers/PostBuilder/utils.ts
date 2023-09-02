import { Rgba, fromRgba } from "../../modules/typing";

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

export function applyGradientMap(
  imageBitmap: ImageBitmap,
  color0: Rgba,
  color1: Rgba,
  gammaCorrection: number
) {
  const [r0, g0, b0, a0] = fromRgba(color0);
  const [r1, g1, b1, a1] = fromRgba(color1);

  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext("2d");
  assert(ctx, "cannot create ctx");

  ctx.drawImage(imageBitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const bytes = imageData.data;

  for (let i = 0; i < bytes.length; i += 4) {
    const [r, g, b, a] = [bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]];
    const t0 = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const t = Math.pow(t0, gammaCorrection);
    bytes[i] = Math.round(lerp(r0, r1, t));
    bytes[i + 1] = Math.round(lerp(g0, g1, t));
    bytes[i + 2] = Math.round(lerp(b0, b1, t));
    bytes[i + 3] = Math.round(lerp(a0, a1, t) * (a / 255));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.transferToImageBitmap();
}

export function excludeNullishElements<T>(
  array: (T | null | undefined)[]
): T[] {
  return array.filter((item): item is T => item != null);
}
