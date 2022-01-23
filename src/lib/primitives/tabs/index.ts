import type { KeyboardNavigationOptions } from "../focus";

type Activation = "automatic" | "manual";

interface TabsProps extends KeyboardNavigationOptions {
  activation?: Activation;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}
