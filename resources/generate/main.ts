#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net

import { join } from "std/path/mod.ts";
import {
  portsSchema,
  updateReadme,
  userstylesSchema,
  userstylesYaml,
  validateYaml,
} from "@/deps.ts";
import type { PortsSchema, UserStylesSchema } from "@/types/mod.ts";

const root = new URL(".", import.meta.url).pathname;

const portsYaml = Deno.readTextFileSync(join(root, "../ports.yml"));

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

const ports = Object.assign(portsData.ports, userstylesData.userstyles);

export type MappedPort = (PortsSchema.Port | UserStylesSchema.Userstyle) & {
  html_url: string;
};

const categorized = Object.entries(ports)
  .reduce(
    (acc, [slug, port]) => {
      // create a new array if it doesn't exist
      acc[port.category] ??= [];

      acc[port.category].push({
        html_url: `https://github.com/catppuccin/${
          port.readme ? `userstyles/tree/main/styles/${slug}` : slug
        }`,
        ...port,
        name: [port.name].flat().join(", "),
      });
      acc[port.category].sort((a, b) =>
        [a.name].flat()[0].localeCompare([b.name].flat()[0])
      );
      return acc;
    },
    {} as Record<string, MappedPort[]>,
  );

const portListData = portsData.categories.map((category) => {
  return {
    meta: category,
    ports: categorized[category.key],
  };
});

const readmePath = join(root, "../../README.md");
let readmeContent = Deno.readTextFileSync(readmePath);

const portContent = portListData
  .map((data) => {
    return `<details open>
<summary>${data.meta.emoji} ${data.meta.name}</summary>

${data.ports.map((port) => `- [${port.name}](${port.html_url})`).join("\n")}

</details>`;
  })
  .join("\n");

const showcaseContent = portsData.showcases
  ?.map((showcase) => {
    return `- [${showcase.title}](${showcase.link}) - ${showcase.description}`;
  })
  .join("\n");

try {
  readmeContent = updateReadme({
    readme: readmeContent,
    section: "portlist",
    newContent: portContent,
  });
  showcaseContent && (
    readmeContent = updateReadme({
      readme: readmeContent,
      section: "showcase",
      newContent: showcaseContent,
    })
  );
} catch (e) {
  console.log("Failed to update the README:", e);
} finally {
  Deno.writeTextFileSync(readmePath, readmeContent);
}
