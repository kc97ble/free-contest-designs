import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import styles from "./index.module.scss";

const W = 2048;
const H = 900;

export default function CoverBuilder() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgb(200, 0, 0)";
    ctx.fillRect(10, 10, 50, 50);

    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect(30, 30, 50, 50);
  });

  return (
    <article>
      <h1 className="underline">{"Cover Builder"}</h1>
      <canvas
        ref={setCanvas}
        className={styles.canvas}
        width={W}
        height={H}
      ></canvas>
    </article>
  );
}
