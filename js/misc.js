'use strict';

function check_mathLies() {
	if (!isSmart) {return false}
	const mathList = [
		"Math.acos","Math.acosh","Math.asinh","Math.atan","Math.atan2","Math.atanh",
		"Math.cbrt","Math.cos","Math.cosh","Math.exp","Math.expm1","Math.log","Math.log10",
		"Math.log1p","Math.sin","Math.sinh","Math.sqrt","Math.tan","Math.tanh"
	]
	return mathList.some(lie => sData[SECT99].indexOf(lie) >= 0)
}

const get_component_shims = () => new Promise(resolve => {
	const METRIC = "component_interfaces"
	let notation = ""
	try {
		if (runSE) {foo++}
		const keys = Object.keys(Object.getOwnPropertyDescriptors(Components.interfaces))
		const hash = mini(keys) // 102+ 6f0b1e35
		addData(18, METRIC, keys, hash)
		if (isTB && isSmart) {notation = tb_red}
		log_display(18, METRIC, hash + addButton(18, METRIC, keys.length) + notation)
		return resolve()
	} catch(e) {
		if (isTB && isSmart) {notation = (e+"" === "ReferenceError: Components is not defined" ? tb_green : tb_red)}
		log_display(18, METRIC, log_error(SECT18, METRIC, e) + notation)
		return resolve([METRIC, zErr])
	}
})

const get_math_other = (isMathLies) => new Promise(resolve => {
	const METRIC = "math_other"
	function cbrt(x) { // polyfill: not used: also Math.PI > 1
		let y = Math.pow(Math.abs(x), 1 / 3)
		return x < 0 ? -y : y
	}
	try {
		if (runSE) {foo++}
		let aTests = [
			"(Math.E - 1 / Math.E) / 2",
			"(Math.exp(1) + Math.exp(-1)) / 2",
			"(Math.exp(1) - Math.exp(-1)) / 2",
			"Math.E - 1",
			"Math.cosh(1)",
			"Math.exp(1) - 1",
			"Math.log((1.5)/(0.5))/2",
			"Math.pow(Math.abs(Math.PI), 1 / 3)",
		]
		let aValues = [
			(Math.E - 1 / Math.E) / 2, // sinh(1)
			(Math.exp(1) + Math.exp(-1)) / 2, // cosh(1)
			(Math.exp(1) - Math.exp(-1)) / 2, // sinh(1) alt
			Math.E - 1, // expm1(1)
			Math.cosh(1),
			Math.exp(1) - 1, // expm1(1) alt
			Math.log((1.5) / (0.5)) / 2, 
			Math.pow(Math.abs(Math.PI), 1 / 3), // cbrt(Math.PI)
		]
		let aRes = [], isTypeof = "number"
		for (let i=0; i < aTests.length; i++) {
			let x = aValues[i]
			if (runST) {x = true}
			if ("number" == typeof x) {
				aRes.push([aTests[i], x])
			} else {
				isTypeof = typeof x
				break
			}
		}
		let hash = mini(aRes), fpvalue
		if ("number" !== isTypeof) {
			log_display(18, METRIC, log_error(SECT18, METRIC, zErrType + isTypeof))
			return resolve([METRIC, zErr])
		} else if (isMathLies) {
			hash = colorFn(hash)
			fpvalue = [METRIC, zLIE]
			addDetail(METRIC, aRes)
			log_known(SECT18, METRIC)
		} else {
			addData(18, METRIC, aRes, hash)
		}
		log_display(18, METRIC, hash + addButton(18, METRIC))
		return resolve(fpvalue)
	} catch(e) {
		log_display(18, METRIC, log_error(SECT18, METRIC, e))
		return resolve([METRIC, zErr])
	}
})

const get_math_trig = (isMathLies) => new Promise(resolve => {
	const METRIC = "math_trig"
	let notation = ""
	try {
		if (runSE) {foo++}
		const oMath = {
			"cos": [
				["-1",-1],["17*Math.LOG10E",17*Math.LOG10E],["1e12",1e12],["1e130",1e130],
				["1e140",1e140],["1e251",1e251],["1e272",1e272],["1e284",1e284],["1e75",1e75],
				["21*Math.LN2",21*Math.LN2],["21*Math.LOG2E",21*Math.LOG2E],["25*Math.SQRT2",25*Math.SQRT2],
				["50*Math.SQRT1_2",50*Math.SQRT1_2],["51*Math.LN2",51*Math.LN2],["57*Math.E",57*Math.E],
			],
			"sin": [
				["35*Math.SQRT1_2",35*Math.SQRT1_2],["7*Math.LOG10E",7*Math.LOG10E],
			],
			"tan": [
				["10*Math.LOG10E",10*Math.LOG10E],["10*Math.LOG2E",10*Math.LOG2E],
				["17*Math.SQRT2",17*Math.SQRT2],["34*Math.SQRT1_2",34*Math.SQRT1_2],
				["6*Math.E",6*Math.E],["6*Math.LN2",6*Math.LN2],
			],
		}
		let aRes = []
		let isTypeof = "number"
		for (const k of Object.keys(oMath)) {
			oMath[k].forEach(function(item) {
				let value = Math[k](item[1])
				if (runST) {value = ""}
				if ("number" == typeof value) {
					aRes.push(["Math."+ k +"("+ item[0] +")", value])
				} else {
					isTypeof = typeof value
				}
			})
		}
		let hash = mini(aRes), fpvalue
		if ("number" !== isTypeof) {
			log_display(18, METRIC, log_error(SECT18, METRIC, zErrType + isTypeof) + (isSmart ? rfp_red : ""))
			return resolve([METRIC, zErr])
		} else if (isMathLies) {
			hash = colorFn(hash)
			fpvalue = [METRIC, zLIE]
			addDetail(METRIC, aRes)
			log_known(SECT18, METRIC)
		} else {
			addData(18, METRIC, aRes, hash)
		}
		if (isSmart) {
			// ToDo: 1852788 follow ups: currently only nightly/beta
			notation = hash == "a5833212" ? rfp_green : rfp_red
		}
		log_display(18, METRIC, hash + addButton(18, METRIC) + notation)
		return resolve(fpvalue)
	} catch(e) {
		if (isSmart) {notation = rfp_red}
		log_display(18, METRIC, log_error(SECT18, METRIC, e) + notation)
		return resolve([METRIC, zErr])
	}
})

function get_navigator_keys() {
	const METRIC = "navigator_keys"
	let notation = ""
	try {
		if (runSE) {foo++}
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		/* these should match
		let keysB = []
		for (const key in navigator) {keysB.push(key)}
		keysB.push("constructor")
		console.log(mini(keys), mini(keysB))
		//*/

		let isLies = false, tamperBtn = ""

		if (isSmart) {
			let fake = [], missing = [], moved = [], oKeys = {}
			// ToDo: check/expand these: e.g. javaEnabled?
			let expected = [
				"appCodeName","appName","appVersion","buildID","oscpu","platform","product","productSub","userAgent","vendor","vendorSub",
				"hardwareConcurrency","language","languages","mimeTypes","onLine","plugins",
				"taintEnabled","doNotTrack","cookieEnabled","pdfViewerEnabled",
				"requestMediaKeySystemAccess",
			]
			if (isVer > 118) {expected.push("locks")} // 1851539
			if (isVer > 119) {expected.push("userActivation")} // 1791079
			if (runSL) {
				keys.push("iamfake","anotherfake") // +fake
				keys = keys.filter(x => !["buildID"].includes(x)) // +missing
				keys = keys.filter(x => !["appName"].includes(x)); keys.push("appName") // +move
			}
			fake = keys.slice(keys.indexOf("constructor")+1) // after constructor
			missing = expected.filter(x => !keys.includes(x)) // use keys so we don't dupe moved
			moved = fake.filter(x => expected.includes(x)) // moved: expected after contructor
			fake = fake.filter(x => !moved.includes(x)) // fake minus moved

			if (missing.length) {oKeys["missing"] = missing.sort()}
			if (moved.length) {oKeys["moved"] = moved.sort()}
			if (fake.length) {oKeys["unexpected"] = fake.sort()}

			let lieCount = missing.length + fake.length,
				moveCount = moved.length
			// tampered
			if ((lieCount + moveCount) > 0) {
				// ToDo: add to FP methods
				isLies = true
				let tmp = []
				if (lieCount > 0) {tmp.push(lieCount +" lie"+ (lieCount > 1 ? "s" : ""))}
				if (moveCount > 0) {tmp.push(moveCount + " tampered")}
				addDetail(METRIC +"_tampered", oKeys)
				tamperBtn = addButton(18, METRIC +"_tampered", tmp.join("/"))
			}
		}

		// remove constructor
		keys = keys.filter(x => !["constructor"].includes(x))
		let hash = mini(keys)
		let display = hash
		// isLies imples isSmart
		if (isLies) {
			addDetail(METRIC, keys) // don't sort
			display = colorFn(display)
			log_known(SECT18, METRIC)
		}
		// health: 115+ only do TB/MB as ESR is stable
			// otherwise it's way too much work to track OSes/releases and beta/early etc
		if (isSmart && isTB) {
			notation = tb_red
			if (!isLies) {
				if (isMullvad) {
					// MB13 desktop
					if (hash === "1bfbd5d3") {notation = tb_green} // 37: mediaDevices, mediaSession
				} else {
					if (isOS == "android") {
						// TBA13
						if (hash === "3b7f79c3") {notation = tb_green} // 37: share, canShare (dom.webshare.enabled)
					} else {
						// TB13 desktop
						if (hash === "1054f985") {notation = tb_green} // 35
					}
				}
			}
		}
		log_display(18, METRIC, display + addButton(18, METRIC, keys.length) + tamperBtn + notation)

		if (isLies) {
			return [METRIC, zLIE]
		} else {
			addData(18, METRIC, keys, hash)
			return
		}
	} catch(e) {
		if (isSmart && isTB) {notation = tb_red}
		log_display(18, METRIC, log_error(SECT18, METRIC, e) + notation)
		return [METRIC, zErr]
	}
}

function get_recursion(log = false) {
	let level = 0
	let t0 = nowFn()
	function recurse() {level++; recurse()}
	try {recurse()} catch(e) {}
	level = 0
	try {
		recurse()
	} catch(e) {
		// 2nd test is more accurate/stable
		dom.recursion = level +" | "+ e.stack.toString().length
		if (log) {log_perf(SECTNF, "stack_depth", t0)}
		return
	}
}

function get_perf_mark_entries() {
	// FF111+ 1811567: no longer a health metric, but keep to detect timing fuckery
	const METRIC = "perf_mark_entries"
	let entries = "", valueEntries = "", ctrlEntries = "0, 0, 0, 0", measure = ""
	try {
		if (runSE) {foo++}
		performance.mark("a")
		performance.mark("b")
		// entries
		try {
			entries = performance.getEntriesByName("b","mark").length
				+", "+ performance.getEntries().length
				+", "+ performance.getEntries({name:"b", entryType:"mark"}).length
				+", "+ performance.getEntriesByName("b","mark").length
			valueEntries = entries !== ctrlEntries ? "not zero" : entries // make non-zero a stable FP
		} catch(e) {
			log_error(SECT18,"perf_getEntries", e)
			entries = zErr
			valueEntries = zErr
		}
		// measure
		try {
			performance.measure("w", undefined, "b")
			performance.measure("x")
			performance.measure("y", "a", "b")
			performance.measure("z", "a")
			measure = performance.getEntriesByType("measure").length
		} catch(e) {
			log_error(SECT18,"perf_measure", e)
			measure = zErr
		}
		// cleanup
		performance.clearMarks()
		performance.clearMeasures()
		log_display(18, METRIC, entries +" | "+ measure)
		return [METRIC, valueEntries +" | "+ measure]
	} catch(e) {
		log_display(18, METRIC, log_error(SECT18, METRIC, e))
		return [METRIC, zErr]
	}
}

function get_perf_now(log = false) {
	// runs post FP
	return new Promise(resolve => {
		const METRIC = "perf_now"
		try {
			let t0 = nowFn()
			if (runSE) {foo++}
			let i = 0, aData = [], aTimes = [], aDiffs = [], oCounts = {}, p0
			// collect
			function run() {
				if (i < 10) {
					if (i == 0) {p0 = performance.now()} else {aData.push(performance.now())}
					i++
				} else {
					clearInterval(check)
					output()
				}
				// analyse
				function output() {
					let isMatch = true
					let goodRFP = [0, 16.6, 16.7, 33.3, 33.4, 50, 66.6, 66.7, 83.3, 83.4, 100, 116.6, 116.7]
					// tidy times
					for (let i=0; i < aData.length ; i++) {
						let time = aData[i] - p0
						aTimes.push(time.toFixed(1) * 1)
					}
					// collect diffs
					for (let i=0; i < aTimes.length ; i++) {
						let prev = (i == 0 ? 0 : aTimes[i-1])
						let diff = (aTimes[i] - prev).toFixed(1) * 1
						aDiffs.push(diff)
						if (oCounts[diff] == undefined) {oCounts[diff] = 1} else {oCounts[diff]++}
						if (!goodRFP.includes(diff)) {isMatch = false}
					}
					// RFP: at least one 16.7, 16.6 (only RFP for now has decimals)
					if (oCounts["16.6"] == undefined && oCounts["16.7"] == undefined) {isMatch = false}
					dom.perf_now.innerHTML = aDiffs.join(", ") + (isSmart ? (isMatch ? rfp_green : rfp_red) : "")
					if (log) {log_perf(SECTNF, METRIC, t0)}
					return resolve()
				}
			}
			let check = setInterval(run, 7)
		} catch(e) {
			dom.perf_now.innerHTML = log_error(SECT18, METRIC, e) + (isSmart ? rfp_red : "")
			return resolve()
		}
	})
}

function get_perf_timing() {
	// dom.enable_performance
	const METRIC = "perf_timing"
	try {
		if (runSE) {foo++}
		let timing = performance.timing
		addDataDisplay(18, METRIC, (timing.loadEventEnd - timing.navigationStart) == 0 ? zD : zE)
	} catch(e) {
		log_display(18, METRIC, log_error(SECT18, METRIC, e))
		return [METRIC, zErr]
	}
}

function get_svg() {
	const METRIC = "svg_enabled"
	try {
		if (runSE) {foo++}
		dom.svgDiv.innerHTML = ""
		const svgns = "http://www.w3.org/2000/svg"
		let shape = document.createElementNS(svgns,"svg")
		let rect = document.createElementNS(svgns,"rect")
		rect.setAttribute("width",20)
		rect.setAttribute("height",20)
		shape.appendChild(rect)
		dom.svgDiv.appendChild(shape)
		const value = dom.svgDiv.offsetHeight > 0 ? zE : zD
		dom.svgDiv.innerHTML = ""
		addDataDisplay(18, METRIC, value)
		return
	} catch(e) {
		log_display(18, METRIC, log_error(SECT18, METRIC, e))
		return [METRIC, zErr]
	}
}

const get_window_props = () => new Promise(resolve => {
	/* https://github.com/abrahamjuliot/creepjs */
	let t0 = nowFn(), iframe
	const METRIC = "window_properties"
	let check = (isSmart && isTB)
	let notation = check ? tb_red : ""

	try {
		if (runSE) {foo++}
		// create & append
		let id = "iframe-window-version"
		let el = document.createElement("iframe")
		el.setAttribute("id", id)
		el.setAttribute("style", "display: none")
		document.body.appendChild(el)
		// get props
		iframe = document.getElementById(id)
		let contentWindow = iframe.contentWindow
		let aProps = Object.getOwnPropertyNames(contentWindow)
		let aSorted = []
		aProps.forEach(function(item) {aSorted.push(item)})
		aSorted.sort()

		// sim
		if (runSL) {aProps.push("hdcd_canvas_getctx","serviceWorker")}
		// cleanup
		iframe.parentNode.removeChild(iframe)

		// wasm
		let wasm = aProps.includes("WebAssembly") ? zE : zD
		if (isSmart && isTB) {wasm += (wasm == zE ? tb_standard : tb_safer)}
		log_display(18, "wasm", wasm)
		// webgpu
		let webgpu = aProps.includes("GPU") ? zE : zD
		if (isSmart && isTB) {webgpu += (webgpu == zD ? tb_green : tb_red)}
		log_display(18, "webgpu", webgpu)

		let display = mini(aSorted),
			fpvalue = display,
			tamperBtn = ""
		let aTampered = aProps.slice(aProps.indexOf("Performance")+1)
		let allowTampered = aProps.slice(aProps.indexOf("Performance")+1)
		let aFilter = ['Event','Location']
		if (isSmart) {
			allowTampered = allowTampered.filter(x => !aFilter.includes(x))
			if (allowTampered.length) {
				// always record tampering
				addDetail(METRIC +"_tampered", allowTampered.sort())
				tamperBtn = addButton(18, METRIC +"_tampered", allowTampered.length + " tampered")
			}
			// https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41694
				// allowlist NS 11.4.20+ - i.e remove false positives
				// allow slider at safer
			aFilter = ["Element","Event","HTMLCanvasElement","HTMLElement","HTMLFrameElement","HTMLIFrameElement",
				"HTMLObjectElement","Location","MediaSource","OffscreenCanvas","Proxy","URL","webkitURL",
			]
			aTampered = aTampered.filter(x => !aFilter.includes(x))
			if (aTampered.length) {
				aTampered = aTampered.concat(allowTampered)
				aTampered = aTampered.filter(function(item, position) {return aTampered.indexOf(item) === position})
				addDetail(METRIC, aProps)
				addDetail(METRIC +"_tampered", aTampered.sort())
				tamperBtn = addButton(18, METRIC +"_tampered", aTampered.length + " tampered")
				display = colorFn(display)
				fpvalue = zLIE
				log_known(SECT18, METRIC)
				addData(18, METRIC, zLIE)
			}
		}
		display += addButton(18, METRIC, aProps.length) + tamperBtn
		// health
		if (check && fpvalue !== zLIE) {
			// ToDo: touch devices
				// "Touch", "TouchEvent", "TouchList","ontouchcancel", "ontouchend", "ontouchmove", "ontouchstart"
				// e.g. is not in my windows touch-capable laptop but may be present in a tablet
			// dom.w3c_touch_events.enabled: 0=disabled (macOS) 1=enabled 2=autodetect (linux/win/android)
				// autodetection is currently only supported on Windows and GTK3 (and assumed on Android)
				// on touch devices: 0 (all false) 1 or 2 (all true)
			if (isMullvad) {
				if (fpvalue == "0d0dd5d5" || fpvalue == "8815bd33") {notation = tb_green} // 823 standard | 822 safer
			} else {
				if (isOS == "android") {
					if (fpvalue == "c70d9b44" || fpvalue == "6623eaa2") {notation = tb_green} // 783 standard | 782 safer
				} else {
					if (fpvalue == "226bc5ca" || fpvalue == "df3d8de8") {notation = tb_green} // 774 standard | 773 safer
				}
			}
		}
		display += notation

		if (fpvalue !== zLIE) {
			addData(18, METRIC, aSorted, fpvalue)
			if (isOS !== "android" && isOS !== undefined) {
				if (isSmart && !aTampered.length) {
				/*
           safer closed: "Performance" ... more items then "Event"
        standard closed: "Performance" + no "Event"...
         TB/FF/ALL open: "Performance" then "Event"...
				*/
					let indexPerf = aProps.indexOf("Performance"),
						indexEvent = aProps.indexOf("Event")
					display += " [console " + ( indexPerf + 1 == indexEvent ? "open" : "closed") +"]"
				}
			}
		}
		log_display(18, METRIC, display)
		log_perf(SECT18, METRIC, t0)
		return resolve()
	} catch(e) {
		try {iframe.parentNode.removeChild(iframe)} catch(err) {}
		let eMsg = log_error(SECT18, METRIC, e)
		let note = (isSmart && isTB) ? rfp_red : ""
		log_display(18, "wasm", eMsg + (isSmart && isTB ? tb_slider_red : ""))
		log_display(18, "webgpu", eMsg + note)

		log_display(18, METRIC, eMsg + notation)
		return resolve([METRIC, zErr])
	}
})

function outputMisc() {
	let t0 = nowFn()
	if (runSL && isSmart) {sData[SECT99].push("Math.sin")}
	let isMathLies = check_mathLies()
	try {null.bar} catch(e) {
		addDataDisplay(18, "error_message_fix", e.message) // FF74+: 1259822
	}
	// resource timing
	let METRIC = "perf_resource"
	try {
		if (isFile) {
			addDataDisplay(18, METRIC, zNA)
		} else {
			let len = performance.getEntriesByType('resource').length
			addDataDisplay(18, METRIC, (len > 0 ? zE : zD))
		}
	} catch(e) {
		log_display(18, METRIC, log_error(SECT18, METRIC, e))
		addData(18, METRIC, zErr)
	}
	// catch some perf fuckery
	try {
		let control = 0
		if (runSE) {foo++} else if (runST) {control = ""}
		let diff = Math.trunc(performance.now() - performance.now())
		if (diff !== control) {
			log_error(SECT18, "perf_now", zErrInvalid +"expected 0")
		}
	} catch(e) {
		log_error(SECT18, "perf_now", e)
	}

	Promise.all([
		get_svg(),
		get_perf_mark_entries(),
		get_perf_timing(),
		get_math_trig(isMathLies),
		get_math_other(isMathLies),
		get_component_shims(),
		get_window_props(),
		get_navigator_keys(),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(18, item)})
		log_section(18, t0)
	})
}

countJS(SECT18)
