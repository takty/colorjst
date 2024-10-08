/**
 * Color vision age-related change simulation (conversion other than lightness).
 * Reference: Katsunori Okajima, Human Color Vision Mechanism and its Age-Related Change,
 * IEICE technical report 109(249), 43-48, 2009-10-15.
 *
 * @author Takuto Yanagida
 * @version 2024-08-19
 */

import { Triplet } from '../type';
import { PI2, atan2rad, mag } from '../math';

function hueDiff(a: number, b: number): number {
	const p = atan2rad(b, a);
	return 4.5 * Math.cos(PI2 * (p - 28.8) / 50.9) + 4.4;
}

function chromaRatio(a: number, b: number): number {
	const c = mag(a, b);
	return 0.83 * Math.exp(-c / 13.3) - (1 / 8) * Math.exp(-(c - 50) * (c - 50) / (3000 * 3000)) + 1;
}


// -----------------------------------------------------------------------------


/**
 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of elderly people (70 years old) (conversion other than lightness).
 * @param {Triplet} lab L*, a*, b* of CIELAB color (young person).
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} CIELAB color in color vision of elderly people.
 */
export function labToElderlyAB([ls, as, bs]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const rad = atan2rad(bs, as) + hueDiff(as, bs);
	const c = mag(as, bs) * chromaRatio(as, bs);
	dest[0] = ls;
	dest[1] = c * Math.cos(rad);
	dest[2] = c * Math.sin(rad);
	return dest;
}

/**
 * Convert CIELAB (L*a*b*) to CIELAB in the color vision of young people (20 years old) (conversion other than lightness).
 * @param {Triplet} lab L*, a*, b* of CIELAB color (elderly person).
 * @param {Triplet} dest dest An array where the result will be stored. If not provided, a new array will be created and returned.
 * @return {Triplet} CIELAB color in color vision of young people.
 */
export function labToYoungAB([ls, as, bs]: Triplet, dest: Triplet = [0, 0, 0]): Triplet {
	const rad = atan2rad(bs, as) - hueDiff(as, bs);
	const c = mag(as, bs) / chromaRatio(as, bs);
	dest[0] = ls;
	dest[1] = c * Math.cos(rad);
	dest[2] = c * Math.sin(rad);
	return dest;
}
