<script lang="ts">
  import { onMount } from "svelte";

  import { portal } from "$lib/hooks/use-portal";
  import { useContext } from "$lib/internal/ContextStore.svelte";

  let mounted = false;

  onMount(() => (mounted = true));

  const props = useContext<{ id: string }>();
</script>

{#if mounted}
  <div use:portal={document.body}>
    <slot />
  </div>
{/if}
