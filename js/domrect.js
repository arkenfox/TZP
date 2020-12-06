"use strict";

/* code based on work by kkapsner and canvasblocker
	 https://canvasblocker.kkapsner.de/test/
	 https://github.com/kkapsner/CanvasBlocker */

function reset_domrect() {
	for (let i=0; i < 4; i++) {
		for (let j=1; j < 49; j++) {
			document.getElementById("dr"+i+j).innerHTML = "&nbsp"
		}
	}
}

function outputDomRect() {
	let sColor = s8

	// analyze and output
	function analyze() {
		// debug
		//run0.sort(); run1.sort(); console.log("domrect\n - " + run0.join("\n - ") + "\n - " + run1.join("\n - "))

		let hash = []
		for (let i=0; i < 4; i++) {
			let value1 = run0[i].split(":")[2],
				value2 = run1[i].split(":")[2]
			let push = value1
			let display = value1

			// simulate random
			//if (i == 0 || i == 2) {value1 = "0c4cf7ff544ab66"; value2 = "ec46b57d8a484a"}

			if (value1 == "tzp") {
				// error
				value1 = run0[i].split(":")[3]
				if (value1 == "") {value1 = "error"}
				if (value1 == undefined) {value1 = "undefined"}
				push = value1
				display = value1
			} else if (value1 !== value2) {
				// random on each pass
				push = "random"
				display = sColor +"[1] "+sc + value1.substring(0,13) + ".. "
					+ sColor +"[2] "+sc + value2.substring(0,14) + ".."
					+ sColor + note_random
			} else {
				// same value
				// check for noise
				if (isFF || isEngine == "blink") {
					let compare = chk["dr"+i]
					if (compare.length > 0) {
						compare.sort()
						//console.log(compare.join("\n"))
						let diffs = [], prev_item = "", prev_value = ""
						compare.forEach(function(item) {
							let delim = item.split(":")
							if (prev_item == delim[0] + delim[1]) {
								let diff = (delim[3]-prev_value)
								if (diff !== 0.25) {
									let margin = (0.25 - diff)
									diffs.push(prev_item +", "+ diff +", "+ margin +", "+ prev_value + ", "+ delim[3])
								}
							}
							prev_item = delim[0] + delim[1]
							prev_value = delim[3]
						})
						if (diffs.length > 0) {
							//console.log("DOMRect diffs [item, diff, diff from 0.25, 1st measurement, 2nd measurement]\n - " + diffs.join("\n - "))
							push = "tampered"
							display = value1 + sColor + note_noise
						}
					}
				}
			}
			// push & display
			hash.push("dr"+i+":"+push)
			document.getElementById("dr"+i).innerHTML = display
		}
		// cleanup details
		if (stateDR == true) {showhide("table-row","D","&#9650; hide")}
		// section
		section_info("domrect", t0, hash)
	}

	function getElements(){
		return Array.from(document.querySelectorAll(".testRect"))
	}
	function createTest(method, runtype, runarray, callback){
		const properties = ["x","y","width","height","top","left","right","bottom"]
		function performTest(runtype){
			try {
				const rects = getElements().map(callback)
				const data = new Float64Array(rects.length * properties.length)
				rects.forEach(function(rect, i){
					properties.forEach(function(property, j){
						data[i * properties.length + j] = rect[property]
						// diffs on runs
						if (runtype !== 1 && i == 3) {
							if (j == 4 || j == 7) {
								// we could also use 5+6 in FF
								let str = method+":"+j +":"+ runtype +":"+ rect[property]
								chk[method].push(str)
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
				// store hashes on first two runs
				if (runtype < 2) {
					runarray.push(runtype+":"+method+":"+sha1(data.join()))
				}
			} catch(e) {
				runarray.push(runtype+":"+method+":tzp:"+e.name)
			}
		}
		performTest(runtype)
	}

	// run
	function run(runtype, runarray) {
		return new Promise(function(resolve, reject) {
			//div position
			if (runtype == 0) {
				// reset
				dom.divrect.classList.add("divrect1");
				dom.divrect.classList.remove("divrect2");
			} else if (runtype == 2) {
				// shift
				dom.divrect.classList.add("divrect2");
				dom.divrect.classList.remove("divrect1");
			}
			// tests
			createTest("dr0", runtype, runarray, function(element){return element.getClientRects()[0]})
			createTest("dr1", runtype, runarray, function(element){return element.getBoundingClientRect()})
			createTest("dr2", runtype, runarray, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getClientRects()[0]
			})
			createTest("dr3", runtype, runarray, function(element){
				let range = document.createRange()
				range.selectNode(element)
				return range.getBoundingClientRect()
			})
			resolve()
		})
	}

	let t0 = performance.now()
	let run0 = [], run1 = [], run2 = []
	let chk = {dr0: [ ], dr1: [ ], dr2: [ ], dr3: [ ]}

	Promise.all([
		run(0, run0),
		run(1, run1),
		run(2, run2)
	]).then(function(){
		analyze()
	})

}

setTimeout(function() {outputDomRect()}, 1)
