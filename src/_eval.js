/**
 *
 * Evaluation Methods
 *
 * @author Takuto Yanagida
 * @version 2020-12-07
 *
 */


class Evaluation {


	// Calculation of the conspicuity degree -----------------------------------


	/**
	 * Calculate the conspicuity degree.
	 * Reference: Effective use of color conspicuity for Re-Coloring system,
	 * Correspondences on Human interface Vol. 12, No. 1, SIG-DE-01, 2010.
	 * @param {number[]} lab L*, a*, b* of CIELAB color
	 * @return {number} Conspicuity degree [0, 180]
	 * TODO Consider chroma (ab radius of LAB)
	 */
	static conspicuityOfLab([ls, as, bs]) {
		const rad = (bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI);
		const H = rad / (Math.PI * 2) * 360;
		const a = 35;  // Constant
		if (H < a) return Math.abs(180 - (360 + H - a));
		else return Math.abs(180 - (H - a));
	}


	// Calculation of the color difference -------------------------------------


	/**
	 * Color difference calculation method by CIE 76
	 * @param {number[]} lab1 L*, a*, b* of CIELAB color 1
	 * @param {number[]} lab2 L*, a*, b* of CIELAB color 2
	 * @return {number} Color difference
	 */
	static CIE76([ls1, as1, bs1], [ls2, as2, bs2]) {
		return Math.sqrt((ls1 - ls2) * (ls1 - ls2) + (as1 - as2) * (as1 - as2) + (bs1 - bs2) * (bs1 - bs2));
	}

	/**
	* Color difference calculation method by CIEDE2000
	* Reference: http://www.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
	* http://d.hatena.ne.jp/yoneh/20071227/1198758604
	 * @param {number[]} lab1 L*, a*, b* of CIELAB color 1
	 * @param {number[]} lab2 L*, a*, b* of CIELAB color 2
	 * @return {number} Color difference
	*/
	static CIEDE2000([ls1, as1, bs1], [ls2, as2, bs2]) {
		const C1 = Math.sqrt(as1 * as1 + bs1 * bs1), C2 = Math.sqrt(as2 * as2 + bs2 * bs2);
		const Cb = (C1 + C2) / 2;
		const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
		const ap1 = (1 + G) * as1, ap2 = (1 + G) * as2;
		const Cp1 = Math.sqrt(ap1 * ap1 + bs1 * bs1), Cp2 = Math.sqrt(ap2 * ap2 + bs2 * bs2);
		const hp1 = (bs1 == 0 && ap1 == 0) ? 0 : atan(bs1, ap1), hp2 = (bs2 == 0 && ap2 == 0) ? 0 : atan(bs2, ap2);

		const DLp = ls2 - ls1;
		const DCp = Cp2 - Cp1;
		let Dhp = 0;
		if (Cp1 * Cp2 == 0) {
			Dhp = 0;
		} else if (Math.abs(hp2 - hp1) <= 180) {
			Dhp = hp2 - hp1;
		} else if (hp2 - hp1 > 180) {
			Dhp = (hp2 - hp1) - 360;
		} else if (hp2 - hp1 < -180) {
			Dhp = (hp2 - hp1) + 360;
		}
		const DHp = 2 * Math.sqrt(Cp1 * Cp2) * sin(Dhp / 2);

		const Lbp = (ls1 + ls2) / 2;
		const Cbp = (Cp1 + Cp2) / 2;
		let hbp = 0;
		if (Cp1 * Cp2 == 0) {
			hbp = hp1 + hp2;
		} else if (Math.abs(hp2 - hp1) <= 180) {
			hbp = (hp1 + hp2) / 2;
		} else if (Math.abs(hp2 - hp1) > 180 && hp1 + hp2 < 360) {
			hbp = (hp1 + hp2 + 360) / 2;
		} else if (Math.abs(hp2 - hp1) > 180 && hp1 + hp2 >= 360) {
			hbp = (hp1 + hp2 - 360) / 2;
		}
		const T = 1 - 0.17 * cos(hbp - 30) + 0.24 * cos(2 * hbp) + 0.32 * cos(3 * hbp + 6) - 0.2 * cos(4 * hbp - 63);
		const Dth = 30 * Math.exp(-sq((hbp - 275) / 25));
		const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
		const SL = 1 + 0.015 * sq(Lbp - 50) / Math.sqrt(20 + sq(Lbp - 50));
		const SC = 1 + 0.045 * Cbp;
		const SH = 1 + 0.015 * Cbp * T;
		const RT = -sin(2 * Dth) * RC;

		const kL = 1, kC = 1, kH = 1;
		const DE = Math.sqrt(sq(DLp / (kL * SL)) + sq(DCp / (kC * SC)) + sq(DHp / (kH * SH)) + RT * (DCp / (kC * SC)) * (DHp / (kH * SH)));
		return DE;

		function sq(v) { return v * v; }
		function atan(y, x) { const v = Math.toDegrees(Math.atan2(y, x)); return (v < 0) ? (v + 360) : v; }
		function sin(deg) { return Math.sin(Math.toRadians(deg)); }
		function cos(deg) { return Math.cos(Math.toRadians(deg)); }
	}

	/**
	 * Calculate the color difference between the two colors.
	 * @param {number[]} lab1 L*, a*, b* of CIELAB color 1
	 * @param {number[]} lab2 L*, a*, b* of CIELAB color 2
	 * @param {string} method Method of calculation
	 * @return {number} Color difference
	 */
	static differenceBetweenLab(lab1, lab2, method = 'cie76') {
		if (method === 'cie76') {
			return Evaluation.CIE76(lab1, lab2);
		} else {
			return Evaluation.CIEDE2000(lab1, lab2);
		}
	}


	// Determination of the basic categorical color ----------------------------


	/**
	 * Find the basic categorical color of the specified color.
	 * @param {number[]} yxy Yxy color
	 * @return {string} Basic categorical color
	 */
	static categoryOfYxy([y, sx, sy]) {
		const lum = Math.pow(y * Evaluation._Y_TO_LUM, 0.9);  // magic number

		let diff = Number.MAX_VALUE;
		let clum = 0;
		for (let l of Evaluation._LUM_TABLE) {
			const d = Math.abs(lum - l);
			if (d < diff) {
				diff = d;
				clum = l;
			}
		}
		const t = Evaluation._CC_TABLE[clum];
		sx *= 1000;
		sy *= 1000;
		let dis = Number.MAX_VALUE;
		let cc = 1;
		for (let i = 0; i < 18 * 21; i += 1) {
			if (t[i] === '.') continue;
			const x = (i % 18) * 25 + 150;
			const y = ((i / 18) | 0) * 25 + 75;
			const d = Math.sqrt((sx - x) * (sx - x) + (sy - y) * (sy - y));
			if (d < dis) {
				dis = d;
				cc = t[i];
			}
		}
		const ci = (cc === 'a') ? 10 : parseInt(cc);
		return Evaluation.CATEGORICAL_COLORS[ci];
	}

}

/**
 * They are sensual expressions of color difference by NBS unit.
 * The values represent the lower limit of each range.
 */
Evaluation.NBS_TRACE       = 0.0;
Evaluation.NBS_SLIGHT      = 0.5;
Evaluation.NBS_NOTICEABLE  = 1.5;
Evaluation.NBS_APPRECIABLE = 3.0;
Evaluation.NBS_MUCH        = 6.0;
Evaluation.NBS_VERY_MUCH   = 12.0;

/**
 * Dental Materials J. 27(1), 139-144 (2008)
 */
Evaluation.DE_TO_NBS = 0.92;

/**
 * Basic Categorical Colors
 */
Evaluation.CATEGORICAL_COLORS = [
	'white', 'black', 'red', 'green',
	'yellow', 'blue', 'brown', 'purple',
	'pink', 'orange', 'gray',
];
Evaluation._Y_TO_LUM = 60;
Evaluation._LUM_TABLE = [2, 5, 10, 20, 30, 40];

//=
//=include table/_cc-min.js