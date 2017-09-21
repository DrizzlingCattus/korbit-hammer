const https = require("https");

const { balloon } = require("./compress.js");
const { reloadTime } = require("./time_manager.js");
const { io } = require("./io.js");

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

let dailyData = "";
let prevTime = reloadTime();
const pushRequest = () => {
	// request is instance of http.ClientRequest class. 
	// ClientRequest is instance of writable stream.
	const request = https.request(requestOption, (response) => {
		response.on("data", (stockData) => {
			const time = reloadTime();
			const formattedData = time.getCurrent() + stockData + "\n";
			const path = "./data/" + time.getDate();
			
			// if next day, then compress daily stacked data.
			if(time.isDayPass(prevTime)) {
				balloon(dailyData).deflate().then((result) => {
					result.toFile(path + "_compressed");
				});
			}
			prevTime = time;
			
			dailyData += formattedData;
			// for backup
			io(path).appendFile(formattedData);
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
