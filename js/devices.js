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
					let isTime = 'Time' == k.slice(-4)
					let isTimeCheck = ('number' == typeCheck && isTime)
					if (typeCheck !== typeExpected) {
						let isThrow = true
						if (isTimeCheck) {isThrow = false}
						if (isThrow) {throw zErrType + k +': '+ typeCheck}
					}
					// validity
					if (isTimeCheck) {
						if (!Number.isInteger(x) || x < 0) {throw zErrInvalid + k + ': expected a positive integer: got '+ x}
					} else if ('level' == k) {
						if (x < 0 || x > 1) {throw zErrInvalid + k + ': expected 0 to 1: got '+ x}
					}
					if (isTime) {aTimes.push(x)}
					// record values
					if (Infinity == x) (x += '')
					data[k] = x
				}

				let aParts = [data.charging]
				aParts.push('Infinity' == data.chargingTime ? 'Infinity' : (0 == data.chargingTime ? 0 : '!0'))
				aParts.push('Infinity' == data.dischargingTime ? 'Infinity' : (0 == data.dischargingTime ? 0 : '!0'))
				aParts.push(Number.isInteger(data.level) ? data.level : '!Integer')
				let str = aParts.join(', ')
				let hash = mini(aParts)

				//                desktop no battery:  true,        0, Infinity, 1
				// mobile not 100% not being charged: false, Infinity,      > 0, non-integer
				// mobile not 100%     being charged:  true,      > 0, Infinity, non-integer
				// mobile     100% not being charged: false, Infinity,      > 0, 1
				// mobile     100%     being charged:  true,        0, Infinity, 1 (same as desktop)

				// note: change of charging state in chrome session, we can get 2 x Infinity
					// so the *Times are not reliable indicators as to what's going on
				// has battery exists if the level is less than 1 || charging is false || 2 x Infinity
					// this should be enough
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
		// capped at 16 dom.maxHardwareConcurrency e.g 1728741
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
	let value, data =''
	try {
		value = navigator.devicePosture
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
			let aValid = ['continuous','folder']
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

function get_maxtouch(METRIC) {
	// https://www.w3.org/TR/pointerevents/#extensions-to-the-navigator-interface
	// FF64+: RFP 1363508
	let value, data =''
	try {
		value = navigator[METRIC]
		if (runST) {value = undefined} else if (runSI) {value = -5} else if (runSL) {addProxyLie('Navigator.'+ METRIC)}
		let typeCheck = typeFn(value)
		if ('number' !== typeCheck) {throw zErrType + typeCheck}
		if (!Number.isInteger(value) || value < 0) {throw zErrInvalid + 'expected +Integer: got '+ value}
	} catch(e) {
		value = e; data = zErrLog
	}
	// 1826051: FF132+ 10 except mac
	// 1957658: FF139+ ?
	let rfpvalue = (isVer > 131 && 'mac' !== isOS) ? 10 : 0
	addBoth(7, METRIC, value,'', (rfpvalue == value ? rfp_green : rfp_red), data, isProxyLie('Navigator.'+ METRIC))
	return
}

const get_media_devices = (METRIC) => new Promise(resolve => {
	let t0 = nowFn()

	function set_notation(value ='') {
		// 1528042: FF115+ media.devices.enumerate.legacy.enabled
		let notation =''
		if (isTB) {
			notation = 'undefined' == value ? bb_green : bb_red
		} else {
			let rfplegacy = '54a59537', rfpnew = '75e77887'
			if (isMB) {
				// tor-browser#42043
				notation = value == rfpnew ? bb_green : bb_red
			} else if (isVer > 131) {
				// 1916993: FF132+ default false
				notation = value == rfpnew ? rfp_green : rfp_red
			} else {
				notation = (value == rfplegacy ? sgtick : sbx) + ' RFP gUM legacy]' + sc
			}
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
		// so far all follow the same allowed values
		let aGood = ['denied','granted','prompt']
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
				if (!aGood.includes(state)) {throw zErrInvalid +'expected '+ aGood.join(', ') +': got '+ state}
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
		let hash = mini(data), isGreen = false
		if (isGecko) {
			// add notation: both TB/FF are identical
			if (isVer < 132 && 'd34d3764' == hash) {isGreen = true
			} else if (isVer > 131 && 'd417aea2' == hash) {isGreen = true // FF132+: camera + microphone added
			}
		}
		let notation = isGreen ? default_green : default_red
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
		get_maxtouch('maxTouchPoints'),
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
