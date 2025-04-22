import { generateReadme } from "@/generate/readme.ts";
import { getCategories, getPorts, getUserstyles } from "@/generate/data.ts";
import { generatePorcelain } from "@/generate/porcelain.ts";

const main = async () => {
  const portsData = await getPorts();
  const userstylesData = await getUserstyles();
  const categoriesData = await getCategories();
  await generatePorcelain(portsData, categoriesData, userstylesData);
  await generateReadme(portsData, userstylesData);
};

await main();
