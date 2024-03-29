const os = require('os')
const fs = require('fs')
const assert = require('assert').strict
const jsp = require('../index')

describe('Strings', () => {
	before(() => {
		jsp.install('string')
	})
	describe('translate', () => {
		it('Base case', () => {
			var input = "john's response: sure!"
			var expected = "john;s rEsponsE# surE%"
			assert.equal(input.tr("':!e", ";#%E"), expected)
		})
	})
	describe('sprintf', () => {
		it('Base case', () => {
			var actual = 'math: %{a} + %{b}'.sprintf({a: 1, b: 2})
			assert.equal(actual, 'math: 1 + 2')
		})
		it('Missing parameters', () => {
			var actual = 'math: %{a} + %{b}'.sprintf()
			assert.equal(actual, 'math: %{a} + %{b}')
		})
		it('String parameter', () => {
			var actual = 'math: %{a} + %{a}'.sprintf('')
			assert.equal(actual, 'math: %{a} + %{a}')
		})
		it('Multiple instances', () => {
			var actual = 'math: %{a} + %{a}'.sprintf({a: 1})
			assert.equal(actual, 'math: 1 + 1')
		})
		it('handles array data', () => {
			var actual = 'alle %s werden %s'.sprintf(['menschen', 'brüder'])
			var expected = 'alle menschen werden brüder'
			assert.equal(actual, expected)
		})
		it('array parameter contains non-string data', () => {
			var actual = 'buy %s bar of soap'.sprintf([1])
			var expected = 'buy 1 bar of soap'
			assert.equal(actual, expected)
		})
		it('skips objects in array', () => {
			var actual = 'buy %s bar of %s'.sprintf([{a:1}, 1, 'soap'])
			var expected = 'buy 1 bar of soap'
			assert.equal(actual, expected)
		})
	})
	describe('chomp', () => {
		it('Niladic', () => {
			var input = 'testing\n'
			var expected = 'testing'
			assert.equal(input.chomp(), expected)
		})
		it('String argument', () => {
			var input = 'testing'
			var expected = 'testin'
			assert.equal(input.chomp('g'), expected)
		})
		it('Dot support', () => {
			assert.equal('testing.js'.chomp('.js'), 'testing', 'Chomp should succeed')
			assert.equal('testing_js'.chomp('.js'), 'testing_js', 'Chomp should fail')
		})
		it('Regular expression', () => {
			var input = 'testing.js'
			var expected = 'testing'
			assert.equal(input.chomp(/\.js/), expected)
		})
		it('Explicit terminal', () => {
			var input = 'testing.js'
			var expected = 'testing'
			assert.equal(input.chomp(/\.js$/), expected)
		})
	})
	describe('replaceall', () => {
		it('Base case', () => {
			var input = 'me and you and him and her'
			var expected = 'me or you or him or her'
			assert.equal(input.replaceall('and', 'or'), expected)
		})
	})
	describe('unindent', () => {
		it('Pre-trimmed', () => {
			var actual = 'x'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims leading spaces', () => {
			var actual = '   x'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims leading tabs', () => {
			var actual = '\t\tx'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims mixed whitespace', () => {
			var actual = ' \tx'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims trailing whitespace', () => {
			var actual = ' \tx\t\t  '.unindent()
			assert.equal(actual, 'x')
		})
		it('Multi-line - No trailing', () => {
			var actual = `
			x
			y`;
			assert.equal(actual.unindent(), 'x\ny')
		})
		it('Multi-line - Trailing', () => {
			var actual = `
			x
			y
			`;
			assert.equal(actual.unindent(), 'x\ny')
		})
		it('Multi-line - Respects embedding', () => {
			var actual = `
			x
			\ty
			  z
			`;
			assert.equal(actual.unindent(), 'x\n\ty\n  z')
		})
		it('Multi-line - Does not manage outdentions', () => {
			var actual = `
			  x
			y
			`;
			assert.equal(actual.unindent(), 'x\n\t\t\ty')
		})
	})
	describe('heredoc', () => {
		it('Joins multilines', () => {
			var actual = 'line1\nline2\nline3'.heredoc()
			assert.equal(actual, 'line1 line2 line3')
		})
		it('Respects double lines', () => {
			var actual = 'line1\n\nline2\n\nline3'.heredoc()
			assert.equal(actual, 'line1 \nline2 \nline3')
		})
	})
	describe('keyval', () => {
		it('Base case', () => {
			var input = 'a=1\nb=2\nc=string'
			var actual = input.keyval()
			var expected = {a:1, b:2, c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Supports key separator', () => {
			var input = 'a:1\nb:2\nc:string'
			var actual = input.keyval(':')
			var expected = {a:1, b:2, c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Supports line separator', () => {
			var input = 'a:1;b:2;c:string'
			var actual = input.keyval(':', ';')
			var expected = {a:1, b:2, c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Can quote all fields', () => {
			var input = 'a=1;b=2;c=string'
			var actual = input.keyval('=', ';', true)
			var expected = {a:"1", b:"2", c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Manages empty fields', () => {
			var input = 'a=1;b=2;;c=string'
			var actual = input.keyval('=', ';', true)
			var expected = {a:"1", b:"2", c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Produces empty keys', () => {
			var input = 'a=1;b=;c=string'
			var actual = input.keyval('=', ';', true)
			var expected = {a:"1", b:'', c:"string"}
			assert.deepEqual(actual, expected)
		})
	})
	describe('quoting', () => {
		it('Base case', () => {
			var actual = "test".q()
			assert.equal(actual, "'test'")
		})
		it('Prequoted', () => {
			var actual = "'test'".q()
			assert.equal(actual, "'test'")
		})
		it('Embedded quotes protected', () => {
			var actual = "test's failure".q()
			assert.equal(actual, "'test's failure'")
		})
		it('Respects whitespace', () => {
			var actual = "\ttest's failure  ".q()
			assert.equal(actual, "'\ttest's failure  '")
		})
		it('Double quotes', () => {
			var actual = 'test'.q('"')
			assert.equal(actual, '"test"')
		})
		it('Supports sets', () => {
			var actual = 'test'.q('{}')
			assert.equal(actual, '{test}')
		})
		it('Supports square brackets', () => {
			var actual = 'test'.q('[]')
			assert.equal(actual, '[test]')
		})
		it('Empty quotes', () => {
			var actual = 'test'.q("")
			assert.equal(actual, '"test"')
		})
	})
	describe('case functions', () => {
		var s = 'in a littLe bOOk';
		it('Uppercases', () => {
			var actual = s.uc()
			var expected = s.toUpperCase()
			assert.equal(actual, expected)
		})
		it('Lowercases', () => {
			var actual = s.lc()
			var expected = s.toLowerCase()
			assert.equal(actual, expected)
		})
		it('Titlecases', () => {
			var actual = s.tc()
			var expected = 'In a Little Book'
			assert.equal(actual, expected)
		})
	})
	describe('list management', () => {
		it('array - base case', () => {
			var expected = ['ett', 'två', 'tre']
			assert.deepEqual('ett|två|tre'.arr(), expected, 'Pipes failed')
			assert.deepEqual('ett,två,tre'.arr(), expected, 'Commas failed')
			assert.deepEqual('ett;två;tre'.arr(), expected, 'Semicolons failed')
			assert.deepEqual('ett.två.tre'.arr(), expected, 'Dots failed')
			assert.deepEqual('ett\ttvå\ttre'.arr(), expected, 'Tabs failed')
			assert.deepEqual('ett\ntvå\ntre'.arr(), expected, 'Newlines failed')
		})
		it('array - alias', () => {
			var expected = ['ett', 'två', 'tre']
			assert.deepEqual('ett|två|tre'.r(), expected, 'Pipes failed')
		})
		it('array - custom delimiter', () => {
			var expected = ['ett', 'två', 'tre']
			assert.deepEqual('ett två tre'.arr(' '), expected)
		})
		it('array - with callback', () => {
			var n = 0, expected = ['ett', 'två']
			'ett/två'.arr('/', v => {
				assert.ok(expected.indexOf(v) > -1); n++;
			})
			assert.equal(n, 2, 'Iteration count failed')
		})
		it('array - with only callback', () => {
			var n = 0, expected = ['ett', 'två']
			'ett/två'.arr(v => {
				assert.ok(expected.indexOf(v) > -1); n++;
			})
			assert.equal(n, 2, 'Iteration count failed')
		})
		it('splitn - base case', () => {
			var actual = 'ett/två/tre'.splitn();
			var expected = ['ett', 'två/tre']
			assert.deepEqual(actual, expected)
		})
		it('splitn - invalid segment length', () => {
			var actual = 'ett/två/tre/fyra/fem'.splitn(1);
			var expected = ['ett/två/tre/fyra/fem']
			assert.deepEqual(actual, expected)
		})
		it('splitn - explicit number', () => {
			var actual = 'ett/två/tre/fyra/fem'.splitn(3);
			var expected = ['ett', 'två', 'tre/fyra/fem']
			assert.deepEqual(actual, expected)
		})
		it('splitn - segment deficit', () => {
			var actual = 'ett/två/tre'.splitn(4);
			var expected = ['ett', 'två', 'tre']
			assert.deepEqual(actual, expected)
		})
		it('splitn - with delimiters', () => {
			var actual = 'ett  två  tre'.splitn(' ');
			var expected = ['ett', 'två  tre']
			assert.deepEqual(actual, expected)
		})
		it('nth - empty', () => {
			var input = ''
			var actual = input.nth(0)
			assert.equal(actual, '')
		})
		it('nth - base case', () => {
			var input = 'ett/två/tre'
			assert.equal(input.nth(0), 'ett')
			assert.equal(input.nth(1), 'två')
			assert.equal(input.nth(2), 'tre')
		})
		it('nth - index exceeds', () => {
			var input = 'ett/två/tre'
			assert.equal(input.nth(3), '')
		})
		it('nth - negative index', () => {
			var input = 'ett/två/tre'
			assert.equal(input.nth(-1), 'tre')
			assert.equal(input.nth(-2), 'två')
		})
		it('nth - delimiter defaults', () => {
			assert.equal('ett|två|tre'.nth(0), 'ett', 'Pipes failed')
			assert.equal('ett,två,tre'.nth(0), 'ett', 'Commas failed')
			assert.equal('ett;två;tre'.nth(0), 'ett', 'Semicolons failed')
			assert.equal('ett.två.tre'.nth(0), 'ett', 'Dots failed')
			assert.equal('ett\ttvå\ttre'.nth(0), 'ett', 'Tabs failed')
			assert.equal('ett\ntvå\ntre'.nth(0), 'ett', 'Newlines failed')
			assert.equal('ett två tre'.nth(0), 'ett', 'Spaces failed')
		})
		it('nth - delimiter options', () => {
			assert.equal('ett#två#tre'.nth(0, '#'), 'ett')
		})
		it('nth - empty elements', () => {
			assert.equal('ett//två///tre'.nth(1), 'två')
		})
	})
	describe('extracts regular expression', () => {
		var re = /\((.*?)\)/
		it('base case', () => {
			assert.equal('test (case)'.extract(re), 'case')
		})
		it('handles mismatch', () => {
			var input = 'test [case]'
			assert.deepEqual(input.extract(re), [])
		})
		it('handles mismatch with original return', () => {
			var input = 'test [case]'
			assert.equal(input.extract(re, true), input)
		})
		it('handles mismatch with default', () => {
			var input = 'test [case]'
			assert.equal(input.extract(re, 'x'), 'x')
		})
		it('supports multiple fields', () => {
			var re = /(\w+) first (\w+)/
			var input = 'test a first case'
			assert.deepEqual(input.extract(re), ['a', 'case'])
		})
		it('supports global captures', () => {
			var re = /\{(\w+)\}/g
			var input = '{a} first {test} case {for} global'
			assert.deepEqual(input.extract(re), ['a', 'test', 'for'])
		})
	})
	describe('json', () => {
		it('base case', () => {
			assert.deepEqual('{"a":"x", "b":"y"}'.json(), {a: "x", b: "y"})
		})
		it('handles empty strings', () => {
			assert.deepEqual(''.json(), {})
		})
		it('handles whitespace', () => {
			assert.deepEqual(' \t '.json(), {})
		})
	})
	describe('filename functions', () => {
		var fn = '/dir1/dir2/dir3/fn.ext1.ext2'
		it('extracts file name', () => {
			assert.equal(fn.path('filename'), 'fn.ext1.ext2')
		})
		it('default behaviour', () => {
			assert.equal(fn.path(), 'fn.ext1.ext2')
		})
		it('extracts base name', () => {
			assert.equal(fn.path('basename'), 'fn.ext1')
		})
		it('extracts directory', () => {
			assert.equal(fn.path('dir'), '/dir1/dir2/dir3')
		})
		it('extracts directory when non presenet', () => {
			assert.equal('fn.txt'.path('dir'), undefined)
		})
	})
	describe('filesystem functions', () => {
		var d = os.tmpdir() + '/__tst__';
		it('resolves dots', () => {
			var path = require('path').resolve('.')
			assert.equal('.'.resolve(), path) 
		})
		it('resolves tildes', () => {
			var path = os.homedir() + '/tst'
			assert.equal('~/tst'.resolve(), path) 
		})
		it('creates a directory', () => {
			if (fs.existsSync(d)) rmdir(d)
			d.mkdir()
			assert.ok(fs.existsSync(d), 'directory not created')
		})
		it('creates a directory - recursive', () => {
			if (fs.existsSync(d)) rmdir(d)
			var path = d + '/d1/d2/d3'
			path.mkdir()
			assert.ok(fs.existsSync(path), 'directory not created')
		})
		it('creates file - argument as data', () => {
			var path = d + '/f1.txt'
			if (fs.existsSync(path)) fs.unlinkSync(path)
			var msg = 'contents of file 1'
			path.tee(msg)
			assert.ok(fs.existsSync(path))
			assert.equal(fs.readFileSync(path, 'utf8'), msg)
		})
		it('creates file - argument as path', () => {
			var path = d + '/f2.txt'
			if (fs.existsSync(path)) fs.unlinkSync(path)
			var msg = 'contents of file 1'
			msg.tee(path)
			assert.ok(fs.existsSync(path))
			assert.equal(fs.readFileSync(path, 'utf8'), msg)
		})
		it('creates file - argument as data (forced)', () => {
			var path = d + '/f2.txt'
			if (fs.existsSync(path)) fs.unlinkSync(path)
			var msg = 'contents/of/file'
			path.tee(msg, {argIsPath: false})
			assert.ok(fs.existsSync(path))
			assert.equal(fs.readFileSync(path, 'utf8'), msg)
		})
		it('creates file - argument as path (forced)', () => {
			var cwd = process.cwd()
			process.chdir(d)
			var fn = 'f2.txt'
			if (fs.existsSync(fn)) fs.unlinkSync(fn)
			var msg = 'contents of file'
			msg.tee(fn, {argIsPath: true})
			assert.ok(fs.existsSync(fn))
			assert.equal(fs.readFileSync(fn, 'utf8'), msg)
			process.chdir(cwd)
		})
		it('creates a hidden file', () => {
			var path = d + '/.f1.txt'
			path.tee('contents of hidden file')
			assert.ok(fs.existsSync(path))
		})
		it('creates binary file', () => {
			var path = d + '/b1.bin'
			path.tee('$������,�dN�1��K��G��������W�4�t��НR�Kt���*��Z��2')
			assert.ok(fs.existsSync(path))
		})
		it('creates file from buffer', () => {
			var path = d + '/f2.txt'
			var s = 'I am a string'
			var buf = Buffer.from(s, 'utf-8')
			if (fs.existsSync(path)) fs.unlinkSync(path)
			path.tee(buf)
			assert.ok(fs.existsSync(path))
			assert.ok(fs.readFileSync(path), s)
		})
		it('creates file from buffer - ignores option', () => {
			var path = d + '/f2.txt'
			var s = 'I am a string'
			var buf = Buffer.from(s, 'utf-8')
			if (fs.existsSync(path)) fs.unlinkSync(path)
			path.tee(buf, {argIsPath: true})
			assert.ok(fs.existsSync(path))
			assert.ok(fs.readFileSync(path), s)
		})
		it('creates file in new path', () => {
			var path = d + '/d1/d3/f1.txt'
			path.tee('I am a string')
			assert.ok(fs.existsSync(path))
		})
		it('creates file in new path - breaks on option', () => {
			var path = d + '/d3/d1/f1.txt'
			try {
				path.tee('I am a string', {nomkdir: true})
				assert.ok(false, 'Should have issued exception')
			}
			catch(e) {
				if (e.message == 'Should have issued exception')
					throw e
				assert.ok(e.message.match(/no such file or directory/))
			}
		})
		it('reads file', () => {
			var path = d + '/f1.txt'
			assert.equal(path.cat(), 'contents of file 1')
		})
		it('reads hidden file', () => {
			var path = d + '/.f1.txt'
			assert.equal(path.cat(), 'contents of hidden file')
		})
		it('reads binary file - utf8', () => {
			var path = d + '/b1.bin'
			assert.equal(path.cat(), '$������,�dN�1��K��G��������W�4�t��НR�Kt���*��Z��2')
		})
		it('reads binary file - buffer', () => {
			var path = d + '/b1.bin'
			var buf = path.cat({})
			assert.ok(buf instanceof Buffer)
		})
		it('reads binary file - base64', () => {
			var path = d + '/b1.bin'
			var s = path.cat('base64')
			assert.ok(!s.match(/[^\x00-\x7F]/), 'Non ASCII characters found in base64')
		})
		it('cannot read missing file', () => {
			try {
				var s = (d + '/x').cat()
				throw new Error('Should have aborted')
			}
			catch(e) {
				assert.ok(e.message.match(/no such file or directory/))
			}
		})
		it('clobbers a file', () => {
			var path = d + '/f1.txt'
			path.tee('first line', {clobber: true})
			assert.equal(path.cat(), 'first line')
		})
		it('appends to a file', () => {
			var path = d + '/f1.txt'
			path.tee('\nsecond line')
			assert.equal(path.cat(), 'first line\nsecond line')
		})
		it('creates a file symlink', () => {
			var path = d + '/sym1'
			path.symlink(d + '/f1.txt')
			assert.ok(fs.existsSync(path))
		})
		it('creates a directory symlink', () => {
			var path = d + '/sym2'
			path.symlink(d + '/d1')
			assert.ok(fs.existsSync(path))
		})
		it('copies file', () => {
			var orig = d + '/f1.txt'
			var dup = d + '/f3.txt'
			if (fs.existsSync(dup)) fs.unlinkSync(dup)

			orig.cp(dup)
			assert.ok(fs.existsSync(dup))
		})
		it('moves file', () => {
			var orig = d + '/f3.txt'
			var dup = d + '/f4.txt'
			if (fs.existsSync(dup)) fs.unlinkSync(dup)

			orig.mv(dup)
			assert.ok(fs.existsSync(dup))
			assert.ok(!fs.existsSync(orig))
		})
		it('removes file', () => {
			var path = d + '/f4.txt'
			path.rm();
			assert.ok(!fs.existsSync(path))
		})
		it('removes non-existent file', () => {
			var path = d + '/f5.txt'
			assert.ok(!fs.existsSync(path))
			path.rm();
		})
		it('reads properties', () => {
			var path = d + '/f1.txt'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
		})
		it('reads directory', () => {
			assert.deepEqual(d.ls(), [
				'.f1.txt', 'b1.bin', 'd1', 'f1.txt', 'f2.txt', 'sym1', 'sym2'
			])
		})
		it('reads full pathnames', () => {
			var actual = d.ls({fullpath: true})
			var m = actual[0].match(/.*\//)
			assert.ok(m, 'no path in filenames')
			var expected = ['.f1.txt', 'b1.bin', 'd1', 'f1.txt', 'f2.txt', 'sym1', 'sym2']
			assert.deepEqual(actual, expected.map(fn => m[0] + fn))
		})
		it('reads directory - entry objects', () => {
			var actual = d.ls({withFileTypes: true})
			assert.ok(actual[0] instanceof fs.Dirent)
			assert.equal(actual[0].name, '.f1.txt')
		})
		it('reads directory - no hidden files', () => {
			var actual = d.ls({hidden: false})
			var expected = ['b1.bin', 'd1', 'f1.txt', 'f2.txt', 'sym1', 'sym2']
			assert.deepEqual(actual, expected)
		})
		it('reads directory - layered filters', () => {
			var actual = d.ls([/f/, /2/])
			var expected = ['f2.txt']
			assert.deepEqual(actual, expected)
		})
		it('reads directory - recursive', () => {
			var actual = d.ls({recurse: true})
			var expected = [
				'.f1.txt', 'b1.bin', 'd1','d1/d2','d1/d2/d3',
				'd1/d3', 'd1/d3/f1.txt',
				'f1.txt','f2.txt',
				'sym1','sym2'
			]
			assert.deepEqual(actual, expected)
		})
		it('reads directory - recursive, full pathnames', () => {
			var actual = d.ls({recurse: true, fullpath: true})
			var expected = [
				'.f1.txt', 'b1.bin', 'd1','d1/d2','d1/d2/d3',
				'd1/d3', 'd1/d3/f1.txt',
				'f1.txt','f2.txt',
				'sym1','sym2'
			]
			assert.deepEqual(actual, expected.map(fn => d + '/' + fn))
		})
		it('reads directory - symlinks', () => {
			var actual = d.ls({followSymlinks: true, recurse: true})
			var expected = [
				'.f1.txt', 'b1.bin', 'd1','d1/d2','d1/d2/d3',
				'd1/d3', 'd1/d3/f1.txt',
				'f1.txt','f2.txt',
				'sym1','sym2','sym2/d2','sym2/d2/d3',
				'sym2/d3', 'sym2/d3/f1.txt'
			]
			assert.deepEqual(actual, expected)
		})
		it('file existence', () => {
			var path = d + '/f1.txt'
			assert.ok(path.fex())
			path = d + '/x.txt'
			assert.ok(!path.fex())
		})
		it('directory existence', () => {
			assert.ok(d.fex())
		})
		it('is directory', () => {
			assert.ok(d.isdir())
		})
		it('stat - regular file', () => {
			var path = d + '/' + 'f1.txt'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isFile())
		})
		it('stat - directory', () => {
			var path = d + '/' + 'd1'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isDirectory())
		})
		it('stat - file symlink', () => {
			var path = d + '/' + 'sym1'
			var st = path.fstat({symlinks: true})
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isSymbolicLink())
		})
		it('stat - directory symlink', () => {
			var path = d + '/' + 'sym2'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isDirectory())
			assert.ok(!st.isSymbolicLink())
		})
		it('stat - directory symlink, follow', () => {
			var path = d + '/' + 'sym2'
			var st = path.fstat({symlinks: true})
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isSymbolicLink())
			assert.ok(!st.isDirectory())
		})
		// need to figure out what owner to change to
		it.skip('change ownership', () => {
			var path = d + '/f1.txt'
			var ost = fs.statSync(path)
			path.chown(1, 1)
			var nst = fs.statSync(path)
			assert.notEqual(nst.uid, ost.uid)
			assert.notEqual(nst.gid, ost.gid)
			path.chown(ost.uid, ost.gid)
		})
		it('change mode', () => {
			var path = d + '/f1.txt'
			var ost = fs.statSync(path)
			path.chmod(0)
			var nst = fs.statSync(path)
			assert.notEqual(ost.mode, nst.mode)
			path.chmod(ost.mode)
		})
		it('removes directory - single', () => {
			var path = d + '/d1/d2/d3'
			path.rmdir()
			assert.ok(!fs.existsSync(path), 'directory not removed')
		})
		it('removes directory - recursive', () => {
			d.rmdir({recurse: true})
			assert.ok(!fs.existsSync(d), 'directory not removed')
		})
	})
})

function rmdir(path) {
	if (!fs.existsSync(path)) return;
	var st = fs.statSync(path);
	if (st.isDirectory())
		fs.readdirSync(path).forEach(fn => fs.unlinkSync(path + '/' + fn))
	fs.rmdirSync(path)
}