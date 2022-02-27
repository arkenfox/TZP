'use strict';

let pluginBS = false, mimeBS = false, devicesBS = false

// sims
let intSNC = 0
let intSNH = 0, lstSNH = ["2", zB0, 2, 11, 0, 7.2, [1,2], {},"null", "undefined", undefined, []]
let intSNM = 0, lstSNM = [undefined, zU, {}, "null", 5.8, zB0, true, [4], "none", [], null]
let intSNP = 0, lstSNP = [undefined, {}, 5.8,zB0,zU,"true",true,[4],"none",[],"null", null]
let intMDV = 0, lstMDV = [[],["a","b"],["[object MediaDeviceInfo]"],[{"kind": "audioinput"}, {"kind": "videoinput"}],{}]
let intMTP = 0, lstMTP = ["0",0,-1,[],[0],[1],["a"],undefined, zU, zB0,"null", null]

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
	if (!isFF) {pluginBS = (pluginLies.length > 1)}
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
	// hardwareConcurrency is an expected key
	let h, isLies = false, name = "devices:hardwareConcurrency"
	try {
		if (runSE) {
			runSNH = false; abc = def
		} else if (runSL) {
			h = null; runSNH = false
		} else if (runSNH) {
			h = lstSNH[intSNH]; console.log("SIM #"+ intSNH, name, h)
		} else {
			h = navigator.hardwareConcurrency
		}
	} catch(e) {
		log_error("devices: hardwareConcurrency", e.name, e.message)
		h = zB0
	}
	h = cleanFn(h)
	// lies
	if (h !== zB0) {
		if (typeof h !== "number") {isLies = true
		} else if (!Number.isInteger(h)) {isLies = true
		} else if (h < 1) {isLies = true
		} else if (isBraveMode > 1) {isLies = true
		} else if (proxyLies.includes("Navigator.hardwareConcurrency")) {isLies = true}
	}
	let h2 = h
	// output
	if (isLies) {
		h2 = zLIE; h = soL + h + scC
		if (gRun) {gKnown.push(name)}
	}
	dom.nHWC.innerHTML = h + (h === 2 ? rfp_green : rfp_red)
	if (runSNH) {
		console.debug(" - returned", h2)
		intSNH++; intSNH = intSNH % lstSNH.length
	}
	return "hardwareConcurrency:"+ h2
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
			k = cleanFn(k)
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
						display = mini_sha1(keys.join(), "devices keyboard")
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
				if (k == zU & isFF) {display = zNA; value = zNA} else {display = color(display)}
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
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let extra = ""
		if (gLoad) {extra = (canPerf ? Math.round(performance.now()) : "")}
		log_perf("start [md]","n/a",gt0,extra)
		let hash = ""

		// not supported
		if (check_navKey("mediaDevices") == false) {
			dom.eMD.innerHTML = zD + (isTB ? tb_green : rfp_red)
			return resolve("media_devices:"+ zD)
		}
		// output + resolve
		function finish(result, display, applyColor = true) {
			if (devicesBS) {
				result = zLIE
				if (applyColor) {display = soL + display + scC}
				if (gRun) {gKnown.push("devices:media")}
			}
			// notation
			let note = ""
			if (hash == "3bd41389") {note = (isTB ? tb_red : rfp_green)} else {note = (isTB ? tb_red : rfp_red)}
			dom.eMD.innerHTML = display + note
			extra = ""
			if (gLoad) {extra = (canPerf ? Math.round(performance.now()) : "")}
			log_perf("media devices [devices]",t0,gt0, extra)
			if (runMDV) {console.log(" - returned", result)}
			return resolve("media_devices:"+ result)
		}
		// await devices
		try {
			let limit = 1000
			promiseRaceFulfilled({
				promise: navigator.mediaDevices.enumerateDevices(),
				responseType: Array,
				limit: 2000 // increase race limit for slow system/networks
			}).then(function(devices) {
				// promise failed
				if (!devices) {
					let e = { name: 'promise failed', message: `blocked or failed to fulfill in ${limit}ms` }
					dom.eMD.innerHTML = e.name
					finish(e.name, e.name)
					return
				}
				// reset BS: assume lies
				devicesBS = true
				let isArray = false
				if (runMDV) {
					devices = lstMDV[intMDV]
					console.log("SIM #"+ intMDV +" mediaDevices", devices)
					intMDV++; intMDV = intMDV % lstMDV.length
				}
				if (typeof devices == "object" && Array.isArray(devices)) {
					isArray = true
					if (isFF && devices+"" == "[object MediaDeviceInfo]") {devicesBS = false
					} else if (isEngine == "blink") {
						if (devices +"" == "[object InputDeviceInfo],[object MediaDeviceInfo]") {devicesBS = false}
					} else {devicesBS = false} // webkit who cares
				} else {
					devices = cleanFn(devices)
				}
				if (proxyLies.includes("MediaDevices.enumerateDevices")) {devicesBS = true} // fallback

				// enumerate
				if (isArray) {
					let aData = []
					devices.forEach(function(d) {
						let dValue = d.kind
						if (dValue === undefined) {devicesBS = true} else {aData.push(dValue)}
						// FF sanity check
						if (isFF && d.groupId !== undefined) {
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
					// count each kind
					if (aData.length) {
						let aDisplay = [], aPlain = []
						aData.sort()
						let map = aData.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
						aData = [...map.entries()]
						// build pretty/plain
						for (let i=0; i < aData.length; i++) {
							let data = aData[i],
								item = data[0],
								itemcount = data[1]
							aPlain.push(item +","+ itemcount)
							if (devicesBS) {item = soL + item + scC}
							aDisplay.push(item + s7 +"["+ itemcount +"]"+ sc)
						}
						hash = mini(aPlain.join(";"), "devices media devices")
						finish(aPlain.join(";"), aDisplay.join(" "), false)
					} else {
						finish("none", "none")
					}
				} else {
					finish(zLIE, devices)
				}
			})
		} catch(e) {
			log_error("devices: media devices", e.name, e.message)
			dom.eMD.innerHTML = (e.name === undefined ? zErr : trim_error(e.name, e.message))
			return resolve("media_devices:"+ zB0)
		}
	})
}

function get_mimetypes() {
	return new Promise(resolve => {
		// mimeTypes is an expected key
		mimeBS = true
		try {
			let m = navigator.mimeTypes
			if (runSE) {
				runSNM = false; abc = def = zB0
			} else if (runSL) {
				runSNM = false; m = null
			} else if (runSNM) {
				m = lstSNM[intSNM]
				console.log("SIM #" + intSNM + " mimeTypes", m)
				intSNM++; intSNM = intSNM % lstSNM.length
				if (m == zB0) {mimeBS = false; return resolve(m)}
			}
			// cleanup
			m = cleanFn(m)
			let isObj = false, isObjFake = true
			if (typeof m === "object") {
				isObj = true
				if (m+"" == "[object MimeTypeArray]") {
					if (isVer > 84) {
						try {
							let check = mini(m, "mimeTypes check")
							if (check == "4f23f546" || check == "ac6c4fe7") {
								isObjFake = false; mimeBS = false
							} else {
								console.debug ("mimeTypes check", check)
							}
						} catch(e) {
							// chameleon: TypeError: cyclic object value on tampered objects?
							log_error("devices: mimeTypes", e.name, e.message)
						}
					} else {
						isObjFake = false; if (isFF) {mimeBS = false}
					}
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
					return resolve(isObjFake ? m : "none") // we already set mimeBS = false on a legit object
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
			if (runSE) {
				runSNP = false; abc = def
			} else if (runSL) {
				runSNP = false; p = {}
			} else if (runSNP) {
				p = lstSNP[intSNP]
				console.log("SIM #" + intSNP + " plugins", p)
				intSNP++; intSNP = intSNP % lstSNP.length
				if (p == zB0) {pluginBS = false; return resolve(p)}
			}
			// cleanup
			p = cleanFn(p)
			let isObj = false, isObjFake = true
			if (typeof p === "object") {
				isObj = true
				if (p+"" === "[object PluginArray]") {
					// ^ cydec passes this
					if (isVer > 84) {
						try {
							let check = mini(p, "plugins check")
							if (check == "012c6754" || check == "ac6c4fe7") {
								isObjFake = false; pluginBS = false
							} else {
								// none: 5ac1fd17 <- cydec BS
								console.debug ("plugins check", check)
							}
						} catch(e) {
							// TypeError: cyclic object value on tampered objects?
							log_error("devices: plugins", e.name, e.message)
						}
					} else {
						isObjFake = false; if (isFF) {pluginBS = false}
					}
				}
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

		let mime99 = [
			"5b8b5b83ff5790df763d417ec6e2adbbf0570c47","70c58f33",
			["application/pdf: application/pdf: pdf","text/pdf: text/pdf: pdf"]
		]
		let plugin99 = [
			"6232b915d6de71c787a36eb42b75d2b8e24aa4d3","ca47ffb2",
			["Chrome PDF Viewer: internal-pdf-viewer: Portable Document Format",
			"Chromium PDF Viewer: internal-pdf-viewer: Portable Document Format",
			"Microsoft Edge PDF Viewer: internal-pdf-viewer: Portable Document Format",
			"PDF Viewer: internal-pdf-viewer: Portable Document Format",
			"WebKit built-in PDF: internal-pdf-viewer: Portable Document Format"]
		]

		Promise.all([
			get_plugins(),
			get_mimetypes(),
		]).then(function(results){
			function output(type) {
				let btn = "", fpValue
				let value = type == "plugins" ? results[0] : results[1]
				let isLies = type == "plugins" ? pluginBS : mimeBS
//oDebug[type+" result"] = value
				let el = type == "plugins" ? dom.plugins : dom.mimeTypes
				sName = "devices_"+ type
				if (Array.isArray(value)) {
					if (isLies) {sName += "_fake_skip"}
					sDetail[sName] = value
					btn = buildButton("7", sName, value.length +" "+ type)
					value = (type == "plugins" ? pluginValue : mimeValue)
				}
//oDebug[type+" value"] = value
//oDebug[type+" isLies"] = isLies
				fpValue = value
				// isBypass
				let isBypass = false
				let msgBP = "FF85-98"
				if (isFF) {
				  // we can only bypass lies or blocked
					if (isLies || value == zB0) {
						let otherValue = type == "plugins" ? results[1] : results[0]
						let otherBS = type == "plugins" ? mimeBS : pluginBS
						if (isVer > 98) {
						// FF99+: 1720353: static lists vs none (pref)
							msgBP = "FF99+"
							// check for other nonBS value
							let otherMini = (Array.isArray(otherValue)) ? mini(otherValue.join()) : undefined
							let miniCheck = (type == "plugins" ? mime99[1] : plugin99[1])
							// leverage the other value
							if (!otherBS && otherMini == miniCheck) {
								isBypass = true; fpValue = (type == "plugins" ? plugin99[0] : mime99[0])
								sDetail["devices_"+ type] = (type == "plugins" ? plugin99[2] : mime99[2])
								if (runSNM || runSNP) {msgBP += " from "+ (type == "plugins" ? "mimeTypes" : "plugins")}
							}
							if (!otherBS && otherValue == "none") {
								isBypass = true; fpValue = "none"
								if (runSNM || runSNP) {msgBP += ": from "+ (type == "plugins" ? "mimeTypes" : "plugins")}
							}
						} else if (isVer > 84) {
							// EOL Flash: use isLies
							isBypass = true; fpValue = "none"
							if (runSNM || runSNP) {msgBP += " must be none"}
						} else {
							// FF84- we can bypass if the other one is a non-fake "none"
							if (otherValue == "none" && !otherBS) {
								isBypass = true
								fpValue = "none"
								if (runSNM || runSNP) {
									msgBP = "FF84 and lower: from "+ (type == "plugins" ? "mimeTypes" : "plugins")
								}
							}
						}
					}
					if (isBypass) {isLies = true}
				}
				// display
				if (isLies) {
					el.innerHTML = (isBypass ? soB : soL) + value + scC + btn + rfp_red
					if (!isBypass) {fpValue = zLIE}
					if (gRun || runSNM || runSNP) {
						gKnown.push("devices:"+ type)
						if (isBypass) {gBypassed.push("devices:"+ type +":"+ fpValue)}
					}
				} else {
					// fake "none" is already wrapped in soB
					el.innerHTML = value + btn + (value == "none" ? rfp_green : rfp_red)
				}
				if (runSNM && type == "mimeTypes" || runSNP && type == "plugins") {
					console.log(" - returned "+ fpValue + " ["+ type +"]" + (isBypass ? ": bypass "+ msgBP : ""))
				}
				return fpValue
			}

			function output_pdf() {
				// pdfViewerEnabled: FF99+ boolean, FF98- undefined
				let pdf, fpValue, pdfLies = false, pdfBypass = false, pdfNote = ""
				try {
					pdf = navigator.pdfViewerEnabled
				} catch(e) {
					pdf = zB0; log_error("devices: pdfViewer", e.name, e.message)
				}
				// lies: 1720353
				if (pdf !== zB0) {
					if (isVer > 98) {
						if ("boolean" !== typeof pdf) {pdfLies = true}
						//} else if (proxyLies.includes("Navigator.pdfViewerEnabled")) {pdfLies = true}
					} else {pdfLies = (undefined !== pdf)}
				}
				pdf = cleanFn(pdf)
				fpValue = pdf
				if (isVer > 98) {
					// two legit arrays
					if (mValue == mime99[0] && pValue == plugin99[1]) {
						if (pdf !== "true" || pdfLies) {pdfBypass = true; fpValue = "true"}
					}
					// two legit nones
						// note: RFP does not cover this yet: so allow 2 x none + true
					if (!isRFP && mValue == "none" && pValue == "none") {
						if (pdf !== "false" || pdfLies) {pdfBypass = true; fpValue = "false"}
					}
				} else {
					// FF98 or lower
					if (pdf !== "undefined") {pdfBypass = true; fpValue = "undefined"}
				}
				if (pdfBypass) {pdfLies = true}
				if (pdfLies) {
					if (!pdfBypass) {fpValue = zLIE}
					pdf = (pdfBypass ? soB : soL) + pdf + scC
					if(gRun) {
						gKnown.push("devices:pdfViewerEnabled")
						if (pdfBypass) {gBypassed.push("devices:pdfViewerEnabled:" + fpValue)}
					}
				}
//oDebug["pdf"] = pdf
//oDebug["pdfLies"] = pdfLies
//oDebug["isRFP"] = isRFP
				if (isVer > 98) {pdfNote = pdf == "false" ? rfp_green : rfp_red}
				dom.pdf.innerHTML = pdf + pdfNote
				return fpValue
			}
//let oDebug = {}

			// harden BS before we compare
			let pluginValue = (Array.isArray(results[0])) ? mini_sha1(results[0].join(), "devices plugins") : results[0]
			let mimeValue = (Array.isArray(results[1])) ? mini_sha1(results[1].join(), "devices mimeTypes") : results[1]
			if (isVer > 98) {
				if (pluginValue !== plugin99[0] && pluginValue !== "none") {pluginBS = true}
				if (mimeValue !== mime99[0] && mimeValue !== "none") {mimeBS = true}
			} else if (isVer > 84) {
				if (pluginValue !== "none") {pluginBS = true}
				if (mimeValue !== "none") {mimeBS = true}
			}
			// now we can cross check them
			let mValue = output("mimeTypes")
			let pValue = output("plugins")
			let pdfValue = output_pdf()
			// ToDo: sanity check for legit combos of the three results
			// i.e we should be false, none, none (RFP exception)

//console.debug(oDebug)
			log_perf("mimetypes/plugins [devices]",t0)
			return resolve(["plugins:"+ pValue, "mimeTypes:"+ mValue, "pdfViewerEnabled:"+ pdfValue])
		})
	})
}

function get_pointer_event() {
	// note: FF87 or lower: dom.w3c_pointer_events.enabled = false
	if (window.PointerEvent === undefined) {
		dom.ptEvent.innerHTML = zNS
		return
	} else if (isTB && isVer < 87) {
		dom.ptEvent.innerHTML = zNA + tb_green
		// do not return because prefs can be changed
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
			} else if (value == zU) {value = zUQ
			} else if (value === undefined) {value = zU}
			if (typeof value !== listType[i]) {
				if (i == 2 && isFF || i !== 2) {
					value = soL + value + scC
				}
			}
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
		let r1 = window.PointerEvent, isLiesPE = false
		r1 = cleanFn(r1)
		if (r1 == "undefined") {r1 = zD
		} else if (typeof r1 == "function") {r1 = zE
		} else {isLiesPE = true}
		dom.pointer.innerHTML = isLiesPE ? soL + r1 + scC : r1
		if (gRun && isLiesPE) {
			gKnown.push("devices:pointer_event")
		}
		res.push("pointer_event:"+ (isLiesPE ? zLIE : r1))
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
				output = mini_sha1(output.join(), "devices speech engines")
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
	// ontouchstart/ontouchend/TouchEvent
		// dom.w3c_touch_events.enabled: 0=disabled (macOS) 1=enabled 2=autodetect (linux/win/android)
		// autodetection is currently only supported on Windows and GTK3 (and assumed on Android)
		// on touch devices: 0 (all false) 1 or 2 (all true)
		// on non-touch devices = no change (all false)
	return new Promise(resolve => {
		let touchRes = [], touchBS = false
		function get_ontouch() {
			let list = ["ontouchstart","ontouchend"]
			list.forEach(function(name) {
				try {
					if (name in window) {toucRes.push(true)} else {touchRes.push(false)}
				} catch(e) {
					log_error("devices: "+ name, e.name, e.message)
					touchRes.push(zB0)
				}
			})
			try {
				document.createEvent("TouchEvent")
				touchRes.push(true)
			} catch(e) {
				log_error("devices: touch touchevent", e.name, e.message)
				touchRes.push(e.name == "NotSupportedError" ? false : zB0)
			}
		}

		// maxTouchPoints: 1363508 : FF64+ RFP
		let MTP, maxBS = false, maxBypass = false
		function get_mtp() {
			let name = "maxtouchpoints"
			try {
				if (runSE) {
					runMTP = false; abc = def
				} else if (runSL) {
					runMTP = false; runMTP = undefined
				} else if (runMTP) {
					MTP = lstMTP[intMTP]; console.log("SIM #"+ intMTP, name, MTP)
					intMTP++; intMTP = intMTP % lstMTP.length
				} else {
					MTP = navigator.maxTouchPoints
				}
			} catch(e) {
				MTP = zB0; log_error("devices: maxtouchpoints", e.name, e.message)
			}
			MTP = cleanFn(MTP)
			// BS
			if (MTP !== zB0 && is59) {
				if (typeof MTP !== "number") {maxBS = true
				} else if (!Number.isInteger(MTP)) {maxBS = true
				} else if (MTP < 0) {maxBS = true
				} else if (proxyLies.includes("Navigator.maxTouchPoints")) {maxBS = true}
			}
		}

		function analyze() {
			// is touch all the same
			let touchSum = touchRes[0] + touchRes[1] + touchRes[2]
			if (touchSum !== 0 && touchSum !== 3) {touchBS = true}
			let displayMTP = MTP
			let fpMTP = MTP

			if (touchSum == 0 && MTP !== 0 && is59) {maxBypass = true}
			if (maxBypass) {maxBS = true}

			if (maxBS) {
				if (maxBypass) {
					fpMTP = 0
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
			dom.touchM.innerHTML = displayMTP + (is59 ? (displayMTP === 0 ? rfp_green : rfp_red) : "")

			// ToDo: touch LIE/BYPASS
			//let touchReal = ""
			// if !isRFP then it must be 3xtrue or 3xfalse
				// ^ we use MTP but only if that wasn't a lie and isn't blocked

			// output
			let str = touchRes.join(" | ")
			dom.touchE.innerHTML = str
			return resolve(["touchevents:"+ str, "maxtouchpoints:"+ fpMTP])
		}

		// MTP: FF58 or lower should return undefined
		let is59 = false
		try {is59 = ("tt" == Intl.DateTimeFormat.supportedLocalesOf("tt").join())} catch(e) {}

		get_mtp()
		get_ontouch()
		analyze()
	})
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
