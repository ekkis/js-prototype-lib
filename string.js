var self = module.exports = {
    fs: require('fs'),
    uc() { 
        return this.toUpperCase(); 
    },
    lc() { 
        return this.toLowerCase(); 
    },
    tc() {
        return this.toLowerCase().split(/\b/)
            .map(s => s.length > 1 ? (s.charAt(0).toUpperCase() + s.substr(1)) : s)
            .join('');
    },
    sprintf(o) {
        var s = this.toString();
        if (typeof o != 'object') return s;
        for (var k in o)
            s = s.replace(new RegExp('%{' + k + '}', 'g'), o[k]);
        return s;
    },
    unindent() {
        var level = this.match(/^\n?([ \t]*)/);
        var re = new RegExp('^' + level[1], 'gm');
        return this.trim().replace(re, '');
    },
    heredoc() {
        return this.unindent()
            .replace(/([^\n])\n/g, '$1 ');
    },
    keyval(ks = "=", rs = "\n", qa = false) {
        var ret = {};
        this.split(rs).forEach(s => {
            if (!s) return;
            var [k, v] = s.split(ks);
            ret[k] = v.match(/^\d+(?:\.\d+)?$/) && !qa ? parseFloat(v) : v;
        });
        return ret;
    },
    q(v = "'") {
        if (!v) v = '"';
        var [qb, qe] = v.split('');
        if (!qe) qe = qb;
        var re = new RegExp("^[X]|[X]$".replace(/X/g, v), "g");
        return qb + this.replace(re, '') + qe;
    },
    arr(dc = '/|,;.\t\n') {
        return this.split(new RegExp('[' + dc + ']+'));
    },
    nth(n, dc) {
        var r = this.arr(dc);
        if (n < 0) n = r.length + n;
        return r[n] || '';
    },
    extract(re, original = false) {
        var m, ret = [];
        if (isRegExpGlobal(re))
            while (m = re.exec(this)) ret = ret.concat(m.slice(1));
        else {
            m = this.match(re);
            if (m) ret = m.slice(1);
        }

        return ret.length == 0 && original
            ? this.toString() 
            : ret.length == 1 
            ? ret[0] 
            : ret;
    },
    json() {
        return JSON.parse(this);
    },
    fex() {
        return self.fs.existsSync(this);
    },
    fchmod(mode) {
        return self.fs.fchmod(this, mode);
    },
    fchown(uid, gid) {
        self.fs.chownSync(this, uid, gid);
    },
    fstat(opts) {
        return self.fs.statSync(this, opts);
    },
    ls(re, opts = {}) {
        if (re) {
            var rex = re instanceof RegExp;
            if (!rex) { opts = re; }
        }
        var ret = self.fs.readdirSync(this, opts);
        if (rex) ret = ret.filter(nm => nm.match(re));
        return ret;
    },
    mkdir(opts) {
        self.fs.mkdirSync(this, opts);
    },
    cat(opts) {
        return self.fs.readFileSync(this, opts);
    },
    cp(dst, flags) {
        self.fs.copyFileSync(this, dst, flags);
    },
    mv(dst) {
        self.fs.renameSync(this, dst);
    },
    rm() {
        self.fs.unlinkSync(this);
    }
}

function isRegExpGlobal(re) {
    var mods = re.toString().split('/')[2];
    return mods.indexOf('g') > -1;
}