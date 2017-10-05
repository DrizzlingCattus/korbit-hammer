const https = require("https");
const path = require("path");

const winston = require("winston");
const { combine, timestamp, label, printf } = winston.format;

const { balloon } = require("./compress.js");
const { reloadTime } = require("./time_manager.js");
const { io } = require("./io.js");
const { makePulseController } = require("./pulse_controller.js");

const PWD_PATH = path.resolve(__dirname) + "/";
const DATA_STORAGE_ROOT_PATH = `${PWD_PATH}../data/`;
const LOG_STORAGE_ROOT_PATH = `${PWD_PATH}../log/`;
const DEBUG_LOG_STORAGE_PATH = `${PWD_PATH}../log/debug/`;
const INFO_LOG_STORAGE_PATH = `${PWD_PATH}../log/info/`;

const SUPPORTED_COINS = ["btc_krw", "etc_krw", "eth_krw", "xrp_krw"];
const TARGET_COIN = ((name_str) => {
	if(SUPPORTED_COINS.includes(name_str)) {
		return name_str;
	}
	// if wrong input, then return default value
	return btc_krw;
})(process.argv[2]);
const DATA_STORAGE_PATH = DATA_STORAGE_ROOT_PATH + TARGET_COIN;

/* start:: initialize winston logger */
const httpLoggerFormat = printf((info) => {
	return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});
const httpLogger = winston.createLogger({
	level: "debug",
	format: combine(
		label({label: TARGET_COIN}),
		timestamp(),
		httpLoggerFormat
	),
	transports: [
		new (winston.transports.File)({
			filename: DEBUG_LOG_STORAGE_PATH + `http_${TARGET_COIN}.log`
		})
	]
});
/* end:: initialize winston logger */

/* start:: initialize http request module */
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
/* end:: initialize http request module */

// initialize interval pulse controller
const requestPulseController = makePulseController(SUPPORTED_COINS.length);

let dailyData = "";
let prevTime = reloadTime();
const pushRequest = () => {
	// request is instance of http.ClientRequest class. 
	// ClientRequest is instance of writable stream.
	const request = https.request(requestOption, (response) => {
		requestPulseController.update(response.statusCode);
		httpLogger.debug(`status code is ${response.statusCode} with ${requestPulseController.getInterval()}ms`);
		
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
			const rawDataPath = DATA_STORAGE_PATH + "/" + time.getDate();
			
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
				
				const compressedDataPath = DATA_STORAGE_PATH + "/" + prevTime.getDate() + "_compressed";
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
