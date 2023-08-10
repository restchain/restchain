#!/bin/bash
#input="/path/to/txt/file"
input=$1
echo $input
while IFS= read -r line
do
  echo -n "Run # $line :: time => ";
  curl -o /dev/null -s -w %{time_total}\\n  $line
done < "$input"