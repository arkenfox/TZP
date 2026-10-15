'use strict';

/* modifed from https://gist.github.com/abrahamjuliot/7baf3be8c451d23f7a8693d7e28a35e2 */

const get_webgl = (METRIC) => new Promise(resolve => {
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
			// info
			'ANTIALIAS',
			// 2019364
				// ToDo: IDK if this is right
			'IMPLEMENTATION_COLOR_READ_FORMAT',
			'IMPLEMENTATION_COLOR_READ_TYPE',
			'STENCIL_BACK_VALUE_MASK',
			'STENCIL_BACK_WRITEMASK',
			'STENCIL_VALUE_MASK',
			'STENCIL_WRITEMASK',
			'SUBPIXEL_BITS',
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
		let hasMajorPerformanceCaveat = false
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
		// spread syntax in objects requires FF55+
		//data = {...components, extensions}
		//if (isBrave) {extensions.push('EXT_groot_blender')}
		data = {'extensions': extensions}
		for (const k of Object.keys(components).sort()) {data[k] = components[k]}
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

	let oRaw = {}, hasWebGL = false
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
				// sort parameters
				for (const r of Object.keys(oRaw)) { // per run
					for (const c of Object.keys(oRaw[r])) { // per context
						let newobj = {}, olddata = oRaw[r][c].parameters
						if (undefined !== olddata) {
							for (const k of Object.keys(olddata).sort()) {newobj[k] = olddata[k]}
							oRaw[r][c].parameters = newobj
						}
					}
				}
				// combine
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
				sDetail[isScope].lookup[metric] = value
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
				let aInfo = ['major_performance_caveat','renderer','vendor','unmasked_renderer','unmasked_vendor']
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
									let typeExpected = 'major_performance_caveat' == m ? 'boolean' : 'string'
									if (typeExpected !== typeCheck) {
										log_error(10, 'webgl_gpu_'+ m +'_'+ c, zErrType + typeCheck); value = zErr
									}
									if (false !== value) {oTmp[r][m][c] = value} // only add caveat if true
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
				// any context missing is n/a: we record context errors/null/etc elsewhere
				aInfo = aInfo.filter(x => !['major_performance_caveat'].includes(x))
				aInfo.forEach(function(m){if (undefined == oFinal[m]) {oFinal[m] = zNA}})
				// sort final into a new obj
				data = {}
				for (const c of Object.keys(oFinal).sort()) {data[c] = oFinal[c]}
				hash = mini(data); btn = addButton(10, metric)
				// notation
					// we don't need to worry about missing contexts (already health checked in contexts metric and
					// the health differs in FF vs BB) and we built in error counts: so we just need to check the hash
				if ('57a5a98f' == hash) {
					// 4 x Mozilla || FF154+ 2050515 FPP enabled nightly
					notation = rfp_green
				} else if (isFPPFallback && isVer > 158) {
					// FF159 nightly 2055176 FPP bucketize unmasked vendor
					let aBucketUVendor = ['AMD','Apple','Intel','NVIDIA Corporation','Other']
					if ('Mozilla' == data.renderer
						&& 'Mozilla' == data.unmasked_renderer
						&& 'Mozilla' == data.vendor
						&& aBucketUVendor.includes(data.unmasked_vendor)
					) {
						notation = fpp_green
					}
				}
			} catch(e) {
				hash = e; data = zErrLog
			}
			addBoth(10, metric, hash, btn, notation, data)
		}

		// EXTENSIONS
		function add_ext(metric) {
			// AFAICT: experimental + webgl are always the same
				// and webgl2 duplicates most (12-15 for me) but adds some (3 for me)
				// IIUIC: pretty sure the spec knows which is where, so we can just combine + dedupe
			let hash, data='', btn='', notation ='' //rfp_red
			try {
				let oTmp = {}, aTmp
				// get data
				for (const r of Object.keys(oRaw)) { // r = run number
					aTmp = []
					let tmpdata = oRaw[r]
					for (const c of Object.keys(tmpdata)) { // c = context
						let newdata = tmpdata[c].extensions
						if ('array' == typeFn(newdata)) {aTmp = aTmp.concat(newdata)}
					}
					aTmp = dedupeArray(aTmp)
					oTmp[r] = aTmp
					// note: don't sort: we're concat'ing in context alphabetical order: exp,1,2
					// and unsorted deduped results highlight the unique webgl2 items at the end
				}
				// compare
				hash = mini(oTmp[0])
				if (hash == mini(oTmp[1])) {
					// identical
					data = oTmp[0]
					if (!data.length) {
						// note: we already recorded per context extension errors
						// but we still need something for the overall summary metric
						throw zErrInvalid +'none'
					}
					if (isBrave) {
						// brave shields adds oen random item to each context _at the end_ starting with
						// withg EXT_ meaning it's out of alphabetical order: blink returns then in
						// order and we would always have WEBGL_debug_renderer_info
						// examples: EXT_draw_compressor, EXT_draw_sampler, EXT_expanded_sampler, EXT_polygon_sampler
							// EXT_blend_compressor, EXT_circle_compressor, EXT_expanded_blender
						aTmp = oRaw[0].webgl.extensions
						let lastItem = aTmp[aTmp.length - 1]
						if ('EXT_' == lastItem.slice(0,4)) {
							data = data.filter(x => ![lastItem].includes(x))
							hash = mini(data)
							log_debug(10, metric +'_ignored', lastItem)
						}
					}
					btn = addButton(10, metric, data.length)
				} else {
					// random
					hash = 'random | per execution'
				}
			} catch(e) {
				hash = e; data = zErrLog
			}
			addBoth(10, metric, hash, btn, notation, data)
		}

		// PARAMETERS
		function add_params(metric) {
			// same as extensions: experimental + webgl are always the same and webgl2 duplicates some and adds some
			// we have 2 runs x upto 3 results: upto 6 in all
			// if it's not per execution then is it the same across each run, if not then it's "mixed"
			// TBH: I doubt these will ever be triggered; and what is tampered with may vary per session/eTLD+1

			let hash, data = {}, btn='', notation ='' //rfp_red
			try {
				let oPara = {}, oDiffs = {}
				// group by parameter then run
				for (const r of Object.keys(oRaw)) { // r = run number
					for (const c of Object.keys(oRaw[r])) { // c = context
						let pdata = oRaw[r][c].parameters
						if ('object' == typeFn(pdata)) {
							for (const p of Object.keys(pdata)) { // p = parameter
								if (undefined == oPara[p]) {oPara[p] = {0: [], 1: []}}
								oPara[p][r].push(pdata[p])
							}
						}
					}
				}
				// reduce to single run
				for (const p of Object.keys(oPara)) {
					let data0 = oPara[p][0], data1 = oPara[p][1]
					if (mini(data0) == mini(data1)) {
						oPara[p] = data0
					} else {
						oDiffs[p] = {0: data0, 1: data1}
						oPara[p] = 'random | per execution'
					}
				}
				// reduce to single context, sorted into data
					// we're either a string ('random...') or an array
				for (const p of Object.keys(oPara).sort()) {
					let value = oPara[p]
					if ('object' == typeof oPara[p]) {
						let s = new Set()
						oPara[p].forEach(function(item){s.add(item+'')})
						if (1 == s.size) {
							value = oPara[p][0]
						} else {
							value = 'mixed'
							oDiffs[p] = oPara[p]
						}
					}
					data[p] = value
				}
				// diffs
				if (Object.keys(oDiffs).length) {
					// ToDo: test
					// tidy/sort diffs object, add diffs button lookup
					let newobj = {'per_context': {}, 'per_run' : {}}
					for (const p of Object.keys(data)) {
						if ('string' == typeof data[p]) {
							let target = 'mixed' == data[p] ? 'per_context' : 'per_run'
							newobj[target][p] = oDiffs[p]
						}
					}
					for (const k of Object.keys(newobj)) {
						if (0 == Object.keys(newobj[k]).length) {delete newobj[k]}
					}
					btn = addButton(10, metric +'_diffs', 'diffs')
					sDetail[isScope][metric +'_diffs'] = newobj
				}
				// tampering
				if (isBrave) {
					// brave: reduces some values by 1, seems to always be MAX_ items: it seems to be only 12 specific items
					// on my machine: 3 of 34 MAX items are odd by default but those 3 never seem to be affected
					// the other 31 MAX items are all even + positive + single values
						// except for MAX_TEXTURE_LOD_BIAS + MAX_VARYING_VECTORS these all seem to always be multiples of 4
						// note: on my android MAX_TEXTURE_LOD_BIAS is not an integer: this appears to be the only one
					// [1] on my android I have seen
						// MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS + MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS
						// changed from 2147483648 (real) to 2147483646 (spoofed)
						// i.e a diff of 2: we can cover this and even a diff of 3 by using %4
					let aTamper = []
					let aIgnore = ['MAX_PROGRAM_TEXEL_OFFSET','MAX_VERTEX_UNIFORM_VECTORS','MAX_VIEWPORT_DIMS']
					let a2 = ['MAX_TEXTURE_LOD_BIAS','MAX_VARYING_VECTORS']
					for (const p of Object.keys(data)) {
						if ('MAX_' == p.slice(0,4) && !aIgnore.includes(p)) {
							let value = data[p]
							if ('number' == typeof value && Number.isInteger(value)) {
								// any MAX integer item not excluded from our list, round up
								let add = 0, remainder = value % 4
								if (a2.includes(p)) {
									if (value % 2) {add = 1} // round up to even
								} else if (remainder > 0) {
									add = 4 - remainder // round up to nearest multiple of 4
								}
								if (0 !== add) {
									data[p] = value + add
									aTamper.push(p)
								}
							}
						}
					}
					if (aTamper.length) {
						// this doesn't necessarily mean they were tampered with, it just means for
						// brave these values will always be rounded up in certain increments
						log_debug(10, metric +'_tampered', aTamper)
						let aKnown = [
							'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS','MAX_COMBINED_UNIFORM_BLOCKS',
							'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS','MAX_FRAGMENT_INPUT_COMPONENTS',
							'MAX_FRAGMENT_UNIFORM_BLOCKS','MAX_FRAGMENT_UNIFORM_COMPONENTS',
							'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS','MAX_UNIFORM_BUFFER_BINDINGS',
							'MAX_VARYING_COMPONENTS','MAX_VERTEX_OUTPUT_COMPONENTS',
							'MAX_VERTEX_UNIFORM_BLOCKS','MAX_VERTEX_UNIFORM_COMPONENTS',
						]
						let aNew = aTamper.filter(x => !aKnown.includes(x))
						if (aNew.length) {log_alert(10, metric+'_tampered_new', aNew)} // alert if new
					}
				}
				// finalize
				hash = mini(data)
				btn = addButton(10, metric, Object.keys(data).length) + btn
			} catch(e) {
				hash = e; data = zErrLog
			}
			addBoth(10, metric, hash, btn, notation, data)
		}

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
		return resolve(hasWebGL)
	}).catch(error => {
		console.error(error)
		return resolve(false) // assume !hasWebGL and catch an error?
	})
})

function get_readpixels(METRIC, hasWebGL) {
	let hash, data='', btn='', notation ='' //rfp_red
	if (!hasWebGL) {
		hash = zNA
	} else {
		try {
			hash = 'TBA'

		} catch(e) {
			hash = e; data = zErrLog
		}
	}
	addBoth(10, METRIC, hash, btn, notation, data)
}

const outputWebGL = () => new Promise(resolve => {
	if (gRun && sectionIgnore.includes('webgl')) {return resolve()}

	// ToDo: readPixels, webGPU
	// ToDo: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
	Promise.all([
		get_webgl('webgl'),
	]).then(function(res){
		let hasWebGL = res[0]
		Promise.all([
			get_readpixels('webgl_readpixels', hasWebGL),
		]).then(function(res){
			return resolve()
		})
	})
})

countJS(10)
