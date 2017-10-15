// https://bitbucket.org/atlassian/jasmine-http-server-spy
var jasmineHttpServerSpy = require("jasmine-http-server-spy");

var { makeRequest } = require("../src/request.js");


describe("request.js", function() {
	var korbitSpy,
		targetRequest;
	
	beforeAll(function(done) {
		korbitSpy = jasmineHttpServerSpy.createSpyObj("mock-korbit", [
			{
				method: "get",
				url: "/test",
				handlerName: "isListening"
			}
		]);
		korbitSpy.isListening.and.returnValue({
			statusCode: 200,
			body: "request spec testing..."
		});
		korbitSpy.server.start(10012, done);
	});
	
	afterAll(function(done) {
		//fs.unlinkSync();
		// TODO:: check if done method need or not
		korbitSpy.server.stop(done);
		// you can pass jasmine 'done' function as a callback, or use returned promise: 
		// this.httpSpy.server.stop().then(done, done.fail); 
	});
	
	beforeEach(function() {
		targetRequest = makeRequest({
			protocol: "http:",
			hostname: "localhost",
			port: 10012,
			/* need to support other kind of coins */
			path: "/test",
			method: "GET"
		});
	});
	
	afterEach(function() {
		korbitSpy.isListening.calls.reset();
	});
	
	it("should be able to send a request", function(done) {
		targetRequest.send(function() {
			expect(korbitSpy.isListening).toHaveBeenCalled();
			done();
		});
	});
	
	it("should be able to bind status code with function", function(done) {	
		targetRequest.bind(200, function(response, data) {
			expect(data).toBe("request spec testing...");
			done();
		});
		targetRequest.send();
	});
	
	it("should be able to calling function before call the binding function", function(done) {
		var beforeAllCallbackSpy = jasmine.createSpy("beforeAllCallback");
		
		targetRequest.beforeAll(beforeAllCallbackSpy);
		
		targetRequest.bind(200, function(response, data) {
			expect(data).toBe("request spec testing...");	
		});
		targetRequest.send(function() {
			expect(beforeAllCallbackSpy).toHaveBeenCalled();
			done();
		});
	});
	
	it("should be able to calling function after call the binding function", function(done) {
		var afterAllCallbackSpy = jasmine.createSpy("afterAllCallback");
		
		targetRequest.afterAll(afterAllCallbackSpy);
		
		targetRequest.bind(200, function(response, data) {
			expect(data).toBe("request spec testing...");
		});
		targetRequest.send(function() {
			expect(afterAllCallbackSpy).toHaveBeenCalled();
			done();
		});
	});
});

