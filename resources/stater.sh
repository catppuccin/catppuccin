#!/bin/bash

blue='\033[0;34m'
cyan='\033[0;36m'
nc="\033[0m" # no color

HELP=$(
    cat <<EOF

This script helps one check if the remotes have had any changes and do something about it.
Useful if one has a bunch of repos.

Usages:
	#0: ${0} <flag(s)>
Arguments:
	-h,--help,-?,?				See this message.
	-v,--verbose			Print verbose output in case remotes have had changes.
	-p,--pull				Pull all changes from all remotes (if any).
	-f,--resources				Copies general resources like images.
EOF
)

function parse_args() {
    while [[ $# -gt 0 ]]; do
        case "${1}" in
        -v | --verbose)
            verbose=true
            shift 1
            ;;
        -p | --pull)
            pull=true
            shift 1
            ;;
        -f | --force)
            force=true
            shift 1
            ;;
        -h | --help | -? | ?)
            printf "%s\n" "$HELP"
            exit 0
            ;;
        *)
            printf "Try '%s --help' for more information\n" "${0}"
            exit 1
            ;;
        esac
    done
}

function perform() {
    for file in *; do
        [[ -d ${file} ]] && {
            printf "${blue}Checking ${cyan}%s${nc}...\t\t" "${file}"
            diff_sum="$(git -C ${file} diff --compact-summary origin/main)"

            [[ ${?} == 0 ]] && {
				state="🟢"
                if [[ ${diff_sum} != "" ]]; then
                    state="🔴"
					if [[ ${verbose} == "true" ]]; then state="\\n${diff_sum}"; fi
                fi

				printf "${state}\n"

				[[ ${pull} == "true" ]] && {
					if [[ $(git -C ${file} status --porcelain) ]]; then
						if [[ "force" == "true" ]]; then
							printf "\n-->Force pulling updates...\n"
							git -C "${file}" fetch --all
							git -C "${file}" reset --hard
						else
							printf "\n-->Pulling updates...\n"
							git -C "${file}" pull --all
						fi
					fi
				}
			}

        }
    done
}

main() {
    if [[ "$#" -gt 0 ]]; then
        parse_args "$@"
    fi
    perform
}

main "$@"
