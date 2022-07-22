'use strict';

var dom;

// global snapshot
let jsFiles = [],
	jsFilesExpected = 12,
	gCount = 0,
	gCountExpected = 14,
	// alerts
	gCheck = [],
	gCheckOnce = [],
	// FP
	gData = [],
	gDetail = {},
	// prototype lies
	gLies = [],
	gLiesProxy = [],
	gLiesDetail = {},
	// errors
	gErrors = [],
	gErrorsOnce = [],
	// known
	gKnown = [],
	gKnownDetail = {},
	gKnownOnce = [],
	// bypasses
	gBypassed = [],
	gBypassedOnce = [],
	gBypassedNot = [],
	// methods
	gMethods = [],
	gMethodsDetail = {},
	gMethodsOnce = [],
	// debug
	gDebug = [],
	gDebugOnce = [],
	// perf
	gPerf = [],
	gPerfDetail = [],
	gPerfHash = 0, // excludes _global checks
	gPerfHashDetail = []

// section snapshot
let sData = {},
	sDetail = {},
	sPerfDetail = []
// fluid
let protoLies = [],
	proxyLies = [],
	navKeys = {}

// android
let avh = "",
	firstH = undefined,
	firstW = undefined
try {firstH = window.innerHeight} catch(e) {}
try {firstW = window.innerWidth} catch(e) {}

// css
let s0 = " <span class='",
	smono = s0+"mono'>",
	sb = s0+"bad'>",
	sg = s0+"good'>",
	sf = s0+"faint'>",
	sn = s0+"neutral'>",
	snc = s0+"no_color'>",
	so = s0+"orange'>",
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
	soL = "<code class='lies'>",
	soB = "<code class='bypass'>",
	scC = "</code>",
// show/hide colors
	zhide = "#161b22",
	zshow = "#b3b3b3",
// common results
	zB0 = "blocked",
	zD = "disabled",
	zE = "enabled",
	zErr = "error",
	zNS = "not supported",
	zNA = "n/a",
	zS = "success",
	zF = "failed",
	zU = "undefined",
	zUQ = "\"undefined\"",
	zFF = "Firefox",
	zTB = "Tor Browser",
	zMingw64 = "Firefox [64bit]"+ s3+"[mingw]"+sc,
	zMingw32 = "Firefox [32bit]"+ s3+"[mingw]"+sc,
	zMingw = "Firefox"+ s3+"[mingw]"+sc,
	zSDK64 = "Firefox [64bit]"+ s3+"[winsdk]"+sc,
	zSDK32 = "Firefox [32bit]"+ s3+"[winsdk]"+sc,
	zSDK = "Firefox"+ s3+"[winsdk]"+sc,
	zSIM = " [sim]",
	zNEW = sb+"[NEW]"+sc,
	zLIE = "untrustworthy",
// notes
	tb_green = sg+"[TB]"+sc,
	tb_red = sb+"[TB]"+sc,
	tb_standard = sg+"[TB Standard]"+sc,
	tb_safer = sg+"[TB Safer]"+sc,
	rfp_green = sg+"[RFP]"+sc,
	rfp_red = sb+"[RFP]"+sc,
	rfp_random_green = sg+"[RFP random]"+sc,
	rfp_random_red = sb+"[RFP random]"+sc,
	lb_green = sg+"[LB]"+sc,
	lb_red = sb+"[LB]"+sc,
	nw_green = sg+"[RFP NewWin]"+sc,
	nw_red = sb+"[RFP NewWin]"+sc,
	enUS_green = sg+"[en-US]</span> ",
	enUS_red = sb+"[en-US]</span> ",
	spoof_both_green = sg+"[en-US + RFP]"+sc,
	spoof_both_red = sb+"[en-US +/or RFP]"+sc,
	default_tb_green = sg+"[TB default]"+sc,
	default_tb_red = sb+"[TB default]"+sc,
	default_ff_green = sg+"[FF default]"+sc,
	default_ff_red = sb+"[FF default]"+sc,
	note_random = "[random]"+sc,
	note_noise = "[noise detected]"+sc,
	match_green = sg+"[match]"+sc,
	match_red = sb+"[match]"+sc,
	note_file = "",
	note_ttc = sf+"test to come"+sc,
// other
	isBaseFonts = false, // use whitelist/kBaseFonts
	isPlatformFont = undefined, // from widget for baseFonts
	isBrave = false,
	isBraveMode = 0,
	aBraveMode = ["unknown", "disabled", "standard", "strict"],
	isChannel = "",
	isChrome = "", // chrome://
	isEngine = "",
	isFF = false,
	isFFLegacy = false,
	isFFno = [],
	isFFyes = [],
	isGeckoBlock = false, // stop testing/handling so many old versions
	isGeckoBlockMin = [78, 10], // [FF, TB]
	isGeckoSmart = false, // simplify code
	isGeckoSmartMin = [91, 11], // [FF, TB]
	isFile = false,
	isFork = undefined,
	isLoad = true,
	isLogo = zB0, // logo dimensions: assume blocked
	isMark = "", // watermark dimensions
	isOS = "",
	isOS64 = "unknown",
	isPerf = true,
	canPerf = false,
	isResource = "",
	isResourceMetric = "",
	isRFP = false,
	isSecure = false,
	isTB = false,
	isVer = "",
	isVerPlus = false,
// runtypes
	gt0,
	gLoad = true,
	gRun = true,
	gClick = true

/** DEV **/
// check
let logChkList = false,
	logPerfHash = "", // "", all, sha1, mini, minisha1
	logPerfMini = false, // we set this in code
	logPerfSha1 = false, // ditto
	logPerfMiniSha1 = false, // ditto
	logPseudo = false,
	logScreen = false,
	logStorage = false,
// simulate
	runSE = false, // errors/blocked
	runSL = false, // lies
	runSN = false, // new
	runSU = false, // ua (or use CB)
// block
	runPS = false, // block css pseudo: return x
	runRF = false, // block isRFP = true
	runSP = false, // performance.now()
// cycle simulations
	runCLR = false, // done: color
	runDEP = false, // done: color/pixel depth
	runCSS = false, // done: css styles
	runFNT = false, // done: fonts
	runMDV = false, // done: mediaDevices
	runMTP = false, // done: maxTouchPoints
	runSNC = false, // nav connection
	runSNH = false, // done: nav hardwareConcurrency
	runSNM = false, // done: nav mimeTypes
	runSNP = false, // done: nav plugins
	runUAI = false, // done: ua iframe
	runWFS = false  // done: window.fullScreen
