from pathlib import Path

import yaml

from pigeon.caveman import DumpyMcDumpface


def github_profile_link(username: str) -> str:
    return f"https://github.com/{username}"


def make_repo(name: str, port: dict) -> dict:
    repo = {
        "name": name,
        "url": port.get("url", f"https://github.com/catppuccin/{name}"),
        "current-maintainers": [m for m in port.get("current-maintainers", [])],
    }

    if port.get("past-maintainers"):
        repo["past-maintainers"] = [m for m in port["past-maintainers"]]

    return repo


with Path("resources/ports.yml").open("r", encoding="utf-8") as f:
    og_ports = yaml.safe_load(f)

# we have to rehydrate collaborator's usernames (this is known as a "yaml anchor moment")
collaborators = [
    {"username": collaborator, "url": github_profile_link(collaborator)}
    for collaborator in og_ports["collaborators"]
]

# new object: repositories
# several ports can share the same repository
repositories = [
    make_repo(key, port)
    for key, port in og_ports["ports"].items()
    if "alias" not in port
] + [make_repo(key, port) for key, port in og_ports["archived"].items()]

# ports have their maintainers replaced by a repository reference
ports = [
    {
        **{
            k: v
            for k, v in port.items()
            if k not in {"current-maintainers", "past-maintainers", "url"}
        },
        "key": key,
        "repository": port.get("alias", key),
    }
    for key, port in og_ports["ports"].items()
]

# archived ports also get a repository reference
archived_ports = [
    {
        **port,
        "key": key,
        "repository": key,
    }
    for key, port in og_ports["archived"].items()
]


ports_data = {
    "collaborators": collaborators,
    "repositories": repositories,
    "ports": ports,
    "showcases": og_ports["showcases"],
    "archived-ports": archived_ports,
}

with Path("pigeon/ports.yml").open("w", encoding="utf-8") as f:
    yaml.dump(
        ports_data,
        stream=f,
        Dumper=DumpyMcDumpface,
        sort_keys=False,
        allow_unicode=True,
        default_flow_style=False,
    )
