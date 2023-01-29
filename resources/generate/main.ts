#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import { Ajv, parseYaml, path, schema } from "./deps.ts";
import type { Categories, Port, Ports, Showcases } from "./types.d.ts";

const root = new URL(".", import.meta.url).pathname;

type Metadata = {
  categories: Categories;
  ports: Ports;
  showcases: Showcases;
};

const ajv = new Ajv();
const validate = ajv.compile<Metadata>(schema);

const portsYaml = Deno.readTextFileSync(path.join(root, "../ports.yml"));
const data = parseYaml(portsYaml) as Metadata;

// throw error if the YAML is invalid
if (!validate(data)) {
  console.log(validate.errors);
  Deno.exit(1);
}

export type MappedPort = Port & { html_url: string };

const categorized = Object.entries(data.ports).reduce((acc, [slug, port]) => {
  !acc[port.category] && (acc[port.category] = []);
  acc[port.category].push({
    html_url: `https://github.com/catppuccin/${slug}`,
    ...port,
  });
  acc[port.category].sort((a, b) => a.name.localeCompare(b.name));
  return acc;
}, {} as Record<string, MappedPort[]>);

const portListData = data.categories.map((category) => {
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

const portContent = portListData.map((data) => {
  return `<details open>
<summary>${data.meta.emoji} ${data.meta.name}</summary>

${data.ports.map((port) => `- [${port.name}](${port.html_url})`).join("\n")}

</details>`;
}).join("\n");

const showcaseContent = data.showcases.map((showcase) => {
  return `- [${showcase.title}](${showcase.link}) - ${showcase.description}`;
}).join("\n");

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
