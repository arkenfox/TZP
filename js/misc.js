'use strict';

function get_component_shims() {
	let sName = "misc_component_shims"
	sDetail[sName] = []
	let res, notation = ""
	try {
		if (runSE) {abc = def}
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Components.interfaces))
		sDetail[sName] = keys
		res = mini_sha1(keys.join(), "misc component shims")
		dom.shim.innerHTML = res + buildButton("18", sName, keys.length) + (isTB ? tb_red : "")
	} catch(e) {
		if (isTB) {notation = (e.message == "Components is not defined" ? tb_green : tb_red)}
		dom.shim.innerHTML = log_error("misc: component shims", e.name, e.message) + notation
		res = zErr
	}
	return "component_shims:"+ res
}

function get_iframe_props() {
	/* https://github.com/abrahamjuliot/creepjs */
	let sTrue = "misc_iframe_window_properties"
	let sFake = sTrue + "_fake_skip"
	let sSuspect = sTrue + "_suspect_skip"
	let sAll = sTrue + "_reported_notglobal"
	sDetail[sTrue] = []
	sDetail[sFake] = []
	sDetail[sSuspect] = []
	sDetail[sAll] = []

	let knownGood = [
		// acculumative
		// NoScript (TB)
		'Element','HTMLElement','HTMLFrameElement','HTMLIFrameElement','HTMLObjectElement','MediaSource','URL','webkitURL',
		// cydec
		'CanvasRenderingContext2D','CSSStyleDeclaration','CSS2Properties','SharedWorker','Worker',
		'MediaDevices','AudioNode','AnalyserNode','SpeechSynthesis','AudioBuffer',
		'HTMLCanvasElement','SVGElement','SVGGraphicsElement','SVGTextContentElement','RTCPeerConnection',
		'mozRTCPeerConnection','RTCDataChannel','RTCRtpReceiver','Date','Intl','Navigator','Geolocation',
		// chameleon
		'AbstractRange','Range','History','BaseAudioContext','AudioContext','OfflineAudioContext','FontFaceSet','Screen',
		// CB
		'MediaQueryList','WebGLRenderingContext','WebGL2RenderingContext','BiquadFilterNode',
		'IIRFilterNode','CharacterData','Text','SVGGeometryElement','SVGPathElement','DOMRectReadOnly',
		'DOMRect','SVGRect','IntersectionObserverEntry','TextMetrics',"OffscreenCanvas",
		// Trace
		'PluginArray',
		// ScriptSafe
		'Array','HTMLDivElement','MediaStreamTrack',
		// AdBlocker Ultimate
		'CustomEvent','String','WeakSet','decodeURI','decodeURIComponent','encodeURI','encodeURIComponent','escape','unescape',
		// JShelter
		'Gamepad','Math','PerformanceEntry','Promise','Proxy','VRFrameData',
		'DataView','Float32Array','Float64Array','Int16Array','Int32Array','Int8Array','Symbol',
		'Uint16Array','Uint32Array','Uint8Array','Uint8ClampedArray','XMLHttpRequest','XMLHttpRequestEventTarget',
		"Error","GeolocationCoordinates","GeolocationPosition","GeolocationPositionError","TypeError","console",
		"MimeTypeArray","Infinity","MimeType","NaN","Number","Plugin","isFinite","isNaN","parseFloat","parseInt",
		"HTMLMediaElement","IdleDeadline","MediaCapabilities","Set",
		"AudioDestinationNode","AudioParam","DynamicsCompressorNode","FileSystemEntry","FileSystemFileEntry",
		"OfflineAudioCompletionEvent","Permissions","SubtleCrypto","WebGLShaderPrecisionFormat",
	]

	try {
		if (runSE) {abc = def}
		// create & append
		let id = "iframe-window-version"
		let el = document.createElement("iframe")
		el.setAttribute("id", id)
		el.setAttribute('style', 'display: none')
		document.body.appendChild(el)
		// get props
		let iframe = document.getElementById(id)
		let contentWindow = iframe.contentWindow
		let props = Object.getOwnPropertyNames(contentWindow)
		// remove
		iframe.parentNode.removeChild(iframe)
		// lies
		if (runSL) {
			props.push("hdcd_canvas_getctx")
			props.push("serviceWorker")
		}
		// original
		let allProps = []
		props.forEach(function(item) {allProps.push(item)})
		//console.log(allProps.slice(allProps.indexOf("Performance"), allProps.length).join()) // last few items

		// gecko BS
		let suspectProps = [], fakeProps = [], suspectStr = "", fakeStr = ""
		if (isFF && isTZPSmart) {
			// suspect
			suspectProps = props.slice(props.indexOf("Performance")+1)
			let falsePos = ['Event','Location'] // false positives: console open
			suspectProps = suspectProps.filter(x => !falsePos.includes(x))
			if (suspectProps.length) {
				sDetail[sSuspect] = suspectProps.sort()
				suspectStr = buildButton("18", sSuspect, suspectProps.length + " suspect")
				// fake
				fakeProps = suspectProps.filter(x => !knownGood.includes(x))
				if (fakeProps.length) {
					props = props.filter(x => !fakeProps.includes(x))
					sDetail[sFake] = fakeProps.sort()
					fakeStr = buildButton("18", sFake, fakeProps.length + " lie"+ (fakeProps.length > 1 ? "s" : ""))
				}
			}
		}
		// sort (open console can affect order)
		props.sort() // original or modified gecko
		sDetail[sTrue] = props
		allProps.sort() // reported
		sDetail[sAll] = allProps

		// display
		let output = mini_sha1(allProps.join(), "misc iframe props")
		let result = output
		if (fakeProps.length) { // gecko smart only
			output = soB + output + scC
			result = mini_sha1(props.join(), "misc iframe props bypass")
			// record lie/bypass
			if (gRun) {
				gKnown.push("misc:iframe window properties")
				gBypassed.push("misc:iframe window properties:"+ result)
			}
		}
		output += buildButton("18", sAll, sDetail[sAll].length) + suspectStr + fakeStr
		dom.iProps.innerHTML = output
		return "iframe_properties:"+ result
	} catch(e) {
		dom.iProps = log_error("misc: iframe window properties", e.name, e.message)
		return "iframe_properties:"+ zErr
	}
}

function get_math_other(isMathLies) {
	// polyfills + non-trig
	if (!isFF) {
		dom.mathOther = zNA
		return "math_other::n/a"
	}
	function cbrt(x) {
		let y = Math.pow(Math.abs(x), 1 / 3)
		return x < 0 ? -y : y
	}
	let res = [], sName = "misc_math_other"
	sDetail[sName] = []
	sDetail[sName +"_reported_notglobal"] = []
	try {
		if (runSE) {abc = def}
		// nothing else added to desktop so just look at android diffs to desktop
		res.push(Math.log((1.5) / (0.5)) / 2) // original atanh(0.5)
		res.push(cbrt(Math.PI)) // research
		res.push(Math.cosh(1)) // research non-polyfill
		res.push((Math.exp(1) + Math.exp(-1)) / 2) // research cosh(1)
		res.push(Math.E - 1) // original expm1(1)
		res.push(Math.exp(1) - 1) // research expm1(1)
		let y = Math.E; res.push((y - 1 / y) / 2) // original sinh(1)
		res.push((Math.exp(1) - Math.exp(-1)) / 2) // reseach sinh(1)
		let hash = mini_sha1(res.join())
		let value = hash
		if (isTZPSmart && isMathLies) {
			sName += "_reported_notglobal"
			hash = soL + hash + scC
			value = zLIE
			if (gRun) {gKnown.push("misc:math_other")}
		}
		sDetail[sName] = res
		let btn = buildButton("18", sName)
		dom.mathOther.innerHTML = hash + btn
		return "math_other:"+ value
	} catch(e) {
		dom.mathOther = log_error("misc: math other", e.name, e.message)
		return "math_polyfill_other:"+ zErr
	}
}

function get_math_trig(isMathLies) {
	// sin/cos/tan: we didn't get any extra entropy except in android
		// this is really just checking RFP fixes this
	let oMath = {
		// 8x original cos
		// add: 7x cos + 2x sin + 6x tan diffs in android vs desktop FF68+
		"cos": [ 1e251, 1e140, 1e12, 1e130, 1e272, -1, 1e284, 1e75, 57*Math.E, 21*Math.LN2,
			51*Math.LN2, 21*Math.LOG2E, 25*Math.SQRT2, 50*Math.SQRT1_2, 17*Math.LOG10E,
		],
		"sin": [ 7*Math.LOG10E, 35*Math.SQRT1_2],
		"tan": [ 6*Math.E, 6*Math.LN2, 10*Math.LOG2E, 17*Math.SQRT2, 34*Math.SQRT1_2, 10*Math.LOG10E ],
	}
	let res = [], sName = "misc_math_trigonometric"
	sDetail[sName] = []
	sDetail[sName +"_reported_notglobal"] = []
	try {
		if (runSE) {abc = def}
		for (const k of Object.keys(oMath)) {
			let list = oMath[k]
			list.forEach(function(value) {
				res.push(Math[k](value))
			})
		}
		let hash = mini_sha1(res.join())
		let value = hash, notation = ""
		if (isTZPSmart) {
			if (isFF) {notation = rfp_red}
			if (isMathLies) {
				sName += "_reported_notglobal"
				hash = soL + hash + scC
				value = zLIE
				if (gRun) {gKnown.push("misc:math_trigonometric")}
			} else {
				if (hash == "6f7196420acb040d37bb6ef3765a4c3bf9bcd5dd") {notation = rfp_green}
			}
		}
		sDetail[sName] = res
		let btn = buildButton("18", sName)
		dom.mathTrig.innerHTML = hash + btn + notation
		return "math_trigonometric:" + value
	} catch(e) {
		dom.mathTrig = log_error("misc: math trigonometric", e.name, e.message)
		return "math_trigonometric:"+ zErr
	}
}

function get_nav_prototype() {
	// use global
	let sTrue = "misc_navigator_keys",
		sFake = "misc_navigator_keys_fake_skip",
		sMoved = "misc_navigator_keys_moved_method_skip",
		sAll = "misc_navigator_keys_reported_notglobal"
	sDetail[sTrue] = navKeys["trueKeys"]
	sDetail[sFake] = navKeys["fakeKeys"]
	sDetail[sMoved] = navKeys["movedKeys"]
	sDetail[sAll] = navKeys["allKeys"]
	let lieLength = navKeys["fakeKeys"].length,
		movedLength = navKeys["movedKeys"].length,
		fakeStr = "",
		movedStr = ""
	// output
	if (navKeys["trueKeys"]) {
		let realhash = mini_sha1(navKeys["trueKeys"].join(), "misc nav keys")
		let display = realhash
		// moved
		if (movedLength) {
			movedStr = buildButton("18", sMoved, movedLength +" moved")
			// method
			if (gRun) {
				gMethods.push("misc:navigator keys: expected keys moved")
			}
		}
		// fake
		if (lieLength) {
			let hash = mini_sha1(navKeys["allKeys"].join(), "misc nav keys fake")
			display = soB + hash + scC
			fakeStr = buildButton("18", sFake, lieLength +" lie"+ (lieLength > 1 ? "s" : ""))
			// lies
			if (gRun) {
				gKnown.push("misc:navigator keys")
				gBypassed.push("misc:navigator keys:"+realhash)
			}
		}
		dom.nProto.innerHTML = display + buildButton("18", sAll, navKeys["allKeys"].length) + fakeStr + movedStr
		return "navigator_keys:"+ realhash
	} else {
		dom.nProto = zB0 // empty array blocked
		return "navigator_keys:"+ zLIE
	}
}

function get_recursion(log = false) {
	let level = 0, test1 = 0
	let t0; if (canPerf) {t0 = performance.now()}
	function recurse() {
		level++
		recurse()
	}
	try {
		recurse()
	} catch(e) {
		test1 = level
	}
	level = 0
	try {
		recurse()
	} catch(e) {
		// 2nd test is more accurate/stable
		dom.recursion = level +" | "+ e.stack.toString().length
		if (log) {log_perf("recursion [not in FP]",t0)}
		return "stack_length:"+ e.stack.toString().length
	}
}

function get_perf1() {
	let testE = "", testM = "", display = "", valueE = "", valueM = "", notation = ""
	// get result
	try {
		if (runSE) {abc = def}
		performance.mark("a")
		if (performance.mark === undefined) {
			display = zU + " | "+ zNA
			dom.perf1 = display
			return "perf_ mark:"+ display
		} else {
				performance.mark("b")
				try {
					testE = performance.getEntriesByName("b","mark").length
						+", "+ performance.getEntries().length
						+", "+ performance.getEntries({name:"b", entryType:"mark"}).length
						+", "+ performance.getEntriesByName("b","mark").length
				} catch(e) {
					log_error("misc: perf getEntries", e.name, e.message)
					testE = e.name === undefined? zErr : e.name
					valueE = zErr
				}
				try {
					performance.measure("w", "a", "b")
					performance.measure("x", "a")
					performance.measure("y", undefined, "b")
					performance.measure("z")
					testM = performance.getEntriesByType("measure").length
				} catch(e) {
					log_error("misc: perf measure", e.name, e.message)
					testM = e.name === undefined? zErr : e.name
					valueM = zErr
				}
				performance.clearMarks()
				performance.clearMeasures()
		}
	} catch(e) {
		log_error("misc: perf mark", e.name, e.message)
		// bypass isFF non-RFP
		display = (e.name === undefined ? zErr : trim_error(e.name, e.message)) +" | "+ zNA
		let fpValue = zErr
		if (isFF && isTZPSmart && !isRFP) {
			fpValue = "not zero | not zero"
			display = soB + display + scC + rfp_red
			if (gRun) {
				gKnown.push("misc:performance.mark")
				gBypassed.push("misc:performance.mark:"+ fpValue)
			}
		}
		dom.perf1.innerHTML = display
		return "perf_mark:"+ fpValue
	}
	// sim
	if (runSL) {
		if (isRFP) {testE = "1, 4, 4, 1"} else {testE = ctrlE}
	}
	let ctrlE = "0, 0, 0, 0", ctrlM = 0
	display = testE +" | "+ testM
	if (valueE !== zErr) {valueE = testE == ctrlE ? "zero" : "not zero"}
	if (valueM !== zErr) {valueM = testM == ctrlM ? "zero" : "not zero"}

	if (isFF && isTZPSmart) {
		notation = testE == ctrlE && testM == ctrlM ? rfp_green : rfp_red
		// non-RFP = not zero: lies/bypass incl. errors
		if (!isRFP) {
			let isLies = false
			if (valueE == zErr || valueM == zErr) {isLies = true} // errors
			if (ctrlE == testE || ctrlM == testM) {isLies = true} // zeros
			if (isLies) {
				notation = rfp_red
				valueE = "not zero"
				valueM = "not zero"
				if (gRun) {
					gKnown.push("misc:performance.mark")
					gBypassed.push("misc:performance.mark:"+valueE+" | "+valueM)
				}
				display = soB + display + scC
			}
		}
	}
	// display
	dom.perf1.innerHTML = display + notation
	return "perf_mark:"+ valueE +" | "+ valueM
}

function get_perf2(log = false) {
	// runs post FP
	try {
		if (runSE) {abc = def}
		let t0; if (canPerf) {t0 = performance.now()}
		let i = 0, times = [], p0
		function run() {
			if (i < 11) {
				if (i == 0) {
					p0 = Math.round(performance.now())
				} else {
					times.push(Math.round(performance.now())-p0)
				}
				i++
			} else {
				clearInterval(check)
				let is00 = true, isYank = false, isTamper = false
				let maxTamper = 1, countTamper = 0
				for (let i=0; i < times.length ; i++) {
					let value = times[i] % 100
					if (value !== 0) {is00 = false} // ignore hundreds
					if (i > 0 && !isRFP) {
						let diff = times[i] - times[i-1]
						if (diff < 5 || diff > 30) {countTamper++
							if (isFile) {console.debug(i+1, diff, countTamper)}
						}
					}
					if (i == 0 && value > 75) {isYank = true}
				}
				// tweak max
				if (isLoad) {maxTamper = 3 + (isYank ? 1 : 0)}
				isTamper = (countTamper > maxTamper ? true : false) // allow one false positive
				// tampering
				if (isRFP && !is00) {isTamper = true}
				if (!isRFP && is00) {isTamper = true}
				if (!isPerf) {isTamper = true}
				let display = times.join(", ") + (countTamper > 1 ? s18 +" ["+ countTamper +"/"+ maxTamper +"]"+ sc : "")
				let notation = ""
				if (isTZPSmart) {
					if (isTamper) {
						notation = sb +"[tampered]"+ sc
					} else {
						notation = (isTZPSmart ? (is00 ? rfp_green : rfp_red) : "")
					}
				}
				dom.perf2.innerHTML = display + notation
				if (log) {log_perf("perf.now [not in FP]",t0)}
			}
		}
		let check = setInterval(run, 13)
	} catch(e) {
		dom.perf2 = log_error("misc: perf.now:", e.name, e.message)
	}
}

function get_perf3() {
	// loadEventEnd (also dom.enable_performance)
	let r = ""
	try {
		if (runSE) {abc = def}
		let timing = performance.timing
		r = timing.navigationStart - timing.loadEventEnd
		r = (r == 0 ? "zero" : "not zero")
		dom.perf3.innerHTML = r
	} catch(e) {
		dom.perf3 = log_error("misc: perf timing", e.name, e.message)
		r = zErr
	}
	return "perf_timing:"+ r
}

function get_perf4() {
	// also: dom.enable_performance_navigation_timing
	let r = zD, notation = ""
	try {
		if (runSE) {abc = def}
		if (window.PerformanceNavigationTiming) {r = zE}
	} catch(e) {
		dom.perf4 = log_error("misc: perf navigation", e.name, e.message)
		return "perf_navigation:"+ zErr
	}
	if (isTZPSmart) {notation = (r == zD ? rfp_green : rfp_red)} //78+: 1511941
	dom.perf4.innerHTML = r + notation
	return "perf_navigation:"+ r
}

function get_reporting_api() {
	// FF65+
	try {
		if (runSE) {abc = def}
		let observer = new ReportingObserver(function() {})
		dom.reportingAPI = zE
		return "reporting_observer:"+ zE
	} catch(e) {
		dom.reportingAPI = log_error("misc: reporting observer", e.name, e.message)
		return "reporting_observer:"+ zErr
	}
}

function get_svg() {
	try {
		if (runSE) (abc = def)
		dom.svgDiv.innerHTML = ""
		//dom.svgDiv.offsetHeight == 0
		const svgns = "http://www.w3.org/2000/svg"
		let shape = document.createElementNS(svgns,"svg")
		let rect = document.createElementNS(svgns,"rect")
		rect.setAttribute("width",20)
		rect.setAttribute("height",20)
		shape.appendChild(rect)
		dom.svgDiv.appendChild(shape)
		let res = dom.svgDiv.offsetHeight > 0 ? zE : zD
		dom.svgDiv.innerHTML = ""
		dom.svgBasicTest = res
		return "svg:"+ res
	} catch(e) {
		dom.svgBasicTest = log_error("misc: svg", e.name, e.message)
		return "svg:"+ zErr
	}
}

function get_wasm() {
	let res = (() => {
		try {
			if (typeof WebAssembly === "object"	&& typeof WebAssembly.instantiate === "function") {
				if (runSE) {abc = def}
				const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))
				if (module instanceof WebAssembly.Module)
					return new WebAssembly.Instance(module) instanceof WebAssembly.Instance
			}
		} catch(e) {
			// we only get errors if wasm is enabled
			log_error("misc: wasm", e.name, e.message)
			return true
		}
		return false
	})()
	let r = (res ? zE : zD)
	dom.wasm.innerHTML = r
	return "wasm:"+ r
}

function get_windowcontent() {
	try {
		if (runSE) {abc = def}
		let test = window.content
		let test2 = content.name
		dom.wincon = zE
		return "window_content:"+ zE
	} catch(e) {
		dom.wincon = log_error("misc: window content", e.name, e.message)
		return "window_content:"+ zErr
	}
}

function outputMisc() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = [], r = ""

	let lieList = [
		"Math.acos","Math.acosh","Math.asinh","Math.atan","Math.atan2","Math.atanh",
		"Math.cbrt","Math.cos","Math.cosh","Math.exp","Math.expm1","Math.log","Math.log10",
		"Math.log1p","Math.sin","Math.sinh","Math.sqrt","Math.tan","Math.tanh"
	]
	if (runSL) {gLies.push("Math.sin")}
	let foundLies = lieList.filter(x => proxyLies.includes(x))
	let isMathLies = (foundLies.length > 0)

	Promise.all([
		get_reporting_api(),
		get_svg(),
		get_wasm(),
		get_perf1(),
		get_perf3(),
		get_perf4(),
		get_math_trig(isMathLies),
		get_math_other(isMathLies),
		get_component_shims(),
		get_iframe_props(),
		get_windowcontent(),
		get_nav_prototype(),
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		log_section("misc", t0, section)
	})
}

countJS("misc")
