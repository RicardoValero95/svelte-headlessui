<script lang="ts">
  import { page } from "$app/stores";
  import Navbar2 from "$site/components/Navbar2.svelte";
  import Toc from "$site/components/Toc.svelte";
  import { classNames } from "$site/helpers";

  let el: HTMLElement;
  const navbarItems = [
    {
      links: [
        { href: "/docs", label: "Home" },
        { href: "/docs/ideas", label: "Ideas" },
        { href: "/docs/howto", label: "How to" },
      ],
    },
    {
      title: "Primitives",
      links: [
        { href: "/docs/primitives/options", label: "Options" },
        { href: "/docs/popover", label: "Popover" },
        { href: "/docs/transition", label: "Transition" },
      ],
    },
    {
      title: "Components",
      links: [
        { href: "/docs/components/menu", label: "Menu", icon: "i-carbon-menu" },
        {
          href: "/docs/components/switch",
          label: "Switch",
          icon: "i-radix-icons-switch",
        },
        {
          href: "/docs/components/radio-group",
          label: "Radio Group",
          icon: "i-carbon-radio-button-checked",
        },
        {
          href: "/docs/components/listbox",
          label: "Listbox",
          icon: "i-carbon-list-dropdown",
        },
        { href: "/docs/dialog", label: "Dialog" },
        { href: "/docs/disclosure", label: "Disclosure" },
        { href: "/docs/tabs", label: "Tabs" },
      ],
    },
    {
      title: "Recipes",
      links: [{ href: ".", label: "Coming soon?" }],
    },
  ];

  let markdownClasses = [
    "max-w-full w-full min-w-0",
    "prose",
    "prose:min-w-0 pre:w-full pre:overflow-auto",
    "h1:text-5xl h2:text-3xl h3:text-2xl",
    "a:text-svelte hover:a:text-svelte-light blockquote:text-sm",
    "p:text-gray-400 ul:text-gray-400",
    "tr:flex th:flex-1 td:flex-1",
    "hr:border-gray-800",
    "td:text-gray-400 tr:border-gray-700 thead:border-gray-700",
    "blockquote:text-gray-400 blockquote:border-gray-600",
  ];
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex-grow">
      <div
        class={classNames(
          "max-w-screen-2xl mx-auto px-5 py-12",
          "grid grid-cols-[250px_1fr_250px] gap-16 items-start"
        )}
      >
        <Navbar2 items={navbarItems} currentPathname={$page.url.pathname} />
        <article bind:this={el} class={classNames(...markdownClasses)}>
          <slot />
        </article>
        <aside class="sticky top-6">
          <h4 class="text-xs font-black uppercase mb-4">On this page</h4>
          <ul>
            <Toc {el} />
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>
