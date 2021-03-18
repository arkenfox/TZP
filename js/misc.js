'use strict';

function get_component_shims() {
	let dString = "misc_component_shims"
	clearDetail(dString)
	let hash = ""
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Components.interfaces))
		sectionDetail[dString] = keys
		hash = sha1(keys.join())
		dom.shim.innerHTML = hash + buildButton("18", dString, keys.length)
	} catch(e) {
		hash = zU
		dom.shim = zU
	}
	return "component_shims:" + hash
}

function get_iframe_props() {
	/* https://github.com/abrahamjuliot/creepjs */
	let dString = "misc_iframe_properties"
	clearDetail(dString)
	let r
	try {
		// create iframe & append
		let id = "iframe-window-version"
		let el = document.createElement("iframe")
		el.setAttribute("id", id)
		el.setAttribute('style', 'display: none')
		document.body.appendChild(el)
		// get properties
		let iframe = document.getElementById(id)
		let contentWindow = iframe.contentWindow
		let props = Object.getOwnPropertyNames(contentWindow)
		// remove iframe
		iframe.parentNode.removeChild(iframe)
		// always sort: too many unknown variables: e.g. various console tabs vs Event, Location
		//props.push(props.splice(props.indexOf("Event"), 1)[0])
		props.sort()
		// output
		let output = props.length
		output = sha1(props.join()) + buildButton("18", dString, output)
		sectionDetail[dString] = props
		dom.iProps.innerHTML = output
		r= sha1(props.join())
	} catch(e) {
		dom.iProps.innerHTML = error_iframe
		r = "error"
	}
	return "iframe_properties:" + r
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
	// compare: use a range as zoom affects diff
	let pre = " | offsetHeight difference: ",
		post = (diff < 10 ? tb_safer : tb_standard)
	dom.mathml.innerHTML = (diff < 10 ?	zD : zE) + pre + diff + (isTB ? post : "")
	return "mathml:" + (diff < 10 ?	zD : zE)
}

function get_nav_prototype() {
	// reset
	let dTrue = "misc_navigator_true_keys"
	let dFake = "misc_navigator_fake_keys"
	clearDetail(dTrue)
	clearDetail(dFake)

	let hash
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		let trueKeys = keys
		let lastKeyIndex = keys.length
		let fakeKeys = [], fakeStr = ""

		if (isFF) {
			// FF: constructor is always last
			lastKeyIndex = keys.indexOf("constructor")
			trueKeys = keys.slice(0, lastKeyIndex+1)
			fakeKeys = keys.slice(lastKeyIndex+1)
		} else if (isEngine == "blink") {
			// chromium last key is inconsistent
			// split knownPoison from trueKeys into fakeKeys
			let knownPoison = ["SharedWorker", "Worker", "buildID", "getVRDisplays", "activeVRDisplays", "oscpu"]
			trueKeys = keys.filter(x => !knownPoison.includes(x))
			fakeKeys = keys.filter(x => knownPoison.includes(x))
		}
		// true
		sectionDetail[dTrue] = trueKeys
		hash = sha1(trueKeys.join())
		// fake
			//fakeKeys = ["imfake"] // test
		if (fakeKeys.length > 0) {
			sectionDetail[dFake] = fakeKeys
			fakeStr = fakeKeys.length + " lie" + (fakeKeys.length > 1 ? "s" : "")
			fakeStr = buildButton("18", dFake, fakeStr)
			// global lies
			if (!sRerun) {
				liesKnown.push("misc:navigator")
			}
		}
		// display
		let display = hash + buildButton("18", dTrue, trueKeys.length)
		dom.nProto.innerHTML = display + fakeStr
	} catch(e) {
		hash = zB0
		dom.nProto = hash
	}
	return "navigator_properties:" + hash
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
		//console.log("recursion:", test1, level)
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
			r = zD + " or " +zNS
			dom.reportingAPI = zD+" [or "+zNS+"]"
		}
	}
	return "reporting_observer:" + r
}

function get_perf1() {
	// mark (seems only RFP affects this)
	let r1 = ""
	try {
		performance.mark("test")
		if (performance.mark === undefined) {
			r1 = zNA
		} else {
				performance.mark("a")
				r1 = performance.getEntriesByName("a","mark").length
					+ ", " + performance.getEntries().length
					+ ", " + performance.getEntries({name:"a", entryType:"mark"}).length
					+ ", " + performance.getEntriesByName("a","mark").length
				performance.clearMarks()
		}
	} catch(e) {r1 = zB0}
	dom.perf1.innerHTML = r1 + (r1 == "0, 0, 0, 0" ? rfp_green: rfp_red)
	r1 = (r1 == "0, 0, 0, 0" ? "zero" : "not zero")	
	return "perf_mark:" + r1
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
			dom.perf2.innerHTML = (result? "100 ms" + rfp_green : times.join(", ") + rfp_red)
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
	return "perf_timing:" + r
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
	return "perf_navigation:" + r
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
	return "svg:" + r
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
	// ToDo: dom.wasm.innerHTML = (supported ? zE+tb_standard : zD+tb_safer) // currently alpha
	let r = (supported ? zE : zD )
	dom.wasm = r
	return "wasm:" + r
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
	return "window_content:" + r
}

function outputMisc(type) {
	let t0 = performance.now()
	let section = [], r = ""

	// other
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
		section_info("misc", t0, section)
	})

	// perf2 is not needed in the hash as performance.mark is RFP unique
	get_perf2()
	// ToDO: experimental: bucketize?
	get_recursion()

}

countJS("misc")
