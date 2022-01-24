import { createContextStore } from "$lib/internal/context-store";

export interface LabelContext {
  name?: string;
  props?: object;
  register: (value: string) => void;
  labelIds?: string;
}

export const [useLabelContext, setLabelContext] =
  createContextStore<LabelContext>();
