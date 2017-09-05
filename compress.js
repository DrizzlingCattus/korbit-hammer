const fs = require("fs");
const zlib = require("zlib");
const { Readable, PassThrough } = require("stream");

const Promise = require("bluebird");

const CALLER_PWD = process.env.OLDPWD + "/" || process.cwd() + "/";

const isFileName = (str) => {
	// accept only word or .
	return /^(\w).+/.test(str);
};

const outputApiWrapper = (buffer, innerOption = {}) => {
	const outputApi = {};
	
	outputApi.toString = (encoding) => {
		return buffer.toString(encoding || innerOption.encoding);
	};
	
	outputApi.toAppendFile = (path, option = {}, callback) => {
		const data = buffer.toString(option.encoding);
		let currentPath = path || "";
		
		currentPath = isFileName(path)? CALLER_PWD + path : path;
		
		fs.appendFile(currentPath, data, (err) => {
			if(err) {
				throw err;
			}else {
				callback(data);
			}
		});
	};
	
	outputApi.toFile = (path, option = {}, callback) => {
		const data = buffer.toString(option.encoding);
		let currentPath = path || "";
		currentPath = isFileName(path)? CALLER_PWD + path : path;
		// Note that it is unsafe to use fs.writeFile multiple times on the same file without waiting for the callback. 
		// For this scenario, fs.createWriteStream is strongly recommended.
		// fs.writeFile(path, this.toString(option.encoding), callback);
		const out = fs.createWriteStream(currentPath);
		const pass = new Readable();

		pass.push(data);
		pass.push(null);

		// By default, stream.end() is called on the destination Writable stream
		// when the source Readable stream emits 'end', so that the destination is no longer writable. 
		pass.pipe(out);

		out.on("finish", () => {
			callback(data);
		});

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