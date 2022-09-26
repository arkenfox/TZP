'use strict';

function lookup_cookie(name) {
	name += "="
	let decodedCookie = decodeURIComponent(document.cookie)
	let ca = decodedCookie.split(';')
	for (let i=0 ; i < ca.length; i++) {
		let c = ca[i]
		while (c.charAt(0) == " ") {
			c = c.substring(1)
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length)
		}
	}
	return ""
}

function get_cookies() {
	// support
	try {
		if (runSE) {abc = def}
		dom.ctest0 = (navigator.cookieEnabled ? zE : zD)
	} catch(e) {
		dom.ctest0 = log_error("storage: cookie", e.name)
	}
	// file://
	if (isFile && isVer < 105) {
		dom.ctest1 = zNA
		dom.ctest2 = zNA
		return
	}
	// session
	try {
		if (runSE) {abc = def}
		let rndA = "sc_"+ rnd_string()
		let rndB = rnd_string()
		document.cookie = rndA +"="+ rndB +"; SameSite=Strict"
		let svalue = lookup_cookie(rndA)
		if (svalue != "") {
			if (logStorage) {
				console.log(" set:", rndA.padStart(18) +" -", rndB)
				console.log("read:", rndA.padStart(18) +" -", svalue)
			}
			if (svalue == rndB) {
				dom.ctest1 = zS
			} else {
				dom.ctest1 = zF +": values do not match"
			}
		} else {
			dom.ctest1 = zF
		}
	} catch(e) {
		dom.ctest1 = log_error("storage: session cookie", e.name)
	}
	// persistent
	try {
		if (runSE) {abc = def}
		let rndC = "pc_"+ rnd_string()
		let rndD = rnd_string()
		let d = new Date()
		d.setTime(d.getTime() + 86400000) // 1 day
		let expires = "expires="+ d.toUTCString()
		document.cookie = rndC +"="+ rndD +"; SameSite=Strict; "+ expires
		let pvalue = lookup_cookie(rndC)
		if (pvalue != "") {
			if (logStorage) {
				console.log(" set:", rndC.padStart(18) +" -", rndD)
				console.log("read:", rndC.padStart(18) +" -", pvalue)
			}
			if (pvalue == rndD) {
				dom.ctest2 = zS
			} else {
				dom.ctest2 = zF +": values do not match"
			}
		} else {
			dom.ctest2 = zF
		}
	} catch(e) {
		dom.ctest2 = log_error("storage: persistent cookie", e.name)
	}
}

function get_storage() {
	// LS support
	try {
		if (runSE) {abc = def}
		dom.lstest0 = (typeof(localStorage) == "undefined" ? zD +": "+ zU : zE)
	} catch(e) {
		dom.lstest0 = log_error("storage: localStorage", e.name)
	}
	// SS support
	try {
		if (runSE) {abc = def}
		dom.lstest2 = (typeof(sessionStorage) == "undefined" ? zD +": "+ zU : zE)
	} catch(e) {
		dom.lstest2 = log_error("storage: sessionStorage", e.name)
	}
	// file://
	if (isFile && isVer < 105) {
		dom.lstest1 = zNA
		dom.lstest3 = zNA
		return
	}
	// LS test
	try {
		if (runSE) {abc = def}
		let rndE = "pls_"+ rnd_string()
		let rndF = rnd_string()
		localStorage.setItem(rndE, rndF)
		let lsvalue = localStorage.getItem(rndE)
		if (lsvalue == null) {
			dom.lstest1 = zF
		} else {
			if (logStorage) {
				console.log(" set:", rndE.padStart(18) +" -", rndF)
				console.log("read:", rndE.padStart(18) +" -", lsvalue)
			}
			dom.lstest1 = lsvalue == rndF ? zS : zF +": values do not match"
		}
	} catch(e) {
		dom.lstest1 = log_error("storage: localStorage test", e.name)
	}

	// SS test
	try {
		if (runSE) {abc = def}
		let rndStrG = "sls_"+ rnd_string()
		let rndStrH = rnd_string()
		sessionStorage.setItem(rndStrG, rndStrH)
		let ssvalue = sessionStorage.getItem(rndStrG)
		if (ssvalue == null) {
			dom.lstest3 = zF
		} else {
			if (logStorage) {
				console.log(" set:", rndStrG.padStart(18) +" -", rndStrH)
				console.log("read:", rndStrG.padStart(18) +" -", ssvalue)
			}
			dom.lstest3 = ssvalue == rndStrH ? zS : zF +": values do not match"
		}
	} catch(e) {
		dom.lstest3 = log_error("storage: sessionStorage test", e.name)
	}
}

function get_idb() {
	// support
	try {
		if (runSE) {abc = def}
		dom.idb1 = !window.indexedDB ? zD : zE
	} catch(e) {
		dom.idb1 = log_error("storage: IDB", e.name)
	}
	// file://
	if (isFile && isVer < 105) {
		dom.idb2 = zNA
		return
	}
	// test
	try {
		if (runSE) {abc = def}
		let dbIDB = indexedDB.open("_testPBMode")
		dbIDB.onerror = function() {
			// pb mode
			dom.idb2 = zF +": onerror"
		}
		dbIDB.onsuccess = function() {
			let rndStrI = "idb_"+ rnd_string()
			// normal mode
			try {
				let openIDB = indexedDB.open(rndStrI)
				// create objectStore
				openIDB.onupgradeneeded = function(event){
					let dbObject = event.target.result
					let dbStore = dbObject.createObjectStore("testIDB", {keyPath: "id"})
				}
				// test
				openIDB.onsuccess = function(event) {
					let dbObject = event.target.result
					// start transaction
					let dbTx = dbObject.transaction("testIDB", "readwrite")
					let dbStore = dbTx.objectStore("testIDB")
					// add data
					let rndIndex = rnd_number()
					let rndValue = rnd_string()
					if (logStorage) {
						console.log(" set:", rndStrI.padStart(18) +" -", rndIndex, rndValue)
					}
					dbStore.put( {id: rndIndex, value: rndValue} )
					// query data
					let getStr = dbStore.get(rndIndex)
					getStr.onsuccess = function() {
						if (logStorage) {
							console.log("read:", rndStrI.padStart(18) +" -", getStr.result.id, getStr.result.value)
						}
						if (getStr.result.value == rndValue) {
							dom.idb2 = zS
						} else {
							dom.idb2 = zF +": values do not match"
						}
					}
					// close transaction
					dbTx.oncomplete = function() {dbObject.close()}
				}
			} catch(e) {
				dom.idb2 = zF +": "+ e.name
			}
		}
	} catch(e) {
		dom.idb2 = log_error("storage: IDB test", e.name)
	}
}

function get_workers() {
	// worker support
	if ("function" === typeof(Worker)) {
		dom.work1 = zE
		if (isFile) {
			// isFile
			dom.work2.innerHTML= zNA
			dom.work3.innerHTML= zNA
		} else {
			// web worker
			try {
				let wwt = new Worker("js/storage_workers.js")
				let rndStr1 = rnd_string()
				// assume fail
				dom.work2 = zF
				// add listener
				wwt.addEventListener("message", function(e) {
					if (logStorage) {console.log("data <- web worker: "+ e.data)}
					if ("TZP-"+ rndStr1 === e.data) {
						dom.work2 = zS
					}
					wwt.terminate
				}, false)
				wwt.postMessage(rndStr1)
			} catch(e) {
				dom.work2 = log_error("storage: web worker test", e.name)
			}
			// shared worker
			try {
				let swt = new SharedWorker("js/storage_shared_worker.js")
				let rndStr2 = rnd_string()
				// assume fail
				dom.work3 = zF
				// add listener
				swt.port.addEventListener("message", function(e) {
					if (logStorage) {console.log("data <- shared worker: "+ e.data)}
					if ("TZP-"+ rndStr2 === e.data) {
						dom.work3 = zS
					}
					swt.port.close()
				}, false)
				swt.port.start()
				swt.port.postMessage(rndStr2)
			} catch(e) {
				dom.work3 = log_error("storage: shared worker test", e.name)
			}
		}
	} else {
		// no worker
		dom.work1 = zD; dom.work2 = zNA; dom.work3 = zNA
	}
}

function get_service_workers() {
	let output = ""
	// support
	if (isSecure) {
		if (check_navKey("serviceWorker")) {
			try {
				// register
				navigator.serviceWorker.register("js/storage_service_worker.js").then(function(registration) {
					dom.swork2 = zS
					// cache support
					dom.swork3.innerHTML = note_ttc
					// cache test
					dom.swork4.innerHTML = note_ttc
					// notifications support
					dom.notif1.innerHTML = note_ttc
					// notifications test
					dom.notif2.innerHTML = note_ttc
					// unregister
					registration.unregister().then(function(boolean) {})
				},
				function(e) {
					// sw error
					if (e.name === "" || e.name === undefined) {
						output = zF +": unknown error"
					} else {
						output = zF +": "+ e.name
					}
					dom.swork2 = output
					dom.swork3 = zNA; dom.swork4 = zNA
					dom.notif1 = zNA; dom.notif2 = zNA
				})
			} catch(e) {
				dom.swork2 = log_error("storage: service worker test", e.name)
				dom.swork3 = zNA; dom.swork4 = zNA
				dom.notif1 = zNA; dom.notif2 = zNA
			}
		}	else {
			// no sw
			dom.swork2 = zNA; dom.swork3 = zNA; dom.swork4 = zNA
			dom.notif1 = zNA; dom.notif2 = zNA
		}
	}	else {
		// isFile
		output = zNA
		dom.swork2.innerHTML = output
		dom.swork3.innerHTML = output; dom.swork4.innerHTML = output
		dom.notif1.innerHTML = output; dom.notif2.innerHTML = output
	}
}

function get_permissions(item) {
	let userVis = "userVisibleOnly",
		str = item +":"
	let el = document.getElementById("p"+ item)
	return new Promise(resolve => {
		try {
			if (runSE) {abc = def}
			navigator.permissions.query({name:item}).then(function(result) {
				el.innerHTML = result.state
				return resolve(str + result.state)
			}).catch(error => {
				if ((error.message).includes(userVis)) {
					el.innerHTML = userVis
					str += userVis
				} else {
					el.innerHTML = error.type
					str += error.type
				}
				return resolve(str)
			})
		} catch(e) {
			log_error("storage: "+ item, e.name, e.message)
			el.innerHTML = zErr
			return resolve(str + zErr)
		}
	})
}

function get_storage_manager(runtype) {
	// support
	if (check_navKey("storage")) {
		dom.storageMSupport = zE
		if (isFile) {
			dom.storageMProp.innerHTML = zNA
			dom.storageMTest.innerHTML = zNA
		} else {
			// properties
			if (runtype == "click") {
				dom.storageMProp.innerHTML = "&nbsp"
				dom.storageMTest.innerHTML = "&nbsp"
				setTimeout(function() {
					try {
						navigator.storage.persist().then(function(persistent) {
							if (persistent) dom.storageMProp="persistent"
							else dom.storageMProp="not persistent"
							navigator.storage.estimate().then(estimate => {
								dom.storageMProp.textContent += ` (${estimate.usage} of ${estimate.quota} bytes)`
							})
						})
					} catch(e) {
						dom.storageMProp = zF +": "+ e.name
					}
					// ToDo: test
					dom.storageMTest.innerHTML = note_ttc
				}, 170)
			}
		}
	}
	else {
		// not-supported
		dom.storageMSupport = zD; dom.storageMProp = zNA; dom.storageMTest = zNA
	}
}

function outputStorage() {
	let t0; if (canPerf) {t0 = performance.now()}
	let	section = []
	// appcache
	let appCache = ("applicationCache" in window ? zE : zD)
	dom.appcache = appCache
	section.push("appCache:"+ appCache)
	// storageM
	let sm = (check_navKey("storage") ? zE : zD)
	section.push("storage_manager:"+ sm)
	// sw
	let sw = (check_navKey("serviceWorker") ? zE : zD)
	dom.swork1 = sw
	section.push("service_worker:"+ sw)

	Promise.all([
		get_permissions("notifications"),
		get_permissions("push"),
		get_permissions("persistent-storage")
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		log_section("storage", t0, section)
	})
}

countJS("storage")
