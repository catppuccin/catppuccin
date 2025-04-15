from copy import deepcopy
from pathlib import Path

import yaml

from pigeon.caveman import DumpyMcDumpface


class Index:
    def __init__(self, data: list, key: str):
        self.index = {item[key]: item for item in data}

    def __getitem__(self, key):
        return deepcopy(self.index[key])


class Indices:
    def __init__(self, ports: dict, categories: list):
        self.collaborators = Index(ports["collaborators"], "username")
        self.repositories = Index(ports["repositories"], "name")
        self.categories = Index(categories, "key")


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


def main():
    with Path("pigeon/merged.yml").open("r", encoding="utf-8") as f:
        ports = yaml.safe_load(f)
    with Path("pigeon/categories.yml").open("r", encoding="utf-8") as f:
        categories = yaml.safe_load(f)

    indices = Indices(ports, categories)

    porcelain = {
        "ports": make_ports(ports, indices),
        "collaborators": ports["collaborators"],
        "categories": categories,
        "showcases": ports["showcases"],
        "archived-ports": make_archived_ports(ports, indices),
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
