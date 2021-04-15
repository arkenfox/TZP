"use strict";

/* code based on https://canvasblocker.kkapsner.de/test/ */

function reset_domrect() {
	for (let i=0; i < 4; i++) {
		for (let j=1; j < 49; j++) {
			document.getElementById("dr"+ i + j).innerHTML = "&nbsp"
		}
	}
}

function outputDomRect() {
	let t0 = performance.now()
	let sColor = s8

	// analyze & output
	function analyze() {
		// debug
		//run0.sort(); run1.sort(); console.log("domrect\n - "+ run0.join("\n - ") +"\n - "+ run1.join("\n - "))

		let knownHash = "bebfc291e9d1adc90e240790551d0305b8b91294"
		let pretty = ["Element.getClientRects","Element.getBoundingClientRect","Range.getClientRects","Range.getBoundingClientRect"]
		let hash = []

		for (let i=0; i < 4; i++) {
			// repurpose known arrays as lie booleans
			if (isFF) {
				// FF: rect6
				// note: errors/undefined override these when we check value1
				known["dr"+ i] = (sha1( known["dr"+ i].join()) == knownHash ? false : true)
				//if (known["dr"+ i] == true) {console.debug("lie: known values: "+ pretty[i])}
			} else {
				// non-FF
				known["dr"+ i] = false
			}

			let value1 = run0[i].split(":")[2],
				value2 = run1[i].split(":")[2]
			let push = value1
			let display = value1

			// simulate random
			//if (i == 1) {value1 = "0c4cf7ff544ab66"; value2 = "ec46b57d8a484a"}
			//if (i == 3) {value1 = "0c4cf7ff544ab66"; value2 = "ec46b57d8a484a"}

			if (value1 == "tzp") {
				// errors: starts with "tzp:": don't record lie
				known["dr"+ i] = false
				value1 = run0[i].split(":")[3]
				if (value1 == "") {value1 = "error"}
				if (value1 == undefined) {value1 = "undefined"}
				push = value1
				display = value1
			} else if (value1 !== value2) {
				// random each pass: record lie
				known["dr"+ i] = true
				//console.debug("lie: random each pass: "+ pretty[i])
				push = "random"
				display = sColor +"[1] "+ sc + value1.substring(0,13) +".. "
					+ sColor +"[2] "+ sc + value2.substring(0,14) +".."
					+ sColor + note_random
			} else {
				// same value on two passes
				// check for noise
				if (isFF || isEngine == "blink") {
					let compare = chk["dr"+ i]
					if (compare.length > 0) {
						compare.sort()
						//console.log(compare.join("\n"))
						let diffs = [], prev_item = "", prev_value = ""
						compare.forEach(function(item) {
							let delim = item.split(":")
							if (prev_item == delim[0] +"_"+ delim[1]) {
								let diff = (delim[3]-prev_value)
								if (diff !== 0.25) {
									// record lie
									known["dr"+ i] = true
									//if (known["dr"+ i] == true) {console.debug("lie: shift: "+ pretty[i])}
								}
								let margin = (0.25 - diff)
								diffs.push(prev_item +", "+ diff +", "+ margin +", "+ prev_value +", "+ delim[3])
							}
							prev_item = delim[0] +"_"+ delim[1]
							prev_value = delim[3]
						})
						if (known["dr"+ i] == true) {
							//console.log("DOMRect method dr"+ i +" [item, diff, diff from 0.25, 1st measurement, shifted measurement]\n", diffs)
							push = "noise"
							display = value1 + sColor + note_noise
						}
					}
				}
			}
			// lies
			if (gRun) {
				if (known["dr"+ i] == true) {gLiesKnown.push("domrect:"+ pretty[i])}
			}
			// only push real values
			if (push.length == 40) {hash.push("domrect:"+push)}
			document.getElementById("dr"+ i).innerHTML = display
		}
		// cleanup details
		if (stateDR == true) {showhide("table-row","D","&#9650; hide")}
		// section
		if (hash.length) {
			//de-dupe/sanity check
			hash = hash.filter(function(item, position) {return hash.indexOf(item) === position})
			if (hash.length > 1) {
				console.error("domrect: mismatched good hashes")
				hash = ["domrect:unknown"]
			}
		} else {
			hash = ["domrect:fake"]
		}
		// lies bypassed
		if (gRun) {
			let sumBS = known["dr0"] + known["dr1"] + known["dr2"] + known["dr3"]
			if (sumBS > 0 && sumBS < 4) {
				for (let i=0; i < 4; i++) {
					let trueValue = hash[0].split(":")[1]
					if (known["dr"+i] == true && trueValue !== "unknown") {
						gLiesBypassed.push("domrect:"+ pretty[i] +":" + trueValue)
					}
				}
			}
		}
		log_section("domrect", t0, hash) // any real values should be the same
	}

	function getElements(classname){
		return Array.from(document.querySelectorAll(classname))
	}
	function createTest(method, runtype, runarray, callback){
		const properties = ["x","y","width","height","top","left","right","bottom"]
		function performTest(runtype){
			try {
				let classname = ".testRect"
				if (runtype == 3) {classname = ".knownRect"}
				const rects = getElements(classname).map(callback)
				const data = new Float64Array(rects.length * properties.length)
				rects.forEach(function(rect, i){
					properties.forEach(function(property, j){
						data[i * properties.length + j] = rect[property]
						if (runtype == 3) {
							// known
							let str = properties[j] +":"+ rect[property]
							known[method].push(str)
						} else {
							// diffs on runs: only collect 2 runs: 0 (first) + 2 (shift)
							if (runtype !== 1) {
								// what is i (0 to 5) ? the element rect number: rect3 = option/select
								let go = false
								// everything except width/height
								if (j !== 2 && j !== 3) {go = true}
								// blink false positives: rect3 <option> left/right/x
								if (isEngine == "blink" && i == 3) {
									if (j == 5 || j == 6 || j == 0) {go = false}
								}
								if (go) {
									let str = properties[j] +":rect"+ i +":run"+ runtype +":"+ rect[property]
									chk[method].push(str)
								}
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
							try { // don't display rect6
								document.getElementById(method + item).textContent = rect[property]
							} catch(e) {}
							return rect[property]
						}).join("")
					}).join("")
				}
				// store hashes on first two runs
				if (runtype < 2) {
					runarray.push(runtype +":"+ method +":"+ sha1(data.join()))
				}
			} catch(e) {
				runarray.push(runtype +":"+ method +":tzp:"+ e.name)
			}
		}
		performTest(runtype)
	}

	// run
	function run(runtype, runarray) {
		return new Promise(function(resolve, reject) {
			// div
			if (runtype == 0) {
				// reset
				dom.divrect.classList.add("divrect1");
				dom.divrect.classList.remove("divrect2");
			} else if (runtype == 2) {
				// shift
				dom.divrect.classList.add("divrect2");
				dom.divrect.classList.remove("divrect1");
			}
			// test
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

	let run0 = [], run1 = [], run2 = [], run3 = []
	let chk = {dr0: [], dr1: [], dr2: [], dr3: []}
	let known = {dr0: [], dr1: [], dr2: [], dr3: []}

	Promise.all([
		run(0, run0),
		run(1, run1),
		run(2, run2), // shift
		run(3, run3) // knownRect
	]).then(function(){
		analyze()
	})
}

countJS("domrect")
