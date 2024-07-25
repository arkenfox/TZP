'use strict';

function get_colors() {
	let t0 = nowFn()
	/* https://www.w3.org/TR/css-color-4/ */
	/* 95+: test_bug232227.html */
	// sorted lists
	let oList = {
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
			'-moz-buttonhoverface','-moz-buttonhovertext','-moz-cellhighlight','-moz-cellhighlighttext',
			'-moz-combobox','-moz-comboboxtext','-moz-dialog','-moz-dialogtext','-moz-eventreerow','-moz-field',
			'-moz-fieldtext','-moz-html-cellhighlight','-moz-html-cellhighlighttext','-moz-menubarhovertext',
			'-moz-menuhover','-moz-menuhovertext','-moz-oddtreerow',
		],
	}
	if (!isGecko) {
		delete oList.moz
		addBoth(14, 'colors_moz', zNA)
	} else if (isVer < 122) {
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
			// removed FF103
			'-moz-mac-vibrant-titlebar-dark','-moz-mac-vibrant-titlebar-light', 
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
		const element = dom.sColorElement
		const strColor = 'rgba(1, 2, 3, 0.5)'
		const METRIC = 'colors_'+ type

		let hash, btn ='', data = {}, notation = 'moz' == type ? rfp_red : ''
		try {
			if (runSE) {foo++}
			let aTemp = [], oTemp = {}, aList = oList[type]
			aList.forEach(function(style) {
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
				let check = '283089dc' // 122+
				if (isVer < 117) {check = '788e7d22' // 115-116
				} else if (isVer < 119) {check = '5a00aa84' // 117-118
				} else if (isVer < 121) {check = '47538602' // 119-120
				} else if (isVer < 122) {check = '651a1b85' // 121
				}
				notation = hash == check ? rfp_green : rfp_red
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
	let notation = isTB ? tb_red : '', isLies = false

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
					if (!isGecko) {data.sort()} // sort for blink
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
				if (isTB) {
					if ('mac' == isOS) {
						/* mac 1104 vs win 1102: mac has: MozOsxFontSmoothing, -moz-osx-font-smoothing */
						if ('75b00d93' == hash) {notation = tb_green} // TB 1104
					} else {
						/* win diff
						layout.css.font-variations.enabled = locked false on win 7
						fontOpticalSizing, font-optical-sizing, fontVariationSettings, font-variation-settings
						*/
						if (115 == isVer) {
							if ('e32d06bd' == hash) {notation = tb_green // TB/MB win11 + linux, TB android: 1102
							} else if ('e14684e7' == hash) {notation = tb_green} // TB/MB win7 1098
						} else if (128 == isVer) {
							if ('d86abd90' == hash) {notation = tb_green}
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
	let value, data =''
	if (!isGecko || isVer < 120) {
		value = zNA
	} else {
		try {
			let property = getComputedStyle(dom.link).textDecoration
			if (runST) {property = null} else if (runSI) {property = 'x'}
			let typeCheck = typeFn(property)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (!property.includes('rgb(')) {throw zErrInvalid +'got ' + property}
			value = 'underline' == property.slice(0,9) ? zE : zD
		} catch(e) {
			value = e; data = zErrLog
		}
	}
	addBoth(14, METRIC, value,'','', data)
	return
}

function get_mm_css() {
	// https://searchfox.org/mozilla-central/source/servo/components/style/gecko/media_features.rs#690

	// only notate from when the mediaquery is enabled by default _and_ rfp is applied
	const oTests = {
		// expected
		'prefers-reduced-motion': { // FF63+
			id: 'PRM', test: ['no-preference','reduce'], rfp: 'no-preference', rfpver: 1
		},
		'prefers-contrast': { // FF65+
			id: 'PC', test: ['no-preference','high','low'], rfp: 'no-preference', rfpver: 1
			// ^ 1506364: layout.css.prefers-contrast.enabled / browser.display.prefers_low_contrast
			// ^ 1656363^ enabled by default in FF101
		},
		'prefers-color-scheme': {// FF67+: 1494034
			id: 'PCS', test: ['light','dark'], rfp: 'light', rfpver: 1
			// ^ FF79+: 1643656: no-preference obsolete
		},
		'forced-colors': { // FF89+: 1659511
			id: 'FC', test: ['none','active'], rfpver: 1
		},
		// not expected
		'prefers-reduced-transparency': { // FF95+: 1736914
			id: 'PRT', test: ['no-preference','reduce'],
			// ^ layout.css.prefers-reduced-transparency.enabled
			// ^ 1822176: default disabled: 
		},
		'inverted-colors': { // FF114+
			id: 'IC', test: ['none','inverted'], rfp: 'none', rfpver: 999,
			// ^ 1794628: layout.css.inverted-colors.enabled (default disabled)
			// ^ ToDo: notation when pref flips: RFP = 'none'
		},
		'prefers-reduced-data': {
			id: 'PRD', test: ['no-preference','reduce'],
		}
	}
	for (const k of Object.keys(oTests)) {
		let value, data='', notation ='', cssnotation ='', aTest = oTests[k].test
		try {
			for (let i=0; i < aTest.length; i++) {
				if (window.matchMedia('('+ k +':'+ aTest[i] +')').matches) {value = aTest[i]; break}
			}
			if (isGecko) {
				// can only be a valid value or undefined
				if (runST) {value = undefined} else if (runSL) {
					if (value == undefined || value == aTest[1]) {value = aTest[0]} else {value = aTest[1]}
				}
			}
			if (undefined == value) {value = zNA} // not pref'ed on yet, match css 'n/a'
		} catch(e) {
			value = e; data = zErrShort
		}
		let cssdata = getElementProp(14, '#css'+ oTests[k].id, k +'_css')
		let isLies = (data !== zErrShort && cssdata !== zErr && value !== cssdata)
		let rfp = oTests[k].rfp
		if (rfp !== undefined && isVer >= oTests[k].rfpver) {
			notation = value == rfp ? rfp_green : rfp_red
			cssnotation = cssdata == rfp ? rfp_green : rfp_red
		}
		addBoth(14, k, value,'', notation, data, isLies)
		addBoth(14, k +'_css','','', cssnotation, cssdata)
	}
	return
}

const outputCSS = () => new Promise(resolve => {
	Promise.all([
		get_mm_css(),
		get_colors(),
		get_computed_styles('computed_styles'),
		get_link('underline_links')
	]).then(function(){
		return resolve()
	})
})

countJS(14)
