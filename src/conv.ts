/**
 * Functions for Color Space Conversion
 *
 * @author Takuto Yanagida
 * @version 2024-08-18
 */

import { Triplet } from './type';

import * as RGB from './cs/rgb';
import * as YIQ from './cs/yiq';
import * as LRGB from './cs/lrgb';
import * as XYZ from './cs/xyz';
import * as Yxy from './cs/yxy';
import * as Lab from './cs/lab';
import * as LCh from './cs/lch';
import * as LMS from './cs/lms';
import * as Munsell from './cs/munsell';
import * as PCCS from './cs/pccs';

/**
 * Convert a color from one color space to another.
 * @param {Triplet} vs a color of the color space 'from'
 * @param {string} from a color space name
 * @param {string=} [to='rgb'] a color space name
 * @return {Triplet} a color of the color space 'to'
 */
export function convert(vs: Triplet, from: string, to: string | undefined = 'rgb'): Triplet {
	const type = from.toLowerCase() + '-' + to.toLowerCase();
	switch (type) {
		case 'yiq-rgb'     : return RGB.fromLRGB(LRGB.fromYIQ(vs));
		case 'lrgb-rgb'    : return RGB.fromLRGB(vs);
		case 'xyz-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(vs));
		case 'yxy-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(vs)));
		case 'lch-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs))));
		case 'lms-rgb'     : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-rgb' : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-rgb'    : return RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-lrgb'    : return LRGB.fromRGB(vs);
		case 'yiq-lrgb'    : return LRGB.fromYIQ(vs);
		case 'xyz-lrgb'    : return LRGB.fromXYZ(vs);
		case 'yxy-lrgb'    : return LRGB.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-lrgb'    : return LRGB.fromXYZ(XYZ.fromLab(vs));
		case 'lch-lrgb'    : return LRGB.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'lms-lrgb'    : return LRGB.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-lrgb': return LRGB.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lrgb'   : return LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-yiq'     : return YIQ.fromLRGB(LRGB.fromRGB(vs));
		case 'lrgb-yiq'    : return YIQ.fromLRGB(vs);
		case 'xyz-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(vs));
		case 'yxy-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(vs)));
		case 'lch-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs))));
		case 'lms-yiq'     : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-yiq' : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-yiq'    : return YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-xyz'     : return XYZ.fromLRGB(LRGB.fromRGB(vs));
		case 'yiq-xyz'     : return XYZ.fromLRGB(LRGB.fromYIQ(vs));
		case 'lrgb-xyz'    : return XYZ.fromLRGB(vs);
		case 'yxy-xyz'     : return XYZ.fromYxy(vs);
		case 'lab-xyz'     : return XYZ.fromLab(vs);
		case 'lch-xyz'     : return XYZ.fromLab(Lab.fromLCh(vs));
		case 'lms-xyz'     : return XYZ.fromLMS(vs);
		case 'munsell-xyz' : return XYZ.fromMunsell(vs);
		case 'pccs-xyz'    : return XYZ.fromMunsell(Munsell.fromPCCS(vs));

		case 'rgb-yxy'     : return Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-yxy'     : return Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-yxy'    : return Yxy.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-yxy'     : return Yxy.fromXYZ(vs);
		case 'lab-yxy'     : return Yxy.fromXYZ(XYZ.fromLab(vs));
		case 'lch-yxy'     : return Yxy.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'lms-yxy'     : return Yxy.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-yxy' : return Yxy.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-yxy'    : return Yxy.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-lab'     : return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-lab'     : return Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-lab'    : return Lab.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-lab'     : return Lab.fromXYZ(vs);
		case 'lch-lab'     : return Lab.fromLCh(vs);
		case 'yxy-lab'     : return Lab.fromXYZ(XYZ.fromYxy(vs));
		case 'lms-lab'     : return Lab.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-lab' : return Lab.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lab'    : return Lab.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-lch'     : return LCh.fromLab(Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs))));
		case 'yiq-lch'     : return LCh.fromLab(Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs))));
		case 'lrgb-lch'    : return LCh.fromLab(Lab.fromXYZ(XYZ.fromLRGB(vs)));
		case 'xyz-lch'     : return LCh.fromLab(Lab.fromXYZ(vs));
		case 'lab-lch'     : return LCh.fromLab(vs);
		case 'yxy-lch'     : return LCh.fromLab(Lab.fromXYZ(XYZ.fromYxy(vs)));
		case 'lms-lch'     : return LCh.fromLab(Lab.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-lch' : return LCh.fromLab(Lab.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-lch'    : return LCh.fromLab(Lab.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-lms'     : return LMS.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-lms'     : return LMS.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-lms'    : return LMS.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-lms'     : return LMS.fromXYZ(vs);
		case 'yxy-lms'     : return LMS.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-lms'     : return LMS.fromXYZ(XYZ.fromLab(vs));
		case 'lch-lms'     : return LMS.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'munsell-lms' : return LMS.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lms'    : return LMS.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-munsell' : return Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-munsell' : return Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-munsell': return Munsell.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-munsell' : return Munsell.fromXYZ(vs);
		case 'yxy-munsell' : return Munsell.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-munsell' : return Munsell.fromXYZ(XYZ.fromLab(vs));
		case 'lch-munsell' : return Munsell.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'lms-munsell' : return Munsell.fromXYZ(XYZ.fromLMS(vs));
		case 'pccs-munsell': return Munsell.fromPCCS(vs);

		case 'rgb-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs))));
		case 'yiq-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs))));
		case 'lrgb-pccs'   : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(vs)));
		case 'xyz-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(vs));
		case 'yxy-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLab(vs)));
		case 'lch-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs))));
		case 'lms-pccs'    : return PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-pccs': return PCCS.fromMunsell(vs);
	}
	return vs;
}
export function getConverter(from: string, to: string = 'rgb') {
	const type = from.toLowerCase() + '-' + to.toLowerCase();
	switch (type) {
		case 'yiq-rgb'     : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromYIQ(vs));
		case 'lrgb-rgb'    : return (vs: Triplet) => RGB.fromLRGB(vs);
		case 'xyz-rgb'     : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromXYZ(vs));
		case 'yxy-rgb'     : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-rgb'     : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(vs)));
		case 'lch-rgb'     : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs))));
		case 'lms-rgb'     : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-rgb' : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-rgb'    : return (vs: Triplet) => RGB.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-lrgb'    : return (vs: Triplet) => LRGB.fromRGB(vs);
		case 'yiq-lrgb'    : return (vs: Triplet) => LRGB.fromYIQ(vs);
		case 'xyz-lrgb'    : return (vs: Triplet) => LRGB.fromXYZ(vs);
		case 'yxy-lrgb'    : return (vs: Triplet) => LRGB.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-lrgb'    : return (vs: Triplet) => LRGB.fromXYZ(XYZ.fromLab(vs));
		case 'lch-lrgb'    : return (vs: Triplet) => LRGB.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'lms-lrgb'    : return (vs: Triplet) => LRGB.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-lrgb': return (vs: Triplet) => LRGB.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lrgb'   : return (vs: Triplet) => LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-yiq'     : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromRGB(vs));
		case 'lrgb-yiq'    : return (vs: Triplet) => YIQ.fromLRGB(vs);
		case 'xyz-yiq'     : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromXYZ(vs));
		case 'yxy-yiq'     : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-yiq'     : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(vs)));
		case 'lch-yiq'     : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs))));
		case 'lms-yiq'     : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-yiq' : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-yiq'    : return (vs: Triplet) => YIQ.fromLRGB(LRGB.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-xyz'     : return (vs: Triplet) => XYZ.fromLRGB(LRGB.fromRGB(vs));
		case 'yiq-xyz'     : return (vs: Triplet) => XYZ.fromLRGB(LRGB.fromYIQ(vs));
		case 'lrgb-xyz'    : return (vs: Triplet) => XYZ.fromLRGB(vs);
		case 'yxy-xyz'     : return (vs: Triplet) => XYZ.fromYxy(vs);
		case 'lab-xyz'     : return (vs: Triplet) => XYZ.fromLab(vs);
		case 'lch-xyz'     : return (vs: Triplet) => XYZ.fromLab(Lab.fromLCh(vs));
		case 'lms-xyz'     : return (vs: Triplet) => XYZ.fromLMS(vs);
		case 'munsell-xyz' : return (vs: Triplet) => XYZ.fromMunsell(vs);
		case 'pccs-xyz'    : return (vs: Triplet) => XYZ.fromMunsell(Munsell.fromPCCS(vs));

		case 'rgb-yxy'     : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-yxy'     : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-yxy'    : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-yxy'     : return (vs: Triplet) => Yxy.fromXYZ(vs);
		case 'lab-yxy'     : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromLab(vs));
		case 'lch-yxy'     : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'lms-yxy'     : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-yxy' : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-yxy'    : return (vs: Triplet) => Yxy.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-lab'     : return (vs: Triplet) => Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-lab'     : return (vs: Triplet) => Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-lab'    : return (vs: Triplet) => Lab.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-lab'     : return (vs: Triplet) => Lab.fromXYZ(vs);
		case 'lch-lab'     : return (vs: Triplet) => Lab.fromLCh(vs);
		case 'yxy-lab'     : return (vs: Triplet) => Lab.fromXYZ(XYZ.fromYxy(vs));
		case 'lms-lab'     : return (vs: Triplet) => Lab.fromXYZ(XYZ.fromLMS(vs));
		case 'munsell-lab' : return (vs: Triplet) => Lab.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lab'    : return (vs: Triplet) => Lab.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-lch'     : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs))));
		case 'yiq-lch'     : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs))));
		case 'lrgb-lch'    : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(XYZ.fromLRGB(vs)));
		case 'xyz-lch'     : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(vs));
		case 'lab-lch'     : return (vs: Triplet) => LCh.fromLab(vs);
		case 'yxy-lch'     : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(XYZ.fromYxy(vs)));
		case 'lms-lch'     : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-lch' : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(XYZ.fromMunsell(vs)));
		case 'pccs-lch'    : return (vs: Triplet) => LCh.fromLab(Lab.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs))));

		case 'rgb-lms'     : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-lms'     : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-lms'    : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-lms'     : return (vs: Triplet) => LMS.fromXYZ(vs);
		case 'yxy-lms'     : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-lms'     : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromLab(vs));
		case 'lch-lms'     : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'munsell-lms' : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromMunsell(vs));
		case 'pccs-lms'    : return (vs: Triplet) => LMS.fromXYZ(XYZ.fromMunsell(Munsell.fromPCCS(vs)));

		case 'rgb-munsell' : return (vs: Triplet) => Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs)));
		case 'yiq-munsell' : return (vs: Triplet) => Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs)));
		case 'lrgb-munsell': return (vs: Triplet) => Munsell.fromXYZ(XYZ.fromLRGB(vs));
		case 'xyz-munsell' : return (vs: Triplet) => Munsell.fromXYZ(vs);
		case 'yxy-munsell' : return (vs: Triplet) => Munsell.fromXYZ(XYZ.fromYxy(vs));
		case 'lab-munsell' : return (vs: Triplet) => Munsell.fromXYZ(XYZ.fromLab(vs));
		case 'lch-munsell' : return (vs: Triplet) => Munsell.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs)));
		case 'lms-munsell' : return (vs: Triplet) => Munsell.fromXYZ(XYZ.fromLMS(vs));
		case 'pccs-munsell': return (vs: Triplet) => Munsell.fromPCCS(vs);

		case 'rgb-pccs'    : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromRGB(vs))));
		case 'yiq-pccs'    : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(LRGB.fromYIQ(vs))));
		case 'lrgb-pccs'   : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLRGB(vs)));
		case 'xyz-pccs'    : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(vs));
		case 'yxy-pccs'    : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromYxy(vs)));
		case 'lab-pccs'    : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLab(vs)));
		case 'lch-pccs'    : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLab(Lab.fromLCh(vs))));
		case 'lms-pccs'    : return (vs: Triplet) => PCCS.fromMunsell(Munsell.fromXYZ(XYZ.fromLMS(vs)));
		case 'munsell-pccs': return (vs: Triplet) => PCCS.fromMunsell(vs);
	}
	return (vs: Triplet) => vs;
}
