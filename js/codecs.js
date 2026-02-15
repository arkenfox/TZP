'use strict';

let mediaList = {}

function set_mediaList() {
	let v = "video/", a = "audio/"
	// ToDo: add wmf: e.g. 1806552
	let aList = [
		//'application/fake',
		'application/ogg',
		a+'aac',
		a+'flac',
		a+'matroska',
		a+'mp3',
		a+'mp4',
		a+'mp4; codecs=',
		a+'mp4; codecs=""',
		a+'mp4; codecs="flac"',
		a+'mp4; codecs="mp3"',
		a+'mp4; codecs="mp4a.40.2"',
		a+'mp4; codecs="mp4a.40.29"',
		a+'mp4; codecs="mp4a.40.42"', // FF143+ 1711882 - removed FF144+ 1989946
		a+'mp4; codecs="mp4a.40.5"',
		a+'mp4; codecs="mp4a.67"',
		a+'mp4; codecs="opus"',
		//a+'mp4; codecs=\'\'',
		a+'mpeg',
		a+'mpeg; codecs="mp3"',
		a+'ogg; codecs="flac"',
		a+'ogg; codecs="opus"',
		a+'ogg; codecs="vorbis"',
		a+'wav',a+'wav; codecs="1"',
		a+'wave',a+'wave; codecs="1"',
		a+'webm',
		a+'webm; codecs="opus"',
		a+'webm; codecs="vorbis"',
		a+'x-aac',
		a+'x-flac',
		a+'x-matroska',
		a+'x-m4a',
		a+'x-pn-wav',a+'x-pn-wav; codecs="1"',
		a+'x-wav',a+'x-wav; codecs="1"',
	]
	let vList = [
		'application/ogg',
		v+'3gpp',
		v+'matroska',
		v+'matroska; codecs="av1"',
		v+'matroska; codecs="avc1.58000a"',
		v+'matroska; codecs="avc1.6e000a"',
		v+'matroska; codecs="avc1.64003E"',
		v+'matroska; codecs="avc1.7a000a"',
		v+'matroska; codecs="avc1.f4000a"',
		v+'matroska; codecs="hvc1.1.6.L186.B0"',
		v+'matroska; codecs="hvc1.1.6.L93.B0"',
		v+'matroska; codecs="hev1.1.6.L186.B0"',
		v+'matroska; codecs="hev1.1.6.L93.B0"',
		v+'matroska; codecs="vp8"',
		v+'matroska; codecs="vp9"',
		v+'mp4',
		v+'mp4; codecs=',
		v+'mp4; codecs=""',
		v+'mp4; codecs="av01.0.08M.08"', // 8bit
		v+'mp4; codecs="av01.0.00M.10"', // 10bit
		v+'mp4; codecs="av01.0.00M.12"', // 12bit
		v+'mp4; codecs="av01.2.31H.12"',
		v+'mp4; codecs="avc1"',
		v+'mp4; codecs="avc1.58000a"', // extended
		v+'mp4; codecs="avc1.6e000a"', // high 10
		v+'mp4; codecs="avc1.64003E"',
		v+'mp4; codecs="avc1.7a000a"', // high 4:2:2
		v+'mp4; codecs="avc1.f4000a"', // high 4:4:4
		v+'mp4; codecs="avc3"',
		v+'mp4; codecs="avc3.64003E"',
		v+'mp4; codecs="flac"',
		v+'mp4; codecs="hev1.1.6.L186.B0"',
			//v+'mp4; codecs="hev1.1.6.L186.B0, mp4a.40.2"',
		v+'mp4; codecs="hev1.1.6.L93.B0"', // 1853448
		v+'mp4; codecs="hev1.2.4.L120.B0"',
		v+'mp4; codecs="hvc1.1.6.L186.B0"',
		v+'mp4; codecs="hvc1.1.6.L93.B0"',
		v+'mp4; codecs="hvc1.2.4.L120.B0"',
		v+'mp4; codecs="opus"',
		v+'mp4; codecs="vp09.00.10.08"',
		v+'mp4; codecs="vp9"',
		//v+'mp4; codecs=\'\'',
		v+'quicktime',
		v+'webm',
		v+'webm; codecs="av01"',
		v+'webm; codecs="av1"',
		v+'webm; codecs="vorbis"',
		v+'webm; codecs="vp8"',
		v+'webm; codecs="vp8, opus"',
		v+'webm; codecs="vp8, vorbis"',
		v+'webm; codecs="vp9"',
		v+'webm; codecs="vp9, opus"',
		v+'webm; codecs="vp9, vorbis"',
		v+'x-m4v',
		v+'x-matroska', // 1986058 FF144+
		v+'x-matroska; codecs="av1"',
		v+'x-matroska; codecs="av1, opus"',
		v+'x-matroska; codecs="avc1.58000a"',
		v+'x-matroska; codecs="avc1.6e000a"',
		v+'x-matroska; codecs="avc1.64003E"',
			//v+'x-matroska; codecs="avc1.64003E, opus"',
		v+'x-matroska; codecs="avc1.7a000a"',
		v+'x-matroska; codecs="avc1.f4000a"',
		v+'x-matroska; codecs="hvc1.1.6.L186.B0"',
		v+'x-matroska; codecs="hvc1.1.6.L93.B0"',
		v+'x-matroska; codecs="hev1.1.6.L186.B0"',
		v+'x-matroska; codecs="hev1.1.6.L93.B0"',
		v+'x-matroska; codecs="vp8"',
		v+'x-matroska; codecs="vp9"',
	]
	if (isVer < 130) {
		// theora support: FF126 1860492 prep + FF130 1890370 remove
		vList.push(
			v+'ogg',
			v+'ogg; codecs="flac"',
			v+'ogg; codecs="opus"',
			v+'ogg; codecs="theora"',
			v+'ogg; codecs="theora, flac"',
			v+'ogg; codecs="theora, speex"',
			v+'ogg; codecs="theora, vorbis"',
		)
	}
	// add and record fakes
		// we use default 5 for length to ensure we don't randomly duplicate a real codec/mime name
	mediaList['fake'] = {
		'audio': ['application/'+ rnd_word(), a + rnd_word(), a+'mp4; codecs="'+ rnd_word() +'"'],
		'video': ['application/'+ rnd_word(), v + rnd_word(), v+'mp4; codecs="'+ rnd_word() +'"', v+'webm; codecs="'+ rnd_word() +'"']
	}
	for (const k of Object.keys(mediaList.fake)) {
		let aFake = mediaList.fake[k]
		aFake.forEach(function(item){if ('audio' == k) {aList.push(item)} else {vList.push(item)}})
	}
	mediaList['audio'] = aList.sort()
	mediaList['video'] = vList.sort()
	let mediaBtn = addButton(13, 'audio_codecs', aList.length +' audio', 'btnc', 'lists')
		+ addButton(13, 'video_codecs', vList.length +' video', 'btnc', 'lists')
	addDisplay(13, 'mediaBtn', mediaBtn)
}

function get_autoplay(METRIC) {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getAutoplayPolicy
	// a check on a specific element is more reliable (though it doesn't matter on page load)

	// cached from page load
	let value, data ='', notation = isDesktop ? default_red : ''
	if (undefined == isAutoPlayError) {
		// Note: this is inconsistent/unstable on android: e.g. can return 'disallowed | disallowed' if the
		// phone is on 'Do Not Disturb' )or depending on the session and transient user activity/actions?)
		if (isDesktop && '5be5c665' == mini(isAutoPlay)) {notation = default_green}
		value = isAutoPlay
	} else {
		value = isAutoPlayError; data = isAutoPlay
	}
	addBoth(13, METRIC, value,'', notation, data)

	// user: not part of FP; don't record errors etc
	const METRICuser = METRIC +'_user'
	if (gLoad || 'undefined' == isAutoPlay) {
		addDisplay(13, METRICuser, zNA)
		return
	}
	try {
		let atest, mtest
		let ares = navigator.getAutoplayPolicy('audiocontext')
		try {atest = navigator.getAutoplayPolicy(dom.tzpAudio)} catch {atest = zErr}
		let mres = navigator.getAutoplayPolicy('mediaelement')
		try {mtest = navigator.getAutoplayPolicy(dom.tzpVideo)} catch {mtest = zErr}
		let display = (ares === atest ? ares : ares +', '+ atest) +' | '+ (mres === mtest ? mres : mres +', '+ mtest)
		addDisplay(13, METRICuser, display)
	} catch(e) {
		addDisplay(13, METRICuser, (e+'').slice(0,47) + '...')
	}
	return
}

function get_capabilities_rfc(type) {
	// https://developer.mozilla.org/en-US/docs/Web/API/RTCCodecStats/sdpFmtpLine
	// https://w3c.github.io/webrtc-stats/#dom-rtccodecstats-sdpfmtpline
	// https://datatracker.ietf.org/doc/html/rfc7587
	const METRIC = type +'_getCapabilities_rtc'
	let hash, data = '', btn ='', notation = isTB ? bb_red : ''
	try {
		if (runSE) {foo++}
		let receiver = window.RTCRtpReceiver
		if (runST) {receiver = []}
		let typeCheck = typeFn(receiver)
		if ('undefined' == typeCheck) {
			hash = typeCheck
			if (isTB) {notation = bb_green}
		} else if ('function' !== typeCheck) {
			throw zErrType + typeCheck
		} else {
			data = receiver.getCapabilities(type)
			if (runSI) {data = null}
			typeCheck = typeFn(data)
			if ('object' !== typeCheck) {throw zErrInvalid +'expected object: got '+ typeCheck}
			//console.log(data)
			hash = mini(data); btn = addButton(13, METRIC)
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(13, METRIC, hash, btn, notation, data)
	return
}

function get_codecs(type) {
	// https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
	// https://cconcolato.github.io/media-mime-support/
	let t0 = nowFn()
	const metricC = type +'_canPlayType', metricT = type +'_isTypeSupported'
	let list = mediaList[type], countMax = list.length, aFake

	// canPlayType
	function get_canPlay() {
		let hash, data = {'maybe': [],'probably': []}, btn='', isLies = false, hasFake = false
		try {
			list.forEach(function(item) {
				let tmp = item.replace(type +'\/','') // strip 'video/','audio/'
				let value = obj.canPlayType(item)
				if (runST) {value = 'audio' == type ? undefined : '  '}
				let typeCheck = typeFn(value)
				if ('string' !== typeCheck && 'empty string' !== typeCheck) {throw zErrType + typeCheck}
				if ('maybe' === value || 'probably' === value) {
					data[value].push(tmp)
					if (aFake.includes(item)) {hasFake = true}
				} else if (runSL) {
					if (aFake.includes(item)) {
						if (item.includes('codecs')) {data.probably.push(tmp)} else {data.maybe.push(tmp)}
						hasFake = true
					}
				}
			})
			// tests
			//data = {'maybe': [], 'probably': []} // none
			//data = {'maybe': [], 'probably': mediaList[type]} // all
			//data.maybe = [] // one empty
			// counts
			let countMaybe = data.maybe.length,
				countProbably = data.probably.length,
				countTotal = countMaybe + countProbably
			// lies
			if (0 == countTotal || countMax == countTotal) {
				// can't be none, all
				hash = (0 == countTotal ? 'none' : 'all'); data = ''; isLies = true
			} else {
				data.maybe.sort() // we removed leading audio/ and video/, so do a final sort
				data.probably.sort()
				if (hasFake) {
					// can't have fake
					isLies = true
				} else if (0 == countMaybe || 0 == countProbably) {
					// either is empty
					isLies = true
				}
				if (!isLies) {
					// probably: should only include "codecs="something""
					data['probably'].forEach(function(item) {
						if (!item.includes("codecs=\"")) {isLies = true}
					})
				}
				if (!isLies) {
					// maybe: shouldn't include "codecs="something"" (i.e it has "mp4; codecs=","mp4; codecs=\"\"")
					data['maybe'].forEach(function(item) {
						if (item.includes("codecs=\"")) {
							if (item !== "mp4; codecs=\"\"") {isLies = true}
						}
					})
				}
				hash = mini(data), btn = addButton(13, metricC, countMaybe +'/' + countProbably)
			}
		} catch(e) {
			hash = e; data = zErrLog
		}
		addBoth(13, metricC, hash, btn, '', data, isLies)
		return
	}

	// isTypeSupported
	function get_isType() {
		let hash, data = {'MediaRecorder': [],'MediaSource': []}, btn='', isLies = false, hasFakeR = false, hasFakeS = false
		try {
			let canRecord = true, canSource = true
			list.forEach(function(item) {
				let tmp = item.replace(type +'\/','') // strip 'video/','audio/'
				if (canRecord) {
					try {
						let value = MediaRecorder.isTypeSupported(item)
						if (runST) {value = type == 'audio' ? undefined : ''}
						let typeCheck = typeFn(value)
						if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
						if (value) {
							data.MediaRecorder.push(tmp)
							if (aFake.includes(item)) {hasFakeR = true}
						} else if (runSL) {
							if (aFake.includes(item)) {
								data.MediaRecorder.push(tmp)
								hasFakeR = true
							}
						}
						//foo++
					} catch(e) {
						hasFakeR = false
						canRecord = false // stop testing
						data.MediaRecorder = zErr // replace data
						log_error(13, metricT +"_MediaRecorder", e) // log error
					}
				}
				if (canSource) {
					try {
						let value = MediaSource.isTypeSupported(item)
						if (runST) {value = type == 'audio' ? 1 : null}
						let typeCheck = typeFn(value)
						if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
						if (value) {
							data.MediaSource.push(tmp)
							if (aFake.includes(item)) {hasFakeS = true}
						} else if (runSL) {
							if (aFake.includes(item)) {
								data.MediaSource.push(tmp)
								hasFakeS = true
							}
						}
						//foo++
					} catch(e) {
						hasFakeS = false
						canSource = false; data.MediaSource = zErr; log_error(13, metricT +"_MediaSource", e)
					}
				}
			})
			// both errors?
			if (!canRecord && !canSource) {
				hash = zErr; data = ''
			} else {
				// test
				//data = {'MediaRecorder': [],'MediaSource': []}
				//data.MediaRecorder = []; hasFakeR = false
				//data.MediaSource = []; hasFakeS = false
				// counts for display
				let countRecord = canRecord ? data.MediaRecorder.length : zErr,
					countSource = canSource ? data.MediaSource.length: zErr
				// lies
				if (0 == countRecord && 0 == countSource) {
					hash = 'none'; data = ''; isLies = true
				} else {
					if (canRecord) {data.MediaRecorder.sort()} // we removed leading audio/ and video/, so do a final sort
					if (canSource) {data.MediaSource.sort()}
					if (0 !== (hasFakeR + hasFakeS)) {
						// can't have fake: note each fake was set as false if we errored
						isLies = true
					} else if (canRecord && 0 == countRecord || canSource && 0 == countSource) {
						// either is empty and not an error
						isLies = true
					}
					hash = mini(data), btn = addButton(13, metricT, countRecord +'/' + countSource)
				}
			}
		} catch(e) {
			hash = e; data = zErrLog
		}
		addBoth(13, metricT, hash, btn, '', data, isLies)
		return
	}

	try {
		if (runSE) {foo++}
		var obj = document.createElement(type)
		aFake = mediaList.fake[type]
		Promise.all([
			get_canPlay(),
			get_isType(),
		]).then(function(){
			log_perf(13, type, t0)
			return
		})
	} catch(e) {
		addBoth(13, metricC, e, '', '', zErrLog)
		addBoth(13, metricT, e, '', '', zErrLog)
		return
	}
}

const get_eme = (METRIC) => new Promise(resolve => {
	/*
	https://w3c.github.io/encrypted-media/#common-key-systems
	gecko only supports
		'org.w3.clearkey'
		'com.widevine.alpha'
	other
		'com.microsoft.playready',
		'com.youtube.playready',
		'webkit-org.w3.clearkey',
		'com.adobe.primetime',
		'com.adobe.access',
		'com.apple.fairplay'
	note: media.gmp-gmpopenh264.enabled = no effect even after a restart
	note: 1706121 FF128+ fixed PB mode
	*/
	/* widevine gecko issues
		triggers DRM prompt if disabled
			^ error is "NotSupportedError: EME has been preffed off"
			^ this eats viewport/inner pixels
		on android it can hold up the result and we end up with eme == timeout
			^ if rerun/no-timeout we get
			" error is: NotSupportedError: The application embedding this user agent has blocked MediaKeySystemAccess"
		on android DRM in PB mode is always prompted
	*/

	let isDone = false
	// really slow on first session loads in blink / also android needs help
	let timeout = 'blink' == isEngine ? 4000 : 400 
	setTimeout(function() {if (!isDone) {exit(zErrTime)}}, timeout)
	function exit(value, data ='', btn='') {
		if (!isDone) {
			isDone = true
			// results are not guaranteed to come back in the order requested: sort into a new object
			if ('object' == typeof data) {
				let newobj = {}
				for (const k of Object.keys(data).sort()) {
					newobj[k] = {}
					for (const j of Object.keys(data[k]).sort()) {newobj[k][j] = data[k][j]}
				}
				data = newobj
				value = mini(data)
				btn = addButton(13, METRIC)
			}
			let notation = isBB ? bb_red : ''
			if (isBB && '1f5a84f8' == value) {notation = bb_green} // desktop + android
			addBoth(13, METRIC, value, btn, notation, data)
			return resolve()
		}
	}

	let oEME = {
		clearkey: ['org.w3.clearkey','webkit-org.w3.clearkey'],
		fairplay: ['com.apple.fairplay'],
		playready: ['com.microsoft.playready','com.youtube.playready'],
		primetime: ['com.adobe.access','com.adobe.primetime'],
		widevine: ['com.widevine.alpha'],
	}
	// widevine on non-BB android is problematic
	if (!isBB && !isDesktop) {delete oEME.widevine}

	try {
		if (runSE) {foo++}
		let request = window.navigator.requestMediaKeySystemAccess
		if (runST) {request = ''}
		let typeCheck = typeFn(request)
		if ('undefined' == typeCheck) {exit(typeCheck)
		} else if ('function' !== typeCheck) {throw zErrType +'requestMediaKeySystemAccess: ' + typeCheck
		} else {
			let data = {}, maxCount = 0, counter = 0
			for (const k of Object.keys(oEME)) {maxCount += oEME[k].length}
			const config = {
				initDataTypes: ['keyids', 'webm'],
				audioCapabilities: [{contentType: 'audio/webm; codecs="opus"'}],
			}
			for (const key of Object.keys(oEME).sort()) {
				data[key] = {}
				let value
				oEME[key].forEach(function(item){
					navigator.requestMediaKeySystemAccess(item, [config]).then((result) => {
					typeCheck = typeFn(result)
					if ('empty object' !== typeCheck) {throw zErrType + typeCheck}
					let expected = '[object MediaKeySystemAccess]'
					if (result +'' !== expected) {throw zErrInvalid + 'expected '+ expected +': got '+ result}
						data[key][item] = true
						counter++
						// await all results
						if (maxCount == counter) {exit('', data)}
					}).catch(function(e){
						value = zErr
						// suppress expected errors
							// ToDo: check safari
						let aCheck = []
						if (isGecko) {
							if (isBB) {
								let checkvalue = 'Key system is unsupported'
								if ('com.widevine.alpha' == item) {checkvalue = 'EME has been preffed off'
								} else if ('org.w3.clearkey' == item) {checkvalue = 'CDM is not installed'}
								aCheck.push('NotSupportedError: '+ checkvalue)
							} else {
								aCheck.push('NotSupportedError: Key system is unsupported')
							}
						} else if ('blink' == isEngine) {
							aCheck.push('NotSupportedError: Unsupported keySystem or supportedConfigurations.')
						}
						if (aCheck.includes(e+'')) {
							value = false
						} else {
							log_error(13, METRIC +'_'+ item, e) // item names are unique, we don't need the key
						}
						data[key][item] = value
						counter++
						// wait for all the results
						if (maxCount == counter) {exit('', data)}
					})
				})
			}
		}
	} catch(e) {
		exit(e, zErrLog)
	}
})

function get_preload_media(METRIC) {
	// FF142+/ESR140: 1972600 | also see 1969210
	// ToDo: I don't think this test is sufficient, we need some actual media
	let value, data = '', notation = rfp_red
	try {
		value = dom.tzpAudio.preload
		if (runST) {value = 99} else if (runSI) {value = 'banana'}
		if ('string' !== typeFn(value, true)) {throw zErrType + typeFn(value)}
		if ('' == value) {value = typeFn(value)}
		let aValid = ['auto','metadata','none']
		if (isVer < 140) {aValid.push('empty string')} // 929890
		if (!aValid.includes(value)) {aValid.sort(); throw zErrInvalid +'expected ' + aValid.join(', ') + ': got '+ value}
		if ('auto' == value) {notation = rfp_green}
	} catch(e) {
		value = e; data = zErrLog
	}
	addBoth(13, METRIC, value,'', notation, data)
	return
}


const outputMedia = () => new Promise(resolve => {
	if (gLoad) {set_mediaList()}
	if (gRun) {
		addDetail('audio_codecs', mediaList['audio'], 'lists')
		addDetail('video_codecs', mediaList['video'], 'lists')
	}
	Promise.all([
		get_eme('eme'),
		get_codecs('audio'),
		get_codecs('video'),
		get_preload_media('preload_htmlmediaelement'),
		get_autoplay('getAutoplayPolicy'),
		get_capabilities_rfc('audio'),
		get_capabilities_rfc('video'),
	]).then(function(){
		return resolve()
	})
})

countJS(13)
