<script lang="ts" context="module">
  import type { useId } from "$lib/hooks/use-id";
  import { createContextStore } from "$lib/internal/context-store";
  import { match } from "$lib/utils/match";
  import { RenderStrategy } from "$lib/utils/Render.svelte";

  export enum TreeStates {
    Visible = "visible",
    Hidden = "hidden",
  }

  type ID = ReturnType<typeof useId>;

  export interface NestingContextValues {
    children: { id: ID; state: TreeStates }[];
    register: (id: ID) => () => void;
    unregister: (id: ID, strategy?: RenderStrategy) => void;
  }

  export interface TransitionContextValues {
    show: boolean;
    appear: boolean;
    // This is not part of base Headless UI, but we need it because TransitionRoot does not render.
    // In base Headless UI, for a component with unmount=false, the initial state for the Child is
    // still "visible". It still works, because the parent still is hidden and has display: none
    // In our version the parent renders nothing, so we need to send down the correct initial state
    // ourselves.
    initialShow: boolean;
  }

  const COMPONENT_NAME = "TransitionRoot";

  export const [getTransitionContext, setTransitionContext] =
    createContextStore<TransitionContextValues>();

  export function hasTransitionContext() {
    return getTransitionContext() !== undefined;
  }
  export function useTransitionContext(childName: string) {
    const context = getTransitionContext();
    if (context) return context;
    throw new Error(
      `<${childName} /> is missing a parent <${COMPONENT_NAME} /> component.`
    );
  }
  export const [getParentNestingContext, setParentNestingContext] =
    createContextStore<NestingContextValues>();

  export function useParentNestingContext(childName: string) {
    let context = getParentNestingContext();
    if (context) return context;
    throw new Error(
      `<${childName} /> is missing a parent <${COMPONENT_NAME} /> component.`
    );
  }

  export function hasChildren(
    bag:
      | NestingContextValues["children"]
      | { children: NestingContextValues["children"] }
  ): boolean {
    if ("children" in bag) return hasChildren(bag.children);
    return bag.filter(({ state }) => state === TreeStates.Visible).length > 0;
  }

  export function useNesting(done?: () => void) {
    let transitionableChildren: NestingContextValues["children"] = [];

    function unregister(childId: ID, strategy = RenderStrategy.Hidden) {
      let idx = transitionableChildren.findIndex(({ id }) => id === childId);
      if (idx === -1) return;

      let hadChildren = hasChildren(transitionableChildren);

      match(strategy, {
        [RenderStrategy.Unmount]() {
          transitionableChildren.splice(idx, 1);
        },
        [RenderStrategy.Hidden]() {
          transitionableChildren[idx].state = TreeStates.Hidden;
        },
      });

      if (hadChildren && !hasChildren(transitionableChildren)) {
        done?.();
      }
    }

    function register(childId: ID) {
      let child = transitionableChildren.find(({ id }) => id === childId);
      if (!child) {
        transitionableChildren.push({
          id: childId,
          state: TreeStates.Visible,
        });
      } else if (child.state !== TreeStates.Visible) {
        child.state = TreeStates.Visible;
      }

      return () => unregister(childId, RenderStrategy.Unmount);
    }

    return {
      children: transitionableChildren,
      register,
      unregister,
    };
  }
</script>
