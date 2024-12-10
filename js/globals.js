'use strict';

var dom;

const SECTG = '_global', SECTP = '_prereq', SECTNF = 'NON-FP', SECT98 = 'prototype', SECT99 = 'proxy'

const sectionMap = {
	1: 'screen', 2: 'ua', 3: 'feature', 4: 'region', 5: 'headers', 6: 'storage',
	7: 'devices', 9: 'canvas', 10: 'webgl', 11: 'audio', 12: 'fonts', 13: 'media',
	14: 'css', 15: 'elements', 17: 'timing', 18: 'misc',
}
let sectionOrder = [], // numerical order for objects
	sectionNames = [], // lookup names by number
	sectionNos = {} // lookup numbers by name

// ToDo: expand: some info can go into lies but we could create new items e.g methods/tampered-data
	// some 'methods/entropy' are in the FP: e.g. canvas/domrect or errors e.g. font sizes
const btnList = ['alerts', 'errors', 'lies']

const jsFilesExpected = 14,
	gSectionsExpected = 16,
	expectedMetrics = 145
let jsFiles = 0, gCount = 0, gCountTiming = 0

// global
let gData = { // from sData
	'alertsonce': {'document': {}},
	'errorsonce': {'document': {}},
	'health': {'document': {}},
	'perf': [],
	'timing': {},
}
let gTiming = ['currenttime','date','exslt','mark','navigation','now','performance','reducetimer','resource','timestamp']
let gTimeline

// section
let sData = {}, // final sorted section data: from sDataTemp
	sDataTemp = {}, // unsorted section data
	sDetail = {} // all clickables: lies, fake, valid etc

// scopes
const zFP = 'fingerprint',
	zDOC = 'document',
	zIFRAME = 'iframe'
let isScope = zDOC

// styles
let s0 = " <span class='",
	sb = s0+"bad'>",
	sg = s0+"good'>",
	s1 = s0+"s1'>", // s1+s3+s99: used in perf details
	s3 = s0+"s3'>",
	s99 = s0+"s99'>",
	sc = '</span>'

// common
const zD = 'disabled',
	zE = 'enabled',
	zErr = 'error',
	zErrType = 'TypeError: ',
	zErrTime = 'timed out',
	zErrInvalid = 'Invalid: ',
	zNA = 'n/a',
	zS = 'success',
	zF = 'failed',
	zNEW = sb+'[NEW]'+sc,
	zLIE = 'untrustworthy',
	zSKIP = 'skipped'

let zErrLog = '', // log error in add/Both
	zErrShort = '' // log error in add/Both but display zErr in add/Display

// grab as soon as possible
let isInitial = {height: {}, width: {}}
function get_scr_initial() {
	// we don't need any error entropy: we get these properties again later
	let x, oList = {height: ['innerHeight','outerHeight'], width: ['innerWidth','outerWidth']}
	for (const axis of Object.keys(oList)) {
		let aList = oList[axis]
		aList.forEach(function(k){
			try {
				x = window[k]
				if ('number' !== typeof x || Number.isNaN(x)) {x = zErr}
			} catch(e) {
				x = zErr
			}
			if (k.includes('inner')) {k = 'inner'} else {k = 'outer'}
			isInitial[axis][k] = x
		})
	}
}
get_scr_initial()
let avh = 'undefined' // android

// notation
	// https://en.wikipedia.org/wiki/Check_mark
	// https://en.wikipedia.org/wiki/X_mark
const tick = '✓', // ✓ u2713, 🗸 u1F5F8
	cross = '✗', // ✗ u2717, 🗴 u!F5F4, 🞩 u1F7A9
	green_tick = sg+"<span class='health'>"+ tick +'</span>'+sc,
	red_cross = sb+"<span class='health'>"+ cross +'</span>'+ sc,
	sgtick = sg +"[<span class='health'>"+ tick +'</span> ', 
	sbx = sb +"[<span class='health'>" + cross +'</span> ',
	rfp_green = sgtick+'RFP]'+sc,
	rfp_red = sbx+'RFP]'+sc,
	silent_green = sg +"[<span class='healthsilent'>"+ tick +'</span>]'+ sc,
	silent_red = sb +"[<span class='healthsilent'>" + cross +'</span>]'+ sc,
	lb_green = sgtick+'LB]'+sc,
	lb_red = sbx+'LB]'+sc,
	nw_green = sgtick+'RFP newwin]'+sc,
	nw_red = sbx+'RFP newwin]'+sc,
	default_green = sgtick+'default]'+sc,
	default_red = sbx+'default]'+sc,
	match_green = sgtick+'match]'+sc,
	match_red = sbx+'match]'+sc,
	fpp_green = sgtick+'FPP]'+sc,
	lang_green = sgtick+' languages]'+sc,
	lang_red = sbx+' languages]'+sc,
	locale_green = sgtick+' locale]'+sc,
	locale_red = sbx+' locale]'+sc,
	intl_green = sgtick+' intl]'+sc,
	intl_red = sbx+' intl]'+sc,
	tz_green = sgtick+' timezone]'+sc,
	tz_red = sbx+' timezone]'+sc,
	position_green = sgtick+'RFP positions]'+sc,
	position_red = sbx+'RFP positions]'+sc,
	orientation_green = sgtick+'RFP orientation]'+sc,
	orientation_red = sbx+'RFP orientation]'+sc

const screen_green = sgtick+'screens match]'+sc,
	screen_red = sbx+'screens match]'+sc,
	window_green = sgtick+'windows match]'+sc,
	window_red = sbx+'windows match]'+sc,
	sizes_green = sgtick+'screen = inner]'+sc,
	sizes_red = sbx+'screen = inner]'+sc,
	isizes_green = sgtick+'iframes = inner]'+sc,
	isizes_red = sbx+'iframes = inner]'+sc

// dynamic TB/MB notation
let tb_green = sgtick+'TB]'+sc,
	tb_red = sbx+'TB]'+sc,
	tb_slider_red = sbx+'TB Slider]'+sc,
	tb_standard = sg+'[TB Standard]'+sc,
	tb_safer = sg+'[TB Safer]'+sc // don't tick/cross slider

// run once
let isArch = true,
	isAutoPlay,
	isAutoPlayError,
	isDevices,
	isFile = false,
	isFileSystem,
	isFileSystemError,
	isGecko = false,
	isMullvad = false,
	isOS,
	isOSErr,
	isRecursion,
	isSystemFont = [],
	isTB = false,
	isVer = 0,
	isVerExtra = '',
	isXML = {}

// region
let languagesSupported = {},
	localesSupported = {},
	isLanguageSmart = false,
	isLanguagesNav = [], // lowercase sorted to compare to systemLanguages
	isLocaleValid,
	isLocaleValue,
	isLocaleAlt, // allow variants in checks e.g. en-CA checks en-US values
	isTimeZoneValid,
	isTimeZoneValue,
	oIntlTests = {},
	oIntlKeys = {}

// other
let aDomRect = [true, true, true, true],
	isDomRect = 0, // default non-gecko
	oDomRect = {},
	isDecimal = false,
	isPerf = false

// overlay metrics
let overlayScope = 'document',
	overlayFP = '_summary',
	overlayHealth = '_summary',
	overlayHealthCount = '',
	overlaySection = '',
	overlayName = '',
	metricsData,
	metricsTitle,
	metricsPrefix = ''

// runtypes
let gt0, gt1,
	gLoad = true,
	gRun = true,
	gClick = true,
	gFS = false, // don't run FS measurements if already tiggered
	gClear = true, // clear console of xml and TB's prototype/proxy errors
	isAllowNonGecko = false, // not supported
	isBlock = true,
	isBlockMin = 115,
	isFontSizesMore = false, // when true: force 3-pass and group/order by name then generic-font-family
	isFontSizesPrevious = false, 
	isSmart = false,
	isSmartMin = 128 // we can't treat TB differently as we haven't gotten isMullvad yet which if true then sets isTB

/** DEV **/
// simulate errors
let runSG = false, // globals: break separately eg isTB, isOS
	runST = false, // throw type
	runSI = false, // throw invalid
	runSE = false, // generic if not thrown
	runTE = false, // cause timeout
	runSF = false, // font enumeration tests
	runSL = false // lies
