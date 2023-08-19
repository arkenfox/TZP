"use strict";

/* code based on
https://canvasblocker.kkapsner.de/test/
https://audiofingerprint.openwpm.com/ */

function byteArrayToHex(arrayBuffer){
	var chunks = [];
	(new Uint32Array(arrayBuffer)).forEach(function(num){
		chunks.push(num.toString(16));
	});
	return chunks.map(function(chunk){
		return "0".repeat(8 - chunk.length) + chunk;
	}).join("");
}

function check_audioLies() {
	if (!isSmart) {return false}
	const audioList = [
		"AnalyserNode.getByteFrequencyData","AnalyserNode.getByteTimeDomainData",
		"AnalyserNode.getFloatFrequencyData","AnalyserNode.getFloatTimeDomainData",
		"AudioBuffer.copyFromChannel","AudioBuffer.getChannelData",
		"BiquadFilterNode.getFrequencyResponse",
	]
	if (runSL && isSmart) {sData[SECT99].push("AudioBuffer.copyFromChannel")}
	return audioList.some(lie => sData[SECT99].indexOf(lie) >= 0)
}

const get_audio2_context = (os = isOS) => new Promise(resolve => {
	const METRIC = "audioContext_keys"
	try {
		if (runSE) {foo++}
		let t0 = nowFn()
		// get unsorted
		function a(a, b, c) {
			for (let d in b) "dopplerFactor" === d || "speedOfSound" === d || "currentTime" ===
			d || "number" !== typeof b[d] && "string" !== typeof b[d] || (a[(c ? c : "") + d] = b[d])
			return a
		}
		let f = new window.AudioContext
		let obj
		let	d = f.createAnalyser()
		obj = a({}, f, "ac-")
		obj = a(obj, f.destination, "ac-")
		obj = a(obj, f.listener, "ac-")
		obj = a(obj, d, "an-")

		// sim
		if (runSL) {obj["ac-channelCount"] = 4} // fake value

		let oCheck = {}, isLies = false, note = "", latencynote = ""
		let subsetExclude = ["ac-outputLatency","ac-sampleRate","ac-maxChannelCount","an-channelCount"]
		// sort keys
		let objnew = {}
		for (const k of Object.keys(obj).sort()) {
			objnew[k] = obj[k]
			oCheck[k] = subsetExclude.includes(k) ? "" : obj[k]
		}
		let hash = mini(objnew) // includes original latency

		if (isSmart) {
			if (mini(oCheck) !== "dfda7813") {isLies = true} // FF70+: keys [20] + expected hardcoded values [16]
			if (os !== undefined) {
				// RFP notation: includes 1564422 outputLatency
				note = rfp_red
				if (hash == "67a3eeee" && os == "windows") {note = rfp_green // 0.04
				} else if (hash == "debdefc0" && os == "mac") {note = rfp_green // 512/44100 (RFP hardcodes latency)
				} else if (hash == "2b9d44b0" && os == "android") {note = rfp_green // 0.02
				} else if (hash == "9b69969b") {note = rfp_green // 0.025 catchall incl linux
				}
			}
		}

		// ac-outputLatency is variable per tab and even on page load
			// so on non RFP hashes, change it to variable and display the original on screen
		if (note !== rfp_green) {
			latencynote = " [" + objnew["ac-outputLatency"]+ " latency]"
			objnew["ac-outputLatency"] = "variable"
			hash = mini(objnew)
		}
		let displayHash = isLies ? colorFn(hash) : hash
		addDetail(METRIC, objnew, zDOC)

		dom.audio1hash.innerHTML = displayHash + addButton(11, METRIC, Object.keys(objnew).length +" keys") + note + latencynote
		log_perf(SECT11, "context", t0)
		return resolve([METRIC, (isLies ? zLIE : addData("none", METRIC, objnew, hash))])

	} catch(e) {
		let eMsg = log_error(SECT11, METRIC, e)
		let notation = (isTB && !isMullvad) ? "" : rfp_red
		dom.audio1hash.innerHTML = eMsg + (isSmart ? notation : "")
		return resolve([METRIC, eMsg]) // user test: reflect error entropy
	}
})

const get_audio2_hybrid = () => new Promise(resolve => {
	const METRIC = "audio_hybrid"
	let notation = ""
	try {
		if (runSE) {foo++}
		let t0 = nowFn()
		let results = []
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
		try {
				bins = new Float32Array(analyser.frequencyBinCount)
				analyser.getFloatFrequencyData(bins) // JSShelter errors here
				for (let i=0; i < bins.length; i++) {
					results.push(bins[i])
				}
				analyser.disconnect()
				scriptProcessor.disconnect()
				gain.disconnect()
				// output
				if (runSL) {results = []}
				let hash = "", isEmpty = false
				if (results.length) {
					hash = mini(results)
				} else {
					hash = log_error(SECT11, METRIC, zErrEmpty +": "+ cleanFn(results)) // empty array
					isEmpty = true
				}
				if (isSmart) {
					// ToDo: add MB when patches backported
					if (isVer > 117) {
						notation = rfp_new
						if (hash == "bafe56d6") {notation = sgtick+"RFP x86/amd]"+sc
						} else if (hash == "1348e98d") {notation = sgtick+"RFP ARM]"+sc
						}
					}
				}
				dom.audio3hash.innerHTML = hash + notation
				log_perf(SECT11, METRIC, t0)
				return resolve([METRIC, (isEmpty ? zErr : hash)])
			} catch(e) {
				let eMsg = log_error(SECT11, METRIC, e)
				dom.audio3hash = eMsg
				return resolve([METRIC, eMsg])
			}
		}
		oscillator.start(0)
	} catch(e) {
		let eMsg = log_error(SECT11, METRIC, e)
		dom.audio3hash = eMsg
		return resolve([METRIC, eMsg]) // user test: reflect error entropy
	}
})

const get_audio2_oscillator = () => new Promise(resolve => {
	const METRIC = "audio_oscillator"
	let notation = ""
	try {
		if (runSE) {foo++}
		let t0 = nowFn()
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
			try {
				bins = new Float32Array(analyser.frequencyBinCount)
				analyser.getFloatFrequencyData(bins) // JSShelter errors here
				for (let i=0; i < bins.length; i++) {
					results.push(bins[i])
				}
				analyser.disconnect()
				scriptProcessor.disconnect()
				gain.disconnect()
				// output
				if (runSL) {results = []}
				let hash = "", isEmpty = false
				if (results.length) {
					hash = mini(results)
				} else {
					hash = log_error(SECT11, METRIC, zErrEmpty +": "+ cleanFn(results)) // empty array
					isEmpty = true
				}

				if (isSmart) {
					// ToDo: add MB when patches backported
					if (isVer > 117) {
						notation = rfp_new
						if (hash == "e9f98e24") {notation = sgtick+"RFP x86/amd]"+sc
						} else if (hash == "c54b7aa9") {notation = sgtick+"RFP ARM]"+sc
						}
					}
				}

				dom.audio2hash.innerHTML = hash + notation
				log_perf(SECT11, METRIC, t0)
				return resolve([METRIC, (isEmpty ? zErr : hash)])
			} catch(e) {
				let eMsg = log_error(SECT11, METRIC, e)
				dom.audio2hash = eMsg
				return resolve([METRIC, eMsg])
			}
		}
		oscillator.start(0)
	} catch(e) {
		let eMsg = log_error(SECT11, METRIC, e)
		dom.audio2hash = eMsg
		return resolve([METRIC, eMsg]) // user test: reflect error entropy
	}
})

function outputAudio2() {
	if (!gClick) {return}

	// notes
	// if context run first, outputLatency *always* = 0 = incorrect : run it after oscillator
	// if context not run first, outputLatency *sometimes* = 0 : try it again
	gt0 = nowFn()
	gClick = false
	gRun = false
	let section = {}

	function output() {
		const METRIC = "audio_user_gestures"
		let obj = {}
		for (const k of Object.keys(section).sort()) {
			obj[k] = section[k]
		}
		let hash = mini(obj)
		addDetail(METRIC, obj, zDOC)
		dom.audiohash2.innerHTML = hash + addButton(0, METRIC, Object.keys(section).length +" metrics")

		if (isPerf) {
			sDataTemp["perf"].push([2, "audio2", performance.now() - gt0, performance.now()])
			output_perf("audio2")
		}
		gClick = true
	}
	function run() {
		try {
			let test = new window.AudioContext
			Promise.all([
				get_audio2_oscillator(),
			]).then(function(results){
				section[results[0][0]] = results[0][1] // oscillator
				Promise.all([
					get_audio2_hybrid(),
					get_audio2_context(),
				]).then(function(results){
					section[results[0][0]] = results[0][1] // hybrid
					section[results[1][0]] = results[1][1] // context
					output()
				})
			})
		} catch(e) {
			// output something
			let eMsg = log_error(SECT11,"audio2", e)
			dom.audio1hash = eMsg, dom.audio2hash = eMsg, dom.audio3hash = eMsg
			dom.audiohash2 = zNA
			gClick = true
		}
	}
	// start
	try {
		let tbl = document.getElementById("tb11")
		let cls = "c2"
		tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = ""})
	} catch(e) {}

	get_isPerf()
	Promise.all([
		outputPrototypeLies(),
	]).then(function(){
		run()
	})
}

function outputAudio() {
	let t0 = nowFn()
	let METRIC = "offlineAudioContext"
	let notation = ""

	// ToDo: reduce bufferLen as long as it doesn't change entropy
	// also: when we add RFP + math PoC we need only check for protection (like canvas)
	try {
		const bufferLen = 5000 // 5000 to match documented
		let context = new window.OfflineAudioContext(1, bufferLen, 44100)
		if (runSE) {foo++}
		try {
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
					let copyTest = new Float32Array(bufferLen)
					event.renderedBuffer.copyFromChannel(copyTest, 0) // JSShelter errors here
					let getTest = event.renderedBuffer.getChannelData(0) // JSShelter errors here
					Promise.all([
						crypto.subtle.digest("SHA-1", getTest),
						crypto.subtle.digest("SHA-1", copyTest),
					]).then(function(hashes){
						// sum
						let sum = 0
						for (let i=0; i < getTest.length; i++) {
							let x = getTest[i]
							if (i > (bufferLen-501) && i < bufferLen) {sum += Math.abs(x)}
						}
						pxi_compressor.disconnect()
						// get/copy
						let hashG = mini(byteArrayToHex(hashes[0]))
						let hashC = mini(byteArrayToHex(hashes[1]))
						// lies
						let isLies = false
						if (isSmart) {
							if (hashG !== hashC) {isLies = true
							} else {isLies = check_audioLies()}
						}
						// display/FP
						let audioStr = hashC +" | "+ hashG +" | "+ sum
						if (isSmart) {
							if (isTB && !isMullvad) {notation = tb_red
							} else if (isMullvad) {
								if (isLies) {notation = tb_red}
								// ignore non lies MB until we get math patches
								// we don't want anything green unless it's protected
							} else if (isVer > 117) {
								// don't notate FF lies
								if (!isLies) {
									// we have two results: ARM and non-ARM: but there could be others
									notation = sbx +" FF118+ undocumented]"+ sc
									if (hashC == "24fc63ce") {notation = sgtick+"FF118+ x86/amd]"+sc
									} else if (hashC == "a34c73cd") {notation = sgtick+"FF118+ ARM]"+sc
									}
								}
							}
						}
						log_display(11, METRIC, (isLies ? colorFn(audioStr) : audioStr) + notation)
						if (isLies) {log_known(SECT11, METRIC)}
						// only add hash to FP: detailed data not worth it
						addData(11, METRIC, (isLies ? zLIE : hashG))
						log_section(11, t0)
					})
					.catch(function(e){
						outputErrors(log_error(SECT11, METRIC, e))
					})
				} catch(e) {
					outputErrors(log_error(SECT11, METRIC, e))
				}
			}
		} catch(e) {
			outputErrors(log_error(SECT11, METRIC, e))
		}
	} catch(e) {
		if (gRun) {dom.audiohash2 = zNA, dom.audio1hash = zNA, dom.audio2hash = zNA, dom.audio3hash = zNA}
		if (isTB && !isMullvad) {
			notation = e+"" === "TypeError: window.OfflineAudioContext is not a constructor" ? tb_green : tb_red
		} else {
			notation = default_red
		}
		outputErrors(log_error(SECT11, METRIC, e))
	}

	function outputErrors(display) {
		log_display(11, METRIC, display + (isSmart ? notation : ""))
		addData(11, METRIC, zErr)
		log_section(11, t0)
	}
}

countJS(SECT11)
