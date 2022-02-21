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
	if (typeof item == "number" || typeof item == "bigint") { return item
	} else if (item == zU) {item = zUQ
	} else if (item == "true") {item = "\"true\""
	} else if (item == "false") {item = "\"false\""
	} else if (item == "null") {item = "\"null\""
	} else if (!skipArray && Array.isArray(item)) {
		item = !item.length ? "empty array" : "array"
	} else if (item === undefined || item === true || item === false || item === null) {item += ""
	} else if (!skipArray && item == "") {item = "empty string"
	} else if (typeof item == "string") {
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
		if (gRun) {gCheck.push("_generic:element property "+ id +": "+ e.name)}
		if (logPseudo) {console.log("pseudo "+ id +": "+ e.name +": "+ e.message)}
		return "x"
	}
}

/*** HASH ***/

function mini(str, call) {
	// https://stackoverflow.com/a/22429679
	let t0; if (canPerf) {t0 = performance.now()}
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	let result = ('0000000' + (hash >>> 0).toString(16)).slice(-8)
	if (logPerfMini) {
		let ms = (performance.now()-t0)
		gPerfHash += ms
		gPerfHashDetail.push(ms +" : mini : "+ call)
	}
	return result
}

function sha1(str, call) {
	let t0; if (canPerf) {t0 = performance.now()}
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
	if (logPerfSha1) {
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

const get_isBrave = () => new Promise(resolve => {
	/* https://github.com/abrahamjuliot/creepjs/ */
	if (isFF) {return resolve()} // FF
	if (!('chrome' in window)) return resolve() // no chrome
	if (Object.keys(chrome).includes("search")) {return resolve()} // opera

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
			if (aBraveMode == 0) {gCheck.push("_global:isBraveMode: unknown")}
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

const get_isEngine = () => new Promise(resolve => {
	let t0; if (canPerf) {t0 = performance.now()}
	let bFF = false, hash
	// set isFF for engine lies
	if (isFFyes.length) {isFF = true}
	function final_isFF() {
		if (isFFyes.length) {isFF = true}
		if (!isFF) {
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
		} else {
			isFFLegacy = ("function" !== typeof Animation.prototype.updatePlaybackRate)
			log_perf("isFFLegacy [global]",""+ isFFLegacy,"ignore")
		}
		log_perf("final status [isFF]",""+ isFF,"ignore")
	}
	// do math
	function cbrt(x) {
		try {
			let y = Math.pow(Math.abs(x), 1 / 3)
			return x < 0 ? -y : y
		} catch(e) {
			return "error"
		}
	}
	try {
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
		hash = sha1(res.join(), "_global isEngine").substring(0,8)
		if (runSL) {hash = "x"}
		if (hash == "ede9ca53") {isEngine = "blink"
		} else if (hash == "05513f36") {isEngine = "webkit"
		} else if (hash == "38172d94") {isEngine = "edgeHTML"
		} else if (hash == "36f067c6") {isEngine = "trident"
		} else if (hash == "225f4a61") {isEngine = "gecko"; bFF = true
		} else if (hash == "cb89002a") {isEngine = "gecko"; bFF = true
		}

		if (isEngine == "gecko") {
			// check for PM28+ : fails 55 (1351795) but passes 57 (1378342)
				// note: waterfox classic passes both
			if ("undefined" !== typeof console.timeline && "function" === typeof AbortSignal) {
				isEngine = "goanna"
			}
		}
		if (bFF) {isFFyes.push("math")} else {isFFno.push("math")}
		log_perf("math [isFF]",t0,"",bFF)
		// harden isEngine
		if (isEngine == "") {
			if (isFF) {isEngine = "gecko"} else if ("chrome" in window) {isEngine = "blink"}
			if (isEngine !== "") {
				gKnownOnce.push("_global:isEngine")
				gBypassedOnce.push("_global:isEngine:"+ isEngine)
			}
		}
		final_isFF()
		log_perf("isEngine [global]",t0,"",(isEngine == "" ? "unknown" : ""+ isEngine +" | "+ hash))
		return resolve()
	} catch(e) {
		isFFno.push("math")
		final_isFF()
		gErrorsOnce.push("_global: isEngine: " + e.name +" : "+ e.message)
		log_perf("isEngine [global]",t0,"","error")
		return resolve()
	}
})

const get_isError = () => new Promise(resolve => {
	// super mini test to confirm isFF
	let t0; if (canPerf) {t0 = performance.now()}
	try {
		let res = [], bFF = false
		try {null.bar} catch(e) {res.push(e.message)}
		try {var a = {}; a.b = a; JSON.stringify(a)} catch(e) {res.push(e.message)}
		try {[...undefined].length} catch(e) {res.push(e.message)}
		try {(1).toString(1000)} catch(e) {res.push(e.message)}
		let hash = mini(res.join(), "_global isError")
		if (hash == "009a449c") {bFF = true // FF52+
		} else if (hash == "4fdb30b3") {bFF = true} //FF74+ error_fix = true
		if (bFF) {isFFyes.push("errors")} else {isFFno.push("errors")}
		log_perf("errors [isFF]",t0,"", bFF +" | "+ hash)
		return resolve()
	} catch(e) {
		gErrorsOnce.push("_global: isError: " + e.name +" : "+ e.message)
		log_perf("errors [isFF]",t0,"","error")
		isFFno.push("errors")
		return resolve()
	}
})

function set_isFork() {
	// only use isLogo if we want to harden the check: not needed yet
	// it's important to make sure we set isFork, the entropy is still recorded
	// unless specified isLogo is 300 x 236
	if (isFFLegacy) {
		if (isMark == "130 x 38") {isFork = "Firefox" // FF52-56
		} else if (isMark == "128 x 22") {isFork = "Waterfox Classic"}
	} else {
		if (isMark == "132 x 48") {isFork = "Librewolf" // 128x128 | note: LW now matches FF sizes FF96+
		} else if (isMark == "341 x 32") {isFork = "Waterfox Browser"
		} else if (isMark == "637 x 186") {isFork = "Comodo IceDragon"}
	}
}

const get_isFork = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
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
			return resolve()
		})
	} catch(e) {
		gErrorsOnce.push("_global: isFork: " + e.name +" : "+ e.message)
		log_perf("isFork [global]",t0,"","error")
		return resolve()
	}
})

const get_isOS = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
	// check
	let t0; if (canPerf) {t0 = performance.now()}
	function tryharder() {
		// ToDo: harden isOS
		log_perf("isOS [global]",t0,"","unknown")
		return resolve()
	}
	// system font
	try {
		if (runSL) {
			//abc = def // ToDo: throw an error once we have tryharder done
		}
		let el = dom.widget0
		let font = getComputedStyle(el).getPropertyValue("font-family")
		if (font.slice(0,12) == "MS Shell Dlg") {isOS="windows"
		} else if (font.slice(0,12) == "\"MS Shell Dl") {isOS = "windows" // FF57 has a slice and escape char issue
		} else if (font == "Roboto") {isOS="android"
		}	else if (font == "-apple-system") {isOS="mac"
		}	else {isOS="linux"}
		log_perf("isOS [global]",t0,"",isOS +" | "+ font)
		return resolve()
	} catch(e) {
		// no need to gErrorsOnce since we do this in widgets
		// math test is no longer viable due to RFP
		tryharder()
	}
})

const get_isOS64 = (skip = false) => new Promise(resolve => {
	if (!isFF && !skip) {return resolve()}

	// on page loads: we run this twice: very early while we're waiting
		// skip = true: we haven't set isFF yet
		// then later as a prereq : no point running it twice
	if (gLoad && !skip) {return resolve()}

	// OS architecture
		// FF89+: 1703505: javascript.options.large_arraybuffers
	try {
		let t0; if (canPerf) {t0 = performance.now()}
		isOS64 = "unknown"
		let test = new ArrayBuffer(Math.pow(2,32))
		isOS64 = true
		if (gLoad) {log_perf("isOS64 [prereq]",t0,"",isOS64)} else if (gRun) {log_perf("isOS64 [prereq]",t0,gt0,isOS64)}
		return resolve()
	} catch(e) {
		let eMsg = e.name +": "+ e.message
		log_error("fd: os_architecture", eMsg)
		isOS64 = (eMsg == "RangeError: invalid array length" ? zNS : zB0)
		// ToDo: when pref deprecated: update tooltip + use isVer to confirm 32bit and return false
		return resolve()
	}
})

const get_isRFP = () => new Promise(resolve => {
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
			if (isVer > 62) {
				let chk1 = getElementProp("#cssPRM","content",":after", true)
				if (chk1 !== "no-preference") {isRFP = false}
			}
			if (isVer > 66) {
				let chk2 = getElementProp("#cssPCS","content",":after", true)
				if (chk2 !== "light") {isRFP = false}
			}
			if (isVer > 77) {
				let chk3 = zD
				try {if (window.PerformanceNavigationTiming) {chk3 = zE}} catch(e) {}
				if (chk3 !== zD) {isRFP = false}
			}
		}
		if (gRun) {log_perf("isRFP [prereq]",t0,gt0,isRFP)}
		return resolve()
	} catch(e) {
		if (gRun) {
			gCheck.push("_global:isRFP: " + e.name +" : "+ e.message)
			log_error("_global: isRFP", e.name, e.message)
		}
		return resolve()
	}
})

const get_isSystemFont = () => new Promise(resolve => {
	let t0; if (canPerf) {t0 = performance.now()}
	try {
		let el = dom.sysFont,
			f = undefined
		let test = getComputedStyle(el).getPropertyValue("font-family")
		el.style.font = "99px sans-serif"
		try {el.style.font = "-moz-dialog"} catch(err) {}
		let s = getComputedStyle(el, null)
		if (s.fontSize != "99px") {f = s.fontFamily}
		let bFF = (""+ f == "undefined" ? false : true)
		if (runSL) {bFF = false}
		if (bFF) {isFFyes.push("system font")} else {isFFno.push("system font")}
		log_perf("system font [isFF]",t0,"",bFF)
		return resolve()
	} catch(e) {
		isFFno.push("system font")
		gCheckOnce.push("_global:isSystemFont: " + e.name +" : "+ e.message)
		log_perf("system font [isFF]",t0,"","error")
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
			log_debug("debugTB","resource:// = ".padStart(19) + "aboutTor.css")
			log_perf("isTB [global]",t0,"",isTB)
			return resolve()
		}
		css.onerror = function() {
			log_perf("isTB [global]",t0,"",isTB)
			return resolve()
		}
		document.head.removeChild(css)
	} catch(e) {
		gErrorsOnce.push("_global: isTB: " + e.name +" : "+ e.message)
		log_perf("isTB [global]",t0,"","error")
		return resolve()
	}
})

const get_isVer = () => new Promise(resolve => {
	// skip
	if (!isFF) {return resolve()}
	// set isVer, isVerPlus
	let t0; if (canPerf) {t0 = performance.now()}
	function output(verNo) {
		isVer = verNo
		if (verNo < 60) {verNo += " or lower"
		} else if (verNo == 99) {isVerPlus = true; verNo += "+"}
		log_perf("isVer [global]",t0,"",verNo)
		return resolve()
	}
	output(cascade())

	function cascade() {
		if (isFFLegacy) return 59
			// ^ we can skip < FF60 legacy checks now
			// note: we can skip non-gecko checks: this only runs if isFF
		if ("pdfViewerEnabled" in navigator) return 99 // 1720353
			// ^ ext fuckable
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

/*** CHECK FUNCTIONS ***/

function check_navKey(property) {
	if (navKeys["trueKeys"]) {return navKeys["trueKeys"].includes(property)} else {return false}
}

const get_navKeys = () => new Promise(resolve => {
	navKeys = {}
	let t0; if (canPerf) {t0 = performance.now()}
	// compare
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
		// common
		let expectedKeys = [
			"appCodeName","appName","appVersion","platform","product","productSub","userAgent","vendor","vendorSub", // ua bits
			"hardwareConcurrency","language","languages","mimeTypes","onLine","plugins",
		]
		if (isFF) {
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
		if (gRun) {gCheck.push("_global:get_navKeys: " + e.name +" : "+ e.message)}
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
	let data = sDetail[name],
		hash = sha1(data.join())
	name = tidyName(name)
	let n = name.indexOf(" "),
		section = name.substring(0,n).toUpperCase(),
		metric = name.substring(n,name.length).trim()
	console.log(section +": "+ metric +": "+ hash, data)
}

function showMetrics(type) {
	if (type == "gDetail") {
		for (let name in gDetail) {
			let data = gDetail[name],
				hash = sha1(data.join())
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
		log_debug("perfS", output)
	}
}

function log_debug(target, output) {
	// add line items to perf/debug table
	let el = document.getElementById(target)
	el.innerHTML = el.innerHTML + (el.innerText.length > 2 ? "<br>" : "") + output
}

function log_error(title, name, msg) {
	// collect globalrun errors
	if (gRun) {
		let isMsg = true
		if (name == undefined || name == "" || name === null) {name = "Error"}
		if (msg == undefined || msg == "" || msg === null) {isMsg = false}
		gErrors.push(title +": " + name + (isMsg ? ": "+ msg : ""))
	}
}

function trim_error(name, msg, len) {
	if (len == undefined) {len = 60}
	let str = name +": "+ msg
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
	let t0 = performance.now(),
		output = ""
	if (time1 == undefined) {time1 = ("error").padStart(7)}
	if (isNaN(time1)){
		output = str.padStart(30) +": "+ (time1).padStart(7)
	} else {
		time1 = isPerf? Math.round(t0 - time1).toString() : "xx"
		output = str.padStart(30) +": "+ time1.padStart(4) +" ms"
	}
	if (time2 == "ignore") {
		time2 = ""
	} else if (time2 == "") {
		output += " | "+ ("n/a").padStart(7)
	} else {
		time2 = isPerf? Math.round(t0 - gt0).toString() : "xxx"
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

function log_section(name, time1, data) {
	let t0; if (canPerf) {t0 = performance.now(); time1 = Math.round(t0-time1).toString()}

	// PERF
	if (gRun && gCount == (gCountExpected - 1)) {
		if (canPerf) {dom.perfall = " "+ (isPerf ? Math.round(performance.now() - gt0) : "xxx") +" ms"}
	}
	let el = dom.perfG, pretty = ""
	if (!isPerf) {time1 = "xx"}
	if (canPerf) {pretty = name.padStart(14) +": "+ sn + time1.padStart(4) + sc +" ms"}
	if (gRun) {
		let time2 = Math.round(t0-gt0).toString()
		if (!isPerf) {time2 = "xxx"}
		pretty += " | "+ so + time2.padStart(4) + sc +" ms"
		if (canPerf) {gPerf.push(pretty)}
		if (gCount == 14) {
			el.innerHTML = gPerf.join("<br>")
		}
	} else {
		if (name !== "prereq") {
			el = dom.perfS
			el.innerHTML = el.innerHTML + (el.innerText.length > 2 ? "<br>" : "") + pretty
			gClick = true
		}
	}

	// DATA
	if (Array.isArray(data)) {
		data.sort()
		let hash = sha1(data.join(), name +" section result")
		// SANITY
		if (data.length == 0) {
			gCheck.push("#section "+ name +": data array is empty")
		} else {
			for (let i=0; i < data.length; i++) {
				let check = data[i]
				if (check == undefined) {
					gCheck.push("#section "+ name +": contains undefined")
				} else {
					let parts = data[i].split(":")
					let metric = parts[0]
					if (metric !== metric.trim()) {
						gCheck.push("#section "+ name +": "+ metric +" needs trimming")
					}
					let value = parts.slice(1).join(":")
					if (value == "") {
						gCheck.push("#section "+ name +": "+ metric +" not set")
					} else if (value == undefined) {
						gCheck.push("#section "+ name +": "+ metric +" undefined")
					} else {
						if ((value.indexOf("<sp") + value.indexOf("<code")) > 0) {
							gCheck.push("#section "+ name +": "+ metric +" contains notation")
						}
						if (value !== value.trim()) {
							gCheck.push("#section "+ name +": "+ metric +" value needs a trim")
						}
					}
				}
			}
		}

		// SECTION
		sData[name] = data
		let sHash = hash + buildButton("0", name, data.length +" metric"+ (data.length > 1 ? "s" : ""), "showMetrics", "btns")
		if (name == "canvas" || name == "storage") {if (isFile) {sHash += note_file}}
		if (name == "ua") {sHash += (isFF ? " [spoofable + detectable]" : "")}
		if (name == "feature") {sHash += (isFF ? " [unspoofable?]" : "")}
		document.getElementById(name +"hash").innerHTML = sHash
		if (canPerf) {document.getElementById("perf"+ name).innerHTML = " "+ (isPerf ? time1 : "xxx") +" ms"}
		if (!gRun) {outputPostSection(name)} // trigger nonFP

		// GLOBAL
		if (gRun) {
			gCount++
			gData.push([name +":"+ hash, data])
			// FINISH
			if (gCount == gCountExpected) {
				// temp
				if (logPerfHash !== "") {
					console.log("HASH STATS: ["+ gPerfHashDetail.length +" times | "+ gPerfHash +" ms]\n - " + gPerfHashDetail.join("\n - "))
					//console.log("HASH STATS: ["+ gPerfHashDetail.length +" times | "+ gPerfHash +" ms]")
				}
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
				for (const k of names) if (sDetail[k].length) {
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
				if (gCheck.length) {
					dom.allcheck.innerHTML = buildButton("1","alerts", gCheck.length +" alert"+ (gCheck.length > 1 ? "s": ""),"showMetrics")
					dom.debugA.innerHTML = gCheck.join("<br>")
				}
				// known/bypass/details
				let knownStr = "", detailBtn = "", bypassBtn = ""
				if (gKnown.length) {
					let knownBtn = " <span class='btn0 btnc' onClick='showMetrics(`known lies`)'>"
						+ soL +"["+ gKnown.length +" lie"+ (gKnown.length > 1 ? "s" : "") +"]"+ scC + "</span>"
					knownStr = sha1(gKnown.join()) + knownBtn
				} else {
					knownStr = "none"
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
					dom.knownmethods = "none"+ detailBtn
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
	if (jsFiles.length == 1 && isFFyes.length) {
		// skip if not likely to be Firefox
		if ("function" === typeof self.structuredClone && "function" !== typeof crypto.randomUUID) {
			// ^ do if 94+ but not 95+
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
	if (jsFiles.length == 13) {
		if (runSL) {isPerf = false}
		try {
			if (Math.trunc(performance.now() - performance.now()) !== 0) {isPerf = false}
		} catch(e) {isPerf = false}
		if (canPerf) {log_line(Math.round(performance.now()) + " : RUN ONCE")}
		Promise.all([
			get_isError(),
			get_isSystemFont(),
		]).then(function(){
			// uses isFF
			let t0
			if (canPerf) {t0= performance.now()}
			Promise.all([
				get_isEngine(), // do first to quickly set isFFLegacy
				get_isOS(),
				get_isVer(),
				get_isTB(),
				get_isBrave(),
				get_isFork(), // uses isFFLegacy, isEngine
			]).then(function(results){
				// some sims = isFF only: not fussy; only devs run these
				if (!isFF) {
	runSN = false
	runSU = false
	runRF = false
	runCSS = false
	runFNT = false
	runWFS = false
				}
				if (results[3] == "timeout") {
					gMethodsOnce.push("_global:resource:blocked")
					log_perf("isTB [global]",t0,"",isTB+ " [timeout]")
				}
				if (results[5] == "timeout") {
					gMethodsOnce.push("_global:isFork:blocked")
					log_perf("isFork [global]",t0,"",isTB+ " [timeout]")
				}
				get_pointer_event() // pointer eventlistener
				outputSection("load")
			})
		})
	}
}

function outputPostSection(id) {
	let isLog = gRun // push to gPerfDetail
	gRun = false

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

function outputSection(id, cls) {
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
		if (id=="all" || id=="12") {reset_fonts()}
		if (id=="all" || id=="1") {dom.kbt.value = ""}
		// set hash perf
		if (gRun && canPerf) {
			logPerfMini = (logPerfHash == "all" || logPerfHash == "mini")
			logPerfSha1 = (logPerfHash == "all" || logPerfHash == "sha1")
		} else {
			logPerfMini = false; logPerfSha1 = false
		}

		function output() {
			// section timer
			if (!gRun && canPerf) {gt0 = performance.now()}
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
			setTimeout(function() {if (id=="all" || id=="8") {outputDomRect()}}, 1)
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
			const sNames = ['','y','x','y','x','x','x','y','x','y','y','x','y','y','y','y','x','x','x']
			if (sNames[id * 1] !== "x" && sPerfDetail.length) {log_line("line")}
		}
		setTimeout(function() {
			if (canPerf) {gt0 = performance.now()}
			Promise.all([
				get_canPerf("log"),
				outputPrototypeLies(),
				get_navKeys(),
				get_isOS64(),
				get_isRFP(),
			]).then(function(results){
				output()
			})
		}, delay)
	}
}

function run_once() {
	get_canPerf()
	// ASAP
	let t99 = ""
	if (canPerf) {
		t99 = performance.now()
		log_line(Math.round(performance.now()) + " : IMMEDIATE")
	}
	if (location.protocol == "file:") {isFile = true; note_file = " [file:/]"
	} else if (location.protocol == "https:") {isSecure = true}
	let t0; if (canPerf) {t0 = performance.now()}
	// WARM
	try {
		log_perf("warmup start [md]",t0,"")
		navigator.mediaDevices.enumerateDevices().then(function(devices) {
			let info = (canPerf ? Math.round(performance.now()) +" | ": "")
				+ (gLoad ? "page load" : "global rerun")
			log_perf("warmup end [md]",t0,t99,info)
		}
	)} catch(e) {}
	try {let v = speechSynthesis.getVoices()} catch(e) {}

	// isFF
	let str = "installtrigger"
	let str1 = "type of "+str, str2 = "type of "+ str +"impl", str3 = str+ " in window"
	let test1 = false, test2 = false, test3 = false
	if (runSL) {
		isFFno.push(str1,str2,str3)
	} else {
		try {if (typeof InstallTrigger == "object") {test1 = true}} catch(e) {}
		try {if (typeof InstallTriggerImpl == "function") {test2 = true}} catch(e) {}
		try {if ("InstallTrigger" in window) {test3 = true}} catch(e) {}
		if (test1) {isFFyes.push(str1)} else {isFFno.push(str1)}
		if (test2) {isFFyes.push(str2)} else {isFFno.push(str2)}
		if (test3) {isFFyes.push(str3)} else {isFFno.push(str3)}
	}
	log_perf("installtrigger [isFF]",t0,"",test1 +", "+ test2 +", "+ test3)

	// get os arch while we wait
	get_isOS64(true)
	// cache/warm things
	try {
		let t80; if (canPerf) {t80 = performance.now()}
		let warm80 = CSS2Properties.prototype.hasOwnProperty("appearance")
		log_perf("v80 [warm]",t80,"",warm80)
	} catch(e) {}
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
//cleanFnTest()
