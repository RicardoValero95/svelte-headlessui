<script lang="ts" context="module">
  interface PanelData {
    id: string;
    ref: Readable<HTMLElement | null>;
  }
  export type StateDefinition = {
    // State
    selectedIndex: number | null;
    orientation: "vertical" | "horizontal";
    activation: "auto" | "manual";

    tabs: HTMLElement[];
    panels: PanelData[];

    listRef: Writable<HTMLElement | null>;

    // State mutators
    setSelectedIndex(index: number): void;
    registerTab(tab: HTMLElement | null): void;
    unregisterTab(tab: HTMLElement | null): void;
    registerPanel(panel: PanelData): void;
    unregisterPanel(panel: PanelData): void;
  };

  export const [getTabGroupContext, setTabGroupContext] =
    createContextStore<StateDefinition>();

  const COMPONENT_NAME = "TabGroup";

  export function useTabGroupContext(childName: string) {
    const context = getTabGroupContext();
    if (context) return context;
    throw new Error(
      `<${childName} /> is missing a parent <${COMPONENT_NAME} /> component.`
    );
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { get_current_component } from "svelte/internal";
  import type { Readable, Writable } from "svelte/store";
  import { writable } from "svelte/store";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { createContextStore } from "$lib/internal/context-store";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component(), [
    "change",
  ]);

  export let as: SupportedAs = "div";
  export let use: HTMLActionArray = [];
  export let defaultIndex = 0;
  export let vertical = false;
  export let manual = false;

  let selectedIndex: StateDefinition["selectedIndex"] = null;
  let tabs: StateDefinition["tabs"] = [];
  let panels: StateDefinition["panels"] = [];
  let listRef: StateDefinition["listRef"] = writable(null);

  const dispatch = createEventDispatcher();

  let api: Writable<StateDefinition> = writable({
    selectedIndex,
    orientation: vertical ? "vertical" : "horizontal",
    activation: manual ? "manual" : "auto",
    tabs,
    panels,
    listRef,
    setSelectedIndex(index: number) {
      if (selectedIndex === index) return;
      selectedIndex = index;
      dispatch("change", index);
    },
    registerTab(tab: typeof tabs[number]) {
      if (tabs.includes(tab)) return;
      if (!$listRef) {
        // We haven't mounted yet so just append
        tabs = [...tabs, tab];
        return;
      }
      let currentSelectedTab =
        selectedIndex !== null ? tabs[selectedIndex] : null;

      let orderMap = Array.from(
        $listRef.querySelectorAll('[id^="headlessui-tabs-tab-"]')!
      ).reduce(
        (lookup, element, index) =>
          Object.assign(lookup, { [element.id]: index }),
        {}
      ) as Record<string, number>;

      let nextTabs = [...tabs, tab];
      nextTabs.sort((a, z) => orderMap[a.id] - orderMap[z.id]);
      tabs = nextTabs;

      // Maintain the correct item active
      selectedIndex = (() => {
        if (currentSelectedTab === null) return null;
        return tabs.indexOf(currentSelectedTab);
      })();
    },
    unregisterTab(tab: typeof tabs[number]) {
      tabs = tabs.filter((t) => t !== tab);
    },
    registerPanel(panel: typeof panels[number]) {
      if (!panels.includes(panel)) panels = [...panels, panel];
    },
    unregisterPanel(panel: typeof panels[number]) {
      panels = panels.filter((p) => p !== panel);
    },
  });
  setTabGroupContext(api);

  $: api.update((obj) => {
    return {
      ...obj,
      selectedIndex,
      orientation: vertical ? "vertical" : "horizontal",
      activation: manual ? "manual" : "auto",
      tabs,
      panels,
    };
  });

  onMount(() => {
    if (tabs.length <= 0) return;
    if (selectedIndex !== null) return;

    let mountedTabs = tabs.filter(Boolean) as HTMLElement[];
    let focusableTabs = mountedTabs.filter(
      (tab) => !tab.hasAttribute("disabled")
    );
    if (focusableTabs.length <= 0) return;

    // Underflow
    if (defaultIndex < 0) {
      selectedIndex = mountedTabs.indexOf(focusableTabs[0]);
    }

    // Overflow
    else if (defaultIndex > mountedTabs.length) {
      selectedIndex = mountedTabs.indexOf(
        focusableTabs[focusableTabs.length - 1]
      );
    }

    // Middle
    else {
      let before = mountedTabs.slice(0, defaultIndex);
      let after = mountedTabs.slice(defaultIndex);

      let next = [...after, ...before].find((tab) =>
        focusableTabs.includes(tab)
      );
      if (!next) return;

      selectedIndex = mountedTabs.indexOf(next);
    }
  });

  $: slotProps = { selectedIndex };
</script>

<Render
  {...$$restProps}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={COMPONENT_NAME}
>
  <slot {...slotProps} />
</Render>
