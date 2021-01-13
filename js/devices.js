'use strict';

var pluginBS = false
var hasFlash = false

function reset_devices() {
	dom.mimeTypesList.style.color = zhide
	dom.pluginsList.style.color = zhide
	dom.eMDList.style.color = zhide
	dom.sEnginesList.style.color = zhide
}

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
		if (isBrave) {isBraveFP = true}
		pluginBS = true
	} else {
		pluginBS = false
	}
}


function get_gamepads() {
	return new Promise(resolve => {
		function display(output) {
			dom.gamepads.innerHTML = output
			return resolve("gamepads:" + output)
		}
		if ("getGamepads" in navigator) {display(zE)} else {display(zD)}
	})
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
	if (isBraveFP) {h = "fake"}
	dom.nHWC.innerHTML = h + (h == "2" ? rfp_green : rfp_red)
	return "hardwareConcurrency:" + h
}

function get_media_devices() {
	return new Promise(resolve => {
		let t0 = performance.now()

		function finish(result) {
			dom.eMDList.style.color = zshow
			if (logPerf) {debug_log("media devices [devices]",t0)}
			return resolve("media_devices:"+result)
		}
		if ("mediaDevices" in navigator) {
			// enumerate
			let str="", pad=13, strPad=""
			try {
				navigator.mediaDevices.enumerateDevices().then(function(devices) {
					let arr = []
					// enumerate
					devices.forEach(function(d) {
						arr.push(d.kind)
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
					// output list
					if (str.length == 0) {str = "none"}
					dom.eMDList.innerHTML = str

					// count each kind
					let pretty = [], plain = [], rfphash = ""
					if (arr.length > 0) {
						arr.sort()
						let map = arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
						arr = [...map.entries()]
						// build pretty/plain
						for (let i=0; i < arr.length; i++) {
							let data = arr[i],
								item = data[0],
								itemcount = data[1]
							pretty.push(item + s7 +"["+ itemcount +"]" + sc)
							plain.push(item +","+ itemcount)
						}
						pretty = pretty.join(" ")
						str = plain.join(";")
						rfphash = sha1(str)
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
				.catch(function(e) {
					dom.eMDList.innerHTML = e.name +": "+ e.message
					dom.eMD.innerHTML = e.name
					finish(e.name)
				})
			} catch(e) {
				dom.eMDList.innerHTML = zB0
				dom.eMD.innerHTML = zB0 + (isTB ? tb_red : rfp_red)
				finish(zB0)
			}
		}	else {
			dom.eMDList = zD
			dom.eMD.innerHTML = zD + (isTB ? tb_green : rfp_red)
			finish(zD)
		}
	})
}

function get_mimetypes() {
	return new Promise(resolve => {
		let t0 = performance.now()
		var mimeBS = false

		function display(output) {
			let detail = output, count = ""
			if (Array.isArray(output)) {
				count = s7 +"["+ output.length +"]"+ sc
				detail = output.join("<br>")
				output = sha1(output.join())
			}
			if (mimeBS) {output = "fake"; count = ""}
			dom.mimeTypes.innerHTML = output + count + (output == "none" ? rfp_green : rfp_red)
			dom.mimeTypesList.innerHTML = detail
			dom.mimeTypesList.style.color = zshow
			if (logPerf) {debug_log("mimeTypes [devices]",t0)}
			return resolve("mimeTypes:" + output)
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
					res.sort()
					// ToDo: FF: mimeBS
						// hasFlash: set in plugins test
						// can FF52+ have mimetypes other than flash?
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
		let t0 = performance.now()

		function display(output) {
			let detail = output, count = ""
			if (Array.isArray(output)) {
				count = s7 +"["+ output.length +"]"+ sc
				detail = output.join("<br>")
				output = sha1(output.join())
			}
			if (pluginBS) {output = "fake"; count = ""}
			dom.plugins.innerHTML = output + count + (output == "none" ? rfp_green : rfp_red)
			dom.pluginsList.innerHTML = detail
			dom.pluginsList.style.color = zshow
			if (logPerf) {debug_log("plugins [devices]",t0)}
			return resolve("plugins:" + output)
		}

		if ("plugins" in navigator) {
			try {
				let p = navigator.plugins
				if (p.length > 0) {
					let res = []
					for (let i=0; i < p.length; i++) {
						res.push(p[i].name + (p[i].filename == "" ? ": * " : ": " + p[i].filename)
							+ (p[i].description == "" ? ": *" : ": " + p[i].description))
					}
					res.sort()
					// FF
					if (isFF) {
						pluginBS = false
						hasFlash = false
						if (isVer > 84 && res.length > 0) {
							// FF85+: EOL Flash
							pluginBS = true
						} else if (res.length > 1) {
							// FF52+: Flash only
							pluginBS = true
						} else {
							// one item
							if (res[0].split(":")[0] == "Shockwave Flash") {
								hasFlash = true
							} else {
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
		res.push("pointer_event:"+r1)

		// FF64: pointer/hover
		let p = get_mm_pointer("any-pointer")+" | "+get_mm_pointer("pointer")
		let h = get_mm_hover("any-hover")+" | "+get_mm_hover("hover")
		res.push("any-pointer_pointer:"+p)
		res.push("any-hover_hover:"+p)

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
		return resolve(res)
	})
}

function get_speech_engines() {
	return new Promise(resolve => {
		let t0 = performance.now()

		// output & resolve
		function display(output) {
			let detail = output, count = ""
			if (Array.isArray(output)) {
				count = s7 +"["+ output.length +"]"+ sc
				detail = output.join("<br>")
				output = sha1(output.join())
			}
			dom.sEngines.innerHTML = output + count + (output == "none" ? rfp_green : rfp_red)
			dom.sEnginesList.innerHTML = detail
			dom.sEnginesList.style.color = zshow
			if (logPerf) {debug_log("speech engines [devices]",t0)}
			return resolve("speech_engines:" + output)
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
							res.push(v[i].name + " (" + v[i].lang + ")" + (v[i].default ? " : default" : ""))
						}
						// ToDo: why does it run multiple times and first pass is empty
							//      first page load: nothing, got some, got some
							// same tab page reload: nothing, got some
							//    new tab page load: nothing, got some
							//         global rerun: got some
							//        section rerun: got some
						if (res.length == 0) {
							//console.debug("got nothing")
							display("none")
						} else {
							//console.debug("got some", res)
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
	return new Promise(resolve => {
		function display(output) {
			dom.vrdisplays.innerHTML = output
			return resolve("vr:" + output)
		}
		if ("getVRDisplays" in navigator && "activeVRDisplays" in navigator) {
			try {display(zE)} catch(e) {display(zB0)}
		}	else {
			display(zD)
		}
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
	get_speech_engines()

	Promise.all([
		get_media_devices(),
		get_pointer_hover(),
		get_gamepads(),
		get_touch(),
		get_vr(),
		get_concurrency(),
		get_plugins(),
		get_mimetypes(),
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
		section_info("devices", t0, section)
	})
}

countJS("devices")
