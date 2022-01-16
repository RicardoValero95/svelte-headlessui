<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  import { useTabsContext } from "./TabGroup.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let api = useTabsContext("TabPanels");
  $: slotProps = { selectedIndex: $api.selectedIndex };
</script>

<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"TabPanels"}
>
  <slot {...slotProps} />
</Render>
