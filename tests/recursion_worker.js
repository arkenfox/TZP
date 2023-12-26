'use strict';

addEventListener("message", function(e) {
	let data = {
	}
	try {
		let level = 0
		function recurse() {level++; recurse()}
		try {
			recurse()
		} catch(e) {
			data["worker1"] = level
			data["worker2"] = e.stack.toString().length
		}
		level = 0
		try {
			recurse()
		} catch(e) {
			data["worker3"] = level
			data["worker4"] = e.stack.toString().length
			self.postMessage(data)
		}
	} catch(e) {
		console.error(e)
		data["worker1"] = e.name
		self.postMessage(data)
	}
}, false)
