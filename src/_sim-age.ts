/**
 * This class performs various simulations of color space.
 *
 * @author Takuto Yanagida
 * @version 2024-08-01
 */

import { Triplet } from './_type';

export class AgeSimulation {
	/*
	 * Color vision age-related change simulation (conversion other than lightness)
	 * Reference: Katsunori Okajima, Human Color Vision Mechanism and its Age-Related Change,
	 * IEICE technical report 109(249), 43-48, 2009-10-15.
	 */

	private static _hueDiff(a: number, b: number): number {
		const p = (b > 0) ? Math.atan2(b, a) : (Math.atan2(-b, -a) + Math.PI);
		return 4.5 * Math.cos(2 * Math.PI * (p - 28.8) / 50.9) + 4.4;
	}

	private static _chromaRatio(a: number, b: number): number {
		const c = Math.sqrt(a * a + b * b);
		return 0.83 * Math.exp(-c / 13.3) - (1 / 8) * Math.exp(-(c - 50) * (c - 50) / (3000 * 3000)) + 1;
	}

	/**
	 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of elderly people (70 years old) (conversion other than lightness).
	 * @param {Triplet} lab L*, a*, b* of CIELAB color (young person)
	 * @return {Triplet} CIELAB color in color vision of elderly people
	 */
	static labToElderlyAB([ls, as, bs]: Triplet): Triplet {
		const h = ((bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI)) + AgeSimulation._hueDiff(as, bs);
		const c = Math.sqrt(as * as + bs * bs) * AgeSimulation._chromaRatio(as, bs);
		return [
			ls,
			Math.cos(h) * c,
			Math.sin(h) * c,
		];
	}

	/**
	 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of young people (20 years old) (conversion other than lightness).
	 * @param {Triplet} lab L*, a*, b* of CIELAB color (elderly person)
	 * @return {Triplet} CIELAB color in color vision of young people
	 */
	static labToYoungAB([ls, as, bs]: Triplet): Triplet {
		const h = ((bs > 0) ? Math.atan2(bs, as) : (Math.atan2(-bs, -as) + Math.PI)) - AgeSimulation._hueDiff(as, bs);
		const c = Math.sqrt(as * as + bs * bs) / AgeSimulation._chromaRatio(as, bs);
		return [
			ls,
			Math.cos(h) * c,
			Math.sin(h) * c,
		];
	}
}
