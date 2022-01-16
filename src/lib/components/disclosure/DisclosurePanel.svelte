<script lang="ts" context="module">
  let DISCLOSURE_PANEL_CONTEXT_NAME = "headlessui-disclosure-panel-context";

  export function usePanelContext(): string | undefined {
    return getContext(DISCLOSURE_PANEL_CONTEXT_NAME);
  }
</script>

<script lang="ts">
  import { getContext, setContext } from "svelte";
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import Render, { Features } from "$lib/utils/Render.svelte";

  import { useDisclosureContext, DisclosureStates } from "./Disclosure.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  const api = useDisclosureContext("DisclosurePanel");
  let openClosedState = useOpenClosed();

  setContext(DISCLOSURE_PANEL_CONTEXT_NAME, $api.panelId);

  $: panelStore = $api.panelStore;

  $: visible =
    $openClosedState !== null
      ? $openClosedState === State.Open
      : $api.disclosureState === DisclosureStates.Open;

  $: propsWeControl = { id: $api.panelId };

  $: slotProps = {
    open: $api.disclosureState === DisclosureStates.Open,
    close: $api.close,
  };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"DisclosurePanel"}
  bind:el={$panelStore}
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
