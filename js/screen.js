'use strict';

/* SCREEN */

function return_lb(w,h,isNew) {
	// LB
	let wstep = 200, hstep = 200, bw = false, bh = false
	if (w < 501) {wstep = 50} else if (w < 1601) {wstep = isNew ? 200: 100}
	if (h < 501) {hstep = 50} else if (h < 1601) {hstep = 100}
	bw = Number.isInteger(w/wstep)
	bh = Number.isInteger(h/hstep)
	return (bw && bh) ? true : false
}

function return_nw(w,h, isNew) {
	// NW
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
	output.innerHTML =''

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
				log_known(1, METRIC +'_'+ item, data); isLies = true
			}
		} catch(e) {
			log_error(1, METRIC +'_'+ item, e); data = zErr
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
				log_known(1, METRIC +'_'+ item, data)
				isLies = true
			}
		} catch(e) {
			log_error(1, METRIC +'_'+ item, e); data = zErr
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
			log_error(1, METRIC +'_'+ item, e); data = zErr
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
		let oTmp = {
			screen: {height: {}, width: {}},
			available: {height: {}, width: {}},
			inner: {height: {}, width: {}},
			outer: {height: {}, width: {}},
		}
		// matchmedia
		oTmp.screen.height.media = mmres[0]['device-height']
		oTmp.screen.width.media = mmres[0]['device-width']
		oTmp.inner.height.media = mmres[0].height
		oTmp.inner.width.media = mmres[0].width
		// test: css/media value is up to 1px higher: we should only allow a lower value
		//oTmp.screen.width.media = mmres[0]['device-width'] + 1

		// viewport units
		let vuMETRIC = 'sizes_viewport_units'
		let vuType = 'android' == isOS ? vuMETRIC : 'inner'
		let vwhData = get_scr_viewport_units(vuType)
		if ('inner' == vuType) {
			// desktop: same as viewport but it ignores scollbars, so can
			// add information and is a more precise measurement of matchMedia
			oTmp.inner.width['vw'] = vwhData.width
			oTmp.inner.height['vh'] = vwhData.height
			// n/a: standalone android metric
			addData(1, vuMETRIC, zNA)
		} else {
		// document: android only
			oTmp.inner.width['document'] = adoc.width
			oTmp.inner.height['document'] = adoc.height
		}

		// screen/window
		// order matters: so property targets are correct
		let aList = ['iframe','doc'] // iframe first
		let oList = {
			// screens first
			screen: ['height','width'],
			available: ['availHeight','availWidth'],
			// then windows with inner last
			outer: ['outerHeight','outerWidth'],
			inner: ['innerHeight','innerWidth'],
		}
		let iTarget, target
		try {iTarget = dom.tzpIframe.contentWindow} catch(e) {}
		try {target = iTarget.screen} catch(e) {} // initial iframe target
		aList.forEach(function(name) {
			if ('iframe' !== name) {target = screen; name = 'screen'} // initial target post iframe
			for (const k of Object.keys(oList)) {
				if ('iframe' !== name) {
					if ('outer' == k) {target = window; name = 'window'} // switch non-iframe target
				}
				let aItems = oList[k]
				for (let i=0; i < aItems.length; i++) {
					let p = aItems[i], x, isSkip = false
					let axis = p.includes('idth') ? 'width' : 'height'
					try {
						if ('iframe' == name && 'inner' == k) {isSkip = true} // skip iframe inner
						if (!isSkip) {
							if ('iframe' == name && 'outer' == k) {target = iTarget.window} // switch iframe target
							x = target[p]
							if (runST) {x = undefined}
							/* cause one error
							if (name == 'screen' && k == 'screen' && axis == 'width') {x = undefined} // fail one screen
							//*/
							/* change one value: a little moot once we compare to css for zLIEs etc
							if (name == 'window' && k == 'outer' && axis == 'width') {x = x - 30} // fail one outer
							//*/
							let typeCheck = typeFn(x)
							if ('number' !== typeCheck) {throw zErrType + typeCheck}
							// only matchmedia can be non Integer
							if (!Number.isInteger(x)) {throw zErrInvalid + 'expected Integer: got '+ typeCheck}
						}
					} catch (e) {
						log_error(1, 'sizes_'+ k +'_'+ axis +'_'+ name, e)
						x = zErr
					}
					if (!isSkip) {oTmp[k][axis][name] = x}
				}
			}
		})

		// css
		let cssList = [['#S',':before'],['#S',':after'],['#D',':before'],['#D',':after']]
		cssList.forEach(function(array) {
			let cssID = array[0], pseudo = array[1]
			let axis = ':before' == pseudo ? 'width' : 'height'
			let metric = '#S' == cssID ? 'screen' : 'inner'
			let value = getElementProp(1, cssID, 'sizes_'+ metric +'_'+ axis +'_css', pseudo)
			if (value !== zErr && '?' !== value) {
				let cType = typeFn(value)
				if ('number' !== cType) {
					log_error(1, 'sizes_'+ metric +'_'+ axis +'_css', zErrType + cType)
					value = zErr
				} else if (!Number.isInteger(value)) {
					// only matchmedia can be non integer
					log_error(1, 'sizes_'+ metric +'_'+ axis +'_css', zErrInvalid + 'expected Integer: got '+ cType)
					value = zErr
				}
			}
			if ('#S' == array[0]) {oTmp.screen[axis].css = value} else {oTmp.inner[axis].css = value}
		})

		// sort into new obj, build default display
		let oData = {}, oDisplay = {}, oSummary = {}
		for (const k of Object.keys(oTmp)) {
			oData[k] = {}
			oSummary[k] = {}
			for (const j of Object.keys(oTmp[k])) {
				oData[k][j] = {}
				oSummary[k][j] = undefined
				for (const m of Object.keys(oTmp[k][j]).sort()) {
					let value = oTmp[k][j][m]
					oData[k][j][m] = value
					if ('width' == j && 'css' !== m) {
						if ('vw' == m) {oDisplay[k +'_viewport'] = value +' x '+ oTmp[k]['height']['vh']
						} else {oDisplay[k +'_'+ m] = value +' x '+ oTmp[k]['height'][m]}
					}
					// any error to oSummary, but ignore out of range css
					if ('string' == typeof value) {
						if ('css' == m && '?' == value) {} else {oSummary[k][j] = zErr}
					}
				}
			}
		}
		oDisplay['initial_inner'] = isInitial.width.inner + ' x ' + isInitial.height.inner
		oDisplay['initial_outer'] = isInitial.width.outer + ' x ' + isInitial.height.outer
		//console.log('oData', oData)
		//console.log('oDisplay', oDisplay)

		// notation
		let notation ='', initData = zNA, initHash =''
		let innerw = oData.inner.width.window, innerh = oData.inner.height.window
		let screenw = oData.screen.width.screen, screenh = oData.screen.height.screen
		let isNew = (isTB || isVer > 132) // 1556002 newWin & LB step alignment
		// valid defaults
		let isCompareValid = 'number' == typeFn(innerw) && 'number' == typeFn(innerh)
		let controlw = innerw,
			controlh = innerh

		if ('android' == isOS) {
			// on android window.inner can differ due to dynamic urlbar, so we use doc
			let docw = oData.inner.width.document, doch = oData.inner.height.document
			isCompareValid = 'number' == typeFn(docw) && 'number' == typeFn(doch)
			controlw = docw
			controlh = doch
			// initial_sizes
			// ToDo: add notation
			initData = isInitial; initHash = mini(isInitial)
		} else {
			// NW
			addDisplay(1, 'size_newwin','','', return_nw(innerw, innerh, isNew))
		}

		// RFP/match
		for (const k of Object.keys(oData)) {
			let isSame = true
			// for each axis
			for (const j of Object.keys(oData[k])) {
				let tmpSet = new Set
				for (const n of Object.keys(oData[k][j])) {
					let value = oData[k][j][n]
					//console.log(k, j, n, value)
					// ignore css out of range
					let isIgnore = '?' == value && 'css' == n
					if (zErr == value || zLIE == value) {
						isSame = false // errors and lies = fail
						isIgnore = true // don't add errors or lies to our set
						if (zErr == value) {oSummary[k][j] = zErr}
					}
					// android window.inner
						// a non-match doesn't matter for notation: we don't notate RFP inner on android yet
						// it does cause a "mixed" in summary which with a green RFP is misleading, so ignore
						// Note: once we add lies logic to our data, handled just above, we also won't be
						// letting a possible genuine mismatch thru by not checking it for sameness
					if ('android' == isOS && 'inner' == k && 'window' == n) {isIgnore = true}

					if (!isIgnore) {
						// vw/vh can be non-integer in inner
						// media can be non-integer | css can be off by 1 | both only screen + inner metrics
						// match them to our inner or screen if within 1
						if ('media' == n || 'css' == n || 'vh' == n || 'vw' == n) {
							value = Math.floor(value) // to remove non-integers + ensure valid diffs are positive
							let control = 'width' == j ? screenw : screenh // if these are invalid diff == NaN
							if ('inner' == k) {control = 'width' == j ? controlw : controlh}
							// we floored so any valid diff must be 1 or 0 because we substract value from control
							if (1 == control - value) {value = control} // match control
						}
						tmpSet.add(value)
					}
				}
				let aSet = Array.from(tmpSet)
				// summary
				// if the array is empty, isSame should already be false
				// we already rounded + matched non-integers, there should only be one
				if (aSet.length !== 1) {
					if (undefined == oSummary[k][j]) {oSummary[k][j] = 'mixed'}
					isSame = false
				} else {
					if (undefined == oSummary[k][j]) {oSummary[k][j] = aSet[0]}
				}
				// notation
					// if all the same then does it match _based_ on inner
				if (isSame && isCompareValid) {
					// if inner: does it match LBing
					if ('inner' == k) {
						isSame = return_lb(controlw, controlh, isNew)
					} else {
						// we can refine these rules later per key/OS: currently does it == inner
						let match = 'width' == j ? controlw : controlh
						if (aSet[0] !== match) {isSame = false}
					}
				}
			}
			let notation = isSame ? rfp_green : rfp_red
			if ('inner' == k && 'android' == isOS) {notation = ''}
			addDisplay(1, 'sizes_'+ k, '','', notation)
		}

		// health lookups
		if (gRun) {
			let strInner = oTmp.inner.width.window +' x '+ oTmp.inner.height.window
			let initInner = isInitial.width.inner +' x '+ isInitial.height.inner
			let initOuter = isInitial.width.outer +' x '+ isInitial.height.outer
			let initMatch = initInner == initOuter ? initInner : 'inner: '+ initInner +' | outer: '+ initOuter
			sDetail[isScope].lookup['size_newwin'] = strInner
			sDetail[isScope].lookup['sizes_initial'] = initMatch
		}

		/* ToDo: update oData/oDisplay/oSummary with lies
			i.e detect them, change oData to zLIE, color them
			sData[SECT99] covers "Screen.width","Screen.height","Screen.availWidth","Screen.availHeight"
			and we have if css is valid and it's not "isSame" i.e it matches within 1
			about the only one we really can't tell is outer
		*/

		// data
		for (const k of Object.keys(oData)) {addData(1, 'sizes_'+ k, oData[k], mini(oData[k]))}
		addData(1, 'sizes_initial', initData, initHash)
		// display
		for (const k of Object.keys(oSummary)) {oDisplay[k +'_summary'] = oSummary[k].width +' x '+ oSummary[k].height}
		for (const k of Object.keys(oDisplay)) {addDisplay(1, k, oDisplay[k])}

		// android viewport units
		if ('inner' !== vuType) {
			// dynamic urlbar
			let strDynamic = zNA
			let isVUValid = 'number' == typeFn(vwhData.vw) && 'number' == typeFn(vwhData.vh)
			let toolbarw = vwhData.vw - controlw, toolbarh = vwhData.vh - controlh
			// remove part decimals under 1px diff due to subpixels
			if (Math.abs(toolbarw) < 1) {toolbarw = 0}
			if (Math.abs(toolbarh) < 1) {toolbarh = 0}
			strDynamic = toolbarw +' x '+ toolbarh
			addDisplay(1, 'dynamic_urlbar', strDynamic)
			addDisplay(1, vuMETRIC, vwhData.vw + ' x '+ vwhData.vh)
			addData(1, vuMETRIC, vwhData, mini(vwhData))
			// notate window.inner
				// if window.inner == viewport units (only height will differ) then notate
				// that dynamic urlbar is hidden. if inner !valid then it doesn't need a notation
				// if not the same, then vh will be a lot higher, so subtract inner from vh
			if ('number' == typeFn(innerh) && 'number' == typeFn(vwhData.vh)) {
				let diff = vwhData.vh - innerh
				if (diff < 1) {addDisplay(1, 'dynamic_note', ' [mismatch: dynamic urlbar hidden]')}
			}
		}

		// temp dev logging
		function log_screen_details() {
			let dpr = window.devicePixelRatio
			dpr = Math.round((dpr + Number.EPSILON) * 100)
			if (109 == dpr) {dpr = 110} else if (171 == dpr) {dpr = 175}
			let tbHorizontal = oData.screen.height.screen - oData.available.height.screen
			let tbVertical = oData.screen.width.screen - oData.available.width.screen
			let chromewidth = oData.outer.width.window - oData.inner.width.window
			let chromeheight = oData.outer.height.window - oData.inner.height.window
			console.log(
				'zoom', dpr,
				'\nscreen', oData.screen.width.screen, 'x', oData.screen.height.screen,
				'| available', oData.available.width.screen, 'x', oData.available.height.screen,
				'| taskbar', tbVertical, 'x', tbHorizontal,
				'\nouter', oData.outer.width.window, 'x', oData.outer.height.window,
				'| inner', oData.inner.width.window, 'x', oData.inner.height.window,
				'| chrome', chromewidth, 'x', chromeheight
			)
		}
		if (isScreenLog) {log_screen_details()}
		return resolve()
	})
})

const get_scr_mm = (datatype) => new Promise(resolve => {
	const unable = 'unable to find upper bound'
	const oList = {
		measure: [
			['sizes_screen', 'device-width', 'device-width', 'max-device-width', 'px', 512, 0.01],
			['sizes_screen', 'device-height', 'device-height', 'max-device-height', 'px', 512, 0.01],
			['sizes_inner', 'width', 'width', 'max-width', 'px', 512, 0.01],
			['sizes_inner', 'height', 'height', 'max-height', 'px', 512, 0.01],
		],
		pixels: [
			['pixels', '-moz-device-pixel-ratio', '-moz-device-pixel-ratio', 'max--moz-device-pixel-ratio', '', 4, 0.0000001],
			['pixels', '-webkit-min-device-pixel-ratio', '-webkit-min-device-pixel-ratio', '-webkit-max-device-pixel-ratio', '', 4, 0.01],
				// ^ webkit seems limited to and rounds down to 0.25, 0.5, 1, 2, 4
			['pixels', 'dpcm', 'resolution', 'max-resolution', 'dpcm', 1e-5, 0.0000001],
			['pixels', 'dpi', 'resolution', 'max-resolution', 'dpi', 1e-5, 0.0000001],
			['pixels', 'dppx', 'resolution', 'max-resolution', 'dppx', 1e-5, 0.0000001],
		]
	}
	const oPrefixes = {
		'device-width': 'sizes_screen_width',
		'device-height': 'sizes_screen_height',
		width: 'sizes_inner_width',
		height: 'sizes_inner_height',
		'-moz-device-pixel-ratio': 'pixels',
		'-webkit-min-device-pixel-ratio': 'pixels',
		dpcm: 'pixels',
		dpi: 'pixels',
		dppx: 'pixels',
	}

	let list = oList[datatype], maxCount = oList[datatype].length, count = 0, oData = {}
	function exit(id, value) {
		if (value == unable) {
			let suffix = (id.includes('width') || id.includes('height')) ? 'media' : id
			let metric = oPrefixes[id] +'_'+ suffix
			log_error(1, metric, unable)
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
								return Promise.resolve(minValue) // +' to '+ maxValue // just return min
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
				if (window.matchMedia('('+ prefix +': '+ valueToTest + suffix+')').matches){
					return Promise.resolve(searchValue.isEqual)
				} else if (window.matchMedia('('+ maxPrefix +': '+ valueToTest + suffix+')').matches){
					return Promise.resolve(searchValue.isSmaller)
				} else {
					return Promise.resolve(searchValue.isBigger)
				}
			} catch(e) {
				let metric = oPrefixes[prefix] +'_media'
				if ('pixels' == group) {metric = group +'_'+ ('resolution' == prefix ? suffix : prefix)}
				log_error(1, metric, e, isScope)
				return Promise.reject(zErr)
			}
		}, maxValue, precision)
	})
})

const get_scr_orientation = (METRIC) => new Promise(resolve => {
	// NOTE: a screen.orientation.addEventListener('change'.. event
		// does not detect css changes, but a resize event does, which
		// is the only one we use, so treat css as truthy
	let oData = {'screen': {}, 'window': {}}, oDisplay = {}, lieCount = 0
	// matchmedia: sorted names
	let oTests = {
		'screen': {'-moz-device-orientation': '#cssOm', 'device-aspect-ratio': '#cssDAR'},
		'window': {'aspect-ratio': '#cssAR', 'orientation': '#cssO'}
	}
	let l = 'landscape', p = 'portrait', q = '(orientation: ', s = 'square', a = 'aspect-ratio'

	for (const type of Object.keys(oTests)) {
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
					log_known(1, METRIC +'_'+ item, value)
					isLies = true
					lieCount++
				}
			}
		} catch(e) {
			log_error(1, METRIC +'_'+ item, e)
			value = zErr
		}
		oDisplay[METRIC +'_'+ item] = {'value': value, 'lies': isLies}
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
	let hash = mini(oData)
	// FF132+: 1607032 + 1918202 | FF133+: 1922204 | backported to TB
		// all seven metrics should always return one of 3 hashes
		// landscape, portrait, portrait but square
	// RFP is always primary | on android the angle of 0 vs 90 is reversed
	let aGood = [
		'7a1ec766', //  0 landscape
		'5c281761', // 90 portrait
		'a55cb95d', // 90 portrait/square
	]
	if ('android' == isOS) {
		aGood = [
			'bd9328e9', // 90 landscape
			'df6d41d8', //  0 portrait
			'e6c593d4', //  0 portrait/square
		]
	}
	addDisplay(1, METRIC,'','', (aGood.includes(hash) ? orientation_green : orientation_red))
	addData(1, METRIC, oData, hash)
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
			log_error(1, METRIC +'_'+ item, e)
			display = zErr
			value = zErr
		}
		// FF127: 1554751
		let notation = value == 2 ? rfp_green : rfp_red
		addDisplay(1, METRIC +'_'+ item, display, '', notation)
		oData[item] = value

		// DPR border: 477157: don't notate this for health
		value = undefined, display = undefined, item = 'devicePixelRatio_border'
		try {
			value = getComputedStyle(dom.tzpDPR).borderTopWidth // e.g. '1px'
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
			display = log_error(1, METRIC +'_'+ item, e)
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
				log_error(1, METRIC +'_'+ item, zErrType + typeCheck), value = zErr
			}
		}
		let rfpvalue = isVer > 133 ? 192 : 96
		addDisplay(1, METRIC +'_'+ item,'','', (value == rfpvalue || '?' == value ? rfp_green : rfp_red)) // css notate
		oData[item] = value

	}

	// DPI DIV
	function get_dpi_div(item) {
		let display, value
		try {
			try {value = Math.round(dom.tzpDPI.offsetHeight * varDPR)} catch(e) {}
			let typeCheck = typeFn(value)
			if ('number' !== typeCheck) {throw zErrType + typeCheck}
			display = value
		} catch(e) {
			display = log_error(1, METRIC +'_'+ item, e), value = zErr
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
			display = log_error(1, METRIC +'_'+ item, e)
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
			let value = results[0][k], notation =''
			if (oMatch[k] !== undefined) {
				let rfpvalue = isVer > 133 ? oMatch[k] * 2 : oMatch[k]
				notation = value == rfpvalue ? rfp_green : rfp_red
			}
			oData[k] = value
			addDisplay(1, METRIC +'_'+ k, value,'', notation)
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

const get_scr_positions = (METRIC) => new Promise(resolve => {
	let methods = {
		// left/top = 0 depends on secondary monitor | availLeft/availTop = 0 depends on docker/taskbar
		'screen': ['availLeft','availTop','left','top'],
		// FS = all 0 except sometimes mozInnerScreenY | maximized can include negatives for screenX/Y
		'window': ['mozInnerScreenX','mozInnerScreenY','screenX','screenY']
	}
	let oData = {'screen': {}, 'window': {}}
	for (const m of Object.keys(methods)){
		let display = [], x
		methods[m].forEach(function(k){
			try {
				x = 'screen' == m ? screen[k] : window[k]
				if (runST) {x = undefined}
				let typeCheck = typeFn(x)
				if ('number' !== typeCheck) {throw zErrType + typeCheck}
			} catch(e) {
				log_error(1, METRIC +'_'+ k, e); x = zErr
			}
			oData[m][k] = x; display.push(x)
		})
		addDisplay(1, m +'_'+ METRIC, display.join(', '))
	}
	let hash = mini(oData)
	let notation = '56aadb9d' == hash ? position_green : position_red
	addDisplay(1, METRIC,'','', notation)
	addData(1, METRIC, oData, hash)
	return resolve()
})

const get_scr_scrollbar = (METRIC, runtype) => new Promise(resolve => {
  // ui.useOverlayScrollbars: 0 = no, 1 = yes
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1786665
		// widget.non-native-theme.scrollbar.style = values 1 to 5
		// widget.non-native-theme.scrollbar.size.override <-- non-overlay only
	Promise.all([
		// get the viewport width: we only return zErr or a number
		get_scr_viewport(runtype)
	]).then(function(res) {
		let oData = {'element': {}, 'scrollWidth': {}}
		let aDisplay = []
		let list = ['auto','thin']

		// scrollWidth
		function get_scroll() {
			let element
			list.forEach(function(p) {
				// scrollWidth
				let value, display, item = 'scrollWidth'
				try {
					element = dom.tzpScroll
					element.style['scrollbar-width'] = p
					value = 100 - element.scrollWidth
					if (runST) {value = NaN} else if (runSI) {value = -1}
					let typeCheck = typeFn(value)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					if (value < 0) {throw zErrInvalid + '< 0'}
					display = value
				} catch(e) {
					value = zErr, display = zErr
					log_error(1, METRIC +'_'+ item +'_'+p, e)
				}
				oData[item][p] = value
				aDisplay.push(display)

				// element
				value = undefined, display = undefined, item = 'element'
				try {
					let target = element.children[0]
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
					log_error(1, METRIC +'_'+ item +'_'+ p, e)
				}
				oData[item][p] = value
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
				log_error(1, METRIC +'_'+ item, e)
			}
			oData[item] = value
			aDisplay.push(display)
		}

		get_scroll()
		get_viewport('viewport')
		get_viewport('visualViewport')
		/*
		let isScrollbarOverlay = false
		aDisplay.forEach(function(item) {if (0 !== Math.floor(Math.abs(item))) {isScrollbarOverlay = true}})
		*/
		// output
		addDisplay(1, METRIC, aDisplay.join(', '))
		addData(1, METRIC, oData, mini(oData))
		return resolve()
	})
})

function get_scr_viewport_units(METRIC) {
	// 100vw/100vh element: we use this for
	// inner_viewport on desktop
		// it provides a different value with subpixels but isSame
	// viewport_units on android
		// if used as inner_viewport, it is never isSame due to it ignoring the urlbar
		// so we will record it separately so inner is isSame and the summary is valid
		// this provides android entropy and we even display the urlbar height as a FYI
	let data = {}, aList = ['width','height']
	let vwhTarget
	try {vwhTarget = dom.tzpVWH} catch(e) {}
	let range, method
	aList.forEach(function(p) {
		let name = 'inner' == METRIC ? p : 'v'+ p.slice(0,1)
		try {
			let x
			if (isDomRect == -1) {
				x = p == 'width' ? vwhTarget.offsetWidth : vwhTarget.offsetHeight
			} else {
				if (isDomRect > 1) {
					range = document.createRange()
					range.selectNode(target)
				}
				if (isDomRect < 1) {method = vwhTarget.getBoundingClientRect()
				} else if (isDomRect == 1) {method = vwhTarget.getClientRects()[0]
				} else if (isDomRect == 2) {method = vwhTarget.getBoundingClientRect()
				} else if (isDomRect > 2) {method = vwhTarget.getClientRects()[0]
				}
				x = 'width' == p ? method.width : method.height
				//type check
				if (runST) {x = p == 'width' ? undefined : '' }
				let typeCheck = typeFn(x)
				if ('number' !== typeCheck) {throw zErrType + typeCheck}
				data[name] = x
			}
		} catch(e) {
			if ('inner' == METRIC) {
				log_error(1, 'sizes_inner_'+ p +'_v'+ p.slice(0,1), e)
			} else {
				log_error(1, METRIC +'_'+ name, e)
			}
			data[name] = zErr
		}
	})
	return data
}

const get_scr_viewport = (runtype) => new Promise(resolve => {
	let oData = {height: {}, width: {}}, aDisplay = []
	const METRIC = 'sizes_viewport', isHeight = 'height' == runtype, id= 'vp-element'
	const aMETRIC = 'sizes_inner'

	function get_viewport(type) {
		let w, h, wDisplay ='', hDisplay, range, method, target
		let metric = 'document' == type && 'android' == isOS ? aMETRIC : METRIC

		try {
			if ('element' == type) {
				target = document.createElement('div')
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
					if (isDomRect < 1) {method = target.getBoundingClientRect()
					} else if (isDomRect == 1) {method = target.getClientRects()[0]
					} else if (isDomRect == 2) {method = range.getBoundingClientRect()
					} else if (isDomRect > 2) {method = range.getClientRects()[0]
					}
					w = method.width
					h = method.height
				}
			} else if ('document' == type) {
				// using document.documentElement + domrect = the full webcont dimensions
				// we can only get width as we know that is fixed | height must be clientHeight
				target = document.documentElement
				h = target.clientHeight
				if (isDomRect == -1) {
					w = target.clientWidth
				} else {
					if (isDomRect > 1) {
						range = document.createRange()
						range.selectNode(target)
					}
					if (isDomRect < 1) {method = target.getBoundingClientRect()
					} else if (isDomRect == 1) {method = target.getClientRects()[0]
					} else if (isDomRect == 2) {method = range.getBoundingClientRect()
					} else if (isDomRect > 2) {method = range.getClientRects()[0]
					}
					w = method.width
				}
			} else {
				w = window.visualViewport.width 
				h = window.visualViewport.height
			}

			if (runST) {w = NaN, h = undefined}
			let wType = typeFn(w), hType = typeFn(h)
			if ('number' !== wType) {
				if (!isHeight) {log_error(1, metric +'_width_'+ type, zErrType + wType)}
				w = zErr
			}
			if ('number' !== hType) {
				if (!isHeight) {log_error(1, metric +'_height_'+ type, zErrType + hType)}
				h = zErr
			}
			hDisplay = h, wDisplay = w
			// get android with/height once
			if (gLoad && 'visualViewport' == type) {
				avw = w
				avh = h
			}
		} catch(e) {
			h = zErr; w = zErr; wDisplay =''
			if ('document' == type && 'android' == isOS) {
				log_error(1, metric +'_width_'+ type, e)
				log_error(1, metric +'_height_'+ type, e)
			} else {
				hDisplay = log_error(1, metric +'_'+ type, e)
			}
		}
		// in  android the document metric is in inner section
		if ('document' == type && 'android' == isOS) {
			adoc['height'] = h
			adoc['width'] = w
		} else {
			oData.height[type] = h
			oData.width[type] = w
			if (!isHeight) {
				addDisplay(1, 'vp_'+ type, ('' == wDisplay ? hDisplay : wDisplay +' x '+ hDisplay))
				// only do a summary for desktop
				// android with dynamic urlbar & pinch to zoom can get all funky
				if ('android' !== isOS && 'visualViewport' == type) {
					addDisplay(1, 'vp_summary', ('' == wDisplay ? hDisplay : wDisplay +' x '+ hDisplay))
				}
			}
		}
	}

	// ToDo: we could also use size observer / IntersectionObserverEntry
	get_viewport('document')
	get_viewport('element')
	get_viewport('visualViewport')
	removeElementFn(id)
	// return
	if (isHeight) {
		let vvh = oData.height.visualViewport
		return resolve(vvh !== zErr ? vvh : oData.height.element) // android tests
	} else {
		addData(1, METRIC, oData, mini(oData))
		return resolve([oData.width.element, oData.width.visualViewport]) // for scrollbar
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
	let el0 = dom.uaWorker0, test0 =''
	if (isFile) {
		el0.innerHTML = zSKIP
	} else {
		try {
			let workernav = new Worker('js/worker_ua.js')
			el0.innerHTML = zF
			workernav.addEventListener('message', function(e) {
				//console.log('ua worker', e.data)
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
	let el1 = dom.uaWorker1, test1 =''
	try {
		let sharednav = new SharedWorker('js/workershared_ua.js')
		el1.innerHTML = zF
		sharednav.port.addEventListener('message', function(e) {
			//console.log('ua shared', e.data)
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
	let el2 = dom.uaWorker2, test2 =''
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
					//console.log('ua service', event.data.msg)
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

function get_android_tap() {
	if (isBlock || 'android' !== isOS) {
		return
	}
	setTimeout(function() {
		// use viewport: doesn't change on zoom
		Promise.all([
			get_scr_viewport('height')
		]).then(function(result){
			// avh: visualViewport: captured once on first load
			// should be with toolbar visible at set width
			// since the tap event exits FS, we can rely on avh
			// event also triggered by losing focus
			let vh = result[0]
			dom.kbh = avh +' | '+ vh +' | '+ (avh - vh)
			// ToDo: keyboard height: use setInterval
			// keyboard can be slow to open + it slides (stepped changes)
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
		let element = dom.tzpFS
		element.style.opacity = 0
		Promise.all([
			element.requestFullscreen()
		]).then(function(){
			get_scr_fs_measure()
		})
	} catch(e) {dom.fsSize.innerHTML = e+''}
}

function goNW() {
	dom.newWinLeak =''
	let sizesi = [], // inner history
		sizeso = [], // outer history
		n = 1, // setInterval counter
		newWinLeak =''

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
	dom.uaHashOpen =''
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
		let isErr = false, str =''
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
		let isLies = isProxyLie('Navigator.'+ k)
		let notation = isLies ? rfp_red : '' // in case os is undefined
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
	let METRIC = 'infinity_architecture', value, data =''
	try {
  	const f = new Float32Array([Infinity - Infinity])
  	value = new Uint8Array(f.buffer)[3]
  } catch(e) {
  	value = e; data = zErrLog
  }
	addBoth(3, METRIC, value,'','', data)

	if (!isGecko) {
		let aList = ['browser','logo','wordmark','browser_architecture','os','version']
		aList.forEach(function(item) {addBoth(3, item, zNA)})
		aList = ['tzpWordmark','tzpResource']
		aList.forEach(function(item) {addDisplay(3, item, zNA)})
		return resolve()
	}

	// logo
	let wType, hType, w, h, isLogo, isLogoData =''
	try {
		w = dom.tzpAbout.width, h = dom.tzpAbout.height
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
		w = dom.tzpBrandHidden.width, h = dom.tzpBrandHidden.height
		if (runST) {w = true, h += ''}
		wType = typeFn(w), hType = typeFn(h)
		if ('number' !== wType || 'number' !== hType) {throw zErrType + wType +' x '+ hType}
		isHidden = w +' x '+ h
		// offscreen
		isOffscreen = dom.tzpBrand.width +' x '+ dom.tzpBrand.height
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
	METRIC = 'eval.toString'
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
	let str = '64bit'; data = 64
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
		get_scr_positions('positions'),
		get_scr_pixels('pixels'),
		get_scr_scrollbar('scrollbars', runtype), // gets viewport
		get_scr_orientation('orientation'),
		get_scr_measure(),
	]).then(function(){
		// add listeners once
		if (gLoad) {
			if ('android' !== isOS) {
				window.addEventListener('resize', function(){outputSection(1, true)})
			}
		}
		return resolve()
	})
})

countJS(1)
