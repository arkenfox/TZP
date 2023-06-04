'use strict';

let fntCodePoints = {
	"test": [ // sorted
		'0x007F','0x0218','0x058F','0x05C6','0x061C','0x0700','0x08E4','0x097F','0x09B3',
		'0x0B82','0x0D02','0x10A0','0x115A','0x17DD','0x1950','0x1C50','0x1CDA','0x1D790',
		'0x1E9E','0x20B0','0x20B8','0x20B9','0x20BA','0x20BD','0x20E3','0x21E4','0x23AE',
		'0x2425','0x2581','0x2619','0x2B06','0x2C7B','0x302E','0x3095','0x532D','0xA73D',
		'0xA830','0xF003','0xF810','0xFBEE','0xFFF9','0xFFFD',
	],
	"tofu": ['0xFFFF'],
	"tbwindows": ["0x0374"], // or "0x0375": +1 more size: not worth it
}

let fntCodes = [],
	fntList = [],
	fntUsed = {},
	fntSize = "512px",
	fntString = "Mōá?-" + get_fntCodes("tofu"),
	fntFake = "",
	fntBtn = "",
	fntDocEnabled = false,
	baseFonts = [], // what we test fntList against
	baseFontsNames = [], // baseFonts w/out fallback fonts (used to create object keys etc)
	baseFontsFull = [] // merged baseFonts + baseMaster

let fntMaster = {
	// TB bundled: reuse for android/linux
	"bundled": {
		"all": [ // 118 win/mac/linux
			"Noto Sans Adlam","Noto Sans Balinese","Noto Sans Bamum","Noto Sans Bassa Vah","Noto Sans Batak","Noto Sans Bengali","Noto Sans Buginese","Noto Sans Buhid","Noto Sans Canadian Aboriginal","Noto Sans Chakma","Noto Sans Cham","Noto Sans Cherokee","Noto Sans Coptic","Noto Sans Deseret","Noto Sans Devanagari","Noto Sans Elbasan","Noto Sans Ethiopic","Noto Sans Georgian","Noto Sans Grantha","Noto Sans Gujarati","Noto Sans Gunjala Gondi","Noto Sans Gurmukhi","Noto Sans Hanifi Rohingya","Noto Sans Hanunoo","Noto Sans Javanese","Noto Sans Kannada","Noto Sans Kayah Li","Noto Sans Khmer","Noto Sans Khojki","Noto Sans Khudawadi","Noto Sans Lao","Noto Sans Lepcha","Noto Sans Limbu","Noto Sans Lisu","Noto Sans Mahajani","Noto Sans Malayalam","Noto Sans Mandaic","Noto Sans Masaram Gondi","Noto Sans Medefaidrin","Noto Sans Meetei Mayek","Noto Sans Mende Kikakui","Noto Sans Miao","Noto Sans Modi","Noto Sans Mongolian","Noto Sans Mro","Noto Sans Multani","Noto Sans Myanmar","Noto Sans NKo","Noto Sans New Tai Lue","Noto Sans Newa","Noto Sans Ol Chiki","Noto Sans Oriya","Noto Sans Osage","Noto Sans Osmanya","Noto Sans Pahawh Hmong","Noto Sans Pau Cin Hau","Noto Sans Rejang","Noto Sans Runic","Noto Sans Samaritan","Noto Sans Saurashtra","Noto Sans Sharada","Noto Sans Shavian","Noto Sans Sinhala","Noto Sans Sora Sompeng","Noto Sans Soyombo","Noto Sans Sundanese","Noto Sans Syloti Nagri","Noto Sans Symbols","Noto Sans Symbols2","Noto Sans Syriac","Noto Sans Tagalog","Noto Sans Tagbanwa","Noto Sans Tai Le","Noto Sans Tai Tham","Noto Sans Tai Viet","Noto Sans Takri","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Thaana","Noto Sans Tifinagh","Noto Sans Tifinagh APT","Noto Sans Tifinagh Adrar","Noto Sans Tifinagh Agraw Imazighen","Noto Sans Tifinagh Ahaggar","Noto Sans Tifinagh Air","Noto Sans Tifinagh Azawagh","Noto Sans Tifinagh Ghat","Noto Sans Tifinagh Hawad","Noto Sans Tifinagh Rhissa Ixa","Noto Sans Tifinagh SIL","Noto Sans Tifinagh Tawellemmet","Noto Sans Tirhuta","Noto Sans Vai","Noto Sans Wancho","Noto Sans Warang Citi","Noto Sans Yi","Noto Sans Zanabazar Square","Noto Serif Balinese","Noto Serif Bengali","Noto Serif Devanagari","Noto Serif Dogra","Noto Serif Ethiopic","Noto Serif Georgian","Noto Serif Grantha","Noto Serif Gujarati","Noto Serif Gurmukhi","Noto Serif Hmong Nyiakeng","Noto Serif Kannada","Noto Serif Khmer","Noto Serif Khojki","Noto Serif Lao","Noto Serif Malayalam","Noto Serif Myanmar","Noto Serif Sinhala","Noto Serif Tamil","Noto Serif Telugu","Noto Serif Tibetan","Noto Serif Yezidi",
		],
		"android": [],
		"linux": [ // +16
			"Arimo","Cousine","Noto Naskh Arabic","Noto Sans Armenian","Noto Sans Hebrew","Noto Sans JP","Noto Sans KR","Noto Sans SC","Noto Sans TC","Noto Sans Thai","Noto Serif Armenian","Noto Serif Hebrew","Noto Serif Thai","STIX Math","Tinos","Twemoji Mozilla",
		],
		"mac": [ // +5
			"Noto Sans Armenian","Noto Sans Hebrew","Noto Serif Armenian","Noto Serif Hebrew","STIX Math",
		],
		"windows": [ // +4
			"Noto Naskh Arabic","Noto Sans","Noto Serif","Twemoji Mozilla",
		],
	},
	// TB whitelist system
	"allowlist": {
		"android": [],
		"linux": [],
		"mac": [
			"AppleGothic","Apple Color Emoji","Arial","Arial Black","Arial Narrow","Courier","Courier New",
			"Geneva","Georgia","Heiti TC","Helvetica","Helvetica Neue",".Helvetica Neue DeskInterface",
			"Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic ProN W3","Hiragino Kaku Gothic ProN W6",
			"Kailasa","Lucida Grande","Menlo","Monaco","PingFang HK","PingFang SC","PingFang TC",
			"Songti SC","Songti TC","Tahoma","Thonburi","Times","Times New Roman","Verdana",
			// always
			"-apple-system",
		],
		"windows": [
			// 7
			"Arial","Cambria Math","Consolas","Courier New","Georgia","Lucida Console","MS Gothic",
			"MS PGothic","MV Boli","Malgun Gothic","Microsoft Himalaya","Microsoft JhengHei",
			"Microsoft YaHei","Segoe UI","SimSun","Sylfaen","Tahoma","Times New Roman","Verdana",
			// variants: not whitelisted but font-family
			"Arial Black","Arial Narrow","Segoe UI Light","Segoe UI Semibold", // 7
			"Segoe UI Semilight", // 8
			"Microsoft JhengHei Light","Microsoft YaHei Light","Segoe UI Black", // 8.1
			"Malgun Gothic Semilight", // 10
			// aliases
			"宋体","微软雅黑","ＭＳ ゴシック","ＭＳ Ｐゴシック",
			// always
			"MS Shell Dlg","MS Shell Dlg \\32",
			/* ignore: expected + dupe sizes
				"Helvetica","Small Fonts","Courier","MS Serif","Roman","Times"
			//*/
		],
	},
	// TB unexpected system: from kBaseFonts
	"blocklist": {
		"android": [],
		"linux": [
			// https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41644
			'Arial','Courier','Courier New',
			'Noto Color Emoji','Noto Emoji','Noto Mono','Noto Sans','Noto Serif', // notos
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX', // fedora
			'Dingbats','FreeMono','Ubuntu', // ubuntu
			'Liberation Mono','Liberation Sans','Liberation Serif', // popular
		],
		"mac": ["Apple Symbols","Avenir","Charter","Impact","Palatino","Rockwell",],
		"windows": ["Calibri","Candara","Corbel","Impact","Ebrima","Gabriola",],
	},
	// kBaseFonts: https://searchfox.org/mozilla-central/search?path=StandardFonts*.inc
	"base": {
		"android": [],
		"linux": [],
		"mac": [
			// ToDo: check names e.g. STIXGeneral !== STIX General
			"Al Bayan","Al Nile","Al Tarikh","American Typewriter","Andale Mono","Apple Braille","Apple Chancery","Apple Color Emoji","Apple SD Gothic Neo","Apple Symbols","AppleGothic","AppleMyungjo","Arial","Arial Black","Arial Hebrew","Arial Hebrew Scholar","Arial Narrow","Arial Rounded MT Bold","Arial Unicode MS","Avenir","Avenir Black","Avenir Black Oblique","Avenir Book","Avenir Heavy","Avenir Light","Avenir Medium","Avenir Next","Avenir Next Demi Bold","Avenir Next Heavy","Avenir Next Medium","Avenir Next Ultra Light","Avenir Oblique","Ayuthaya","Baghdad","Bangla MN","Bangla Sangam MN","Baskerville","Beirut","Big Caslon Medium","Bodoni 72","Bodoni 72 Oldstyle","Bodoni 72 Smallcaps","Bodoni Ornaments","Bradley Hand","Brush Script MT","Chalkboard","Chalkboard SE","Chalkduster","Charter","Charter Black","Cochin","Comic Sans MS","Copperplate","Corsiva Hebrew","Courier","Courier New","DIN Alternate","DIN Condensed","Damascus","DecoType Naskh","Devanagari MT","Devanagari Sangam MN","Didot","Diwan Kufi","Diwan Thuluth","Euphemia UCAS","Farah","Farisi","Futura","GB18030 Bitmap","Galvji","Geeza Pro","Geneva","Georgia","Gill Sans","Gujarati MT","Gujarati Sangam MN","Gurmukhi MN","Gurmukhi MT","Gurmukhi Sangam MN","Heiti SC","Heiti TC","Helvetica","Helvetica Neue","Hiragino Maru Gothic ProN","Hiragino Maru Gothic ProN W4","Hiragino Mincho ProN","Hiragino Mincho ProN W3","Hiragino Mincho ProN W6","Hiragino Sans","Hiragino Sans GB","Hiragino Sans GB W3","Hiragino Sans GB W6","Hiragino Sans W0","Hiragino Sans W1","Hiragino Sans W2","Hiragino Sans W3","Hiragino Sans W4","Hiragino Sans W5","Hiragino Sans W6","Hiragino Sans W7","Hiragino Sans W8","Hiragino Sans W9","Hoefler Text","Hoefler Text Ornaments","ITF Devanagari","ITF Devanagari Marathi","Impact","InaiMathi","Kailasa","Kannada MN","Kannada Sangam MN","Kefa","Khmer MN","Khmer Sangam MN","Kohinoor Bangla","Kohinoor Devanagari","Kohinoor Gujarati","Kohinoor Telugu","Kokonor","Krungthep","KufiStandardGK","Lao MN","Lao Sangam MN","Lucida Grande","Luminari","Malayalam MN","Malayalam Sangam MN","Marker Felt","Menlo","Microsoft Sans Serif","Mishafi","Mishafi Gold","Monaco","Mshtakan","Mukta Mahee","Muna","Myanmar MN","Myanmar Sangam MN","Nadeem","New Peninim MT","Noteworthy",
			"Noto Nastaliq Urdu",
			"Noto Sans Adlam","Noto Sans Armenian","Noto Sans Avestan","Noto Sans Bamum","Noto Sans Bassa Vah","Noto Sans Batak","Noto Sans Bhaiksuki","Noto Sans Brahmi","Noto Sans Buginese","Noto Sans Buhid","Noto Sans Canadian Aboriginal","Noto Sans Carian","Noto Sans Caucasian Albanian","Noto Sans Chakma","Noto Sans Cham","Noto Sans Coptic","Noto Sans Cuneiform","Noto Sans Cypriot","Noto Sans Duployan","Noto Sans Egyptian Hieroglyphs","Noto Sans Elbasan","Noto Sans Glagolitic","Noto Sans Gothic","Noto Sans Gunjala Gondi","Noto Sans Hanifi Rohingya","Noto Sans Hanunoo","Noto Sans Hatran","Noto Sans Imperial Aramaic","Noto Sans Inscriptional Pahlavi","Noto Sans Inscriptional Parthian","Noto Sans Javanese","Noto Sans Kaithi","Noto Sans Kannada","Noto Sans Kayah Li","Noto Sans Kharoshthi","Noto Sans Khojki","Noto Sans Khudawadi","Noto Sans Lepcha","Noto Sans Limbu","Noto Sans Linear A","Noto Sans Linear B","Noto Sans Lisu","Noto Sans Lycian","Noto Sans Lydian","Noto Sans Mahajani","Noto Sans Mandaic","Noto Sans Manichaean","Noto Sans Marchen","Noto Sans Masaram Gondi","Noto Sans Meetei Mayek","Noto Sans Mende Kikakui","Noto Sans Meroitic","Noto Sans Miao","Noto Sans Modi","Noto Sans Mongolian","Noto Sans Mro","Noto Sans Multani","Noto Sans Myanmar","Noto Sans Nabataean","Noto Sans New Tai Lue","Noto Sans Newa","Noto Sans NKo","Noto Sans Ol Chiki","Noto Sans Old Hungarian","Noto Sans Old Italic","Noto Sans Old North Arabian","Noto Sans Old Permic","Noto Sans Old Persian","Noto Sans Old South Arabian","Noto Sans Old Turkic","Noto Sans Oriya","Noto Sans Osage","Noto Sans Osmanya","Noto Sans Pahawh Hmong","Noto Sans Palmyrene","Noto Sans Pau Cin Hau","Noto Sans PhagsPa","Noto Sans Phoenician","Noto Sans Psalter Pahlavi","Noto Sans Rejang","Noto Sans Samaritan","Noto Sans Saurashtra","Noto Sans Sharada","Noto Sans Siddham","Noto Sans Sora Sompeng","Noto Sans Sundanese","Noto Sans Syloti Nagri","Noto Sans Syriac","Noto Sans Tagalog","Noto Sans Tagbanwa","Noto Sans Tai Le","Noto Sans Tai Tham","Noto Sans Tai Viet","Noto Sans Takri","Noto Sans Thaana","Noto Sans Tifinagh","Noto Sans Tirhuta","Noto Sans Ugaritic","Noto Sans Vai","Noto Sans Wancho","Noto Sans Warang Citi","Noto Sans Yi","Noto Sans Zawgyi",
			"Noto Serif Ahom","Noto Serif Balinese","Noto Serif Hmong Nyiakeng","Noto Serif Myanmar","Noto Serif Yezidi",
			"Optima","Oriya MN","Oriya Sangam MN","PT Mono","PT Sans","PT Sans Caption","PT Sans Narrow","PT Serif","PT Serif Caption","Palatino","Papyrus","Phosphate","PingFang HK","PingFang SC","PingFang TC","Plantagenet Cherokee","Raanana","Rockwell","STIXGeneral","STIXIntegralsD","STIXIntegralsSm","STIXIntegralsUp","STIXIntegralsUpD","STIXIntegralsUpSm","STIXNonUnicode","STIXSizeFiveSym","STIXSizeFourSym","STIXSizeOneSym","STIXSizeThreeSym","STIXSizeTwoSym","STIXVariants","STSong","Sana","Sathu","Savoye LET","Shree Devanagari 714","SignPainter","SignPainter-HouseScript","Silom","Sinhala MN","Sinhala Sangam MN","Skia","Snell Roundhand","Songti SC","Songti TC","Sukhumvit Set","Symbol","Tahoma","Tamil MN","Tamil Sangam MN","Telugu MN","Telugu Sangam MN","Thonburi","Times","Times New Roman","Trattatello","Trebuchet MS","Verdana","Waseem","Webdings","Wingdings","Wingdings 2","Wingdings 3","Zapf Dingbats","Zapfino",
			// always
			"-apple-system",
		],
		"windows": [
			// ?
			"AlternateGothic2 BT",
			// 7
			"Arial","Arial Black","Arial Narrow","Calibri","Cambria Math","Candara","Comic Sans MS","Consolas","Constantia",
			"Corbel","Courier New","Ebrima","Gabriola","Georgia","Impact","Lucida Console","Lucida Sans Unicode","MS Gothic",
			"MS PGothic","MS UI Gothic","MV Boli","Malgun Gothic","Marlett","Microsoft Himalaya","Microsoft JhengHei",
			"Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Sans Serif","Microsoft Tai Le","Microsoft YaHei",
			"Microsoft Yi Baiti","MingLiU-ExtB","MingLiU_HKSCS-ExtB","Mongolian Baiti","NSimSun","PMingLiU-ExtB",
			"Palatino Linotype","Segoe Print","Segoe Script","Segoe UI","Segoe UI Light","Segoe UI Semibold","Segoe UI Symbol",
			"SimSun","SimSun-ExtB","Sylfaen","Symbol","Tahoma","Times New Roman","Trebuchet MS","Verdana","Webdings","Wingdings",
			// 8
			"Calibri Light", // = Calibri but optional on win7
			"Calibri Light Italic","Gadugi","Nirmala UI","Microsoft JhengHei UI","Microsoft YaHei UI","Myanmar Text","Segoe UI Semilight",
			// 8.1
			"Javanese Text","Leelawadee UI","Leelawadee UI Semilight","Microsoft JhengHei Light","Microsoft JhengHei UI Light",
			"Microsoft YaHei Light","Microsoft YaHei UI Light","Nirmala UI Semilight","Segoe UI Black","Segoe UI Emoji",
			"Sitka Banner","Sitka Display","Sitka Heading","Sitka Small","Sitka Subheading","Sitka Text","Yu Gothic","Yu Gothic Light",
			// 10
			"Bahnschrift","Candara Light","Corbel Light","HoloLens MDL2 Assets","Malgun Gothic Semilight","Segoe MDL2 Assets",
			"Segoe UI Historic","Yu Gothic Medium","Yu Gothic UI","Yu Gothic UI Light","Yu Gothic UI Semilight","Yu Gothic UI Semibold",
			// always
			"MS Shell Dlg","MS Shell Dlg \\32", // aliases can map differently between window versions
			//"Bahnschrift Light","Bahnschrift SemiBold","Bahnschrift SemiLight", // not detected: variants?
			/* ignore: expected + dupe sizes
				"Cambria", // Cambria Math
				"Courier", // Courier New
				"Helvetica","Small Fonts", // Arial (which we catch if not in fonts, in bases)
				"MS Sans Serif", // Microsoft Sans Serif
				"MS Serif","Roman","Times", // TNR
			//*/
		],
	},
	"system": {
		"android": [
			// we start with bundled[all] 118
			// + common
			'Droid Sans','Droid Sans Mono','Droid Serif','Roboto','Roboto Condensed',
			// + MOAR notos
			'Noto Color Emoji','Noto Emoji','Noto Kufi Arabic','Noto Mono','Noto Naskh Arabic','Noto Nastaliq Urdu','Noto Sans','Noto Sans Adlam Unjoined','Noto Sans Anatolian Hieroglyphs','Noto Sans Arabic','Noto Sans Armenian','Noto Sans Avestan','Noto Sans Brahmi','Noto Sans CJK JP','Noto Sans CJK KR','Noto Sans CJK SC','Noto Sans CJK TC','Noto Sans Carian','Noto Sans Cuneiform','Noto Sans Cypriot','Noto Sans Display','Noto Sans Egyptian Hieroglyphs','Noto Sans Glagolitic','Noto Sans Gothic','Noto Sans Hebrew','Noto Sans Imperial Aramaic','Noto Sans Inscriptional Pahlavi','Noto Sans Inscriptional Parthian','Noto Sans JP','Noto Sans KR','Noto Sans Kaithi','Noto Sans Kharoshthi','Noto Sans Linear B','Noto Sans Lycian','Noto Sans Lydian','Noto Sans Mono','Noto Sans Ogham','Noto Sans Old Italic','Noto Sans Old Persian','Noto Sans Old South Arabian','Noto Sans Old Turkic','Noto Sans Phags Pa','Noto Sans Phoenician','Noto Sans SC','Noto Sans Syriac Eastern','Noto Sans Syriac Estrangela','Noto Sans Syriac Western','Noto Sans TC','Noto Sans Thai','Noto Sans Tibetan','Noto Sans Ugaritic','Noto Serif','Noto Serif Armenian','Noto Serif CJK JP','Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC','Noto Serif Display','Noto Serif Hebrew','Noto Serif Thai',
		],
			"linux": [
			// we start with bundled[linux] 134
			// + always
			'Arial','Courier','Courier New',
			// + common notos
			'Noto Emoji','Noto Sans','Noto Serif','Noto Sans Tibetan',
			// + some selective kBase unique to ubuntu or fedora
				// notos
			'Noto Color Emoji','Noto Mono','Noto Serif CJK JP','Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC',
				// western/symbols
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX','STIX Two Math','STIX Two Text','Symbola', // fedora
			'Dingbats','FreeMono','Jamrul','Kinnari','Ubuntu', // ubuntu
				// scripts
				// ubuntu
			'KacstNaskh','PakType Naskh Basic', // arabic
			'Likhan','Mitra Mono','Mukti Narrow', // bengali
			'Chandas','Gargi','Kalimati','Nakula','Rachana','Sahadeva','Samanata','Sarai', // devangari
			'Rekha','Saab','Samyak Gujarati', // gujarati
			'Lohit Gurmukhi', // gurmukhi
			'Gubbi','Navilu', // kannada
			'Phetsarath OT', // lao
			'Chilanka','Dyuthi','Gayathri','Karumbi','Keraleeyam','Manjari','Suruma','Uroob', // malayalam
			'ori1Uni','utkal', // oriya
			'LKLUG','padmaa', // sinhala
			'Samyak Tamil', // tamil
			'Pothana2000','Vemana2000', // telugu
			'Laksaman','Norasi','Purisa','Tlwg Mono','Umpush', // thai
			'Jomolhari', // tibetan
			'Pagul','Rasa','Yrsa', // multiscript
				// fedora
			'Droid Arabic Kufi', // arabic
			'Droid Sans Devanagari', // devangari
			'Droid Sans Ethiopic', // ethiopic
			'Droid Sans Hebrew', // hebrew
			'Droid Sans Japanese', // jap
			'Khmer OS', // khmer
			'Droid Sans Tamil', // tamil
			'Droid Sans Thai', // thai
			'Nuosu SIL', // yi
				// other
			'Liberation Mono','Liberation Sans','Liberation Serif',
			// ToDo: expand
		],
		"mac": ["American Typewriter Condensed","American Typewriter Condensed Light","American Typewriter Light","American Typewriter Semibold","Apple Braille Outline 6 Dot","Apple Braille Outline 8 Dot","Apple Braille Pinpoint 6 Dot","Apple Braille Pinpoint 8 Dot","Apple LiGothic Medium","Apple LiSung Light","Apple SD Gothic Neo Heavy","Apple SD Gothic Neo Light","Apple SD Gothic Neo Medium","Apple SD Gothic Neo SemiBold","Apple SD Gothic Neo UltraLight","Apple SD GothicNeo ExtraBold","Athelas","Avenir Book Oblique","Avenir Heavy Oblique","Avenir Light Oblique","Avenir Medium Oblique","Avenir Next Condensed Bold","Avenir Next Condensed Demi Bold","Avenir Next Condensed Heavy","Avenir Next Condensed Medium","Avenir Next Condensed Ultra Light","Avenir Roman","Baoli SC","Baoli TC","Baskerville SemiBold","BiauKai","Bodoni 72 Book","Bodoni 72 Oldstyle Book","Bodoni 72 Smallcaps Book","Charcoal CY","Charter Roman","Copperplate Light","Damascus Light","Damascus Medium","Damascus Semi Bold","Futura Condensed ExtraBold","Futura Condensed Medium","Futura Medium","Geneva CY","Gill Sans Light","Gill Sans SemiBold","Gill Sans UltraBold","GungSeo","Hannotate SC","Hannotate TC","HanziPen SC","HanziPen TC","HeadLineA","Hei","Heiti SC Light","Heiti SC Medium","Heiti TC Light","Heiti TC Medium","Helvetica CY Bold","Helvetica Light","Helvetica Neue Condensed Black","Helvetica Neue Condensed Bold","Helvetica Neue Light","Helvetica Neue Medium","Helvetica Neue UltraLight","Herculanum","Hiragino Kaku Gothic Pro W3","Hiragino Kaku Gothic Pro W6","Hiragino Kaku Gothic ProN","Hiragino Kaku Gothic ProN W3","Hiragino Kaku Gothic ProN W6","Hiragino Kaku Gothic Std W8","Hiragino Kaku Gothic StdN W8","Hiragino Maru Gothic Pro W4","Hiragino Mincho Pro W3","Hiragino Mincho Pro W6","Hiragino Sans CNS W3","Hiragino Sans CNS W6","Hoefler Text Black","ITF Devanagari Book","ITF Devanagari Demi","ITF Devanagari Light","ITF Devanagari Marathi Book","ITF Devanagari Marathi Demi","ITF Devanagari Marathi Light","ITF Devanagari Marathi Medium","ITF Devanagari Medium","Iowan Old Style Black","Iowan Old Style Bold","Iowan Old Style Italic","Iowan Old Style Roman","Iowan Old Style Titling","Kai","Kaiti SC","Kaiti SC Black","Kaiti TC","Kaiti TC Black","Klee Demibold","Klee Medium","Kohinoor Bangla Light","Kohinoor Bangla Medium","Kohinoor Bangla Semibold","Kohinoor Devanagari Light","Kohinoor Devanagari Medium","Kohinoor Devanagari Semibold","Kohinoor Gujarati Light","Kohinoor Gujarati Medium","Kohinoor Gujarati Semibold","Kohinoor Telugu Light","Kohinoor Telugu Medium","Kohinoor Telugu Semibold","Lantinghei SC Demibold","Lantinghei SC Extralight","Lantinghei SC Heavy","Lantinghei TC Demibold","Lantinghei TC Extralight","Lantinghei TC Heavy","LiHei Pro","LiSong Pro","Libian SC","Libian TC","LingWai SC Medium","LingWai TC Medium","Marion","Muna Black","Myriad Arabic","Myriad Arabic Black","Myriad Arabic Light","Myriad Arabic Semibold","Nanum Brush Script","Nanum Pen Script","NanumGothic","NanumGothic ExtraBold","NanumMyeongjo","NanumMyeongjo ExtraBold","New Peninim MT Bold Inclined","New Peninim MT Inclined","Optima ExtraBlack","Osaka","Osaka-Mono","PCMyungjo","Papyrus Condensed","Phosphate Inline","Phosphate Solid","PilGi","PingFang HK Light","PingFang HK Medium","PingFang HK Semibold","PingFang HK Ultralight","PingFang SC Light","PingFang SC Medium","PingFang SC Semibold","PingFang SC Ultralight","PingFang TC Light","PingFang TC Medium","PingFang TC Semibold","PingFang TC Ultralight","STFangsong","STHeiti","STIX Two Math","STIX Two Text","STKaiti","STXihei","Seravek","Seravek ExtraLight","Seravek Light","Seravek Medium","SignPainter-HouseScript Semibold","Skia Black","Skia Condensed","Skia Extended","Skia Light","Snell Roundhand Black","Songti SC Black","Songti SC Light","Songti TC Light","Sukhumvit Set Light","Sukhumvit Set Medium","Sukhumvit Set Semi Bold","Sukhumvit Set Text","Superclarendon","Superclarendon Black","Superclarendon Light","Thonburi Light","Times Roman","Toppan Bunkyu Gothic","Toppan Bunkyu Gothic Demibold","Toppan Bunkyu Gothic Regular","Toppan Bunkyu Midashi Gothic Extrabold","Toppan Bunkyu Midashi Mincho Extrabold","Toppan Bunkyu Mincho","Toppan Bunkyu Mincho Regular","Tsukushi A Round Gothic","Tsukushi A Round Gothic Bold","Tsukushi A Round Gothic Regular","Tsukushi B Round Gothic","Tsukushi B Round Gothic Bold","Tsukushi B Round Gothic Regular","Waseem Light","Wawati SC","Wawati TC","Weibei SC Bold","Weibei TC Bold","Xingkai SC Bold","Xingkai SC Light","Xingkai TC Bold","Xingkai TC Light","YuGothic Bold","YuGothic Medium","YuKyokasho Bold","YuKyokasho Medium","YuKyokasho Yoko Bold","YuKyokasho Yoko Medium","YuMincho +36p Kana Demibold","YuMincho +36p Kana Extrabold","YuMincho +36p Kana Medium","YuMincho Demibold","YuMincho Extrabold","YuMincho Medium","Yuanti SC","Yuanti SC Light","Yuanti TC","Yuanti TC Light","Yuppy SC","Yuppy TC",],
		"windows": [
			"Aharoni","Aldhabi","Andalus","Angsana New","AngsanaUPC","Aparajita","Arabic Typesetting","Arial Nova","Arial Nova Cond",
			"Arial Nova Cond Light","Arial Nova Light","Arial Unicode MS","BIZ UDGothic","BIZ UDMincho","BIZ UDMincho Medium",
			"BIZ UDPGothic","BIZ UDPMincho","BIZ UDPMincho Medium","Batang","BatangChe","Browallia New","BrowalliaUPC","Cordia New",
			"DFKai-SB","CordiaUPC","DaunPenh","David","DengXian","DengXian Light","DilleniaUPC","DokChampa","Dotum","DotumChe",
			"Estrangelo Edessa","EucrosiaUPC","Euphemia","FangSong","FrankRuehl","FreesiaUPC","Gautami","Georgia Pro","Georgia Pro Black",
			"Georgia Pro Cond","Georgia Pro Cond Black","Georgia Pro Cond Light","Georgia Pro Cond Semibold","Georgia Pro Light",
			"Georgia Pro Semibold","Gill Sans Nova","Gill Sans Nova Cond","Gill Sans Nova Cond Lt","Gill Sans Nova Cond Ultra Bold",
			"Gill Sans Nova Cond XBd","Gill Sans Nova Light","Gill Sans Nova Ultra Bold","Gisha","Gulim","GulimChe","Gungsuh",
			"GungsuhChe","Ink Free","IrisUPC","Iskoola Pota","JasmineUPC","KaiTi","Kalinga","Kartika","Khmer UI","KodchiangUPC",
			"Kokila","Lao UI","Latha","Leelawadee","Levenim MT","LilyUPC","MS Mincho","MS PMincho","Mangal","Meiryo","Meiryo UI",
			"Microsoft Uighur","MingLiU","MingLiU_HKSCS","Miriam","Miriam Fixed","MoolBoran","Narkisim","Neue Haas Grotesk Text Pro",
			"Neue Haas Grotesk Text Pro Medium","Nyala","PMingLiU","Plantagenet Cherokee","Raavi","Rockwell Nova","Rockwell Nova Cond",
			"Rockwell Nova Cond Light","Rockwell Nova Extra Bold","Rockwell Nova Light Italic","Rockwell Nova Rockwell","Rod",
			"Sakkal Majalla","Sanskrit Text","Segoe Pseudo","Shonar Bangla","Shruti","SimHei","Simplified Arabic",
			"Simplified Arabic Fixed","Traditional Arabic","Tunga","UD Digi Kyokasho","UD Digi Kyokasho N-B","UD Digi Kyokasho N-R",
			"UD Digi Kyokasho NK-B","UD Digi Kyokasho NK-R","UD Digi Kyokasho NP-B","UD Digi Kyokasho NP-R","Urdu Typesetting",
			"Utsaah","Vani","Verdana Pro","Verdana Pro Black","Verdana Pro Cond","Verdana Pro Cond Black","Verdana Pro Cond Light",
			"Verdana Pro Cond SemiBold","Verdana Pro Light","Verdana Pro SemiBold","Vijaya","Vrinda","Yu Mincho","Yu Mincho Demibold",
			"Yu Mincho Light",
			// kBase but broken: see 1720408
			"Franklin Gothic Medium",
			// why not
			'MS Reference Specialty',"MS Outlook",
			// aliases: ignored by kBase
			"宋体", // SimSun
			"細明體", // MingLiU
			"新細明體", // PMingLiU
			"굴림",
			"굴림체",
			"바탕", // Batang
			"微软雅黑", // Microsoft YaHei
			"ＭＳ ゴシック", // MS Gothic
			"ＭＳ 明朝", // MS Mincho
			"ＭＳ Ｐゴシック", // MS PGothic
			"ＭＳ Ｐ明朝", // MS PMincho
		],
	},
}

function get_fntCodes(name) {
	let list = fntCodePoints[name], str = ""
	list.forEach(function(code) {str += String.fromCodePoint(code)})
	return str
}

function set_fntList(os = isOS) {
	let osValid = ["windows","mac","android","linux"].includes(os)
	let fntListBaseName = isTB ? "allowlist" : "kBaseFonts"

	if (gLoad) {
		// fntString
		if (isTB) {
			if ("windows" === os) {
				if (isVer > 101) {fntString = "?-" + get_fntCodes("tofu")} // 132 win7
			}
		} else {
			if ("windows" === os) {fntString = "Mō"} // 124: +"á" = 125 +"Ω" = 127
		}

		// isPlatformFont / baseMaster first 3 items
		let baseMaster = ['monospace','sans-serif','serif']
		if ("windows" === os) {
			isPlatformFont = "MS Shell Dlg \\32"
			baseMaster = [
				'monospace, Consolas, Courier, \"Courier New\", \"Lucida Console\"',
				'sans-serif, Arial',
				'serif, Times, Roman'
			]
		} else if ("mac" === os) {
			isPlatformFont = "-apple-system"
			baseMaster = ['monospace, Menlo, Courier, \"Courier New\", Monaco',
				'sans-serif',
				'serif'
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
			//'ui-monospace','ui-rounded','ui-serif','math','emoji' // redundant|perf
			//'none' // redundant: always equals default proportional
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

		// fntUsed
		if (osValid) {
			fntUsed = {"base": [], "bundled": [], "full": []}

			fntFake = "--00"+ rnd_string() +" poison pill"
			let array = []
			let aBundled = fntMaster["bundled"]["all"]
			if (os == "linux" || isTB) {
				aBundled = aBundled.concat(fntMaster["bundled"][os])
			}

			if (os == "android") {
				// android
				aBundled = aBundled.concat(fntMaster["system"][os])
				array = array.concat(aBundled)
				fntUsed["full"] = array
			} else if (isTB) {
				// TB
				array = array.concat(aBundled)
				fntUsed["bundled"] = array
				array = array.concat(fntMaster["allowlist"][os])
				if (isPlatformFont !== undefined) { // -self
					array = array.filter(x => ![isPlatformFont].includes(x))
				}
				fntUsed["base"] = array
				array = array.concat(fntMaster["blocklist"][os])
				fntUsed["full"] = array
			} else {
				// FF
				if (os == "linux") {
					array = aBundled.concat(fntMaster["system"][os])
				} else {
					array = fntMaster["base"][os]
					if (isPlatformFont !== undefined) { // -self
						array = array.filter(x => ![isPlatformFont].includes(x))
					fntUsed["base"] = array
					array = array.concat(fntMaster["system"][os])
					}
				}
				fntUsed["full"] = array
			}

			// fntBtn
			let str = "fonts_list_"+ os
			fntUsed["full"].push(fntFake)
			fntUsed["full"].sort()
			fntBtn += buildButton(12, str, fntUsed["full"].length)
			if (fntUsed["base"].length) {
				fntUsed["base"].sort()
				fntBtn += buildButton(12, str +"_"+ fntListBaseName, fntUsed["base"].length)
			}
			// bundled: TB desktop
			if (isTB && os !== "android" && fntUsed["bundled"].length) {
				fntUsed["bundled"].sort()
				fntBtn += buildButton(12, str +"_bundled", fntUsed["bundled"].length)
			}
		}
	}

	// bail
	if (!osValid) {return}

	// fnt*Btn data
	if (gRun) {
		let str = "fonts_list_"+ os
		sDetail[str] = fntUsed["full"]
		sDetail[str +"_"+ fntListBaseName] = fntUsed["base"]
		sDetail[str +"_bundled"] = fntUsed["bundled"]
	}
	fntList = fntUsed["full"]
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
					font-size: ` + fntSize + ` !important;
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
					content: '`+ fntString +`';
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
			if (fntList.length == 0 || fntDocEnabled == false) {
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
		function get_baseHash() {
			let baseHash = zErr, baseBtn = "", bName = "fonts_fontsizes_base"
			try {
				if (Object.keys(sDetail[bName]).length) {
					baseHash = mini_sha1(sDetail[bName], "fontsizes base")
					baseBtn = buildButton("12", bName)
				}
			} catch(e) {}
			dom.fontBase.innerHTML = baseHash + baseBtn
			return baseHash
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

			let oData = {}, aIgnore = []
			let ignoreList = ["none", "all", "zero dimensions"]
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
			let baseReturn = get_baseHash()

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
					document.getElementById(k).innerHTML = zNA
					res.push(k +":"+ zNA)
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
						display = zNA
						value = zNA
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
							display = zNA
							value = zNA
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
			fntCodes.forEach(function(code) {
				// set char once
				let	codeString = String.fromCodePoint(code)
				slot.textContent = codeString
				let isFirst = code == fntCodes[0]
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

		function filter_tofu() {
			// skip FF android and TB: very little tofu
			if (isFF && isOS == "android" || isTB) {
				return // not worth it
			}
			let tofuStart; if (canPerf) {tofuStart = performance.now()}
			// Why check all 42 when 20+ should always fallback
			let fntTofuPossible = [
				'0x007F','0x058F','0x0700','0x08E4','0x097F','0x09B3','0x0B82','0x0D02','0x10A0','0x115A','0x17DD',
				'0x1C50','0x1CDA','0x20BD','0x2C7B','0xA73D','0xA830','0xF003','0xF810','0xFBEE','0xFFF9',
			]
			try {
				let fntTofu = [], fntTofuChars = []
				let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot
				slot.style.fontFamily = "none"
				slot.textContent = String.fromCodePoint('0xFFFF')
				let tofuWidth = span.offsetWidth,
					tofuHeight = div.offsetHeight
				fntTofuPossible.forEach(function(code) {
					slot.textContent = String.fromCodePoint(code)
					if (span.offsetWidth == tofuWidth && div.offsetHeight == tofuHeight) {
						fntTofu.push(code)
						fntTofuChars.push(String.fromCodePoint(code))
					}
				})
				fntCodes = fntCodes.filter(x => !fntTofu.includes(x))
				if (gRun) {
					let tofuPerf = ""; if (canPerf) {tofuPerf = " | "+ (performance.now() - tofuStart) +" ms"}
					log_debug("tofu", fntTofu.join(" ") + tofuPerf)
					log_debug("tofu", fntTofuChars.join(" "))
				}
			} catch(e) {}
		}
		// do once
		if (fntCodes.length == 0) {
			fntCodePoints["test"].forEach(function(code) {fntCodes.push(code)})
			filter_tofu()
			fntCodes.push('0xFFFF') // ensure one tofu
		}
		run()
	})
}

function get_woff2() {
	// https://github.com/filamentgroup/woff2-feature-test
	return new Promise(resolve => {
		try {
			const supportsWoff2 = (function(){
				if (runSE) {abc = def}
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

function outputFonts() {
	let t0; if (canPerf) {t0 = performance.now()}
	let section = [], r = ""

	set_fntList() // 3-5ms

	// proportional
	r = window.getComputedStyle(document.body,null).getPropertyValue("font-family")
	dom.fontFCprop = r
	section.push("proportional:"+ r)
	// sizes
	dom.df1 = "mmmLLLmmmWWWwwwmmmllliii"
	dom.df2 = "mmmLLLmmmWWWwwwmmmllliii"
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
		// check this works on android etc where the font doesn't exist: it should put serif first
	try {
		el = dom.divDocFont
		let font = getComputedStyle(el).getPropertyValue("font-family")
		fntDocEnabled = (font.slice(1,16) == "Times New Roman" ? true : false)
		if (!fntDocEnabled) {
			// chameleon strips quotes marks
			if (font.slice(0,15) == "Times New Roman") {fntDocEnabled = true}
		}
		r = (fntDocEnabled ? zE : zD) + " | " + font
		dom.fontDoc = r
		section.push("document_fonts:"+ r)
	} catch(e) {
		fntDocEnabled = false
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
			dom.fntBtn.innerHTML = fntBtn
			dom.fntString.innerHTML = fntString
		})
		log_section("fonts", t0, section)
	})
}

countJS("fonts")
