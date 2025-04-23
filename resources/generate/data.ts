import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
import { validateYaml } from "./schema.ts";

import portsSchema from "../ports.schema.json" with { type: "json" };
import categoriesSchema from "../categories.schema.json" with { type: "json" };
import userstylesSchema from "@catppuccin/userstyles/scripts/userstyles.schema.json" with {
  type: "json",
};
import {
  CategoriesSchema,
  PortsSchema,
  UserstylesSchema,
} from "../types/mod.ts";

// Imported from https://github.com/sindresorhus/type-fest/blob/e3234d74aa12d12f209d942a43d30b3f88301916/source/merge-exclusive.d.ts
type Without<FirstType, SecondType> = {[KeyType in Exclude<keyof FirstType, keyof SecondType>]?: never};

export type MergeExclusive<FirstType, SecondType> =
	(FirstType | SecondType) extends object ?
		(Without<FirstType, SecondType> & SecondType) | (Without<SecondType, FirstType> & FirstType) :
		FirstType | SecondType;

export type MergedPort = MergeExclusive<
  PortsSchema.Port,
  UserstylesSchema.Userstyle
>;

const root = path.dirname(fileURLToPath(import.meta.url));

export const ghProfileUrl = (username: string): string =>
  `https://github.com/${username}`;

export const ghRepositoryUrl = (port: string): string =>
  `https://github.com/catppuccin/${port}`;

export const ghUserstyleUrl = (userstyle: string): string =>
  `https://github.com/catppuccin/userstyles/tree/main/styles/${userstyle}`;

export const isArchivedPort = (
  port: MergedPort | PortsSchema.ArchivedPort,
): port is PortsSchema.ArchivedPort => {
  return ("reason" in port);
};

export const isUserstyle = (
  port: MergedPort | PortsSchema.ArchivedPort,
): port is UserstylesSchema.Userstyle => {
  return port.categories.includes("userstyle");
};

export const determineUrl = (
  key: string,
  port: MergedPort,
) => {
  let url = ghRepositoryUrl(key);
  if (port.url) {
    url = port.url;
  } else if (port.alias) {
    url = ghRepositoryUrl(port.alias);
  } else if (isUserstyle(port)) {
    url = ghUserstyleUrl(key);
  }
  return url;
};

export const getPorts = async () => {
  return await validateYaml<PortsSchema.PortsSchema>(
    await fs.readFile(path.join(root, "../ports.yml"), 'utf-8'),
    portsSchema,
    { schemas: [categoriesSchema] },
  );
};

export const getCategories = async () => {
  const categoriesData = await validateYaml<
    CategoriesSchema.CategoryDefinitions
  >(
    await fs.readFile(path.join(root, "../categories.yml"), "utf-8"),
    categoriesSchema
  );
  // Shim userstyles category data, maybe move to platform later on
  categoriesData.push({
    key: "userstyle",
    name: "Userstyles",
    description: "Modified CSS files that can be applied to a website.",
    emoji: "🖌️",
  });
  return categoriesData;
};

export const getUserstyles = async () => {
  return await validateYaml<UserstylesSchema.UserstylesSchema>(
    await fetch(
      "https://raw.githubusercontent.com/catppuccin/userstyles/refs/heads/main/scripts/userstyles.yml",
    ).then((res) => res.text()),
    userstylesSchema,
    { schemas: [categoriesSchema] },
  );
};

export const mergePortsAndUserstyles = (
  portsData: PortsSchema.PortsSchema,
  userstylesData: UserstylesSchema.UserstylesSchema,
): Record<string, MergedPort> => {
  return {
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
};
