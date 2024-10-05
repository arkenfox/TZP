'use strict';

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

function get_scr_fs_measure() {
	// triggered by resize events if in FS
	// called by goFS
	if (gFS) {return} // don't run if already running
	gFS = true // set running state
	let delay = 25, max = 40, n = 1 // 40 x 25 = 1sec
	let w, h, w1, h1
	let isElementFS = document.fullscreen || document.webkitIsFullscreen || false
	let target = document.fullscreenElement, range, data

	if (isElementFS) {
		if (isDomRect > 1) {
			range = document.createRange()
			range.selectNode(target)
		}
		if (isDomRect == 0) {
			data = document.fullscreenElement.getBoundingClientRect()
		} else if (isDomRect == 1) {
			data = document.fullscreenElement.getClientRects()[0]
		}
	}

	function measure() {
		if (isElementFS) {
			// use domrect but fallback to client
			if (isDomRect == -1) {
				w = document.fullscreenElement.clientWidth
				h = document.fullscreenElement.clientHeight
			} else if (isDomRect < 1) {
				w = data.width; h = data.height
			} else if (isDomRect == 1) {
				w = data.width; h = data.height
			} else if (isDomRect == 2) {
				data = range.getBoundingClientRect()
				w = data.width; h = data.height
			} else if (isDomRect > 2) {
				data = range.getClientRects()[0]
				w = data.width; h = data.height
			}
		} else {
			w = window.innerWidth; h = window.innerHeight
		}
		if (w1 == undefined) {w1 = w; h1 = h} // remember first values
		return w +' x '+ h
	}
	// initial size
	let size = measure()
	let output = isElementFS ? dom.fsElement : dom.fsSize
	output.innerHTML = ''

	function check_size() {
		clearInterval(checking)
		let len = oDiffs.length
		if (len > 0) {
			let lastValue = oDiffs[len-1]
			let lastSize = lastValue.split(':')[1]
			let stepsTaken = ((lastValue.split(':')[0]) * 1)
			let timeTaken = stepsTaken * delay
			let diff = '[diff: '+ (w - w1) +' x '+ (h - h1) +']'
			timeTaken = Math.ceil(timeTaken/50) * 50 // round up in 50s
			size = size + s1 +' &#9654 '+ sc + lastSize + s1 +' <b>[~'+ timeTaken +' ms]</b> '+ sc + diff
		}
		output.innerHTML = size
		if (isElementFS) {document.exitFullscreen()}
		gFS = false // reset
	}

	let current = size, oDiffs = [], nochange = 0
	function build_sizes() {
		if (n >= max) {
			check_size()
		} else {
			// grab changes
			try {
				let newsize = measure()
				if (newsize !== current) {
					nochange = 0
					oDiffs.push(n +':'+ newsize)
					current = newsize
				} else {
					nochange++
					if (nochange > 25) {check_size()} // exit
				}
			} catch(e) {
				check_size()
			}
		}
		n++
	}
	let checking = setInterval(build_sizes, delay)
}

const get_scr_fullscreen = (METRIC) => new Promise(resolve => {
	let oRes = {}
	let cssvalue = getElementProp(1, '#cssDM', METRIC +'_display-mode_css')
	let isErrCss = cssvalue == zErr

	function get_display_mode(item) {
		// https://developer.mozilla.org/en-US/docs/Web/CSS/@media/display-mode
		const item2 = item +'_css'
		let data, isLies = false
		try {
			let q = '(display-mode:'
			if (window.matchMedia(q +'browser)').matches) {data = 'browser'
			} else if (window.matchMedia(q +'fullscreen)').matches) {data = 'fullscreen'
			} else if (window.matchMedia(q +'minimal-ui)').matches) {data = 'minimal-ui'
			} else if (window.matchMedia(q +'standalone)').matches) {data = 'standalone'
			}
			if (!isGecko) {
				if (window.matchMedia(q +'window-controls-overlay)').matches) {data = 'window-controls-overlay'}
			}
			if (runST) {data = undefined} else if (runSL) {data += '_fake'}
			let typeCheck = typeFn(data)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (isSmart && !isErrCss && data !== cssvalue) {
				log_known(1, METRIC +"_"+ item, data); isLies = true
			}
		} catch(e) {
			log_error(1, METRIC +"_"+ item, e); data = zErr
		}
		addDisplay(1, item, data,'','', isLies)
		oRes[item] = isLies ? zLIE : data
		oRes[item2] = cssvalue
		// get FS measurments if in FS
		let isElementFS = document.fullscreen || document.webkitIsFullscreen || false
		if (!isElementFS && 'fullscreen' == data && 'android' !== isOS) {
			get_scr_fs_measure()
		} else {
			gFS = false // cancel run state
		}
	}

	// fullScreen
	function get_fullScreen(item) {
		let data, isLies = false
		try {
			data = window.fullScreen
			if (runST) {data = undefined}
			let typeCheck = typeFn(data)
			if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
			// lies
			let boolCss = 'fullscreen' == cssvalue ? true : false
			if (runSL) {data = !boolCss}
			if (isSmart && !isErrCss && boolCss !== data) {
				log_known(1, METRIC +"_"+ item, data)
				isLies = true
			}
		} catch(e) {
			log_error(1, METRIC +"_"+ item, e); data = zErr
		}
		// can't use fullScreen because blink returns window.fullScreen as the element id='fullScreen'
		addDisplay(1, 'window'+ item, data,'','', isLies)
		oRes[item] = isLies ? zLIE : data
	}

	// full-screen-api.enabled
	function get_mozFullScreenEnabled(item) {
		let data
		try {
			data = document.mozFullScreenEnabled
			if (runST) {data = undefined}
			let typeCheck = typeFn(data)
			if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
		} catch(e) {
			log_error(1, METRIC +"_"+ item, e); data = zErr
		}
		addDisplay(1, item, data)
		oRes[item] = data
	}

	// in order so oRes keys = sorted
	get_display_mode('display-mode')
	get_fullScreen('fullScreen')
	get_mozFullScreenEnabled('mozFullScreenEnabled')
	addData(1, METRIC, oRes, mini(oRes))
	return resolve()
})

const get_scr_measure = () => new Promise(resolve => {
	Promise.all([
		get_scr_mm('measure'),
	]).then(function(mmres){
		let oTmp = {'screen': {}, 'window': {}, 'iframe': {}}, oIframe = {}, oScreen = {}, oWindow = {}
		// matchmedia
		oTmp.screen["device-height"] = mmres[0]["device-height"]
		oTmp.screen["device-width"] = mmres[0]["device-width"]
		oTmp.window["height"] = mmres[0]["height"]
		oTmp.window["width"] = mmres[0]["width"]
		// screen/window
		let oList = {
			'screen': ["width","height","availWidth","availHeight"],
			'window': ["outerWidth","outerHeight","innerWidth","innerHeight"],
			"iframe": ["width","height","availWidth","availHeight","outerWidth","outerHeight"],
		}
		let iTarget
		try {iTarget = dom.iFrameBlank.contentWindow} catch(e) {}

//runST = true
		for (const k of Object.keys(oList)) {
			let aList = oList[k]
			for (let i=0; i < aList.length; i++) {
				let x, p = aList[i]
				try {
					if ('screen' == k) {x = screen[p]
					} else if ('window' == k) {x = window[p]
					} else {
						if (i < 4) {x = iTarget.screen[p]} else {x = iTarget.window[p]}
					}
					if (runST) {
						let oTest = {1: NaN, 2: Infinity, 3: "", 4: "6", 5: null, 6: false, 7: [1], 8: {1:1}}
						x = oTest[i]
					}
					let typeCheck = typeFn(x)
					if ("number" !== typeCheck) {throw zErrType + typeCheck}
				} catch (e) {
					log_error(1, k +'_sizes_' + p, e)
					x = zErr
				}
				oTmp[k][p] = x
			}
		}

//runST = false
		// css
		let cssList = [
			['#S', ':before', 'device-width_css', 'screen'],
			['#S', ':after', 'device-height_css', 'screen'],
			['#D', ':before', 'width_css', 'window'],
			['#D', ':after', 'height_css', 'window'],
		]
		cssList.forEach(function(array) {
			let cssID = array[0], pseudo = array[1], item = array[2], metric = array[3]
			let value = getElementProp(1, cssID, metric +'_sizes_'+ item, pseudo)
			if (value !== zErr && '?' !== value) {
				let cType = typeFn(value)
				if ("number" !== cType) {
					log_error(1, metric +'_sizes_'+ item, zErrType + cType)
					value = zErr
				}
			}
			if (array[0] == "#S") {oTmp.screen[item] = value} else {oTmp.window[item] = value}
		})
		// default display
		let oDisplay = {
			"iAvailable": oTmp.iframe.availWidth +" x "+ oTmp.iframe.availHeight,
			"iScreen": oTmp.iframe.width +" x "+ oTmp.iframe.height,
			"iOuter": oTmp.iframe.outerWidth +" x "+ oTmp.iframe.outerHeight,
			"mAvailable": oTmp.screen.availWidth +" x "+ oTmp.screen.availHeight,
			"mmScreen": oTmp.screen["device-width"] +" x "+ oTmp.screen["device-height"],
			"mScreen": oTmp.screen.width +" x "+ oTmp.screen.height,
			"mOuter": oTmp.window.outerWidth +" x "+ oTmp.window.outerHeight,
			"mmInner": oTmp.window.width +" x "+ oTmp.window.height,
			"mInner": oTmp.window.innerWidth +" x "+ oTmp.window.innerHeight,
			"initialInner": isInitial.innerWidth + " x " + isInitial.innerHeight,
			"initialOuter": isInitial.outerWidth + " x " + isInitial.outerHeight,
		}

		// order into new objects
		for (const k of Object.keys(oTmp.screen).sort()) {oScreen[k] = oTmp.screen[k]}
		for (const k of Object.keys(oTmp.window).sort()) {oWindow[k] = oTmp.window[k]}
		for (const k of Object.keys(oTmp.iframe).sort()) {oIframe[k] = oTmp.iframe[k]}

		// notations
		let notation ='', initData = zNA, initHash =''
		// screen_size_matches_inner
		let oCompare = {
			'screen_size_matches_inner': [sizes_red, sizes_green, oScreen.width, oScreen.height, oWindow.innerWidth, oWindow.innerHeight],
			'iframe_sizes_match_inner': [isizes_red, isizes_green,
				oIframe.availWidth, oIframe.availHeight, oIframe.width, oIframe.height, oIframe.outerWidth, oIframe.outerHeight
			],
		}
		// window_sizes_initial
		if ('android' == isOS) {
			oCompare['window_sizes_initial'] = [window_red, window_green,
				isInitial.innerWidth, isInitial.innerHeight, isInitial.outerWidth, isInitial.outerHeight
			]
			// FP data
			initData = isInitial; initHash = mini(isInitial)
		} else {
			// LB/NW
			addDisplay(1, 'window_letterbox','','', return_lb(oTmp.window.innerWidth, oTmp.window.innerHeight, isTB))
			addDisplay(1, 'window_newwin','','', return_nw(oTmp.window.innerWidth, oTmp.window.innerHeight, isTB))
		}
		let isIframesSame = false
		for (const k of Object.keys(oCompare)) {
			let isValid = true, data = oCompare[k]
			notation = data[0]
			for (let i=2; i < oCompare[k].length; i++) {if ("number" !== typeFn(data[i])) {isValid = false; break}}
			if (isValid) {
				let isGood = false
				let test1 = data[2] +''+ data[3], test2 = data[4] +''+ data[5]
				if ('iframe_sizes_match_inner' == k) {
					let test3 = data[6] +''+ data[7]
					if (test1 === test2 && test1 == test3) {
						isIframesSame = true
						if (test1 === oWindow.innerWidth +''+ oWindow.innerHeight) {isGood = true}
					}
				} else {
					if (test1 === test2) {isGood = true}
				}
				if (isGood) {notation = data[1]}
			}
			addDisplay(1, k,'','', notation)
		}
		// ToDo: screen_sizes (_match)
		// ToDo: window_sizes (_match)

		//addDisplay(1, 'iframe_sizes_match_inner','','', isizes_red)

		// simple health lookups
		if (gRun) {
			let strInner = oTmp.window.innerWidth +' x '+ oTmp.window.innerHeight
			let strScreen = oTmp.screen['device-width'] +' x '+ oTmp.screen['device-height']
			let scrMatch = strInner == strScreen ? strInner : 'inner: '+ strInner +' | screen: '+ strScreen
			let initInner = isInitial.innerWidth + " x " + isInitial.innerHeight
			let initOuter = isInitial.outerWidth + " x " + isInitial.outerHeight
			let initMatch = initInner == initOuter ? initInner : 'inner: '+ initInner +' | outer: '+ initOuter
			let iframeMatch = "available: "+ oTmp.iframe.availWidth +" x "+ oTmp.iframe.availHeight
				+ " | screen: "+ oTmp.iframe.width +" x "+ oTmp.iframe.height
				+ " | outer: "+ oTmp.iframe.outerWidth +" x "+ oTmp.window.outerHeight
			if (isIframesSame) {iframeMatch = oTmp.iframe.availWidth +" x "+ oTmp.iframe.availHeight}

			sDetail[isScope].lookup['iframe_sizes_match_inner'] = iframeMatch
			sDetail[isScope].lookup['screen_size_matches_inner'] = scrMatch
			sDetail[isScope].lookup['window_letterbox'] = strInner
			sDetail[isScope].lookup['window_newwin'] = strInner
			sDetail[isScope].lookup['window_sizes_initial'] = initMatch
		}
		// add data/display
		for (const k of Object.keys(oDisplay)) {addDisplay(1, k, oDisplay[k])}
		addData(1, "screen_sizes", oScreen, mini(oScreen))
		addData(1, "window_sizes", oWindow, mini(oWindow))
		addData(1, "iframe_sizes", oIframe, mini(oIframe))
		addData(1, "window_sizes_initial", initData, initHash)
		return resolve()
	})

	/* // old compare code
	let match = true, r = ""
	if (mScreen !== mAvailable) {match = false
	}	else if (mAvailable !== mOuter) {match = false
	}	else if (mOuter !== mInner) {match = false
	} else {
		aMeasures.forEach(function(value) {
			if (Number.isNaN(value)) {match = false}
		})
	}
	r = match ? screen_green : screen_red
	dom.scrmatch.innerHTML = r

	// inner
	let newW = getElementProp(1, "#D",":before"),
		newH = getElementProp(1, "#D"),
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
		dom.mInner.innerHTML = log_known(1, "window inner", mInner)
	}
	res["window_inner"] = (isLies > 0 ? zLIE : mInner)

	// screen
	newW = getElementProp(1, "#S",":before")
	newH = getElementProp(1, "#S")
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
		dom.mScreen.innerHTML = log_known(1, "screen", mScreen)
	}
	res["screen"] = (isLies > 0 ? zLIE : mScreen)

	// screen available
	isLies = false
	if (["Screen.availWidth","Screen.availHeight"].some(lie => sData[SECT99].indexOf(lie) >= 0)) {
		isLies = true
		dom.mAvailable.innerHTML = log_known(1, "screen available", mAvailable)
	}
	res["screen_available"] = (isLies > 0 ? zLIE : mAvailable)

	*/
})

const get_scr_mm = (datatype) => new Promise(resolve => {
	const unable = "unable to find upper bound"
	const oList = {
		"measure": [
			['screen_sizes', "device-width", "device-width", "max-device-width", "px", 512, 0.01],
			['screen_sizes', "device-height", "device-height", "max-device-height", "px", 512, 0.01],
			['window_sizes', "width", "width", "max-width", "px", 512, 0.01],
			['window_sizes', "height", "height", "max-height", "px", 512, 0.01],
		],
		"pixels": [
			['pixels', "-moz-device-pixel-ratio", "-moz-device-pixel-ratio", "max--moz-device-pixel-ratio", "", 4, 0.0000001],
			['pixels', "-webkit-min-device-pixel-ratio", "-webkit-min-device-pixel-ratio", "-webkit-max-device-pixel-ratio", "", 4, 0.01],
				// ^ webkit seems limited to and rounds down to 0.25, 0.5, 1, 2, 4
			['pixels', "dpcm", "resolution", "max-resolution", "dpcm", 1e-5, 0.0000001],
			['pixels', "dpi", "resolution", "max-resolution", "dpi", 1e-5, 0.0000001],
			['pixels', "dppx", "resolution", "max-resolution", "dppx", 1e-5, 0.0000001],
		]
	}
	const oPrefixes = {
		"device-width": 'screen_sizes',
		"device-height": 'screen_sizes',
		"width": 'window_sizes',
		"height": 'window_sizes',
		"-moz-device-pixel-ratio": 'pixels',
		"-webkit-min-device-pixel-ratio": 'pixels',
		"dpcm": 'pixels',
		"dpi": 'pixels',
		"dppx": 'pixels',
	}

	let list = oList[datatype], maxCount = oList[datatype].length, count = 0, oData = {}
	function exit(id, value) {
		if (value == unable) {
			let prefix = oPrefixes[id]
			log_error(1, prefix +"_"+ id, unable)
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
			let group = k[0], metric = k[1], lower = k[2], upper = k[3],
				suffix = k[4], epsilon = k[5], precision = k[6]
			Promise.all([
				callback(group, lower, upper, suffix, epsilon, precision),
			]).then(function(result){
				if (runST) {
					exit(metric, unable)
				} else {
					exit(metric, result[0])
				}
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

	runTest(function(group, prefix, maxPrefix, suffix, maxValue, precision) {
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
				let item = 'resolution' == prefix ? suffix : prefix
				log_error(1, group +'_'+ item, e, isScope)
				return Promise.reject(zErr)
			}
		}, maxValue, precision)
	})
})

const get_scr_orientation = () => new Promise(resolve => {
	// NOTE: a screen.orientation.addEventListener('change'.. event
		// does not detect css changes, but a resize event does, which
		// is the only one we use, so treat css as truthy

	let METRICs = 'screen_orientation', METRICw = 'window_orientation'
	let oData = {'screen': {}, 'window': {}}, oDisplay = {}, lieCount = 0

	// matchmedia: sorted names
	let oTests = {
		'screen': {'-moz-device-orientation': '#cssOm', 'device-aspect-ratio': '#cssDAR'},
		'window': {'aspect-ratio': '#cssAR', 'orientation': '#cssO'}
	}
	let l = 'landscape', p = 'portrait', q = '(orientation: ', s = 'square', a = 'aspect-ratio'

	for (const type of Object.keys(oTests)) {
		let METRIC = type +'_orientation'
		for (const item of Object.keys(oTests[type])) {
			let value, isErr = false
			let cssitem = item +'_css', cssID = oTests[type][item]
			try {
				if ('-moz-device-orientation' == item) {
					if (window.matchMedia('(-moz-device-orientation:'+ l +')').matches) value = l
					if (window.matchMedia('(-moz-device-orientation:'+ p +')').matches) value = p
				} else if ('device-aspect-ratio' == item) {
					if (window.matchMedia('(device-'+ a +':1/1)').matches) value = s
					if (window.matchMedia('(min-device-'+ a +':10000/9999)').matches) value = l
					if (window.matchMedia('(max-device-'+ a +':9999/10000)').matches) value = p
				} else if ('aspect-ratio' == item) {
					if (window.matchMedia('('+ a +':1/1)').matches) value = s
					if (window.matchMedia('(min-'+ a +':10000/9999)').matches) value = l
					if (window.matchMedia('(max-'+ a +':9999/10000)').matches) value = p
				} else {
					if (window.matchMedia(q + p +')').matches) value = p
					if (window.matchMedia(q + l +')').matches) value = l
				}
				if (runST) {value = undefined} else if (runSL) {value += '_fake'}
				if (value == undefined) {throw zErrType +'undefined'} // we expect values (in gecko)
			} catch(e) {
				log_error(1, METRIC +'_'+ item, e)
				value = zErr
				isErr = true
			}
			// css
			// check matchmedia matches css
			let cssvalue = getElementProp(1, cssID, METRIC +'_'+ cssitem)
			let isErrCss = cssvalue == zErr
			let isLies = (!isErr && !isErrCss && value !== cssvalue)
			oDisplay[METRIC +'_'+ item] = {'value': value, 'lies': isLies}
			if (isSmart && isLies) {
				log_known(1, METRIC +'_'+ item, value)
				value = zLIE
				lieCount++
			}
			oData[type][item] = value
			oData[type][cssitem] = cssvalue
		}
	}
	// try and get a valid css value
	let check = oData.screen['-moz-device-orientation_css']
	if (zErr == check) {check = oData.screen['device-aspect-ratio_css']}
	if ('square' == check) {check = 'portrait'}

	// screen
	let items = ['mozOrientation', 'orientation.angle', 'orientation.type']
	items.forEach(function(item) {
		let value, expected = 'string', isAngle = 'orientation.angle' == item, isLies = false
		try {
			if ('mozOrientation' == item) {value = screen.mozOrientation
			} else if (isAngle) {
				value = screen.orientation.angle; expected = 'number'
			} else {value = screen.orientation.type
			}
			if (runST) {value = isAngle ? value +'' : true
			} else if (runSI && isAngle) {value = 45
			} else if (runSL) {value = isAngle ? 90 : 'portrait-primary'
			}
			let typeCheck = typeFn(value)
			if (expected !== typeCheck) {throw zErrType + typeCheck}
			if (isAngle) {
				let aGood = [0, 90, 180, 270]
				if (!aGood.includes(Math.abs(value))) {
					throw zErrInvalid + 'expected 0, 90, 180 or 270: got '+ value
				}
			}
			// lies
			if (isSmart && zErr !== check) {
				// check mozOrientation + .type matches css
				// note: we can't check the angle, it could be anything - see Piero tablet tests
				if ('string' == expected && value.split('-')[0] !== check) {
					log_known(1, METRICs +'_'+ item, value)
					isLies = true
					lieCount++
				}
			}
		} catch(e) {
			log_error(1, METRICs +'_'+ item, e)
			value = zErr
		}
		oDisplay[METRICs +'_'+ item] = {'value': value, 'lies': isLies}
		oData['screen'][item] = isLies ? zLIE : value
	})

	// https://searchfox.org/mozilla-central/source/testing/web-platform/tests/screen-orientation/orientation-reading.html
	// see expectedAnglesLandscape + expectedAnglesPortrait
	// harden
		// ToDo: 2 x css match | 2 x matchmedia match | 2 x mozOrientation + .type match
		// this is done with aGood below, but for non-RFP, we could check
	// and update oDisplay and oData and lieCount

	for (const k of Object.keys(oDisplay)) {
		addDisplay(1, k, oDisplay[k]['value'],'','', oDisplay[k]['lies'])
	}

	// objects are already sorted
	let hash = mini(oData.screen)
	// FF132+: 1607032 + 1918202 | FF133+: 1922204 | backported to TB
		// all seven metrics shoudl always return one of 3 hashes
		// landscape, portrait, portrait but square

	let aGood = [
		'a1de035c', // 0, primary, landscape
		'ccc8dc6d', // 90, primary, portrait
		'fb6084ad', // 90, primary, portrait-square
	]
	// on android the angle of 0 vs 90 is reversed
	if ('android' == isOS) {
		aGood = [
			'813838a9', // 90, primary, landscape
			'360dd99a', // 0, primary, portrait
			'fdc0295a', // 0, primary, portrait-square
		]
	}
	addDisplay(1, METRICs,'','', (aGood.includes(hash) ? orientation_green : orientation_red))

	addData(1, METRICs, oData.screen, hash)
	addData(1, METRICw, oData.window, mini(oData.window))

	return resolve()
})

const get_scr_pixels = (METRIC) => new Promise(resolve => {

	function get_dpr() {
		// DPR window
		let value, display, item = 'devicePixelRatio'
		try {
			value = window.devicePixelRatio
			if (runST) {value = NaN} // this will also trigger dpi_div as varDPI is not set
			let typeCheck = typeFn(value)
			if ('number' !== typeCheck) {throw zErrType + typeCheck}
			display = value
			varDPR = value
		} catch(e) {
			log_error(1, METRIC +"_"+ item, e)
			display = zErr
			value = zErr
		}
		// FF127: 1554751
		let notation = value == 2 ? rfp_green : rfp_red
		addDisplay(1, METRIC +"_"+ item, display, '', notation)
		oData[item] = value

		// DPR border: 477157: don't notate this for health
		value = undefined, display = undefined, item = 'devicePixelRatio_border'
		try {
			value = getComputedStyle(dom.dprBorder).borderTopWidth // e.g. '1px'
			if (runST) {value = undefined} else if (runSI) {value = '123'}
			let originalvalue = value
			let typeCheck = typeFn(value)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (value.slice(-2) !== 'px') {throw zErrInvalid + 'got '+ originalvalue} // missing px
			value = value.slice(0, -2)
			if (value.length > 0) {value = value * 1}
			if ('number' !== typeFn(value)) {throw zErrInvalid + 'got '+ originalvalue} // missing number
			if (value > 0) {
				value = 1/value
				display = value
				varDPR = value // use this over window.dpr
			} else {
				throw zErrInvalid + 'got '+ (1/value) // negative/Infinity
			}
		} catch(e) {
			display = log_error(1, METRIC +"_"+ item, e)
			value = zErr
		}
		addDisplay(1, item, display)
		oData[item] = value
		return
	}

	// DPI CSS
	function get_dpi_css(item) {
		let value = getElementProp(1, '#P', METRIC +'_'+ item, ':before')
		let typeCheck = typeFn(value)
		// ignore errors (already caught) and of out of range (entirely possible?)
		if (value !== '?' && value !== zErr) {
			if ('number' !== typeCheck) {
				log_error(1, METRIC +"_"+ item, zErrType + typeCheck), value = zErr
			}
		}
		addDisplay(1, METRIC +"_"+ item,'','', (value == 96 || '?' == value ? rfp_green : rfp_red)) // css motate
		oData[item] = value

	}

	// DPI DIV
	function get_dpi_div(item) {
		let display, value
		try {
			try {value = Math.round(dom.divDPI.offsetHeight * varDPR)} catch(e) {}
			let typeCheck = typeFn(value)
			if ('number' !== typeCheck) {throw zErrType + typeCheck}
			display = value
		} catch(e) {
			display = log_error(1, METRIC +"_"+  item, e), value = zErr
		}
		addDisplay(1, item, display)
		oData[item] = value
	}

	// visualViewport scale
	function get_vv_scale(item) {
		// FF63+: dom.visualviewport.enabled
		// FF91+: default true (desktop at least)
		let value, display
		try {
			value = visualViewport.scale
			if (runST) {value = undefined}
			let typeCheck = typeFn(value)
			display = value
			if ('number' !== typeof value) {throw zErrType + typeCheck}
		} catch(e) {
			display = log_error(1, METRIC +"_"+ item, e)
			value = zErr
		}
		addDisplay(1, item, display)
		oData[item] = value
		return
	}

	// run
	let varDPR, oData = {}
	Promise.all([
		get_scr_mm('pixels')
	]).then(function(results){
		for (const k of Object.keys(results[0])) {
			// expected 100% zoom values
			let oMatch = {
				'-moz-device-pixel-ratio': 1,
				'-webkit-min-device-pixel-ratio': 1,
				'dpcm': 37.79527499999999,
				'dpi': 96.00000000000003,
				'dppx': 1,
			}
			let value = results[0][k], notation = ''
			if (oMatch[k] !== undefined) {
				notation = value == oMatch[k] ? rfp_green : rfp_red
			}
			oData[k] = value
			addDisplay(1, METRIC +"_"+ k, value, '', notation)
		}
		get_dpr() // sets varDPR used in dpi_div
		get_dpi_css('dpi_css')
		get_dpi_div('dpi_div')
		get_vv_scale('visualViewport_scale')
		let newobj = {}
		for (const k of Object.keys(oData).sort()) {newobj[k] = oData[k]}
		addData(1, METRIC, newobj, mini(newobj))
		return resolve()
	})
})

const get_scr_positions = () => new Promise(resolve => {
	let methods = {
		// left/top = 0 depends on secondary monitor | availLeft/availTop = 0 depends on docker/taskbar
		'screen': {check: '6b858c97', list: ['availLeft','availTop','left','top']},
		// FS = all 0 except sometimes mozInnerScreenY | maximized can include negatives for screenX/Y
		'window': {check: '66a7ee25', list: ['mozInnerScreenX','mozInnerScreenY','screenX','screenY']}
	}
	for (const m of Object.keys(methods)){
		let METRIC = m +'_position'
		let check = methods[m]['check'], data = {}, display = [], x
		methods[m].list.forEach(function(k){
			try {
				x = 'screen' == m ? screen[k] : window[k]
				if (runST) {x = undefined}
				let typeCheck = typeFn(x)
				if ('number' !== typeCheck) {throw zErrType + typeCheck}
			} catch(e) {
				log_error(1, METRIC +"_"+ k, e); x = zErr
			}
			data[k] = x; display.push(x)
		})
		let hash = mini(data)
		let notation = hash == check ? rfp_green : rfp_red
		addDisplay(1, METRIC, display.join(', '),'', notation)
		addData(1, METRIC, data, hash)
		if (gRun) {
			let str = ''
			if ('window' == m) {
				str = 'inner: '+ data.mozInnerScreenX +' x ' + data.mozInnerScreenY +' | screen: '+ data.screenX +' x ' + data.screenY
			} else {
				str = 'available: ' + data.availLeft +' x ' + data.availTop +' | '+ data.left +' x ' + data.top
			}
			sDetail[isScope].lookup[METRIC] = str
		}
	}
	return resolve()
})

const get_scr_scrollbar = (METRIC, runtype) => new Promise(resolve => {
  // ui.useOverlayScrollbars: 0 = no, 1 = yes use-overlays
	// win11 = overlay = very thin scrollbar

  // https://bugzilla.mozilla.org/show_bug.cgi?id=1786665
		// widget.non-native-theme.scrollbar.style = values 1 to 5
		// widget.non-native-theme.scrollbar.size.override <-- non-overlay only?

	Promise.all([
		// get the viewport width: we only return zErr or a number
		get_scr_viewport(runtype)
	]).then(function(res) {
		let oData = {}, aDisplay = []
		let list = ['auto','thin']

		// scrollWidth
		function get_scrollwidth(item) {
			list.forEach(function(p) {
				let value, display
				try {
					value = 100 - dom['scroll'+p].scrollWidth
					if (runST) {value = NaN} else if (runSI) {value = -1}
					let typeCheck = typeFn(value)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					if (value < 0) {throw zErrInvalid + '< 0'}
					display = value
				} catch(e) {
					value = zErr, display = zErr
					log_error(1, METRIC +"_"+ item +'_'+p, e)
				}
				oData[item +'_'+ p] = value
				aDisplay.push(display)
			})
		}

		function get_scrollelement(item) {
			list.forEach(function(p) {
				let value, display
				try {
					let target = dom['innerscroll'+ p]
					let range, width
					if (isDomRect == -1) {
						width = target.offsetWidth
					} else {
						if (isDomRect > 1) {
							range = document.createRange()
							range.selectNode(target)
						}
						if (isDomRect < 1) {width = target.getBoundingClientRect().width
						} else if (isDomRect == 1) {width = target.getClientRects()[0].width
						} else if (isDomRect == 2) {width = range.getBoundingClientRect().width
						} else if (isDomRect > 2) {width = range.getClientRects()[0].width
						}
					}
					if (runST) {width = NaN} else if (runSI) {width = 101}
					let typeCheck = typeFn(width)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					value = 100 - width // 100 set in html, not affected by zoom
					if (value < 0) {throw zErrInvalid + '< 0'}
					display = value
				} catch(e) {
					value = zErr, display = zErr
					log_error(1, METRIC +"_"+ item +'_'+ p, e)
				}
				oData[item +'_'+ p] = value
				aDisplay.push(display)
			})
		}

		// viewport (calculated from element), visualViewport
		// note: res from get_scr_viewport: falls back to offsetWidth if domrect compromised
		function get_viewport(item) {
			let viewport = item == 'viewport' ? res[0][0] : res[0][1]
			let value, display
			try {
				let iwidth = window.innerWidth
				//iwidth = 9000 // test cssW fallback
				value = (iwidth - viewport)
				if (runSI) {value = -1.333} // runST: we already return viewport as NaN
				let typeCheck = typeFn(value)
				if ('number' !== typeCheck) {throw zErrType + typeCheck}
				if (value < -1) {throw zErrInvalid + '< -1'}
				display = value
				// leverage css inner width
				let cssW = getElementProp(1, '#D', METRIC +'_'+ item +'_css', ':before')
				if (cssW !== '?' && cssW !== zErr) {
					if (cssW * 1 == iwidth - 1) {cssW = iwidth} // round up: i.e allow for min-
					value = cssW - viewport
					display = value
				}
			} catch(e) {
				value = zErr; display = zErr
				log_error(1, METRIC +"_"+ item, e)
			}
			oData[item] = value
			aDisplay.push(display)
		}

		get_scrollelement('element')
		get_scrollwidth('scrollWidth')
		get_viewport('viewport')
		get_viewport('visualViewport')
		addDisplay(1, METRIC, aDisplay.join(', '))
		addData(1, METRIC, oData, mini(oData))
		return resolve()
	})
})

const get_scr_viewport = (runtype) => new Promise(resolve => {
	let oData = {}, aDisplay = []
	const METRIC = 'viewport', isHeight = 'height' == runtype, id= 'vp-element'

	function get_viewport(type) {
		let METRICh = type +'_'+ 'height', METRICw = type +'_'+ 'width'
		let w, h, wDisplay = '', hDisplay, range
		try {
			if (type == 'element') {
				let target = document.createElement('div')
				target.setAttribute('id', id)
				target.style.cssText = 'position:fixed;top:0;left:0;bottom:0;right:0;'
				document.documentElement.insertBefore(target,document.documentElement.firstChild)
				if (isDomRect == -1) {
					w = target.offsetWidth
					h = target.offsetHeight
				} else {
					if (isDomRect > 1) {
						range = document.createRange()
						range.selectNode(target)
					}
					if (isDomRect < 1) {
						w = target.getBoundingClientRect().width
						h = target.getBoundingClientRect().height
					} else if (isDomRect == 1) {
						w = target.getClientRects()[0].width
						h = target.getClientRects()[0].height
					} else if (isDomRect == 2) {
						w = range.getBoundingClientRect().width
						h = range.getBoundingClientRect().height
					} else if (isDomRect > 2) {
						w = range.getClientRects()[0].width
						h = range.getClientRects()[0].height
					}
				}
				//document.documentElement.removeChild(target)
			} else {
				w = window.visualViewport.width
				h = window.visualViewport.height
			}
			if (runST) {w = NaN, h = undefined}
			let wType = typeFn(w), hType = typeFn(h)
			if ('number' !== wType) {
				if (!isHeight) {log_error(1, METRIC +'_'+ METRICw, zErrType + wType)}
				w = zErr
			}
			if ('number' !== hType) {
				if (!isHeight) {log_error(1, METRIC +'_'+ METRICh, zErrType + hType)}
				h = zErr
			}
			hDisplay = h, wDisplay = w
			if (gLoad) {avh = h} // get android height once
		} catch(e) {
			h = zErr; w = zErr; wDisplay = ''
			hDisplay = log_error(1, METRIC +'_'+ type, e)
		}
		oData[METRICh] = h
		oData[METRICw] = w
		if (!isHeight) {
			addDisplay(1, 'vp_'+ type, ('' == wDisplay ? hDisplay : wDisplay +' x '+ hDisplay))
		}
	}

	get_viewport('element')
	get_viewport('visualViewport')
	removeElementFn(id)
	// return
	if (isHeight) {
		let vvh = oData['visualViewport_height']
		return resolve(vvh !== zErr ? vvh : oData['element_height']) // android tests
	} else {
		addData(1, METRIC, oData, mini(oData))
		return resolve([oData['element_width'], oData['visualViewport_width']]) // for scrollbar
	}
})

/* UA */

function get_ua_workers() {
	// control
	let list = ['appCodeName','appName','appVersion','platform','product','userAgent']
	let oCtrl = {}, r
	list.forEach(function(prop) {
		try {
			r = navigator[prop]
			if ('string' !== typeof r) {throw zErr}
			if ('' ==r) {r = 'empty string'}
		} catch(e) {
			r = e
		}
		oCtrl[prop] = r
	})
	let control = mini(oCtrl)

	// web
	let el0 = dom.uaWorker0, test0 = ''
	if (isFile) {
		el0.innerHTML = zSKIP
	} else {
		try {
			let workernav = new Worker('js/worker_ua.js')
			el0.innerHTML = zF
			workernav.addEventListener('message', function(e) {
				//console.log("ua worker", e.data)
				test0 = mini(e.data)
				el0.innerHTML = test0 + (test0 == control ? match_green : match_red)
				workernav.terminate
			}, false)
			workernav.postMessage('')
		} catch(e) {
			el0.innerHTML = log_error(1, 'worker', e, 'worker')
		}
	}
	// shared
	let el1 = dom.uaWorker1, test1 = ''
	try {
		let sharednav = new SharedWorker('js/workershared_ua.js')
		el1.innerHTML = zF
		sharednav.port.addEventListener('message', function(e) {
			//console.log("ua shared", e.data)
			test1 = mini(e.data)
			el1.innerHTML = test1 + (test1 == control ? match_green : match_red)
			sharednav.port.close()
		}, false)
		sharednav.port.start()
		sharednav.port.postMessage('')
	} catch(e) {
		el1.innerHTML = log_error(1, 'shared worker', e, 'shared_worker')
	}
	// service
	let el2 = dom.uaWorker2, test2 = ''
	el2.innerHTML = zF // assume failure
	try {
		// register
		navigator.serviceWorker.register('js/workerservice_ua.js').then(function(swr) {
			let sw
			if (swr.installing) {sw = swr.installing}
			else if (swr.waiting) {sw = swr.waiting}
			else if (swr.active) {sw = swr.active}
			sw.addEventListener('statechange', function(e) {
				if (e.target.state == 'activated') {
					sw.postMessage('')
				}
			})
			if (sw) {
				// listen
				let channel = new BroadcastChannel('sw-ua')
				channel.addEventListener('message', event => {
					//console.log("ua service", event.data.msg)
					test2 = mini(event.data.msg)
					el2.innerHTML = test2 + (test2 == control ? match_green : match_red)
					// unregister & close
					swr.unregister().then(function(boolean) {})
					channel.close()
				})
			} else {
				el2.innerHTML = zF +' ['+ sw +']'
			}
		},
		function(e) {
			el2.innerHTML = log_error(1, 'service worker', e, 'service_worker')
		})
	} catch(e) {
		el2.innerHTML = log_error(1, 'service worker', e, 'service_worker')
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
	if (isBlock || 'android' !== isOS) {
		return
	}
	setTimeout(function() {
		// use viewport: doesn't change on zoom
		Promise.all([
			get_scr_viewport('height')
		]).then(function(result){
			// avh: captured once on first load: s/be with toolbar visible at set width
			// since the tap event exits FS, we can rely on avh
			// event also triggered by losing focus
			let vh = result[0]
			dom.kbh = avh +' | '+ vh +' | '+ (avh - vh)
			// ToDo: keyboard height: use setInterval
			// keyboard can be slow to open + it "slides" (stepped changes)
			// instead check x times + return max diff

			// also grab the inner window
			let iw
			try {
				iw = window.innerWidth +' x '+ window.innerHeight
			} catch(e) {
				iw = log_error(1, 'tap', e)
			}
			dom.tiw = iw
		})
	}, 1000) // wait for keyboard
}

/* USER TESTS */

function goFS() {
	gFS = false
	try {
		let element = dom.elementFS
		element.style.opacity = 0
		Promise.all([
			element.requestFullscreen()
		]).then(function(){
			get_scr_fs_measure()
		})
	} catch(e) {dom.fsSize.innerHTML = e+''}
}

function goNW() {
	dom.newWinLeak = ''
	let sizesi = [], // inner history
		sizeso = [], // outer history
		n = 1, // setInterval counter
		newWinLeak = ''

	// open
		// was: tests/newwin.html
		// use about:blank (same as forcing a delay with a non-existant website)
	let newWin = window.open('about:blank','width=9000,height=9000')
	let iw = newWin.innerWidth,
		ih = newWin.innerHeight,
		ow = newWin.outerWidth,
		oh = newWin.outerHeight
	sizesi.push(iw +' x '+ ih)
	sizeso.push(ow +' x '+ oh)
	// default output
	newWinLeak = iw +' x '+ ih +' [inner] '+ ow +' x '+ oh +' [outer]'

	function check_newwin() {
		let changesi = 0,
			changeso = 0
		// detect changes
		let prev = sizesi[0]
		let strInner = s1 +'inner: '+ sc + iw +' x '+ ih
		for (let k=0; k < sizesi.length; k++) {
			if (sizesi[k] !== prev ) {
				changesi++;	strInner += s1 +' &#9654 <b>['+ k +']</b> '+ sc + sizesi[k]
			}
			prev = sizesi[k]
		}
		prev = sizeso[0]
		let strOuter = s1 +'outer: '+ sc + ow +' x '+ oh
		for (let k=0; k < sizeso.length; k++) {
			if (sizeso[k] !== prev ) {
				changeso++;	strOuter += s1 +' &#9654 <b>['+ k +']</b> '+ sc + sizeso[k]
			}
			prev = sizeso[k]
		}
		// one or two lines
		if (changesi > 0 || changeso > 0) {
			newWinLeak = strInner +'<br>'+ strOuter
		}
		// output
		dom.newWinLeak.innerHTML = newWinLeak
	}
	function build_newwin() {
		// check n times as fast as we can/dare
		if (n == 150) {
			clearInterval(checking)
			check_newwin()
		} else {
			// grab metrics
			try {
				sizesi.push(newWin.innerWidth +' x '+ newWin.innerHeight)
				sizeso.push(newWin.outerWidth +' x '+ newWin.outerHeight)
			} catch(e) {
				clearInterval(checking)
				// if not 'permission denied', eventually we always get
				// NS_ERROR_UNEXPECTED which we can ignore. Always output
				check_newwin()
			}
		}
		n++
	}
	let checking = setInterval(build_newwin, 3)
}

function goNW_UA() {
	dom.uaHashOpen = ''

	let list = ['appCodeName','appName','appVersion','buildID','oscpu',
		'platform','product','productSub','userAgent','vendor','vendorSub']
	let data = {}, r
	let newWin = window.open()
	let newNavigator = newWin.navigator
	list.forEach(function(p) {
		try {
			r = newNavigator[p]
			if ('string' !== typeof r) {throw zErr}
			if ('' == r) {r = 'empty string'}
		} catch(e) {
			r = e
		}
		data[p] = r
	})
	newWin.close()

	// hash
	let hash = mini(data)
	const ctrlHash = mini(sDetail.document.ua_reported)
	// output
	if (hash == ctrlHash) {
		hash += match_green
	} else {
		addDetail('ua_newwin', data)
		hash += addButton(2, 'ua_newwin') + match_red
	}
	dom.uaHashOpen.innerHTML = hash
}

/* OUTPUT */

const outputUA = (os = isOS) => new Promise(resolve => {
	let oReported = {}, oComplex = {}
	/*
	windows:
	- FF116+ 1841425: windows hardcoded to 10.0 (patched 117 but 115 was last version for < win10)
	mac:
	- FF116+ 1841215: mac hardcoded to 10.15 (patched 117 but 115 was last release for < 10.15)
	android:
	- FF122+ 1865766: hardcod to 10.0 - partially backed out
	- FF123+ 1861847: hardcod oscpu/platform to 'Linux armv81'
	- FF126+ [pending: they shipped an intervention instead] 1860417: Linux added to appVersion + ua_os
	linux:
	- FF123+ 1861847: hardcode oscpu/platform to "Linux x86_64" (backed out? on hold? these are RFP's values anyway)
	- FF127+ 1873273: report non-x86_64 CPUs (including 32-bit x86) as "x86_64"
	*/

	/*
	- FF132+ 1711835 SPOOFED_PLATFORM dropped, is now hardcoded for all
	*/

	// RFP notation: nsRFPService.h
	let oRFP = {
		android: {
			appVersion: '5.0 (Android 10)', oscpu: 'Linux armv81', platform: 'Linux armv81', ua_os: 'Android 10; Mobile'
		},
		linux: {
			appVersion: '5.0 (X11)', oscpu: 'Linux x86_64', platform: 'Linux x86_64', ua_os: 'X11; Linux x86_64'
		},
		mac: {
			appVersion: '5.0 (Macintosh)', oscpu: 'Intel Mac OS X 10.15', platform: 'MacIntel', ua_os: 'Macintosh; Intel Mac OS X 10.15'
		},
		windows: {
			appVersion: '5.0 (Windows)', oscpu: 'Windows NT 10.0; Win64; x64', platform: 'Win32', ua_os: 'Windows NT 10.0; Win64; x64'
		}
	}
	if (os !== undefined) {
		let uaVer = isVer, isDroid = isOS == 'android'
		let uaRFP = 'Mozilla/5.0 (' + oRFP[os].ua_os +'; rv:' // base
		let uaNext = uaRFP // only used if ver+
		uaRFP += uaVer +'.0) Gecko/' + (isDroid ? uaVer +'.0' : '20100101') +' Firefox/'+ uaVer +'.0'
		// next
		if ('+' == isVerExtra) {
			let nxtVer = uaVer + 1
			uaNext += nxtVer +'.0) Gecko/'+ (isDroid ? nxtVer +'.0' : '20100101') +' Firefox/'+ nxtVer +'.0'
			oRFP[os]['userAgentNext'] = uaNext
		}
		oRFP[os]['userAgent'] = uaRFP
	}
	let list = {
		// static
		appCodeName: ['Mozilla', true],
		appName: ['Netscape', [1]],
		product: ['Gecko', null],
		buildID: ['20181001000000', 1],
		productSub: ['20100101', 1/0],
		vendor: ['empty string', {1:1}],
		vendorSub: ['empty string'],
		// more complex
		appVersion: ['skip', []],
		platform: ['skip', {}],
		oscpu: ['skip', NaN],
		userAgent: ['skip'],
	}

	for (const p of Object.keys(list)) {
		let expected = list[p][0], sim = list[p][1]
		let isErr = false, str = ''
		try {
			str = navigator[p]
			if (runST) {str = sim} else if (runSL) {addProxyLie('Navigator.'+ p)}
			let typeCheck = typeFn(str, true)
			if ('string' !== typeCheck) {throw zErrType + typeFn(str)}
			if ('' == str) {str = 'empty string'}
		} catch(e) {
			isErr = true
			str = log_error(2, p, e)
		}
		if ('skip' !== expected) {
			outputStatic(p, str, expected, isErr)
		} else {
			oComplex[p] = [str, isErr]
		}
	}

	function outputStatic(property, reported, expected, isErr) {
		oReported[property] = (isErr ? zErr : reported) // for uaDoc
		let isLies = isProxyLie('Navigator.'+ property)
		let notation = reported !== expected || isLies ? default_red : ''
		addBoth(2, property, reported,'', notation, (isErr ? zErr : reported), isLies)
	}

	for (const k of Object.keys(oComplex)) {
		let reported = oComplex[k][0], isErr = oComplex[k][1]
		oReported[k] = (isErr ? zErr : reported) // for uaDoc
		let isLies = isProxyLie('Navigator.'+ k), notation = isLies ? rfp_red : '' // in case os is sundefined
		if (os !== undefined) {
			let rfpvalue = oRFP[os][k]
			let isMatch = rfpvalue === reported
			if (k == 'userAgent' && !isMatch && isVerExtra == '+') {
				isMatch = oRFP[os][k +'Next'] == reported
			}
			notation = isMatch ? rfp_green : rfp_red
		}
		addBoth(2, k, reported,'', notation, (isErr ? zErr : reported), isLies)
	}
	// add reported for non-matches lookup
	let newobj = {}
	for (const k of Object.keys(oReported).sort()) {newobj[k] = oReported[k]}
	addDetail('ua_reported', newobj)
	addDisplay(2, 'ua_reported', mini(newobj) + addButton(2, 'ua_reported'))
	return resolve()
})

const outputFD = () => new Promise(resolve => {
	if (!isGecko) {
		let aList = ['browser','logo','wordmark','browser_architecture','os','version']
		aList.forEach(function(item) {addBoth(3, item, zNA)})
		aList = ['fdBrandingCss','fdResourceCss']
		aList.forEach(function(item) {addDisplay(3, item, zNA)})
		return resolve()
	}

	// logo
	let wType, hType, w, h, isLogo, isLogoData =''
	try {
		w = dom.aboutlogo.width, h = dom.aboutlogo.height
		if (runST) {w += '', h = null}
		wType = typeFn(w), hType = typeFn(h)
		if ('number' !== wType || 'number' !== hType) {throw zErrType + wType +' x '+ hType}
		isLogo = w +' x '+ h
	} catch(e) {
		isLogo = e; isLogoData = zErrShort
	}
	addBoth(3, 'logo', isLogo,'','', isLogoData)
	
	// about-wordmark.svg
		// record both: if missing = 0x0 (hidden) | = image placeholder size (offscreen)
	let isWordmark, isWordData =''
	try {
		let isHidden, isOffscreen
		// hidden
		w = dom.brandinghidden.width, h = dom.brandinghidden.height
		if (runST) {w = true, h += ''}
		wType = typeFn(w), hType = typeFn(h)
		if ('number' !== wType || 'number' !== hType) {throw zErrType + wType +' x '+ hType}
		isHidden = w +' x '+ h
		// offscreen
		isOffscreen = dom.branding.width +' x '+ dom.branding.height
		if (isHidden !== isOffscreen) {isHidden += ' | ' + isOffscreen}
		isWordmark = isHidden
	} catch(e) {
		isWordmark = e; isWordData = zErrShort
	}
	addBoth(3, 'wordmark', isWordmark,'','', isWordData)

	// set isMullvad for diffs between TB vs MB; otherwise it _is_ TB in tests
	if (gLoad && !isTB && 'android' !== isOS) {
		let aMBVersions = [115, 128]
		if (aMBVersions.includes(isVer) && isWordmark + isLogo == '400 x 32300 x 236') {
			isMullvad = true
			isTB = true
			tb_green = sgtick+'MB]'+sc
			tb_red = sbx+'MB]'+sc
			tb_slider_red = sbx+'MB Slider]'+sc
			tb_standard = sg+'[MB Standard]'+sc
			tb_safer = sg+'[MB Safer]'+sc
		}
	}
	// browser
	addBoth(3, 'browser', (isMullvad ? 'Mullvad Browser' : (isTB ? 'Tor Browser' : 'Firefox')))

	// eval
	let METRIC = 'eval.toString'
	try {
		let len = eval.toString().length
		if (runST) {len = 43}
		if (len !== 37) {throw zErrInvalid + 'expected 37: got '+ len}
	} catch(e) {
		log_error(3, METRIC, e)
	}
	// os, version
	addBoth(3, 'os', (isOS == undefined ? (isOSErr !== undefined ? isOSErr : zErr) : isOS))
	addBoth(3, 'version', isVer + isVerExtra)
	// set metricsPrefix
	if (isGecko && isSmart) {
		metricsPrefix = (isMullvad ? 'MB' : (isTB ? 'TB': 'FF')) + isVer + isVerExtra +'-'+ (isOS !== undefined ? isOS : 'unknown') +'-'
	}
	// arch: FF110+ pref removed: error means 32bit
	let str = '64bit', data = 64
	if (isArch !== true) {
		if ('RangeError: invalid array length' == isArch) {
			str = '32bit'; data = 32
		} else {
			str = isArch; data = zErr
		}
	}
	addBoth(3, 'browser_architecture', str,'','', data)
	return resolve()
})

const outputScreen = (isResize = false) => new Promise(resolve => {
	let runtype = isResize ? 'resize': 'screen'
	Promise.all([
		get_scr_fullscreen('fullscreen'),
		get_scr_positions(),
		get_scr_pixels('pixels'),
		get_scr_scrollbar('scrollbars', runtype), // gets viewport
		get_scr_orientation(),
		get_scr_measure(),
	]).then(function(){
		// add listeners once
		if (gLoad) {
			if ('android' == isOS) {
				get_android_tbh()
			} else {
				window.addEventListener('resize', function(){outputSection(1, true)})
			}
		}
		return resolve()
	})
})

countJS(1)
