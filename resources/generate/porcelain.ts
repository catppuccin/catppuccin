#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net

import { join } from "@std/path";
import { validateYaml } from "catppuccin-deno-lib";
import portsSchema from "@/ports.schema.json" with { type: "json" };
import categoriesSchema from "@/categories.schema.json" with { type: "json" };
import portsPorcelainSchema from "@/ports.porcelain.schema.json" with {
  type: "json",
};
import userstylesSchema from "catppuccin-userstyles/scripts/userstyles.schema.json" with {
  type: "json",
};
import type {
  CategoriesSchema,
  PorcelainSchema,
  PortsSchema,
  UserstylesSchema,
} from "@/types/mod.ts";
import { stringify } from "@std/yaml";
import Ajv from "ajv";
import ajvFormats from "ajv-formats";
import { CategoryDefinitions } from "@/types/categories.d.ts";

const profileUrl = (username: string): string =>
  `https://github.com/${username}`;

const orgUrl = (port: string): string =>
  `https://github.com/catppuccin/${port}`;

const inflateCollaborators = (
  collaborators:
    | PortsSchema.AllCollaborators
    | PortsSchema.CurrentMaintainers
    | UserstylesSchema.AllCollaborators
    | UserstylesSchema.CurrentMaintainers,
): PorcelainSchema.Collaborator[] => {
  return collaborators.map((collaborator) => ({
    username: collaborator,
    url: profileUrl(collaborator),
  }));
};

const inflateRepository = (
  name: string,
  port:
    | PortsSchema.Port
    | PortsSchema.ArchivedPort
    | PorcelainSchema.MergedPort,
): PorcelainSchema.Repository => {
  return {
    name,
    url: "url" in port && port.url ? port.url : orgUrl(name),
    "current-maintainers": "current-maintainers" in port
      ? inflateCollaborators(port["current-maintainers"])
      : [],
    "past-maintainers": "past-maintainers" in port && port["past-maintainers"]
      ? inflateCollaborators(port["past-maintainers"])
      : [],
  };
};

const inflateCategories = (
  categories: PortsSchema.Categories,
): CategoryDefinitions =>
  categories
    .map((category) =>
      categoriesData.find((categoryDefinition) =>
        category === categoryDefinition.key
      )
    )
    .filter((categoryDefinition) => categoryDefinition !== undefined);
const root = new URL(".", import.meta.url).pathname;

const portsData = await validateYaml<PortsSchema.PortsSchema>(
  await Deno.readTextFile(join(root, "../ports.yml")),
  portsSchema,
  { schemas: [categoriesSchema] },
);
const userstylesData = await validateYaml<
  UserstylesSchema.UserstylesSchema
>(
  await fetch(
    "https://raw.githubusercontent.com/catppuccin/userstyles/refs/heads/main/scripts/userstyles.yml",
  ).then((res) => res.text()),
  userstylesSchema,
  { schemas: [categoriesSchema] },
);
const categoriesData = await validateYaml<
  CategoriesSchema.CategoryDefinitions
>(
  await Deno.readTextFile(join(root, "../categories.yml")),
  categoriesSchema,
);

// Shim userstyles category, maybe move to platform later on
categoriesData.push({
  key: "userstyle",
  name: "Userstyles",
  description: "Modified CSS files that can be applied to a website.",
  emoji: "🖌️",
});

const mergedPorts: Record<string, PorcelainSchema.MergedPort> = {
  ...Object.fromEntries(
    Object.entries(portsData.ports).map(([slug, port]) => [slug, { ...port }]),
  ),
  ...Object.fromEntries(
    Object.entries(userstylesData.userstyles ?? {}).map((
      [slug, userstyle],
    ) => [slug, {
      ...userstyle,
      // Pretend "userstyle" is a `Category`
      categories: [
        ...userstyle.categories,
        "userstyle",
      ] as UserstylesSchema.Categories,
    }]),
  ),
};

const ports = Object.entries(mergedPorts).map(([key, port]) => {
  const porcelainPort: PorcelainSchema.Port = {
    name: port.name,
    categories: inflateCategories(port.categories),
    platform: port.platform ?? ["agnostic"],
    color: port.color,
    key,
    repository: inflateRepository(key, port),
  };

  if (port.icon) {
    porcelainPort.icon = port.icon;
  }

  return porcelainPort;
});

const collaborators = Array.from(
  new Set([
    ...portsData.collaborators,
    ...(userstylesData.collaborators ?? []),
  ]),
).map((username) => ({
  username,
  url: profileUrl(username),
}));

const archivedPorts = Object.entries(portsData.archived).map((
  [key, port],
) => ({
  ...port,
  key,
  categories: inflateCategories(port.categories),
  repository: inflateRepository(key, port),
}));

const porcelain = {
  ports,
  collaborators,
  categories: categoriesData,
  showcases: portsData.showcases,
  "archived-ports": archivedPorts,
};

// TODO: Move into deno-lib, probably
const ajv = new Ajv.default();
ajvFormats.default(ajv);
const validate = ajv.compile(portsPorcelainSchema);
const valid = validate(porcelain);

if (!valid) {
  console.error("Validation errors:", validate.errors);
  throw new Error("Generated porcelain data does not match schema");
}

// TODO: Remove YAML output
const output = stringify(porcelain, {
  sortKeys: false,
  useAnchors: false,
  lineWidth: -1,
});
await Deno.writeTextFile(join(root, "../ports.porcelain.yml"), output, {});
await Deno.writeTextFile(
  join(root, "../ports.porcelain.json"),
  JSON.stringify(porcelain),
);
