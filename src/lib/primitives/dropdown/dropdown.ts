import { getContext, setContext } from "svelte";
import type { Readable, Writable } from "svelte/store";

import type { Focus } from "$lib/utils/calculate-active-index";

export enum States {
  Open,
  Closed,
}

export type ItemData = { textValue: string; disabled: boolean };

export type StateDefinition = {
  // State
  state: States;

  buttonStore: Writable<HTMLButtonElement | null>;
  itemsStore: Writable<HTMLDivElement | null>;

  // Children state
  items: { id: string; data: ItemData }[];
  searchQuery: string;
  activeItemIndex: number | null;

  // State mutators
  close(): void;
  open(): void;
  search(value: string): void;
  clearSearch(): void;
  goToItem(focus: Focus, id?: string): void;
  registerItem(id: string, dataRef: ItemData): void;
  unregisterItem(id: string): void;
};

const DROPDOWN_CONTEXT = Symbol("headlessui-dropdown-context");

export function useDropdownContext(
  componentName: string
): Readable<StateDefinition> {
  const context: Writable<StateDefinition> | undefined =
    getContext(DROPDOWN_CONTEXT);

  if (context === undefined) {
    throw new Error(
      `<${componentName} /> is missing a parent <Dropdown /> component.`
    );
  }
  return context;
}

export function useDropdownProvider(value: Writable<StateDefinition>) {
  setContext(DROPDOWN_CONTEXT, value);
}
