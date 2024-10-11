'use strict';
dom = getUniqueElements();

/*** GENERIC ***/

const newFn = x => typeof x != 'string' ? x : new Function(x)()
function rnd_string() {return Math.random().toString(36).substring(2, 15)}
function rnd_number() {return Math.floor((Math.random() * (99999-10000))+10000)}
function count_decimals(value) {if(Math.floor(value) === value) return 0;return value.toString().split(".")[1].length || 0}
function removeElementFn(id) {try {dom[id].remove()} catch(e) {}}

function cleanFn(item, skipArray = false) {
	// strings, tidy undefined, empty strings
	if (typeof item === "number" || typeof item === "bigint") { return item
	} else if (item == zU) {item = zUQ
	} else if (item == "true" || item == "false" || item == "null") {item = "\"" + item + "\""
	} else if (!skipArray && Array.isArray(item)) {
		item = !item.length ? "empty array" : "array"
	} else if (item === undefined || item === true || item === false || item === null) {item += ""
	} else if (!skipArray && item == "") {item = "empty string"
	} else if (typeof item === "string") {
		if (!Number.isNaN(item*1)) {item = "\"" + item + "\""}
	}
	return item
}

function typeFn(item, isSimple = false) {
	// return a more detailed result
	let type = typeof item
	if ("number" === type) {
		if (Number.isNaN(item)) {type = "NaN"} else if (Infinity === item) {type = Infinity}
	} else if ("string" === type) {
		if (!isSimple) {
			if ("" === item) {type = "empty string"} else if ("" === item.trim()) {type = "whitespace"}
		}
	} else if ("object" === type) {
		if (null === item) {type = "null"
		} else if (Array.isArray(item)) {
			type = "array"
			if (!isSimple) {type = !item.length ? "empty array" : "array"}
		} else {
			if (!isSimple) {
				try {if (0 === Object.keys(item).length) {type = "empty object"}} catch(e) {}
			}
		}
	}
	// do nothing: undefined, bigint, boolean, function
	return type
}

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
	let part1 = arrayName.split(",")[0]
	let part2 = arrayName.split(",")[1] // pass a second parameter (boolean) e.g. domrectspoof non-FF tests
	part2 = part2 == undefined ? "" : part2.trim()
	if (part2 == "true" || part2 == "false") {part2 = ", "+ part2} else {part2 = ""}
	return " <span class='btn"+ colorCode +" "+ btnType +"' onClick='"
		+ functionName +"(`"+ part1 +"`"+ part2 + ")'>["+ displayText +"]</span>"
}

/*** JSON ***/

function json_highlight(json, maxWidth = 65) {
	if (typeof json != 'string') {
		json = json_stringify(json, maxWidth);
	}
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'key';
			} else {
				cls = 'string';
				// color undefined (aka "typeof undefined")
				//if (match == "\"typeof undefined\"") {cls = 'null';}
			}
		} else if (/true|false/.test(match)) {
			cls = 'boolean';
		} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="'+ cls +'">'+ match +'</span>';
	})
}

function json_stringify(passedObj, maxWidth = 65, options = {}) {
	/* https://github.com/lydell/json-stringify-pretty-compact */
	const stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g;
	const indent = JSON.stringify(
		[1],
		undefined,
		options.indent === undefined ? 2 : options.indent
	).slice(2, -3);
	const maxLength =
		indent === ""
			? Infinity
			: options.maxLength === undefined
			? maxWidth // was 80
			: options.maxLength;
	let { replacer } = options;

	return (function _stringify(obj, currentIndent, reserved) {
		if (obj && typeof obj.toJSON === "function") {
			obj = obj.toJSON();
		}

		// display undefined under an alias so we always have the right number of values
		// this is just a display, it does not alter the fingerprint data
		//if (obj === undefined) {obj = "typeof undefined"}

		const string = JSON.stringify(obj, replacer);
		if (string === undefined) {
			return string;
		}
		const length = maxLength - currentIndent.length - reserved;
		if (string.length <= length) {
			const prettified = string.replace(
				stringOrChar,
				(match, stringLiteral) => {
					return stringLiteral || `${match} `;
				}
			);
			if (prettified.length <= length) {
				return prettified;
			}
		}
		if (replacer != null) {
			obj = JSON.parse(string);
			replacer = undefined;
		}
		if (typeof obj === "object" && obj !== null) {
			const nextIndent = currentIndent + indent;
			const items = [];
			let index = 0;
			let start;
			let end;
			if (Array.isArray(obj)) {
				start = "[";
				end = "]";
				const { length } = obj;
				for (; index < length; index++) {
					items.push(
						_stringify(obj[index], nextIndent, index === length - 1 ? 0 : 1) ||
						"null"
					);
				}
			} else {
				start = "{";
				end = "}";
				const keys = Object.keys(obj);
				const { length } = keys;
				for (; index < length; index++) {
					const key = keys[index];
					const keyPart = `${JSON.stringify(key)}: `;
					const value = _stringify(
						obj[key],
						nextIndent,
						keyPart.length + (index === length - 1 ? 0 : 1)
					);
					if (value !== undefined) {
						items.push(keyPart + value);
					}
				}
			}
			if (items.length > 0) {
				return [start, indent + items.join(`,\n${nextIndent}`), end].join(
				`\n${currentIndent}`
				);
			}
		}
	return string;
	})(passedObj, "", 0);
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
			"object" === typeof onpointerrawupdate,
			//"object" === typeof onsearch,
			"boolean" === typeof originAgentCluster,
			"object" === typeof trustedTypes,
			"function" === typeof webkitResolveLocalFileSystemURL,
		],
		"webkit": [
			"object" === typeof browser,
			//"function" === typeof getMatchedCSSRules,
			"object" === typeof safari,
			//"function" === typeof showModalDialog,
			"function" === typeof webkitConvertPointFromNodeToPage,
			"function" === typeof webkitCancelRequestAnimationFrame,
			"object" === typeof webkitIndexedDB,
		],
		"gecko": [
			"function" === typeof dump,
			"boolean" === typeof fullScreen,
			"number" === typeof mozInnerScreenX,
			"function" === typeof scrollByLines,
			"number" === typeof scrollMaxY,
			"function" === typeof setResizable,
			//"function" === typeof sizeToContent,  // removed nightly FF117+ 1832733 / 1600400
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
	function exit() {
		// linux-panel not added until FF89, but we're not expecting widgets to fail until 102 minimum
		if (isOS == "") {isOS = "android"}
		return resolve()
	}

	// FF121+: 1855861
	let count = 0
	const get_event = (css, item) => new Promise(resolve => {
		css.onload = function() {
			isOS = item == "win" ? "windows" : item
			count++
			document.head.removeChild(css)
			exit() // we can only have one
			return resolve()
		}
		css.onerror = function() {
			count++
			document.head.removeChild(css)
			if (count == 3) {exit()}
			return resolve()
		}
	})

	// try harder
	function tryharder() {
		try {
			let path = "chrome://browser/content/extension-", suffix = "-panel.css"
			// 1280128: FF51+ win/mac
			// 1701257: FF89+ linux
			let list = ["win","mac","linux"]
			list.forEach(function(item) {
				let css = document.createElement("link")
				css.href = path + item + suffix
				css.type = "text/css"
				css.rel = "stylesheet"
				document.head.appendChild(css)
				get_event(css, item)
			})
		} catch(e) {
			console.error(e.name, e.emssage)
			return resolve()
		}
	}

	// widget font
	// requires widgetradio on dom
	/*
	<div class="hidden"><input type="radio" id="widgetradio"></div>
	*/
	let aIgnore = [
		'cursive','emoji','fangsong','fantasy','math','monospace','none','sans-serif','serif','system-ui',
		'ui-monospace','ui-rounded','ui-serif','undefined', undefined 
	]
	try {
		let font = getComputedStyle(dom.widgetradio).getPropertyValue("font-family")
		if (aIgnore.includes(font)) {
			// returns generic font-family if #41116 or eventually 1787790
				// mac should still return -apple-system
				// https://gitlab.torproject.org/tpo/applications/tor-browser/-/merge_requests/358
			tryharder()
		} else {
			if (font.slice(0,12) == "MS Shell Dlg") {isOS = "windows"
			} else if (font.slice(0,12) == "\"MS Shell Dl") {isOS = "windows" // FF57 has a slice and escape char issue
			} else if (font == "-apple-system") {isOS = "mac"
			} else if (font == "Roboto") {isOS = "android" // fallback or do some linux use Roboto?
			} else {isOS = "linux"}
			return resolve()
		}
	} catch(e) {
		console.error(e.name, e.emssage)
		tryharder()
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

		let source = "resource://torbutton-assets/aboutTor.css"
		// FF115+ change source: ToDo: TB13+: does not work on android
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("letterSpacing")) {
			source = "chrome://browser/content/abouttor/aboutTor.css"
		}
		let css = document.createElement("link")
		css.href = source
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
		isVerMax = 133
		try {
			let parser = (new DOMParser).parseFromString("<select><option name=''></option></select>", 'text/html')
			if (null === parser.body.firstChild.namedItem('')) return 133 // 1837773
		} catch(e) {}
		try {
			const re = new RegExp('(?:)', 'gv');
			let test132 = RegExp.prototype[Symbol.matchAll].call(re, '𠮷')
			for (let i=0; i < 3; i++) {if (true == test132.next().done) return 132} // 1899413
		} catch(e) {}
		// note: false positives < FF78 (130) < FF79 (131)
			// so we'll wrap those in the FF129 check
		if ('function' === typeof CSS2Properties
			&& CSS2Properties.prototype.hasOwnProperty('WebkitFontFeatureSettings')) {
			try {
				let test131 = new Intl.DateTimeFormat('zh', {calendar: 'chinese', dateStyle: 'medium'}).format(new Date(2033, 9, 1))
				if ('2033' == test131.slice(0,4)) return 131 // 1900196
			} catch(e) {}
			try {new RegExp('[\\00]','u')} catch(e) {
				if (e+'' == 'SyntaxError: invalid decimal escape in regular expression') return 130 // 1907236
			}
			return 129 // 1595620
		}

		// 128: relies on dom.webcomponents.shadowdom.declarative.enabled = true (flipped true in FF123)
		// ToDo: replace or add a fallback
		try {Document.parseHTMLUnsafe('<p></p>').lastModified; return 128} catch(e) {} // 1887817

		try {if ((new Date('15Jan0024')).getYear() > 0) return 127} catch(e) {} // 1894248
		if ("function" === typeof URL.parse) {return 126}
		let el = document.documentElement
		try {if ("Invalid Date" == new Date("Sep 26 Thurs 1995 10:00")) return 125} catch(e) {} // 1872793
		if (!CSS2Properties.prototype.hasOwnProperty("MozUserFocus")) {
			try {
				el.style.zIndex = "calc(1 / max(-0, 0))"
				let test = getComputedStyle(el).zIndex
				el.style.zIndex = "auto"
				if (test > 0) {return 124} // 1867569
			} catch(e) {}
			return 123 // 1871745
		}
		if ("function" === typeof Promise.withResolvers) {
			try {
				el.style.zIndex = "calc(1 / abs(-0))"
				let test = getComputedStyle(el).zIndex
				el.style.zIndex = "auto"
				if (test > 0) {return 122} // 1867558
			} catch(e) {}
			return 121 // 1845586
		}
		if (window.hasOwnProperty("UserActivation")) return 120 // 1791079
		try {location.href = "http://a>b/"} catch(e) {if (e.name === "SyntaxError") return 119} // 1817591
		if ("function" === typeof CSS2Properties && CSS2Properties.prototype.hasOwnProperty("fontSynthesisPosition")) return 118 // 1849010
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("fontStretch")) return 117 // 1842467
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("textRendering")) return 116 // 1839614
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("letterSpacing")) return 115 // 1778909
		if ("function" === typeof CSS2Properties && CSS2Properties.prototype.hasOwnProperty("WebkitTextSecurity")) return 114 // 1826629
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("reset")) return 113 // 1709347
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("roundRect")) return 112 // 1756175
		if (HTMLElement.prototype.hasOwnProperty("translate")) return 111 // 1418449
		if ("object" === typeof ondeviceorientationabsolute) return 110 // 1689631
		if (CSSKeyframesRule.prototype.hasOwnProperty("length")) return 109 // 1789776
		if ("undefined" === typeof onloadend) return 108 // 1574487
		if (!SVGSVGElement.prototype.hasOwnProperty("useCurrentView")) return 107 // 1174097
		if (Element.prototype.hasOwnProperty("checkVisibility")) return 106 // 1777293
		try {structuredClone((() => {}))} catch(e) {if (e.message.length == 36) return 105} // 830716
		if (SVGStyleElement.prototype.hasOwnProperty("disabled")) return 104 // 1712623
		if (undefined === new ErrorEvent("error").error) return 103 // 1772494
		if (CanvasRenderingContext2D.prototype.hasOwnProperty("direction")) {
			if (Array(1).includes()) return 102 // 1767541: regression FF99
			return 101 // 1728999
		}
		if ("function" === typeof AbortSignal && "function" === typeof AbortSignal.timeout) return 100 // 1753309
		try {newFn("class A { #x; h(o) { return !#x in o; }}")} catch(e) {if (e.message.length == 72) return 99} // 1711715 + 1756204
		if (HTMLElement.prototype.hasOwnProperty("outerText")) return 98 // 1709790
		if ("function" === typeof AbortSignal && "function" === typeof AbortSignal.prototype.throwIfAborted) return 97 // 1745372
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
		if ("undefined" === typeof Object.toSource
			&& !window.HTMLIFrameElement.prototype.hasOwnProperty("allowPaymentRequest")) return 83 // 1665252
		try {if (1595289600000 === Date.parse('21 Jul 20 00:00:00 GMT')) {return 82}} catch(e) {} // 1655947
			// ^ ext fuckery: cydec
		if (new File(["x"], "a/b").name == "a/b") return 81 // 1650607
		if ("function" === typeof CSS2Properties && CSS2Properties.prototype.hasOwnProperty("appearance")) return 80 // 1620467
		if ("function" === typeof Promise.any) return 79 // 1599769 shipped
		if (window.Document.prototype.hasOwnProperty("replaceChildren")) return 78 // 1626015
		if (window.IDBCursor.prototype.hasOwnProperty("request")) return 77 // 1536540
		if ("undefined" === typeof Object.toSource
			&& !test76.validity.rangeOverflow) return 76 // 1608010
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
		if ("function" === typeof Animation.prototype.updatePlaybackRate) return 60 // 1436659
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

function hide_overlays() {
	dom.modaloverlay.style.display = "none"
	dom.overlay.style.display = "none"
}

function show_overlay() {
	// this just displays it, test PoCs wil need to populate it beforehabd
	dom.modaloverlay.style.display = "block"
	dom.overlay.style.display = "block"
}

function showDetail(name) {
	if (name == "all") {
		console.log("ALL", sDetail)
	} else {
		let data = sDetail[name]
		let hash = mini(data)
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
	} else if (word == "expand") {
		word = "[ "+ (style == "none" ? "expand" : "collapse") +" ]"
	} else {
		word = (style == "none" ? "&#9660; show " : "&#9650; hide ") + (word == "" || word == undefined ? "details" : word)
	}
	try {document.getElementById("label"+ id).innerHTML = word} catch(e) {}
}

if (location.protocol == "file:") {isFile = true}

