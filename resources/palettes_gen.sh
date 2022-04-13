#!/bin/bash

# ---- sys
NC=" \033[0m"
coerce=false
lowercase=false
file=""
prefix=""
original_palette="storm"
verbosity=0

script_help=$(
    cat <<EOF
Generate missing Catppuccin palettes from a base file (e.g. generate a dawn.conf & a dusk.conf from a storm.conf file)

Usages:
#0: $(basename "$0") <flag> [arg]

Flags:
	-f, --file			specify file (mandatory)
	-v, --verbose			increase verbosity by 1
	-o, --original-palette		the palette used in the based file (given by --file)
	-l, --lowercase			replaces with lowercased hex codes
	-c, --coerce			force the creation of new palette files (useful when those files already exist)
	-p, --prefix			specify which prefix to use for the hex codes. Surround it with double quotes if needed.
	-h, --help			see this message
EOF
)

palette_names=(
    storm
    dusk
    dawn
)

declare -A dusk=(
    [white]='C6D0F5'
    [peach]='FAB387'
    [gray2]='ADB5D8'
    [black0]='101019'
    [black1]='181825'
    [gray1]='959BBA'
    [blue]='90C1FB'
    [green]='A6E3A1'
    [sapphire]='74C7EC'
    [black3]='323044'
    [black4]='4B4B62'
    [black5]='63657F'
    [teal]='94E2D5'
    [gray0]='7C809D'
    [rosewater]='F5E0DC'
    [maroon]='EBA0AC'
    [lavender]='C9CBFF'
    [yellow]='F9E2AF'
    [flamingo]='F2CDCD'
    [sky]='89DCEB'
    [mauve]='CBA6F7'
    [black2]='1E1E2E'
    [pink]='F5C2E7'
    [red]='F38BA8'
)

declare -A storm=(
    [white]='C5CFF5'
    [sapphire]='34C3DC'
    [pink]='F5BFE7'
    [rosewater]='F5DFDA'
    [black2]='24273A'
    [flamingo]='F2CBCB'
    [red]='F67E98'
    [maroon]='F1949B'
    [peach]='FEA571'
    [black1]='1F2233'
    [sky]='89DCFD'
    [gray1]='8289AA'
    [lavender]='C2CBFE'
    [black3]='2B3045'
    [green]='A1DF8E'
    [black4]='3E435E'
    [yellow]='F1D8A4'
    [gray2]='A6AFD2'
    [blue]='83ABF9'
    [black0]='1A1B26'
    [gray0]='5F6587'
    [teal]='85E0D1'
    [black5]='4F5473'
    [mauve]='C59FF6'
)

declare -A dawn=(
    [black4]='CCC9D1'
    [peach]='FE6811'
    [black3]='E6E3E5'
    [pink]='EC83D0'
    [black0]='D3D0D2'
    [black1]='EDEDED'
    [blue]='1D65F5'
    [lavender]='7287FD'
    [mauve]='8F46EF'
    [black5]='B5B1BF'
    [maroon]='E63B4A'
    [rosewater]='E5AC9F'
    [green]='509E31'
    [gray1]='86819C'
    [black2]='FBF8F4'
    [white]='575279'
    [gray2]='6E6A8B'
    [sky]='04A5E5'
    [sapphire]='209FB5'
    [red]='D20F39'
    [teal]='289886'
    [gray0]='9D99AE'
    [flamingo]='DF7F7F'
    [yellow]='E49320'
)

function prompt() {
    local type=${1} # error, success, warning, info
    local message=${2}
    local modifiers=${3}

    case ${type} in
    "-e" | "--error")
        printf "\033[0;31m${modifiers}ERROR: %s${NC}\n" "${message}"
        ;;
    "-s" | "--success")
        printf "\033[0;32m${modifiers}SUCCESS: %s${NC}\n" "${message}"
        ;;
    "-w" | "--warning")
        printf "\033[0;33m${modifiers}WARNING: %s${NC}\n" "${message}"
        ;;
    *)
		if [[ $1 == "-i" || $1 == "--info" ]]; then
			type="${message}"
			message=${modifiers}
		fi
        printf "\033[0;34m${message}INFO: %s${NC}\n" "${type}"
        ;;
    esac
}

function verbose_print() {
    # $1 = message
    # $2 = modifiers
    if [[ $verbosity -gt 0 ]]; then
        printf "\033[3;29m${2}%s${NC}\n" "${1}"
    fi
}

function generate_palettes() {
    capitalization_char='\U' # uppercase
    [[ $lowercase == true ]] && {
        capitalization_char='\L' # lowercase
    }

    new_array=()
    for val in "${palette_names[@]}"; do
        [[ "$val" != "$original_palette" ]] && new_array+=("$val")
    done
    palette_names=("${new_array[@]}")
    unset new_array

    for palette in "${palette_names[@]}"; do
        printf "    GENERATING: \033[3;32m%s${NC}\n" "$palette"

        local dest_file="${palette}.${file##*.}"
        prompt -w "creating $dest_file..." "\t• "

        if [[ -f $dest_file ]]; then
            if [[ ! $coerce == true ]]; then
                prompt -e "file '$dest_file' already exists. Use --coerce to force it's replacement" "\t• "
                exit 1
            fi
        fi

		cp "$file" "$dest_file"
        prompt -i "replacing colors..." "\t• "

        for clr in "${!storm[@]}"; do
            local curr_color=$(eval "echo \${${original_palette}[$clr]}")
            local dest_color=$(eval "echo \${${palette}[${clr}]}")
            verbose_print "modifying ${clr}" "\t    + "
            sed -i "s/${curr_color}/${prefix}${capitalization_char}${dest_color}/gI" "$dest_file"
        done
    done
}

function detect_original_palette() {
    prompt -w "detecting palette..."
    original_palette=""
    for palette in "${palette_names[@]}"; do
        for clr in "${!storm[@]}"; do
            if grep -q $(eval "echo \${${palette}[${clr}]}") "$file"; then
                original_palette=$palette
                break 2
            fi
        done
    done

    if [[ $original_palette == "" ]]; then
        prompt -e "couldn't detect the original palette"
        exit 1
    else
        prompt -s "detected '$original_palette'"
    fi
}

main() {
    if [[ ! "$#" -gt 0 ]]; then
        prompt -e "you must provide at least the file you want to generate the missing palettes from"
    else
        local help_used=false
        while [ "$1" != "" ]; do
            case $1 in
            -v | --verbose)
                verbosity=$((verbosity + 1))
                ;;
            -f | --file)
                file=$2
                shift
                ;;
            -o | --original-palette)
                origianl_palette=$2
                shift
                ;;
            -l | --lowercase)
                lowercase=true
                ;;
            -c | --coerce)
                coerce=true
                ;;
            -p | --prefix)
                prefix=$2
                shift
                ;;
            -h | --help)
                help_used=true
                echo "$script_help"
                ;;
            *)
                echo "ERROR: command ($1) not recognized"
                ;;
            esac
            shift
        done

        if [[ $help_used != "true" ]]; then
            if [[ $file != "" ]]; then
                [[ -f $file ]] && {
                    prompt "updating colors..."
                    if [[ original_palette != "storm" || original_palette != "dusk" || original_palette != "dawn" ]]; then
                        detect_original_palette
                    fi
                    generate_palettes
                } || prompt -e "file ${1} does not exist"
            else
                prompt -e "please profive a file to use a base using the --file flag"
            fi
        fi
    fi
}

main "$@"
