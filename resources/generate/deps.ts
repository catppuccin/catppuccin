export { parse as parseYaml } from "https://deno.land/std@0.172.0/encoding/yaml.ts";

import Ajv from "npm:ajv@8.12.0";
import * as path from "https://deno.land/std@0.172.0/path/mod.ts";
import portsSchema from "../ports.schema.json" assert { type: "json" };
// TODO: change url when merge
const userstylesYaml = await fetch(
  "https://raw.githubusercontent.com/catppuccin-rfc/userstyles/main/src/userstyles.yml",
);
import userstylesSchema from "https://raw.githubusercontent.com/catppuccin-rfc/userstyles/main/src/userstyles.schema.json" assert { type: "json" };
import type { Userstyle, Userstyles } from "https://raw.githubusercontent.com/catppuccin/userstyles/main/src/generate/types.d.ts";

export { Ajv, path, portsSchema, userstylesSchema, userstylesYaml, Userstyle, Userstyles };
