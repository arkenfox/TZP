'use strict';

function get_colors() {
	let t0 = nowFn()
	/* https://www.w3.org/TR/css-color-4/ */
	/* 95+: test_bug232227.html */
	// sorted lists
	let oList = {
		"css4": [
			'-moz-activehyperlinktext','-moz-default-color','-moz-default-background-color',
			'-moz-hyperlinktext','-moz-visitedhyperlinktext',
			'AccentColor','AccentColorText','ActiveText','ButtonBorder','ButtonFace','ButtonText',
			'Canvas','CanvasText','Field','FieldText','GrayText','Highlight','HighlightText','LinkText',
			'Mark','MarkText','SelectedItem','SelectedItemText','VisitedText',
		],
		"deprecated": [
			'ActiveBorder','ActiveCaption','AppWorkspace','Background','ButtonHighlight','ButtonShadow',
			'CaptionText','InactiveBorder','InactiveCaption','InactiveCaptionText','InfoBackground',
			'InfoText','Menu','MenuText','Scrollbar','ThreeDDarkShadow','ThreeDFace','ThreeDHighlight',
			'ThreeDLightShadow','ThreeDShadow','Window','WindowFrame','WindowText',
		],
		"moz": [
			'-moz-buttonhoverface','-moz-buttonhovertext','-moz-cellhighlight','-moz-cellhighlighttext',
			'-moz-combobox','-moz-comboboxtext','-moz-dialog','-moz-dialogtext','-moz-eventreerow','-moz-field',
			'-moz-fieldtext','-moz-html-cellhighlight','-moz-html-cellhighlighttext','-moz-menubarhovertext',
			'-moz-menuhover','-moz-menuhovertext','-moz-oddtreerow',
		],
	}
	if (isVer < 122) {
		let aTmp = oList["moz"]
		aTmp.push (
			// removed FF122: 1867854
			'-moz-mac-defaultbuttontext','-moz-mac-disabledtoolbartext', '-moz-mac-focusring','-moz-nativehyperlinktext', 
			// removed FF121: 1863691
			'-moz-mac-active-menuitem','-moz-mac-active-source-list-selection','-moz-mac-menuitem',
			'-moz-mac-menupopup','-moz-mac-source-list','-moz-mac-source-list-selection','-moz-mac-tooltip',
			// removed FF119: 1857695
			'-moz-mac-menutextdisable','-moz-mac-menutextselect',
			// removed FF117
			"-moz-buttondefault","-moz-dragtargetzone","-moz-mac-chrome-active","-moz-mac-chrome-inactive",
			"-moz-mac-menuselect","-moz-mac-menushadow","-moz-mac-secondaryhighlight","-moz-menubartext",
			"-moz-win-communicationstext","-moz-win-mediatext",
			// removed FF103
			'-moz-mac-vibrant-titlebar-dark','-moz-mac-vibrant-titlebar-light', 
		)
		oList["moz"] = aTmp.sort()
	}

	function rgba2hex(orig) {
		var a, isPercent,
			rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
			alpha = (rgb && rgb[4] || "").trim(),
			hex = rgb ?
			(rgb[1] | 1 << 8).toString(16).slice(1) +
			(rgb[2] | 1 << 8).toString(16).slice(1) +
			(rgb[3] | 1 << 8).toString(16).slice(1) : orig;
		if (alpha !== "") {a = alpha} else {a = 0o1}
		// multiply before convert to HEX
		a = ((a * 255) | 1 << 8).toString(16).slice(1)
		hex = hex + a
		return hex + " "+ rgb[1] +"-"+ rgb[2] +"-"+ rgb[3]
	}

	let notation = ""
	try {
		const element = dom.sColorElement
		const strColor = "rgba(1, 2, 3, 0.5)"
		for (const type of Object.keys(oList)) {
			const METRIC = "colors_"+ type
			try {
				if (runSE) {foo++}
				let aTemp = []
				let oTemp = {}
				let aList = oList[type]
				aList.forEach(function(style) {
					element.style.backgroundColor = strColor // reset color
					element.style.backgroundColor = style
					let rgb = window.getComputedStyle(element, null).getPropertyValue("background-color")
					if (rgb !== strColor) { // drop obsolete
						aTemp.push(style +":"+ rgb)
						if (oTemp[rgb] == undefined) {oTemp[rgb] = [style]} else {oTemp[rgb].push(style)}
					}
				})
				let tmpobj = {}, newobj = {}, count = 0
				for (const k of Object.keys(oTemp)) {tmpobj[rgba2hex(k)] = oTemp[k]} // rgba2hex
				for (const k of Object.keys(tmpobj).sort()) {newobj[k] = tmpobj[k]; count += newobj[k].length} // sort/count
				let hash = mini(newobj)
				let btn = addButton(14, METRIC, Object.keys(newobj).length +"/"+ count)
				addData(14, METRIC, newobj, hash)
				if (isSmart && type == "moz") {
					let check = "283089dc" // 122+
					if (isVer < 117) {check = "788e7d22" // 115-116
					} else if (isVer < 119) {check = "5a00aa84" // 117-118
					} else if (isVer < 121) {check = "47538602" // 119-120
					} else if (isVer < 122) {check = "651a1b85" // 121
					}
					notation = hash == check ? rfp_green : rfp_red
				}
				log_display(14, METRIC, hash + btn + notation)
			} catch(e) {
				if (isSmart && type == "moz") {notation = rfp_red}
				log_display(14, METRIC, log_error(SECT14, METRIC, e) + notation)
				addData(14, METRIC, zErr)
			}
		}
		log_perf(SECT14, "colors", t0)
		return
	} catch(e) {
		let aResults = []
		for (const type of Object.keys(oList)) {
			let eMsg = log_error(SECT14, "colors_"+ type, e)
			if (isSmart && type == "moz") {notation = rfp_red}
			log_display(14, "colors_"+ type, eMsg + notation)
			aResults.push([type, zErr])
		}
		return aResults
	}
}

function get_computed_styles() {
	/* https://github.com/abrahamjuliot/creepjs */
	return new Promise(resolve => {
		let t0 = nowFn()
		const METRIC = "computed_styles"
		const names = ['styles_cssrulelist','styles_getcomputed','styles_htmlelement','styles_domparser']
		let aErr = [false, false, false], isLies = false
		let aHashes = [], intHashes = [], oDisplay = {}
		let isTBSmart = (isSmart && isTB)
		let notation = isTBSmart ? tb_red : ""

		let styleVersion = type => {
			return new Promise(resolve => {
				// get CSSStyleDeclaration
				try {
					if (runSE) {foo++}
					let cssStyleDeclaration = (
						type == 0 ? document.styleSheets[0].cssRules[0].style :
						type == 1 ? getComputedStyle(document.body) :
						type == 2 ? document.body.style :
						type == 3 ? ((new DOMParser).parseFromString("", "text/html")).body.style :
						undefined
					)
					if (!cssStyleDeclaration) {
						throw new TypeError("invalid argument string")
					}
					// get properties
					let prototype = Object.getPrototypeOf(cssStyleDeclaration),
						prototypeProperties = Object.getOwnPropertyNames(prototype),
						ownEnumerablePropertyNames = [],
						cssVar = /^--.*$/
					Object.keys(cssStyleDeclaration).forEach(key => {
						let numericKey = !Number.isNaN(key),
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
					return resolve({
						keys
					})
				} catch(e) {
					aErr[type] = true
					return resolve(log_error(SECT14, names[type], e))
				}
			})
		}

		function display() {
			for (const k of Object.keys(oDisplay)) {
				log_display(14, k, oDisplay[k])
			}
			log_perf(SECT14, METRIC, t0)
		}

		// run
		Promise.all([
			styleVersion(0),
			styleVersion(1),
			styleVersion(2),
			styleVersion(3),
		]).then(res => {
			/* simulate
				// different hashes: !isLies
				res[0] = res[1]; aErr[0] = false
				res[2]["keys"] = ["a","constructor"]

				// different hashes: isLies
				//res[2]["keys"] = ["a"]

				// same hashes: constructor not last
				//res[1]["keys"].push("a")
				//res[2]["keys"].push("a")

				// various errors
				//res[0] = {}; aErr[0] = false
				//res[1] = {"keys": ["a","b"]}
				//res[2] = {"keys": 5}
			//*/
			// analyse
			//console.log(res)

			for (let i=0; i < res.length; i++) {
				let obj = res[i]
				let type = names[i]
				let eMsg = ""
				if (aErr[i]) {
					oDisplay[type] = obj // error already logged
				} else {
					// expected obj.keys (not null) = array
					if ("object" == typeof obj && obj !== null && "undefined" !== typeof obj.keys && Array.isArray(obj.keys)) {
						let data = obj.keys
						if (data.length) {
							let hash = mini(data)
							aHashes.push(hash)
							intHashes.push(i)
							oDisplay[type] = hash
							// last item should be constructor
							// this only detects if items are added, not removed
							if (data[data.length-1] !== "constructor") {
								isLies = true
							}
						} else {
							aErr[i] = true
							oDisplay[type] = log_error(SECT14, type, zErrEmpty)
						}
					} else {
						aErr[i] = true
						oDisplay[type] = log_error(SECT14, type, zErrType + typeof obj)
					}
				}
			}

			// max errors
			//console.log("errors",aErr)
			if (aErr.every(x => x === true)) {
				log_display(14, METRIC, zErr + notation)
				addData(14, METRIC, zErr)
				display()
				return resolve()
			}
			// same hashes
			//console.log("hashes",aHashes)
			aHashes = aHashes.filter(function(item, position) {return aHashes.indexOf(item) === position})
			if (aHashes.length === 1) {
				//console.log("intHashes",intHashes)
				//console.log("isLies",isLies)
				let lookup = intHashes[0], hash = aHashes[0]
				sDetail[isScope][METRIC] = res[lookup]["keys"]
				let btn = addButton(14, METRIC, res[lookup]["keys"].length)
				if (isSmart && isLies) {
					addData(14, METRIC, zLIE)
					hash = colorFn(hash)
					log_known(SECT14, METRIC)
				} else {
					if (isTBSmart) {
						if (isOS == "mac") {
							/* mac 1104 vs win 1102: mac has: MozOsxFontSmoothing, -moz-osx-font-smoothing */
							if (hash === "75b00d93") {notation = tb_green} // TB 1104
						} else {
							/* win diff
							layout.css.font-variations.enabled = locked false on win 7
							fontOpticalSizing, font-optical-sizing, fontVariationSettings, font-variation-settings
							*/
							if (hash === "e32d06bd") {notation = tb_green // TB/MB win11 + linux, TB android: 1102
							} else if (hash === "e14684e7") {notation = tb_green} // TB/MB win7 1098
						}
					}
					addData(14, METRIC, res[lookup]["keys"], hash)
				}
				log_display(14, METRIC, hash + btn + notation)
				display()
				return resolve()
			}
			// mixed hashes
				// for the first of each unique hash, add sDetail and modify display with a btn
			let aDone = {}
			intHashes.forEach(function(item) {
				let name = names[item]
				let hash = oDisplay[name]
				if (aDone[hash] == undefined) {
					aDone[hash] = name
					// add sDetail + update display
					sDetail[isScope][name] = res[item]["keys"]
					let btn = addButton(14, name, res[item].length)
					oDisplay[name] = hash + btn
				}
			})
			let value = "mixed"
			if (isSmart) {
				// gecko is never mixed, so this must be some BS
				value = colorFn(value)
				log_known(SECT14, METRIC)
				addData(14, METRIC, zLIE)
			} else {
				addData(14, METRIC, "mixed")
			}
			log_display(14, METRIC, value + notation)
			display()
			return resolve()
		}).catch(error => {
			log_display(14, METRIC, log_error(SECT14, METRIC, error) + notation)
			return resolve([[METRIC, zErr]])
		})
	})
}

const get_mm_css = () => new Promise(resolve => {
	// https://searchfox.org/mozilla-central/source/servo/components/style/gecko/media_features.rs#690

	// key: [valid test values], css pseudo id, rfp value if needed, start version for notation if needed
		// only notate from when the mediaquery is enabled by default _and_ rfp is applied
	const oTests = {
		"prefers-reduced-motion": [['no-preference','reduce'], "PRM", "no-preference"], // FF63+
		"prefers-contrast": [['no-preference','high','low'], "PC", "no-preference"], // FF65+
			// ^ 1506364: layout.css.prefers-contrast.enabled / browser.display.prefers_low_contrast
			// ^ 1656363^ enabled by default in FF101
		"prefers-color-scheme": [['light','dark','no-preference'], "PCS","light"], // FF67+: 1494034
			// ^ FF79+: 1643656: no-preference obsolete
		"forced-colors": [['none','active'], "FC"], // FF89+: 1659511
		"prefers-reduced-transparency": [['no-preference','reduce'], "PRT"], // FF95+: 1736914
			// ^ layout.css.prefers-reduced-transparency.enabled
			// ^ 1822176: default disabled: 
		"inverted-colors": [['none','inverted'], "IC"], // FF114+
			// ^ 1794628: layout.css.inverted-colors.enabled (default disabled)
			// ^ ToDo: notation when pref flips: check RFP = "none"
		"prefers-reduced-data": [['no-preference','reduce'], "PRD"], // ?
	}
	let res = []
	for (const k of Object.keys(oTests)) {
		let value = zNA, display, k2 = k +"_css", aTests = oTests[k][0]
		try {
			for (let i=0; i < aTests.length; i++) {
				if (window.matchMedia("("+ k +":"+ aTests[i] +")").matches) {value = aTests[i]; break}
			}
			if (runSE) {foo++} else if (runSL) {value = "not-"+ value}
			display = value
		} catch(e) {
			display = log_error(SECT14, k, e)
			value = zErr
		}
		let cssvalue = getElementProp(SECT14, "#css"+ oTests[k][1], k2)
		if (isSmart) {
			if (value !== zErr && cssvalue !== zErr) {
				if (value !== cssvalue) {
					display = colorFn(display)
					value = zLIE
					log_known(SECT14, k)
				}
			}
			let rfp = oTests[k][2], startVer = oTests[k][3]
			if (rfp !== undefined) {
				if (startVer == undefined || startVer <= isVer) {
					display += display == rfp ? rfp_green : rfp_red // mm
					log_display(14, k2, (cssvalue == rfp ? rfp_green : rfp_red)) // css
				}
			}
		}
		log_display(14, k, display)
		res.push([k, value], [k2, cssvalue])
	}
	return resolve(res)
})


const outputCSS = () => new Promise(resolve => {
	let t0 = nowFn()
	Promise.all([
		get_mm_css(),
		get_colors(),
		get_computed_styles(),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(14, item)})
		log_section(14, t0)
		return resolve(SECT14)
	})
})

countJS(SECT14)
