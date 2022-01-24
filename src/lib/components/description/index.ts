import { createContextStore } from "$lib/internal/context-store";

export interface DescriptionContext {
  name?: string;
  props?: { slotProps?: object };
  register: (value: string) => void;
  descriptionIds?: string;
}

export const [useDescriptionContext, setDescriptionContext] =
  createContextStore<DescriptionContext>();
