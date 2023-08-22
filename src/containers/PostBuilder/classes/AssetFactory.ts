import { growBy } from "../../../modules/geometry";
import { Rect, toPadd, toRect } from "../../../modules/typing";

type Asset = {
  imageBitmap: ImageBitmap;
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
    fillStyle,
  }: {
    content: string;
    fontSize: number;
    fontWeight: number;
    fillStyle: string;
  }): Asset {
    this.clear();
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = fillStyle;
    this.ctx.font = `${fontWeight} ${fontSize}px "SAYGON", sans-serif`;
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

    return {
      imageBitmap: this.ctx.canvas.transferToImageBitmap(),
      rect,
    };
  }
}
