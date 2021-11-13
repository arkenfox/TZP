"use strict";

/* outputCanvas() based on https://canvasblocker.kkapsner.de/test/ */

function outputCanvas() {
	let t0; if (canPerf) {t0 = performance.now()}
	let res0 = [], res1 = [], res2 = []
	var isSHA = "SHA-1"

	// ToDo: apply isVer check for FF95+
	let known1 = [ // gecko: toDataURL, toBlob
		//"749d6141",
		"b7bf4776", // 8c70ed9a7dbe6d72e3d1a4e448522012661cfbed
		"bdcce913", // 1724331 FF96+ (also see 1737038)
	],
		known2 = "749d6141", // getImageData
		known3 = ["e5b3726b"], // isPointInPath
		known4 = ["e262d7f1"]  // isPointInStroke
	if (isEngine == "blink") {
		known1 = ["bb0b94e1c96429c0a12d8999ac5697d3dfb63fbf",
			"05f24fe5cfa497c8bebf1749188ab5fbd2b7c188", // 
			"c05807c783bd281ee83d13807426023390c7d66a", // 117efe05
		]
	} else if (isEngine == "webkit") {
		known1 = ["24c8af813fb7001ded7e81e125e9d3237e9400d5"]
	}
	if (isBrave && isFile) {
		// false positives
		known3.push("dfb223f3")
		known4.push("dfb223f3")
	}

	// analyze
	function analyze() {
		// get data
		let nHash = isSHA == "SHA-256" ? 64 : 40
		let useKnown = (isFF || isEngine == "blink" || isEngine == "webkit")
		let aBlock = [], aIndex = [], aValue = [], aKnown = [], aPass = []
		let compareBlob = "", compareDataURL = "", ffBlob = "", ffDataURL = ""
		for (let i=0; i < res1.length; i++) {
			let str0 = res0[i], str1 = res1[i], str2 = res2[i]
			let delim = str0.search(",")
			let name = str0.substring(0,delim),
				val0 = str0.substring(delim+1, str0.length) +"",
				val1 = str1.substring(delim+1, str1.length),
				val2 = str2.substring(delim+1, str2.length)
			if (val0 == "") {val0 = "empty string"}
			// index
			aIndex.push(name)
			// blocks = not a hash
			let isBlock = (val0.length !== nHash || val1.length !== nHash)
			if (val0.indexOf(" ") !== -1 || val1.indexOf(" ") !== -1) {isBlock = true}
			aBlock.push(isBlock ? true : false)
			// per execution = if valid hashes
			if (isBlock) {aPass.push(true)} else {aPass.push(val0 == val1 ? true : false)}
			// value = force non-hash if required
			if (isBlock && val0.length == nHash && val0.indexOf(" ") == -1) {val0 = val1}
			// rehash shorter
			if (!isBlock && isSHA == "SHA-256") {val0 = sha1(val0, "canvas "+ name)}
			aValue.push(val0) 
			// lies = from known: valid hash + engine
			if (!useKnown || isBlock) {val2 = "true"}
			aKnown.push(val2 == "true" ? true : false)
			// valid hashes
			if (!isBlock) {
				if (val2 == "true" && aPass[i] == true) {
					if (name == "toBlob") {compareBlob = val0
					} else if (name == "toDataURL") {compareDataURL = val0}
				}
				// RFP
				if (name == "toBlob") {ffBlob = val0
				} else if (name == "toDataURL") {ffDataURL = val0}
			}
		}
		// bypass
		let bypassValue = "", bypassTarget = ""
		if (compareBlob !== compareDataURL) {
			bypassTarget = compareBlob == "" ? "toBlob" : "toDataURL"
			bypassValue = compareBlob + compareDataURL
			if (gRun) {gKnown.push("canvas:"+ bypassTarget)}
		}
		// record & display
		let aRecord = []
		for (let i=0; i < aIndex.length; i++) {
			let item = aIndex[i]
			let element = dom.tb9.querySelector("."+ item)
			let display = aValue[i], record = display
			// block first
			if (aBlock[i] == true) {record = zB0}
			// bypass can override block
			if (item == bypassTarget) {
				display = soB + display + scC; record = bypassValue
				if (gRun) {gBypassed.push("canvas:"+ bypassTarget +":"+ bypassValue)}
			} else if (aKnown[i] == false && aBlock[i] == false || aPass[i] == false) {
				// otherwise color up lies but not blocks
				display = soL + display + scC; record = zLIE
			}
			aRecord.push(item +":"+ record)
			// notation
			if (isFF && aBlock[i] == false) {
				let control = ""
				let test = aValue[i]
				if (item.substring(0,4) == "isPo") {
					control = "472a2a3d8f0f23a00a1d25dec73833bdc8a4457e"
					display += (test == control ? rfp_green : rfp_red)
				}
				// static
				if (isVer < 78) {
					if (item == "toDataURL" || item == "toBlob") {
						control = "89346bd04959d09543a87649da1321e88c195a04" // 220x30 white
						display += (test == control ? rfp_green : rfp_red)
					} else if (item == "getImageData") {
						control = "c4492552ef059c1c7d8042da6f818fc07064e8e5"
						display += (test == control ? rfp_green : rfp_red)
					}
				}
				// random
				if (isVer > 77) {
					if (item == "toDataURL" || item == "toBlob" || item == "getImageData") {
						let notation = rfp_random_red
						// RFP on, two pass is random
						if (isRFP && aPass[i] == false) {
							// toBlob !== toDataURL 
							if (item == "toDataURL" || item == "toBlob") {
								if (ffBlob !== ffDataURL) {notation = rfp_random_green}
							} else if (item == "getImageData") {
								notation = rfp_random_green
							}
						}
						display += notation
					}
				}
			}
			// if blocked and not bypassed
			if (aBlock[i] == true && item !== bypassTarget) {
				display = trim_error(aValue[i])
			}
			element.innerHTML = display
		}
		// methods & lies
		if (gRun) {
			let mPass = [], mPersist = []
			for (let i=0; i < aIndex.length; i++) {
				if (aKnown[i] == false || aPass[i] == false) {gKnown.push("canvas:"+ aIndex[i])}
				if (aBlock[i] == true) {
					log_error("canvas: "+ aIndex[i], aValue[i])
				} else if (aPass[i] == false) {
					mPass.push(aIndex[i])
				} else if (aKnown[i] == false) {
					mPersist.push(aIndex[i])
				}
			}
			let max = aIndex.length
			if (mPass.length) {gMethods.push("canvas:random per execution:"+ (mPass.length == max ? "all" : mPass.join()))}
			if (mPersist.length) {gMethods.push("canvas:persistent noise:"+ (mPersist.length == max ? "all" : mPersist.join()))}
		}
		// section
		log_section("canvas", t0, aRecord)
	}

	var canvas = {
		createHashes: function(window, runNo){
			let outputs = [
				{
					name: "toDataURL",
					value: function(){
						try {
							let t1; if (canPerf) {t1 = performance.now()}
							let data = hashData(getFilledContext().canvas.toDataURL())
							log_perf("toDataURL ["+ runNo +"] [canvas]",t1)
							return data
						} catch(e) {
							return(e.name === undefined ? zErr : e.name +": " + e.message)
						}
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							let t1; if (canPerf) {t1 = performance.now()}
							try {
								var timeout = window.setTimeout(function(){
									reject("timeout")
								}, 750)
								getFilledContext().canvas.toBlob(function(blob){
									window.clearTimeout(timeout)
									var reader = new FileReader()
									reader.onload = function(){
										let data = hashData(reader.result)
										log_perf("toBlob ["+ runNo +"] [canvas]",t1)
										resolve(data)
									}
									reader.onerror = function(){
										reject("unable to read blob!")
									}
									reader.readAsDataURL(blob)
								})
							} catch(e) {
								resolve(e.name === undefined ? zErr : e.name +": " + e.message)
							}
						})
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "getImageData",
					value: function(){
						let t1; if (canPerf) {t1 = performance.now()}
						var context = getFilledContext()
						var imageData = context.getImageData(0,0, context.canvas.width, context.canvas.height)
						let data = window.crypto.subtle.digest(isSHA, imageData.data).then(hashToString)
						log_perf("getImageData ["+ runNo +"] [canvas]",t1)
						return data
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInPath",
					value: function(){
						let t1; if (canPerf) {t1 = performance.now()}
						var context = getPathContext()
						var data = new Uint8Array(30 * 30)
						for (var x = 0; x < 30; x += 1){
							for (var y = 0; y < 30; y += 1){
								data[y * 30 + x] = context.isPointInPath(x, y)
							}
						}
						let dataR = window.crypto.subtle.digest(isSHA, data).then(hashToString)
						log_perf("isPointInPath ["+ runNo +"] [canvas]",t1)
						return dataR
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInStroke",
					value: function(){
						let t1; if (canPerf) {t1 = performance.now()}
						var context = getPathContext()
						var data = new Uint8Array(30 * 30)
						for (var x = 0; x < 30; x += 1){
							for (var y = 0; y < 30; y += 1){
								data[y * 30 + x] = context.isPointInStroke(x, y)
							}
						}
						let dataR = window.crypto.subtle.digest(isSHA, data).then(hashToString)
						log_perf("isPointInStroke ["+ runNo +"] [canvas]",t1)
						return dataR
					}
				},
			];
			function isSupported(output){
				return !!(output.class? output.class: window.HTMLCanvasElement).prototype[output.name]
			}
			function getCanvas(){
				return window.document.createElement("canvas")
			}
			function getContext(type){
				return getCanvas().getContext(type || "2d")
			}
			function getFilledContext(){
				var context = getContext()
				var canvas = context.canvas
				canvas.width = 220
				canvas.height = 30
				canvas.style.display = "inline"
				context.rect(0,0,10,10)
				context.rect(2,2,6,6)
				// ToDo: canvas
					// add background complexity: colors/shapes/overlaps
					// more complex/better text
					// stability: remove or split text off? e.g. block Arial, TNR fallback = !zoom resistance
				// NOTE: no unicode/emojis
				let fpText = "BrowserLeaks,com <canvas> 10"
				context.textBaseline = "top";
				context.font = "14px 'Arial'"; // arial seems zoom resistent
				context.textBaseline = "alphabetic";
				context.fillStyle = "#f60";
				context.fillRect(125,1,62,20);
				context.fillStyle = "#069";
				context.fillText(fpText,2,15);
				context.fillStyle = "rgba(102, 204, 0, 0.7)";
				context.fillText(fpText,4,17);
				// blending
				context.globalCompositeOperation = "multiply"
				context.fillStyle = "rgb(255,0,255)"
				context.beginPath()
				context.arc(50,50,50,0, Math.PI * 2, true)
				context.closePath()
				context.fill()
				context.fillStyle = "rgb(0,255,255)"
				context.beginPath()
				context.arc(100,50,50,0, Math.PI * 2, true)
				context.closePath()
				context.fill()
				context.fillStyle = "rgb(255,255,0)"
				context.beginPath()
				context.arc(75,100,50,0, Math.PI * 2, true)
				context.closePath()
				context.fill()
				context.fillStyle = "rgb(255,0,255)"
				// winding
				context.arc(75,75,75,0, Math.PI * 2, true)
				context.arc(75,75,25,0, Math.PI * 2, true)
				context.fill("evenodd")
				return context
			}
			function getPathContext(){
				var context = getContext()
				context.canvas.width = 30
				context.canvas.height = 30
				context.fillStyle = "#000"
				context.beginPath()
				context.arc(15.49, 15.51, 10.314, 0, Math.PI * 2)
				context.closePath()
				context.fill()
				return context
			}
			function hashToString(hash){
				var chunks = [];
				(new Uint32Array(hash)).forEach(function(num){
					chunks.push(num.toString(16))
				})
				return chunks.map(function(chunk){
					return "0".repeat(8 - chunk.length) + chunk
				}).join("")
			}
			function hashDataURL(url){
				return crypto.subtle.digest(isSHA, new TextEncoder("utf-8").encode(url)).then(hashToString)
			}
			function hashData(data) {
				if (data === null) {data = "null"
				} else if (data === undefined) {data = "undefined"
				} else if (data === true || data == "true") {data = "true"
				} else if (data === false || data == "false") {data = "false"
				} else if (data === 0) {data = "0"
				} else if (data === "") {data = "empty string"
				} else if (data === []) {data = "empty array"
				} else {data = hashDataURL(data)}
				return data
			}
			var finished = Promise.all(outputs.map(function(output){
				return new Promise(function(resolve, reject){
					var displayValue
					try {
						var supported = output.supported? output.supported(): isSupported(output);
						if (supported){
							displayValue = output.value()
						} else {
							displayValue = zNS
						}
					} catch(e) {
						displayValue = (e.name === undefined ? zErr : e.name +": " + e.message)
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						output.displayValue = (e.name === undefined ? zErr : e.name +": " + e.message)
						resolve(output)
					})
				})
			}))
			return finished
		}
	}

	var known = {
		createHashes: function(window){
			let outputs = [
				{
					name: "toDataURL",
					value: function(){
						let t1; if (canPerf) {t1 = performance.now()}
						let data = getKnown().canvas.toDataURL()
						let str = "canvas [k] todataurl"
						data = (isFF ? mini(data, str) : sha1(data, str))
						log_perf("toDataURL [k] [canvas]",t1,gt0,data)
						return (known1.includes(data))
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							let t1; if (canPerf) {t1 = performance.now()}
							try {
								var timeout = window.setTimeout(function(){
									reject(false)
								}, 750)
							getKnown().canvas.toBlob(function(blob){
								window.clearTimeout(timeout)
								var reader = new FileReader()
								reader.onload = function(){
									let str = "canvas [k] toblob"
									let data = (isFF ? mini(reader.result, str) : sha1(reader.result, str))
									log_perf("toBlob [k] [canvas]",t1,gt0,data)
									resolve(known1.includes(data))
								}
								reader.onerror = function(){
									reject(false)
								}
								reader.readAsDataURL(blob)
							})
							}
							catch(e) {
								resolve(false)
							}
						})
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "getImageData",
					value: function(){
						let t1; if (canPerf) {t1 = performance.now()}
						var context = getKnown()
						let imageData = context.getImageData(0,0,16,16)
						let data = mini(imageData.data, "canvas [k] getimagedata")
						log_perf("getImageData [k] [canvas]",t1,gt0,data)
						return (data == known2 ? true : false)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInPath",
					value: function(){
						let t1; if (canPerf) {t1 = performance.now()}
						let context2 = getKnownPath()
						let pathData = []
						for (let x = 0; x < 16; x++){
							for (let y = 0; y < 16; y++){
								pathData.push(context2.isPointInPath(x, y))
							}
						}
						let data = mini(pathData.join(), "canvas [k] ispointinpath")
						log_perf("isPointInPath [k] [canvas]",t1,gt0,data)
						return (known3.includes(data) ? true : false)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInStroke",
					value: function(){
						let t1; if (canPerf) {t1 = performance.now()}
						let context2 = getKnownPath()
						let pathStroke = []
						for (let x = 0; x < 16; x++){
							for (let y = 0; y < 16; y++){
								pathStroke.push(context2.isPointInStroke(x, y))
							}
						}
						let data = mini(pathStroke.join(), "canvas [k] ispointinstroke")
						log_perf("isPointInStroke [k] [canvas]",t1,gt0,data)
						return (known4.includes(data) ? true : false)
					}
				},
			];
			function isSupported(output){
				return !!(output.class? output.class: window.HTMLCanvasElement).prototype[output.name]
			}
			function getKnown(){
				let canvas = dom.kcanvas1
				let ctx = canvas.getContext('2d')
				for (let x=0; x < 16; x++) {
					for (let y=0; y < 16; y++) {
						ctx.fillStyle = "rgba("+ (x*y) +","+ (x*16) +","+ (y*16) +",255)"
						ctx.fillRect(x, y, 1, 1)
					}
				}
				return ctx
			}
			function getKnownPath(){
				let canvas2 = dom.kcanvas2
				let ctx2 = canvas2.getContext('2d')
				ctx2.fillStyle = "rgba(255,255,255,255)"
				ctx2.beginPath()
				ctx2.rect(2,5,8,7)
				ctx2.closePath()
				ctx2.fill()
				return ctx2
			}
			var finished = Promise.all(outputs.map(function(output){
				return new Promise(function(resolve, reject){
					var displayValue
					try {
						var supported = output.supported? output.supported(): isSupported(output);
						if (supported){
							displayValue = output.value()
						} else {
							displayValue = false
						}
					} catch(e) {
						displayValue = false
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						output.displayValue = false
						resolve(output)
					})
				})
			}))
			return finished
		}
	}

	Promise.all([
		canvas.createHashes(window, 1),
		canvas.createHashes(window, 2),
		known.createHashes(window),
	]).then(function(outputs){
		outputs[0].forEach(function(output){
			res0.push(output.name +","+ output.displayValue)
		})
		outputs[1].forEach(function(output){
			res1.push(output.name +","+ output.displayValue)
		})
		outputs[2].forEach(function(output){
			res2.push(output.name +","+ output.displayValue)
		})
		res0.sort()
		res1.sort()
		res2.sort()
		analyze(res0, res1, res2)
	})
}

countJS("canvas")
