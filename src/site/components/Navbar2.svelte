<script lang="ts">
  import { classNames } from "$site/helpers";

  type Item = {
    title?: string;
    links: { href: string; label: string; icon?: string }[];
  };
  export let items: Item[];
  export let currentPathname: string;

  $: active = (href: string, pathname: string): boolean =>
    pathname === href || (!href && !pathname);
</script>

<nav class="sticky top-6">
  {#each items as { title, links }}
    {#if title}
      <h4
        class="ml-4 text-xs uppercase font-black mb-2 text-gray-500 select-none"
      >
        {title}
      </h4>
    {/if}
    <ul class="mb-6">
      {#each links as { href, label, icon }}
        <a
          {href}
          class={classNames(
            "flex items-center block px-4 py-3 text-sm rounded-md mb-1 last:mb-0",
            active(href, currentPathname)
              ? "text-svelte-light bg-svelte-light/10"
              : "hover:bg-gray-300 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white"
          )}
        >
          {#if icon}
            <div class={icon} mr-2 />
          {/if}
          {label}
        </a>
      {/each}
    </ul>
  {/each}
</nav>
