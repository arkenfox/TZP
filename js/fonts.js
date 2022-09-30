'use strict';

let fntCode = ['0x20B9','0x2581','0x20BA','0xA73D','0xFFFD','0x20B8','0x05C6',
	'0x1E9E','0x097F','0xF003','0x1CDA','0x17DD','0x23AE','0x0D02','0x0B82','0x115A',
	'0x2425','0x302E','0xA830','0x2B06','0x21E4','0x20BD','0x2C7B','0x20B0','0xFBEE',
	'0xF810','0x007F','0x10A0','0x1D790','0x0700','0x1950','0x3095','0x532D',
	'0x061C','0x20E3','0xFFF9','0x0218','0x058F','0x08E4','0x09B3','0x1C50','0x2619',
	// '0xFFFF', // we add this tofu later
	],
	fntStrA = "mmmLLLmmmWWWwwwmmmllliii",
	fntStrB = "",
	fntList = [], // what we use
	fntFake = "",
	fontBtns = "",
	fontBaseBtn = "",
	fontDocEnabled = false,
	baseFonts = [], // what we test each font with
	baseFontsNames = [], // baseFonts w/out any fallback fonts (used to create arrays etc)
	baseFontsFull = [] // merged baseFonts + baseMaster

fntCode.sort()

/*** TEMP FUNCTIONS ***/
function listfontsizes() {
	let sizelog = []
	for (const k of Object.keys(sDetail["fonts_fontsizes"])) {
		let array = sDetail["fonts_fontsizes"][k]
		if (array.length > 1) {
			sizelog.push(k +" : " + array.join(", "))
		}
	}
	if (sizelog.length) {
		console.log(sizelog.join("\n"))
	}
}

function listfontfirst() {
	let sizelog = []
	for (const k of Object.keys(sDetail["fonts_fontsizes"])) {
		let font = sDetail["fonts_fontsizes"][k][0]
		sizelog.push(font)
	}
	if (sizelog.length) {
		sizelog.sort()
		console.log("\""+ sizelog.join("\",\"") +"\"")
	}
}

let injectedwin11 = false
	let fontswin11 = [
		// should be fonts
		"Cascadia Code","Cascadia Code ExtraLight","Cascadia Code Light","Cascadia Code SemiLight","Cascadia Code SemiBold","Cascadia Mono",
		"Cascadia Mono ExtraLight","Cascadia Mono Light","Cascadia Mono SemiLight","Cascadia Mono SemiBold","Segoe Fluent Icons",
		"Segoe UI Variable Display","Segoe UI Variable Display Light","Segoe UI Variable Display Semilight","Segoe UI Variable Display Semibold",
		"Segoe UI Variable Small","Segoe UI Variable Small Light","Segoe UI Variable Small Semilight","Segoe UI Variable Small Semibold",
		"Segoe UI Variable Text","Segoe UI Variable Text Light","Segoe UI Variable Text Semilight","Segoe UI Variable Text Semibold",
		"Sitka Banner Semibold","Sitka Display Semibold","Sitka Small Semibold","Sitka Heading Semibold","Sitka Subheading Semibold",
		"Sitka Text Semibold",
	]
	let faceswin11 = [
		// should be faces
		"Cascadia Code ExtraLight Italic","Cascadia Code Light Italic","Cascadia Code SemiLight Italic","Cascadia Code Italic",
		"Cascadia Code SemiBold Italic","Cascadia Code Bold","Cascadia Code Bold Italic","Cascadia Mono ExtraLight Italic",
		"Cascadia Mono Light Italic","Cascadia Mono SemiLight Italic","Cascadia Mono Italic","Cascadia Mono SemiBold Italic",
		"Cascadia Mono Bold","Cascadia Mono Bold Italic","Segoe UI Variable Display Bold","Segoe UI Variable Small Bold",
		"Segoe UI Variable Text Bold","Sitka Banner Semibold Italic","Sitka Display Semibold Italic","Sitka Small Semibold Italic",
		"Sitka Heading Semibold Italic","Sitka Subheading Semibold Italic","Sitka Text Semibold Italic",
	]
function injectwin11() {
	if (injectedwin11) {
		console.log("already injected")
		return
	} else if (isOS !== "windows") {
		console.log("this is not windows")
		return
	}
	fntList = fntList.concat(fontswin11)
	fntList = fntList.concat(faceswin11)
	fntList.sort()
	console.log("injection, done! now rerun the font section")
	injectedwin11 = true
}
function checkwin11() {
	if (!injectedwin11) {
		console.log("you need to inject the fonts first")
		return
	}
	let aFound = sDetail["fonts_fontnames_notglobal"]
	// testing
	//aFound.push("Cascadia Code","Cascadia Code ExtraLight","Sitka Text Semibold Italic") // 2 fonts, 1 face
	let res = []
	let fontFound = fontswin11.filter(x => aFound.includes(x))
	if (fontFound.length) {res.push("FONTS FOUND\n" + fontFound.join(", "))} else {res.push("FONTS FOUND - none")}
	let fontNotFound = fontswin11.filter(x => !aFound.includes(x))
	if (fontFound.length == 0) {res.push("FONTS NOT FOUND - all")} else {res.push("FONTS NOT FOUND\n" + fontNotFound.join(", "))}
	let faceFound = faceswin11.filter(x => aFound.includes(x))
	if (faceFound.length) {res.push("FACES FOUND\n" + faceFound.join(", "))} else {res.push("FACES FOUND - none")}
	let faceNotFound = faceswin11.filter(x => !aFound.includes(x))
	if (faceFound.length == 0) {res.push("FACES NOT FOUND - all")} else {res.push("FACES NOT FOUND\n" + faceNotFound.join(", "))}
	console.log(res.join("\n"))
}

/*** END TEMP FUNCTIONS ***/

// sims
let intFNT = 0

let fntMaster = {android: [], linux: [],mac: [], windows: []}
let fntMasterBase = {android: [], linux: [],mac: [], windows: []}

let fntOther = {
	android: ['Droid Sans','Droid Sans Mono','Droid Serif','Noto Color Emoji','Noto Emoji','Noto Kufi Arabic','Noto Mono','Noto Naskh Arabic','Noto Nastaliq Urdu','Noto Sans','Noto Sans Adlam','Noto Sans Adlam Unjoined','Noto Sans Anatolian Hieroglyphs','Noto Sans Arabic','Noto Sans Armenian','Noto Sans Avestan','Noto Sans Balinese','Noto Sans Bamum','Noto Sans Batak','Noto Sans Bengali','Noto Sans Brahmi','Noto Sans Buginese','Noto Sans Buhid','Noto Sans CJK JP','Noto Sans CJK KR','Noto Sans CJK SC','Noto Sans CJK TC','Noto Sans Canadian Aboriginal','Noto Sans Carian','Noto Sans Chakma','Noto Sans Cham','Noto Sans Cherokee','Noto Sans Coptic','Noto Sans Cuneiform','Noto Sans Cypriot','Noto Sans Deseret','Noto Sans Devanagari','Noto Sans Display','Noto Sans Egyptian Hieroglyphs','Noto Sans Ethiopic','Noto Sans Georgian','Noto Sans Glagolitic','Noto Sans Gothic','Noto Sans Gujarati','Noto Sans Gurmukhi','Noto Sans Hanunoo','Noto Sans Hebrew','Noto Sans Imperial Aramaic','Noto Sans Inscriptional Pahlavi','Noto Sans Inscriptional Parthian','Noto Sans JP','Noto Sans Javanese','Noto Sans KR','Noto Sans Kaithi','Noto Sans Kannada','Noto Sans Kayah Li','Noto Sans Kharoshthi','Noto Sans Khmer','Noto Sans Lao','Noto Sans Lepcha','Noto Sans Limbu','Noto Sans Linear B','Noto Sans Lisu','Noto Sans Lycian','Noto Sans Lydian','Noto Sans Malayalam','Noto Sans Mandaic','Noto Sans Meetei Mayek','Noto Sans Mongolian','Noto Sans Mono','Noto Sans Myanmar','Noto Sans NKo','Noto Sans New Tai Lue','Noto Sans Ogham','Noto Sans Ol Chiki','Noto Sans Old Italic','Noto Sans Old Persian','Noto Sans Old South Arabian','Noto Sans Old Turkic','Noto Sans Oriya','Noto Sans Osage','Noto Sans Osmanya','Noto Sans Phags Pa','Noto Sans Phoenician','Noto Sans Rejang','Noto Sans Runic','Noto Sans SC','Noto Sans Samaritan','Noto Sans Saurashtra','Noto Sans Shavian','Noto Sans Sinhala','Noto Sans Sundanese','Noto Sans Syloti Nagri','Noto Sans Symbols','Noto Sans Symbols2','Noto Sans Syriac Eastern','Noto Sans Syriac Estrangela','Noto Sans Syriac Western','Noto Sans TC','Noto Sans Tagalog','Noto Sans Tagbanwa','Noto Sans Tai Le','Noto Sans Tai Tham','Noto Sans Tai Viet','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Thaana','Noto Sans Thai','Noto Sans Tibetan','Noto Sans Tifinagh','Noto Sans Ugaritic','Noto Sans Vai','Noto Sans Yi','Noto Serif','Noto Serif Armenian','Noto Serif Balinese','Noto Serif Bengali','Noto Serif CJK JP','Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC','Noto Serif Devanagari','Noto Serif Display','Noto Serif Ethiopic','Noto Serif Georgian','Noto Serif Gujarati','Noto Serif Gurmukhi','Noto Serif Hebrew','Noto Serif Kannada','Noto Serif Khmer','Noto Serif Lao','Noto Serif Malayalam','Noto Serif Myanmar','Noto Serif Sinhala','Noto Serif Tamil','Noto Serif Telugu','Noto Serif Thai','Noto Serif Tibetan','Roboto','Roboto Condensed',],
	linux: ['AR PL UKai CN','AR PL UKai HK','AR PL UKai TW','AR PL UKai TW MBE','AR PL UMing CN','AR PL UMing HK','AR PL UMing TW','AR PL UMing TW MBE','Abyssinica SIL','Aharoni CLM','AlArabiya','AlBattar','AlHor','AlManzomah','AlYarmook','Amiri','Amiri Quran','Amiri Quran Colored','Ani','AnjaliOldLipi','Arab','Arial','Arimo','Bitstream Charter','C059','Caladea','Caladings CLM','Cantarell','Cantarell Extra Bold','Cantarell Light','Cantarell Thin','Carlito','Century Schoolbook L','Chandas','Chilanka','Comfortaa','Comfortaa Light','Cortoba','Courier','Courier 10 Pitch','Courier New','Cousine','D050000L','David CLM','DejaVu Math TeX Gyre','DejaVu Sans','DejaVu Sans Condensed','DejaVu Sans Light','DejaVu Sans Mono','DejaVu Serif','DejaVu Serif Condensed','Dimnah','Dingbats','Droid Arabic Kufi','Droid Sans','Droid Sans Armenian','Droid Sans Devanagari','Droid Sans Ethiopic','Droid Sans Fallback','Droid Sans Georgian','Droid Sans Hebrew','Droid Sans Japanese','Droid Sans Tamil','Droid Sans Thai','Drugulin CLM','Dyuthi','Electron','Ellinia CLM','Ezra SIL','Ezra SIL SR','Frank Ruehl CLM','FreeMono','FreeSans','FreeSerif','Furat','Gargi','Garuda','Gayathri','Gayathri Thin','Georgia','Granada','Graph','Gubbi','Hadasim CLM','Hani','Haramain','Homa','Hor','Jamrul','Japan','Jet','Jomolhari','KacstArt','KacstBook','KacstDecorative','KacstDigital','KacstFarsi','KacstLetter','KacstNaskh','KacstOffice','KacstOne','KacstPen','KacstPoster','KacstQurn','KacstScreen','KacstTitle','KacstTitleL','Kalapi','Kalimati','Karumbi','Kayrawan','Keraleeyam','Keter YG','Khalid','Khmer OS','Khmer OS Battambang','Khmer OS Bokor','Khmer OS Content','Khmer OS Fasthand','Khmer OS Freehand','Khmer OS Metal Chrieng','Khmer OS Muol','Khmer OS Muol Light','Khmer OS Muol Pali','Khmer OS Siemreap','Khmer OS System','Kinnari','LKLUG','Laksaman','Liberation Mono','Liberation Sans','Liberation Sans Narrow','Liberation Serif','Likhan','Lohit Assamese','Lohit Bengali','Lohit Devanagari','Lohit Gujarati','Lohit Gurmukhi','Lohit Kannada','Lohit Malayalam','Lohit Odia','Lohit Tamil','Lohit Tamil Classical','Lohit Telugu','Loma','Manjari','Manjari Thin','Mashq','Mashq-Bold','Meera','Metal','Mingzat','Miriam CLM','Miriam Mono CLM','Mitra Mono','Montserrat','Montserrat Black','Montserrat ExtraBold','Montserrat ExtraLight','Montserrat Light','Montserrat Medium','Montserrat SemiBold','Montserrat Thin','Mukti Narrow','Mukti Narrow Bold','Nachlieli CLM','Nada','Nagham','Nakula','Navilu','Nazli','Nice','Nimbus Mono L','Nimbus Mono PS','Nimbus Roman','Nimbus Roman No9 L','Nimbus Sans','Nimbus Sans L','Nimbus Sans Narrow','Norasi','Noto Color Emoji','Noto Emoji','Noto Mono','Noto Naskh Arabic','Noto Sans','Noto Sans Armenian','Noto Sans Balinese','Noto Sans Bengali','Noto Sans Buginese','Noto Sans CJK HK','Noto Sans CJK HK Black','Noto Sans CJK HK DemiLight','Noto Sans CJK HK Light','Noto Sans CJK HK Medium','Noto Sans CJK HK Thin','Noto Sans CJK JP','Noto Sans CJK JP Black','Noto Sans CJK JP DemiLight','Noto Sans CJK JP Light','Noto Sans CJK JP Medium','Noto Sans CJK JP Thin','Noto Sans CJK KR','Noto Sans CJK KR Black','Noto Sans CJK KR DemiLight','Noto Sans CJK KR Light','Noto Sans CJK KR Medium','Noto Sans CJK KR Thin','Noto Sans CJK SC','Noto Sans CJK SC Black','Noto Sans CJK SC DemiLight','Noto Sans CJK SC Light','Noto Sans CJK SC Medium','Noto Sans CJK SC Thin','Noto Sans CJK TC','Noto Sans CJK TC Black','Noto Sans CJK TC DemiLight','Noto Sans CJK TC Light','Noto Sans CJK TC Medium','Noto Sans CJK TC Thin','Noto Sans Canadian Aboriginal','Noto Sans Cherokee','Noto Sans Devanagari','Noto Sans Ethiopic','Noto Sans Georgian','Noto Sans Gujarati','Noto Sans Gurmukhi','Noto Sans Hebrew','Noto Sans JP','Noto Sans KR','Noto Sans Kannada','Noto Sans Khmer','Noto Sans Lao','Noto Sans Malayalam','Noto Sans Mongolian','Noto Sans Mono CJK HK','Noto Sans Mono CJK JP','Noto Sans Mono CJK KR','Noto Sans Mono CJK SC','Noto Sans Mono CJK TC','Noto Sans Myanmar','Noto Sans Oriya','Noto Sans SC','Noto Sans Sinhala','Noto Sans TC','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Thaana','Noto Sans Thai','Noto Sans Tibetan','Noto Sans Yi','Noto Serif','Noto Serif Armenian','Noto Serif Balinese','Noto Serif Bengali','Noto Serif CJK JP','Noto Serif CJK JP Black','Noto Serif CJK JP ExtraLight','Noto Serif CJK JP Light','Noto Serif CJK JP Medium','Noto Serif CJK JP SemiBold','Noto Serif CJK KR','Noto Serif CJK KR Black','Noto Serif CJK KR ExtraLight','Noto Serif CJK KR Light','Noto Serif CJK KR Medium','Noto Serif CJK KR SemiBold','Noto Serif CJK SC','Noto Serif CJK SC Black','Noto Serif CJK SC ExtraLight','Noto Serif CJK SC Light','Noto Serif CJK SC Medium','Noto Serif CJK SC SemiBold','Noto Serif CJK TC','Noto Serif CJK TC Black','Noto Serif CJK TC ExtraLight','Noto Serif CJK TC Light','Noto Serif CJK TC Medium','Noto Serif CJK TC SemiBold','Noto Serif Devanagari','Noto Serif Ethiopic','Noto Serif Georgian','Noto Serif Gujarati','Noto Serif Gurmukhi','Noto Serif Hebrew','Noto Serif Kannada','Noto Serif Khmer','Noto Serif Lao','Noto Serif Malayalam','Noto Serif Myanmar','Noto Serif Sinhala','Noto Serif Tamil','Noto Serif Telugu','Noto Serif Thai','Noto Serif Tibetan','Nuosu SIL','OpenSymbol','Ostorah','Ouhod','Ouhod-Bold','P052','PT Sans','PT Sans Narrow','Padauk','Padauk Book','Pagul','PakType Naskh Basic','Petra','Phetsarath OT','Pothana2000','Purisa','Rachana','RaghuMalayalamSans','Rasa','Rasa Light','Rasa Medium','Rasa SemiBold','Rasheeq','Rasheeq-Bold','Rehan','Rekha','STIX','STIX Math','STIX Two Math','STIX Two Text','Saab','Sahadeva','Salem','Samanata','Samyak Devanagari','Samyak Gujarati','Samyak Malayalam','Samyak Tamil','Sarai','Sawasdee','Scheherazade','Shado','Sharjah','Shofar','Simple CLM','Sindbad','Source Code Pro','Source Code Pro Black','Source Code Pro ExtraLight','Source Code Pro Light','Source Code Pro Medium','Source Code Pro Semibold','Stam Ashkenaz CLM','Stam Sefarad CLM','Standard Symbols L','Standard Symbols PS','Suruma','Symbola','Tarablus','Tholoth','Tibetan Machine Uni','Tinos','Titr','Tlwg Mono','Tlwg Typewriter','Tlwg Typist','Tlwg Typo','UKIJ 3D','UKIJ Basma','UKIJ Bom','UKIJ CJK','UKIJ Chechek','UKIJ Chiwer Kesme','UKIJ Diwani','UKIJ Diwani Kawak','UKIJ Diwani Tom','UKIJ Diwani Yantu','UKIJ Ekran','UKIJ Elipbe','UKIJ Elipbe_Chekitlik','UKIJ Esliye','UKIJ Esliye Chiwer','UKIJ Esliye Neqish','UKIJ Esliye Qara','UKIJ Esliye Tom','UKIJ Imaret','UKIJ Inchike','UKIJ Jelliy','UKIJ Junun','UKIJ Kawak','UKIJ Kawak 3D','UKIJ Kesme','UKIJ Kesme Tuz','UKIJ Kufi','UKIJ Kufi 3D','UKIJ Kufi Chiwer','UKIJ Kufi Gul','UKIJ Kufi Kawak','UKIJ Kufi Tar','UKIJ Kufi Uz','UKIJ Kufi Yay','UKIJ Kufi Yolluq','UKIJ Mejnun','UKIJ Mejnuntal','UKIJ Merdane','UKIJ Moy Qelem','UKIJ Nasq','UKIJ Nasq Zilwa','UKIJ Orqun Basma','UKIJ Orqun Yazma','UKIJ Orxun-Yensey','UKIJ Qara','UKIJ Qolyazma','UKIJ Qolyazma Tez','UKIJ Qolyazma Tuz','UKIJ Qolyazma Yantu','UKIJ Ruqi','UKIJ Saet','UKIJ Sulus','UKIJ Sulus Tom','UKIJ Teng','UKIJ Tiken','UKIJ Title','UKIJ Tor','UKIJ Tughra','UKIJ Tuz','UKIJ Tuz Basma','UKIJ Tuz Gezit','UKIJ Tuz Kitab','UKIJ Tuz Neqish','UKIJ Tuz Qara','UKIJ Tuz Tom','UKIJ Tuz Tor','UKIJ Zilwa','UKIJ_Mac Basma','UKIJ_Mac Ekran','URW Bookman','URW Bookman L','URW Chancery L','URW Gothic','URW Gothic L','URW Palladio L','Ubuntu','Ubuntu Condensed','Ubuntu Light','Ubuntu Mono','Ubuntu Thin','Umpush','Uroob','Vemana2000','Verdana','Waree','Yehuda CLM','Yrsa','Yrsa Light','Yrsa Medium','Yrsa SemiBold','Z003','aakar','mry_KacstQurn','ori1Uni','padmaa','padmaa-Bold.1.1','padmmaa','utkal','מרים','गार्गी','नालिमाटी','অনি Dvf','মিত্র','মুক্তি','মুক্তি পাতনা',],
	mac: ["American Typewriter Condensed","American Typewriter Condensed Light","American Typewriter Light","American Typewriter Semibold","Apple Braille Outline 6 Dot","Apple Braille Outline 8 Dot","Apple Braille Pinpoint 6 Dot","Apple Braille Pinpoint 8 Dot","Apple LiGothic Medium","Apple LiSung Light","Apple SD Gothic Neo Heavy","Apple SD Gothic Neo Light","Apple SD Gothic Neo Medium","Apple SD Gothic Neo SemiBold","Apple SD Gothic Neo UltraLight","Apple SD GothicNeo ExtraBold","Athelas","Avenir Book Oblique","Avenir Heavy Oblique","Avenir Light Oblique","Avenir Medium Oblique","Avenir Next Condensed Bold","Avenir Next Condensed Demi Bold","Avenir Next Condensed Heavy","Avenir Next Condensed Medium","Avenir Next Condensed Ultra Light","Avenir Roman","Baoli SC","Baoli TC","Baskerville SemiBold","BiauKai","Bodoni 72 Book","Bodoni 72 Oldstyle Book","Bodoni 72 Smallcaps Book","Charcoal CY","Charter Roman","Copperplate Light","Damascus Light","Damascus Medium","Damascus Semi Bold","Futura Condensed ExtraBold","Futura Condensed Medium","Futura Medium","Geneva CY","Gill Sans Light","Gill Sans SemiBold","Gill Sans UltraBold","GungSeo","Hannotate SC","Hannotate TC","HanziPen SC","HanziPen TC","HeadLineA","Hei","Heiti SC Light","Heiti SC Medium","Heiti TC Light","Heiti TC Medium","Helvetica CY Bold","Helvetica Light","Helvetica Neue Condensed Black","Helvetica Neue Condensed Bold","Helvetica Neue Light","Helvetica Neue Medium","Helvetica Neue UltraLight","Herculanum","Hiragino Kaku Gothic Pro W3","Hiragino Kaku Gothic Pro W6","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic ProN W3","Hiragino Kaku Gothic ProN W6","Hiragino Kaku Gothic Std W8","Hiragino Kaku Gothic StdN W8","Hiragino Maru Gothic Pro W4","Hiragino Mincho Pro W3","Hiragino Mincho Pro W6","Hiragino Sans CNS W3","Hiragino Sans CNS W6","Hoefler Text Black","ITF Devanagari Book","ITF Devanagari Demi","ITF Devanagari Light","ITF Devanagari Marathi Book","ITF Devanagari Marathi Demi","ITF Devanagari Marathi Light","ITF Devanagari Marathi Medium","ITF Devanagari Medium","Iowan Old Style Black","Iowan Old Style Bold","Iowan Old Style Italic","Iowan Old Style Roman","Iowan Old Style Titling","Kai","Kaiti SC","Kaiti SC Black","Kaiti TC","Kaiti TC Black","Klee Demibold","Klee Medium","Kohinoor Bangla Light","Kohinoor Bangla Medium","Kohinoor Bangla Semibold","Kohinoor Devanagari Light","Kohinoor Devanagari Medium","Kohinoor Devanagari Semibold","Kohinoor Gujarati Light","Kohinoor Gujarati Medium","Kohinoor Gujarati Semibold","Kohinoor Telugu Light","Kohinoor Telugu Medium","Kohinoor Telugu Semibold","Lantinghei SC Demibold","Lantinghei SC Extralight","Lantinghei SC Heavy","Lantinghei TC Demibold","Lantinghei TC Extralight","Lantinghei TC Heavy","LiHei Pro","LiSong Pro","Libian SC","Libian TC","LingWai SC Medium","LingWai TC Medium","Marion","Muna Black","Myriad Arabic","Myriad Arabic Black","Myriad Arabic Light","Myriad Arabic Semibold","Nanum Brush Script","Nanum Pen Script","NanumGothic","NanumGothic ExtraBold","NanumMyeongjo","NanumMyeongjo ExtraBold","New Peninim MT Bold Inclined","New Peninim MT Inclined","Noto Sans Javanese","Optima ExtraBlack","Osaka","Osaka-Mono","PCMyungjo","Papyrus Condensed","Phosphate Inline","Phosphate Solid","PilGi","PingFang HK Light","PingFang HK Medium","PingFang HK Semibold","PingFang HK Ultralight","PingFang SC Light","PingFang SC Medium","PingFang SC Semibold","PingFang SC Ultralight","PingFang TC Light","PingFang TC Medium","PingFang TC Semibold","PingFang TC Ultralight","STFangsong","STHeiti","STIX Two Math","STIX Two Text","STKaiti","STXihei","Seravek","Seravek ExtraLight","Seravek Light","Seravek Medium","SignPainter-HouseScript Semibold","Skia Black","Skia Condensed","Skia Extended","Skia Light","Snell Roundhand Black","Songti SC Black","Songti SC Light","Songti TC Light","Sukhumvit Set Light","Sukhumvit Set Medium","Sukhumvit Set Semi Bold","Sukhumvit Set Text","Superclarendon","Superclarendon Black","Superclarendon Light","Thonburi Light","Times Roman","Toppan Bunkyu Gothic","Toppan Bunkyu Gothic Demibold","Toppan Bunkyu Gothic Regular","Toppan Bunkyu Midashi Gothic Extrabold","Toppan Bunkyu Midashi Mincho Extrabold","Toppan Bunkyu Mincho","Toppan Bunkyu Mincho Regular","Tsukushi A Round Gothic","Tsukushi A Round Gothic Bold","Tsukushi A Round Gothic Regular","Tsukushi B Round Gothic","Tsukushi B Round Gothic Bold","Tsukushi B Round Gothic Regular","Waseem Light","Wawati SC","Wawati TC","Weibei SC Bold","Weibei TC Bold","Xingkai SC Bold","Xingkai SC Light","Xingkai TC Bold","Xingkai TC Light","YuGothic Bold","YuGothic Medium","YuKyokasho Bold","YuKyokasho Medium","YuKyokasho Yoko Bold","YuKyokasho Yoko Medium","YuMincho +36p Kana Demibold","YuMincho +36p Kana Extrabold","YuMincho +36p Kana Medium","YuMincho Demibold","YuMincho Extrabold","YuMincho Medium","Yuanti SC","Yuanti SC Light","Yuanti TC","Yuanti TC Light","Yuppy SC","Yuppy TC",],
	windows: [
		"Aharoni Bold","Aldhabi","Andalus","Angsana New","Aparajita","Arabic Typesetting","Arial Nova","Arial Nova Cond","Arial Nova Cond Light","Arial Nova Light","Arial Unicode MS","BIZ UDGothic","BIZ UDMincho","BIZ UDMincho Medium","BIZ UDPGothic","BIZ UDPMincho","BIZ UDPMincho Medium","Batang","BatangChe","Browallia New","Cordia New","DFKai-SB","DaunPenh","David","DengXian","DengXian Light","DilleniaUPC","DilleniaUPC Bold","DokChampa","Dotum","DotumChe","Estrangelo Edessa","EucrosiaUPC","Euphemia","FangSong","FrankRuehl","FreesiaUPC","Gautami","Georgia Pro","Georgia Pro Black","Georgia Pro Cond","Georgia Pro Cond Black","Georgia Pro Cond Light","Georgia Pro Cond Semibold","Georgia Pro Light","Georgia Pro Semibold","Gill Sans Nova","Gill Sans Nova Cond","Gill Sans Nova Cond Lt","Gill Sans Nova Cond Ultra Bold","Gill Sans Nova Cond XBd","Gill Sans Nova Light","Gill Sans Nova Ultra Bold","Gisha","Gulim","GulimChe","Gungsuh","GungsuhChe","Ink Free","IrisUPC","Iskoola Pota","JasmineUPC","KaiTi","Kalinga","Kartika","Khmer UI","KodchiangUPC","Kokila","Lao UI","Latha","Leelawadee","Levenim MT","LilyUPC","MS Mincho","MS PMincho","Mangal","Meiryo","Meiryo UI","Microsoft Uighur","MingLiU","MingLiU_HKSCS","Miriam","Miriam Fixed","MoolBoran","Narkisim","Neue Haas Grotesk Text Pro","Neue Haas Grotesk Text Pro Medium","Nyala","Plantagenet Cherokee","Raavi","Rockwell Nova","Rockwell Nova Cond","Rockwell Nova Cond Light","Rockwell Nova Extra Bold","Rockwell Nova Light Italic","Rockwell Nova Rockwell","Rod","Sakkal Majalla","Sanskrit Text","Segoe Pseudo","Shonar Bangla","Shruti","SimHei","Simplified Arabic","Simplified Arabic Fixed","Traditional Arabic","Tunga","UD Digi Kyokasho","UD Digi Kyokasho N-B","UD Digi Kyokasho N-R","UD Digi Kyokasho NK-B","UD Digi Kyokasho NK-R","UD Digi Kyokasho NP-B","UD Digi Kyokasho NP-R","Urdu Typesetting","Utsaah","Vani","Verdana Pro","Verdana Pro Black","Verdana Pro Cond","Verdana Pro Cond Black","Verdana Pro Cond Light","Verdana Pro Cond SemiBold","Verdana Pro Light","Verdana Pro SemiBold","Vijaya","Vrinda","Yu Mincho","Yu Mincho Demibold","Yu Mincho Light",
		// from fntBase but it's broken there: see 1720408
		"Franklin Gothic Medium",
		// aliases
		"宋体", // SimSun
		"細明體", // MingLiU
		"新細明體", // PMingLiU
		"굴림",
		"굴림체", // GulimChe?
		// ignore: expected + dupe sizes
			//"PMingLiU", // = PMingLiU-ExtB (fntBase)
			//"AngsanaUPC","BrowalliaUPC","CordiaUPC", // = Angsana|Browallia|Cordia New
			//"바탕", // = Batang
			//"微软雅黑", // = Microsoft YaHei
			//"ＭＳ ゴシック", // = MS Gothic
			//"ＭＳ 明朝", // = MS Mincho
			//"ＭＳ Ｐゴシック", // = MS PGothic
			//"ＭＳ Ｐ明朝", // = MS PMincho
	],
}
let fntBase = {
	// https://searchfox.org/mozilla-central/search?path=StandardFonts*.inc
	android: [],linux: [],
	mac: ["Al Bayan","Al Nile","Al Tarikh","American Typewriter","Andale Mono","Apple Braille","Apple Chancery","Apple Color Emoji","Apple SD Gothic Neo","Apple Symbols","AppleGothic","AppleMyungjo","Arial","Arial Black","Arial Hebrew","Arial Hebrew Scholar","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Avenir","Avenir Black","Avenir Black Oblique","Avenir Book","Avenir Heavy","Avenir Light","Avenir Medium","Avenir Next","Avenir Next Demi Bold","Avenir Next Heavy","Avenir Next Medium","Avenir Next Ultra Light","Avenir Oblique","Ayuthaya","Baghdad","Bangla MN","Bangla Sangam MN","Baskerville","Beirut","Big Caslon Medium","Bodoni 72","Bodoni 72 Oldstyle","Bodoni 72 Smallcaps","Bodoni Ornaments","Bradley Hand","Brush Script MT","Chalkboard","Chalkboard SE","Chalkduster","Charter","Charter Black","Cochin","Comic Sans MS","Copperplate","Corsiva Hebrew","Courier","Courier New","DIN Alternate","DIN Condensed","Damascus","DecoType Naskh","Devanagari MT","Devanagari Sangam MN","Didot","Diwan Kufi","Diwan Thuluth","Euphemia UCAS","Farah","Farisi","Futura","GB18030 Bitmap","Galvji","Geeza Pro","Geneva","Georgia","Gill Sans","Gujarati MT","Gujarati Sangam MN","Gurmukhi MN","Gurmukhi MT","Gurmukhi Sangam MN","Heiti SC","Heiti TC","Helvetica","Helvetica Neue","Hiragino Maru Gothic ProN","Hiragino Maru Gothic ProN W4","Hiragino Mincho ProN","Hiragino Mincho ProN W3","Hiragino Mincho ProN W6","Hiragino Sans","Hiragino Sans GB","Hiragino Sans GB W3","Hiragino Sans GB W6","Hiragino Sans W0","Hiragino Sans W1","Hiragino Sans W2","Hiragino Sans W3","Hiragino Sans W4","Hiragino Sans W5","Hiragino Sans W6","Hiragino Sans W7","Hiragino Sans W8","Hiragino Sans W9","Hoefler Text","Hoefler Text Ornaments","ITF Devanagari","ITF Devanagari Marathi","Impact","InaiMathi","Kailasa","Kannada MN","Kannada Sangam MN","Kefa","Khmer MN","Khmer Sangam MN","Kohinoor Bangla","Kohinoor Devanagari","Kohinoor Gujarati","Kohinoor Telugu","Kokonor","Krungthep","KufiStandardGK","Lao MN","Lao Sangam MN","Lucida Grande","Luminari","Malayalam MN","Malayalam Sangam MN","Marker Felt","Menlo","Microsoft Sans Serif","Mishafi","Mishafi Gold","Monaco","Mshtakan","Mukta Mahee","Muna","Myanmar MN","Myanmar Sangam MN","Nadeem","New Peninim MT","Noteworthy","Noto Nastaliq Urdu","Noto Sans Kannada","Noto Sans Myanmar","Noto Sans Oriya","Noto Serif Myanmar","Optima","Oriya MN","Oriya Sangam MN","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Palatino","Papyrus","Phosphate","PingFang HK","PingFang SC","PingFang TC","Plantagenet Cherokee","Raanana","Rockwell","STIXGeneral","STIXIntegralsD","STIXIntegralsSm","STIXIntegralsUp","STIXIntegralsUpD","STIXIntegralsUpSm","STIXNonUnicode","STIXSizeFiveSym","STIXSizeFourSym","STIXSizeOneSym","STIXSizeThreeSym","STIXSizeTwoSym","STIXVariants","STSong","Sana","Sathu","Savoye LET","Shree Devanagari 714","SignPainter","SignPainter-HouseScript","Silom","Sinhala MN","Sinhala Sangam MN","Skia","Snell Roundhand","Songti SC","Songti TC","Sukhumvit Set","Symbol","Tahoma","Tamil MN","Tamil Sangam MN","Telugu MN","Telugu Sangam MN","Thonburi","Times","Times New Roman","Trattatello","Trebuchet MS","Verdana","Waseem","Webdings","Wingdings","Wingdings 2","Wingdings 3","Zapf Dingbats","Zapfino",],
	windows: [
		// ?
		"AlternateGothic2 BT",
		// 7
		"Arial","Arial Black","Arial Narrow","Calibri","Cambria Math","Candara","Comic Sans MS","Consolas","Constantia",
		"Corbel","Courier New","Ebrima","Gabriola","Georgia","Impact","Lucida Console","Lucida Sans Unicode","MS Gothic",
		"MS PGothic","MV Boli","Malgun Gothic","Marlett","Microsoft Himalaya","Microsoft JhengHei","Microsoft New Tai Lue",
		"Microsoft PhagsPa","Microsoft Sans Serif","Microsoft Tai Le","Microsoft YaHei","Microsoft Yi Baiti","MingLiU-ExtB",
		"MingLiU_HKSCS-ExtB","Mongolian Baiti","NSimSun","PMingLiU-ExtB","Palatino Linotype","Segoe Print","Segoe Script",
		"Segoe UI","Segoe UI Light","Segoe UI Semibold","SimSun","Sylfaen","Symbol","Tahoma","Times New Roman","Trebuchet MS",
		"Verdana","Webdings","Wingdings",
		// 8
		"Calibri Light", // = Calibri but optional on win7
		"Calibri Light Italic","Microsoft JhengHei UI","Microsoft YaHei UI","Myanmar Text","Segoe UI Semilight",
		// 8.1
		"Javanese Text","Sitka Banner","Yu Gothic","Yu Gothic Light",
		// 10
		"Bahnschrift","Bahnschrift Light","Bahnschrift SemiBold","Bahnschrift SemiLight",
		"HoloLens MDL2 Assets","Yu Gothic Medium",
		// always
		"MS Shell Dlg","MS Shell Dlg \\32 ", // these can vary between window versions
		// ignore: expected + dupe sizes
			//"Gadugi","Nirmala UI", // 8 = Segoe UI
			//"Leelawadee UI","Leelawadee UI Semilight","Nirmala UI Semilight","Segoe UI Black","Segoe UI Emoji", // 8.1 = Segoe UI
			//"Microsoft JhengHei Light", // 8.1 = Microsoft JhengHei
			//"Microsoft JhengHei UI Light", // 8.1 = Microsoft JhengHei UI
			//"Microsoft YaHei Light", // 8.1 = Microsoft YaHei
			//"Microsoft YaHei UI Light", // 8.1 = Microsoft YaHei UI
			//"Sitka Display","Sitka Heading","Sitka Small","Sitka Subheading","Sitka Text", // = sitka banner (all 8.1)
			//"Candara Light", // 10 = Candara
			//"Corbel Light", // 10 = Corbel
			//"Malgun Gothic Semilight", // 10 = Malgun Gothic
			//"Segoe UI Historic","Yu Gothic UI" // 10 = Segoe UI
			//"Segoe MDL2 Assets", // = HoloLens MDL2 Assets (both 10)
			//"Yu Gothic UI Light", // = Yu Gothic UI (both 10)
			//"Yu Gothic UI Semilight", // 10 = Segoe UI Semilight
			//"Yu Gothic UI Semibold", // 10 = Segoe UI Semibold
			//"SimSun-ExtB", // = MS Gothic
			//"MS UI Gothic", // = MS PGothic
			//"Segoe UI Symbol", // = Segoe UI
			//"Cambria", // = cambria math
			//"Helvetica","Small Fonts" // = Arial (which we catch if not in fonts, in bases)
			//"Courier", //  = courier new
			//"MS Serif","Roman","Times", // = TNR
			//"MS Sans Serif", // = Microsoft Sans Serif
	],
}
let fntTB = {
	android: [],
	linux: [
		// TB linux only uses 134 bundled (140 files incl Twemoji Mozilla): set by FontConfig
			// but we can't have an empty test. plus we want to grab some size entropy
			// ToDo: check we include any valid widget/system-ui font names: e.g. Ubuntu, Noto Sans, Inter, etc
			// ToDo: reduce entropy in size buckets
		"Arimo","Cousine","STIX Math","Tinos","Twemoji Mozilla",
		"Noto Naskh Arabic",
		"Noto Sans Adlam","Noto Sans Armenian","Noto Sans Balinese","Noto Sans Bamum","Noto Sans Bassa Vah","Noto Sans Batak","Noto Sans Bengali","Noto Sans Buginese","Noto Sans Buhid","Noto Sans Canadian Aboriginal","Noto Sans Chakma","Noto Sans Cham","Noto Sans Cherokee","Noto Sans Coptic","Noto Sans Deseret","Noto Sans Devanagari","Noto Sans Elbasan","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Grantha","Noto Sans Gujarati","Noto Sans Gunjala Gondi","Noto Sans Gurmukhi","Noto Sans Hanifi Rohingya","Noto Sans Hanunoo","Noto Sans Hebrew","Noto Sans Javanese","Noto Sans JP","Noto Sans Kannada","Noto Sans Kayah Li","Noto Sans Khmer","Noto Sans Khojki","Noto Sans Khudawadi","Noto Sans KR","Noto Sans Lao","Noto Sans Lepcha","Noto Sans Limbu","Noto Sans Lisu","Noto Sans Mahajani","Noto Sans Malayalam","Noto Sans Mandaic","Noto Sans Masaram Gondi","Noto Sans Medefaidrin","Noto Sans Meetei Mayek","Noto Sans Mende Kikakui","Noto Sans Miao","Noto Sans Modi","Noto Sans Mongolian","Noto Sans Mro","Noto Sans Multani","Noto Sans Myanmar","Noto Sans Newa","Noto Sans New Tai Lue","Noto Sans NKo","Noto Sans Ol Chiki","Noto Sans Oriya","Noto Sans Osage","Noto Sans Osmanya","Noto Sans Pahawh Hmong","Noto Sans Pau Cin Hau","Noto Sans Rejang","Noto Sans Runic","Noto Sans Samaritan","Noto Sans Saurashtra","Noto Sans SC","Noto Sans Sharada","Noto Sans Shavian","Noto Sans Sinhala","Noto Sans Sora Sompeng","Noto Sans Soyombo","Noto Sans Sundanese","Noto Sans Syloti Nagri","Noto Sans Symbols2","Noto Sans Symbols","Noto Sans Syriac","Noto Sans Tagalog","Noto Sans Tagbanwa","Noto Sans Tai Le","Noto Sans Tai Tham","Noto Sans Tai Viet","Noto Sans Takri","Noto Sans Tamil","Noto Sans TC","Noto Sans Telugu","Noto Sans Thaana","Noto Sans Thai","Noto Sans Tifinagh Adrar","Noto Sans Tifinagh Agraw Imazighen","Noto Sans Tifinagh Ahaggar","Noto Sans Tifinagh Air","Noto Sans Tifinagh APT","Noto Sans Tifinagh Azawagh","Noto Sans Tifinagh Ghat","Noto Sans Tifinagh Hawad","Noto Sans Tifinagh","Noto Sans Tifinagh Rhissa Ixa","Noto Sans Tifinagh SIL","Noto Sans Tifinagh Tawellemmet","Noto Sans Tirhuta","Noto Sans Vai","Noto Sans Wancho","Noto Sans Warang Citi","Noto Sans Yi","Noto Sans Zanabazar Square",
		"Noto Serif Armenian","Noto Serif Balinese","Noto Serif Bengali","Noto Serif Devanagari","Noto Serif Dogra","Noto Serif Ethiopic","Noto Serif Georgian","Noto Serif Grantha","Noto Serif Gujarati","Noto Serif Gurmukhi","Noto Serif Hebrew","Noto Serif Kannada","Noto Serif Khmer","Noto Serif Khojki","Noto Serif Lao","Noto Serif Malayalam","Noto Serif Myanmar","Noto Serif Hmong Nyiakeng","Noto Serif Sinhala","Noto Serif Tamil","Noto Serif Telugu","Noto Serif Thai","Noto Serif Tibetan","Noto Serif Yezidi",
	],
	mac: [
		// ESR102 current whitelist minus 123 bundled
		"AppleGothic","Apple Color Emoji","Arial","Arial Black","Arial Narrow","Courier","Geneva","Georgia",
		"Heiti TC","Helvetica","Helvetica Neue", ".Helvetica Neue DeskInterface","Hiragino Kaku Gothic ProN",
		"Hiragino Kaku Gothic ProN W3","Hiragino Kaku Gothic ProN W6","Kailasa","Lucida Grande","Menlo",
		"Monaco","STHeiti","Tahoma","Thonburi","Times","Times New Roman","Verdana",
	],
	windows: [
		// ESR102 current whitelist
		// 7
		"Arial","Arial Black","Arial Narrow","Cambria Math","Consolas","Courier New","Georgia","Lucida Console",
		"MS Gothic","MS PGothic","MV Boli","Malgun Gothic","Mangal","Microsoft Himalaya","Microsoft JhengHei",
		"Microsoft YaHei","MingLiU","PMingLiU","Segoe UI","Segoe UI Light","Segoe UI Semibold","SimSun","Sylfaen",
		"Tahoma","Times New Roman","Verdana",
		// 8
		"Microsoft JhengHei UI","Microsoft YaHei UI","Segoe UI Semilight",
		// 8.1
		"Segoe UI Black", // = Segoe UI: but keep an 8.1 font
		// 10
		"Malgun Gothic Semilight", // = Malgun Gothic: but keep a win10 font
		// aliases: different size
			"細明體", // MingLiU
			"新細明體", // PMingLiU
			"宋体", // SimSun
		// always
		"MS Shell Dlg","MS Shell Dlg \\32 ", // these can vary between window versions
		// ignore: expected + dupe sizes
			//"Microsoft JhengHei UI Light", // 8.1 = Microsoft JhengHei UI
			//"Microsoft YaHei Light", // 8.1 = Microsoft Yahei
			//"Microsoft YaHei UI Light", // 8.1 = Microsoft YaHei UI
			//"微软雅黑", // Microsoft YaHei
			//"ＭＳ ゴシック", // MS Gothic
			//"ＭＳ Ｐゴシック", // MS PGothic
			//"Helvetica","Small Fonts" // = Arial (which we catch if not in fonts, in bases)
			//"Courier", //  = courier new
			//"MS Serif","Roman","Times", // = TNR
		// of 121 bundled: 53 unique sizes
		"Noto Naskh Arabic","Noto Sans","Noto Sans Adlam","Noto Sans Balinese","Noto Sans Bengali","Noto Sans Chakma","Noto Sans Cham","Noto Sans Elbasan","Noto Sans Georgian","Noto Sans Grantha","Noto Sans Gunjala Gondi","Noto Sans Javanese","Noto Sans Kannada","Noto Sans Khojki","Noto Sans Khudawadi","Noto Sans Lao","Noto Sans Lepcha","Noto Sans Mahajani","Noto Sans Malayalam","Noto Sans Mandaic","Noto Sans Masaram Gondi","Noto Sans Meetei Mayek","Noto Sans Mende Kikakui","Noto Sans Miao","Noto Sans Modi","Noto Sans Mongolian","Noto Sans Myanmar","Noto Sans Newa","Noto Sans Sharada","Noto Sans Sinhala","Noto Sans Soyombo","Noto Sans Sundanese","Noto Sans Symbols","Noto Sans Symbols2","Noto Sans Syriac","Noto Sans Tai Tham","Noto Sans Takri","Noto Sans Thaana","Noto Sans Tirhuta","Noto Sans Wancho","Noto Sans Warang Citi","Noto Sans Zanabazar Square","Noto Serif","Noto Serif Balinese","Noto Serif Bengali","Noto Serif Devanagari","Noto Serif Gujarati","Noto Serif Kannada","Noto Serif Lao","Noto Serif Myanmar","Noto Serif Tamil","Noto Serif Tibetan"
	],
}

function set_fntList() {

	// page load: fntMaster & fntMasterBase once
	if (gLoad) {
		// set baseMaster first three items
		let baseMaster = ['monospace','sans-serif','serif']
		if (isOS == "mac") {
			baseMaster = ['monospace, Menlo, Courier, \"Courier New\", Monaco',
				'sans-serif',
				'serif'
			]
		} else if (isOS == "windows") {
			baseMaster = [
				'monospace, Consolas, Courier, \"Courier New\", \"Lucida Console\"',
				'sans-serif, Arial',
				'serif, Times, Roman'
			]
		}
		// set baseFonts: either single system font or baseMaster first three with or without fallback fonts
		if (isPlatformFont !== undefined) {
			// use a system font that cannot be blocked that almost every font differs from
				// notes: e.g.windows: drops some expected fonts: Tahoma (all), Webdings (FF61 or lower), Wingdings (FF98 or lower)
			baseFonts = [isPlatformFont]
		} else {
			baseFonts = baseMaster
		}
		// expand baseMaster
			//'ui-monospace','ui-rounded','ui-serif','math','emoji' // redundant in FF/blink // perf
			//'none' // redundant: it will always equal default proportional font
		baseMaster = baseMaster.concat(['cursive','fantasy','fangsong','system-ui'])
		// set baseFontsNames
			// baseFonts w/o potential fallback fonts e.g. "sans-serif, Arial" -> "sans-serif"
			// used to create arrays in objects etc
		baseFontsNames = [], 
		baseFonts.forEach(function(name) {
			baseFontsNames.push(name.split(",")[0])
		})
		// add systemfonts to baseMaster + dedupe
		baseMaster = baseMaster.concat(aSystemFont)
		// set baseFontsFull
			// baseFonts + topped up baseMaster
		baseFontsFull = baseFonts // exact match to font tests
		let baseOther = baseMaster.filter(x => !baseFontsNames.includes(x)) // don't double up on generic families
		baseFontsFull = baseFontsFull.concat(baseOther)
		baseFontsFull.sort()
		/*
		console.debug("names", baseFontsNames)
		console.debug(" base", baseFonts)
		console.debug(" full", baseFontsFull)
		//*/

		if (isOS !== "") {
			fntFake = "--00"+ rnd_string() + " poison pill"
			for (const k of Object.keys(fntMaster)) {
				// master
				let array = fntBase[k].concat(fntOther[k])
				if (isOS == k) {
					array.push(fntFake) // + fake
					if (isPlatformFont !== undefined) { // - self
						array = array.filter(x => ![isPlatformFont].includes(x))
					}
				}
				array.sort()
				array = array.filter(function(item, position) {return array.indexOf(item) === position})
				fntMaster[k] = array
				// masterbase
				if (isTB) {
					array = fntTB[k]
				} else {
					array = fntBase[k]
				}
				if (isOS == k) {
					array.push(fntFake)
					if (isPlatformFont !== undefined) {
						array = array.filter(x => ![isPlatformFont].includes(x))
					}
				}
				array.sort()
				array = array.filter(function(item, position) {return array.indexOf(item) === position})
				fntMasterBase[k] = array
			}
		}
	}

	// bail
	if (isOS == "") {
		dom.fontFB = zNA
		return
	}

	// isBaseFonts
	if (isRFP && isVer > 79 && !isTB) {
		if (isOS == "windows" || isOS == "mac") {isBaseFonts = true}
	} else if (isTB) {
		if (isOS !== "android") {isBaseFonts = true}
	}

	// global: re-populate sDetail[]
	if (gRun) {
		fontBtns = ""
		for (const k of Object.keys(fntMaster)) {
			let array = fntMaster[k]
			let str = "fonts_main_"+ k + "_list_notglobal"
			sDetail[str] = array
			fontBtns += buildButton("12", str, (k == isOS ? array.length +" " : "") + k)
		}
	}
	// set fntList
	if (isBaseFonts) {
		fntList = fntMasterBase[isOS]
		fntList.sort()
		let strB = "fonts_"+ (isTB ? "tb_whitelist_" : "base_" ) + isOS +"_list_notglobal"
		sDetail[strB] = fntList
		fontBaseBtn = buildButton("12", strB, fntList.length + (isTB ? " mini-list" : " base fonts"))
	} else {
		fntList = fntMaster[isOS]
	}
}

function set_fallback_string() {
	// only ever done once
	return new Promise(resolve => {
		let strA = "",
		list = ['0x0000','0x0080','0x0100','0x0180','0x0250','0x02B0','0x0300','0x0370','0x0400','0x0500','0x0530',
		'0x0590','0x0600','0x0700','0x0750','0x0780','0x07C0','0x0800','0x0840','0x08A0','0x0900','0x0980','0x0A00',
		'0x0A80','0x0B00','0x0B80','0x0C00','0x0C80','0x0D00','0x0D80','0x0E00','0x0E80','0x0F00','0x1000','0x10A0',
		'0x1100','0x1200','0x1380','0x13A0','0x1400','0x1680','0x16A0','0x1700','0x1720','0x1740','0x1760','0x1780',
		'0x1800','0x18B0','0x1900','0x1950','0x1980','0x19E0','0x1A00','0x1A20','0x1AB0','0x1B00','0x1B80','0x1BC0',
		'0x1C00','0x1C50','0x1CC0','0x1CD0','0x1D00','0x1D80','0x1DC0','0x1E00','0x1F00','0x2000','0x2070','0x20A0',
		'0x20D0','0x2100','0x2150','0x2190','0x2200','0x2300','0x2400','0x2440','0x2460','0x2500','0x2580','0x25A0',
		'0x2600','0x2700','0x27C0','0x27F0','0x2800','0x2900','0x2980','0x2A00','0x2B00','0x2C00','0x2C60','0x2C80',
		'0x2D00','0x2D30','0x2D80','0x2DE0','0x2E00','0x2E80','0x2F00','0x2FF0','0x3000','0x3040','0x30A0','0x3100',
		'0x3130','0x3190','0x31A0','0x31C0','0x31F0','0x3200','0x3300','0x3400','0x4DC0','0x4E00','0xA000','0xA490',
		'0xA4D0','0xA500','0xA640','0xA6A0','0xA700','0xA720','0xA800','0xA830','0xA840','0xA880','0xA8E0','0xA900',
		'0xA930','0xA960','0xA980','0xA9E0','0xAA00','0xAA60','0xAA80','0xAAE0','0xAB00','0xAB30','0xAB70','0xABC0',
		'0xAC00','0xD7B0','0xD800','0xDB80','0xDC00','0xE000','0xF900','0xFB00','0xFB50','0xFE00','0xFE10','0xFE20',
		'0xFE30','0xFE50','0xFE70','0xFF00','0xFFF0','0x10000','0x10080','0x10100','0x10140','0x10190','0x101D0',
		'0x10280','0x102A0','0x102E0','0x10300','0x10330','0x10350','0x10380','0x103A0','0x10400','0x10450','0x10480',
		'0x10500','0x10530','0x10600','0x10800','0x10840','0x10860','0x10880','0x108E0','0x10900','0x10920','0x10980',
		'0x109A0','0x10A00','0x10A60','0x10A80','0x10AC0','0x10B00','0x10B40','0x10B60','0x10B80','0x10C00','0x10C80',
		'0x10E60','0x11000','0x11080','0x110D0','0x11100','0x11150','0x11180','0x111E0','0x11200','0x11280','0x112B0',
		'0x11300','0x11480','0x11580','0x11600','0x11680','0x11700','0x118A0','0x11AC0','0x12000','0x12400','0x12480',
		'0x13000','0x14400','0x16800','0x16A40','0x16AD0','0x16B00','0x16F00','0x1B000','0x1BC00','0x1BCA0','0x1D000',
		'0x1D100','0x1D200','0x1D300','0x1D360','0x1D400','0x1D800','0x1E800','0x1EE00','0x1F000','0x1F030','0x1F0A0',
		'0x1F100','0x1F200','0x1F300','0x1F600','0x1F650','0x1F680','0x1F700','0x1F780','0x1F800','0x1F900','0x20000',
		'0x2A700','0x2B740','0x2B820','0x2F800','0xE0000','0xE0100','0xF0000','0x100000']

		let ZWNJ = String.fromCodePoint("0x200C") +" "
		// why are we joining spans with line beaks? arthur did it to display a list

		// [43] dcf
		let aCharsA = []
		for (let i=0; i < fntCode.length; i++) {
			aCharsA.push("<span>"+ String.fromCodePoint(fntCode[i]) + ZWNJ +"</span>")
		}
		// [1] fpjs2 // do we need this?
		aCharsA.push("<span>"+ fntStrA +"</span>")

		// [262] arthur : takes a while
		let getCodePoints = function* () {
			let codePoints = list
				.map(s => s.trim())
				.filter(s => s.length > 0)
				.map(x => parseInt(x))
				.map(x => x + 1)
			codePoints[0] = 77
			return codePoints
		}
		if (fntStrB.length == 0) {
			spawn(function* () {
				let codePoints = yield getCodePoints()
				fntStrB = "<span>"+ codePoints.map(x => String.fromCodePoint(x)).join(ZWNJ +"</span>\n<span>") + ZWNJ +"</span>"
				// combine
				fntStrB += "\n"+ aCharsA.join("\n")
				//console.debug(fntStrB)
				return resolve()
			})
		}
	})
}

const getFonts = () => {
	/* https://github.com/abrahamjuliot/creepjs */
	return new Promise(resolve => {
		try {
			if (runSE) {abc = def}
			const doc = document // or iframe.contentWindow.document
			const id = `font-fingerprint`
			const div = doc.createElement('div')
			div.setAttribute('id', id)
			doc.body.appendChild(div)
			doc.getElementById(id).innerHTML = `
				<style>
				#${id}-detector {
					--font: '';
					position: absolute !important;
					left: -9999px!important;
					font-size: 256px !important;
					font-style: normal !important;
					font-weight: normal !important;
					letter-spacing: normal !important;
					line-break: auto !important;
					line-height: normal !important;
					text-transform: none !important;
					text-align: left !important;
					text-decoration: none !important;
					text-shadow: none !important;
					white-space: normal !important;
					word-break: normal !important;
					word-spacing: normal !important;
					/* in order to test scrollWidth, clientWidth, etc. */
					padding: 0 !important;
					margin: 0 !important;
					/* in order to test inlineSize and blockSize */
					writing-mode: horizontal-tb !important;
					/* for transform and perspective */
					transform-origin: unset !important;
					perspective-origin: unset !important;
				}
				#${id}-detector::after {
					font-family: var(--font);
					content: '`+ fntStrA +`';
				}
				</style>
				<span id="${id}-detector"></span>`

			const span = doc.getElementById(`${id}-detector`)
			const pixelsToInt = pixels => Math.round(+pixels.replace('px',''))
			const pixelsToNumber = pixels => +pixels.replace('px','')
			const originPixelsToInt = pixels => Math.round(2*pixels.replace('px', ''))
			const originPixelsToNumber = pixels => 2*pixels.replace('px', '')
			const detectedViaPixel = new Set()
			const detectedViaPixelNumber = new Set()
			const detectedViaPixelSize = new Set()
			const detectedViaPixelSizeNumber = new Set()
			const detectedViaScroll = new Set()
			const detectedViaOffset = new Set()
			const detectedViaClient = new Set()
			const detectedViaTransform = new Set()
			const detectedViaTransformNumber = new Set()
			const detectedViaPerspective = new Set()
			const detectedViaPerspectiveNumber = new Set()
			const style = getComputedStyle(span)

			const getDimensions = (span, style) => {
				const transform = style.transformOrigin.split(' ')
				const perspective = style.perspectiveOrigin.split(' ')
				const dimensions = {
					// keep in sorted order for base objects
					// + Math.floor(Math.random() * 10), //
					clientHeight: span.clientHeight,
					clientWidth: span.clientWidth,
					nperspectiveHeight: originPixelsToNumber(perspective[1]),
					nperspectiveWidth: originPixelsToNumber(perspective[0]),
					npixelHeight: pixelsToNumber(style.height),
					npixelWidth: pixelsToNumber(style.width),
					npixelsizeHeight: pixelsToNumber(style.blockSize),
					npixelsizeWidth: pixelsToNumber(style.inlineSize),
					ntransformHeight: originPixelsToNumber(transform[1]),
					ntransformWidth: originPixelsToNumber(transform[0]),
					offsetHeight: span.offsetHeight,
					offsetWidth: span.offsetWidth,
					perspectiveHeight: originPixelsToInt(perspective[1]),
					perspectiveWidth: originPixelsToInt(perspective[0]),
					pixelHeight: pixelsToInt(style.height),
					pixelWidth: pixelsToInt(style.width),
					pixelsizeHeight: pixelsToInt(style.blockSize),
					pixelsizeWidth: pixelsToInt(style.inlineSize),
					scrollHeight: span.scrollHeight,
					scrollWidth: span.scrollWidth,
					transformHeight: originPixelsToInt(transform[1]),
					transformWidth: originPixelsToInt(transform[0]),
				}
				return dimensions
			}

			// base [default] sizes
			const base = baseFontsFull.reduce((acc, font) => {
				if (aSystemFont.includes(font)) { // not a family
					span.style.setProperty('--font', "")
					span.style.font = font
				} else {
					span.style.font = ""
					span.style.setProperty('--font', font)
				}
				const dimensions = getDimensions(span, style)
				acc[font.split(",")[0]] = dimensions // use only generic name: w/o fallback fonts i.e not "sans-serif, Arial"
				return acc
			}, {})
			// tidy base
			sDetail["fonts_fontsizes_base"] = {}
			let oTempBase = {}
			for (const k of Object.keys(base)) {
				let tmpHash = mini(base[k], "fontsizes base "+ k)
				if (oTempBase[tmpHash] == undefined) {
					oTempBase[tmpHash] = {"bases" : [k], "data" : base[k]}
				} else {
					oTempBase[tmpHash]["bases"].push(k)
				}
			}
			for (const h of Object.keys(oTempBase).sort()) {
				sDetail["fonts_fontsizes_base"][h] = oTempBase[h]
			}
			// return if not doing font sizes
			if (fntList.length == 0 || fontDocEnabled == false) {
				return resolve("baseonly")
			}

			// typeof: don't let each !typeof affect other methods
			let aTests = [
				["client", detectedViaClient],
				["offset", detectedViaOffset],
				["npixel", detectedViaPixelNumber],
				["npixelsize", detectedViaPixelSizeNumber],
				["nperspective", detectedViaPerspectiveNumber],
				["ntransform", detectedViaTransformNumber],
				["pixel", detectedViaPixel],
				["pixelsize", detectedViaPixelSize],
				["perspective", detectedViaPerspective],
				["scroll", detectedViaScroll],
				["transform", detectedViaTransform],
			]
			let aTestsValid = []
			aTests.forEach(function(pair) {
				let wName = pair[0] +"Width", hName = pair[0] +"Height"
				// we need a base object: we'll always have monospace
				let baseObj = "monospace"
				let wType = typeof base[baseObj][wName], hType = typeof base[baseObj][hName]
				// only test valid typeof
				if ("number" == wType && "number" == hType) {
					if (base[baseObj][wName] < 1 || base[baseObj][hName] < 1) {
						pair[1].clear()
						pair[1].add("zero dimensions")
					} else {
						aTestsValid.push(pair)
					}
				} else {
					// otherwise, change the Set to a typeof mismatch
					let xName = ("number" !== wType ? wName : hName)
					let xValue = base[baseObj][xName]
					let xType = typeof base[baseObj][xName]
					let xReturn
					if (xValue === "") { xReturn = "empty string"
					} else if (undefined === xValue) {xReturn = "undefined"
					} else if (null === xValue) {xReturn = "null"
					} else if ("object" === xType) {xReturn = "object"
					} else if ("boolean" === xType) {xReturn = "boolean"
					} else if ("string" === xType) {
						if (!Number.isNaN(xValue * 1)) {xReturn = "NaN"} else {xReturn = "string"}
					} else {xReturn = cleanFn(xValue) +""
					}
					pair[1].clear()
					pair[1].add("mismatch:"+ xReturn)
				}
			})

			span.style.font = "" // reset from system fonts
			// measure
			if (aTestsValid.length) {
				let isDetected = false, intDetected = 0, intDetectedMax = aTestsValid.length
				
				fntList.forEach(font => {
					isDetected = false // have we found it
					intDetected = 0 // in all valid methods
					baseFonts.forEach(basefont => {
						if (isDetected) {
							return
						}
						intDetected = 0 // reset per basefont tested
						const family = "'"+ font +"', "+ basefont	
						span.style.setProperty('--font', family)
						const style = getComputedStyle(span)
						const dimensions = getDimensions(span, style)
						basefont = basefont.split(",")[0] // switch to short generic name
						aTestsValid.forEach(function(pair) {
							let wName = pair[0] +"Width", hName = pair[0] +"Height"
							if (dimensions[wName] != base[basefont][wName] || dimensions[hName] != base[basefont][hName]) {
								pair[1].add(font +":"+ basefont +":"+ dimensions[wName] +" x "+ dimensions[hName])
								intDetected++
							}
						})
						if (intDetected == intDetectedMax) {isDetected = true}
						//isDetected = false // force 3 full checks if no platformfont
						return
					})
				})
			}

			// tidy lies: none/all
			aTests.forEach(function(pair) {
				if (pair[1].length == 0) {
					pair[1].clear()
					pair[1].add("none")
				} else if (pair[1].length == fntList.length) {
					pair[1].clear()
					pair[1].add("all") // includes poison pill
				}
			})

			const fontsScroll = [...detectedViaScroll]
			const fontsOffset = [...detectedViaOffset]
			const fontsClient = [...detectedViaClient]
			const fontsPixel = [...detectedViaPixel]
			const fontsPixelSize = [...detectedViaPixelSize]
			const fontsPerspective = [...detectedViaPerspective]
			const fontsTransform = [...detectedViaTransform]
			const fontsPixelNumber = [...detectedViaPixelNumber]
			const fontsPixelSizeNumber = [...detectedViaPixelSizeNumber]
			const fontsPerspectiveNumber = [...detectedViaPerspectiveNumber]
			const fontsTransformNumber = [...detectedViaTransformNumber]

			return resolve({
				// match display order
				fontsOffset,
				fontsClient,
				fontsScroll,
				fontsPixel,
				fontsPixelSize,
				fontsPerspective,
				fontsTransform,
				fontsPixelNumber,
				fontsPixelSizeNumber,
				fontsPerspectiveNumber,
				fontsTransformNumber,
			})
		} catch(e) {
			// TypeError: document.fonts.values() is not iterable
			let eMsg = log_error("fonts: fontsizes", e.name, e.message)
			return resolve(eMsg)
		}
	})
}

function get_fonts() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}

		// functions
		function get_baseHash(isMismatch) {
			let baseHash = zB0, baseBtn = "", bName = "fonts_fontsizes_base"
			try {
				if (Object.keys(sDetail[bName]).length) {
					baseHash = mini_sha1(sDetail[bName], "fontsizes base")
					if (isMismatch) {
						sDetail[bName +"_fake_skip"] = sDetail[bName]; delete sDetail[bName]
						bName += isMismatch ? "_fake_skip" : ""
					}
					baseBtn = buildButton("12", bName)
				}
			} catch(e) {}
			if (isMismatch) {baseHash = soL + baseHash + scC}
			dom.fontBase.innerHTML = baseHash + baseBtn
			return isMismatch ? zLIE : baseHash
		}
		function exit(value) {
			dom.fontNames = value; dom.fontSizes = value; dom.fontBase = value
			let baseReturn = (value == zNA ? get_baseHash(false) : value )
			log_perf("fontsizes [fonts]",t0)
			return resolve(
				["fontsizes:"+ value, "fontsizes_base:"+ baseReturn]
			)
		}
		// clear
		let sNames = ['fontsScroll','fontsOffset','fontsClient','fontsPixel','fontsPixelSize','fontsPerspective','fontsTransform']
		sDetail["fonts_fontsizes"] = []
		sDetail["fonts_fontnames_notglobal"] = []
		sNames.forEach(function(name) {sDetail["fonts_fontsizes_"+ name + "_reported_notglobal"] = []})

		// run
		getFonts().then(res => {
			// remove element
			try {document.getElementById("font-fingerprint").remove()} catch(e) {}
			// quick exits
			if (res == "baseonly") {exit(zNA); return
			} else if ("string" === typeof res) {exit(zErr); return}

			let oData = {}, aIgnore = [], isMismatch = false
			let ignoreList = [zNS, "none", "all", "zero dimensions"]
			if (typeof res === "object" && res !== null) {
				for (let name in res) {
					let data = res[name], hash = "unknown"
					// note: do not sort: these are "fontnames:size" and fntList was already sorted
					if (data.length == 0) {
						aIgnore.push(name +":"+ hash)
					} else if (ignoreList.includes(data[0])) {
						hash = data[0]
						aIgnore.push(name +":"+ hash)
					} else if (data.length == 1 && data[0].split(":")[0] == "mismatch") {
						hash = data[0].split(":")[1]
						aIgnore.push(name +":"+ hash)
						isMismatch = true
					} else {
						// group by hash
						hash = mini(data.join(), "fontsizes "+ name)
						if (oData[hash] == undefined) {
							oData[hash] = {}
							oData[hash]["names"] = []
						}
						oData[hash]["names"].push(name)
						if (oData[hash]["rawdata"] == undefined) {
							oData[hash]["rawdata"] = data
						}
					}
				}
			}
			// baseReturn
			let baseReturn = get_baseHash(isMismatch)

			// collect size buckets, font names
				// handle mutiple sizes per font: e.g. monospace, serif
			let firstBaseFont = baseFontsNames[0]
			for (const k of Object.keys(oData)) {
				let aOriginal = oData[k]["rawdata"]
				let aFontNames = []
				let oSizes = {}
				aOriginal.forEach(function(item) {
					let font = item.split(":")[0],
						basefont = item.split(":")[1],
						size = item.split(":")[2]
					aFontNames.push(font)
					let fontitem = (basefont == firstBaseFont ? font : font +" "+ basefont) // remove noise
					if (oSizes[size] == undefined) {oSizes[size] = []}
					// don't add baseFont variants if already added
					// e.g. "2426 x 330": [ "LilyUPC", "LilyUPC sans-serif", "LilyUPC serif" ]
					if (!oSizes[size].includes(font)) {
						oSizes[size].push(fontitem)
					}
				})
				// sort
				let aNew = {}
				for (const j of Object.keys(oSizes).sort()) {aNew[j] = oSizes[j]}
				// replace
				oData[k]["newdata"] = aNew
				oData[k]["hash"] = mini_sha1(aNew, "fontsizes "+ k)
				// add fontnames
				aFontNames = aFontNames.filter(function(item, position) {return aFontNames.indexOf(item) === position})
				oData[k]["fontnames"] = aFontNames
			}
			//console.log(oData)
			//console.log(aIgnore)

			// TEMP OUTPUT
			let sizeReturn = "TBA"
			aIgnore.forEach(function(item) {
				let el = item.split(":")[0],
					value = item.split(":")[1]
				document.getElementById(el).innerHTML = value
			})
			for (const k of Object.keys(oData)) {
				// TEMP output
				let aList = oData[k]["names"]
				for (let i=0; i < aList.length; i++) {
					let btn = ""
					if (i == 0) {
						let tmpName = "fonts_fontsizes_"+ aList[i] +"_reported_notglobal"
						sDetail[tmpName] = oData[k]["newdata"]
						btn = buildButton("12", tmpName)
					}
					document.getElementById(aList[i]).innerHTML = oData[k]["hash"] + btn
					if (aList[i] == "fontsTransformNumber") {
						// names
						let tmpName = "fonts_fontnames_notglobal"
						sDetail[tmpName] = oData[k]["fontnames"]
						let fontNameHash = mini_sha1(sDetail[tmpName].join(), "fontnames")
						let fontNameBtn = buildButton("12", tmpName, sDetail[tmpName].length)
						dom.fontNames.innerHTML = fontNameHash + fontNameBtn + (isBaseFonts ? " from"+ fontBaseBtn : "")
						// sizes
						tmpName = "fonts_fontsizes"
						sDetail[tmpName] = oData[k]["newdata"]
						sizeReturn = oData[k]["hash"]
						let lenReturn = Object.keys(oData[k]["newdata"]).length
						dom.fontSizes.innerHTML = sizeReturn + buildButton("12", tmpName, lenReturn)
					}
				}
			}
			log_perf("fontsizes [fonts]",t0)
			return resolve(["fontsizes:"+ sizeReturn, "fontsizes_base:"+ baseReturn])
		})
	})
}

const spawn = (function() {
	/* arthur's spawn code */
	let promiseFromGenerator
	// returns true if aValue is a generator object
	let isGenerator = aValue => {
		return Object.prototype.toString.call(aValue) === "[object Generator]"
	}
	// converts right-hand argument of yield or return
	// values to a promise, according to Task.jsm semantics
	let asPromise = yieldArgument => {
		if (yieldArgument instanceof Promise) {
			return yieldArgument
		} else if (isGenerator(yieldArgument)) {
			return promiseFromGenerator(yieldArgument)
		} else if (yieldArgument instanceof Function) {
			return asPromise(yieldArgument())
		} else if (yieldArgument instanceof Error) {
			return Promise.reject(yieldArgument)
		} else if (yieldArgument instanceof Array) {
			return Promise.all(yieldArgument.map(asPromise))
		} else {
			return Promise.resolve(yieldArgument)
		}
	}
	// takes a generator object, runs it as an asynchronous task,
	// returning a promise with the result of that task
	promiseFromGenerator = generator => {
		return new Promise((resolve, reject) => {
			let processPromise
			let processPromiseResult = (success, result) => {
				try {
					let {value, done} = success ? generator.next(result) : generator.throw(result)
					if (done) {
						asPromise(value).then(resolve, reject)
					} else {
						processPromise(asPromise(value))
					}
				} catch (error) {
					reject(error)
				}
			}
			processPromise = promise => {
				promise.then(result => processPromiseResult(true, result),
					error => processPromiseResult(false, error))
			}
			processPromise(asPromise(undefined))
		})
	}
	// __spawn(generatorFunction)__
	return generatorFunction => promiseFromGenerator(generatorFunction())
})()

function get_fallback(list) {
	// list passed for priming run
	/* https://github.com/arthuredelstein/tordemos */
	try {
		let t0; if (canPerf) {t0 = performance.now()}
		sDetail["fonts_fontnames_fallback"] = []
		sDetail["fonts_fontnames_diff_notglobal"] = []
		let width0 = null,
			t = dom.fontFBTest
		// measure
		let measure = function(font) {
			t.style.fontSize = "256px"
			t.style.fontStyle = "normal"
			t.style.fontWeight = "normal"
			t.style.letterSpacing = "normal"
			t.style.lineBreak = "auto"
			t.style.lineHeight = "normal"
			t.style.textTransform = "none"
			t.style.textAlign = "left"
			t.style.textShadow = "none"
			t.style.wordSpacing = "normal"
			t.style.fontFamily = font
			return t.offsetWidth
		}
		// compare
		let present = function(font) {
			width0 = width0 || measure("fontFallback")
			let width1 = measure("'"+ font +"', fontFallback")
			return width0 !== width1
		}
		// detect
		let found = []
		let enumerate = function(possible) {
			for (let font of possible) {if (present(font)) {found.push(font)}}
		}
		// run
		fontFBTest.innerHTML = fntStrB
		enumerate(list)
		dom.fontFBTest = ""
		// output based on second result
		if (list.length > 2) {
			sDetail["fonts_fontnames_fallback"] = found
			// diffs
			let fontDiffBtn = ""
			try {
				if (sDetail["fonts_fontnames_notglobal"].length && found.length) {
					let fntNames = sDetail["fonts_fontnames_notglobal"]
					let fntNew = found.filter(x => !fntNames.includes(x))
					let fntMissing = fntNames.filter(x => !found.includes(x))
					let fntDiff = []
					if (fntNew.length) {fntDiff.push("new:" + fntNew.join(", "))}
					if (fntMissing.length) {fntDiff.push("missing:" + fntMissing.join(", "))}
					if (fntDiff.length) {
						sDetail["fonts_fontnames_diff_notglobal"] = fntDiff
						fontDiffBtn = buildButton("12", "fonts_fontnames_diff_notglobal", "diff")
					}
				}
			} catch(e) {}
			dom.fontFB.innerHTML = mini_sha1(found.join()) + buildButton("12", "fonts_fontnames_fallback", found.length)
				+ (isBaseFonts ? " from"+ fontBaseBtn : "") + fontDiffBtn
			// perf
			log_click("font fallback",t0)
			gClick = true
		}
	} catch(e) {
		// TypeError: document.fonts.values() is not iterable
		gClick = true
		return zB0
	}
}

function get_formats() {
	// FF105+: layout.css.font-tech.enabled
	return new Promise(resolve => {
		let res = []
		let oList = {
		"font-format": ["collection", "opentype", "truetype", "embeddedopentype", "svg", "woff", "woff2"],
		"font-tech": ["color-cbdt","color-colrv0","color-colrv1","color-svg","color-sbix",
			"features-aat","features-graphite","features-opentype","incremental","palettes","variations"]
		}
		for (const k of Object.keys(oList)) {
			sDetail["fonts_"+ k] = []
			let array = oList[k]
			let tmpRes = []
			try {
				if (runSE) {abc = def}
				array.forEach(function(item) {
					if (CSS.supports(k + "("+ item + ")")) {
						tmpRes.push(item)
					}
				})
				if (tmpRes.length) {
					sDetail["fonts_"+ k] = tmpRes
					let hash = mini_sha1(tmpRes, k)
					let btn = buildButton("12", "fonts_"+ k, tmpRes.length)
					document.getElementById(k).innerHTML = hash + btn
					res.push(k +":"+ hash)
				} else {
					// not supported
					document.getElementById(k).innerHTML = zNS
					res.push(k +":"+ zNS)
				}
			} catch(e) {
				document.getElementById(k).innerHTML = log_error("fonts: "+ k, e.name, e.message)
				res.push(k +":"+ zErr)
			}
		}
		return resolve(res)
	})
}

function get_system_fonts() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let aResults = [],
			sName = "fonts_system_fonts",
			aFonts = ["caption","icon","menu","message-box","small-caption","status-bar"],
			mFonts = [
				"-moz-window", "-moz-desktop", "-moz-document", "-moz-workspace", "-moz-info",
				"-moz-pull-down-menu", "-moz-dialog", "-moz-button", "-moz-list", "-moz-field",
			]
		sDetail[sName] = []
		if (isFF) {aFonts = aFonts.concat(mFonts)}
		let propList = ['font-family', 'font-size', 'font-style', 'font-weight']
		try {
			if (runSE) {abc = def}
			let el = dom.sysFont
			aFonts.forEach(function(font){
				let aData = []
				el.style.font = font
				for (const prop of propList) {
					aData.push(getComputedStyle(el)[prop])
				}
				aResults.push(font +":" + aData.join(", "))
			})
		} catch(e) {
			dom.fontsSystem = log_error("fonts: system_fonts:", e.name, e.message)
			return resolve("system_fonts:"+ zErr)
		}
		// output
		let display = "none", value = "none"
		if (aResults.length) {
			sDetail[sName] = aResults
			value = mini_sha1(aResults.join(), "fonts system")
			display = value + buildButton("12", sName)
		}
		dom.fontsSystem.innerHTML = display
		log_perf("system [fonts]",t0)
		return resolve("system_fonts:"+ value)
	})
}

function get_widget_fonts() {
	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let list = ['button','checkbox','color','combobox','radio','text','datetime','datetime-local','textarea',]
		let sName = "fonts_widget_fonts"
		sDetail[sName] = []
		try {
			if (runSE) {abc = def}
			let res = []
			for (let i=0; i < list.length; i++) {
				let el = document.getElementById("widget"+ i)
				let font = getComputedStyle(el).getPropertyValue("font-family")
				let size = getComputedStyle(el).getPropertyValue("font-size")
				res.push(list[i] +": "+ font +", "+ size)
			}
			let hash = mini_sha1(res.join(), "fonts widget")
			sDetail[sName] = res
			let btn = buildButton("12", sName)
			dom.fontsWidget.innerHTML = hash + btn
			log_perf("widget [fonts]",t0)
			return resolve("widget_fonts:"+ hash)
		} catch(e) {
			dom.fontsWidget = log_error("fonts: widgets:", e.name, e.message)
			log_perf("widget [fonts]",t0)
			return resolve("widget_fonts:"+ zErr)
		}
	})
}

function get_unicode() {
	/* code based on work by David Fifield (dcf) and Serge Egelman (2015)
		https://www.bamsoftware.com/talks/fc15-fontfp/fontfp.html#demo */
	// FF86+ 1676966: gfx.font_rendering.fallback.async
		// prime code chars directly in HTML to force fallback ASAP

	return new Promise(resolve => {
		let t0; if (canPerf) {t0 = performance.now()}
		let styles = ["cursive","fangsong","fantasy","monospace","sans-serif","serif","system-ui"]
		// we do not need "none": this is default style + font per style for each language
			// and is already present in covering monospace/sans-serif/serif
		if (isFF) {
			// some styles may match: we should detect those and remove redundant
				// e.g. if system-ui (FF92+) is not enabled = same as none = redundant
			if (isVer < 92) {styles = styles.filter(x => !["system-ui"].includes(x))}
				// fantasy vs sans-serif adds very little in gecko (at least on windows 7)
				// fangsong vs serif adds very little in gecko (at least on windows 7)
			styles = styles.filter(x => !["fangsong","fantasy"].includes(x))
		}
		styles.sort()
		let oUnique = {} // unique size per char: i.e does a style bring anything to the table

		function group(name, data) {
			// group by style then char
				// when measuring, looping style then char was a 25% perf hit
			let newobj = {}
			styles.forEach(function(style) {
				newobj[style] = []
			})
			if (name == "offset" || name == "clientrect") {
				// width + height
				data.forEach(function(item) {
					newobj[item[0]].push([item[1], item[2], item[3]]) // width + height
				})
			} else {
				// width only
				data.forEach(function(item) {
					if (oTM[name]["all"]) {
						newobj[item[0]].push([item[1], item[2]])
					} else {
						newobj[item[0]] = item[1]
					}
				})
			}
			/*
			// get unique sizes per char
			if (name == "offset" || name == "clientrect" || oTM[name]["all"] == true) {
				let charobj = {}
				fntCodeUsed.forEach(function(code) {
					charobj[code] = {}
				})
				data.forEach(function(item) {
					let measure = (name == "offset" || name == "clientrect") ? item[2] +"x"+ item[3] : item[2] +""
					let code = item[1]
					if (charobj[code][measure] == undefined) {charobj[code][measure] = []}
					charobj[code][measure].push(item[0])
				})
				// now check how unique a style is
				styles.forEach(function(style) {
					let tmpUnique = []
					fntCodeUsed.forEach(function(code) {
						for (const size of Object.keys(charobj[code])) {
							let stylestring = charobj[code][size].join()
							if (stylestring == style) {
								tmpUnique.push(code)
							}
						}
					})
					if (tmpUnique.length) {
						if (oUnique[style] == undefined) {oUnique[style] = {}}
						oUnique[style][name] = tmpUnique
					}
				})
			}
			//*/
			return newobj
		}

		function output() {
			let res = []
			let aList = [["offset", aOffset], ["clientrect", aClient]]
			for (const n of Object.keys(oTM)) {	aList.push([n])}

			let errCanvas = oCatch["canvas"]
			aList.forEach(function(array) {
				let name = array[0]
				let data = array[1] == undefined ? oTM[name]["data"] : array[1]
				let sName = "", btn = "", display = "", value = ""
				let errCheck = oCatch[name], typeofCheck = oTypeOf[name]
				if (name !== "offset" && name !== "clientrect" && errCanvas !== undefined) {
					// textmetrics
					display = errCanvas
					value = zErr
					if (!TextMetrics.prototype.hasOwnProperty(name)) {
						display = zNS
						value = zNS
					}
				} else if (errCheck !== undefined) {
					display = errCheck
					value = zErr
				} else if (typeofCheck !== undefined) {
					display = "typeof mismatch: "+ typeofCheck
					value = zLIE
					if (isTZPSmart) {
						display = soL + display + scC
						if (gRun) {
							gKnown.push("fonts: glyphs "+ name)
							gMethods.push("fonts: glyphs "+ name +": typeof :"+ typeofCheck)
						}
					}
				} else if (data.length) {
					data.sort()
					let newobj = group(name, data)
					sName = "fonts gylphs "+ name
					btn = buildButton("12", sName)
					display = mini_sha1(newobj, sName)
					value = display
					sDetail[sName] = newobj
				} else {
					// empty object
					if (name !== "offset" && name !== "clientrect") {
						if (!TextMetrics.prototype.hasOwnProperty(name)) {
							display = zNS
							value = zNS
						}
					}
				}
				// ToDo: compare measuretext width to clientrect width + show red/green [match]
				res.push("glyphs_"+ name +":"+ value)
				document.getElementById("ug"+ name).innerHTML = display + btn
			})
			// style uniqueness
			if (Object.keys(oUnique).length) { console.log(oUnique) }
			// perf
			//console.log((performance.now() - t0) +" ms")
			log_perf("unicode glyphs [fonts]",t0)
			return resolve(res)
		}
		// reset
		sDetail["fonts gylphs offset"] = []
		sDetail["fonts gylphs clientrect"] = []
		// vars
		let oCatch = {}, oTypeOf = {}
		let aOffset = [], aClient = []
		let isClient = true, isOffset = true, isCanvas = true
		let oTM = {
			"width": {},
			"actualBoundingBoxAscent": {},
			"actualBoundingBoxDescent": {},
			"actualBoundingBoxLeft": {},
			"actualBoundingBoxRight": {},
			"alphabeticBaseline": {},
			"emHeightAscent": {},
			"emHeightDescent": {},
			"fontBoundingBoxAscent": {},
			"fontBoundingBoxDescent": {},
			"hangingBaseline": {},
			"ideographicBaseline": {},
		}
		let aAll = [
			"width", "actualBoundingBoxAscent", "actualBoundingBoxDescent",
			"actualBoundingBoxLeft", "actualBoundingBoxRight"
		]
		for (const k of Object.keys(oTM)) {
			oTM[k]["data"] = []
			oTM[k]["proceed"] = TextMetrics.prototype.hasOwnProperty(k)
			sDetail["fonts gylphs " + k] = []
			oTM[k]["all"] = aAll.includes(k)
		}

		function run() {
			let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot,
				canvas = dom.ugCanvas, ctx = canvas.getContext("2d")
			// each char
			fntCodeUsed.forEach(function(code) {
				// set char once
				let	codeString = String.fromCodePoint(code)
				slot.textContent = codeString
				let isFirst = code == fntCodeUsed[0]
				// each style
				styles.forEach(function(stylename) {
					slot.style.fontFamily = stylename
					// offset: span width + div height
					if (isOffset) {
						try {
							if (runSE) {abc = def}
							let oWidth = span.offsetWidth,
								oHeight = div.offsetHeight
							if ("number" === typeof oWidth && "number" === typeof oHeight) {
								aOffset.push([stylename, code, oWidth, oHeight])
							} else {
								isOffset = false // stop checking
								oTypeOf["offset"] = typeof oWidth +" x "+ typeof oHeight
							}
						} catch(e) {
							oCatch["offset"] = log_error("fonts: glyphs offset", e.name, e.message)
							isOffset = false
						}
					}
					// clientrect
					// ToDo: isClientRect: we only need one valid method
					if (isClient) {
						try {
							if (runSE) {abc = def}
							let cDiv = div.getBoundingClientRect()
							let cSpan = span.getBoundingClientRect()
							let cWidth = cSpan.width,
								cHeight = cDiv.height
							if ("number" === typeof cWidth && "number" === typeof cHeight) {
								aClient.push([stylename, code, cWidth, cHeight])
							} else {
								isClient = false // stop checking
								oTypeOf["clientrect"] = typeof cWidth +" x "+ typeof cHeight
							}
						} catch(e) {
							oCatch["clientrect"] = log_error("fonts: glyphs clientrect", e.name, e.message)
							isClient = false
						}
					}
					// canvas
					if (isCanvas) {
						try {
							ctx.font = "normal normal 22000px "+ stylename
							if (runSE) {abc = def}
							let tm = ctx.measureText(codeString)
							// textmetrics
							for (const k of Object.keys(oTM)) {
								if (oTM[k]["proceed"]) {
									try {
										let isOnce = oTM[k]["all"] == false && isFirst
										if (oTM[k]["all"] || isOnce) {
											let measure = tm[k]
											if ("number" === typeof measure) {
												if (isOnce) {
													oTM[k]["data"].push([stylename, measure])
												} else {
													oTM[k]["data"].push([stylename, code, measure])
												}
											} else {
												oTM[k]["proceed"] = false // stop checking
												oTypeOf[k] = typeof measure
											}
										}
									} catch(e) {
										oCatch[k] = log_error("fonts: glyphs "+ k, e.name, e.message)
										oTM[k]["proceed"] = false
									}
								}
							}
						} catch(e) {
							oCatch["canvas"] = log_error("fonts: glyphs canvas", e.name, e.message)
							isCanvas = false
						}
					}
				})
			})
			dom.ugSlot = ""
			output()
		}

		let fntCodeUsed = fntCode
		function filter_tofu() {
			// skip FF android and TB: very little tofu
			if (isFF && isOS == "android" || isTB) {
				return // not worth it
			}
			try {
				let fntTofu = [], fntTofuChars = []
				let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot
				slot.style.fontFamily = "none"
				slot.textContent = String.fromCodePoint('0xFFFF')
				let tofuWidth = span.offsetWidth,
					tofuHeight = div.offsetHeight
				fntCode.forEach(function(code) {
					slot.textContent = String.fromCodePoint(code)
					if (span.offsetWidth == tofuWidth && div.offsetHeight == tofuHeight) {
						fntTofu.push(code)
						fntTofuChars.push(String.fromCodePoint(code))
					}
				})
				fntCodeUsed = fntCode.filter(x => !fntTofu.includes(x))
				if (gRun) {
					log_debug("tofu", fntTofu.join(" "))
					log_debug("tofu", fntTofuChars.join(" "))
				}
			} catch(e) {}
		}
		filter_tofu()
		fntCodeUsed.push('0xFFFF') // ensure one tofu
		run()
	})
}

function get_woff2() {
	// https://github.com/filamentgroup/woff2-feature-test
	return new Promise(resolve => {
		try {
			const supportsWoff2 = (function(){
				//abc = def
				const font = new FontFace('t', 'url("data:font/woff2;base64,d09GMgABAAAAAADwAAoAAAAAAiQAAACoAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAALAogOAE2AiQDBgsGAAQgBSAHIBuDAciO1EZ3I/mL5/+5/rfPnTt9/9Qa8H4cUUZxaRbh36LiKJoVh61XGzw6ufkpoeZBW4KphwFYIJGHB4LAY4hby++gW+6N1EN94I49v86yCpUdYgqeZrOWN34CMQg2tAmthdli0eePIwAKNIIRS4AGZFzdX9lbBUAQlm//f262/61o8PlYO/D1/X4FrWFFgdCQD9DpGJSxmFyjOAGUU4P0qigcNb82GAAA") format("woff2")', {});
				font.load().catch(err => {
					// NetworkError: A network error occurred. < woff2 disabled/downloadable | fonts blocked e.g. uBO
					// ReferenceError: FontFace is not defined < layout.css.font-loading-api.enabled
					// ToDo: FontFace API is blocked
					dom.fontWoff2 = log_error("fonts: woff2", err.name, err.message)
				})
				return font.status == "loaded" || font.status == "loading"
			})()
			let value = (supportsWoff2 ? zS : zF)
			dom.fontWoff2 = value
			return resolve("woff2:"+ value)
		} catch(e) {
			dom.fontWoff2 = log_error("fonts: woff2", e.name, e.message)
			return resolve("woff2:"+ zErr)
		}
	})
}

function outputFontsFB() {
	if (isFF && isOS !== "") {
		if (gClick) {
			gClick = false
			gRun = false
			dom.fontFB.innerHTML = "&nbsp"
			get_isRFP()
			set_fntList()
			if (fntList.length == 0) {
				dom.fontFB = zNA
				gClick = true
				return
			} else if (fntStrB.length == 0) {
				// we set fntStrB once, only when needed
				Promise.all([
					set_fallback_string()
				]).then(function(results){
					run()
				})
			} else {
				run()
			}
			//
			function run() {
				Promise.all([
					get_fallback(['orange','banana']) // primer
				]).then(function(results){
					if (results[0] == zB0) {
						// cleanup
						dom.fontFBTest = ""
						dom.fontFB = zB0
					} else {
						dom.fontFB = "test is running... please wait"
						// we need a delay from the primer run if
						// browser.display.use_document_fonts = 0 (blocked)
						function run_main() {
							clearInterval(checking)
							get_fallback(fntList)
						}
						let checking = setInterval(run_main, 25)
					}
				})
			}
		}
	}
}

function outputFonts() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = [], r = ""

	set_fntList() // 3-5ms

	// proportional
	r = window.getComputedStyle(document.body,null).getPropertyValue("font-family")
	dom.fontFCprop = r
	section.push("proportional:"+ r)
	// sizes
	dom.df1 = fntStrA
	dom.df2 = fntStrA
	let el = dom.df1
	r = "serif/sans-serif, "+ getComputedStyle(el).getPropertyValue("font-size")
	el = dom.df2
	r += " | monospace, "+ getComputedStyle(el).getPropertyValue("font-size")
	dom.fontFCsize = r
	section.push("sizes:"+ r)	
	// css font loading
	r = ("FontFace" in window ? zE : zD)
	dom.fontCSS = r
	section.push("font_loading:"+ r)

	// doc fonts
	try {
		el = dom.divDocFont
		let font = getComputedStyle(el).getPropertyValue("font-family").slice(1,16)
		fontDocEnabled = (font == "Times New Roman" ? true : false)
		r = (fontDocEnabled ? zE : zD)
		dom.fontDoc = r
		section.push("document_fonts:"+ r)
	} catch(e) {
		fontDocEnabled = false
		dom.fontDoc = log_error("fonts: doc fonts", e.name, e.message)
		section.push("document_fonts:"+ zErr)
	}

	Promise.all([
		get_unicode(),
		get_formats(),
		get_system_fonts(),
		get_widget_fonts(),
		get_fonts(),
		get_woff2(),
	]).then(function(results){
		results.forEach(function(currentResult) {
			if (Array.isArray(currentResult)) {
				currentResult.forEach(function(item) {
					section.push(item)
				})
			} else {
				section.push(currentResult)
			}
			dom.fontBtns.innerHTML = fontBtns
		})
		log_section("fonts", t0, section)
	})
}

countJS("fonts")
