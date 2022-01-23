<script lang="ts">
  import prism from "prismjs";
  import "prism-svelte";

  export let code: string;
  let toggle = false;
  let expand = false;
  $: typeof window !== "undefined" &&
    (expand
      ? document.body.classList.add("overflow-hidden")
      : document.body.classList.remove("overflow-hidden"));
  let libName = "@unoun/svelte";
</script>

<template>
  <div>
    {#if expand}
      <div
        class="fixed inset-0 bg-black/60 z-10"
        on:click={() => (expand = false)}
      />
    {/if}
    <div
      class="overflow-hidden bg-gray rounded-lg shadow-xl {expand
        ? 'fixed inset-12 z-20'
        : 'relative'}"
    >
      <header
        class="flex justify-between border-b border-gray-700 bg-gray relative z-10"
      >
        <div class="flex">
          <button
            class="p-3 font-semibold hover:bg-white/5 {!toggle
              ? 'shadow-[inset_0_-2px_0] shadow-svelte'
              : ''}"
            on:click={() => (toggle = false)}
          >
            <div i-carbon-view />
          </button>
          <button
            class="p-3 font-semibold hover:bg-white/5 {toggle
              ? 'shadow-[inset_0_-2px_0] shadow-svelte'
              : ''}"
            on:click={() => (toggle = true)}
          >
            <div i-carbon-code />
          </button>
        </div>
        <button
          class="p-3 font-semibold hover:bg-white/5"
          on:click={() => (expand = !expand)}
        >
          {#if expand}
            <div i-carbon-minimize />
          {:else}
            <div i-carbon-maximize />
          {/if}
        </button>
      </header>
      {#if !toggle}
        <div
          class="not-prose p-10 flex flex-col items-center {expand
            ? 'h-[calc(100vh-3rem-92px)]'
            : 'h-96'}"
        >
          <div>
            <slot />
          </div>
        </div>
      {:else}
        <pre
          class="my-0 flex-grow rounded-t-none {expand
            ? 'h-[calc(100vh-3rem-92px)]'
            : 'max-h-96'}">
					<code class="language-svelte">
						{@html prism.highlight(
              code.replace(/\$lib/, libName),
              prism.languages["svelte"],
              "svelte"
            )}
					</code>
				</pre>
      {/if}
    </div>
  </div>
</template>
