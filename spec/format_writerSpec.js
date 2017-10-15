var fs = require("fs");

var { makeFormatWriter } = require("../src/format_writer.js")

describe("format_writer.js", function() {
	var writer,
		tobeSavedData,
		tobeSavedFile;
	
	beforeEach(function() {
		writer = makeFormatWriter();
		tobeSavedData = "test";
		tobeSavedFile = "test_dump";
	});
	
	afterAll(function() {
		fs.unlinkSync(tobeSavedFile);
	})
	
	it("should be able to target with right format", function(done) {
		var combineFormat = function(input) {
			var ret = input || "";
			return "First=" + ret;
		};
		var endWriting = writer.writeWithFormatAsync(tobeSavedFile, tobeSavedData, combineFormat);
		endWriting.then(function(result) {
			expect(result).toBe(combineFormat(tobeSavedData));
			done();
		});
	});
	
	it("should be able to set format with setFormat method", function(done) {
		var combineFormat = function(input) {
			var ret = input || "";
			return "Second=" + ret;
		}
		writer.setFormat(combineFormat);
		var endWriting = writer.writeWithFormatAsync(tobeSavedFile, tobeSavedData);
		endWriting.then(function(result) {
			expect(result).toBe(combineFormat(tobeSavedData));
			done();
		});
	});
	
	it("should be able to pop & clean daily data", function(done) {
		var endWriting = writer.writeWithFormatAsync(tobeSavedFile, tobeSavedData);
		endWriting.then(function(result) {
			expect(writer.popDailyData()).toBe(result);
			expect(writer.popDailyData()).toBe("");
			done();
		});
	});
});