# function declaration 
global_function <- function(regular, named = "Hello World!") {
  # inner function declaration
  inner_function <- function() {
     closure_usage <- regular
     closure_usage + 1 
  }
   
  print(named)
  regular + inner_function()
}

# function call
global_function(2, named = 'Hello World!')

cat = list(name = "Smudge", breed = "Maine Coon")
#variable acсess
print(cat$breed)

# namespace access
print(datasets::cars[1, 2])