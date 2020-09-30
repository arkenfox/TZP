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
	let h = "", h2 = ""
	if ("hardwareConcurrency" in navigator) {
		try {
			h = navigator.hardwareConcurrency
			h2 = h
			h = (h == undefined ? zB2 : h + (h == "2" ? rfp_green : rfp_red))
			h2 = (h2 == undefined ? zB0 : h2)
			dom.nHWC.innerHTML = h
		} catch(e) {
			dom.nHWC.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
			h2 = zBO
		}
	} else {
		dom.nHWC = zD
		h2 = zD
	}
	return "hardware concurrency: " + h2
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
				res.sort(Intl.Collator("en-US").compare)
				dom.mimeTypes.innerHTML = res.join("<br>")
				return "mimeTypes: " + sha1(res.join())
			} else {
				dom.mimeTypes.innerHTML = "none"
				return "mimeTypes: none"
			}
		} catch(e) {
			dom.mimeTypes.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
			return "mimeTypes: blocked"
		}
	} else {
		dom.mimeTypes = zD
		return "mimeTypes: disabled"
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
				res.sort(Intl.Collator("en-US").compare)
				dom.plugins.innerHTML = (gibbers ? "gibberish" : res.join("<br>"))
				return "plugins: " + (gibbers ? "gibberish" : sha1(res.join()))
			} else {
				dom.plugins.innerHTML = "none"
				return "plugins: none"
			}
		} catch(e) {
			dom.plugins.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
			return "plugins: blocked"
		}
	} else {
		dom.plugins.innerHTML = zD
		return "plugins: disabled"
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
			let s="", res = []
			try {
				if(typeof speechSynthesis == "undefined") {
					return
				}
				let v = speechSynthesis.getVoices()
				for (let i=0; i < v.length; i++) {
					s += v[i].name + " (" + v[i].lang + ")" + (v[i].default ? " : default" : "") + "<br>"
					res.push(v[i].name + " (" + v[i].lang + ")" + (v[i].default ? " : default" : ""))
				}
				if (s == "") {
					s = "none" + rfp_green // RFP: 1333641
				} else {
					s = s.replace("<br>", rfp_red + "<br>")
				}
				dom.sEngines.innerHTML = s
				// return
				//res.sort(Intl.Collator("en-US").compare)
				//console.debug("engines", res.join(", "))
				//return "speech synth: " + zE + ", " + sha1(res.join()) // cleanup

			} catch(e) {
				dom.sEngines.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
				//return "speech synth: " + zE + ", " + zBO
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
				//return "speech synth: " + zE + ", " + zBO
			}
		} catch(e) {
			dom.sEngines.innerHTML = zB3
			//return "speech synth: " + zE + ", " + zBO
		}
	} else {
		dom.sSynth = zD; dom.sEngines = zNA
		//return "speech synth: " + zD + ", " + zNA
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
	let m = zNS, m2 = m, p = zNS, p2 = p, t = false,
		q="(-moz-touch-enabled:"
	// m
	try {
		if (window.matchMedia(q+"0)").matches) {m=0; m2=0}
		if (window.matchMedia(q+"1)").matches) {m=1; m2=1}
	} catch(e) {
		m = (e.name == "ReferenceError" ? zB1 : zB2)
		m2 = zBO
	}
	// t
	try {document.createEvent("TouchEvent"); t = true} catch (e) {}
	// p
	if ("maxTouchPoints" in navigator) {
		try {
			p = navigator.maxTouchPoints
			p2 = p
			if (p == undefined) {p = zB3; p2 = zBO}
		} catch(e) {
			p = (e.name == "ReferenceError" ? zB1 : zB2)
			p2 = zBO
		}
	}
	let t2 = ("ontouchstart" in window)
	let t3 = ("ontouchend" in window)
	// output
	dom.touch.innerHTML = p +" | "+ m +" | "+ t2 +" | "+ t3 +" | "+ t
	return "touch: "+ p2 +", "+ m2 +", "+ t +", "+ t2 +", "+ t3
}

function get_vr() {
	let r1 = "", r2 = ""
	if ("getVRDisplays" in navigator) {
		dom.nVR = zE
		if ("activeVRDisplays" in navigator) {
			try {
				let d = navigator.activeVRDisplays
				if (d.length == 0) {
					r2 = "none"
					dom.aVR = "none"
				} else {
					// ToDo: VR: enum
					let items = " item" + (d.length == 1 ? "" : "s") + "]"
					r2 = note_ttc
					dom.aVR.innerHTML = note_ttc+" ["+d.length + items
					for (let i=0; i < d.length; i++) {
						// console.debug(d[i].displayId)
					}
				}
			} catch(e) {
				dom.aVR.innerHTML = (e.name == "ReferenceError" ? zB1 : zB2)
			}
			return "vr: " + zE + ", " + r2
		} else {
			return "vr: " + zE + ", " + zD
		}
	}	else {
		dom.nVR = zD;	dom.aVR = zNA
		return "vr: " + zD + ", " + zNA
	}
}

function outputDevices() {
	let t0 = performance.now(),
		section = []

	Promise.all([
		get_gamepads(),
		get_hardware_concurrency(),
		get_media_devices(),
		get_mimetypes(),
		get_plugins(),
		get_pointer_hover(),
		get_speech_rec(),
		get_speech_synth(),
		get_touch(),
		get_vr(),
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		section_info("devices", t0, gt0, section)
	})
}

outputDevices()
