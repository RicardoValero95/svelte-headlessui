<script lang="ts">
  import { onMount } from "svelte";
  import { get_current_component } from "svelte/internal";

  import type { HTMLActionArray } from "$lib/hooks/use-actions";
  import { useId } from "$lib/hooks/use-id";
  import type { SupportedAs } from "$lib/internal/elements";
  import { forwardEventsBuilder } from "$lib/internal/forwardEventsBuilder";
  import Render from "$lib/utils/Render.svelte";

  import { DialogStates, useDialogContext } from "./Dialog.svelte";

  const forwardEvents = forwardEventsBuilder(get_current_component());
  export let as: SupportedAs = "h2";
  export let use: HTMLActionArray = [];

  let api = useDialogContext("DialogTitle");
  let id = `headlessui-dialog-title-${useId()}`;

  onMount(() => {
    $api.setTitleId(id);
    return () => $api.setTitleId(undefined);
  });
  $: propsWeControl = {
    id,
  };

  $: slotProps = { open: $api.dialogState === DialogStates.Open };
</script>

<Render
  {...{ ...$$restProps, ...propsWeControl }}
  {as}
  {slotProps}
  use={[...use, forwardEvents]}
  name={"DialogTitle"}
>
  <slot {...slotProps} />
</Render>
