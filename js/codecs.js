'use strict';

let mediaBtn

function get_autoplay(METRIC) {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getAutoplayPolicy
	// a check on a specific element is more reliable (though it doesn't matter on page load)

	// cached from page load
	let value, data ='', notation = default_red
	if (undefined == isAutoPlayError) {
		// Note: android (120+ at least) returns 'disallowed | disallowed' if phone is on 'Do Not Disturb'
		if ('5be5c665' == mini(isAutoPlay)) {notation = default_green}
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

const get_clearkey = (METRIC) => new Promise(resolve => {
	let isDone = false
	setTimeout(function() {
		if (!isDone) {
			notation = isBB ? bb_red : default_red 
			exit(zErrTime)
		}
	}, 150)
	function exit(value) {
		isDone = true
		let data = (value == zS ? '' : zErrLog) // if not success then it was an error
		addBoth(13, METRIC, value,'', notation, data)
		return resolve()
	}
	/*
	https://w3c.github.io/encrypted-media/#common-key-systems
	gecko only supports
		'com.widevine.alpha' triggers DRM prompt if disabled so ignore
		'org.w3.clearkey'
	other
		'com.microsoft.playready',
		'com.youtube.playready',
		'webkit-org.w3.clearkey',
		'com.adobe.primetime',
		'com.adobe.access',
		'com.apple.fairplay'
	note: media.gmp-gmpopenh264.enabled = no effect even after a restart
	*/

	let notation = isBB ? bb_red: ''
	if (!runTE) {
		try {
			const config = {
				initDataTypes: ['cenc'],
				videoCapabilities: [{contentType: 'video/mp4;codecs="avc1.4D401E"'}],
				persistentState: 'required'
			}
			navigator.requestMediaKeySystemAccess('org.w3.clearkey', [config]).then((key) => {
				if (runST) {key = null} else if (runSI) {key = {}}
				let typeCheck = typeFn(key)
				if ('empty object' !== typeCheck) {throw zErrType + typeCheck}
				let expected = '[object MediaKeySystemAccess]'
				if (key +'' !== expected) {throw zErrInvalid + 'expected '+ expected +': got '+ key}
				if ('android' == isOS) {notation = default_red}
				exit(zS)
			}).catch(function(e){
			/* expected
					isBB   : "NotSupportedError: CDM is not installed"
					Android: "NotSupportedError: CDM is not installed"
					FF PB  : "NotSupportedError: Key system configuration is not supported"
						^ 1706121: PB mode
				unexpected
					blocked: timed out
					strict : "NotSupportedError: Key system is unsupported" (JShelter "multimedia playback")
						^ little lies I think does this about 12.5% of the time: we pick up on little lies in canPlayType anyway
				*/
				// ToDo: FF128 1706121 PB mode fix landed
				if (isBB) {
					notation = e+'' === 'NotSupportedError: CDM is not installed' ? bb_green: bb_red
				} else if ('android' == isOS) {
					notation = e+'' === 'NotSupportedError: CDM is not installed' ? default_green: default_red
				} else {
					notation = (e +'' !== 'NotSupportedError: Key system configuration is not supported') ? default_red : '' // tampered
				}
				exit(e)
			})
		} catch(e) {
			exit(e)
		}
	}
})

function get_mimetype_codecs(type) {
	// https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
	// https://cconcolato.github.io/media-mime-support/
	let v = "video/", a = "audio/"
	let t0 = nowFn()
	
	// ToDo: add wmf: e.g. 1806552
	// lists are sorted
	let audiolist = [
		'application/ogg',
		a+'aac',
		a+'flac',
		a+'mp3',
		a+'mp4',
		a+'mp4; codecs=',
		a+'mp4; codecs=""',
		a+'mp4; codecs="flac"',
		a+'mp4; codecs="mp3"',
		a+'mp4; codecs="mp4a.40.2"',
		a+'mp4; codecs="mp4a.40.29"',
		a+'mp4; codecs="mp4a.40.5"',
		a+'mp4; codecs="mp4a.67"',
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
		a+'x-m4a',
		a+'x-pn-wav',a+'x-pn-wav; codecs="1"',
		a+'x-wav',a+'x-wav; codecs="1"',
	]
	let videolist = [
		'application/ogg',
		v+'3gpp',
		v+'mp4',
		v+'mp4; codecs=',
		v+'mp4; codecs=""',
		//v+'mp4; codecs="av01.0.08M.08"', // 8bit
		v+'mp4; codecs="av01.0.00M.12"', // 12bit
		v+'mp4; codecs="avc1"',
		v+'mp4; codecs="avc1.58000a"', // extended
		v+'mp4; codecs="avc1.6e000a"', // high 10
		v+'mp4; codecs="avc1.7a000a"', // high 4:2:2
		v+'mp4; codecs="avc1.f4000a"', // high 4:4:4
		v+'mp4; codecs="avc3"',
		v+'mp4; codecs="flac"',
		v+'mp4; codecs="hev1.1.6.L93.B0"', // 1853448
		v+'mp4; codecs="hev1.2.4.L120.B0"',
		v+'mp4; codecs="hvc1.1.6.L93.B0"',
		v+'mp4; codecs="hvc1.2.4.L120.B0"',
		v+'mp4; codecs="opus"',
		v+'mp4; codecs="vp09.00.10.08"',
		//v+'mp4; codecs=\'\'',
		v+'quicktime',
		v+'webm',
		v+'webm; codecs="av1"',
		v+'webm; codecs="vorbis"',
		v+'webm; codecs="vp8"',
		v+'webm; codecs="vp8, opus"',
		v+'webm; codecs="vp8, vorbis"',
		v+'webm; codecs="vp9"',
		v+'webm; codecs="vp9, opus"',
		v+'webm; codecs="vp9, vorbis"',
		v+'x-m4v',
		v+'x-matroska',
	]
	if (isVer < 130) {
		// theora support: FF126 1860492 prep + FF130 1890370 remove
		videolist.push(
			v+'ogg',
			v+'ogg; codecs="flac"',
			v+'ogg; codecs="opus"',
			v+'ogg; codecs="theora"',
			v+'ogg; codecs="theora, flac"',
			v+'ogg; codecs="theora, speex"',
			v+'ogg; codecs="theora, vorbis"',
		)
		videolist.sort()
	}
	if (gRun && type == "audio") {
		addDetail("audio_mimes", audiolist, "lists")
		addDetail("video_mimes", videolist, "lists")
		if (mediaBtn == undefined) {
			mediaBtn = addButton(13, "audio_mimes", audiolist.length +" audio", "btnc", "lists")
				+ addButton(13, "video_mimes", videolist.length +" video", "btnc", "lists")
			addDisplay(13, "mediaBtn", mediaBtn)
		}
	}

	const METRICcan = "canPlayType_"+ type,
		METRICtype = "isTypeSupported_"+ type

	let oMedia = {
		"canPlay": {"maybe": [],"probably": []},
		"isType": {"recorder": [],"source": []}
	}

	try {
		if (runSE) {foo++}
		var obj = document.createElement(type)
		// collect
		let go1 = true, go2 = true, go3 = true, err1, err2, err3
		let list = type == "audio" ? audiolist : videolist
		/* check sorted
		let originalhash = mini(list)
		list.sort()
		if (mini(list) !== originalhash) {console.log(type + " mime list is not sorted")}
		//*/

		list.forEach(function(item) {
			let tmp = item.replace(type +"\/","") // strip "video/","audio/"
			if (go1) {
				try {
					let value = obj.canPlayType(item)
					if (runST) {value = type == "audio" ? undefined : "  "}
					let typeCheck = typeFn(value)
					if ("string" !== typeCheck && "empty string" !== typeCheck) {throw zErrType + typeCheck}
					if ("maybe" === value || "probably" === value) {oMedia["canPlay"][value].push(tmp)}
				} catch(e) {
					go1 = false; err1 = log_error(13, METRICcan, e)
				}
			}
			if (go2) {
				try {
					let value = MediaRecorder.isTypeSupported(item)
					if (runST) {value = type == "audio" ? undefined : ""}
					let typeCheck = typeFn(value)
					if ("boolean" !== typeCheck) {throw zErrType + typeCheck}
					if (value) {oMedia["isType"]["recorder"].push(tmp)}
				} catch(e) {
					go2 = false; err2 = log_error(13, METRICtype +"_MediaRecorder", e)
				}
			}
			if (go3) {
				try {
					let value = MediaSource.isTypeSupported(item)
					if (runST) {value = type == "audio" ? 1 : null}
					let typeCheck = typeFn(value)
					if ("boolean" !== typeCheck) {throw zErrType + typeCheck}
					if (value) {oMedia["isType"]["source"].push(tmp)}
				} catch(e) {
					go3 = false; err3 = log_error(13, METRICtype +"_MediaSource", e)
				}
			}
		})

		// canplay
		let canDisplay, canLies = false
		if (go1) {
			if (runSL) {oMedia["canPlay"] = {"maybe": [], "probably": []}}
			let aMaybe = oMedia["canPlay"]["maybe"]
			let aProbably = oMedia["canPlay"]["probably"]
			if (aMaybe.length == 0 && aProbably.length == 0) {
				canDisplay = "none"
				if (isSmart) {
					canDisplay = log_known(13, METRICcan, canDisplay)
					addData(13, METRICcan, zLIE)
				} else {
					addData(13, METRICcan, canDisplay)
				}
			} else {
				let canobj = {}
				if (aMaybe.length) {canobj["maybe"] = aMaybe}
				if (aProbably.length) {canobj["probably"] = aProbably}
				let canHash = mini(canobj)
				// gecko lies
				if (isSmart) {
					if (aMaybe.length == 0 || aProbably.length == 0) { // either is empty
						canLies = true
					} else {
						// probably: should only include "codecs="something""
						aProbably.forEach(function(item) {
							if (!item.includes("codecs=\"")) {canLies = true}
						})
						if (!canLies) {
							// maybe: shouldn't include "codecs="something"" (i.e it has "mp4; codecs=","mp4; codecs=\"\"")
							aMaybe.forEach(function(item) {
								if (item.includes("codecs=\"")) {
									if (item !== "mp4; codecs=\"\"") {canLies = true}
								}
							})
						}
					}
					if (canLies) {
						canHash = log_known(13, METRICcan, canHash)
						addDetail(METRICcan, canobj, zDOC)
						addData(13, METRICcan, zLIE)
					}
				}
				if (!canLies) {addData(13, METRICcan, canobj, canHash)}
				canDisplay = canHash + addButton(13, METRICcan, aMaybe.length +"/" + aProbably.length)
			}
		} else {
			canDisplay = err1
			addData(13, METRICcan, zErr)
		}
		log_display(13, type +"can", canDisplay)

		// isType
		let typeDisplay, typeLies = false
		if (!go2 && !go3) {
			typeDisplay = zErr +"s"
			addData(13, METRICtype, zErr)
		} else {
			if (runSL) {oMedia["isType"]["recorder"] = []}
			let aRecorder = oMedia["isType"]["recorder"]
			let aSource = oMedia["isType"]["source"]
			if (aRecorder.length == 0 && aSource.length == 0) {
				typeDisplay = "none"
				if (isSmart) {
					typeDisplay = log_known(13, METRICtype, typeDisplay)
					addData(13, METRICtype, zLIE)
				} else {
					addData(13, METRICcan, typeDisplay)
				}
			} else {
				let typeobj = {}
				if (go2 && aRecorder.length) {typeobj["MediaRecorder"] = aRecorder}
				if (go3 && aSource.length) {typeobj["MediaSource"] = aSource}
				let typeHash = mini(typeobj)
				// gecko lies: if only one is empty regardless of cause then you're fucking around, so untrustworthy
				if (isSmart) {
					if (aRecorder.length == 0 || aSource.length == 0) {
						typeLies = true
						typeHash = log_known(13, METRICtype, typeHash)
					}
				}
				let notation = (go2 ? aRecorder.length : zErr) +"/"+ (go3 ? aSource.length : zErr)
				typeDisplay = typeHash + addButton(13, METRICtype, notation)
				if (typeLies) {
					addDetail(METRICtype, typeobj, zDOC)
					addData(13, METRICtype, zLIE)
				} else {
					addData(13, METRICtype, typeobj, typeHash)
				}
			}
		}
		log_display(13, type +"type", typeDisplay)
		log_perf(13, type, t0)

		// ToDo: media: remove audio/video element?
		return

	} catch(e) {
		let error = log_error(13, METRICcan, e)
		log_error(13, METRICtype, e)
		log_display(13, type +"can", error)
		log_display(13, type +"type", error)
		addData(13, METRICcan, zErr)
		addData(13, METRICtype, zErr)
		return
	}
}

function get_preload_media(METRIC) {
	// ToDo: 1969210 when landed
	let value, data = ''
	try {
		value = dom.tzpAudio.preload
		if (runST) {value = 99} else if (runSI) {value = 'banana'}
		if ('string' !== typeFn(value, true)) {throw zErrType + typeFn(value)}
		if ('' == value) {value = typeFn(value)}
		let aValid = ['auto','metadata','none']
		if (isVer < 140) {aValid.push('empty string')} // 929890
		if (!aValid.includes(value)) {aValid.sort(); throw zErrInvalid +'expected ' + aValid.join(', ') + ': got '+ value}
	} catch(e) {
		value = e; data = zErrLog
	}
	addBoth(13, METRIC, value,'','', data)
	return
}

const outputMedia = () => new Promise(resolve => {
	Promise.all([
		get_clearkey('clearkey'),
		get_mimetype_codecs('audio'),
		get_mimetype_codecs('video'),
		get_preload_media('preload_htmlmediaelement'),
		get_autoplay('getAutoplayPolicy'),
	]).then(function(){
		return resolve()
	})
})

countJS(13)
