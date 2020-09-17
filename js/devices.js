'use strict';

function reset_devices() {
	dom.mimeTypes.style.color = zhide
	dom.plugins.style.color = zhide
	dom.eMD.style.color = zhide
	let str = dom.eMD.innerHTML
	str = str.replace(/\[RFP\]/g, "")
	dom.eMD.innerHTML = str
}

function get_gamepads() {
	if ("getGamepads" in navigator) {
		dom.nGP = zE
		// ToDo: listen for gamepads
		dom.eGP.innerHTML = note_ttc
	} else {
		dom.nGP = zD; dom.eGP = zNA
	}
}

function get_hardware_concurrency() {
	if ("hardwareConcurrency" in navigator) {
		try {
			let h = navigator.hardwareConcurrency
			h = (h == undefined ? zB2 : h + (h == "2" ? rfp_green : rfp_red))
			dom.nHWC.innerHTML = h
		} catch(e) {
			dom.nHWC.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
		}
	} else {
		dom.nHWC = zD
	}
}

function get_media_devices() {
	if ("mediaDevices" in navigator) {
		dom.nMD = zE
		// enumerate
		let str="", pad=13, strPad=""
		try {
			navigator.mediaDevices.enumerateDevices().then(function(devices) {
				let aCount=0, vCount=0, oCount=0
				devices.forEach(function(d) {
					if (d.kind == "audioinput") {aCount++}
					else if (d.kind == "videoinput") {vCount++}	else {oCount++}
					str += (d.kind+": ").padStart(pad)+d.deviceId
					if (d.groupId.length > 0) {
						strPad = ("group: ").padStart(pad)
						str += "<br>"+strPad+d.groupId
					}
					if (d.label.length > 0) {
						strPad = ("label: ").padStart(pad)
						str += "<br>"+strPad+d.label
					}
					str += "<br>"
				})
				// rfp
				if (aCount == 1 && vCount == 1 && oCount == 0) {
					str = str.replace("<br>", rfp_green+"<br>")
				} else {
					str = str.replace("<br>", rfp_red+"<br>")
				}
				dom.eMD.innerHTML = str
			})
			.catch(function(e) {
				dom.eMD.innerHTML = e.name +": "+ e.message
			})
		} catch(e) {
			dom.eMD.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
		}
	}	else {
		dom.nMD = zD; dom.eMD = zNA
	}
	dom.eMD.style.color = zshow
}

function get_mimetypes() {
	if ("mimeTypes" in navigator) {
		try {
			let m = navigator.mimeTypes
			if (m.length > 0) {
				let res = []
				for (let i=0; i < m.length; i++) {
					res.push( m[i].type + (m[i].description == "" ? ": * " : ": " + m[i].type)
						+ (m[i].suffixes == "" ? ": *" : ": " + m[i].suffixes) )
				}
				res.sort()
				dom.mimeTypes.innerHTML = res.join("<br>")
			} else {
				dom.mimeTypes.innerHTML = "none"
			}
		} catch(e) {
			dom.mimeTypes.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
		}
	} else {
		dom.mimeTypes = zD
	}
	dom.mimeTypes.style.color = zshow
}

function get_mm_hover(type){
	let x=zNS, h="hover", n="none", q="("+type+":"
	try {
		if (window.matchMedia(q+n+")").matches) x=n
		if (window.matchMedia(q+h+")").matches) x=h
	} catch(e) {x = (e.name == "ReferenceError" ? zB1 : zB2)}
	return x
}

function get_mm_pointer(type){
	let x=zNS, f="fine", c="coarse", n="none", q="("+type+": "
	try {
		if (window.matchMedia(q+n+")").matches) x=n
		if (window.matchMedia(q+c+")").matches) x=c
		if (window.matchMedia(q+f+")").matches) x=f
	} catch(e) {x = (e.name == "ReferenceError" ? zB1 : zB2)}
	return x
}

function get_plugins() {
	if ("plugins" in navigator) {
		try {
			let res = [], gibbers = true
			let p = navigator.plugins
			if (p.length > 0) {
				for (let i=0; i < p.length; i++) {
					if (isEngine == "blink") {
						// ToDo: better gibberish detection: e.g mixed alphanumeric
							// Chromium PDF Plugin, Chromium PDF Viewer, News feed handler
						let str = p[i].name
						if (str.indexOf(" PDF ") > 0) {
							// the logic is that anyone not messing with plugins would show PDF
							gibbers = false
						}
					}
					res.push(p[i].name + (p[i].filename == "" ? ": * " : ": " + p[i].filename)
						+ (p[i].description == "" ? ": *" : ": " + p[i].description))
				}
				res.sort()
				dom.plugins.innerHTML = (gibbers ? "gibberish" : res.join("<br>"))
			} else {
				dom.plugins.innerHTML = "none"
			}
		} catch(e) {
			dom.plugins.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
		}
	} else {
		dom.plugins.innerHTML = zD
	}
	dom.plugins.style.color = zshow
}

function get_pointer_hover() {
	// FF64: pointer/hover
	dom.pointer = (window.PointerEvent == "undefined" ? zD : zE)
	let p = get_mm_pointer("any-pointer")+" | "+get_mm_pointer("pointer")
	let h = get_mm_hover("any-hover")+" | "+get_mm_hover("hover")
	// 1607316
	if (isVer > 73 && isOS == "android") {
		p += (p == "coarse | coarse" ? rfp_green : rfp_red)
		h += (h == "none | none" ? rfp_green : rfp_red)
	} else {
		let rfp = zNS+" | "+zNS
		if (p !== rfp) {
			p += (p == "fine | fine" ? rfp_green : rfp_red)
		}
		if (h !== rfp) {
			h += (h == "hover | hover" ? rfp_green : rfp_red)
		}
	}
	dom.mmP.innerHTML = p
	dom.mmH.innerHTML = h
}

function get_speech_synth() {
	if ("speechSynthesis" in window) {
		dom.sSynth = zE
		// speech engines
		function populateVoiceList() {
			let s=""
			try {
				if(typeof speechSynthesis == "undefined") {
					return
				}
				let v = speechSynthesis.getVoices()
				for (let i=0; i < v.length; i++) {
					s += v[i].name + " (" + v[i].lang + ")" + (v[i].default ? " : default" : "") + "<br>"
				}
				if (s == "") {
					s = "none" + rfp_green // RFP: 1333641
				} else {
					s = s.replace("<br>", rfp_red + "<br>")
				}
				dom.sEngines.innerHTML = s
			} catch(e) {
				dom.sEngines.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
			}
		}
		try {
			if (speechSynthesis.onvoiceschanged !== undefined) {
				populateVoiceList()
				if (typeof speechSynthesis !== "undefined") {
					speechSynthesis.onvoiceschanged = populateVoiceList
				}
			} else if (speechSynthesis.onvoiceschanged == undefined) {
				dom.sEngines.innerHTML = zB4
			}
		} catch(e) {
			dom.sEngines.innerHTML = zB3
		}
	} else {
		dom.sSynth = zD; dom.sEngines = zNA
	}
}

function get_speech_rec() {
	// media.webspeech.recognition.enable
	// NOTE: media.webspeech.test.enable until landed
	try {
		let recognition = new SpeechRecognition()
		dom.sRec = zE
	} catch(e) {
		// undefined
		// ToDo: speechRec: detect disabled vs not-supported?
		dom.sRec = zD+" [or "+zNS+"]"
	}
}

function get_touch() {
	// vars
	let m = zNS, p = "", t = false,
		q="(-moz-touch-enabled:"
	// m
	try {
		if (window.matchMedia(q+"0)").matches) m=0
		if (window.matchMedia(q+"1)").matches) m=1
	} catch(e) {m = (e.name == "ReferenceError" ? zB1 : zB2)}
	// t
	try {document.createEvent("TouchEvent"); t = true} catch (e) {}
	// p
	if ("maxTouchPoints" in navigator) {
		try {
			p = navigator.maxTouchPoints
			if (p == undefined) {p = zB3}
		} catch(e) {
			p = (e.name == "ReferenceError" ? zB1 : zB2)
		}
	} else {
		p = zNS
	}
	// output
	dom.touch.innerHTML = p +" | "+ m +" | "+("ontouchstart" in window)+" | "+("ontouchend" in window)+" | "+ t
}

function get_vr() {
	if ("getVRDisplays" in navigator) {
		dom.nVR = zE
		if ("activeVRDisplays" in navigator) {
			try {
				let d = navigator.activeVRDisplays
				if (d.length == 0) {
					dom.aVR = "none"
				} else {
					// ToDo: VR: enum
					let items = " item" + (d.length == 1 ? "" : "s") + "]"
					dom.aVR.innerHTML = note_ttc+" ["+d.length + items
					for (let i=0; i < d.length; i++) {
						// console.debug(d[i].displayId)
					}
				}
			} catch(e) {
				dom.aVR.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
			}
		}
	}	else {
		dom.nVR = zD; dom.aVR = zNA
	}
}

function outputDevices() {
	let t0 = performance.now()
	// run
	get_gamepads()
	get_hardware_concurrency()
	get_media_devices()
	get_mimetypes()
	get_plugins()
	get_pointer_hover()
	get_speech_rec()
	get_speech_synth()
	get_touch()
	get_vr()
	// perf
	debug_page("perf","devices",t0,gt0)
}

outputDevices()
