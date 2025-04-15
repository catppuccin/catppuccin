from pathlib import Path

import yaml

from pigeon.caveman import USERSTYLES_CATEGORY, DumpyMcDumpface

with Path("resources/categories.yml").open("r", encoding="utf-8") as f:
    categories = yaml.safe_load(f)

categories += [USERSTYLES_CATEGORY]

with Path("pigeon/categories.yml").open("w", encoding="utf-8") as f:
    yaml.dump(
        categories,
        stream=f,
        Dumper=DumpyMcDumpface,
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False,
    )
