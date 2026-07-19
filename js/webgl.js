'use strict';

/* modifed from https://gist.github.com/abrahamjuliot/7baf3be8c451d23f7a8693d7e28a35e2 */

function get_webgl(METRIC) {
	/* ToDo:
		view-source:https://privacy-test-pages.glitch.me/privacy-protections/fingerprinting/helpers/tests.js
		MOAR stuff to be recorded here
	*/

	const WebGLConstants = [
		'ALIASED_LINE_WIDTH_RANGE',
		'ALIASED_POINT_SIZE_RANGE',
		'ALPHA_BITS',
		'BLUE_BITS',
		'DEPTH_BITS',
		'GREEN_BITS',
		'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
		'MAX_CUBE_MAP_TEXTURE_SIZE',
		'MAX_FRAGMENT_UNIFORM_VECTORS',
		'MAX_RENDERBUFFER_SIZE',
		'MAX_TEXTURE_IMAGE_UNITS',
		'MAX_TEXTURE_SIZE',
		'MAX_VARYING_VECTORS',
		'MAX_VERTEX_ATTRIBS',
		'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
		'MAX_VERTEX_UNIFORM_VECTORS',
		'MAX_VIEWPORT_DIMS',
		'RED_BITS',
		//'RENDERER',
		'SHADING_LANGUAGE_VERSION',
		'STENCIL_BITS',
		//'VENDOR',
		'VERSION'
	]
	const WebGL2Constants = [
		'MAX_VARYING_COMPONENTS',
		'MAX_VERTEX_UNIFORM_COMPONENTS',
		'MAX_VERTEX_UNIFORM_BLOCKS',
		'MAX_VERTEX_OUTPUT_COMPONENTS',
		'MAX_PROGRAM_TEXEL_OFFSET',
		'MAX_3D_TEXTURE_SIZE',
		'MAX_ARRAY_TEXTURE_LAYERS',
		'MAX_COLOR_ATTACHMENTS',
		'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_COMBINED_UNIFORM_BLOCKS',
		'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
		'MAX_DRAW_BUFFERS',
		'MAX_ELEMENT_INDEX',
		'MAX_FRAGMENT_INPUT_COMPONENTS',
		'MAX_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_FRAGMENT_UNIFORM_BLOCKS',
		'MAX_SAMPLES',
		'MAX_SERVER_WAIT_TIMEOUT',
		'MAX_TEXTURE_LOD_BIAS',
		'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
		'MAX_UNIFORM_BLOCK_SIZE',
		'MAX_UNIFORM_BUFFER_BINDINGS',
		'MIN_PROGRAM_TEXEL_OFFSET',
		'UNIFORM_BUFFER_OFFSET_ALIGNMENT'
	]
	const Categories = {
		parameters: [
			//uniformBuffers
			'MAX_UNIFORM_BUFFER_BINDINGS',
			'MAX_UNIFORM_BLOCK_SIZE',
			'UNIFORM_BUFFER_OFFSET_ALIGNMENT',
			'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
			'MAX_COMBINED_UNIFORM_BLOCKS',
			'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
			//fragmentShader
			'MAX_FRAGMENT_UNIFORM_VECTORS',
			'MAX_TEXTURE_IMAGE_UNITS',
			'MAX_FRAGMENT_INPUT_COMPONENTS',
			'MAX_FRAGMENT_UNIFORM_COMPONENTS',
			'MAX_FRAGMENT_UNIFORM_BLOCKS',
			'FRAGMENT_SHADER_BEST_FLOAT_PRECISION',
			'MIN_PROGRAM_TEXEL_OFFSET',
			'MAX_PROGRAM_TEXEL_OFFSET',
			//frameBuffer
			'MAX_DRAW_BUFFERS',
			'MAX_COLOR_ATTACHMENTS',
			'MAX_SAMPLES',
			'RGBA_BITS',
			'DEPTH_STENCIL_BITS',
			'MAX_RENDERBUFFER_SIZE',
			'MAX_VIEWPORT_DIMS',
			//rasterizer
			'ALIASED_LINE_WIDTH_RANGE',
			'ALIASED_POINT_SIZE_RANGE',
			//textures
			'MAX_TEXTURE_SIZE',
			'MAX_CUBE_MAP_TEXTURE_SIZE',
			'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
			'MAX_TEXTURE_MAX_ANISOTROPY_EXT',
			'MAX_3D_TEXTURE_SIZE',
			'MAX_ARRAY_TEXTURE_LAYERS',
			'MAX_TEXTURE_LOD_BIAS',
			//transformFeedback
			'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
			'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
			'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
			//vertexShader
			'MAX_VARYING_VECTORS',
			'MAX_VERTEX_ATTRIBS',
			'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
			'MAX_VERTEX_UNIFORM_VECTORS',
			'MAX_VERTEX_UNIFORM_COMPONENTS',
			'MAX_VERTEX_UNIFORM_BLOCKS',
			'MAX_VERTEX_OUTPUT_COMPONENTS',
			'MAX_VARYING_COMPONENTS',
			'VERTEX_SHADER_BEST_FLOAT_PRECISION',
			// was info
			'ANTIALIAS',
		],
		gpu: [
			//'CONTEXT',
			//'DIRECT_3D',
			'MAJOR_PERFORMANCE_CAVEAT',
			'RENDERER',
			'SHADING_LANGUAGE_VERSION',
			'VENDOR',
			'VERSION',
			'UNMASKED_VENDOR_WEBGL',
			'UNMASKED_RENDERER_WEBGL',
		],
	}

	/* parameter helpers */
	// https://developer.mozilla.org/en-US/docs/Web/API/EXT_texture_filter_anisotropic
	const getMaxAnisotropy = (context) => {
		try {
			const extension = (
				context.getExtension('EXT_texture_filter_anisotropic') ||
				context.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
				context.getExtension('MOZ_EXT_texture_filter_anisotropic')
			)
			return context.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
		} catch (error) {
			return undefined
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_draw_buffers
	const getMaxDrawBuffers = (context) => {
		try {
			const extension = (
				context.getExtension('WEBGL_draw_buffers') ||
				context.getExtension('WEBKIT_WEBGL_draw_buffers') ||
				context.getExtension('MOZ_WEBGL_draw_buffers')
			)
			return context.getParameter(extension.MAX_DRAW_BUFFERS_WEBGL)
		} catch (error) {
			return undefined
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/precision
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMax
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLShaderPrecisionFormat/rangeMin
	const getShaderData = (shader) => {
		const shaderData = {}
		try {
			for (const prop in shader) {
				const shaderPrecisionFormat = shader[prop]
				shaderData[prop] = {
					precision: shaderPrecisionFormat.precision,
					rangeMax: shaderPrecisionFormat.rangeMax,
					rangeMin: shaderPrecisionFormat.rangeMin
				}
			}
			return shaderData
		} catch (error) {
			return undefined
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderPrecisionFormat
	const getShaderPrecisionFormat = (context, shaderType) => {
		const props = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT']
		const precisionFormat = {}
		try {
			props.forEach(prop => {
				precisionFormat[prop] = context.getShaderPrecisionFormat(context[shaderType], context[prop])
				return
			})
			return precisionFormat
		} catch (error) {
			return undefined
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info
		// also get vendor/renderer here to match errors
	const getVR = (contextType, context, constant) => {
		try {
			//if ('webgl' == contextType) {foo++} // test a single error
			//if ('webgl2' == contextType) {foo++} // test two errors
			//if ('webgl2' == contextType) {return 'Mozilla random'} // test mixed

			if (constant.includes('UNMASKED')) {
				const extension = context.getExtension('WEBGL_debug_renderer_info')
				const unmasked = context.getParameter(extension[constant])
				return unmasked
			} else {
				const masked = context.getParameter(context[constant])
				return masked
			}
		} catch (e) {
			let m = constant.toLowerCase()
			m = m.replace('_webgl','')
			log_error(10, 'webgl_gpu_'+ m +'_'+ contextType, e)
			return zErr
		}
	}

	/* get WebGLRenderingContext or WebGL2RenderingContext */
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext
	function getWebGL(contextType) {
		let data = {}
		const isWebGL = /^(experimental-)?webgl$/ 
		const isWebGL2 = /^(experimental-)?webgl2$/
		const supportsWebGL = isWebGL.test(contextType) && 'WebGLRenderingContext' in window
		const supportsWebGL2 = isWebGL2.test(contextType) && 'WebGLRenderingContext' in window

		// detect support
		if (!supportsWebGL && !supportsWebGL2) {
			return 'not supported'
		}

		// get canvas context
		let canvas
		let context
		let hasMajorPerformanceCaveat
		try {
			canvas = document.createElement('canvas')
			context = canvas.getContext(contextType, { failIfMajorPerformanceCaveat: true })
			if (!context) {
				hasMajorPerformanceCaveat = true
				context = canvas.getContext(contextType)
				if (null === context) {
					return 'null'
				} else if (!context) {
					throw zErrType + typeFn(context)
				}
			}
		} catch (e) {
			log_error(10, 'webgl_context_'+ contextType, e)
			return zErr
		}

		// get supported extensions
		// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getSupportedExtensions
		// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Using_Extensions
		let extensions
		try {
			extensions = context.getSupportedExtensions()
		} catch (e) {
			log_error(10, 'webgl_extensions_'+ contextType, e)
		}

		// get parameters
		let parameters
		try {
			const VERTEX_SHADER = getShaderData(getShaderPrecisionFormat(context, 'VERTEX_SHADER'))
			const FRAGMENT_SHADER = getShaderData(getShaderPrecisionFormat(context, 'FRAGMENT_SHADER'))

			parameters = {
				ANTIALIAS: context.getContextAttributes().antialias,
				//CONTEXT: contextType,
				MAJOR_PERFORMANCE_CAVEAT: hasMajorPerformanceCaveat,
				MAX_TEXTURE_MAX_ANISOTROPY_EXT: getMaxAnisotropy(context),
				MAX_DRAW_BUFFERS_WEBGL: getMaxDrawBuffers(context),
				VERTEX_SHADER,
				VERTEX_SHADER_BEST_FLOAT_PRECISION: Object.values(VERTEX_SHADER.HIGH_FLOAT),
				FRAGMENT_SHADER,
				FRAGMENT_SHADER_BEST_FLOAT_PRECISION: Object.values(FRAGMENT_SHADER.HIGH_FLOAT),
				UNMASKED_VENDOR_WEBGL: getVR(contextType, context, 'UNMASKED_VENDOR_WEBGL'),
				UNMASKED_RENDERER_WEBGL: getVR(contextType, context, 'UNMASKED_RENDERER_WEBGL'),
				RENDERER: getVR(contextType, context, 'RENDERER'),
				VENDOR: getVR(contextType, context, 'VENDOR')
			}
        
			const glConstants =  [...WebGLConstants, ...(supportsWebGL2 ? WebGL2Constants : [])]
			glConstants.forEach(key => {
				const result = context.getParameter(context[key])
				const typedArray = result && (
					result.constructor === Float32Array ||
					result.constructor === Int32Array
				)
				parameters[key] = typedArray ? [...result] : result
			})

			parameters.RGBA_BITS = [
				parameters.RED_BITS,
				parameters.GREEN_BITS,
				parameters.BLUE_BITS,
				parameters.ALPHA_BITS,
			]
			parameters.DEPTH_STENCIL_BITS = [
				parameters.DEPTH_BITS,
				parameters.STENCIL_BITS,
			]
			// redundant
			//parameters.DIRECT_3D = /Direct3D|D3D(\d+)/.test(parameters.UNMASKED_RENDERER_WEBGL)

		} catch (e) {
			log_error(10, 'webgl_parameters_'+ contextType, e)
		}

		// Structure parameter data
		let components = {}
		if (parameters) {
			Object.keys(Categories).forEach((name) => {
				const componentData = Categories[name].reduce((acc, key) => {
					if (parameters[key] !== undefined) {
						acc[key] = parameters[key]
					}
					return acc
				}, {})
				// compile if data exists
				if (Object.keys(componentData).length) {
					components[name] = componentData
				}
			}) 
		}

		data = {
			...components, extensions
		}
		return data
	}

	function run(runNo) {
		Promise.all([
			getWebGL('experimental-webgl'),
			getWebGL('webgl'),
			getWebGL('webgl2'),
		]).then((result) => {
			const [experimental, webgl, webgl2] = result
			oRaw[runNo] = {
				'experimental-webgl': experimental,
				'webgl': webgl,
				'webgl2': webgl2,
			}
			return
		})
	}

	let oRaw = {}
	Promise.all([
		run(0),
		run(1),
	]).then(function(){
		// NS click to play: not entropy: only guaranteed on FIRST session page load assuming the
			// exception hasn't been permanently saved. We already have entropy on safer vs standard
			// and NS, so a Safer with allowed webgl implies clickedToPlay
		//let isClickToPlay = !!document.querySelector('.__ns__pop2top [data-policy-type="webgl"]')

		// RAWDATA
			// simplfy run data and add for user lookup
			// we can add readpixel data later
		function add_raw(metric) {
			try {
				let newdata = {}
				let hash0 = mini(oRaw[0]), hash1 = mini(oRaw[1])
				if (hash0 == hash1) {
					newdata = oRaw[0]
				} else {
					for (const c of Object.keys(oRaw[0]).sort()) { // context
						if ('string' == typeof oRaw[0][c]) {
							if (oRaw[0][c] == oRaw[1][c]) {
								newdata[c] = oRaw[0][c]
							} else {
								newdata[c] = {'run0': oRaw[0][c], 'run1': oRaw[1][c]}
							}
						} else {
							newdata[c] = {}
							for (const k of Object.keys(oRaw[0][c]).sort()) { // key (data, info, etc)
								hash0 = mini(oRaw[0][c][k])
								hash1 = mini(oRaw[1][c][k])
								if (hash0 == hash1) {
									newdata[c][k] = oRaw[0][c][k]
								} else {
									newdata[c][k] = {'run0': oRaw[0][c][k], 'run1': oRaw[1][c][k]}
								}
							}
						}
					}
				}
				sDetail[isScope][metric] = newdata
				addDisplay(10, metric, addButton(10, metric, 'data'))
			} catch(e) {
				console.log(e)
			}
		}

		// CONTEXT
		function add_context(metric) {
			let value = [], data = {}, notation = isBB ? bb_red : default_red
			try {
				// just use run 0
				for (const c of Object.keys(oRaw[0]).sort()) {
					let x = oRaw[0][c]
					x = 'string' == typeof x ? x : zE
					data[c] = x
					value.push(x)
					if (zE == x) {hasWebGL = true}
				}
				value = value.join(' | ')
				// notation
				if (isBB) {
					if ('null | null | null' == value || 'enabled | enabled | null' == value) {notation = bb_green}
				} else if ('enabled | enabled | enabled' == value) {
					notation = default_green
				}
				// display string, record obj
				addData(10, metric, data, mini(data)) 
				addDisplay(10, metric, value, '', notation)
			} catch(e) {
				value = e; data = zErrLog
				addBoth(10, metric, value,'', notation, data)
			}
		}

		// GPU
		function add_gpu(metric) {
			let hash, data='', btn='', notation = rfp_red
			try {
				let oTmp = {}
				let aInfo = ['renderer','vendor','unmasked_renderer','unmasked_vendor']
				// get data
				for (const r of Object.keys(oRaw)) { // r = run number
					let tmpdata = oRaw[r]
					for (const c of Object.keys(tmpdata)) { // c = context
						let data = tmpdata[c].gpu
						if (undefined !== data) {
							aInfo.forEach(function(m){ // m = metric
								let key = m.toUpperCase()
								if (m.includes('unmasked')) {key += '_WEBGL'}
								if (undefined !== data[key]) {
									if (undefined == oTmp[r]) {oTmp[r] = {}}
									if (undefined == oTmp[r][m]) {oTmp[r][m] = {}}
									let value = data[key]
									let typeCheck = typeFn(value)
									if ('string' !== typeCheck) {
										log_error(10, 'webgl_gpu_'+ m +'_'+ c, zErrType + typeCheck); value = zErr
									}
									oTmp[r][m][c] = value
								}
							})
						}
					}
				}
				//console.log(oTmp)
				// simplify runs
					// compare each value across runs: if it differs then it's per-execution
					// collect per execution values
				let oInfo = {}
				let oRandom = {}
				if (Object.keys(oTmp).length) {
					// we'll assume runs 0 + 1 are identical re support/errors/obj keys
					let ctrldata = oTmp[0], testdata = oTmp[1]
					if (mini(ctrldata) == mini(testdata)) {
						oInfo = ctrldata
					} else {
						for (const m of Object.keys(ctrldata)) {
							for (const c of Object.keys(ctrldata[m])) {
								if (undefined == oInfo[m]) {oInfo[m] = {}}
								let control = ctrldata[m][c]
								let test = testdata[m][c]
								let isMatch = control == test
								if (!isMatch) {
									if (undefined == oRandom[m]) {oRandom[m] = []}
									oRandom[m].push(test, control)
								}
								let value = isMatch ? control : 'per execution'
								oInfo[m][c] = value
							}
						}
					}
				}
				//console.log(oInfo, oRandom)
				// simplify contexts
					// compare across each metric: if more than 1 value then it's mixed
				let oFinal = {}
				for (const m of Object.keys(oInfo)) {
					let tmpSet = new Set(), errCount = 0
					for (const c of Object.keys(oInfo[m])) {
						tmpSet.add(oInfo[m][c])
						if (zErr == oInfo[m][c]) {errCount++}
					}
					let tmparray = Array.from(tmpSet)
					if (tmparray.length) {
						if (1 == tmparray.length) {
							// all identical (including zErr)
							oFinal[m] = tmparray[0]
						} else {
							tmparray = tmparray.filter(x => !x.includes(zErr))
							// all identical (minus zErr) else mixed
							let value = 1 == tmparray.length ? tmparray[0] : zLIE //'mixed'
							if (zLIE == value) {log_known(10, metric +'_'+ m, tmparray.join(', '))}
							// we also want to include an error count so a health fail will show that
							if (errCount > 0) {
								value += ' | '+ errCount +' error'+ (errCount > 1 ? 's': '')
							}
							oFinal[m] = value
						}
					}
				}
				// any context missing is n/a
					// we record context errors/null/etc elsewhere
				aInfo.forEach(function(m){if (undefined == oFinal[m]) {oFinal[m] = zNA}})
				// sort final into a new obj
				data = {}
				for (const c of Object.keys(oFinal).sort()) {data[c] = oFinal[c]}
				hash = mini(data); btn = addButton(10, metric)
				// notation
					// we don't need to worry about missing contexts (already health checked in contexts metric and
					// the health differs per FF vs BB) and we built in error counts: so we just need to check the hash
				if ('57a5a98f' == hash) {
					notation = rfp_green // 4 x Mozilla
				} else if (isVer > 153) {
					// FF154+ 2050515
					if ('acf1912a' == hash) {
						// 3 x Mozilla and unmasked_vendor is per execution
						// check our unmasked_vendor randomness matches FPP's pattern
						//console.log(oRandom)
						let isMatch = true, aRandom = oRandom['unmasked_vendor']
						aRandom.forEach(function(item){
							// pattern is "Mozilla " + 11 alphanumeric + '='
							if (20 !== item.length) {isMatch = false
							} else if ('=' != item.slice(19)) {isMatch = false
							} else if ('Mozilla ' != item.slice(0,8)) {isMatch = false}
						})
						if (isMatch) {notation = fpp_green}

					}
				}
			} catch(e) {
				hash = e; data = zErrLog
			}
			addBoth(10, metric, hash, btn, notation, data)
		}

		function add_ext(metric) {
			let hash, data='', btn='', notation ='' //rfp_red
			try {
				hash = 'TBA'


			} catch(e) {
				hash = e; data = zErrLog
			}
			addBoth(10, metric, hash, btn, notation, data)
		}

		function add_params(metric) {
			let hash, data='', btn='', notation ='' //rfp_red
			try {
				hash = 'TBA'

			} catch(e) {
				hash = e; data = zErrLog
			}
			addBoth(10, metric, hash, btn, notation, data)
		}

		let hasWebGL = false
		add_context(METRIC +'_context') // sets hasWebGL
		if (hasWebGL) {
			add_raw(METRIC +'_data')
			add_gpu(METRIC +'_gpu')
			add_ext(METRIC +'_extensions')
			add_params(METRIC +'_parameters')

		} else {
			// no need to notate, it's covered by _context metric
			let aMetrics = ['_extensions','_gpu','_parameters']
			aMetrics.forEach(function(m){addBoth(10, METRIC + m, zNA)})
		}
		return hasWebGL
	}).catch(error => {
		console.error(error)
		return
	})

}

const outputWebGL = () => new Promise(resolve => {
	if (gRun && sectionIgnore.includes('webgl')) {return resolve()}

	// ToDo: readPixels, webGPU
	Promise.all([
		get_webgl('webgl'),
	]).then(function(){
		return resolve()
	})
})

countJS(10)
