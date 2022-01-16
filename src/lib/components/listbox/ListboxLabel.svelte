<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  import { ListboxStates, useListboxContext } from "./Listbox.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "label";
  export let use: HTMLActionArray = [];

  let id = `headlessui-listbox-label-${useId()}`;
  let api = useListboxContext("ListboxLabel");

  let labelRef = $api.labelRef;
  let buttonRef = $api.buttonRef;

  function handleClick(): void {
    $buttonRef?.focus({ preventScroll: true });
  }

  $: slotProps = {
    open: $api.listboxState === ListboxStates.Open,
    disabled: $api.disabled,
  };
</script>

<Render
  {...$$restProps}
  {id}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"ListboxLabel"}
  bind:el={$labelRef}
  on:click={handleClick}
>
  <slot {...slotProps} />
</Render>
