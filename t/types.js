var assert = require('assert').strict
var cp = require('child_process')
const jsp = require('../index')

describe('Type properties', () => {
	before(() => {
		jsp.setIsProperties();
	})
	describe('Installer', () => {
		it('Sets scalar properties', () => {
			var cmd = "const jsp = require('./index'); jsp.install(); if ((1).isObj || true.isObj) process.exit(1)"
			cp.execFileSync(process.execPath, ['-e', cmd])
		})
	})
	describe('Numbers', () => {
		var x = 0;
		it('is a number', () => {
			assert.ok(x.isNbr)
		})
		it('is a string', () => {
			assert.ok(!x.isStr)
		})
		it('is an array', () => {
			assert.ok(!x.isArr)
		})
		it('is an object', () => {
			assert.ok(!x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'number')
		})
	})
	describe('Strings', () => {
		var x = ''
		it('is a number', () => {
			assert.ok(!x.isNbr)
		})
		it('is a string', () => {
			assert.ok(x.isStr)
		})
		it('is an array', () => {
			assert.ok(!x.isArr)
		})
		it('is an object', () => {
			assert.ok(!x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'string')
		})
	})
	describe('Booleans', () => {
		var x = true
		it('is a number', () => {
			assert.ok(!x.isNbr)
		})
		it('is a string', () => {
			assert.ok(!x.isStr)
		})
		it('is an array', () => {
			assert.ok(!x.isArr)
		})
		it('is an object', () => {
			assert.ok(!x.isObj)
		})
		it('is a boolean', () => {
			assert.ok(x.isBool)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'boolean')
		})
	})
	describe('Arrays', () => {
		var x = []
		it('is a number', () => {
			assert.ok(!x.isNbr)
		})
		it('is a string', () => {
			assert.ok(!x.isStr)
		})
		it('is an array', () => {
			assert.ok(x.isArr)
		})
		it('is an object', () => {
			assert.ok(!x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'array')
		})
	})
	describe('Objects', () => {
		var x = {}
		it('is a number', () => {
			assert.ok(!x.isNbr)
		})
		it('is a string', () => {
			assert.ok(!x.isStr)
		})
		it('is an array', () => {
			assert.ok(!x.isArr)
		})
		it('is an object', () => {
			assert.ok(x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'object')
		})
	})
})
