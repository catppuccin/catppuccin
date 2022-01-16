#!/bin/bash

# update the years in the licenses

old_year="2021"
new_year="2022"
replace_str="s/${old_year}/${new_year}/g"

echo -e "\t---- Updating licenses ----\n"

for file in *; do
	[[ -d ${file} ]] && {
		[[ -f ${file}/LICENSE ]] && {
			echo -e "  + Updating \e[0;32m${file}/LICENSE\e[0m..."
			grep -rl 2021 "${file}/LICENSE" | xargs sed -i ${replace_str}
		}
	}
done
