'use strict';

function reset_devices() {
	dom.mimeTypes.style.color = zhide
	dom.plugins.style.color = zhide
	dom.eMD.style.color = zhide
	let str = dom.eMD.innerHTML
	str = str.replace(/\[RFP\]/g, "")
	dom.eMD.innerHTML = str
	str = dom.plugins.innerHTML
	str = str.replace(/\[RFP\]/g, "")
	dom.plugins.innerHTML = str
	str = dom.mimeTypes.innerHTML
	str = str.replace(/\[RFP\]/g, "")
	dom.mimeTypes.innerHTML = str
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

function get_concurrency() {
	let h = zD
	if ("hardwareConcurrency" in navigator) {
		try {
			h = navigator.hardwareConcurrency
			h = (h == undefined ? zB0 : h)
		} catch(e) {
			h = zB0
		}
	}
	dom.nHWC.innerHTML = h + (h == "2" ? rfp_green : rfp_red)
	return "hardwareConcurrency:" + h
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
			dom.eMD.innerHTML = zB0
		}
	}	else {
		dom.nMD = zD; dom.eMD = zNA
	}
	dom.eMD.style.color = zshow
}

function get_mimetypes() {
	return new Promise(resolve => {
		let res = []
		function display(output) {
			if (output == "none") {
				output += rfp_green
			} else {
				if (res.length == 1) {
					output += rfp_red
				} else {
					output = output.replace("<br>", rfp_red + "<br>")
				}
			}
			dom.mimeTypes.innerHTML = output
			dom.mimeTypes.style.color = zshow
		}
		if ("mimeTypes" in navigator) {
			try {
				let m = navigator.mimeTypes
				if (m.length > 0) {
					let res = []
					for (let i=0; i < m.length; i++) {
						res.push( m[i].type + (m[i].description == "" ? ": * " : ": " + m[i].type)
							+ (m[i].suffixes == "" ? ": *" : ": " + m[i].suffixes) )
					}
					// flash examples in FF
						// application/futuresplash: application/futuresplash: spl
						// application/x-shockwave-flash: application/x-shockwave-flash: swf
					res.sort()
					display(res.join("<br>"))
					return resolve("mimeTypes:" + sha1(res.join()))
				} else {
					display("none")
					return resolve("mimeTypes:none")
				}
			} catch(e) {
				display(zB0)
				return resolve("mimeTypes:blocked")
			}
		} else {
			display(zD)
			return resolve("mimeTypes:disabled")
		}
	})
}

function get_mm_hover(type){
	let x=zNS, h="hover", n="none", q="("+type+":"
	try {
		if (window.matchMedia(q+n+")").matches) x=n
		if (window.matchMedia(q+h+")").matches) x=h
	} catch(e) {x = zB0}
	return x
}

function get_mm_pointer(type){
	let x=zNS, f="fine", c="coarse", n="none", q="("+type+": "
	try {
		if (window.matchMedia(q+n+")").matches) x=n
		if (window.matchMedia(q+c+")").matches) x=c
		if (window.matchMedia(q+f+")").matches) x=f
	} catch(e) {x = zB0}
	return x
}

function get_plugins() {
	return new Promise(resolve => {
		let res = [], isLies = true
		function display(output) {
			if (output == "none") {
				output += rfp_green
			} else {
				if (res.length == 1) {
					output += rfp_red
				} else {
					output = output.replace("<br>", rfp_red + "<br>")
				}
			}
			dom.plugins.innerHTML = output
			dom.plugins.style.color = zshow
		}
		if ("plugins" in navigator) {
			try {
				let p = navigator.plugins
				if (p.length > 0) {
					for (let i=0; i < p.length; i++) {
						// ToDo: better lie detection: e.g mixed alphanumeric
							// logic is anyone not messing with plugins would show " PDF "
							// Chromium PDF Plugin, Chromium PDF Viewer, News feed handler
						if (isEngine == "blink") {
							let str = p[i].name
							if (str.indexOf(" PDF ") > 0) {isLies = false}
						}
						res.push(p[i].name + (p[i].filename == "" ? ": * " : ": " + p[i].filename)
							+ (p[i].description == "" ? ": *" : ": " + p[i].description))
					}
					res.sort()
					//console.debug("plugins\n - " + res.join("\n - "))
					// FF: limited to Flash
						// ToDo: add flash EOL version check Dec2020/Jan2021
					if (isFF) {
						isLies = false
						if (res.length > 1) {
							isLies = true
						} else if (res.length == 1) {
							if (res[0].split(":")[0] !== "Shockwave Flash") {isLies = true}
						}
					}
					if (isFF || isEngine == "blink") {
						display((isLies ? "fake" : res.join("<br>")))
						return resolve("plugins:" + (isLies ? "lies" : sha1(res.join())))
					} else {
						display(res.join("<br>"))
						return resolve("plugins:" + sha1(res.join()))
					}
				} else {
					display("none")
					return resolve("plugins:none")
				}
			} catch(e) {
				dom.plugins.innerHTML = zB0
				return resolve("plugins:blocked")
			}
		} else {
			display(zD)
			return resolve("plugins:disabled")
		}
	})
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
				//res.sort()
				//console.debug("engines", res.join(", "))
				//return "speech synth: " + zE + ", " + sha1(res.join()) // cleanup

			} catch(e) {
				dom.sEngines.innerHTML = zB0
				//return "speech synth: " + zE + ", " + zB0
			}
		}
		try {
			if (speechSynthesis.onvoiceschanged !== undefined) {
				populateVoiceList()
				if (typeof speechSynthesis !== "undefined") {
					speechSynthesis.onvoiceschanged = populateVoiceList
				}
			} else if (speechSynthesis.onvoiceschanged == undefined) {
				dom.sEngines.innerHTML = zB0
				//return "speech synth: " + zE + ", " + zB0
			}
		} catch(e) {
			dom.sEngines.innerHTML = zB0
			//return "speech synth: " + zE + ", " + zB0
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
	let m = zNS, p = zNS, t = false, q="(-moz-touch-enabled:"
	// m
	try {
		if (window.matchMedia(q+"0)").matches) {m=0}
		if (window.matchMedia(q+"1)").matches) {m=1}
	} catch(e) {m = zB0}
	// t
	try {document.createEvent("TouchEvent"); t = true} catch (e) {}
	let t2 = ("ontouchstart" in window)
	let t3 = ("ontouchend" in window)
	// p
	if ("maxTouchPoints" in navigator) {
		try {
			p = navigator.maxTouchPoints
			p = (p == undefined ? zB0 : p)
		} catch(e) {p = zB0}
	}
	// output
	let str = p +" | "+ m +" | "+ t2 +" | "+ t3 +" | "+ t
	dom.touch.innerHTML = str
	return "touch:"+ str
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
				dom.aVR.innerHTML = zB0
			}
			return "vr:" + zE +", "+ r2
		} else {
			return "vr:" + zE +", "+ zD
		}
	}	else {
		dom.nVR = zD;	dom.aVR = zNA
		return "vr:" + zD + ", " + zNA
	}
}

function outputDevices() {
	let t0 = performance.now(),
		section = []

	//ToDo: promisify and add to section hash
	get_gamepads()
	get_media_devices()
	get_speech_rec()
	get_speech_synth()
	get_pointer_hover()

	Promise.all([
		get_concurrency(),
		get_mimetypes(),
		get_plugins(),
		get_touch(),
		get_vr(),
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		section_info("devices", t0, section)
	})
}

setTimeout(function() {outputDevices()}, 1)
