import { act, render } from "@testing-library/svelte";
import svelte from "svelte-inline-compile";
import { writable } from "svelte/store";

import TransitionDebug from "$lib/components/disclosure/_TransitionDebug.svelte";
import { Transition, TransitionChild } from "$lib/components/transitions";
import Button from "$lib/internal/elements/Button.svelte";
import Div from "$lib/internal/elements/Div.svelte";
import Form from "$lib/internal/elements/Form.svelte";
import Span from "$lib/internal/elements/Span.svelte";
import {
  assertActiveElement,
  getByText,
} from "$lib/test-utils/accessibility-assertions";
import {
  assertDropdown,
  assertTrigger,
  assertTriggerLinkedWithDropdown,
  assertItem,
  assertDropdownLinkedWithItem,
  assertNoActiveItem,
  getDropdown,
  getTrigger,
  getTriggers,
  getItems,
  getDropdowns,
  DropdownState,
} from "$lib/test-utils/accessibility-assertions/dropdown";
import {
  click,
  focus,
  Keys,
  MouseButton,
  mouseLeave,
  mouseMove,
  press,
  shift,
  type,
  word,
} from "$lib/test-utils/interactions";
import { suppressConsoleLogs } from "$lib/test-utils/suppress-console-logs";
import TestRenderer from "$lib/test-utils/TestRenderer.svelte";

import { Dropdown, Trigger, Item, Items } from ".";

let mockId = 0;
jest.mock("../../hooks/use-id", () => {
  return {
    useId: jest.fn(() => ++mockId),
  };
});

beforeEach(() => (mockId = 0));
beforeAll(() => {
  // jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  // jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
});
afterAll(() => jest.restoreAllMocks());

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

describe("Safe guards", () => {
  it.each([
    ["Trigger", Trigger],
    ["Items", Items],
    ["Item", Item],
  ])(
    "should error when we are using a <%s /> without a parent <Dropdown />",
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Dropdown /> component.`
      );
    })
  );

  it(
    "should be possible to render a Dropdown without crashing",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });
    })
  );
});

describe("Rendering", () => {
  describe("Dropdown", () => {
    it(
      "Dropdown should have slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
        <Dropdown let:open>
          <Trigger>Trigger</Trigger>
          {#if open}
            <Items>
              <Item as="a">Item A</Item>
              <Item as="a">Item B</Item>
              <Item as="a">Item C</Item>
            </Items>
          {/if}
        </Dropdown>
      `);

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.Visible });
      })
    );
  });

  describe("Trigger", () => {
    it(
      "Trigger should have slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Dropdown>
            <Trigger let:open>{open}</Trigger>
            <Items>
              <Item as="a">Item A</Item>
              <Item as="a">Item B</Item>
              <Item as="a">Item C</Item>
            </Items>
          </Dropdown>
        `);

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
          textContent: "false",
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-trigger-1" },
          textContent: "true",
        });
        assertDropdown({ state: DropdownState.Visible });
      })
    );

    it(
      "Trigger should have slot props and support an `as` prop",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Dropdown>
            <Trigger as="div" role="button" let:open>
              {open}
            </Trigger>
            <Items>
              <Item as="a">Item A</Item>
              <Item as="a">Item B</Item>
              <Item as="a">Item C</Item>
            </Items>
          </Dropdown>
        `);

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
          textContent: "false",
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-trigger-1" },
          textContent: "true",
        });
        assertDropdown({ state: DropdownState.Visible });
      })
    );

    describe("`type` attribute", () => {
      it('should set the `type` to "button" by default', async () => {
        render(TestRenderer, {
          allProps: [[Dropdown, {}, [[Trigger, {}, "Trigger"]]]],
        });

        expect(getTrigger()).toHaveAttribute("type", "button");
      });

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(TestRenderer, {
          allProps: [
            [Dropdown, {}, [[Trigger, { type: "submit" }, "Trigger"]]],
          ],
        });

        expect(getTrigger()).toHaveAttribute("type", "submit");
      });

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(TestRenderer, {
          allProps: [[Dropdown, {}, [[Trigger, { as: "div" }, "Trigger"]]]],
        });

        expect(getTrigger()).not.toHaveAttribute("type");
      });
    });
  });

  describe("Items", () => {
    it(
      "Items should have slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Dropdown>
            <Trigger>Trigger</Trigger>
            <Items let:open>
              <Item as="a">{open}</Item>
            </Items>
          </Dropdown>
        `);

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({
          state: DropdownState.Visible,
          textContent: "true",
        });
      })
    );

    it("should be possible to always render the Items if we provide it a `static` prop", () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                { static: true },
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Let's verify that the Dropdown is already there
      expect(getDropdown()).not.toBe(null);
    });

    it("should be possible to use a different render strategy for the Items", async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                { unmount: false },
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertDropdown({ state: DropdownState.InvisibleHidden });

      // Let's open the Dropdown, to see if it is not hidden anymore
      await click(getTrigger());

      assertDropdown({ state: DropdownState.Visible });
    });
  });

  describe("Item", () => {
    it(
      "Item should have slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
        <Dropdown>
          <Trigger>Trigger</Trigger>
          <Items>
            <Item as="a" let:active let:disabled>{JSON.stringify({ active, disabled })}</Item>
          </Items>
        </Dropdown>
      `);

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({
          state: DropdownState.Visible,
          textContent: JSON.stringify({ active: false, disabled: false }),
        });
      })
    );

    it("should guarantee the dropdown item order after a few unmounts", async () => {
      const showFirst = writable(false);
      render(svelte`
      <Dropdown>
        <Trigger>Trigger</Trigger>
        <Items>
          {#if $showFirst}
            <Item as="a">Item A</Item>
          {/if}
          <Item as="a">Item B</Item>
          <Item as="a">Item C</Item>
        </Items>
      </Dropdown>
    `);

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Open Listbox
      await click(getTrigger());

      let items = getItems();
      expect(items).toHaveLength(2);
      items.forEach((item) => assertItem(item));

      // Make the first item active
      await press(Keys.ArrowDown);

      // Verify that the first dropdown item is active
      assertDropdownLinkedWithItem(items[0]);

      // Now add a new option dynamically
      await act(() => showFirst.set(true));

      // New option should be treated correctly
      items = getItems();
      expect(items).toHaveLength(3);
      items.forEach((item) => assertItem(item));

      // Active item should now be second
      assertDropdownLinkedWithItem(items[1]);

      // We should be able to go to the first option
      await press(Keys.Home);
      assertDropdownLinkedWithItem(items[0]);

      // And the last one
      await press(Keys.End);
      assertDropdownLinkedWithItem(items[2]);
    });
  });
});

describe("Rendering composition", () => {
  it(
    "should be possible to conditionally render classes (aka class can be a function?!)",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            { class: (bag: any) => JSON.stringify(bag), id: "dropdown" },
            [
              [
                Trigger,
                { class: (bag: any) => JSON.stringify(bag) },
                "Trigger",
              ],
              [
                Items,
                { class: (bag: any) => JSON.stringify(bag) },
                [
                  [
                    Item,
                    { as: "a", class: (bag: any) => JSON.stringify(bag) },
                    "Item A",
                  ],
                  [
                    Item,
                    {
                      as: "a",
                      disabled: true,
                      class: (bag: any) => JSON.stringify(bag),
                    },
                    "Item B",
                  ],
                  [Item, { as: "a", class: "no-special-treatment" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Verify correct classNames
      expect("" + document.querySelector('[id="dropdown"]')?.classList).toEqual(
        JSON.stringify({ open: false })
      );
      expect("" + getTrigger()?.classList).toEqual(
        JSON.stringify({ open: false })
      );

      // Open dropdown
      await click(getTrigger());

      const items = getItems();

      // Verify correct classNames
      expect("" + document.querySelector('[id="dropdown"]')?.classList).toEqual(
        JSON.stringify({ open: true })
      );
      expect("" + getDropdown()?.classList).toEqual(
        JSON.stringify({ open: true })
      );
      expect("" + getTrigger()?.classList).toEqual(
        JSON.stringify({ open: true })
      );
      expect("" + items[0].classList).toEqual(
        JSON.stringify({ active: false, disabled: false })
      );
      expect("" + items[1].classList).toEqual(
        JSON.stringify({ active: false, disabled: true })
      );
      expect("" + items[2].classList).toEqual("no-special-treatment");

      // Double check that nothing is active
      assertNoActiveItem();

      // Make the first item active
      await press(Keys.ArrowDown);

      // Verify the classNames
      expect("" + items[0].classList).toEqual(
        JSON.stringify({ active: true, disabled: false })
      );
      expect("" + items[1].classList).toEqual(
        JSON.stringify({ active: false, disabled: true })
      );
      expect("" + items[2].classList).toEqual("no-special-treatment");

      // Double check that the first item is the active one
      assertDropdownLinkedWithItem(items[0]);

      // Let's go down, this should go to the third item since the second item is disabled!
      await press(Keys.ArrowDown);

      // Verify the classNames
      expect("" + items[0].classList).toEqual(
        JSON.stringify({ active: false, disabled: false })
      );
      expect("" + items[1].classList).toEqual(
        JSON.stringify({ active: false, disabled: true })
      );
      expect("" + items[2].classList).toEqual("no-special-treatment");

      // Double check that the last item is the active one
      assertDropdownLinkedWithItem(items[2]);
    })
  );

  it(
    "should be possible to swap the dropdown item with a button for example",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "button" }, "Item A"],
                  [Item, { as: "button" }, "Item B"],
                  [Item, { as: "button" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Open dropdown
      await click(getTrigger());

      // Verify items are buttons now
      const items = getItems();
      items.forEach((item) => assertItem(item, { tag: "button" }));
    })
  );

  it(
    "should mark all the elements between Items and Item with role none",
    suppressConsoleLogs(async () => {
      render;
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Div,
                { class: "outer" },
                [
                  [
                    Items,
                    {},
                    [
                      [
                        Div,
                        { class: "py-1 inner" },
                        [
                          [Item, { as: "button" }, "Item A"],
                          [Item, { as: "button" }, "Item B"],
                        ],
                      ],
                      [
                        Div,
                        { class: "py-1 inner" },
                        [
                          [Item, { as: "button" }, "Item C"],
                          [
                            Item,
                            {},
                            [[Div, {}, [[Div, { class: "outer" }, "Item D"]]]],
                          ],
                        ],
                      ],
                      [
                        Div,
                        { class: "py-1 inner" },
                        [
                          [
                            Form,
                            { class: "inner" },
                            [[Item, { as: "button" }, "Item E"]],
                          ],
                        ],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      expect.hasAssertions();

      document.querySelectorAll(".outer").forEach((element) => {
        expect(element).not.toHaveAttribute("role", "none");
      });

      document.querySelectorAll(".inner").forEach((element) => {
        expect(element).toHaveAttribute("role", "none");
      });
    })
  );
});

describe("Composition", () => {
  it(
    "should be possible to wrap the Items with a Transition component",
    suppressConsoleLogs(async () => {
      const orderFn = jest.fn();
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [TransitionDebug, { name: "Dropdown", fn: orderFn }],
              [
                Transition,
                {},
                [
                  [TransitionDebug, { name: "Transition", fn: orderFn }],
                  [
                    Items,
                    {},
                    [
                      [
                        Item,
                        { as: "a" },
                        [
                          "Item A",
                          [TransitionDebug, { name: "Item", fn: orderFn }],
                        ],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      await click(getTrigger());

      assertTrigger({
        state: DropdownState.Visible,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({
        state: DropdownState.Visible,
        textContent: "Item A",
      });

      await click(getTrigger());

      // Wait for all transitions to finish
      await nextFrame();

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ["Mounting - Dropdown"],
        ["Mounting - Transition"],
        ["Mounting - Item"],
        ["Unmounting - Transition"],
        ["Unmounting - Item"],
      ]);
    })
  );

  it(
    "should be possible to wrap the Items with a TransitionChild component",
    suppressConsoleLogs(async () => {
      const orderFn = jest.fn();
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [TransitionDebug, { name: "Dropdown", fn: orderFn }],
              [
                TransitionChild,
                {},
                [
                  [TransitionDebug, { name: "Transition", fn: orderFn }],
                  [
                    Items,
                    {},
                    [
                      [
                        Item,
                        { as: "a" },
                        [
                          "Item A",
                          [TransitionDebug, { name: "Item", fn: orderFn }],
                        ],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      await click(getTrigger());

      assertTrigger({
        state: DropdownState.Visible,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({
        state: DropdownState.Visible,
        textContent: "Item A",
      });

      await click(getTrigger());

      // Wait for all transitions to finish
      await nextFrame();

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ["Mounting - Dropdown"],
        ["Mounting - Transition"],
        ["Mounting - Item"],
        ["Unmounting - Transition"],
        ["Unmounting - Item"],
      ]);
    })
  );
});

describe("Keyboard interactions", () => {
  describe("`Enter` key", () => {
    it(
      "should be possible to open the dropdown with Enter",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));

        // Verify that the first dropdown item is active
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should not be possible to open the dropdown with Enter when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, { disabled: true }, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the dropdown
        await press(Keys.Enter);

        // Verify it is still closed
        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });
      })
    );

    it(
      "should have no active dropdown item when there are no dropdown items at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [[Dropdown, {}, [[Trigger, {}, "Trigger"], [Items]]]],
        });

        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);
        assertDropdown({ state: DropdownState.Visible });

        assertNoActiveItem();
      })
    );

    it(
      "should focus the first non disabled dropdown item when opening with Enter",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        const items = getItems();

        // Verify that the first non-disabled dropdown item is active
        assertDropdownLinkedWithItem(items[1]);
      })
    );

    it(
      "should focus the first non disabled dropdown item when opening with Enter (jump over multiple disabled ones)",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        const items = getItems();

        // Verify that the first non-disabled dropdown item is active
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should have no active dropdown item upon Enter key press, when there are no non-disabled dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        assertNoActiveItem();
      })
    );

    it(
      "should be possible to close the dropdown with Enter when there is no active item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Open dropdown
        await click(getTrigger());

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });

        // Close dropdown
        await press(Keys.Enter);

        // Verify it is closed
        assertTrigger({ state: DropdownState.InvisibleUnmounted });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Verify the button is focused again
        assertActiveElement(getTrigger());
      })
    );

    it(
      "should be possible to close the dropdown with Enter and invoke the active dropdown item",
      suppressConsoleLogs(async () => {
        const clickHandler = jest.fn();
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", onClick: clickHandler }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Open dropdown
        await click(getTrigger());

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });

        // Activate the first dropdown item
        const items = getItems();
        await mouseMove(items[0]);

        // Close dropdown, and invoke the item
        await press(Keys.Enter);

        // Verify it is closed
        assertTrigger({ state: DropdownState.InvisibleUnmounted });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Verify the button is focused again
        assertActiveElement(getTrigger());

        // Verify the "click" went through on the `a` tag
        expect(clickHandler).toHaveBeenCalled();
      })
    );

    // This test is modified from the React one since we don't support rendering a Item as a Fragment
    it(
      "should be possible to use a button as a dropdown item and invoke it upon Enter",
      suppressConsoleLogs(async () => {
        const clickHandler = jest.fn();
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "button", onClick: clickHandler }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Open dropdown
        await click(getTrigger());

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });

        // Activate the second dropdown item
        const items = getItems();
        await mouseMove(items[1]);

        // Close dropdown, and invoke the item
        await press(Keys.Enter);

        // Verify it is closed
        assertTrigger({ state: DropdownState.InvisibleUnmounted });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Verify the button got "clicked"
        expect(clickHandler).toHaveBeenCalledTimes(1);

        // Verify the button is focused again
        assertActiveElement(getTrigger());
      })
    );
  });

  describe("`Space` key", () => {
    it(
      "should be possible to open the dropdown with Space",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Space);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should not be possible to open the dropdown with Space when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, { disabled: true }, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });
        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the dropdown
        await press(Keys.Space);

        // Verify it is still closed
        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });
      })
    );

    it(
      "should have no active dropdown item when there are no dropdown items at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [[Dropdown, {}, [[Trigger, {}, "Trigger"], [Items]]]],
        });

        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Space);
        assertDropdown({ state: DropdownState.Visible });

        assertNoActiveItem();
      })
    );

    it(
      "should focus the first non disabled dropdown item when opening with Space",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Space);

        const items = getItems();

        // Verify that the first non-disabled dropdown item is active
        assertDropdownLinkedWithItem(items[1]);
      })
    );

    it(
      "should focus the first non disabled dropdown item when opening with Space (jump over multiple disabled ones)",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Space);

        const items = getItems();

        // Verify that the first non-disabled dropdown item is active
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should have no active dropdown item upon Space key press, when there are no non-disabled dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Space);

        assertNoActiveItem();
      })
    );

    it(
      "should be possible to close the dropdown with Space when there is no active item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Open dropdown
        await click(getTrigger());

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });

        // Close dropdown
        await press(Keys.Space);

        // Verify it is closed
        assertTrigger({ state: DropdownState.InvisibleUnmounted });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Verify the button is focused again
        assertActiveElement(getTrigger());
      })
    );

    it(
      "should be possible to close the dropdown with Space and invoke the active dropdown item",
      suppressConsoleLogs(async () => {
        const clickHandler = jest.fn();
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", onClick: clickHandler }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Open dropdown
        await click(getTrigger());

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });

        // Activate the first dropdown item
        const items = getItems();
        await mouseMove(items[0]);

        // Close dropdown, and invoke the item
        await press(Keys.Space);

        // Verify it is closed
        assertTrigger({ state: DropdownState.InvisibleUnmounted });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Verify the "click" went through on the `a` tag
        expect(clickHandler).toHaveBeenCalled();

        // Verify the button is focused again
        assertActiveElement(getTrigger());
      })
    );
  });

  describe("`Escape` key", () => {
    it(
      "should be possible to close an open dropdown with Escape",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Space);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Close dropdown
        await press(Keys.Escape);

        // Verify it is closed
        assertTrigger({ state: DropdownState.InvisibleUnmounted });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Verify the button is focused again
        assertActiveElement(getTrigger());
      })
    );
  });

  describe("`Tab` key", () => {
    it(
      "should focus trap when we use Tab",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[0]);

        // Try to tab
        await press(Keys.Tab);

        // Verify it is still open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({ state: DropdownState.Visible });
      })
    );

    it(
      "should focus trap when we use Shift+Tab",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[0]);

        // Try to Shift+Tab
        await press(shift(Keys.Tab));

        // Verify it is still open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({ state: DropdownState.Visible });
      })
    );
  });

  describe("`ArrowDown` key", () => {
    it(
      "should be possible to open the dropdown with ArrowDown",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowDown);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));

        // Verify that the first dropdown item is active
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should not be possible to open the dropdown with ArrowDown when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, { disabled: true }, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the dropdown
        await press(Keys.ArrowDown);

        // Verify it is still closed
        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });
      })
    );

    it(
      "should have no active dropdown item when there are no dropdown items at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [[Dropdown, {}, [[Trigger, {}, "Trigger"], [Items]]]],
        });

        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowDown);
        assertDropdown({ state: DropdownState.Visible });

        assertNoActiveItem();
      })
    );

    it(
      "should be possible to use ArrowDown to navigate the dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go down once
        await press(Keys.ArrowDown);
        assertDropdownLinkedWithItem(items[1]);

        // We should be able to go down again
        await press(Keys.ArrowDown);
        assertDropdownLinkedWithItem(items[2]);

        // We should NOT be able to go down again (because last item). Current implementation won't go around.
        await press(Keys.ArrowDown);
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to use ArrowDown to navigate the dropdown items and skip the first disabled one",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[1]);

        // We should be able to go down once
        await press(Keys.ArrowDown);
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to use ArrowDown to navigate the dropdown items and jump to the first non-disabled one",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[2]);
      })
    );
  });

  describe("`ArrowUp` key", () => {
    it(
      "should be possible to open the dropdown with ArrowUp and the last item should be active",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));

        // ! ALERT: The LAST item should now be active
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should not be possible to open the dropdown with ArrowUp and the last item should be active when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, { disabled: true }, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the dropdown
        await press(Keys.ArrowUp);

        // Verify it is still closed
        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });
      })
    );

    it(
      "should have no active dropdown item when there are no dropdown items at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [[Dropdown, {}, [[Trigger, {}, "Trigger"], [Items]]]],
        });

        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);
        assertDropdown({ state: DropdownState.Visible });

        assertNoActiveItem();
      })
    );

    it(
      "should be possible to use ArrowUp to navigate the dropdown items and jump to the first non-disabled one",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should not be possible to navigate up or down if there is only a single non-disabled item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[2]);

        // We should not be able to go up (because those are disabled)
        await press(Keys.ArrowUp);
        assertDropdownLinkedWithItem(items[2]);

        // We should not be able to go down (because this is the last item)
        await press(Keys.ArrowDown);
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to use ArrowUp to navigate the dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: DropdownState.InvisibleUnmounted,
          attributes: { id: "headlessui-dropdown-trigger-1" },
        });
        assertDropdown({ state: DropdownState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        // Verify it is open
        assertTrigger({ state: DropdownState.Visible });
        assertDropdown({
          state: DropdownState.Visible,
          attributes: { id: "headlessui-dropdown-items-2" },
        });
        assertTriggerLinkedWithDropdown();

        // Verify we have dropdown items
        const items = getItems();
        expect(items).toHaveLength(3);
        items.forEach((item) => assertItem(item));
        assertDropdownLinkedWithItem(items[2]);

        // We should be able to go down once
        await press(Keys.ArrowUp);
        assertDropdownLinkedWithItem(items[1]);

        // We should be able to go down again
        await press(Keys.ArrowUp);
        assertDropdownLinkedWithItem(items[0]);

        // We should NOT be able to go up again (because first item). Current implementation won't go around.
        await press(Keys.ArrowUp);
        assertDropdownLinkedWithItem(items[0]);
      })
    );
  });

  describe("`End` key", () => {
    it(
      "should be possible to use the End key to go to the last dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        const items = getItems();

        // We should be on the first item
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go to the last item
        await press(Keys.End);
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to use the End key to go to the last non disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        const items = getItems();

        // We should be on the first item
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go to the last non-disabled item
        await press(Keys.End);
        assertDropdownLinkedWithItem(items[1]);
      })
    );

    it(
      "should be possible to use the End key to go to the first dropdown item if that is the only non-disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.End);

        const items = getItems();
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should have no active dropdown item upon End key press, when there are no non-disabled dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.End);

        assertNoActiveItem();
      })
    );
  });

  describe("`PageDown` key", () => {
    it(
      "should be possible to use the PageDown key to go to the last dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        const items = getItems();

        // We should be on the first item
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go to the last item
        await press(Keys.PageDown);
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to use the PageDown key to go to the last non disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.Enter);

        const items = getItems();

        // We should be on the first item
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go to the last non-disabled item
        await press(Keys.PageDown);
        assertDropdownLinkedWithItem(items[1]);
      })
    );

    it(
      "should be possible to use the PageDown key to go to the first dropdown item if that is the only non-disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.PageDown);

        const items = getItems();
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should have no active dropdown item upon PageDown key press, when there are no non-disabled dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.PageDown);

        assertNoActiveItem();
      })
    );
  });

  describe("`Home` key", () => {
    it(
      "should be possible to use the Home key to go to the first dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        const items = getItems();

        // We should be on the last item
        assertDropdownLinkedWithItem(items[2]);

        // We should be able to go to the first item
        await press(Keys.Home);
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should be possible to use the Home key to go to the first non disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                    [Item, { as: "a" }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.Home);

        const items = getItems();

        // We should be on the first non-disabled item
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to use the Home key to go to the last dropdown item if that is the only non-disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a" }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.Home);

        const items = getItems();
        assertDropdownLinkedWithItem(items[3]);
      })
    );

    it(
      "should have no active dropdown item upon Home key press, when there are no non-disabled dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.Home);

        assertNoActiveItem();
      })
    );
  });

  describe("`PageUp` key", () => {
    it(
      "should be possible to use the PageUp key to go to the first dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "Item A"],
                    [Item, { as: "a" }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        const items = getItems();

        // We should be on the last item
        assertDropdownLinkedWithItem(items[2]);

        // We should be able to go to the first item
        await press(Keys.PageUp);
        assertDropdownLinkedWithItem(items[0]);
      })
    );

    it(
      "should be possible to use the PageUp key to go to the first non disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a" }, "Item C"],
                    [Item, { as: "a" }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.PageUp);

        const items = getItems();

        // We should be on the first non-disabled item
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to use the PageUp key to go to the last dropdown item if that is the only non-disabled dropdown item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a" }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.PageUp);

        const items = getItems();
        assertDropdownLinkedWithItem(items[3]);
      })
    );

    it(
      "should have no active dropdown item upon PageUp key press, when there are no non-disabled dropdown items",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a", disabled: true }, "Item A"],
                    [Item, { as: "a", disabled: true }, "Item B"],
                    [Item, { as: "a", disabled: true }, "Item C"],
                    [Item, { as: "a", disabled: true }, "Item D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        // We opened via click, we don't have an active item
        assertNoActiveItem();

        // We should not be able to go to the end
        await press(Keys.PageUp);

        assertNoActiveItem();
      })
    );
  });

  describe("`Any` key aka search", () => {
    it(
      "should be possible to type a full word that has a perfect match",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "alice"],
                    [Item, { as: "a" }, "bob"],
                    [Item, { as: "a" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open dropdown
        await click(getTrigger());

        const items = getItems();

        // We should be able to go to the second item
        await type(word("bob"));
        assertDropdownLinkedWithItem(items[1]);

        // We should be able to go to the first item
        await type(word("alice"));
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go to the last item
        await type(word("charlie"));
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to type a partial of a word",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "alice"],
                    [Item, { as: "a" }, "bob"],
                    [Item, { as: "a" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        const items = getItems();

        // We should be on the last item
        assertDropdownLinkedWithItem(items[2]);

        // We should be able to go to the second item
        await type(word("bo"));
        assertDropdownLinkedWithItem(items[1]);

        // We should be able to go to the first item
        await type(word("ali"));
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go to the last item
        await type(word("char"));
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should be possible to type words with spaces",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "value a"],
                    [Item, { as: "a" }, "value b"],
                    [Item, { as: "a" }, "value c"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        const items = getItems();

        // We should be on the last item
        assertDropdownLinkedWithItem(items[2]);

        // We should be able to go to the second item
        await type(word("value b"));
        assertDropdownLinkedWithItem(items[1]);

        // We should be able to go to the first item
        await type(word("value a"));
        assertDropdownLinkedWithItem(items[0]);

        // We should be able to go to the last item
        await type(word("value c"));
        assertDropdownLinkedWithItem(items[2]);
      })
    );

    it(
      "should not be possible to search for a disabled item",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "alice"],
                    [Item, { as: "a", disabled: true }, "bob"],
                    [Item, { as: "a" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        const items = getItems();

        // We should be on the last item
        assertDropdownLinkedWithItem(items[2]);

        // We should not be able to go to the disabled item
        await type(word("bo"));

        // We should still be on the last item
        assertDropdownLinkedWithItem(items[2]);
      })
    );
    it(
      "should be possible to search for a word (case insensitive)",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Dropdown,
              {},
              [
                [Trigger, {}, "Trigger"],
                [
                  Items,
                  {},
                  [
                    [Item, { as: "a" }, "alice"],
                    [Item, { as: "a" }, "bob"],
                    [Item, { as: "a" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open dropdown
        await press(Keys.ArrowUp);

        const items = getItems();

        // We should be on the last item
        assertDropdownLinkedWithItem(items[2]);

        // Search for bob in a different casing
        await type(word("BO"));

        // We should be on `bob`
        assertDropdownLinkedWithItem(items[1]);
      })
    );
  });
});

describe("Mouse interactions", () => {
  it(
    "should be possible to open a dropdown on click",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Open dropdown
      await click(getTrigger());

      // Verify it is open
      assertTrigger({ state: DropdownState.Visible });
      assertDropdown({
        state: DropdownState.Visible,
        attributes: { id: "headlessui-dropdown-items-2" },
      });
      assertTriggerLinkedWithDropdown();

      // Verify we have dropdown items
      const items = getItems();
      expect(items).toHaveLength(3);
      items.forEach((item) => assertItem(item));
    })
  );

  it(
    "should not be possible to open a dropdown on right click",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Try to open the dropdown
      await click(getTrigger(), MouseButton.Right);

      // Verify it is still closed
      assertTrigger({ state: DropdownState.InvisibleUnmounted });
    })
  );

  it(
    "should not be possible to open a dropdown on click when the button is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, { disabled: true }, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Try to open the dropdown
      await click(getTrigger());

      // Verify it is still closed
      assertTrigger({
        state: DropdownState.InvisibleUnmounted,
        attributes: { id: "headlessui-dropdown-trigger-1" },
      });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });
    })
  );

  it(
    "should be possible to close a dropdown on click",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      // Verify it is open
      assertTrigger({ state: DropdownState.Visible });

      // Click to close
      await click(getTrigger());

      // Verify it is closed
      assertTrigger({ state: DropdownState.InvisibleUnmounted });
      assertDropdown({ state: DropdownState.InvisibleUnmounted });
    })
  );

  it(
    "should be a no-op when we click outside of a closed dropdown",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Verify that the window is closed
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Click something that is not related to the dropdown
      await click(document.body);

      // Should still be closed
      assertDropdown({ state: DropdownState.InvisibleUnmounted });
    })
  );

  it(
    "should be possible to click outside of the dropdown which should close the dropdown",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      // Click something that is not related to the dropdown
      await click(document.body);

      // Should be closed now
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Verify the button is focused again
      assertActiveElement(getTrigger());
    })
  );

  it(
    "should be possible to click outside of the dropdown which should close the dropdown (even if we press the dropdown button)",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      // Click the dropdown button again
      await click(getTrigger());

      // Should be closed now
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Verify the button is focused again
      assertActiveElement(getTrigger());
    })
  );

  it(
    "should be possible to click outside of the dropdown on another dropdown button which should close the current dropdown and open the new dropdown",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Div,
            {},
            [
              [
                Dropdown,
                {},
                [
                  [Trigger, {}, "Trigger"],
                  [
                    Items,
                    {},
                    [
                      [Item, { as: "a" }, "Item A"],
                      [Item, { as: "a" }, "Item B"],
                      [Item, { as: "a" }, "Item C"],
                    ],
                  ],
                ],
              ],
              [
                Dropdown,
                {},
                [
                  [Trigger, {}, "Trigger"],
                  [
                    Items,
                    {},
                    [
                      [Item, { as: "a" }, "Item A"],
                      [Item, { as: "a" }, "Item B"],
                      [Item, { as: "a" }, "Item C"],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      });

      const [button1, button2] = getTriggers();

      // Click the first dropdown button
      await click(button1);
      expect(getDropdowns()).toHaveLength(1); // Only 1 dropdown should be visible

      // Ensure the open dropdown is linked to the first button
      assertTriggerLinkedWithDropdown(button1, getDropdown());

      // Click the second dropdown button
      await click(button2);

      expect(getDropdowns()).toHaveLength(1); // Only 1 dropdown should be visible

      // Ensure the open dropdown is linked to the second button
      assertTriggerLinkedWithDropdown(button2, getDropdown());
    })
  );

  // TODO: This test looks like it's for React-specific behavior (for some reason)
  it.skip(
    "should be possible to click outside of the dropdown, on an element which is within a focusable element, which closes the dropdown",
    suppressConsoleLogs(async () => {
      const focusFn = jest.fn();
      render(TestRenderer, {
        allProps: [
          [
            Div,
            {},
            [
              [
                Dropdown,
                {},
                [
                  [Trigger, { onFocus: focusFn }, "Trigger"],
                  [
                    Items,
                    {},
                    [
                      [Item, { as: "a" }, "Item A"],
                      [Item, { as: "a" }, "Item B"],
                      [Item, { as: "a" }, "Item C"],
                    ],
                  ],
                ],
              ],
              [Button, { id: "btn" }, [[Span, {}, "Next"]]],
            ],
          ],
        ],
      });

      // Click the dropdown button
      await click(getTrigger());

      // Ensure the dropdown is open
      assertDropdown({ state: DropdownState.Visible });

      // Click the span inside the button
      await click(getByText("Next"));

      // Ensure the dropdown is closed
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Ensure the outside button is focused
      assertActiveElement(document.getElementById("btn"));

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1);
    })
  );

  it(
    "should be possible to hover an item and make it active",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      const items = getItems();
      // We should be able to go to the second item
      await mouseMove(items[1]);
      assertDropdownLinkedWithItem(items[1]);

      // We should be able to go to the first item
      await mouseMove(items[0]);
      assertDropdownLinkedWithItem(items[0]);

      // We should be able to go to the last item
      await mouseMove(items[2]);
      assertDropdownLinkedWithItem(items[2]);
    })
  );

  it(
    "should make a dropdown item active when you move the mouse over it",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      const items = getItems();
      // We should be able to go to the second item
      await mouseMove(items[1]);
      assertDropdownLinkedWithItem(items[1]);
    })
  );

  it(
    "should be a no-op when we move the mouse and the dropdown item is already active",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      const items = getItems();

      // We should be able to go to the second item
      await mouseMove(items[1]);
      assertDropdownLinkedWithItem(items[1]);

      await mouseMove(items[1]);

      // Nothing should be changed
      assertDropdownLinkedWithItem(items[1]);
    })
  );

  it(
    "should be a no-op when we move the mouse and the dropdown item is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a", disabled: true }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      const items = getItems();

      await mouseMove(items[1]);
      assertNoActiveItem();
    })
  );

  it(
    "should not be possible to hover an item that is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a", disabled: true }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      const items = getItems();

      // Try to hover over item 1, which is disabled
      await mouseMove(items[1]);

      // We should not have an active item now
      assertNoActiveItem();
    })
  );

  it(
    "should be possible to mouse leave an item and make it inactive",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      const items = getItems();

      // We should be able to go to the second item
      await mouseMove(items[1]);
      assertDropdownLinkedWithItem(items[1]);

      await mouseLeave(items[1]);
      assertNoActiveItem();

      // We should be able to go to the first item
      await mouseMove(items[0]);
      assertDropdownLinkedWithItem(items[0]);

      await mouseLeave(items[0]);
      assertNoActiveItem();

      // We should be able to go to the last item
      await mouseMove(items[2]);
      assertDropdownLinkedWithItem(items[2]);

      await mouseLeave(items[2]);
      assertNoActiveItem();
    })
  );

  it(
    "should be possible to mouse leave a disabled item and be a no-op",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a", disabled: true }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());

      const items = getItems();

      // Try to hover over item 1, which is disabled
      await mouseMove(items[1]);
      assertNoActiveItem();

      await mouseLeave(items[1]);
      assertNoActiveItem();
    })
  );

  it(
    "should be possible to click a dropdown item, which closes the dropdown",
    suppressConsoleLogs(async () => {
      const clickHandler = jest.fn();
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a", onClick: clickHandler }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      const items = getItems();

      // We should be able to click the first item
      await click(items[1]);

      assertDropdown({ state: DropdownState.InvisibleUnmounted });
      expect(clickHandler).toHaveBeenCalled();
    })
  );

  it(
    "should be possible to click a dropdown item, which closes the dropdown and invokes the @click handler",
    suppressConsoleLogs(async () => {
      const clickHandler = jest.fn();
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "button", onClick: clickHandler }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      // We should be able to click the first item
      await click(getItems()[1]);
      assertDropdown({ state: DropdownState.InvisibleUnmounted });

      // Verify the callback has been called
      expect(clickHandler).toHaveBeenCalledTimes(1);
    })
  );

  it(
    "should be possible to click a disabled dropdown item, which is a no-op",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a", disabled: true }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      const items = getItems();

      // We should be able to click the first item
      await click(items[1]);
      assertDropdown({ state: DropdownState.Visible });
    })
  );

  it(
    "should be possible focus a dropdown item, so that it becomes active",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a" }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      const items = getItems();

      // Verify that nothing is active yet
      assertNoActiveItem();

      // We should be able to focus the first item
      await focus(items[1]);
      assertDropdownLinkedWithItem(items[1]);
    })
  );

  it(
    "should not be possible to focus a dropdown item which is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a" }, "Item A"],
                  [Item, { as: "a", disabled: true }, "Item B"],
                  [Item, { as: "a" }, "Item C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      const items = getItems();

      // We should not be able to focus the first item
      await focus(items[1]);
      assertNoActiveItem();
    })
  );

  it(
    "should not be possible to activate a disabled item",
    suppressConsoleLogs(async () => {
      const clickHandler = jest.fn();

      render(TestRenderer, {
        allProps: [
          [
            Dropdown,
            {},
            [
              [Trigger, {}, "Trigger"],
              [
                Items,
                {},
                [
                  [Item, { as: "a", onClick: clickHandler }, "Item A"],
                  [
                    Item,
                    { as: "a", onClick: clickHandler, disabled: true },
                    "Item B",
                  ],
                  [
                    Item,
                    { disabled: true },
                    [[Button, { onClick: clickHandler }, "Item C"]],
                  ],
                ],
              ],
            ],
          ],
        ],
      });

      // Open dropdown
      await click(getTrigger());
      assertDropdown({ state: DropdownState.Visible });

      const items = getItems();

      await focus(items[0]);
      await click(items[1]);
      expect(clickHandler).not.toHaveBeenCalled();

      // Activate the last item
      await click(getItems()[2]);
      expect(clickHandler).not.toHaveBeenCalled();
    })
  );
});
