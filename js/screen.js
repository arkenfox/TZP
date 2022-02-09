'use strict';

var jsZoom, jsZoomOriginal, zoomAssume
var varDPR, varDPI, dpi_x, dpi_y
var uaBS = false
let isOS64math = ""
let nxtESR = 102

// sims
let intDEP = 0, lstDEP = ["24",zB0,24, 41,1,7.2,undefined,zU,"null",{}]
let intCLR = 0, lstCLR = [ "8",zB0, 8, 61,1,7.2,undefined,zU,"null",{}]
let intWFS = 0, lstWFS = ["true","false",zB0,0,1,-1,true,false]
let intUAI = 0

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

function return_mm_dpi(type, denominator) {
	let r = ""
	try {
		r = (function() {
			let i = 1
			for (1; i < 3001; i++) {
				let n = i/denominator
				if (matchMedia("(max-resolution:"+ n + type +")").matches === true) {return n}
			}
			if (gRun) {
				gMethods.push("screen:matchmedia_"+ type +": > "+ (i-1)/denominator)
			}
			return zB0 
		})()
	} catch(e) {
		log_error("screen: matchmedia_"+ type, e.name, e.message)
		return zB0
	}
	return r
}

function get_canonical() {
	// runs post FP
	try {
		let sName = "feature_canonical_locales_notglobal"
		sDetail[sName] = []
		let list = ["bh","hye","no","tl","tw"], res = []
		if (runSN) (list.push("en"))
		list.sort()
		list.forEach(function(i) {
			res.push(i +": "+ Intl.getCanonicalLocales(i))
		})
		sDetail[sName] = res
		let note, color = "3"
		let hash = sha1(res.join(), "feature canonical")
		if (isFF) {
			if (hash == "f52b504f78de0569f1dd6ae8830fac589a7a83e2") {note = "FF91+"
			} else if (hash == "620140a916991fed2fc5b3f3b69731745793bbd3") {note = "FF70-90"
			} else if (hash == "992692585f2bb1b00689181a905eb237a71c7823") {note = "FF69 or lower"
			} else {note = "NEW"; color = "bad"
			}
		}
		let btn = buildButton(color, sName, note)
		dom.fdCanonical.innerHTML = hash + btn + (runSN ? zSIM : "")
	} catch(e) {
		dom.fdCanonical = (e.name === undefined ? zErr : trim_error(e.name, e.message))
	}
}

function get_chrome(log = false) {
	// runs post FP
	let t0; if (canPerf) {t0 = performance.now()}
	let os = ""
	// display
	function output(r) {
		if (r.toLowerCase() !== isOS && r !== zNA) {r += sb +"[!= widget]"+ sc + (runSN ? zSIM : "")}
		dom.fdChrome.innerHTML = r
		isChrome = r
		if (log) {log_perf("chrome [not in FP]",t0)}
	}
	// bail
	if (isChrome !== "") {output(isChrome); return}
	if (isVer < 60) {output(zNA); return}
	// run
	dom.fdChrome.innerHTML = zB0
	function run2() {
		// android/linux
		let img = new Image()
		img.src = "chrome://branding/content/icon64.png"
		img.style.visibility = "hidden"
		document.body.appendChild(img)
		img.onload = function() {output("Linux")}
		img.onerror = function() {output("Android")}
		document.body.removeChild(img)
	}
	function check(r) {
		if (r == "") {run2()} else {output(r)}
	}
	function run() {
		if (isFFLegacy) {dom.fdChrome = zNA; return}
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
				if (x == 2) {check(os)}
			}
			css.onerror = function() {
				x++
				if (x == 2) {check(os)}
			}
			document.head.removeChild(css)
		})
	}
	run()
}

function get_color() {
	let res = [], r1

	// pixelDepth: 418986: FF41+ RFP
	function get_pixeldepth(name) {
		let isLies = false
		try {
			if (runSE) {
				runDEP = false; abc = def
			} else if (runSL) {
				runDEP = false; r1 = "24"
			} else if (runDEP) {
				r1 = lstDEP[intDEP]
				console.log("SIM #"+ intDEP, name, r1)
			} else {
				r1 = screen.pixelDepth
			}
		} catch(e) {
			r1 = zB0; log_error("screen: pixelDepth", e.name, e.message)
		}
		r1 = cleanFn(r1)
		// lies
		if (r1 !== zB0) {
			if (typeof r1 !== "number") {isLies = true
			} else if (!Number.isInteger(r1)) {isLies = true
			} else if (r1 < 2) {isLies = true
			} else if (proxyLies.includes("Screen.pixelDepth")) {isLies = true}
		}
		let v1 = r1
		// record lies but not blocks
		if (isLies && r1 !== zB0) {
			v1 = zLIE; r1 = soL + r1 + scC
			if (gRun) {gKnown.push(name)}
		}
		if (runDEP) {console.log(" - returned", v1)}
		dom.pixelDepth.innerHTML = r1
		res.push("pixelDepth:"+ v1)
	}

	// colorDepth: 418986: FF41+ RFP
	function get_colordepth(name) {
		let isLies = false, r2
		try {
			if (runSE) {
				runDEP = false; abc = def
			} else if (runSL) {
				runDEP = false; r2 = "24"
			} else if (runDEP) {
				r2 = lstDEP[intDEP]
				console.log("SIM #"+ intDEP, name, r2)
			} else {
				r2 = screen.colorDepth
			}
		} catch(e) {
			r2 = zB0; log_error("screen: colorDepth", e.name, e.message)
		}
		r2 = cleanFn(r2)
		// lies
		if (r2 !== zB0) {
			if (typeof r2 !== "number") {isLies = true
			} else if (!Number.isInteger(r2)) {isLies = true
			} else if (r2 < 2) {isLies = true
			} else if (proxyLies.includes("Screen.colorDepth")) {isLies = true}
		}
		let v2 = r2
		// record
		if (isLies && r2 !== zB0) {
			v2 = zLIE; r2 = soL + r2 + scC
			if (gRun) {gKnown.push(name)}
		}
		if (runDEP) {console.log(" - returned", v2)}
		dom.colorDepth.innerHTML = r2 + (r1 == 24 && r2 == 24 ? rfp_green : rfp_red)
		res.push("colorDepth:"+ v2)
	}

	// mm color: 418986: FF41+ RFP
	function get_mm_color(name) {
		let isLies = false, r3, isBypass = false
		let v3 = getElementProp("#cssC","content",":after")

		try {
			if (runSE) {
				runCLR = false; abc = def
			} else if (runSL) {
				runCLR = false; r3 = "8"
			} else if (runCLR) {
				r3 = lstCLR[intCLR]
				console.log("SIM #"+ intCLR, name, r3)
			} else {
				r3 = (function() {for (let i=0; i < 1000; i++) {if (matchMedia("(color:"+ i +")").matches === true) {return i}}
					return i
				})()
			}
		} catch(e) {
			r3 = zB0; log_error("screen: matchmedia_color", e.name, e.message)
		}
		r3 = cleanFn(r3)

		// bypass
		if (r3 !== v3 && v3 !== "x") {isBypass = true; isLies = true}
		// lies
		if (r3 !== zB0) {
			if (typeof r3 !== "number") {isLies = true
			} else if (!Number.isInteger(r3)) {isLies = true
			} else if (r3 < 2) {isLies = true}
		}
		if (!isLies) {v3 = r3 == zB0 ? zB0 : r3} // don't record blocked if no lies

		// record
		if (isLies) {
			// zBO can't get in here unless we can bypass
			if (!isBypass) {v3 = zLIE}
			r3 = (isBypass ? soB : soL) + r3 + scC
			if (gRun) {gKnown.push(name); if (isBypass) {gBypassed.push(name +":"+ v3)}}
		}
		if (runCLR) {console.log(" - returned", v3)}
		dom.mmC.innerHTML = r3 + (r3 === 8 ? rfp_green : rfp_red)
		res.push("matchmedia_color:"+ v3)
	}

	// run
	get_pixeldepth("screen:pixelDepth")
	get_colordepth("screen:colorDepth")
	get_mm_color("screen:matchmedia_color")
	if (runCLR) {intCLR++; intCLR = intCLR % lstCLR.length}
	if (runDEP) {intDEP++; intDEP = intDEP % lstDEP.length}
	// return
	return(res)
}

function get_errors() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let res = [], note = ""
		let sName = "feature_error_messages"
		sDetail[sName] = []

		let tests = [
			"BigInt(2.5)", // changes FF68 + FF75
			"alert('A)",
			"const foo;foo.bar",
			"null.bar", // changes with error_fix
			"(1).toString(1000)",
			"var x = new Array(-1)",
			"[...undefined].length", // changes with error_fix
			"self.reportError('93')", // < FF93
			"let a = new Set([1,2,3]); let b = new Set([2,3,4]); let c = new Set(...a, ...b);", // changes FF83
			"var x = @", // changes FF84
			"let d=Object.getOwnPropertyDescriptor(RegExp.prototype,'global'); let t=d.get.call('/a')", // changes FF85
			"for (async of [])", // changes FF86
			'function invalid () { "use strict" \n ' + '"\\8"' + '}', // FF88+
			"let t = ({ 1n: 1 })", // < FF74, changes FF68
			"let a = 1_00_;", // changes FF70
		]
		for (let i = 0; i < tests.length; i++) {
			try {
				newFn(tests[i])
			} catch(e) {
				let msg = e.message
				if (tests[i] == "alert('A)") {
					if (runSN) {msg += zSIM} else if (msg == "unterminated string literal") {note = "FF59 or lower"}
				}
				res.push(i +": "+ e.name +": "+ msg)
			}
		}
		sDetail[sName] = res
		let hash = sha1(res.join(), "feature errors")
		// notation: 74+: 1259822: error_message_fix: codes 1=false 2=true
		let tmp = hash.substring(0,8), color = "3"
		if (isFF) {
			let fix = " fixed", nofix = " no-fix"
			if (tmp == "3f0a2927") {note = "FF93+"+ nofix
			} else if (tmp == "fcb058e2") {note = "FF93+"+ fix
			} else if (tmp == "93d0c3af") {note = "FF88-92"+ nofix
			} else if (tmp == "b6902095") {note = "FF88-92"+ fix
			} else if (tmp == "25d05006") {note = "FF86-87"+ nofix
			} else if (tmp == "82d992d7") {note = "FF86-87"+ fix
			} else if (tmp == "5a0ce0c1") {note = "FF85"+ nofix
			} else if (tmp == "c7d70afd") {note = "FF85"+ fix
			} else if (tmp == "6c8ac52f") {note = "FF84"+ nofix
			} else if (tmp == "1ca49497") {note = "FF84"+ fix
			} else if (tmp == "df9b641d") {note = "FF83"+ nofix
			} else if (tmp == "e540e119") {note = "FF83"+ fix
			} else if (tmp == "137d5080") {note = "FF75-82"+ nofix
			} else if (tmp == "86ff3101") {note = "FF75-82"+ fix
			} else if (tmp == "54002b6f") {note = "FF74"+ nofix
			} else if (tmp == "04e27611") {note = "FF74"+ fix
			} else if (tmp == "f0a867a2") {note = "FF71-73"
			} else if (tmp == "94b69f86") {note = "FF70-71"
			} else if (tmp == "117ef2fc") {note = "FF68-69"
			} else if (tmp == "32d3793c") {note = "FF60-67"
			} else if (tmp == "b962f3fb") {note = "FF59"
			} else if (tmp == "422f0723") {note = "FF53-58"
			} else if (tmp == "d91dcb3c") {note = "FF52" // TZP does not run in FF51 or lower
			} else if (isFFLegacy) {note = "details"
			} else if (note == "FF59 or lower") { // do nothing
			} else {note = "NEW"; color = "bad"
			}
		}
		let btn = buildButton(color, sName, note)
		dom.fdError.innerHTML = hash + btn + (runSN ? zSIM : "")
		log_perf("errors [fd]",t0)
		return resolve("errors:"+ hash)
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
			sSmall = s3 +"...why are you so small?"+sc,
			wZoom

		// scrollbar
		function run_scrollbar() {
			jsZoom = jsZoom * 1
			let t0; if (canPerf) {t0 = performance.now()}
			// get width, remember for later
			let w = zB0
			try {
				let w = (window.innerWidth-vw)
			} catch(e) {}
			let pseudoW = getElementProp("#D","content",":before")
			if (pseudoW !== "x") {
				if (pseudoW * 1 == w-1) {pseudoW = w} // allow for min-
				w = pseudoW-vw
			}
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
					if (w==17) {os=osW}
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
			if (jsZoom !== 100) {
				sbZoom = " at "+ (isOS == "android" ? jsZoom.toFixed(5)+ " devicePixelRatio ": jsZoom +"% ")
			}
			dom.fdScrollV.innerHTML = w +"px "+ sbZoom + (isFork == "Waterfox Browser" ? "" : os)
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
			if (runtype == "fd") {log_perf("scrollbar [fd]",t0)}
		}

		// css lineheight
		function run_lineheight() {
			let t0; if (canPerf) {t0 = performance.now()}
			let method = "computedstyle",
				strFont = ""
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
					try {lh = (lh * 1).toString()} catch(e) {}
					method = "clientrect"
				} catch(err) {
					method = "none"
				}
			}

			// sim
			let widSim = 0
			if (widSim == 1) {
				// no clientrect
				method = "none"
			} else if (widSim == 2) {
				// no font property
				strFont = sb +"[font property is blocked]"+ sc
				fontProp = false
			} else if (widSim == 3) {
				// doc fonts blocked
				strFont = sb +"[document fonts are disabled]"+ sc
				isTNR = false
			} else if (widSim == 4) {
				// 1+2
				method = "none"
				strFont = sb +"[font property is blocked]"+ sc
				fontProp = false
			} else if (widSim == 5) {
				// 1+3
				method = "none"
				strFont = sb +"[document fonts are disabled]"+ sc
				isTNR = false
			}

			// build
			if (isOS == "android") {
				// ignore
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
			if (runtype == "fd") {log_perf("css line height [fd]",t0)}
		}

		// recalc zoom/viewport
		if (runtype == "resize") {
			// when calling this from get_screen_metrics's runtype = resize
			Promise.all([
				vw = get_viewport("fd")
			]).then(function(){
				if (logExtra && canPerf) {console.log(performance.now(), "C START.:", runtype, ": lineheight, scrollbar")}
				run_scrollbar()
				run_lineheight()
				return resolve("scrollbars:"+ dScrollbar +", "+ eScrollbar)
			})
		} else {
			Promise.all([
				get_zoom("fd")
			]).then(function(){
				if (jsZoom == undefined && gRun) {gCheck.push("fd:zoom is undefined")}
				Promise.all([
					vw = get_viewport("fd")
				]).then(function(){
					if (logExtra && canPerf) {console.log(performance.now(), "C START.:", runtype, ": lineheight, scrollbar")}
					run_scrollbar()
					run_lineheight()
					return resolve("scrollbars:"+ dScrollbar +", "+ eScrollbar)
				})
			})
		}
	})
}

function get_locales() {
	// runs post FP
	try {
		let res = []
		let sName = "feature_supported_locales_notglobal"
		sDetail[sName] = []
		let list = ["ba","co","cv","ia","ka","ki","ku","kok","lij","lo","mai","no","pa","qu","sa","sc","su","no","tl","tw","vo"]
		if (runSN) {list.push("en")}
		list.sort()
		res = Intl.PluralRules.supportedLocalesOf(list)
		sDetail[sName] = res
		let hash = sha1(res.join(), "feature supported locales"), note, color = "3"
		if (isFF) {
			if (hash == "d64182953a8450518c818dbe9dbf35bab8c9ca26") {note = "FF96+"
			} else if (hash == "c091f78618be5002b68e5937b305e0741ced633a") {note = "FF91-95"
			} else if (hash == "69a80c449f0a77f1ab419351c04ced065aa49589") {note = "FF78-90"
			} else if (hash == "88fd1391314005c3fe9b8dced0e2f328b06afbb3") {note = "FF70-77"
			} else if (hash == "f224735b922be026a0348d98c819239b6a330813") {note = "FF65-69"
			} else if (hash == "05135c437e798bbee97129b20c8d9676afe78484") {note = "FF64 or lower"
			} else {note = "NEW"; color = "bad"
			}
		}
		let btn = buildButton(color, sName, note)
		dom.fdLocales.innerHTML = hash + btn + (runSN ? zSIM : "")
	} catch(e) {
		let eMsg = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		if (eMsg == "TypeError: Intl.PluralRules is undefined" && isFFLegacy) {eMsg = zNS} // 57 or lower
		dom.fdLocales = eMsg
	}
}

function get_math() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		// 1= ecma1, 6= ecma6, c= combined
		let m1hash = "",
			m6hash = "",
			mchash = "",
			m1 = "", // short codes
			m6 = "",
			mc = "",
			fdMath1 = "", // browser/os strings
			fdMath6 = "",
			strNew = zNEW + (runSN ? zSIM : ""),
			block1 = false,
			block6 = false

		function get_hashes(runtype) {
			return new Promise(resolve => {
				// 1st
				let res1 = [], res6 = [], list = [1e251,1e140,1e12,1e130,1e272,-1,1e284,1e75]
				list.forEach(function(item) {try {res1.push(Math.cos(item))} catch(e) {res1.push("x"); block1 = true}})
				// 6th
				try {res6.push(Math.log((1.5) / (0.5)) / 2)} catch(e) {res6.push("x"); block6 = true} // atanh(0.5)
				try {res6.push(Math.E - 1)} catch(e) {res6.push("x"); block6 = true} // expm1(1)
				try {let y = Math.E; res6.push((y - 1 / y) / 2)} catch(e) {res6.push("x"); block6 = true} // sinh(1)
				// hashes
				m1hash = sha1(res1.join("-"), "feature math m1hash")
				m6hash = sha1(res6.join("-"), "feature math m6hash")
				mchash = sha1(res1.concat(res6), "feature math mchash")
				// sim
				if (runSN) {
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
			// known (browser)
			if (m6hash == "7a73daaff1955eef2c88b1e56f8bfbf854d52486") {m6="1"}
			else if (m6hash == "0eb76fed1c087ebb8f80ce1c571b2f26a8724365") {m6="2"}
			else if (m6hash == "9251136865b8509cc22f8773503288d106104634") {m6="3"} // 68+ exmp1(1) 1380031
			// known (os)
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
			if (block1) {m1=""} // for runSN
			if (block6) {m6=""} // for runSN
			// browser
			if (m6 == "1" | m6 == "3") {
				fdMath6=zFF
			} else if (m6 == "2") {
				fdMath6=zFF +" [32bit]"
			}
			// os, refine browser
			if (m1 == "A" | m1 == "H") {
				// A or H: always 64bit WIN on 64bit FF
				fdMath1="Windows [64bit]"
				fdMath6=zSDK64
				isOS64math = 64
			} else if (m1 == "C") {
				// C: always 32bit FF on WIN (32bit or 64bit)
				fdMath1="Windows"
				fdMath6=zSDK32
			} else if (m1 == "D") {
				// D: always Linux (Mint, Debian, OpenSUSE)
				fdMath1="Linux"
				if (m6 == "1") {
					// 60-67: 1D : always 64bit Linux -> 64bit FF
					fdMath1="Linux [64bit]"
					fdMath6=zFF +" [64bit]"
					isOS64math = 64
				}	else if (m6 == "3") {
					// 68+: 3D : can be FF64bit or TB32/64bit
					// values already set
				}	else if (m6 == "2") {
					// D2: always 32bit Linux (32bit FF set earlier)
					fdMath1="Linux [32bit]"
					isOS64math = 32
				}
			} else if (m1 == "G") {
				// G: always Linux (Ubuntu)
				fdMath1="Linux"
			} else if (m1 == "E") {
				// E: always Mac: and thus 64bit FF
				fdMath1="Mac"
				fdMath6=zFF +" [64bit]"
				isOS64math = 64
			} else if (m1 == "F") {
				// F: always Android
				fdMath1="Android"
			} else if (m1 == "B") {
				// B: always WIN, always mingw
				fdMath1="Windows"
				if (m6 == "1") {
					// ESR60: 1B: always 64bit TB: thus 64bit WIN
					fdMath6=zMingw64
					fdMath1="Windows [64bit]"
					isOS64math = 64
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
			// 531915: RFP + FF93+, FF91.1+ = F3
			let isRFPMath = false
			if (m1 + m6 == "F3") {
				isRFPMath = true
			}
			if (isFF) {
				//browser
				if (m1 == "") {
					if (block1) {
						// blocked
						m1hash = zB0
						fdMath1 = zB0
					} else if (m1hash.substring(0,6) == "random") {
						// random per execution
						fdMath1 = "random"
					} else {
						// new
						m1hash += strNew
						fdMath1 = m1hash // os
					}
				} else {
					// known: add code
					m1hash += s3 +" ["+ m1 +"]"+ sc
				}
				// os
				if (m6 == "") {
					if (block6) {
						// blocked
						m6hash = zB0
						fdMath6 = zB0
					} else if (m6hash.substring(0,6) == "random") {
						// random per execution
						fdMath6 = "random"
					} else {
						m6hash += strNew
						fdMath6 = m6hash
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
						mchash = zB0
					} else if (mchash.substring(0,6) == "random") {
						// random per execution
					} else {
						// new
						mchash += strNew
					}
				}
			}
			// output
			if (isRFPMath) {
				dom.fdMathOS.innerHTML = mchash + rfp_green
				dom.fdMath.innerHTML = m6hash + rfp_green
			} else {
				dom.fdMathOS.innerHTML = fdMath1 + rfp_red
				dom.fdMath.innerHTML = fdMath6 + rfp_red
			}
			// perf
			log_perf("math [fd]",t0)
			// blockage
			if (block1 || block6) {mchash = zB0}
			// return
			if (mchash.substring(0,6) == "random") {mchash = "random"}
			return resolve("math:"+ mchash.substring(0,40))
		}

		isOS64math = ""
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
				if (gRun) {gKnown.push("fd:math")}
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
				if (mchash.substring(0,6) == "random") {mchash = "random"}
				dom.fdMath.innerHTML = mchash
				return resolve("math:"+ mchash)
			}
		})
	})
}

function get_mm_metrics(runtype) {
	let t0; if (canPerf) {t0 = performance.now()}
	let count = 0
	let unable = "unable to find upper bound"
	// perf
	function perf(id, str, type) {
		document.getElementById(id).innerHTML = str == unable ? zB0 : str
		if (gRun && str == unable) {
			gMethods.push("screen:matchmedia_"+ type +": "+ unable)
		}
		count++
		if (count == 4) {
			if (runtype == "resize") {
				if (logResize) {log_perf("mm various [resize]",t0,"ignore")}
			} else {
				log_perf("mm various [screen]",t0)
			}
		}
	}

	function runTest(callback){
		// screen
		Promise.all([
			callback("device-width", "max-device-width", "px", 512, 0.01),
			callback("device-height", "max-device-height", "px", 512, 0.01)
		]).then(function(device){
			perf("mmScreen", device.join(" x "), "screen")
		}).catch(function(err){
			perf("mmScreen", err, "screen")
		})
		// inner
		Promise.all([
			callback("width", "max-width", "px", 512, 0.01),
			callback("height", "max-height", "px", 512, 0.01)
		]).then(function(inner){
			perf("mmInner", inner.join(" x "), "inner")
		}).catch(function(err){
			perf("mmInner", err, "inner")
		})
		// moz
		if (isFF) {
			callback("-moz-device-pixel-ratio", "max--moz-device-pixel-ratio", "", 2, 0.0000001
			).then(function(moz){
				perf("mmDPRm", moz += (moz == 1 ? rfp_green : rfp_red), "-moz-device-pixel-ratio")
			}).catch(function(err){
				perf("mmDPRm", err, "-moz-device-pixel-ratio")
			})
		} else {
			perf("mmDPRm", zNS)
		}
		// webkit
		if (!isFF || isVer > 62) {
			callback("-webkit-device-pixel-ratio", "-webkit-max-device-pixel-ratio", "", 2, 0.0000001
			).then(function(web){
				perf("mmDPRw", web, "-webkit-device-pixel-ratio")
			}).catch(function(err){
				perf("mmDPRw", err, "-webkit-device-pixel-ratio")
			})
		} else {
			perf("mmDPRw", zNS)
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
	let t0; if (canPerf) {t0 = performance.now()}
	// mm
	let mmNames = ["-moz-device-orientation","orientation","aspect-ratio","device-aspect-ratio"]
	let mmRes = []
	let l="landscape", p="portrait", q="(orientation: ", s="square", a="aspect-ratio"

	for (let i=0; i < 4; i++) {
		try {
			let value = undefined
			if (i == 0) {
				if (isFF) {
					if (window.matchMedia("(-moz-device-orientation:"+ l +")").matches) value = l
					if (window.matchMedia("(-moz-device-orientation:"+ p +")").matches) value = p
				} else (value = zNS)
			} else if (i == 1) {
				if (window.matchMedia(q + p +")").matches) value = p
				if (window.matchMedia(q + l +")").matches) value = l
			} else if (i == 2) {
				if (window.matchMedia("("+ a +":1/1)").matches) value = s
				if (window.matchMedia("(min-"+ a +":10000/9999)").matches) value = l
				if (window.matchMedia("(max-"+ a +":9999/10000)").matches) value = p
			} else {
				if (window.matchMedia("(device-"+ a +":1/1)").matches) value = s
				if (window.matchMedia("(min-device-"+ a +":10000/9999)").matches) value = l
				if (window.matchMedia("(max-device-"+ a +":9999/10000)").matches) value = p
			}
			if (isFF && value == undefined) {value = zB0}
			mmRes.push(value)
		} catch(e) {
			log_error("screen: matchmedia_"+ mmNames[i], e.name, e.message)
			mmRes.push(zB0)
		}
	}
	// get css values
	let cssRes = []
	cssRes.push(getElementProp("#cssOm", "content", ":after"))
	cssRes.push(getElementProp("#cssO", "content", ":after"))
	cssRes.push(getElementProp("#cssAR", "content", ":after"))
	cssRes.push(getElementProp("#cssDAR", "content", ":after"))
	// bypasses
	if (runSL) {mmRes = ["groot","thor","space","rabbit"]}
	let aDisplay = []
	for (let i=0; i < 4; i++) {
		if (cssRes[i] !== "x" && cssRes[i] !== mmRes[i]) {
			aDisplay.push(soB + mmRes[i] + scC)
			if (gRun) {
				gKnown.push("screen:matchmedia_"+ mmNames[i])
				gBypassed.push("screen:matchmedia_"+ mmNames[i] +":"+ cssRes[i])
			}
		} else {
			aDisplay.push(mmRes[i])
		}
	}
	dom.mmO.innerHTML = aDisplay.join(" | ")

	// screen*
	try {
		dom.scrOrient.innerHTML = (function() {
			let names = ["orientation.type", "mozOrientation", "orientation.angle"]
			let res = []
			for (let i=0; i < 3; i++) {
				try {
					if (i == 0) {res.push(screen.orientation.type)
					} else if (i == 1) {if (isFF) {res.push(screen.mozOrientation)} else {res.push(zNS)}
					} else {res.push(screen.orientation.angle)}
				} catch(e) {
					log_error("screen:screen."+ names[i], e.name, e.message)
					res.push(zB0)
				}
			}
			let r = res.join(" | ")
			r = r.replace(/landscape-secondary/g, "upside down")
			r = r.replace(/-primary/g, "")
			r = r.replace(/-secondary/g, "")
			r += (r == "landscape | landscape | 0" ? rfp_green : rfp_red)
			return r
		})()
	} catch(e) {
		dom.scrOrient.innerHTML = zB0
	}
	// display-mode
	let dm = zB0
	let cssMode = getElementProp("#cssDM","content",":after")
	try {
		q="(display-mode:"
		if (window.matchMedia(q +"fullscreen)").matches) {dm = "fullscreen"}
		if (window.matchMedia(q +"browser)").matches) {dm = "browser"}
		if (window.matchMedia(q +"minimal-ui)").matches) {dm = "minimal-ui"}
	} catch(e) {
		log_error("screen: matchmedia_display-mode", e.name, e.message)
	}
	if (runSL) {
		dm = (dm == "browser" ? "fullscreen" : "browser")
	}
	if (dm !== cssMode && cssMode !== "x") {
		dm = soB + dm + scC
		if (gRun) {
			gKnown.push("screen:matchmedia_display-mode")
			gBypassed.push("screen:matchmedia_display-mode:"+ cssMode)
		}
	}
	dom.mmDM.innerHTML = dm

	// perf
	if (runtype == "resize") {
		if (logResize) {log_perf("orientation [resize]",t0,"ignore")}
	} else {
		log_perf("orientation [screen]",t0)
	}
}

function get_pbmode() {
	let t0; if (canPerf) {t0 = performance.now()}
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
		let t0; if (canPerf) {t0 = performance.now()}
		let branding = "",
			channel = "",
			result = "",
			extra = "",
			el = dom.branding
		// extensions can block resources://
			// FF ~5ms, TB ~20ms
		setTimeout(() => resolve("resources:blocked"), 100)
		if (isResource !== "") {output(false); return}

		// output
		function output(setGlobalVars) {
			// set global vars
			if (setGlobalVars) {
				isChannel = channel // not used but handy
				isResource = result
				isResourceMetric = "resources:"+ isMark +", "+ isLogo +", "+ extra
			}
			dom.fdResource.innerHTML = isResource
			log_perf("resources [fd]",t0)
			return resolve(isResourceMetric)
		}
		// set
		function build() {
			// TB
			if (isTB) {
				if (isMark == "270 x 48") {
					channel = "Tor Browser - Alpha" // alpha: 8.5a7+ [60.5.0esr]
					log_debug("debugTB","css branding = ".padStart(19) +"270 x 48 px = alpha")
				} else if (isMark == "336 x 48" && isVer > 77) {
					channel = "Tor Browser - Release" // 78+ therefore release
				} else if (isMark == "300 x 38" && isVer > 67 && isVer < 78) {
					channel = "Tor Browser - Release" // 68 therefore release
				} else if (isMark == "300 x 38" && isVer > 59 && isVer < 68) {
					channel = "Tor Browser"
				}
			}
			// FF
			if (!isTB) {
				let is70 = (isVer > 69)
				//70+
				if (isMark == "336 x 48" && is70) {
					branding = "Browser"; channel = "Release/Beta"
				} else if (isMark == "336 x 64" && is70) {
					branding = "Browser"; channel = "Developer/Nightly"
				//60-69, ESR60/68
				} else if (isMark == "300 x 38" && !is70) {branding = "Quantum"; channel = "Release/Beta" // FF57-69
				} else if (isMark == "132 x 62" && !is70) {channel = "Developer Edition"
				} else if (isMark == "270 x 48" && !is70) {channel = "Nightly"}
				// try setting isFork again
				if (isLogo == zB0 && isFork == undefined) {
					set_isFork()
				}
			}
			// tidy
			if (isMark == "0 x 0") {dom.fdBrandingCss = "none"}
			if (isMark == "") {isMark = zB0}
			let note = s3+ "["+ isMark +" | "+ isLogo + (isTB ? " | "+ extra : "") +"]"+ sc
			if (channel !== "") {
				result = (branding == "" ? "" : branding +" - ") + channel + note
			} else if (isFork !== undefined) {
				result = isFork + note
			} else if (isMark.substring(0,1) !== "0 ") {
				let isNew = true
				if (isOS == "android" && isMark == "0 x 0") {isNew = false}
				result = (isTB ? "Tor Browser" : "Firefox") + note
					+ (isNew ? zNEW + (runSN ? zSIM : "") : "")
			} else {
				result = (isTB ? "Tor Browser" : "Firefox") + note
			}
			output(true)
		}
		function run() {
			// set icon
			let pngURL = "url('chrome://branding/content/icon64.png')"
			if (isOS == "android") {pngURL = "url('chrome://branding/content/favicon64.png')"}
			dom.fdResourceCss.style.backgroundImage= pngURL
			// set extra: see notes in tzp.html for elementid "torbranding": hidden vs offscreen
			let elTB = dom.torbranding
			let wTB = elTB.width, hTB = elTB.height
			let isTB2 = wTB > 0
			if (isTB2) {
				log_debug("debugTB","resource:// = ".padStart(19) + "tor-watermark.png")
			}
			extra = (isTB ? wTB +" x "+ hTB + " | " : "N | ") + (isTB2 ? "Y" : "N")
			log_perf("[" + extra +"] tb watermark [fd]",t0)
			// remeasure isMark with hidden element to get 0x0 if missing
			if (isTB || isTB2 || isOS == "android") {
				elTB = dom.torbranding2
				isMark = elTB.width + " x " + elTB.height
			}
			// build
			build()
		}

		if (isLogo !== zB0 && isMark !== "") {
			// fast path
			run()
		} else {
			// trigger delay to ensure resources loaded, retry original isMark
			setTimeout(function() {
				try {
					isMark = el.width+ " x " + el.height
					set_isFork()
				} catch(e) {}
				run()
			}, 1)
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

	// MEASURE: ToDo: catch errors/undefined etc
	let aMeasures = []
	let aPos = []
	let aList = [
		"screen.width","screen.height","screen.availWidth","screen.availHeight",
		"window.outerWidth","window.outerHeight","window.innerWidth","window.innerHeight",
		"screen.left","screen.top","screen.availLeft","screen.availTop",
		"window.screenX","window.screenY","window.mozInnerScreenX","window.mozInnerScreenY"
	]
	for (let i=0; i < 16; i++) {
		try {
			let x
			if (i == 0) {x = screen.width
			} else if (i == 1) {x = screen.height
			} else if (i == 2) {x = screen.availWidth
			} else if (i == 3) {x = screen.availHeight
			} else if (i == 4) {x = window.outerWidth
			} else if (i == 5) {x = window.outerHeight
			} else if (i == 6) {x = window.innerWidth
			} else if (i == 7) {x = window.innerHeight
			} else if (i == 8) {x = screen.left
			} else if (i == 9) {x = screen.top
			} else if (i == 10) {x = screen.availLeft
			} else if (i == 11) {x = screen.availTop
			} else if (i == 12) {x = window.screenX
			} else if (i == 13) {x = window.screenY
			} else if (i == 14) {x = window.mozInnerScreenX
			} else if (i == 15) {x = window.mozInnerScreenY
			}
			x = cleanFn(x)
			if (i < 8) {aMeasures.push(x)} else {aPos.push(x)}
		} catch (e) {
			log_error("screen: "+ aList[i], e.name, e.message)
			if (i < 8) {aMeasures.push(zB0)} else {aPos.push(zB0)}
		}
	}
	if (runSL) {aPos = ["0",0,zB0,"0",0,"0",100,zB0]}
	// mark non-numbers excl. blocks as NaNs
	if (isFF) {
		for (let i=0; i < aPos.length; i++) {
			if (aPos[i] !== zB0) {aPos[i] = (typeof aPos[i] == "number" ? aPos[i] : "NaN")}
		}
	}
	for (let i=0; i < aMeasures.length; i++) {
		if (aMeasures[i] !== zB0) {aMeasures[i] = (typeof aMeasures[i] == "number" ? aMeasures[i] : "NaN")}
	}

	// screen positions: FF52 is always zeros
	let v0 = aPos[0], v1 = aPos[1], v2 = aPos[2], v3 = aPos[3]
	let display = v0 +", "+ v1 +", "+ v2 +", "+ v3
	let value = display
	if (isFF) {
		value = "0, 0, 0, 0"
		if (display !== value) {
			// color each one
			if (v0 !== 0) {v0 = soB + v0 + scC}
			if (v1 !== 0) {v1 = soB + v1 + scC}
			if (v2 !== 0) {v2 = soB + v2 + scC}
			if (v3 !== 0) {v3 = soB + v3 + scC}
			display = v0 +", "+ v1 +", "+ v2 +", "+ v3
			if (gRun) {
				gKnown.push("screen:screen positions")
				gBypassed.push("screen:screen positions:"+ value)
			}
		}
	}
	dom.posS.innerHTML = display
	res.push("screen_positions:"+ value)

	// window positions
	let v4 = aPos[4], v5 = aPos[5], v6 = aPos[6], v7 = aPos[7]
	display = v4 +", "+ v5 +", "+ v6 +", "+ v7
	value = display
	let fpValue = display, posNote = ""
	if (isFF && !isFFLegacy) {
		posNote = value == "0, 0, 0, 0" ? rfp_green : rfp_red
		// RFP bypass but !== resize (does not recheck isRFP)
		if (isRFP && runtype !== "resize") {
			value = "0, 0, 0, 0"
			if (display !== value) {
			// color each one
				if (v4 !== 0) {v4 = soB + v4 + scC}
				if (v5 !== 0) {v5 = soB + v5 + scC}
				if (v6 !== 0) {v6 = soB + v6 + scC}
				if (v7 !== 0) {v7 = soB + v7 + scC}
				display = v4 +", "+ v5 +", "+ v6 +", "+ v7
				if (gRun) {
					gKnown.push("screen:window positions")
					gBypassed.push("screen:window positions:"+ value)
				}
			}
		} else {
			// fullscreen = all zeroes I except the last one
			// maximized = negatives

			// we can't bypass but we can mark NaNs as a lie
			let isPosLies = false
			if (v4 == "NaN") {v4 = soL + v4 + scC; isPosLies = true}
			if (v5 == "NaN") {v5 = soL + v5 + scC; isPosLies = true}
			if (v6 == "NaN") {v6 = soL + v6 + scC; isPosLies = true}
			if (v7 == "NaN") {v7 = soL + v7 + scC; isPosLies = true}
			display = v4 +", "+ v5 +", "+ v6 +", "+ v7
			if (gRun && isPosLies) {
				gKnown.push("screen:window positions")
			}
			// simplify FP value
			if (fpValue.includes("NaN")) {fpValue = zLIE
			} else if (fpValue.includes(zB0)) {fpValue = zB0
			} else if (fpValue !== "0, 0, 0, 0") {fpValue = "!zeros"
			}
		}
	}
	dom.posW.innerHTML = display + posNote
	res.push("window_positions:"+ fpValue)

	let w1 = aMeasures[0], h1 = aMeasures[1],
		w2 = aMeasures[2], h2 = aMeasures[3],
		w3 = aMeasures[4], h3 = aMeasures[5],
		w4 = aMeasures[6], h4 = aMeasures[7]

	// sim
	if (runSL) {
		w1 = w1-856 ; h1 = h1-183 // lie about screen
		w4 = w4-73; h4 = h4+18 // lie about inner value
	}

	let mScreen = w1 +" x "+ h1,
		mAvailable = w2 +" x "+ h2,
		mOuter = w3 +" x "+ h3,
		mInner = w4 +" x "+ h4
	// default display
	dom.mScreen = mScreen
	dom.mAvailable = mAvailable
	dom.mOuter = mOuter
	dom.mInner.innerHTML = mInner

	// NOTATE
	if (isFF && !isFFLegacy) {
		// sizes
		let match = true, r = "", c = "#ff4f4f"
		if (mScreen !== mAvailable) {match = false
		}	else if (mAvailable !== mOuter) {match = false
		}	else if (mOuter !== mInner) {match = false
		} else {
			aMeasures.forEach(function(value) {
				if (isNaN(value)) {match = false}
			})
		}
		r = (match ? sg : sb) +"[sizes match]"+ sc
		dom.match.innerHTML = r
		// color
		if (match) {c = "#8cdc8c"}
		let items = document.getElementsByClassName("group")
		for (let i=0; i < items.length; i++) {items[i].style.color = c}
		// inner: LB/NW
		if (isOS !== "android") {dom.lbnw.innerHTML = return_lb_nw(w4,h4)}
	}

	// FS
	let isFS
	try {
		if (runSE) {
			runWFS = false; abc = def
		} else if (runSL) {
			runWFS = false; isFS = undefined
		} else if (runWFS) {
			isFS = lstWFS[intWFS]
			console.log("SIM #" +intWFS, "fullscreen", isFS)
			intWFS++; intWFS = intWFS % lstWFS.length
		} else {
			isFS = window.fullScreen
		}
	} catch(e) {
		log_error("screen: fullscreen", e.name, e.message)
		isFS = zB0
	}
	isFS = cleanFn(isFS)
	let displayFS = isFS, fsBS = false, fsBypass = false
	if (isFF) {
		if (isFS !== zB0) {
			if (isFS !== "true" && isFS !== "false")
			fsBS = true
		}
		let cssFS = getElementProp("#cssDM","content",":after")
		if (cssFS !== "x") {
			cssFS = cssFS == "fullscreen" ? "true" : "false"
			if (cssFS !== isFS) {fsBS = true}
		}
		if (fsBS) {
			fsBS = true
			isFS = zLIE
			if (cssFS !== "x") {fsBypass = true; isFS = cssFS}
			displayFS = (fsBypass ? soB : soL) + displayFS + scC
			if (gRun) {
				gKnown.push("screen:fullscreen")
				if (fsBypass) {gBypassed.push("screen:fullscreen:"+ isFS)}
			}
		}
	}
	dom.fsState.innerHTML = displayFS
	res.push("fullscreen:"+ isFS)
	if (runWFS) {console.log(" - returned", isFS)}

	// THE REST
	get_orientation(runtype) // not stable
	get_mm_metrics(runtype) // not reliable (extension APIs)

	// METRICS
	//if (runtype !== "resize") {
		// allow 1px less due to min- vs max- and devicePixelRatios
			// ToDo: harden screen/inner bypass: due to zoom/system-scaling and limited ranges
			// i.e one or both values return "x": expand css, create binary css on the fly
		// ToDo: harden measurements with matchMedia if not tampered with?

		// inner
		let newW = getElementProp("#D","content",":before"),
			newH = getElementProp("#D","content",":after"),
			isLies = 0, oldW = w4, oldH = h4
		if (newW !== "x") {
			newW = newW * 1
			if (newW == oldW-1) {newW = oldW}
			if (newW !== oldW) {isLies++}
		}
		if (newH !== "x") {
			newH = newH.slice(3) * 1
			if (newH == oldH-1) {newH = oldH}
			if (newH !== oldH) {isLies++}
		}
		if (newW !== "x" && newH !== "x") { // valid bypass values
			let newInner = newW +" x "+ newH
			if (gRun && isLies > 0) {
				gKnown.push("screen:window inner")
				gBypassed.push("screen:window inner:"+ newInner)
			}
			dom.mInner.innerHTML = (isLies > 0 ? soB + mInner + scC : mInner)
			res.push("window_inner:"+ newInner)
		} else {
			// ToDo: prototype lies: these do not exist
			//if (proxyLies.includes("window.innerWidth") || proxyLies.includes("window.innerHeight")) {isLies++}
			if (isLies > 0) {
				dom.mInner.innerHTML = soL + mInner + scC
				if (gRun) {gKnown.push("screen:window inner")}
			}
			res.push("window_inner:"+ (isLies > 0 ? zLIE : mInner))
		}

		// screen
		newW = getElementProp("#S","content",":before")
		newH = getElementProp("#S","content",":after")
		isLies = 0, oldW = w1, oldH = h1
		if (newW !== "x") {
			newW = newW * 1
			if (newW == oldW-1) {newW = oldW}
			if (newW !== oldW) {isLies++}
		}
		if (newH !== "x") {
			newH = newH.slice(3) * 1
			if (newH == oldH-1) {newH = oldH}
			if (newH !== oldH) {isLies++}
		}
		if (newW !== "x" && newH !== "x") { // two valid bypass values
			let newScreen = newW +" x "+ newH
			if (gRun && isLies > 0) {
				gKnown.push("screen:screen")
				gBypassed.push("screen:screen:"+ newScreen)
			}
			dom.mScreen.innerHTML = (isLies > 0 ? soB + mScreen + scC : mScreen)
			res.push("screen:"+ newScreen)
		} else {
			if (proxyLies.includes("Screen.width") || proxyLies.includes("Screen.height")) {isLies++}
			if (isLies > 0) {
				dom.mScreen.innerHTML = soL + mScreen + scC
				if (gRun) {gKnown.push("screen:screen")}
			}
			res.push("screen:"+ (isLies > 0 ? zLIE : mScreen))
		}

		// screen available
		isLies = 0
		if (proxyLies.includes("Screen.availWidth") || proxyLies.includes("Screen.availHeight")) {isLies++}
		if (isLies > 0) {
			dom.mAvailable.innerHTML = soL + mAvailable + scC
			if (gRun) {gKnown.push("screen:screen available")}
		}
		res.push("screen_available:"+ (isLies > 0 ? zLIE : mAvailable))

		// outer
		isLies = 0
		// ToDo: prototype lies: these do not exist
		//if (proxyLies.includes("window.outerWidth") || proxyLies.includes("window.outerHeight")) {isLies++}
		if (isLies > 0) {
			dom.mOuter.innerHTML = soL + mOuter + scC
			if (gRun) {gKnown.push("screen:window outer")}
		}
		//res.push("window_outer:"+ (isLies > 0 ? zLIE : mAvailable))
		res.push("window_outer:TBA")
		res.push("zoom:"+ jsZoomOriginal)
		res.push("dpi:"+ varDPI)
		res.push("devicePixelRatio:"+ varDPR)
		return(res)
	//}
}

function get_ua_doc() {
	return new Promise(resolve => {
		let res = [],
			str = "",
			go = false,
			goUA = false, // treat userAgent separatelt
			lies = 0,
			pre = "",
			spoof = false,
			match = false
		// FF78+ only
		if (isFF && isVer > 77) {
			go = true
			if (isFork === undefined) {goUA = true} // we should ignore dealing with any 78+ forks
			if (isRFP) {goUA = true} // unless they are using RFP
		}
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
			str = cleanFn(str)
			res.push(property +":"+ str)
			document.getElementById("n"+ property).innerHTML = "~"+str+"~"
			return str
		}

		function get_property(property, good) {
			// clear arrow
			addArrow(property, false)
			// treat blocked as lies
			str = ""
			try {str = navigator[property]} catch(e) {str = zB0}
			// sim
			if (go && runSU) {
				if (property == "appCodeName") {str = "MoZilla"} // case
				if (property == "appName") {str = " Netscape"} // leading space
				if (property == "product") {str = "Gecko "} // trailing space
				if (property == "buildID") {str = ""} // empty string: unexpected
				if (property == "productSub") {str = undefined} // undefined
				if (property == "vendor") {str = " "} // single space
				if (property == "vendorSub") {str = zUQ} // undefined string
				// these four are OS dependent
				if (property == "appVersion") {str = "5.0 (windows)"}
				if (property == "platform") {str = "win32"}
				if (property == "oscpu") {str = "Windows NT 10.1; win64; x64"}
				// android desktop mode
				//if (property == "appVersion") {str = "5.0 (Android 10)"}
				//if (property == "platform") {str = "Linux aarch64"}
				//if (property == "oscpu") {str = "Linux aarch64"}
			}
			if (goUA && runSU) {
				if (property == "userAgent") {str = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0"}
				//if (property == "userAgent") {str = "Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0"} // desktop
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

		// Notes
		// 1693295 win capped at 10.0
		// 1679929 mac capped at 10.15

		function check_basics(str, property) {
			// clear arrow
			addArrow(property, false)
			// for dynamic returns
			let bs = false
			if (str == zU) {bs = true
			} else if (str == zUQ) {bs = true
			} else if (str == zB0) {bs = true
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
						if (isVer > nxtESR - 1) {v = nxtESR +".0"}
						v2 = v
						// only allow v2 as next RFP number IF...
						if (isVerPlus) {
							if (isVer == 90) {v2 = "91.0"}
							if (isVer == nxtESR - 1) {v2 = nxtESR +".0"}
						}
						/* resistfingerprinting/test/browser/browser_navigator.js */
						// NOTE: Android desktop mode uses linux userAgent and the use of
						// Gecko/20100101 Firefox/XX.0" = bs detected = technically correct
						// ToDo: we could ignore that in nonRFP and expose RFP bug (if it adds entropy and is a bug)
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
							if (isVer > 90) {
								// FF91+: 1711179
								controlA = "Android 10; Mobile; rv:"+ v +") Gecko/"+ v
								controlB = "Android 10; Mobile; rv:"+ v2 +") Gecko/"+ v2
							} else if (isVer < 88) {
								controlA = "Android 9; Mobile; rv:"+ v +") Gecko/20100101"
								controlB = "Android 9; Mobile; rv:"+ v2 +") Gecko/20100101"
							} else {
								controlA = "Android 9; Mobile; rv:"+ v +") Gecko/"+ v
								controlB = "Android 9; Mobile; rv:"+ v2 +") Gecko/"+ v2
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
		get_property("buildID", "\"20181001000000\"")
		get_property("productSub", "\"20100101\"")
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
					else if (str == pre +"6.2; Win64; x64") {match = true}
					else if (str == pre +"6.1; Win64; x64") {match = true}
					// app32 + win64
					else if (str == pre +"10.0; WOW64") {match = true}
					else if (str == pre +"6.3; WOW64") {match = true}
					else if (str == pre +"6.2; WOW64") {match = true}
					else if (str == pre +"6.1; WOW64") {match = true}
					// app32 + win32
					else if (str == pre +"10.0") {match = true}
					else if (str == pre +"6.3") {match = true}
					else if (str == pre +"6.2") {match = true}
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
		if (goUA) {
			spoof = check_basics(str, "userAgent")
			if (!spoof) {
				// DONE: RFP check, endstring, version
				// ToDo: os, architecture, syntax/formula
			}
			if (spoof) {addArrow("userAgent", true)}
		}
		// lies
		showhide("UA",(lies ? "table-row": "none"))
		if (lies) {
			lies += " pinocchio"+ (lies > 1 ? "s": "")
			dom.uaLies.innerHTML = sb + lies + sc +" [based on feature detection]" + (runSU ? zSIM : "")
			uaBS = true
			if (gRun) {gKnown.push("useragent:navigator properties")}
		}
		// return
		return resolve(res)
	})
}

function get_ua_iframes(log = false) {
	// runs post FP
	let t0; if (canPerf) {t0 = performance.now()}
	// clear
	let str1 = "ua_navigator", str2 = str1 +"_iframe_diff_", str3 = "_method_skip"
	let aNames = [str2 + str3, str2 +"[content] docroot"+ str3, str2 + "[content] with url"+ str3,
		str2 +"[window] docroot"+ str3,	str2 +"[window] with url"+ str3,
		str2 + "iframe access"+ str3, str2 + "nested"+ str3, str2 +"window access"+ str3,
	]
	aNames.forEach(function(item) {sDetail[item] = []})
	// control
	let list = ['userAgent','appCodeName','appName','product','appVersion',
		'oscpu','platform','buildID','productSub','vendor','vendorSub'],
		res = [], simA = [], simB = [], r = ""
	var ctrl = []
	for (let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = zB0}
		r = cleanFn(r)
		ctrl.push(list[i] +":"+ r)
		if (list[i] == "appCodeName") {r = "SIM A"}
		simA.push(list[i] +":"+ r)
		if (list[i] == "appCodeName") {r = "SIM B"}
		simB.push(list[i] +":"+ r)
	}
	ctrl.sort()
	simA.sort()
	simB.sort()

	// get data
	Promise.all([
		getDynamicIframeWindow({context: window, contentWindow: true, violateSOP: false, test: "ua"}), // docroot contentWindow
		getDynamicIframeWindow({context: window, contentWindow: true, source: "?", violateSOP: false, test: "ua"}), // with URL contentWindow
		getDynamicIframeWindow({context: window, violateSOP: false, test: "ua"}), // docroot
		getDynamicIframeWindow({context: window, source: "?", violateSOP: false, test: "ua"}), // with URL
		getDynamicIframeWindow({context: frames, test: "ua"}), // iframe access
		getDynamicIframeWindow({context: window, nestIframeInContainerDiv: true, test: "ua"}), // nested
		getDynamicIframeWindow({context: window, test: "ua"}), // window access
	]).then(function(results){
		const ctrlhash = sha1(ctrl.join())
		// sim
		if (runUAI) {
			if (intUAI == 0) {
				results[0] = [], results[1] = [], results[2] = zB0, results[3] = [], results[4] = [], results[5] = [], results[6] = []
			} else if (intUAI == 1) {
				results[1] = zB0, results[3] = []
			} else if (intUAI == 2) {
				results[0] = simA, results[1] = simA, results[2] = simA, results[3] = simA, results[4] = simA, results[5] = simA, results[6] = simA
			} else if (intUAI == 3) {
				results[0] = simB, results[1] = [], results[2] = simB, results[3] = zB0, results[5] = simB
			} else if (intUAI == 4) {
				results[0] = simA, results[2] = simB, results[3] = zB0, results[4] = simA
			}
		}
		// loop iframe results
		let block = [], distinct = [], mismatch = []
		for(let i=1; i < 8; i++) {
			let data = results[i-1]
			let name = aNames[i].replace(/\ua_navigator_iframe_diff_/g, "")
			name = name.replace(/\_method_skip/g, "")
			if (Array.isArray(data)) {
				let hash = sha1(data.join(), "ua iframe test "+ i)
				if (data.length == 0) {
					hash = zB0
					block.push(name)
				} else {
					if (hash !== ctrlhash) {
						distinct.push(hash)
						mismatch.push(name)
						let diffs = []
						for (let j = 0; j < data.length; j++) {if (data[j] !== ctrl[j]) {diffs.push(data[j])}}
						sDetail[aNames[0]] = diffs
					}
				}
				document.getElementById("uaIframe"+ i).innerHTML = hash
			} else {
				block.push(name)
				document.getElementById("uaIframe"+ i).innerHTML = data
			}
		}
		let bCount = block.length
		distinct = distinct.filter(function(item, position) {return distinct.indexOf(item) === position})
		// iframe summary
		let summary = sha1(results[0].join(), "ua iframe summary")
		let bNote = ""
		if (bCount > 0 && bCount < 7) {bNote = s2 + "[" + bCount +" block"+ (bCount > 1 ? "s]" : "]") + sc}
		// single line
		if (distinct.length < 2) {
			let diffBtn = ""
			if (bCount == 7) {
				summary = zB0
			} else {
				if (distinct.length > 0) {diffBtn = buildButton("2", aNames[0], "diff")}
				summary += (distinct.length > 0 ? match_red : match_green) + diffBtn + bNote
			}
		}	else {

			// multi-line
			sDetail[aNames[0]] = []
			summary = "mixed results" + match_red + bNote
			for(let i=1; i < 8; i++) {
				let data = results[i-1]
				if (Array.isArray(data)) {
					let hash = sha1(data.join())
					if (data.length > 0) {
						if (hash !== ctrlhash) {
							let diffs = []
							for (let j = 0; j < data.length; j++) {if (data[j] !== ctrl[j]) {diffs.push(data[j])}}
							sDetail[aNames[i]] = diffs
							hash += buildButton("2", aNames[i], "diff")
							document.getElementById("uaIframe"+ i).innerHTML = hash
						}
					}
				}
			}
		}
		if (runUAI) {
			let nmeUAI = ["blocks: all", "blocks: 2", "mismatch: all: same-diff",
				"blocks: 2 | mismatch: some: same-diff", "blocks: 1 | mismatch: some: multi-diff"]
			console.log("SIM #"+ intUAI +" UA iframes:", nmeUAI[intUAI])
			intUAI++; intUAI = intUAI % nmeUAI.length
		}
		dom.uaIframes.innerHTML = summary
		if (log) {log_perf("ua iframes [not in FP]",t0)}
	})
}

function get_ua_workers() {
	dom.uaWorkers = "summary not coded yet"
	// control
	let list = ['userAgent','appCodeName','appName','product','appVersion','platform'],
		res = [],
		r = ""
	for (let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = zB0}
		r = cleanFn(r)
		res.push(list[i] +":"+ r)
	}
	res.sort()
	let control = sha1(res.join())

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
				//console.log("ua worker", e.data)
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
				//console.log("ua shared", e.data)
				test1 = sha1((e.data).join())
				el1.innerHTML = test1 + (test1 == control ? match_green : match_red)
				sharednav.port.close()
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
							//console.log("ua service", event.data.msg)
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
	if (logExtra && canPerf) {console.log(performance.now(), "B START.:", runtype, ": viewport")}
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
	if (logExtra && canPerf) {console.log(performance.now(), "B FINISH:", runtype, ": viewport")}
	// return
	if (runtype == "fd") {
		return vw // scrollbar
	} else {
		return vh // android tests
	}
}

function get_widgets() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let list = ['button','checkbox','color','combobox','radio','text','datetime','textarea']
		let sName = "feature_widgets"
		sDetail[sName] = []

		try {
			// loop elements
			let res = [], sizes = [], fonts = []
			for (let i=0; i < list.length; i++) {
				let el = document.getElementById("widget"+ i)
				let font = "unknown", size = "unknown"
				font = getComputedStyle(el).getPropertyValue("font-family")
				size = getComputedStyle(el).getPropertyValue("font-size")
				if (runSN) {
					//if (i == 4) {font = "unknown"} // bypass but new
					//if (i == 1) {font = "-apple-system"; size="11px"} // font + size
					if (i == 4) {font = "-apple-system"} // font
					//if (i == 2) {size="26px"} // size
				}
				res.push(list[i] +": "+ font +", "+ size)
				if (i < 6) {sizes.push(size); fonts.push(font)}
			}
			let hash = sha1(res.join(), "feature widgets")
			sDetail[sName] = res
			fonts = fonts.filter(function(item, position) {return fonts.indexOf(item) === position})
			sizes = sizes.filter(function(item, position) {return sizes.indexOf(item) === position})
			// notate
			let note, color = "3", mixed = ""
			if (isFF) {
				// we only need the font for OS: ignore unknown to still get an OS
				let fntTmp = fonts
				if (fntTmp.length > 1) {
					fntTmp = fntTmp.filter(x => !["unknown"].includes(x))
				}
				if (fntTmp.length == 1) {
					let font0 = fntTmp[0]
					if (font0.slice(0,12) == "MS Shell Dlg") {note = "windows"
					} else if (font0.slice(0,12) == "\"MS Shell Dl") {note = "windows" // FF57 has a slice and escape char issue
					} else if (font0 == "Roboto") {note = "android"
					} else if (font0 == "-apple-system") {note = "mac"
					} else if (font0 == "unknown") {note = "unknown"; color = "bad"
					} else {note = "linux"}
				} else {
					note = "NEW"; color = "bad"
				}
				if (note !== "NEW") {
					if (fonts.length > 1 || sizes.length > 1) {mixed = zNEW}
				}
			}
			let btn = buildButton(color, sName, note)
			dom.fdWidget.innerHTML = hash + btn + mixed + (runSN ? zSIM : "")
			// perf & resolve
			log_perf("widgets [fd]",t0)
			return resolve("widgets:"+ hash)
		} catch(e) {
			dom.fdWidget = zB0
			log_perf("widgets [fd]",t0)
			return resolve("widgets:"+ zB0)
		}
	})
}

function get_zoom(runtype) {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		// reset
		let zoomAssume = false
		let dpr1 = "", dpr2 = "", dprBypass = false
		dpi_x = 0
		dpi_y = 0 // if it stays at 0 = css blocked or offsetWidth blocked
		varDPI = undefined
		varDPR = undefined
		jsZoom = undefined

		// DPR
		function get_dpr() {
			try {
				dpr1 = window.devicePixelRatio || 1;
				varDPR = dpr1
			} catch(e) {
				log_error("screen: dpr", e.name, e.message)
				dpr1 = zB0
			}
			// 477157: FF always use bypass value
			if (isFF) {
				let el = dom.dpr2
				try {
					dpr2 = getComputedStyle(el).borderTopWidth
					dpr2 = dpr2.slice(0, -2) // trim "px"
					if (dpr2 > 0) {
						dpr2 = (1/dpr2)
					}
					//dpr2 = dpr2.toFixed(6); dpr2 = dpr2.toString("0.######") * 1
					varDPR = dpr2
					// record lies + bypass
					let diffDPR = Math.abs(dpr1 - dpr2)
					if (isNaN(diffDPR) || diffDPR > 0.0001) {
						dpr1 = soB + dpr1 + scC
						if (gRun) {
							gKnown.push("screen:devicePixelRatio")
							gBypassed.push("screen:devicePixelRatio:"+ varDPR)
						}
					}
				} catch(e) {
					log_error("screen: dpr poc", e.name, e.message)
					dpr2 = zB0
				}
			}
			let dprStr = dpr1 + (isFF ? " | " + dpr2 : "")
			dom.dpr.innerHTML = dprStr + (dprStr == "1 | 1" ? rfp_green : rfp_red)
		}

		// DPI x 3 methods, DPPX, DPCM
		function get_dpi_etc() {
			let t1; if (canPerf) {t1 = performance.now()}
			let mmDPI = return_mm_dpi("dpi",1),
				mmDPPX = return_mm_dpi("dppx",100),
				mmDPCM = return_mm_dpi("dpcm",10),
				cssDPI = getElementProp("#P","content",":before")
				//console.debug(performance.now() - t1 + "ms") //2-3ms
			// note: divDPI relies on css: if css is blocked (dpi_y = 0) this causes issues

			// calulated via div
			try {
				dpi_x = Math.round(dom.divDPI.offsetWidth * varDPR)
			} catch(e) {}
			try {
				dpi_y = Math.round(dom.divDPI.offsetHeight * varDPR)
			} catch(e) {}

			if (runSL) {
				dpi_x = dpi_x + 10; dpi_y = dpi_y + 10; mmDPI = 63
			}
			// varDPI: fallback checks: allow 1 x diff; use highest value
			let diffDPI = 0
			if (dpi_y !== 0) {
				varDPI = dpi_x
			} else if (cssDPI !== "x") {
				if (dpi_y !== 0) {
					diffDPI = Math.abs(dpi_x - cssDPI)
					varDPI = (diffDPI == 1 ? dpi_x : cssDPI)
				} else if (mmDPI !== zB0) {
					diffDPI = Math.abs(mmDPI - cssDPI)
					varDPI = (diffDPI == 1 ? mmDPI : cssDPI)
				}
			} else if (mmDPI !== zB0) {
				// could be a lie
				varDPI = mmDPI
			}
			//console.debug("varDPI", varDPI, "cssDPI", cssDPI, "mmDPI", mmDPI, "dpi_x + y", dpi_x, dpi_y)

			// bypass matchmedia lies
			//cssDPI = "x"
			if (cssDPI !== "x") {
				if (mmDPI !== zB0) {diffDPI = Math.abs(mmDPI - cssDPI)} else {diffDPI = 2}
					if (mmDPI !== cssDPI && diffDPI > 1) {
						mmDPI = soB + mmDPI + scC
						if (gRun) {
							gKnown.push("screen:matchmedia_dpi")
							gBypassed.push("screen:matchmedia_dpi:"+ cssDPI)
						}
					}
			} else { // if (dpr2 !== zB0) ?
				// if drp2 was blocked then RFP will manifest
				if (mmDPI !== zB0) {diffDPI = Math.abs(mmDPI - dpi_x)} else {diffDPI = 2}
				if (mmDPI !== dpi_x && diffDPI > 1) {
					mmDPI = soB + mmDPI + scC
					if (gRun) {
						gKnown.push("screen:matchmedia_dpi")
						gBypassed.push("screen:matchmedia_dpi:"+ dpi_x)
					}
				}
			}
			dom.mmDPI.innerHTML = mmDPI +" | "+ mmDPPX +" | "+ mmDPCM

			// allow for diff of one
			let displayDPI = varDPI
			if (cssDPI !== "x") {
				diffDPI = Math.abs(cssDPI - dpi_x)
				if (diffDPI > 1) {
					displayDPI = soB + displayDPI + scC
					if (gRun) {
						gKnown.push("screen:dpi")
						gBypassed.push("screen:dpi:"+ cssDPI)
					}
				}
			}
			dom.jsDPI.innerHTML = displayDPI
			if (runtype == "resize") {
				if (logResize) {log_perf("dpi [part of zoom]",t1,"ignore")}
			} else {
				log_perf("dpi [part of zoom]",t1,"ignore")
			}
		}
		get_dpr()
		get_dpi_etc()

		// zoom
		if (varDPI == undefined) {
			jsZoom = 100
			zoomAssume = true
		} else {
			jsZoom = varDPI
		}
		jsZoomOriginal = jsZoom // keep any possible entropy
		jsZoom = Math.round(jsZoom)
		// fixup some numbers
		//console.debug("zoom", jsZoom)
		if (jsZoom !== 100) {
			if (jsZoom > 27 && jsZoom < 34 && isFF) {jsZoom=30
			} else if (jsZoom > 30 && jsZoom < 36) {jsZoom=33 // chrome
			} else if (jsZoom > 47 && jsZoom < 52) {jsZoom=50
			} else if (jsZoom > 63 && jsZoom < 72) {jsZoom=67
			} else if (jsZoom > 75 && jsZoom < 82) {jsZoom=80
			} else if (jsZoom > 84 && jsZoom < 95) {jsZoom=90
			} else if (jsZoom > 95 && jsZoom < 102) {jsZoom=100
			} else if (jsZoom > 104 && jsZoom < 112) {jsZoom=110
			} else if (jsZoom > 114 && jsZoom < 122) {jsZoom=120
			} else if (jsZoom > 127 && jsZoom < 136) {jsZoom=133
			} else if (jsZoom > 143 && jsZoom < 152) {jsZoom=150
			} else if (jsZoom > 160 && jsZoom < 180 && isFF) {jsZoom=170
			} else if (jsZoom > 170 && jsZoom < 180) {jsZoom=175 // chrome
			} else if (jsZoom > 190 && jsZoom < 210) {jsZoom=200
			} else if (jsZoom > 225 && jsZoom < 255 && isFF) {jsZoom=240
			} else if (jsZoom > 240 && jsZoom < 255) {jsZoom=250 // chrome
			} else if (jsZoom > 280 && jsZoom < 310) {jsZoom=300
			} else if (jsZoom > 380 && jsZoom < 410) {jsZoom=400
			} else if (jsZoom > 475 && jsZoom < 510) {jsZoom=500
			}
		}
		dom.jsZoom.innerHTML = jsZoom + (zoomAssume ? s1 +"[assumed]"+ sc : jsZoom == 100 ? rfp_green : rfp_red)

		if (runtype == "resize") {
			if (logResize) {log_perf("zoom [resize]",t0,"ignore")}
		} else {
			log_perf("zoom ["+ runtype +"]",t0)
		}
		if (logExtra && canPerf) {console.log(performance.now(), "A FINISH:", runtype, ": zoom, dpi, devicePixelRatio")}
		return resolve(jsZoom)
	})
}

/* OS SPECIFIC */

function run_os() {
	if (isOS == "android") {
		showhide("OS1","table-row")
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

	if (isOS == "android") {
		// FF-ANDROID
		if (ih > firstH) {
			// firstH s/be with the toolbar
			newWinLeak = iw +" x "+ ih +" [inner] [toolbar hidden] "+ ow +" x "+ oh +" [outer]"
		} else if (ih == firstH) {
			// should be the same
			newWinLeak = iw +" x "+ ih +" [inner] [toolbar visible] "+ ow +" x "+ oh +" [outer]"
		}
		dom.newWinLeak.innerHTML = newWinLeak
	} else {
		// FF-DESKTOP (and non-FF)
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
}

function goNW_UA() {
	// control
	let list = ['userAgent','appCodeName','appName','product','appVersion',
		'oscpu','platform','buildID','productSub','vendor','vendorSub'],
		res = [],
		control = [],
		sim = [],
		r = ""
	for (let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = zB0}
		r = cleanFn(r)
		control.push(list[i] +":"+ r)
		if (list[i] == "appCodeName") { r = "moZillla"}
		if (list[i] == "appVersion") { r = "5.0 (toaster)"}
		if (list[i] == "userAgent") { r = "moZillla/5.0 (toaster)"}
		sim.push(list[i] +":"+ r)
	}
	control.sort()

	dom.uaHashOpen.innerHTML = "&nbsp"
	// open, get results, close
	let newWin = window.open()
	let newNavigator = newWin.navigator
	for(let i=0; i < list.length; i++) {
		try {r = newNavigator[list[i]]} catch(e) {r = zB0}
		r = cleanFn(r)
		res.push(list[i] +":"+ r)
	}
	newWin.close()

	// hash
	if (runSL) {res = sim}
	res.sort()
	let hash = sha1(res.join())
	let controlhash = sha1(control.join())
	// output
	if (hash == controlhash) {
		hash += match_green
	} else {
		let sStr = "ua_navigator_new_window_reported_diff_notglobal", diffs = []
		for (let i = 0; i < res.length; i++) {
			if (res[i] !== control[i]) {diffs.push(res[i])}
		}
		sDetail[sStr] = diffs
		hash += match_red + buildButton("2", sStr, "diff")
	}
	dom.uaHashOpen.innerHTML = hash + (runSL ? zSIM : "")
}

/* OUTPUT */

function outputScreen(runtype) {
	// this function is only called on page load or reruns
	// so no need to worry about resizing events
	let t0; if (canPerf) {t0 = performance.now()}
	let section = []

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
	let t0; if (canPerf) {t0 = performance.now()}
	// reset
	uaBS = false
	// lies
	function get_pLies() {
		if (proxyLies.includes("Navigator.userAgent")) {uaBS = true
		} else if (proxyLies.includes("Navigator.appVersion")) {uaBS = true
		} else if (proxyLies.includes("Navigator.platform")) {uaBS = true
		} else if (proxyLies.includes("Navigator.oscpu")) {uaBS = true
		} else if (!isFF) {
			if (proxyLies.includes("Navigator.productSub")) {uaBS = true
			} else if (proxyLies.includes("Navigator.buildID")) {uaBS = true
			} else if (proxyLies.includes("Navigator.vendor")) {uaBS = true
			} else if (proxyLies.includes("Navigator.vendorSub")) {uaBS = true
			} else if (proxyLies.includes("Navigator.appCodeName")) {uaBS = true
			} else if (proxyLies.includes("Navigator.appName")) {uaBS = true
			} else if (proxyLies.includes("Navigator.product")) {uaBS = true}
		}
	}
	Promise.all([
		get_ua_doc(), // sets uaBS
	]).then(function(results){
		if (uaBS == false) {get_pLies()} // sets uaBS
		// section
		const ctrl = results[0].sort()
		const ctrlhash = sha1(ctrl.join(), "ua")
		let section = ctrl, display = ctrlhash

		if (uaBS) {
			section = ["ua:"+ zLIE]
			display = soL + ctrlhash + scC
		} else {
			// no lies: check bypasses
			let sRep = section[8], sReal = ""
			let n = sRep.lastIndexOf("/"),
				vReported = sRep.slice(n+1, sRep.length)
			let go = false
			// so this only applies to ESR numbering
			if (isRFP && isVer > 59) {
				if (isFork === undefined) {go = true}
				if (isRFP) {go = true}
				// skip open-ended versions if next version is ESR
				// assuming isVer keeps up to date: e.g. 101+ can be 101 or 102
				if (isVerPlus) {
					if (isVer == (nxtESR - 1) && (vReported * 1) == nxtESR) {go = false}
				}
			}
			// RFP: version
			if (go) {
				let vReal = isVer.toString() + ".0"
				sReal = sRep.replace(new RegExp(vReported, 'g'), vReal)
				if (sRep !== sReal) {
					// notate open-ended
					if (isVerPlus) {
						sReal = sReal.replace("rv:"+ vReal, "rv:"+ vReal + "+")
						sReal = sReal.replace("Firefox/"+ vReal, "Firefox/"+ vReal + "+")
						sReal = sReal.replace("Gecko/"+ vReal, "Gecko/"+ vReal + "+") // android
					}
					section[8] = sReal
					sReal = sReal.slice(10)
					sRep = sRep.replace(new RegExp(vReported, 'g'), soB + vReported + scC)
					dom.nuserAgent.innerHTML = "~"+ sRep.slice(10) +"~"
					if (gRun) {
						gKnown.push("ua:userAgent:version")
						gBypassed.push("ua:userAgent:version:"+ sReal)
					}
				}
			}
			// isBrave spaces
			if (isBraveMode > 1) {
				for (let i=0; i < section.length; i++) {
					let item = section[i],
						name = item.split(":")[0]
					sRep = item.substring(name.length+1, item.length)
					sReal = sRep.trim().replace(/\s+/g, " ")
					if (sRep !== sReal) {
						section[i] = name +":"+ sReal
						document.getElementById("n"+ name).innerHTML = "~"+ sRep + "~ " + soB +"spaces"+ scC
						if (gRun) {
							gKnown.push("ua:"+ name)
							gBypassed.push("ua:"+ name +":"+ sReal)
						}
					}
				}
			}
		}
		dom.uaDoc.innerHTML = display
		log_section("ua", t0, section)
	})
}

function outputFD(runtype) {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = []

	// FF
	if (isFF) {
		// from globals:ver + browser
		let r
		if (isVer == 59) {r = "59 or lower"} else {r = isVer + (isVerPlus ? "+" : "")}
		dom.fdVersion.innerHTML = r
		section.push("version:"+ r)

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
			// os bitness: requires get_math()
				// FF89+: javascript.options.large_arraybuffers: ToDo: watch TB + pref deprecation
				// isOS64: true, zNS (if correct error), zB0 (incorrect error), or false (future: when pref dropped)
			let bits, display = bits
			// mac
				// tzp requires FF52+ which requires macOS 10.9+ which use 64bit intel (and ARM for 11+)
			if (isOS == "mac") {
				bits = "64bit"
				if (isOS64 !== true) {
					if (gRun) {
						gKnown.push("fd:os_architecture")
						gBypassed.push("fd:os_architecture:"+ bits)
					}
				}
				display = isOS64 == true ? bits : soB + isOS64 + scC
			}
			// non-mac
			if (isOS !== "mac") {
				if (isVer < 89) {bits = zNS
				} else if (isOS64 === true) {bits = "64bit"
				} else if (isOS64 === false) {bits = "32bit"
				} else {bits = isOS64}
				display = bits
				// bypassed
				if (isOS64 !== true && isOS64math !== "") {
					display = soB + bits + scC
					bits = isOS64math + "bits"
					if (gRun) {
						if (isVer > 88) {gKnown.push("fd:os_architecture")} // not a lie if not supported
						gBypassed.push("fd:os_architecture:"+ bits)
					}
				}
			}
			dom.fdArchOS.innerHTML = display
			section.push("os_architecture:"+ bits)

			let browser = (isTB ? "Tor Browser" : (isFork !== undefined ? isFork : "Firefox"))
			section.push("browser:"+ browser)
			log_section("feature", t0, section)
		})

	} else {
		Promise.all([
			get_errors(),
			get_widgets(),
			get_math(),
		]).then(function(results){
			results.forEach(function(currentResult) {
				section.push(currentResult)
			})
			dom.fdResource = zNA
			section.push("resources:n/a")
			dom.fdArchOS = zNA
			section.push("os_architecture:n/a")
			dom.fdVersion.innerHTML = zNA
			section.push("version:n/a")
			dom.fdScrollV = zNA
			dom.fdScrollE = zNA
			section.push("scrollbars:n/a")
			// Brave/Opera
			let browser = zNA, display = zNA
			if (isBrave) {
				browser = "Brave" + (isBraveMode > 1 ? " ["+ aBraveMode[isBraveMode] +"]" : "")
			} else if (isEngine == "blink" && Object.keys(chrome).includes("search")) {browser = "Opera"}
			dom.browserlabel = "browser"
			dom.fdResourceCss = browser
			section.push("browser:"+ browser)
			log_section("feature", t0, section)

			dom.fdBrandingCss = zNA
			dom.fdChrome = zNA
			dom.fdMathOS = zNA
			dom.fdLH = zNA
			// non-FF needs these: in FF scrollbar calls them
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
	// FF60: false positive
	if (isVer < 61) {isFFno = isFFno.filter(x => !["type of installtriggerimpl"].includes(x))}
	if (isFF && isFFno.length) {
		let fake = []
		isFFno.forEach(function(item) {fake.push(item)})
		gKnownOnce.push("_global:isFF")
		gBypassedOnce.push("_global:isFF:"+ fake.join() + ":true")
	}
	// cydec
	let len = eval.toString().length
	if (isFF && len !== 37) {
		gKnownOnce.push("_global:eval.toString().length")
		gBypassedOnce.push("_global:eval.toString().length:37")
	}
	// cosmetic
	let items = document.getElementsByClassName("faint")
	for (let i=0; i < items.length; i++) {items[i].textContent = "not coded yet"}
	dom.audiohash2 = ""
	outputFD("load")
	setTimeout(function() {outputUA()}, 1)
	setTimeout(function() {outputScreen("load")}, 1)
	setTimeout(function() {run_os()}, 1) // per os tweaks
}

countJS("screen")
