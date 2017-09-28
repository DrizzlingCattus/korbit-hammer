echo "btc_krw process starting..."
node ./index btc_krw &>/dev/null

echo "eth_krw process starting..."
node ./index eth_krw &>/dev/null

echo "etc_krw process starting..."
node ./index etc_krw &>/dev/null

echo "xrp_krw process starting..."
node ./index xrp_krw &>/dev/null