<script lang="ts">
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { hasOpenClosed } from "$lib/internal/open-closed";

  import { hasTransitionContext } from "./common.svelte";
  import TransitionChild from "./TransitionChild.svelte";
  import TransitionRoot from "./TransitionRoot.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "beforeEnter",
    "beforeLeave",
    "afterEnter",
    "afterLeave",
  ]);

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let hasTransition = hasTransitionContext();
  let hasOpen = hasOpenClosed();
</script>

{#if !hasTransition && hasOpen}
  <TransitionRoot
    {...$$props}
    {as}
    use={[...use, forwardEvents]}
    on:afterEnter
    on:afterLeave
    on:beforeEnter
    on:beforeLeave
  >
    <slot />
  </TransitionRoot>
{:else}
  <TransitionChild
    {...$$props}
    {as}
    use={[...use, forwardEvents]}
    on:afterEnter
    on:afterLeave
    on:beforeEnter
    on:beforeLeave
  >
    <slot />
  </TransitionChild>
{/if}
