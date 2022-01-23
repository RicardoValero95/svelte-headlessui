type Orientation = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";

export interface KeyboardNavigationOptions {
  orientation?: Orientation;
  direction?: Direction;
  loop?: boolean;
}
