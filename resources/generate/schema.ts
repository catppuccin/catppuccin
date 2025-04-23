import { parse } from "yaml";
import Ajv, { type Schema, Options, Plugin } from "ajv";
// https://github.com/ajv-validator/ajv-formats/issues/85
import ajvFormats, { type FormatsPluginOptions } from "ajv-formats";
const addFormats = ajvFormats as unknown as Plugin<FormatsPluginOptions>;

const validate = <T>(
  data: unknown,
  schema: Schema,
  options?: Options
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const ajv = new Ajv(options);
    addFormats(ajv);

    const validate = ajv.compile<T>(schema);

    if (!validate(data)) return reject(validate.errors);

    return resolve(data);
  });
};

export const validateYaml = <T>(
  content: string,
  schema: Schema,
  options?: Options
): Promise<T> => {
  return validate(parse(content), schema, options);
};

export const validateJson = <T>(
  content: unknown,
  schema: Schema,
  options?: Options
): Promise<T> => {
  return validate(content, schema, options);
};
