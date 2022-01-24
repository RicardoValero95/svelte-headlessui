<script lang="ts" context="module">
  export const [getPortalGroupContext, setPortalGroupContext] =
    createContextStore<HTMLElement | null>();

  export function usePortalGroupContext() {
    return getPortalGroupContext();
  }
</script>

<script lang="ts">
  import { writable } from "svelte/store";

  import { createContextStore } from "$lib/internal/context-store";

  export let target: HTMLElement | null;
  let targetStore = writable(target);
  setPortalGroupContext(targetStore);
  $: targetStore.set(target);
</script>

<slot />
