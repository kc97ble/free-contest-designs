import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import * as styles from "./index.module.scss";
import { loadImage } from "../../utils";
import { ImageBitmapFactory, parseSource } from "./utils";

const urlBackground = new URL("./assets/background.png", import.meta.url);
const urlLogo = new URL("./assets/logo.png", import.meta.url);

const W = 820;
const H = 360;
const S = 8;

const INITIAL_SOURCE = [
  "CÁC KỲ THI,08/2023",
  "05/08,IOI PRACTICE CONTEST,2023",
  "12/08,TESTING ROUND,53",
  "19/08,TESTING ROUND,54",
  "26/08,FREE CONTEST,149",
].join("\n");

export default function CoverBuilder() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [source, setSource] = useState<string>(INITIAL_SOURCE);

  const draw = async ({
    ctx,
    signal,
  }: {
    ctx: CanvasRenderingContext2D;
    signal: AbortSignal;
  }) => {
    const [mt, mr, mb, ml] = [64, 64, 64, 64];
    const factory = new ImageBitmapFactory({
      size: { w: W * S, h: H * S },
      outputPadding: { t: mt * S, r: mr * S, b: mb * S, l: ml * S },
    });

    const imgBackground = await loadImage(urlBackground.toString());
    signal.throwIfAborted();
    ctx.drawImage(imgBackground, 0, 0, W * S, H * S);

    const imgLogo = await loadImage(urlLogo.toString());
    const imgLogo_aspectRatio = imgLogo.naturalWidth / imgLogo.naturalHeight;
    signal.throwIfAborted();
    ctx.drawImage(
      imgLogo,
      118.3379 * S,
      52.587 * S,
      59.6779 * imgLogo_aspectRatio * S,
      59.6779 * S
    );

    const data = parseSource(source);

    const title_top = await factory.text(
      { content: data.title.top, color: "#201E1E" },
      { font: `700 ${33.03 * S}px "CA Saygon Text", sans-serif` }
    );

    const title_main = await factory.text(
      { content: data.title.main, color: "#2F89FC" },
      { font: `700 ${33.03 * S}px "CA Saygon Text", sans-serif` }
    );

    const title = await factory.col({
      children: [title_top, title_main],
      gap: 8 * S,
    });

    ctx.drawImage(title, 120 * S - ml * S, 144 * S - mt * S);

    const items: ImageBitmap[] = [];

    for (const item of data.items) {
      const top0 = await factory.text(
        { content: item.top, color: "#FFFFFF" },
        { font: `700 ${14.51 * S}px "CA Saygon Text", sans-serif` }
      );

      const top = await factory.box({
        content: top0,
        padding: { t: 2 * S, r: 8 * S, b: 0, l: 8 * S },
        minHeight: 19.72 * S,
        backgroundColor: "#494646",
      });

      const main0 = await factory.text(
        { content: item.main, color: "#FFFFFF" },
        { font: `700 ${20 * S}px "CA Saygon Text", sans-serif` }
      );

      const main = await factory.box({
        content: main0,
        padding: { t: 4 * S, r: 8 * S, b: 0, l: 8 * S },
        minHeight: 28.6092 * S,
        backgroundColor: item.main.includes("TESTING")
          ? "#F16F3E"
          : item.main.includes("BEGINNER")
          ? "#06BA63"
          : item.main.includes("CUP") || item.main.includes("PRACTICE")
          ? "#F5B82E"
          : item.main.includes("FREE")
          ? "#2F89FC"
          : "#201E1E",
      });

      const right0 = await factory.text(
        { content: item.right, color: "#FFFFFF" },
        { font: `700 ${20 * S}px "CA Saygon Text", sans-serif` }
      );
      const right = await factory.box({
        content: right0,
        padding: { t: 4 * S, r: 8 * S, b: 0, l: 8 * S },
        minHeight: 28.6092 * S,
        backgroundColor: "#201E1E",
      });
      const mainRight = await factory.row({ children: [main, right] });
      const topMainRight = await factory.col({ children: [top, mainRight] });
      items.push(topMainRight);
    }

    const list = await factory.col({ children: items, gap: 13.495 * S });

    ctx.drawImage(list, 372.959 * S - ml * S, 59.8108 * S - mt * S);
  };

  useEffect(() => {
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const abortController = new AbortController();
    void draw({ ctx, signal: abortController.signal });
    return () => abortController.abort(null);
  });

  return (
    <article>
      <h1>{"Cover Builder"}</h1>
      <canvas
        ref={setCanvas}
        className={styles.canvas}
        width={W * S}
        height={H * S}
      />
      <form>
        <label>
          {"Source"}
          <textarea
            value={source}
            onInput={(e) => setSource(e.currentTarget.value)}
          />
        </label>
      </form>
    </article>
  );
}
