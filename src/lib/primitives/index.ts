import type { Writable } from "svelte/store";

export type EVERY = {
  disabled: boolean;
};

export type LABEL_AND_TRIGGER = {
  labelStore: Writable<HTMLLabelElement | null>;
  buttonStore: Writable<HTMLButtonElement | null>;
};

// Examples: MenuRoot, Dropdown, Listbox, Dialog (has title)
export type Pop = EVERY & {
  // State
  state: "open" | "close";
  // Mutators
  close(): void;
  open(): void;
};
