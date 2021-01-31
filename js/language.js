'use strict';

let bTZ = false
let langDoc = []
let combo1 = "", combo2 = ""
let lHash0 = "", lHash1 = "", lHash2 = ""

function get_navigator() {
	return new Promise(resolve => {
		let results = []

		// beacon
		let beacon = ""
		try {beacon = (navigator.sendBeacon ? zE : zD)} catch(e) {beacon = zB0}

		// DNT
		let dnt = ""
		if ("doNotTrack" in navigator) {
			try {
				dnt = navigator.doNotTrack
				if (isFF) {
					if (dnt == undefined) {dnt = zB0}
					if (dnt == 1) {dnt = zE}
				}
			} catch(e) {
				dnt = zB0
			}
		} else {
			dnt = zNA
		}

		// online
		let online = ""
		try {
			online = navigator.onLine
			if (online == undefined) {online = zB0}
		} catch(e) {online = zB0}

		// FF
		let network = "", connection = "", test = "", r3 = ""

		if (isFF) {
			// network
			if ("connection" in navigator) {
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
			if ("connection" in navigator) {
				network = zE; connection = navigator.connection.type
			} else {
				network = zD; connection = navigator.connection
			}
		}

		// GPC: 1670058
		let gpc = ""
		try {
			if ("globalPrivacyControl" in navigator) {gpc = zS} else {gpc = zNS}
		} catch(e) {gpc = zB0}

		// push
		results.push("beacon:" + beacon)
		results.push("dnt:" + dnt)
		results.push("online:" + online)
		results.push("network:" + network)
		results.push("connection:" + connection)
		results.push("globalPrivacyControl:" + gpc)
		// display
		dom.nBeacon = beacon
		dom.nDNT.innerHTML = "" + dnt
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
		section_info("headers", t0, section)
	})
}

function get_geo() {
	return new Promise(resolve => {
		let r = ("geolocation" in navigator ? zE : zD)
			+ " | " + ("Geolocation" in window ? "true" : "false")
		dom.geo1 = r
		function geoWrite(r) {
			r= sha1(r)
			let rhash = r
			if (isTB) {
				if (r == "ce3ac8f48088499747d70a031d3f4eaaed61da46" && isVer > 71) {
					// TB ESR78+: disabled, true, prompt
					r += default_tb_green + " [ESR78+]"
				} else if (r == "e9870617411d57d9cc8f722098a0ac7ff694f825" && isVer < 72) {
					// TB ESR68-: disabled, false, prompt
					r += default_tb_green + " [ESR60-68]"
				} else {
					r += default_tb_red
				}
			} else if (isFF) {
				if (r == "d053193ca561271fb2d1f6c888c9a268d5d02e5b" && isVer > 71) {
					// FF72+: enabled, true, prompt
					r += default_ff_green + " [FF72+]"
				} else if (r == "e672602411121842c18d9fa63c964c5ea288b74c" && isVer < 72) {
					// FF71-: enabled, false, prompt
					r += default_ff_green + " [FF60-71]"
				} else {
					r += default_ff_red
				}
			}
			dom.lHash3.innerHTML = r
			return resolve("geo:"+rhash)
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
				if (item == 0) {return navigator.languages
				} else if (item == 1) {return navigator.language
				} else if (item == 2) {return navigator.languages[0]
				} else if (item == 3) {return Intl.Collator().resolvedOptions().locale
				} else if (item == 4) {return Intl.DateTimeFormat().resolvedOptions().locale
				} else if (item == 5) {return new Intl.DisplayNames(undefined, {type: "region"}).resolvedOptions().locale
				} else if (item == 6) {return new Intl.ListFormat(undefined).resolvedOptions().locale
				} else if (item == 7) {return Intl.NumberFormat().resolvedOptions().locale
				} else if (item == 8) {return new Intl.PluralRules().resolvedOptions().locale
				} else if (item == 9) {return new Intl.RelativeTimeFormat().resolvedOptions().locale
				} else if (item == 10) {return "n/a"
				} else if (item == 11) {return "n/a"
				// timezone
				} else if (item == 12) {
					let k = 60000, yr = Date().split` `[3]
					// control
					let c1 = new Date("January 1, "+yr+" 13:00:00 UTC"),
						c2 = new Date("April 1, "+yr+" 13:00:00 UTC"),
						c3 = new Date("July 1, "+yr+" 13:00:00 UTC"),
						c4 = new Date("October 1, "+yr+" 13:00:00 UTC")
					// real
					let r1 = new Date("January 1, "+yr+" 13:00:00"),
						r2 = new Date("April 1, "+yr+" 13:00:00"),
						r3 = new Date("July 1, "+yr+" 13:00:00"),
						r4 = new Date("October 1, "+yr+" 13:00:00")
					return r1.getTimezoneOffset() +", "+ r2.getTimezoneOffset()
						+", "+ r3.getTimezoneOffset() +", "+ r4.getTimezoneOffset()
						// getTime
						+ " | "+ ((r1.getTime() - c1.getTime())/k) + ", "+ ((r2.getTime() - c2.getTime())/k)
						+ ", "+ ((r3.getTime() - c3.getTime())/k) + ", "+ ((r4.getTime() - c4.getTime())/k)
						// Date.parse
						+ " | "+ ((Date.parse(r1) - Date.parse(c1))/k) + ", "+ ((Date.parse(r2) - Date.parse(c2))/k)
						+ ", "+ ((Date.parse(r3) - Date.parse(c3))/k) + ", "+ ((Date.parse(r4) - Date.parse(c4))/k)
				} else if (item == 13) {return Intl.DateTimeFormat().resolvedOptions().timeZone
				} else if (item == 14) {
					let tzresults = [],
						days = ["January 1","July 1",],
						years = [1879,1921,1952,1976,2018],
						k = 60000
					for (let i = 0 ; i < years.length; i++) {
						for (let j = 0 ; j < days.length; j++) {
							let datetime = days[j] +", "+ years[i] +" 13:00:00"
							let control = new Date(datetime + " UTC")
							let test = new Date(datetime)
							let diff = ((Date.parse(test) - Date.parse(control))/k)
							tzresults.push(diff)
						}
					}
					return tzresults.join()
				} else if (item == 15) {return "n/a"
				} else if (item == 16) {return "n/a"
				// date/time format
				} else if (item == 17) {
					return (amWorker ? ""+d : d)
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
						+ ", " + concat_parts("-3", "week")
						+ ", " + concat_parts("-1", "hour")
						+ ", " + concat_parts("45", "second")
						+ ", " + concat_parts("1", "day")
						+ ", " + concat_parts("1", "quarter")
				} else if (item == 35) {
					// Intl.NumberFormat
					function err_check(name, error) {
						if (isFF) {
							if (error == "invalid value unit for option style" && isVer < 71) {
								// 70-
								err.push(item +" [expected]: "+ name + " : " + error)
								return " | unit " + zNS
							} else if (error == "invalid value \"unit\" for option style" && isVer > 70 && isVer < 78) {
								// 71-77
								err.push(item +" [expected]: "+ name + " : " + error)
								return " | \"unit\" " + zNS
							} else {
								err.push(item +" [unexpected]: "+ name + " : " + error)
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
					let tmp = "", str = "", type ="", charcode = ""
					function clean_string(type, string, extra) {
						// prettify
						try {
							string = string.replace(/"/g, "")
							string = string.replace("{type:", "")
							string = string.replace(",value:", " ")
							string = string.replace("}", "")
							if (extra == true) {
								// charCode single chars: e.g group/fr
								charcode = string.charCodeAt(string.length-1)
								string = string+" <code>"+ charcode +"</code>"
							}
							return string
						} catch(e) {
							if (e.message == "string is undefined") {
								return type+" "+zU
							} else {
								return type+" error"
							}
						}
					}
					// decimal
					type = "decimal"
					str = JSON.stringify(new Intl.NumberFormat(undefined).formatToParts(1000.2)[3])
					tmp += clean_string(type, str, true)
					// group: e.g fr = narrow no-break space
					type = "group"
					str = JSON.stringify(new Intl.NumberFormat(undefined).formatToParts(1000)[1])
					tmp += " | "+ clean_string(type, str, true)
					// infinity
					type = "infinity"
					str = JSON.stringify(new Intl.NumberFormat(undefined).formatToParts(Infinity)[0])
					tmp += " | "+ clean_string(type, str, true)
					// minusSign
					type = "minusSign"
					str = JSON.stringify(new Intl.NumberFormat(undefined).formatToParts(-5)[0])
					tmp += " | " + clean_string(type, str, true)
					// nan: e.g. zh-TW
					type = "nan"
					str = JSON.stringify(new Intl.NumberFormat(undefined).formatToParts(4/5 + "%")[0])
					tmp += " | "+ clean_string(type, str, false)
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
					// dayPeriod: 1569103: nightly-only FF78+
					function get_day_period(date) {
						return new Intl.DateTimeFormat(undefined, {dayPeriod: "long"}).format(date)
					}
					let tmp ="",
						dayA = get_day_period(new Date("2019-01-30T08:00:00")),
						dayB = get_day_period(new Date("2019-01-30T12:00:00"))
					if (dayA == dayB) {
						tmp = zNS
						// ToDo: dayPeriod: version check when this leaves Nightly
						//if (isFF && isVer < 81) {
						//	tmp = zB0
						//	err.push(item +" [unexpected]: dayPeriod")
						//}
					} else {
						// in the morning, noon, in the afternoon, in the evening, at night
						tmp = dayA + ", " + dayB
							+ ", " + get_day_period(new Date("2019-01-30T15:00:00"))
							+ ", " + get_day_period(new Date("2019-01-30T18:00:00"))
							+ ", " + get_day_period(new Date("2019-01-30T22:00:00"))
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
					if (res40.length > 0) {tmp = res40.join(" | ")}
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
					// FF80+: 1496584, 1653024: formatRange
					let date1 = new Date(Date.UTC(2020, 0, 15, 11, 59, 59)),
						date2 = new Date(Date.UTC(2020, 0, 15, 12, 0, 1)),
						date3 = new Date(Date.UTC(2020, 8, 19, 23, 15, 30))
					let f = Intl.DateTimeFormat(undefined, o)
					return f.formatRange(date1, date2) +" | "+ f.formatRange(date1, date3)
				} else if (item == 48) {
					let prules = [], nos = [0,1,2,3,4,6,7,11,20,21,100]
					let prev = "", current = "", prError = ""
					for (let i=0; i < nos.length; i++) {
						try {
							current = new Intl.PluralRules(undefined).select(nos[i])
						} catch(e) {
							prError = e.name + " : " + e.message
							current = "error"
						}
						// record changes only
						if (prev !== current) {prules.push(nos[i] + ": "+ current)}
						prev = current
					}
					if (prError == "") {
						return prules.join(", ")
					} else {
						err.push(item + " [unexpected]: " + prError)
						return zB0
					}
				}
			} catch(e) {
				if (isFF) {
					// standard FF errors
					let msg = ""
					if (item == 5) {
						// ToDo: 1654116: DisplayNames: shipped 86+
						if (e.message == "Intl.DisplayNames is not a constructor") {msg = zNS}
					} else if (item == 6 || item == 45) {
						if (e.message == "Intl.ListFormat is not a constructor" && isVer < 78) {msg = zNS}
					} else if (item == 9|| item == 33 || item == 42) {
						if (e.message == "Intl.RelativeTimeFormat is not a constructor" && isVer < 65) {msg = zNS}
					} else if (item == 34 ) {
						if (e.message == "Intl.RelativeTimeFormat is not a constructor" && isVer < 65) {msg = zNS}
						if (e.message == "rtf.formatToParts is not a function" && isVer > 64 && isVer < 70) {msg = zNS}
					} else if (item == 37 || item == 38) {
						if (e.message == "BigInt is not defined" && isVer < 68) {msg = zNS + " [BigInt]"}
						if (e.message == "can't convert BigInt to number" && isVer > 67 && isVer < 70) {msg = zNS}
					} else if (item == 47) {
						// ToDo: formatRange is nighly only: 1653024 add version when it rides the train
						if (e.message == "f.formatRange is not a function") {msg = zNS}
					}
					// script blocking
					if (msg == "") {
						if (amWorker) {
							console.log("language worker error: "+ item +": "+ e.name +": "+ e.message)
						}
						err.push(item +" [unexpected]: "+ e.name + " : " + e.message)
						msg = zB0
					} else {
						err.push(item +" [expected]: "+ e.name + " : " + e.message)
					}
					return msg
				} else {
					return "error"
				}
			}
		}
		// output
		for (let i=0; i < 49; i++) {
			let result = get_item(i)
			if (isFF) {
				if (result == undefined) {result = zB0; err.push(i +" [unexpected]: undefined")
				} else if (result == "undefined") {result = zB0; err.push(i +" [unexpected]: \"undefined\"")
				} else if (result == "") {result = zB0; err.push(i +" [unexpected]: zero-length string")
				} else if (result == " | ") {result = zB0 + " | " + zB0; err.push(i +" [unexpected]: zero-length string")
				} else if (result == " |  | ") {result = zB0 + " | " + zB0 + " | " + zB0; err.push(i +" [unexpected]: zero-length string")
				}
			}
			res.push(result)
			// output
			if (i < 3) {
				// combine 0-2
				combo1 += (i == 0 ? "" : " | ") + result
				if (i == 2) {dom.ldt2.innerHTML = combo1}
			} else if (i < 10) {
				// combine 3-9
				combo2 += (i == 3 ? "" : " | ") + result
				if (i == 9) {dom.ldt9.innerHTML = combo2}
			} else if (i == 14) {
				// hash multi-year timezone offsets
				dom.ldt14.innerHTML = sha1(result)
			} else {
				document.getElementById("ldt"+i).innerHTML = result
			}
		}
		// debugging: error tracking
		if (err.length > 0) {console.log("language/datetime errors\n" + err.join("\n"))}
		console.debug(res) // temp debug

		let reshash = []
		// hash 0-11: language
		lHash0 = sha1(res.slice(0,12).join("-"))
		reshash.push("language:" + lHash0)
		//console.debug("language", lHash0, res.slice(0,12))
		if (isFF) {
			if (lHash0 == "f118f627a051196ddc7cb3b005aac3b3f549e1e5") {
				// DisplayNames supported
				lHash0 += enUS_green + " [FF86+]"
			} else if (lHash0 == "4a6ed35c7fba3d1bb488859f1bd85fdf015cad04") {
				// ListFormat supported
				lHash0 += enUS_green + " [FF78-85]"
			} else if (lHash0 == "a36834b8d352b5991f677a417c277b32709ec979") {
				// RelativeTimeFormat supported
				lHash0 += enUS_green + " [FF65-77]"
			} else {
				lHash0 += (lHash0 == "94d5c22a78d5d8886527e9dfef7c971bb2d3c31d" ? enUS_green + " [FF60-64]" : enUS_red)
			}
		}
		dom.lHash0.innerHTML = lHash0

		// hash 12-16: timezone
		lHash1 = sha1(res.slice(12,17).join("-"))
		reshash.push("timezone:" + lHash1)
		//console.debug("timezone", lHash1, res.slice(12,17))
		bTZ = (lHash1 == "8aa77801dd2bb3ad49c68f7ff179df3ea276479f" ? true : false)
		lHash1 += (bTZ ? rfp_green : rfp_red)
		dom.lHash1.innerHTML = lHash1

		// hash 17+: datetime
		lHash2 = sha1(res.slice(17,res.length).join("-"))
		reshash.push("datetime:" + lHash2)
		dom.lHash2 = lHash2
		// RFP
		let ff = ""
		if (isFF) {
			if (bTZ) {
				// state1: both green
				if (lHash2 == "0e884d1322d92ba36a736dd4f5655c2b8a562d6f") {
					// nightly has Intl.DateTimeFormat dayPeriod & formatRange
					ff = " [Nightly]"
				} else if (lHash2 == "1850636a34767cc10c2e72de7e9a460bf136bc4d") {
					ff = " [FF79+]"
				} else if (lHash2 == "ed964df4e555954fb897a3e868c4f18729335d73") {
					ff = " [FF78]"
				} else if (lHash2 == "4009d40e41812b66e6c0f66494bb4a1781ff9a80") {
					ff = " [FF71-77]"
				} else if (lHash2 == "657b6ea41edca81376a65c2fa81fa6bc641ec5a1") {
					ff = " [FF70]"
				} else if (lHash2 == "e8c8aaecdf81f60e2295c9beaeec6dd86ffa4caa") {
					ff = " [FF68-69]"
				} else if (lHash2 == "02f4b55b856e182cc2626a04246aee0c8d5499c6") {
					ff = " [FF65-67]"
				} else if (lHash2 == "b9d2ca0773957025f370d4060e666c405c3bf84d") {
					ff = " [FF63-64]"
				} else if (lHash2 == "5df6cb0174d57eeda7900ef81ca8aa1fd49587d7") {
					ff = " [FF60-62]"
				}
			}
			if (ff == "") {
				if (bTZ == true) {
					// state2: lang red, time green
					lHash2 += enUS_red + rfp_green
				} else {
					// state3: lang green, time red
					// lHash2 += enUS_green + rfp_red

					// state4: both red: just default to "and/or"
					lHash2 += spoof_both_red
				}
			} else {
				lHash2 += spoof_both_green
			}
		}
		dom.lHash2.innerHTML = lHash2 + (isFF ? ff : "")

		// return
		langDoc = res
		return resolve(reshash)
	})
}

function get_lang_worker() {
	return new Promise(resolve => {
		let msgWorker = []
		msgWorker.push(isFF)
		if (isVer == "") {msgWorker.push("0")} else {msgWorker.push(isVer)}
		if (isFile) {
			return resolve("n/a")
		} else if (typeof(Worker) == "undefined") {
			return resolve("n/a")
		} else {
			try {
				let workerlang = new Worker("js/language_worker.js")
				workerlang.addEventListener("message", function(e) {
					let res = langDoc
					workerlang.terminate
					// compare
					let swcombo1 = "", swcombo2 = ""
					for (let i=0; i < res.length; i++) {
						let divider = "<br>"
						try {
							if (i < 3) {
								swcombo1 +=  (i == 0 ? e.data[i].toString() : " | " + e.data[i])
								if (i == 2) {
									if (combo1 !== swcombo1) {
										dom.ldt2.innerHTML = combo1 + " | " + sb + swcombo1 + sc
									}
								}
							} else if (i < 10) {
								swcombo2 += (i == 3 ? "" : " | ") + e.data[i]
								if (i == 9) {
									if (combo2 !== swcombo2) {
										dom.ldt9.innerHTML = combo2 + "<br>" + sb + swcombo2 + sc
									}								
								}
							} else if (i == 17) {
								// date object
								if (""+res[i] !== e.data[i]) {
									document.getElementById("ldt"+i).innerHTML = res[i] + divider + sb + e.data[i] + sc
								}
							} else {
								if (res[i] !== e.data[i]) {
									if (i == 14) {
										document.getElementById("ldt"+i).innerHTML = res[i] + divider + sb + sha1(e.data[i].join()) + sc
									} else {
										document.getElementById("ldt"+i).innerHTML = res[i] + divider + sb + e.data[i] + sc
									}
								}
							}
						} catch(k) {
							console.debug("compare", i, k.name, k.message)
						}
					}
					// compare hashes
					if (isFF) {
						let wHash0 = sha1(e.data.slice(0,12).join("-"))
						if (wHash0 !== sha1(res.slice(0,12).join("-"))) {
							dom.lHash0.innerHTML = lHash0 +"<br>"+ sb + wHash0 + sc+" [see details]"
						}
						let wHash1 = sha1(e.data.slice(12,17).join("-"))
						if (wHash1 !== sha1(res.slice(12,17).join("-"))) {
							dom.lHash1.innerHTML = lHash1 +"<br>"+ sb + wHash1 + sc+" [see details]"
						}
						let wHash2 = sha1(e.data.slice(17,e.data.length).join("-"))
						if (wHash2 !== sha1(res.slice(17,res.length).join("-"))) {
							dom.lHash2.innerHTML = lHash2 +"<br>"+ sb + wHash2 + sc+" [see details]"
						}
					}
					
					return resolve(e.data)
				}, false)
				workerlang.postMessage(msgWorker)
			} catch(e) {
				return resolve("n/a")
			}
		}
	})
}

function outputLanguage() {
	let t0 = performance.now(),
		section = []

	// ToDO: logic with worker re section hash
	// if no worker or worker matches - use original result
	// if worker doesn't match = use worker

	function get_worker() {
		section_info("language", t0, section)
		get_lang_worker() // tack this on here for now
	}

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
		get_worker()
	})

}

countJS("language")
