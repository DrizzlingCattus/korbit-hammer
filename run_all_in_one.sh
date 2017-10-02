echo "btc_krw process starting..."
node ./index btc_krw > ./log/btc_krw.log &

echo "eth_krw process starting..."
node ./index eth_krw > ./log/eth_krw.log &

echo "etc_krw process starting..."
node ./index etc_krw > ./log/etc_krw.log &

echo "xrp_krw process starting..."
node ./index xrp_krw > ./log/xrp_krw.log &