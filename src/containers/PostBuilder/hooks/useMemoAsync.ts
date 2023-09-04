import { Inputs, useEffect, useState } from "preact/hooks";

type State<T> = { data?: T; error?: unknown };

class Aborted extends Error {}

export function useMemoAsync<T>(
  factory: (signal: AbortSignal) => Promise<T>,
  inputs: Inputs
): [T | undefined, unknown] {
  const [state, setState] = useState<State<T>>({});

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    (async () => {
      try {
        setState({});
        const result = await factory(signal);
        signal.throwIfAborted();
        setState({ data: result });
      } catch (reason) {
        if (reason instanceof Aborted) return;
        setState({ error: reason });
      }
    })();

    return () => abortController.abort(new Aborted());
  }, inputs);

  return [state.data, state.error];
}
