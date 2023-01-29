import { React } from "./deps.ts";
import { Showcases } from "./types.d.ts";

export const ShowcaseList = ({
  data,
}: {
  data: Showcases;
}): React.ReactElement => {
  return (
    <ul>
      {data.map((item) => (
        <li key={item.title}>
          <a href={item.link}>{item.title}</a> -{" "}
          <span dangerouslySetInnerHTML={{ __html: item.description }} />
        </li>
      ))}
    </ul>
  );
};
