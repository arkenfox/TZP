'use strict';

// shared
var ports = []
onconnect = function(e) {
	let port = e.ports[0]
	ports.push(port)
	port.start()
	port.onmessage = function(e) {port.postMessage("TZP-"+e.data)}
}
