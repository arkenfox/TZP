'use strict';

let pluginBS = false,
	mimeBS = false

let runPM = false,
	simPM = 0,
	runPP = false,
	simPP = 0

function set_pluginBS() {
	/* https://github.com/abrahamjuliot/creepjs */
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
}

function get_gamepads() {
	return new Promise(resolve => {
		let r = (check_navKey("getGamepads") ? zE : zD)
		dom.gamepads.innerHTML = r
		return resolve("gamepads:"+ r)
	})
}

function get_concurrency() {
	// gecko stuff
		// 1630089: FF68+ macOS reports physical cores instead of logical
		// capped at dom.maxHardwareConcurrency (e.g. 1728741)
	function clean(item) {
		if (!isNaN(item)) {return item
		} else {if (item == "") {item = "empty string"}; item += ""; return item}
	}

	let h = zD
	if (check_navKey("hardwareConcurrency")) {
		try {
			h = navigator.hardwareConcurrency
			h = (h == undefined ? zB0 : h)
		} catch(e) {
			log_error("devices: hardwareConcurrency", e.name, e.message)
			h = zB0
		}
	} else {
		h = zD
	}

	let isLies = (isBraveMode > 1 ? true: false)
	if (isNaN(h)) {isLies = true
	} else if (proxyLies.includes("Navigator.hardwareConcurrency")) {isLies = true}
	if (runSL) {isLies = true; h = Math.floor((Math.random() * 33) + 1)}
	if (isLies && h !== zB0) {
		dom.nHWC.innerHTML = soL + h + scC + rfp_red
		if (gRun) {gKnown.push("devices:hardwareConcurrency")}
	} else {
		dom.nHWC.innerHTML = h + (h == "2" ? rfp_green : rfp_red)
	}
	return "hardwareConcurrency:"+ (isLies ? zLIE : h)
}

function get_keyboard() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		// reset
		let sName = "devices_keyboard"
		sDetail[sName] = []
		sDetail[sName +"_fake_skip"] = []

		function color(string) {
			string = (isFF? soB : soL) + string + scC
			value = (isFF ? zNA : zLIE)
			if (gRun) {
				gKnown.push("devices:keyboard")
				if (isFF) {gBypassed.push("devices:keyboard:"+ value)}
			}
			return string
		}

		let display = "", value = "", isObj = false, isObjFake = true
		try {
			let k = navigator.keyboard
			// cleanup test
			if (k == "undefined") {k = "undefined string"
			} else if (k == undefined || k == true || k == false || k == null) {k += ""
			} else if (Array.isArray(k)) {k = "array"}
			if (k == "") {k = "empty string"}
			if (typeof k === "object") {
				isObj = true
				if (k+"" == "[object Keyboard]") {isObjFake = false}
			}
			if (isObj) {
				let keys = []
				// https://wicg.github.io/keyboard-map/
				// https://www.w3.org/TR/uievents-code/#key-alphanumeric-writing-system
				let listK = ['Backquote','Backslash','Backspace','BracketLeft','BracketRight','Comma',
					'Digit0','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9',
					'Equal','IntlBackslash','IntlRo','IntlYen','KeyA','KeyB','KeyC','KeyD','KeyE','KeyF','KeyG',
					'KeyH','KeyI','KeyJ','KeyK','KeyL','KeyM','KeyN','KeyO','KeyP','KeyQ','KeyR','KeyS','KeyT',
					'KeyU','KeyV','KeyW','KeyX','KeyY','KeyZ','Minus','Period','Quote','Semicolon','Slash']
				let resE = []
				k.getLayoutMap().then(keyboardLayoutMap => {
					listK.forEach(function(key) {
						try {
							keys.push(key +": "+ keyboardLayoutMap.get(key))
						} catch(e) {
							if (e.name === undefined) {resE.push(zErr)} else {resE.push(e.name +": "+ e.message)}
						}
					})
					if (resE.length > 0) {
						log_error("devices: keyboard", resE[0])
						display = trim_error(resE[0])
						if (isFF) {display = color(display)}
						dom.nKeyboard.innerHTML = display
						return resolve("keyboard:"+ (isFF ? zNA : zB0))
					} else {
						display = sha1(keys.join(), "devices keyboard")
						if (isObjFake) {
							sName += "_fake_skip"
							display = color(display)
						}
						sDetail[sName] = keys
						dom.nKeyboard.innerHTML = display + buildButton("7", sName)
						log_perf("keyboard [devices]",t0)
						return resolve("keyboard:" + (isObjFake ? value : display))
					}
				})
			} else {
				value = k
				display = k
				if (k == "undefined" & isFF) {display = zNA; value = zNA} else {display = color(display)}
				dom.nKeyboard.innerHTML = display
				return resolve("keyboard:"+ value)
			}
		} catch(e) {
			log_error("devices: keyboard", e.name, e.message)
			display = (e.name === undefined ? zErr : trim_error(e.name, e.message))
			if (isFF) {display = color(display)}
			dom.nKeyboard.innerHTML = display
			return resolve("keyboard:"+ (isFF ? zNA : zB0))
		}
	})
}

function get_media_devices() {
	let devicesBS = false
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let extra = ""
		if (gLoad) {extra = (canPerf ? Math.round(performance.now()) : "")}
		log_perf("-- start md section -- ","n/a",gt0,extra)

		function finish(result) {
			// lies
			if (gRun) {
				if (devicesBS) {gKnown.push("devices:media")}
			}
			extra = ""
			if (gLoad) {extra = (canPerf ? Math.round(performance.now()) : "")}
			log_perf("media devices [devices]",t0,gt0, extra)
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

					let isObj = false, isObjFake = true
					if (typeof devices !== "object") {
						devicesBS = true
					} else {
						try {
							console.debug(devices)
							console.debug(devices+"")
							console.debug(devices[0]+"")
						} catch(e) {
							console.debug(e.name, e.message)
						}
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
						pretty = "none";
console.debug("I am groot", "~"+str+"~")
						str = "none"
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
				log_error("devices: media devices", e.name, e.message)
				let display = (e.name === undefined ? zErr : trim_error(e.name, e.message))
				dom.eMD.innerHTML = display + (isTB ? tb_red : rfp_red)
				finish(zB0)
			}
		}
	})
}

function get_mimetypes() {
	return new Promise(resolve => {
		// mimeTypes is an expected key
		mimeBS = true
		try {
			let m = navigator.mimeTypes
			if (runPM) {
				console.debug("SIM #" + simPM + " mimeTypes")
				if (simPM == 0) {m = undefined}
				if (simPM == 1) {m = {}}
				if (simPM == 2) {m = null}
				if (simPM == 3) {m = zB0; mimeBS = false; simPM++; return resolve(m)}
				if (simPM == 4) {m = "i am groot"}
				if (simPM == 5) {}
				simPM++
				simPM = simPM % 6
			}
			// cleanup
			if (m == "undefined") {m = "undefined string"
			} else if (m == undefined || m == true || m == false || m == null) {m += ""
			} else if (Array.isArray(m)) {m = "array"}
			if (m == "") {m = "empty string"}
			let isObj = false, isObjFake = true
			if (typeof m === "object") {
				isObj = true
				if (m+"" == "[object MimeTypeArray]") {isObjFake = false; mimeBS = false} // !mimeBS only with a legit object
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
					return resolve(isObjFake ? m : "none")
				}
			} else {
				return resolve(m)
			}
		} catch(e) {
			mimeBS = false // don't color blocks
			log_error("devices: mimeTypes", e.name, e.message)
			return resolve(zB0)
		}
	})
}

function get_plugins() {
	return new Promise(resolve => {
		// plugins is an expected key
		// pluginBS is already set for non-FF
		if (isFF) {pluginBS = true}
		try {
			let p = navigator.plugins
			if (runPP) {
				console.debug("SIM #" + simPP + " plugins")
				if (simPP == 0) {p = zB0; pluginBS = false; simPP++; output(zB0); return}
				if (simPP == 1) {}
				if (simPP == 2) {p = null}
				if (simPP == 3) {p = undefined}
				if (simPP == 4) {p = {}}
				simPP++
				simPP = simPP % 5
			}
			// cleanup
			if (p == "undefined") {p = "undefined string"
			} else if (p == undefined || p == true || p == false || p == null) {p += ""
			} else if (Array.isArray(p)) {p = "array"}
			if (p == "") {p = "empty string"}
			let isObj = false, isObjFake = true
			if (typeof p === "object") {
				isObj = true
				if (p+"" == "[object PluginArray]") {isObjFake = false; if (isFF) {pluginBS = false}}
			}
			if (isObj) {
				let res = []
				if (p.length || res.length) {
					for (let i=0; i < p.length; i++) {
						res.push(p[i].name + (p[i].filename == "" ? ": * " : ": "+ p[i].filename)
							+ (p[i].description == "" ? ": *" : ": "+ p[i].description))
					}
					res.sort()
					return resolve(res)
				} else {
					return resolve(isObjFake? p : "none")
				}
			} else {
				return resolve(p)
			}
		} catch(e) {
			if (isFF) {pluginBS = false} // don't color blocks
			log_error("devices: plugins", e.name, e.message)
			return resolve(zB0)
		}
	})
}

function get_plugins_mimetypes() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		// reset
		let sName = "devices_mimeTypes"
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
			function output(type) {
				let btn = "", fpValue
				let value = type == "plugins" ? results[0] : results[1]
				let isLies = type == "plugins" ? pluginBS : mimeBS
				let el = type == "plugins" ? dom.plugins : dom.mimeTypes
				sName = "devices_"+ type
				if (Array.isArray(value)) {
					if (isLies) {sName += "_fake_skip"}
					sDetail[sName] = value
					btn = buildButton("7", sName, value.length +" "+ type + (value.length > 1 ? "s" : ""))
					value = sha1(value.join(), "devices "+ type)
				}
				fpValue = value
				// isBypass
				let isBypass = (isVer > 84 && value !== "none" ? true : false) // FF85+ EOL Flash
				if (isRFP && isLies || isRFP && value == zB0) {isBypass = true}
				if (isBypass) {isLies = true}
				if (isFF) {
					if (isLies || value == zB0) {
						// FF84- we can also bypass if the other one is "none" which we only get on legit objects
						// not sure about other engines: chromium should alway have items AFAIK
						let otherValue = type == "plugins" ? results[1] : results[0]
						if (otherValue == "none") {isBypass = true; isLies = true}
					}
				}
				// display
				if (isLies) {
					value = (isBypass ? soB : soL) + value + scC + rfp_red
					el.innerHTML = value + btn
					fpValue = isBypass ? "none" : zLIE
					if (gRun || runPM || runPP) {
						gKnown.push("devices:"+ type)
						if (isBypass) {gBypassed.push("devices:"+ type +":none")}
						if (runPM || runPP) {console.debug(type+ ": recorded lie" + (isBypass ? " + bypass" : ""), " | value: "+ fpValue)}
					}
				} else {
					el.innerHTML = value + btn + (value == "none" ? rfp_green : rfp_red)
				}
				return fpValue
			}
			let pValue = output("plugins")
			let mValue = output("mimeTypes")
			log_perf("mimetypes/plugins [devices]",t0)
			return resolve(["plugins:"+ pValue, "mimeTypes:"+ mValue])
		})
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
			} catch(e) {
				log_error("devices: matchmedia_"+ type, e.name, e.message)
				x = zB0
			}
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
					log_error("devices: speech engines", e.name, e.message)
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
				log_error("devices: speech engines", e.name, e.message)
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
	return new Promise(resolve => {
		try {
			let recognition = new SpeechRecognition()
			dom.sRec = zE
			return resolve("speech_recogniton:" + zE)
		} catch(e) {
			log_error("devices: speech recognition", e.name, e.message)
			// undefined
			// ToDo: speechRec: detect disabled vs not-supported?
			dom.sRec = zD +" [or "+ zNS +"]"
			return resolve("speech_recogniton:" + zD)
		}
	})
}

function get_touch() {
	function clean(item) {
		if (!isNaN(item)) {return item
		} else {if (item == "") {item = "empty string"}; item += ""; return item}
	}
	// maxTouchPoints
	let MTP, displayMTP, fpMTP, maxBS = false, maxBypass = false
	try {
		MTP = clean(navigator.maxTouchPoints)
	} catch(e) {
		log_error("devices: maxtouchpoints", e.name, e.message)
		MTP = zB0
	}
	// ontouchstart/ontouchend/TouchEvent
		// dom.w3c_touch_events.enabled: 0=disabled (macOS) 1=enabled 2=autodetect (linux/win/android)
		// autodetection is currently only supported on Windows and GTK3 (and assumed on Android)
		// on touch devices: 0 (all false) 1 or 2 (all true)
		// on non-touch devices = no change (all false)
	let touchRes = []
	try {
		if ("ontouchstart" in window) {toucRes.push(true)} else {touchRes.push(false)}
	} catch(e) {
		log_error("devices: ontouchstart", e.name, e.message)
		touchRes.push(zB0)
	}
	try {
		if ("ontouchend" in window) {touchRes.push(true)} else {touchRes.push(false)}
	} catch(e) {
		log_error("devices: ontouchend", e.name, e.message)
		touchRes.push(zB0)
	}
	try {
		document.createEvent("TouchEvent")
		touchRes.push(true)
	} catch(e) {
		log_error("devices: touch touchevent", e.name, e.message)
		touchRes.push(e.name == "NotSupportedError" ? false : zB0)
	}
	// is touch all the same
	let touchSum = touchRes[0] + touchRes[1] + touchRes[2], touchBS = false
	if (touchSum !== 0 && touchSum !== 3) {touchBS = true}

	// MTP: BS & Bypasses
	displayMTP = MTP
	fpMTP = MTP
	if (isNaN(MTP) && MTP !== zB0) {maxBS = true // don't color blocks
	} else if (MTP < 0) {maxBS = true
	} else if (proxyLies.includes("Navigator.maxTouchPoints")) {maxBS = true}
	if (maxBS || MTP == zB0) {
		if (touchSum == 0 && MTP !== 0) {maxBypass = true; fpMTP = 0} // touch is 3xfalse
		if (maxBypass) {
			displayMTP = soB + MTP + scC
		} else {
			displayMTP = (MTP !== zB0 ? soL + MTP + scC: MTP)
			if (maxBS) {fpMTP = zLIE}
		}
		if (gRun) {
			gKnown.push("devices:maxtouchpoints")
			if (maxBypass) {gBypassed.push("devices:maxtouchpoints:0")}
		}
	}
	dom.touchM.innerHTML = displayMTP + (displayMTP == 0 ? rfp_green : rfp_red)

	// ToDo: touch LIE/BYPASS
	let touchReal = ""
	if (MTP !== zB0 & !maxBS) {
		touchReal = MTP == 0 ? false : true
	} else {
		// 0=3xfalse, 3=3xtrue
	}

	// output
	let str = touchRes.join(" | ")
	dom.touchE.innerHTML = str
	return ["touchevents:"+ str, "maxtouchpoints:"+ fpMTP]
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

	Promise.all([
		get_media_devices(),
		get_speech_engines(),
		get_speech_rec(),
		get_pointer_hover(),
		get_gamepads(),
		get_touch(),
		get_vr(),
		get_keyboard(),
		get_concurrency(),
		get_plugins_mimetypes(),
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
		if (gRun && isBraveMode > 1) {
			gKnown.push("devices:hardwareConcurrency")
		}
		// section
		log_section("devices", t0, section)
	})
}

countJS("devices")
