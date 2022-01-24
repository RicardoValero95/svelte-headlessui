<script lang="ts" context="module">
  export const [getPortalRootContext, setPortalRootContext] =
    createContextStore<boolean>();

  export function usePortalRootContext() {
    return getPortalRootContext();
  }
</script>

<script lang="ts">
  import { writable } from "svelte/store";

  import { createContextStore } from "./context-store";

  export let force: boolean;
  setPortalRootContext(writable(force));
</script>

<slot />
