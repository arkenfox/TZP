'use strict';

var pluginBS = false,
	mimeBS = false, // FF only
	devicesBS = false // FF only

function set_pluginBS() {
	/* https://github.com/abrahamjuliot/creepjs */

	// set pluginBS
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

	if (pluginLies.length) {
		isBraveFP = check_navKey("brave")
		pluginBS = true
	} else {
		pluginBS = false
	}
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
		} catch(e) {
			h = zB0
		}
	} else {
		h = zD
	}
	if (isBraveFP) {
		h = "fake"
	} else {
		h = (protoLies.includes("Navigator.hardwareConcurrency") ? "fake" : h)
	}
	dom.nHWC.innerHTML = h + (h == "2" ? rfp_green : rfp_red)
	return "hardwareConcurrency:"+ h
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
		let sName = "devices_mimetypes"
		clearDetail(sName)
		clearDetail(sName +"_fake")

		function display(output) {
			let btn = ""
			if (Array.isArray(output)) {
				sDetail[sName] = output
				let sBtn = output.length +" mimetype"+ (output.length > 1 ? "s" : "")
				btn = buildButton("7", sName + (mimeBS ? "" : "_fake"), sBtn)
				output = sha1(output.join())
			}
			if (mimeBS) {output = "fake"}
			dom.mimeTypes.innerHTML = output + btn + (output == "none" ? rfp_green : rfp_red)
			return resolve(output)
		}

		if (check_navKey("mimeTypes")) {
			try {
				let m = navigator.mimeTypes
				if (m.length) {
					let res = []
					for (let i=0; i < m.length; i++) {
						res.push( m[i].type + (m[i].description == "" ? ": * " : ": "+ m[i].type)
							+ (m[i].suffixes == "" ? ": *" : ": "+ m[i].suffixes) )
					}
					res.sort()
					// FF: mimeBS
					if (isFF) {
						mimeBS = false
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
									if (mime1 !== "application/x-futuresplash" || mime2 !== "application/x-shockwave-flash") {
										mimeBS = true
									}
							} else {
								mimeBS = true
							}
						}
					}
					display(res)
				} else {
					display("none")
				}
			} catch(e) {
				display(zB0)
			}
		} else {
			display(zD)
		}
	})
}

function get_mimetypes_plugins() {
	return new Promise(resolve => {
		let t0 = performance.now()
		Promise.all([
			get_plugins(),
			get_mimetypes(),
		]).then(function(results){
			let pValue = results[0]
			let mValue = results[1]
			// values returned can be: none, sha1-hash, disabled, blocked, fake
			if (isFF) {
				// the only hashes allowed through in FF are flash
				let pFlash = false
				let mFlash = false
				if (pValue.length == 40) {pFlash = true}
				if (mValue.length == 40) {mFlash = true}
				// if any flash then BOTH must be true: replace hash with fake
				if (pFlash == true && mFlash == false) {
					pValue = "fake"
					dom.plugins.innerHTML = "fake"+ rfp_red
				}
				if (pFlash == false && mFlash == true) {
					mValue = "fake"
					dom.mimeTypes.innerHTML = "fake"+ rfp_red
				}
			}
			log_perf("mimetypes/plugins [devices]",t0)
			return resolve(["plugins:"+ pValue, "mimeTypes:"+ mValue])
		})
	})
}

function get_mm_hover(type){
	let x=zNS, h="hover", n="none", q="("+ type +":"
	try {
		if (window.matchMedia(q + n +")").matches) x=n
		if (window.matchMedia(q + h +")").matches) x=h
	} catch(e) {x = zB0}
	return x
}

function get_mm_pointer(type){
	let x=zNS, f="fine", c="coarse", n="none", q="("+ type +": "
	try {
		if (window.matchMedia(q + n +")").matches) x=n
		if (window.matchMedia(q + c +")").matches) x=c
		if (window.matchMedia(q + f +")").matches) x=f
	} catch(e) {x = zB0}
	return x
}

function get_plugins() {
	return new Promise(resolve => {
		let sName = "devices_plugins"
		clearDetail(sName)
		clearDetail(sName +"_fake")

		function display(output) {
			let btn = ""
			if (Array.isArray(output)) {
				sDetail[sName] = output
				let sBtn = output.length +" plugin"+ (output.length > 1 ? "s" : "")
				btn = buildButton("7", sName + (pluginBS ? "" : "_fake"), sBtn)
				output = sha1(output.join())
			}
			if (pluginBS) {output = "fake"}
			dom.plugins.innerHTML = output + btn + (output == "none" ? rfp_green : rfp_red)
			return resolve(output)
		}

		if (check_navKey("plugins")) {
			try {
				let p = navigator.plugins
				if (p.length) {
					let res = []
					for (let i=0; i < p.length; i++) {
						res.push(p[i].name + (p[i].filename == "" ? ": * " : ": "+ p[i].filename)
							+ (p[i].description == "" ? ": *" : ": "+ p[i].description))
					}
					res.sort()
					// FF
					if (isFF) {
						// reset
						pluginBS = false
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
							}
						}
					}
					display(res)
				} else {
					display("none")
				}
			} catch(e) {
				display(zB0, false)
			}
		} else {
			display(zD, false)
		}
	})
}

function get_pointer_hover() {
	return new Promise(resolve => {
		let res = []
		// pointer event
		let r1 = (window.PointerEvent == "undefined" ? zD : zE)
		dom.pointer = r1
		res.push("pointer_event:"+ r1)

		// FF64: pointer/hover
		let p = get_mm_pointer("any-pointer")+" | "+ get_mm_pointer("pointer")
		let h = get_mm_hover("any-hover")+" | "+ get_mm_hover("hover")
		res.push("any-pointer_pointer:"+ p)
		res.push("any-hover_hover:"+ p)

		// 1607316
		if (isVer > 73 && isOS == "android") {
			p += (p == "coarse | coarse" ? rfp_green : rfp_red)
			h += (h == "none | none" ? rfp_green : rfp_red)
		} else {
			let rfp = zNS +" | "+ zNS
			if (p !== rfp) {
				p += (p == "fine | fine" ? rfp_green : rfp_red)
			}
			if (h !== rfp) {
				h += (h == "hover | hover" ? rfp_green : rfp_red)
			}
		}
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
			if (isBraveFP) {gLiesKnown.push("devices:hardwareConcurrency")}
		}
		// section
		log_section("devices", t0, section)
	})
}

countJS("devices")
