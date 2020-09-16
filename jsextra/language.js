'use strict';

var dtd2 = ""

function test_iframe() {
	let iframeBlocked = true // assume blocked

	// test an iframe: if loaded call other functions
	function output_iframe() {
		// clear iframe
		iframe.src=""
		// output
		if (iframeBlocked == true) {
			if (isFile) {
				// file: Cross-Origin Request Blocked
				dom.appLang2.innerHTML = error_file_cors
				dom.appLang4.innerHTML = error_file_cors
			} else {
				// iframe is blocked
				dom.appLang2.innerHTML = error_iframe
				dom.appLang4.innerHTML = error_iframe
			}
		} else {
			// iframes are good: call functions
			get_app_lang_mediadocument()
			get_app_lang_dtd1()
		}
	}

	let iframe = dom.iframeTest
	iframe.src="iframes/test.html"
	iframe.addEventListener("load", function(){
		try {
			let testerror = iframe.contentWindow.document.getElementById("test")
			iframeBlocked = false
		} catch(e) {}
	})

	// keep checking iframe loaded, but stop after x tries
	let counter = 0
	function check_iframe() {
		if (counter < 60) {
			if (iframeBlocked == false) {
				clearInterval(checking)
				output_iframe()
			}
		} else {
			clearInterval(checking)
			output_iframe()
		}
		counter++
	}
	let checking = setInterval(check_iframe, 50)
}

function get_app_lang_dtd1() {
	// only call if iframes != blocked: no result = bugzilla fix
	let dtd1 = ""
	function output_dtd1(output) {
		dom.appLang2.innerHTML = output
	}
	// load it
	let iframe = dom.appLang_2,
		dtdtemp = ""
	iframe.src="iframes/dtdlocale.xml"
	iframe.addEventListener('load', () => {
		try {
			dtd1 = iframe.contentDocument.getElementById("DTD1").innerText
		} catch(e) {
			if (isFile) {
				// could be CORS or the patch: check MediaDocument result
				setTimeout(function() {
					let str = dom.appLang4.textContent
					if ( str == "[file:] [Cross-Origin Request Blocked]") {
						dtdtemp = error_file_cors
					} else if (str == "") {
						// should never happen, we waited a whole sec
						dtdtemp = sg+"[bugzilla 467035]</span> or " + error_file_cors
					} else {
						dtdtemp = sg+"[bugzilla 467035]"+sc
					}
				}, 1000) // get this done before the check_dtd1 runs out
			}
		}
	})
	// keep checking dtd1 != blank x times
	let counter = 0
	function check_dtd1() {
		if (counter < 30) {
			if (dtd1 !== "") {
				clearInterval(checking)
				// notate
				if (navigator.language == "en-US") {
					dtd1 = (sha1(dtd1) == "4496d79dd1843c7c743647b45b4f0d76abf46bfe" ? enUS_green + dtd1 : enUS_red + dtd1)
				}
				output_dtd1(dtd1)
			}
		} else {
			clearInterval(checking)
			if (dtdtemp == "") {dtdtemp = sg+"[bugzilla 467035]"+sc}
			output_dtd1(dtdtemp)
		}
		counter++
	}
	let checking = setInterval(check_dtd1, 50)
}

function get_app_lang_dtd2() {
	// dtd nullprinciple
	dtd2 = ""
	function output_dtd2(output) {
		dom.appLang3.innerHTML = output
	}
	// load it up
	let iframe = dom.appLang_3
	iframe.src="data:application/xml;charset=utf-8,%3C%21DOCTYPE%20html%20SYSTEM%20%22chrome%3A%2F%2Fglobal%2Flocale%2FnetError.dtd%22%3E%3Chtml%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxhtml%22%3E%3Chead%3E%3Cmeta%20charset%3D%22utf-8%22%2F%3E%0D%0A%20%20%3C%2Fhead%3E%0D%0A%20%20%3Cbody%3E%3Cspan%20id%3D%22text-container%22%3E%26loadError.label%3B%3C%2Fspan%3E%0D%0A%20%20%3Cscript%3E%0D%0A%20%20window.addEventListener%28%27message%27%2C%20%28e%29%20%3D%3E%20%7B%0D%0A%20%20%20%20e.source.postMessage%28document.getElementById%28%27text-container%27%29.innerText%2C%20%27%2A%27%29%3B%0D%0A%20%20%7D%29%3B%0D%0A%20%20%3C%2Fscript%3E%0D%0A%20%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E";
	iframe.addEventListener('load', () => {
		window.addEventListener('message', ({ data }) => dtd2 = data)
		iframe.contentWindow.postMessage('foo', '*')
	})
	// keep checking dtd2 not blank, but stop after x tries
	let counter = 0
	function check_dtd2() {
		if (counter < 30) {
			if (dtd2 !== "") {
				clearInterval(checking)
				// notate
				if (navigator.language == "en-US") {
					dtd2 = (sha1(dtd2) == "4496d79dd1843c7c743647b45b4f0d76abf46bfe" ? enUS_green + dtd2 : enUS_red + dtd2)
				}
				output_dtd2(dtd2)
			}
		} else {
			clearInterval(checking)
			output_dtd2(sg+"[bugzilla 467035]"+sc)
		}
		counter++
	}
	let checking = setInterval(check_dtd2, 50)
}

function get_app_lang_mediadocument() {
	// MediaDocument.properties
	let iframe = dom.appLang_4
	function output_mediadocument(string) {
		dom.appLang4.innerHTML = string
	}
	function run_mediadocument() {
		try {
			let output = (iframe.contentWindow.document.title)
			// notate
			if (navigator.language == "en-US") {
				output = (sha1(output) == "12ad5833d780efdd0d7e66432a1abab3afd9901d" ? enUS_green + output : enUS_red + output)
			}
			output_mediadocument(output)
		} catch(e) {
			if (isFile) {
				// file: Cross-Origin Request Blocked
				output_mediadocument(error_file_cors)
			} else {
			// iframe blocked
				output_mediadocument(error_iframe)
			}
		}
	}
	function check_mediadocument() {
		let iframe = dom.appLang_4
		// load the iframe
		if (iframe.src == "") {
			iframe.src="images/dummy.png"
			iframe.addEventListener("load", function(){
				run_mediadocument()
			})
		} else {
			// already loaded
			run_mediadocument()
		}
	}

	// keep checking if image loaded, but stop after x tries
	let image = dom.imageTest
	image.src="images/dummy.png" // 1px high
	let counter = 0
	function check_image() {
		if (counter < 60) {
			if (image.offsetHeight == 1) {
				// empty_src=0px, broken_src= approx 24px
				// extensions blocking images = if placeholders = approx 20px
				// therefore: if 1px then our image was loaded
				clearInterval(checking)
				image.src="" // reset src
				check_mediadocument()
			}
		} else {
			clearInterval(checking)
			output_mediadocument(error_image)
			image.src="" // reset src
		}
		counter++
	}
	let checking = setInterval(check_image, 50)
}

function get_app_lang_xmlparser() {
	let doc = (new DOMParser).parseFromString('getyourlocale', 'application/xhtml+xml')
	let str = (doc.getElementsByTagName('parsererror')[0].firstChild.textContent)
	// strip location
	let start = str.search("http")
	if (start == -1) { start = str.search("file")}
	let end = str.search("html") + 4
	let output = str.slice(0,start-1) + str.slice(end)
	// strip anchor
	start = output.search("#")
	if (start !== -1) {
		let strTemp = output.substring(start, output.length)
		strTemp = strTemp.replace(/(?:\r|\n).*$/, ' ')
		end = strTemp.search(" ")
		output = output.slice(0,start) + output.slice(start+end,output.length)
	}
	// output
	if (navigator.language == "en-US") {
		output = (sha1(output) === "0e4bcf212e9bcdae045444087659ffc9672c7582" ? enUS_green + output : enUS_red + output)
	}
	dom.appLang5.innerHTML = output
}

function outputAppLanguage() {
	// global vars
	if ((location.protocol) == "file:") {isFile = true; note_file = sn+"[file:]"+sc}
	if ((location.protocol) == "https:") {isSecure = true}
	if ("undefined" != typeof InstallTrigger) {isFF = true}
	// FF only
	if (isFF) {
		// dom.properties
		let str = dom.appLang_1.validationMessage
		if (navigator.language == "en-US") {
			str = (sha1(str) == "c17ee6480cdfbdc082000efe84ca520283b761ef" ? enUS_green + str : enUS_red + str)
		}
		dom.appLang1.innerHTML = str
		// the others
		get_app_lang_xmlparser()
		get_app_lang_dtd2()
		test_iframe() // fires last two PoCs
	}
}

