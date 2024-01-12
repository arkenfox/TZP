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
	let curN = {"name": [-1]},
		curS = {"symbol": [1000]},
		curB = {"name": [-1], "symbol": [1000]},
		curA = {"accounting": [-1000], "name": [-1], "symbol": [1000]}

	oIntlTests = {
		"collation": [
			'A','a','aa','ch','ez','kz','ng','ph','ts','tt','y','\u00E2','\u00E4','\u00E7\a','\u00EB','\u00ED','\u00EE','\u00F0',
			'\u00F1','\u00F6','\u0107','\u0109','\u0137\a','\u0144','\u0149','\u01FB','\u025B','\u03B1','\u040E','\u0439','\u0453',
			'\u0457','\u04F0','\u0503','\u0561','\u05EA','\u0627','\u0649','\u06C6','\u06C7','\u06CC','\u06FD','\u0934','\u0935',
			'\u09A4','\u09CE','\u0A85','\u0B05','\u0B85','\u0C05','\u0C85','\u0D85','\u0E24','\u0E9A','\u10350','\u10D0','\u1208',
			'\u1780','\u1820','\u1D95','\u1DD9','\u1ED9','\u1EE3','\u311A','\u3147','\u4E2D','\uA647','\uFB4A',
		],
		"compact": {
			"long": [0/0, 1000, 2e6, 6.6e12, 7e15],
			"short": [-1100000000],
		},
		"currency": {"KES": curB, "MOP": curS, "USD": curA, "XXX": curN,},
		"dayperiod": {"long": [8,22], "narrow": [8,15], "short": [12,15,18]},
		"listformat": {
			"narrow": ["conjunction","disjunction","unit"],
			"short": ["conjunction","unit"]
		},
		"notation": {
			"scientific": {"decimal": []},
			"standard": {"decimal": [0/0, -1000, 987654], "percent": [1000]},
		},
		"numberformat_ftp": {
			"decimal": [1.2],"group": [1000, 99999],"infinity": [Infinity],"minusSign": [-5],"nan": ["a"]
		},
		"pluralrules": {
			"cardinal": [0, 1, 2, 3, 7, 21, 100], // 1859752 ICU 74: add ordinal 81 to keep lij unique from it,sc
			"ordinal": [1, 2, 3, 5, 8, 10, 81]
		},
		"relativetimeformat": { // 8 of 12
			"always": {"narrow": [[1, "day"], [0, "year"]]},
			"auto": {"long": [[1, "second"]],"narrow": [[3,"day"],[0,"quarter"],[0,"second"],[1,"second"],[3,"second"]]},
		},
		"relativetimeformat_ftp": { // 4 of 12
			"auto": {"narrow": [[0,"day"],[1,"day"],[1,"week"],[1,"year"]]}
		},
		"sign": {"always": [-1, 0/0]},
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
	try {oIntlTests["compact"]["long"].push(BigInt("987354000000000000"))} catch(e) {}
	let nBig = 987654
	try {nBig = BigInt("987354000000000000")} catch(e) {}
	oIntlTests["notation"]["scientific"]["decimal"].push(nBig)

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
	// reset
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
	let oData = {}, metrics = ['language','languages'], notation = ""
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
		let METRIC = "locales_"+ m
		let r
		try {
			if (m == "collator") {if (runSL) {r = "en-FAKE"} else {r = Intl.Collator().resolvedOptions().locale}
			} else if (m == "datetimeformat") {r = Intl.DateTimeFormat().resolvedOptions().locale
			} else if (m == "displaynames") {r = new Intl.DisplayNames(undefined, {type: "region"}).resolvedOptions().locale
			} else if (m == "listformat") {r = new Intl.ListFormat().resolvedOptions().locale
			} else if (m == "numberformat") {r = new Intl.NumberFormat().resolvedOptions().locale
			} else if (m == "pluralrules") {r = new Intl.PluralRules().resolvedOptions().locale
			} else if (m == "relativetimeformat") {r = new Intl.RelativeTimeFormat().resolvedOptions().locale
			} else if (m == "segmenter") {r = new Intl.Segmenter().resolvedOptions().locale
			}
			//r="fa" // test returning all the same but a different locale to actual
			if ("string" !== typeof r) {
				log_error(SECT4, METRIC, zErrType + typeof r); r = zErr
			} else if (!Intl.DateTimeFormat.supportedLocalesOf([r]).length) {
				log_error(SECT4, METRIC, zErrInvalid + "locale not supported"); r = zErr
			}
			return r
		} catch(e) {
			log_error(SECT4, METRIC, e)
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
	function get_metric(m, code, isIntl) {
		try {
			let obj = {}, tests = oIntlTests[m], value
			if (m == "collation") {
				let data = tests.sort() // always re-sort
				return data.sort(Intl.Collator(code).compare).join(", ")
			} else if (m == "compact") {
				Object.keys(tests).forEach(function(key) {
					let option = {notation: m, compactDisplay: key, useGrouping: true}, data = [], formatter
					if (isIntl) {formatter = new Intl.NumberFormat(code, option)}
					tests[key].forEach(function(n) {
						value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, option)); data.push(value)
					})
					obj[key] = data
				})
			} else if (m == "currency") {
				Object.keys(tests).forEach(function(key) {
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let option = s == "accounting" ? {style: m, currency: key, currencySign: s} : {style: m, currency: key, currencyDisplay: s}, data = []
						tests[key][s].forEach(function(n) {
							value = (isIntl ? Intl.NumberFormat(code, option).format(n) : (n).toLocaleString(code, option)); data.push(value)
						})
						obj[key][s] = data
					})
				})
			} else if (m == "dayperiod") {
				Object.keys(tests).forEach(function(key) {
					let formatter = new Intl.DateTimeFormat(code, {hourCycle: "h12", dayPeriod: key}), data = []
					tests[key].forEach(function(item) {data.push(formatter.format(dayperiods[item]))})
					obj[key] = data
				})
			} else if (m == "listformat") {
				Object.keys(tests).forEach(function(key) {
					let data = []
					tests[key].forEach(function(item) {data.push(new Intl.ListFormat(code, {style: key, type: item}).format(["a","b","c"]))})
					obj[key] = data
				})
			} else if (m == "notation") {
				Object.keys(tests).forEach(function(key) {
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let formatter = (isIntl ? Intl.NumberFormat(code, {notation: key, style: s}) : undefined), data = []
						tests[key][s].forEach(function(n){
							value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, {notation: key, style: s})); data.push(value)
						})
						obj[key][s] = data
					})
				})
			} else if (m == "numberformat_ftp") {
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
					} catch(e) {return " error"} // why is this " error" and not zErr
				}
				let formatter = Intl.NumberFormat(code), res = []
				Object.keys(tests).forEach(function(key){
					tests[key].forEach(function(num){res.push(get_value(key, formatter.formatToParts(num)))})
				})
				return res.join(" | ")
			} else if (m == "pluralrules") {
				for (const key of Object.keys(tests)) {
					let formatter = new Intl.PluralRules(code, {type: key}), nos = tests[key], prev="", current="", data = []
					nos.forEach(function(n) {
						current = formatter.select(n)
						if (prev !== current) {data.push(n +": "+ current)}
						prev = current
					})
					obj[key] = data
				}
			} else if (m == "relativetimeformat") {
				Object.keys(tests).forEach(function(key) {
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(item) {
						let formatter = new Intl.RelativeTimeFormat(code, {style: item, numeric: key}), data = []
						tests[key][item].forEach(function(pair){data.push(formatter.format(pair[0], pair[1]))})
						obj[key][item] = data
					})
				})
			} else if (m == "relativetimeformat_ftp") {
				function parts(length, value) {
					let output = "", tmp = formatter.formatToParts(length, value)
					for (let x=0; x < tmp.length; x++) {output += tmp[x].value}
					return output
				}
				let formatter, data = []
				Object.keys(tests).forEach(function(key) {
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						formatter = new Intl.RelativeTimeFormat(code, {style: s, numeric: key}), data = []
						tests[key][s].forEach(function(pair){data.push(parts(pair[0], pair[1]))})
						obj[key][s] = data
					})
				})
			} else if (m == "sign") {
				Object.keys(tests).forEach(function(key) {
					let formatter = (isIntl ? new Intl.NumberFormat(code, {signDisplay: key}) : undefined), data = []
					tests[key].forEach(function(n){
						value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, {signDisplay: key})); data.push(value)
					})
					obj[key] = data
				})
			} else if (m == "timezonename") {
				Object.keys(tests).forEach(function(tz){
					let data = []
					Object.keys(tests[tz]).forEach(function(tzn){
						try {
							// use y+m+d numeric so toLocaleString matches
							// use hour12 in case - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
							let option = {year: "numeric", month: "numeric", day: "numeric", hour12: true, timeZone: tz, timeZoneName: tzn}
							let formatter = (isIntl ? Intl.DateTimeFormat(code, option) : undefined)
							tests[tz][tzn].forEach(function(dte){
								value = (isIntl ? formatter.format(dte) : (dte).toLocaleString(code, option)); data.push(value)
							})
						} catch (e) {} // ignore invalid
						if (data.length) {obj[tz] = data}
					})
				})
				if (!Object.keys(obj).length) {let trap = Intl.DateTimeFormat(code, {timeZoneName: "longGeneric"})} // trap error
			} else if (m == "unit") {
				Object.keys(tests).sort().forEach(function(u){
					let data = []
					Object.keys(tests[u]).forEach(function(ud){
						try {
							let formatter = (isIntl ? Intl.NumberFormat(code, {style: "unit", unit: u, unitDisplay: ud}) : undefined)
							tests[u][ud].forEach(function(n){
								value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, {style: "unit", unit: u, unitDisplay: ud})); data.push(value)
							})
						} catch (e) {} // ignore invalid
					})
					if (data.length) {obj[u] = data}
				})
				if (!Object.keys(obj).length) {let trap = Intl.NumberFormat(code, {style: "unit", unit: "day"})} // trap error
			}
			return {"hash": mini(obj), "metrics": obj}
		} catch(e) {
			log_error(SECT4, METRIC +"_"+ m, e)
			return zErr
		}
	}

	const dayperiods = { // set per run
		8: new Date("2019-01-30T08:00:00"),
		12: new Date("2019-01-30T12:00:00"),
		15: new Date("2019-01-30T15:00:00"),
		18: new Date("2019-01-30T18:00:00"),
		22: new Date("2019-01-30T22:00:00"),
	}
	const oMetrics = {
		"intl" : [
			"collation","compact", "currency", "dayperiod", "listformat","notation","numberformat_ftp",
			"pluralrules","relativetimeformat","relativetimeformat_ftp","sign","timezonename","unit"
		],
		"tolocalestring": ["compact","currency","notation","sign","timezonename","unit"],
	}
	let t0 = nowFn(), notation = ""
	let METRIC, oString = {}
	Object.keys(oMetrics).forEach(function(list){
		METRIC = "locale_"+ list
		let t0 = nowFn(), isIntl = list == "intl", notation = ""
		let oData = {}, oCheck = {}
		oMetrics[list].forEach(function(m) {
			let value = get_metric(m, undefined, isIntl) 
			oData[m] = value
			if (isIntl && oMetrics["tolocalestring"].includes(m)) {oString[m] = value} // create an intl version of tolocalestring
		})
		if (isSmart && isLocaleValid) {oMetrics[list].forEach(function(m) {oCheck[m] = get_metric(m, isLocaleValue, isIntl)})}
		let hash = mini(oData)
		let isLies = false, btnDiff = ""
		if (isSmart) {
			if (!isIntl) {log_display(4, METRIC +"_matches_intl", (hash == mini(oString) ? intl_green : intl_red))}
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
		if (!isIntl) {return resolve()}
	})
})

const get_locale_resolvedoptions = () => new Promise(resolve => {
	const METRIC = "locale_resolvedoptions"

	function get_metric(m, code) {
		let r
		let type = "string"
		try {
			// collator
			if (m == "caseFirst") {r = Intl.Collator(code).resolvedOptions().caseFirst
			} else if (m == "ignorePunctuation") {type = "boolean"; r = Intl.Collator(code).resolvedOptions().ignorePunctuation
			// DTF
			} else if (m == "calendar") {r = Intl.DateTimeFormat(code).resolvedOptions().calendar
			} else if (m == "day") {r = Intl.DateTimeFormat(code).resolvedOptions().day
			} else if (m == "hourCycle") {r = Intl.DateTimeFormat(code, {hour: "numeric"}).resolvedOptions().hourCycle
			} else if (m == "month") {r = Intl.DateTimeFormat(code).resolvedOptions().month
			} else if (m == "numberingSystem_dtf") {r = Intl.DateTimeFormat(code).resolvedOptions().numberingSystem
			// NF
			} else if (m == "numberingSystem_nf") {r = new Intl.NumberFormat(code).resolvedOptions().numberingSystem
			// PR
			} else if (m == "pluralCategories") {r = new Intl.PluralRules(code).resolvedOptions().pluralCategories.join(", ")
			// RTF
			} else if (m == "numberingSystem_rtf") {r = new Intl.RelativeTimeFormat(code).resolvedOptions().numberingSystem
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

	let oData = {}, oCheck = {}, notation = ""
	let metrics = [
		"calendar","caseFirst","day","hourCycle","ignorePunctuation","month",
		"numberingSystem_dtf","numberingSystem_nf","numberingSystem_rtf","pluralCategories",
	]
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

const get_timezone = () => new Promise(resolve => {
	let t0 = nowFn(), notation = ""
	const METRIC = "timezone"
	const METRICtzo = "timezone_offsets"

	// reset
	isTimeZoneValid = false
	isTimeZoneValue = undefined

	function get_tz() {
		try {
			if (runSE) {foo++}
			let tz = Intl.DateTimeFormat().resolvedOptions().timeZone
			if ("string" !== typeof tz) {
				return ([zErr, log_error(SECT4, METRIC, zErrType + typeof tz)])
			} else if (tz === "") {
				return ([zErr, log_error(SECT4, METRIC, zErrInvalid + "empty string")])
			} else {
				try {
					let tztest = (new Date("January 1, 2018 13:00:00 UTC")).toLocaleString('en', {timeZone: tz})
					return (tz)
				} catch(e) {
					return ([zErr, log_error(SECT4, METRIC, e)]) // not supported
				}
			}
		} catch(e) {
			return ([zErr, log_error(SECT4, METRIC, e)])
		}
	}

	function get_offsets(name) {
		function get_offsetitem(item) {
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
		let oData = {}
		let list = ["offsets","date.parse_years"]
		list.forEach(function(item) {
			let data = get_offsetitem(item)
			if (item == "offsets") {
				Object.keys(data).forEach(function(test) {
					oData[test] = data[test]
				})
			} else {
				oData[item] = data
			}
		})
		let newobj = {}
		Object.keys(oData).sort().forEach(function(item){newobj[item] = oData[item]})
		return oData
	}

	Promise.all([
		get_tz(),
		get_offsets("timezone_offsets"),
	]).then(function(res){
		// TZ
		let tz = res[0], tzdisplay = tz, tznotation = ""
		if ("string" !== typeof tz) {
			// error
			tzdisplay = res[0][1]
			tz = zErr
		}
		// TZOffsets
		/*
		checks
		- date.parse, gettime, gettimezoneoffset == the same
		- s/be no NaNs
    - we can use isTimeZoneValue to recalculate and compare
		*/

		// not smart, just output tz and tzoffsets
		if (!isSmart) {
			log_display(4, METRIC, tzdisplay)
			addData(4, METRIC, tz)
			log_display(4, METRICtzo, "TBA")
			addData(4, METRICtzo, "TBA")
			log_perf(SECT4, METRIC+"/offsets", t0)
			return resolve()
		}

		// smart and no errors in tz
		// now we should only be isSmart + no errors in tz
		// we can trap errors in the tzo object and then rule it untrustworthy: a bit like pdf with 3 items
			// isTimeZoneValid = true, isTimeZoneValue = undefined, tz = the value
			// we can alter/set these after using timezoneoffsets
		/* notation = hash == "afbc2194" ? rfp_green : rfp_red */

		// if either are untrustworthy then both are

		// tmp: output tz
		isTimeZoneValue = tz
		tznotation = tz == "UTC" ? rfp_green : rfp_red
		log_display(4, METRIC, tzdisplay + tznotation)
		addData(4, METRIC, tz)

		log_perf(SECT4, METRIC+"/offsets", t0)
		return resolve()
	})

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
	if ("string" == typeof isXML) {
		log_display(4, METRIC, isXML)
		addData(4, METRIC, (isXML == zNA ? zNA : zErr))
		return resolve()
	}
	let hash = mini(isXML), notation = ""
	addData(4, METRIC, isXML, hash)
	if (isLanguageSmart) {
		notation = locale_red
		if (isLocaleValid && localesSupported[isLocaleValue] !== undefined) {
			if (hash === localesSupported[isLocaleValue]["xml"]) {notation = locale_green}
		}
	}
	let count = Object.keys(isXML).length
	let details = count === 14 ? "details" : count +"/14"
	log_display(4, METRIC, hash + addButton(4, METRIC, details) + notation)
	return resolve()
})

const get_dates = () => new Promise(resolve => {
	let d = new Date(Date.UTC(2023, 0, 1, 0, 0, 1)) //
	let d2 = new Date("January 01, 2019 00:00:01") // for toGMT/UTC strings
	
	let o = {weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric",
			minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long"}
	let localecode = undefined
	let DTFo
	try {DTFo = Intl.DateTimeFormat(undefined, o)} catch(e) {}
	function get_item(item) {
		let itemPad = "item "+ item
		try {
// STRINGS
			if (item == 41) {return d2.toGMTString()
			} else if (item == 42) {return d2.toUTCString()
			} else if (item == 43) {return d.toTimeString()
			} else if (item == 44) {return d // a date object
			} else if (item == 45) {return d.toString() // redundant?
			} else if (item == 46) {return d.toLocaleString(localecode, o)
			} else if (item == 47) {return d.toLocaleDateString(localecode, o)
			} else if (item == 48) {return d.toLocaleTimeString(localecode, o)
			} else if (item == 49) {return d.toLocaleTimeString(localecode)
			} else if (item == 50) {return d.toLocaleString(localecode)
			} else if (item == 51) {return [d].toLocaleString(localecode)
// DTF
			} else if (item == 52) {return DTFo.format(d)
			} else if (item == 53) {
				let f = Intl.DateTimeFormat(localecode, { weekday: "long", month: "long", day: "numeric",
					year: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long" })
				let temp = f.formatToParts(d)
				return temp.map(function(entry){return entry.value}).join("")
			} else if (item == 54) {return Intl.DateTimeFormat().format(d)
			} else if (item == 55) {
				// relatedYear, yearName
				let tmp = Intl.DateTimeFormat(localecode, {relatedYear: "long"}).formatToParts(d)
					tmp = tmp.map(function(entry){return entry.value}).join("")
				let tmpb = Intl.DateTimeFormat(localecode, {year: "numeric", yearName: "long"}).formatToParts(d)
					tmpb = tmpb.map(function(entry){return entry.value}).join("")
				return tmp += " | "+ tmpb

			} else if (item == 56) {
				// 1557718: 79+
				let list = ["short", "medium","long"], res43 = []
				list.forEach(function(s){
					let style = Intl.DateTimeFormat(localecode, {timeStyle: s,	dateStyle: s})
					res43.push(style.format(d))
				})
				return res43.join(" | ")
			} else if (item == 57) {
				// FF91+: 1710429
				// note: use hour12 - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
				// FF91: extended TZNs are type "unknown"
				let tzRes = []
				try {
					let tzNames = ["longGeneric","shortGeneric"]
					let tzDays = [d]
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
			} else if (item == 58) {
				// FF91+: 1653024: formatRange
				let date1 = new Date(Date.UTC(2020, 0, 15, 11, 59, 59)),
					date2 = new Date(Date.UTC(2020, 0, 15, 12, 0, 1)),
					date3 = new Date(Date.UTC(2020, 8, 19, 23, 15, 30))
				return DTFo.formatRange(date1, date2) +" | "+ DTFo.formatRange(date1, date3)
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
})

const outputRegion = () => new Promise(resolve => {
	let t0 = nowFn()
	if (gLoad) {
		set_isLanguageSmart()
		set_oIntlTests()
	}

	Promise.all([
		get_geo(),
		get_language_locale(), // sets isLocaleValid/Value
	]).then(function(){
		Promise.all([
			get_locale_resolvedoptions(),
			get_locale_intl(),
			get_timezone(), // sets isTimeZoneValid/Value
			get_validation_messages(),
			get_xml_errors(),
		]).then(function(results){
			Promise.all([
				get_dates(), // will use isTimeZomeValid/Value + isLocaleValid/Value
			]).then(function(){
				log_section(4, t0)
				return resolve(SECT4)
			})
		})
	})
})

const outputHeaders = () => new Promise(resolve => {
	let t0 = nowFn()
	Promise.all([
		get_nav_dnt(),
		get_nav_gpc(),
		get_nav_connection(),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(5, item)})
		log_section(5, t0)
		return resolve(SECT5)
	})
})

countJS(SECT4)

