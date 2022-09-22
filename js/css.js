'use strict';

// sims
let intCSS = 0

function get_colors() {
	let t0; if (canPerf) {t0 = performance.now()}
	/* 95+: test_bug232227.html */
	let aList = [
		// 23 deprecated
		// https://www.w3.org/TR/css-color-4/#deprecated-system-colors
		'ActiveBorder','ActiveCaption','AppWorkspace','Background','ButtonHighlight','ButtonShadow',
		'CaptionText','InactiveBorder','InactiveCaption','InactiveCaptionText','InfoBackground',
		'InfoText','Menu','MenuText','Scrollbar','ThreeDDarkShadow','ThreeDFace','ThreeDHighlight',
		'ThreeDLightShadow','ThreeDShadow','Window','WindowFrame','WindowText',
		// css4 19+5
		// https://www.w3.org/TR/css-color-4/#typedef-system-color
		'AccentColor','AccentColorText','ActiveText','ButtonBorder','ButtonFace','ButtonText',
		'Canvas','CanvasText','Field','FieldText','GrayText','Highlight','HighlightText','LinkText',
		'Mark','MarkText','SelectedItem','SelectedItemText','VisitedText','-moz-activehyperlinktext',
		'-moz-default-color','-moz-default-background-color','-moz-hyperlinktext','-moz-visitedhyperlinktext',
		// stand-ins
		'-moz-buttondefault','-moz-buttonhoverface','-moz-buttonhovertext','-moz-cellhighlight',
		'-moz-cellhighlighttext','-moz-combobox','-moz-comboboxtext','-moz-dialog','-moz-dialogtext',
		'-moz-dragtargetzone','-moz-eventreerow','-moz-field','-moz-fieldtext','-moz-html-cellhighlight',
		'-moz-html-cellhighlighttext','-moz-mac-chrome-active','-moz-mac-chrome-inactive',
		'-moz-mac-disabledtoolbartext','-moz-mac-focusring','-moz-mac-menuselect','-moz-mac-menushadow',
		'-moz-mac-menutextdisable','-moz-mac-menutextselect','-moz-mac-secondaryhighlight',
		'-moz-menubarhovertext','-moz-menubartext','-moz-menuhover','-moz-menuhovertext',
		'-moz-nativehyperlinktext','-moz-oddtreerow','-moz-win-communicationstext','-moz-win-mediatext',
		// moz: FF102+ items: note append last due to variable length
		'-moz-mac-active-menuitem','-moz-mac-active-source-list-selection','-moz-mac-defaultbuttontext',
		'-moz-mac-menuitem','-moz-mac-menupopup','-moz-mac-source-list','-moz-mac-source-list-selection',
		'-moz-mac-tooltip','-moz-mac-vibrant-titlebar-dark','-moz-mac-vibrant-titlebar-light', // last two dropped FF103
	]
	if (isVer < 102) {
		let aMozExtra = [
			'-moz-mac-buttonactivetext', // dropped FF93
			'-moz-mac-vibrancy-dark','-moz-mac-vibrancy-light','-moz-win-accentcolor','-moz-win-accentcolortext', // dropped FF88
			'-moz-gtk-info-bar-text', // dropped FF90
			// dropped FF78 or lower
			'-moz-accent-color','-moz-accent-color-foreground','-moz-appearance','-moz-colheaderhovertext',
			'-moz-colheadertext','-moz-gtk-buttonactivetext','-moz-mac-accentdarkestshadow',
			'-moz-mac-accentdarkshadow','-moz-mac-accentface','-moz-mac-accentlightesthighlight',
			'-moz-mac-accentlightshadow','-moz-mac-accentregularhighlight','-moz-mac-accentregularshadow',
			'-moz-win-communications-toolbox','-moz-win-media-toolbox',
		]
		aList = aList.concat(aMozExtra)
	}
	let aResults = [], maxRes = 4
	let sNames = ["system","css4","moz_stand-in","moz"]
	sNames.forEach(function(name) {sDetail["css_colors_"+ name] = []})
	if (!isFF) {
		aList = aList.slice(0,42) // drop everything -moz
		maxRes = 2
		aResults.push("colors_"+ sNames[2] +":"+ zNA)
		aResults.push("colors_"+ sNames[3] +":"+ zNA)
		document.getElementById("cssColor"+ sNames[2]).innerHTML = zNA
		document.getElementById("cssColor"+ sNames[3]).innerHTML = zNA
	}
	let splits = [0, 23, 47, 79, aList.length]

	try {
		let aRes = []
		let element = dom.sColorElement
		let strColor = "rgba(1, 2, 3, 0.5)"
		aList.forEach(function(style) {
			element.style.backgroundColor = strColor // reset color to see what is obsolete
			element.style.backgroundColor = style
			let rgb = window.getComputedStyle(element, null).getPropertyValue("background-color")
			aRes.push(rgb == strColor ? "x" : style +":"+ rgb)
		})

		// split/hash
		for (let i=0; i < maxRes; i++) {
			let aTemp = aRes.slice(splits[i], splits[i+1])
			aTemp = aTemp.filter(x => !["x"].includes(x)) // remove unaffected
			aTemp.sort() // sort for readability
			let hash = mini_sha1(aTemp.join(), "css colors " + sNames[i])
			let btn = buildButton("14", "css_colors_"+ sNames[i], aTemp.length)
			sDetail["css_colors_"+ sNames[i]] = aTemp
			aResults.push("colors_"+ sNames[i] +":"+ hash)
			let note = ""
			if (isFF & isTZPSmart) {
				if (sNames[i] == "moz_stand-in") {
					// moz stand-ins
					note = rfp_red
					if (isVer > 92) {
						if (hash == "27b4dd7edd7d78b177b1234c9111217560722348" && isVer > 93) {note = rfp_green + " [FF94+]" // 1734115
						} else if (hash == "ab375b151b2252ba3d75295dc535678cf0b2d52b" && isVer < 94) {note = rfp_green + " [FF93]"} // 1693222
					} else {
						if (hash == "4e28ed980bab05100cd20972c87c8c5cb3e8075f") {note = rfp_green + " [FF67-92]"}
					}
				}// else if (sNames[i] == "moz") {
				//	if (gRun) {log_debug("moz colors", hash+ "<br>    "+ aTemp.join("<br>    "))}
				//} else if (sNames[i] == "css4") {
				//	if (gRun & isOS == "android") {log_debug("css4 colors", hash+ "<br>    "+ aTemp.join("<br>    "))}
				//}
			}
			document.getElementById("cssColor"+ sNames[i]).innerHTML = hash + btn + note
		}
		log_perf("colors [css]",t0)
 		return aResults
	} catch(e) {
		let eMsg = log_error("css: colors", e.name, e.message)
		for (let i=0; i < 4; i++) {
			document.getElementById("cssColor"+ sNames[i]).innerHTML = eMsg
			aResults.push("colors_"+ sNames[i] +":"+ zErr)
		}
		return aResults
	}
}

function get_computed_styles() {
	/* https://github.com/abrahamjuliot/creepjs */
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
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
					log_error("css: "+ names[type], e.name, e.message)
					return resolve("error")
				}
			})
		}
		// clear
		let names = ["getcomputed","htmlelement","cssrulelist"]
		let sNames = ["css_getcomputed","css_htmlelement","css_cssrulelist"]
		sDetail["css_computed_styles"] = []
		sNames.forEach(function(k){sDetail[k + "_fake_skip"] = []})
		sNames.forEach(function(k){sDetail[k + "_reported_notglobal"] = []})

		// run
		Promise.all([
			styleVersion(0),
			styleVersion(1),
			styleVersion(2)
		]).then(res => {
			let blankIndex = [], realIndex = [], fakeIndex = [], distinctRep = [], distinctReal = []
			let values = [], minivalues = [], btns = []
			let cMsg = ""
			// sim
			if (runCSS) {
				if (isFile) {
					let devMsg = "#SIM css styles: set privacy.file_unique_origin = false for file:// scheme"
					if (isVer > 94) {
						devMsg = "SIM css styles: FF95+ cannot use file:// scheme" // 1732052
						runCSS = false
					}
					if (intCSS == 0) {console.error(devMsg)}
				}
			}
			// file:// override for CSSRuleList
			let fileSchemeOverride = (isFile && !runCSS ? true : false)
			if (isFile && !isFF) {fileSchemeOverride = true}
			// analyse
			for (let i=0; i < 3; i++) {
				let aRep = [], aReal = [], aFake = []
				try {
					aRep = res[i].keys // throws an error if blocked
					if (fileSchemeOverride && i==2) {aRep = res[1].keys}
					// sim
					if (runCSS) {
						// let k = y sims thrown error
						if (intCSS == 0) {cMsg = "all blocked"; let k=y
						} else if (intCSS == 1) {cMsg = "3 same fake"; aRep.push("fake")
						} else if (intCSS == 2) {cMsg = "1 block"; if (i == 1) {let k=y}
						} else if (intCSS == 3) {cMsg = "2 same fake, 1 block"; if (i == 1 || i == 2) {aRep.push("eh")} else if (i == 0) {let k=y}
						} else if (intCSS == 4) {cMsg = "2 same fake"; if (i == 0 || i == 2) {aRep.push("ugh")}
						} else if (intCSS == 5) {cMsg = "1 fake, 1 blocked"; if (i == 2) {aRep.push("foo","bar")} else if (i == 1) {let k=y}
						} else if (intCSS == 6) {cMsg = "2 diff fakes"; if (i==1) {aRep.push("woo")} else if (i==2) {aRep.push("wha","wee")}
						} else if (intCSS == 7) {cMsg = "2 diff fakes, 1 block"
							if (i==0) {aRep.push("a","b")} else if (i==1) {let k=y} else if (i==2) {aRep.push("ek")}
						} else if (intCSS == 8) {cMsg = "3 diff fakes"
							if (i==0) {aRep.push("x")} else if (i==1) {aRep.push("y")} else if (i==2) {aRep.push("z","k")}
						} else if (intCSS == 9) {cMsg = "at least 2 diff real results, 1 block"
							if (i==1) {aRep = aRep.filter(x => !["constructor"].includes(x)); aRep.push("y"); aRep.push("constructor")} else if (i==2) {let k=y}
						}
					}
					if (isFF) {
						let lastStyleIndex = aRep.indexOf("constructor")
						aFake = aRep.slice(lastStyleIndex+1)
						aReal = aRep.slice(0, lastStyleIndex+1)
					} else {
						aRep.sort()
						aReal = aRep
					}
					//if (i==0) {console.log(aReal.join("\n"))}

					// data
					let minivalue = mini(aRep.join(), "css computed style "+ i)
					minivalues.push(minivalue)
					let getsha1 = true
					if (i > 0) {
						if (minivalues[i-1] == minivalues[i]) {getsha1 = false}
					}
					let	value = getsha1 ? mini_sha1(aRep.join(), "css computed style "+ i) : values[i-1]
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
						distinctReal.push(mini_sha1(aReal.join(), "css computed styles "+ i +" real"))
					} else {
						sDetail[sNames[i] +"_reported_notglobal"] = aReal
						realIndex.push(i)
						distinctReal.push(value)
					}
					btns.push(btn)
				} catch(e) {
					blankIndex.push(i)
					values.push(zB0)
					btns.push("")
				}
			}
			distinctRep = distinctRep.filter(function(item, position) {return distinctRep.indexOf(item) === position})
			distinctReal = distinctReal.filter(function(item, position) {return distinctReal.indexOf(item) === position})
			let bCount = blankIndex.length
			// showhide
			let isSame = (distinctRep.length == 1 && bCount == 0 || bCount == 3)
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
					gMethods.push("css:computed_styles:blocked:"+ (blank.length == 3 ? "all": blank.join()))
					if (bCount !== 3) {isLie = true}
				}
				if (fakeIndex.length) (isLie = true)
				if (isLie) {gKnown.push("css:computed_styles")}
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
					gBypassed.push("css:computed_styles:"+ (bypass.length == 3 ? "all" : bypass.join()) +":"+ value)
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
			if (distinctRep.length > 1) {log_alert("css:computed_styles: multiple hashes")}
			if (gRun) {
				if (value == zLIE) {gKnown.push("css:computed_styles")}
			}
			// return
			log_perf("computed styles [css]",t0)
			if (runCSS) {
				console.log("SIM #"+ intCSS +" css styles:", cMsg)
				console.log(" - returning", value)
				intCSS++; intCSS = intCSS % 10
			}
			return resolve("computed_styles:"+ value)
		}).catch(error => {
			log_alert("css:computed_styles: " + error.name +" : "+ error.message)
			return resolve("computed_styles:error")
		})
	})
}

function get_mm_css() {
	return new Promise(resolve => {
		function get_mm(type, id, expected) {
			let x = zNS, x2 = "", n="no-preference", q=type +": "
			try {
				if (window.matchMedia("("+ q + n +")").matches) {x = n
				} else if (window.matchMedia("("+ q +"light)").matches) {x = "light"
				} else if (window.matchMedia("("+ q +"dark)").matches) {x = "dark"
				} else if (window.matchMedia("("+ q +"reduce)").matches) {x = "reduce"
				} else if (window.matchMedia("("+ q +"none)").matches) {x = "none"
				} else if (window.matchMedia("("+ q +"high)").matches) {x = "high"
				} else if (window.matchMedia("("+ q +"low)").matches) {x = "low"
				} else if (window.matchMedia("("+ q +"active)").matches) {x = "active"
				} else if (window.matchMedia("("+ q +"forced)").matches) {x = "forced" // 1694864: removed FF88
				}
			} catch(e) {
				log_error("css: matchmedia_"+ type, e.name, e.message)
				x = zErr
			}
			// notate/display
			if (runSL) {x = "apple"}
			let display = x
			// lies
			if (isTZPSmart) {
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
				if (expected !== undefined && x2 == x) {
					display += (x == expected ? rfp_green : rfp_red)
				}
				x = (x2 == "x" ? x : x2)
			}
			document.getElementById("mm"+id).innerHTML = display
			res.push(q.trim() + x)
		}
		let res = []
		get_mm("prefers-reduced-motion","PRM","no-preference") // FF63+
		get_mm("prefers-color-scheme","PCS","light") // FF67+: 1494034
		get_mm("forced-colors","FC") // FF89+: 1659511: not RFP protected
		get_mm("prefers-contrast","PC")
		// ToDo: contrast: RFP & version check
			// 1506364: layout.css.prefers-contrast.enabled / browser.display.prefers_low_contrast boolean [hidden]
		return resolve(res)
	})
}

function outputCSS() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = []
	Promise.all([
		get_mm_css(),
		get_colors(),
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
