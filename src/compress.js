const fs = require("fs");
const zlib = require("zlib");
const { Readable, PassThrough } = require("stream");

const Promise = require("bluebird");

const { io } = require("./io.js");

const CALLER_PWD = process.cwd() + "/";

const isFileName = (str) => {
	// accept only word or .
	return /^(\w).+/.test(str);
};

const outputApiWrapper = (buffer, innerOption = {}) => {
	const getData = (option) => {
		const encoding = option.encoding || innerOption.encoding;
		const appendString = innerOption.appendString || "";
		return buffer.toString(encoding) + appendString;
	};
	
	const outputApi = {};
	
	outputApi.toString = (encoding) => {
		return getData({encoding: encoding});
	};
	
	outputApi.toAppendFile = (path, option = {}, callback) => {
		const data = getData(option);
		const currentPath = path || "";
		
		io(currentPath).appendFile(data).then((result) => {
			callback && callback(result);
		});
	};
	
	outputApi.toFile = (path, option = {}, callback) => {
		const data = getData(option);
		const currentPath = path || "";
		
		io(currentPath).writeFile(data).then(() => {
			callback && callback(data);
		});
	};
	
	outputApi.appendLF = () => {
		const LF = "\n";
		const changedOption = {...innerOption};
		// protect undefined + "\n"
		if(changedOption.appendString) {
			changedOption.appendString += LF;
		}else {
			changedOption.appendString = LF;
		}
		return outputApiWrapper(buffer, changedOption);
	};
	
	return outputApi;
};

const balloon = (data) => {
	const innerEncoding = "base64";
	return {
		deflate: () => {
			return new Promise((resolve, reject) => {
				zlib.deflate(data, (err, buffer) => {
					if(!err) {
						resolve(outputApiWrapper(buffer, {encoding: innerEncoding}));
					}else {
						throw err;
					}
				});
			});
		}, // function deflate

		inflate: () => {
			return new Promise((resolve, reject) => {
				let buf = data;
				if(typeof buf === "string") {
					buf = Buffer.from(data, innerEncoding);
				}
				zlib.inflate(buf, (err, buffer) => {
					if(!err) {
						resolve(outputApiWrapper(buffer));
					}else {
						throw err;
					}
				});
			});
		} // function inflate
	};
};

balloon.constant = {
	CALLER_PWD: CALLER_PWD
};

module.exports = {balloon};