log_files=( $(find ./log/ -maxdepth 1 -type f) )

for file in ${log_files[@]}
do
	tail -f ${file} &
done 