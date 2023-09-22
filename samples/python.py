from typing import List

def decorator(param):
    pass

@decorator(param=1)
def f(x):
    """
    Syntax Highlighting Demo
    @param x Parameter
    """

    def nested_func(y):
        print(y + 1)

    s = ("Test", 2+3, {'a': 'b'}, f'{x!s:{"^10"}}')   # Comment
    f(s[0].lower())
    nested_func(42)

class Foo:
    tags: List[str]

    def __init__(self: Foo):
        byte_string: bytes = b'newline:\n also newline:\x0a'
        text_string = u"Cyrillic Я is \u042f. Oops: \u042g"
        print(f"Got bytes: {byte_string!r}, text: {text_string!s}")
        self.make_sense(whatever=1)

    def make_sense(self, whatever):
        self.sense = whatever

x = len('abc')
print(f.__doc__)
