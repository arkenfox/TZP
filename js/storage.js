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
	let notation = default_red
	function exit(display, value) {
		// don't use caches for element name == window.caches !== a function
		addDisplay(6, 'window.caches', display,'', (isTB ? notation : ''))
		addData(6, METRIC, value)
		log_perf(6, METRIC, t0)
		return resolve()
	}
	// PB mode: DOMException: The operation is insecure.
		// FF122: 1864684: dom.cache.privatebrowsing.enabled
		// also see 1742344 / 1714354
	Promise.all([
		window.caches.keys()
	]).then(function(){
		notation = default_green
		exit(zE, zE)
	}).catch(function(e){
		exit(log_error(6, METRIC, e), zErr)
	})
})

const get_cookies = (METRIC) => new Promise(resolve => {
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

	try {
		let rndA = 'session_'+ rnd_string(), rndB = rnd_string()
		document.cookie = rndA +'='+ rndB +'; SameSite=Strict'
		value += ' | '+ (lookup_cookie(rndA) == rndB ? zS : zF)
	} catch(e) {
		log_error(6, METRIC +'_session', e); value += ' | '+ zErr
	}
	try {
		let rndC = 'persistent_'+ rnd_string(), rndD = rnd_string()
		let d = new Date()
		d.setTime(d.getTime() + 86400000) // 1 day
		let expires = 'expires='+ d.toUTCString()
		document.cookie = rndC +'='+ rndD +'; SameSite=Strict; '+ expires
		value += ' | '+ (lookup_cookie(rndC) == rndD ? zS : zF)
	} catch(e) {
		log_error(6, METRIC +' persistent', e); value += ' | '+ zErr
	}
	// don't use cookie in element names == adblockers might block display
	addDisplay(6, 'ctest', value)
	addData(6, METRIC, value)
	return resolve()
})

const get_filesystem = (METRIC) => new Promise(resolve => {
	let display = isFileSystem, notation = ''
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
	return resolve()
})

const get_storage = (METRIC) => new Promise(resolve => {
	// dom.storage.enabled
	let value
	let item = ('localStorage' == METRIC ? localStorage : sessionStorage)
	try {
		value = 'object' == typeFn(item, true) ? zE : zD
	} catch(e) {
		log_error(6, METRIC, e); value = zErr
	}

	let prefix = ('localStorage' == METRIC ? 'local_' : 'session_')
	try {
		let rndA = prefix + rnd_string(), rndB = rnd_string()
		item.setItem(rndA, rndB)
		value += ' | '+ (item.getItem(rndA) == rndB ? zS : zF)
	} catch(e) {
		log_error(6, METRIC +'_test', e.name); value += ' | '+ zErr
	}
	addBoth(6, METRIC, value)
	return resolve()
})

const get_storage_manager = (delay = 170) => new Promise(resolve => {
	// note: delay = 0 = silent run if permission granted
	const METRIC = 'storage_manager'
	dom[METRIC] = ''
	function exit(value) {
		dom[METRIC].innerHTML = value
		return resolve()
	}
	setTimeout(function() {
		try {
			navigator.storage.persist().then(function(persistent) {
				navigator.storage.estimate().then(estimate => {
					// we don't care about estimate.usage
					let value = estimate.quota
					let typeCheck = typeFn(value)
					if ('number' === typeCheck && Number.isInteger(value)) {
						value = Math.floor(estimate.quota/(1073741824) * 10)/10 // round down
						value += 'GB ['+ estimate.quota +' bytes]'
						if (isProxyLie('StorageManager.estimate')) {value = log_known(6, METRIC, value)}
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
	let isLies = false
	function exit(display, value) {
		addBoth(6, METRIC, display,'','', value, isLies)
		return resolve()
	}
	try {
		navigator.storage.estimate().then(estimate => {
			let value = estimate.quota
			if (runST) {value = undefined} else if (runSL) {addProxyLie('StorageManager.estimate')}
			let typeCheck = typeFn(value)
			if ('number' !== typeCheck && !Number.isInteger(value)) {throw zErrType + typeCheck}
			let display = value
			value = Math.floor(value/(1073741824) * 10)/10 // round down
			display = value +'GB ['+ display +' bytes]'
			if (isProxyLie('StorageManager.estimate')) {isLies = true}
			exit(display, value)
		}).catch(function(e){exit(log_error(6, METRIC, e), zErr)})
	} catch(e) {exit(log_error(6, METRIC, e), zErr)}
})

const get_permissions = (item) => new Promise(resolve => {
	const METRIC = 'permission_'+ item
	const aGood = ['denied','granted','prompt']
	function exit(display, value) {
		if (value == undefined) {value = display}
		let notation = value == 'prompt' ? default_green : default_red
		addBoth(6, METRIC, display,'', notation, value)

		if ('persistent-storage' == item && 'granted' == value) {
			// silent run manager to force granted quota when run
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

const test_idb = (log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = 'indexedDB_test'
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
		return resolve()
	}
	try {
		let rndStrI = 'idb_'+ rnd_string()
		let openIDB = indexedDB.open(rndStrI)
		// create
		openIDB.onupgradeneeded = function(event){
			let dbObject = event.target.result
			let dbStore = dbObject.createObjectStore(METRIC, {keyPath:'id'})
		}
		openIDB.onsuccess = function(event) {
			let dbObject = event.target.result
			// start
			let dbTx = dbObject.transaction(METRIC, 'readwrite')
			let dbStore = dbTx.objectStore(METRIC)
			// add
			let rndIndex = rnd_number()
			let rndValue = rnd_string()
			dbStore.put( {id: rndIndex, value: rndValue} )
			// query
			let getStr = dbStore.get(rndIndex)
			getStr.onsuccess = function() {
				exit(getStr.result.value == rndValue ? zS : zF)
			}
			// close
			dbTx.oncomplete = function() {dbObject.close()}
		}
		openIDB.onerror = function(event) {exit(zF)}
	} catch(e) {
		exit(zErr)
	}
})

const test_worker_service = (log = false) => new Promise(resolve => {
	let t0 = performance.now()
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
	let t0 = performance.now()
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
	let t0 = performance.now()
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

	Promise.all([
		get_cookies('cookies'),
		get_storage('localStorage'),
		get_storage('sessionStorage'),
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
