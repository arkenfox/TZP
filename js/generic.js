'use strict';
dom = getUniqueElements()

function getUniqueElements() {
	const dom = document.getElementsByTagName('*')
	return new Proxy(dom, {
		get: function(obj, prop) {return obj[prop]},
		set: function(obj, prop, val) {obj[prop].textContent = `${val}`; return true}
	})
}

/*** JSON ***/

function json_highlight(json) {
	if (typeof json != 'string') {
		json = json_stringify(json);
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

function json_stringify(passedObj, options = {}) {
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
			? 65 // was 80
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

/*** GENERIC ***/

const newFn = x => typeof x != 'string' ? x : new Function(x)()
function nowFn() {if (isPerf) {return performance.now()}; return}
function colorFn(str) {return "<span class='lies'>"+ str +"</span>"}
function rnd_string() {return Math.random().toString(36).substring(2, 15)}
function rnd_number() {return Math.floor((Math.random() * (99999-10000))+10000)}

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
		if (!isNaN(item*1)) {item = "\"" + item + "\""}
	}
	return item
}

function run_block() {
	let msg = "<br><span style='font-size: 24px;'><b>TZP requires "
		+ (isTB ? "Tor Browser" : "Firefox") +" v" + isBlockMin[(isTB ? 1 : 0)] +"+<b></span>"
	let msgItems = document.getElementsByClassName("secthash")
	for (let i=0; i < msgItems.length; i++) {	msgItems[i].innerHTML = msg	}
}

function run_basic() {
	for (let i = 1; i < 19; i++) {
		document.body.style.setProperty("--test"+i, "#d4c1b3")
		document.body.style.setProperty("--bg"+i, "#808080")
	}
	let items = document.getElementsByClassName("nav-down")
	for (let i=0; i < items.length; i++) {
		items[i].innerHTML = (items[i].innerHTML).replace(/</, "<span class='perf'>basic mode</span> <")
	}
}

function getElementProp(SECT, id, name, pseudo = ":after") {
	// default none: https://www.w3.org/TR/CSS21/generate.html#content
	try {
		if (runSE) {foo++}
		let item = window.getComputedStyle(document.querySelector(id), pseudo)
		item = item.getPropertyValue("content")
		if (runPS) {item = "none"}
		let originalitem = item
		item = item.replace(/"/g,"") // trim quote marks
		//console.log(SECT, id, name, pseudo, "~"+ item +"~", "~"+ originalitem +"~")

		// out of range: screen/window returns "none"
		if (id == "#S" || id == "#D") {
			if (item == "none") {
				item = "?"
			} else if (pseudo == ":after") {
				item = item.slice(3)				
			}
		} else if (id == "#P") {
			// out of range: dpi returns ""
			if (item == "") {item = "?"}
		}
		if (!isNaN(item * 1)) {item = item * 1} // number

		// fuckery
		if (item == "") {
			log_error(SECT, name, zErrInvalid +"got ''")
			item = zErr
		} else if (originalitem == "none") {
			// ignore screen/window
			if (id !== "#S" && id !== "#D") {
				log_error(SECT, name, zErrInvalid +"got 'none'")
				item = zErr
			}
		}
		return item
	} catch(e) {
		log_error(SECT, name, e)
		return zErr
	}
}

function mini(str) {
	// https://stackoverflow.com/a/22429679
	const json = `${JSON.stringify(str)}`
	let i, len, hash = 0x811c9dc5
	for (i = 0, len = json.length; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).slice(-8)
}

const promiseRaceFulfilled = async ({
	promise,
	responseType, // promise response type
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

/*** GLOBAL ONCE ***/

function get_isArch() {
	if (!isGecko) {return}
	// FF89-109: javascript.options.large_arraybuffers
	// note: pref change requires new origin/tab/reload: so we can run once
	let t0 = nowFn()
	const METRIC = "isArch"
	try {
		if (runSE) {foo++}
		let test = new ArrayBuffer(Math.pow(2,32))
		log_perf(SECTG, METRIC, t0, "", 64)
	} catch(e) {
		isArch = log_error(SECT3, "browser_architecture", e, isScope, 50, true) // persist error to sect3
		log_perf(SECTG, METRIC, t0, "", zErr)
	}
}

function get_isDevices() {
	isDevices = undefined
	let t0 = nowFn()
	try {
		if (runSE) {foo++}
		navigator.mediaDevices.enumerateDevices().then(function(devices) {
			isDevices = devices
			if (gLoad) {log_perf(SECTG, "isDevices", t0, "", nowFn())}
		}
	)} catch(e) {}
}

function get_isGecko() {
	let t0 = nowFn()
	const METRIC = "isGecko"
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
			isGecko = true
			// alert if any gecko checks fail
			if (aNo.length) {
				log_alert(SECTG, METRIC +": "+ aNo.join(", "), true)
			}
		}
		log_perf(SECTG, METRIC, t0,"", isGecko +" | "+ found +"/"+ list.length)
	} catch(e) {
		log_perf(SECTG, METRIC, t0, "", zErr)
	}
}

const get_isOS = () => new Promise(resolve => {
	if (!isGecko) {
		return resolve()
	}

	let t0 = nowFn(), count = 0
	setTimeout(() => resolve(zErrTime), 100)
	const METRIC = "isOS"
	function exit() {
		// FF51+ win/mac 1280128 / FF89+ linux 1701257 : min gecko > 88 so undefined = android
		if (isOS === undefined) {isOS = "android"}
		// set icon
		let pngURL = "url('chrome://branding/content/"+ (isOS == "android" ? "fav" : "") + "icon64.png')"
		dom.fdResourceCss.style.backgroundImage = pngURL
		// tweak monospace size
		if (isOS === "windows" || isOS == "android") {
			try {
				let items = document.querySelectorAll('.mono')
				for (let i=0; i < items.length; i++) {
					items[i].classList.add("monobigger")
					items[i].classList.remove("mono")
				}
			} catch(e) {}
		}
		log_perf(SECTG, METRIC, t0, "", isOS)
		return resolve()
	}

	// FF121+: 1855861
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

	if (!runTE) {
		try {
			if (runSE) {foo++}
			let path = "chrome://browser/content/extension-", suffix = "-panel.css", count = 0
			let list = ["win","mac","linux"]
			list.forEach(function(item) {
				let css = document.createElement("link")
				css.type = "text/css"
				css.rel = "stylesheet"
				css.href = path + item + suffix
				document.head.appendChild(css)
				get_event(css, item)
			})
		} catch(e) {
			isOSErr = log_error(SECT3, "os", e, isScope, 50, true) // persist error to sect3
			log_alert(SECTG, METRIC +": "+ zErr, true)
			log_perf(SECTG, METRIC, t0, "", zErr)
			return resolve()
		}
	}
})

const get_isSystemFont = () => new Promise(resolve => {
	if (!isGecko) {return resolve()}
	function exit(value) {
		log_perf(SECTG, "isSystemFont", t0, "", value)
		return resolve()
	}
	// first aFont per computed family
	let t0 = nowFn()
	let aFonts = ['-moz-button','-moz-button-group','-moz-desktop','-moz-dialog','-moz-document',
		'-moz-field','-moz-info','-moz-list','-moz-pull-down-menu','-moz-window','-moz-workspace',
		'caption','icon','menu','message-box','small-caption','status-bar'
	]
	try {
		let el = dom.sysFont, data = []
		aFonts.forEach(function(font){
			el.style.font = font
			let family = getComputedStyle(el)["font-family"]
			if (!data.includes(family)) {
				data.push(family)
				isSystemFont.push(font)
			}
		})
		exit(isSystemFont.join(", "))
	} catch(e) {
		// log nothing: we run in fonts later
		exit(e.name)
	}
})

const get_isTB = () => new Promise(resolve => {
	if (!isGecko) {
		return resolve(false)
	}
	let t0 = nowFn()
	setTimeout(() => resolve(t0), 150)
	const METRIC = "isTB"
	function exit(value) {
		log_perf(SECTG, METRIC, t0, "", value)
		return resolve(value)
	}

	// FF121+: 1855861
	const get_event = (css) => new Promise(resolve => {
		css.onload = function() {
			isTB = true
			document.head.removeChild(css)
			exit(true)
			return resolve()
		}
		css.onerror = function() {
			isTB = false
			document.head.removeChild(css)
			exit(false)
			return resolve()
		}
	})

	if (!runTE) {
		try {
			let css = document.createElement("link")
			// ToDo: TB13+: does not work on android
			css.href = isVer > 102 ? "chrome://browser/content/abouttor/aboutTor.css" : "resource://torbutton-assets/aboutTor.css"
			css.type = "text/css"
			css.rel = "stylesheet"
			document.head.appendChild(css)
			get_event(css)
		} catch(e) {
			log_error(SECT3, METRIC, e, isScope, 50, true) // persist error to sect3
			log_alert(SECTG, METRIC +": "+ e.name, true)
			exit(zErr)
		}
	}
})

const get_isVer = () => new Promise(resolve => {
	if (!isGecko) {
		return resolve()
	}
	let t0 = nowFn()
	function output(verNo) {
		isVer = verNo
		if (verNo < 102) {isVerExtra = " or lower"
		} else if (verNo == 120) {isVerExtra = "+"}
		log_perf(SECTG, "isVer", t0, "", isVer + isVerExtra)
		return resolve()
	}
	output(cascade())

	function cascade() {
		try {
			if (window.hasOwnProperty("UserActivation")) return 120 // 1791079
			try {location.href = "http://a>b/"} catch(e) {if (e.name === "SyntaxError") return 119} // 1817591
			if (CSS2Properties.prototype.hasOwnProperty("fontSynthesisPosition")) return 118 // 1849010
			if (CanvasRenderingContext2D.prototype.hasOwnProperty("fontStretch")) return 117 // 1842467
			if (CanvasRenderingContext2D.prototype.hasOwnProperty("textRendering")) return 116 // 1839614
			if (CanvasRenderingContext2D.prototype.hasOwnProperty("letterSpacing")) return 115 // 1778909
			if (CSS2Properties.prototype.hasOwnProperty("WebkitTextSecurity")) return 114 // 1826629
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
			}
			return 101
		} catch(e) {
			console.error(e)
			return 0
		}
	}
})

/*** PREREQ ***/

const get_isClientRect = () => new Promise(resolve => {
	if (!isGecko) {
		return resolve()
	}
	// determine valid domrect methods
	let t0 = nowFn()
	let aNames = ["Element.getBoundingClientRect", "Element.getClientRects",
		"Range.getBoundingClientRect", "Range.getClientRects"]

	isClientRect = -1
	let aClientRect = [], aClientRectNoise = {}, valid = "8e0cf57b", el = dom.rect1

	for (let i=0; i < 4; i++) {
		try {
			aClientRectNoise[i] = []
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
			// 3 unique values but collect all
			let eX = -20.716659545898438,
				eW = 141.41665649414062,
				eR = 120.69999694824219
			let expected = [eX, eX, eX, eX, eW, eW, eR, eR]
			let array = [obj.x, obj.left, obj.y, obj.top, obj.width, obj.height, obj.right, obj.bottom]
			aClientRect.push(mini(array) == valid ? true : false)
			// record noise FP raw data
			let aDiffs = []
			for (let i=0; i < array.length; i++) {
				aDiffs.push(expected[i] - array[i])
			}
			aClientRectNoise[i] = aDiffs
		} catch(e) {
			log_error(SECT15, aNames[i], e)
			aClientRect.push(zErr)
			aClientRectNoise[i] = zNA
		}
	}
	//aClientRect = [false, true, false, false]
	isClientRect = aClientRect.indexOf(true)
	log_perf(SECTP, "isClientRect",t0,"", aClientRect.join(", ") +" | "+ isClientRect)
	return resolve()
})

function get_isPerf() {
	try {
		// run twice: sometimes we get a false positive since we run it so early
		isPerf = Math.trunc(performance.now() - performance.now()) == 0
		isPerf = Math.trunc(performance.now() - performance.now()) == 0
	} catch(e) {
		isPerf = false
	}
}

/** CLICKING **/

function copyclip(element) {
	if ("clipboard" in navigator) {
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
		} catch(e) {}
	}
}

function hide_overlays() {
	dom.modaloverlay.style.display = "none"
	dom.overlay.style.display = "none"
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

/*** OUTGOING ***/

function showMetrics(name, scope, isConsole = false) {
	let btns = "<span class='btn0 btnc' onClick='showMetrics(`"
		+ name +"`,`" + scope +"`, true)'>[CONSOLE]</span>"

	let data, showhash = true, results, color = 99

	if (name == SECT98 || name == SECT99) { data = gData[name]
	} else if (name == "fingerprint" || name == "errors" || name == "health" || name == "lies") {
		data = gData[name][scope]
	} else if (name == "fingerprint_summary") { data = gData[zFP][scope+"_summary"]
	} else if (name == "alerts") {data = gAlert; showhash = false
	} else if (name.slice(0,6) == "errors") {
		name = name.slice(6)
		data = sData["errors"][scope][name]
		name = name.toUpperCase() +": errors"
		showhash = false
	} else if (name.slice(0,4) == "lies") {
		name = name.slice(4)
		data = sData["lies"][scope][name]
		name = name.toUpperCase() +": lies"
		showhash = false
	} else if (sectionNames.includes(name)) {
		data = sData[zFP][scope][name]; name = name.toUpperCase()
	} else {
		data = sDetail[scope][name]
	}
	// log to console
	if (isConsole) {
		console.log((scope == undefined ? "" : scope.toUpperCase() +": ") + name +": "+ (showhash ? mini(data) : ""), data)
		return
	}
	// populate overlay
	btns += " <span class='btn0 btnc' onClick='copyclip(`overlayresults`)'>[COPY]</span>"
		+ " <span class='btn0 btnc' onClick='hide_overlays()'>[CLOSE]</span>"
	dom.overlayresults.innerHTML = (scope == undefined ? "" : scope.toUpperCase() +": ")
		+ name +": "+ (showhash ? mini(data) : "") + "<br>"+ json_highlight(data)
	dom.overlaybuttons.innerHTML = btns
	// show overlay
	dom.modaloverlay.style.display = "block"
	dom.overlay.style.display = "block"
	dom.overlaytop.scrollIntoView(true) // so we're always at the top
}

function output_health(scope) {
	if (!isSmart) {return}
	// sort sData to gData
	let h = "health"

	gData[h] = {}
	gData[h][scope] = {}

	try {
		let total = 0
		for (const type of Object.keys(sData[h][scope]).sort()) {
			gData[h][scope][type] = {}
			for (const sect of Object.keys(sData[h][scope][type]).sort()) {
				let obj = sData[h][scope][type][sect]
				if (type == "fail") {
					if (sect == "_count") {
						total += obj
						gData[h][scope][type][sect] = obj
					} else {
						gData[h][scope][type][sect] = {}
						// sort object
						for (const metric of Object.keys(obj).sort()) {
							let data = gData[zFP][scope][sect]["metrics"][metric]
							// lookup fail details
							if (data == zErr) {
								try {
									data = gData["errors"][sect][metric]
								} catch(e) {}
							} else if (metric == "fontnames") {
								data = sDetail[scope]["fontnames_health"]
							} else if (metric == "letterboxing" || metric == "new_window") {
								data = gData[zFP][scope]["screen"]["metrics"]["window_sizes"]["metrics"]["innerWidth"]
									+" x "+ gData[zFP][scope]["screen"]["metrics"]["window_sizes"]["metrics"]["innerHeight"]
							} else if (metric == "screen_matches_inner") {
								data = {
									"inner": gData[zFP][scope]["screen"]["metrics"]["window_sizes"]["metrics"]["innerWidth"]
										+" x "+ gData[zFP][scope]["screen"]["metrics"]["window_sizes"]["metrics"]["innerHeight"],
									"screen": gData[zFP][scope]["screen"]["metrics"]["screen_sizes"]["metrics"]["device-width"]
										+" x "+ gData[zFP][scope]["screen"]["metrics"]["screen_sizes"]["metrics"]["device-height"],
								}
							} else {
								let aList = ["devicePixelRatio", "-moz-device-pixel-ratio", "dpi", "dpcm", "dppx", "dpi_css"]
								if (aList.includes(metric)) {
									data = gData[zFP][scope]["screen"]["metrics"]["pixels"]["metrics"][metric]
								}
							}
							// handle non data so at least it shows in JSON display
							if (data == undefined) { data =""}
							// ToDo: lookup untrustworthy details
								// i.e we would store them in sDetail[scope]["untrustworthy"][metric] and then try/catch here
							// ToDo: also add e.g. methods/fails such as unexpected fonts
							gData[h][scope][type][sect][metric] = data
						}
					}
				} else {
					// sort array
					if (sect == "_count") {total += obj}
					gData[h][scope][type][sect] = (sect == "_count" ? obj : obj.sort())
				}
			}
		}

		// summary
		let countPass = 0, countFail = 0
		if (gData[h][scope]["pass"] !== undefined) {
			countPass = gData[h][scope]["pass"]["_count"]
		}
		if (gData[h][scope]["fail"] !== undefined) {
			countFail = gData[h][scope]["fail"]["_count"]
		}
		// all
		total = countPass + countFail
		if (total > 0) {
			dom[scope + h].innerHTML = addButton((countPass == total ? "good" : "bad"), h, countPass +"/"+ total)
		}
	} catch(e) {
		console.log(e)
	}
}

function output_perf(id, click = false) {
	if (!isPerf) {return}

	let array = id == "all" ? gData["perf"] : sDataTemp["perf"]
	let target = id == "all" ? "perfG" : "perfS"
	let btn = id == "all" ? dom.perfGBtn : dom.perfSBtn

	// toggle perf depth
	let isMore = dom[target +"Btn"].innerHTML === "less"
	if (click) {
		isMore = !isMore // user toggled it
		dom[target +"Btn"] = isMore ? "less" : "more"
	}

	let aPretty = [],
		s2 = " <span class='s2'>",
		s4 = " <span class='s4'>",
		s98 = "<span class='s99'>", // trimmed
		pageLoad = false,
		isStart = false,
		pad = 15
	if (isMore) {pad = 30}

	try {
		array.forEach(function(array) {
			let type = array[0],
				name = array[1],
				time1 = array[2],
				time2 = array[3],
				extra = array[4]

			// RFP causes decimals
			try {gt1 = Math.round(gt1)} catch(e) {}
			try {time1 = Math.round(time1)} catch(e) {}
			try {time2 = Math.round(time2)} catch(e) {}

			extra = extra === undefined ? "" : " | "+ extra
			// header
			if (isMore && 1 === type) {
				if ("IMMEDIATE" == name) {pageLoad = true}
				if ("DOCUMENT START" == name) {isStart = true}
				time1 = pageLoad ? " "+ time1 : ""
				aPretty.push(s2 + name +":"+ time1 + sc)
			}
			// section/detail
			if (type > 1) {
				time1 = (id !== "all") ? time1.toString() : (time2-time1).toString()
				time2 = (id !== "all") ? time2.toString() : (time2-gt1).toString() // use gt1: only reset on global runs
			}
			// section
			if (2 === type) {
				time2 = id == "all" ? " |"+ s2 + time2.padStart(4) +" ms</span>" : ""
				let pretty = name.padStart(pad) +":"+ s4 + time1.padStart(4) +"</span> ms"
					+ time2 + extra
				aPretty.push(pretty)
				if (sectionNames.includes(name)) {
					dom["perf"+ name] = " "+ time1 +" ms"
				}
			}
			// detail
			if (isMore && 3 === type) {
				name = name.replace(": "+ SECTNF,"")
				if (id !== "all") {isStart = true}
				time2 = isStart ? " |"+ s98 + time2.padStart(5) +" ms</span>" : ""
				let pretty = s98 + name.padStart(pad) + sc +":" + s98 + time1.padStart(5) +" ms</span>"
					+ time2 + extra
				aPretty.push(pretty)
			}
		})
		dom[target].innerHTML = aPretty.join("<br>")
	} catch(e) {
		console.error(e)
	}
}

function output_section(section, scope) {
	// ToDo: SANITY CHECKS
	let aSection = section == "all" ? sectionOrder : [section]

	// propagate onces to sDataTemp
		// don't worry about all vs section: sDataTemp is temp
	try {
		btnList.forEach(function(item) {
			let once = item+"once"
			if (gData[once] !== undefined && gData[once][scope] !== undefined) {
				for (const s of Object.keys(gData[once][scope])) {
					if (!sectionNames.includes(s)) {
						// non-section: straight to sData: sorted
						if (sData[item][scope] == undefined) {sData[item][scope] = {}}
						if (sData[item][scope][s] == undefined) {sData[item][scope][s] = {}}
						for (const m of Object.keys(gData[once][scope][s]).sort()) {
							sData[item][scope][s][m] = gData[once][scope][s][m]
						}
					} else {
						// section: to sDataTemp: no sort
							// this is just section onces: _all_ sections to sData etc are looped below
						if (sDataTemp[item][scope] == undefined) {sDataTemp[item][scope] = {}}
						if (sDataTemp[item][scope][s] == undefined) {sDataTemp[item][scope][s] = {}}
						for (const m of Object.keys(gData[once][scope][s])) {
							sDataTemp[item][scope][s][m] = gData[once][scope][s][m]
						}
					}
				}
			}
		})
	} catch(e) {
		console.error(e)
	}

	// propagate data
	aSection.forEach(function(number) {
		let data = {}, hash, count
		let name = sectionMap[number]
		// FP
		try {
			data = {}
			let obj = sDataTemp[zFP][scope][number]
			for (const k of Object.keys(obj).sort()) {
				data[k] = obj[k]
			}
			sData[zFP][scope][name] = data
			hash = mini(data)
			count = Object.keys(data).length
			// global
			if (gRun) {
				// FP
				gData[zFP][scope][name] = {}
				gData[zFP][scope][name]["hash"] = hash
				gData[zFP][scope][name]["metrics"] = data
				// FP summary
				let summary = scope+"_summary"
				gData[zFP][summary][name] = {}
				gData[zFP][summary][name]["hash"] = hash
				gData[zFP][summary][name]["metrics"] = {}
				for (const k of Object.keys(data)) {
					let value = ("object" == typeof data[k] && data[k] !== null ? data[k]["hash"] : data[k] )
					gData[zFP][summary][name]["metrics"][k] = value
				}
			}
		} catch(e) {
			console.error(e)
		}
		// display
		try {
			for (const d of Object.keys(sDataTemp["display"][scope][number])) {
				let str
				try {
					str = sDataTemp["display"][scope][number][d]
					dom[d].innerHTML = str
				} catch(e) {
					console.error(d, str, e.name, e.emssage)
				}
				// log health on global runs
				if (gRun && isSmart) {
					if ("string" == typeof str && str.includes("class='health'")) {
						let hType
						if (str.includes(">"+ tick +"<")) {hType = "pass"
						} else if (str.includes(">"+ cross +"<")) {hType = "fail"}
						if (hType !== undefined) {
							log_health(scope, hType, name, d)
						}
					}
				}
			}
		} catch(e) {
			console.error(e)
		}
		let sHash = hash + addButton(0, name, count +" metric"+ (count == 1 ? "" : "s"), "btns")

		// section buttons
			// sDataTemp sorted to sData
		let aBtns = []
		try {
			btnList.forEach(function(item) {
				let btn = "", source = {}, target = {}
				if (sDataTemp[item][scope] !== undefined && sDataTemp[item][scope][name] !== undefined) {
					let len = 0
						if (sData[item][scope] == undefined) {sData[item][scope] = {}}
						if (sData[item][scope][name] == undefined) {sData[item][scope][name] = {}}
					if (item == "errors") {
						for (const m of Object.keys(sDataTemp[item][scope][name]).sort()) {
							sData[item][scope][name][m] = sDataTemp[item][scope][name][m]
						}
						len = Object.keys(sData[item][scope][name]).length
					} else {
						let array = sDataTemp[item][scope][name].sort()
						sData[item][scope][name] = array
						len = array.length
					}
					// catch zero length: e.g. object cleared not deleted
					if (len > 0) {
						let btnText = len + " "+ (len == 1 ? item.slice(0,-1) : item) // single/plural
						btn = addButton(0, item + name, btnText, "btns", scope)
						aBtns.push(btn.trim())
					}
				}
			})
			document.getElementById(name +"hash").innerHTML = sHash + aBtns.join("")
		} catch(e) {
			console.error(e)
		}
	})
}

/*** INCOMING ***/

function addButton(color, name, text = "details", btn = "btnc", scope = isScope) {
	return " <span class='btn"+ color +" "+ btn +"' onClick='showMetrics(`"+ name +"`,`" + scope +"`)'>["+ text +"]</span>"
}

function addData(section, metric, data, hash = undefined, includeDetail = true) {
	// return a new object with hash
	if (section == "none") {
		let obj = {}
		obj["hash"] = hash
		obj["metrics"] = data
		return obj
	}
	if (hash == undefined) {
		sDataTemp[zFP][isScope][section][metric] = data
	} else {
		// add an object as hash + detail
		if (includeDetail) {
			if (sDetail[isScope] == undefined) {sDetail[isScope] = {}}
			sDetail[isScope][metric] = data
		}
		sDataTemp[zFP][isScope][section][metric] = {}
		sDataTemp[zFP][isScope][section][metric]["hash"] = hash
		sDataTemp[zFP][isScope][section][metric]["metrics"] = data
	}
}

function addDataDisplay(section, metric, data, scope = isScope) {
	sDataTemp[zFP][scope][section][metric] = data
	sDataTemp["display"][scope][section][metric] = data
}

function addDataFromArray(section, item, scope = isScope) {
	// parse array(s) and add string(s)
	if (Array.isArray(item) && item.length) {
		if (Array.isArray(item[0])) {
			item.forEach(function(pair) {
				sDataTemp[zFP][scope][section][pair[0]] = pair[1]
			})
		} else {
			sDataTemp[zFP][scope][section][item[0]] = item[1]
		}
	}
}

function addDetail(metric, data, scope = isScope) {
	if (sDetail[scope] == undefined) {sDetail[scope] = {}}
	sDetail[scope][metric] = data
}

function log_alert(section, output, isOnce = false) {
	output = section +": "+ output
	if (isOnce) {
		if (gRun) {gAlertOnce.push(output)} // global snapshot
		console.error(output) // always console
	} else {
		if (gRun) {gAlert.push(output)}
		console.error(output)
	}
}

function log_display(section, id, str) {
	sDataTemp["display"][isScope][section][id] = str
	// catch undefined
	if (str === undefined) {
		log_alert(sectionMap[section], id +": undefined" )
	}
}

function log_error(section, metric, error = zErr, scope = isScope, len = 50, isOnce = false) {
	if (len == "") {len = 50}
	if (error == "" || error === null) {error = zErr} else {error += ""}
	// collect
	if (gRun && isOnce) {
		let key = "errorsonce"
		if (gData[key][scope] == undefined) {gData[key][scope] = {}}
		if (gData[key][scope][section] == undefined) {gData[key][scope][section] = {}}
		gData[key][scope][section][metric] =error
	} else {
		let obj = "errors"
		if (sDataTemp[obj][scope] == undefined) {sDataTemp[obj][scope] = {}}
		if (sDataTemp[obj][scope][section] == undefined) {sDataTemp[obj][scope][section] = {}}
		sDataTemp[obj][scope][section][metric] =error
	}
	// return display
	if (error.length > len) {error = error.slice(0,len-3) + "..."}
	return error
}

function log_health(scope, type, section, metric, h = "health") {
	try {
		if (sData[h][scope] == undefined) {sData[h][scope] = {}}
		if (sData[h][scope][type] == undefined) {sData[h][scope][type] = {"_count": 0}}
		sData[h][scope][type]["_count"] = sData[h][scope][type]["_count"] + 1
		if (type == "fail") {
			if (sData[h][scope][type][section] == undefined) {sData[h][scope][type][section] = {}}
			let lookup = gData[zFP][scope][section]["metrics"][metric]
			sData[h][scope][type][section][metric] = lookup
		} else {
			if (sData[h][scope][type][section] == undefined) {sData[h][scope][type][section] = []}
			sData[h][scope][type][section].push(metric)
		}
	} catch(e) {
		console.log(e)
	}
}

function log_known(section, metric, scope = isScope) {
	let obj = "lies"
	if (sDataTemp[obj][scope] == undefined) {sDataTemp[obj][scope] = {}}
	if (sDataTemp[obj][scope][section] == undefined) {sDataTemp[obj][scope][section] = []}
	sDataTemp[obj][scope][section].push(metric)
}

function log_perf(section, metric = "", time1, time2, extra) {
	if (!isPerf) {return}
	let tEnd = performance.now()
	let str = metric === "" ? section : metric +": "+ section
	// GLOBAL
	if (gRun || str.includes(SECTNF)) {
		gData["perf"].push([3, str, time1, tEnd, extra])
		return
	}
	// SECTION RERUNS
	if (str.includes(SECTP)) {return} // ignore prereq
	let type = sectionNames.includes(str) ? 2 : 3
	time2 = tEnd - gt0
	time1 = (2 === type) ? time2 : tEnd - time1
	sDataTemp["perf"].push([type, str, time1, time2, extra])
}

function log_section(name, time, scope = isScope) {
	let t0 = nowFn()
	let nameStr = "number" === typeof name ? sectionMap[name] : name
	if (gRun) {gData["perf"].push([2, nameStr, time, t0])}
	if (nameStr == SECTP) {return}

	// SECTION RERUNS
	if (!gRun) {
		log_perf(nameStr, "", time)
		output_section(name, scope)
		outputPostSection(name) // trigger nonFP	
		gClick = true
		return
	}

	// GLOBAL
	gCount++
	if (gCount == gCountExpected) {
		gt1 = gt0
		if (isPerf) {dom.perfAll = " "+ Math.round(performance.now()-gt0) +" ms"}
		output_section("all", scope)

		// FP
		try {
			let metricCount = 0
			for (const k of Object.keys(gData[zFP][scope])) {
				metricCount += Object.keys(gData[zFP][scope][k]["metrics"]).length
			}
			dom[scope + "hash"].innerHTML = mini(gData[zFP][scope]) + addButton(0, zFP, metricCount +" metrics")
				+ addButton(0, zFP +"_summary", "summary")
		} catch(e) {
			console.log(e)
		}

		// summaries
		try {
			btnList.forEach(function(item) {
				let total = 0
				// propagate sData to gData
				if (sData[item][scope] !== undefined) {
					if (gData[item][scope] == undefined) {gData[item][scope] = {}}
					for (const s of Object.keys(sData[item][scope]).sort()) {
						// everything is already sorted
						gData[item][scope][s] = sData[item][scope][s]
						total += Object.keys(sData[item][scope][s]).length
					}
				}
				if (total > 0) {
					let btnText = total +" "+ (total == 1 ? item.slice(0,-1) : item) // single/plural
					dom[scope + item +"hash"].innerHTML = addButton(0, item, btnText, "btnc", scope)
				}
			})
		} catch(e) {
			console.error(e)
		}

		// prototype/proxy
			// ToDo: isTB health
		if (isSmart) {
			let protoCount = (Object.keys(gData[SECT98]).length)
			let proxyCount = gData[SECT99].length
			if (protoCount + proxyCount == 0) {
				dom.protohash = "none"
			} else {
				let aStr = []
				if (protoCount > 0) {aStr.push(mini(gData[SECT98]) + addButton(0, SECT98, protoCount))}
				if (proxyCount > 0) {aStr.push(mini(gData[SECT99]) + addButton(0, SECT99, proxyCount))}
				dom.protohash.innerHTML = aStr.join(" ")
			}
		}

		// all this below will slot into btnList + be auto handled
		// persist runonce data, de-dupe, sort
		gAlert = gAlert.concat(gAlertOnce)
		gAlert = gAlert.filter(function(item, position) {return gAlert.indexOf(item) === position})
		gAlert.sort()
		// alerts
		dom.allcheck = (gAlert.length ? "[ alerts ]" : "")

		output_health(scope)

		// trigger nonFP
		outputPostSection("all")
		gLoad = false
		gClick = true
	}
}

/*** RUN ***/

function countJS(filename) {
	if (!isGecko && !isAllowNonGecko) {
		isBlock = true
		run_block() // non-gecko
		return
	}
	jsFiles++
	if (jsFiles === 1) {
		get_isVer() // as long as don't touch the dom this is fine here: required for isTB
		get_isSystemFont()
		return
	} else if (jsFiles === jsFilesExpected) {
		if (isGecko) {gData["perf"].push([1, "RUN ONCE", nowFn()])}
		let t0 = nowFn()
		Promise.all([
			get_isTB()
		]).then(function(results){
			if ("boolean" !== typeof results[0] && zErr !== results[0]) {
				let METRIC = "isTB"
				log_error(SECT3, METRIC, zErrTime, isScope, 50, true) // persist error to sect3
				log_perf(SECTG, METRIC, results[0], "", zErrTime)
				log_alert(SECTG, METRIC +": "+ zErrTime, true)
			}
			// might allow non-Gecko later
			if (isGecko) {
				isBlock = isVer < isBlockMin[0]
			} else {
				isBlock = false // allow non-gecko
				isSmart = false // force basic mode
			}
			if (isBlock) {
				run_block() // old gecko
				return
			}
 			if (isVer >= isSmartMin) {isSmart = true}
			if (!isSmart) {run_basic()}

			t0 = nowFn()
			Promise.all([
				get_isOS(),
			]).then(function(results){
				if (results[0] == zErrTime) {
					let METRIC = "isOS"
					isOSErr = log_error(SECT3, "os", zErrTime, isScope, 50, true) // persist error to sect3
					log_perf(SECTG, METRIC, t0, "", zErrTime)
					log_alert(SECTG, METRIC +": "+ zErrTime, true)
				}
				// do once
				get_pointer_event()
				if (isOS == "android") {
					dom.pointerlabel = "tap"
					showhide("OS","table-row")
				}
				// escape to close
				document.onkeydown = function(evt) {
					evt = evt || window.event;
					var isEscape = false;
					if ("key" in evt) {
						isEscape = (evt.key === "Escape" || evt.key === "Esc");
					} else {
						isEscape = (evt.keyCode === 27);
					}
					if (isEscape) {
						hide_overlays()
					}
				}
				overlay.addEventListener("keydown", (e) => {
					console.log(e.key)
				})
				// graphite font is required
				document.fonts.ready.then(() => {
					outputSection("load")
				})
			})
		})
	}
}

function outputPostSection(id) {
	if ("all" !== id) {
		output_perf(id)
	}
	if ("number" === typeof id) {id = sectionMap[id]}
	if (gRun) {gData["perf"].push([1, SECTNF, nowFn()])}
	let isLog = gRun // push perf
	gRun = false // stop collecting things

	if (id == "all" || id == "storage") {
		test_worker_service(isLog) // doesn't return
		test_worker_web(isFile, isLog)
		test_worker_shared(isLog)
		test_idb(isFile && isVer < 105, isLog)
			// ^ FF104- file scheme = sanitizing issues
	}
	if (id == "all" || id == "ua") {
		get_ua_iframes(isLog)
		get_ua_workers()
	}
	if (id == "all" || id == "misc") {
		Promise.all([
			get_perf_now(isLog),
			get_recursion(isLog),
		]).then(function(){
			if (id == "all") {output_perf(id)}
		})
	}
}

function outputUser(fn) {
	// user initiated
	if (isBlock) {return}
	if (fn == "goFS") { goFS()
	} else if (fn == "goNW") { goNW()
	} else if (fn == "goNW_UA") { goNW_UA()
	} else if (fn == "outputAudio2") {outputAudio2()
	} else if (fn == "get_storage_manager") { get_storage_manager()
	} else if (fn == "get_pointer_event") { get_pointer_event()
	}
}

function outputSection(id, cls) {
	if (isBlock || !gClick) {
		output_perf("all")
		return
	}
	// reset scope
	isScope = zDOC

	if (id == "load") {
		// set sectionOrder, sectionNames
		let tmpObj = {}
		for (const k of Object.keys(sectionMap)) {tmpObj[sectionMap[k]] = k; sectionNames.push(sectionMap[k])}
		for (const n of Object.keys(tmpObj).sort()) {sectionOrder.push(tmpObj[n])}
		sectionNames.sort()
	}

	gClick = false
	if (cls == undefined || cls == "") {cls = "c"}
	let delay = 100

	// reset
	if (id == "load" || id == "all") {
		//gData = {} // don't wipe *once
		/*
		if (gData["errorsonce"][isScope] == undefined) {gData["errorsonce"][isScope] = {}}
		gData["errorsonce"][isScope]["whack"] = {"idk":"something"}
		gData["errorsonce"][isScope]["screen"] = {"bbb":"world"}
		gData["errorsonce"][isScope]["_whack"] = {"idk":"something"}
		gData["errorsonce"][isScope]["ua"] = {"t":"test","b":"test"}
		gData["errorsonce"][isScope][SECTG] = {"zzz":"test","aa":"what"}
		//*/
		gData[zFP] = {"document":{}, "document_summary": {}}
		gData["errors"] = {}
		gData["lies"] = {}
		if (!gLoad) { // don't wipe gLoad perf
			gData["perf"] = []
		}
		// sData
		sData = {
			"errors": {},
			"fingerprint": {"document":{}},
			"health": {},
			"lies": {},
		}
		// sDataTemp
		sDataTemp = {
			"display": {"document":{}},
			"errors": {},
			"fingerprint": {"document":{}},
			"lies": {},
			"perf": [],
		}
		sDetail = {}
		for (const name of Object.keys(sectionMap)) {
			let sectionName = sectionMap[name]
			sDataTemp[zFP][isScope][name] = {}
			sDataTemp["display"][isScope][name] = {}
		}
	}

	if (id == "load") {
		// skip clear/reset
		id = "all"
		gRun = true
		delay = 0
	} else if (id == "all") {
		gRun = true
		// clear
		let items = document.getElementsByClassName("c")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		items = document.getElementsByClassName("gc")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		// reset global
		gCount = 0
		gAlert = []
		gKnown = []
		// reset section
		sDetail = {}
		get_isDevices()
	} else {
		// clear section data
		let name = sectionMap[id]
		try {sData[zFP][isScope][name] = {}} catch(e) {}
		try {sDataTemp[zFP][isScope][id] = {}} catch(e) {}
		try {sDataTemp["display"][isScope][id] = {}} catch(e) {}
		try {delete sData["errors"][isScope][name]} catch(e) {}
		try {delete sDataTemp["errors"][isScope][name]} catch(e) {}
		let tbl = document.getElementById("tb"+ id)
		tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
		gRun = false
	}
	// reset
	if (id == "all" || id == 1) {dom.kbt.value = ""}

	function output() {
		// we use 0ms timeouts to get accurate perf
		if (!gRun) {gt0 = nowFn()} // single section timer
		if (id == "all" || id == 3) {outputFD()} // do first to quickly set isMullvad
		setTimeout(function() {if (id == "all" || id == 4) {outputRegion()}}, 0)
		setTimeout(function() {if (id == "all" || id == 2) {outputUA()}}, 0)
		setTimeout(function() {if (id == "all" || id == 13) {outputMedia()}}, 0)
		setTimeout(function() {if (id == "all" || id == 5) {outputHeaders()}}, 0)
		setTimeout(function() {if (id == "all" || id == 18) {outputMisc()}}, 0)
		setTimeout(function() {if (id == "all" || id == 1) {outputScreen()}}, 0)
		setTimeout(function() {if (id == "all" || id == 14) {outputCSS()}}, 0)
		setTimeout(function() {if (id == "all" || id == 10) {outputWebGL()}}, 0)
		setTimeout(function() {if (id == "all" || id == 15) {outputElements()}}, 0)
		setTimeout(function() {if (id == "all" || id == 12) {outputFonts()}}, 0)
		setTimeout(function() {if (id == "all" || id == 7) {outputDevices()}}, 0)
		setTimeout(function() {if (id == "all" || id == 9) {outputCanvas()}}, 0)
		setTimeout(function() {if (id == "all" || id == 6) {outputStorage()}}, 0)
		setTimeout(function() {if (id == "all" || id == 11) {outputAudio()}}, 0)
	}

	if (gRun) {gData["perf"].push([1, "DOCUMENT START", nowFn()])}
	setTimeout(function() {
		get_isPerf()
		gt0 = nowFn()
		Promise.all([
			get_isClientRect(),
			outputPrototypeLies(),
		]).then(function(){
			log_section(SECTP, gt0)
			output()
		})
	}, delay)
}

function run_immediate() {
	get_isPerf()
	let t00 = nowFn()
	gData["perf"].push([1, "IMMEDIATE", t00])
	get_isDevices()
	if (location.protocol == "file:") {isFile = true}
	try {let v = speechSynthesis.getVoices()} catch(e) {}
	get_isGecko()
	get_isArch()
	isFontSizesPrevious = isFontSizesMore
}

run_immediate()

