import { React } from "./deps.ts";
import type { CategoryItem, Port } from "./types.d.ts";

type PortListData = {
  data: {
    meta: CategoryItem;
    ports: Port[];
  }[];
};

export const PortList = ({ data }: PortListData): React.ReactElement => {
  return (
    <>
      {data.map((category) => (
        <details key={category.meta.name} open>
          <summary>
            {category.meta.emoji} {category.meta.name}
          </summary>
          <ul>
            {category.ports.map((port) => (
              <li key={port.name}>
                <a
                  href={`https://github.com/catppuccin/${port.name}`}
                >
                  {port.name}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </>
  );
};
