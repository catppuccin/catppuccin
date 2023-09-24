#!/usr/bin/env bash
IFS=$'\n\t'
set -euo pipefail

# This script does nothing in particular
# It somehow manages to include most of Bash's syntax elements :)

# Computes the number 42 using Bash
function compute42() {
    echo $((2 * 3 * (3 + 4)))
}

# Computes the number 42 using a subshell command
function compute42Subshell() {
    echo "$(echo "2*3*(3+4)" | bc)"
}

# Subtract the second parameter from the first and outputs the result
# It can only handle integers
function subtract() {
    local a=${1:?"First param not set"}
    local b=${2:?"Second param not set"}

    echo -n "$((a - b))"
}

echo 'The current working directory is: '" ${PWD}"

echo "100 - 58 = $(subtract 100 58)"

fortyTwo=$(compute42)
echo "$fortyTwo is 42"

fortyTwo=$(compute42Subshell)
echo "${fortyTwo} is 42"

echo "6 * 7 is $fortyTwo"  > log.txt 2>&1

echo `echo This is an echo`

empty=""
[ -z "$empty" ]  && This variable is empty!

cat -  << EOF
    Dear Mr. X,
    this is a message to you.

    With kind regards,
    Mr. Y
EOF
