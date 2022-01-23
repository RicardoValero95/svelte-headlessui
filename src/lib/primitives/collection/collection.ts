import type { Writable } from "svelte/store";

import type { Focus } from "$lib/utils/focus-management";

import type { EVERY } from "..";

/*
Aliases: Options, Items, Group
Menu 
Listbox 
RadioGroup (BUT: has firstOption, containsCheckedOption)
SwitchGroup
CheckboxGroup (BUT: has Indeterminate state)
*/
export type Collection<T> = EVERY & {
  // State
  value: T | Array<T>;
  itemsStore: Writable<HTMLElement | null>;
  items: { id: string; data: Item<T> }[];
  activeItemIndex: number | null;
  searchQuery: string;

  // Mutators
  goTo(focus: Focus, id?: string): void;
  search(textValue: string): void;
  clearSearch(): void;
  register(id: string, data: Item<T>): void;
  unregister(id: string): void;
  change(value: T): void;
};

// Examples: Option, Item
export type Item<T> = EVERY & {
  value: T;
  textValue: string;

  // props from parent: active, selected/checked ,  isFirstOption, disabled
};
