// TODO: How to reuse the context stores?

import { getContext, setContext } from "svelte";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

const CONTEXT_NAME = "context";
export function useContext<T>(): Writable<T> | undefined {
  return getContext(CONTEXT_NAME);
}

export let context: unknown;
setContext(CONTEXT_NAME, writable(context));
