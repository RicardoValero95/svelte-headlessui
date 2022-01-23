<script lang="ts">
  import CopySnippet from "$site/components/CopySnippet.svelte";
  import { classNames } from "$site/helpers";

  let npmPackage = "npm install @unoun/svelte -D";
</script>

<template>
  <section class="h-screen flex items-center">
    <div class="max-w-screen-xl mx-auto px-5">
      <h1 class="text-7xl font-extralight leading-[1.35]">
        <span class="font-light">un</span><span class="font-extralight">o</span
        ><span class="font-thin">un</span>
      </h1>
      <br />
      <h3 class="text-2xl text-gray-400 font-thin">
        <span class="font-light">un</span>styled ·
        <span class="font-light">un</span>controlled ·
        <span class="font-light">un</span>opinionated
        <br />
        accessible responsive design
      </h3>
      <br />
      <h2 class="text-4xl font-light leading-[1.35]">
        The definitive collection of
        <br />
        <span class="font-medium"> primitives, components, recipes </span>
        <br />
        for <span class="text-svelte">Svelte</span>.
      </h2>
      <br />
      <div m2 flex justify-center>
        <CopySnippet code={npmPackage}>
          <code class="font-light">
            {npmPackage}
          </code>
        </CopySnippet>
      </div>
      <br />
      <div m2 flex justify-center>
        <a
          href="/docs"
          class={classNames(
            "font-bold text-white px-6 py-3 rounded-lg transition-colors",
            "bg-svelte hover:bg-svelte-dark",
            "border-2 border-transparent",
            "focus:outline-2 focus:outline focus:outline-offset-2 focus:outline-svelte"
          )}>Documentation</a
        >
      </div>
      <br />
      <div m2 flex justify-center text-4xl op30 hover="op80">
        <a
          i-carbon-logo-github
          text-inherit
          href="https://github.com/rgossiaux/svelte-headlessui"
          target="_blank"
        />
      </div>
    </div>
  </section>
</template>
