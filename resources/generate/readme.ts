import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
import { PortsSchema, UserstylesSchema } from "../types/mod";
import {
  determineUrl,
  getCategories,
  MergedPort,
  mergePortsAndUserstyles,
} from "./data";

const updateReadme = (
  readme: string,
  newContent: string,
  options: {
    section?: string;
    preamble?: string;
    markers?: {
      start: string;
      end: string;
    };
  } = {}
): string => {
  const {
    section = "",
    preamble = "<!-- the following section is auto-generated, do not edit -->",
    markers = {
      start: `<!-- AUTOGEN${
        section !== "" ? `:${section.toUpperCase()}` : ""
      } START -->`,
      end: `<!-- AUTOGEN${
        section !== "" ? `:${section.toUpperCase()}` : ""
      } END -->`,
    },
  } = options;
  const wrapped = [markers.start, preamble, newContent, markers.end].join("\n");

  Object.values(markers).map((m) => {
    if (!readme.includes(m)) {
      throw new Error(`Marker ${m} not found in README.md`);
    }
  });

  const pre = readme.split(markers.start)[0];
  const end = readme.split(markers.end)[1];
  return pre + wrapped + end;
};

export const generateReadme = async (
  portsData: PortsSchema.PortsSchema,
  userstylesData: UserstylesSchema.UserstylesSchema
) => {
  const mergedPorts = mergePortsAndUserstyles(portsData, userstylesData);

  const categorized = Object.entries(mergedPorts).reduce(
    (acc, [slug, port]) => {
      acc[port.categories[0]] ??= [];
      const url = determineUrl(slug, port);
      acc[port.categories[0]].push(
        {
          ...port,
          url,
        },
        ...Object.values(port.supports ?? {}).map(({ name }) => {
          return {
            ...port,
            url,
            name,
          };
        })
      );
      acc[port.categories[0]].sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    },
    {} as Record<string, Omit<MergedPort, "link">[]>
  );

  const portListData = (await getCategories()).map((category) => {
    return {
      meta: category,
      ports: categorized[category.key] ?? [],
    };
  });

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
    .map((showcase) => {
      return `- [${showcase.title}](${showcase.link}) - ${showcase.description}`;
    })
    .join("\n");

  const root = path.dirname(fileURLToPath(import.meta.url));
  const readmePath = path.join(root, "../../README.md");
  let readmeContent = await fs.readFile(readmePath, "utf-8");
  try {
    readmeContent = updateReadme(readmeContent, portContent, {
      section: "portlist",
    });
    readmeContent = updateReadme(readmeContent, showcaseContent, {
      section: "showcase",
    });
  } catch (e) {
    console.log("Failed to update the README:", e);
  } finally {
    await fs.writeFile(readmePath, readmeContent);
  }
};
