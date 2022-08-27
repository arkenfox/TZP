'use strict';
dom = getUniqueElements();

/*** GENERIC ***/

const newFn = x => typeof x != 'string' ? x : new Function(x)()
function rnd_string() {return Math.random().toString(36).substring(2, 15)}
function rnd_number() {return Math.floor((Math.random() * (99999-10000))+10000)}
function count_decimals(value) {if(Math.floor(value) === value) return 0;return value.toString().split(".")[1].length || 0}

function getUniqueElements() {
	const dom = document.getElementsByTagName('*')
	return new Proxy(dom, {
		get: function(obj, prop) {return obj[prop]},
		set: function(obj, prop, val) {obj[prop].textContent = `${val}`; return true}
	})
}

function buildButton(colorCode, arrayName, displayText, functionName, btnType) {
	if (functionName == undefined) {functionName = "showDetail"}
	if (btnType == undefined) {btnType = "btnc"}
	return " <span class='btn"+ colorCode +" "+ btnType +"' onClick='"
		+ functionName +"(`"+ arrayName +"`)'>["+ displayText +"]</span>"
}

/*** HASH ***/

function mini(str) {
	// https://stackoverflow.com/a/22429679
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).slice(-8)
}

function mini_sha1(str) {
	return sha1(mini(str))
}

function sha1(str1){
	for (var blockstart=0,
		i = 0,
		W = [],
		H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0],
		A, B, C, D, F, G,
		word_array = [],
		temp2,
		s = unescape(encodeURI(str1)),
		str_len = s.length;
		i<=str_len;){
		word_array[i>>2] |= (s.charCodeAt(i)||128)<<(8*(3-i++%4));
	}
	word_array[temp2 = ((str_len+8)>>6<<4)+15] = str_len<<3;
	for (; blockstart <= temp2; blockstart += 16) {
		A = H,i=0;
		for (; i < 80;
			A = [[
				(G = ((s=A[0])<<5|s>>>27) + A[4] + (W[i] = (i<16) ? ~~word_array[blockstart + i] : G<<1|G>>>31) + 1518500249) + ((B=A[1]) & (C=A[2]) | ~B & (D=A[3])),
				F = G + (B ^ C ^ D) + 341275144,
				G + (B & C | B & D | C & D) + 882459459,
				F + 1535694389
			][0|i++/20] | 0, s, B<<30|B>>>2, C, D]
		) {
			G = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
		}
		for(i=5;i;) H[--i] = H[i] + A[i] | 0;
	}
	for(str1='';i<40;)str1 += (H[i>>3] >> (7-i++%8)*4 & 15).toString(16);
	return str1
}

/*** GLOBAL VARS ***/

function get_canPerf() {
	// check performance.now
	try {
		let testPerf = performance.now()
		canPerf = true
	} catch(e) {
		canPerf = false
	}
}

const get_globals = () => new Promise(resolve => {
	// immutables: do once but promise from each test page if used
	// might as well
	if ((location.protocol) == "file:") {isFile = true; note_file = sn +"[file:]"+ sc}
	if ((location.protocol) == "https:") {isSecure = true}
	// always check canPerf
	get_canPerf()
	let tstart

	// engine
	if (canPerf) {tstart = performance.now()}
	// we use > not >= which means 50% or more to break an engine check
		// e.g always use odd
			// 9 all same: to get under/over 4.5 you would need to lie about 5/9 = 56%
		// e.g. even
			// 8 true: to get 4-or-lower you would need to lie about 4/8
			// 8 false: to get over 4 you would need to lie about 5/8
	let oEngines = {
		"blink": [
			"number" === typeof TEMPORARY,
			"object" === typeof onappinstalled,
			"object" === typeof onbeforeinstallprompt,
			"object" === typeof ondeviceorientationabsolute,
			"object" === typeof onpointerrawupdate,
			"object" === typeof onsearch,
			"boolean" === typeof originAgentCluster,
			"object" === typeof trustedTypes,
			"function" === typeof webkitResolveLocalFileSystemURL,
		],
		"webkit": [
			"object" === typeof browser,
			"function" === typeof getMatchedCSSRules,
			"object" === typeof safari,
			"function" === typeof showModalDialog,
			"function" === typeof webkitConvertPointFromNodeToPage,
			"function" === typeof webkitCancelRequestAnimationFrame,
			"object" === typeof webkitIndexedDB,
		],
		"gecko": [
			"function" === typeof dump,
			"boolean" === typeof fullScreen,
			"object" === typeof onloadend,
			"object" === typeof onabsolutedeviceorientation,
			"function" === typeof scrollByLines,
			"number" === typeof scrollMaxY,
			"function" === typeof setResizable,
			"function" === typeof sizeToContent,
			"function" === typeof updateCommands,
		],
		"edgeHTML": [
			"function" === typeof clearImmediate,
			"function" === typeof msWriteProfilerMark,
			"object" === typeof oncompassneedscalibration,
			"object" === typeof onmsgesturechange,
			"object" === typeof onmsinertiastart,
			"object" === typeof onreadystatechange,
			//"object" === typeof onvrdisplayfocus,
			"function" === typeof setImmediate,
		]
	}
	// array engine matches, so subsequent results doesn't override prev
	let aEngine = []
	for (const engine of Object.keys(oEngines).sort()) {
		let sumE = oEngines[engine].reduce((prev, current) => prev + current, 0)
		if (sumE > (oEngines[engine].length/2)) {aEngine.push(engine)}
	}
	if (aEngine.length == 1) {isEngine = aEngine[0]} // valid one result
	// perf
	let tend; if (canPerf) {tend = performance.now()}
	// re-tidy vars
	if (isEngine == "gecko") {
		isFF = true
		// check for PM28+ : fails 53
		if ("function" !== typeof CSSMozDocumentRule) {
			isEngine = "goanna"
		}
	}
	// build a pretty display
	let displayAll = []
	for (const engine of Object.keys(oEngines).sort()) {
		let displayE = []
		oEngines[engine].forEach(function(check) {
			displayE.push(check ? green_tick : red_cross)
		})
		displayAll.push(displayE.join(""))
	}
	isEnginePretty = (canPerf ? (Math.round(tend-tstart)) +" ms |" : "") + displayAll.join(" |")
			+ " | " + (isEngine == "" ? "UNKNOWN" : isEngine.toUpperCase())

	// isFF: gecko 10 more tests
	if (canPerf) {tstart = performance.now()}
	try {
		let list = [
			[DataTransfer, "DataTransfer", "mozSourceNode"],
			[Document, "Document", "mozFullScreen"],
			[HTMLCanvasElement, "HTMLCanvasElement", "mozPrintCallback"],
			[HTMLElement, "HTMLElement", "onmozfullscreenerror"],
			[HTMLInputElement, "HTMLInputElement", "mozIsTextField"],
			[HTMLVideoElement, "HTMLVideoElement", "mozDecodedFrames"],
			[IDBIndex, "IDBIndex", "mozGetAllKeys"],
			[IDBObjectStore, "IDBObjectStore", "mozGetAll"],
			[Screen, "Screen", "mozOrientation"],
			[SVGElement, "SVGElement", "onmozfullscreenchange"] 
		]
		let obj, aNo = []
		list.forEach(function(array) {
			obj = array[0]
			if ("function" === typeof obj
				&& ("object" === typeof Object.getOwnPropertyDescriptor(obj.prototype, array[2]))
			) {
			} else {
				aNo.push(array[1])
			}
		})
		let tend; if (canPerf) {tend = performance.now()}
		let found = (list.length - aNo.length)
		if (found > 5) {
			isFF = true
			isEngine = "gecko"
			// check for PM28+ : fails 53
			if ("function" !== typeof CSSMozDocumentRule) {
				isEngine = "goanna"
			}
		}
		// build a pretty display
		let display = []
		list.forEach(function(array) {
			let check = aNo.includes(array[1]) ? red_cross : green_tick
			display.push(check)
		})
		isFFvalid = true
		let strYou = " | are you " + (isEngine == "goanna" ? "goanna" : "gecko") + "? "
			+ (isFF ? sg.trim() + "YES" : sb.trim() + "NO") + sc

		isFFpretty = (canPerf ? (Math.round(tend-tstart)) +" ms |" : "")
			+ display.join("") + strYou
	} catch(e) {
		isFFvalid = false
		isFFpretty = sb.trim() + e.name +": "+ sc + e.message
	}

	return resolve()
})

function get_is95() {
	// requires a dom element
	return new Promise(resolve => {
		if (!isFF) {
			return resolve()
		}
		// pre-compute slow 95 test
		if ("function" === typeof self.structuredClone && "function" !== typeof crypto.randomUUID) {
			// ^ do if 94+ but not 95+ fast path
			try {
				if ("sc" !== Intl.PluralRules.supportedLocalesOf("sc").join()) {
					// but not if 96+
					let ratio = dom.test95a.offsetWidth/dom.test95b.offsetWidth
					is95 = (ratio > 0.4 && ratio < 0.6)
				}
			} catch(e) {
				console.debug(e.name, e.message)
			}
		}
		return resolve()
	})
}

const get_isOS = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
	try {
		let el = dom.widget0
		let font = getComputedStyle(el).getPropertyValue("font-family")
		if (font.slice(0,12) == "MS Shell Dlg") {isOS = "windows"
		} else if (font.slice(0,12) == "\"MS Shell Dl") {isOS = "windows" // FF57 has a slice and escape char issue
		} else if (font == "Roboto") {isOS = "android"
		} else if (font == "-apple-system") {isOS = "mac"
		} else {isOS = "linux"}
		return resolve()
	} catch(e) {
		console.error(e.name, e.emssage)
		return resolve()
	}
})

const get_isRFP = () => new Promise(resolve => {
	// FF65+: not worth promising isVer to check FF64 or lower
	isRFP = false
	if (!isFF) {return resolve()}
	let isPerf2 = true
	if (Math.trunc(performance.now() - performance.now()) !== 0) {isPerf2 = false}
	try {
		performance.mark("a")
		let r = performance.getEntriesByName("a","mark").length
			+ performance.getEntries().length
			+ performance.getEntries({name:"a",entryType:"mark"}).length
			+ performance.getEntriesByName("a","mark").length
			performance.clearMarks()
		isRFP = (r == 0)
		if (!isPerf2) {isRFP = false}
		return resolve()
	} catch(e) {
		return resolve()
	}
})

const get_isTB = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
	try {
		// extensions can block resources://
			// FF ~5ms, TB ~20ms
		setTimeout(() => resolve(false), 100)
		let css = document.createElement("link")
		css.href = "resource://torbutton-assets/aboutTor.css"
		css.type = "text/css"
		css.rel = "stylesheet"
		document.head.appendChild(css)
		css.onload = function() {
			isTB = true
			return resolve()
		}
		css.onerror = function() {
			return resolve()
		}
		document.head.removeChild(css)
	} catch(e) {
		return resolve()
	}
})

const get_isVer = () => new Promise(resolve => {
	// NOTE: requires dom for 95 and 76, and a promised is95
	if (!isFF) {return resolve()}
	function output(verNo) {
		isVer = verNo
		return resolve()
	}
	// avoid false returns with forks
	if ("function" !== typeof CSSMozDocumentRule) {
		// palemoon/basilisk: fails 53
		output(52)
		return
	} else if ("function" === typeof AbortSignal && "undefined" !== typeof HTMLAppletElement) {
		// waterfox classic: 57 pass, 56 fail
		// but waterfox (v78) also fails 56, so test that as well
		if (!window.Document.prototype.hasOwnProperty("replaceChildren")) {
			output(52)
			return
		}
	}
	output(cascade())

	function cascade() {
		isVerMax = 106
		if (Element.prototype.hasOwnProperty("checkVisibility")) return 106 // 1777293
		try {structuredClone((() => {}))} catch(e) {if (e.message.length == 36) return 105} // 830716
		if (SVGStyleElement.prototype.hasOwnProperty("disabled")) return 104 // 1712623
		if (undefined === new ErrorEvent("error").error) return 103 // 1772494
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("direction")) {
			if (Array(1).includes()) return 102 // 1767541: regression FF99
			return 101 // 1728999
		}
		if ("function" === typeof AbortSignal.timeout) return 100 // 1753309
		try {newFn("class A { #x; h(o) { return !#x in o; }}")} catch(e) {if (e.message.length == 72) return 99} // 1711715 + 1756204
		if (HTMLElement.prototype.hasOwnProperty("outerText")) return 98 // 1709790
		if ("function" === typeof AbortSignal.prototype.throwIfAborted) return 97 // 1745372
		if ("undefined" === typeof Object.toSource
			&& "sc" === Intl.PluralRules.supportedLocalesOf("sc").join()) return 96 // 1738422
			// ^ legacy perf: toSource (74+): FF68- very slow
		if ("function" === typeof crypto.randomUUID) return 95 // 1723674: fast path pref
		if (is95) return 95 // 1674204
			// ^ pre-computed
		if ("function" === typeof self.structuredClone) return 94 // 1722576
		if ("function" === typeof self.reportError) return 93 // 1722448
		if ("function" === typeof Object.hasOwn) return 92 // 1721149
		if ("object" === typeof window.clientInformation) return 91 // 1717072 fast path pref
		try {if ("sa" === Intl.Collator.supportedLocalesOf("sa").join()) return 91} catch(e) {} // 1714933
		if ("function" === typeof Array.prototype.at) return 90 // 1681371
		if ("function" === typeof CountQueuingStrategy
			&& ! new CountQueuingStrategy({highWaterMark: 1}).hasOwnProperty("highWaterMark")) return 89 // 1684316
			// ^ legacy check FF64- CountQueuingStrategy
		if (":" === document.createElement("a").protocol) return 88 // 1497557
		if (undefined === console.length) return 87 // 1688335
		if ("function" === typeof Intl.DisplayNames) return 86 // 1654116
		try {Object.getOwnPropertyDescriptor(RegExp.prototype, "global").get.call("/a")
			} catch(e) {if (e.message.length == 66) {return 85}} // 1675240
			// ^ replace ?
		if ("function" === typeof PerformancePaintTiming) return 84 // 1518999
		if (!window.HTMLIFrameElement.prototype.hasOwnProperty("allowPaymentRequest")) return 83 // 1665252
		try {if (1595289600000 === Date.parse('21 Jul 20 00:00:00 GMT')) {return 82}} catch(e) {} // 1655947
			// ^ ext fuckery: cydec
		if (new File(["x"], "a/b").name == "a/b") return 81 // 1650607
		if (CSS2Properties.prototype.hasOwnProperty("appearance")) return 80 // 1620467
		if ("function" === typeof Promise.any) return 79 // 1599769 shipped
		if (window.Document.prototype.hasOwnProperty("replaceChildren")) return 78 // 1626015
		if (window.IDBCursor.prototype.hasOwnProperty("request")) return 77 // 1536540
		if (!test76.validity.rangeOverflow) return 76 // 1608010
		if ("function" === typeof Intl.Locale) return 75 // 1613713
		if ("undefined" === typeof Object.toSource) return 74 // 1565170
		if (!VideoPlaybackQuality.prototype.hasOwnProperty("corruptedVideoFrames")) return 73 // 1602163
		if ("boolean" === typeof self.crossOriginIsolated) return 72 // 1591892
		if ("function" === typeof Promise.allSettled) return 71 // 1549176
		if ("function" === typeof Intl.RelativeTimeFormat
			&& "function" === typeof Intl.RelativeTimeFormat.prototype.formatToParts) return 70 // 1473229
			// ^ legacy check: FF64- Intl.RelativeTimeFormat
			// ^ extension fuckery: formatToParts
		try {newFn("let t = 1_050"); return 70} catch(e) {} // 1435818
		if ("function" === typeof Blob.prototype.text) return 69 // 1557121
		if (!HTMLObjectElement.prototype.hasOwnProperty("typeMustMatch")) return 68 // 1548773
		if ("function" === typeof String.prototype.matchAll) return 67 // 1531830
		if ("function" === typeof HTMLSlotElement
			&& "function" === typeof HTMLSlotElement.prototype.assignedElements) return 66 // 1425685
			// ^ legacy check: FF60- HTMLSlotElement
		if (1 === DataView.length) return 65 // 1334813
		if ("number" === typeof window.screenTop) return 64 // 1498860
		if ("desc" === Symbol('desc').description) return 63 // 1472170
		if ("function" === typeof console.timeLog) return 62 // 1458466
		if ("object" === typeof CSS) return 61 // 1455805
		if ("function" !== typeof Animation.prototype.updatePlaybackRate) return 60 // 1436659
		if (!HTMLMediaElement.prototype.hasOwnProperty("mozAutoplayEnabled")) return 59 // 1336400
		if ("function" === typeof Intl.PluralRules) return 58 // 1403318
		if ("function" === typeof AbortSignal) return 57 // 1378342
		if ("undefined" === typeof HTMLAppletElement) return 56 // 1279218
		if ("undefined" === typeof console.timeline) return 55 // 1351795
		if (URL.prototype.hasOwnProperty("toJSON")) return 54 // 1337702
		if ("function" === typeof CSSMozDocumentRule) return 53
		return 52
	}
})

/** GENERAL CLICK FUNCTIONS **/

function copyclip(element) {
	// fallback: e.g FF62-
	function copyExec() {
		if (document.selection) {
			let range = document.body.createTextRange()
			range.moveToElementText(document.getElementById(element))
			range.select().createTextRange()
			document.execCommand("copy")
		} else if (window.getSelection) {
			let range = document.createRange()
			range.selectNode(document.getElementById(element))
			window.getSelection().addRange(range)
			document.execCommand("copy")
		}
	}
	// clipboard API
	if ("clipboard" in navigator) {
console.log("banana")
		try {
			let content = document.getElementById(element).innerHTML
			// remove spans, change linebreaks
			let regex = /<br\s*[\/]?>/gi
			content = content.replace(regex, "\r\n")
			content = content.replace(/<\/?span[^>]*>/g,"")
			// get it
			navigator.clipboard.writeText(content).then(function() {
				// clipboard successfully set
			}, function() {
				// clipboard write failed
				copyExec()
			})
		} catch(e) {
			copyExec()
		}
	} else {
		copyExec()
	}
}

function showDetail(name) {
	if (name == "all") {
		console.log("ALL", sDetail)
	} else {
		let data = sDetail[name],
			hash = mini_sha1(data.join())
		// split+tidy name
		name = name.replace(/\_/g, " ")
		let n = name.indexOf(" "),
			section = name.substring(0,n).toUpperCase(),
			metric = name.substring(n,name.length).trim()
		console.log(section +": "+ metric +": "+ hash, data)
	}
}

function showhide(id, style) {
	let items = document.getElementsByClassName("tog"+ id)
	for (let i=0; i < items.length; i++) {items[i].style.display = style}
}

function togglerows(id, word) {
	let items = document.getElementsByClassName("tog"+ id)
	let	style = items[0].style.display == "table-row" ? "none" : "table-row"
	for (let i=0; i < items.length; i++) {items[i].style.display = style}
	if (word == "btn") {
		word = "[ "+ (style == "none" ? "show" : "hide") +" ]"
	} else {
		word = (style == "none" ? "&#9660; show " : "&#9650; hide ") + (word == "" || word == undefined ? "details" : word)
	}
	try {document.getElementById("label"+ id).innerHTML = word} catch(e) {}
}
