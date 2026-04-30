'use strict';

/* HEADERS */
function get_nav_connection(METRIC) {
	let hash, btn ='', data ='', notation = default_red
	try {
		hash = navigator.connection
		if (runST) {hash = null} else if (runSI) {hash = {}} else if (runSL) {addProxyLie('Navigator.'+ METRIC)}
		if (undefined === hash) {
				hash = hash+''; notation = default_green
		} else {
			let typeCheck = typeFn(hash, true)
			if ('object' !== typeCheck) {throw zErrType + typeFn(hash)}
			let expected = '[object NetworkInformation]'
			if (hash+'' !== expected) {throw zErrInvalid + 'expected '+ expected +': got '+ hash}
			// https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
			let keyTypes = {
				// gecko only
				addEventListener: 'function',
				dispatchEvent: 'function',
				ontypechange: 'null',
				removeEventListener: 'function',
				type: 'string',
				// also in blink
				downlink: 'number',
				downlinkMax: 'null',
				effectiveType: 'string',
				onchange: 'null',
				rtt: 'number',
				saveData: 'boolean',
				when: 'function',
			}
			let oGood = {
				effectiveType: ['slow-2g','2g','3g','4g'],
				type: ['bluetooth','cellular','ethernet','none','wifi','wimax','other','unknown']
			}
			let oTemp = {}
			for (let k in hash) {
				try {
					let x = navigator.connection[k]
					if (runSI) {x = undefined}
					// type check
					let typeCheck = typeFn(x), expectedType = keyTypes[k]
					if (typeCheck !== expectedType) {
						let isInvalid = true
						// https://groups.google.com/a/chromium.org/g/blink-dev/c/tU_Hqqytx8g/m/HTJebzVHBAAJ
						// "WiFi on Android reports Infinity for downlinkMax as Chrome recently dropped the required permission to get Wifi linkSpeed
						if ('blink' == isEngine && 'downlinkMax' == k && 'Infinity' == typeCheck) {isInvalid = false}
						if (isInvalid) {throw zErrInvalid +'expected '+ expectedType +': got '+ typeCheck}
					}
					// valid string
					if ('type' == k || 'effectiveType' == k) {
						if (runSI) {x = '1g'}
						let aGood = oGood[k]
						if (!aGood.includes(x)) {throw zErrInvalid + ': got ' + x}
						if ('slow-2g' == x) {x = '2g'} // treat slow-2g as 2g
					}
					// cleanup
					if ('function' === typeCheck) {x = typeCheck}
					if (null == x || Infinity == x) {x += ''} // record null/Infinity as strings | note: 'null'/'Infinity' are caught as errors
					// stability
					if ('rtt' == k) {x = zNA} else if ('downlink' == k) {	x = Math.floor(x)}
					oTemp[k] = x
				} catch(e) {
					oTemp[k] = zErr
					log_error(5, METRIC +'_'+ k, e)
				}
			}
			data = {}
			for (const k of Object.keys(oTemp).sort()) {data[k] = oTemp[k]}
			hash = mini(data); btn = addButton(5, METRIC)
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(5, METRIC, hash, btn, notation, data, isProxyLie('Navigator.'+ METRIC))
	return
}

function get_nav_dnt(METRIC) {
	// ignored
		// navigator.msDoNotTrack = IE9 + 10
		// window.doNotTrack = IE11 and Edge 16- and old Safari

	// gecko: this is an expected property
	// nonGecko
		// blink: string vs null: i.e a string of "null" will be an error
		// webkit: undefined vs null: i.e a string of "undefined" will be an error
	let hash, data ='', expectedType = isGecko ? 'string' : 'undefined'
	try {
		hash = navigator[METRIC]
		if (runST) {hash = 1} else if (runSI) {hash = '2'}
		let typeCheck = typeFn(hash)
		if ('blink' == isEngine) {
			// blink can be pnly be "1" or null
			if ('1' !== hash && null !== hash) {throw zErrInvalid + 'expected 1 or null: got ' + hash}
		} else {
			if (expectedType !== typeCheck) {throw zErrType + typeCheck}
			if (isGecko) {
				if ('1' !== hash && 'unspecified' !== hash) {throw zErrInvalid + 'expected 1 or unspecified: got ' + hash}
			}
		}
		hash += '' // gecko is a string, otherwise we can only be null/undefined, so convert to a string
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(5, METRIC, hash,'','', data)
	return
}

function get_nav_online(METRIC) {
	// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
	let value, data ='', notation = rfp_red
	try {
		value = navigator.onLine
		if (runST) {value = undefined}
		let typeCheck = typeFn(value)
		// we expect blink, gecko, webkit to return a boolean
		if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
		if (value) {notation = rfp_green} // 1975851: FF142+
	} catch(e) {
		value = e; data = zErrLog
	}
	addBoth(5, METRIC, value,'', notation, data)
	return
}

function get_nav_gpc(METRIC) {
	// GPC: 1670058
		// privacy.globalprivacycontrol.functionality.enabled = navigator
		// privacy.globalprivacycontrol.enabled = true/false
	// FF120+ desktop (?android): gpc enabled: false but true in pb mode

	// ToDo: FF144+? 1983296 functionality pref deprecated
	let hash, data ='', notation = isBB ? default_red : ''
	try {
		hash = navigator[METRIC]
		if (runST) {hash = null} else if (runSL) {addProxyLie('Navigator.'+ METRIC)}
		if (undefined === hash) {
			hash = hash+''
		} else {
			let typeCheck = typeFn(hash)
			if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
			// expected boolean but could be true or false, so don't notate
			// except BB where we expect true due to pb mode
			if (isBB && true === hash) {notation = default_green}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(5, METRIC, hash,'', notation, data, isProxyLie('Navigator.'+ METRIC))
	return
}

/* REGION */

function add_microperf_intl(m, countC, tsub0, isIntl) {
	if (undefined == oIntlLocalePerf[m]) {oIntlLocalePerf[m] = {}}
	if (isIntl) {oIntlLocalePerf[m]['constructors'] = countC}
	let subname = (isIntl ? 'intl' : 'string')
	oIntlLocalePerf[m][subname] = nowFn() - tsub0
}

function set_isLanguageSmart() {
	// set once: ignore android for now
	if (!gLoad || !isSmart && !isSmartDataMode || !isDesktop) {return}

	// BB if ESR
		// resource://gre/res/multilocale.txt
	isLanguageSmart = isBB

	const en = 'en-US, en'
	languagesSupported = {
		// language = existing key | languages = key + value[0] | locale = key unless value[1] !== undefined
		'ar': [en],
		'be': [en],
		'bg': [en],
		'ca': [en],
		'cs': ['sk, '+ en],
		'da': [en],
		'de': [en],
		'el-GR': ['el, '+ en, 'el'],
		'en-US': ['en'],
		'es-ES': ['es, '+ en],
		'fa-IR': ['fa, '+ en, 'fa'],
		'fi-FI': ['fi, '+ en, 'fi'],
		'fr': ['fr-FR, '+ en],
		'ga-IE': ['ga, en-IE, en-GB, '+ en],
		'he': ['he-IL, '+ en],
		'hu-HU': ['hu, '+ en, 'hu'],
		'id': [en],
		'is': [en],
		'it-IT': ['it, '+ en, 'it'],
		'ja': [en],
		'ka-GE': ['ka, '+ en, 'ka'],
		'ko-KR': ['ko, '+ en, 'ko'],
		'lt': [en +', ru, pl'],
		'mk-MK': ['mk, '+ en, 'mk'],
		'ms': [en],
		'my': ['en-GB, en'],
		'nb-NO': ['nb, no-NO, no, nn-NO, nn, '+ en],
		'nl': [en],
		'pl': [en],
		'pt-BR': ['pt, '+ en],
		'pt-PT': ['pt, en, en-US'],
		'ro-RO': ['ro, en-US, en-GB, en', 'ro'],
		'ru-RU': ['ru, '+ en, 'ru'],
		'sq': ['sq-AL, '+ en],
		'sv-SE': ['sv, '+ en],
		'th': [en],
		'tr-TR': ['tr, '+ en, 'tr'],
		'uk-UA': ['uk, '+ en, 'uk'],
		'vi-VN': ['vi, '+ en, 'vi'],
		'zh-CN': ['zh, zh-TW, zh-HK, '+ en, 'zh-Hans-CN'],
		'zh-TW': ['zh, '+ en, 'zh-Hant-TW'],
	}
	// these are current stable BB hashes since last checked
		// note: upstream ESR seems to pick up stable l10n changes
	// last checked TB15.06

	// NOTE: these hashes are only designed to work with BB ESR (stable) and FF en-US
	// we can use an array if necessary so as to not get false positives in FF
	// using an array (test is .includes) means we're not super tight on our health check i.e per isVer

	let xsEN = '6cc5a8b4'
	localesSupported = {
		// v hashes are with localized NumberRangeOver/Underflow
		// c = css | m = media | v = verification | x = xml | xs = xslt | xsort = xslt sort
		// r = reporting (if blank we use the english hash)
		'ar': {   m: '1f9a06e3', v: '7262bcc6', x: '71982b47', xs: '5cee96ec', xsort: '352c4e34', r: ''},
		'be': {   m: '076d68e6', v: '4edeafab', x: '42583d22', xs: 'c28dba41', xsort: '74053574', r: '6de2f0b7'},
		'bg': {   m: '2da6c02e', v: 'ce892c88', x: 'c4f06f98', xs: 'b964cfe0', xsort: '7d747674', r: ''},
		'ca': {   m: 'd856d812', v: '6b3bb3d8', x: '77a62a49', xs: 'ad2e7060', xsort: xsEN,       r: ''},
		'cs': {   m: 'c92accb0', v: 'de3ab0ad', x: '81c91d49', xs: '7c010d86', xsort: 'a7ddfef4', r: '39eac55d'},
		'da': {   m: '39169214', v: '479797a1', x: 'a30818e8', xs: '8654b0f1', xsort: '88f55cfa', r: '266a324b'},
		'de': {   m: '298d11c6', v: 'f9e2eae6', x: 'c1ce6571', xs: '5ab0cbb9', xsort: xsEN,       r: '8c11ce07'},
		'el': {   m: '39712e09', v: 'fb391308', x: '493f7225', xs: '33a4584c', xsort: 'cae41bf4', r: '71191fa1'},
		'en-US': {m: '05c30936', v: '41310558', x: '544e1ae8', xs: 'bcb04adc', xsort: xsEN,       r: ['8c954475','4a9afc22']},
		'es-ES': {m: '96b78cbd', v: '97c3f5a9', x: 'ed807f70', xs: 'd9a6e947', xsort: '32fce55a', r: '7fc42e10'},
		'fa': {   m: '6648d919', v: '8ef57409', x: '1ed34bca', xs: '47876cea', xsort: 'ff0f7334', r: ''},
		'fi': {   m: '82d079c7', v: '3e29e6e7', x: '859efc32', xs: '67b222db', xsort: '26f7a3f8', r: ''},
		'fr': {   m: '024d0fce', v: '34e28fa2', x: '1d2050d3', xs: 'f09eacaa', xsort: xsEN,       r: '7ebbf4b3'},
		'ga-IE': {m: '97fca229', v: '2bf1321d', x: 'd3af2cd8', xs: '021b6b57', xsort: xsEN,       r: ''},
		'he': {   m: 'cdde832b', v: 'e47dbb82', x: 'c7274a3e', xs: '35d1f35c', xsort: 'a0fcc2b4', r: 'cadeed05'},
		'hu': {   m: 'db7366e6', v: 'b72d316d', x: 'e4f85168', xs: 'ffae360e', xsort: '2fe650b4', r: '4b0d44d0'},
		'id': {   m: '1e275882', v: '5dda18f3', x: 'a70cd23c', xs: '26e6e4fb', xsort: xsEN,       r: '93c32eba'},
		'is': {   m: '204c8f73', v: '6bbe7a8f', x: 'edb8b212', xs: '3d227a5a', xsort: '93b575f8', r: 'ce6ce0a6'},
		'it': {   m: '716e7242', v: '3b781f09', x: 'c567f479', xs: '7d0eba5c', xsort: xsEN,       r: '514ebfe9'},
		'ja': {   m: 'ab56d7cb', v: '48645d06', x: 'a58f6165', xs: 'a0fa98ad', xsort: '22ec9486', r: '64e8a6a1'},
		'ka': {   m: '6961b7e4', v: '40feb44f', x: '765afcb4', xs: '460ae32f', xsort: '7a65b6b4', r: '778bc94a'},
		'ko': {   m: 'c758b027', v: 'd3b54047', x: '1235e26d', xs: '1d314216', xsort: '9c39494c', r: 'c81a1027'},
		'lt': {   m: 'c36fbafb', v: 'd5f9b95d', x: 'b0e8a3bc', xs: 'ca28b814', xsort: 'f26c6ff4', r: 'e58fc47e'},
		'mk': {   m: '78274f1b', v: '333aae58', x: 'b6020ec1', xs: '36e30ccb', xsort: 'f9e81474', r: ''},
		'ms': {   m: '3e26c6be', v: '9dadbc64', x: '15e6148f', xs: '421d606a', xsort: xsEN,       r: '411351e5'},
		'my': {   m: '939f2013', v: '43cc3aa3', x: 'a6571ec7', xs: 'bfc734fe', xsort: 'fbfb1d8c', r: ''},
		'nb-NO': {m: '1d496fea', v: '84ce54eb', x: 'e0d34e04', xs: '19e8e2a5', xsort: '88f55cfa', r: 'b32738cf'},
		'nl': {   m: 'e1d3b281', v: '326cbfd2', x: 'caef95fc', xs: '8a47ae1a', xsort: xsEN,       r: '2a725fb7'},
		'pl': {   m: '0bd88e98', v: '95ad4851', x: '2a45177d', xs: '4740c17a', xsort: '01902794', r: '2678c528'},
		'pt-BR': {m: '39835e93', v: 'de2c3569', x: '68f80c66', xs: 'e710618b', xsort: xsEN,       r: '21ee14c6'},
		'pt-PT': {m: '6ae9a13a', v: 'b21f3984', x: '0aa2a309', xs: '025ca23b', xsort: xsEN,       r: 'e6a7d6ff'},
		'ro': {   m: '3e321768', v: 'd72a350b', x: 'a9da3416', xs: '61b5e498', xsort: '2a01a4d8', r: '9b675c63'},
		'ru': {   m: '8e9b7945', v: '2391fbec', x: '26f663da', xs: '4445d36a', xsort: '7d747674', r: '0bf2516d'},
		'sq': {   m: '91943e67', v: 'e0259277', x: '4e0bbdcd', xs: '569be7bb', xsort: 'f45c6af8', r: 'a75d2c6f'},
		'sv-SE': {m: 'bc792ce2', v: 'd9d7828b', x: '4af3452f', xs: '701cd8c7', xsort: '1ca25322', r: '3ed80374'},
		'th': {   m: 'a32d70a7', v: '07358a87', x: '2a04071a', xs: '7e968207', xsort: 'a0bff3b4', r: '65ade427'},
		'tr': {   m: '4217ef80', v: '5048d312', x: '55daef93', xs: 'd8e92945', xsort: 'e9fda72a', r: 'd62d2c72'},
		'uk': {   m: '4bea2a13', v: '0163f51d', x: '4f817ea3', xs: 'e62ccf4f', xsort: 'ae65fe74', r: '2049852a'},
		'vi': {   m: 'bba6c980', v: 'b8137d59', x: '80da1efb', xs: '959b2e31', xsort: '2a01a4d8', r: 'ef6841d7'},
		'zh-Hans-CN': {m: '550ea53e', v: '0e58f82a', x: '536abb21', xs: '1feed45e', xsort: '42d5bac6', r: '135f1290'},
		'zh-Hant-TW': {m: '66b515a4', v: '8e4cfa0e', x: '9ad3338c', xs: '8aa6bfbf', xsort: '6d106412', r: '62cefab7'},
	}
	// mac: japanese languages are the same but the locale is 'ja-JP' not 'ja'
	if ('mac' == isOS) {
		languagesSupported['ja'].push('ja-JP')
		localesSupported['ja-JP'] = localesSupported.ja
		delete localesSupported['ja']
	}
	if (isMB) {
		// 22 of 38 supported
		let notSupported = [
			// lang
			'be','bg','ca','cs','el-GR','ga-IE','he','hu-HU','id','is','ka-GE','lt','mk-MK','ms','pt-PT','ro-RO','sq','uk-UA','vi-VN',
			// + locales
			'el','hu','ka','mk','ro','uk','vi',
		]
		notSupported.forEach(function(key){
			delete languagesSupported[key]
			delete localesSupported[key]
		})
	}
	return
}

function set_oIntlDate() {
	let d = oIntlDates
	oIntlDate = {
		date_timestyle : {
			"default": {
				'full_medium': [d.JanA, d.JanB, d.JulA, d.JulB, d.SepA, d.SepB],
				'medium_long': [d.JanA, d.JanB, d.JulA, d.JulB, d.NovA, d.NovB],
				'short_full': [d.SepA, d.SepB],
			},
			'ethiopic': {'full': [d.JanA], 'medium': [d.JanA]},
			'japanese': {'medium': [d.SepA, d.NovA]}, // NovA required for blink (147)
		},
	}
	// build keys
	for (const k of Object.keys(oIntlDate)) {
		oIntlDateKeys[k] = []
		for (const j of Object.keys(oIntlDate[k]).sort()) {oIntlDateKeys[k].push(j)}
	}
}

function set_oIntlDates() {
	/*

	intl.dates
	all dates (days/months/am-pm) must account for timezones
		- that way everyone covers the specific targets (e.g. am, friday, single digit day, etc)
		- timezone entropy is in the actual timezonename (we're confirming that here)
	we use UTC so we can check the original date hasn't been altered
		- which means we will nd up testing more dates to cover specific days
		- at this point AM/PM doesn't seem to be a factor
		- this makes the PoC's max entropy easier to verify
	timezones can be 14 hrs less or 12 hrs more but (IIUIC) our selected dates aren't hiting those instances
		where it exceeds ±12 (or I lucked out) and we end up only needing two identical times on subsequent days
	tests/PoCs need to cover all possible combos of locales x timezonenames because those
		are the TWO variables that I cannot control (oIntlLocale only have ONE variable: locale)
		and not all locales handle timezonenames to the same degree: e.g.
		- America/Los_Angles has 343 possible outcomes, Europe/Vatican has 344: this is because
		- pt-ao + pt-ch vary for the vatican but not for los angeles
	  - tl;dr: locale + timezonename PoCs cover a range

	intl.locale
	all dates (days/months/am-pm) must be timezone resistent: we are checking locale only
		- reported timezonename (and locale) is tested see oIntlDate section
		- thus we use UTC time so everyone uses the exact same dates, and then we pass
		UTC as the timezone so nothing shifts, preserving our specific datetimes
	the tests that expose day/time are datetimeformat's relatedYear + components + timezonename | and dayperiods
	*/

	oIntlDates = {
		//intl.dates
		JanA: new Date('2024-01-04T04:12:34.000Z'),
		JanB: new Date('2024-01-05T04:12:34.000Z'),
		JulA: new Date('2024-07-04T14:12:34.000Z'),
		JulB: new Date('2024-07-05T14:12:34.000Z'),
		SepA: new Date('2024-09-03T04:12:34.000Z'),
		SepB: new Date('2024-09-04T04:12:34.000Z'),
		NovA: new Date('2024-11-03T14:12:34.000Z'),
		NovB: new Date('2024-11-04T14:12:34.000Z'),
		//intl.locale
		// fractionalSecondDigits: we only ever reveal the seconds
		FSD: new Date('2023-06-10T01:12:34.567Z'),
		// month (x4) + year (xJan): we only ever reveal the month or year
		Jan: new Date('2023-01-15T00:00:00.000Z'),
		Jun: new Date('2023-06-15T00:00:00.000Z'),
		Sep: new Date('2023-09-15T00:00:00.000Z'),
		Nov: new Date('2023-11-15T00:00:00.000Z'),
		// days (x2) + hrs (xFri) + era: expose day/hr
		Wed: new Date('2023-01-18T01:00:00.000Z'), // doubles as hour 1
		Fri: new Date('2023-01-20T13:00:00.000Z'), // doubles as hour 13
		Era: new Date('-000002-01-15T01:00:00.000Z'),
		// relatedyear exposes day
		RY1: new Date('-000002-01-15T01:00:00.000Z'),
		RY2: new Date('2023-01-15T00:00:00.000Z'),
		// timezonename exposes day but we pass the timezone itself so it's relative (i.e stable per timezone)
		TZN1: new Date('2019-08-15T00:00:00.000Z'),
		// dayperiod: exposes hr
		DP8: new Date('2019-01-30T08:00:00Z'),
		DP12: new Date('2019-01-30T12:00:00Z'),
		DP15: new Date('2019-01-30T15:00:00Z'),
		DP18: new Date('2019-01-30T18:00:00Z'),
		DP22: new Date('2019-01-30T22:00:00Z'),
	}
}

function set_oIntlLocale() {
	let d = oIntlDates
	let tzLG = {'longGeneric': [d.TZN1]}, tzSG = {'shortGeneric': [d.TZN1]}
	let unitN = {'narrow': [1]}, unitL = {'long': [1]}, unitB = {'long': [1], 'narrow': [1]}
	let curAN = {"accounting": [-1000], "name": [-1]},
		curN = {"name": [-1]},
		curS = {"symbol": [1000]}

	oIntlLocale = {
		collation: {
			search: ['\u0107','\u0109','\u1ED9','\u00F6'],
			sort: [
				'A','a','aa','ch','ez','kz','ng','ph','ts','tt','y','\u00E2','\u00E4','\u00E7\a','\u00EB','\u00ED','\u00EE','\u00F0',
				'\u00F1','\u00F6','\u0107','\u0109','\u0137\a','\u0144','\u0149','\u01FB','\u025B','\u03B1','\u040E','\u0439','\u0453',
				'\u0457','\u04F0','\u0503','\u0561','\u05EA','\u0627','\u0649','\u06C6','\u06C7','\u06CC','\u06FD','\u0934','\u0935',
				'\u09A4','\u09CE','\u0A85','\u0B05','\u0B85','\u0C05','\u0C85','\u0D85','\u0E24','\u0E9A','\u10350','\u10D0','\u1208',
				'\u1780','\u1820','\u1D95','\u1DD9','\u1ED9','\u1EE3','\u311A','\u3147','\u4E2D','\uA647','\uFB4A'
			]
		},
		// DTF
		'datetimeformat.components': {
			era: {
				// we need to control the date part so toLocaleString matches
				'long': [{era: 'long', year: 'numeric', month: 'numeric', day: 'numeric'}, [d.Era]]
			},
			fractionalSecondDigits: {
				'1': [{minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1}, [d.FSD]]
			},
			hour: {
				'numeric': [{hour: 'numeric'}, [d.Wed]],
			},
			hourCycle: {
				'h11-2-digit': [{hour: '2-digit', hourCycle: 'h11'}, [d.Wed]]
			},
			month: {
				'narrow': [{month: 'narrow'}, [d.Nov] ],
				'short': [{month: 'short'}, [d.Jan, d.Jun, d.Sep, d.Nov]],
			},
			weekday: {
				'long': [{weekday: 'long'}, [d.Wed, d.Fri]],
				'narrow': [{weekday: 'narrow'}, [d.Wed, d.Fri]],
				'short': [{weekday: 'short'}, [d.Fri]],
			},
			year: {
				'2-digit': [{year: "2-digit"}, [d.Jan]]
			},
		},
		'datetimeformat.dayperiod': {
			'long': [d.DP8, d.DP22],
			'narrow': [d.DP8, d.DP15],
			'short': [d.DP12, d.DP15, d.DP18]
		},
		'datetimeformat.listformat': {
			'narrow': ['conjunction','disjunction','unit'],
			'short': ['unit'],
			'long': ['conjunction','unit']
		},
		'datetimeformat.relatedyear': {
			// these are all long
			buddhist: [d.RY1],
			chinese: [d.RY1],
			coptic: [d.RY2],
			'default': [d.RY1],
			gregory: [d.RY1],
			hebrew: [d.RY1],
			indian: [d.RY1],
			'islamic-tbla': [d.RY1],
			japanese: [d.RY1, d.RY2],
			roc: [d.RY1],
		},
		'datetimeformat.timezonename': {
			'Africa/Douala': tzLG,
			'America/Montevideo': tzSG,
			'America/Winnipeg': tzLG,
			'Asia/Hong_Kong': tzSG,
			'Asia/Seoul': tzLG,
			'Europe/London': tzSG,
			'Asia/Muscat': tzSG,
		},
		// DN
		displaynames: {
			calendar: {
				'short': ['chinese','dangi','ethiopic','gregory','islamic-tbla','islamic-umalqura','japanese','roc'],
			},
			currency: {'long': ['JPY','NIO','SEK','SZL','TZS','XAF']},
			datetimefield: {
				'narrow': ['day','dayPeriod','weekOfYear','weekday'],
				'short': ['era','month','second','timeZoneName'],
			},
			language: {'dialect': ['bn-in','en','fr-ch','gu','kl','sr-ba','zh-hk']},
			region: {'narrow': ['CM','FR','TL','US','VC','VI','ZZ']},
			script: {
				// blink is case sensitive
				'short': ['Arab','Beng','Cyrl','Deva','Guru','Hans','Hrkt','Latn','Mong','Mymr','Orya','Zxxx','Zzzz'],
			},
 		},
		// DF
		durationformat: {
			'digital': {'a': {'milliseconds': 1}},
			'long': {'a': {'years': 1, 'microseconds': 1}, 'b': {'seconds': 2}},
			'narrow': {'a': {'years': 1, 'months': 2, 'seconds': 1, 'microseconds': 1000}},
			'short': {'a': {'days': 2, 'seconds': 2, 'nanoseconds': 1}},
		},
		// NF
		'numberformat.compact': {'long': [0/0, 1000, 2e6, 6.6e12, 7e15],'short': [-1100000000, -1000],},
		'numberformat.currency': {"KES": curS, 'ETB': curN, "GBP": curS, "USD": curAN, "XXX": curN},
		'numberformat.formattoparts': {
			'decimal': [1.2],'group': [1000, 99999],'infinity': [Infinity],'minusSign': [-5],'nan': ['a']
		},
		'numberformat.notation': {
			scientific: {'decimal': []},
			standard: {'decimal': [0/0, -1000, 987654], 'percent': [1000]},
		},
		'numberformat.sign': {always: [-1, 0/0]},
		'numberformat.unit': {
			'byte': unitN, // ICU 74
			'fahrenheit': unitB,
			'foot': unitL,
			'hectare': {'long': [1], 'short': [987654]},
			'kilometer-per-hour': unitN,
			'millimeter': unitN,
			'month': unitB,
			'nanosecond': unitN,
			'percent': {"long": [1], "narrow": [1], "short": [987654]},
			'second': {'long': [1], 'narrow': [1], 'short': [987654]},
			'terabyte': unitL,
		},
		// PR
		'pluralrules.select': {
			cardinal: [0, 1, 2, 3, 7, 21, 100],
			ordinal: [1, 2, 3, 4, 5, 6, 8, 10, 81]
		},
		'pluralrules.selectrange': {
			cardinal: [[0,0],[1,1],[2,1],[2,4]],
			ordinal: [[0,0],[0,1],[0,6],[1,1],[1,3],[1,5],[3,3]],
		},
		// other
		relativetimeformat: {
			always: {'narrow': [[1, 'day'], [0, 'year']]},
			auto: {
				'long': [[1, 'second']],
				'narrow': [[0,'second'],[1,'second'],[3,'second'],[0,'day'],[1,'day'], [3,'day'],[1,'week'],[0,'quarter'],[1,'year']]
			},
		},
		resolvedoptions: {
			collator: ['caseFirst'],
			datetimeformat: ['calendar','day','hourcycle','month','numberingSystem'],
			pluralrules: ['pluralCategories'],
		},
	}
	try {oIntlLocale['numberformat.compact']['long'].push(BigInt('987354000000000000'))} catch {}
	let nBig = 987654
	try {nBig = BigInt('987354000000000000')} catch {}
	oIntlLocale['numberformat.notation']['scientific']['decimal'].push(nBig)
	// build keys
	for (const k of Object.keys(oIntlLocale)) {
		oIntlLocaleKeys[k] = []
		for (const j of Object.keys(oIntlLocale[k]).sort()) {oIntlLocaleKeys[k].push(j)}
	}
}

function get_geo(METRIC) {
	// nav/window are redundant: display only
	let res = [], value, notation = default_red, isLies = false
	// nav
	try {
		let keys = Object.keys(Object.getOwnPropertyDescriptors(Navigator.prototype))
		if (runSL) {
			keys = keys.filter(x => !['geolocation'].includes(x))
			keys.push('geolocation')
		}
		value = keys.includes(METRIC) ? zE : zD
		// this only detects enabled as untrustworthy
		if (keys.indexOf(METRIC) > keys.indexOf('constructor')) {
			log_known(4, METRIC +'_navigator', value)
			isLies = true
		}
	} catch(e) {
		log_error(4, METRIC +'_navigator', e); value = zErr
	}
	addDisplay(4, METRIC +'_navigator', value,'','', isLies) // display separate for notating lies
	res.push(isLies? zLIE : value)
	// window
	try {
		value = 'Geolocation' in window ? true : false
		if (value == true) {
			let typeCheck = typeFn(window.Geolocation)
			if (runST) {typeCheck = 'string'}
			if ('function' !== typeCheck) {throw zErrType + typeCheck}
		}
	} catch(e) {
		log_error(4, METRIC +'_window', e); value = zErr
	}
	res.push(value)
	// summary
	let hash = mini(res)
	if (isBB && hash == 'feacff5d') {
		notation = default_green // BB ESR78+: disabled, true
	} else if (!isBB && hash == '23d43ed0') {
		notation = default_green // FF72+: enabled, true
	}
	// health lookup
	if (gRun) {sDetail[isScope].lookup[METRIC] = res.join(' | ')}
	addDisplay(4, METRIC, res[1],'', notation)
	return
}

function get_language_locale() {
	// reset
	isLocaleValid = false
	isLocaleValue = undefined
	isLocaleAlt = undefined
	isLanguagesNav = []

	// LANGUAGES
	function get_langmetric(m) {
		try {
			let value = navigator[m]
			let expected = ('language' == m ? 'string' : 'array')
			if (runST) {value = ('language' == m ? null : [])}
			let typeCheck = typeFn(value)
			if (expected !== typeCheck) {throw zErrType + typeCheck}
			if ('languages' == m) {
				value.forEach(function(l){
					isLanguagesNav.push(l.toLowerCase())
				})
			}
			return ('language' == m ? value : value.join(', '))
		} catch(e) {
			return [e]
		}
	}
	let oData = {}, metrics = ['language','languages'], notation =''
	metrics.forEach(function(m) {oData[m] = get_langmetric(m)})
	Object.keys(oData).forEach(function(METRIC){
		if (isLanguageSmart && isBB) { // only notate BB
			notation = bb_red
			if (languagesSupported[oData.language] !== undefined) {
				if ('language' == METRIC) {notation = bb_green
				} else {if (oData[METRIC] == oData.language +', '+ languagesSupported[oData.language][0]) {notation = bb_green}
				}
			}
		}
		let value = oData[METRIC], data =''
		if ('array' == typeFn(value)) {value = value[0]; data = zErrLog}
		addBoth(4, METRIC, value,'', notation, data, isProxyLie('Navigator.'+ METRIC))
	})

	// LOCALES
	function get_locmetric(m) {
		let METRIC = 'locale_'+ m, r
		try {
			if ('collator' == m) {if (runSL) {r = 'en-FAKE'} else {r = Intl.Collator().resolvedOptions().locale}
			} else if ('datetimeformat' == m) {r = Intl.DateTimeFormat().resolvedOptions().locale
			} else if ('displaynames' == m) {r = new Intl.DisplayNames(undefined, {type: 'region'}).resolvedOptions().locale
			} else if ('durationformat' == m) {r = new Intl.DurationFormat().resolvedOptions().locale
			} else if ('listformat' == m) {r = new Intl.ListFormat().resolvedOptions().locale
			} else if ('numberformat' == m) {r = new Intl.NumberFormat().resolvedOptions().locale
			} else if ('pluralrules' == m) {r = new Intl.PluralRules().resolvedOptions().locale
			} else if ('relativetimeformat' == m) {r = new Intl.RelativeTimeFormat().resolvedOptions().locale
			} else if ('segmenter' == m) {r = new Intl.Segmenter().resolvedOptions().locale
			}
			if (runST) {r = undefined} else if (runSI) {r = 'collator' !== m ? 'en-USA' : 'tzp'}
			let typeCheck = typeFn(r)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (!Intl.DateTimeFormat.supportedLocalesOf([r]).length) {throw zErrInvalid + 'locale '+ r +' not supported'}
			oRes[m] = r
			return r
		} catch(e) {
			oRes[m] = e+''
			log_error(4, METRIC, e)
			oErr[m] = e+''
			return zErr
		}
	}
	// LOCALES
	let METRIC = 'locale', value ='', res = [], oRes = {}, oErr = {}
	metrics = [
		'collator','datetimeformat','displaynames','durationformat','listformat',
		'numberformat','pluralrules','relativetimeformat','segmenter',
	]
	metrics.forEach(function(m) {res.push(get_locmetric(m))})
	sDetail[isScope][METRIC] = oRes
	let btn = addButton(4, METRIC)

	// LOCALE
	// remove errors + dupes
	res = res.filter(x => ![zErr].includes(x))
	res = dedupeArray(res)
	let isLies = false
	if (res.length == 1) {
		value = res[0]
		isLocaleValue = value
		// reduce en health false positives
		// but only for isBB since as it only ships with en-US
			// use isLocaleAlt in validation checks: allow e.g. en-CA to use en-US for lookup
			// ^ we already have a health check for wrong locale
		isLocaleAlt = (isBB && 'en-' == isLocaleValue.slice(0,3) ? 'en-US' : isLocaleValue)
		if (isSmart) {isLocaleValid = true} // only set if smart
	} else if (res.length == 0) {
		value = zErr
	} else {
		value = 'mixed'; isLies = true
	}
	if (isLanguageSmart && isBB) { // only notate BB
		notation = bb_red
		let errHash = mini(oErr)
		if (Object.keys(oErr).length == 0) {
			// BB15: no errors
			// only green if BB supported
			let key = oData.language
			if (languagesSupported[key] !== undefined) {
				let expected = languagesSupported[key][1] == undefined ? key : languagesSupported[key][1]
				if (value === expected) {notation = bb_green}
			}
		}
	}
	addDisplay(4, METRIC, value, btn, notation, isLies)
	addData(4, METRIC, value, '', isLies)
	return
}

function get_language_system(METRIC) {
	/* systemLanguages: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/systemLanguage
	populate svg with nav entries to detect if anything added. To detect removals would mean
	populating with all supported BCPs (lots) = not worth it: perf and it is unlikely _only_ removal
	happens, i.e we already detect added. Also prior to FF127 = false positives with prefixs e.g. if
	you were 'en-US, en', all en-* would be be true. Not worth the footgun or hasssle
	*/
	let t0 = nowFn()
	let value, data =''
	try {
		isLanguagesNav.sort() // so results are sorted
		// populate
		let aText = ['<switch id="switch">']
		isLanguagesNav.forEach(function(l){aText.push('<text systemLanguage="'+ l +'">' + l +'</text>')})
		aText.push('<text systemLanguage="groot">groot</text>')
		aText.push('<text>unknown</text></switch>')
		let el = dom.tzpSwitch
		el.innerHTML = aText.join('')
		// walk nodes
		let aDetected = []
		const walker = document.createTreeWalker(dom['switch'], NodeFilter.SHOW_TEXT, null);
		while(walker.nextNode() && walker.currentNode) {
			let target = walker.currentNode
			//* important: we check range.getClientRects DOMRectList length so only real nav items are detected
				// we use range due to selectNode (I think)
				// we can't use range.getBoundingClientRect's DOMRect object (can't get obj keys length)
				// THIS IS THE WAY: range.getClientRects()
			// e.g. if isLanguagesNav has a fake 'fr' (e.g. extension) it won't be detected as it
				// isn't a "rendered" node with a range (cuz it's fake) - IIUIC
			let range = new Range()
			range.selectNode(target)
			if (range.getClientRects().length) {aDetected.push(target.textContent)}
		}
		// remove unknown
		aDetected = aDetected.filter(x => !['unknown'].includes(x))
		if (0 == aDetected.length) {throw zErrType + 'empty array'}
		value = aDetected.join(', ')
	} catch(e) {
		value = e; data = zErrLog
	}
	// tidy nav string to compare to
	isLanguagesNav = isLanguagesNav.join(', ')
	addBoth(4, METRIC, value,'', (value == isLanguagesNav ? lang_green : lang_red), data)
	log_perf(4, METRIC, t0)
}

function get_dates_intl() {
	function get_metric(m, isIntl) {
		let tsub0 = nowFn(), countC = 0
		try {
			let obj = {}, objcheck = {}, tests = oIntlDate[m], testkeys = oIntlDateKeys[m], value
			let formatter, checker
			if ('date_timestyle' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}; objcheck[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let data = [], datacheck = []
						let styles = s.split('_'), cal = 'default' == key ? undefined : key
						if (1 == styles.length) {styles.push(styles[0])} // ensure we have two styles
						// test
						let options = {dateStyle: styles[0], timeStyle: styles[1], timeZone: tzTest}
						if ('default' !== key) {options['calendar'] = key}
						formatter = Intl.DateTimeFormat(locTest, options); countC++
						// check
						if (isCheck) {
							options = {calendar: cal, dateStyle: styles[0], timeStyle: styles[1], timeZone: tzCheck}
							checker = Intl.DateTimeFormat(locCheck, options); countC++
						}
						tests[key][s].forEach(function(n) {
							value = formatter.format(n); data.push(value)
							if (isCheck) {value = checker.format(n); datacheck.push(value)}
						})
						obj[key][s] = data; objcheck[key][s] = datacheck
					})
				}
			}
			// microperf
			add_microperf_intl('datetimeformat.'+ m, countC, tsub0, isIntl)
			// return
			return [
				{'hash': mini(obj), 'metrics': obj},
				(isCheck ? {'hash': mini(objcheck), 'metrics': objcheck} : undefined)
			]
		} catch(e) {
			add_microperf_intl('datetimeformat.'+ m, countC, tsub0, isIntl)
			log_error(4, METRIC +'_'+ m, e)
			return [zErr, zErr]
		}
	}

	const oMetrics = {
		intl : ['date_timestyle',],
		'to-string': [],
	}
	let METRIC, oStringExpected = {}, isCheck = isLocaleValid && isTimeZoneValid
	let locTest = undefined, locCheck = isLocaleValue // use variables so I can test them
	let tzTest = undefined, tzCheck = isTimeZoneValue // use variables so I can test them

	Object.keys(oMetrics).forEach(function(list){
		METRIC = 'dates_'+ list
		let t0 = nowFn(), isIntl = 'intl' == list, notation = localetz_red
		let oData = {}, oCheck = {} // data from each intl/string loop

		oMetrics[list].forEach(function(m) {
			let res = get_metric(m, isIntl) 
			oData[m] = res[0]
			oCheck[m] = res[1]
			let isString = (isIntl && oMetrics['to-string'].includes(m))
			if (isString) {oStringExpected[m] = res[0]} // intl version of to*string to compare to
			// console.log(list, res); console.log('test', oData); console.log('check', oCheck); console.log('expected string', oStringExpected)
		})
		let hash = mini(oData)
		// on string loop (we have an empty tostring list hence the extra check)
		if (!isIntl && oMetrics[list].length) {
			// does the undefined string data match the undefined intl data
			addDisplay(4, METRIC +'_matches_intl','','', (hash == mini(oStringExpected) ? intl_green : intl_red))
		}
		if (isCheck) {
			if (hash == mini(oCheck)) {
				notation = localetz_green
			} else {
				addDetail(METRIC +'_expected', oCheck)
				notation = addButton('bad', METRIC +'_expected', "<span class='health'>"+ cross +"</span> locale + timezone")
			}
		}
		if (oMetrics[list].length) { // temp check until we start building string tests
			addBoth(4, METRIC, hash, addButton(4, METRIC), notation, oData)
			log_perf(4, METRIC, t0)
		}
		if (!isIntl) {return}
	})
}

function get_locale_intl() {
	function get_metric(m, isIntl) {
		let tsub0 = nowFn(), countC = 0
		try {
			let obj = {}, objcheck = {}, tests = oIntlLocale[m], testkeys = oIntlLocaleKeys[m], value
			let formatter, checker

			if ('collation' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let testdata = tests[key].sort() // always resort
					// trim leading/trailing spacesto help LTR/RTL
					obj[key] = testdata.sort(Intl.Collator(locTest, {usage: key}).compare).join(' , ').trim(); countC++
					if (isCheck) {objcheck[key] = testdata.sort(Intl.Collator(locCheck, {usage: key}).compare).join(' , ').trim(); countC++}
				}
			} else if ('datetimeformat.components' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}; objcheck[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let option = tests[key][s][0]
						// our dates are specifically UTC to get specific days/hrs
						// to preserve that we pass UTC as the timeZone
						option['timeZone'] = 'UTC'
						let data = [], datacheck = []
						if (isIntl) {
							formatter = new Intl.DateTimeFormat(locTest, option); countC++
							if (isCheck) {checker = new Intl.DateTimeFormat(locCheck, option); countC++}
						}
						tests[key][s][1].forEach(function(n){
							value = (isIntl ? formatter.format(n) : (n).toLocaleString(strTest, option)); data.push(value)
							if (isCheck) {value = (isIntl ? checker.format(n) : (n).toLocaleString(strCheck, option)); datacheck.push(value)}
						})
						obj[key][s] = data; objcheck[key][s] = datacheck
					})
				}
			} else if ('datetimeformat.dayperiod' == m) {
				// our dates are specifically UTC to get specific times
				// to preserve that we pass UTC as the timeZone
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = [], datacheck = []
					formatter = new Intl.DateTimeFormat(locTest, {hourCycle: 'h12', timeZone: 'UTC', dayPeriod: key}); countC++
					if (isCheck) {checker = new Intl.DateTimeFormat(locCheck, {hourCycle: 'h12', timeZone: 'UTC', dayPeriod: key}); countC++}
					tests[key].forEach(function(item) {
						data.push(formatter.format(item))
						if (isCheck) {datacheck.push(checker.format(item))}
					})
					obj[key] = data; objcheck[key] = datacheck
				}
			} else if ('datetimeformat.listformat' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = [], datacheck = []
					tests[key].forEach(function(item) {
						data.push(new Intl.ListFormat(locTest, {style: key, type: item}).format(['a','b','c'])); countC++
						if (isCheck) {datacheck.push(new Intl.ListFormat(locCheck, {style: key, type: item}).format(['a','b','c'])); countC++}
					})
					obj[key] = data; objcheck[key] = datacheck
				}
			} else if ('datetimeformat.relatedyear' == m) {
				// our dates are specifically UTC as we expose the day and
				// to preserve that we pass UTC as the timeZone
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let cal = 'default' == key ? undefined : key
					let data = [], datacheck = []
					if (isIntl) {
						formatter = Intl.DateTimeFormat(locTest, {calendar: cal, relatedYear: 'long', timeZone: 'UTC'}); countC++
						if (isCheck) {checker = Intl.DateTimeFormat(locCheck, {calendar: cal, relatedYear: 'long', timeZone: 'UTC'}); countC++}
					}
					tests[key].forEach(function(d) {
						let stroptions = {calendar: cal, day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC'}
						value = (isIntl ? formatter.format(d) : (d).toLocaleString(strTest, stroptions)); data.push(value)
						if (isCheck) {value = (isIntl ? checker.format(d) : (d).toLocaleString(strCheck, stroptions)); datacheck.push(value)}
					})
					obj[key] = data; objcheck[key] = datacheck
				}
			} else if ('datetimeformat.timezonename' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = [], datacheck = []
					Object.keys(tests[key]).forEach(function(tzn){
						try {
							// use y+m+d numeric so toLocaleString matches
							// use hour12 in case - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
							// key: e.g. Africa/Douala | tzn: e.g. longGeneric
							let option = {year: 'numeric', month: 'numeric', day: 'numeric', hour12: true, timeZone: key, timeZoneName: tzn}
							if (isIntl) {
								formatter = Intl.DateTimeFormat(locTest, option); countC++
								if (isCheck) {checker = Intl.DateTimeFormat(locCheck, option); countC++}
							}
							tests[key][tzn].forEach(function(dte){
								value = (isIntl ? formatter.format(dte) : (dte).toLocaleString(strTest, option)); data.push(value)
								if(isCheck) {value = (isIntl ? checker.format(dte) : (dte).toLocaleString(strCheck, option)); datacheck.push(value)}
							})
						} catch {} // ignore invalid
						if (data.length) {obj[key] = data}
						if (datacheck.length) {objcheck[key] = datacheck}
					})
				}
				if (!Object.keys(obj).length) {let trap = Intl.DateTimeFormat(locTest, {timeZoneName: 'longGeneric'})} // trap error
			} else if ('displaynames' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}; objcheck[key] = {}
					Object.keys(tests[key]).forEach(function(s) { // for each style
						let optkey = 'datetimefield' == key ? 'dateTimeField' : key // fix key case
						let options = {type: optkey, style: s}
						if ('language' == key) {options = {type: key, languageDisplay: s}}
						let data = {}, datacheck = {}
						// displaynames takes an empty array for undefined, but allow oour override for testing
						let locIntl = undefined == locTest ? [] : locTest
						formatter = new Intl.DisplayNames(locIntl, options); countC++
						if (isCheck) {checker = new Intl.DisplayNames(locCheck, options); countC++}
						tests[key][s].forEach(function(item) {
							data[item] = formatter.of(item)
							if (isCheck) {datacheck[item] = checker.of(item)}
						})
						obj[key][s] = data; objcheck[key][s] = datacheck
					})
				}
			} else if ('durationformat' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let yearformat = ('long' == key || 'short' == key) ? 'always' : 'auto' // long we want to force 0 for years
					formatter = new Intl.DurationFormat(locTest, {style: key, yearsDisplay: yearformat}); countC++
					if (isCheck) {checker = new Intl.DurationFormat(locCheck, {style: key, yearsDisplay: yearformat}); countC++}
					let data = [], datacheck = []
					for (const item of Object.keys(tests[key])) {
						data.push(formatter.format(tests[key][item]))
						if (isCheck) {datacheck.push(checker.format(tests[key][item]))}
					}
					obj[key] = data.join(' | '); objcheck[key] = datacheck.join(' | ')
				}
			} else if ('numberformat.compact' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let option = {notation: 'compact', compactDisplay: key, useGrouping: true}
					let data = [], datacheck = []
					if (isIntl) {
						formatter = new Intl.NumberFormat(locTest, option); countC++
						if (isCheck) {checker = new Intl.NumberFormat(locCheck, option); countC++}
					}
					tests[key].forEach(function(n) {
						value = (isIntl ? formatter.format(n) : (n).toLocaleString(strTest, option)); data.push(value)
						if (isCheck) {value = (isIntl ? checker.format(n) : (n).toLocaleString(strCheck, option)); datacheck.push(value)}
					})
					obj[key] = data; objcheck[key] = datacheck
				}
			} else if ('numberformat.currency' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}; objcheck[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let option = 'accounting' == s ? {style: 'currency', currency: key, currencySign: s} : {style: 'currency', currency: key, currencyDisplay: s}
						let data = [], datacheck = []
						tests[key][s].forEach(function(n) {
							value = (isIntl ? Intl.NumberFormat(locTest, option).format(n) : (n).toLocaleString(strTest, option))
							data.push(value); countC++
							if (isCheck) {
								value = (isIntl ? Intl.NumberFormat(locCheck, option).format(n) : (n).toLocaleString(strCheck, option))
								datacheck.push(value); countC++
							}
						})
						obj[key][s] = data; objcheck[key][s] = datacheck
					})
				}
			} else if ('numberformat.formattoparts' == m) {
				function get_value(type, aParts) {
					for (let i=0; i < aParts.length; i++) {
						if (aParts[i].type === type) {str = aParts[i].value; return (str.length == 1 ? str.charCodeAt(0) : str)}
					}
					return 'none'
				}
				formatter = Intl.NumberFormat(locTest); countC++
				if (isCheck) {checker = Intl.NumberFormat(locCheck); countC++}
				let str
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = [], datacheck = []
					tests[key].forEach(function(num){
						data.push(get_value(key, formatter.formatToParts(num)))
						if (isCheck) {datacheck.push(get_value(key, checker.formatToParts(num)))}
					})
					obj[key] = data; objcheck[key] = datacheck
				}
			} else if ('numberformat.notation' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}; objcheck[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let data = [], datacheck = []
						if (isIntl) {
							formatter = Intl.NumberFormat(locTest, {notation: key, style: s}); countC++
							if (isCheck) {checker = Intl.NumberFormat(locCheck, {notation: key, style: s}); countC++}
						}
						tests[key][s].forEach(function(n){
							value = (isIntl ? formatter.format(n) : (n).toLocaleString(strTest, {notation: key, style: s})); data.push(value)
							if (isCheck) {value = (isIntl ? checker.format(n) : (n).toLocaleString(strCheck, {notation: key, style: s})); datacheck.push(value)}
						})
						obj[key][s] = data; objcheck[key][s] = datacheck
					})
				}
			} else if ('numberformat.sign' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = [], datacheck = []
					if (isIntl) {
						formatter = new Intl.NumberFormat(locTest, {signDisplay: key}); countC++
						if (isCheck) {checker = new Intl.NumberFormat(locCheck, {signDisplay: key}); countC++}
					}
					tests[key].forEach(function(n){
						value = (isIntl ? formatter.format(n) : (n).toLocaleString(strTest, {signDisplay: key})); data.push(value)
						if (isCheck) {value = (isIntl ? checker.format(n) : (n).toLocaleString(strCheck, {signDisplay: key})); datacheck.push(value)}
					})
					obj[key] = data; objcheck[key] = datacheck
				}
			} else if ('numberformat.unit' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = [], datacheck = []
					Object.keys(tests[key]).forEach(function(ud){
						try {
							if (isIntl) {
								formatter = Intl.NumberFormat(locTest, {style: 'unit', unit: key, unitDisplay: ud}); countC++
								if (isCheck) {checker = Intl.NumberFormat(locCheck, {style: 'unit', unit: key, unitDisplay: ud}); countC++}
							}
							tests[key][ud].forEach(function(n){
								value = (isIntl ? formatter.format(n) : (n).toLocaleString(strTest, {style: 'unit', unit: key, unitDisplay: ud}))
								data.push(value)
								if (isCheck) {
									value = (isIntl ? checker.format(n) :	(n).toLocaleString(strCheck, {style: 'unit', unit: key, unitDisplay: ud}))
									datacheck.push(value)
								}
							})
						} catch {} // ignore invalid
					})
					if (data.length) {obj[key] = data}
					if (datacheck.length) {objcheck[key] = datacheck}
				}
				if (!Object.keys(obj).length) {let trap = Intl.NumberFormat(locTest, {style: 'unit', unit: 'day'})} // trap error
			} else if ('pluralrules.select' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = [], datacheck = []
					formatter = new Intl.PluralRules(locTest, {type: key}); countC++
					if (isCheck) {checker = new Intl.PluralRules(locCheck, {type: key}); countC++}
					let prev='', current='', prevchk='', currentchk=''
					tests[key].forEach(function(n) {
						current = formatter.select(n); if (prev !== current) {data.push(n +': '+ current); prev = current}
						if (isCheck) {
							currentchk = checker.select(n); if (prevchk !== currentchk) {datacheck.push(n +': '+ currentchk); prevchk = currentchk}
						}
					})
					obj[key] = data; objcheck[key] = datacheck
				}
			} else if ('pluralrules.selectrange' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = {}, datacheck = {}
					formatter = new Intl.PluralRules(locTest, {type: key}); countC++
					if (isCheck) {checker = new Intl.PluralRules(locCheck, {type: key}); countC++}
					let prev='', current='', prevchk='', currentchk=''
					tests[key].forEach(function(n) {
						current = formatter.selectRange(n[0], n[1])
						if (prev !== current) {
							let datakey =  formatter.select(n[0]) +'-'+ formatter.select(n[1])
							if (undefined == data[datakey]) {data[datakey] = current}
							prev = current
						}
						if (isCheck) {
							currentchk = checker.selectRange(n[0], n[1])
							if (prevchk !== currentchk) {
								let checkkey =  checker.select(n[0]) +'-'+ checker.select(n[1])
								if (undefined == datacheck[checkkey]) {datacheck[checkkey] = currentchk}
								prevchk = currentchk
							}
						}
					})
					// sort obj keys
					let newdata = {}, newdatacheck = {}
					for (const k of Object.keys(data).sort()) {newdata[k] = data[k]}
					for (const k of Object.keys(datacheck).sort()) {newdatacheck[k] = datacheck[k]}
					obj[key] = newdata; objcheck[key] = newdatacheck
				}
			} else if ('relativetimeformat' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}; objcheck[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let data = [], datacheck = []
						formatter = new Intl.RelativeTimeFormat(locTest, {style: s, numeric: key}); countC++
						if (isCheck) {checker = new Intl.RelativeTimeFormat(locCheck, {style: s, numeric: key}); countC++}
						tests[key][s].forEach(function(pair){
							data.push(formatter.format(pair[0], pair[1]))
							if (isCheck) {datacheck.push(checker.format(pair[0], pair[1]))}
						})
						obj[key][s] = data; objcheck[key][s] = datacheck
					})
				}
			} else if ('resolvedoptions' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					if ('collator' == key) {formatter = Intl.Collator(locTest).resolvedOptions(); countC++
					} else if ('datetimeformat' == key) {formatter = Intl.DateTimeFormat(locTest).resolvedOptions(); countC++
					} else if ('pluralrules' == key) {formatter = new Intl.PluralRules(locTest).resolvedOptions(); countC++
					}
					if (isCheck) {
						if ('collator' == key) {checker = Intl.Collator(locCheck).resolvedOptions(); countC++
						} else if ('datetimeformat' == key) {checker = Intl.DateTimeFormat(locCheck).resolvedOptions(); countC++
						} else if ('pluralrules' == key) {checker = new Intl.PluralRules(locCheck).resolvedOptions(); countC++
						}
					}
					obj[key] = {}; objcheck[key] = {}
					tests[key].forEach(function(s){
						if ('hourcycle' == s) {value = Intl.DateTimeFormat(locTest, {hour: 'numeric'}).resolvedOptions().hourCycle; countC++
						} else if ('pluralCategories' == s) {value = formatter[s].join(', ')
						} else {value = formatter[s]}
						obj[key][s] = value

						if (isCheck) {
							if ('hourcycle' == s) {value = Intl.DateTimeFormat(locCheck, {hour: 'numeric'}).resolvedOptions().hourCycle; countC++
							} else if ('pluralCategories' == s) {value = checker[s].join(', ')
							} else {value = checker[s]}
							objcheck[key][s] = value
						}
					})
				}
			}
			// microperf
			add_microperf_intl(m, countC, tsub0, isIntl)
			// return
			return [
				//{'hash': mini(obj), 'metrics': obj},
				//(isCheck ? {'hash': mini(objcheck), 'metrics': objcheck} : undefined)
				obj, (isCheck ? objcheck : undefined)
			]
		} catch(e) {
			add_microperf_intl(m, countC, tsub0, isIntl)
			log_error(4, METRIC +'_'+ m.replace('.','_'), e)
			return [zErr, zErr]
		}
	}

	const oMetrics = {
		intl : [
			'collation',
			'datetimeformat.components','datetimeformat.dayperiod','datetimeformat.listformat',
				'datetimeformat.relatedyear','datetimeformat.timezonename',
			'displaynames','durationformat',
			'numberformat.compact','numberformat.currency','numberformat.formattoparts',
				'numberformat.notation','numberformat.sign','numberformat.unit',
			'pluralrules.select','pluralrules.selectrange','relativetimeformat','resolvedoptions',
		],
		tolocalestring: [
			'datetimeformat.components','datetimeformat.relatedyear','datetimeformat.timezonename',
			'numberformat.compact','numberformat.currency','numberformat.notation','numberformat.sign','numberformat.unit',
		],
	}
	let METRIC, isCheck = isLocaleValid
	let oStringExpected = {}, oStringExpectedChildren = {}
	let locTest = undefined, locCheck = isLocaleValue // use variables so I can test them
	let strTest = undefined, strCheck = isLocaleValue
	//locTest = 'de'; locCheck = 'de' // should be the same
	//locTest = 'it'; locCheck = 'ko' // everything should be different

	//strTest = 'fr', strCheck = 'fr' // should be the same
	//strTest = 'pl', strCheck = 'es' // everything should be different

	Object.keys(oMetrics).forEach(function(list){
		METRIC = 'locale_'+ list
		let t0 = nowFn(), isIntl = 'intl' == list, notation = locale_red
		let oData = {}, oCheck = {} // data from each intl/string loop
		let oDataChildren = {}, oCheckChildren = {}

		oMetrics[list].forEach(function(m) {
			let res = get_metric(m, isIntl)
			let isParent = m.includes('.')
			let isString = (isIntl && oMetrics['tolocalestring'].includes(m))			
			if (isParent) {
				let parent = m.split('.')[0], child = m.split('.')[1]
				// placeholders (so sorted order is kelp)
				oData[parent] = {}
				oCheck[parent] = {}

				// children
				if (undefined == oDataChildren[parent]) {oDataChildren[parent] = {}}
					oDataChildren[parent][child] = res[0]
				if (undefined == oCheckChildren[parent]) {oCheckChildren[parent] = {}}
					oCheckChildren[parent][child] = res[1]
				if (isString) {
					oStringExpected[parent] = {}
					if (undefined == oStringExpectedChildren[parent]) {oStringExpectedChildren[parent] = {}}
					oStringExpectedChildren[parent][child] = res[0]
				}
			} else {
				// direct: don't hash zErr
				oData[m] = zErr == res[0] ? zErr : {'hash': mini(res[0]), 'metrics': res[0]}
				oCheck[m] = zErr == res[1] ? zErr: {'hash': mini(res[1]), 'metrics': res[1]}
				if (isString) {
					oStringExpected[m] = zErr == res[0] ? zErr : {'hash': mini(res[0]), 'metrics': res[0]}
				}
			}
		})
		// update placeholders
		for (const k of Object.keys(oDataChildren)) {
			oData[k] = {'hash': mini(oDataChildren[k]), 'metrics': oDataChildren[k]}
			oCheck[k] = {'hash': mini(oCheckChildren[k]), 'metrics': oCheckChildren[k]}
		}
		let hash = mini(oData)

		// update expected string placeholder on the intl loop
		if (isIntl) {
			for (const k of Object.keys(oStringExpectedChildren)) {
				oStringExpected[k] = {'hash': mini(oStringExpectedChildren[k]), 'metrics': oStringExpectedChildren[k]}
			}
		} else {
			// on string loop compare it
			// does the undefined string data match the undefined intl data
			addDisplay(4, METRIC +'_matches_intl','','', (hash == mini(oStringExpected) ? intl_green : intl_red))
		}
		if (isCheck) {
			if (hash == mini(oCheck)) {
				notation = locale_green
			} else {
				addDetail(METRIC +'_expected', oCheck)
				notation = addButton('bad', METRIC +'_expected', "<span class='health'>"+ cross +"</span> locale")
			}
		}
		addBoth(4, METRIC, hash, addButton(4, METRIC), notation, oData)
		log_perf(4, METRIC, t0)
		if (!isIntl) {return}
	})
}

function get_timezone(METRIC) {
	// reset
	isTimeZoneValid = false
	isTimeZoneValue = undefined

	let tzo = get_timezone_offset(METRIC +'_offset')
	let offsets = get_timezone_offsets(METRIC +'_offsets', tzo.nowValue, tzo.utcValue)

	// timezone: we can use tzo.tampered items to return if isLies
	let aMethods = ['timeZone','timeZoneId','zonedDateTimeISO']
	let aTemporal = ['plainDateISO','plainDateTimeISO','plainTimeISO','zonedDateTimeISO']
	let errCount = 0, lieCount = 0, tzData = {'data': [], 'valid': []}, notation = rfp_red, isLies = false
	aMethods.forEach(function(k) {
		let tz
		isLies = false
		try {
			if ('timeZone' == k) {
				tz = Intl.DateTimeFormat().resolvedOptions().timeZone
				if (tzo.tampered.includes('timeZone')) {isLies = true}
				//tz = 'Asia/Tokyo' // test mixed but no lies detected
			} else {
				if (tzo.tampered.filter(x => aTemporal.includes(x)).length) {isLies = true}
				if ('timeZoneId' == k) {
					tz = Temporal.Now.timeZoneId()
				} else {
					tz = Temporal.Now.zonedDateTimeISO().toString()
					tz = tz.slice(tz.indexOf('[') + 1, tz.length - 1)
				}
			}
			if (runST) {tz = undefined} else if (runSI) {tz = 'tzp'}
			let typeCheck = typeFn(tz)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			let tztest = (new Date('January 1, 2018 13:00:00 UTC')).toLocaleString('en', {timeZone: tz})
			tzData.data.push(tz)
			if (isLies) {lieCount++; log_known(4, METRIC +'_'+ k, tz)} else {tzData.valid.push(tz)}
			addDisplay(4, METRIC +'_'+ k, tz, '','', isLies)
		} catch(e) {
			errCount++
			addDisplay(4, METRIC +'_'+ k, log_error(4, METRIC +'_'+ k, e))
		}
	})
	// all errors
	if (errCount == aMethods.length) {addBoth(4, METRIC, zErr +'s', '', notation, zErr); return}

	// notation: 3 x truthful Atlantic/Reykjavik, and whilst we already have health checks
	// on offsets(s) but we need to confirm the actual results
	if ('80724dcd' == mini(tzData) && 0 === tzo.nowValue && '031b56a9' == offsets.hash) {notation = rfp_green}

	// summary
		// if we have a single valid value, use that
		// if valid is mixed then data is also mixed
		// if valid is empty then we have to use data anyway
		// data will always have at least one value (we returned earlier if all errors)
	let value = '', aValid = dedupeArray(tzData.valid), aData = dedupeArray(tzData.data)
	let isMixed = aData.length > 1, isValid = 1 == aValid.length 
	isLies = !isValid
	if (1 == aValid.length) {value = aValid[0]} else {if (isMixed) {value = 'mixed'} else {value = aData[0]}}
	// isTimeZoneValue
	if ('mixed' !== value)	{isTimeZoneValue = value}
	// health lookup
	if (notation == rfp_red && 'Atlantic/Reykjavik' == value) {
		// then we must have had lies and/or errors
		let aHealth = []
		if (errCount > 0) {aHealth.push(errCount + ' error' + (errCount == 1 ? '' : 's'))}
		if (lieCount > 0) {aHealth.push(lieCount + ' mismatch' + (lieCount == 1 ? '' : 'es'))}
		if (gRun) {sDetail[isScope].lookup[METRIC] = aHealth.join(' | ')}
	}
	// display
	addBoth(4, METRIC, value, '', notation, '', isLies)	

	// set isTimeZoneValid
		// offset: no tampering ignore errors | offsets : no tampering or errors (I might need to revisit this logic later)
		// ^ this means anything date/temporal or to*string hasn't been tampered with
		// timezone: can't be any lies and can't be mixed
	let isTZValidSoFar = 0 == tzo.tampered.length && true === offsets.health
	if (isTZValidSoFar) {
		if (0 == lieCount && 1 == aValid.length) {isTimeZoneValid = true}
	}
	return
}

function get_timezone_offset(METRIC) {
	// this is good test to catch + record various temporal/date/toString lies even
		// if they are ultimately duplicitous. This requires the spoofed offset to differ
		// from lastModified and real-time real-world world offsets only number 65-70
		// IIUIC. So not definitive, but multiple exposure of tampering is good. also,
		// fuck extensions trying to resist or solutions that create mismatches :)
	let t0 = nowFn()
	// setup
	const xslText = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"'
			+' xmlns:date="http://exslt.org/dates-and-times" extension-element-prefixes="date"><xsl:output method="html"/>'
			+' <xsl:template match="/"><xsl:value-of select="date:date-time()" /></xsl:template></xsl:stylesheet>'
	const	doc = (new DOMParser).parseFromString(xslText, 'text/xml')
	let oData = {}, notation = tz_red
	let methods = [
		'timeZone', // intl.DTF
		'iframe','parseFromString','parseHTMLUnsafe', // last modified, also exslt
		'plainDateISO','plainDateTimeISO','zonedDateTimeISO','plainTimeISO', // temporal
		// to*string
		'toDateString','toLocaleString','toLocaleDateString',
		'toLocaleTimeString','toString','toTimeString',
		//'date',
	]
	// non-gecko: skip exslt
		// 1990759: ToDo: add isXSLT + isVer when the pref flips: dom.xslt.enabled
	if (isGecko) {methods.push('exslt')} else {addDisplay(4, METRIC +'_exslt', zNA)}
	methods.sort()
	let aLastMods = ['exslt','iframe','parseFromString','parseHTMLUnsafe'] // is lastModified source
	let testdate
	let tznShort = {
		AKST: '-09:00', AKDT: '-08:00',
		AST: '-04:00', ADT: '-03:00',
		CST: '-06:00', CDT: '-05:00',
		EST: '-05:00', EDT: '-04:00',
		HAST: '-10:00', HADT: '-09:00',
		HST: '-10:00', HDT: '-09:00',
		MST: '-07:00', MDT: '-06:00',
		PST: '-08:00', PDT: '-07:00',
		UTC: '+00:00', GMT: '+00:00', GMT0: '+00:00',
	}

	function create_offset() {
		// if we don't have a minutekey but we do have a non-exslt lastmod, we can
		// check timezones and compare/calulate to determine a minutekey/offset
		let key = oData.hasLastMod[0]
		if (undefined == key) {return}
		let aTZs = [
			// these are timezones, not short timezonenames
			'GMT','GMT+1','GMT+2','GMT+3','GMT+4','GMT+5','GMT+6','GMT+7','GMT+8','GMT+9','GMT+10','GMT+11','GMT+12',
			'GMT-1','GMT-2','GMT-3','GMT-4','GMT-5','GMT-6','GMT-7','GMT-8','GMT-9','GMT-10','GMT-11','GMT-12','GMT-13','GMT-14',
		]
		let option = {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour12: false, hour: '2-digit', minute: 'numeric', second: 'numeric',
			timeZoneName: 'short'
		}
		// note: testdate was already set in get_values so it's identical here
		// note: aTZs covers the hardcoded values in tznShort
			// note: this only covers full hours if an exact match: we will use 10's of minutes accuracy
			// to reduce chances of a digit having ticked over
			// lastMods iframe/parse* raw format's datetime components matches formatter
		let exactmatch = oData.raw[key].slice(0,15),
			hourmatch = oData.raw[key].slice(0,13)
		let isPartial = false, offset, value
		for (let i = 0; i < aTZs.length; i++) {
			try {
				option.timeZone = 'Etc/'+ aTZs[i]
				let formatter = new Intl.DateTimeFormat('en', option)
				value = formatter.format(testdate).replace(',','')
				offset = value.split(' ')[2]
				if (value.slice(0,13) == hourmatch) {
					if (value.slice(0,15) == exactmatch) {
						//console.log(value.slice(0,15), 'exact match', offset)
						// exact match
						oData.minutekey = key
						oData.offset[key] = offset
						break
					} else {
						//console.log(value.slice(0,15), 'hour match', offset)
						// hour match
						// this works because we use the extremes of +12/-14 which means we cover all
						// possible day + hour combos (partials would be inside those extremes), so one
						// of them must match: we just need to add or subtract from it
						isPartial = true
						break
					}
				}
			} catch(e) {
				console.log(e+'')
			}
		}
		if (isPartial) {
			// calculate minute diff in 15's, ignore seconds
			if ('UTC' == offset) {offset = 'GMT+0'}
			let sign = offset.slice(3,4)
			let offsetHrs = offset.slice(4,offset.length) * 1
			let expectedMins = oData.raw[key].slice(14,16) * 1
			let partialMins = value.slice(14,16) * 1
			let diff = Math.round((expectedMins - partialMins) / 15) * 15
			let newoffset
			/*
			console.log(oData.raw[key], key)
			console.log(value)
			console.log(sign, offsetHrs, expectedMins, partialMins, diff)
			//*/
			if ('+' == sign) {
				if (diff < 0) {
					newoffset = 'GMT' + sign + ((offsetHrs - 1)+'').padStart(2, '0') +':' + (60 + diff)
				} else {
					newoffset = 'GMT' + sign + (offsetHrs+'').padStart(2, '0') +':' + diff
				}
			} else {
				// negative sign we only have ±30 diffs. The code below _should_ handle ±15/±45
				if (diff < 0) {
					newoffset = 'GMT' + sign + (offsetHrs+'').padStart(2, '0') +':' + Math.abs(diff)
				} else {
					newoffset = 'GMT' + sign + ((offsetHrs - 1)+'').padStart(2, '0') +':' + (60 - diff)
				}
			}
			if (undefined !== newoffset) {
				oData.minutekey = key
				oData.offset[key] = newoffset
			}
		}
		return
	}

	function format_offset(str) {
		if (!str.includes('GMT')) {return str}
		// format en short timezonename into ±xx:xx format
		str = str.slice(3)
		let sign = str.slice(0,1), time = str.slice(1)
		/* toString example GMT1300 */
		/* other examples ['GMT+9:30','GMT+12','GMT-1','GMT+0']	*/
		if (!time.includes(':') && 4 == time.length) {
			time = time.slice(0,2)+':'+time.slice(2)
		}
		let parts = time.split(':')
		let hrs = parts[0].padStart(2,'0')
		let mins = (undefined == parts[1] ? '00' : parts[1])
		return sign + hrs +':'+ mins
	}

	function get_minutes(str) {
		if (undefined !== str) {
			if (undefined !== tznShort[str]) {
				str = tznShort[str]
			} else if (str.includes('GMT')) {
				str = format_offset(str)
			}
			let minutes = ((str.slice(1,3) * 1)*60) + (str.slice(4,6)*1)
			let sign = (str[0] == '+' ? (minutes == 0 ? '': '-') : '')
			minutes = minutes * ('-' == sign ? -1 : 1)
			return [minutes, (str == '+00:00' ? '' : '['+ str +']')]
		} else {
			return ''
		}
	}

	function get_month(src) {
		let oMonths = {
			Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', 
			Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12', 
		}
		let month = oMonths[src]
		return (undefined == month ? 'xx' : month)
	}

	function get_values(runNo) {
		// short timeZoneName exposes a GMT string in ~75% of timezones
			// which allows us more truthy offsets to fall back to
		oData = {'_runNo': runNo, 'errors' : {}, 'format': {}, 'offset': {}, 'tampered': [], 'raw': {}} // reset
		let option = {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour12: false, hour: '2-digit', minute: 'numeric', second: 'numeric',
			timeZoneName: 'short', timeZone: undefined,
		}
		let formatter = new Intl.DateTimeFormat('en', option) // changing option does not affect our formatter

		let id = 'iframelastmod'
		testdate = new Date()
		// get values
		methods.forEach(function(k){
			let value
			try {
		// DTF
				if ('timeZone' == k) {
					value = formatter.format(testdate).replace(',','')
		// last modified
				} else if ('exslt' == k) {
					let xsltProcessor = new XSLTProcessor
					xsltProcessor.importStylesheet(doc) // fragment sticky datetime is set here
					let fragment = xsltProcessor.transformToFragment(doc, document) // toFragment is faster than toDocument
					value = fragment.childNodes[0].nodeValue
				} else if ('iframe' == k) {
					let el = document.createElement('iframe')
					el.setAttribute('id', id)
					document.body.appendChild(el)
					let target = el.contentDocument
					value = target.lastModified // contentWindow.document
				} else if ('parseFromString' == k) {
					value = (new DOMParser).parseFromString('','text/html').lastModified
				} else if ('parseHTMLUnsafe' == k) {
					value = Document.parseHTMLUnsafe('').lastModified
		// temporal
				} else if ('plainDateISO' == k) {
					value = Temporal.Now.plainDateISO().toString()
				} else if ('plainDateTimeISO' == k) {
					value = Temporal.Now.plainDateTimeISO().toString()
				} else if ('plainTimeISO' == k) {
					value = Temporal.Now.plainTimeISO().toString()
					value = value.slice(0,8)
				} else if ('zonedDateTimeISO' == k) {
					value = Temporal.Now.zonedDateTimeISO().toString()
		// to*string standalone
				} else if ('toLocaleDateString' == k) {
					option.timeZone = undefined
					value = testdate.toLocaleDateString('en', option).replace(',','')
				} else if ('toLocaleString' == k) {
					option.timeZone = undefined
					value = testdate.toLocaleString('en', option).replace(',','')
				} else if ('toLocaleTimeString' == k) {
					value = testdate.toLocaleTimeString('en', option).replace(',','')
				} else if ('toTimeString' == k) {
					let parts = testdate.toTimeString().split(' ')
					value = parts[0] +' '+ parts[1]
		// no formatting
				} else if ('toDateString' == k) {
					// https://searchfox.org/firefox-main/source/js/src/tests/test262/built-ins/Date/prototype/toDateString/format.js
					// dateRegExp = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-9]{2} [0-9]{4}$/
					// gecko format: e.g. "Fri Mar 20 2026" | blink seems to be the same, tested a few locales+timezone mixes
					let parts = testdate.toDateString().split(' ')
					value = get_month(parts[1]) +'/'+ parts[2] +'/'+ parts[3]
				} else if ('toString' == k) {
					// note: contents of the string from toString() are implementation-dependent
						// using formatter (DTF) defeats the purpose of the test
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toString
					// "it joins the string representation specified in toDateString() and toTimeString()"
					let parts = testdate.toString().replace(',','').split(' ')
					value = get_month(parts[1]) +'/'+ parts[2] +'/'+ parts[3] +' '+ parts[4]
					if (undefined !== parts[5]) {value += ' '+ parts[5]}
				}
				//if ('iframe' !== k) {foo++} // simulate only getting offset from a non-exslt lastMod
				// typecheck
				let typeCheck = typeFn(value)
				if ('string' !== typeCheck) {
					throw zErrType + typeCheck
				} else {
					/* test
					if (!aLastMods.includes(k)) {
						let index = value.indexOf(':')
						if (-1 !== index) {
							// shift minutes
							let mins = value.slice(index +1, index +3) * 1
							mins = mins + (mins < 30 ? 1 : -1) // we only need move 1 minute: always 2 digits
							value = value.slice(0, index +1) + mins + value.slice(index +3, value.length)
							// shift seconds
							let secs = value.slice(index +4, index +6) * 1
							let secShift = 11
							secs = secs + (secs < 30 ? secShift : secShift * -1) // always 2 digits
							secs = (secs+'').padStart(2,'0') // just in case
							value = value.slice(0, index +4) + secs + value.slice(index +6, value.length)
						}
					}
					//*/
					oData.raw[k] = value
				}
			} catch(e) {
				// the error differs if the console is open vs closed
				if ('parseHTMLUnsafe' == k) {
					if (e.name == 'NS_ERROR_UNEXPECTED') {e = 'Error: Permission denied to access property \"lastModified\"'}
				}
				oData.errors[k] = e+''
			}
		})
		removeElementFn(id)
		// partials (date or time only) need the missing corresponding part
		// we use lastModified items so if partials are legit they can match
		try {
			let partialkey, dateString, timeString
			for (let i=0; i < aLastMods.length; i++) {
				let key = aLastMods[i]; if (undefined !== oData.raw[key]) {partialkey = key; break}
			}
			if (undefined !== partialkey) {
				oData['partialkey'] = partialkey
				dateString = oData.raw[partialkey]
				if ('exslt' !== partialkey) {
					dateString = dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2')
				}
				timeString = dateString.slice(11,19)
				dateString = dateString.slice(0,10)
				let aPartial = ['toTimeString','plainTimeISO','toDateString','plainDateISO']
				aPartial.forEach(function(item) {
					// if undefined we must have had an error already
					if (undefined !== oData.raw[item]) {
						if (item.includes('Time')) {
							oData.raw[item] = dateString +' '+ oData.raw[item]
						} else {
							oData.raw[item] = oData.raw[item] +' '+ timeString
						}
					}
				})
			}
		} catch(e) {
			console.log(e)
		}
		// check validity and format
		for (const k of Object.keys(oData.raw)) {
			let formatted, src = oData.raw[k]
			if ('exslt' == k) {
				oData.offset[k] = src.slice(-6)
				formatted = src.slice(0,-10).replace('T',' ')
			} else if ('zonedDateTimeISO' == k || 'plainDateTimeISO' == k) {
				// we only want the first 19 chars
				formatted = src.slice(0,19).replace('T',' ')
				// remember offsets
				if ('zonedDateTimeISO' == k) {
					let end = src.indexOf('[')
					oData.offset[k] = src.slice(end - 6, end)
				}
			} else {
				formatted = src.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2')
				// leverage short timezonename
				let shortname = formatted.split(' ')[2]
				formatted = formatted.slice(0,19)
				if (undefined !== shortname) {
					if (shortname.includes('GMT') || undefined !== tznShort[shortname]) {oData.offset[k] = shortname}
				}
			}
			if (checkValidDate(k, formatted)) {oData.format[k] = formatted}
		}
	}

	function checkValidDate(method, value) {
		try {
			if (new Date(value) +'' == 'Invalid Date') {
				oData.errors[method] = 'Invalid Date: ' + value
				return false
			}
			return true
		} catch(e) {
			oData.errors[method] = e+''
			return false
		}
	}

	function checkMatch(runNo) {
		// set minutekey
			// if we have one at least one lastModified exslt/iframe/parseFromString/parseHTMLUnsafe
			// and we have an offset that matches, then we know the real value
		let minutekey, checkkey
		let oCheck = {hasLastMod: [], hasOffset: []}
		aLastMods.forEach(function(item){if (undefined !== oData.format[item]) {oCheck.hasLastMod.push(item)}})
		for (const k of Object.keys(oData.offset)) {oCheck.hasOffset.push(k)}
		for (const j of Object.keys(oCheck)) {
			oData[j] = []
			let lookup = 'hasLastMod' == j ? 'format' : 'offset'
			let array = oCheck[j]
			array.forEach(function(item){if (undefined !== oData[lookup][item]) {oData[j].push(item)}})
		}

		if (Object.keys(oData.hasLastMod).length && Object.keys(oData.hasOffset).length) {
			// last mods can't be tampered with
			if (oData.hasOffset.includes('exslt')) {
				minutekey = 'exslt' // if we have exslt offset we also have the format
			} else {
				let aOff = oData.hasOffset, aLast = oData.hasLastMod
				// loop valid items which have an offset
				for (let i = 0; i < aOff.length; i++) {
					if (undefined !== minutekey) {break}
					let offsetkey = aOff[i], got = oData.format[offsetkey]
					// loop valid lastModified items which should all be truthy
					for (let j = 0; j < aLast.length; j++) {
						let lastkey = aLast[j], expected = oData.format[lastkey]
						if (expected == got) {minutekey = offsetkey; break}
					}
				}
			}
		}

		// are they all the same
		let aTmp = []
		for (const k of Object.keys(oData.format)) {aTmp.push(oData.format[k])}
		aTmp = dedupeArray(aTmp)
		if (undefined !== minutekey) {
			oData['minutekey'] = minutekey
			checkkey = minutekey
		}
		if (aTmp.length == 1) {return true}
		if (undefined == checkkey) {
			// just because we don't have a minutekey, doesn't mean we can't compare to a lastmodifed
			checkkey = oCheck.hasLastMod[0]
		}
		if (undefined == checkkey) {return aTmp.length == 1}
		oData['checkkey'] = checkkey

		// here is where we catch the tampering
			// some diffs + we have a checkkey which we consider truthy
			// compare the rest to checkkey (which we treat as truthy)
			// get checkkey parts
		let mValue = oData.format[checkkey],
			mParts = mValue.split(' '),
			mDate = mParts[0],
			mTime = mParts[1].split(':')
		for (const k of Object.keys(oData.format)) {
			let isDiff = false // reset each check, assume false
			if (k !== checkkey) { // exempt checkkey
				try {
					let kValue = oData.format[k],
						kParts = kValue.split(' '),
						kDate = kParts[0],
						kTime = kParts[1].split(':')
					// compare k to m(inutekey)
					if (kValue == mValue) {
						// perfect match
					} else if (kDate !== mDate) {
						// different date
						isDiff = true // this covers toDateString and plainDateISO
						//if (isFile && 2 == runNo) {console.log('date changed', k, kDate)}
					} else {
						// time diff only
						let tmpDiff = {
							h: (kTime[0] * 1) - (mTime[0] * 1),
							min: (kTime[1] * 1) - (mTime[1] * 1),
							s: (kTime[2] * 1) - (mTime[2] * 1),
						}
						// allow 10 seconds: jank, also leap seconds
						// abs !important to cover being ahead or behind
						let secondsDiff = Math.abs((tmpDiff.h * 3600) + (tmpDiff.min * 60) + tmpDiff.s)
						if (secondsDiff > 10) {
							isDiff = true
							//if (isFile && 2 == runNo) {console.log('secondsDiff', secondsDiff, k)}
						}
					}
					if (isDiff) {oData.tampered.push(k)} //METRIC +'_'+ k)}
				} catch(e) {
					console.log(e+'')
				}
			}
		}
		return 0 == oData.tampered.length
	}

	function display_values() {
		// all valid dates are in format, everything else is in errors
		for (const k of Object.keys(oData.format)) {
			let n = METRIC +'_'+ k, isLies = false, extra = ''
			let value = oData.format[k]
			// style + record lies
			if (oData.tampered.includes(k)) {
				isLies = true
				let tmpvalue = value
				// tidy up partial
				if ('toTimeString' == k || 'plainTimeISO' == k) {tmpvalue = tmpvalue.slice(-8)
				} else if ('toDateString' == k || 'plainDateISO' == k) {tmpvalue = tmpvalue.slice(0,10)
				}
				log_known(4, n, tmpvalue)
			}
			// tidy up partial
			if ('toTimeString' == k || 'plainTimeISO' == k) {
				value = value.slice(-8)
				dom[k +'spaces'] = ' '.repeat(10)
			} else if ('toDateString' == k || 'plainDateISO' == k) {value = value.slice(0,10)}
			// add extra display info
			let offsetStr = oData.offset[k]
			if (undefined !== offsetStr & 'string' == typeof offsetStr) {extra = ' '+ offsetStr}
			value += extra
			addDisplay(4, n, value,'','', isLies)
		}
		for (const k of Object.keys(oData.errors)) {
			addDisplay(4, METRIC +'_'+ k, log_error(4, METRIC +'_'+ k, oData.errors[k]))
		}
	}

	// run, try to get isMatch
	get_values(1)
	let isMatch = checkMatch(1)
	if (!isMatch) {
		// ~0.5 ms to grab our mods: 1 in 86,400 seconds tick over a day
		// so we'd have to be really unlucky to hit this: try again
		get_values(2)
		isMatch = checkMatch(2)
	}
	oData['isMatch'] = isMatch
	display_values()
	if (undefined == oData.minutekey) {create_offset()} // after display so we don't add offsets to a lastmod

	let finalvalue, finaldisplay, utcValue
	let errCount = Object.keys(oData.errors).length
	let tamperCount = oData.tampered.length
	if (undefined !== oData.minutekey) {
		let finaldata = get_minutes(oData.offset[oData.minutekey])
		finalvalue = finaldata[0]
		finaldisplay = finaldata.join(' ')
		utcValue = oData.format[oData.minutekey]

		if (0 == tamperCount && 0 == errCount) {
			// no lies + no errors
			notation = tz_green
		} else if (gRun) {
			// health lookup
			let aHealth = []
			if (errCount > 0) {aHealth.push(errCount + ' error' + (errCount == 1 ? '' : 's'))}
			if (tamperCount > 0) {aHealth.push(tamperCount + ' mismatch' + (tamperCount == 1 ? '' : 'es'))}
			if (gRun) {sDetail[isScope].lookup[METRIC] = aHealth.join(' | ')}
		}
		addDisplay(4, METRIC, finaldisplay,'', notation)
		addData(4, METRIC, finalvalue)
	} else {
		// all errors
		if (methods.length == errCount) {
			addBoth(4, METRIC, zErr +'s','', notation, zErr)
		} else {
			// 4 scenarios with isMatch/isTamper
				// if no checkkey then we never compared and isMatch is default false
			let isTamper = tamperCount > 0
			finalvalue = (isMatch || undefined == oData.checkkey) ? 'unknown' : 'mixed'
			addBoth(4, METRIC, finalvalue,'', notation,'', isTamper)
		}
	}
	//if (isFile) {console.log('timezone offset\n', oData)}
	log_perf(4, METRIC, t0)
	return {'nowValue': finalvalue, 'utcValue': utcValue, 'tampered': oData.tampered}
}

function get_timezone_offsets(METRIC, nowValue, utcValue) {
	let t0 = nowFn(), notation = tz_red
	let years = [1879, 1952, 1976, 2025]
	let days = {
		// to make sure we don't change years or months when a day or two ticks over
		// use the 15th - this makes get* and getUTC* PoCs possible
		'January 15': {numbers: [1,15], str :'01-15'},
		'July 15': {numbers: [7,15], str: '07-15'}
	}
	let aMethods = [
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_components_and_time_zones
		'components','components_utc','date','date.parse','date.valueOf','getTime',
		'getTimezoneOffset','offsetNanoseconds','timeZoneName','Symbol.toPrimitive',
	]
	let oMultiplier = {
		// year + month: our test dates are middle of the month: legit components will never differ
		// fake values that differ we don't need to be precise (because they're garbage) so no nee to
		// computer variable days in years and months, we can just use constants 365 + 31
		'1': 60000 * 60 * 24 * 365, // year
		'2': 60000 * 60 * 24 * 31, // month
		'3': 60000 * 60 * 24, // day
		'4': 60000 * 60, // hour
		'5': 60000, // minute
		'6': 1000, // second
		'7': 1, // ms
	}
	let tznShort = {
		// hardcoded
		AKST: 540, AKDT: 480,
		AST: 240, ADT: 180,
		CST: 360, CDT: 300,
		EST: 300, EDT: 240,
		HAST: 600, HADT: 540,
		HST: 600, HDT: 540,
		MST: 420, MDT: 360,
		PST: 480, PDT: 420,
		UTC: 0, GMT: 0, 'GMT+0': 0,
	}
	let oList = {}
	years.forEach(function(year) {oList[year] = days})	
	// if we know the real current offset (nowValue) we can add a silent non-collected
	// now datetime and compare it's value to nowValue to determine if tampered
	if ('number' == typeFn(nowValue)) {oList['now'] = {'now': ''}}
	let oData = {'calc': {}, 'display': {}, 'errors': {}, 'hashes': {'all': {}, 'valid': {}},
		'lies': {}, 'math': {'1.utc': {}, '2.timezone': {}}, 'now': {}, 'numbers': {}, 'utc': {}
	}
	aMethods.forEach(function(method) {
		oData.calc[method] = {}
		years.forEach(function(year) {oData.calc[method][year] = []})
	})
	let tznOption = {
		day: '2-digit', month: '2-digit', year: 'numeric',
		hour12: false, hour: '2-digit', minute: 'numeric', second: 'numeric',
		timeZoneName: 'short',
	}
	let oExpected = {
		'1879-01-15': {'components': '1879 0 15', 'other': -2870420400000},
		'1879-07-15': {'components': '1879 6 15', 'other': -2854782000000},
		'1952-01-15': {'components': '1952 0 15', 'other': -566823600000},
		'1952-07-15': {'components': '1952 6 15', 'other': -551098800000},
		'1976-01-15': {'components': '1976 0 15', 'other': 190558800000},
		'1976-07-15': {'components': '1976 6 15', 'other': 206283600000},
		'2025-01-15': {'components': '2025 0 15', 'other': 1736946000000},
		'2025-07-15': {'components': '2025 6 15', 'other': 1752584400000},
	}

	try {
		let formatter = new Intl.DateTimeFormat('en', tznOption)
		for (const year of Object.keys(oList)) {
			let isNow = 'now' == year
			Object.keys(oList[year]).forEach(function(day) {
				let isFirst = (year == years[0] && day == 'January 15')
				let test, control, key
				if (!isNow) {
					let datetime = day +', '+ year +' 13:00:00'
					control = new Date(datetime +' UTC')
					test = new Date(datetime)
					key = year +'-'+ days[day].str
					oData.math['1.utc'][key] = {};  oData.math['2.timezone'][key] = {}; 
				} else {
					// if we have a nowValue, we had a minutekey and a formatted string
					test = new Date(utcValue)
					control = new Date(utcValue +' UTC')
				}
				if (runSE) {foo++} else if (runST) {test = NaN}
				aMethods.forEach(function(method) {
					if (undefined == oData.errors[method]) {
						let offset, k = 60000, oDiffs, utc, time
						try {
							if ('getTimezoneOffset' == method) {
								offset = test.getTimezoneOffset()
								k = 1
							} else if ('timeZoneName' == method) {
								// it doesn't really matter what method we use since they're all exposed elsewhere
								let tznDate = formatter.format(test).replace(',','')
								time = tznDate.split(' ')[2]
								k = 1
								if (undefined !== tznShort[time]) {
									offset = tznShort[time]
								} else {
									if ('GMT' !== time.slice(0,3)) {throw zErrInvalid + time}
									// hrs, minutes, seconds
									let sign = time.includes('-') ? 1 : -1
									let value = time.replace('GMT','')
									value = value.replace('-','')
									value = value.replace('+','')
									let parts = value.split(':')
									offset = parts[0] * 60
									if (undefined !== parts[1]) { offset += parts[1] * 1} // minutes
									if (undefined !== parts[2]) { offset += (parts[2] * 1)/60} // seconds
									offset = offset * sign
								}
							} else {
								if ('date.parse' == method) {
									time = Date.parse(test); utc = Date.parse(control)
								} else if ('date.valueOf' == method) {
									time = test.valueOf(); utc = control.valueOf()
								} else if ('Symbol.toPrimitive' == method) {
									time = test[Symbol.toPrimitive]('number')
									utc = control[Symbol.toPrimitive]('number')
									offset = time - utc
								} else if ('getTime' == method) {
									time = test.getTime(); utc = control.getTime()
								} else if ('date' == method) {
									utc = control * 1; time = test * 1
								} else if ('offsetNanoseconds' == method) {
									// instant: YYYY-MM-DD T HH:mm:ss.sssssssss Z/±HH:mm [time_zone_id]
									// e.g. 1879-01-01T13:00Z
									let tzid = Temporal.Now.timeZoneId()
									let instantStr = isNow ? utcValue +'Z' : year +'-'+ days[day].str +'T13:00Z'
									let instant = Temporal.Instant.from(instantStr)
									time = instant.toZonedDateTimeISO(tzid).offsetNanoseconds
									// UTC is always zero so we could hard-code this
									// BUT it's nice to catch any fuckery caqused by extensions
									utc = instant.toZonedDateTimeISO('UTC').offsetNanoseconds
									offset = (utc - time) / 1e6
									//if (!isNow) (offset = offset * 2) // mixed but no lies
								} else if ('components' == method) {
									oDiffs = {
										'1': [test.getUTCFullYear(), control.getUTCFullYear()],
										'2': [test.getUTCMonth(), control.getUTCMonth()],
										'3': [test.getUTCDate(), control.getUTCDate()],
										'4': [test.getUTCHours(), control.getUTCHours()],
										'5': [test.getUTCMinutes(), control.getUTCMinutes()],
										'6': [test.getUTCSeconds(), control.getUTCSeconds()],
										'7': [test.getUTCMilliseconds(), control.getUTCMilliseconds()],
									}
									//if (isNow) {console.log(method, oDiffs)}
									let isMonthChange = oDiffs[2][0] !== oDiffs[2][1]
									offset = 0, utc = [], time = []
									for (const k of Object.keys(oDiffs)) {
										utc.push(oDiffs[k][1]) // control
										time.push(oDiffs[k][0]) // test
										if (isNow && isMonthChange) {
											// only 'now' can roll over months - all the others are hardcoded middle of the month
											// if the months differ, ignore years and months and adjust days
											// this assumes extensions aren't altering datetimes by whole months/years
												// in which case we would not detect a difference
											if ('1' !== k && '2' !== k) {
												if ('3' == k) {
													let dayA = oDiffs[k][0], dayB = oDiffs[k][1]
													if (dayA > dayB) {dayB += dayA} else {dayA += dayB}
													offset += (oMultiplier[k] * (dayA - dayB))
													//console.log('day', dayA, '('+oDiffs[k][0]+')', dayB, '('+oDiffs[k][1]+')', '|', dayA - dayB, '|', oMultiplier[k] * (dayA - dayB))
												} else {
													offset += (oMultiplier[k] * (oDiffs[k][0] - oDiffs[k][1]))
												}
											}
										} else {
											offset += (oMultiplier[k] * (oDiffs[k][0] - oDiffs[k][1]))
										}
									}
									utc = utc.join(' '); time = time.join(' ')
								} else if ('components_utc' == method) {
									oDiffs = {
										'1': [test.getFullYear(), control.getFullYear()],
										'2': [test.getMonth(), control.getMonth()],
										'3': [test.getDate(), control.getDate()],
										'4': [test.getHours(), control.getHours()],
										'5': [test.getMinutes(), control.getMinutes()],
										'6': [test.getSeconds(), control.getSeconds()],
										'7': [test.getMilliseconds(), control.getMilliseconds()],
									}
									//if (isNow) {console.log(method, oDiffs)}
									let isMonthChange = oDiffs[2][0] !== oDiffs[2][1]
									offset = 0, utc = [], time = []
									for (const k of Object.keys(oDiffs)) {
										// this is reversed: we subtract time from utc
										utc.push(oDiffs[k][0]) // reversed so we use test
										time.push(oDiffs[k][1]) // control
										if (isNow && isMonthChange) {
											if ('1' !== k && '2' !== k) {
												if ('3' == k) {
													let dayA = oDiffs[k][0], dayB = oDiffs[k][1]
													if (dayA > dayB) {dayB += dayA} else {dayA += dayB}
													offset += (oMultiplier[k] * (dayA - dayB))
													//console.log('day', dayA, '('+oDiffs[k][0]+')', dayB, '('+oDiffs[k][1]+')', '|', dayA - dayB, '|', oMultiplier[k] * (dayA - dayB))
												} else {
													offset += (oMultiplier[k] * (oDiffs[k][0] - oDiffs[k][1]))
												}
											}
										} else {
											offset += (oMultiplier[k] * (oDiffs[k][0] - oDiffs[k][1]))
										}
									}
									utc = utc.join(' '); time = time.join(' ')
								}
							}
							let isTZN = 'timeZoneName' == method
							if (undefined == offset) {offset = time - utc}
							if (isNow) {
								oData.now[method] = offset/k
							} else {
								if (undefined !== utc) {
									let expected, isUTCMatch = true, isPartial = false
									oData.math['1.utc'][key][method] = utc
									oData.math['2.timezone'][key][method] = time
									// check for utc tampering
									if ('1879' == year &&'date.parse' == method) {
										expected = oExpected[key].other
										// only old-timey years have partial minutes and only partial minutes are offset from expected
										if (Number.isInteger(offset/k)) {
											isUTCMatch = utc == expected
										} else {
											// can't match expected (0 diff) and diff within 60000
											isPartial = true
											let diff = Math.abs(expected - utc)
											isUTCMatch = diff < 60000 && diff !== 0
										}
									} else {
										if ('offsetNanoseconds' == method) {expected = 0
										} else if (method.includes('components')) {expected = oExpected[key].components +' 13 0 0 0'
										} else {expected = oExpected[key].other}
										if (undefined !== expected) {isUTCMatch = utc == expected}
									}
									// log tampering
									if (!isUTCMatch) {
										oData.lies[method] = ['utc']
										if (undefined == oData.utc[method]) {oData.utc[method] = {}}
										oData.utc[method][key] = ['expected'+ (isPartial ? ' ±60000' : ''), expected, 'got', utc]
									}
								}
								if (isTZN) {
									oData.math['2.timezone'][key][method] = time
								}
								if (isFirst) {
									let typeCheck = typeFn(offset)
									//console.log(method, typeCheck, offset)
									if ('number' !== typeCheck) {throw zErrType + typeCheck}
								}
								oData.calc[method][year].push(offset/k)
							}
						} catch(e) {
							oData.errors[method] = log_error(4, METRIC +'_'+ method, e)
							delete oData.calc[method]
							delete oData.lies[method]
							delete oData.utc[method]
						}
					}
				})
			})
		}
	} catch(e) {
		addBoth(4, METRIC, log_error(4, METRIC, e),'', notation, zErr)
		return {'health': false, 'hash': zErr}
	}
	// display errors
	for (const k of Object.keys(oData.errors)) {addDisplay(4, METRIC +'_'+ k, oData.errors[k])}
	// exit if all errors
	if (Object.keys(oData.errors).length == aMethods.length) {
		addBoth(4, METRIC, zErr +'s', '', notation, zErr)
		return {'health': false, 'hash': zErr}
	}

	for (const k of Object.keys(oData.calc)) {
		let tmpDisplay = []
		for (const y of Object.keys(oData.calc[k])) {
			oData.calc[k][y] = dedupeArray(oData.calc[k][y])
			tmpDisplay.push(oData.calc[k][y].join(', '))
		}
		// out of 339 unique results: 1 = 57 chars, 1 = 52 chars .. the rest are all 50 and under
		// will likely cause line overflow on android but it's cleaner to manage and visually see
		let str = ''
		if (isDesktop && undefined !== oData.now[k]) {str = s99 +' ('+ oData.now[k] +')'+ sc}
		oData.display[k] = tmpDisplay.join(' | ') + str
		if (undefined !== oData.now[k]) {
			if (oData.now[k] !== nowValue) {
				if (undefined == oData.lies[k]) {oData.lies[k] = []}
				oData.lies[k].push('now')
				log_known(4, METRIC +'_'+ k, tmpDisplay.join(' | '))
			}
		}
		addDisplay(4, METRIC +'_'+ k, oData.display[k], '','', undefined !== oData.lies[k])
		let hash = mini(oData.calc[k])
		if (undefined == oData.hashes.all[hash]) {oData.hashes.all[hash] = [k]} else {oData.hashes.all[hash].push(k)}
		if (undefined == oData.lies[k]) {
			if (undefined == oData.hashes.valid[hash]) {oData.hashes.valid[hash] = [k]} else {oData.hashes.valid[hash].push(k)}
		}
	}

	// summarize oData.math etc
	// add mismatches
	if (Object.keys(oData.utc).length) {
		oData.numbers['0.utc_tampered'] = {}
		for (const k of Object.keys(oData.utc).sort()) {
			oData.numbers['0.utc_tampered'][k] = oData.utc[k]
		}
	}
	for (const type of Object.keys(oData.math)) {
		// don't include any data from items that eventually errored
		let tmpobj = {}, newobj = {}
		for (const d of Object.keys(oData.math[type])) {
			newobj[d] = {}
			for (const k of Object.keys(oData.math[type][d])) {
				if (undefined == oData.errors[k]) {
					let itemdata = oData.math[type][d][k], itemhash = mini(itemdata) +' '
					if (undefined == newobj[d][itemhash]) {
						newobj[d][itemhash] = {'data': itemdata, 'group': [k]}
					} else {newobj[d][itemhash].group.push(k)}
				}
			}
		}
		for (const d of Object.keys(newobj)) {
			tmpobj[d] = {}
			for (const k of Object.keys(newobj[d])) {tmpobj[d][newobj[d][k].group.join(' ')] = newobj[d][k].data}
		}
		oData.numbers[type] = tmpobj
	}

	// OFFSETS math data
		// we only need to check for any utc methods: note: math data and lies + utc are only recorded for methods that didn't error
	let btnColor = 4
	if (isGecko) {btnColor = Object.keys(oData.utc).length ? 'bad' : 'good'}
	addDisplay(4, METRIC +'_data', addButton(btnColor, METRIC +'_data', 'data'))
	sDetail[isScope][METRIC +'_data'] = oData.numbers

	// health lookup
	let errCount = Object.keys(oData.errors).length
	let tamperCount = Object.keys(oData.lies).length
	if (gRun && errCount + tamperCount > 0) {
		let aHealth = []
		if (errCount > 0) {aHealth.push(errCount + ' error' + (errCount == 1 ? '' : 's'))}
		if (tamperCount > 0) {aHealth.push(tamperCount + ' mismatch' + (tamperCount == 1 ? '' : 'es'))}
		if (gRun) {sDetail[isScope].lookup[METRIC] = aHealth.join(' | ')}
	}

	// summarize
	let hash, data ='', btn ='', isLies = false
	let isMixed = Object.keys(oData.hashes.all).length > 1
	let isValid = Object.keys(oData.hashes.valid).length == 1
	if (isValid) {
		// we may have lies, but we also have a single valid (non-lie) hash
		for (const h of Object.keys(oData.hashes.valid)) { // there's only one hash
			let m = oData.hashes.valid[h][0] // get first method listed
			hash = h; data = oData.calc[m]
			btn = addButton(4, METRIC)
			// notation: no errors, no lies, i.e our single valid hash holds all methods
			if (oData.hashes.valid[h].length == aMethods.length) {notation = tz_green}
		}
	} else {
		// it may be feasible no lies detected but we have mixed results == clearly someone is lying
		isLies = tamperCount > 0 || isMixed
		if (isMixed) {
			hash = 'mixed'
		} else {
			for (const h of Object.keys(oData.hashes.all)) { // there's only one hash
				let m = oData.hashes.all[h][0] // get first method listed
				hash = h; data = oData.calc[m]
				btn = addButton(4, METRIC)
			}
		}
	}
	addBoth(4, METRIC, hash, btn, notation, data, isLies)

	//if (isFile) {console.log('timezone offsets\n', oData)}
	log_perf(4, METRIC, t0)
	// return health as true if no errors and no lies and only one valid hash for all methods
	return {'health': notation == tz_green, 'hash': hash}
}

/* l10n */

function get_l10n_css(METRIC) {
	if (!isGecko) {addBoth(4, METRIC, zNA); return}
	let hash, data = '', notation = '' //isLanguageSmart ? locale_red : ''
	try {

	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(4, METRIC, hash,'', notation)
	return
}

const get_l10n_media_messages = (METRIC) => new Promise(resolve => {
	if (!isGecko) {addBoth(4, METRIC, zNA); return resolve()}

	// https://searchfox.org/mozilla-central/source/dom/locales/en-US/chrome/layout/MediaDocument.properties
	let hash, btn='', data = {}, notation = isLanguageSmart ? locale_red : ''
	let aList = ['InvalidImage','ScaledImage']
	for (const k of aList) {
		let target = dom['tzp'+ k], title =''
		try {
			if ('ScaledImage' == k) {
				title = target.contentWindow.document.title
				title = title.replace(k +'.png', '') // strip image name to reduce noise
			} else {
				const image = target.contentWindow.document.querySelector('img')
				title = image.alt
				title = title.replace(target.src, '') // remove noise
			}
			data[k] = title.trim()
		} catch(err) {
			log_error(4, METRIC +'_'+ k, err)
			data[k] = zErr
		}
	}
	hash = mini(data); btn = addButton(4, METRIC)
	if (isLanguageSmart) {
		if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
			if (localesSupported[isLocaleAlt].m.includes(hash)) {notation = locale_green}
		}
	}
	addBoth(4, METRIC, hash, btn, notation, data)
	return resolve()
})

function get_l10n_parsererror_direction(METRIC) {
	//if (!isGecko) {addBoth(4, METRIC, zNA); return}
	// https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#error_handling
		// 1954813: 
		// 1666613: currently relies on chrome://global/locale/intl.css
	let value, data = '', notation = isLanguageSmart ? locale_red : ''
	try {
		if (isGecko && isVer > 146) {
			// 1666613: no need to touch the dom in gecko: 0.17ms
			let parser = (new DOMParser()).parseFromString('INVALID', 'text/xml')
			value = parser.firstChild.attributes[0].nodeValue
		} else {
			// 0.23ms
			let target = dom.tzpDirection
			target.innerHTML = '<parsererror></parsererror>'
			value = getComputedStyle(target.children[0]).direction
		}
		// check
		if (runST) {value = ''} else if (runSI) {value = 'upsidedown'}
		let typeCheck = typeFn(value)
		if ('string' !== typeCheck) {throw zErrType + typeCheck}
		let aGood = ['ltr','rtl']
		if (!aGood.includes(value)) {throw zErrInvalid +'expected '+ aGood.join(', ') +': got '+ value}
		// notation
			// since this is just BB (or FF en-US), we know only three locales are rtl: ar, fa, he
		if (isLanguageSmart && isLocaleValid) {
			let aRTL = ['ar','fa','he']
			let expected = aRTL.includes(isLocaleValue) ? 'rtl' : 'ltr'
			if (expected == value) {notation = locale_green}
		}
	} catch(e) {
		value = e; data = zErrLog
	}
	addBoth(4, METRIC, value,'', notation, data)
	return
}

const get_l10n_reporting_messages = (METRIC) => new Promise(resolve => {
	// https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API
	// dom.reporting.enabled

	// note: if/when the API is enabled, BB alpha can differ as deprecation warnings change
	// since we use isLanguageSmart (which can include non isBBESR), it's not worth coding
	// around that to remove false positives - we don't care about BB alpha health
	let t0 = nowFn()
	function exit(res) {
		try {observer.disconnect()} catch(e) {}
		if ('string' == typeFn(res)) {
			// undefined, n/a, errors
			hash = res
		} else {
			if (hasReporting) {
				data = isReporting
			} else {
				//console.log(res)
				// get up to x unique deprecated messages
				let max = 10
				let aSet = new Set()
				for (let i=0; i < res.length; i++) {
					let msg = res[i].body.message
					msg = msg.replace('https://developer.mozilla.org/docs/Web/API/Element/releasePointerCapture','').trim()
					aSet.add(msg)
					if (max == aSet.size) {break} // reruns accrue messages so break
				}
				data = Array.from(aSet).sort()
				isReporting = data // cache the result for reruns
			}
			if (data.length) {
				hash = mini(data); btn = addButton(4, METRIC) // + (hasReporting ? ' [cached]' : ' [generated]')
			} else {
				hash = 'none'
			}
			// notate
			if (isLanguageSmart) {
				if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
					let check = localesSupported[isLocaleAlt].r
					// if blank then it hasn't been translated yet
					if ('' == check) {check = localesSupported['en-US'].r}
					if (check.includes(hash)) {notation = locale_green}
				}
			}
		}
		addBoth(4, METRIC, hash, btn, notation, data)
		if (!hasReporting) {log_perf(4, METRIC, t0)}
		return resolve()
	}

	// shipped in FF149+ 1976074
	// note: we don't need to notate for BB if the API is enabled or not, as that's covered by window properties
	let hash, data ='', btn ='', notation = '', observer
	let hasReporting = 'array' == typeFn(isReporting, true)
	if (!isGecko) {
		exit(zNA)
	} else if (undefined == isReporting && undefined == window.ReportingObserver) {
		exit('undefined')
	} else {
		// but we do notate when it is on to match locale
		notation = isLanguageSmart ? locale_red : ''
		if (hasReporting) {
			exit()
		} else {
			try {
				if (runSE) {foo++}
				observer = new ReportingObserver((reports, observer) => {exit(reports)}, {types: ['deprecation'], buffered: true})
				observer.observe()
			} catch(e) {
				data = zErrLog; exit(e+'')
			}
		}
	}
})

function get_l10n_validation_messages(METRIC) {
	// https://searchfox.org/mozilla-central/source/dom/locales/en-US/chrome/dom/dom.properties

	const aNames = ['BadInputNumber','CheckboxMissing','DateTimeRangeOverflow','DateTimeRangeUnderflow',
		'FileMissing','InvalidEmail','InvalidURL','NumberRangeOverflow','NumberRangeUnderflow',
		'PatternMismatch','RadioMissing','SelectMissing','StepMismatch','ValueMissing',]
	const input = "<input type='number' required>"
		+ "<input type='checkbox' required>"
		+ "<input type='date' value='2024-01-01' max='2023-12-31'>"
		+ "<input type='date' value='2022-01-01' min='2023-12-31'>"
		+ "<input type='file' required>"
		+ "<input type='email' value='a'>"
		+ "<input type='url' value='a'>"
		+ "<input type='number' max='1974.3' value='2000'>"
		+ "<input type='number' min='8026.5' value='1'>"
		+ "<input type='tel' pattern='[0-9]{1}' value='a'>"
		+ "<input type='radio' required name='radiogroup'>"
		+ "<select required><option></option></select>"
		+ "<input type='number' min='1.2345' step='1005.5545' value='2'>"
		+ "<input type='text' required>"

	let hash, btn ='', data = {}, notation = isLanguageSmart ? locale_red : ''
	try {
		let collection = ((new DOMParser).parseFromString(input, 'text/html')).body.children
		let cType = typeFn(collection)
		if ('object' !== cType) {throw zErrType + cType}
		for (const k of Object.keys(collection)) {
			let msg = collection[k].validationMessage
			if (runST) {msg = undefined}
			let typeCheck = typeFn(msg)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			data[aNames[k]] = msg
		}
		hash = mini(data)
		let count = Object.keys(data).length
		let details = count === aNames.length ? 'details' : count +'/' + aNames.length
		btn = addButton(4, METRIC, details)
		if (isLanguageSmart) {
			if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
				if (localesSupported[isLocaleAlt].v.includes(hash)) {notation = locale_green}
			}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(4, METRIC, hash, btn, notation, data)
	return
}

function get_l10n_xml_messages(METRIC) {
	// https://searchfox.org/firefox-main/source/dom/locales/en-US/chrome/layout/xmlparser.properties

	let hash, btn ='', data = isXML, notation = isLanguageSmart ? locale_red : ''
	if ('string' == typeof isXML) {
		hash = isXML; data = isXML == zNA ? '' : zErrLog
	} else {
		hash = mini(isXML); btn = addButton(4, METRIC)
		if (isLanguageSmart) {
			if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
				if (localesSupported[isLocaleAlt].x.includes(hash)) {notation = locale_green}
			}
		}
	}
	addBoth(4, METRIC, hash, btn, notation, data)
	return
}

function get_l10n_xml_prettyprint(METRIC, isLies) {
	if (!isGecko) {addBoth(4, METRIC, zNA); return}

	// https://searchfox.org/firefox-main/source/dom/locales/en-US/dom = XMLPrettyPrint
		// note file schema errors due to CORS
	// by using a narrow iframe width, word segmentation line breaks determine the height,
		// and the content varies per app locale. It's imperative that the iframe be very
		// narrow (TZP uses 20px) as this ensure all scripts return the maximum number of lines
	// Deterministic health checks can't be hardcoded due to subpixels (system + other scaling)
			// and fonts (per platform + language), but we could simulate + compare
	let value, data ='', notation=''
	try {
		if (gRun) {dom.tzpXMLunstyled.width = 20} // ensure narrow width for max lines
		let target = dom.tzpXMLunstyled.contentDocument.firstChild
		let method = measureFn(target, METRIC)
		if (undefined !== method.error) {throw method.errorstring}
		value = method.height
	} catch(e) {
		value = e; data = zErrLog
	}
	// if the xml isn't loaded in time we will get a low default value (e.g. 0 latin, 8 arabic, 18 privacyX)
		// notate this as well as unexpected errors (i.e value is a string)
		// don't notate if file schema (it makes file vs http have different health counts which is not good)
		// this test is gecko only, so we don't need to check isLanguageSmart
	if (!isFile) {
		if ('number' !== typeof value || value < 50) {notation = isLanguageSmart ? locale_red : default_red}
	}
	addBoth(4, METRIC, value,'', notation, data, isLies)
}

function get_l10n_xslt_messages(METRIC) {
	if (!isGecko) {addBoth(4, METRIC, zNA); return}

	// https://searchfox.org/firefox-main/source/dom/locales/en-US/dom/xslt.ftl
	// note file schema errors due to CORS
		// we only need the one test for max entropy (tested Base Browser)
		// but we need an object to create a btn, and this also allows future expansion

	// FF151: dom.xslt.enabled
		// we're only loading the iframe once (on page load). The pref dictates if the xslt was
		// parsed and an error displayed or not - and that's not going to change if the pref is
		// toggled a rerun done

	let hash, data ='', btn='', notation = isLanguageSmart ? locale_red : ''
	try {
		let msg = dom.tzpXSLT.contentDocument.children[0].textContent
		if ('a' == msg) {
			// ToDo: cleanup notation when this becomes the standard
			hash = zD // XSLT disabled on page load
		} else {
			data = {'xslt-parse-failure': msg} 
			hash = mini(data); btn = addButton(4, METRIC)
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	if (isLanguageSmart) {
		if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
			if (localesSupported[isLocaleAlt].xs.includes(hash)) {notation = locale_green}
		}
	}
	addBoth(4, METRIC, hash, btn, notation, data)
}

function get_l10n_xslt_sort(METRIC) {
	if (!isGecko) {addBoth(4, METRIC, zNA); return}

	// 1978383: xsl:sort uses only base sensitivity / primary strength
	// so we can't use plural rules to get a determinsitic result
	let hash, btn ='', data = {}, notation = isLanguageSmart ? locale_red : ''
	if (!isXSLT) {
		addBoth(4, METRIC, zD,'', notation); return
	}

	try {
		if (runSE) {foo++}
		// get characters
		let aSource = oIntlLocale.collation.sort, aChars = [], aData = []
		aSource.forEach(function(item){aChars.push(item)})
		aChars.sort() // always sort to match char array same as collation poc
		// build xslt
		aChars.forEach(function(item){aData.push('<a>'+ item +'</a>')})
		const xData = '<?xml version="1.0" encoding="UTF-8"?><doc>'+ aData.join('') +'</doc>'
		const xslText = '<?xml version="1.0" encoding="UTF-8"?>'
			+'<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">'
			+'<xsl:template match="/"><xsl:for-each select="doc/a"><xsl:sort select="text()"/>'
			+'<xsl:value-of select="text()"/>,</xsl:for-each></xsl:template></xsl:stylesheet>'
		// run xslt
		const parser = new DOMParser()
		const xsltProcessor = new XSLTProcessor()
		const xslStylesheet = parser.parseFromString(xslText, "application/xml")
		xsltProcessor.importStylesheet(xslStylesheet)
		const xmlDoc = parser.parseFromString(xData, "application/xml")
		const styledDoc = xsltProcessor.transformToDocument(xmlDoc)
		let aTmp = styledDoc.firstChild.textContent.split(/[\s,\n]+/);
		aTmp = aTmp.slice(0, -1)
		let dataStr = (aTmp.join(' , ')).trim()
		data = {'sort': dataStr}
		hash = mini(data); btn = addButton(4, METRIC)
		if (isLanguageSmart) {
			if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
				// compare the string hash
				if (localesSupported[isLocaleAlt].xsort.includes(mini(dataStr))) {notation = locale_green}
			}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(4, METRIC, hash, btn, notation, data)
	return
}

/* TODO */

const get_dates = () => new Promise(resolve => {
	let d = new Date(Date.UTC(2023, 0, 1, 0, 0, 1)) //

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
	// locale options
	let o = {
		// numeric or 2-digit: always use numeric
		year: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
		// true or false: true override hourCycle and forces h11 or h12 (locale dependent) == AM/PM
		hour12: true,
		// long short narrow
		era: 'long',
		month: 'long', // also numeric or 2-digit but we already have that covered
		weekday: 'long',
		// long short
			// NOTE: FF91+ longGeneric, longOffset, shortGeneric, shortOffset
			// see timezonename PoC: tested july 2025: long, longOffset, shortOffset add nothing
			// short vs shortGeneric is a single extra unique hash
			// long matches longGeneric in terms of entropy
			// use long/short for old-timey support
		timeZoneName: 'long' 
	}
	// max option combos would be 3 x 3 x 3 x 2 = 54
	// then x dates and x calendars
	// that's a lot of tests

	let localecode = undefined
	let DTFo
	try {DTFo = Intl.DateTimeFormat(undefined, o)} catch {}

	function get_item(item) {
		let itemPad = 'item '+ item
		try {
// STRINGS
			if (item == 1) {return d.toTimeString()
			} else if (item == 2) {return d // a date object: default format?
			} else if (item == 3) {return d.toString() // redundant?

			// options
			} else if (item == 4) {return d.toLocaleString(localecode, o)
			} else if (item == 5) {return d.toLocaleDateString(localecode, o)
			} else if (item == 6) {return d.toLocaleTimeString(localecode, o)
			// no options
			} else if (item == 7) {return d.toLocaleString(localecode)
			} else if (item == 8) {return [d].toLocaleString(localecode) // typed array
			} else if (item == 9) {return d.toLocaleDateString(localecode)
			} else if (item == 10) {return d.toLocaleTimeString(localecode)

// DTF
			} else if (item == 11) {return DTFo.format(d)
			} else if (item == 12) {
				let f = Intl.DateTimeFormat(localecode, o)

				let temp = f.formatToParts(d)
				return temp.map(function(entry){return entry.value}).join('')
			} else if (item == 13) {return Intl.DateTimeFormat().format(d)
			} else if (item == 14) {
				// FF91+: 1710429
				// note: use hour12 - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
				// FF91: extended TZNs are type "unknown"
				let tzRes = []
				try {
					let tzNames = ['longGeneric','shortGeneric']
					let tzDays = [d]
					let tz
					tzDays.forEach(function(day) {
						tzNames.forEach(function(name) {
							tz =''
							try {
								let formatter = Intl.DateTimeFormat(localecode, {hour12: true, timeZoneName: name})
								tz = formatter.format(day)
							} catch(e) {
								if (day == tzDays[0]) {
									log_error(4, itemPad +': '+ name, e)
								}
								tz = zErr
							}
							tzRes.push(tz)
						})
					})
					return tzRes.join(' | ')
				} catch(e) {
					log_error(4, itemPad +': timeZoneName', e)
					return zErr
				}
			} else if (item == 15) {
				// FF91+: 1653024: formatRange
				let date1 = new Date(Date.UTC(2020, 0, 15, 11, 59, 59)),
					date2 = new Date(Date.UTC(2020, 0, 15, 12, 0, 1)),
					date3 = new Date(Date.UTC(2020, 8, 19, 23, 15, 30))
				return DTFo.formatRange(date1, date2) +' | '+ DTFo.formatRange(date1, date3)
			} else {
				return zSKIP
			}
		} catch(e) {
			log_error(4, itemPad, e)
			return zErr
		}
	}

	for (let i=1; i < 16; i++) {
		let result = get_item(i)
		if (result !== zSKIP) {
			let typeExpected = 2 == i ? 'empty object' : 'string'
			let typeCheck = typeFn(result)
			if (typeExpected !== typeCheck) {result = zErrType + typeCheck}
			addDisplay(4, 'ldt'+ i, result)
		}
	}
	return resolve()
})

const outputRegion = () => new Promise(resolve => {
	if (gRun && sectionIgnore.includes('region')) {return resolve()}

	oIntlLocalePerf = {} // reset

	set_isLanguageSmart() // required for BB health in get_language_locale()
	Promise.all([
		get_geo('geolocation'),
		get_language_locale(), // sets isLocaleValid/Value, isLanguagesNav
	]).then(function(){
		// add smarts if locale matches: i.e we can notate messages for FF
		// isLanguageSmart controls health for l10n (and language/locale but we also check isBB in those)
		if (isGecko && !isLanguageSmart && isSmart && isDesktop) {
			// this becomes problematic to maintain for all those 40+ locales over a full ESR cycle as translations
			// change or deprecated warnings etc come and go: the health check only really matters if you're spoofing
			// en-US anyway, so let's limit to en-US for non-BB to avoid non-BB false positivess
			if ('en-US' == isLocaleValue) {
				if (localesSupported[isLocaleValue] !== undefined) {isLanguageSmart = true}
			}
		}
		
		let isLies = isDomRect == -1
		Promise.all([
			get_language_system('languages_system'), // uses isLanguagesNav
			get_locale_intl(),
			get_timezone('timezone'), // sets isTimeZoneValid/Value
			get_l10n_validation_messages('l10n_validation_messages'),
			get_l10n_xml_messages('l10n_xml_messages'),
			get_l10n_parsererror_direction('l10n_parsererror_direction'),
			get_l10n_xslt_sort('l10n_xslt_sort'),
			get_l10n_xml_prettyprint('l10n_xml_prettyprint', isLies),
			get_l10n_xslt_messages('l10n_xslt_messages'),
			//get_l10n_css('l10n_css'),
		]).then(function(){
			Promise.all([
				get_dates_intl(), // uses isTimeZoneValid/Value + isLocaleValid/Value
				get_dates(), // to migrate to get_dates_intl
				get_l10n_reporting_messages('l10n_reporting_messages'),
				get_l10n_media_messages('l10n_media_messages'),
			]).then(function(){
				// microperf: add totals, re-order into anew obj
				let btn = '', count = 0, newobj = {'all': {}}

				let iTime = 0, sTime = 0 // running totals
				let countInteger = 0 
				for (const k of Object.keys(oIntlLocalePerf).sort()) {
					newobj[k] = oIntlLocalePerf[k]
					let kTime = 0 // running sub total
					for (const j of Object.keys(oIntlLocalePerf[k]).sort()) {
						let value = oIntlLocalePerf[k][j]
						if ('constructors' == j) {
							count += value
						} else {
							if ('intl' == j) {iTime += value} else {sTime += value}
							kTime += value // sum time for this metric k
							if (Number.isInteger(value)) {countInteger++} // track integers
							if (isGecko && 16.67 == value.toFixed(2)) {countInteger++} // add RFP "integers"
						}
					}
					// add a subtotal if more than expected constructors|intl
					if (Object.keys(oIntlLocalePerf[k]).length > 2) {newobj[k]['total'] = kTime}
				}
				// we currently have 26 times
					// gecko noRFP + RFP = 26 | noRFP but reduceTimer + chrome = 0 to 5
				if (countInteger < 13) {
					newobj.all = {'constructors': count, 'intl': iTime}
					if (sTime > 0) {newobj.all['string'] = sTime}
					newobj.all['total'] = iTime + sTime
					addDetail('intl', newobj, 'microperf')
					btn = addButton(99, 'intl','perf','btnc','microperf') //+' '+ countInteger
				}
				dom['intl_perf'].innerHTML = btn
				return resolve()
			})
		})
	})
})

const outputHeaders = () => new Promise(resolve => {
	if (gRun && sectionIgnore.includes('headers')) {return resolve()}

	Promise.all([
		get_nav_dnt('doNotTrack'),
		get_nav_gpc('globalPrivacyControl'),
		get_nav_connection('connection'),
		get_nav_online('onLine'),
	]).then(function(){
		return resolve()
	})
})

set_oIntlDates()
set_oIntlDate()
set_oIntlLocale()
countJS(4)

