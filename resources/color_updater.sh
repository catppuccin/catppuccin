#!/bin/bash

# ---------- sys ---------
lowercase=false
file=""

this_script=$(basename "$0")
script_help=$( cat << EOF
This script updates colors from Catppuccin v0.1.0 to v0.1.1

Usages:
#0: ${this_script} <flag> [arg]

Flags:
	-f, --file			specify file (mandatory)
	-l, --lowercase			replaces with lowercased hex code
	-h, --help			see this message
EOF
)

declare -A colors=(
    # <old> -> new
    ["ECBFBD"]='F2CECF' # flamingo
    ["F0AFE1"]='E5B4E2' # pink
    ["E28C8C"]='E38C8F' # red
    ["F7C196"]='F9C096' # peach
    ["EADDA0"]='EBDDAA' # yellow
    ["B3E1A3"]='B1E3AD' # green
    ["9DDDCB"]='BEE4ED' # teal
    ["6E6C7C"]='6E6C7E' # gray
	["2D293B"]='332E41' # black 3
	["D7DAE0"]='DADAE8' # white
)

function update_colors() {
	capitalization_char='\U' # uppercase
    [[ $lowercase == true ]] && {
		capitalization_char='\L' # lowercase
    }
    for clr in "${!colors[@]}"; do
        echo -e "  + ${clr} -> ${colors[$clr]}"
        sed -i "s/${clr}/${capitalization_char}${colors[$clr]}/gI" "$file"
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
