'use strict';

const get_element_keys = () => new Promise(resolve => {
	const METRIC = "htmlelement_keys"
	const id = "html-element-version"
	let isTBSmart = (isSmart && isTB)
	let notation = isTBSmart ? tb_red : ""

	function cleanup() {
		try {document.getElementById(id).remove()} catch(e) {}
	}
	try {
		if (runSE) {foo++}
		const element = document.createElement('a')
		element.setAttribute("id", id)
		document.body.appendChild(element)
		const htmlElement = document.getElementById(id)
		const keys = []
		for (const key in htmlElement) {keys.push(key)}
		cleanup()
		let hash = mini(keys) // 18527130
		// cydec
			// changes order, removes some keys
			// got to be a better way than enumerating missing
		const aExpected = ["scrollWidth","scrollHeight","clientWidth","clientHeight"]
		if (isSmart && (keys.reduce((a, c) => a + aExpected.includes(c), 0)) < aExpected.length) {
			hash = colorFn(hash)
			log_known(SECT15, METRIC)
			addDetail(METRIC, keys)
			addData(15, METRIC, zLIE)
		} else {
			addData(15, METRIC, keys, hash)
			if (isTBSmart) {
				if (isOS === "android") {
					// fa8b991f: NoScript 11.4.24 (+ 13 NS items e.g. get/value)
					if (hash === "fa8b991f") {notation = tb_green}
				} else {
					// desktop NoScript 11.4.29
					if (hash === "156e1033") {notation = tb_green}
				}
			}
		}
		log_display(15, METRIC, hash + addButton(15, METRIC, keys.length) + notation)
		return resolve()
	} catch (e) {
		cleanup()
		log_display(15, METRIC, log_error(SECT15, METRIC, e) + notation)
		return resolve([METRIC, zErr])
	}
})

const get_lh = () => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = "line-height",
		sizes = [159.487, 201.333, 333.666], // use decimals to trigger extra precision
			// test FF windows
			// looks like we need multiple sizes just in case
				// e.g. 317px = 5 groups (6 if pt) but 333px = 6 (5 if pt)
				// e.g. 201.333 = 5 groups (both) but 201 fixes px but not pt
		sizetype = "pt",
		fonts = ['cursive','emoji','fangsong','fantasy','monospace','sans-serif','serif','system-ui','ui-serif',]

	try {
		if (runSE) {foo++}
		const doc = document
		const id = `lh-fingerprint`
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		div.classList.add("measure")

		let oLine = {}, isLine = true, isErr = "", target, range, height
		fonts.forEach(function(fontfamily) {
			sizes.forEach(function(size) {
				size += sizetype
				// create + measure each individually as previous elements can affect subsequent ones
				dom[id].innerHTML = "<div style='font-size:"+ size +";' id='lhtarget' class='measureScale " + fontfamily +"'>.</div>"
				if (isLine) {
					target = dom["lhtarget"]
					if (isDomRect > 1) {
						range = document.createRange()
						range.selectNode(target)
					}
					if (isDomRect < 1) {height = target.getBoundingClientRect().height
					} else if (isDomRect == 1) {height = target.getClientRects()[0].height
					} else if (isDomRect == 2) {height = range.getBoundingClientRect().height
					} else if (isDomRect > 2) {height = range.getClientRects()[0].height
					}
					if (runST) {height = true}
					if ("number" === typeof height) {
						if (oLine[fontfamily] == undefined) {oLine[fontfamily] = {}}
						oLine[fontfamily][size] = height
					} else {
						isLine = false
						isErr = log_error(SECT15, METRIC, zErrType + typeof height)
					}
				}
			})
		})
		try {document.getElementById("lh-fingerprint").remove()} catch(e) {} // remove element

		let display = "", notation = "", groupcount = 0
		if (isErr !== "") {
			display = isErr
			addData(15, METRIC, zErr)
		} else {
			// hash/sort
			let tmpobj = {}, newobj = {}
			for (const k of Object.keys(oLine)) {
				let hash = mini(oLine[k])
				if (tmpobj[hash] == undefined) {
					tmpobj[hash] = {"group": [k], "metrics": oLine[k]}
				} else {
					tmpobj[hash]["group"].push(k)
				}
			}
			for (const k of Object.keys(tmpobj).sort()) {newobj[k] = tmpobj[k]; groupcount++}
			let hash = mini(newobj)
			let btnTxt = groupcount + " group" + (groupcount > 1 ? "s" : "")
			if (isSmart && isDomRect == -1) {
				addData(15, METRIC, zLIE)
				addDetail(METRIC, newobj)
				display = colorFn(hash) + addButton(15, METRIC, btnTxt)
				log_known(SECT15, METRIC)
			} else {
				display = hash + addButton(15, METRIC, btnTxt)
				addData(15, METRIC, newobj, hash)
			}
		}
		if (isSmart && isTB) {
			notation = (groupcount == 1 ? tb_lh_green : tb_lh_red)
		}
		log_display(15, METRIC, display + notation)
		log_perf(SECT15, METRIC, t0)
		return resolve()

	} catch(e) {
		try {document.getElementById("lh-fingerprint").remove()} catch(e) {} // remove element
		log_display(15, METRIC, log_error(SECT15, METRIC, e))
		return resolve([METRIC, zErr])
	}
})

const get_mathml = () => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = "mathml",
		sizetype = "px",
		sizes = [33,99,111],
		sizectl = sizes[0]

	try {
		if (runSE) {foo++}
		// create element
		const doc = document
		const id = `mathml-fingerprint`
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		div.classList.add("measure")
		div.style.fontFamily = "none"
 		let divcontrol = "<div id='mathmldivctrl' style='font-size: "
			+ sizectl + sizetype +";' class='measureScale'>x=−b ±b2−4 ⁢a⁢c 2⁢a</div>"
		let mathmlstr = "<math><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo form='prefix'>&minus;</mo>"
		+"<mi>b</mi><mo>&PlusMinus;</mo><msqrt><msup><mi>b</mi><mn>2</mn></msup><mo>&minus;</mo><mn>4</mn>"
		+"<mo>&InvisibleTimes;</mo><mi>a</mi><mo>&InvisibleTimes;</mo><mi>c</mi></msqrt></mrow>"
		+"<mrow><mn>2</mn><mo>&InvisibleTimes;</mo><mi>a</mi></mrow></mfrac></mrow></math>"
		let divcontent = ""
		sizes.forEach(function(size) {
			divcontent += "<div id='mathmldiv"+ size +"' class='measureScale' style='font-size:"
				+ size + sizetype +";'><span id='mathmlspan"+ size +"'>"+ mathmlstr +"</span></div>"
		})
		doc.getElementById(id).innerHTML = divcontrol + divcontent

		// measure
		let control, width, height
		let rangeC,	rangeW, rangeH
		let targetC = dom["mathmldivctrl"], targetH, targetW
		let oMath = {}, isMath = true, errMath = "", isDiff
		sizes.forEach(function(size) {
			if (isMath) {
				targetH = dom["mathmldiv"+size]
				targetW = dom["mathmlspan"+size]
				let isCtrlSize = size == sizectl
				size = size + sizetype
				if (isDomRect > 1) {
					// test
					rangeH = document.createRange()
					rangeH.selectNode(targetH)
					rangeW = document.createRange()
					rangeW.selectNode(targetW)
					// control
					if (isCtrlSize) {
						rangeC = document.createRange()
						rangeC.selectNode(targetC)
					}
				}
				if (isDomRect < 1) { // get a result regardless
					if (isCtrlSize) {control = targetC.getBoundingClientRect().height}
					height = targetH.getBoundingClientRect().height
					width = targetW.getBoundingClientRect().width
				} else if (isDomRect == 1) {
					if (isCtrlSize) {control = targetC.getClientRects()[0].height}
					height = targetH.getClientRects()[0].height
					width = targetW.getClientRects()[0].width
				} else if (isDomRect == 2) {
					if (isCtrlSize) {control = targetC.getBoundingClientRect().height}
					height = rangeH.getBoundingClientRect().height
					width = rangeW.getBoundingClientRect().width
				} else if (isDomRect > 2) {
					if (isCtrlSize) {control = targetC.getClientRects()[0].height}
					height = rangeH.getClientRects()[0].height
					width = rangeW.getClientRects()[0].width
				}
				if ("number" !== typeof height) {
					isMath = false
					errMath = log_error(SECT15, METRIC, zErrType + typeof control)
				} else {
					if (isCtrlSize) {isDiff = height - control}
					oMath[size] = [width, height]
				}
			}
		})
		try {document.getElementById("mathml-fingerprint").remove()} catch(e) {} // remove element

		let hash, display, displayEnabled = ""
		if (isMath) {
			let isZero = Math.abs(isDiff) > 0.001 ? false : true
			displayEnabled = " ["+ (isZero ? zD : zE) +"]"
			if (isSmart && isTB) {
				displayEnabled += isZero ? tb_safer : tb_standard
			}
			if (isSmart && isDomRect == -1) {
				hash = mini(oMath)
				addData(15, METRIC, zLIE)
				addDetail(METRIC, oMath)
				display = colorFn(hash) + addButton(15, METRIC)
				log_known(SECT15, METRIC)
			} else {
				oMath["enabled"] = !isZero
				hash = mini(oMath)
				display = hash + addButton(15, METRIC)
				addData(15, METRIC, oMath, hash)
			}
		} else {
			display = errMath
			addData(15, METRIC, zErr)
		}
		log_display(15, METRIC, display + displayEnabled)
		log_perf(SECT15, METRIC, t0)
		return resolve()

	} catch(e) {
		try {document.getElementById("mathml-fingerprint").remove()} catch(e) {} // remove element
		log_display(15, METRIC, log_error(SECT15, METRIC, e) + (isSmart & isTB ? tb_slider_red : ""))
		return resolve([METRIC, zErr])
	}
})

const outputElements = () => new Promise(resolve => {
	let t0 = nowFn()
	Promise.all([
		get_element_keys(),
		get_lh(),
		get_mathml(),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(15, item)})
		log_section(15, t0)
		return resolve(SECT15)
	})
})

countJS(SECT15)
