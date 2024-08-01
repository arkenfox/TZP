'use strict';

function get_element_keys(METRIC) {
	const id = 'html-element-version'
	let hash, btn ='', data = [], notation = isTB ? tb_red : '', isLies = false
	try {
		if (runSE) {foo++}
		const element = document.createElement('a')
		element.setAttribute('id', id)
		document.body.appendChild(element)
		let htmlElement = dom[id]
		for (const key in htmlElement) {data.push(key)}
		hash = mini(data); btn = addButton(15, METRIC, data.length)
		// cydec: changes order, removes some keys
			// ToDo: use post constructor when we enumerate all elements
		const aExpected = ['scrollWidth','scrollHeight','clientWidth','clientHeight']
		if ((data.reduce((a, c) => a + aExpected.includes(c), 0)) < aExpected.length) {isLies = true}
		if (isTB) {
			if ('android' == isOS) {
				// still awaiting android isTB
			} else {
				// desktop
				if (115 == isVer && '156e1033' == hash || 128 == isVer && 'eb81553d' == hash) {notation = tb_green}
			}
		}
	} catch (e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn, notation, data, isLies)
	return
}

function get_lineheight(METRIC) {
	let t0 = nowFn()
	const id = `lh-fp`, sizetype = 'px',
		sizes = [2.9, 3.9, 4.9, 159.9, 201.9, 333.9],
		fonts = ['cursive','emoji','fangsong','fantasy','monospace','sans-serif','serif','system-ui']
		// ToDo: fonts: e.g. 'ui-serif' = serif so far, so redundant
	let hash, btn ='', data = {}
	try {
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		div.classList.add('measure')

		let oLine = {}, tmpobj = {}
		fonts.forEach(function(family) {
			let tmpsizes = {}, isFirst = family == fonts[0]
			sizes.forEach(function(size) {
				let isTypeCheck = isFirst && size == sizes[0]
				size += sizetype
				// create + measure each individually as preceeding elements can affect subsequent ones
				dom[id].innerHTML = "<div style='font-size:"+ size +";' id='lhtarget' class='measureScale "+ family +"'>.</div>"
				let height, target = dom.lhtarget
				if (isDomRect < 1) {height = target.getBoundingClientRect().height
				} else if (isDomRect == 1) {height = target.getClientRects()[0].height
				} else {
					let range = document.createRange()
					range.selectNode(target)
					if (isDomRect == 2) {height = range.getBoundingClientRect().height
					} else if (isDomRect > 2) {height = range.getClientRects()[0].height}
				}
				if (isTypeCheck) {
					if (runST) {height = '16'}
					let typeCheck = typeFn(height)
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
				}
				tmpsizes[size] = height
			})
			let sizehash = mini(tmpsizes)
			if (oLine[sizehash] == undefined) {oLine[sizehash] = {data: tmpsizes, group: [family]}
			} else {oLine[sizehash].group.push(family)}
		})
		// sort
		for (const k of Object.keys(oLine)){tmpobj[oLine[k].group.join(' ')] = oLine[k].data}
		for (const k of Object.keys(tmpobj).sort()) {data[k] = tmpobj[k]}
		let count = Object.keys(data).length
		hash = mini(data); btn = addButton(15, METRIC, count +' group'+ (count > 1 ? 's' : ''))
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn,'', data, (isDomRect == -1))
	log_perf(15, METRIC, t0)
	return
}

function get_mathml(METRIC) {
	let t0 = nowFn()
	const id = `mathml-fp`, sizetype = 'px', sizes = [33,99,111], sizectl = sizes[0]
	let hash, btn ='', data = {}, notation = isTB ? tb_slider_red : '', isLies = isDomRect == -1
	try {
		// create element
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		div.classList.add('measure')
		div.style.fontFamily = 'none'
 		let divcontrol = "<div id='mathmldivctrl' style='font-size: "
			+ sizectl + sizetype +";' class='measureScale'>x=−b ±b2−4 ac 2a</div>"
		let mathmlstr = "<math><mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo form='prefix'>&minus;</mo>"
		+"<mi>b</mi><mo>&PlusMinus;</mo><msqrt><msup><mi>b</mi><mn>2</mn></msup><mo>&minus;</mo><mn>4</mn>"
		+"<mo>&InvisibleTimes;</mo><mi>a</mi><mo>&InvisibleTimes;</mo><mi>c</mi></msqrt></mrow>"
		+"<mrow><mn>2</mn><mo>&InvisibleTimes;</mo><mi>a</mi></mrow></mfrac></mrow></math>"
		let divcontent =''
		sizes.forEach(function(size) {
			divcontent += "<div id='mathmldiv"+ size +"' class='measureScale' style='font-size:"
			+ size + sizetype +";'><span id='mathmlspan"+ size +"'>"+ mathmlstr +"</span></div>"
		})
		doc.getElementById(id).innerHTML = divcontrol + divcontent

		// measure
		let control, width, height
		let rangeC,	rangeW, rangeH
		let targetC = dom['mathmldivctrl'], targetH, targetW
		let isDiff, wType, hType
		sizes.forEach(function(size) {
			targetH = dom['mathmldiv'+size]; targetW = dom['mathmlspan'+size]
			let isCtrlSize = size == sizectl
			size = size + sizetype
			if (isDomRect > 1) {
				// test
				rangeH = document.createRange()
				rangeH.selectNode(targetH)
				rangeW = document.createRange()
				rangeW.selectNode(targetW)
				// control
				if (isCtrlSize) {
					rangeC = document.createRange()
					rangeC.selectNode(targetC)
				}
			}
			if (isDomRect < 1) { // get a result regardless
				if (isCtrlSize) {control = targetC.getBoundingClientRect().height}
				height = targetH.getBoundingClientRect().height
				width = targetW.getBoundingClientRect().width
			} else if (isDomRect == 1) {
				if (isCtrlSize) {control = targetC.getClientRects()[0].height}
				height = targetH.getClientRects()[0].height
				width = targetW.getClientRects()[0].width
			} else if (isDomRect == 2) {
				if (isCtrlSize) {control = targetC.getBoundingClientRect().height}
				height = rangeH.getBoundingClientRect().height
				width = rangeW.getBoundingClientRect().width
			} else if (isDomRect > 2) {
				if (isCtrlSize) {control = targetC.getClientRects()[0].height}
				height = rangeH.getClientRects()[0].height
				width = rangeW.getClientRects()[0].width
			}
			// first item check/diff
			if (isCtrlSize) {
				if (runST) {width = {}, height = ' '}
				wType = typeFn(width); hType = typeFn(height)
				if ('number' !== wType || 'number' !== hType) {
					throw zErrType + (wType == hType ? wType : wType +' x '+ hType)
				}
				isDiff = height - control
			}
			data[size] = [width, height]
		})
		removeElementFn(id)
		let displayEnabled =''
		let isEnabled = Math.abs(isDiff) > 0.001
		if (!isSmart || !isLies) {
			data['enabled'] = isEnabled
			displayEnabled = ' ['+ (isEnabled ? zE : zD) +']'
		}
		if (isTB) {notation = isEnabled ? tb_standard : tb_safer}
		hash = mini(data); btn = addButton(15, METRIC) + displayEnabled
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn, notation, data, isLies)
	log_perf(15, METRIC, t0)
	return
}

function get_widget_sizes(METRIC) {
	let t0 = nowFn()
	let hash, btn ='', data = {}, tmpdata = {}, newobj = {}
	const id = 'form-fp'
	let oList = {
		button: '',
		checkbox: '',
		checkbox_unstyled: '<input type="checkbox">',
		color: '',
		date: '',
		"datetime-local": '',
		details: '<details></details>',
		directory: '<input webkitdirectory directory type="file">',
		file: '',
		files: '<input multiple="" type="file">',
		image: '',
		number: '',
		radio: '',
		radio_unstyled: '<input type="radio">',
		reset: '',
		select: '<select><option></option></select>',
		select_empty: '<select multiple=""><option></option></select>',
		select_empty_option: '<select multiple=""><option></option></select>',
		select_spaces: '<select multiple=""><option> &nbsp;  &nbsp;  &nbsp; </option>"</select>',
		select_spaces_option: '<select multiple=""><option> &nbsp;  &nbsp;  &nbsp; </option>"</select>',
		select_string: '<select multiple=""><option>Mōá?-&#xffff;</option></select>',
		select_string_option: '<select multiple=""><option>Mōá?-&#xffff;</option></select>',
		select_unstyled: '<select><option></option></select>',
		submit: '',
		time: '',
	}
	let width, height, x, y, range, method
	try {
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		div.classList.add('measure')
		div.classList.add("measureScale")
		let parent = dom[id]
		for (const k of Object.keys(oList)) {
			// important to clear the div so no other elements can affect measurements
			parent.innerHTML = ""
			try {
				parent.innerHTML = ('' == oList[k] ? '<input type="'+ k +'">' : oList[k])
				let target = parent.firstChild
				// vertical seems to create subpixels in width before transform
				target.setAttribute("style","display:inline; writing-mode: vertical-lr;") 
				if (k.includes('_unstyled')) {target.classList.add('unstyled')}
				if (k.includes('_option')) {target = target.lastElementChild}
				// method
				if (isDomRect > 1) {range = document.createRange(); range.selectNode(target)}
				if (isDomRect < 1) {method = target.getBoundingClientRect() // get a result regardless
				} else if (isDomRect == 1) {method = target.getClientRects()[0]
				} else if (isDomRect == 2) {method = range.getBoundingClientRect()
				} else if (isDomRect > 2) {method = range.getClientRects()[0]
				}
				let itemdata = [method.width, method.height, method.x, method.y]
				let itemhash = mini(itemdata)
				if (undefined == tmpdata[itemhash]) {tmpdata[itemhash] = {'data': itemdata, 'group': [k]}
				} else {tmpdata[itemhash]['group'].push(k)}
			} catch(e) {
				newobj[k] = zErr
				log_error(15, METRIC +'_'+ k, e)
			}
		}
		// group by results
		let groupdata = {}
		for (const k of Object.keys(tmpdata)) {newobj[tmpdata[k].group.join(' ')] = tmpdata[k]['data']}
		for (const k of Object.keys(newobj).sort()) {data[k] = newobj[k]}
		hash = mini(data), btn = addButton(15, METRIC)
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(15, METRIC, hash, btn,'', data, (isDomRect == -1))
	log_perf(15, METRIC, t0)
	return
}

const outputElements = () => new Promise(resolve => {
	Promise.all([
		get_element_keys('htmlelement_keys'),
		get_lineheight('line-height_sizes'),
		get_mathml('mathml_sizes'),
		get_widget_sizes('widget_sizes'),
	]).then(function(){
		return resolve()
	})
})

countJS(15)
