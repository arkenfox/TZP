'use strict';

// element results always in this order: width, height, x, y
/*
 it is up to the fingerprinter to ensure custom/website css doesn't influence
 measurements. TZP uses careful site css rules and revert as a PoC - more than
 enough to ensure defaults, but trying to mitigate all possible css rules is
 prohibitive. Perhaps one method could be to create and use an iframe on demand
*/

function get_domrect(METRIC) {
	// quick exits
	let hash, data = {}
	if (!isGecko) {hash = zNA} else if ('9e6f19c5' == mini(oDomRect)) {hash = 'trustworthy'}
	if (undefined !== hash) {
		addBoth(15, METRIC, hash)
		return
	}

	let control = {
		bottom: 120.69999694824219,
		height: 141.41665649414062,
		left: -20.716659545898438,
		right: 120.69999694824219,
		top: -20.716659545898438,
		width: 141.41665649414062,
		x: -20.716659545898438,
		y: -20.716659545898438
	}

	// for each method per key in oDomRect we return either
	// error, trustworthy, or some FPing on the diffs
	// note: errors are already recorded
	sDetail[isScope][METRIC +'_data'] = {}
	let tmpdata = {}
	let countPass = 0
	for (const k of Object.keys(oDomRect).sort()) {
		sDetail[isScope][METRIC +'_data'][k] = oDomRect[k]
		let value =''
		if (zErr == k) {value = zErr
		} else if ('642e7ef0' == k) {value = 'trustworthy'; countPass = oDomRect[k]['methods'].length
		} else {
			value = zLIE
			// analyse noise
			let oDiffs = {}, aProps = [], max = 0
			let isNegative = false, isPositive = false
			let test = oDomRect[k]['data']
			for (const p of Object.keys(test)) {
				let diff = control[p] - test[p]
				if (diff > 0) {isPositive = true} else {isNegative = true}
				if (Math.abs(diff) > max) {max = Math.abs(diff)}
				if (0 !== diff) {
					aProps.push(p)
					if (undefined == oDiffs[diff]) {oDiffs[diff] = [p]} else {oDiffs[diff].push(p)}
				}
			}
			let multiples = []
			for (const m of Object.keys(oDiffs)) {
				if (oDiffs[m].length > 1) {multiples.push(oDiffs[m].join(' + '))}
			}
			//console.log(k, oDiffs, multiples, max)
			// sign: chamelon seems to always be -, CB seems to always be ±
			let sign =''
			if (isNegative && isPositive) {sign = '±'} else {
				sign = isNegative ? '-' : '+'
			}
			if (max > 0.1) {max = '> '+ sign +'0.1'
			} else {
				// note max is always positive
				var z = -Math.floor(Math.log10(max) + 1) // leading zeros
				// cap at 5: chameleon varies from 6 to 9 in a few tests
				z = z > 5 ? 5 : z
				max = '< '+ sign +'0.' + '0'.repeat(z-1) + '1'
			}
			value = {
				'properties': aProps.length == 8 ? 'all' : aProps.join(', '),
				'range': max,
				'same': (multiples.length ? multiples : 'none'),
				'total': Object.keys(oDiffs).length
			}
		}
		oDomRect[k].methods.forEach(function(method){tmpdata[method] = value})
	}
	let btnData = addButton(15, METRIC +'_data', 'data')
	for (const k of Object.keys(tmpdata).sort()) {data[k] = tmpdata[k]}
	hash = mini(data)
	let btn = addButton(15, METRIC, countPass +'/4')
	addBoth(15, METRIC, hash, btn + btnData, default_red, data)
	return
}

function get_element_keys(METRIC) {
	let t0 = nowFn()
	let list = [
		'a','audio','blockquote','button','canvas','data','datalist','del','details','dialog','dir','div',
		'font','form','geolocation','iframe','install','label','math','marquee','meter','ol','output',
		'param','pre','progress','script','slot','style','svg','template','textarea','time','title',
	]
	let list_standalone = ['base','br','embed','hr','img','input','link','meta','object','source']
	let aList = [
		'<fieldset><legend></legend></fieldset>',
		'<map><area></map>',
		'<select><optgroup><option></option></optgroup></select>',
		'<table><col><tr><td></td></tr><tbody></tbody></table>',
		'<ul><li></li></ul>',
		'<video><track></video>',
	]
	list.forEach(function(item) {aList.push('<'+ item+'></'+ item+'>')})
	list_standalone.forEach(function(item) {aList.push('<'+ item+'>')})
	let aAdditional = ['<frameset><frame></frameset>'] // you can't do these when you have a body
	let aSkip = ['colgroup'] // can't seem to block colgroup when I add a col
	let aSkipAdditional = ['body','head','html'] // no point getting these twice

	let hash, btn ='', data='', notation = isBBESR ? bb_red : ''
	let oRaw = {}
	try {
		if (runSE) {foo++}
		// LIST
		let parser = new DOMParser
		let doc = parser.parseFromString(aList.join(''), "text/html")
		let obj = doc.all // servo: obj is undefined
		for (const k of Object.keys(obj)) {
			let name = obj[k].localName
			if (!aSkip.includes(name)) {
				let keys = []
				for (const key in obj[k]) {keys.push(key)}
				oRaw[name] = {'hash': mini(keys), 'data': keys}
			}
		}
		// ADDITIONAL
		doc = parser.parseFromString(aAdditional.join(''), "text/html")
		obj = doc.all
		for (const k of Object.keys(obj)) {
			let name = obj[k].localName
			if (!aSkipAdditional.includes(name)) {
				let keys = []
				for (const key in obj[k]) {keys.push(key)}
				oRaw[name] = {'hash': mini(keys), 'data': keys}
			}
		}

		// group by hash + split array
		let oTemp = {}, oCommon = {}, oTamper = {}, oPre = {}
		let splitValue = isGecko ? 'click' : 'title' // set a baseline
		try {splitValue = oRaw.head.data[0]} catch(e) {} // lookup it up

		for (const k of Object.keys(oRaw)) {
			let key = oRaw[k].hash
			if (undefined == oTemp[key]) {
				// split
				let keys = oRaw[k].data, aPre = [], aCommon = []
				let splitUsed = splitValue
				if ('math' == k || 'svg' == k) {
					if (keys.includes('classList')) {splitUsed = 'classList' } // works on blink + gecko
				}
				let splitIndex = keys.indexOf(splitUsed)
				aPre = keys.slice(0, splitIndex) // unique stuff
				aCommon = keys.slice(splitIndex, keys.length) // common stuff
				let commonhash = mini(aCommon)
				// common tampering
				if (oCommon[commonhash] == undefined) {
					oCommon[commonhash] = aCommon
					let commonTamper = []
					aCommon.forEach(function(r) {if (r.includes(' ')) {commonTamper.push(r)}})
					if (commonTamper.length) {oTamper[commonhash] = commonTamper}
				}
				// add the commonhash to pre data
				// note: because aPre contains the commonhash, no aPre data can be alike across different commons
					// i.e two elements with the same aPre of X: one has a commonhash of C1, the other C2
					// the final aPres will always be unique: [x,C1] and [x, C2]
				aPre.push(commonhash)
				oTemp[key] = {'data': aPre, 'group': [k]}
			} else {
				oTemp[key].group.push(k)
			}
		}
		// group elements into keys
		for (const k of Object.keys(oTemp)) {
			let key = oTemp[k].group.sort()
			oPre[key.join(' ')] = oTemp[k].data
		}
		// build fingerprint
		let counter = 0
		data = {'common': {}, 'elements': {}}
		for (const k of Object.keys(oCommon).sort()) {data.common[counter +'. '+ k] = oCommon[k]; counter++}
		for (const k of Object.keys(oPre).sort()) {data.elements[k] = oPre[k]}
		hash = mini(data); btn = addButton(15, METRIC)

		// health: BB only if ESR
		if (isBBESR) {
			// we'll want hashes for standard + safer (including webgl clicked-to-play - has no effect AFAICT)
			// need to test per platform: below is windows TB/MB140 standard then safer
			if ('98024325' == hash || '2d776e74' == hash) {notation = bb_green}
		}
	} catch(e) {
		hash = e; data = zErrLog
	}

	addBoth(15, METRIC, hash, btn, notation, data)
	log_perf(15, METRIC, t0)
	return
}

function get_element_font(METRIC, isLies) {
	// https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/absolute-size
	const id = 'element-fp'
	let hash, btn ='', data = {}, method
	let aStyles = ['cursive','fangsong','fantasy','math','monospace','sans-serif','serif','system-ui']
	let aSizes = ['medium'] // everything is relative to medium: so that's all we need in _this_ test

	try {
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		let oData = {}, tmpobj = {}
		aStyles.forEach(function(style){		
			let tmpsizes = [], isFirst = aStyles[0] == style
			aSizes.forEach(function(size) {
				let isTypeCheck = isFirst && size == aSizes[0]
				// create + measure each individually as preceeding elements can affect subsequent ones
				dom[id].innerHTML = "<div style='font-size:"+ size +";' class='"+ style +"'>...</div>"
				let target = div.firstChild
				method = measureFn(target, METRIC)
				// width+height = max entropy AFAICT but lets add x and y becuz we can
				if (isTypeCheck) {
					if (undefined !== method.error) {throw method.errorstring}
					[method.width, method.height, method.x, method.y].forEach(function(item) {
						if (runST) {item = isLine ? undefined : '1'}
						let typeCheck = typeFn(item)
						if ('number' !== typeCheck) {throw zErrType + typeCheck}
					})
				}
				tmpsizes.push(method.width, method.height, method.x, method.y)
			})
			let sizehash = mini(tmpsizes)
			if (oData[sizehash] == undefined) {oData[sizehash] = {data: tmpsizes, group: [style]}
			} else {oData[sizehash].group.push(style)}
		})

		// group by styles
		for (const k of Object.keys(oData)){data[oData[k].group.join(' ')] = oData[k].data}
		let count = Object.keys(data).length
		hash = mini(data); btn = addButton(15, METRIC, count +' group'+ (count > 1 ? 's' : ''))
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn,'', data, isLies)
	return
}

function get_element_forms(METRIC, isLies) {
	let t0 = nowFn()
	let hash, btn ='', data = {}, tmpdata = {}, newobj = {}
	let oList = {
		// ignore: hidden
		// redundant: (drop 2) directory, file, files
		// redundant: (drop 9) datetime, email, month, number, password, search, tel, text, url, week
			// BUT (bring back 2) month + week differ from number-etc in blink | gecko may follow suit so keep those
		'native': {
			button: '',
			checkbox: '',
			color: '',
			date: '',
			'datetime-local': '',
			details: '<details></details>',
			'details_open': '<details open="">.</details>',
			file: '',
			image: '',
			month: '',
			number: '',
			progress: '<progress></progress>',
			radio: '',
			range: '',
			reset: '',
			select: '<select><option></option></select>',
			select_empty: '<select multiple=""><option></option></select>',
			select_empty_option: '<select multiple=""><option></option></select>',
			select_spaces: '<select multiple=""><option> &nbsp;  &nbsp;  &nbsp; </option>"</select>',
			select_spaces_option: '<select multiple=""><option> &nbsp;  &nbsp;  &nbsp; </option>"</select>',
			select_string: '<select multiple=""><option>Mōá?-&#xffff;</option></select>',
			select_string_option: '<select multiple=""><option>Mōá?-&#xffff;</option></select>',
			submit: '',
			textarea: '<textarea></textarea>',
			textarea_3x5: '<textarea cols="5" rows="3"></textarea>',
			time: '',
			week: '',
		},
		'unstyled': {
			// differ on windows
			// ToDo: check linux/mac/android
			checkbox: '',
			progress: '<progress></progress>',
			radio: '',
			select: '<select><option></option></select>',
		}
	}
	let width, height, x, y, method
	const id = 'element-fp'
	try {
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		let parent = dom[id], isFirst = true
		for (const key of Object.keys(oList)) {
			tmpdata[key] = {}, newobj[key] = {}, data[key] = {}
			for (const k of Object.keys(oList[key])) {
				// important to clear the div so no other elements can affect measurements
				parent.innerHTML =''
				parent.innerHTML = ('' == oList[key][k] ? '<input type="'+ k +'">' : oList[key][k])
				let target = parent.firstChild
				// vertical seems to create subpixels in width before transform
				target.setAttribute('style', 'display:inline; writing-mode: vertical-lr;') 
				if ('unstyled' == key) {target.classList.add('unstyled')}
				if (k.includes('_option')) {target = target.lastElementChild}
				method = measureFn(target, METRIC)
				// typecheck
				let itemdata = [method.width, method.height, method.x, method.y]
				if (isFirst) {
					isFirst = false
					if (undefined !== method.error) {throw method.errorstring}
					itemdata.forEach(function(item){
						if (runST) {item = null}
						let typeCheck = typeFn(item)
						if ('number' !== typeCheck) {throw zErrType + typeCheck}
					})
				}
				let itemhash = mini(itemdata)
				if (undefined == tmpdata[key][itemhash]) {tmpdata[key][itemhash] = {'data': itemdata, 'group': [k]}
				} else {tmpdata[key][itemhash]['group'].push(k)}
			}
		}
		// group by results
		for (const key of Object.keys(tmpdata)) {
			for (const k of Object.keys(tmpdata[key])) {newobj[key][tmpdata[key][k].group.join(' ')] = tmpdata[key][k]['data']}
		}
		for (const key of Object.keys(newobj)) {
			for (const k of Object.keys(newobj[key]).sort()) {data[key][k] = newobj[key][k]}
		}
		hash = mini(data), btn = addButton(15, METRIC)
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn,'', data, isLies)
	log_perf(15, METRIC, t0)
	return
}

function get_element_lang(METRIC, isLies) {
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/lang
	/* notes
	- this test exposes subpixels, default+available fonts/fallback-fonts per script and default script sizes
	- it does not expose language or locale changes: except in blink setting the UI language alters at least
		system-ui, but that's equivalency of navigator (the language is added to navigator.languages)
	- we will expose locale/lang in a different test that uses chars per script
	*/
	/*
	perf: absolutely horrible
	- FF cold: 125 134 134 136
	- FF cold with mono/serif/sans hardcoded into the html: 61 72 62 59 63
	- reruns: ~35ms
	ToDo: can we reduce the tests, even per platform or browser
	- e.g. chrome has a lot of lang redundancy on windows (and I don't see any way to change settings)
		blink windows: group "bn bo cr en gez gu he hy ka km kn ml my or pa si ta te th x-math" seems inevitable
	*/
	let t0 = nowFn()
	const id = 'element-fp'
	let hash, btn ='', data = {}, method
	let aLang = [
		// one of each script (from default script sizes)
		'ar','bn','bo','cr','el','en','gez','gu','he','hi','hy','ja','ka','km','kn','ko',
		'ml','my','or','pa','ru','si','ta','te','th','x-math','zh-CN','zh-HK','zh-TW',
	]
	// sizes: ignore
		// 'default': we already know default generic-family - see font_sizes_base
		// 'emoji' : we not actually testing any emojis so this == default
		// 'ui-monospace','ui-rounded','ui-sans-serif','ui-serif': not supported yet
	let aStyles = ['cursive','fangsong','fantasy','math','monospace','sans-serif','serif','system-ui']
	let aSizes = ['xxx-large']
	let oTweaks = {
		'km': ['small','xxx-large',], // win TB
		'te': ['small','xxx-large',], // win TB
		'zh-HK': ['small','xxx-large',], // win
		'zh-TW': ['small','xxx-large',], // win
	}

	try {
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		let oData = {}, newobj = {}
		// collect
		aLang.forEach(function(lang) {
			let tmpobj = {}
			aStyles.forEach(function(style){
				let tmpsizes = []
				let arraySizes = undefined == oTweaks[lang] ? aSizes : oTweaks[lang]
				let isOneSize = arraySizes.length == 1
				arraySizes.forEach(function(size) {
					// create + measure each individually as preceeding elements can affect subsequent ones
					dom[id].innerHTML = "<div lang='"+ lang +"' style='font-size:"+ size +";' class='"+ style +"'>...</div>"
					let target = dom[id].firstChild
					method = measureFn(target, METRIC)
					if (isOneSize) {
						tmpsizes.push(method.width, method.height, method.x, method.y)
					} else {
						tmpsizes.push([method.width, method.height, method.x, method.y])
					}
				})
				tmpobj[style] = tmpsizes
			})
			// group lang hash
			let langhash = mini(tmpobj) +' '
			if (undefined == newobj[langhash]) {
				// group style hash
				let styleobj = {}
				for (const s of Object.keys(tmpobj)) {
					let stylehash = mini(tmpobj[s]) +' '
					if (undefined == styleobj[stylehash]) {
						styleobj[stylehash] = {'data': tmpobj[s], 'group': [s]}
					} else {
						styleobj[stylehash].group.push(s)
					}
				}
				newobj[langhash] = {'data': styleobj, 'group': [lang]}
			} else {
				newobj[langhash].group.push(lang)
			}
		})
		// group by lang then styles
		for (const k of Object.keys(newobj)) {
			let key = newobj[k].group.join(' '), tmpobj = {}
			for (const s of Object.keys(newobj[k].data)) {
				tmpobj[newobj[k].data[s].group.join(' ')] = newobj[k].data[s].data
			}
			data[key] = tmpobj
		}
		hash = mini(data); btn = addButton(15, METRIC) +' ['+ (nowFn()-t0).toFixed(0) +' ms]'
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn,'', data, isLies)
	log_perf(15, METRIC, t0)
	return
}

function get_element_mathml(METRIC, isLies) {
	let t0 = nowFn()
	const id = 'element-fp'
	const sizetype = 'px', sizes = [33,99,111], sizectl = sizes[0]
	let hash, btn ='', data = {}, notation = isBB ? bb_slider_red : ''
	try {
		// create element
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)

 		let divcontrol = "<div id='mathmldivctrl' style='font-size: "
			+ sizectl + sizetype +";'>x=−b ±b2−4 ac 2a</div>"
		let mathmlstr = "<math><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo form='prefix'>&minus;</mo>"
		+"<mi>b</mi><mo>&PlusMinus;</mo><msqrt><msup><mi>b</mi><mn>2</mn></msup><mo>&minus;</mo><mn>4</mn>"
		+"<mo>&InvisibleTimes;</mo><mi>a</mi><mo>&InvisibleTimes;</mo><mi>c</mi></msqrt></mrow>"
		+"<mrow><mn>2</mn><mo>&InvisibleTimes;</mo><mi>a</mi></mrow></mfrac></mrow></math>"
		let divcontent =''
		sizes.forEach(function(size) {
			divcontent += "<div id='mathmldiv"+ size +"' style='font-size:"
			+ size + sizetype +";'><span id='mathmlspan"+ size +"'>"+ mathmlstr +"</span></div>"
		})
		doc.getElementById(id).innerHTML = divcontrol + divcontent

		// measure
		let control, width, height, methodW, methodH
		let targetC = dom['mathmldivctrl'], targetH, targetW
		let isDiff, wType, hType
		sizes.forEach(function(size) {
			targetH = dom['mathmldiv'+size]; targetW = dom['mathmlspan'+size]
			let isCtrlSize = size == sizectl
			size = size + sizetype

			// get div height and span width
			methodH = measureFn(targetH, METRIC)
			methodW = measureFn(targetW, METRIC)
			width = methodW.width
			height = methodH.height

			// one time: first elment + size
				// get a control size (for diffs) to detemine if mathml is enabled
			if (isCtrlSize) {
				methodH = measureFn(targetC, METRIC)
				control = methodH.height
				if (undefined !== methodH.error) {throw methodH.errorstring}
				if (undefined !== methodH.error) {throw methodH.errorstring}
				if (undefined !== methodW.error) {throw methodW.errorstring}
				// first item check/diff
				if (runST) {width = {}, height = ' '}
				wType = typeFn(width); hType = typeFn(height)
				if ('number' !== wType || 'number' !== hType) {
					throw zErrType + (wType == hType ? wType : wType +' x '+ hType)
				}
				isDiff = height - control
			}
			data[size] = [width, height]
		})
		let displayEnabled =''
		let isEnabled = Math.abs(isDiff) > 0.001
		if (!isSmart || !isLies) {
			data['enabled'] = isEnabled
			displayEnabled = ' ['+ (isEnabled ? zE : zD) +']'
		}
		if (isBB) {notation = isEnabled ? bb_standard : bb_safer}
		hash = mini(data); btn = addButton(15, METRIC) + displayEnabled
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn, notation, data, isLies)
	log_perf(15, METRIC, t0)
	return
}

function get_element_other(METRIC, isLies) {
	/* NOTE
	TZP uses isDomRect, the default being 0 (element.getBoundingClientRect). When
	falling back to other domrect methods, some differences can occur (per engine)
	- e.g. gecko: audio + sometimes marquee measure differently with 2
	- e.g. blink: q measures differently if 1 or 3
	- e.g. servo: as of June 2026: everything mismatches
	Ideally this wouldn't happen, but ultimately it is equivalency of isDomRect
	Currently only gecko usews isDomRect for fallback

	Additionally, some elements (per engine) require display:inline otherwise errors and/or
	measurement	differences can occur

	They could all likely be inline (marquee can be weird) but being selective allows us
	to generate more unique individual measuremments and unique elements, without artificially
	creating more uniqueness - and/or to generate measuremeants with lots of decimal places
	- e.g. figure, hr, marquee... were already uniquely sized elements
	*/

	let t0 = nowFn()
	let hash, btn ='', data = {}

	// note: some elements we insert character(s) (var eStr) to a) force a height
	// or b) for unique measurements without a char to get more precision/decimal places
	// always use the same char
	let eStr = '.'
	let oSpecial = {
		// resets to parent.firstChild | then if an integer, selects that child item
		'hgroup': '', // revert to parent first child
	}

	let oList = {
		// AFAICT audio/video, canvas, iframe + img don't respect writing-mode
		// use horizontal by default: less work (adding attributes)
		'horizontal' : {
			a: '<a href="">'+ eStr +'</a>',
			audio: '<audio controls=""></audio>',
			big_x2: '<big><big>'+ eStr +'</big></big>',
			big_x3: '<big><big><big>'+ eStr +'</big></big></big>',
			br: '<br>',
			canvas: '<canvas></canvas>',
			caption: '<table><caption style="display:inline;">'+ eStr +'</caption></table>',
			dt: '<dl><dt>'+ eStr +'</dt></dl>',
			fieldset: '<fieldset></fieldset>',
			figure: '<figure style="display:inline;"></figure>',
			hgroup: '<hgroup><h1>.</h1><p class="revert">.</p></hgroup>', // code doesn't revert 2nd child so hardcode it
			hr: '<hr style="display:inline;">',
			iframe: '<iframe>'+ eStr +'</iframe>',
			img: '<img>', // unique on android
			legend: '<fieldset><legend>'+ eStr +'</legend></fieldset>',
			marquee: '<marquee style="width:20px; height:20px;">'+ eStr +'</marquee>',
				// marquee requires a size constrain else it changes with inner window sizes
			menu_li: '<menu>'+ eStr +'<li></li></menu>',
			meter: '<meter></meter>',
			rtc: '<ruby><rtc>'+ eStr +'</rtc></ruby>',
			search: '<search></search>',
			td: '<table><tr><td></td></tr></table>',
			tfoot: '<table><tfoot></tfoot></table>',
			ol_li: '<ol><li>'+ eStr +'</li></ol>',
			ul_li: '<ul><li>'+ eStr +'</li></ul>',
		},
		// these verticals should/could add more more unique individual measurements [1]: depends on scaling
		// [1] more could expose greater rendering/subpixel entropy
		'vertical' : {
			dd: '<dl><dd>'+ eStr +'</dd></dl>',
			dialog: '<dialog open=""></dialog>',
			figcaption: '<figure><figcaption>'+ eStr +'</figcaption></figure>',
			li: '<ul><li></li></ul>',
			object: '<object>',
			optgroup: '<optgroup></optgroup>',
			plaintext: '<plaintext style="display:inline;">',
			rb: '<ruby><rb>'+ eStr +'</rb></ruby>',
			rt: '<ruby><rt>'+ eStr +'</rt></ruby>',
			summary: '<details><summary>'+ eStr +'</summary></details>',
			//'error': '<frame></frame>' // test error
		}
	}

	let aHorizontalAdd = ['article','b','big','blockquote','code','h1','h2','h3','h4','h5','h6','i','q','small','sub','ul']
	aHorizontalAdd.forEach(function(item){oList['horizontal'][item] = '<'+item+'>'+ eStr +'</'+item+'>'})
	let aVerticalAdd = ['dl','option','pre','sup']
	aVerticalAdd.forEach(function(item){oList['vertical'][item] = '<'+item+'>'+ eStr +'</'+item+'>'})
	//console.log(oList)

	let setIndividual = new Set() // individual measurements from x,y,width,height
	let setMeasure = new Set() // sets of x,y,width + height

	let width, height, x, y, method, tmpdata = {}
	const id = 'element-fp'
	try {
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		let parent = dom[id], isFirst = true
		for (const s of Object.keys(oList).sort()) {
			let itemdata
			tmpdata[s] = {}
			for (const k of Object.keys(oList[s]).sort()) {
				// set parent, determine target to measure and as we walk
				// the children, ensure no other css affects any element
				parent.innerHTML = oList[s][k]
				try {
					let target = parent.firstChild
					// revert everything
					for (let i = 0; i < 10; i++) {
						target.classList.add('revert')
						let newtarget = target.children[0]
						if (undefined == newtarget) {break}
						target = newtarget
					}
					// amend target
					if (undefined !== oSpecial[k]) {
						let intTarget = oSpecial[k]; target = parent.firstChild
						if (Number.isInteger(intTarget)) {target = target.children[intTarget]}
					}
					// add writing-mode: ignore horizontal
					if ('vertical' == s) {target.style.setProperty('writing-mode', 'vertical-lr')}
					method = measureFn(target, METRIC)
					// typecheck
					itemdata = [method.width, method.height, method.x, method.y]
					if (isFirst) {
						isFirst = false
						if (undefined !== method.error) {throw method.errorstring}
						itemdata.forEach(function(item){
							if (runST) {item = null}
							let typeCheck = typeFn(item)
							if ('number' !== typeCheck) {throw zErrType + typeCheck}
						})
					}
				} catch(e) {
					itemdata = zErr
					log_error(15, METRIC +'_'+k, e)
				}
				let itemhash = mini(itemdata)
				if (undefined == tmpdata[s][itemhash]) {
					tmpdata[s][itemhash] = {'data': itemdata, 'group': [k]}
					// uniqueness
					if (itemdata !== zErr) {
						itemdata.forEach(function(num) {setIndividual.add(num)})
						setMeasure.add(itemhash)
					}
				} else {tmpdata[s][itemhash]['group'].push(k)}
			}
		}
		// group by results
		let newobj = {}
		for (const s of Object.keys(tmpdata)) {
			newobj[s] = {}
			for (const k of Object.keys(tmpdata[s])) {
				let keydata = tmpdata[s][k].group.sort()
				newobj[s][keydata.join(' ')] = tmpdata[s][k]['data']
			}
		}
		let uniqueTests = 0, totalTests = 0
		for (const s of Object.keys(newobj)) {
			data[s] = {}
			for (const k of Object.keys(newobj[s]).sort()) {data[s][k] = newobj[s][k]}
			totalTests += Object.keys(oList[s]).length
			uniqueTests += Object.keys(data[s]).length
		}
		let btnStr = setIndividual.size +'/'+ (setMeasure.size * 4)
		let percentage = (setIndividual.size/(setMeasure.size * 4)) * 100
		let extraStr = ' ['+ percentage.toFixed(1) +'% | '+ setMeasure.size +'/'+ uniqueTests +'/'+ totalTests +']'
		hash = mini(data); btn = addButton(15, METRIC, btnStr) + extraStr
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn,'', data, isLies)
	log_perf(15, METRIC, t0)
	return
}

function get_element_scrollbars(METRIC, isLies) {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1786665
		// ui.useOverlayScrollbars: 0 = yes, 1 = no
		// widget.non-native-theme.scrollbar.size.override <-- non-overlay only in css pixels at full zoom (default 0)
			// this bypasses TB and changes auto + thin
		// widget.non-native-theme.scrollbar.style = values 0 to 5 (default, mac, gtk, android, win10, win11)
			// values 1,2,3 bypass TB and change both sizes
		// layout.css.scrollbar-width-thin.disabled = true
			// this bypasses TB and changes thin to match auto
		// widget.non-native-theme.win.scrollbar.use-system-size = boolean

	// FF143+ layout.testing.scrollbars.always-hidden has no effect on measurements
		// maybe it only affects the viewport?
	let oData = {'auto': {}, 'thin': {}}, oDataW = {'auto': {}, 'thin': {}}
	let aAuto = [], aThin = []
	let list = ['auto','thin']
	let element

	function get_scroll(type ='') {
		list.forEach(function(p) {
			// element
			let value, item = 'element'
			try {
				element.style['scrollbar-width'] = p
				let target = element.children[0]
				let width, method
				method = measureFn(target, METRIC)
				if (undefined !== method.error) {throw method.errorstring}
				width = method.width
				if (runST) {width = NaN} else if (runSI) {width = 101}
				let typeCheck = typeFn(width)
				if ('number' !== typeCheck) {throw zErrType + typeCheck}
				value = 100 - width // 100 set in html, not affected by zoom
				if (value < 0) {throw zErrInvalid + '< 0'}
				// get scrollbar width for json overlay
				if (undefined == isScrollbar && 'auto' == p) {isScrollbar = value}
			} catch(e) {
				value = zErr
				log_error(15, METRIC +'_'+ p +'_'+ type + item, e)
			}
			let fpvalue = value
			if (isLies && zErr !== value) {
				value = log_known(15, METRIC +'_'+ p +'_'+ type + item, value)
				fpvalue = zLIE
			}
			if ('' == type) {oData[p][item] = fpvalue} else {oDataW[p][item] = fpvalue}
			if ('auto' == p) {aAuto.push(value)} else {aThin.push(value)}

			// scrollWidth
			value = undefined, item = 'scrollWidth'
			try {
				element.style['scrollbar-width'] = p
				value = 100 - element.scrollWidth
				if (runST) {value = NaN} else if (runSI) {value = -1}
				let typeCheck = typeFn(value)
				if ('number' !== typeCheck) {throw zErrType + typeCheck}
				if (value < 0) {throw zErrInvalid + '< 0'}
				// get scrollbar width for json overlay
				if (undefined == isScrollbar && 'auto' == p) {isScrollbar = value}
			} catch(e) {
				value = zErr
				log_error(15, METRIC +'_'+ p +'_'+ type + item, e)
			}
			if ('' == type) {oData[p][item] = value} else {oDataW[p][item] = value}
			if ('auto' == p) {aAuto.push(value)} else {aThin.push(value)}
		})
	}

	try {
		element = dom.tzpScroll
		element.classList.remove('tzpScrollbar')
		get_scroll()
		if (undefined == isScrollbar) {isScrollbar = 20}

		// FF151: 1977511 layout.css.fake-webkit-scrollbar.enabled | FF153+: 2038877 default true
		// https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-scrollbar
		element.classList.add('tzpScrollbar')
		get_scroll('webkit_')
		// add webkit if not identical to default
		if (mini(oData) !== mini(oDataW)) {
			for (const p of Object.keys(oDataW)) {
				for (const k of Object.keys(oDataW[p])) {oData[p]['webkit_'+ k] = oDataW[p][k]}
			}
		}
		// not quite how I should display mixed results but it's only a display: without fuckery it should be just fine
		addDisplay(15, METRIC, dedupeArray(aAuto, true) +' | '+ dedupeArray(aThin, true))
		addData(15, METRIC, oData, mini(oData))
		return
	} catch(e) {
		addBoth(15, METRIC, log_error(15, METRIC, e))
		return
	}
}

const outputElements = () => new Promise(resolve => {
	if (gRun && sectionIgnore.includes('elements')) {return resolve()}

	let isLies = isDomRect == -1
	Promise.all([
		get_domrect('domrect'),
		get_element_font('element_font', isLies),
		get_element_keys('element_keys'),
		get_element_forms('element_forms', isLies),
		get_element_mathml('element_mathml', isLies),
		get_element_other('element_other', isLies),
		get_element_scrollbars('element_scrollbars', isLies),
		get_element_lang('element_lang', isLies),
	]).then(function(){
		return resolve()
	})
})

countJS(15)
