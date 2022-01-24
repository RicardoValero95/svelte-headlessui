<script lang="ts">
  import { onMount } from "svelte";
  import { get_current_component } from "svelte/internal";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";

  import TransitionChild from "$lib/components/transitions/TransitionChild.svelte";
  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { State, useOpenClosed } from "$lib/internal/open-closed";
  import { match } from "$lib/utils/match";

  import type {
    NestingContextValues,
    TransitionContextValues,
  } from "./common.svelte";
  import {
    hasChildren,
    TreeStates,
    useNesting,
    setParentNestingContext,
    setTransitionContext,
  } from "./common.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "beforeEnter",
    "beforeLeave",
    "afterEnter",
    "afterLeave",
  ]);

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  export let show: boolean | undefined = undefined;
  export let appear = false;

  let openClosedState = useOpenClosed();

  function computeShow(
    show: boolean | undefined,
    openClosedState: State | undefined
  ): boolean | undefined {
    if (show === undefined && openClosedState !== undefined) {
      return match(openClosedState, {
        [State.Open]: true,
        [State.Closed]: false,
      });
    }

    return show;
  }

  let shouldShow = computeShow(
    show,
    openClosedState !== undefined ? $openClosedState : undefined
  );

  let initialShow = shouldShow;

  $: {
    shouldShow = computeShow(
      show,
      openClosedState !== undefined ? $openClosedState : undefined
    );
    if (shouldShow !== true && shouldShow !== false) {
      throw new Error(
        "A <Transition /> is used but it is missing a `show={true | false}` prop."
      );
    }
  }
  let state = shouldShow ? TreeStates.Visible : TreeStates.Hidden;

  let nestingBag: Writable<NestingContextValues> = writable(
    useNesting(() => {
      state = TreeStates.Hidden;
    })
  );

  let initial = true;
  let transitionBag: Writable<TransitionContextValues> = writable();
  $: transitionBag.set({
    show: !!shouldShow,
    appear: appear || !initial,
    initialShow: !!initialShow,
  });

  onMount(() => {
    initial = false;
  });

  $: if (!initial) {
    if (shouldShow) {
      state = TreeStates.Visible;
    } else if (!hasChildren($nestingBag)) {
      state = TreeStates.Hidden;
    }
  }
  setParentNestingContext(nestingBag);
  setTransitionContext(transitionBag);
</script>

{#if state === TreeStates.Visible || $$props.unmount === false}
  <TransitionChild
    {...$$restProps}
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
