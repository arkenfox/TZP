'use strict';

/* code based on work by
 kkapsner: https://canvasblocker.kkapsner.de/test/, https://github.com/kkapsner/CanvasBlocker */

var t0webgl

function outputWebGL_param() {
	// vars
	let t0 = performance.now(),
		glhash = []

	let types = ["webgl", "webgl2", "experimental-webgl"]

	// supported
		// webgl.disabled, webgl.enable-webgl2
		// webgl.min_capability_mode?
	for (let i=0; i < types.length; i++) {
		let type = types[i]
		try {
			let canvas = window.document.createElement("canvas")
			try {
				var context = canvas.getContext(type)
				if (!context) {
					throw new Error()
				}
				glhash.push(type +": supported")
			}	catch (e) {
				glhash.push(type +": not supported")
			}
		} catch(e) {}
	}
	dom.glsupport = glhash.join(", ")

	// run webgl, webgl2 parameters: take note ofvendor/renderer + unmasked
		// make sure to detect if they're missing

	// hash
	dom.glhash0.innerHTML = sha1(glhash.join())
	// perf
	log_perf("parameters [webgl]",t0)
}

function analyzeWebGL(runtype, res1, res2) {
	let t0 = performance.now(),
		sColor = s10

	let pushvalue = res1
	if (res1.substring(0,14) == "ReferenceError") {
		// blocked
		res1 = zB
		pushvalue = "blocked"
	} else if (res1 !== res2) {
		pushvalue = "random"
		res1 = "random "+ sColor +" [1] "+ sc + res1.substring(0,22) +".."
			+ sColor +" [2] "+ sc + res2.substring(0,22) +".."
	} else {
		if (sha1(res1) == "47bf7060be2764c531da228da96bd771b14917a1") {
			// NotSupportedError: Operation is not supported
			res1 += tb_standard
		} else if (sha1(res1) == "80505e817edc581bfff3e1f9137d52efbc183f03") {
			// Error: Permission denied to access property "createBuffer"
			res1 += tb_safer
		}
	}
	// output
	dom.glreadPixels.innerHTML = res1
	// section perf here for now
	log_section("webgl", t0webgl)
}

function outputWebGL_render() {
	let t0 = performance.now(),
		main1 = "", main2 = ""

	var webgl = {
		createHashes: function(window){
			let outputs = [
				{
					class: window.WebGLRenderingContext,
					name: "readPixels",
					value: function(){
						var context = getFilledWebGlContext()
						if (!context){
							return "webgl not supported"
						}
						var pixels = new Uint8Array(context.drawingBufferWidth * context.drawingBufferHeight * 4)
						context.readPixels(0, 0, context.drawingBufferWidth, context.drawingBufferHeight, context.RGBA, context.UNSIGNED_BYTE, pixels)
						return window.crypto.subtle.digest("SHA-256", pixels).then(hashToString)
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
			function getFilledWebGlContext(){
				// taken from https://github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js
				var context = getContext("webgl") || getContext("webgl2")
				if (!context){
					return null
				}
				var vertexShaderTemplate = "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}";
				var fragmentShaderTemplate = "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}";
				var vertexPosBuffer = context.createBuffer()
				context.bindBuffer(context.ARRAY_BUFFER, vertexPosBuffer)
				var vertices = new Float32Array([-0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.732134444, 0])
				context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW)
				vertexPosBuffer.itemSize = 3
				vertexPosBuffer.numItems = 3
				var program = context.createProgram()
				var vertexShader = context.createShader(context.VERTEX_SHADER)
				context.shaderSource(vertexShader, vertexShaderTemplate)
				context.compileShader(vertexShader)
				var fragmentShader = context.createShader(context.FRAGMENT_SHADER)
				context.shaderSource(fragmentShader, fragmentShaderTemplate)
				context.compileShader(fragmentShader)
				context.attachShader(program, vertexShader)
				context.attachShader(program, fragmentShader)
				context.linkProgram(program)
				context.useProgram(program)
				program.vertexPosAttrib = context.getAttribLocation(program, "attrVertex")
				program.offsetUniform = context.getUniformLocation(program, "uniformOffset")
				context.enableVertexAttribArray(program.vertexPosArray)
				context.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, context.FLOAT, !1, 0, 0)
				context.uniform2f(program.offsetUniform, 1, 1)
				context.drawArrays(context.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems)
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

	Promise.all([
		webgl.createHashes(window),
		webgl.createHashes(window)
	]).then(function(outputs){
		outputs[0].forEach(function(output){
			main1 = output.displayValue
		})
		outputs[1].forEach(function(output){
			main2 = output.displayValue
		})
		log_perf("main [webgl]",t0)
		analyzeWebGL("main", main1, main2)
	})
}

function outputWebGL() {
	t0webgl = performance.now()
	outputWebGL_param()
	outputWebGL_render()
}

countJS("webgl")
