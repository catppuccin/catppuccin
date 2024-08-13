refresh:
  pigeon/.venv/bin/python3 -m pigeon.report
  pigeon/.venv/bin/python3 -m pigeon.reuserstyle
  yq eval-all '. as $item ireduce ({}; . *+ $item)' pigeon/ports.yml pigeon/userstyles.yml > pigeon/merged.yml
  pigeon/.venv/bin/python3 -m pigeon.porcelain
