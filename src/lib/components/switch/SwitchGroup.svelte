<script lang="ts" context="module">
  export interface StateDefinition {
    switchStore: Writable<HTMLButtonElement | null>;
  }

  const SWITCH_CONTEXT_NAME = "headlessui-switch-context";
  export function useSwitchContext(): Writable<StateDefinition> | undefined {
    return getContext(SWITCH_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { getContext, setContext } from "svelte";
  import { get_current_component } from "svelte/internal";
  import { Writable, writable } from "svelte/store";

  import DescriptionProvider from "$lib/components/description/DescriptionProvider.svelte";
  import LabelProvider from "$lib/components/label/LabelProvider.svelte";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
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
  setContext(SWITCH_CONTEXT_NAME, api);

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
