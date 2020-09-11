'use strict';

var t0font,
	fntCode = ['0x20B9','0x2581','0x20BA','0xA73D','0xFFFD','0x20B8','0x05C6',
	'0x1E9E','0x097F','0xF003','0x1CDA','0x17DD','0x23AE','0x0D02','0x0B82','0x115A',
	'0x2425','0x302E','0xA830','0x2B06','0x21E4','0x20BD','0x2C7B','0x20B0','0xFBEE',
	'0xF810','0xFFFF','0x007F','0x10A0','0x1D790','0x0700','0x1950','0x3095','0x532D',
	'0x061C','0x20E3','0xFFF9','0x0218','0x058F','0x08E4','0x09B3','0x1C50','0x2619'],
	fntStrA = "mmmLLLmmmWWWwwwmmmllliii",
	fntStrB = "",
	fntList = [],
	fntHead = "  glyph        default     sans-serif          serif"
		+ "      monospace        cursive        fantasy<br>  -----"

let spawn = (function() {
	/* arthur's spawn code */
	let promiseFromGenerator
	// returns true if aValue is a generator object
	let isGenerator = aValue => {
		return Object.prototype.toString.call(aValue) === "[object Generator]"
	}
	// converts right-hand argument of yield or return
	// values to a promise, according to Task.jsm semantics
	let asPromise = yieldArgument => {
		if (yieldArgument instanceof Promise) {
			return yieldArgument
		} else if (isGenerator(yieldArgument)) {
			return promiseFromGenerator(yieldArgument)
		} else if (yieldArgument instanceof Function) {
			return asPromise(yieldArgument())
		} else if (yieldArgument instanceof Error) {
			return Promise.reject(yieldArgument)
		} else if (yieldArgument instanceof Array) {
			return Promise.all(yieldArgument.map(asPromise))
		} else {
			return Promise.resolve(yieldArgument)
		}
	}
	// takes a generator object, runs it as an asynchronous task,
	// returning a promise with the result of that task
	promiseFromGenerator = generator => {
		return new Promise((resolve, reject) => {
			let processPromise
			let processPromiseResult = (success, result) => {
				try {
					let {value, done} = success ? generator.next(result) : generator.throw(result)
					if (done) {
						asPromise(value).then(resolve, reject)
					} else {
						processPromise(asPromise(value))
					}
				} catch (error) {
					reject(error)
				}
			}
			processPromise = promise => {
				promise.then(result => processPromiseResult(true, result),
					error => processPromiseResult(false, error))
			}
			processPromise(asPromise(undefined))
		})
	}
	// __spawn(generatorFunction)__
	return generatorFunction => promiseFromGenerator(generatorFunction())
})()

function reset_unicode() {
	let r = ""
	for (let i=0; i < fntCode.length; i++) {
		let c = "u+"+fntCode[i].substr(2)
		r += "\n"+c.padStart(7)
	}
	dom.ug10.innerHTML = fntHead + r
}

function get_fpjs2(type) {
	/* based on https://github.com/Valve/fingerprintjs2 */
	// vars
	let baseFonts = ['monospace','sans-serif','serif'],
		outputA = document.getElementById(type+"_fontFPJS2"),
		outputC = document.getElementById(type+"_fontFPJS2Found"),
		t0 = performance.now()

	// elements
	let h = document.getElementsByTagName('body')[0]
	let baseFontsDiv = document.createElement('div')
	let fontsDiv = document.createElement('div')
	let defaultWidth = {}
	let defaultHeight = {}
	let createSpan = function() {
		let s = document.createElement('spanFP')
		s.style.position = "absolute"
		s.style.left = "-9999px"
		s.style.fontSize = "256px"
		s.style.fontStyle = "normal"
		s.style.fontWeight = "normal"
		s.style.letterSpacing = "normal"
		s.style.lineBreak = "auto"
		s.style.lineHeight = "normal"
		s.style.textTransform = "none"
		s.style.textAlign = "left"
		s.style.textDecoration = "none"
		s.style.textShadow = "none"
		s.style.whiteSpace = "normal"
		s.style.wordBreak = "normal"
		s.style.wordSpacing = "normal"
		s.innerHTML = fntStrA
		return s
	}

	// creates a span and load the font to detect and a base font for fallback
	let createSpanWithFonts = function(fontToDetect, baseFont) {
		let s = createSpan()
		s.style.fontFamily = "'" + fontToDetect + "'," + baseFont
		return s
	}
	// creates spans for the base fonts and adds them to baseFontsDiv
	let initializeBaseFontsSpans = function() {
		let spans = []
		for (let index=0, length=baseFonts.length; index<length; index++) {
			let s = createSpan()
			s.style.fontFamily = baseFonts[index]
			baseFontsDiv.appendChild(s)
			spans.push(s)
		}
		return spans
	}
	// creates spans for the fonts to detect and adds them to fontsDiv
	let initializeFontsSpans = function() {
		let spans = {}
		for (let i = 0; i < fntList.length; i++) {
			let fontSpans = []
			for (let j=0, numDefaultFonts = baseFonts.length; j< numDefaultFonts; j++) {
				let s = createSpanWithFonts(fntList[i], baseFonts[j])
				fontsDiv.appendChild(s)
				fontSpans.push(s)
			}
			spans[fntList[i]] = fontSpans // Stores {fontName : [spans for that font]}
		}
		return spans
	}
	// compare
	let present = function(fontSpans) {
		let r = false
		for (let i=0; i < baseFonts.length; i++) {
			r = (fontSpans[i].offsetWidth !== defaultWidth[baseFonts[i]] || fontSpans[i].offsetHeight !== defaultHeight[baseFonts[i]])
			if (r) {return r}
		}
		return r
	}
	// stuff
	let baseFontsSpans = initializeBaseFontsSpans()
	h.appendChild(baseFontsDiv)
	for (let index=0, length = baseFonts.length; index<length; index++) {
		defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth // width for the default font
		defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight // height for the default font
	}
	let fontsSpans = initializeFontsSpans()
	h.appendChild(fontsDiv)
	// detect
	let found = []
	for (let i=0; i < fntList.length; i++) {
		if (present(fontsSpans[fntList[i]])) {found.push(fntList[i])}
	}
	// cleanup
	h.removeChild(fontsDiv)
	h.removeChild(baseFontsDiv)
	// output
	outputC.innerHTML = (found.length > 0 ? found.join(", ") : "no fonts detected")
	outputC.style.color = zshow
	outputA.innerHTML = sha1(found.join(", ")) + (isPage == "main" ? s12 : s5)
		+ "["+found.length+"/"+fntList.length+"]" + sc + note_file
	// perf
	if (logPerf) {debug_log("fpjs2 "+type+" [fonts]",t0,t0font)}
}

function get_fallback(type, list) {
	/* https://github.com/arthuredelstein/tordemos */
	let width0 = null,
		t = dom.fontFBTest,
		outputB = document.getElementById(type+"_fontFB"),
		outputD = document.getElementById(type+"_fontFBFound"),
		t0 = performance.now()
	// measure
	let measure = function(font) {
		t.style.fontSize = "256px"
		t.style.fontStyle = "normal"
		t.style.fontWeight = "normal"
		t.style.letterSpacing = "normal"
		t.style.lineBreak = "auto"
		t.style.lineHeight = "normal"
		t.style.textTransform = "none"
		t.style.textAlign = "left"
		t.style.textShadow = "none"
		t.style.wordSpacing = "normal"
		t.style.fontFamily = font
		return t.offsetWidth
	}
	// compare
	let present = function(font) {
		width0 = width0 || measure("fontFallback")
		let width1 = measure("'" + font + "', fontFallback")
		return width0 !== width1
	}
	// detect
	let found = []
	let enumerate = function(possible) {
		for (let font of possible) {if (present(font)) {found.push(font)}}
	}
	// run
	function run() {
		clearInterval(checking)
		fontFBTest.innerHTML = fntStrB
		if (list == "tiny") {
			enumerate(['Arial','Courier'])
		} else {
			enumerate(fntList)
			outputB.innerHTML = sha1(found.join(", ")) + (isPage == "main" ? s12 : s5)
				+ "["+found.length+"/"+fntList.length+"]" + sc + note_file
			outputD.innerHTML = (found.length > 0 ? found.join(", ") : "no fonts detected")
		}
		dom.fontFBTest = ""
		if (logPerf) {debug_log("fallback-"+list+" "+type+" [fonts]",t0,t0font)}
		if (list !== "tiny") {
			debug_page("perf",type+" fonts",t0font)
			// cleanup details
			function details() {
				clearInterval(checking2)
				if (stateFNT == true) {showhide("table-row","F","&#9650; hide")}
				outputD.style.color = zshow
			}
			let checking2 = setInterval(details, 50)
		}
	}
	// pause after fpjs2 start
	let checking = setInterval(run, 25)
}

function get_fallback_string() {
	let strA = "",
	list = ['0x0000','0x0080','0x0100','0x0180','0x0250','0x02B0','0x0300','0x0370','0x0400',
	'0x0500','0x0530','0x0590','0x0600','0x0700','0x0750','0x0780','0x07C0','0x0800','0x0840',
	'0x08A0','0x0900','0x0980','0x0A00','0x0A80','0x0B00','0x0B80','0x0C00','0x0C80','0x0D00',
	'0x0D80','0x0E00','0x0E80','0x0F00','0x1000','0x10A0','0x1100','0x1200','0x1380','0x13A0',
	'0x1400','0x1680','0x16A0','0x1700','0x1720','0x1740','0x1760','0x1780','0x1800','0x18B0',
	'0x1900','0x1950','0x1980','0x19E0','0x1A00','0x1A20','0x1AB0','0x1B00','0x1B80','0x1BC0',
	'0x1C00','0x1C50','0x1CC0','0x1CD0','0x1D00','0x1D80','0x1DC0','0x1E00','0x1F00','0x2000',
	'0x2070','0x20A0','0x20D0','0x2100','0x2150','0x2190','0x2200','0x2300','0x2400','0x2440',
	'0x2460','0x2500','0x2580','0x25A0','0x2600','0x2700','0x27C0','0x27F0','0x2800','0x2900',
	'0x2980','0x2A00','0x2B00','0x2C00','0x2C60','0x2C80','0x2D00','0x2D30','0x2D80','0x2DE0',
	'0x2E00','0x2E80','0x2F00','0x2FF0','0x3000','0x3040','0x30A0','0x3100','0x3130','0x3190',
	'0x31A0','0x31C0','0x31F0','0x3200','0x3300','0x3400','0x4DC0','0x4E00','0xA000','0xA490',
	'0xA4D0','0xA500','0xA640','0xA6A0','0xA700','0xA720','0xA800','0xA830','0xA840','0xA880',
	'0xA8E0','0xA900','0xA930','0xA960','0xA980','0xA9E0','0xAA00','0xAA60','0xAA80','0xAAE0',
	'0xAB00','0xAB30','0xAB70','0xABC0','0xAC00','0xD7B0','0xD800','0xDB80','0xDC00','0xE000',
	'0xF900','0xFB00','0xFB50','0xFE00','0xFE10','0xFE20','0xFE30','0xFE50','0xFE70','0xFF00',
	'0xFFF0','0x10000','0x10080','0x10100','0x10140','0x10190','0x101D0','0x10280','0x102A0',
	'0x102E0','0x10300','0x10330','0x10350','0x10380','0x103A0','0x10400','0x10450','0x10480',
	'0x10500','0x10530','0x10600','0x10800','0x10840','0x10860','0x10880','0x108E0','0x10900',
	'0x10920','0x10980','0x109A0','0x10A00','0x10A60','0x10A80','0x10AC0','0x10B00','0x10B40',
	'0x10B60','0x10B80','0x10C00','0x10C80','0x10E60','0x11000','0x11080','0x110D0','0x11100',
	'0x11150','0x11180','0x111E0','0x11200','0x11280','0x112B0','0x11300','0x11480','0x11580',
	'0x11600','0x11680','0x11700','0x118A0','0x11AC0','0x12000','0x12400','0x12480','0x13000',
	'0x14400','0x16800','0x16A40','0x16AD0','0x16B00','0x16F00','0x1B000','0x1BC00','0x1BCA0',
	'0x1D000','0x1D100','0x1D200','0x1D300','0x1D360','0x1D400','0x1D800','0x1E800','0x1EE00',
	'0x1F000','0x1F030','0x1F0A0','0x1F100','0x1F200','0x1F300','0x1F600','0x1F650','0x1F680',
	'0x1F700','0x1F780','0x1F800','0x1F900','0x20000','0x2A700','0x2B740','0x2B820','0x2F800',
	'0xE0000','0xE0100','0xF0000','0x100000']

	// [43] dcf
	for (let i=0; i < fntCode.length; i++) {
		strA += "</span>\n<span>" + String.fromCodePoint(fntCode[i])
	}
	// [1] fpjs2
	strA += "</span>\n<span>" + fntStrA
	// [262] arthur
	let getCodePoints = function* () {
		let codePoints = list
			.map(s => s.trim())
			.filter(s => s.length > 0)
			.map(x => parseInt(x))
			.map(x => x + 1)
		codePoints[0] = 77
		return codePoints
	}
	// combine
	if (fntStrB.length == 0) {
		spawn(function* () {
			let codePoints = yield getCodePoints()
			fntStrB = codePoints.map(x => String.fromCodePoint(x)).join("</span>\n<span>")
			fntStrB += strA
		})
	}
}

function get_unicode() {
	/* code based on work by David Fifield (dcf) and Serge Egelman (2015)
		https://www.bamsoftware.com/talks/fc15-fontfp/fontfp.html#demo */
	let offset = [], bounding = [], client = [],
		unique = [], diffsb = [], diffsc = [], display = "",
		t0 = performance.now()
	let mgo = true, bgo = true, cgo = true

	// textMetrics
	let tm00 = [], tm01 = [], tm02 = [], tm03 = [], tm04 = [], tm05 = [],
		tm06 = [], tm07 = [], tm08 = [], tm09 = [], tm10 = [], tm11 = []
	// random
	let tm00u = false,
		tm00r = ""
	// combined textMetrics
	let tmhash = []
	// supported
	function supported(property) {
		return TextMetrics.prototype.hasOwnProperty(property)
	}
	let tm00s = supported("width"),
		tm01s = supported("actualBoundingBoxAscent"),
		tm02s = supported("actualBoundingBoxDescent"),
		tm03s = supported("actualBoundingBoxLeft"),
		tm04s = supported("actualBoundingBoxRight"),
		tm05s = supported("alphabeticBaseline"),
		tm06s = supported("emHeightAscent"),
		tm07s = supported("emHeightDescent"),
		tm08s = supported("fontBoundingBoxAscent"),
		tm09s = supported("fontBoundingBoxDescent"),
		tm10s = supported("hangingBaseline"),
		tm11s = supported("ideographicBaseline")

	// pretty results
	function status(support, group, hash) {
		let unusual = sb+"[non-standard]"+sc

		// always push something unique
		if (isFF) {
			if (hash == "7bc077692d4196982921fa6c4fcc08d424a03cd3") {
				// array of blanks: support = true
				if (group == "3") {
					// ToDo: textMetrics: version check when group 3 prefs flipped
					tmhash.push(hash +"_blocked unusual")
					return "blocked" + unusual
				} else {
					// group2 = default enabled since prefs added
					tmhash.push(hash +"_blocked standard")
					return "blocked"
				}
			} else if (hash == "da39a3ee5e6b4b0d3255bfef95601890afd80709") {
				if (mgo) {
					// empty array
					if (group == "1") {
						// width: no pref
						tmhash.push(hash+"_blocked")
						return "blocked"
					}	else if (group == "2") {
						// actualBounding: FF74+ prefs enabled
						if (isVer > 73) {
							if (support) {
								tmhash.push(hash+"_blocked standard")
								return "blocked"
							} else {
								tmhash.push(hash+"_not supported unusual")
								return zNS + unusual
							}
						} else {
							tmhash.push(hash+"_not supported standard")
							return zNS
						}
					} else {
						// ToDo: textMetrics: version check when group 3 prefs flipped
						if (support) {
							tmhash.push(hash+"_blocked unusual")
							return "blocked" + unusual
						} else {
							tmhash.push(hash+"_not supported standard")
							return zNS
						}
					}
				} else {
					// canvas is blocked
					if (group == "3") {
						// ToDo: textMetrics group 3 prefs flipped
						if (isVer > 73 && support) {
							tmhash.push(hash+"_no canvas supported unusual")
							return "supported" + unusual
						} else {
							tmhash.push(hash+"_no canvas not supported standard")
							return zNS
						}
					} else {
						// Groups 1+2 are expected
						if (support) {
							tmhash.push(hash+"_no canvas supported standard")
							return "supported"
						} else {
							tmhash.push(hash+"_no canvas not supported unusual")
							return zNS + unusual
						}
					}
				}
			} else {
				// supported, no blocks
				if (group == "3") {
					// ToDo: textMetrics: version check when group 3 prefs flipped
					tmhash.push(hash+"_not blocked unusual")
					return hash + unusual
				} else {
					tmhash.push(hash)
					return hash
				}
			}
		} else {
			// non-FF
			tmhash.push(hash)
			return hash
		}
	}
	function output() {
		// width
		dom.tm00.innerHTML = status(tm00s,"1",sha1(tm00.join())) + tm00r
		// actualBounding: 74+ true
		dom.tm01.innerHTML = status(tm01s,"2",sha1(tm01.join()))
		dom.tm02.innerHTML = status(tm02s,"2",sha1(tm02.join()))
		dom.tm03.innerHTML = status(tm03s,"2",sha1(tm03.join()))
		dom.tm04.innerHTML = status(tm04s,"2",sha1(tm04.join()))
		// other: 74+: prefs yet to flip
		dom.tm05.innerHTML = status(tm05s,"3",sha1(tm05.join()))
		dom.tm06.innerHTML = status(tm06s,"3",sha1(tm06.join()))
		dom.tm07.innerHTML = status(tm07s,"3",sha1(tm07.join()))
		dom.tm08.innerHTML = status(tm08s,"3",sha1(tm08.join()))
		dom.tm09.innerHTML = status(tm09s,"3",sha1(tm09.join()))
		dom.tm10.innerHTML = status(tm10s,"3",sha1(tm10.join()))
		dom.tm11.innerHTML = status(tm11s,"3",sha1(tm11.join()))
		// combined
		dom.ug2.innerHTML = sha1(tmhash.join()) + tm00r + (mgo ? "" : sb+"[canvas]"+sc)
		//console.log("HASH: TM combined: " + sha1(tmhash.join()) + "\n - " + tmhash.join("\n - "))

		// de-dupe
		unique = unique.filter(function(item, position) {return unique.indexOf(item) === position})
		diffsb = diffsb.filter(function(item, position) {return diffsb.indexOf(item) === position})
		diffsc = diffsc.filter(function(item, position) {return diffsc.indexOf(item) === position})
		// show/hide
		let bhash = sha1(bounding.join()), chash = sha1(client.join())
		if (bhash == chash) {
			dom.togUG.style.display = "none"; dom.labelUG = "domrect"
		} else {
			dom.togUG.style.display = "table-row"; dom.labelUG = "getBoundingClientRect"
		}
		// output
		let total = "|"+ unique.length +" diffs]"+ sc, r = ""
		dom.ug1 = sha1(offset.join())
		r = (bgo ? "" : zB + (runS ? zSIM : ""))
		if (bgo && mgo && tm00u == false) {r = s12 +"["+ diffsb.length + total}
		dom.ug3.innerHTML = bhash + r
		r = (cgo ? "" : zB + (runS ? zSIM : ""))
		if (cgo && mgo && tm00u == false) {r = s12 +"["+ diffsc.length + total}
		dom.ug4.innerHTML = chash + r
		dom.ug10.innerHTML = fntHead + display
		// log
		if (logExtra && mgo && tm00u == false) {
			r = ""
			if (bgo) {r = "measuretext vs bounding\n" + diffsb.join("\n")}
			if (cgo && cgo !== bgo) {r += "measuretext vs clientrects\n" + diffsc.join("\n")}
			//if (r !== "") {console.log(r)}
		}
		// perf
		if (logPerf) {debug_log("unicode glyphs [fonts]",t0)}
		//debug_log("unicode glyphs [fonts]",t0) // temp
	}

	function run() {
		let styles = ["default","sans-serif","serif","monospace","cursive","fantasy"],
			div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot, m = "",
			canvas = dom.ugCanvas, ctx = canvas.getContext("2d")
		// each char
		for (let i=0; i < fntCode.length; i++) {
			let	c = String.fromCodePoint(fntCode[i]),
				cp = "u+" + (fntCode[i]).substr(2)
			display += "<br>" + cp.padStart(7)
			// each style
			for (let j=0; j < styles.length; j++) {
				// set
				slot.style.fontFamily = (j == 0 ? "" : styles[j])
				slot.textContent = c
				// offset: w=span h=div
				let w = span.offsetWidth, h = div.offsetHeight
				offset.push((j==0 ? cp+"-" : "" ) + w+"x"+h)
				display += (w.toString()).padStart(8) +" x "+ (h.toString()).padStart(4)
				// measureText
				if (mgo) {
					try {
						ctx.font = "normal normal 22000px " + (j == 0 ? "none" : styles[j])
						m = ctx.measureText(c).width
						if (m == undefined) {
							tm00u = true
						} else {
							tm00.push( (j==0 ? cp+"-" : "" ) + m)
							// random check
							if (tm00r == "" && j == 0) {
								if (i < 11 && i !==3) {
									if (ctx.measureText(c+c).width !== (m*2)) {tm00r = s12 + note_random}
								}
							}
						}
						unique.push(m)
						// other textMetrics
						let tm = ctx.measureText(c)
						if (tm01s) {tm01.push(tm.actualBoundingBoxAscent)}
						if (tm02s) {tm02.push(tm.actualBoundingBoxDescent)}
						if (tm03s) {tm03.push(tm.actualBoundingBoxLeft)}
						if (tm04s) {tm04.push(tm.actualBoundingBoxRight)}
						if (tm05s) {tm05.push(tm.alphabeticBaseline)}
						if (tm06s) {tm06.push(tm.emHeightAscent)}
						if (tm07s) {tm07.push(tm.emHeightDescent)}
						if (tm08s) {tm08.push(tm.fontBoundingBoxAscent)}
						if (tm09s) {tm09.push(tm.fontBoundingBoxDescent)}
						if (tm10s) {tm10.push(tm.hangingBaseline)}
						if (tm11s) {tm11.push(tm.ideographicBaseline)}
					} catch(err) {
						// canvas is blocked
						mgo = false
					}
				}
				// bounding: w=div h=span
				if (bgo) {
					let bDiv = div.getBoundingClientRect()
					let bSpan = span.getBoundingClientRect()
					try {
						w = bSpan.width; h = bDiv.height
						bounding.push( (j==0 ? cp+"-" : "" ) + w+"x"+h )
						if (m !== w) {diffsb.push(m+" vs "+w)}
					} catch(err) {bgo = false}
				}
				// client: w=span, h=div
				if (cgo) {
					let cDiv = div.getClientRects()
					let cSpan = span.getClientRects()
					try {
						w = cSpan[0].width; h = cDiv[0].height
						client.push( (j==0 ? cp+"-" : "" ) + w+"x"+h )
						if (m !== w) {diffsc.push(m+" vs "+w)}
					} catch(err) {cgo = false}
				}
			}
		}
		dom.ugSlot = ""
		output()
	}
	run()
}

function get_woff() {
	let el = dom.woffno,
		control = el.offsetWidth,
		count = 0,
		maxcount = 31, // 800ms
		t0 = performance.now()
	if (isOS == "android" | isTB) {maxcount = 59} // 1500ms

	// output
	function output_woff(state) {
		dom.fontWoff2.innerHTML = state
		if (logPerf) {debug_log("woff [fonts]",t0)}
	}
	// check
	el = dom.woffyes
	function check_woff() {
		if (count < maxcount) {
			if (control !== el.offsetWidth) {
				clearInterval(checking)
				output_woff(zE)
			}
		} else {
			// timed out: pref removed FF69
			clearInterval(checking)
			let str = (isVer < 69 ? zD+" [or blocked]" : "blocked")
			output_woff(str)
		}
		count++
	}
	let checking = setInterval(check_woff, 25)
}

function outputFonts2(type) {
	let t0 = performance.now()
	t0font = performance.now()

	// monsta test
	if (type == "monsta") {
		// bypass FF check, isOS = ""
		isFF = true
		isOS = "x"
		// isFile
		if ((location.protocol) == "file:") {isFile = true; note_file = sn+"[file:]"+sc}
	}

	// FF only
	if (isFF) {
		// reset
		fntList = []
		let textfile = ""

		// output elements
		let outputA = document.getElementById(type+"_fontFPJS2"), // fpjs2 hash
			outputB = document.getElementById(type+"_fontFB"), // fallback hash
			outputC = document.getElementById(type+"_fontFPJS2Found"), // fpjs2 detected
			outputD = document.getElementById(type+"_fontFBFound") // fallback detected

		if (isOS == "") {
			// handle isOS = ""
			outputA.innerHTML = error_global_os
			outputB.innerHTML = error_global_os
		} else {
			if (type == "monsta") {
				textfile = "fonts_" + type
			} else {
				textfile = "fonts_" + isOS + "_" + type
			}

			// output status
			outputA.innerHTML = "test is running... please wait"
			outputB.innerHTML = "test is running... please wait"
			// hide/color: dont shrink elements
			outputC.style.color = zhide
			outputD.style.color = zhide

			// trap xhr/xmlhttp errors
			let xhr_font_error = false

			// build fntList from text file
			let strPush = ""
			function intoArray(lines) {
				// ignore zero length
				let lineArr = lines.split("\n").filter(s => s.length > 0)
				for (let k=0; k < lineArr.length; k++) {
					// trim
					strPush = lineArr[k]
					strPush = strPush.trim()
					// ignore zero length
					if (strPush.length > 0) {
						// ignore comments
						if (strPush.slice(0,2) !== "//") {
							fntList.push(strPush)
						}
					}
				}
			}
			function getData(filename) {
				return new Promise(function(resolve) {
					let xhr = new XMLHttpRequest()
					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4) {
							let lines = xhr.responseText
							intoArray(lines)
						}
					}
					xhr.onerror = function() {
						xhr_font_error = true
					}
					xhr.overrideMimeType("text/plain; charset=utf-8")
					xhr.open("GET", "txt/" + filename + ".txt", true)
					xhr.send()
				})
			}
			getData(textfile)

			// 
			function run_enumerate() {
				if (xhr_font_error == false) {
					// sort & remove duplicates
					fntList.sort()
					fntList = fntList.filter(function(font, position) {
						return fntList.indexOf(font) === position
					})
					// perf
					if (logPerf) {debug_log("read list " + type +" [fonts]",t0,t0font)}

					// run fpjs2
					get_fpjs2(type)

					// when blocking document fonts with whitelist
					// first run (for me) is 23, re-run is 46
					// IDK why: but running a 2 font check first
					// seems to prime it correctly: need to investigate more
					get_fallback(type, "tiny")
					function output_again() {
						clearInterval(checking)
						get_fallback(type, "real")
					}
					let checking = setInterval(output_again, 100)

				} else {
					// A+B=hashes, C+D=detected
					if (isFile) {
						// file error
						outputA.innerHTML = error_file_cors
						outputB.innerHTML = error_file_cors
					} else {
						// xhr error
						outputA.innerHTML = error_file_xhr
						outputB.innerHTML = error_file_xhr
					}
					// clear found fonts, reset color
					outputC.innerHTML = ""
					outputD.innerHTML = ""
					outputC.style.color = zshow
					outputD.style.color = zshow
					// perf
					debug_page("perf",type+" fonts",t0font)

					// cleanup details
					setTimeout(function(){
						if (stateFNT == true) {showhide("table-row","F","&#9650; hide")}
					}, 50)
				}
			}

			// keep checking if list is loaded
			let lastvalue = 1,
				checkcount = 0
			function check_enumerate() {
				if (xhr_font_error == true) {
					clearInterval(checking)
					run_enumerate()
				} else {
					if (lastvalue == fntList.length) {
						// we need the same result in succession
						clearInterval(checking)
						run_enumerate()
					} else if (fntList.length > 0) {
						// the array is underway
						lastvalue = fntList.length
					}
				}
				if (checkcount > 151) {
					// allow 3s, run anyway, it cleans up the output
					clearInterval(checking)
					run_enumerate()
				}
				checkcount++
			}
			let checking = setInterval(check_enumerate, 20)

		}
	}
}

function outputFonts1() {
	let t0 = performance.now()
	// proportional
	dom.fontFCprop = window.getComputedStyle(document.body,null).getPropertyValue("font-family")
	// sizes
	dom.df1 = fntStrA
	dom.df2 = fntStrA
	let el = dom.df1,
		str = "serif/sans-serif: " + getComputedStyle(el).getPropertyValue("font-size")
	el = dom.df2
	str += " | monospace: " + getComputedStyle(el).getPropertyValue("font-size")
	dom.fontFCsize = str
	// css font loading
	dom.fontCSS = ("FontFace" in window ? zE : zD)
	// doc fonts
	el = dom.spanLH
	str = getComputedStyle(el).getPropertyValue("font-family")
	dom.fontDoc = (str.slice(1,16) == "Times New Roman" ? zE : zD)
	// other
	get_unicode()
	get_woff()
	// perf
	debug_page("perf","fonts",t0,gt0)
}

function outputFonts() {
	if (isPage == "main") {
		if (isFF) {
			// font list hyperlinks
			let pre = "<span class='no_color'><a href='txt/fonts_" + isOS,
				mid = ".txt' target='blank' class='blue'>fonts_" + isOS
			dom.small_fontList.innerHTML = pre + "_small" + mid + "_small<a></span>"
			dom.all_fontList.innerHTML = pre + "_all" + mid + "_all<a></span>"
		}
		// autorun
		outputFonts1()
	}
	get_fallback_string()
}

outputFonts()
