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
	if (runSL) {sData[SECT99].push("AudioBuffer.copyFromChannel")}
	return audioList.some(lie => sData[SECT99].indexOf(lie) >= 0)
}

const get_audio_context = (os = isOS) => new Promise(resolve => {
	const METRIC = "audioContext"
	let t0 = nowFn(), notation = isSmart ? rfp_red : ""

	try {
		// unsorted
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

		// sort, type check etc
		if (runSE) {foo++} else if (runSL) {obj["ac-channelCount"] = "4"; obj["an-fftSize"] = null} // change hardcoded and type
		let oHardcoded = {} // FF70+: keys [20] + expected hardcoded values [16]
		let hardcodeExclude = ["ac-outputLatency","ac-sampleRate","ac-maxChannelCount","an-channelCount"]
		let numberExclude = ["ac-channelCountMode","ac-channelInterpretation","ac-state","an-channelCountMode","an-channelInterpretation"]

		let objnew = {}, isLies = false
		for (const k of Object.keys(obj).sort()) {
			objnew[k] = obj[k]
			if (isSmart) {
				oHardcoded[k] = hardcodeExclude.includes(k) ? "" : obj[k]
				// regardless of hardcoded check, catch all type check entropy
				let typeCheck = typeFn(obj[k])
				let typeMatch = numberExclude.includes(k) ? "string" : "number"
				if (typeMatch !== typeCheck) {
					log_error(SECT11, METRIC +"_"+ k, zErrType + typeCheck)
					isLies = true
				}
			}
		}
	
		let hash = mini(objnew) // includes original latency
		if (isSmart) {
			if (mini(oHardcoded) !== "dfda7813") {isLies = true}
			if (os !== undefined) {
				// RFP notation: includes 1564422 outputLatency
				if (hash == "67a3eeee" && os == "windows") {notation = rfp_green // 0.04
				} else if (hash == "debdefc0" && os == "mac") {notation = rfp_green // 512/44100 (RFP hardcodes latency)
				} else if (hash == "2b9d44b0" && os == "android") {notation = rfp_green // 0.02
				} else if (hash == "9b69969b") {notation = rfp_green} // 0.025 catchall incl linux
			}
			if (isTB && !isMullvad) {notation = tb_red} // TB should be an error
		}
		// RFP gives a stable hardcoded ac-outputLatency
			// non-RFP can be variable per tab - return n/a to avoid any noise
		if (isGecko && notation !== rfp_green) {
			objnew["ac-outputLatency"] = zNA
			hash = mini(objnew)
		}
		if (isLies) {
			hash = colorFn(hash)
			log_known(SECT11, METRIC)
			addDetail(METRIC, objnew, zDOC)
			addData(11, METRIC, zLIE)
		} else {
			addData(11, METRIC, objnew, hash)
		}
		log_display(11, METRIC, hash + addButton(11, METRIC, Object.keys(objnew).length +" keys") + notation)
		log_perf(SECT11, METRIC, t0)
		return resolve()
	} catch(e) {
		addData(11, METRIC, zErr)
		if (isSmart) {
			if (isTB && !isMullvad) {	notation = (e+"" === "TypeError: window.AudioContext is not a constructor" ? tb_green : tb_red)	}
		}
		log_display(11, METRIC, log_error(SECT11, METRIC, e) + notation)
		return resolve()
	}
})

const get_audio_offline = () => new Promise(resolve => {
	let t0 = nowFn(), notation = ""
	const METRIC = "offlineAudioContext"

	function outputErrors(display) {
		log_display(11, METRIC, display + (isSmart ? notation : ""))
		addData(11, METRIC, zErr)
		return resolve()
	}

	// ToDo: maybe reduce bufferLen as long as it doesn't change entropy
		// also: when we add RFP + math PoC we need only check for protection (like canvas)
	try {
		if (runSE) {foo++}
		const bufferLen = 5000 // 5000 to match documented
		const context = new window.OfflineAudioContext(1, bufferLen, 44100)
		const dynamicsCompressor = context.createDynamicsCompressor()
		const oscillator = context.createOscillator()

		// set
		oscillator.type = "triangle"
		oscillator.frequency.value = 10000
		dynamicsCompressor.threshold && (dynamicsCompressor.threshold.value = -50)
		dynamicsCompressor.knee && (dynamicsCompressor.knee.value = 40)
		dynamicsCompressor.attack && (dynamicsCompressor.attack.value = 0)
		dynamicsCompressor.ratio && (dynamicsCompressor.ratio.value = 12)
		dynamicsCompressor.reduction && (dynamicsCompressor.reduction.value = -20) // does this do anything
		dynamicsCompressor.release && (dynamicsCompressor.release.value = .25)
		// connect
		dynamicsCompressor.connect(context.destination)
		oscillator.connect(dynamicsCompressor)
		// start
		oscillator.start(0)
		context.startRendering()

		context.oncomplete = function(event) {
			try {
				dynamicsCompressor.disconnect()
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
					// get/copy
					let hashG = mini(byteArrayToHex(hashes[0]))
					let hashC = mini(byteArrayToHex(hashes[1]))
					let display = hashC +" | "+ hashG +" | "+ sum, value = hashG
					// lies
					if (isSmart) {
						let isLies = false
						if (hashG !== hashC) {isLies = true} else {isLies = check_audioLies()}
						if (isLies) {
							display = colorFn(display)
							log_known(SECT11, METRIC)
							value = zLIE
						}
						// notation
						if (isTB && !isMullvad) {
							notation = tb_red
						} else if (isMullvad) {
							if (isLies) {notation = tb_red}
						} else if (isVer > 117) {
							if (isLies) {
								notation = default_red
							} else {
								// two results: ARM and non-ARM
								notation = sbx +"undocumented]"+ sc
								if (isVer > 123 && hashC == "a7c1fbb6") {notation = sgtick+"x86/amd]"+sc // 1877221
								} else if (hashC == "24fc63ce") {notation = sgtick+"x86/amd]"+sc
								} else if (hashC == "a34c73cd") {notation = sgtick+"ARM]"+sc}
							}
						}
					}
					log_display(11, METRIC, display + notation)
					addData(11, METRIC, value) // only collect hash: detailed data not worth it
					log_perf(SECT11, METRIC, t0)
					return resolve()
				})
				.catch(function(e){
					outputErrors(log_error(SECT11, METRIC, e))
				})
			} catch(e) {
				outputErrors(log_error(SECT11, METRIC, e))
			}
		}
	} catch(e) {
		if (gRun) {dom.oscillator_compressor = zNA; dom.oscillator = zNA; dom.audio_user = zNA}
		if (isTB && !isMullvad) {
			notation = e+"" === "TypeError: window.OfflineAudioContext is not a constructor" ? tb_green : tb_red
		} else {
			notation = default_red
		}
		outputErrors(log_error(SECT11, METRIC, e))
	}
})

const get_oscillator = () => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = "oscillator"
	let notation = (isSmart && isVer > 117) ? rfp_red : ""

	function exit(display, value) {
		if (value == undefined) {value = display}
		dom[METRIC].innerHTML = display + notation
		log_perf(SECT11, METRIC, t0)
		return resolve([METRIC, value])
	}

	try {
		if (runSE) {foo++}
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
				if ("object" !== typeFn(bins)) {throw zErrType +"Float32Array: "+ typeFn(bins)}
				for (let i=0; i < bins.length; i++) {results.push(bins[i])}
				analyser.disconnect()
				scriptProcessor.disconnect()
				gain.disconnect()
				// output
				if (runSL) {results = []}
				let typeCheck = typeFn(results[0])
				if ("number" !== typeCheck) {throw zErrType + typeCheck}
				let hash = mini(results)
				if (isSmart) {
					if (isTB && !isMullvad) {
						notation = tb_red // TB should be an error
					} else if (isVer > 123) {
						if (hash == "5b3956a9") {notation = sgtick+"x86/amd]"+sc // 1877221
						} else if (hash == "f263f055") {notation = sgtick+"RFP ARM]"+sc}
					} else if (isVer > 117) {
						if (hash == "e9f98e24") {notation = sgtick+"RFP x86/amd]"+sc
						} else if (hash == "1348e98d") {notation = sgtick+"RFP ARM]"+sc}
					}
				}
				exit(hash)
			} catch(e) {
				exit(log_error(SECT11, METRIC, e), e+"")
			}
		}
		oscillator.start(0)
	} catch(e) {
		exit(log_error(SECT11, METRIC, e), e+"")
	}
})

const get_oscillator_compressor = () => new Promise(resolve => {
	const METRIC = "oscillator_compressor"
	let notation = (isSmart && isVer > 117) ? rfp_red : ""
	try {
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
				if ("object" !== typeFn(bins)) {throw zErrType +"Float32Array: "+ typeFn(bins)}
				for (let i=0; i < bins.length; i++) {results.push(bins[i])}
				analyser.disconnect()
				scriptProcessor.disconnect()
				gain.disconnect()
				// check
				if (runSE) {foo++} else if (runSL) {results = []}
				let typeCheck = typeFn(results[0])
				if ("number" !== typeCheck) {throw zErrType + typeCheck}
				let hash = mini(results)
				if (isSmart) {
					if (isTB && !isMullvad) {
						notation = tb_red // TB should be an error
					} else if (isVer > 123) {
						if (hash == "e08487bf") {notation = sgtick+"x86/amd]"+sc // 1877221
						} else if (hash == "1f38e089") {notation = sgtick+"RFP ARM]"+sc}
					} else if (isVer > 117) {
						if (hash == "bafe56d6") {notation = sgtick+"RFP x86/amd]"+sc
						} else if (hash == "c54b7aa9") {notation = sgtick+"RFP ARM]"+sc}
					}
				}
				dom[METRIC].innerHTML = hash + notation
				log_perf(SECT11, METRIC, t0)
				return resolve([METRIC, hash])
			} catch(e) {
				let eMsg = log_error(SECT11, METRIC, e)
				dom[METRIC] = eMsg
				return resolve([METRIC, eMsg])
			}
		}
		oscillator.start(0)
	} catch(e) {
		let eMsg = log_error(SECT11, METRIC, e)
		dom[METRIC] = eMsg
		return resolve([METRIC, eMsg]) // user test: reflect error entropy
	}
})

function outputAudioUser() {
	if (!gClick) {return}
	gt0 = nowFn()
	gClick = false
	gRun = false
	let section = {}
	const METRIC = "audio_user"

	function output() {
		let obj = {}
		for (const k of Object.keys(section).sort()) {
			obj[k] = section[k]
		}
		let hash = mini(obj)
		addDetail(METRIC, obj, zDOC)
		dom[METRIC].innerHTML = hash + addButton(0, METRIC, Object.keys(section).length +" metrics")

		if (isPerf) {
			sDataTemp["perf"].push([2, METRIC, performance.now() - gt0, performance.now()])
			output_perf(METRIC)
		}
		gClick = true
	}
	function run() {
		try {
			let test = new window.AudioContext
			Promise.all([
				get_oscillator(),
				get_oscillator_compressor(),
			]).then(function(results){
				section[results[0][0]] = results[0][1] // oscillator
				section[results[1][0]] = results[1][1] // oscillator_compressor
				output()
			})
		} catch(e) {
			// output something
			let eMsg = log_error(SECT11,"audio2", e)
			dom.oscillator_compressor = eMsg; dom.oscillator = eMsg
			dom[METRIC] = zNA
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
		setTimeout(function() {
			run()
		}, 100) // delay so user sees it clear then recompute
	})
}

const outputAudio = () => new Promise(resolve => {
	let t0 = nowFn()
	Promise.all([
		get_audio_context(),
		get_audio_offline(),
	]).then(function(results){
		log_section(11, t0)
		return resolve(SECT11)
	})
})

countJS(SECT11)
