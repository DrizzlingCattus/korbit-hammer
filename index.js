const https = require("https");
const fs = require("fs");

const { balloon } = require("./compress.js");

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
			balloon(stockData)
		});
		
		response.on("error", (err) => {
			
		});
	});
	
	// Finish sending request.
	// If any parts of body are unsent, it flush them.
	// In request.end(callback), callback will be called when request stream is finished.
	request.end(() => {
		console.log("finish request end");
	});
	
	request.on("error", (err) => {
		
	});
	
	return request;
};

setInterval(() => {
	pushRequest()
}, 1000);

// if agent is keepAlive, then sockets may hang open for quite a long time before the server terminates them.
keepAliveAgent.destory();