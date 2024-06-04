#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net

import { join } from "std/path/mod.ts";
import { updateReadme, validateYaml } from "catppuccin-deno-lib";
import { MergeExclusive, SetOptional } from "type-fest";

import portsSchema from "@/ports.schema.json" assert { type: "json" };
import userstylesSchema from "catppuccin-userstyles/scripts/userstyles.schema.json" assert {
  type: "json",
};
const userstylesYaml = await fetch(
  "https://raw.githubusercontent.com/catppuccin/userstyles/main/scripts/userstyles.yml",
).then((res) => res.text());

import type { PortsSchema, UserStylesSchema } from "@/types/mod.ts";

const root = new URL(".", import.meta.url).pathname;

const portsYaml = await Deno.readTextFile(join(root, "../ports.yml"));

const [portsData, userstylesData] = await Promise.all([
  await validateYaml<PortsSchema.PortsSchema>(
    portsYaml,
    portsSchema,
  ),
  await validateYaml<UserStylesSchema.UserstylesSchema>(
    userstylesYaml,
    userstylesSchema,
  ),
]);
if (!portsData.ports || !portsData.categories || !userstylesData.userstyles) {
  throw new Error("ports.yml is empty");
}

export type MappedPort =
  & MergeExclusive<PortsSchema.Port, UserStylesSchema.Userstyle>
  & {
    type: "port" | "userstyle";
  };

// label the ports with their type
const ports = {
  ...Object.entries(portsData.ports)
    .reduce((acc, [slug, port]) => {
      acc[slug] = {
        ...port,
        type: "port",
      };
      return acc;
    }, {} as Record<string, MappedPort>),
  ...Object.entries(userstylesData.userstyles)
    .reduce((acc, [slug, userstyle]) => {
      acc[slug] = {
        ...userstyle,
        type: "userstyle",
      };
      return acc;
    }, {} as Record<string, MappedPort>),
};

const portSlugs = Object.entries(ports).map(([slug]) => slug);

const categorized = Object.entries(ports)
  .reduce(
    (acc, [slug, port]) => {
      // create a new array if it doesn't exist
      acc[port.categories[0]] ??= [];

      // validate the alias against an existing port
      if (port.alias && !portSlugs.includes(port.alias)) {
        throw new Error(
          `port \`${slug}\` points to an alias \`${port.alias}\` that doesn't exist`,
        );
      }

      let url = port.url;
      if (!url) {
        switch (port.type) {
          case "port": {
            const repo = port.alias ?? slug;
            url = `https://github.com/catppuccin/${repo}`;
            break;
          }
          case "userstyle": {
            url =
              `https://github.com/catppuccin/userstyles/tree/main/styles/${slug}`;
            break;
          }
        }
      }

      acc[port.categories[0]].push({
        ...port,
        url,
        name: [port.name].flat().join(", "),
      });
      acc[port.categories[0]].sort((a, b) =>
        [a.name].flat()[0].localeCompare([b.name].flat()[0])
      );
      return acc;
    },
    {} as Record<string, SetOptional<MappedPort, "readme" | "platform">[]>,
  );

const portListData = portsData.categories.map((category) => {
  return {
    meta: category,
    ports: categorized[category.key] ?? [],
  };
});

const readmePath = join(root, "../../README.md");
let readmeContent = await Deno.readTextFile(readmePath);

const portContent = portListData
  .filter((data) => data.ports.length !== 0)
  .map((data) => {
    return `<details open>
<summary>${data.meta.emoji} ${data.meta.name}</summary>

${data.ports.map((port) => `- [${port.name}](${port.url})`).join("\n")}

</details>`;
  })
  .join("\n");

const showcaseContent = portsData.showcases
  ?.map((showcase) => {
    return `- [${showcase.title}](${showcase.link}) - ${showcase.description}`;
  })
  .join("\n");

try {
  readmeContent = updateReadme(readmeContent, portContent, {
    section: "portlist",
  });
  showcaseContent && (
    readmeContent = updateReadme(readmeContent, showcaseContent, {
      section: "showcase",
    })
  );
} catch (e) {
  console.log("Failed to update the README:", e);
} finally {
  await Deno.writeTextFile(readmePath, readmeContent);
}
