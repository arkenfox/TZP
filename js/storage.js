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
	let ctest0 = zB
	try {ctest0 = navigator.cookieEnabled} catch(e) {}
	dom.ctest0.innerHTML = (ctest0 == zB ? zB : (ctest0 ? zE : zD))
	// session
	let rndA = rnd_string("sc_")
	let rndB = rnd_string("")
	document.cookie = rndA + "=" + rndB
	let svalue = lookup_cookie(rndA)
	if (svalue != "") {
		if (logStorage) {
			console.log(" set:", rndA.padStart(18) + " -", rndB)
			console.log("read:", rndA.padStart(18) + " -", svalue)
		}
		if (svalue == rndB) {
			dom.ctest1 = zS
		} else {
			dom.ctest1 = zF+": values do not match"
		}
	} else {
		dom.ctest1 = zF
	}
	// persistent
	let rndC = rnd_string("pc_")
	let rndD = rnd_string("")
	let d = new Date()
	d.setTime(d.getTime() + 86400000) // 1 day
	let expires = "expires="+ d.toUTCString()
	document.cookie = rndC + "=" + rndD + ";" + expires
	let pvalue = lookup_cookie(rndC)
	if (pvalue != "") {
		if (logStorage) {
			console.log(" set:", rndC.padStart(18) + " -", rndD)
			console.log("read:", rndC.padStart(18) + " -", pvalue)
		}
		if (pvalue == rndD) {
			dom.ctest2 = zS
		} else {
			dom.ctest2 = zF+": values do not match"
		}
	} else {
		dom.ctest2 = zF
	}
}

function get_storage() {
	// LS support
	try {
		if (typeof(localStorage) == "undefined") {
			dom.lstest0 = zD+": "+zU			
		}	else {
			dom.lstest0 = zE
		}
	} catch(e) {
		dom.lstest0 = zD+": "+ e.name
	}
	// LS test
	try {
		let rndE = rnd_string("pls_")
		let rndF = rnd_string("")
		localStorage.setItem(rndE, rndF)
		let lsvalue = localStorage.getItem(rndE)
		if (lsvalue == null) {
			dom.lstest1 = zF
		} else {
			if (logStorage) {
				console.log(" set:", rndE.padStart(18) + " -", rndF)
				console.log("read:", rndE.padStart(18) + " -", lsvalue)
			}			
			if (lsvalue == rndF) {
				dom.lstest1 = zS
			} else {
				dom.lstest1 = zF+": values do not match"
			}
		}
	} catch(e) {
		dom.lstest1 = zF+": " + e.name
	}
	// SS support
	try {
		if (typeof(sessionStorage) == "undefined") {
			dom.lstest2 = zD+": "+zU
		} else {
			dom.lstest2 = zE
		}
	} catch(e) {
		dom.lstest2 = zD+": "+ e.name
	}
	// SS test
	try {
		let rndStrG = rnd_string("sls_")
		let rndStrH = rnd_string("")
		sessionStorage.setItem(rndStrG, rndStrH)
		let ssvalue = sessionStorage.getItem(rndStrG)
		if (ssvalue == null) {
			dom.lstest3 = zF
		} else {
			if (logStorage) {
				console.log(" set:", rndStrG.padStart(18) + " -", rndStrH)
				console.log("read:", rndStrG.padStart(18) + " -", ssvalue)
			}			
			if (ssvalue == rndStrH) {
				dom.lstest3 = zS
			} else {
				dom.lstest3 = zF+": values do not match"
			}
		}
	} catch(e) {
		dom.lstest3 = zF+": " + e.name
	}
}

function get_idb() {
	// support
	try {
		if (!window.indexedDB) {
			dom.idb1 = zD
		} else {
			dom.idb1 = zE
		}
	} catch(e) {
		dom.idb1 = zD+": " + e.name
	}
	// test
	try {
		let dbIDB = indexedDB.open("_testPBMode")
		dbIDB.onerror = function() {
			// pb mode
			dom.idb2 = zF+": onerror"
		}
		dbIDB.onsuccess = function() {
			let rndStrI = rnd_string("idb_")
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
					let rndValue = rnd_string("")
					if (logStorage) {
						console.log(" set:", rndStrI.padStart(18) + " -", rndIndex, rndValue)
					}
					dbStore.put( {id: rndIndex, value: rndValue} )
					// query data
					let getStr = dbStore.get(rndIndex)
					getStr.onsuccess = function() {
						if (logStorage) {
							console.log("read:", rndStrI.padStart(18) + " -", getStr.result.id, getStr.result.value)
						}
						if (getStr.result.value == rndValue) {
							dom.idb2 = zS
						} else {
							dom.idb2 = zF+": values do not match"
						}
					}
					// close transaction
					dbTx.oncomplete = function() {dbObject.close()}
				}
			} catch(e) {
				dom.idb2 = zF+": " + e.name
			}
		}
	} catch(e) {
		// blocking cookies or something
		dom.idb2 = zF+" .open: " + e.name
	}
}

function get_workers() {

	// worker support
	if (typeof(Worker) !== "undefined") {
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
					if (logStorage) {console.log("data <- web worker: "+e.data)}
					if ("TZP-" + rndStr1 === e.data) {
						dom.work2 = zS
					}
					wwt.terminate
				}, false)
				wwt.postMessage(rndStr1)
			} catch(e) {
				dom.work2 = zF+": " + e.name
			}
			// shared worker
			try {
				let swt = new SharedWorker("js/storage_shared_worker.js")
				let rndStr2 = rnd_string()
				// assume fail
				dom.work3 = zF
				// add listener
				swt.port.addEventListener("message", function(e) {
					if (logStorage) {console.log("data <- shared worker: "+e.data)}
					if ("TZP-" + rndStr2 === e.data) {
						dom.work3 = zS
					}
					swt.port.close()
				}, false)
				swt.port.start()
				swt.port.postMessage(rndStr2)
			} catch(e) {
				dom.work3 = zF+": " + e.name
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
		if ("serviceWorker" in navigator) {
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
				if (e.name ==="") {
					output = zF+": unknown error"
				} else {
					output = zF+": "+ e.name
				}
				dom.swork2 = output
				dom.swork3 = zNA; dom.swork4 = zNA
				dom.notif1 = zNA; dom.notif2 = zNA
			})
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
		str = item + ":"
	let el = document.getElementById("p"+item)
	return new Promise(resolve => {
		try {
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
			el.innerHTML = zB0
			return resolve(str + zB0)
		}
	})
}

function get_storage_manager(runtype) {
	// support
	if ("storage" in navigator) {
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
						dom.storageMProp = zF+": " + e.name
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
	let t0 = performance.now(),
		section = []
	// functions
	get_cookies()
	get_storage()
	get_idb()
	get_workers()
	get_service_workers()
	get_storage_manager()

	// section hash
	// there's almost nothing stable about this section
		// appcache
	let appCache = ("applicationCache" in window ? zE : zD)
	section.push("appCache:" + appCache)
	dom.appcache = appCache
		// storageM
	let storage = ("storage" in navigator ? zE : zD)
	section.push("storage_manager:" + storage)
		// sw
	let sw = zD
	if ("serviceWorker" in navigator) {sw = zE}
	dom.swork1 = sw
	section.push("service_worker:" + sw)

	Promise.all([
		get_permissions("notifications"),
		get_permissions("push"),
		get_permissions("persistent-storage")
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		section_info("storage", t0, gt0, section)
	})

}

outputStorage()
