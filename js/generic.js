'use strict';

/*** GENERIC FUNCTIONS ***/

const newFn = x => typeof x != 'string' ? x : new Function(x)()

function getUniqueElements() {
	const dom = document.getElementsByTagName('*')
	return new Proxy(dom, {
		get: function(obj, prop) {
			return obj[prop]
		},
		set: function(obj, prop, val) {
			obj[prop].textContent = `${val}`
			return true
		}
	})
}

function getElementProp(id, prop, pseudo) {
	try {
		let item = window.getComputedStyle(document.querySelector(id), pseudo)
		item = item.getPropertyValue(prop)
		if (item == "none") {item = "x"; console.warn(id, item)}
		item = item.replace(/"/g,"")
		if (!isNaN(item * 1)) {item = item * 1} // return numbers
		return item
	} catch(e) {
		console.error(id, e.name, e.message)
		return "x"
	}
}

function rnd_string() {
	return Math.random().toString(36).substring(2, 15)
}

function rnd_number() {
	return Math.floor((Math.random() * (99999-10000))+10000)
}

function count_decimals(value) {
	if(Math.floor(value) === value) return 0
	return value.toString().split(".")[1].length || 0
}

function sha1(str1) {
	for (var blockstart=0,
		i = 0,
		W = [],
		H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0],
		A, B, C, D, F, G,
		word_array = [],
		temp2,
		s = unescape(encodeURI(str1)),
		str_len = s.length;
		i<=str_len;){
		word_array[i>>2] |= (s.charCodeAt(i)||128)<<(8*(3-i++%4));
	}
	word_array[temp2 = ((str_len+8)>>6<<4)+15] = str_len<<3;
	for (; blockstart <= temp2; blockstart += 16) {
		A = H,i=0;
		for (; i < 80;
			A = [[
				(G = ((s=A[0])<<5|s>>>27) + A[4] + (W[i] = (i<16) ? ~~word_array[blockstart + i] : G<<1|G>>>31) + 1518500249) + ((B=A[1]) & (C=A[2]) | ~B & (D=A[3])),
				F = G + (B ^ C ^ D) + 341275144,
				G + (B & C | B & D | C & D) + 882459459,
				F + 1535694389
			][0|i++/20] | 0, s, B<<30|B>>>2, C, D]
		) {
			G = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
		}
		for(i=5;i;) H[--i] = H[i] + A[i] | 0;
	}
	for(str1='';i<40;)str1 += (H[i>>3] >> (7-i++%8)*4 & 15).toString(16);
	return str1
}

async function sha256(str) {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str))
	return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+ x.toString(16)).slice(-2))).join('')
}

const promiseRaceFulfilled = async ({
	promise,
	responseType, // the promise response type
	limit = 1000 // default ms to fulfill
}) => {
	// set up promise race
	const slowPromise = new Promise(resolve => setTimeout(resolve, limit))
	// await promise race status
	const response = await Promise.race([slowPromise, promise]) // fastest will win 
		.then(response => response instanceof responseType ? response : 'pending')
		.catch(error => 'rejected')
	return (
		response == 'rejected' || response == 'pending' ? undefined : response
	)
}

/*** CHECK FUNCTIONS ***/

function check_navKey(property) {
	if (navKeys["trueKeys"]) {
		return navKeys["trueKeys"].includes(property)
	} else {
		console.error(property, false, "navKeys not populated")
		return false
	}
}

const get_navKeys = () => new Promise(resolve => {
	// reset
	navKeys = {}
	// build
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		let trueKeys = keys
		let lastKeyIndex = keys.length
		let fakeKeys = []
		if (isFF) {
			// constructor is always last
			lastKeyIndex = keys.indexOf("constructor")
			trueKeys = keys.slice(0, lastKeyIndex+1)
			fakeKeys = keys.slice(lastKeyIndex+1)
		} else if (isEngine == "blink") {
			// last key inconsistent
			let knownPoison = ["SharedWorker","Worker","buildID","getVRDisplays","activeVRDisplays","oscpu"]
			trueKeys = keys.filter(x => !knownPoison.includes(x))
			fakeKeys = keys.filter(x => knownPoison.includes(x))
		}
		// remove constructor
		trueKeys = trueKeys.filter(x => !["constructor"].includes(x))
		// set
		navKeys["trueKeys"] = trueKeys
		navKeys["fakeKeys"] = fakeKeys
		// set brave
		isBraveMode = "unknown"
		if (check_navKey("brave")) {
			isBrave = true
			Promise.all([
				get_isBraveMode(),
			]).then(function(results){
				isBraveMode = results[0]
				return resolve()
			})
		} else {
			return resolve()
		}
	} catch(e) {
		console.error("get_navKeys", e.name, e.message)
		return resolve()
	}
})

function getDynamicIframeWindow({
	context,
	source = "",
	test = "",
	contentWindow = false,
	nestIframeInContainerDiv = false,
	violateSameOriginPolicy = true,
	display = false
}) {
	const elementName = nestIframeInContainerDiv ? 'div' : 'iframe'
	const length = context.length
	const element = document.createElement(elementName)
	document.body.appendChild(element)
	if (!display) {
		element.setAttribute('style', 'display:none')
	}
	if (nestIframeInContainerDiv) {
	const attributes = `
		${source ? `src=${source}` : ''}
			${violateSameOriginPolicy ? '' : `sandbox="allow-same-origin"`}
		`
		element.innerHTML = `<iframe ${attributes}></iframe>`
	} else if (!violateSameOriginPolicy) {
		element.setAttribute('sandbox', 'allow-same-origin')
		if (source) {
			element.setAttribute('src', source)
		}
	} else if (source) {
		element.setAttribute('src', source)
	}
	const iframeWindow = contentWindow ? element.contentWindow : context[length]

	let res = []
	let navigator = iframeWindow.navigator

	if (test == "ua") {
		let list = ['userAgent','appCodeName','appName','product','appVersion',
			'oscpu','platform','buildID','productSub','vendor','vendorSub'],
			r = ""
		for (let i=0; i < list.length; i++) {
			try {r = navigator[list[i]]} catch(e) {r = zB0}
			if (r == "") {r = "empty string"}
			if (r == "undefined") {r = "undefined string"}
			if (r == undefined) {r = "undefined value"}
			res.push(list[i] +":"+ r)
		}
		res.sort()
	}
	document.body.removeChild(element)
	return res
}

/** GENERAL CLICK FUNCTIONS **/

function copyclip(element) {
	// fallback: e.g FF62-
	function copyExec() {
		if (element == "ug10") {element = "ugcopy"}
		if (document.selection) {
			let range = document.body.createTextRange()
			range.moveToElementText(document.getElementById(element))
			range.select().createTextRange()
			document.execCommand("copy")
		} else if (window.getSelection) {
			let range = document.createRange()
			range.selectNode(document.getElementById(element))
			window.getSelection().addRange(range)
			document.execCommand("copy")
		}
	}
	// clipboard API
	if (check_navKey("clipboard")) {
		try {
			let content = document.getElementById(element).innerHTML
			// remove spans, change linebreaks
			let regex = /<br\s*[\/]?>/gi
			content = content.replace(regex, "\r\n")
			content = content.replace(/<\/?span[^>]*>/g,"")
			// get it
			navigator.clipboard.writeText(content).then(function() {
			}, function() {
				// clipboard write failed
				copyExec()
			})
		} catch(e) {
			copyExec()
		}
	} else {
		copyExec()
	}
}

function showhide(togType, togID, togWord) {
	var xyz = document.getElementsByClassName("tog"+ togID);
	var abc;
	for (abc = 0; abc < xyz.length; abc++) { xyz[abc].style.display = togType;}
	// change label
	if (togWord !== "") {
		let sText = "details"
		if (togID == "F1") {sText = "fonts"}
		if (togID == "F3") {sText = "textmetrics"}
		if (togID == "F4") {sText = "unicode glyphs"}
		if (togID == "Z") {sText = "perf & debugging"}
		document.getElementById("label"+ togID).innerHTML = togWord +" "+ sText
	}
	// errors
	if (togID == "E") {
		if (dom.err5.textContent.length > 1) {
			dom.togE5.style.display = "table=row"
		} else {
			dom.togE5.style.display = "none"
		}
	}
	// domrect show/hide extra sections & change drFirstHeader text
	if (togID == "D") {
		let drArray = [dom.dr0.innerHTML, dom.dr1.innerHTML, dom.dr2.innerHTML, dom.dr3.innerHTML]
		let xyz = document.getElementsByClassName("togD1"); let abc
		if (drArray.every( (val, i, arr) => val === arr[0] )) {
			// hide last three
			dom.drFirstHeader.innerHTML = "Element.getClientRects [the other three methods are identical]"
			for (abc = 0; abc < xyz.length; abc++) { xyz[abc].style.display = "none"}
		} else {
			// display last three
			dom.drFirstHeader.innerHTML = "Element.getClientRects"
			for (abc = 0; abc < xyz.length; abc++) { xyz[abc].style.display = togType;}
		}
	}
	// fonts
	if (togID == "F1") {
		let fontA = dom.fontLabel.textContent
		let fontB = dom.fontFBlabel.textContent
		if (fontB == "") {fontB = fontA}
		if (fontA == fontB) {
			// same: hide 2nd
			dom.fontB1.style.display = "none"
			dom.fontB2.style.display = "none"
		} else {
			// diff: show both
			dom.fontB1.style.display = togType
			dom.fontB2.style.display = togType
		}
	}
}

function toggleitems(chkbxState, chkbxID) {
	if (chkbxState.checked) {
		if (chkbxID=="D") {stateDR = false}
		if (chkbxID=="F1") {stateFNT = false}
		showhide("none",chkbxID,"&#9660; show")
	} else {
		if (chkbxID=="D") {stateDR = true}
		if (chkbxID=="F1") {stateFNT = true}
		showhide("table-row",chkbxID,"&#9650; hide")
	}
}

/** DISPLAY CLICK FUNCTIONS **/

function showDetail(name) {
	let data = sDetail[name],
		hash = sha1(data.join())
	// split+tidy name
	name = name.replace(/\_skip/g, "")
	name = name.replace(/\_/g, " ")
	let n = name.indexOf(" "),
		section = name.substring(0,n).toUpperCase(),
		metric = name.substring(n,name.length).trim()
	console.debug(section +": "+ metric +": "+ hash, data)
}

function showMetrics(type) {
	if (type == "gDetail") {
		for (let name in gDetail) {
			let data = gDetail[name],
				hash = sha1(data.join())
			// split+tidy name
			name = name.replace(/\_skip/g, "")
			name = name.replace(/\_/g, " ")
			let n = name.indexOf(" "),
				section = name.substring(0,n).toUpperCase(),
				metric = name.substring(n,name.length).trim()
			console.debug(section +": "+ metric +": "+ hash, data)
		}
	} else if  (type == "gLiesKnownDetail") {
		for (let name in gLiesKnownDetail) {
			let data = gLiesKnownDetail[name]
			// split+tidy name
			name = name.replace(/\_skip/g, "")
			name = name.replace(/\_/g, " ")
			let n = name.indexOf(" "),
				section = name.substring(0,n).toUpperCase(),
				metric = name.substring(n,name.length).trim()
			console.debug(section +": "+ metric, data)
		}
	} else if (type == "gPerfDetail") {
		console.log("perf detail: global\n"+ gPerfDetail.join("\n"))
	} else if (type == "sPerfDetail") {
		if (sPerfDetail.length) {
			console.log("perf detail: section re-runs\n"+ sPerfDetail.join("\n"))
		}
	} else {
		let array = [],
			showhash = true
		if (type == "known lies") {
			array = gLiesKnown
		} else if (type == "fingerprint") {
			array = gData
		} else if (type == "prototype lies") {
			array = gLies
		} else if (type == "prototype lies: details") {
			array = gLiesDetail
			showhash = false
		} else {
			// section
			array = sData[type]
		}
		console.log(type +": "+ (showhash ? sha1(array.join()) : ""), array)
		if (type == "known lies" && gLiesBypassed.length) {
			console.log("lies (hopefully) bypassed", gLiesBypassed)
		}
	}
}

/*** HANDLE INCOMING RUN DATA ***/
/*** sections, reruns, click here, global vs perf, hashes, debug + perf table ***/

function buildButton(colorCode, arrayName, displayText, functionName, btnType) {
	if (functionName == undefined) {functionName = "showDetail"}
	if (btnType == undefined) {btnType = "btnc"}
	return " <span class='btn"+ colorCode +" "+ btnType +"' onClick='"
		+ functionName +"(`"+ arrayName +"`)'>["+ displayText +"]</span>"
}

function clearDetail(name) {
	try {
		sDetail[name] = []
	} catch(e) {}
}

function log_click(name, time) {
	// click here doesn't record via log_section
	let output = Math.round(performance.now() - time).toString()
	output = name.padStart(14) +": "+ sn + output.padStart(4) + sc +" ms"
	log_debug("perfS", output)
}

function log_debug(target, output) {
	// add line items to perf/debug table
	let el = document.getElementById(target)
	el.innerHTML = el.innerHTML + (el.innerText.length > 2 ? "<br>" : "") + output
}

function log_line(str) {
	let output = str
	if (str == "line") {
		output = "-".repeat(20)
		output = output.padStart(31)
	}
	if (gRun) {
		gPerfDetail.push(output)
	} else {
		sPerfDetail.push(output)
	}
}

function log_perf(str, time1, time2, extra) {
	let t0 = performance.now(),
		output = ""
	if (isNaN(time1)){
		output = str.padStart(30) +": "+ (time1).padStart(7)
	} else {
		time1 = Math.round(t0 - time1).toString()
		output = str.padStart(30) +": "+ time1.padStart(4) +" ms"
	}
	if (time2 == "ignore") {
		time2 = ""
	} else if (time2 == "") {
		output += " | "+ ("n/a").padStart(7)
	} else {
		time2 = Math.round(t0 - gt0).toString()
		output += " | "+ time2.padStart(4) +" ms"
	}
	if (extra !== undefined && extra !== "") {
		output += " | "+ extra
	}
	if (gRun) {
		gPerfDetail.push(output)
	} else {
		sPerfDetail.push(output)
	}
}

function log_section(name, time1, data) {
	let t0 = performance.now()
	time1 = Math.round(t0-time1).toString()

	// DATA
	if (Array.isArray(data)) {
		data.sort()
		let hash = sha1(data.join())
		// SANITY
		if (data.length == 0) {
			gCheck.push(name +": data array is empty")
		} else {
			for (let i=0; i < data.length; i++) {
				let check = data[i]
				if (check == undefined) {
					gCheck.push(name +": contains undefined")
				} else {
					let parts = data[i].split(":")
					let metric = parts[0]
					let value = parts.slice(1).join(":")
					if (value == "") {
						gCheck.push(name +" - "+ metric +": not set")
					} else if (value == undefined) {
						gCheck.push(name +" - "+ metric +": undefined")
					}
				}
			}
		}

		// SECTION
		sData[name] = data
		let sHash = hash + buildButton("0", name, data.length +" metric"+ (data.length > 1 ? "s" : ""), "showMetrics", "btns")
		if (name == "ua") {sHash += (isFF ? " [spoofable + detectable]" : "")}
		if (name == "feature") {sHash += (isFF ? " [unspoofable?]" : "")}
		if (name == "screen") {sHash += " [incomplete]"}
		document.getElementById(name +"hash").innerHTML = sHash
		document.getElementById("perf"+ name).innerHTML = " "+ time1 +" ms"

		// GLOBAL
		if (gRun) {
			gCount++
			gData.push([name +":"+ hash, data])
			// FINISH
			if (gCount == 14) {
				// metric count
				let metricCount = 0
				for (let i=0; i < gData.length; i++) {
					metricCount += gData[i][1].length
				}
				// details: reset, add ordered non-empty non-skip-data
				gDetail = {}
				gLiesKnownDetail = {}
				const names = Object.keys(sDetail).sort()
				for (const k of names) if (sDetail[k].length) {
					if (k.indexOf("skip") == -1) {gDetail[k] = sDetail[k]} else {gLiesKnownDetail[k] = sDetail[k]}
				}
				// lies: de-dupe/sort
				let lieBtn = ""
				if (Object.keys(gLiesKnownDetail).length) {
					lieBtn = buildButton("0", "gLiesKnownDetail", "details", "showMetrics")
				}
				if (gLiesKnown.length) {
					gLiesKnown = gLiesKnown.filter(function(item, position) {return gLiesKnown.indexOf(item) === position})
					gLiesKnown.sort()
					gLiesBypassed.sort()
					let lieStr = gLiesKnown.length +" lie"+ (gLiesKnown.length > 1 ? "s" : "")
						+ (gLiesBypassed.length ? " | "+ gLiesBypassed.length +" bypassed" : "")
					dom.knownhash.innerHTML = sha1(gLiesKnown.join())
						+ buildButton("0", "known lies", lieStr, "showMetrics")
						+ lieBtn
				} else {
					dom.knownhash = "none" + lieBtn
				}
				// display
				gData.sort()
				dom.allhash.innerHTML = sha1(gData.join())
					+ buildButton("0", "fingerprint", metricCount +" metric"+ (data.length > 1 ? "s" : ""), "showMetrics")
					+ buildButton("0", "gDetail", "details", "showMetrics")
				dom.perfall = " "+ Math.round(performance.now() - gt0) +" ms"
				// sanity
				if (gCheck.length) {
					gCheck = gCheck.filter(function(item, position) {return gCheck.indexOf(item) === position})
					gCheck.sort()
					if (isFile) {
						console.error("section hash issues\n", gCheck)
					}
				}
			}
		}
	} else {}	// !ARRAY

	// PERF
	let el = dom.perfG
	let pretty = name.padStart(14) +": "+ sn + time1.padStart(4) + sc +" ms"

	if (gRun) {
		let time2 = Math.round(t0-gt0).toString()
		pretty += " | "+ so + time2.padStart(4) + sc +" ms"
		gPerf.push(pretty)
		if (gCount == 14) {
			el.innerHTML = gPerf.join("<br>")
		}
	} else {
		if (name !== "prereq") {
			el = dom.perfS
			el.innerHTML = el.innerHTML + (el.innerText.length > 2 ? "<br>" : "") + pretty
		}
	}
}

/*** RUN IT FUNCTIONS ***/

function countJS(filename) {
	jsFiles.push(filename)
	if (jsFiles.length == 13) {
		// harden isFF
		log_line(Math.round(performance.now()) + " : RUN ONCE")
		Promise.all([
			get_isError(),
			get_isSystemFont(),
		]).then(function(){
			// uses isFF
			let t0 = performance.now()
			Promise.all([
				get_isEngine(),
				get_isOS(),
				get_isVer(),
				get_isTB(),
			]).then(function(results){
				if (results[3] == "timeout") {
					log_perf("isTB [global]",t0,"",isTB+ " [timeout]")
				}
				outputSection("load")
			})
		})
	}
}

function outputSection(id, cls) {
	if (cls == undefined || cls == "") {cls = "c"}
	let delay = 100

	if (id == "load") {
		// skip clear/reset
		id = "all"
		gRun = true
		delay = 1
	} else if (id == "all") {
		gRun = true
		// clear/reset
		let items = document.getElementsByClassName("c")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		items = document.getElementsByClassName("gc")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		// hide font fallback rows
		dom.fontFBlabel = ""
		items = document.getElementsByClassName("togF2")
		for (let i=0; i < items.length; i++) {items[i].style.display = "none"}
		// reset global
		gCount = 0
		gData = []
		gCheck = []
		gDetail = {}
		gLiesBypassed = []
		gLiesKnown = []
		gLiesKnownDetail = {}
		// reset section/current
		protoLies = []
		sData = {}
		sDetail = {}
		// reset perf
		gPerf = []
		gPerfDetail = []
		sPerfDetail = []
		dom.perfG = ""
		dom.perfS = ""
	} else {
		// clear: &nbsp stops line height jitter
		let tbl = document.getElementById("tb"+ id)
		tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
		gRun = false
	}

	// hide stuff so it doesn't shrink/grow
	if (id=="all" || id=="1") {dom.kbt.value = ""}
	if (id=="all" || id=="3") {dom.wid0.style.color = zhide}
	if (id=="all" || id=="8") {reset_domrect()}
	if (id=="11" && cls=="c2") {reset_audio2()}
	if (id=="all" || id=="12") {reset_fonts()}
	if (id=="18") {dom.mathmltest.style.color = zhide}

	function output() {
		// section timer
		if (!gRun) {gt0 = performance.now()}
		// section only
		if (id=="1") {outputScreen("screen")}
		if (id=="2") {outputUA()}
		if (id=="3") {outputFD()}
		if (id=="11" && cls=="c") {outputAudio1()}
		if (id=="11" && cls=="c2") {outputAudio2()}
		// combine 1,2,3
		if (id=="all") {outputStart()}
		// stagger
		setTimeout(function() {if (id=="all" || id=="7") {outputDevices()}}, 1) // do next
		setTimeout(function() {if (id=="all" || id=="5") {outputHeaders()}}, 1)
		setTimeout(function() {if (id=="all" || id=="8") {outputDomRect()}}, 1)
		setTimeout(function() {if (id=="all" || id=="4") {outputLanguage()}}, 1)
		setTimeout(function() {if (id=="all" || id=="6") {outputStorage()}}, 1)
		setTimeout(function() {if (id=="all" || id=="14") {outputCSS()}}, 1)
		setTimeout(function() {if (id=="all" || id=="18") {outputMisc()}}, 1)
		setTimeout(function() {if (id=="all" || id=="13") {outputMedia()}}, 1)
		setTimeout(function() {if (id=="all" || id=="12") {outputFonts()}}, 1)
		setTimeout(function() {if (id=="all" || id=="10") {outputWebGL()}}, 1)
		setTimeout(function() {if (id=="all" || id=="9") {outputCanvas()}}, 1) // call last
		setTimeout(function() {if (id=="all") {outputAudio1("load")}}, 1)
	}

	if (gRun) {
		if (delay == 1) {log_line(Math.round(performance.now()) + " : START")}
	} else {
		// section
		const aNames = ['screen','x','fd','x','x','x','devices','x',
			'canvas','webgl','x','fonts','media','css','x','x','x','x']
		const aNumber = (id * 1) - 1
		let sectionName = aNames[aNumber]
		if (sectionName !== "x" && sPerfDetail.length) {
			log_line("line")
		}
	}
	setTimeout(function() {
		gt0 = performance.now()
		Promise.all([
			get_isRFP(),
			get_navKeys(),
			outputPrototypeLies(),
		]).then(function(results){
			output()
		})
	}, delay)
}

function run_once() {
	// ASAP
	log_line(Math.round(performance.now()) + " : GENERIC")
	if ((location.protocol) == "file:") {isFile = true; note_file = " [file:/]"}
	if ((location.protocol) == "https:") {isSecure = true}
	// isFF
	let t0 = performance.now()
	const isFFsum = ("undefined" != typeof InstallTrigger ? true : false)
		+ ("InstallTrigger" in window ? true : false)
		+ (typeof InstallTriggerImpl !== "undefined" ? true : false)
	if (isFFsum) {
		isFF = true
	} else {
		runS = false // simulation
	}
	log_perf("installtrigger [isFF]",t0,"",""+ isFF)
	// WARM
	try {
		navigator.mediaDevices.enumerateDevices().then(function(devices) {})
	} catch(e) {}
	try {
		let v = speechSynthesis.getVoices()
	} catch(e) {}
}

run_once()
