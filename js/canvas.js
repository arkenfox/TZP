'use strict';

/* outputCanvas() based on https://canvasblocker.kkapsner.de/test/ */

function check_canvas_to(data) {
	// only called if per-execution
	let len = data.length
	if (![166,170,174,178].includes(len)) {return false}
	let slice1 = data.slice(72,80)
	if ('lEQVQoU2' == slice1) {
		let	slice2 = data.slice(data.length - 10, data.length)
		if ('VORK5CYII=' == slice2 || '5ErkJggg==' == slice2  || 'lFTkSuQmCC' == slice2) {
			return true // RFP
		}
	}
	return false
}

const outputCanvas = () => new Promise(resolve => {
	let t0 = nowFn()
	let aStart = {}

	const sizeW = 16, sizeH = 8, pixelcount = sizeW * sizeH, allZeros = '93bd94c5'
	// FF95+: compression changes 1724331 / 1737038 
	const oKnown = {
		'isPointInPath': 'db0e3f08',
		'isPointInStroke': 'a77e328a',
		'toBlob': '3afc375a',
		'toBlob_solid': '56ea6104',
		'toDataURL': '3afc375a',
		'toDataURL_solid': '56ea6104',
	}
	let isCanvasGet = '', isCanvasGetChannels = '', isGetStealth = false

	function check_canvas_get(data, runNo) {
		let isMatch = mini(dataDrawn) == mini(data)
		// run1 return if a match or not
		if (runNo == 1) {return isMatch}
		// run2 quick exit: return skip if nothing to do
		if (isMatch) {return 'skip'}

		// run2 otherwise return if RFP-like and create strings
		let aDrawn = [], aRead = [], indexChanged = []
		let altP = 0, altR = 0, altG = 0, altB = 0, altA = 0, altAll = 0
		for (let x=0; x < pixelcount; x++) {
			let k = x * 4
			aDrawn = dataDrawn.slice(k, k+4)
			aRead = data.slice(k, k+4)
			if (aDrawn.join() !== aRead.join()) { // pixels
				altP++
				indexChanged.push(k)
			}
			if (aDrawn[0] !== aRead[0]) { altR++} // channels
			if (aDrawn[1] !== aRead[1]) { altG++}
			if (aDrawn[2] !== aRead[2]) { altB++}
			if (aDrawn[3] !== aRead[3]) { altA++}
			// ToDo: range: worth it?
		}
		// stealth check: anything in changed not in font
		let aNotInFonts = indexChanged.filter(x => !indexFont.includes(x))
		isGetStealth = aNotInFonts.length == 0

		// noise FP
		let strFP = '', aNote = []
		aNote.push('p'+ Math.floor((altP / pixelcount) * 100))
		if (altR > 0) {strFP += 'r'; aNote.push('r'+Math.floor((altR / pixelcount) * 100))}
		if (altG > 0) {strFP += 'g'; aNote.push('g'+ Math.floor((altG / pixelcount) * 100))}
		if (altB > 0) {strFP += 'b'; aNote.push('b'+ Math.floor((altB / pixelcount) * 100))}
		if (altA > 0) {strFP += 'a'; aNote.push('a'+ Math.floor((altA / pixelcount) * 100))}
		isCanvasGetChannels = (isGetStealth ? 'stealth | ' : '') + strFP
		isCanvasGet = ' ['+ (isGetStealth ? 'stealth ' : '')  +'%: '+ aNote.join(' ') +']'
		// pixels: allow 1 collision
		if (altP < (pixelcount - 1)) {return false}
		// rgb: ran 100k tests: lowest 124/128: allow 8 collsions
		if (altR < (pixelcount - 8)) {return false}
		if (altG < (pixelcount - 8)) {return false}
		if (altB < (pixelcount - 8)) {return false}
		// alpha: not randomized: higher collisons: lowest 96/128: allow 33%
		if ((altA / pixelcount) < .66) {return false}
		return true // RFP traits
	}

	var known = {
		createHashes: function(window, runNo){
			let outputs = [
				{
					class: window.CanvasRenderingContext2D,
					name: 'getImageData',
					value: function(){
						const METRIC = 'getImageData'
						if (aSkip.includes(METRIC)) {return 'skip'}
						try {
							var context = getKnownGet()
							let imageData = context.getImageData(0,0, sizeW, sizeH)
							if (runST) {imageData = null} else if (runSI) {imageData = {}}
							if ('object' !== typeFn(imageData, true)) {throw zErrType + typeFn(imageData)}
							let expected = '[object ImageData]'
							if (imageData+'' !== expected) {throw zErrInvalid +'expected '+ expected +': got '+ imageData+''}
							oData[METRIC] = imageData.data
							log_perf(9, METRIC +' ['+ runNo +']', aStart[METRIC])
							return mini(imageData.data)
						} catch(e) {
							oErrors[METRIC] = e+''
							return zErr
						}
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: 'isPointInPath',
					value: function(){
						const METRIC = 'isPointInPath'
						if (aSkip.includes(METRIC)) {return 'skip'}
						try {
							var context = getKnownPath()
							var data = new Uint8Array(sizeW * sizeH)
							var dataR = context.isPointInPath(0, 0)
							if (runST) {dataR = 0}
							let typeCheck = typeFn(dataR)
							if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
							for (let x = 0; x < sizeW; x++){
								for (let y = 0; y < sizeH; y++){
									data[y * sizeW + x] = context.isPointInPath(x, y)
								}
							}
							data = data.join('')
							oData[METRIC] = data
							return mini(data)
						} catch(e) {
							oErrors[METRIC] = e+''
							return zErr
						}
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: 'isPointInStroke',
					value: function(){
						const METRIC = 'isPointInStroke'
						if (aSkip.includes(METRIC)) {return 'skip'}
						try {
							let context = getKnownPath()
							var data = new Uint8Array(sizeW * sizeH)
							var dataR = context.isPointInStroke(0, 0)
							if (runST) {dataR = 'false'}
							let typeCheck = typeFn(dataR)
							if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
							for (let x = 0; x < sizeW; x++){
								for (let y = 0; y < sizeH; y++){
									data[y * sizeW + x] = context.isPointInStroke(x, y)
								}
							}
							data = data.join('')
							oData[METRIC] = data
							return mini(data)
						} catch(e) {
							oErrors[METRIC] = e+''
							return zErr
						}
					}
				},
				{
					name: 'toBlob',
					value: function(){
						return new Promise(function(resolve, reject){
							const METRIC = 'toBlob'
							if (aSkip.includes(METRIC)) {resolve('skip')}
							try {
								var timeout = window.setTimeout(function(){
									oErrors[METRIC] = zErrTime
									resolve(zErrTime)
								}, 750)
								if (!runTE) {
									getKnownTo().canvas.toBlob(function(blob){
										window.clearTimeout(timeout)
										var reader = new FileReader()
										reader.onload = function(){
											let value = reader.result
											if (runST) {value = ''}
											let typeCheck = typeFn(value)
											if ('string' === typeCheck ) {
												oData[METRIC] = value
												log_perf(9, METRIC +' ['+ runNo +']', aStart[METRIC])
												resolve(mini(reader.result))
											} else {
												oErrors[METRIC] = zErrType + typeCheck
												resolve(zErr)
											}
										}
										reader.onerror = function(){
											oErrors[METRIC] = zErr +' undefined [.onerror]'
											reject(zErr)
										}
										reader.readAsDataURL(blob)
									})
								}
							} catch(e) {
								oErrors[METRIC] = e+''
								resolve(zErr)
							}
						})
					}
				},
				{
					name: 'toBlob_solid',
					value: function(){
						return new Promise(function(resolve, reject){
							const METRIC = 'toBlob_solid'
							if (aSkip.includes(METRIC)) {resolve('skip')}
							try {
								var timeout = window.setTimeout(function(){
									oErrors[METRIC] = zErrTime
									resolve(zErrTime)
								}, 750)
								if (!runTE) {
									getKnownToSolid().canvas.toBlob(function(blob){
										window.clearTimeout(timeout)
										var reader = new FileReader()
										reader.onload = function(){
											let value = reader.result
											if (runST) {value = ''}
											let typeCheck = typeFn(value)
											if ('string' === typeCheck ) {
												oData[METRIC] = value
												log_perf(9, METRIC +' ['+ runNo +']', aStart[METRIC])
												resolve(mini(reader.result))
											} else {
												oErrors[METRIC] = zErrType + typeCheck
												resolve(zErr)
											}
										}
										reader.onerror = function(){
											oErrors[METRIC] = zErr +' undefined [.onerror]'
											reject(zErr)
										}
										reader.readAsDataURL(blob)
									})
								}
							} catch(e) {
								oErrors[METRIC] = e+''
								resolve(zErr)
							}
						})
					}
				},
				{
					name: 'toDataURL',
					value: function(){
						let METRIC = 'toDataURL'
						if (aSkip.includes(METRIC)) {return 'skip'}
						try {
							let data = getKnownTo().canvas.toDataURL()
							if (runST) {data = undefined}
							let typeCheck = typeFn(data)
							if ('string' !== typeCheck) {throw zErrType + typeCheck}
							oData[METRIC] = data
							log_perf(9, METRIC +' ['+ runNo +']', aStart[METRIC])
							return mini(data)
						} catch(e) {
							oErrors[METRIC] = e+''
							return zErr
						}
					}
				},
				{
					name: 'toDataURL_solid',
					value: function(){
						let METRIC = 'toDataURL_solid'
						if (aSkip.includes(METRIC)) {return 'skip'}
						try {
							let data = getKnownToSolid().canvas.toDataURL()
							if (runST) {data = undefined}
							let typeCheck = typeFn(data)
							if ('string' !== typeCheck) {throw zErrType + typeCheck}
							oData[METRIC] = data
							log_perf(9, METRIC +' ['+ runNo +']', aStart[METRIC])
							return mini(data)
						} catch(e) {
							oErrors[METRIC] = e+''
							return zErr
						}
					}
				},
			];
			function isSupported(output){
				let key = output.name
				if (key.includes('_solid')) {key = key.slice(0,-6)}
				return !!(output.class? output.class: window.HTMLCanvasElement).prototype[key]
			}
			function getKnownTo(){
				let canvas = dom.kcanvasTo
				let ctx = canvas.getContext('2d')
				if (oDrawn['to']) {return ctx}
				// color the background
				ctx.fillStyle = 'rgba('+ solidPink +')'
				ctx.fillRect(0, 0, sizeW, sizeH)
				// trigger fillText stealth
				let fpText = '\u2588\u2588\u2588\u2588' // full block
				ctx.font = '512px sans-serif' // large
				ctx.textBaseline = 'top'
				ctx.textBaseline = 'alphabetic'
				ctx.fillText(fpText,0,0)
				for (let x = 0; x < sizeW; x++) {
					let xEven = (x % 2 == 0)
					for (let y = 0; y < sizeH; y++) {
						let yEven = (y % 2 == 0)
						let isRandom = (xEven + yEven == 1 || xEven + yEven == 2) // 3/4ths
						if (isRandom) {
							ctx.fillStyle = 'rgba('+ (x*y) +','+ (x * 16) +','+ (y * 16) +',255)'
							ctx.fillRect(x, y, 1, 1)
						}
					}
				}
				oDrawn['to'] = true
				return ctx
			}
			function getKnownToSolid(){
				let canvas = dom.kcanvasToSolid
				let ctx = canvas.getContext('2d')
				if (oDrawn['to_solid']) {return ctx}
				// color the background
				ctx.fillStyle = 'rgba('+ solidPink +')'
				ctx.fillRect(0, 0, sizeW, sizeH)
				oDrawn['to_solid'] = true
				return ctx
			}
			function getKnownGet(){
				let canvas = dom.kcanvasGet
				let ctx = canvas.getContext('2d')
				if (oDrawn['get']) {return ctx}
				// color the background
				ctx.fillStyle = 'rgba('+ solidClrs +')'
				ctx.fillRect(0, 0, sizeW, sizeH)
				// trigger fillText stealth: try to cover every pixel
				let fpText = '\u2588\u2588\u2588\u2588' // full block
				ctx.font = '512px sans-serif' // large
				ctx.textBaseline = 'top'
				ctx.textBaseline = 'alphabetic'
				ctx.fillText(fpText,0,0)
				/*
				// trigger strokeText stealth
					// don't overwrite all the fillText
					// see PoC notes: too risky
				fpText = '-'
				ctx.font = '16px monospace'
				ctx.strokeStyle ='rgba('+ solidClrs +')'
				for (let x=0; x < sizeW/2; x++) {
					for (let y=0; y < sizeH/2; y++) {ctx.strokeText(fpText,x,y)}
				}
				//*/
				// now color the rest with our random colors
				// swap x/y loop order to match getImageData uint
				let ignore = 'rgba('+ solidClrs +')'
				for (let y=0; y < sizeH; y++) {
					for (let x=0; x < sizeW; x++) {
						let style = dataToDraw[(y * sizeW) + x]
						if (style !== ignore) {
							ctx.fillStyle = style
							ctx.fillRect(x, y, 1, 1)
						}
					}
				}
				oDrawn['get'] = true
				return ctx
			}
			function getKnownPath(){
				let ctx = dom.kcanvasPath.getContext('2d')
				if (oDrawn['path']) {return ctx}
				ctx.fillStyle = 'rgba(255,255,255,255)'
				ctx.beginPath()
				ctx.rect(2,5,8,7)
				ctx.closePath()
				ctx.fill()
				oDrawn['path'] = true
				return ctx
			}

			var finished = Promise.all(outputs.map(function(output){
				return new Promise(function(resolve, reject){
					aStart[output.name] = nowFn() // start perf here
					var displayValue
					try {
						var supported = output.supported? output.supported(): isSupported(output);
						if (supported){
							displayValue = output.value()
						} else {
							oErrors[output.name] = 'Error'
							displayValue = zErr
						}
					} catch(e) {
						oErrors[output.name] = e+''
						displayValue = zErr
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						oErrors[output.name] = e+''
						output.displayValue = zErr
						resolve(zErr)
					})
				})
			}))
			return finished
		}
	}

	// oDrawn: only draw the canvas once per runNo
		// if input is faked, it would also be faked the second time
	let oDrawn = {'get': false, 'path': false, 'to': false, 'to_solid': false}
	let oRes = {}, oFP = {}, oErrors = {}, oData = {}, aSkip = [], countFake = 0
	let solidPink = '224,33,138,255' // go Barbie!

	// random getImageData
	let dataDrawn = new Uint8ClampedArray(sizeW * sizeH * 4)
	let dataToDraw = [], indexFont = []
	let solidR = Math.floor(Math.random()*255),
		solidG = Math.floor(Math.random()*255),
		solidB = Math.floor(Math.random()*255)
	let solidClrs = solidR +','+ solidG +','+ solidB +',255'
	let counter = -1
	for (let x=0; x < sizeW; x++) {
		let xEven = (x % 2 == 0)
		for (let y=0; y < sizeH; y++) {
			counter ++
			let k = counter * 4
			let yEven = (y % 2 == 0)
			// xEven + yEven == 1 = checkerboard = 1/2
			// xEven + yEven == 2 = another 1/4
			// xEven + yEven == 0 = the remainder: of which we can further reduce e.g. multples of 3
			let isRandom = (xEven + yEven == 1 || xEven + yEven == 2) // 3/4ths
			if (!isRandom) {
				if ((x * y) % 3 == 0 ) {isRandom = true} // brings us to 113/128
			}
			if (isRandom) {
				// random: 113
				let valueR = Math.floor(Math.random()*255),
					valueG = Math.floor(Math.random()*255),
					valueB = Math.floor(Math.random()*255)
				dataDrawn[k] = valueR
				dataDrawn[k+1] = valueG
				dataDrawn[k+2] = valueB
				dataDrawn[k+3] = 255
				dataToDraw.push('rgba('+ valueR +','+ valueG +','+ valueB +',255)')
			} else {
				indexFont.push(k)
				// solid: 15
				dataDrawn[k] = solidR
				dataDrawn[k+1] = solidG
				dataDrawn[k+2] = solidB
				dataDrawn[k+3] = 255
				dataToDraw.push('rgba('+ solidClrs +')')
			}
		}
	}

	function exit() {
		for (const m of Object.keys(oFP)) {
			addBoth(9, m, oFP[m].value, '', oFP[m].notation, oFP[m].data)
		}
		return resolve()
	}

	Promise.all([
		known.createHashes(window, 1)
	]).then(function(run1){
		/*
		console.log(run1)
		console.log(oData)
		console.log(oDrawn)
		console.log(oErrors)
		//*/
		run1[0].forEach(function(item){
			let name = item.name, value = item.displayValue, data ='', notation =''

			oRes[name] = {}
			oRes[name][1] = value

			if (undefined !== oErrors[name]) {
				aSkip.push(name)
				value = oErrors[name]; notation = rfp_red; data = zErrLog
			} else if (!isSmart) {
				if ('getImageData' == name) {data = zNA} // test is random, return a stable FP
			} else {
				if ('getImageData' == name) {
					// run 1 check returns mini(dataDrawn) == mini(data)
					let getCheck = check_canvas_get(oData['getImageData'], 1)
					if (getCheck) {
						data = 'trustworthy' // the test is random, return a stable FP
						notation = rfp_red
					} else {
						data = 'protected'
						countFake++
					}
				} else {
					if (oKnown[name] == value) {
						aSkip.push(name)
						notation = rfp_red
					} else {
						data = 'protected'
						countFake++
					}
				}
			}
			oFP[name] = {'value': value, 'notation': notation, 'data': data}
		})

		if (!isSmart || countFake == 0) {
			exit()
			return
		}
		const proxyMap = {
			convertToBlob: 'OffscreenCanvas',
			getImageData: 'CanvasRenderingContext2D',
			isPointInPath: 'CanvasRenderingContext2D',
			isPointInStroke: 'CanvasRenderingContext2D',
			toBlob: 'HTMLCanvasElement',
			toDataURL: 'HTMLCanvasElement',
		}
		// smart + some lies, do 2nd run
		oDrawn = {'get': false, 'path': false, 'to': false}
		Promise.all([
			known.createHashes(window, 2)
		]).then(function(run2){

			run2[0].forEach(function(item){
				let value = item.displayValue
				let checkValue = value
				// getImageData doesn't get a 'skip' so we handle it differently
				// don't check if already skipped: e.g. type error null
				// run2 check returns skip if nothing to do, or true/false if RFP-like
				// why do I need this?
				if (item.name == 'getImageData' && 'skip' !== checkValue) {
					let getCheck = check_canvas_get(oData['getImageData'], 2)
					if ('skip' == getCheck) {checkValue = 'skip'}
				}
				if (checkValue !== 'skip') {
					let	data ='', notation ='', stats ='', rfpvalue =''
					name = item.name
					if (oRes[name][1] == value) {
						// persistent
						if ('isP' == name.slice(0,3)) {
							notation = (value === allZeros && !isProxyLie(proxyMap[name] +'.'+ name)) ? rfp_green : rfp_red // all zeros
						} else {
							notation = rfp_red
							// FPP: 119+ and no proxy lies and no getImageData stealth
							// exclude TB14+ as PB mode falls back to FPP with canvas exceptions
							// exclude solids: FPP does not tamper with those
							if (isVer > 119 && !isTB && !name.includes('_solid')) {
								if (!isProxyLie(proxyMap[name] +'.'+ name)) {
									if (!isGetStealth) {notation = fpp_green}
								}
							}
						}
						rfpvalue = notation == rfp_green ? ' | RFP' : (notation == fpp_green ? ' | FPP' : '')
						if ('getImageData' == name) {
							stats = isCanvasGet
							rfpvalue += ' | '+ isCanvasGetChannels
						}
						notation += ' [persistent]'+ stats
						data = 'protected | persistent'+ rfpvalue

						//oFP[name] = "protected | persistent"+ rfpvalue
						//addDisplay(9, name, value,'', note +" [persistent]"+ stats)

					} else {
						// per execution
						if ('isP' == name.slice(0,3)) {
							notation = rfp_red
						} else if ('to' == name.slice(0,2)) {
							notation = check_canvas_to(oData[name]) ? rfp_green : rfp_red
						} else {
							notation = check_canvas_get(oData[name], 2) ? rfp_green : rfp_red
						}
						rfpvalue = notation == rfp_green ? ' | RFP' : ''
						if ('getImageData' == name) {
							stats = isCanvasGet
							data += ' | '+ isCanvasGetChannels
						}
						notation += ' [per execution]'+ stats
						data = 'protected | per execution'+ rfpvalue
					}
					oFP[name] = {'value': value, 'notation': notation, 'data': data}
				}
			})
			exit()
		})
	})
})

countJS(9)
