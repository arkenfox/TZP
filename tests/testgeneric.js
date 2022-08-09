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
	// isFF
	try {
		let tstart; if (canPerf) {tstart = performance.now()}
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
		if (found > 5) {isFF = true}
		// build a pretty display
		let display = []
		list.forEach(function(array) {
			let check = aNo.includes(array[1]) ? red_cross : green_tick
			display.push(check)
		})
		isFFvalid = true
		isFFpretty = display.join(" | ") + (canPerf ? " | "+ (tend-tstart) +" ms" : "")
	} catch(e) {
		isFFvalid = false
		isFFpretty = sb.trim() + e.name +": "+ sc + e.message
	}

	// engine
	function cbrt(x) {
		try {
			let y = Math.pow(Math.abs(x), 1 / 3)
			return x < 0 ? -y : y
		} catch(e) {
			return "error"
		}
	}
	let res = []
	for(let i=0; i < 6; i++) {
		try {
			let fnResult = "unknown"
			if (i == 0) {fnResult = cbrt(Math.PI) // polyfill
			} else if (i == 1) {fnResult = Math.log10(7*Math.LOG10E)
			} else if (i == 2) {fnResult = Math.log10(2*Math.SQRT1_2)
			} else if (i == 3) {fnResult = Math.acos(0.123)
			} else if (i == 4) {fnResult = Math.acosh(Math.SQRT2)
			} else if (i == 5) {fnResult = Math.atan(2)
			}
			res.push(fnResult)
		} catch(e) {
			res.push("error")
		}
	}
	let hash = sha1(res.join())
	if (hash == "ede9ca53efbb1902cc213a0beb692fe1e58f9d7a") {isEngine = "blink"
	} else if (hash == "05513f36d87dd78af60ab448736fd0898d36b7a9") {isEngine = "webkit"
	} else if (hash == "38172d9426d77af71baa402940bad1336d3091d0") {isEngine = "edgeHTML"
	} else if (hash == "36f067c652c8cfd9072580fca1f177f07da7ecf0") {isEngine = "trident"
	} else if (hash == "225f4a612fdca4065043a4becff76a87ab324a74") {isEngine = "gecko"
	} else if (hash == "cb89002a8d6fabf859f679fd318dffda1b4ae0ea") {isEngine = "gecko"
	} else if (isFF) {isEngine = "gecko"
	} else if ("chrome" in window) {isEngine = "blink"
	}
	if (isEngine == "") {console.error("isEngine: not found\n", res)}

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
	output(cascade())

	function cascade() {
		if ("function" !== typeof Animation.prototype.updatePlaybackRate) return 59
			// ^ we can skip < FF60 legacy checks now
			// note: we can skip non-gecko checks: this only runs if isFF
		if (Intl.PluralRules.prototype.hasOwnProperty("selectRange")) return 105 // 1780545
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
			&& "sc" == Intl.PluralRules.supportedLocalesOf("sc").join()) return 96 // 1738422
			// ^ legacy perf: toSource (74+): FF68- very slow
		if ("function" === typeof crypto.randomUUID) return 95 // 1723674: fast path pref
		if (is95) return 95 // 1674204
			// ^ pre-computed
		if ("function" === typeof self.structuredClone) return 94 // 1722576
		if ("function" === typeof self.reportError) return 93 // 1722448
		if ("function" === typeof Object.hasOwn) return 92 // 1721149
		if ("object" === typeof window.clientInformation) return 91 // 1717072 fast path pref
		try {if ("sa" == Intl.Collator.supportedLocalesOf("sa").join()) return 91} catch(e) {} // 1714933
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
		return 60 // we already tested <60
	}
})

function check_navKey(property) {
	if (navKeys["trueKeys"]) {return navKeys["trueKeys"].includes(property)} else {return false}
}

const get_navKeys = () => new Promise(resolve => {
	// reset
	navKeys = {}
	// build
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		let trueKeys = keys
		let lastKeyIndex = keys.length
		let fakeKeys = []
		if (isFF) {
			// FF: constructor is always last
			lastKeyIndex = keys.indexOf("constructor")
			trueKeys = keys.slice(0, lastKeyIndex+1)
			fakeKeys = keys.slice(lastKeyIndex+1)
		} else if (isEngine == "blink") {
			// chromium: last key inconsistent
			let knownPoison = ["SharedWorker","Worker","buildID","getVRDisplays","activeVRDisplays","oscpu"]
			trueKeys = keys.filter(x => !knownPoison.includes(x))
			fakeKeys = keys.filter(x => knownPoison.includes(x))
		}
		// remove constructor
		trueKeys = trueKeys.filter(x => !["constructor"].includes(x))
		// set
		navKeys["trueKeys"] = trueKeys
		navKeys["fakeKeys"] = fakeKeys
		// set brave
		if (check_navKey("brave")) {
			isBrave = true
		}
		return resolve()
	} catch(e) {
		console.error("get_navKeys failed", e.name, e.message)
		return resolve()
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
	if (check_navKey("clipboard")) {
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

// auto run
get_navKeys() // used in clipboard
