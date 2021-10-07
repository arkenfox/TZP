'use strict';

let cSim = 0

function get_colors(runtype) {
	/* servo/components/style/values/specified/color.rs */
	/* https://hg.mozilla.org/mozilla-central/diff/5a44200105e26cf5ab8545de0b3ed12f4a34ff4d/dom/canvas/test/test_bug1485266.html */
	// NOTE: if an alias isn't supported, it gets the previous lookup value

	let aList = [],
		sTarget = "",
		m = "-moz-", mm = m+"mac-", mw = m+"win-"

	let sName = "css_colors_"+ runtype
	clearDetail(sName)
	if (runtype == "system") {
		sTarget = dom.sColorHash
		aList = ['ActiveBorder','ActiveCaption','AppWorkspace','Background','ButtonFace','ButtonHighlight',
		'ButtonShadow','ButtonText','CaptionText','GrayText','Highlight','HighlightText','InactiveBorder',
		'InactiveCaption', 'InactiveCaptionText','InfoBackground','InfoText','Menu','MenuText','Scrollbar',
		'ThreeDDarkShadow','ThreeDFace','ThreeDHighlight','ThreeDLightShadow','ThreeDShadow','Window',
		'WindowFrame','WindowText']

	} else if (runtype == "css4") {
		sTarget = dom.cColorHash
		aList = ['Canvas','CanvasText','LinkText','VisitedText','ActiveText','Field','FieldText','SelectedItem','SelectedItemText']

	} else if (runtype == "moz-stand-in") {
		sTarget = dom.m2ColorHash
		aList = [m+'buttondefault',m+'buttonhoverface',m+'buttonhovertext',m+'cellhighlight',
		m+'cellhighlighttext',m+'combobox',m+'comboboxtext',m+'dialog',m+'dialogtext',m+'dragtargetzone',
		m+'eventreerow',m+'field',m+'fieldtext',m+'html-cellhighlight',m+'html-cellhighlighttext',
		m+'menuhover',m+'menuhovertext',m+'menubartext',m+'menubarhovertext',m+'nativehyperlinktext',
		m+'oddtreerow',mm+'alternateprimaryhighlight',mm+'chrome-active',mm+'chrome-inactive',
		mm+'disabledtoolbartext',mm+'focusring',mm+'menuselect',mm+'menushadow',mm+'menutextdisable',
		mm+'menutextselect',mw+'communicationstext',mw+'mediatext',mm+'secondaryhighlight',]
		// 1693222: "-moz-html-CellHighlight","-moz-html-CellHighlightText" removed from stand-ins


	} else {
		sTarget = dom.mColorHash
		aList = [m+'activehyperlinktext',m+"accent-color",m+"accent-color-foreground",m+'appearance',
		m+'default-background-color',m+'default-color',m+'gtk-buttonactivetext',m+'gtk-info-bar-text',
		m+'hyperlinktext',mm+'accentdarkestshadow',mm+'accentdarkshadow',mm+'accentface',
		mm+'accentlightesthighlight',mm+'accentlightshadow',mm+'accentregularhighlight',
		mm+'accentregularshadow',mm+'active-menuitem',mm+'buttonactivetext',mm+'defaultbuttontext',mm+'menuitem',
		mm+'menupopup',mm+'source-list',mm+'vibrancy-dark',mm+'vibrancy-light',mm+'vibrant-titlebar-dark',
		mm+'vibrant-titlebar-light',mm+'active-source-list-selection',mm+'source-list-selection',
		mm+'tooltip',m+'colheaderhovertext',m+'colheadertext',m+'visitedhyperlinktext',mw+'accentcolor',
		mw+'accentcolortext',mw+'communications-toolbox',mw+'media-toolbox',]
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
	let note = ""
	if (runtype == "system") {
		// ToDo: isVer check FF95+ 1734115
		note = rfp_red
		if (sHash == "5bcd87c4c7753f09a14546911686a62e8625faf8") {note = rfp_green}
		if (sHash == "35de8783ff93479148425072691fc0a6bedc7aba") {note = rfp_green} // FF95+ : 1734115: ButtonFace

	} else if (runtype == "css4") {
		// FF72+: Field/FieldText (RFP no effect)
		// FF76+: Track now we have the first item ActiveText
		// FF93+: 1693222: SelectedItem/SelectedItemText (uses prev value until supported)
		if (isVer > 75) {
			note = rfp_red
			if (isVer > 92) {
				if (sHash == "9061b35660aa3bfc28b98bd0f263ff945d3c27c9") {note = rfp_green}
			} else {
				if (sHash == "a2352569036cea2e7c3b7a5ff975598893ff1ca2") {note = rfp_green}
			}
		}
	} else if (runtype == "moz-stand-in") {
		// ToDo: isVer check FF95+ 1734115
		//note = rfp_red
		//if (sHash == "ed162e5af511cea8e334dc0aaf8f3d3bf9a0c801") {note = rfp_green}
		//if (sHash == "27286402856cad42bdd6583b76a9c23dcf45b27b") {note = rfp_green} // FF95+
	}
	let btn = buildButton("14", sName, aList.length) + note
	sTarget.innerHTML = (sError.length ? sError : sHash + btn)
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
					return resolve("error")
				}
			})
		}
		// clear
		let names = ["getcomputed","htmlelement","cssrulelist"]
		let sNames = ["css_getcomputed","css_htmlelement","css_cssrulelist"]
		sDetail["css_computed_styles"] = []
		sNames.forEach(function(k){clearDetail[k + "_fake_skip"]})
		sNames.forEach(function(k){clearDetail[k + "_reported_notglobal"]})

		// run
		Promise.all([
			styleVersion(0),
			styleVersion(1),
			styleVersion(2)
		]).then(res => {
			let blankIndex = [], realIndex = [], fakeIndex = [], distinctRep = [], distinctReal = []
			let values = [], btns = []
			// sim
			if (runSC) {
				if (isFile && cSim == 0) {console.error("make sure privacy.file_unique_origin = false for file:// scheme testing")}
				cSim++
				cSim = cSim % 10
				if (cSim == 0) {console.log("style sim #0: all blocked")}
				var bMsg = false
			}
			// file:// override for CSSRuleList
			let fileSchemeOverride = (isFile && !runSC && isVer > 67 ? true : false)
			if (isFile && !isFF) {fileSchemeOverride = true}
			// analyse
			for (let i=0; i < 3; i++) {
				let aRep = [], aReal = [], aFake = []
				try {
					aRep = res[i].keys
					if (fileSchemeOverride && i==2) {aRep = res[1].keys}
					// don't record untrustworthy: false positives FF60-62: getComputedStyle has extra styles
					// remove diffs: we don't lose entropy, we already know the version number
					if (i == 0) {
						if (isVer < 63) {aRep = aRep.filter(x => !["-moz-context-properties"].includes(x))}
						if (isVer < 62) {
							aRep = aRep.filter(x => !["-moz-window-opacity","-moz-window-transform","-moz-window-transform-origin"].includes(x))
						}
					}
					// sim
					if (runSC) {
						let cMsg = ""
						// privacy.file_unique_origin = false
						if (cSim == 0) {bMsg = true; let k=y
						} else if (cSim == 1) {cMsg = "3 same fake"; aRep.push("fake")
						} else if (cSim == 2) {cMsg = "2 true, 1 block"; if (i == 1) {let k=y}
						} else if (cSim == 3) {cMsg = "2 same fake, 1 block"; if (i == 1 || i == 2) {aRep.push("eh")} else if (i == 0) {let k=y}
						} else if (cSim == 4) {cMsg = "2 same fake, 1 true"; if (i == 0 || i == 2) {aRep.push("ugh")}
						} else if (cSim == 5) {cMsg = "1 true, 1 fake, 1 blocked"; if (i == 2) {aRep.push("foo","bar")} else if (i == 1) {let k=y}
						} else if (cSim == 6) {cMsg = "2 diff fakes, 1 true"; if (i==1) {aRep.push("woo")} else if (i==2) {aRep.push("wha","wee")}
						} else if (cSim == 7) {cMsg = "2 diff fakes, 1 block"
							if (i==0) {aRep.push("a","b")} else if (i==1) {let k=y} else if (i==2) {aRep.push("ek")}
						} else if (cSim == 8) {cMsg = "3 diff fakes"
							if (i==0) {aRep.push("x")} else if (i==1) {aRep.push("y")} else if (i==2) {aRep.push("z","k")}
						} else if (cSim == 9) {cMsg = "at least 2 diff real results, 1 block"
							if (i==1) {aRep = aRep.filter(x => !["constructor"].includes(x)); aRep.push("y"); aRep.push("constructor")} else if (i==2) {let k=y}
						}
						if (cSim !== 0 && !bMsg) {console.log("style sim #"+ cSim + ":", cMsg); bMsg = true}
					}
					if (isFF && isVer > 62) {
						let lastStyleIndex = aRep.indexOf("constructor")
						aFake = aRep.slice(lastStyleIndex+1)
						aReal = aRep.slice(0, lastStyleIndex+1)
					} else {
						aRep.sort()
						aReal = aRep
					}
					//if (i==0) {console.debug(aReal.join("\n"))}
					// data
					let value = sha1(aRep.join())
					values.push(value)
					distinctRep.push(value)
					let j = (fileSchemeOverride && i==2 ? 1 : i)
					let btn = buildButton("14", sNames[i] +"_reported_notglobal", aRep.length +"|"+ res[j].moz +"|"+ res[j].webkit)
					sDetail["css_computed_styles"] = aReal
					if (aFake.length) {
						fakeIndex.push(i)
						sDetail[sNames[i] +"_reported_notglobal"] = aRep
						sDetail[sNames[i] +"_fake_skip"] = aFake
						btn += buildButton("14", sNames[i] +"_fake_skip", aFake.length +" lie"+ (aFake.length > 1 ? "s" : ""))
						distinctReal.push(sha1(aReal.join()))
					} else {
						sDetail[sNames[i] +"_reported_notglobal"] = aReal
						realIndex.push(i)
						distinctReal.push(value)
					}
					btns.push(btn)
				} catch(e) {
					blankIndex.push(i)
					values.push("blocked")
					btns.push("")
				}
			}
			distinctRep = distinctRep.filter(function(item, position) {return distinctRep.indexOf(item) === position})
			distinctReal = distinctReal.filter(function(item, position) {return distinctReal.indexOf(item) === position})
			let bCount = blankIndex.length
			// showhide
			let isSame = false
			if (distinctRep.length == 1 && bCount == 0 || bCount == 3) {
				isSame = true
			}
			showhide("C",(isSame ? "none" : "table-row"))
			let tooltip = "<div class='ttip'><span class='icon'>[ i ]</span><span class='ttxt'>"
				+"getComputedStyle<br>HTMLElement.style<br>CSSRuleList.style</span></div> &nbsp computed styles"
			dom.togCSSa.innerHTML = isSame ? tooltip : "getComputedStyle"
			// blocks/lie
			if (gRun) {
				let isLie = false
				if (bCount > 0) {
					let blank = []
					for (let i=0; i < bCount; i++) {blank.push(names[blankIndex[i]])}
					blank.sort()
					gMethods.push("css:computed styles:blocked:"+ (blank.length == 3 ? "all": blank.join()))
					if (bCount !== 3) {isLie = true}
				}
				if (fakeIndex.length) (isLie = true)
				if (isLie) {gKnown.push("css:computed_styles");}
			}
			// value
			let value = zLIE
			// bypasses
			let isBypass = false
			if (distinctReal.length == 1 && (bCount + fakeIndex.length > 0)) {
				isBypass = true
				value = distinctReal[0]
				if (gRun) {
					let bypass = []
					for (let i=0; i < bCount; i++) {bypass.push(names[blankIndex[i]])}
					for (let i=0; i < fakeIndex.length; i++) {bypass.push(names[fakeIndex[i]])}
					bypass.sort()
					gBypassed.push("css:computed styles:"+ (bypass.length == 3 ? "all" : bypass.join()) +":"+ value)
				}
			} else {
				if (bCount == 3) {value = zB0} else if (isSame) {value = distinctReal[0]} else {sDetail["css_computed_styles"] = []}
			}
			// output
			for (let i=0; i < values.length; i++) {
				let hash = values[i]
				if (isBypass && hash !== value) {hash = soB + hash + scC}
				if (value == zLIE) {hash = soL + hash + scC}
				let display = hash + btns[i]
				document.getElementById("cStyles"+ i).innerHTML = display
			}
			// multihash
			if (gRun) {
				if (distinctRep.length > 1) {gCheck.push("css:computed styles: multiple hashes")}
				if (value == zLIE) {gKnown.push("css:computed_styles")}
			}
			// return
			log_perf("computed styles [css]",t0, (gRun ? gt0 : "ignore"))
			return resolve("computed_styles:"+ value)
		}).catch(error => {
			if (gRun) {gCheck.push("css:computed styles: " + error.name +" : "+ error.message)}
			return resolve("computed_styles:error")
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
		get_colors("moz-stand-in"),
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
