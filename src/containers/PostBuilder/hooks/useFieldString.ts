import { useState } from "preact/hooks";

export function useFieldString(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  return { value, setValue };
}
