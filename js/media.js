'use strict';

function reset_media() {
	dom.audiodata.style.color = zhide
	dom.videodata.style.color = zhide
	let str = dom.audiodata.innerHTML
	str = str.replace(/s13/g, "")
	dom.audiodata.innerHTML = str
	str = dom.videodata.innerHTML
	str = str.replace(/s13/g, "")
	dom.videodata.innerHTML = str
}

function get_media(runtype) {
	let list = [],
		t0 = performance.now(),
		sColor = s13
	// list
	if (runtype == "video") {
		let v = 'video/', v4 = v+'mp4; codecs="', vm = v+'mpeg; codec="',
			vo = v+'ogg; codecs="', vw = v+'webm; codecs="', vx = v+'x-matroska; codecs="'
		list = [
			// test cases
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
			'application/ogg',a+'webm',a+'mpeg',a+'x-mpeg',a+'mp4',a+'wave',a+'wav',a+'x-wav',a+'x-pn-wav',
			a+'vnd.wave',a+'wma',a+'mp3',a+'3gpp',a+'3gpp2',a+'aac',a+'x-aac',a+'m4a',a+'x-m4a',a+'aiff',
			a+'x-aiff',a+'ac3',a+'ac-3',a+'x-ac3',a+'ec-3',a+'basic',a+'flac',a+'x-flac',a+'mid',a+'midi',
			a+'x-midi',a+'mpegurl',a+'x-mpegurl',a+'x-scpls',
			// codecs
			a4+'mp4a.40"',a4+'mp4a.40.1"',a4+'mp4a.40.2"',a4+'mp4a.40.3"',a4+'mp4a.40.4"',a4+'mp4a.40.5"',
			a4+'mp4a.40.6"',a4+'mp4a.40.7"',a4+'mp4a.40.8"',a4+'mp4a.40.9"',a4+'mp4a.40.12"',a4+'mp4a.40.13"',
			a4+'mp4a.40.14"',a4+'mp4a.40.15"',a4+'mp4a.40.16"',a4+'mp4a.40.17"',a4+'mp4a.40.19"',
			a4+'mp4a.40.20"',a4+'mp4a.40.21"',a4+'mp4a.40.22"',a4+'mp4a.40.23"',a4+'mp4a.40.24"',
			a4+'mp4a.40.25"',a4+'mp4a.40.26"',a4+'mp4a.40.27"',a4+'mp4a.40.28"',a4+'mp4a.40.29"',
			a4+'mp4a.40.32"',a4+'mp4a.40.33"',a4+'mp4a.40.34"',a4+'mp4a.40.35"',a4+'mp4a.40.36"',
			a4+'mp4a.66"',a4+'mp4a.67"',a4+'mp4a.68"',a4+'mp4a.69"',a4+'mp4a.6B"',a4+'mp3"',a4+'flac"',
			a4+'bogus"',a4+'aac"',a4+'ac3"',am+'mp3"',ao+'opus"',ao+'flac"',ao+'vorbis"',
			ao+'speex"',aw1+'0"',aw1+'1"',aw1+'2"',aw2+'0"',aw2+'1"',aw2+'2"',aw+'vorbis"',aw+'opus"',
			ax1+'0"',ax1+'1"',ax1+'2"',ax2+'0"',ax2+'1"',ax2+'2"',
		]
	}
	// sort
	list.sort()

	// dev: debug + remove dupes
	let prev = ""
	for (let i=0; i < list.length; i++) {
		if (list[i] == prev) {console.debug(runtype+" dupe:", list[i])}
		prev = list[i]
	}
	list = list.filter(function(item, position) {return list.indexOf(item) === position})
	// full list
	//console.log(runtype + " list [" + list.length + " items]\n" + list.join("\n"))

	// run
	let canm = [], canp = [], src = [], rec = []
	let obj = document.createElement(runtype)
	list.forEach(function(item) {
		let tmp = item.replace(runtype+"\/","")
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

	// elements
	let ecan = document.getElementById(runtype+"can"),
		etype = document.getElementById(runtype+"type"),
		edata = document.getElementById(runtype+"data")
	// blocks
	let block1 = (canm.length == 0),
		block2 = (canp.length == 0),
		block3 = (src.length == 0),
		block4 = (rec.length == 0)
	// output detail
	let hashcan = sColor +"maybe: "+sc + (block1 ? "blocked" :canm.join(", "))
		+ sColor +" probably: "+sc + (block2 ? "blocked" :canp.join(", "))
	let hashtype = sColor +"mediasource: "+sc + (block3 ? "blocked" :src.join(", "))
		+ sColor +" mediarecoder: "+sc + (block4 ? "blocked" : rec.join(", "))
	edata.innerHTML = hashcan + hashtype
	edata.style.color = zshow
	// merged hashes
	hashcan = ['maybe']; hashcan = hashcan.concat(canm)
	hashcan.push("probably"); hashcan = hashcan.concat(canp)
	hashtype = ['mediasource']; hashtype = hashtype.concat(src)
	hashtype.push("mediarecorder"); hashtype = hashtype.concat(rec)
	hashcan = sha1(hashcan.join())
	hashtype = sha1(hashtype.join())
	// output play
	let notation = sColor +" ["+ canm.length +"|"+ canp.length +"/"+ list.length +"]"+ sc,
		blockP = block1 + block2,
		partblock = sb+"[partly blocked]"+sc
	if (blockP == 2) {notation = zB}
	if (blockP == 1) {notation += partblock}
	ecan.innerHTML = hashcan + notation
	// output type
	notation = sColor +" ["+ src.length +"|"+ rec.length +"/"+ list.length +"]"+ sc
	let blockT = block3 + block4
	if (blockT == 2) {notation = zB}
	if (blockT == 1) {notation += partblock}
	etype.innerHTML = hashtype + notation
	// perf
	if (logPerf) {debug_log(runtype +" [media]",t0)}
	return (runtype+":" + hashcan + ":" + hashtype)
}

function outputMedia() {
	let t0 = performance.now(),
		section = [], r = ""

	// mediaCapabilities: FF63+
	if (isFF && isVer < 63) {r = zNS} else (r = ("mediaCapabilities" in navigator ? zE : zD))
	dom.nMediaC = r
	section.push("mediaCapabilities:" + r)

	// mediaSession: FF71+
	if (isFF && isVer < 71) {r = zNS} else (r = ("mediaSession" in navigator ? zE : zD))
	dom.nMediaS = r
	section.push("mediaSession:" + r)

	Promise.all([
		get_media("audio"),
		get_media("video")
	]).then(function(results){
		for (let i = 0; i < 2; i++) {
			let parts = results[i].split(":")
			section.push("canPlay_" + parts[0]+":"+parts[1])
			section.push("isTypeSupported_" + parts[0]+":"+parts[2])
		}
		section_info("media", t0, gt0, section)
	})
}

outputMedia()
