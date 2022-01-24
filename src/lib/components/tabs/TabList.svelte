<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  import { useTabGroupContext } from "./TabGroup.svelte";

  const COMPONENT_NAME = "TabList";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let api = useTabGroupContext(COMPONENT_NAME);
  let listRef = $api.listRef;

  $: propsWeControl = {
    role: COMPONENT_NAME.toLocaleLowerCase(),
    "aria-orientation": $api.orientation,
  };

  $: slotProps = { selectedIndex: $api.selectedIndex };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  bind:el={$listRef}
  use={[...use, forwardEvents]}
  name={COMPONENT_NAME}
>
  <slot {...slotProps} />
</Render>
