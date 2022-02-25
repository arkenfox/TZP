'use strict';
 
let mediaBtns = ""

function get_media(runtype) {
	let t0; if (canPerf) {t0 = performance.now()}
	let list = []
	// list
	if (runtype == "video") {
		let v = 'video/', v4 = v+'mp4; codecs="', vm = v+'mpeg; codec="',
			vo = v+'ogg; codecs="', vw = v+'webm; codecs="', vx = v+'x-matroska; codecs="'
		list = [
			// test
			v+'mp4; codecs=\'\'',v+'mp4; codecs=""',v+'mp4; codecs=',
			// mimes
			'application/ogg',v+'3gpp',v+'3gpp2',v+'avi',v+'h263',v+'mp2t',v+'mp4',v+'mpeg',v+'mpeg2',v+'mpeg4',
			v+'msvideo',v+'ogg',v+'quicktime',v+'wavelet',v+'webm',v+'x-flv',v+'x-la-asf',v+'x-m4v',
			v+'x-matroska',v+'x-mkv',v+'x-mng',v+'x-mpeg2',v+'x-ms-wmv',v+'x-msvideo',v+'x-theora',
			// codecs
			v4+'hev1"',v4+'hev1.1.6.L93.90"',v4+'hvc1.1.6.L93.90"',v4+'hev1.1.6.L93.B0"',v4+'hvc1.1.6.L93.B0"',
			v4+'vp09.00.10.08"',v4+'vp09.00.50.08"',v4+'vp09.01.20.08.01"',v4+'vp09.01.20.08.01.01.01.01.00"',
			v4+'vp09.02.10.10.01.09.16.09.01"',v4+'av01.0.08M.08"',vo+'dirac, flac"',vo+'dirac, vorbis"',
			vo+'flac"',vo+'theora"',vo+'theora, flac"',vo+'theora, speex"',vo+'theora, vorbis"',vw+'vorbis"',
			vw+'vp8"',vw+'vp8.0"',vw+'vp8.0, vorbis"',vw+'vp8, opus"',vw+'vp8, vorbis"',vw+'vp9"',vw+'vp9, opus"',
			vw+'vp9, vorbis"',vx+'theora"',vx+'theora, vorbis"',
			// other
			v4+'avc1.42001e"',v4+'avc1.42001e, mp4a.40.2"',v4+'avc1.4d401e"',v4+'avc1.4d401e, mp4a.40.2"',
			v4+'flac"',v4+'H.264, aac"',v4+'H.264, mp3"',vm+'H.264"',vo+'opus"',vw+'av1"',vw+'avc1.4d401e"',
			vw+'avc1.42001e"',vw+'avc1.42001e, mp4a.40.2"',vx+'avc1.42001e"',vx+'avc1.42001e, mp4a.40.2"',
			vx+'avc1.64001e"',vx+'avc1.640028"',vx+'avc1.64002a"',vx+'avc1.640030"',vx+'vp8"',vx+'vp8, opus"',
			vx+'vp8, vorbis"',vx+'vp9"',vx+'vp9, mp4a.40.2"',vx+'vp9, opus"',vx+'vp9, vorbis"',
		]
	} else if (runtype == "audio") {
		let a = 'audio/', a4 = a+'mp4; codecs="', am = a+'mpeg; codecs="', ao = a+'ogg; codecs="',
			aw = a+'webm; codecs="', aw1 = a+'wav; codecs="', aw2 = a+'wave; codecs="',
			ax1 = a+'x-wav; codecs="', ax2 = a+'x-pn-wav; codecs="'
		list = [
		// test
			a+'mp4; codecs=\'\'',a+'mp4; codecs=""',a+'mp4; codecs=',
		// mimes
			//ignore: a+'x-scpls',a+'vnd.wave',a+'wma',a+'ec-3',a+'basic',a+'3gpp',a+'3gpp2',a+'mid',a+'aiff',a+'x-aiff',a+'ac-3',
			'application/ogg',
			a+'aac',a+'ac3',a+'flac',a+'midi',a+'mp3',a+'m4a',a+'mp4',a+'mpeg',a+'mpegurl',a+'wav',a+'wave',a+'webm',
			a+'x-aac',a+'x-ac3',a+'x-flac',a+'x-midi',a+'x-m4a',a+'x-mpeg',a+'x-mpegurl',a+'x-wav',a+'x-pn-wav',
		// codecs
			//blink: a4+'mp4a.40"',a4+'mp4a.66"',a4+'mp4a.68"',a4+'mp4a.69"',a4+'mp4a.6B"',
			//ignore: a4+'bogus"',ao+'speex"',
			a4+'mp4a.40.2"',a4+'mp4a.40.29"',a4+'mp4a.40.5"',a4+'mp4a.67"',
			a4+'mp3"',a4+'flac"',a4+'aac"',a4+'ac3"',am+'mp3"',ao+'opus"',ao+'flac"',ao+'vorbis"',
			aw1+'0"',aw1+'1"',aw1+'2"',aw2+'0"',aw2+'1"',aw2+'2"',aw+'vorbis"',aw+'opus"',
			ax1+'0"',ax1+'1"',ax1+'2"',ax2+'0"',ax2+'1"',ax2+'2"',ax2+'2"',
		]
	}

	list.sort()
	if (logChkList) {
		let preHash = mini(list.join(), "loglist media")
		list = list.filter(function(item, position) {return list.indexOf(item) === position})
		let postHash = mini(list.join(), "media list check")
		if (preHash !== postHash) {console.error(runtype + " list mismatch", preHash, postHash)
		} else {console.log(runtype + " list match", preHash, postHash)}
		//console.log(runtype, list.length +"\n---\n"+ list.join("\n"))
	}

	// lists
	let str = "media_"+ runtype +"_list_notglobal"
	sDetail[str] = list
	if (gLoad) {mediaBtns += buildButton("13", str, list.length +" "+ runtype)}

	// clear
	let sCan = "media_"+ runtype +"_canplaytype",
		sType = "media_"+ runtype +"_istypesupported"
	sDetail[sCan] = []
	sDetail[sType] = []

	// run
	let canm = [], canp = [], src = [], rec = []
	let obj = document.createElement(runtype)
	list.forEach(function(item) {
		let tmp = item.replace(runtype +"\/","") // remove leading "video/" or "audio/"
		try {
			let str = obj.canPlayType(item)
			if (str == "maybe") {canm.push(tmp)}
			if (str == "probably") {canp.push(tmp)}
		} catch(e) {}
		try {
			if (MediaSource.isTypeSupported(item)) {src.push(tmp)}
		} catch(e) {}
		try {
			if (MediaRecorder.isTypeSupported(item)) {rec.push(tmp)}
		} catch(e) {}
	})
	// ToDo: media: remove audio/video element?

	// blocks
	let block1 = (canm.length == 0),
		block2 = (canp.length == 0),
		block3 = (rec.length == 0),
		block4 = (src.length == 0)
	if (gRun) {
		if (block1) {gMethods.push("media:"+ runtype + " canPlayType maybe:" + zB0)}
		if (block2) {gMethods.push("media:"+ runtype + " canPlayType probably:" + zB0)}
		if (block3) {gMethods.push("media:"+ runtype + " isTypeSupported MediaRecorder:" + zB0)}
		if (block4) {gMethods.push("media:"+ runtype + " isTypeSupported MediaSource:" + zB0)}
	}
	// merge
	let hashcan = [], hashtype = []
	if (!block1) {hashcan = ['==maybe==']; hashcan = hashcan.concat(canm)}
	if (!block2) {hashcan.push("==probably=="); hashcan = hashcan.concat(canp)}
	if (!block3) {hashtype = ['==mediarecorder==']; hashtype = hashtype.concat(rec)}
	if (!block3) {hashtype.push("==mediasource=="); hashtype = hashtype.concat(src)}
	// store
	sDetail[sCan] = hashcan
	sDetail[sType] = hashtype

	// output
	let ecan = document.getElementById(runtype +"can"),
		etype = document.getElementById(runtype +"type")
	let notation = ""
	if (block1 && block2) {
		hashcan = zB0
		ecan.innerHTML = zB0
	} else {
		//if (runtype == "audio" && isOS == "android") {dom.debugC.innerHTML = hashcan.join("<br>")}
		hashcan = mini_sha1(hashcan.join(), "media canplay")
		notation = (block1 ? zB0 : canm.length) +"/"+ (block2 ? zB0 : canp.length)
		ecan.innerHTML = hashcan + buildButton("13", sCan, notation)
	}
	if (block3 && block4) {
		hashtype = zB0
		etype.innerHTML = zB0
	} else {
		hashtype = mini_sha1(hashtype.join(), "media istype")
		notation = (block3 ? zB0 : rec.length) +"/"+ (block4 ? zB0 : src.length)
		etype.innerHTML = hashtype + buildButton("13", sType, notation)
	}
	// return
	log_perf(runtype +" [media]",t0)
	return (["canPlay_"+ runtype +":"+ hashcan, "isTypeSupported_"+ runtype +":"+ hashtype])
}

function outputMedia() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = [], r = ""
	// FF63+
	if (isFF && isVer < 63) {r = zNS} else (r = (check_navKey("mediaCapabilities") ? zE : zD))
	dom.nMediaC = r
	section.push("mediaCapabilities:"+ r)
	// FF71+
	if (isFF && isVer < 71) {r = zNS} else (r = (check_navKey("mediaSession") ? zE : zD))
	dom.nMediaS = r
	section.push("mediaSession:"+ r)

	Promise.all([
		get_media("audio"),
		get_media("video")
	]).then(function(results){
		results.forEach(function(currentResult) {
			if (Array.isArray(currentResult)) {
				currentResult.forEach(function(item) {
					section.push(item)
				})
			} else {
				section.push(currentResult)
			}
			dom.mediaBtns.innerHTML = mediaBtns
		})
		log_section("media", t0, section)
	})
}

countJS("media")
