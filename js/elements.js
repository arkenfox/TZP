'use strict';

let aClientRectBS = []

function get_clientrect() {
	/* code based on https://canvasblocker.kkapsner.de/test/ */
	// ToDo
	// - record all methods (not blocks which are recorded as errors)
	// - ^ concat them: isType, per-execution, per-element (i.e same diff for all elements or random amounts)
	// - add isFF-only sanity check that we shouldn't get more than one non-Lie hash
	// - add clickable details
	// - ^ one non-Lie, any other lies = "reported" with clickable diffs

	let t0; if (canPerf) {t0 = performance.now()}
	let pretty = [
		"clientrect_Element.getBoundingClientRect","clientrect_Element.getClientRects",
		"clientrect_Range.getBoundingClientRect","clientrect_Range.getClientRects",]
	let elements = ["known","h1","text1","text2","select","progress","button"]

	return new Promise(resolve => {

		function output() {
			let res = [], aLies = [], aValue = [], isBypass = false, bypassHash
			let prevMini, prevHash
			for (let i=0; i < pretty.length; i++) {
				if (aBlock[i] === false) {
					// replace miniHashes
					let current = aDisplay[i]
					if (current !== prevMini) {
						prevHash = mini_sha1(oData["run0"+i], "domrect [method "+ i +"]"); aDisplay[i] = prevHash
					} else {
						aDisplay[i] = prevHash
					}
					prevMini = current
					// lies
					let isLie = (aType[i] == false)
					if (aKnown[i] === false) {isLie = true // note: only isFF
					} else if (aPass[i] === false) {isLie = true
					} else if (aShift[i] === false) {isLie = true}
					aLies.push(isLie)
					// bypass item: isFF only
					if (isFF) {
						if (isLie === false && isBypass === false) {isBypass = true; bypassHash = aDisplay[i]}
					}
				} else {
					aLies.push(false)
				}
			}
			// set our trustyworthy clientrect mthods array for other functions
			aClientRectBS = aLies

			// display
			for (let i=0; i < pretty.length; i++) {	
				if (aBlock[i] === false && aLies[i] === false) {
					aValue[i] = aDisplay[i]
				} else {
					aValue[i] = (isBypass ? bypassHash : (aBlock[i] === true ? zB0 : zLIE))
					aDisplay[i] = (isBypass? soB : soL) + aDisplay[i] + scC
					if (gRun) {
						gKnown.push("domrect:"+ pretty[i])
						if (isBypass) {gBypassed.push("domrect:"+ pretty[i] +":"+ bypassHash)}
					}
				}
				document.getElementById("dr"+i).innerHTML = aDisplay[i]
				res.push(pretty[i] +":" + aValue[i])
			}
			/*
			console.debug(
				"aBlock", aBlock,
				"\naType", aType,
				"\naKnown", aKnown,
				"\naPass", aPass,
				"\naShift", aShift,
				"\naNoise", aNoise,
				"\naLies", aLies,
				"\naBypass", isBypass, bypassHash,
				"\naDisplay", aDisplay,
				"\naValue", aValue,
			)
			//console.debug(oData)
			// record methods: per-execution, per-element, isType
				// note: blocks are recorded in errors
			*/
			log_perf("clientrect [elements]",t0, (gRun ? gt0 : "ignore"))
			return resolve(res)
		}

		// analyze
		let aKnown = [], aPass = [], aShift = [], aBlock = [], aDisplay = [], aType = [], aNoise = []
		function analyze() {
			for (let i=0; i < pretty.length; i++) {
				if ("object" === typeof oData["run0"+i]) {
					aBlock.push(false)
					// known (isFF)
					let knownCtrl = oData["run0"+i].slice(0,8)
					knownCtrl = mini(knownCtrl.join(), "domrect [method "+ i +"] known")
					aKnown.push(isFF ? (knownCtrl == "2b9f1576" ? true : false) : true) // only isFF can be false
					// random per execution (known value is static)
					let runCtrl = oData["run1"+i].slice(0,8)
					runCtrl = mini(runCtrl.join(), "domrect [method "+ i +"] 2pass")
					aPass.push(knownCtrl === runCtrl ? true : false)
					// hash: full data
					let miniHash = mini(oData["run0"+i].join(), "domrect [method "+ i +"] full")
					aDisplay.push(miniHash)
					// shift diffs
						// ignore width/height = not affected by position (-12 results)
						// ignore select item = blink + left/right/x properties (-6 results)
					if (aType[i] === true) {
						let aOne = oData["run0"+i].slice(8) // 6 x 8 = 48
						let aTwo = oData["run1"+i].slice(8)
						let aDiffs = []
						for (let k=0; k < aOne.length; k++) {
							let item = aOne[k].split(":")[0],
								type = aOne[k].split(":")[1]
							if (type !== "width" && type !== "height" && item !== "select") {
								let value1 = aOne[k].split(":")[2] * 1
								let value2 = aTwo[k].split(":")[2] * 1
								let diff = value2 - value1
								if (diff !== 0.25) {
									aDiffs.push(diff)
									oData["diff"+i].push(item +" : "+ type +" : "+ diff)
								}
							}
						}
						// diffs random-or-same
						if (aDiffs.length == 0) {
							aShift.push(true)
							aNoise.push(zNA)
						} else {
							aShift.push(false)
							let len = aDiffs.length
							aDiffs = aDiffs.filter(function(item, position) {return aDiffs.indexOf(item) === position})
							aNoise.push(aDiffs.length +"/"+ len)
						}
					} else {
						aShift.push(zNA)
						aNoise.push(zNA)
					}
				} else {
					aBlock.push(true)
					aKnown.push(zNA)
					aPass.push(zNA)
					aShift.push(zNA)
					aNoise.push(zNA)
					aDisplay.push(oData["run0"+i])
				}
			}
			output()
		}
		function getElements(classname){
			return Array.from(document.querySelectorAll(classname))
		}

		function createTest(method, runtype, callback){
			const properties = ["x","y","width","height","top","left","right","bottom"]
			function performTest(runtype){
				try {
					let aData = [], isType
					const rects = getElements(".testRect").map(callback)
					rects.forEach(function(rect, i){
						isType = true
						properties.forEach(function(property, j){
							let value = cleanFn(rect[property])
							if ("number" !== typeof value) {isType = false}
							oData["run"+ runtype +""+ method].push(elements[i] +":"+ properties[j] +":"+ value)
						})
					})
					if (runtype == 0) {aType.push(isType)}
				} catch(e) {
					if (runtype == 0) {log_error("domrect: "+ pretty[method], e.name, e.message)}
					let eMsg = e.name === undefined ? zErr : trim_error(e.name, e.message + e.message + e.message, 40)
					oData["run"+ runtype +""+ method] = eMsg
					aType.push(zNA)
				}
			}
			performTest(runtype)
		}

		// run
		function run(runtype) {
			return new Promise(function(resolve, reject) {
				// div
				if (runtype == 0) {
					dom.divrect.classList.add("divrect1");
					dom.divrect.classList.remove("divrect2");
				} else {
					// shift
					dom.divrect.classList.add("divrect2");
					dom.divrect.classList.remove("divrect1");
				}
				// test
				createTest("0", runtype, function(element){return element.getBoundingClientRect()})
				createTest("1", runtype, function(element){return element.getClientRects()[0]})
				createTest("2", runtype, function(element){
					let range = document.createRange()
					range.selectNode(element)
					return range.getBoundingClientRect()
				})
				createTest("3", runtype, function(element){
					let range = document.createRange()
					range.selectNode(element)
					return range.getClientRects()[0]
				})
				resolve()
			})
		}

		// two runs x 4 methods
		let oData = {
			run00 : [], run01: [], run02 : [], run03: [],
			run10 : [], run11: [], run12 : [], run13: [],
			diff0 : [], diff1: [], diff2 : [], diff3: [],
		}

		Promise.all([
			run(0),
			run(1), // shift
		]).then(function(){
			analyze()
		})
	})
}

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
			let hash = mini_sha1(keys.join(), "elements keys")
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
		elLine = dom.divLH,
		targetM = dom.measureDivMath,
		targetL = dom.measureDivLH,
		sizes = [16,97,203,333,417], //,513,595,709,867]
		styles = ["none","monospace","serif","sans-serif","cursive","fantasy","system-ui"]

	// clientrec measure method
	let method = aClientRectBS.indexOf(false)
	// and away we go
	try {
		let errM = "", errMMsg = ""
		let errL = "", errLMsg = "", mismatchL = ""

		let range = document.createRange()
		range.selectNode(elLine)

		sizes.forEach(function(size) {
			targetM.style.fontSize = size + "pt"
			targetL.style.fontSize = size + "pt"

			// mathml
			if (isFF) {
				try {
					resM.push(cleanFn(elTest.offsetHeight - elCtrl.offsetHeight))
				} catch(e) {
					errM = e.name; errMMsg = e.message
				}
			}
			// lineheight: re-uses mathmlCtrl
			try {
				let elDiv
				if (method < 1) { // get a result regardless
					elDiv = elLine.getBoundingClientRect()
				} else if (method == 1) {
					elDiv = elLine.getClientRects()
				} else if (method == 2) {
					elDiv = range.getBoundingClientRect()
				} else if (method == 3) {
					elDiv = range.getClientRects()[0]
				}
				let height = cleanFn(elDiv.height)
				// ToDo: trap undefined, not a number etc
				if ("number" !== typeof height) {
					mismatchL = true
				} else {
					resL.push(height)
				}
			} catch(e) {
				errL = e.name; errLMsg = e.message
			}
		})
		// reset size to remove horizontal scrollbar
		try {targetM.style.fontSize = "16pt"} catch(e) {}
		try {targetL.style.fontSize = "16pt"} catch(e) {}

		// mathml
		let displayM = ""
		if (isFF) {
			if (errM !== "") {
				log_error("elements: mathml", errM, errMMsg)
				displayM = trim_error(errM, errMMsg)
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
				displayM = mini_sha1(resM.join(), "elements mathml") + buildButton("15", sNameM)
					+ " ["+ mini(resM.join(), "elements lineheight") +"]"
			}
		}
		dom.mathml.innerHTML = isFF ? displayM : zNA

		// lineheight
		let displayL = ""
		if (errL !== "") {
			log_error("elements: lineheight", errL, errLMsg)
			displayL = trim_error(errL, errLMsg)
			resL = [zLIE]
		} else if (resL.length < sizes.length) {
			displayL = zB0
			resL = [zLIE]
			if (gRun) {
				gKnown.push("elements:lineheight")
				gMethods.push("elements:lineheight:NaN")
			}
		} else {
			// we have an array
			sDetail[sNameL] = resL
			if (method == -1) {
				// no trustworthy methods
				displayL = soL + mini_sha1(resL.join(), "elements lineheight") + scC + buildButton("15", sNameL)
					+ " ["+ mini(resL.join(), "elements lineheight") +"]"
				resL = [zLIE]
			} else {
				displayL = mini_sha1(resL.join(), "elements lineheight") + buildButton("15", sNameL)
					+ " ["+ mini(resL.join(), "elements lineheight") +"]"
			}

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
	aClientRectBS = [] // we set this in clientrect test to determine what if any method we can trust

	Promise.all([
		get_clientrect()
	]).then(function(res){
		let aTemp = res[0]
		aTemp.forEach(function(item) {section.push(item)})

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
	})
}

countJS("elements")
