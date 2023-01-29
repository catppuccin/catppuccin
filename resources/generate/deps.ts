export { parse as parseYaml } from "https://deno.land/std@0.172.0/encoding/yaml.ts";
export { renderToStaticMarkup } from "https://esm.sh/react-dom@18.2.0/server";

import Ajv from "https://esm.sh/ajv@8.12.0";
import React from "https://esm.sh/react@18.2.0";
import * as path from "https://deno.land/std@0.172.0/path/mod.ts";
import schema from "../ports.schema.json" assert { type: "json" };

export { Ajv, path, React, schema };

// markdown utils
export { unified } from "https://esm.sh/unified@10.1.2";
import rehypeParse from "https://esm.sh/rehype-parse@8.0.4";
import rehypeRemark from "https://esm.sh/rehype-remark@9.1.2";
import remarkStringify from "https://esm.sh/remark-stringify@10.0.2";
export { rehypeParse, rehypeRemark, remarkStringify };
