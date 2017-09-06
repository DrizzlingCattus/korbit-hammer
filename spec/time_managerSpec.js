var { reloadTime } = require("../time_manager.js");

describe("time_manager.js", function() {
	var time;
	
	beforeEach(function() {
		time = reloadTime();
	});
	
	it("should be able to get current time", function() {
		expect(time.getCurrent()).not.toBeNull();
		expect(time.getCurrent()).not.toBeUndefined();
		expect(function() {
			time.getCurrent();
		}).not.toThrow();
		expect(function() {
			time.getCurrent();
		}).not.toThrowError();
	});
	
	it("should be able to get current date", function() {
		expect(time.getDate()).not.toBeNull();
		expect(time.getDate()).not.toBeUndefined();
		expect(function() {
			time.getDate();
		}).not.toThrow();
		expect(function() {
			time.getDate();
		}).not.toThrowError();
	});
});