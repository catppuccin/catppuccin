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
import { MergeExclusive } from "type-fest";

type MergedPort = MergeExclusive<
  PortsSchema.Port,
  UserstylesSchema.Userstyle
>;

const isArchivedPort = (
  port: MergedPort | PortsSchema.ArchivedPort,
): port is PortsSchema.ArchivedPort => {
  return ("reason" in port);
};

const isUserstyle = (
  port: MergedPort | PortsSchema.ArchivedPort,
): port is UserstylesSchema.Userstyle => {
  return port.categories.includes("userstyle");
};

const ghProfileUrl = (username: string): string =>
  `https://github.com/${username}`;

const ghRepositoryUrl = (port: string): string =>
  `https://github.com/catppuccin/${port}`;

const ghUserstyleUrl = (userstyle: string): string =>
  `https://github.com/catppuccin/userstyles/tree/main/styles/${userstyle}`;

const inflateCollaborators = (
  collaborators:
    | PortsSchema.AllCollaborators
    | PortsSchema.CurrentMaintainers
    | UserstylesSchema.AllCollaborators
    | UserstylesSchema.CurrentMaintainers,
): PorcelainSchema.Collaborators => {
  return Array.from(new Set(collaborators)).map((collaborator) => ({
    username: collaborator,
    url: ghProfileUrl(collaborator),
  }));
};

const inflateRepository = (
  key: string,
  port: MergedPort | PortsSchema.ArchivedPort,
): PorcelainSchema.Repository => {
  if (isArchivedPort(port)) {
    return {
      name: key,
      url: ghRepositoryUrl(key),
      "current-maintainers": [],
      "past-maintainers": [],
    };
  }

  const name = port.alias ?? key;
  let url = ghRepositoryUrl(key);
  if (port.url) {
    url = port.url;
  } else if (port.alias) {
    url = ghRepositoryUrl(port.alias);
  } else if (isUserstyle(port)) {
    url = ghUserstyleUrl(key);
  }
  const currentMaintainers = port.alias
    ? [
      ...port["current-maintainers"],
      ...portsData.ports[port.alias]["current-maintainers"],
    ]
    : port["current-maintainers"];
  const pastMaintainers = port.alias
    ? [
      ...(port["past-maintainers"] ?? []),
      ...(portsData.ports[port.alias]["past-maintainers"] ?? []),
    ]
    : port["past-maintainers"] ?? [];

  return {
    name,
    url,
    "current-maintainers": inflateCollaborators(currentMaintainers),
    "past-maintainers": inflateCollaborators(pastMaintainers),
  };
};

// TODO: implement test to make sure CategoryDefinitions & PorcelainSchema.Categories are the same
const inflateCategories = (
  categories: PortsSchema.Categories,
): PorcelainSchema.Categories =>
  categories
    .map((category) =>
      categoriesData.find((categoryDefinition) =>
        category === categoryDefinition.key
      )
    ) as PorcelainSchema.Categories;

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

// Shim userstyles category data, maybe move to platform later on
categoriesData.push({
  key: "userstyle",
  name: "Userstyles",
  description: "Modified CSS files that can be applied to a website.",
  emoji: "🖌️",
});

const mergedPorts: Record<string, MergedPort> = {
  ...portsData.ports,
  ...Object.fromEntries(
    Object.entries(userstylesData.userstyles ?? {}).map((
      [slug, userstyle],
    ) => [slug, {
      ...userstyle,
      // Shim "userstyle" category to all userstyles
      categories: [
        ...userstyle.categories,
        "userstyle",
      ] as UserstylesSchema.Categories,
    }]),
  ),
};

const ports = Object.entries(mergedPorts).flatMap(([key, port]) => {
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
  if (port.links) {
    porcelainPort.links = port.links;
  }

  const supportedUserstyles = Object.entries(port.supports ?? {}).map((
    [k, v],
  ) => ({
    ...porcelainPort,
    name: v.name,
    key: k,
  }));

  return [porcelainPort, ...supportedUserstyles];
});

const collaborators = inflateCollaborators([
  ...portsData.collaborators,
  ...(userstylesData.collaborators ?? []),
]);

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
