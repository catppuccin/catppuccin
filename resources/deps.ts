import portsSchema from "@/ports.schema.json" assert { type: "json" };
import userstylesSchema from "catppuccin-userstyles/scripts/userstyles.schema.json" assert {
  type: "json",
};
export { portsSchema, userstylesSchema };

export const userstylesYaml = await fetch(
  "https://raw.githubusercontent.com/catppuccin/userstyles/main/scripts/userstyles.yml",
).then((res) => res.text());

export { updateReadme } from "catppuccin-userstyles/scripts/generate/utils.ts";
export { validateYaml } from "catppuccin-userstyles/scripts/utils.ts";
