'use strict';

let fntCodePoints = {
	// ToDo: create OS specific lists
	// ToDo: update codepoints to be gecko specifc and cover unicode changes since fifield et al
	"test": [ // sorted
		//*
		'0x007F','0x0218','0x058F','0x05C6','0x061C','0x0700','0x08E4','0x097F','0x09B3',
		'0x0B82','0x0D02','0x10A0','0x115A','0x17DD','0x1950','0x1C50','0x1CDA','0x1D790',
		'0x1E9E','0x20B0','0x20B8','0x20B9','0x20BA','0x20BD','0x20E3','0x21E4','0x23AE',
		'0x2425','0x2581','0x2619','0x2B06','0x2C7B','0x302E','0x3095','0x532D','0xA73D',
		'0xA830','0xF003','0xF810','0xFBEE','0xFFF9','0xFFFD',
		//*/
	],
	"tofu": ['0xFFFF'],
	"tbwindows": ["0x0374"], // or "0x0375": +1 more size: not worth it
}

let fntCodes = [],
	fntData = {},
	fntSize = "512px",
	fntString = "Mōá?-"+ get_fntCodes("tofu"),
	fntBtn = "",
	fntDocEnabled = false

let fntMaster = {
	// TB13 bundled: reuse for android/linux
	'bundled': {
		// all: win/mac/linux: 97 sans, 21 serif
		'allnotosans': [
			'Adlam','Balinese','Bamum','Bassa Vah','Batak','Bengali','Buginese','Buhid','Canadian Aboriginal','Chakma',
			'Cham','Cherokee','Coptic','Deseret','Devanagari','Elbasan','Ethiopic','Georgian','Grantha','Gujarati',
			'Gunjala Gondi','Gurmukhi','Hanifi Rohingya','Hanunoo','Javanese','Kannada','Kayah Li','Khmer','Khojki',
			'Khudawadi','Lao','Lepcha','Limbu','Lisu','Mahajani','Malayalam','Mandaic','Masaram Gondi','Medefaidrin',
			'Meetei Mayek','Mende Kikakui','Miao','Modi','Mongolian','Mro','Multani','Myanmar','NKo','New Tai Lue',
			'Newa','Ol Chiki','Oriya','Osage','Osmanya','Pahawh Hmong','Pau Cin Hau','Rejang','Runic','Samaritan',
			'Saurashtra','Sharada','Shavian','Sinhala','Sora Sompeng','Soyombo','Sundanese','Syloti Nagri','Symbols',
			'Symbols 2','Syriac','Tagalog','Tagbanwa','Tai Le','Tai Tham','Tai Viet','Takri','Tamil','Telugu','Thaana',
			'Tifinagh','Tifinagh APT','Tifinagh Adrar','Tifinagh Agraw Imazighen','Tifinagh Ahaggar','Tifinagh Air',
			'Tifinagh Azawagh','Tifinagh Ghat','Tifinagh Hawad','Tifinagh Rhissa Ixa','Tifinagh SIL','Tifinagh Tawellemmet',
			'Tirhuta','Vai','Wancho','Warang Citi','Yi','Zanabazar Square',
		],
		'allnotoserif': [
			'Balinese','Bengali','Devanagari','Dogra','Ethiopic','Georgian','Grantha','Gujarati','Gurmukhi','Kannada',
			'Khmer','Khojki','Lao','Malayalam','Myanmar','NP Hmong','Sinhala','Tamil','Telugu','Tibetan','Yezidi',
		],
		'android': [],
		// then linux +16, mac +5, win +4
		'linux': ['Arimo','Cousine','Noto Naskh Arabic','Noto Sans Armenian','Noto Sans Hebrew','Noto Sans JP','Noto Sans KR','Noto Sans SC','Noto Sans TC','Noto Sans Thai','Noto Serif Armenian','Noto Serif Hebrew','Noto Serif Thai','STIX Two Math','Tinos','Twemoji Mozilla',],
		'mac': ['Noto Sans Armenian','Noto Sans Hebrew','Noto Serif Armenian','Noto Serif Hebrew','STIX Two Math',],
		'windows': ['Noto Naskh Arabic','Noto Sans','Noto Serif','Twemoji Mozilla',],
	},
	// TB whitelist system
	'allowlist': {
		'android': [],
		'linux': [],
		'mac': [
			'AppleGothic','Apple Color Emoji','Arial','Arial Black','Arial Narrow','Courier','Courier New','Geneva','Georgia','Heiti TC','Helvetica','Helvetica Neue','.Helvetica Neue DeskInterface','Hiragino Kaku Gothic ProN','Hiragino Kaku Gothic ProN W3','Hiragino Kaku Gothic ProN W6','Kailasa','Lucida Grande','Menlo','Monaco','PingFang HK','PingFang SC','PingFang TC','Songti SC','Songti TC','Tahoma','Thonburi','Times','Times New Roman','Verdana',
			// always
			'-apple-system',
		],
		'windows': [
			// 7
			'Arial','Cambria Math','Consolas','Courier New','Georgia','Lucida Console','MS Gothic','MS PGothic','MV Boli','Malgun Gothic',
			'Microsoft Himalaya','Microsoft JhengHei','Microsoft YaHei','Segoe UI','SimSun','Sylfaen','Tahoma','Times New Roman','Verdana',
			// FontSubstitutes
				// HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes
			'MS Shell Dlg','MS Shell Dlg \\32', // might differ based on system locale/install
			'Helv','Helvetica','Times','Tms Rmn', // seems stable
			// localized
			'微软雅黑', // Microsoft YaHei
			'ＭＳ ゴシック', // MS Gothic
			'ＭＳ Ｐゴシック', // MS PGothic
			'宋体', // SimSun

			/* ignore: https://searchfox.org/mozilla-central/source/gfx/thebes/gfxDWriteFontList.cpp#1990
			'MS Sans Serif','MS Serif','Courier','Small Fonts','Roman',
			*/

			/* variants
			'Arial Black','Arial Narrow','Segoe UI Light','Segoe UI Semibold', // 7
			'Segoe UI Semilight', // 8
			'Microsoft JhengHei Light','Microsoft YaHei Light','Segoe UI Black', // 8.1
			'Malgun Gothic Semilight', // 10
			*/
		],
	},
	// TB unexpected system: from kBaseFonts
	'blocklist': {
		'android': [],
		'linux': [
			// https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41799
				// aliased
			'Arial','Courier New','Times New Roman',
			// https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41644
			'Courier','Noto Color Emoji','Noto Emoji','Noto Mono','Noto Sans','Noto Serif', // notos
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX', // fedora
			'Dingbats','FreeMono','Ubuntu', // ubuntu
			'Liberation Mono','Liberation Sans','Liberation Serif', // popular
			// TB12 fontnames, should have been removed
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math',
		],
		'mac': [
			'Apple Symbols','Avenir','Charter','Impact','Palatino','Rockwell',
			// TB12 fontnames, should have been removed
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math',
		],
		'windows': [
			'Calibri','Candara','Corbel','Impact','Ebrima','Gabriola',
			// TB12 fontnames, should have been removed
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2',
		],
	},
	// kBaseFonts: https://searchfox.org/mozilla-central/search?path=StandardFonts*.inc
	'base': {
		'android': [],
		'linux': [],
		'mac': [
			'Al Bayan','Al Nile','Al Tarikh','American Typewriter','Andale Mono','Apple Braille','Apple Chancery','Apple Color Emoji','Apple SD Gothic Neo','Apple Symbols','AppleGothic','AppleMyungjo','Arial','Arial Black','Arial Hebrew','Arial Hebrew Scholar','Arial Narrow','Arial Rounded MT Bold','Arial Unicode MS','Avenir','Avenir Black','Avenir Black Oblique','Avenir Book','Avenir Heavy','Avenir Light','Avenir Medium','Avenir Next','Avenir Next Demi Bold','Avenir Next Heavy','Avenir Next Medium','Avenir Next Ultra Light','Avenir Oblique','Ayuthaya','Baghdad','Bangla MN','Bangla Sangam MN','Baskerville','Beirut','Big Caslon Medium','Bodoni 72','Bodoni 72 Oldstyle','Bodoni 72 Smallcaps','Bodoni Ornaments','Bradley Hand','Brush Script MT','Chalkboard','Chalkboard SE','Chalkduster','Charter','Charter Black','Cochin','Comic Sans MS','Copperplate','Corsiva Hebrew','Courier','Courier New','DIN Alternate','DIN Condensed','Damascus','DecoType Naskh','Devanagari MT','Devanagari Sangam MN','Didot','Diwan Kufi','Diwan Thuluth','Euphemia UCAS','Farah','Farisi','Futura','GB18030 Bitmap','Galvji','Geeza Pro','Geneva','Georgia','Gill Sans','Gujarati MT','Gujarati Sangam MN','Gurmukhi MN','Gurmukhi MT','Gurmukhi Sangam MN','Heiti SC','Heiti TC','Helvetica','Helvetica Neue','Hiragino Maru Gothic ProN','Hiragino Maru Gothic ProN W4','Hiragino Mincho ProN','Hiragino Mincho ProN W3','Hiragino Mincho ProN W6','Hiragino Sans','Hiragino Sans GB','Hiragino Sans GB W3','Hiragino Sans GB W6','Hiragino Sans W0','Hiragino Sans W1','Hiragino Sans W2','Hiragino Sans W3','Hiragino Sans W4','Hiragino Sans W5','Hiragino Sans W6','Hiragino Sans W7','Hiragino Sans W8','Hiragino Sans W9','Hoefler Text','Hoefler Text Ornaments','ITF Devanagari','ITF Devanagari Marathi','Impact','InaiMathi','Kailasa','Kannada MN','Kannada Sangam MN','Kefa','Khmer MN','Khmer Sangam MN','Kohinoor Bangla','Kohinoor Devanagari','Kohinoor Gujarati','Kohinoor Telugu','Kokonor','Krungthep','KufiStandardGK','Lao MN','Lao Sangam MN','Lucida Grande','Luminari','Malayalam MN','Malayalam Sangam MN','Marker Felt','Menlo','Microsoft Sans Serif','Mishafi','Mishafi Gold','Monaco','Mshtakan','Mukta Mahee','Muna','Myanmar MN','Myanmar Sangam MN','Nadeem','New Peninim MT','Noteworthy','Noto Nastaliq Urdu','Noto Sans Adlam','Noto Sans Armenian','Noto Sans Avestan','Noto Sans Bamum','Noto Sans Bassa Vah','Noto Sans Batak','Noto Sans Bhaiksuki','Noto Sans Brahmi','Noto Sans Buginese','Noto Sans Buhid','Noto Sans Canadian Aboriginal','Noto Sans Carian','Noto Sans Caucasian Albanian','Noto Sans Chakma','Noto Sans Cham','Noto Sans Coptic','Noto Sans Cuneiform','Noto Sans Cypriot','Noto Sans Duployan','Noto Sans Egyptian Hieroglyphs','Noto Sans Elbasan','Noto Sans Glagolitic','Noto Sans Gothic','Noto Sans Gunjala Gondi','Noto Sans Hanifi Rohingya','Noto Sans Hanunoo','Noto Sans Hatran','Noto Sans Imperial Aramaic','Noto Sans Inscriptional Pahlavi','Noto Sans Inscriptional Parthian','Noto Sans Javanese','Noto Sans Kaithi','Noto Sans Kannada','Noto Sans Kayah Li','Noto Sans Kharoshthi','Noto Sans Khojki','Noto Sans Khudawadi','Noto Sans Lepcha','Noto Sans Limbu','Noto Sans Linear A','Noto Sans Linear B','Noto Sans Lisu','Noto Sans Lycian','Noto Sans Lydian','Noto Sans Mahajani','Noto Sans Mandaic','Noto Sans Manichaean','Noto Sans Marchen','Noto Sans Masaram Gondi','Noto Sans Meetei Mayek','Noto Sans Mende Kikakui','Noto Sans Meroitic','Noto Sans Miao','Noto Sans Modi','Noto Sans Mongolian','Noto Sans Mro','Noto Sans Multani','Noto Sans Myanmar','Noto Sans Nabataean','Noto Sans New Tai Lue','Noto Sans Newa','Noto Sans NKo','Noto Sans Ol Chiki','Noto Sans Old Hungarian','Noto Sans Old Italic','Noto Sans Old North Arabian','Noto Sans Old Permic','Noto Sans Old Persian','Noto Sans Old South Arabian','Noto Sans Old Turkic','Noto Sans Oriya','Noto Sans Osage','Noto Sans Osmanya','Noto Sans Pahawh Hmong','Noto Sans Palmyrene','Noto Sans Pau Cin Hau','Noto Sans PhagsPa','Noto Sans Phoenician','Noto Sans Psalter Pahlavi','Noto Sans Rejang','Noto Sans Samaritan','Noto Sans Saurashtra','Noto Sans Sharada','Noto Sans Siddham','Noto Sans Sora Sompeng','Noto Sans Sundanese','Noto Sans Syloti Nagri','Noto Sans Syriac','Noto Sans Tagalog','Noto Sans Tagbanwa','Noto Sans Tai Le','Noto Sans Tai Tham','Noto Sans Tai Viet','Noto Sans Takri','Noto Sans Thaana','Noto Sans Tifinagh','Noto Sans Tirhuta','Noto Sans Ugaritic','Noto Sans Vai','Noto Sans Wancho','Noto Sans Warang Citi','Noto Sans Yi','Noto Sans Zawgyi','Noto Serif Ahom','Noto Serif Balinese','Noto Serif Hmong Nyiakeng','Noto Serif Myanmar','Noto Serif Yezidi','Optima','Oriya MN','Oriya Sangam MN','PT Mono','PT Sans','PT Sans Caption','PT Sans Narrow','PT Serif','PT Serif Caption','Palatino','Papyrus','Phosphate','PingFang HK','PingFang SC','PingFang TC','Plantagenet Cherokee','Raanana','Rockwell','STIXGeneral','STIXIntegralsD','STIXIntegralsSm','STIXIntegralsUp','STIXIntegralsUpD','STIXIntegralsUpSm','STIXNonUnicode','STIXSizeFiveSym','STIXSizeFourSym','STIXSizeOneSym','STIXSizeThreeSym','STIXSizeTwoSym','STIXVariants','STSong','Sana','Sathu','Savoye LET','Shree Devanagari 714','SignPainter','SignPainter-HouseScript','Silom','Sinhala MN','Sinhala Sangam MN','Skia','Snell Roundhand','Songti SC','Songti TC','Sukhumvit Set','Symbol','Tahoma','Tamil MN','Tamil Sangam MN','Telugu MN','Telugu Sangam MN','Thonburi','Times','Times New Roman','Trattatello','Trebuchet MS','Verdana','Waseem','Webdings','Wingdings','Wingdings 2','Wingdings 3','Zapf Dingbats','Zapfino',
			// always
			'-apple-system',
		],
		'windows': [
			// ?
			'AlternateGothic2 BT',
			// 7
			'Arial','Calibri','Cambria','Cambria Math','Candara','Comic Sans MS','Consolas','Constantia','Corbel','Courier New','Ebrima',
			'Gabriola','Georgia','Impact','Lucida Console','Lucida Sans Unicode','MS Gothic','MS PGothic','MS UI Gothic','MV Boli',
			'Malgun Gothic','Marlett','Microsoft Himalaya','Microsoft JhengHei','Microsoft New Tai Lue','Microsoft PhagsPa',
			'Microsoft Sans Serif','Microsoft Tai Le','Microsoft YaHei','Microsoft Yi Baiti','MingLiU-ExtB','MingLiU_HKSCS-ExtB',
			'Mongolian Baiti','NSimSun','PMingLiU-ExtB','Palatino Linotype','Segoe Print','Segoe Script','Segoe UI','Segoe UI Symbol',
			'SimSun','SimSun-ExtB','Sylfaen','Symbol','Tahoma','Times New Roman','Trebuchet MS','Verdana','Webdings','Wingdings',
			// 7 but not detected if font-vis < 3: 1720408
			'Franklin Gothic Medium',
			// 8
			'Gadugi','Nirmala UI','Microsoft JhengHei UI','Microsoft YaHei UI','Myanmar Text',
			// 8.1
			'Javanese Text','Leelawadee UI','Segoe UI Emoji','Sitka Banner','Sitka Display',
			'Sitka Heading','Sitka Small','Sitka Subheading','Sitka Text','Yu Gothic',
			// 10
			'Bahnschrift','HoloLens MDL2 Assets','Segoe MDL2 Assets','Segoe UI Historic','Yu Gothic UI',
			// localized: kBase: detected FF119+: 1850672
			'微软雅黑', // Microsoft YaHei
			'ＭＳ ゴシック', // MS Gothic
			'ＭＳ Ｐゴシック', // MS PGothic
			'宋体', // SimSun
      '游ゴシック', // Yu Gothic
			/* ignore: https://searchfox.org/mozilla-central/source/gfx/thebes/gfxDWriteFontList.cpp#1990
			'MS Sans Serif','MS Serif','Courier','Small Fonts','Roman',
			*/
			// FontSubstitutes
				// HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes
			'MS Shell Dlg','MS Shell Dlg \\32', // might differ based on system locale/install
			'Helv','Helvetica','Times','Tms Rmn', // seems stable

			/* variants
			// 7
			'Arial Black','Arial Narrow','Segoe UI Light','Segoe UI Semibold',
			// 8
			'Calibri Light','Calibri Light Italic','Segoe UI Semilight',
			// 8.1
			'Leelawadee UI Semilight','Microsoft JhengHei Light','Microsoft JhengHei UI Light',
			'Microsoft YaHei Light','Microsoft YaHei UI Light','Nirmala UI Semilight','Segoe UI Black','Yu Gothic Light',
			// 10
			'Bahnschrift Light','Bahnschrift SemiBold','Bahnschrift SemiLight','Candara Light','Corbel Light',
			'Malgun Gothic Semilight','Yu Gothic Medium','Yu Gothic UI Light','Yu Gothic UI Semilight','Yu Gothic UI Semibold',
			*/
		],
	},
	'system': {
		'android': [
			// we start with bundled[all*] 118
			// + old noto font names
			'Noto Sans Symbols2','Noto Serif Hmong Nyiakeng',
			// + common
			'Droid Sans','Droid Sans Mono','Droid Serif','Roboto','Roboto Condensed',
			// + MOAR notos
			'Noto Color Emoji','Noto Emoji','Noto Kufi Arabic','Noto Mono','Noto Naskh Arabic','Noto Nastaliq Urdu','Noto Sans','Noto Sans Adlam Unjoined','Noto Sans Anatolian Hieroglyphs','Noto Sans Arabic','Noto Sans Armenian','Noto Sans Avestan','Noto Sans Brahmi','Noto Sans CJK JP','Noto Sans CJK KR','Noto Sans CJK SC','Noto Sans CJK TC','Noto Sans Carian','Noto Sans Cuneiform','Noto Sans Cypriot','Noto Sans Display','Noto Sans Egyptian Hieroglyphs','Noto Sans Glagolitic','Noto Sans Gothic','Noto Sans Hebrew','Noto Sans Imperial Aramaic','Noto Sans Inscriptional Pahlavi','Noto Sans Inscriptional Parthian','Noto Sans JP','Noto Sans KR','Noto Sans Kaithi','Noto Sans Kharoshthi','Noto Sans Linear B','Noto Sans Lycian','Noto Sans Lydian','Noto Sans Mono','Noto Sans Ogham','Noto Sans Old Italic','Noto Sans Old Persian','Noto Sans Old South Arabian','Noto Sans Old Turkic','Noto Sans Phags Pa','Noto Sans Phoenician','Noto Sans SC','Noto Sans Syriac Eastern','Noto Sans Syriac Estrangela','Noto Sans Syriac Western','Noto Sans TC','Noto Sans Thai','Noto Sans Tibetan','Noto Sans Ugaritic','Noto Serif','Noto Serif Armenian','Noto Serif CJK JP','Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC','Noto Serif Display','Noto Serif Hebrew','Noto Serif Thai',
			// + vendor
			// ToDo: SamsungOneUI*, SamsungNeo*, vendor specific
			'Dancing Script',
			'SamsungKorean_v2.0', // 1674683
			// + defaults: https://searchfox.org/mozilla-central/source/modules/libpref/init/all.js#3041
				// ToDo: check names are correct + add: 'HYSerif','MotoyaLCedar','MotoyaLMaru','NanumGothic','SmartGothic',
			'Arial','Asana Math','Cambria Math','Charis SIL Compact','DejaVu Math TeX Gyre','DejaVu Sans','DejaVu Serif','Droid Sans Fallback','Droid Sans Hebrew','Droid Sans Japanese','Droid Sans Thai','Google Sans','Latin Modern Math','Libertinus Math','Noto Sans Mono CJK JP','Noto Sans Mono CJK KR','Noto Sans Mono CJK SC','Noto Sans Mono CJK TC','SEC CJK JP','SEC CJK KR','SEC CJK SC','SEC CJK TC','SEC Mono CJK JP','SEC Mono CJK KR','SEC Mono CJK SC','SEC Mono CJK TC','STIX Math','STIX Two Math','STIXGeneral','TeX Gyre Bonum Math','TeX Gyre Pagella Math','TeX Gyre Schola','TeX Gyre Termes Math','XITS Math',
		],
		'linux': [
			// we start with bundled[linux] 134
			// + old noto font names
			'Noto Sans Symbols2','Noto Serif Hmong Nyiakeng',
			// + always
			'Arial','Courier','Courier New',
			// + common notos
			'Noto Emoji','Noto Sans','Noto Serif','Noto Sans Tibetan',
			// + some selective kBase ubuntu or fedora
				// notos
			'Noto Color Emoji','Noto Mono','Noto Serif CJK JP','Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC',
				// western/symbols
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX','STIX Two Text','Symbola', // fedora
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
			'Jomolhari', // tibetan, also chrome os
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
			'OpenSymbol', // openoffice
			'Amiri', // libreoffice
			// ToDo: expand
		],
		'mac': ['American Typewriter Condensed','American Typewriter Condensed Light','American Typewriter Light','American Typewriter Semibold','Apple Braille Outline 6 Dot','Apple Braille Outline 8 Dot','Apple Braille Pinpoint 6 Dot','Apple Braille Pinpoint 8 Dot','Apple LiGothic Medium','Apple LiSung Light','Apple SD Gothic Neo Heavy','Apple SD Gothic Neo Light','Apple SD Gothic Neo Medium','Apple SD Gothic Neo SemiBold','Apple SD Gothic Neo UltraLight','Apple SD GothicNeo ExtraBold','Athelas','Avenir Book Oblique','Avenir Heavy Oblique','Avenir Light Oblique','Avenir Medium Oblique','Avenir Next Condensed Bold','Avenir Next Condensed Demi Bold','Avenir Next Condensed Heavy','Avenir Next Condensed Medium','Avenir Next Condensed Ultra Light','Avenir Roman','Baoli SC','Baoli TC','Baskerville SemiBold','BiauKai','Bodoni 72 Book','Bodoni 72 Oldstyle Book','Bodoni 72 Smallcaps Book','Charcoal CY','Charter Roman','Copperplate Light','Damascus Light','Damascus Medium','Damascus Semi Bold','Futura Condensed ExtraBold','Futura Condensed Medium','Futura Medium','Geneva CY','Gill Sans Light','Gill Sans SemiBold','Gill Sans UltraBold','GungSeo','Hannotate SC','Hannotate TC','HanziPen SC','HanziPen TC','HeadLineA','Hei','Heiti SC Light','Heiti SC Medium','Heiti TC Light','Heiti TC Medium','Helvetica CY Bold','Helvetica Light','Helvetica Neue Condensed Black','Helvetica Neue Condensed Bold','Helvetica Neue Light','Helvetica Neue Medium','Helvetica Neue UltraLight','Herculanum','Hiragino Kaku Gothic Pro W3','Hiragino Kaku Gothic Pro W6','Hiragino Kaku Gothic ProN','Hiragino Kaku Gothic ProN W3','Hiragino Kaku Gothic ProN W6','Hiragino Kaku Gothic Std W8','Hiragino Kaku Gothic StdN W8','Hiragino Maru Gothic Pro W4','Hiragino Mincho Pro W3','Hiragino Mincho Pro W6','Hiragino Sans CNS W3','Hiragino Sans CNS W6','Hoefler Text Black','ITF Devanagari Book','ITF Devanagari Demi','ITF Devanagari Light','ITF Devanagari Marathi Book','ITF Devanagari Marathi Demi','ITF Devanagari Marathi Light','ITF Devanagari Marathi Medium','ITF Devanagari Medium','Iowan Old Style Black','Iowan Old Style Bold','Iowan Old Style Italic','Iowan Old Style Roman','Iowan Old Style Titling','Kai','Kaiti SC','Kaiti SC Black','Kaiti TC','Kaiti TC Black','Klee Demibold','Klee Medium','Kohinoor Bangla Light','Kohinoor Bangla Medium','Kohinoor Bangla Semibold','Kohinoor Devanagari Light','Kohinoor Devanagari Medium','Kohinoor Devanagari Semibold','Kohinoor Gujarati Light','Kohinoor Gujarati Medium','Kohinoor Gujarati Semibold','Kohinoor Telugu Light','Kohinoor Telugu Medium','Kohinoor Telugu Semibold','Lantinghei SC Demibold','Lantinghei SC Extralight','Lantinghei SC Heavy','Lantinghei TC Demibold','Lantinghei TC Extralight','Lantinghei TC Heavy','LiHei Pro','LiSong Pro','Libian SC','Libian TC','LingWai SC Medium','LingWai TC Medium','Marion','Muna Black','Myriad Arabic','Myriad Arabic Black','Myriad Arabic Light','Myriad Arabic Semibold','Nanum Brush Script','Nanum Pen Script','NanumGothic','NanumGothic ExtraBold','NanumMyeongjo','NanumMyeongjo ExtraBold','New Peninim MT Bold Inclined','New Peninim MT Inclined','Optima ExtraBlack','Osaka','Osaka-Mono','PCMyungjo','Papyrus Condensed','Phosphate Inline','Phosphate Solid','PilGi','PingFang HK Light','PingFang HK Medium','PingFang HK Semibold','PingFang HK Ultralight','PingFang SC Light','PingFang SC Medium','PingFang SC Semibold','PingFang SC Ultralight','PingFang TC Light','PingFang TC Medium','PingFang TC Semibold','PingFang TC Ultralight','STFangsong','STHeiti','STIX Two Math','STIX Two Text','STKaiti','STXihei','Seravek','Seravek ExtraLight','Seravek Light','Seravek Medium','SignPainter-HouseScript Semibold','Skia Black','Skia Condensed','Skia Extended','Skia Light','Snell Roundhand Black','Songti SC Black','Songti SC Light','Songti TC Light','Sukhumvit Set Light','Sukhumvit Set Medium','Sukhumvit Set Semi Bold','Sukhumvit Set Text','Superclarendon','Superclarendon Black','Superclarendon Light','Thonburi Light','Times Roman','Toppan Bunkyu Gothic','Toppan Bunkyu Gothic Demibold','Toppan Bunkyu Gothic Regular','Toppan Bunkyu Midashi Gothic Extrabold','Toppan Bunkyu Midashi Mincho Extrabold','Toppan Bunkyu Mincho','Toppan Bunkyu Mincho Regular','Tsukushi A Round Gothic','Tsukushi A Round Gothic Bold','Tsukushi A Round Gothic Regular','Tsukushi B Round Gothic','Tsukushi B Round Gothic Bold','Tsukushi B Round Gothic Regular','Waseem Light','Wawati SC','Wawati TC','Weibei SC Bold','Weibei TC Bold','Xingkai SC Bold','Xingkai SC Light','Xingkai TC Bold','Xingkai TC Light','YuGothic Bold','YuGothic Medium','YuKyokasho Bold','YuKyokasho Medium','YuKyokasho Yoko Bold','YuKyokasho Yoko Medium','YuMincho +36p Kana Demibold','YuMincho +36p Kana Extrabold','YuMincho +36p Kana Medium','YuMincho Demibold','YuMincho Extrabold','YuMincho Medium','Yuanti SC','Yuanti SC Light','Yuanti TC','Yuanti TC Light','Yuppy SC','Yuppy TC',],
		'windows': [
			'Aharoni','Aldhabi','Andalus','Angsana New','AngsanaUPC','Aparajita','Arabic Typesetting','Arial Nova',
			'BIZ UDGothic','BIZ UDPGothic','Batang','BatangChe','Browallia New','BrowalliaUPC','Cordia New','DFKai-SB',
			'CordiaUPC','DaunPenh','David','DengXian','DilleniaUPC','DokChampa','Dotum','DotumChe','Estrangelo Edessa',
			'EucrosiaUPC','Euphemia','FangSong','FrankRuehl','FreesiaUPC','Gautami','Georgia Pro','Gill Sans Nova',
			'Gisha','Gulim','GulimChe','Gungsuh','GungsuhChe','Ink Free','IrisUPC','Iskoola Pota','JasmineUPC','KaiTi',
			'Kalinga','Kartika','Khmer UI','KodchiangUPC','Kokila','Lao UI','Latha','Leelawadee','Levenim MT','LilyUPC',
			'MS Mincho','MS PMincho','Mangal','Meiryo','Meiryo UI','Microsoft Uighur','MingLiU','MingLiU_HKSCS','Miriam',
			'Miriam Fixed','MoolBoran','Narkisim','Neue Haas Grotesk Text Pro','Nyala','PMingLiU','Plantagenet Cherokee',
			'Raavi','Rockwell Nova','Rod','Sakkal Majalla','Sanskrit Text','Segoe Fluent Icons','Segoe UI Variable Display',
			'Segoe UI Variable Small','Segoe UI Variable Text','Shonar Bangla','Shruti','SimHei','Simplified Arabic',
			'Simplified Arabic Fixed','Traditional Arabic','Tunga','UD Digi Kyokasho N-B','UD Digi Kyokasho N-R',
			'UD Digi Kyokasho NK-B','UD Digi Kyokasho NK-R','UD Digi Kyokasho NP-B','UD Digi Kyokasho NP-R','Urdu Typesetting',
			'Utsaah','Vani','Verdana Pro','Vijaya','Vrinda','Yu Mincho',
			// win11
			'Sans Serif Collection',
			// localized ^
			'바탕', // Batang
			'BIZ UDPゴシック', // BIZ UDPGothic
			'굴림', // Gulim
			'굴림체', // GulimChe
			'細明體', // MingLiU
			'細明體_HKSCS', // MingLiU_HKSCS
			'ＭＳ 明朝', // MS Mincho
			'ＭＳ Ｐ明朝', // MS PMincho
			'新細明體', // PMingLiU

			// MS products
			'Arial Unicode MS','MS Reference Specialty','MS Outlook',
			// MS downloads
			'Cascadia Code','Cascadia Mono', // 11

			/* variants
				'Arial Nova Cond','Arial Nova Cond Light','Arial Nova Light',
				'BIZ UDMincho Medium','BIZ UDPMincho Medium','DengXian Light',
				'Georgia Pro Black','Georgia Pro Cond','Georgia Pro Cond Black','Georgia Pro Cond Light',
				'Georgia Pro Cond Semibold','Georgia Pro Light','Georgia Pro Semibold',
				'Gill Sans Nova Cond','Gill Sans Nova Cond Lt','Gill Sans Nova Cond Ultra Bold','Gill Sans Nova Cond XBd',
				'Gill Sans Nova Light','Gill Sans Nova Ultra Bold',
				'Rockwell Nova Cond','Rockwell Nova Cond Light','Rockwell Nova Extra Bold',
				'Verdana Pro Black',
				'Verdana Pro Cond','Verdana Pro Cond Black','Verdana Pro Cond Light','Verdana Pro Cond SemiBold',
				'Verdana Pro Light','Verdana Pro SemiBold',
				'Yu Mincho Demibold','Yu Mincho Light',
			*/
		],
	},
}

function get_fntCodes(name) {
	let list = fntCodePoints[name], str = ""
	list.forEach(function(code) {str += String.fromCodePoint(code)})
	return str
}

function set_fntList(os = isOS) {
	let fntListBaseName = isTB ? "allowlist" : "kBaseFonts"

	if (gLoad || isFontSizesMore !== isFontSizesPrevious) {
		isFontSizesPrevious = isFontSizesMore

		fntData = {
			"base": [], "bundled": [], "full": [],
			"control": [], "control_name": [],
			"generic": [],
		}

		// baseSize: add fallback for misconfigured/missing
		// isPlatformFont: expected + can't be blocked + differs vs most fonts
			// no entropy loss: size collisions of expected system fonts e.g. Tahoma
			// means not detected/recorded - but we _know_ it should be there
		let isPlatformFont
		let baseSize = ['monospace','sans-serif','serif']
		if ("windows" === os) {
			// Mō = 124 +"á" = 125 +"Ω" = 127 (win7)
			// Mō - 141 +"á" = 142 +"Ω" = 144 | Mō - 141 +tofu = 154 | (win11: have 182/186 fonts
			let tofu = get_fntCodes("tofu")
			fntString = isTB ? "?-"+ tofu : "Mō"+ tofu
			if (!isFontSizesMore) {isPlatformFont = "MS Shell Dlg \\32"}
			baseSize = [
				'monospace, Consolas, Courier, \"Courier New\", \"Lucida Console\"',
				'sans-serif, Arial',
				'serif, Times, Roman'
			]
		} else if ("mac" === os) {
			if (!isFontSizesMore) {isPlatformFont = "-apple-system"}
			baseSize = ['monospace, Menlo, Courier, \"Courier New\", Monaco',
				'sans-serif',
				'serif'
			]
		}

		// baseCtrl: 1-pass or 3-pass
		// baseCtrlNames: remove fallback e.g. "serif, X" -> "serif"
		let baseCtrl = isPlatformFont === undefined ? baseSize : [isPlatformFont]
		fntData["control"] = baseCtrl
		let baseCtrlNames = []
		baseCtrl.forEach(function(name) {
			baseCtrlNames.push(name.split(",")[0])
		})
		fntData["control_name"] = baseCtrlNames
		
		// generic: expand baseSize
			//'ui-monospace','ui-rounded','ui-serif','math','emoji','none' // redundant
		baseSize = baseSize.concat(['cursive','fantasy','fangsong','system-ui'])
		baseSize = baseSize.concat(isSystemFont)
		if (isPlatformFont !== undefined) {baseSize.push(isPlatformFont)}
		fntData["generic"] = baseSize.sort()

		// lists
		if (os !== undefined) {
			let fntFake = "--00"+ rnd_string()
			let array = [], aBundled = []
			fntMaster["bundled"]["allnotosans"].forEach(function(fnt) {aBundled.push("Noto Sans "+ fnt)})
			fntMaster["bundled"]["allnotoserif"].forEach(function(fnt) {aBundled.push("Noto Serif "+ fnt)})
			if (os == "linux" || isTB) {
				aBundled = aBundled.concat(fntMaster["bundled"][os])
			}
			if (os == "android") {
				// android
				aBundled = aBundled.concat(fntMaster["system"][os])
				array = array.concat(aBundled)
				fntData["full"] = array
			} else if (isTB) {
				// TB
				array = array.concat(aBundled)
				fntData["bundled"] = array
				array = array.concat(fntMaster["allowlist"][os])
				fntData["base"] = array
				array = array.concat(fntMaster["blocklist"][os])
				fntData["full"] = array
			} else {
				// FF
				if (os == "linux") {
					array = aBundled.concat(fntMaster["system"][os])
				} else {
					array = fntMaster["base"][os]
					fntData["base"] = array
					array = array.concat(fntMaster["system"][os])
				}
				fntData["full"] = array
			}
			// -control from lists
			if (isPlatformFont !== undefined) {
				let fntKeys = ["base","bundled","full"]
				fntKeys.forEach(function(key) {
					let array = fntData[key]
					 fntData[key] = array.filter(x => ![isPlatformFont].includes(x))
				})
			}
			// dupes
			let aCheck = fntData["full"]
			aCheck = aCheck.filter(function(item, position) {return aCheck.indexOf(item) === position})
			if (aCheck.length !== fntData["full"].length) {
				log_alert(SECT12, "dupes in "+ os +" font list")
				fntData["full"] = aCheck
			}
			// fntBtn
			let str = "fonts_"+ os
			fntData["full"].push(fntFake)
			fntData["full"].sort()
			fntBtn += addButton(12, str, fntData["full"].length, "btnc", "lists")
			if (fntData["base"].length) {
				fntData["base"].sort()
				fntBtn += addButton(12, str +"_"+ fntListBaseName, fntData["base"].length, "btnc", "lists")
			}
			// bundled: TB desktop
			if (isTB && os !== "android" && fntData["bundled"].length) {
				fntData["bundled"].sort()
				fntBtn += addButton(12, str +"_bundled", fntData["bundled"].length, "btnc", "lists")
			}
		}
	}
	// bail
	if (os === undefined) {return}

	// fnt*Btn data
	if (gRun) {
		let str = "fonts_"+ os
		addDetail(str, fntData["full"], "lists")
		addDetail(str +"_"+ fntListBaseName, fntData["base"], "lists")
		addDetail(str +"_bundled", fntData["bundled"], "lists")
	}
}

const get_default_proportional = () => new Promise(resolve => {
	const METRIC = "font_default_proportional"
	let res, fpvalue
	try {
		if (runSE) {foo++}
		res = window.getComputedStyle(document.body,null).getPropertyValue("font-family")
		fpvalue = res
	} catch(e) {
		res = log_error(SECT12, METRIC, e)
		fpvalue = zErr
	}
	log_display(12, METRIC, res)
	return resolve([METRIC, fpvalue])
})

const get_default_sizes = () => new Promise(resolve => {
	const METRIC = "font_default_sizes"
	try {
		if (runSE) {foo++}
		let oRes = {}
		let el = dom.dfsize
		let styles = [ // sorted
			'cursive','emoji','fangsong','fantasy','math','monospace','none','sans-serif',
			'serif','system-ui','ui-monospace','ui-rounded','ui-sans-serif','ui-serif',
		]
		styles.forEach(function(style) {
			el.style.fontFamily = style
			let size = getComputedStyle(el).getPropertyValue("font-size")
			if (oRes[size] == undefined) {oRes[size] = []}
			oRes[size].push(style)
		})
		let fpObj = {}
		for (const k of Object.keys(oRes).sort()) {fpObj[k] = oRes[k]} // sort obj
		let hash = mini(fpObj)
		addData(12, METRIC, fpObj, hash)
		log_display(12, METRIC, hash + addButton(12, METRIC))
		return resolve()
	} catch(e) {
		log_display(12, METRIC, log_error(SECT12, METRIC, e))
		return resolve([METRIC, zErr])
	}
})

const get_document_fonts = () => new Promise(resolve => {
	fntDocEnabled = false // reset global
	const METRIC = "document_fonts", fntTest = "\"Arial Black\""
	let res, fpvalue
	try {
		if (runSE) {foo++}
		let font = getComputedStyle(dom.divDocFont).getPropertyValue("font-family")
		fntDocEnabled = (font == fntTest ? true : false)
		if (!fntDocEnabled) {
			if (font.slice(0,11) == "Arial Black") {fntDocEnabled = true} // ext may strip quotes marks
		}
		res = (fntDocEnabled ? zE : zD) + " | " + font
		fpvalue = res
	} catch(e) {
		res = log_error(SECT12, METRIC, e)
		fpvalue = zErr
	}
	log_display(12, METRIC, res)
	return resolve([METRIC, fpvalue])
})

const get_font_sizes = () => new Promise(resolve => {
	/* https://github.com/abrahamjuliot/creepjs */
	try {
		if (runSE) {foo++}
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
				font-stretch: normal !important;
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

		// base sizes
		const base = fntData["generic"].reduce((acc, font) => {
			if (isSystemFont.includes(font)) { // not a family
				span.style.setProperty('--font', "")
				span.style.font = font
			} else {
				span.style.font = ""
				span.style.setProperty('--font', font)
			}
			const dimensions = getDimensions(span, style)
			acc[font.split(",")[0]] = dimensions // use only first name, i.e w/o fallback
			return acc
		}, {})
		// tidy base
		const METRICB = "fontsizes_base"
		addDetail(METRICB, {})
		let oTempBase = {}
		for (const k of Object.keys(base)) {
			let tmpHash = mini(base[k])
			if (oTempBase[tmpHash] == undefined) {
				oTempBase[tmpHash] = {"bases" : [k], "data" : base[k]}
			} else {
				oTempBase[tmpHash]["bases"].push(k)
			}
		}
		for (const h of Object.keys(oTempBase).sort()) {
			sDetail[isScope][METRICB][h] = oTempBase[h]
		}
		// return if not doing font sizes
		if (!fntData["full"].length || fntDocEnabled == false) {
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

		span.style.font = "" // reset
		// measure
		if (aTestsValid.length) {
			let isDetected = false, intDetected = 0, intDetectedMax = aTestsValid.length
			fntData["full"].forEach(font => {
				isDetected = false // have we found it
				intDetected = 0 // in all valid methods
				fntData["control"].forEach(basefont => {
					if (isDetected) {return}
					intDetected = 0 // reset per control
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
					if (intDetected == intDetectedMax && !isFontSizesMore) {isDetected = true}
					//isDetected = false // force max passes per font
					return
				})
			})
		}

		// tidy lies: none/all
		aTests.forEach(function(pair) {
			if (pair[1].length == 0) {
				pair[1].clear()
				pair[1].add("none")
			} else if (pair[1].length == fntData["full"].length) {
				pair[1].clear()
				pair[1].add("all") // includes fake font
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
		log_error(SECT12, "fontsizes", e)
		log_error(SECT12, "fontsizes_base", e)
		log_error(SECT12, "fontnames", e)
		return resolve(zErr)
	}
})

const get_fonts = () => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = "fontsizes"
	const METRICN = "fontnames"
	const METRICB = METRIC +"_base"

	// functions
	function exit(value) {
		let notation = (isSmart ? (isTB ? tb_red : rfp_red) : "")
		addDataDisplay(12, METRIC, value)
		addData(12, METRICN, value)
		log_display(12, METRICN, value + notation)
		if (value == zNA) {
			let baseReturn = get_baseHash()
		} else {
			log_display(12, METRICB, value)
			addData(12, METRICB, value)
		}
		log_perf(SECT12, METRIC, t0)
		return resolve()
	}
	function get_baseHash() {
		let display = "", baseBtn = ""
		try {
			let len = Object.keys(sDetail[isScope][METRICB]).length // recorded earlier
			if (len > 0) {
				display = mini(sDetail[isScope][METRICB])
				baseBtn = addButton(12, METRICB, len +"/"+ fntData["generic"].length)
				addData(12, METRICB, sDetail[isScope][METRICB], display, false)
			} else {
				display = log_error(SECT12, METRICB, zErrEmpty +": "+ cleanFn(sDetail[isScope][METRICB]))
				addData(12, METRICB, zErr)
			}
		} catch(e) {
			display = log_error(SECT12, METRICB, e)
			addData(12, METRICB, zErr)
		}
		log_display(12, METRICB, display + baseBtn)
	}

	// run
	get_font_sizes().then(res => {
		try {document.getElementById("font-fingerprint").remove()} catch(e) {} // remove element
		// quick exits
		if (res == "baseonly") {exit(zNA); return
		} else if ("string" === typeof res) {
			exit(zErr); return
		}

// test
//res["fontsScroll"] = ["scroll:monospace:3 x 3"]
//res["fontsOffset"] = ["mismatch:null"]
//res["fontsTransform"] = ["mismatch:NaN"], res["fontsTransformNumber"] = ["mismatch:NaN"]
//res["fontsPixel"] = ["zero dimensions"], res["fontsPixelNumber"] = ["zero dimensions"]
//res["fontsClient"] = []
//res["fontsPerspective"] = ["all"], res["fontsPerspectiveNumber"] = ["all"]

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
					hash = mini(data)
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
		get_baseHash()

		// collect size buckets, font names
			// handle mutiple sizes per font: e.g. monospace, serif
		let firstBaseFont = fntData["control_name"][0]
		for (const k of Object.keys(oData)) {
			let aOriginal = oData[k]["rawdata"]
			let aFontNames = []
			let oSizes = {}
			aOriginal.forEach(function(item) {
				let font = item.split(":")[0],
					basefont = item.split(":")[1],
					size = item.split(":")[2]
				aFontNames.push(font)
				let fontitem = (basefont == firstBaseFont && !isFontSizesMore ? font : font +" "+ basefont) // strip off 1st pass noise
				if (isFontSizesMore) {
					// just record each font + size
					if (oSizes[font] == undefined) {oSizes[font] = {}}
					oSizes[font][basefont] =[size.split(" x ")[0] *1, size.split(" x ")[1] *1]
				} else {
					if (oSizes[size] == undefined) {oSizes[size] = []}
					// exclude same-size per font: e.g. "w x h": ["A", "A sans-serif", "A serif"]
						// ^ no need: we never force 3-pass per font
					//if (!oSizes[size].includes(font)) {
						oSizes[size].push(fontitem)
					//}
				}
			})
			// sort
			let aNew = {}
			for (const j of Object.keys(oSizes).sort()) {aNew[j] = oSizes[j]}
			// replace
			oData[k]["newdata"] = aNew
			oData[k]["hash"] = mini(aNew)
			// dedupe
			if (isFontSizesMore) {
				aFontNames = aFontNames.filter(function(item, position) {return aFontNames.indexOf(item) === position})
			}
			oData[k][METRICN] = aFontNames
		}
		//console.log(oData)
		//console.log(aIgnore)

		// TEMP OUTPUT
		aIgnore.forEach(function(item) {
			let el = item.split(":")[0],
				value = item.split(":")[1]
			document.getElementById(el).innerHTML = value
		})
		// tmp nothing
		if (!Object.keys(oData).length) {
			log_display(12, METRIC, "unknown")
			addData(12, METRIC, zLIE)
			addData(12, METRICN, zLIE)
		}
		for (const k of Object.keys(oData)) {
			let aList = oData[k]["names"]
			for (let i=0; i < aList.length; i++) {
				let btn = ""
				if (i == 0) {
					let tmpName = METRIC +"_"+ aList[i]
					addDetail(tmpName, oData[k]["newdata"])
					btn = addButton(12, tmpName)
				}
				log_display(12, aList[i], oData[k]["hash"] + btn)

				if (aList[i] == "fontsTransformNumber") {
					// names: not needed in FP but include for upstream
					let fontNameHash = mini(oData[k][METRICN])
					let fontNameLen = oData[k][METRICN].length
					addData(12, METRICN, oData[k][METRICN], fontNameHash)
					fontNameHash += addButton(12, METRICN, fontNameLen)

					// names: notate if we have base fonts
					if (isSmart && fntData["base"].length) {
						let aNotInBase = oData[k][METRICN], aMissing = []
						aNotInBase = aNotInBase.filter(x => !fntData["base"].includes(x))
						if (isTB) {
							aMissing = fntData["bundled"]
							aMissing = aMissing.filter(x => !oData[k][METRICN].includes(x))
						}
						let count = aNotInBase.length + aMissing.length
						if (count > 0) {
							let tmpName = METRICN +"_health", tmpObj = {}
							if (aMissing.length) {tmpObj["missing_bundled"] = aMissing}
							if (aNotInBase.length) {tmpObj["unexpected"] = aNotInBase}
							addDetail(tmpName, tmpObj)
							let brand = isTB ? (isMullvad ? "MB" : "TB") : "RFP"
							fontNameHash += addButton("bad", tmpName, "<span class='health'>"+ cross + "</span> "+ count +" "+ brand)
						} else {
							fontNameHash += isTB ? tb_green : rfp_green
						}
					}
					// sizes
					let sizeHash = oData[k]["hash"]
					let sizeLen = Object.keys(oData[k]["newdata"]).length
					addData(12, METRIC, oData[k]["newdata"], sizeHash)
					log_display(12, METRIC, sizeHash + addButton(12, METRIC, (isFontSizesMore ? "details" : sizeLen)))
					log_display(12, METRICN, fontNameHash)
// temp: record size counts when running thousands of getFont loops
//iFntTestCount = lenReturn
				}
			}
		}

		log_perf(SECT12, METRIC, t0)
		return resolve()

		/*
		// only count if valid: i.e from oData
		let getGreatestOccurrence = list => list.reduce((greatest , currentValue, index, list) => {
			let count = list.filter(item => JSON.stringify(item) == JSON.stringify(currentValue)).length
			if (count > greatest.count) {
				return {count, item: currentValue}
			}
			return greatest
		}, { count: 0, item: undefined })
		let greatest = getGreatestOccurrence(fntHashes)
		if (greatest.count == 3) { "do something" }
		*/
	})
})

const get_formats = () => new Promise(resolve => {
	// FF105+: layout.css.font-tech.enabled
	const oList = {
	"font-format": ["collection","embeddedopentype","opentype","svg","truetype","woff","woff2"],
	"font-tech": ["color-CBDT","color-COLRv0","color-COLRv1","color-SVG","color-sbix",
		"features-aat","features-graphite","features-opentype","incremental","palettes","variations"]
	}
	let res = []
	for (const k of Object.keys(oList)) {
		let array = oList[k]
		const METRIC = k
		let aRes = []
		try {
			if (runSE) {foo++}
			array.forEach(function(item) {
				if (CSS.supports(k +"("+ item + ")")) {aRes.push(item)}
			})
			if (aRes.length) {
				let hash = mini(aRes)
				addData(12, METRIC, aRes, hash)
				log_display(12, METRIC, hash + addButton(12, METRIC, aRes.length))
			} else {
				// not supported
				log_display(12, METRIC, zNA)
				res.push([k, zNA])
			}
		} catch(e) {
			log_display(12, METRIC, log_error(SECT12, k, e, isScope, 25))
			res.push([k, zErr])
		}
	}
	if (res.length) {return resolve(res)} else {return resolve()}
})

const get_graphite = () => new Promise(resolve => {
	// ToDo: create a much smaller tff with just i+j in it
		// and maybe load as base64
	const METRIC = "graphite"
	let res = "", notation = ""
	function exit() {
		log_display(12, METRIC, res + notation)
		return resolve([METRIC, res])
	}
	if (fntDocEnabled) {
		let test = dom.testGraphite.offsetWidth
		let control = dom.ctrlGraphite.offsetWidth
		res = (control === test ? zF : zS)
		if (isTB && isSmart) {
			notation = res === zS ? tb_standard : tb_safer
		}
		exit()
	} else {
		res = "document fonts blocked"
		if (isTB && isSmart) {notation = tb_red}
		exit()
	}
})

const get_system_fonts = (os = isOS) => new Promise(resolve => {
	// ToDo: expand or reduce: e.g
		// -moz-desktop seems deprecated
		// FF117 1838222 '-moz-message-bar'
	const METRIC = "system_fonts"
	let aList = ['-moz-button','-moz-button-group','-moz-desktop','-moz-dialog','-moz-document',
		'-moz-field','-moz-info','-moz-list','-moz-pull-down-menu','-moz-window','-moz-workspace',
		'caption','icon','menu','message-box','small-caption','status-bar',
	]
	let aProps = ['font-size','font-style','font-weight','font-family']
	let oRes = {}, notation = ""
	let check = (isSmart && isTB)
	try {
		if (runSE) {foo++}
		let el = dom.sysFont
		aList.forEach(function(name){
			let aKeys = []
			el.style.font = name
			for (const k of aProps) {aKeys.push(getComputedStyle(el)[k])}
			let key = aKeys.join(" ")
			if (oRes[key] == undefined) {oRes[key] = [name]} else {oRes[key].push(name)}
		})
		let newobj = {}, count = 0
		for (const k of Object.keys(oRes).sort()) {newobj[k] = oRes[k]; count += newobj[k].length}
		let hash = mini(newobj)
		if (check) {
			// https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41646
			notation = tb_red
			if (os == "windows") {
				/* "12px normal 400 sans-serif" */
				if (hash == "c89fb033") {notation = tb_green}
			} else if (os == "mac") {
				if (hash == "1dc326ac") {notation = tb_green}
			} else if (os == "linux") {
				/* "15px normal 400 sans-serif" */
				if (hash == "7b469d36") {notation = tb_green}
			} else if (os == "android") {
				/* currently "16px normal 400 " (computedStyle font-family is missing) */
				if (hash == "") {notation = tb_green}
			}
		}
		addData(12, METRIC, newobj, hash)
		log_display(12, METRIC, hash + addButton(12, METRIC, Object.keys(newobj).length +"/"+ count) + notation)
		return resolve()
	} catch(e) {
		notation = check ? tb_red : ""
		log_display(12, METRIC, log_error(SECT12, METRIC, e) + notation)
		return resolve([METRIC, zErr])
	}
})

const get_widget_fonts = (os = isOS) => new Promise(resolve => {
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
	const METRIC = "widget_fonts"
	let aList = [
		'button','checkbox','color','combobox','datetime','datetime-local','email','file','hidden','image','month',
		'number','password','radio','range','reset','search','submit','tel','text','textarea','time','url','week',
	]
	let notation = ""
	try {
		if (runSE) {foo++}
		let oRes = {}
		aList.forEach(function(name) {
			let el = dom["widget"+ name]
			let key = getComputedStyle(el).getPropertyValue("font-family")
				+" "+ getComputedStyle(el).getPropertyValue("font-size")
			if (oRes[key] == undefined) {oRes[key] = [name]} else {oRes[key].push(name)}
		})
		let newobj = {}, count = 0
		for (const k of Object.keys(oRes).sort()) {newobj[k] = oRes[k]; count += newobj[k].length}
		let hash = mini(newobj)
		if (isSmart && isTB) {
			notation = tb_red
			if (os == "windows") {
				/* 
				"monospace 13.3333px": ["datetime", "datetime-local", "time"],
				"monospace 13px": ["textarea"],
				"sans-serif 13.3333px": [19 items],
				"sans-serif 13px": ["image"]
				*/
				if (hash == "c67d44bc") {notation = tb_green}
			} else if (os == "mac") {
				if (hash == "07a7a13c") {notation = tb_green}
			} else if (os == "linux" || os == "android") {
				/*
				"monospace 12px": ["textarea"],
				"monospace 13.3333px": ["datetime", "datetime-local", "time"],
				"sans-serif 13.3333px": [19 items],
				"sans-serif 13px": ["image"]
				*/
				// regression: TBA13 is missing font-family on the 19 items
				if (hash == "dedd903d") {notation = tb_green}
			}
		}
		addData(12, METRIC, newobj, hash)
		log_display(12, METRIC, hash + addButton(12, METRIC, Object.keys(newobj).length +"/"+ count) + notation)
		return resolve()
	} catch(e) {
		notation = (isSmart && isTB ? tb_red : "")
		log_display(12, METRIC, log_error(SECT12, METRIC, e) + notation)
		return resolve([METRIC, zErr])
	}
})

const get_unicode = () => new Promise(resolve => {
	/* https://www.bamsoftware.com/talks/fc15-fontfp/fontfp.html#demo */
	// FF86+: 1676966: gfx.font_rendering.fallback.async
		// set code chars directly in HTML to force fallback ASAP

	let t0 = nowFn()
	let styles = ["cursive","monospace","sans-serif","serif","system-ui"] // system-ui = FF92+
	// don't use "none": this is default style + font per style for each language
		// and is already present in covering monospace/sans-serif/serif
		// "fantasy" vs sans-serif | "fangsong" vs serif both add very little

	function group(name, objname, data) {
		// group by style then char
		let newobj = {}
		styles.forEach(function(style) {newobj[style] = []})
		if (name == "offset" || name == "clientrect") {
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
		let hash = mini(newobj)
		// record valid results
		oObject[objname] = {
			"data": newobj,
			"hash": hash
		}
		return hash // for display
	}

	let oObject = {}, oDisplay = {}
	function output() {
		let res = []
		let aList = [["offset", aOffset], ["clientrect", aClient]]
		for (const n of Object.keys(oTM)) {	aList.push([n])}
		let errLong = ["offset","clientrect","width","alphabeticBaseline"]
		aList.forEach(function(array) {
			const name = array[0]
			let prefix = "textmetrics_"
			if (name == "width" || name == "clientrect" || name == "offset") {prefix = "glyphs_"}
			const METRIC = prefix + name
			let isString = true
			let data = array[1] == undefined ? oTM[name]["data"] : array[1]
			let display = "", value = ""
			let errCheck = oCatch[name]
			if (errCheck !== undefined) {
				display = errLong.includes(name) ? errCheck : errCheck.slice(0,22) +"..."
				if (isTB && isSmart && name.slice(0,6) == "actual") {
					display += tb_red
				}
				value = zErr
			} else if (data.length) {
				let value = group(name, METRIC, data)
				display = value + addButton(12, METRIC)
				// notate
				if (isTB && isSmart && name.slice(0,6) == "actual") {
					display += tb_red
				}
				isString = false
			} else {
				// empty object
				if (name !== "offset" && name !== "clientrect") {
					if (!TextMetrics.prototype.hasOwnProperty(name)) {
						value = zNA
						display = zNA
						// notate
						if (isSmart && isTB) {
							if (name.slice(0,6) == "actual") {display += tb_green}
						}
					}
				}
			}
			if (isString) {res.push([METRIC, value])}
			oDisplay[METRIC] = display
		})
		// oObject + oDisplay: can be altered before final add/display
		for (const k of Object.keys(oObject).sort()) {
			addData(12, k, oObject[k]["data"], oObject[k]["hash"])
		}
		// display
		for (const k of Object.keys(oDisplay)) {
			log_display(12, k, oDisplay[k])
		}
		log_perf(SECT12, "unicode glyphs",t0)
		return resolve(res)
	}

	// vars
	let oCatch = {}, aOffset = [], aClient = []
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
		"width","actualBoundingBoxAscent","actualBoundingBoxDescent",
		"actualBoundingBoxLeft","actualBoundingBoxRight",
		/* test:  false = only get the first glyph measurement
		"alphabeticBaseline",
		"emHeightAscent",
		"emHeightDescent",
		"fontBoundingBoxAscent",
		"fontBoundingBoxDescent",
		"hangingBaseline",
		"ideographicBaseline",
		//*/
	]
	for (const k of Object.keys(oTM)) {
		oTM[k]["data"] = []
		oTM[k]["proceed"] = TextMetrics.prototype.hasOwnProperty(k)
		oTM[k]["all"] = aAll.includes(k)
	}

	function run() {
		let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot,
			canvas = dom.ugCanvas, ctx = canvas.getContext("2d")
		// each char
		fntCodes.forEach(function(code) {
			let	codeString = String.fromCodePoint(code)
			slot.textContent = codeString // set once
			let isFirst = code == fntCodes[0]
			// each style
			styles.forEach(function(stylename) {
				slot.style.fontFamily = stylename
				// offset: span width, div height
				if (isOffset) {
					try {
						if (runSE) {foo++}
						let oWidth = span.offsetWidth,
							oHeight = div.offsetHeight
						if (runST) {oWidth = "a", oHeight = true}
						if ("number" === typeof oWidth && "number" === typeof oHeight) {
							aOffset.push([stylename, code, oWidth, oHeight])
						} else {
							isOffset = false // stop checking
							oCatch["offset"] = log_error(SECT12, "glyphs_offset", zErrType + typeof oWidth +" x "+ typeof oHeight)
						}
					} catch(e) {
						oCatch["offset"] = log_error(SECT12, "glyphs_offset", e)
						isOffset = false
					}
				}
				// clientrect
				// ToDo: isClientRect: we only need one valid method
				if (isClient) {
					try {
						if (runSE) {foo++}
						let cDiv = div.getBoundingClientRect()
						let cSpan = span.getBoundingClientRect()
						let cWidth = cSpan.width,
							cHeight = cDiv.height
						if (runST) {cWidth = "a", cHeight = null}
						if ("number" === typeof cWidth && "number" === typeof cHeight) {
							aClient.push([stylename, code, cWidth, cHeight])
						} else {
							isClient = false // stop checking
							oCatch["clientrect"] = log_error(SECT12, "glyphs_clientrect", zErrType + typeof cWidth +" x "+ typeof cHeight)
						}
					} catch(e) {
						oCatch["clientrect"] = log_error(SECT12, "glyphs_clientrect", e)
						isClient = false
					}
				}
				// canvas
				if (isCanvas) {
					try {
						ctx.font = "normal normal 22000px "+ stylename
						if (runSE) {foo++}
						let tm = ctx.measureText(codeString)
						// textmetrics
						for (const k of Object.keys(oTM)) {
							if (oTM[k]["proceed"]) {
								let prefix = k == "width" ? "glyphs_" : "textmetrics_"
								try {
									let isOnce = oTM[k]["all"] == false && isFirst
									if (oTM[k]["all"] || isOnce) {
										let measure = tm[k]
										if (runST) {measure = undefined}
										if ("number" === typeof measure) {
											if (isOnce) {
												oTM[k]["data"].push([stylename, measure])
											} else {
												oTM[k]["data"].push([stylename, code, measure])
											}
										} else {
											oTM[k]["proceed"] = false // stop checking
											oCatch[k] = log_error(SECT12, prefix + k, zErrType + typeof measure)
										}
									}
								} catch(e) {
									oCatch[k] = log_error(SECT12, prefix + k, e)
									oTM[k]["proceed"] = false
								}
							}
						}
					} catch(e) {
						for (const k of Object.keys(oTM)) {
							if (oTM[k]["proceed"]) {
								let m = (k == "width" ? "glyphs" : "textmetrics") +"_"+ k
								oCatch[k] = log_error(SECT12, m, e)
							}
						}
						isCanvas = false
					}
				}
			})
		})
		dom.ugSlot = ""
		output()
	}
	
	function reduce_codepoints() {
		// s/be good script support
		if (isOS == "android") {return}
		let fntReduce = []

		// windows
		if (isOS == "windows") {
			if (isTB) {
				fntReduce = [
					'0x09B3','0xF003','0xF810', // 3 tofu
					'0x20B9', // = 0x20BA
				]
			} else if (isVer > 115) { // 116+ is win10+ only
				fntReduce = [
					'0x007F', '0x09B3', '0xF003', '0xF810', '0xFFF9', // 5 tofu w/ all supplemental fonts
					'0x20B9', // = 0x20BA
					'0x3095', // = 0x532D
				]
			}
		}
		// TB12 or lower: 0xFFFD is not stable (in windows)
		if (isTB && isVer < 115) {
			// replacement character: https://en.wikipedia.org/wiki/Specials_(Unicode_block)#Replacement_character
			// https://thorin-oakenpants.github.io/testing/FFFD.html
				// win FF: always Segoe UI
				// win MB: always Malgun Gothic
				// win TB102
					// on first document tab/run (and reloading the same tab) = tahoma
					// on subsequent tabs = Malgun Gothic
			fntReduce.push(`0xFFFD`)
		}
		if (fntCodes.length) {
			fntCodes = fntCodes.filter(x => !fntReduce.includes(x))
			return
		}
		if (isTB) {return}

		let reduceStart = nowFn()
		// check likely unsupported scripts: e.g. win7: 12/21, +RFP = 20/21
		let fntReducePossible = [
			'0x007F','0x058F','0x0700','0x08E4','0x097F','0x09B3','0x0B82','0x0D02','0x10A0','0x115A','0x17DD',
			'0x1C50','0x1CDA','0x20BD','0x2C7B','0xA73D','0xA830','0xF003','0xF810','0xFBEE','0xFFF9',
		]
		try {
		let fntReduceChars = []
			let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot
			slot.style.fontFamily = "none"
			slot.textContent = String.fromCodePoint('0xFFFF')
			let tofuWidth = span.offsetWidth,
				tofuHeight = div.offsetHeight
			fntReducePossible.forEach(function(code) {
				slot.textContent = String.fromCodePoint(code)
				if (span.offsetWidth == tofuWidth && div.offsetHeight == tofuHeight) {
					fntReduce.push(code)
					fntReduceChars.push(String.fromCodePoint(code))
				}
			})
			fntCodes = fntCodes.filter(x => !fntReduce.includes(x))
			log_perf(SECT12, "tofu", reduceStart, "", fntReduce.length +"/"+ fntReducePossible.length)
			t0 = nowFn()
		} catch(e) {}
	}
	// do once
	if (fntCodes.length == 0) {
		fntCodePoints["test"].forEach(function(code) {fntCodes.push(code)})
		reduce_codepoints()
		fntCodes.push('0xFFFF') // ensure tofu
	}
	run()
})

const get_woff2 = () => new Promise(resolve => {
	const METRIC = "woff2"
	try {
		const supportsWoff2 = (function(){
			const font = new FontFace('t', 'url("data:font/woff2;base64,d09GMgABAAAAAADwAAoAAAAAAiQAAACoAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAALAogOAE2AiQDBgsGAAQgBSAHIBuDAciO1EZ3I/mL5/+5/rfPnTt9/9Qa8H4cUUZxaRbh36LiKJoVh61XGzw6ufkpoeZBW4KphwFYIJGHB4LAY4hby++gW+6N1EN94I49v86yCpUdYgqeZrOWN34CMQg2tAmthdli0eePIwAKNIIRS4AGZFzdX9lbBUAQlm//f262/61o8PlYO/D1/X4FrWFFgdCQD9DpGJSxmFyjOAGUU4P0qigcNb82GAAA") format("woff2")', {});
			font.load().catch(err => {
				// NetworkError: A network error occurred. < woff2 disabled/downloadable | fonts blocked e.g. uBO
				// ReferenceError: FontFace is not defined < layout.css.font-loading-api.enabled
				log_display(12, METRIC, log_error(SECT12, METRIC, err))
			})
			return font.status == "loaded" || font.status == "loading"
		})()
		let value = (supportsWoff2 ? zS : zF)
		log_display(12, METRIC, value)
		return resolve([METRIC, value])
	} catch(e) {
		log_display(12, METRIC, log_error(SECT12, METRIC, e))
		return resolve([METRIC, zErr])
	}
})

function outputFonts() {
	let t0 = nowFn()
	set_fntList()
	Promise.all([
		get_document_fonts(), // sets fntDocEnabled
		get_default_proportional(),
		get_default_sizes(),
		get_unicode(),
		get_formats(),
		get_system_fonts(),
		get_widget_fonts(),
		get_woff2(),
		get_fonts(), // uses fntDocEnabled
		get_graphite(), // uses fntDocEnabled
	]).then(function(results){
		results.forEach(function(item) {addDataFromArray(12, item)})
		log_display(12, "fntBtn", fntBtn)
		log_section(12, t0)
	})
}

countJS(SECT12)
