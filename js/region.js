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
			/* https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
			// not worth leveraging type checks in gecko
			let keyTypes = {
				'addEventListener': 'function', 'dispatchEvent': 'function',
				'ontypechange': 'object', 'removeEventListener': 'function', 'type': 'string',
			}
			//*/
			let oTemp = {}
			for (let key in navigator.connection) {
				let keyValue = navigator.connection[key]
				let keyType = typeof keyValue
				if ('function' === keyType) {oTemp[key] = keyType} else {
					if ('downlink' == key) {keyValue = Math.floor(keyValue)} // non-gecko stability
					oTemp[key] = keyValue
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
	// expected property
	let hash, data =''
	try {
		hash = navigator[METRIC]
		if (runST) {hash = 1} else if (runSI) {hash = '2'}
		let typeCheck = typeFn(hash)
		if ('string' !== typeCheck) {throw zErrType + typeCheck}
		if ('1' !== hash && 'unspecified' !== hash) {throw zErrInvalid + 'expected 1 or unspecified: got ' + hash}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(5, METRIC, hash,'','', data)
	return
}

function get_nav_gpc(METRIC) {
	// GPC: 1670058
		// privacy.globalprivacycontrol.functionality.enabled = navigator
		// privacy.globalprivacycontrol.enabled = true/false
	// FF120+ desktop (?android): gpc enabled: false but true in pb mode
	let hash, data='', notation = isBB ? default_red : ''
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

function set_isLanguageSmart() {
	// set once: ignore android for now
	if (!gLoad || !isSmart || 'android' == isOS) {return}

	// BB always or FF if locale matches
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
	// last checked 13.5.1
	localesSupported = {
		// v hashes are with localized NumberRangeOver/Underflow
		'ar': {m: '1f9a06e3', v: '1dfb5b8c', x: '71982b47'},
		'be': {m: '076d68e6', v: '4edeafab', x: '42583d22'},
		'bg': {m: '2da6c02e', v: 'ce892c88', x: 'c4f06f98'},
		'ca': {m: 'd856d812', v: '6b3bb3d8', x: '77a62a49'},
		'cs': {m: 'c92accb0', v: 'de3ab0ad', x: '81c91d49'},
		'da': {m: '39169214', v: '479797a1', x: 'a30818e8'},
		'de': {m: '298d11c6', v: 'f9e2eae6', x: 'c1ce6571'},
		'el': {m: '7053311d', v: 'b1a88a13', x: '493f7225'},
		'en-US': {m: '05c30936', v: '41310558', x: '544e1ae8'},
		'es-ES': {m: '96b78cbd', v: '97c3f5a9', x: 'ed807f70'},
		'fa': {m: '6648d919', v: '8ef57409', x: '1ed34bca'},
		'fi': {m: '82d079c7', v: '3e29e6e7', x: '859efc32'},
		'fr': {m: '024d0fce', v: '34e28fa2', x: '1d2050d3'},
		'ga-IE': {m: '97fca229', v: '2bf1321d', x: 'd3af2cd8'},
		'he': {m: 'cdde832b', v: 'e47dbb82', x: 'c7274a3e'},
		'hu': {m: 'db7366e6', v: 'dad6d689', x: 'e4f85168'},
		'id': {m: '1e275882', v: '71224946', x: 'a70cd23c'},
		'is': {m: '204c8f73', v: '6bbe7a8f', x: 'edb8b212'},
		'it': {m: '716e7242', v: '3b781f09', x: 'c567f479'},
		'ja': {m: 'ab56d7cb', v: '48645d06', x: 'a58f6165'},
		'ka': {m: '6961b7e4', v: '40feb44f', x: 'bfbc28c2'},
		'ko': {m: 'c758b027', v: 'd3b54047', x: '1235e26d'},
		'lt': {m: 'c36fbafb', v: 'd5f9b95d', x: 'b0e8a3bc'},
		'mk': {m: '78274f1b', v: '333aae58', x: 'b6020ec1'},
		'ms': {m: '3e26c6be', v: '9dadbc64', x: '15e6148f'},
		'my': {m: '939f2013', v: '43cc3aa3', x: 'a6571ec7'},
		'nb-NO': {m: '1d496fea', v: '84ce54eb', x: 'e0d34e04'},
		'nl': {m: 'e1d3b281', v: '326cbfd2', x: 'caef95fc'},
		'pl': {m: '0bd88e98', v: '95ad4851', x: '2a45177d'},
		'pt-BR': {m: '39835e93', v: 'de2c3569', x: '68f80c66'},
		'pt-PT': {m: '6ae9a13a', v: 'b21f3984', x: '0aa2a309'},
		'ro': {m: '3e321768', v: 'd72a350b', x: 'a9da3416'},
		'ru': {m: '8e9b7945', v: '2391fbec', x: '26f663da'},
		'sq': {m: '91943e67', v: 'e0259277', x: '4e0bbdcd'},
		'sv-SE': {m: 'bc792ce2', v: 'd9d7828b', x: '4af3452f'},
		'th': {m: 'a32d70a7', v: '07358a87', x: '2a04071a'},
		'tr': {m: '4217ef80', v: '5048d312', x: '55daef93'},
		'uk': {m: '3e2b3e39', v: '0163f51d', x: '4f817ea3'},
		'vi': {m: 'bba6c980', v: 'b8137d59', x: '80da1efb'},
		'zh-Hans-CN': {m: '550ea53e', v:'0e58f82a', x: '536abb21'},
		'zh-Hant-TW': {m: '66b515a4', v: '8e4cfa0e', x: '9ad3338c'},
	}
	// mac: japanese languages are the same but the locale is 'ja-JP' not 'ja'
	if ('mac' == isOS) {
		languagesSupported['ja'].push('ja-JP')
		let macvalue = localesSupported.ja
		delete localesSupported['ja']
		localesSupported['ja-JP'] = macvalue
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

function set_oIntlTests() {

	let unitN = {'narrow': [1]}, unitL = {'long': [1]}, unitB = {'long': [1], 'narrow': [1]}
	let tzDays = [new Date('August 1, 2019 0:00:00 UTC')],
		tzLG = {'longGeneric': tzDays},
		tzSG = {'shortGeneric': tzDays}
	let curN = {'name': [-1]},
		curS = {'symbol': [1000]},
		curB = {'name': [-1], 'symbol': [1000]},
		curA = {'accounting': [-1000], 'name': [-1], 'symbol': [1000]}

	// all dates must be timezone resistent: we do not want the noise: we are checking locales
	// and want to maintain max entropy checks: timezone entropy == timezonename
	let dates = {
		FSD: new Date('2023-06-11T01:12:34.5678'), // no Z
		Era: new Date(-1, -11, -30),
		Jan: new Date('2023-01-15'),
		Jun: new Date('2023-06-15'),
		Sep: new Date('2023-09-15'),
		Nov: new Date('2023-11-15'),
		Wed: new Date('January 18, 2023 1:00:00'), // doubles as hour 1
		Fri: new Date('January 20, 2023 13:00:00'), // doubles as hour 13
	}

	oIntlTests = {
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
		compact: {
			'long': [0/0, 1000, 2e6, 6.6e12, 7e15],
			'short': [-1100000000, -1000],
		},
		currency: {'KES': curB, 'MOP': curS, 'USD': curA, 'XXX': curN,},
		dayperiod: {'long': [8,22], 'narrow': [8,15], 'short': [12,15,18]},
		datetimeformat: {
			era: {
				// we need to control the date part so toLocaleString matches
				'long': [{era: 'long', year: 'numeric', month: 'numeric', day: 'numeric'}, [dates.Era]]
			},
			fractionalSecondDigits: {
				'1': [{minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1}, [dates.FSD]]
			},
			hour: {
				'numeric': [{hour: 'numeric'}, [dates.Wed]],
			},
			hourCycle: {
				'h11-2-digit': [{hour: '2-digit', hourCycle: 'h11'}, [dates.Wed]]
			},
			month: {
				'narrow': [{month: 'narrow'}, [dates.Nov] ],
				'short': [{month: 'short'}, [dates.Jan, dates.Jun, dates.Sep]],
			},
			weekday: {
				'long': [{weekday: 'long'}, [dates.Wed, dates.Fri]],
				'narrow': [{weekday: 'narrow'}, [dates.Wed, dates.Fri]],
				'short': [{weekday: 'short'}, [dates.Fri]],
			},
		},
		listformat: {
			'narrow': ['conjunction','disjunction','unit'],
			'short': ['conjunction','unit']
		},
		notation: {
			scientific: {'decimal': []},
			standard: {'decimal': [0/0, -1000, 987654], 'percent': [1000]},
		},
		'numberformat_ftp': {
			'decimal': [1.2],'group': [1000, 99999],'infinity': [Infinity],'minusSign': [-5],'nan': ['a']
		},
		pluralrules: {
			cardinal: [0, 1, 2, 3, 7, 21, 100], // 1859752 ICU 74: add ordinal 81 to keep lij unique from it,sc
			ordinal: [1, 2, 3, 5, 8, 10, 81]
		},
		relativetimeformat: { // 8 of 12
			always: {'narrow': [[1, 'day'], [0, 'year']]},
			auto: {'long': [[1, 'second']],'narrow': [[3,'day'],[0,'quarter'],[0,'second'],[1,'second'],[3,'second']]},
		},
		'relativetimeformat_ftp': { // 4 of 12
			auto: {'narrow': [[0,'day'],[1,'day'],[1,'week'],[1,'year']]}
		},
		sign: {always: [-1, 0/0]},
		timezonename: {
			'Africa/Douala': tzLG,
			'Asia/Hong_Kong': tzSG,
			'Asia/Muscat': tzSG,
			'Asia/Seoul': tzLG,
			'Europe/London': tzSG,
		},
		unit: {
			'byte': unitN, // ICU 74
			'fahrenheit': unitB,
			'foot': unitL,
			'hectare': {'long': [1], 'short': [987654]},
			'kilometer-per-hour': unitN,
			'millimeter': unitN,
			'month': unitB,
			'nanosecond': unitN,
			'percent': unitB,
			'second': {'long': [1], 'narrow': [1], 'short': [987654]},
			'terabyte': unitL,
		}
	}
	try {oIntlTests['compact']['long'].push(BigInt('987354000000000000'))} catch {}
	let nBig = 987654
	try {nBig = BigInt('987354000000000000')} catch {}
	oIntlTests['notation']['scientific']['decimal'].push(nBig)
	// build keys
	for (const k of Object.keys(oIntlTests)) {
		oIntlKeys[k] = []
		for (const j of Object.keys(oIntlTests[k]).sort()) {oIntlKeys[k].push(j)}
	}
}

const get_geo = (METRIC) => new Promise(resolve => {
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

	function exit(state) {
		res.push(state)
		let hash = mini(res)
		if (isBB && hash == '5ce0a555') {
			notation = default_green // BB ESR78+: disabled, true, prompt
		} else if (!isBB && hash == 'e36e1742') {
			notation = default_green // FF72+: enabled, true, prompt
		}
		addBoth(4, METRIC, res[1] +' | '+ res[2],'', notation, res.join(' | '))
		return resolve()
	}

	try {
		if (runSE) {foo++}
		navigator.permissions.query({name:'geolocation'}).then(e => exit(e.state))
	} catch(e) {
		log_error(4, METRIC +'_permission', e)
		exit(zErr)
	}
})

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
	sDetail.document[METRIC] = oRes
	let btn = addButton(4, METRIC)

	// LOCALE
	// remove errors + dupes
	res = res.filter(x => ![zErr].includes(x))
	res = res.filter(function(item, position) {return res.indexOf(item) === position})
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
		//61a9b098: { durationformat: "TypeError: Intl.DurationFormat is not a constructor" }
		// we only expect 1 exact error for BB14
		if ('61a9b098' == errHash) {
			let key = oData.language
			// only green if BB supported
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
	populate svg with nav entries to detects if anything added. To detect removals would mean
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
		aText.push('<text>unknown</text></switch>')
		let el = dom.tzpSwitch
		el.innerHTML = aText.join('')
		// walk nodes
		let aDetected = [], range = new Range()
		const walker = document.createTreeWalker(dom['switch'], NodeFilter.SHOW_TEXT, null);
		while(walker.nextNode() && walker.currentNode) {
			range.selectNode(walker.currentNode)
			if (range.getClientRects().length) {aDetected.push(walker.currentNode.textContent)}
		}
		if (0 == aDetected.length) {
			// should never happen: i.e we should always have unknown as a minimum fallback
			throw zErrType + 'empty array'
		} else if (aDetected.length > 1) {
			aDetected = aDetected.filter(x => !['unknown'].includes(x))
		}
		value = aDetected.join(', ')
	} catch(e) {
		value = e; data = zErrLog
	}
	// tidy nav string to compare to
	isLanguagesNav = isLanguagesNav.join(', ')
	addBoth(4, METRIC, value,'', (value == isLanguagesNav ? lang_green : lang_red), data)
	log_perf(4, METRIC, t0)
}

function get_locale_intl() {
	function get_metric(m, code, isIntl) {
		try {
			let obj = {}, tests = oIntlTests[m], testkeys = oIntlKeys[m], value
			if ('collation' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let testdata = tests[key].sort() // always resort
					obj[key] = [testdata.sort(Intl.Collator(code, {usage: key}).compare).join(', ')]
				}
			} else if ('compact' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i], data = [], formatter
					let option = {notation: m, compactDisplay: key, useGrouping: true}
					if (isIntl) {formatter = new Intl.NumberFormat(code, option)}
					tests[key].forEach(function(n) {
						value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, option)); data.push(value)
					})
					obj[key] = data
				}
			} else if ('currency' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let option = 'accounting' == s ? {style: m, currency: key, currencySign: s} : {style: m, currency: key, currencyDisplay: s}, data = []
						tests[key][s].forEach(function(n) {
							value = (isIntl ? Intl.NumberFormat(code, option).format(n) : (n).toLocaleString(code, option)); data.push(value)
						})
						obj[key][s] = data
					})
				}
			} else if ('datetimeformat' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let option = tests[key][s][0], formatter, data = []
						if (isIntl) {formatter = new Intl.DateTimeFormat(code, option)}
						tests[key][s][1].forEach(function(n){
							value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, option)); data.push(value)
						})
						obj[key][s] = data
					})
				}
			} else if ('dayperiod' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i], data = []
					let formatter = new Intl.DateTimeFormat(code, {hourCycle: 'h12', dayPeriod: key})
					tests[key].forEach(function(item) {data.push(formatter.format(dayperiods[item]))})
					obj[key] = data
				}
			} else if ('listformat' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i], data = []
					tests[key].forEach(function(item) {data.push(new Intl.ListFormat(code, {style: key, type: item}).format(['a','b','c']))})
					obj[key] = data
				}
			} else if ('notation' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						let formatter = (isIntl ? Intl.NumberFormat(code, {notation: key, style: s}) : undefined), data = []
						tests[key][s].forEach(function(n){
							value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, {notation: key, style: s})); data.push(value)
						})
						obj[key][s] = data
					})
				}
			} else if ('numberformat_ftp' == m) {
				function get_value(type, aParts) {
					for (let i=0; i < aParts.length; i++) {
						if (aParts[i].type === type) {str = aParts[i].value; return (str.length == 1 ? str.charCodeAt(0) : str)}
					}
					return 'none'
				}
				let formatter = Intl.NumberFormat(code), str
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let data = []
					tests[key].forEach(function(num){data.push(get_value(key, formatter.formatToParts(num)))})
					obj[key] = data
				}
			} else if ('pluralrules' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i], data = [], prev='', current=''
					let formatter = new Intl.PluralRules(code, {type: key}), nos = tests[key]
					nos.forEach(function(n) {
						current = formatter.select(n)
						if (prev !== current) {data.push(n +': '+ current)}
						prev = current
					})
					obj[key] = data
				}
			} else if ('relativetimeformat' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(item) {
						let formatter = new Intl.RelativeTimeFormat(code, {style: item, numeric: key}), data = []
						tests[key][item].forEach(function(pair){data.push(formatter.format(pair[0], pair[1]))})
						obj[key][item] = data
					})
				}
			} else if ('relativetimeformat_ftp' == m) {
				function parts(length, value) {
					let output ='', tmp = formatter.formatToParts(length, value)
					for (let x=0; x < tmp.length; x++) {output += tmp[x].value}
					return output
				}
				let formatter, data = []
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					obj[key] = {}
					Object.keys(tests[key]).forEach(function(s) {
						formatter = new Intl.RelativeTimeFormat(code, {style: s, numeric: key}), data = []
						tests[key][s].forEach(function(pair){data.push(parts(pair[0], pair[1]))})
						obj[key][s] = data
					})
				}
			} else if ('sign' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i]
					let formatter = (isIntl ? new Intl.NumberFormat(code, {signDisplay: key}) : undefined), data = []
					tests[key].forEach(function(n){
						value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, {signDisplay: key})); data.push(value)
					})
					obj[key] = data
				}
			} else if ('timezonename' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i], data = []
					Object.keys(tests[key]).forEach(function(tzn){
						try {
							// use y+m+d numeric so toLocaleString matches
							// use hour12 in case - https://bugzilla.mozilla.org/show_bug.cgi?id=1645115#c9
							let option = {year: 'numeric', month: 'numeric', day: 'numeric', hour12: true, timeZone: key, timeZoneName: tzn}
							let formatter = (isIntl ? Intl.DateTimeFormat(code, option) : undefined)
							tests[key][tzn].forEach(function(dte){
								value = (isIntl ? formatter.format(dte) : (dte).toLocaleString(code, option)); data.push(value)
							})
						} catch {} // ignore invalid
						if (data.length) {obj[key] = data}
					})
				}
				if (!Object.keys(obj).length) {let trap = Intl.DateTimeFormat(code, {timeZoneName: 'longGeneric'})} // trap error
			} else if ('unit' == m) {
				for (let i=0; i < testkeys.length; i++) {
					let key = testkeys[i], data = []
					Object.keys(tests[key]).forEach(function(ud){
						try {
							let formatter = (isIntl ? Intl.NumberFormat(code, {style: 'unit', unit: key, unitDisplay: ud}) : undefined)
							tests[key][ud].forEach(function(n){
								value = (isIntl ? formatter.format(n) : (n).toLocaleString(code, {style: 'unit', unit: key, unitDisplay: ud})); data.push(value)
							})
						} catch {} // ignore invalid
					})
					if (data.length) {obj[key] = data}
				}
				if (!Object.keys(obj).length) {let trap = Intl.NumberFormat(code, {style: 'unit', unit: 'day'})} // trap error
			}
			return {'hash': mini(obj), 'metrics': obj}
		} catch(e) {
			log_error(4, METRIC +'_'+ m, e)
			return zErr
		}
	}

	const dayperiods = { // set per run
		8: new Date('2019-01-30T08:00:00'),
		12: new Date('2019-01-30T12:00:00'),
		15: new Date('2019-01-30T15:00:00'),
		18: new Date('2019-01-30T18:00:00'),
		22: new Date('2019-01-30T22:00:00'),
	}
	const oMetrics = {
		intl : [
			'collation','compact', 'currency', 'datetimeformat','dayperiod', 'listformat','notation','numberformat_ftp',
			'pluralrules','relativetimeformat','relativetimeformat_ftp','sign','timezonename','unit'
		],
		tolocalestring: ['compact','currency','datetimeformat','notation','sign','timezonename','unit'],
	}
	let t0 = nowFn()
	let METRIC, oString = {}
	Object.keys(oMetrics).forEach(function(list){
		METRIC = 'locale_'+ list
		let t0 = nowFn(), isIntl = 'intl' == list, notation = locale_red
		let oData = {}, oCheck = {}
		oMetrics[list].forEach(function(m) {
			let value = get_metric(m, undefined, isIntl) 
			oData[m] = value
			if (isIntl && oMetrics['tolocalestring'].includes(m)) {oString[m] = value} // intl version of tolocalestring
		})
		let hash = mini(oData), btnDiff =''
		if (!isIntl) {
			addDisplay(4, METRIC +'_matches_intl','','', (hash == mini(oString) ? intl_green : intl_red))
		}
		if (isLocaleValid) {
			oMetrics[list].forEach(function(m) {oCheck[m] = get_metric(m, isLocaleValue, isIntl)})
			if (hash == mini(oCheck)) {
				notation = locale_green
			} else {
				addDetail(METRIC +'_check', oCheck)
				btnDiff = addButton(4, METRIC +'_check', isLocaleValue +' check')
			}
		}
		addBoth(4, METRIC, hash, addButton(4, METRIC) + btnDiff, notation, oData)
		log_perf(4, METRIC, t0)
		if (!isIntl) {return}
	})
}

function get_locale_resolvedoptions(METRIC) {
	// already sorted
	let oTests = {
		collator: ['caseFirst'],
		datetimeformat: ['calendar','day','hourcycle','month','numberingSystem'],
		pluralrules: ['pluralCategories'],
	}
	function get_metrics(code) {
		let tmpData = {}
		for (const k of Object.keys(oTests)) {
			tmpData[k] = {}
			let metrics = oTests[k]
			try {
				// set constructor
				let constructor
				if ('collator' == k) {constructor = Intl.Collator(code).resolvedOptions()
				} else if ('datetimeformat' == k) {constructor = Intl.DateTimeFormat(code).resolvedOptions()
				} else if ('pluralrules' == k) {constructor = new Intl.PluralRules(code).resolvedOptions()
				}
				// get values
				metrics.forEach(function(m) {
					try {
						let value
						if ('hourcycle' == m) {
							value = Intl.DateTimeFormat(code, {hour: 'numeric'}).resolvedOptions().hourCycle
						} else if ('pluralCategories' == m) {
							value = constructor[m].join(', ')
						} else {
							value = constructor[m]
						}
						tmpData[k][m] = value
					} catch(e) {
						log_error(4, METRIC +'_'+ k +'_'+ m, e)
						tmpData[k][m] = zErr
					}
				})
			} catch(e) {
				log_error(4, METRIC +'_'+ k, e)
				tmpData[k] = zErr
			}
		}
		return tmpData
	}

	let oData = get_metrics(undefined), oCheck = {}, notation = locale_red
	if (isLocaleValid) {oCheck = get_metrics(isLocaleValue)}
	let hash = mini(oData), btnDiff =''
	if (isLocaleValid) {
		if (hash == mini(oCheck)) {
			notation = locale_green
		} else {
			addDetail(METRIC +'_check', oCheck)
			btnDiff = addButton(4, METRIC +'_check', isLocaleValue +' check')
		}
	}
	addBoth(4, METRIC, hash, addButton(4, METRIC) + btnDiff, notation, oData)
	return
}

const get_messages_media = (METRIC) => new Promise(resolve => {
	let hash, btn='', data = {}, notation = isLanguageSmart ? locale_red : ''
	try {
		let aList = ['InvalidImage','ScaledImage']
		for (const k of aList) {
			let target = dom['tzp'+ k], title =''
			if ('ScaledImage' == k) {
				title = target.contentWindow.document.title
				title = title.replace(k +'.png', '') // strip image name to reduce noise
			} else {
				const image = target.contentWindow.document.querySelector('img')
				title = image.alt
				title = title.replace(target.src, '') // remove noise
			}
			data[k] = title.trim()
		}
		hash = mini(data); btn = addButton(4, METRIC)
		if (isLanguageSmart) {
			if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
				if (hash === localesSupported[isLocaleAlt].m) {notation = locale_green}
			}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(4, METRIC, hash, btn, notation, data)
	return resolve()
})

function get_messages_validation(METRIC) {
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
				if (hash === localesSupported[isLocaleAlt].v) {notation = locale_green}
			}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(4, METRIC, hash ,btn, notation, data)
	return
}

function get_messages_xml(METRIC) {
	let hash, btn ='', data = isXML, notation = isLanguageSmart ? locale_red : ''
	if ('string' == typeof isXML) {
		hash = isXML; data = isXML == zNA ? '' : zErrLog
	} else {
		hash = mini(isXML); btn = addButton(4, METRIC)
		if (isLanguageSmart) {
			if (isLocaleValid && localesSupported[isLocaleAlt] !== undefined) {
				if (hash === localesSupported[isLocaleAlt].x) {notation = locale_green}
			}
		}
	}
	addBoth(4, METRIC, hash, btn, notation, data)
	return
}

function get_timezone(METRIC) {
	let t0 = nowFn()
	const METRICtz = 'timezone'

	// reset
	isTimeZoneValid = false
	isTimeZoneValue = undefined
	let days = ['January 1','July 1'], years = [1879, 1921, 1952, 1976, 2025]
	let aMethods = [
		'date','date.parse','date.valueOf','getTime','getTimezoneOffset','Symbol.toPrimitive',
	]

	function get_tz() {
		let methods = ['timeZone','timeZoneId','zonedDateTime']
		let tzData = {}
		methods.forEach(function(k) {
			let tz, isErr = false
			try {
				if ('timeZone' == k) {
					tz = Intl.DateTimeFormat().resolvedOptions().timeZone
				} else if ('timeZoneId' == k) {
					tz = Temporal.Now.timeZoneId()
				} else {
					tz = Temporal.Now.zonedDateTimeISO().toString()
					tz = tz.slice(tz.indexOf('[') + 1, tz.length - 1)
				}
				if (runST) {tz = undefined} else if (runSI) {tz = 'tzp'}
				let typeCheck = typeFn(tz)
				if ('string' !== typeCheck) {throw zErrType + typeCheck}
				let tztest = (new Date('January 1, 2018 13:00:00 UTC')).toLocaleString('en', {timeZone: tz})
			} catch(e) {
				tz = e+''
				isErr = true
			}
			tzData[k] = {'isErr': isErr, 'name': tz}
		})
		return tzData
	}

	function get_offsets() {
		let oData = {}, oErrors = {}
		aMethods.forEach(function(method) {
			oData[method] = {}
			years.forEach(function(year) {oData[method][year] = []})
		})
		try {
			years.forEach(function(year) {
				days.forEach(function(day) {
					let isFirst = (year == years[0] && day == days[0])
					let datetime = day +', '+ year +' 13:00:00'
					let control = new Date(datetime +' UTC')
					let test = new Date(datetime)
					if (runSE) {foo++} else if (runST) {test = NaN}
					aMethods.forEach(function(method) {
						let offset, k = 60000
						try {
							if (method == 'getTimezoneOffset') {
								offset = test.getTimezoneOffset()
								k = 1
							} else {
								if (method == 'date.parse') {
									offset = Date.parse(test) - Date.parse(control)
								} else if (method == 'date.valueOf') {
									offset = test.valueOf() - control.valueOf()
								} else if (method == 'Symbol.toPrimitive') {
									offset = test[Symbol.toPrimitive]('number') - control[Symbol.toPrimitive]('number')
								} else if (method == 'getTime') {
									offset = test.getTime() - control.getTime()
								} else if (method == 'date') {
									offset = test - control
								}
							}
							if (isFirst) {
								let typeCheck = typeFn(offset)
								if ('number' !== typeCheck) {throw zErrType + typeCheck}
							}
							oData[method][year].push(offset/k)
						} catch(e) {
							oErrors[method] = log_error(4, METRIC +'_'+ method, e)
						}
					})
				})
			})
		} catch(e) {
			oData = log_error(4, METRIC, e)
		}
		for (const k of Object.keys(oErrors)) {oData[k] = oErrors[k]}
		return oData
	}

	Promise.all([
		get_tz(),
		get_offsets(),
	]).then(function(res){

		// TZ: we returned an object
		let tz, tzObj = res[0], tzData = []
		// display each item and track non-errors
		for (const k of Object.keys(tzObj)) {
			let display = tzObj[k].name
			if (false == tzObj[k].isErr) {tzData.push(display) // track non errors
			} else {display = log_error(4, METRICtz +'_'+ k, display)} // log errors
			addDisplay(4, METRICtz +'_'+ k, display) // display
		}
		// dedupe, if only 1 non-error, then we have a tz value
		tzData = tzData.filter(function(item, position) {return tzData.indexOf(item) === position})
		if (1 == tzData.length) {tz = tzData[0]; isTimeZoneValue = tz}

		// OFFSETS
		let oOffsets = res[1], notation = tz_red, go = true, aHash = {}, countErr = 0, allHash
		// stop: overall error
		if ('string' == typeof oOffsets) {addBoth(4, METRIC, oOffsets,'', notation, zErr); go = false}
		// display errors + collect hashes
		if (go) {
			for (const k of Object.keys(oOffsets)) {
				if ('string' == typeof oOffsets[k]) {
					addDisplay(4, k, oOffsets[k])
					countErr++
				} else {
					let hash = mini(oOffsets[k])
					if (aHash[hash] == undefined) {aHash[hash] = []}
					aHash[hash].push(k)
				}
			}
			// stop: all errors
			if (countErr == aMethods.length) {addBoth(4, METRIC, zErr,'', notation); go = false}
		}
		// display hashes + btns
		if (go) {
			let isHashMixed = (Object.keys(aHash).length > 1 || countErr > 0) ? true : false // includes errors
			for (const k of Object.keys(aHash)) {
				allHash = k
				let items = aHash[k]
				for (let i=0; i < items.length; i++) {
					let metric = items[i], btn =''
					if (isHashMixed && i == 0) {
						// btns for 1st of each hash
						sDetail[isScope][METRIC +'_'+ metric] = oOffsets[metric]
						btn = addButton(4, METRIC +'_'+ metric)
					}
					addDisplay(4, metric, k, btn)
				}
			}
			// stop: not all same + valid
			if (isHashMixed) {addBoth(4, METRIC, 'mixed','', notation,'', true); go = false}
		}

		// all valid + same
		let isLies = false
		if (go) {
			if (isTimeZoneValue !== undefined) {
				try {
					let oTest = {}
					// just use date.parse
					years.forEach(function(year) {
						oTest[year] = []
						days.forEach(function(day) {
							let datetime = day +', '+ year +' 13:00:00'
							let control = new Date(datetime)
							let test = control.toLocaleString('en', {timeZone: 'UTC'})
							control = control.toLocaleString('en', {timeZone: isTimeZoneValue})
							let diff = ((Date.parse(test) - Date.parse(control))/60000)
							oTest[year].push(diff)
						})
					})
					let testHash = mini(oTest)
					notation = testHash === allHash ? tz_green : tz_red
					if (testHash !== allHash) {
						isLies = true
					} else if (isSmart) {
						// legit single timezonename
						// legit looking offset values
						// all offsets methods match
						// a control matches using the timezonename
					 isTimeZoneValid = true
					}
				} catch {}
			}
			// display
			addBoth(4, METRIC, allHash, addButton(4, METRIC), notation, oOffsets['getTime'], isLies)
		}

		// TZ: after isTimeZoneValid set above
			// which can only be true if we had a single tz (ignoring errors) after deduping
		if (isTimeZoneValid) {
			let tzHash = mini(tzObj)
			let tzGood = [
				'0282cadf', // Atlantic/Reykjavik + 2x "ReferenceError: Temporal is not defined"
				'8d787cb5', // all Atlantic/Reykjavik
			]
			notation = tzGood.includes(tzHash) ? rfp_green : rfp_red
			addBoth(4, METRICtz, tz,'', notation)
		}	else {
			notation = rfp_red
			isLies = false // reset
			if (undefined == tz) {
				if (0 == tzData.length) {tz = zErr // all errors
				} else if (tzData.length > 1) {tz = 'mixed'; isLies = true} // mixed so untrustworthy
			} else {
				isLies = true // single tz but failed the test, so untrustworthy
			}
			addBoth(4, METRICtz, tz,'', notation,'', isLies)
		}
		// health lookup
		if (rfp_red == notation) {
			sDetail.document[METRICtz] = {}
			for (const k of Object.keys(tzObj)) {sDetail.document[METRICtz][k] = tzObj[k].name}
		}
		log_perf(4, METRIC, t0)
		return
	})
}

function get_timezone_offset(METRIC) {
	if (!isGecko) {
		addBoth(4, METRIC, zNA)
		return
	}

	let t0 = nowFn()
	// setup
	const xslText = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"'
		+' xmlns:date="http://exslt.org/dates-and-times" extension-element-prefixes="date"><xsl:output method="html"/>'
		+' <xsl:template match="/"><xsl:value-of select="date:date-time()" /></xsl:template></xsl:stylesheet>'
	const doc = (new DOMParser).parseFromString(xslText, 'text/xml')
	let oData = {}, oErr = {}, oDisplay = {}, oLies = {}, xOffset, xMinutes, tzControl, zOffset
	let methods = ['control','date','exslt','iframe','plain','string','unsafe','zoned']
	let notation = tz_red

	function checkValidDate(method, value) {
		try {if (new Date(value) +'' == 'Invalid Date') {oErr[method] = 'Invalid Date: ' + value; return false}; return true
		} catch(e) {oErr[method] = e+''; return false}
	}

	function display_detail() {
		methods.forEach(function(k){
			let n = METRIC +'_'+ k
			let value, data ='', extra ='', isLies = false
			if (undefined !== oData.format[k]) {
				// style + record lies
				// technically control isn't a lie, even if it can be tampered with
				// and any tampering with the date object will already show up as lies vs exslt
				if ('control' !== k && oLies[k] !== undefined) {
					isLies = true
					log_known(4, n, oData.format[k])
				}
				if ('exslt' == k) {extra = ' ['+ xOffset +']'
				} else if ('zoned' == k) {extra = ' ['+ zOffset +']'
				} else if ('control' == k) {extra = ' ['+ tzControl +']'}
				value = oData.format[k] + extra
			} else {
				// if exslt then we log as the metric error and final result
				value = log_error(4, METRIC + ('exslt' == k ? '': '_'+ k), oErr[k])
				if ('exslt' == k) {addBoth(4, METRIC, value,'', notation, zErr)}
			}
			addDisplay(4, n, value,'','', isLies)
		})
	}

	function checkMatch(runNo) {
		oLies = {}
		// are they all the same
		let aTmp = []
		for (const k of Object.keys(oData.format)) {aTmp.push(oData.format[k])}
		aTmp = aTmp.filter(function(item, position) {return aTmp.indexOf(item) === position})
		if (aTmp.length == 1) {return true}
		// get exslt parts
		let xMod = oData.format.exslt
		let xParts = xMod.split(' '), xTime = xParts[1].split(':')
		// diff xMod vs the rest
		let isSame = true
		for (const k of Object.keys(oData.format)) {
			if ('exslt' !== k) {
				let mod = oData.format[k]
				let mParts = mod.split(' '), mTime = mParts[1].split(':')
				if (mParts[0] == xParts[0]) {
					// same day: only worry about time
					let tmpDiff = {
						h: (mTime[0] * 1) - (xTime[0] * 1),
						min: (mTime[1] * 1) - (xTime[1] * 1),
						s: (mTime[2] * 1) - (xTime[2] * 1),
					}
					// allow 10 seconds: jank, also leap seconds
					// abs !important to cover being ahead or behind
					let secondsDiff = Math.abs((tmpDiff.h * 3600) + (tmpDiff.min * 60) + tmpDiff.s)
					if (secondsDiff > 10) {isSame = false; oLies[k] = true}
				} else {
					isSame = false; oLies[k] = true
				}
			}
		}
		return isSame
	}

	function get_mods() {
		// reset
		oData = {'format': {}, 'raw': {}}, oErr = {}, xOffset = undefined, xMinutes = undefined
		let option = {day: '2-digit', month: '2-digit', year: 'numeric', hour12: false, hour: '2-digit', minute: 'numeric', second: 'numeric'}
		// grab
		let id = 'iframelastmod'
		try {
			let el = document.createElement('iframe')
			el.setAttribute('id', id)
			document.body.appendChild(el)
			let target = el.contentDocument
			oData.raw['iframe'] = target.lastModified // contentWindow.document
		} catch(e) {
			oErr['iframe'] = e+''
		}
		removeElementFn(id)
		try {
			let xsltProcessor = new XSLTProcessor
			xsltProcessor.importStylesheet(doc) // fragment sticky datetime is set here
			let fragment = xsltProcessor.transformToFragment(doc, document) // toFragment is faster than toDocument
			oData.raw['string'] = doc.lastModified // quickly grab lastMod since it updates each time we call it
			oData.raw['exslt'] = fragment.childNodes[0].nodeValue
		} catch(e) {
			oErr['exslt'] = e+''
			try {
				oData.raw['string'] = (new DOMParser).parseFromString('','text/html').lastModified
			} catch(e) {oErr['string'] = e+''}
		}
		try {oData.raw['unsafe'] = Document.parseHTMLUnsafe('').lastModified
		} catch(e) {
			// the error differs if the console is open vs closed
			if (e.name == 'NS_ERROR_UNEXPECTED') {e = 'Error: Permission denied to access property \"lastModified\"'}
			oErr['unsafe'] = e+''
		}
		try {
			let test = (new Date()).toLocaleDateString('en', option)
			oData.raw['date'] = test.replace(',','')
		} catch(e) {
			oErr['date'] = e+''
		}
		try {
			// just use the resolvedOptions: if they're lying it will create a mix
			tzControl = Intl.DateTimeFormat().resolvedOptions().timeZone
			option['timeZone'] = tzControl // if nothing valid we pass undefined
			let control = (new Date()).toLocaleDateString('en', option)
			oData.raw['control'] = control.replace(',','')
		} catch(e) {oErr['control'] = e+''}
		try {
			oData.raw['zoned'] = Temporal.Now.zonedDateTimeISO().toString()
		} catch(e) {
			oErr['zoned'] = e+''
		}
		try {
			oData.raw['plain'] = Temporal.Now.plainDateTimeISO().toString()
		} catch(e) {
			oErr['plain'] = e+''
		}
		try {
			oData.raw['isostring'] = new Date().toISOString()
		} catch(e) {
			oErr['isostring'] = e+''
		}
		//console.log(oData.raw)

		// test
		if (runST) {
			oData.raw['date'] = {}
			oData.raw['iframe'] = null
			oData.raw['string'] = undefined
			oData.raw['plain'] = ''
			oData.raw['unsafe'] = '99-99-99' // invalid
			oData.raw['zoned'] = 4
		}
		// type check/format
		methods.forEach(function(k){
			if (oErr[k] == undefined) {
				let typeCheck = typeFn(oData.raw[k])
				if ('string' !== typeCheck) {
					oErr[k] = zErrType + typeCheck
				} else {
					let formatted
					if ('exslt' == k) {
						// set xOffset
						xOffset = (oData.raw[k]).slice(-6)
						// get xMinutes in getTimezoneoffset format
							// *1 works as it ignores leading 0's and returns a number
							// flip the sign but drop if positive or 0 to match calculated/getTimezoneOffset
						xMinutes = ((xOffset.slice(1,3) * 1)*60) + (xOffset.slice(4,6)*1)
						let xSign = (xOffset[0] == '+' ? (xMinutes == 0 ? '': '-') : '')
						xMinutes = xSign + xMinutes
						formatted = ((oData.raw[k]).slice(0,-10)).replace('T',' ')
					} else if ('zoned' == k || 'plain' == k) {
						// we only want the first 19 chars
						formatted = ((oData.raw[k]).slice(0,19)).replace('T',' ')
						// set zOffset
						if ('zoned' == k) {
							let end = (oData.raw[k]).indexOf('[')
							zOffset = (oData.raw[k]).slice(end - 6, end)
						}
					} else {
						formatted = (oData.raw[k]).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2')
					}
					if (checkValidDate(k, formatted)) {oData.format[k] = formatted}
				}
			}
		})
	}

	// run
	get_mods()
	if (undefined !== oData.format.exslt) {
		let xValue = xMinutes + (xOffset == '+00:00' ? '' : ' ['+ xOffset +']')
		let isMatch = checkMatch(1)
		if (!isMatch) {
			// ~0.3 ms to grab our mods: 1 in 86,400 seconds tick over a day
			// so we'd have to be really unlucky to hit this: try again
			get_mods()
			isMatch = checkMatch(2)
		}
		// ignore temporal not defined errors for notation
		let errLen = Object.keys(oErr).length
		if ('ReferenceError: Temporal is not defined' == oErr['zoned']) {errLen = errLen - 1}
		if ('ReferenceError: Temporal is not defined' == oErr['plain']) {errLen = errLen - 1}
		// no lies + no errors: includes control even though we ignore it for display/recording
		if (0 == Object.keys(oLies).length && 0 == errLen) {notation = tz_green}
		addBoth(4, METRIC, xValue,'', notation)
	}
	display_detail()
	log_perf(4, METRIC, t0)
	return
}

const get_dates = () => new Promise(resolve => {
	let d = new Date(Date.UTC(2023, 0, 1, 0, 0, 1)) //
	let o = {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric',
			minute: 'numeric', second: 'numeric', hour12: true, timeZoneName: 'long'}
	let localecode = undefined
	let DTFo
	try {DTFo = Intl.DateTimeFormat(undefined, o)} catch {}

	function get_item(item) {
		let itemPad = 'item '+ item
		try {
// STRINGS
			if (item == 1) {return d.toTimeString()
			} else if (item == 2) {return d // a date object
			} else if (item == 3) {return d.toString() // redundant?
			} else if (item == 4) {return d.toLocaleString(localecode, o)
			} else if (item == 5) {return d.toLocaleDateString(localecode, o)
			} else if (item == 6) {return d.toLocaleTimeString(localecode, o)
			} else if (item == 7) {return d.toLocaleTimeString(localecode)
			} else if (item == 8) {return d.toLocaleString(localecode)
			} else if (item == 9) {return [d].toLocaleString(localecode)
// DTF
			} else if (item == 10) {return DTFo.format(d)
			} else if (item == 11) {
				let f = Intl.DateTimeFormat(localecode, o)

				let temp = f.formatToParts(d)
				return temp.map(function(entry){return entry.value}).join('')
			} else if (item == 12) {return Intl.DateTimeFormat().format(d)
			} else if (item == 13) {
				// relatedYear, yearName
				let tmp = Intl.DateTimeFormat(localecode, {relatedYear: 'long'}).formatToParts(d)
					tmp = tmp.map(function(entry){return entry.value}).join('')
				let tmpb = Intl.DateTimeFormat(localecode, {year: 'numeric', yearName: 'long'}).formatToParts(d)
					tmpb = tmpb.map(function(entry){return entry.value}).join('')
				return tmp += ' | '+ tmpb
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
	set_isLanguageSmart() // required for BB health in get_language_locale()
	Promise.all([
		get_geo('geolocation'),
		get_language_locale(), // sets isLocaleValid/Value, isLanguagesNav
	]).then(function(){
		// add smarts if locale matches: i.e we can notate messages in FF
		if (isGecko && isSmart && 'android' !== isOS) {
			if (localesSupported[isLocaleValue] !== undefined) {isLanguageSmart = true}
		}
		Promise.all([
			get_language_system('languages_system'), // uses isLanguagesNav
			get_locale_resolvedoptions('locale_resolvedoptions'),
			get_locale_intl(),
			get_timezone('timezone_offsets'), // sets isTimeZoneValid/Value
			get_messages_validation('messages_validation'),
			get_messages_xml('messages_xml'),
		]).then(function(){
			Promise.all([
				get_timezone_offset('timezone_offset'), // might use isTimeZoneValid/Value
				get_dates(), // will use isTimeZoneValid/Value + isLocaleValid/Value
				get_messages_media('messages_media'),
			]).then(function(){
				return resolve()
			})
		})
	})
})

const outputHeaders = () => new Promise(resolve => {
	Promise.all([
		get_nav_dnt('doNotTrack'),
		get_nav_gpc('globalPrivacyControl'),
		get_nav_connection('connection'),
	]).then(function(){
		return resolve()
	})
})

set_oIntlTests()
countJS(4)
