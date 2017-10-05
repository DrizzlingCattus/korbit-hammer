var { makePulseController } = require("../src/pulse_controller.js");


describe("pulse_controller.js", function() {
	var controller;
	
	beforeEach(function() {
		controller = makePulseController(5);
	});
	
	it("should be able to get interval", function() {
		var interval = controller.getInterval();
		expect(typeof interval === "number").toBeTruthy();
	});
	
	it("should be able to increase interval", function() {
		var first = controller.getInterval();
		
		controller.update(429);
		
		var second = controller.getInterval();
		
		expect(first < second).toBeTruthy();
		
		controller.update(429);
		
		var third = controller.getInterval();
		
		expect(second < third).toBeTruthy();
	});
});