'use strict';

var jsZoom, varDPI, dpr2, dpi_x, dpi_y, zoomAssume, uaBS

/* GLOBAL isTHINGS */

function get_isBraveMode() {
	try {
		// strict mode returns null supported extensions
		const canvas = document.createElement("canvas")
		const gl = canvas.getContext("webgl")
		if (!gl.getSupportedExtensions()) {
			return "strict"
		}
		// standard and strict mode do not have chrome plugins
		const chromePlugins = /(Chrom(e|ium)|Microsoft Edge) PDF (Plugin|Viewer)/
		const pluginsList = [...navigator.plugins]
		const hasChromePlugins = pluginsList
			.filter(plugin => chromePlugins.test(plugin.name)).length == 2
		if (!hasChromePlugins) {
			return "standard"
		}
		return "allow"
	} catch(e) {
		return "unknown"
	}
}

function get_isChrome() {
	let os = "",
		t0 = performance.now()
	// output
	function output(r) {
		if (r.toLowerCase() !== isOS && r !== zNA) {r += sb +"[!= widget]"+ sc + (runS ? zSIM : "")}
		dom.fdChrome.innerHTML = r
		isChrome = r
		log_perf("chrome [fd]",t0)
	}
	if (isChrome == "") {
		dom.fdChrome.innerHTML = "blocked"
		function run2() {
			// android lacks this
			let img = new Image()
			img.src = "chrome://branding/content/icon64.png"
			img.style.visibility = "hidden"
			document.body.appendChild(img)
			img.onload = function() {
				output("Linux")
			}
			img.onerror = function() {
				output("Android")
			}
			document.body.removeChild(img)
		}
		function output_check(r) {
			if (r == "") {
				run2()
			} else {
				output(r)
			}
		}
		function run1() {
			// win/mac
			let c = "chrome://browser/content/extension-",
				p = "-panel.css",
				list = [c +'win'+ p, c +'mac'+ p],
				x = 0
			// ToDo: https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/40201
			list.forEach(function(item) {
				let css = document.createElement("link")
				css.href = item
				css.type = "text/css"
				css.rel = "stylesheet"
				document.head.appendChild(css)
				css.onload = function() {
					if (item === c +"win"+ p) {os = "Windows"}
					if (item === c +"mac"+ p) {os = "Mac"}
					x++
					if (x == 2) {output_check(os)}
				}
				css.onerror = function() {
					x++
					if (x == 2) {output_check(os)}
				}
				document.head.removeChild(css)
			})
		}
		// FF60+ only
		if (isVer > 59) {
			run1()
		} else {
			output(zNA)
		}
	} else {
		output(isChrome)
	}
}

const get_isEngine = () => new Promise(resolve => {
	let t0 = performance.now(),
		bFF = false
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
		if (hash == "ede9ca53") {isEngine = "blink"
		} else if (hash == "05513f36") {isEngine = "webkit"
		} else if (hash == "38172d94") {isEngine = "edgeHTML"
		} else if (hash == "36f067c6") {isEngine = "trident"
		} else if (hash == "225f4a61") {isEngine = "gecko"; bFF = true
		} else if (hash == "cb89002a") {isEngine = "gecko"; bFF = true
		}
		log_perf("math [isFF]",t0,"",""+ (isFF && skipFF ? "skipped": bFF))
		// harden isEngine
		if (isEngine == "") {
			if (isFF) {
				// three isFF checks so far
				isEngine = "gecko"
			} else if ("chrome" in window) {isEngine = "blink"}
		}
		// harden isFF: the fourth check
		if (bFF) {isFF = true}
		// math isFF is the final isFF check
		log_perf("status [isFF]",""+ isFF,"ignore")
		log_perf("isEngine [global]",t0,"",(isEngine == "" ? "unknown" : ""+ isEngine))
		return resolve()
	} catch(e) {
		console.error("get_isEngine", e.name, e.message)
		log_perf("isEngine [global]",t0,"","error")
		return resolve("error")
	}
})

const get_isError = () => new Promise(resolve => {
	let t0 = performance.now()
	// skip
	if (isFF && skipFF) {
		log_perf("errors [isFF]",t0,"","skipped")
		return resolve()
	}
	try {
		let res = [],
			bFF = false
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
		// harden isFF
		if (bFF) {isFF = true}
		log_perf("errors [isFF]",t0,"",""+ bFF)
		return resolve()
	} catch(e) {
		console.error("get_isError", e.name, e.message)
		log_perf("errors [isFF]",t0,"","error")
		return resolve()
	}
})

const get_isOS = () => new Promise(resolve => {
	// skip
	if (!isFF) {return resolve()}
	// check
	let t0 = performance.now(),
		el = dom.widget0
	try {
		let font = getComputedStyle(el).getPropertyValue("font-family")
		if (font.slice(0,12) == "MS Shell Dlg") {isOS="windows"
		} else if (font == "Roboto") {isOS="android"
		}	else if (font == "-apple-system") {isOS="mac"
		}	else {isOS="linux"}
		if (runS) {isOS = ""}
		log_perf("isOS [global]",t0,"",isOS)
		return resolve()
	} catch(e) {
		console.error("get_isOS", e.name, e.message)
		log_perf("isOS [global]",t0,"","error")
		return resolve()
	}
})

const get_isRFP = () => new Promise(resolve => {
	isRFP = false
	isPerf = true
	if (Math.trunc(performance.now() - performance.now()) !== 0) {isPerf = false}
	// skip
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
		return resolve()
	} catch(e) {
		console.error("get_isRFP", e.name, e.message)
		return resolve()
	}
})

const get_isSystemFont = () => new Promise(resolve => {
	let t0 = performance.now()
	// skip
	if (isFF & skipFF) {
		log_perf("system font [isFF]",t0,"","skipped")
		return resolve()
	}
	// check
	try {
		let el = dom.sysFont,
			f = undefined
		let test = getComputedStyle(el).getPropertyValue("font-family")
		el.style.font = "99px sans-serif"
		try {el.style.font = "-moz-dialog"} catch(err) {}
		let s = getComputedStyle(el, null)
		if (s.fontSize != "99px") {f = s.fontFamily}
		let bFF = (""+ f == "undefined" ? false : true)
		if (bFF) {isFF = true}
		log_perf("system font [isFF]",t0,"",bFF)
		return resolve()
	} catch(e) {
		console.error("get_isSystemFont", e.name, e.message)
		log_perf("system font [isFF]",t0,"","error")
		return resolve()
	}
})

const get_isTB = () => new Promise(resolve => {
	// skip
	if (!isFF) {return resolve()}
	// check
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
		console.error("get_isTB", e.name, e.message)
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
		} else if (verNo == 89) {isVerPlus = true; verNo += "+"}
		log_perf("isVer [global]",t0,"",verNo)
		return resolve()
	}
	function start() { //89:1703213
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
			let reg85 = ("/a")
			let descriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, "global")
			let test85 = descriptor.get.call(reg85)
		} catch(e) {
			if ((e.message).substring(0,3) == "Reg") {output(85)} else {v84()}
		}
	}
	function v84() { //84:1673440
		try {newFn("var x = @")} catch(e) {if (e.message == "illegal character U+0040") {output(84)} else (v83())}
	}
	function v83() { //83:1667094
		try {
			let obj83 = {exec() {return function(){}}}
			let test83 = RegExp.prototype.test.call(obj83, "")
			output(83)
		} catch(e) {v82()}
	}
	function v82() { //82:1655947
		try {
			let test82 = ((Math.floor((Date.parse("21 Jul 20") - Date.parse("20 Jul 20"))))/86400000)
			if (test82 == 1) {output(82)} else {v81()}
		} catch(e) {v81()}
	}
	function v81() { //81:1650607
		try {let file81 = new File(["bits"], "a/b.txt"); if (file81.name == "a/b.txt") {output(81)} else {v80()}} catch(e) {v80()}
	}
	function v80() { //80:1651732
		try {
			let obj80 = {[Symbol.toPrimitive]: () => Symbol()}
			let proxy80 = (new Proxy({},{get: (obj80, prop, proxy80) => prop}))
			for (let i = 0; i < 11; i++) {if (typeof proxy80[obj80] == 'symbol') {}}; output(80)
		} catch (e) {v79()}
	}
	function v79() { //79:1644878
		try {Map.prototype.entries.call(true)} catch(e) {if ((e.message).substring(0,3) == "ent") {output(79)} else {v78()}}
	}
	function v78() { //78:1634135
		try {let regex78b = new RegExp('b'); if (regex78b.dotAll == false) {output(78)} else {v78a()}} catch(e) {v78a()}
	}
	function v78a() { //78:1589095
		try {let test78a = new Intl.ListFormat(undefined,{style:'long',type:'unit'}).format(['a','b','c']); output(78)} catch(e) {v78b()}
	}
	function v78b() { //78:1633836
		try {let test78 = new Intl.NumberFormat(undefined, {style:"unit",unit:"percent"}).format(1/2); output(78)} catch(e) {v77()}
	}
	function v77() { //77:1627285
		try {if (isNaN(new DOMRect(0, 0, NaN, NaN).top)) {output(77)} else {v76()}} catch(e) {v76()}
	}
	function v76() { //76:1608010
		try {if (test76.validity.rangeOverflow) {v75()} else {output(76)}} catch(e) {v75()}
	}
	function v75() { //75:1615600
		try {let test75 = BigInt(2.5)} catch(e) {if (e.message.substring(0,3) == "2.5") {output(75)} else {v74()}}
	}
	function v74() { //74:1605835
		try {newFn("let t = ({ 1n: 1 })"); output(74)} catch(e) {v73()}
	}
	function v73() { //73:1605803
		try {if (getComputedStyle(dom.test73).content == "normal") {output(73)} else {v72()}} catch(e) {v72()}
	}
	function v72() { //72:1589072
		try {let test72 = newFn('let a = 100_00_;')} catch(e) {if (e.message.substring(0,6) == "unders") {output(72)} else {v71()}}
	}
	function v71() { //71:1575980
		try {let test71 = new StaticRange()} catch(e) {if (e.name == "TypeError" && e.message.substring(0,4) == "Stat") {output(71)} else {v70()}}
	}
	function v70() { //70:1435818
		try {newFn("let t = 1_050"); output(70)} catch(e) {v69()}
	}
	function v69() { //69:1558387
		try {let test69 = new DOMError('a'); v68()} catch(e) {output(69)}
	}
	function v68() { //68:1548773
		try {if (dom.test68.typeMustMatch == undefined) {output(68)} else {v67()}} catch(e) {v67()}
	}
	function v67() { //67:1531830
		try {if (!Symbol.hasOwnProperty('matchAll')) {v66()} else {output(67)}} catch(e) {v66()}
	}
	function v66() { //66
		try {let txt = new TextEncoder(), utf8 = new Uint8Array(1); let test66 = txt.encodeInto("a", utf8); output(66)} catch(e) {v65()}
	}
	function v65() { //65
		try {let test65 = new Intl.RelativeTimeFormat("en",{style:"long"}); output(65)} catch(e) {v64()}
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
		try {let test61 = (" a").trimStart(); output(61)} catch(e) {v60()}
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

/* FUNCTIONS */

function return_lb_nw(w,h) {
	// LB
	let wstep = 200, hstep = 200, bw = false, bh = false
	if (w < 501) {wstep = 50} else if (w < 1601) {wstep = 100}
	if (h < 501) {hstep = 50} else if (h < 1601) {hstep = 100}
	bw = Number.isInteger(w/wstep)
	bh = Number.isInteger(h/hstep)
	let r = (bw && bh) ? lb_green : lb_red
	// NW
	wstep = 200, hstep = 100, bw = false, bh = false
	if (w < 1001) {bw = Number.isInteger(w/wstep)}
	if (h < 1001) {bh = Number.isInteger(h/hstep)}
	r += (bw && bh) ? nw_green : nw_red
	return r
}

function return_mm_dpi(type) {
	let r = ""
	try {
		r = (function() {
			for (let i=1; i < 2000; i++) {
				if (matchMedia("(max-resolution:"+ i + type +")").matches === true) {
					return i}
			} return i
		})()
	} catch(e) {r = zB0}
	return r
}

function get_collation() {
	let list = ['ka','ku','lo','no','pa','tk'],
		chars = ['\u00F1','\u00E4','\u0109','\u0649','\u10D0','\u0E9A'],
		res = [],
		t0 = performance.now()
	// output
	function output(hash) {
		if (runS) {hash = sha1(hash)}
		let r = ""
		if (hash == "d0e83d1d652f95d686870a59def6ddcc7cde5e28") {
			r = zFF +" [FF70+]"
		} else if (hash == "e4a32b021b6743d34573ab91a9a31d1068e5b01e") {
			r = zFF +" [FF65-69]"
		} else if (hash == "78c0998f75b0da6b11dd55e2f29dc054e14aae9e") {
			r = zFF +" [FF64 or lower]"
		} else {
			r = hash + zNEW
			dom.fdCollation.setAttribute("class", "c mono")
		}
		dom.fdCollation.innerHTML = r + (runS ? zSIM : "")
		log_perf("collation [fd]",t0)
	}
	// run
	chars.sort() // set
	let control = sha1(chars.sort(Intl.Collator("en-US").compare))
	list.forEach(function(i) {
		chars.sort() // reset
		chars.sort(Intl.Collator(i).compare)
		let test = sha1(chars.join())
		res.push(test)
	})
	output(sha1(res.join()))
}

function get_color() {
	let res = [], r1 = "", r2 = "", r3 = ""
	// depth
	try {r1 = screen.pixelDepth} catch(e) {r1 = zB0}
	if (protoLies.includes("Screen.PixelDepth")) {r1 = "fake"}
	try {r2 = screen.colorDepth} catch(e) {r2 = zB0}
	if (protoLies.includes("Screen.colorDepth")) {r1 = "fake"}
	res.push("pixelDepth:"+ r1)
	res.push("screenDepth:"+ r2)
	r1 += " | "+ r2
	dom.ScrDepth.innerHTML = r1 += (r1 == "24 | 24" ? rfp_green : rfp_red)
	// color
	try {
		r3 = (function() {
			for (let i=0; i < 1000; i++) {
				if (matchMedia("(color:"+ i +")").matches === true) {return i}
			}
			return i
		})()
	} catch(e) {r3 = zB0}
	dom.mmC.innerHTML = r3 + (r3 == 8 ? rfp_green : rfp_red)
	let r4 = getElementProp("#cssC","content",":after")
	// lies
	if (gRun && r4 !== "x") {
		if (r3 !== r4) {
			gLiesKnown.push("screen:color")
			gLiesBypassed.push("screen:color:"+ r4)
		}
	}
	r3 = (r4 == "x" ? r3 : r4)
	res.push("color:"+ r3)
	// return
	return(res)
}

function get_errors() {
	return new Promise(resolve => {
		let res = [],
			test = "",
			hash = "",
			code = "",
			ff = "",
			isBlock = false,
			t0 = performance.now()
		// output
		function output() {
			hash = sha1(res.join())
			if (isFF) {
				// codes
				let tmp = hash.substring(0,8)
				// 74+: 1259822: error_message_fix: codes 1=false 2=true
				if (tmp == "b9a8b17b") {code = "A"; ff = "[FF60-67]"
				} else if (tmp == "cb379de2") {code = "B"; ff = "[FF68-69]"
				} else if (tmp == "7453242e") {code = "C"; ff = "[FF70]"
				} else if (tmp == "30205428") {code = "D"; ff = "[FF71]"
				} else if (tmp == "79bf9efd") {code = "E1"; ff = "[FF72-74]"
				} else if (tmp == "18a23d47") {code = "E2"; ff = "[FF74]"
				} else if (tmp == "057c7db9") {code = "F1"; ff = "[FF75-77]"
				} else if (tmp == "5bb66724") {code = "F2"; ff = "[FF75-77]"
				} else if (tmp == "ac156397") {code = "G1"; ff = "[FF78+]"
				} else if (tmp == "6140f242") {code = "G2"; ff = "[FF78+]"
				}
				if (runS) {code = ""; ff = ""}
				if (code !== "") {
					code = s3 +"["+ code +"]"+ sc
					dom.fdError.innerHTML = zFF +" "+ ff + code
					dom.errh.innerHTML = hash + code + (runS ? zSIM : "")
				} else {
					code = zNEW
					dom.errh.innerHTML = hash + code + (runS ? zSIM : "")
					if (isBlock) {
						dom.fdError.innerHTML = "script blocking detected"+ sb +"[see details]"+ sc + (runS ? zSIM : "")
					} else {
						dom.fdError.innerHTML = hash + zNEW + (runS ? zSIM : "")
						dom.fdError.setAttribute("class", "c mono")
					}
				}
			} else {
				dom.errh = hash; dom.fdError = hash
			}
			log_perf("errors [fd]",t0)
			return resolve("errors:"+ hash)
		}
		// run
		function run() {
			//1
			try {
				newFn("alert('A)")
			} catch(e) {
				dom.err1=e; res.push(e.name +": "+ e.message)
				if (e.message == "unterminated string literal") {code = "X"; ff = "[FF59 or lower]"}
			}
			//2
			try {
				newFn(`null.value = 1`)
			} catch(e) {
				if (runS) {e += zSIM}
				dom.err2=e; res.push(e.name +": "+ e.message)
			}
			//3
			try {
				test = newFn("BigInt(2.5)")
			} catch(e) {
				if (isFF) {
					test = e.message.substring(0,3)
					if (test == "2.5") {
						//75+
						test = e.name +": "+ e.message
					} else if (test == "can") {
						//68-74: trap NumberFormat
						try {
							test = newFn("987654321987654321n")
							let num = new Intl.NumberFormat(undefined)
							test = num.format(test)
							test = e.name +": "+ e.message
						} catch (e) {
							if (e.message.substring(0,5) == "Intl.") {
								test = zB0
							} else if (e.name == "TypeError") {
								//68-69 expected
								test = e.name +": "+ e.message
							} else {
								test = zB0
							}
						}
					} else if (e.name == "ReferenceError") {
						if (test == "Big") {
							//60-67
							test = e.name +": "+ e.message
						} else {
							test = zB0
						}
					} else {
						test = zB0
					}
				} else {
					test = e.name +": "+ e.message
				}
				if (test == zB0) {isBlock = true}
				dom.err3=test; res.push(test)
			}
			//4
			try {
				test = newFn("let a = 1_00_;")
			} catch(e) {
				test = e.name +": "+ e.message; dom.err4=test; res.push(test)
			}
			//5: s/be none FF78+
			try {
				test = new Intl.NumberFormat("en", {style:"unit", unit:"percent"}).format(1/2)
			} catch(e) {
				if (isFF) {
					if (e.name == "RangeError") {
						test = e.name +": "+ e.message
					} else {
						test = zB0; isBlock = true
					}
				} else {
					test = e.name +": "+ e.message
				}
				dom.err5=test; res.push(test)
			}
			output()
		}
		run()
	})
}

function get_fullscreen(runtype) {
	let r = ""
	try {
		if (document.mozFullScreenEnabled) {r = zE} else {r = zD; dom.fsLeak = zNA}
	} catch(e) {
		r = "no: "+ e.name; dom.fsLeak = zNA
	}
	dom.fsSupport = r
	return (runtype == "section" ? "full_screen_api:" : "") + r
}

function get_line_scrollbar(runtype) {
	return new Promise(resolve => {
		let osW = "[Windows]",
			osWL = "[Windows or Linux]",
			osL = "[Linux]",
			osLM = "[Linux or Mac]",
			osM = "[Mac]",
			osTBL = " [Linux]"+ tb_green,
			os = "",
			vw = "",
			sbZoom = "",
			dScrollbar = "",
			eScrollbar = "",
			sBig = s3 +"...why are you so big?"+ sc,
			sSmall = s3 +"...why are you so small?"+sc

		// scrollbar
		function run_scrollbar() {
			jsZoom = jsZoom * 1
			let t0 = performance.now()
			// get width, remember it for later
			let w = (window.innerWidth-vw)
			let pseudoW = getElementProp("#D","content",":before")
			if (pseudoW !== "x") {
				if (pseudoW * 1 == w-1) {pseudoW = w} // allow for min-
				w = pseudoW-vw
			}
			let wZoom = w
			// section metric
			if (w > 0) {dScrollbar = "not zero"} else {dScrollbar = "zero"}

			// start
			if (w == 0) {
				os= "[Mac OS X, mobile or floating scrollbars]"
			} else if (w < 0) {
				os= "[mobile]"
			}	else {
				// known metrics
				if (jsZoom == 100) {
					if (w==17) {os=osW};
					if (w==16) {os=osL}
					if (w==15) {os=osM}
					if (w==12) {os=osL}
				} else if (jsZoom == 110) {
					if (w==16) {os=osW}
					if (w==15) {os=osW}
					if (w==14) {os=osLM}
					if (w==11) {os=osL}
				} else if (jsZoom == 120) {
					if (w==15) {os=osW}
					if (w==14) {os=osWL}
					if (w==12) {os=osM}
					if (w==10) {os=osL}
				} else if (jsZoom == 133) {
					if (w==13) {os=osW}
					if (w==12) {os=osWL}
					if (w==11) {os=osM}
					if (w==9) {os=osL}
				} else if (jsZoom == 90) {
					if (w==19) {os=osW}
					if (w==18) {os=osL}
					if (w==17) {os=osM}
					if (w==16) {os=osM}
					if (w==13) {os=osL}
				} else if (jsZoom == 150) {
					if (w==12) {os=osW}
					if (w==11) {os=osW}
					if (w==10) {os=osLM}
					if (w==8) {os=osL}
				} else if (jsZoom == 170) {
					if (w==10) {os=osWL}
					if (w==8) {os=osM}
					if (w==7) {os=osL}
				} else if (jsZoom == 80) {
					if (w==21) {os=osW}
					if (w==20) {os=osL}
					if (w==19) {os=osM}
					if (w==15) {os=osL}
				} else if (jsZoom > 170) {
					os=sBig
				} else if (jsZoom < 80) {
					os=sSmall
				}
				if (os != "") {
					if (os == sBig || os == sSmall) { // do nothing
					} else {os += " [known metric]"
					}
				} else {
					// unknown
					if (jsZoom !== 100) {
						// recalc at 100% for final guess: not perfect
						if (window.devicePixelRatio !== 1 || dpi_y == 0) {
							// RFP is off or css is blocked
							wZoom = w * window.devicePixelRatio
						} else {
							wZoom = w * (((varDPI/dpi_x)*100)/100)
						}
					}
					// final guess
					if (wZoom >= 16.5) {
						os=osW // in testing = windows only
					} else {
						os=osL // guess linux (andoid s/be 0, mac s/be covered)
					}
					// guess
					os += " [logical guess]"
				}
			}
			// output
			if (jsZoom !== 100) {sbZoom = " at "+ jsZoom +"% "}
			dom.fdScrollV.innerHTML = w +"px "+ sbZoom + os
			// element scrollbar
			let eW = (100-dom.fdScroll.scrollWidth)
			if (eW > 0) {eScrollbar = "not zero"} else {eScrollbar = "zero"}
			if (jsZoom == 100) {
				eW += "px"+ (eW == w ? "" : sb +"[!= viewport scrollbar]"+ sc)
			} else {
				eW += "px"
			}
			dom.fdScrollE.innerHTML = eW
			// perf
			if (runtype == "fd") {
				log_perf("scrollbar [fd]",t0)
			}
		}

		// css lineheight
		function run_lineheight() {
			let method = "computedstyle",
				strFont = "",
				t0 = performance.now()
			os = ""
			// computedStyle
			let element = dom.spanLH,
				lh = "normal"
			try {lh = getComputedStyle(element).getPropertyValue("line-height")} catch(e) {}
			// font
			let font = "", fontProp = false, isTNR = false
			try {
				font = getComputedStyle(element).getPropertyValue("font-family")
				fontProp = true
				if (font.slice(1,16) == "Times New Roman") {
					isTNR = true
				} else {
					strFont = sb +"[document fonts are disabled]"+ sc
				}
			} catch(e) {
				strFont = sb +"[font property is blocked]"+ sc
				fontProp = false
			}
			// clientrect
			if (lh == "normal") {
				element = dom.divLH
				try {
					let elDiv = element.getBoundingClientRect()
					lh = elDiv.height
					// trim decimals
					if (count_decimals(lh) > 4) {lh = lh.toFixed(4)}
					lh = lh.toString()
					// remove trailing zeros
					try {
						lh = (lh * 1).toString()
					} catch(e) {}
					method = "clientrect"
				} catch(err) {
					method = "none"
				}
			}

			// simulate
			let simulate = 0
			if (simulate == 1) {
				// no clientrect
				method = "none"
			} else if (simulate == 2) {
				// no font property
				strFont = sb +"[font property is blocked]"+ sc
				fontProp = false
			} else if (simulate == 3) {
				// doc fonts blocked
				strFont = sb +"[document fonts are disabled]"+ sc
				isTNR = false
			} else if (simulate == 4) {
				// 1+2
				method = "none"
				strFont = sb +"[font property is blocked]"+ sc
				fontProp = false
			} else if (simulate == 5) {
				// 1+3
				method = "none"
				strFont = sb +"[document fonts are disabled]"+ sc
				isTNR = false
			}

			// build
			if (isOS == "android") {
				// ignore android
			} else if (method !== "none") {
				// trim
				if (lh.substr(-2) == "px") {lh = lh.slice(0, -2) * 1}
				// check font
				if (strFont !== "") {
					os = strFont
				} else if (lh == "19.2") {
					// TB DESKTOP: 19.2 **seems** TB unique any-zoom/any-platform
					os = tb_green
				} else {
					// isTNR + not 19.2
					// WIN/LINUX: some known metrics
					if (jsZoom == 100) {
						if (lh=="20") {os=osW}
						if (lh=="19") {os=osL}
						if (lh=="18") {os=osW}
						if (lh=="17") {os=osL}
					} else if (jsZoom == 110) {
						if (lh=="19.25") {os=osW}
						if (lh=="18.7") {os=osTBL}
						if (lh=="18.3333") {os=osL}
						if (lh=="17.4167") {os=osL}
					} else if (jsZoom == 120) {
						if (lh=="20") {os=osW}
						if (lh=="19.1667") {os=osL}
						if (lh=="19") {os=osTBL}
						if (lh=="18.3333") {os=osW}
						if (lh=="17.5") {os=osL}
					} else if (jsZoom == 133) {
						if (lh=="19.5") {os=osW}
						if (lh=="18.9") {os=osTBL}
						if (lh=="18") {os=osL}
						if (lh=="18.75") {os=osW}
					} else if (jsZoom == 90) {
						if (lh=="20.1") {os=osW}
						if (lh=="18.9833") {os=osWL}
						if (lh=="18.7667") {os=osTBL}
						if (lh=="16.75") {os=osL}
					} else if (jsZoom == 150) {
						if (lh=="20") {os=osW}
						if (lh=="18.6667") {os=osWL}
						if (lh=="17.3333") {os=osL}
					} else if (jsZoom == 170) {
						if (lh=="19.25") {os=osW}
						if (lh=="18.9") {os=osTBL}
						if (lh=="18.6667") {os=osW}
						if (lh=="18.0833") {os=osL}
						if (lh=="17.5") {os=osL}
					} else if (jsZoom == 80) {
						if (lh=="20") {os=osW}
						if (lh=="19.5") {os=osTBL}
						if (lh=="18.75") {os=osWL}
					} else if (jsZoom > 170) {
						os=sBig
					} else if (jsZoom < 80) {
						os=sSmall
					}
				}
				// MAC
				if (os == "") {
				/*unique: .0167 .05 .0833 .1833 .35 .4333 .6833 .8333 .85
				not unique: .7667 .6667 (but unique at those zoom values)
				hackernews: .5167 (can't repro) */
					let lhDec = (lh +"").split(".")[1]
					if (lhDec=="0167" | lhDec=="05" | lhDec=="0833" | lhDec=="1833" | lhDec=="35" | lhDec=="4333" | lhDec=="6833"
						| lhDec=="8333" | lhDec=="85" | lhDec=="7667" | lhDec=="6667" | lhDec=="5167") {os=osM}
				}
				if (os == sBig || os == sSmall) { //do nothing
				} else if (os !== "") {
					if (isTNR && fontProp) {
						os += " [known metric]"
					}
				} else if (os == "") {
					os = osL +" [logical guess]"
				}
			}
			// output
			if (method == "none") {
				if (fontProp) {
					dom.fdLH.innerHTML = sb +"[clientrect blocked"+ (isTNR ? strFont : " | document fonts disabled") +"]"+ sc 
				} else {
					dom.fdLH.innerHTML = sb +"[clientrect + font properties blocked]"+ sc
				}
			} else {
				dom.fdLH.innerHTML = lh +"px"+ (isOS == "android" ? "" : " "+ sbZoom + os)
			}
			log_perf("css line height [fd]",t0)
		}

		// recalc zoom/viewport
		if (runtype == "resize") {
			// we calling this from get_screen_metrics's runtype = resize
			Promise.all([
				vw = get_viewport("fd")
			]).then(function(){
				if (logExtra) {console.log(performance.now(), "C START.:", runtype, ": lineheight, scrollbar")}
				run_scrollbar()
				run_lineheight()
				return resolve("scrollbars:"+ dScrollbar +", "+ eScrollbar)
			})
		} else {
			Promise.all([
				get_zoom("fd")
			]).then(function(){
				if (jsZoom == undefined) {console.error("jsZoom is undefined")}
				Promise.all([
					vw = get_viewport("fd")
				]).then(function(){
					if (logExtra) {console.log(performance.now(), "C START.:", runtype, ": lineheight, scrollbar")}
					run_scrollbar()
					run_lineheight()
					return resolve("scrollbars:"+ dScrollbar +", "+ eScrollbar)
				})
			})
		}
	})
}

function get_math() {
	return new Promise(resolve => {
		let t0 = performance.now()
		// 1= ecma1, 6= ecma6, c= combined
		let m1hash = "",
			m6hash = "",
			mchash = "",
			m1 = "", // short codes
			m6 = "",
			mc = "",
			fdMath1 = "", // strings for browser/os
			fdMath6 = "",
			strNew = zNEW + (runS ? zSIM : ""),
			block1 = false,
			block6 = false

		function get_hashes(runtype) {
			return new Promise(resolve => {
				let h1 = "", h6 = "", r = ""
				// 1st
				let list = ['1e251','1e140','1e12','1e130','1e272','1e0','1e284','1e75'],
					res = []
				for (let i=0; i < list.length; i++) {
					try {
						r = Math.cos(list[i])
					} catch(e) {
						r = zB0
						block1 = true
					}
					res.push(r)
				}
				h1 = res.join("-")
				// 6th
				let x, y
				x = 0.5
				try {
					r = Math.log((1 + x) / (1 - x)) / 2 // atanh(0.5)
				} catch(e) {
					r = zB0
					block6 = true
				}
				h6 = r
				x=1
				try {
					r = Math.exp(x) - 1 // expm1(1)
				} catch(e) {
					r = zB0
					block6 = true
				}
				h6 += "-"+ r
				x = 1
				try {
					y = Math.exp(x); r = (y - 1 / y) / 2 // sinh(1)
				} catch(e) {
					r = zB0
					block6 = true
				}
				h6 += "-"+ r
				// hashes
				m1hash = sha1(h1)
				m6hash = sha1(h6)
				mchash = sha1(h1 +"-"+ h6)
				// sim
				if (runS) {
					//m1hash = sha1("a"), mchash = sha1("b") // emca1
					//m6hash = sha1("c"), mchash = sha1("d") // emca6
					m1hash = sha1("e"), m6hash = sha1("f"), mchash = sha1("g") // both
					//block1 = true
					//block6 = true
				}
				return resolve(m1hash +":"+ m6hash +":"+ mchash)
			})
		}
		function get_codes() {
			// known FF hashes (browser)
			if (m6hash == "7a73daaff1955eef2c88b1e56f8bfbf854d52486") {m6="1"}
			else if (m6hash == "0eb76fed1c087ebb8f80ce1c571b2f26a8724365") {m6="2"}
			else if (m6hash == "9251136865b8509cc22f8773503288d106104634") {m6="3"} // 68+ exmp1(1) 1380031
			// known FF hashes (os)
			if (m1hash == "46f7c2bbe55a2cd28252d059604f8c3bac316c23") {m1="A"}
			else if (m1hash == "8464b989070dcff22c136e4d0fe21d466b708ece") {m1="B"}
			else if (m1hash == "97eee44856b0d2339f7add0d22feb01bcc0a430e") {m1="C"}
			else if (m1hash == "96895e004b623552b9543dcdc030640d1b108816") {m1="D"}
			else if (m1hash == "06a01549b5841e0ac26c875b456a33f95b5c5c11") {m1="E"}
			else if (m1hash == "ae434b101452888b756da5916d81f68adeb2b6ae") {m1="F"}
			else if (m1hash == "19df0b54c852f35f011187087bd3a0dce12b4071") {m1="G"}
			else if (m1hash == "8ee641f01271d500e5c1d40e831232214c0bbbdc") {m1="H"}
		}
		function build_output() {
			if (block1) {m1=""} // for runS
			if (block6) {m6=""} // for runS

			// browser
			if (m6 == "1" | m6 == "3") {
				fdMath6=zFF
			} else if (m6 == "2") {
				fdMath6=zFF +" [32-bit]"
			}
			// os, refine browser
			if (m1 == "A" | m1 == "H") {
				// A or H: always 64bit WIN on 64bit FF
				fdMath1="Windows [64-bit]"
				fdMath6=zSDK64
			} else if (m1 == "C") {
				// C: always 32bit FF on WIN (32bit or 64bit)
				fdMath1="Windows"
				fdMath6=zSDK32
			} else if (m1 == "D") {
				// D: always Linux (Mint, Debian, OpenSUSE)
				fdMath1="Linux"
				if (m6 == "1") {
					// 60-67: 1D : always 64bit Linux -> 64bit FF
					fdMath1="Linux [64-bit]"
					fdMath6=zFF +" [64-bit]"
				}	else if (m6 == "3") {
					// 68+: 3D : can be FF64bit or TB32/64bit
					// values already set
				}	else if (m6 == "2") {
					// D2: always 32bit Linux (32bit FF set earlier)
					fdMath1="Linux [32-bit]"
				}
			} else if (m1 == "G") {
				// G: always Linux (Ubuntu)
				fdMath1="Linux"
			} else if (m1 == "E") {
				// E: always Mac: and thus 64bit FF
				fdMath1="Mac"
				fdMath6=zFF +" [64-bit]"
			} else if (m1 == "F") {
				// F: always Android
				fdMath1="Android"
			} else if (m1 == "B") {
				// B: always WIN, always mingw
				fdMath1="Windows"
				if (m6 == "1") {
					// ESR60: 1B: always 64bit TB: thus 64bit WIN
					fdMath6=zMingw64
					fdMath1="Windows [64-bit]"
				} else if (m6 == "2") {
					// ESR60: 2B: always 32bit TB (but WIN can be 32bit or 64bit)
					fdMath6=zMingw32
				} else if (m6 == "3") {
					// ESR68: 3B: 32bit TB on 32/64 WIN and 64bit TB on WIN64: now all the same
					fdMath6=zMingw
				}
			}
		}
		function output() {
			if (isFF) {
				//browser
				if (m1 == "") {
					if (block1) {
						// blocked
						m1hash = zB
						fdMath1 = zB
					} else if (m1hash.substring(0,6) == "random") {
						// random per execution
						fdMath1 = "random"
					} else {
						// new
						m1hash += strNew
						fdMath1 = m1hash // os
						dom.fdMathOS.setAttribute("class", "c mono")
					}
				} else {
					// known: add code
					m1hash += s3 +" ["+ m1 +"]"+ sc
				}
				// os
				if (m6 == "") {
					if (block6) {
						// blocked
						m6hash = zB
						fdMath6 = zB
					} else if (m6hash.substring(0,6) == "random") {
						// random per execution
						fdMath6 = "random"
					} else {
						m6hash += strNew
						fdMath6 = m6hash
						dom.fdMath.setAttribute("class", "c mono")
					}
				} else {
					// known: add code
					m6hash += s3 +" ["+ m6 +"]"+ sc
				}
				// combined
				if (m1 !== "" && m6 !== "") {
					// both known: add codes
					mc = s3 +"["+ m1 + m6 +"]"+ sc
					mchash += mc
					fdMath1 += mc
				} else {
					if (block1 || block6) {
					// blocked
						mchash = zB
					} else if (mchash.substring(0,6) == "random") {
						// random per execution
					} else {
						// new
						mchash += strNew
					}
				}
				// output
				dom.fdMathOS.innerHTML = fdMath1
				dom.fdMath.innerHTML = fdMath6
			}
			// output hashes
			dom.math1hash.innerHTML = m1hash
			dom.math6hash.innerHTML = m6hash
			dom.mathhash.innerHTML = mchash
			// perf
			log_perf("math [fd]",t0)
			// blockage
			if (block1 || block6) {mchash = zB0}
			// return
			if (mchash.substring(0,6) == "random") {mchash = "random"}
			return resolve("math:"+ mchash.substring(0,40))
		}

		Promise.all([
			get_hashes(0),
			get_hashes(1),
		]).then(function(res){
			// run0
			let run01 = res[0].split(":")[0],
				run06 = res[0].split(":")[1],
				run0c = res[0].split(":")[2]
			// run1
			let run11 = res[1].split(":")[0],
				run16 = res[1].split(":")[1],
				run1c = res[1].split(":")[2]
			// compare runs
			if (run0c !== run1c) {
				// lies
				if (gRun) {gLiesKnown.push("fd:math")}
				let sColor = s3
				// combined
				mchash = "random "+ sColor +" [1] "+ sc + run0c.substring(0,22) +".."
					+ sColor +" [2] "+ sc + run1c.substring(0,22) +".."
				// math1
				if (run01 !== run11) {
					m1hash = "random "+ sColor +" [1] "+ sc + run01.substring(0,22) +".."
						+ sColor +" [2] "+ sc + run11.substring(0,22) +".."
				}
				// math6
				if (run06 !== run16) {
					m6hash = "random "+ sColor +" [1] "+ sc + run06.substring(0,22) +".."
						+ sColor +" [2] "+ sc + run16.substring(0,22) +".."
				}
			}
			if (isFF) {
				get_codes()
				build_output()
				output()
			} else {
				dom.math1hash.innerHTML = m1hash
				dom.math6hash.innerHTML = m6hash
				dom.mathhash.innerHTML = mchash
				if (mchash.substring(0,6) == "random") {mchash = "random"}
				dom.fdMath.innerHTML = mchash
				return resolve("math:"+ mchash)
			}
		})
	})
}

function get_mm_metrics(runtype) {
	let t0 = performance.now(),
		count = 0
	// perf
	function perf() {
		if (count == 4) {
			if (runtype == "resize") {
				if (logResize) {log_perf("mm various [resize]",t0,"ignore")}
			} else {
				log_perf("mm various [screen]",t0)
			}
		}
	}
	// output
	function runTest(callback){
		// screen
		Promise.all([
			callback("device-width", "max-device-width", "px", 512, 0.01),
			callback("device-height", "max-device-height", "px", 512, 0.01)
		]).then(function(device){
			dom.ScrMM.innerHTML = device.join(" x ")
			count++; perf()
		}).catch(function(err){
			dom.ScrMM.innerHTML = err
			count++; perf()
		})
		// inner
		Promise.all([
			callback("width", "max-width", "px", 512, 0.01),
			callback("height", "max-height", "px", 512, 0.01)
		]).then(function(inner){
			dom.WndInMM.innerHTML = inner.join(" x ")
			count++; perf()
		}).catch(function(err){
			dom.WndInMM.innerHTML = err
			count++; perf()
		})
		// moz
		if (isFF) {
			callback("-moz-device-pixel-ratio", "max--moz-device-pixel-ratio", "", 2, 0.0000001
			).then(function(moz){
				dom.mmDPRm.innerHTML = moz += (moz == 1 ? rfp_green : rfp_red)
				count++; perf()
			}).catch(function(err){
				dom.mmDPRm.innerHTML = err
				count++; perf()
			})
		} else {
			dom.mmDPRm = zNS
			count++; perf()
		}
		// webkit
		if (!isFF || isVer > 62) {
			callback("-webkit-device-pixel-ratio", "-webkit-max-device-pixel-ratio", "", 2, 0.0000001
			).then(function(web){
				dom.mmDPRw.innerHTML = web
				count++; perf()
			}).catch(function(err){
				dom.mmDPRw.innerHTML = err
				count++; perf()
			})
		} else {
			dom.mmDPRw = zNS
			count++; perf()
		}
	}
	function searchValue(tester, maxValue, precision){
		let minValue = 0
		let ceiling = Math.pow(2, 32)
		function stepUp(){
			if (maxValue > ceiling){
				return Promise.reject("unable to find upper bound")
			}
			return tester(maxValue).then(function(testResult){
				if (testResult === searchValue.isEqual){
					return maxValue
				}
				else if (testResult === searchValue.isBigger){
					minValue = maxValue
					maxValue *= 2
					return stepUp()
				}
				else {
					return false
				}
			})
		}
		function binarySearch(){
			if (maxValue - minValue < precision){
				return tester(minValue).then(function(testResult){
					if (testResult.isEqual){
						return minValue
					}
					else {
						return tester(maxValue).then(function(testResult){
							if (testResult.isEqual){
								return maxValue
							}
							else {
								return Promise.reject(
									"between "+ minValue +" and "+ maxValue
								)
							}
						})
					}
				})
			}
			else {
				let pivot = (minValue + maxValue) / 2
				return tester(pivot).then(function(testResult){
					if (testResult === searchValue.isEqual){
						return pivot
					}
					else if (testResult === searchValue.isBigger){
						minValue = pivot
						return binarySearch()
					}
					else {
						maxValue = pivot
						return binarySearch()
					}
				})
			}
		}
		return stepUp().then(function(stepUpResult){
			if (stepUpResult){
				return stepUpResult
			}
			else {
				return binarySearch()
			}
		})
	}
	searchValue.isSmaller = -1
	searchValue.isEqual = 0
	searchValue.isBigger = 1

	runTest(function(prefix, maxPrefix, suffix, maxValue, precision){
		return searchValue(function(valueToTest){
			try {
				if (window.matchMedia("("+ prefix +": "+ valueToTest + suffix+")").matches){
					return Promise.resolve(searchValue.isEqual)
				}
				else if (window.matchMedia("("+ maxPrefix +": "+ valueToTest + suffix+")").matches){
					return Promise.resolve(searchValue.isSmaller)
				}
				else {
					return Promise.resolve(searchValue.isBigger)
				}
			} catch(e) {
				let reason = zB0
				return Promise.reject(reason)
			}
		}, maxValue, precision)
	})
}

function get_orientation(runtype) {
	let t0 = performance.now()
	// mm
	let l="landscape", p="portrait", q="(orientation: ", s="square",
		a="aspect-ratio", o1=zNS, o2=zNS, o3=zNS, o4=zNS
	try {
		o1 = (function() {
			if (window.matchMedia("(-moz-device-orientation:"+ l +")").matches) return l
			if (window.matchMedia("(-moz-device-orientation:"+ p +")").matches) return p
		})()
	} catch(e) {o1 = zB0}
	try {
		o2 = (function() {
			if (window.matchMedia(q + p +")").matches) return p
			if (window.matchMedia(q + l +")").matches) return l
		})()
	} catch(e) {o3 = zB0}
	try {
		o3 = (function() {
			if (window.matchMedia("("+ a +":1/1)").matches) return s
			if (window.matchMedia("(min-"+ a +":10000/9999)").matches) return l
			if (window.matchMedia("(max-"+ a +":9999/10000)").matches) return p
		})()
	} catch(e) {o3 = zB0}
	try {
		o4 = (function() {
			if (window.matchMedia("(device-"+ a +":1/1)").matches) return s
			if (window.matchMedia("(min-device-"+ a +":10000/9999)").matches) return l
			if (window.matchMedia("(max-device-"+ a +":9999/10000)").matches) return p
		})()
	} catch(e) {o4 = zB0}
	dom.mmO.innerHTML = o1 +" | "+ o2 +" | "+ o3 +" | "+ o4
	// screen*
	try {
		dom.ScrOrient.innerHTML = (function() {
			let r = screen.orientation.type +" | "+ screen.mozOrientation +" | "+ screen.orientation.angle
			r = r.replace(/landscape-secondary/g, "upside down")
			r = r.replace(/-primary/g, "")
			r = r.replace(/-secondary/g, "")
			r += (r == "landscape | landscape | 0" ? rfp_green : rfp_red)
			return r
		})()
	} catch(e) {
		dom.ScrOrient.innerHTML = zB0
	}
	// display-mode
	try {
		dom.mmDM = (function() {
			q="(display-mode:"
			if (window.matchMedia(q +"fullscreen)").matches) return "fullscreen"
			if (window.matchMedia(q +"browser)").matches) return "browser"
			if (window.matchMedia(q +"minimal-ui)").matches) return "minimal-ui"
			if (window.matchMedia(q + p +")").matches) return p
		})()
	} catch(e) {
		dom.mmDM.innerHTML = zB0
	}
	// perf
	if (runtype == "resize") {
		if (logResize) {log_perf("orientation [resize]",t0,"ignore")}
	} else {
		log_perf("orientation [screen]",t0)
	}
}

function get_pbmode() {
	let t0 = performance.now()
	function output(r) {
		dom.IsPBMode = r
		log_perf("pbmode [screen]",t0)
	}
	if (isVer < 83) {
		// FF83+: 1638396: dom.indexedDB.privateBrowsing.enabled
		try {
			let db = indexedDB.open("PB")
			db.onerror = function() {output("true")}
			db.onsuccess = function() {output("false")}
		} catch(e) {
			output("unknown: "+ e.name)
		}
	} else {
		output("unknown")
	}
}

function get_resources() {
	return new Promise(resolve => {
		let t0 = performance.now(),
			browser = "",
			branding = "",
			channel = "",
			result = "",
			wFF = "",
			hFF = "",
			extra = "",
			nob = "[no branding detected]",
			el = dom.branding

		// extensions can block resources://
			// FF ~5ms, TB ~20ms
		setTimeout(() => resolve("resources:blocked"), 100)

		// output
		function output(setGlobalVars) {
			// set global vars
			if (setGlobalVars) {
				isChannel = channel
				isResource = browser +" "+ result
				isResourceMetric = "resources:"+ browser +" "+ wFF +"x"+ hFF +" "+ extra
			}
			dom.fdResource.innerHTML = isResource
			log_perf("resources [fd]",t0)
			return resolve(isResourceMetric)
		}
		// FF
		function build_FF(wFF, hFF) {
			browser = zFF
			if (wFF == 336 && hFF == 48) {
				//70+
				branding = "Browser"
				channel = "Release/Beta"
			} else if (wFF == 336 && hFF == 64) {
				//70+
				branding = "Browser"
				channel = "Developer/Nightly"
			} else if (wFF == 300 && hFF == 38) {
				//60-69, ESR60/68
				branding = "Quantum"
				channel = "Release/Beta"
			} else if (wFF == 132 && hFF == 62) {
				//60-69
				channel = "Developer Edition"
			} else if (wFF == 270 && hFF == 48) {
				//60-69
				channel = "Nightly"
			}
			if (channel !== "") {
				result = branding +" - "+ channel +" ["+ wFF +" x "+ hFF +"]"
			} else if (hFF > 0) {
				//new
				result = "["+ wFF +" x "+ hFF +"]"+ zNEW + (runS ? zSIM : "")
			} else {
				//none: red=desktop orange=android
				if (isVer > 59) {
					result = (isOS == "android" ? s3 : sb) + nob + sc
				}
				dom.fdBrandingCss = "none"
			}
		}
		// TB
		function build_TB(wFF, hFF) {
			browser = zTB
			channel = ""
			if (wFF == 270 && hFF == 48) {
				//alpha: 8.5a7+ [60.5.0esr]
				channel = "alpha"
				result = s3 +"["+ channel +"]"+ sc +" ["+ wFF +" x "+ hFF +"]"
				log_debug("debugTB","css branding = ".padStart(19) +"270 x 48 px = alpha")
			} else if (wFF == 336 && hFF == 48) {
				if (isVer > 77) {
					//78+ therefore release
					channel = "release"
					result = s3 +"["+ channel +"]"+ sc +" ["+ wFF +" x "+ hFF +"]"
				} else {
					//idk
					result = " ["+ wFF +" x "+ hFF +"]"
				}
			} else if (wFF == 300 && hFF == 38) {
				if (isVer > 67 && isVer < 78) {
					//68+ therefore release
					channel = "release"
					result = s3 +"["+ channel +"]"+ sc +" ["+ wFF +" x "+ hFF +"]"
				} else {
					//idk
					result = " ["+ wFF +" x "+ hFF +"]"
				}
			} else if (hFF > 0) {
				//new
				result = "["+ wFF +" x "+ hFF +"]"+ zNEW + (runS ? zSIM : "")
			} else {
				//none: red=desktop orange=android
				if (isVer > 59) {
					result = (isOS == "android" ? s3 : sb) + nob + sc
				}
				dom.fdBrandingCss = "none"
			}
		}
		function run() {
			// load about:logo
			let imgA = new Image()
			imgA.src = "about:logo"
			imgA.style.visibility = "hidden"
			document.body.appendChild(imgA)
			imgA.addEventListener("load", function() {
				if (imgA.width == 300) {
					// desktop = 300x236: -> icon64
					dom.fdResourceCss.style.backgroundImage="url('chrome://branding/content/icon64.png')"
				} else {
					// android = 258x99: -> favicon64 (which gives us tor's icon)
					dom.fdResourceCss.style.backgroundImage="url('chrome://branding/content/favicon64.png')"
				}
				if (imgA.width > 0) {
					// brand: get after logo loaded by js: allows time for
					// the two branding images (set by html) to be loaded
					wFF = el.width
					hFF = el.height
					el = dom.torbranding
					let wTB = el.width, hTB = el.height

					if (runS) {
						wFF = 110, hFF = 50 // new to both TB and FF
						//wFF = 336, hFF = 48 // new TB but not new FF
						// to simulate missing, change html img src
					}

					// FF
					build_FF(wFF, hFF)
					// TB: we made sure isTB was set earlier
					let isTB2 = false
					if (wTB > 0) {
						isTB2 = true
						log_debug("debugTB","resource:// = ".padStart(19) + "tor-watermark.png")
						log_perf("[yes] tb watermark [fd]",t0)
					} else {
						log_perf("[no] tb watermark [fd]",t0)
					}
					extra = (isTB ? "y" : "n") + (isTB2 ? "y" : "n")
					if (isTB) {
						build_TB(wFF, hFF)
						if (isOS !== "android" && wTB < 1) {
							result += sb +"[missing tor-watermark.png]"+ sc
						}
					}
					// NOW we output
					output(true)
				}
			})
			document.body.removeChild(imgA)
		}
		// immutable: only run once
		if (isResource == "") {
			run()
		} else {
			output(false)
		}
	})
}

function get_screen_metrics(runtype) {
	let res = []
	//trap resize event
	if (runtype !== "load" && runtype !== "screen") {runtype = "resize"}

	// this triggers zoom/viewport when not page load
		// but ignore viewport on resize: which is called by scrollbar
		// nothing else needs to wait here for any results
	if (runtype !== "load") {
		Promise.all([
			get_zoom(runtype)
		]).then(function(){
			if (runtype !== "resize") {
				get_viewport(runtype)
			}
		})
	}
	// resize to auto-update lineheight/scrollbar
	if (runtype == "resize") {
		get_line_scrollbar("resize")
	}

	// MEASURE: ToDo: catch errors
	let w1 = screen.width, h1 = screen.height,
		w2 = screen.availWidth, h2 = screen.availHeight,
		w3 = window.outerWidth, h3 = window.outerHeight,
		w = window.innerWidth, h = window.innerHeight,
		p1 = screen.left, p2 = screen.top,
		p3 = screen.availLeft, p4 = screen.availTop,
		p5 = window.screenX, p6 = window.screenY,
		p7 = window.mozInnerScreenX, p8 = window.mozInnerScreenY
	let mInner = w +" x "+ h,
		mOuter = w3 +" x "+ h3,
		mScreen = w1 +" x "+ h1,
		mAvailable = w2 +" x "+ h2
	// DISPLAY
	dom.ScrRes = mScreen +" ("+ p1 +","+ p2 +")"
	dom.ScrAvail = mAvailable +" ("+ p3 +","+ p4 +")"
	dom.WndOut = mOuter +" ("+ p5 +","+ p6 +")"
	dom.WndIn.innerHTML = mInner +" ("+ p7 +","+ p8 +")"
	// NOTATE
	let items = [p1,p2,p3,p4,p5,p6,p7,p8], isXY = true
	for (let i=0; i < items.length; i++) {if (items[i] != 0) {isXY = false}}
	if (isFF) {
		// sizes
		let m1 = true, m2 = true, r = "", c = "#ff4f4f"
		if (mScreen !== mAvailable) {m1 = false}
		else if (mAvailable !== mOuter) {m1 = false}
		else if (mOuter !== mInner) {m1 = false}
		r = (m1 ? sg : sb) +"[sizes match x4]"+ sc
		// x/y
		r += " +"+ (isXY ? sg : sb) +"[0,0 x4]"+ sc
		dom.match.innerHTML = r
		// color
		if (m1 && m2) {c = "#8cdc8c"}
		items = document.getElementsByClassName("group")
		for (let i=0; i < items.length; i++) {items[i].style.color = c}
		// inner: LB/NW
		if (isOS !== "android" && jsZoom == 100) {
			dom.WndIn.innerHTML = mInner +" ("+ p7 +","+ p8 +")"+ return_lb_nw(w,h)
		}
	}
	// FS
	let isFS = false
	try {isFS = window.fullScreen; dom.fsState = isFS} catch(e) {dom.fsState.innerHTML = zB0}
	// THE REST
	get_orientation(runtype) // not stable
	get_mm_metrics(runtype) // not reliable (extension APIs)

	// METRICS
	if (runtype !== "resize") {
		// allow 1px less due to min-
		// inner
		let innerW = getElementProp("#D","content",":before"),
			innerH = getElementProp("#D","content",":after")
		if (innerW !== "x" && innerH !== "x") {
			innerW = innerW * 1
			innerH = innerH.slice(3) * 1
			if (innerW == w-1) {innerW = w}
			if (innerH == h-1) {innerH = h}
			if (innerW !== w || innerH !== h) {
				if (gRun) {
					gLiesKnown.push("screen:inner window")
					gLiesBypassed.push("screen:inner window:"+ innerW +" x "+ innerH)
				}
			}
		}
		// screen
		let screenW = getElementProp("#S","content",":before"),
			screenH = getElementProp("#S","content",":after"),
			screenBypass = false,
			pushBypass = false
		if (screenW !== "x" && screenH !== "x") {
			screenBypass = true
			screenW = screenW * 1
			screenH = screenH.slice(3) * 1
			if (screenW == w1-1) {screenW = w1}
			if (screenH == h1-1) {screenH = h1}
			if (screenW !== w1 && screenH !== h1) {
				pushBypass = true
				w1 = screenW
				h1 = screenH
				mScreen = w1 +" x "+ h1
				if (gRun) {gLiesKnown.push("screen:screen")}
			}
		}
		// ToDo: harden if !screenBypass: due to zoom/system-scaling and limited ranges

		// zoom resistance: recalc screen at 100%
		if (isFF && Number.isInteger(jsZoom) && isOS !== "android") {
			if (jsZoom !== 100) {
				if (Number(dpr2) !== NaN && Number(dpr2) > 0) {
					let w100 = 2 * Math.round((w1 * dpr2)/2) 
					let h100 = 2 * Math.round((h1 * dpr2)/2)
					// rounding fixups
					let common = [360,600,640,720,768,800,810,834,864,900,1024,1050,1080,1112,1152,1200,1280,1360,1366,1440,1536,1600,1680,1920,2048,2560,]
					for (let i=0; i < common.length; i++) {
						let real = common[i]
						if (w100 >= real-2 && w100 <= real+2) {w1 = real}
						if (h100 >= real-2 && h100 <= real+2) {h1 = real}
					}
					mScreen = w1 +" x "+ h1
				}
			}
		}

		// stable metrics
			// FF: mozInnerScreenY is not zero at FS
			// no inner/outer/screen/availble comparisons due to FS affects and screenBypassed/recalc
			// eliminate orientation: return screen at widest x highest
		res.push("coordinates_zero:"+ isXY)
		if (w1 < h1) {mScreen = h1 +" x "+ w1} else {mScreen = w1 +" x "+ h1}
		if (screenBypass) {
			// bypass
			res.push("screen:"+ mScreen)
			if (gRun && pushBypass) {gLiesBypassed.push("screen:screen:"+ mScreen)}
		} else {
			// prototype lies
			let scrLies = false
			if (protoLies.includes("Screen.width")) {scrLies = true}
			if (protoLies.includes("Screen.height")) {scrLies = true}
			res.push("screen:"+ (scrLies ? "fake" : mScreen))
		}
		// dpr
		if (isOS == "android") {
			if (Number(dpr2) !== NaN && Number(dpr2) > 0) {
				res.push("devicePixeRatio:"+ dpr2.toFixed(6))
			}
		}
		return(res)
	}
}

function get_ua_doc() {
	return new Promise(resolve => {
		let res = [],
			str = "",
			go = false,
			lies = 0,
			pre = "",
			spoof = false,
			match = false
		// FF78+ only
		if (isFF && isVer > 77) {go = true}

		// arrows
		function addArrow(property, state) {
			let title = property
			if (state) {
				lies++
				title += sb +"&#9654"+ sc
			}
			document.getElementById("l"+ property).innerHTML = title
		}

		function output(property, str) {
			if (str == "") {str = "empty string"}
			if (str == "undefined") {str = "undefined string"}
			if (str == undefined) {str = "undefined value"}
			res.push(property +":"+ str)
			document.getElementById("n"+ property).innerHTML = str
			return str
		}

		function get_property(property, good) {
			// clear arrow
			addArrow(property, false)
			// treat blocked as lies
			str = ""
			try {str = navigator[property]} catch(e) {str = zB0}
			// simulate lies
			if (go && runS) {
				if (property == "appCodeName") {str = "MoZilla"} // case
				if (property == "appName") {str = " Netscape"} // leading space
				if (property == "product") {str = "Gecko "} // trailing space
				if (property == "buildID") {str = ""} // empty string: unexpected
				if (property == "productSub") {str = undefined} // undefined
				if (property == "vendor") {str = " "} // single space
				if (property == "vendorSub") {str = "undefined"} // undefined string
				// these four are OS dependent
				if (property == "appVersion") {str = "5.0 (windows)"}
				if (property == "platform") {str = "win32"}
				if (property == "oscpu") {str = "Windows NT 10.1; win64; x64"}
				if (property == "userAgent") {str = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"}
			}
			str = output(property, str)
			if (good !== undefined) {
				// BS
				let arrow = ""
				if (go == true && str !== good) {arrow = sb +"&#9654"+ sc; lies++}
				document.getElementById("l"+ property).innerHTML = property + arrow
			} else {
				return str
			}
		}

		function check_basics(str, property) {
			// clear arrow
			addArrow(property, false)
			// for dynamic returns
			let bs = false
			if (str == "undefined value") {bs = true
			} else if (str == "undefined string") {bs = true
			} else if (str == "blocked") {bs = true
			} else if (str == "empty string") {bs = true
			} else if (str.substring(0, 1) == " ") {bs = true
			} else if (str.substring(str.length-1, str.length) == " ") {bs = true
			} else if (str.indexOf("  ") !== -1) {bs = true
			} else if (property == "userAgent") {
				// STUFF
				let v = isVer +".0",
					v2 = (isVer + 1) +".0",
					sub = "20100101",
					sub2 = sub,
					debug = []
				// SAVE TME
				if (str.indexOf(".0) Gecko/") == -1) {bs = true
				} else if (str.indexOf(" Firefox/") == -1) {bs = true
				} else {
					let strA = str.toLowerCase()
					if (strA.indexOf("webkit") !== -1) {bs = true}
				}

				if (isOS !== "" && bs == false) {
					// isVerPlus: allow the next version 
					let controlA = "", controlB = "", testA = str, testB = str

					if (isRFP) {
					// RFP ON 
						v = "78.0"
						if (isVer > 90) {v = "91.0"}
						if (isVer > 103) {v = "104.0"}
						v2 = v
						// only allow v2 as next RFP number IF...
						if (isVerPlus) {
							if (isVer == 90) {v2 = "91.0"}
							if (isVer == 103) {v2 = "104.0"}
						}
						/* resistfingerprinting/test/browser/browser_navigator.js#106 */
						if (isOS == "windows") {
							controlA = "Windows NT 10.0; Win64; x64; rv:"+ v +") Gecko/20100101"
							controlB = "Windows NT 10.0; Win64; x64; rv:"+ v2 +") Gecko/20100101"
						} else if (isOS == "linux") {
							controlA = "X11; Linux x86_64; rv:"+ v +") Gecko/20100101"
							controlB = "X11; Linux x86_64; rv:"+ v2 +") Gecko/20100101"
						} else if (isOS == "mac") {
							controlA = "Macintosh; Intel Mac OS X 10.15 rv:"+ v +") Gecko/20100101"
							controlB = "Macintosh; Intel Mac OS X 10.15 rv:"+ v2 +") Gecko/20100101"
						} else if (isOS == "android") {
							if (isVer < 88) {
								controlA = "Android 9; Mobile; rv:"+ v +") Gecko/20100101"
								controlB = "Android 9; Mobile; rv:"+ v2 +") Gecko/20100101"
							} else {
								controlA = "Android 9; Mobile; rv:"+ v +") Gecko/"+ v
								controlB = "Android 9; Mobile; rv:"+ v2 +") Gecko/"+ v
							}
						}
						controlA = "Mozilla/5.0 ("+ controlA +" Firefox/"+ v
						controlB = "Mozilla/5.0 ("+ controlB +" Firefox/"+ v2
					} else {
					// RFP OFF
						// desktop: ends in "; rv:XX.0) Gecko/20100101 Firefox/XX.0"
						// android: ends in "; rv:XX.0) Gecko/XX.0 Firefox/XX.0"
						if (!isVerPlus) {v2 = v}
						if (isOS == "android") {sub = v; sub2 = v2}
						controlA = "; rv:"+ v +") Gecko/"+ sub +" Firefox/"+ v
						controlB = "; rv:"+ v2 +") Gecko/"+ sub2 +" Firefox/"+ v2
						testA = str.substring(str.length - controlA.length)
						testB = str.substring(str.length - controlB.length)
					}
					// as long as one matches
					if ((testA == controlA) + (testB == controlB) == 0) {bs = true}
				}
			}
			return bs
		}

		// EASY (static values)
		get_property("appCodeName", "Mozilla")
		get_property("appName", "Netscape")
		get_property("product", "Gecko")
		get_property("buildID", "20181001000000")
		get_property("productSub", "20100101")
		get_property("vendor", "empty string")
		get_property("vendorSub", "empty string")

		// MORE COMPLEX: dynamic, per OS
		// appVersion
		str = get_property("appVersion")
		if (go) {
			spoof = check_basics(str, "appVersion")
			if (!spoof) {
				// dig deeper
				if (isOS == "windows") {spoof = (str !== "5.0 (Windows)")}
				if (isOS == "mac") {spoof = (str !== "5.0 (Macintosh)")}
				if (isOS == "linux") {spoof = (str !== "5.0 (X11)")}
				if (isOS == "android") {
					// tighten this up to be more specific?
					if (str.substring(0,13) == "5.0 (Android ") {match = true}
					spoof = !match
				}
			}
			if (spoof) {addArrow("appVersion", true)}
		}
		// platform
		// ToDo: specific linux distro strings?
		// ToDo: android: `Linux ${OSArch}` <-- any others
		str = get_property("platform")
		if (go) {
			spoof = check_basics(str, "platform")
			if (!spoof) {
				// dig deeper
				match = false
				if (isOS == "windows") {spoof = (str !== "Win32")}
				if (isOS == "mac") {spoof = (str !== "MacIntel")}
				if (isOS == "linux") {
					if (str == "Linux i686") {match = true}
					else if (str == "Linux i686 on x86_64") {match = true}
					else if (str == "Linux x86_64") {match = true}
					spoof = !match
				}
				if (isOS == "android") {
					if (str.substring(0,10) == "Linux armv") {match = true}
					if (str.substring(0,11) == "Linux aarch") {match = true}
					spoof = !match
				}
			}
			if (spoof) {addArrow("platform", true)}
		}

		// oscpu
		str = get_property("oscpu")
		if (go) {
			spoof = check_basics(str, "oscpu")
			if (!spoof) {
				// dig deeper
				if (isOS == "windows") {
					pre = "Windows NT "
					// app64 + win64
					if (str == pre +"10.0; Win64; x64") {match = true}
					else if (str == pre +"6.3; Win64; x64") {match = true}
					else if (str == pre +"6.1; Win64; x64") {match = true}
					// app32 + win64
					else if (str == pre +"10.0; WOW64") {match = true}
					else if (str == pre +"6.3; WOW64") {match = true}
					else if (str == pre +"6.1; WOW64") {match = true}
					// app32 + win32
					else if (str == pre +"10.0") {match = true}
					else if (str == pre +"6.3") {match = true}
					else if (str == pre +"6.1") {match = true}
					spoof = !match
				}
				if (isOS == "linux") {
					// ToDo: specific linux distro strings?
					pre = "Linux "
					if (str == pre +"i686") {match = true}
					else if (str == pre +"i686 on x86_64") {match = true}
					else if (str == pre +"x86_64") {match = true}
					spoof = !match
				}
				if (isOS == "mac") {
					if (str.substring(0,14) == "Intel Mac OS X") {match = true}
					spoof = !match
				}
				if (isOS == "android") {
					pre = "Linux "
					if (str.substring(0,10) == pre +"armv") {match = true}
					if (str.substring(0,11) == pre +"aarch") {match = true}
					spoof = !match
				}
			}
			if (spoof) {addArrow("oscpu", true)}
		}

		// userAgent
		str = get_property("userAgent")
		if (go) {
			spoof = check_basics(str, "userAgent")
			if (!spoof) {
				// DONE: RFP check, endstring, version
				// ToDo: dig deeper
					// - os
					// - the syntax/formula doesn't match
			}
			if (spoof) {addArrow("userAgent", true)}
		}

		// hash
		res.sort()
		// reset
		uaBS = false
		// show
		if (lies) {
			lies += " pinocchio"+ (lies > 1 ? "s": "")
			dom.nualies.innerHTML = sb + lies + sc +" [based on feature detection]" + (runS ? zSIM : "")
			dom.togualies.style.display = "table-row"
			uaBS = true
			// lies
			if (gRun) {
				gLiesKnown.push("useragent:navigator properties")
			}
		} else {
			// hide
			dom.togualies.style.display = "none"
		}
		// return
		return resolve(res)
	})
}

function get_ua_workers() {
	// control
	let list = ['userAgent','appCodeName','appName','product','appVersion','platform'],
		res = [],
		r = ""
	for (let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = zB0}
		if (r == "") {r = "empty string"
		} else if (r == "undefined") {r = "undefined string"
		} else if (r == undefined) {r = "undefined value"
		}
		res.push(list[i] +":"+ r)
	}
	res.sort()
	let control = sha1(res.join())

	function update(data) {
		// compare shared worker to control: output diffs
		for (let i=0; i < res.length; i++) {
			if (res[i] !== data[i]) {
				let parts = data[i].split(":")
				let target = document.getElementById("n"+ parts[0])
				// don't output it a second time if iframes got it
				if ((target.innerHTML).indexOf("<br>") == -1) {
					target.innerHTML += "<br>"+ sb.trim() + parts.slice(1).join(":") + sc
				}
			}
		}
	}

	function exit(s) {
		dom.uaWorker0.innerHTML = s //web
		dom.uaWorker1.innerHTML = s //shared
		//dom.uaWorker3.innerHTML = s //nested
		//dom.uaWorker4.innerHTML = s //blob
	}
	// workers
	if (isFile) {
		// file
		exit(zNA)
	} else if (typeof(Worker) == "undefined") {
		// none
		exit(zF)
	} else {
		// web
		let el0 = dom.uaWorker0, test0 = ""
		try {
			let workernav = new Worker("js/worker_ua.js")
			el0.innerHTML = zF
			workernav.addEventListener("message", function(e) {
				//console.debug("ua worker", e.data)
				test0 = sha1((e.data).join())
				el0.innerHTML = test0 + (test0 == control ? match_green : match_red)
				workernav.terminate
			}, false)
			workernav.postMessage(isFF)
		} catch(e) {
			el0.innerHTML = zF
		}
		// shared
		let el1 = dom.uaWorker1, test1 = ""
		try {
			let sharednav = new SharedWorker("js/workershared_ua.js")
			el1.innerHTML = zF
			sharednav.port.addEventListener("message", function(e) {
				//console.debug("ua shared", e.data)
				test1 = sha1((e.data).join())
				el1.innerHTML = test1 + (test1 == control ? match_green : match_red)
				sharednav.port.close()
				if (test1 !== control) {
					update(e.data)
				}
			}, false)
			sharednav.port.start()
			sharednav.port.postMessage(isFF)
		} catch(e) {
			el1.innerHTML = zF
		}
	}

	// service
	let el2 = dom.uaWorker2, test2 = ""
	if (isFile) {
		el2.innerHTML = zNA
	} else if (isSecure) {
		if (check_navKey("serviceWorker")) {
			// assume failure
			el2.innerHTML = zF +" [A: assumed]"
			try {
				// register
				navigator.serviceWorker.register("js/workerservice_ua.js").then(function(swr) {
					let sw
					if (swr.installing) {sw = swr.installing}
					else if (swr.waiting) {sw = swr.waiting}
					else if (swr.active) {sw = swr.active}
					sw.addEventListener("statechange", function(e) {
						if (e.target.state == "activated") {
							sw.postMessage(isFF)
						}
					})
					if (sw) {
						// listen
						let channel = new BroadcastChannel("sw-ua")
						channel.addEventListener("message", event => {
							//console.debug("ua service", event.data.msg)
							test2 = sha1((event.data.msg).join())
							el2.innerHTML = test2 + (test2 == control ? match_green : match_red)
							// unregister & close
							swr.unregister().then(function(boolean) {})
							channel.close()
						})
					} else {
						el2.innerHTML = zF +" [B: not swr.installing]"
					}
				},
				function(e) {
					el2.innerHTML = zF +" [C: not registering]: " + e.message
				})
			} catch(e) {
				el2.innerHTML = zB0
			}
		} else {
			el2.innerHTML = zNA
		}
	}
}

function get_viewport(runtype) {
	if (logExtra) {console.log(performance.now(), "B START.:", runtype, ": viewport")}
	let e=document.createElement("div")
	e.style.cssText="position:fixed;top:0;left:0;bottom:0;right:0;"
	document.documentElement.insertBefore(e,document.documentElement.firstChild)
	let vw=e.offsetWidth,
		vh=e.offsetHeight
	document.documentElement.removeChild(e)
	dom.Viewport = vw +" x "+ vh
	// get viewport height once on first load
	// this s/be with toolbar visible (not FS)
	if (avh == "") {avh = vh}
	if (logExtra) {console.log(performance.now(), "B FINISH:", runtype, ": viewport")}
	// return
	if (runtype == "fd") {
		return vw // scrollbar
	} else {
		return vh // android tests
	}
}

function get_widgets() {
	return new Promise(resolve => {
		let list = ['button','checkbox','color','combobox','datetime-local','radio','text'],
			font = "",
			font0 = "",
			fontdiff = false,
			size = "",
			size0 = "",
			sizediff = false,
			output = "",
			os = "",
			hash = [],
			combined = [],
			t0 = performance.now()

		// loop elements
		for (let i=0; i < 9; i++) {
			let el = document.getElementById("widget"+ i)
			try {
				font = getComputedStyle(el).getPropertyValue("font-family")
			} catch(e) {font = "unknown"}
			try {
				size = getComputedStyle(el).getPropertyValue("font-size")
			} catch(e) {size = "unknown"}
			if (runS) {
				if (i == 1) {font = "-apple-system"; size="11px"} // font + size
				//if (i == 4) {font = "-apple-system"} // font
				//if (i == 2) {size="13px"} // size
			}
			output = font +", "+ size
			// 1-7: compare to 1
			if (i < 7) {
				combined.push(list[i].padStart(14) +": "+ output)
				if (i == 0) {
					size0 = size; font0 = font
				} else {
					if (size !== size0) {sizediff = true}
					if (font !== font0) {fontdiff = true}
				}
			}
			// all
			document.getElementById("wid"+ i).innerHTML = output
			hash.push(output)
		}
		// overall hash
		let whash = sha1(hash.join())
		// output
		if (fontdiff + sizediff > 0) {
			// combined
			dom.widfirst.innerHTML = "various"
			dom.wid0.innerHTML = combined.join("<br>")
		}
		if (isFF) {
			if (sizediff) {size0 = "mixed sizes"}
			if (fontdiff) {
				font0 = "mixed fonts";
				os = whash + zNEW
				dom.fdWidget.setAttribute("class", "c mono")
			} else {
					if (font0.slice(0,12) == "MS Shell Dlg") {os="Windows"}
					else if (font0 == "Roboto") {os="Android"}
					else if (font0 == "-apple-system") {os="Mac"}
					else if (font0 == "unknown") {os = ""}
					else {os="Linux"}
			}
			os = (os == "" ? zB : os) +" ["+ font0 +", "+ size0 +"]"
			dom.fdWidget.innerHTML = os + (runS ? zSIM : "")			
		} else {
			dom.fdWidget = whash
		}
		dom.wid0.style.color = zshow
		dom.widgetH = whash + (runS ? zSIM : "")
		// perf & resolve
		log_perf("widgets [fd]",t0)
		return resolve("widgets:"+ whash)
	})
}

function get_zoom(runtype) {
	return new Promise(resolve => {
		let t0 = performance.now(),
			zoomAssume = false
		dpr2 = ""

		// dPR
		let dpr = window.devicePixelRatio || 1;
		let dprStr = dpr + (dpr == 1 ? rfp_green : rfp_red)
		// add dPR2: 477157
		if (isFF) {
			let el = dom.dpr2
			try {
				dpr2 = getComputedStyle(el).borderTopWidth
				dpr2 = dpr2.slice(0, -2) // trim "px"
				if (dpr2 > 0) {
					dpr2 = (1/dpr2)
					dprStr += " | "+ dpr2 + (dpr2 == 1 ? rfp_green : rfp_red)
				}
			} catch(e) {
				// ToDo: we can't use dpr2 later on
			}
		}
		dom.dpr.innerHTML = dprStr

		// ToDo: when zooming, getting divDPI is much slower
		// divDPI relies on css: if css is blocked (dpi_y = 0) this causes issues
		let t1 = performance.now()

		let aDPI = return_mm_dpi("dpi"),
			bDPI = return_mm_dpi("dppx"),
			cDPI = return_mm_dpi("dpcm")

		if (aDPI !== zB0) {varDPI = aDPI}
		dom.mmDPI.innerHTML = aDPI +" | "+ bDPI +" | "+ cDPI
		dpi_x = Math.round(dom.divDPI.offsetWidth * dpr)
		dpi_y = Math.round(dom.divDPI.offsetHeight * dpr)
		dom.jsDPI = dpi_x

		if (runtype == "resize") {
			if (logResize) {log_perf("dpi [part of zoom]",t1,"ignore")}
		} else {
			log_perf("dpi [part of zoom]",t1,"ignore")
		}

		// zoom: choose method
		if (dpr !== 1 || dpi_y == 0) {
			// use devicePixelRatio if we know RFP is off
			// or if css is blocked (dpi_y = 0, dpi_x = body width)
			jsZoom = Math.round(dpr*100).toString()
		} else {
			if (varDPI == undefined) {
				// e.g. matchMedia is blocked
				if (isFF) {
					if (dpr2 == "") {
						// e.g. getComputedStyle is blocked
						jsZoom = 100
						zoomAssume = true
					} else {
						// fallback to dpr2
						jsZoom = Math.round(dpr2*100).toString()
					}
				} else {
					jsZoom = Math.round((dpi_x/dpi_x)*100).toString()
				}
			} else {
				// otherwise it could be spoofed
				jsZoom = Math.round((varDPI/dpi_x)*100).toString()
			}
		}
		jsZoom = jsZoom * 1

		// ToDo: zoom: css=blocked (dpi_y == 0) AND RFP=true: detect this state
		// Can't guarantee zoom: notate output for zoom, css line height, scollbar width

		// fixup some numbers
		if (jsZoom !== 100) {
			if (jsZoom == 79) {jsZoom=80}
			if (jsZoom == 92) {jsZoom=90}
			if (jsZoom == 109) {jsZoom=110}
			if (jsZoom == 111) {jsZoom=110}
			if (jsZoom == 121) {jsZoom=120}
			if (jsZoom == 131) {jsZoom=133}
			if (jsZoom == 167) {jsZoom=170}
			if (jsZoom == 171) {jsZoom=170}
			if (jsZoom == 172) {jsZoom=170}
			if (jsZoom == 241) {jsZoom=240}
			if (jsZoom == 250) {jsZoom=240}
		}
		dom.jsZoom.innerHTML = jsZoom + (zoomAssume ? s1 +"[assumed]"+ sc :"")

		if (runtype == "resize") {
			if (logResize) {log_perf("zoom [resize]",t0,"ignore")}
		} else {
			log_perf("zoom ["+ runtype +"]",t0)
		}
		if (logExtra) {console.log(performance.now(), "A FINISH:", runtype, ": zoom, dpi, devicePixelRatio")}
		return resolve(jsZoom)
	})
}

/* OS SPECIFIC */

function run_os() {
	if (isOS == "android") {
		showhide("table-row","OS1","")
		dom.droidWin = firstW +" x "+ firstH +" [inner] [toolbar visible]"
		// listen for toolbar
		get_android_tbh()
		// rerun screen: android can be slow
		if (window.innerWidth == firstW) {
			setTimeout(function(){get_screen_metrics()}, 100)
		}
	} else {
		// desktop
		window.addEventListener("resize", get_screen_metrics)
	}
}

function get_android_tbh() {
	// toolbar height if user has chosen to "hide the toolbar when scrolling down a page"
	// avh global var s/be with toolbar visible: hence use new value > avh
	// We only need one diff since the viewport size "snaps" to the new value
	window.addEventListener('scroll', toolbarScroll)
	function toolbarScroll() {
		// ignore fullscreen
		if (window.fullScreen == false) {
			// delay: allow time for toolbar change
			setTimeout(function() {
				let vh_new = get_viewport()
				if (vh_new > avh) {
					dom.tbh = (vh_new - avh)
				}
			}, 800)
		}
	}
}

function get_android_kbh() {
	if (isOS == "android") {
		// wait for keyboard
		setTimeout(function() {
			// use viewport: doesn't change on zoom
			let vh_new = get_viewport()
			// Compare to avh (captured on first load: s/be with toolbar visible)
			// Since the event exits FS, we can rely on avh
			// use absolute value: event also triggered losing focus
			dom.kbh = Math.abs(avh - vh_new)
			// ToDo: keyboard height: use setInterval
			// keyboard can be slow to open + it "slides" (stepped changes)
			// instead check x times + return the max abs diff
		}, 1000)
	}
}

/* USER TESTS */

function goFS() {
	if (isFF) {
		if (get_fullscreen() == zE) {
			dom.fsLeak = ""
			let ih1 = window.innerHeight,
				delay = 1, n = 1,
				sizeS = [], sizeE = []
			function exitFS() {
				if (isVer > 63) {document.exitFullscreen()} else {document.mozCancelFullScreen()}
				document.removeEventListener("mozfullscreenchange", getFS)
			}
			function getFS() {
				if (document.mozFullScreen) {
					setTimeout(function() {
						let iw = document.mozFullScreenElement.clientWidth,
							ih = document.mozFullScreenElement.clientHeight
						dom.fsLeak = screen.width +" x "+ screen.height +" [screen] "+ iw +" x "+ ih +" [mozFullScreenElement client]"
						exitFS()
						// TB desktop warning panel
						if (isTB && isOS !== "android") {
							setTimeout(function(){
							let ih2 = window.innerHeight
								let panel = ih1-ih2
								if (panel !== 0) {
									dom.fsLeak.innerHTML = dom.fsLeak.textContent +"<br>"+ panel +"px [warning panel height]"
								}
							}, 600)
						}
					}, delay)
				}
			}
			if (document.mozFullScreenEnabled) {
				let element = dom.imageFS
				if (isOS == "android") {delay = 1000}
				element.mozRequestFullScreen()
				document.addEventListener("mozfullscreenchange", getFS)
			}
		}
	}
}

function goNW() {
	dom.newWinLeak.innerHTML = "&nbsp"
	let sizesi = [], // inner history
		sizeso = [], // outer history
		n = 1, // setInterval counter
		newWinLeak = ""

	// open
	let newWin = window.open("tests/newwin.html","","width=9000,height=9000")
	let iw = newWin.innerWidth,
		ih = newWin.innerHeight,
		ow = newWin.outerWidth,
		oh = newWin.outerHeight
	sizesi.push(iw +" x "+ ih)
	sizeso.push(ow +" x "+ oh)
	// default output
	newWinLeak = iw +" x "+ ih +" [inner] "+ ow +" x "+ oh +" [outer]"

	// DESKTOP
	if (isOS !== "android") {
		function check_newwin() {
			let diffsi = [], // 4 inner sizes
				diffso = [], // 4 outer sizes
				changesi = 0,
				changeso = 0
			// detect changes
			let prev = sizesi[0]
			let strInner = s1 +"inner: "+ sc + iw +" x "+ ih
			for (let k=0; k < sizesi.length; k++) {
				if (sizesi[k] !== prev ) {
					changesi++;	strInner += s1 +" &#9654 <b>["+ k +"]</b> "+ sc + sizesi[k]
				}
				prev = sizesi[k]
			}
			prev = sizeso[0]
			let strOuter = s1 +"outer: "+ sc + ow +" x "+ oh
			for (let k=0; k < sizeso.length; k++) {
				if (sizeso[k] !== prev ) {
					changeso++;	strOuter += s1 +" &#9654 <b>["+ k +"]</b> "+ sc + sizeso[k]
				}
				prev = sizeso[k]
			}
			// one or two lines
			if (changesi > 0 || changeso > 0) {
				newWinLeak = strInner +"<br>"+ strOuter
			}
			// output
			dom.newWinLeak.innerHTML = newWinLeak
		}
		function build_newwin() {
			// check n times as "fast" as we can/dare
			if (n == 150) {
				clearInterval(checking)
				check_newwin()
			} else {
				// grab metrics
				try {
					sizesi.push(newWin.innerWidth +" x "+ newWin.innerHeight)
					sizeso.push(newWin.outerWidth +" x "+ newWin.outerHeight)
				} catch(e) {
					clearInterval(checking)
					// if not "permission denied", eventually we always get
					// NS_ERROR_UNEXPECTED which we can ignore. Always output
					check_newwin()
				}
			}
			n++
		}
		let checking = setInterval(build_newwin, 3)
	}
	// ANDROID
	if (isOS == "android") {
		if (ih > firstH) {
			// firstH s/be with the toolbar
			newWinLeak = iw +" x "+ ih +" [inner] [toolbar hidden] "+ ow +" x "+ oh +" [outer]"
		} else if (ih == firstH) {
			// should be the same
			newWinLeak = iw +" x "+ ih +" [inner] [toolbar visible] "+ ow +" x "+ oh +" [outer]"
		}
		dom.newWinLeak.innerHTML = newWinLeak
	}
}

function goNW_UA() {
	// control
	let list = ['userAgent','appCodeName','appName','product','appVersion',
		'oscpu','platform','buildID','productSub','vendor','vendorSub'],
		res = [],
		control = [],
		r = ""
	for (let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = zB0}
		if (r == "") {r = "empty string"
		} else if (r == "undefined") {r = "undefined string"
		} else if (r == undefined) {r = "undefined value"
		}
		control.push(list[i] +":"+ r) // no spaces
	}
	control.sort()

	dom.uaHashOpen.innerHTML = "&nbsp"
	// open, get results, close
	let newWin = window.open()
	let newNavigator = newWin.navigator
	for(let i=0; i < list.length; i++) {
		try {r = newNavigator[list[i]]} catch(e) {r = zB0}
		if (r == "") {r = "empty string"}
		if (r == "undefined") {r = "undefined string"}
		if (r == undefined) {r = "undefined value"}
		res.push(list[i] +":"+ r)
	}
	newWin.close()

	// simulate
	if (runS) {
		res = [
			"appCodeName:Mozilllllla",
			"appName:Moonscape",
			"appVersion:5.0 (toaster)",
			"buildID:20181001000000000",
			"oscpu:Windows XP 500.1; Win64; x64",
			"platform:Windows128",
			"product:Lizard",
			"productSub:30100101",
			"userAgent:Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/25.0",
			"vendor:empty string", // nochange
			"vendorSub:empty string:with a colon",
		]
	}

	// hash
	res.sort()
	let hash = sha1(res.join())
	let controlhash = sha1(control.join())
	// output
	if (hash == controlhash) {
		hash += match_green
	} else {
		hash += match_red
		// output diffs if not already exposed (has line break)
		for (let i=0; i < res.length; i++) {
			let parts = res[i].split(":")
			let target = document.getElementById("n"+ parts[0])
			let str = target.innerHTML
			let output = parts.slice(1).join(":")
			if (str.indexOf("<br>") == -1 && str !== output) {
				target.innerHTML += "<br>"+ sb.trim() + output + sc
			}
		}
	}
	dom.uaHashOpen.innerHTML = hash
}

/* OUTPUT */

function outputScreen(runtype) {
	// this function is only called on page load or reruns
	// so no need to worry about resizing events
	let t0 = performance.now(),
		section = []

	get_pbmode() // not FP stable

	Promise.all([
		get_fullscreen("section"),
		get_color(),
		get_screen_metrics(runtype), // calls the rest, also used on resize
	]).then(function(results){
		results.forEach(function(currentResult) {
			if (Array.isArray(currentResult)) {
				currentResult.forEach(function(item) {
					section.push(item)
				})
			} else {
				section.push(currentResult)
			}
		})
		log_section("screen", t0, section)
	})
}

function outputUA() {

	dom.uaWorkers = "summary not coded yet: see details"

	let t0 = performance.now(),
		docArray = [],
		docHash = "",
		iframeArray = [],
		useIframe = false

	function output(outputArray) {
		let section = outputArray
		if (check_navKey("brave")) {
			for (let i=0; i < section.length; i++) {
				section[i] = section[i].replace(/\s+/g," ").trim()
			}
		}
		log_section("ua", t0, section)
	}

	function get_workers() {
		// temp
		dom.uaWorker3.innerHTML = "not coded yet" //nested
		dom.uaWorker4.innerHTML = "not coded yet" //blob

		// we cannot rely on iframes
			// some of the metrics may be covered, but not all
		if (uaBS || useIframe) {
			output(["ua:lies"])
		} else {
			output(docArray)
		}

		// ToDo: promisify workers and add to section logic
			// i.e workerleak (excl. web worker) > uaBS/prototype Lies > document
		get_ua_workers()

	}

	function get_iframes() {
		// iframes
		Promise.all([
			getDynamicIframeWindow({
				context: window, contentWindow: true, violateSameOriginPolicy: false, test: "ua"
			}), // DocumentRoot contentWindow
			getDynamicIframeWindow({
				context: window, contentWindow: true, source: "?", violateSameOriginPolicy: false, test: "ua"
			}), // with URL contentWindow
			getDynamicIframeWindow({
				context: window, violateSameOriginPolicy: false, test: "ua"
			}), // DocumentRoot
			getDynamicIframeWindow({
				context: window, source: "?", violateSameOriginPolicy: false, test: "ua"
			}), // with URL
			getDynamicIframeWindow({
				context: window, test: "ua"
			}), // window access
			getDynamicIframeWindow({
				context: frames, test: "ua"
			}), // iframe access
			getDynamicIframeWindow({
				context: window, nestIframeInContainerDiv: true, test: "ua"
			}), // nested
		]).then(function(results){
			for(let i=0; i < 7; i++) {
				// output
				let iframeHash = sha1(results[i].join())
				iframeArray = results[i]
				if (iframeHash !== docHash) {
					// assumption: any iframe leaks should be the same: just get one
					if (useIframe == false) {
						useIframe = true
						// red sumary
						dom.uaIframes.innerHTML = iframeHash + match_red
					}
				}
				iframeHash += (iframeHash == docHash ? match_green : match_red)
				document.getElementById("uaIframe"+ i).innerHTML = iframeHash
			}
			// green sumary
			if (useIframe == false) {dom.uaIframes.innerHTML = docHash + match_green}
			// show iframe diffs
			if (useIframe) {
				for (let i=0; i < docArray.length; i++) {
					if (docArray[i] !== iframeArray[i]) {
						let parts = iframeArray[i].split(":")
						let target = document.getElementById("n"+ parts[0])
						target.innerHTML += "<br>"+ sb.trim() + parts.slice(1).join(":") + sc
					}
				}
			}
			get_workers()
		})
	}

	function get_pLies() {
		if (protoLies.includes("Navigator.userAgent")) {uaBS = true
		} else if (protoLies.includes("Navigator.appVersion")) {uaBS = true
		} else if (protoLies.includes("Navigator.platform")) {uaBS = true
		} else if (protoLies.includes("Navigator.oscpu")) {uaBS = true
		} else if (!isFF) {
			// FF: these are always caught by feature detection
				// so ignore in FF because they could be correct
			if (protoLies.includes("Navigator.productSub")) {uaBS = true
			} else if (protoLies.includes("Navigator.buildID")) {uaBS = true
			} else if (protoLies.includes("Navigator.vendor")) {uaBS = true
			} else if (protoLies.includes("Navigator.vendorSub")) {uaBS = true
			} else if (protoLies.includes("Navigator.appCodeName")) {uaBS = true
			} else if (protoLies.includes("Navigator.appName")) {uaBS = true
			} else if (protoLies.includes("Navigator.product")) {uaBS = true
			}
		}
	}

	Promise.all([
		get_ua_doc(), // sets uaBS
	]).then(function(item){
		docArray = item[0]
		docHash = sha1(docArray.join())
		dom.uaDoc = docHash
		if (uaBS == false) {get_pLies()} // sets uaBS
		get_iframes()
	})
}

function outputFD(runtype) {
	let t0 = performance.now(),
		section = []
	// FF only
	if (isFF) {
		let r = isVer + (isVerPlus ? "+" : "")
		if (isVer == 59) {r = "59 or lower"}
		dom.fdVersion.innerHTML = r
		section.push("version:"+ r)
		get_isChrome()
		Promise.all([
			get_errors(),
			get_widgets(),
			get_resources(),
			get_line_scrollbar("fd"), // promises zoom & viewport first
			get_math(), // must come after widget
		]).then(function(results){
			results.forEach(function(currentResult) {
				section.push(currentResult)
			})
			log_section("feature", t0, section)
		})
		// not used in hash
		get_collation()

	} else {
		// don't notate
		tb_green = ""
		tb_red = ""
		tb_standard = ""
		tb_safer = ""
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
		default_tb_green = ""
		default_tb_red = ""
		default_ff_green = ""
		default_ff_red = ""
		// hide
		let items = document.getElementsByClassName("group")
		for (let i=0; i < items.length; i++) {items[i].style.display = "none"}
		// run some for the info factor and so we output a section hash
		Promise.all([
			get_errors(),
			get_widgets(),
			get_math()
		]).then(function(results){
			results.forEach(function(currentResult) {
				section.push(currentResult)
			})
			dom.fdBrandingCss = zNA
			dom.fdResourceCss = zNA
			dom.fdCollation = zNA
			dom.fdResource = zNA
			dom.fdChrome = zNA
			dom.fdVersion = zNA
			dom.fdMathOS = zNA
			dom.fdLH = zNA
			dom.fdScrollV = zNA
			dom.fdScrollE = zNA
			log_section("feature", t0, section)
			// non-FF needs these: in FF the scrollbar function calls them
			if (runtype == "load") {
				Promise.all([
					get_zoom("load")
				]).then(function(){
					get_viewport("load")
				})
			}
		})
	}
}

function outputStart() {
	// cosmetics
		// not-coded
	let items = document.getElementsByClassName("faint")
	for (let i=0; i < items.length; i++) {items[i].textContent = "not coded yet"}
		// isFile
	items = document.getElementsByClassName("isFile")
	for (let i=0; i < items.length; i++) {items[i].textContent = note_file}
		// section hash to come
	items = document.getElementsByClassName("hashtocome")
	for (let i=0; i < items.length; i++) {items[i].textContent = "section-hash-will-be-coming-just-hold-on"}

	outputFD("load") // run FD first: sets isVer
	setTimeout(function() {outputScreen("load")}, 1)
	setTimeout(function() {outputUA()}, 1)
	setTimeout(function() {run_os()}, 1) // per os tweaks
}

countJS("screen")
