<script lang="ts">
<<<<<<< HEAD
=======
  import type { ActionArray } from "$lib/hooks/use-actions";
  import { useActions } from "$lib/hooks/use-actions";
>>>>>>> 0430f2d6b6af02edc6dc5ca00946e2c56d30b0b0
  import { get_current_component } from "svelte/internal";

  import type { ActionArray} from "$lib/hooks/use-actions";
  import { useActions } from "$lib/hooks/use-actions";

  import { forwardEventsBuilder } from "../forwardEventsBuilder";

  export let use: ActionArray = [];
  export let el: HTMLElement | null = null;
  const forwardEvents = forwardEventsBuilder(get_current_component());
</script>

<i bind:this={el} use:useActions={use} use:forwardEvents {...$$restProps}>
  <slot />
</i>
