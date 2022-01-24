<script lang="ts" context="module">
  export interface StateDefinition {
    switchStore: Writable<HTMLButtonElement | null>;
  }

  export const [getSwitchGroupContext, setSwitchGroupContext] =
    createContextStore<StateDefinition>();

  export function useSwitchContext() {
    return getSwitchGroupContext();
  }
</script>

<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";

  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { createContextStore } from "$lib/internal/context-store";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let switchStore: StateDefinition["switchStore"] = writable(null);

  let api: Writable<StateDefinition> = writable({
    switchStore,
  });
  setSwitchGroupContext(api);

  function onClick() {
    if (!$switchStore) return;
    $switchStore.click();
    $switchStore.focus({ preventScroll: true });
  }
</script>

<Render
  {...$$restProps}
  {as}
  use={[...use, forwardEvents]}
  name={"SwitchGroup"}
>
  <DescriptionProvider name="SwitchDescription">
    <LabelProvider name="SwitchLabel" {onClick}>
      <slot />
    </LabelProvider>
  </DescriptionProvider>
</Render>
