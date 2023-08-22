import { Inputs, useEffect, useReducer, useState } from "preact/hooks";

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
        console.log("calling factory");
        const result = await factory(signal);
        signal.throwIfAborted();
        setState({ data: result });
      } catch (reason) {
        if (reason instanceof Aborted) return;
        setState({ error: reason });
      }
    })();

    return () => {
      console.log("leave");
      abortController.abort(new Aborted());
    };
  }, inputs);

  return [state.data, state.error];
}
