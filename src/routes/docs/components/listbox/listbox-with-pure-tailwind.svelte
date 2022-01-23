<script lang="ts">
  import {
    Listbox,
    ListboxButton,
    ListboxLabel,
    ListboxOption,
    ListboxOptions,
  } from "$lib";

  function classNames(
    ...classes: (false | null | undefined | string)[]
  ): string {
    return classes.filter(Boolean).join(" ");
  }
  let people = [
    "Wade Cooper",
    "Arlene Mccoy",
    "Devon Webb",
    "Tom Cook",
    "Tanya Fox",
    "Hellen Schmidt",
    "Caroline Schultz",
    "Mason Heaney",
    "Claudie Smitham",
    "Emil Schaefer",
  ];

  // Choose a random person on mount
  let active = [people[Math.floor(Math.random() * people.length)]];
</script>

<div class="w-full max-w-xs mx-auto">
  Values: {active}

  <div class="space-y-1">
    <Listbox
      value={active}
      on:change={(event) => {
        active = event.detail;
      }}
    >
      <ListboxLabel class="block text-sm font-medium leading-5 text-gray-700">
        Assigned to
      </ListboxLabel>

      <div class="relative">
        <span class="inline-block w-full rounded-md shadow-sm">
          <ListboxButton
            class="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
          >
            <span class="block truncate">{active}</span>
            <span
              class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
            >
              <div i-carbon-chevron-sort text-gray-400 w-5 h-5 />
            </span>
          </ListboxButton>
        </span>

        <div class="absolute w-full mt-1 bg-white rounded-md shadow-lg">
          <ListboxOptions
            class="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5"
          >
            {#each people as name (name)}
              <ListboxOption
                key={name}
                value={name}
                class={({ active }) => {
                  return classNames(
                    "relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none",
                    active ? "text-white bg-indigo-600" : "text-gray-900"
                  );
                }}
                let:active
                let:selected
              >
                <span
                  class={classNames(
                    "block truncate",
                    selected ? "font-semibold" : "font-normal"
                  )}
                >
                  {name}
                </span>
                {#if selected}
                  <span
                    class={classNames(
                      "absolute inset-y-0 right-0 flex items-center pr-4",
                      active ? "text-white" : "text-indigo-600"
                    )}
                  >
                    <div i-carbon-checkmark w-5 h-5 />
                  </span>
                {/if}
              </ListboxOption>
            {/each}
          </ListboxOptions>
        </div>
      </div>
    </Listbox>
  </div>
</div>
