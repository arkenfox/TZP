'use strict';

/* TIMING */

function check_timing(type) {
	let aReturn = ['performance', 'resource', 'contexttime', 'performancetime']
	if (aReturn.includes(type)) {return true}

	let setTiming = new Set(), value, result = true
	let aIgnore = [0, 1, 16, 17]
	let max = isPerf ? 10 : 500
	for (let i=1; i < max ; i++) {
		try {
			if ('now' == type) {value = performance.now() - performance.now()
			} else if ('timestamp' == type) {
				value = new Event('').timeStamp - new Event('').timeStamp
			} else if ('date' == type) {
				value = (new Date())[Symbol.toPrimitive]('number') - (new Date())[Symbol.toPrimitive]('number')
			} else if ('mark' == type) {
				value = performance.mark('a').startTime - performance.mark('a').startTime
			} else if ('currenttime' == type) {
				value = (gTimeline.currentTime) - (gTimeline.currentTime)
			}
			value = Math.abs(Math.trunc(value))
			// should match or the clock ticks over, e.g. 1ms or 16/17ms
			if (!aIgnore.includes(value)) {result = false}
			setTiming.add(value)
		} catch(e) {
			// we would have already captured errors
			return false
		}
	}
	// note: sometimes mark + timestamp "noise" mode are not caught
	// ToDo: if !isPerf and return is true, perhaps we can try something else eg with a known delay
	if (false == result) {console.log(type, max, setTiming)}
	return result
}

function get_timing_audio() {
	if (!gClick) {return}
	gClick = false

	const METRIC = 'timing_audio'
	let aList = ['contexttime','performancetime'], oTime = {}, audioCtx, source, rAF 

	aList.forEach(function(k){
		gData.timing[k] = []
		oTime[k] = []
		dom[METRIC +'_' + k.toLowerCase()] = ''
	})
	dom[METRIC].innerHTML = ''

	// collect
	function collectTimestamps() {
		const ts = audioCtx.getOutputTimestamp();
		oTime.contexttime.push(ts.contextTime * 1000)
		oTime.performancetime.push(ts.performanceTime)
		rAF = requestAnimationFrame(collectTimestamps); // Reregister itself
		if (oTime.contexttime.length > 20) {stop()}
	}

	// record
	try {
		audioCtx = new AudioContext()
		source = new AudioBufferSourceNode(audioCtx);
		source.start(0);
		rAF = requestAnimationFrame(collectTimestamps)
	} catch(e) {
		dom[METRIC].innerHTML = log_error(17, METRIC, e)
		gClick = true
	}

	// finish
	function stop() {
		source.stop(0)
		cancelAnimationFrame(rAF)
		aList.forEach(function(k){
			let data = oTime[k]
			data = data.filter(function(item, position) {return data.indexOf(item) === position})
			// contextTime: if the first value (we deduped) is 0 then we need to drop it
				// otherwise the first diff causes an offset to our 60FPS timing as rAF catches up: e.g.
				// 0, 10, 26.6, 43.3, 76.6, 110, 143.3, 160, 176.6, 193.3, 210, 243.3
				// 0, 10, 26.6, 43.3
				// ^ should be 0, 16.6, 33.3: i.e the [0, 10, 26.6...] we drop the start point of 0
				// after that everythng is in sync
			if ('contexttime' == k && 0 == data[0]) {data = data.slice(1)}
			gData.timing[k] = data
			get_timing(METRIC)
		})
		gClick = true
	}
}

function get_timing_performance() {
	// dom.enable_performance
	try {
		let tmpobj = performance.timing
		if (0 === (tmpobj.loadEventEnd - tmpobj.navigationStart)) {
			throw zD
		} else {
		let aList = ['connectStart','domComplete','domContentLoadedEventEnd','domContentLoadedEventStart','domInteractive','domLoading',
			'domainLookupEnd','domainLookupStart','fetchStart','loadEventEnd','loadEventStart','navigationStart','redirectEnd','redirectStart',
			'requestStart','responseEnd','responseStart','secureConnectionStart','unloadEventEnd','unloadEventStart',]
		let tmpTiming = []
			aList.forEach(function(k){
				let value = performance.timing[k]
				if (undefined !== value && 0 !== value) {tmpTiming.push(value)}
			})
			tmpTiming = tmpTiming.filter(function(item, position) {return tmpTiming.indexOf(item) === position})
			tmpTiming = tmpTiming.sort(function (a,b) { return a-b})
			gData.timing.performance = tmpTiming
		}
	} catch(e) {
		gData.timing.performance = e+''
	}
}

function get_timing_resource() {
	// dom.enable_resource_timing
	try {
		let entries = performance.getEntriesByType('resource')
		if (0 == entries.length) {
			if (isFile) {throw zSKIP} else {throw zD}
		} else {
			let aList = ['duration','fetchStart','requestStart','responseEnd','responseStart','secureConnectionStart','startTime']
			let tmpSet = new Set()
			entries.forEach(function(obj){
				aList.forEach(function(item){
					let value = obj[item]
					if (undefined !== value) {
						let typeCheck = typeFn(value)
						if ('number' !== typeCheck) {throw zErrType + typeCheck}
						// fix to 3 decimal places: otherwise e.g.
						// 33.33399999999999, 33.333999999999996 has a diff of 7.105427357601002e-15
						// and diff (calc1) becomes 7.1 instead of basically 0
						value = value.toFixed(3) * 1
						tmpSet.add(value)
					}
				})
			})
			let data = Array.from(tmpSet)
			data = data.sort(function (a,b) { return a-b})
			gData.timing.resource = data
		}
	} catch(e) {
		gData.timing.resource = e+''
	}
}

function get_timing(METRIC) {
	let aLoop = ['contexttime','performancetime']
	if ('timing_precision' == METRIC) {
		aLoop = gTiming
		// check isPerf again
		if (isPerf) {get_isPerf()}
		get_timing_performance()
		get_timing_resource()
		// get a last value for each to ensure a max diff
		try {gData.timing['now'].push(performance.now())} catch(e) {}
		try {gData.timing['timestamp'].push(new Event('').timeStamp)} catch(e) {}
		try {
			gData.timing['mark'].push(performance.mark('a').startTime)
		} catch(e) {}
		try {gData.timing['date'].push((new Date())[Symbol.toPrimitive]('number'))} catch(e) {}
		try {gData.timing['currenttime'].push(gTimeline.currentTime)} catch(e) {}
		/* testing
		gData.timing.date = [1723240561321]
		gData.timing.exslt = ['2024-08-09T20:23:10.000','2024-08-09T20:23:11.000']
		gData.timing.currenttime = [83.34, 116.72, 150, 233.4] // 60FPS but no 3 decimal places
		//*/
	}

	let oGood = {
		'date': [0, 1, 16, 17, 33, 34],
		'performance': [0, 1, 16, 17, 33, 34],
		'exslt': [0], // 1912129: exslt diffs must be 1000, and all end in .000
		'other': [
			// tested 20/10mn timestamps over ~12s/6s = ~750/370 unique times
			// the longer since the first time, the more decimal points drift
			// so 0's become 0.1's then 0.2's etc: 6s seems to limit drift to 1 decimal point
			0, 0.1, 0.2, 0.3, 0.4,
			16.6, 16.7, 16.8, 16.9, 17,
			33.3, 33.4, 33.5, 33.6, 33.7,
		],
		'ten': [0, 10, 20, 30, 40],
	}

	let aNotInteger = ['mark','now','timestamp']
	let calc1 = new RegExp('^-?\\d+(?:\.\\d{0,' + (1 || -1) + '})?')
	let str, data, notation, oData = {}, countFail = 0

	sDetail.document[METRIC +'_data'] = {}
	let isDateNoise = false

	aLoop.forEach(function(k){
		let aGood = oGood[k]
		if (undefined == aGood) {aGood = oGood.other}
		// don't add to health, we do that with the parent metric
		str ='', notation = sb +"[<span class='healthsilent'>" + cross +'</span>]'+ sc
		try {
			let aTimes = gData.timing[k]
			if ('string' == typeof aTimes) {throw aTimes}
			aTimes = aTimes.filter(function(item, position) {return aTimes.indexOf(item) === position})
			sDetail.document[METRIC +'_data'][k] = aTimes
			// type check
			let setDiffs = new Set(), aTotal = []
			let start = aTimes[0], expected = 'exslt' == k ? 'string' : 'number'
			let typeCheck = typeFn(start)
			if (expected !== typeCheck) {throw zErrType + typeCheck}
			// check noise
			let isNoise = 'exslt' == k ? false : !check_timing(k)
			let isMatch = true
			if (aNotInteger.includes(k) && Number.isInteger(start)) {isMatch = false}
			if ('date' == k) {
				isDateNoise = isNoise
			} else if ('exslt' == k) {
				isNoise = isDateNoise
				if ('.000' !== start.slice(-4)) {isMatch = false}
				// we use epoch time so each entry is always moving forward in time | remove leading 0 in ms
				start = start.slice(0,20) + start.slice(-2)+ '0'
				start = (new Date(start))[Symbol.toPrimitive]('number')
			}
			// get diffs
			let isZero = false, is10 = true, is100 = true
			if (1 == aTimes.length) {
				aTotal.push(0) // make sure we display something
				if ('exslt' !== k) {isMatch = false} // all non-exslt we expect multiple values
				isZero = true
			}
			for (let i=1; i < aTimes.length ; i++) {
				let end = aTimes[i]
				typeCheck = typeFn(end)
				if (expected !== typeCheck) {throw zErrType + typeCheck}
				if ('exslt' == k) {
					if ('.000' !== end.slice(-4)) {isMatch = false}
					end = end.slice(0,20) + end.slice(-2)+ '0'
					end = (new Date(end))[Symbol.toPrimitive]('number')
				}
				// truncate to 1 decimal place
				let totaldiff = ((end - start).toString().match(calc1)[0]) * 1
				aTotal.push(totaldiff)
				let diff = (totaldiff % 50).toFixed(2) * 1 // drop 50s
				setDiffs.add(diff)
			}
			let aDiffs = Array.from(setDiffs)
			//if ('resource' == k) {console.log(aDiffs, aTotal)}

			// test intervals
			for (let i=0; i < aDiffs.length; i++) {
				if (isMatch && !aGood.includes(aDiffs[i])) {isMatch = false}
				if (is10 && !oGood.ten.includes(aDiffs[i])) {is10 = false}
				if (is100 && 0 !== aDiffs[i]) {is100 = false}
			}
			// dates: other tests we can rely on non-integer, but not dates
				// but we measure enough dates to not all land on 0's (or 50's and 100s)
			if ('date' == k) {if (is100 || is10) {isMatch = false}}
			// clean up exslt
			if ('exslt' == k) {
				if (isNoise) {
					is100 = false
					if ('10ms' !== oData['date']) {is10 = false}
				}
			}
			// currenttime: 60FPS false positives: check for 3 decimal places
			if (isMatch && 'currenttime' == k) {
				isMatch = false
				for (let i=0; i < aTimes.length; i++) {
					let check = Math.floor(aTimes[i]) === aTimes[i] ? 0 : (aTimes[i]).toString().split(".")[1].length
					if (3 === check) {isMatch = true; break}
				}
			}
			//console.log(k, isNoise)
			let value = ''
			if (isMatch && !isNoise) {
				notation = sg +"[<span class='healthsilent'>"+ tick +'</span>]'+ sc
				value = 'RFP'
			} else {
				// add entropy e.g. jShelter 10ms or 100ms or noise
				// order is 100+, 100, 10, noise, nothing
				if (isZero) {value = '+100ms'
				} else if (is100) {value = '100ms'
				} else if (is10) {value = '10ms'
				} else if (isNoise) {value = 'noise'
				}
				countFail++
			}
			oData[k] = value

			// display
			str = aTotal.join(', ')
			let strLen = str.length
			if (strLen > 60) {
				let len = aTotal.length, unitLen = strLen/(aTotal.length)
				let reduce = Math.floor((str.length - 60)/unitLen)
				let lasttwo = ' &#x2026 '+ aTotal[len-2] +', '+aTotal[len-1]
				let newTotal = aTotal.slice(0, len - (reduce + 2))
				if ((newTotal.join(', ') + lasttwo).length > 60) {newTotal = newTotal.slice(0, len - (reduce + 3))}
				str = newTotal.join(', ') + lasttwo
			}
			data = aDiffs
			//console.log(k, data, isZero, is10, is100, aDiffs, aTotal)
		} catch(e) {
			str = (zD == e || zSKIP == e) ? e : log_error(17, METRIC +'_'+ k, e)
			oData[k] = (zD == e || zSKIP == e) ? e : zErr
			data = str
			if (zSKIP !== e) {countFail++} else {notation = ''}
		}
		//sDetail.document[METRIC][k] = data
		if ('timing_precision' == METRIC) {
			addDisplay(17, METRIC +'_'+ k, str,'', notation)
		} else {
			dom[METRIC +'_'+ k].innerHTML = str + (isSmart ? notation : '')
		}
	})
	// display
	let countProtected = aLoop.length - countFail
	let isProtected = countProtected == aLoop.length
	notation = isProtected ? rfp_green : rfp_red
	str = countProtected +'/' + aLoop.length
	let btn = addButton(17, METRIC, str) + addButton(17, METRIC +'_data', 'data')
	// data
	if ('timing_precision' == METRIC) {
		addBoth(17, METRIC, mini(oData), btn, notation, oData)
	} else {
		sDetail.document[METRIC] = oData
		dom[METRIC].innerHTML = mini(oData) + btn + (isSmart ? notation : '')
		gClick = false
	}
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
				'locks', // 1851539
				'userActivation', // 1791079
			]
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
				if ('17ad3a75' == hash) {notation = tb_green} // 14 42
			} else {
				if ('android' == isOS) {
					// awaiting isTB android fix
				} else {
					if ('b9ee3d3d' == hash) {notation = tb_green} // 14 40
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
		let notation = default_red, isLies = false
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
		if ('91073152' == hash) {notation = default_green}
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
				// isLies: exempt exact NS hashes: 11.4.37
				//console.log(mini(aTampered), aTampered.join(","))
				/*
				c36227b3 (standard)
					Element,HTMLElement,HTMLFrameElement,HTMLIFrameElement,HTMLObjectElement
				97f1edb8 (safer) 
					Blob,Element,HTMLCanvasElement,HTMLElement,HTMLFrameElement,HTMLIFrameElement,HTMLObjectElement,
					MediaSource,MessagePort,OffscreenCanvas,Promise,Proxy,SharedWorker,String,URL,Worker,XMLHttpRequest,
					XMLHttpRequestEventTarget,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,escape,unescape,webkitURL
				18d6b7c6 (safer with allowing webgl clickToPlay)
					Element,HTMLElement,HTMLFrameElement,HTMLIFrameElement,HTMLObjectElement,
					MediaSource,URL,webkitURL

				#42767 with offscreenCanvas disabled
				78e565db (safer)
					Element,HTMLCanvasElement,HTMLElement,HTMLFrameElement,HTMLIFrameElement,HTMLObjectElement,
					MediaSource,Proxy,URL,webkitURL
				*/
				let aGood = ['c36227b3','97f1edb8','78e565db','18d6b7c6']
				if (!aGood.includes(mini(aTampered))) {isLies = true}
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
				if ('ab3ba8af' == hash || '2e54008d' == hash) {notation = tb_green} // MB14: 820 standard | 819 safer
				if ('da1ce8c4' == hash || 'ef3fd962' == hash) {notation = tb_green} // MB14: #42767 offScreenCanvas disabled

			} else {
				if (isOS == 'android') {
					// ToDo: we can't detect isTB on android
				} else {
					if ('5dc788bc' == hash || '9d354b5a' == hash) {notation = tb_green} // TB14: 817 standard | 816 safer
					if ('e0f2c491' == hash || 'beeaafef' == hash) {notation = tb_green} // TB14: #42767 offScreenCanvas disabled
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
