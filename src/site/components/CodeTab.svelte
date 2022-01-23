<script lang="ts">
  import prism from "prismjs";
  import "prism-svelte";

  let libName = "@unoun/svelte";
  export let code: string;
</script>

<pre class="my-0 flex-grow rounded-t-none">
    <code class="language-svelte">
        {@html prism.highlight(
      code.replace(/\$lib/, libName),
      prism.languages["svelte"],
      "svelte"
    )}
    </code>
</pre>
