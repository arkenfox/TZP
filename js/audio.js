"use strict";

/* code base on
https://canvasblocker.kkapsner.de/test/
https://audiofingerprint.openwpm.com/ */

var t0audio,
	latencyError = false,
	latencyTries = 0

function byteArrayToHex(arrayBuffer){
	var chunks = [];
	(new Uint32Array(arrayBuffer)).forEach(function(num){
		chunks.push(num.toString(16));
	});
	return chunks.map(function(chunk){
		return "0".repeat(8 - chunk.length) + chunk;
	}).join("");
}

function reset_audio2() {
	dom.audio1data.style.color = zhide
	dom.audio2data.style.color = zhide
	dom.audio3data.style.color = zhide
	let str = dom.audio1data.innerHTML
	str = str.replace(/\[RFP\]/g, "")
	dom.audio1data.innerHTML = str
}

function get_audio2_context(attempt) {
	let t0 = performance.now(),
		sColor = s11
	latencyTries++

	function a(a, b, c) {
		for (let d in b) "dopplerFactor" === d || "speedOfSound" === d || "currentTime" ===
		d || "number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d])
		return a
	}
	let f = new window.AudioContext
	let obj
	let results = [],
		samplerate = ""

	let	d = f.createAnalyser()
	obj = a({}, f, "ac-")
	obj = a(obj, f.destination, "ac-")
	obj = a(obj, f.listener, "ac-")
	obj = a(obj, d, "an-")
	// build key + value array
	for (const [key, value] of Object.entries(obj)) {
		results.push(key +": "+ value)
		if (key == "ac-sampleRate") {samplerate = value}
	}
	// build output
	let k="", v="", n=0, rfp="", output=""
	for (let i=0; i < results.length; i++) {
		n = results[i].search(":")
		k = results[i].substring(0,n) // key
		v = results[i].substring(n+2) // value
		if (k == "ac-sampleRate") {v += (v == 44100 ? rfp_green : rfp_red)}
		if (k == "ac-outputLatency") {
			// FF70+ nonRFP: return 0.0 if running on a normal thread or 0 unless we detect a user gesture
			if (runS) {v = 0}
			if (v == 0) {
				latencyError = true
				//console.log("latency error", attempt)
				v += sb +"["+ zF +"]"+ sc
			} else {
				// isOS = "mac" // simulate mac
				latencyError = false
				if (isOS == "windows") {rfp = "0.04"}
				if (isOS == "android") {rfp = "0.02"}
				if (isOS == "linux") {rfp = "0.025"}
				if (isOS == "mac") {rfp = 512/samplerate}
				v += (v == rfp ? rfp_green : rfp_red)
			}
		}
		output += k.padStart(25) +": "+ v +"<br>"
	}
	// output
	if (!latencyError || latencyTries == 2) {
		dom.audio1data.innerHTML = output
		dom.audio1data.style.color = zshow
		// hash
		Promise.all([
			sha256(results.join())
		]).then(function(result){
			dom.audio1hash.innerHTML = result[0] + sColor +"["+ results.length +" keys]"+ sc
			// perf
			log_perf("context [audio]",t0)
			if (latencyTries == 2) {
				dom.audiohash2 = "hash not coded yet"
				log_click("audio2",t0audio)
				gClick = true
			}
		})
	}
	// next test
	if (latencyTries == 1) {get_audio2_hybrid()}
}

function get_audio2_hybrid() {
	let t0 = performance.now(),
		results = [],
		showperf = false
	if (latencyError == false || latencyTries == 2) {showperf = true}

	let audioCtx = new window.AudioContext,
		oscillator = audioCtx.createOscillator(),
		analyser = audioCtx.createAnalyser(),
		gain = audioCtx.createGain(),
		scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1)

	// create & configure compressor
	let compressor = audioCtx.createDynamicsCompressor()
	compressor.threshold && (compressor.threshold.value = -50)
	compressor.knee && (compressor.knee.value = 40)
	compressor.ratio && (compressor.ratio.value = 12)
	compressor.reduction && (compressor.reduction.value = -20)
	compressor.attack && (compressor.attack.value = 0)
	compressor.release && (compressor.release.value = .25)

	gain.gain.value = 0 // disable volume
	oscillator.type = "triangle" // output triangle wave
	oscillator.connect(compressor) // connect oscillator output to dynamic compressor
	compressor.connect(analyser) // connect compressor to analyser
	analyser.connect(scriptProcessor) // connect analyser output to scriptProcessor input
	scriptProcessor.connect(gain) // connect scriptProcessor output to gain input
	gain.connect(audioCtx.destination) // connect gain output to audiocontext destination

	scriptProcessor.onaudioprocess = function(bins) {
		bins = new Float32Array(analyser.frequencyBinCount)
		analyser.getFloatFrequencyData(bins)
		for (let i=0; i < bins.length; i++) {
			results.push(" "+ bins[i])
		}
		analyser.disconnect()
		scriptProcessor.disconnect()
		gain.disconnect()
		// output
		dom.audio3data = results.slice(0, 30)
		dom.audio3data.style.color = zshow
		// hash
		Promise.all([
			sha256(results.slice(0, 30))
		]).then(function(result){
			dom.audio3hash = result[0]
			// perf
			log_perf("hybrid [audio]",t0)
			if (showperf) {
				dom.audiohash2 = "hash not coded yet"
				log_click("audio2", t0audio)
				gClick = true
			}
		})
		// re-test context
		if (latencyError == true && latencyTries == 1) {get_audio2_context(2)}
	}
	oscillator.start(0)
}

function get_audio2_oscillator() {
	let t0 = performance.now()

	let cc_output = []
	let audioCtx = new window.AudioContext
	let oscillator = audioCtx.createOscillator(),
		analyser = audioCtx.createAnalyser(),
		gain = audioCtx.createGain(),
		scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1)

	gain.gain.value = 0
	oscillator.type = "triangle"
	oscillator.connect(analyser)
	analyser.connect(scriptProcessor)
	scriptProcessor.connect(gain)
	gain.connect(audioCtx.destination)

	scriptProcessor.onaudioprocess = function(bins) {
		bins = new Float32Array(analyser.frequencyBinCount)
		analyser.getFloatFrequencyData(bins)
		for (let i=0; i < bins.length; i++) {
			cc_output.push(" "+ bins[i])
		}
		analyser.disconnect()
		scriptProcessor.disconnect()
		gain.disconnect()
		// output
		dom.audio2data = cc_output.slice(0, 30)
		dom.audio2data.style.color = zshow
		// hash
		Promise.all([
			sha256(cc_output.slice(0, 30))
		]).then(function(result){
			dom.audio2hash = result[0]
			// perf
			log_perf("oscillator [audio]",t0)
		})
		// next test
		get_audio2_context(1)
	}
	oscillator.start(0)
}

function outputAudio2() {
	if (gClick) {
		gClick = false
		let tbl = document.getElementById("tb11")
		let cls = "c2"
		tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
		reset_audio2()
		t0audio = performance.now()
		latencyTries = 0
		try {
			let test = new window.AudioContext
			// each test calls the next: oscillator -> context [try1] -> hybrid -> context [try2 if req]
				// if context is run first, outputLatency *always* = 0 = incorrect : run it after oscillator
				// if context is not run first, outputLatency *sometimes* = 0 : hence context [try2]
			log_line("line")
			// update prototypelies
			Promise.all([
				outputPrototypeLies(),
			]).then(function(results){
				// start
				get_audio2_oscillator()				
			})
		} catch(e) {
			dom.audio1hash = zNA, dom.audio2hash = zNA, dom.audio3hash = zNA
			dom.audio1data = "", dom.audio2data = "", dom.audio3data = ""
			gClick = true
		}
	}
}

function outputAudio1(runtype) {
	let t0 = performance.now(),
		section = []
	try {
		let context = new window.OfflineAudioContext(1, 44100, 44100)
		// supported
		dom.audioSupport = zE
		// create oscillator
		let pxi_oscillator = context.createOscillator()
		pxi_oscillator.type = "triangle"
		pxi_oscillator.frequency.value = 1e4
		// create & configure compressor
		let pxi_compressor = context.createDynamicsCompressor()
		pxi_compressor.threshold && (pxi_compressor.threshold.value = -50)
		pxi_compressor.knee && (pxi_compressor.knee.value = 40)
		pxi_compressor.ratio && (pxi_compressor.ratio.value = 12)
		pxi_compressor.reduction && (pxi_compressor.reduction.value = -20)
		pxi_compressor.attack && (pxi_compressor.attack.value = 0)
		pxi_compressor.release && (pxi_compressor.release.value = .25)
		// connect nodes
		pxi_oscillator.connect(pxi_compressor)
		pxi_compressor.connect(context.destination)
		// start processing
		pxi_oscillator.start(0)
		context.startRendering()
		context.oncomplete = function(event) {
			let copyTest = new Float32Array(44100)
			event.renderedBuffer.copyFromChannel(copyTest, 0)
			let getTest = event.renderedBuffer.getChannelData(0)
			Promise.all([
				crypto.subtle.digest("SHA-256", getTest),
				crypto.subtle.digest("SHA-256", copyTest),
			]).then(function(hashes){
				// ToDo: add polyfill: prototypeLie checks are not reliable
				// brave lies
				let isLies = false, isBraveLies = false
				if (isBraveMode.substring(0,2) == "st") {isLies = true; isBraveLies = true}
				// sum
				let sum = 0
				for (let i=4500; i < 5000; i++) {
					sum += Math.abs(getTest[i])
				}
				pxi_compressor.disconnect()
				if (isLies) {
					sum = soL + sum + scC
					section.push("sum:"+ zLIE)
					if (gRun && isBraveLies) {gLiesKnown.push("audio:sum")}
				} else {
					section.push("sum:"+ sum)
				}
				dom.audioSum.innerHTML = sum
				// get
				let tempstr = byteArrayToHex(hashes[0])
				if (isLies) {
					tempstr = soL + tempstr + scC
					section.push("getChannelData:"+ zLIE)
					if (gRun && isBraveLies) {gLiesKnown.push("audio:getChannelData")}
				} else {
					section.push("getChannelData:"+ tempstr)
				}
				dom.audioGet.innerHTML = tempstr
				// copy
				tempstr = byteArrayToHex(hashes[1])
				if (isLies) {
					tempstr = soL + tempstr + scC
					section.push("copyFromChannel:"+ zLIE)
					if (gRun && isBraveLies) {gLiesKnown.push("audio:copyFromChannel")}
				} else {
					section.push("copyFromChannel:"+ tempstr)
				}
				dom.audioCopy.innerHTML = tempstr
				// section
				log_section("audio", t0, section)
			})
		}
	} catch(error) {
		dom.audioSupport = zD
		dom.audioCopy = zNA, dom.audioGet = zNA, dom.audioSum = zNA
		if (runtype == "load") {
			dom.audio1hash = zNA, dom.audio2hash = zNA, dom.audio3hash = zNA
		}
		// perf
		log_section("audio", t0, ["copyFromChannel:n/a","getChannelData:n/a","sum:n/a"])
	}
}

dom.audiohash2 = "hash not coded yet"
countJS("audio")
