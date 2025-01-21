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

const newFn = x => typeof x != 'string' ? x : new Function(x)()
function nowFn() {if (isPerf) {return performance.now()}; return}
function rnd_string() {return Math.random().toString(36).substring(2, 15)}
function rnd_number() {return Math.floor((Math.random() * (99999-10000))+10000)}
function removeElementFn(id) {try {dom[id].remove()} catch(e) {}}
function addProxyLie(value) {sData[SECT99].push(value)}
function isProxyLie(value) {return sData[SECT99].includes(value)}

function typeFn(item, isSimple = false) {
	// return a more detailed result
	let type = typeof item
	if ('string' === type) {
		if (!isSimple) {
			if ('' === item) {type = 'empty string'} else if ('' === item.trim()) {type = 'whitespace'}
		}
	} else if ('number' === type) {
		if (Number.isNaN(item)) {type = 'NaN'} else if (Infinity === item) {type = Infinity}
	} else if ('object' === type) {
		if (Array.isArray(item)) {
			type = 'array'
			if (!isSimple && !item.length) {type = 'empty array'}
		} else if (null === item) {type = 'null'
		} else {
			if (!isSimple) {
				try {if (0 === Object.keys(item).length) {type = 'empty object'}} catch(e) {}
			}
		}
	}
	// do nothing: undefined, bigint, boolean, function
	return type
}

function testtypeFn(isSimple = false) {
	let bigint = 9007199254740991
	try {bigint = BigInt(9007199254740991)} catch(e) {}
	let data = ['a','','  ', 1, 1.2, Infinity, NaN, [], [1], {}, {a: 1}, null,
		true, false, bigint, undefined, function foobar() {},]
	data.forEach(function(item) {console.log(item, typeFn(item, isSimple))})
}

function run_block() {
	log_perf(SECTG, 'isBlock','')
	try {
		dom.tzpContent.style.display = 'none'
		dom.blockmsg.style.display = 'block'
		let msg = "<center><br><span style='font-size: 14px;'><b>" + (isGecko ? 'Gah.' : 'Aw, Snap!')
			+"<br><br>TZP requires Firefox " + isBlockMin +'+<b></span></center>'
		dom.blockmsg.innerHTML = msg
	} catch(e) {}
}

function run_basic() {
	log_perf(SECTG, 'isBasic','')
	for (let i=1; i < 19; i++) {
		document.body.style.setProperty('--test'+i, '#d4c1b3')
		document.body.style.setProperty('--bg'+i, '#808080')
	}
	document.body.style.setProperty('--testbad', '#d4c1b3')
	let items = document.getElementsByClassName('nav-down')
	for (let i=0; i < items.length; i++) {
		items[i].innerHTML = (items[i].innerHTML).replace(/</, "<span class='perf'>basic mode</span> <")
	}
}

function getElementProp(sect, id, name, pseudo = ':after') {
	// default none: https://www.w3.org/TR/CSS21/generate.html#content
	try {
		let item = window.getComputedStyle(document.querySelector(id), pseudo)
		item = item.getPropertyValue('content')
		//console.log(sect, pseudo, id, name, item)
		if (runSI && !runSL) {item = 'none'} // don't error if runSL
		let typeCheck = typeFn(item, true)
		if ('string' !== typeCheck) {throw zErrType + typeCheck}
		item = item.replace(/"/g,'') // trim quote marks
		// screen(S) + window(D) + dpi(P:before) return none or ? when out of range
		if ('#S' == id || '#D' == id || '#P' == id) {
			if (':after' == pseudo && ' x ' == item.slice(0,3)) {item = item.slice(3)} // S/D remove leading ' x '
			if ('none' == item || '' == item) {item = '?'} // return consistent ? for out of range/blocked
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
	if (!isGecko) {return}
	let t0 = nowFn(), value
	try {
		if (runSG) {foo++}
		let test = new ArrayBuffer(Math.pow(2,32))
		value = 64
	} catch(e) {
		isArch = log_error(3, 'browser_architecture', e, isScope, true) // persist sect3
		value = zErr
	}
	log_perf(SECTG, METRIC, t0,'', value)
}

function get_isAutoplay(METRIC) {
	// get non-user-gesture values once
	let t0 = nowFn()
	try {
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
			mTest = navigator.getAutoplayPolicy(dom.tzpMedia)
		} catch(e) {
			log_error(13, METRIC +'_media', e, isScope, true) // persist sect13
			mTest = zErr
		}
		// combine
		isAutoPlay = (aPolicy === aTest ? aPolicy : aPolicy +', '+ aTest) +' | '+ (mPolicy === mTest ? mPolicy : mPolicy +', '+ mTest)
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
		if (runSG) {foo++}
		navigator.mediaDevices.enumerateDevices().then(function(devices) {
			isDevices = devices
			if (gLoad) {log_perf(SECTG, 'isDevices', t0,'', nowFn())}
		}
	)} catch(e) {}
}

const get_isFileSystem = (METRIC) => new Promise(resolve => {
	// meta: 1748667
	// note: pref change (dom.fs.enabled) requires new reload: so we can run once
	let t0 = nowFn()
	function exit(value) {
		isFileSystem = value
		log_perf(SECTG, METRIC, t0,'', value)
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

function get_isGecko(METRIC) {
	let t0 = nowFn(), value
	try {
		let list = [
			[DataTransfer, 'DataTransfer', 'mozSourceNode'],
			[Document, 'Document', 'mozFullScreen'],
			[HTMLCanvasElement, 'HTMLCanvasElement', 'mozPrintCallback'],
			[HTMLElement, 'HTMLElement', 'onmozfullscreenerror'],
			[HTMLInputElement, 'HTMLInputElement', 'mozIsTextField'],
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
	if (!isGecko) {return resolve()	}

	let t0 = nowFn()
	function exit(value) {
		isOS = value
		dom.tzpResource.style.backgroundImage = "url('chrome://branding/content/"
			+ ('android' == isOS ? 'fav' : '') + "icon64.png')" // set icon
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
		} catch(e) {}
		if (!fntEnabled) {trysomethingelse(); return}

		// check fonts
		get_fonts_size(false).then(res => {
			if ('object' == typeFn(res, true)) {
				let aDetected = []
				for (const k of Object.keys(res)) {aDetected.push(k)}
				let expected = aDetected[0]
				if (aDetected.length == 1) {
					if (expected == 'MS Shell Dlg \\32') {exit('windows')
					} else if (expected == '-apple-system') {exit('mac')
					} else {exit('android')}
				} else if (aDetected.length == 0) {
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
		let font = getComputedStyle(dom.tzpWidget.children[0]).getPropertyValue('font-family')
		if ('string' !== typeFn(font) || aIgnore.includes(font)) {
			throw zErr
		} else {
			if (font.slice(0,12) == "MS Shell Dlg") {exit('windows')
			} else if (font == '-apple-system') {exit('mac')
			} else {throw zErr}
		}
	} catch(e) {
		tryfonts()
	}
})

const get_isRecursion = () => new Promise(resolve => {
	// 2nd test is more accurate/stable
	const METRIC = "isRecursion"
	let t0 = nowFn()
	let level = 0
	function recurse() {level++; recurse()}
	try {recurse()} catch(e) {}
	level = 0
	try {
		recurse()
	} catch(e) {
		let stacklen = e.stack.toString().length
		// display value
		isRecursion = [level +" | "+ stacklen]
		log_perf(SECTG, METRIC, t0, "", isRecursion.join())
		// metric values: only collect level
			// https://github.com/arkenfox/user.js/issues/1789: round down: level to 1000's
		isRecursion.push(Math.floor(level/1000))
		return resolve()
	}
})

const get_isSystemFont = () => new Promise(resolve => {
	if (!isGecko) {return resolve()}
	let t0 = nowFn()
	function exit(value) {
		log_perf(SECTG, 'isSystemFont', t0,'', value)
		return resolve()
	}
	// first aFont per computed family
		// add '-default-font' (alphabetically first) so it's easy to see what it pairs with in baseFonts
	let aFonts = [
		'-default-font','-moz-button','-moz-button-group','-moz-desktop','-moz-dialog','-moz-document',
		'-moz-field','-moz-info','-moz-list','-moz-message-bar','-moz-pull-down-menu','-moz-window',
		'-moz-workspace','caption','icon','menu','message-box','small-caption','status-bar',
	]
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
		exit(isSystemFont.join(', '))
	} catch(e) {
		exit(e.name) // log nothing: we run in fonts later
	}
})

const get_isTB = (METRIC) => new Promise(resolve => {
	if (!isGecko) {
		return resolve(false)
	}
	let t0 = nowFn(), isDone = false
	setTimeout(function() {
		if (!isDone) {
			log_error(3, METRIC, zErrTime, isScope, true) // persist sect3
			log_alert(SECTG, METRIC, zErrTime, isScope, true)
			exit(zErrTime)
		}
	}, 150)

	let el
	function exit(value) {
		isDone = true
		try {el.remove()} catch(e) {}
		if ('boolean' == typeFn(value)) {isTB = value}
		log_perf(SECTG, METRIC, t0,'', value)
		return resolve(value)
	}
	// FF121+: 1855861
	const get_event = () => new Promise(resolve => {
		el.onload = function() {exit(true)}
		el.onerror = function() {exit(false)}
	})
	if (!runSG) {
		try {
			if (isVer > 127) {
				el = new Image();
				el.src = 'chrome://global/content/torconnect/tor-connect.svg' // TB13.5
				document.body.appendChild(el)
			} else {
				// support TB13 until we raise minVer next ESR
				el = document.createElement('link')
				el.href = 'chrome://browser/content/abouttor/aboutTor.css';
				el.type = 'text/css'
				el.rel = 'stylesheet'
				document.head.appendChild(el)
			}
			get_event()
		} catch(e) {
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
	if (isVer == 135) {isVerExtra = '+'} else if (isVer == 114) {isVerExtra = ' or lower'}
	log_perf(SECTG, METRIC, t0,'', isVer + isVerExtra)
	// gecko block mode
	isBlock = isVer < isBlockMin
	if (isBlock) {run_block(); return}
	// set basic mode
	if (isVer >= isSmartMin) {isSmart = true} else {run_basic()}
	return

	function cascade() {
		let test
		try {
			// old-timey check: avoid false postives: must be 115 or higher
			if (!CanvasRenderingContext2D.prototype.hasOwnProperty('letterSpacing')) return 114 // 1778909
			// now cascade
			try {
				test = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', notation:'scientific'})
				if (0 == test.resolvedOptions().minimumFractionDigits) return 135 // 1930464
			} catch(e) {}
			try {
				if ('$1.00' == (1).toLocaleString('en-CA', {style: 'currency', currencyDisplay: 'narrowSymbol', currency: 'USD'})) return 134 // 1927706
			} catch(e){}
			try {
				let parser = (new DOMParser).parseFromString("<select><option name=''></option></select>", 'text/html')
				if (null === parser.body.firstChild.namedItem('')) return 133 // 1837773
			} catch(e) {}
			try {
				const re = new RegExp('(?:)', 'gv');
				test = RegExp.prototype[Symbol.matchAll].call(re, '𠮷')
				for (let i=0; i < 3; i++) {if (true == test.next().done) return 132} // 1899413
			} catch(e) {}
			try {
				test = new Intl.DateTimeFormat('zh', {calendar: 'chinese', dateStyle: 'medium'}).format(new Date(2033, 9, 1))
				if ('2033' == test.slice(0,4)) return 131 // 1900196
			} catch(e) {}
			try {new RegExp('[\\00]','u')} catch(e) {if (e+'' == 'SyntaxError: invalid decimal escape in regular expression') return 130} // 1907236
			if (CSS2Properties.prototype.hasOwnProperty('WebkitFontFeatureSettings')) return 129 // 1595620
			try {let test128 = (new Blob()).bytes(); return 128} catch(e) {} // 1896509
			try {if ((new Date('15Jan0024')).getYear() > 0) return 127} catch(e) {} // 1894248
			if ('function' === typeof URL.parse) {return 126}
			try {if ('Invalid Date' == new Date('Sep 26 Thurs 1995 10:00')) return 125} catch(e) {} // 1872793
			let el = document.documentElement
			if (!CSS2Properties.prototype.hasOwnProperty('MozUserFocus')) {
				try {
					el.style.zIndex = 'calc(1 / max(-0, 0))'
					test = getComputedStyle(el).zIndex
					el.style.zIndex = 'auto'
					if (test > 0) {return 124} // 1867569
				} catch(e) {}
				return 123 // 1871745
			}
			if ('function' === typeof Promise.withResolvers) {
				try {
					el.style.zIndex = 'calc(1 / abs(-0))'
					test = getComputedStyle(el).zIndex
					el.style.zIndex = 'auto'
					if (test > 0) {return 122} // 1867558
				} catch(e) {}
				return 121 // 1845586
			}
			if (window.hasOwnProperty('UserActivation')) return 120 // 1791079
			try {location.href = 'http://a>b/'} catch(e) {if (e.name === 'SyntaxError') return 119} // 1817591
			if (CSS2Properties.prototype.hasOwnProperty('fontSynthesisPosition')) return 118 // 1849010
			if (CanvasRenderingContext2D.prototype.hasOwnProperty('fontStretch')) return 117 // 1842467
			if (CanvasRenderingContext2D.prototype.hasOwnProperty('textRendering')) return 116 // 1839614
			return 115
		} catch(e) {
			console.error(e)
			return 0
		}
	}
}

const get_isXML = () => new Promise(resolve => {
	if (!isGecko) {isXML = zNA; return resolve()}
	// get once ASAP +clear console: not going to change between tests
		// e.g. change app lang and it requires closing and a new tab
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
			let str = (doc.getElementsByTagName('parsererror')[0].firstChild.textContent)
			if (runST) {str =''}
			let typeCheck = typeFn(str)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			//split into parts: works back to FF52 and works with LTR
			let parts = str.split('\n')
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
			let value = parts[0], trimLen = parts[0].split(delimiter)[0].length + 1
			isXML[k] = value.slice(trimLen).trim()
		}
	} catch(e) {
		isXML = e+''
	}
	if (gClear) {console.clear()}
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
	if (runSL) {aDomRect = [false, false, false, false]}
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
		} catch(e) {return}
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
			}, function() {
				// clipboard write failed
			})
		} catch(e) {}
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
	try {dom['label'+ id].innerHTML = word} catch(e) {}
}

/*** METRICS DISPLAY ***/

function json_highlight(json, clrValues = false) {
	let clrSymbols = false
	if ('health' == overlayName) {
		clrValues = false
		if ('_summary' == overlayHealth) {clrSymbols = true}
	}
	if ('string' !== typeof json) {
		json = json_stringify(json);
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

function json_stringify(passedObj, options = {}) {
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
			? 88
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
		target.classList.add('btngood')
		target.classList.remove('btn0')
		setTimeout(function() {
			target.classList.add('btn0')
			target.classList.remove('btngood')
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

	//add btn, show/hide options, display
	let hash = mini(data)
	metricsTitle = (scope == undefined ? '' : scope.toUpperCase() +': ') + target + filter +': '+ hash
	dom.metricsTitle.innerHTML = metricsTitle + (isHealth ? overlayHealthCount : '')
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
	try {data = gData['errors'][scope][sect][metric]; if (undefined !== data) {return([zErr, data])}} catch(e) {}
	// lie?
	try {data = gData['lies'][scope][sect][metric]; if (undefined !== data) {return([zLIE, zLIE])}} catch(e) {}
	// nested, lookups, FP|detail data
	try {
		let nested ='', tmpdata, sDetailTemp
		if ('pixels_' == metric.slice(0,7)) {nested = 'pixels'; metric = metric.replace('pixels_','')}
		if ('' !== nested) {
			data = gData[zFP][scope][sect]['metrics'][nested]['metrics'][metric]
		} else if (sDetail[scope].lookup[metric] !== undefined) {
			data = sDetail[scope].lookup[metric]
		} else if ('font_names' == metric) {
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
				try {hash = gData[zFP][scope][sect]['metrics'][metric].hash} catch(e) {}
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
			// populate summary
			gData[h][scope +'_summary'][metric] = symbol + summary
			gData[h][scope +'_summary'+ sub][metric] = symbol + summary
		}
		if (countTotal > 0) {
			let isAll = countPass == countTotal
			overlayHealthCount = countPass +'/'+ countTotal
			dom[scope + h].innerHTML = addButton((isAll ? 'good' : 'bad'), h, overlayHealthCount)
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
					dom["perf"+ name] = " "+ time1 +" ms"
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
		let aIgnore = ['element_font','element_forms','element_mathml','glyphs_clientrect']
		if (aIgnore.includes(metric)) {value = ''}
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
		try {gData.timing['date'].push((new Date())[Symbol.toPrimitive]('number'))} catch(e) {}
	}
	try {
		if (0 == remainder) {
			key = 'exslt'
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
	let len = 50
	let aLen25 = [
		'canPlayType','isTypeSuppo','font-format','font-tech','textmetrics',
	]
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
	if (error.length > len) {error = error.slice(0,len-3) + "..."}
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
			let color = metricCount == expectedMetrics ? 0 : 'bad'
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
		if (isSmart) {
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
		// non-gecko
		if (!isGecko) {
			if (isAllowNonGecko) {run_basic()} else {run_block(); return}
		}
		// help ensure/force images are loaded in time
		try {dom.InvalidImage.src = 'images/InvalidImage.png'} catch(e) {}
		try {dom.ScaledImage.src = 'images/ScaledImage.png'} catch(e) {}
		get_isVer('isVer') // if PoCs don't touch the dom this is fine here: required for isTB
		get_isSystemFont()
		return
	} else if (jsFiles === jsFilesExpected) {
		if (!isGecko && !isAllowNonGecko || isGecko && isBlock) {return}
		isBlock = false
		gData['perf'].push([1, 'RUN ONCE', nowFn()])

		Promise.all([
			get_isTB('isTB'),
			get_isFileSystem('isFileSystem'),
			get_isAutoplay('getAutoplayPolicy'),
		]).then(function(){
			Promise.all([
				get_isOS('isOS')
			]).then(function(){
				// tweak monospace size: ToDo: this is bad design
				if ('windows' == isOS || 'abdroid' == isOS) {
					try {
						let items = document.querySelectorAll('.mono')
						for (let i=0; i < items.length; i++) {
							items[i].classList.add('monobigger')
							items[i].classList.remove('mono')
						}
					} catch(e) {}
				}
				// do once
				dom.tzpPointer.addEventListener('pointerdown', (event) => {get_pointer_event(event)})
				if ('android' == isOS) {
					showhide('DROID','table-row')
					dom.androidhide1.style.display = 'none'
					dom.androidhide1.classList.remove('togS')
					dom.androidshow1.classList.remove('hidden')
				} else {
					document.addEventListener('keydown', metricsEvent)
				}
				outputSection('load')
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
		test_worker_service(isLog) // doesn't return
		test_worker_web(isLog)
		test_worker_shared(isLog)
		test_idb(isLog)
	} else if (id == "ua") {
		get_ua_iframes(isLog)
		get_ua_workers()
	} else if (id == "all") {
		test_worker_service(isLog) // doesn't return
		Promise.all([
			test_worker_web(isLog),
			test_worker_shared(isLog),
			test_idb(isLog),
			get_ua_iframes(isLog),
			get_ua_workers(),
		]).then(function(){
			output_perf(id)
		})
	}
}

function outputUser(fn) {
	// user initiated
	if (isBlock) {return}
	if ('goFS' == fn) { goFS()
	} else if ("goNW" == fn) { goNW()
	} else if ('goNW_UA' == fn) { goNW_UA()
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
		try {sData[zFP][isScope][name] = {}} catch(e) {}
		try {sDataTemp[zFP][isScope][id] = {}} catch(e) {}
		try {sDataTemp['display'][isScope][id] = {}} catch(e) {}
		btnList.forEach(function(item){
			try {sData[item][isScope][name] = {}} catch(e) {}
			try {sDataTemp[item][isScope][name] = {}} catch(e) {}
		})
		if (!isResize) {
			let tbl = dom['tb'+ id]
			tbl.querySelectorAll(`.c`).forEach(e => {e.innerHTML = '&nbsp'})
			tbl.querySelectorAll('span.cssc').forEach(e => {e.innerHTML = ''})
		}
		gRun = false
	}
	// reset
	if ('all' == id || 1 == id) {dom.kbt.value =''}

	var promiseSection = async function(x) {
		let n = Number.isInteger(x) ? x : sectionNos[x]
		if (n == 1) { return(outputScreen(isResize))}
		if (n == 2) { return(outputUA())}
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
			// get a first value for each to ensure a max diff
			try {gData.timing['now'].push(performance.now())} catch(e) {}
			try {gData.timing['timestamp'].push(new Event('').timeStamp)} catch(e) {}
			try {
				gTimeline = new DocumentTimeline()
				gData.timing['currenttime'].push(gTimeline.currentTime)
			} catch(e) {}
			try {
				performance.clearMarks('a')
				performance.mark('a')
			} catch(e) {}
			gCountTiming = 0
			addTiming('start') // adds first exslt

			// run sequentially awaiting each before running the next
			// order: use number or section name
			let order = [
				3, // first: sets isMullvad
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

	// TB + fontvis at least on windows seems to require **LOTS**
	// more time for font async fallback
		// 1: see if adding bundled to the fontvis list helps
		// 2: see if upstream can fix the perf cliff
	/*
	if (gLoad && isTB && isVer > 127) {
		if ('windows' == isOS || 'mac' == isOS) {delay = 1000}
	}
	//*/
	setTimeout(function() {
		get_isPerf()
		if (gRun) {gData['perf'].push([1, 'DOCUMENT START', nowFn()])}
		gt0 = nowFn()
		Promise.all([
			get_isDomRect(),
			outputPrototypeLies(isResize),
		]).then(function(){
			if (isTB && gClear && 'all' == id) {console.clear()}
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
	Promise.all([
		get_isGecko('isGecko')
	]).then(function(){
		if (!isGecko && !isAllowNonGecko) {return}
		isFile = 'file:' == location.protocol
		get_isRecursion()
		// storage warm ups
		try {navigator.storage.getDirectory()} catch(e) {}
		try {window.caches.keys()} catch(e) {}
		// other warm ups
		get_isDevices()
		try {let w = speechSynthesis.getVoices()} catch(e) {}
		try {
			const config = {initDataTypes: ['cenc'], videoCapabilities: [{contentType: 'video/mp4;codecs="avc1.4D401E"'}]}
			navigator.requestMediaKeySystemAccess('org.w3.clearkey', [config]).then((key) => {}).catch(function(e){})
		} catch(e) {}
		try {
			let warm = Intl.DateTimeFormat().resolvedOptions()
			warm = Intl.DateTimeFormat(undefined, {timeZone: 'Europe/London', timeZoneName: 'shortGeneric'}).format(new Date)
			warm = new Intl.NumberFormat(undefined, {notation: 'compact'}).format(1)
			warm = new Intl.NumberFormat(undefined, {style: 'unit', unit: 'hectare'}).format(1)
			warm = (1).toLocaleString('en-CA', {style: 'currency', currencyDisplay: 'narrowSymbol', currency: 'USD'}) // v134 test
		} catch(e) {}
		get_isXML()
		get_isArch('isArch')
	})
}

run_immediate()
