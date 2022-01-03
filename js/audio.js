"use strict";

/* code base on
https://canvasblocker.kkapsner.de/test/
https://audiofingerprint.openwpm.com/ */

var t0audio,
	latencyError = false,
	latencyTries = 0,
	audio2Section = []

function byteArrayToHex(arrayBuffer){
	var chunks = [];
	(new Uint32Array(arrayBuffer)).forEach(function(num){
		chunks.push(num.toString(16));
	});
	return chunks.map(function(chunk){
		return "0".repeat(8 - chunk.length) + chunk;
	}).join("");
}

function exit_audio2() {
	// why am i getting 4 or 5 metrics on cold load first run android
	if (isOS == "android" && audio2Section.length > 3) {
		dom.debugB.innerHTML = audio2Section.join("<br>")
	}
	audio2Section.sort()
	let sName = "audio_user_gestures_notglobal"
	sDetail[sName] = audio2Section
	let hash = sha1(audio2Section.join())
	dom.audiohash2.innerHTML = hash + buildButton("0", sName, audio2Section.length +" metrics")
	log_click("audio2",t0audio)
	gClick = true
}

function get_audio2_context(attempt) {
	try {
		let t0; if (canPerf) {t0 = performance.now()}
		latencyTries++
		let sName = "audio_audiocontext_keys_notglobal"
		sDetail[sName] = []
		function a(a, b, c) {
			for (let d in b) "dopplerFactor" === d || "speedOfSound" === d || "currentTime" ===
			d || "number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d])
			return a
		}
		let f = new window.AudioContext
		let obj
		let results = [], keynames = [], subset = [], isLie = false, note = ""
		let subsetExclude = ["ac-outputLatency","ac-sampleRate","ac-maxChannelCount","an-channelCount"]

		let	d = f.createAnalyser()
		obj = a({}, f, "ac-")
		obj = a(obj, f.destination, "ac-")
		obj = a(obj, f.listener, "ac-")
		obj = a(obj, d, "an-")
		// get keys/value
		for (const [key, value] of Object.entries(obj)) {
			let testValue = value
			if (key == "ac-outputLatency") {
				// FF70+ nonRFP: return 0.0 if running on a normal thread or 0 unless we detect a user gesture
				if (runS) {
					console.log("running context: attempt", attempt, "latencyTry #" + latencyTries)
					if (attempt == 1) {testValue = 0; console.log("spoofing "+ key)}
				}
				latencyError = (testValue == 0 ? true : false)
			}
			if (runSL && key == "ac-sampleRate") {
				// simulate cydec dropping a key
			} else {
				results.push(key +":"+ testValue)
				keynames.push(key)
			}
			if (!subsetExclude.includes(key)) {subset.push(key +":"+ testValue)}
		}
		// output
		if (!latencyError || latencyTries == 2) {
			sDetail[sName] = results
			let hash = sha1(results.join())
			// catch tampering
			if (isFF && !isFFLegacy) {
				isLie = true
				keynames.sort(); subset.sort() // stability
				let lieHash = sha1(keynames.join())
				let subHash = sha1(subset.join())
				if (isVer < 70 && lieHash == "406e1a6ed448d535be7a5c38e923afeb4214502b") {isLie = false}
				if (isVer > 69 && lieHash == "6be86802849b991e2ce6b966234cbd116c2b84e5") {isLie = false}
				if (subHash == "b82a976312cf08e6e139b3dcee6c02aa412913c2") {isLie = false}
				note = rfp_red
				if (isOS == "windows" && hash == "de8fd7c6816c16293e70f0491b1cf83968395f0e") {note = rfp_green} // 0.04
				if (isOS == "linux" && hash == "cb6fec6d4fce83d943b6f5aef82a450973097fb1") {note = rfp_green} // 0.02
				if (isOS == "android" && hash == "325d1b92a5e390c21c116296b65c5c39fbbd331e") {note = rfp_green} // 0.025
				if (isOS == "mac" && hash == "076e1691483e6680c092b9aecc5f2e5270bf32b9") {note = rfp_green} // 512/44100 (RFP hardcodes samplerate)
			}
			audio2Section.push("keys:"+ (isLie ? zLIE : hash))
			if (isLie) {hash = soL + hash + scC}
			dom.audio1hash.innerHTML = hash + buildButton("11", sName, results.length +" keys") + note
				+ (latencyError ? sb +" [0 latency]"+ sc : "")
			log_perf("context [audio]",t0)
			if (latencyTries == 2) {
				exit_audio2()
			}
		}
		// next test
		if (latencyTries == 1) {get_audio2_hybrid()}
	} catch(e) {
		dom.audio1hash = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		audio2Section.push("keys:"+ isFF ? zErr : zB0)
		// next test
		if (latencyTries == 1) {get_audio2_hybrid(); latencyTries = 2}
	}
}

function get_audio2_hybrid() {
	try {
		let t0; if (canPerf) {t0 = performance.now()}
		let sName = "audio_audiocontext_hybrid_notglobal"
		sDetail[sName] = []

		let results = [],
			showperf = false
		if (latencyError == false || latencyTries == 2) {showperf = true}

		let audioCtx = new window.AudioContext,
			oscillator = audioCtx.createOscillator(),
			analyser = audioCtx.createAnalyser(),
			gain = audioCtx.createGain(),
			scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1)

		// compressor
		let compressor = audioCtx.createDynamicsCompressor()
		compressor.threshold && (compressor.threshold.value = -50)
		compressor.knee && (compressor.knee.value = 40)
		compressor.ratio && (compressor.ratio.value = 12)
		compressor.reduction && (compressor.reduction.value = -20)
		compressor.attack && (compressor.attack.value = 0)
		compressor.release && (compressor.release.value = .25)

		gain.gain.value = 0 // 0 volume
		oscillator.type = "triangle" // wave
		oscillator.connect(compressor)
		compressor.connect(analyser)
		analyser.connect(scriptProcessor)
		scriptProcessor.connect(gain)
		gain.connect(audioCtx.destination)

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
			if (runSL) {results = []}
			sDetail[sName] = results
			let hash = sha1(results.join())
			let isLie = results.length == 0 ? true : false
			if (isLie) {hash = soL + hash + scC}
			dom.audio3hash.innerHTML = hash + buildButton("11", sName)
			audio2Section.push("hybrid:"+ (isLie ? zLIE : hash))
			log_perf("hybrid [audio]",t0)
			if (showperf) {
				exit_audio2()
			}
			// re-test context
			if (latencyError == true && latencyTries == 1) {get_audio2_context(2)}
		}
		oscillator.start(0)
	} catch(e) {
		dom.audio3hash = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		audio2Section.push("hybrid:"+ isFF ? zErr : zB0)
		// re-test context
		if (latencyError == true && latencyTries == 1) {get_audio2_context(2)}		
	}
}

function get_audio2_oscillator() {
	try {
		let t0; if (canPerf) {t0 = performance.now()}
		let sName = "audio_audiocontext_oscillator_notglobal"
		sDetail[sName] = []

		let results = [],
			audioCtx = new window.AudioContext
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
				results.push(" "+ bins[i])
			}
			analyser.disconnect()
			scriptProcessor.disconnect()
			gain.disconnect()
			// output
			if (runSL) {results = []}
			sDetail[sName] = results
			let hash = sha1(results.join())
			let isLie = results.length == 0 ? true : false
			if (isLie) {hash = soL + hash + scC}
			dom.audio2hash.innerHTML = hash + buildButton("11", sName)
			audio2Section.push("oscillator:"+ (isLie ? zLIE :hash))
			log_perf("oscillator [audio]",t0)
			// next test
			get_audio2_context(1)
		}
		oscillator.start(0)
	} catch(e) {
		dom.audio2hash = (e.name === undefined ? zErr : trim_error(e.name, e.message))
		audio2Section.push("oscillator:"+ isFF ? zErr : zB0)
		// next test
		get_audio2_context(1)
	}
}

function outputAudio2() {
	if (gClick) {
		gClick = false
		gRun = false
		audio2Section = [] // reset
		try {
			let test = new window.AudioContext
			let tbl = document.getElementById("tb11")
			let cls = "c2"
			tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
			// each test calls the next: oscillator -> context[try1] -> hybrid -> context[try2 if req]
				// if context is run first, outputLatency *always* = 0 = incorrect : run it after oscillator
				// if context is not run first, outputLatency *sometimes* = 0 : hence context [try2]
			Promise.all([
				outputPrototypeLies(),
			]).then(function(results){
				if (canPerf) {gt0 = performance.now(); t0audio = gt0}
				latencyTries = 0
				log_line("line")
				get_audio2_oscillator() // start
			})
		} catch(e) {
			// output something
			let eMsg = (e.name === undefined ? zErr : trim_error(e.name, e.message))
			dom.audio1hash = eMsg, dom.audio2hash = eMsg, dom.audio3hash = eMsg
			dom.audiohash2 = zNA
			gClick = true
		}
	}
}

function outputAudio() {
	let t0; if (canPerf) {t0 = performance.now()}
	let sName = "offlineaudiocontext"
	let knownGood = [
		124.0434474653739,124.04344884395687,124.0434488439787,124.04344968475198,124.04345023652422,
		124.04345808873768,124.04347503720783,124.04347527516074,124.04347657808103,124.04347721464,
		124.04347730590962,124.0434806260746,124.04348210548778,124.080722568091,124.08072291687131,
		124.08072618581355,124.08072787802666,124.08072787804849,124.08073069039528,124.08074500028306,
		124.08075528279005,]
	if (isFF) {
		knownGood = [35.7383295930922,35.73833039775491,35.73833402246237,35.74996018782258,
		35.7499681673944,35.74996031448245]
	}
	try {
		let context = new window.OfflineAudioContext(1, 44100, 44100)
		dom.audioSupport = zE
		// oscillator
		let pxi_oscillator = context.createOscillator()
		pxi_oscillator.type = "triangle"
		pxi_oscillator.frequency.value = 1e4
		// compressor
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
		// process
		pxi_oscillator.start(0)
		context.startRendering()
		context.oncomplete = function(event) {
			try {
				let copyTest = new Float32Array(44100)
				event.renderedBuffer.copyFromChannel(copyTest, 0)
				let getTest = event.renderedBuffer.getChannelData(0)
				Promise.all([
					crypto.subtle.digest("SHA-256", getTest),
					crypto.subtle.digest("SHA-256", copyTest),
				]).then(function(hashes){
					// sum
					let sum = 0, sum2 = 0, sum3 = 0
					for (let i=0; i < getTest.length; i++) {
						let x = getTest[i]
						if (i > 4499 && i < 5000) {sum += Math.abs(x)}
						sum2 += x
						sum3 += Math.abs(x)
					}
					// lies
					let isLies = (isBraveMode > 1 && !isFile)
					if (sum2 == sum3) {isLies = true}
					if (isFF || isEngine == "blink") {
						if (!knownGood.includes(sum)) {isLies = true}
					}
					pxi_compressor.disconnect()
					// get/copy
					let hashG = sha1(byteArrayToHex(hashes[0]), "audio get")
					let hashC = sha1(byteArrayToHex(hashes[1]), "audio copy")
					if (hashG !== hashC) {isLies = true}
					// display/FP
					if (sum == 0 && hashG == "ca630f35dd78934792a4e2ba27cf95c340421db4") {
						let note = "empty arrayBuffer"
						if (gRun) {gCheck.push("audio:"+ sName +": "+ note)}
						dom.audioSum = sum; dom.audioGet = note; dom.audioCopy = note
						log_section("audio", t0, [sName +":failed"])
					} else {
						if (gRun && isLies) {gKnown.push("audio:"+ sName)}
						dom.audioSum.innerHTML = (isLies ? soL + sum + scC : sum)
						dom.audioGet.innerHTML = (isLies ? soL + hashG + scC : hashG)
						dom.audioCopy.innerHTML = (isLies ? soL + hashC + scC : hashC)
						log_section("audio", t0, [sName +":"+ (isLies ? zLIE : hashG)])
					}
				})
			} catch(e) {
				log_error("audio: "+ sName, e.name, e.message)
				let eMsg = trim_error(e.name, e.message)
				eMsg = (e.name === undefined ? zErr : eMsg)
				dom.audioCopy = eMsg; dom.audioGet = eMsg; dom.audioSum = eMsg
				log_section("audio", t0, [sName+ ":"+ (isFF ? zB0 : zErr)])
			}
		}
	} catch(error) {
		dom.audioSupport = zD; dom.audioCopy = zNA; dom.audioGet = zNA; dom.audioSum = zNA
		if (gRun) {dom.audiohash2 = zNA, dom.audio1hash = zNA, dom.audio2hash = zNA, dom.audio3hash = zNA}
		log_section("audio", t0, [sName +":n/a"])
	}
}

countJS("audio")
