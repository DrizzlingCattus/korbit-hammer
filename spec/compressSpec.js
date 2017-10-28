var fs = require("fs");

var Promise = require("bluebird");

var { balloon } = require("../src/compress.js");


function compressBeforeEach(data) {
	var compressedBalloon = balloon(data).deflate(),
		compressed = null;

	// compress should be async for performance, so it is implemented by Promise.
	return compressedBalloon.then(function(result) {
		compressed = result.toString();
		expect(compressed).not.toBe(data);
		return balloon(compressed).inflate();
	});
}

describe("compress.js", function() {
	var cwd,
			plainData,
			plainFile,
			zipFile;
	
	beforeEach(function() {
		cwd = process.cwd() + "/";
		plainData = "Dream is my reality and the only kinds of real fantasy.";
		plainFile = "compress_input.txt";
		zipFile = "compress_input.gz";
	});
	
	it("should be able to compress & uncompress small size data", function(done) {
		compressBeforeEach(plainData).then(function(result) {
			expect(result.toString()).toBe(plainData);
 			done();
		});
	});
	
	it("should be able to save the result in a single file", function(done) {
		compressBeforeEach(plainData).then(function(result) {
			result.toFile(plainFile, {}, function(data) {
				fs.unlinkSync(cwd + plainFile);
				done();
			});
		});
	});
	
	it("should be able to append the result in a single file", function(done) {
		compressBeforeEach(plainData).then(function(result) {
			result.toAppendFile(plainFile, {}, function(data) {
				fs.unlinkSync(cwd + plainFile);
				done();
			});
		});
	});
	
	it("should be able to tell path from the file name", function(done) {
		// should be check file name
		var plainPath = cwd + plainFile;
		compressBeforeEach(plainData).then(function(result) {
			result.toFile(plainFile, {}, function(data) {
				fs.access(plainPath, function(err) {
					if(err) {
						fail("There is no access for plainPath!");
					}else {
						fs.unlinkSync(plainPath);
						done();
					}
				});
			});
		});
		
		// should be check path
		var mainPath = process.cwd() + plainFile;
		compressBeforeEach(plainData).then(function(result) {
			result.toFile(mainPath, {}, function(data) {
				fs.access(mainPath, function(err) {
					if(err) {
						fail("There is no access for mainPath!");
					}else {
						fs.unlinkSync(mainPath);
						done();
					}
				});
			});
		});
	});
	
	it("should be able to add special char in outputApi", function(done) {
		compressBeforeEach(plainData).then(function(result) {
			expect(result.appendLF().toString().slice(-1)).toBe("\n");
 			done();
		});
	});
});