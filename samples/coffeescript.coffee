###
Some tests
###
class Animal
  constructor: (@name) ->
  move: (meters) -> alert @name + " moved " + meters + "m."

class Snake extends Animal
  move: ->
    alert 'Slithering...'
    super 5

number   = 42; opposite = true

/^a\/\\[a-z/\n]\u00A3b$/.test 'a//b'

square = (x) -> x * x

range = [1..2]
list = [1...5]

math =
  root:   Math.sqrt
  cube:   (x) => x * square x

race = (winner, runners...) ->
  print winner, runners

alert "I knew it!" if elvis?

cubes = math.cube num for num in list

text = """
 Result
    is #{ @number }"""

html = ''' <body></body>'''

String::dasherize = ->
  this.replace /_/g, "-"
SINGERS = {Jagger: "Rock", Elvis: "Roll"}

t = ///
[a-z]
///

$('.shopping_cart').bind 'click', (event) =>
  @customer.purchase @cart

hi = `function() {
  return [document.title, "Hello JavaScript"].join(": ");
}`
