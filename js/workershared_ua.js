'use strict';

var ports = []
onconnect = function(e) {
	let port = e.ports[0]
	ports.push(port)
	port.start()
	port.onmessage = function(e) {
		let list = ['appCodeName','appName','appVersion','platform','product','userAgent'],
			res = [],
			r = "",
			zU = "undefined",
			zUQ = "\"undefined\""
		function cleanFn(item, skipArray = false) {
			if (typeof item == "number" || typeof item == "bigint") { return item
			} else if (item == zU) {item = zUQ
			} else if (item == "true") {item = "\"true\""
			} else if (item == "false") {item = "\"false\""
			} else if (item == "null") {item = "\"null\""
			} else if (!skipArray && Array.isArray(item)) {
				item = !item.length ? "empty array" : "array"
			} else if (item === undefined || item === true || item === false || item === null) {item += ""
			} else if (item == "") {item = "empty string"
			} else if (typeof item == "string") {
				if (!isNaN(item*1)) {item = "\"" + item + "\""}
			}
			return item
		}
		for (let i=0; i < list.length; i++) {
			try {r = navigator[list[i]]} catch(e) {r = "error"}
			r = cleanFn(r)
			res.push(list[i] +":"+ r) // no spaces
		}
		port.postMessage(res)
	}
}
