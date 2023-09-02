import { growBy } from "../../../modules/geometry";
import { Rect, fromRect, toPadd, toRect } from "../../../modules/typing";

type Asset = {
  imageBitmap: ImageBitmap | null;
  rect: Rect;
};

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
      const [sx, sy, sw, sh] = fromRect(item.rect);
      item.imageBitmap &&
        this.ctx.drawImage(item.imageBitmap, sx, sy, sw, sh, x0, dy, sw, sh);
      dy += sh;
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
      const [sx, sy, sw, sh] = fromRect(item.rect);
      item.imageBitmap &&
        this.ctx.drawImage(item.imageBitmap, sx, sy, sw, sh, dx, y0, sw, sh);
      dx += sw;
    }

    const imageBitmap = this.ctx.canvas.transferToImageBitmap();
    const rect = toRect([x0, y0, w1, h1]);
    return { imageBitmap, rect };
  }
}
