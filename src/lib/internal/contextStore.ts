// TODO: How to reuse the context stores?

import { getContext, setContext } from "svelte";
import { writable, Writable } from "svelte/store";

const CONTEXT_NAME = "context";
export function useContext<T>(): Writable<T> | undefined {
  return getContext(CONTEXT_NAME);
}

export let context: unknown;
setContext(CONTEXT_NAME, writable(context));
