import { parse } from "@std/yaml/parse";
import Ajv, { Plugin } from "ajv";
// https://github.com/ajv-validator/ajv-formats/issues/85
import ajvFormats, { type FormatsPluginOptions } from "ajv-formats";
const addFormats = ajvFormats as unknown as Plugin<FormatsPluginOptions>;

const validate = <T>(
  data: unknown,
  schema: Ajv.Schema,
  options?: Ajv.Options,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const ajv = new Ajv.default(options);
    addFormats(ajv);

    const validate = ajv.compile<T>(schema);

    if (!validate(data)) return reject(validate.errors);

    return resolve(data);
  });
};

export const validateYaml = <T>(
  content: string,
  schema: Ajv.Schema,
  options?: Ajv.Options,
): Promise<T> => {
  return validate(parse(content), schema, options);
};

export const validateJson = <T>(
  content: unknown,
  schema: Ajv.Schema,
  options?: Ajv.Options,
): Promise<T> => {
  return validate(content, schema, options);
};
