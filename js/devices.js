'use strict';

var pluginBS = false
// FF only
var mimeBS = false,
	pluginFlash = false,
	mimeFlash = false

function set_pluginBS() {
	/* https://github.com/abrahamjuliot/creepjs **/
	const testPlugins = (plugins, mimeTypes) => {
		const lies = []
		const ownProperties = Object.getOwnPropertyNames(plugins).filter(name => isNaN(+name))
		const ownPropertiesSet = new Set(ownProperties)
		const mimeTypesDescriptions = new Set(
			[...mimeTypes]
			.map(mime => mime.description)
			.filter(description => description != '') // ignore blank descriptions
		)
		const pluginsList = [...plugins]
			.filter(plugin => plugin.description != '') // ignore blank descriptions
		const mimeTypesDescriptionsString = `${[...mimeTypesDescriptions].join(', ')}`
		const validPluginList = pluginsList.filter(plugin => {
			try {
				return plugin[0].description
			} catch (error) {
				return undefined // sign of tampering
			}
		})

		/* comment out: blink 94+ changes
		// Expect MimeType Plugins to match Plugins
		try {
			// Chameleon: spoof media devices causes this error
				// Uncaught TypeError: 'get enabledPlugin' called on an object that does not implement interface MimeType.
			const mimeTypePluginNames = '' + [
				...new Set([...mimeTypes].map(mimeType => mimeType.enabledPlugin.name))
			].sort()
			const rawPluginNames = '' + [
				...new Set([...plugins].map(plugin => plugin.name))
			].sort()
			if (mimeTypePluginNames != rawPluginNames) {lies.push("A")}
		} catch(e) {}
		*/

		// Expect MimeType object in plugins
		const invalidPluginList = pluginsList.filter(plugin => {
			try {
				return !plugin[0].description
			} catch (error) {
				return true // sign of tampering
			}
		})
		if (!!invalidPluginList.length) {lies.push("B")}

		// Expect plugin MimeType description to match plugin description
		const nonMatchingMimetypePlugins = validPluginList
			.filter(plugin => plugin[0].description != plugin.description)
			.map(plugin => [plugin.description, plugin[0].description])
		if (!!nonMatchingMimetypePlugins.length) {lies.push("C")}

		// Expect plugin MimeType description to match a MimeType description
		const invalidPrototypeMimeTypePlugins = validPluginList
			.filter(plugin => !mimeTypesDescriptions.has(plugin[0].description))
			.map(plugin => [plugin[0].description, mimeTypesDescriptionsString])
		if (!!invalidPrototypeMimeTypePlugins.length) {lies.push("D")}

		// Expect plugin description to match a MimeType description
		const invalidMimetypePlugins = validPluginList
			.filter(plugin => !mimeTypesDescriptions.has(plugin.description))
			.map(plugin => [plugin.description, mimeTypesDescriptionsString])
		if (!!invalidMimetypePlugins.length) {lies.push("E")}

		/* comment out: blink 94+ changes
		// Expect plugin name to be in plugins own properties
		pluginsList.forEach(plugin => {
			const {
				name
			} = plugin
			if (!ownPropertiesSet.has(name)) {lies.push("F")}
		})
		*/
		return lies
	}
	const pluginLies = testPlugins(navigator.plugins, navigator.mimeTypes)

	if (pluginLies.length) {pluginBS = true} else {pluginBS = false}
	if (runSL) {pluginBS = true}
}

function get_gamepads() {
	return new Promise(resolve => {
		let r = (check_navKey("getGamepads") ? "enabled" : "disabled")
		dom.gamepads.innerHTML = r
		return resolve("gamepads:"+ r)
	})
}

function get_concurrency() {
	let h = zD
	if (check_navKey("hardwareConcurrency")) {
		try {
			h = navigator.hardwareConcurrency
			h = (h == undefined ? zB0 : h)
		} catch(e) {h = zB0}
	} else {h = zD}
	let isLies = (isBraveMode.substring(0,2) == "st" ? true: false)
	if (proxyLies.includes("Navigator.hardwareConcurrency")) {isLies = true}
	if (runSL) {isLies = true; h = Math.floor((Math.random() * 33) + 1)}
	if (isLies) {
		dom.nHWC.innerHTML = soL + h + scC
		if (gRun) {gKnown.push("devices:hardwareConcurrency")}
	} else {
		dom.nHWC.innerHTML = h + (h == "2" ? rfp_green : rfp_red)
	}
	return "hardwareConcurrency:"+ (isLies ? zLIE : h)
}

function get_keyboard() {
	if (isFF) {
		dom.nKeyboard = zNA
		return "keyboard:"+ zNA
	}
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		try {
			let sName = "devices_keyboard", resE = []
			sDetail[sName] = []
			let resK = navigator.keyboard
			if (resK == undefined) {
				r = zU
			} else {
				let keys = []
				// https://wicg.github.io/keyboard-map/
				// https://www.w3.org/TR/uievents-code/#key-alphanumeric-writing-system
				let listK = ['Backquote','Backslash','Backspace','BracketLeft','BracketRight','Comma',
					'Digit0','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9',
					'Equal','IntlBackslash','IntlRo','IntlYen','KeyA','KeyB','KeyC','KeyD','KeyE','KeyF','KeyG',
					'KeyH','KeyI','KeyJ','KeyK','KeyL','KeyM','KeyN','KeyO','KeyP','KeyQ','KeyR','KeyS','KeyT',
					'KeyU','KeyV','KeyW','KeyX','KeyY','KeyZ','Minus','Period','Quote','Semicolon','Slash']
				resK.getLayoutMap().then(keyboardLayoutMap => {
					listK.forEach(function(key) {
						try {
							keys.push(key +": "+ keyboardLayoutMap.get(key))
						} catch(e) {
							if (e.name === undefined) {resE.push(zErr)} else {resE.push(e.name +": "+ e.message)}
						}
					})
					if (resE.length > 0) {
						log_error("devices: keyboard", resE[0])
						dom.nKeyboard = trim_error(resE[0])
						return resolve("keyboard:" + zB0)
					} else {
						let hash = sha1(keys.join(), "devices keyboard")
						sDetail[sName] = keys
						dom.nKeyboard.innerHTML = hash + buildButton("7", sName, "details")
						log_perf("keyboard [devices]",t0)
						return resolve("keyboard:" + hash)
					}
				})
			}
		} catch(e) {
			log_error("devices: keyboard", e.name, e.message)
			dom.nKeyboard = (e.name === undefined ? zErr : trim_error(e.name, e.message))
			return resolve("keyboard:"+ zB0)
		}
	})
}

function get_media_devices() {
	let devicesBS = false
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}

		function finish(result) {
			// lies
			if (gRun) {
				if (devicesBS) {gKnown.push("devices:media")}
			}
			log_perf("media devices [devices]",t0)
			if (devicesBS) {result = zLIE}
			return resolve("media_devices:"+ result)
		}

		// not supoprted
		if (check_navKey("mediaDevices") == false) {
			dom.eMD.innerHTML = zD + (isTB ? tb_green : rfp_red)
			finish(zD)
		} else {
			// else try enumerateDevices
			let str=""
			try {
				// await devices
				let limit = 1000
				promiseRaceFulfilled({
					promise: navigator.mediaDevices.enumerateDevices(),
					responseType: Array,
					limit: 2000 // increase race limit for slow system/networks
				}).then(function(devices) {
					// handle if devices was rejected or not fulfilled
					if (!devices) {
						// custom error
						let e = { name: 'promise failed', message: `blocked or failed to fulfill in ${limit}ms` }
						dom.eMD.innerHTML = e.name
						finish(e.name)
						return
					}
					// compute devices output
					let arr = []
					// enumerate
					devices.forEach(function(d) {
						arr.push(d.kind)
						// FF sanity check
						if (isFF) {
							// FF67+ groupId
							if (isVer > 66 && d.groupId.length == 0) {devicesBS = true}
							if (isVer < 67 && d.groupId.length > 0) {devicesBS = true}
							// deviceId
							let chk = d.deviceId
							if (chk.length !== 44) {devicesBS = true}
							else if (chk.slice(-1) !== "=") {devicesBS = true}
							// groupId
							if (isVer > 66) {
								chk = d.groupId
								//console.log("group", chk.length, chk.slice(-1), chk)
								if (chk.length !== 44) {devicesBS = true}
								else if (chk.slice(-1) !== "=") {devicesBS = true}
							}
						}
					})
					// prototypelies
					if (proxyLies.includes("MediaDevices.enumerateDevices")) {devicesBS = true}
					// count each kind
					let pretty = [], plain = [], rfphash = ""
					if (arr.length) {
						arr.sort()
						let map = arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
						arr = [...map.entries()]
						// build pretty/plain
						for (let i=0; i < arr.length; i++) {
							let data = arr[i],
								item = data[0],
								itemcount = data[1]
							plain.push(item +","+ itemcount)
							if (devicesBS) {item = soL + item + scC}
							pretty.push(item + s7 +"["+ itemcount +"]"+ sc)
						}
						pretty = pretty.join(" ")
						str = plain.join(";")
						rfphash = sha1(str, "devices media devices")
					} else {
						pretty = "none"
						if (devicesBS) {pretty = soL +"none"+ scC}
					}
					// RFP
					if (rfphash == "6812ba88a8eb69ed8fd02cfaecf7431b9c3d9229") {
						dom.eMD.innerHTML = pretty + (isTB ? tb_red : rfp_green)
					} else {
						dom.eMD.innerHTML = pretty + (isTB ? tb_red : rfp_red)
					}
					finish(str)
				})
			} catch(e) {
				dom.eMD.innerHTML = zB0 + (isTB ? tb_red : rfp_red)
				finish(zB0)
			}
		}
	})
}

function get_mimetypes() {
	return new Promise(resolve => {
		if (check_navKey("mimeTypes")) {
			let res = []
			if (runSL) {
				res = ["application/x-futuresplash: application/x-futuresplash: spl",
					"application/x-shockwave-flash: application/x-shockwave-flash: swf"]
				mimeBS = true
			}
			try {
				let m = navigator.mimeTypes
				if (m.length || res.length) {
					if (!runSL) {
						for (let i=0; i < m.length; i++) {
							res.push( m[i].type + (m[i].description == "" ? ": * " : ": "+ m[i].type)
								+ (m[i].suffixes == "" ? ": *" : ": "+ m[i].suffixes) )
						}
					}
					res.sort()
					// FF: mimeBS
					if (isFF) {
						// reset
						mimeBS = false
						mimeFlash = false
						if (isVer > 84 && res.length) {
							// FF85+: EOL Flash
							mimeBS = true
						} else {
							if (res.length == 2) {
									// example windows 64bit FF both 32/64bit
										// application/x-futuresplash: application/x-futuresplash: spl
										// application/x-shockwave-flash: application/x-shockwave-flash: swf
									let mime1 = res[0].split(":")[0]
									let mime2 = res[1].split(":")[0]
									if (mime1 == "application/x-futuresplash" && mime2 == "application/x-shockwave-flash") {
										mimeFlash = true
									} else {
										mimeBS = true
									}
							} else {
								mimeBS = true
							}
						}
					}
					return resolve(res)
				} else {
					return resolve("none")
				}
			} catch(e) {
				return resolve(zB0)
			}
		} else {
			return resolve(zD)
		}
	})
}

function get_mimetypes_plugins() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		// reset
		let sName = "devices_mimetypes"
		sDetail[sName] = []
		sDetail[sName +"_fake_skip"] = []
		sName = "devices_plugins"
		sDetail[sName] = []
		sDetail[sName +"_fake_skip"] = []

		// promise
		Promise.all([
			get_plugins(),
			get_mimetypes(),
		]).then(function(results){
			let outputP = results[0]
			let outputM = results[1]
			// FF: check Flash in both
			if (isFF) {
				if (pluginFlash == true && mimeFlash == false) {pluginBS = true}
				if (pluginFlash == false && mimeFlash == true) {mimeBS = true}
			}
			
			// plugins
			let btnP = "", pValue = outputP
			if (Array.isArray(outputP)) {
				if (pluginBS) {sName += "_fake_skip"}
				sDetail[sName] = outputP
				btnP = buildButton("7", sName, outputP.length +" plugin"+ (outputP.length > 1 ? "s" : ""))
				outputP = sha1(outputP.join(), "devices plugins")
				pValue = outputP
			}
			if (pluginBS) {
				pValue = zLIE
				outputP = (isVer > 84 ? soB : soL) + outputP + scC
				dom.plugins.innerHTML = outputP + btnP
			} else {
				dom.plugins.innerHTML = outputP + btnP + (outputP == "none" ? rfp_green : rfp_red)
			}
			// mimeTypes
			let btnM = "", mValue = outputM
			sName = "devices_mimetypes"
			if (Array.isArray(outputM)) {
				if (mimeBS) {sName += "_fake_skip"}
				sDetail[sName] = outputM
				btnM = buildButton("7", sName, outputM.length +" mimetype"+ (outputM.length > 1 ? "s" : ""))
				outputM = sha1(outputM.join(), "devices mimetypes")
			}
			if (mimeBS) {
				mValue = zLIE
				outputM = (isVer > 84 ? soB : soL) + outputM + scC
				dom.mimeTypes.innerHTML = outputM + btnM
			} else {
				dom.mimeTypes.innerHTML = outputM + btnM + (outputM == "none" ? rfp_green : rfp_red)
			}
			log_perf("mimetypes/plugins [devices]",t0)
			// bypassed FF lies: Flash died in FF85
			if (isVer > 84) {
				if (results[0] !== "none") {
					pValue = "none"
					if (gRun) {gBypassed.push("devices:plugins:none")}
				}
				if (results[1] !== "none") {
					mValue = "none"
					if (gRun) {gBypassed.push("devices:mimeTypes:none")}
				}
			}
			return resolve(["plugins:"+ pValue, "mimeTypes:"+ mValue])
		})
	})
}

function get_plugins() {
	return new Promise(resolve => {
		if (check_navKey("plugins")) {
			let res = []
			if (runSL) {res = ["made up BS","more BS"]}
			try {
				let p = navigator.plugins
				if (p.length || res.length) {
					if (!runSL) {
						for (let i=0; i < p.length; i++) {
							res.push(p[i].name + (p[i].filename == "" ? ": * " : ": "+ p[i].filename)
								+ (p[i].description == "" ? ": *" : ": "+ p[i].description))
						}
					}
					res.sort()
					// FF
					if (isFF) {
						// reset
						pluginBS = false
						pluginFlash = false
						if (isVer > 84 && res.length) {
							// FF85+: EOL Flash
							pluginBS = true
						} else if (res.length > 1) {
							// FF52+: Flash only
							pluginBS = true
						} else {
							// one item
							if (res[0].split(":")[0] !== "Shockwave Flash") {
								pluginBS = true
							} else {
								pluginFlash = true
							}
						}
					}
					return resolve(res)
				} else {
					return resolve("none")
				}
			} catch(e) {
				return resolve(zB0)
			}
		} else {
			return resolve(zD)
		}
	})
}

function get_pointer_event() {
	// note: FF87 or lower: dom.w3c_pointer_events.enabled = false
	if (window.PointerEvent == "undefined") {
		dom.ptEvent.innerHTML = zNS
		return
	} else if (isTB && isVer < 87) {
		dom.ptEvent.innerHTML = "n/a" + tb_green
		// do not return because prefs can be changed
	}
	let target = window.document.getElementById("pointertarget")
	target.addEventListener("pointerover", (event) => {
		// get data
		let list = ['height','isPrimary','mozInputSource','pointerType',
			'pressure','tangentialPressure','tiltX','tiltY','twist','width',]
		let res = []
		for (let i=0; i < list.length; i++) {
			let value = ""
			try {
				if (i == 0) {value = event.height
				} else if (i == 1) {value = event.isPrimary
				} else if (i == 2) {value = event.mozInputSource
				} else if (i == 3) {value = event.pointerType
				} else if (i == 4) {value = event.pressure
				} else if (i == 5) {value = event.tangentialPressure
				} else if (i == 6) {value = event.tiltX
				} else if (i == 7) {value = event.tiltY
				} else if (i == 8) {value = event.twist
				} else if (i == 9) {value = event.width
				}
			} catch(e) {
				value = e.name
			}
			if (value == "") {
			} else if (value == "undefined") {value = "undefined string"
			} else if (value == undefined) {value = "undefined"
			} else if (value == null) {value = null}
			res.push(value)
		}
		let notation = ""
		if (isTB && isVer < 87) {notation = tb_red}
		// ToDo: RFP notation
		dom.ptEvent.innerHTML = res.join(" | ") + notation
	})
}

function get_pointer_hover() {
	return new Promise(resolve => {
		function get_mm(type, id) {
			let x=zNS, x2="", f="fine", c="coarse", h="hover", n="none", q=type+": "
			try {
				if (window.matchMedia("("+ q + n +")").matches) x=n
				if (window.matchMedia("("+ q + c +")").matches) x=c
				if (window.matchMedia("("+ q + f +")").matches) x=f
				if (window.matchMedia("("+ q + h +")").matches) x=h
			} catch(e) {x = zB0}
			x2 = getElementProp(id,"content",":after")
			// lies
			if (runSL) {x = "banana"}
			if (x2 !== "x") {
				if (x !== x2) {
					display.push(soB + x + scC)
					if (type.indexOf("oint") > 0) {pointerBS = true}
					if (type.indexOf("over") > 0) {hoverBS = true}
					if (gRun) {
						gKnown.push("devices:"+ type)
						gBypassed.push("devices:"+ q.trim() + x2)
					}
					x = x2
				} else {
					display.push(x)
				}
			} else {
				display.push(x)
			}
			// record bypass
			res.push(q.trim() + x)
		}

		let res = [], display = [], pointerBS = false, hoverBS = false
		// pointer event
		let r1 = (window.PointerEvent == "undefined" ? zD : zE)
		dom.pointer = r1
		res.push("pointer_event:"+ r1)
		// pointer
		get_mm("pointer", "#cssP")
		get_mm("any-pointer", "#cssAP")
		let p = display.join(" | ")
		// hover
		display = []
		get_mm("hover", "#cssH")
		get_mm("any-hover", "#cssAH")
		let h = display.join(" | ")
		// notate
		if (isVer > 73 && isOS == "android") {
			// FF74+: 1607316
			if (!pointerBS) {p += (p == "coarse | coarse" ? rfp_green : rfp_red)}
			if (!hoverBS) {h += (h == "none | none" ? rfp_green : rfp_red)}
		} else if (isVer > 63) {
			// FF64+
			if (!pointerBS) {p += (p == "fine | fine" ? rfp_green : rfp_red)}
			if (!hoverBS) {h += (h == "hover | hover" ? rfp_green : rfp_red)}
		}
		// display
		dom.mmP.innerHTML = p
		dom.mmH.innerHTML = h
		return resolve(res)
	})
}

function get_speech_engines() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let sName = "devices_speech_engines"
		sDetail[sName] = []

		// output & resolve
		function display(output) {
			let btn = ""
			if (Array.isArray(output)) {
				sDetail[sName] = output
				btn = buildButton("7", sName, output.length +" engine"+ (output.length > 1 ? "s" : ""))
				output = sha1(output.join(), "devices speech engines")
			}
			dom.sEngines.innerHTML = output + btn + (output == "none" ? rfp_green : rfp_red)
			log_perf("speech engines [devices]",t0)
			return resolve("speech_engines:"+ output)
		}

		if ("speechSynthesis" in window) {
			function populateVoiceList() {
				let res = []
				try {
					if(typeof speechSynthesis == "undefined") {
						return
					} else {
						let v = speechSynthesis.getVoices()
						for (let i=0; i < v.length; i++) {
							res.push(v[i].name +" ("+ v[i].lang +")"+ (v[i].default ? " : default" : ""))
						}
						if (res.length == 0) {
							display("none")
						} else {
							res.sort()
							display(res)
						}
					}
				} catch(e) {
					display(zB0)
				}
			}
			try {
				if (speechSynthesis.onvoiceschanged !== undefined) {
					populateVoiceList()
					if (typeof speechSynthesis !== "undefined") {
						speechSynthesis.onvoiceschanged = populateVoiceList
					}
				} else {
					display(zB0)
				}
			} catch(e) {
				display(zB0)
			}
		} else {
			display(zD)
		}
	})
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
		dom.sRec = zD +" [or "+ zNS +"]"
	}
}

function get_touch() {
	// vars
	let m = zNS, p = zNS, t = false, q="(-moz-touch-enabled:"
	// m
	try {
		if (window.matchMedia(q +"0)").matches) {m=0}
		if (window.matchMedia(q +"1)").matches) {m=1}
	} catch(e) {m = zB0}
	// t
	try {document.createEvent("TouchEvent"); t = true} catch(e) {}
	let t2 = ("ontouchstart" in window)
	let t3 = ("ontouchend" in window)
	// p
	if (check_navKey("maxTouchPoints")) {
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
	return new Promise(resolve => {
		let r = check_navKey("getVRDisplays") + check_navKey("activeVRDisplays")
		r = (r == 2 ? "enabled" : "disabled")
		dom.vrdisplays.innerHTML = r
		return resolve("vr:"+ r)
	})
}

function outputDevices() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = []

	// FF returns Flash as a false positive
	if (!isFF) {
		set_pluginBS()
	}

	//ToDo: promisify and add to section hash
	get_speech_rec()

	Promise.all([
		get_media_devices(),
		get_speech_engines(),
		get_pointer_hover(),
		get_gamepads(),
		get_touch(),
		get_vr(),
		get_keyboard(),
		get_concurrency(),
		get_mimetypes_plugins(),
	]).then(function(results){
		results.forEach(function(currentResult) {
			if (Array.isArray(currentResult)) {
				currentResult.forEach(function(item) {
					section.push(item)
				})
			} else {
				section.push(currentResult)
			}
		})
		// lies
		if (gRun) {
			if (pluginBS) {gKnown.push("devices:plugins")}
			if (mimeBS) {gKnown.push("devices:mimeTypes")}
			if (isBraveMode.substring(0,2) == "st") {gKnown.push("devices:hardwareConcurrency")}
		}
		// section
		log_section("devices", t0, section)
	})
}

countJS("devices")
