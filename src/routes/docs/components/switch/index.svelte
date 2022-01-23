<script>
  import Example from "./Example.svelte";
  import ExampleCode from "./Example.svelte?raw";

  import PreviewWithTabs from "$site/components/PreviewWithTabs.svelte";
</script>

<h1>Switch</h1>

<PreviewWithTabs code={ExampleCode}>
  <Example />
</PreviewWithTabs>
