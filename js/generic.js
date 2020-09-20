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
	try {
		performance.mark("a")
		r = performance.getEntriesByName("a","mark").length
			+ performance.getEntries().length
			+ performance.getEntries({name:"a", entryType:"mark"}).length
			+ performance.getEntriesByName("a","mark").length
			performance.clearMarks()
		if (r == 0) {r = true}
	} catch(e) {}
	return r
}

function count_decimals(value) {
	if(Math.floor(value) === value) return 0
	return value.toString().split(".")[1].length || 0
}

function store_data(section, key, value) {
	//console.log(section.padStart(4),key.padStart(8),value)
	if (section == "ua") {
		fp_ua.push(key+":"+value)
		if (fp_ua.length == 5) {
			fp_ua.sort()
			//console.debug(fp_ua.join("\n"))
			dom.sectionUA9.innerHTML = sha1(fp_ua.join()) + s2+"[unspoofable?]"+sc
		}
	}
}

function debug_log(str, time1, time2) {
	// log dev info
	let t0 = performance.now()
	time1 = (t0-time1).toString()
	if (gRerun) {
		// manual
		if (time2 == undefined && time2 !== "" || time2 == "ignore") {
			time2 = ""
		} else {
			time2 = (t0-time2).toString()
			time2 = " | " + time2.padStart(4) + " ms"
		}
	} else {
		if (time2 == "ignore") {
			time2 = ""
		} else {
			// page load: use gt0
			time2 = (t0-gt0).toString()
			time2 = " | " + time2.padStart(4) + " ms"
		}
	}
	console.log(str.padStart(29) + ": "+ time1.padStart(4) + " ms" + time2)
}

function debug_page(target, str1, str2, str3, str4) {
	if (isPage == "main") {
		// vars
		let t0 = performance.now(),
			str="",
			e = document.getElementById("debug"+target)

		if (target == "perf") {
			let time1 = Math.round(t0-str2).toString()
			str = str1.padStart(12) + ": " + sn + time1.padStart(4) + sc + " ms"
			if (str3 !== undefined && str3 !== "") {
				// output running time if not a section rerun
				if (gRerun == false) {
					let time2 = Math.round(t0-str3).toString()
					str = str + " | " + so + time2.padStart(4) + sc + " ms"
				}
			}
			if (str4 !== undefined && str4 !== "") {
				// warning
				str += " |" + sb+ str4 + sc
			}
			e.innerHTML = e.innerHTML + "<br>" + str
			// display in section title
			try {
				document.getElementById("perf"+str1).innerHTML = "  "+ time1 +" ms"
			} catch(e) {}

		} else {
			if (gRerun == false) {
				str = str1
				e.innerHTML = e.innerHTML + str + "<br>"
			}
		}
	}
}

function showhide(togType, togID, togWord) {
	var xyz = document.getElementsByClassName("tog"+togID);
	var abc;
	for (abc = 0; abc < xyz.length; abc++) { xyz[abc].style.display = togType;}
	// change label
	if (togWord !== "") {
		if (togID == "Z") {
			document.getElementById("label"+togID).innerHTML = togWord+" debugging"
		} else if (togID == "L2") {
			document.getElementById("label"+togID).innerHTML = togWord+" application language tests"
		} else {
			document.getElementById("label"+togID).innerHTML = togWord+" details"
		}
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
	// font lists show/hide if same hash or not, and change label text
	if (togID == "F") {
		if (isPage == "main") {
			let fontA = dom.small_fontFPJS2.innerHTML
			let fontB = dom.small_fontFB.innerHTML
			if (fontA == fontB) {
				// same: hide the second
				dom.small_fontlabel = "whitelist"
				dom.fontB1.style.display = "none"
				dom.fontB2.style.display = "none"
			} else {
				// different: show both
				dom.small_fontlabel = "fingerprintjs2 [whitelist]"
				dom.fontB1.style.display = togType
				dom.fontB2.style.display = togType
			}
			let fontC = dom.all_fontFPJS2.innerHTML
			let fontD = dom.all_fontFB.innerHTML
			if (fontC == fontD) {
				// same: hide the second
				dom.all_fontlabel = "os";
				dom.fontD1.style.display = "none"
				dom.fontD2.style.display = "none"
			} else {
				// different: show both
				dom.all_fontlabel = "fingerprintjs2 [os]"
				dom.fontD1.style.display = togType
				dom.fontD2.style.display = togType
			}
		} else if (isPage == "extra") {
			let fontE = dom.monsta_fontFPJS2.innerHTML
			let fontF = dom.monsta_fontFB.innerHTML
			if (fontE == fontF) {
				// same: hide the second
				dom.monsta_fontlabel = "monsta"
				dom.fontF1.style.display = "none"
				dom.fontF2.style.display = "none"
			} else {
				// different: show both
				dom.monsta_fontlabel = "fingerprintjs2 [monsta]"
				dom.fontF1.style.display = togType
				dom.fontF2.style.display = togType
			}
		}
	}
}

function toggleitems(chkbxState, chkbxID) {
	if (chkbxState.checked) {
		if (chkbxID=="D") {stateDR = false}
		if (chkbxID=="F") {stateFNT = false}
		showhide("none",chkbxID,"&#9660; show")
	} else {
		if (chkbxID=="D") {stateDR = true}
		if (chkbxID=="F") {stateFNT = true}
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
function outputSection(id, cls, page) {
	gRerun = true
	// clear elements, &nbsp stops line height jitter
	let tbl = document.getElementById("tb"+id)
	tbl.querySelectorAll(`.${cls}`).forEach(e => {e.innerHTML = "&nbsp"})
	// clear details
	if (page == "m") {
		if (id=="1") {dom.kbt.value = ""}
		if (id=="7") {reset_devices()}
		if (id=="8") {reset_domrect()}
		if (id=="11" && cls=="c2") {reset_audio2()}
		if (id=="12" && cls=="c1") {reset_unicode()}
		if (id=="13") {reset_media()}
		if (id=="14") {reset_css()}
		if (id=="18") {reset_misc()}
	}

	// wait so users see change
	function call_output() {
		clearInterval(checking)
		// reset timer
		gt0 = performance.now()
		if (page=="m") {
			if (id=="1") {outputScreen("screen")}
			if (id=="2") {outputUA(); outputMath()}
			if (id=="3") {outputMath()}
			if (id=="4" && cls=="c") {outputLanguage()}
			if (id=="5") {outputHeaders()}
			if (id=="6") {outputStorage()}
			if (id=="7") {outputDevices()}
			if (id=="8") {outputDomRect()}
			if (id=="9") {outputCanvas()}
			if (id=="10") {outputWebGL()}
			if (id=="11" && cls=="c1") {outputAudio1()}
			if (id=="11" && cls=="c2") {outputAudio2()}
			if (id=="12" && cls=="c1") {outputFonts1()}
			if (id=="13") {outputMedia()}
			if (id=="14") {outputCSS()}
			if (id=="18") {outputMisc()}
		} else if (page=="e") {
			if (id=="4" && cls=="c2") {outputAppLanguage()}
			if (id=="6") {outputWidgets()}
		}
	}
	let checking = setInterval(call_output, 170)

	// don't wait
	if (page=="m") {
		if (id=="12" && cls=="c2") {outputFonts2("small")}
		if (id=="12" && cls=="c3") {outputFonts2("all")}
	} else if (page=="e") {
		isPage = "extra"
		if (id=="3") {outputChrome()}
		if (id=="5") {outputFonts2("monsta")}
	}
}
