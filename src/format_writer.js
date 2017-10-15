const { io } = require("./io.js");

const makeFormatWriter = (path = ".") => {
	let dataStoragePath = path;
// 	let rawDataPath = `${dataStoragePath}/${time.getDate()}`;
	
	let writingFormat = (input = "") => {return input};
	let dailyData = "";
	
	const writer = {};
	
	writer.setFormat = (format) => {
		// TODO:: validate format
		if(typeof format !== "function") {
			return false;
		}
		writingFormat = format;
		return true;
	}
	
	// TODO:: could choose io.append or write
	writer.writeWithFormatAsync = (filename, data, formatCb = writingFormat) => {
		const rawDataPath = `${dataStoragePath}/${filename}`;
		const formattedData = formatCb(data);
		// in memory method... not good..
		dailyData += formattedData;
		// for backup
		return io(rawDataPath).appendFile(formattedData);
	};
	
	writer.popDailyData = () => {
		const ret = dailyData;
		dailyData = "";
		return ret;
	}

	return writer;
}

module.exports = { makeFormatWriter };