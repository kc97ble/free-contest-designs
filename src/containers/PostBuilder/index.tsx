import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import * as styles from "./index.module.scss";
import { useMemoAsync } from "./hooks/useMemoAsync";
import { applyGradientMap } from "./utils";
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
} from "../../utils/geometry";
import { growBy } from "../../utils/geometry";
import { AssetFactory } from "../../utils/assets";
import { useFieldString } from "./hooks/useFieldString";
import { loadImage } from "../../utils";

const W = 1080;
const H = 1080;
const S = 4;

const url_pngFreeContestNet = new URL(
  "./assets/freecontest-dot-net.png",
  import.meta.url
);
const url_pngWhiteToBlack = new URL(
  "./assets/white-to-black.png",
  import.meta.url
);
const url_pngLogo = new URL("./assets/logo.png", import.meta.url);

export default function PostBuilder() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [file, setFile] = useState<File>();

  const [areFontsReady] = useMemoAsync(async () => {
    await document.fonts.ready;
    return true;
  }, []);

  const fields = {
    zoom: useFieldNumber(0.0),
    posx: useFieldNumber(0.5),
    posy: useFieldNumber(0.5),
    gammaCorrection: useFieldNumber(0),
    contestLine1: useFieldString("BEGINNER"),
    contestLine2: useFieldString("FREE CONTEST"),
    contestLine3: useFieldString("52"),
    date: useFieldString("03/06/2023"),
    time: useFieldString("19:30 - 22:30"),
    theme: useFieldString("green"),
  };

  const [imageBitmap, imageBitmap_error] = useMemoAsync(async () => {
    return file ? createImageBitmap(file) : undefined;
  }, [file]);

  const [pngFreeContestNet] = useMemoAsync(async () => {
    const img = await loadImage(url_pngFreeContestNet.toString());
    const imageBitmap = await createImageBitmap(img);
    return imageBitmap;
  }, []);

  const [pngWhiteToBlack] = useMemoAsync(async () => {
    const img = await loadImage(url_pngWhiteToBlack.toString());
    const imageBitmap = await createImageBitmap(img);
    return imageBitmap;
  }, []);

  const [pngLogo] = useMemoAsync(async () => {
    const img = await loadImage(url_pngLogo.toString());
    const imageBitmap = await createImageBitmap(img);
    return imageBitmap;
  }, []);

  const [imageBitmapAfterGradientMap] = useMemoAsync(
    async (signal) => {
      const source = imageBitmap || pngWhiteToBlack;
      if (!source) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
      signal.throwIfAborted();

      const [color0, color1] = (() => {
        switch (fields.theme.value) {
          case "blue":
            return [toRgba([123, 1, 190, 255]), toRgba([27, 136, 251, 255])];
          case "green":
            return [toRgba([20, 11, 158, 255]), toRgba([6, 185, 99, 255])];
          case "orange":
            return [toRgba([236, 37, 78, 255]), toRgba([240, 111, 62, 255])];
          case "yellow":
            return [toRgba([240, 111, 62, 255]), toRgba([244, 183, 46, 255])];
          default:
            return [toRgba([0, 0, 0, 255]), toRgba([128, 128, 128, 255])];
        }
      })();

      return applyGradientMap(
        source,
        color0,
        color1,
        Math.exp(fields.gammaCorrection.value)
      );
    },
    [
      imageBitmap,
      pngWhiteToBlack,
      fields.gammaCorrection.value,
      fields.theme.value,
    ]
  );

  const layerText = useMemo(() => {
    const f = new AssetFactory({
      w: W * S,
      h: H * S,
    });
    const date = f.text({
      content: fields.date.value,
      fontWeight: 700,
      fontSize: 54.42 * S,
      fontFamily: '"CA Saygon Text", sans-serif',
      fillStyle: "white",
    });
    const sep = f.text({
      content: " | ",
      fontWeight: 700,
      fontSize: 54.42 * S,
      fontFamily: '"CA Saygon Text", sans-serif',
      fillStyle: "white",
    });
    const time = f.text({
      content: fields.time.value,
      fontWeight: 600,
      fontSize: 54.42 * S,
      fontFamily: '"CA Saygon Text", sans-serif',
      fillStyle: "white",
    });
    const contestLine1 = f.text({
      content: fields.contestLine1.value,
      fontWeight: 700,
      fontSize: 95.17 * S,
      fontFamily: '"CA Saygon Text", sans-serif',
      fillStyle: "white",
    });
    const contestLine2 = fields.contestLine2.value
      ? f.text({
          content: fields.contestLine2.value,
          fontWeight: 700,
          fontSize: 95.17 * S,
          fontFamily: '"CA Saygon Text", sans-serif',
          fillStyle: "white",
        })
      : undefined;
    const contestLine3 = f.text({
      content: fields.contestLine3.value,
      fontWeight: 700,
      fontSize: 291.13 * S,
      fontFamily: '"CA Saygon Text", sans-serif',
      fillStyle: "white",
    });
    return f.col([
      f.row([date, f.hspace(20 * S), sep, f.hspace(20 * S), time]),
      f.vspace(28 * S),
      f.row([
        f.hspace(3 * S),
        contestLine2
          ? f.col([contestLine1, f.vspace(16 * S), contestLine2])
          : contestLine1,
      ]),
      f.vspace(24 * S),
      contestLine3,
    ]);
  }, [
    areFontsReady,
    fields.contestLine1.value,
    fields.contestLine2.value,
    fields.contestLine3.value,
    fields.date.value,
    fields.time.value,
  ]);

  useMemo(() => {
    const ctx = canvas?.getContext("2d");
    if (!ctx) return undefined;
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
      imageBitmap &&
        ctx.drawImage(imageBitmap, x, y, w, h, 76 * S, H * S - h, w, h);
    }

    if (pngFreeContestNet) {
      ctx.drawImage(
        pngFreeContestNet,
        1010 * S - pngFreeContestNet.width,
        1010 * S - pngFreeContestNet.height
      );
    }

    if (pngLogo) {
      ctx.drawImage(pngLogo, 66.97 * S, 55.87 * S);
    }
  }, [
    canvas,
    imageBitmapAfterGradientMap,
    layerText,
    pngFreeContestNet,
    pngLogo,
    fields.posx.value,
    fields.posy.value,
    fields.zoom.value,
  ]);

  return (
    <article>
      <h1>{"Post Builder"}</h1>
      <div className={`grid ${styles.gridGap}`}>
        <div>
          <canvas
            ref={setCanvas}
            className={styles.canvas}
            width={W * S}
            height={H * S}
          />
        </div>
        <div>
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
            <label>
              <span>{"Theme"}</span>
              <select
                value={fields.theme.value}
                onChange={(e) => fields.theme.setValue(e.currentTarget.value)}
              >
                <option value="blue">{"Blue (#1B88FB - #7B01BE)"}</option>
                <option value="green">{"Green (#06B963 - #140B9E)"}</option>
                <option value="orange">{"Orange (#F06F3E - #EC254E)"}</option>
                <option value="yellow">{"Yellow (#F4B72E - #F06F3E)"}</option>
              </select>
            </label>
          </form>
          {imageBitmap_error ? (
            <pre>{JSON.stringify(imageBitmap_error, null, 2)}</pre>
          ) : undefined}
        </div>
      </div>
      <div className="grid">
        <label>
          <span>{"Date"}</span>
          <input
            value={fields.date.value}
            onInput={(e) => fields.date.setValue(e.currentTarget.value)}
          />
        </label>
        <label>
          <span>{"Time"}</span>
          <input
            value={fields.time.value}
            onInput={(e) => fields.time.setValue(e.currentTarget.value)}
          />
        </label>
      </div>
      <div className="grid">
        <label>
          <span>{"Contest Line 1"}</span>
          <input
            value={fields.contestLine1.value}
            onInput={(e) => fields.contestLine1.setValue(e.currentTarget.value)}
          />
        </label>
        <label>
          <span>{"Contest Line 2 (optional)"}</span>
          <input
            value={fields.contestLine2.value}
            onInput={(e) => fields.contestLine2.setValue(e.currentTarget.value)}
          />
        </label>
        <label>
          <span>{"Contest Line 3"}</span>
          <input
            value={fields.contestLine3.value}
            onInput={(e) => fields.contestLine3.setValue(e.currentTarget.value)}
          />
        </label>
      </div>
    </article>
  );
}
