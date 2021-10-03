'use strict';

let bTZ = false

function get_navigator() {
	return new Promise(resolve => {
		let results = []
		// beacon
		let beacon = (check_navKey("sendBeacon") ? zE : zD)
		// GPC: 1670058
		let gpc = (check_navKey("globalPrivacyControl") ? zS : zNS)
		// onLine
		let online = ""
		if (check_navKey("onLine")) {
			try {
				// ignore false: served over https and we want stability with reruns
				online = (navigator.onLine == undefined ? zB0 : true)
			} catch(e) {online = zB0}
		} else {online = zNA}
		// DNT
		let dnt = ""
		if (check_navKey("doNotTrack")) {
			try {
				dnt = navigator.doNotTrack
				if (isFF) {
					if (dnt == 1) {dnt = zE
					} else if (dnt == "unspecified") { // do nothing
					} else {dnt = zB0}
				}
			} catch(e) {dnt = zB0}
		} else {dnt = zNA}

		let network = "", connection = "", test = "", r3 = ""
		if (isFF) {
			// FF
			// network
			if (check_navKey("connection")) {
				// retest network
				try {
					test = navigator.connection
					network = (test == undefined ? zB0 : zE)
				} catch(e) {network = zB0}
				// type
				try {
					connection = navigator.connection.type
					if (connection == undefined) {connection = zB0}
				} catch(e) {connection = zB0}
			} else {
				// retest
				try {
					test = navigator.connection
					network = zD
				} catch(e) {network = zB0}
				// type
				try {
					connection = navigator.connection
				} catch(e) {connection = zB0} // never used
			}
		} else {
			// non-FF
			if (check_navKey("connection")) {
				network = zE; connection = navigator.connection.type
			} else {
				network = zD; connection = navigator.connection
			}
		}
		// push
		results.push("beacon:"+ beacon)
		results.push("globalPrivacyControl:"+ gpc)
		results.push("online:"+ online)
		// push: ToDo: harden
		results.push("dnt:"+ dnt)
		results.push("network:"+ network)
		results.push("connection:"+ connection)

		// display
		dom.nBeacon = beacon
		dom.nDNT.innerHTML = ""+ dnt
		dom.nOnLine.innerHTML = online
		dom.nNetwork.innerHTML = network
		if (network == zE) {
			dom.nConnection.innerHTML = connection + (connection == "unknown" ? rfp_green : rfp_red)
		} else {
			dom.nConnection.innerHTML = connection
		}
		dom.nGPC = gpc
		// subsection hash
		results.sort()
		dom.hHash0.innerHTML = sha1(results.join())
		// resolve
		return resolve(results)
	})
}

function outputHeaders() {
	let t0 = performance.now(),
		section = []
	Promise.all([
		get_navigator()
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
			let rhash = sha1(r)
			r = rhash.substring(0,8)
			if (isTB) {
				if (r == "ce3ac8f4" && isVer > 71) {
					// TB ESR78+: disabled, true, prompt
					r = default_tb_green +" [ESR78+]"
				} else if (r == "e9870617" && isVer < 72) {
					// TB ESR68-: disabled, false, prompt
					r = default_tb_green +" [ESR60-68]"
				} else {
					r = default_tb_red
				}
			} else if (isFF) {
				if (r == "d053193c" && isVer > 71) {
					// FF72+: enabled, true, prompt
					r = default_ff_green +" [FF72+]"
				} else if (r == "e6726024" && isVer < 72) {
					// FF71-: enabled, false, prompt
					r = default_ff_green +" [FF60-71]"
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
			try {
				// language
				if (item == 0) {return eval('navigator.languages')
				} else if (item == 1) {return navigator.language
				} else if (item == 2) {return navigator.languages[0]
				} else if (item == 3) {return Intl.Collator().resolvedOptions().locale
				} else if (item == 4) {return Intl.DateTimeFormat().resolvedOptions().locale
				} else if (item == 5) {return new Intl.DisplayNames(undefined, {type: "region"}).resolvedOptions().locale
				} else if (item == 6) {return new Intl.ListFormat(undefined).resolvedOptions().locale
				} else if (item == 7) {return Intl.NumberFormat().resolvedOptions().locale
				} else if (item == 8) {return new Intl.PluralRules().resolvedOptions().locale
				} else if (item == 9) {return new Intl.RelativeTimeFormat().resolvedOptions().locale
				} else if (item == 10) {return new Intl.Segmenter().resolvedOptions().locale
				} else if (item == 11) {return "n/a"
				// timezone
				} else if (item == 12) {
					let k = 60000, yr = Date().split` `[3]
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
						err.push(i +" [unexpected]: "+ error.name +" : "+ error.message)
					}
					try {
						part2 = ((r1.getTime() - c1.getTime())/k) +", "+ ((r2.getTime() - c2.getTime())/k)
						+", "+ ((r3.getTime() - c3.getTime())/k) +", "+ ((r4.getTime() - c4.getTime())/k)
					} catch(error) {
						err.push(i +" [unexpected]: "+ error.name +" : "+ error.message)
					}
					try {
						part3 = ((Date.parse(r1) - Date.parse(c1))/k) +", "+ ((Date.parse(r2) - Date.parse(c2))/k)
						+", "+ ((Date.parse(r3) - Date.parse(c3))/k) +", "+ ((Date.parse(r4) - Date.parse(c4))/k)
					} catch(error) {
						err.push(i +" [unexpected]: "+ error.name +" : "+ error.message)
					}
					return part1 +" | "+ part2 +" | "+ part3
				} else if (item == 13) {return Intl.DateTimeFormat().resolvedOptions().timeZone
				} else if (item == 14) {
					let tzresults = [],
						days = ["January 1","July 1",],
						years = [1879,1921,1952,1976,2018],
						k = 60000
					for (let i = 0 ; i < years.length; i++) {
						for (let j = 0 ; j < days.length; j++) {
							let datetime = days[j] +", "+ years[i] +" 13:00:00"
							let control = new Date(datetime +" UTC")
							let test = new Date(datetime)
							let diff = ((Date.parse(test) - Date.parse(control))/k)
							tzresults.push(diff)
						}
					}
					return tzresults.join()
				} else if (item == 15) {return "n/a"
				// date/time format
				} else if (item == 16) {
					// FF91+: 1710429
					let tzRes = []
					try {
						let tzNames = ["short","long","shortOffset","longOffset","shortGeneric","longGeneric"]
						let tzDays = ["January 1, 2019 13:00:00","July 1, 2019 13:00:00"]
						tzDays.forEach(function(day) {
							tzNames.forEach(function(item) {
								let tz = ""
								let tzDate = new Date(day)
								try {
									let tzO = {hour12: true, timeZoneName: item}
									let tzA = Intl.DateTimeFormat(undefined, tzO).formatToParts(tzDate)
									for (let i = 0 ; i < tzA.length; i++) {
										let str = JSON.stringify(Intl.DateTimeFormat(undefined, tzO).formatToParts(tzDate)[i])
										if (str.indexOf("timeZoneName") !== -1 || str.indexOf("unknown") !== -1) {
											tz = str.replace(/"/g, "")
											tz = tz.replace("{type:timeZoneName,value:", "")
											tz = tz.replace("{type:unknown,value:", "")
											tz = tz.replace("}", "")			
										}
									}
								} catch(e) {
									if (isVer > 90) {tz = zB0} else if (isFF) {tz = zNS} else {tz = e.name == "RangeError" ? zNS : zB0}
								}
								if (tz !== zNS) {tzRes.push(tz)}
							})
						})
						return tzRes.join(", ")
					} catch(e) {
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
					return Intl.DateTimeFormat(undefined, {hour: "numeric"}).resolvedOptions().hourCycle
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
					function err_check(name, error) {
						if (isFF) {
							if (error == "invalid value unit for option style" && isVer < 71) {
								// 70-
								err.push(item +" [expected]: "+ name +" : "+ error)
								return " | unit "+ zNS
							} else if (error == "invalid value \"unit\" for option style" && isVer > 70 && isVer < 78) {
								// 71-77
								err.push(item +" [expected]: "+ name +" : "+ error)
								return " | \"unit\" "+ zNS
							} else {
								err.push(item +" [unexpected]: "+ name +" : "+ error)
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
						// ToDo: trap script blocking
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
					let tmp = get_value("decimal", new Intl.NumberFormat(undefined).formatToParts(1000.2), true)
						+" | "+ get_value("group", new Intl.NumberFormat(undefined).formatToParts(1000), true)
						+" | "+ get_value("infinity", new Intl.NumberFormat(undefined).formatToParts(Infinity), true)
						+" | "+ get_value("minusSign", new Intl.NumberFormat(undefined).formatToParts(-5), true)
						+" | "+ get_value("nan", new Intl.NumberFormat(undefined).formatToParts(4/5 +"%"), false)
					return tmp
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
						tmp = zNS
						if (isFF && isVer > 89) {
							tmp = zB0
							err.push(item +" [unexpected]: dayPeriod")
						}
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
					let tmp = "", res40 = []
					let	styles = ['long','short','narrow'],
						types = ['conjunction', 'disjunction','unit']
					styles.forEach(function(s){
						types.forEach(function(t){
							res40.push(new Intl.ListFormat(undefined,{style: s, type: t}).format(["a","b","c"]))
						})
					})
					if (res40.length) {tmp = res40.join(" | ")}
					return tmp
				} else if (item == 46) {
					// 1557718: 79+
					let list = ["short", "medium","long"],
						res41 = []
					list.forEach(function(s){
						let style = Intl.DateTimeFormat(undefined, {timeStyle: s,	dateStyle: s})
						res41.push(style.format(d))
					})
					return res41.join(" | ")
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
					let prev = "", current = "", prError = ""
					for (let i=0; i < nos.length; i++) {
						try {
							current = new Intl.PluralRules(undefined, {type: prtype}).select(nos[i])
						} catch(e) {
							prError = e.name +" : "+ e.message
							current = "error"
						}
						// record changes only
						if (prev !== current) {prules.push(nos[i] +": "+ current)}
						prev = current
					}
					if (prError == "") {
						return prules.join(", ")
					} else {
						err.push(item +" [unexpected]: "+ prError)
						return zB0
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
					}
					// script blocking
					if (msg == "") {
						if (amWorker) {
							console.log("language worker error: "+ item +": "+ e.name +": "+ e.message)
						}
						err.push(item +" [unexpected]: "+ e.name +" : "+ e.message)
						msg = zB0
					} else {
						err.push(item +" [expected]: "+ e.name +" : "+ e.message)
					}
					return msg
				} else {
					return "error"
				}
			}
		}

		// build
		for (let i=0; i < 50; i++) {
			let result = get_item(i)
			if (isFF) {
				if (result == undefined) {result = zB0; err.push(i +" [unexpected]: undefined")}
				if (result == "undefined") {result = zB0; err.push(i +" [unexpected]: \"undefined\"")}
			}
			if (result == "") {result = zB0; err.push(i +" [unexpected]: zero-length string")
			} else if (result == " | ") {result = zB0 +" | "+ zB0; err.push(i +" [unexpected]: zero-length strings")
			} else if (result == " |  | ") {result = zB0 +" | "+ zB0 +" | "+ zB0; err.push(i +" [unexpected]: zero-length strings")
			}
			res.push(result)

			// output line items after lang
			if (i > 11) {
				if (i == 14) {
					dom.ldt14.innerHTML = sha1(result) // hash multi-year timezone offsets
				} else {
					document.getElementById("ldt"+ i).innerHTML = result
				}
			}
		}
		// debugging: error tracking
		//if (err.length) {console.log("language/datetime errors\n"+ err.join("\n"))}

		// split into three
		let aLang = res.slice(0,12)
		let aTime = res.slice(12,16)
		let aDate = res.slice(16,res.length)
		// display concatenated fields
		dom.ldt2.innerHTML = aLang.slice(0,2).join(" | ")
		dom.ldt9.innerHTML = aLang.slice(2,11).join(" | ") // item 12 is n/a
		// record three hashes
		let hashLang = sha1(aLang.join("-"))
		let hashTime = sha1(aTime.join("-"))
		let hashDate = sha1(aDate.join("-"))
		let hashAll = []
		hashAll.push("language:"+ hashLang)
		hashAll.push("timezone:"+ hashTime)
		hashAll.push("datetime:"+ hashDate)

		// notation
		if (isFF) {
			// language
			if (hashLang == "4329b938f2a1f3f15591eed43e15d303388d7c9a") {hashLang += enUS_green +" [FF86+]"
			} else if (hashLang == "620769481983f4eeafe144b61f3b7bbe5bc7dc1a") {hashLang += enUS_green +" [FF78-85]"
			} else if (hashLang == "b65bfc8280697e09a57ca60dfbae75d1358a2d28") {hashLang += enUS_green +" [FF65-77]"
			} else {hashLang += (hashLang == "2525dff5501daca5336cbc2c2d967278143838c2" ? enUS_green +" [FF60-64]" : enUS_red)
			}
			// timezone
			bTZ = (hashTime == "be32bb73c0061974a3301536469d40d74e325375" ? true : false)
			hashTime += (bTZ ? rfp_green : rfp_red)
			// datetime
			let ff = ""
			if (isVer > 59) {
				// FF85+: also use javascript.use_us_english_locale
				if (bTZ) {
					// state1: both green
					if (hashDate == "070690b3fa490ce7f78cba7f3e482cdbac389e3e") {ff = " [FF91+]" // 1653024
					} else if (hashDate == "4c4a1a95f41f4d3f3872d1dbcd7c8081b869781b") {ff = " [FF90]"
					} else if (hashDate == "819c14f16920703e7a5121edd40b4d49cb5e6379") {ff = " [FF79-89]"
					} else if (hashDate == "4da6bdf18317347477e5f4b77a0c3a9250f0250c") {ff = " [FF78]"
					} else if (hashDate == "4dfdca34ff8057e7b32ef5bfa6c5e6d91bf7aa27") {ff = " [FF71-77]"
					} else if (hashDate == "d98729d2a89db3466d6e6e63921cf8b6643139d8") {ff = " [FF70]"
					} else if (hashDate == "b102773be99cf93e3205fad3e10ac1f8ab1444b2") {ff = " [FF68-69]"
					} else if (hashDate == "1f93dc8db2ae73c4a7e739870b2a7cd27d93998d") {ff = " [FF65-67]"
					} else if (hashDate == "f186c6bcb6cf62c7cf69efa15afc141585a9cf5e") {ff = " [FF63-64]"
					} else if (hashDate == "af7b6d1e2cac44b43bda6b70204c338c304da04c") {ff = " [FF60-62]"
					}
				}
				if (ff == "") {
					if (bTZ == true) {
						// state2: lang red, time green
						hashDate += enUS_red + rfp_green
					} else {
						// state3: lang green, time red
						// hashDate += enUS_green + rfp_red

						// state4: both red: just default to "and/or"
						hashDate += spoof_both_red
					}
				} else {
					hashDate += spoof_both_green
				}
				hashDate += ff
			}
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
	let t0 = performance.now(),
		section = []
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
		dom.lHashDoc = sha1(section.join())
		log_section("language", t0, section)
		//get_lang_worker() // rework a global worker test
	})
}

countJS("language")
