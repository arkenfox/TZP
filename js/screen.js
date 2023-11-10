'use strict';

// sims
let intUAI = 0

/* SCREEN */

function return_lb(w,h,isNew) {
	// LB
		// TB13 aligns with newwin steps
	let wstep = 200, hstep = 200, bw = false, bh = false
	if (w < 501) {wstep = 50} else if (w < 1601) {wstep = isNew ? 200: 100}
	if (h < 501) {hstep = 50} else if (h < 1601) {hstep = 100}
	bw = Number.isInteger(w/wstep)
	bh = Number.isInteger(h/hstep)
	return (bw && bh) ? lb_green : lb_red
}

function return_nw(w,h, isNew) {
	// NW
		// TB13 changes to 1400 x 900 max
	let wstep = 200, hstep = 100, bw = false, bh = false
	if (w < (isNew ? 1401 : 1001)) {bw = Number.isInteger(w/wstep)}
	if (h < (isNew ? 901 : 1001)) {bh = Number.isInteger(h/hstep)}
	return (bw && bh) ? nw_green : nw_red
}

const get_scr_fullscreen = (runtype) => new Promise(resolve => {
	let oRes = {}
	let cssvalue = getElementProp(SECT1, "#cssDM", "display-mode_css")
	let isErrCss = cssvalue == zErr

	function get_display_mode() {
		const METRIC = "display-mode", METRIC2 = METRIC +"_css"
		let value, display
		try {
			let q = "(display-mode:"
			if (window.matchMedia(q +"fullscreen)").matches) {value = "fullscreen"}
			if (window.matchMedia(q +"browser)").matches) {value = "browser"}
			if (window.matchMedia(q +"minimal-ui)").matches) {value = "minimal-ui"}
			display = value
			if (isSmart && !isErrCss) {
				if (value !== cssvalue) {
					value = zLIE
					display = colorFn(display)
					log_known(SECT1, METRIC)
				}
			}
		} catch(e) {
			log_error(SECT1, METRIC, e)
			value = zErr
			display = zErr
		}
		log_display(1, METRIC, display)
		oRes[METRIC] = value
		oRes[METRIC2] = cssvalue
	}

	// fullScreen
	function get_fullScreen() {
		const METRIC = "fullScreen"
		let value, display
		if (isGecko) {
			try {
				// ToDo: shouldn't this be a standard and work in blink etc?
				value = window.fullScreen
				if (runSE) {foo++} else if (runST) {value = undefined}
				display = value
				if ("boolean" !== typeof value) {
					log_error(SECT1, METRIC, zErrType + typeof value)
					value = zErr
					display = zErr
				} else if (isSmart && !isErrCss) {
					let boolCss = cssvalue == "fullscreen" ? true : false
					if (boolCss !== value) {
						value = zLIE
						display = colorFn(display)
						log_known(SECT1, METRIC)
					}
				}
			} catch(e) {
				log_error(SECT1, METRIC, e)
				value = zErr
				display = value
			}
		} else {
			value = zNA; display = value
		}
		log_display(1, METRIC, display)
		oRes[METRIC] = value
	}

	// full-screen-api.enabled
	function get_mozFullScreenEnabled() {
		const METRIC = "mozFullScreenEnabled"
		let r = ""
		try {
			r = document.mozFullScreenEnabled
		} catch(e) {
			r = zErr
			log_error(SECT1, METRIC, e)
		}
		if (r !== true) {dom.fsLeak = zNA}
		log_display(1, METRIC, r)
		oRes[METRIC] = r
	}

	// do in order so oRes keys = sorted
	get_display_mode()
	get_fullScreen()
	get_mozFullScreenEnabled()
	if (runtype !== "resize") {
		addData(1, "fullscreen", oRes, mini(oRes))
	}
	return resolve()
})

const get_scr_measure = (runtype) => new Promise(resolve => {
	let t0 = nowFn()
	Promise.all([
		get_scr_mm(runtype, "measure"),
	]).then(function(mmres){
		let tmpScreen = {}, tmpWindow = {}, oScreen = {}, oWindow = {}

		// matchmedia
		tmpScreen["device-height"] = mmres[0]["device-height"]
		tmpScreen["device-width"] = mmres[0]["device-width"]
		tmpWindow["window_height"] = mmres[0]["window_height"]
		tmpWindow["window_width"] = mmres[0]["window_width"]
		// screen/window
		let aList = [
			"width","height","availWidth","availHeight", // scr
			"outerWidth","outerHeight","innerWidth","innerHeight", // window
		]
		for (let i=0; i < 8; i++) {
			let x
			let prefix = (i < 2) ? "screen_" : "" // width/height is ambiguous: also clashes with matchmedia inner
			try {
				if (i < 4) {x = screen[aList[i]]
				} else {x = window[aList[i]]
				}
				if (typeof x !== "number") {
					log_error(SECT1, prefix + aList[i], zErrType + typeof x)
					x = "NaN"
				}
			} catch (e) {
				log_error(SECT1, prefix + aList[i], e)
				x = zErr
			}
			if (i < 4) {tmpScreen[prefix + aList[i]] = x
			} else {tmpWindow[aList[i]] = x
			}
		}
		// css
		let cList = [
			["#S", "device-width_css", ":before"],
			["#S", "device-height_css", ":after"],
			["#D", "window_width_css", ":before"],
			["#D", "window_height_css", ":after"],
		]
		cList.forEach(function(array) {
			let value = getElementProp(SECT1, array[0], array[1], array[2])
			if ("number" !== typeof value && value !== "?") {
				log_error(SECT1, array[1], zErrType + typeof value)
				value = "NaN"
			}
			// NaNs
			if (array[0] == "#S") {
				tmpScreen[array[1]] = value
			} else {
				tmpWindow[array[1]] = value
			}
		})
		// default display
		let oDisplay = {
			"mAvailable": tmpScreen.availWidth +" x "+ tmpScreen.availHeight,
			"mmScreen": tmpScreen["device-width"] +" x "+ tmpScreen["device-height"],
			"mScreen": tmpScreen.screen_width +" x "+ tmpScreen.screen_height,
			"mOuter": tmpWindow.outerWidth +" x "+ tmpWindow.outerHeight,
			"mmInner": tmpWindow.window_width +" x "+ tmpWindow.window_height,
			"mInner": tmpWindow.innerWidth +" x "+ tmpWindow.innerHeight,
		}

		// order into new object
		for (const h of Object.keys(tmpScreen).sort()) {
			oScreen[h] = tmpScreen[h]
		}
		for (const k of Object.keys(tmpWindow).sort()) {
			oWindow[k] = tmpWindow[k]
		}
		if (isSmart) {
			// ToDo: oScreen/oWindow lies
				// replace values if proxy lies or detected lies vs valid css: srings help with valid health
				// record as known lies
				// change display style
		}

		// display
		for (const k of Object.keys(oDisplay)) {
			log_display(1, k, oDisplay[k])
		}
		// data
		if (runtype !== "resize") {
			addData(1, "screen_sizes", oScreen, mini(oScreen))
			addData(1, "window_sizes", oWindow, mini(oWindow))
		}

		// notations
		if (isSmart) {
			// inner: LB/NW: note TB13 changes newwin to max 1400x900, and aligns LB to match NW steps
			if (isOS !== "android") {
				log_display(1, "letterboxing", return_lb(tmpWindow.innerWidth, tmpWindow.innerHeight, isTB))
				log_display(1, "new_window", return_nw(tmpWindow.innerWidth, tmpWindow.innerHeight, isTB))
			}
			// screen_matches_inner
			let isValid = true, notation = sizes_red
			let aCompare = [oScreen.screen_width, oScreen.screen_height, oWindow.innerWidth, oWindow.innerHeight]
			for (let i=0; i < aCompare.length; i++) {
				if ("number" !== typeof aCompare[i]) {
					isValid = false
					break
				}
			}
			if (isValid) {
				if (aCompare[0] +"x"+ aCompare[1] === aCompare[2] +"x"+ aCompare[3]) {notation = sizes_green}
			}
			log_display(1, "screen_matches_inner", notation)
		}
	})
	return resolve()

	/*
	// notate
	let match = true, r = ""
	if (mScreen !== mAvailable) {match = false
	}	else if (mAvailable !== mOuter) {match = false
	}	else if (mOuter !== mInner) {match = false
	} else {
		aMeasures.forEach(function(value) {
			if (isNaN(value)) {match = false}
		})
	}
	r = match ? screen_green : screen_red
	dom.scrmatch.innerHTML = r
	*/

	// inner
	let newW = getElementProp(SECT1, "#D",":before"),
		newH = getElementProp(SECT1, "#D"),
		isLies = 0, oldW = w4, oldH = h4
	if (newW !== "?") {
		newW = newW * 1
		if (newW == oldW-1) {newW = oldW}
		if (newW !== oldW) {isLies++}
	}
	if (newH !== "?") {
		newH = newH.slice(3) * 1
		if (newH == oldH-1) {newH = oldH}
		if (newH !== oldH) {isLies++}
	}
	if (isLies > 0) {
		dom.mInner.innerHTML = colorFn(mInner)
		log_known(SECT1, "window inner")
	}
	res["window_inner"] = (isLies > 0 ? zLIE : mInner)

	// screen
	newW = getElementProp(SECT1, "#S",":before")
	newH = getElementProp(SECT1, "#S")
	isLies = 0, oldW = w1, oldH = h1
	if (newW !== "?") {
		newW = newW * 1
		if (newW == oldW-1) {newW = oldW}
		if (newW !== oldW) {isLies++}
	}
	if (newH !== "?") {
		newH = newH.slice(3) * 1
		if (newH == oldH-1) {newH = oldH}
		if (newH !== oldH) {isLies++}
	}
	if (["Screen.width","Screen.height"].some(lie => sData[SECT99].indexOf(lie) >= 0)) {isLies++}
	if (isLies > 0) {
		dom.mScreen.innerHTML = colorFn(mScreen)
		log_known(SECT1, "screen")
	}
	res["screen"] = (isLies > 0 ? zLIE : mScreen)

	// screen available
	isLies = false
	if (["Screen.availWidth","Screen.availHeight"].some(lie => sData[SECT99].indexOf(lie) >= 0)) {
		isLies = true
		dom.mAvailable.innerHTML = colorFn(mAvailable)
		log_known(SECT1, "screen available")
	}
	res["screen_available"] = (isLies > 0 ? zLIE : mAvailable)

	// outer
	res["window_outer"] = mOuter
		if (runtype !== "resize") {log_perf(SECT1, "scr/win",t0)}
	// resolve
	return resolve(res)

})

const get_scr_mm = (runtype, datatype) => new Promise(resolve => {
	const unable = "unable to find upper bound"
	const oList = {
		"measure": [
				["device-width", "device-width", "max-device-width", "px", 512, 0.01],
				["device-height", "device-height", "max-device-height", "px", 512, 0.01],
				["window_width", "width", "max-width", "px", 512, 0.01],
				["window_height", "height", "max-height", "px", 512, 0.01],
			],
		"pixels": [
			["-moz-device-pixel-ratio", "-moz-device-pixel-ratio", "max--moz-device-pixel-ratio", "", 4, 0.0000001],
			["-webkit-min-device-pixel-ratio", "-webkit-min-device-pixel-ratio", "-webkit-max-device-pixel-ratio", "", 4, 0.01],
				// webkit seems limited to and rounds down to 0.25, 0.5, 1, 2, 4
			["dpcm", "resolution", "max-resolution", "dpcm", 1e-5, 0.0000001],
			["dpi", "resolution", "max-resolution", "dpi", 1e-5, 0.0000001],
			["dppx", "resolution", "max-resolution", "dppx", 1e-5, 0.0000001],
		]
	}
	let list = oList[datatype], maxCount = oList[datatype].length, count = 0, oData = {}
	function exit(id, value) {
		if (value == unable) {
			log_error(SECT1, id, unable)
			value = zErr
		}
		oData[id] = value
		count++
		if (count == maxCount) {
			return resolve(oData)
		}
	}
	function runTest(callback){
		list.forEach(function(k){
			let metric = k[0], lower = k[1], upper = k[2], suffix = k[3], epsilon = k[4], precision = k[5]
			Promise.all([
				callback(lower, upper, suffix, epsilon, precision),
			]).then(function(result){
				exit(metric, result[0])
			}).catch(function(err){
				exit(metric, err)
			})
		})
	}
	function searchValue(tester, maxValue, precision){
		let minValue = 0
		let ceiling = Math.pow(2, 32)
		function stepUp(){
			if (maxValue > ceiling || runST){
				return Promise.reject(unable)
			}
			return tester(maxValue).then(function(testResult){
				if (testResult === searchValue.isEqual){
					return maxValue
				}
				else if (testResult === searchValue.isBigger){
					minValue = maxValue
					maxValue *= 2
					return stepUp()
				}
				else {
					return false
				}
			})
		}
		function binarySearch() {
			if (maxValue - minValue < precision) {
				return tester(minValue).then(function(testResult) {
					if (testResult.isEqual) {return minValue
					} else {
						return tester(maxValue).then(function(testResult) {
							if (testResult.isEqual) {return maxValue
							} else {
								return Promise.resolve(minValue) // +" to "+ maxValue // just return min
							}
						})
					}
				})
			} else {
				let pivot = (minValue + maxValue) / 2
				return tester(pivot).then(function(testResult) {
					if (testResult === searchValue.isEqual) {return pivot
					} else if (testResult === searchValue.isBigger) {
						minValue = pivot
						return binarySearch()
					} else {
						maxValue = pivot
						return binarySearch()
					}
				})
			}
		}
		return stepUp().then(function(stepUpResult) {
			if (stepUpResult){return stepUpResult
			} else {return binarySearch()}
		})
	}
	searchValue.isSmaller = -1
	searchValue.isEqual = 0
	searchValue.isBigger = 1

	runTest(function(prefix, maxPrefix, suffix, maxValue, precision) {
		return searchValue(function(valueToTest) {
			try {
				if (runSE) {foo++}
				if (window.matchMedia("("+ prefix +": "+ valueToTest + suffix+")").matches){
					return Promise.resolve(searchValue.isEqual)
				} else if (window.matchMedia("("+ maxPrefix +": "+ valueToTest + suffix+")").matches){
					return Promise.resolve(searchValue.isSmaller)
				} else {
					return Promise.resolve(searchValue.isBigger)
				}
			} catch(e) {
				log_error(SECT1, prefix, e, isScope, 40)
				return Promise.reject(zErr)
			}
		}, maxValue, precision)
	})
})

const get_scr_orientation = (type) => new Promise(resolve => {
	let oScreen = {}, oWindow = {}
	// matchmedia: sorted names
	let names = [
		["-moz-device-orientation", "#cssOm"],
		["device-aspect-ratio", "#cssDAR"],
		["aspect-ratio", "#cssAR"],
		["orientation", "#cssO"],
	]
	let l = "landscape", p = "portrait", q = "(orientation: ", s = "square", a = "aspect-ratio"
	let aWindow = [], aScreen = []
	for (let i=0; i < names.length; i++) {
		let value, isErr = false
		let METRIC = names[i][0], METRIC2 = METRIC +"_css"
		try {
			if (runSE) {foo++}
			if (i == 0) {
				if (window.matchMedia("(-moz-device-orientation:"+ l +")").matches) value = l
				if (window.matchMedia("(-moz-device-orientation:"+ p +")").matches) value = p
			} else if (i == 1) {
				if (window.matchMedia("(device-"+ a +":1/1)").matches) value = s
				if (window.matchMedia("(min-device-"+ a +":10000/9999)").matches) value = l
				if (window.matchMedia("(max-device-"+ a +":9999/10000)").matches) value = p
			} else if (i == 2) {
				if (window.matchMedia("("+ a +":1/1)").matches) value = s
				if (window.matchMedia("(min-"+ a +":10000/9999)").matches) value = l
				if (window.matchMedia("(max-"+ a +":9999/10000)").matches) value = p
			} else {
				if (window.matchMedia(q + p +")").matches) value = p
				if (window.matchMedia(q + l +")").matches) value = l
			}
			if (value == undefined) {value = zU}
		} catch(e) {
			log_error(SECT1, METRIC, e)
			value = zErr
			isErr = true
		}
		if (runSL) {value += "_fake"}
		let display = value
		// css
		let isLies = false
		let cssvalue = getElementProp(SECT1, names[i][1], METRIC2)
		let isErrCss = cssvalue == zErr
		if (isSmart && !isErr && !isErrCss) {
			if (value !== cssvalue) {
				display = colorFn(display)
				value = zLIE
				log_known(SECT1, names[i][0])
			}
		}
		if (i < 2) {
			aScreen.push(display)
			oScreen[METRIC] = value
			oScreen[METRIC2] = cssvalue
		} else {
			aWindow.push(display)
			oWindow[METRIC] = value
			oWindow[METRIC2] = cssvalue
		}
	}
	log_display(1, "screen_mmorientation", aScreen.join(" | "))
	log_display(1, "window_mmorientation", aWindow.join(" | "))

	// screen
	names = ["mozOrientation", "orientation.angle", "orientation.type"], aScreen = []
	for (let i=0; i < 3; i++) {
		let value
		try {
			if (runSE) {foo++}
			if (i == 0) {value = screen.mozOrientation
			} else if (i == 1) {value = screen.orientation.angle
			} else {value = screen.orientation.type
			}
			if (value == undefined) {value = zU}
		} catch(e) {
			log_error(SECT1, names[i], e)
			value = zErr
		}
		aScreen.push(value)
		oScreen[names[i]] = value
	}
	let display = aScreen.join(" | ")
	if (isSmart) {
		// does this makes sense? e.g. we control the screen, based on inner, so it should reflect
		// that, not sure about angle. i.e this is just lying about equivalency of already protected values?
		// ... BUT we should continue to protect -primary vs -secondary
		// ... AND we should make sure subpixels round up (e.g min)
		display += (display == "landscape-primary | 0 | landscape-primary" ? rfp_green : rfp_red)
	}
	log_display(1, "screen_orientation", display)

	if (type !== "resize") {
		// objects are already sorted
		addData(1, "screen_orientation", oScreen, mini(oScreen))
		addData(1, "window_orientation", oWindow, mini(oWindow))
	}
	return resolve()
})

const get_scr_pixels = (runtype) => new Promise(resolve => {
	function get_dpr() {
		const METRICw = "devicePixelRatio", METRICb = "devicePixelRatio_border"
		// DPR window
		let value, display
		try {
			if (runSE) {foo++}
			value = window.devicePixelRatio
			display = value
			if ("number" !== typeof value) {
				log_error(SECT1, METRICw, zErrType + typeof value)
				value = zErr
				display = "NaN"
			} else {
				varDPR = value
			}
		} catch(e) {
			display = log_error(SECT1, METRICw, e)
			value = zErr
		}
		let notation = ""
		if (isSmart) {
			notation = value === (isTB ? 2 : 1) ? rfp_green : rfp_red
		}
		log_display(1, METRICw, display + notation)
		oData[METRICw] = value

		// DPR border: 477157: don't notate this for health
		value = undefined, display = undefined
		try {
			let el = dom.dprBorder
			value = getComputedStyle(el).borderTopWidth
			if ("string" == typeof value) {
				let originalvalue = value
				value = value.slice(0, -2) * 1
				if (value > 0) {
					value = 1/value
					display = value
					varDPR = value // use this over window.dpr
				} else {
					log_error(SECT1, METRICb, zErrInvalid + cleanFn(originalvalue))
					value = zErr
					display = "NaN"
				}
			} else {
				// undefined, null, objects, arrays
				log_error(SECT1, METRICb, zErrType + typeof value)
				value = zErr
				display = "NaN"
			}
		} catch(e) {
			log_error(SECT1, METRICb, e)
			value = zErr
			display = zErr
		}
		log_display(1, METRICb, display)
		oData[METRICb] = value
		return
	}

	// DPI
	function get_dpi() {
		const METRIC = "dpi_div", METRIC2 = "dpi_css"
		//note: divDPI relies on css: if css is blocked (dpi_y = 0) this causes issues
		// measure div
		try {dpi_x = Math.round(dom.divDPI.offsetWidth * varDPR)} catch(e) {dpi_x = zErr}
		try {dpi_y = Math.round(dom.divDPI.offsetHeight * varDPR)} catch(e) {dpi_y = zErr}
		let diffDPI = 0
		varDPI = dpi_y // default
		if (isSmart) {
			// varDPI: fallback checks: allow 1 x diff; use highest value
			if (dpi_y !== 0 && !isNaN(dpi_y)) {
				// this is the one: RFP spoofs cssDPI and mmDPI
				varDPI = dpi_y
			} else if ("number" == typeof cssDPI && mmDPI !== zErr) {
				diffDPI = Math.abs(mmDPI - cssDPI)
				varDPI = (diffDPI == 1 ? mmDPI : cssDPI)
			} else if (mmDPI !== zErr) {
				varDPI = mmDPI
			}
			// notate css
			log_display(1, METRIC2, (cssDPI == 96 ? rfp_green : rfp_red))
		}
		log_display(1, METRIC, varDPI)
		oData[METRIC2] = cssDPI
		oData[METRIC] = varDPI
		return
	}

	// visualViewport scale
	function get_vv_scale() {
		// FF63+: dom.visualviewport.enabled
		// FF91+: default true (desktop at least)
		const METRIC = "visualViewport_scale"
		let value = "", display = ""
		try {
			value = visualViewport.scale
			if (runSE) {foo++} else if (runST) {value +=""}
			display = value
			if ("number" !== typeof value) {
				log_error(SECT1, METRIC, zErrType + typeof vvScale)
				display = "NaN"
				value = zErr
			}
		} catch(e) {
			display = log_error(SECT1, METRIC, e)
			value = zErr
		}
		log_display(1, METRIC, display)
		if (runtype !== "resize") {
			oData[METRIC] = value
		}
		return
	}

	// run
		// if dpi_x/y stay at 0 = css blocked or offsetWidth blocked
	let t0 = nowFn()
	let oData = {}
	let varDPR, varDPI, mmDPI, dpi_x = 0, dpi_y = 0
	let cssDPI = getElementProp(SECT1, "#P", "dpi_css", ":before")
	if (cssDPI !== "?" && cssDPI !== zErr) {
		if ("number" !== typeof cssDPI) {
			cssDPI = "NaN"
			log_error(SECT1, "dpi_css", zErrType + typeof cssDPI)
		}
	}

	// get
	Promise.all([
		get_scr_mm(runtype, "pixels")
	]).then(function(results){

		for (const k of Object.keys(results[0])) {
			// expected 100% zoom values
			let oMatch = {
				"-moz-device-pixel-ratio": 1,
				"-webkit-min-device-pixel-ratio": 1,
				"dpcm": 37.79527499999999,
				"dpi": 96.00000000000003,
				"dppx": 1,
			}
			let value = results[0][k], notation = ""
			if (isSmart && oMatch[k] !== undefined) {
				notation = value == oMatch[k] ? rfp_green : rfp_red
			}
			oData[k] = value
			log_display(1, k, value + notation)
		}
		get_dpr()
		get_dpi()
		get_vv_scale()
		if (runtype !== "resize") {
			let newobj = {}
			for (const k of Object.keys(oData).sort()) {newobj[k] = oData[k]}
			addData(1, "pixels", newobj, mini(newobj))
			log_perf(SECT1, "pixels", t0, "", varDPI +" "+ cssDPI	+" "+ oData["dpi"] +" "+ dpi_x +" "+ dpi_y)
		}
		return resolve()
	})
})

const get_scr_positions = (type) => new Promise(resolve => {
	const METRIC = type +"_positions"
	let oRes = {}, notation = "", aDisplay = [], aList, check, x
	if (type == "screen") {
		// screen notes
			// left/top = 0 depends on secondary monitor
			// availLeft/availTop = 0 depends on docker/taskbar
		aList = ["availLeft","availTop","left","top"]
		check = "6b858c97"
	} else {
		// window notes
			// FS = all 0 except sometimes mozInnerScreenY
			// maximized can include negatives for screenX/Y
		aList = ["mozInnerScreenX","mozInnerScreenY","screenX","screenY"]
		check = "66a7ee25"
	}
	aList.forEach(function(k){
		try {
			x = type == "screen" ? screen[k] : window[k]
			if (typeof x !== "number") {
				log_error(SECT1, type +"."+ k, zErrType + typeof x)
				x = "NaN"
			}
		} catch(e) {
			log_error(SECT1, type +"."+ k, e)
			x = zErr
		}
		oRes[k] = x
		aDisplay.push(x)
	})
	let hash = mini(oRes)
	if (isSmart) {notation = hash == check ? rfp_green : rfp_red}
	log_display(1, METRIC, aDisplay.join(", ") + notation)
	addData(1, METRIC, oRes, hash)
	return resolve()
})

const get_scr_scrollbar = (runtype) => new Promise(resolve => {
  // ui.useOverlayScrollbars: 0 = no, 1 = yes use-overlays
	// win11 = overlay = very thin scrollbar

  // https://bugzilla.mozilla.org/show_bug.cgi?id=1786665
		// widget.non-native-theme.scrollbar.style = values 1 to 5
		// widget.non-native-theme.scrollbar.size.override <-- non-overlay only?

	Promise.all([
		// get the viewport width: we only return zErr or a number
		get_scr_viewport(runtype)
	]).then(function(res) {
		let t0 = nowFn()
		let oData = {}, aDisplay = []

		// css inner width
		let cssW = getElementProp(SECT1, "#D", "innerWidth_css", ":before")

		// scrollWidth
		function get_scrollwidth(METRIC) {
			let value, display
			try {
				let scrollWidth = dom.eScroll.scrollWidth
				if ("number" !== typeof scrollWidth) {scrollWidth = "x"}
				value = (100 - scrollWidth)
				if (runSE) {foo++} else if (runST) {value = "x"}
				if ("number" !== typeof value) {
					log_error(SECT1, METRIC, zErrType + typeof value)
					value = zErr
					display = "NaN"
				} else if (isSmart & value < 0) {
					display = colorFn(value)
					value = zLIE
					if (runtype !== "resize") {log_known(SECT1, METRIC)}
				} else {
					display = value
				}
			} catch(e) {
				value = zErr
				display = zErr
				log_error(SECT1, METRIC, e)
			}
			oData[METRIC] = value
			aDisplay.push(display)
		}

		// viewport (calculated from element), visualViewport
		function get_viewport(METRIC) {
			let viewport = METRIC == "viewport" ? res[0][0] : res[0][1]
			let value, display
			if (viewport == zErr) {
				value = zErr
				display = zErr
			} else {
				try {
					let innerwidth = window.innerWidth
					if ("number" !== typeof innerwidth) {
						log_error(SECT1, METRIC, zErrType + typeof value)
						value = zErr
						width = "NaN"
					} else {
						value = (innerWidth - viewport)
						display = value
						if (isSmart) {
							// leverage css value
							if (cssW !== "?") {
								if (cssW * 1 == value - 1) {cssW = value} // allow for min-
								value = cssW - viewport
								display = value
							}
							// lies
							if (value < -1) {
								value = zLIE
								display = colorFn(eWidth)
								if (runtype !== "resize") {log_known(SECT1, METRIC)}								
							}
						}
					}
				} catch(e) {
					value = zErr; display = zErr
					log_error(SECT1, METRIC, e)
				}
			}
			oData[METRIC] = value
			aDisplay.push(display)
		}

		get_scrollwidth("scrollWidth")
		get_viewport("viewport")
		get_viewport("visualViewport")
		const METRIC = "scrollbar_widths"
		log_display(1, METRIC, aDisplay.join(" | "))
		addData(1, METRIC, oData, mini(oData))
		if (runtype !== "resize") {log_perf(SECT1, METRIC, t0)}
		return resolve()
	})
})

const get_scr_viewport = (runtype) => new Promise(resolve => {
	let t0 = nowFn()
	let oData = {}, aDisplay = []

	// viewport
	// visualViewport: note: FF63+ dom.visualviewport.enabled FF91+ default true (desktop at least)
	function get_viewport(type) {
		let METRIC1 = "viewport_height", METRIC2 = "viewport_width"
		if (type == "vViewport") {
			METRIC1 = "visualViewport_height", METRIC2 = "visualViewport_width"
		}
		let wValue, hValue, wDisplay = "", hDisplay, range
		try {
			if (runSE) {foo++}
			if (type == "eViewport") {
				let target = document.createElement("div")
				target.style.cssText = "position:fixed;top:0;left:0;bottom:0;right:0;"
				document.documentElement.insertBefore(target,document.documentElement.firstChild)
				if (isClientRect == -1) {
					wValue = target.offsetWidth
					hValue = target.offsetHeight
				} else {
					if (isClientRect > 1) {
						range = document.createRange()
						range.selectNode(target)
					}
					if (isClientRect < 1) {
						wValue = target.getBoundingClientRect().width
						hValue = target.getBoundingClientRect().height
					} else if (isClientRect == 1) {
						wValue = target.getClientRects()[0].width
						hValue = target.getClientRects()[0].height
					} else if (isClientRect == 2) {
						wValue = range.getBoundingClientRect().width
						hValue = range.getBoundingClientRect().height
					} else if (isClientRect > 2) {
						wValue = range.getClientRects()[0].width
						hValue = range.getClientRects()[0].height
					}
				}
				document.documentElement.removeChild(target)
			} else {
				wValue = window.visualViewport.width
				hValue = window.visualViewport.height
			}
			if (runST) {hValue = undefined}
			if ("number" !== typeof hValue) {
				log_error(SECT1, METRIC1, zErrType + typeof hValue)
				hValue = zErr
				hDisplay = "NaN"
			} else {
				hDisplay = hValue
				if (gLoad) {avh = hValue} // get android height once
			}
			if (runST) {wValue = ""}
			if ("number" !== typeof wValue) {
				log_error(SECT1, METRIC2, zErrType + typeof wValue)
				wValue = zErr
				wDisplay = "NaN"
			} else {
				wDisplay = wValue
			}
		} catch(e) {
			hValue = zErr; wValue = zErr
			hDisplay = log_error(SECT1, METRIC1, e); wDisplay = ""
			log_error(SECT1, METRIC2, e)
		}
		oData[METRIC1] = hValue
		oData[METRIC2] = wValue
		if (runtype !== "height") {
			log_display(1, type, (wDisplay == "" ? hDisplay : wDisplay +" x "+ hDisplay))
		}
	}

	get_viewport("eViewport")
	get_viewport("vViewport")
	// return
	if (runtype == "height") {
		let vvh = oData["visualViewport_height"]
		return resolve(vvh !== zErr ? vvh : oData["viewport_height"]) // android tests
	} else {
		// perf
		if (runtype !== "resize") {
			addData(1, "viewport", oData, mini(oData))
			log_perf(SECT1, "viewport", t0, "", "e: "+ oData["viewport_height"] +" v: "+ oData["visualViewport_height"] +" a: "+ avh)
		}
		return resolve([oData["viewport_width"], oData["visualViewport_width"]]) // for scrollbar
	}
})

/* UA */

function get_ua_workers() {
	//dom.uaWorkers = "summary not coded yet"
	//dom.uaWorker3 // nested
	//dom.uaWorker4 // from blob

	// control
	let list = ['appCodeName','appName','appVersion','platform','product','userAgent'],
		res = [],
		r = ""
	for (let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = zErr}
		r = cleanFn(r)
		res.push(list[i] +":"+ r)
	}
	let control = mini(res)

	// web
	let el0 = dom.uaWorker0, test0 = ""
	if (isFile) {
		el0.innerHTML = zNA
	} else {
		try {
			let workernav = new Worker("js/worker_ua.js")
			el0.innerHTML = zF
			workernav.addEventListener("message", function(e) {
				//console.log("ua worker", e.data)
				test0 = mini(e.data)
				el0.innerHTML = test0 + (test0 == control ? match_green : match_red)
				workernav.terminate
			}, false)
			workernav.postMessage("")
		} catch(e) {
			el0.innerHTML = log_error("ua","worker", e, "worker")
		}
	}
	// shared
	let el1 = dom.uaWorker1, test1 = ""
	try {
		let sharednav = new SharedWorker("js/workershared_ua.js")
		el1.innerHTML = zF
		sharednav.port.addEventListener("message", function(e) {
			//console.log("ua shared", e.data)
			test1 = mini(e.data)
			el1.innerHTML = test1 + (test1 == control ? match_green : match_red)
			sharednav.port.close()
		}, false)
		sharednav.port.start()
		sharednav.port.postMessage("")
	} catch(e) {
		el1.innerHTML = log_error("ua","shared worker", e, "shared_worker")
	}
	// service
	let el2 = dom.uaWorker2, test2 = ""
	el2.innerHTML = zF // assume failure
	try {
		// register
		navigator.serviceWorker.register("js/workerservice_ua.js").then(function(swr) {
			let sw
			if (swr.installing) {sw = swr.installing}
			else if (swr.waiting) {sw = swr.waiting}
			else if (swr.active) {sw = swr.active}
			sw.addEventListener("statechange", function(e) {
				if (e.target.state == "activated") {
					sw.postMessage("")
				}
			})
			if (sw) {
				// listen
				let channel = new BroadcastChannel("sw-ua")
				channel.addEventListener("message", event => {
					//console.log("ua service", event.data.msg)
					test2 = mini(event.data.msg)
					el2.innerHTML = test2 + (test2 == control ? match_green : match_red)
					// unregister & close
					swr.unregister().then(function(boolean) {})
					channel.close()
				})
			} else {
				el2.innerHTML = zF +" ["+ sw +"]"
			}
		},
		function(e) {
			el2.innerHTML = log_error("ua","service worker", e, "service_worker")
		})
	} catch(e) {
		el2.innerHTML = log_error("ua","service worker", e, "service_worker")
	}
}

/* OS SPECIFIC */

function get_android_tbh() {
	// toolbar height if user has chosen to "hide the toolbar when scrolling down a page"
	// avh global var s/be with toolbar visible: hence use new value > avh
	// We only need one diff since the viewport size "snaps" to the new value
	window.addEventListener('scroll', toolbarScroll)
	function toolbarScroll() {
		// ignore fullscreen
		if (window.fullScreen == false) {
			// delay: allow time for toolbar change
			setTimeout(function() {
				let vh_new = get_scr_viewport("height")
				if (vh_new > avh) {
					dom.tbh = (vh_new - avh)
				}
			}, 800)
		}
	}
}

function get_android_tap() {
	if (isBlock || isOS !== "android") {
		return
	}
	setTimeout(function() {
		// use viewport: doesn't change on zoom
		Promise.all([
			get_scr_viewport("height")
		]).then(function(result){
			// avh: captured once on first load: s/be with toolbar visible at fit width (e.g. 1800)
			// since the "tap/touch" event exits FS, we can rely on avh
			// event also triggered by losing focus
			let vh_new = result[0]
			dom.kbh = avh + " | " + vh_new +" | "+ (avh - vh_new)

			// ToDo: keyboard height: use setInterval
			// keyboard can be slow to open + it "slides" (stepped changes)
			// instead check x times + return the max abs diff

			// also grab the inner window
			let iw
			try {
				iw = window.innerWidth +" x "+ window.innerHeight
			} catch(e) {
				iw = log_error(SECT1, "tap", e)
			}
			dom.tiw = iw
		})
	}, 1000) // wait for keyboard
}

/* USER TESTS */

function goFS() {
	dom.fsLeak = ""
	const initialState = getElementProp(SECT1, "#cssDM", "display-mode_css")

	let ih1 = window.innerHeight,
		delay = 1, n = 1,
		sizeS = [], sizeE = []
	function exitFS() {
		// if we were already in FS mode, allow a transition
		let exitdelay = initialState == "browser" ? 1 : 400
		document.removeEventListener("mozfullscreenchange", getFS)
		setTimeout(function() {
			document.exitFullscreen()
		}, exitdelay)			
	}
	function getFS() {
		if (document.mozFullScreen) {
			setTimeout(function() {
				let iw = document.mozFullScreenElement.clientWidth,
					ih = document.mozFullScreenElement.clientHeight
				dom.fsLeak = screen.width +" x "+ screen.height +" [screen] "+ iw +" x "+ ih +" [mozFullScreenElement client]"
				exitFS()
				// TB desktop warning panel
				if (isTB && isOS !== "android") {
					setTimeout(function(){
					let ih2 = window.innerHeight
						let panel = ih1-ih2
						if (panel !== 0) {
							dom.fsLeak.innerHTML = dom.fsLeak.textContent +"<br>"+ panel +"px [warning panel height]"
						}
					}, 600)
				}
			}, delay)
		}
	}
	if (document.mozFullScreenEnabled) {
		let element = dom.imageFS
		if (isOS == "android") {delay = 1000}
		element.mozRequestFullScreen()
		document.addEventListener("mozfullscreenchange", getFS)
	} else {
		dom.fsLeak = zNA
	}
}

function goNW() {
	dom.newWinLeak = ""
	let sizesi = [], // inner history
		sizeso = [], // outer history
		n = 1, // setInterval counter
		newWinLeak = ""

	// open
		// was: "tests/newwin.html"
		// use "about:blank" (same as forcing a delay with a non-existant website)
	let newWin = window.open("about:blank","width=9000,height=9000")
	let iw = newWin.innerWidth,
		ih = newWin.innerHeight,
		ow = newWin.outerWidth,
		oh = newWin.outerHeight
	sizesi.push(iw +" x "+ ih)
	sizeso.push(ow +" x "+ oh)
	// default output
	newWinLeak = iw +" x "+ ih +" [inner] "+ ow +" x "+ oh +" [outer]"

	function check_newwin() {
		let diffsi = [], // 4 inner sizes
			diffso = [], // 4 outer sizes
			changesi = 0,
			changeso = 0
		// detect changes
		let prev = sizesi[0]
		let strInner = s1 +"inner: "+ sc + iw +" x "+ ih
		for (let k=0; k < sizesi.length; k++) {
			if (sizesi[k] !== prev ) {
				changesi++;	strInner += s1 +" &#9654 <b>["+ k +"]</b> "+ sc + sizesi[k]
			}
			prev = sizesi[k]
		}
		prev = sizeso[0]
		let strOuter = s1 +"outer: "+ sc + ow +" x "+ oh
		for (let k=0; k < sizeso.length; k++) {
			if (sizeso[k] !== prev ) {
				changeso++;	strOuter += s1 +" &#9654 <b>["+ k +"]</b> "+ sc + sizeso[k]
			}
			prev = sizeso[k]
		}
		// one or two lines
		if (changesi > 0 || changeso > 0) {
			newWinLeak = strInner +"<br>"+ strOuter
		}
		// output
		dom.newWinLeak.innerHTML = newWinLeak
	}
	function build_newwin() {
		// check n times as "fast" as we can/dare
		if (n == 150) {
			clearInterval(checking)
			check_newwin()
		} else {
			// grab metrics
			try {
				sizesi.push(newWin.innerWidth +" x "+ newWin.innerHeight)
				sizeso.push(newWin.outerWidth +" x "+ newWin.outerHeight)
			} catch(e) {
				clearInterval(checking)
				// if not "permission denied", eventually we always get
				// NS_ERROR_UNEXPECTED which we can ignore. Always output
				check_newwin()
			}
		}
		n++
	}
	let checking = setInterval(build_newwin, 3)
}

function goNW_UA() {
	dom.uaHashOpen = ""
	// control
	let list = ['appCodeName','appName','appVersion','buildID','oscpu',
		'platform','product','productSub','userAgent','vendor','vendorSub'],
		res = [],
		control = [],
		sim = [],
		r = ""

	let newWin = window.open()
	let newNavigator = newWin.navigator
	list.forEach(function(prop) {
		// control
		try {r = cleanFn(navigator[prop])} catch(e) {r = zErr}
		control.push(prop +":"+ r)
		if (prop == "appCodeName") { r = "moZillla"}
		if (prop == "appVersion") { r = "5.0 (toaster)"}
		if (prop == "userAgent") { r = "moZillla/5.0 (toaster)"}
		sim.push(prop +":"+ r)
		// newwin
		try {r = cleanFn(newNavigator[prop])} catch(e) {r = zErr}
		res.push(prop +":"+ r)
	})
	newWin.close()

	// hash
	if (runSL) {res = sim}
	let hash = mini(res)
	let controlhash = mini(control)
	// output
	if (hash == controlhash) {
		hash += match_green
	} else {
		let sStr = "ua_navigator_new_window_reported_diff_notglobal", diffs = []
		for (let i = 0; i < res.length; i++) {
			if (res[i] !== control[i]) {diffs.push(res[i])}
		}
		addDetail(sStr, diffs)
		hash += match_red + addButton(2, sStr, "diff")
	}
	dom.uaHashOpen.innerHTML = hash
}

/* OUTPUT */

function outputUA(os = isOS) {
	let t0 = nowFn()
	let aReported = [], oComplex = {}

	function outputStatic(property, reported, expected, isErr) {
		reported = cleanFn(reported)
		let display = reported
		reported = isErr ? zErr : reported
		let fpvalue = reported, notation = ""
		if (isSmart && reported !== expected) {
			if (isErr) {
				fpvalue = zErr
			} else if (sData[SECT99].includes("Navigator."+ property)) {
				// lies
				display = colorFn(display)
				log_known(SECT2, property)
			}
			// health
			notation = rfp_red
		}
		aReported.push(property +":"+ reported) // for uaDoc
		addData(2, property, fpvalue)
		log_display(2, property, "~"+display+"~"+ notation)
	}
	function get_property(property, expected) {
		let isErr = false, str = ""
		try {
			str = navigator[property]
			if (runSE) {foo++}
		} catch(e) {
			isErr = true
			str = log_error(SECT2, property, e)
		}
		if (expected !== undefined) {
			outputStatic(property, str, expected, isErr)
		} else {
			oComplex[property] = [str, isErr]
		}
	}
	// STATIC
	get_property("appCodeName", "Mozilla")
	get_property("appName", "Netscape")
	get_property("product", "Gecko")
	get_property("buildID", "\"20181001000000\"")
	get_property("productSub", "\"20100101\"")
	get_property("vendor", "empty string")
	get_property("vendorSub", "empty string")
	// MORE COMPLEX
	get_property("appVersion")
	get_property("platform")
	get_property("oscpu")
	get_property("userAgent")

	// RFP notation: nsRFPService.h
	let oRFP = {
		"android": {
			"appVersion": "5.0 (Android 10)",
			"oscpu": "Linux aarch64",
			"platform": "Linux aarch64",
			"ua_os": "Android 10; Mobile",
		},
		"linux": {
			"appVersion": "5.0 (X11)",
			"oscpu": "Linux x86_64",
			"platform": "Linux x86_64",
			"ua_os": "X11; Linux x86_64",
		},
		"mac": {
			"appVersion": "5.0 (Macintosh)",
			"oscpu": "Intel Mac OS X 10.15",
			"platform": "MacIntel",
			"ua_os": "Macintosh; Intel Mac OS X 10.15",
		},
		"windows": {
			"appVersion": "5.0 (Windows)",
			"platform": "Win32",
			"oscpu": "Windows NT 10.0; Win64; x64",
			"ua_os": "Windows NT 10.0; Win64; x64",
		},
	}
	if (isSmart && os !== undefined) {
		let uaVer = isVer, isDroid = isOS == "android"
		let uaRFP = "Mozilla/5.0 (" + oRFP[os].ua_os +"; rv:" // base
		let uaNext = uaRFP // only used if ver+

		if (uaVer < 120) {
			// 1818889: RFP 115-119 rv=109, droid version = 115
			uaRFP += "109.0) Gecko/"+ (isDroid ? "115.0" : "20100101") +" Firefox/"+ (isDroid? "115" : uaVer) +".0"
		} else {
			// 1806690: RFP 120+ drops frozen rv + droid version spoof
			uaRFP += uaVer +".0) Gecko/" + (isDroid ? uaVer +".0" : "20100101") +" Firefox/"+ uaVer +".0"
			// next
			if (isVerExtra === "+") {
				let nxtVer = uaVer + 1
				uaNext += nxtVer +".0) Gecko/"+ (isDroid ? nxtVer +".0" : "20100101") +" Firefox/"+ nxtVer +".0"
				oRFP[os]["userAgentNext"] = uaNext
			}
		}
		oRFP[os]["userAgent"] = uaRFP
	}

	for (const k of Object.keys(oComplex)) {
		let notation = ""
		if (runSL && isSmart) {sData[SECT99].push("Navigator."+ k)}
		let reported = oComplex[k][0],
			isErr = oComplex[k][1]
		reported = cleanFn(reported)
		let display = "~"+ reported +"~"
		let fpvalue = reported

		if (isErr) {
			display = "~"+ reported +"~" + (isSmart ? rfp_red : "")
			fpvalue = zErr
			reported = zErr
		} else if (isSmart) {
			if (sData[SECT99].includes("Navigator."+ k)) {
				fpvalue = zLIE
				display = "~"+ colorFn(reported) +"~" + rfp_red
				log_known(SECT2, k)
			} else if (os !== undefined) {
				let rfpvalue = "~"+ oRFP[os][k] +"~"
				if (rfpvalue !== "~undefined~") {
					let isMatch = rfpvalue === display
					if (k == "userAgent" && !isMatch && isVerExtra == "+") {
						isMatch = "~"+ oRFP[os][k +"Next"] +"~" == display
					}
					notation = isMatch ? rfp_green : rfp_red
				}
			}
		}
		aReported.push(k+ ":"+ reported) // for uaDoc
		addData(2, k, fpvalue)
		log_display(2, k, display + notation)
	}
	aReported.sort()
	log_display(2, "uaDoc", mini(aReported))
	log_section(2, t0)
}

function outputFD() {
	let t0 = nowFn()

	if (!isGecko) {
		addData(3, "browser", "non-gecko")
		log_display(3, "fdBrandingCss", zNA)
		log_display(3, "fdResourceCss", zNA)
		log_display(3, "browser", zNA)
		log_display(3, "browser_architecture", zNA)
		log_display(3, "os", zNA)
		log_display(3, "version", zNA)
		log_section(3, t0)
		return
	}

	// logo
	if (gLoad || isLogo == zErr || runST || runSE) {
		try {
			let el = dom.aboutlogo
			let width = el.width, height = el.height
			if (runSE) {foo++} else if (runST) {width +=""}
			if ("number" !== typeof width || "number" !== typeof height) {
				log_error(SECT3, "logo", zErrType + typeof width +" x "+ typeof height)
				isLogo = zErr
			} else {
				isLogo = width +" x "+ height
			}
		} catch(e) {
			isLogo = zErr
			log_error(SECT3, "logo", e)
		}
	}
	// about-wordmark.svg
		// record both: if missing = 0x0 (hidden) | = image placeholder size (offscreen)
	if (gLoad || isWordmark == zErr || runST || runSE) {
		try {
			let isHidden, isOffscreen
			// hidden
			let el = dom.brandinghidden
			let width = el.width, height = el.height
			if (runSE) {foo++} else if (runST) {height +=""}
			if ("number" !== typeof width || "number" !== typeof height) {
				log_error(SECT3, "wordmark", zErrType + typeof width +" x "+ typeof height)
				isWordmark = zErr
			} else {
				isHidden = width +" x "+ height
				// offscreen
				el = dom.branding
				isOffscreen = el.width +" x "+ el.height
				if (isHidden !== isOffscreen) {isHidden += " | " + isOffscreen}
				isWordmark = isHidden
			}
		} catch(e) {
			isWordmark = zErr
			log_error(SECT3, "wordmark", e)
		}
	}
	// set isMullvad for diffs between TB vs MB; otherwise it _is_ TB in tests
	if (gLoad && !isTB && isOS !== "android") {
		let aMBVersions = [102, 115]
		if (aMBVersions.includes(isVer) && isWordmark + isLogo  == "400 x 32300 x 236") {
			isMullvad = true
			isTB = true
			tb_green = sgtick+"MB]"+sc
			tb_red = sbx+"MB]"+sc
			tb_standard = sg+"[MB Standard]"+sc
			tb_safer = sg+"[MB Safer]"+sc
			intl_green = sgtick+"MB matches locale]"+sc
			intl_red = sbx+"MB matches locale]"+sc
		}
	}
	// browser
	let METRIC = "browser"
	let browser = (isMullvad ? "Mullvad Browser" : (isTB ? "Tor Browser" : "Firefox"))

	log_display(3, METRIC, browser + " | "+ isLogo +" | "+ isWordmark)
	addData(3, METRIC, browser)
	addData(3, "logo", isLogo)
	addData(3, "wordmark", isWordmark)

	// eval
	METRIC = "eval.toString"
	try {
		let len = eval.toString().length
		if (runSE) {foo++} else if (runST) {len = 43}
		if (len !== 37) {
			log_error(SECT3, METRIC, zErrInvalid + len)
		}
	} catch(e) {
		log_error(SECT3, METRIC, e)
	}

	// os
	METRIC = "os"
	let hasErr = isOSErr !== undefined
	log_display(3, METRIC, (hasErr ? isOSErr : isOS))
	addData(3, METRIC, (hasErr ? zErr : isOS))

	// version
	let ver = isVer
	if (isVerExtra !== "") {ver += isVerExtra}
	addDataDisplay(3, "version", ver)

	// os arch: FF110+ pref removed: error means 32bit
	METRIC = "browser_architecture"
	if (isArch === true) {
		log_display(3, METRIC, "64bit")
		addData(3, METRIC, 64)
	} else {
		let isMsg = isArch === "RangeError: invalid array length"
		if (ver > 109 && isMsg) {
			log_display(3, METRIC, "32bit")
			addData(3, METRIC, 32)
		} else {
			log_display(3, METRIC, isArch)
			addData(3, METRIC, zErr)
		}
	}
	log_section(3, t0)
}

function outputScreenResize(runtype) {
	if (runtype !== "screen") {runtype = "resize"}
	// make sure display is reset
	try {sDataTemp.display.document["1"] = {}} catch(e) {}

	return new Promise(resolve => {
		Promise.all([
			get_scr_fullscreen(runtype),
			get_scr_positions("screen"),
			get_scr_positions("window"),
			get_scr_pixels(runtype),

			get_scr_scrollbar(runtype), // gets viewport
			get_scr_orientation(runtype),
			get_scr_measure(runtype),

		]).then(function(results){
			if (runtype !== "screen") {
				// display
				for (const d of Object.keys(sDataTemp["display"][isScope]["1"])) {
					let str
					try {
						str = sDataTemp["display"][isScope]["1"][d]
						dom[d].innerHTML = str
					} catch(e) {
						console.error(d, str, e)
					}
				}
				return
			} else {
				let res = []
				results.forEach(function(currentResult) {
					if ("object" === typeof currentResult) {
						if (Array.isArray(currentResult)) {
							res.push(currentResult)
						} else {
							for (const k of Object.keys(currentResult)) {
								res.push([k, currentResult[k]])
							}
						}
					}
				})
				return resolve(res)
			}
		})
	})
}

function outputScreen() {
	let t0 = nowFn()
	Promise.all([
		outputScreenResize("screen"),
	]).then(function(results){
		results.forEach(function(item) {
			addDataFromArray(1, item)
		})
		addData(1, "window_initial", isWindow, mini(isWindow))
		if (isOS == "android") {
			let inner = isWindow.innerWidth + " x " + isWindow.innerHeight,
				outer = isWindow.outerWidth + " x " + isWindow.outerHeight
			// do every time
			if (isSmart) {
				let match = inner == outer
				log_display(1,"window_initial", (match ? window_green : window_red))
			}
			// do once
			if (gLoad) {
				log_display(1,"initialOuter", outer)
				log_display(1,"initialInner", inner)
				get_android_tbh() // listen for toolbar
			}
		} else if (gLoad) {
			// do once
			window.addEventListener("resize", outputScreenResize)
		}
		log_section(1, t0)
	})
}

countJS(SECT1)
