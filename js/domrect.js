"use strict";

/* code based on work by kkapsner and canvasblocker
	 https://canvasblocker.kkapsner.de/test/
	 https://github.com/kkapsner/CanvasBlocker */

function reset_domrect() {
	for (let i=1; i < 5; i++) {
		document.getElementById("dr"+i).innerHTML = "&nbsp"
		for (let j=1; j < 49; j++) {
			document.getElementById("dr"+i+j).innerHTML = "&nbsp"
		}
	}
}

function outputDomRect() {
	function getElements(){
		return Array.from(document.querySelectorAll(".testRect"))
	}
	function createTest(method, runtype, callback){
		const properties = ["x","y","width","height","top","left","right","bottom"]
		function performTest(runtype){
			const rects = getElements().map(callback)
			const data = new Float64Array(rects.length * properties.length)
				rects.forEach(function(rect, i){
					properties.forEach(function(property, j){
						// select rect: "top","left","right","bottom"
						if (i == 3 && j > 3) {
							compare.push(method+":"+ j +":"+ runtype +":"+ rect[property])
						}
						data[i * properties.length + j] = rect[property]
					})
				})
				// hash
				if (runtype == 1) {
					crypto.subtle.digest("SHA-256", data).then(function(hash){
						document.getElementById(method).innerHTML = byteArrayToHex(hash)
					})
				}
				// results
				let item=0
				properties.map(function(property){
					return rects.map(function(rect, i){
						item++
						if (runtype == 1) {
							document.getElementById(method+item).textContent = rect[property]
						}
						return rect[property]
					}).join("")
				}).join("")
		}
		performTest(runtype)
	}

	let t0 = performance.now()
	let compare = [], analysis = []

	// run
	function run(runtype) {
		try {
			createTest("dr1", runtype, function(element){return element.getClientRects()[0]})
		} catch(e) {if (runtype == 1) {dom.dr1.innerHTML = zB}}
		try {
			createTest("dr2", runtype, function(element){return element.getBoundingClientRect()})
		} catch(e) {if (runtype == 2) {dom.dr2.innerHTML = zB}}
		try {
			createTest("dr3", runtype, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getClientRects()[0]
			})
		} catch(e) {if (runtype == 1) {dom.dr3.innerHTML = zB}}
		try {
			createTest("dr4", runtype, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getBoundingClientRect()
			})
		} catch(e) {if (runtype == 1) {dom.dr4.innerHTML = zB}}
	}

	// reset div
	dom.divrect.classList.add("divrect1");
	dom.divrect.classList.remove("divrect2");
	run(1)

	// move div
	dom.divrect.classList.add("divrect2");
	dom.divrect.classList.remove("divrect1");
	run(2)

	setTimeout(function(){
		// compare
		compare.sort()
		let prev_item = "", prev_value, random = []
		compare.forEach(function(item) {
			let delim = item.split(":")
				if (prev_item == delim[0] + delim[1]) {
				let diff = (delim[3]-prev_value)
				if (diff !== 0.25) {
					random.push(delim[0])
					let margin = (0.25 - diff)
					analysis.push(prev_item +", "+ diff +", "+ margin +", "+ prev_value + ", "+ delim[3])
				}
			}
			prev_item = delim[0] + delim[1]
			prev_value = delim[3]
		})
		if (analysis.length > 0) {
			console.log("DOMRect analysis [item, diff, diff from 0.25, 1st measurement, 2nd measurement]", analysis)
		}
		random = random.filter(function(item, position) {return random.indexOf(item) === position})
		if (isFF) {
			random.forEach(function(item) {
				document.getElementById(item).innerHTML = document.getElementById(item).textContent + s8 + note_random
			})
		}
	}, 100)

	// cleanup details
	setTimeout(function(){
		if (stateDR == true) {showhide("table-row","D","&#9650; hide")}
	}, 50)
	// perf
	debug_page("perf","domrect",t0,gt0)
}

outputDomRect()
