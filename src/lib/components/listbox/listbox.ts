import type { Writable } from "svelte/store";

import { createContextStore } from "$lib/internal/context-store";
import type { Focus } from "$lib/utils/calculate-active-index";

export enum ListboxStates {
  Open,
  Closed,
}
export type ListboxOptionDataRef = {
  textValue: string;
  disabled: boolean;
  value: unknown;
};

export type StateDefinition = {
  // State
  listboxState: ListboxStates;
  value: unknown;
  orientation: "vertical" | "horizontal";

  labelRef: Writable<HTMLLabelElement | null>;
  buttonRef: Writable<HTMLButtonElement | null>;
  optionsRef: Writable<HTMLElement | null>;

  disabled: boolean;
  options: { id: string; dataRef: ListboxOptionDataRef }[];
  searchQuery: string;
  activeOptionIndex: number | null;

  // State mutators
  closeListbox(): void;
  openListbox(): void;
  goToOption(focus: Focus, id?: string): void;
  search(value: string): void;
  clearSearch(): void;
  registerOption(id: string, dataRef: ListboxOptionDataRef): void;
  unregisterOption(id: string): void;
  select(value: unknown): void;
};

export const [getListboxContext, setListboxContext] =
  createContextStore<StateDefinition>();

export function useListboxContext(componentName: string) {
  const context = getListboxContext();
  if (context) return context;
  throw new Error(
    `<${componentName} /> is missing a parent <Listbox /> component.`
  );
}
