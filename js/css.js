'use strict';

function get_colors() {
	let t0 = nowFn()
	/* https://www.w3.org/TR/css-color-4/ */
	let oList = {	// sorted
		css4: [
			'-moz-activehyperlinktext','-moz-default-color','-moz-default-background-color',
			'-moz-hyperlinktext','-moz-visitedhyperlinktext',
			'AccentColor','AccentColorText','ActiveText','ButtonBorder','ButtonFace','ButtonText',
			'Canvas','CanvasText','Field','FieldText','GrayText','Highlight','HighlightText','LinkText',
			'Mark','MarkText','SelectedItem','SelectedItemText','VisitedText',
		],
		deprecated: [
			'ActiveBorder','ActiveCaption','AppWorkspace','Background','ButtonHighlight','ButtonShadow',
			'CaptionText','InactiveBorder','InactiveCaption','InactiveCaptionText','InfoBackground',
			'InfoText','Menu','MenuText','Scrollbar','ThreeDDarkShadow','ThreeDFace','ThreeDHighlight',
			'ThreeDLightShadow','ThreeDShadow','Window','WindowFrame','WindowText',
		],
		moz: [
			'-moz-buttonhoverface','-moz-buttonhovertext', // both removed FF141: 1968925 ?
			'-moz-cellhighlight',
			'-moz-cellhighlighttext','-moz-combobox','-moz-comboboxtext','-moz-dialog','-moz-dialogtext',
			'-moz-eventreerow', // removed FF140: 1965343 ?
			'-moz-field','-moz-fieldtext','-moz-html-cellhighlight','-moz-html-cellhighlighttext',
			'-moz-menubarhovertext','-moz-menuhover','-moz-menuhovertext','-moz-oddtreerow',
		],
	}
	if (!isGecko) {
		delete oList.moz
		addBoth(14,'colors_moz', zNA)
	} else if (isVer < 128) { // use 128 as soon we'll only go as low as "127 or lower"
		let aTmp = oList.moz
		aTmp.push (
			// removed FF122: 1867854
			'-moz-mac-defaultbuttontext','-moz-mac-disabledtoolbartext', '-moz-mac-focusring','-moz-nativehyperlinktext', 
			// removed FF121: 1863691
			'-moz-mac-active-menuitem','-moz-mac-active-source-list-selection','-moz-mac-menuitem',
			'-moz-mac-menupopup','-moz-mac-source-list','-moz-mac-source-list-selection','-moz-mac-tooltip',
			// removed FF119: 1857695
			'-moz-mac-menutextdisable','-moz-mac-menutextselect',
			// removed FF117
			'-moz-buttondefault','-moz-dragtargetzone','-moz-mac-chrome-active','-moz-mac-chrome-inactive',
			'-moz-mac-menuselect','-moz-mac-menushadow','-moz-mac-secondaryhighlight','-moz-menubartext',
			'-moz-win-communicationstext','-moz-win-mediatext',
		)
		oList.moz = aTmp.sort()
	}

	function rgba2hex(orig) {
		var a, isPercent,
			rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
			alpha = (rgb && rgb[4] || '').trim(),
			hex = rgb ?
			(rgb[1] | 1 << 8).toString(16).slice(1) +
			(rgb[2] | 1 << 8).toString(16).slice(1) +
			(rgb[3] | 1 << 8).toString(16).slice(1) : orig;
		if (alpha !== '') {a = alpha} else {a = 0o1}
		// multiply before convert to HEX
		a = ((a * 255) | 1 << 8).toString(16).slice(1)
		hex = hex + a
		return hex +' '+ rgb[1] +'-'+ rgb[2] +'-'+ rgb[3]
	}

	for (const type of Object.keys(oList)) {
		const element = dom.tzpColor
		const strColor = 'rgba(1, 2, 3, 0.5)'
		const METRIC = 'colors_'+ type

		let hash, btn ='', data = {}, notation = 'moz' == type ? rfp_red : ''
		try {
			if (runSE) {foo++}
			let aTemp = [], oTemp = {}, aList = oList[type]
			aList.forEach(function(style){
				element.style.backgroundColor = strColor // reset color
				element.style.backgroundColor = style
				let rgb = window.getComputedStyle(element, null).getPropertyValue('background-color')
				if (rgb !== strColor) { // drop obsolete
					aTemp.push(style +':'+ rgb)
					if (oTemp[rgb] == undefined) {oTemp[rgb] = [style]} else {oTemp[rgb].push(style)}
				}
			})
			let tmpobj = {}, count = 0
			for (const k of Object.keys(oTemp)) {tmpobj[rgba2hex(k)] = oTemp[k]} // rgba2hex
			for (const k of Object.keys(tmpobj).sort()) {data[k] = tmpobj[k]; count += data[k].length} // sort/count
			hash = mini(data); btn = addButton(14, METRIC, Object.keys(data).length +'/'+ count)
			if ('moz' == type) {
				let expectedhash = isVer == 140 ? 'c04857b2' : '2439d123' // FF140 + FF141+
				if (isVer < 140) {expectedhash = '283089dc'} // FF128-FF139 (smart min is 128)
				notation = expectedhash == hash ? rfp_green : rfp_red
			}
		} catch(e) {
			hash = e; data = zErrLog
		}
		addBoth(14, METRIC, hash, btn, notation, data)
	}
	log_perf(14, 'colors', t0)
	return
}

function get_computed_styles(METRIC) {
	/* https://github.com/abrahamjuliot/creepjs */
	let t0 = nowFn()
	const names = ['cssrulelist','domparser','getcomputed','htmlelement',]
	let aErr = [false, false, false, false]
	let aHashes = [], intHashes = [], oDisplay = {}
	let notation = isBB ? bb_red : '', isLies = false

	let styleVersion = type => {
		return new Promise(resolve => {
			// get CSSStyleDeclaration
			try {
				if (runSE) {foo++}
				let cssStyleDeclaration = (
					type == 0 ? document.styleSheets[0].cssRules[0].style :
					type == 1 ? ((new DOMParser).parseFromString('', 'text/html')).body.style :
					type == 2 ? getComputedStyle(document.body) :
					type == 3 ? document.body.style :
					undefined
				)
				if (!cssStyleDeclaration) {
					throw new TypeError('invalid argument string')
				}
				// get properties
				let prototype = Object.getPrototypeOf(cssStyleDeclaration),
					prototypeProperties = Object.getOwnPropertyNames(prototype),
					ownEnumerablePropertyNames = [],
					cssVar = /^--.*$/
				// chrome getComputedStyle prepends "-" to some webkit* keys which it doesn't do in the other methods
				if (type == 2 && 'blink' === isEngine) {cssVar = /^-.*$/}

				Object.keys(cssStyleDeclaration).forEach(key => {
					let numericKey = !isNaN(key),
						value = cssStyleDeclaration[key],
						customPropKey = cssVar.test(key),
						customPropValue = cssVar.test(value)
					if (numericKey && !customPropValue) {
						return ownEnumerablePropertyNames.push(value)
					} else if (!numericKey && !customPropKey) {
						return ownEnumerablePropertyNames.push(key)
					}
					return
				})
				// get properties in prototype chain (required only in chrome)
				let propertiesInPrototypeChain = {}
				let capitalize = str => str.charAt(0).toUpperCase() + str.slice(1),
					uncapitalize = str => str.charAt(0).toLowerCase() + str.slice(1),
					removeFirstChar = str => str.slice(1),
					caps = /[A-Z]/g
				ownEnumerablePropertyNames.forEach(key => {
					if (propertiesInPrototypeChain[key]) {
						return
					}
					// determine attribute type
					let isNamedAttribute = key.indexOf('-') > -1,
						isAliasAttribute = caps.test(key)
					// reduce key for computation
					let firstChar = key.charAt(0),
						isPrefixedName = isNamedAttribute && firstChar == '-',
						isCapitalizedAlias = isAliasAttribute && firstChar == firstChar.toUpperCase()
					key = (
						isPrefixedName ? removeFirstChar(key) :
						isCapitalizedAlias ? uncapitalize(key) :
						key
					)
					// find counterpart in CSSStyleDeclaration object or its prototype chain
					if (isNamedAttribute) {
						let aliasAttribute = key.split('-').map((word, index) => index == 0 ? word : capitalize(word)).join('')
						if (aliasAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[aliasAttribute] = true
						} else if (capitalize(aliasAttribute) in cssStyleDeclaration) {
							propertiesInPrototypeChain[capitalize(aliasAttribute)] = true
						}
					} else if (isAliasAttribute) {
						let namedAttribute = key.replace(caps, char => '-' + char.toLowerCase())
						if (namedAttribute in cssStyleDeclaration) {
							propertiesInPrototypeChain[namedAttribute] = true
						} else if (`-${namedAttribute}` in cssStyleDeclaration) {
							propertiesInPrototypeChain[`-${namedAttribute}`] = true
						}
					}
					return
				})
				// compile keys
				let keys = [
					...new Set([
						...prototypeProperties,
						...ownEnumerablePropertyNames,
						...Object.keys(propertiesInPrototypeChain)
					])
				]
				/* checks
				let moz = keys.filter(key => (/moz/i).test(key)).length,
					webkit = keys.filter(key => (/webkit/i).test(key)).length,
					prototypeName = ('' + prototype).match(/\[object (.+)\]/)[1]
				//*/
				// output
				return resolve({
					keys,
					//moz,
					//webkit,
					//prototypeName
				})
			} catch(e) {
				aErr[type] = true
				return resolve(log_error(14, METRIC +'_'+ names[type], e))
			}
		})
	}

	function display() {
		for (const k of Object.keys(oDisplay)) {addDisplay(14, k, oDisplay[k])}
		log_perf(14, METRIC, t0)
	}

	// run
	Promise.all([
		styleVersion(0),
		styleVersion(1),
		styleVersion(2),
		styleVersion(3),
	]).then(res => {
		// simulate
		/* different hashes: !isLies
		res[0] = res[1]; aErr[0] = false
		res[2]['keys'] = ['a','constructor']
		//*/
		//* different hashes: isLies
		//res[2]['keys'] = ['a']
		//*/
		/* some same hashes: constructor not last
		res[1]['keys'].push('a')
		res[2]['keys'].push('a')
		//*/
		/* various errors
		res[0] = {}; aErr[0] = false
		res[1] = {'keys': ['a','b']}
		res[2] = {'keys': 5}
		//*/
		//console.log(res)

		for (let i=0; i < res.length; i++) {
			let obj = res[i]
			let type = METRIC +'_'+ names[i]
			if (aErr[i]) {
				oDisplay[type] = obj // error already logged
			} else {
				try {
					if (runST) {if (i == 1) {obj = {keys: []}} else if (i == 2) {obj = {}} else {obj = null}}
					let typeCheck = typeFn(obj)
					if ('object' !== typeCheck) {throw zErrType + typeCheck}
					typeCheck = typeFn(obj.keys)
					if ('array' !== typeCheck) {throw zErrType + 'keys: '+ typeCheck}
					let data = obj.keys
					if ('blink' == isEngine) {data.sort()} // sort for blink
					let hash = mini(data)
					aHashes.push(hash)
					intHashes.push(i)
					oDisplay[type] = hash
					// last item s/be constructor: detects if items are added, not removed
					if (data[data.length-1] !== 'constructor') {isLies = true}
				} catch(e) {
					aErr[i] = true
					oDisplay[type] = log_error(14, type, e)
				}
			}
		}

		let hash, btn='', data =''
		if (aErr.every(x => x === true)) {
			// max errors
			hash = zErr
		} else {
			aHashes = aHashes.filter(function(item, position) {return aHashes.indexOf(item) === position})
			// same hashes
			if (aHashes.length === 1) {
				hash = aHashes[0], data = res[intHashes[0]]['keys']
				btn = addButton(14, METRIC, data.length)
				// notate
				if (isBB) {
					if (isVer == 128) {
						if ('mac' == isOS) {
							if ('9f958210' == hash) {notation = bb_green} // BB14 1106
						} else {
							if ('d86abd90' == hash) {notation = bb_green} // BB14 1101
						}
					} else if (isVer > 139) {
						if ('mac' == isOS) {
							/* mac has
								MozOsxFontSmoothing,-moz-osx-font-smoothing,
								WebkitFontSmoothing,-webkit-font-smoothing,webkitFontSmoothing
							*/
							if ('' == hash) {notation = bb_green} // BB15
						} else {
							// https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41347
								// some older (mostly unsupported) win10 and android <= 6 will lack
								// fontOpticalSizing, font-optical-sizing, fontVariationSettings, font-variation-settings
								// but I consider these out-of-scope
							if ('ed89a929' == hash) {notation = bb_green} // BB15 1122
						}
					}
				}
			} else {
				// mixed hashes
				hash = 'mixed'; isLies = true // gecko is never mixed
				// for the first of each unique hash add sDetail + update display
				let aDone = {}
				intHashes.forEach(function(item) {
					let name = METRIC +'_'+ names[item], hash = oDisplay[name]
					if (aDone[hash] == undefined) {
						aDone[hash] = name
						sDetail[isScope][name] = res[item]['keys']
						oDisplay[name] = hash + addButton(14, name, res[item]['keys'].length)
					}
				})
			}
		}
		addBoth(14, METRIC, hash, btn, notation, data, isLies)
		display()
		return
	}).catch(e => {
		addBoth(14, METRIC, e,'', notation, zErrLog)
		return
	})
}

function get_link(METRIC) {
	// FF120+ 1858397: layout.css.always_underline_links
	let value, data ='', notation = default_red
	if (!isGecko || isVer < 120) {
		value = zNA
	} else {
		try {
			let property = getComputedStyle(dom.tzpLink).textDecoration
			if (runST) {property = null} else if (runSI) {property = 'x'}
			let typeCheck = typeFn(property)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (!property.includes('rgb(')) {throw zErrInvalid +'got ' + property}
			value = 'underline' == property.slice(0,9) ? zE : zD
			if (zD == value) {notation = default_green}
		} catch(e) {
			value = e; data = zErrLog
		}
	}
	addBoth(14, METRIC, value,'', notation, data)
	return
}

function get_media_css(METRIC) {
	// https://drafts.csswg.org/mediaqueries-5/
	let oTmpData = {}, countFail = 0, countSuccess = 0

	function collect_data(metric, value, notation, data='', isLies = false) {
		//console.log(metric, '~'+value +'~', '~'+data+'~', notation)
		// data
		if (zErr == value) {isLies = false}
		oTmpData[metric] = isSmart && isLies ? zLIE : (data == '' ? value : data)
		// failures: we catch failures only on checked items
		if (rfp_red == notation) {countFail++} else if (rfp_green == notation) {countSuccess++}
		// display
		if (zLIE == oTmpData[metric]) {value = log_known(14, METRIC +'_'+ metric, value+'')} // color up + record lies
		addDisplay(14, METRIC +'_'+ metric, value,'', notation)
	}

	function get_mm_color(metric = 'color') {
		let value, isLies = false
		let cssvalue = getElementProp(14, '#cssC', METRIC +'_css')
		try {
			value = (function() {for (let i=0; i < 1000; i++) {if (matchMedia('(color:'+ i +')').matches === true) {return i}}
				return i
			})()
			if (runSE) {foo++} else if (runSI) {value = 4.5} else if (runSL) {value = 3}
			let typeCheck = typeFn(value)
			if (!Number.isInteger(value)) {throw ('number' == typeCheck ? zErrInvalid +'expected Integer: got '+ value: zErrType + typeCheck)}
			// lies
			if (cssvalue !== zErr && value !== cssvalue) {isLies = true}
		} catch(e) {
			log_error(14, METRIC +'_'+ metric, e)
			value = zErr
		}
		let notation = (zErr !== value && !isLies && 8 == value) ? rfp_green : rfp_red
		collect_data(metric, value, notation, '', isLies)
		collect_data(metric +'_css', '', (8 == cssvalue ? rfp_green : rfp_red), cssvalue)
		return
	}

	function get_mm_css() {
		// https://searchfox.org/mozilla-central/source/servo/components/style/gecko/media_features.rs#660
		// only notate from when the mediaquery is enabled by default _and_ rfp is applied
		const np = 'no-preference'
		let oTests = {
		// expected
			'hover': {id: 'H', test: ['hover','none']},
			'any-hover': {id: 'AH', test: ['hover','none']},
			'prefers-reduced-motion': {id: 'PRM', test: [np,'reduce'], rfp: np, rfpver: 1}, // FF63+: 1478158
			'pointer': {id: 'P', test: ['fine','coarse', 'none']}, // FF64+
			'any-pointer': {id: 'AP', test: ['fine','coarse','none'], rfp: 'fine + FINE', rfpver: 1}, // FF64+
				// ^ any-pointer: DO NOT CHANGE ORDER
				// ^ this is our before value
				// ^ reverse #cssAP:after order in css because we break on first match but css takes the final value
			'prefers-contrast': {id: 'PC', test: [np,'less','more','custom'], rfp: np, rfpver: 1}, // FF101+: 1656363
			'prefers-color-scheme': {id: 'PCS', test: ['light','dark'], rfp: 'light', rfpver: 1}, // FF67+: 1494034 | and see 1643656
			'forced-colors': {id: 'FC', test: ['none','active']}, // FF89+: 1659511
			'dynamic-range': {id: 'DR', test: ['standard','high']}, // FF100+
			'video-dynamic-range': {id: 'VDR', test: ['standard','high'], rfp: 'standard', rfpver: 1}, // FF100+
			'color-gamut': {id: 'CG', test: ['srgb','p3','rec2020'], rfp: 'srgb', rfpver: 1}, // FF110+: 1422237
		// not enabled yet
			'prefers-reduced-transparency': {id: 'PRT', test: [np,'reduce'], rfp: np, rfpver: 999}, // FF113+: 1736914
				// layout.css.prefers-reduced-transparency.enabled: 1822176: issue to enable it
			'inverted-colors': {id: 'IC', test: ['none','inverted'], rfp: 'none', rfpver: 999}, // FF114+
				// 1794628: layout.css.inverted-colors.enabled
			'prefers-reduced-data': {id: 'PRD', test: [np,'reduce']},
		// matchmedia only: maybe collect for completeness' sake?
			// these are either expected values or not implemented yet
			/*
			'environment-blending': {id: '', test: ['opaque','additive','subtractive']},
			'grid': {id: '', test: ['0','1']}, // always 0?
			'nav-controls': {id: '', test: ['none','active']},
			'overflow-block': {id: '', test: ['none','scroll','paged']}, // always scroll?
			'overflow-inline': {id: '', test: ['none','scroll']}, //  always scroll?
			//'scan': {id: '', test: ['progressive','interlace']}, // noone supports this
			'scripting': {id: '', test: ['enabled','initial-only','none']},
			'update': {id: '', test: ['fast','slow','none']}, // always fast?
			'video-color-gamut': {id: '', test: ['srgb','p3','rec2020']},
			//*/
		}
		// ToDo: notation reduced-transparency | inverted-colors rfpver when feature enabled

		if ('android' == isOS) {
			oTests['hover']['rfp'] = 'none'; oTests['hover']['rfpver'] = 1
			oTests['any-hover']['rfp'] = 'none'; oTests['any-hover']['rfpver'] = 1
			oTests['pointer']['rfp'] = 'coarse'; oTests['pointer']['rfpver'] = 1
			oTests['any-pointer']['rfp'] = 'coarse + COARSE';
		}

		for (const metric of Object.keys(oTests)) {
			let isTest = '' == oTests[metric].id
			let id = '#css'+ oTests[metric].id
			let value = zNA // match css if not supported
			let notation ='', cssnotation ='', aTest = oTests[metric].test
			try {
				if (runSE) {foo++}
				for (let i=0; i < aTest.length; i++) {
					if (window.matchMedia('('+ metric +':'+ aTest[i] +')').matches) {value = aTest[i]; break}
				}
				if (isGecko) {
					// can only be a valid value or zNA
					if (runSL) {
						// run lies just pick the non true value from tests
						if (value == aTest[1]) {value = aTest[0]} else {value = aTest[1]}
					}
				}
				// same try catch so we don't concat errors
				if ('any-pointer' == metric) {
					//value = ' + '+ (value+'').toUpperCase()
debug.push('mm | before | ~'+ value +'~')
					// https://www.w3.org/TR/mediaqueries-4/#any-input
					// 'any-pointer, more than one of the values can match' / none = only if the others are not present
						// this is the after value | reverse #cssAP:before order in css because we break
					let value2 = zNA, miniTest = ['coarse','fine','none']
					for (let i=0; i < miniTest.length; i++) {
						console.log('checking', aTest[i])
						if (window.matchMedia('('+ metric +':'+ aTest[i] +')').matches) {value2 = aTest[i]; break}
					}
					value2 = ' + '+ value2.toUpperCase()
debug.push('mm | after | ~'+ value2 +'~')
					value = value + value2
debug.push('mm | combined | ~'+ value +'~')
				}
			} catch(e) {
				if(!isTest) {log_error(14, METRIC +'_'+ metric, e)}
				value = zErr
			}
			if (isTest) {
				//console.log(metric, value)
				oTmpData[metric] = value
			} else {
				let cssvalue = getElementProp(14, id, metric +'_css')
				// don't concat errors
				if ('any-pointer' == metric && cssvalue !== zErr) {
debug.push('css | after | ~'+ cssvalue +'~')
					// this is the 1st value - we use :before
					let cssvalue2 = getElementProp(14, id, metric +'_css', ':before')
debug.push('css | before | ~'+ cssvalue2 +'~')
					cssvalue = cssvalue2 == zErr ? zErr : cssvalue2 + cssvalue
debug.push('css | combined | ~'+ cssvalue +'~')
debug.push('match: ' + (value == cssvalue) )
				}
				let isLies = (value !== zErr && cssvalue !== zErr && value !== cssvalue)
				let rfp = oTests[metric].rfp
				if (rfp !== undefined && isVer >= oTests[metric].rfpver) {
					notation = value == rfp && !isLies ? rfp_green : rfp_red
					cssnotation = cssvalue == rfp ? rfp_green : rfp_red
				}
if ('any-pointer' == metric) {
debug.push('isLies: ' + isLies)
}

				/*
				1. css not loaded: 5 _css RFP fails || 11 _css errors (Invalid: got 'none')
				2. css not loaded + lies: no lies recorded because we need the css value to determie that
				3. just lies: 11 lies and rfp notation correct
				*/
				collect_data(metric, value, notation,'', isLies)
				collect_data(metric +'_css', '', cssnotation, cssvalue)
			}
		}
	}
	// go!
	let debug = []
	get_mm_color()
	get_mm_css()

	// lets test the old code
	function get_mm_pointer() {
		let type = 'any-pointer', id = '#cssAP'
		let value = zNA
		try {
			if (window.matchMedia('('+ type +':fine').matches) {value = 'fine' // fine over coarse
			} else if (window.matchMedia('('+ type +':coarse)').matches) {value = 'coarse'
			} else if (window.matchMedia('('+ type +':none)').matches) {value = 'none'}
			//value = ' + '+ (value+'').toUpperCase()
			debug.push('---')
			debug.push('mm | after | ~'+ value +'~')

			let value2 = zNA
			if (window.matchMedia('('+ type +':coarse').matches) {value2 = 'coarse' // coarse over fine
			} else if (window.matchMedia('('+ type +':fine)').matches) {value2 = 'fine'
			} else if (window.matchMedia('('+ type +':none)').matches) {value2 = 'none'}
			debug.push('mm | before | ~'+ value2 +'~')

			value += ' + '+ value2.toUpperCase() // original
			//value = value2 + value

			debug.push('mm | combined | ~'+ value +'~')
		} catch(e) {
			value = zErr
		}
		let cssvalue = getElementProp(7, id, METRIC +'_css')
		debug.push('css | after | ~'+ cssvalue +'~')
		let cssvalue2 = getElementProp(7, id, METRIC +'_css', ':before')
		debug.push('css | before | ~'+ cssvalue2 +'~')
		cssvalue = cssvalue2 + cssvalue
		debug.push('css | combined | ~'+ cssvalue +'~')
		debug.push('match: ' + (value == cssvalue) )
		let isLies = (value !== cssvalue)
		debug.push('isLies: ' + isLies)
	}
	get_mm_pointer()
	dom.perfS.innerHTML = debug.join('<br>')

	// sort into new object
	let data = {}
	for (const k of Object.keys(oTmpData).sort()) {data[k] = oTmpData[k]}
	// notation
	let strCounts = (0 == countFail ? sg : sb) +'['+ countSuccess +'/'+ (countSuccess + countFail) +']'+ sc
	let medianotation = (0 == countFail ? silent_rfp_green : silent_rfp_red)
	// add
	addBoth(14, METRIC, mini(data), addButton(14, METRIC), medianotation + strCounts, data)
}

const outputCSS = () => new Promise(resolve => {
	Promise.all([
		get_colors(),
		get_media_css('media'),
		get_computed_styles('computed_styles'),
		get_link('underline_links')
	]).then(function(){
		return resolve()
	})
})

countJS(14)
