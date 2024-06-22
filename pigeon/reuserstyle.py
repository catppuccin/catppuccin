import re
from pathlib import Path
from typing import List

import yaml
import requests
import json

from pigeon.caveman import DumpyMcDumpface

USERNAME_PAT = re.compile(r"^https://github.com/([^/]+)")
USERSTYLES_CATEGORY = {
    "key": "userstyle",
    "name": "Userstyles",
    "description": "Modified CSS files that can be applied to a website.",
    "emoji": "🖌️",
}


def extract_username(github_url: str) -> str:
    return next(USERNAME_PAT.finditer(github_url)).group(1)


def make_repo(name: str, port: dict) -> dict:
    repo = {
        "name": name,
        "url": f"https://github.com/catppuccin/userstyles/tree/main/styles/{name}",
        "current-maintainers": [
            extract_username(m["url"]) for m in port.get("current-maintainers", [])
        ],
    }

    if port.get("past-maintainers"):
        repo["past-maintainers"] = [
            extract_username(m["url"]) for m in port["past-maintainers"]
        ]

    return repo


def make_userstyle(key: str, userstyle: dict) -> List[dict]:
    userstyles = []

    # TODO: handle the readme.app_link field
    #
    # userstyle names can be a list for the alias behaviour (I, hammy, regret this design decision)
    # so the key has to be populated by lowercasing the name array, otherwise we just use the name
    names = (
        userstyle["name"]
        if isinstance(userstyle["name"], list)
        else [userstyle["name"]]
    )

    for name in names:
        userstyles.append(
            {
                "name": name,
                "key": key,
                "repository": key,
                "categories": userstyle["categories"] + ["userstyle"],
                **{
                    k: v
                    for k, v in userstyle.items()
                    if k
                    not in {
                        "current-maintainers",
                        "past-maintainers",
                        "name",
                        "categories",
                        "readme",
                    }
                },
            }
        )

    return userstyles


userstyles_url = "https://raw.githubusercontent.com/catppuccin/userstyles/main/scripts/userstyles.yml"
userstyles_yml = yaml.safe_load(requests.get(userstyles_url).text)
userstyles_yml |= {"categories": [USERSTYLES_CATEGORY]}

# we have to rehydrate collaborator's usernames (this is known as a "yaml anchor moment")
collaborators = [
    {"username": extract_username(collaborator["url"]), **collaborator}
    for collaborator in userstyles_yml["collaborators"]
]

# new object: repositories
# several userstyles can share the same "repository" (which is actually a directory)
repositories = [
    make_repo(key, port) for key, port in userstyles_yml["userstyles"].items()
]

# userstyles have their maintainers replaced by a repository reference
userstyles = [
    make_userstyle(key, port) for key, port in userstyles_yml["userstyles"].items()
]
# flatten the list of lists because of logic above to handle multiple names
userstyles = [userstyle for sublist in userstyles for userstyle in sublist]

userstyles_data = {
    "collaborators": collaborators,
    "categories": userstyles_yml["categories"],
    "repositories": repositories,
    "ports": userstyles,
}

with Path("pigeon/userstyles.yml").open("w", encoding="utf-8") as f:
    yaml.dump(
        userstyles_data,
        stream=f,
        Dumper=DumpyMcDumpface,
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False,
    )
