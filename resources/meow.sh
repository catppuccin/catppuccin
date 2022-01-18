#!/bin/bash

# ----- M E O W ----- #
# -------------------- #

BIN_NAME=$(basename "$0")
COMMAND_NAME=$1
COMMAND_ARGS=$2

esc=""
reset="${esc}[0m"

# ----- print kitty ----- #

sub_print() {

    local CATLINE1=" /| ､        "
    local CATLINE2="(°､ ｡ 7      "
    local CATLINE3=" |､  ~ヽ     "
    local CATLINE4=" じしf_,)〳  "

    case $COMMAND_ARGS in

    # print coloured version based on input
    '-c' | '--colour' | '--color')

        echo
        echo -e "\033[${2}m$CATLINE1"
        echo -e "\033[${2}m$CATLINE2"
        echo -e "\033[${2}m$CATLINE3"
        echo -e "\033[${2}m$CATLINE4"
        echo
        ;;

        # gae af. <3
    '-p' | '--pride')
        echo -e "\033[0;41m                "
        echo -e "\033[1m\033[0;103m \033[30m  $CATLINE1"
        echo -e "\033[1m\033[1;43m \033[30m  $CATLINE2"
        echo -e "\033[1m\033[0;42m \033[30m  $CATLINE3"
        echo -e "\033[1m\033[0;44m \033[30m  $CATLINE4"
        echo -e "\033[0;45m                "
        ;;

    # just the regular kitty
    *)
        echo
        echo "$CATLINE1"
        echo "$CATLINE2"
        echo "$CATLINE3"
        echo "$CATLINE4"
        echo
        ;;

    esac
    echo "${reset}"
}

# ----- print help ----- #

sub_help() {

    echo "Usage: $BIN_NAME <command>"
    echo
    echo "Commands:"
    echo "   print            Prints the default Kitty art (Default)"
    echo "    --pride         Prints a proud Kitty"
    echo "    --colour <id>   Prints a coloured Kitty"
    echo -e "                    Colours: \033[30m30 \033[31m31 \033[93m93 \033[32m32 \033[33m33 \033[34m34 \033[35m35 \033[36m36\033[39m"
    echo "   source           Link to the Github Repos"
    echo "   help             This help message"

}

# ----- link source ----- #

sub_source() {

    echo "Catpuccin:   https://github.com/catppuccin/catppuccin"
    echo "This Script: https://github.com/catppuccin/catppuccin/blob/main/resources/meow"

}

# ----- command handler ----- #

case $COMMAND_NAME in

# print kitty by default
"")
    sub_print
    ;;

    # make help available via flags
"-h" | "--help")
    sub_help
    ;;

# parse whatever command
*)
    shift
    sub_${COMMAND_NAME} $@
    if [ $? = 127 ]; then
        echo "'$COMMAND_NAME' is not a known command or has errors." >&2
        sub_help
        exit 1
    fi
    ;;

esac
