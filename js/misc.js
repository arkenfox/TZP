'use strict';

/* TIMING */

function check_timing(type) {
	let aAllow = ['currenttime', 'date', 'mark', 'now', 'timestamp']
	if (!aAllow.includes(type)) {return true}

	let setTiming = new Set(), value, result = true
	let aIgnore = [0, -0, -1, -16, -17]
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
			value = Math.trunc(value)
			// we're subtracting the second measurement from the first so any value !== 0/-0 would be negative
			if (!aIgnore.includes(value)) {result = false}
			setTiming.add(value)
		} catch {
			// we would have already captured errors
			return true
		}
	}
	// note: sometimes mark + timestamp "noise" mode are not caught
	// ToDo: if !isPerf and return is true, perhaps we can try something else eg with a known delay
	if (false == result) {console.log(type, max, setTiming)}
	return result
}

function get_timing_mark() {
	try {
		let entries = performance.getEntriesByName("a","mark")
		if (undefined === entries) {
			throw zD
		} else {
			let tmpSet = new Set()
			entries.forEach(function(obj){
				let value = obj.startTime
				if (undefined !== value) {
					let typeCheck = typeFn(value)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
						tmpSet.add(value)
				}
			})
			let data = Array.from(tmpSet)
			data = data.sort(function (a,b) { return a-b})
			gData.timing.mark = data
		}
	} catch(e) {
		gData.timing.mark = e+''
	}
}

function get_timing_navigation() {
	// dom.enable_performance_navigation_timing
	try {
		let entries = performance.getEntries().find(({entryType})=>entryType==='navigation')
		if (undefined === entries) {
			throw zD
		} else {
			let aList = ['connectEnd','connectStart','domComplete','domContentLoadedEventEnd','domContentLoadedEventStart',
				'domInteractive','domainLookupEnd','domainLookupStart','duration','loadEventEnd','loadEventStart',
				'requestStart','responseEnd','responseStart','secureConnectionStart','startTime','unloadEventEnd',
				'unloadEventStart','workerStart']
			let tmpSet = new Set()
			aList.forEach(function(k){
				let value = entries[k]
				if (undefined !== value) {
					let typeCheck = typeFn(value)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					tmpSet.add(value)
				}
			})
			let data = Array.from(tmpSet)
			data = data.sort(function (a,b) { return a-b})
			gData.timing.navigation = data
		}
	} catch(e) {
		gData.timing.navigation = e+''
	}
}

function get_timing_performance() {
	// dom.enable_performance
	try {
		let entries = performance.timing
		if (0 === entries.loadEventEnd && 0 == entries.navigationStart) {
			throw zD
		} else {
			let aList = ['connectStart','domComplete','domContentLoadedEventEnd','domContentLoadedEventStart',
				'domInteractive','domLoading','domainLookupEnd','domainLookupStart','fetchStart','loadEventEnd',
				'loadEventStart','navigationStart','redirectEnd','redirectStart','requestStart','responseEnd',
				'responseStart','secureConnectionStart','unloadEventEnd','unloadEventStart']
			let tmpSet = new Set()
			aList.forEach(function(k){
				let value = performance.timing[k]
				if (undefined !== value && 0 !== value) {
					let typeCheck = typeFn(value)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					tmpSet.add(value)
				}
			})
			let data = Array.from(tmpSet)
			data = data.sort(function (a,b) { return a-b})
			gData.timing.performance = data
		}
	} catch(e) {
		gData.timing.performance = e+''
	}
}

function get_timing_resource() {
	// dom.enable_resource_timing
	try {
		let entries = performance.getEntriesByType('resource')
		if (0 === entries.length) {
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
						// don't allow huge drift
						if (value < 200000) {
							value = value.toFixed(3) * 1
							tmpSet.add(value)
						}
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
	let strZero = 'not enough data'
	if ('timing_precision' == METRIC) {
		aLoop = gTiming
		// check isPerf again
		if (isPerf) {get_isPerf()}
		// get a last value for each to ensure a max diff
		addTimings()
		// poulate some data
		get_timing_mark()
		get_timing_navigation()
		get_timing_performance()
		get_timing_resource()
		/* testing
		gData.timing.date = [1723240561321]
		gData.timing.exslt = ['2024-08-09T20:23:10.000','2024-08-09T20:23:11.000']
		gData.timing.currenttime = [83.34, 116.72, 150, 233.4] // 60FPS but no 3 decimal places
		gData.timing.currenttime = [966.686] // only a single RFP entry
		gData.timing.currenttime = [962.486] // only a single non-RFP entry

		//ToDo: cleanup rogue is10's and is100's
			// looking at these they aren't actually 100's but also 50's: but I use divided by 2
		gData.timing.currenttime = [86.4, 136.44, 236.48] // real world examples that causes a 100ms entry
		gData.timing.currenttime = [75.12, 125.16, 225.24] // another one
		gData.timing.currenttime = [71.12, 121.14, 171.16] // another one

		gData.timing.exslt = ["2025-07-14T03:53:46.047","2025-07-14T03:53:46.058"]
		//*/

		// isDecimal
		isDecimal = false
		if (isPerf) {
			try {
				for (let i=0; i < gData.timing.now.length; i++) {
					if (!Number.isInteger(gData.timing.now[i])) {isDecimal = true; break}
				}
			} catch(e) {console.log(e+'')}
		}
	}
	let oGood = {
		'date': [0, 1, 16, 17, 33, 34],
		'instant': [0, 1, 16, 17, 33, 34],
		'resource': [0, 1, 2, 3, 16, 17, 18, 19, 33, 34, 35, 36], // resource can have large drift, use integers: e.g. wait ages then rerun
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
	let str, data, notation, oData = {}, countFail = 0, countErr = 0

	sDetail[isScope][METRIC +'_data'] = {}
	let isDateNoise = false

	aLoop.forEach(function(k){
		let aGood = oGood[k]
		if (undefined == aGood) {aGood = oGood.other}
		// don't add to health, we do that with the parent metric
		str ='', notation = silent_red
		try {
			let aTimes = gData.timing[k]
			if ('string' == typeof aTimes) {throw aTimes}
			aTimes = dedupeArray(aTimes)
			if (aTimes.length) {sDetail[isScope][METRIC +'_data'][k] = {'data': aTimes}}
			// type check
			let start = aTimes[0]
			let expected = ('exslt' == k || 'instant' == k) ? 'string' : 'number'
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
			} else if ('instant' == k) {
				start = start.slice(0,-1) // remove trailing Z
				start = (new Date(start))[Symbol.toPrimitive]('number')
			} else if ('resource' == k) {
				start = Math.floor(start)
			}
			let startIncremental = start

			// get diffs
			let isZero = false, is10 = true, is100 = true
			if ('exslt' == k) {is100 = false} // exslt can only be 10 or RFP
			let setDiffs = new Set(), setIncremental = new Set(), aTotal = []
			if (1 == aTimes.length) {
				aTotal.push(0) // make sure we display something
				// all non-exslt we expect multiple values
				if ('exslt' !== k) {isMatch = false}
				isZero = true
			}
			for (let i=1; i < aTimes.length ; i++) {
				let end = aTimes[i]
				// type check
				typeCheck = typeFn(end)
				if (expected !== typeCheck) {throw zErrType + typeCheck}
				// clean up
				if ('exslt' == k) {
					if ('.000' !== end.slice(-4)) {isMatch = false}
					end = end.slice(0,20) + end.slice(-2)+ '0'
					end = (new Date(end))[Symbol.toPrimitive]('number')
				} else if ('instant' == k) {
					end = end.slice(0,-1) // remove trailing Z
					end = (new Date(end))[Symbol.toPrimitive]('number')
				} else if ('resource' == k) {
					end = Math.floor(end)
				}
				// truncate to 1 decimal place
				// diffs since start
				let totaldiff = ((end - start).toString().match(calc1)[0]) * 1
				aTotal.push(totaldiff)
				let diff = (totaldiff % 50).toFixed(2) * 1 // drop 50s
				setDiffs.add(diff)
				// incremental diffs: helps reduce drift
				totaldiff = ((end - startIncremental).toString().match(calc1)[0]) * 1
				diff = (totaldiff % 50).toFixed(2) * 1 // drop 50s
				setIncremental.add(diff)
				startIncremental = end // set this end value for the next incremental start value
			}


			// diff arrays
			let aDiffs = Array.from(setDiffs)
			let aIncremental = Array.from(setIncremental)
			sDetail[isScope][METRIC +'_data'][k]['diffs'] = aDiffs
			sDetail[isScope][METRIC +'_data'][k]['incremental'] = aIncremental

			// using incremental: test intervals
			if (aIncremental.length) {
				for (let i=0; i < aIncremental.length; i++) {
					if (isMatch && !aGood.includes(aIncremental[i])) {isMatch = false}
					if (is10 && !oGood.ten.includes(aIncremental[i])) {is10 = false}
					if (is100 && 0 !== aIncremental[i]) {is100 = false}
				}
			} else {
				// a single data entry means zero diffs/incremental == so we can never get isMatch
					// and is10/is100 can be false positives (we can ignore - seems rare)

				// don't assume 10 or 100 if only 1 sample size
				// ToDo: I do not like this: rare? and a false positive is ok when you look at the rest of the data
					// we could analayse and cleanup data afterwards
			}

			// some tests we can rely on non-integer
				// but others we measure enough to not all land on 0's (or 50's and 100s)
			let a100 = ['date','performance','contexttime','performancetime']
			if (a100.includes(k)) {if (is100 || is10) {isMatch = false}}
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
			let value =''
			if (isMatch && !isNoise && isGecko) {
				notation = silent_green
				value = 'RFP'
			} else {
				// add entropy e.g. jShelter 10ms or 100ms or noise
				// order is 100+, 100, 10, noise, nothing
				// isZero could be is100: sometimes we just don't get enough data
				// so it can be a little unstable with e.g. extension fuckery - that's OK
				if (isZero) {value = strZero
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
			//console.log(k, is10, is100, data, aTotal)
			//console.log(k, '\naDiffs', aDiffs, '\naIncremental', aIncremental)
		} catch(e) {
			oData[k] = ''
			if ('reducetimer' !== k) {
				if ('instant' == k) {
					// gecko 139+ we expect temporal to work
					if (!isGecko || isGecko && isVer < 139) {
						if ('ReferenceError: Temporal is not defined' == e || 'ReferenceError: Can\'t find variable: Temporal' == e) {e = zSKIP}
					}
				}
				str = (zD == e || zSKIP == e) ? e : log_error(17, METRIC +'_'+ k, e)
				oData[k] = (zD == e || zSKIP == e) ? e : zErr
				if (zSKIP !== e) {
					countFail++
					countErr++
				} else {
					notation = ''
				}
			}
		}
		//sDetail[isScope][METRIC][k] = data
		if ('timing_precision' == METRIC) {
			if ('reducetimer' !== k) {
				addDisplay(17, METRIC +'_'+ k, str,'', notation)
			}
		} else {
			addDisplay(17, METRIC +'_'+ k, str,'', notation)
		}
	})

	// display
	let btn = ''
	// data
	if ('timing_precision' == METRIC) {
		// we didn't countFail reducetimer or skipped Temporal so RFP will have zero fails

		let rtvalue // reducetimer: privacy.reduceTimerPrecision
		notation = silent_green
		let isProtected = (aLoop.length - countFail) == aLoop.length

		// currenttime: handle a single data entry
		if (1 == countFail && oData.currenttime == strZero) {
			rtvalue = zNA
			// with RFP is always oGood
			try {
				let singledata = (gData.timing.currenttime[0].toString().match(calc1)[0]) * 1
				let singletest = (singledata % 50).toFixed(2) * 1
				if (oGood.other.includes(singletest)) {
					oData.currenttime = 'RFP'
					addDisplay(17, METRIC +'_currenttime', singledata,'', notation)
					countFail = countFail - 1
					isProtected = (aLoop.length - countFail) == aLoop.length // recalc
				}
			} catch(e) {}
		}

		// if _some_ RFP timing fails (i.e isProtected !== aLoop.length), then rtvalue
			// can end up false when it isn't really - because we have decimals but cannot
			// know for sure it's RFP (not worth checking everything non-error for 60FPS)
			// but what we can do is exclude all errors
		isProtected = (aLoop.length - countFail) + countErr == aLoop.length
		//console.log(aLoop.length - countFail, countErr, aLoop.length, isProtected)
		if (isProtected && isDecimal || !isGecko) {
			// non-Gecko || if RFP which is also isDecimal, then we can't tell
			rtvalue = zNA
			// RFP with decimals looks silly
			if (isGecko) {isDecimal = false}
		} else {
			rtvalue = !isDecimal
			if (isDecimal) {countFail++; notation = silent_red}
		}
		// reducetimer data/display
		addDisplay(17, METRIC +'_reducetimer', rtvalue,'', notation)
		oData['reducetimer'] = rtvalue

		// recalc
		isProtected = (aLoop.length - countFail) == aLoop.length
		notation = isProtected ? rfp_green : rfp_red
		str = (aLoop.length - countFail) +'/' + aLoop.length
		// add
		btn = addButton(17, METRIC, str) + addButton(17, METRIC +'_data', 'data')
		addBoth(17, METRIC, mini(oData), btn, notation, oData)
		// cleanup
		//performance.clearMeasures()

	} else {
		notation = (aLoop.length - countFail) == aLoop.length ? rfp_green : rfp_red
		str = (aLoop.length - countFail) +'/' + aLoop.length
		btn = addButton(17, METRIC, str) + addButton(17, METRIC +'_data', 'data')
		sDetail[isScope][METRIC] = oData
		addDisplay(17, METRIC, mini(oData), btn, notation)
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
	if (!isGecko) {addBoth(18, METRIC, zNA); return}

	// 960392: dom.use_components_shim
	let hash, btn ='', data, notation = isBB ? bb_red: ''
	try {
		data = Object.keys(Object.getOwnPropertyDescriptors(Components.interfaces))
		hash = mini(data); btn = addButton(18, METRIC, data.length)
	} catch(e) {
		if (e+'' == 'ReferenceError: Components is not defined') {
			if (isBB) {notation = bb_green}
			hash = 'undefined'
		} else {
			hash = e; data = zErrLog
		}
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
	let hash, btn='', aNav = [], notation = isBBESR ? bb_red : '', isLies = false
	try {
		if (runST) {foo++}
		// navigator
		for (const key in navigator) {aNav.push(key)}
		let typeCheck = typeFn(aNav)
		if ('array' !== typeCheck) {throw zErrType + typeCheck}

		if (isSmart) {
			// navigator.prototype: should match navigator
			let aProto = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
			let typeCheck = typeFn(aProto)
			if ('array' !== typeCheck) {throw zErrType + typeCheck}
			// ToDo: check/expand these
			let expected = [
				'appCodeName','appName','appVersion','buildID','oscpu','platform','product','productSub','userAgent','cookieEnabled',
				'vendor','vendorSub','hardwareConcurrency','language','languages','mimeTypes','onLine','plugins','webdriver',
				'taintEnabled','javaEnabled','doNotTrack','cookieEnabled','pdfViewerEnabled','requestMediaKeySystemAccess',
				'locks', // 1851539
				'userActivation', // 1791079
				// ToDo: FF144+? 1983296 functionality pref deprecated
				//'globalPrivacyControl', // 1983296
			]
			// test
			if (runSL) {
				expected = ['a','b','javaEnabled']
				aNav = ['a','javaEnabled','c','d','f','g'] // pre a, missing b, a+d not-in-proto
				aProto = ['javaEnabled','b','c','e','constructor','f','g'] // missing a, post f+g, e not in nav
			}
			// compare hashes
			let navhash = mini(aNav.concat('constructor')), protohash = mini(aProto) // do I need this
			// tampering: don't dedupe, just collect
			let missing = {}, post = [], pre = [], diffs = {}, oTampered = {}
			// aProto: post constructor
			let position = aProto.indexOf('constructor')
			post = aProto.slice(position +1)
			// aNav: pre javaEnabled
			position = aNav.indexOf('javaEnabled')
			if (position > 0) {
				pre = aNav.slice(0, position)
				if (isVer < 129) {pre = pre.filter(x => !['vibrate'].includes(x))} // ignore vibrate in 128 or lower
			}
			// missing
			let missingNav = expected.filter(x => !aNav.includes(x))
			let missingProto = expected.filter(x => !aProto.includes(x))
			if (missingNav.length) {missing['navigator'] = missingNav.sort()}
			if (missingProto.length) {missing['prototype'] = missingProto.sort()}
			// diffs
			// in prototype but not in nav
			let notNav = aProto.filter(x => !aNav.includes(x))
			notNav = notNav.filter(x => !['constructor'].includes(x)) // ignore constructor
			if (notNav.length) {diffs['not_in_navigator'] = notNav.sort()}
			// in nav but not in prototype
			let notProto = aNav.filter(x => !aProto.includes(x))
			if (notProto.length) {diffs['not_in_prototype'] = notProto.sort()}
			// 
			isLies = (post.length + pre.length + Object.keys(missing).length + Object.keys(diffs).length) > 0
			if (isLies) {
				if (Object.keys(missing).length) {oTampered['missing_expected'] = missing}
				if (post.length) {oTampered['post_constructor'] = post.sort()}
				if (pre.length) {oTampered['pre_javaEnabled'] = pre.sort()}
				if (Object.keys(diffs).length) {oTampered['prototype_vs_navigator'] = diffs}
				addDetail(METRIC +'_tampered', oTampered)
			}
		}
		// always return aNav
		hash = mini(aNav); btn = addButton(18, METRIC, aNav.length)
		// health: BB only if ESR
		if (isBBESR) {
			if (isMB) { // MB
				if ('a389214b' == hash) {notation = bb_green} // MB15 41
			} else { // TB
				if ('8d3dd2a1' == hash) {notation = bb_green} // TB15
			}
		}
		// if tampered use notation to fail health
		if (isLies) {notation += addButton('bad', METRIC +'_tampered', "<span class='health'>"+ cross + '</span> tampered')}
	} catch(e) {
		hash = e; aNav = zErrLog
	}
	addBoth(18, METRIC, hash, btn, notation, aNav, isLies)
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
			} catch {}
		}
		if ('91073152' == hash) {notation = default_green}
		addBoth(18, METRIC, hash, addButton(18, METRIC), notation, data, isLies)
		return
	})
}

const get_speech_engines = (METRIC) => new Promise(resolve => {
	// media.webspeech.synth.enabled
	let t0 = nowFn(), notation = rfp_red, isLies = false
	function exit(display, value) {
		addBoth(18, METRIC, display,'', notation, value, isLies)
		return resolve()
	}

	function populateVoiceList() {
		let res = [], ignoreLen, ignoreStr
		/* examples
			moz-tts:android:hr_HR
			urn:moz-tts:sapi:Microsoft David - English (United States)?en-US
			urn:moz-tts:osx:com.apple.eloquence.en-US.Eddy
		*/
		let aStrip = [
			'moz-tts:android:', // android
			'urn:moz-tts:osx:com.apple.eloquence.', // mac
			'urn:moz-tts:sapi:', // windows
		]
		try {
			let v = speechSynthesis.getVoices()
			if (runST) {v = null} else if (runSI) {v = [{}]} else if (runSL) {addProxyLie('speechSynthesis.getVoices')}
			let typeCheck = typeFn(v, true)
			if ('array' !== typeCheck) {throw zErrType + typeFn(v)}
			if (v.length) {
				let expected = '[object SpeechSynthesisVoice]'
				if ((v +'').slice(0,29) !== '[object SpeechSynthesisVoice]') {throw zErrInvalid +'expected '+ expected}
			}
			if (v.length == 0) {
				notation = rfp_green
				exit('none','none')
			} else {
				// enumerate: reduce redundancy/noise
					// only record default if true and localService if false | ignore voiceURI if it matches expected
				v.forEach(function(i) {
					let uriStr = i.voiceURI, skipURI = false
					// replace useless strings
					aStrip.forEach(function(str){uriStr = uriStr.replace(str, '')})
					uriStr.trim()
					if (isGecko) {
						skipURI = (uriStr = i.name +'?'+ i.lang) // windows
					} else {
						// blink
						skipURI = (uriStr == i.name) // dedupe repetitive crap
					}
					res.push(
						i.name +' | '+ i.lang + (i['default'] ? ' | default' : '') + (i.localService ? '' : ' | false') + (skipURI ? '' : ' | '+ uriStr)
					)
				})
				let hash = mini(res)
				addBoth(18, METRIC, hash, addButton(18, METRIC, res.length), notation, res, isProxyLie('speechSynthesis.getVoices'))
				log_perf(18, METRIC, t0)
				return resolve()
			}
		} catch(e) {
			exit(e, zErrLog)
		}
	}
	try {
		populateVoiceList()
		if (speechSynthesis.onvoiceschanged !== undefined) {
			speechSynthesis.onvoiceschanged = populateVoiceList;
		}
	} catch(e) {
		exit(e, zErrLog)
	}
})

function get_svg(METRIC) {
	let hash, data ='', target = dom.tzpSVG
	try {
		if (runSE) {foo++}
		target.innerHTML =''
		const svgns = 'http://www.w3.org/2000/svg'
		let shape = document.createElementNS(svgns,'svg')
		let rect = document.createElementNS(svgns,'rect')
		rect.setAttribute('width',20)
		rect.setAttribute('height',20)
		shape.appendChild(rect)
		target.appendChild(shape)
		hash = target.offsetHeight > 0 ? zE : zD
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(18, METRIC, hash,'','', data)
	return
}

function get_window_prop(METRIC) {
	// BB: display only: wasm
	let str, notation = isBB ? bb_slider_red : ''
	try {
		str = window.WebAssembly
		if (runST) {str = null}
		let typeCheck = typeFn(str)
		if ('undefined' !== typeCheck && 'object' !== typeCheck) {throw zErrType + typeCheck}
		str = ('object' === typeCheck) ? zE : zD
		if (isBB) {notation = str == zE ? bb_standard : bb_safer}
	} catch(e) {
		str = log_error(18, METRIC, e)
	}
	addDisplay(18, METRIC, str,'', notation)
	return
}

function get_webdriver(METRIC) {
	// expected FF60+
	let value, data =''
	try {
		value = navigator[METRIC]
		if (runST) {value = null}
		let typeCheck = typeFn(value)
		if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
	} catch(e) {
		value = e; data = zErrLog
	}
	addBoth(18, METRIC, value,'','', data, isProxyLie('Navigator.'+ METRIC))
	return
}

function get_window_props(METRIC) {
	/* https://github.com/abrahamjuliot/creepjs */
	let t0 = nowFn(), iframe
	let hash, btn='', data, dataSorted, notation = isBBESR ? bb_red : '', isLies = false
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
		dataSorted = Object.getOwnPropertyNames(contentWindow)

		let tamperBtn = '', aTampered, indexPerf, indexEvent
		if (isGecko) {
			if (isSmart) {
				/* safer closed: Performance ... more items then Event
				standard closed: Performance + no Event...
				BB/FF/ALL open: Performance then Event...
				*/
				// tampered: filter items for console open etc
				indexPerf = data.indexOf('Performance')
				indexEvent = data.indexOf('Event')
				if (runSL) {data.push('fake')}
				aTampered = data.slice(data.indexOf('Performance')+1)
				aTampered = aTampered.filter(x => !['Event','Location'].includes(x))
				if (aTampered.length) {
					addDetail(METRIC +'_tampered', aTampered.sort())
					tamperBtn = addButton(18, METRIC +'_tampered', aTampered.length + ' tampered')
				}
			}
			// all the properties that can be tampered with by NS
				// safer (no webgl-clicktoplay): 24 items
			let aPossible = [
				'Blob','Element','HTMLCanvasElement','HTMLElement','HTMLFrameElement','HTMLIFrameElement',
				'HTMLObjectElement','MediaSource','OffscreenCanvas','Promise','Proxy','SharedWorker',
				'String','URL','Worker','XMLHttpRequest','XMLHttpRequestEventTarget','decodeURI',
				'decodeURIComponent','encodeURI','encodeURIComponent','escape','unescape','webkitURL',
				'Error',
				// other
				'Audio','HTMLAudioElement','HTMLImageElement','HTMLMediaElement','Image','WebAssembly'
			]
			let aHas = aPossible.filter(x => data.includes(x))
			aHas = dedupeArray(aHas)
			aHas.sort()
			// always move all these to the end
				// this gives us a much more stable hash with and without NS tampering, but also allows false positives
			data = data.filter(x => !aHas.includes(x))
			data = data.concat(aHas)

			if (isSmart) {
				// now we check tampered items not in possible
				if (aTampered.length) {
					let aTamperedNotInPossible = aTampered.filter(x => !aPossible.includes(x))
					if (aTamperedNotInPossible.length) {
						isLies = true
						console.log(mini(aTamperedNotInPossible), aTamperedNotInPossible)
					}
				}
				// notate console
				if (!isLies && isDesktop && isOS !== undefined) {
					let strConsole = ' [devtools ' + (indexPerf + 1 == indexEvent ? 'open' : 'closed') +']'
					addDisplay(18, 'consolestatus', strConsole)
				}
			}

			// move expected Performance, Event, Location to the end
				// these affect the order if console open and various tabs selected
			let aCheck = ['Location','Performance','Event']
			let aItems = data.filter(x => aCheck.includes(x))
			aItems.sort() // because an open console can change the order
			data = data.filter(x => !aItems.includes(x))
			data = data.concat(aItems)
		} else {
			data.sort()
		}
		hash = mini(data); btn = addButton(18, METRIC, data.length)
		if (isGecko) {
			btn += addButton(18, METRIC +'_sorted', 'sorted')
			sDetail.document[METRIC +'_sorted'] = dataSorted.sort()
		}
		btn += tamperBtn
		// health: BB only if ESR
		if (isBBESR) {
			// hashes are: standard (has WebAssembly) | safer (should be identical w/ and w/o webgl clicktoplay)
			// funfact: 1419501 (backported from FF144) radically altered the order of items in the unordered list
			let oHashes = {
				MB : {
					'linux': ['b4fd3924','34f246c6'], // 860, 859
					'mac': ['a668f9dd','2436cf3f'], // 857, 856
					'windows': ['b4fd3924','34f246c6'] // 860, 859
				},
				TB : {
					'linux': ['4cf37ce5','32dfc047'], // 837, 836
					'mac': ['6fa6983a','2092245c'], // 834, 833
					'windows': ['4cf37ce5','32dfc047'] // 837, 836
				},
			}
			let key = isTB ? 'TB' : 'MB'
			if (undefined !== oHashes[key][isOS]) {
				if (oHashes[key][isOS].includes(hash)) {notation = bb_green}
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

	let notation = '', value = zNA
	if (isGecko) {
		// 1259822: FF74+ | 1965165: javascript.options.property_error_message_fix FF140+ default enabled
		try {null.bar} catch(e) {
			if (isBB) {
				notation = (e+'' == 'TypeError: can\'t access property "bar" of null' ? bb_green : bb_red)
			}
			value = e.message
		}
	}
	addBoth(18, 'error_message_fix', value,'', notation)

	Promise.all([
		get_svg('svg_enabled'),
		get_math('math_trig', isMathLies),
		get_math('math_other', isMathLies),
		get_component_shims('component_interfaces'),
		get_window_prop('wasm'),
		get_window_props('window_properties'),
		get_navigator_keys('navigator_keys'),
		get_webdriver('webdriver'),
		get_pdf('pdf'),
		get_speech_engines('speech_engines'),
	]).then(function(){
		return resolve()
	})
})

countJS(18)
