"use strict";

/* outputCanvas() based on https://canvasblocker.kkapsner.de/test/ */

function check_canvas_to(data) {
	// only called if per-execution
	let len = data.length
	if (![166,170,174,178].includes(len)) {return false}
	let slice1 = data.slice(72,80)
	if (slice1 === "lEQVQoU2") {
		let	slice2 = data.slice(data.length - 10, data.length)
		if (slice2 == "VORK5CYII=" || slice2 == "5ErkJggg==" || slice2 == "lFTkSuQmCC") {
			return true // RFP
		}
	}
	return false
}

function outputCanvas() {
	let t0 = nowFn()
	const sizeW = 16, sizeH = 8, pixelcount = sizeW * sizeH, allZeros = "93bd94c5"
	// FF95+: compression changes 1724331 / 1737038 
	const oKnown = {
		"isPointInPath": "db0e3f08",
		"isPointInStroke": "a77e328a",
		"toBlob": "a8d0bd06",
		"toDataURL": "a8d0bd06",
	}
	let isCanvasGet = "", isCanvasGetChannels = ""

	function check_canvas_get(data, runNo) {
		if (runNo == 1) {
			return mini(dataDrawn) == mini(data)
		}
		// run2
		let aDrawn = [], aRead = []
		let altP = 0, altR = 0, altG = 0, altB = 0, altA = 0, altAll = 0
		for (let x=0; x < pixelcount; x++) {
			let k = x * 4
			aDrawn = dataDrawn.slice(k, k+4)
			aRead = data.slice(k, k+4)
			if (aDrawn.join() !== aRead.join()) { altP++ } // pixels
			if (aDrawn[0] !== aRead[0]) { altR++} // channels
			if (aDrawn[1] !== aRead[1]) { altG++}
			if (aDrawn[2] !== aRead[2]) { altB++}
			if (aDrawn[3] !== aRead[3]) { altA++}
			// ToDo: range: worth it?
		}
		// noise FP
		let strFP = "", aNote = []
		aNote.push("p"+ Math.floor((altP / pixelcount) * 100))
		if (altR > 0) {strFP += "r"; aNote.push("r"+Math.floor((altR / pixelcount) * 100))}
		if (altG > 0) {strFP += "g"; aNote.push("g"+ Math.floor((altG / pixelcount) * 100))}
		if (altB > 0) {strFP += "b"; aNote.push("b"+ Math.floor((altB / pixelcount) * 100))}
		if (altA > 0) {strFP += "a"; aNote.push("a"+ Math.floor((altA / pixelcount) * 100))}
		isCanvasGetChannels = strFP
		isCanvasGet = " [%: "+ aNote.join(" ") +"]"
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

	let aStart = {}
	var known = {
		createHashes: function(window, runNo){
			let outputs = [
				{
					class: window.CanvasRenderingContext2D,
					name: "getImageData",
					value: function(){
						const METRIC = "getImageData"
						if (aSkip.includes(METRIC)) {return "skip"}
						try {
							if (runSE) {foo++}
							var context = getKnownGet()
							let imageData = context.getImageData(0,0, sizeW, sizeH)
							let data = ""
							if (typeof imageData == "object" && imageData +"" == "[object ImageData]") {
								oData[METRIC] = imageData.data
								data = mini(imageData.data)
							} else {
								data = cleanFn(imageData) +""
								oErrors[METRIC] = log_error(SECT9, METRIC, zErrType + typeof data)
								data = zErr
							}
							log_perf(SECT9, METRIC +" ["+ runNo +"]", aStart[METRIC], "", data)
							return data
						} catch(e) {
							oErrors[METRIC] = log_error(SECT9, METRIC, e)
							return zErr
						}
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInPath",
					value: function(){
						const METRIC = "isPointInPath"
						if (aSkip.includes(METRIC)) {return "skip"}
						try {
							if (runSE) {foo++}
							var context = getKnownPath()
							var data = new Uint8Array(sizeW * sizeH)
							var dataR = context.isPointInPath(0, 0)
							if (runST) {dataR = 0}
							if ("boolean" === typeof dataR) {
								for (let x = 0; x < sizeW; x++){
									for (let y = 0; y < sizeH; y++){
										data[y * sizeW + x] = context.isPointInPath(x, y)
									}
								}
								data = data.join("")
								oData[METRIC] = data
								dataR = mini(data)
							} else {
								oErrors[METRIC] = log_error(SECT9, METRIC, zErrType + typeof dataR)
								dataR = zErr
							}
							return dataR
						} catch(e) {
							oErrors[METRIC] = log_error(SECT9, METRIC, e)
							return zErr
						}
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInStroke",
					value: function(){
						const METRIC = "isPointInStroke"
						if (aSkip.includes(METRIC)) {return "skip"}
						try {
							if (runSE) {foo++}
							let context = getKnownPath()
							var data = new Uint8Array(sizeW * sizeH)
							var dataR = context.isPointInStroke(0, 0)
							if (runST) {dataR = "false"}
							if ("boolean" === typeof dataR) {
								for (let x = 0; x < sizeW; x++){
									for (let y = 0; y < sizeH; y++){
										data[y * sizeW + x] = context.isPointInStroke(x, y)
									}
								}
								data = data.join("")
								oData[METRIC] = data
								dataR = mini(data)
							} else {
								oErrors[METRIC] = log_error(SECT9, METRIC, zErrType + typeof dataR)
								dataR = zErr
							}
							return dataR
						} catch(e) {
							oErrors[METRIC] = log_error(SECT9, METRIC, e)
							return zErr
						}
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							const METRIC = "toBlob"
							if (aSkip.includes(METRIC)) {resolve("skip")}
							try {
								if (runSE) {foo++}
								var timeout = window.setTimeout(function(){
									oErrors[METRIC] = log_error(SECT9, METRIC, zErrTime)
									resolve(zErrTime)
								}, 750)
								if (!runTE) {
									getKnownTo().canvas.toBlob(function(blob){
										window.clearTimeout(timeout)
										var reader = new FileReader()
										reader.onload = function(){
											oData[METRIC] = reader.result
											if ("string" === typeof reader.result) {
												let data = mini(reader.result)
												log_perf(SECT9, METRIC +" ["+ runNo +"]", aStart[METRIC], "", data)
												resolve(data)
											} else {
												oErrors[METRIC] = log_error(SECT9, METRIC, zErrType + typeof reader.result)
												resolve(zErr)
											}
										}
										reader.onerror = function(){
											oErrors[METRIC] = log_error(SECT9, METRIC, zErr +" undefined [.onerror]")
											reject(zErr)
										}
										reader.readAsDataURL(blob)
									})
								}
							} catch(e) {
								oErrors[METRIC] = log_error(SECT9, METRIC, e)
								resolve(zErr)
							}
						})
					}
				},
				{
					name: "toDataURL",
					value: function(){
						let METRIC = "toDataURL"
						if (aSkip.includes(METRIC)) {return "skip"}
						try {
							if (runSE) {foo++}
							let data = getKnownTo().canvas.toDataURL()
							oData[METRIC] = data
							if ("string" === typeof data) {
								data = mini(data)
								log_perf(SECT9, METRIC +" ["+ runNo +"]", aStart[METRIC], "", data)
								return data
							} else {
								oErrors[METRIC] = log_error(SECT9, METRIC, zErrType + typeof data)
								return zErr
							}
						} catch(e) {
							oErrors[METRIC] = log_error(SECT9, METRIC, e)
							return zErr
						}
					}
				},
			];
			function isSupported(output){
				return !!(output.class? output.class: window.HTMLCanvasElement).prototype[output.name]
			}

			function getKnownTo(){
				let canvas = dom.kcanvasTo
				let ctx = canvas.getContext('2d')
				if (oDrawn["to"]) {return ctx}
				for (let x = 0; x < sizeW; x++) {
					for (let y = 0; y < sizeH; y++) {
						ctx.fillStyle = "rgba("+ (x*y) +","+ (x * 16) +","+ (y * 16) +",255)"
						ctx.fillRect(x, y, 1, 1)
					}
				}
				oDrawn["to"] = true
				return ctx
			}
			function getKnownGet(){
				let canvas = dom.kcanvasGet
				let ctx = canvas.getContext('2d')
				if (oDrawn["get"]) {return ctx}
				// swap x/y loop order to match getImageData uint
				for (let y=0; y < sizeH; y++) {
					for (let x=0; x < sizeW; x++) {
						ctx.fillStyle = dataToDraw[(y * sizeW) + x]
						ctx.fillRect(x, y, 1, 1)
					}
				}
				oDrawn["get"] = true
				return ctx
			}
			function getKnownPath(){
				let ctx = dom.kcanvasPath.getContext('2d')
				if (oDrawn["path"]) {return ctx}
				ctx.fillStyle = "rgba(255,255,255,255)"
				ctx.beginPath()
				ctx.rect(2,5,8,7)
				ctx.closePath()
				ctx.fill()
				oDrawn["path"] = true
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
							oErrors[output.name] = log_error(SECT9, output.name, "Error")
							displayValue = zErr
						}
					} catch(e) {
						oErrors[output.name] = log_error(SECT9, output.name, e)
						displayValue = zErr
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						oErrors[output.name] = log_error(SECT9, output.name, e)
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
	let oDrawn = {"get": false, "path": false, "to": false}
	let oRes = {}, oFP = {}, oErrors = {}, oData = {}, aSkip = [], countFake = 0

	// random getImageData
	let dataDrawn = new Uint8ClampedArray(sizeW * sizeH * 4)
	let dataToDraw = [], aPixel = []
	for (let x = 0; x < pixelcount; x++) {
		let k = x * 4
		let valueR = Math.floor(Math.random()*256),
			valueG = Math.floor(Math.random()*256),
			valueB = Math.floor(Math.random()*256)
		dataDrawn[k] = valueR
		dataDrawn[k+1] = valueG
		dataDrawn[k+2] = valueB
		dataDrawn[k+3] = 255
		dataToDraw.push("rgba("+ valueR +","+ valueG +","+ valueB +",255)")
	}

	Promise.all([
		known.createHashes(window, 1)
	]).then(function(run1){
		run1[0].forEach(function(item){
			let name = item.name,
				value = item.displayValue
			oRes[name] = {}
			oRes[name][1] = value
			if (value === zErr || value == zErrTime) {
				aSkip.push(name)
				oFP[name] = zErr
				log_display(9, name, oErrors[name] + (isSmart ? rfp_red : ""))
			} else if (!isSmart) {
				oFP[name] = name == "getImageData" ? zNA : value // the test is random, return a stable FP
				log_display(9, name, value)
			} else {
				if (name == "getImageData") {
					if (check_canvas_get(oData["getImageData"], 1)) {
						oFP[name] = "trustworthy" // the test is random, return a stable FP
						log_display(9, name, value + rfp_red) // display hash
					} else {
						oFP[name] = "protected"
						countFake++
					}
				} else {
					if (oKnown[name] == value) {
						aSkip.push(name)
						oFP[name] = value
						log_display(9, name, value + rfp_red)
					} else {
						oFP[name] = "protected"
						countFake++
					}
				}
			}
		})

		if (!isSmart || countFake == 0) {
			sDataTemp[zFP][isScope][9] = oFP
			log_section(9, t0)
			return
		}

		const canvasLiesMap = {
			getImageData: "CanvasRenderingContext2D",
			toBlob: "HTMLCanvasElement",
			toDataURL: "HTMLCanvasElement",
			convertToBlob: "OffscreenCanvas",
		}

		// smart + some lies, do 2nd run
		oDrawn = {"get": false, "path": false, "to": false}
		Promise.all([
			known.createHashes(window, 2)
		]).then(function(run2){
			run2[0].forEach(function(item){
				let value = item.displayValue
				if (value !== "skip") {
					let	note = "", stats = "", rfpvalue = ""
					name = item.name
					if (oRes[name][1] == value) {
						// persistent
						if (name.slice(0,3) == "isP") {
							note = (value === allZeros) ? rfp_green : rfp_red // all zeros
						} else {
							note = rfp_red
							// FPP
							if (isVer > 119) {
								if (!sData[SECT99].includes(canvasLiesMap[name] +"."+ name)) {
									note = fpp_green
								}
							}
						}
						rfpvalue = note == rfp_green ? " | RFP" : (note == fpp_green ? " | FPP" : "")
						if (name == "getImageData") {
							check_canvas_get(oData[name], 2)
							stats = isCanvasGet
							rfpvalue += " | "+ isCanvasGetChannels
						}
						oFP[name] = "protected | persistent"+ rfpvalue
						log_display(9, name, value + note +" [persistent]"+ stats)
					} else {
						// per execution
						if (name.slice(0,3) == "isP") {
							note = rfp_red
						} else if (name.slice(0,2) == "to") {
							note = check_canvas_to(oData[name]) ? rfp_green : rfp_red
						} else {
							note = check_canvas_get(oData[name], 2) ? rfp_green : rfp_red
						}
						rfpvalue = note == rfp_green ? " | RFP" : ""
						if (name == "getImageData") {
							stats = isCanvasGet
							rfpvalue += " | "+ isCanvasGetChannels
						}
						oFP[name] = "protected | per execution"+ rfpvalue
						log_display(9, name, value + note +" [per execution]"+ stats)
					}
				}
			})
			sDataTemp[zFP][isScope][9] = oFP
			log_section(9, t0)
		})
	})
}

countJS(SECT9)
