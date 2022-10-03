'use strict';

var dom;

let sDetail = {}

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
	s99 = s0+"s99'>",
	sc = "</span>",
// test icons
	green_tick = "<span style='font-size: 10px;'><b>" + s9.trim() +" \u2713"+ sc + "</b></span>",
	red_cross = "<span style='font-size: 10px;'><b>" + sb.trim() +" \u2715"+ sc + "</b></span>",
	yellow_block = "<span style='font-size: 10px;'><b>" + s4.trim() +" \u2715"+ sc + "</b></span>",
	white_na =  "<span style='font-size: 10px;'><b>" + snc.trim() +" \u2715"+ sc + "</b></span>",
// common results
	zErr = "error",
	zNA = "n/a",
	zU = "undefined",
	zUQ = "\"undefined\"",
	zNEW = sb+"[NEW]"+sc,
// other
	canPerf = false,
	is95 = false,
	isBrave = false,
	isEngine = "",
	isEnginePretty = "", // results string with perf
	isFF = false,
	isFFpretty = "", // results string with perf
	isFFvalid = false, // no errors
	isFile = false,
	isOS = "",
	isRFP = false,
	isSecure = false,
	isTB = false,
	isVer = "",
	isVerMax = ""
