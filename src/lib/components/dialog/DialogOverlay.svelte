<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  import { DialogStates, useDialogContext } from "./Dialog.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let api = useDialogContext("DialogOverlay");
  let id = `headlessui-dialog-overlay-${useId()}`;

  function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    $api.close();
  }

  $: propsWeControl = {
    id,
    "aria-hidden": true,
  };

  $: slotProps = { open: $api.state === DialogStates.Open };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"DialogOverlay"}
  on:click={handleClick}
>
  <slot {...slotProps} />
</Render>
