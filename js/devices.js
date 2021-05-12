'use strict';

var pluginBS = false
// FF only
var mimeBS = false,
	devicesBS = false,
	pluginFlash = false,
	mimeFlash = false

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

		// Expect plugin name to be in plugins own properties
		pluginsList.forEach(plugin => {
			const {
				name
			} = plugin
			if (!ownPropertiesSet.has(name)) {lies.push("F")}
		})
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
	let isLies = false
	if (isBraveMode.substring(0,2) == "st") {
		isLies = true
	} else {
		isLies = (protoLies.includes("Navigator.hardwareConcurrency") ? true : false)
	}
	if (runSL) {isLies = true; h = Math.floor((Math.random() * 33) + 1)}
	if (isLies) {h = soL + h + scC} else {h += (h == "2" ? rfp_green : rfp_red)}
	dom.nHWC.innerHTML = h
	return "hardwareConcurrency:"+ (isLies ? zLIE : h)
}

function get_media_devices() {
	return new Promise(resolve => {
		let t0 = performance.now()

		function finish(result) {
			// lies
			if (gRun) {
				if (devicesBS) {gLiesKnown.push("devices:media")}
			}
			log_perf("media devices [devices]",t0)
			return resolve("media_devices:"+ result)
		}

		// not supoprted
		if (check_navKey("mediaDevices") == false) {
			dom.eMD.innerHTML = zD + (isTB ? tb_green : rfp_red)
			finish(zD)
		} else {
			// else try enumerateDevices
			let str="", pad=13, strPad=""
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
					// reset known lie
					devicesBS = false
					// enumerate
					devices.forEach(function(d) {
						arr.push(d.kind)
						str += (d.kind +": ").padStart(pad)+ d.deviceId
						if (d.groupId.length) {
							strPad = ("group: ").padStart(pad)
							str += "<br>"+ strPad + d.groupId
						} else {
							// if FF the length cannot be zero
							console.debug(d.kind, "zero-length groupId")
						}
						if (d.label.length) {
							strPad = ("label: ").padStart(pad)
							str += "<br>"+ strPad + d.label
						}
						str += "<br>"
						// FF sanity check
						if (isFF) {
							// deviceId
							let chk = d.deviceId
							//console.debug("device", chk.length, chk.slice(-1), chk)
							if (chk.length !== 44) {devicesBS = true}
							else if (chk.slice(-1) !== "=") {devicesBS = true}
							// groupId
							if (isVer > 66) {
								chk = d.groupId
								//console.debug("group", chk.length, chk.slice(-1), chk)
								if (chk.length !== 44) {devicesBS = true}
								else if (chk.slice(-1) !== "=") {devicesBS = true}
							}
						}
					})
					// output list
					if (str.length == 0) {str = "none"}
					//dom.eMDList.innerHTML = str

					// count each kind
					let pretty = [], plain = [], rfphash = ""
					if (arr.length) {
						if (devicesBS) {
							pretty = "fake"
						} else {
							arr.sort()
							let map = arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
							arr = [...map.entries()]
							// build pretty/plain
							for (let i=0; i < arr.length; i++) {
								let data = arr[i],
									item = data[0],
									itemcount = data[1]
								pretty.push(item + s7 +"["+ itemcount +"]"+ sc)
								plain.push(item +","+ itemcount)
							}
							pretty = pretty.join(" ")
							str = plain.join(";")
							rfphash = sha1(str)
						}
					} else {
						pretty = "none"
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
		let t0 = performance.now()
		// reset
		let sName = "devices_mimetypes"
		clearDetail(sName)
		clearDetail(sName +"_fake_skip")
		sName = "devices_plugins"
		clearDetail(sName)
		clearDetail(sName +"_fake_skip")

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
				outputP = sha1(outputP.join())
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
				outputM = sha1(outputM.join())
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
					if (gRun) {gLiesBypassed.push("devices:plugins:none")}
				}
				if (results[1] !== "none") {
					mValue = "none"
					if (gRun) {gLiesBypassed.push("devices:mimeTypes:none")}
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
						gLiesKnown.push("devices:"+ type)
						gLiesBypassed.push("devices:"+ q.trim() + x2)
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
		let t0 = performance.now()
		let sName = "devices_speech_engines"
		clearDetail(sName)

		// output & resolve
		function display(output) {
			let btn = ""
			if (Array.isArray(output)) {
				sDetail[sName] = output
				btn = buildButton("7", sName, output.length +" engine"+ (output.length > 1 ? "s" : ""))
				output = sha1(output.join())
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
	try {document.createEvent("TouchEvent"); t = true} catch (e) {}
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
	let t0 = performance.now(),
		section = []

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
			if (pluginBS) {gLiesKnown.push("devices:plugins")}
			if (mimeBS) {gLiesKnown.push("devices:mimeTypes")}
			if (isBraveMode.substring(0,2) == "st") {gLiesKnown.push("devices:hardwareConcurrency")}
		}
		// section
		log_section("devices", t0, section)
	})
}

countJS("devices")
