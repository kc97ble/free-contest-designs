type Options = Pick<OffscreenCanvasRenderingContext2D, "fillStyle" | "font">;

type Bounds = { x: number; y: number; w: number; h: number };
type Padding = { t: number; r: number; b: number; l: number };

function grow({ x, y, w, h }: Bounds, ...paddings: Padding[]): Bounds {
  for (const { t, r, b, l } of paddings) {
    (x -= l), (y -= t), (w += l + r), (h += t + b);
  }
  return { x, y, w, h };
}

export class ImageBitmapFactory {
  private ctx: OffscreenCanvasRenderingContext2D;
  private outputPadding: Padding;

  constructor({
    size,
    outputPadding,
  }: {
    size: { w: number; h: number };
    outputPadding: Padding;
  }) {
    const canvas = new OffscreenCanvas(size.w, size.h);
    const ctx = canvas.getContext("2d");
    (globalThis as any).ctx = ctx;
    if (!ctx) throw null;
    this.ctx = ctx;
    this.outputPadding = outputPadding;
  }

  applyOptions(options: Partial<Options>) {
    for (const key in options) {
      (this as any).ctx[key] = (options as any)[key];
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  fillRect({ x, y, w, h }: Bounds) {
    this.ctx.fillRect(x, y, w, h);
  }

  draw(image: ImageBitmap, x: number, y: number) {
    this.ctx.drawImage(
      image,
      x - this.outputPadding.l,
      y - this.outputPadding.t
    );
  }

  async slice(bounds: Bounds) {
    const { x, y, w, h } = grow(bounds, this.outputPadding);
    return await createImageBitmap(this.ctx.canvas, x, y, w, h);
  }

  async text(
    {
      content,
      color,
      padding = { t: 0, r: 0, b: 0, l: 0 },
    }: {
      content: string;
      color: Options["fillStyle"];
      padding?: Padding;
    },
    options?: Partial<Options>
  ) {
    this.clear();
    options && this.applyOptions(options);
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";

    this.ctx.fillStyle = color;
    const x = this.ctx.canvas.width / 2;
    const y = this.ctx.canvas.height / 2;
    this.ctx.fillText(content, x, y);

    const metrics = this.ctx.measureText(content);

    const bounds = grow(
      { x, y, w: 0, h: 0 },
      {
        t: metrics.fontBoundingBoxAscent,
        r: metrics.actualBoundingBoxRight,
        b: metrics.fontBoundingBoxDescent,
        l: metrics.actualBoundingBoxLeft,
      },
      padding,
      this.outputPadding
    );

    return await createImageBitmap(
      this.ctx.canvas,
      bounds.x,
      bounds.y,
      bounds.w,
      bounds.h
    );
  }

  async row({ children, gap = 0 }: { children: ImageBitmap[]; gap?: number }) {
    this.clear();
    const [mt, mr, mb, ml] = [
      this.outputPadding.t,
      this.outputPadding.r,
      this.outputPadding.b,
      this.outputPadding.l,
    ];
    let [x, y, w, h] = [ml, mt, 0, 0];

    for (const item of children) {
      if (w || h) w += gap;
      this.ctx.drawImage(item, x + w - ml, y - mt);
      w += item.width - ml - mr;
      h = Math.max(h, item.height - mt - mb);
    }
    const bounds = grow({ x, y, w, h }, this.outputPadding);

    return await createImageBitmap(
      this.ctx.canvas,
      bounds.x,
      bounds.y,
      bounds.w,
      bounds.h
    );
  }

  async col({ children, gap = 0 }: { children: ImageBitmap[]; gap?: number }) {
    this.clear();
    const [mt, mr, mb, ml] = [
      this.outputPadding.t,
      this.outputPadding.r,
      this.outputPadding.b,
      this.outputPadding.l,
    ];
    let [x, y, w, h] = [ml, mt, 0, 0];

    for (const item of children) {
      if (w || h) h += gap;
      this.ctx.drawImage(item, x - ml, y + h - mt);
      w = Math.max(w, item.width - ml - mr);
      h += item.height - mt - mb;
    }
    const bounds = grow({ x, y, w, h }, this.outputPadding);

    return await createImageBitmap(
      this.ctx.canvas,
      bounds.x,
      bounds.y,
      bounds.w,
      bounds.h
    );
  }

  async box({
    content,
    padding,
    minHeight = 0,
    backgroundColor,
  }: {
    content: ImageBitmap;
    padding: Padding;
    minHeight?: number;
    backgroundColor: Options["fillStyle"];
  }) {
    this.clear();
    const [mt, mr, mb, ml] = [
      this.outputPadding.t,
      this.outputPadding.r,
      this.outputPadding.b,
      this.outputPadding.l,
    ];

    const [cx, cy] = [this.ctx.canvas.width / 2, this.ctx.canvas.height / 2];

    const contentBounds = grow(
      { x: cx, y: cy, w: 0, h: 0 },
      {
        t: (content.height - mt - mb) / 2,
        r: (content.width - ml - mr) / 2,
        b: (content.height - mt - mb) / 2,
        l: (content.width - ml - mr) / 2,
      }
    );

    const boxBounds0 = grow(contentBounds, padding);
    const boxBounds = grow(
      boxBounds0,
      boxBounds0.h < minHeight
        ? {
            t: (minHeight - boxBounds0.h) / 2,
            r: 0,
            b: (minHeight - boxBounds0.h) / 2,
            l: 0,
          }
        : { t: 0, r: 0, b: 0, l: 0 }
    );

    this.ctx.fillStyle = backgroundColor;
    this.fillRect(boxBounds);
    this.draw(content, contentBounds.x, contentBounds.y);
    return await this.slice(boxBounds);
  }
}

export function parseSource(source: string) {
  const [firstLine = "", ...otherLines] = source.split("\n");
  const [title_top = "", title_main = ""] = firstLine.split(",");
  const title = { top: title_top, main: title_main };
  const items = otherLines.map((line) => {
    const [top = "", main = "", right = ""] = line.split(",");
    return { top, main, right };
  });
  return { title, items };
}
