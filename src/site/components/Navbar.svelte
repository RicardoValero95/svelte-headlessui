<script lang="ts">
  type Item = { href: string; label: string; icon?: string };
  export let items: Item[];
  export let currentPathname: string;

  const selected = (pathname: string, href: string) =>
    pathname === href ||
    (pathname.split("/").length > 1 &&
      href.split("/").length > 1 &&
      pathname.startsWith(href) &&
      !(href === "" || href === "/")) ||
    (href === "/" && pathname === "");
</script>

<nav>
  {#each items as { href, label, icon }}
    <a
      {href}
      sveltekit:prefetch
      class:selected={selected(currentPathname, href)}
    >
      {#if icon}
        {@html icon}
      {/if}
      <!-- <TextBlock>{label}</TextBlock> -->
    </a>
  {/each}
</nav>
