import yaml


class DumpyMcDumpface(yaml.SafeDumper):
    """
    dump without stinky nerd anchors
    use flow style for arrays and block style for maps
    """

    def ignore_aliases(self, data):
        return True

    def represent_map(self, data):
        return self.represent_mapping("tag:yaml.org,2002:map", data, flow_style=False)

    def represent_array(self, data):
        simple = all(isinstance(i, (str, int, float, bool)) for i in data)
        return self.represent_sequence("tag:yaml.org,2002:seq", data, flow_style=simple)


DumpyMcDumpface.add_representer(
    dict,
    DumpyMcDumpface.represent_map,
)

DumpyMcDumpface.add_representer(
    list,
    DumpyMcDumpface.represent_array,
)
