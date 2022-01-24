import { getContext, setContext } from "svelte";
import type { Readable, Writable } from "svelte/store";

export function createContextStore<T>(
  id = Symbol("context")
): [() => Readable<T> | undefined, (value: Writable<T>) => void] {
  return [() => getContext(id), (value) => setContext(id, value)];
}
