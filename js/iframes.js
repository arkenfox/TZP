'use strict';

function getDynamicIframeWindow({
	context,
	source = "",
	test = "",
	contentWindow = false,
	nestIframeInContainerDiv = false,
	violateSOP = true, // SameOriginPolicy
	display = false
}) {
	try {
		if (runSE) {foo++}
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
				${violateSOP ? '' : `sandbox="allow-same-origin"`}
			`
			element.innerHTML = `<iframe ${attributes}></iframe>`
		} else if (!violateSOP) {
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
			let list = ['appCodeName','appName','appVersion','buildID','oscpu',
				'platform','product','productSub','userAgent','vendor','vendorSub'],
				r = ""
			for (let i=0; i < list.length; i++) {
				try {
					r = cleanFn(navigator[list[i]])
				} catch(e) {
					r = zErr
				}
				res.push(list[i] +":"+ r)
			}
		}
		document.body.removeChild(element)
		return res
	} catch(e) {
		return [zErr, log_error("ua","iframe", e)]
	}
}

function get_ua_iframes(log = false) {
	// runs post FP
	let t0 = nowFn()
	// clear
	let str1 = "ua", str2 = str1 +"_diff"
	let aNames = [str2, str2 +"_content docroot", str2 + "_content with url", str2 +"_window docroot",
		str2 +"_window with url", str2 + "_iframe access", str2 + "_nested", str2 +"_window access",
	]
	// control
	let list = ['appCodeName','appName','appVersion','buildID','oscpu',
		'platform','product','productSub','userAgent','vendor','vendorSub'],
		res = [], r = ""
	var ctrl = [], simA = [], simB = []

	list.forEach(function(prop) {
		try {r = cleanFn(navigator[prop])} catch(e) {r = zErr}
		ctrl.push(prop +":"+ r)
		if (prop == "appCodeName") {r = "SIM A"}
		simA.push(prop +":"+ r)
		if (prop == "appCodeName") {r = "SIM B"}
		simB.push(prop +":"+ r)
	})

	// get data
	Promise.all([
		getDynamicIframeWindow({context: window, contentWindow: true, violateSOP: false, test: "ua"}), // docroot contentWindow
		getDynamicIframeWindow({context: window, contentWindow: true, source: "?", violateSOP: false, test: "ua"}), // with URL contentWindow
		getDynamicIframeWindow({context: window, violateSOP: false, test: "ua"}), // docroot
		getDynamicIframeWindow({context: window, source: "?", violateSOP: false, test: "ua"}), // with URL
		getDynamicIframeWindow({context: frames, test: "ua"}), // iframe access
		getDynamicIframeWindow({context: window, nestIframeInContainerDiv: true, test: "ua"}), // nested
		getDynamicIframeWindow({context: window, test: "ua"}), // window access
	]).then(function(results){

		const ctrlhash = mini(ctrl)
		// sim
		if (runUAI) {
			let err1 = [zErr, "TypeError: blah blah"], err2 = [zErr, "ReferenceError: rocket is a not a space rabbit"]
			if (intUAI == 0) {
				results = [ [], [], [], [], [], [], [] ] // all empty
			} else if (intUAI == 1) {
				results = [ undefined, null, true, "banana", {}, 45, false ] // all typeof
			} else if (intUAI == 2) {
				results = [ err1, err2, err2, err1, err2, err2, err1 ] // all errors
			} else if (intUAI == 3) {
				results = [ [], true, 75, err1, [], {}, err2 ] // all mixed
			} else if (intUAI == 4) {
				results[1] = [], results[3] = [] // 2 empty
			} else if (intUAI == 5) {
				results[0] = "banana", results[4] = null // 2 typeof
			} else if (intUAI == 6) {
				results[2] = err2, results[5] = err1 // 2 errors
			} else if (intUAI == 7) {
				results[1] = err1, results[3] = [], results[6] = "" // 3 mixed errors
			} else if (intUAI == 8) {
				results = [ simA, simA, simA, simA, simA, simA, simA ] // all diff: same-diff
			} else if (intUAI == 9) {
				results = [ simA, simA, simB, simB, simA, simB, simA ] // all diff: mixed-diffs
			} else if (intUAI == 10) {
				results[0] = simB, results[1] = [], results[2] = simB, results[3] = err1, results[5] = simB // mixed errors, some same-diff
			} else if (intUAI == 11) {
				results[0] = simA, results[2] = simB, results[3] = err2, results[4] = simA // 1 error, some multi-diff
			}
		}

		// loop iframe results
		let aError = [], aDistinct = [], validArray = 0, aDisplay = []
		for (let i=1; i < 8; i++) {
			let data = results[i-1]
			let name = aNames[i].replace(/\ua_navigator_iframe_diff_/g, "")
			if (Array.isArray(data)) {
				let hash = mini(data)
				if (data.length == 0) {
					aDisplay.push(zErrEmpty +": "+ cleanFn(data))
					aError.push(name)
				} else if (data.length == 2 && data[0] == zErr) {
					aDisplay.push(data[1])
					aError.push(name)
				} else {
					aDisplay.push(hash)
					validArray = i-1
					if (hash !== ctrlhash) {
						aDistinct.push(hash)
						let diffs = []
						for (let j = 0; j < data.length; j++) {if (data[j] !== ctrl[j]) {diffs.push(data[j])}}
						addDetail(aNames[0], diffs, zIFRAME)
					}
				}
				document.getElementById("uaIframe"+ i).innerHTML = aDisplay[i-1]
			} else {
				let tmp = log_error("ua","iframe", zErrType + typeof data)
				aDisplay.push(tmp)
				aError.push(name)
				document.getElementById("uaIframe"+ i).innerHTML = tmp
			}
		}
		let errCount = aError.length
		aDistinct = aDistinct.filter(function(item, position) {return aDistinct.indexOf(item) === position})
		// iframe summary
		let summary = ""
		let errNote = ""
		if (errCount > 0 && errCount < 7) {errNote = " <span class='s2'>[" + errCount +" error"+ (errCount > 1 ? "s]" : "]") + "</span>"}
		// single line
		if (aDistinct.length < 2) {
			let diffBtn = ""
			if (errCount == 7) {
				summary = zErr
			} else {
				summary = mini(results[validArray])
				if (aDistinct.length > 0) {diffBtn = addButton(2, aNames[0], "diff", "btnc", zIFRAME)}
				summary += (aDistinct.length > 0 ? match_red : match_green) + diffBtn + errNote
			}
		}	else {
			// multi-line
			summary = "mixed results" + match_red + errNote
			for (let i=1; i < 8; i++) {
				let data = results[i-1]
				if (Array.isArray(data)) {
					let hash = mini(data)
					if (data.length > 0 && data.length !== 2) {
						if (hash !== ctrlhash) {
							let diffs = []
							for (let j = 0; j < data.length; j++) {if (data[j] !== ctrl[j]) {diffs.push(data[j])}}
							addDetail(aNames[i], diffs, zIFRAME)
							hash += addButton(2, aNames[i], "diff", "btnc", zIFRAME)
							document.getElementById("uaIframe"+ i).innerHTML = hash
						}
					}
				}
			}
		}
		if (runUAI) {
			let nmeUAI = ["errors: all empty", "errors: all typeof", "errors: all zErr",
				"errors: all mixed","errors: 2 empty", "errors: 2 type of", "errors: 2 zErr",
				"errors: 3 mixed","diffs: all same-diff","diffs: all mixed-diffs",
				"mixed: 2 errors-mixed | 2 same-diff", "mixed: 1 error | multi-diff"]
			console.log("SIM #"+ intUAI +" UA iframes:", nmeUAI[intUAI])
			intUAI++; intUAI = intUAI % nmeUAI.length
		}
		dom.uaIframes.innerHTML = summary
		if (log) {log_perf(SECTNF, "ua iframes", t0)}
	})
}

countJS("iframes")
