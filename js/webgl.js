'use strict';

/* modifed from https://gist.github.com/abrahamjuliot/7baf3be8c451d23f7a8693d7e28a35e2 */

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
	'RENDERER',
	'SHADING_LANGUAGE_VERSION',
	'STENCIL_BITS',
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
	'uniformBuffers': [
		'MAX_UNIFORM_BUFFER_BINDINGS',
		'MAX_UNIFORM_BLOCK_SIZE',
		'UNIFORM_BUFFER_OFFSET_ALIGNMENT',
		'MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_COMBINED_UNIFORM_BLOCKS',
		'MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS',
	],
	'debugRendererInfo': [
		'UNMASKED_VENDOR_WEBGL',
		'UNMASKED_RENDERER_WEBGL',
	],
	'fragmentShader': [
		'MAX_FRAGMENT_UNIFORM_VECTORS',
		'MAX_TEXTURE_IMAGE_UNITS',
		'MAX_FRAGMENT_INPUT_COMPONENTS',
		'MAX_FRAGMENT_UNIFORM_COMPONENTS',
		'MAX_FRAGMENT_UNIFORM_BLOCKS',
		'FRAGMENT_SHADER_BEST_FLOAT_PRECISION',
		'MIN_PROGRAM_TEXEL_OFFSET',
		'MAX_PROGRAM_TEXEL_OFFSET',
	],
	'frameBuffer': [
		'MAX_DRAW_BUFFERS',
		'MAX_COLOR_ATTACHMENTS',
		'MAX_SAMPLES',
		'RGBA_BITS',
		'DEPTH_STENCIL_BITS',
		'MAX_RENDERBUFFER_SIZE',
		'MAX_VIEWPORT_DIMS'
	],
	'rasterizer': [
		'ALIASED_LINE_WIDTH_RANGE',
		'ALIASED_POINT_SIZE_RANGE',
	],
	'textures': [
		'MAX_TEXTURE_SIZE',
		'MAX_CUBE_MAP_TEXTURE_SIZE',
		'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
		'MAX_TEXTURE_MAX_ANISOTROPY_EXT',
		'MAX_3D_TEXTURE_SIZE',
		'MAX_ARRAY_TEXTURE_LAYERS',
		'MAX_TEXTURE_LOD_BIAS',
	],
	'transformFeedback': [
		'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
		'MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS',
	],
	'vertexShader': [
		'MAX_VARYING_VECTORS',
		'MAX_VERTEX_ATTRIBS',
		'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
		'MAX_VERTEX_UNIFORM_VECTORS',
		'MAX_VERTEX_UNIFORM_COMPONENTS',
		'MAX_VERTEX_UNIFORM_BLOCKS',
		'MAX_VERTEX_OUTPUT_COMPONENTS',
		'MAX_VARYING_COMPONENTS',
		'VERTEX_SHADER_BEST_FLOAT_PRECISION',
	],
	'webGLContextInfo': [
		'CONTEXT',
		'ANTIALIAS',
		'DIRECT_3D',
		'MAJOR_PERFORMANCE_CAVEAT',
		'RENDERER',
		'SHADING_LANGUAGE_VERSION',
		'VERSION',
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
		console.error(error)
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
const getUnmasked = (context, constant) => {
	try {
		const extension = context.getExtension('WEBGL_debug_renderer_info')
		const unmasked = context.getParameter(extension[constant])
		return unmasked
	} catch (error) {
		return undefined
	}
}

/* get WebGLRenderingContext or WebGL2RenderingContext */
// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext
function getWebGL(contextType) {
	const errors = []
	let data = {}
	const isWebGL = /^(experimental-)?webgl$/ 
	const isWebGL2 = /^(experimental-)?webgl2$/
	const supportsWebGL = isWebGL.test(contextType) && 'WebGLRenderingContext' in window
	const supportsWebGL2 = isWebGL2.test(contextType) && 'WebGLRenderingContext' in window

	// detect support
	if (!supportsWebGL && !supportsWebGL2) {
		errors.push('not supported')
		return [data, errors]
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
			if (!context) {
				throw new Error(`context of type ${typeof context}`)
			}
		}
	} catch (e) {
		log_error(SECT10, contextType, e)
		errors.push('context blocked')
		return [data, errors]
	}

	// get supported extensions
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getSupportedExtensions
	// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Using_Extensions
	let webGLExtensions
	try {
		webGLExtensions = context.getSupportedExtensions()
	} catch (error) {
		console.error(error)
		errors.push('extensions blocked')
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
			UNMASKED_VENDOR_WEBGL: getUnmasked(context, 'UNMASKED_VENDOR_WEBGL'),
			UNMASKED_RENDERER_WEBGL: getUnmasked(context, 'UNMASKED_RENDERER_WEBGL')
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

		parameters.DIRECT_3D = /Direct3D|D3D(\d+)/.test(parameters.UNMASKED_RENDERER_WEBGL)

	} catch (error) {
		console.error(error)
		errors.push('parameters blocked')
	}

	//const gpuVendor = parameters.UNMASKED_VENDOR_WEBGL
	//const gpuRenderer = parameters.UNMASKED_RENDERER_WEBGL

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
		//gpuRenderer,
		//gpuVendor,
		...components,
		webGLExtensions
	}
	return [data, errors]
}

const outputWebGL = () => new Promise(resolve => {
	let t0 = nowFn()
	log_section(10, t0)
	return resolve()

	Promise.all([
		getWebGL('webgl'),
		getWebGL('webgl2'),
		getWebGL('experimental-webgl'),
	]).then((response) => {
		const [webGL, webGL2, experimentalWebGL] = response
		const [webGLData, webGLErrors] = webGL
		const [webGL2Data, webGL2Errors] = webGL2
		const [experimentalWebGLData, experimentalWebGLErrors] = experimentalWebGL

		/*
		console.log('WebGLRenderingContext: ', mini(webGLData), webGLData)
		if (webGLErrors.length) {console.log('webGL Errors',webGLErrors)}
		console.log('WebGL2RenderingContext: ', webGL2Data)
		if (webGL2Errors.length) {console.log('webGL2 Errors',webGL2Errors)}
		console.log('Experimental: ', mini(experimentalWebGLData), experimentalWebGLData)
		if (experimentalWebGLErrors.length) {console.log('Experimental Errors',experimentalWebGLErrors)}
		//*/

		// do something with the erorrs...
		log_section(10, t0)
		return resolve()

	}).catch(error => {
		console.error(error)
		log_section(10, t0)
		return resolve()
	})
})

countJS(SECT10)
