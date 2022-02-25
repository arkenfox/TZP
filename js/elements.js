'use strict';

function get_element_keys() {
	let sName = "elements_element_keys"
	sDetail[sName] = []
	return new Promise(resolve => {
		try {
			// create element
			const id = 'html-element-version'
			const element = document.createElement('div')
			element.setAttribute('id', id)
			// append element to dom
			document.body.appendChild(element)
			// get rendered element
			const htmlElement = document.getElementById(id)
			// get property keys in element object
			const keys = []
			for (const key in htmlElement) {
				keys.push(key)
			}
			sDetail[sName] = keys
			//console.debug(keys.join("\n"))
			let hash = sha1(keys.join(), "elements keys")
			dom.elementkeys.innerHTML = hash + buildButton("15", sName, keys.length)
			return resolve("element_keys:"+ hash)
		} catch (error) {
			dom.elementkeys.innerHTML = zB0
			return resolve("element_keys:"+ zB0)
		}
	})
}

function get_resized() {
	let t0; if (canPerf) {t0 = performance.now()}
	let resM = [], resL = [], resALL = []
	let sNameM = "elements_mathml_notglobal",
		sNameL = "elements_lineheight_notglobal"
	sDetail[sNameM] = []
	sDetail[sNameL] = []
	let elCtrl = dom.mathmlCtrl,
		elTest = dom.mathmlTest,
		elLine = dom.lhTest,
		target = dom.measureDiv,
		sizes = [16,97,203,333,417] //,513,595,709,867]

	try {
		let errM = "", errMMsg = "", errL = "", errLMsg
		sizes.forEach(function(size) {
			target.style.fontSize = size+"pt" // or px? decisions
			// mathml
			if (isFF) {
				try {
					resM.push(cleanFn(elTest.offsetHeight - elCtrl.offsetHeight))
				} catch(e) {
					errM = e.name; errMMsg = e.message
				}
			}
			// line
			try {
				let elDiv = elLine.getBoundingClientRect()
				resL.push(cleanFn(elDiv.height))
			} catch(e) {
				errL = e.name; errLMsg = e.message
			}
		})
		try {target.style.fontSize = "16pt"} catch(e) {} // reset size to remove horizontal scrollbar

		// mathml
		let displayM = ""
		if (isFF) {
			if (errM !== "") {
				log_error("elements: mathml", errM, errMMsg)
				displayM = zB0
				resM = [zLIE]
			} else if (resM.length < sizes.length) {
				displayM = zB0
				resM = [zLIE]
				if (gRun) {
					gKnown.push("elements:mathml")
					gMethods.push("elements:mathml:NaN")
				}
			} else if (resM.join() == "0,0,0,0,0,0,0,0,0") {
				displayM = zD + (isTB ? tb_safer : "")
				resM = [zD]
			} else {
				sDetail[sNameM] = resM
				displayM = sha1(resM.join(), "elements mathml") + buildButton("15", sNameM)
					+ " ["+ mini(resM.join(), "elements lineheight") +"]"
			}
		}
		dom.mathml.innerHTML = isFF ? displayM : zNA

		// line
		let displayL = ""
		if (errL !== "") {
			log_error("elements: lineheight", errL, errLMsg)
			displayL = zB0
			resL = [zLIE]
		} else if (resL.length < sizes.length) {
			displayL = zB0
			resL = [zLIE]
			if (gRun) {
				gKnown.push("elements:lineheight")
				gMethods.push("elements:lineheight:NaN")
			}
		} else {
			sDetail[sNameL] = resL
			displayL = sha1(resL.join(), "elements lineheight") + buildButton("15", sNameL)
				+ " ["+ mini(resL.join(), "elements lineheight") +"]"
		}
		dom.lineheight.innerHTML = displayL

		// return
		log_perf("resized [elements]",t0, (gRun ? gt0 : "ignore"))
		resALL.push("mathml:"+ (isFF ? resM.join() : zNA))
		resALL.push("lineheight:"+ resL.join())
		return resALL

	} catch(e) {
		log_error("elements: measure", e.name, e.message)
		dom.mathml = zB0
		dom.lineheight = zB0
		return ["mathml:"+ zLIE, "lineheight:"+ zLIE]
	}
}

function outputElements() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = []
	Promise.all([
		get_element_keys(),
		get_resized(),
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
		log_section("elements", t0, section)
	})
}

countJS("elements")
