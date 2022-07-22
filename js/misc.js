'use strict';

function get_component_shims() {
	let sName = "misc_component_shims"
	sDetail[sName] = []
	let sHash = ""
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Components.interfaces))
		sDetail[sName] = keys
		sHash = mini_sha1(keys.join(), "misc component shims")
		dom.shim.innerHTML = sHash + buildButton("18", sName, keys.length)
	} catch(e) {
		log_error("misc: component shims", e.name, e.message)
		let eMsg = trim_error(e.name, e.message)
		if (eMsg == "ReferenceError: Components is not defined") {
			sHash = zU; dom.shim = zU
		} else {
			sHash = isFF ? zB0 : zErr
			dom.shim = (e.name === undefined ? zErr : eMsg)
		}
	}
	return "component_shims:"+ sHash
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
		'DOMRect','SVGRect','IntersectionObserverEntry','TextMetrics',
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
		if (isFF) {
			// suspect
			suspectProps = props.slice(props.indexOf("Performance")+1)
			let falsePos = ['Event','Location'] // false positives: console open
			if (isVer < 62) {falsePos.push('StyleSheetList')}
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
		if (fakeProps.length) {
			output = soB + output + scC
			result = mini_sha1(props.join(), "misc iframe props bypass")
			// record lie/bypass
			if (isFF) {
				if (gRun) {
					gKnown.push("misc:iframe window properties")
					gBypassed.push("misc:iframe window properties:"+ result)
				}
			}
		}
		output += buildButton("18", sAll, sDetail[sAll].length) + suspectStr + fakeStr
		dom.iProps.innerHTML = output
		return "iframe_properties:"+ result
	} catch(e) {
		log_error("misc: iframe window properties", e.name, e.message)
		dom.iProps = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		return "iframe_properties:"+ (isFF ? zB0 : zErr)
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
		return "navigator_keys:"+ zLie
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

function get_reporting_api() {
	// FF65+
	let r
	try {
		let observer = new ReportingObserver(function() {})
		dom.reportingAPI = zE
		r = zE
	} catch(e) {
		log_error("misc: reporting observer", e.name, e.message)
		let eMsg = trim_error(e.name, e.message)
		if (isFF && eMsg == "ReferenceError: ReportingObserver is not defined") {
			r = (isVer > 64 ? zD : zNS)
			dom.reportingAPI = r
		} else {
			r = isFF ? zB0 : zErr
			dom.reportingAPI = (e.name === undefined ? zErr : eMsg)
		}
	}
	return "reporting_observer:"+ r
}

function get_perf1() {
	let testE = "", testM = "", display = "", valueE = "", valueM = ""
	// get result
	try {
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
		dom.perf1 = (e.name === undefined ? zErr : trim_error(e.name, e.message)) +" | "+ zNA
		return "perf_mark:"+ (isFF ? zB0 : zErr)
	}

	let ctrlE = "0, 0, 0, 0", ctrlM = 0, isLies = false
	display = testE +" | "+ testM

	// sim
	if (runSL) {
		if (isRFP) {testE = "1, 4, 4, 1"} else {testE = ctrlE}
	}

	let notation = testE == ctrlE && testM == ctrlM ? rfp_green : rfp_red
	if (valueE !== zErr) {valueE = testE == ctrlE ? "zero" : "not zero"}
	if (valueM !== zErr) {valueM = testM == ctrlM ? "zero" : "not zero"}

	// bypass
	if (isRFP) {
		valueE = "zero"
		valueM = "zero"
		if (ctrlE !== testE) {isLies = true}
		if (ctrlM !== testM) {isLies = true}
	} else if (isFF) {
		if (valueE !== zErr) {valueE = "not zero"}
		if (valueM !== zErr) {valueM = "not zero"}
		if (ctrlE == testE) {isLies = true}
		if (ctrlM == testM) {isLies = true}
	}
	// display
	if (isLies) {
		if (gRun) {
			gKnown.push("misc:performance.mark")
			gBypassed.push("misc:performance.mark:"+valueE+" | "+valueM)
		}
		dom.perf1.innerHTML = soB + display + scC
	} else {
		dom.perf1.innerHTML = display + notation
	}
	return "perf_mark:"+ valueE +" | "+ valueM
}

function get_perf2(log = false) {
	// runs post FP
	try {
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
				if (isTamper) {
					dom.perf2.innerHTML = display + sb +"[tampered]"+ sc
				} else {
					dom.perf2.innerHTML = display + (is00 ? rfp_green : rfp_red)
				}
				if (log) {log_perf("perf.now [not in FP]",t0)}
			}
		}
		let check = setInterval(run, 13)
	} catch(e) {
		dom.perf2 = (e.name === undefined ? zErr : trim_error(e.name, e.message))
	}
}

function get_perf3() {
	// loadEventEnd (also dom.enable_performance)
	let r = ""
	try {
		let timing = performance.timing
		r = timing.navigationStart - timing.loadEventEnd
		r = (r == 0 ? "zero" : "not zero")
		dom.perf3.innerHTML = r
	} catch(e) {
		log_error("misc: perf timing", e.name, e.message)
		dom.perf3 = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		r = isFF ? zB0 : zErr
	}
	return "perf_timing:"+ r
}

function get_perf4() {
	// also: dom.enable_performance_navigation_timing
	let r = zD
	try {
		if (window.PerformanceNavigationTiming) {r = zE}
	} catch(e) {
		log_error("misc: perf navigation", e.name, e.message)
		dom.perf4 = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		return "perf_navigation:"+ (isFF ? zB0 : zErr)
	}
	if (isVer > 77) {
		dom.perf4.innerHTML = r + (r == zD ? rfp_green : rfp_red) //78+: 1511941
	} else {
		dom.perf4 = r
	}
	return "perf_navigation:"+ r
}

function get_svg() {
	try {
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
		log_error("misc: svg", e.name, e.message)
		dom.svgBasicTest = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		return "svg:"+ (isFF ? zB0 : zErr)
	}
}

function get_wasm() {
	let res = (() => {
		try {
			if (typeof WebAssembly === "object"	&& typeof WebAssembly.instantiate === "function") {
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
	// ToDo: dom.wasm.innerHTML = (res && isTB ? zE + tb_standard : zD + tb_safer)
	let r = (res ? zE : zD)
	dom.wasm.innerHTML = r
	return "wasm:"+ r
}

function get_windowcontent() {
	let r = zD
	try {
		let test = window.content
		let test2 = content.name
		r = zE
	} catch(e) {
		log_error("misc: window content", e.name, e.message)
		let eMsg = trim_error(e.name, e.message)
		if (eMsg !== "ReferenceError: content is not defined") {
			dom.wincon = (e.name === undefined ? zErr : eMsg)
			return "window_content:"+ (isFF ? zB0 : zErr)
		}
	}
	dom.wincon = r
	return "window_content:"+ r
}

function outputMisc() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = [], r = ""
	Promise.all([
		get_reporting_api(),
		get_svg(),
		get_wasm(),
		get_perf1(),
		get_perf3(),
		get_perf4(),
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
