import { useState } from "preact/hooks";

export function useFieldNumber(initialValue: number) {
  const [text, setText] = useState(initialValue.toString());

  const value = parseFloat(text);
  const setValue = (value: number) => setText(value.toString());

  return {
    text,
    setText,
    value,
    setValue,
  };
}
