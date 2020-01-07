#!/bin/bash



for file in *.txt ; do
    newfile=$(echo $file | cut -d"." -f-1 | cut -d"(" -f-1| cut -d" " -f-1).txt
mv "$file" "./$newfile"
echo $(echo $file | cut -d"(" -f-1| cut -d" " -f-1).txt
done
