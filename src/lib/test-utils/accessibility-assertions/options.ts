import { assertHidden, assertNever, assertVisible } from ".";

export function getLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-root-label"]');
}

export function getTrigger(): HTMLElement | null {
  return document.querySelector(
    'button,[role="button"],[id^="headlessui-root-trigger-"]'
  );
}

export function getTriggers(): HTMLElement[] {
  return Array.from(document.querySelectorAll('button,[role="button"]'));
}

export function getRoot(): HTMLElement | null {
  return document.querySelector('[role="options"]');
}

export function getRoots(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="options"]'));
}

export function getOptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="option"]'));
}

// ---

export enum RootState {
  /** The listbox is visible to the user. */
  Visible,

  /** The listbox is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The listbox is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

export function assertRoot(
  options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: RootState;
    orientation?: "horizontal" | "vertical";
  },
  listbox = getRoot()
) {
  const { orientation = "vertical" } = options;

  try {
    switch (options.state) {
      case RootState.InvisibleHidden:
        if (listbox === null) return expect(listbox).not.toBe(null);

        assertHidden(listbox);

        expect(listbox).toHaveAttribute("aria-labelledby");
        expect(listbox).toHaveAttribute("aria-orientation", orientation);
        expect(listbox).toHaveAttribute("role", "options");

        if (options.textContent)
          expect(listbox).toHaveTextContent(options.textContent);

        for (const attributeName in options.attributes) {
          expect(listbox).toHaveAttribute(
            attributeName,
            options.attributes[attributeName]
          );
        }
        break;

      case RootState.Visible:
        if (listbox === null) return expect(listbox).not.toBe(null);

        assertVisible(listbox);

        expect(listbox).toHaveAttribute("aria-labelledby");
        expect(listbox).toHaveAttribute("aria-orientation", orientation);
        expect(listbox).toHaveAttribute("role", "options");

        if (options.textContent)
          expect(listbox).toHaveTextContent(options.textContent);

        for (const attributeName in options.attributes) {
          expect(listbox).toHaveAttribute(
            attributeName,
            options.attributes[attributeName]
          );
        }
        break;

      case RootState.InvisibleUnmounted:
        expect(listbox).toBe(null);
        break;

      default:
        assertNever(options.state);
    }
  } catch (err: any) {
    Error.captureStackTrace(err, assertRoot);
    throw err;
  }
}

export function assertTrigger(
  options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: RootState;
  },
  trigger = getTrigger()
) {
  try {
    if (trigger === null) return expect(trigger).not.toBe(null);

    // Ensure menu button have these properties
    expect(trigger).toHaveAttribute("id");
    expect(trigger).toHaveAttribute("aria-haspopup");

    switch (options.state) {
      case RootState.Visible:
        expect(trigger).toHaveAttribute("aria-controls");
        expect(trigger).toHaveAttribute("aria-expanded", "true");
        break;

      case RootState.InvisibleHidden:
        expect(trigger).toHaveAttribute("aria-controls");
        if (trigger.hasAttribute("disabled")) {
          expect(trigger).not.toHaveAttribute("aria-expanded");
        } else {
          expect(trigger).toHaveAttribute("aria-expanded", "false");
        }
        break;

      case RootState.InvisibleUnmounted:
        expect(trigger).not.toHaveAttribute("aria-controls");
        if (trigger.hasAttribute("disabled")) {
          expect(trigger).not.toHaveAttribute("aria-expanded");
        } else {
          expect(trigger).toHaveAttribute("aria-expanded", "false");
        }
        break;

      default:
        assertNever(options.state);
    }

    if (options.textContent) {
      expect(trigger).toHaveTextContent(options.textContent);
    }

    // Ensure menu button has the following attributes
    for (const attributeName in options.attributes) {
      expect(trigger).toHaveAttribute(
        attributeName,
        options.attributes[attributeName]
      );
    }
  } catch (err: any) {
    Error.captureStackTrace(err, assertTrigger);
    throw err;
  }
}

export function assertLabel(
  options: {
    attributes?: Record<string, string | null>;
    tag?: string;
    textContent?: string;
  },
  label = getLabel()
) {
  try {
    if (label === null) return expect(label).not.toBe(null);

    // Ensure menu button have these properties
    expect(label).toHaveAttribute("id");

    if (options.textContent) {
      expect(label).toHaveTextContent(options.textContent);
    }

    if (options.tag) {
      expect(label.tagName.toLowerCase()).toBe(options.tag);
    }

    // Ensure menu button has the following attributes
    for (const attributeName in options.attributes) {
      expect(label).toHaveAttribute(
        attributeName,
        options.attributes[attributeName]
      );
    }
  } catch (err: any) {
    Error.captureStackTrace(err, assertLabel);
    throw err;
  }
}

export function assertTriggerLinkedWithRoot(
  trigger = getTrigger(),
  listbox = getRoot()
) {
  try {
    if (trigger === null) return expect(trigger).not.toBe(null);
    if (listbox === null) return expect(listbox).not.toBe(null);

    // Ensure link between button & listbox is correct
    expect(trigger).toHaveAttribute(
      "aria-controls",
      listbox.getAttribute("id")
    );
    expect(listbox).toHaveAttribute(
      "aria-labelledby",
      trigger.getAttribute("id")
    );
  } catch (err: any) {
    Error.captureStackTrace(err, assertTriggerLinkedWithRoot);
    throw err;
  }
}

export function assertLabelLinkedWithRoot(
  label = getLabel(),
  listbox = getRoot()
) {
  try {
    if (label === null) return expect(label).not.toBe(null);
    if (listbox === null) return expect(listbox).not.toBe(null);

    expect(listbox).toHaveAttribute(
      "aria-labelledby",
      label.getAttribute("id")
    );
  } catch (err: any) {
    Error.captureStackTrace(err, assertLabelLinkedWithRoot);
    throw err;
  }
}

export function assertTriggerLinkedWithLabel(
  trigger = getTrigger(),
  label = getLabel()
) {
  try {
    if (trigger === null) return expect(trigger).not.toBe(null);
    if (label === null) return expect(label).not.toBe(null);

    // Ensure link between button & label is correct
    expect(trigger).toHaveAttribute(
      "aria-labelledby",
      `${label.id} ${trigger.id}`
    );
  } catch (err: any) {
    Error.captureStackTrace(err, assertTriggerLinkedWithLabel);
    throw err;
  }
}

export function assertActiveOption(
  item: HTMLElement | null,
  listbox = getRoot()
) {
  try {
    if (listbox === null) return expect(listbox).not.toBe(null);
    if (item === null) return expect(item).not.toBe(null);

    // Ensure link between listbox & listbox item is correct
    expect(listbox).toHaveAttribute(
      "aria-activedescendant",
      item.getAttribute("id")
    );
  } catch (err: any) {
    Error.captureStackTrace(err, assertActiveOption);
    throw err;
  }
}

export function assertNoActiveOption(listbox = getRoot()) {
  try {
    if (listbox === null) return expect(listbox).not.toBe(null);

    // Ensure we don't have an active listbox
    expect(listbox).not.toHaveAttribute("aria-activedescendant");
  } catch (err: any) {
    Error.captureStackTrace(err, assertNoActiveOption);
    throw err;
  }
}

export function assertNoSelectedOption(items = getOptions()) {
  try {
    for (const item of items) expect(item).not.toHaveAttribute("aria-selected");
  } catch (err: any) {
    Error.captureStackTrace(err, assertNoSelectedOption);
    throw err;
  }
}

export function assertOption(
  item: HTMLElement | null,
  options?: {
    tag?: string;
    attributes?: Record<string, string | null>;
    selected?: boolean;
  }
) {
  try {
    if (item === null) return expect(item).not.toBe(null);

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    expect(item).toHaveAttribute("id");

    // Check that we have the correct values for certain attributes
    expect(item).toHaveAttribute("role", "option");
    if (!item.getAttribute("aria-disabled"))
      expect(item).toHaveAttribute("tabindex", "-1");

    // Ensure listbox button has the following attributes
    if (!options) return;

    for (const attributeName in options.attributes) {
      expect(item).toHaveAttribute(
        attributeName,
        options.attributes[attributeName]
      );
    }

    if (options.tag) {
      expect(item.tagName.toLowerCase()).toBe(options.tag);
    }

    if (options.selected != null) {
      switch (options.selected) {
        case true:
          return expect(item).toHaveAttribute("aria-selected", "true");

        case false:
          return expect(item).not.toHaveAttribute("aria-selected");

        default:
          assertNever(options.selected);
      }
    }
  } catch (err: any) {
    Error.captureStackTrace(err, assertOption);
    throw err;
  }
}
