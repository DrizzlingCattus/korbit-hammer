const fs = require("fs");
const { Readable, Writable } = require("stream");

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
				const out = fs.createWriteStream(path);
				const pass = new Readable();

				pass.push(data);
				pass.push(null);

				pass.pipe(out);

				out.on("finish", () => {
					resolve();
				});
			});
		} // function writeFile
	};
};


module.exports = {io};