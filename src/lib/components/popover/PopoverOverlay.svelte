<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import Render, { Features } from "$lib/utils/Render.svelte";

  import { PopoverStates, usePopoverContext } from "./Popover.svelte";

  const COMPONENT_NAME = "PopoverOverlay";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let api = usePopoverContext(COMPONENT_NAME);
  let id = `headlessui-popover-overlay-${useId()}`;

  let openClosedState = useOpenClosed();

  $: visible =
    openClosedState !== undefined
      ? $openClosedState === State.Open
      : $api.popoverState === PopoverStates.Open;

  function handleClick() {
    $api.closePopover();
  }

  $: slotProps = { open: $api.popoverState === PopoverStates.Open };

  $: propsWeControl = { id };
</script>

<Render
  {...$$restProps}
  {...propsWeControl}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={COMPONENT_NAME}
  on:click={handleClick}
  aria-hidden
  {visible}
  features={Features.RenderStrategy | Features.Static}
>
  <slot {...slotProps} />
</Render>
