const reloadTime = (option = {}) => {
	const current = option.staticDate || new Date();
	const timeZone = option.timeZone || "Asia/Seoul";
	const outputApi = {};
	
	// return like 2017-10-3, 08:39:35
	outputApi.getCurrent = () => {
		return current.toLocaleString("ko-KR", {timeZone: timeZone});
	};
	
	// return like 2017-09-05
	outputApi.getDate = () => {
		return outputApi.getCurrent().slice(0, 10).trim();
	};
	
	outputApi.isDayPass = (prevTime) => {
		if(prevTime.getDate() < outputApi.getDate()) {
			return true;
		}
		return false;
	};
	
	return outputApi;
};

module.exports = { reloadTime };