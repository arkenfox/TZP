'use strict';

addEventListener('message', function(e) {
	let list = ['appCodeName','appName','appVersion','platform','product','userAgent']
	let data = {}, r
	list.forEach(function(p) {
		try {
			r = navigator[p]
			if ('string' !== typeof r) {throw 'error'}
			if ('' == r) {r = 'empty string'}
		} catch(e) {
			r = e
		}
		data[p] = r
	})
	let channel = new BroadcastChannel('sw-ua')
	channel.postMessage({msg: data})
}, false)
