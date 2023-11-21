export * as PortsSchema from "@/types/ports.d.ts";
export * as UserStylesSchema from "catppuccin-userstyles/scripts/types/userstyles.d.ts";

import { Entries } from "https://esm.sh/type-fest@4.8.1";
declare global {
  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>;
  }
}
