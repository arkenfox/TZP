'use strict';

function reset_misc() {
	dom.nProto2.style.color = zhide
	dom.shimdata.style.color = zhide
	dom.mathmltest.style.color = zhide
}

function get_component_shims() {
	let shim = (typeof Components === "undefined") ? zU : Object.getOwnPropertyNames(Components.interfaces).join(", ")
	dom.shimdata = shim
	dom.shimdata.style.color = zshow
	if (shim !== zU) {shim = sha1(shim) + s18 +"["+ shim.split(", ").length +"]"+ sc}
	dom.shim.innerHTML = shim
}

function get_iframe_props() {
	/* https://github.com/abrahamjuliot/creepjs */
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
		// output
		dom.iProps.innerHTML = sha1(props.join()) + s18 +"["+ props.length +"]"+sc
	} catch(e) {
		dom.iProps.innerHTML = error_iframe
	}
}

function get_int_observer() {
	let callback = function(entries, observer) {}
	try {
		let observer = new IntersectionObserver(callback)
		dom.intObserver = zE
	} catch(e) {
		dom.intObserver = zD
	}
}

function get_mathml(type) {
	// build
	let str = "<math><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo form='prefix'>&minus;</mo><mi>b</mi>"+
		"<mo>&PlusMinus;</mo><msqrt><msup><mi>b</mi><mn>2</mn></msup><mo>&minus;</mo><mn>4</mn>"+
		"<mo>&InvisibleTimes;</mo><mi>a</mi><mo>&InvisibleTimes;</mo><mi>c</mi></msqrt></mrow>"+
		"<mrow><mn>2</mn><mo>&InvisibleTimes;</mo><mi>a</mi></mrow></mfrac></mrow></math>"
	dom.mathmltest.innerHTML = str
	dom.mathmltest.style.color = zshow
	// measure
	let test = dom.mathmltest.offsetHeight,
		control = dom.nOnLine.offsetHeight, // a row with plain text and info icon
		diff = Math.abs(test-control)
	// compare: use a range as zoom affects diff
	let pre = " | offsetHeight difference: ",
		post = (diff < 10 ? tb_safer : tb_standard)
	dom.mathml.innerHTML = (diff < 10 ?	zD : zE) + pre + diff + post
}

function get_nav_prototype() {
	try {
		let nProto = Object.keys(Object.getPrototypeOf(navigator)).join(", ")
		dom.nProto.innerHTML = sha1(nProto) + s18 +"["+ nProto.split(', ').length +"]"+ sc
		dom.nProto2 = nProto
		dom.nProto2.style.color = zshow
	} catch(e) {
		dom.nProto.innerHTML = zB
		dom.nProto2 = ""
	}
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
		console.log("recursion:", test1, level)
	}
}

function get_reporting_api() {
	// FF65+
	try {
		let observer = new ReportingObserver(function() {})
		dom.reportingAPI = zE
	} catch(e) {
		if (isFF) {
			dom.reportingAPI = (isVer > 64 ? zD : zNS )
		} else {
			dom.reportingAPI = zD+" [or "+zNS+"]"
		}
	}
}

function get_perf() {
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

function get_perf2() {
	// loadEventEnd (also dom.enable_performance)
	let r3 = ""
	try {
		let timing = performance.timing
		r3 = timing.navigationStart - timing.loadEventEnd
		r3 = (r3 == 0 ? "zero" : "not zero")
	} catch(e) {r3 = zB}
	dom.perf3.innerHTML = r3

	// also: dom.enable_performance_navigation_timing
	let r4 = zD
	try {
		if (window.PerformanceNavigationTiming) {r4 = zE}
		if (isVer > 77) {
			r4 += (r4 == zD ? rfp_green : rfp_red) //78+: 1511941
		}
	} catch(e) {r4 = zB}
	dom.perf4.innerHTML = r4

	// mark (seems only RFP affects this)
	let r1 = ""
	try {
		performance.mark("test")
		if (performance.mark === undefined) {
			r1 = "not supported"
		} else {
				performance.mark("a")
				r1 = performance.getEntriesByName("a","mark").length
					+ ", " + performance.getEntries().length
					+ ", " + performance.getEntries({name:"a", entryType:"mark"}).length
					+ ", " + performance.getEntriesByName("a","mark").length
				performance.clearMarks()
				r1 += (r1 == "0, 0, 0, 0" ? rfp_green: rfp_red)
		}
	} catch(e) {r1 = zB}
	dom.perf1.innerHTML = r1
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
	dom.svgBasicTest = (dom.svgDiv.offsetHeight > 0 ? zE : zD)
	// remove
	dom.svgDiv.removeChild(s)
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
	dom.wasm = (supported ? zE : zD )
}

function get_windowcontent() {
	try {
		let test = window.content
		let test2 = content.name
		return zE
	} catch(e) {
		return zD
	}
}

function outputMisc(type) {
	let t0 = performance.now()
	// one-liners
	try {dom.nBeacon = (navigator.sendBeacon ? zE : zD)} catch(e) {dom.nBeacon.innerHTML = zB}
	try {dom.webshare = (navigator.share ? zE : zD)} catch(e) {dom.webshare.innerHTML = zB}
	dom.nClipboard = ("clipboard" in navigator ? zE: zD) // FF63+
	dom.reqIdleCB = ("requestIdleCallback" in window ? zE: zD)
	dom.mediaSession = ("mediaSession" in navigator ? zE: zD) // FF71+
	dom.webauth = ("credentials" in navigator ? zE: zD) +" | "+ ("u2f" in window ? zE: zD)
	dom.wincon = get_windowcontent()
	// other
	get_component_shims()
	get_iframe_props()
	get_int_observer()
	get_mathml(type)
	get_nav_prototype()
	get_reporting_api()
	get_svg()
	get_wasm()
	get_perf()
	get_perf2()
	get_recursion()
	// perf
	debug_page("perf","misc",t0,gt0)
}

outputMisc("load")
