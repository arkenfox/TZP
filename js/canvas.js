'use strict';

/* outputCanvas() based on https://canvasblocker.kkapsner.de/test/ */
/* 	const proxyMap = {convertToBlob: 'OffscreenCanvas'} */

function get_canvas_info(dataURL) {
	try {
		// https://stackoverflow.com/a/37997175
		var PNG = {
			parse: function(imgTag) {
				var base64 = PNG.asBase64(imgTag);
				var byteData = PNG.utils.base64StringToByteArray(base64);
				var parsedPngData = PNG.utils.parseBytes(byteData);
				return PNG.utils.enrichParsedData(parsedPngData);
			},
			asBase64: function(imgTag) {
				/* we already have all this
				var canvas = document.createElement("canvas");
				canvas.width = imgTag.width; 
				canvas.height = imgTag.height; 
				var ctx = canvas.getContext("2d"); 
				ctx.drawImage(imgTag, 0, 0); 
				var dataURL = canvas.toDataURL("image/png");
				//*/
				return dataURL.split('base64,')[1];
			},
			utils: {
				base64StringToByteArray: function(base64String) {
					//http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
					var byteCharacters = atob(base64String);
					var byteNumbers = new Array(byteCharacters.length);
					for (var i = 0; i < byteCharacters.length; i++) {
						byteNumbers[i] = byteCharacters.charCodeAt(i);
					}
					return new Uint8Array(byteNumbers);
				},
				parseBytes: function(bytes) {
					var pngData = {};
					//see https://en.wikipedia.org/wiki/Portable_Network_Graphics
					//verify file header
					pngData['headerIsValid'] = bytes[0] == 0x89
						&& bytes[1] == 0x50
						&& bytes[2] == 0x4E
						&& bytes[3] == 0x47
						&& bytes[4] == 0x0D
						&& bytes[5] == 0x0A
						&& bytes[6] == 0x1A
						&& bytes[7] == 0x0A
					if (!pngData.headerIsValid) {
						console.warn('Provided data does not belong to a png');
						return pngData;
					}
					//parsing chunks
					var chunks = [];
					var chunk = PNG.utils.parseChunk(bytes, 8);
					chunks.push(chunk);
					while (chunk.name !== 'IEND') {
						chunk = PNG.utils.parseChunk(bytes, chunk.end);
						chunks.push(chunk);
					}
					pngData['chunks'] = chunks;
					return pngData;
				},
				parseChunk: function(bytes, start) {
					var chunkLength = PNG.utils.bytes2Int(bytes.slice(start, start + 4));

					var chunkName = '';
					chunkName += String.fromCharCode(bytes[start + 4]);
					chunkName += String.fromCharCode(bytes[start + 5]);
					chunkName += String.fromCharCode(bytes[start + 6]);
					chunkName += String.fromCharCode(bytes[start + 7]);

					var chunkData = [];
					for (var idx = start + 8; idx<chunkLength + start + 8; idx++) {
						chunkData.push(bytes[idx]);
					}
					//TODO validate crc as required!
					return {
						start: start,
						end: Number(start) + Number(chunkLength) + 12, //12 = 4 (length) + 4 (name) + 4 (crc)
						length: chunkLength,
						name: chunkName,
						data: chunkData,
						crc: [
							bytes[chunkLength + start + 8],
							bytes[chunkLength + start + 9],
							bytes[chunkLength + start + 10],
							bytes[chunkLength + start + 11]
						],
						crcChecked: false
					};
				},
				enrichParsedData: function(pngData) {
					var idhrChunk = PNG.utils.getChunk(pngData, 'IDHR');

					//see http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html
					pngData.width = PNG.utils.bytes2Int(idhrChunk.data.slice(0, 4));
					pngData.height = PNG.utils.bytes2Int(idhrChunk.data.slice(4, 8));
					pngData.bitDepth = PNG.utils.bytes2Int(idhrChunk.data.slice(8, 9));
					pngData.colorType = PNG.utils.bytes2Int(idhrChunk.data.slice(9, 10));
					pngData.compressionMethod = PNG.utils.bytes2Int(idhrChunk.data.slice(10, 11));
					pngData.filterMethod = PNG.utils.bytes2Int(idhrChunk.data.slice(11, 12));
					pngData.interlaceMethod = PNG.utils.bytes2Int(idhrChunk.data.slice(12, 13));

					pngData.isGreyScale = pngData.colorType == 0 || pngData.colorType == 4;
					pngData.isRgb = pngData.colorType == 2 || pngData.colorType == 6;
					pngData.hasAlpha = pngData.colorType == 4 || pngData.colorType == 6;
					pngData.hasPaletteMode = pngData.colorType == 3 && PNG.utils.getChunk(pngData, 'PLTE') != null;
					return pngData;
				},
				getChunks: function(pngData, chunkName) {
					var chunksForName = [];
					for (var idx = 0; idx<pngData.chunks.length; idx++) {
						if (pngData.chunks[idx].name = chunkName) {
							chunksForName.push(pngData.chunks[idx]);
						}
					}
					return chunksForName;
				},
				getChunk: function(pngData, chunkName) {
					for (var idx = 0; idx<pngData.chunks.length; idx++) {
						if (pngData.chunks[idx].name = chunkName) {
							return pngData.chunks[idx];
						}
					}
					return null;
				},
				bytes2Int: function(bytes) {
					var ret = 0;
					for (var idx = 0; idx<bytes.length; idx++) {
						ret += bytes[idx];
						if (idx < bytes.length - 1) {
							ret = ret << 8;
						}
					}
					return ret;
				}
			}
		}
		var pngData = PNG.parse(dataURL);
		return (pngData)
	} catch(e) {
		log_alert(9, 'canvas_info', e+'')
		return zErr
	}
}

const get_canvas_getimage = (sizeW, sizeH) => new Promise(resolve => {

	function check(dataname, runNo) {
		// return skip if no tampering, otherwise return true/false if it matches RFP
		let data = oData[dataname][runNo]
		let dataDrawn = oDataDrawn[dataname]
		let isMatch = mini(dataDrawn) == mini(data)
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
		isFontStealth = aNotInFonts.length == 0

		// noise FP
		let strFP ='', aNote = []
		aNote.push('p'+ Math.floor((altP / pixelcount) * 100))
		if (altR > 0) {strFP += 'r'; aNote.push('r'+Math.floor((altR / pixelcount) * 100))}
		if (altG > 0) {strFP += 'g'; aNote.push('g'+ Math.floor((altG / pixelcount) * 100))}
		if (altB > 0) {strFP += 'b'; aNote.push('b'+ Math.floor((altB / pixelcount) * 100))}
		if (altA > 0) {strFP += 'a'; aNote.push('a'+ Math.floor((altA / pixelcount) * 100))}
		// FP data
		isCheckChannels = (isFontStealth ? 'stealth | ' : '') + strFP
		// display data: keep android short
		if (isDesktop) {isCheckNotation = ' ['+ (isFontStealth ? 'stealth ' : '')  +'%: '+ aNote.join(' ') +']'
		} else if (isFontStealth) {isCheckNotation = ' [stealth]'}

		// pixels: allow 4 collisions
		if (altP < (pixelcount - 4)) {return false}
		// rgb: ran 100k tests: lowest 124/128: allow 8 collsions
			// with a solid, collisions are amplified: 112/128 seems to be the lowest given the pattern repeats
		let maxCollisions = 'getImageData_solid' == dataname ? 24 : 8
		if (altR < (pixelcount - maxCollisions)) {return false}
		if (altG < (pixelcount - maxCollisions)) {return false}
		if (altB < (pixelcount - maxCollisions)) {return false}
		// alpha: not randomized: higher collisons: lowest 96/128: allow 33%
		if ((altA / pixelcount) < .66) {return false}
		return true // RFP traits
	}

	function generate() {
		// random getImageData
		let tmpDrawn = new Uint8ClampedArray(sizeW * sizeH * 4)
		let tmpSolid = new Uint8ClampedArray(sizeW * sizeH * 4)
		let solidR = Math.floor(Math.random()*255),
			solidG = Math.floor(Math.random()*255),
			solidB = Math.floor(Math.random()*255)
		solidClrs = solidR +','+ solidG +','+ solidB +',255'
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
					tmpDrawn[k] = valueR
					tmpDrawn[k+1] = valueG
					tmpDrawn[k+2] = valueB
					tmpDrawn[k+3] = 255
					dataToDraw.push('rgba('+ valueR +','+ valueG +','+ valueB +',255)')
				} else {
					indexFont.push(k)
					// solid: 15
					tmpDrawn[k] = solidR
					tmpDrawn[k+1] = solidG
					tmpDrawn[k+2] = solidB
					tmpDrawn[k+3] = 255
					dataToDraw.push('rgba('+ solidClrs +')')
				}
				// solid
				tmpSolid[k] = solidR
				tmpSolid[k+1] = solidG
				tmpSolid[k+2] = solidB
				tmpSolid[k+3] = 255
			}
		}
		oDataDrawn = {'getImageData': tmpDrawn, 'getImageData_solid': tmpSolid}
	}

	var known = {
		createHashes: function(window, runNo){
			let outputs = [
				{
					class: window.CanvasRenderingContext2D,
					name: 'getImageData',
					value: function(){
						const METRIC = 'getImageData'
						if (undefined !== oErrors[METRIC]) {return zErr} // if you erred once, don't bother with the 2nd test
						try {
							var context = getKnownGet()
							let imageData = context.getImageData(0,0, sizeW, sizeH)
							if (runST) {imageData = null} else if (runSI) {imageData = {}}
							if ('object' !== typeFn(imageData, true)) {throw zErrType + typeFn(imageData)}
							let expected = '[object ImageData]'
							if (imageData+'' !== expected) {throw zErrInvalid +'expected '+ expected +': got '+ imageData+''}
							oData[METRIC][runNo] = imageData.data
							return 'success'
						} catch(e) {
							oErrors[METRIC] = e+''
							return zErr
						}
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: 'getImageData_solid',
					value: function(){
						const METRIC = 'getImageData_solid'
						if (undefined !== oErrors[METRIC]) {return zErr} 
						try {
							var context = getKnownGetSolid()
							let imageData = context.getImageData(0,0, sizeW, sizeH)
							if (runST) {imageData = null} else if (runSI) {imageData = {}}
							if ('object' !== typeFn(imageData, true)) {throw zErrType + typeFn(imageData)}
							let expected = '[object ImageData]'
							if (imageData+'' !== expected) {throw zErrInvalid +'expected '+ expected +': got '+ imageData+''}
							oData[METRIC][runNo] = imageData.data
							return 'success'
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
			function getKnownGet(){
				let canvas = dom.tzpCanvasGet
				let ctx = canvas.getContext('2d')
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
				return ctx
			}
			function getKnownGetSolid(){
				let canvas = dom.tzpCanvasGetSolid
				let ctx = canvas.getContext('2d')
				ctx.fillStyle = 'rgba('+ solidClrs +')'
				ctx.fillRect(0, 0, sizeW, sizeH)
				return ctx
			}

			var finished = Promise.all(outputs.map(function(output){
				return new Promise(function(resolve, reject){
					var displayValue
					try {
						var supported = output.supported? output.supported(): isSupported(output);
						if (supported){
							displayValue = output.value()
						} else {
							oErrors[output.name] = zErr; displayValue = zErr
						}
					} catch(e) {
						oErrors[output.name] = e+''; displayValue = zErr
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						oErrors[output.name] = e+''; output.displayValue = zErr
						resolve(zErr)
					})
				})
			}))
			return finished
		}
	}

	let oDataDrawn, solidClrs, dataToDraw = [], indexFont = []
	let isCheckNotation ='', isCheckChannels ='', isFontStealth = false
	const pixelcount = sizeW * sizeH
	generate()

	let oData = {'getImageData': {}, 'getImageData_solid': {}}, oErrors = {}, oRaw = {}
	Promise.all([
		known.createHashes(window, 0),
		known.createHashes(window, 1),
	]).then(function(res){
		//console.log(oData)
		//console.log(oErrors)
		//console.log(res)
		let isProxy = isProxyLie('CanvasRenderingContext2D.getImageData')
		// all white: e.g. perps setting false for privacy.resistFingerprinting.randomDataOnCanvasExtract
			// this pref was removed in FF134, but some extensions still do this
		let whitehash = 'd5f8f171'
		// ToDo: replace whitehash or enhance whitehash with solidhash
		for (const k of Object.keys(oData)) {
			// if an error,. report that, else compare the two runs etc
			let hash, data ='', notation = rfp_red, notationExtra = ''
			if (undefined !== oErrors[k]) {
				hash = oErrors[k]; oRaw[k] = hash
				addBoth(9, 'canvas_'+ k, hash,'', notation, zErrLog)
			} else {
				// persistent or per execution || no errors so we muct have two results
					// tidy oRaw as we go since we've hashed results
				let hash0 = mini(oData[k][0]), isWhite = false
				hash = mini(oData[k][1]) // always display a hash, make it the last one read

				let isCheck = check(k, 1) // use the last result to be consistent
				//console.log(k, isCheck, isCheckNotation, isCheckChannels, isFontStealth)
				if ('skip' == isCheck) {
					data = 'trustworthy' // the test is random, return a stable FP
					oRaw[k] = oData[k][0]
				} else {
					// we have tampering
					let isPersistent = hash0 == hash
					if (isPersistent) {
						oRaw[k] = oData[k][0]
						notationExtra = ' [persistent]'
						isWhite = hash == whitehash // isWhite only if persistent
					} else {
						oRaw[k] = {}
						for (const j of Object.keys(oData[k])) {oRaw[k]['run' + j] = oData[k][j]}
						notationExtra = ' [per execution]'
						if (isCheck && !isProxy && !isFontStealth) {
							notation = rfp_green // meets rfp stats, no lies, + no font stealth fuckery
						}
					}
					data = 'protected | ' + (isPersistent ? 'persistent' : 'per execution')
					if (isWhite) {
						data += ' | white'
						notationExtra += ' [white]'
					} else {
						notationExtra += isCheckNotation
						if (isGecko && rfp_green == notation) {data += ' | RFP'
						} else {data += ' | '+ isCheckChannels}
					}
					// non gecko doesn't display notation, but with data !== '' the hash becomes display-only
					if (!isGecko) {hash += s99 +' '+ notationExtra +sc}
				}
				addBoth(9, 'canvas_'+ k, hash,'', notation + notationExtra, data)
			}
		}
		return resolve(oRaw)
	})
})

const get_canvas_ispoint = (sizeW, sizeH) => new Promise(resolve => {
	var known = {
		createHashes: function(window, runNo){
			let isDrawn = false // only draw once per run
			let outputs = [
				{
					class: window.CanvasRenderingContext2D,
					name: 'isPointInPath',
					value: function(){
						const METRIC = 'isPointInPath'
						if (undefined !== oErrors[METRIC]) {return zErr} // if you erred once, don't bother with the 2nd test
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
							data = data.join('') //+ (1 == runNo ? '5' : '') // test per execution
							oData[METRIC][runNo] = data
							return ''
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
						if (undefined !== oErrors[METRIC]) {return zErr}
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
							data = data.join('') //+ (1 == runNo ? '5' : '') // test per execution
							oData[METRIC][runNo] = data
							return ''
						} catch(e) {
							oErrors[METRIC] = e+''
							return zErr
						}
					}
				},
			];
			function isSupported(output){
				let key = output.name
				//return window.CanvasRenderingContext2D.prototype.hasOwnProperty(key)
				return !!(output.class? output.class: window.HTMLCanvasElement).prototype[key]
			}
			function getKnownPath(){
				let ctx = dom.tzpCanvasPath.getContext('2d')
				if (isDrawn) {return ctx} // we draw once per run, but call this for two tests
				ctx.fillStyle = 'rgba(255,255,255,255)'
				ctx.beginPath()
				ctx.rect(2,5,8,7)
				ctx.closePath()
				ctx.fill()
				isDrawn = true
				return ctx
			}

			var finished = Promise.all(outputs.map(function(output){
				return new Promise(function(resolve, reject){
					var displayValue
					try {
						var supported = output.supported? output.supported(): isSupported(output);
						if (supported){
							displayValue = output.value()
						} else {
							oErrors[output.name] = zErr; displayValue = zErr
						}
					} catch(e) {
						oErrors[output.name] = e+''; displayValue = zErr
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						oErrors[output.name] = e+''; output.displayValue = zErr
						resolve(zErr)
					})
				})
			}))
			return finished
		}
	}

	let oData = {'isPointInPath': {}, 'isPointInStroke': {}}, oErrors = {}
	Promise.all([
		known.createHashes(window, 0),
		known.createHashes(window, 1),
	]).then(function(res){
		//console.log(oData)
		//console.log(oErrors)
		//console.log(res)
		let oRaw = {}
		let oKnown = {
			// AFAICT these are the same on every engine, every platform, every config?
			'isPointInPath': ['db0e3f08'],
			'isPointInStroke': ['a77e328a'],
		}
		for (const k of Object.keys(oData)) {
			// if an error,. report that, else compare the tfwo runs etc
			let hash, data ='', notation = rfp_red, notationExtra = ''
			if (undefined !== oErrors[k]) {
				// cleanup support: e.g. servo
				let isSupport = window.CanvasRenderingContext2D.prototype.hasOwnProperty(k)
				if (isSupport) {hash = oErrors[k]; data = zErrLog} else {hash = zNA}
				oRaw[k] = hash
			} else {
				// persistent or per execution || no errors so we must have two results
					// tidy oRaw as we go since we've hashed results
				let hash0 = mini(oData[k][0])
				hash = mini(oData[k][1]) // always display a hash, make it the last one read
				let isPersistent = hash0 == hash
				// only set notationExtra if tampered with
				if (isPersistent) {
					oRaw[k] = oData[k][0]
					if (oKnown[k].includes(hash)) {
						data = 'trustworthy'
					} else {
						notationExtra = ' [persistent]'
						let isProxy = isProxyLie('CanvasRenderingContext2D.'+ k)
						if ('93bd94c5' == hash && !isProxy) {notation = rfp_green} // persistent, all zeroes + no proxy lies
					}
				} else {
					oRaw[k] = {}
					for (const j of Object.keys(oData[k])) {oRaw[k]['run' + j] = oData[k][j]}
					notationExtra = ' [per execution]'
				}
				// notationExtra is only set if tampered with
				if (notationExtra.length) {
					data = 'protected | ' + (isPersistent ? 'persistent' : 'per execution')
					if (isGecko && rfp_green == notation) {data += ' | RFP'}
				}
			}
			addBoth(9, 'canvas_'+ k, hash,'', notation + notationExtra, data)
		}
		return resolve(oRaw)
	})
})

const get_canvas_to = (sizeW, sizeH) => new Promise(resolve => {

	function check(data) {
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

	var known = {
		createHashes: function(window, runNo){
			let isDrawn = false // only draw once per run
			let isDrawnSolid = false
			let outputs = [
				{
					name: 'toBlob',
					value: function(){
						return new Promise(function(resolve, reject){
							const METRIC = 'toBlob'
							if (undefined !== oErrors[METRIC]) {return zErr} // if you erred once, don't bother with the 2nd test
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
											if (runST) {value =''}
											let typeCheck = typeFn(value)
											if ('string' === typeCheck ) {
												oData[METRIC][runNo] = value
												resolve('success')
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
							if (undefined !== oErrors[METRIC]) {return zErr}
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
											if (runST) {value =''}
											let typeCheck = typeFn(value)
											if ('string' === typeCheck ) {
												oData[METRIC][runNo] = value
												resolve('success')
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
						if (undefined !== oErrors[METRIC]) {return zErr}
						try {
							let data = getKnownTo().canvas.toDataURL()
							if (runST) {data = undefined}
							let typeCheck = typeFn(data)
							if ('string' !== typeCheck) {throw zErrType + typeCheck}
							oData[METRIC][runNo] = data
							return 'success'
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
						if (undefined !== oErrors[METRIC]) {return zErr}
						try {
							let data = getKnownToSolid().canvas.toDataURL()
							if (runST) {data = undefined}
							let typeCheck = typeFn(data)
							if ('string' !== typeCheck) {throw zErrType + typeCheck}
							oData[METRIC][runNo] = data
							return 'success'
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
				let canvas = dom.tzpCanvasTo
				let ctx = canvas.getContext('2d')
				if (isDrawn) {return ctx}
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
				isDrawn = true
				return ctx
			}
			function getKnownToSolid(){
				let canvas = dom.tzpCanvasToSolid
				let ctx = canvas.getContext('2d')
				if (isDrawnSolid) {return ctx}
				ctx.fillStyle = 'rgba('+ solidPink +')'
				ctx.fillRect(0, 0, sizeW, sizeH)
				isDrawnSolid = true
				return ctx
			}

			var finished = Promise.all(outputs.map(function(output){
				return new Promise(function(resolve, reject){
					var displayValue
					try {
						var supported = output.supported? output.supported(): isSupported(output);
						if (supported){
							displayValue = output.value()
						} else {
							oErrors[output.name] = zErr; displayValue = zErr
						}
					} catch(e) {
						oErrors[output.name] = e+''; displayValue = zErr
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						oErrors[output.name] = e+''; output.displayValue = zErr
						resolve(zErr)
					})
				})
			}))
			return finished
		}
	}

	let solidPink = '224,33,138,255' // go Barbie!
	let oData = {'toBlob': {}, 'toBlob_solid': {}, 'toDataURL': {}, 'toDataURL_solid': {}}, oErrors = {}
	Promise.all([
		known.createHashes(window, 0),
		known.createHashes(window, 1)
	]).then(function(res){
		//console.log(oData)
		//console.log(oErrors)
		//console.log(res)
		let oRaw = {}, oInfo = {}
		// FF95+: compression 1724331 / 1737038 
			// FF137 1910796: Enable libz-rs on nightly: this changes our known hashes
			// FF139 1949947: Upgrade zlib-rs/libz-rs-sys to 0.4.2. (new to*_solids)
		// ToDo: check grfx/hardware/comporession configs
		let oKnown = {
			// FF153+e328ec8e + 9d0b9932 on both 
			'toBlob': [
				'e328ec8e', // my droid + windows
			],
			'toBlob_solid': [
				'9d0b9932', // my droid + windows
				'cfd52a1f', // nfi but it was added after 9d0b9932 i think
			], 
		}
		oKnown['toDataURL'] = oKnown['toBlob']
		oKnown['toDataURL_solid'] = oKnown['toBlob_solid']
		let oIDAT = {
			'nonsolid': [
				'668fd61f',	// from 'e328ec8e'
			],
			'solid': [
				'b350ce6e', // from '9d0b9932'
			]
		}

		for (const k of Object.keys(oData)) {
			// if an error,. report that, else compare the two runs etc
			let hash, data ='', notation = rfp_red, notationExtra = ''
			if (undefined !== oErrors[k]) {
				hash = oErrors[k]; oRaw[k] = hash
				addBoth(9, 'canvas_'+ k, hash,'', notation, zErrLog)
			} else {
				// persistent or per execution || no errors so we must have two results
					// tidy oRaw as we go since we've hashed results
				let hash0 = mini(oData[k][0])
				hash = mini(oData[k][1]) // always display a hash, make it the last one read
				let isProxy = isProxyLie('HTMLCanvasElement.'+ k.replace('_solid','')),
					isProxy2 = isProxyLie('HTMLCanvasElement.getContext')
				// memorize per hash info
				if (undefined == oInfo[hash]) {oInfo[hash] = get_canvas_info(oData[k][1])}
				let isChunk = false
				if (zErr !== oInfo[hash]) {
					try {
						// the nummer of chunks can vary per engine (or compression?)
						// e.g. FF has 3, blink has 4 | cycle the chunks and check for a 'deBG'
						let chunkdata = oInfo[hash].chunks
						for (const key of Object.keys(chunkdata)) {
							if ('deBG' == chunkdata[key].name) {isChunk = true}
						}
					} catch(e) {}
				}
				let isPersistent = hash0 == hash
				// only set notationExtra if tampered with
				if (isPersistent) {
					oRaw[k] = oData[k][0]
					if (isBraveSmart) {
						data = 'protected | persistent'
						hash += s99 +' [persistent]'+ sc
						log_debug(9, 'canvas_'+ k +'_ignored', hash)
					} else if (isChunk) {
						data = 'protected | persistent*'
						// display the IDAT data hash
						let IDAThash = mini(oInfo[hash].chunks[1].data)
						let IDATStr = ' ['+ IDAThash +']'
						if (isGecko) {
							notationExtra = ' [persistent*]'+ s99 + IDATStr + sc
							// FPP happens on top of extension tampering, so we need to check
							// the underlying IDAT data is a known value
							let lookup = k.includes('solid') ? 'solid' : 'nonsolid'
							if (!isProxy && oIDAT[lookup].includes(IDAThash)) {
								notation = fpp_green // underlying data not changed, has chunks, !isProxy
							}
						} else {
							hash += s99 +' [persistent*]'+ IDATStr + sc
						}
					} else if (isGecko) {
						if (!oKnown[k].includes(hash)) {
							data = 'protected | persistent'
							notationExtra = ' [persistent]'
						}
					}
					/* data should be:
						'protected | persistent' = brave or extension
						'protected | persistent* | FPP' = pure FPP
						'protected | persistent*' = extension + chunk (presumable FPP)
					*/
				} else {
					// not going to bother checking for per execution chunks
					oRaw[k] = {}
					for (const j of Object.keys(oData[k])) {oRaw[k]['run' + j] = oData[k][j]}
					data = 'protected | per execution'
					notationExtra = ' [per execution]'
					notation = check(oData[k][1]) ? rfp_green : rfp_red
				}
				if (rfp_green == notation) {data += ' | RFP'} else if (fpp_green == notation) {data += ' | FPP'}
				addBoth(9, 'canvas_'+ k, hash,'', notation + notationExtra, data)
			}
		}
		// add oInfo
		let tmpobj = {}
		for (const k of Object.keys(oInfo).sort()) {tmpobj[k] = oInfo[k]}
		sDetail[isScope]['canvas_png'] = tmpobj
		addDisplay(9, 'canvas_png', addButton(9,'canvas_png','PNG'))
		// out of here
		return resolve(oRaw)
	})
})

const outputCanvas = () => new Promise(resolve => {
	if (gRun && sectionIgnore.includes('canvas')) {return resolve()}

	// ensure sizes
	const sizeW = 16, sizeH = 8
	let aCanvas = ['Get','GetSolid','Path','To','ToSolid']
	aCanvas.forEach(function(k){
		try {
			let el = dom['tzpCanvas'+ k]; el.width = sizeW; el.height = sizeH
		} catch(e) {}
	})

	Promise.all([
		get_canvas_getimage(sizeW, sizeH),
		get_canvas_ispoint(sizeW, sizeH),
		get_canvas_to(sizeW, sizeH),
	]).then(function(res){
		// combine raw data returns
		let newobj = {}
		res.forEach(function(obj){
			for (const k of Object.keys(obj).sort()) {newobj[k] = obj[k]}
		})
		sDetail[isScope]['canvas_data'] = newobj
		addDisplay(9, 'canvas_data', addButton(9,'canvas_data','data'))
		return resolve()
	})
})

countJS(9)
