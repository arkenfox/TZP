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
	// F11: triggered by resize events if in FS
	// fullscreenElement: called on android by goFS
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
		if (isElementFS) {document.exitFullscreen()} // only android can be isElementFS
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
			} catch {
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

	// nonGecko boolean vs undefined: i.e a string of "undefined" will be an error
	let expectedType = isGecko ? 'boolean' : 'undefined'
	// fullScreen
	function get_fullScreen(item) {
		let data, isLies = false
		try {
			data = window.fullScreen
			if (runST) {data = undefined}
			let typeCheck = typeFn(data)
			if (expectedType !== typeCheck) {throw zErrType + typeCheck}
			if ('undefined' == typeCheck) {data += ''}
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
			if (expectedType !== typeCheck) {throw zErrType + typeCheck}
			if ('undefined' == typeCheck) {data += ''}
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

		// small viewport units
			// desktop: same as viewport element + clientrect but it ignores scollbars, so can
			// add information and is a more precise measurement of matchMedia
			// android: used to calculate dynamic toolbar
		let vpWidth = isViewportUnits.width, vpHeight = isViewportUnits.height
		oTmp.inner.width['svw'] = vpWidth.svw
		oTmp.inner.height['svh'] = vpHeight.svh

		// document
		if ('android' == isOS) {
			oTmp.inner.width['document'] = vpWidth.document
			oTmp.inner.height['document'] = vpHeight.document
			// dynamic toolbar: display only - let it NaN for I care
			let strToolbar = (vpWidth.lvw - vpWidth.svw) +' x '+ (vpHeight.lvh - vpHeight.svh)
			addDisplay(1, 'dynamic_toolbar', strToolbar)
			// large viewport units 
			addDisplay(1, 'viewport_large', vpWidth.lvw +' x '+ vpHeight.lvh)
			// sizes_viewport metric (small is already under sizes_inner)
			let newobj = {'height': {'lvh': vpHeight.lvh}, 'width': {'lvw': vpWidth.lvw}}
			addData(1, 'sizes_viewport', newobj, mini(newobj))
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
		// window.inner on android is dynamic and also redudnant with document + small viewport units
		if ('android' == isOS) {delete oList.inner}
		let iTarget, target
		try {iTarget = dom.tzpIframe.contentWindow} catch {}
		try {target = iTarget.screen} catch {} // initial iframe target
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
					} catch(e) {
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
						if ('svw' == m) {oDisplay[k +'_viewport'] = value +' x '+ oTmp[k]['height']['svh']
						} else {oDisplay[k +'_'+ m] = value +' x '+ oTmp[k]['height'][m]}
					}
					// any error to oSummary, but ignore out of range css
					if ('string' == typeof value) {
						if ('css' == m && '?' == value) {} else {oSummary[k][j] = zErr}
					}
				}
			}
		}

		// initial
		oDisplay['initial_inner'] = isInitial.width.inner + ' x ' + isInitial.height.inner
		oDisplay['initial_outer'] = isInitial.width.outer + ' x ' + isInitial.height.outer
		//console.log('oData', oData)
		//console.log('oDisplay', oDisplay)

		// notation
		let notation ='', initData = zNA, initHash =''
		let innerw = oData.inner.width.window, innerh = oData.inner.height.window
		let screenw = oData.screen.width.screen, screenh = oData.screen.height.screen
		let isNew = (isBB || isVer > 132) // 1556002 newWin & LB step alignment

		// controls: we want integers so we know what to match to
		let controlw = innerw, controlh = innerh
		if ('android' == isOS) {
			/* on android
			height
				- window.inner height can differ due to dynamic toolbar, so we use doc
				- documentElement height = clientHeight because we want the window, not the entire page length
				and is thus always our preferred integer to match to
			width
				- documentElement width = domrect and not an integer
				- but TZP uses a fixed width <meta name="viewport" content="width=800"> so width should be constant
				- but window.inner width is also not affected by dynamic toolbar
				- so use window in case a phone's native res exceeds or we drop (or lower) the fixed width
			*/
			controlh = oData.inner.height.document
			// controlw is undefined, we need to grab it
			try {
				controlw = window.innerWidth
				if ('number' !== typeFn(controlw)) {controlw = zErr} else if (!Number.isInteger(controlw)) {control = zErr}
			} catch {
				controlw = zErr
			}
			// initial_sizes
			// ToDo: add notation
			initData = isInitial; initHash = mini(isInitial)
		} else {
			// NW
			addDisplay(1, 'size_newwin','','', return_nw(innerw, innerh, isNew))
		}
		let isCompareValid = 'number' == typeFn(controlw) && 'number' == typeFn(controlh)

		// desktop: if in fullscreenElement mode, use the svh element to measure
			// we don't have a resize event in android
		if ('android' !== isOS) {
			let isElementFS = document.fullscreen || document.webkitIsFullscreen || false
			if (isElementFS) {
				addDisplay(1, 'fsElement', oData.inner.width.svw +' x '+ oData.inner.height.svh)
			}
			try {dom.btnFS.style.display = (isElementFS ? 'block' : 'none')} catch {}
		}

		// RFP/match
		for (const k of Object.keys(oData)) {
			let isSame = true
			// for each axis
			for (const j of Object.keys(oData[k])) {
				let tmpSet = new Set
				for (const n of Object.keys(oData[k][j])) {
					let value = oData[k][j][n]
					let original = value
					//console.log(k, j, n, value)
					// ignore css out of range
					let isIgnore = '?' == value && 'css' == n
					if (zErr == value || zLIE == value) {
						isSame = false // errors and lies = fail
						isIgnore = true // don't add errors or lies to our set
						if (zErr == value) {oSummary[k][j] = zErr}
					}
					/* android window.inner
						a non-match doesn't matter for notation: we don't notate RFP inner on android yet
						it does cause a "mixed" in summary which with a green RFP is misleading, so ignore
						Note: once we add lies logic to our data, handled just above, we also won't be
						letting a possible genuine mismatch thru by not checking it for sameness
					*/
					if ('android' == isOS && 'inner' == k && 'window' == n) {isIgnore = true}
					let control
					if (!isIgnore) {
						// *vw/h can be non-integer in inner
						// media can be non-integer | css can be off by 1 | both only screen + inner metrics
						// document (used by android) width uses domrect
						// match them to our inner or screen if within 1
						if ('media' == n || 'css' == n || 'svh' == n || 'svw' == n || 'document' == n) {
							value = Math.floor(value) // to remove non-integers + ensure valid diffs are positive
							control = 'width' == j ? screenw : screenh // if these are invalid diff == NaN
							if ('inner' == k) {control = 'width' == j ? controlw : controlh}
							// we floored so any valid diff must be 1 or 0 because we substract value from control
							if (1 == control - value) {value = control} // match control
						}
						//if ('inner' == k) {console.log(k, j, n, '\norig', original, '\ncontrol', control, '\nfinal value for sameness', value)}
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

		// display only: taskbar/dock + chrome
			// on android there is no dock and we set a minimum width which means chrome is non-sensical
			// and can be negative: e.g. outer 427 - inner 500, also display space is at a premium
		let dockH = oData.screen.height.screen - oData.available.height.screen,
			dockW = oData.screen.width.screen - oData.available.width.screen,
			chromeW = oData.outer.width.window - oData.inner.width.window,
			chromeH = oData.outer.height.window - oData.inner.height.window
		if ('android' !== isOS) {
			let dockStr = ('windows' == isOS ? 'taskbar' : ('mac' == isOS ? 'menu bar/dock' : 'panel'))
			if (isOS == undefined) {dockStr = 'taskbar/dock/panel'}
			oDisplay['scr_dock'] = '['+ dockStr +': '+ dockW +' x '+ dockH +']'
			// note: non-gecko does not resize non-inner (e.g. outer) when zooming, so chrome sizes can get ridiculous, display anyway
			oDisplay['scr_chrome'] = '[chrome: '+ chromeW +' x '+ chromeH +']'
		}

		// data
		for (const k of Object.keys(oData)) {addData(1, 'sizes_'+ k, oData[k], mini(oData[k]))}
		addData(1, 'sizes_initial', initData, initHash)
		// display
		for (const k of Object.keys(oSummary)) {oDisplay[k +'_summary'] = oSummary[k].width +' x '+ oSummary[k].height}
		for (const k of Object.keys(oDisplay)) {addDisplay(1, k, oDisplay[k])}
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
			['pixels', '-webkit-device-pixel-ratio', '-webkit-device-pixel-ratio', '-webkit-max-device-pixel-ratio', '', 4, 0.01],
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
		'-webkit-device-pixel-ratio': 'pixels',
		dpcm: 'pixels',
		dpi: 'pixels',
		dppx: 'pixels',
	}

	let list = oList[datatype], maxCount = oList[datatype].length, count = 0, oData = {}
	function exit(id, value) {
		if (value == unable) {
			if (!isGecko && '-moz-device-pixel-ratio' == id) {
				value = zNA
			} else {
				let suffix = (id.includes('width') || id.includes('height')) ? 'media' : id
				let metric = oPrefixes[id] +'_'+ suffix
				log_error(1, metric, unable)
				value = zErr
			}
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
	let oData = {'device': {}, 'window': {}}, oDisplay = {}
	// matchmedia: sorted names
	let oTests = {
		'device': {'-moz-device-orientation': '#cssOm', 'device-aspect-ratio': '#cssDAR'},
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
				// can only be undefined (default) or a string (which we set)
				if (!isGecko && '-moz-device-orientation' == item) {
					if (value !== undefined) {throw zErrType + typeFn(value)} // undefined in nonGecko
					value += ''
				} else {
					if (value == undefined) {throw zErrType +'undefined'} // we expect values (in gecko)
				}
			} catch(e) {
				log_error(1, METRIC +'_'+ type +'_'+ item, e)
				value = zErr
				isErr = true
			}
			// css
			// check matchmedia matches css
			let cssvalue = getElementProp(1, cssID, METRIC +'_'+ cssitem)
			let isErrCss = cssvalue == zErr
			let isLies = (!isErr && !isErrCss && value !== cssvalue)
			oDisplay[METRIC +'_'+ item] = {'value': value +'', 'lies': isLies}
			if (isSmart && isLies) {
				log_known(1, METRIC +'_'+ type +'_'+ item, value)
				value = zLIE
			}
			oData[type][item] = value
			oData[type][cssitem] = cssvalue
		}
	}

	// device: try and get a valid css value
	let check = oData.device['-moz-device-orientation_css']
	if (zErr == check) {check = oData.device['device-aspect-ratio_css']}
	if ('square' == check) {check = 'portrait'}

	// screen
	let items = ['mozOrientation', 'orientation.angle', 'orientation.type']
	items.forEach(function(item) {
		let value, expectedType = 'string', isAngle = 'orientation.angle' == item, isLies = false
		try {
			if ('mozOrientation' == item) {
				value = screen.mozOrientation
				// gecko: undefined throws an error, 'undefined' returns the string (or a lie if isSmart)
				if (!isGecko) {expectedType = 'undefined'}
			} else if (isAngle) {
				value = screen.orientation.angle; expectedType = 'number'
			} else {value = screen.orientation.type
			}
			if (runST) {value = isAngle ? value +'' : true
			} else if (runSI && isAngle) {value = 45
			} else if (runSL) {value = isAngle ? 90 : 'portrait-primary'
			}
			let typeCheck = typeFn(value)
			if (expectedType !== typeCheck) {throw zErrType + typeCheck}
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
				if ('string' == expectedType && value.split('-')[0] !== check) {
					log_known(1, METRIC +'_device_'+ item, value)
					isLies = true
				}
			}
		} catch(e) {
			log_error(1, METRIC +'_device_'+ item, e)
			value = zErr
		}
		if ('mozOrientation' == item && undefined == value) {value += ''} // only nonGecko mozOrientation can be undefined
		oDisplay[METRIC +'_'+ item] = {'value': value, 'lies': isLies}
		oData['device'][item] = isLies ? zLIE : value
	})

	// https://searchfox.org/mozilla-central/source/testing/web-platform/tests/screen-orientation/orientation-reading.html
	// see expectedAnglesLandscape + expectedAnglesPortrait

	/*
	let zUndefined = 'undefined'
	let test = {
		'-moz-device-orientation': zUndefined,
		'-moz-device-orientation_css': zNA,
		'device-aspect-ratio': 'square',
		'device-aspect-ratio_css': 'square',
		'mozOrientation': zUndefined,
		'orientation.angle': 0,
		'orientation.type':"portrait-primary",
	}
	let moztest = {
		'-moz-device-orientation': 'portrait',
		'-moz-device-orientation_css': 'portrait',
		'device-aspect-ratio': 'square',
		'device-aspect-ratio_css': 'square',
		'mozOrientation': 'portrait-primary',
		'orientation.angle': 0,
		'orientation.type':"portrait-primary",
	}
	console.log('chrometest', mini(test))
	console.log('moztest', mini(moztest))
	//*/

	// display, data
	for (const k of Object.keys(oDisplay)) {addDisplay(1, k, oDisplay[k]['value'],'','', oDisplay[k]['lies'])}
	for (const k of Object.keys(oData)) {
		// objects are already sorted
		let data = oData[k]
		let hash = mini(data)
		addData(1, METRIC +'_'+ k, oData[k], hash)
		if ('device' == k) {
			//console.log(hash, k, oData[k])
			let oGood = {}
			if (isGecko) {
				// device health check
				// FF132+: 1607032 + 1918202 | FF133+: 1922204 | backported to BB
				// RFP is always primary | on android the angle of 0 vs 90 is reversed
				// type | angle | orientation (css) + aspect ratio (css)
				oGood = {
					'a1de035c': 'landscape-primary | 0 | landscape',
					'ccc8dc6d': 'portrait-primary | 90 | portrait',
					'fb6084ad': 'portrait-primary | 90 | portrait | square',
				}
				if ('android' == isOS) {
					oGood = {
						'813838a9': 'landscape-primary | 90 | landscape',
						'360dd99a': 'portrait-primary | 0 | portrait',
						'fdc0295a': 'portrait-primary | 0 | portrait | square',
					}
				}
			} else {
				// nonGecko with undefined + n/a for moz* properties
				// basic mode, ignore OS
				oGood = {
					// desktop
					'68510616': 'landscape-primary | 0 | landscape',
					'ca467d33': 'portrait-primary | 90 | portrait',
					'ebce91f3': 'portrait-primary | 90 | portrait | square',
					// android
					'813838a9': 'landscape-primary | 90 | landscape',
					'a9960814': 'portrait-primary | 0 | portrait',
					'60585b54': 'portrait-primary | 0 | portrait | square',
				}
			}
			let display = undefined !== oGood[hash] ? oGood[hash] : hash
			addDisplay(1, METRIC +'_'+ k +'_summary', display)
			addDisplay(1, METRIC +'_'+ k,'','', (undefined !== oGood[hash] ? rfp_green : rfp_red))
		}
	}
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
				varDPR = value
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
		/* this FP value is redundant: it's essentially 96 * our DPR PoC (IIUIC)
		IIUIC: monitors always have a native resolution of 96 dpi
			- our div element should always have a height of 96
			- regardless of zoom + system scaling + layout.css.devPixelsPerPx (which combined == devicePixelRatio)
			- but IDK about e.g. QLED/Quantum "dots" and other emerging standards
		// tested with zooming levels: it's always 96 (domrect, offset, client)
			- system scaling 100% | 125%
			- layout.css.devPixelsPerPx 1.1 (equivalent to 110% zoom)
			- system scaling 125% + layout.css.devPixelsPerPx 1.1 combined
		*/
		let display, value
		try {
			let target = dom.tzpDPI
			// domrect will not give us any greater precision AFAICT, but why not
			let targetValue = 0 == isDomRect ? target.getBoundingClientRect().height : target.offsetHeight
			// the final "dpi" value comes from multiplying by DPR (our poc leak one)
			value = targetValue * varDPR
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
				'-webkit-device-pixel-ratio': 1,
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
		if ('android' !== isOS) {
			// android: useless, not stable as it is affected by zoom
			get_vv_scale('visualViewport_scale')
		}
		let newobj = {}
		for (const k of Object.keys(oData).sort()) {newobj[k] = oData[k]}
		addData(1, METRIC, newobj, mini(newobj))
		// pixel matches
		if (isSmart) {
			// ignore BB14 until ESR140
			if (isBB && isVer < 129) {} else {
				get_scr_pixels_match('pixels_match', oData)
			}
		}
		return resolve()
	})
})

function get_scr_pixels_match(METRIC, oData) {
	if (!isSmart) {return}
	// media pixels vs window devicePixelRatio
	let isPixelMatch = true, oPixels = {}, oSummary = {'false': [], 'true': []}, controlPx, testPx
	// remove items we don't compare
	let aIgnore = ['devicePixelRatio_border','dpi_div','visualViewport_scale']
	aIgnore.forEach(function(item){delete oData[item]})

	try {
		// typecheck
		for (const k of Object.keys(oData).sort()) {
			let typeCheck = typeFn(oData[k])
			if ('number' !== typeCheck) {
				// ignore out-of-range css
				if ('dpi_css' == k && '?' == oData[k]) {} else {throw zErrInvalid + k +' expected number: got '+ typeCheck}
			}
		}
		let dprValue = oData.devicePixelRatio, dprStr = 'devicePixelRatio'
		let oControls = {
			'-moz-device-pixel-ratio': [dprValue, dprStr],
			'-webkit-device-pixel-ratio': [dprValue, dprStr],
			//'devicePixelRatio': it's the control
			'dpcm': [dprValue * 96 / 2.54, dprStr +' * 96 / 2.54'],
			'dpi': [dprValue * 96, dprStr +' * 96'],
			'dpi_css': [dprValue * 96, dprStr +' * 96'],
			'dppx': [dprValue, dprStr],
		}
		let oLists = {
			'-moz-device-pixel-ratio': ['-moz-device-pixel-ratio','max--moz-device-pixel-ratio','min--moz-device-pixel-ratio'],
			'-webkit-device-pixel-ratio': ['-webkit-device-pixel-ratio','-webkit-max-device-pixel-ratio','-webkit-min-device-pixel-ratio'],
			'dppx': ['max-resolution','min-resolution','resolution'],
		}
		
		// b3e9e3c6 200% zoom dpr 1 === 100% zoom drp 1 with RFP
		//console.log(mini(oData), oData)
		for (const k of Object.keys(oData).sort()) {
			oPixels[k] = {}
			if (undefined !== oControls[k]) {
				controlPx = oControls[k][0]
				oPixels[k].control = oControls[k]
			}
			if ('dpcm' == k || 'dpi' == k) {
				let diff = Math.abs(oData[k] - controlPx)
				oPixels[k].diff = diff
				let testPx = diff < 0.0001
				oPixels[k].match = testPx
				if (false === testPx) {isPixelMatch = false}
				oSummary[testPx].push(k)
			} else if ('dpi_css' == k) {
				// ignore out-of-range dpi_css
				if ('?' !== oData[k]) {
					testPx = oData[k] == Math.floor(controlPx) // css is min-resolution
					oPixels[k]['match'] = testPx
					if (false === testPx) {isPixelMatch = false}
					oSummary[testPx].push(k)
				}
			} else if (oLists[k] !== undefined) {
				// ToDo: is max actually needed, so we need min?
				let unit = 'dppx' == k ? 'dppx' : ''
				oLists[k].forEach(function(item){
					testPx = window.matchMedia('('+ item +':'+ controlPx + unit +')').matches
					oPixels[k]['match '+item] = testPx
					if (false === testPx) {isPixelMatch = false}
					oSummary[testPx].push(k +'_'+ item)
				})
			}
			oPixels[k].value = oData[k]
		}
		// make the notification clickable
		sDetail[isScope][METRIC] = oPixels
		let btncolor = isPixelMatch ? 'good' : 'bad'
		let btnsymbol = isPixelMatch ? tick : cross
		addDisplay(1, METRIC,'','', addButton(btncolor, METRIC, "<span class='health'>"+ btnsymbol +"</span> RFP pixels"))
	} catch(e) {
		sDetail[isScope][METRIC] = e+''
		addDisplay(1, METRIC,'','', sbx+' RFP pixels]'+sc)
	}
}

const get_scr_positions = (METRIC) => new Promise(resolve => {
	let methods = {
		// left/top = 0 depends on secondary monitor | availLeft/availTop = 0 depends on dock/taskbar
		'screen': ['availLeft','availTop','left','top'],
		// FS = all 0 except sometimes mozInnerScreenY | maximized can include negatives for screenX/Y
		'window': ['mozInnerScreenX','mozInnerScreenY','screenX','screenY']
	}
	let oData = {'screen': {}, 'window': {}}
	// nonGecko: number vs undefined: i.e a string of "undefined" will be an error
	let aNonGecko = ['left','top','mozInnerScreenX','mozInnerScreenY']
	for (const m of Object.keys(methods)){
		let display = [], x
		methods[m].forEach(function(k){
			try {
				x = 'screen' == m ? screen[k] : window[k]
				if (runST) {x = 'undefined'}
				let typeCheck = typeFn(x), expectedType = 'number'
				if (!isGecko && aNonGecko.includes(k)) {expectedType = 'undefined'}
				if (expectedType !== typeCheck) {throw zErrType + typeCheck}
				if (undefined == x) {x += ''}
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

function get_scr_viewport_units() {
	// desktop + android use small in inner section
	// android uses large as a standalone
	let aList = 'android' == isOS ? ['L','S'] : ['S']
	let data = {'height': {}, 'width': {}}

	aList.forEach(function(k) {
		let METRIC = 'L' == k ? 'sizes_viewport' : 'sizes_inner'
		let target
		try {target = dom['tzp'+ k +'V']} catch {}
		let range, method
		let prefix = k.toLowerCase() + 'v'
		for (const p of Object.keys(data)) {
		//aItems.forEach(function(p) {
			let name = prefix + p.slice(0,1)
			try {
				let x
				if (isDomRect == -1) {
					x = p == 'width' ? target.offsetWidth : target.offsetHeight
				} else {
					if (isDomRect > 1) {
						range = document.createRange()
						range.selectNode(target)
					}
					if (isDomRect < 1) {method = target.getBoundingClientRect()
					} else if (isDomRect == 1) {method = target.getClientRects()[0]
					} else if (isDomRect == 2) {method = target.getBoundingClientRect()
					} else if (isDomRect > 2) {method = target.getClientRects()[0]
					}
					x = 'width' == p ? method.width : method.height
					//type check
					if (runST) {x = p == 'width' ? undefined : '' }
					let typeCheck = typeFn(x)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					data[p][name] = x
				}
			} catch(e) {
				log_error(1, METRIC +'_'+ p + '_' + prefix + p.slice(0,1), e)
				data[p][name] = zErr
			}
		}
	})
	return data
}

const get_scr_viewport = (runtype) => new Promise(resolve => {
	// get viewport units
	isViewportUnits = get_scr_viewport_units()

	let oData = {height: {}, width: {}}, aDisplay = []
	const METRIC = 'sizes_viewport', id= 'vp-element'
	const aMETRIC = 'sizes_inner'

	function get_viewport(type) {
		let w, h, wDisplay ='', hDisplay, range, method, target
		let metric = 'android' == isOS ? aMETRIC : METRIC

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
				log_error(1, metric +'_width_'+ type, zErrType + wType)
				w = zErr
			}
			if ('number' !== hType) {
				log_error(1, metric +'_height_'+ type, zErrType + hType)
				h = zErr
			}
			hDisplay = h, wDisplay = w
		} catch(e) {
			h = zErr; w = zErr; wDisplay =''
			if ('android' == isOS) {
				log_error(1, metric +'_width_'+ type, e)
				log_error(1, metric +'_height_'+ type, e)
			} else {
				hDisplay = log_error(1, metric +'_'+ type, e)
			}
		}
		oData.height[type] = h
		oData.width[type] = w

		// android only calls document and uses it in inner section
		// we can just store this in isViewportUnits
		if ('android' == isOS) {
			isViewportUnits.height['document'] = h
			isViewportUnits.width['document'] = w
		} else {
			addDisplay(1, 'vp_'+ type, ('' == wDisplay ? hDisplay : wDisplay +' x '+ hDisplay))
			// only do a summary for desktop
			// toDo: correctly summarize it
			if ('visualViewport' == type) {
				addDisplay(1, 'vp_summary', ('' == wDisplay ? hDisplay : wDisplay +' x '+ hDisplay))
			}
		}
	}

	// ToDo: we could also use size observer / IntersectionObserverEntry
	// all
	get_viewport('document')
	// android: there is no viewport section: document becomes part of inner section.
		// element + visualViewport are redundant with a TZP clean load (new tab etc) and
		// can be or are unstable with dynamic urlbar/toolbar and pinch to zoom/reruns combos etc
	if ('android' !== isOS) {
		//desktop
		get_viewport('element')
		get_viewport('visualViewport')
		removeElementFn(id)
		// return
		addData(1, METRIC, oData, mini(oData))
	}
	// resolve
	return resolve(oData) // for scrollbar
})

/* AGENT */

const get_agent = (METRIC, os = isOS) => new Promise(resolve => {
	let oReported = {}, oComplex = {}, oData = {}
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
		for (const k of Object.keys(oRFP)) {
			// important: only add next version to array if we are open ended ('+')
			let uaVer = isVer, isDroid = 'android' == k, nxtVer = uaVer + 1
			// userAgent
			let uaRFP = 'Mozilla/5.0 (' + oRFP[k].ua_os +'; rv:', uaNext = uaRFP // base
			uaRFP += uaVer +'.0) Gecko/' + (isDroid ? uaVer +'.0' : '20100101') +' Firefox/'+ uaVer +'.0'
			oRFP[k].userAgent = [uaRFP]
			// next userAgent
			if ('+' == isVerExtra) {
				uaNext += nxtVer +'.0) Gecko/'+ (isDroid ? nxtVer +'.0' : '20100101') +' Firefox/'+ nxtVer +'.0'
				oRFP[k].userAgent.push(uaNext)
			}
			// desktop mode: 1727775
			if (isDroid) {
				uaRFP = 'Mozilla/5.0 (' + oRFP.linux.ua_os +'; rv:', uaNext = uaRFP // base
				uaRFP += uaVer +'.0) Gecko/20100101 Firefox/'+ uaVer +'.0'
				oRFP[k].userAgent.push(uaRFP)
				if ('+' == isVerExtra) {
					uaNext += nxtVer +'.0) Gecko/20100101 Firefox/'+ nxtVer +'.0'
					oRFP[k].userAgent.push(uaNext)
				}
			}
		}
	}
	//console.log(oRFP)

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

	for (const p of Object.keys(list).sort()) {
		oData[p] = ''; oReported[p] = '' // preset ordered objects
		let expected = list[p][0], sim = list[p][1]
		let isErr = false, str =''
		try {
			str = navigator[p]
			if (runST) {str = sim} else if (runSL) {addProxyLie('Navigator.'+ p)}
			let typeCheck = typeFn(str, true), expectedType = 'string'
			if (!isGecko) {
				// type check will throw an error for a string "undefined"
				if ('buildID' == p || 'oscpu' == p) {expectedType = 'undefined'}
			}
			if (expectedType !== typeCheck) {throw zErrType + typeFn(str)}
			if ('' == str) {str = 'empty string'}
		} catch(e) {
			isErr = true
			str = log_error(2, METRIC +'_'+ p, e)
		}
		if ('skip' !== expected) {
			outputStatic(p, str+'', expected, isErr)
		} else {
			oComplex[p] = [str+'', isErr]
		}
	}

	function outputStatic(property, reported, expected, isErr) {
		oReported[property] = (isErr ? zErr : reported)
		//let isLies = isProxyLie('Navigator.'+ property)
		// prototypeLies doesn't pick everything up all the time: instead use expected
			// and because non-expected is lies
		// still notate slent fails so our count makes sense
		let isLies = reported !== expected
		let notation = (isErr || isLies) ? silent_red : ''
		addDisplay(2, 'ua_'+ property, reported, '', notation, (isErr ? false : isLies))
		// record value in oData
		let fpvalue = isErr ? zErr : (isSmart && isLies ? zLIE : reported)
		oData[property] = fpvalue
	}

	for (const k of Object.keys(oComplex)) {
		let reported = oComplex[k][0], isErr = oComplex[k][1]
		oReported[k] = (isErr ? zErr : reported)
		let isLies = isProxyLie('Navigator.'+ k)
		if (!isLies) {
			let aFlags = []
			// prototypeLies doesn't pick everything up all the time: add some basic checks
				// note: may be valid, e.g. a fork uses a custom values
			if ('userAgent' == k | 'appVersion' == k) {
				// userAgent: e.g. Chameleon, Chrome Mask
				// appVersion: User-Agent Switcher
				aFlags = [' like','Chrome','WebKit','KHTML','Apple','Safari']
				for (let i=0; i < aFlags.length; i++) {
					if (reported.includes(aFlags[i])) {isLies = true; break}
				}
			}
			if (!isLies) {
				if ('userAgent' == k) {
					// check version: all platforms contain '; rv:' + version + '.0)'
					aFlags = [isVer]
					if ('+' == isVerExtra) {aFlags.push(isVer + 1)}
					let isVerCheck = false
					aFlags.forEach(function(item) {
						if (reported.includes('; rv:'+ item +'.0)')) {isVerCheck = true}
					})
					if (!isVerCheck) {isLies = true}
				} else if ('appVersion' == k) {
					// User-Agent Switcher
					if ('windows' == os) {isLies = reported !== '5.0 (Windows)'
					}
				} else if ('platform' == k) {
					// User-Agent Switcher
					if ('windows' == os) {isLies = reported !== 'Win32'
					}
				} else if ('oscpu' == k) {
					// User-Agent Switcher
					if ('windows' == os) {isLies = !reported.includes('Windows NT 10.0')
					}
				}
			}
		}
		let notation = isLies ? silent_red : '' // in case os is undefined
		if (os !== undefined) {
			let rfpvalue = oRFP[os][k], isMatch = false
			isMatch = (k == 'userAgent' ? rfpvalue.includes(reported) : rfpvalue === reported)
			notation = isMatch ? silent_green : silent_red
			// notate good desktopmode
			if (k == 'userAgent' && isMatch && 'android' == isOS) {
				if (reported.includes('Linux')) {notation = desktopmode_green}
			}
		}
		addDisplay(2, 'ua_'+ k, reported, '', notation, (isErr ? false : isLies))
		// record value in oData
		let fpvalue = isErr ? zErr : (isSmart && isLies ? zLIE : reported)
		oData[k] = fpvalue
	}
	// add lookup
	addDetail('agent_reported', oReported) // add reported for non-match lookup
	// add metric
	let countFail = 0
	for (const k of Object.keys(oData)) {if (zLIE == oData[k] || zErr == oData[k]) {countFail++}} // count failures
	let strFail = (0 == countFail ? '' : sb +'['+ countFail +']'+ sc)
	let agentnotation = (0 == countFail ? rfp_green : rfp_red)
	addBoth(2, METRIC, mini(oData), addButton(2, METRIC), agentnotation + strFail, oData)
	return resolve()
})

const get_agent_data = (METRIC, os = isOS) => new Promise(resolve => {
	let hash, typeCheck, data = {}, btn='', notation=''
	try {
		hash = navigator.userAgentData
		if (runSE) {foo++} else if (runST) {hash = 1} else if (runSI) {hash = {}}
		let typeCheck = typeFn(hash, true)
		if ('undefined' == typeCheck) {
			// undefined
			addBoth(2, METRIC, 'undefined')
			return resolve()
		} else {
			// type check
			if ('object' !== typeCheck) {throw zErrType + typeCheck}
			let expected = '[object NavigatorUAData]'
			if (expected !== hash+'') {throw zErrInvalid +'expected '+ expected +' got '+ hash+''}
			// https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues
			navigator.userAgentData.getHighEntropyValues([
				'architecture','bitness','brands','formFactor','fullVersionList','mobile',
				'model','platform','platformVersion','uaFullVersion','wow64'
			]).then(res => {
				// new object: merge versions + check for mismatches
					// e.g. brands, fullVersionList, uaFullVersion
				// keep order: e.g. opera vs chrome differs in order of array items

				// only blink so no smarts, for now just add the object
				hash = mini(res); data = res; btn = addButton(2, METRIC)
				addBoth(2, METRIC, hash, btn, notation, data)
				console.log(res)
				return resolve()
			})
			// catch uncaught in promise error
		}
	} catch(e) {
		hash = e; data = zErrLog
		addBoth(2, METRIC, hash, btn, notation, data)
		return resolve()
	}
})

function get_agent_workers() {
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
	let scope0 = 'worker', metric0 = 'agent_'+ scope0, target0 = dom[metric0], test0 =''
	if (isFile) {
		target0.innerHTML = zSKIP
	} else {
		try {
			let workernav = new Worker('js/'+ scope0 +'_agent.js')
			target0.innerHTML = zF
			workernav.addEventListener('message', function(e) {
				//console.log(scope0, e.data)
				test0 = mini(e.data)
				target0.innerHTML = test0 + (test0 == control ? match_green : match_red)
				workernav.terminate
			}, false)
			workernav.postMessage('')
		} catch(e) {
			target0.innerHTML = log_error(2, metric0, e, scope0)
		}
	}
	// shared
	let scope1 = 'worker_shared', metric1 = 'agent_'+ scope1, target1 = dom[metric1], test1 =''
	try {
		let sharednav = new SharedWorker('js/'+ metric1 +'_agent.js')
		target1.innerHTML = zF
		sharednav.port.addEventListener('message', function(e) {
			//console.log('scope1', e.data)
			test1 = mini(e.data)
			target1.innerHTML = test1 + (test1 == control ? match_green : match_red)
			sharednav.port.close()
		}, false)
		sharednav.port.start()
		sharednav.port.postMessage('')
	} catch(e) {
		target1.innerHTML = log_error(2, metric1, e, scope1)
	}
	// service
	let scope2 = 'worker_service', metric2 = 'agent_'+ scope2, target2 = dom[metric2], test2 =''
	target2.innerHTML = zF // assume failure
	try {
		// register
		navigator.serviceWorker.register('js/'+ metric2 +'_agent.js').then(function(swr) {
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
				let channel = new BroadcastChannel('sw-agent')
				channel.addEventListener('message', event => {
					//console.log('agent service', event.data.msg)
					test2 = mini(event.data.msg)
					target2.innerHTML = test2 + (test2 == control ? match_green : match_red)
					// unregister & close
					swr.unregister().then(function(boolean) {})
					channel.close()
				})
			} else {
				target2.innerHTML = zF +' ['+ sw +']'
			}
		},
		function(e) {
			target2.innerHTML = log_error(2, metric2, e, scope2)
		})
	} catch(e) {
		target2.innerHTML = log_error(2, metric2, e, scope2)
	}
}

/* USER TESTS */

function exitFS() {
	let isElementFS = document.fullscreen || document.webkitIsFullscreen || false
	if (isElementFS) {
		try {document.exitFullscreen()} catch {}
	}
}

function goFS() {
	gFS = false
	try {
		if ('android' == isOS) {
			let element = dom.tzpFS
			Promise.all([
				element.requestFullscreen()
			]).then(function(){
				get_scr_fs_measure()
			})
		} else {
			// desktop: use documentElement
				// we can scroll, click, view everything
				// let the resize event trigger running the section
				// let get_scr_measure check for document.fullscreen and fill in the display
				// use svh because otherwise the height is the full document height
			document.documentElement.requestFullscreen()
		}
	} catch(e) {dom.fsElement.innerHTML = e+''}
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
	//let newWin = window.open('tests/newwin.html','width=9000,height=9000')
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
			} catch {
				clearInterval(checking)
				// if not 'permission denied', eventually we always get
				// NS_ERROR_UNEXPECTED which we can ignore. Always output
				//console.log(e)
				//console.log(n, sizesi, sizeso)
				check_newwin()
			}
		}
		n++
	}
	let checking = setInterval(build_newwin, 3)
}

function goNW_AGENT(METRIC = 'agent_open') {
	dom[METRIC].innerHTML =''
	let list = ['appCodeName','appName','appVersion','buildID','oscpu',
		'platform','product','productSub','userAgent','vendor','vendorSub']
	let data = {}, r
	let newWin = window.open()
	let newNavigator = newWin.navigator
	list.forEach(function(p) {
		try {
			r = newNavigator[p]
			let typeCheck = typeFn(r, true), expectedType = 'string'
			if (!isGecko) {
				// type check will throw an error for a string "undefined"
				if ('buildID' == p || 'oscpu' == p) {expectedType = 'undefined'}
			}
			if (expectedType !== typeCheck) {throw zErr}
			if ('' == r) {r = 'empty string'}
		} catch(e) {
			r = e
		}
		data[p] = r+''
	})
	newWin.close()

	// hash
	let hash = mini(data)
	const ctrlHash = mini(sDetail.document.agent_reported)
	// output
	if (hash == ctrlHash) {
		hash += match_green
	} else {
		addDetail(METRIC, data)
		hash += addButton(2, METRIC) + match_red
	}
	dom[METRIC].innerHTML = hash
}

/* OUTPUT */

const outputFD = () => new Promise(resolve => {
	let METRIC = 'infinity_architecture', value, data =''
	try {
  	const f = new Float32Array([Infinity - Infinity])
  	value = new Uint8Array(f.buffer)[3]
  } catch(e) {
  	value = e; data = zErrLog
  }
	addBoth(3, METRIC, value,'','', data)

	// arch: FF110+ pref removed: error means 32bit
	if (isGecko || 'webkit' == isEngine) {
		let str = '64bit'; data = 64
		if (isArch !== true) {
			if ('RangeError: invalid array length' == isArch) {
				str = '32bit'; data = 32
			} else {
				str = isArch; data = zErr
			}
		}
		addBoth(3, 'browser_architecture', str,'','', data)
	}

	if (!isGecko) {
		let aList = ['logo','wordmark','os','version']
		if ('blink' == isEngine) {aList.push('browser_architecture')}
		aList.forEach(function(item) {addBoth(3, item, zNA)})
		aList = ['tzpWordmark','tzpResource']
		aList.forEach(function(item) {addDisplay(3, item, zNA)})
		// browser
		addBoth(3, 'browser', (undefined == isEngine ? zNA : isEngine))
		return resolve()
	}

	// logo
	let wType, hType, w, h, isLogo, isLogoData ='', isWordmark, isWordData =''
	try {
		w = dom.tzpAbout.width, h = dom.tzpAbout.height
		if (runST) {w += '', h = null}
		wType = typeFn(w), hType = typeFn(h)
		if ('number' !== wType || 'number' !== hType) {throw zErrType + wType +' x '+ hType}
		isLogo = w +' x '+ h
	} catch(e) {
		isLogo = e; isLogoData = zErrShort
	}

	// about-wordmark.svg
		// record both: if missing = 0x0 (hidden) | = image placeholder size (offscreen)
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
		if (isHidden !== isOffscreen) {isHidden += ', ' + isOffscreen}
		isWordmark = isHidden
	} catch(e) {
		isWordmark = e; isWordData = zErrShort
	}

	// set isMB: legacy: 115 + older 128's still need detection
	if (gLoad && !isBB && 'android' !== isOS) {
		let aMBVersions = [115, 128]
		if (aMBVersions.includes(isVer) && isWordmark + isLogo == '400 x 32300 x 236') {
			isMB = true
			isBB = true
			bb_green = sgtick+'MB]'+sc
			bb_red = sbx+'MB]'+sc
			bb_slider_red = sbx+'MB Slider]'+sc
			bb_standard = sg+'[MB Standard]'+sc
			bb_safer = sg+'[MB Safer]'+sc
		}
	}
	// browser
	let notation = isBB ? bb_red : ''
	addBoth(3, 'browser', (isMB ? 'Mullvad Browser' : (isTB ? 'Tor Browser' : 'Firefox')))
	addBoth(3, 'logo', isLogo,'', (isBB && '24 x 24' == isLogo ? bb_green : notation), isLogoData)
	addBoth(3, 'wordmark', isWordmark,'', (isBB && '0 x 0, 24 x 24' == isWordmark ? bb_green : notation), isWordData)

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
	addBoth(3, 'version', (isVerExtra == '+' ? isVer + isVerExtra : isVer))
	// set metricsPrefix
	if (isGecko && isSmart) {
		metricsPrefix = (isMB ? 'MB' : (isTB ? 'TB': 'FF')) + isVer + isVerExtra +'-'+ (isOS !== undefined ? isOS : 'unknown') +'-'
	}
	return resolve()
})

const outputScreen = (isResize = false) => new Promise(resolve => {
	let runtype = isResize ? 'resize': 'screen'
	Promise.all([
		get_scr_fullscreen('fullscreen'),
		get_scr_positions('positions'),
		get_scr_pixels('pixels'),
		get_scr_viewport(runtype), // gets viewport units
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

const outputAgent = () => new Promise(resolve => {
	Promise.all([
		get_agent('useragent'),
		get_agent_data('useragentdata'),
	]).then(function(){
		return resolve()
	})
})

countJS(1)
