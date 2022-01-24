<script lang="ts" context="module">
  import { get_current_component } from "svelte/internal";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { createContextStore } from "$lib/internal/context-store";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import { State, useOpenClosedProvider } from "$lib/internal/open-closed";
  import {
    Focus,
    calculateActiveIndex,
  } from "$lib/utils/calculate-active-index";
  import { match } from "$lib/utils/match";
  import Render from "$lib/utils/Render.svelte";

  export enum MenuStates {
    Open,
    Closed,
  }
  export type MenuItemData = { textValue: string; disabled: boolean };
  export type StateDefinition = {
    // State
    menuState: MenuStates;
    buttonStore: Writable<HTMLButtonElement | null>;
    itemsStore: Writable<HTMLDivElement | null>;
    items: { id: string; data: MenuItemData }[];
    searchQuery: string;
    activeItemIndex: number | null;

    // State mutators
    closeMenu(): void;
    openMenu(): void;
    goToItem(focus: Focus, id?: string): void;
    search(value: string): void;
    clearSearch(): void;
    registerItem(id: string, dataRef: MenuItemData): void;
    unregisterItem(id: string): void;
  };

  export const [getMenuContext, setMenuContext] =
    createContextStore<StateDefinition>();

  export function useMenuContext(componentName: string) {
    const context = getMenuContext();
    if (context) return context;
    throw new Error(
      `<${componentName} /> is missing a parent <Menu /> component.`
    );
  }
</script>

<script lang="ts">
  export let use: HTMLActionArray = [];
  export let as: SupportedAs = "div";
  const forwardEvents = forwardEventsBuilder(get_current_component());

  let buttonStore: StateDefinition["buttonStore"] = writable(null);
  let itemsStore: StateDefinition["itemsStore"] = writable(null);

  let api: Writable<StateDefinition> = writable({
    menuState: MenuStates.Closed,
    buttonStore,
    itemsStore,
    items: [],
    searchQuery: "",
    activeItemIndex: null,
    closeMenu: () => {
      $api.menuState = MenuStates.Closed;
      $api.activeItemIndex = null;
    },
    openMenu: () => ($api.menuState = MenuStates.Open),
    goToItem(focus: Focus, id?: string) {
      let nextActiveItemIndex = calculateActiveIndex(
        focus === Focus.Specific
          ? { focus: Focus.Specific, id: id! }
          : { focus: focus as Exclude<Focus, Focus.Specific> },
        {
          resolveItems: () => $api.items,
          resolveActiveIndex: () => $api.activeItemIndex,
          resolveId: (item) => item.id,
          resolveDisabled: (item) => item.data.disabled,
        }
      );

      if (
        $api.searchQuery === "" &&
        $api.activeItemIndex === nextActiveItemIndex
      )
        return;
      $api.searchQuery = "";
      $api.activeItemIndex = nextActiveItemIndex;
    },
    search(value: string) {
      $api.searchQuery += value.toLowerCase();

      let reorderedItems =
        $api.activeItemIndex !== null
          ? $api.items
              .slice($api.activeItemIndex + 1)
              .concat($api.items.slice(0, $api.activeItemIndex + 1))
          : $api.items;

      let matchingItem = reorderedItems.find(
        (item) =>
          item.data.textValue.startsWith($api.searchQuery) &&
          !item.data.disabled
      );

      let matchIdx = matchingItem ? $api.items.indexOf(matchingItem) : -1;
      if (matchIdx === -1 || matchIdx === $api.activeItemIndex) return;

      $api.activeItemIndex = matchIdx;
    },
    clearSearch() {
      $api.searchQuery = "";
    },
    registerItem(id: string, data: MenuItemData) {
      if (!$itemsStore) {
        // We haven't mounted yet so just append
        $api.items = [...$api.items, { id, data }];
        return;
      }
      let currentActiveItem =
        $api.activeItemIndex !== null ? $api.items[$api.activeItemIndex] : null;

      let orderMap = Array.from(
        $itemsStore.querySelectorAll('[id^="headlessui-menu-item-"]')!
      ).reduce(
        (lookup, element, index) =>
          Object.assign(lookup, { [element.id]: index }),
        {}
      ) as Record<string, number>;

      let nextItems = [...$api.items, { id, data }];
      nextItems.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
      $api.items = nextItems;

      // Maintain the correct item active
      $api.activeItemIndex = (() => {
        if (currentActiveItem === null) return null;
        return $api.items.indexOf(currentActiveItem);
      })();
    },
    unregisterItem(id: string) {
      let nextItems = $api.items.slice();
      let currentActiveItem =
        $api.activeItemIndex !== null ? nextItems[$api.activeItemIndex] : null;
      let idx = nextItems.findIndex((a) => a.id === id);
      if (idx !== -1) nextItems.splice(idx, 1);
      $api.items = nextItems;
      $api.activeItemIndex = (() => {
        if (idx === $api.activeItemIndex) return null;
        if (currentActiveItem === null) return null;

        // If we removed the item before the actual active index, then it would be out of sync. To
        // fix this, we will find the correct (new) index position.
        return nextItems.indexOf(currentActiveItem);
      })();
    },
  });
  setMenuContext(api);

  $: api.update((obj) => {
    return {
      ...obj,
      itemsStore,
    };
  });

  function handleWindowMousedown(event: MouseEvent): void {
    let target = event.target as HTMLElement;
    let active = document.activeElement;
    if ($api.menuState !== MenuStates.Open) return;
    if ($buttonStore?.contains(target)) return;
    if (!$itemsStore?.contains(target)) $api.closeMenu();
    if (active !== document.body && active?.contains(target)) return; // Keep focus on newly clicked/focused element
    if (!event.defaultPrevented) $buttonStore?.focus({ preventScroll: true });
  }

  let openClosedState: Writable<State> | undefined = writable(State.Closed);
  useOpenClosedProvider(openClosedState);

  $: $openClosedState = match($api.menuState, {
    [MenuStates.Open]: State.Open,
    [MenuStates.Closed]: State.Closed,
  });

  $: slotProps = { open: $api.menuState === MenuStates.Open };
</script>

<svelte:window on:mousedown={handleWindowMousedown} />
<Render
  {...$$restProps}
  use={[...use, forwardEvents]}
  {as}
  {slotProps}
  name={"Menu"}
>
  <slot {...slotProps} />
</Render>
