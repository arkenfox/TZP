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

const get_scr_fullscreen = () => new Promise(resolve => {
	let oRes = {}

	function get_display_mode() {
		const METRIC = "display-mode"
		let value, display
		try {
			let q = "(display-mode:"
			if (window.matchMedia(q +"fullscreen)").matches) {value = "fullscreen"}
			if (window.matchMedia(q +"browser)").matches) {value = "browser"}
			if (window.matchMedia(q +"minimal-ui)").matches) {value = "minimal-ui"}
			display = value
			if (isSmart) {
				let cssCheck = getElementProp(SECT1, "#cssDM")
				if (value !== cssCheck && cssCheck !== "x") {
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

	// fullScreen
	function get_fullScreen() {
		const METRIC = "fullScreen"
		let value, display
		try {
			value = window.fullScreen
			if (runSE) {foo++} else if (runST) {value = undefined}
			display = value
			if ("boolean" !== typeof value) {
				log_error(SECT1, METRIC, zErrType + typeof value)
				value = zErr
				display = zErr
			} else if (isSmart) {
				let cssCheck = getElementProp(SECT1, "#cssDM")
				if (cssCheck !== "x") {
					cssCheck = cssCheck == "fullscreen" ? true : false
					if (cssCheck !== value) {
						value = zLIE
						display = colorFn(display)
						log_known(SECT1, METRIC)
					}
				}
			}
		} catch(e) {
			log_error(SECT1, METRIC, e)
			value = zErr
			display = value
		}
		log_display(1, METRIC, display)
		oRes[METRIC] = value
	}

	get_display_mode()
	get_mozFullScreenEnabled()
	get_fullScreen()
	return resolve(oRes)
})

const get_scr_subpixels = (runtype) => new Promise(resolve => {
	function return_mm_dpi(type, denominator) {
		const METRIC = "max-resolution_"+ type
		let r = ""
		try {
			r = (function() {
				let i = 1
				for (1; i < 3001; i++) {
					let n = i/denominator
					if (matchMedia("(max-resolution:"+ n + type +")").matches === true) {return n}
				}
				log_error(SECT1, METRIC, zErrInvalid +"> "+ ((i-1)/denominator))
				return zErr
			})()
		} catch(e) {
			log_error(SECT1, METRIC, e)
			return zErr
		}
		return r
	}
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
		if (isSmart) {notation = value === 1 ? rfp_green : rfp_red}
		log_display(1, METRICw, display + notation)
		oSubpixels[METRICw] = value

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
		oSubpixels[METRICb] = value
		return
	}

	// DPI x 3 methods, DPPX, DPCM
	function get_dpi() {
		const METRIC = "dpi"
		let mmDPPX = return_mm_dpi("dppx",100),
			mmDPCM = return_mm_dpi("dpcm",10)
		mmDPI = return_mm_dpi("dpi",1)
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
			} else if (cssDPI !== "x" && mmDPI !== zErr) {
				diffDPI = Math.abs(mmDPI - cssDPI)
				varDPI = (diffDPI == 1 ? mmDPI : cssDPI)
			} else if (mmDPI !== zErr) {
				varDPI = mmDPI
			}
		}
		log_display(1, "mmDPI", mmDPI +" | "+ mmDPPX +" | "+ mmDPCM)
		log_display(1, METRIC, varDPI)
		oSubpixels[METRIC] = varDPI
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
		oSubpixels[METRIC] = value
		return
	}

	// run
		// if dpi_x/y stay at 0 = css blocked or offsetWidth blocked
	let t0 = nowFn()
	let oSubpixels = {}
	let varDPR, varDPI, mmDPI, dpi_x = 0, dpi_y = 0
	let cssDPI = getElementProp(SECT1, "#P",":before")
	// get
	get_dpr()
	get_dpi()
	get_vv_scale()
	if (runtype !== "resize") {
		log_perf(SECT1, "dpi/dpr", t0, "", varDPI +" "+ cssDPI	+" "+ mmDPI +" "+ dpi_x +" "+ dpi_y)
	}
	return resolve(oSubpixels)
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
		let value
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
			log_error(SECT1, names[i][0], e)
			value = zErr
		}
		if (runSL) {value += "_fake"}
		let display = value
		// css
		let isLies = false
		let cssvalue = getElementProp(SECT1, names[i][1])
		if (isSmart && value !== zErr && cssvalue !== "x") {
			if (value !== cssvalue) {
				display = colorFn(display)
				value = zLIE
				log_known(SECT1, names[i][0])
			}
		}
		if (i < 2) {
			aScreen.push(display)
			oScreen[names[i][0]] = value
			oScreen[names[i][0] +"_css"] = cssvalue
		} else {
			aWindow.push(display)
			oWindow[names[i][0]] = value
			oWindow[names[i][0] +"_css"] = cssvalue
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
	// we need to wait for the viewport width
	Promise.all([
		get_scr_viewport(runtype)
	]).then(function(res){
		let t0 = nowFn()
		// css inner width
		let cssW = getElementProp(SECT1, "#D",":before")

		// element
		function get_sb_element() {
			const METRIC = "scollbar_element"
			let value, display
			try {
				value = (100 - dom.eScroll.scrollWidth)
				if (runSE) {foo++}
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
			return [display, value]
		}

		// viewport
		function get_sb_viewport() {
			let eViewport = res[0][0] // calculated from element

		}


		/*
		let eViewport = res[0][0] // calculated from element
		let eWidth, eValue, eLies = false
		if (eViewport == zErr) {
			eValue = eViewport
			eWidth = eViewport
		} else if (isSmart && "number" !== typeof eViewport) {
			eWidth = "NaN"; eLies = true; eValue = zLIE
		} else {
			try {
				eWidth = (window.innerWidth - eViewport)
				eWidth = cleanFn(eWidth)
				eValue = eWidth
				if (isSmart) {
					// leverage css value
					let cssE = cssW
					if (cssE !== "x" && "number" == typeof eWidth) {
						if (cssE * 1 == eWidth - 1) {cssE = eWidth} // allow for min-
						eWidth = cssE - eViewport
					}
					// lies
					let eMin = -1
					if ("number" !== typeof eWidth) {eLies = true
					} else if (eWidth < eMin) {eLies = true}
					eValue = eLies ? zLIE : eWidth
				}
			} catch(e) {
				eWidth = zErr; eValue = zErr
				log_error(SECT1, "scrollbar_viewport", e)
			}
		}
		if (eLies) {
			eWidth = colorFn(eWidth); if (runtype !== "resize") {log_known(SECT1, "scrollbar_viewport")}
		}
		*/

		// visualViewport
		function get_sb_visualviewport() {

		}
		/*
		let vViewport = res[0][1]
		let vValue, vWidth, vLies = false
		if (vViewport == eViewport) {
			vValue = eValue
			vWidth = eWidth
			vLies = eLies
		} else if (vViewport == zErr) {
			vValue = vViewport
			vWidth = vViewport
		} else if ("number" !== typeof vViewport) {
			vWidth = "NaN"; vLies = true; vValue = zLIE
		} else {
			try {
				vWidth = (window.innerWidth - vViewport)
				vWidth = cleanFn(vWidth)
				vValue = vWidth
				if (isSmart) {
					// leverage css value
					if (cssW !== "x" && "number" == typeof vWidth) {
						if (cssW * 1 == vWidth - 1) {cssW = vWidth} // allow for min-
						vWidth = cssW - vViewport
					}
					// lies
					let vMin = -1
					if ("number" !== typeof vWidth) {vLies = true
					} else if (vWidth < vMin) {vLies = true}
					vValue = vLies ? zLIE : vWidth
				}
			} catch(e) {
				vWidth = zErr; vValue = zErr
				log_error(SECT1, "scrollbar_visualViewport", e)
			}
		}
		if (vLies) {
			vWidth = colorFn(vWidth); if (runtype !== "resize") {log_known(SECT1, "scrollbar_visualViewport")}
		}
		*/

		get_sb_element()
		get_sb_viewport()
		get_sb_visualviewport()


		// display
		//dom.mScrollbar.innerHTML = vWidth +" | "+ eWidth +" | "+ elWidth
		if (runtype !== "resize") {log_perf(SECT1, "scrollbars", t0)}
		return resolve(["scrollbars", "TBA"])
	})
})

function get_scr_viewport(runtype) {
	let t0 = nowFn()
	// element
	let eViewport, evh, evw, eValue, eValid = false
	try {
		if (runSE) {foo++}
		let e = document.createElement("div")
		e.style.cssText = "position:fixed;top:0;left:0;bottom:0;right:0;"
		document.documentElement.insertBefore(e,document.documentElement.firstChild)
		evw = e.offsetWidth
		evh = e.offsetHeight
		document.documentElement.removeChild(e)
		if (isSmart && "number" !== typeof evw || "number" !== typeof evh) {
			eViewport = colorFn(cleanFn(evw) +" x "+ cleanFn(evh))
			eValue = "NaN"
			log_known(SECT1, "viewport")
		} else {
			eValid = true; eValue = evw
			if (avh == "") {avh = evh} // get android height once
			eViewport = cleanFn(evw) +" x "+ cleanFn(evh)
		}
	} catch(e) {
		eViewport = log_error(SECT1,"viewport", e)
		eValue = zErr
	}

	// visualViewport
	// note: FF63+ dom.visualviewport.enabled FF91+ default true (desktop at least)
	let vViewport, vvw, vvh, vValue, vValid = false
	try {
		if (runSE) {foo++}
		vvw = window.visualViewport.width
		vvh = window.visualViewport.height
		if (isSmart && "number" !== typeof vvw || "number" !== typeof vvh) {
			vViewport = colorFn(cleanFn(vvw) +" x "+ cleanFn(vvh))
			vValue = "NaN"
			log_known(SECT1, "visualViewport size")
		} else {
			vValid = true; vValue = vvw
			if (avh == "") {avh = vvh} // get android height once
			vViewport = cleanFn(vvw) +" x "+ cleanFn(vvh)
		}
	} catch(e) {
		vViewport = log_error(SECT1, "visualViewport size", e)
		vValue = zErr
	}

	// get viewport height once on first load
	if (avh == "") {avh = "undefined"}

	// return
	if (runtype == "height") {
		return vValid ? evh : vvh // android tests
	} else {
		dom.eViewport = eViewport
		dom.vViewport.innerHTML = vViewport
		// perf
		if (runtype !== "resize") {
			log_perf(SECT1, "viewport", t0, "", "e: "+ evh +" v: "+ vvh +" a: "+ avh)
		}
		return [eValue, vValue] // scrollbar
	}
}

function get_scr_window(runtype) {
	return new Promise(resolve => {
		let t0 = nowFn()
		let res = {}
		// MEASURE: ToDo: catch errors/undefined etc
		let aMeasures = []
		let aPos = []
		let aList = [
			"screen.width","screen.height","screen.availWidth","screen.availHeight",
			"window.outerWidth","window.outerHeight","window.innerWidth","window.innerHeight",
		]
		for (let i=0; i < 8; i++) {
			let x
			try {
				if (i == 0) {x = screen.width
				} else if (i == 1) {x = screen.height
				} else if (i == 2) {x = screen.availWidth
				} else if (i == 3) {x = screen.availHeight
				} else if (i == 4) {x = window.outerWidth
				} else if (i == 5) {x = window.outerHeight
				} else if (i == 6) {x = window.innerWidth
				} else if (i == 7) {x = window.innerHeight
				}
				if (typeof x !== "number") {
					log_error(SECT1, aList[i], zErrType + typeof x)
					x = "NaN"
				}
			} catch (e) {
				log_error(SECT1, aList[i], e)
				x = zErr
			}
			aMeasures.push(x)
		}

		let w1 = aMeasures[0], h1 = aMeasures[1],
			w2 = aMeasures[2], h2 = aMeasures[3],
			w3 = aMeasures[4], h3 = aMeasures[5],
			w4 = aMeasures[6], h4 = aMeasures[7]
		let mScreen = w1 +" x "+ h1,
			mAvailable = w2 +" x "+ h2,
			mOuter = w3 +" x "+ h3,
			mInner = w4 +" x "+ h4
		// default display
		dom.mScreen = mScreen
		dom.mAvailable = mAvailable
		dom.mOuter = mOuter
		dom.mInner.innerHTML = mInner

		if (!isSmart) {
			res["screen"] = mScreen
			res["screen_available"] = mAvailable
			res["window_inner"] = mInner
			res["window_outer"] = mOuter
			return resolve(res)
		}

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

		// inner: LB/NW
		if (isOS !== "android") {
			// TB changes newwin to max 1400x900, and aligns LB to match NW steps
			let isNewSteps = (isTB && isVer > 102)
			log_display(1, "letterboxing", return_lb(w4,h4, isNewSteps))
			log_display(1, "new_window", return_nw(w4,h4, isNewSteps))
		}

		// inner
		let newW = getElementProp(SECT1, "#D",":before"),
			newH = getElementProp(SECT1, "#D"),
			isLies = 0, oldW = w4, oldH = h4
		if (newW !== "x") {
			newW = newW * 1
			if (newW == oldW-1) {newW = oldW}
			if (newW !== oldW) {isLies++}
		}
		if (newH !== "x") {
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
		if (newW !== "x") {
			newW = newW * 1
			if (newW == oldW-1) {newW = oldW}
			if (newW !== oldW) {isLies++}
		}
		if (newH !== "x") {
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
}

function get_scr_window_mm(runtype) {
	return new Promise(resolve => {
		let t0 = nowFn()
		let count = 0, res = []
		let unable = "unable to find upper bound"
		// perf
		function perf(id, str, type) {
			if (runtype == "screen" && id == "devicePixelRatio_moz") {
				addData(1, id, ("number" == typeof str ? str : zErr))
			}
			document.getElementById(id).innerHTML = str //== unable ? zErr : str
			if (str == unable) {
				log_error(SECT1, "matchmedia "+ type, unable)
			}
			count++
			if (count == 3) {
				if (runtype !== "resize") {log_perf(SECT1, "mm scr/win",t0)}
				return resolve("skip")
			}
		}

		function runTest(callback){
			// screen
			Promise.all([
				callback("device-width", "max-device-width", "px", 512, 0.01), // 0.01
				callback("device-height", "max-device-height", "px", 512, 0.01) // 0.01
			]).then(function(device){
				perf("mmScreen", device.join(" x "), "screen")
			}).catch(function(err){
				perf("mmScreen", err, "screen")
			})
			// inner
			Promise.all([
				callback("width", "max-width", "px", 512, 0.01),
				callback("height", "max-height", "px", 512, 0.01)
			]).then(function(inner){
				perf("mmInner", inner.join(" x "), "inner")
			}).catch(function(err){
				perf("mmInner", err, "inner")
			})
			// moz
			callback("-moz-device-pixel-ratio", "max--moz-device-pixel-ratio", "", 2, 0.0000001
			).then(function(moz){
				perf("devicePixelRatio_moz", moz, "-moz-device-pixel-ratio")
			}).catch(function(err){
				perf("devicePixelRatio_moz", err, "-moz-device-pixel-ratio")
			})
		}
		function searchValue(tester, maxValue, precision){
			let minValue = 0
			let ceiling = Math.pow(2, 32)
			function stepUp(){
				if (maxValue > ceiling){
					return Promise.reject("unable to find upper bound")
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
			function binarySearch(){
				if (maxValue - minValue < precision){
					return tester(minValue).then(function(testResult){
						if (testResult.isEqual){
							return minValue
						}
						else {
							return tester(maxValue).then(function(testResult){
								if (testResult.isEqual){
									return maxValue
								}
								else {
									return Promise.resolve(
										minValue // +" to "+ maxValue // just return min
									)
								}
							})
						}
					})
				}
				else {
					let pivot = (minValue + maxValue) / 2
					return tester(pivot).then(function(testResult){
						if (testResult === searchValue.isEqual){
							return pivot
						}
						else if (testResult === searchValue.isBigger){
							minValue = pivot
							return binarySearch()
						}
						else {
							maxValue = pivot
							return binarySearch()
						}
					})
				}
			}
			return stepUp().then(function(stepUpResult){
				if (stepUpResult){
					return stepUpResult
				}
				else {
					return binarySearch()
				}
			})
		}
		searchValue.isSmaller = -1
		searchValue.isEqual = 0
		searchValue.isBigger = 1

		runTest(function(prefix, maxPrefix, suffix, maxValue, precision){
			return searchValue(function(valueToTest){
				try {
					//if (runSE) {foo++}
					if (window.matchMedia("("+ prefix +": "+ valueToTest + suffix+")").matches){
						return Promise.resolve(searchValue.isEqual)
					}
					else if (window.matchMedia("("+ maxPrefix +": "+ valueToTest + suffix+")").matches){
						return Promise.resolve(searchValue.isSmaller)
					}
					else {
						return Promise.resolve(searchValue.isBigger)
					}
				} catch(e) {
					if (prefix == "-moz-device-pixel-ratio") {prefix = "devicePixelRatio_moz"}
					return Promise.reject(log_error("screen", prefix, e, isScope, 40))
				}
			}, maxValue, precision)
		})
	})
}

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
	if (isBlock) {
		return
	}
	if (isOS == "android") {
		// wait for keyboard
		setTimeout(function() {
			// use viewport: doesn't change on zoom
			let vh_new = get_scr_viewport("height")
			// Compare to avh (captured on first load: s/be with toolbar visible)
			// Since the event exits FS, we can rely on avh
			// use absolute value: event also triggered losing focus
			dom.kbh = Math.abs(avh - vh_new)
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
		}, 1000)
	}
}

/* USER TESTS */

function goFS() {
	dom.fsLeak = ""
	const initialState = getElementProp(SECT1, "#cssDM")
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
		// 1818889: RFP 115+ uses rv freeze at 109
		let uaVer = isVer, rvVer = (isVer > 114 && isVer < 120 ? 109 : isVer)
		let uaRFP = "Mozilla/5.0 (" + oRFP[os].ua_os +"; rv:", uaNext = uaRFP
		if (os == "android") {
			// android = ESR
			uaVer = isVer < 115 ? 102 : 115
			rvVer = isVer < 114 ? uaVer : 109
			uaRFP += rvVer +".0) Gecko/"+ uaVer +".0 Firefox/"+ uaVer +".0"
		} else {
			uaRFP += rvVer +".0) Gecko/20100101 Firefox/"+ uaVer +".0"
			// desktop next: only used if isVerExtra = "+" currently > 114
			rvVer = (uaVer + 1) < 120 ? 109 : rvVer +1 // don't increment frozen
			uaNext += (rvVer) +".0) Gecko/20100101 Firefox/"+ (uaVer +1) +".0"
			oRFP[os]["userAgentNext"] = uaNext
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
					// ignore userAgent android open-ended version
					if (k !== "userAgent" || os !== "android" || os == "android" && isVerExtra !== "+") {
						notation = isMatch ? rfp_green : rfp_red
					}
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

	// version
	let r = isVer
	if (isVerExtra !== "") {r += isVerExtra}
	addDataDisplay(3, "version", r)

	// os
	METRIC = "os"
	let hasErr = isOSErr !== undefined
	log_display(3, METRIC, (hasErr ? isOSErr : isOS))
	addData(3, METRIC, (hasErr ? zErr : isOS))

	// os arch: FF110+ pref removed: error means 32bit
	METRIC = "browser_architecture"
	let notation = ""
	let check = (isTB && isSmart && isVer < 110) // TB health check
	if (isArch === true) {
		notation = check ? tb_red : ""
		log_display(3, METRIC, "64bit" + notation)
		addData(3, METRIC, 64)
	} else {
		let isMsg = isArch === "RangeError: invalid array length"
		if (isVer > 109 && isMsg) {
			if (check) {notation = tb_red}
			log_display(3, METRIC, "32bit" + notation)
			addData(3, METRIC, 32)
		} else {
			if (check) {notation = (isMsg ? tb_green : tb_red)}
			log_display(3, METRIC, isArch + notation)
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
			get_scr_fullscreen(),
			get_scr_positions("screen"),
			get_scr_positions("window"),
			get_scr_subpixels(runtype),

			get_scr_scrollbar(runtype), // gets viewport
			get_scr_orientation(runtype),
			get_scr_window(runtype),
			get_scr_window_mm(runtype),

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
