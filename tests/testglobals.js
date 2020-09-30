'use strict';

var dom;

// css
let s0 = " <span class='",
	sb = s0+"bad'>",
	sg = s0+"good'>",
	sf = s0+"faint'>",
	s1 = s0+"s1'>",
	s2 = s0+"s2'>",
	s3 = s0+"s3'>",
	s4 = s0+"s4'>",
	s5 = s0+"s5'>",
	s6 = s0+"s6'>",
	s7 = s0+"s7'>",
	s8 = s0+"s8'>",
	s9 = s0+"s9'>",
	s10 = s0+"s10'>",
	s11 = s0+"s11'>",
	s12 = s0+"s12'>",
	s13 = s0+"s13'>",
	s14 = s0+"s14'>",
	s15 = s0+"s15'>",
	s16 = s0+"s16'>",
	s17 = s0+"s17'>",
	s18 = s0+"s18'>",
	sc = "</span>",
// common results
	zB0 = "blocked",
	zD = "disabled",
	zE = "enabled",
	zNS = "not supported",
	zNA = "n/a",
	zS = "success",
	zF = "failed",
	zU = "undefined",
	zNEW = sb+"[NEW]"+sc,
// notes
	note_ttc = sf+"test to come"+sc,
// other
	isFF = false,
	isFile = false
