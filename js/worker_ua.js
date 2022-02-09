'use strict';

addEventListener("message", function(e) {
	let list = ['userAgent','appCodeName','appName','product','appVersion','platform'],
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
	for(let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = "blocked"}
		r = cleanFn(r)
		res.push(list[i] +":"+ r) // no spaces
	}
	res.sort() // always sort
	self.postMessage(res)
}, false)
