'use strict';

function outputResource() {
// FF only
if ("undefined" != typeof InstallTrigger) {
	// clear
	dom.imgHashR.innerHTML = "&nbsp"
	dom.allHashR.innerHTML = "&nbsp"
	dom.allLoadedR.innerHTML = "&nbsp"
	// wait msg
	dom.jsHashR = "tests are running"
	dom.cssHashR = "give it a second"
	//vars
	let c = "chrome://browser/content/",
		ca = c+"abouttbupdate/",
		co = c+"onionservices/",
		ct = c+"torpreferences/",
		o = "resource://onboarding/",
		oi = o+"img/",
		oif = oi+"figure_tor-",
		ol = o+"lib/",
		s = "chrome://browser/skin/"

	let jsUris = [
		'resource://torbutton-abouttor/aboutTor.js', 
		o+'onboarding-tor-circuit-display.js',
		ca+'aboutTBUpdate.js',
		ct+'torPane.js',
		// TB78
		co+'authPreferences.js',
		co+'authPrompt.js',
		co+'onionlocationPreferences.js',
		co+'savedKeysDialog.js',
		co+'netError/onionNetError.js',
	]
	let imgUris = [
		c+'securitylevel/securityLevelButton.svg',
		ct+'torPreferencesIcon.svg', //9+
		s+'new_circuit.svg', //9+
		s+'new_identity.svg', //9+
		s+'onion.svg',
		s+'onion-disabled.svg',
		s+'onion-lock.svg',
		oif+'circuit-display.png',
		oif+'expect-differences.png',
		oif+'network.png',
		oif+'onion-services.png',
		oif+'privacy.png',
		oif+'security-level.png',
		oif+'security.png',
		oif+'toolbar-layout.png',
		oif+'welcome.png',
		oi+'icons_no-icon.png',
		oi+'tor-watermark.png',
		// TB78+
		co+'onionlocation.svg',
		co+'netError/onionsite.svg',
		co+'netError/browser.svg',
		co+'netError/network.svg',
	]
	let cssUris = [
		'resource://torbutton-assets/aboutTor.css',
		ca+'aboutTBUpdate.css',
		ct+'torPreferences.css',
		// TB78
		co+'authPreferences.css',
		co+'onionlocationPreferences.css',
		co+'netError/onionNetError.css',
	]

	// JS
	let allHash = [],
		jsHash = []
	jsUris.forEach(function(src) {
		let script = document.createElement('script')
		script.src = src
		document.head.appendChild(script)
		script.onload = function() {
			jsHash.push(src)
			allHash.push(src)
		};
		document.head.removeChild(script)
	})
	// IMAGES
	let imgHash = []
	imgUris.forEach(function(imgUri) {
		let img = document.createElement("img");
		img.src = imgUri
		img.style.height = "20px"
		img.style.width = "20px"
		img.onload = function() {
			imgHash.push(imgUri)
			allHash.push(imgUri)
		}
	})
	// CSS
	let cssHash = []
	cssUris.forEach(function(cssUri) {
		let css = document.createElement("link")
		css.href = cssUri
		css.type = "text/css"
		css.rel = "stylesheet"
		document.head.appendChild(css)
		css.onload = function() {
			cssHash.push(cssUri)
			allHash.push(cssUri)
		};
		document.head.removeChild(css)
	})

	function output_chrome() {
		clearInterval(checking)
		// counts
		let foundI = imgHash.length,
			foundJ = jsHash.length,
			foundC = cssHash.length,
			foundA = allHash.length
		// hashes
		let hashI = sha1(imgHash.sort()),
			hashJ = sha1(jsHash.sort()),
			hashC = sha1(cssHash.sort()),
			hashA = sha1(allHash.sort())
		// output
		dom.imgHashR = hashI + " ["+ foundI +"/" + imgUris.length +"]"
		dom.jsHashR = hashJ + " ["+ foundJ +"/" + jsUris.length +"]"
		dom.cssHashR = hashC + " ["+ foundC +"/" + cssUris.length +"]"
		let countTested = imgUris.length + jsUris.length + cssUris.length
		dom.allHashR = sha1(hashA) + " ["+ foundA +"/"+ countTested +"]"
		// data
		cssHash.sort()
		jsHash.sort()
		imgHash.sort()
		let strOut = ""
		if (foundC > 0) {
			strOut = s2+"--- css ---"+sc + "<br>"+cssHash.join("<br>")
		}
		if (foundJ > 0) {
			strOut += "<br>"+s2+"--- js ---"+sc + "<br>"+jsHash.join("<br>")
		}
		if (foundI > 0) {
			strOut += "<br>"+s2+"--- img ---"+sc + "<br>"+imgHash.join("<br>")
		}
		if (strOut.substring(0,4) == "<br>") {strOut = strOut.slice(4, strOut.length)}
		dom.allLoadedR.innerHTML = strOut
		// label
		dom.resourceRun = "[ re-run tests ]"
	}
	// wait 1 second
	let checking = setInterval(output_chrome, 1000)

}
}
