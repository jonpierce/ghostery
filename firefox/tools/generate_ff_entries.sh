#!/bin/bash

# Script takes in a list, parses it and creates a list suitable for Ghostery's Javascript
#
#   Example: cat ../tools/20081130.txt | ../tools/generate_ff_entries.sh 50
#

# Check that required args are present
if [ $# -ne 2 ]; then
echo "Usage: `basename $0` {file_name} {starting_nummber}"
  exit -1
fi

COUNTER=$2
FILENAME=$1

cat $FILENAME | while read line; do

#    echo $line
    url=`echo $line | awk -F '(' '{print $1}'`
    name=`echo $line | awk -F '(' '{print $2}' | sed 's/)//'`
    
    echo "gh_find_code[$COUNTER]    = '$url';"
    echo "gh_code_found[$COUNTER]   = '$name';"
    echo "gh_flag_found[$COUNTER]   = false;"
    echo
    
    let COUNTER=COUNTER+1
done




