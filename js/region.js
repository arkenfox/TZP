'use strict';

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
		return resolve([[METRIC, value]])
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
					log_known(METRIC)
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
		log_display(5, METRIC, display)
		return resolve([METRIC, value])
	}
	try {
		let value = navigator[METRIC]
		if (runST) {value = 1}
		let display = value
		if ("1" !== value && "unspecified" !== value) {
			if ("string" === typeof value) {
				display = log_error(SECT5, METRIC, zErrInvalid + cleanFn(value))
			} else {
				display = log_error(SECT5, METRIC, zErrType + typeof value)
			}
			value = zErr
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
		log_display(5, METRIC, display)
		return resolve([METRIC, value])
	}
	try {
		let value = navigator[METRIC]
		value = cleanFn(value)
		if (runST) {value = zUQ} else if (runSL && isSmart) {sData[SECT99].push("Navigator."+ METRIC)}
		let display = value
		if ("boolean" !== typeof value && value !== "undefined") {
			value = zErr
			display = log_error(SECT5, METRIC, zErrType + typeof value)
		} else if (isSmart && sData[SECT99].includes("Navigator."+ METRIC)) {
			value = zLIE
			display = colorFn(display)
			log_known(SECT4, METRIC)
		}
		exit(value, display)
	} catch(e) {
		exit(zErr, log_error(SECT5, METRIC, e))
	}
})

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

function get_lang() {
	return new Promise(resolve => {

		let d = new Date("January 30, 2019 13:00:00"),
			o = {weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric",
				minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long"}
		let amWorker = false
		let localecode = undefined
		let IntlC, IntlDTF, IntlDTFo, IntlNF, IntlPR, IntlRTF

		// set some test data
		let tests = {
			"ftp": { // nf, formattoparts
				"decimal": [1.2],
				"group": [1000, 99999],
				"infinity": [Infinity],
				"minusSign": [-5],
				"nan": ["a"]
			}
		}
		function set_tests() {
			let optN = {"narrow": [1]},
				optL = {"long": [1]},
				both = {"long": [1], "narrow": [1],}
			tests["unit"] = {
				"fahrenheit": both,
				"foot": optL,
				"hectare": {"long": [1], "short": [987654]},
				"kilometer-per-hour": optN,
				"millimeter": optN,
				"month": both,
				"nanosecond": optN,
				"percent": both,
				"second": {"long": [1], "narrow": [1], "short": [987654]},
				"terabyte": optL,
			}
			// ToDo: isSmartMin=115 remove FF < 110 tweak
			if (isVer < 110) {
				tests["unit"]["month"] = {"narrow": [1], "short": [987654]}
				tests["unit"]["day"] = optL
				tests["unit"]["gallon"] = {"short": [987654]}
			}
		}
		set_tests()

		function tidyResult(result) {
			if (result == zU) {result = zUQ
			} else if (result === undefined) {result = zU
			} else if (result === "") {result = "empty string"}
			return result
		}

		// LANGUAGES
		function get_languages(name) {
			function get_langitem(item) {
				try {
					let test = navigator[item]
					if (item == "languages") {test = test.join(", ")} // catch array errors
					return test
				} catch(e) {
					log_error(SECT4, item, e)
					return zErr
				}
			}
			
			oTempData[name] = {}
			let res = [], list = ["language","languages"]
			list.forEach(function(item) {
				oTempData[name][item] = tidyResult(get_langitem(item))
			})
			return
		}
		// LOCALES
		function get_locales(name) {
			function get_localeitem(item) {
				try {
					if (item == "collator") {
						if (runSL) {return "en-FAKE"}
						return IntlC.resolvedOptions().locale
					} else if (item == "datetimeformat") {return IntlDTF.resolvedOptions().locale
					} else if (item == "displaynames") {return new Intl.DisplayNames(localecode, {type: "region"}).resolvedOptions().locale
					} else if (item == "listformat") {return new Intl.ListFormat(localecode).resolvedOptions().locale
					} else if (item == "numberformat") {return IntlNF.resolvedOptions().locale
					} else if (item == "pluralrules") {return IntlPR.resolvedOptions().locale
					} else if (item == "relativetimeformat") {return new Intl.RelativeTimeFormat(localecode).resolvedOptions().locale
					} else if (item == "segmenter") {return new Intl.Segmenter(localecode).resolvedOptions().locale
					}
				} catch(e) {
					log_error(SECT4, item, e)
					return zErr
				}
			}
			let t0 = nowFn()
			oTempData[name] = {}
			let res = []
			let list = [
				"collator","datetimeformat","displaynames","listformat",
				"numberformat","pluralrules","relativetimeformat", //"segmenter",
			]
			list.forEach(function(item) {
				oTempData[name][item] = tidyResult(get_localeitem(item))
			})
			log_perf(SECT4, name, t0)
			return
		}
		// TIMEZONE
		function get_timezone(name) {
			let res = zErr
			try {
				res = IntlDTF.resolvedOptions().timeZone
			} catch(e) {
				log_error(SECT4, item, e)
			}
			oTempData[name] = {}
			oTempData[name]["timezone"] = tidyResult(res)
			return
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
			let t0 = nowFn()
			oTempData[name] = {}
			let res = []
			let list = ["offsets","date.parse_years"]
			list.forEach(function(item) {
				let data = get_offsetitem(item)
				if (item == "offsets") {
					Object.keys(data).forEach(function(test) {
						oTempData[name][test] = data[test]
					})
				} else {
					oTempData[name][item] = data
				}
			})
			log_perf(SECT4, name, t0)
			return
		}
		// RESOLVED OPTIONS
		function get_resolved(name) {
			function get_resolveditem(item) {
				try {
					if (item == "calendar") {return IntlDTF.resolvedOptions().calendar
					} else if (item == "hourcycle") {return Intl.DateTimeFormat(localecode, {hour: "numeric"}).resolvedOptions().hourCycle
					} else if (item == "numberingsystem_dtf") {return IntlDTF.resolvedOptions().numberingSystem
					} else if (item == "numberingsystem_rtf") {return new Intl.RelativeTimeFormat(localecode).resolvedOptions().numberingSystem
					}
				} catch(e) {
					log_error(SECT4, item, e)
					return zErr
				}
			}
			oTempData[name] = {}
			let res = []
			let list = ["calendar","hourcycle","numberingsystem_dtf","numberingsystem_rtf"]
			list.forEach(function(item) {
				oTempData[name][item] = (get_resolveditem(item))
			})
			return
		}

		let oTempData = {}
		//localecode = "xh" // et (good for nf formattoparts), xh, zh
		// set undefined once: used in x items
		try {IntlC = Intl.Collator(localecode)} catch(e) {} // 2
		try {IntlDTF = Intl.DateTimeFormat(localecode)} catch(e) {} // 5
		try {IntlDTFo = Intl.DateTimeFormat(localecode, o)} catch(e) {} // 3
		try {IntlNF = new Intl.NumberFormat(localecode)} catch(e) {} // 8
		try {IntlPR = new Intl.PluralRules(localecode)} catch(e) {} // 2
		try {IntlRTF = new Intl.RelativeTimeFormat(localecode, {style: "narrow", numeric: "auto"})} catch(e) {} // 2

		Promise.all([
			get_languages("languages"),
			get_locales("locale"),
			get_timezone("timezone"),
			get_offsets("timezone_offsets"),
			get_resolved("locale_resolvedoptions", localecode),
		]).then(function(results){
			//console.log(oTempData)
			let hash, data, res, value, value2, fpvalue, METRIC, METRIC2, newobj, notation = ""
			const enUS = "en-US, en"
			let oSupported = {
				// language = existing key | languages = key + value[0] | locale = key unless value[1] !== undefined
				"ar": [enUS],
				"ca": [enUS],
				"cs": ["sk, "+ enUS],
				"da": [enUS],
				"de": [enUS],
				"el-GR": ["el, "+ enUS, "el"],
				"en-US": ["en"],
				"es-ES": ["es, "+ enUS],
				"fa-IR": ["fa, "+ enUS, "fa"],
				"fi-FI": ["fi, "+ enUS, "fi"],
				"fr": ["fr-FR, "+ enUS],
				"ga-IE": ["ga, en-IE, en-GB, "+ enUS],
				"he": ["he-IL, "+ enUS],
				"hu-HU": ["hu, "+ enUS, "hu"],
				"id": [enUS],
				"is": [enUS],
				"it-IT": ["it, "+ enUS, "it"],
				"ja": [enUS],
				"ka-GE": ["ka, "+ enUS, "ka"],
				"ko-KR": ["ko, "+ enUS, "ko"],
				"lt": [enUS +", ru, pl"],
				"mk-MK": ["mk, "+ enUS, "mk"],
				"ms": [enUS],
				"my": ["en-GB, en"],
				"nb-NO": ["nb, no-NO, no, nn-NO, nn, "+ enUS],
				"nl": [enUS],
				"pl": [enUS],
				"pt-BR": ["pt, "+ enUS],
				"ro-RO": ["ro, en-US, en-GB, en", "ro"],
				"ru-RU": ["ru, "+ enUS, "ru"],
				"sq": ["sq-AL, "+ enUS],
				"sv-SE": ["sv, "+ enUS],
				"th": [enUS],
				"tr-TR": ["tr, "+ enUS, "tr"],
				"uk-UA": ["uk, "+ enUS, "uk"],
				"vi-VN": ["vi, "+ enUS, "vi"],
				"zh-CN": ["zh, zh-TW, zh-HK, "+ enUS, "zh-Hans-CN"],
				"zh-TW": ["zh, "+ enUS, "zh-Hant-TW"],
			}
			if (isMullvad) {
				// 22 of 38 supported
				let notSupported = ["ca","cs","el-GR","ga-IE","he","hu-HU","id","is","ka-GE","lt","mk-MK","ms","ro-RO","sq","uk-UA","vi-VN",]
				notSupported.forEach(function(key){
					delete oSupported[key]
				})
			}

			// LANGUAGES
			METRIC = "languages"
			data = oTempData[METRIC]
			let langcheck = (isSmart && isTB && isOS !== "android" && isVer > 114) // ToDo: android may differ, ignore for now
			Object.keys(data).forEach(function(item){
				METRIC = item
				if (langcheck) {
					notation = tb_red
					if (item == "language") {
						if (oSupported[data[item]] !== undefined) {notation = tb_green}
					} else {
						if (data[item] == data.language +", "+ oSupported[data.language][0]) {notation = tb_green}
					}
				}
				log_display(4, METRIC, data[item] + notation)
				addData(4, item, data[item])
			})

			// LOCALES
			METRIC = "locale", notation = ""
			data = oTempData[METRIC]
			res = []
			Object.keys(data).forEach(function(item){
				res.push(data[item])
			})
			value = res.join(" | ")
			log_display(4, METRIC +"data", value)

			// LOCALE
			let isValidLocale = false
			res = res.filter(x => ![zErr].includes(x))
			res = res.filter(function(item, position) {return res.indexOf(item) === position})
//res = ["a","b"]
//res = []
			if (res.length == 1) {
				value = res[0]
//value = "ks"
				fpvalue = value
				// is it supported?
				let	test = Intl.DateTimeFormat.supportedLocalesOf([value])
				if (test.length == 1) {
					localecode = value
					isValidLocale = true
				} else {
					fpvalue = zLIE
					value = colorFn(value)
					log_known(SECT4, METRIC)
				}
			} else if (res.length == 0) {
				value = zErr
				fpvalue = zErr
			} else  {
				value = "mixed"
				fpvalue = zLIE
				value = colorFn(value)
				log_known(SECT4, METRIC)
			}
			addData(4, METRIC, fpvalue)
			if (langcheck) {
				notation = tb_red
				let key = oTempData["languages"]["language"]
				// only green if TB supported
				if (oSupported[key] !== undefined) {
					let expected = oSupported[key][1] == undefined ? key : oSupported[key][1]
					if (value === expected) {notation = tb_green}
				}
			}
			log_display(4, METRIC, value + notation)

			// reset our vars to use the reported locale
			if (isValidLocale) {
				try {IntlC = Intl.Collator(localecode)} catch(e) {} // 2
				try {IntlDTF = Intl.DateTimeFormat(localecode)} catch(e) {} // 5
				try {IntlDTFo = Intl.DateTimeFormat(localecode, o)} catch(e) {} // 3
				try {IntlNF = new Intl.NumberFormat(localecode)} catch(e) {} // 8
				try {IntlPR = new Intl.PluralRules(localecode)} catch(e) {} // 2
				try {IntlRTF = new Intl.RelativeTimeFormat(localecode, {style: "narrow", numeric: "auto"})} catch(e) {} // 2
			}

			// TIMEZONE
			let isValidTZ = false
			METRIC = "timezone", notation = ""
			let tzvalue = oTempData[METRIC][METRIC]
			if (isSmart) {notation = tzvalue == "UTC" ? rfp_green : rfp_red}
			addData(4, METRIC, tzvalue)
			log_display(4, METRIC, tzvalue + notation)

			// OFFSETS
			METRIC = "timezone_offsets", notation = ""
			data = oTempData[METRIC]
			newobj = {}
			Object.keys(data).sort().forEach(function(item){newobj[item] = data[item]})
			hash = mini(newobj)
			if (isSmart) {
				notation = hash == "afbc2194" ? rfp_green : rfp_red
			}
			addData(4, METRIC, newobj, hash)
			log_display(4, METRIC, hash + addButton(4, METRIC) + notation)


			// LOCALE resolvedoptions
			METRIC = "locale_resolvedoptions", notation = ""
			data = oTempData[METRIC]
			value = []
			Object.keys(data).sort().forEach(function(item){value.push(data[item])})
			value = value.join(" | ")
			fpvalue = value
			if (isSmart && isTB) {
				notation = intl_red
				if (isValidLocale) {
					METRIC2 = METRIC +"_check"
					get_resolved(METRIC2)
					data = oTempData[METRIC2]
					value2 = []
					Object.keys(data).sort().forEach(function(item){value2.push(data[item])})
					value2 = value2.join(" | ")
					if (value == value2) {
						notation = intl_green
					}
				}
				if (notation !== intl_green) {
					fpvalue = zLIE
					value = colorFn(value)
					log_known(SECT4, METRIC)
				}
			}
			addData(4, METRIC, fpvalue)
			log_display(4, METRIC, value + notation)

			// LOCALE tolocalestring


			// validLocale: if not "" then we can rerun most sub-sections to test locale vs undefined
			// and add notation + modify FP with lies

			return resolve()
		})

		//*
		function get_item(item) {
			let itemPad = "item "+ (item+"").padStart(2,"0")
			try {
// LOCALE TESTS
				if (item == 20) {
					// collation: important: chars are already sorted
					let chars = ['A','a','aa','ch','ez','kz','ng','ph','ts','tt','y',
						'\u00E2','\u00E4','\u00E7\a','\u00EB','\u00ED','\u00EE','\u00F0','\u00F1','\u00F6','\u0107',
						'\u0109','\u0137\a','\u0144','\u0149','\u01FB','\u025B','\u03B1','\u040E','\u0439','\u0453',
						'\u0457','\u04F0','\u0503','\u0561','\u05EA','\u0627','\u0649','\u06C6','\u06C7','\u06CC',
						'\u06FD','\u0934','\u0935','\u09A4','\u09CE','\u0A85','\u0B05','\u0B85','\u0C05','\u0C85',
						'\u0D85','\u0E24','\u0E9A','\u10350','\u10D0','\u1208','\u1780','\u1820','\u1D95','\u1DD9',
						'\u1ED9','\u1EE3','\u311A','\u3147','\u4E2D','\uA647','\uFB4A',
					]
					chars.sort(IntlC.compare)
					return mini(chars)
				} else if (item == 21) {
					// nf: compact
					const nos =  [0/0, 1000, 2e6, 6.6e12, 7e15]
					try {nos.push(BigInt("987354000000000000"))} catch(e) {}
					let res = []
					let formatter = new Intl.NumberFormat(localecode, {notation: "compact", compactDisplay: "short", useGrouping: true})
					res.push(formatter.format(-1100000000))
					formatter = new Intl.NumberFormat(localecode, {notation: "compact", compactDisplay: "long", useGrouping: true})
					nos.forEach(function(num){
						res.push(formatter.format(num))
					})
					return res.join(" | ")
				} else if (item == 22) {
					// nf: currency
					let res = []
					let formatter1 = Intl.NumberFormat(localecode, {style: "currency", currency: "USD", currencySign: "accounting"}),
						formatter2 = Intl.NumberFormat(localecode, {style: "currency", currency: "USD", currencyDisplay: "name"}),
						formatter3 = Intl.NumberFormat(localecode, {style: "currency", currency: "USD", currencyDisplay: "symbol"})
					res.push(formatter1.format(-1000))
					res.push(formatter2.format(-1))
					res.push(formatter3.format(1000))
					return res.join(" | ")

				} else if (item == 23) {
					// 5 day periods
					const hr08 = new Date("2019-01-30T08:00:00")
					const hr12 = new Date("2019-01-30T12:00:00")
					const hr15 = new Date("2019-01-30T15:00:00")
					const hr18 = new Date("2019-01-30T18:00:00")
					const hr22 = new Date("2019-01-30T22:00:00")
					// 3 options: always use h12
					let dteS = new Intl.DateTimeFormat(localecode, {hourCycle: "h12", dayPeriod: "short"}),
						dteN = new Intl.DateTimeFormat(localecode, {hourCycle: "h12", dayPeriod: "narrow"}),
						dteL = new Intl.DateTimeFormat(localecode, {hourCycle: "h12", dayPeriod: "long"})
					// 6 or 7 tests max required
					let res = []
					let period1 = dteN.format(hr08) // narrow08
					let period2 = dteL.format(hr08) // long08
					if (period1 == period2) {res.push(period1)} else {res.push(period1 +" / "+ period2)}
					res.push( dteS.format(hr12)) // short12

					// ToDo: isSmartMin=115 remove FF < 110 tweak
					if (isVer > 109) {
						// FF110+: assuming ICU 72: 1792775
						period1 = dteN.format(hr15) // narrow15
						period2 = dteS.format(hr15) // short15
						if (period1 == period2) {res.push(period1)} else {res.push(period1 +" / "+ period2)}
						res.push( dteS.format(hr18)) // short18
						res.push( dteL.format(hr22)) // long22
					} else {
						// FF109 or lower
						res.push( dteN.format(hr15)) // narrow15
						res.push( dteS.format(hr18)) // short18
						res.push( dteS.format(hr22)) // short22
					}
					return res.join(" | ")
				} else if (item == 24) {
					// ListFormat: 5 tests max required
					let tmp, resLF = []
					let pairs = [["narrow","conjunction"],["narrow","disjunction"],["narrow","unit"],["short","conjunction"],["short","unit"]]
					pairs.forEach(function(pair) {
						resLF.push(new Intl.ListFormat(localecode,{style: pair[0], type: pair[1]}).format(["a","b","c"]))
					})
					if (resLF.length) {tmp = resLF.join(" | ")}
					return tmp

				} else if (item == 25) {
					// nf: notation
					let res = []
					let nBig = 987654
					try {nBig = BigInt("987354000000000000")} catch(e) {}
					res.push( Intl.NumberFormat(localecode, {notation: "scientific", style: "decimal"}).format(nBig))
					res.push( IntlNF.format(0/0)) // default standard/decimal
					res.push( IntlNF.format(-1000))
					res.push( IntlNF.format(987654))
					res.push( Intl.NumberFormat(localecode, {notation: "standard", style: "percent"}).format(1000))
					return res.join(" | ")
				} else if (item == 26) {
					// nf: formatToParts
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
						} catch(e) {
							return " error"
						}
					}
					let res = []
					Object.keys(tests["ftp"]).forEach(function(t){ // each type
						tests["ftp"][t].forEach(function(n){ // each number
							res.push(get_value(t, IntlNF.formatToParts(n)))
						})
					})
					return res.join(" | ")
				} else if (item == 27 || item == 28) {
					// pluralrules
					let nos = item == 27 ? [0, 1, 2, 3, 7, 21, 100] : [1, 2, 3, 5, 8, 10]
					let formatter = item == 27 ? IntlPR : new Intl.PluralRules(localecode, {type: "ordinal"})
					let prules = [], prev = "", current = ""
					nos.forEach(function(num){
						current = formatter.select(num)
						if (prev !== current) {prules.push(num +": "+ current)}
						prev = current
					})
					return prules.join(", ")
				} else if (item == 29) {
					// rtf: 8 of 12 min
					let IntlRTFlong = new Intl.RelativeTimeFormat(localecode, {style: "long", numeric: "auto"})
					let IntlRTFalways = new Intl.RelativeTimeFormat(localecode, {style: "narrow", numeric: "always"})
					let str = ""
					str += IntlRTF.format(0,"second") // autonarrow0second
						+", "+ IntlRTF.format(1,"second") // autonarrow1second
						+", "+ IntlRTFlong.format(1,"second")	// autolong1second
						+", "+ IntlRTF.format(3,"second") // autonarrow3second
						+", "+ IntlRTFalways.format(1,"day") // alwaysnarrow1day
						+", "+ IntlRTF.format(3,"day") // autonarrow3day
						+", "+ IntlRTF.format(0,"quarter") // autonarrow0quarter
						+", "+ IntlRTFalways.format(0,"year") // alwaysnarrow0year
					return str
				} else if (item == 30) {
					// rtf: 4 of 12 min: auto narrow
					function concat_parts(length, value) {
						let output = ""
						let tmp = IntlRTF.formatToParts(length, value)
						for (let x=0; x < tmp.length; x++) {
							output += tmp[x].value
						}
						return output
					}
					return concat_parts("0","day") // autonarrow0day
						+", "+ concat_parts("1","day") // autonarrow1day
						+", "+ concat_parts("1","week") // autonarrow1week
						+", "+ concat_parts("1","year") // autonarrow1year
				} else if (item == 31) {
					// nf: sign
					let res = []
					let nos = [-1, 0/0]
					let formatter = new Intl.NumberFormat(localecode, {signDisplay: "always"})
					nos.forEach(function(num){
						res.push( formatter.format(num) )
					})
					return res.join(" | ")
				} else if (item == 33) {
					// nf: unit
					let itemtest = Intl.NumberFormat(localecode, {style: "unit", unit: "day"}) // trap error
					let res = []
					Object.keys(tests["unit"]).sort().forEach(function(u){ // for each unit
						Object.keys(tests["unit"][u]).forEach(function(ud){ // for each unitdisplay
							try {
								let formatter = Intl.NumberFormat(localecode, {style: "unit", unit: u, unitDisplay: ud})
								tests["unit"][u][ud].forEach(function(n){ // for each number
									res.push(formatter.format(n))
								})
							} catch (e) {} // ignore invalid
						})
					})
					return mini(res)


// TOLOCALESTRING
				} else if (item == 35) {
					// compact
					const nos =  [0/0, 1000, 2e6, 6.6e12, 7e15]
					try {nos.push(BigInt("987354000000000000"))} catch(e) {}
					let res = []
					res.push( (-1100000000).toLocaleString(localecode, {notation: "compact", compactDisplay: "short", useGrouping: true}) )
					nos.forEach(function(num){
						try {
							res.push( (num).toLocaleString(localecode, {notation: "compact", compactDisplay: "long", useGrouping: true}) )
						} catch(e) {
							res.push(zErr)
						}
					})
					return res.join(" | ")
				} else if (item == 36) {
					// currency
					let res = []
					let opt1 = {style: "currency", currency: "USD", currencySign: "accounting"},
						opt2 = {style: "currency", currency: "USD", currencyDisplay: "name"},
						opt3 = {style: "currency", currency: "USD", currencyDisplay: "symbol"}
					res.push( Number(-1000).toLocaleString(localecode, opt1) )
					res.push( Number(-1).toLocaleString(localecode, opt2) )
					res.push( Number(1000).toLocaleString(localecode, opt3) )
					return res.join(" | ")
				} else if (item == 37) {
					// notation
					let res = []
					let nBig = 987654
					try {nBig = BigInt("987354000000000000")} catch(e) {}
					res.push( (nBig).toLocaleString(localecode, {notation: "scientific", style: "decimal"}))
					let opt = {notation: "standard", style: "decimal"}
					res.push( (0/0).toLocaleString(localecode, opt) )
					res.push( (-1000).toLocaleString(localecode, opt) )
					res.push( (987654).toLocaleString(localecode, opt) )
					res.push( (1000).toLocaleString(localecode, {notation: "standard", style: "percent"}))
					return res.join(" | ")
				} else if (item == 38) {
					// sign
					let res = []
					let nos = [-1, 0/0]
					nos.forEach(function(num){
						res.push( (num).toLocaleString(localecode, {signDisplay: "always"}) )
					})
					return res.join(" | ")
				} else if (item == 39) {
					// unit
					let itemtest = (1).toLocaleString("en", {style: "unit", unit: "day"}) // trap error
					let res = []
					Object.keys(tests["unit"]).sort().forEach(function(u){ // for each unit
						Object.keys(tests["unit"][u]).forEach(function(ud){ // for each unitdisplay
							try {
								tests["unit"][u][ud].forEach(function(n){ // for each number
									res.push( (n).toLocaleString(localecode, {style: "unit", unit: u, unitDisplay: ud}) )
								})
							} catch (e) {} // ignore invalid
						})
					})
					//console.log(res)
					return mini(res)


// DATETIME
				} else if (item == 41) {return (amWorker ? ""+ d : d)
				} else if (item == 42) {return d.toString()
				} else if (item == 43) {return d.toGMTString()
				} else if (item == 44) {return d.toUTCString()
				} else if (item == 45) {return d.toTimeString()

// DATETIME & FORMAT (can use localecode)
				} else if (item == 46) {return d.toLocaleString(localecode, o)
				} else if (item == 47) {return d.toLocaleDateString(localecode, o)
				} else if (item == 48) {return d.toLocaleTimeString(localecode, o)
				} else if (item == 49) {return IntlDTFo.format(d)
				} else if (item == 50) {
					let f = Intl.DateTimeFormat(localecode, { weekday: "long", month: "long", day: "numeric",
						year: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long" })
					let temp = f.formatToParts(d)
					return temp.map(function(entry){return entry.value}).join("")
				} else if (item == 51) {return d.toLocaleString(localecode)
				} else if (item == 52) {return [d].toLocaleString(localecode)
				} else if (item == 53) {return d.toLocaleDateString(localecode)
				} else if (item == 54) {return IntlDTF.format(d)
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
					return IntlDTFo.formatRange(date1, date2) +" | "+ IntlDTFo.formatRange(date1, date3)
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

		// build
		let oldres = [ // preload 19 skips
			"skip","skip","skip","skip","skip",
			"skip","skip","skip","skip","skip",
			"skip","skip","skip","skip","skip",
			"skip","skip","skip","skip",
		]

		for (let i=20; i < 60; i++) {
			let result = get_item(i)
			if (result == zU) {result = zUQ
			} else if (result === undefined) {result = zU
			} else if (result === "") {result = "empty string"
			}
			if (result !== "skip") {
				log_display(4, "ldt"+ i, result)
			}
		}
		//*/

		// ToDo: more type checking
			// e.g. Object.prototype.toString.call(value) == "[object Date]"
	})
}

function outputRegion() {
	let t0 = nowFn()
	Promise.all([
		get_lang(),
		get_geo(),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(4, item)})
		log_section(4, t0)
	})
}

countJS(SECT4)
