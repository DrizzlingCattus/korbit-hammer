main_path="./src"
kind_of_coins=("btc_krw" "eth_krw" "etc_krw" "xrp_krw")

for coin in ${kind_of_coins[@]}
do
    echo "${coin} process starting..."
    node "${main_path}/index.js" ${coin} &> "./log/${coin}.log" &
done

