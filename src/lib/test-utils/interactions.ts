import { fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";

export const Keys: Record<string, Partial<KeyboardEvent>> = {
  Space: { key: " ", keyCode: 32, charCode: 32 },
  Enter: { key: "Enter", keyCode: 13, charCode: 13 },
  Escape: { key: "Escape", keyCode: 27, charCode: 27 },
  Backspace: { key: "Backspace", keyCode: 8 },

  ArrowLeft: { key: "ArrowLeft", keyCode: 37 },
  ArrowUp: { key: "ArrowUp", keyCode: 38 },
  ArrowRight: { key: "ArrowRight", keyCode: 39 },
  ArrowDown: { key: "ArrowDown", keyCode: 40 },

  Home: { key: "Home", keyCode: 36 },
  End: { key: "End", keyCode: 35 },

  PageUp: { key: "PageUp", keyCode: 33 },
  PageDown: { key: "PageDown", keyCode: 34 },

  Tab: { key: "Tab", keyCode: 9, charCode: 9 },
};

export function shift(event: Partial<KeyboardEvent>) {
  return { ...event, shiftKey: true };
}

export function word(input: string): Partial<KeyboardEvent>[] {
  return input.split("").map((key) => ({ key }));
}

const Default = Symbol();
const Ignore = Symbol();

const cancellations: Record<
  string | typeof Default,
  Record<string, Set<string>>
> = {
  [Default]: {
    keydown: new Set(["keypress"]),
    keypress: new Set([]),
    keyup: new Set([]),
  },
  [Keys.Enter.key!]: {
    keydown: new Set(["keypress", "click"]),
    keypress: new Set(["click"]),
    keyup: new Set([]),
  },
  [Keys.Space.key!]: {
    keydown: new Set(["keypress", "click"]),
    keypress: new Set([]),
    keyup: new Set(["click"]),
  },
  [Keys.Tab.key!]: {
    keydown: new Set(["keypress", "blur", "focus"]),
    keypress: new Set([]),
    keyup: new Set([]),
  },
};

const order: Record<
  string | typeof Default,
  ((
    element: Element,
    event: Partial<KeyboardEvent | MouseEvent>
  ) => Promise<boolean | symbol> | typeof Ignore | Promise<Element>)[]
> = {
  [Default]: [
    async function keydown(element, event) {
      return await fireEvent.keyDown(element, event);
    },
    async function keypress(element, event) {
      return await fireEvent.keyPress(element, event);
    },
    async function keyup(element, event) {
      return await fireEvent.keyUp(element, event);
    },
  ],
  [Keys.Enter.key!]: [
    async function keydown(element, event) {
      return await fireEvent.keyDown(element, event);
    },
    async function keypress(element, event) {
      return await fireEvent.keyPress(element, event);
    },
    async function click(element, event) {
      if (element instanceof HTMLButtonElement)
        return await fireEvent.click(element, event);
      return Ignore;
    },
    async function keyup(element, event) {
      return await fireEvent.keyUp(element, event);
    },
  ],
  [Keys.Space.key!]: [
    async function keydown(element, event) {
      return await fireEvent.keyDown(element, event);
    },
    async function keypress(element, event) {
      return await fireEvent.keyPress(element, event);
    },
    async function keyup(element, event) {
      return await fireEvent.keyUp(element, event);
    },
    async function click(element, event) {
      if (element instanceof HTMLButtonElement)
        return await fireEvent.click(element, event);
      return Ignore;
    },
  ],
  [Keys.Tab.key!]: [
    async function keydown(element, event) {
      return await fireEvent.keyDown(element, event);
    },
    async function blurAndfocus(_element, event) {
      return focusNext(event);
    },
    async function keyup(element, event) {
      return await fireEvent.keyUp(element, event);
    },
  ],
};

export async function type(
  events: Partial<KeyboardEvent>[],
  element = document.activeElement
) {
  jest.useFakeTimers();

  try {
    if (element === null) return expect(element).not.toBe(null);

    for (const event of events) {
      const skip = new Set();
      const actions = order[event.key!] ?? order[Default as any];
      for (const action of actions) {
        const checks = action.name.split("And");
        if (checks.some((check) => skip.has(check))) continue;

        // @ts-expect-error TODO: unique symbol vs symbol?
        const result: boolean | typeof Ignore | Element = await action(
          element,
          {
            type: action.name,
            charCode:
              event.key?.length === 1 ? event.key?.charCodeAt(0) : undefined,
            ...event,
          }
        );
        if (result === Ignore) continue;
        if (result instanceof Element) {
          element = result;
        }

        const cancelled = !result;
        if (cancelled) {
          const skippablesForKey =
            cancellations[event.key!] ?? cancellations[Default as any];
          const skippables = skippablesForKey?.[action.name] ?? new Set();

          for (const skippable of skippables) skip.add(skippable);
        }
      }
    }

    // We don't want to actually wait in our tests, so let's advance
    jest.runAllTimers();

    await tick();
  } catch (err: any) {
    Error.captureStackTrace(err, type);
    throw err;
  } finally {
    jest.useRealTimers();
  }
}

export async function press(
  event: Partial<KeyboardEvent>,
  element = document.activeElement
) {
  return type([event], element);
}

export enum MouseButton {
  Left = 0,
  Right = 2,
}

export async function click(
  element: Document | Element | Window | null,
  button = MouseButton.Left
) {
  try {
    if (element === null) return expect(element).not.toBe(null);

    const options = { button };

    if (button === MouseButton.Left) {
      // Cancel in pointerDown cancels mouseDown, mouseUp
      const cancelled = !(await fireEvent.pointerDown(element, options));
      if (!cancelled) {
        await fireEvent.mouseDown(element, options);
      }

      // Ensure to trigger a `focus` event if the element is focusable, or within a focusable element
      let next: HTMLElement | null = element as HTMLElement | null;
      while (next !== null) {
        if (next.matches(focusableSelector)) {
          next.focus();
          break;
        }
        next = next.parentElement;
      }

      await fireEvent.pointerUp(element, options);
      if (!cancelled) {
        await fireEvent.mouseUp(element, options);
      }
      await fireEvent.click(element, options);
    } else if (button === MouseButton.Right) {
      // Cancel in pointerDown cancels mouseDown, mouseUp
      const cancelled = !(await fireEvent.pointerDown(element, options));
      if (!cancelled) {
        await fireEvent.mouseDown(element, options);
      }

      // Only in Firefox:
      await fireEvent.pointerUp(element, options);
      if (!cancelled) {
        await fireEvent.mouseUp(element, options);
      }
    }
  } catch (err: any) {
    Error.captureStackTrace(err, click);
    throw err;
  }
}

export async function focus(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null);

    await fireEvent.focus(element);

    await tick();
  } catch (err: any) {
    Error.captureStackTrace(err, focus);
    throw err;
  }
}
export async function mouseEnter(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null);

    await fireEvent.pointerOver(element);
    await fireEvent.pointerEnter(element);
    await fireEvent.mouseOver(element);

    await tick();
  } catch (err: any) {
    Error.captureStackTrace(err, mouseEnter);
    throw err;
  }
}

export async function mouseMove(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null);

    await fireEvent.pointerMove(element);
    await fireEvent.mouseMove(element);

    await tick();
  } catch (err: any) {
    Error.captureStackTrace(err, mouseMove);
    throw err;
  }
}

export async function mouseLeave(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null);

    await fireEvent.pointerOut(element);
    await fireEvent.pointerLeave(element);
    await fireEvent.mouseOut(element);
    await fireEvent.mouseLeave(element);

    await tick();
  } catch (err: any) {
    Error.captureStackTrace(err, mouseLeave);
    throw err;
  }
}

// ---

function focusNext(event: Partial<KeyboardEvent>) {
  const direction = event.shiftKey ? -1 : +1;
  const focusableElements = getFocusableElements();
  const total = focusableElements.length;

  function innerFocusNext(offset = 0): Element {
    const currentIdx = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );
    const next = focusableElements[
      (currentIdx + total + direction + offset) % total
    ] as HTMLElement;

    if (next) next?.focus({ preventScroll: true });

    if (next !== document.activeElement)
      return innerFocusNext(offset + direction);
    return next;
  }

  return innerFocusNext();
}

// Credit:
//  - https://stackoverflow.com/a/30753870
const focusableSelector = [
  "[contentEditable=true]",
  "[tabindex]",
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "iframe",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
]
  .map(
    process.env.NODE_ENV === "test"
      ? // TODO: Remove this once JSDOM fixes the issue where an element that is
        // "hidden" can be the document.activeElement, because this is not possible
        // in real browsers.
        (selector) =>
          `${selector}:not([tabindex='-1']):not([style*='display: none'])`
      : (selector) => `${selector}:not([tabindex='-1'])`
  )
  .join(",");

function getFocusableElements(container = document.body) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(focusableSelector));
}
