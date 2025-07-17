'use strict';

function lookup_cookie(name) {
	try {
		name += '='
		let decodedCookie = decodeURIComponent(document.cookie)
		let ca = decodedCookie.split(';')
		for (let i=0; i < ca.length; i++) {
			let c = ca[i]
			while (c.charAt(0) == ' ') {c = c.substring(1)}
			if (c.indexOf(name) == 0) {return c.substring(name.length, c.length)}
		}
	} catch {}
	return ''
}

const lookup_cookiestore = async function(rndStr, k) {
	try {
		let cookie = await cookieStore.get(rndStr + k)
		return cookie.value
	} catch(e) {
		return ''
	}
}

const lookup_permission = (item) => new Promise(resolve => {
	try {
		navigator.permissions.query({name: item}).then(function(r) {
			return resolve(r.state)
		}).catch(e => {
			return resolve()
		})
	} catch(e) {
		return resolve()
	}
})

function lookup_storage_bucket(type, bytes, granted = false) {
	// test
		// bytes = 5368709120 // 5GB exactly = 5-6GB
		// bytes = 5368709119 // 5GB minus 1 byte = 4-5GB
	// 1073741824 = (1024 * 1024 * 1024)/10
		// round down so even 1 byte less !== 10
	let value = Math.floor(bytes/(1073741824) * 10)/10
	let isExact = (10737418240 == bytes || 53687091200 == bytes)
	if ('quota' == type && !isExact) {
		// bucketize quota more
			// if persistent-storage is granted
			// if gecko and under 10GB
			// if blink which doesn't protect this | webkit IDK it seems to provide precise values
		let isBucket = (isGecko && value < 10 || !isGecko || granted)
		if (isBucket) {
			if (value < 10) {
				// more precision
				value = Math.floor(value)
				value = value +'-'+ (value + 1)
			} else {
				// round to next 100, return range
				value = Math.ceil(value/100) * 100
				value = value-100 +'-'+ value
			}
		}
	}
	// webkit private window returns 1048576000 bytes = 1000MB
	if ('webkit' == isEngine && 1048576000 == bytes) {value = '1000 MB'} else {value += ' GB'}
	// blink incognito returns 1819735497 bytes = some reduced calculation?
	return value
}

const get_caches = (METRIC) => new Promise(resolve => {
	let t0 = nowFn()
	// PB mode: DOMException: The operation is insecure.
		// FF122: 1864684: dom.cache.privatebrowsing.enabled
		// also see 1742344 / 1714354

	// type check first
		// e.g. insecure parent on http://www.raymondhill.net/ublock/pageloadspeed.html
	let typeCheck = typeFn(window.self.caches, true)
	try {
		if ('object' !== typeCheck) {
			throw zErrType + typeCheck
		} else {
			Promise.all([
				window.self.caches.keys()
			]).then(function(){
				exit(zE)
			}).catch(function(e){
				exit(log_error(6, METRIC, e))
			})
		}
	} catch(err) {
		exit(log_error(6, METRIC, err))
	}
	function exit(str) {
		addBoth(6, METRIC, str,'','', (str = zE ? str : zErr))
		log_perf(6, METRIC, t0)
		return resolve()
	}
})

function get_cookies(METRIC, rndStr) {
	let value
	try {
		let test = navigator.cookieEnabled
		if (runST) {test = undefined}
		let typeCheck = typeFn(test)
		if ('boolean' !== typeCheck) {throw zErrType + typeCheck}
		value = test ? zE : zD
	} catch(e) {
		log_error(6, METRIC, e); value = zErr
	}

	let aTests = ['_session','_persistent']
	aTests.forEach(function(k){
		try {
			let expires =''
			if ('_persistent' == k) {
				let d = new Date()
				d.setTime(d.getTime() + 172800000) // 2 days
				expires = '; expires='+ d.toUTCString()
			}
			document.cookie = rndStr + k +'='+ rndStr +'; SameSite=Strict' + expires
			value += ' | '+ (lookup_cookie(rndStr + k) == rndStr ? zS : zF)
		} catch(e) {
			log_error(6, METRIC + k, e); value += ' | '+ zErr
		}
	})
	// don't use cookie in element names == adblockers might block display
	addDisplay(6, 'ctest', value)
	addData(6, METRIC, value)
	return
}

const get_cookiestore = (METRIC, rndStr) => new Promise(resolve => {
	// https://developer.mozilla.org/en-US/docs/Web/API/CookieStore
	function exit() {
		// don't use cookie in element names == adblockers might block display
		addDisplay(6, 'cstest', value)
		addData(6, METRIC, value)
		return resolve()
	}

	let value, obj = window[METRIC]
	try {
		value = 'object' == typeFn(obj, true) ? zE : zD
	} catch(e) {
		log_error(6, METRIC, e); value = zErr
	}
	if (isFile) {
		value += ' | '+ zSKIP + ' | '+ zSKIP
		exit()
	} else {
		// use a different suffix than cookies
		let aTests = ['_session_store','_persistent_store']
		aTests.forEach(function(k){
			try {
				let options = {name: rndStr + k, value: rndStr}
				if ('_persistent_store' == k) {
					options['expires'] = Date.now() + 172800000 // 2 days
				}
				cookieStore.set(options)
				Promise.all([
					lookup_cookiestore(rndStr, k),
				]).then(function(res){
					value += ' | ' + (res[0] == rndStr ? zS : zF)
					if ('_persistent_store' == k) {exit()}
				})
			} catch(e) {
				// slice "_store": consistent style to match cookies
				// redundant to use "cookieStore_session_store"
				log_error(6, METRIC + k.slice(0,-6), e); value += ' | '+ zErr
				if ('_persistent_store' == k) {exit()}
			}
		})
	}
})

function get_filesystem(METRIC) {
	let display = isFileSystem, notation =''
	if (isFileSystem === zErr) {
		display = log_error(6, METRIC, isFileSystemError)
	}
	// PBmode: SecurityError: Security error when calling GetDirectory
	if (isBB) {
		notation = ('SecurityError: Security error when calling GetDirectory' == isFileSystemError ? bb_green : bb_red)
	} else {
		// FF111: 1811001: dom.fs.enabled = true
		if (isFileSystem == zD) {notation = default_red}
	}
	addBoth(6, METRIC, display,'', notation, isFileSystem)
	return
}

function get_storage(METRIC, rndStr) {
	// dom.storage.enabled
	let value, type = ('localStorage' == METRIC ? 'local' : 'session')
	let obj
	try {
		obj = window[type +'Storage']
		value = 'object' == typeFn(obj, true) ? zE : zD
	} catch(e) {
		log_error(6, METRIC, e); value = zErr
	}

	try {
		if (runSE) {foo++}
		obj.setItem(rndStr +'_'+ type, rndStr)
		value += ' | '+ (obj.getItem(rndStr +'_'+ type) == rndStr ? zS : zF)
	} catch(e) {
		log_error(6, METRIC +'_test', e); value += ' | '+ zErr
	}
	addBoth(6, METRIC, value)
	return
}

const get_storage_manager = (delay = 170) => new Promise(resolve => {
	// note: delay = 0 = silent run if permission granted
	const METRIC = 'storage_manager'
	dom[METRIC] = ''
	let notation = rfp_red

	function exit(value) {
		dom[METRIC].innerHTML = value + (isSmart ? notation : '') // manual test so !isSmart notation not handled
		return resolve()
	}
	setTimeout(function() {
		try {
			navigator.storage.persist().then(function(persistent) {
				navigator.storage.estimate().then(estimate => {
					// we don't care about estimate.usage
					let bytes = estimate.quota
					let typeCheck = typeFn(bytes)
					if ('number' === typeCheck && Number.isInteger(bytes)) {
						let value = lookup_storage_bucket('manager', bytes)
						value += ' ['+ bytes +' bytes]'
						if (isProxyLie('StorageManager.estimate')) {
							value = log_known(6, METRIC, value)
						} else {
							// 1781277 RFP can only be exactly 10GB or 50GB
							if (10737418240 == bytes || 53687091200 == bytes) {notation = rfp_green}
						}
						exit(value)
					} else {
						throw zErrType + typeCheck
					}
				}).catch(function(e){exit(log_error(6, METRIC, e))})
			}).catch(function(e){exit(log_error(6, METRIC, e))})
		} catch(e) {exit(log_error(6, METRIC, e))}
	}, delay)
})

const get_storage_quota = (METRIC) => new Promise(resolve => {
	let isLies = false, notation = rfp_red
	let isGranted = false
	Promise.all([
		lookup_permission('persistent-storage')
	]).then(function(res){
		if ('granted' == res[0]) {isGranted = true}
		try {
			navigator.storage.estimate().then(estimate => {
				let bytes = estimate.quota
				if (runST) {bytes = undefined} else if (runSL) {addProxyLie('StorageManager.estimate')}
				let typeCheck = typeFn(bytes)
				if ('number' !== typeCheck && !Number.isInteger(bytes)) {throw zErrType + typeCheck}
				let value = lookup_storage_bucket('quota', bytes, isGranted)
				let display = value +' ['+ bytes +' bytes]'
				if (isProxyLie('StorageManager.estimate')) {isLies = true}
				// 1781277 RFP can only be exactly 10GB or 50GB
				if (10737418240 == bytes || 53687091200 == bytes) {notation = rfp_green}
				sDetail.document.lookup[METRIC] = display
				exit(display, value)
			}).catch(function(e){
				exit(log_error(6, METRIC, e), zErr)
			})
		} catch(e) {
			exit(log_error(6, METRIC, e), zErr)
		}
	})
	function exit(display, value) {
		addBoth(6, METRIC, display,'', notation, value, isLies)
		// silent run manager to force granted quota when run
		if (isGranted) {
			Promise.all([get_storage_manager(0, true)]).then(function(){return resolve()})
		} else {
			return resolve()
		}
	}
})

const test_idb = (log = false) => new Promise(resolve => {
	let t0 = nowFn(), rndStr = rnd_string()
	const METRIC = 'indexedDB_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0,'', value)}
		return resolve()
	}
	try {
		let openIDB = indexedDB.open(rndStr +'_idb')
		// create
		openIDB.onupgradeneeded = function(event){
			let dbObject = event.target.result
			let dbStore = dbObject.createObjectStore(rndStr, {keyPath:'id'})
		}
		openIDB.onsuccess = function(event) {
			let dbObject = event.target.result
			// start
			let dbTx = dbObject.transaction(rndStr, 'readwrite')
			let dbStore = dbTx.objectStore(rndStr)
			// add
			dbStore.put({id: rndStr, value: rndStr})
			// query
			let getStr = dbStore.get(rndStr)
			getStr.onsuccess = function() {
				exit(getStr.result.value == rndStr ? zS : zF)
			}
			// close
			dbTx.oncomplete = function() {dbObject.close()}
		}
		openIDB.onerror = function(event) {exit(zF)}
	} catch {
		exit(zErr)
	}
})

const test_worker_service = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'service_worker_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0,'', value)}
	}
	try {
		navigator.serviceWorker.register('js/storage_service_worker.js').then((registration) => {
			exit(zS)
			registration.unregister().then(function(boolean) {})
		})
    .catch((error) => {
			exit(zErr)
		})
	} catch {exit(zErr)}
})

const test_worker_shared = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'shared_worker_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0,'', value)}
		return resolve()
	}
	try {
		let shared = new SharedWorker('js/storage_shared_worker.js')
		let rndStr2 = rnd_string()
		shared.port.addEventListener('message', function(e) {
			let value = ('TZP-'+ rndStr2 === e.data) ? zS : zF
			shared.port.close()
			exit(value)
		}, false)
		shared.onerror = function (err) {exit(zErr)}
		shared.port.start()
		shared.port.postMessage(rndStr2)
	} catch {
		exit(zErr)
	}
})

const test_worker_shared_new = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	let METRIC = 'shared_worker_test'
	function exit(value) {
		dom[METRIC].innerHTML = value +' TEST'
		if (log) {log_perf(SECTNF, METRIC, t0,'', value)}
		return resolve()
	}
	if ('undefined' == typeof SharedWorker) {
		exit('undefined')
	} else {
		try {
			const workerScript = 'var ports = []; onconnect = function(e) {let port = e.ports[0]; ports.push(port); '
				+ 'port.start(); port.onmessage = function(e) {port.postMessage("eek")}'
			const workerBlob = new Blob([workerScript], {type: 'application/javascript'})
			const workerURL = URL.createObjectURL(workerBlob)
			const shared = new SharedWorker(workerURL)
			shared.port.postMessage('eek') // ping
			shared.onmessage = function(e) {port.close(); shared.terminate; exit(zS)} // receive
			shared.onerror = function(e) {
				console.log('onerror', e, e.message)
				exit(zErr)
			} // error
			shared.onterminate = function() {URL.revokeObjectURL(workerURL)} // cleanup
		} catch(e) {
			console.log('trycatch', e)
			exit(zErr)
		}
	}
})

const test_worker_web = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	let METRIC = 'web_worker_test'
	function exit(value) {
		dom[METRIC].innerHTML = value
		if (log) {log_perf(SECTNF, METRIC, t0,'', value)}
		return resolve()
	}
	if ('undefined' == typeof Worker) {
		exit('undefined')
	} else {
		try {
			const workerScript = `self.postMessage('eek')`
			const workerBlob = new Blob([workerScript], {type: 'application/javascript'})
			const workerURL = URL.createObjectURL(workerBlob)
			const worker = new Worker(workerURL)
			worker.onmessage = function(e) {worker.terminate; exit(zS)} // receive
			worker.onerror = function(e) {exit(zErr)} // error
			worker.onterminate = function() {URL.revokeObjectURL(workerURL)} // cleanup
		} catch {
			exit(zErr)
		}
	}
})

const outputStorage = () => new Promise(resolve => {
	// ToDo: notification support/test
	addBoth(6, 'indexedDB', 'indexedDB' in window ? zE : zD)
	addBoth(6, 'worker', 'function' == typeFn(Worker) ? zE : zD)

	let rndStr = rnd_string()
	Promise.all([
		get_cookies('cookies', rndStr),
		get_storage('localStorage', rndStr),
		get_storage('sessionStorage', rndStr),
		get_cookiestore('cookieStore', rndStr),
		get_caches('caches'),
		get_filesystem('filesystem'),
		get_storage_quota('storage_quota'),
	]).then(function(){
		return resolve()
	})
})

countJS(6)
