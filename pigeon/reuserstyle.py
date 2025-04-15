from pathlib import Path
from typing import List

import yaml
import requests

from pigeon.caveman import USERSTYLES_CATEGORY, DumpyMcDumpface


def github_profile_link(username: str) -> str:
    return f"https://github.com/{username}"


def make_repo(name: str, port: dict) -> dict:
    repo = {
        "name": name,
        "url": f"https://github.com/catppuccin/userstyles/tree/main/styles/{name}",
        "current-maintainers": [m for m in port.get("current-maintainers", [])],
    }

    if port.get("past-maintainers"):
        repo["past-maintainers"] = [m for m in port["past-maintainers"]]

    return repo


def make_userstyle(key: str, userstyle: dict) -> List[dict]:
    base_userstyle = {
        "name": userstyle["name"],
        "key": key,
        "repository": key,
        "categories": userstyle["categories"] + ["userstyle"],
        "platform": ["agnostic"],
        **{
            k: v
            for k, v in userstyle.items()
            if k
            not in {
                "current-maintainers",
                "past-maintainers",
                "categories",
                "note",
                "link",
                "supports",
            }
        },
    }

    supported_websites = [
        {**base_userstyle, "name": v["name"], "key": k}
        for k, v in userstyle.get("supports", {}).items()
    ]

    return [base_userstyle, *supported_websites]


userstyles_url = "https://raw.githubusercontent.com/catppuccin/userstyles/main/scripts/userstyles.yml"
userstyles_yml = yaml.safe_load(requests.get(userstyles_url).text)
userstyles_yml |= {"categories": [USERSTYLES_CATEGORY]}

# we have to rehydrate collaborator's usernames (this is known as a "yaml anchor moment")
collaborators = [
    {"username": collaborator, "url": github_profile_link(collaborator)}
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

# flatten the list of lists because of logic above to handle multiple entries from one userstyle
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
