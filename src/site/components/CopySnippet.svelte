<script lang="ts">
  import { classNames } from "$site/helpers";

  export let code: string;
  let copiedText = false;
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    copiedText = true;
    setTimeout(() => (copiedText = false), 3000);
  };
</script>

<button
  type="button"
  class={classNames(
    "px-6 py-3 rounded-lg transition border-2 flex items-center gap-2",
    "border-gray-800 hover:border-gray-700",
    "focus:outline-2 focus:outline focus:outline-offset-2 focus:outline-svelte"
  )}
  on:click={() => copy(code)}
>
  <slot />
  {#if copiedText}
    <div i-carbon-checkmark text-gray-500 />
  {:else}
    <div i-carbon-copy text-gray-500 />
  {/if}
</button>
