'use strict';

var ports = []
onconnect = function(e) {
	let port = e.ports[0]
	ports.push(port)
	port.start()
	port.onmessage = function(e) {
		let list = ['userAgent','appCodeName','appName','product','appVersion','platform'],
			res = [],
			zB1 = "script blocked [a]",
			zB2 = "script blocked [b]",
			r =""
		// e.data = isFF
		for(let i=0; i < list.length; i++) {
			try {r = navigator[list[i]]} catch(e) {r = (e.name == "ReferenceError" ? zB1 : zB2)}
			if (r == "") {r = "empty string"}
			if (r == "undefined") {r = "undefined string"}
			if (r == undefined) {r = "undefined value"}
			res.push((i).toString().padStart(2,"0")+": "+r)
		}
		port.postMessage(res)
	}
}
