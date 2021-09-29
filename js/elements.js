'use strict';

function get_element_keys() {
	let sName = "elements_element_keys"
	clearDetail(sName)

  return new Promise(resolve => {
    try {
      // create element
      const id = 'html-element-version'
      const element = document.createElement('div')
      element.setAttribute('id', id)
      // append element to dom
      document.body.appendChild(element)
      // get rendered element
      const htmlElement = document.getElementById(id)
      // get property keys in element object
      const keys = []
      for (const key in htmlElement) {
        keys.push(key)
      }
			sDetail[sName] = keys
			let hash = sha1(keys.join())
			dom.elementkeys.innerHTML = hash + buildButton("15", sName, keys.length)
      return resolve("element_keys:"+ hash)
    } catch (error) {
			dom.elementkeys.innerHTML = zB0
      return resolve("element_keys:"+ zB0)
    }
  })
}

function outputElements() {
	let t0 = performance.now()
	let section = []
	Promise.all([
		get_element_keys()
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		log_section("elements", t0, section)
	})
}

countJS("elements")
