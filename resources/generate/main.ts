#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net

import { Ajv, parseYaml, path, portsSchema, userstylesSchema, userstylesYaml, Userstyle, Userstyles } from "./deps.ts";
import type { Categories, Port, Ports, Showcases } from "./ports.d.ts";

const root = new URL(".", import.meta.url).pathname;

type PortsMetadata = {
  categories: Categories;
  ports: Ports;
  showcases: Showcases;
};

type UserstylesMetadata = {
  userstyles: Userstyles;
};

const ajv = new Ajv();
const validatePorts = ajv.compile<PortsMetadata>(portsSchema);
const validateUserstyles = ajv.compile<PortsMetadata>(userstylesSchema);

const portsYaml = Deno.readTextFileSync(path.join(root, "../ports.yml"));
const portsData = parseYaml(portsYaml) as PortsMetadata;

const userstylesData = parseYaml(
  await userstylesYaml.text(),
) as UserstylesMetadata;

// throw error if the YAML is invalid
if (!validatePorts(portsData)) {
  console.log(validatePorts.errors);
  Deno.exit(1);
}

if (!validateUserstyles(userstylesData)) {
  console.log(validateUserstyles.errors);
  Deno.exit(1);
}

const ports = Object.assign(portsData.ports, userstylesData.userstyles);

export type MappedPort = (Port | Userstyle) & { html_url: string };

const categorized = Object.entries(ports).reduce((acc, [slug, port]: [string, MappedPort]) => {
  !acc[port.category] && (acc[port.category] = []);
  acc[port.category].push({
    html_url: `https://github.com/catppuccin/${port.readme ? `userstyles/tree/main/styles/${slug}` : slug}`,
    ...port,
    name: [port.name].flat().join(", "),
  });
  acc[port.category].sort((a, b) =>  a.name.localeCompare(b.name));
  return acc;
}, {} as Record<string, MappedPort[]>);

const portListData = portsData.categories.map((category) => {
  return {
    meta: category,
    ports: categorized[category.key],
  };
});

const updateReadme = ({
  readme,
  section,
  newContent,
}: {
  readme: string;
  section: string;
  newContent: string;
}): string => {
  const preamble =
    "<!-- the following section is auto-generated, do not edit -->";
  const markers = {
    start: `<!-- AUTOGEN:${section.toUpperCase()} START -->`,
    end: `<!-- AUTOGEN:${section.toUpperCase()} END -->`,
  };

  const wrapped = markers.start + "\n" + preamble + "\n" + newContent + "\n" +
    markers.end;

  if (
    !(
      readmeContent.includes(markers.start) &&
      readmeContent.includes(markers.end)
    )
  ) {
    throw new Error("Markers not found in README.md");
  }

  const pre = readme.split(markers.start)[0];
  const end = readme.split(markers.end)[1];

  return pre + wrapped + end;
};

const readmePath = path.join(root, "../../README.md");
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
  .map((showcase) => {
    return `- [${showcase.title}](${showcase.link}) - ${showcase.description}`;
  })
  .join("\n");

try {
  readmeContent = updateReadme({
    readme: readmeContent,
    section: "portlist",
    newContent: portContent,
  });
  readmeContent = updateReadme({
    readme: readmeContent,
    section: "showcase",
    newContent: showcaseContent,
  });
} catch (e) {
  console.log("Failed to update the README:", e);
} finally {
  Deno.writeTextFileSync(readmePath, readmeContent);
}
