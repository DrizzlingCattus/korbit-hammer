const reloadTime = function(option = {}) {
	const current = option.staticDate || new Date();
	const timeZone = option.timeZone || "Asia/Seoul";
	const outputApi = {};

	// return like 2017-09-05
	outputApi.getDate = () => {
		return current.toJSON().slice(0, 10);
	};
	
	// return like 9/6/2017, 9:39:35 AM
	outputApi.getCurrent = () => {
		return current.toLocaleString("ko-KR", {timeZone: timeZone});
	};
	
	outputApi.isDayPass = (prevTime) => {
		if(prevTime.getDate() < outputApi.getDate()) {
			return true;
		}
		return false;
	};
	
	return outputApi;
};

module.exports = {reloadTime};