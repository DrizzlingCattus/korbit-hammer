const { io } = require("./io.js");


const makeFormatWriter = (path = ".") => {
	let dataStoragePath = path;
	
	let writingFormat = (input = "") => {return input;};
	
	const writer = {};
	
	writer.setFormat = (format) => {
		// TODO:: validate format
		if(typeof format !== "function") {
			return false;
		}
		writingFormat = format;
		return true;
	};
	
	// TODO:: could choose io.append or write
	writer.writeWithFormatAsync = (filename, data, formatCb = writingFormat) => {
		const rawDataPath = `${dataStoragePath}/${filename}`;
		const formattedData = formatCb(data);
		
		// for backup
		return io(rawDataPath).appendFile(formattedData);
	};

	return writer;
};

module.exports = { makeFormatWriter };