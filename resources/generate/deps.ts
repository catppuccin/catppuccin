export { parse as parseYaml } from "https://deno.land/std@0.172.0/encoding/yaml.ts";
export { renderToStaticMarkup } from "https://esm.sh/react-dom@18.2.0/server";

import Ajv from "npm:ajv@8.12.0";
import React from "https://esm.sh/react@18.2.0";
import * as path from "https://deno.land/std@0.172.0/path/mod.ts";
import prettier from "https://esm.sh/prettier@2.8.3";
import parserHTML from "https://esm.sh/prettier@2.8.3/parser-html";
import schema from "../ports.schema.json" assert { type: "json" };

export { Ajv, parserHTML, path, prettier, React, schema };

// markdown utils
// export {unified} from "https://esm.sh/unified@10.1.2"
// import remarkParse from "https://esm.sh/remark-parse@10.0.1"
// import remarkRehype from "https://esm.sh/remark-rehype@10.1.0"
// import rehypeSanitize from "https://esm.sh/rehype-sanitize@5.0.1"
// import rehypeStringify from "https://esm.sh/rehype-stringify@9.0.3"
// export {remarkParse, remarkRehype, rehypeSanitize, rehypeStringify}
