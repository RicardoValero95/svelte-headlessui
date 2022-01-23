<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import {
    Focus,
    calculateActiveIndex,
  } from "$lib/utils/calculate-active-index";
  import { match } from "$lib/utils/match";
  import Render from "$lib/utils/Render.svelte";

  import type {
    ItemData,
    StateDefinition} from "./dropdown";
  import {
    States,
    useDropdownProvider,
  } from "./dropdown";

  export let use: HTMLActionArray = [];
  export let as: SupportedAs = "div";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  let state: StateDefinition["state"] = States.Closed;
  let buttonStore: StateDefinition["buttonStore"] = writable(null);
  let itemsStore: StateDefinition["itemsStore"] = writable(null);
  let items: StateDefinition["items"] = [];
  let searchQuery: StateDefinition["searchQuery"] = "";
  let activeItemIndex: StateDefinition["activeItemIndex"] = null;

  let api: Writable<StateDefinition> = writable({
    state,
    buttonStore,
    itemsStore: itemsStore,
    items,
    searchQuery,
    activeItemIndex,
    close: () => {
      state = States.Closed;
      activeItemIndex = null;
    },
    open: () => (state = States.Open),
    goToItem(focus: Focus, id?: string) {
      let nextActiveItemIndex = calculateActiveIndex(
        focus === Focus.Specific
          ? { focus: Focus.Specific, id: id! }
          : { focus: focus as Exclude<Focus, Focus.Specific> },
        {
          resolveItems: () => items,
          resolveActiveIndex: () => activeItemIndex,
          resolveId: (item) => item.id,
          resolveDisabled: (item) => item.data.disabled,
        }
      );

      if (searchQuery === "" && activeItemIndex === nextActiveItemIndex) return;
      searchQuery = "";
      activeItemIndex = nextActiveItemIndex;
    },
    search(value: string) {
      searchQuery += value.toLowerCase();

      let match = items.findIndex(
        (item) =>
          item.data.textValue.startsWith(searchQuery) && !item.data.disabled
      );

      if (match === -1 || match === activeItemIndex) return;

      activeItemIndex = match;
    },
    clearSearch() {
      searchQuery = "";
    },
    registerItem(id: string, data: ItemData) {
      if (!$itemsStore) {
        // We haven't mounted yet so just append
        items = [...items, { id, data }];
        return;
      }
      let currentActiveItem =
        activeItemIndex !== null ? items[activeItemIndex] : null;

      let orderMap = Array.from(
        $itemsStore.querySelectorAll('[id^="headlessui-dropdown-item-"]')!
      ).reduce(
        (lookup, element, index) =>
          Object.assign(lookup, { [element.id]: index }),
        {}
      ) as Record<string, number>;

      let nextItems = [...items, { id, data }];
      nextItems.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
      items = nextItems;

      // Maintain the correct item active
      activeItemIndex = (() => {
        if (currentActiveItem === null) return null;
        return items.indexOf(currentActiveItem);
      })();
    },
    unregisterItem(id: string) {
      let nextItems = items.slice();
      let currentActiveItem =
        activeItemIndex !== null ? nextItems[activeItemIndex] : null;
      let idx = nextItems.findIndex((a) => a.id === id);
      if (idx !== -1) nextItems.splice(idx, 1);
      items = nextItems;
      activeItemIndex = (() => {
        if (idx === activeItemIndex) return null;
        if (currentActiveItem === null) return null;

        // If we removed the item before the actual active index, then it would be out of sync. To
        // fix this, we will find the correct (new) index position.
        return nextItems.indexOf(currentActiveItem);
      })();
    },
  });
  useDropdownProvider(api);

  $: api.update((obj) => {
    return {
      ...obj,
      state,
      buttonStore,
      itemsStore,
      items,
      searchQuery,
      activeItemIndex,
    };
  });

  function handleWindowMousedown(event: MouseEvent): void {
    let target = event.target as HTMLElement;
    let active = document.activeElement;

    if (state !== States.Open) return;
    if ($buttonStore?.contains(target)) return;

    if (!$itemsStore?.contains(target)) $api.close();
    if (active !== document.body && active?.contains(target)) return; // Keep focus on newly clicked/focused element
    if (!event.defaultPrevented) $buttonStore?.focus({ preventScroll: true });
  }

  let openClosedState: Writable<State> | undefined = writable(State.Closed);
  useOpenClosedProvider(openClosedState);

  $: $openClosedState = match(state, {
    [States.Open]: State.Open,
    [States.Closed]: State.Closed,
  });

  $: slotProps = { open: state === States.Open };
</script>

<svelte:window on:mousedown={handleWindowMousedown} />
<Render
  {...$$restProps}
  use={[...use, forwardEvents]}
  {as}
  {slotProps}
  name={"Dropdown"}
>
  <slot {...slotProps} />
</Render>
