import { generateReadme } from "./readme";
import { getCategories, getPorts, getUserstyles } from "./data";
import { generatePorcelain } from "./porcelain";

const main = async () => {
  const portsData = await getPorts();
  const userstylesData = await getUserstyles();
  const categoriesData = await getCategories();
  await generatePorcelain(portsData, categoriesData, userstylesData);
  await generateReadme(portsData, userstylesData);
};

await main();
