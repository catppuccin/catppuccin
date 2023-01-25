#!/usr/bin/env sh

#Sample comment
let "a=16 << 2";
b="Sample text";

function foo() {
  if [ $string1 == $string2 ]; then
    for url in `cat example.txt`; do
      curl $url > result.html
    done
  fi
}

rm -f $(find / -name core) &> /dev/null
mkdir -p "${AGENT_USER_HOME_${PLATFORM}}"

multiline='first line
           second line
           third line'
cat << EOF
 Sample text
EOF
