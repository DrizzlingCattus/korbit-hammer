const fs = require("fs");
const { Readable } = require("stream");

const Promise = require("bluebird");

const io = (path) => {
	return {
		readFile: () => {
			return new Promise((resolve, reject) => {
				const inp = fs.createReadStream(path);
				let result = "";
				
				inp.on("error", (err) => {
					console.log("error while reading " + path + " file.");
					reject();
				});
				
				inp.on("data", (data) => {
					result += data;
				});
				
				// Note: The 'end' event will not be emitted unless the data is completely consumed.
				// This can be accomplished by switching the stream into flowing mode, 
				// or by calling stream.read() repeatedly until all data has been consumed.
				inp.on("end", () => {
					resolve(result);
				});
			});
		}, // function readFile
		
		writeFile: (data) => {
			return new Promise((resolve, reject) => {
				// Note that it is unsafe to use fs.writeFile multiple times on the same file without waiting for the callback. 
				// For this scenario, fs.createWriteStream is strongly recommended.
				// fs.writeFile(path, this.toString(option.encoding), callback);
				const out = fs.createWriteStream(path);
				const pass = new Readable();

				pass.push(data);
				pass.push(null);

				// By default, stream.end() is called on the destination Writable stream
				// when the source Readable stream emits 'end', so that the destination is no longer writable.
				pass.pipe(out);

				out.on("finish", () => {
					resolve();
				});
			});
		}, // function writeFile
		
		appendFile: (data) => {
			return new Promise((resolve, reject) => {
				fs.appendFile(path, data, (err) => {
					if(err) {
						reject(err);
					}else {
						resolve(data);
					}
				});
			});
		} // function appendFile
	};
};


module.exports = {io};