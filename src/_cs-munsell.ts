/**
 * This class converts the Munsell (HVC) color system.
 * D65 is used as tristimulus value.
 * Since conversion is performed by approximation based on the distance to the sample color, the conversion result is approximate value.
 * Also, when H is -1, it is regarded as an achromatic color (N) in particular.
 * Reference: http://www.cis.rit.edu/mcsl/online/munsell.php
 *
 * @author Takuto Yanagida
 * @version 2024-08-09
 */

import { TBL_SRC_MIN, TBL_V } from './table/_hc2xy-all-min';
import { Tree } from './_kdt';

import { Pair, Triplet } from './_type';
import { XYZ } from './_cs-xyz';
import { Yxy } from './_cs-yxy';
import { PCCS } from './_cs-pccs';

export class Munsell {

	private static _eq0(x: number): boolean {
		return Math.abs(x) < Munsell.EP;
	}

	private static _eq(x0: number, x1: number): boolean {
		return Math.abs(x0 - x1) < Munsell.EP;
	}

	private static _div(a: Pair, b: Pair, r: number): Pair {
		return [(b[0] - a[0]) * r + a[0], (b[1] - a[1]) * r + a[1]];
	}

	private static _cross(ax: number, ay: number, bx: number, by: number): number {
		return ax * by - ay * bx;
	}

	// Whether a point (x, y) exists within the interior (including the boundary) of the clockwise triangle abc
	// in the mathematical coordinate system (positive on the y axis is upward)
	private static _inside(p: Pair, a: Pair, b: Pair, c: Pair) {
		// If x, y are on the right side of ab, the point is outside the triangle
		if (Munsell._cross(p[0] - a[0], p[1] - a[1], b[0] - a[0], b[1] - a[1]) < 0) return false;
		// If x, y are on the right side of bc, the point is outside the triangle
		if (Munsell._cross(p[0] - b[0], p[1] - b[1], c[0] - b[0], c[1] - b[1]) < 0) return false;
		// If x, y are on the right side of ca, the point is outside the triangle
		if (Munsell._cross(p[0] - c[0], p[1] - c[1], a[0] - c[0], a[1] - c[1]) < 0) return false;
		return true;
	}

	private static HUE_NAMES = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP'];  // 1R = 1, 9RP = 99, 10RP = 0
	private static EP = 0.0000000000001;
	private static ILLUMINANT_C: Pair = [0.3101, 0.3162];  // Standard illuminant C, white point
	private static TBL_MAX_C: number[][];
	private static TBL: (Pair|null)[][][];  // [vi][10 * h / 25][c / 2] -> [x, y]
	private static TBL_TREES: Tree[] = [];

	static MIN_HUE = 0;
	static MAX_HUE = 100;  // Same as MIN_HUE
	static MONO_LIMIT_C = 0.05;

	static isSaturated = false;

	private static _getXy(vi: number, ht: number, c: number): Pair|null {
		if (c === 0) return Munsell.ILLUMINANT_C;
		if (1000 <= ht) ht -= 1000;
		return Munsell.TBL[vi][ht / 25][c / 2];
	}

	// Find Y of XYZ (C) from Munsell's V (JIS).
	private static _v2y(v: number) {
		if (v <= 1) return v * 0.0121;
		const v2 = v * v;
		const v3 = v2 * v;
		const y = 0.0467 * v3 + 0.5602 * v2 - 0.1753 * v + 0.8007;
		return y / 100;
	}

	// Munsell's V is obtained from Y of XYZ (C) (JIS, Newton's method).
	private static _y2v(y: number) {
		if (y <= 0.0121) return y / 0.0121;
		let v = 10;
		for (let i = 0; i < 1000; ++i) {  // Max iteration is 1000.
			const f = Munsell._v2y(v) - y;
			const fp =  (v <= 1) ? 0.0121 : ((3 * 0.0467 * (v * v) + 2 * 0.5602 * v - 0.1753) / 100);
			if (Math.abs(f) < 0.0001) break;
			v = v - f / fp;
		}
		return v;
	}


	// -------------------------------------------------------------------------


	// Find the Munsell value from xyY (standard illuminant C).
	private static _yxy2mun([Y, x, y]: Triplet): Triplet {
		const v = Munsell._y2v(Y);  // Find Munsell lightness
		Munsell.isSaturated = false;

		// When the lightness is maximum 10
		if (Munsell._eq(v, TBL_V.at(-1) as number)) {
			const [h, c] = Munsell._interpolateHC(x, y, TBL_V.length - 1);
			return [h, v, c];
		}
		// When the lightness is 0 or the lightness is larger than the maximum 10, or when it is an achromatic color (standard illuminant C)
		if (Munsell._eq0(v) || TBL_V.at(-1) as number < v || (Munsell._eq(x, Munsell.ILLUMINANT_C[0]) && Munsell._eq(y, Munsell.ILLUMINANT_C[1]))) {
			return [0, v, 0];
		}
		// Obtain lower side
		let vi_l = -1;
		while (TBL_V[vi_l + 1] <= v) ++vi_l;
		let hc_l = [0, 0] as Pair;  // Hue and chroma of the lower side
		if (vi_l !== -1) hc_l = Munsell._interpolateHC(x, y, vi_l);

		// Obtain upper side
		const vi_u = vi_l + 1;
		const hc_u = Munsell._interpolateHC(x, y, vi_u);

		// When the lightness on the lower side is the minimum 0, the hue is matched with the upper side, and the chroma is set to 0
		if (vi_l === -1) {
			hc_l[0] = hc_u[0];
			hc_l[1] = 0;
		}
		const v_l = ((vi_l === -1) ? 0 : TBL_V[vi_l]);
		const v_h = TBL_V[vi_u];
		const r = (v - v_l) / (v_h - v_l);

		const [h, c] = Munsell._addHc(hc_l, hc_u, r);
		return [h, v, c];
	}

	// Acquires the hue and chroma for the chromaticity coordinates (x, y) on the surface of the given lightness index.
	// If not included, -1 is returned.
	private static _interpolateHC(x: number, y: number, vi: number): Pair {
		const p = [x, y] as Pair;
		const [ht0, ht1, c0, c1] = Munsell._getHcRange(p, vi);

		let ht_l, ht_u = -1;
		let c_l = -1, c_u = -1;
		let hc_r = null;

		out:
		for (ht_l = ht0; ht_l <= ht1; ht_l += 25) {  // h 0-975 step 25;
			ht_u = ht_l + 25;

			inner:
			for (c_l = c0; c_l <= c1; c_l += 2) {  // c 0-50 step 2;
				c_u = c_l + 2;

				const wa = Munsell._getXy(vi, ht_l, c_l);
				const wb = Munsell._getXy(vi, ht_u, c_l);
				let wc = Munsell._getXy(vi, ht_u, c_u);
				let wd = Munsell._getXy(vi, ht_l, c_u);

				if (wa && wb && wc && !wd) {
					wd = [wa[0] + (wc[0] - wb[0]), wa[1] + (wc[1] - wb[1])]
				} else if (wa && wb && !wc && wd) {
					wc = [wb[0] + (wd[0] - wa[0]), wb[1] + (wd[1] - wa[1])]
				}

				if (wa === null && wb === null) break inner;
				if (wa === null || wb === null || wc === null || wd === null) continue;
				//  ^
				// y| B C      ↖H (Direction of rotation) ↗C (Radial direction)
				//  | A D
				//  ------> x
				if (wa[0] === wb[0] && wa[1] === wb[1]) {
					if (Munsell._inside(p, wa, wc, wd)) {
						hc_r = Munsell._interpolationRatio(p, wa, wd, wb, wc);
					}
				} else {
					if (Munsell._inside(p, wa, wc, wd) || Munsell._inside(p, wa, wb, wc)) {
						hc_r = Munsell._interpolationRatio(p, wa, wd, wb, wc);
					}
				}
				if (hc_r !== null) break out;
			}
		}
		if (hc_r === null) {
			const ps = Munsell.TBL_TREES[vi].neighbors(p, 2);
			if (2 === ps.length) {
				Munsell.isSaturated = true;
				let [[[ht0, c0], d0], [[ht1, c1], d1]] = ps;
				const r = d0 / (d0 + d1);
				return Munsell._addHc([ht0 / 10, c0], [ht1 / 10, c1], r);
			}
			return [0, 0];
		}
		if (ht_u === 0) ht_u = 1000;
		return [
			((ht_u - ht_l) * hc_r[0] + ht_l) / 10,
			(c_u - c_l) * hc_r[1] + c_l
		];
	}

	private static _getHcRange(p: Pair, vi: number): [number, number, number, number] {
		const ps = Munsell.TBL_TREES[vi].neighbors(p, 16);
		const hcs = ps.map(([e,]) => e);
		const hs = hcs.map(([h,]) => h);
		const cs = hcs.map(([,c]) => c);
		return [
			Math.min(...hs),
			Math.max(...hs),
			Math.min(...cs),
			Math.max(...cs),
		];
	}

	/*
	 * Calculate the proportion [h, v] of each point in the area surrounded by the points of the following placement (null if it is invalid).
	 *  ^
	 * y| B C      ↖H (Direction of rotation) ↗C (Radial direction)
	 *  | A D
	 *  ------> x
	 */
	private static _interpolationRatio(p: Pair, wa: Pair, wd: Pair, wb: Pair, wc: Pair): Pair|null {
		// Find the ratio in the vertical direction
		let v = -1;

		// Solve a v^2 + b v + c = 0
		const ea = (wa[0] - wd[0]) * (wa[1] + wc[1] - wb[1] - wd[1]) - (wa[0] + wc[0] - wb[0] - wd[0]) * (wa[1] - wd[1]);
		const eb = (p[0] - wa[0]) * (wa[1] + wc[1] - wb[1] - wd[1]) + (wa[0] - wd[0]) * (wb[1] - wa[1]) - (wa[0] + wc[0] - wb[0] - wd[0]) * (p[1] - wa[1]) - (wb[0] - wa[0]) * (wa[1] - wd[1]);
		const ec = (p[0] - wa[0]) * (wb[1] - wa[1]) - (p[1] - wa[1]) * (wb[0] - wa[0]);

		if (Munsell._eq0(ea)) {
			if (!Munsell._eq0(eb)) v = -ec / eb;
		} else {
			const rt = Math.sqrt(eb * eb - 4 * ea * ec);
			const v1 = (-eb + rt) / (2 * ea), v2 = (-eb - rt) / (2 * ea);

			if (wa[0] === wb[0] && wa[1] === wb[1]) {  // In this case, v1 is always 0, but this is not a solution.
				if (0 <= v2 && v2 <= 1) v = v2;
			} else {
				if      (0 <= v1 && v1 <= 1) v = v1;
				else if (0 <= v2 && v2 <= 1) v = v2;
			}
		}
		if (v < 0) return null;

		// Find the ratio in the horizontal direction
		let h = -1, h1 = -1, h2 = -1;
		const deX = (wa[0] - wd[0] - wb[0] + wc[0]) * v - wa[0] + wb[0];
		const deY = (wa[1] - wd[1] - wb[1] + wc[1]) * v - wa[1] + wb[1];

		if (!Munsell._eq0(deX)) h1 = ((wa[0] - wd[0]) * v + p[0] - wa[0]) / deX;
		if (!Munsell._eq0(deY)) h2 = ((wa[1] - wd[1]) * v + p[1] - wa[1]) / deY;

		if      (0 <= h1 && h1 <= 1) h = h1;
		else if (0 <= h2 && h2 <= 1) h = h2;

		if (h < 0) return null;

		return [h, v];
	}

	private static _addHc([h0, c0]: Pair, [h1, c1]: Pair, r: number): Pair {
		if (Math.abs(h1 - h0) > Munsell.MAX_HUE * 0.5) {
			if (h0 < h1) h0 += Munsell.MAX_HUE;
			else if (h0 > h1) h1 += Munsell.MAX_HUE;
		}

		let h = (h1 - h0) * r + h0;
		if (Munsell.MAX_HUE <= h) h -= Munsell.MAX_HUE;
		let c = (c1 - c0) * r + c0;
		if (c < Munsell.MONO_LIMIT_C) c = 0;
		return [h, c];
	}


	// -------------------------------------------------------------------------


	private static _mun2yxy([h, v, c]: Triplet): Triplet {
		if (Munsell.MAX_HUE <= h) h -= Munsell.MAX_HUE;
		const Y = Munsell._v2y(v);
		Munsell.isSaturated = false;

		// When the lightness is 0 or achromatic (check this first)
		if (Munsell._eq0(v) || h < 0 || c < Munsell.MONO_LIMIT_C) {
			Munsell.isSaturated = Munsell._eq0(v) && 0 < c;
			return [Y, ...Munsell.ILLUMINANT_C];
		}
		// When the lightness is the maximum value 10 or more
		const v_max = TBL_V.at(-1) as number;
		if (v_max <= v) {
			const xy = Munsell._interpolateXY(h, c, TBL_V.length - 1);
			Munsell.isSaturated = (v_max < v);
			return [Y, xy[0], xy[1]];
		}
		let vi_l = -1;
		while (TBL_V[vi_l + 1] <= v) ++vi_l;
		const vi_u = vi_l + 1;

		// Obtain lower side
		let xy_l;
		if (vi_l !== -1) {
			xy_l = Munsell._interpolateXY(h, c, vi_l);
		} else {  // When the lightness of the lower side is the minimum 0, use standard illuminant.
			xy_l = [...Munsell.ILLUMINANT_C, false];
			Munsell.isSaturated = true;
		}
		// Obtain upper side
		const xy_u = Munsell._interpolateXY(h, c, vi_u);

		const v_l = ((vi_l === -1) ? 0 : TBL_V[vi_l]);
		const v_u = TBL_V[vi_u];

		if (!xy_l[2] && !xy_u[2]) {
			Munsell.isSaturated = true;
		} else if (!xy_l[2] || !xy_u[2]) {
			if (v < 0.5 * (v_l + v_u)) {
				if (!xy_l[2]) Munsell.isSaturated = true;
			} else {
				if (!xy_u[2]) Munsell.isSaturated = true;
			}
		}
		const r = (v - v_l) / (v_u - v_l);
		const xy = Munsell._div(xy_l as unknown as Pair, xy_u as unknown as Pair, r);
		return [Y, ...xy];
	}

	// Obtain the hue and chroma for the chromaticity coordinates (h, c) on the surface of the given lightness index.
	// Return false if it is out of the range of the table.
	private static _interpolateXY(h: number, c: number, vi: number): [number, number, boolean] {
		const ht = h * 10;
		const p = [ht, c] as Pair;

		const c_l = 0 | Math.floor(c / 2) * 2;
		const c_u = c_l + 2;

		let ht_l = 0 | Math.floor(ht / 25) * 25;
		let ht_u = ht_l + 25;

		if (ht_u === 1000) ht_u = 0;
		let maxC_hl = Munsell.TBL_MAX_C[vi][ht_l / 25];
		let maxC_hu = Munsell.TBL_MAX_C[vi][ht_u / 25];

		if (maxC_hl === 0) {
			ht_l -= 25;
			if (ht_l < 0) ht_l = 1000 - 25;
			maxC_hl = Munsell.TBL_MAX_C[vi][ht_l / 25];
		}
		if (maxC_hu === 0) {
			ht_u += 25;
			if (ht_u === 1000) ht_u = 0;
			maxC_hu = Munsell.TBL_MAX_C[vi][ht_u / 25];
		}

		if (c < maxC_hl && maxC_hu <= c) {
			for (let c_l = maxC_hu; c_l <= maxC_hl - 2; c_l += 2) {
				if (Munsell._inside(p, [ht_u, maxC_hu], [ht_l, c_l], [ht_l, c_l + 2])) {
					const xy = interpolate3(vi, p, [ht_u, maxC_hu], [ht_l, c_l], [ht_l, c_l + 2]);
					return [...xy, true];
				}
			}
		}
		if (maxC_hl <= c && c < maxC_hu) {
			for (let c_c = maxC_hl; c_c <= maxC_hu - 2; c_c += 2) {
				if (Munsell._inside(p, [ht_l, maxC_hl], [ht_u, c_c + 2], [ht_u, c_c])) {
					const xy = interpolate3(vi, p, [ht_l, maxC_hl], [ht_u, c_c + 2], [ht_u, c_c]);
					return [...xy, true];
				}
			}
		}
		if (maxC_hl <= c || maxC_hu <= c) {
			const xy = interpolate2(vi, p, [ht_l, maxC_hl], [ht_u, maxC_hu]);
			return [...xy, false];
		}
		const xy = interpolate4(vi, p, [ht_l, c_l], [ht_u, c_l], [ht_u, c_u], [ht_l, c_u]);
		return [...xy, true];

		function interpolate2(vi: number, p: Pair, a: Pair, b: Pair): Pair {
			const rx = (p[0] - a[0]) / (b[0] - a[0]);

			const wa = Munsell._getXy(vi, ...a) as Pair;
			const wb = Munsell._getXy(vi, ...b) as Pair;

			return Munsell._div(wa, wb, rx);
		}

		function interpolate3(vi: number, p: Pair, a: Pair, b: Pair, c: Pair): Pair {
			// Barycentric coordinates for 2D interpolation
			const f = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
			const w1 = ((b[1] - c[1]) * (p[0] - c[0]) + (c[0] - b[0]) * (p[1] - c[1])) / f;
			const w2 = ((c[1] - a[1]) * (p[0] - c[0]) + (a[0] - c[0]) * (p[1] - c[1])) / f;
			const w3 = 1 - w1 - w2;

			const wa = Munsell._getXy(vi, ...a) as Pair;
			const wb = Munsell._getXy(vi, ...b) as Pair;
			const wc = Munsell._getXy(vi, ...c) as Pair;

			return [
				wa[0] * w1 + wb[0] * w2 + wc[0] * w3,
				wa[1] * w1 + wb[1] * w2 + wc[1] * w3,
			];
		}

		// d c
		// a b
		function interpolate4(vi: number, p: Pair, a: Pair, b: Pair, c: Pair, d: Pair): Pair {
			const rx = (p[0] - a[0]) / (b[0] - a[0]);
			const ry = (p[1] - a[1]) / (d[1] - a[1]);

			const wa = Munsell._getXy(vi, ...a) as Pair;
			const wb = Munsell._getXy(vi, ...b) as Pair;
			const wc = Munsell._getXy(vi, ...c) as Pair;
			const wd = Munsell._getXy(vi, ...d) as Pair;

			// Checking (wa === wb) in case both are ILLUMINANT_C.
			const wab = (wa === wb) ? wa : Munsell._div(wa, wb, rx);
			const wdc = Munsell._div(wd, wc, rx);

			return Munsell._div(wab, wdc, ry);
		}
	}


	// -------------------------------------------------------------------------


	/**
	 * Convert name-based hue expression to hue value.
	 * If the Name-based hue expression is N, -1 is returned.
	 * @param {string} hueName Name-based hue expression
	 * @return {number} Hue value
	 */
	static hueNameToHueValue(hueName: string): number {
		if (hueName.length === 1) return -1;  // In case of achromatic color N

		function isDigit(s: string) { return Number.isInteger(parseInt(s)); }
		const len = isDigit(hueName.charAt(hueName.length - 2)) ? 1 : 2;  // Length of color name
		const n = hueName.substring(hueName.length - len);

		let hv = parseFloat(hueName.substring(0, hueName.length - len));
		hv += Munsell.HUE_NAMES.indexOf(n) * 10;
		if (Munsell.MAX_HUE <= hv) hv -= Munsell.MAX_HUE;
		return hv;
	}

	/**
	 * Convert hue value to name-based hue expression.
	 * If the hue value is -1, or if the chroma value is 0, N is returned.
	 * @param {number} hue Hue value
	 * @param {number} chroma Chroma value
	 * @return {string} Name-based hue expression
	 */
	static hueValueToHueName(hue: number, chroma: number): string {
		if (hue === -1 || Munsell._eq0(chroma)) return 'N';
		if (hue <= 0) hue += Munsell.MAX_HUE;
		let h10 = (0 | hue * 10) % 100;
		let c = 0 | (hue / 10);
		if (h10 === 0) {
			h10 = 100;
			c -= 1;
		}
		return (Math.round(h10 * 10) / 100) + Munsell.HUE_NAMES[c];
	}

	/**
	 * Convert CIE 1931 XYZ to Munsell (HVC).
	 * @param {Triplet} xyz XYZ color (standard illuminant D65)
	 * @return {Triplet} Munsell color
	 */
	static fromXYZ(xyz: Triplet): Triplet {
		return Munsell._yxy2mun(Yxy.fromXYZ(XYZ.toIlluminantC(xyz)));
	}

	/**
	 * Convert Munsell (HVC) to CIE 1931 XYZ.
	 * @param {Triplet} hvc Hue, value, chroma of Munsell color
	 * @return {Triplet} XYZ color
	 */
	static toXYZ([h, v, c]: Triplet): Triplet {
		return XYZ.fromIlluminantC(Yxy.toXYZ(Munsell._mun2yxy([h, v, c])));
	}

	/**
	 * Convert Munsell (HVC) to PCCS (hls).
	 * @param {Triplet} hvc Hue, value, chroma of Munsell color
	 * @return {Triplet} PCCS color
	 */
	static toPCCS(hvc: Triplet): Triplet {
		return PCCS.fromMunsell(hvc);
	}

	/**
	 * Convert PCCS (hls) to Munsell (HVC).
	 * @param {Triplet} hls Hue, lightness, saturation of PCCS color
	 * @return {Triplet} Munsell color
	 */
	static fromPCCS(hls: Triplet): Triplet {
		return PCCS.toMunsell(hls);
	}

	/**
	 * Returns the string representation of Munsell numerical representation.
	 * @param {Triplet} hvc Hue, value, chroma of Munsell color
	 * @return {string} String representation
	 */
	static toString([h, v, c]: Triplet): string {
		const str_v = Math.round(v * 10) / 10;
		if (c < Munsell.MONO_LIMIT_C) {
			return `N ${str_v}`;
		} else {
			const hue = Munsell.hueValueToHueName(h, c);
			const str_c = Math.round(c * 10) / 10;
			return `${hue} ${str_v}/${str_c}`;
		}
	}

	static {
		Munsell.initTable(TBL_V, TBL_SRC_MIN);
	}

	static initTable(tbl_v: number[], tbl_src_min: number[][][]): void {
		Munsell.TBL       = new Array(tbl_v.length);  // [vi][10 * h / 25][c / 2] -> [x, y]
		Munsell.TBL_MAX_C = new Array(tbl_v.length);
		Munsell.TBL_TREES = new Array(tbl_v.length);

		for (let vi = 0; vi < tbl_v.length; vi += 1) {
			Munsell.TBL[vi]       = new Array(1000 / 25);
			Munsell.TBL_MAX_C[vi] = new Array(1000 / 25);
			Munsell.TBL_MAX_C[vi].fill(0);

			for (let i = 0, n = 1000 / 25; i < n; i += 1) {
				Munsell.TBL[vi][i] = new Array(50 / 2 + 2);  // 2 <= C <= 51
				Munsell.TBL[vi][i].fill(null);
			}
			const data: [Pair, Pair][] = [];

			for (const cs of tbl_src_min[vi]) {
				const hi = cs.shift() as number;
				_integrate(cs);
				_integrate(cs);

				for (let i = 0; i < cs.length; i += 2) {
					const ci = i / 2 + 1;
					const x = cs[i + 0] / 1000;
					const y = cs[i + 1] / 1000;

					Munsell.TBL[vi][hi][ci] = [x, y];
					data.push([[x, y], [hi * 25, ci * 2]]);
				}
				Munsell.TBL_MAX_C[vi][hi] = cs.length - 2;
			}
			Munsell.TBL_TREES[vi] = new Tree(data);
		}

		function _integrate(cs: number[]) {
			let x_ = 0;
			let y_ = 0;

			for (let i = 0; i < cs.length; i += 2) {
				x_ += cs[i];
				y_ += cs[i + 1];
				cs[i]     = x_;
				cs[i + 1] = y_;
			}
		}
	}
}
