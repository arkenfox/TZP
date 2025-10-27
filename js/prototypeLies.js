'use strict';

/*
https://github.com/abrahamjuliot/creepjs
- https://abrahamjuliot.github.io/creepjs/tests/prototype.html
- https://github.com/abrahamjuliot/creepjs/blob/master/docs/tests/prototype.js
*/

const outputPrototypeLies = (isResize = false) => new Promise(resolve => {
	if (isResize) {return resolve()}
	sData[SECT98] = {}
	sData[SECT99] = []
	if (!isProtoProxy) {return resolve()}
	let t0 = nowFn()

	const getIframe = () => {
		try {
			const numberOfIframes = window.length
			const frag = new DocumentFragment()
			const div = document.createElement('div')
			frag.appendChild(div)
			const ghost = () => `
				height: 100vh;
				width: 100vw;
				position: absolute;
				left:-10000px;
				visibility: hidden;
			`
			div.innerHTML = `<div style="${ghost()}"><iframe></iframe></div>`
			document.body.appendChild(frag)
			const iframeWindow = window[numberOfIframes]
			return {
				iframeWindow,
				div
			}
		} catch (error) {
			return {
				iframeWindow: window,
				div: undefined
			}
		}
	}
	const {
		iframeWindow,
		div: iframeContainerDiv
	} = getIframe()

	const getPrototypeLies = scope => {
		// engine
		const IS_BLINK = 'blink' == isEngine
		const IS_GECKO = isGecko
		const IS_WEBKIT = 'webkit' == isEngine

		const getRandomValues = () => (
			String.fromCharCode(Math.random() * 26 + 97) +
			Math.random().toString(36).slice(-7)
		)
		const randomId = getRandomValues()
		// Lie Tests
		// object constructor descriptor should return undefined properties
		const getUndefinedValueLie = (obj, name) => {
			const objName = obj.name
			const objNameUncapitalized = self[objName.charAt(0).toLowerCase() + objName.slice(1)]
			const hasInvalidValue = !!objNameUncapitalized && (
				typeof Object.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined' ||
				typeof Reflect.getOwnPropertyDescriptor(objNameUncapitalized, name) != 'undefined'
			)
			return hasInvalidValue
		}

		// accessing the property from the prototype should throw a TypeError
		const getIllegalTypeErrorLie = (obj, name) => {
			const proto = obj.prototype
			try {
				proto[name]
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError' ? true : false
			}
		}

		// calling the interface prototype on the function should throw a TypeError
		const getCallInterfaceTypeErrorLie = (apiFunction, proto) => {
			try {
				new apiFunction()
				apiFunction.call(proto)
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError'
			}
		}

		// applying the interface prototype on the function should throw a TypeError
		const getApplyInterfaceTypeErrorLie = (apiFunction, proto) => {
			try {
				new apiFunction()
				apiFunction.apply(proto)
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError'
			}
		}

		// creating a new instance of the function should throw a TypeError
		const getNewInstanceTypeErrorLie = apiFunction => {
			try {
				new apiFunction()
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError'
			}
		}

		// extending the function on a fake class should throw a TypeError and message "not a constructor"
		const getClassExtendsTypeErrorLie = apiFunction => {
			try {
				const shouldExitInSafari13 = (
					/version\/13/i.test((navigator || {}).userAgent) && IS_WEBKIT
				)
				if (shouldExitInSafari13) {
					return false
				}
				// begin tests
				class Fake extends apiFunction { }
				return true
			} catch (error) {
				// Native has TypeError and 'not a constructor' message in FF & Chrome
				return (
					error.constructor.name != 'TypeError' ||
					!/not a constructor/i.test(error.message)
				)
			}
		}

		// setting prototype to null and converting to a string should throw a TypeError
		const getNullConversionTypeErrorLie = apiFunction => {
			const nativeProto = Object.getPrototypeOf(apiFunction)
			try {
				Object.setPrototypeOf(apiFunction, null) + ''
				return true
			} catch (error) {
				return error.constructor.name != 'TypeError'
			} finally {
				// restore proto
				Object.setPrototypeOf(apiFunction, nativeProto)
			}
		}

		// toString() and toString.toString() should return a native string in all frames
		const getToStringLie = (apiFunction, name, scope) => {
			/*
			Accepted strings:
			'function name() { [native code] }'
			'function name() {\n    [native code]\n}'
			'function get name() { [native code] }'
			'function get name() {\n    [native code]\n}'
			'function () { [native code] }'
			`function () {\n    [native code]\n}`
			*/
			let scopeToString, scopeToStringToString
			try {
				scopeToString = scope.Function.prototype.toString.call(apiFunction)
			} catch (e) { }
			try {
				scopeToStringToString = scope.Function.prototype.toString.call(apiFunction.toString)
			} catch (e) { }

			const apiFunctionToString = (
				scopeToString ?
					scopeToString :
						apiFunction.toString()
			)
			const apiFunctionToStringToString = (
				scopeToStringToString ?
					scopeToStringToString :
						apiFunction.toString.toString()
			)
			const trust = name => ({
				[`function ${name}() { [native code] }`]: true,
				[`function get ${name}() { [native code] }`]: true,
				[`function () { [native code] }`]: true,
				[`function ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
				[`function get ${name}() {${'\n'}    [native code]${'\n'}}`]: true,
				[`function () {${'\n'}    [native code]${'\n'}}`]: true
			})
			return (
				!trust(name)[apiFunctionToString] ||
				!trust('toString')[apiFunctionToStringToString]
			)
		}

		// "prototype" in function should not exist
		const getPrototypeInFunctionLie = apiFunction => 'prototype' in apiFunction

		// "arguments", "caller", "prototype", "toString" should not exist in descriptor
		const getDescriptorLie = apiFunction => {
			const hasInvalidDescriptor = (
				Object.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
				Reflect.getOwnPropertyDescriptor(apiFunction, 'arguments') ||
				Object.getOwnPropertyDescriptor(apiFunction, 'caller') ||
				Reflect.getOwnPropertyDescriptor(apiFunction, 'caller') ||
				Object.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
				Reflect.getOwnPropertyDescriptor(apiFunction, 'prototype') ||
				Object.getOwnPropertyDescriptor(apiFunction, 'toString') ||
				Reflect.getOwnPropertyDescriptor(apiFunction, 'toString')
			)
			return hasInvalidDescriptor
		}

		// "arguments", "caller", "prototype", "toString" should not exist as own property
		const getOwnPropertyLie = apiFunction => {
			const hasInvalidOwnProperty = (
				apiFunction.hasOwnProperty('arguments') ||
				apiFunction.hasOwnProperty('caller') ||
				apiFunction.hasOwnProperty('prototype') ||
				apiFunction.hasOwnProperty('toString')
			)
			return hasInvalidOwnProperty
		}

		// descriptor keys should only contain "name" and "length"
		const getDescriptorKeysLie = apiFunction => {
			const descriptorKeys = Object.keys(Object.getOwnPropertyDescriptors(apiFunction))
			const hasInvalidKeys = '' + descriptorKeys != 'length,name' && '' + descriptorKeys != 'name,length'
			return hasInvalidKeys
		}

		// own property names should only contain "name" and "length"
		const getOwnPropertyNamesLie = apiFunction => {
			const ownPropertyNames = Object.getOwnPropertyNames(apiFunction)
			const hasInvalidNames = !(
				'' + ownPropertyNames == 'length,name' ||
				'' + ownPropertyNames == 'name,length'
			)
			return hasInvalidNames
		}

		// own keys names should only contain "name" and "length"
		const getOwnKeysLie = apiFunction => {
			const ownKeys = Reflect.ownKeys(apiFunction)
			const hasInvalidKeys = !(
				'' + ownKeys == 'length,name' ||
				'' + ownKeys == 'name,length'
			)
			return hasInvalidKeys
		}

		// calling toString() on an object created from the function should throw a TypeError
		const getNewObjectToStringTypeErrorLie = apiFunction => {
			try {
				const you = () => Object.create(apiFunction).toString()
				const cant = () => you()
				const hide = () => cant()
				hide()
				// error must throw
				return true
			} catch (error) {
				const stackLines = error.stack.split('\n')
				const validScope = !/at Object\.apply/.test(stackLines[1])
				// Stack must be valid
				const validStackSize = (
					error.constructor.name == 'TypeError' && stackLines.length >= 5
				)
				// Chromium must throw error 'at Function.toString'... and not 'at Object.apply'
				if (validStackSize && IS_BLINK && (
					!validScope ||
					!/at Function\.toString/.test(stackLines[1]) ||
					!/at you/.test(stackLines[2]) ||
					!/at cant/.test(stackLines[3]) ||
					!/at hide/.test(stackLines[4])
				)) {
					return true
				}
				return !validStackSize
			}
		}

		/* Proxy Detection */
		// arguments or caller should not throw 'incompatible Proxy' TypeError
		const tryIncompatibleProxy = fn => {
			try {
				fn()
				return true // failed to throw
			} catch (error) {
				return (
					error.constructor.name != 'TypeError' || (IS_GECKO && /incompatible\sProxy/.test(error.message))
				)
			}
		}
		const getIncompatibleProxyTypeErrorLie = apiFunction => {
			return (
				tryIncompatibleProxy(() => apiFunction.arguments) ||
				tryIncompatibleProxy(() => apiFunction.caller)
			)
		}
		const getToStringIncompatibleProxyTypeErrorLie = apiFunction => {
			return (
				tryIncompatibleProxy(() => apiFunction.toString.arguments) ||
				tryIncompatibleProxy(() => apiFunction.toString.caller)
			)
		}

		// checking proxy instanceof proxy should throw a valid TypeError
		const getInstanceofCheckLie = apiFunction => {
			const proxy = new Proxy(apiFunction, {})
			if (!IS_BLINK) {
				return false
			}
			const hasValidStack = (error, type = 'Function') => {
				const { message, name, stack } = error
				const validName = name == 'TypeError'
				const validMessage = message == `Function has non-object prototype 'undefined' in instanceof check`
				const targetStackLine = ((stack || '').split('\n') || [])[1]
				const validStackLine = (
					targetStackLine.startsWith(`    at ${type}.[Symbol.hasInstance]`) ||
					targetStackLine.startsWith('    at [Symbol.hasInstance]') // Chrome 102
				)
				return validName && validMessage && validStackLine
			}
			try {
				proxy instanceof proxy
				return true // failed to throw
			}
			catch (error) {
				// expect Proxy.[Symbol.hasInstance]
				if (!hasValidStack(error, 'Proxy')) {
					return true
				}
				try {
					apiFunction instanceof apiFunction
					return true // failed to throw
				}
				catch (error) {
					// expect Function.[Symbol.hasInstance]
					return !hasValidStack(error)
				}
			}
		}

		// defining properties should not throw an error
		const getDefinePropertiesLie = (apiFunction) => {
			if (!IS_BLINK) {
				return false // chrome only test
			}
			try {
				Object.defineProperty(apiFunction, '', { configurable: true })+''
				Reflect.deleteProperty(apiFunction, '')
				return false
			} catch (error) {
				return true // failed at Error
			}
		}

		// setPrototypeOf error tests
		const spawnError = (apiFunction, method) => {
			if (method == 'setPrototypeOf') {
				return Object.setPrototypeOf(apiFunction, Object.create(apiFunction)) + ''
			} else {
				apiFunction.__proto__ = apiFunction
				return apiFunction++
			}
		}
		const hasValidError = error => {
			const { name, message } = error
			const hasRangeError = name == 'RangeError'
			const hasInternalError = name == 'InternalError'
			const chromeLie = IS_BLINK && (
				message != `Maximum call stack size exceeded` || !hasRangeError
			)
			const firefoxLie = IS_GECKO && (
				message != `too much recursion` || !hasInternalError
			)
			return (hasRangeError || hasInternalError) && !(chromeLie || firefoxLie)
		}

		const getTooMuchRecursionLie = ({ apiFunction, method = 'setPrototypeOf' }) => {
			const nativeProto = Object.getPrototypeOf(apiFunction)
			const proxy = new Proxy(apiFunction, {})
			try {
				spawnError(proxy, method)
				return true // failed to throw
			} catch (error) {
				return !hasValidError(error)
			} finally {
				Object.setPrototypeOf(proxy, nativeProto) // restore
			}
		}

		const getChainCycleLie = ({ apiFunction, method = 'setPrototypeOf' }) => {
			const nativeProto = Object.getPrototypeOf(apiFunction)
			try {
				spawnError(apiFunction, method)
				return true // failed to throw
			} catch (error) {
				const { name, message, stack } = error
				const targetStackLine = ((stack || '').split('\n') || [])[1]
				const hasTypeError = name == 'TypeError'
				const chromeLie = IS_BLINK && (
					message != `Cyclic __proto__ value` || (
						method == '__proto__' && (
							!targetStackLine.startsWith(`    at Function.set __proto__ [as __proto__]`) &&
							!targetStackLine.startsWith(`    at set __proto__ [as __proto__]`) // Chrome 102
						)
					)
				)
				const firefoxLie = IS_GECKO && (
					message != `can't set prototype: it would cause a prototype chain cycle`
				)
				if (!hasTypeError || chromeLie || firefoxLie) {
					return true // failed Error
				}
			} finally {
				Object.setPrototypeOf(apiFunction, nativeProto) // restore
			}
		}

		const getReflectSetProtoLie = ({ apiFunction, randomId }) => {
			if (!randomId) {
				randomId = getRandomValues()
			}
			const nativeProto = Object.getPrototypeOf(apiFunction)
			try {
				if (Reflect.setPrototypeOf(apiFunction, Object.create(apiFunction))) {
					return true // failed value (expected false)
				} else {
					try {
						randomId in apiFunction
						return false
					} catch (error) {
						return true // failed at Error
					}
				}
			} catch (error) {
				return true // failed at Error
			} finally {
				Object.setPrototypeOf(apiFunction, nativeProto) // restore
			}
		}

		const getReflectSetProtoProxyLie = ({ apiFunction, randomId }) => {
			if (!randomId) {
				randomId = getRandomValues()
			}
			const nativeProto = Object.getPrototypeOf(apiFunction)
			const proxy = new Proxy(apiFunction, {})
			try {
				if (!Reflect.setPrototypeOf(proxy, Object.create(proxy))) {
					return true // failed value (expected true)
				} else {
					try {
						randomId in apiFunction
						return true // failed to throw
					} catch (error) {
						return !hasValidError(error)
					}
				}
			} catch (error) {
				return true // failed at Error
			} finally {
				Object.setPrototypeOf(proxy, nativeProto) // restore
			}
		}

		// API Function Test
		const getLies = ({ apiFunction, proto, obj = null, lieProps }) => {
			if ('function' != typeof apiFunction) {
				return {
					lied: false,
					lieTypes: []
				}
			}
			const name = apiFunction.name.replace(/get\s/, '')
			let lies = {
				// custom lie string names
				[`a: failed illegal error`]: obj ? getIllegalTypeErrorLie(obj, name) : false,
				[`b: failed undefined properties`]: obj ? getUndefinedValueLie(obj, name) : false,
				[`c: failed call interface error`]: getCallInterfaceTypeErrorLie(apiFunction, proto),
				[`d: failed apply interface error`]: getApplyInterfaceTypeErrorLie(apiFunction, proto),
				[`e: failed new instance error`]: getNewInstanceTypeErrorLie(apiFunction),
				[`f: failed class extends error`]: getClassExtendsTypeErrorLie(apiFunction),
				[`g: failed null conversion error`]: getNullConversionTypeErrorLie(apiFunction),
				[`h: failed toString`]: getToStringLie(apiFunction, name, scope),
				[`i: failed "prototype" in function`]: getPrototypeInFunctionLie(apiFunction),
				[`j: failed descriptor`]: getDescriptorLie(apiFunction),
				[`k: failed own property`]: getOwnPropertyLie(apiFunction),
				[`l: failed descriptor keys`]: getDescriptorKeysLie(apiFunction),
				[`m: failed own property names`]: getOwnPropertyNamesLie(apiFunction),
				[`n: failed own keys names`]: getOwnKeysLie(apiFunction),
				[`o: failed object toString error`]: getNewObjectToStringTypeErrorLie(apiFunction),
				// Proxy Detection
				[`p: failed at incompatible proxy error`]: getIncompatibleProxyTypeErrorLie(apiFunction),
				[`q: failed at toString incompatible proxy error`]: getToStringIncompatibleProxyTypeErrorLie(apiFunction),
				[`r: failed at too much recursion error`]: getChainCycleLie({ apiFunction })
			}
			// conditionally use advanced detection
			const detectProxies = (
				name == 'toString' || !!lieProps['Function.toString']
			)
			if (detectProxies) {
				lies = Object.assign(
					{},
					lies,
					// Advanced Proxy Detection
					{
						[`s: failed at too much recursion __proto__ error`]: getChainCycleLie({ apiFunction, method: '__proto__' }),
						[`t: failed at chain cycle error`]: getTooMuchRecursionLie({ apiFunction }),
						[`u: failed at chain cycle __proto__ error`]: getTooMuchRecursionLie({ apiFunction, method: '__proto__' }),
						[`v: failed at reflect set proto`]: getReflectSetProtoLie({ apiFunction, randomId }),
						[`w: failed at reflect set proto proxy`]: getReflectSetProtoProxyLie({ apiFunction, randomId }),
						[`x: failed at instanceof check error`]: getInstanceofCheckLie(apiFunction),
						[`y: failed at define properties`]: getDefinePropertiesLie(apiFunction)
					}
				)
			}
			const lieTypes = Object.keys(lies).filter(key => !!lies[key])
			return {
				lied: lieTypes.length,
				lieTypes
			}
		}

		// Lie Detector
		const createLieDetector = () => {
			const isSupported = obj => typeof obj != 'undefined' && !!obj
			const props = {} // lie list and detail
			let propsSearched = [] // list of properties searched
			return {
				getProps: () => props,
				getPropsSearched: () => propsSearched,
				searchLies: (fn, {
					target = [],
					ignore = []
				} = {}) => {
					let obj
					// check if api is blocked or not supported
					try {
						obj = fn()
						if (!isSupported(obj)) {
							return
						}
					} catch (error) {
						return
					}

					const interfaceObject = !!obj.prototype ? obj.prototype : obj
					;[...new Set([
						...Object.getOwnPropertyNames(interfaceObject),
						...Object.keys(interfaceObject) // backup
					])].sort().forEach(name => {
						const skip = (
							name == 'constructor' ||
							(target.length && !new Set(target).has(name)) ||
							(ignore.length && new Set(ignore).has(name))
						)
						if (skip) {
							return
						}
						const objectNameString = /\s(.+)\]/
						const apiName = `${
							obj.name ? obj.name : objectNameString.test(obj) ? objectNameString.exec(obj)[1] : undefined
							}.${name}`
						propsSearched.push(apiName)
						try {
							const proto = obj.prototype ? obj.prototype : obj
							let res // response from getLies

							// search if function
							try {
								const apiFunction = proto[name] // may trigger TypeError
								if ('function' == typeof apiFunction) {
									res = getLies({
										apiFunction: proto[name],
										proto,
										lieProps: props
									})
									if (res.lied) {
										return (props[apiName] = res.lieTypes)
									}
									return
								}
								// since there is no TypeError and the typeof is not a function,
								// handle invalid values and ignore name, length, and constants
								if (
									name != 'name' &&
									name != 'length' &&
									name[0] !== name[0].toUpperCase()) {
									const lie = [`z: failed descriptor.value undefined`]
									return (
										props[apiName] = lie
									)
								}
							} catch (error) { }
							// else search getter function
							const getterFunction = Object.getOwnPropertyDescriptor(proto, name).get
							res = getLies({
								apiFunction: getterFunction,
								proto,
								obj,
								lieProps: props
							}) // send the obj for special tests

							if (res.lied) {
								return (props[apiName] = res.lieTypes)
							}
							return
						} catch (error) {
							const lie = `aa: failed prototype test execution`
							return (
								props[apiName] = [lie]
							)
						}
					})
				}
			}
		}

		const lieDetector = createLieDetector()
		const {
			searchLies
		} = lieDetector

		// search lies: remove target to search all properties
		// test Function.toString first to determine the depth of the search
		searchLies(() => Function, {
			target: [
				'toString',
			],
			ignore: [
				'caller',
				'arguments'
			]
		})
		// other APIs
		searchLies(() => AnalyserNode)
		searchLies(() => AudioBuffer, {
			target: [
				'copyFromChannel',
				'getChannelData'
			]
		})
		searchLies(() => BiquadFilterNode, {
			target: [
				'getFrequencyResponse'
			]
		})
		searchLies(() => CanvasRenderingContext2D, {
			target: [
				'getImageData',
				'getLineDash',
				'isPointInPath',
				'isPointInStroke',
				'measureText',
				'quadraticCurveTo',
				'font'
			]
		})
		searchLies(() => CSSStyleDeclaration, {
			target: [
				'setProperty'
			]
		})
		searchLies(() => CSS2Properties, { // Gecko 143 or lower
			target: [
				'setProperty'
			]
		})
		searchLies(() => CSSStyleProperties, { // Gecko 144+
			target: [
				'setProperty'
			]
		})
		searchLies(() => Date, {
			target: [
				'getDate',
				'getDay',
				'getFullYear',
				'getHours',
				'getMinutes',
				'getMonth',
				'getTime',
				'getTimezoneOffset',
				'setDate',
				'setFullYear',
				'setHours',
				'setMilliseconds',
				'setMonth',
				'setSeconds',
				'setTime',
				'toDateString',
				'toJSON',
				'toLocaleDateString',
				'toLocaleString',
				'toLocaleTimeString',
				'toString',
				'toTimeString',
				'valueOf'
			]
		})
		searchLies(() => Intl.DateTimeFormat, {
			target: [
				'format',
				'formatRange',
				'formatToParts',
				'resolvedOptions'
			]
		})
		searchLies(() => Document, {
			target: [
				'createElement',
				'createElementNS',
				'getElementById',
				'getElementsByClassName',
				'getElementsByName',
				'getElementsByTagName',
				'getElementsByTagNameNS',
				'referrer',
				'styleSheets',
				'write',
				'writeln'
			],
			ignore: [
				// Firefox returns undefined on getIllegalTypeErrorLie test
				'onreadystatechange',
				'onmouseenter',
				'onmouseleave'
			]
		})
		searchLies(() => DOMRect)
		searchLies(() => DOMRectReadOnly)
		searchLies(() => Element, {
			target: [
				'append',
				'appendChild',
				'getBoundingClientRect',
				'getClientRects',
				'insertAdjacentElement',
				'insertAdjacentHTML',
				'insertAdjacentText',
				'insertBefore',
				'prepend',
				'replaceChild',
				'replaceWith',
				'setAttribute'
			]
		})
		searchLies(() => FontFace, {
			target: [
				'family',
				'load',
				'status'
			]
		})
		searchLies(() => HTMLCanvasElement)
		searchLies(() => HTMLElement, {
			target: [
				'clientHeight',
				'clientWidth',
				'offsetHeight',
				'offsetWidth',
				'scrollHeight',
				'scrollWidth'
			],
			ignore: [
				// Firefox returns undefined on getIllegalTypeErrorLie test
				'onmouseenter',
				'onmouseleave'
			]
		})
		searchLies(() => HTMLIFrameElement, {
			target: [
				'contentDocument',
				'contentWindow',
			]
		})
		searchLies(() => IntersectionObserverEntry, {
			target: [
				'boundingClientRect',
				'intersectionRect',
				'rootBounds'
			]
		})
		searchLies(() => Math, {
			target: [
				'acos',
				'acosh',
				'asinh',
				'atan',
				'atan2',
				'atanh',
				'cbrt',
				'cos',
				'cosh',
				'exp',
				'expm1',
				'log',
				'log10',
				'log1p',
				'sin',
				'sinh',
				'sqrt',
				'tan',
				'tanh'
			]
		})
		searchLies(() => MediaDevices, {
			target: [
				'enumerateDevices',
				'getDisplayMedia',
				'getUserMedia'
			]
		})
		searchLies(() => Navigator, {
			target: [
				'appCodeName',
				'appName',
				'appVersion',
				'buildID',
				'connection',
				'deviceMemory',
				'getBattery',
				'getGamepads',
				'getVRDisplays',
				'globalPrivacyControl',
				'hardwareConcurrency',
				'language',
				'languages',
				'maxTouchPoints',
				'mimeTypes',
				'oscpu',
				'pdfViewerEnabled',
				'platform',
				'plugins',
				'product',
				'productSub',
				'sendBeacon',
				'serviceWorker',
				'userAgent',
				'userAgentData',
				'vendor',
				'vendorSub',
				'webdriver',
			]
		})
		searchLies(() => Node, {
			target: [
				'appendChild',
				'insertBefore',
				'replaceChild'
			]
		})
		searchLies(() => OffscreenCanvas, {
			target: [
				'convertToBlob',
				'getContext'
			]
		})
		searchLies(() => OffscreenCanvasRenderingContext2D, {
			target: [
				'getImageData',
				'getLineDash',
				'isPointInPath',
				'isPointInStroke',
				'measureText',
				'quadraticCurveTo',
				'font'
			]
		})
		searchLies(() => Range, {
			target: [
				'getBoundingClientRect',
				'getClientRects',
			]
		})
		searchLies(() => Intl.RelativeTimeFormat, {
			target: [
				'resolvedOptions'
			]
		})
		searchLies(() => Screen)
		searchLies(() => speechSynthesis, {
			target: [
				'getVoices'
			]
		})
		searchLies(() => StorageManager, {
			target: [
				'estimate',
			]
		})
		searchLies(() => String, {
			target: [
				'fromCodePoint'
			]
		})
		searchLies(() => SVGRect)
		searchLies(() => TextMetrics)
		searchLies(() => WebGLRenderingContext, {
			target: [
				'bufferData',
				'getParameter',
				'readPixels'
			]
		})
		searchLies(() => WebGL2RenderingContext, {
			target: [
				'bufferData',
				'getParameter',
				'readPixels'
			]
		})
		/* potential targets:
			RTCPeerConnection
			Plugin
			PluginArray
			MimeType
			MimeTypeArray
			Worker
			History
		*/

		// disregard Function.prototype.toString lies to filter direct API tampering
		const getCountOfNonFunctionToStringLies = x => !x ? x : x.filter(x => !/o:|q:/.test(x)).length

		// return lies list and detail
		const props = lieDetector.getProps()
		const propsSearched = lieDetector.getPropsSearched()
		return {
			lieList: Object.keys(props).sort(),
			lieDetail: props,
			lieCount: Object.keys(props).reduce((acc, key) => acc + props[key].length, 0),
			propsSearched,
			// filter out lies on Function.prototype.toString
			tamperingList: (props => {
				return Object.keys(props).filter(key => {
					const totalTamperingLies = getCountOfNonFunctionToStringLies(props[key])
					if (!totalTamperingLies) {
						return false
					}
					return true
				})
			})(props)
		}
	}

	// start
	const {
		lieList,
		lieDetail,
		lieCount,
		propsSearched,
		tamperingList
	} = getPrototypeLies(iframeWindow) // execute and destructure the list and detail
	if (iframeContainerDiv) {
		iframeContainerDiv.parentNode.removeChild(iframeContainerDiv)
	}

	// navigator
		// prototype items that are not navigator
		// this is lie 'b: failed undefined properties'? but here we cover all navigator keys
	try {
		let aNav = []
		for (const key in navigator) {aNav.push(key)}
		let aProto = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		aProto = aProto.filter(x => !['constructor'].includes(x)) // ignore constructor
		let aNotInNav = aProto.filter(x => !aNav.includes(x)) // 
		//let aNotInProto = aNav.filter(x => !aProto.includes(x)) // this would catch made up shit?
		//console.log(aNav, aProto, aNotInNav, aNotInProto)
		aNotInNav.forEach(function(item) {
			item = 'Navigator.'+ item
			if (lieDetail[item] == undefined) {lieDetail[item] = []}
			lieDetail[item].push('zz: failed getOwnPropertyDescriptors')
			if (!tamperingList.includes(item)) {tamperingList.push(item)}
		})
	} catch(e) {console.log(e)}

	// sData
	sData[SECT98] = {}
	for (const k of Object.keys(lieDetail).sort()) {sData[SECT98][k] = lieDetail[k]}
	sData[SECT99] = tamperingList.sort()
	if (!gRun) {return resolve()}

	// gData
	gData[SECT99] = sData[SECT99]
	gData[SECT98] = {}
	if (Object.keys(sData[SECT98]).length) {
		let newObj = {}
		for (const k of Object.keys(sData[SECT98])) {newObj[k] = sData[SECT98][k]}
		gData[SECT98] = newObj
	}
	gData[SECT97] = propsSearched.sort()

	log_perf(SECTP, SECT98 +"/"+ SECT99, t0)
	return resolve()
})

countJS(SECTP)
