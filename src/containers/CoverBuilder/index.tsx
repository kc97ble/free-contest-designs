import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import * as styles from "./index.module.scss";
import { loadImage } from "../../utils";
import { parseSource } from "./utils";
import { useMemoAsync } from "../PostBuilder/hooks/useMemoAsync";
import { Asset, AssetFactory, drawAsset } from "../../utils/assets";
import { toPadd } from "../../utils/geometry";

const url_pngBackground = new URL("./assets/background.png", import.meta.url);
const url_pngLogo = new URL("./assets/logo.png", import.meta.url);

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

  const [areFontsReady] = useMemoAsync(async () => {
    await document.fonts.ready;
    return true;
  }, []);

  const [pngBackground] = useMemoAsync(
    async () => await loadImage(url_pngBackground.toString()),
    []
  );

  const [pngLogo] = useMemoAsync(
    async () => await loadImage(url_pngLogo.toString()),
    []
  );

  const data = parseSource(source);

  const layerTitle = useMemo(() => {
    if (!areFontsReady) return undefined;
    const f = new AssetFactory({ w: W * S, h: H * S });
    return f.col([
      f.text({
        content: data.title.top,
        fillStyle: "#201E1E",
        fontSize: 33.03 * S,
        fontFamily: '"CA Saygon Text", sans-serif',
        fontWeight: 700,
      }),
      f.vspace(7 * S),
      f.text({
        content: data.title.main,
        fillStyle: "#2F89FC",
        fontSize: 33.03 * S,
        fontFamily: '"CA Saygon Text", sans-serif',
        fontWeight: 700,
      }),
    ]);
  }, [data.title.top, data.title.main, areFontsReady]);

  const layerContent = useMemo(() => {
    if (!areFontsReady) return undefined;
    const f = new AssetFactory({ w: W * S, h: H * S });

    const items: Asset[] = [];
    for (const item of data.items) {
      const top = f.box({
        content: f.text({
          content: item.top,
          fillStyle: "#FFFFFF",
          fontSize: 14.51 * S,
          fontFamily: '"CA Saygon Text", sans-serif',
          fontWeight: 700,
        }),
        padding: toPadd([2 * S, 8 * S, 0, 8 * S]),
        minHeight: 19.72 * S,
        backgroundColor: "#494646",
      });

      const main = f.box({
        content: f.text({
          content: item.main,
          fillStyle: "#FFFFFF",
          fontSize: 20 * S,
          fontFamily: '"CA Saygon Text", sans-serif',
          fontWeight: 700,
        }),
        padding: toPadd([4 * S, 8 * S, 0, 8 * S]),
        minHeight: 28.61 * S,
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

      const right = f.box({
        content: f.text({
          content: item.right,
          fillStyle: "#FFFFFF",
          fontSize: 20 * S,
          fontFamily: '"CA Saygon Text", sans-serif',
          fontWeight: 700,
        }),
        padding: toPadd([4 * S, 8 * S, 0, 8 * S]),
        minHeight: 28.61 * S,
        backgroundColor: "#201E1E",
      });

      items.length && items.push(f.vspace(13.5 * S));
      items.push(f.col([top, f.row([main, right])]));
    }

    return f.col(items);
  }, [JSON.stringify(data.items), areFontsReady]);

  useMemo(async () => {
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    pngBackground && ctx.drawImage(pngBackground, 0, 0, W * S, H * S);

    pngLogo &&
      ctx.drawImage(
        pngLogo,
        118.34 * S,
        52.59 * S,
        ((59.68 * pngLogo.naturalWidth) / pngLogo.naturalHeight) * S,
        59.68 * S
      );

    layerTitle && drawAsset(ctx, layerTitle, 120 * S, 144 * S);

    layerContent &&
      drawAsset(
        ctx,
        layerContent,
        372.96 * S,
        (H / 2) * S - layerContent.rect.h / 2 - 4.64 * S
      );
  }, [pngBackground, pngLogo, layerTitle, layerContent]);

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
        <textarea
          className={styles.textarea}
          value={source}
          onInput={(e) => setSource(e.currentTarget.value)}
        />
      </form>
    </article>
  );
}
