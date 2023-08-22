import { Padd, Quad, Rect, toRect } from "./typing";

export const growBy = ({ x, y, w, h }: Rect, { t, r, b, l }: Padd) =>
  toRect([x - l, y - t, w + l + r, h + t + b]);

type Wrapped<T> = {
  done: () => T;
  then: <R>(unary: (value: T) => R) => Wrapped<R>;
};

export function wrap<T>(value: T): Wrapped<T> {
  return {
    done: () => value,
    then: (unary) => wrap(unary(value)),
  };
}
