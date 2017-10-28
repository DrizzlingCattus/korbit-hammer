const http = require("http");
const https = require("https");


function addPerformanceRelatedOption(protocol, option) {
	const ret = option;
	ret.agent = new protocol.Agent({
		keepAlive: true
	});
	return ret;
}

function parseProtocol(inputString) {
	if(inputString == "http:" ||
		inputString === undefined) {
		return http;
	}else if(inputString == "https:" ||
			inputString == "https") {
		return https;
	}else {
		throw new Error(`Error! ${inputString} is not a supported protocol.`);
	}
}


const makeRequest = (option) => {
	const protocol = parseProtocol(option.protocol);
	const recreatedOption = addPerformanceRelatedOption(protocol, option);
	
	let beforeAllCallback = null;
	let afterAllCallback = null;
	const statusCallbackHashmap = {};

	const pushRequest = (finalize = () => {}) => {
		// request is instance of http.ClientRequest class. 
		// ClientRequest is instance of writable stream.
		const request = protocol.request(recreatedOption, (response) => {
			response.setEncoding("utf8");
			response.on("data", (chunck) => {
				beforeAllCallback && beforeAllCallback(response);
				if(typeof statusCallbackHashmap[response.statusCode] === "function") {
					statusCallbackHashmap[response.statusCode](response, chunck);
				}
				afterAllCallback && afterAllCallback(response);
			});

			response.on("end", () => {
				finalize();
			});
			
			response.on("error", (err) => {
				console.log("response error occur :: " + err.stack);
				throw err;
			});
		});
		
		// With http.request() one must always call req.end() to signify the end of the request
		// even if there is no data being written to the request body.
		// If any parts of body are unsent, it flush them.
		// In request.end(callback), callback will be called when request stream is finished.
		request.end(() => {
			// console.log("finish request end");
		});

		request.on("error", (err) => {
			console.log("request error occur :: " + err.stack);
			throw err;
		});
		
		return request;
	};
	return {
		bind: (statusCode, callback) => {
			if(typeof callback === "function" &&
				typeof statusCode === "number") {
				statusCallbackHashmap[statusCode] = callback;
			}
		},
		
		send: (finalize) => {
			pushRequest(finalize);
		},
		
		beforeAll: (callback) => {
			if(typeof callback !== "function") {
				return false;
			}
			beforeAllCallback = callback;
			return true;
		},
		
		afterAll: (callback) => {
			if(typeof callback !== "function") {
				return false;
			}
			afterAllCallback = callback;
			return true;
		},
		
		getAgent: () => {
			return recreatedOption.agent;
		}
	};
};

module.exports = { makeRequest };