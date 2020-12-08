'use strict';

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
			if (r == 0) {r = true}
		} catch(e) {}
	}
	return r
}

function count_decimals(value) {
	if(Math.floor(value) === value) return 0
	return value.toString().split(".")[1].length || 0
}

function section_click(name, time1) {
	// adds [click here] perf to debugging table
	let el = dom.debugperf
	time1 = Math.round(performance.now() - time1).toString()
	let pretty = name.padStart(14) + ": " + sn + time1.padStart(4) + sc + " ms"
	el.innerHTML = el.innerHTML +"<br>"+ pretty
}

function section_info(name, time1, data) {
	// fp
	if (data !== undefined && data !== "") {
		data.sort()
		let hash = sha1(data.join())
		// checks: everything should be a "metric: value"
		for (let i=0; i < data.length; i++) {
			let check = data[i]
			if (check == undefined) {
				fpAllCheck.push(name +": contains undefined")
			} else {
				let parts = data[i].split(":")
				let metric = parts[0]
				let value = parts.slice(1).join(":")
				if (value == "") {
					fpAllCheck.push(name +" - " + metric + ": not set")
				} else if (value == undefined) {
					fpAllCheck.push(name +" - " + metric + ": undefined")
				}
			}
		}
		// check its not empty
		if (data.length == 0) {
			fpAllCheck.push(name +": data array is empty")
		}
		// store
		if (sRerun && gRerun == false) {
			console.log(name + ":" + hash +"\n", data)
		} else {
			// yay!
			fpAllHash.push(name + ":" + hash)
			fpAllCount += data.length
			// pretty name
			let pname = name
			if (pname == "ua") {pname = "user agent"}
			if (pname == "feature") {pname += " detection"}
			if (pname == "storage") {pname = "cookies & storage"}
			fpAllData.push([pname +":" + hash, data])
			if (fpAllHash.length == 13) {
				fpAllHash.sort()
				fpAllData.sort()
				let hash2 = sha1(fpAllHash.join())
				if (fpAllCheck.length > 0) {
					fpAllCheck.sort()
					// remove dupes: we only need one
					fpAllCheck = fpAllCheck.filter(function(item, position) {return fpAllCheck.indexOf(item) === position})
					// ToDo: remove isFile check once all section hashes are finished
					if (isFile) {
						console.error("section hash issues\n", fpAllCheck)
					}
				}
				console.log("fingerprint: "+ hash2 +" ["+ fpAllCount +" metrics]\n", fpAllData)
				dom.allhash = hash2
				dom.allmetrics.innerHTML = "<u>["+ fpAllCount +" metrics]</u>" + sc + " [incomplete]"
				dom.perfall = "  "+ Math.round(performance.now() - gt0) + " ms"
			}
		}
		// append + output
		try {
			//add metric count
			hash += snc +"<b>["+ data.length +" metric" + (data.length > 1 ? "s" : "") +"]</b>"+ sc
			if (name == "ua") {hash += (isFF ? " [spoofable + detectable]" : "")}
			if (name == "feature") {hash += (isFF ? " [unspoofable?]" : "")}
			if (name == "screen" || name == "devices") {
				hash += " [incomplete: work in progress]"
			}
			document.getElementById(name + "hash").innerHTML = hash
		} catch(e) {
			console.debug(name, e.name, e.message)
		}
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
	if (name == "setup") {
		el.innerHTML = pretty
	} else {
		el.innerHTML = el.innerHTML +"<br>"+ pretty
	}
}

function showMetrics(type) {
	let array = [],
		checks = [],
		output = [],
		mlength = 0,
		mPad = 30 // longest metric is currently 27
	if (type == "loose") {array = fpAllData}

	for (let i = 0; i < array.length; i++) {
		let item = array[i]
		let sparts = item[0].split(":")
		let section = sparts[0]
		let shash = sparts.slice(1).join(":")
		output.push(section + ": " + shash)
		let data = item[1]
		for (let j = 0; j < data.length; j++) {
			let parts = data[j].split(":")
			let metric = parts[0]
			let value = parts.slice(1).join(":")
			// longest metric name length
			if (metric.length > mlength) {mlength = metric.length}
			// checks
			let ok = true, message = []
			if (metric.indexOf(" ") !== -1) {ok = false; message.push("metric-has-space")} // space
			if (value.substring(0, 1) == " ") {ok = false; message.push("lead-space")} // leading space
			if (value.substring(value.length-1, value.length) == " ") {ok = false; message.push("trail-space")} // trailing space
			if (ok == false) {
				checks.push(message.join() + ":~"+ metric +":"+ value +"~")
			}
			// build output: ToDo: pretty up
			output.push(metric.padStart(mPad) +": " + value)
		}
	}
	// checks
	if (isFile) {
		console.debug("longest metric name length", mlength)
		if (checks.length > 0) {
			checks.sort()
			console.debug(checks)
		}
		// debug
		console.debug(output.join("\n"))
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
	time1 = (t0-time1).toString()
	if (time2 == "ignore") {
		// ignore resize events
		time2 = ""
	} else {
		// else append acculumative time
		time2 = (t0-gt0).toString()
		time2 = " | " + time2.padStart(4) + " ms"
	}
	console.log(str.padStart(29) + ": "+ time1.padStart(4) + " ms" + time2)
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
		let fontA = dom.fontFPJS2label.textContent
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
	sRerun = true
	let delay = 170
	if (cls == undefined || cls == "") {cls = "c"}
	// clear everything
	if (id == "all") {
		delay = 10
		let items = document.getElementsByClassName("c")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		items = document.getElementsByClassName("gc")
		for (let i=0; i < items.length; i++) {items[i].innerHTML = "&nbsp"}
		// hide font fallback rows
		items = document.getElementsByClassName("togF1")
		for (let i=0; i < items.length; i++) {items[i].style.display = "none"}
		// reset global FP
		fpAllHash = []
		fpAllData = []
		fpAllCheck = []
		fpAllCount = 0
		gRerun = true
		sRerun = false
	} else {
		// clear table elements, &nbsp stops line height jitter
		let tbl = document.getElementById("tb"+id)
		tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
		gRerun = false
	}
	// clear details
	if (id=="all" || id=="1") {dom.kbt.value = ""}
	if (id=="7") {reset_devices()}
	if (id=="all" || id=="8") {reset_domrect()}
	if (id=="11" && cls=="c2") {reset_audio2()}
	if (id=="all" || id=="12") {reset_fonts()}
	if (id=="13") {reset_media()}
	if (id=="14") {reset_css()}
	if (id=="18") {reset_misc()}

	function output() {
		// reset timer
		gt0 = performance.now()
		// section only
		if (id=="1") {outputScreen("screen")}
		if (id=="2") {outputUA()}
		if (id=="3") {outputFD()}
		if (id=="11" && cls=="c") {outputAudio1()}
		if (id=="11" && cls=="c2") {outputAudio2()}

		// possible gRerun: delay/stagger, use same order as js loads
		if (id=="all") {outputStart()}
		setTimeout(function() {if (id=="all" || id=="5") {outputHeaders()}}, 1)
		setTimeout(function() {if (id=="all" || id=="4") {outputLanguage()}}, 1)
		setTimeout(function() {if (id=="all" || id=="6") {outputStorage()}}, 1)
		setTimeout(function() {if (id=="all" || id=="7") {outputDevices()}}, 1)
		setTimeout(function() {if (id=="all" || id=="8") {outputDomRect()}}, 1)
		setTimeout(function() {if (id=="all") {outputAudio1("load")}}, 1)
		setTimeout(function() {if (id=="all" || id=="14") {outputCSS()}}, 1)
		setTimeout(function() {if (id=="all" || id=="18") {outputMisc()}}, 1)
		setTimeout(function() {if (id=="all" || id=="13") {outputMedia()}}, 1)
		setTimeout(function() {if (id=="all" || id=="9") {outputCanvas()}}, 1)
		setTimeout(function() {if (id=="all" || id=="12") {outputFonts()}}, 1)
		setTimeout(function() {if (id=="all" || id=="10") {outputWebGL()}}, 1)
	}

	// wait so users see change
	setTimeout(function() {output()}, delay)

}
