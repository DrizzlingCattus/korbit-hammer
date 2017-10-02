
const makePulseController = (countOfPulse) => {
	// SUPPORTED_COINS.length === kind of coins count
	const PULSE_INTERVAL_MAX = 2 * (countOfPulse + 1) * 1000;
	const PULSE_INTERVAL_MIN = 1 * 1000;
	const INTERVAL_CACHE_LIMIT = 50;
	const WELL_WORKING_CRITERIA = 30;
	
	const TOO_MANY_REQUEST = 429;
	const OK = 200;
	
	let interval = countOfPulse * 1000;
	const intervalCache = [interval];
	
	const updateCache = (value) => {
		// throw away oldest value
		if(intervalCache.length === INTERVAL_CACHE_LIMIT) {
			intervalCache.shift();
		}
		intervalCache.push(value);
	};
	
	return {
		getInterval: () => {
			return interval;
		},
		update: (state) => {
			if(TOO_MANY_REQUEST === state) {
				interval += 10;
			}
			return interval;
		}
	};
};

module.exports = {makePulseController};