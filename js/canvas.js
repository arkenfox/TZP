"use strict";

/* outputCanvas() based on https://canvasblocker.kkapsner.de/test/ */

function outputCanvas() {
	let t0 = performance.now(),
		res0 = [], res1 = [], res2 = []

	let known1b = "05f24fe5cfa497c8bebf1749188ab5fbd2b7c188" // toDataURL,toBlob [blink android alt]
	let known1 = "8c70ed9a7dbe6d72e3d1a4e448522012661cfbed", // toDataURL,toBlob [gecko]
		known2 = "67a2c3bc2f7ccf8c92d57b94586784f19d98a2f0", // getImageData
		known3 = "f44c70171a197cc26df382603e76f4ba581e2d8f", // isPointInPath
		known4 = "1b636fb26edee73d7ca832edd1112e0021566a50" // isPointInStroke
	if (isEngine == "blink") {
		known1 = "bb0b94e1c96429c0a12d8999ac5697d3dfb63fbf" // toDataURL,toBlob
	} else if (isEngine == "webkit") {
		known1 = "24c8af813fb7001ded7e81e125e9d3237e9400d5" // toDataURL,toBlob
	}

	// analyze
	function analyze() {
		// get data
		let useKnown = (isFF || isEngine == "blink" || isEngine == "webkit")
		let aBlock = [], aIndex = [], aValue = [], aKnown = [], aPass = []
		let compareBlob = "", compareDataURL = "", ffBlob = "", ffDataURL = ""
		for (let i=0; i < res1.length; i++) {
			let str0 = res0[i], str1 = res1[i], str2 = res2[i]
			let delim = str0.search(",")
			let name = str0.substring(0,delim),
				val0 = str0.substring(delim+1, str0.length),
				val1 = str1.substring(delim+1, str1.length),
				val2 = str2.substring(delim+1, str2.length)
			// index
			aIndex.push(name)
			// blocks = not a hash
			let isBlock = (val0.length !== 64 || val1.length !== 64)
			if (val0.indexOf(" ") !== -1 || val1.indexOf(" ") !== -1) {isBlock = true}
			aBlock.push(isBlock ? true : false)
			// per execution = if valid hashes
			if (isBlock) {aPass.push(true)} else {aPass.push(val0 == val1 ? true : false)}
			// value = force non-hash if required
			if (isBlock && val0.length == 64 && val0.indexOf(" ") == -1) {val0 = val1}
			aValue.push(val0) 
			// lies = from known: valid hash + engine
			if (!useKnown || isBlock) {val2 = true}
			aKnown.push(val2 == "true" ? true : false)
			// valid hashes
			if (!isBlock) {
				if (val2 == "true" && aPass[i] == true) {
					if (name == "toBlob") {compareBlob = val0}
					if (name == "toDataURL") {compareDataURL = val0}
				}
				// valid FF compare hashes
				if (name == "toBlob") {ffBlob = val0}
				if (name == "toDataURL") {ffDataURL = val0}
			}
		}

		// bypass
		let bypassValue = "", bypassTarget = ""
		if (compareBlob !== compareDataURL) {
			bypassTarget = compareBlob == "" ? "toBlob" : "toDataURL"
			bypassValue = compareBlob + compareDataURL
			if (gRun) {gKnown.push("canvas:"+ bypassTarget)}
		}

		// record FP + display
		let aRecord = []
		for (let i=0; i < aIndex.length; i++) {
			let item = aIndex[i]
			let element = dom.tb9.querySelector("."+ item)
			let display = aValue[i], record = display
			// block first
			if (aBlock[i] == true) {record = zB0}
			// then bypass can override block
			if (item == bypassTarget) {
				display = soB + display + scC; record = bypassValue
				if (gRun) {gBypassed.push("canvas:"+ bypassTarget +":"+ bypassValue)}
			} else if (aKnown[i] == false && aBlock[i] == false || aPass[i] == false) {
				// otherwise color up lies but not blocks
				display = soL + display + scC; record = zLIE
			}
			aRecord.push("canvas:"+ item +":"+ record)
			// notation for non-blocked
			if (isFF && aBlock[i] == false) {
				let control = ""
				let test = aValue[i]
				if (item.substring(0,4) == "isPo") {
					control = "957c80fa4be3af7e53b40c852edf96a090f09958cc7f832aaf9a9fd544fb69a8"
					display += (test == control ? rfp_green : rfp_red)
				}
				// static
				if (isVer < 78) {
					if (item == "toDataURL" || item == "toBlob") {
						control = "e5d9fd78536844cc8a4144ddb7a03eb9628f12c7c8b7828f942cadf6efb79ac0" // 220x30 white
						display += (test == control ? rfp_green : rfp_red)
					} else if (item == "getImageData") {
						control = "03fedeb80c3f8ebf2ed864024e9967256468d64dbe847f202ad06a60f2b3d9b3"
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
			element.innerHTML = display
		}

		// methods & lies
		if (gRun) {
			let mPass = [], mPersist = [], mBlock = []
			for (let i=0; i < aIndex.length; i++) {
				if (aKnown[i] == false || aPass[i] == false) {gKnown.push("canvas:"+ aIndex[i])}
				if (aBlock[i] == true) {
					mBlock.push(aIndex[i])
					// we should record block method details here: e.g. null
				} else {
					if (aPass[i] == false) { // per-execution
						mPass.push(aIndex[i])
					} else if (aKnown[i] == false) { // persistent
						mPersist.push(aIndex[i])
					}
				}
			}
			let max = aIndex.length
			if (mBlock.length) {gMethods.push("canvas:blocked:"+ (mBlock.length == max ? "all" : mBlock.join()))}
			if (mPass.length) {gMethods.push("canvas:random per execution:"+ (mPass.length == max ? "all" : mPass.join()))}
			if (mPersist.length) {gMethods.push("canvas:persistent noise:"+ (mPersist.length == max ? "all" : mPersist.join()))}
			console.debug("mPass", mPass, "\nmBlock", mBlock, "\nmPersist", mPersist)
		}
		console.debug("aIndex", aIndex, "\naPass", aPass, "\naBlock", aBlock, "\naKnown", aKnown, "\naValue\n - " + aValue.join("\n - "))
		console.debug("compare", compareBlob, compareDataURL)
		console.debug("ff compare", ffBlob, ffDataURL)

		// section
		log_section("canvas", t0, aRecord)
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

	function tidy_data(data) {
		if (data === false || data == "false") {data = "false"
		} else if (data === true || data == "trie") {data = "true"
		} else if (data === 0) {data = "0"
		} else if (data === null) {data = "null"
		} else if (data === undefined) {data = "undefined"
		} else if (data === "") {data = "empty string"
		} else if (data === []) {data = "empty array"
		} else {data = hashDataURL(data)}
		return data
	}

	var canvas = {
		createHashes: function(window, runNo){
			let outputs = [
				{
					name: "toDataURL",
					value: function(){
						try {
							let t1 = performance.now()
							let data = getFilledContext().canvas.toDataURL()
							data = tidy_data(data)
							log_perf("toDataURL ["+ runNo +"] [canvas]",t1)
							return data
						} catch (e) {
							return(e.name === undefined ? "error" : e.name +": " + e.message)
						}
					}
				},
				{
					name: "toBlob",
					value: function(){
						return new Promise(function(resolve, reject){
							let t1 = performance.now()
							try {
								var timeout = window.setTimeout(function(){
									reject("timeout")
								}, 750)
								getFilledContext().canvas.toBlob(function(blob){
									window.clearTimeout(timeout)
									var reader = new FileReader()
									reader.onload = function(){
										let data = reader.result
										data = tidy_data(data)
										log_perf("toBlob ["+ runNo +"] [canvas]",t1)
										resolve(data)
									}
									reader.onerror = function(){
										reject("unable to read blob!")
									}
									reader.readAsDataURL(blob)
								})
							} catch (e){
								resolve(e.name === undefined ? "error" : e.name +": " + e.message)
							}
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
						log_perf("isPointInPath ["+ runNo +"] [canvas]",t1)
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
						displayValue = (e.name === undefined ? "error" : e.name +": " + e.message)
					}
					Promise.resolve(displayValue).then(function(displayValue){
						output.displayValue = displayValue
						resolve(output)
					}, function(e){
						output.displayValue = (e.name === undefined ? "error" : e.name +": " + e.message)
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
						let isFake = false
						if (isEngine == "blink") {
							if (data !== known1 && data !== known1b) {isFake = true}
						} else {
							if (data !== known1) {isFake = true}
						}
						return (isFake ? false : true)
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
									let isFake = false
									if (isEngine == "blink") {
										if (data !== known1 && data !== known1b) {isFake = true}
									} else {
										if (data !== known1) {isFake = true}
									}
									resolve(isFake ? false : true)
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
						return (data == known4 ? true : false)
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
	// ToDo: canvas: iframe, offScreen, convertToBlob
}

countJS("canvas")
