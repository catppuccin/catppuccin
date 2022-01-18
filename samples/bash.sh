#!/bin/bash

#sve = System Variable Exemplifier
#This script executes whatever file you tell regardless of in which directory it's currently in.

# TO-DO
#   + on recurse_dirs2() -- make it so that any file with 'Main' on its name will get compiled at the end, cuz else it's going to cause error
#   + make it so that $temp_cp can be edited using this scritpt
#      +,i remove one of the entries
#       +,i add an entry
#   + fix bugs
#       +,i if entry if removed and entry is last of entries then the entry before that one will have an collon, which is something that will cause an error to the parser
#       this is a simple test becas (done)
#   + from $0 -ef a -> if "entry" is on $temp_cp then do not add entry, print message, else, add it (done)
#   + edit --help str (done)
#   + avoid compiling already compiled files
#       +,i mkdir /tmp/2sve_tmp -- dir where "already compiled things" file is stored
#           +,j touch /tmp/2sve_tmp/compiled_file_list.json
#       +,i after first compile add all files compiled to list
#       +,i if `stat --format "%Y" <file_name>` == `stat --format "%Y" hello.txt` of file with same name in compiled_file_list.json, then don't compile, else, do so

OUT_DICT=out
temp_cp=/usr/local/bin/kt_temp_classpaths/kttemp_cp.json
temp_temp_cp=/usr/local/bin/kt_temp_classpaths/kttemp_temp_cp.json

#lists
dir_compiled=/tmp/2sve_tmp/
dir_sessions=/tmp/2sve_tmp/sessions/
txt_sessions=/tmp/2sve_tmp/current_sessions.txt
lines_sessions=`wc -l $txt_sessions | awk '{ print $1 }'`
testable_file=/tmp/2sve_tmp/test1.txt
hashtag="#"

#get shortened version of script's name
# this_scrpt=`basename "$0" &>/dev/null`
this_scrpt=`basename "$0"`

script_help=$( cat << EOF

This script simplifies the process of executing and compiling kolin code/projects
using simple configuration files.

Usages:
    #0: ${this_scrpt} [arg] <modifier(s)?>
Arguments:
    -h,--help                                   See this help message.
    -c,--compile                                Compile all .kt files in current dir into
    current dir or a given dir a subargument. Fail: if errror on the code of given files.
    -r,--run                                    Run a .class file using 'kotlin'. Fail: if file
    does not exist
    -ef,--edit-file [mode: a(dd)/d(elete)]      Edit the configuration file ($temp_cp) to
    either add or remove an entry depinding on the mode. Fail [when adding]: if entry alredy
    exists; Fail [when removing]: if out of range index is given.
    -gcp|--get-class-paths                      Show prettily all the entries in the configuration
    file ($temp_cp)
Example:
    #0: $this_scrpt -c . 0
        Explanation: compile all .kt files in cwd into cwd using the default classpath

EOF
)

function create_dirs() {

for_jsons=$( cat << EOF
{
  "test_key": "test_val"
}
EOF
)

    in_dir=$1
    compiled_list="${in_dir}compiled_list.json"
    compiled_list_tmp="${in_dir}compiled_list_tmp.json"
    touch $compiled_list $compiled_list_tmp
    echo "$for_jsons" > $compiled_list

}



function recurse_dirs1() {

    # readarray -t  assArrayCP2< <(jq -r '.[]' $compiled_list)
    files_array=$(find . -type f -name "*.kt") #find all files with the .kt (kotlin) exte
    test_array=()

    sub_str1="main"
    sub_str2="Main"
    c_line=1

    for j in "${files_array[@]}"; do #this is because files on $files_array can't one by one
        test_array+=($j)
    done

    if [[ $lines_sessions == 0 ]]; then
        new_session="${dir_sessions}session1/"
        mkdir $new_session

        # append to file
        echo "$out" >> $txt_sessions
        create_dirs $new_session
    else
        while read -r line; do
            # echo "current line = $c_line\ttotal lines = $lines_file"
            if [[ "$line" == "$out" ]]; then
                compiled_list="${dir_sessions}session$c_line/compiled_list.json"
                compiled_list_tmp="${dir_sessions}session$c_line/compiled_list_tmp.json"
                break
            else
                if [[ $c_line == $lines_sessions ]]; then
                    # echo "recursion limit reached"; break
                    new_session="${dir_sessions}session$((lines_sessions+1))/"
                    mkdir $new_session

                    # append to file
                    echo "$out" >> $txt_sessions
                    create_dirs $new_session
                    break
                else
                    c_line=$((c_line+1))
                fi
            fi
        done < $txt_sessions
    fi


    testarray_size=${#test_array[@]}
    # echo "files array size = $testarray_size"
    second_counter=0


    for file in "${test_array[@]}"; do
        readarray -t  assArrayCP2< <(jq -r '.[]' $compiled_list)
        counter=-1

        for key in ${!assArrayCP2[@]}; do
            counter=$((counter+1))
        done

        counter_plus_two=$((counter+2))
        counter_plus_one=$((counter+1))
        counter_plus_three=$((counter+3))
        final_counter="${counter_plus_three}s"

        counter=$((AACP2_size + 1))
        last_entry=-1
        lines_in_list=`wc -l $compiled_list | awk '{ print $1 }'`
        lines_minusone="$((lines_in_list - 1))s"
        tarray_size=${#test_array[@]}
        tas_plus1=$((tarray_size + 1))

        # echo "\tSECOND COUNTER = $second_counter"

        AACP2_size=${#assArrayCP2[@]}
        inner_counter=1

        current_stats=`stat --format "%Y" $file`
        only_name=`basename "$file"`
        cmd1="cat $compiled_list | jq '.\"$only_name\"'"
        # cmd1="cat $compiled_list | jq '.\"$test_name\"'"
        evaluation_file=`eval $cmd1`
        eval_file_without_apostrofes=${evaluation_file//\"/}

        if [[ "$evaluation_file" == "null" ]]; then #file is not on the list
            if [[ "$file" == *"$sub_str2"* || "$file" == *"$sub_str1"* ]]; then
                is_main=$file
                to_change=true
                second_counter=$((second_counter+1))

                str_replacement="${hashtag}${counter_plus_one};${file_stats}"
                cat $compiled_list | jq --arg fsts "$current_stats" '. + {"###": $fsts}' > $compiled_list_tmp; cat $compiled_list_tmp > $compiled_list; echo "" > $compiled_list_tmp
                sed -i "$final_counter/"$hashtag$hashtag$hashtag"/"$only_name"/g" $compiled_list

                if [[ $((testarray_size)) == 1 ]]; then
                    :
                else
                    continue #this continue is causing issues but it also helps in some situations
                fi
            else
                :
            fi

            echo "🍉 File = $file"
            # echo "var is empty, therefore file is not added into the array"
            echo -e "\tIn config status: not sited"
            echo -e "\tChanged? = Null\n"

            str_replacement="${hashtag}${counter_plus_one};${file_stats}"
            cat $compiled_list | jq --arg fsts "$current_stats" '. + {"###": $fsts}' > $compiled_list_tmp; cat $compiled_list_tmp > $compiled_list; echo "" > $compiled_list_tmp
            sed -i "$final_counter/"$hashtag$hashtag$hashtag"/"$only_name"/g" $compiled_list

            #compile the file here
            if [[ -z "$out" ]]; then #var is empty, therefore no out dir was given
                echo -e "\t🔰 compiling:\t$file"; `kotlinc $file -d . -cp $whichKeyCP`
                echo ""
                second_counter=$((second_counter+1))
            else #var has something, dir was given
                echo -e "\t🔰 compiling:\t$file"; `kotlinc $file -d $out -cp $whichKeyCP`
                echo ""
                second_counter=$((second_counter+1))
            fi


            if [[ $second_counter == $((testarray_size)) ]]; then
                if [[ "${test_array[@]}" =~ "${is_main}" && $to_change = true ]]; then
                    echo "🍉 File = $is_main"
                    # echo "var is empty, therefore file is not added into the array"
                    echo -e "\tIn config status: not sited"
                    echo -e "\tChanged? = Null\n"
                    if [[ -z "$out" ]]; then #var is empty, therefore no out dir was given
                        echo -e "\t🔰 compiling:\t$is_main"; `kotlinc $is_main -d . -cp $whichKeyCP`
                        echo ""
                    else
                        echo -e "\t🔰 compiling:\t$is_main"; `kotlinc $is_main -d $out -cp $whichKeyCP`
                        echo ""
                    fi
                else
                    :
                fi
            else
                :
            fi


        else #file is on the list
            # echo "File is already on the the configuration file"
            # echo -e "\tCurrent stats = $current_stats\n\tStats in config = $eval_file_without_apostrofes"
            if [[ "$current_stats" == "$eval_file_without_apostrofes" ]]; then
                if [[ "$file" == *"$sub_str2"* || "$file" == *"$sub_str1"* ]]; then
                    is_main=$file
                    to_change=false
                    second_counter=$((second_counter+1))
                else
                    :
                fi

                echo "🍉 File = $file"
                echo -e "\tIn config status: sited"
                # echo -e "\n---------File hasn't been changed---------\n" #file shouldn't be compiled
                echo -e "\tChanged? = False\n"
                second_counter=$((second_counter+1))
                #not compile

            else

                if [[ "$file" == *"$sub_str2"* || "$file" == *"$sub_str1"* ]]; then
                    is_main=$file
                    to_change=true
                    second_counter=$((second_counter+1))

                    cmd2="cat $compiled_list | jq --arg foo "$current_stats" '. + {\"$only_name\": \$foo}'"
                    final_str=`eval $cmd2`
                    echo "$final_str" > $compiled_list_tmp;  cat $compiled_list_tmp > $compiled_list; echo "" > $compiled_list_tmp; continue
                else
                    :
                fi

                echo "🍉 File = $file"
                echo -e "\tIn config status: sited"
                # echo -e "\n-------------File was changed--------------\n"
                echo -e "\tChanged? = True\n"

                #replace with new stats
                cmd2="cat $compiled_list | jq --arg foo "$current_stats" '. + {\"$only_name\": \$foo}'"
                final_str=`eval $cmd2`
                echo "$final_str" > $compiled_list_tmp;  cat $compiled_list_tmp > $compiled_list; echo "" > $compiled_list_tmp

                if [[ -z "$out" ]]; then #var is empty, therefore no out dir was given
                    echo -e "\t🔰 compiling:\t$file"; `kotlinc $file -d . -cp $whichKeyCP`
                    echo ""
                    second_counter=$((second_counter+1))
                else #var has something, dir was given
                    echo -e "\t🔰 compiling:\t$file"; `kotlinc $file -d $out -cp $whichKeyCP`
                    echo ""
                    second_counter=$((second_counter+1))
                fi
            fi

            if [[ $second_counter == $((testarray_size)) ]]; then
                if [[ "${test_array[@]}" =~ "${is_main}" && $to_change = true ]]; then
                    echo "🍉 File = $is_main"
                    # echo "var is empty, therefore file is not added into the array"
                    echo -e "\tIn config status: not sited"
                    echo -e "\tChanged? = Null\n"
                    if [[ -z "$out" ]]; then #var is empty, therefore no out dir was given
                        echo -e "\t🔰 compiling:\t$is_main"; `kotlinc $is_main -d . -cp $whichKeyCP`
                    else #var has something, dir was given
                        echo -e "\t🔰 compiling:\t$is_main"; `kotlinc $is_main -d $out -cp $whichKeyCP`
                    fi
                else
                    :
                fi
            else
                :
            fi
        fi
    done

    time_end=`date +%s`
    runtime=$((time_end-time_start))

    case ${?} in
        0)
            echo -e "\n-----------------------------------------"
            echo -e "Everything was compiled successfully!"
            echo -e "Time: ${runtime}secs."
            ;;
        *)
            echo -e "\n\nAn error ocurred while compiling, check '$this_scrpt -h' for help."
            echo -e "Time: ${runtime}secs."
            ;;
    esac
}


function recurse_dirs2() {

    files_array=$(find . -type f -name "*.kt") #find all files with the .kt (kotlin) extension
    test_array=()

    for j in "${files_array[@]}"; do #this is because files on $files_array can't be accessed one by one
        test_array+=($j)
    done

    sub_str1="main"
    sub_str2="Main"

    echo -e "\n\t--------Files--------\n"
    #note: the emoji is for orientating the user in case the error output is huge
    time_start=`date +%s`
    if [[ -z "$out" ]]; then #var is empty, therefore no out dir was given
        for file in "${test_array[@]}"; do
            if [[ "$file" == *"$sub_str2"* || "$file" == *"$sub_str1"* ]]; then
                is_main=$file
            else
                echo -e "🍉 compiling:\t$file"; `kotlinc $file -d . -cp $whichKeyCP`
            fi
        done
        echo -e "🍉 compiling:\t$is_main"; `kotlinc $is_main -d . -cp $whichKeyCP`
    else #var has something, dir was given
        for file in "${test_array[@]}"; do
            if [[ "$file" == *"$sub_str2"* || "$file" == *"$sub_str1"* ]]; then
                is_main="$file"
            else

                echo -e "🍉 compiling:\t$file"; `kotlinc $file -d $out -cp $whichKeyCP`
            fi
        done
        echo -e "🍉 compiling:\t$is_main"; `kotlinc $is_main -d $out -cp $whichKeyCP`
    fi
    time_end=`date +%s`
    runtime=$((time_end-time_start))


    case ${?} in
        0)
            echo -e "\n\nEverything was compiled successfully!"
            echo -e "Time: ${runtime}secs."
            ;;
        *)
            echo -e "\n\nAn error ocurred while compiling, check '$this_scrpt -h' for help."
            echo -e "Time: ${runtime}secs."
            ;;
    esac
}

function get_class_paths() {
    readarray -t  assArrayCP< <(jq -r '.[]' $temp_cp)

    echo -e "This are the available classpaths: \n"

    echo -e "--------------------------CLASSPATHS--------------------------"
    for key in ${!assArrayCP[@]}; do
        echo -e "  💡$key -> ${assArrayCP[$key]}"
    done
    echo -e "--------------------------CLASSPATHS--------------------------"
}

function check_trailing_comma() {
    `sed -i.bak ':begin;$!N;s/,\n}/\n}/g;tbegin;P;D' $temp_cp` #remove trailing comma if any
}

function test_func() {

    for file in *; do
        if [[ "$file" == "$0" ]]; then
            echo "found"
        else
            continue
        fi
    done
}

if [[ -n "$1" ]]; then
    case "$1" in
        -h|--help)
            echo "$script_help"
            exit 0
            ;;
        -c|--compile) #$1 = "-c"
            out=$2
            whichKeyCP=$3

            if [[ -z "$out" ]]; then
                out=`pwd`
            else
                :
            fi

            # echo "1 = $1; 2 = $2; 3 = $3"
            # echo -e "\n\nout= $out; whichKeyCP= $whichKeyCP"
            readarray -t  assArrayCP< <(jq -r '.[]' $temp_cp)
            AACP_size=${#assArrayCP[@]}

            if [[ -z "$3" ]]; then #var is empty
                echo "this ran"
                whichKeyCP=0
            else
                counter=1
                for key in ${!assArrayCP[@]}; do
                    # echo "key = $key"
                    if [[ "$key" == "$whichKeyCP" ]]; then
                        # echo -e "  💡$key -> ${assArrayCP[$key]}"
                        whichKeyCP=${assArrayCP[$key]}; break
                    else
                        if [[ $AACP_size == $counter ]]; then
                            echo -e "\nERROR: Unfortunately the key '$whichKeyCP' was not found on the config file.\nFor more information run '$this_scrpt --get-class-paths' or '$this_scrpt -gcp'"
                            whichKeyCP=0
                            exit 1
                        else
                            :
                        fi
                    fi
                    counter=$((counter+1))
                done
            fi

            # echo -e "which key = $whichKeyCP"
            echo -e "\nCLASSPATH:\t$whichKeyCP\nOUT DIR:\t$out\n"
            recurse_dirs2
            exit 0
            ;;
        -sc|--smart-compile)

            if [[ -f "$compiled_list" ]]; then #exists
                :
            else #does not exist
                # mkdir -p $dir_compiled && touch $compiled_list $compiled_list_tmp
                # `echo '{ "test_file":"test_stats" }' | jq . > $compiled_list`
                mkdir -p $dir_compiled $dir_sessions && touch $txt_sessions
                lines_sessions=`wc -l $txt_sessions | awk '{ print $1 }'`
            fi

            #--------Status of a file---------#
            #In config staus: [sited|not sited]
            #Change? = [Null|True|False]
            #
            #for config statuses:
            #   sited: the program already has a register of that given file in the configurationg files
            #   not sited: the program does not has a register of that given file in the configurationg files
            #for changed:
            #   Null: for files that are yet to be registered in the archive
            #   True: Files' current stats and in-config stats are different, therefore file is considered to have changed
            #       +,i what is considered as changed?
            #           +,j if file was directly written
            #           +,j if a program saved the file (regardless of having edited something). E.g. when writing with vim (:w)
            #   False: File' current stats and in-config stats are the same, therefore file has not changed


            out=$2
            whichKeyCP=$3
            time_start=`date +%s`

            # echo "1 = $1; 2 = $2; 3 = $3"
            # echo -e "\n\nout= $out; whichKeyCP= $whichKeyCP"
            readarray -t  assArrayCP< <(jq -r '.[]' $temp_cp)
            AACP_size=${#assArrayCP[@]}

            if [[ -z "$3" ]]; then #var is empty
                echo "this ran"
                whichKeyCP=0
            else
                counter=1
                for key in ${!assArrayCP[@]}; do
                    # echo "key = $key"
                    if [[ "$key" == "$whichKeyCP" ]]; then
                        # echo -e "  💡$key -> ${assArrayCP[$key]}"
                        whichKeyCP=${assArrayCP[$key]}; break
                    else
                        if [[ $AACP_size == $counter ]]; then
                            echo -e "\nERROR: Unfortunately the key '$whichKeyCP' was not found on the config file.\nFor more information run '$this_scrpt --get-class-paths' or '$this_scrpt -gcp'"
                            whichKeyCP=0
                            exit 1
                        else
                            :
                        fi
                    fi
                    counter=$((counter+1))
                done
            fi

            echo -e "\nCLASSPATH:\t$whichKeyCP\nOUT DIR:\t$out\n"
            recurse_dirs1
            exit 0
            ;;
        -gcp|--get-class-paths)
            get_class_paths
            echo -e "\nNote: you can add/remove more if you want by accessing the configuration file or using\n\t'$this_scrpt --edit-file --add' #for adding a new entry\n\t'$this_scrpt --edit-file --delete' #for deleting entries\nThe configuration file is located at: $temp_cp\n"
            exit 0
            ;;
        -ef|--edit-file)
            mode=$2
            get_class_paths; echo ""
            AACP_size=${#assArrayCP[@]}

            if [ "$mode" == "d" ] || [ "$mode" == "-d" ] || [ "$mode" == "delete" ] || [ "$mode" == "--delete" ]; then #delete mode
                read -p "Which of the aforeshown entries do you want to remove [0-$((AACP_size-1))]?: " entry_to_remove

                if (($entry_to_remove >= 0 && $entry_to_remove <= $((AACP_size-1)))); then
                    counter=1
                    for key in ${!assArrayCP[@]}; do
                        # echo -e "  💡$key -> ${assArrayCP[$key]}"
                        if [[ $key == $entry_to_remove ]]; then
                            #entry was found
                            entry="${assArrayCP[$key]}"
                            # match=`grep -n "$entry" $temp_cp &>/dev/null` #will supress output as well as error messages
                            match=`grep -n "$entry" $temp_cp` #will supress output as well as error messages
                            line_number=$(echo "$match" | cut -c1-1) #gets just the line number of the $match
                            line_wd="${line_number}d"
                            echo -e "\tentry = $entry\n\tmatch = $match\n\tline_number = $line_number\n\tline_wd = $line_wdn\n\tcounter = $counter" #show info
                            read -t 10 -n 1 -s -r -p "Press any key to continue (you have 10 seconds)..." #ask for authorization
                            `sed -i $line_wd $temp_cp` #delete the line

                            case ${?} in
                                0)
                                    echo -e "\n\n-----------------------------------------"
                                    echo -e "Entry removed successfully"
                                    ;;
                                *)
                                    echo -e "\n\nAn error ocurred while removing the entry, check '$this_scrpt -h' for help."
                                    ;;
                            esac


                             # `sed -i.bak ':begin;$!N;s/,\n}/\n}/g;tbegin;P;D' $temp_cp` #remove trailing comma if any #mn: was replaced by a function
                             check_trailing_comma
                            echo ""
                            break;
                        else
                            if [[ $AACP_size == $counter ]]; then
                                echo -e "\nERROR: Unfortunately the key '$entry_to_remove' was not found on the config file.\nFor more information run '$this_scrpt --get-class-paths' or '$this_scrpt -gcp'"
                                exit 1
                            else
                                :
                            fi
                        fi
                        counter=$((counter+1))
                    done
                else
                    echo -e "\nThe number $entry_to_remove is out of range, remember it must be between 0 and $((AACP_size-1)) (according to the options above)"
                fi
            elif [ "$mode" == "a" ] || [ "$mode" == "-a" ] ||[ "$mode" == "add" ] || [ "$mode" == "--add" ]; then #append mode
                read -p "Type or paste the directories' path here: " entry_to_add

                for key in ${!assArrayCP[@]}; do
                    if [[ "$entry_to_add" == "${assArrayCP[$key]}" ]]; then
                        echo -e "Sorry, your desired entry ($entry_to_add) is already on the configuration (.json) file.\nIf you think this is a mistake you can run '$this_scrpt -ef --delete' to remove the 'problematic' entry".
                        exit 1
                    else
                        : # do nothing
                    fi
                done

                readarray -t  assArrayCP< <(jq -r '.[]' $temp_cp)
                AACP_size=${#assArrayCP[@]}

                counter=-1
                for key in ${!assArrayCP[@]}; do
                    # echo -e "  💡$key -> ${assArrayCP[$key]}"
                    counter=$((counter+1))
                done
                counter_plus_three=$((counter+3))
                counter_plus_two=$((counter+2))
                counter_plus_one=$((counter+1))
                final_counter="${counter_plus_three}s"

                read -t 10 -n 1 -s -r -p "Press any key to continue (you have 10 seconds)..." #ask for authorization
                echo "\n"
                cat $temp_cp | jq --arg classpath "$entry_to_add" '. + {"classpath#": $classpath}' > $temp_temp_cp && cat $temp_temp_cp > $temp_cp; echo "" > $temp_temp_cp
                sed -i "$final_counter/"$hashtag"/"$hashtag$counter_plus_one"/g" $temp_cp

                case ${?} in
                    0)
                        echo -e "\n-----------------------------------------"
                        echo -e "Entry added successfully"
                        ;;
                    *)
                        echo -e "\n\nAn error ocurred while adding the entry, check '$this_scrpt -h' for help."
                        ;;
                esac

                check_trailing_comma
            else
                :
            fi

            exit 0
            ;;
        -r|--run)
            file=$2
            final_file=${file/".class"/}
            kotlin $final_file
            exit
            ;;
        *)
            i=0
            file=$1
            #echo "arg 1 = $1" #works
            #it will try to find out/ 18 times, this so as to avoid overloading the ram
            #trying to find an unexistent out/. Of course this number can be increased

            while [[ $i -le 18 ]]; do
                if [[ -d "$OUT_DICT" ]]; then #out found
                    cd $OUT_DICT
                    kotlin $file
                    break
                else #out not found
                    cd ..
                    i=$((i+1))
                fi
            done
            exit 0
            ;;
    esac
    shift
else
    echo -e "This script needs at least one argument to work.\nType '$this_scrpt -h' or '$this_scrpt --help' for help "
fi

