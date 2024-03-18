'use strict';

let mediaBtn

function get_autoplay() {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getAutoplayPolicy
	// a check on a specific element is more reliable (though it doesn't matter on page load)

	// cached from page load
	const METRIC = "getAutoplayPolicy"
	let notation = ""
	if (isAutoPlayError === undefined) {
		if (isSmart) {
			// Note: android (120+ at least) returns "disallowed | disallowed" if phone is on "Do Not Disturb"
			notation = mini(isAutoPlay) == "5be5c665" ? default_green : default_red
		}
		addData(13, METRIC, isAutoPlay)
		log_display(13, METRIC, isAutoPlay + notation)
	} else {
		addData(13, METRIC, isAutoPlay)
		log_display(13, METRIC, isAutoPlayError + (isSmart ? default_red : ""))
	}
	// user: not part of FP; don't record errors etc
	const METRICuser = METRIC +"_user"
	if (gLoad) {
		log_display(13, METRICuser, zNA)
		return
	}
	try {
		let atest, mtest
		let ares = navigator.getAutoplayPolicy("audiocontext")
		try {atest = navigator.getAutoplayPolicy(dom.audiotest)} catch(e) {atest = zErr}
		let mres = navigator.getAutoplayPolicy("mediaelement")
		try {mtest = navigator.getAutoplayPolicy(dom.mediatest)} catch(e) {mtest = zErr}
		log_display(13, METRICuser, (ares === atest ? ares : ares +", "+ atest) +" | "+ (mres === mtest ? mres : mres +", "+ mtest))
	} catch(e) {
		log_display(13, METRICuser, (e+"").slice(0,47) + "...")
	}
	return
}

const get_clearkey = () => new Promise(resolve => {
	const METRIC = "clearkey"
	let notation = ""
	setTimeout(() => resolve([METRIC, zErrTime]), 100)
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
	note: media.gmp-gmpopenh264.enabled (about:plugins: activate state) = no effect
	*/

	// requestMediaKeySystemAccess is an expected nav property
	let typecheck = typeof navigator.requestMediaKeySystemAccess
	if ("function" !== typecheck) {
		log_display(13, METRIC, log_error(SECT13, METRIC, zErrType + typecheck) + (isTB && isSmart ? tb_red: ""))
		return resolve([METRIC, zErr])
	}
	const config = {
		initDataTypes: ['cenc'],
		videoCapabilities: [{
			contentType: 'video/mp4;codecs="avc1.4D401E"'
		}],
		persistentState: "required"
		// 1706121: PB mode currently throws an error
	}
	navigator.requestMediaKeySystemAccess("org.w3.clearkey", [config]).then((key) => {
		if (isSmart) {
			if (isTB) {notation = tb_red} else if (isOS == "android") {notation = default_red}
		}
		if (runSE) {key = {"keySystem" : "org.w3.clearkey"}}
		if (key +"" !== "[object MediaKeySystemAccess]") {
			log_display(13, METRIC, log_error(SECT13, METRIC, zErrInvalid +"expected [object MediaKeySystemAccess]"))
			return resolve([METRIC, zErr])
		} else {
			log_display(13, METRIC, zS + notation)
			return resolve([METRIC, zS])
		}
	})
	.catch(function(e){
		// "NotSupportedError: Key system is unsupported" = JShelter "media playback" (default unprotected)
			// ^ strict (always) | little lies (12.5%)
			// ^ we pick up on little lies in canPlayType

		// "NotSupportedError: Key system configuration is not supported" = PB
		if (isSmart) {
			if (isTB) {
				notation = e+"" === "NotSupportedError: CDM is not installed" ? tb_green: tb_red
			} else if (isOS === "android") {
				notation = e+"" === "NotSupportedError: CDM is not installed" ? default_green: default_red
			} else {
				notation = (e +"" !== "NotSupportedError: Key system configuration is not supported") ? default_red : ""
			}
		}
		log_display(13, METRIC, log_error(SECT13, METRIC, e) + notation)
		return resolve([METRIC, zErr])
	})
})

function get_media(type) {
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
		v+'ogg',
		v+'ogg; codecs="flac"',
		v+'ogg; codecs="opus"',
		v+'ogg; codecs="theora"',
		v+'ogg; codecs="theora, flac"',
		v+'ogg; codecs="theora, speex"',
		v+'ogg; codecs="theora, vorbis"',
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

	if (gRun && type == "audio") {
		addDetail("audio_mimes", audiolist, "lists")
		addDetail("video_mimes", videolist, "lists")
		if (mediaBtn == undefined) {
			mediaBtn = addButton(13, "audio_mimes", audiolist.length +" audio", "btnc", "lists")
				+ addButton(13, "video_mimes", videolist.length +" video", "btnc", "lists")
			log_display(13, "mediaBtn", mediaBtn)
		}
	}

	const METRICcan = "canPlayType_"+ type,
		METRICtype = "isTypeSupported_"+ type

	let oMedia = {
		"canPlay": {"maybe": [],"probably": []},
		"isType": {"recorder": [],"source": []}
	}

	try {
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
					if (runSE) {foo++}
					let str = obj.canPlayType(item)
					if (str == "maybe" || str == "probably") {oMedia["canPlay"][str].push(tmp)}
				} catch(e) {
					go1 = false; err1 = log_error(SECT13, "canPlay", e, isScope, 25)
				}
			}
			if (go2) {
				try {
					if (runSE) {foo++}
					if (MediaRecorder.isTypeSupported(item)) {oMedia["isType"]["recorder"].push(tmp)}
				} catch(e) {
					go2 = false; err2 = log_error(SECT13, "mediarecorder", e, isScope, 25)
				}
			}
			if (go3) {
				try {
					if (runSE) {foo++}
					if (MediaSource.isTypeSupported(item)) {oMedia["isType"]["source"].push(tmp)}
				} catch(e) {
					go3 = false; err3 = log_error(SECT13, "mediasource", e, isScope, 25)
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
					log_known(SECT13, METRICcan)
					canDisplay = colorFn(canDisplay)
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
						canHash = colorFn(canHash)
						log_known(SECT13, METRICcan)
					}
				}
				canDisplay = canHash + addButton(13, METRICcan, aMaybe.length +"/" + aProbably.length)
				if (canLies) {
					addDetail(METRICcan, canobj, zDOC)
					addData(13, METRICcan, zLIE)
				} else {
					addData(13, METRICcan, canobj, canHash)
				}
			}
		} else {
			canDisplay = err1
			addData(13, METRICcan, zErr)
		}
		log_display(13, type +"can", canDisplay)

		// isType
		let typeDisplay, typeLies = false
		if (!go2 && !go3) {
			typeDisplay = err2 // just display first error
			addData(13, METRICtype, zErr)
		} else {
			if (runSL) {oMedia["isType"]["recorder"] = []}
			let aRecorder = oMedia["isType"]["recorder"]
			let aSource = oMedia["isType"]["source"]
			if (aRecorder.length == 0 && aSource.length == 0) {
				typeDisplay = "none"
				if (isSmart) {
					log_known(SECT13, METRICtype)
					typeDisplay = colorFn(typeDisplay)
					addData(13, METRICtype, zLIE)
				} else {
					addData(13, METRICcan, typeDisplay)
				}
			} else {
				let typeobj = {}
				if (go2 && aRecorder.length) {typeobj["MediaRecorder"] = aRecorder}
				if (go3 && aSource.length) {typeobj["MediaSource"] = aSource}
				let typeHash = mini(typeobj)

				// gecko lies
				if (isSmart) {
					if (aRecorder.length == 0 || aSource.length == 0) { // either is empty
						typeLies = true
						typeHash = colorFn(typeHash)
						log_known(SECT13, METRICtype)
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
		log_perf(SECT13, type, t0)

		// ToDo: media: remove audio/video element?
		return

	} catch(e) {
		let error = log_error(SECT13, type, e, 25)
		log_display(13, type +"can", error)
		log_display(13, type +"type", error)
		addData(13, METRICcan, zErr)
		addData(13, METRICtype, zErr)
		return
	}
}

const get_midi = () => new Promise(resolve => {
	let notation = "", count = 0
	function exit(name, value) {
		count++
			if (isSmart) {
				notation = value == "prompt" ? default_green : default_red
			}
			addData(13, name, value)
			log_display(13, name, value + notation)
		if (count == 2) {
			return resolve()
		}
	}
	[false, true].forEach(function(bool) {
		let METRIC = "permission_midi" + (bool == true ? "_sysex" : "")
		try {
			if (runSE) {foo++}
			navigator.permissions.query({name: "midi", sysex: bool}).then(function(r) {
				exit(METRIC, r.state)
			}).catch(error => {
				log_error(SECT13, METRIC, error)
				exit(METRIC, zErr)
			})
		} catch(e) {
			log_error(SECT13, METRIC, e)
			exit(METRIC, zErr)
		}
	})
})

const outputMedia = () => new Promise(resolve => {
	let t0 = nowFn()
	Promise.all([
		get_clearkey(),
		get_media("audio"),
		get_media("video"),
		get_midi("midi"),
		get_autoplay(),
	]).then(function(results){
		// clearkey timeout
		if (results[0][1] === zErrTime) {
			log_display(13, "clearkey", log_error(SECT13, "clearkey", zErrTime) + (isSmart ? default_red : ""))
		}
		results.forEach(function(item) {addDataFromArray(13, item)})
		log_section(13, t0)
		return resolve()
	})
})

countJS(SECT13)
