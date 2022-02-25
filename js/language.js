'use strict';

let bTZ = false

function get_connection() {
	return new Promise(resolve => {
		let knownGood = ["cellular","bluetooth","ethernet","wifi","other","none","unknown"]
		let test = "", value = "", result = "", eMsg = ""
		let aNetwork = []

		let sName = "headers_connection"
		sDetail[sName] = []
		sDetail[sName +"_fake_skip"] = []

		// connection
		let isCon = check_navKey("connection") // robust isFF
		let hasNav = ("connection" in navigator) // catch the BS
		let hasObj = false, isObjFake = true
		try {
			test = navigator.connection
			if (runSL) {test = {NetworkInformation: {type: "none", ontypechange: null}}}
			if (test == "undefined") {test = "undefined string"
			} else if (test == undefined || test == true || test == false || test == null) {test += ""
			} else if (Array.isArray(test)) {test = "array"}
			if (test == "") {test = "empty string"}
			if (typeof test === "object") {hasObj = true}
			if (hasObj && test +"" == "[object NetworkInformation]") {isObjFake = false}
		} catch(e) {
			test = trim_error(e.name, e.message)
			log_error("headers: connection", e.name, e.message)
		}

		// networkData
		let btn = "", hash = ""
		try {
			let oNetwork = {}, aKeys = [], aFunc = []
			for (let key in navigator.connection) {
				if (typeof navigator.connection[key] !== "function") {aKeys.push(key)} else {aFunc.push(key)}
			}
			if (aFunc.length) {aNetwork.push("functions:"+ aFunc.join(","))}
			if (aKeys.length) {aNetwork.push("keys:"+ aKeys.join(","))
				aKeys.sort()
				aKeys.forEach(function(item) {
					let keyValue = ""
					try {
						keyValue = navigator.connection[item]
					} catch(e) {
						keyValue = (e.name === undefined ? zErr : e.name)
					}
					aNetwork.push(item +":"+ keyValue)
				})
			}
			if (runSL) {
				aNetwork = ["functions:addEventListener,removeEventListener,dispatchEvent",
					"keys:type,ontypechange","ontypechange:null","type:none"]
				hasNav = true
			}
			if (aNetwork.length) {
				if (isObjFake) {sName += "_fake_skip"}
				sDetail[sName] = aNetwork
				hash = mini_sha1(aNetwork.join(), "devices network")
				btn = buildButton("5", sName)
			}
		} catch(e) {
			log_error("headers: connection", e.name, e.message)
		}

		// console.debug(isCon, hasNav, hasObj, isObjFake) // cydec false, true, true, true
		// not supported
		if (!isCon && !hasNav) {
			if (test == "undefined") {
				test = zNS
				if (isFF) {
					if (isOS == "android") {test += isTB ? default_tb_green : default_ff_red
					} else {test += default_ff_green}
				}
			} else {
				if (hasObj) {
					if (aNetwork.length) {test = soL + hash + scC + btn
					} else {test = soL + test + scC}
				} else {
					test = soL + test + scC
				}
				if (gRun) {
					gKnown.push("headers:connection")
					gBypassed.push("headers:connection:undefined")
				}
			}
			dom.nConnection.innerHTML = test
			return resolve("connection:undefined")
		}

		// supported
		let fpValue = hash
		if (isObjFake) {
			if (gRun) {gKnown.push("headers:connection")}
			if (isFF && !isCon) {
				fpValue = "undefined"
				hash = soB + hash + scC
				if (gRun) {gBypassed.push("headers:connection:undefined")}
			} else {
				hash = soL + hash + scC
				fpValue = zLIE
			}
		} else if (isFF) {
			if (isTB) {
				btn += default_tb_red
			} else if (isOS == "android") {
				// ToDo: RFP notation
				btn += hash == "f138e57e317bf6cf3a3e001972764e998238e3f3" ? rfp_green : rfp_red
			} else {
				btn += default_ff_red
			}
		}
		dom.nConnection.innerHTML = hash + btn
		return resolve("connection:"+ fpValue)

	})
}

function get_navigator() {
	return new Promise(resolve => {
		let results = []
		// beacon
		let beacon = (check_navKey("sendBeacon") ? zE : zD)
		dom.nBeacon = beacon
		results.push("beacon:"+ beacon)

		// GPC: 1670058
		let gpc = (check_navKey("globalPrivacyControl") ? zS : zNS)
		dom.nGPC = gpc
		results.push("globalPrivacyControl:"+ gpc)

		// onLine
		let online = true
		let onlineLie = true // assume lies
		try {
			let online = navigator.onLine
			online = cleanFn(online)
			if (online == "true") {onlineLie = false} // must be true over HTTPS
			dom.nOnLine.innerHTML = onlineLie ? soB + online + scC : ""+ online
		} catch(e) {
			log_error("headers: onLine", e.name, e.message)
			online = zB0
			dom.nOnLine.innerHTML = soB + e.name + scC
		}
		if (onlineLie && gRun) {
			gKnown.push("headers:onLine")
			gBypassed.push("headers:onLine:"+ zE)
		}
		results.push("online:true") // always return true

		// DNT
		let dnt = "", dntLie = false
		if (check_navKey("doNotTrack")) {
			try {
				dnt = navigator.doNotTrack
				if (isFF) {
					if (!Number.isInteger(dnt) && dnt +"" == "1") {dnt = zE
					} else if (dnt == "unspecified") { // do nothing
					} else {
						dntLie = true
						if (Number.isInteger(dnt) || typeof dnt == "boolean") {
						} else if (dnt == zU) {dnt = zUQ
						} else if (dnt == "") {dnt = "empty string"}
					}
				}
				dom.nDNT.innerHTML = dntLie ? soL + dnt + scC : ""+ dnt
				if (dntLie) {
					dnt = zLIE
					if (gRun) {gKnown.push("headers:doNotTrack")}
				}
			} catch(e) {
				log_error("headers: doNotTrack", e.name, e.message)
				dnt = zB0
				dom.nDNT.innerHTML = ""+ e.name
			}
		} else {
			dnt = zNA
			dom.nDNT.innerHTML = zNA
		}
		results.push("dnt:"+ dnt)

		// resolve
		results.sort()
		return resolve(results)
	})
}

function outputHeaders() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = []
	Promise.all([
		get_navigator(),
		get_connection()
	]).then(function(results){
		results.forEach(function(currentResult) {
			section = section.concat(currentResult)
		})
		log_section("headers", t0, section)
	})
}

function get_geo() {
	return new Promise(resolve => {
		let r = (check_navKey("geolocation") ? zE : zD)
			+" | "+ ("Geolocation" in window ? "true" : "false")
		dom.geo1 = r
		function geoWrite(r) {
			let rhash = mini_sha1(r, "language geo")
			r = rhash.substring(0,8)
			if (isTB) {
				if (r == "6e684da1" && isVer > 71) {
					// TB ESR78+: disabled, true, prompt
					r = default_tb_green +" [ESR78+]"
				} else if (r == "406f0224" && isVer < 72) {
					// TB ESR68-: disabled, false, prompt
					r = default_tb_green +" [ESR60-68]"
				} else {
					r = default_tb_red
				}
			} else if (isFF) {
				if (r == "f8a72f92" && isVer > 71) {
					// FF72+: enabled, true, prompt
					r = default_ff_green +" [FF72+]"
				} else if (r == "c64a2946" && isVer < 72) {
					// FF71-: enabled, false, prompt
					r = default_ff_green +" [FF71 or lower]"
				} else {
					r = default_ff_red
				}
			} else {
				r = ""
			}
			dom.lHash3.innerHTML = rhash + r
			return resolve("geo:"+ rhash)
		}
		function geoState(state) {
			dom.geo2 = state
			r += "-"+ state
			geoWrite(r)
		}
		try {
			navigator.permissions.query({name:"geolocation"}).then(e => geoState(e.state))
		} catch(e) {
			dom.geo2 = zB0
			r += "-"+ zB0
			geoWrite(r)
		}
	})
}

function get_lang_doc() {
	return new Promise(resolve => {

		let d = new Date("January 30, 2019 13:00:00"),
			o = {weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric",
				minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long"},
			res = [],
			err = []

		function get_item(item) {
			let amWorker = false
			let eMsg = ""
			try {
				// language
				if (item == 0) {return navigator.languages
				} else if (item == 1) {return navigator.language
				} else if (item == 2) {return navigator.languages[0]
				} else if (item == 3) {return Intl.Collator(undefined).resolvedOptions().locale
				} else if (item == 4) {return Intl.DateTimeFormat(undefined).resolvedOptions().locale
				} else if (item == 5) {return new Intl.DisplayNames(undefined, {type: "region"}).resolvedOptions().locale
				} else if (item == 6) {return new Intl.ListFormat(undefined).resolvedOptions().locale
				} else if (item == 7) {return Intl.NumberFormat(undefined).resolvedOptions().locale
				} else if (item == 8) {return new Intl.PluralRules(undefined).resolvedOptions().locale
				} else if (item == 9) {return new Intl.RelativeTimeFormat(undefined).resolvedOptions().locale
				} else if (item == 10) {return new Intl.Segmenter(undefined).resolvedOptions().locale
				} else if (item == 11) {
					let chars = ['a','A','aa','ch','ez','kz','ng','ph','ts','tt','y','\u00E2','\u00E4','\u01FB','\u0107',
					'\u0109','\u00E7\a','\u00EB','\u00ED','\u00EE','\u0137\a','\u0144','\u00F1','\u1ED9','\u00F6','\u1EE3',
					'\u0627','\u0649','\u06CC','\u06C6','\u06C7','\u06FD','\u0561','\u09A4','\u09CE','\u311A','\u0453',
					'\uA647','\u0503','\u0439','\u0457','\u040E','\u04F0','\u4E2D','\u0934','\u0935','\u1208','\u10D0',
					'\u03B1','\u0A85','\u3147','\u05EA','\uFB4A','\u0C85','\u1780','\u0E9A','\u1D95','\u025B','\u0149',
					'\u00F0','\u1DD9','\u1820','\u10350','\u0B05','\u0D85','\u0B85','\u0C05','\u0E24',]
					chars.sort()
					chars.sort(Intl.Collator(undefined).compare)
					sDetail[sName11] = chars
					return mini_sha1(chars.join(), "language collation")
				// timezone
				} else if (item == 12) {
					let k = 60000, yr = 2021
					item = (item+"").padStart(2,"0")
					try {yr = Date().split` `[3]} catch(e) {
						try {yr = new Date().getFullYear()} catch(e) {}
					}
					// control
					let c1 = new Date("January 1, "+ yr +" 13:00:00 UTC"),
						c2 = new Date("April 1, "+ yr +" 13:00:00 UTC"),
						c3 = new Date("July 1, "+ yr +" 13:00:00 UTC"),
						c4 = new Date("October 1, "+ yr +" 13:00:00 UTC")
					// real
					let r1 = new Date("January 1, "+ yr +" 13:00:00"),
						r2 = new Date("April 1, "+ yr +" 13:00:00"),
						r3 = new Date("July 1, "+ yr +" 13:00:00"),
						r4 = new Date("October 1, "+ yr +" 13:00:00")
					let part1 = zB0, part2 = zB0, part3 = zB0
					try {
						part1 = r1.getTimezoneOffset() +", "+ r2.getTimezoneOffset()
						+", "+ r3.getTimezoneOffset() +", "+ r4.getTimezoneOffset()
					} catch(error) {
						item = (item+"").padStart(2,"0")
						eMsg = (e.name === undefined ? zErr : e.name +": "+ e.message)
						log_error("language: item "+ item +" getTimezoneOffset", eMsg)
					}
					try {
						part2 = ((r1.getTime() - c1.getTime())/k) +", "+ ((r2.getTime() - c2.getTime())/k)
						+", "+ ((r3.getTime() - c3.getTime())/k) +", "+ ((r4.getTime() - c4.getTime())/k)
					} catch(error) {
						eMsg = (e.name === undefined ? zErr : e.name +": "+ e.message)
						log_error("language: item "+ item +" getTime", eMsg)
					}
					try {
						part3 = ((Date.parse(r1) - Date.parse(c1))/k) +", "+ ((Date.parse(r2) - Date.parse(c2))/k)
						+", "+ ((Date.parse(r3) - Date.parse(c3))/k) +", "+ ((Date.parse(r4) - Date.parse(c4))/k)
					} catch(error) {
						eMsg = (e.name === undefined ? zErr : e.name +": "+ e.message)
						log_error("language: item "+ item +" Date.parse", eMsg)
					}
					return part1 +" | "+ part2 +" | "+ part3
				} else if (item == 13) {return Intl.DateTimeFormat().resolvedOptions().timeZone
				} else if (item == 14) {
					let tzresults = [], tzyear = [],
						days = ["January 1","July 1",],
						years = [1879,1921,1952,1976,2018],
						k = 60000
					for (let i = 0 ; i < years.length; i++) {
						tzyear = []
						for (let j = 0 ; j < days.length; j++) {
							let datetime = days[j] +", "+ years[i] +" 13:00:00"
							let control = new Date(datetime +" UTC")
							let test = new Date(datetime)
							let diff = ((Date.parse(test) - Date.parse(control))/k)
							tzyear.push(diff)
						}
						tzresults.push(years[i] +": "+ tzyear.join(", "))
					}
					sDetail[sName14] = tzresults
					return mini_sha1(tzresults.join(), "language timezone offsets date.parse")
				} else if (item == 15) {return "n/a"
				// date/time format
				} else if (item == 16) {
					// FF91+: 1710429
					// note: use hour12 - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
					let tzRes = []
					try {
						let tzNames = ["short","long","shortOffset","longOffset","shortGeneric","longGeneric"]
						let tzDays = [Date.UTC(2019, 1, 1, 13, 0, 0), Date.UTC(2019, 7, 1, 0, 0, 0)]
						tzDays.forEach(function(day) {
							tzNames.forEach(function(name) {
								let tz = ""
								let tzDate = new Date(day)
								try {
									let tzFormatter = Intl.DateTimeFormat(undefined, {hour12: true, timeZoneName: name})
									let tzDateString = tzFormatter.formatToParts(day).map(({type, value}) => {
										// FF91: extended TZNs are type "unknown"
										if (type == "timeZoneName" || type == "unknown") {tz = value}
									})
								} catch(e) {
									if (day == tzDays[0]) {
										eMsg = (e.name === undefined ? zErr : e.name +": "+ e.message)
										log_error("language: item "+ item +" "+ name, eMsg)
									}
									if (isVer > 90) {tz = zB0} else if (isFF) {tz = zNS} else {tz = e.name == "RangeError" ? zNS : zB0}
								}
								if (tz !== zNS && tz !== "") {tzRes.push(tz)}
							})
						})
						return tzRes.join(", ")
					} catch(e) {
						eMsg = (e.name === undefined ? zErr : e.name +": "+ e.message)
						log_error("language: item "+ item +" timeZoneName", eMsg)
						return zB0
					}
				} else if (item == 17) {
					return (amWorker ? ""+ d : d)
				} else if (item == 18) {return d.toString()
				} else if (item == 19) {return d.toLocaleString(undefined, o)
				} else if (item == 20) {return d.toLocaleDateString(undefined, o)
				} else if (item == 21) {return d.toLocaleTimeString(undefined, o)
				} else if (item == 22) {return Intl.DateTimeFormat(undefined, o).format(d)
				} else if (item == 23) {
					let f = Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric",
						year: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true, timeZoneName: "long" })
					let temp = f.formatToParts(d)
					return temp.map(function(entry){return entry.value}).join("")
				} else if (item == 24) {return d.toGMTString()
				} else if (item == 25) {return d.toUTCString()
				} else if (item == 26) {return d.toLocaleString()
				} else if (item == 27) {return [d].toLocaleString()
				} else if (item == 28) {return d.toLocaleDateString()
				} else if (item == 29) {return Intl.DateTimeFormat().format(d)
				} else if (item == 30) {return d.toLocaleTimeString()
				} else if (item == 31) {return d.toTimeString()
				} else if (item == 32) {
					let test = Intl.DateTimeFormat(undefined, {hour: "numeric"}).resolvedOptions().hourCycle
					if (isFFLegacy && test === undefined) {test = zNA}
					return test
				} else if (item == 33) {
					// 65+: Intl.RelativeTimeFormat
					let rtf = new Intl.RelativeTimeFormat(undefined, {style: "long", numeric: "auto"})
					return rtf.format(-7, "day") +", "+ rtf.format(-1, "day") +", "+
						rtf.format(1, "day") +", "+ rtf.format(1, "month") +", "+ rtf.format(2, "year")
				} else if (item == 34) {
					// 70+: Intl.RelativeTimeFormat formatToParts
					let rtf = new Intl.RelativeTimeFormat(undefined, {style: "long", numeric: "auto"})
					function concat_parts(length, value) {
						let output = ""
						let rtf2 = new Intl.RelativeTimeFormat(undefined, {style: "long", numeric: "auto"})
						let rtf3 = rtf2.formatToParts(length, value)
						for (let x=0; x < rtf3.length; x++) {
							output += rtf3[x].value
						}
						return output
					}
					let test = rtf.formatToParts(-1, "year")
					return concat_parts("-1", "year")
						+", "+ concat_parts("-3", "week")
						+", "+ concat_parts("-1", "hour")
						+", "+ concat_parts("45", "second")
						+", "+ concat_parts("1", "day")
						+", "+ concat_parts("1", "quarter")
				} else if (item == 35) {
					// Intl.NumberFormat
					function err_check(name, msg) {
						if (isFF) {
							item = (item+"").padStart(2,"0")
							eMsg = (name === undefined ? zErr : name +": "+ msg)
							log_error("language: item "+ item, eMsg)
							let display = ""
							if (eMsg == "RangeError: invalid value unit for option style" && isVer < 71) {
								return " | unit "+ zNS // 70-
							} else if (eMsg == "RangeError: invalid value \"unit\" for option style" && isVer > 70 && isVer < 78) {
								return " | \"unit\" "+ zNS // 71-77
							} else {
								return " | "+ zB0
							}
						} else {
							return " | error"
						}
					}
					// decimals & groups
					let tmp = new Intl.NumberFormat(undefined).format(123456.789)
					// unit long
					try {
						tmp += " | "+ new Intl.NumberFormat(undefined, {style: "unit", unit: "mile-per-hour", unitDisplay: "long"}).format(5)
					} catch(e) {
						tmp += err_check(e.name, e.message)
					}
					// notation: scientific
					try {
						tmp += " | "+ new Intl.NumberFormat(undefined, {notation: "scientific"}).format(987654321)
					} catch(e) {}
					// unit percent
					try {
						tmp += " | "+ new Intl.NumberFormat(undefined, {style: "unit", unit: "percent"}).format(1/2)
					} catch(e) {
						tmp += err_check(e.name, e.message)
					}
					// notation: long compact
					try {
						tmp += " | "+ new Intl.NumberFormat(undefined, {notation: "compact", compactDisplay: "long"}).format(654321987)
					} catch(e) {}
					// signDisplay
					try {
						tmp += " | "+ (55).toLocaleString(undefined, {signDisplay: "always"})
					} catch(e) {}
					return tmp
				} else if (item == 36) {
					// [formatToParts] Intl.NumberFormat
					function get_value(type, data, extra) {
						try {
							let str = type + " <code>none</code>"
							for (let i = 0 ; i < data.length; i++) {
								let tmpS = JSON.stringify(data[i])
								if (tmpS.indexOf(type) !== -1) {
									tmpS = tmpS.replace(/"/g, "")
									tmpS = tmpS.replace("{type:", "")
									tmpS = tmpS.replace(",value:", " ")
									str = tmpS.replace("}", "")
									if (extra == true) {str += " <code>"+ str.charCodeAt(str.length-1) +"</code>"}
								}
							}
							if (str == undefined) {str = " <code>undefined</code>"}
							return str
						} catch(e) {
							return type +" error"
						}
					}
					try {
						let tmp = get_value("decimal", new Intl.NumberFormat(undefined).formatToParts(1000.2), true)
							+" | "+ get_value("group", new Intl.NumberFormat(undefined).formatToParts(1000), true)
							+" | "+ get_value("infinity", new Intl.NumberFormat(undefined).formatToParts(Infinity), true)
							+" | "+ get_value("minusSign", new Intl.NumberFormat(undefined).formatToParts(-5), true)
							+" | "+ get_value("nan", new Intl.NumberFormat(undefined).formatToParts(4/5 +"%"), false)
						return tmp
					} catch (e) {
						item = (item+"").padStart(2,"0")
						eMsg = (e.name === undefined ? zErr : e.name +": "+ e.message)
						log_error("language: item "+ item, eMsg)
						if (isFFLegacy && eMsg == "TypeError: (new Intl.NumberFormat(...)).formatToParts is not a function") {
							return zNS
						} else {
							return zB0
						}
					}
				} else if (item == 37) {
					// 70+: [BigInt] Intl.NumberFormat
					let bint = BigInt(9007199254740991)
					bint = eval("987654321987654321n")
					let numFormat = new Intl.NumberFormat(undefined)
					return numFormat.format(bint)
				} else if (item == 38) {
					// 70+: [BigInt] toLocaleString
					let bint = BigInt(9007199254740991)
					bint = eval("123456789123456789n")
					let tmp = bint.toLocaleString()
					if (tmp == "123456789123456789") {
						// 68-69
						tmp = zNS
					}
					return tmp
				} else if (item == 39) {
					return Number(1234567.89).toLocaleString(undefined, {style: "currency", currency: "USD", currencyDisplay: "symbol"})
				} else if (item == 40) {
					return Intl.DateTimeFormat().resolvedOptions().calendar
				} else if (item == 41) {
					return Intl.DateTimeFormat().resolvedOptions().numberingSystem
				} else if (item == 42) {
					// 70+
					let tmp = new Intl.RelativeTimeFormat().resolvedOptions().numberingSystem
					// 65-69
					if (isVer > 64 && isVer < 70) {
						if (tmp == undefined) {tmp = "not supported [undefined]"}
					}
					return tmp
				} else if (item == 43) {
					// relatedYear, yearName
					let tmp = Intl.DateTimeFormat(undefined, {relatedYear: "long"})
						tmp = tmp.formatToParts(d)
						tmp = tmp.map(function(entry){return entry.value}).join("")
					let tmpb = Intl.DateTimeFormat(undefined, {year: "numeric", yearName: "long"})
						tmpb = tmpb.formatToParts(d)
						tmpb = tmpb.map(function(entry){return entry.value}).join("")
					return tmp += " | "+ tmpb
				} else if (item == 44) {
					function get_day_period(date) {
						let dpNarrow = new Intl.DateTimeFormat(undefined, {hourCycle: "h12", dayPeriod: "narrow"}).format(date)
						let dpLong = new Intl.DateTimeFormat(undefined, {hourCycle: "h12", dayPeriod: "long"}).format(date)
						return dpNarrow == dpLong ? dpLong : dpNarrow + ", " + dpLong
					}
					let tmp ="",
						dayA = get_day_period(new Date("2019-01-30T08:00:00")),
						dayB = get_day_period(new Date("2019-01-30T12:00:00"))
					if (dayA == dayB) {
						tmp = isVer > 89 ? zB0 : zNS
					} else {
						// in the morning, noon, in the afternoon, in the evening, at night
						tmp = dayA +" | "+ dayB
							+" | "+ get_day_period(new Date("2019-01-30T15:00:00"))
							+" | "+ get_day_period(new Date("2019-01-30T18:00:00"))
							+" | "+ get_day_period(new Date("2019-01-30T22:00:00"))
					}
					return tmp
				} else if (item == 45) {
					// ListFormat: 1589095: 78+
					let tmp = "", res45 = []
					let	styles = ['long','short','narrow'],
						types = ['conjunction', 'disjunction','unit']
					styles.forEach(function(s){
						types.forEach(function(t){
							res45.push(new Intl.ListFormat(undefined,{style: s, type: t}).format(["a","b","c"]))
						})
					})
					if (res45.length) {tmp = res45.join(" | ")}
					return tmp
				} else if (item == 46) {
					// 1557718: 79+
					let list = ["short", "medium","long"],
						res46 = []
					list.forEach(function(s){
						let style = Intl.DateTimeFormat(undefined, {timeStyle: s,	dateStyle: s})
						res46.push(style.format(d))
					})
					return res46.join(" | ")
				} else if (item == 47) {
					// FF91+: 1653024: formatRange
					let date1 = new Date(Date.UTC(2020, 0, 15, 11, 59, 59)),
						date2 = new Date(Date.UTC(2020, 0, 15, 12, 0, 1)),
						date3 = new Date(Date.UTC(2020, 8, 19, 23, 15, 30))
					let f = Intl.DateTimeFormat(undefined, o)
					return f.formatRange(date1, date2) +" | "+ f.formatRange(date1, date3)
				} else if (item == 48 || item == 49) {
					let prules = [], nos = [0,1,2,3,4,5,6,7,8,9,10,11,20,21,81,100]
					let prtype = item == 48 ? "cardinal" : "ordinal"
					let prev = "", current = ""
					for (let i=0; i < nos.length; i++) {
						try {
							current = new Intl.PluralRules(undefined, {type: prtype}).select(nos[i])
						} catch(e) {
							eMsg = (e.name === undefined ? zErr : e.name +" : "+ e.message)
							current = "error"
							break
						}
						// record changes only
						if (prev !== current) {prules.push(nos[i] +": "+ current)}
						prev = current
					}
					if (eMsg == "") {
						return prules.join(", ")
					} else {
						item = (item+"").padStart(2,"0")
						log_error("language: item "+ item, eMsg)
						if (isFFLegacy && eMsg == "TypeError: Intl.PluralRules is not a constructor") {
							return zNS
						} else {
							return zB0
						}
					}
				}
			} catch(e) {
				if (isFF) {
					// standard FF errors
					let msg = ""
					if (item == 5) {
						// 1654116: shipped 86+
						if (e.message == "Intl.DisplayNames is not a constructor" && isVer < 87) {msg = zNS}
					} else if (item == 6 || item == 45) {
						if (e.message == "Intl.ListFormat is not a constructor" && isVer < 78) {msg = zNS}
					} else if (item == 9|| item == 33 || item == 42) {
						if (e.message == "Intl.RelativeTimeFormat is not a constructor" && isVer < 65) {msg = zNS}
					} else if (item == 10) {
						// 1423593: Segmenter: ToDo: add version check when shipped
						if (e.message == "Intl.Segmenter is not a constructor") {msg = zNS}
					} else if (item == 34 ) {
						if (e.message == "Intl.RelativeTimeFormat is not a constructor" && isVer < 65) {msg = zNS}
						if (e.message == "rtf.formatToParts is not a function" && isVer > 64 && isVer < 70) {msg = zNS}
					} else if (item == 37 || item == 38) {
						if (e.message == "BigInt is not defined" && isVer < 68) {msg = zNS +" [BigInt]"}
						if (e.message == "can't convert BigInt to number" && isVer > 67 && isVer < 70) {msg = zNS}
					} else if (item == 47 && isVer < 91) {
						// 1653024: formatRange: shipped 91+
						if (e.message == "f.formatRange is not a function") {msg = zNS}
					} else if (isVer < 60) {
						// legacy
						if (item == 8) {
							if (e.message == "Intl.PluralRules is not a constructor") {msg = zNS}
						}
					}
					item = (item+"").padStart(2,"0")
					log_error("language: item "+ item, e.name, e.message)

					// script blocking
					if (msg == "") {
						if (amWorker) {
							console.log("language worker error: "+ item +": "+ e.name +": "+ e.message)
						}
						err.push(item +": "+ e.name +" : "+ e.message)
						msg = zB0
					}
					return msg
				} else {
					return "error"
				}
			}
		}

		// cleanup details
		let sName11 = "language_collation",
			sName14 = "language_timezone_offsets_date.parse"
		sDetail[sName11] = []
		sDetail[sName14] = []

		// build
		for (let i=0; i < 50; i++) {
			let result = get_item(i)
			if (isFF) {
				if (result == zU) {result = zB0; err.push(i +" [unexpected]: " + zUQ)
				} else if (result === undefined) {result = zB0; err.push(i +" [unexpected]: " + zU)}
			}
			if (result == "") {result = zB0; err.push(i +" [unexpected]: empty string")
			} else if (result == " | ") {result = zB0 +" | "+ zB0; err.push(i +" [unexpected]: empty strings")
			} else if (result == " |  | ") {result = zB0 +" | "+ zB0 +" | "+ zB0; err.push(i +" [unexpected]: empty strings")
			}
			res.push(result)
			// output line items after combos
			if (i > 10) {
				if (i == 11) {
					result += buildButton("4", sName11)
				} else if (i == 14) {
					result += buildButton("4", sName14)
				}
				document.getElementById("ldt"+ i).innerHTML = result
			}
		}
		// debugging: error tracking
		if (err.length) {console.log("unexpected language/datetime errors\n"+ err.join("\n"))}

		// split into three
		let aLang = res.slice(0,12)
		let aTime = res.slice(12,16)
		let aDate = res.slice(16,res.length)
		// display concatenated fields
		dom.ldt2.innerHTML = aLang.slice(0,3).join(" | ")
		dom.ldt9.innerHTML = aLang.slice(3,11).join(" | ") // item 12 is n/a
		// record three hashes
		let hashLang = mini_sha1(aLang.join("-"), "language language & locale")
		let hashTime = mini_sha1(aTime.join("-"), "language timezone")
		let hashDate = mini_sha1(aDate.join("-"), "language date/time & format")
		let hashAll = []
		hashAll.push("language:"+ hashLang)
		hashAll.push("timezone:"+ hashTime)
		hashAll.push("datetime:"+ hashDate)

		// notation
		if (isVer > 59) { // ignore isFFLegacy
			// language
			if (hashLang == "7bbb3d82cf088ad3acca9977f2f44910945eb7ce") {hashLang += enUS_green +" [FF86+]"
			} else if (hashLang == "331c8ae488a477424d2cb244dac3499d75004d8d") {hashLang += enUS_green +" [FF78-85]"
			} else if (hashLang == "f93fb347147bc4c2f8df000987cbd257f929bec3") {hashLang += enUS_green +" [FF65-77]"
			} else {hashLang += (hashLang == "8d4a717d4072680fdef4112c63b8445991cd1db6" ? enUS_green +" [FF60-64]" : enUS_red)
			}
			// timezone
			bTZ = (hashTime == "e8b260c46d7e3bf71131cc8936a2d5bef1fe5850" ? true : false)
			hashTime += (bTZ ? rfp_green : rfp_red)
			// datetime
			let ff = ""
			if (bTZ) {
				// state1: both green
				// FF85+: also use javascript.use_us_english_locale
				if (hashDate == "561bee350bb336bb1673c345a9d5bbdb340a960e") {ff = " [FF91+]"
				} else if (hashDate == "3f35d9cfdeeec07da82b12575d89c7bcd786647e") {ff = " [FF90]"
				} else if (hashDate == "5eb6a41c1535f189aaa1e96c01ee2b0bcd43e76d") {ff = " [FF79-89]"
				} else if (hashDate == "7142a7276324f9f20c79cb63ce04d0c4bd287d3f") {ff = " [FF78]"
				} else if (hashDate == "6f4c7722ed4160adbdad5c726293b35fc72d4999") {ff = " [FF71-77]"
				} else if (hashDate == "7f0e477fd8df913bb3ccf1dc0adb79516fa44dbf") {ff = " [FF70]"
				} else if (hashDate == "1b0623fb14f16152d9d17ec7ea7e45a3444ae1fa") {ff = " [FF68-69]"
				} else if (hashDate == "8ce41d7686ad112c618cf5906fc005240d70c34c") {ff = " [FF65-67]"
				} else if (hashDate == "60a4fc24c0d762ff71ba61c71c9f91281c05df98") {ff = " [FF63-64]"
				} else if (hashDate == "bd1f40ca6319112d4133f64d82ebb5d947126606") {ff = " [FF60-62]"
				}
			}
			if (ff == "") {
				if (bTZ == true) {
					hashDate += enUS_red + rfp_green // state2: lang red, time green
				} else {
						// hashDate += enUS_green + rfp_red // state3: lang green, time red
						hashDate += spoof_both_red // state4: both red: just default to "and/or"
					}
			} else {
				hashDate += spoof_both_green
			}
			hashDate += ff
		}
		// display
		dom.lHash0.innerHTML = hashLang
		dom.lHash1.innerHTML = hashTime
		dom.lHash2.innerHTML = hashDate
		// return
		return resolve(hashAll)
	})
}

function get_lang_worker() {
	return new Promise(resolve => {
		let msgWorker = []
		msgWorker.push(isFF)
		if (isVer == "") {msgWorker.push("0")} else {msgWorker.push(isVer)}
		if (isFile) {
			return resolve(zNA)
		} else if (typeof(Worker) == "undefined") {
			return resolve(zNA)
		} else {
			try {
				let workerlang = new Worker("js/language_worker.js")
				workerlang.addEventListener("message", function(e) {
					workerlang.terminate
					// do something with e.data
					return resolve(e.data)
				}, false)
				workerlang.postMessage(msgWorker)
			} catch(e) {
				return resolve(zNA)
			}
		}
	})
}

function outputLanguage() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = []
	// run
	Promise.all([
		get_lang_doc(),
		get_geo(),
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
		section.sort()
		log_section("language", t0, section)
	})
}

countJS("language")
