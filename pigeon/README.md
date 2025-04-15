# pigeon's temporary port wrangling scripts

these will not remain.

**requires pyyaml & requests**

## setup

```console
$ python -m venv .venv && .venv/bin/pip install pyyaml requests
```

## scripts

### re-port

converts [`../resources/ports.yml`](../resources/ports.yml) to [`ports.yml`](ports.yml)

```shell
$ python -m pigeon.report
```

### re-userstyle

converts [`catppuccin/userstyles#userstyles.yml`](https://raw.githubusercontent.com/catppuccin/userstyles/main/scripts/userstyles.yml) to [`userstyles.yml`](userstyles.yml)

```shell
$ python -m pigeon.reuserstyle
```

### merged

To generate the [`merged.yml`](merged.yml) file, run:

> [!NOTE]
> We still need to figure out how to easily deduplicate the collaborators between ports and userstyles.
> `yq` merges it really nicely, but it doesn't handle the duplicates. Using `yq` is a temporary solution that works really well for now.

```shell
$ yq eval-all '. as $item ireduce ({}; . *+ $item)' pigeon/ports.yml pigeon/userstyles.yml > pigeon/merged.yml
```

### porcelain

generates [`ports.porcelain.yml`](ports.porcelain.yml) from [`ports.yml`](ports.yml)

```shell
$ python -m pigeon.porcelain
```
