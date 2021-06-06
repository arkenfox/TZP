'use strict';
dom = getUniqueElements();

const newFn = x => typeof x != 'string' ? x : new Function(x)()
function rnd_string() {return Math.random().toString(36).substring(2, 15)}
function rnd_number() {return Math.floor((Math.random() * (99999-10000))+10000)}
function count_decimals(value) {if(Math.floor(value) === value) return 0;return value.toString().split(".")[1].length || 0}

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

function check_navKey(property) {
	if (navKeys["trueKeys"]) {return navKeys["trueKeys"].includes(property)} else {return false}
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
			// FF: constructor is always last
			lastKeyIndex = keys.indexOf("constructor")
			trueKeys = keys.slice(0, lastKeyIndex+1)
			fakeKeys = keys.slice(lastKeyIndex+1)
		} else if (isEngine == "blink") {
			// chromium: last key inconsistent
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
		if (check_navKey("brave")) {
			isBrave = true
		}
		return resolve()
	} catch(e) {
		console.error("get_navKeys failed", e.name, e.message)
		return resolve()
	}
})

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

function showDetail(name) {
	let data = sDetail[name],
		hash = sha1(data.join())
	// split+tidy name
	name = name.replace(/\_/g, " ")
	let n = name.indexOf(" "),
		section = name.substring(0,n).toUpperCase(),
		metric = name.substring(n,name.length).trim()
	console.log(section +": "+ metric +": "+ hash, data)
}

function get_isFF_engine() {
	// set isFF
	let isFFsum = ("undefined" != typeof InstallTrigger ? true : false)
		+ ("InstallTrigger" in window ? true : false)
		+ (typeof InstallTriggerImpl !== "undefined" ? true : false)
	if (isFFsum) {isFF = true}

	// engine
	function cbrt(x) {
		try {
			let y = Math.pow(Math.abs(x), 1 / 3)
			return x < 0 ? -y : y
		} catch(e) {
			return "error"
		}
	}
	let res = []
	for(let i=0; i < 6; i++) {
		try {
			let fnResult = "unknown"
			if (i == 0) {fnResult = cbrt(Math.PI) // polyfill
			} else if (i == 1) {fnResult = Math.log10(7*Math.LOG10E)
			} else if (i == 2) {fnResult = Math.log10(2*Math.SQRT1_2)
			} else if (i == 3) {fnResult = Math.acos(0.123)
			} else if (i == 4) {fnResult = Math.acosh(Math.SQRT2)
			} else if (i == 5) {fnResult = Math.atan(2)
			}
			res.push(fnResult)
		} catch(e) {
			res.push("error")
		}
	}
	let hash = sha1(res.join())
	if (hash == "ede9ca53efbb1902cc213a0beb692fe1e58f9d7a") {isEngine = "blink"
	} else if (hash == "05513f36d87dd78af60ab448736fd0898d36b7a9") {isEngine = "webkit"
	} else if (hash == "38172d9426d77af71baa402940bad1336d3091d0") {isEngine = "edgeHTML"
	} else if (hash == "36f067c652c8cfd9072580fca1f177f07da7ecf0") {isEngine = "trident"
	} else if (hash == "225f4a612fdca4065043a4becff76a87ab324a74") {isEngine = "gecko"
	} else if (hash == "cb89002a8d6fabf859f679fd318dffda1b4ae0ea") {isEngine = "gecko"
	} else if (isFF) {isEngine = "gecko"
	} else if ("chrome" in window) {isEngine = "blink"
	}
	if (isEngine == "") {console.error("isEngine: not found\n", res)}
}

function showhide(id, style) {
	let items = document.getElementsByClassName("tog"+ id)
	for (let i=0; i < items.length; i++) {items[i].style.display = style}
}

function togglerows(id, word) {
	let items = document.getElementsByClassName("tog"+ id)
	let	style = items[0].style.display == "table-row" ? "none" : "table-row"
	for (let i=0; i < items.length; i++) {items[i].style.display = style}
	if (word == "btn") {
		word = "[ "+ (style == "none" ? "show" : "hide") +" ]"
	} else {
		word = (style == "none" ? "&#9660; show " : "&#9650; hide ") + (word == "" || word == undefined ? "details" : word)
	}
	try {document.getElementById("label"+ id).innerHTML = word} catch(e) {}
}

function copyclip(element) {
	// fallback: e.g FF62-
	function copyExec() {
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

// set some global vars for all test pages
if ((location.protocol) == "file:") {isFile = true; note_file = sn +"[file:]"+ sc}
if ((location.protocol) == "https:") {isSecure = true}
get_navKeys()
get_isFF_engine()
