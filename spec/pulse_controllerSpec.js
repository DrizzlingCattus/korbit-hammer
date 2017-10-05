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
		var first = controller.getInterval(),
			second = controller.update(429);
		expect(first < second).toBeTruthy();
		
		// repeat state cannot affect to interval
		var third = controller.update(429);
		expect(second === third).toBeTruthy();
		
		// state change can affect to interval
		controller.update(200);
		var fourth = controller.update(429);
		expect(third < fourth).toBeTruthy();
	});
});