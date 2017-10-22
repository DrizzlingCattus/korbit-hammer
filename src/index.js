const path = require("path");

const winston = require("winston");
const { combine, timestamp, label, printf } = winston.format;

const { balloon } = require("./compress.js");
const { reloadTime } = require("./time_manager.js");
const { makePulseController } = require("./pulse_controller.js");
const { makeFormatWriter } = require("./format_writer.js");
const { makeRequest } = require("./request.js");

const PWD_PATH = path.resolve(__dirname) + "/";
const DATA_STORAGE_ROOT_PATH = `${PWD_PATH}../data/`;
const LOG_STORAGE_ROOT_PATH = `${PWD_PATH}../log/`;
const DEBUG_LOG_STORAGE_PATH = `${LOG_STORAGE_ROOT_PATH}debug/`;
const INFO_LOG_STORAGE_PATH = `${LOG_STORAGE_ROOT_PATH}info/`;
const ERROR_LOG_STORAGE_PATH = `${LOG_STORAGE_ROOT_PATH}error/`;

const SUPPORTED_COINS = ["btc_krw", "etc_krw", "eth_krw", "xrp_krw"];
const TARGET_COIN = SUPPORTED_COINS.includes(process.argv[2]) ? process.argv[2] : "unknown_coin";
const DATA_STORAGE_PATH = DATA_STORAGE_ROOT_PATH + TARGET_COIN;

/* start:: initialize winston logger */
const defaultFormat = printf((info) => {
	return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});
const httpLogger = winston.createLogger({
	format: combine(
		label({label: TARGET_COIN}),
		timestamp(),
		defaultFormat
	),
	transports: [
		new (winston.transports.File)({
			level: "debug",
			filename: DEBUG_LOG_STORAGE_PATH + `http_${TARGET_COIN}.log`
		}),
		new (winston.transports.File)({
			level: "error",
			filename: ERROR_LOG_STORAGE_PATH + `http_${TARGET_COIN}.log`
		})
	]
});
/* end:: initialize winston logger */

const compressToFileAsync = (filename = "noname_compressed", data = "") => {
	balloon(data).deflate().then((result) => {
		result.toFile(`${DATA_STORAGE_PATH}/${filename}_compressed`);
	});
};

// initialize interval pulse controller
const requestPulseController = makePulseController(SUPPORTED_COINS.length);

const makeTimerUpdater = (updateTime, toDoListCallback) => {
	let intervalId = null;
	return () => {
		if(intervalId !== null) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(() => {
			toDoListCallback();
			//stockRequest.send();
		}, updateTime());
	};
};

/* start:: initialize http request module */
const requestOption = {
	protocol: "https:",
	hostname: "api.korbit.co.kr",
	port: 443,
	/* need to support other kind of coins */
	path: `/v1/ticker/detailed?currency_pair=${TARGET_COIN}`,
	method: "GET"
};

const stockWriter = makeFormatWriter(DATA_STORAGE_PATH);
const stockRequest = makeRequest(requestOption);
let currTime = null;
let prevTime = reloadTime();
let prevState = null;
// TODO :: need to get agent object for process kill
// const keepAliveAgent = new https.Agent({
// 	keepAlive: true
// });
// requestOption.agent = keepAliveAgent;

const updateStockRequestInterval = makeTimerUpdater(() => {
	return requestPulseController.getInterval();
}, () => {
	stockRequest.send();
});

stockRequest.beforeAll((response) => {
	// TODO :: refactoring this.. performance inefficiency
	requestPulseController.update(response.statusCode);
	currTime = reloadTime();
});

stockRequest.afterAll((response) => {
	prevTime = currTime;
	prevState = response.statusCode;
});

// 200 - OK
stockRequest.bind(200, (response, stockData) => {
	if(currTime.isDayPass(prevTime)) {
		compressToFileAsync(prevTime.getDate(), stockWriter.popDailyData());
	}
	stockWriter.setFormat((data) => {
		return `${currTime.getCurrent()} ${data}\n`;
	});
	stockWriter.writeWithFormatAsync(currTime.getDate(), stockData);
});

// 429 - TOO MANY REQUEST
stockRequest.bind(429, (response) => {
	// if we detect too many request, then control time interval once
	// 429 response can be found several times continuously
	// so protect calling update function several times.
	if(prevState !== 429) {
		httpLogger.debug(`status code is ${response.statusCode} with ${requestPulseController.getInterval()}ms`);
		updateStockRequestInterval();
	}
});

// 403 - BAD GATEWAY
stockRequest.bind(403, (response, chunck) => {
	if(prevState !== 403) {
		httpLogger.error(`occur 403 BAD GATEWAY - ${response}`);
	}
});
/* end:: initialize http request module */

// run stock crawler
updateStockRequestInterval();

process.on("uncaughtException", function (err) {
	console.error("process uncaughtException error occur!");
	httpLogger.error(err.stack);
});

process.on("exit", (code) => {
	// if agent is keepAlive, then sockets may hang open for quite a long time 
	// before the server terminates them.
	// keepAliveAgent.destory();
	console.log("exit code is " + code);
});
