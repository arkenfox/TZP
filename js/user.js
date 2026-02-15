'use strict';

/* USER */

function exitUserFS() {
	try {document.exitFullscreen()} catch {}
}

const outputUserAgentOpen = (METRIC) => new Promise(resolve => {
	let list = ['appCodeName','appName','appVersion','buildID','oscpu',
		'platform','product','productSub','userAgent','vendor','vendorSub']
	
	let data = {'useragent': {}, 'useragentdata': {}}, r
	let newWin = window.open()
	let newNavigator = newWin.navigator

	function exit(value) {
		newWin.close()
		data['useragentdata'] = value
		// make agent_reported same structure as section
		let newobj = {}
		for (const k of Object.keys(data).sort()) {
			if ('object' == typeof data[k]) {newobj[k] = {'hash': mini(data[k]), 'metrics': data[k]}} else {newobj[k] = data[k]}
		}
		data = newobj
		// hash
		let hash = mini(data)
		const ctrlHash = mini(sDetail.document.agent_reported)
		// output
		if (hash == ctrlHash) {
			hash += match_green
		} else {
			addDetail(METRIC, data)
			hash += addButton(2, METRIC) + match_red
		}
		addDisplay(2, METRIC, hash)
		return resolve()
	}

	// useragent
	list.forEach(function(p) {
		try {
			r = newNavigator[p]
			let typeCheck = typeFn(r, true), expectedType = 'string'
			if (!isGecko) {
				// type check will throw an error for a string "undefined"
				if ('buildID' == p || 'oscpu' == p) {expectedType = 'undefined'}
			}
			if (expectedType !== typeCheck) {throw zErr}
			if ('' == r) {r = 'empty string'}
		} catch(e) {
			r = e
		}
		data['useragent'][p] = r+''
	})
	// useragentdata
	try {
		let k = navigator.userAgentData
		let typeCheck = typeFn(k, true)
		if ('undefined' == typeCheck) {
			exit(typeCheck)
		} else {
			if ('object' !== typeCheck) {throw zErr}
			if ('[object NavigatorUAData]' !== k+'') {throw zErr}
			navigator.userAgentData.getHighEntropyValues([
				'architecture','bitness','brands','formFactors','fullVersionList','mobile',
				'model','platform','platformVersion','uaFullVersion','wow64'
			]).then(res => {
 				exit(res)
			}).catch(function(err){
				exit(zErr)
			})
		}
	} catch(e) {
		exit(zErr)
	}
})

const outputUserAudio = (METRIC) => new Promise(resolve => {
	// oscillator
	const get_oscillator = (metric) => new Promise(resolve => {
		let btn =''
		function exit(value, data) {
			if (undefined !== data) {
				sDetail[isScope][metric] = data
				btn = addButton(11, metric)
			}
			addDisplay(11, metric, value, btn)
			return resolve([metric, value])
		}
		try {
			if (runSE) {foo++}
			let results = [],
				audioCtx = new window.AudioContext
			let oscillator = audioCtx.createOscillator(),
				analyser = audioCtx.createAnalyser(),
				gain = audioCtx.createGain(),
				scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1)

			gain.gain.value = 0
			oscillator.type = 'triangle'
			oscillator.connect(analyser)
			analyser.connect(scriptProcessor)
			scriptProcessor.connect(gain)
			gain.connect(audioCtx.destination)

			scriptProcessor.onaudioprocess = function(bins) {
				try {
					bins = new Float32Array(analyser.frequencyBinCount)
					analyser.getFloatFrequencyData(bins) // JSShelter errors here
					if ('object' !== typeFn(bins)) {throw zErrType +'Float32Array: '+ typeFn(bins)}
					for (let i=0; i < bins.length; i++) {results.push(bins[i])}
					analyser.disconnect()
					scriptProcessor.disconnect()
					gain.disconnect()
					// output
					if (runSL) {results = []}
					let typeCheck = typeFn(results[0])
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					let hash = mini(results)
					exit(hash, results)
				} catch(e) {
					exit(log_error(11, metric, e), e+'')
				}
			}
			oscillator.start(0)
		} catch(e) {
			exit(log_error(11, metric, e), e+'')
		}
	})
	// hybrid
	const get_oscillator_compressor = (metric) => new Promise(resolve => {
		let btn =''
		function exit(value, data) {
			if (undefined !== data) {
				sDetail[isScope][metric] = data
				btn = addButton(11, metric)
			}
			addDisplay(11, metric, value, btn)
			return resolve([metric, value])
		}
		try {
			let results = []
			let audioCtx = new window.AudioContext,
				oscillator = audioCtx.createOscillator(),
				analyser = audioCtx.createAnalyser(),
				gain = audioCtx.createGain(),
				scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1)

			// compressor
			let compressor = audioCtx.createDynamicsCompressor()
			compressor.threshold && (compressor.threshold.value = -50)
			compressor.knee && (compressor.knee.value = 40)
			compressor.ratio && (compressor.ratio.value = 12)
			compressor.reduction && (compressor.reduction.value = -20)
			compressor.attack && (compressor.attack.value = 0)
			compressor.release && (compressor.release.value = .25)

			gain.gain.value = 0 // 0 volume
			oscillator.type = 'triangle' // wave
			oscillator.connect(compressor)
			compressor.connect(analyser)
			analyser.connect(scriptProcessor)
			scriptProcessor.connect(gain)
			gain.connect(audioCtx.destination)

			scriptProcessor.onaudioprocess = function(bins) {
			try {
					bins = new Float32Array(analyser.frequencyBinCount)
					analyser.getFloatFrequencyData(bins) // JSShelter errors here
					if ('object' !== typeFn(bins)) {throw zErrType +'Float32Array: '+ typeFn(bins)}
					for (let i=0; i < bins.length; i++) {results.push(bins[i])}
					analyser.disconnect()
					scriptProcessor.disconnect()
					gain.disconnect()
					// check
					if (runSE) {foo++} else if (runSL) {results = []}
					let typeCheck = typeFn(results[0])
					if ('number' !== typeCheck) {throw zErrType + typeCheck}
					let hash = mini(results)
					exit(hash, results)
				} catch(e) {
					exit(log_error(11, metric, e), e+'') // user test: reflect error entropy
				}
			}
			oscillator.start(0)
		} catch(e) {
			exit(log_error(11, metric, e), e+'') // user test: reflect error entropy
		}
	})
	// run
	let section = {}
	function run() {
		let notation = rfp_red
		try {
			let tStart = nowFn()
			let test = new window.AudioContext
			Promise.all([
				get_oscillator(METRIC +'_oscillator'),
				get_oscillator_compressor(METRIC +'_oscillator_compressor'),
			]).then(function(results){
				section[results[0][0]] = results[0][1] // oscillator
				section[results[1][0]] = results[1][1] // oscillator_compressor
				let obj = {}
				for (const k of Object.keys(section).sort()) {obj[k.replace('audio_test_', '')] = section[k]}
				let hash = mini(obj)
				addDetail(METRIC, obj)
				if (true === isArch) {
					if ('e2bbb839' == hash) {
						// {"oscillator": "5b3956a9", "oscillator_compressor": "e08487bf"}
						notation = sgtick+'x86_64/amd_64]'+sc
					} else if ('011d0e6e' == hash) {
						// {"oscillator": "f263f055", "oscillator_compressor": "1f38e089"}
						notation = sgtick+'ARM64/aarch64]'+sc
					}
				} else if ('e9f98e24' == hash) {
					// {"oscillator": "e9f98e24", "oscillator_compressor": "bafe56d6"}
					notation = sgtick+'x86/i686/ARMv7]'+sc
				}
				addDisplay(11, METRIC, hash, addButton(0, METRIC, Object.keys(section).length +' metrics'), notation)
				if (isPerf) {
					sDataTemp['perf'].push([2, METRIC, performance.now() - tStart, performance.now()])
					output_perf(METRIC)
				}
				return resolve()
			})
		} catch(e) {
			addDisplay(11, METRIC, log_error(11,'audio2', e), '', notation)
			return resolve()
		}
	}
	// start
	Promise.all([
		outputPrototypeLies(),
	]).then(function(){
		run()
	})
})

const outputUserFS = (METRIC) => new Promise(resolve => {
	gFS = false
	try {
		if (isDesktop) {
			// desktop: use documentElement
				// we can scroll, click, view everything
				// let the resize event trigger running the section
				// let get_scr_measure check for document.fullscreen and fill in the display
				// use svh because otherwise the height is the full document height
			document.documentElement.requestFullscreen()
			return resolve()
		} else {
			let element = dom.tzpFS
			Promise.all([
				element.requestFullscreen()
			]).then(function(){
				get_scr_fs_measure()
				return resolve()
			})
		}
	} catch(e) {
		addDisplay(1, METRIC, log_error(1, METRIC, e))
		return resolve()
	}
})

const outputUserNewWin = (METRIC) => new Promise(resolve => {
	let sizesi = [], // inner history
		sizeso = [], // outer history
		n = 1, // setInterval counter
		newWinLeak =''

	// open
		// was: tests/newwin.html
		// use about:blank (same as forcing a delay with a non-existant website)
	let newWin = window.open('about:blank','width=9000,height=9000')
	//let newWin = window.open('tests/newwin.html','width=9000,height=9000')
	let iw = newWin.innerWidth,
		ih = newWin.innerHeight,
		ow = newWin.outerWidth,
		oh = newWin.outerHeight
	sizesi.push(iw +' x '+ ih)
	sizeso.push(ow +' x '+ oh)
	// default output
	newWinLeak = iw +' x '+ ih +' [inner] '+ ow +' x '+ oh +' [outer]'

	function check_newwin() {
		let changesi = 0,
			changeso = 0
		// detect changes
		let prev = sizesi[0]
		let strInner = s1 +'inner: '+ sc + iw +' x '+ ih
		for (let k=0; k < sizesi.length; k++) {
			if (sizesi[k] !== prev ) {
				changesi++;	strInner += s1 +' &#9654 <b>['+ k +']</b> '+ sc + sizesi[k]
			}
			prev = sizesi[k]
		}
		prev = sizeso[0]
		let strOuter = s1 +'outer: '+ sc + ow +' x '+ oh
		for (let k=0; k < sizeso.length; k++) {
			if (sizeso[k] !== prev ) {
				changeso++;	strOuter += s1 +' &#9654 <b>['+ k +']</b> '+ sc + sizeso[k]
			}
			prev = sizeso[k]
		}
		// one or two lines
		if (changesi > 0 || changeso > 0) {
			newWinLeak = strInner +'<br>'+ strOuter
		}
		// output
		addDisplay(1, METRIC, newWinLeak)
		return resolve()
	}
	function build_newwin() {
		// check n times as fast as we can/dare
		if (n == 150) {
			clearInterval(checking)
			check_newwin()
		} else {
			// grab metrics
			try {
				sizesi.push(newWin.innerWidth +' x '+ newWin.innerHeight)
				sizeso.push(newWin.outerWidth +' x '+ newWin.outerHeight)
			} catch {
				clearInterval(checking)
				// if not 'permission denied', eventually we always get
				// NS_ERROR_UNEXPECTED which we can ignore. Always output
				//console.log(e)
				//console.log(n, sizesi, sizeso)
				check_newwin()
			}
		}
		n++
	}
	let checking = setInterval(build_newwin, 3)
})

const outputUserPointer = (METRIC, event) => new Promise(resolve => {
	// ToDo: also look at radiusX/Y, screenX/Y, clientX/Y
	// https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/28535#note_2906361
	if (window.PointerEvent === undefined) {
		addDisplay(7, METRIC, 'undefined')
		return resolve()
	}
	let oData = {'pointerdown': {}, 'pointerrawupdate': isPointerRawUpdate}
	let oList = {
		isPrimary: 'boolean', // RFP true
		pressure: 'number', // RFP: 0 if not active, 0.5 if active
		mozPressure: 'number',
		pointerType: 'string', // RFP mouse
		mozInputSource: 'number', // mouse = 1, pen = 2, touch = 5
		tangentialPressure: 'number', // RFP 0
		tiltX: 'number', // RFP 0
		tiltY: 'number', // RFP 0
		twist: 'number', // RFP 0
		width: 'number', // RFP 1
		height: 'number', // RFP 1
		altitudeAngle: 'number',
		azimuthAngle: 'number',
	}
	if (!isGecko) {
		oList.mozPressure = 'undefined'
		oList.mozInputSource = 'undefined'
	}
	for (const k of Object.keys(oList).sort()) {
		let value = event[k], expected = oList[k], typeCheck = typeFn(value)
		if (typeCheck !== expected) {
			value = zErrType + typeCheck
		}
		if ('undefined' == typeCheck) {value += ''}
		oData['pointerdown'][k] = value
	}
	let hash = mini(oData), btn = addButton(7, METRIC)
	sDetail[isScope][METRIC] = oData
	addDisplay(7, METRIC, hash, btn)
	return resolve()
})

const outputUserStorageManager = (isUserTest = false, METRIC = 'storage_manager') => new Promise(resolve => {
	// note: delay = 0 and !isUSerTest = silent run if permission granted on main TZP test
	let notation = rfp_red
	function exit(value) {
		addDisplay(6, METRIC, value,'', notation)
		return resolve()
	}
	try {
		if (undefined == navigator.storage) {
			exit('undefined')
		} else {
			navigator.storage.persist().then(function(persistent) {
				navigator.storage.estimate().then(estimate => {
					// we don't care about estimate.usage
					let bytes = estimate.quota // bytes
					let typeCheck = typeFn(bytes)
					if ('number' === typeCheck && Number.isInteger(bytes)) {
						let value = lookup_storage_bucket('manager', bytes)
						value += ' ['+ bytes +' bytes]'
						if (isProxyLie('StorageManager.estimate')) {
							value = log_known(6, METRIC, value)
						} else {
							// 1781277 RFP can only be exactly 10GiB or 50GiB
							if (10737418240 == bytes || 53687091200 == bytes) {notation = rfp_green}
						}
						exit(value)
					} else {
						throw zErrType + typeCheck
					}
				}).catch(function(e){exit(log_error(6, METRIC, e))})
			}).catch(function(e){exit(log_error(6, METRIC, e))})
		}
	} catch(e) {exit(log_error(6, METRIC, e))}
})

const outputUserTimingAudio = (METRIC) => new Promise(resolve => {
	// contexttime: geckoview
		// TypeError: undefined (with and with and w/out RFP)) on first run sometimes (and sometimes subsequent runs)
		// seen in FF139 stable, 141 beta, 142 nightly

	let aList = ['contexttime','performancetime'], oTime = {}, audioCtx, source, rAF 
	aList.forEach(function(k){
		gData.timing[k] = []
		oTime[k] = []
	})

	// collect
	function collectTimestamps() {
		const ts = audioCtx.getOutputTimestamp();
		oTime.contexttime.push(ts.contextTime * 1000)
		oTime.performancetime.push(ts.performanceTime)
		rAF = requestAnimationFrame(collectTimestamps); // Reregister itself
		if (oTime.contexttime.length > 20) {stop()}
	}

	// record
	try {
		audioCtx = new AudioContext()
		source = new AudioBufferSourceNode(audioCtx);
		source.start(0);
		rAF = requestAnimationFrame(collectTimestamps)
	} catch(e) {
		addDisplay(17, METRIC, log_error(17, METRIC, e),'', rfp_red)
		return resolve()
	}

	// finish
	function stop() {
		source.stop(0)
		cancelAnimationFrame(rAF)
		aList.forEach(function(k){
			let data = oTime[k]
			data = dedupeArray(data)
			// contextTime: if the first value (we deduped) is 0 then we need to drop it
				// otherwise the first diff causes an offset to our 60FPS timing as rAF catches up: e.g.
				// 0, 10, 26.6, 43.3, 76.6, 110, 143.3, 160, 176.6, 193.3, 210, 243.3
				// 0, 10, 26.6, 43.3
				// ^ should be 0, 16.6, 33.3: i.e the [0, 10, 26.6...] we drop the start point of 0
				// after that everythng is in sync
			if ('contexttime' == k && 0 == data[0]) {data = data.slice(1)}
			gData.timing[k] = data
		})
		Promise.all([
			get_timing(METRIC)
		]).then(function(){
			return resolve()
		})
	}
})

function outputUser(x, event) {
	// manual tests: require user initiated, permissions, transient activity

	// do nothing
	if (isBlock || !gClick) {return}
	// if already in fullscreenElement, nothing to do
		// we already did it when entering and resize picks up changes
	if ('fullscreenElement' == x) {
		if (document.fullscreen || document.webkitIsFullscreen) {
			return
		}
	}

	sDataTemp.display.manual = {} // reset display data
	gClick = false // prevent other tests
	gRun = false // reset
	get_isPerf() // reset
	isScope = 'manual'

	// promise
	var promiseTest = async function(x) {
		if ('agent_open' == x) { return(outputUserAgentOpen(x))}
		if ('audio_test' == x) { return(outputUserAudio(x))}
		if ('fullscreenElement' == x) { return(outputUserFS(x))}
		if ('newwin' == x) { return(outputUserNewWin(x))}
		if ('pointer_event' == x) { return(outputUserPointer(x, event))}
		if ('storage_manager' == x) { return(outputUserStorageManager(true))}
		if ('timing_audio' == x) { return(outputUserTimingAudio(x))}
	}

	// ToDo: add an x option to run all (except FS)
	if ('all' == x) {

	} else {
		try {dom[x] = ''} catch {} // clear
		// clear additional
		try {
			let items = document.getElementsByClassName('u'+x)
			for (let i=0; i < items.length; i++) {items[i].innerHTML = '&nbsp'}
		} catch {}
		let noDelay = ['audio','newwin', 'timing_audio']
		let delay = noDelay.includes(x) ? 0 : 170
		setTimeout(function() {
			Promise.all([
				promiseTest(x)
			]).then(function(){
				gClick = true
				let target = sDataTemp.display.manual
				for (const k of Object.keys(target)) {dom[k].innerHTML = target[k]}		
			})
		}, delay)
	}
}

countJS('user')
