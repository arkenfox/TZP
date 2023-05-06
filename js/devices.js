'use strict';

let pluginBS = false, pluginMini = "", mimeBS = false, mimeMini = "", devicesBS = false

// sims
let intSNC = 0
let intSNM = 0, lstSNM = [undefined, zU, {}, "null", 5.8, zB0, true, [4], "none", [], null]
let intSNP = 0, lstSNP = [undefined, {}, 5.8,zB0,zU,"true",true,[4],"none",[],"null", null]
let intMDV = 0, lstMDV = [[],["a","b"],["[object MediaDeviceInfo]"],[{"kind": "audioinput"}, {"kind": "videoinput"}],{}]
let intMTP = 0, lstMTP = ["0",0,-1,[],[0],[1],["a"],undefined, zU, zB0,"null", null]
let intDEP = 0, lstDEP = ["24",zB0,24, 41,1,7.2,undefined,zU,"null",{}]
let intCLR = 0, lstCLR = [ "8",zB0, 8, 61,1,7.2,undefined,zU,"null",{}]

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

function get_device_color() {
	let res = [], r1

	// pixelDepth: 418986: FF41+ RFP
	function get_pixeldepth(name) {
		let isLies = false
		try {
			if (runSE) {runDEP = false; abc = def
			} else if (runSL) {runDEP = false; r1 = "24"
			} else if (runDEP) {r1 = lstDEP[intDEP]; console.log("SIM #"+ intDEP, name, r1)
			} else {r1 = screen.pixelDepth
			}
		} catch(e) {
			r1 = zErr; log_error("devices: pixelDepth", e.name, e.message)
		}
		r1 = cleanFn(r1)
		let v1 = r1
		if (isTZPSmart) {
			// lies
			if (r1 !== zErr) {
				if (typeof r1 !== "number") {isLies = true
				} else if (!Number.isInteger(r1)) {isLies = true
				} else if (r1 < 2) {isLies = true
				} else if (proxyLies.includes("Screen.pixelDepth")) {isLies = true}
			}
			// record lies but not blocks
			if (isLies && r1 !== zErr) {
				v1 = zLIE; r1 = soL + r1 + scC
				if (gRun) {gKnown.push(name)}
			}
		}
		if (runDEP) {console.log(" - returned", v1)}
		dom.pixelDepth.innerHTML = r1
		res.push("pixelDepth:"+ v1)
	}

	// colorDepth: 418986: FF41+ RFP
	function get_colordepth(name) {
		let isLies = false, r2, r2notation = ""
		try {
			if (runSE) {runDEP = false; abc = def
			} else if (runSL) {runDEP = false; r2 = "24"
			} else if (runDEP) {r2 = lstDEP[intDEP]; console.log("SIM #"+ intDEP, name, r2)
			} else {r2 = screen.colorDepth
			}
		} catch(e) {
			r2 = zErr; log_error("devices: colorDepth", e.name, e.message)
		}
		r2 = cleanFn(r2)
		let v2 = r2
		if (isTZPSmart) {
			// lies
			if (r2 !== zErr) {
				if (typeof r2 !== "number") {isLies = true
				} else if (!Number.isInteger(r2)) {isLies = true
				} else if (r2 < 2) {isLies = true
				} else if (proxyLies.includes("Screen.colorDepth")) {isLies = true}
			}
			// record
			if (isLies && r2 !== zErr) {
				v2 = zLIE; r2 = soL + r2 + scC
				if (gRun) {gKnown.push(name)}
			}
			r2notation = (r1 == 24 && r2 == 24 ? rfp_green : rfp_red)
		}
		if (runDEP) {console.log(" - returned", v2)}
		dom.colorDepth.innerHTML = r2 + r2notation
		res.push("colorDepth:"+ v2)
	}

	// mm color: 418986: FF41+ RFP
	function get_mm_color(name) {
		let isLies = false, r3, isBypass = false, r3notation = ""
		let v3 = getElementProp("#cssC","content",":after")
		try {
			if (runSE) {runCLR = false; abc = def
			} else if (runSL) {runCLR = false; r3 = "8"
			} else if (runCLR) {r3 = lstCLR[intCLR]; console.log("SIM #"+ intCLR, name, r3)
			} else {
				r3 = (function() {for (let i=0; i < 1000; i++) {if (matchMedia("(color:"+ i +")").matches === true) {return i}}
					return i
				})()
			}
		} catch(e) {
			r3 = zErr; log_error("devices: matchmedia_color", e.name, e.message)
		}
		r3 = cleanFn(r3)

		if (isTZPSmart) {
			// bypass
			if (r3 !== v3 && v3 !== "x") {isBypass = true; isLies = true}
			// lies
			if (r3 !== zErr) {
				if (typeof r3 !== "number") {isLies = true
				} else if (!Number.isInteger(r3)) {isLies = true
				} else if (r3 < 2) {isLies = true}
			}
			// record
			if (isLies) {
				// zErr can't get in here unless we can bypass
				if (!isBypass) {v3 = zLIE}
				r3 = (isBypass ? soB : soL) + r3 + scC
				if (gRun) {gKnown.push(name); if (isBypass) {gBypassed.push(name +":"+ v3)}}
			}
			r3notation = r3 === 8 ? rfp_green : rfp_red
		}

		if (!isLies) {v3 = r3} // don't record blocked if no lies
		if (runCLR) {console.log(" - returned", v3)}
		dom.mmC.innerHTML = r3 + r3notation
		res.push("matchmedia_color:"+ v3)
	}

	// color gamut
	function get_mm_colorgamut(name) {
		let q = "(color-gamut: "
		let isLies = false, r4 = zNS, isBypass = false
		let v4 = getElementProp("#cssCG","content",":after")
		try {
			if (runSE) {abc = def
			} else {
				if (window.matchMedia(q +"srgb)").matches) {r4 = "srgb"}
				if (window.matchMedia(q +"p3)").matches) {r4 = "p3"}
				if (window.matchMedia(q +"rec2020)").matches) {r4 = "rec2020"}
			}
		} catch(e) {
			log_error("devices: matchmedia_color-gamut", e.name, e.message)
			r4 = zErr
		}
		r4 = cleanFn(r4)
		if (isTZPSmart) {
			// bypass
			if (r4 !== v4 && v4 !== "x") {isBypass = true; isLies = true}
			// record
			if (isLies) {
				// zErr can't get in here unless we can bypass
				if (!isBypass) {v4 = zLIE}
				r4 = (isBypass ? soB : soL) + r4 + scC
				if (gRun) {gKnown.push(name); if (isBypass) {gBypassed.push(name +":"+ v4)}}
			}
		}
		if (!isLies) {v4 = r4} // don't record blocked if no lies
		dom.mmCG.innerHTML = r4
		res.push("matchmedia_color-gamut:"+ v4)
	}

	// run
	get_pixeldepth("devices:pixelDepth")
	get_colordepth("devices:colorDepth")
	get_mm_color("devices:matchmedia_color")
	get_mm_colorgamut("devices:matchmedia_color-gamut")
	if (runCLR) {intCLR++; intCLR = intCLR % lstCLR.length}
	if (runDEP) {intDEP++; intDEP = intDEP % lstDEP.length}
	// return
	return(res)
}

function get_concurrency() {
	// gecko stuff
		// 1630089: FF68+ macOS reports physical cores instead of logical
		// capped at dom.maxHardwareConcurrency (e.g. 1728741)
	// hardwareConcurrency is an expected key
	let display, value, isLies = false, notation = ""
	try {
		value = navigator.hardwareConcurrency
		value = cleanFn(value)
		display = value
	} catch(e) {
		display = log_error("devices: hardwareConcurrency", e.name, e.message)
		value = zErr
	}
	// lies
	if (isTZPSmart) {
		if (value !== zErr) {
			if (typeof value !== "number") {isLies = true
			} else if (!Number.isInteger(value)) {isLies = true
			} else if (value < 1) {isLies = true
			} else if (isBraveMode > 1) {isLies = true
			} else if (proxyLies.includes("Navigator.hardwareConcurrency")) {isLies = true}
		}		
		if (isLies) {
			value = zLIE; display = soL + display + scC
			if (gRun) {gKnown.push("devices:hardwareConcurrency")}
		}
		notation = (value === 2 ? rfp_green : rfp_red)
	}
	dom.nHWC.innerHTML = display + notation
	return "hardwareConcurrency:"+ value
}

function get_gamepads() {
	return new Promise(resolve => {
		let r = (check_navKey("getGamepads") ? zE : zD)
		dom.gamepads.innerHTML = r
		return resolve("gamepads:"+ r)
	})
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
						display = log_error("devices: keyboard", resE[0])
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
			display = log_error("devices: keyboard", e.name, e.message)
			if (isFF) {display = color(display)}
			dom.nKeyboard.innerHTML = display
			return resolve("keyboard:"+ (isFF ? zNA : zErr))
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
					let strDevices = devices +""
					let aSplit = strDevices.split(",")
					let splitBS = false // assume good
					log_debug("devices", strDevices)
					if (isFF || isEngine == "blink") {
						for (let i=0; i < aSplit.length; i++) {
							if (isFF) {
								if (aSplit[i] !== "[object MediaDeviceInfo]") {splitBS = true}
							} else {
								if (i == aSplit.length - 1) {
									if (aSplit[i] !== "[object MediaDeviceInfo]") {splitBS = true}
								} else {
									if (aSplit[i] !== "[object InputDeviceInfo]") {splitBS = true}
								}
							}
						}
						devicesBS = splitBS
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
							// deviceId
							let chk = d.deviceId
							if (chk.length !== 44) {devicesBS = true}
							else if (chk.slice(-1) !== "=") {devicesBS = true}
							// groupId
							chk = d.groupId
							//console.log("group", chk.length, chk.slice(-1), chk)
							if (chk.length !== 44) {devicesBS = true}
							else if (chk.slice(-1) !== "=") {devicesBS = true}
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
						devicesBS = proxyLies.includes("MediaDevices.enumerateDevices")
						finish("none", "none")
					}
				} else {
					finish(zLIE, devices)
				}
			})
		} catch(e) {
			dom.eMD = log_error("devices: media devices", e.name, e.message)
			return resolve("media_devices:"+ zErr)
		}
	})
}

function get_mimetypes() {
	return new Promise(resolve => {
		// mimeTypes is an expected key
		mimeBS = true
		mimeMini = ""
		try {
			let m = navigator.mimeTypes
			if (runSE) {
				runSNM = false; abc = def
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
					let miniKnown = ["ac6c4fe7"] //none
					if (isVer > 98) {miniKnown.push("4f23f546")} // hardcoded
					try {
						mimeMini = mini(m, "mimeTypes check")
					} catch(e) {
						// chameleon: TypeError: cyclic object
						log_error("devices: mimeTypes", e.name, e.message)
					}
					if (isVer > 84) {
						if (miniKnown.includes(mimeMini)) {isObjFake = false; mimeBS = false}
					} else {
						isObjFake = false; mimeBS = false
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
					if (isFF && mimeMini !== "ac6c4fe7") {isObjFake = true; mimeBS = true}
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
		pluginMini = ""
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
					let miniKnown = ["ac6c4fe7"] //none
					if (isVer > 98) {miniKnown.push("012c6754")} // hardcoded
					try {
						pluginMini = mini(p, "plugins check")
					} catch(e) {
						log_error("devices: plugins", e.name, e.message)
					}
					if (isVer > 84) {
						if (miniKnown.includes(pluginMini)) {isObjFake = false; pluginBS = false}
					} else {
						isObjFake = false; if (isFF) {pluginBS = false}
					}
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
					if (isFF && pluginMini !== "ac6c4fe7") {isObjFake = true; pluginBS = true}
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
			"5b8b5b83ff5790df763d417ec6e2adbbf0570c47","4f23f546",
			["application/pdf: application/pdf: pdf","text/pdf: text/pdf: pdf"]
		]
		let plugin99 = [
			"6232b915d6de71c787a36eb42b75d2b8e24aa4d3","012c6754",
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
				let el = type == "plugins" ? dom.plugins : dom.mimeTypes
				let elMini = type == "plugins" ? dom.pluginMini : dom.mimeMini
				sName = "devices_"+ type
//oDebug[type+" result"] = value
				if (Array.isArray(value)) {
					value = mini_sha1(value.join(), sName)
				}
//oDebug[type+" value"] = value
//oDebug[type+" isLies"] = isLies
				fpValue = value
				// isBypass
				let isBypass = false
				let msgBP = "FF85-98"
				if (isFF) {
					let otherValue = type == "plugins" ? results[1] : results[0]
					let otherMini = type == "plugins" ? mimeMini : pluginMini
					let otherBS = type == "plugins" ? mimeBS : pluginBS
					let expectedMini
					// FF99+: 1720353: static lists vs none (pref)
					if (isVer > 98) {
						msgBP = "FF99+"
						// leverage pdf
						if (!pdfLies && pdf !== zB0) {
							if (pdf == true) {
								expectedMini = type == "plugins" ? plugin99[1] : mime99[1]
								let currentMini = type == "plugins" ? pluginMini : mimeMini
								if (currentMini !== expectedMini) {
									isBypass = true
									isBypass = true; fpValue = (type == "plugins" ? plugin99[0] : mime99[0])
									sDetail["devices_"+ type] = (type == "plugins" ? plugin99[2] : mime99[2])
								}
							} else if (pdf == false) {
								if (value !== "none") {isBypass = true; fpValue = "none"}
							}
						// lies: leverage the other non-BS value
						} else if (isLies || value == zB0) {
							expectedMini = type == "plugins" ? mime99[1] : plugin99[1]
							if (!otherBS && otherMini == expectedMini) {
								isBypass = true; fpValue = (type == "plugins" ? plugin99[0] : mime99[0])
								sDetail["devices_"+ type] = (type == "plugins" ? plugin99[2] : mime99[2])
								if (runSNM || runSNP) {msgBP += " from "+ (type == "plugins" ? "mimeTypes" : "plugins")}
							} else if (!otherBS && otherValue == "none") {
								isBypass = true; fpValue = "none"
								if (runSNM || runSNP) {msgBP += ": from "+ (type == "plugins" ? "mimeTypes" : "plugins")}
							}
						}
					} else if (isLies || value == zB0) {
						if (isVer > 84) {
							// EOL Flash: use isLies
							if (value !== "none") {
								isBypass = true; fpValue = "none"
								if (runSNM || runSNP) {msgBP += " must be none"}
							}
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
				let array = type == "plugins" ? results[0] : results[1]
				if (Array.isArray(array)) {
					if (isLies) {sName += "_fake_skip"}
					sDetail[sName] = array
					btn = buildButton("7", sName, array.length +" "+ type)
				}
				if (isLies) {
					value = (isBypass ? soB : soL) + value + scC
					if (!isBypass) {fpValue = zLIE}
					if (gRun) {
						gKnown.push("devices:"+ type)
						if (isBypass) {gBypassed.push("devices:"+ type +":"+ fpValue)}
					}
				}
				let thisMini = (type == "plugins" ? pluginMini : mimeMini)
				if (thisMini !== "") {elMini.innerHTML = " ["+ thisMini +"] "}
				if (runSNM && type == "mimeTypes" || runSNP && type == "plugins") {
					console.log(" - returned "+ fpValue + " ["+ type +"]" + (isBypass ? ": bypass "+ msgBP : ""))
				}
				let notation = ""
				if (isVer < 100) {
					notation = (value == "none" ? rfp_green : rfp_red)
				} else {
					// 1756280
					if (type == "plugins") {notation = (thisMini == "012c6754" ? rfp_green : rfp_red)
					} else if (type == "mimeTypes") {notation = (thisMini == "4f23f546" ? rfp_green : rfp_red)}
				}
				el.innerHTML = value + btn + notation
				return fpValue
			}

			function output_pdf() {
				// pdfViewerEnabled: FF99+ boolean, FF98- undefined
				let fpValue, pdfBypass = false, pdfNote = ""
				pdf = cleanFn(pdf)
				fpValue = pdf
				if (isVer > 98) {
					// two legit arrays
					if (mValue == mime99[0] && pValue == plugin99[0]) {
						if (pdf !== "true" || pdfLies) {pdfBypass = true; fpValue = "true"}
					}
				} else if (isFF) {
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
				if (isVer > 98) {pdfNote = pdf == "true" ? rfp_green : rfp_red}
				dom.pdf.innerHTML = pdf + pdfNote
				return fpValue
			}
			// set some PDF vars first
			let pdf, pdfLies = false
			try {
				pdf = navigator.pdfViewerEnabled
			} catch(e) {
				pdf = zB0; log_error("devices: pdfViewer", e.name, e.message)
			}
			// lies: 1720353
			if (pdf !== zB0) {
				if (proxyLies.includes("Navigator.pdfViewerEnabled")) {
					pdfLies = true
				} else if (isVer > 98) {
					pdfLies = ("boolean" !== typeof pdf)
				} else if (isFF) {
					pdfLies = (undefined !== pdf)
				}
			}
			// fuck it: harden
			if (proxyLies.includes("Navigator.plugins")) {pluginBS = true}
			if (proxyLies.includes("Navigator.mimeTypes")) {mimeBS = true}
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
			let x=zNS, x2="", f="fine", c="coarse", h="hover", n="none", q=type+":"
		
			let value = zNA

			try {
				if (runSE) {abc = def
				} else if (runSL) {x = "banana"
				} else {
					if (window.matchMedia("("+ q + n +")").matches) x=n
					if (window.matchMedia("("+ q + c +")").matches) x=c
					if (window.matchMedia("("+ q + f +")").matches) x=f
					if (window.matchMedia("("+ q + h +")").matches) x=h

		if (window.matchMedia("("+ type +":fine").matches) value = "fine"
		if (window.matchMedia("("+ type +":hover)").matches) value = "hover"
		if (window.matchMedia("("+ type +":coarse)").matches) value = "coarse"
		if (window.matchMedia("("+ type +":none)").matches) value = "none"

				}
			} catch(e) {
				log_error("devices: matchmedia_"+ type, e.name, e.message)
				x = zErr
			}
			x2 = getElementProp(id,"content",":after")

			console.log(type +", "+ id +", old: "+ x +", css: "+ x2 +", new: "+ value)

			// lies
			if (isTZPSmart && x2 !== "x") {
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
		} else {
			if (isTZPSmart) {isLiesPE = true}
		}
		dom.pointer.innerHTML = isLiesPE ? soL + r1 + scC : r1
		if (gRun && isLiesPE) {
			gKnown.push("devices:pointer_event")
		}
		res.push("pointer_event:"+ (isLiesPE ? zLIE : r1))

		// pointer
		get_mm("any-pointer", "#cssAP")
		get_mm("pointer", "#cssP")
		let p = display.join(" | ")
		// hover
		display = []
		get_mm("any-hover", "#cssAH")
		get_mm("hover", "#cssH")
		let h = display.join(" | ")
		// notate
		if (isTZPSmart && isOS == "android") {
			// FF74+: 1607316
			if (!pointerBS) {p += (p == "coarse | coarse" ? rfp_green : rfp_red)}
			if (!hoverBS) {h += (h == "none | none" ? rfp_green : rfp_red)}
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
			if (runSE) {abc = def}
			let recognition = new SpeechRecognition()
			dom.sRec = zE
			return resolve("speech_recogniton:" + zE)
		} catch(e) {
			dom.sRec = log_error("devices: speech recognition", e.name, e.message)
			return resolve("speech_recogniton:" + zErr)
		}
	})
}

function get_touch() {

	//gecko/blink: ontouchcancel, ontouchend, ontouchmove, ontouchstart: engine properties

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
					if (name in window) {touchRes.push(true)} else {touchRes.push(false)}
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
		get_device_color(),
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
