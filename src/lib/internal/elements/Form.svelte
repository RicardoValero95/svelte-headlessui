<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import { ActionArray, useActions } from "$lib/hooks/use-actions";

  import { forwardEventsBuilder } from "../forwardEventsBuilder";

  export let use: ActionArray = [];
  export let el: HTMLFormElement | null = null;
  const forwardEvents = forwardEventsBuilder(get_current_component());
</script>

<form bind:this={el} use:useActions={use} use:forwardEvents {...$$restProps}>
  <slot />
</form>
