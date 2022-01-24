<script lang="ts" context="module">
  export interface PopoverGroupContext {
    register(registerbag: PopoverRegisterBag): void;
    unregister(registerbag: PopoverRegisterBag): void;
    isFocusWithin(): boolean;
    closeOthers(buttonId: string): void;
  }

  export const [getPopoverGroupContext, setPopoverGroupContext] =
    createContextStore<PopoverGroupContext>();

  const COMPONENT_NAME = "PopoverGroup";
  export function usePopoverGroupContext(childName: string) {
    const context = getPopoverGroupContext();
    if (context) return context;
    // throw new Error(
    //   `<${childName} /> is missing a parent <${COMPONENT_NAME} /> component.`
    // );
  }
</script>

<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import { writable } from "svelte/store";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { createContextStore } from "$lib/internal/context-store";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  import type { PopoverRegisterBag } from "./Popover.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];

  let groupRef: HTMLDivElement | undefined;
  let popovers: PopoverRegisterBag[] = [];

  function unregister(registerBag: PopoverRegisterBag) {
    popovers = popovers.filter((bag) => bag != registerBag);
  }

  function register(registerBag: PopoverRegisterBag) {
    popovers = [...popovers, registerBag];
    return () => {
      unregister(registerBag);
    };
  }

  function isFocusWithin() {
    let element = document.activeElement as HTMLElement;

    if (groupRef?.contains(element)) return true;

    // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.
    return popovers.some((bag) => {
      return (
        document.getElementById(bag.buttonId)?.contains(element) ||
        document.getElementById(bag.panelId)?.contains(element)
      );
    });
  }

  function closeOthers(buttonId: string) {
    for (let popover of popovers) {
      if (popover.buttonId !== buttonId) popover.close();
    }
  }

  setPopoverGroupContext(
    writable({
      unregister,
      register,
      isFocusWithin,
      closeOthers,
    })
  );
</script>

<Render
  {...$$restProps}
  {as}
  use={[...use, forwardEvents]}
  name={COMPONENT_NAME}
  bind:el={groupRef}
>
  <slot />
</Render>
