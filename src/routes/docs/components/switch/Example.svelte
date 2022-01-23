<script lang="ts">
  import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from "$lib";
  
  import { classNames } from "$site/helpers";

  let state = false;
</script>

<SwitchGroup as="div" class="flex items-center space-x-4 gap-2em">
  <SwitchLabel>Enable notifications</SwitchLabel>
  <SwitchDescription
    >You can enable/disable notifications at any moment
  </SwitchDescription>
  <Switch
    as="button"
    checked={state}
    on:change={(event) => (state = event.detail)}
    class={({ checked }) =>
      classNames(
        "relative inline-flex flex-shrink-0 h-6 border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline transition-colors ease-in-out duration-200",
        checked ? "bg-indigo-600" : "bg-gray-200"
      )}
    let:checked
  >
    <span
      class={classNames(
        "inline-block w-5 h-5 bg-white rounded-full transform transition ease-in-out duration-200",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </Switch>
</SwitchGroup>
