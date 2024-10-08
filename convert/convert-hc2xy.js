/**
 * Converter of original hc2xy data for minimizing
 *
 * @author Takuto Yanagida
 * @version 2024-08-19
 */

const HUE_NAMES = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP'];  // 1R = 1, 9RP = 99, 10RP = 0
const MAX_HUE = 100.0;

const TBL_V_REAL = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0];
const TBL_V_ALL  = [0.2, 0.4, 0.6, 0.8, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];

Munsell = {};
TBL_V = TBL_V_REAL;
TBL_SRC = new Array(TBL_V.length);

// require('./orig/_hc2xy-all.js');
require('./orig/_hc2xy-real.js');
convert();

// require('./_hc2xy-all-min.js');
// require('./_hc2xy-real-min.js');
// invert();

function convert() {
	const vs_v = [];
	for (let vi = 0; vi < TBL_V.length; vi += 1) {
		const vs = {};
		for (const cs of TBL_SRC[vi]) {
			const c0 = 0 | (hueNameToHueValue(cs[0]) * 10) / 25;
			const c1 = cs[1] / 2;
			const c2 = 0 | Math.round(cs[2] * 1000);
			const c3 = 0 | Math.round(cs[3] * 1000);

			if (!vs[c0]) vs[c0] = [];
			vs[c0].push(c2);
			vs[c0].push(c3);
			if (vs[c0].length !== c1 * 2) throw new Error();
		}
		const vs_c = [];
		for (let [c0, vss] of Object.entries(vs)) {
			differentiate(vss);
			differentiate(vss);
			vss.unshift(c0);
			vs_c.push('\t\t[' + vss.join(',') + ']');
		}
		vs_v.push('\t[\n' + vs_c.join(',\n') + '\n\t]');
	}
	console.log('TBL_SRC_MIN = [\n' + vs_v.join(',\n') + '\n];');
}

function invert() {
	for (let vi = 0; vi < TBL_V.length; vi += 1) {
		const ls = [];
		for (const vs of TBL_SRC_MIN[vi]) {
			const v0 = vs.shift();
			const h = hueValueToHueName(v0 * 25 / 10);
			integrate(vs);
			integrate(vs);
			for (let i = 0; i < vs.length; i += 2) {
				const c = (i / 2 + 1) * 2;
				const x = vs[i + 0] / 1000;
				const y = vs[i + 1] / 1000;

				ls.push(`\t['${h}',${c},${x},${y}]`);
			}
		}
		console.log(`TBL_SRC[${vi}] = [\n` + ls.join(',\n') + '\n];');
	}
}

function hueNameToHueValue(hueName) {
	if (hueName.length === 1) return -1;  // In case of achromatic color N

	function isDigit(s) { return Number.isInteger(parseInt(s)); }
	const len = isDigit(hueName.charAt(hueName.length - 2)) ? 1 : 2;  // Length of color name
	const n = hueName.substring(hueName.length - len);

	let hv = parseFloat(hueName.substring(0, hueName.length - len));
	hv += HUE_NAMES.indexOf(n) * 10;
	if (MAX_HUE <= hv) hv -= MAX_HUE;
	return hv;
}

function hueValueToHueName(hue) {
	if (hue === -1) return 'N';
	if (hue <= 0) hue += MAX_HUE;
	let h10 = (0 | hue * 10) % 100;
	let c = 0 | (hue / 10);
	if (h10 === 0) {
		h10 = 100;
		c -= 1;
	}
	return (Math.round(h10 * 10) / 100) + HUE_NAMES[c];
}

function differentiate(cs) {
	let c2_ = 0, c3_ = 0;
	for (let i = 0; i < cs.length; i += 2) {
		const c2 = cs[i], c3 = cs[i + 1];
		cs[i]     = c2 - c2_;
		cs[i + 1] = c3 - c3_;
		c2_ = c2;
		c3_ = c3;
	}
}

function integrate(cs) {
	let c2_ = 0, c3_ = 0;
	for (let i = 0; i < cs.length; i += 2) {
		const c2 = cs[i], c3 = cs[i + 1];
		cs[i] = c2 + c2_;
		cs[i + 1] = c3 + c3_;
		c2_ += c2;
		c3_ += c3;
	}
}
