'use strict';

var ports = []
onconnect = function(e) {
	let port = e.ports[0]
	ports.push(port)
	port.start()
	port.onmessage = function(e) {
		let list = ['appCodeName','appName','appVersion','platform','product','userAgent']
		let data = {}, r
		list.forEach(function(p) {
			try {
				r = navigator[p]
				if ('string' !== typeof r) {throw "error"}
				if ('' == r) {r = 'empty string'}
			} catch(e) {
				r = e
			}
			data[p] = r
		})
		port.postMessage(data)
	}
}
