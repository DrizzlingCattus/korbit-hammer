main_path="./src/index"
kind_of_coins=("btc_krw" "eth_krw" "etc_krw" "xrp_krw")

for coin in ${kind_of_coins[@]}
{
    echo "$coin process starting..."
    node $main_path $coin > "./log/$coin.log" &
}

