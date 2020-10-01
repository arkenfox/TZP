'use strict';

addEventListener("message", function(e) {
	let list = ['userAgent','appCodeName','appName','product','appVersion','platform'],
		res = [],
		zB1 = "script blocked [a]",
		zB2 = "script blocked [b]",
		zB3 = "script blocked [c]",
		r = ""
	// e.data = isFF
	for(let i=0; i < list.length; i++) {
		try {r = navigator[list[i]]} catch(e) {r = (e.name == "ReferenceError" ? zB1 : zB2)}
		if (r == zU) {r = "\"undefined\""}
		if (r == "") {r = "undefined"}
		if (r == undefined && e.data) {r = zB3}
		res.push((i).toString().padStart(2,"0")+": "+r)
	}
	self.postMessage(res)
}, false)
