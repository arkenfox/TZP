'use strict';

function get_colors(runtype) {
	/* servo/components/style/values/specified/color.rs */
	let results = [],
		list = [],
		error = "",
		m = "-moz-",
		mm = m+"mac-",
		t = "ThemedScrollbar",
		tt = t+"Thumb",
		ts = "TextSelect",
		w = "Widget",
		b = "Background",
		f = "Foreground",
		u = "Underline",
		ic = "IMEConvertedText",
		ir = "IMERawInput",
		is = "IMESelectedConvertedText",
		ix = "IMESelectedRawText",
		element = dom.sColorElement

	let dString = "css_colors_"+runtype
	clearDetail(dString)

	if (runtype == "system") {
		list = ['ActiveBorder','ActiveCaption','AppWorkspace',b,'ButtonFace',
		'ButtonHighlight','ButtonShadow','ButtonText','CaptionText','GrayText','Highlight',
		'HighlightText','InactiveBorder','InactiveCaption', 'InactiveCaptionText','Info'+b,
		'InfoText','Menu','MenuText','Scrollbar','ThreeDDarkShadow','ThreeDFace','ThreeDHighlight',
		'ThreeDLightShadow','ThreeDShadow','Window','WindowFrame','WindowText',
		// skippable
		ic+b,ic+f,ic+u,ir+b,ir+f,ir+u,is+b,is+f,is+u,ix+b,ix+f,ix+u,'SpellChecker'+u,'Text'+b,
		'Text'+f,'TextHighlight'+b,'TextHighlight'+f,ts+b,ts+b+'Attention',ts+b+'Disabled',ts+f,
		ts+f+'Custom',t,t+'Inactive',tt,tt+'Active',tt+'Hover',tt+'Inactive',w+'3DHighlight',
		w+'3DShadow',w+b,w+f,w+'Select'+b,w+'Select'+f,'Window'+b,'Window'+f,
		]
	} else if (runtype == "css4") {
		list = ['Canvas','CanvasText','LinkText','VisitedText','ActiveText','Field','FieldText']
	} else {
		list = [m+'activehyperlinktext',m+'appearance',m+'buttondefault',m+'buttonhoverface',
		m+'buttonhovertext',m+'cellhighlight',m+'cellhighlighttext',m+'combobox',m+'comboboxtext',
		m+'default-background-color',m+'default-color',m+'dialog',m+'dialogtext',m+'dragtargetzone',
		m+'eventreerow',m+'field',m+'fieldtext',m+'gtk-buttonactivetext',m+'gtk-info-bar-text',
		m+'html-cellhighlight',m+'html-cellhighlighttext',m+'hyperlinktext',mm+'accentdarkestshadow',
		mm+'accentdarkshadow',mm+'accentface',mm+'accentlightesthighlight',mm+'accentlightshadow',
		mm+'accentregularhighlight',mm+'accentregularshadow',mm+'active-menuitem',mm+'buttonactivetext',
		mm+'chrome-active',mm+'chrome-inactive',mm+'defaultbuttontext',mm+'disabledtoolbartext',
		mm+'focusring',mm+'menuitem',mm+'menupopup',mm+'menuselect',mm+'menushadow',mm+'menutextdisable',
		mm+'menutextselect',mm+'secondaryhighlight',mm+'source-list',mm+'vibrancy-dark',mm+'vibrancy-light',
		mm+'vibrant-titlebar-dark',mm+'vibrant-titlebar-light',mm+'active-source-list-selection',
		mm+'source-list-selection',mm+'tooltip',m+'colheaderhovertext',m+'colheadertext',
		m+'menubarhovertext',m+'menubartext',m+'menuhover',m+'menuhovertext',m+'nativehyperlinktext',
		m+'oddtreerow',m+'visitedhyperlinktext',m+'win-accentcolor',m+'win-accentcolortext',
		m+'win-communications-toolbox',m+'win-communicationstext',m+'win-media-toolbox',m+'win-mediatext',
		m+"_i-am-fake", // fake
		m+"accent-color",m+"accent-color-foreground", // 1698291
		]
	}
	// de-dupe and sort
	list = list.filter(function(item, position) {return list.indexOf(item) === position})
	list.sort()

	list.forEach(function(item) {
		element.style.backgroundColor = item
		try {
			let x = window.getComputedStyle(element, null).getPropertyValue("background-color")
			results.push(item+":"+x)
		} catch(e) {
			error = (isFF ? zB0 : "error")
		}
	})
	sectionDetail[dString] = results

	let hash = sha1(results.join())
	let notation = buildButton("14", dString, list.length)

	if (runtype == "system") {
		let control = "791543b8b70945d9efd6d6d31548180261178c47"
		dom.sColorHash.innerHTML = error + (error == "" ? hash + notation + (hash == control ? rfp_green : rfp_red) : "")
	} else if (runtype == "css4") {
		dom.sColorHashNew.innerHTML = error + (error == "" ? hash + notation : "")
	} else {
		dom.mColorHash.innerHTML = error + (error == "" ? hash + notation : "")
	}
	return "colors_" + runtype + ":" + hash
}

function get_computed_styles() {
	/* https://github.com/abrahamjuliot/creepjs */
	return new Promise(resolve => {
		let t0 = performance.now()
		let styleVersion = type => {
			return new Promise(resolve =>  {
				// get CSSStyleDeclaration
				try {
					let cssStyleDeclaration = (
						type == 0 ? getComputedStyle(document.body) :
						type == 1 ? document.body.style :
						type == 2 ? document.styleSheets[0].cssRules[0].style :
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
					// checks
					let moz = keys.filter(key => (/moz/i).test(key)).length,
						webkit = keys.filter(key => (/webkit/i).test(key)).length,
						prototypeName = ('' + prototype).match(/\[object (.+)\]/)[1]
					// output
					return resolve({
						keys,
						moz,
						webkit,
						prototypeName
					})
				} catch(e) {
					return resolve(undefined)
				}
			})
		}
		Promise.all([
			styleVersion(0),
			styleVersion(1),
			styleVersion(2)
		]).then(res => {
			let isSame = true, hashes = [], display = ""
			// loop
			for (let i=0; i < 3; i++) {
				let el = document.getElementById("cStyles"+i)
				try {
					let results = res[i],
						array = res[i].keys
					//if (!isFF) {array.sort()}
					hashes.push(sha1(array.join()))

					display = hashes[i] + s14+"["+ array.length +"|"+ res[i].moz +"|"+ res[i].webkit +"]"+sc
				} catch(e) {
					hashes.push("error")
					display = "error"
				}
				el.innerHTML = display
				if (i > 0) {
					if (hashes[i] != hashes[0]) {isSame = false}
				}
			}
			// show/hide rows
			document.getElementById("togCSSb").style.display = (isSame ? "none" : "table-row")
			document.getElementById("togCSSc").style.display = (isSame ? "none" : "table-row")
			// label
			if (!isSame) {
				dom.togCSSa = "getComputedStyle"
			} else {
				dom.togCSSa.innerHTML = "<div class='ttip'><span class='icon'>[ i ]</span>" +
					"<span class='ttxt'>getComputedStyle<br>HTMLElement.style<br>CSSRuleList.style</span></div>	&nbsp computed styles"
			}
			if (logPerf) {debug_log("computed styles [css]",t0)}
			//console.debug(hashes.join("\n"))
			return resolve("styles:"+ sha1(hashes.join()))
		}).catch(error => {
			console.error(error)
			return resolve("styles:error")
		})
	})
}

function get_mm_css() {
	let res = [], n="no-preference"

	// FF63+: reduced-motion
	let x = zNS, q="prefers-reduced-motion: "
	try {
		if (window.matchMedia("("+q+"reduce)").matches) {x = "reduce"}
		if (window.matchMedia("("+q+n+")").matches) {x = n}
	} catch(e) {x = zB0}
	if (isFF && x == zNS && isVer > 62) {x = zB0}
	res.push(q.trim() + x)
	dom.mmPRM.innerHTML = x + (x == n ? rfp_green : (x == zNS ? "" : rfp_red))

	// FF67+: color-scheme
	x = zNS, q="prefers-color-scheme: "
	try {
		if (window.matchMedia("("+q+"light)").matches) {x = "light"}
		if (window.matchMedia("("+q+"dark)").matches) {x = "dark"}
		if (window.matchMedia("("+q+n+")").matches) {x = n}
	} catch(e) {x = zB0}
	if (isFF && x == zNS && isVer > 66) {x = zB0}
	res.push(q.trim() + x)
	dom.mmPCS.innerHTML = x + (x == "light" ? rfp_green : (x == zNS ? "" : rfp_red))

	// contrast
		// ToDo: RFP & version check: 1506364: layout.css.prefers-contrast.enabled
		// browser.display.prefers_low_contrast boolean [hidden]
	x = zNS, q="prefers-contrast: "
	try {
		if (window.matchMedia("("+q+n+")").matches) {x = n}
		if (window.matchMedia("("+q+"forced)").matches) {x = "forced"} // 1694864: removed
		if (window.matchMedia("("+q+"high)").matches) {x = "high"}
		if (window.matchMedia("("+q+"low)").matches) {x = "low"}
	} catch(e) {x = zB0}
	res.push(q.trim() + x)
	dom.mmPC.innerHTML = x

	// forced-colors
		// ToDo: RFP & version check: 1659511: layout.css.forced-colors.enabled
	x = zNS, q="prefers-forced-colors: "
	try {
		if (window.matchMedia("("+q+n+")").matches) {x = n; clean = n}
		if (window.matchMedia("("+q+"active)").matches) {x = "active"; clean = "active"}
		if (window.matchMedia("("+q+"none)").matches) {x = "none"; clean = "none"}
	} catch(e) {x = zB0}
	res.push(q.trim() + x)
	dom.mmFC.innerHTML = x

	// return
	return(res)
}

function get_system_fonts(runtype) {
	return new Promise(resolve => {
		let results = [],
			error = "",
			m = "-moz-"
		let fonts = ["caption","icon","menu","message-box","small-caption","status-bar",m+"window",m+"desktop",
			m+"document",m+"workspace",m+"info",m+"pull-down-menu",m+"dialog",m+"button",m+"list",m+"field"]
		if (runtype == "isFFcheck") {fonts = [m+"dialog"]}

		let el = document.getElementById("sysFont")
		try {
			// script blocking
			let test = getComputedStyle(el).getPropertyValue("font-family")
			// compute
			fonts.forEach(function(font){
				el.style.font = "99px sans-serif"
				try {el.style.font = font} catch(err) {}
				let s = ""
				if (window.getComputedStyle) {
					try {
						s = getComputedStyle(el, null)
					} catch(e) {}
				} else {
					s = el.currentStyle
				}
				if (s !== "") {
					let f = undefined
					if (s.fontSize != "99px") {
						f = s.fontFamily + " " + s.fontSize;
						if (s.fontWeight != 400 && s.fontWeight != "normal") {
							f += ", " +	(s.fontWeight == 700 ? "bold" :
								typeof s.fontWeight == "number" ? "weight " + s.fontWeight :
								s.fontWeight)
						}
						if (s.fontStyle != "normal") {
							f += ", " + s.fontStyle
						}
					}
					if (runtype == "isFFcheck") {
						return resolve(""+f)
					} else {
						results.push(font+":"+f)
					}
				}
			})
		} catch(e) {
			if (runtype == "isFFcheck") {
				return resolve("error")
			} else {
				error = (isFF ? zB0 : "error")
			}
		}
		// output
		if (runtype !== "isFFcheck") {
			let hash = sha1(results.join())
			let notation = s14 + " [" + fonts.length + "]" + sc
			dom.sFontsHash.innerHTML = error + (error == "" ? hash + notation : "")
			return resolve("system_fonts:"+ hash)
		}
	})
}

function outputCSS() {
	let t0 = performance.now(),
		section = []
	Promise.all([
		get_mm_css(),
		get_colors("system"),
		get_colors("css4"),
		get_colors("moz"),
		get_system_fonts(),
		get_computed_styles(),
	]).then(function(results){
		results.forEach(function(currentResult) {
			if (Array.isArray(currentResult)) {
				currentResult.forEach(function(item) {
					section.push(item)
				})
			} else {
				section.push(currentResult)
			}
		})
		section_info("css", t0, section)
	})
}

countJS("css")
