const https = require("https");
const fs = require("fs");

const { balloon } = require("./compress.js");
const { reloadTime } = require("./time_manager.js");

const storagePath = "/home/hentleman/workspace/web/korbit-automate/data/";
const requestOption = {
	hostname: "api.korbit.co.kr",
	port: 443,
	/* need to support other kind of coins */
	path: "/v1/ticker/detailed?currency_pair=btc_krw",
	method: "GET"
};
const keepAliveAgent = new https.Agent({
	keepAlive: true
});
requestOption.agent = keepAliveAgent;

const pushRequest = () => {
	// request is instance of http.ClientRequest class. 
	// ClientRequest is instance of writable stream.
	const request = https.request(requestOption, (response) => {
		response.on("data", (stockData) => {
			const time = reloadTime();
			const formattedData = time.getCurrent() + stockData;
			const path = "./data/" + time.getDate();
			balloon(formattedData).deflate().then((result) => {
				result.appendLF().toAppendFile(path);
			});
		});
		
		response.on("error", (err) => {
			// TODO:: Attach logger
		});
	});
	
	// Finish sending request.
	// If any parts of body are unsent, it flush them.
	// In request.end(callback), callback will be called when request stream is finished.
	request.end(() => {
		console.log("finish request end");
	});
	
	request.on("error", (err) => {
		// TODO:: Attach logger
	});
	
	return request;
};

setInterval(() => {
	pushRequest();
}, 1000);

process.on("exit", (code) => {
	// if agent is keepAlive, then sockets may hang open for quite a long time before the server terminates them.
	keepAliveAgent.destory();
	console.log("exit code is " + code);
});
