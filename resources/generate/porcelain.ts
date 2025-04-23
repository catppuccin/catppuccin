import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
import portsPorcelainSchema from "../ports.porcelain.schema.json" with {
  type: "json",
};
import type {
  CategoriesSchema,
  PorcelainSchema,
  PortsSchema,
  UserstylesSchema,
} from "../types/mod.ts";
import {
  determineUrl,
  ghProfileUrl,
  ghRepositoryUrl,
  isArchivedPort,
  MergedPort,
  mergePortsAndUserstyles,
} from "./data.ts";
import { validateJson } from "./schema.ts";

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

export const generatePorcelain = async (
  portsData: PortsSchema.PortsSchema,
  categoriesData: CategoriesSchema.CategoryDefinitions,
  userstylesData: UserstylesSchema.UserstylesSchema,
) => {
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
    const url = determineUrl(key, port);
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

  const inflateCategories = (
    categories: PortsSchema.Categories,
  ): PorcelainSchema.Categories =>
    categories
      .map((category) =>
        categoriesData.find((categoryDefinition) =>
          category === categoryDefinition.key
        )
      ) as PorcelainSchema.Categories;

  const mergedPorts = mergePortsAndUserstyles(portsData, userstylesData);

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
    if (port.upstreamed) {
      porcelainPort.upstreamed = port.upstreamed;
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

  try {
    await validateJson<PorcelainSchema.PortsPorcelainSchema>(porcelain, portsPorcelainSchema);
  } catch (err) {
    console.error("Validation errors:", err);
    throw new Error("Generated porcelain data does not match schema");
  }

  const root = path.dirname(fileURLToPath(import.meta.url));
  await fs.writeFile(
    path.join(root, "../ports.porcelain.json"),
    JSON.stringify(porcelain)
  );
};
