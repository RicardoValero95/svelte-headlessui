<script lang="ts">
  export let expand = false;
</script>

<div
  class="not-prose p-10 flex flex-col items-center {expand
    ? 'h-[calc(100vh-3rem-92px)]'
    : 'h-96'}"
>
  <div>
    <slot />
  </div>
</div>
