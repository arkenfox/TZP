'use strict';

var ports = []
onconnect = function(e) {
	let port = e.ports[0]
	ports.push(port)
	port.start()
	port.onmessage = function(e) {
		let list = ['userAgent','appCodeName','appName','product','appVersion','platform'],
			res = [],
			r = ""
		let isFF = e.data
		for(let i=0; i < list.length; i++) {
			try {r = navigator[list[i]]} catch(e) {r = "blocked"}
			if (r == "") {r = "empty string"}
			if (r == "undefined") {r = "undefined string"}
			if (r == undefined && isFF) {r = "blocked"}
			if (r == undefined) {r = "undefined value"}
			res.push(list[i]+":"+r) // no spaces
		}
		res.sort() // always sort
		port.postMessage(res)
	}
}
