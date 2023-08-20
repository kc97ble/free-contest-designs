function loadImage$WithoutMemoization(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (event) => reject(event);
    img.src = url.toString();
  });
}

function memoize<T extends unknown[], R>(
  func: (...args: T) => R,
  resolver?: (...args: T) => string
) {
  const cache = new Map();
  const memoized = function (...args: T): R {
    const key = resolver ? resolver(...args) : args[0];
    if (cache.has(key)) return cache.get(key);
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
  return memoized;
}

export const loadImage = memoize(loadImage$WithoutMemoization);
