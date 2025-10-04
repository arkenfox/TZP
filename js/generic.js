'use strict';
dom = getUniqueElements()

function getUniqueElements() {
	const dom = document.getElementsByTagName('*')
	return new Proxy(dom, {
		get: function(obj, prop) {return obj[prop]},
		set: function(obj, prop, val) {obj[prop].textContent = `${val}`; return true}
	})
}

/*** GENERIC ***/

function measureFn(target, metric) {
	let range, method, type = isDomRect
	//type = 2 // test
	try {
		if (runSE) {foo++}
		if (type > 1) {range = document.createRange(); range.selectNode(target)}
		if (type < 1) {method = target.getBoundingClientRect() // get a result regardless
		} else if (type == 1) {method = target.getClientRects()[0]
		} else if (type == 2) {method = range.getBoundingClientRect()
		} else if (type > 2) {method = range.getClientRects()[0]
		}
		return method
	} catch(e) {
		return {'error': true, 'errorstring': e+''}
	}
}

const newFn = x => typeof x != 'string' ? x : new Function(x)()
function nowFn() {if (isPerf) {return performance.now()}; return}
function rnd_string() {return Math.random().toString(36).substring(2, 15)}
function rnd_number() {return Math.floor((Math.random() * (99999-10000))+10000)}
function removeElementFn(id) {try {dom[id].remove()} catch {}}
function addProxyLie(value) {sData[SECT99].push(value)}
function isProxyLie(value) {return sData[SECT99].includes(value)}
function smartFn(type) {
	// reset
	isFile = 'file:' == location.protocol
	isSmartDataMode = false
	isSmart = false
	// calculate
	if (isGecko && isVer >= isSmartMin) {
		if ('early' == type) {
			// we do not know isBB yet
			if (isSmartAllowed) {isSmart = true}
		} else {
			// block TB15 for now, too much noise
			if (isSmartAllowed || !isTB) {isSmart = true}
		}
		//console.log(type, isSmart)
		isSmartDataMode = !isSmart // isSmartDataMode must be the opposite
		if ('final' == type && isSmartDataMode) {run_basic('data-only')}
	}
}

function typeFn(item, isSimple = false) {
	// return a more detailed result
	let type = typeof item
	if ('string' === type) {
		if (!isSimple) {
			if ('' === item) {type = 'empty string'} else if ('' === item.trim()) {type = 'whitespace'}
		}
	} else if ('number' === type) {
		if (Number.isNaN(item)) {type = 'NaN'} else if (Infinity === item) {type = 'Infinity'}
	} else if ('object' === type) {
		if (Array.isArray(item)) {
			type = 'array'
			if (!isSimple && !item.length) {type = 'empty array'}
		} else if (null === item) {type = 'null'
		} else {
			if (!isSimple) {
				try {if (0 === Object.keys(item).length) {type = 'empty object'}} catch {}
			}
		}
	}
	// do nothing: undefined, bigint, boolean, function
	return type +'' // make sure we return a string
}

function testtypeFn(isSimple = false) {
	let bigint = 9007199254740991
	try {bigint = BigInt(9007199254740991)} catch(e) {}
	let data = ['a','','  ', 1, 1.2, Infinity, NaN, [], [1], {}, {a: 1}, null,
		true, false, bigint, undefined, function foobar() {},]
	data.forEach(function(item) {
		let type = typeFn(item, isSimple)
		console.log(typeof type, item, type)
	})
}

function dedupeArray(array, toString = false) {
	array = array.filter(function(item, position) {return array.indexOf(item) === position})
	if (toString) {return array.join(', ')}
	return array
}

function run_block(trace) {
	console.log(trace, 'blocking')
	log_perf(SECTG, 'isBlock','')
	try {
		dom.tzpContent.style.display = 'none'
		dom.blockmsg.style.display = 'block'
		let msg = 'TZP requires gecko '+ isBlockMin +'+'
		if ('iframe' == trace) {
			msg = 'i\'m in an iframe'
		} else if ('insecure' == trace) {
			msg = 'i\'m in an insecure context'
		} else if (isAllowNonGecko) {
			if (undefined !== isEngine) {
				msg = 'update your '+ isEngine +' browser'
			} else if (!isGecko) {
				msg = 'TZP requires gecko '+ (isEngineStr.includes(' or ') ? ', ' : ' or ') + isEngineStr
			}
		}
		dom.blockmsg.innerHTML = "<center><br><span style='font-size: 14px;'><b>"+ (isGecko ? 'Gah.' : 'Aw, Snap!')
			+"<br><br>" + msg +'<b></span></center>'
	} catch(e) {}
}

function run_basic(str = 'basic') {
	// basic mode: colors: gecko only, let other engines have some color
	if (isGecko && 'basic' == str) {
		log_perf(SECTG, 'isBasic','')
		for (let i=1; i < 19; i++) {
			document.body.style.setProperty('--test'+i, '#d4c1b3')
			document.body.style.setProperty('--bg'+i, '#808080')
		}
		document.body.style.setProperty('--testbad', '#d4c1b3')
	}
	// basic/other modes: notation
	if (str.length) {
		if ('undefined' == isEngine) {str = 'experimental'} else {str += ' mode'}
		let items = document.getElementsByClassName('nav-down')
		for (let i=0; i < items.length; i++) {
			// find '<a href' to end, prepend span
			// e.g. '<a href="#uad">▼</a>' -> '<span class="perf">notation</span><a href="#uad">▼</a>'
			let link = items[i].innerHTML
			link = link.slice(link.indexOf('<a href'), link.length)
			items[i].innerHTML = "<span class='perf'>"+ str +'</span> '+ link
		}
	}
}

function getElementProp(sect, id, name, pseudo = ':after') {
	// default none: https://www.w3.org/TR/CSS21/generate.html#content
	//console.log(sect, id, pseudo)
	try {
		let item = window.getComputedStyle(document.querySelector(id), pseudo).content
		// if supported but css blocked we get 'none' but if not supported (e.g. servo during development) we get ''
			// we want the FP css metrics to reflect what the css actually says, so match the defaults
		if ('undefined' == isEngine && '' == item) {
			// out of range: screen, inner, dpi: default is '' but we return '?'
			if ('#S' == id || '#D' == id || '#P' == id) {return '?'}
			// deviceposture, orientations, aspect ratios, display-mode
			let aUndefined = ['#cssDP','#cssOm','#cssDAR','#cssO','#cssAR','#cssDM']
			if (aUndefined.includes(id)) {return 'undefined'}
			// everything else
			return zNA
		}

		if (runSI && !runSL) {item = 'none'} // don't error if runSL
		let typeCheck = typeFn(item, true)
		if ('string' !== typeCheck) {throw zErrType + typeCheck}
		item = item.replace(/"/g,'') // trim quote marks
		// screen(S) + window(D) + dpi(P:before) return none or ? when out of range
		if ('#S' == id || '#D' == id || '#P' == id) {
			if (':after' == pseudo && ' x ' == item.slice(0,3)) {item = item.slice(3)} // S/D remove leading ' x '
			if ('none' == item || '' == item) {item = '?'} // return consistent ? for out of range/blocked
		} else if ('#cssVS' == id) {
			if (':after' == pseudo && ' x ' == item.slice(0,3)) {item = item.slice(3)} // remove leading ' x '
		}
		// everything else should have a value: so "none" means css was blocked
		if ('none' == item) {throw zErrInvalid +"got 'none'"}
		// our css rules use "none " (trailing space) so we can detect when the css blocked
			// trim it for our return to compare to matchMedia
		if ('none ' == item) {item = 'none'} 
		// return numbers
		if ('string' === typeCheck && !Number.isNaN(item * 1)) {item = item * 1}
		return item
	} catch(e) {
		log_error(sect, name, e)
		return zErr
	}
}

function mini(str) {
	// https://stackoverflow.com/a/22429679
	const json = `${JSON.stringify(str)}`
	let len = json.length, hash = 0x811c9dc5
	for (let i=0; i < len; i++) {
		hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
	}
	return ('0000000' + (hash >>> 0).toString(16)).slice(-8)
}

const promiseRaceFulfilled = async ({
	promise,
	responseType, // promise response type
	limit = 1000 // default ms to fulfill
}) => {
	// set up promise race
	const slowPromise = new Promise(resolve => setTimeout(resolve, limit))
	// await promise race status
	const response = await Promise.race([slowPromise, promise]) // fastest will win 
		.then(response => response instanceof responseType ? response : 'pending')
		.catch(error => 'rejected')
	return (
		response == 'rejected' || response == 'pending' ? undefined : response
	)
}

/*** GLOBAL ONCE ***/

function get_isArch(METRIC) {
	// chrome limits ArrayBuffer to 2145386496: https://issues.chromium.org/issues/40055619
	if ('blink' == isEngine) {return}
	let t0 = nowFn(), value
	try {
		if (runSG) {foo++}
		let test = new ArrayBuffer(Math.pow(2,32)) // 4294967296
		value = 64
	} catch(e) {
		isArch = log_error(3, 'browser_architecture', e, isScope, true) // persist sect3
		value = zErr
	}
	log_perf(SECTG, METRIC, t0,'', value)
}

function get_isAutoplay(METRIC) {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getAutoplayPolicy
	// get non-user-gesture values once
	let t0 = nowFn()
	try {
		if ('undefined' == typeof navigator.getAutoplayPolicy) {
			isAutoPlay = 'undefined'
		} else {
			let aTest, mTest
			let aPolicy = navigator.getAutoplayPolicy('audiocontext')
			try {
				if (runSG) {foo++}
				aTest = navigator.getAutoplayPolicy(dom.tzpAudio)
			} catch(e) {
				log_error(13, METRIC +'_audio', e, isScope, true) // persist sect13
				aTest = zErr
			}
			let mPolicy = navigator.getAutoplayPolicy('mediaelement')
			try {
				if (runSG) {bar++}
				mTest = navigator.getAutoplayPolicy(dom.tzpVideo)
			} catch(e) {
				log_error(13, METRIC +'_media', e, isScope, true) // persist sect13
				mTest = zErr
			}
			// combine
			isAutoPlay = (aPolicy === aTest ? aPolicy : aPolicy +', '+ aTest) +' | '+ (mPolicy === mTest ? mPolicy : mPolicy +', '+ mTest)
		}
	} catch(e) {
		isAutoPlay = zErr
		isAutoPlayError = log_error(13, METRIC, e, isScope, true) // persist sect13
	}
	log_perf(SECTG, 'isAutoPlay', t0,'', (isAutoPlay == zErr ? zErr : ''))
	return
}

function get_isDevices() {
	isDevices = undefined
	let t0 = nowFn()
	try {
		if (undefined !== navigator.mediaDevices) {return}
		if (runSG) {foo++}
		navigator.mediaDevices.enumerateDevices().then(function(devices) {
			isDevices = devices
			if (gLoad) {log_perf(SECTG, 'isDevices', t0,'', nowFn())}
		}
	)} catch(e) {}
}

function get_isEngine(METRIC) {
	if (isGecko) {return}
	let t0 = nowFn()
	try {
		let oEngines = {
			blink: [
				'number' === typeof TEMPORARY,
				'number' === typeof PERSISTENT,
				'object' === typeof onappinstalled,
				'object' === typeof onbeforeinstallprompt,
				'object' === typeof trustedTypes,
				'function' === typeof webkitResolveLocalFileSystemURL,
			],
			webkit: [
				'object' === typeof browser,
				'object' === typeof safari,
				'function' === typeof webkitConvertPointFromNodeToPage,
				'function' === typeof webkitCancelRequestAnimationFrame,
				'object' === typeof webkitIndexedDB,
			],
			/* ignore edgeHTML
			edgeHTML: [
				'function' === typeof clearImmediate,
				'function' === typeof msWriteProfilerMark,
				'object' === typeof oncompassneedscalibration,
				'object' === typeof onmsgesturechange,
				'object' === typeof onmsinertiastart,
				'object' === typeof onreadystatechange,
				'function' === typeof setImmediate,
			]
			//*/
		}
		// array engine matches, so subsequent results doesn't override prev
		let aEngine = [], aAllowed = []
		for (const engine of Object.keys(oEngines).sort()) {
			aAllowed.push(engine)
			let sumE = oEngines[engine].reduce((prev, current) => prev + current, 0)
			if (sumE > (oEngines[engine].length/2)) {aEngine.push(engine)}
		}
		aAllowed.sort()
		isEngineStr = aAllowed.join(', ')
		if (aAllowed.length > 1) {
			isEngineStr = ' or '+ aAllowed[aAllowed.length - 1]
			aAllowed = aAllowed.slice(0,-1)
			isEngineStr = aAllowed.join(',') + isEngineStr
		}
		if (aEngine.length == 1) {isEngine = aEngine[0]} // valid one result
		// set minimum
		if (undefined !== isEngine) {
			// approved engine detected, if not enforcing min, disable block
			isEngineBlocked = isAllowNonGeckoMin
			// if enforcing min, check
			if (isAllowNonGeckoMin) {
				try {
					if ('blink' == isEngine) {
						// 109 is the last version supported on win7
						if ('function' == typeof(Map.groupBy)) {isEngineBlocked = false} // 117 2023-Sept
						//if ('function' == typeof(Document.parseHTMLUnsafe)) {isEngineBlocked = false} // 124 2024-Apr
						//if ('function' !== typeof(Intl.DurationFormat)) {isEngineBlocked = false} // 129 2024-Sep
					} else if ('webkit' == isEngine) {
						// https://en.wikipedia.org/wiki/Safari_(web_browser)#Version_compatibility
						// 15.6.1 2022-Aug = last version supported on macOS 10.15?
						if ('function' == typeof(Intl.DurationFormat)) {isEngineBlocked = false} // 16.4 2023-Mar
						//if ('function' == typeof(Map.groupBy)) {isEngineBlocked = false} // 17.4 2024-Mar
					}
				} catch(e) {}
			}
		} else if (isAllowNonGeckoUndefined) {
			isEngine = 'undefined' // a string vs undefined typeof
			isEngineBlocked = false
		}
	} catch(e) {}
	log_perf(SECTG, METRIC, t0,'', isEngine)
}

const get_isFileSystem = (METRIC, isWarmup = false) => new Promise(resolve => {
	// meta: 1748667
	// note: pref change (dom.fs.enabled) requires new reload: so we can run once
	let t0 = nowFn()
	function exit(value) {
		if (!isWarmup) {
			isFileSystem = value
			log_perf(SECTG, METRIC, t0,'', value)
		}
		return resolve()
	}
	if (navigator.storage == undefined || 'function' !== typeof navigator.storage.getDirectory) {
		exit(zD)
	}
	Promise.all([
		navigator.storage.getDirectory()
	]).then(function(){
		exit(zE)
	})
	.catch(function(e){
		isFileSystemError = e+''
		exit(zErr)
	})
})

const get_isFontDelay = () => new Promise(resolve => {
	if (!isBB || !isGecko || isVer < 139) {return resolve()}
	if ('windows' !== isOS && 'mac' !== isOS) {return resolve()}

	// BB: font.vis + bundled fonts
		// very slow to async fallback | on linux the bundled fonts IS the system font dir and is not affected
		// not the case when using font.system.whitelist | we should see if we can get this fixed upstream
	// currently only nightly uses font.vis but could change at any time and is not version specific
		// detect if we need a delay by testing if fontface is working

	isFontDelay = true // BB default delay in case of errors/fuckery
	Promise.all([
		get_fonts_faces('', ['Arial','Courier','Times New Roman']), // all are allowed + expected in windows/mac
	]).then(function(res){
		// either 'error', 'none' or an array of detected fonts
		//console.log(res[0])
		if ('none' == res[0]) {isFontDelay = false} // only remove delay if 'none': errors/detected-fonts = force a delay
		return resolve()
	})
})

function get_isGecko(METRIC) {
	let t0 = nowFn(), value
	try {
		let list = [
			[DataTransfer, 'DataTransfer', 'mozSourceNode'],
			[Document, 'Document', 'mozFullScreen'],
			[HTMLCanvasElement, 'HTMLCanvasElement', 'mozPrintCallback'],
			[HTMLElement, 'HTMLElement', 'onmozfullscreenerror'],
			[HTMLVideoElement, 'HTMLVideoElement', 'mozDecodedFrames'],
			[IDBIndex, 'IDBIndex', 'mozGetAllKeys'],
			[IDBObjectStore, 'IDBObjectStore', 'mozGetAll'],
			[Screen, 'Screen', 'mozOrientation'],
			[SVGElement, 'SVGElement', 'onmozfullscreenchange'] 
		]
		let obj, prop, aNo = []
		list.forEach(function(array) {
			obj = array[0]
			prop = array[2]
			if ('function' === typeof obj
				&& ('object' === typeof Object.getOwnPropertyDescriptor(obj.prototype, prop))) {
			} else {
				aNo.push(array[1])
			}
		})
		let found = (list.length - aNo.length)
		if (found > 5) {
			isGecko = true
			// alert if any gecko checks fail
			if (aNo.length) {log_alert(SECTG, METRIC, aNo.join(', '), isScope, true)}
		}
		value = isGecko +' | '+ found +'/'+ list.length
	} catch(e) {
		value = zErr
	}
	log_perf(SECTG, METRIC, t0,'', value)
	return
}

const get_isOS = (METRIC) => new Promise(resolve => {
	let t0 = nowFn()
	if (!isGecko) {
		// get svh and lvh: if they differ then you have a dynamic urlbar
		// this is fast - could we leverage it for gecko as well
			// maybe not since isBB might restrict it for FPing dynamic urlbar
			// also apps may allow disabling it
			// also maybe apps will enable it on other devices/tablets/platforms
			// or extensions might tamper with it
		// so for now just record the info for non-gecko
		let aList = ['L','S']
		try {
			let data = {}
			aList.forEach(function(k) {data[k] = dom['tzp'+ k +'V'].offsetHeight})
			/*
			let diff = Math.abs(data['L'] - data['S'])
			if (diff > 20) { // allow some wriggle room
				if ('blink' == isEngine) {isOS = 'android'}
			}
			//*/
			log_perf(SECTG, METRIC, t0, '', 'L: '+ data['L'] +' | S: '+ data['S'])
		} catch(e) {}
		return resolve()
	}

	function exit(value) {
		isOS = value
		isDesktop = 'android' !== isOS
		dom.tzpResource.style.backgroundImage = "url('chrome://branding/content/"
			+ (isDesktop ? '' : 'fav') + "icon64.png')" // set icon
		log_perf(SECTG, METRIC, t0, '', isOS +'')
		if (undefined == isOS) {
			isOSErr = log_error(3, "os", zErrType +'undefined', isScope, true) // persist sect3
			log_alert(SECTG, METRIC, "undefined", isScope, true)
		}
		return resolve()
	}

	function trysomethingelse() {
		// now what?
		exit()
	}

	// 2: fonts
	function tryfonts() {
		// check doc fonts
		let fntEnabled = false
		try {
			if (runSG) {foo++}
			let fntTest = '\"test font name\"'
			//dom.tzpDocFont.style.fontFamily = fntTest
			let font = getComputedStyle(dom.tzpDocFont).getPropertyValue('font-family'),
				fontnoquotes = font.slice(0, fntTest.length - 2) // ext may strip quotes marks
			fntEnabled = (font == fntTest || fontnoquotes == fntTest ? true : false)
		} catch {}
		if (!fntEnabled) {trysomethingelse(); return}

		// check fonts
		get_fonts_size(false).then(res => {
			if ('object' == typeFn(res, true)) {
				let aDetected = []
				for (const k of Object.keys(res)) {aDetected.push(k)}
				let found = aDetected[0]
				if (aDetected.length == 1) {
					if (found == 'MS Shell Dlg \\32') {exit('windows')
					} else if (found == '-apple-system') {exit('mac')
					} else if (found == 'Dancing Script') { exit('android')
					} else {
						trysomethingelse()
					}
					//console.log('isOS font check', found, isOS)
				} else if (isGecko && aDetected.length == 0) {
					exit('linux')
				} else {
					trysomethingelse()
				}
			} else {
				trysomethingelse()
			}
		})
	}

	// widget font: mac/linux
	try {
		if (runSG) {foo++}
		let aIgnore = [
			'cursive','emoji','fangsong','fantasy','math','monospace','none','sans-serif',
			'serif','system-ui','ui-monospace','ui-rounded','ui-serif','undefined'
		]
		let font = getComputedStyle(dom.tzpbutton).getPropertyValue('font-family')
		if ('string' !== typeFn(font) || aIgnore.includes(font)) {
			throw zErr
		} else {
			if (isGecko) {
				// button
				if (font.slice(0,12) == "MS Shell Dlg") {exit('windows')
				} else if (font == '-apple-system') {exit('mac')
				} else {throw zErr}
			} else {
			// mac webkit
				// search and select return -apple-system
				// mozfonts (e.g. mozbutton) return webkit-standard
				// status-bar returns -apple-status-bar
				// menu returns -apple-menu
				tryfonts()
			}
		}
	} catch {
		tryfonts()
	}
})

const get_isRecursion = () => new Promise(resolve => {
	// 2nd test is more accurate/stable
	const METRIC = "isRecursion"
	let t0 = nowFn()
	let level = 0
	function recurse() {level++; recurse()}
	try {recurse()} catch {}
	level = 0
	try {
		recurse()
	} catch(e) {
		let stacklen = e.stack.toString().length
		// display value
		isRecursion = [level +" [stack length: "+ stacklen +']']
		log_perf(SECTG, METRIC, t0, "", isRecursion.join())
		// metric values: only collect level
			// https://github.com/arkenfox/user.js/issues/1789: round down: level to 1000's
		isRecursion.push(Math.floor(level/1000))
		return resolve()
	}
})

const get_isSystemFont = () => new Promise(resolve => {
	//if (!isGecko) {return resolve()}
	let t0 = nowFn()
	function exit(value) {
		log_perf(SECTG, 'isSystemFont', t0,'', value)
		return resolve()
	}
	let aMoz = [
		// -moz seem to always be the same
		'-moz-bullet-font','-moz-button','-moz-button-group','-moz-desktop','-moz-dialog','-moz-document',
		'-moz-field','-moz-info','-moz-list','-moz-message-bar','-moz-pull-down-menu','-moz-window','-moz-workspace',
	]
	let aNonMoz = [
		// in gecko non -moz seem to always be the same: mac might differ  I seem to recall this
			// in the past - anyway we grab the first of each e.g. caption + menu differ in blink (windows)
		'caption','icon','menu','message-box','small-caption','status-bar',
	]
	// first aFont per computed family
		// add '-default-font' (alphabetically first) so it's easy to see what it pairs with in baseFonts
	let aFonts = ['-default-font']
	if (isGecko) {aFonts = aFonts.concat(aMoz)}
	aFonts = aFonts.concat(aNonMoz)
	aFonts.sort()

	try {
		let el = dom.tzpDiv, data = []
		aFonts.forEach(function(font){
			el.style.font ='' // always clear in case a font is invalid/deprecated
			el.style.font = font
			let family = getComputedStyle(el)['font-family']
			if (!data.includes(family)) {
				data.push(family)
				isSystemFont.push(font)
			}
		})
		if (isGecko) {
		// we use isSystemFont in fntSizes where -moz group doesn't match non -moz even though all of
		// aFonts have the same computedStyes: ensure we have one of each
			if (0 == isSystemFont.filter(x => aMoz.includes(x).length)) {isSystemFont.push(aMoz[0])}

		}
		isSystemFont.sort()
		exit(isSystemFont.join(', '))
	} catch(e) {
		exit(e.name) // log nothing: we run in fonts later
	}
})

const get_isBB = (METRIC) => new Promise(resolve => {
	if (!isGecko) {return resolve()}

	let t0 = nowFn(), isDone = false
	setTimeout(() => {
		if (!isDone) {
			log_error(3, METRIC, zErrTime, isScope, true) // persist sect3
			log_alert(SECTG, METRIC, zErrTime, isScope, true)
			log_perf(SECTG, METRIC, t0,'', zErrTime)
			resolve()
		}
	}, 150)

	let count = 0, expected = 1
	function exit(value, id) {
		count++
		if ('aboutTor' == id) {removeElementFn(id)}
		//console.log(`${count} of ${expected}: ${value}, ${id}`)
		// return on first true
		if (!isDone && true === value) {
			isDone = true
			//console.log('resolving after first success: test return no.', count, id)
			isBB = true
			if (id.includes('mullvad')) {isMB = true} else {isTB = true}
			// tidy notation
			if (isMB) {
				bb_green = sgtick+'MB]'+sc
				bb_red = sbx+'MB]'+sc
				bb_slider_red = sbx+'MB Slider]'+sc
				bb_standard = sg+'[MB Standard]'+sc
				bb_safer = sg+'[MB Safer]'+sc
			}
			log_perf(SECTG, METRIC, t0,'', (isMB ? 'mullvad': 'tor') +' browser | '+ id)
			resolve()
		}
		// otherwise if !isBB we exit false after expected number of test(s)
		if (!isBB && count == expected || zErr == value) {
			isDone = true
			log_perf(SECTG, METRIC, t0,'', (zErr == value ? zErr : false))
			resolve()
		}
	}
	// FF121+: 1855861
	const get_event = (el, id) => {
		el.onload = function() {exit(true, id)}
		el.onerror = function() {exit(false, id)}
	}
	if (!runSG) {
		try {
			// min ver is 128 now
			let list = [
				'content/torconnect/tor-connect.svg', // TB13.5
				'skin/icons/torbrowser.png', // TB14.5
				'skin/icons/mullvadbrowser.png', // MB14.5
			]
			expected = list.length
			list.forEach(function(image) {
				let parts = (image.slice(0,-4)).split('/')
				let id = parts[parts.length - 1]
				let el = new Image()
				el.src = 'chrome://global/' + image
				get_event(el, id)
			})
		} catch(e) {
			// catch any unexpected extension fuckery
			log_error(3, METRIC, e, isScope, true) // persist sect3
			log_alert(SECTG, METRIC, e.name, isScope, true)
			exit(zErr)
		}
	}
})

function get_isVer(METRIC) {
	if (!isGecko) {return}
	let t0 = nowFn()

	isVer = cascade()
	if (isVer == 144) {isVerExtra = '+'} else if (isVer == 127) {isVerExtra = ' or lower'}
	log_perf(SECTG, METRIC, t0,'', isVer + isVerExtra)
	// gecko block mode
	isBlock = isVer < isBlockMin
	if (isBlock) {run_block('gecko'); return}
	// set smarts / modes
	smartFn('early')
	if (!isSmart && isVer < isSmartMin) {run_basic()}
	return

	function cascade() {
		let test
		try {
			// old-timey check: avoid false postives: must be 128 or higher
			try {let test128 = (new Blob()).bytes()} catch {return 127} // 1896509
			// now cascade
			if (undefined == window.CSS2Properties) return 144 // 144: 1919582
			// 143: fast-path: pref: layout.css.moz-appearance.webidl.enabled: default false 143+
			if (!CSS2Properties.prototype.hasOwnProperty('-moz-appearance')) return 143 // 1977489
			try {
				let segmenter = new Intl.Segmenter('en', {granularity: 'word'})
				test = Array.from(segmenter.segment('a:b')).map(({ segment }) => segment)
				if (3 == test.length) return 142 // 1960300
			} catch(e) {}
			// 141: fast-path: requires temporal default enabled FF139+ javascript.options.experimental.temporal
			try {if (undefined == Temporal.PlainDate.from('2029-12-31[u-ca=gregory]').weekOfYear) return 141} catch(e) {} // 1950162
			// 141: fast-path: dom.intersection_observer.scroll_margin.enabled (default true)
			try {if (window["IntersectionObserver"].prototype.hasOwnProperty('scrollMargin')) return 141} catch(e) {} // 1860030
			// 140: fast-path: pref: dom.event.pointer.rawupdate.enabled : default true 140+
			try {if ("object" === typeof onpointerrawupdate) return 140 } catch(e) {} // 1550462
			// 140: if < 141 there is only one paint entry "PerformancePaintTiming"
			try {if (undefined !== performance.getEntriesByType("paint")[0].presentationTime) return 140} catch(e) {} // 1963464
			try {if ('' !== dom.tzpAudio.preload) return 140} catch(e) {} // 929890
			// 139
			if (HTMLDialogElement.prototype.hasOwnProperty('requestClose')) return 139 // 1960556
			// 138: fast-path: requires webrtc e.g. media.peerconnection.enabled | --disable-webrtc
			try {if (RTCCertificate.prototype.hasOwnProperty('getFingerprints')) return 138} catch(e) {} // 1525241
			// 138: fast-path: dom.origin_agent_cluster.enabled
			if ('boolean' == typeof originAgentCluster) return 138 // 1665474
			// 138: must be FF134 or higher
			try {
				if (HTMLScriptElement.prototype.hasOwnProperty('textContent')) { // FF135+
					test = Intl.NumberFormat('yo-bj', {style: 'unit', unit: 'year', unitDisplay: 'narrow'}).format(1)
					if ('606d1046' == mini(test)) return 138 // 1954425
				}
			} catch(e) {}
			// 137 fast-path: javascript.options.experimental.math_sumprecise
			if ('function' == typeof Math.sumPrecise) return 137 // 1943120
			// 136 fast-path: FF132+ pref enabled javascript.options.experimental.regexp_modifiers
			try {if ((new RegExp("(?i:[A-Z]{4})")).test('abcd')) return 136} catch {} // 1939533
			if (HTMLScriptElement.prototype.hasOwnProperty('textContent')) return 135 // 1905706
			// 134: may be affected by --with-system-icu
				// ToDo: replace, fallbacks?
			if ('lij' == Intl.PluralRules.supportedLocalesOf('lij').join()) return 134 // 1927706
			try {
				let parser = (new DOMParser).parseFromString("<select><option name=''></option></select>", 'text/html')
				if (null === parser.body.firstChild.namedItem('')) return 133 // 1837773
			} catch {}
			try {
				const re = new RegExp('(?:)', 'gv');
				test = RegExp.prototype[Symbol.matchAll].call(re, '𠮷')
				for (let i=0; i < 3; i++) {if (true == test.next().done) return 132} // 1899413
			} catch {}
			try {
				test = new Intl.DateTimeFormat('zh', {calendar: 'chinese', dateStyle: 'medium'}).format(new Date(2033, 9, 1))
				if ('2033' == test.slice(0,4)) return 131 // 1900196
			} catch {}
			try {new RegExp('[\\00]','u')} catch(e) {if (e+'' == 'SyntaxError: invalid decimal escape in regular expression') return 130} // 1907236
			if (CSS2Properties.prototype.hasOwnProperty('WebkitFontFeatureSettings')) return 129 // 1595620
			return 128
		} catch(e) {
			console.error(e)
			return 0
		}
	}
}

const get_isXML = () => new Promise(resolve => {
	//if (!isGecko) {isXML = zNA; return resolve()}

	// get once ASAP +clear console: not going to change between tests
		// gecko change app lang and it requires closing and a new tab
		// blink changing app lang also asks for a relaunch
			// note: blink doesn't seem to translate these, or it's not tied to either app or web-content language
		// assume webkit requires an app restart

	let t0 = nowFn(), delimiter = ':'
	const list = {
		n02: 'a', n03: '', n04: '<>', n05: '<', n07: '<x></X>', n08: '<x x:x="" x:x="">',
		n09: '<x></x><x>', n11: '<x>&x;', n14: '<x>&#x0;', n20: '<x><![CDATA[', n27: '<x:x>',
		n28: '<x xmlns:x=""></x>', n30: '<?xml v=""?>'
	}
	try {
		let parser = new DOMParser
		for (const k of Object.keys(list)) {
			let doc = parser.parseFromString(list[k], 'application/xml')
			let target = doc.getElementsByTagName('parsererror')[0]
			//if ('n02' == k && !isGecko) {console.log(doc.getElementsByTagName('parsererror')[0])} //debug

			let str, value, parts
			if (isGecko) {str = target.firstChild.textContent} else {str = target.innerText}
			if (runST) {str =''}
			let typeCheck = typeFn(str)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}

			if (!isGecko) {
				// blink + webkit: also catch undefined engines
				let newtarget = target.children
				// [0] "This page contains the following errors:"
				// [1] "error on line X at column Y: " + actual error
				// [2] "Below is a rendering of the page up to the first error."
				str = newtarget[1].textContent
				// cleanup english XML messages: I don't think blink or webkit translate these
				let isErrorStr = '', isError = 'error on line' == str.slice(0,13)
				if (isError) {
					let position = str.indexOf(": ")
					if (position > 0) {
						isErrorStr = str.slice(0,28)
						str = str.slice(position + 2)
					}
				}
				value = str.replace(/\n/g,'')
				if ('n02' == k) {
					if (isError) {
						isXML['n00'] = {0: newtarget[0].textContent, 1: isErrorStr, 2: newtarget[2].textContent}
					} else {
						isXML['n00'] = {0: newtarget[0].textContent, 2: newtarget[2].textContent}
					}
				}
				//if ('n02' == k) {console.log(str, '\n', newtarget)} //debug
			} else {
				// gecko
				//split into parts: works back to FF52 and works with LTR
				parts = str.split('\n')
				if ('n02' == k) {
					// ensure 3 parts: e.g. hebrew only has 2 lines
					let tmpStr = parts[1]
					let loc = window.location+'', locLen = loc.length, locStart = tmpStr.indexOf(loc)
					if (undefined == parts[2]) {
						let position = locLen+ locStart
						parts[1] = (tmpStr.slice(0, position)).trim()
						parts.push((tmpStr.slice(-(tmpStr.length - position))).trim())
					}
					// set delimiter: should aways be the last item in parts[1] after we strip location
						// usually = ":" (charCode 58) but zh-Hans-CN = "：" (charCode 65306) and my = " -"
					let strLoc = (parts[1].slice(0, locStart)).trim() // trim
					delimiter = strLoc.slice(-1) // last char
					// concat some bits
						// don't trim strName prior to +delimiter (which is length 1)
						// e.g. 'fr','my' have a preceeding space, so capture that
					let strName = parts[0].split(delimiter)[0] + delimiter
					// use an object as joining for a string can get weird with RTL
					let oData = {
						'delimiter': delimiter +' (' + delimiter.charCodeAt(0) +')', // redundant but record it for debugging
						'error': strName,
						'line': parts[2].trim(),
						'location': strLoc,
					}
					isXML['n00'] = oData
				}
				// parts[0] is always the error message
				value = parts[0]
				let trimLen = parts[0].split(delimiter)[0].length + 1
				value = value.slice(trimLen).trim()
			}
			isXML[k] = value
		}
	} catch(e) {
		isXML = e+''
	}
	if (isGecko && gClear) {console.clear()}
	log_perf(SECTG, 'isXML', t0,'', ('string' == typeof isXML ? zErr : ''))
	return resolve()
})

/*** PREREQ ***/

function get_isDomRect() {
	if (!isGecko) {return}
	// like canvas: this is only testing for protection, so always run in gecko including basic mode
	// determine valid domrect methods + grab data for analysis
	let t0 = nowFn()
	const names = ['element_getbounding', 'element_getclient','range_getbounding','range_getclient']
	const props = ['bottom','height','left','right','top','width','x','y']
	// reset: assume lies
	isDomRect = -1
	aDomRect = [false, false, false, false]
	oDomRect = {}

	let el = dom.tzpRect
	for (let i=0; i < 4; i++) {
		let METRIC = names[i]
		let tmpobj = {}, hash
		try {
			let obj
			if (0 == i) {
				obj = el.getBoundingClientRect()
			} else if (1 == i) {
				obj = el.getClientRects()[0]
			} else {
				let range = document.createRange()
				range.selectNode(el)
				obj = (2 == i ? range.getBoundingClientRect() : range.getClientRects()[0] )
			}
			props.forEach(function(prop){
				let value = obj[prop]
				if (runSL) {value += 0.1}
				let typeCheck = typeFn(value)
				if ('number' !== typeCheck) {throw zErrType + typeCheck}
				tmpobj[prop] = value
			})
			hash = mini(tmpobj)
			aDomRect[i] = ('642e7ef0' == hash)
		} catch(e) {
			log_error(15, 'domrect_'+ METRIC, e)
			aDomRect[i] = zErr
			tmpobj = zErr
			hash = zErr
		}
		if (undefined == oDomRect[hash]) {
			oDomRect[hash] = {'data': tmpobj, 'methods': [METRIC]}
		} else {
			oDomRect[hash]['methods'].push(METRIC)
		}
	}
	//aDomRect = [false, false, false, false]
	isDomRect = aDomRect.indexOf(true)
	//console.log(isDomRect, aDomRect)
	log_perf(SECTP, 'isDomRect', t0,'', aDomRect.join(', '))
	return
}

function get_isPerf() {
	isPerf = false
	for (let i=1; i < 50 ; i++) {
		try {
			let value = Math.trunc(performance.now() - performance.now())
			if (0 !== value && -1 !== value) {return}
		} catch {return}
	}
	isPerf = true
}

/** CLICKING **/

function copyclip(element) {
	if ('clipboard' in navigator) {
		try {
			let content = dom[element].innerHTML
			if ('metricsDisplay' == element) {
				content = dom['metricsTitle'].innerHTML +'\n\n'+ content
			}
			// remove spans, change linebreaks
			let regex = /<br\s*[\/]?>/gi
			content = content.replace(regex, '\r\n')
			content = content.replace(/<\/?span[^>]*>/g,'')
			// get it
			navigator.clipboard.writeText(content).then(function() {
				// indicate it
				try {
					let target = dom.metricsBtnCopy
					target.classList.add('white')
					target.classList.remove('btn0')
					setTimeout(function() {
						target.classList.add('btn0')
						target.classList.remove('white')
					}, 500)
				} catch {}
			}, function() {
				// clipboard write failed
			})
		} catch {}
	}
}

function showhide(id, style) {
	let items = document.getElementsByClassName('tog'+ id)
	for (let i=0; i < items.length; i++) {items[i].style.display = style}
}

function togglerows(id, word) {
	let items = document.getElementsByClassName('tog'+ id)
	let	style = items[0].style.display == 'table-row' ? 'none' : 'table-row'
	for (let i=0; i < items.length; i++) {items[i].style.display = style}
	if ('btn' == word) {
		word = '['+ ('none' == style ? '+' : '-') +']'
	} else {
		word = ('none' == style ? '&#9660; show ' : '&#9650; hide ') + ('' == word || word === undefined ? 'details' : word)
	}
	try {dom['label'+ id].innerHTML = word} catch {}
}

/*** METRICS DISPLAY ***/

function json_highlight(json, clrValues = false) {
	let clrSymbols = false
	if ('health' == overlayName) {
		clrValues = false
		if ('_summary' == overlayHealth) {clrSymbols = true}
	}
	if ('string' !== typeof json) {
		// get the overlay width and use that to calculate a json maxlength
			// old hardcoded code: linux 88, android 68, windows/mac incl. BB = 95
		let minLen = 50, len = isDesktop ? 95 : minLen
		overlayInfo = ''
		try {
			// we use the table because it is visible
			let contentWidth = dom.tbfp.clientWidth - 100 // overlaycontent available width is 100px less
			len = (contentWidth/overlayCharLen) - 2 // give us some wiggle room
			if (len < minLen) {len = minLen} else {len = Math.floor(len)}
			overlayInfo = contentWidth +' | '+ overlayCharLen +' | '+ len
			let strLast = '1234567890', strSpacer = (' ').repeat(len -(overlayInfo.length + strLast.length))
			overlayInfo += strSpacer + strLast

			//console.log(contentWidth, overlayCharLen, len)
		} catch(e) {}
		json = json_stringify(json, len);
	}
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'key';
			} else {
				if (clrValues) {
					cls = 'string';
				} else if (clrSymbols) {
					cls =''
					match = match.replace(tick, green_tick)
					match = match.replace(cross, red_cross)
				} else {
					return match
				}
			}
		} else if (/true|false/.test(match)) {
			cls = 'boolean';
		} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="'+ cls +'">'+ match +'</span>';
	})
}

function json_stringify(passedObj, overlayMaxLength = 95, options = {}) {
	/* https://github.com/lydell/json-stringify-pretty-compact */
	const stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g;
	const indent = JSON.stringify(
		[1],
		undefined,
		options.indent === undefined ? 2 : options.indent
	).slice(2, -3);
	const maxLength =
		indent === ''
			? Infinity
			: options.maxLength === undefined
			? overlayMaxLength
			: options.maxLength;
	let { replacer } = options;

	return (function _stringify(obj, currentIndent, reserved) {
		if (obj && 'function' === typeof obj.toJSON) {
			obj = obj.toJSON()
		}
		const string = JSON.stringify(obj, replacer);
		if (string === undefined) {
			return string
		}
		const length = maxLength - currentIndent.length - reserved;
		if (string.length <= length) {
			const prettified = string.replace(
				stringOrChar,
				(match, stringLiteral) => {
					return stringLiteral || `${match} `;
				}
			);
			if (prettified.length <= length) {
				return prettified;
			}
		}
		if (replacer != null) {
			obj = JSON.parse(string);
			replacer = undefined;
		}
		if ('object' == typeof obj && obj !== null) {
			const nextIndent = currentIndent + indent;
			const items = [];
			let index = 0;
			let start;
			let end;
			if (Array.isArray(obj)) {
				start = '[';
				end = ']';
				const { length } = obj;
				for (; index < length; index++) {
					items.push(
						_stringify(obj[index], nextIndent, index === length - 1 ? 0 : 1) ||
						'null'
					);
				}
			} else {
				start = '{';
				end = '}';
				const keys = Object.keys(obj);
				const { length } = keys;
				for (; index < length; index++) {
					const key = keys[index];
					const keyPart = `${JSON.stringify(key)}: `;
					const value = _stringify(
						obj[key],
						nextIndent,
						keyPart.length + (index === length - 1 ? 0 : 1)
					);
					if (value !== undefined) {
						items.push(keyPart + value);
					}
				}
			}
			if (items.length > 0) {
				return [start, indent + items.join(`,\n${nextIndent}`), end].join(
				`\n${currentIndent}`
				);
			}
		}
	return string;
	})(passedObj, '', 0);
}

function metricsAction(type) {
	if ('close' == type) {
		dom.modaloverlay.style.display = 'none'
		dom.overlay.style.display = 'none'
		dom.metricsDisplay.innerHTML = '' // clear so we always start at the top
	} else if ('console' == type) {
		if (metricsData !== undefined) {console.log(metricsTitle, metricsData)}
	} else if ('download' == type) {
	if (metricsData == undefined) {return}
		try {
			let name = metricsPrefix + (metricsTitle.replaceAll(': ', '_')).toLowerCase()
			var file = new Blob([JSON.stringify(metricsData, null, 2)], {type: 'application/json'})
			var a = document.createElement('a')
			a.href = URL.createObjectURL(file)
			a.download = name
			a.click()
		} catch(e) {
			console.error(e)
		}
	} else {
		// user changed settings
		dom.metricsDisplay.innerHTML = ''
		// force delay so reflow = always start at the top
		setTimeout(function() {
			metricsShow(overlayName, overlayScope)
		}, 0)
	}
}

function metricsEvent(evt) {
	if ('block' !== dom.modaloverlay.style.display) {return}
	evt = evt || window.event
	var isEscape = false
	if ('key' in evt) {
		isEscape = ('Escape' == evt.key || 'Esc' == evt.key)
	} else {
		isEscape = (27 == evt.keyCode)
	}
	if (isEscape) {metricsAction('close')
	} else if ((evt.ctrlKey || evt.metaKey) && 67 == evt.keyCode) {
		copyclip('metricsDisplay')
		let target = dom.metricsBtnCopy
		target.classList.add('white')
		target.classList.remove('btn0')
		setTimeout(function() {
			target.classList.add('btn0')
			target.classList.remove('white')
		}, 500)
	}
}

function metricsShow(name, scope) {
	overlayName = name
	let isVisible = dom.modaloverlay.style.display == 'block'
	let aShowFormat = ['fingerprint','health'] // lies need to be made into an object with metrics as key
	let isSection = sectionNames.includes(name)
	let isShowFormat = aShowFormat.includes(name) || isSection
	let isHealth = name == 'health'

	let target = name, overlayScope = scope
	if (isShowFormat) {target = metricsUI(target, isVisible, isSection, isHealth)}

	let data, color = 99, filter = ''
	if (name == SECT98 || name == SECT99) {
		// prototype/proxy
		data = gData[name]
	} else if ('document_health_list' == name) {
		data = gData.health['document_list']
		target = 'health_list'
	} else if (aShowFormat.includes(name)) {
		// FP/health
		if (isHealth) {
			if (!dom.healthAll.checked) {filter = dom.healthPass.checked ? '_pass' : '_fail'}
			if (overlayHealth == '_detail') {overlayHealth = ''; target = name}
		} else {
			if (overlayFP == '_detail') {overlayFP = ''; target = name}
		}
		data = gData[name][scope + (isHealth ? overlayHealth + filter : overlayFP)]
	} else if (name == 'alerts' || name == 'errors' || name == 'lies') {
		// global alerts/errors/lies
		data = gData[name][scope]
	} else if (isSection) {
		// section
		if (overlaySection == '_detail') {overlaySection = ''; target = name}
		data = sData[zFP][scope + overlaySection][name]
	} else {
		// section alerts/errors/lies
		let nameslice = name.slice(0,4)
		if (nameslice == 'erro' || nameslice == 'aler' || nameslice == 'lies') {
			let slicelen = nameslice == 'lies' ? 4 : 6
			target = name.slice(0, slicelen)
			name = name.slice(slicelen)
			data = sData[target][scope][name]
			target = target.toUpperCase() +': '+ name
		} else {
			// detail data
			data = sDetail[scope][name]
		}
	}
	metricsData = data
	let isCache = (target == 'fingerprint' || target == 'fingerprint_flat')
	let	display = data !== undefined ? (isCache ? sDataTemp['cache'][scope + overlayFP] : json_highlight(data, true)): ''
	dom.overlayInfo.innerHTML = isCache ? '' : overlayInfo

	//add btn, show/hide options, display
	let hash = mini(data)
	metricsTitle = (scope == undefined ? '' : scope.toUpperCase() +': ') + target + filter +': '+ hash
	dom.metricsTitle.innerHTML = metricsTitle + (isHealth && isDesktop ? overlayHealthCount : '')
	if (isVisible) {
		// avoid reflow
		dom.metricsDisplay.innerHTML = display
	} else {
		dom.metricDownload.style.display = isShowFormat ? 'inline' : 'none'
		dom.metricOptions.style.display = isShowFormat ? 'block' : 'none'
		dom.modaloverlay.style.display = 'block'
		dom.overlay.style.display = 'block'
		// delay so overlay is painted
		setTimeout(function() {dom.metricsDisplay.innerHTML = display}, 0)
	}
}

function metricsUI(target, isVisible, isSection, isHealth) {
	if (!isVisible) {
		// tidy up options
		dom.optFlat.style.display = target == 'fingerprint' ? 'block': 'none'
		dom.optList.style.display = target == 'fingerprint' ? 'block': 'none'
		dom.groupHealth.style.display = isHealth ? 'block' : 'none'

		// ensure suitable options
		let selected = ''
		if (isSection) {
			overlaySection = ('' == overlaySection ? '_detail' : '_summary')
			selected = overlaySection
		} else if (isHealth) {
			overlayHealth = ('' == overlayHealth ? '_detail' : '_summary')
			selected = overlayHealth
		} else {
			if (overlayFP == '') {overlayFP = '_detail'}
			selected = overlayFP
		}
		dom['optFormat'+ selected].checked = true
	}

	// update final target to match checked item
	let items = document.getElementsByName('optOverlay')
	for (let i=0; i < items.length; i++) {
		if (items[i].checked) {
			target += items[i].value
			let check = items[i].value
			if (isSection) {overlaySection = check} else if (isHealth) {overlayHealth = check} else {overlayFP = check}
		}
	}
	// return final target
	return target
}

/*** OUTGOING ***/

function lookup_health(sect, metric, scope, isPass) {
	// return summary 'error/untrustworthy/str/hash' + detail (underlying data)
	if ('window.caches' == metric) {metric = 'caches'}
	let data ='', hash =''
	// error?
	try {data = gData['errors'][scope][sect][metric]; if (undefined !== data) {return([zErr, data])}} catch {}
	if ('pixels_match' == metric) {
		data = sDetail[scope][metric]
		if ('string' == typeof data) {return([zErr, data])}
	}
	// lie?
	try {data = gData['lies'][scope][sect][metric]; if (undefined !== data) {return([zLIE, zLIE])}} catch {}
	// nested, lookups, FP|detail data
	try {
		let nested ='', tmpdata, sDetailTemp
		if ('pixels_match' !== metric && 'pixels_' == metric.slice(0,7)) {nested = 'pixels'; metric = metric.replace('pixels_','')}
		if ('useragent_' == metric.slice(0,10)) {nested = 'useragent'; metric = metric.replace('useragent_','')}
		if ('media_' == metric.slice(0,6)) {nested = 'media'; metric = metric.replace('media_','')}

		if ('' !== nested) {
			data = gData[zFP][scope][sect]['metrics'][nested]['metrics'][metric]
		} else if (sDetail[scope].lookup[metric] !== undefined) {
			data = sDetail[scope].lookup[metric]
		} else if ('font_names' == metric || 'pixels_match' == metric) {
			// special case font names: not in FP / hash = full enumeration
			data = sDetail[scope][metric]
			hash = mini(data)
		} else {
			data = gData[zFP][scope][sect]['metrics'][metric]
		}
		if (undefined !== data) {
			let typeCheck = typeFn(data, true)
			hash = '' == hash ? data : hash
			// handle sDetailTemp: copy per run so it doesn't change in gData
			if (undefined !== sDetail[scope][metric]) {
				sDetailTemp = sDetail[scope][metric]
				if (!isPass) {
					// special case font names/faces: detail should reflect isPass: can't just check for !== undefined
					// e.g. windows FPP will still have unexpected data (for RFP)
					if ('font_faces' == metric || 'font_names' == metric || 'font_offscreen' == metric) {
						sDetailTemp = sDetail[scope][metric +'_health']
					}
				}
				let tmpCheck = typeFn(sDetailTemp)
				if ('object' == tmpCheck) {
					data = {}
					for (const k of Object.keys(sDetailTemp)) {data[k] = sDetailTemp[k]}
				} else if ('array' == tmpCheck) {
					data = []
					sDetailTemp.forEach(function(item){data.push(item)})
				}
			}
			if ('object' === typeCheck) {
				try {hash = gData[zFP][scope][sect]['metrics'][metric].hash} catch {}
			}
			return([hash, data])
		}
	} catch(e) {
		console.log(metric,e)
	}
	return(['',''])
}

function output_health(scope) {
	// done after populating global FP, errors, lies
	if (!isSmart) {return}
	let h = "health", countPass = 0, countTotal = Object.keys(gData.health[scope +'_collect']).length
	gData[h][scope] = {}
	gData[h][scope +'_list'] = []
	gData[h][scope +'_fail'] = {}
	gData[h][scope +'_pass'] = {}
	gData[h][scope +'_summary'] = {}
	gData[h][scope +'_summary_fail'] = {}
	gData[h][scope +'_summary_pass'] = {}

	let target = gData.health[scope +'_collect']
	try {
		for (const metric of Object.keys(target).sort()) {
			let sect = target[metric][0]
			let isPass = target[metric][1]
			if (isPass) {countPass++}
			let symbol = isPass ? tick : cross
			let sub = isPass ? '_pass' : '_fail'
			// lookup
			let data = lookup_health(sect, metric, scope, isPass)
			let summary = data[0], detail = data[1]
			if ('' !== summary) {summary = ' '+ summary}
			// populate detail
			if ('' == detail) {detail = symbol}
			gData[h][scope][metric] = detail
			gData[h][scope + sub][metric] = detail
			// populate summary + metriclist
			gData[h][scope +'_list'].push(metric)
			gData[h][scope +'_summary'][metric] = symbol + summary
			gData[h][scope +'_summary'+ sub][metric] = symbol + summary
		}
		if (countTotal > 0) {
			let isAll = countPass == countTotal
			overlayHealthCount = countPass +'/'+ countTotal
			//dom[scope + h].innerHTML = addButton(0,'document_health_list', countTotal)
			//		+' '+ addButton((isAll ? 'good' : 'bad'), h, overlayHealthCount)

			let btnPart1 = addButton((isAll ? 'good' : 'bad'), h, countPass)
			btnPart1 = btnPart1.replace(']','')	+ '<span style="letter-spacing: -0.2em"> | </span>'
			dom[scope + h].innerHTML = btnPart1
				+ addButton(0,'document_health_list', countTotal).replace('[','')

			overlayHealthCount = (isAll ? sg : sb) +'['+ overlayHealthCount +']'+ sc
			if (isAll) {dom.healthAll.checked = true} else {dom.healthFail.checked = true}
		}
		delete gData[h][scope +'_collect']
	} catch(e) {
		console.log(e)
	}
}

function output_perf(id, click = false) {
	if (!isPerf) {return}

	let array = id == "all" ? gData["perf"] : sDataTemp["perf"]
	let target = id == "all" ? "perfG" : "perfS"
	let btn = id == "all" ? dom.perfGBtn : dom.perfSBtn

	// toggle perf depth
	let isMore = dom[target +"Btn"].innerHTML === "less"
	if (click) {
		isMore = !isMore // user toggled it
		dom[target +"Btn"] = isMore ? "less" : "more"
	}

	let aPretty = [],
		s2 = " <span class='s2'>",
		s4 = " <span class='s4'>",
		s98 = "<span class='s99'>", // trimmed
		pageLoad = false,
		isStart = false,
		nFix = isDecimal ? 2 : 0,
		pad = isDecimal ? 18 : 15,
		padFix = isDecimal ? 3 : 0
	if (isMore) {pad = 32}

	try {
		array.forEach(function(array) {
			let type = array[0],
				name = array[1],
				time1 = array[2],
				time2 = array[3],
				extra = array[4]
			if ('string' == typeof extra) {extra = extra.trim()}
			extra = undefined == extra  ? '' : extra !== '' ? ' | '+ extra : ''

			// header
			if (isMore && 1 === type) {
				if ("IMMEDIATE" == name) {pageLoad = true}
				if ("DOCUMENT START" == name) {isStart = true}
				time1 = pageLoad ? " "+ time1 : ""
				aPretty.push(s2 + name +":"+ time1 + sc)
			}
			// section/detail
			if (type > 1) {
				if (id == 'all') {
					time1 = time2 - time1
					time2 = time2 - gt1 // use gt1: only reset on global runs
				}
				time1 = Number(time1).toFixed(nFix)
				time2 = Number(time2).toFixed(nFix)
			}
			// section
			if (2 === type) {
				time2 = id == "all" ? " |"+ s2 + time2.padStart(4 + padFix) +" ms</span>" : ""
				let pretty = name.padStart(pad) +":"+ s4 + time1.padStart(4 + padFix) +"</span> ms"
					+ time2 + extra
				aPretty.push(pretty)
				if (sectionNames.includes(name)) {
					try {
						dom["perf"+ name] = " "+ time1 +" ms"
					} catch(e) {
						console.error('perf'+ name +' element is missing')
					}
				}
			}
			// detail
			if (isMore && 3 === type) {
				name = name.replace(": "+ SECTNF,"")
				if (name.length > pad) {
					let parts = name.split(":")
					let newlen = pad - (parts[1].length + 1)
					name = name.slice(0, newlen) +":"+ parts[1]
				}
				if (id !== "all") {isStart = true}
				time2 = isStart ? " |"+ s98 + time2.padStart(5 + padFix) +" ms</span>" : ''
				let pretty = s98 + name.padStart(pad) + sc +":" + s98 + time1.padStart(5 + padFix) +" ms</span>"
					+ time2 + extra
				aPretty.push(pretty)
			}
		})
		dom[target].innerHTML = aPretty.join("<br>")
	} catch(e) {
		console.error(e)
	}
}

function output_section(section, scope) {
	// ToDo: SANITY CHECKS
	let aSection = section == "all" ? sectionOrder : [section]

	// propagate onces to sDataTemp
		// don't worry about all vs section: sDataTemp is temp
	try {
		btnList.forEach(function(item) {
			let once = item+"once"
			if (gData[once] !== undefined && gData[once][scope] !== undefined) {
				for (const s of Object.keys(gData[once][scope])) {
					if (!sectionNames.includes(s)) {
						// non-section: straight to sData: sorted
						if (sData[item][scope] == undefined) {sData[item][scope] = {}}
						if (sData[item][scope][s] == undefined) {sData[item][scope][s] = {}}
						for (const m of Object.keys(gData[once][scope][s]).sort()) {
							sData[item][scope][s][m] = gData[once][scope][s][m]
						}
					} else {
						// section: to sDataTemp: no sort
							// this is just section onces: _all_ sections to sData etc are looped below
						if (sDataTemp[item][scope] == undefined) {sDataTemp[item][scope] = {}}
						if (sDataTemp[item][scope][s] == undefined) {sDataTemp[item][scope][s] = {}}
						for (const m of Object.keys(gData[once][scope][s])) {
							sDataTemp[item][scope][s][m] = gData[once][scope][s][m]
						}
					}
				}
			}
		})
	} catch(e) {
		console.error(e)
	}

	// propagate data
	let gList = {}, gFlat = {}
	let summary = scope+"_summary"
	if (gRun) {
		gData[zFP][summary] = {}
		sData[zFP][summary] = {}
	}

	aSection.forEach(function(number) {
		let data = {}, datasummary = {}, hash, count, hashsummary
		let name = sectionMap[number]
		sData[zFP][summary][name] = {}
		// section
		try {
			data = {}, datasummary = {}
			let obj = sDataTemp[zFP][scope][number]
			for (const k of Object.keys(obj).sort()) {
				data[k] = obj[k]
				let value = ("object" == typeof data[k] && data[k] !== null ? data[k]["hash"] : data[k])
				datasummary[k] = value
				if (gRun) {
					gFlat[k] = obj[k]
					gList[k] = datasummary[k]
				}
			}
			sData[zFP][scope][name] = data
			hash = mini(data)
			count = Object.keys(data).length

			sData[zFP][summary][name] = datasummary
			hashsummary = mini(datasummary)
			// global
			if (gRun) {
				// FP
				gData[zFP][scope][name] = {}
				gData[zFP][scope][name]["hash"] = hash
				gData[zFP][scope][name]["metrics"] = data
				// summary
				gData[zFP][summary][name] = {}
				gData[zFP][summary][name]["hash"] = hashsummary
				gData[zFP][summary][name]["metrics"] = datasummary
			}
		} catch(e) {
			console.error(e)
		}
		// display
		try {
			for (const d of Object.keys(sDataTemp["display"][scope][number])) {
				let str
				try {
					str = sDataTemp["display"][scope][number][d]
					dom[d].innerHTML = str
				} catch(e) {
					console.error(d, str, e.name, e.emssage)
				}
			}
		} catch(e) {
			console.error(e)
		}
		let sHash = hash + addButton(0, name, count +" metric"+ (count == 1 ? "" : "s"), "btns")

		// section buttons
			// sDataTemp sorted to sData
		let aBtns = []
		try {
			btnList.forEach(function(item) {
				let btn =''
				if (sDataTemp[item][scope] !== undefined && sDataTemp[item][scope][name] !== undefined) {
					if (sData[item][scope] == undefined) {sData[item][scope] = {}}
					if (sData[item][scope][name] == undefined) {sData[item][scope][name] = {}}
					let typeCheck = typeFn(sDataTemp[item][scope][name], true)
					for (const m of Object.keys(sDataTemp[item][scope][name]).sort()) {
						sData[item][scope][name][m] = sDataTemp[item][scope][name][m]
					}
					let count = Object.keys(sData[item][scope][name]).length
					if (count > 0) {
						let btnText = count + ' '+ (count == 1 ? item.slice(0,-1) : item) // single/plural
						let color = ('alerts' === item) ? 'bad' : 0
						btn = addButton(color, item + name, btnText, 'btns', scope)
						aBtns.push(btn.trim())
					}
				}
			})
			dom[name +'hash'].innerHTML = sHash + aBtns.join('')
		} catch(e) {
			console.error(e)
		}

	})
	if (gRun) {
		// flat + list
		let flat = scope+'_flat', list = scope+'_list'
		gData[zFP][flat] = {}
		gData[zFP][list] = {}
		for (const k of Object.keys(gFlat).sort()) {gData[zFP][flat][k] = gFlat[k]}
		for (const k of Object.keys(gList).sort()) {gData[zFP][list][k] = gList[k]}
		// recalculate overlayCharLen for cached big jsons
		try {
			// at a minimum this is 10 chars "0, 0, 0, 0" all platforms/engines
			let target = dom.screen_positions
			overlayCharLen = target.offsetWidth/target.innerText.length
		} catch(e) {
			overlayCharLen = 7
		}
		// cache big jsons displays
		sDataTemp["cache"] = {}
		sDataTemp["cache"][scope] = json_highlight(gData[zFP][scope])
		sDataTemp["cache"][flat] = json_highlight(gData[zFP][flat])
	}
}

/*** RECORD ***/

function addButton(color, name, text = "details", btn = "btnc", scope = isScope) {
	return " <span class='btn"+ color +" "+ btn +"' onClick='metricsShow(`"+ name +"`,`" + scope +"`)'>["+ text +"]</span>"
}

function addBoth(section, metric, str, btn ='', notation ='', data ='', isLies = false, donotuse ='x') {
	//if ('x' !== donotuse) {console.log(metric, 'extra paramater passed')}
	if (undefined == str) {str += ''}
	let display = str
	// check: errors can't be lies
	if (data == zErr || data == zErrLog || data == zErrShort) {
		isLies = false
		let sectionName = sectionMap[section]
		// instead of logging errors in each function add them here
		if (data == zErrLog || data == zErrShort) {
			// 186 errors: 82e9678e (runST + runSI)
			// 190 errors: 4440a20a (+ runSE)
			display = log_error(section, metric, str)
			if (data == zErrShort) {display = zErr}
			data = zErr
		}
	}
	// check: non obj can't have btns
	if ('object' !== typeof data && '' !== btn) {
		let typeCheck = typeFn(data, true), value
		if ('object' !== typeCheck && 'array' !== typeCheck) {btn =''}
	}
	addDisplay(section, metric, display, btn, notation, isLies)

	// data = FP: if missing we use str/ which also doubles as our hash for objects
	if ('' == data || undefined == data) {data = str}
	addData(section, metric, data, str, isLies)
}

function addData(section, metric, data, hash ='', isLies = false, donotuse ='x') {
	//if ('x' !== donotuse) {console.log(metric, 'extra paramater passed')}
	// check: basic mode/errors can't be lies
	if (!isSmart || data == zErr) {isLies = false}
	let typeCheck = typeFn(data, true), value
	if ('object' === typeCheck || 'array' === typeCheck) {
		addDetail(metric, data)
		value = {'hash': hash, 'metrics': data}
	} else {
		value = data
	}
	sDataTemp[zFP][isScope][section][metric] = isLies ? zLIE : value
	if (isLies) {
		// don't add spoofed domrect data
		let aIgnore = ['element_font','element_forms','element_mathml','element_other','glyphs']
		if (aIgnore.includes(metric)) {value = zLIE}
		log_known(section, metric, value)
	}
}

function addDisplay(section, metric, str ='', btn ='', notation ='', isLies = false, donotuse ='x') {
	//if ('x' !== donotuse) {console.log(metric, 'extra paramater passed')}
	// check: basic mode can't be lies or have notation
	if (!isSmart) {isLies = false; notation =''}
	// style lies + ensure lies cannot be good health
	if (isLies) {
		str = "<span class='lies'>"+ str +"</span>"
		notation = notation.replace("class='good'", "class='bad'")
		notation = notation.replace(tick, cross)
	}
	sDataTemp['display'][isScope][section][metric] = str + btn + notation
	// global health: just grab pass/fail
	if (gRun && '' !== notation && notation.includes("class='health'")) {
		let isPass
		if (notation.includes('>'+ tick +'<')) {isPass = true} else if (notation.includes('>'+ cross +'<')) {isPass = false}
		if (isPass !== undefined) {
			gData['health'][isScope +'_collect'][metric] = [sectionMap[section], isPass]
		}
	}
}

function log_display(section, metric, str, btn ='', notation ='', isLies = false) {
	if (!isSmart) {isLies = false; notation =''}
	if (isLies) {str = "<span class='lies'>"+ str +"</span>"}
	sDataTemp['display'][isScope][section][metric] = str + btn + notation
}

function addDetail(metric, data, scope = isScope) {
	if (sDetail[scope] == undefined) {sDetail[scope] = {}}
	sDetail[scope][metric] = data
	if (gRun) {addTiming(metric)}
}

function addTiming(metric) {
	let remainder = gCountTiming % 9, key, value
	if (0 == gCountTiming % 5) {
		// get extra dates
		try {gData.timing['date'].push((new Date())[Symbol.toPrimitive]('number'))} catch {}
	}
	try {
		if (0 == remainder) {
			key = 'exslt'
			if (!isGecko) {throw zSKIP}
			const xslText = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"'
				+' xmlns:date="http://exslt.org/dates-and-times" extension-element-prefixes="date"><xsl:output method="html"/>'
				+' <xsl:template match="/"><xsl:value-of select="date:date-time()" /></xsl:template></xsl:stylesheet>'
			const doc = (new DOMParser).parseFromString(xslText, "text/xml")
			let xsltProcessor = new XSLTProcessor
			xsltProcessor.importStylesheet(doc)
			let fragment = xsltProcessor.transformToFragment(doc, document)
			value = (fragment.childNodes[0].nodeValue).slice(0,-6)
		} else if (1 == remainder || 5 == remainder) {
			key = 'now'; value = performance.now()
		} else if (2 == remainder) {
			key = 'currenttime'; value = gTimeline.currentTime
		} else if (3 == remainder) {
			key = 'timestamp'; value = new Event('').timeStamp
		} else if (4 == remainder) {
			key = 'date'
			value = (new Date())[Symbol.toPrimitive]('number')
		} else if (6 == remainder) {
			performance.mark('a')
		} else if (7 == remainder) {
			key = 'instant'
			value = Temporal.Now.instant().toString()
		}
		if (undefined !== key) {
			if (runST) {value = undefined}
			gData.timing[key].push(value)
		}
	} catch(e) {
		gData.timing[key] = e+''
	}
	gCountTiming++
}

function addTimings() {
	// get first and final values for each to ensure a max diff
	try {gData.timing['now'].push(performance.now())} catch {}
	try {gData.timing['timestamp'].push(new Event('').timeStamp)} catch {}
	try {gData.timing['date'].push((new Date())[Symbol.toPrimitive]('number'))} catch {}
	try {gData.timing['instant'].push(Temporal.Now.instant().toString())} catch {}
	try {
		if (0 == gCountTiming) {gTimeline = new DocumentTimeline()}
		gData.timing['currenttime'].push(gTimeline.currentTime)
	} catch {}
	try {
		if (0 == gCountTiming) {performance.clearMarks('a')}
		performance.mark('a')
	} catch {}
	if (0 == gCountTiming) {
		addTiming('start') // adds first exslt
	}
}

function log_alert(section, metric, alert, scope = isScope, isOnce = false) {
	if ('string' !== typeof section) {section = sectionMap[section]}
	let key = 'alerts'
	if (gRun && isOnce) {
		key += 'once'
		//if (gData[key][scope] == undefined) {gData[key][scope] = {}}
		if (gData[key][scope][section] == undefined) {gData[key][scope][section] = {}}
		gData[key][scope][section][metric] = alert
	} else {
		if (sDataTemp[key][scope] == undefined) {sDataTemp[key][scope] = {}}
		if (sDataTemp[key][scope][section] == undefined) {sDataTemp[key][scope][section] = {}}
		sDataTemp[key][scope][section][metric] = alert
	}
}

function log_error(section, metric, error = zErr, scope = isScope, isOnce = false) {
	if ('string' !== typeof section) {section = sectionMap[section]}
	if ('' == error || null == error || undefined == error) {error = zErr} else {error += ''}
	let aLen25 = [
		'canPlayType','isTypeSuppo','font-format','font-tech','textmetrics',
	]
	let len = isDesktop ? 50 : 25
	if (aLen25.includes(metric.slice(0,11))) {len = 25}
	let key = 'errors'
	// collect
	if (gRun && isOnce) {
		key += 'once'
		if (gData[key][scope] == undefined) {gData[key][scope] = {}}
		if (gData[key][scope][section] == undefined) {gData[key][scope][section] = {}}
		gData[key][scope][section][metric] = error
	} else {
		if (sDataTemp[key][scope] == undefined) {sDataTemp[key][scope] = {}}
		if (sDataTemp[key][scope][section] == undefined) {sDataTemp[key][scope][section] = {}}
		sDataTemp[key][scope][section][metric] = error
	}
	// trim if required + return
	// is aLen25 and android, just display zErr
	if (!isDesktop && aLen25.includes(metric.slice(0,11))) {
		error = zErr
	} else if (error.length > len) {
		error = error.slice(0,len-3) + "..."
	}
	return error
}

function log_known(section, metric, data, scope = isScope) {
	if (!isSmart) {return data}
	let key = 'lies'
	if ('string' !== typeof section) {section = sectionMap[section]}
	if (sDataTemp[key][scope] == undefined) {sDataTemp[key][scope] = {}}
	if (sDataTemp[key][scope][section] == undefined) {sDataTemp[key][scope][section] = {}}
	if (undefined == data) {
		if (undefined !== sDetail[scope][metric]) {data = sDetail[scope][metric]}
	}
	sDataTemp[key][scope][section][metric] = data
	// color
	return "<span class='lies'>"+ data +"</span>"
}

function log_perf(section, metric ='', time1, time2, extra) {
	if (!isPerf) {return}
	if ('string' !== typeof section) {section = sectionMap[section]}
	let tEnd = performance.now()
	let str = '' === metric ? section : metric +': '+ section

	// GLOBAL
	if (gRun || str.includes(SECTNF)) {
		gData.perf.push([3, str, time1, tEnd, extra])
		return
	}
	// SECTION RERUNS
	if (str.includes(SECTP)) {return} // ignore prereq
	let type = sectionNames.includes(str) ? 2 : 3
	time2 = tEnd - gt0
	time1 = (2 === type) ? time2 : tEnd - time1
	sDataTemp.perf.push([type, str, time1, time2, extra])
}

function log_section(name, time, scope = isScope) {
	let t0 = nowFn()
	let nameStr = "number" === typeof name ? sectionMap[name] : name
	if (gRun) {gData["perf"].push([2, nameStr, time, t0])}
	if (nameStr == SECTP) {return}
	//console.log(name, nameStr)

	// SECTION RERUNS
	if (!gRun) {
		log_perf(nameStr,'', time)
		output_section(name, scope)
		outputPostSection(name) // trigger nonFP	
		gClick = true
		return
	}

	// GLOBAL
	gCount++

	//console.log(sectionMap[name], gCount ,"/", gSectionsExpected)
	if (gCount == gSectionsExpected) {
		gt1 = gt0
		if (isPerf) {dom.perfAll = " "+ (performance.now()-gt0).toFixed(isDecimal ? 2 : 0) +" ms"}
		output_section("all", scope)

		// FP
		try {
			let metricCount = Object.keys(gData[zFP][scope +"_flat"]).length
			let color = metricCount == expectedMetrics ? 0 : 'red' // use red to override color in basic mode
			dom[scope + "hash"].innerHTML = mini(gData[zFP][scope]) + addButton(color, zFP, metricCount +" metrics")
		} catch(e) {
			console.log(e)
		}

		let aBtns = []
		try {
			btnList.forEach(function(item) {
				let total = 0, oFlat = {}, oSummary = {}
				// propagate sData to gData
				if (sData[item][scope] !== undefined) {
					if (gData[item][scope] == undefined) {
						gData[item][scope] = {}
					}
					for (const s of Object.keys(sData[item][scope]).sort()) {
						// everything is already sorted
						gData[item][scope][s] = sData[item][scope][s]
						total += Object.keys(sData[item][scope][s]).length
						for (const k of Object.keys(sData[item][scope][s])) {
							let tmpData = sData[item][scope][s][k]
							let value = ('object' == typeof tmpData && tmpData !== null ? sData[item][scope][s][k]['hash'] : sData[item][scope][s][k])
						}
					}
				}
				if (total > 0) {
					let btnText = total +" "+ (total == 1 ? item.slice(0,-1) : item) // single/plural
					let color = ('alerts' === item) ? 'bad' : 0
					aBtns.push(addButton(color, item, btnText, 'btnc', scope))
				}
			})
		} catch(e) {
			console.error(e)
		}
		dom[scope +"btns"].innerHTML = aBtns.join("")

		// prototype/proxy
			// ToDo: isTB health
		if (isSmart || isSmartDataMode) {
			let protoCount = (Object.keys(gData[SECT98]).length)
			let proxyCount = gData[SECT99].length
			if (protoCount + proxyCount == 0) {
				dom.protohash = "none"
			} else {
				let aStr = []
				if (protoCount > 0) {aStr.push(mini(gData[SECT98]) + addButton(0, SECT98, protoCount))}
				if (proxyCount > 0) {aStr.push(mini(gData[SECT99]) + addButton(0, SECT99, proxyCount))}
				dom.protohash.innerHTML = aStr.join(" ")
			}
		}

		output_health(scope)

		// trigger nonFP
		outputPostSection("all")
		gLoad = false
		gClick = true
	}
}

/*** RUN ***/

function countJS(item) {
	jsFiles++
	if (1 == jsFiles) {
		// block if iframed
		if (window.location !== window.parent.location) {run_block('iframe'); return}
		// block if insecure as this produces very different results e.g. some APIs require secure
			// gecko diffs include 14 navigator keys, 100+ window props, and 7 permissions
		if (!isFile && 'https:' !== location.protocol) {run_block('insecure'); return}
		// non-gecko
		if (!isGecko) {
			if (isAllowNonGecko && undefined !== isEngine) {run_basic()} else {run_block(isEngine+' engine'); return}
		}

		// set src's for our l10n iframe tests
			// setting these inline can cause the wrong contentDocument in the wrong iframes
			// it's almost random like some sort of race with different results in android vs windows - WTF!!
			// Switching the element order in html (with inline src and not by JS) I can replicate these
			// mismatched contents in both windows and android. Only setting them via JS are we always correct
			// jesus says: WT actual F
		if (isGecko) {
			try {dom.tzpInvalidImage.src = 'images/InvalidImage.png'} catch {}
			try {dom.tzpScaledImage.src = 'images/ScaledImage.png'} catch {}
			try {dom.tzpXMLunstyled.src = 'xml/xmlunstyled.xml'} catch {}
			try {dom.tzpXSLT.src='xml/xslterror.xml'} catch {}
		}

		get_isVer('isVer') // if PoCs don't touch the dom this is fine here: required for isTB
		get_isSystemFont()
		return
	} else if (jsFiles === jsFilesExpected) {
		// block: gecko (we promised/set isBlock in isVer above)
		if (isGecko && isBlock) {return}
		// block: nongecko
		if (!isGecko) {
			// not allowed or engine is undefined
			if (!isAllowNonGecko || undefined == isEngine) {return}
			// allowed but engine fails a minimum standard
			if (isEngineBlocked) {run_block('upgrade'); return}
		}
		// otherwise not blocked
		isBlock = false
		// tidy up metric overlay symbols
		dom.overlay_tick.innerHTML = tick +' '
		dom.overlay_cross.innerHTML = cross +' '

		gData['perf'].push([1, 'RUN ONCE', nowFn()])

		Promise.all([
			get_isBB('isBB'),
			get_isFileSystem('isFileSystem'),
			get_isAutoplay('getAutoplayPolicy'),
		]).then(function(){
			// 140+ notations: if isBB then block FPP notations & vice versa
			isFPPFallback = !isBB
			Promise.all([
				get_isOS('isOS')
			]).then(function(){
				// tweak monospace size: ToDo: this is bad design
				if ('windows' == isOS) {
					try {
						let items = document.querySelectorAll('.mono')
						for (let i=0; i < items.length; i++) {
							items[i].classList.add('monobigger')
							items[i].classList.remove('mono')
						}
					} catch {}
				}
				// do once
				dom.tzpPointer.addEventListener('pointerdown', (event) => {get_pointer_event(event)})
				if (isDesktop) {
					document.addEventListener('keydown', metricsEvent)
				} else {
					showhide('A','table-row')
					// A1 inner_document: html class hidden - only used by android
					// add class togS so it shows when expanding, remove hidden class
					dom.A1.classList.add('togS')
					dom.A1.classList.remove('hidden')
					// hide and remove togS on the entire viewport section + also window.inner - not used by android
					// + visualViewportScale + window_scrollbar
					let items = document.getElementsByClassName('A2')
					for (let i=0; i < items.length; i++) {
						items[i].classList.remove('togS')
						items[i].classList.add('hidden')
					}
					// hide console button in overlay: width is a premium
					dom.metricsConsole.classList.add('hidden')
				}
				Promise.all([
					get_isFontDelay() // determine if we need to delay BB for font.vis and async font fallback
				]).then(function(){
					outputSection('load')
				})
			})
		})
	}
}

function outputPostSection(id) {
	if ("all" !== id) {
		output_perf(id)
	}
	if ("number" === typeof id) {id = sectionMap[id]}
	if (gRun) {gData["perf"].push([1, SECTNF, nowFn()])}
	let isLog = gRun // push perf
	gRun = false // stop collecting

	if (id == "storage") {
		test_worker(isLog)
		test_worker_service(isLog) // doesn't return
		test_worker_shared(isLog)
		test_idb(isLog)
	} else if (id == "agent") {
		get_agent_iframes(isLog)
		get_agent_workers()
	} else if (id == "all") {
		test_worker_service(isLog) // doesn't return
		Promise.all([
			test_worker(isLog),
			test_worker_shared(isLog),
			test_idb(isLog),
			get_agent_iframes(isLog),
			get_agent_workers(),
		]).then(function(){
			output_perf(id)
		})
	}
}

function outputUser(fn) {
	// user initiated
	if (isBlock) {return}
	if ('goFS' == fn) { goFS()
	} else if ("exitFS" == fn) { exitFS()
	} else if ("goNW" == fn) { goNW()
	} else if ('goNW_AGENT' == fn) { goNW_AGENT()
	} else if ('outputAudioUser' == fn) {outputAudioUser()
	} else if ('get_storage_manager' == fn) { get_storage_manager()
	} else if ('get_pointer_event' == fn) { get_pointer_event()
	} else if ('get_timing_audio' == fn) { get_timing_audio()
	}
}

function outputSection(id, isResize = false) {

	if (isBlock || !gClick) {
		output_perf('all')
		return
	}
	// reset scope
	isScope = zDOC
	if ('load' == id) {
		// set sectionOrder/Names/Nos
		let tmpObj = {}
		for (const k of Object.keys(sectionMap)) {sectionNos[sectionMap[k]] = k; tmpObj[sectionMap[k]] = k; sectionNames.push(sectionMap[k])}
		for (const n of Object.keys(tmpObj).sort()) {sectionOrder.push(tmpObj[n])}
		sectionNames.sort()
	}

	gClick = false
	let delay = 100
	// reset
	if ('load' == id || 'all' == id) {
		// gData
		if (runSG) {
			log_error('a', 'd', '4', isScope, true)
			log_error('_a', 'a', '1', isScope, true)
			log_error(2, 'z', '9', isScope, true)
			log_error(2, 'y', '8', isScope, true)
			log_error(SECTG, 'c', '3', isScope, true)
			log_error(SECTG, 'b', '2', isScope, true)
			log_alert(5, 'z', "p", isScope, true)
			log_alert(5, '_a', "t", isScope, true)
			log_alert(5, 'm', "z", isScope, true)
		}
		gData[zFP] = {'document': {}}
		gData.health = {'document_collect': {}}
		gTiming.forEach(function(item){gData.timing[item] = []})
		btnList.forEach(function(item){gData[item] = {}})
		if (!gLoad) { // don't wipe gLoad perf
			gData['perf'] = []
		}
		// sData
		sData = {
			'fingerprint': {'document': {}}
		}
		// sDataTemp
		sDataTemp = {
			'display': {'document': {}},
			'fingerprint': {"document": {}},
			'perf': [],
		}
		btnList.forEach(function(item){
			sData[item] = {'document': {}}
			sDataTemp[item] = {'document': {}}
		})
		for (const name of Object.keys(sectionMap)) {
			let sectionName = sectionMap[name]
			sDataTemp[zFP][isScope][name] = {}
			sDataTemp['display'][isScope][name] = {}
		}
		// sDetail
		sDetail = {'document': {'lookup': {}}}
	}

	if ('load' == id) {
		// skip clear/reset
		id = 'all'
		delay = 0
	} else if ('all' == id) {
		gRun = true
		// clear
		let items = document.getElementsByClassName('c')
		for (let i=0; i < items.length; i++) {items[i].innerHTML = '&nbsp'}
		items = document.getElementsByClassName('cssc') // inline css notations we don't want to add an empty space
		for (let i=0; i < items.length; i++) {items[i].innerHTML = ''}
		items = document.getElementsByClassName('gc') // user actions
		for (let i=0; i < items.length; i++) {items[i].innerHTML = '&nbsp'}
		// reset global
		gCount = 0
		get_isDevices() // non gLoad warmup
	} else {
		// clear section data
		let name = sectionMap[id]
		try {sData[zFP][isScope][name] = {}} catch {}
		try {sDataTemp[zFP][isScope][id] = {}} catch {}
		try {sDataTemp['display'][isScope][id] = {}} catch {}
		btnList.forEach(function(item){
			try {sData[item][isScope][name] = {}} catch {}
			try {sDataTemp[item][isScope][name] = {}} catch {}
		})
		if (!isResize) {
			let tbl = dom['tb'+ id]
			tbl.querySelectorAll(`.c`).forEach(e => {e.innerHTML = '&nbsp'})
			tbl.querySelectorAll('span.cssc').forEach(e => {e.innerHTML = ''})
		}
		gRun = false
	}

	var promiseSection = async function(x) {
		let n = Number.isInteger(x) ? x : sectionNos[x]
		if (n == 1) { return(outputScreen(isResize))}
		if (n == 2) { return(outputAgent())}
		if (n == 3) { return(outputFD())}
		if (n == 4) { return(outputRegion())}
		if (n == 5) { return(outputHeaders())}
		if (n == 6) { return(outputStorage())}
		if (n == 7) { return(outputDevices())}
		if (n == 9) { return(outputCanvas())}
		if (n == 10) { return(outputWebGL())}
		if (n == 11) { return(outputAudio())}
		if (n == 12) { return(outputFonts())}
		if (n == 13) { return(outputMedia())}
		if (n == 14) { return(outputCSS())}
		if (n == 15) { return(outputElements())}
		if (n == 17) { return(outputTiming())}
		if (n == 18) { return(outputMisc())}
	}

	function output() {
		if ('all' == id) {
			gCountTiming = 0 // reset
			addTimings()
			// run sequentially awaiting each before running the next
			// order: use number or section name
			let order = [
				3, // first: sets isMB (legacy method)
				2, 1, 5, 14, 13, // fast
				'canvas',
				'storage', // little slow: cache + permissions
				'misc', // cold on load: iframe props
				'elements', // cold on load: mathml
				'audio',
				'webgl',
				'devices','fonts','region', // next to last: allow time for isDevices, font fallback, iframes
				17 // last: uses data collected during gRun
			]
			const forEachSection = async (iterable, action) => {
				for (const n of iterable) {
					let t0 = nowFn()
					await promiseSection(n)
					let x = Number.isInteger(n) ? n : sectionNos[n] * 1
					log_section(x, t0)
				}
			}
			forEachSection(order, promiseSection)
		} else {
			gt0 = nowFn() // single section timer
			Promise.all([
				promiseSection(id)
			]).then(function(){
				log_section(id, gt0, isScope, isResize)
			})
		}
	}

	// reset smarts
	smartFn('final')
	if (gLoad && isFontDelay) {
		delay = 2000
		dom.protohash.innerHTML = '<span class="spaces"><b>     AWAITING ASYNC</b></span>'
		dom.documenthash.innerHTML = '<span class="spaces"><b>     FONT FALLBACK</b></span>'
	}
	setTimeout(function() {
		get_isPerf()
		if (gRun) {gData['perf'].push([1, 'DOCUMENT START', nowFn()])}
		gt0 = nowFn()
		Promise.all([
			get_isDomRect(),
			outputPrototypeLies(isResize),
		]).then(function(){
			if (isBB && gClear && 'all' == id) {console.clear()}
			if (isSmart) {log_section(SECTP, gt0)}
			output()
		})
	}, delay)
}

function run_immediate() {
	get_isPerf()
	let t00 = nowFn()
	zErrLog = rnd_string()
	zErrShort = rnd_string()
	gData['perf'].push([1, 'IMMEDIATE', t00])
	isFile = 'file:' == location.protocol
	Promise.all([
		get_isGecko('isGecko')
	]).then(function(){
		if (!isGecko) {
			// get engine regardless
			get_isEngine('isEngine')
			// return if not supported
			if (!isAllowNonGecko || undefined === isEngine) {return}
		}
		get_isRecursion()
		// storage warm ups
		get_isFileSystem('isFileSystem', true)
		try {window.caches.keys()} catch {}
		// other warm ups
		get_isDevices()
		try {let w = speechSynthesis.getVoices()} catch {}
		try {
			const config = {initDataTypes: ['cenc'], videoCapabilities: [{contentType: 'video/mp4;codecs="avc1.4D401E"'}]}
			navigator.requestMediaKeySystemAccess('org.w3.clearkey', [config]).then((key) => {}).catch(function(e){})
		} catch {}
		try {
			let warm = Intl.DateTimeFormat().resolvedOptions()
			warm = Intl.DateTimeFormat(undefined, {timeZone: 'Europe/London', timeZoneName: 'shortGeneric'}).format(new Date)
			warm = new Intl.NumberFormat(undefined, {notation: 'compact'}).format(1)
			warm = new Intl.NumberFormat(undefined, {style: 'unit', unit: 'hectare'}).format(1)
		} catch {}
		get_isXML()
		get_isArch('isArch')
		try {
			// ensure hevc correctness e.g. see 1972902 fixed by 1974881
				// 1st query on a new session hevc are false positives: a recheck fixes it
			let vCodecs = ['"hev1.1.6.L93.B0"','"hev1.2.4.L120.B0"','"hvc1.1.6.L93.B0"','"hvc1.2.4.L120.B0"']
			let vObj = document.createElement('video')
			vCodecs.forEach(function(item) {let vTest = vObj.canPlayType('video/mp4; codecs='+ item)})
		} catch(e) {}
	})
}

run_immediate()
