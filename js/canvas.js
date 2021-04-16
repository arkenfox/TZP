"use strict";

/* outputCanvas() based on https://canvasblocker.kkapsner.de/test/ */

function outputCanvas() {
	let t0 = performance.now(),
		main0 = [], main1 = [], main2 = [],
		sColor = s9
	let known1 = "8c70ed9a7dbe6d72e3d1a4e448522012661cfbed", // toDataURL,toBlob,mozGetAsFile [gecko]
		known2 = "67a2c3bc2f7ccf8c92d57b94586784f19d98a2f0", // getImageData
		known3 = "f44c70171a197cc26df382603e76f4ba581e2d8f", // isPointInPath
		known4 = "1b636fb26edee73d7ca832edd1112e0021566a50" // isPointInStroke
	if (isEngine == "blink") {
		known1 = "bb0b94e1c96429c0a12d8999ac5697d3dfb63fbf" // toDataURL,toBlob
	} else if (isEngine == "webkit") {
		known1 = "24c8af813fb7001ded7e81e125e9d3237e9400d5" // toDataURL,toBlob
	}

	// analyze
	function analyzeCanvas(runtype, res1, res2, res3) {
		let chash1 = [],
			bypass = [],
			diff78 = false,
			error_string = "error while testing"

		function display_value(item, value1, value2, value3) {
			// vars
			let isRandom = false,
				pushvalue = value1,
				control = "e5d9fd78536844cc8a4144ddb7a03eb9628f12c7c8b7828f942cadf6efb79ac0", // 220x30 white RFP
				combined = "",
				sname = item.substring(0,4)
			let element = dom.tb9.querySelector("."+ item)
			// cleanup
			if (value1 == error_string || value2 == error_string) {
				// not two valid results
				value1 = error_string
				pushvalue = value1
			} else if (value1.substring(0,14) == "ReferenceError") {
				// blocked
				value1 = zB0
				pushvalue = zB0
			} else if (value1== "42c4b0e3141cfc98c8f4fb9a24b96f99e441ae274c939b641b9995a455b85278") {
				// sha256 of undefined
				value1 = zU
				value2 = zU
				pushvalue = zU
			} else if (value1 !== value2) {
				// randomness
				isRandom = true
				pushvalue = "random"
				combined = "random "+ sColor +" [1] "+ sc + value1.substring(0,22) +".."
					+ sColor +" [2] "+ sc + value2.substring(0,22) +".."
			}

			// noise: used if !isRandom and value3 = true
			let noise = "noise detected "+ sColor +" [both] "+ sc + value1.substring(0,40) +".."
			// reset value3 if not blink/webkit/gecko, not a hash
			if (isFF || isEngine == "blink" || isEngine == "webkit") {} else {value3 = "true"}
			if (value1.length !== 64) {value3 = "true"
			} else if (value1.indexOf(" ") !== -1) {value3 = "true"}

			// hashes: static
			if (sname == "isPo") {
				control = "957c80fa4be3af7e53b40c852edf96a090f09958cc7f832aaf9a9fd544fb69a8"
				if (isRandom) {value1 = combined
				} else if (value1 == control && isRFP) { // do nothing
				} else if (value3 == "false") {
					value1 = noise
					pushvalue = "noise"
				}
				value1 += (value1 == control ? rfp_green : rfp_red)
			}
			if (sname == "mozG" && isVer < 74) {
				if (isRandom) {value1 = combined
				} else if (value1 == control && isRFP) { // do nothing
				} else if (value3 == "false") {
					value1 = noise
					pushvalue = "noise"
				}
				value1 += (value1 == control ? rfp_green : rfp_red)
			}
			// hashes: randomized/static
			if (sname == "toDa" || sname == "toBl" || sname == "getI") {
				// control
				if (sname == "getI") {
					control = "03fedeb80c3f8ebf2ed864024e9967256468d64dbe847f202ad06a60f2b3d9b3" // 220x30
				}
				if (value1 == error_string) {
					value1 += (isVer > 77 ? rfp_random_red : rfp_red)
				} else {
					if (isRandom) {value1 = combined}
					if (isVer > 77) {
						// 78+: random
						if (isRandom) {
							if (isRFP) {
								pushvalue = "random rfp"
								// toDataURL vs toBlob
								if (sname == "toDa" || sname == "toBl") {
									if (!diff78) {pushvalue = "random"}
								}
							} else {
								pushvalue = "random"
							}
							value1 += (pushvalue == "random rfp" ? rfp_random_green : rfp_random_red)
						} else {
							// 78+: not random
							if (value3 == "false") {
								// noise
								pushvalue = "noise"
								value1 = noise + rfp_random_red
							} else {
								// no-noise
								value1 += rfp_random_red
							}
						}
					} else {
						// <78: static
						if (isRandom) {value1 = combined
						} else if (value1 == control && isRFP) { // do nothing
						} else if (value3 == "false") {
							value1 = noise
							pushvalue = "noise"
						}
						value1 += (value1 == control ? rfp_green : rfp_red)
					}
				}
			}
			// bypass, push & display (ignore mozGetAsFile: not worth supporting)
			if (sname == "toBl" || sname == "toDa") {
				bypass.push(item +":"+ pushvalue)
			} else {
				chash1.push(item +":"+ pushvalue)
			}
			element.innerHTML = value1
			// lies
			if (gRun) {
				if (pushvalue.substring(0,6) == "random") {
					gLiesKnown.push("canvas:"+ item)
				}
			}
		}

		// 78+: track toDataURL vs toBlob randomness
		let valueB = "", valueD = ""
		for (let i=0; i < res1.length; i++) {
			let str1 = res1[i],
				delim = str1.search(","),
				display = str1.substring(0,delim)
			if (display == "toBlob") {
				valueB = str1.substring(delim+1, str1.length)
			} else if (display == "toDataURL") {
				valueD = str1.substring(delim+1, str1.length)
			}
		}
		if (valueB !== valueD) {diff78 = true}

		// sort arrays, output values
		res1.sort()
		res2.sort()
		res3.sort()
		for (let i=0; i < res1.length; i++) {
			let str1 = res1[i],
				str2 = res2[i],
				str3 = res3[i],
				delim = str1.search(","),
				display = str1.substring(0,delim),
				value1 = str1.substring(delim+1, str1.length),
				value2 = str2.substring(delim+1, str2.length),
				value3 = str3.substring(delim+1, str3.length)
			display_value(display, value1, value2, value3)
		}
		// bypass: get valid hash
		let bpValue = ""
		for (let i=0; i < bypass.length; i++) {
			let	chkValue = bypass[i].split(":")[1]
			if (chkValue.length == 64 && chkValue.indexOf(" ") == -1) {
				bpValue = chkValue
			}
		}
		// bypass: propagate valid hash, record bypass
		if (bpValue !== "") {
			for (let i=0; i < bypass.length; i++) {
				let bpName = bypass[i].split(":")[0],
					bpOld = bypass[i].split(":")[1],
					bpNew = bypass[i]
				if (bpValue !== bpOld) {
					bpNew = bpName +":"+ bpValue
					if (gRun) {gLiesBypassed.push("canvas:"+ bpNew)}
				}
				chash1.push(bpNew)
			}
		}
		// section
		log_section("canvas", t0, chash1)
	}

	var canvas = {
		createHashes: function(window, runNo){
			let outputs = [
				{
					name: "getContext",
						value: function(){
						return ["2d"].map(function(type){
							var canvas = getCanvas()
							try {
								var context = canvas.getContext(type)
								if (!context){
									throw new Error()
								}
								return type +": supported"
							}
							catch (e){
								return type +": "+ zNS
							}
						}).join(", ")
					}
				},
				{
					name: "toDataURL",
					value: function(){
						let t1 = performance.now()
						let data = hashDataURL(getFilledContext().canvas.toDataURL())
						log_perf("toDataURL ["+ runNo +"] [canvas]",t1)
						return data
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							let t1 = performance.now()
							try {
								var timeout = window.setTimeout(function(){
									reject("timout in toBlob")
								}, 750)
							getFilledContext().canvas.toBlob(function(blob){
								window.clearTimeout(timeout)
								var reader = new FileReader()
								reader.onload = function(){
									let data = hashDataURL(reader.result)
									log_perf("toBlob ["+ runNo +"] [canvas]",t1)
									resolve(data)
								}
								reader.onerror = function(){
									reject("Unable to read blob!")
								}
								reader.readAsDataURL(blob)
							})
							}
							catch (e){
								resolve((e.name == "TypeError" ? "" : e.name +":") + e.message)
							}
						})
					}
				},
				{
					name: "mozGetAsFile",
					value: function(){
						return new Promise(function(resolve, reject){
							var file = getFilledContext().canvas.mozGetAsFile("canvas.png")
							var reader = new FileReader()
							reader.onload = function(){
								resolve(hashDataURL(reader.result))
							}
							reader.readAsDataURL(file)
						})
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "getImageData",
					value: function(){
						let t1 = performance.now()
						var context = getFilledContext()
						var imageData = context.getImageData(0,0, context.canvas.width, context.canvas.height)
						let data = window.crypto.subtle.digest("SHA-256", imageData.data).then(hashToString)
						log_perf("getImageData ["+ runNo +"] [canvas]",t1)
						return data
					}
				},
				{
					supported: function(){
						var context = getContext()
						context.rect(0,0,10,10)
						context.rect(2,2,6,6)
						return context.isPointInPath(5, 5, 'evenodd') === false
					},
					name: "winding",
					value: function(){
						return "supported"
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInPath",
					value: function(){
						let t1 = performance.now()
						var context = getPathContext()
						var data = new Uint8Array(30 * 30)
						for (var x = 0; x < 30; x += 1){
							for (var y = 0; y < 30; y += 1){
								data[y * 30 + x] = context.isPointInPath(x, y)
							}
						}
						let dataR = window.crypto.subtle.digest("SHA-256", data).then(hashToString)
						log_perf("isPointInPath ["+ runNo +"] [canvas]",t1) //,gt0,dataR)
						return dataR
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInStroke",
					value: function(){
						let t1 = performance.now()
						var context = getPathContext()
						var data = new Uint8Array(30 * 30)
						for (var x = 0; x < 30; x += 1){
							for (var y = 0; y < 30; y += 1){
								data[y * 30 + x] = context.isPointInStroke(x, y)
							}
						}
						let dataR = window.crypto.subtle.digest("SHA-256", data).then(hashToString)
						log_perf("isPointInStroke ["+ runNo +"] [canvas]",t1) //,gt0,dataR)
						return dataR
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "fillText",
					value: function(){
						getContext().fillText("test",0,0)
						return "supported"
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "strokeText",
					value: function(){
						getContext().strokeText("test",0,0)
						return "supported"
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
				return crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(url)).then(hashToString)
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
					} catch (e){
						displayValue = (e.name == "TypeError" ? "" : e.name +": ") + e.message
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						output.displayValue = "error while testing"
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
						let t1 = performance.now()
						let data = sha1(getKnown().canvas.toDataURL())
						log_perf("toDataURL [k] [canvas]",t1,gt0,data)
						if (gRun) {if (data !== known1) {gLiesKnown.push("canvas:toDataURL")}}
						return (data == known1 ? true : false)
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							let t1 = performance.now()
							try {
								var timeout = window.setTimeout(function(){
									reject(false)
								}, 750)
							getKnown().canvas.toBlob(function(blob){
								window.clearTimeout(timeout)
								var reader = new FileReader()
								reader.onload = function(){
									let data = sha1(reader.result)
									log_perf("toBlob [k] [canvas]",t1,gt0,data)
									if (gRun) {if (data !== known1) {gLiesKnown.push("canvas:toBlob")}}
									resolve(data == known1 ? true : false)
								}
								reader.onerror = function(){
									reject(false)
								}
								reader.readAsDataURL(blob)
							})
							}
							catch (e){
								resolve(false)
							}
						})
					}
				},
				{
					name: "mozGetAsFile",
					value: function(){
						return new Promise(function(resolve, reject){
							var file = getKnown().canvas.mozGetAsFile("known.png")
							var reader = new FileReader()
							reader.onload = function(){
								let data = sha1(reader.result)
								if (gRun) {if (data !== known1) {gLiesKnown.push("canvas:mozGetAsFile")}}
								resolve(data == known1 ? true : false)
							}
							reader.readAsDataURL(file)
						})
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "getImageData",
					value: function(){
						let t1 = performance.now()
						var context = getKnown()
						let imageData = []
						for (let x=0; x < 16; x++) {
							for (let y=0; y < 16; y++) {
								let pixel = context.getImageData(x,y,1,1)
								imageData.push(pixel.data)
							}
						}
						let data = sha1(imageData.join())
						log_perf("getImageData [k] [canvas]",t1,gt0,data)
						if (gRun) {if (data !== known2) {gLiesKnown.push("canvas:getImageData")}}
						return (data == known2 ? true : false)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInPath",
					value: function(){
						let t1 = performance.now()
						let context2 = getKnownPath()
						let pathData = []
						for (let x = 0; x < 16; x++){
							for (let y = 0; y < 16; y++){
								pathData.push(context2.isPointInPath(x, y))
							}
						}
						let data = sha1(pathData.join())
						log_perf("isPointInPath [k] [canvas]",t1,gt0,data)
						if (gRun) {if (data !== known3) {gLiesKnown.push("canvas:isPointInPath")}}
						return (data == known3 ? true : false)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInStroke",
					value: function(){
						let t1 = performance.now()
						let context2 = getKnownPath()
						let pathStroke = []
						for (let x = 0; x < 16; x++){
							for (let y = 0; y < 16; y++){
								pathStroke.push(context2.isPointInStroke(x, y))
							}
						}
						let data = sha1(pathStroke.join())
						log_perf("isPointInStroke [k] [canvas]",t1,gt0,data)
						if (gRun) {if (data !== known4) {gLiesKnown.push("canvas:isPointInStroke")}}
						return (data == known4 ? true : false)
					}
				},
				// add so arrays match
				{ name: "getContext", value: function(){return true}},
				{ name: "fillText", value: function(){return true}},
				{ name: "winding", value: function(){return true}},
				{ name: "strokeText", value: function(){return true}},
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
					} catch (e){
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
			main0.push(output.name +","+ output.displayValue)
		})
		outputs[1].forEach(function(output){
			main1.push(output.name +","+ output.displayValue)
		})
		outputs[2].forEach(function(output){
			main2.push(output.name +","+ output.displayValue)
		})
		analyzeCanvas("main", main0, main1, main2)
	})
	// ToDo: canvas: iframe, offScreen
}

countJS("canvas")
