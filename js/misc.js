'use strict';

/* TIMING */

function get_timing(METRIC) {
	/*
	let test = performance.now()
	let diff = Math.trunc(performance.now() - performance.now())
	if (runSI) {diff = 10}
	if (0 !== diff) {throw zErrInvalid +'expected 0'}
	*/

	// get values as late as possible
	try {gData.timing['now'].push(performance.now())} catch(e) {}
	try {gData.timing['timestamp'].push(new Event('').timeStamp)} catch(e) {}
	try {
		gData.timing['mark'].push(performance.mark('a').startTime)
		performance.clearMarks('a')
	} catch(e) {}
	try {gData.timing['date'].push((new Date())[Symbol.toPrimitive]('number'))} catch(e) {}

	let oGood = {
		'date': [0, 1, 16, 17, 33, 34, 50, 66, 67, 83, 84],
		'exslt': [0, 10, 20, 30, 40, 50, 60, 70, 80, 90], // for now
		'other': [0, 16.6, 16.7, 33.3, 33.4, 50, 66.6, 66.7, 83.3, 83.4]
	}
	let aNotInteger = ['mark','now','timestamp']
	let str, data, notation, aFail = []
	sDetail.document[METRIC] = {}
	sDetail.document[METRIC +'_data'] = {}

	gTiming.forEach(function(k){
		let aGood = oGood[k]
		if (undefined == aGood) {aGood = oGood.other}
		// don't add to health, we do that with the parent metric
		str ='', notation = sb +"[<span class='healthsilent'>" + cross +'</span>]'+ sc
		let isMatch = true, typeCheck
		try {
			// use gData.timing
			let aTimes = gData.timing[k]
			aTimes = aTimes.filter(function(item, position) {return aTimes.indexOf(item) === position})
			sDetail.document[METRIC +'_data'][k] = aTimes
			if ('string' == typeof aTimes) {throw aTimes}
			// get diffs, check for null/boolean
			let aDiffs = [], aTotal = [], start = aTimes[0], expected = 'exslt' == k ? 'string' : 'number'
			typeCheck = typeFn(start)
			if (expected !== typeCheck) {throw zErrType + typeCheck}

			if ('exslt' == k) {
				// we use epoch time so each entry is always moving forward in time
				// and to remove the leading 0 in ms
				start = start.slice(0,20) + start.slice(-2)+ '0'
				start = (new Date(start))[Symbol.toPrimitive]('number')
			}

			if (aNotInteger.includes(k) && Number.isInteger(start)) {isMatch = false}
			for (let i=1; i < aTimes.length ; i++) {
				let end = aTimes[i]
				typeCheck = typeFn(end)
				if (expected !== typeCheck) {throw zErrType + typeCheck}
				if ('exslt' == k) {
					end = end.slice(0,20) + end.slice(-2)+ '0'
					end = (new Date(end))[Symbol.toPrimitive]('number')
				}
				let diff = ((end - start) % 100).toFixed(1) * 1 // drop hundreds
				aDiffs.push(diff)
				if (!aGood.includes(diff)) {isMatch = false}
				let totaldiff = (end - start).toFixed(1) * 1
				aTotal.push(totaldiff)
			}
			if (1 == aTotal.length) {isMatch = false}
			if (isMatch) {
				notation = sg +"[<span class='healthsilent'>"+ tick +'</span>'+ ('exslt' == k ? ' default]' : ']') + sc
			} else {
				aFail.push(k)
				// ToDo: provide minimum gap: e.g. jShelter 10ms or 100ms
			}
			// display: always show the last two
			let lasttwo = '', len = aTotal.length
			if (len > 12) {
				lasttwo = ' ... '+ aTotal[len-2] +', '+aTotal[len-1]
				aTotal = aTotal.slice(0,10)
			}
			str = aTotal.join(', ') + lasttwo
			data = aDiffs
		} catch(e) {
			str = log_error(17, METRIC +'_'+ k, e)
			data = str
			isMatch = false
			aFail.push(k)
		}
		sDetail.document[METRIC][k] = data
		addDisplay(17, METRIC +'_'+ k, str,'', notation)
	})
	let countProtected = gTiming.length - aFail.length
	let isProtected = countProtected == gTiming.length
	notation = isProtected ? rfp_green : rfp_red
	str = countProtected +'/' + gTiming.length +' protected'
	data = isProtected ? 'protected' : 'unprotected: '+ aFail.join(', ')
	let btn = addButton(17, METRIC +'_data', 'data')
	// append the btn to str since the metric is not an object: see addBoth() logic
	addBoth(17, METRIC, str + btn,'', notation, data)
	return
}

function get_perf_timing(METRIC) {
	// dom.enable_performance
	let str, data =''
	try {
		if (runSE) {foo++}
		let timing = performance.timing
		str = (timing.loadEventEnd - timing.navigationStart) == 0 ? zD : zE
	} catch(e) {
		str = e; data = zErrLog
	}
	addBoth(17, METRIC, str,'','', data)
	return
}

function get_perf_resource(METRIC) {
	// dom.enable_resource_timing
	let str, data =''
	try {
		if (runSE) {foo++}
		str = performance.getEntriesByType('resource').length > 0 ? zE : zD
		if (isFile) (str = zSKIP)
	} catch(e) {
		str = e; data = zErrLog
	}
	addBoth(17, METRIC, str,'','', data)
	return
}

/* MISC */

function check_mathLies() {
	const mathList = [
		'Math.acos','Math.acosh','Math.asinh','Math.atan','Math.atan2','Math.atanh',
		'Math.cbrt','Math.cos','Math.cosh','Math.exp','Math.expm1','Math.log','Math.log10',
		'Math.log1p','Math.sin','Math.sinh','Math.sqrt','Math.tan','Math.tanh'
	]
	return mathList.some(lie => sData[SECT99].indexOf(lie) >= 0)
}

function get_component_shims(METRIC) {
	let hash, btn ='', data, notation = isTB ? tb_red: ''
	try {
		data = Object.keys(Object.getOwnPropertyDescriptors(Components.interfaces))
		hash = mini(data); btn = addButton(18, METRIC, data.length)
	} catch(e) {
		if (isTB && e+'' == 'ReferenceError: Components is not defined') {notation = tb_green}
		hash = e; data = zErrLog
	}
	addBoth(18, METRIC, hash, btn, notation, data)
	return
}

function get_math(METRIC, isLies) {
	let hash, btn='', data = {}, notation = 'math_trig' == METRIC ? rfp_red : ''
	try {
		if ('math_trig' == METRIC) {
			const oMath = {
				cos: [
					['-1',-1],['17*Math.LOG10E',17*Math.LOG10E],['1e12',1e12],['1e130',1e130],
					['1e140',1e140],['1e251',1e251],['1e272',1e272],['1e284',1e284],['1e75',1e75],
					['21*Math.LN2',21*Math.LN2],['21*Math.LOG2E',21*Math.LOG2E],['25*Math.SQRT2',25*Math.SQRT2],
					['50*Math.SQRT1_2',50*Math.SQRT1_2],['51*Math.LN2',51*Math.LN2],['57*Math.E',57*Math.E],
				],
				sin: [
					['35*Math.SQRT1_2',35*Math.SQRT1_2],['7*Math.LOG10E',7*Math.LOG10E],
				],
				tan: [
					['10*Math.LOG10E',10*Math.LOG10E],['10*Math.LOG2E',10*Math.LOG2E],
					['17*Math.SQRT2',17*Math.SQRT2],['34*Math.SQRT1_2',34*Math.SQRT1_2],
					['6*Math.E',6*Math.E],['6*Math.LN2',6*Math.LN2],
				],
			}
			const keys = ['cos','sin','tan']
			for (let x = 0; x < keys.length; x++){
				let k = keys[x]
				oMath[k].forEach(function(item) {data['Math.'+ k +'('+ item[0] +')'] = Math[k](item[1])})
			}
		} else {
			data = {
				'(Math.E - 1 / Math.E) / 2': (Math.E - 1 / Math.E) / 2, // sinh(1)
				'(Math.exp(1) + Math.exp(-1)) / 2': (Math.exp(1) + Math.exp(-1)) / 2, // cosh(1)
				'(Math.exp(1) - Math.exp(-1)) / 2': (Math.exp(1) - Math.exp(-1)) / 2, // sinh(1) alt
				'Math.E - 1': Math.E - 1, // expm1(1)
				'Math.cosh(1)': Math.cosh(1),
				'Math.exp(1) - 1': Math.exp(1) - 1, // expm1(1) alt
				'Math.log((1.5)/(0.5))/2': Math.log((1.5) / (0.5)) / 2,
				'Math.pow(Math.abs(Math.PI), 1 / 3)': Math.pow(Math.abs(Math.PI), 1 / 3), // polyfill cbrt(Math.PI)
			}
		}
		if (runST) {if ('math_trig' == METRIC) {data['Math.cos(-1)'] = NaN} else {data['Math.E - 1'] = Infinity}}
		for (const k of Object.keys(data)) {
			let typeCheck = typeFn(data[k])
			if ('number' !== typeCheck) {throw zErrType + typeCheck}
		}
		hash = mini(data); btn = addButton(18, METRIC)
		if (METRIC == 'math_trig' && 'd240b02e' == hash) {notation = rfp_green}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(18, METRIC, hash, btn, notation, data, isLies)
	return
}

function get_navigator_keys(METRIC) {
	let hash, btn='', data, notation = isTB ? tb_red : '', isLies = false
	try {
		if (runST) {foo++}
		data = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		let typeCheck = typeFn(data)
		if ('array' !== typeCheck) {throw zErrType + typeCheck}
		/* these should match
		let keysB = []
		for (const key in navigator) {keysB.push(key)}
		keysB.push('constructor')
		console.log(mini(keys), mini(keysB))
		//*/
		let tamperBtn = ''
		if (isSmart) {
			let fake = [], missing = [], moved = [], oKeys = {}
			// ToDo: check/expand these: e.g. javaEnabled?
			let expected = [
				'appCodeName','appName','appVersion','buildID','oscpu','platform','product',
				'productSub','userAgent','vendor','vendorSub','hardwareConcurrency','language',
				'languages','mimeTypes','onLine','plugins','taintEnabled','doNotTrack',
				'cookieEnabled','pdfViewerEnabled','requestMediaKeySystemAccess',
			]
			if (isVer > 118) {expected.push('locks')} // 1851539
			if (isVer > 119) {expected.push('userActivation')} // 1791079
			if (runSL) {
				data.push('iamfake','anotherfake') // +fake
				data = data.filter(x => !['buildID'].includes(x)) // +missing
				data = data.filter(x => !['appName'].includes(x)); data.push('appName') // +move
			}
			fake = data.slice(data.indexOf('constructor')+1) // post constructor
			missing = expected.filter(x => !data.includes(x)) // use data so we don't dupe moved
			moved = fake.filter(x => expected.includes(x)) // moved: expected after contructor
			fake = fake.filter(x => !moved.includes(x)) // fake minus moved

			if (missing.length) {oKeys['missing'] = missing.sort()}
			if (moved.length) {oKeys['post-constructor'] = moved.sort()}
			if (fake.length) {oKeys['unexpected'] = fake.sort()}

			let lieCount = missing.length + fake.length,
				moveCount = moved.length
			// tampered
			if ((lieCount + moveCount) > 0) {
				isLies = true
				let tmp = []
				if (lieCount > 0) {tmp.push(lieCount +' lie'+ (lieCount > 1 ? 's' : ''))}
				if (moveCount > 0) {tmp.push(moveCount + ' tampered')}
				addDetail(METRIC +'_tampered', oKeys)
				tamperBtn = addButton(18, METRIC +'_tampered', tmp.join('/'))
			}
		}
		hash = mini(data); btn = addButton(18, METRIC, data.length) + tamperBtn
		// health: 115+ only do TB/MB as ESR is stable
		if (isTB) {
			if (isMullvad) {
				// MB has mediaDevices, mediaSession
				if (115 == isVer && '161c395f' == hash) {notation = tb_green // 13.5 39
				} else if (128 == isVer && 'e86e86ed' == hash) {notation = tb_green} // 14 44
			} else {
				if ('android' == isOS) {
					// awaiting isTB android fix
				} else {
					if (115 == isVer && '8181bb97' == hash) {notation = tb_green // 13.5 37
					} else if (128 == isVer && 'b9ee3d3d' == hash) {notation = tb_green} // 14 40
				}
			}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(18, METRIC, hash, btn, notation, data, isLies)
	return
}

function get_pdf(METRIC) {
	// FF99+ none/hardcoded: all three are expected nav keys
	let data = {}
	function get_obj(item) {
		let res = 'none'
		try {
			let obj = navigator[item]
			if (runST) {obj = []} else if (runSI) {obj = {}}
			let typeCheck = typeFn(obj, true)
			if ('object' !== typeCheck) {throw zErrType + typeFn(obj)}
			let expected = '[object '+ item.charAt(0).toUpperCase() + (item.slice(1)).slice(0, -1) +'Array]'
			if (expected !== obj+'') {throw zErrInvalid +'expected '+ expected +': got '+ obj+''}
			let cyclicTest = mini(obj) // TypeError: cyclic object
			if (obj.length) {
				res = []
				for (let i=0; i < obj.length; i++) {
					if ('mimeTypes' == item) {
						res.push( obj[i].type + (obj[i].description == '' ? ': * ' : ': '+ obj[i].type)
							+ (obj[i].suffixes == '' ? ': *' : ': '+ obj[i].suffixes))
					} else {
						res.push(obj[i].name + (obj[i].filename == '' ? ': * ' : ': '+ obj[i].filename)
							+ (obj[i].description == '' ? ': *' : ': '+ obj[i].description))
					}
				}
			}
		} catch(e) {
			log_error(18, METRIC +'_'+ item, e); res = zErr
		}
		data[item] = res
		return
	}
	function get_pdfViewer(item) {
		let res
		try {
			res = navigator[item]
			if (runST) {res = undefined}
			let typeCheck = typeFn(res)
			if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
		} catch(e) {
			log_error(18, METRIC +'_'+ item, e); res = zErr
		}
		data[item] = res
		return
	}
	Promise.all([
		get_obj('mimeTypes'), // do in sorted order
		get_pdfViewer('pdfViewerEnabled'),
		get_obj('plugins'),
	]).then(function() {
		// FF116 1838415 dropped RFP protection
		let notation = (isVer < 116 ? rfp_red : default_red), isLies = false
		if (runSL) {data = {'mimeTypes': 'none', 'pdfViewerEnabled': true, 'plugins': 'none'}}
		let hash = mini(data)
		if (!['91073152','beccb452'].includes(hash) || isProxyLie('Navigator.pdfViewerEnabled')) {
			isLies = true
		} else {
			try {
				let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
				if (keys.indexOf('pdfViewerEnabled') > keys.indexOf('constructor')) {isLies = true}
			} catch(e) {}
		}
		if ('91073152' == hash) {notation = isVer < 116 ? rfp_green : default_green}
		addBoth(18, METRIC, hash, addButton(18, METRIC), notation, data, isLies)
		return
	})
}

function get_svg(METRIC) {
	let hash, data =''
	try {
		if (runSE) {foo++}
		dom.svgDiv.innerHTML =''
		const svgns = 'http://www.w3.org/2000/svg'
		let shape = document.createElementNS(svgns,'svg')
		let rect = document.createElementNS(svgns,'rect')
		rect.setAttribute('width',20)
		rect.setAttribute('height',20)
		shape.appendChild(rect)
		dom.svgDiv.appendChild(shape)
		hash = dom.svgDiv.offsetHeight > 0 ? zE : zD
	} catch(e) {
		hash = e; data = zErrLog
	}
	try {dom.svgDiv.innerHTML =''} catch(e){}
	addBoth(18, METRIC, hash,'','', data)
	return
}

function get_window_prop(METRIC) {
	// TB: display only: wasm
	let str, notation = isTB ? tb_slider_red : ''
	try {
		str = window.WebAssembly
		if (runST) {str = null}
		let typeCheck = typeFn(str)
		if ('undefined' !== typeCheck && 'object' !== typeCheck) {throw zErrType + typeCheck}
		str = ('object' === typeCheck) ? zE : zD
		if (isTB) {notation = str == zE ? tb_standard : tb_safer}
	} catch(e) {
		str = log_error(18, METRIC, e)
	}
	addDisplay(18, METRIC, str,'', notation)
	return
}

function get_window_props(METRIC) {
	/* https://github.com/abrahamjuliot/creepjs */
	let t0 = nowFn(), iframe
	let hash, btn='', data, notation = isTB ? tb_red : '', isLies = false
	let id = 'iframe-window-version'

	try {
		// create & append
		let el = document.createElement('iframe')
		el.setAttribute('id', id)
		el.setAttribute('style', 'display: none')
		if (!runSE) {document.body.appendChild(el)}
		// get props
		iframe = dom[id]
		let contentWindow = iframe.contentWindow
		data = Object.getOwnPropertyNames(contentWindow)

		let tamperBtn = ''
		if (isSmart) {
			// tampered: filter items for console open etc
			if (runSL) {data.push('fake')}
			let aTampered = data.slice(data.indexOf('Performance')+1)
			aTampered = aTampered.filter(x => !['Event','Location'].includes(x))
			if (aTampered.length) {
				addDetail(METRIC +'_tampered', aTampered.sort())
				tamperBtn = addButton(18, METRIC +'_tampered', aTampered.length + ' tampered')
				// isLies: exempt exact NS hashes
				if (!['c36227b3','d3ed1b76'].includes(mini(aTampered))) {isLies = true}
			}
			// notate console
			if (!isLies && isOS !== 'android' && isOS !== undefined) {
				/* safer closed: Performance ... more items then Event
				standard closed: Performance + no Event...
				 TB/FF/ALL open: Performance then Event...
				*/
				let indexPerf = data.indexOf('Performance'), indexEvent = data.indexOf('Event')
				let strConsole = ' [console ' + (indexPerf + 1 == indexEvent ? 'open' : 'closed') +']'
				addDisplay(18, 'consolestatus', strConsole)
			}
		}
		data.sort() // sort: console state affects order
		hash = mini(data); btn = addButton(18, METRIC, data.length) + tamperBtn
		if (isTB) {
			// ToDo: touch devices
				// Touch, TouchEvent, TouchList, ontouchcancel, ontouchend, ontouchmove, ontouchstart
				// e.g. is not in my windows touch-capable laptop but may be present in a tablet
			// dom.w3c_touch_events.enabled: 0=disabled (macOS) 1=enabled 2=autodetect (linux/win/android)
				// autodetection is currently only supported on Windows and GTK3 (and assumed on Android)
				// on touch devices: 0 (all false) 1 or 2 (all true)

			if (isMullvad) {
				if ('666609cb' == hash || '969877a9' == hash) {notation = tb_green} // MB13.5: 825 standard | 824 safer
			} else {
				if (isOS == 'android') {
					// ToDo: we can't detect isTB on android
				} else {
					if (115 == isVer) {
						if ('7d50bf8c' == hash || '7a49e32a' == hash) {notation = tb_green} // TB13.5: 776 standard | 775 safer #42315
					}
					if (128 == isVer) {
						if ('f83a05b0' == hash || '86e2c34e' == hash) {notation = tb_green} // TB14: 787 standard | 786 safer
					}
				}
			}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(18, METRIC, hash, btn, notation, data, isLies)
	log_perf(18, METRIC, t0)
	return
}

const outputTiming = () => new Promise(resolve => {
	if (!gRun) {return}

	/* other perf prefs are in window properties
		dom.enable_performance_observer: PerformanceObserver, PerformanceObserverEntryList
		dom.enable_performance_navigation_timing: PerformanceNavigationTiming
		dom.enable_event_timing: EventCounts, PerformanceEventTiming
		dom.performance.time_to_contentful_paint.enabled: ?
		dom.enable_performance: ?
		dom.enable_resource_timing: doesn't remove property PerformanceResourceTiming
	*/
	Promise.all([
		get_timing('timing_precision'),
		get_perf_resource('perf_resource'), // #42153, this function tests if API is working
		get_perf_timing('perf_timing'),
	]).then(function(){
		return resolve()
	})
})

const outputMisc = () => new Promise(resolve => {
	if (runSL) {addProxyLie('Math.sin')}
	let isMathLies = check_mathLies()
	try {null.bar} catch(e) {
		let notation = ''
		if (isTB) {notation = (e+'' == 'TypeError: null has no properties' ? tb_green : tb_red)}
		addBoth(18, 'error_message_fix', e.message,'', notation) // FF74+: 1259822
	}
	Promise.all([
		get_svg('svg_enabled'),
		get_math('math_trig', isMathLies),
		get_math('math_other', isMathLies),
		get_component_shims('component_interfaces'),
		get_window_prop('wasm'),
		get_window_props('window_properties'),
		get_navigator_keys('navigator_keys'),
		get_pdf('pdf'),
	]).then(function(){
		return resolve()
	})
})

countJS(18)
