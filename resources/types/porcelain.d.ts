import { MergeExclusive } from "type-fest";
import {
  CategoriesSchema,
  PortsSchema,
  UserstylesSchema,
} from "@/types/mod.ts";

export type MergedPort = MergeExclusive<
  PortsSchema.Port,
  UserstylesSchema.Userstyle
>;

export type Collaborator = {
  username: string;
  url: string;
};

export type Repository = {
  name: string;
  url: string;
  "current-maintainers": Collaborator[];
  "past-maintainers"?: Collaborator[];
};

export type Port = {
  name: PortsSchema.Name;
  categories: CategoriesSchema.CategoryDefinitions;
  platform: PortsSchema.Platform;
  color: PortsSchema.Color;
  icon?: PortsSchema.Icon;
  key: string;
  repository: Repository;
};
