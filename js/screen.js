'use strict';

var jsZoom, varDPI, dpi_x, dpi_y, zoomAssume;

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
				if (matchMedia("(max-resolution:"+i+type+")").matches === true) {
					return i}
			} return i
		})()
	} catch(e) {
		r = (e.name == "ReferenceError" ? zB1 : zB2)
	}
	return r
}

function get_chrome() {
	return new Promise(resolve => {
		let c = "chrome://browser/content/extension-",
			p = "-panel.css",
			list = [c+'win'+p, c+'mac'+p],
			os = "Linux",
			x = 0,
			t0 = performance.now()
		// run isTB2 once: put it at the start so we get it early
		if (isTB2 == "") {
			list.push('resource://torbutton-assets/aboutTor.css')
			list.sort((a,b) => b-a)
		}
		// output
		function output(r) {
			if (isVer < 60) {r = zNA
			} else {
				// os-check (runS already sets isOS ="")
				if (r.toLowerCase() !== isOS) {r += sb+"[!= widget]"+sc + (runS ? zSIM : "")}
			}
			dom.fdChrome.innerHTML = r
			if (logPerf) {debug_log("chrome [fd]",t0)}
			return resolve("ignoreme")
		}
		// run
		function run() {
			// win/mac
			list.forEach(function(item) {
				let css = document.createElement("link")
				css.href = item
				css.type = "text/css"
				css.rel = "stylesheet"
				document.head.appendChild(css)
				css.onload = function() {
					if (item === c+"win"+p) {os="Windows"; x++; output(os)}
					if (item === c+"mac"+p) {os="Mac"; x++; output(os)}
					// isTB2
					if (item.substring(0,3) === "res") {
						isTB = true; debug_page("tb","     resource:// = aboutTor.css")
						isTB2 = "y"
						if (logPerf) {debug_log("[yes] tb resource [fd]",t0)}
					}
				}
				css.onerror = function() {
					if (item.substring(0,3) === "res") {
						isTB2 = "n"
						if (logPerf) {debug_log("[no] tb resource [fd]",t0)}
					} else {x++}
				}
				document.head.removeChild(css)
			})
			// android
			let img = new Image()
			img.src = "chrome://branding/content/icon64.png"
			img.style.visibility = "hidden"
			document.body.appendChild(img)
			img.onload = function() {x++}
			img.onerror = function() {os="Android"; x++; output(os)}
			document.body.removeChild(img)
			// linux: default
			function check_linux() {
				if (x == 3) {
					clearInterval(checking)
					if (os == "Linux") {output(os)}
				}
			}
			let checking = setInterval(check_linux, 20)
		}
		run()
	})
}

function get_collation() {
	let list = ['ka','ku','lo','no','pa','tk'],
		chars = ['\u00F1','\u00E4','\u0109','\u0649','\u10D0','\u0E9A'],
		results = [],
		missing = [],
		t0 = performance.now()
	// output
	function output(hash) {
		if (runS) {hash = sha1(hash)}
		let r = "",
			c = ""
		if (missing.length > 0) {
			c = " [missing locale code" + (missing.length > 1 ? "s" : "")
				+ ":" + missing.join(", ") + "]"
		}
		if (hash == "d0e83d1d652f95d686870a59def6ddcc7cde5e28") {
			r = zFF + " [FF70+]" + c
		} else if (hash == "e4a32b021b6743d34573ab91a9a31d1068e5b01e") {
			r = zFF + " [FF65-69]" + c
		} else if (hash == "78c0998f75b0da6b11dd55e2f29dc054e14aae9e") {
			r = zFF + " [FF64 or lower]" + c
		} else if (isFF) {
			r = hash + c + zNEW + (runS ? zSIM : "")
			dom.fdCollation.setAttribute("class", "c mono")
		}
		dom.fdCollation.innerHTML = r
		if (logPerf) {debug_log("collation [fd]",t0)}
	}
	// run
	let control = sha1(chars.sort(Intl.Collator("en-US").compare))
	list.forEach(function(i) {
		chars.sort(Intl.Collator(i).compare)
		let test = sha1(chars.join())
		results.push(test)
		if (control == test) {missing.push("<code>" + i + "</code>")}
	})
	output(sha1(results.join()))
}

function get_color() {
	// depth
	let r1 = screen.pixelDepth, r2 = screen.colorDepth
	let r = r1+" | "+r2
	dom.ScrColor.innerHTML = r += (r == "24 | 24" ? rfp_green : rfp_red)
	// color
	try {
		r = (function() {
			for (let i=0; i < 1000; i++) {
				if (matchMedia("(color:"+i+")").matches === true) {return i}
			}
			return i
		})()
	} catch(e) {
		r = (e.name == "ReferenceError" ? zB1 : zB2)
	}
	dom.mmC.innerHTML = (r == 8 ? r+rfp_green : r+rfp_red)
}

function get_engine() {
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
	} else if (hash == "cb89002a8d6fabf859f679fd318dffda1b4ae0ea") {isEngine = "gecko"
	}
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
				let temp = hash.substring(0,10)
				if (isErr == "") {isErr = hash.substring(0,4)}
				if (isErr == "X") {
					code = "X"; ff = "[FF59 or lower]"
				} else if (temp == "e09e23efbf") {	
					code = "A"; ff = "[FF60-67]"
				} else if (temp == "9be311282c") {
					code = "B"; ff = "[FF68-69]"
				} else if (temp == "1492f1bd13") {
					code = "C"; ff = "[FF70]"
				} else if (temp == "7121c507d7") {
					code = "D"; ff = "[FF71]"
				// 74+: 1259822: pref alters err2: 2 outcomes
				} else if (temp == "fa8efa5727") {
					code = "E1"; ff = "[FF72-74]"
				} else if (temp == "fb19e1bedb") {
					code = "E2"; ff = "[FF74]"
				} else if (temp == "214fc55f92") {
					code = "F1"; ff = "[FF75+]"
				} else if (temp == "5186bfbb76") {
					code = "F2"; ff = "[FF75+]"
				} else if (temp == "0dc5e92b7d") {
					code = "G1"; ff = "[FF78+]"
				} else if (temp == "b75bad7247") {
					code = "G2"; ff = "[FF78+]"
				}
				if (code !== "") {
					isFF = true
					dom.fdError.innerHTML = zFF +" " + ff
					dom.errh.innerHTML = hash + s3+"["+code+"]"+sc + (runS ? zSIM : "")
				} else if (isFF) {
					code = zNEW
					dom.errh.innerHTML = hash + code + (runS ? zSIM : "")
					if (isBlock) {
						dom.fdError.innerHTML = "script blocking detected"+ sb +"[see details]"+sc + (runS ? zSIM : "")
					} else {
						dom.fdError.innerHTML = hash + zNEW + (runS ? zSIM : "")
						dom.fdError.setAttribute("class", "c mono")
					}
				} else {
					dom.errh = hash
				}
				if (logPerf) {debug_log("errors [fd]",t0)}
				return resolve("errors: " + hash)
			} else {
				dom.errh = hash; dom.fdError = hash
				return resolve("errors: " + hash)
			}
		}
		// run
		function run() {
			isErr = ""
			//1
			try {eval("alert('A)")} catch(e) {
				dom.err1=e; res.push(e)
				if (e.message == "unterminated string literal") {isErr = "X"}
			}
			//2
			try {
				function foobar() {let foo = document.getElementById("bar"); foo.value = screen.width}
				window.onload = foobar()
			} catch(e) {
				if (runS) {e += zSIM}
				dom.err2=e; res.push(e)
			}
			//3
			try {
				test = BigInt(2.5)
			} catch(e) {
				if (isFF) {
					test = e.message.substring(0,3)
					if (test == "2.5") {
						// 75+
						test = e.name+": "+ e.message
					} else if (test == "can") {
						// 68-74: trap NumberFormat
						try {
							test = eval("987654321987654321n")
							let num = new Intl.NumberFormat(undefined)
							test = num.format(test)
							test = e.name+": "+ e.message
						} catch (e) {
							if (e.name == "ReferenceError") {
								test = zB4; isBlock = true
							} else if (e.message.substring(0,5) == "Intl.") {
								test = zB5; isBlock = true
							} else if (e.name == "TypeError") {
								// 68-69 expected
								test = e.name+": "+ e.message
							} else {
								test = zB6; isBlock = true
							}
						}
					} else if (e.name == "ReferenceError") {
						if (test == "Big") {
							// 60-67
							test = e.name+": "+ e.message
						} else {
							test = zB1; isBlock = true
						}
					} else {
						if (e.name == "TypeError") {
							test = zB2; isBlock = true
						} else {
							test = zB3; isBlock = true
						}
					}
				} else {
					test = e.name+": "+ e.message
				}
				dom.err3=test; res.push(test)
			}
			//4
			try {test = eval("let a = 1_00_;")
			} catch(e) {
				test = e.name+": "+e.message; dom.err4=test; res.push(test)
			}
			//5
			try {
				test = new Intl.NumberFormat("en", {style:"unit", unit:"percent"}).format(1/2)
			} catch(e) {
				if (isFF) {
					if (e.name == "RangeError") {
						test = e.name+": "+e.message
					} else if (e.name == "ReferenceError") {
						test = zB1; isBlock = true
					} else if (e.name == "TypeError") {
						test = zB2; isBlock = true
					} else {
						test = zB3; isBlock = true
					}
				} else {
					test = e.name+": "+e.message
				}
				dom.err5=test; res.push(test)
			}
			output()
		}
		run()

	})
}

function get_fullscreen() {
	let r = ""
	try {
		if (document.mozFullScreenEnabled) {
			r = zE
		}	else {
			r = zD; dom.fsLeak = zNA
		}
	} catch(e) {
		r = "no: "+e.name; dom.fsLeak = zNA
	}
	dom.fsSupport = r
	return r
}

function get_line_scrollbar() {
	return new Promise(resolve => {

		let osW = "[Windows]",
			osWL = "[Windows or Linux]",
			osWM = "[Windows or Mac]",
			osWLM = "[Windows, Linux or Mac]",
			osL = "[Linux]",
			osLA = "[Linux or Android]",
			osLM = "[Linux or Mac]",
			osM = "[Mac]",
			osTBL = " [Linux]"+tb_green,
			os = "",
			sbZoom = ""

		let finalresolve = ""

		// scrollbar
		function run_scrollbar() {
			let t0 = performance.now()
			// recalc zoom/viewport
			get_zoom("fd")
			let vw = get_viewport("fd")
			// get width, remember it for later
			let w = (window.innerWidth-vw),
				wZoom = w

			// what I want to resolve for fd hash
			if (w > 0) {
				finalresolve = "not zero"
			} else {
				finalresolve = "zero"
			}

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
				} else if (jsZoom == 300) {
					if (w==6) {os=osWL}
					if (w==5) {os=osWM}
					if (w==4) {os=osL}
				} else if (jsZoom == 240) {
					if (w==7) {os=osWM}
					if (w==6) {os=osL}
					if (w==5) {os=osL}
				} else if (jsZoom == 200) {
					if (w==9) {os=osW}
					if (w==8) {os=osWLM}
					if (w==7) {os=osM}
					if (w==6) {os=osL}
				} else if (jsZoom == 170) {
					if (w==10) {os=osWL}
					if (w==8) {os=osM}
					if (w==7) {os=osL}
				} else if (jsZoom == 150) {
					if (w==12) {os=osW}
					if (w==11) {os=osW}
					if (w==10) {os=osLM}
					if (w==8) {os=osL}
				} else if (jsZoom == 133) {
					if (w==13) {os=osW}
					if (w==12) {os=osWL}
					if (w==11) {os=osM}
					if (w==9) {os=osL}
				} else if (jsZoom == 120) {
					if (w==15) {os=osW}
					if (w==14) {os=osWL}
					if (w==12) {os=osM}
					if (w==10) {os=osL}
				} else if (jsZoom == 110) {
					if (w==16) {os=osW}
					if (w==15) {os=osW}
					if (w==14) {os=osLM}
					if (w==11) {os=osL}
				} else if (jsZoom == 90) {
					if (w==19) {os=osW}
					if (w==18) {os=osL}
					if (w==17) {os=osM}
					if (w==16) {os=osM}
					if (w==13) {os=osL}
				} else if (jsZoom == 80) {
					if (w==21) {os=osW}
					if (w==20) {os=osL}
					if (w==19) {os=osM}
					if (w==15) {os=osL}
				} else if (jsZoom == 67) {
					if (w==26) {os=osW}
					if (w==25) {os=osW}
					if (w==24) {os=osL}
					if (w==23) {os=osM}
					if (w==22) {os=osM}
					if (w==18) {os=osL}
				} else if (jsZoom == 50) {
					if (w==34) {os=osW}
					if (w==32) {os=osL}
					if (w==30) {os=osM}
					if (w==24) {os=osL}
				} else if (jsZoom == 30) {
					if (w==57) {os=osW}
					if (w==56) {os=osW}
					if (w==54) {os=osL}
					if (w==50) {os=osM}
					if (w==40) {os=osL}
				}
				if (os != "") {
					// known
					os += " [known metric]"
				} else {
					// still unknown
					if (jsZoom !== 100) {
						// recalc scrollbar at 100% for final guess: not perfect
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
			if (jsZoom !== 100) {sbZoom=" at "+jsZoom+"% "}
			dom.fdScrollV = w+"px "+sbZoom+os
			// element scrollbar
			let eW = (100-dom.fdScroll.scrollWidth)
			if (jsZoom == 100) {
				eW += "px" + (eW == w ? "" : sb+"[!= viewport scrollbar]"+sc)
			}
			dom.fdScrollE.innerHTML = eW
			// perf
			if (logPerf) {debug_log("scrollbar [fd]",t0)}
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
					strFont = sb+"[document fonts are disabled]"+sc
				}
			} catch(e) {
				strFont = sb+"[font property is blocked]" +sc
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
					method = "clientrect"
				} catch(err) {
					method = "none"
				}
			}

			// simulate
			let simulate = 10
			if (simulate == 1) {
				// no clientrect
				method = "none"
			} else if (simulate == 2) {
				// no font property
				strFont = sb+"[font property is blocked]"+sc
				fontProp = false
			} else if (simulate == 3) {
				// doc fonts blocked
				strFont = sb+"[document fonts are disabled]"+sc
				isTNR = false
			} else if (simulate == 4) {
				// 1+2
				method = "none"
				strFont = sb+"[font property is blocked]"+sc
				fontProp = false
			} else if (simulate == 5) {
				// 1+3
				method = "none"
				strFont = sb+"[document fonts are disabled]"+sc
				isTNR = false
			}

			// build
			if (method !== "none") {
				// trim
				if (lh.substr(-2) == "px") {lh = lh.slice(0, -2)}
				// check font
				if (strFont !== "") {
					os = strFont
				} else if (lh == "19.2" || lh == "19.2000") {
					// TB DESKTOP: 19.2 seems TB unique any-zoom/any-platform
					os = tb_green
					isTB = true; debug_page("tb"," css line height = 19.2")
				} else {
					// isTNR + not 19.2
					// WINDOWS / LINUX: some known metrics
					if (jsZoom == 100) {
						if (lh=="20") {os=osW}
						if (lh=="19") {os=osL}
						if (lh=="18") {os=osW}
						if (lh=="17") {os=osL}
					} else if (jsZoom == 300) {
						if (lh=="19") {os=osW}
						if (lh=="18.6667") {os=osW}
						if (lh=="18") {os=osL}
						if (lh=="17.6667") {os=osL}
					} else if (jsZoom == 240) {
						if (lh=="19.1667") {os=osW}
						if (lh=="19") {os=osTBL}
						if (lh=="18.3333") {os=osWL}
						if (lh=="17.5") {os=osL}
					} else if (jsZoom == 200) {
						if (lh=="19") {os=osW}
						if (lh=="18") {os=osL}
					} else if (jsZoom == 170) {
						if (lh=="19.25") {os=osW}
						if (lh=="18.9") {os=osTBL}
						if (lh=="18.6667") {os=osW}
						if (lh=="18.0833") {os=osL}
						if (lh=="17.5") {os=osL}
					} else if (jsZoom == 150) {
						if (lh=="20") {os=osW}
						if (lh=="18.6667") {os=osWL}
						if (lh=="17.3333") {os=osL}
					} else if (jsZoom == 133) {
						if (lh=="19.5") {os=osW}
						if (lh=="18.9") {os=osTBL}
						if (lh=="18") {os=osL}
						if (lh=="18.75") {os=osW}
					} else if (jsZoom == 120) {
						if (lh=="20") {os=osW}
						if (lh=="19.1667") {os=osL}
						if (lh=="19") {os=osTBL}
						if (lh=="18.3333") {os=osW}
						if (lh=="17.5") {os=osL}
					} else if (jsZoom == 110) {
						if (lh=="19.25") {os=osW}
						if (lh=="18.7") {os=osTBL}
						if (lh=="18.3333") {os=osL}
						if (lh=="17.4167") {os=osL}
					} else if (jsZoom == 90) {
						if (lh=="20.1") {os=osW}
						if (lh=="18.9833") {os=osWL}
						if (lh=="18.7667") {os=osTBL}
						if (lh=="16.75") {os=osL}
					} else if (jsZoom == 80) {
						if (lh=="20") {os=osW}
						if (lh=="19.5") {os=osTBL}
						if (lh=="18.75") {os=osWL}
					} else if (jsZoom == 67) {
						if (lh=="21") {os=osW}
						if (lh=="19.8") {os=osTBL}
						if (lh=="19.5") {os=osWL}
						if (lh=="18") {os=osL}
					} else if (jsZoom == 50) {
						if (lh=="22") {os=osW}
						if (lh=="20") {os=osWL}
						if (lh=="18") {os=osL}
					} else if (jsZoom == 30) {
						if (lh=="20") {os=osWL}
						if (lh=="26.6667") {os=osW}
					}
				}
				// MAC
				if (os == "") {
				/*  unique: .0167 .05 .0833 .1833 .35 .4333 .6833 .8333 .85
				not unique: .7667 .6667 (but unique at those zoom values)
				hackernews: .5167 (can't repro) */
					// not necessarily unique given various dpr e.g. android
					// also RFP affects this on android
					let lhDec = (lh+"").split(".")[1]
					if (lhDec=="0167" | lhDec=="05" | lhDec=="0833" | lhDec=="1833" | lhDec=="35" | lhDec=="4333" | lhDec=="6833"
						| lhDec=="8333" | lhDec=="85" | lhDec=="7667" | lhDec=="6667" | lhDec=="5167") {os=osM}
				}
				// ANDROID
				if (os == "") {
					// ToDo: css line height: Android affected by devicePixelRatio
					// line height affected by RFP
				}
				if (os == "") {
					// guess
					os = osLA+" [logical guess]"
				} else {
					if (isTNR && fontProp) {
						// known
						os += " [known metric]"
					}
				}
			}
			// output
			if (method == "none") {
				if (fontProp) {
					dom.fdLH.innerHTML = sb+"[clientrect blocked" + (isTNR ? strFont : " | document fonts disabled")  + "]"+sc 
				} else {
					dom.fdLH.innerHTML = sb+"[clientrect + font properties blocked]"+sc
				}
			} else {
				dom.fdLH.innerHTML = lh + "px "+ sbZoom + os + s3+"["+method+"]"+sc
			}
			if (logPerf) {debug_log("css line height [fd]",t0)}
		}

		run_scrollbar()
		run_lineheight()
		return resolve("scrollbar: " + finalresolve)
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
			fdMath1 = "", // strings for browser/os
			fdMath6 = "",
			strNew = zNEW + (runS ? zSIM : ""),
			scriptBlock = false

		function get_hashes() {
			let h1 = "", h6 = "", r = ""
			// 1st
			let list = ['1e251','1e140','1e12','1e130','1e272','1e0','1e284','1e75'],
				res = []
			for (let i=0; i < list.length; i++) {
				try {
					r = Math.cos(list[i])
				} catch(e) {
					r = (e.name == "ReferenceError" ? zB1 :zB2)
					scriptBlock = true
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
				r = (e.name == "ReferenceError" ? zB1 :zB2)
				scriptBlock = true
			}
			h6 = r
			x=1
			try {
				r = Math.exp(x) - 1 // expm1(1)
			} catch(e) {
				r = (e.name == "ReferenceError" ? zB1 :zB2)
				scriptBlock = true
			}
			h6 += "-"+r
			x = 1
			try {
				y = Math.exp(x); r = (y - 1 / y) / 2 // sinh(1)
			} catch(e) {
				r = (e.name == "ReferenceError" ? zB1 :zB2)
				scriptBlock = true
			}
			h6 += "-"+r
			// hashes
			m1hash = sha1(h1)
			m6hash = sha1(h6)
			mchash = sha1(h1+"-"+h6)
			// sim
			if (runS) {
				m1hash = sha1("a"), mchash = sha1("b") // emca1
				//m6hash = sha1("c"), mchash = sha1("d") // emca6
				//m1hash = sha1("e"), m6hash = sha1("f"), mchash = sha1("g") // both
			}
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
			// browser
			if (m6 == "1" | m6 == "3") {
				fdMath6=zFF
			} else if (m6 == "2") {
				fdMath6=zFF+" [32-bit]"
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
					fdMath6=zFF+" [64-bit]"
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
				fdMath6=zFF+" [64-bit]"
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
				// new
				let mc = ""
				if (m1 == "") {m1hash += strNew} else {m1hash += s3+" ["+m1+"]"+sc}
				if (m6 == "") {m6hash += strNew} else {m6hash += s3+" ["+m6+"]"+sc}
				if (m1 !== "" && m6 !== "") {mc = s3 + "[" + m1+m6 + "]" + sc; mchash += mc} else {mchash += strNew}
				if (scriptBlock) {
					strNew = "script blocking detected"+ sb +"[see math details]"+sc + (runS ? zSIM : "")
				} else {
					strNew = mchash
					dom.fdMathOS.setAttribute("class", "c mono")
				}
				// runS: alternate new vs os-check (runS sets isOS ="")
				if (runS) {if (stateSIM) {fdMath1 = "Windows"}}
				// os-check
				if (fdMath1 !== "") {
					let check = fdMath1.replace(" [32-bit]","")
					check = check.replace(" [64-bit]","")
					check = check.toLowerCase()
					if (isOS !== check) {fdMath1 += sb+"[!= widget]"+sc + (runS ? zSIM : "")}
				}
				// output
				dom.fdMathOS.innerHTML = (fdMath1 == "" ? strNew : fdMath1 + mc)
				dom.fdMath.innerHTML = (fdMath6 == "" ? strNew : fdMath6)
			}
			// output hashes
			dom.math1hash.innerHTML = m1hash
			dom.math6hash.innerHTML = m6hash
			dom.mathhash.innerHTML = mchash
			// perf
			if (logPerf) {debug_log("math [fd]", t0, gt0)}
			return resolve("math: " + mchash.substring(0,40))
		}
		get_hashes()
		if (isFF) {
			get_codes()
			build_output()
			output()
		} else {
			dom.math1hash = m1hash
			dom.math6hash = m6hash
			dom.mathhash = mchash
			dom.fdMath = mchash
			return resolve("math: " + mchash)
		}
	})
}

function get_mm_metrics(runtype) {
	let t0 = performance.now(),
		count = 0
	// perf
	function perf() {
		if (count == 4) {
			let str = (runtype == "load" ? "" : "ignore")
			if (logPerf) {debug_log("mm various [screen]",t0, str)}
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
									"between "+minValue+" and "+maxValue
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
				if (window.matchMedia("("+prefix+": "+valueToTest+suffix+")").matches){
					return Promise.resolve(searchValue.isEqual)
				}
				else if (window.matchMedia("("+maxPrefix+": "+valueToTest+suffix+")").matches){
					return Promise.resolve(searchValue.isSmaller)
				}
				else {
					return Promise.resolve(searchValue.isBigger)
				}
			} catch(e) {
				let reason = (e.name == "ReferenceError" ? zB1 : zB2)
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
			if (window.matchMedia("(-moz-device-orientation:"+l+")").matches) return l
			if (window.matchMedia("(-moz-device-orientation:"+p+")").matches) return p
		})()
	} catch(e) {o1 = (e.name == "ReferenceError" ? zB1 : zB2)}
	try {
		o2 = (function() {
			if (window.matchMedia(q+p+")").matches) return p
			if (window.matchMedia(q+l+")").matches) return l
		})()
	} catch(e) {o3 = (e.name == "ReferenceError" ? zB1 : zB2)}
	try {
		o3 = (function() {
			if (window.matchMedia("("+a+":1/1)").matches) return s
			if (window.matchMedia("(min-"+a+":10000/9999)").matches) return l
			if (window.matchMedia("(max-"+a+":9999/10000)").matches) return p
		})()
	} catch(e) {o3 = (e.name == "ReferenceError" ? zB1 : zB2)}
	try {
		o4 = (function() {
			if (window.matchMedia("(device-"+a+":1/1)").matches) return s
			if (window.matchMedia("(min-device-"+a+":10000/9999)").matches) return l
			if (window.matchMedia("(max-device-"+a+":9999/10000)").matches) return p
		})()
	} catch(e) {o4 = (e.name == "ReferenceError" ? zB1 : zB2)}
	dom.mmO.innerHTML = o1+" | "+o2+" | "+o3+" | "+o4
	// screen*
	try {
		dom.ScrOrient.innerHTML = (function() {
			let r = screen.orientation.type+" | "+screen.mozOrientation+" | "+screen.orientation.angle
			r = r.replace(/landscape-secondary/g, "upside down")
			r = r.replace(/-primary/g, "")
			r = r.replace(/-secondary/g, "")
			r += (r == "landscape | landscape | 0" ? rfp_green : rfp_red)
			return r
		})()
	} catch(e) {
		dom.ScrOrient.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
	}
	// display-mode
	try {
		dom.mmDM = (function() {
			q="(display-mode:"
			if (window.matchMedia(q+"fullscreen)").matches) return "fullscreen"
			if (window.matchMedia(q+"browser)").matches) return "browser"
			if (window.matchMedia(q+"minimal-ui)").matches) return "minimal-ui"
			if (window.matchMedia(q+p+")").matches) return p
		})()
	} catch(e) {
		dom.mmDM.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
	}
	// perf
	let str = (runtype == "load" ? "" : "ignore")
	if (logPerf) {debug_log("orientation [screen]",t0, str)}
}

function get_pbmode() {
	let t0 = performance.now()
	function output(r) {
		dom.IsPBMode = r
		if (logPerf) {debug_log("pbmode [screen]",t0)}
	}
	try {
		let db = indexedDB.open("PB")
		db.onerror = function() {output("true")}
		db.onsuccess = function() {output("false")}
	} catch(e) {
		output("unknown: "+e.name)
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
			extra = "n",
			nob = "[no branding detected]",
			el = dom.branding

		// output
		function output() {
			// set isChannel
			isChannel = channel
			// output
			dom.fdResource.innerHTML = browser + " " + result
			if (logPerf) {debug_log("resources [fd]",t0)}
			return resolve("resources: " + browser+" "+wFF+"x"+hFF+" "+extra)
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
				result = branding+" - "+channel+" ["+wFF+" x "+hFF+"]"
			} else if (hFF > 0) {
				//new
				result = "["+wFF+" x "+hFF+"]" + zNEW + (runS ? zSIM : "")
			} else {
				//none: red=desktop orange=android
				if (isVer > 59) {
					result = (isOS == "android" ? s3 : sb) +nob+sc
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
				result = s3+"["+channel+"]"+sc+" ["+wFF+" x "+hFF+"]"
				debug_page("tb","    css branding = 270 x 48 px = alpha")
			} else if (wFF == 336 && hFF == 48) {
				if (isVer > 77) {
					//78+ therefore release
					channel = "release"
					result = s3+"["+channel+"]"+sc+" ["+wFF+" x "+hFF+"]"
				} else {
					//idk
					result = " ["+wFF+" x "+hFF+"]"
				}
			} else if (wFF == 300 && hFF == 38) {
				if (isVer > 67 && isVer < 78) {
					//68+ therefore release
					channel = "release"
					result = s3+"["+channel+"]"+sc+" ["+wFF+" x "+hFF+"]"
				} else {
					//idk
					result = " ["+wFF+" x "+hFF+"]"
				}
			} else if (hFF > 0) {
				//new
				result = "["+wFF+" x "+hFF+"]" + zNEW + (runS ? zSIM : "")
			} else {
				//none: red=desktop orange=android
				if (isVer > 59) {
					result = (isOS == "android" ? s3 : sb) +nob+sc
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
					// TB
					if (wTB > 0) {
						isTB = true; debug_page("tb","     resource:// = tor-watermark.png")
						extra = "y"
					}
					function check_TB2() {
						if (isTB2 !== "") {
							clearInterval(checking)
							extra += isTB2 // "", "n" or "y"
							if (isTB) {
								build_TB(wFF, hFF)
								if (isOS !== "android" && wTB < 1) {
									result += sb+"[missing tor-watermark.png]"+sc
								}
							}
							// now we output
							output()
						}
					}
					// wait for isTB2
					let checking = setInterval(check_TB2, 10)
				}
			})
			document.body.removeChild(imgA)
		}
		run()
	})
}

function get_screen_metrics(runtype) {
	let t0 = performance.now()
	// measure
	let w1 = screen.width, h1 = screen.height,
		w2 = screen.availWidth, h2 = screen.availHeight,
		w3 = window.outerWidth, h3 = window.outerHeight,
		w = window.innerWidth, h = window.innerHeight,
		p1 = screen.left, p2 = screen.top,
		p3 = screen.availLeft, p4 = screen.availTop,
		p5 = window.screenX, p6 = window.screenY,
		p7 = window.mozInnerScreenX, p8 = window.mozInnerScreenY
	dom.ScrRes = w1+" x "+h1+" ("+p1+","+p2+")"
	dom.ScrAvail = w2+" x "+h2+" ("+p3+","+p4+")"
	dom.WndOut = w3+" x "+h3+" ("+p5+","+p6+")"
	// RFP
	if (isFF) {
		// size
		let m1 = true, m2 = true, r = "", c = "#ff4f4f"
		if (w1+"x"+h1 !== w2+"x"+h2) {m1 = false}
		else if (w2+"x"+h2 !== w3+"x"+h3) {m1 = false}
		else if (w3+"x"+h3 !== w+"x"+h) {m1 = false}
		r = (m1 ? sg : sb) + "[sizes match x4]"+sc
		// pos
		let items = [p1,p2,p3,p4,p5,p6,p7,p8]
		for (let i=0; i < items.length; i++) {if (items[i] != 0) {m2 = false}}
		r += " +" + (m2 ? sg : sb) + "[0,0 x4]"+sc
		dom.match.innerHTML = r
		// color
		if (m1 && m2) {c = "#8cdc8c"}
		items = document.getElementsByClassName("group")
		for (let i=0; i < items.length; i++) {items[i].style.color = c}
	}
	// update zoom/viewport except on load
	if (runtype !== "load") {
		get_zoom("screen")
		get_viewport("screen")
	}
	// inner
	let strTemp = w+" x "+h+" ("+p7+","+p8+")"
	if (isOS == "android") {
		dom.WndIn = strTemp
	} else {
		// LB+NW
		if (isFF == true) {
			if (jsZoom == 100) {strTemp += return_lb_nw(w,h)} else {strTemp += "<br>"+lb_orange}
		}
		dom.WndIn.innerHTML = strTemp
		if (logExtra) {
			let strC = (runtype.type == undefined ? runtype : runtype.type)
			console.log("C [must follow zoom]: ", strC, ": screen_metrics")
		}
	}
	// the rest
	try {dom.fsState = window.fullScreen} catch(e) {dom.fsState.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)}
	get_orientation(runtype)
	get_mm_metrics(runtype)
	if (logExtra) {
		let strD = (runtype.type == undefined ? runtype : runtype.type)
		console.log("D [must follow zoom]: ", strD, ": mm_metrics, orientation, fullscreen")
	}
}

function get_ua_nav() {
	let res = [],
		str = "",
		go = false,
		lies = 0,
		t0 = performance.now()
	// FF78+ only
	if (isFF && isVer > 77) {go = true}

	// EASY
	function get_property(id, property, good) {
		str = ""
		if (go && runS) {
			// simulate lies
			if (id == "01") {str = "MoZilla"} // case
			if (id == "02") {str = " Netscape"} // leading space
			if (id == "03") {str = "Gecko "} // trailing space
			if (id == "07") {str = ""} // empty string: unexpected
			if (id == "08") {str = undefined} // undefined
			if (id == "09") {str = " "} // single space
			if (id == "10") {str = "undefined"} // undefined string
		} else {
			try {str = navigator[property]} catch(e) {str = (e.name == "ReferenceError" ? zB1 : zB2)}
		}
		if (str == "") {str = "empty string"}
		if (str == "undefined") {str = "undefined string"}
		if (str == undefined) {str = "undefined value"}
		// stash
		res.push(id+": "+str)
		document.getElementById("nUA"+id).innerHTML = str
		// show/hide vendor*
		if (id == "09" || id == "10") {
			document.getElementById("togUA"+id).style.display = (str == good ? "none" : "table-row")
		}
		// isBS
		if (go) {
			if (str !== good) {str = sb+"&#9654"+sc; lies++} else {str = ""}
		} else {
			str = ""
		}
		document.getElementById("UA"+id).innerHTML = property + str
	}
	get_property("01", "appCodeName", "Mozilla")
	get_property("02", "appName", "Netscape")
	get_property("03", "product", "Gecko")
	get_property("07", "buildID", "20181001000000")
	get_property("08", "productSub", "20100101")
	get_property("09", "vendor", "empty string")
	get_property("10", "vendorSub", "empty string")

	// arrows
	function addArrow(id, state) {
		let title = ""
		if (id == "00") {title = "userAgent"}
		if (id == "04") {title = "appVersion"}
		if (id == "05") {title = "oscpu"}
		if (id == "06") {title = "platform"}
		if (state) {
			if (isPartial == false && go == true) {lies++}
			title += (isPartial ? sn : sb) +"&#9654"+sc
		}
		document.getElementById("UA"+id).innerHTML = title
	}

	// MORE COMPLEX: per OS
	// https://dxr.mozilla.org/mozilla-central/source/browser/components/resistfingerprinting/test/browser/browser_navigator.js
	// ToDo: check I have the right 78 info since original code was done for 68
		// note: I'm not actually checking if RFP is correct, I'm checking for lies
		// for some lies I can then check if RFP is on and discard: such as the version number
	let pre = "",
		spoof = false,
		match = false,
		myOS = isOS,
		isPartial = false

	// ToDo: if isOS =""
		// currently only set by widgets test. can we fall strengthen it (e.g. also set it during math)
	if (isOS == "" && go) {
		// ToDo: if runS = isOS = ""
			// isPartial => output yellow arrows to indicates we only did a partial check
			// add yellow arrow info text somewhere?
			// we can still detect some BS by checking all possibles
			// i.e if oscpu = "undefined" or script blocked, or contains gibberish

		// toggle these to test partial
		//isPartial = true
		myOS = "windows" // use your real OS
	}

	// appVersion
	try {str = navigator.appVersion} catch(e) {str = (e.name == "ReferenceError" ? zB1 : zB2)}
	// simulate lies
	if (go && runS) {str = "5.0 (Windows NT 6.1; Win64; x64) AppleWebKit BLAH BLAH"}
	if (str == "") {str = "empty string"}
	if (str == "undefined") {str = "undefined string"}
	if (str == undefined) {str = "undefined value"}
	res.push("04: "+str)
	dom.nUA04.innerHTML = str
	if (go && str.substring(0,5) !== "script") {
		spoof = false
		if (myOS == "windows") {spoof = (str !== "5.0 (Windows)")}
		if (myOS == "mac") {spoof = (str !== "5.0 (Macintosh)")}
		if (myOS == "linux") {spoof = (str !== "5.0 (X11)")}
		if (myOS == "android") {
			// tighten this up to be more specific
			if (str.substring(0,13) == "5.0 (Android ") {match = true}
			spoof = !match
		}
		if (spoof || isPartial) {addArrow("04", true)}
	} else {
		addArrow("04", false)
	}

	// platform
	// ToDo: specific linux distro strings?
	// ToDo: android: `Linux ${OSArch}` <-- any others
	try {str = navigator.platform} catch(e) {str = (e.name == "ReferenceError" ? zB1 : zB2)}
	// simulate lies
	if (go && runS) {str = "win32"}
	if (str == "") {str = "empty string"}
	if (str == "undefined") {str = "undefined string"}
	if (str == undefined) {str = "undefined value"}
	res.push("06: "+str)
	dom.nUA06.innerHTML = str
	if (go && str.substring(0,5) !== "script") {
		spoof = false
		match = false
		if (myOS == "windows") {spoof = (str !== "Win32")}
		if (myOS == "mac") {spoof = (str !== "MacIntel")}
		if (myOS == "linux") {
			if (str == "Linux i686") {match = true}
			else if (str == "Linux i686 on x86_64") {match = true}
			else if (str == "Linux x86_64") {match = true}
			spoof = !match
		}
		if (myOS == "android") {
			if (str.substring(0,10) == "Linux armv") {match = true}
			if (str.substring(0,11) == "Linux aarch") {match = true}
			spoof = !match
		}
		if (spoof || isPartial) {addArrow("06", true)}
	} else {
		addArrow("06", false)
	}

	// oscpu
	try {str = navigator.oscpu} catch(e) {str = (e.name == "ReferenceError" ? zB1 : zB2)}
	// simulate lies
	if (go && runS) {str = "undefined"}
	if (str == "") {str = "empty string"}
	if (str == "undefined") {str = "undefined string"}
	if (str == undefined) {str = "undefined value"}
	res.push("05: "+str)
	dom.nUA05.innerHTML = str
	if (go && str.substring(0,5) !== "script") {
		spoof = false
		if (myOS == "windows") {
			pre = "Windows NT "
			// app64 + win64
			if (str == pre+"10.0; Win64; x64") {match = true}
			else if (str == pre+"6.3; Win64; x64") {match = true}
			else if (str == pre+"6.1; Win64; x64") {match = true}
			// app32 + win64
			else if (str == pre+"10.0; WOW64") {match = true}
			else if (str == pre+"6.3; WOW64") {match = true}
			else if (str == pre+"6.1; WOW64") {match = true}
			// app32 + win32
			else if (str == pre+"10.0") {match = true}
			else if (str == pre+"6.3") {match = true}
			else if (str == pre+"6.1") {match = true}
			spoof = !match
		}
		if (myOS == "linux") {
			// ToDo: specific linux distro strings?
			pre = "Linux "
			if (str == pre+"i686") {match = true}
			else if (str == pre+"i686 on x86_64") {match = true}
			else if (str == pre+"x86_64") {match = true}
			spoof = !match
		}
		if (myOS == "mac") {
			if (str.substring(0,14) == "Intel Mac OS X") {match = true}
			spoof = !match
		}
		if (myOS == "android") {
			pre = "Linux "
			if (str.substring(0,10) == pre+"armv") {match = true}
			if (str.substring(0,11) == pre+"aarch") {match = true}
			spoof = !match
		}
		if (spoof || isPartial) {addArrow("05", true)}
	} else {
		addArrow("05", false)
	}

	// userAgent
		// ToDo: userAgent lies: ways this can be inconsistent
		// 1: if full ua = not consistent with known os etc
		// 2: if full ua = not the same as individual parts
		// 3: the syntax/formula doesn't match
		// 4: if version doesn't match isVer (allow for isRFP and 78)
			// note: allow for + symbol on verNo (make global)
	try{str = navigator.userAgent} catch(e) {str = (e.name == "ReferenceError" ? zB1 : zB2)}
	if (str == "") {str = "empty string"}
	if (str == "undefined") {str = "undefined string"}
	if (str == undefined) {str = "undefined value"}
	res.push("00: "+str)
	dom.nUA00.innerHTML = str

	// hash
	res.sort(Intl.Collator("en-US").compare)
	dom.nUAinitial = sha1(res.join())

	// show
	let isBS = false
	if (lies > 0) {
		lies += " pinocchio" + (lies > 1 ? "s": "")
		dom.UA11.innerHTML = sb+"absolute BS detected "+" &#9654"+sc
		dom.UA12.innerHTML = sb+ lies + sc + " [based only on feature detection]"
		dom.togUA11.style.display = "table-row"
		isBS = true
	} else {
		dom.togUA11.style.display = "none"
	}

	// ToDo: section hash to also account for worker results
		// note: use a boolean for isBS for stability
		// logic:
		// if no BS + no worker = use original
		// if no BS + worker matches = use original
		// if no BS + worker doesn't match = use worker
		// if BS + no worker - use isBS
		// if BS + worker matches = use isBS
		// if BS + worker doesn't matches = use worker
	if (isBS) {
		section_info("ua", t0, gt0, ["ua: lies"])
	} else {
		section_info("ua", t0, gt0, res)
	}
}

function get_ua_nav_checks() {
	// control
	let list = ['userAgent','appCodeName','appName','product','appVersion','platform'],
		res = [],
		r = ""
	for (let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = (e.name == "ReferenceError" ? zB1 : zB2)}
		if (r == "") {r = "undefined"}
		if (r == undefined && isFF) {r = zB3}
		res.push((i).toString().padStart(2,"0")+": "+r)
	}
	let control = sha1(res.join())

	function update(data) {
		// compare shared worker to control: output diffs
		let target = "", output = ""
		for (let i=0; i < res.length; i++) {
			if (res[i] !== data[i]) {
				output = data[i].slice(4, data[i].length)
				target = data[i].substring(0,2)
				// match to correct element: nUAxx
				if (target == "05") {target = "06"}
				target = document.getElementById("nUA"+target)
				// append
				target.innerHTML += "<br>" + sb.trim() + output + sc
			}
		}
	}

	function exit(s) {
		dom.sectionUA2.innerHTML = s //web
		dom.sectionUA3.innerHTML = s //shared
		dom.sectionUA4.innerHTML = s //nested
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
		let el2 = dom.sectionUA2, test2 = ""
		try {
			let workernav = new Worker("js/worker_ua.js")
			el2.innerHTML = zF
			workernav.addEventListener("message", function(e) {
				test2 = sha1((e.data).join())
				el2.innerHTML = test2 + (test2 == control ? match_green : match_red)
				workernav.terminate
			}, false)
			workernav.postMessage(isFF)
		} catch(e) {
			el2.innerHTML = zF
		}
		// shared
		let el3 = dom.sectionUA3, test3 = ""
		try {
			let sharednav = new SharedWorker("js/workershared_ua.js")
			el3.innerHTML = zF
			sharednav.port.addEventListener("message", function(e) {
				test3 = sha1((e.data).join())
				el3.innerHTML = test3 + (test3 == control ? match_green : match_red)
				sharednav.port.close()
				if (test3 !== control) {
					update(e.data)
				}
			}, false)
			sharednav.port.start()
			sharednav.port.postMessage(isFF)
		} catch(e) {
			el3.innerHTML = zF
		}
		// nested
		dom.sectionUA4.innerHTML = note_ttc
	}

	// service
	let el5 = dom.sectionUA5, test5 = ""
	if (isFile) {
		el5.innerHTML = zNA
	} else if (isSecure) {
		if ("serviceWorker" in navigator) {
			// assume failure
			el5.innerHTML = zF + " [A: assumed]"
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
						test5 = sha1((event.data.msg).join())
						el5.innerHTML = test5 + (test5 == control ? match_green : match_red)
						// unregister & close
						swr.unregister().then(function(boolean) {})
						channel.close()
					})
				} else {
					el5.innerHTML = zF + " [B: not swr.installing]"
				}
			},
			function(e) {
				el5.innerHTML = zF + " [C: not registering]: "  + e.message
			})
		} else {
			el5.innerHTML = zF + " [D: no sw]"
		}
	}
}

function get_version() {
	return new Promise(resolve => {
		let go = true,
			verNo = "",
			isNew = false,
			alt0 = sb+" [fallback test ",
			alt1 = alt0 +"1]"+sc,
			alt2 = alt0 +"2]"+sc,
			alt3 = alt0 +"3]"+sc,
			t0 = performance.now()
		function output(){
			// set isVer
			if (isVer == "") {
				isVer = verNo.replace(/\D/g,',')
				let start = isVer.indexOf(",")
				if (start !== -1) {isVer = isVer.substring(0,start)}
			}
			dom.fdVersion.innerHTML = verNo + (isNew ? zNEW : "") + (runS ? zSIM : "")
			if (logPerf) {debug_log("version [fd]",t0)}
			return resolve("version: " + verNo)
		}
		// use isErr
		if (isErr == "X") { verNo = "59 or lower"
		} else if (isErr == "e09e") { v67minus()
		} else if (isErr == "9be3") { v69minus()
		} else if (isErr == "1492") { verNo = "70"
		} else if (isErr == "7121") { verNo = "71"
		// 74+: 1259822: pref alters err2: now 2 outcomes per bucket
		// javascript.options.property_error_message_fix
		} else if (isErr == "fa8e" || isErr == "fb19") { v74minus()
		} else if (isErr == "214f" || isErr == "5186") { v75plus()
		} else if (isErr == "0dc5" || isErr == "b75b") { v75plus()
		} else {
			// new: cascade down all tests: this helps covers the error
			// hash being meddled with: e.g. aopr script blocking
			isNew = true
			v75plus()
		}
		// run
		function v75plus() {
			// 83: 1667094
			if (go) {
				try {
					let obj83 = {exec() {return function(){}}}
					let test83 = RegExp.prototype.test.call(obj83, "")
					verNo = "83+"; go = false
				} catch(e) {}
			}
			// 82: 1655947
			if (go) {
				let test82 = ((Math.floor((Date.parse("21 Jul 20") - Date.parse("20 Jul 20"))))/86400000)
				if (test82 == 1) {verNo = "82"; go = false}
			}
			// 81: 1650607
			if (go) {
				try {
					let file81 = new File(["bits"], "a/b.txt")
					if (file81.name == "a/b.txt") {verNo = "81"; go = false}
				} catch(e) {}
			}
			// 80: 1651732
			if (go) {
				let obj80 = {[Symbol.toPrimitive]: () => Symbol()}
				let proxy80 = (new Proxy({},{get: (obj80, prop, proxy80) => prop}))
				try {
					for (let i = 0; i < 11; i++) {if (typeof proxy80[obj80] == 'symbol') {}}
					verNo = "80"; go = false
				} catch (e) {}
			}
			//79: 1644878
			if (go) {
				try {
					Map.prototype.entries.call(true)
				} catch(e) {
					if ((e.message).substring(0,3) == "ent") {verNo = "79"; go = false}
				}
			}
			//78: 1589095
			if (go) {
				try {
					let test78a = new Intl.ListFormat(undefined,{style: 'long', type: 'unit'}).format(['a','b','c'])
					verNo = "78"; go = false
				} catch(e) {}
			}
			//78: 1633836
			if (go) {
				try {
					let test78 = new Intl.NumberFormat(undefined, {style: "unit", unit: "percent"}).format(1/2)
					verNo = "78" + alt1; go = false
				} catch(e) {}
			}
			//78: 1634135
			if (go) {
				try {
					let regex78b = new RegExp('b')
					if (regex78b.dotAll == false) {verNo = "78" + alt2; go = false}
				} catch(e) {}
			}
			//77: 1627285
			if (go) {if (isNaN(new DOMRect(0, 0, NaN, NaN).top)) {verNo = "77"; go = false}}
			//76: 1608010
			if (go) {if (test76.validity.rangeOverflow) {} else {verNo = "76"; go = false}}
			//75: 1615600
			if (isNew && go) {
				try {let test75 = BigInt(2.5)} catch(e) {
					if (e.message.substring(0,3) == "2.5") {verNo = "75"} else {v74minus()}
				}
			} else if (go) {verNo = "75"}
		}
		function v74minus () {
			//74: 1605835
			if (go) {try {eval("let t = ({ 1n: 1 })"); verNo = "74"; go = false;} catch(e) {}}
			//73: 1605803
			if (go) {if (getComputedStyle(dom.test73).content == "normal") {verNo = "73"; go = false} else {}}
			//new
			if (isNew && go) {
				//72: 1589072
				try {let test72 = eval('let a = 100_00_;')} catch(e) {
					if (e.message.substring(0,6) == "unders") {verNo = "72"; go = false}
				}
				//71: 1575980
				if (go) {
					try {
						let test71 = new StaticRange()
					} catch(e) {
						if (e.name == "TypeError" && e.message.substring(0,4) == "Stat") {verNo = "71"; go = false}
					}
				}
				//70: 1435818
				if (go) {
					try {eval("let t = 1_050"); verNo = "70"} catch(e) {v69minus()}
				}
			} else if (go) {verNo = "72"}
		}
		function v69minus() {
			//69: 1558387
			if (go) {try {let test69 = new DOMError('a'); verNo = "68"} catch(e) {verNo = "69"; go = false}}
			if (isNew && go) {
				//68: 1548773
				if (dom.test68.typeMustMatch == false) {v67minus()} else {verNo = "68"}
			} else if (go) {verNo = "68"}
		}
		function v67minus() {
			//67: 1531830
			if (go) {if (!Symbol.hasOwnProperty('matchAll')) {} else {verNo="67"; go = false}}
			//66
			if (go) {
				try {
					let txt = new TextEncoder(), utf8 = new Uint8Array(1)
					let test66 = txt.encodeInto("a", utf8)
					verNo="66"; go = false
				} catch(e) {}
			}
			//65
			if (go) {
				try {
					let test65 = new Intl.RelativeTimeFormat("en",{style:"long"}); verNo="65"; go = false
				} catch(e) {}
			}
			//64
			if (go) {if (window.screenLeft == undefined){} else {verNo="64"; go = false}}
			//63
			if (go) {if (Symbol.for(`a`).description == "a") {verNo="63"; go = false}}
			//62
			if (go) {
				console.time("v62")
				try {console.timeLog("v62"); verNo="62"; go = false} catch(e) {}
				console.timeEnd("v62")
			}
			//61
			if (go) {try {let test61 = (" a").trimStart(); verNo="61"; go = false} catch(e) {}}
			//60
			if (go) {
				try {(Object.getOwnPropertyDescriptor(Document.prototype, "body")
					|| Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "body")).get.call((new DOMParser).parseFromString(
						"<html xmlns='http://www.w3.org/1999/xhtml'><body/></html>","application/xhtml+xml")) !== null
					verNo = "60"
				} catch(e) {
					verNo = "59 or lower"
				}
			}
		}
		output()
	})
}

function get_viewport(runtype) {
	let e=document.createElement("div")
	e.style.cssText="position:fixed;top:0;left:0;bottom:0;right:0;"
	document.documentElement.insertBefore(e,document.documentElement.firstChild)
	let vw=e.offsetWidth,
		vh=e.offsetHeight
	document.documentElement.removeChild(e)
	dom.Viewport = vw+" x "+vh

	if (logExtra) {console.log("B [must follow zoom]: ", runtype, ": viewport")}

	// get viewport height once on first load
	// this s/be with toolbar visible (not FS)
	if (avh == "") {avh = vh}
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
			let el = document.getElementById("widget"+i)
			try {
				font = getComputedStyle(el).getPropertyValue("font-family")
			} catch(e) {font = "unknown"}
			try {
				size = getComputedStyle(el).getPropertyValue("font-size")
			} catch(e) {size = "unknown"}
			if (runS) {
				//if (i == 1) {font = "-apple-system"; size="11px"} // font + size
				//if (i == 4) {font = "-apple-system"} // font
				if (i == 2) {size="13px"} // size
			}
			output = font+", "+size
			// 1-7: compare to 1
			if (i < 7) {
				combined.push(list[i].padStart(14) + ": "+output)
				if (i == 0) {size0 = size; font0 = font}
				if (i > 0) {if (size !== size0) {sizediff = true}}
				if (i > 0) {if (font !== font0) {fontdiff = true}}
			}
			// all
			document.getElementById("wid"+i).innerHTML = output
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
					// set isOS
					if (font0.slice(0,12) == "MS Shell Dlg") {os="Windows"}
					else if (font0 == "Roboto") {os="Android"}
					else if (font0 == "-apple-system") {os="Mac"}
					else if (font0 == "unknown") {os = ""}
					else {os="Linux"}
					isOS = os.toLowerCase()
			}
			os = (os == "" ? zB : os) + " ["+font0+", "+size0+"]"
			dom.fdWidget.innerHTML = os + (runS ? zSIM : "")			
		} else {
			dom.fdWidget = whash
		}
		dom.widgetH = whash + (runS ? zSIM : "")
		// perf & resolve
		if (logPerf) {debug_log("widgets [fd]",t0)}
		return resolve("widgets: " + whash)
	})
}

function get_zoom(runtype) {
	let t0 = performance.now(),
		dpr2 = "",
		zoomAssume = false

	// devicePixelRatio
	let dpr = window.devicePixelRatio || 1;
	let dprStr = (dpr == 1 ? "1"+rfp_green : dpr+rfp_red)
	// add extra dpr: 477157
	if (isFF) {
		let element = document.getElementById("dprdroid")
		try {
			dpr2 = getComputedStyle(element).borderTopWidth
			dpr2 = dpr2.slice(0, -2) // trim "px"
			if (dpr2 > 0) {
				dpr2 = (1/dpr2)
				if (dpr2 != 1 ) {dprStr += " | "+dpr2+rfp_red}
			}
		} catch(e) {
			// ToDo: we can't use dpr2 later on
		}
	}
	dom.dpr.innerHTML = dprStr

	// dpi
	// ToDo: when zooming, getting divDPI is much slower
	// divDPI relies on css: if css is blocked (dpi_y = 0) this causes issues
	let t1 = performance.now()

	let aDPI = return_mm_dpi("dpi"),
		bDPI = return_mm_dpi("dppx"),
		cDPI = return_mm_dpi("dpcm")

	if (aDPI !== zB1 && aDPI !== zB2) {varDPI = aDPI}
	dom.mmDPI.innerHTML = aDPI +" | "+ bDPI +" | "+ cDPI
	dpi_x = Math.round(dom.divDPI.offsetWidth * dpr)
	dpi_y = Math.round(dom.divDPI.offsetHeight * dpr)
	dom.jsDPI = dpi_x
	if (logPerf) {debug_log("dpi [part of zoom]",t1,"ignore")}

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
	if (logExtra) {console.log("A [ must come first]: ", runtype, ": zoom, dpi, devicePixelRatio")}
	dom.jsZoom.innerHTML = jsZoom + (zoomAssume ? s1+"[assumed]"+sc :"")
	if (runtype !== "resize" && logPerf) {debug_log("zoom ["+runtype+ "]",t0)}
	return jsZoom
}

/* OS SPECIFIC */

function run_os() {
	if (isOS == "android") {
		showhide("table-row","OS1","")
		dom.droidWin = firstW+" x "+firstH+" [inner] [toolbar visible]"
		// listen for toolbar
		get_android_tbh()
		// rerun screen: droid can be a little slow
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
						dom.fsLeak = screen.width+" x "+screen.height+" [screen] "+iw+" x "+ih+" [mozFullScreenElement client]"
						exitFS()
						// TB desktop warning panel
						if (isTB == true && isOS !== "android") {
							setTimeout(function(){
							let ih2 = window.innerHeight
								let panel = ih1-ih2
								if (panel !== 0) {
									dom.fsLeak.innerHTML = dom.fsLeak.textContent+"<br>"+panel+"px [warning panel height]"
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
	sizesi.push(iw+" x "+ih)
	sizeso.push(ow+" x "+oh)
	// default output
	newWinLeak = iw+" x "+ih+" [inner] "+ow+" x "+oh+" [outer]"

	// DESKTOP
	if (isOS !== "android") {
		function check_newwin() {
			let diffsi = [], // 4 inner sizes
				diffso = [], // 4 outer sizes
				changesi = 0,
				changeso = 0
			// detect changes
			let prev = sizesi[0]
			let strInner = s1+"inner: "+sc+iw+" x "+ih
			for (let k=0; k < sizesi.length; k++) {
				if (sizesi[k] !== prev ) {
					changesi++;	strInner += s1+" &#9654 <b>["+k+"]</b> "+sc+sizesi[k]
				}
				prev = sizesi[k]
			}
			prev = sizeso[0]
			let strOuter = s1+"outer: "+sc+ow+" x "+oh
			for (let k=0; k < sizeso.length; k++) {
				if (sizeso[k] !== prev ) {
					changeso++;	strOuter += s1+" &#9654 <b>["+k+"]</b> "+sc+sizeso[k]
				}
				prev = sizeso[k]
			}
			// one or two lines
			if (changesi > 0 || changeso > 0) {
				newWinLeak = strInner+"<br>"+strOuter
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
					sizesi.push(newWin.innerWidth+" x "+newWin.innerHeight)
					sizeso.push(newWin.outerWidth+" x "+newWin.outerHeight)
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
			newWinLeak = iw+" x "+ih+" [inner] [toolbar hidden] "+ow+" x "+oh+" [outer]"
		} else if (ih == firstH) {
			// should be the same
			newWinLeak = iw+" x "+ih+" [inner] [toolbar visible] "+ow+" x "+oh+" [outer]"
		}
		dom.newWinLeak.innerHTML = newWinLeak
	}

}

function goNW_UA() {
	let list = ['userAgent','appCodeName','appName','product','appVersion',
		'oscpu','platform','buildID','productSub','vendor','vendorSub'],
		res = [],
		r = ""
	dom.sectionUA8.innerHTML = "&nbsp"
	// open, get results, close
	let newWin = window.open()
	let navigator = newWin.navigator
	for(let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = (e.name == "ReferenceError" ? zB1 : zB2)}
		if (r == "") {r = "empty string"}
		if (r == "undefined") {r = "undefined string"}
		if (r == undefined) {r = "undefined value"}
		res.push((i).toString().padStart(2,"0")+": "+r)
	}
	newWin.close()
	// hash
	res.sort(Intl.Collator("en-US").compare)
	let hash = sha1(res.join())
	let hash2 = (dom.nUAinitial.textContent).substring(0,40)
	// output
	if (hash == hash2) {
		dom.sectionUA8.innerHTML = hash + match_green
	} else {
		dom.sectionUA8.innerHTML = hash + match_red
		// output diffs if not already exposed (has line break)
		let target = "", output = "", str = "", n = ""
		for (let i=0; i < res.length; i++) {
			target = document.getElementById("nUA" + res[i].substring(0,2))
			str = target.innerHTML
			output = res[i].slice(3, res[i].length)
			if (str.indexOf("<br>") == -1 && str !== output) {
				target.innerHTML += "<br>" + sb.trim() + output + sc
				n = (i).toString().padStart(2,"0")
				// show vendor*
				if (n == "09" || n == "10") {
					document.getElementById("togUA"+n).style.display = "table-row"
				}
			}
		}
	}
}

/* OUTPUT */

function outputScreen(runtype) {
	let t0 = performance.now()
	// do these once
	get_pbmode()
	get_fullscreen()
	get_color()
	get_screen_metrics(runtype) // calls the rest, also used on resize
	// perf
	section_info("screen", t0, gt0)
}

function outputUA() {
	let t0 = performance.now()
	get_ua_nav()
	get_ua_nav_checks()
}

function outputFD(runtype) {
	let t0 = performance.now(),
		section = []

	// FF only
	if (isFF) {
		Promise.all([
			get_errors(), // isFF (2nd check), needed for version
			get_widgets(), // isOS
			get_version(), // isVer - needed early for resources
			get_chrome(), // isTB*
			get_resources(), // isTB
			get_line_scrollbar(), // calls zoom & viewport
			get_math(), // must come after widget
		]).then(function(results){
			results.forEach(function(currentResult) {
				// ignore chrome: which we need to run sammiched in there
				if (currentResult !== "ignoreme") {
					section.push(currentResult)
				}
			})
			section_info("feature", t0, gt0, section)
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
		lb_orange = ""
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
		// non-FF needs these
		if (runtype == "load") {
			get_zoom("load")
			get_viewport("load")
		}
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
			section_info("feature", t0, gt0, section)
		})
	}
	// all
	stateSIM = !stateSIM
	// perf: only on load to account for missing time
		// is this in the right place
	if (runtype == "load" & isFF) {
		section_info("part-feature", t0, gt0)
	}
}

function outputStart() {
	// run once
	function run_checks() {
		let t0 = performance.now()
		if ((location.protocol) == "file:") {isFile = true; note_file = " [file:/]"}
		if ((location.protocol) == "https:") {isSecure = true}
		if ("undefined" != typeof InstallTrigger) {isFF = true}
		get_engine()
		// not-coded
		let items = document.getElementsByClassName("faint")
		for (let i=0; i < items.length; i++) {items[i].textContent = "not coded yet"}
		// isFile
		items = document.getElementsByClassName("isFile")
		for (let i=0; i < items.length; i++) {items[i].textContent = note_file}
		// section hash to come
		items = document.getElementsByClassName("hashtocome")
		for (let i=0; i < items.length; i++) {items[i].textContent = "section-hash-will-be-coming-just-hold-on"}
		// sim = FF only
		if (!isFF) {runS = false}
		section_info("setup", t0, gt0)
	}
	// functions
	gt0 = performance.now()
	run_checks()
	outputFD("load") // run FD first: checks isFF; sets isOS, isTB*, isVer
	outputUA()
	outputScreen("load")
	run_os() // per os tweaks
}

outputStart()
