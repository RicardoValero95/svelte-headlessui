<script lang="ts">
  import { tick } from "svelte";
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { Focus } from "$lib/utils/calculate-active-index";
  import { Keys } from "$lib/utils/keyboard";
  import Render from "$lib/utils/Render.svelte";
  import { resolveButtonType } from "$lib/utils/resolve-button-type";

  import { useDropdownContext, States } from "./dropdown";

  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "button";
  export let use: HTMLActionArray = [];

  export let disabled = false;
  const api = useDropdownContext("Trigger");
  const id = `headlessui-dropdown-trigger-${useId()}`;

  $: buttonStore = $api.buttonStore;
  $: itemsStore = $api.itemsStore;
  async function handleKeyDown(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault();
        event.stopPropagation();
        $api.open();
        await tick();
        $itemsStore?.focus({ preventScroll: true });
        $api.goToItem(Focus.First);
        break;

      case Keys.ArrowUp:
        event.preventDefault();
        event.stopPropagation();
        $api.open();
        await tick();
        $itemsStore?.focus({ preventScroll: true });
        $api.goToItem(Focus.Last);
        break;
    }
  }

  function handleKeyUp(e: CustomEvent) {
    let event = e as any as KeyboardEvent;
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault();
        break;
    }
  }

  async function handleClick(e: CustomEvent) {
    let event = e as any as MouseEvent;
    if (disabled) return;
    if ($api.state === States.Open) {
      $api.close();
      await tick();
      $buttonStore?.focus({ preventScroll: true });
    } else {
      event.preventDefault();
      event.stopPropagation();
      $api.open();
      await tick();
      $itemsStore?.focus({ preventScroll: true });
    }
  }

  $: propsWeControl = {
    id,
    type: resolveButtonType({ type: $$props.type, as }, $buttonStore),
    disabled: disabled ? true : undefined,
    "aria-haspopup": true,
    "aria-controls": $itemsStore?.id,
    "aria-expanded": disabled ? undefined : $api.state === States.Open,
  };

  $: slotProps = { open: $api.state === States.Open };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"Trigger"}
  bind:el={$buttonStore}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
>
  <slot {...slotProps} />
</Render>
