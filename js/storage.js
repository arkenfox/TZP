'use strict';

function lookup_cookie(name) {
	name += "="
	let decodedCookie = decodeURIComponent(document.cookie)
	let ca = decodedCookie.split(';')
	for (let i=0 ; i < ca.length; i++) {
		let c = ca[i]
		while (c.charAt(0) == " ") {c = c.substring(1)}
		if (c.indexOf(name) == 0) {return c.substring(name.length, c.length)}
	}
	return ""
}

const get_caches = () => new Promise(resolve => {
	const METRIC = "caches"
	// 1177968: check for dom.caches.enabled, pref removed in FF117
	if (undefined === window.caches) {
		log_display(6, METRIC, zD + (isTB && isSmart ? tb_red: ""))
		return resolve([METRIC, zD])
	}
	// PB mode: DOMException: The operation is insecure.
		// AFAICT not affected by any prefs
		// also see 1742344
	Promise.all([
		window.caches.keys()
	]).then(function(results){
		log_display(6, METRIC, zS + (isTB && isSmart ? tb_red: ""))
		return resolve([METRIC, zS])
	})
	.catch(function(e){
		log_display(6, METRIC, log_error(SECT6, METRIC, e) + (isTB && isSmart ? tb_green: ""))
		return resolve([METRIC, zErr])
	})
})

const get_cookies = (skip) => new Promise(resolve => {
	// note: don't use "cookie" in elements as adblockers might block display
	const METRIC = "cookies"
	function exit() {
		let value = valueE + " | "+ valueS +" | "+ valueP
		log_display(6, "ctest", value)
		return resolve([METRIC, value])
	}
	let valueE, valueS = zNA, valueP = zNA // skip values
	try {
		let test = navigator.cookieEnabled
		if ("boolean" !== typeof test) {
			valueE = zErr
			log_error(SECT6, METRIC, zErrType + typeof test)
		} else {
			valueE = navigator.cookieEnabled ? zE : zD
		}
	} catch(e) {
		log_error(SECT6, METRIC, e)
		valueE = zErr
	}

	if (!skip) {
		try {
			let rndA = "sc_"+ rnd_string(), rndB = rnd_string()
			document.cookie = rndA +"="+ rndB +"; SameSite=Strict"
			valueS = lookup_cookie(rndA) == rndB ? zS : zF
		} catch(e) {
			log_error(SECT6, METRIC +"_session", e)
			valueS = zErr
		}
		try {
			let rndC = "pc_"+ rnd_string(), rndD = rnd_string()
			let d = new Date()
			d.setTime(d.getTime() + 86400000) // 1 day
			let expires = "expires="+ d.toUTCString()
			document.cookie = rndC +"="+ rndD +"; SameSite=Strict; "+ expires
			valueP = lookup_cookie(rndC) == rndD ? zS : zF
		} catch(e) {
			log_error(SECT6, METRIC +" persistent", e)
			valueP = zErr
		}
	}
	exit()
})

const get_storage = (skip) => new Promise(resolve => {
	const METRICLS = "localStorage", METRICSS = "sessionStorage"
	function exit() {
		valueL += " | "+ valueLTest
		valueS += " | "+ valueSTest
		log_display(6, "lstest", valueL)
		log_display(6, "sstest", valueS)
		return resolve([[METRICLS, valueL],[METRICSS, valueS]])
	}
	let valueL, valueS, valueLTest = zNA, valueSTest = zNA // skip values
	// LS enabled
	try {
		valueL = "object" === typeof localStorage ? zE : zD
	} catch(e) {
		log_error(SECT6, METRICLS, e)
		valueL = zErr
	}
	// SS enabled
	try {
		valueS = "object" === typeof sessionStorage ? zE : zD
	} catch(e) {
		log_error(SECT6, METRICSS, e)
		valueS = zErr
	}

	// dom.storage.enabled
	if (!skip) {
		// LS test
		try {
			let rndA = "lsp_"+ rnd_string(), rndB = rnd_string()
			localStorage.setItem(rndA, rndB)
			valueLTest = localStorage.getItem(rndA) == rndB ? zS : zF
		} catch(e) {
			log_error(SECT6, METRICLS +" test", e.name)
			valueLTest = zErr
		}
		// SS test
		try {
			let rndC = "lss_"+ rnd_string(), rndD = rnd_string()
			sessionStorage.setItem(rndC, rndD)
			valueSTest = sessionStorage.getItem(rndC) == rndD ? zS : zF
		} catch(e) {
			log_error(SECT6, METRICSS +" test", e.name)
			valueSTest = zErr
		}
	}
	exit()
})

const get_storage_manager = (delay = 170) => new Promise(resolve => {
	// note: delay = 0 = silent run if permission granted
	const METRIC = "storage_manager"
	dom[METRIC] = ""
	function exit(value) {
		if (delay !== 0) {dom.storage_manager = value}
		return resolve()
	}
	setTimeout(function() {
		try {
			navigator.storage.persist().then(function(persistent) {
				navigator.storage.estimate().then(estimate => {
					// we don't care about estimate.usage
					let value = Math.floor(estimate.quota/(1073741824) * 10)/10 // round down
					exit(value +"GB ["+ estimate.quota +" bytes]")
				})
			})
		} catch(e) {
			exit(log_error(SECT6, METRIC, e))
		}
	}, delay)
})

const get_storage_quota = () => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = "storage_quota"
	function exit(value, display) {
		log_display(6, METRIC, display)
		log_perf(SECT6, METRIC, t0)
		return resolve([METRIC, value])
	}
	try {
		navigator.storage.estimate().then(estimate => {
			let value = estimate.quota
			if (Number.isInteger(value)) {
				let display = value
				value = Math.floor(value/(1073741824) * 10)/10 // round down
				exit(value, value +"GB ["+ display +" bytes]")
			} else {
				exit(zErr, log_error(SECT6, METRIC, zErrType + typeof value))
			}
		})
	} catch(e) {
		exit(zErr, log_error(SECT6, METRIC, e))
	}
})

const get_permissions = (item) => new Promise(resolve => {
	const METRIC = "permission_"+ item
	let notation = ""
	function exit(value) {
		if (isSmart) {notation = value == "prompt" ? "" : default_red}
		log_display(6, METRIC, value + notation)
		if (item == "persistent-storage" && value == "granted") {
			// silent run manager to force granted quota when run
			Promise.all([
				get_storage_manager(0)
			]).then(function(){
				return resolve([METRIC, value])
			})
		} else {
			return resolve([METRIC, value])
		}
	}
	try {
		navigator.permissions.query({name:item}).then(function(r) {
			exit(r.state)
		}).catch(error => {
			log_error(SECT6, METRIC, error)
			exit(zErr)
		})
	} catch(e) {
		log_error(SECT6, METRIC, e)
		exit(zErr)
	}
})

const test_idb = (skip, log = false) => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = "indexedDB_test"
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
		return resolve()
	}
	if (skip) {
		exit(zNA)
	} else {
		try {
			let rndStrI = "idb_"+ rnd_string()
			let openIDB = indexedDB.open(rndStrI)
			// create
			openIDB.onupgradeneeded = function(event){
				let dbObject = event.target.result
				let dbStore = dbObject.createObjectStore(METRIC, {keyPath:"id"})
			}
			openIDB.onsuccess = function(event) {
				let dbObject = event.target.result
				// start
				let dbTx = dbObject.transaction(METRIC, "readwrite")
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
	}
})

const test_worker_service = (log = false) => new Promise(resolve => {
	let t0 = performance.now()
	const METRIC = "service_worker_test"
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
	}
	try {
		navigator.serviceWorker.register("js/storage_service_worker.js").then((registration) => {
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
	const METRIC = "shared_worker_test"
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
		return resolve()
	}
	try {
		let shared = new SharedWorker("js/storage_shared_worker.js")
		let rndStr2 = rnd_string()
		shared.port.addEventListener("message", function(e) {
			let value = ("TZP-"+ rndStr2 === e.data) ? zS : zF
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

const test_worker_web = (skip, log = false) => new Promise(resolve => {
	let t0 = performance.now()
	const METRIC = "web_worker_test"
	function exit(value) {
		dom[METRIC] = value
		if (log) {log_perf(SECTNF, METRIC, t0)}
		return resolve()
	}
	if (skip) {
		exit(zNA)
	} else {
		try {
			let worker = new Worker("js/storage_workers.js")
			let rndStr1 = rnd_string()
			worker.addEventListener("message", function(e) {
				let value = ("TZP-"+ rndStr1 === e.data) ? zS : zF
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

function outputStorage() {
	// ToDo: notification support/test
	let t0 = nowFn();
	addDataDisplay(6, "indexedDB", "indexedDB" in window ? zE : zD)
	addDataDisplay(6, "worker", "function" === typeof Worker ? zE : zD)

	// FF104- sanitizing issues
	let skip = isFile && isVer < 105
	Promise.all([
		get_caches(),
		get_cookies(skip),
		get_storage(skip),
		get_permissions("notifications"),
		get_permissions("persistent-storage"),
		get_permissions("push"),
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(6, item)})
		Promise.all([
			get_storage_quota()
		]).then(function(results){
			results.forEach(function(item) {addDataFromArray(6, item)})
			log_section(6, t0)
		})
	})
}

countJS(SECT6)
