'use strict';
dom = getUniqueElements()

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

function getElementProp(id, prop, pseudo) {
	try {
		let item = window.getComputedStyle(document.querySelector(id), pseudo)
		item = item.getPropertyValue(prop)
		if (item == "none") {item = "x";if (gRun) {gCheck.push("_generic:element property "+ id +": returned none")}}
		item = item.replace(/"/g,"")
		if (!isNaN(item * 1)) {item = item * 1} // numbers
		if (item == "") {item = "x"} // blanks
		return item
	} catch(e) {
		if (gRun) {gCheck.push("_generic:element property "+ id +": " + e.name)}
		return "x"
	}
}

function sha1(str) {
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
	for(str='';i<40;)str += (H[i>>3] >> (7-i++%8)*4 & 15).toString(16);
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

const get_isBrave = () => new Promise(resolve => {
	/* https://github.com/abrahamjuliot/creepjs/ */
	if (isFF) {return resolve()} // FF
	if (!('chrome' in window)) return resolve() // no chrome
	if (Object.keys(chrome).includes("search")) {return resolve()} // opera

	// proceed
	let t0 = performance.now(), res = []
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
	let t0 = performance.now()
	function set(mode) {
		isBraveMode = mode
		if (gRun) {
			if (mode == "unknown") {gCheck.push("_global:isBraveMode: unknown")}
			log_perf("isBraveMode [global]",t0,"",isBraveMode)
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
			set("strict")			
			return resolve()
		} else {
			// standard and strict mode do not have chrome plugins
			const chromePlugins = /(Chrom(e|ium)|Microsoft Edge) PDF (Plugin|Viewer)/
			const pluginsList = [...navigator.plugins]
			const hasChromePlugins = pluginsList
				.filter(plugin => chromePlugins.test(plugin.name)).length == 2
			if (pluginsList.length && !hasChromePlugins) {
				set("standard")
				return resolve()
			}
			set("allow")
			return resolve()
		}
	} catch(e) {
		set("unknown")
		return resolve()
	}
})

const get_isEngine = () => new Promise(resolve => {
	let t0 = performance.now(), bFF = false
	// set isFF for engine lies
	if (isFFyes.length) {isFF = true}
	function final_isFF() {
		if (isFFyes.length) {
			isFF = true
		} else {
			rfp_green = ""; rfp_red = ""; rfp_random_green = ""; rfp_random_red = ""; lb_green = ""; lb_red = ""; nw_green = ""; nw_red = ""
			enUS_green = ""; enUS_red = ""; spoof_both_green = ""; spoof_both_red = ""; default_ff_green = ""; default_ff_red = ""
			let items = document.getElementsByClassName("group")
			for (let i=0; i < items.length; i++) {items[i].style.display = "none"}
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
		let hash = sha1(res.join()).substring(0,8)
		if (runSL) {hash = "x"}
		if (hash == "ede9ca53") {isEngine = "blink"
		} else if (hash == "05513f36") {isEngine = "webkit"
		} else if (hash == "38172d94") {isEngine = "edgeHTML"
		} else if (hash == "36f067c6") {isEngine = "trident"
		} else if (hash == "225f4a61") {isEngine = "gecko"; bFF = true
		} else if (hash == "cb89002a") {isEngine = "gecko"; bFF = true
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
		log_perf("isEngine [global]",t0,"",(isEngine == "" ? "unknown" : ""+ isEngine))
		return resolve()
	} catch(e) {
		isFFno.push("math")
		final_isFF()
		gCheckOnce.push("_global:isEngine: " + e.name +" : "+ e.message)
		log_perf("isEngine [global]",t0,"","error")
		return resolve()
	}
})

const get_isError = () => new Promise(resolve => {
	let t0 = performance.now()
	try {
		let res = [], bFF = false
		try {newFn("alert('A)")} catch(e) {res.push(e.name +": "+ e.message)}
		try {newFn(`null.value = 1`)} catch(e) {res.push(e.name +": "+ e.message)}
		try {let test = newFn("let a = 1_00_;")} catch(e) {res.push(e.name +": "+ e.message)}
		let hash = sha1(res.join()).substring(0,8)
		if (hash == "510b2814") {bFF = true //FF74+ fix on
		} else if (hash == "422b8490") {bFF = true //FF72-73,FF74+ fix off
		} else if (hash == "f6c5128f") {bFF = true //FF70-71
		} else if (hash == "b7463a43") {bFF = true //FF60-69
		} else if (hash == "7263eca6") {bFF = true //FF59-
		}
		if (bFF) {isFFyes.push("errors")} else {isFFno.push("errors")}
		log_perf("errors [isFF]",t0,"",""+ bFF)
		return resolve()
	} catch(e) {
		gCheckOnce.push("_global:isError: " + e.name +" : "+ e.message)
		log_perf("errors [isFF]",t0,"","error")
		isFFno.push("errors")
		return resolve()
	}
})

const get_isOS = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
	// check
	let t0 = performance.now(),
		el = dom.widget0
	function tryharder() {
		// ToDo: harden isOS
		log_perf("isOS [global]",t0,"","unknown")
		return resolve()
	}
	function trymath() {
		// log lie
		gKnownOnce.push("_global:isOS")
		// try quick math
		let res = [], list = [1e251,1e140,1e12,1e130,1e272,-1,1e284,1e75]
		list.forEach(function(item) {try {res.push(Math.cos(item))} catch(e) {}})
		let m = (sha1(res.join("-"))).substring(0,8)
		if (m == "46f7c2bb") {m="A"
		} else if (m == "8464b989") {m="B"
		} else if (m == "97eee448") {m="C"
		} else if (m == "96895e00") {m="D"
		} else if (m == "06a01549") {m="E"
		} else if (m == "ae434b10") {m="F"
		} else if (m == "19df0b54") {m="G"
		} else if (m == "8ee641f0") {m="H"
		}
		if (m == "A" | m == "B" | m == "C" | m == "H") {isOS = "windows"
		} else if (m == "D" | m == "G") {isOS = "linux"
		} else if (m == "E") {isOS = "mac"
		} else if (m == "F") {isOS = "android"
		}
		//if (runSL) (isOS = "") // breaks font sim
		if (isOS == "") {
			tryharder()
		} else {
			gBypassedOnce.push("_global:isOS:"+ isOS)
			log_perf("isOS [global]",t0,"",isOS)
			return resolve()
		}
	}
	// system font
	try {
		let font = getComputedStyle(el).getPropertyValue("font-family")
		if (font.slice(0,12) == "MS Shell Dlg") {isOS="windows"
		} else if (font == "Roboto") {isOS="android"
		}	else if (font == "-apple-system") {isOS="mac"
		}	else {isOS="linux"}
		if (runSL) {
			isOS = ""
			trymath()
		} else {
			log_perf("isOS [global]",t0,"",isOS)
		}
		return resolve()
	} catch(e) {
		trymath()
	}
})

const get_isOS64 = () => new Promise(resolve => {
	if (!isFF) {return resolve()}
	// OS architecture
		// FF89+: 1703505: javascript.options.large_arraybuffers
	try {
		isOS64 = "unknown"
		let test = new ArrayBuffer(Math.pow(2,32))
		isOS64 = true
		return resolve()
	} catch(e) {
		// ToDo: when pref deprecated: update tooltip + use isVer to confirm 32bit
		//log_perf("isOS64 [global]",t0,"",isOS64)
		return resolve()
	}
})

const get_isRFP = () => new Promise(resolve => {
	isRFP = false
	isPerf = true
	let realPerf = true
	if (runSL) {isPerf = false}
	if (Math.trunc(performance.now() - performance.now()) !== 0) {
		isPerf = false
		realPerf = false
		if (gRun) {gMethods.push("_global:performance.now:tampered")}
	}
	if (runSL) {isPerf = realPerf}
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
		if (gLoad) {
			if (isVer > 62) {
				let chk1 = getElementProp("#cssPRM","content",":after")
				if (chk1 !== "no-preference") {isRFP = false}
			}
			if (isVer > 66) {
				let chk2 = getElementProp("#cssPCS","content",":after")
				if (chk2 !== "light") {isRFP = false}
			}
			if (isVer > 77) {
				let chk3 = zD
				try {if (window.PerformanceNavigationTiming) {chk3 = zE}} catch(e) {}
				if (chk3 !== zD) {isRFP = false}
			}
		}
		return resolve()
	} catch(e) {
		if (gRun) {gCheck.push("_global:isRFP: " + e.name +" : "+ e.message)}
		return resolve()
	}
})

const get_isSystemFont = () => new Promise(resolve => {
	let t0 = performance.now()
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
	let t0 = performance.now()
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
		gCheckOnce.push("_global:isTB: " + e.name +" : "+ e.message)
		log_perf("isTB [global]",t0,"","error")
		return resolve()
	}
})

const get_isVer = () => new Promise(resolve => {
	// skip
	if (!isFF) {return resolve()}
	// set isVer, isVerPlus
	let t0 = performance.now()
	function output(verNo) {
		isVer = verNo
		if (verNo == 59) {verNo += " or lower"
		} else if (verNo == 94) {isVerPlus = true; verNo += "+"}
		log_perf("isVer [global]",t0,"",verNo)
		return resolve()
	}
	function start() { // 94: 1722576
		try {
			newFn("let orig = {name:'TZP'}; orig.itself = orig; let clone = self.structuredClone(orig)")
			output(94)
		} catch(e) {v93()}
	}
	function v93() { //93:1328672
		try {
			if (!isNaN(new Date("1997-03-08 11:19:10-07").getTime())) {output(93)} else {v93b()}
		} catch(e) {v93b()}
	}
	function v93b() { //93:1722448
		try {
			newFn("self.reportError('93')"); output(93)
		} catch(e) {v92()}
	}
	function v92() { //92:1721149
		try {
			let test = {foo: false}
			if (Object.hasOwn(test, "foo")) {output(92)}
		} catch(e) {v91b()}
	}
	function v91b() { //91:1714933
		try {
			let t = Intl.Collator.supportedLocalesOf(["sa"], {localeMatcher: "lookup"})
			if (t.length) {output(91)} else {v91a()}
		} catch(e) {v91a()}
	}
	function v91a() { //91:1710429
		try {
			let t = Intl.DateTimeFormat(undefined, {timeZoneName: "longGeneric"}).format(new Date())
			output(91)
		} catch(e) {v90()}
	}
	function v90() { //90:1520434
		try {
			var share = new ArrayBuffer(4096)
			let t = new Int32Array(share, 7)
		} catch(e) {
			if (e.message.substr(0,1) == "s") {output(90)} else {v89()}
		}
	}
	function v89() { //89:1703213
		try {
			let x = dom.ctrl89.offsetHeight, y = dom.test89.offsetHeight
			if (x/y > 0.85) {output(89)} else {v88()}
		} catch(e) {v88()}
	}
	function v88() { //88:1670124
		try {newFn('function invalid () { "use strict" \n ' + '"\\8"' + '}'); v87()
		} catch(e) {if (e.message.substr(13,5) == "8 and") {output(88)} else {v87()}}
	}
	function v87() { //87:1688335
		try {if (console.length == undefined) {output(87)} else {v86()}} catch(e) {v86()}
	}
	function v86() { //86:1685482
		try {newFn('for (async of [])')} catch(e) {if ((e.message).substring(0,2) == "an") {output(86)} else {v85()}}
	}
	function v85() { //85:1675240
		try {
			newFn("let d=Object.getOwnPropertyDescriptor(RegExp.prototype,'global'); let t=d.get.call('/a')")
		} catch(e) {
			if ((e.message).substring(0,3) == "Reg") {output(85)} else {v84()}
		}
	}
	function v84() { //84:1673440
		try {newFn("var x = @")} catch(e) {if (e.message == "illegal character U+0040") {output(84)} else (v83())}
	}
	function v83() { //83:1667094
		try {
			newFn("let obj = {exec() {return function(){}}}; let t = RegExp.prototype.test.call(obj,'')")
			output(83)
		} catch(e) {v82()}
	}
	function v82() { //82:1655947
		try {
			let t = ((Math.floor((Date.parse("21 Jul 20") - Date.parse("20 Jul 20"))))/86400000)
			if (t == 1) {output(82)} else {v81()}
		} catch(e) {v81()}
	}
	function v81() { //81:1650607
		try {let t = new File(["bits"], "a/b.txt"); if (t.name == "a/b.txt") {output(81)} else {v80()}} catch(e) {v80()}
	}
	function v80() { //80:1651732
		try {
			let obj = {[Symbol.toPrimitive]: () => Symbol()}
			let proxy = (new Proxy({},{get: (obj, prop, proxy) => prop}))
			for (let i = 0; i < 11; i++) {if (typeof proxy[obj] == 'symbol') {}}; output(80)
		} catch (e) {v79()}
	}
	function v79() { //79:1644878
		try {Map.prototype.entries.call(true)} catch(e) {if ((e.message).substring(0,3) == "ent") {output(79)} else {v78()}}
	}
	function v78() { //78:1634135
		try {let t = new RegExp('b'); if (t.dotAll == false) {output(78)} else {v78a()}} catch(e) {v78a()}
	}
	function v78a() { //78:1589095
		try {let t = new Intl.ListFormat(undefined,{style:'long',type:'unit'}).format(['a','b','c']); output(78)} catch(e) {v78b()}
	}
	function v78b() { //78:1633836
		try {let t = new Intl.NumberFormat(undefined, {style:"unit",unit:"percent"}).format(1/2); output(78)} catch(e) {v77()}
	}
	function v77() { //77:1627285
		try {if (isNaN(new DOMRect(0, 0, NaN, NaN).top)) {output(77)} else {v76()}} catch(e) {v76()}
	}
	function v76() { //76:1608010
		try {if (test76.validity.rangeOverflow) {v75()} else {output(76)}} catch(e) {v75()}
	}
	function v75() { //75:1615600
		try {let t = BigInt(2.5)} catch(e) {if (e.message.substring(0,3) == "2.5") {output(75)} else {v74()}}
	}
	function v74() { //74:1605835
		try {newFn("let t = ({ 1n: 1 })"); output(74)} catch(e) {v73()}
	}
	function v73() { //73:1605803
		try {if (getComputedStyle(dom.test73).content == "normal") {output(73)} else {v72()}} catch(e) {v72()}
	}
	function v72() { //72:1589072
		try {let t = newFn('let a = 100_00_;')} catch(e) {if (e.message.substring(0,6) == "unders") {output(72)} else {v71()}}
	}
	function v71() { //71:1575980
		try {let t = new StaticRange()} catch(e) {if (e.name == "TypeError" && e.message.substring(0,4) == "Stat") {output(71)} else {v70()}}
	}
	function v70() { //70:1435818
		try {newFn("let t = 1_050"); output(70)} catch(e) {v69()}
	}
	function v69() { //69:1558387
		try {let t = new DOMError('a'); v68()} catch(e) {output(69)}
	}
	function v68() { //68:1548773
		try {if (dom.test68.typeMustMatch == undefined) {output(68)} else {v67()}} catch(e) {v67()}
	}
	function v67() { //67:1531830
		try {if (!Symbol.hasOwnProperty('matchAll')) {v66()} else {output(67)}} catch(e) {v66()}
	}
	function v66() { //66
		try {let txt = new TextEncoder(), utf8 = new Uint8Array(1); let t = txt.encodeInto("a", utf8); output(66)} catch(e) {v65()}
	}
	function v65() { //65
		try {let t = Intl.DateTimeFormat.supportedLocalesOf("ia")
			if (t.length) {output(65)} else {v65a()}
		} catch(e) {v65a()}
	}
	function v65a() { //65
		try {let t = new Intl.RelativeTimeFormat("en",{style:"long"}); output(65)} catch(e) {v64()}
	}
	function v64() { //64
		try {if (window.screenLeft == undefined) {v63()} else {output(64)}} catch(e) {v63()}
	}
	function v63() { //63
		try {if (Symbol.for(`a`).description == "a") {output(63)} else {v62()}} catch(e) {v62()}
	}
	function v62() { //62
		try {console.time("v62"); console.timeLog("v62"); console.timeEnd("v62"); output(62)} catch(e) {v61()}
	}
	function v61() { //61
		try {let t = (" a").trimStart(); output(61)} catch(e) {v60()}
	}
	function v60() { //60
		try {(Object.getOwnPropertyDescriptor(Document.prototype, "body")
			|| Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "body")).get.call((new DOMParser).parseFromString(
				"<html xmlns='http://www.w3.org/1999/xhtml'><body/></html>","application/xhtml+xml")) !== null
			output(60)
		} catch(e) {output(59)}
	}
	start()
})

/*** CHECK FUNCTIONS ***/

function check_navKey(property) {
	if (navKeys["trueKeys"]) {return navKeys["trueKeys"].includes(property)} else {return false}
}

const get_navKeys = () => new Promise(resolve => {
	navKeys = {}
	// compare
	try {
		let keysA = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		keysA = keysA.filter(x => !["constructor"].includes(x))
		let keysB = []
		for (const key in navigator) {keysB.push(key)}
		if (gRun) {
			if (runSL) {keysA = ["b","c","buildID","iamfake","appName"]; keysB = ["appName","b","e","f"]}
			if (sha1(keysA.join()) !== sha1(keysB.join())) {
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
				if (r == "") {r = "empty string"}
				if (r == "undefined") {r = "undefined string"}
				if (r == undefined) {r = "undefined value"}
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
		word = (style == "none" ? "&#9660; show " : "&#9650; hide ") + (word == "" || word == undefined ? "details" : word)
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
		console.log("perf detail: global\n"+ gPerfDetail.join("\n"))
	} else if (type == "sPerfDetail") {
		if (sPerfDetail.length) {
			console.log("perf detail: section re-runs\n"+ sPerfDetail.join("\n"))
		}
	} else {
		let array = [],
			showhash = true
		if (type == "known lies") {
			array = gKnown
		} else if (type == "lies (hopefully) bypassed") {
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
		}
		console.log(type +": "+ (showhash ? sha1(array.join()) : ""), array)
	}
}

/*** INCOMING DATA ***/

function buildButton(colorCode, arrayName, displayText, functionName, btnType) {
	if (functionName == undefined) {functionName = "showDetail"}
	if (btnType == undefined) {btnType = "btnc"}
	return " <span class='btn"+ colorCode +" "+ btnType +"' onClick='"
		+ functionName +"(`"+ arrayName +"`)'>["+ displayText +"]</span>"
}

function clearDetail(name) {
	try {sDetail[name] = []} catch(e) {}
}

function log_click(name, time) {
	// click here doesn't record via log_section
	let output = isPerf ? Math.round(performance.now() - time).toString() : "xx"
	output = name.padStart(14) +": "+ sn + output.padStart(4) + sc +" ms"
	log_debug("perfS", output)
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

function log_line(str) {
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

function log_perf(str, time1, time2, extra) {
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
	if (gRun) {
		gPerfDetail.push(output)
	} else {
		sPerfDetail.push(output)
	}
}

function log_section(name, time1, data) {
	let t0 = performance.now()
	time1 = Math.round(t0-time1).toString()

	// DATA
	if (Array.isArray(data)) {
		data.sort()
		let hash = sha1(data.join())
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
		document.getElementById("perf"+ name).innerHTML = " "+ (isPerf ? time1 : "xxx") +" ms"

		// GLOBAL
		if (gRun) {
			gCount++
			gData.push([name +":"+ hash, data])
			// FINISH
			if (gCount == 15) {
				gLoad = false
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
				// known/bypass
				let detailBtn = ""
				if (Object.keys(gKnownDetail).length) {
					detailBtn = buildButton("0", "gKnownDetail", "details", "showMetrics")
				}
				if (gKnown.length) {
					let knownBtn = " <span class='btn0 btnc' onClick='showMetrics(`known lies`)'>"
						+ soL +"["+ gKnown.length +" lie"+ (gKnown.length > 1 ? "s" : "") +"]"+ scC + "</span>"
					let bypassBtn = ""
					if (gBypassed.length) {
						bypassBtn = " <span class='btn0 btnc' onClick='showMetrics(`lies (hopefully) bypassed`)'>"
						+ soB +"["+ gBypassed.length +" bypassed]"+ scC + "</span>"
					}
					dom.knownhash.innerHTML = sha1(gKnown.join())	+ knownBtn + bypassBtn + detailBtn
				} else {
					dom.knownhash.innerHTML = "none"+ detailBtn
				}
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
				dom.perfall = " "+ (isPerf ? Math.round(performance.now() - gt0) : "xxx") +" ms"
				gClick = true
			}
		}
	} else {}	// !ARRAY

	// PERF
	let el = dom.perfG
	if (!isPerf) {time1 = "xx"}
	let pretty = name.padStart(14) +": "+ sn + time1.padStart(4) + sc +" ms"

	if (gRun) {
		let time2 = Math.round(t0-gt0).toString()
		if (!isPerf) {time2 = "xxx"}
		pretty += " | "+ so + time2.padStart(4) + sc +" ms"
		gPerf.push(pretty)
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
}

/*** RUN ***/

function countJS(filename) {
	jsFiles.push(filename)
	if (jsFiles.length == 13) {
		if (runSL) {isPerf = false}
		if (Math.trunc(performance.now() - performance.now()) !== 0) {isPerf = false}
		// harden isFF
		log_line(Math.round(performance.now()) + " : RUN ONCE")
		Promise.all([
			get_isError(),
			get_isSystemFont(),
		]).then(function(){
			// uses isFF
			let t0 = performance.now()
			Promise.all([
				get_isEngine(),
				get_isOS(),
				get_isVer(),
				get_isTB(),
				get_isBrave(),
			]).then(function(results){
				// sims are isFF only
				if (!isFF) {
					runS = false
					runSC = false
					runSL = false
					runSUA = false
				}
				if (results[3] == "timeout") {
					gMethodsOnce.push("_global:resource:blocked")
					log_perf("isTB [global]",t0,"",isTB+ " [timeout]")
				}
				get_pointer_event() // pointer eventlistener
				outputSection("load")
			})
		})
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
		} else {
			// clear: &nbsp stops line height jitter
			let tbl = document.getElementById("tb"+ id)
			tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
			gRun = false
		}
		// reset
		if (id=="all" || id=="12") {reset_fonts()}
		if (id=="all" || id=="1") {dom.kbt.value = ""}
		// hide: don't shrink/grow
		if (id=="18") {dom.mathmltest.style.color = zhide}

		function output() {
			// section timer
			if (!gRun) {gt0 = performance.now()}
			// section only
			if (id=="1") {outputScreen("screen")}
			if (id=="2") {outputUA()}
			if (id=="3") {outputFD()}
			if (id=="11" && cls=="c") {outputAudio()}
			if (id=="11" && cls=="c2") {outputAudio2()}
			// combine 1,2,3
			if (id=="all") {outputStart()}
			// stagger
			setTimeout(function() {if (id=="all" || id=="7") {outputDevices()}}, 1) // do next
			setTimeout(function() {if (id=="all" || id=="5") {outputHeaders()}}, 1)
			setTimeout(function() {if (id=="all" || id=="6") {outputStorage()}}, 1)
			setTimeout(function() {if (id=="all" || id=="8") {outputDomRect()}}, 1)
			setTimeout(function() {if (id=="all" || id=="15") {outputElements()}}, 1)
			setTimeout(function() {if (id=="all" || id=="4") {outputLanguage()}}, 1)
			setTimeout(function() {if (id=="all" || id=="14") {outputCSS()}}, 1)
			setTimeout(function() {if (id=="all" || id=="18") {outputMisc()}}, 1)
			setTimeout(function() {if (id=="all" || id=="13") {outputMedia()}}, 1)
			setTimeout(function() {if (id=="all" || id=="12") {outputFonts()}}, 1)
			//setTimeout(function() {if (id=="all" || id=="10") {outputWebGL()}}, 1)
			setTimeout(function() {if (id=="all" || id=="9") {outputCanvas()}}, 1) // call last
			setTimeout(function() {if (id=="all") {outputAudio()}}, 1)
		}

		if (gRun) {
			if (delay == 1) {log_line(Math.round(performance.now()) + " : START")}
		} else {
			const sNames = ['','y','x','y','x','x','x','y','x','y','y','x','y','y','y','x','x','x','x']
			if (sNames[id * 1] !== "x" && sPerfDetail.length) {log_line("line")}
		}
		setTimeout(function() {
			gt0 = performance.now()
			Promise.all([
				get_isRFP(),
				get_navKeys(),
				outputPrototypeLies(),
				get_isOS64(),
			]).then(function(results){
				output()
			})
		}, delay)
	}
}

function run_once() {
	// ASAP
	log_line(Math.round(performance.now()) + " : GENERIC")
	if ((location.protocol) == "file:") {isFile = true; note_file = " [file:/]"}
	if ((location.protocol) == "https:") {isSecure = true}
	// isFF
	let t0 = performance.now()
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
	// WARM
	try {navigator.mediaDevices.enumerateDevices().then(function(devices) {})} catch(e) {}
	try {let v = speechSynthesis.getVoices()} catch(e) {}
}

run_once()
