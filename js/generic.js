'use strict';

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

function rnd_string(prefix) {
	return (prefix == undefined ? "" : prefix) + Math.random().toString(36).substring(2, 15)
}

function rnd_number() {
	return Math.floor((Math.random() * (99999-10000))+10000)
}

function check_navObject(property) {
	return !!Object.getOwnPropertyDescriptor(Navigator.prototype, property)
}

function get_RFP() {
	let r = false
	if (isFF) {
		try {
			performance.mark("a")
			r = performance.getEntriesByName("a","mark").length
				+ performance.getEntries().length
				+ performance.getEntries({name:"a", entryType:"mark"}).length
				+ performance.getEntriesByName("a","mark").length
				performance.clearMarks()
			if (r == 0) {r = true} else {r = false}
		} catch(e) {}
	}
	return r
}

function count_decimals(value) {
	if(Math.floor(value) === value) return 0
	return value.toString().split(".")[1].length || 0
}

function clickhere_perf(name, time1) {
	// adds [click here] perf to perf table
	let el = dom.debugperf
	time1 = Math.round(performance.now() - time1).toString()
	let pretty = name.padStart(14) + ": " + sn + time1.padStart(4) + sc + " ms"
	el.innerHTML = el.innerHTML +"<br>"+ pretty
}

function countJS(filename) {
	jsFiles.push(filename)

	// all js files have arrived
	if (jsFiles.length == 13) {

		//isFF = false // temp
		if (!isFF) {
			// isFF fallback B: -moz-dialog font (10ms)
			// isFF fallback C: errors: really obscure unique FF ones?
			// isFF fallback D: resource:// (slow AF)

			let t0 = performance.now()
			Promise.all([
				get_system_fonts("isFFcheck"),
			]).then(function(result){
				let go = true
				let check = result.join()
				if (check == "error") {
					go = false // we need to test more
					console.info("isFF fallback B: failed")
				} else {
					if (check !== "undefined") {
						isFF = true
						let t1 = performance.now()
						console.info("isFF fallback B: caught you lying!", Math.round(t1-t0) + "ms")
					}
				}
				if (go) {
					outputSection("load")
				} else {
					// ToDo: isFF fallback B
					outputSection("load")
				}
			})
		} else {
			outputSection("load")
		}
	}
}

function section_info(name, time1, data) {
	// fp
	if (Array.isArray(data)) {
		data.sort()
		let hash = sha1(data.join())
		// check its not empty
		if (data.length == 0) {
			globalCheck.push(name +": data array is empty")
		} else {
			// checks: everything should be a "metric: value"
			for (let i=0; i < data.length; i++) {
				let check = data[i]
				if (check == undefined) {
					globalCheck.push(name +": contains undefined")
				} else {
					let parts = data[i].split(":")
					let metric = parts[0]
					let value = parts.slice(1).join(":")
					if (value == "") {
						globalCheck.push(name +" - " + metric + ": not set")
					} else if (value == undefined) {
						globalCheck.push(name +" - " + metric + ": undefined")
					}
				}
			}
		}

		// remember each section's results seperately
			// e.g. a rerun can differ from the global stored result: e.g. zoom
		sectionData[name] = data

		// store in global if not a section rerun
		if (!sRerun) {
			// yay!
			globalHash.push(name + ":" + hash)
			globalCount += data.length
			globalData.push([name +":" + hash, data])

			if (globalHash.length == 14) {
				// reset
				globalDetail = {}
				// store detail data if not empty, in order
				const names = Object.keys(sectionDetail).sort()
				for (const k of names) if (sectionDetail[k].length) globalDetail[k] = sectionDetail[k]
				// perf
				if (logPerf) {
					console.log("logPerf detail\n" + perfData.join("\n"))
				}
				// lies
				if (liesKnown.length > 0) {
					// de-dupe, sort
					liesKnown = liesKnown.filter(function(item, position) {return liesKnown.indexOf(item) === position})
					liesKnown.sort()
					dom.knownhash.innerHTML = sha1(liesKnown.join())
						+ buildButton("0", "known", liesKnown.length + " lie" + (liesKnown.length > 1 ? "s" : ""), "showMetrics")
				} else {
					dom.knownhash = "none"
				}
				// FP
				globalHash.sort()
				globalData.sort()
				let hash2 = sha1(globalData.join())
				if (globalCheck.length > 0) {
					globalCheck.sort()
					// remove dupes: we only need one
					globalCheck = globalCheck.filter(function(item, position) {return globalCheck.indexOf(item) === position})
					// ToDo: remove isFile check once all section hashes are finished
					if (isFile) {
						console.error("section hash issues\n", globalCheck)
					}
				}
				hash2 += buildButton("0", "loose", globalCount +" metric"+ (data.length > 1 ? "s" : ""), "showMetrics")
				hash2 += buildButton("0", "globaldetail", "details", "showMetrics")
				dom.allhash.innerHTML = hash2
				dom.perfall = "  "+ Math.round(performance.now() - gt0) + " ms"
			}
		}

		// append + output section
		try {
			//add metric count
			hash += buildButton("0", name, data.length +" metric"+ (data.length > 1 ? "s" : ""), "showMetrics", "btns")
			if (name == "ua") {hash += (isFF ? " [spoofable + detectable]" : "")}
			if (name == "feature") {hash += (isFF ? " [unspoofable?]" : "")}
			if (name == "screen" || name == "devices") {
				hash += " [incomplete: work in progress]"
			}
			document.getElementById(name + "hash").innerHTML = hash
		} catch(e) {
			console.debug(name, e.name, e.message)
		}
	} else {
		// not an array: prototypeLies, setup
		//console.debug(name)
	}
	// perf
	let t0 = performance.now()
	time1 = Math.round(t0-time1).toString()

	try {
		document.getElementById("perf"+name).innerHTML = "  "+ time1 +" ms"
	} catch(e) {}

	// combined perf
	let el = dom.debugperf
	let pretty = name.padStart(14) + ": " + sn + time1.padStart(4) + sc + " ms"
	if (sRerun == false || gRerun == true) {
		let time2 = Math.round(t0-gt0).toString()
		pretty += " | " + so + time2.padStart(4) + sc + " ms"
	}
	if (name == "prototype") {
		el.innerHTML = pretty
	} else {
		el.innerHTML = el.innerHTML +"<br>"+ pretty
	}
}

function buildButton(colorCode, arrayName, displayText, functionName, btnType) {
	if (functionName == undefined) {functionName = "showDetail"}
	if (btnType == undefined) {btnType = "btnc"}
	return " <span class='btn" + colorCode + " " + btnType
		+ "' onClick='" + functionName +"(`"+ arrayName +"`)'>" +"["+ displayText +"]</span>"
}

function clearDetail(name) {
	try {
		sectionDetail[name] = []
	} catch(e) {}
}

function showDetail(name) {
	let data = sectionDetail[name]
	name = name.replace("_", ": ")
	name = name.replace(/\_/g, " ")
	console.debug(name + "\n", data)
}

function showMetrics(type) {
	if (type == "globaldetail") {
		for (let item in globalDetail) {
			console.log(item, globalDetail[item])
		}
	} else {
		let array = [],
			showhash = true
		if (type == "known") {
			type += " lies"
			array = liesKnown
		} else if (type == "loose") {
			type = "fingerprint: " + type
			array = globalData
		} else if (type == "prototype lies") {
			array = liesList
			showhash = false
		} else if (type == "prototype lie details") {
			array = liesDetail
			showhash = false
		} else {
			// section
			array = sectionData[type]
		}
		console.log(type + ": " + (showhash ? sha1(array.join()) : ""), array)
	}
}

function debug_page(target, str) {
	let el = document.getElementById("debug"+target)
	if (sRerun == false) {
		el.innerHTML = el.innerHTML + str + "<br>"
	}
}

function debug_log(str, time1, time2) {
	// log dev info
	let t0 = performance.now()
	time1 = Math.round(t0 - time1).toString()
	if (time2 == "ignore") {
		// ignore resize events
		time2 = ""
	} else {
		// else append acculumative time
		time2 = Math.round(t0 - gt0).toString()
		time2 = " | " + time2.padStart(4) + " ms"
	}
	// string
	let output = str.padStart(29) + ": "+ time1.padStart(4) + " ms" + time2
	// array or console
		// false false = load
		// true false = gRerun
	if (gRerun || (gRerun + sRerun == 0)) {
		perfData.push(output)
	} else {
		console.log(output)
	}
}

function showhide(togType, togID, togWord) {
	var xyz = document.getElementsByClassName("tog"+togID);
	var abc;
	for (abc = 0; abc < xyz.length; abc++) { xyz[abc].style.display = togType;}
	// change label
	if (togWord !== "") {
		let descript = "details"
		if (togID == "F1") {descript = "fonts"}
		if (togID == "F3") {descript = "textmetrics"}
		if (togID == "F4") {descript = "unicode glyphs"}
		if (togID == "Z") {descript = "debugging"}
		document.getElementById("label"+togID).innerHTML = togWord +" "+ descript
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
	// fonts show/hide if font fallback has been run + it differs
	if (togID == "F1") {
		let fontA = dom.fontLabel.textContent
		let fontB = dom.fontFBlabel.textContent
		if (fontB == "") {fontB = fontA}
		if (fontA == fontB) {
			// same: hide the second
			dom.fontB1.style.display = "none"
			dom.fontB2.style.display = "none"
		} else {
			// different: show both
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
	if (check_navObject("clipboard")) {
		try {
			let content = document.getElementById(element).innerHTML
			// remove spans, change linebreaks
			let regex = /<br\s*[\/]?>/gi
			content = content.replace(regex, "\r\n")
			content = content.replace(/<\/?span[^>]*>/g,"")
			// get it
			navigator.clipboard.writeText(content).then(function() {
				// clipboard successfully set
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

function sha1(str1){
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

async function sha256_str(str) {
	const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str))
	return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('')
}

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
			res.push(list[i]+":"+r)
		}
		res.sort()
	}
	document.body.removeChild(element)
	return res
}

/* BASE64 STUFF */
/* Base64 / binary data / UTF-8 strings utilities (#3)
	https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
	Author: madmurphy */
function btoaUTF16 (sString) {
	var aUTF16CodeUnits = new Uint16Array(sString.length);
	Array.prototype.forEach.call(aUTF16CodeUnits, function(el, idx, arr) { arr[idx] = sString.charCodeAt(idx); });
	return btoa(String.fromCharCode.apply(null, new Uint8Array(aUTF16CodeUnits.buffer)));
}
function atobUTF16 (sBase64) {
	var sBinaryString = atob(sBase64), aBinaryView = new Uint8Array(sBinaryString.length);
	Array.prototype.forEach.call(aBinaryView, function(el, idx, arr) { arr[idx] = sBinaryString.charCodeAt(idx); });
	return String.fromCharCode.apply(null, new Uint16Array(aBinaryView.buffer));
}
function byteArrayToHex(arrayBuffer){
	var chunks = [];
	(new Uint32Array(arrayBuffer)).forEach(function(num){
		chunks.push(num.toString(16));
	});
	return chunks.map(function(chunk){
		return "0".repeat(8 - chunk.length) + chunk;
	}).join("");
}

/* BUTTONS: (re)GENERATE SECTIONS */
function outputSection(id, cls) {

	if (cls == undefined || cls == "") {cls = "c"}
	sRerun = false
	// clear everything
	if (id == "all") {
		let items = document.getElementsByClassName("c")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		items = document.getElementsByClassName("gc")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		// hide font fallback rows
		dom.fontFBlabel = ""
		items = document.getElementsByClassName("togF2")
		for (let i=0; i < items.length; i++) {items[i].style.display = "none"}
		// reset global data
		globalHash = []
		globalData = []
		globalCheck = []
		globalCount = 0
		globalDetail = {}
		// reset section data
		sectionData = {}
		sectionDetail = {}
		// reset lies
		liesKnown = []
		liesList = []
		liesDetail = {}
		// reset perf array
		perfData = []
		gRerun = true
	} else if (id == "load") {
		gRerun = false // redundant
		id = "all"
	} else {
		// clear table elements, &nbsp stops line height jitter
		let tbl = document.getElementById("tb"+id)
		tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
		gRerun = false
		sRerun = true
	}
	// hide stuff rather than remove: so it doesn't shrink/grow = jumpy
	if (id=="all" || id=="1") {dom.kbt.value = ""}
	if (id=="all" || id=="3") {dom.wid0.style.color = zhide}
	if (id=="7") {reset_devices()}
	if (id=="all" || id=="8") {reset_domrect()}
	if (id=="11" && cls=="c2") {reset_audio2()}
	if (id=="all" || id=="12") {reset_fonts()}
	if (id=="18") {dom.mathmltest.style.color = zhide}

	function output() {
		// reset timer for sections only: otherwise it is set by prototypeLies
		if (sRerun) {gt0 = performance.now()}
		// section only
		if (id=="1") {outputScreen("screen")}
		if (id=="2") {outputUA()}
		if (id=="3") {outputFD()}
		if (id=="11" && cls=="c") {outputAudio1()}
		if (id=="11" && cls=="c2") {outputAudio2()}

		// first 3 sections: always run first as it sets global vars
		if (id=="all") {outputStart()}
		// possible gRerun: delay/stagger
		setTimeout(function() {if (id=="all" || id=="7") {outputDevices()}}, 1) // do next: don't let promise time out
		setTimeout(function() {if (id=="all" || id=="5") {outputHeaders()}}, 1)
		setTimeout(function() {if (id=="all" || id=="8") {outputDomRect()}}, 1)
		setTimeout(function() {if (id=="all" || id=="4") {outputLanguage()}}, 1)
		setTimeout(function() {if (id=="all" || id=="6") {outputStorage()}}, 1)
		setTimeout(function() {if (id=="all" || id=="14") {outputCSS()}}, 1)
		setTimeout(function() {if (id=="all" || id=="18") {outputMisc()}}, 1)
		setTimeout(function() {if (id=="all" || id=="13") {outputMedia()}}, 1)
		setTimeout(function() {if (id=="all" || id=="12") {outputFonts()}}, 1)
		setTimeout(function() {if (id=="all" || id=="10") {outputWebGL()}}, 1)
		setTimeout(function() {if (id=="all" || id=="9") {outputCanvas()}}, 1) // call last: toBlob
		setTimeout(function() {if (id=="all") {outputAudio1("load")}}, 1)
	}

	//console.debug("gRerun", gRerun, "sRerun", sRerun)
	// false, false = page load : delay 1
	// false, true  = section   : delay 170
	// true,  false = global    : delay 130 (prototype is about 30 or 40 ms)

	// wait so users see change
	if (sRerun) {
		// section
		setTimeout(function() {output()}, 170)
	} else {
		let delay = 130 // global reruns
		if (gRerun == false) {delay = 1} // page loads
		setTimeout(function() {
			// we need to make sure prototypeLies finishes
			Promise.all([
				outputPrototypeLies()
			]).then(function(){
				output()
			})
		}, delay)
	}
}

const promiseRaceFulfilled = async ({
    promise,
    responseType, // the promise response type
    limit = 1000 // default ms to fulfill
}) => {
    // set up promise race
    const slowPromise = new Promise(resolve => setTimeout(resolve, limit))
    // await promise race status
    const response = await Promise.race([slowPromise, promise]) // the fastest will win 
        .then(response => response instanceof responseType ? response : 'pending')
        .catch(error => 'rejected')
    return (
        response == 'rejected' || response == 'pending' ? undefined : response
    )
}

function run_once() {
	// lets get started while we wait for all the JS modules to arrive

	// immutable
	if ((location.protocol) == "file:") {isFile = true; note_file = " [file:/]"}
	if ((location.protocol) == "https:") {isSecure = true}

	// isFF
	let isFFsum = ("undefined" != typeof InstallTrigger ? true : false)
		+ ("InstallTrigger" in window ? true : false)
		+ (typeof InstallTriggerImpl !== "undefined" ? true : false)
	if (isFFsum > 0) {isFF = true}

	if (check_navObject("brave")) {isBrave = true}
	//warm up some JS functions
	try {
		navigator.mediaDevices.enumerateDevices().then(function(devices) {})
	} catch(e) {}
	try {
		let v = speechSynthesis.getVoices()
	} catch(e) {}

}

run_once()
