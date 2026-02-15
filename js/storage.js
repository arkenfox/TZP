'use strict';

/* Web SQL Database API / openDatabase
	don't test for this: it was implemented only in blink and safari
	- https://developer.chrome.com/blog/deprecating-web-sql
	- blink: API default disabled 119 (oct 2023) removed 124 (april 2024)
	- safari: removed in 2019
*/

/*
	ToDo: leverage expires to get real date/time (substract our constant - e.g 2 days)
	cookieStore.getAll().then(cookies=>console.log(cookies))
	some engines return more information
	e.g. chrome includes
		expires: 1765940558000
*/

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
	const GiB = 1073741824
	// test
	//bytes = Math.floor(((32/5) * GiB))    // = 6.4 exact
	//bytes = Math.floor(((32/5) * GiB)) -1 // = 6-7 range
	//bytes = Math.floor(((32/5) * GiB)) +1 // = 6-7 range
	//bytes = 5368709119 // 5GiB minus 1 byte = 4-5 range

	let value = (bytes/GiB) // in GiBs
	let isExact = Number.isInteger(value)
	if (!isExact) {
		// catch obvious floating points: i.e a part byte difference :)
		// e.g. 32GiB * 20% (gecko's %) = 6.4GiB = but we get 6.3999999994412065
		// 6.4 * GiB = 6871947673.6 (gecko floors)
		let upper = (Math.ceil(value *10)/10) // e.g. 6.4
		let diff = (upper * GiB) - bytes
		//console.log('bytes', bytes,'\nvalue', value,'\nupper', upper,'\ndiff', diff)
		if (diff < 1) {
			isExact = true
			value = upper
		}
	}
	if (!isExact) {
		// still not exact, floor it
		value = Math.floor(bytes/(GiB) * 10)/10
	}

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
	if ('webkit' == isEngine && 1048576000 == bytes) {value = '1000 MB'} else {value += ' GiB'}
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

function get_idb(METRIC) {
	let value = zE
	try {
		let test = window[METRIC]
		if (runST) {test = []}
		let typeCheck = typeFn(test, true)
		if ('undefined' == typeCheck) {value = typeCheck
		} else if ('object' !== typeCheck) {throw zErrType +typeCheck}
	} catch(e) {
		log_error(6, METRIC, e); value = zErr
	}
	addBoth(6, METRIC, value)
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

const get_storage_quota = (METRIC) => new Promise(resolve => {
	let isLies = false, notation = rfp_red
	let isAuto = false
	Promise.all([
		lookup_permission('persistent-storage')
	]).then(function(res){
		if ('granted' == res[0] || 'denied' == res[0]) {isAuto = true} // no prompt
		try {
			let test = 'storage_quota' == METRIC ? navigator.storage : navigator.webkitTemporaryStorage

			if (undefined == test) {
				exit('undefined')
			} else {
				navigator.storage.estimate().then(estimate => {
					let bytes = estimate.quota
					if (runST) {bytes = undefined} else if (runSL) {addProxyLie('StorageManager.estimate')}
					let typeCheck = typeFn(bytes)
					if ('number' !== typeCheck && !Number.isInteger(bytes)) {throw zErrType + typeCheck}
					let value = lookup_storage_bucket('quota', bytes, isAuto)
					let display = value +' ['+ bytes +' bytes]'
					if (isProxyLie('StorageManager.estimate')) {isLies = true}
					// 1781277 RFP can only be exactly 10GB or 50GB
					if (10737418240 == bytes || 53687091200 == bytes) {notation = rfp_green}
					sDetail.document.lookup[METRIC] = display
					exit(display, value)
				}).catch(function(e){
					exit(log_error(6, METRIC, e), zErr)
				})
			}
		} catch(e) {
			exit(log_error(6, METRIC, e), zErr)
		}
	})
	function exit(display, value) {
		addBoth(6, METRIC, display,'', notation, value, isLies)
		// silent run manager to force granted quota when run
		if (isAuto) {
			Promise.all([outputUserStorageManager()]).then(function(){return resolve()})
		} else {
			return resolve()
		}
	}
})

function get_workers(METRIC) {
	// these are kinda redundant because we have them in window properties metric, and in future
	// we will type check and use their scopes in the overall fingerptint: until then ...
	let aList = ['ServiceWorker','SharedWorker','Worker']
	let data = {}, aStr = []
	aList.forEach(function(k){
		let value = zE
		try {
			let test = window[k]
			if (runST) {test = false}
			let typeCheck = typeFn(test)
			if ('undefined' == typeCheck) {value = typeCheck
			} else if ('function' !== typeCheck) {throw zErrType + typeCheck}
		} catch(e) {
			log_error(6, METRIC +'_'+ k, e); value = zErr
		}
		data[k] = value
		aStr.push(value)
	})
	addDisplay(6, METRIC, aStr.join(' | '))
	addData(6, METRIC, data, mini(data))
	return
}

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

const test_worker = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	let METRIC = 'worker_test'
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

const test_worker_service = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'worker_service_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0,'', value)}
	}
	if ('undefined' == typeof ServiceWorker) {
			exit('undefined')
	} else {
		try {
			navigator.serviceWorker.register('js/storage_service_worker.js').then((registration) => {
				exit(zS)
				registration.unregister().then(function(boolean) {})
			})
			.catch((error) => {
				exit(zErr)
			})
		} catch {exit(zErr)}
	}
})

const test_worker_shared = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'worker_shared_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0,'', value)}
		return resolve()
	}
	if ('undefined' == typeof SharedWorker) {
		exit('undefined')
	} else {
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
	}
})

const test_worker_shared_new = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	let METRIC = 'worker_shared_test'
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

const outputStorage = () => new Promise(resolve => {
	let rndStr = rnd_string()
	Promise.all([
		get_idb('indexedDB'),
		get_workers('workers'),
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
