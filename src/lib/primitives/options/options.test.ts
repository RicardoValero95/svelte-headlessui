import { act, render } from "@testing-library/svelte";
import svelte from "svelte-inline-compile";
import { writable } from "svelte/store";

import TransitionDebug from "$lib/components/disclosure/_TransitionDebug.svelte";
import { Transition } from "$lib/components/transitions";
import Button from "$lib/internal/elements/Button.svelte";
import Div from "$lib/internal/elements/Div.svelte";
import Span from "$lib/internal/elements/Span.svelte";
import {
  assertActiveElement,
  getByText,
} from "$lib/test-utils/accessibility-assertions";
import {
  assertActiveOption,
  assertRoot,
  assertTrigger,
  assertTriggerLinkedWithRoot,
  assertTriggerLinkedWithLabel,
  assertLabel,
  assertLabelLinkedWithRoot,
  assertOption,
  assertNoActiveOption,
  assertNoSelectedOption,
  getRoot,
  getTrigger,
  getTriggers,
  getRoots,
  getLabel,
  getOptions,
  RootState,
} from "$lib/test-utils/accessibility-assertions/options";
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

import ManagedRoot from "./_ManagedRoot.svelte";

import { Root, Trigger, Label, Option, Options } from ".";

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

describe("safeguards", () => {
  it.each([
    ["Trigger", Trigger],
    ["Label", Label],
    ["Options", Options],
    ["Option", Option],
  ])(
    "should error when we are using a <%s /> without a parent <Root />",
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Root /> component.`
      );
    })
  );

  it(
    "should be possible to render a Root without crashing",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });
    })
  );
});

describe("Rendering", () => {
  describe("Root", () => {
    it(
      "should render a Root using slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Root value={undefined} on:change={console.log} let:open>
            <Trigger>Root</Trigger>
            {#if open}
              <Options>
                <Option value="a">Option A</Option>
                <Option value="b">Option B</Option>
                <Option value="c">Option C</Option>
              </Options>
            {/if}
          </Root>
        `);

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: RootState.Visible,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.Visible });
      })
    );

    it(
      "should be possible to disable a Root",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log, disabled: true },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await press(Keys.Enter, getTrigger());

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });
      })
    );
  });

  describe("Label", () => {
    it(
      "should be possible to render a Label using slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Root value={undefined} on:change={console.log}>
            <Label let:open let:disabled>{JSON.stringify({ open, disabled })}</Label>
            <Trigger>Root</Trigger>
            <Options>
              <Option value="a"> Option A </Option>
              <Option value="b"> Option B </Option>
              <Option value="c"> Option C </Option>
            </Options>
          </Root>
        `);

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-2" },
        });
        assertLabel({
          attributes: { id: "headlessui-root-label-1" },
          textContent: JSON.stringify({ open: false, disabled: false }),
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());

        assertLabel({
          attributes: { id: "headlessui-root-label-1" },
          textContent: JSON.stringify({ open: true, disabled: false }),
        });
        assertRoot({ state: RootState.Visible });
        assertLabelLinkedWithRoot();
        assertTriggerLinkedWithLabel();
      })
    );

    it(
      "should be possible to render a Label with slot props and an `as` prop",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Root value={undefined} on:change={console.log}>
            <Label as="p" let:open let:disabled>{JSON.stringify({ open, disabled })}</Label>
            <Trigger>Root</Trigger>
            <Options>
              <Option value="a">Option A</Option>
              <Option value="b">Option B</Option>
              <Option value="c">Option C</Option>
            </Options>
          </Root>
        `);

        assertLabel({
          attributes: { id: "headlessui-root-label-1" },
          textContent: JSON.stringify({ open: false, disabled: false }),
          tag: "p",
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());
        assertLabel({
          attributes: { id: "headlessui-root-label-1" },
          textContent: JSON.stringify({ open: true, disabled: false }),
          tag: "p",
        });
        assertRoot({ state: RootState.Visible });
      })
    );
  });

  describe("Trigger", () => {
    it(
      "should render a Trigger with slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Root value={undefined} on:change={console.log}>
            <Trigger let:open let:disabled>{JSON.stringify({ open, disabled})}</Trigger>
            <Options>
              <Option value="a">Option A </Option>
              <Option value="b">Option B </Option>
              <Option value="c">Option C </Option>
            </Options>
          </Root>
        `);

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
          textContent: JSON.stringify({ open: false, disabled: false }),
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: RootState.Visible,
          attributes: { id: "headlessui-root-trigger-1" },
          textContent: JSON.stringify({ open: true, disabled: false }),
        });
        assertRoot({ state: RootState.Visible });
      })
    );

    it(
      "should be possible to render a Trigger using slot props and an `as` prop",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Root value={undefined} onChange={console.log}>
            <Trigger as="div" role="button" let:open let:disabled>
              {JSON.stringify({ open, disabled })}
            </Trigger>
            <Options>
              <Option value="a">Option A</Option>
              <Option value="b">Option B</Option>
              <Option value="c">Option C</Option>
            </Options>
          </Root>
        `);

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
          textContent: JSON.stringify({ open: false, disabled: false }),
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: RootState.Visible,
          attributes: { id: "headlessui-root-trigger-1" },
          textContent: JSON.stringify({ open: true, disabled: false }),
        });
        assertRoot({ state: RootState.Visible });
      })
    );

    it(
      "should be possible to render a Trigger and a Label and see them linked together",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Label, {}, "Label"],
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // TODO: Needed to make it similar to vue test implementation?
        // await new Promise(requestAnimationFrame)

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-2" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });
        assertTriggerLinkedWithLabel();
      })
    );

    describe("`type` attribute", () => {
      it('should set the `type` to "button" by default', async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: null, onChange: console.log },
              [[Trigger, {}, "Root"]],
            ],
          ],
        });

        expect(getTrigger()).toHaveAttribute("type", "button");
      });

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: null, onChange: console.log },
              [[Trigger, { type: "submit" }, "Root"]],
            ],
          ],
        });

        expect(getTrigger()).toHaveAttribute("type", "submit");
      });

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: null, onChange: console.log },
              [[Trigger, { as: "div" }, "Root"]],
            ],
          ],
        });

        expect(getTrigger()).not.toHaveAttribute("type");
      });
    });
  });

  describe("Options", () => {
    it(
      "should render Options with slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Root value={undefined} on:change={console.log}>
            <Trigger>Root</Trigger>
            <Options let:open>
              <Option value="a">{JSON.stringify({ open })}</Option>
            </Options>
          </Root>
        `);

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: RootState.Visible,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({
          state: RootState.Visible,
          textContent: JSON.stringify({ open: true }),
        });
        assertActiveElement(getRoot());
      })
    );

    it("should be possible to always render the Options if we provide it a `static` prop", () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                { static: true },
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Let's verify that the Root is already there
      expect(getRoot()).not.toBe(null);
    });

    it("should be possible to use a different render strategy for the Options", async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                { unmount: false },
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertRoot({ state: RootState.InvisibleHidden });

      // Let's open the Root, to see if it is not hidden anymore
      await click(getTrigger());

      assertRoot({ state: RootState.Visible });
    });
  });

  describe("Option", () => {
    it(
      "should render a Option with slot props",
      suppressConsoleLogs(async () => {
        render(svelte`
          <Root value={undefined} on:change={console.log}>
            <Trigger>Root</Trigger>
            <Options>
              <Option value="a" let:active let:selected let:disabled>
                {JSON.stringify({ active, selected, disabled })}
              </Option>
            </Options>
          </Root>
        `);

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        await click(getTrigger());

        assertTrigger({
          state: RootState.Visible,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({
          state: RootState.Visible,
          textContent: JSON.stringify({
            active: false,
            selected: false,
            disabled: false,
          }),
        });
      })
    );

    it("should guarantee the listbox option order after a few unmounts", async () => {
      const showFirst = writable(false);
      render(svelte`
      <Root value={undefined}>
        <Trigger>Root</Trigger>
        <Options>
          {#if $showFirst}
            <Option value="a">Option A</Option>
          {/if}
          <Option value="b">Option B</Option>
          <Option value="c">Option C</Option>
        </Options>
      </Root>
    `);

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Open Root
      await click(getTrigger());

      let options = getOptions();
      expect(options).toHaveLength(2);
      options.forEach((option) => assertOption(option));

      // Make the first option active
      await press(Keys.ArrowDown);

      // Verify that the first listbox option is active
      assertActiveOption(options[0]);

      // Now add a new option dynamically
      await act(() => showFirst.set(true));

      // New option should be treated correctly
      options = getOptions();
      expect(options).toHaveLength(3);
      options.forEach((option) => assertOption(option));

      // Focused option should now be second
      assertActiveOption(options[1]);

      // We should be able to go to the first option
      await press(Keys.Home);
      assertActiveOption(options[0]);

      // And the last one
      await press(Keys.End);
      assertActiveOption(options[2]);
    });
  });
});

describe("Rendering composition", () => {
  it(
    "should be possible to conditionally render classNames (aka class can be a function?!)",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [
                    Option,
                    { value: "a", class: (bag: any) => JSON.stringify(bag) },
                    "Option A",
                  ],
                  [
                    Option,
                    {
                      value: "b",
                      class: (bag: any) => JSON.stringify(bag),
                      disabled: true,
                    },
                    "Option B",
                  ],
                  [
                    Option,
                    { value: "c", class: "no-special-treatment" },
                    "Option C",
                  ],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Open Root
      await click(getTrigger());

      const options = getOptions();

      // Verify correct classNames
      expect("" + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      );
      expect("" + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      );
      expect("" + options[2].classList).toEqual("no-special-treatment");

      // Double check that nothing is active
      assertNoActiveOption(getRoot());

      // Make the first option active
      await press(Keys.ArrowDown);

      // Verify the classNames
      expect("" + options[0].classList).toEqual(
        JSON.stringify({ active: true, selected: false, disabled: false })
      );
      expect("" + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      );
      expect("" + options[2].classList).toEqual("no-special-treatment");

      // Double check that the first option is the active one
      assertActiveOption(options[0]);

      // Let's go down, this should go to the third option since the second option is disabled!
      await press(Keys.ArrowDown);

      // Verify the classNames
      expect("" + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      );
      expect("" + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      );
      expect("" + options[2].classList).toEqual("no-special-treatment");

      // Double check that the last option is the active one
      assertActiveOption(options[2]);
    })
  );

  it(
    "should be possible to swap the Root option with a button for example",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { as: "button", value: "a" }, "Option A"],
                  [Option, { as: "button", value: "b" }, "Option B"],
                  [Option, { as: "button", value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Open Root
      await click(getTrigger());

      // Verify options are buttons now
      getOptions().forEach((option) => assertOption(option, { tag: "button" }));
    })
  );
});

describe("Composition", () => {
  it(
    "should be possible to wrap the Options with a Transition component",
    suppressConsoleLogs(async () => {
      const orderFn = jest.fn();
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [TransitionDebug, { name: "Root", fn: orderFn }],
              [
                Transition,
                {},
                [
                  [TransitionDebug, { name: "Transition", fn: orderFn }],
                  [
                    Options,
                    {},
                    [
                      [
                        Option,
                        { as: "button", value: "a" },
                        [
                          [TransitionDebug, { name: "Option", fn: orderFn }],
                          "Option A",
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
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      await click(getTrigger());

      assertTrigger({
        state: RootState.Visible,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({
        state: RootState.Visible,
        textContent: "Option A",
      });

      await click(getTrigger());

      // Wait for all transitions to finish
      await nextFrame();

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ["Mounting - Root"],
        ["Mounting - Transition"],
        ["Mounting - Option"],
        ["Unmounting - Transition"],
        ["Unmounting - Option"],
      ]);
    })
  );
});

describe("Keyboard interactions", () => {
  describe("`Enter` key", () => {
    it(
      "should be possible to open the listbox with Enter",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option, { selected: false }));

        // Verify that the first listbox option is active
        assertActiveOption(options[0]);
        assertNoSelectedOption();
      })
    );

    it(
      "should not be possible to open the listbox with Enter when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log, disabled: true },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the listbox
        await press(Keys.Enter);

        // Verify it is still closed
        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });
      })
    );

    it(
      "should be possible to open the listbox with Enter, and focus the selected option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: "b", onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option, i) =>
          assertOption(option, { selected: i === 1 })
        );

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveOption(options[1]);
      })
    );

    it(
      "should be possible to open the listbox with Enter, and focus the selected option (when using the `hidden` render strategy)",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: "b", onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  { unmount: false },
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleHidden,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleHidden });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        const options = getOptions();

        // Hover over Option A
        await mouseMove(options[0]);

        // Verify that Option A is active
        assertActiveOption(options[0]);

        // Verify that Option B is still selected
        assertOption(options[1], { selected: true });

        // Close/Hide the listbox
        await press(Keys.Escape);

        // Re-open the listbox
        await click(getTrigger());

        // Verify we have listbox options
        expect(options).toHaveLength(3);
        options.forEach((option, i) =>
          assertOption(option, { selected: i === 1 })
        );

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveOption(options[1]);
      })
    );

    it(
      "should be possible to open the listbox with Enter, and focus the selected option (with a list of objects)",
      suppressConsoleLogs(async () => {
        const myOptions = [
          { id: "a", name: "Option A" },
          { id: "b", name: "Option B" },
          { id: "c", name: "Option C" },
        ];
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: myOptions[1], onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: myOptions[0] }, "Option A"],
                    [Option, { value: myOptions[1] }, "Option B"],
                    [Option, { value: myOptions[2] }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option, i) =>
          assertOption(option, { selected: i === 1 })
        );

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveOption(options[1]);
      })
    );

    it(
      "should have no active listbox option when there are no listbox options at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [[Trigger, {}, "Root"], [Options]],
            ],
          ],
        });

        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);
        assertRoot({ state: RootState.Visible });
        assertActiveElement(getRoot());

        assertNoActiveOption();
      })
    );

    it(
      "should focus the first non disabled listbox option when opening with Enter",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        const options = getOptions();

        // Verify that the first non-disabled listbox option is active
        assertActiveOption(options[1]);
      })
    );

    it(
      "should focus the first non disabled listbox option when opening with Enter (jump over multiple disabled ones)",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        const options = getOptions();

        // Verify that the first non-disabled listbox option is active
        assertActiveOption(options[2]);
      })
    );

    it(
      "should have no active listbox option upon Enter key press, when there are no non-disabled listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        assertNoActiveOption();
      })
    );

    it(
      "should be possible to close the listbox with Enter when there is no active listboxoption",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Open listbox
        await click(getTrigger());

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });

        // Close listbox
        await press(Keys.Enter);

        // Verify it is closed
        assertTrigger({ state: RootState.InvisibleUnmounted });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Verify the button is focused again
        assertActiveElement(getTrigger());
      })
    );

    it(
      "should be possible to close the listbox with Enter and choose the active listbox option",
      suppressConsoleLogs(async () => {
        const handleChange = jest.fn();

        render(TestRenderer, {
          allProps: [
            [
              ManagedRoot,
              {
                value: undefined,
                onChange: (e: CustomEvent) => handleChange(e.detail),
              },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Open listbox
        await click(getTrigger());

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });

        // Activate the first listbox option
        const options = getOptions();
        await mouseMove(options[0]);

        // Choose option, and close listbox
        await press(Keys.Enter);

        // Verify it is closed
        assertTrigger({ state: RootState.InvisibleUnmounted });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith("a");

        // Verify the button is focused again
        assertActiveElement(getTrigger());

        // Open listbox again
        await click(getTrigger());

        // Verify the active option is the previously selected one
        assertActiveOption(getOptions()[0]);
      })
    );
  });

  describe("`Space` key", () => {
    it(
      "should be possible to open the listbox with Space",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Space);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[0]);
      })
    );

    it(
      "should not be possible to open the listbox with Space when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log, disabled: true },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the listbox
        await press(Keys.Space);

        // Verify it is still closed
        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });
      })
    );

    it(
      "should be possible to open the listbox with Space, and focus the selected option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: "b", onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Space);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option, i) =>
          assertOption(option, { selected: i === 1 })
        );

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveOption(options[1]);
      })
    );

    it(
      "should have no active listbox option when there are no listbox options at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [Options, {}],
              ],
            ],
          ],
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Space);
        assertRoot({ state: RootState.Visible });
        assertActiveElement(getRoot());

        assertNoActiveOption();
      })
    );

    it(
      "should focus the first non disabled listbox option when opening with Space",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Space);

        const options = getOptions();

        // Verify that the first non-disabled listbox option is active
        assertActiveOption(options[1]);
      })
    );

    it(
      "should focus the first non disabled listbox option when opening with Space (jump over multiple disabled ones)",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Space);

        const options = getOptions();

        // Verify that the first non-disabled listbox option is active
        assertActiveOption(options[2]);
      })
    );

    it(
      "should have no active listbox option upon Space key press, when there are no non-disabled listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Space);

        assertNoActiveOption();
      })
    );

    it(
      "should be possible to close the listbox with Space and choose the active listbox option",
      suppressConsoleLogs(async () => {
        const handleChange = jest.fn();
        render(TestRenderer, {
          allProps: [
            [
              ManagedRoot,
              {
                value: undefined,
                onChange: (e: CustomEvent) => handleChange(e.detail),
              },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Open listbox
        await click(getTrigger());

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });

        // Activate the first listbox option
        const options = getOptions();
        await mouseMove(options[0]);

        // Choose option, and close listbox
        await press(Keys.Space);

        // Verify it is closed
        assertTrigger({ state: RootState.InvisibleUnmounted });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith("a");

        // Verify the button is focused again
        assertActiveElement(getTrigger());

        // Open listbox again
        await click(getTrigger());

        // Verify the active option is the previously selected one
        assertActiveOption(getOptions()[0]);
      })
    );
  });

  describe("`Escape` key", () => {
    it(
      "should be possible to close an open listbox with Escape",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Space);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Close listbox
        await press(Keys.Escape);

        // Verify it is closed
        assertTrigger({ state: RootState.InvisibleUnmounted });
        assertRoot({ state: RootState.InvisibleUnmounted });

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
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[0]);

        // Try to tab
        await press(Keys.Tab);

        // Verify it is still open
        assertTrigger({ state: RootState.Visible });
        assertRoot({ state: RootState.Visible });
        assertActiveElement(getRoot());
      })
    );

    it(
      "should focus trap when we use Shift+Tab",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[0]);

        // Try to Shift+Tab
        await press(shift(Keys.Tab));

        // Verify it is still open
        assertTrigger({ state: RootState.Visible });
        assertRoot({ state: RootState.Visible });
        assertActiveElement(getRoot());
      })
    );
  });

  describe("`ArrowDown` key", () => {
    it(
      "should be possible to open the listbox with ArrowDown",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });
        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowDown);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));

        // Verify that the first listbox option is active
        assertActiveOption(options[0]);
      })
    );

    it(
      "should not be possible to open the listbox with ArrowDown when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log, disabled: true },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the listbox
        await press(Keys.ArrowDown);

        // Verify it is still closed
        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });
      })
    );

    it(
      "should be possible to open the listbox with ArrowDown, and focus the selected option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: "b", onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowDown);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option, i) =>
          assertOption(option, { selected: i === 1 })
        );

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveOption(options[1]);
      })
    );

    it(
      "should have no active listbox option when there are no listbox options at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [[Trigger, {}, "Root"], [Options]],
            ],
          ],
        });

        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowDown);
        assertRoot({ state: RootState.Visible });
        assertActiveElement(getRoot());

        assertNoActiveOption();
      })
    );

    it(
      "should be possible to use ArrowDown to navigate the listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });
        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[0]);

        // We should be able to go down once
        await press(Keys.ArrowDown);
        assertActiveOption(options[1]);

        // We should be able to go down again
        await press(Keys.ArrowDown);
        assertActiveOption(options[2]);

        // We should NOT be able to go down again (because last option). Current implementation won't go around.
        await press(Keys.ArrowDown);
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to use ArrowDown to navigate the listbox options and skip the first disabled one",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[1]);

        // We should be able to go down once
        await press(Keys.ArrowDown);
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to use ArrowDown to navigate the listbox options and jump to the first non-disabled one",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[2]);
      })
    );
  });

  describe("`ArrowRight` key", () => {
    it(
      "should be possible to use ArrowRight to navigate the listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log, horizontal: true },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[0]);

        // We should be able to go right once
        await press(Keys.ArrowRight);
        assertActiveOption(options[1]);

        // We should be able to go right again
        await press(Keys.ArrowRight);
        assertActiveOption(options[2]);

        // We should NOT be able to go right again (because last option). Current implementation won't go around.
        await press(Keys.ArrowRight);
        assertActiveOption(options[2]);
      })
    );
  });

  describe("`ArrowUp` key", () => {
    it(
      "should be possible to open the listbox with ArrowUp and the last option should be active",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));

        // ! ALERT: The LAST option should now be active
        assertActiveOption(options[2]);
      })
    );

    it(
      "should not be possible to open the listbox with ArrowUp and the last option should be active when the button is disabled",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log, disabled: true },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Try to open the listbox
        await press(Keys.ArrowUp);

        // Verify it is still closed
        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });
      })
    );

    it(
      "should be possible to open the listbox with ArrowUp, and focus the selected option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: "b", onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option, i) =>
          assertOption(option, { selected: i === 1 })
        );

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveOption(options[1]);
      })
    );

    it(
      "should have no active listbox option when there are no listbox options at all",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [Options, {}],
              ],
            ],
          ],
        });

        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);
        assertRoot({ state: RootState.Visible });
        assertActiveElement(getRoot());

        assertNoActiveOption();
      })
    );

    it(
      "should be possible to use ArrowUp to navigate the listbox options and jump to the first non-disabled one",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[0]);
      })
    );

    it(
      "should not be possible to navigate up or down if there is only a single non-disabled option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[2]);

        // We should not be able to go up (because those are disabled)
        await press(Keys.ArrowUp);
        assertActiveOption(options[2]);

        // We should not be able to go down (because this is the last option)
        await press(Keys.ArrowDown);
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to use ArrowUp to navigate the listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[2]);

        // We should be able to go down once
        await press(Keys.ArrowUp);
        assertActiveOption(options[1]);

        // We should be able to go down again
        await press(Keys.ArrowUp);
        assertActiveOption(options[0]);

        // We should NOT be able to go up again (because first option). Current implementation won't go around.
        await press(Keys.ArrowUp);
        assertActiveOption(options[0]);
      })
    );
  });

  describe("`ArrowLeft` key", () => {
    it(
      "should be possible to use ArrowLeft to navigate the listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log, horizontal: true },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        assertTrigger({
          state: RootState.InvisibleUnmounted,
          attributes: { id: "headlessui-root-trigger-1" },
        });
        assertRoot({ state: RootState.InvisibleUnmounted });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        // Verify it is visible
        assertTrigger({ state: RootState.Visible });
        assertRoot({
          state: RootState.Visible,
          attributes: { id: "headlessui-options-2" },
          orientation: "horizontal",
        });
        assertActiveElement(getRoot());
        assertTriggerLinkedWithRoot();

        // Verify we have listbox options
        const options = getOptions();
        expect(options).toHaveLength(3);
        options.forEach((option) => assertOption(option));
        assertActiveOption(options[2]);

        // We should be able to go left once
        await press(Keys.ArrowLeft);
        assertActiveOption(options[1]);

        // We should be able to go left again
        await press(Keys.ArrowLeft);
        assertActiveOption(options[0]);

        // We should NOT be able to go left again (because first option). Current implementation won't go around.
        await press(Keys.ArrowLeft);
        assertActiveOption(options[0]);
      })
    );
  });

  describe("`End` key", () => {
    it(
      "should be possible to use the End key to go to the last listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        const options = getOptions();

        // We should be on the first option
        assertActiveOption(options[0]);

        // We should be able to go to the last option
        await press(Keys.End);
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to use the End key to go to the last non disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        const options = getOptions();

        // We should be on the first option
        assertActiveOption(options[0]);

        // We should be able to go to the last non-disabled option
        await press(Keys.End);
        assertActiveOption(options[1]);
      })
    );

    it(
      "should be possible to use the End key to go to the first listbox option if that is the only non-disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.End);

        const options = getOptions();
        assertActiveOption(options[0]);
      })
    );

    it(
      "should have no active listbox option upon End key press, when there are no non-disabled listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.End);

        assertNoActiveOption();
      })
    );
  });

  describe("`PageDown` key", () => {
    it(
      "should be possible to use the PageDown key to go to the last listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        const options = getOptions();

        // We should be on the first option
        assertActiveOption(options[0]);

        // We should be able to go to the last option
        await press(Keys.PageDown);
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to use the PageDown key to go to the last non disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.Enter);

        const options = getOptions();

        // We should be on the first option
        assertActiveOption(options[0]);

        // We should be able to go to the last non-disabled option
        await press(Keys.PageDown);
        assertActiveOption(options[1]);
      })
    );

    it(
      "should be possible to use the PageDown key to go to the first listbox option if that is the only non-disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.PageDown);

        const options = getOptions();
        assertActiveOption(options[0]);
      })
    );

    it(
      "should have no active listbox option upon PageDown key press, when there are no non-disabled listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.PageDown);

        assertNoActiveOption();
      })
    );
  });

  describe("`Home` key", () => {
    it(
      "should be possible to use the Home key to go to the first listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        const options = getOptions();

        // We should be on the last option
        assertActiveOption(options[2]);

        // We should be able to go to the first option
        await press(Keys.Home);
        assertActiveOption(options[0]);
      })
    );

    it(
      "should be possible to use the Home key to go to the first non disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                    [Option, { value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.Home);

        const options = getOptions();

        // We should be on the first non-disabled option
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to use the Home key to go to the last listbox option if that is the only non-disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.Home);

        const options = getOptions();
        assertActiveOption(options[3]);
      })
    );

    it(
      "should have no active listbox option upon Home key press, when there are no non-disabled listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.Home);

        assertNoActiveOption();
      })
    );
  });

  describe("`PageUp` key", () => {
    it(
      "should be possible to use the PageUp key to go to the first listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "Option A"],
                    [Option, { value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        const options = getOptions();

        // We should be on the last option
        assertActiveOption(options[2]);

        // We should be able to go to the first option
        await press(Keys.PageUp);
        assertActiveOption(options[0]);
      })
    );

    it(
      "should be possible to use the PageUp key to go to the first non disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { value: "c" }, "Option C"],
                    [Option, { value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.PageUp);

        const options = getOptions();

        // We should be on the first non-disabled option
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to use the PageUp key to go to the last listbox option if that is the only non-disabled listbox option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.PageUp);

        const options = getOptions();
        assertActiveOption(options[3]);
      })
    );

    it(
      "should have no active listbox option upon PageUp key press, when there are no non-disabled listbox options",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { disabled: true, value: "a" }, "Option A"],
                    [Option, { disabled: true, value: "b" }, "Option B"],
                    [Option, { disabled: true, value: "c" }, "Option C"],
                    [Option, { disabled: true, value: "d" }, "Option D"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        // We opened via click, we don't have an active option
        assertNoActiveOption();

        // We should not be able to go to the end
        await press(Keys.PageUp);

        assertNoActiveOption();
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
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "alice" }, "alice"],
                    [Option, { value: "bob" }, "bob"],
                    [Option, { value: "charlie" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Open listbox
        await click(getTrigger());

        const options = getOptions();

        // We should be able to go to the second option
        await type(word("bob"));
        assertActiveOption(options[1]);

        // We should be able to go to the first option
        await type(word("alice"));
        assertActiveOption(options[0]);

        // We should be able to go to the last option
        await type(word("charlie"));
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to type a partial of a word",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "alice" }, "alice"],
                    [Option, { value: "bob" }, "bob"],
                    [Option, { value: "charlie" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        const options = getOptions();

        // We should be on the last option
        assertActiveOption(options[2]);

        // We should be able to go to the second option
        await type(word("bo"));
        assertActiveOption(options[1]);

        // We should be able to go to the first option
        await type(word("ali"));
        assertActiveOption(options[0]);

        // We should be able to go to the last option
        await type(word("char"));
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to type words with spaces",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "a" }, "value a"],
                    [Option, { value: "b" }, "value b"],
                    [Option, { value: "c" }, "value c"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        const options = getOptions();

        // We should be on the last option
        assertActiveOption(options[2]);

        // We should be able to go to the second option
        await type(word("value b"));
        assertActiveOption(options[1]);

        // We should be able to go to the first option
        await type(word("value a"));
        assertActiveOption(options[0]);

        // We should be able to go to the last option
        await type(word("value c"));
        assertActiveOption(options[2]);
      })
    );

    it(
      "should not be possible to search for a disabled option",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "alice" }, "alice"],
                    [Option, { disabled: true, value: "bob" }, "bob"],
                    [Option, { value: "charlie" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        const options = getOptions();

        // We should be on the last option
        assertActiveOption(options[2]);

        // We should not be able to go to the disabled option
        await type(word("bo"));

        // We should still be on the last option
        assertActiveOption(options[2]);
      })
    );

    it(
      "should be possible to search for a word (case insensitive)",
      suppressConsoleLogs(async () => {
        render(TestRenderer, {
          allProps: [
            [
              Root,
              { value: undefined, onChange: console.log },
              [
                [Trigger, {}, "Root"],
                [
                  Options,
                  {},
                  [
                    [Option, { value: "alice" }, "alice"],
                    [Option, { value: "bob" }, "bob"],
                    [Option, { value: "charlie" }, "charlie"],
                  ],
                ],
              ],
            ],
          ],
        });

        // Focus the button
        getTrigger()?.focus();

        // Open listbox
        await press(Keys.ArrowUp);

        const options = getOptions();

        // We should be on the last option
        assertActiveOption(options[2]);

        // Search for bob in a different casing
        await type(word("BO"));

        // We should be on `bob`
        assertActiveOption(options[1]);
      })
    );
  });
});

describe("Mouse interactions", () => {
  it(
    "should focus the Trigger when we click the Label",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Label, {}, "Label"],
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Ensure the button is not focused yet
      assertActiveElement(document.body);

      // Focus the label
      await click(getLabel());

      // Ensure that the actual button is focused instead
      assertActiveElement(getTrigger());
    })
  );

  it(
    "should not focus the Trigger when we right click the Label",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Label, {}, "Label"],
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Ensure the button is not focused yet
      assertActiveElement(document.body);

      // Focus the label
      await click(getLabel(), MouseButton.Right);

      // Ensure that the body is still active
      assertActiveElement(document.body);
    })
  );

  it(
    "should be possible to open the listbox on click",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Open listbox
      await click(getTrigger());

      // Verify it is visible
      assertTrigger({ state: RootState.Visible });
      assertRoot({
        state: RootState.Visible,
        attributes: { id: "headlessui-options-2" },
      });
      assertActiveElement(getRoot());
      assertTriggerLinkedWithRoot();

      // Verify we have listbox options
      const options = getOptions();
      expect(options).toHaveLength(3);
      options.forEach((option) => assertOption(option));
    })
  );

  it(
    "should not be possible to open the listbox on right click",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Try to open the listbox
      await click(getTrigger(), MouseButton.Right);

      // Verify it is still closed
      assertTrigger({ state: RootState.InvisibleUnmounted });
    })
  );

  it(
    "should not be possible to open the listbox on click when the button is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log, disabled: true },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Try to open the listbox
      await click(getTrigger());

      // Verify it is still closed
      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });
    })
  );

  it(
    "should be possible to open the listbox on click, and focus the selected option",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: "b", onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      assertTrigger({
        state: RootState.InvisibleUnmounted,
        attributes: { id: "headlessui-root-trigger-1" },
      });
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Open listbox
      await click(getTrigger());

      // Verify it is visible
      assertTrigger({ state: RootState.Visible });
      assertRoot({
        state: RootState.Visible,
        attributes: { id: "headlessui-options-2" },
      });
      assertActiveElement(getRoot());
      assertTriggerLinkedWithRoot();

      // Verify we have listbox options
      const options = getOptions();
      expect(options).toHaveLength(3);
      options.forEach((option, i) =>
        assertOption(option, { selected: i === 1 })
      );

      // Verify that the second listbox option is active (because it is already selected)
      assertActiveOption(options[1]);
    })
  );

  it(
    "should be possible to close a listbox on click",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      // Verify it is visible
      assertTrigger({ state: RootState.Visible });

      // Click to close
      await click(getTrigger());

      // Verify it is closed
      assertTrigger({ state: RootState.InvisibleUnmounted });
      assertRoot({ state: RootState.InvisibleUnmounted });
    })
  );

  it(
    "should be a no-op when we click outside of a closed listbox",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Verify that the window is closed
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Click something that is not related to the listbox
      await click(document.body);

      // Should still be closed
      assertRoot({ state: RootState.InvisibleUnmounted });
    })
  );

  it(
    "should be possible to click outside of the listbox which should close the listbox",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());
      assertRoot({ state: RootState.Visible });
      assertActiveElement(getRoot());

      // Click something that is not related to the listbox
      await click(document.body);

      // Should be closed now
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Verify the button is focused again
      assertActiveElement(getTrigger());
    })
  );

  it(
    "should be possible to click outside of the listbox on another listbox button which should close the current listbox and open the new listbox",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Div,
            {},
            [
              [
                Root,
                { value: undefined, onChange: console.log },
                [
                  [Trigger, {}, "Root"],
                  [
                    Options,
                    {},
                    [
                      [Option, { value: "a" }, "Option A"],
                      [Option, { value: "b" }, "Option B"],
                      [Option, { value: "c" }, "Option C"],
                    ],
                  ],
                ],
              ],
              [
                Root,
                { value: undefined, onChange: console.log },
                [
                  [Trigger, {}, "Root"],
                  [
                    Options,
                    {},
                    [
                      [Option, { value: "a" }, "Option A"],
                      [Option, { value: "b" }, "Option B"],
                      [Option, { value: "c" }, "Option C"],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      });

      const [button1, button2] = getTriggers();

      // Click the first listbox button
      await click(button1);
      expect(getRoots()).toHaveLength(1); // Only 1 listbox should be visible

      // Ensure the open listbox is linked to the first button
      assertTriggerLinkedWithRoot(button1, getRoot());

      // Click the second listbox button
      await click(button2);

      expect(getRoots()).toHaveLength(1); // Only 1 listbox should be visible

      // Ensure the open listbox is linked to the second button
      assertTriggerLinkedWithRoot(button2, getRoot());
    })
  );

  it(
    "should be possible to click outside of the listbox which should close the listbox (even if we press the listbox button)",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());
      assertRoot({ state: RootState.Visible });
      assertActiveElement(getRoot());

      // Click the listbox button again
      await click(getTrigger());

      // Should be closed now
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Verify the button is focused again
      assertActiveElement(getTrigger());
    })
  );

  // TODO: This test looks like it's for React-specific behavior (for some reason)
  it.skip(
    "should be possible to click outside of the listbox, on an element which is within a focusable element, which closes the listbox",
    suppressConsoleLogs(async () => {
      const focusFn = jest.fn();
      render(TestRenderer, {
        allProps: [
          [
            Div,
            {},
            [
              [
                Root,
                { value: undefined, onChange: console.log },
                [
                  [Trigger, { onFocus: focusFn }, "Root"],
                  [
                    Options,
                    {},
                    [
                      [Option, { value: "a" }, "Option A"],
                      [Option, { value: "b" }, "Option B"],
                      [Option, { value: "c" }, "Option C"],
                    ],
                  ],
                ],
              ],
              [Button, { id: "btn" }, [[Span, {}, "Next"]]],
            ],
          ],
        ],
      });

      // Click the listbox button
      await click(getTrigger());

      // Ensure the listbox is open
      assertRoot({ state: RootState.Visible });

      // Click the span inside the button
      await click(getByText("Next"));

      // Ensure the listbox is closed
      assertRoot({ state: RootState.InvisibleUnmounted });

      // Ensure the outside button is focused
      assertActiveElement(document.getElementById("btn"));

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1);
    })
  );

  it(
    "should be possible to hover an option and make it active",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      const options = getOptions();
      // We should be able to go to the second option
      await mouseMove(options[1]);
      assertActiveOption(options[1]);

      // We should be able to go to the first option
      await mouseMove(options[0]);
      assertActiveOption(options[0]);

      // We should be able to go to the last option
      await mouseMove(options[2]);
      assertActiveOption(options[2]);
    })
  );

  it(
    "should make a listbox option active when you move the mouse over it",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      const options = getOptions();
      // We should be able to go to the second option
      await mouseMove(options[1]);
      assertActiveOption(options[1]);
    })
  );

  it(
    "should be a no-op when we move the mouse and the listbox option is already active",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      const options = getOptions();

      // We should be able to go to the second option
      await mouseMove(options[1]);
      assertActiveOption(options[1]);

      await mouseMove(options[1]);

      // Nothing should be changed
      assertActiveOption(options[1]);
    })
  );

  it(
    "should be a no-op when we move the mouse and the listbox option is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { disabled: true, value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      const options = getOptions();

      await mouseMove(options[1]);
      assertNoActiveOption();
    })
  );

  it(
    "should not be possible to hover an option that is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { disabled: true, value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      const options = getOptions();

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1]);

      // We should not have an active option now
      assertNoActiveOption();
    })
  );

  it(
    "should be possible to mouse leave an option and make it inactive",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      const options = getOptions();

      // We should be able to go to the second option
      await mouseMove(options[1]);
      assertActiveOption(options[1]);

      await mouseLeave(options[1]);
      assertNoActiveOption();

      // We should be able to go to the first option
      await mouseMove(options[0]);
      assertActiveOption(options[0]);

      await mouseLeave(options[0]);
      assertNoActiveOption();

      // We should be able to go to the last option
      await mouseMove(options[2]);
      assertActiveOption(options[2]);

      await mouseLeave(options[2]);
      assertNoActiveOption();
    })
  );

  it(
    "should be possible to mouse leave a disabled option and be a no-op",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { disabled: true, value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());

      const options = getOptions();

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1]);
      assertNoActiveOption();

      await mouseLeave(options[1]);
      assertNoActiveOption();
    })
  );

  it(
    "should be possible to click a listbox option, which closes the listbox",
    suppressConsoleLogs(async () => {
      const handleChange = jest.fn();

      render(TestRenderer, {
        allProps: [
          [
            ManagedRoot,
            {
              value: undefined,
              onChange: (e: CustomEvent) => handleChange(e.detail),
            },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());
      assertRoot({ state: RootState.Visible });
      assertActiveElement(getRoot());

      const options = getOptions();

      // We should be able to click the first option
      await click(options[1]);
      assertRoot({ state: RootState.InvisibleUnmounted });
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith("b");

      // Verify the button is focused again
      assertActiveElement(getTrigger());

      // Open listbox again
      await click(getTrigger());

      // Verify the active option is the previously selected one
      assertActiveOption(getOptions()[1]);
    })
  );

  it(
    "should be possible to click a disabled listbox option, which is a no-op",
    suppressConsoleLogs(async () => {
      const handleChange = jest.fn();

      render(TestRenderer, {
        allProps: [
          [
            ManagedRoot,
            {
              value: undefined,
              onChange: (e: CustomEvent) => handleChange(e.detail),
            },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { disabled: true, value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());
      assertRoot({ state: RootState.Visible });
      assertActiveElement(getRoot());

      const options = getOptions();

      // We should be able to click the first option
      await click(options[1]);
      assertRoot({ state: RootState.Visible });
      assertActiveElement(getRoot());
      expect(handleChange).toHaveBeenCalledTimes(0);

      // Close the listbox
      await click(getTrigger());

      // Open listbox again
      await click(getTrigger());

      // Verify the active option is non existing
      assertNoActiveOption();
    })
  );

  it(
    "should be possible focus a listbox option, so that it becomes active",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());
      assertRoot({ state: RootState.Visible });
      assertActiveElement(getRoot());

      const options = getOptions();

      // Verify that nothing is active yet
      assertNoActiveOption();

      // We should be able to focus the first option
      await focus(options[1]);
      assertActiveOption(options[1]);
    })
  );

  it(
    "should not be possible to focus a listbox option which is disabled",
    suppressConsoleLogs(async () => {
      render(TestRenderer, {
        allProps: [
          [
            Root,
            { value: undefined, onChange: console.log },
            [
              [Trigger, {}, "Root"],
              [
                Options,
                {},
                [
                  [Option, { value: "a" }, "Option A"],
                  [Option, { disabled: true, value: "b" }, "Option B"],
                  [Option, { value: "c" }, "Option C"],
                ],
              ],
            ],
          ],
        ],
      });

      // Open listbox
      await click(getTrigger());
      assertRoot({ state: RootState.Visible });
      assertActiveElement(getRoot());

      const options = getOptions();

      // We should not be able to focus the first option
      await focus(options[1]);
      assertNoActiveOption();
    })
  );
});
