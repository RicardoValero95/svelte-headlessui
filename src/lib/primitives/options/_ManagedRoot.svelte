<script lang="ts">
  import Root from "./Root.svelte";

  export let value: unknown;
</script>

<Root {value} on:change={(e) => (value = e.detail)} on:change>
  <slot />
</Root>
