'use strict';

function lookup_cookie(name) {
	name += '='
	let decodedCookie = decodeURIComponent(document.cookie)
	let ca = decodedCookie.split(';')
	for (let i=0; i < ca.length; i++) {
		let c = ca[i]
		while (c.charAt(0) == ' ') {c = c.substring(1)}
		if (c.indexOf(name) == 0) {return c.substring(name.length, c.length)}
	}
	return ''
}

const get_caches = (METRIC) => new Promise(resolve => {
	let t0 = nowFn()
	// PB mode: DOMException: The operation is insecure.
		// FF122: 1864684: dom.cache.privatebrowsing.enabled
		// also see 1742344 / 1714354
	Promise.all([
		window.caches.keys()
	]).then(function(){
		exit(zE)
	}).catch(function(e){
		exit(log_error(6, METRIC, e))
	})
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
		value = navigator.cookieEnabled ? zE : zD
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
	let value, obj = window[METRIC]
	try {
		value = 'object' == typeFn(obj, true) ? zE : zD
	} catch(e) {
		log_error(6, METRIC, e); value = zErr
	}
	// use a different suffix than cookies
	let aTests = ['_session_store','_persistent_store']
	aTests.forEach(function(k){
		try {
			value += ' | ' + 'TBA'
		} catch(e) {
			// slice "_store": consistent style to match cookies
			// redundant to use "cookieStore_session_store"
			log_error(6, METRIC + k.slice(0,-6), e); value += ' | '+ zErr
		}
	})
	// don't use cookie in element names == adblockers might block display
	addDisplay(6, 'cstest', value)
	addData(6, METRIC, value)
	return resolve()
})

function get_filesystem(METRIC) {
	let display = isFileSystem, notation =''
	if (isFileSystem === zErr) {
		display = log_error(6, METRIC, isFileSystemError)
	}
	// PBmode: SecurityError: Security error when calling GetDirectory
	if (isTB) {
		notation = ('SecurityError: Security error when calling GetDirectory' == isFileSystemError ? tb_green : tb_red)
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
	let obj = window[type +'Storage']
	try {
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
	let notation = isTB ? tb_red : ''

	function exit(value) {
		dom[METRIC].innerHTML = value + notation
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
						let value = Math.floor(bytes/(1073741824) * 10)/10 // round down
						value += 'GB ['+ bytes +' bytes]'
						if (isProxyLie('StorageManager.estimate')) {
							value = log_known(6, METRIC, value)
						} else if (isTB && 10737418240 == bytes) { // not a lie, exact match
							notation = tb_green
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
	let isLies = false, notation = isTB ? tb_red : ''
	function exit(display, value) {
		addBoth(6, METRIC, display,'', notation, value, isLies)
		return resolve()
	}
	try {
		navigator.storage.estimate().then(estimate => {
			let bytes = estimate.quota
			if (runST) {bytes = undefined} else if (runSL) {addProxyLie('StorageManager.estimate')}
			let typeCheck = typeFn(bytes)
			if ('number' !== typeCheck && !Number.isInteger(bytes)) {throw zErrType + typeCheck}
			let value = Math.floor(bytes/(1073741824) * 10)/10 // round down so even 1 byte less !== 10
			let display = value +'GB ['+ bytes +' bytes]'
			if (isProxyLie('StorageManager.estimate')) {isLies = true}
			if (isTB && 10737418240 == bytes) {notation = tb_green}
			sDetail.document.lookup[METRIC] = display
			exit(display, value)
		}).catch(function(e){
			exit(log_error(6, METRIC, e), zErr)
		})
	} catch(e) {
		exit(log_error(6, METRIC, e), zErr)
	}
})

const get_permissions = (item) => new Promise(resolve => {
	const METRIC = 'permission_'+ item
	const aGood = ['denied','granted','prompt']
	function exit(display, value) {
		if (value == undefined) {value = display}
		let notation = value == 'prompt' ? default_green : default_red
		addBoth(6, METRIC, display,'', notation, value)
		// silent run manager to force granted quota when run
		if ('persistent-storage' == item && 'granted' == value) {
			Promise.all([get_storage_manager(0)]).then(function(){return resolve()})
		} else {
			return resolve()
		}
	}
	try {
		navigator.permissions.query({name:item}).then(function(r) {
			let rstate = r.state
			if (runST) {rstate = undefined} else if (runSI) {rstate = 'allowed'}
			// checks
			let typeCheck = typeFn(rstate)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (!aGood.includes(rstate)) {throw zErrInvalid +'expected '+ aGood.join(', ') +': got '+ rstate}
			exit(rstate)
		}).catch(e => {
			exit(e, zErrShort)
		})
	} catch(e) {
		exit(e, zErrShort)
	}
})

function test_idb(log = false) {
	let t0 = nowFn(), rndStr = rnd_string()
	const METRIC = 'indexedDB_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
		return
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
	} catch(e) {
		exit(zErr)
	}
}

const test_worker_service = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'service_worker_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
	}
	try {
		navigator.serviceWorker.register('js/storage_service_worker.js').then((registration) => {
			exit(zS)
			registration.unregister().then(function(boolean) {})
		})
    .catch((error) => {
			exit(zErr)
		})
	} catch(e) {exit(zErr)}
})

const test_worker_shared = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'shared_worker_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
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
	} catch(e) {
		exit(zErr)
	}
})

const test_worker_web = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'web_worker_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
		return resolve()
	}
	if (isFile) {
		exit(zSKIP)
	} else {
		try {
			let worker = new Worker('js/storage_workers.js')
			let rndStr1 = rnd_string()
			worker.addEventListener('message', function(e) {
				let value = ('TZP-'+ rndStr1 === e.data) ? zS : zF
				worker.terminate
				exit(value)
			}, false)
			worker.onerror = function (e) {exit(zErr)}
			worker.postMessage(rndStr1)
		} catch(e) {
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
		get_permissions('notifications'),
		get_permissions('persistent-storage'),
		get_permissions('push'),
		get_filesystem('filesystem'),
		get_storage_quota('storage_quota')
	]).then(function(){
		return resolve()
	})
})

countJS(6)
