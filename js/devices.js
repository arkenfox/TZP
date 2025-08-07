'use strict';

const get_battery = (METRIC) => new Promise(resolve => {
	//https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery
	function exit(value) {
		addBoth(7, METRIC, value)
		return resolve()
	}
	try {
		let value = navigator.getBattery
		if (runST) {value = ''}
		let typeCheck = typeFn(value)
		if ('undefined' == typeCheck) {
			exit(typeCheck)
		} else {
			if ('function' !== typeCheck) {throw zErrType +'getBattery: '+ typeCheck}
			navigator.getBattery().then((battery) => {
				let data = {}, aTimes = []
				let oItems = {
					charging: 'boolean',
					chargingTime: 'Infinity', // integer seconds, 0 if full | Infinity if discharging
					dischargingTime: 'Infinity', // integer seconds | Infinity if charging 
					level: 'number', // 0.0 to 1
				}
				for (const k of Object.keys(oItems)) {
					let x = battery[k]
					// type check
					let typeCheck = typeFn(x), typeExpected = oItems[k]
					let isTime = 'Time' == k.slice(-4), isTimeCheck = ('number' == typeCheck && isTime)
					if (typeCheck !== typeExpected) {if (!isTimeCheck) {throw zErrType + k +': '+ typeCheck}}
					// validity
					if (isTimeCheck) {
						if (!Number.isInteger(x) || x < 0) {throw zErrInvalid + k + ': expected a positive integer: got '+ x}
					} else if ('level' == k) {
						if (x < 0 || x > 1) {throw zErrInvalid + k + ': expected 0 to 1: got '+ x}
					}
					if (Infinity == x) (x += '')
					if (isTime) {aTimes.push(x)}
					data[k] = x
				}

				// true, 0, Infinity, 1 == no battery or fully charged | else  == a battery (or tampering)
				// note: *Times are not reliable: change of charging state during a chrome session, we can get 2 x Infinity
				// logic: battery exists if the level is less than 1 || charging is false || 2 x Infinity: this should be enough
				let fpvalue = 'unknown'
				if (!data.charging || data.level < 1 || 'InfinityInfinty' == aTimes.join('')) {fpvalue = true}
				addData(7, METRIC, fpvalue)

				// record object for clicking
				let btn = addButton(7, METRIC +'_reported')
				sDetail.document[METRIC +'_reported'] = data
				addDisplay(7, METRIC +'_reported', fpvalue +' '+ btn + (true == fpvalue ? '' : ' [false or 100% charged]'))
				return resolve()
			}).catch(e => {
				exit(e, zErrLog)
			})
		}
	} catch(e) {
		exit(e, zErrLog)
	}
})

function get_device_integer(METRIC, proxyCheck) {
	// concurrency: 1630089: macOS reports physical cores instead of logical
		// dom.maxHardwareConcurrency : 1958598: FF139+ 128
	let value, data ='', expected = 'hardwareConcurrency' == METRIC ? 2 : 24
	try {
		value = 2 == expected ? navigator[METRIC] : screen[METRIC]
		if (runST) {value += ''} else if (runSL) {addProxyLie(proxyCheck + METRIC)}
		if (!Number.isInteger(value)) {throw zErrType + typeFn(value)}
	} catch(e) {
		value = e; data = ('hardwareConcurrency' == METRIC ? zErrLog : zErrShort)
	}
	addBoth(7, METRIC, value,'', (value == expected ? rfp_green : rfp_red), data, isProxyLie(proxyCheck + METRIC))
	return
}

function get_device_memory(METRIC) {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
	let value, data =''
	try {
		value = navigator.deviceMemory
		if (runST) {value += ''} else if (runSI) {value = 6}
		let typeCheck = typeFn(value)
		if ('undefined' == typeCheck) {
			value = typeCheck
		} else {
			if ('number' !== typeCheck) {throw zErrType + typeCheck}
			// https://www.w3.org/TR/device-memory/#sec-device-memory-js-api
				// "While implementations may choose different values, the recommended upper bound
				// is 8GiB and the recommended lower bound is 0.25GiB (or 256MiB)"
			// https://webkit.org/b/233381 : webkit is clamped to 4 or 8
			let aValid = 'webkit' == isEngine ? [4, 8] : [0.25, 0.5, 1, 2, 4, 8]
			if (!aValid.includes(value)) {
				throw zErrInvalid +'expected: '+ aValid.join(', ') +': got '+ value
			}
		}
	} catch(e) {
		value = e; data = zErrShort
	}
	addBoth(7, METRIC, value,'','', data)
	return
}

function get_device_posture(METRIC) {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/devicePosture
	let oData = {}, aValid = ['continuous','folder']
	function get_nav(m) {
		let value
		try {
			value = navigator[m]
			if (runST) {value = false} else if (runSI) {value = {}}
			let typeCheck = typeFn(value, true)
			if ('undefined' == typeCheck) {
				value = typeCheck
			} else {
				if ('object' !== typeCheck) {throw zErrType + 'devicePosture: '+ typeCheck}
				let expected = '[object DevicePosture]'
				if (value+'' !== expected) {throw zErrInvalid + 'devicePosture expected '+ expected +': got '+ value+''}
				value = value.type
				typeCheck = typeFn(value)
				if ('string' !== typeCheck) {throw zErrType + 'devicePosture.type: '+ typeCheck}
				if (!aValid.includes(value)) {
					throw zErrInvalid +'expected: '+ aValid.join(', ') +': got '+ value
				}
			}
		} catch(e) {
			value = zErr; log_error(7, METRIC +'_'+ m, e)
		}
		oData[m] = value; addDisplay(7, METRIC +'_'+ m, value)
	}

	function get_mm(m) {
		let cssvalue = getElementProp(7, '#cssDP', METRIC +'_'+ m +'_css')
		let value = 'undefined'
		try {
			if (runSE) {foo++}
			for (let i=0; i < aValid.length; i++) {
				if (window.matchMedia('('+ m +':'+ aValid[i] +')').matches) {value = aValid[i]; break}
			}
		} catch(e) {
			value = zErr; log_error(7, METRIC +'_'+ m, e)
		}
		oData[m] = value; addDisplay(7, METRIC +'_'+ m, value)
		oData[m +'_css'] = cssvalue
	}

	// do in alphabetival order
	get_mm('device-posture')
	get_nav('devicePosture')
	addData(7, METRIC, oData, mini(oData))
	return
}

const get_keyboard = (METRIC) => new Promise(resolve => {
	// https://wicg.github.io/keyboard-map/
	// https://www.w3.org/TR/uievents-code/#key-alphanumeric-writing-system
	function exit(hash, data='', btn ='') {
		addBoth(7, METRIC, hash, btn,'', data)
		return resolve()
	}
	try {
		let k = navigator.keyboard
		let typeCheck = typeFn(k)
		if ('undefined' == typeCheck) {
			exit(typeCheck)
		} else {
			let expected = '[object Keyboard]'
			if (k+'' !== expected) {throw zErrInvalid + 'expected '+ expected +': got '+ k+''}
			let aKeys = [
				'Backquote','Backslash','Backspace','BracketLeft','BracketRight','Comma','Digit0',
				'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9',
				'Equal','IntlBackslash','IntlRo','IntlYen','KeyA','KeyB','KeyC','KeyD','KeyE','KeyF',
				'KeyG','KeyH','KeyI','KeyJ','KeyK','KeyL','KeyM','KeyN','KeyO','KeyP','KeyQ','KeyR',
				'KeyS','KeyT','KeyU','KeyV','KeyW','KeyX','KeyY','KeyZ','Minus','Period','Quote',
				'Semicolon','Slash'
			]
			k.getLayoutMap().then(keyboardLayoutMap => {
				// check size
				if (keyboardLayoutMap.size > 0) {
					let data = {}
					aKeys.forEach(function(key) {data[key] = keyboardLayoutMap.get(key)})
					exit(mini(data), data, addButton(7, METRIC))
				} else {
					// e.g. vivalid : is it this? https://wicg.github.io/keyboard-map/#permissions-policy
					exit('keyboardLayoutMap.size: 0')
				}
			}).catch(function(err){
				exit(err, zErrLog)
			})
		}
	} catch(e) {
		exit(e, zErrLog)
	}
})

const get_media_devices = (METRIC) => new Promise(resolve => {
	let t0 = nowFn()

	function set_notation(value ='') {
		// 1528042: FF115+ media.devices.enumerate.legacy.enabled
		let notation =''
		if (isTB) {
			notation = 'undefined' == value ? bb_green : bb_red
		} else {
			notation = '75e77887' == value ? rfp_green : rfp_red
		}
		return notation
	}

	function analyse(devices) {
		let hash ='none', btn ='', data =''
		try {
			if (runST) {devices = undefined} else if (runSI) {devices = [{}]}
			let typeCheck = typeFn(devices, true)
			if ('array' !== typeCheck) {throw zErrType + typeFn(devices)}
			if (devices.length > 0) {
				// tampered
				let aSplit = (devices +'').split(',')
				let aValid = ['[object InputDeviceInfo]','[object MediaDeviceInfo]']
				for (let i=0; i < aSplit.length; i++) {
					if (!aValid.includes(aSplit[i])) {throw zErrInvalid +'expected '+ aValid.join(', ') +': got '+ aSplit[i]}
				}
				// enumerate
					// don't combine kind, keep order, record length not strings
					// checking length of undefined (fake) will catch an error
				data = {}
				let sLen = new Set(), index = 0
				devices.forEach(function(d) {
					let kind = d.kind, kindtest = kind.length,
						dLen = d.deviceId.length,
						gLen = d.groupId.length,
						indexKey = (index+'').padStart(2,'0')
					data[indexKey +'-'+ kind] = [dLen, gLen, d.label.length]
					sLen.add(dLen)
					sLen.add(gLen)
					index ++
					// we could check valid lengths (0 or 44 in 115+: labels always 0)
						// and if 44 is valid then the last char is '=', and we could type check
				})
				hash = mini(data); btn = addButton(7, METRIC, data.length)
			}
		} catch(e) {
			hash = e; data = zErrLog
		}
		addBoth(7, METRIC, hash, btn, set_notation(hash), data, isProxyLie('MediaDevices.enumerateDevices'))
		log_perf(7, METRIC, t0)
		return resolve()
	}

	if (undefined == navigator.mediaDevices) {
		addBoth(7, METRIC, 'undefined','', set_notation('undefined'))
		return resolve()
	}

	if (gLoad && isDevices !== undefined) {
		analyse(isDevices) // warmup success
	} else {
		try {
			let timer = 2000
			if (runSG) {timer = 0} // timed out
			// await devices
			promiseRaceFulfilled({
				promise: navigator.mediaDevices.enumerateDevices(),
				responseType: Array,
				limit: timer // increase race limit for slow system/networks
			}).then(function(devices) {
				if (!devices) {
					addBoth(7, METRIC, zErrTime,'', set_notation(zErrTime), zErrLog) // promise failed
					return resolve()
				} else {
					analyse(devices)
				}
			})
		} catch(e) {
			addBoth(7, METRIC, e,'', set_notation(e+''), zErrLog)
			return resolve()
		}
	}
})

const get_permissions = (METRIC) => new Promise(resolve => {
	// https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API#permission-aware_apis
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy#directives
	let tmpData = {}, data = {}, count = 0
	let aList = [
		// sorted
		'camera','geolocation','microphone','midi','midi_sysex','notifications',
		'persistent-storage','push','screen-wake-lock',
	]
	if (!isGecko) {
		aList.push(
			'accelerometer','ambient-light-sensor','background-fetch','background-sync','clipboard-read',
			'clipboard-write','compute-pressure','gyroscope','local-fonts','magnetometer','payment-handler',
			'storage-access','top-level-storage-access','window-management',
			// not listed on mdn: but confirmed in blink as a non error
			'display-capture','nfc',
			// other
			//'accessibility-events', // 
			'bluetooth','device-info','gamepad','speaker','speaker-selection',
		)
		aList.sort()
	}
	for (let i=0; i < aList.length; i++) {
		let k = aList[i], key = k
		// https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus
		// spec: https://w3c.github.io/permissions/#permissions
		let aValid = ['denied','granted','prompt']
		function accrue(k, value) {
			count++
			if (undefined ==tmpData[value]) {tmpData[value] = [k]} else {tmpData[value].push(k)}
			if (count == (aList.length)) {exit()}
		}
		try {
			//if (runSE) {foo++}
			let isSysex = k.includes('sysex')
			if (isSysex) {key = 'midi'}
			navigator.permissions.query({name: key, sysex: isSysex}).then(function(r) {
				let state = r.state
				if (runST) {state = undefined} else if (runSI) {state = 'allowed'}
				// checks
				let typeCheck = typeFn(state)
				if ('string' !== typeCheck) {throw zErrType + typeCheck}
				if (!aValid.includes(state)) {throw zErrInvalid +'expected '+ aValid.join(', ') +': got '+ state}
				accrue(k, state)
			}).catch(err => {
				if (isGecko) {log_error(7, METRIC +'_'+ k, err)} // don't log nonGecko
				accrue(k, zErr)
			})
		} catch(e) {
			if (isGecko) {log_error(7, METRIC +'_'+ k, e)} // don't log nonGecko
			accrue(k, zErr)
		}
	}
	function exit() {
		// sort object
		for (const k of Object.keys(tmpData).sort()) {data[k] = tmpData[k]}
		let hash = mini(data)
		let notation = 'd417aea2' == hash ? default_green : default_red
		// record
		addBoth(7, METRIC, hash, addButton(7, METRIC), notation, data)
		return resolve()
	}
})

function get_pointer_event(event) {
	// ToDo: also look at radiusX/Y, screenX/Y, clientX/Y
	/* https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/28535#note_2906361
	RFP
	1 | true |  1 |  mouse |   0 |   0 | 0 | 0 | 0 | 1  c49e3f0d: desktop (no touch/pen)
	1 | true |  5 |  mouse | 0.5 |   0 | 0 | 0 | 0 | 1  098e0d22: mobile touch
	1 | true |  1 |  mouse |   0 |   0 | 0 | 0 | 0 | 1  c49e3f0d: laptop mouse
	1 | true |  1 |  mouse | 0.5 |   0 | 0 | 0 | 0 | 1  098e0d22: laptop touch
	1 | true |  2 |  mouse |   0 |   0 | 0 | 0 | 0 | 1  4b23f9ac: laptop pen
	*/

	if (window.PointerEvent === undefined) {
		dom.ptEvent.innerHTML = 'undefined'
		return
	}

	let oData = {}, oDisplay = []
	let oList = {
		isPrimary: 'boolean', // RFP true
		pressure: 'number', // RFP: 0 if not active, 0.5 if active
		mozPressure: 'number',
		pointerType: 'string', // RFP mouse
		mozInputSource: 'number', // mouse = 1, pen = 2, touch = 5
		tangentialPressure: 'number', // RFP 0
		tiltX: 'number', // RFP 0
		tiltY: 'number', // RFP 0
		twist: 'number', // RFP 0
		width: 'number', // RFP 1
		height: 'number', // RFP 1
		altitudeAngle: 'number',
		azimuthAngle: 'number',
	}
	for (const k of Object.keys(oList).sort()) {
		let value = event[k], expected = oList[k]
		if (typeFn(value) !== expected) {value = 'err'}
		oData[k] = value
		oDisplay.push(value)
	}
	dom.ptEvent.innerHTML = oDisplay.join(', ') //+ sg +'['+ mini(oData) +']'+ sc
}

function get_touc_h(METRIC) {
	// note: function name avoids "ouch" to avoid being picked up in window properties
	// the element keys and window properties are redundant but required for health/benign value checks
	// dom.w3c_touch_events.enabled: 0=disabled (macOS) 1=enabled 2=autodetect (linux/win/android)

	function get_maxTouchPoints(m) {
		// https://www.w3.org/TR/pointerevents/#extensions-to-the-navigator-interface
		// FF64+: RFP 1363508
		let value
		try {
			value = navigator[m]
			if (runST) {value = undefined} else if (runSI) {value = -5} else if (runSL) {addProxyLie('Navigator.'+ m)}
			let typeCheck = typeFn(value)
			if ('number' !== typeCheck) {throw zErrType + typeCheck}
			if (!Number.isInteger(value) || value < 0) {throw zErrInvalid + 'expected +Integer: got '+ value}
			if (isProxyLie('Navigator.'+ m)) {
				log_known(7, METRIC +'_'+ m, value)
				value = zLIE
			}
		} catch(e) {
			log_error(7, METRIC +'_'+ m, e)
			value = zErr
		}
		data[m] = value
	}

	function get_element_touch(m) {
		// domparser: 0.12ms | dom: 0.08 | just use domparser
		let value = []
		try {
			let parser = new DOMParser
			let doc = parser.parseFromString('<a>', "text/html")
			let target = doc.body.firstChild
			//let target = dom.tzpDiv // dom test
			for (const key in target) {if (key.includes('ouch')) {value.push(key)}}
			value.sort() // we already capture order in window properties
			if (0 == value.length) {value = 'none'}
			if (isGecko) {
				// gecko: ontouch only exists in android: desktop blocks these to avoid being identified as mobile
				let got = 'none' == value ? value : value.join(', ')
				if ('android' == isOS) {
					// android
					if ('30ea93d7' !== mini(value)) {
						let expected = ['ontouchcancel','ontouchend','ontouchmove','ontouchstart'] // ordered
						throw zErrInvalid +'expected '+ expected.join(', ') +': got '+ got
					}
				} else if ('none' !== value) {
					// desktop
					throw zErrInvalid +'expected none: got '+ got
				}
			}
		} catch(e) {
			log_error(7, METRIC +'_'+ m, e)
			value = zErr
		}
		data[m] = value
	}

	function get_window_touch(m) {
		// 0.4ms window | 1.2ms iframe
		let value
		try {
			let props = Object.getOwnPropertyNames(window)
			value = props.filter(x => x.includes('ouch'))
			value.sort() // we already capture order in window properties
			if (0 == value.length) {value = 'none'}
			if (isGecko) {
				let expected, got = 'none' == value ? value : value.join(', ')
				if ('mac' == isOS) {
					// mac doesn't have touch
					throw zErrInvalid +'expected none: got '+ got
				} else if ('android' == isOS) {
					// android
					if ('62482a70' !== mini(value)) {
						expected = ['Touch','TouchEvent','TouchList','ontouchcancel','ontouchend','ontouchmove','ontouchstart'] // ordered
						throw zErrInvalid +'expected '+ expected.join(', ') +': got '+ got
					}
				} else {
					// windows/linux: none or ['Touch','TouchEvent','TouchList']
					if ('none' !== value && 'a8d0e340' !== mini(value)) {
						expected = ['Touch','TouchEvent','TouchList']
						throw zErrInvalid +'expected none or '+ expected.join(', ') +': got '+ got
					}
				}
			}
		} catch(e) {
			log_error(7, METRIC +'_'+ m, e)
			value = zErr
		}
		data[m] = value
	}

	// do in alphabetical order
	let data = {}, notation = ''
	get_element_touch('element')
	get_maxTouchPoints('maxTouchPoints')
	get_window_touch('window')

	let hash = mini(data), btn = addButton(7, METRIC)
	// RFP
		// 1957658: FF143+, ESR140.2: 5 android, 10 windows, 0 mac and linux
		// 1980472: window touch properties: isBB via prefs, awaiting FF
	let rfpHashes = {
		'android': '725ba69f',
			/*
			{	"element": ['ontouchcancel','ontouchend','ontouchmove','ontouchstart'],
				"maxTouchPoints": 5,
				"window": ['Touch','TouchEvent','TouchList','ontouchcancel','ontouchend','ontouchmove','ontouchstart']
			}
			*/
		'linux': 'd539fa63', // {"element": "none", "maxTouchPoints": 0, "window": "none"}
		'mac': 'd539fa63',
		'windows': 'dee1c4c9', // {"element": "none", "maxTouchPoints": 10, "window": ['Touch','TouchEvent','TouchList']}
	}
	notation = rfpHashes[isOS] == hash ? rfp_green : rfp_red

	// non-BB: fails RFP but may match FPP
	if (isFPPFallback && undefined !== isOS && notation == rfp_red) {
		// FPP
			// 1977836 FF143: 0 or 1, everything else as 5
			// 1978414: ship touch points
		let fppHashes = {
			'android': ['725ba69f'], // everything + 5
			'mac': ['d539fa63'], // nothing
			'linux': ['d539fa63', '976cb3af', '7d4aea2b'], // 0,1,5
			'windows': ['d539fa63', '976cb3af', '7d4aea2b'], // same as linux
		}
		if (fppHashes[isOS].includes(hash)) {notation = fpp_green}
	}

	addBoth(7, METRIC, hash, btn, notation, data)
	return
}

const outputDevices = () => new Promise(resolve => {
	addBoth(7, 'recursion', isRecursion[0],'','', isRecursion[1])

	let METRIC = 'isExtended', value, data=''
	try {
		value = screen.isExtended
		if (runST) {value = 'true'}
		let typeCheck = typeFn(value)
		if ('boolean' !== typeCheck && 'undefined' !== typeCheck) {throw zErrType + typeCheck}
	} catch(e) {
		data = zErr; value = log_error(7, METRIC, e)
	}
	addBoth(7, METRIC, value,'','', data)

	Promise.all([
		get_media_devices('mediaDevices'),
		get_touc_h('touch'),
		get_device_integer('pixelDepth','Screen.'),
		get_device_integer('colorDepth','Screen.'),
		get_device_integer('hardwareConcurrency','Navigator.'),
		get_device_memory('deviceMemory'),
		get_device_posture('devicePosture'),
		get_permissions('permissions'),
		get_keyboard('keyboard'),
		get_battery('battery')
	]).then(function(){
		return resolve()
	})
})

countJS(7)
