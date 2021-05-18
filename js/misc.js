'use strict';

function get_component_shims() {
	let sName = "misc_component_shims"
	clearDetail(sName)
	let sHash = ""
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Components.interfaces))
		sDetail[sName] = keys
		sHash = sha1(keys.join())
		dom.shim.innerHTML = sHash + buildButton("18", sName, keys.length)
	} catch(e) {
		sHash = zU
		dom.shim = zU
	}
	return "component_shims:"+ sHash
}

function get_iframe_props() {
	/* https://github.com/abrahamjuliot/creepjs */
	let sTrue = "misc_iframe_window_properties"
	let sFake = sTrue + "_fake_skip"
	let sSuspect = sTrue + "_suspect_skip"
	let sAll = sTrue + "_reported_skip"
	clearDetail(sTrue)
	clearDetail(sFake)
	clearDetail(sSuspect)
	clearDetail(sAll)

	let knownGood = [
		// acculumative
		// cydec
		'CanvasRenderingContext2D','CSSStyleDeclaration','CSS2Properties','SharedWorker','Worker',
		'MediaDevices','AudioNode','AnalyserNode','SpeechSynthesis','AudioBuffer','Element','HTMLElement',
		'HTMLCanvasElement','SVGElement','SVGGraphicsElement','SVGTextContentElement','RTCPeerConnection',
		'mozRTCPeerConnection','RTCDataChannel','RTCRtpReceiver','Date','Intl','Navigator','Geolocation',
		// chameleon
		'AbstractRange','Range','History','BaseAudioContext','AudioContext','OfflineAudioContext','FontFaceSet','Screen',
		// CB
		'Location','MediaQueryList','WebGLRenderingContext','WebGL2RenderingContext','BiquadFilterNode',
		'IIRFilterNode','CharacterData','Text','SVGGeometryElement','SVGPathElement','DOMRectReadOnly',
		'DOMRect','SVGRect','IntersectionObserverEntry','TextMetrics','HTMLIFrameElement','HTMLFrameElement',
		// Trace
		'PluginArray',
		// ScriptSafe
		'Array','HTMLDivElement',
	]
	if (isTB) {
		knownGood.push('HTMLObjectElement', 'MediaSource', 'URL', 'webkitURL')
	}

	let r
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
		let allProps = props
		sDetail[sAll] = allProps
		let suspectProps = [], fakeProps = [], suspectStr = "", fakeStr = ""
		if (isFF) {
			// suspect
			suspectProps = props.slice(props.indexOf("Performance")+1)
			let falsePos = ['Event','StyleSheetList'] // false positives
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
					// lies
					if (gRun) {
						gLiesKnown.push("misc:iframe window properties")
						gLiesBypassed.push("misc:iframe window properties:"+ sha1(props.sort()))
					}
				}
			}
		}
		// sort (open console can affect order) + output
		// real
		props.sort()
		sDetail[sTrue] = props
		// display
		allProps.sort()
		let output = sha1(allProps.join())
		if (fakeProps.length) {output = soB + output + scC}
		output += buildButton("18", sAll, sDetail[sAll].length) + suspectStr + fakeStr
		dom.iProps.innerHTML = output
		r= sha1(props.join())
	} catch(e) {
		r = "error"
		dom.iProps = r
	}
	return "iframe_properties:"+ r
}

function get_mathml() {
	// build
	let str = "<math><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo form='prefix'>&minus;</mo><mi>b</mi>"+
		"<mo>&PlusMinus;</mo><msqrt><msup><mi>b</mi><mn>2</mn></msup><mo>&minus;</mo><mn>4</mn>"+
		"<mo>&InvisibleTimes;</mo><mi>a</mi><mo>&InvisibleTimes;</mo><mi>c</mi></msqrt></mrow>"+
		"<mrow><mn>2</mn><mo>&InvisibleTimes;</mo><mi>a</mi></mrow></mfrac></mrow></math>"
	dom.mathmltest.innerHTML = str
	dom.mathmltest.style.color = zshow
	// measure
	let test = dom.mathmltest.offsetHeight,
		control = dom.reportingAPI.offsetHeight, // a row with plain text and info icon
		diff = Math.abs(test-control)
	// compare: use range: zoom affects diff
	let pre = " | offsetHeight difference: ",
		post = (diff < 10 ? tb_safer : tb_standard)
	dom.mathml.innerHTML = (diff < 10 ?	zD : zE) + pre + diff + (isTB ? post : "")
	return "mathml:"+ (diff < 10 ?	zD : zE)
}

function get_nav_prototype() {
	// use global
	let sTrue = "misc_navigator_keys",
		sFake = "misc_navigator_keys_fake_skip",
		sMoved = "misc_navigator_keys_moved_skip",
		sAll = "misc_navigator_keys_reported_skip"
	sDetail[sTrue] = navKeys["trueKeys"]
	sDetail[sFake] = navKeys["fakeKeys"]
	sDetail[sMoved] = navKeys["movedKeys"]
	sDetail[sAll] = navKeys["allKeys"]
	let lieLength = navKeys["fakeKeys"].length,
		movedLength = navKeys["movedKeys"].length,
		fakeStr = "",
		movedStr = "",
		realhash = zB0
	// output
	if (navKeys["trueKeys"]) {
		let hash = sha1(navKeys["allKeys"].join())
		let display = hash
		realhash = sha1(navKeys["trueKeys"].join())
		// moved
		if (movedLength) {
			movedStr = buildButton("18", sMoved, movedLength +" moved")
			// method
			if (gRun) {
				gLiesMethods.push("misc:navigator keys: expected keys moved")
			}
		}
		// fake
		if (lieLength) {
			display = soB + hash + scC
			fakeStr = buildButton("18", sFake, lieLength +" lie"+ (lieLength > 1 ? "s" : ""))
			// lies
			if (gRun) {
				gLiesKnown.push("misc:navigator keys")
				gLiesBypassed.push("misc:navigator keys:"+realhash)
			}
		}
		dom.nProto.innerHTML = display + buildButton("18", sAll, navKeys["allKeys"].length) + fakeStr + movedStr
	} else {
		dom.nProto = realhash
	}
	return "navigator_keys:"+ realhash
}

function get_recursion() {
	let level = 0, test1 = 0
	function recurse() {
		level++
		recurse()
	}
	try {
		recurse()
	} catch (e) {
		test1 = level
	}
	level = 0
	try {
		recurse()
	} catch (e) {
		// 2nd test is more accurate/stable
		dom.recursion = level
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
		if (isFF) {
			r = (isVer > 64 ? zD : zNS )
			dom.reportingAPI = r
		} else {
			r = zD +" or "+ zNS
			dom.reportingAPI = zD +" [or "+ zNS +"]"
		}
	}
	return "reporting_observer:"+ r
}

function get_perf1() {
	let control = "0, 0, 0, 0",
		isLies = false,
		test = ""
	// get result
	try {
		performance.mark("test")
		if (performance.mark === undefined) {
			test = zNA
		} else {
				performance.mark("a")
				test = performance.getEntriesByName("a","mark").length
					+", "+ performance.getEntries().length
					+", "+ performance.getEntries({name:"a", entryType:"mark"}).length
					+", "+ performance.getEntriesByName("a","mark").length
				performance.clearMarks()
		}
	} catch(e) {test = zB0}
	// simulate
	if (runSL && isFF) {
		if (isRFP) {test = "1, 4, 4, 1"} else {test = control}
	}
	// compare
	let value = (test == control ? "zero" : "not zero")
	if (isRFP) {
		value = "zero"
		if (control !== test) {isLies = true}
	} else if (isFF) {
		value = "not zero"
		if (control == test) {isLies = true}
	}
	// display
	if (isLies) {
		if (gRun) {
			gLiesKnown.push("misc:performance.mark")
			gLiesBypassed.push("misc:performance.mark:"+value)
		}
		dom.perf1.innerHTML = soB + test + scC
	} else {
		dom.perf1.innerHTML = test + (test == control ? rfp_green : rfp_red)
	}
	return "perf_mark:"+value
}

function get_perf2() {
	let i = 0,
		result = true,
		times = [],
		p0 = Math.round(performance.now())
	function run() {
		if (i < 10) {
			let p1 = Math.round(performance.now())
			times.push((p1-p0) % 100)
			if ((p1-p0) % 100 > 0) {result = false}
			i++
		} else {
			clearInterval(check)
			let display = times.join(", ")
			// simulate
			if (runSL) {
				isPerf = false
				if (isRFP) {
					display = "21, 35, 49, 62, 76, 88, 1, 15, 28, 41"
				} else {
					display = "0, 0, 0, 0, 0, 0, 0, 0, 0, 0"
				}
			}
			// control
			if (isPerf) {
				dom.perf2.innerHTML = (result ? "100 ms"+ rfp_green : display + rfp_red)
			} else {
				display = (isFF ? soB : soL) + display + scC
				dom.perf2.innerHTML = display
			}
		}
	}
	let check = setInterval(run, 13)
}

function get_perf3() {
	// loadEventEnd (also dom.enable_performance)
	let r = ""
	try {
		let timing = performance.timing
		r = timing.navigationStart - timing.loadEventEnd
		r = (r == 0 ? "zero" : "not zero")
	} catch(e) {r = zB0}
	dom.perf3.innerHTML = r
	return "perf_timing:"+ r
}

function get_perf4() {
	// also: dom.enable_performance_navigation_timing
	let r = zD
	try {
		if (window.PerformanceNavigationTiming) {r = zE}
	} catch(e) {r = zB0}
	if (isVer > 77) {
		dom.perf4.innerHTML = r + (r == zD ? rfp_green : rfp_red) //78+: 1511941
	} else {
		dom.perf4 = r
	}
	return "perf_navigation:"+ r
}

function get_svg() {
	// svg
	let s = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	s.setAttribute("width","100")
	s.setAttribute("height","100")
	// circle
	let c = document.createElementNS("http://www.w3.org/2000/svg", "circle")
	c.setAttributeNS(null,"cx",50)
	c.setAttributeNS(null,"cy",50)
	c.setAttributeNS(null,"r",40)
	// attach circle->svg->element
	s.appendChild(c)
	dom.svgDiv.appendChild(s)
	// output
	let r = (dom.svgDiv.offsetHeight > 0 ? zE : zD)
	dom.svgBasicTest = r
	// remove
	dom.svgDiv.removeChild(s)
	return "svg:"+ r
}

function get_wasm() {
	let supported = (() => {
		try {
			if (typeof WebAssembly === "object"	&& typeof WebAssembly.instantiate === "function") {
				const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))
				if (module instanceof WebAssembly.Module)
					return new WebAssembly.Instance(module) instanceof WebAssembly.Instance
			}
		} catch (e) {}
		return false
	})()
	// ToDo: dom.wasm.innerHTML = (supported && isTB ? zE + tb_standard : zD + tb_safer)
	let r = (supported ? zE : zD )
	dom.wasm = r
	return "wasm:"+ r
}

function get_windowcontent() {
	let r
	try {
		let test = window.content
		let test2 = content.name
		r = zE
	} catch(e) {
		r = zD
	}
	dom.wincon = r
	return "window_content:"+ r
}

function outputMisc(type) {
	let t0 = performance.now()
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
		get_mathml(),
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		log_section("misc", t0, section)
	})

	// perf2 is RFP unique
	get_perf2()
	// ToDO: experimental: bucketize?
	get_recursion()

}

countJS("misc")
