#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import {
  Ajv,
  parseYaml,
  path,
  React,
  rehypeParse,
  rehypeRemark,
  remarkStringify,
  renderToStaticMarkup,
  schema,
  unified,
} from "./deps.ts";
import type { Categories, Port, Ports, Showcases } from "./types.d.ts";
import { PortList } from "./ports.tsx";
import { ShowcaseList } from "./showcase.tsx";

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

const { categories, ports, showcases } = data;

const categorized = Object.values(ports).reduce((acc, port: Port) => {
  !acc[port.category] && (acc[port.category] = []);
  acc[port.category].push(port);
  acc[port.category].sort((a, b) => a.name.localeCompare(b.name));
  return acc;
}, {} as Record<string, Port[]>);

const portListData = categories.map((category) => {
  return {
    meta: category,
    ports: categorized[category.key],
  };
});

const updateReadme = async ({
  readme,
  section,
  newContent,
}: {
  readme: string;
  section: string;
  newContent: React.ReactElement;
}): Promise<string> => {
  const preamble =
    "<!-- the following section is auto-generated, do not edit -->";
  const markers = {
    start: `<!-- AUTOGEN:${section.toUpperCase()} START -->`,
    end: `<!-- AUTOGEN:${section.toUpperCase()} END -->`,
  };

  const markdown = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify, {
      bullet: "-",
    })
    .process(renderToStaticMarkup(newContent));

  const wrapped = markers.start + "\n" + preamble + "\n" + markdown + "\n" +
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

try {
  readmeContent = await updateReadme({
    readme: readmeContent,
    section: "portlist",
    newContent: <PortList data={portListData} />,
  });
  readmeContent = await updateReadme({
    readme: readmeContent,
    section: "showcase",
    newContent: <ShowcaseList data={showcases} />,
  });
} catch (e) {
  console.log("Failed to update the README:", e);
} finally {
  Deno.writeTextFileSync(readmePath, readmeContent);
}
