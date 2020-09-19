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

	// analyze and output
	function analyze() {
		// also add an overall hash: i.e hash / random / tampered / blocked
		// each of the four tests can be
			//     hash: hash
			//   random: random [1] hash1.. [2] hash2..
			// tampered: noise detected [both] hash..
			//  blocked: or error name

		// debug
		//results.sort()
		//console.log("domrect timeout results: " + (performance.now()-t0) + "ms\n - " + results.join("\n - "))
		
		// cleanup details
		if (stateDR == true) {showhide("table-row","D","&#9650; hide")}
		// perf
		debug_page("perf","domrect",t0,gt0)
	}

	function getElements(){
		return Array.from(document.querySelectorAll(".testRect"))
	}
	function createTest(method, runtype, callback){
		const properties = ["x","y","width","height","top","left","right","bottom"]
		function performTest(runtype){
			try {
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
				// store hashes
				crypto.subtle.digest("SHA-256", data).then(function(hash){
					let tmp = byteArrayToHex(hash)
					results.push(runtype+":"+method+":"+tmp)
					// temp output to be replaced in analyze()
					if (runtype == 0) {	document.getElementById(method).innerHTML = tmp	}
				})
			} catch(e) {
				results.push(runtype+":"+method+":"+e.name)
				// temp output to be replaced in analyze()
				if (runtype == 0) {	document.getElementById(method).innerHTML = e.name }
			}
		}
		performTest(runtype)
	}

	// run
	function run(runtype) {
		return new Promise(function(resolve, reject) {
			//div position
			if (runtype == 0) {
				// reset div
				dom.divrect.classList.add("divrect1");
				dom.divrect.classList.remove("divrect2");
			} else if (runtype == 2) {
				// move div
				dom.divrect.classList.add("divrect2");
				dom.divrect.classList.remove("divrect1");
			}
			// tests
			createTest("dr1", runtype, function(element){return element.getClientRects()[0]})
			createTest("dr2", runtype, function(element){return element.getBoundingClientRect()})
			createTest("dr3", runtype, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getClientRects()[0]
			})
			createTest("dr4", runtype, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getBoundingClientRect()
			})
			resolve()
		})
	}

	let t0 = performance.now()
	let results = [], compare = []

	Promise.all([
		run(0),
		run(1),
		run(2)
	]).then(function(){
		// debugging
		//results.sort()
		//console.log("domrect promise results: "
		//	+ (performance.now()-t0) + "ms\n - " + results.join("\n - "))
	})

	setTimeout(function(){
		analyze()
	}, 100)

}

outputDomRect()
