'use strict';

function getDynamicIframeWindow({
	context,
	source ='',
	test ='',
	contentWindow = false,
	nestIframeInContainerDiv = false,
	violateSOP = true, // SameOriginPolicy
	display = false
}) {
	try {
		if (runSE) {foo++}
		const elementName = nestIframeInContainerDiv ? 'div' : 'iframe'
		const length = context.length
		const element = document.createElement(elementName)
		document.body.appendChild(element)
		if (!display) {
			element.setAttribute('style', 'display:none')
		}
		if (nestIframeInContainerDiv) {
		const attributes = `
			${source ? `src=${source}` : ''}
				${violateSOP ? '' : `sandbox="allow-same-origin"`}
			`
			element.innerHTML = `<iframe ${attributes}></iframe>`
		} else if (!violateSOP) {
			element.setAttribute('sandbox', 'allow-same-origin')
			if (source) {
				element.setAttribute('src', source)
			}
		} else if (source) {
			element.setAttribute('src', source)
		}
		const iframeWindow = contentWindow ? element.contentWindow : context[length]
		let data = {}, r
		if ('agent' == test) {
			let navigator = iframeWindow.navigator
			let list = ['appCodeName','appName','appVersion','buildID','oscpu',
				'platform','product','productSub','userAgent','vendor','vendorSub']
			list.forEach(function(p) {
				try {
					r = navigator[p]
					let typeCheck = typeFn(r, true), expectedType = 'string'
					if (!isGecko) {
						// type check will throw an error for a string "undefined"
						if ('buildID' == p || 'oscpu' == p) {expectedType = 'undefined'}
					}
					if (expectedType !== typeCheck) {throw zErr}
					if ('' == r) {r = 'empty string'}
				} catch(e) {
					r = e
				}
				data[p] = r+''
			})
		}
		document.body.removeChild(element)
		return {'data': data, 'hash': mini(data)}
	} catch(e) {
		return e+''
	}
}

function get_agent_iframes(log = false) {
	// runs post FP
	let t0 = nowFn()

	let aNames = ['content_docroot', 'content_with_url', 'window_docroot',
		'window_with_url', 'iframe_access', 'nested', 'window_access']

	let METRIC = 'agent'
	// get data
	Promise.all([
		getDynamicIframeWindow({context: window, contentWindow: true, violateSOP: false, test: METRIC}), // docroot contentWindow
		getDynamicIframeWindow({context: window, contentWindow: true, source: '?', violateSOP: false, test: METRIC}), // with URL contentWindow
		getDynamicIframeWindow({context: window, violateSOP: false, test: METRIC}), // docroot
		getDynamicIframeWindow({context: window, source: '?', violateSOP: false, test: METRIC}), // with URL
		getDynamicIframeWindow({context: frames, test: METRIC}), // iframe access
		getDynamicIframeWindow({context: window, nestIframeInContainerDiv: true, test: METRIC}), // nested
		getDynamicIframeWindow({context: window, test: METRIC}), // window access
	]).then(function(results){
		const ctrlHash = mini(sDetail.document.agent_reported)
		/* test some errors
		results[0] = 'i am not groot'
		results[2] = 'i am groot'
		//*/
		/* test some different hashes
		results[4].data.appCodeName = 'Godzilla'
		let tmpHash = mini(results[4].data)
		results[4].hash = tmpHash
		results[6].data.appName = 'Navigator'
		tmpHash = mini(results[6].data)
		results[6].hash = tmpHash
		//*/

		let oData = {}, oDisplay = {}, oHashes = {}, countErrors = 0
		for (let i=0; i < results.length; i++) {
			let item = results[i]
			let name = 'agent_'+ aNames[i]
			if ('string' == typeof item) {
				dom[name].innerHTML = item
				countErrors++
			} else {
				if (oHashes[item.hash] == undefined) {
					oHashes[item.hash] = {'group': [name], 'data': item.data}
				} else {
					oHashes[item.hash]['group'].push(name)
				}
			}
		}

		let summary ='', btn ='', errString =''
		if (countErrors > 0 && countErrors < results.length) {
			errString += " <span class='s2'>["+ countErrors +' error'+ (countErrors > 1 ? 's' : '') +']</span>'+ sc
		}
		if (countErrors == results.length) {
			// all errors
			summary = zErr
		} else if (Object.keys(oHashes).length == 1) {
			// single hash
			let singleHash, notation = match_green
			for (const k of Object.keys(oHashes)) {
				singleHash = k
				if (k !== ctrlHash) {
					notation = match_red
					btn = addButton(2, 'agent_iframe', 'details', 'btnc', zIFRAME)
					addDetail('agent_iframe', oHashes[k].data, zIFRAME)
				}
				let items = oHashes[k].group
				items.forEach(function(item) {oDisplay[item] = k})
			}
			summary = singleHash + btn + notation
		} else {
			// multiple hashes
			for (const k of Object.keys(oHashes)) {
				let items = oHashes[k].group
				for (let i=0; i < items.length; i++) {
					// reset
					btn = ''
					let name = items[i]
					// 1st of each non-match: add details
					if (i == 0 && k !== ctrlHash) {
						btn = addButton(2, name, 'details', 'btnc', zIFRAME)
						addDetail(name, oHashes[k].data, zIFRAME)
					}
					oDisplay[name] = k + btn
				}
				summary = 'mixed'+ match_red
			}
		}
		for (const k of Object.keys(oDisplay)) {dom[k].innerHTML = oDisplay[k]}
		dom.uaIframes.innerHTML = summary + errString
		if (log) {log_perf(SECTNF, 'agent iframes', t0)}
	})
}

countJS('iframes')
