#!/bin/bash

# ---------- sys ---------
lowercase=false
file=""
prefix=""

this_script=$(basename "$0")
script_help=$( cat << EOF
This script updates colors from Catppuccin v0.1.1 to v0.1.2
You can find previous versions of this script in each release.

Usages:
#0: ${this_script} <flag> [arg]

Flags:
	-f, --file		specify file (mandatory)
	-l, --lowercase		replaces with lowercased hex codes
	-p, --prefix		specify which prefix to use for the hex codes. Surround it with double quotes if needed.
	-h, --help		see this message
EOF
)

declare -A colors=(
    # <old> -> new
    ["F2CECF"]='F2CDCD' # flamingo
    ["E5B4E2"]='E5B4E2' # pink
    ["F9C096"]='F7BE95' # peach
    ["EBDDAA"]='ECDDAA' # yellow
    ["B1E3AD"]='B1E1A6' # green
    ["BEE4ED"]='B7E5E6' # teal
	["DADAE8"]='DFDEF1' # white
)

function update_colors() {
	capitalization_char='\U' # uppercase
    [[ $lowercase == true ]] && {
		capitalization_char='\L' # lowercase
    }
    for clr in "${!colors[@]}"; do
        echo -e "  + ${clr} -> ${colors[$clr]}"
        sed -i "s/${clr}/${prefix}${capitalization_char}${colors[$clr]}/gI" "$file"
    done
}

main() {
    if [[ ! "$#" -gt 0 ]]; then
        echo -e "INFO: Please provide the file you want to update to Catppuccin v0.1.1"
    else
        while [ "$1" != "" ]; do
            case $1 in
            -f | --file)
                file=$2
                shift
                ;;
            -l | --lowercase)
                lowercase=true
                ;;
			-p | --prefix)
				prefix=$2
				shift
				;;
			-h | --help)
				echo "$script_help"
				;;
            *)
                echo "ERROR: command ($1) not recognized"
                ;;
            esac
            shift
        done

        [[ -f $file ]] && {
            echo -e "INFO: Updating colors..."
            update_colors "${1}"
        } || echo "ERROR: File ${1} does not exist"
    fi
}

main "$@"
