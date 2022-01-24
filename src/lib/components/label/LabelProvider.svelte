<script lang="ts">
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";

  import { setLabelContext } from ".";
  import type { LabelContext } from ".";

  export let name: string;
  let labelIds: string[] = [];
  let contextStore: Writable<LabelContext> = writable({
    name,
    register,
    props: $$restProps,
  });
  setLabelContext(contextStore);

  $: contextStore.set({
    name,
    props: $$restProps,
    register,
    labelIds: labelIds.length > 0 ? labelIds.join(" ") : undefined,
  });

  function register(value: string) {
    labelIds = [...labelIds, value];
    return () => {
      labelIds = labelIds.filter((labelId) => labelId !== value);
    };
  }
</script>

<slot labelledby={$contextStore.labelIds} />
