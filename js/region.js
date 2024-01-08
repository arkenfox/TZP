'use strict';

/* HEADERS */

const get_nav_connection = () => new Promise(resolve => {
	const METRIC = "connection"
	let notation = ""
	function finish(value, display) {
		if (isSmart) {notation = display == "undefined" ? default_green: default_red}
		log_display(5, METRIC, display + notation)
		return resolve([METRIC, value])
	}
	try {
		let nav = navigator.connection
		if (runSE) {foo++} else if (runST) {nav = null
		} else if (runSL && isSmart) {sData[SECT99].push("Navigator.connection")}
		if (nav === undefined || "object" === typeof nav) {
			if (nav === undefined) {
				nav +=""
				let display = nav
				if (isSmart && sData[SECT99].includes("Navigator.connection")) {
					nav = zLIE
					display = colorFn(display)
					log_known(SECT5, METRIC)
				}
				finish(nav, display)
			} else {
				if (nav +"" === "[object NetworkInformation]") {
					// at this point there should be no lies
					let oTemp = {}, oNetwork = {}
					// https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
					let keyTypes = {
						"addEventListener": "function",
						"dispatchEvent": "function",
						"ontypechange": "object",
						"removeEventListener": "function",
						"type": "string",
					}
					for (let key in navigator.connection) {
						let keyValue = navigator.connection[key]
						let keyType = typeof keyValue
						if ("function" === keyType) {oTemp[key] = keyType} else {oTemp[key] = keyValue}
					}
					// sort
					for (const k of Object.keys(oTemp).sort()) {oNetwork[k] = oTemp[k]}
					if (Object.keys(oNetwork).length > 0) {
						let hash = mini(oNetwork), isLies = false
						if (isSmart) {
							notation = default_red
							if (sData[SECT99].includes("Navigator.connection")) {
								addDetail(METRIC, oNetwork)
								log_display(5, METRIC, colorFn(hash) + addButton(5, METRIC) + notation)
								log_known(SECT5, METRIC)
								return resolve([METRIC, zLIE])
							}
						}
						// yay!
						addData(5, METRIC, oNetwork, hash)
						log_display(5, METRIC, hash + addButton(5, METRIC) + notation)
						return resolve()
					} else {
						// can't imagine this but who knows
						finish(zErr, log_error(SECT5, METRIC, zErrEmpty +": "+ cleanFn(oNetwork)))
					}
				} else {
					finish(zErr, log_error(SECT5, METRIC, zErrInvalid + cleanFn(nav)))
				}
			}
		} else {
			finish(zErr, log_error(SECT5, METRIC, zErrType + typeof nav))
		}
	} catch(e) {
		finish(zErr, log_error(SECT5, METRIC, e))
	}
})

const get_nav_dnt = () => new Promise(resolve => {
	// expected nav: i.e you can't remove it
	const METRIC = "doNotTrack"
	function exit(value, display) {
		log_display(5, METRIC, display +"")
		return resolve([METRIC, value])
	}
	try {
		let value = navigator[METRIC]
		if (runST) {value = 1}
		let display = value
		if (isGecko) {
			if ("1" !== value && "unspecified" !== value) {
				if ("string" === typeof value) {
					display = log_error(SECT5, METRIC, zErrInvalid + cleanFn(value))
				} else {
					display = log_error(SECT5, METRIC, zErrType + typeof value)
				}
				value = zErr
			}
		}
		exit(value, display)
	} catch(e) {
		exit(zErr, log_error(SECT5, METRIC, e))
	}
})

const get_nav_gpc = () => new Promise(resolve => {
	// GPC: 1670058
		// privacy.globalprivacycontrol.functionality.enabled = navigator
		// privacy.globalprivacycontrol.enabled = true/false
	const METRIC = "globalPrivacyControl"
	function exit(value, display) {
		let notation = ""
		if (isSmart) {
			if (isVer < 120) {
				notation = (value == "undefined" ? default_green : default_red)
			}
			// FF120+ desktop (not sure about android): gpc enabled: default false, but true pbmode
			// since we can't really distinguish PBmode (cache aside for now) then don't both notating
		}
		log_display(5, METRIC, display + notation)
		return resolve([METRIC, value])
	}
	try {
		let value = navigator[METRIC]
		if ("boolean" !== typeof value) {value = cleanFn(value)}
		if (runST) {value = zUQ} else if (runSL && isSmart) {sData[SECT99].push("Navigator."+ METRIC)}
		let display = value
		if ("boolean" !== typeof value && value !== "undefined") {
			value = zErr
			display = log_error(SECT5, METRIC, zErrType + typeof value)
		} else if (isSmart && sData[SECT99].includes("Navigator."+ METRIC)) {
			value = zLIE
			display = colorFn(display)
			log_known(SECT5, METRIC)
		}
		exit(value, display)
	} catch(e) {
		exit(zErr, log_error(SECT5, METRIC, e))
	}
})

/* REGION */

const set_isLanguageSmart = () => new Promise(resolve => {
	// limited to TB/MB
		// ToDo: android may differ, ignore for now
	isLanguageSmart = (isSmart && isTB && isOS !== "android")
	if (!isLanguageSmart) {
		return
	}
	const en = "en-US, en"
	languagesSupported = {
		// language = existing key | languages = key + value[0] | locale = key unless value[1] !== undefined
		"ar": [en],
		"ca": [en],
		"cs": ["sk, "+ en],
		"da": [en],
		"de": [en],
		"el-GR": ["el, "+ en, "el"],
		"en-US": ["en"],
		"es-ES": ["es, "+ en],
		"fa-IR": ["fa, "+ en, "fa"],
		"fi-FI": ["fi, "+ en, "fi"],
		"fr": ["fr-FR, "+ en],
		"ga-IE": ["ga, en-IE, en-GB, "+ en],
		"he": ["he-IL, "+ en],
		"hu-HU": ["hu, "+ en, "hu"],
		"id": [en],
		"is": [en],
		"it-IT": ["it, "+ en, "it"],
		"ja": [en],
		"ka-GE": ["ka, "+ en, "ka"],
		"ko-KR": ["ko, "+ en, "ko"],
		"lt": [en +", ru, pl"],
		"mk-MK": ["mk, "+ en, "mk"],
		"ms": [en],
		"my": ["en-GB, en"],
		"nb-NO": ["nb, no-NO, no, nn-NO, nn, "+ en],
		"nl": [en],
		"pl": [en],
		"pt-BR": ["pt, "+ en],
		"ro-RO": ["ro, en-US, en-GB, en", "ro"],
		"ru-RU": ["ru, "+ en, "ru"],
		"sq": ["sq-AL, "+ en],
		"sv-SE": ["sv, "+ en],
		"th": [en],
		"tr-TR": ["tr, "+ en, "tr"],
		"uk-UA": ["uk, "+ en, "uk"],
		"vi-VN": ["vi, "+ en, "vi"],
		"zh-CN": ["zh, zh-TW, zh-HK, "+ en, "zh-Hans-CN"],
		"zh-TW": ["zh, "+ en, "zh-Hant-TW"],
	}
	localesSupported = {
		"ar": {v: "9fa7589d", xml: "aaffcd08"},
		"ca": {v: "f357beb7", xml: "7beb7ea5"},
		"cs": {v: "aba57df4", xml: "f2b4bcae"},
		"da": {v: "d9827dd4", xml: "1a0c5509"},
		"de": {v: "9d1afee7", xml: "68446b62"},
		// el: xml n30 = english but is would-be-n39 "reserved prefix (xmlns) must not be declared or undeclared"
			// changing to spoof english returns n30.. phew!
		"el": {v: "f79d4f6d", xml: "0d108497"},
		"en-US": {v: "e29f9dc9", xml: "7d699e6d"},
		"es-ES": {v: "c5869938", xml: "5de681ef"},
		"fa": {v: "0e4865f6", xml: "999d2774"},
		"fi": {v: "9e5c52b8", xml: "bfd2e337"},
		"fr": {v: "34d60989", xml: "7c23726c"},
		"ga-IE": {v: "664f97a2", xml: "c2ef923b"},
		// he: xml n28 + n30 = english
		"he": {v: "190a5791", xml: "06d23609"},
		"hu": {v: "41d3ec54", xml: "fc6a4518"},
		"id": {v: "b7a10cb1", xml: "a1523a88"},
		"is": {v: "f5a54602", xml: "5acd311d"},
		"it": {v: "dcfd7d74", xml: "0de8610d"},
		"ja": {v: "faf9fd23", xml: "986a79a4"},
		"ka": {v: "706a5318", xml: "0732462e"},
		"ko": {v: "c23cb712", xml: "55386c69"},
		"lt": {v: "36518f84", xml: "b0466824"},
		// mk: v = english, and xml n30 = english but is would-be-n39 (same as el)
			// and n28 = english
		"mk": {v: "e29f9dc9", xml: "a85f1290"},
		"ms": {v: "eda0f943", xml: "ad5a2234"},
		// my: two items in english: date+over/under
		"my": {v: "45e1804c", xml: "a0194cad"},
		// nb-NO: xml most is english
		"nb-NO": {v: "4a30cadc", xml: "2808247b"},
		"nl": {v: "e76737e7", xml: "dbfd6c59"},
		"pl": {v: "f9319f36", xml: "f4033f7f"},
		"pt-BR": {v: "7febcf44", xml: "6f34c571"},
		"ro": {v: "4a3ecc22", xml: "0b2be0cc"},
		"ru": {v: "cfdcb459", xml: "a0b4b56f"},
		"sq": {v: "920f04d4", xml: "49380742"},
		"sv-SE": {v: "812b8c4a", xml: "c3d602ca"},
		"th": {v: "40cd0883", xml: "225110a2"},
		"tr": {v: "05623887", xml: "09a2b85c"},
		"uk": {v: "0ff7de14", xml: "2989c268"},
		"vi": {v: "e1cde994", xml: "a87bbc82"},
		"zh-Hans-CN": {v:"9c846ddc", xml: "f6112799"},
		"zh-Hant-TW": {v: "59a93745", xml: "94ff0e78"},
	}
	if (isMullvad) {
		// 22 of 38 supported
		let notSupported = [
			// lang
			"ca","cs","el-GR","ga-IE","he","hu-HU","id","is","ka-GE","lt","mk-MK","ms","ro-RO","sq","uk-UA","vi-VN",
			// + locales
			"el","hu","ka","mk","ro","uk","vi",
		]
		notSupported.forEach(function(key){
			delete languagesSupported[key]
			delete localesSupported[key]
		})
	}
	return resolve()
})

const set_oIntlTests = () => new Promise(resolve => {

	let unitN = {"narrow": [1]}, unitL = {"long": [1]}, unitB = {"long": [1], "narrow": [1]}
	let tzDays = [new Date("August 1, 2019 0:00:00 UTC")],
		tzLG = {"longGeneric": tzDays},
		tzSG = {"shortGeneric": tzDays}

	oIntlTests = {
		"collation": [
			'A','a','aa','ch','ez','kz','ng','ph','ts','tt','y','\u00E2','\u00E4','\u00E7\a','\u00EB','\u00ED','\u00EE','\u00F0',
			'\u00F1','\u00F6','\u0107','\u0109','\u0137\a','\u0144','\u0149','\u01FB','\u025B','\u03B1','\u040E','\u0439','\u0453',
			'\u0457','\u04F0','\u0503','\u0561','\u05EA','\u0627','\u0649','\u06C6','\u06C7','\u06CC','\u06FD','\u0934','\u0935',
			'\u09A4','\u09CE','\u0A85','\u0B05','\u0B85','\u0C05','\u0C85','\u0D85','\u0E24','\u0E9A','\u10350','\u10D0','\u1208',
			'\u1780','\u1820','\u1D95','\u1DD9','\u1ED9','\u1EE3','\u311A','\u3147','\u4E2D','\uA647','\uFB4A',
		],
		"compact": [[-1100000000,"short"], [0/0,"long"], [1000,"long"], [2e6,"long"], [6.6e12,"long"], [7e15,"long"]],
		"currency": [
			[{style: "currency", currency: "USD", currencySign: "accounting"}, -1000],
			[{style: "currency", currency: "USD", currencyDisplay: "name"}, -1],
			[{style: "currency", currency: "USD", currencyDisplay: "symbol"}, 1000]
		],
		"listformat": [
			["narrow","conjunction"],["narrow","disjunction"],["narrow","unit"],["short","conjunction"],["short","unit"]
		],
		"notation": [
			[0/0, "standard", "decimal"],
			[-1000, "standard", "decimal"],
			[987654, "standard", "decimal"],
			[1000, "standard", "percent"]
		],
		"number_formattoparts": {
			"decimal": [1.2],"group": [1000, 99999],"infinity": [Infinity],"minusSign": [-5],"nan": ["a"]
		},
		"pluralrules": {
			"cardinal": [0, 1, 2, 3, 7, 21, 100], // 1859752 ICU 74: add ordinal 81 to keep lij unique from it,sc
			"ordinal": [1, 2, 3, 5, 8, 10, 81]
		},
		"relativetime_formattoparts": [
			["0","day"],["1","day"],["1","week"],["1","year"]
		],
		"sign": [-1, 0/0],
		"timezonename": {
			"Africa/Douala": tzLG,
			"Asia/Hong_Kong": tzSG,
			"Asia/Muscat": tzSG,
			"Asia/Seoul": tzLG,
			"Europe/London": tzSG,
		},
		"unit": {
			"byte": unitN, // ICU 74
			"fahrenheit": unitB,
			"foot": unitL,
			"hectare": {"long": [1], "short": [987654]},
			"kilometer-per-hour": unitN,
			"millimeter": unitN,
			"month": unitB,
			"nanosecond": unitN,
			"percent": unitB,
			"second": {"long": [1], "narrow": [1], "short": [987654]},
			"terabyte": unitL,
		}
	}
	try {oIntlTests["compact"].push([BigInt("987354000000000000"),"long"])} catch(e) {}
	let nBig = 987654
	try {nBig = BigInt("987354000000000000")} catch(e) {}
	oIntlTests["notation"].push([nBig, "scientific","decimal"])

})

const get_geo = () => new Promise(resolve => {
	const METRIC = "geolocation"
	// nav
	let value, display
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		/* test
		keys = keys.filter(x => !["geolocation"].includes(x))
		keys.push("geolocation")
		//*/
		value = keys.includes(METRIC) ? zE : zD
		display = value
		if (isSmart) {
			// this only detects enabled as untrustworthy
			if (keys.indexOf(METRIC) > keys.indexOf("constructor")) {
				value = zLIE
				display = colorFn(zE)
				log_known(SECT4, METRIC +"_navigator")
			}
		}
	} catch(e) {
		value = zErr, display = value
		log_error(SECT4, METRIC +"_navigator", e)
	}
	// window
	let geoWin
	try {
		geoWin = "Geolocation" in window ? true : false
	} catch(e) {
		geoWin = zErr
		log_error(SECT4, METRIC +"_window", e)
	}
	value += " | "+ geoWin
	display += " | "+ geoWin

	function exit() {
		let notation = ""
		if (isSmart) {
			let rhash = mini(display) // use display
			if (isTB) {
				// TB ESR78+: disabled, true, prompt
				notation = rhash == "94bf0c73" ? default_green : default_red
			} else {
				// FF72+: enabled, true, prompt
				notation = rhash == "6046a6a8" ? default_green : default_red
			}
		}
		log_display(4, METRIC, display + notation)
		addData(4, METRIC, value)
		return resolve()
	}
	function geoState(state) {
		value += " | "+ state
		display += " | "+ state
		exit()
	}
	try {
		if (runSE) {foo++}
		navigator.permissions.query({name:"geolocation"}).then(e => geoState(e.state))
	} catch(e) {
		log_error(SECT4, METRIC +"_permission", e)
		value += " | "+ zErr
		display += " | "+ zErr
		exit()
	}
})

const get_language_locale = () => new Promise(resolve => {
	let notation = ""
	isLocaleValid = false
	isLocaleValue = undefined

	// LANGUAGES
	function get_langmetric(m) {
		try {
			let test = navigator[m]
			if (m == "language") {
				if ("string" !== typeof test) {log_error(SECT4, m, zErrType + typeof test); return zErr} else {return test}
			} else if ("object" !== typeof test) {
				log_error(SECT4, m, zErrType + typeof check)
				return zErr +" "+ check + " | "+ typeof check
			} else {
				return test.join(", ") // catch non-arrays
			}
		} catch(e) {
			log_error(SECT4, m, e)
			return zErr
		}
	}
	let oData = {}, metrics = ['language','languages']
	metrics.forEach(function(m) {oData[m] = cleanFn(get_langmetric(m))})
	Object.keys(oData).forEach(function(METRIC){
		notation = ""
		if (isLanguageSmart) {
			notation = tb_red
			if (languagesSupported[oData.language] !== undefined) {
				if (METRIC == "language") {notation = tb_green
				} else {if (oData[METRIC] == oData.language +", "+ languagesSupported[oData.language][0]) {notation = tb_green}
				}
			}
		}
		log_display(4, METRIC, oData[METRIC] + notation)
		addData(4, METRIC, oData[METRIC])
	})

	// LOCALES
	function get_locmetric(m) {
		let r
		try {
			if (m == "collator") {if (runSL) {r = "en-FAKE"}; r = oConst.C.resolvedOptions().locale
			} else if (m == "datetimeformat") {r = oConst.DTF.resolvedOptions().locale
			} else if (m == "displaynames") {r = new Intl.DisplayNames(undefined, {type: "region"}).resolvedOptions().locale
			} else if (m == "listformat") {r = new Intl.ListFormat().resolvedOptions().locale
			} else if (m == "numberformat") {r = oConst.NF.resolvedOptions().locale
			} else if (m == "pluralrules") {r = oConst.PR.resolvedOptions().locale
			} else if (m == "relativetimeformat") {r = oConst.RTF.resolvedOptions().locale
			} else if (m == "segmenter") {r = new Intl.Segmenter().resolvedOptions().locale
			}
			if (runSL) {r = "fa"}
//r="fa" //test
			if ("string" !== typeof r) {
				log_error(SECT4, m, zErrType + typeof r); r = zErr
			}
			let check = Intl.DateTimeFormat.supportedLocalesOf([r])
			return r
		} catch(e) {
			log_error(SECT4, m, e)
			return zErr
		}
	}
	let res = []
	metrics = [
		"collator","datetimeformat","displaynames","listformat",
		"numberformat","pluralrules","relativetimeformat","segmenter",
	]
	metrics.forEach(function(m) {
		res.push(cleanFn(get_locmetric(m)))
	})

	// LOCALES
	let METRIC = "locale", fpvalue
	let value = res.join(" | ")
	log_display(4, METRIC +"data", value)

	// LOCALE
	notation = ""
	// remove errors and dupes
	res = res.filter(x => ![zErr].includes(x))
	res = res.filter(function(item, position) {return res.indexOf(item) === position})
	if (res.length == 1) {
		value = res[0]
		fpvalue = value
		isLocaleValue = value
		isLocaleValid = true
	} else if (res.length == 0) {
		value = zErr; fpvalue = zErr
	} else {
		value = "mixed"
		fpvalue = "mixed"
		if (isSmart) {
			fpvalue = zLIE
			value = colorFn(value)
			log_known(SECT4, METRIC)
		}
	}
	addData(4, METRIC, fpvalue)
	if (isLanguageSmart) {
		notation = tb_red
		let key = oData.language
		// only green if TB supported
		if (languagesSupported[key] !== undefined) {
			let expected = languagesSupported[key][1] == undefined ? key : languagesSupported[key][1]
			if (value === expected) {notation = tb_green}
		}
	}
	log_display(4, METRIC, value + notation)
	return resolve()
})

const get_locale_intl = () => new Promise(resolve => {
	const METRIC = "locale_intl"
	let t0 = nowFn(), notation = ""

	function get_metric(m, code) {
		try {
			let res = []
			if (m == "collation") {
				res = oIntlTests[m].sort() // always re-sort
				return res.sort(C.compare).join(", ")
			} else if (m == "compact") {
				oIntlTests[m].forEach(function(pair){let f = pair[1] == "long" ? NFCl : NFCs; res.push(f.format(pair[0]))})
			} else if (m == "currency") {
				oIntlTests[m].forEach(function(pair) {res.push(Intl.NumberFormat(code, pair[0]).format(pair[1]))})
			} else if (m == "dayperiod") {
				const hr08 = new Date("2019-01-30T08:00:00")
				const hr12 = new Date("2019-01-30T12:00:00")
				const hr15 = new Date("2019-01-30T15:00:00")
				const hr18 = new Date("2019-01-30T18:00:00")
				const hr22 = new Date("2019-01-30T22:00:00")
				// 3 options: always use h12
				let dteS = new Intl.DateTimeFormat(code, {hourCycle: "h12", dayPeriod: "short"}),
					dteN = new Intl.DateTimeFormat(code, {hourCycle: "h12", dayPeriod: "narrow"}),
					dteL = new Intl.DateTimeFormat(code, {hourCycle: "h12", dayPeriod: "long"})
				// 6 or 7 tests max required
				let period1 = dteN.format(hr08) // narrow08
				let period2 = dteL.format(hr08) // long08
				if (period1 == period2) {res.push(period1)} else {res.push(period1 +" / "+ period2)}
				res.push( dteS.format(hr12)) // short12
				period1 = dteN.format(hr15) // narrow15
				period2 = dteS.format(hr15) // short15
				if (period1 == period2) {res.push(period1)} else {res.push(period1 +" / "+ period2)}
				res.push( dteS.format(hr18)) // short18
				res.push( dteL.format(hr22)) // long22
			} else if (m == "listformat") {
				oIntlTests[m].forEach(function(pair) {res.push(new Intl.ListFormat(code,{style: pair[0], type: pair[1]}).format(["a","b","c"]))})
			} else if (m == "notation") {
				oIntlTests[m].forEach(function(array) {
					if (array[1] + array[2] == "standarddecimal") {
						res.push(NF.format(array[0])) // default standard/decimal
					} else {
						res.push(Intl.NumberFormat(code, {notation: array[1], style: array[2]}).format(array[0]))
					}
				})
			} else if (m == "number_formattoparts") {
				function get_value(type, parts) {
					try {
						let str = "none"
						for (let i = 0 ; i < parts.length; i++) {
							if (parts[i]["type"] === type) {
								str = parts[i]["value"]
								str = str.length == 1 ? str.charCodeAt(0) : str
								return str // stop checking
							}
						}
						return str
					} catch(e) {return " error"}
				}
				Object.keys(oIntlTests[m]).forEach(function(type){
					oIntlTests[m][type].forEach(function(num){
						res.push(get_value(type, NF.formatToParts(num)))
					})
				})
			} else if (m == "pluralrules") {
				let tmpobj = {}
				for (const k of Object.keys(oIntlTests[m])) {
					res = []
					let formatter = k == "cardinal" ? PR : PRo
					let nos = oIntlTests[m][k], prev = "", current = ""
					nos.forEach(function(num){
						current = formatter.select(num)
						if (prev !== current) {res.push(num +": "+ current)}
						prev = current
					})
					tmpobj[k] = res.join(" | ")
				}
				let hash = mini(tmpobj)
				return {"hash": mini(tmpobj), "metrics": tmpobj}
			} else if (m == "relativetime") {
				// rtf: 8 of 12 min
				let IntlRTFlong = new Intl.RelativeTimeFormat(code, {style: "long", numeric: "auto"})
				let IntlRTFalways = new Intl.RelativeTimeFormat(code, {style: "narrow", numeric: "always"})
				res.push(
					RTF.format(0,"second"), // autonarrow0second
					RTF.format(1,"second"), // autonarrow1second
					IntlRTFlong.format(1,"second"),	// autolong1second
					RTF.format(3,"second"), // autonarrow3second
					IntlRTFalways.format(1,"day"), // alwaysnarrow1day
					RTF.format(3,"day"), // autonarrow3day
					RTF.format(0,"quarter"), // autonarrow0quarter
					IntlRTFalways.format(0,"year") // alwaysnarrow0year
				)
			} else if (m == "relativetime_formattoparts") {
				// rtf: 4 of 12 min: auto narrow
				function parts(length, value) {
					let output = "", tmp = RTF.formatToParts(length, value)
					for (let x=0; x < tmp.length; x++) {output += tmp[x].value}
					return output
				}
				oIntlTests[m].forEach(function(pair) {res.push(parts(pair[0], pair[1]))})
			} else if (m == "sign") {
				let formatter = new Intl.NumberFormat(code, {signDisplay: "always"})
				oIntlTests[m].forEach(function(num){res.push(formatter.format(num))})
			} else if (m == "timezonename") {
				let tmpobj = {}
				let tests = oIntlTests[m]
				Object.keys(tests).forEach(function(tz){
					res = []
					Object.keys(tests[tz]).forEach(function(tzn){
						try {
							// note: use hour12 - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
								// ^ IDK if this is really needed here but it can't hurt
								// we use y+m+d numeric so toLocaleString will match
							let option = {year: "numeric", month: "numeric", day: "numeric", hour12: true, timeZone: tz, timeZoneName: tzn}
							let formatter = Intl.DateTimeFormat(code, option)
							tests[tz][tzn].forEach(function(dte){
								res.push(formatter.format(dte))
							})
						} catch (e) {} // ignore invalid
						tmpobj[tz] = res.join(" | ")
					})
				})
				return {"hash": mini(tmpobj), "metrics": tmpobj}
			} else if (m == "unit") {
				let itemtest = Intl.NumberFormat(code, {style: "unit", unit: "day"}) // trap error
				let tmpobj = {}
				let tests = oIntlTests[m]
				Object.keys(tests).sort().forEach(function(u){
					res = []
					Object.keys(tests[u]).forEach(function(ud){
						try {
							let formatter = Intl.NumberFormat(code, {style: "unit", unit: u, unitDisplay: ud})
							tests[u][ud].forEach(function(n){res.push(formatter.format(n))})
						} catch (e) {} // ignore invalid
					})
					tmpobj[u] = res.join(" | ")
				})
				return {"hash": mini(tmpobj), "metrics": tmpobj}
			}
			return res.join(" | ")
		} catch(e) {
			log_error(SECT4, METRIC +"_"+ m, e)
			return zErr
		}
	}

	let oData = {}, oString = {}, oCheck = {}
	let metrics = [
		"collation","compact", "currency", "dayperiod", "listformat","notation","number_formattoparts",
		"pluralrules","relativetime","relativetime_formattoparts","sign","timezonename","unit"
	]
	let strings = ["compact","currency","notation","sign","timezonename","unit"]
	let C = oConst.C, DTF = oConst.DTF, NF = oConst.NF, NFCl = oConst.NFCl,
		NFCs = oConst.NFCs, PR = oConst.PR, PRo = oConst.PRo, RTF = oConst.RTF

	metrics.forEach(function(m) {
		let value = get_metric(m, undefined) 
		oData[m] = value
		// create an intl version of tolocalestring
		if (strings.includes(m)) {
			oString[m] = value
		}
	})

	if (isSmart && isLocaleValid) {
		C = oConst.C2
		DTF = oConst.DTF2
		NF = oConst.NF2
		NFCl = oConst.NFCl2
		NFCs = oConst.NFCs2
		PR = oConst.PR2
		PRo = oConst.PRo2
		RTF = oConst.RTF2
		metrics.forEach(function(m) {
			oCheck[m] = get_metric(m, isLocaleValue)
		})
	}
	let hash = mini(oData)
	let isLies = false, btnDiff = ""
	if (isSmart) {
		notation = locale_red
		if (isLocaleValid) {
			if (hash == mini(oCheck)) {
				notation = locale_green
			} else {
				addDetail(METRIC +"_check", oCheck)
				btnDiff = addButton(4, METRIC +"_check", isLocaleValue +" check")
			}
		}
	}
	addData(4, METRIC, oData, hash)
	log_display(4, METRIC, hash + addButton(4, METRIC) + btnDiff + notation)
	log_perf(SECT4, METRIC, t0)
	return resolve(mini(oString))
})

const get_locale_resolvedoptions = () => new Promise(resolve => {
	const METRIC = "locale_resolvedoptions"
	let notation = ""

	function get_metric(m, code) {
		let r
		let type = "string"
		try {
			// collator
			if (m == "caseFirst") {r = C.resolvedOptions().caseFirst
			} else if (m == "ignorePunctuation") {type = "boolean"; r = C.resolvedOptions().ignorePunctuation
			// DTF
			} else if (m == "calendar") {r = DTF.resolvedOptions().calendar
			} else if (m == "day") {r = DTF.resolvedOptions().day
			} else if (m == "hourCycle") {r = Intl.DateTimeFormat(code, {hour: "numeric"}).resolvedOptions().hourCycle
			} else if (m == "month") {r = DTF.resolvedOptions().month
			} else if (m == "numberingSystem_dtf") {r = DTF.resolvedOptions().numberingSystem
			// NF
			} else if (m == "numberingSystem_nf") {r = NF.resolvedOptions().numberingSystem
			// PR
			} else if (m == "pluralCategories") {r = PR.resolvedOptions().pluralCategories.join(", ")
			// RTF
			} else if (m == "numberingSystem_rtf") {r = RTF.resolvedOptions().numberingSystem
			}
			if (type !== typeof r) {
				log_error(SECT4, METRIC +"_"+ m, zErrType + typeof r); r = zErr
			} else if (r === "") {
				log_error(SECT4, METRIC +"_"+ m, zErrInvalid + "empty string"); r = zErr
			}
			return r
		} catch(e) {
			log_error(SECT4, METRIC +"_"+ m, e)
			return zErr
		}
	}

	let oData = {}, oCheck = {}
	let C = oConst.C, DTF = oConst.DTF, NF = oConst.NF, PR = oConst.PR, RTF = oConst.RTF
	let metrics = [
		"calendar","caseFirst","day","hourCycle","ignorePunctuation","month",
		"numberingSystem_dtf","numberingSystem_nf","numberingSystem_rtf","pluralCategories",
	]
	metrics.forEach(function(m) {
		oData[m] = get_metric(m, undefined)
	})
	if (isSmart && isLocaleValid) {
		C = oConst.C2
		DTF = oConst.DTF2
		NF = oConst.NF2
		PR = oConst.PR2
		RTF = oConst.RTF2
		metrics.forEach(function(m) {
			oCheck[m] = get_metric(m, isLocaleValue)
		})
	}

	let hash = mini(oData)
	let isLies = false, btnDiff = ""
	if (isSmart) {
		notation = locale_red
		if (isLocaleValid) {
			if (hash == mini(oCheck)) {
				notation = locale_green
			} else {
				addDetail(METRIC +"_check", oCheck)
				btnDiff = addButton(4, METRIC +"_check", isLocaleValue +" check")
			}
		}
	}
	addData(4, METRIC, oData, hash)
	log_display(4, METRIC, hash + addButton(4, METRIC) + btnDiff + notation)
	return resolve()
})

const get_locale_tolocalestring = (isIntlHash) => new Promise(resolve => {
	let t0 = nowFn(), notation = ""
	const METRIC = "locale_tolocalestring"

	function get_metric(m, code) {
		try {
			let res = []
			if (m == "compact") {
				oIntlTests[m].forEach(function(pair){res.push((pair[0]).toLocaleString(code, {notation: "compact", compactDisplay: pair[1], useGrouping: true}))})
			} else if (m == "currency") {
				oIntlTests[m].forEach(function(pair) {res.push(Number(pair[1]).toLocaleString(code, pair[0]))})
			} else if (m == "notation") {
				oIntlTests[m].forEach(function(array) {res.push((array[0]).toLocaleString(code, {notation: array[1], style: array[2]}))})
			} else if (m == "sign") {
				oIntlTests[m].forEach(function(num){res.push((num).toLocaleString(code, {signDisplay: "always"}))})

			} else if (m == "timezonename") {
				let tmpobj = {}
				let tests = oIntlTests[m]
				Object.keys(tests).forEach(function(tz){
					res = []
					Object.keys(tests[tz]).forEach(function(tzn){
						try {
							// note: use hour12 - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
							let option = {year: "numeric", month: "numeric", day: "numeric", hour12: true, timeZone: tz, timeZoneName: tzn}
							tests[tz][tzn].forEach(function(dte){
								res.push((dte).toLocaleString(code, option))
							})
						} catch (e) {} // ignore invalid
						tmpobj[tz] = res.join(" | ")
					})
				})
				return {"hash": mini(tmpobj), "metrics": tmpobj}

			} else if (m == "unit") {
				let test = (1).toLocaleString("en", {style: "unit", unit: "day"}) // trap error
				let tmpobj = {}
				let tests = oIntlTests[m]
				Object.keys(tests).sort().forEach(function(u){
					res = []
					Object.keys(tests[u]).forEach(function(ud){
						try {
							tests[u][ud].forEach(function(n){res.push( (n).toLocaleString(code, {style: "unit", unit: u, unitDisplay: ud}))})
						} catch (e) {} // ignore invalid
					tmpobj[u] = res.join(" | ")
					})
				})
				return {"hash": mini(tmpobj), "metrics": tmpobj}
			}
			return res.join(" | ")
		} catch(e) {
			log_error(SECT4, METRIC +"_"+ m, e)
			return zErr
		}
	}

	let oData = {}, oCheck = {}
	let metrics = ["compact","currency","notation","sign","timezonename","unit"]
	metrics.forEach(function(m) {
		oData[m] = get_metric(m, undefined)
	})
	if (isSmart && isLocaleValid) {
		metrics.forEach(function(m) {
			oCheck[m] = get_metric(m, isLocaleValue)
		})
	}
	let hash = mini(oData)
	let isLies = false, btnDiff = ""
	if (isSmart) {
		log_display(4, METRIC +"_matches_intl", (hash == isIntlHash ? intl_green : intl_red))
		notation = locale_red
		if (isLocaleValid) {
			if (hash == mini(oCheck)) {
				notation = locale_green
			} else {
				addDetail(METRIC +"_check", oCheck)
				btnDiff = addButton(4, METRIC +"_check", isLocaleValue +" check")
			}
		}
	}
	addData(4, METRIC, oData, hash)
	log_display(4, METRIC, hash + addButton(4, METRIC) + btnDiff + notation)
	log_perf(SECT4, METRIC, t0)
	return resolve()
})

const get_timezone = () => new Promise(resolve => {
	const METRIC = "timezone"
	let notation = ""
	isTimeZoneValue = undefined

	function get_metric() {
		let r
		try {
			if (runSE) {foo++}
			r = oConst.DTF.resolvedOptions().timeZone
		} catch(e) {
			eMsg = log_error(SECT4, METRIC, e)
			return zErr
		}
		if ("string" !== typeof r) {
			eMsg = log_error(SECT4, METRIC, zErrType + typeof r); r = zErr
		} else if (r === "") {
			eMsg = log_error(SECT4, METRIC, zErrInvalid + "empty string"); r = zErr
		}
		return r
	}

	let eMsg
	let tz = get_metric()
	let isLies = false
	if (isSmart) {
		notation = tz == "UTC" ? rfp_green : rfp_red		
		// is it valid?
		if (tz !== zErr) {
			try {
				let control = new Date("January 1, 2018 13:00:00 UTC")
				let test = control.toLocaleString('en', {timeZone: tz})
				isTimeZoneValue = tz
			} catch(e) {
				isLies = true
				log_error(SECT4, METRIC, e)
				tz = colorFn(tz)
			}
		}
	}
	log_display(4, METRIC, (tz == zErr ? eMsg : tz) + notation)
	addData(4, METRIC, (isLies? zLIE: tz))
	return resolve()
})

const get_timezone_offsets = () => new Promise(resolve => {
	const METRIC = "timezone_offsets"
	let t0 = nowFn(), notation = ""

	/* example
  "timezone_offsets": {
    "hash": "b95c161a",
    "metrics": {
      "date.parse": [-780, -780, -720, -780],
      "date.parse_years": {
        "1879": [-690, -690],
        "1921": [-690, -690],
        "1952": [-720, -720],
        "1976": [-780, -720],
        "2018": [-780, -720]
      },
      "gettime": [-780, -780, -720, -780],
      "gettimezoneoffset": [-780, -780, -720, -780]
    }
  },
	*/
	//console.log(isTimeZoneValue)
	/*
		checks
		- date.parse, gettime, gettimezoneoffset == the same
		- s/be no NaNs
    - we can use isTimeZoneValue to recalculate and compare
	*/

	function get_offset(item) {
		try {
			if (item == "offsets") {
				let k = 60000, yr = 2021
				try {yr = Date().split` `[3]} catch(e) {
					try {yr = new Date().getFullYear()} catch(e) {}
				}
				let months = ["January","April","July","October"]
				let control = [], real = [], test = [], test2 = []
				months.forEach(function(month) {
					let date = month +" 1, "+ yr +" 13:00:00"
					control.push(new Date(date +" UTC"))
					real.push(new Date(date))
				})
				let tzres = {"gettime": [], "gettimezoneoffset": [], "date.parse": []}
				let subitem = "gettimezoneoffset"
				try {
					for (let i = 0; i < real.length; i++) {
						tzres[subitem].push(real[i].getTimezoneOffset())
					}
				} catch(e) {
					tzres[subitem] = [zErr]
					log_error(SECT4, subitem, e)
				}
				subitem = "gettime"
				try {
					for (let i = 0; i < control.length; i++) {
						tzres[subitem].push(
							((real[i].getTime() - control[i].getTime())/k)
						)
					}
				} catch(e) {
					tzres[subitem] = [zErr]
					log_error(SECT4, subitem, e)
				}
				subitem = "date.parse"
				try {
					for (let i = 0; i < control.length; i++) {
						tzres[subitem].push(
							((Date.parse(real[i]) - Date.parse(control[i]))/k)
						)
					}
				} catch(e) {
					tzres[subitem] = [zErr]
					log_error(SECT4, subitem, e)
				}
				return tzres
			} else if (item == "date.parse_years") {
				let tzres = {},
					days = ["January 1","July 1",],
					years = [1879,1921,1952,1976,2018]
				years.forEach(function(year) {
					tzres[year] = []
					days.forEach(function(day) {
						let datetime = day +", "+ year +" 13:00:00"
						let control = new Date(datetime +" UTC")
						let test = new Date(datetime)
						let diff = ((Date.parse(test) - Date.parse(control))/60000)
						tzres[year].push(diff)
					})
				})
				return tzres
			}
		} catch(e) {
			log_error(SECT4, item, e)
			return zErr
		}
	}

/*
		notation = hash == "afbc2194" ? rfp_green : rfp_red
*/


	log_perf(SECT4, METRIC, t0)
	return resolve()
})

const get_validation_messages = () => new Promise(resolve => {
	const	METRIC = "validation_messages"
	let data = {}, notation = ""
	const list = {
		BadInputNumber: 'number',
		CheckboxMissing: 'checkbox',
		DateTimeRangeOverflow: 'datetime',
		DateTimeRangeUnderflow: 'datetimeunder',
		FileMissing: 'file',
		InvalidEmail: 'email',
		InvalidURL: "url",
		NumberRangeOverflow: 'max',
		NumberRangeUnderflow: 'min',
		PatternMismatch: 'tel',
		RadioMissing: 'radio',
		SelectMissing: 'combobox',
		StepMismatch: 'step',
		ValueMissing: 'text',
	}
	for (const k of Object.keys(list)) {
		try {
			let msg = dom["widget"+ list[k]].validationMessage
			if (msg !== "") {data[k] = msg}
		} catch(e) {}
	}
	let hash = mini(data)
	addData(4, METRIC, data, hash)
	if (isLanguageSmart) {
		notation = locale_red
		if (isLocaleValid && localesSupported[isLocaleValue] !== undefined) {
			if (hash === localesSupported[isLocaleValue]["v"]) {notation = locale_green}
		}
	}
	let count = Object.keys(data).length
	let details = count === 14 ? "details" : count +"/14"
	log_display(4, METRIC, hash + addButton(4, METRIC, details) + notation)
	return resolve()
})

const get_xml_errors = () => new Promise(resolve => {
	const METRIC = "xml_errors"
	if (!isGecko) {
		addDataDisplay(4, METRIC, zNA)
		return resolve()
	}
	let data = {}, delimiter = ":", notation = ""
	const list = {
		n02: 'a',
		n03: '',
		n04: '<>',
		n05: '<?',
		n07: '<x></X>',
		n08: '<x xmlns:x="." xmlns:x=".">',
		n09: '<x></x><x>',
		n11: '<x>&x;</x>',
		n14: '<x>&#x0;',
		n20: '<x><![CDATA[',
		n28: '<x xmlns:x=""></x>',
		n30: '<?xml versin="1.0"?>',
	}
	for (const k of Object.keys(list)) {
		try {
			let doc = (new DOMParser).parseFromString(list[k], 'application/xml')
			let str = (doc.getElementsByTagName('parsererror')[0].firstChild.textContent)
			//split into parts: works back to FF52 and works with LTR
			let parts = str.split("\n")
			if (k == "n02") {
				// programatically determine delimiter
					// usually = ":" (charCode 58) but zh-Hans-CN = "：" (charCode 65306) and my = "-"
				let strLoc = parts[1]
				let schema = isFile ? "file://" : "https://"
				let index = strLoc.indexOf(schema) - 2
				if (strLoc.charAt(index + 1) !== " ") {index++} // zh-Hans-CN has no space: e.g. "位置：http://"
				if (strLoc.charAt(index) == " ") {index = index -1} // jfc: ms has a double space: "Lokasi:  http"
				delimiter = strLoc.charAt(index)
				strLoc = strLoc.slice(0, index)
				let strName = parts[0].split(delimiter)[0]
				let strLine = parts[2]
				data["n00"] = strName +": " + strLoc +": "+ strLine // weird on LTR but who cares
				data["n01"] = delimiter +" (" + delimiter.charCodeAt(0) +")"
			}
			data[k] = parts[0].split(delimiter)[1].trim()
		} catch(err) {}
	}
	//console.clear()
	let hash = mini(data)
	addData(4, METRIC, data, hash)
	if (isLanguageSmart) {
		notation = locale_red
		if (isLocaleValid && localesSupported[isLocaleValue] !== undefined) {
			if (hash === localesSupported[isLocaleValue]["xml"]) {notation = locale_green}
		}
	}
	let count = Object.keys(data).length
	let details = count === 14 ? "details" : count +"/14"
	log_display(4, METRIC, hash + addButton(4, METRIC, details) + notation)
	return resolve()
})

const get_lang = () => new Promise(resolve => {

	// set date
		// previously this was = new Date("January 30, 2019 13:00:00")
		// as this hardcodes it the same for everyone: ignores your timezone
		// back when we wanted to get the same hash to check RFP was working
		// instead we will use Date.UTC as this is anumber and adjusts to your timezone
		// we will get max entropy in Intl.DateTimeFormat, so let these ones reflect entropy
	let d = new Date(Date.UTC(2023, 0, 30, 30))
	let o = {weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric",
			minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long"}
	let amWorker = false

	let localecode = undefined

		function get_item(item) {
			let itemPad = "item "+ item
			try {
// DATETIME
				if (item == 41) {return (amWorker ? ""+ d : d)
				} else if (item == 42) {return d.toString()
				} else if (item == 43) {return d.toGMTString()
				} else if (item == 44) {return d.toUTCString()
				} else if (item == 45) {return d.toTimeString()

// DATETIME & FORMAT (can use localecode)
				} else if (item == 46) {return d.toLocaleString(localecode, o)
				} else if (item == 47) {return d.toLocaleDateString(localecode, o)
				} else if (item == 48) {return d.toLocaleTimeString(localecode, o)
				} else if (item == 49) {return oConst.DTFo.format(d)
				} else if (item == 50) {
					let f = Intl.DateTimeFormat(localecode, { weekday: "long", month: "long", day: "numeric",
						year: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long" })
					let temp = f.formatToParts(d)
					return temp.map(function(entry){return entry.value}).join("")
				} else if (item == 51) {return d.toLocaleString(localecode)
				} else if (item == 52) {return [d].toLocaleString(localecode)
				} else if (item == 53) {return d.toLocaleDateString(localecode)
				} else if (item == 54) {return oConst.DTF.format(d)
				} else if (item == 55) {
					// 1557718: 79+
					let list = ["short", "medium","long"], res43 = []
					list.forEach(function(s){
						let style = Intl.DateTimeFormat(localecode, {timeStyle: s,	dateStyle: s})
						res43.push(style.format(d))
					})
					return res43.join(" | ")
				} else if (item == 56) {
					// FF91+: 1653024: formatRange
					let date1 = new Date(Date.UTC(2020, 0, 15, 11, 59, 59)),
						date2 = new Date(Date.UTC(2020, 0, 15, 12, 0, 1)),
						date3 = new Date(Date.UTC(2020, 8, 19, 23, 15, 30))
					return oConst.DTFo.formatRange(date1, date2) +" | "+ oConst.DTFo.formatRange(date1, date3)
				} else if (item == 57) {
					// relatedYear, yearName
					let tmp = Intl.DateTimeFormat(localecode, {relatedYear: "long"}).formatToParts(d)
						tmp = tmp.map(function(entry){return entry.value}).join("")
					let tmpb = Intl.DateTimeFormat(localecode, {year: "numeric", yearName: "long"}).formatToParts(d)
						tmpb = tmpb.map(function(entry){return entry.value}).join("")
					return tmp += " | "+ tmpb
				} else if (item == 58) {return d.toLocaleTimeString(localecode)
				} else if (item == 59) {
					// FF91+: 1710429
					// note: use hour12 - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
					// FF91: extended TZNs are type "unknown"
					let tzRes = []
					try {
						let tzNames = ["longGeneric","shortGeneric"]
						let tzDays = [Date.UTC(2019, 7, 1, 0, 0, 0)]
						let tz
						tzDays.forEach(function(day) {
							tzNames.forEach(function(name) {
								tz = ""
								try {
									let formatter = Intl.DateTimeFormat(localecode, {hour12: true, timeZoneName: name})
									tz = formatter.format(day)
								} catch(e) {
									if (day == tzDays[0]) {
										log_error(SECT4, itemPad +": "+ name, e)
									}
									tz = zErr
								}
								tzRes.push(tz)
							})
						})
						return tzRes.join(" | ")
					} catch(e) {
						log_error(SECT4, itemPad +": timeZoneName", e)
						return zErr
					}
				} else {
					return "skip"
				}
			} catch(e) {
				log_error(SECT4, itemPad, e)
				return zErr
			}
		}

		for (let i=41; i < 60; i++) {
			let result = get_item(i)
			if (result == zU) {result = zUQ
			} else if (result === undefined) {result = zU
			} else if (result === "") {result = "empty string"
			}
			if (result !== "skip") {
				log_display(4, "ldt"+ i, result)
			}
		}
		return resolve()
		// ToDo: more type checking
			// e.g. Object.prototype.toString.call(value) == "[object Date]"
})

function outputRegion() {
	let t0 = nowFn()
	if (gLoad) {
		set_isLanguageSmart()
		set_oIntlTests()
	}

	let o = {weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric",
		minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long"}
	oConst = {}
	// set undefined once
	try {oConst.C = Intl.Collator()} catch(e) {}
	try {oConst.DTF = Intl.DateTimeFormat()} catch(e) {}
	try {oConst.DTFo = Intl.DateTimeFormat(undefined, o)} catch(e) {}
	try {oConst.NF = new Intl.NumberFormat()} catch(e) {}
	try {oConst.NFCl = new Intl.NumberFormat(undefined, {notation: "compact", compactDisplay: "long", useGrouping: true})} catch(e) {}
	try {oConst.NFCs = new Intl.NumberFormat(undefined, {notation: "compact", compactDisplay: "short", useGrouping: true})} catch(e) {}
	try {oConst.PR = new Intl.PluralRules()} catch(e) {}
	try {oConst.PRo = new Intl.PluralRules(undefined, {type: "ordinal"})} catch(e) {}
	try {oConst.RTF = new Intl.RelativeTimeFormat(undefined, {style: "narrow", numeric: "auto"})} catch(e) {} // 3

	Promise.all([
		get_geo(),
		get_language_locale(), // sets isLocaleValid/Value
		get_timezone(), // sets isTimeZoneValue
	]).then(function(){
		// set deterministic once
		if (isSmart && isLocaleValid) {
			try {oConst.C2 = Intl.Collator(isLocaleValue)} catch(e) {}
			try {oConst.DTF2 = Intl.DateTimeFormat(isLocaleValue)} catch(e) {}
			try {oConst.DTFo2 = Intl.DateTimeFormat(isLocaleValue, o)} catch(e) {}
			try {oConst.NF2 = new Intl.NumberFormat(isLocaleValue)} catch(e) {}
			try {oConst.NFCl2 = new Intl.NumberFormat(isLocaleValue, {notation: "compact", compactDisplay: "long", useGrouping: true})} catch(e) {}
			try {oConst.NFCs2 = new Intl.NumberFormat(isLocaleValue, {notation: "compact", compactDisplay: "short", useGrouping: true})} catch(e) {}
			try {oConst.PR2 = new Intl.PluralRules(isLocaleValue)} catch(e) {}
			try {oConst.PRo2 = new Intl.PluralRules(isLocaleValue, {type: "ordinal"})} catch(e) {}
			try {oConst.RTF2 = new Intl.RelativeTimeFormat(isLocaleValue, {style: "narrow", numeric: "auto"})} catch(e) {}
		}

		Promise.all([
			get_timezone_offsets(),
			get_locale_resolvedoptions(),
			get_locale_intl(),
			get_lang(),
			get_validation_messages(),
			get_xml_errors(),
		]).then(function(results){
			Promise.all([
				get_locale_tolocalestring(results[2]),
			]).then(function(){
				log_section(4, t0)
			})
		})
	})
}

function outputHeaders() {
	let t0 = nowFn()
	Promise.all([
		get_nav_dnt(),
		get_nav_gpc(),
		get_nav_connection(),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(5, item)})
		log_section(5, t0)
	})
}

countJS(SECT4)

