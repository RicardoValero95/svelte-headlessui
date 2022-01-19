import { getContext, setContext } from "svelte";
import type { Readable, Writable } from "svelte/store";

import type { Focus } from "$lib/utils/calculate-active-index";

type Values<T> = T[keyof T];

export enum States {
  Open,
  Closed,
}
export const Orientation = {
  vertical: "vertical",
  horizontal: "horizontal",
} as const;
export type Orientation = Values<typeof Orientation>;

export type OptionDataRef = {
  textValue: string;
  disabled: boolean;
  value: unknown;
};

export type StateDefinition = {
  // State
  state: States;
  value: unknown;
  orientation: Orientation;
  disabled: boolean;

  labelRef: Writable<HTMLLabelElement | null>;
  buttonRef: Writable<HTMLButtonElement | null>;
  optionsRef: Writable<HTMLElement | null>;

  // Children state
  options: { id: string; dataRef: OptionDataRef }[];
  searchQuery: string;
  activeOptionIndex: number | null;

  // State mutators
  close(): void;
  open(): void;
  goToOption(focus: Focus, id?: string): void;
  search(value: string): void;
  clearSearch(): void;
  registerOption(id: string, dataRef: OptionDataRef): void;
  unregisterOption(id: string): void;
  select(value: unknown): void;
};

const ROOT_CONTEXT = Symbol("headlessui-root-context");

export function useRootContext(component: string): Readable<StateDefinition> {
  const context: Writable<StateDefinition> | undefined =
    getContext(ROOT_CONTEXT);
  if (context === undefined) {
    throw new Error(`<${component} /> is missing a parent <Root /> component.`);
  }
  return context;
}

export function useRootProvider(value: Writable<StateDefinition>) {
  setContext(ROOT_CONTEXT, value);
}
