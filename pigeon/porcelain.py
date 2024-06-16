from copy import deepcopy
from pathlib import Path

import requests
import yaml

from pigeon.caveman import DumpyMcDumpface


class Index:
    def __init__(self, data: list, key: str):
        self.index = {item[key]: item for item in data}

    def __getitem__(self, key):
        return deepcopy(self.index[key])


class Indices:
    def __init__(self, data: dict):
        self.collaborators = Index(data["collaborators"], "username")
        self.repositories = Index(data["repositories"], "name")
        self.categories = Index(data["categories"], "key")


def inflate_repo(name: str, indices: Indices) -> dict:
    repo = indices.repositories[name]

    repo["current-maintainers"] = [
        indices.collaborators[maintainer]
        for maintainer in repo.get("current-maintainers", [])
    ]

    repo["past-maintainers"] = [
        indices.collaborators[maintainer]
        for maintainer in repo.get("past-maintainers", [])
    ]

    return repo


def make_port(port: dict, indices: Indices) -> dict:
    return {
        **port,
        "is-userstyle": False,
        "categories": [indices.categories[category] for category in port["categories"]],
        "repository": inflate_repo(port["repository"], indices),
    }


def make_ports(data: dict, indices: Indices) -> list:
    return [make_port(port, indices) for port in data["ports"]]


def make_archived_ports(data: dict, indices: Indices) -> list:
    return [
        {
            **port,
            "categories": [
                indices.categories[category] for category in port["categories"]
            ],
            "repository": inflate_repo(port["repository"], indices),
        }
        for port in data["archived-ports"]
    ]


def userstyles(indices: Indices) -> dict:
    url = "https://raw.githubusercontent.com/catppuccin/userstyles/main/scripts/userstyles.yml"
    data = yaml.safe_load(requests.get(url).text)
    return {
        "userstyles-collaborators": data["collaborators"],
        "userstyles": [
            {
                **userstyle,
                "is-userstyle": True,
                "key": key,
                "categories": [
                    indices.categories[category] for category in userstyle["categories"]
                ],
            }
            for key, userstyle in data["userstyles"].items()
        ],
    }


def main():
    with Path("pigeon/ports.yml").open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    indices = Indices(data)

    porcelain = {
        "ports": make_ports(data, indices),
        "collaborators": data["collaborators"],
        "categories": [
            *data["categories"],
            {
                "key": "userstyle",
                "name": "Userstyles",
                "description": "Modified CSS files that can be applied to a website.",
                "emoji": "🖌️",
            },
        ],
        "showcases": data["showcases"],
        "archived-ports": make_archived_ports(data, indices),
        # "we should just concatenate the entire file" - hammy, 2024
        **userstyles(indices),
    }

    with Path("pigeon/ports.porcelain.yml").open("w", encoding="utf-8") as f:
        yaml.dump(
            porcelain,
            stream=f,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            Dumper=DumpyMcDumpface,
        )


if __name__ == "__main__":
    main()
