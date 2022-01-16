<script lang="ts" context="module">
  import { getContext, setContext } from "svelte";
  import { writable, Writable } from "svelte/store";

  const CONTEXT_NAME = Symbol("headlessui-force-portal-root-context");

  export const usePortalRoot = (): Writable<boolean> | undefined =>
    getContext(CONTEXT_NAME);
</script>

<script lang="ts">
  export let force: boolean;
  setContext(CONTEXT_NAME, writable(force));
</script>

<slot />
