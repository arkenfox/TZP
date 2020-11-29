"use strict";

/* outputCanvas() based on kkapsner and canvasblocker
https://canvasblocker.kkapsner.de/test/
https://github.com/kkapsner/CanvasBlocker */

function outputCanvas() {
	// vars
	let t0 = performance.now(),
		main0 = [], main1 = [], main2 = [],
		sColor = s9
	let known1 = "8c70ed9a7dbe6d72e3d1a4e448522012661cfbed", // toDataURL, toBlob, mozGetAsFile [gecko]
		known2 = "67a2c3bc2f7ccf8c92d57b94586784f19d98a2f0",   // getImageData
		known3 = "f44c70171a197cc26df382603e76f4ba581e2d8f",   // isPointInPath
		known4 = "1b636fb26edee73d7ca832edd1112e0021566a50"    // isPointInStroke
	if (isEngine == "blink") {
		known1 = "bb0b94e1c96429c0a12d8999ac5697d3dfb63fbf"    // toDataURL, toBlob [blink]
	} else if (isEngine == "webkit") {
		known1 = "24c8af813fb7001ded7e81e125e9d3237e9400d5"    // toDataURL, toBlob [webkit]
	}

	// analysis after promsies
	function analyzeCanvas(runtype, res1, res2, res3) {
		// vars
		let chash1 = [],
			diff78 = false,
			is78rfp = false,
			error_string = "error while testing"
		// RFP
		if (isVer > 77) {
			if (get_RFP() == true) {is78rfp = true}
		}

		function display_value(item, value1, value2, value3) {
			// vars
			let isRandom = false,
				pushvalue = value1,
				control = "d87b36e65e37d411ac204db663f0ec05fe94bf7b6df537bab3f11052d1621ecc", // white RFP
				combined = "",
				sname = item.substring(0,4)
			let element = dom.tb9.querySelector("." + item)
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
				combined = "random " + sColor +" [1] "+ sc + value1.substring(0,22) + ".."
					+ sColor +" [2] "+ sc + value2.substring(0,22) + ".."
			}

			// noise: used only if !isRandom
			let noise = "noise detected " + sColor +" [both] "+ sc + value1.substring(0,40) + ".."
			// only use noise for FF & blink & webkit
			if (isFF || isEngine == "blink" || isEngine == "webkit") {} else {value3 = "true"}
			// only apply to hashes
			if (value1.length !== 64) {value3 = "true"}
			if (value1.indexOf(" ") > 0) {value3 = "true"}

			// hashes: static
			if (sname == "isPo") {
				control = "957c80fa4be3af7e53b40c852edf96a090f09958cc7f832aaf9a9fd544fb69a8"
				if (isRandom) {value1 = combined
				} else if (value1 == control) {
				} else if (value3 == "false") {
					value1 = noise
					pushvalue = "tampered"
				}
				value1 += (value1 == control ? rfp_green : rfp_red)
			}
			if (sname == "mozG" && isVer < 74) {
				if (isRandom) {value1 = combined
				} else if (value3 == "false" && value1 !== control) {
					value1 = noise
					pushvalue = "tampered"
				}
				value1 += (value1 == control ? rfp_green : rfp_red)
			}
			// hashes: randomized/static
			if (sname == "toDa" || sname == "toBl" || sname == "getI") {
				// control
				if (sname == "getI") {
					control = "ae8d89f4cb47814af5d79e63a1a60b3f3f28d9309189b7518f1ecc23d8bda282"
				}
				if (value1 == error_string) {
					value1 += (isVer > 77 ? rfp_random_red : rfp_red)
				} else {
					if (isRandom) {value1 = combined}
					if (isVer > 77) {
						// 78+: random
						if (isRandom) {
							if (is78rfp) {
								pushvalue = "random rfp"
								// toDataURL vs toBlob
								if (sname == "toDa" || sname == "toBl") {
									if (!diff78) {pushvalue = "random ext"}
								}
							} else {
								pushvalue = "random ext"
							}
							value1 += (pushvalue == "random rfp" ? rfp_random_green : rfp_random_red)
						} else {
							// 78+: not random
							if (value3 == "false") {
								// noise
								pushvalue = "tampered"
								value1 = noise + rfp_random_red
							} else {
								// no-noise
								value1 += rfp_random_red
							}
						}
					} else {
						// <78: static
						if (value1 !== control) {
							// noise
							if (isRandom == false && value3 == "false") {
								pushvalue = "tampered"
								value1 = noise
							}
						}
						value1 += (value1 == control ? rfp_green : rfp_red)
					}
				}
			}
			// push + display
			chash1.push(item+":"+pushvalue)
			element.innerHTML = value1
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
		// section
		section_info("canvas", t0, gt0, chash1)
	}

	var canvas = {
		createHashes: function(window){
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
								return type + ": supported"
							}
							catch (e){
								return type + ": not supported"
							}
						}).join(", ")
					}
				},
				{
					name: "toDataURL",
					value: function(){
						return hashDataURL(getFilledContext().canvas.toDataURL())
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							try {
								var timeout = window.setTimeout(function(){
									reject("timout in toBlob")
								}, 750)
							getFilledContext().canvas.toBlob(function(blob){
								window.clearTimeout(timeout)
								var reader = new FileReader()
								reader.onload = function(){
									resolve(hashDataURL(reader.result))
								}
								reader.onerror = function(){
									reject("Unable to read blob!")
								}
								reader.readAsDataURL(blob)
							})
							}
							catch (e){
								resolve((e.name == "TypeError" ? "" : e.name + ":" ) + e.message)
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
						var context = getFilledContext()
						var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
						return window.crypto.subtle.digest("SHA-256", imageData.data).then(hashToString)
					}
				},
				{
					supported: function(){
						// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
						var context = getContext()
						context.rect(0, 0, 10, 10)
						context.rect(2, 2, 6, 6)
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
						var context = getPathContext()
						var data = new Uint8Array(30 * 30)
						for (var x = 0; x < 30; x += 1){
							for (var y = 0; y < 30; y += 1){
								data[y * 30 + x] = context.isPointInPath(x, y)
							}
						}
						return window.crypto.subtle.digest("SHA-256", data).then(hashToString)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInStroke",
					value: function(){
						var context = getPathContext()
						var data = new Uint8Array(30 * 30)
						for (var x = 0; x < 30; x += 1){
							for (var y = 0; y < 30; y += 1){
								data[y * 30 + x] = context.isPointInStroke(x, y)
							}
						}
						return window.crypto.subtle.digest("SHA-256", data).then(hashToString)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "fillText",
					value: function(){
						getContext().fillText("test", 0, 0)
						return "supported"
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "strokeText",
					value: function(){
						getContext().strokeText("test", 0, 0)
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
				// taken from https://panopticlick.eff.org/static/fp2.js
				var context = getContext()
				var canvas = context.canvas
				canvas.width = 2000
				canvas.height = 200
				canvas.style.display = "inline"
				// detect browser support of canvas winding
				// http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
				// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
				context.rect(0, 0, 10, 10)
				context.rect(2, 2, 6, 6)

				// new kkapsner
					// make more stable across FF releases
					// make zoom resistant
					// do away with using fonts? what happens if doc fonts is blocked: e.g. other lang packs?
					// ahh: blocking arial via doc fonts and using e.g default TNR = zoom resistance lost
				let fpText = "BrowserLeaks,com <canvas> 10"
				context.textBaseline = "top";
				context.font = "14px 'Arial'";
				context.textBaseline = "alphabetic";
				context.fillStyle = "#f60";
				context.fillRect(125, 1, 62, 20);
				context.fillStyle = "#069";
				context.fillText(fpText, 2, 15);
				context.fillStyle = "rgba(102, 204, 0, 0.7)";
				context.fillText(fpText, 4, 17);

				// canvas blending
				// http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
				// http://jsfiddle.net/NDYV8/16/
				context.globalCompositeOperation = "multiply"
				context.fillStyle = "rgb(255,0,255)"
				context.beginPath()
				context.arc(50, 50, 50, 0, Math.PI * 2, true)
				context.closePath()
				context.fill()
				context.fillStyle = "rgb(0,255,255)"
				context.beginPath()
				context.arc(100, 50, 50, 0, Math.PI * 2, true)
				context.closePath()
				context.fill()
				context.fillStyle = "rgb(255,255,0)"
				context.beginPath()
				context.arc(75, 100, 50, 0, Math.PI * 2, true)
				context.closePath()
				context.fill()
				context.fillStyle = "rgb(255,0,255)"
				// canvas winding
				// http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
				// http://jsfiddle.net/NDYV8/19/
				context.arc(75, 75, 75, 0, Math.PI * 2, true)
				context.arc(75, 75, 25, 0, Math.PI * 2, true)
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
							displayValue = "not supported"
						}
					} catch (e){
						displayValue = (e.name == "TypeError" ? "" : e.name + ": ") + e.message
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
						return (sha1(getKnown().canvas.toDataURL()) == known1 ? true : false)
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							try {
								var timeout = window.setTimeout(function(){
									reject(false)
								}, 750)
							getKnown().canvas.toBlob(function(blob){
								window.clearTimeout(timeout)
								var reader = new FileReader()
								reader.onload = function(){
									resolve(sha1(reader.result) == known1 ? true : false)
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
								resolve(sha1(reader.result) == known1 ? true : false)
							}
							reader.readAsDataURL(file)
						})
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "getImageData",
					value: function(){
						var context = getKnown()
						let imageData = []
						for (let x=0; x < 16; x++) {
							for (let y=0; y < 16; y++) {
								let pixel = context.getImageData(x,y,1,1)
								imageData.push(pixel.data)
							}
						}
						return (sha1(imageData.join()) == known2 ? true : false)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInPath",
					value: function(){
						let context2 = getKnownPath()
						let pathData = []
						for (let x = 0; x < 16; x++){
							for (let y = 0; y < 16; y++){
								pathData.push(context2.isPointInPath(x, y))
							}
						}
						return (sha1(pathData.join()) == known3 ? true : false)
					}
				},
				{
					class: window.CanvasRenderingContext2D,
					name: "isPointInStroke",
					value: function(){
						let context2 = getKnownPath()
						let pathStroke = []
						for (let x = 0; x < 16; x++){
							for (let y = 0; y < 16; y++){
								pathStroke.push(context2.isPointInStroke(x, y))
							}
						}
						return (sha1(pathStroke.join()) == known4 ? true : false)
					}
				},
				// add these so arrays match
				{ name: "getContext", value: function(){return true}},
				{ name: "fillText", value: function(){return true}},
				{ name: "winding", value: function(){return true}},
				{ name: "strokeText", value: function(){return true}},
			];
			function isSupported(output){
				return !!(output.class? output.class: window.HTMLCanvasElement).prototype[output.name]
			}
			function getKnown(){
				let canvas = document.getElementById("kcanvas1")
				let ctx = canvas.getContext('2d')
				for (let x=0; x < 16; x++) {
					for (let y=0; y < 16; y++) {
						ctx.fillStyle = "rgba(" + (x*y) +","+ (x*16) + ","+ (y*16) + ",255)"
						ctx.fillRect(x, y, 1, 1)
					}
				}
				return ctx
			}
			function getKnownPath(){
				let canvas2 = document.getElementById("kcanvas2")
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
		canvas.createHashes(window),
		canvas.createHashes(window),
		known.createHashes(window),
	]).then(function(outputs){
		outputs[0].forEach(function(output){
			main0.push(output.name+","+output.displayValue)
		})
		outputs[1].forEach(function(output){
			main1.push(output.name+","+output.displayValue)
		})
		outputs[2].forEach(function(output){
			main2.push(output.name+","+output.displayValue)
		})
		if (logPerf) {debug_log("main [canvas]",t0)}
		analyzeCanvas("main", main0, main1, main2)
	})
	// ToDo: canvas: iframes: each with two passes

}

outputCanvas()
