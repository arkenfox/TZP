'use strict';

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

function get_mm_color(METRIC) {
	let value, data ='', isLies = false
	let cssvalue = getElementProp(7, '#cssC', METRIC +'_css')

	try {
		value = (function() {for (let i=0; i < 1000; i++) {if (matchMedia('(color:'+ i +')').matches === true) {return i}}
			return i
		})()
		if (runSI) {value = 4.5} else if (runSL) {value = 3}
		let typeCheck = typeFn(value)
		if (!Number.isInteger(value)) {throw ('number' == typeCheck ? zErrInvalid +'expected Integer: got '+ value: zErrType + typeCheck)}
		// lies
		if (cssvalue !== zErr && value !== cssvalue) {isLies = true}
	} catch(e) {
		value = e; data = zErrShort
	}
	addBoth(7, METRIC, value,'', (8 == value ? rfp_green : rfp_red), data, isLies)
	addBoth(7, METRIC +'_css','','', (8 == cssvalue ? rfp_green : rfp_red), cssvalue)
	return
}

function get_mm_colorgamut(METRIC) {
	let value, data ='', isLies = false
	let cssvalue = getElementProp(7, '#cssCG', METRIC +'_css')
	try {
		let q = '(color-gamut: '
		if (window.matchMedia(q +'srgb)').matches) {value = 'srgb'}
		if (window.matchMedia(q +'p3)').matches) {value = 'p3'}
		if (window.matchMedia(q +'rec2020)').matches) {value = 'rec2020'}
		if (isGecko) { // can only be a valid value or undefined
			if (runST) {value = undefined} else if (runSL) {value = 'p3'}
		} else if (undefined == value) {value = zNA} // non-Gecko
		let typeCheck = typeFn(value)
		if ('string' !== typeCheck) {throw zErrType + typeCheck}
		if (cssvalue !== zErr && value !== cssvalue) {isLies = true}
	} catch(e) {
		value = e; data = zErrShort
	}
	addBoth(7, METRIC, value,'', ('srgb' == value ? rfp_green : rfp_red), data, isLies) // FF110+: 1422237
	addBoth(7, METRIC +'_css','','', ('srgb' == cssvalue ? rfp_green : rfp_red), cssvalue)
	return
}

function get_mm_pointer(group, type, id, rfpvalue) {
	const METRIC = type
	let value, data ='', notation ='', cssnotation ='', isLies = false
	try {
		if (group == 3) {
			if (window.matchMedia('('+ type +':hover)').matches) value = 'hover'
			if (window.matchMedia('('+ type +':none)').matches) value = 'none'
		} else {
			if (window.matchMedia('('+ type +':fine').matches) {value = 'fine' // fine over coarse
			} else if (window.matchMedia('('+ type +':coarse)').matches) {value = 'coarse'
			} else if (window.matchMedia('('+ type +':none)').matches) {value = 'none'}
			if (group == 2) {
				// https://www.w3.org/TR/mediaqueries-4/#any-input
					// 'any-pointer, more than one of the values can match' / none = only if the others are not present
				let value2 = zNA
				if (window.matchMedia('('+ type +':coarse').matches) {value2 = 'coarse' // coarse over fine
				} else if (window.matchMedia('('+ type +':fine)').matches) {value2 = 'fine'
				} else if (window.matchMedia('('+ type +':none)').matches) {value2 = 'none'}
				value += ' + '+ value2
			}
		}
		if (runST) {value = undefined} else if (runSL) {value = zNA}
		let typeCheck = typeFn(value)
		if ('string' !== typeCheck) {throw zErrType + typeCheck}
	} catch(e) {
		value = e; data = zErrShort
	}

	let cssvalue = getElementProp(7, id, METRIC +'_css')
	if (group == 2 && cssvalue !== zErr) {cssvalue = getElementProp(7, id, METRIC +'_css', ':before') + cssvalue}
	if (value !== zErrShort && cssvalue !== zErr) {isLies = (value !== cssvalue)}

	// notate: FF74+ 1607316
	if ('any-pointer' == type && 'android' !== isOS) {
		notation = ('fine + fine' == value ? rfp_green : rfp_red)
		cssnotation = ('fine + fine' == cssvalue ? rfp_green : rfp_red)
	} else if ('android' == isOS) {
		notation = (value == rfpvalue ? rfp_green : rfp_red)
		cssnotation = (cssvalue == rfpvalue ? rfp_green : rfp_red)
	}
	addBoth(7, METRIC, value,'', notation, data, isLies)
	addBoth(7, METRIC +'_css','','', cssnotation, cssvalue)
	return
}

const get_media_devices = (METRIC) => new Promise(resolve => {
	let t0 = nowFn()

	function set_notation(value ='') {
		// 1528042: FF115+ media.devices.enumerate.legacy.enabled
		let notation =''
		if (isTB) {
			// TB128: 9fc627cf : TypeError: navigator.mediaDevices is undefined
			// TB140: 98f4cd1a : TypeError: can't access property \"enumerateDevices\", navigator.mediaDevices is undefined (message fix)
			let errhash = mini(value)
			let expectedhash = isVer == 128 ? '9fc627cf' : '98f4cd1a'
			return expectedhash == errhash ? bb_green : bb_red
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
				let expected = 'webkit' == isEngine ? '[object InputDeviceInfo]' : '[object MediaDeviceInfo]'
				for (let i=0; i < aSplit.length; i++) {
					if (aSplit[i] !== expected ) {throw zErrInvalid +'expected '+ expected +': got '+ aSplit[i]}
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

const get_speech_engines = (METRIC) => new Promise(resolve => {
	// media.webspeech.synth.enabled
	let t0 = nowFn(), notation = rfp_red, isLies = false
	function exit(display, value) {
		addBoth(7, METRIC, display,'', notation, value, isLies)
		return resolve()
	}

	function populateVoiceList() {
		let res = [], ignoreLen, ignoreStr
		/* examples
			moz-tts:android:hr_HR
			urn:moz-tts:sapi:Microsoft David - English (United States)?en-US
			urn:moz-tts:osx:com.apple.eloquence.en-US.Eddy
		*/
		let oIgnore = {
			android: 'moz-tts:android:',
			mac: 'urn:moz-tts:osx:com.apple.eloquence.',
			windows: 'urn:moz-tts:sapi:',
		}
		if (oIgnore[isOS] !== undefined) {
			ignoreLen = oIgnore[isOS].length
			ignoreStr = oIgnore[isOS]
		}
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
					let uriStr = i.voiceURI, isURI = true
					if (ignoreStr !== undefined && uriStr.slice(0,ignoreLen) === ignoreStr) {isURI = false}
					res.push(
						i.name +' | '+ i.lang + (i.default ? ' | default' : '') + (i.localService ? '' : ' | false') + (isURI ? ' | '+ uriStr : '')
					)
				})
				let hash = mini(res)
				addBoth(7, METRIC, hash, addButton(7, METRIC, res.length), notation, res, isProxyLie('speechSynthesis.getVoices'))
				log_perf(7, METRIC, t0)
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
		get_speech_engines('speech_engines'),
		get_maxtouch('maxTouchPoints'),
		get_mm_pointer(1, 'pointer','#cssP','coarse'),
		get_mm_pointer(2, 'any-pointer','#cssAP','coarse + coarse'),
		get_mm_pointer(3, 'hover','#cssH','none'),
		get_mm_pointer(3, 'any-hover','#cssAH','none'),
		get_mm_color('color'),
		get_mm_colorgamut('color-gamut'),
		get_device_integer('pixelDepth','Screen.'),
		get_device_integer('colorDepth','Screen.'),
		get_device_integer('hardwareConcurrency','Navigator.'),
		get_permissions('permissions'),
		get_keyboard('keyboard'),
	]).then(function(){
		return resolve()
	})
})

countJS(7)
