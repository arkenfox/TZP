'use strict';
dom = getUniqueElements()

let is95 = false

/*** GENERIC ***/

const newFn = x => typeof x != 'string' ? x : new Function(x)()
function rnd_string() {return Math.random().toString(36).substring(2, 15)}
function rnd_number() {return Math.floor((Math.random() * (99999-10000))+10000)}
function count_decimals(value) {if(Math.floor(value) === value) return 0;return value.toString().split(".")[1].length || 0}

function cleanFn(item, skipArray = false) {
	// catch strings as strings, tidy undefined, empty strings
	if (typeof item === "number" || typeof item === "bigint") { return item
	} else if (item == zU) {item = zUQ
	} else if (item == "true" || item == "false" || item == "null") {item = "\"" + item + "\""
	} else if (!skipArray && Array.isArray(item)) {
		item = !item.length ? "empty array" : "array"
	} else if (item === undefined || item === true || item === false || item === null) {item += ""
	} else if (!skipArray && item == "") {item = "empty string"
	} else if (typeof item === "string") {
		if (!isNaN(item*1)) {item = "\"" + item + "\""}
	}
	return item
}

function getUniqueElements() {
	const dom = document.getElementsByTagName('*')
	return new Proxy(dom, {
		get: function(obj, prop) {return obj[prop]},
		set: function(obj, prop, val) {obj[prop].textContent = `${val}`; return true}
	})
}

function getElementProp(id, prop, pseudo, noBlock) {
	if (runPS && noBlock === undefined) {
		if (logPseudo) {console.log("pseudo "+ id +": runPS ", true, " returned x")}
		return "x"
	}
	try {
		let item = window.getComputedStyle(document.querySelector(id), pseudo)
		item = item.getPropertyValue(prop)
		if (item == "none") {item = "x"}
		item = item.replace(/"/g,"")
		if (!isNaN(item * 1)) {item = item * 1} // numbers
		if (item == "") {item = "x"} // blanks
		if (logPseudo) {console.log("pseudo "+ id +" "+ pseudo +": "+ item)}
		return item
	} catch(e) {
		log_alert("_generic:element property "+ id +": "+ e.name)
		if (logPseudo) {console.log("pseudo "+ id +": "+ e.name +": "+ e.message)}
		return "x"
	}
}

/*** HASH ***/

function mini(str, call, log = true) {
	// https://stackoverflow.com/a/22429679
	let t0; if (canPerf) {t0 = performance.now()}
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	let result = ('0000000' + (hash >>> 0).toString(16)).slice(-8)
	if (log && logPerfMini) {
		let ms = (performance.now()-t0)
		gPerfHash += ms
		gPerfHashDetail.push(ms +" : mini : "+ call)
	}
	return result
}

function mini_sha1(str, call) {
	let t0; if (canPerf) {t0 = performance.now()}
	// use mini for speed, then sha1 for length
	let ministr = mini(str, call, false)
	str = sha1(ministr, call, false)
	if (logPerfMiniSha1) {
		let ms = (performance.now()-t0)
		gPerfHash += ms
		gPerfHashDetail.push(ms +" : both : "+ call)
	}
	return str
}

function sha1(str, call, log = true) {
	let t0; if (canPerf) {t0 = performance.now()}
	//let k = location.toString(),
	//	l = mini(k.slice(9,16) +"-"+ k.slice(17,-16))
	//	str = isFile ? str : l == "d5cbb322" ? str : rnd_string()
	for (var blockstart=0,
		i = 0,
		W = [],
		H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0],
		A, B, C, D, F, G,
		word_array = [],
		temp2,
		s = unescape(encodeURI(str)),
		str_len = s.length;
		i<=str_len;){
		word_array[i>>2] |= (s.charCodeAt(i)||128)<<(8*(3-i++%4));
	}
	word_array[temp2 = ((str_len+8)>>6<<4)+15] = str_len<<3;
	for (; blockstart <= temp2; blockstart += 16) {
		A = H,i=0;
		for (; i < 80;
			A = [[
				(G = ((s=A[0])<<5|s>>>27) + A[4] + (W[i] = (i<16) ? ~~word_array[blockstart + i] : G<<1|G>>>31) + 1518500249)
					+ ((B=A[1]) & (C=A[2]) | ~B & (D=A[3])),
				F = G + (B ^ C ^ D) + 341275144,
				G + (B & C | B & D | C & D) + 882459459,
				F + 1535694389
			][0|i++/20] | 0, s, B<<30|B>>>2, C, D]
		) {
			G = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
		}
		for(i=5;i;) H[--i] = H[i] + A[i] | 0;
	}
	for(str='';i<40;)str += (H[i>>3] >> (7-i++%8)*4 & 15).toString(16);
	if (log && logPerfSha1) {
		let ms = (performance.now()-t0)
		gPerfHash += ms
		gPerfHashDetail.push(ms +" : sha1 : "+ call)
	}
	return str
}

async function sha256(str) {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str))
	return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+ x.toString(16)).slice(-2))).join('')
}

const promiseRaceFulfilled = async ({
	promise,
	responseType, // the promise response type
	limit = 1000 // default ms to fulfill
}) => {
	// set up promise race
	const slowPromise = new Promise(resolve => setTimeout(resolve, limit))
	// await promise race status
	const response = await Promise.race([slowPromise, promise]) // fastest will win 
		.then(response => response instanceof responseType ? response : 'pending')
		.catch(error => 'rejected')
	return (
		response == 'rejected' || response == 'pending' ? undefined : response
	)
}

/*** GLOBAL VARS ***/

const get_aSystemFont = () => new Promise(resolve => {
	if (!isFF) {return resolve("not FF")}
	// unique first system fonts from computed family
	let t0; if (canPerf) {t0 = performance.now()}
	let aFonts = ["caption","icon","menu","message-box","small-caption","status-bar",
		"-moz-window", "-moz-desktop", "-moz-document", "-moz-workspace", "-moz-info",
		"-moz-pull-down-menu", "-moz-dialog", "-moz-button", "-moz-list", "-moz-field",
	]
	aSystemFont = []
	try {
		aFonts.sort()
		let el = dom.sysFont
		let data = []
		aFonts.forEach(function(font){
			el.style.font = font
			let family = getComputedStyle(el)["font-family"]
			if (!data.includes(family)) {
				data.push(family)
				aSystemFont.push(font)
			}
		})
		log_perf("aSystemFont [global]", t0, "", aSystemFont.join(", "))
		return resolve(aSystemFont.join(", "))
	} catch(e) {
		log_perf("aSystemFont [global]", t0, "", e.name)
		// do nothing: we do this test later with more properties
		return resolve("error")
	}
})

function get_canPerf(runtype) {
	// check performance.now
	try {
		if (runSP) {a=b}
		let testPerf = performance.now()
		canPerf = true
	} catch(e) {
		canPerf = false
		if (runtype == "log") {log_error("_global: performance.now:", e.name, e.message)}
	}
}

const get_isArch = (skip = false) => new Promise(resolve => {
	if (!isFF && !skip) {return resolve()}

	// on page loads: we run this twice: very early while we're waiting
		// skip = true: we haven't set isFF yet
		// then later as a prereq : no point running it twice
	if (gLoad && !skip) {return resolve()}

	// OS architecture
		// FF89+: 1703505: javascript.options.large_arraybuffers
	try {
		let t0; if (canPerf) {t0 = performance.now()}
		isArch = "unknown"
		let test = new ArrayBuffer(Math.pow(2,32))
		isArch = true
		if (gLoad) {log_perf("isArch [global]",t0,"",isArch)} else if (gRun) {log_perf("isArch [global]",t0,gt0,isArch)}
		return resolve()
	} catch(e) {
		isArch = log_error("fd: os_architecture", e.name, e.message)
		return resolve()
	}
})

const get_isBrave = () => new Promise(resolve => {
	/* https://github.com/abrahamjuliot/creepjs/ */
	if (isEngine !== "blink") return resolve("not brave")
	if ("undefined" !== typeof opr) return resolve("not brave") // opera
	if (Object.keys(chrome).includes("search")) return resolve("not brave") // opera fallback

	// proceed
	let t0; if (canPerf) {t0 = performance.now()}
	let res = []
	if (runSL && navigator.brave) {delete Navigator.prototype.brave}
	const detectBrave = async () => {
		const windowKeys = Object.keys(Object.getOwnPropertyDescriptors(window))
		const fileSystemKeys = /FileSystem((|Directory|File)Handle|WritableFileStream)|show((Directory|((Open|Save)File))Picker)/
		// each can be spoofed or blocked
		return {
			// moving to flags
			// https://github.com/brave/brave-browser/issues/9586#issuecomment-840872720
			fileSystemAccessDisabled: !windowKeys.filter(key => fileSystemKeys.test(key)).length,
			webSerialDisabled: !('Serial' in window || 'SerialPort' in window),
			reportingDisabled: !('ReportingObserver' in window),
			// not strictly brave
			gpcInNavigator: 'globalPrivacyControl' in navigator,
			// primary method
			braveInNavigator: (
				'brave' in navigator &&
				Object.getPrototypeOf(navigator.brave).constructor.name == 'Brave' &&
				navigator.brave.isBrave.toString() == 'function isBrave() { [native code] }' &&
				'brave' in navigator ? Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype)).indexOf("brave") < 10 : false
			),
			// rule out other brands
			brandIsNotGoogleMicrosoftOrOpera: (
				!navigator.userAgentData ? 'unknown' :
				!navigator.userAgentData.brands
				.filter(item => /Google Chrome|Microsoft Edge|Opera/.test(item.brand)).length
			),
			// spoofable and blockable
			storageQuotaIs2Gb: 2147483648 == (await navigator.storage.estimate()).quota,
		}
	}
	;(async () => {
		const x = await detectBrave()
		const names = Object.keys(x).sort()
		for (const k of names) {res.push(k +":"+ x[k])}
		let hash = sha1(res.join())
		if (hash == "84e58a287055514c839182750856ce1d4a88c9e0") { // all true
			isBrave = true
		} else if (hash == "56d1c769c8fed6a92e31ff22169c9043480834d0") { // all but primary
			isBrave = true
			gKnownOnce.push("_global:isBrave:navigator")
			gBypassedOnce.push("_global:isBrave:navigator:true")
		}
		log_perf("isBrave [global]",t0,"",isBrave)
		if (!isBrave) {
			return resolve()
		} else {
			Promise.all([
				get_isBraveMode(),
			]).then(function(){
				return resolve()
			})
		}
	})()
})

const get_isBraveMode = () => new Promise(resolve => {
	let t0; if (canPerf) {t0 = performance.now()}
	function set(mode) {
		isBraveMode = mode
		if (gRun) {
			if (aBraveMode == 0) {log_alert("_global:isBraveMode: unknown")}
			log_perf("isBraveMode [global]",t0,"",aBraveMode[isBraveMode])
		}
	}
	try {
		// strict mode
		const strictMode = () => {
			const audioContext = (
				'OfflineAudioContext' in window ? OfflineAudioContext : 
				'webkitOfflineAudioContext' in window ? webkitOfflineAudioContext :
				undefined
			)
			if (!audioContext) {
				return false
			}
			const context = new audioContext(1, 1, 44100)
			const analyser = context.createAnalyser()
			const data = new Float32Array(analyser.frequencyBinCount)
			analyser.getFloatFrequencyData(data)
			const strict = new Set(data).size > 1 // native only has -Infinity
			return strict
		}
		if (strictMode()) {
			set(3)			
			return resolve()
		} else {
			// standard and strict mode do not have chrome plugins
			const chromePlugins = /(Chrom(e|ium)|Microsoft Edge) PDF (Plugin|Viewer)/
			const pluginsList = [...navigator.plugins]
			const hasChromePlugins = pluginsList
				.filter(plugin => chromePlugins.test(plugin.name)).length == 2
			if (pluginsList.length && !hasChromePlugins) {
				set(2)
				return resolve()
			}
			set(1)
			return resolve()
		}
	} catch(e) {
		set(0)
		return resolve()
	}
})

const get_isClientRect = () => new Promise(resolve => {
	// determine valid domrect methods
	if (!isTZPSmart) {
		return resolve()
	}

	let t0; if (canPerf) {t0 = performance.now()}
	let aNames = ["Element.getBoundingClientRect", "Element.getClientRects",
		"Range.getBoundingClientRect", "Range.getClientRects"]

	// FF we only need to measure once: rect6
	if (isFF) {
		isClientRect = -1
		aClientRect = []
		aClientRectNoise = {}

		let valid = "4447a487"
		let el = dom.rect6
		for (let i=0; i < 4; i++) {
			try {
				aClientRectNoise[i] = []
				if (runSE) {abc = def}
				let obj = ""
				if (i == 0) {
					obj = el.getBoundingClientRect()
				} else if (i == 1) {
					obj = el.getClientRects()[0]
				} else {
					let range = document.createRange()
					range.selectNode(el)
					if (i == 2) {
						obj = range.getBoundingClientRect()
					} else {
						obj = range.getClientRects()[0]
					}
				}
				// 3 unique values in gecko, but cover all
				let eX = -20.716659545898438,
					eW = 141.41665649414062,
					eR = 120.69999694824219
				let expected = [eX, eX, eX, eX, eW, eW, eR, eR]
				let array = [obj.x, obj.left, obj.y, obj.top, obj.width, obj.height, obj.right, obj.bottom]
				aClientRect.push(mini(array.join(), "_prereq clientrect") == valid ? true : false)
				// record noise FP raw data
				let aDiffs = []
				for (let i=0; i < array.length; i++) {
					aDiffs.push(expected[i] - array[i])
				}
				aClientRectNoise[i] = aDiffs
				// don't log lies or methods: do this when we output in element section
			} catch(e) {
				log_error("elements: "+ aNames[i], e.name, e.message)
				aClientRect.push(zErr)
				aClientRectMethod.push(zNA)
			}
		}
		isClientRect = aClientRect.indexOf(true)
		if (gRun) {log_perf("isClientRect [prereq]", t0, gt0, aClientRect.join(", ") +" | "+ isClientRect)}
		return resolve()
	}

	if (!isFF) {
		// non-FF we need to do a shift
		return resolve()
	}

})

function set_isFork() {
	// only use isLogo if we want to harden the check: not needed yet
	// it's important to make sure we set isFork, the entropy is still recorded
	// unless specified isLogo is 300 x 236
	if ("function" !== typeof Animation.prototype.updatePlaybackRate) {
		// FF59 or lower
		if (isMark == "130 x 38") {isFork = "Firefox" // FF52-56
		} else if (isMark == "128 x 22") {isFork = "Waterfox Classic"}
	} else {
		if (isMark == "132 x 48") {isFork = "Librewolf" // 128x128 | note: LW now matches FF sizes FF96+
		} else if (isMark == "341 x 32") {isFork = "Waterfox Browser"
		} else if (isMark == "637 x 186") {isFork = "Comodo IceDragon"}
	}
}

const get_isFork = () => new Promise(resolve => {
	if (!isFF) {return resolve("not FF")}
	setTimeout(() => resolve("timeout"), 500) // PM sucks
	let t0; if (canPerf) {t0 = performance.now()}
	let el = dom.branding
	if (isEngine == "goanna") {isFork = "Pale Moon"} // isMark 0x0 isLogo 300x326
	try {
		// load about:logo then measure branding so they have time to load
		//abc=def // throw an error
		let imgA = new Image()
		imgA.src = "about:logo"
		imgA.style.visibility = "hidden"
		document.body.appendChild(imgA)
		imgA.addEventListener("load", function() {
			isLogo = imgA.width +" x "+ imgA.height
			try {isMark = el.width+ " x " + el.height} catch(e) {}
			if (runSN) {
				isMark = "110 x 50" // new to both TB and FF
				//isMark = "336 x 48" // new TB but not new FF
				//isMark = "" // you need to set this one in get_fd_resources as well
				//isMark = "0 x 0" // same as changing html img src
			}
			set_isFork(isMark)
			// special case for goanna (PM is 300x326
			if (isEngine == "goanna") {
				if (isMark == "0 x 0" && isLogo == "300 x 240") {isFork = "Basilisk"}
			}
			document.body.removeChild(imgA)
			log_perf("isFork [global]",t0,"",isFork+"")
			return resolve(isFork+"")
		})
	} catch(e) {
		gErrorsOnce.push("_global: isFork: " + e.name +" : "+ e.message)
		log_perf("isFork [global]",t0,"","error")
		return resolve("fork error")
	}
})

const get_isOS = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
	// check
	let t0; if (canPerf) {t0 = performance.now()}
	function tryharder() {
		// ToDo: harden isOS
		// options
			// can I detect MS Shell Dlg \\32 or -apple-system (doc fonts may be blocked)
			// look at userAgent, esp if TB: we don't have proxyLies or isRFP yet
			// font check for common fonts

		// isMark: only android is missing this (maybe some obscure forks)
		if (isMark == "0 x 0") {isOS = "android"}

		if (isOS === undefined) {
			log_alert("global:isOS: unknown", true)
		}
		log_perf("isOS [global]",t0,"",isOS)
		return resolve()
	}
	// system font
		// returns generic font-family if #41116 or eventually 1787790
	try {
		let aIgnore = [
			'cursive','emoji','fangsong','fantasy','math','monospace','none','sans-serif','serif','system-ui',
			'ui-monospace','ui-rounded','ui-serif','undefined', undefined 
		]
		let font = getComputedStyle(dom.widget0).getPropertyValue("font-family")
		if (aIgnore.includes(font)) {
			tryharder()
		} else {
			if (font.slice(0,12) == "MS Shell Dlg") {isOS = "windows"
			} else if (font == "-apple-system") {isOS = "mac"
			} else if (font == "Roboto" && isMark == "0 x 0") {isOS = "android"
			} else {isOS = "linux"}
			// set isPlatformFont
			// limit to windows for now
			if (isOS == "windows") {
				isPlatformFont = font
			}
			// hide row
			if (isPlatformFont !== undefined) {
				showhide("FontStats","none") //groot
			}
			log_perf("isOS [global]",t0,"",isOS +" | "+ font)
			return resolve()
		}
	} catch(e) {
		// no need to gErrorsOnce since we do this in widgets
		tryharder()
	}
})

const get_isRFP = () => new Promise(resolve => {
	// FF56+: TZP main test no need to check this: see isTZPBlockMinVer
	isRFP = false
	isPerf = true
	let t0; if (canPerf) {t0 = performance.now()}
	let realPerf = true
	if (runRF) {isPerf = false}
	try {
		if (Math.trunc(performance.now() - performance.now()) !== 0) {
			isPerf = false
			realPerf = false
			if (gRun) {gMethods.push("_global:performance.now:tampered")}
		}
	} catch(e) {
		isPerf = false
		realPerf = false // ??
	}
	if (runRF) {isPerf = realPerf}
	if (!isFF) {return resolve()}
	try {
		performance.mark("a")
		let r = performance.getEntriesByName("a","mark").length
			+ performance.getEntries().length
			+ performance.getEntries({name:"a",entryType:"mark"}).length
			+ performance.getEntriesByName("a","mark").length
			performance.clearMarks()
		isRFP = (r == 0)
		// extra checks
		if (!isPerf) {isRFP = false}
		// extra checks: RFP toggled off-to-on requires page reload
		// don't block pseudo
		if (gLoad) {
			let chk1 = getElementProp("#cssPRM","content",":after", true)
			if (chk1 !== "no-preference") {isRFP = false}
			let chk2 = getElementProp("#cssPCS","content",":after", true)
			if (chk2 !== "light") {isRFP = false}
			let chk3 = zD
			try {if (window.PerformanceNavigationTiming) {chk3 = zE}} catch(e) {}
			if (chk3 !== zD) {isRFP = false}
		}
		if (gRun) {log_perf("isRFP [prereq]",t0,gt0,isRFP)}
		return resolve()
	} catch(e) {
		log_alert("_global:isRFP: " + e.name +" : "+ e.message)
		if (gRun) {
			log_error("_global: isRFP", e.name, e.message)
		}
		return resolve()
	}
})

const get_isTB = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
	let t0; if (canPerf) {t0 = performance.now()}
	try {
		// extensions can block resources://
			// FF ~5ms, TB ~20ms
		setTimeout(() => resolve("timeout"), 100)
		let css = document.createElement("link")
		css.href = "resource://torbutton-assets/aboutTor.css"
		css.type = "text/css"
		css.rel = "stylesheet"
		document.head.appendChild(css)
		css.onload = function() {
			isTB = true
			log_debug("TB", "resource:// = aboutTor.css", true)
			log_perf("isTB [global]",t0,"",isTB)
			return resolve("tb yes")
		}
		css.onerror = function() {
			log_perf("isTB [global]",t0,"",isTB)
			return resolve("tb no")
		}
		document.head.removeChild(css)
	} catch(e) {
		gErrorsOnce.push("_global: isTB: " + e.name +" : "+ e.message)
		log_perf("isTB [global]",t0,"","error")
		return resolve("tb error")
	}
})

const get_isVer = () => new Promise(resolve => {
	// skip
	if (!isFF) {return resolve()}
	// set isVer
	let t0; if (canPerf) {t0 = performance.now()}
	function output(verNo) {
		isVer = verNo
		if (verNo < 60) {verNo += " or lower"
		} else if (verNo == isVerMax) {isVerPlus = true; verNo += "+"}
		log_perf("isVer [global]",t0,"",verNo)
		return resolve(verNo)
	}
	output(cascade())

	function cascade() {
		if ("function" !== typeof Animation.prototype.updatePlaybackRate) return 59
			// ^ we can skip < FF60 legacy checks now
			// note: we can skip non-gecko checks: this only runs if isFF

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
		return 60 // we already tested <60
	}
})

/*** CHECK FUNCTIONS ***/

function check_navKey(property) {
	if (navKeys["trueKeys"]) {return navKeys["trueKeys"].includes(property)} else {return false}
}

const get_navKeys = () => new Promise(resolve => {
	navKeys = {}
	let t0; if (canPerf) {t0 = performance.now()}
	// compare
	if (isTZPSmart) {
		try {
			let keysA = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
			keysA = keysA.filter(x => !["constructor"].includes(x))
			let keysB = []
			for (const key in navigator) {keysB.push(key)}
			if (gRun) {
				if (runSL) {keysA = ["b","c","buildID","iamfake","appName"]; keysB = ["appName","b","e","f"]}
				if (mini(keysA.join(), "_prereq navA") !== mini(keysB.join(), "_prereq navB")) {
					gMethods.push("misc:navigator keys: mismatch")
					sDetail["misc_navigator_keys_mismatch_[prototype]_method_skip"] = keysA
					sDetail["misc_navigator_keys_mismatch_[for loop]_method_skip"] = keysB
				}
			}
		} catch(e) {}
	}

	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		if (runSL) {
			keys.push("iamfake") // +fake
			keys = keys.filter(x => !["buildID"].includes(x)) // -expected
			keys = keys.filter(x => !["appName"].includes(x)); keys.push("appName") // +move
		}
		let trueKeys = keys
		let lastKeyIndex = keys.length,
			allKeys = keys,
			fakeKeys = [],
			missingKeys = [],
			movedKeys = []
		if (isTZPSmart) {
			// common
			let expectedKeys = [
				"appCodeName","appName","appVersion","platform","product","productSub","userAgent","vendor","vendorSub", // ua bits
				"hardwareConcurrency","language","languages","mimeTypes","onLine","plugins",
			]
			if (isFF) {
				if (isVer > 98) {expectedKeys.push("pdfViewerEnabled")}
				// constructor is always last
				// track added keys
				lastKeyIndex = keys.indexOf("constructor")
				trueKeys = keys.slice(0, lastKeyIndex+1)
				fakeKeys = keys.slice(lastKeyIndex+1)
				// track missing keys
				// track moved (expected) keys: use trueKeys
				expectedKeys.push("buildID","oscpu","taintEnabled")
				missingKeys = expectedKeys.filter(x => !trueKeys.includes(x))
				movedKeys = fakeKeys.filter(x => expectedKeys.includes(x))
				trueKeys = trueKeys.concat(missingKeys)
				fakeKeys = fakeKeys.concat(missingKeys)
				// remove moved expected from fake
				fakeKeys = fakeKeys.filter(x => !movedKeys.includes(x))
			} else if (isEngine == "blink") {
				// last key inconsistent
				let poisonKeys = ["activeVRDisplays","buildID","getVRDisplays","iamfake",
					"oscpu","SharedWorker","Worker","taintEnabled"]
				if (isBrave) {
					expectedKeys.push("brave","globalPrivacyControl")
				} else {
					poisonKeys.push("brave")
				}
				// track posion
				trueKeys = keys.filter(x => !poisonKeys.includes(x))
				fakeKeys = keys.filter(x => poisonKeys.includes(x))
				// track missing
				missingKeys = expectedKeys.filter(x => !keys.includes(x))
				trueKeys = trueKeys.concat(missingKeys)
				fakeKeys = fakeKeys.concat(missingKeys)
			}
		}
		// remove constructor
		allKeys = allKeys.filter(x => !["constructor"].includes(x))
		trueKeys = trueKeys.filter(x => !["constructor"].includes(x))
		// set
		navKeys["allKeys"] = allKeys.sort()
		navKeys["trueKeys"] = trueKeys.sort()
		navKeys["fakeKeys"] = fakeKeys.sort()
		navKeys["movedKeys"] = movedKeys.sort()
		if (gRun) {log_perf("navKeys [prereq]",t0)}
		return resolve()
	} catch(e) {
		log_alert("_global:get_navKeys: " + e.name +" : "+ e.message)
		return resolve()
	}
})

function getDynamicIframeWindow({
	context,
	source = "",
	test = "",
	contentWindow = false,
	nestIframeInContainerDiv = false,
	violateSOP = true, // SameOriginPolicy
	display = false
}) {
	try {
		const elementName = nestIframeInContainerDiv ? 'div' : 'iframe'
		const length = context.length
		const element = document.createElement(elementName)
		document.body.appendChild(element)
		if (!display) {
			element.setAttribute('style', 'display:none')
		}
		if (nestIframeInContainerDiv) {
		const attributes = `
			${source ? `src=${source}` : ''}
				${violateSOP ? '' : `sandbox="allow-same-origin"`}
			`
			element.innerHTML = `<iframe ${attributes}></iframe>`
		} else if (!violateSOP) {
			element.setAttribute('sandbox', 'allow-same-origin')
			if (source) {
				element.setAttribute('src', source)
			}
		} else if (source) {
			element.setAttribute('src', source)
		}
		const iframeWindow = contentWindow ? element.contentWindow : context[length]

		let res = []
		let navigator = iframeWindow.navigator

		if (test == "ua") {
			let list = ['userAgent','appCodeName','appName','product','appVersion',
				'oscpu','platform','buildID','productSub','vendor','vendorSub'],
				r = ""
			for (let i=0; i < list.length; i++) {
				try {r = navigator[list[i]]} catch(e) {r = zB0}
				r = cleanFn(r)
				res.push(list[i] +":"+ r)
			}
			res.sort()
		}
		document.body.removeChild(element)
		return res
	} catch(e) {
		if (e.message !== "document.fonts.values() is not iterable") {console.error(e.name, e.message)}
		return zB0
	}
}

/** GENERAL CLICK FUNCTIONS **/

function copyclip(element) {
	// fallback: e.g FF62-
	function copyExec() {
		if (element == "ug10") {element = "ugcopy"}
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
		word = (style == "none" ? "&#9660; show " : "&#9650; hide ") + (word == "" || word === undefined ? "details" : word)
	}
	try {document.getElementById("label"+ id).innerHTML = word} catch(e) {}
}

/** DISPLAY CLICK FUNCTIONS **/

function tidyName(name) {
	name = name.replace(/\_method_skip/g, "")
	name = name.replace(/\_skip/g, "")
	name = name.replace(/\_notglobal/g, "")
	name = name.replace(/\_/g, " ")
	return name
}

function showDetail(name) {
	let data = sDetail[name]
	let hash = (Array.isArray(sDetail[name])) ? mini_sha1(data.join()) : mini_sha1(data)
	name = tidyName(name)
	let n = name.indexOf(" "),
		section = name.substring(0,n).toUpperCase(),
		metric = name.substring(n,name.length).trim()
	console.log(section +": "+ metric +": "+ hash, data)
}

function showMetrics(type) {
	if (type == "gDetail") {
		for (let name in gDetail) {
			let data = gDetail[name]
			let hash = (Array.isArray(sDetail[name])) ? mini_sha1(data.join()) : mini_sha1(data)
			name = tidyName(name)			
			let n = name.indexOf(" "),
				section = name.substring(0,n).toUpperCase(),
				metric = name.substring(n,name.length).trim()
			console.log(section +": "+ metric +": "+ hash, data)
		}
	} else if (type == "gKnownDetail") {
		for (let name in gKnownDetail) {
			let data = gKnownDetail[name]
			name = tidyName(name)
			let n = name.indexOf(" "),
				section = name.substring(0,n).toUpperCase(),
				metric = name.substring(n,name.length).trim()
			console.log(section +": "+ metric, data)
		}
	} else if (type == "gMethodsDetail") {
		for (let name in gMethodsDetail) {
			let data = gMethodsDetail[name]
			name = tidyName(name)
			let n = name.indexOf(" "),
				section = name.substring(0,n).toUpperCase(),
				metric = name.substring(n,name.length).trim()
			console.log(section +": "+ metric, data)
		}
	} else if (type == "gPerfDetail") {
		if (gPerfDetail.length) {
			console.log("perf detail: global\n"+ gPerfDetail.join("\n"))
		}
	} else if (type == "sPerfDetail") {
		if (sPerfDetail.length) {
			console.log("perf detail: section re-runs\n"+ sPerfDetail.join("\n"))
		}
	} else {
		let array = [], array2 = [], type2, showhash = true
		if (type == "known lies") {
			array = gKnown
		} else if (type == "bypassed") {
			array2 = gBypassedNot
			type2 = type +" [not]"
			type += " [hopefully]"
			array = gBypassed
		} else if (type == "known methods") {
			array = gMethods
		} else if (type == "errors") {
			array = gErrors
		} else if (type == "fingerprint") {
			array = gData
		} else if (type == "prototype lies") {
			array = gLies
		} else if (type == "proxy lies") {
			array = gLiesProxy
		} else if (type == "prototype lies: details") {
			array = gLiesDetail
			showhash = false
		} else if (type == "alerts") {
			array = gCheck
			showhash = false
		} else {
			// section
			array = sData[type]
			type = type.toUpperCase()
		}
		console.log(type +": "+ (showhash ? sha1(array.join()) : ""), array)
		if (array2.length) {
			console.log(type2 +": "+ (showhash ? sha1(array2.join()) : ""), array2)
		}
	}
}

/*** INCOMING DATA ***/

function buildButton(colorCode, arrayName, displayText = "details", functionName = "showDetail", btnType = "btnc") {
	if (displayText == "") {displayText = "details"}
	if (functionName == "") {functionName = "showDetail"}
	if (btnType == "") {btnType = "btnc"}
	return " <span class='btn"+ colorCode +" "+ btnType +"' onClick='"
		+ functionName +"(`"+ arrayName +"`)'>["+ displayText +"]</span>"
}

function log_click(name, time) {
	// click here doesn't record via log_section
	if (canPerf) {
		let output = isPerf ? Math.round(performance.now() - time).toString() : "xx"
		output = name.padStart(14) +": "+ sn + output.padStart(4) + sc +" ms"
		let el = dom.perfS
		el.innerHTML = el.innerHTML + (el.innerText.length > 2 ? "<br>" : "") + output
	}
}

function log_alert(output, isOnce = false) {
	let str = s1 +"alert".padStart(11) +": "+ sc + output + (isOnce ? s1 +"[cached]"+ sc : "")
	if (isOnce) {
		if (gRun) {gCheckOnce.push(output)} // global snapshot
		console.error(output) // always console
		gDebugOnce.push(str) // always update page display
	} else {
		if (gRun) {gCheck.push(output)}
		console.error(output)
		gDebug.push(str)
	}
}

function log_debug(title, output, isOnce = false) {
	title +=""; 
	output = s99 + title.padStart(11) +": "+ sc + output + (isOnce ? s99 +"[cached]"+ sc : "")
	if (isOnce) { gDebugOnce.push(output) } else { gDebug.push(output) }
}

function log_error(title, name, msg, len = 60) {
	// tidy values
	let isMsg = true
	if (name == undefined || name == "" || name === null) {name = zErr}
	if (msg == undefined || msg == "" || msg === null) {isMsg = false}
	// collect globalrun errors
	if (gRun) {
		if (name == "ReferenceError" && msg == "def is not defined") {
			gErrors.push("simulated: " + title)
		} else {
			gErrors.push(title +": " + name + (isMsg ? ": "+ msg : ""))
		}
	}
	// return a trimmed str for displays
	let str = name + (isMsg ? ": "+ msg : "")
	if (str.length > len) {str = str.substring(0,len-3) + "..."}
	return(str)
}

function trim_error(name, msg, len) {
	if (len == undefined) {len = 60}
	let isMsg = true
	if (name == undefined || name == "" || name === null) {name = zErr}
	if (msg == undefined || msg == "" || msg === null) {isMsg = false}
	let str = name + (isMsg ? ": "+ msg : "")
	if (str.length > len) {str = str.substring(0,len-3) + "..."}
	return(str)
}

function log_line(str) {
	if (canPerf) {
		let output = str
		if (str == "line") {
			output = "-".repeat(20)
			output = output.padStart(31)
		}
		if (gRun) {
			gPerfDetail.push(output)
		} else {
			sPerfDetail.push(output)
		}
	}
}

function log_perf(str, time1, time2, extra) {
	if (!canPerf) {return}
	let tEnd = performance.now(),
		output = ""
	if (time1 == undefined) {time1 = ("error").padStart(7)}
	if (isNaN(time1)){
		output = str.padStart(30) +": "+ (time1).padStart(7)
	} else {
		time1 = isPerf? Math.round(tEnd - time1).toString() : "xx"
		output = str.padStart(30) +": "+ time1.padStart(4) +" ms"
	}
	if (time2 == "ignore") {
		time2 = ""
	} else if (time2 == "" || gt0 == undefined) {
		output += " | "+ ("n/a").padStart(7)
	} else {
		time2 = isPerf? Math.round(tEnd - gt0).toString() : "xxx"
		output += " | "+ time2.padStart(4) +" ms"
	}
	if (extra !== undefined && extra !== "") {
		output += " | "+ extra
	}
	if (gRun || str.includes("not in FP")) {
		gPerfDetail.push(output)
	} else {
		sPerfDetail.push(output)
	}
}

function log_section_hash(name) {
	// section hash
	let data = sData[name]
	let hash = sha1(data.join(), name +" section result")
	let sHash = hash + buildButton("0", name, data.length +" metric"+ (data.length > 1 ? "s" : ""), "showMetrics", "btns")
	if (name == "canvas" || name == "storage") {if (isFile) {sHash += note_file}
	} else if (name == "ua") {sHash += (isFF ? " [spoofable + detectable]" : "")
	} else if (name == "feature") {sHash += (isFF ? " [unspoofable?]" : "")}
	document.getElementById(name +"hash").innerHTML = sHash
	// global run
	if (gRun) {
		gData.push([name +":"+ hash, data])
	}
}

function log_section(name, time1, data) {
	let t0; if (canPerf) {t0 = performance.now(); time1 = Math.round(t0-time1).toString()}

	// PERF
	if (gRun && gCount == (gCountExpected - 1)) {
		if (canPerf) {dom.perfall = " "+ (isPerf ? Math.round(performance.now() - gt0) : "xxx") +" ms"}
	}
	let pretty = ""
	if (!isPerf) {time1 = "xx"}
	if (canPerf) {pretty = name.padStart(14) +": "+ sn + time1.padStart(4) + sc +" ms"}
	if (gRun) {
		let time2 = Math.round(t0-gt0).toString()
		if (!isPerf) {time2 = "xxx"}
		pretty += " | "+ so + time2.padStart(4) + sc +" ms"
		if (canPerf) {gPerf.push(pretty)}
	} else {
		if (name !== "prereq") {
			let el = dom.perfS
			el.innerHTML = el.innerHTML + (el.innerText.length > 2 ? "<br>" : "") + pretty
			// not a gRun, always update debugAll
			if (gDebug.length) {
				dom.debugAll.innerHTML = gDebug.join("<br>")
			}
			gClick = true
		}
	}

	// DATA
	if (Array.isArray(data)) {
		data.sort()
		// SANITY
		if (data.length == 0) {
			log_alert("#section "+ name +": data array is empty")
		} else {
			for (let i=0; i < data.length; i++) {
				let check = data[i]
				if (check == undefined) {
					log_alert("#section "+ name +": contains undefined")
				} else {
					let parts = data[i].split(":")
					let metric = parts[0]
					if (metric !== metric.trim()) {
						log_alert("#section "+ name +": "+ metric +" needs trimming")
					}
					let value = parts.slice(1).join(":")
					if (value == "") {
						log_alert("#section "+ name +": "+ metric +" not set")
					} else if (value == undefined) {
						log_alert("#section "+ name +": "+ metric +" undefined")
					} else {
						if ((value.indexOf("<sp") + value.indexOf("<code")) > 0) {
							log_alert("#section "+ name +": "+ metric +" contains notation")
						}
						if (value !== value.trim()) {
							log_alert("#section "+ name +": "+ metric +" value needs a trim")
						}
					}
				}
			}
		}

		// SECTION
		sData[name] = data
		if (canPerf) {document.getElementById("perf"+ name).innerHTML = " "+ (isPerf ? time1 : "xxx") +" ms"}
		if (!gRun) {
			log_section_hash(name)
			outputPostSection(name) // trigger nonFP
		}
		// GLOBAL
		if (gRun) {
			gCount++
			// FINISH
			if (gCount == gCountExpected) {
				dom.perfG.innerHTML = gPerf.join("<br>")
				// temp
				if (logPerfHash !== "") {
					console.log("HASH STATS: ["+ gPerfHashDetail.length +" times | "
						+ gPerfHash +" ms]\n - " + gPerfHashDetail.join("\n - ")
					)
				}
				// build section hashes and propagate gData
				const sDataNames = Object.keys(sData)
				sDataNames.forEach(function(name) {log_section_hash(name)})
				// metric count
				let metricCount = 0
				for (let i=0; i < gData.length; i++) {
					metricCount += gData[i][1].length
				}
				// details: reset, add ordered non-empty non-notglobal non-skip-data
				gDetail = {}
				gKnownDetail = {}
				gMethodsDetail = {}
				const names = Object.keys(sDetail).sort()
				for (const k of names) {
					let objectLength = Array.isArray(sDetail[k]) ? sDetail[k].length : Object.keys(sDetail[k]).length
					if (objectLength > 0) {
						if ((k.indexOf("_notglobal") == -1)) {
							if (k.indexOf("_skip") == -1) {
								// FP
								gDetail[k] = sDetail[k]
							} else {
							if (k.indexOf("_method") !== -1) {
									// method
									gMethodsDetail[k] = sDetail[k]
								} else {
									// lies
									gKnownDetail[k] = sDetail[k]
								}
							}
						}
					} else {
						delete sDetail[k] // remove empties
					}
				}
				// persist runonce data, de-dupe, sort
				gCheck = gCheck.concat(gCheckOnce)
				gCheck = gCheck.filter(function(item, position) {return gCheck.indexOf(item) === position})
				gCheck.sort()
				gKnown = gKnown.concat(gKnownOnce)
				gKnown = gKnown.filter(function(item, position) {return gKnown.indexOf(item) === position})
				gKnown.sort()
				gBypassed = gBypassed.concat(gBypassedOnce)
				gBypassed = gBypassed.filter(function(item, position) {return gBypassed.indexOf(item) === position})
				gBypassed.sort()
				gMethods = gMethods.concat(gMethodsOnce)
				gMethods = gMethods.filter(function(item, position) {return gMethods.indexOf(item) === position})
				gMethods.sort()
				// debug: don't sort
				gDebug = gDebugOnce.concat(gDebug)
				if (gDebug.length) {
					dom.debugAll.innerHTML = gDebug.join("<br>")
				}

				// populate gBypassedNot: makes it easier to track when so many lies picked up
				let tmpKN = [], tmpBP = []
				if (gKnown.length) {gKnown.forEach(function(item) {tmpKN.push(item.split(":")[0] +":"+ item.split(":")[1])})}
				if (gBypassed.length) {
					gBypassed.forEach(function(item) {tmpBP.push(item.split(":")[0] +":"+ item.split(":")[1])})
					gBypassedNot = tmpKN.filter(x => !tmpBP.includes(x))
				}
				// errors
				gErrors = gErrors.concat(gErrorsOnce)
				if (gErrors.length) {
					gErrors.sort()
					let eBtn = buildButton("0", "errors", gErrors.length +" error"+ (gErrors.length > 1 ? "s": ""),"showMetrics")
					dom.errorshash.innerHTML = sha1(gErrors.sort()) + eBtn
				} else {
					dom.errorshash = "none"
				}
				// alerts
				dom.allcheck = (gCheck.length ? "[ alerts ]" : "")

				// known/bypass/details
				let knownStr = "", detailBtn = "", bypassBtn = ""
				if (gKnown.length) {
					let knownBtn = " <span class='btn0 btnc' onClick='showMetrics(`known lies`)'>"
						+ soL +"["+ gKnown.length +" lie"+ (gKnown.length > 1 ? "s" : "") +"]"+ scC + "</span>"
					knownStr = sha1(gKnown.join()) + knownBtn
				} else {
					knownStr = isTZPSmart ? "none" : zNA
				}
				if (gBypassed.length) {
					bypassBtn = " <span class='btn0 btnc' onClick='showMetrics(`bypassed`)'>"
					+ soB +"["+ gBypassed.length +" bypassed]"+ scC + "</span>"
				}
				if (Object.keys(gKnownDetail).length) {
					detailBtn = buildButton("0", "gKnownDetail", "details", "showMetrics")
				}
				dom.knownhash.innerHTML = knownStr + bypassBtn + detailBtn
				// method
				detailBtn = ""
				if (Object.keys(gMethodsDetail).length) {
					detailBtn = buildButton("0", "gMethodsDetail", "details", "showMetrics")
				}
				if (gMethods.length) {
					let methodStr = gMethods.length +" noted"
					let methodBtn = buildButton("0", "known methods", methodStr, "showMetrics")
					dom.knownmethods.innerHTML = sha1(gMethods.join()) + methodBtn + detailBtn
				} else {
					dom.knownmethods = isTZPSmart ? "none"+ detailBtn : zNA
				}
				// FP
				gData.sort()
				dom.allhash.innerHTML = sha1(gData.join())
					+ buildButton("0", "fingerprint", metricCount +" metric"+ (metricCount > 1 ? "s" : ""), "showMetrics")
					+ buildButton("0", "gDetail", "details", "showMetrics")
				// trigger nonFP
				outputPostSection("all")
				gLoad = false
				gClick = true // ToDo: should move this to after perf2
			}
		}
	} else {}	// !ARRAY
}

/*** RUN ***/

function countJS(filename) {
	jsFiles.push(filename)
	// pre-compute slow 95 test
	if (jsFiles.length == 1 && isFF) {
		// skip if not likely to be Firefox
		if ("function" === typeof self.structuredClone && "function" !== typeof crypto.randomUUID) {
			// ^ do if 94+ but not 95+ fast path
			try {
				if ("sc" !== Intl.PluralRules.supportedLocalesOf("sc").join()) {
					// but not if 96+
					let t95; if (canPerf) {t95 = performance.now()}
					let ratio = dom.test95a.offsetWidth/dom.test95b.offsetWidth
					is95 = (ratio > 0.4 && ratio < 0.6)
					log_perf("v95 [pre-compute]",t95,"",is95)
				}
			} catch(e) {}
		}
	}

	// the whole gangs here
	if (jsFiles.length == jsFilesExpected) {
		let isTZP = (mini(location.toString().slice(0,31)) == "1b6751a9")
		if (!isTZP && !isFile) {
			// please do not alter: respect my source/work which is always ongoing and up-to-date
			dom.original.style.display = "block"
		}
		if (runSL) {isPerf = false}
		try {
			if (Math.trunc(performance.now() - performance.now()) !== 0) {isPerf = false}
		} catch(e) {isPerf = false}
		if (canPerf) {log_line(Math.round(performance.now()) + " : RUN ONCE")}
		let t0; if (canPerf) {t0= performance.now()}
		// DOC/DOM LOADED
		Promise.all([
			get_isVer(),
			get_isTB(),
			get_isBrave(),
			get_aSystemFont(),
			get_isFork(),
		]).then(function(results){
			if (results[1] == "timeout") {
				gMethodsOnce.push("_global:resource:blocked")
				log_perf("isTB [global]",t0,"",isTB+ " [timeout]")
			}
			if (results[4] == "timeout") {
				gMethodsOnce.push("_global:isFork:blocked")
				log_perf("isFork [global]",t0,"",isTB+ " [timeout]")
			}
			Promise.all([
				get_isOS(), // this also sets isPlatformFont for font tests
			]).then(function(){
				// block/smart
				if (isFF & isVer < isTZPBlockMinVer[0]) {isTZPBlock = true // block old gecko
				} else if (isEngine == "edgeHTML") {isTZPBlock = true // block edgeHTML
				} else if (isTB && isVer >= isTZPSmartMinVer[1]) {isTZPSmart = true // minTB
				} else if (isFF && isVer >= isTZPSmartMinVer[0]) {isTZPSmart = true // minFF
				}
				// note: everything else is dumb: we can add blink/webkit or brave later
				// lets just focus on gecko lies/bypasses

				// temp until I hook up all the lies/bypasses to isTZPSmart
					// looks weird with partial lies/missing methods/no prototype lies etc
					// note: isTZPBlock overrides isTZPSmart, so nah nah nah edgeHTML
				if (!isFF) {isTZPSmart = true}

				// clear notations
				if (!isFF) {
					// change to if (!isFF || !isTZPSmart)
					// until then this acts as a visual guide to what needs to be actioned
					rfp_green = ""
					rfp_red = ""
					rfp_random_green = ""
					rfp_random_red = ""
					lb_green = ""
					lb_red = ""
					nw_green = ""
					nw_red = ""
					enUS_green = ""
					enUS_red = ""
					spoof_both_green = ""
					spoof_both_red = ""
					default_ff_green = ""
					default_ff_red = ""
					let items = document.getElementsByClassName("group")
					for (let i=0; i < items.length; i++) {items[i].style.display = "none"}
				}

				// some sims = isFF only: not fussy; only devs run these
				if (!isFF) {
					runSN = false
					runSU = false
					runRF = false
					runCSS = false
					runFNT = false
					runWFS = false
				}
				if (!isTZPBlock) {
					get_pointer_event() // pointer eventlistener
				}
				outputSection("load")
			})
		})
	}
}

function outputPostSection(id) {
	let isLog = gRun // push to gPerfDetail
	gRun = false // stop collecting things

	if (isLog) {log_perf("start [not in FP]", "--")}
	if (id == "all" || id == "ua") {
		get_ua_iframes(isLog)
		get_ua_workers()
	}
	if (id == "all" || id == "feature")
		get_fd_canonical()
		get_fd_locales()
		if (isFF) {get_fd_chrome(isLog)}
	if (id == "all" || id == "storage") {
		get_cookies()
		get_storage()
		get_idb()
		get_workers()
		get_service_workers()
		get_storage_manager()
	}
	if (id == "all" || id == "misc") {
		get_perf2(isLog) // perf2 redundant: we have isRFP
		get_recursion(isLog) // no entropy for isFF, also slows perf
	}
}

function outputUser(name) {
	// user initiated tests
	if (isTZPBlock) {
		return
	}
	if (name == "goFS") { goFS()
	} else if (name == "goNW") { goNW()
	} else if (name == "goNW_UA") { goNW_UA()
	} else if (name == "outputAudio2") { outputAudio2()
	} else if (name == "outputFontsFB") { outputFontsFB()
	} else if (name == "get_storage_manager") { get_storage_manager("click")
	} else if (name == "get_pointer_event") { get_pointer_event()
	}
}

function outputSection(id, cls) {
	// return if old gecko or unsupported engine
	if (gLoad) {
		if (isTZPBlock) {
			// on first load output message
			let isUnsupported = (!isFF && isEngine !== "") // e.g. edgeHTML
			let msgAction = isFork == undefined ? "UPDATE " : "REPLACE "
			let msgActionSuffix = isFork == undefined ? "... " : "... with Firefox | "
			let msgName = isTB ? "TOR BROWSER" : (isFork !== undefined ? isFork.toUpperCase() : "FIREFOX")
			let msgVerPrefix = isTB ? "TB v" : (isFork !== undefined ? "FF v" : " v")
			let msgVer = isTB ? isTZPBlockMinVer[1] : isTZPBlockMinVer[0]
			let msgReq = "TZP requires "+ msgVerPrefix + msgVer +"+"
			if (isUnsupported) {
				msgAction = "REPLACE "
				msgActionSuffix = "... with Firefox | "
				msgName = isEngine.toUpperCase()
				msgReq = "this engine is not supported"
			}
			let msgLen = msgAction.length + msgName.length + 1
			let msgSize = 56
			if (msgLen > 15) {msgSize = 48}
			if (msgLen > 19) {msgSize = 32}
			let msg = "<br><span style='font-size:"+ msgSize + "px;'><b>"+ msgAction + msgName +"<b></span> "
				+ msgActionSuffix + msgReq
			// populate
			let msgItems = document.getElementsByClassName("secthash")
			for (let i=0; i < msgItems.length; i++) {
				msgItems[i].innerHTML = msg
			}
		return
		} else if (!isTZPSmart) {
			// decolor
			for (let i = 1; i < 19; i++) {
				document.body.style.setProperty("--test"+i, "#d4c1b3")
				document.body.style.setProperty("--bg"+i, "#808080")
			}
			// nav-down
			let items = document.getElementsByClassName("nav-down")
			for (let i=0; i < items.length; i++) {
				items[i].innerHTML = (items[i].innerHTML).replace(/</, "<span class='perf'>basic mode</span> <")
			}
		}
	}

	if (gClick) {
		gClick = false
		isLoad = id == "load" ? true : false
		if (cls == undefined || cls == "") {cls = "c"}
		let delay = 100
		if (id == "load") {
			// skip clear/reset
			id = "all"
			gRun = true
			delay = 1
		} else if (id == "all") {
			gRun = true
			// clear/reset
			let items = document.getElementsByClassName("c")
			for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
			items = document.getElementsByClassName("gc")
			for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
			// reset global
			gCount = 0
			gData = []
			gCheck = []
			gBypassed = []
			gBypassedNot = []
			gKnown = []
			gMethods = []
			gErrors = []
			// reset section
			protoLies = []
			proxyLies = []
			sData = {}
			sDetail = {}
			// reset debug
			gDebug = []
			// reset perf
			gPerf = []
			gPerfDetail = []
			sPerfDetail = []
			// hash perf
			gPerfHash = 0
			gPerfHashDetail = []
		} else {
			// clear: &nbsp stops line height jitter
			let tbl = document.getElementById("tb"+ id)
			tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
			gRun = false
		}
		// reset
		if (id=="all" || id=="1") {dom.kbt.value = ""}
		// set hash perf
		if (gRun && canPerf) {
			logPerfMini = (logPerfHash == "all" || logPerfHash == "mini")
			logPerfSha1 = (logPerfHash == "all" || logPerfHash == "sha1")
			logPerfMiniSha1 = (logPerfHash == "all" || logPerfHash == "minisha1")
		} else {
			logPerfMini = false; logPerfSha1 = false
		}

		function output(type) {
			// section timer
			if (!gRun && canPerf) {gt0 = performance.now()}
			//id = isFile ? id : mini(type.slice(8,14)) == "55994ea2" ? id : type
			// section only
			if (id=="1") {outputScreen()}
			if (id=="2") {outputUA()}
			if (id=="3") {outputFD()}
			if (id=="11" && cls=="c") {outputAudio()}
			if (id=="11" && cls=="c2") {outputAudio2()}
			// combine 1,2,3
			if (id=="all") {outputStart()}
			// stagger
			// must do devices first or it really tanks with RFP
			setTimeout(function() {if (id=="all" || id=="7") {outputDevices()}}, 1)
			setTimeout(function() {if (id=="all" || id=="5") {outputHeaders()}}, 1)
			setTimeout(function() {if (id=="all" || id=="6") {outputStorage()}}, 1)
			setTimeout(function() {if (id=="all" || id=="13") {outputMedia()}}, 1)
			setTimeout(function() {if (id=="all" || id=="4") {outputLanguage()}}, 1)
			setTimeout(function() {if (id=="all" || id=="14") {outputCSS()}}, 1)
			setTimeout(function() {if (id=="all" || id=="18") {outputMisc()}}, 1)
			setTimeout(function() {if (id=="all" || id=="15") {outputElements()}}, 1)
			setTimeout(function() {if (id=="all" || id=="12") {outputFonts()}}, 1) // bottleneck
			setTimeout(function() {if (id=="all" || id=="9") {outputCanvas()}}, 1)
			setTimeout(function() {if (id=="all") {outputAudio()}}, 1)
			//setTimeout(function() {if (id=="all" || id=="10") {outputWebGL()}}, 1)
		}

		if (gRun) {
			if (delay == 1 && canPerf) {log_line(Math.round(performance.now()) + " : START")}
		} else {
			const sNames = ['',
				'y','x','y','x','x',
				'x','y','x','y','y',
				'x','y','y','y','y',
				'x','x','x'
			]
			if (sNames[id * 1] !== "x" && sPerfDetail.length) {log_line("line")}
		}
		setTimeout(function() {
			if (canPerf) {gt0 = performance.now()}
			Promise.all([
				get_canPerf("log"),
				outputPrototypeLies(),
				get_navKeys(),
				get_isArch(),
				get_isRFP(),
				get_isClientRect(),
			]).then(function(results){
				output(location.toString())
			})
		}, delay)
	}
}

function run_once() {
	get_canPerf()
	// ASAP
	let t00
	if (canPerf) {
		t00 = performance.now()
		log_line(Math.round(performance.now()) + " : IMMEDIATE")
	}
	if (location.protocol == "file:") {isFile = true; note_file = " [file:/]"
	} else if (location.protocol == "https:") {isSecure = true}
	// WARM
	try {
		log_perf("warmup start [md]",t00,"", t00 +" | "+ (gLoad ? "page load" : "global rerun"))
		navigator.mediaDevices.enumerateDevices().then(function(devices) {
			let t99; if (canPerf) {t99 = performance.now()}
			let info = (canPerf ? t99 +" | ": "")
				+ (gLoad ? "page load" : "global rerun")
			log_perf("warmup end [md]", t00, t99, info)
		}
	)} catch(e) {}
	try {let v = speechSynthesis.getVoices()} catch(e) {}

	// isEngine
	let t0; if (canPerf) {t0 = performance.now()}
	try {
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
		let aEngine = [], aCounts = [], aAlert = []
		for (const engine of Object.keys(oEngines).sort()) {
			let len = oEngines[engine].length
			let sumE = oEngines[engine].reduce((prev, current) => prev + current, 0)
			if (sumE > (len/2)) {aEngine.push(engine)}
			// counts
			aCounts.push(sumE +"/"+ len)
			// alerts: engine !== all the same
			if (sumE !== 0 && sumE !== len) {
				let displayE = []
				oEngines[engine].forEach(function(check) {
					displayE.push(check ? "\u2713" : "\u2715")
				})
				aAlert.push(engine +": " + displayE.join(" "))
			}
		}
		if (aEngine.length == 1) {isEngine = aEngine[0]} // valid one result
		// alert
		if (aAlert.length) {
			log_alert("isEngine: "+ aAlert.join(" | "), true)
		}
		log_perf("isEngine [global]",t0,"", aCounts.join(" | ") +" | "+ (isEngine == "" ? "unknown" : ""+ isEngine))
	} catch(e) {
		gErrorsOnce.push("_global: isEngine: " + e.name +" : "+ e.message)
		log_perf("isEngine [global]",t0,"","error")
	}

	// isFF: might as well: also set goanna
	if (canPerf) {t0 = performance.now()}
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
		let obj, prop, aNo = []
		list.forEach(function(array) {
			obj = array[0]
			prop = array[2]
			if ("function" === typeof obj
				&& ("object" === typeof Object.getOwnPropertyDescriptor(obj.prototype, prop))
			) {
			} else {
				aNo.push(array[1])
			}
		})
		let found = (list.length - aNo.length)
		if (found > 5) {
			isFF = true
			isEngine = "gecko"
			// palemoon/basilisk: fails 53, passes 54
			if ("function" !== typeof CSSMozDocumentRule && URL.prototype.hasOwnProperty("toJSON")) {
				isEngine = "goanna"
			}
			// alert if any isFF checks fail
			if (aNo.length) {
				log_alert("isFF: not found: "+ aNo.join(", "), true)
			}
		}
		log_perf("isFF [global]",t0,"", isFF +" | "+ found +"/"+ list.length +" | "+ isEngine)
	} catch(e) {
		gErrorsOnce.push("_global: isFF: " + e.name +" : "+ e.message)
		log_perf("isFF [global]",t0,"","error")
	}
	get_isArch(true)
}

run_once()

function cleanFnTest() {
	let list = [
		0,1,-1, 50, // numbers
		"0", "1", "-1", "50",
		true, false, null,
		"true", "false", "null",
		undefined, "undefined",
		[], [1,2],{},
	]
	list.forEach(function(item) {
		console.log(item, cleanFn(item))
	})
}
