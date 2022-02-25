"use strict";

/* code based on https://canvasblocker.kkapsner.de/test/ */

function outputDomRect() {
	let t0; if (canPerf) {t0 = performance.now()}
	let pretty = [
		"Element.getBoundingClientRect","Element.getClientRects",
		"Range.getBoundingClientRect","Range.getClientRects",]
	let elements = ["known","h1","text1","text2","select","progress","button"]

	function output() {
		let res = [], aLies = [], aValue = [], isBypass = false, bypassHash
		let prevMini, prevHash
		for (let i=0; i < pretty.length; i++) {
			if (aBlock[i] === false) {
				// replace miniHashes
				let current = aDisplay[i]
				if (current !== prevMini) {
					prevHash = sha1(oData["run0"+i], "domrect [method "+ i +"]"); aDisplay[i] = prevHash
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

		//console.debug(performance.now() - t0 + " ms")
		log_section("domrect", t0, res)
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
}

countJS("domrect")
