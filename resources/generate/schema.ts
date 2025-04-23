import { load } from "js-yaml";
import Ajv, { type Schema, Options } from "ajv";
import addFormats from "ajv-formats";

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
  return validate(load(content), schema, options);
};

export const validateJson = <T>(
  content: unknown,
  schema: Schema,
  options?: Options
): Promise<T> => {
  return validate(content, schema, options);
};
