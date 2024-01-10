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
	const METRIC = "color", METRIC2 = METRIC +"_css"
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
	let cssvalue = getElementProp(SECT7, "#cssC", METRIC2)
	let isErrCss = cssvalue == zErr
	if (isSmart) {
		if (!isErr && !isErrCss) {
			if (value !== cssvalue) {
				display = colorFn(display)
				value = zLIE
				log_known(SECT7, METRIC)
			}
		}
		display += display === 8 ? rfp_green : rfp_red // mm
		log_display(7, METRIC2, (cssvalue === 8 ? rfp_green : rfp_red)) // css
	}
	log_display(7, METRIC, display)
	return resolve([[METRIC, value], [METRIC2, cssvalue]])
})

const get_mm_colorgamut = () => new Promise(resolve => {
	const METRIC = "color-gamut", METRIC2 = METRIC +"_css"
	let value = zNA, display = value, isErr = false
	try {
		if (runSE) {foo++}
		let q = "(color-gamut: "
		if (window.matchMedia(q +"srgb)").matches) {value = "srgb"}
		if (window.matchMedia(q +"p3)").matches) {value = "p3"}
		if (window.matchMedia(q +"rec2020)").matches) {value = "rec2020"}
		if (runSL) {value = "p3"}
		display = value
	} catch(e) {
		isErr = true; value = zErr; display = log_error(SECT7, METRIC, e)
	}
	let cssvalue = getElementProp(SECT7, "#cssCG", METRIC2)
	let isErrCss = cssvalue == zErr
	if (isSmart) {
		if (!isErr && !isErrCss) {
			if (value !== cssvalue) {
				display = colorFn(display)
				value = zLIE
				log_known(SECT7, METRIC)
			}
		}
		// FF110+: 1422237
		display += display === "srgb" ? rfp_green : rfp_red // mm
		log_display(7, METRIC2, (cssvalue === "srgb" ? rfp_green : rfp_red)) // css
	}
	log_display(7, METRIC, display)
	return resolve([[METRIC, value], [METRIC2, cssvalue]])
})

const get_mm_pointer = (group, type, id, rfpvalue) => new Promise(resolve => {
	const METRIC = type, METRIC2 = type +"_css"
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
	let cssvalue = getElementProp(SECT7, id, METRIC2)
	let isErrCss = cssvalue == zErr
	if (isSmart) {
		if (value !== zErr) {
			if (group == 2 && !isErrCss) {
				let cssvalue2 = getElementProp(SECT7, id, METRIC2, ":before")
				cssvalue = cssvalue2 + cssvalue
			}
			if (value !== cssvalue && !isErrCss) {
				display = colorFn(display)
				value = zLIE
				log_known(SECT7, METRIC)
			}
		}
		// notate: FF74+ 1607316
		if (type == "any-pointer" && isOS !== "android") {
			display += display === "fine + fine" ? rfp_green : rfp_red // mm
			log_display(7, METRIC2, (cssvalue === "fine + fine" ? rfp_green : rfp_red)) // css
		} else if (isOS == "android") {
			display += display === rfpvalue ? rfp_green : rfp_red // mm
			log_display(7, METRIC2, (cssvalue === rfpvalue ? rfp_green : rfp_red)) // css
		}
	}
	log_display(7, type, display)
	return resolve([[METRIC, value], [METRIC2, cssvalue]])
})

const get_media_devices = () => new Promise(resolve => {
	let t0 = nowFn(), isLies = false, isLegacy = false
	const METRIC = "mediaDevices"

	function set_notation(value = "") {
		let legacy = isLegacy ? " [gUM legacy]" : ""
		if (isSmart) {
			if (isTB && !isMullvad) { // TB
				return value == "TypeError: navigator.mediaDevices is undefined" ? tb_green : tb_red
			} else { // RFP
				if (isLies) {return (isMullvad ? tb_red : rfp_red)}
				let rfplegacy = "02ab1e4c", rfpnew = "7a2e5d0c"
				if (isMullvad) {
					// tor-browser#42043
					return (value == rfpnew ? tb_green : tb_red) + legacy
				} else {
					// FF: ToDo: 1843434: add version check when flipped
					return ((value == rfplegacy || value == rfpnew) ? rfp_green : rfp_red) + legacy
				}
			}
		}
		return "" + legacy
	}
	function exit(result, display, check = "") {
		log_display(7, METRIC, display + set_notation(check))
		log_perf(SECT7, METRIC, t0)
		return resolve([METRIC, result])
	}

	function analyse(devices) {
		// 1528042: FF115+ media.devices.enumerate.legacy.enabled
		// 1843434: flipped FF119/120?
		// the only difference in device objects is the id length, incl. RFP
		try {
			if (runST) {devices = {}}
			if (typeof devices == "object" && Array.isArray(devices)) {
				// lies
				if (isSmart) {
					if (sData[SECT99].includes("MediaDevices.enumerateDevices")) {isLies = true
					} else if (devices.length) {
						let aSplit = (devices +"").split(",")
						for (let i=0; i < aSplit.length; i++) {
							if (aSplit[i] !== "[object MediaDeviceInfo]") {isLies = true}
						}
					}
				}
				// none
				if (devices.length == 0) {
					if (isLies) {
						log_known(SECT7, METRIC)
						exit(zLIE, colorFn("none"))
					} else {
						exit("none", "none")
					}
				} else {
				// enumerate
					// don't combine kind, keep order, record length not strings
					// checking length of undefined (fake) will catch an error
					if (runSE) {let testSE = (undefined).length}
					let aData = [], sLen = new Set()
					/* new code */
					devices.forEach(function(d) {
						let kind = d.kind, kindtest = kind.length,
							dLen = d.deviceId.length,
							gLen = d.groupId.length
						aData.push([kind, dLen, gLen, d.label.length])
						sLen.add(dLen)
						sLen.add(gLen)
						// isSmart: we could check valid lengths (0 or 44 in 115+, else 44: labels always 0)
							// and if 44 is valid then the last char is "=", and we could check typeof
					})
					// should be a single item, either 44 or 0
					// lets just keep it simple and get the first
					isLegacy = [...sLen][0] !== 0

					let hash = mini(aData)
					if (isLies) {
						hash = colorFn(hash)
						log_known(SECT7, METRIC)
						addDetail(METRIC, aData)
						addData(7, METRIC, zLIE)
					} else {
						addData(7, METRIC, aData, hash)
					}
					log_display(7, METRIC, hash + addButton(7, METRIC, aData.length) + set_notation(hash))
					return resolve()
				}

			} else {
				exit(zErr, log_error(SECT7, METRIC, zErrType + typeof devices))
			}
		} catch(e) {
			exit(zErr, log_error(SECT7, METRIC, e), e)
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
			} else {
				analyse(devices)
			}
		})
	} catch(e) {
		exit(zErr, log_error(SECT7, METRIC, e), e) // promise failed
	}
})

function get_pointer_event(event) {
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

	let oData = {}, oDisplay = []
	let oList = {
		isPrimary: "boolean", // RFP true
		pressure: "number", // RFP: 0 if not active, 0.5 if active
		mozPressure: "number",
		pointerType: "string", // RFP mouse
		mozInputSource: "number", // mouse = 1, pen = 2, touch = 5
		tangentialPressure: "number", // RFP 0
		tiltX: "number", // RFP 0
		tiltY: "number", // RFP 0
		twist: "number", // RFP 0
		width: "number", // RFP 1
		height: "number", // RFP 1
	}
	for (const k of Object.keys(oList).sort()) {
		try {
			let value = event[k],expected = oList[k]
			if (typeof value !== expected) {
				value = zErr // zErrType + typeof value
			}
			value = cleanFn(value)
			oData[k] = value
			oDisplay.push(value)
		} catch(e) {
			oData[k] = e.name
		}
	}
	dom.ptEvent.innerHTML = oDisplay.join(" | ") + sg +"["+ mini(oData) +"]"+ sc
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
		let res = [], ignoreLen, ignoreStr
		/* examples
			"moz-tts:android:hr_HR"
			"urn:moz-tts:sapi:Microsoft David - English (United States)?en-US"
			"urn:moz-tts:osx:com.apple.eloquence.en-US.Eddy"
		*/
		let oIgnore = {
			android: "moz-tts:android:",
			mac: "urn:moz-tts:osx:com.apple.eloquence.",
			windows: "urn:moz-tts:sapi:",
		}
		if (oIgnore[isOS] !== undefined) {
			ignoreLen = oIgnore[isOS].length
			ignoreStr = oIgnore[isOS]
		}
		try {
			if (runSE) {foo++}
			let v = speechSynthesis.getVoices()
			v.forEach(function(i) {
				// reduce redundancy/noise
					// only record default if true and localService if false
					// ignore voiceURI if it matches expected
				let uriStr = i.voiceURI, isURI = true
				if (ignoreStr !== undefined && uriStr.slice(0,ignoreLen) === ignoreStr) {isURI = false}
				res.push(
					i.name +" | " + i.lang + (i.default ? " | default" : "") + (i.localService ? "" : " | false") + (isURI ? " | "+ uriStr : "")
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
		if (speechSynthesis.onvoiceschanged !== undefined) {
			speechSynthesis.onvoiceschanged = populateVoiceList;
		}
	} catch(e) {
		exit(zErr, log_error(SECT7, METRIC, e))
	}
})

const outputDevices = () => new Promise(resolve => {
	let t0 = nowFn()

	const METRIC = "recursion"
	log_display(7, METRIC, isRecursion[0])
	addData(7, METRIC, isRecursion[1])

	Promise.all([
		get_media_devices(),
		get_speech_engines(),
		get_maxtouch(),
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
		return resolve(SECT7)
	})
})

countJS(SECT7)
