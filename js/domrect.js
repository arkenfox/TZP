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
	function createTest(method, runtype, runarray, callback){
		const properties = ["x","y","width","height","top","left","right","bottom"]
		function performTest(runtype){
			const rects = getElements().map(callback)
			const data = new Float64Array(rects.length * properties.length)
			rects.forEach(function(rect, i){
				properties.forEach(function(property, j){
					data[i * properties.length + j] = rect[property]
					// 1st and last runs grab values to compare: 
					// select rect: "top","left","right","bottom"
					if (runtype == 0 || runtype == 2) {
						if (i == 3 && j > 3) {
							compare.push(method+":"+ j +":"+ runtype +":"+ rect[property])
						}
					}
				})
			})
			// run0 details
			if (runtype == 0) {
				let item=0
				properties.map(function(property){
					return rects.map(function(rect, i){
						item++
						document.getElementById(method+item).textContent = rect[property]
						return rect[property]
					}).join("")
				}).join("")
			}
			// hashes
			if (runtype < 2) {
				crypto.subtle.digest("SHA-256", data).then(function(hash){
					let tmp = byteArrayToHex(hash)
					runarray.push(method+":"+tmp)
					if (runtype == 0) {
						document.getElementById(method).innerHTML = tmp
					}
				})
			}
		}
		performTest(runtype)
	}

	// run
	function run(runtype, runarray) {
		try {
			createTest("dr1", runtype, runarray, function(element){return element.getClientRects()[0]})
		} catch(e) {
			runarray.push("dr1:blocked")
			if (runtype == 0) {dom.dr1.innerHTML = zB}
		}
		try {
			createTest("dr2", runtype, runarray, function(element){return element.getBoundingClientRect()})
		} catch(e) {
			runarray.push("dr2:blocked")
			if (runtype == 0) {dom.dr2.innerHTML = zB}
		}
		try {
			createTest("dr3", runtype, runarray, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getClientRects()[0]
			})
		} catch(e) {
			runarray.push("dr3:blocked")
			if (runtype == 0) {dom.dr3.innerHTML = zB}
		}
		try {
			createTest("dr4", runtype, runarray, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getBoundingClientRect()
			})
		} catch(e) {
			runarray.push("dr4:blocked")
			if (runtype == 0) {dom.dr4.innerHTML = zB}
		}
	}

	let t0 = performance.now()
	let run0 = [], run1 = [], run2 = [], compare = []

	// reset div
	dom.divrect.classList.add("divrect1");
	dom.divrect.classList.remove("divrect2");
	run(0, run0)
	run(1, run1)

	// move div
	dom.divrect.classList.add("divrect2");
	dom.divrect.classList.remove("divrect1");
	run(2, run2)

	setTimeout(function(){
		// debugging
		run0.sort()
		run1.sort()
		console.log("run0\n - " + run0.join("\n - "))
		console.log("run1\n - " + run1.join("\n - "))

		// compare
		compare.sort()
		let analysis = [], prev_item = "", prev_value, random = []
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
			console.log("DOMRect analysis [item, diff, diff from 0.25, 1st measurement, 2nd measurement]\n - " + analysis.join("\n - "))
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
