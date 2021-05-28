'use strict';

function get_colors(runtype) {
	/* servo/components/style/values/specified/color.rs */
	let aList = [],
		sTarget = "",
		sControl = ""
	let sName = "css_colors_"+ runtype
	clearDetail(sName)

	if (runtype == "system") {
		sControl = "5bcd87c4c7753f09a14546911686a62e8625faf8"
		sTarget = dom.sColorHash
		aList = ['ActiveBorder','ActiveCaption','AppWorkspace','Background','ButtonFace',
		'ButtonHighlight','ButtonShadow','ButtonText','CaptionText','GrayText','Highlight',
		'HighlightText','InactiveBorder','InactiveCaption', 'InactiveCaptionText','InfoBackground',
		'InfoText','Menu','MenuText','Scrollbar','ThreeDDarkShadow','ThreeDFace','ThreeDHighlight',
		'ThreeDLightShadow','ThreeDShadow','Window','WindowFrame','WindowText']
	} else if (runtype == "css4") {
		if (isVer > 75) {
			// FF76+ note: FF72+: field/fieldtext added: RFP no effect
			sControl = "3900ddea19449a8174058383c32dc40b2e31b9a2"
		}
		sTarget = dom.cColorHash
		aList = ['Canvas','CanvasText','LinkText','VisitedText','ActiveText','Field','FieldText']
	} else {
		sTarget = dom.mColorHash
		let m = "-moz-", mm = m+"mac-", mw = m+"win-"
		aList = [m+'activehyperlinktext',m+"accent-color",m+"accent-color-foreground",m+'appearance',
		m+'buttondefault',m+'buttonhoverface',m+'buttonhovertext',m+'cellhighlight',m+'cellhighlighttext',
		m+'combobox',m+'comboboxtext',m+'default-background-color',m+'default-color',m+'dialog',
		m+'dialogtext',m+'dragtargetzone',m+'eventreerow',m+'field',m+'fieldtext',m+'gtk-buttonactivetext',
		m+'gtk-info-bar-text',m+'html-cellhighlight',m+'html-cellhighlighttext',m+'hyperlinktext',
		mm+'accentdarkestshadow',mm+'accentdarkshadow',mm+'accentface',mm+'accentlightesthighlight',
		mm+'accentlightshadow',mm+'accentregularhighlight',mm+'accentregularshadow',mm+'active-menuitem',
		mm+'buttonactivetext',mm+'chrome-active',mm+'chrome-inactive',mm+'defaultbuttontext',
		mm+'disabledtoolbartext',mm+'focusring',mm+'menuitem',mm+'menupopup',mm+'menuselect',mm+'menushadow',
		mm+'menutextdisable',mm+'menutextselect',mm+'secondaryhighlight',mm+'source-list',mm+'vibrancy-dark',
		mm+'vibrancy-light',mm+'vibrant-titlebar-dark',mm+'vibrant-titlebar-light',
		mm+'active-source-list-selection',mm+'source-list-selection',mm+'tooltip',m+'colheaderhovertext',
		m+'colheadertext',m+'menubarhovertext',m+'menubartext',m+'menuhover',m+'menuhovertext',
		m+'nativehyperlinktext',m+'oddtreerow',m+'visitedhyperlinktext',mw+'accentcolor',mw+'accentcolortext',
		mw+'communications-toolbox',mw+'communicationstext',mw+'media-toolbox',mw+'mediatext',]
	}
	// de-dupe/sort
	aList = aList.filter(function(item, position) {return aList.indexOf(item) === position})
	aList.sort()
	// run
	let aResults = [],
		element = dom.sColorElement,
		sError = ""
	aList.forEach(function(style) {
		element.style.backgroundColor = style
		try {
			let rgb = window.getComputedStyle(element, null).getPropertyValue("background-color")
			aResults.push(style +":"+ rgb)
		} catch(e) {
			sError = (isFF ? zB0 : "error")
		}
	})
	sDetail[sName] = aResults
	let sHash = sha1(aResults.join())
	let sNotation = buildButton("14", sName, aList.length)
	if (sControl.length) {sNotation += (sHash == sControl ? rfp_green : rfp_red)}
	sTarget.innerHTML = (sError.length ? sError : sHash + sNotation)
	return "colors_"+ runtype +":"+ (sError.length ? sError : sHash)
}

function get_computed_styles() {
	/* https://github.com/abrahamjuliot/creepjs */
	return new Promise(resolve => {
		let t0 = performance.now()
		let styleVersion = type => {
			return new Promise(resolve => {
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
		// run
		let sNames = ["css_getcomputed","css_htmlelement","css_cssrulelist"]
		sNames.forEach(function(k){clearDetail[k]})
		sNames.forEach(function(k){clearDetail[k + "_fake_skip"]})
		sNames.forEach(function(k){clearDetail[k + "_reported_skip"]})
		Promise.all([
			styleVersion(0),
			styleVersion(1),
			styleVersion(2)
		]).then(res => {
			let reportedHashes = [], trueHashes = [], blocks = []
			for (let i=0; i < 3; i++) {
				let el = document.getElementById("cStyles"+ i),
					display = ""
				try {
					let reportedStyles = [], trueStyles = [], fakeStyles = []
					reportedStyles = res[i].keys
					// sim
					if (runSL) {
						reportedStyles.push("setProperty")
						if (i==1) {reportedStyles.push("fake")}
						if (i==2) {reportedStyles.push("hello","world")}
					}
					// false positives FF60-62: added to alerts
					if (isFF && isVer > 62) {
						let lastStyleIndex = reportedStyles.indexOf("constructor")
						fakeStyles = reportedStyles.slice(lastStyleIndex+1)
						trueStyles = reportedStyles.slice(0, lastStyleIndex+1)
						sDetail[sNames[i]] = trueStyles
						sDetail[sNames[i]+ "_fake_skip"] = fakeStyles
						sDetail[sNames[i]+ "_reported_skip"] = reportedStyles
						if (gRun && fakeStyles.length) {
							gKnown.push("css:"+sNames[i])
							gBypassed.push("css::"+ sNames[i] +":"+ sha1(trueStyles.join()))
						}
					} else {
						reportedStyles.sort()
						trueStyles = reportedStyles
						sDetail[sNames[i]] = trueStyles
						sDetail[sNames[i]+ "_reported_skip"] = reportedStyles
					}
					// hashes
					let reportedHash = sha1(reportedStyles.join())
					reportedHashes.push(reportedHash)
					trueHashes.push(sha1(trueStyles.join()))
					// display
					display = reportedHash
					if (fakeStyles.length) {display = soB + reportedHash + scC}
					display += buildButton("14", sNames[i]+ "_reported_skip", reportedStyles.length +"|"+ res[i].moz +"|"+ res[i].webkit)
					if (fakeStyles.length) {
						display += buildButton("14", sNames[i]+ "_fake_skip", fakeStyles.length +" lie"+ (fakeStyles.length > 1 ? "s" : ""))
					}
				} catch(e) {
					if (!isFile) {blocks.push(sNames[i])}
					display = "error"
					reportedHashes.push("error")
					trueHashes.push("error")
				}
				el.innerHTML = display
			}
			// show/hide & fixup label
			let uniqueReported = reportedHashes.filter(function(item, position) {return reportedHashes.indexOf(item) === position})
			let isSame = (uniqueReported.length < 2)
			showhide("C",(isSame ? "none" : "table-row"))
			if (!isSame) {
				dom.togCSSa = "getComputedStyle"
			} else {
				dom.togCSSa.innerHTML = "<div class='ttip'><span class='icon'>[ i ]</span>"
					+"<span class='ttxt'>getComputedStyle<br>HTMLElement.style<br>"
					+"CSSRuleList.style</span></div> &nbsp computed styles"
			}
			// blocks
			blocks.sort()
			if (gRun && blocks.length) {gMethods.push("css:computed styles:blocked:"+ blocks.join())}
			log_perf("computed styles [css]",t0, (gRun ? gt0 : "ignore"))
			// return
			if (blocks.length == 3) {
				return resolve("styles:"+ zB0)
			} else {
				let uniqueTrue = trueHashes.filter(function(item, position) {return trueHashes.indexOf(item) === position})
				uniqueTrue = uniqueTrue.filter(x => !["error"].includes(x))
				if (uniqueTrue.length == 1) {
					return resolve("styles:"+ uniqueTrue[0])
				} else {
					if (gRun) {gCheck.push("css:computed styles: multiple values")}
					return resolve("styles:"+ trueHashes.join(","))
				}
			}
		}).catch(error => {
			if (gRun) {gCheck.push("css:computed styles: " + e.name +" : "+ e.message)}
			return resolve("styles:error")
		})
	})
}

function get_mm_css() {
	return new Promise(resolve => {
		function get_mm(type, id, version, expected) {
			let x = zNS, x2 = "", n="no-preference", q=type +": "
			try {
				if (window.matchMedia("("+ q +"reduce)").matches) {x = "reduce"}
				if (window.matchMedia("("+ q +"light)").matches) {x = "light"}
				if (window.matchMedia("("+ q +"dark)").matches) {x = "dark"}
				if (window.matchMedia("("+ q +"forced)").matches) {x = "forced"} // 1694864: removed
				if (window.matchMedia("("+ q +"high)").matches) {x = "high"}
				if (window.matchMedia("("+ q +"low)").matches) {x = "low"}
				if (window.matchMedia("("+ q +"active)").matches) {x = "active"}
				if (window.matchMedia("("+ q +"none)").matches) {x = "none"}
				if (window.matchMedia("("+ q + n +")").matches) {x = n}
			} catch(e) {x = zB0}
			// notate/display
			if (runSL) {x = "apple"}
			let display = x
			// lies
			x2 = getElementProp("#css"+ id,"content",":after")
			if (x2 !== "x") {
				if (x !== x2) {
					display = soB + x + scC
					if (gRun) {
						gKnown.push("css:"+ type)
						gBypassed.push("css:"+ q.trim() + x2)
					}
				}
			}
			if (version !== undefined && x2 == x) {
				if (isVer >= version) {
					display += (x == expected ? rfp_green : rfp_red)
				}
			}
			document.getElementById("mm"+id).innerHTML = display
			x = (x2 == "x" ? x : x2)
			res.push(q.trim() + x)
		}
		let res = []
		get_mm("prefers-reduced-motion","PRM",63,"no-preference") // FF63+
		get_mm("prefers-color-scheme","PCS",67,"light") // FF67+: 1494034
		get_mm("forced-colors","FC") // FF89+: 1659511: not RFP protected
		get_mm("prefers-contrast","PC")
		// ToDo: contrast: RFP & version check
			// 1506364: layout.css.prefers-contrast.enabled / browser.display.prefers_low_contrast boolean [hidden]

		// return
		return resolve(res)
	})
}

function get_system_fonts() {
	return new Promise(resolve => {
		let aResults = [],
			sError = "",
			m = "-moz-",
			aFonts = ["caption","icon","menu","message-box","small-caption","status-bar",m+"window",m+"desktop",
			m+"document",m+"workspace",m+"info",m+"pull-down-menu",m+"dialog",m+"button",m+"list",m+"field"]
		let sName = "css_system_fonts"
		clearDetail(sName)
		try {
			let el = dom.sysFont
			aFonts.forEach(function(font){
				// catch blocked
				let test = getComputedStyle(el).getPropertyValue("font-family")
				el.style.font = "99px sans-serif"
				try {el.style.font = font} catch(err) {}
				let s = ""
				if (window.getComputedStyle) {
					try {
						s = getComputedStyle(el, null)
					} catch(e) {}
				}
				if (s !== "") {
					let f = undefined
					if (s.fontSize != "99px") {
						f = s.fontFamily +" "+ s.fontSize
					}
					aResults.push(font +":"+ f)
				}
			})
		} catch(e) {
			sError = (isFF ? zB0 : "error")
		}
		// output
		sDetail[sName] = aResults
		let sHash = sha1(aResults.join())
		dom.sFontsHash.innerHTML = sError + (sError == "" ? sHash + buildButton("14", sName, aResults.length) : "")
		return resolve("system_fonts:"+ (sError == "" ? sHash : sError))
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
		log_section("css", t0, section)
	})
}

countJS("css")
