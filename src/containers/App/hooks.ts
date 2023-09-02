import { useEffect, useState } from "preact/hooks";

export function useHash() {
  const [hash, setHash] = useState<string>();

  useEffect(() => {
    const listener = () => {
      const newHash = location.hash;
      hash !== newHash && setHash(newHash);
    };

    listener();

    window.addEventListener("hashchange", listener);

    return () => window.removeEventListener("hashchange", listener);
  }, [hash]);

  return hash;
}
