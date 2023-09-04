import { Padd, growBy, growFromCenter } from "./geometry";
import { Rect, fromRect, toPadd, toRect } from "./geometry";

export type Asset = {
  imageBitmap: ImageBitmap | null;
  rect: Rect;
};

export function drawAsset(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  asset: Asset,
  dx: number,
  dy: number
) {
  if (!asset.imageBitmap) return;
  ctx.drawImage(asset.imageBitmap, dx - asset.rect.x, dy - asset.rect.y);
}

export class AssetFactory {
  private ctx: OffscreenCanvasRenderingContext2D;

  constructor({ w, h }: { w: number; h: number }) {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw null;
    this.ctx = ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  text({
    content,
    fontSize,
    fontWeight,
    fontFamily,
    fillStyle,
  }: {
    content: string;
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    fillStyle: string;
  }): Asset {
    this.clear();
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = fillStyle;
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const x = this.ctx.canvas.width / 2;
    const y = this.ctx.canvas.height / 2;
    this.ctx.fillText(content, x, y);

    const metrics = this.ctx.measureText(content);
    const rect = growBy(
      toRect([x, y, 0, 0]),
      toPadd([
        metrics.fontBoundingBoxAscent,
        metrics.actualBoundingBoxRight,
        metrics.fontBoundingBoxDescent,
        metrics.actualBoundingBoxLeft,
      ])
    );
    const imageBitmap = this.ctx.canvas.transferToImageBitmap();

    return { imageBitmap, rect };
  }

  space({ w, h }: { w: number; h: number }): Asset {
    return { imageBitmap: null, rect: toRect([0, 0, w, h]) };
  }

  hspace(w: number): Asset {
    return { imageBitmap: null, rect: toRect([0, 0, w, 0]) };
  }

  vspace(h: number): Asset {
    return { imageBitmap: null, rect: toRect([0, 0, 0, h]) };
  }

  col(content: Asset[]): Asset {
    this.clear();
    // canvas width height
    const w0 = this.ctx.canvas.width;
    const h0 = this.ctx.canvas.height;

    // estimated width height
    const w1 = content
      .map((item) => item.rect.w)
      .reduce((a, b) => Math.max(a, b), 0);
    const h1 = content.map((item) => item.rect.h).reduce((a, b) => a + b, 0);

    const x0 = w0 / 2 - w1 / 2;
    const y0 = h0 / 2 - h1 / 2;
    let dy = y0;

    for (const item of content) {
      drawAsset(this.ctx, item, x0, dy);
      dy += item.rect.h;
    }

    const imageBitmap = this.ctx.canvas.transferToImageBitmap();
    const rect = toRect([x0, y0, w1, h1]);
    return { imageBitmap, rect };
  }

  row(content: Asset[]): Asset {
    this.clear();
    // canvas width height
    const w0 = this.ctx.canvas.width;
    const h0 = this.ctx.canvas.height;

    // estimated width height
    const w1 = content.map((item) => item.rect.w).reduce((a, b) => a + b, 0);
    const h1 = content
      .map((item) => item.rect.h)
      .reduce((a, b) => Math.max(a, b), 0);

    const x0 = w0 / 2 - w1 / 2;
    const y0 = h0 / 2 - h1 / 2;
    let dx = x0;

    for (const item of content) {
      drawAsset(this.ctx, item, dx, y0);
      dx += item.rect.w;
    }

    const imageBitmap = this.ctx.canvas.transferToImageBitmap();
    const rect = toRect([x0, y0, w1, h1]);
    return { imageBitmap, rect };
  }

  box({
    content,
    backgroundColor,
    padding,
    minHeight,
  }: {
    content: Asset;
    backgroundColor: string;
    padding: Padd;
    minHeight: number;
  }) {
    this.clear();

    // canvas width height
    const w0 = this.ctx.canvas.width;
    const h0 = this.ctx.canvas.height;

    const r0 = growFromCenter(
      toRect([w0 / 2, h0 / 2, 0, 0]),
      content.rect.w,
      content.rect.h
    );
    const r1 = growBy(r0, padding);
    const r2 = growFromCenter(r1, 0, Math.max(minHeight - r1.h, 0));
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(r2.x, r2.y, r2.w, r2.h);

    const r3 = growFromCenter(
      toRect([w0 / 2, h0 / 2, 0, 0]),
      content.rect.w,
      content.rect.h
    );
    drawAsset(this.ctx, content, r3.x, r3.y);

    const imageBitmap = this.ctx.canvas.transferToImageBitmap();
    return { imageBitmap, rect: r2 };
  }
}
