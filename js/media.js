'use strict';

let mediaBtn

function get_autoplay() {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getAutoplayPolicy
	// a check on a specific element is more reliable (though it doesn't matter on page load)
	const METRIC = "getAutoplayPolicy"
	const METRICuser = METRIC +"_user"

	try {
		let atest, mtest
		let ares = navigator.getAutoplayPolicy("audiocontext")
		try {atest = navigator.getAutoplayPolicy(dom.audiotest)} catch(e) {
			log_error(SECT13, METRIC, e)
			atest = zErr
		}
		let mres = navigator.getAutoplayPolicy("mediaelement")
		try {mtest = navigator.getAutoplayPolicy(dom.mediatest)} catch(e) {
			log_error(SECT13, METRIC, e)
			mtest = zErr
		}
		if (gLoad) {
			if (runSE) {foo++}
			isAutoPlay = (ares === atest ? ares : ares +", "+ atest)
			+" | "+ (mres === mtest ? mres : mres +", "+ mtest)
		} else {
			if (runSE) {foo++}
			log_display(13, METRICuser, (ares === atest ? ares : ares +", "+ atest)
				+" | "+ (mres === mtest ? mres : mres +", "+ mtest)
			)
		}
	} catch(e) {
		if (gLoad) {
			isAutoPlay = zErr
			isAutoPlayErr = log_error(SECT13, METRIC, e, isScope, 50, true) // persist error to sect13
		} else {
			// don't add user error to error FP
			log_display(13, METRICuser, (e+"").slice(0,47) + "...")
		}
	}

	// page load
	let notation = ""
	if (isAutoPlayErr == undefined) {
		if (isSmart) {
			notation = mini(isAutoPlay) == "5be5c665" ? default_green : default_red
		}
		addData(13, METRIC, isAutoPlay)
		log_display(13, METRIC, isAutoPlay + notation)
	} else {
		if (isSmart) {notation = default_red}
		addData(13, METRIC, isAutoPlay)
		log_display(13, METRIC, isAutoPlayErr + notation)
	}
	if (gLoad) {
		log_display(13, METRICuser, zNA)
	}
	return
}

const get_clearkey = () => new Promise(resolve => {
	const METRIC = "clearkey"
	/*
	https://w3c.github.io/encrypted-media/#common-key-systems
	gecko only supports
	- com.widevine.alpha : causes a DRM prompt if disabled so ignore
	- org.w3.clearkey
	note: media.gmp-gmpopenh264.enabled (about:plugins: activate state) = no effect
	*/

	// requestMediaKeySystemAccess is an expected nav property
	let typecheck = typeof navigator.requestMediaKeySystemAccess
	if ("function" !== typecheck) {
		log_display(13, METRIC, log_error(SECT13, METRIC, zErrType + typecheck) + (isTB && isSmart ? tb_red: ""))
		return resolve([METRIC, zErr])
	}

	let t0 = nowFn()
	const config = {
		initDataTypes: ['cenc'],
		videoCapabilities: [{
			contentType: 'video/mp4;codecs="avc1.4D401E"'
		}]
	}
	navigator.requestMediaKeySystemAccess("org.w3.clearkey", [config]).then((key) => {
		let display = zS, value = zS
		if (runSL) {key = {"keySystem" : "org.w3.clearkey"}}
		// tampered
		if (key +"" !== "[object MediaKeySystemAccess]") {
			value = zLIE
			display = colorFn(value)
			log_known(SECT13, METRIC)
		}
		log_display(13, METRIC, display + (isTB && isSmart ? tb_red: ""))
		log_perf(SECT13, METRIC, t0)
		return resolve([METRIC, value])
  })
	.catch(function(e){
		let notation = ""
		if (isTB && isSmart) {
			notation = e+"" === "NotSupportedError: CDM is not installed" ? tb_green: tb_red
		}
		log_display(13, METRIC, log_error(SECT13, METRIC, e) + notation)
		log_perf(SECT13, METRIC, t0)
		return resolve([METRIC, zErr])
	})
})

function get_media(type) {
	// https://privacycheck.sec.lrz.de/active/fp_cpt/fp_can_play_type.html
	// https://cconcolato.github.io/media-mime-support/
	let v = "video/", a = "audio/"
	
	// ToDo: add wmf: e.g. 1806552
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
		v+'video/3gpp',
		v+'mp4',
		v+'mp4; codecs=',
		v+'mp4; codecs=""',
		v+'mp4; codecs="av01.0.00M.12"', // 12bit
		v+'mp4; codecs="avc1"',
		v+'mp4; codecs="avc1.58000a"', // extended
		v+'mp4; codecs="avc1.6e000a"', // high 10
		v+'mp4; codecs="avc1.7a000a"', // high 4:2:2
		v+'mp4; codecs="avc1.f4000a"', // high 4:4:4
		v+'mp4; codecs="avc3"',
		v+'mp4; codecs="flac"',
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

	if (gRun && mediaBtn == undefined) {
		addDetail("audio_mimes", audiolist, "lists")
		addDetail("video_mimes", videolist, "lists")
		mediaBtn = addButton(13, "audio_mimes", audiolist.length +" audio", "btnc", "lists")
			+ addButton(13, "video_mimes", videolist.length +" video", "btnc", "lists")
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
		let canDisplay
		if (go1) {
			let aMaybe = oMedia["canPlay"]["maybe"]
			let aProbably = oMedia["canPlay"]["probably"]
			if (aMaybe.length == 0 && aProbably.length == 0) {
				canDisplay = "none"
				addData(13, METRICcan, canDisplay)
			} else {
				let canobj = {}
				if (aMaybe.length) {canobj["maybe"] = aMaybe}
				if (aProbably.length) {canobj["probably"] = aProbably}
				let canHash = mini(canobj)
				canDisplay = canHash + addButton(13, METRICcan, aMaybe.length +"/" + aProbably.length)
				addData(13, METRICcan, canobj, canHash)
			}
		} else {
			canDisplay = err1
			addData(13, METRICcan, zErr)
		}
		log_display(13, type +"can", canDisplay)

		// isType
		let typeDisplay
		if (!go2 && !go3) {
			typeDisplay = err2 // just display first error
			addData(13, METRICtype, zErr)
		} else {
			let aRecorder = oMedia["isType"]["recorder"]
			let aSource = oMedia["isType"]["source"]
			if (aRecorder.length == 0 && aSource.length == 0) {
				typeDisplay = "none"
				addData(13, METRICtype, typeDisplay)
			} else {
				let typeobj = {}
				if (go2 && aRecorder.length) {typeobj["MediaRecorder"] = aRecorder}
				if (go3 && aSource.length) {typeobj["MediaSource"] = aSource}
				let typeHash = mini(typeobj)
				let notation = (go2 ? aRecorder.length : zErr) +"/"+ (go3 ? aSource.length : zErr)
				typeDisplay = typeHash + addButton(13, METRICtype, notation)
				addData(13, METRICtype, typeobj, typeHash)
			}
		}
		log_display(13, type +"type", typeDisplay)

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


function outputMedia() {
	let t0 = nowFn();
	Promise.all([
		get_media("audio"),
		get_media("video"),
		get_midi("midi"),
		get_clearkey(),
		get_autoplay(),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(13, item)})
		log_display(13, "mediaBtn", mediaBtn)
		log_section(13, t0)
	})
}

countJS(SECT13)
