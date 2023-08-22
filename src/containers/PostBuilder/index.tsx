import { h } from "preact";
import { useState } from "preact/hooks";
import * as styles from "./index.module.scss";
import { useMemoAsync } from "./hooks/useMemoAsync";
import { applyGradientMap, assert } from "./utils";
import { useFieldNumber } from "./hooks/useFieldNumber";
import {
  Area,
  AspectRatio,
  Length,
  Ratio,
  Scalar,
  toPadd,
  toRect,
  toRgba,
} from "../../modules/typing";
import { growBy } from "../../modules/geometry";
import { AssetFactory } from "./classes/AssetFactory";

const W = 1080;
const H = 1080;
const S = 4;

export default function PostBuilder() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [file, setFile] = useState<File>();

  const fields = {
    zoom: useFieldNumber(0.0),
    posx: useFieldNumber(0.5),
    posy: useFieldNumber(0.5),
    gammaCorrection: useFieldNumber(0),
  };

  const [imageBitmap, imageBitmap_error] = useMemoAsync(async () => {
    return file ? createImageBitmap(file) : undefined;
  }, [file]);

  const [imageBitmapAfterGradientMap] = useMemoAsync(
    async (signal) => {
      if (!imageBitmap) return undefined;
      await new Promise((resolve) => setTimeout(resolve, 100));
      signal.throwIfAborted();

      return applyGradientMap(
        imageBitmap,
        toRgba([123, 1, 190, 255]),
        toRgba([27, 136, 251, 255]),
        Math.exp(fields.gammaCorrection.value)
      );
    },
    [imageBitmap, fields.gammaCorrection.value]
  );

  const [layerText] = useMemoAsync(async () => {
    const assetFactory = new AssetFactory({ w: W * S, h: H * S });
    const title = assetFactory.text({
      content: "FREE CONTEST 123",
      fontWeight: 700,
      fontSize: 95.17 * S,
      fillStyle: "white",
    });
    return title;
  }, []);

  useMemoAsync(
    async (_signal) => {
      // await new Promise((resolve) => setTimeout(resolve, 50));
      // signal.throwIfAborted();

      const ctx = canvas?.getContext("2d");
      assert(ctx, "cannot create ctx");
      const W0 = ctx.canvas.width;
      const H0 = ctx.canvas.height;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, W0, H0);

      if (imageBitmapAfterGradientMap) {
        const W1: Length = imageBitmapAfterGradientMap.width;
        const H1: Length = imageBitmapAfterGradientMap.height;
        const px: Ratio = fields.posx.value;
        const py: Ratio = fields.posy.value;
        const zm: Scalar = Math.exp(fields.zoom.value);
        const ar: AspectRatio = W1 / H1;
        const a1: Area = Math.max(W0 * (W0 / ar), H0 * (H0 * ar));
        const w1: Length = Math.sqrt(a1 * ar) * zm;
        const h1: Length = Math.sqrt(a1 / ar) * zm;
        const r2 = toRect([px * W0, py * H0, 0, 0]);
        const p2 = toPadd([py * h1, (1 - px) * w1, (1 - py) * h1, px * w1]);
        const r3 = growBy(r2, p2);
        ctx.drawImage(imageBitmapAfterGradientMap, r3.x, r3.y, r3.w, r3.h);
      }

      if (layerText) {
        const {
          imageBitmap,
          rect: { x, y, w, h },
        } = layerText;
        ctx.drawImage(imageBitmap, x, y, w, h, 100, 100, w, h);
      }
    },
    [
      canvas,
      imageBitmapAfterGradientMap,
      layerText,
      fields.posx.value,
      fields.posy.value,
      fields.zoom.value,
    ]
  );

  return (
    <article>
      <h1>{"Post"}</h1>
      <div className={styles.twoColumns}>
        <div className={styles.columnLeft}>
          <canvas
            ref={setCanvas}
            className={styles.canvas}
            width={W * S}
            height={H * S}
          />
        </div>
        <div className={styles.columnRight}>
          <form>
            <label>
              <span>{"Background"}</span>
              <input
                type="file"
                onChange={(event) => {
                  const file = event.currentTarget.files?.item(0);
                  setFile(file || undefined);
                }}
              />
            </label>
            <label>
              <span>{"Zoom"}</span>
              <input
                type="range"
                min={-1}
                max={+1}
                step={1 / (1 << 10)}
                value={fields.zoom.text}
                onInput={(e) => fields.zoom.setText(e.currentTarget.value)}
                onDblClick={() => fields.zoom.setValue(0.0)}
              />
            </label>
            <label>
              <span>{"Position X"}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={1 / (1 << 10)}
                value={fields.posx.text}
                onInput={(e) => fields.posx.setText(e.currentTarget.value)}
                onDblClick={() => fields.posx.setValue(0.5)}
              />
            </label>
            <label>
              <span>{"Position Y"}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={1 / (1 << 10)}
                value={fields.posy.text}
                onInput={(e) => fields.posy.setText(e.currentTarget.value)}
                onDblClick={() => fields.posy.setValue(0.5)}
              />
            </label>
            <label>
              <span>{"Gamma Correction"}</span>
              <input
                type="range"
                min={-2}
                max={2}
                step={1 / 4}
                value={fields.gammaCorrection.text}
                onInput={(e) =>
                  fields.gammaCorrection.setText(e.currentTarget.value)
                }
                onDblClick={() => fields.gammaCorrection.setValue(0)}
              />
            </label>
          </form>
          {imageBitmap_error ? (
            <pre>{JSON.stringify(imageBitmap_error, null, 2)}</pre>
          ) : undefined}
        </div>
      </div>
    </article>
  );
}
