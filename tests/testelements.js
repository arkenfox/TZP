'use strict';

// note: some elements we insert a char "." to a) force a height
	// or b) for unique measurements without a char to get more precision/decimal places
	// always use the same char
let eFiller = '.'

let isMethod = 0
let elementMethods = {
	0: 'element.getBoundingClientRect()',
	1: 'element.getClientRects()[0]',
	2: 'range.getBoundingClientRect() ',
	3: 'range.getClientRects()[0]',
}
let strMethod = elementMethods[isMethod]

let oElementForms = {}, oElementFormsTZP = {}
let aElementFormsIgnore = ['input|hidden','selectedcontent']

let oElementKeys = {}, aElementKeysIfSupported = []

let oElementOther = {}, oElementOtherTZP = {}, aElementOtherIgnore = []

let oIsSupported = {
	fencedframe: 'HTMLFencedFrameElement' in window,
	geolocation: 'HTMLGeolocationElement' in window,
	install: 'HTMLInstallElement' in window,
	selectedcontent: 'HTMLSelectedContentElement' in window,
	usermedia: 'HTMLUserMediaElement' in window,
	// camera: false,
	// microphone: false,
}


function buildnav_element() {
	// add prev/next nav links in all the element tests so it's easy to loop thru them

	// filenames: in order as per listed, not necessarily alphabetical
	let aTests = ['elementcoverage','elementfont','elementforms','elementkeys','elementlang','elementmath','elementother']
	aTests.sort()
	// get filename
	let loc = location +''
	let file = loc.slice(loc.lastIndexOf('/') + 1, loc.length - 5)
	// index
	let current = aTests.indexOf(file), previous, next, max = (aTests.length - 1)
	if (current == 0) {previous = max} else {previous = current - 1}
	if (current == max) {next = 0} else {next = current + 1}
	// keys/filenames
	previous = aTests[previous]
	next = aTests[next]
	// pretty names
	let pName = 'elements: ' + previous.slice(7)
	let nName = 'elements: ' + next.slice(7)

	try {
		// handle undefined: i.e I forgot to add it to a/oTests
		if (undefined !== pName) {
			dom.navprev.innerHTML = '<a class="return" href="'+ previous +'.html">◀ ' + pName +'</a>'
		}
		if (undefined !== nName) {
			dom.navnext.innerHTML = '<a class="return" href="'+ next +'.html">'+ nName +' ▶</a>'
		}
	} catch(e) {}
}

function build_element_forms() {
	// ToDo: add optgroup and work outr how to deal with option/optgroup

	// note
	// FYI details*, geolocation, install and usermedia can't use display: inline otherwise
	// we get domrect method mismatches

	// reset
	oElementForms = {}
	oElementFormsTZP = {}

	let oTmp = {
		'checkbox_switch': '<input type="checkbox" switch>', // https://github.com/whatwg/html/pull/9546
		details: '<details></details>',
		details_open: '<details open="">'+ eFiller +'</details>',
		directory: '<input webkitdirectory directory type="file">',
		files: '<input multiple="" type="file">',
		input: '<input>',
		progress: '<progress></progress>',
		select: '<select></select>',
		select_multiple: '<select multiple=""></select>',
			// select + select_multiple don't need any content(options)
			// select multiple is affected by scrollbars
		select_optgroup: '<select multiple=""><optgroup label ="'+ eFiller +'"></optgroup></select>',
		select_option: '<select multiple=""><option>'+ eFiller +'</option></select>',
		textarea: '<textarea></textarea>',
		textarea_3x5: '<textarea cols="5" rows="3"></textarea>',

		// if supported
		geolocation: '<geolocation></geolocation>',
		install: '<install></install>',
		usermedia: '<usermedia></usermedia>',
		// camera: '<camera></camera>',
		// microphone: '<microphone></microphone>',
	}
	let aTmp = [
		'button','checkbox','color','date','datetime','datetime-local','email','file',
		'image','month','number','password','radio','range','reset','search',
		'submit','tel','text','time','url', 'week',
	]
	aTmp.forEach(function(item) {oTmp[item] = '<input type="'+ item+'">' })
	for (const k of Object.keys(oTmp).sort()) {oElementForms[k] = oTmp[k]}
	oElementFormsTZP = {
		// N native U unstyled V vertical H horizontal
		'NH': [
			'button','checkbox','color','date','datetime-local','details','details_open',
			'file','image','number','progress','radio',
			'range','reset','select','submit','textarea','time',
			'select_multiple','textarea_3x5',
			// for blink
				// note: month + week are same as number but not in chrome | gecko may follow suit
			'month','week',
			// if supported: requires special handling
			'geolocation','install','usermedia'
		],
		'NV': ['select_optgroup','select_option'], // to get diff in blink
		// unstyled
			// 'checkbox','radio','select': show a diff to native in gecko + blink at least
			// 'range': gecko only
		'UH': ['checkbox','radio','range','select'],
	}
}

function build_element_keys() {
	// pretty much optimized for modern browsers
	// gecko desktop is great until we get under FF85 and then we start to miss a couple of unique element hashes in our TZP set

	aElementKeysIfSupported = [] // reset
	oElementKeys = {
		additional: ['<frameset><frame></frameset>'], // can't have a frameset in domparser when you have a body
		automatic: ['body','head','html'], // DOMParser has this by default
		list: [],
		ignore: []
	}
	//LIST
	let list = [
		'a','audio',
		'blockquote','button',
		'canvas',
		'data','datalist','del','details',
		'dialog','dir','div',
		'font','form',
		'iframe',
		'label',
		'math','marquee','meter',
		'ol','output',
		'param','pre','progress',
		'script','slot','style','svg',
		'template','textarea','time','title',

		// check support
		// Capability Elements suite | Page-Embedded Permission Control
		'geolocation', // chrome 144: https://developer.chrome.com/blog/geolocation-html-element
		'install',     // chrome 154: https://developer.chrome.com/blog/install-element-ot
		'usermedia',   // chrome 151: https://developer.chrome.com/blog/usermedia-html-element
		// also
		'fencedframe',
	]
	let list_standalone = ['base','br','embed','hr','img','input','link','meta','object','source']
	let aListPlain = list.concat(list_standalone)
	aListPlain = aListPlain.concat(oElementKeys.automatic)
	let list_combo = [
		'<fieldset><legend></legend></fieldset>', // 2
		'<map><area></map>', // 2
		'<select><selectedcontent></selectedcontent><optgroup><option></option></optgroup></select>', // 4
			// note: selectedcontent should be wrapped inside <button></button>
				// but reports the same without it: likewise, button in here reports the same as in list array above
				// except in ~FF152 or lower button is completely missing, so we'll stick with button in list above
			// note: select as a combo with <option>, the option is listed as the first key as "0"
			// this is normal e.g. in blink and gecko - but it is a little weird to report an index number as a key
			// IF we move select to list, it drops the '0', and optgroup and option are not affected
			// BUT I prefer to keep elements inside their expected syntax
			// OR because it's weird we could just remove '0' from the results

		'<table><caption></caption><colgroup><col></colgroup><thead></thead><tr><th></th><td></td></tr><tbody></tbody><tfoot></tfoot></table>', // 10
		'<ul><li></li></ul>', // 2
		'<video><track></video>', // 2
		/*
			// math + svg tests can be studied more in depth in math/svg pocs
				// both require their tags to be be inside their respective elements otherwise they default to nothing extra e.g. like span
				// and both have wildly different commonality to the other elements
				// svg al;so has some elements in common with html e.g. a, script, style
		// math specific elements seem to match the math element itself, so nothing to add/test here beyond math itself
		// svg specific elements can add more information, but its liekly just equivalency of browser version
		'<math><mrow></mrow></math>'
		'<svg><g><path></path><image><symbol><circle><animate></circle></symbol><ellipse></ellipse><rect></rect><foreignObject></<foreignObject><use></g></svg>'
		//*/
	]
	let aElementSVG = [
		// https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/g
		// https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/systemLanguage
		//'a','script','style','filter','marker','view'
		// LOOK AT: window function properties we have 80 SVG*Elements
		'animate','animateMotion','circle','clipPath','defs','ellipse','foreignObject',
		'g','image','line','mask','path','pattern','polygon','polyline','rect','set',
		'switch','text','textPath','tspan','use',
		// there's more
		'symbol',
	]

	list.forEach(function(item) {oElementKeys['list'].push('<'+ item+'></'+ item+'>')})
	list_standalone.forEach(function(item) {oElementKeys['list'].push('<'+ item+'>')})
	// skip[ items we don't need but get due to combos
	oElementKeys['list_skip'] = ['caption','colgroup','selectedcontent','tfoot','th','thead']
	// get total before we add combos/extras
	let totallist = oElementKeys.automatic.length + list.length + list_standalone.length - oElementKeys.list_skip.length
	let comboCount = 0, aCombo = []
	list_combo.forEach(function(item) {
		let x = count_elements(item)
		aCombo.push(x); comboCount += x
		oElementKeys['list'].push(item)
		let aItems = item.split('><')
		aItems.forEach(function(tag) {
			if (!tag.includes('/')) {
				tag = tag.replace('<','')
				// prety up svg tags so they're easier to follow
				if (aElementSVG.includes(tag)) {
					tag = 'svg|'+ tag
				}
				aListPlain.push(tag)
			}
		})
	})
	oElementKeys.additional.forEach(function(item) {
		let x = count_elements(item)
		aCombo.push(x); comboCount += x
		oElementKeys['list'].push(item)
		let aItems = item.split('><')
		aItems.forEach(function(tag) {
			if (!tag.includes('/')) {
				tag = tag.replace('<','')
				aListPlain.push(tag)
			}
		})
	})
	aListPlain = aListPlain.filter(x => !oElementKeys.list_skip.includes(x))
	totallist += comboCount // now add extras
	let list_counts = {
		'automatic': oElementKeys.automatic.length,
		'combo_additional': [comboCount, aCombo],
		'list': list.length,
		'skip': oElementKeys.list_skip.length,
		'standalone': list_standalone.length,
		'total': totallist,
		'total_plain': aListPlain.length,
	}
	oElementKeys['list_counts'] = list_counts
	oElementKeys['list'].sort()
	oElementKeys['list_plain'] = aListPlain.sort()

	// IGNORE
	let ignore = [
		'abbr','acronym','address','applet','article','aside',
		'b','basefont','bdi','bdo','big',
		'center','cite','code',
		'dfn',
		'element-details','em',
		'figcaption','figure','footer',
		'h1','h2','h3','h4','h5','h6','header','hgroup',
		'i','ins','isindex',
		'kbd',
		'main','mark','menu','menuitem',
		'nav','nextid','nobr','noembed','noframes','noscript',
		'p','picture','portal',
		'q',
		'rb','rbc','rp','rt','rtc','ruby',
		's','samp','search','section','small','span','strike','strong','sub','summary','sup',
		'tt','u','var','wbr','xmp',
	]
	let ignore_input = [
		'input|button','input|checkbox','input|color','input|date','input|datetime',
		'input|datetime-local','input|email','input|file','input|hidden','input|image','input|month','input|number',
		'input|password','input|radio','input|range','input|reset','input|search',
		'input|submit','input|tel','input|text','input|time','input|url','input|week',
		// 
	]
	let ignore_input_special = {
		'input|directory': '<input webkitdirectory directory type="file">',
		'input|files': '<input multiple="" type="file">'
	}
	let ignore_standalone = []
	ignore.forEach(function(item) {oElementKeys['ignore'].push('<'+ item+'></'+ item+'>')})
	ignore_standalone.forEach(function(item) {oElementKeys['ignore'].push('<'+ item+'>')})
	ignore_input.forEach(function(item) {
		let parts = item.split('|')
		oElementKeys['ignore'].push('<'+ parts[0] +' type="'+ parts[1] +'">')
	})
	let aIgnorePlain = ignore.concat(ignore_standalone)

	for (const k of Object.keys(ignore_input_special)) {
		oElementKeys['ignore'].push(ignore_input_special[k])
		aIgnorePlain.push(k)
	}


	aIgnorePlain = aIgnorePlain.concat(ignore_input)
	aIgnorePlain = aIgnorePlain.concat(oElementKeys.list_skip)
	let totalignore = ignore.length + ignore_standalone.length + ignore_input.length + oElementKeys.list_skip.length // get total before we add combos/extras

	let ignore_combo = ['<dl><dt></dt><dd></dd></dl>']
	let ignore_final = ['<plaintext></plaintext>'] // for some reason this blocks subsequent items

	comboCount = 0
	aCombo = []
	ignore_combo.forEach(function(item) {
		let x = count_elements(item)
		aCombo.push(x); comboCount += x
		oElementKeys['ignore'].push(item)
		let aItems = item.split('><')
		aItems.forEach(function(tag) {
			if (!tag.includes('/')) {
				tag = tag.replace('<','')
				aIgnorePlain.push(tag)
			}
		})
	})
	oElementKeys['ignore'].sort()
	// DO NOT SORT AFTER THIS
	ignore_final.forEach(function(item) {
		let x = count_elements(item)
		aCombo.push(x); comboCount += x
		oElementKeys['ignore'].push(item)
		let aItems = item.split('><')
		aItems.forEach(function(tag) {
			if (!tag.includes('/')) {
				tag = tag.replace('<','')
				aIgnorePlain.push(tag)
			}
		})
	})
	totalignore += comboCount + Object.keys(ignore_input_special).length // now add extras
	let ignore_counts = {
		'combo_final': [comboCount, aCombo],
		'ignore': ignore.length,
		'input': ignore_input.length,
		'input_special': Object.keys(ignore_input_special).length,
		'skipped_earlier': oElementKeys.list_skip.length,
		'standalone': ignore_standalone.length,
		'total': totalignore,
		'total_plain': aIgnorePlain.length,
	}
	oElementKeys['ignore_counts'] = ignore_counts
	oElementKeys['ignore_plain'] = aIgnorePlain.sort()

	let allKeys = aIgnorePlain.concat(aListPlain)
	oElementKeys['all'] = allKeys.sort()

	// if supported
	for (const k of Object.keys(oIsSupported)) {
		if (oElementKeys.all.includes(k)) {
			aElementKeysIfSupported.push(k)
		}
	}
}

function build_element_other() {

	aElementOtherIgnore = [
		// ignore
		'area', // used in map and sets it's own size
		'bdi','bdo', //: bidirectional elements
		'col','colgroup',
		'datalist', // it's 0 dimensions and causes errors in both methods using getClientRects
		'element-details', // https://mdn.github.io/web-components-examples/element-details/
		'frame','frameset', // deprecated
		'head', // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/head
		'map',
		'menuitem', // deprecated
		'nextid', // died 1997 with HTML v3.2
		'noscript', // blink+ gecko errors in methods 1,3
		'param', // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/param
		'script',
		'source',
		'style',
		'template', // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template
		'track', // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track
		'wbr', // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/wbr
	]
	aElementOtherIgnore.sort()

	let oTmp = {
		// display:inline required
			// otherwise errors in various domrect methods or mismatches or both
		base: '<base style="display:inline;" href=""/>',
		basefont: '<basefont style="display:inline;" color="#FF0000"/>',
		caption: '<table><caption style="display:inline;">'+ eFiller +'</caption></table>',
		link: '<link style="display:inline;" href="" rel="stylesheet">',
		marquee: '<marquee style="display:inline">'+ eFiller +'</marquee>',
			// marquee: if not inline it changes with inner window size (we would have to set width/height which defeats the purpose)
			// also can't be vertical (inner height affects results), we also get an error in method 1, mismatches in the others
		noframes: '<noframes style="display:inline;">'+ eFiller +'</noframes>',
		rp: '<ruby><rp style="display:inline;">'+ eFiller +'</rp></ruby>',
		rt: '<ruby><rt style="display:inline">'+ eFiller +'</rt></ruby>',
			// rtc: inline else vertical can differ on methjod 2 (at least in gecko)
			// with inline it still differs but only with x and left
		slot: '<slot style="display:inline;">'+ eFiller +'</slot>',
		title: '<title style="display:inline;">' + eFiller +'</title>',

		// other style
			// these were all unique beforehand, we're not creating artificial uniqueness
		figure: '<figure style="display:inline;"></figure>', // inline for horizontal decimals
		hr: '<hr style="display:inline;">', // inline to add more unique individual measurements
		plaintext: '<plaintext style="display:inline;">', // inline for vertical decimals
		ruby: '<ruby style="display:inline;">'+ eFiller +'</ruby>',
		// the rest
		a: '<a href="">'+ eFiller +'</a>',
		audio: '<audio controls=""></audio>',
		big_nested: '<big><big>'+ eFiller +'</big></big>',
		dd: '<dl><dd>'+ eFiller +'</dd></dl>',
		dialog: '<dialog open=""></dialog>',
		dt: '<dl><dt>'+ eFiller +'</dt></dl>',
		embed: '<embed src="">',
		figcaption: '<figure><figcaption>'+ eFiller +'</figcaption></figure>',
		hgroup: '<hgroup><h1>'+ eFiller +'</h1><p class="revert">'+ eFiller +'</p></hgroup>', // revert 2nd child (p)
		isindex: '<isindex prompt="search"></isindex>',
		label: '<div id="elementlabel"><label for="elementlabel">'+ eFiller +'</label></div>',
		legend: '<fieldset><legend>'+ eFiller +'</legend></fieldset>',
		li: '<ul><li></li></ul>',
		noembed: '<embed src=""><noembed>'+ eFiller +'</noembed>',
		//output_in_form: '<form><input><output class="revert"></output></form>', // revert 2nd child
			// output
			// - we don't actually need to calculate any values | if we wanted to we could add eFiller
			// - on it's own is redundant ('<output>'+ eFiller +'<output>')
			// - when wrapped in form/input it becomes unique, butr what's interesting is that I get two
			//   different values in two FF151's (my test profile, my main profile) and I have no idea why
			//   When this happens it is because form has a different width (and thus cascades effects)
			// If we cabn replicate this in forms, then we can drop output here and instead add it as
			// a redundant item as such: '<output>'+ eFiller +'<output>'

		rb: '<ruby><rb>'+ eFiller +'</rb></ruby>',
		rbc: '<ruby><rbc>'+ eFiller +'</rbc></ruby>',
		rtc: '<ruby><rtc>'+ eFiller +'</rtc></ruby>',
		summary: '<details><summary>'+ eFiller +'</summary></details>',
		// tables
		tbody: '<table><tbody></tbody></table>', 
		td: '<table><tr><td></td></tr></table>',
		tfoot: '<table><tfoot></tfoot></table>',
		th: '<table><thead><tr><th></th></tr></thead></table>',
		thead: '<table><thead></thead></table>',
		tr: '<table><tr></tr></table>',
		// other
		ol_li: '<ol><li>'+ eFiller +'</li></ol>',
		menu_li: '<menu>'+ eFiller +'<li></li></menu>',
		ul_li: '<ul><li>'+ eFiller +'</li></ul>',
		// test error
		//'error': '<frame></frame>'
	}

	// programatically add more
	let oBuild = {
		'char': [
				'abbr','acronym','address','applet','article','aside',
				'b','big','blockquote','center','cite','code',
				'data','del','dir','div','dfn','dl','em',
				'font','footer',
				'h1','h2','h3','h4','h5','h6','header',
				'i','ins','iframe','kbd',
				'main','mark','menu',
				'nobr','ol','option','output','p','pre','q',
				's','samp','section','small','span','strike','strong','sub','sup',
				'time','tt',
				'u','ul','var','xmp',
		],
		nochar: [
			'button', // this is not the same as input type='button'
			'form', // "forms" PoC doesn't use <form>, they're all basically <input>
			'canvas','fencedframe','fieldset','math','meter','nav','optgroup','picture',
			'portal', // https://wicg.github.io/portals/#the-portal-element
			'search','svg','table','video',
		],
		standalone: [
			'br','img','object',
		],
	}

	oBuild['char'].forEach(function(item) {oTmp[item] = '<'+ item +'>'+ eFiller +'</'+ item +'>'})
	oBuild.nochar.forEach(function(item) {oTmp[item] = '<'+ item +'></'+ item +'>'})
	oBuild.standalone.forEach(function(item) {oTmp[item] = '<'+ item +'>'})

	// sort into final object
	for (const k of Object.keys(oTmp).sort()) {oElementOther[k] = oTmp[k]}

	// TZP
		// we can't get more unique elements than actual elements used
		// so don't double up: e.g. in blink android we have 35 unique elements in
		// everything but only 34 elements used in tzp (at the time): so we need to
		// add a new element: the point of difference was in "base, basefont, picture"
		// (grouped in everything) - we already use base, so instead add basefont or picture 
	oElementOtherTZP = {
		'horizontal': [
			// AFAICT audio/video, canvas, iframe + img don't respect writing-mode
			'audio','canvas','iframe','img',
			// unqiueness comes horizontal
			'ol_li','ul_li',
			// the rest
			'big','big_nested','blockquote','br','button','caption','code','dt','fieldset',
			'figure','h1','h2','h3','h4','h5','h6','hgroup','hr','legend','marquee','menu_li','meter',
			'q','search','small','sub','td','tfoot','ul',
			// keep together
			'a','b','i', // unique on android
		],
		'vertical': [
			'article','rtc',// vertical for android blink
			'dd','dialog','dl','figcaption','li','object','optgroup',
			'option','plaintext','pre','rb','rt','summary','sup',
		]
	}


}

function count_elements(str) {
	let regex = new RegExp('<','g')
	let openCount = (str.match(regex) || []).length
	if (0 ==  openCount) return 0
	regex = new RegExp('</','g')
	let closeCount = (str.match(regex) || []).length
	return openCount - closeCount
}
