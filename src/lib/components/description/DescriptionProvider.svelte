<script lang="ts">
  import { writable } from "svelte/store";

  import { setDescriptionContext } from ".";
  import type { DescriptionContext } from ".";

  export let name: string;
  let descriptionIds: string[] = [];
  let contextStore = writable<DescriptionContext>({
    name,
    register,
    props: $$restProps,
  });

  setDescriptionContext(contextStore);

  $: contextStore.set({
    name,
    props: $$restProps,
    register,
    descriptionIds:
      descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined,
  });

  function register(value: string) {
    descriptionIds = [...descriptionIds, value];
    return () => {
      descriptionIds = descriptionIds.filter(
        (descriptionId) => descriptionId !== value
      );
    };
  }
</script>

<slot describedby={$contextStore.descriptionIds} />
