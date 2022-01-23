<script>
  import Popover from "./popover.svelte";
  import PopoverCode from "./popover.svelte?raw";

  import PreviewWithTabs from "$site/components/PreviewWithTabs.svelte";
</script>

<h1>Popover</h1>

<PreviewWithTabs code={PopoverCode}>
  <Popover />
</PreviewWithTabs>
