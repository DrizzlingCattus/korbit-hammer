const https = require("https");

const { balloon } = require("./compress.js");
const { reloadTime } = require("./time_manager.js");
const { io } = require("./io.js");
const { makePulseController } = require("./pulse_controller.js");

const SUPPORTED_COINS = ["btc_krw", "etc_krw", "eth_krw", "xrp_krw"];
const TARGET_COIN = ((name_str) => {
	if(SUPPORTED_COINS.includes(name_str)) {
		return name_str;
	}
	// if wrong input, then return default value
	return btc_krw;
})(process.argv[2]);
const DATA_STORAGE_DIR = "./data/" + TARGET_COIN;

const requestOption = {
	hostname: "api.korbit.co.kr",
	port: 443,
	/* need to support other kind of coins */
	path: "/v1/ticker/detailed?currency_pair=" + TARGET_COIN,
	method: "GET"
};
const keepAliveAgent = new https.Agent({
	keepAlive: true
});
requestOption.agent = keepAliveAgent;

const requestPulseController = makePulseController(SUPPORTED_COINS.length);
let dailyData = "";
let prevTime = reloadTime();
const pushRequest = () => {
	// request is instance of http.ClientRequest class. 
	// ClientRequest is instance of writable stream.
	const request = https.request(requestOption, (response) => {
		requestPulseController.update(response.statusCode);
		response.on("data", (stockData) => {
			if(response.statusCode === 429) {
				// Too Many Request
				// TODO::attach Logger
				// slowDownRequestRate();
				return;
			}else if(response.statusCode === 403) {
				// Bad Gateway
				// TODO::attach Logger
				return;
			}
			const time = reloadTime();
			const formattedData = time.getCurrent() + " " + stockData + "\n";
			const rawDataPath = DATA_STORAGE_DIR + "/" + time.getDate();
			
			// if next day, then compress daily stacked data.
			if(time.isDayPass(prevTime)) {
				// FOR DEBUG
				try {
					if(time.getDate() === prevTime.getDate()) {
						new Error("time ::" + time.getDate() + "prevTime ::" + prevTime.getDate());
					}
				}catch (e) {
					console.log(e);
				}
				
				const compressedDataPath = DATA_STORAGE_DIR + "/" + prevTime.getDate() + "_compressed";
				balloon(dailyData).deflate().then((result) => {
					result.toFile(compressedDataPath);
				});
			}
			prevTime = time;
			
			// in memory method... not good..
			dailyData += formattedData;
			// for backup
			io(rawDataPath).appendFile(formattedData);
		});
		
		response.on("error", (err) => {
			// TODO:: Attach logger
		});
	});
	
	// Finish sending request.
	// If any parts of body are unsent, it flush them.
	// In request.end(callback), callback will be called when request stream is finished.
	request.end(() => {
		//console.log("finish request end");
	});
	
	request.on("error", (err) => {
		// TODO:: Attach logger
	});
	
	return request;
};

setInterval(() => {
	pushRequest();
}, requestPulseController.getInterval());

process.on("exit", (code) => {
	// if agent is keepAlive, then sockets may hang open for quite a long time 
	// before the server terminates them.
	keepAliveAgent.destory();
	console.log("exit code is " + code);
});
