import { join } from "@std/path";
import { updateReadme } from "catppuccin-deno-lib";
import {
  determineUrl,
  getCategories,
  MergedPort,
  mergePortsAndUserstyles,
} from "@/generate/data.ts";
import { PortsSchema, UserstylesSchema } from "@/types/mod.ts";

export const generateReadme = async (
  portsData: PortsSchema.PortsSchema,
  userstylesData: UserstylesSchema.UserstylesSchema,
) => {
  const mergedPorts = mergePortsAndUserstyles(portsData, userstylesData);

  const categorized = Object.entries(mergedPorts)
    .reduce(
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
          }),
        );
        acc[port.categories[0]].sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      },
      {} as Record<string, Omit<MergedPort, "link">[]>,
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

  const showcaseContent = portsData.showcases.map((showcase) => {
    return `- [${showcase.title}](${showcase.link}) - ${showcase.description}`;
  }).join("\n");

  const root = new URL(".", import.meta.url).pathname;
  const readmePath = join(root, "../../README.md");
  let readmeContent = await Deno.readTextFile(readmePath);
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
    await Deno.writeTextFile(readmePath, readmeContent);
  }
};
