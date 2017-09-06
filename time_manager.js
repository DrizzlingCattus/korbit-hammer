const reloadTime = function(option = {}) {
	const current = new Date();
	const timeZone = option.timeZone || "Asia/Seoul";
	return {
		// return like 2017-09-05
		getDate: () => {
			return current.toJSON().slice(0, 10);
		},
		// return like 9/6/2017, 9:39:35 AM
		getCurrent: () => {
			return current.toLocaleString("ko-KR", {timeZone: timeZone});
		}
	};
};

module.exports = {reloadTime};