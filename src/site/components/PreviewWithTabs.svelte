<script lang="ts">
  import CodeTab from "./CodeTab.svelte";
  import RenderTab from "./RenderTab.svelte";

  import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "$lib";
  import { classNames } from "$site/helpers";

  export let code: string;
  let expand = false;
</script>

<TabGroup class="flex flex-col max-w-3xl w-full" as="div">
  <TabList class="relative z-0 rounded-lg shadow flex divide-x divide-gray-200">
    <Tab
      key="render"
      class={({ selected, disabled }) =>
        classNames(
          selected ? "text-gray-900" : "text-gray-500 hover:text-gray-700",
          "rounded-l-lg",
          disabled && "opacity-50",
          "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
        )}
      let:selected
      let:disabled
    >
      <span>
        <div i-carbon-view />
      </span>
      <span
        aria-hidden="true"
        class={classNames(
          selected ? "bg-indigo-500" : "bg-transparent",
          "absolute inset-x-0 bottom-0 h-0.5"
        )}
      />
    </Tab>
    <Tab
      key="code"
      class={({ selected, disabled }) =>
        classNames(
          selected ? "text-gray-900" : "text-gray-500 hover:text-gray-700",
          disabled && "opacity-50",
          "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
        )}
      let:selected
      let:disabled
    >
      <span>
        <div i-carbon-code />
      </span>
      <span
        aria-hidden="true"
        class={classNames(
          selected ? "bg-indigo-500" : "bg-transparent",
          "absolute inset-x-0 bottom-0 h-0.5"
        )}
      />
    </Tab>
  </TabList>

  <TabPanels class="mt-4">
    <TabPanel class="bg-white rounded-lg p-4 shadow" key="render">
      <RenderTab>
        <slot />
      </RenderTab>
    </TabPanel>
    <TabPanel class="bg-white rounded-lg p-4 shadow" key="code">
      <CodeTab {code} />
    </TabPanel>
  </TabPanels>
</TabGroup>
