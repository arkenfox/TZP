'use strict';

var dom;

const SECTG = "_global", SECTP = "_prereq", SECTNF = "NON-FP",
	SECT1 = "screen", SECT2 = "ua", SECT3 = "feature", SECT4 = "region",
	SECT5 = "headers", SECT6 = "storage", SECT7 = "devices", SECT9 = "canvas",
	SECT10 = "webgl", SECT11 = "audio", SECT12 = "fonts", SECT13 = "media",
	SECT14 = "css", SECT15 = "elements", SECT18 = "misc",
	SECT98 = "prototype", SECT99 = "proxy"

const sectionMap = {
	1: SECT1, 2: SECT2, 3: SECT3, 4: SECT4, 5: SECT5, 6: SECT6, 7: SECT7, 9: SECT9,
	10: SECT10, 11: SECT11, 12: SECT12, 13: SECT13, 14: SECT14, 15: SECT15, 18: SECT18,
	//98: SECT98, 99: SECT99
}

let sectionOrder = [], sectionNames = []

const btnList = ["errors", "lies"] // ToDo: expand e.g alerts

const jsFilesExpected = 14
let gCountExpected = 15
let jsFiles = 0, gCount = 0

// global
let gData = { // from sData
		"errorsonce": {},
		"perf": [],
	},
	gKnown = [], // known, methods, alerts
	gAlert = [],
	gAlertOnce = []

// section
let sData = {}, // final sorted section data: from sDataTemp
	sDataTemp = {}, // unsorted section data
	sDetail = {} // all clickables: lies, fake, valid etc

const zFP = "fingerprint",
	zDOC = "document",
	zIFRAME = "iframe"
let isScope = zDOC

// styles
const s0 = " <span class='",
	sb = s0+"bad'>",
	sg = s0+"good'>",
	s1 = s0+"s1'>", // s1+s3+s99: used in perf details
	s3 = s0+"s3'>",
	s99 = s0+"s99'>",
	sc = "</span>"

// common
const zD = "disabled",
	zE = "enabled",
	zErr = "error",
	zErrType = "TypeError: ",
	zErrTime = "timed out",
	zErrInvalid = "Invalid: ",
	zErrEmpty = "empty",
	zErrParadox = "paradox",
	zNA = "n/a",
	zS = "success",
	zF = "failed",
	zU = "undefined",
	zUQ = "\"undefined\"",
	zNEW = sb+"[NEW]"+sc,
	zLIE = "untrustworthy"

// for android defaults: e.g desktop mode on/off vs TZP forcing width
let isWindow = {}
function get_scr_initial() {
	let x, aList = ["innerHeight", "innerWidth", "outerHeight", "outerWidth"]
	aList.forEach(function(k){
		try {
			x = window[k]
			if (typeof x !== "number") {x = "NaN"}
		} catch(e) {
			x = zErr
		}
		isWindow[k] = x
	})
}
get_scr_initial()
let avh = "undefined" // android

// notation
const tick = "✓", // u2713
	cross = "✗", // u2717
	green_tick = sg+"<span class='health'>"+ tick +"</span>"+sc,
	red_cross = sb+"<span class='health'>"+ cross +"</span>"+ sc,
	sgtick = sg +"[<span class='health'>"+ tick +"</span> ", 
	sbx = sb +"[<span class='health'>" + cross +"</span> ",
	rfp_green = sgtick+"RFP]"+sc,
	rfp_red = sbx+"RFP]"+sc,
	lb_green = sgtick+"LB]"+sc,
	lb_red = sbx+"LB]"+sc,
	nw_green = sgtick+"RFP NewWin]"+sc,
	nw_red = sbx+"RFP NewWin]"+sc,
	default_green = sgtick+"default]"+sc,
	default_red = sbx+"default]"+sc,
	match_green = sgtick+"match]"+sc,
	match_red = sbx+"match]"+sc

const screen_green = sgtick+"screens match]"+sc,
	screen_red = sbx+"screens match]"+sc,
	window_green = sgtick+"windows match]"+sc,
	window_red = sbx+"windows match]"+sc,
	sizes_green = sgtick+"screen matches inner]"+sc,
	sizes_red = sbx+"screen matches inner]"+sc

// dynamic notation
let tb_green = sgtick+"TB]"+sc,
	tb_red = sbx+"TB]"+sc,
	tb_slider_red = sbx+"TB Slider]"+sc,
	intl_green = sgtick+"TB matches locale]"+sc,
	intl_red = sbx+"TB matches locale]"+sc

let tb_standard = sg+"[TB Standard]"+sc,
	tb_safer = sg+"[TB Safer]"+sc // don't tick/cross slider

// run once
let isArch = true,
	isAutoPlay,
	isAutoPlayErr,
	isDevices,
	isFile = false,
	isGecko = false,
	isLogo,
	isMullvad = false,
	isOS,
	isOSErr,
	isSystemFont = [],
	isTB = false,
	isVer = 0,
	isVerExtra = "",
	isWordmark

// other
let aClientRect = [true, true, true, true],
	isClientRect = 0,
	isPerf = false

// runtypes
let gt0, gt1,
	gLoad = true,
	gRun = true,
	gClick = true,
	isAllowNonGecko = false, // not supported: to see what other engines return
	isBlock = true,
	isBlockMin = [102, 12], // [FF, equivalent TB version] isVer only goes to 102
	isFontSizesMore = false, // when true: force 3-pass and group/order by name then generic-font-family
	isFontSizesPrevious, 
	isSmart = false,
	isSmartMin = 115 // we can't treat TB differently as we haven't gotten isMullvad yet which if true then sets isTB

/** DEV **/
// sim
let runSE = false, // errors
	runST = false, // other errors
	runTE = false, // timeout errors
	runSL = false, // lies
	runPS = false, // block css pseudo
// cycle sim
	runUAI = false // ua iframe

