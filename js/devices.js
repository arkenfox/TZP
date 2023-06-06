'use strict';

const get_device_integer = (METRIC, proxyCheck) => new Promise(resolve => {
	// concurrency: 1630089: macOS reports physical cores instead of logical
		// capped at dom.maxHardwareConcurrency e.g 1728741
	function exit(value, display) {
		log_display(7, METRIC, display)
		return resolve([METRIC, value])
	}
	let expected = METRIC == "hardwareConcurrency" ? 2 : 24
	try {
		let value = 2 == expected ? navigator[METRIC] : screen[METRIC]
		if (runSE) {foo++
		} else if (runST) {value += ""
		} else if (runSL && isSmart) {sData[SECT99].push(proxyCheck + METRIC)
		}
		let display = value
		if (Number.isInteger(value)) {
			if (isSmart) {
				if (sData[SECT99].includes(proxyCheck + METRIC)) {
					display = colorFn(display)
					value = zLIE
					log_known(SECT7, METRIC)
				}
				display += display === expected ? rfp_green : rfp_red
			}
			exit(value, display)
		} else {
			exit(zErr, log_error(SECT7, METRIC, zErrType + typeof value))
		}
	} catch(e) {
		log_error(SECT7, METRIC, e, isScope)
		exit(zErr, zErr + (isSmart ? rfp_red : ""))
	}
})

const get_maxtouch = () => new Promise(resolve => {
	// maxTouchPoints: FF64+: RFP 1363508
	const METRIC = "maxTouchPoints"
	let value, display, isLies = false, notation = ""
	try {
		value = navigator.maxTouchPoints
		if (runSE) {foo++} else if (runST) {value = undefined
		} else if (runSL && isSmart) {sData[SECT99].push("Navigator.maxTouchPoints")}
		display = value
		if (typeof value !== "number") {
			display = log_error(SECT7, METRIC, zErrType + typeof value)
			value = zErr
		} else if (!Number.isInteger(value) || value < 0) {
			display = log_error(SECT7, METRIC, zErrInvalid + "got "+ value)
			value = zErr
		} else if (isSmart) {
			if (sData[SECT99].includes("Navigator.maxTouchPoints")) {
				display = colorFn(display)
				value = zLIE
				log_known(SECT7, "maxtouchpoints")
			}
		}
	} catch(e) {
		display = log_error(SECT7, METRIC, e)
		value = zErr
	}
	if (isSmart) {notation = display === 0 ? rfp_green : rfp_red}
	log_display(7, METRIC, display + notation)
	return resolve([METRIC, value])
})

const get_mm_color = () => new Promise(resolve => {
	const METRIC = "color"
	function exit(value, display) {
		log_display(7, METRIC, display)
		return resolve([METRIC, value])
	}
	let isErr = false, value, display
	try {
		if (runSE) {foo++}
		value = (function() {for (let i=0; i < 1000; i++) {if (matchMedia("(color:"+ i +")").matches === true) {return i}}
			return i
		})()
		if (runST) {value += ""} else if (runSL) {value = 3}
		display = cleanFn(value)
		if (!Number.isInteger(value)) {
			isErr = true; value = zErr; display = log_error(SECT7, METRIC, zErrType + typeof value)
		}
	} catch(e) {
		isErr = true; value = zErr; display = log_error(SECT7, METRIC, e)
	}
	if (isSmart) {
		let cssvalue = getElementProp(SECT7, "#cssC")
		if (value !== cssvalue && cssvalue !== "x") {
			if (!isErr) {
				display = colorFn(display)
				value = zLIE
				log_known(SECT7, METRIC)
			}
		}
		display += display === 8 ? rfp_green : rfp_red
	}
	exit(value, display)
})

const get_mm_colorgamut = () => new Promise(resolve => {
	const METRIC = "color-gamut"
	function exit(value, display) {
		log_display(7, METRIC, display)
		return resolve([METRIC, value])
	}
	try {
		if (runSE) {foo++}
		let value = zNA, display = value
		let q = "(color-gamut: "
		if (window.matchMedia(q +"srgb)").matches) {value = "srgb"}
		if (window.matchMedia(q +"p3)").matches) {value = "p3"}
		if (window.matchMedia(q +"rec2020)").matches) {value = "rec2020"}
		if (runSL) {value = "p3"}
		display = value
		if (isSmart) {
			let cssvalue = getElementProp(SECT7, "#cssCG")
			if (value !== cssvalue && cssvalue !== "x") {
				display = colorFn(display)
				value = zLIE
				log_known(SECT7, METRIC)
			}
			// FF110+: 1422237
			if (isVer > 109) {
				display += display === "srgb" ? rfp_green : rfp_red
			}
		}
		exit(value, display)
	} catch(e) {
		log_error(SECT7, METRIC, e)
		log_display(7, METRIC, zErr + (isSmart ? rfp_red : ""))
		return resolve([METRIC, zErr])
	}
})

const get_mm_pointer = (group, type, id, rfpvalue) => new Promise(resolve => {
	const METRIC = type
	function exit(value, display) {
		log_display(7, type, display)
		return resolve([METRIC, value])
	}
	let value = zNA, display = value, isErr = false
	try {
		if (runSE) {foo++}
		if (group == 3) {
			if (window.matchMedia("("+ type +":hover)").matches) value = "hover"
			if (window.matchMedia("("+ type +":none)").matches) value = "none"
		} else {
			if (window.matchMedia("("+ type +":fine").matches) {value = "fine" // fine over coarse
			} else if (window.matchMedia("("+ type +":coarse)").matches) {value = "coarse"
			} else if (window.matchMedia("("+ type +":none)").matches) {value = "none"
			}
			if (group == 2) {
				// https://www.w3.org/TR/mediaqueries-4/#any-input
					// "any-pointer, more than one of the values can match" / none = only if the others are not present
				let value2 = zNA
				if (window.matchMedia("("+ type +":coarse").matches) {value2 = "coarse" // coarse over fine
				} else if (window.matchMedia("("+ type +":fine)").matches) {value2 = "fine"
				} else if (window.matchMedia("("+ type +":none)").matches) {value2 = "none"
				}
				value += " + "+ value2
			}
		}
		if (runSL) {value = zNA}
		display = value
	} catch(e) {
		display = log_error(SECT7, METRIC, e)
		isErr = true; value = zErr
	}
	if (isSmart) {
		if (value !== zErr) {
			let cssvalue = getElementProp(SECT7, id)
			if (group == 2 && cssvalue !== "x") {
				let cssvalue2 = getElementProp(SECT7, id, ":before")
				cssvalue = cssvalue2 + cssvalue
			}
			if (value !== cssvalue && cssvalue !== "x") {
				display = colorFn(display)
				value = zLIE
				log_known(SECT7, METRIC)
			}
		}
		// notate: FF74+ 1607316
		if (type == "any-pointer" && isOS !== "android") {
			display += display === "fine + fine" ? rfp_green : rfp_red
		} else if (isOS == "android") {
			display += display === rfpvalue ? rfp_green : rfp_red
		}
	}
	exit(value, display)
})

const get_media_devices = () => new Promise(resolve => {
	// note: 1528042 FF115+
	let t0 = nowFn()
	const METRIC = "mediaDevices"
	let aPlain = [], notation = "", isLies = false

	function set_notation(value) {
		if (isSmart) {
			if (isTB && !isMullvad) { // TB
				return value == "TypeError: navigator.mediaDevices is undefined" ? tb_green : tb_red
			} else { // RFP
				return mini(aPlain) == "5e58c44c" ? rfp_green : (isMullvad ? tb_red : rfp_red)
			}
		}
		return ""
	}

	function exit(result, display, applyColor = true) {
		if (isLies) {
			result = zLIE
			if (applyColor) {display = colorFn(display)}
			log_known(SECT7, METRIC)
		}
		// notate
		notation = set_notation()
		log_display(7, METRIC, display + notation)
		log_perf(SECT7, METRIC, t0)
		return resolve([METRIC, result])
	}

	function analyse(devices) {
		if (runST) {devices = 1}
		if (typeof devices == "object" && Array.isArray(devices)) {
			if (isSmart) {
				let aSplit = (devices +"").split(",")
				for (let i=0; i < aSplit.length; i++) {
					if (aSplit[i] !== "[object MediaDeviceInfo]") {isLies = true}
				}
				if (sData[SECT99].includes("MediaDevices.enumerateDevices")) {isLies = true}
			}
			// enumerate
			let aData = []
			devices.forEach(function(d) {
				if (d.kind !== undefined) {aData.push(d.kind)}
				if (isSmart) {
					if (d.groupId !== undefined) {
						// deviceId
						let chk = d.deviceId
						if (chk.length !== 44) {isLies = true}
						else if (chk.slice(-1) !== "=") {isLies = true}
						// groupId
						chk = d.groupId
						if (chk.length !== 44) {isLies = true}
						else if (chk.slice(-1) !== "=") {isLies = true}
					}
				}
			})
			// count each kind
			if (aData.length) {
				let aDisplay = []
				let map = aData.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
				aData = [...map.entries()]
				// build pretty/plain
				aData.forEach(function(pair) {
					let item = pair[0],
						itemcount = pair[1]
					aPlain.push(item +"; "+ itemcount)
					if (isLies) {item = colorFn(item)}
					aDisplay.push(item + " <span class='s7'>["+ itemcount +"]</span>")
				})
				exit(aPlain.join(" | "), aDisplay.join(" "), false)
			} else {
				isLies = false
				exit("none", "none")
			}
		} else {
			// not an array
			log_display(7, METRIC, log_error(SECT7, METRIC, zErrType + typeof devices) + (isSmart ? rfp_red : ""))
			return resolve([METRIC, zErr])
		}
	}

	if (gRun && isDevices !== undefined) {
		analyse(isDevices)
	} else try {
		if (runSE) {foo++}
		// await devices
		promiseRaceFulfilled({
			promise: navigator.mediaDevices.enumerateDevices(),
			responseType: Array,
			limit: 2000 // increase race limit for slow system/networks
		}).then(function(devices) {
			if (!devices) {
				exit(zErr, log_error(SECT7, METRIC, zErrTime)) // promise failed
				return
			} else {
				analyse(devices)
			}
		})
	} catch(e) {
		notation = set_notation(e)
		log_display(7, METRIC, log_error(SECT7, METRIC, e) + notation)
		return resolve([METRIC, zErr])
	}
})

function get_mimetypes() {
	return new Promise(resolve => {
		// mimeTypes is an expected key
		mimeBS = true
		mimeMini = ""
		try {
			let m = navigator.mimeTypes
			// cleanup
			m = cleanFn(m)
			let isObj = false, isObjFake = true
			if (typeof m === "object") {
				isObj = true
				if (m+"" == "[object MimeTypeArray]") {
					let miniKnown = [] // FF99+ none/hardcoded
					try {
						mimeMini = mini(m)
					} catch(e) {
						// chameleon: TypeError: cyclic object
						log_error(SECT7, "mimeTypes", e)
					}
					if (miniKnown.includes(mimeMini)) {isObjFake = false; mimeBS = false}
				}
			}
			if (isObj) {
				if (m.length) {
					let res = []
					for (let i=0; i < m.length; i++) {
						res.push( m[i].type + (m[i].description == "" ? ": * " : ": "+ m[i].type)
							+ (m[i].suffixes == "" ? ": *" : ": "+ m[i].suffixes))
					}
					res.sort()
					return resolve(res)
				} else {
					if (mimeMini !== "ac6c4fe7") {isObjFake = true; mimeBS = true}
					return resolve(isObjFake ? m : "none") // we already set mimeBS = false on a legit object
				}
			} else {
				return resolve(m)
			}
		} catch(e) {
			log_error(SECT7, "mimeTypes", e)
			return resolve(zErr)
		}
	})
}

function get_plugins() {
	return new Promise(resolve => {
		// plugins is an expected key
		try {
			let p = navigator.plugins
			// cleanup
			p = cleanFn(p)
			let isObj = false, isObjFake = true
			if (typeof p === "object") {
				isObj = true
				if (p+"" === "[object PluginArray]") {
					pluginMini = mini(p)
					if (miniKnown.includes(pluginMini)) {isObjFake = false; pluginBS = false}
				}
			}
			if (isObj) {
				let res = []
				if (p.length) {
					for (let i=0; i < p.length; i++) {
						res.push(p[i].name + (p[i].filename == "" ? ": * " : ": "+ p[i].filename)
							+ (p[i].description == "" ? ": *" : ": "+ p[i].description))
					}
					res.sort()
					return resolve(res)
				} else {
					if (pluginMini !== "ac6c4fe7") {isObjFake = true; pluginBS = true}
					return resolve(isObjFake? p : "none")
				}
			} else {
				return resolve(p)
			}
		} catch(e) {
			log_error(SECT7, "plugins", e)
			return resolve(zErr)
		}
	})
}

function get_plugins_mimetypes() {
	return new Promise(resolve => {
		let t0 = nowFn()

		// FF99+ none/hardcoded
		let knownGood = {
			"plugins": ["ac6c4fe7","012c6754"],
			"mimeTypes": ["ac6c4fe7","4f23f546"],
		}

		Promise.all([
			get_plugins(),
			get_mimetypes(),
		]).then(function(results){


			return resolve()
		})
	})
}

function get_pointer_event() {
	// ToDo: also look at radiusX/Y, screenX/Y, clientX/Y
	/* https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/28535#note_2906361
	RFP
	1 | true |  1 |  mouse |   0 |   0 | 0 | 0 | 0 | 1  c49e3f0d: desktop (no touch/pen)
	1 | true |  5 |  mouse | 0.5 |   0 | 0 | 0 | 0 | 1  098e0d22: mobile touch
	1 | true |  1 |  mouse |   0 |   0 | 0 | 0 | 0 | 1  c49e3f0d: laptop mouse
	1 | true |  1 |  mouse | 0.5 |   0 | 0 | 0 | 0 | 1  098e0d22: laptop touch
	1 | true |  2 |  mouse |   0 |   0 | 0 | 0 | 0 | 1  4b23f9ac: laptop pen
	*/

	if (window.PointerEvent === undefined) {
		dom.ptEvent.innerHTML = "undefined"
		return
	}
	let target = window.document.getElementById("pointertarget")
	target.addEventListener("pointerover", (event) => {
		// get data
		let list = ['height','isPrimary','mozInputSource','pointerType',
			'pressure','tangentialPressure','tiltX','tiltY','twist','width',]
		let listType = ['number','boolean','number','string',
			'number','number','number','number','number','number',]
		let res = []
		for (let i=0; i < list.length; i++) {
			let value = ""
			// ToDo: 1363508: RFP notations, see above
			try {
				if (i == 0) {value = event.height // RFP 1
				} else if (i == 1) {value = event.isPrimary // RFP true
				} else if (i == 2) {value = event.mozInputSource
				} else if (i == 3) {value = event.pointerType // RFP mouse
				} else if (i == 4) {value = event.pressure // RFP: 0 if not active, 0.5 if active
				} else if (i == 5) {value = event.tangentialPressure // RFP 0
				} else if (i == 6) {value = event.tiltX // RFP 0
				} else if (i == 7) {value = event.tiltY // RFP 0
				} else if (i == 8) {value = event.twist // RFP 0
				} else if (i == 9) {value = event.width // RFP 1
				}
			} catch(e) {
				value = e.name
			}
			if (value == "") {
			} else if (value == zU) {value = zUQ
			} else if (value === undefined) {value = zU}
			if (typeof value !== listType[i]) {
				value = zErrType + typeof value
			}
			res.push(value)
		}

		dom.ptEvent.innerHTML = res.join(" | ") + sg +"["+ mini(res) +"]"+ sc
	})
}

const get_speech_engines = () => new Promise(resolve => {
	// media.webspeech.synth.enabled
	const METRIC = "speech_engines"
	let t0 = nowFn()
	function exit(value, display) {
		if (value == zErr || value == "none" || value == zLIE) {addData(7, METRIC, value)}
		if (isSmart) {display += display == "none" ? rfp_green : rfp_red}
		log_display(7, METRIC, display)
		log_perf(SECT7, METRIC, t0)
		return resolve()
	}
	function populateVoiceList() {
		let res = []
		try {
			if (runSE) {foo++}
			let v = speechSynthesis.getVoices()
			v.forEach(function(i){
				res.push(
					i.name +" | " + i.lang + (i.default ? " | default" : "") + (i.localService ? " | localService" : "")	+" | "+ i.voiceURI
				)
			})
			if (runST) {v = []} else if (runSL && isSmart) {sData[SECT99].push("speechSynthesis.getVoices")}
			if ("object" === typeof v && (v+"").slice(0,29) == "[object SpeechSynthesisVoice]") {
				let value = "", btn = ""
				let isLie = isSmart ? sData[SECT99].includes("speechSynthesis.getVoices") : false
				value = mini(res)
				if (isSmart && isLie) {
					addDetail(METRIC, res)
				} else {
					addData(7, METRIC, res, value)
				}
				btn = addButton(7, METRIC, res.length)
				let display = value
				if (isSmart && isLie) {
					value = zLIE
					display = colorFn(display)
					log_known(SECT7, METRIC)
				}
				exit(value, display + btn)
			} else {
				if ("object" === typeof v && v.length == 0) {
					exit("none", "none")
				} else {
					exit(zErr, log_error(SECT7, METRIC, zErrType + typeof v))
				}
			}
		} catch(e) {
			exit(zErr, log_error(SECT7, METRIC, e))
		}
	}
	try {
		populateVoiceList()
	} catch(e) {
		exit(zErr, log_error(SECT7, METRIC, e))
	}
})

function outputDevices() {
	let t0 = nowFn()
	Promise.all([
		get_media_devices(),
		get_speech_engines(),
		get_maxtouch(),
		//get_plugins_mimetypes(),
		get_mm_pointer(1, "pointer","#cssP","coarse"),
		get_mm_pointer(2, "any-pointer","#cssAP","coarse + coarse"),
		get_mm_pointer(3, "hover","#cssH","none"),
		get_mm_pointer(3, "any-hover","#cssAH","none"),
		get_mm_color(),
		get_mm_colorgamut(),
		get_device_integer("pixelDepth","Screen."),
		get_device_integer("colorDepth","Screen."),
		get_device_integer("hardwareConcurrency","Navigator."),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(7, item)})
		log_section(7, t0)
	})
}

countJS(SECT7)
