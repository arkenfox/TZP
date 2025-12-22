'use strict';

/* code based on
https://canvasblocker.kkapsner.de/test/
https://audiofingerprint.openwpm.com/ */

function byteArrayToHex(arrayBuffer){
	var chunks = [];
	(new Uint32Array(arrayBuffer)).forEach(function(num){
		chunks.push(num.toString(16));
	});
	return chunks.map(function(chunk){
		return '0'.repeat(8 - chunk.length) + chunk;
	}).join('');
}

function check_audioLies() {
	const audioList = [
		'AnalyserNode.getByteFrequencyData','AnalyserNode.getByteTimeDomainData',
		'AnalyserNode.getFloatFrequencyData','AnalyserNode.getFloatTimeDomainData',
		'AudioBuffer.copyFromChannel','AudioBuffer.getChannelData',
		'BiquadFilterNode.getFrequencyResponse',
	]
	if (runSL) {addProxyLie('AudioBuffer.copyFromChannel')}
	return audioList.some(lie => sData[SECT99].indexOf(lie) >= 0)
}

const get_audio_context = (METRIC) => new Promise(resolve => {
	let t0 = nowFn() 
	let hash, btn ='', data = {}, notation = rfp_red, isLies = false

	try {
		// unsorted
		function a(a, b, c) {
			for (let d in b) 'dopplerFactor' === d || 'speedOfSound' === d || 'currentTime' ===
			d || 'number' !== typeof b[d] && 'string' !== typeof b[d] || (a[(c ? c : '') + d] = b[d])
			return a
		}
		let f = new window.AudioContext
		let obj
		let	d = f.createAnalyser()
		obj = a({}, f, 'ac-')
		obj = a(obj, f.destination, 'ac-')
		obj = a(obj, f.listener, 'ac-')
		obj = a(obj, d, 'an-')

		// sort, type check etc
		if (runST) {obj['ac-channelCount'] = '4'; obj['an-fftSize'] = null // change type: this will trigger isLies
		} else if (runSL) {	obj['ac-channelCount'] = 4} // change expected value
		let oHardcoded = {} // FF70+: keys [20] + expected hardcoded values [16]
		let hardcodeExclude = ['ac-outputLatency','ac-sampleRate','ac-maxChannelCount','an-channelCount']
		let numberExclude = [
			'ac-channelCountMode','ac-channelInterpretation','ac-state','an-channelCountMode',
			'an-channelInterpretation','ac-sinkId'
		]
		for (const k of Object.keys(obj).sort()) {
			data[k] = obj[k]
			oHardcoded[k] = hardcodeExclude.includes(k) ? '' : obj[k]
			// regardless of hardcoded check, catch all type check entropy
			let typeCheck = typeFn(obj[k])
			let typeMatch = numberExclude.includes(k) ? ('ac-sinkId' == k ? 'empty string' : 'string') : 'number'
			if (typeMatch !== typeCheck) {
				log_error(11, METRIC +'_'+ k, zErrType + typeCheck)
				if (!isSmart) {data[k] = zErr} // non smart reflect error in data
				isLies = true // otherwise smart uses isLies and returns untrustworthy
			}
		}
		if (mini(oHardcoded) !== 'dfda7813') {isLies = true}

		// ac-state changes in blink (IDK about webkit ToDo I guess) on a re-run
			// gRun = suspended, reruns = running
			// doesn't seem partically useful, so let's change it in non-gecko
		if (!isGecko) {
			if (undefined !== data['ac-state']) {data['ac-state'] = zNA}
		}

		// notate
			// non-RFP outputLatency can be variable per tab/run - return n/a + rehash to avoid any noise
		hash = mini(data); btn = addButton(11, METRIC, Object.keys(data).length +' keys')
		if (isOS !== undefined) {
			if ('windows' == isOS && '67a3eeee' == hash) {notation = rfp_green // 0.04
			} else if ('mac' == isOS && 'debdefc0' == hash) {notation = rfp_green // 512/44100 (RFP hardcodes latency)
			} else if ('android' == isOS && '2b9d44b0' == hash) {notation = rfp_green // 0.02
			} else if ('9b69969b' == hash) {notation = rfp_green} // 0.025 catchall incl linux
		}
		if (isGecko && notation !== rfp_green) {
			notation += ' [latency: '+ data['ac-outputLatency'] +']'
			data['ac-outputLatency'] = zNA; hash = mini(data)
		}
	} catch(e) {
		hash = log_error(11, METRIC, e); data = zErr
	}
	addBoth(11, METRIC, hash, btn, notation, data, isLies)
	log_perf(11, METRIC, t0)
	return resolve()
})

const get_audio_offline = (METRIC) => new Promise(resolve => {
	let t0 = nowFn(), notation = rfp_red, isLies = false

	function outputErrors(display) {
		addBoth(11, METRIC, display,'', notation, zErr)
		return resolve()
	}

	// ToDo: maybe reduce bufferLen as long as it doesn't change entropy
		// also: when we add RFP + math PoC we need only check for protection (like canvas)
	try {
		if (runSE) {foo++}
		const bufferLen = 5000 // 5000 to match documented
		const context = new window.OfflineAudioContext(1, bufferLen, 44100)
		const dynamicsCompressor = context.createDynamicsCompressor() // servo breaks here
		const oscillator = context.createOscillator()
 		// set
		oscillator.type = 'triangle'
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
					crypto.subtle.digest('SHA-1', getTest),
					crypto.subtle.digest('SHA-1', copyTest),
				]).then(function(hashes){
					// sum
					let sum = 0
					for (let i=0; i < copyTest.length; i++) {
						let x = copyTest[i]
						if (i > (bufferLen-501) && i < bufferLen) {sum += Math.abs(x)}
					}
					// get/copy
					let hashC = mini(byteArrayToHex(hashes[1]))
					let hashG = mini(byteArrayToHex(hashes[0]))
					// lies
					let isSame = hashG == hashC, display, btn = addButton(11, METRIC)
					if (!isSame) {
						isLies = true
						addDetail(METRIC, {'copyFromChannel': copyTest, 'getChannelData': getTest})
						display = 'mixed'
					} else {
						// no need to list twice
						isLies = check_audioLies()
						addDetail(METRIC, copyTest)
						display = hashC
						btn += ' '+ sum
					}
					// notation: three results since 1877221 FF124+ split x86 into 32/64 bitness
						// isArch: true = large arrays else it's an error string
					if (true === isArch) {
						if ('a7c1fbb6' == hashC) {notation = sgtick+'x86_64/amd_64]'+sc
						} else if ('a34c73cd' == hashC) {notation = sgtick+'ARM64/aarch64]'+sc}
					} else {
						if ('24fc63ce' == hashC) {notation = sgtick+'x86/i686/ARMv7]'+sc}
					}
					addData(11, METRIC, display,'', isLies)
					addDisplay(11, METRIC, display, btn, notation, isLies)
					log_perf(11, METRIC, t0)
					return resolve()
				})
				.catch(function(e){
					outputErrors(log_error(11, METRIC, e))
				})
			} catch(e) {
				outputErrors(log_error(11, METRIC, e))
			}
		}
	} catch(e) {
		try {
			if (gRun) {dom.audio_test_oscillator_compressor = zNA; dom.audio_test_oscillator = zNA; dom.audio_test = zNA}
		} catch {}
		outputErrors(log_error(11, METRIC, e))
	}
})

const outputAudio = () => new Promise(resolve => {
	Promise.all([
		get_audio_context('audioContext'),
		get_audio_offline('offlineAudioContext'),
	]).then(function(){
		return resolve()
	})
})

countJS(11)
