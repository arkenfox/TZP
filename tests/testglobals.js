'use strict';

var dom;

let sectionDetail = {}

// css
let s0 = " <span class='",
	sb = s0+"bad'>",
	sg = s0+"good'>",
	sf = s0+"faint'>",
	sn = s0+"neutral'>",
	snc = s0+"no_color'>",
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
// show/hide text colors
	zhide = "#161b22",
	zshow = "#b3b3b3",
// common results
	zB0 = "blocked",
	zB1 = "script blocked [a]",
	zB2 = "script blocked [b]",
	zB3 = "script blocked [c]",
	zB4 = "script blocked [d]",
	zB5 = "script blocked [e]",
	zB6 = "script blocked [f]",
	zD = "disabled",
	zE = "enabled",
	zNS = "not supported",
	zNA = "n/a",
	zS = "success",
	zF = "failed",
	zU = "undefined",
	zNEW = sb+"[NEW]"+sc,
// notes
	enUS_green = sg+"[en-US]</span> ",
	enUS_red = sb+"[en-US]</span> ",
	note_ttc = sf+"test to come"+sc,
	note_file = "",
// error notes
	se = sb+"[test error: ",
	error_file_404 = se+"file not found]"+sc,
	error_file_cors = sn+"[file:] [Cross-Origin Request Blocked]"+sc,
	error_file_xhr = se+"xhr]"+sc,
	error_iframe = se+"iframe]"+sc,
	error_image = se+"image]"+sc,
	error_global_os = se+"global variable not set]"+sc,
// other
	isFF = false,
	isFile = false,
	isSecure = false,
	isEngine = ""
