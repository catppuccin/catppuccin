refresh:
  python3 -m venv pigeon/.venv && pigeon/.venv/bin/pip install pyyaml requests
  pigeon/.venv/bin/python3 -m pigeon.recategory
  pigeon/.venv/bin/python3 -m pigeon.report
  pigeon/.venv/bin/python3 -m pigeon.reuserstyle
  pigeon/.venv/bin/python3 -m pigeon.merge
  pigeon/.venv/bin/python3 -m pigeon.porcelain
  rm -rf pigeon/.venv
  rm -rf pigeon/__pycache__
