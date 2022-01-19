import { assertHidden, assertNever, assertVisible } from ".";

export function getTrigger(): HTMLElement | null {
  return document.querySelector(
    'button,[role="button"],[id^="headlessui-dropdown-trigger-"]'
  );
}

export function getTriggers(): HTMLElement[] {
  return Array.from(document.querySelectorAll('button,[role="button"]'));
}

export function getDropdown(): HTMLElement | null {
  return document.querySelector('[role="dropdown"]');
}

export function getDropdowns(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="dropdown"]'));
}

export function getItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="dropdown-item"]'));
}

// ---

export enum DropdownState {
  /** The dropdown is visible to the user. */
  Visible,

  /** The dropdown is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The dropdown is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

export function assertTrigger(
  options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DropdownState;
  },
  trigger = getTrigger()
) {
  try {
    if (trigger === null) return expect(trigger).not.toBe(null);

    // Ensure dropdown button have these properties
    expect(trigger).toHaveAttribute("id");
    expect(trigger).toHaveAttribute("aria-haspopup");

    switch (options.state) {
      case DropdownState.Visible:
        expect(trigger).toHaveAttribute("aria-controls");
        expect(trigger).toHaveAttribute("aria-expanded", "true");
        break;

      case DropdownState.InvisibleHidden:
        expect(trigger).toHaveAttribute("aria-controls");
        if (trigger.hasAttribute("disabled")) {
          expect(trigger).not.toHaveAttribute("aria-expanded");
        } else {
          expect(trigger).toHaveAttribute("aria-expanded", "false");
        }
        break;

      case DropdownState.InvisibleUnmounted:
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

    // Ensure dropdown button has the following attributes
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

export function assertTriggerLinkedWithDropdown(
  trigger = getTrigger(),
  dropdown = getDropdown()
) {
  try {
    if (trigger === null) return expect(trigger).not.toBe(null);
    if (dropdown === null) return expect(dropdown).not.toBe(null);

    // Ensure link between button & dropdown is correct
    expect(trigger).toHaveAttribute(
      "aria-controls",
      dropdown.getAttribute("id")
    );
    expect(dropdown).toHaveAttribute(
      "aria-labelledby",
      trigger.getAttribute("id")
    );
  } catch (err: any) {
    Error.captureStackTrace(err, assertTriggerLinkedWithDropdown);
    throw err;
  }
}

export function assertDropdownLinkedWithItem(
  item: HTMLElement | null,
  dropdown = getDropdown()
) {
  try {
    if (dropdown === null) return expect(dropdown).not.toBe(null);
    if (item === null) return expect(item).not.toBe(null);

    // Ensure link between dropdown & dropdown item is correct
    expect(dropdown).toHaveAttribute(
      "aria-activedescendant",
      item.getAttribute("id")
    );
  } catch (err: any) {
    Error.captureStackTrace(err, assertDropdownLinkedWithItem);
    throw err;
  }
}

export function assertNoActiveItem(dropdown = getDropdown()) {
  try {
    if (dropdown === null) return expect(dropdown).not.toBe(null);

    // Ensure we don't have an active dropdown
    expect(dropdown).not.toHaveAttribute("aria-activedescendant");
  } catch (err: any) {
    Error.captureStackTrace(err, assertNoActiveItem);
    throw err;
  }
}

export function assertDropdown(
  options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DropdownState;
  },
  dropdown = getDropdown()
) {
  try {
    switch (options.state) {
      case DropdownState.InvisibleHidden:
        if (dropdown === null) return expect(dropdown).not.toBe(null);

        assertHidden(dropdown);

        expect(dropdown).toHaveAttribute("aria-labelledby");
        expect(dropdown).toHaveAttribute("role", "dropdown");

        if (options.textContent)
          expect(dropdown).toHaveTextContent(options.textContent);

        for (const attributeName in options.attributes) {
          expect(dropdown).toHaveAttribute(
            attributeName,
            options.attributes[attributeName]
          );
        }
        break;

      case DropdownState.Visible:
        if (dropdown === null) return expect(dropdown).not.toBe(null);

        assertVisible(dropdown);

        expect(dropdown).toHaveAttribute("aria-labelledby");
        expect(dropdown).toHaveAttribute("role", "dropdown");

        if (options.textContent)
          expect(dropdown).toHaveTextContent(options.textContent);

        for (const attributeName in options.attributes) {
          expect(dropdown).toHaveAttribute(
            attributeName,
            options.attributes[attributeName]
          );
        }
        break;

      case DropdownState.InvisibleUnmounted:
        expect(dropdown).toBe(null);
        break;

      default:
        assertNever(options.state);
    }
  } catch (err: any) {
    Error.captureStackTrace(err, assertDropdown);
    throw err;
  }
}

export function assertItem(
  item: HTMLElement | null,
  options?: { tag?: string; attributes?: Record<string, string | null> }
) {
  try {
    if (item === null) return expect(item).not.toBe(null);

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    expect(item).toHaveAttribute("id");

    // Check that we have the correct values for certain attributes
    expect(item).toHaveAttribute("role", "dropdown-item");
    if (!item.getAttribute("aria-disabled"))
      expect(item).toHaveAttribute("tabindex", "-1");

    // Ensure dropdown button has the following attributes
    if (options) {
      for (const attributeName in options.attributes) {
        expect(item).toHaveAttribute(
          attributeName,
          options.attributes[attributeName]
        );
      }

      if (options.tag) {
        expect(item.tagName.toLowerCase()).toBe(options.tag);
      }
    }
  } catch (err: any) {
    Error.captureStackTrace(err, assertItem);
    throw err;
  }
}

// ---
