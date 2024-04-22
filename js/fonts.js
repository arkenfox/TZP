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
		'0xA830','0xF003','0xF810','0xFBEE','0xFFF9',
		// '0xFFFD', // problematic
			// replacement character: https://en.wikipedia.org/wiki/Specials_(Unicode_block)#Replacement_character
			// https://thorin-oakenpants.github.io/testing/FFFD.html
			// win FF: always Segoe UI
			// win MB: always Malgun Gothic
			// win TB102
				// on first document tab/run (and reloading the same tab) = tahoma
				// on subsequent tabs = Malgun Gothic
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
	fntDocEnabled = false,
	fntBases = {}

let fntMaster = {
	// android core noto fonts
	'android': {
		'notoboth': [
			// sans: 5+ except CJK JP + Gujarati + Gurmukhi + Tibetan 9+
			// serifs: 9+ except tibetan 12+
			'Armenian','Bengali','CJK JP','Devanagari','Ethiopic','Georgian','Gujarati','Gurmukhi','Hebrew','Kannada',
			'Khmer','Lao','Malayalam','Myanmar','Sinhala','Tamil','Telugu','Thai','Tibetan',
		],
		'notosans': [
			// 5+
			'Bengali UI','Devanagari UI','Khmer UI','Lao UI','Malayalam UI','Myanmar UI','Symbols','Tamil UI','Telugu UI','Thai UI',
			// 9+
			'Adlam','Ahom','Anatolian Hieroglyphs','Avestan','Balinese','Bamum','Bassa Vah','Batak','Bhaiksuki','Brahmi','Buginese','Buhid',
			'Canadian Aboriginal','Carian','Chakma','Cham','Cherokee','Coptic','Cuneiform','Cypriot','Deseret','Egyptian Hieroglyphs',
			'Elbasan','Glagolitic','Gothic','Gujarati UI','Gurmukhi UI','Hanunoo','Hatran','Imperial Aramaic','Inscriptional Pahlavi',
			'Inscriptional Parthian','Javanese','Kaithi','Kayah Li','Kharoshthi','Lepcha','Limbu','Linear A','Linear B','Lisu','Lycian',
			'Lydian','Mandaic','Manichaean','Marchen','Meetei Mayek','Meroitic','Miao','Mongolian','Mro','Multani','Nabataean','Newa',
			'New Tai Lue','NKo','Ogham','Ol Chiki','Old Italic','Old North Arabian','Old Permic','Old Persian','Old South Arabian',
			'Old Turkic','Oriya','Oriya UI','Osage','Osmanya','Pahawh Hmong','Palmyrene','Pau Cin Hau','Phags Pa','Phoenician','Rejang',
			'Runic','Samaritan','Saurashtra','Sharada','Shavian','Sinhala UI','Sora Sompeng','Sundanese','Syloti Nagri','Syriac Eastern',
			'Syriac Estrangela','Syriac Western','Tagalog','Tagbanwa','Tai Le','Tai Tham','Tai Viet','Thaana','Tifinagh','Ugaritic','Vai','Yi',
			// 12+
			'Grantha','Gunjala Gondi','Hanifi Rohingya','Khojki','Masaram Gondi','Medefaidrin','Modi','Soyombo','Takri','Wancho','Warang Citi',
		],
		'notoserif': [
			'Dogra','Nyiakeng Puachue Hmong','Yezidi', // 12+
		],
	},
	// TB13 bundled: reuse for android/linux
	'bundled': {
		// all: win/mac/linux: 80sans-only 4serif-only 17both: total 118, sorted hash: 8949a424
		'notoboth': [
			'Balinese','Bengali','Devanagari','Ethiopic','Georgian','Grantha','Gujarati','Gurmukhi','Kannada','Khmer',
			'Khojki','Lao','Malayalam','Myanmar','Sinhala','Tamil','Telugu',
		],
		'notosans': [
			'Adlam','Bamum','Bassa Vah','Batak','Buginese','Buhid','Canadian Aboriginal','Chakma','Cham','Cherokee',
			'Coptic','Deseret','Elbasan','Gunjala Gondi','Hanifi Rohingya','Hanunoo','Javanese','Kayah Li','Khudawadi',
			'Lepcha','Limbu','Lisu','Mahajani','Mandaic','Masaram Gondi','Medefaidrin','Meetei Mayek','Mende Kikakui',
			'Miao','Modi','Mongolian','Mro','Multani','NKo','New Tai Lue','Newa','Ol Chiki','Oriya','Osage','Osmanya',
			'Pahawh Hmong','Pau Cin Hau','Rejang','Runic','Samaritan','Saurashtra','Sharada','Shavian','Sora Sompeng',
			'Soyombo','Sundanese','Syloti Nagri','Symbols','Symbols 2','Syriac','Tagalog','Tagbanwa','Tai Le','Tai Tham',
			'Tai Viet','Takri','Thaana','Tifinagh','Tifinagh APT','Tifinagh Adrar','Tifinagh Agraw Imazighen',
			'Tifinagh Ahaggar','Tifinagh Air','Tifinagh Azawagh','Tifinagh Ghat','Tifinagh Hawad','Tifinagh Rhissa Ixa',
			'Tifinagh SIL','Tifinagh Tawellemmet','Tirhuta','Vai','Wancho','Warang Citi','Yi','Zanabazar Square',
		],
		'notoserif': ['Dogra','NP Hmong','Tibetan','Yezidi',],
		'android': [],
		// notos then linux +16, mac +5, win +4
		'linux': [
			'Arimo','Cousine','Noto Naskh Arabic','Noto Sans Armenian','Noto Sans Hebrew','Noto Sans JP','Noto Sans KR',
			'Noto Sans SC','Noto Sans TC','Noto Sans Thai','Noto Serif Armenian','Noto Serif Hebrew','Noto Serif Thai',
			'STIX Two Math','Tinos','Twemoji Mozilla',
		],
		'mac': ['Noto Sans Armenian','Noto Sans Hebrew','Noto Serif Armenian','Noto Serif Hebrew','STIX Two Math',],
		'windows': ['Noto Naskh Arabic','Noto Sans','Noto Serif','Twemoji Mozilla',],
	},
	// TB whitelist system
	'allowlist': {
		'android': [],
		'linux': [],
		'mac': [
			'AppleGothic','Apple Color Emoji','Arial','Courier','Courier New',
			'Geneva','Georgia','Heiti TC','Helvetica','Helvetica Neue','Hiragino Kaku Gothic ProN',
			'Kailasa','Lucida Grande','Menlo','Monaco','PingFang HK','PingFang SC','PingFang TC','Songti SC',
			'Songti TC','Tahoma','Thonburi','Times','Times New Roman','Verdana',
			// always
			'-apple-system',
			/* variants
			'Hiragino Kaku Gothic ProN W3','Hiragino Kaku Gothic ProN W6',
			*/
		],
		'windows': [
			// 7
			'Arial','Cambria Math','Consolas','Courier New','Georgia','Lucida Console','MS Gothic','MS PGothic','MV Boli',
			'Malgun Gothic','Microsoft Himalaya','Microsoft JhengHei','Microsoft YaHei','Segoe UI','SimSun','Sylfaen',
			'Tahoma','Times New Roman','Verdana',
			// localized
			'微软雅黑','ＭＳ ゴシック','ＭＳ Ｐゴシック','宋体', // Microsoft YaHei, MS Gothic, MS PGothic, SimSun
			// system aliases
				// https://searchfox.org/mozilla-central/source/gfx/thebes/gfxDWriteFontList.cpp#1990
				// should always be the same but lets test everything in TB
			'MS Serif','Courier','Small Fonts','Roman', // TNR, Courier New, Arial, TNR
			// isPlatformFont
			'MS Shell Dlg \\32',
			// FontSubstitutes
				// HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\FontSubstitutes
				// TB FontSubstitutes -> whitelisted
			'Arabic Transparent','Arial (Arabic)','Arial (Hebrew)','Arial Baltic','Arial CE','Arial CYR',
			'Arial Greek','Arial TUR','Courier New (Hebrew)','Courier New Baltic','Courier New CE',
			'Courier New CYR','Courier New Greek','Courier New TUR','Helvetica','MS Shell Dlg 2','Tahoma Armenian',
			'Times','Times New Roman (Hebrew)','Times New Roman Baltic','Times New Roman CE','Times New Roman CYR',
			'Times New Roman Greek','Times New Roman TUR','Tms Rmn','MS Serif Greek','Small Fonts Greek',
			'標準ゴシック','ゴシック','ｺﾞｼｯｸ', // ＭＳ ゴシック -> MS Gothic
			'ﾍﾙﾍﾞﾁｶ','ﾀｲﾑｽﾞﾛﾏﾝ','ｸｰﾘｴ', // Arial, TNR, Courier - >Courier New
			/* ignore
			// variants
				'Arial Black','Arial Narrow','Segoe UI Light','Segoe UI Semibold', // 7
				'Segoe UI Semilight', // 8
				'Microsoft JhengHei Light','Microsoft YaHei Light','Segoe UI Black', // 8.1
				'Malgun Gothic Semilight', // 10
			*/
		],
	},
	// TB unexpected
	'blocklist': {
		'android': [],
		'linux': [
			'Arial','Courier New','Times New Roman', // aliases
			'Courier','Noto Color Emoji','Noto Emoji','Noto Mono','Noto Sans','Noto Serif', // notos
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX', // fedora
			'Dingbats','FreeMono','Ubuntu', // ubuntu
			'Liberation Mono','Liberation Sans','Liberation Serif', // popular
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math', // TB12 fontnames
		],
		'mac': [
			'Apple Symbols','Avenir','Charter','Impact','Palatino','Rockwell', // system
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math', // TB12 fontnames
			'.Helvetica Neue DeskInterface', // dot-prefixed font families on mac = hidden // tb#42377
			// not detected: we may whitelist these
			'Arial Black','Arial Narrow',
		],
		'windows': [
			'Calibri', //'Impact','Candara','Corbel','Ebrima','Gabriola', // system
			'MS Dlg Shell', // system that should point to Microsoft Sans Serif
			'Gill Sans','Gill Sans MT', // MS bundled
			'Noto Serif Hmong Nyiakeng', //'Noto Sans Symbols2', // TB12 fontnames
		],
	},
	// kBaseFonts: https://searchfox.org/mozilla-central/search?path=StandardFonts*.inc
	'base': {
		'android': [],
		'linux': [],
		'mac': [
			// always
			'-apple-system',
			//kBaseFonts
			'Al Bayan','Al Nile','Al Tarikh','American Typewriter','Andale Mono','Apple Braille','Apple Chancery',
				'Apple Color Emoji','Apple SD Gothic Neo','Apple Symbols','AppleGothic','AppleMyungjo','Arial',
				'Arial Black','Arial Hebrew','Arial Hebrew Scholar','Arial Narrow','Arial Rounded MT Bold',
				'Arial Unicode MS','Avenir','Avenir Next','Ayuthaya',
			'Baghdad','Bangla MN','Bangla Sangam MN','Baskerville','Beirut','Big Caslon','Bodoni 72',
				'Bodoni 72 Oldstyle','Bodoni 72 Smallcaps','Bodoni Ornaments','Bradley Hand','Brush Script MT',
			'Chalkboard','Chalkboard SE','Chalkduster','Charter','Cochin','Comic Sans MS','Copperplate',
				'Corsiva Hebrew','Courier','Courier New',
			'DIN Alternate','DIN Condensed','Damascus','DecoType Naskh','Devanagari MT','Devanagari Sangam MN',
				'Didot','Diwan Kufi','Diwan Thuluth',
			'Euphemia UCAS',
			'Farah','Farisi','Futura',
			'GB18030 Bitmap','Galvji','Geeza Pro','Geneva','Georgia','Gill Sans','Gujarati MT','Gujarati Sangam MN',
				'Gurmukhi MN','Gurmukhi MT','Gurmukhi Sangam MN',
			'Heiti SC','Heiti TC','Helvetica','Helvetica Neue','Hoefler Text','Hiragino Maru Gothic ProN',
				'Hiragino Mincho ProN','Hiragino Sans','Hiragino Sans GB',
			'ITF Devanagari','ITF Devanagari Marathi','Impact','InaiMathi',
			'Kailasa','Kannada MN','Kannada Sangam MN','Kefa','Khmer MN','Khmer Sangam MN','Kohinoor Bangla',
				'Kohinoor Devanagari','Kohinoor Gujarati','Kohinoor Telugu','Kokonor','Krungthep','KufiStandardGK',
			'Lao MN','Lao Sangam MN','Lucida Grande','Luminari',
			'Malayalam MN','Malayalam Sangam MN','Marker Felt','Menlo','Microsoft Sans Serif','Mishafi','Mishafi Gold',
				'Monaco','Mshtakan','Mukta Mahee','Muna','Myanmar MN','Myanmar Sangam MN',
			'Nadeem','New Peninim MT','Noteworthy',
			'Noto Nastaliq Urdu',
			'Noto Sans Adlam','Noto Sans Armenian','Noto Sans Avestan','Noto Sans Bamum','Noto Sans Bassa Vah',
				'Noto Sans Batak','Noto Sans Bhaiksuki','Noto Sans Brahmi','Noto Sans Buginese','Noto Sans Buhid',
				'Noto Sans Canadian Aboriginal','Noto Sans Carian','Noto Sans Caucasian Albanian','Noto Sans Chakma',
				'Noto Sans Cham','Noto Sans Coptic','Noto Sans Cuneiform','Noto Sans Cypriot','Noto Sans Duployan',
				'Noto Sans Egyptian Hieroglyphs','Noto Sans Elbasan','Noto Sans Glagolitic','Noto Sans Gothic',
				'Noto Sans Gunjala Gondi','Noto Sans Hanifi Rohingya','Noto Sans Hanunoo','Noto Sans Hatran',
				'Noto Sans Imperial Aramaic','Noto Sans Inscriptional Pahlavi','Noto Sans Inscriptional Parthian',
				'Noto Sans Javanese','Noto Sans Kaithi','Noto Sans Kannada','Noto Sans Kayah Li','Noto Sans Kharoshthi',
				'Noto Sans Khojki','Noto Sans Khudawadi','Noto Sans Lepcha','Noto Sans Limbu','Noto Sans Linear A',
				'Noto Sans Linear B','Noto Sans Lisu','Noto Sans Lycian','Noto Sans Lydian','Noto Sans Mahajani',
				'Noto Sans Mandaic','Noto Sans Manichaean','Noto Sans Marchen','Noto Sans Masaram Gondi',
				'Noto Sans Meetei Mayek','Noto Sans Mende Kikakui','Noto Sans Meroitic','Noto Sans Miao','Noto Sans Modi',
				'Noto Sans Mongolian','Noto Sans Mro','Noto Sans Multani','Noto Sans Myanmar','Noto Sans Nabataean',
				'Noto Sans New Tai Lue','Noto Sans Newa','Noto Sans NKo','Noto Sans Ol Chiki','Noto Sans Old Hungarian',
				'Noto Sans Old Italic','Noto Sans Old North Arabian','Noto Sans Old Permic','Noto Sans Old Persian',
				'Noto Sans Old South Arabian','Noto Sans Old Turkic','Noto Sans Oriya','Noto Sans Osage','Noto Sans Osmanya',
				'Noto Sans Pahawh Hmong','Noto Sans Palmyrene','Noto Sans Pau Cin Hau','Noto Sans PhagsPa','Noto Sans Phoenician',
				'Noto Sans Psalter Pahlavi','Noto Sans Rejang','Noto Sans Samaritan','Noto Sans Saurashtra','Noto Sans Sharada',
				'Noto Sans Siddham','Noto Sans Sora Sompeng','Noto Sans Sundanese','Noto Sans Syloti Nagri','Noto Sans Syriac',
				'Noto Sans Tagalog','Noto Sans Tagbanwa','Noto Sans Tai Le','Noto Sans Tai Tham','Noto Sans Tai Viet',
				'Noto Sans Takri','Noto Sans Thaana','Noto Sans Tifinagh','Noto Sans Tirhuta','Noto Sans Ugaritic',
				'Noto Sans Vai','Noto Sans Wancho','Noto Sans Warang Citi','Noto Sans Yi','Noto Sans Zawgyi',
			'Noto Serif Ahom','Noto Serif Balinese','Noto Serif Hmong Nyiakeng','Noto Serif Myanmar','Noto Serif Yezidi',
			'Optima','Oriya MN','Oriya Sangam MN',
			'PT Mono','PT Sans','PT Sans Caption','PT Sans Narrow','PT Serif','PT Serif Caption','Palatino','Papyrus',
				'Phosphate','PingFang HK','PingFang SC','PingFang TC','Plantagenet Cherokee',
			'Raanana','Rockwell',
			'STIXGeneral','STIXIntegralsD','STIXIntegralsSm','STIXIntegralsUp','STIXIntegralsUpD','STIXIntegralsUpSm',
				'STIXNonUnicode','STIXSizeFiveSym','STIXSizeFourSym','STIXSizeOneSym','STIXSizeThreeSym','STIXSizeTwoSym',
				'STIXVariants','STSong','Sana','Sathu','Savoye LET','Shree Devanagari 714','SignPainter','Silom','Sinhala MN',
				'Sinhala Sangam MN','Skia','Snell Roundhand','Songti SC','Songti TC','Sukhumvit Set','Symbol',
			'Tahoma','Tamil MN','Tamil Sangam MN','Telugu MN','Telugu Sangam MN','Thonburi','Times','Times New Roman',
				'Trattatello','Trebuchet MS',
			'Verdana',
			'Waseem','Webdings','Wingdings','Wingdings 2','Wingdings 3',
			'Zapf Dingbats','Zapfino',
		],
		'windows': [
			'AlternateGothic2 BT', // ?
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
			'微软雅黑','ＭＳ ゴシック','ＭＳ Ｐゴシック','宋体','游ゴシック', // Microsoft YaHei, MS Gothic, MS PGothic, SimSun, Yu Gothic 
			// isPlatformFont
			'MS Shell Dlg \\32',
			// common FontSubstitutes that point to kBase fonts
			'MS Shell Dlg','MS Shell Dlg 2', // can differ
			// non-common FontSubstitutes
			'Arial (Arabic)','Arial (Hebrew)','MS Serif Greek','ﾍﾙﾍﾞﾁｶ', // ja = arial
			/* ignore
			// common subs
				'Arabic Transparent','Arial Baltic','Arial CE','Arial CYR','Arial Greek','Arial TUR',
				'Courier New Baltic','Courier New CE','Courier New CYR','Courier New Greek','Courier New TUR',
				'Helv','Helvetica','Tahoma Armenian','Times','Times New Roman Baltic','Times New Roman CE',
				'Times New Roman CYR','Times New Roman Greek','Times New Roman TUR','Tms Rmn',
			// non-common subs: redundant
				'Courier New (Hebrew)','Times New Roman (Hebrew)','Small Fonts Greek',
				'標準ゴシック','ゴシック','ｺﾞｼｯｸ', // ＭＳ ゴシック -> MS Gothic
				'ﾀｲﾑｽﾞﾛﾏﾝ','ｸｰﾘｴ', // TNR, Courier -> Courier New
			// system aliases: should always be the same AFAICT
				// https://searchfox.org/mozilla-central/source/gfx/thebes/gfxDWriteFontList.cpp#1990
				'MS Sans Serif','MS Serif','Courier','Small Fonts','Roman', // Microsoft Sans Serif, TNR, Courier New, Arial, TNR
			// variants
				'Arial Black','Arial Narrow','Segoe UI Light','Segoe UI Semibold', // 7
				'Calibri Light','Calibri Light Italic','Segoe UI Semilight', // 8
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
			// all
			'AndroidClock Regular','Carrois Gothic SC','Cutive Mono','Dancing Script','Droid Sans Mono',
			'Noto Color Emoji','Noto Naskh Arabic', // ignore 'Coming Soon Regular', see 'Coming Soon'
			// 9+
			'Coming Soon','Noto Naskh Arabic UI','Roboto',
			// 12+
			'Noto Color Emoji Flags','Source Sans Pro Regular',
			// + common + self
			'Droid Sans','Droid Serif','Noto Sans','Noto Serif','Roboto Condensed',
			// + vendor: ToDo: SamsungOneUI*, SamsungNeo*, vendor specific
			'SamsungKorean_v2.0', // 1674683
			'SamsungKorean_v3.0',
			'SamsungColorEmoji', // 1872510
			'One UI Sans KR VF', // 1865238
			// + me
			'Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC',
			// + defaults
			'SEC CJK JP','SEC CJK KR','SEC CJK SC','SEC CJK TC','SEC Mono CJK JP','SEC Mono CJK KR','SEC Mono CJK SC',
			'SEC Mono CJK TC',
			/* defaults
				// https://searchfox.org/mozilla-central/source/modules/libpref/init/all.js#3041
				// ToDo: check names are correct
					'HYSerif','MotoyaLCedar','MotoyaLMaru','NanumGothic','SmartGothic',
				// ToDo: possibles: but I don't have them (Android 11), they seem out of date
					'Arial','Asana Math','Cambria Math','Charis SIL Compact','DejaVu Math TeX Gyre','DejaVu Sans',
					'DejaVu Serif','Droid Sans Fallback','Droid Sans Hebrew','Droid Sans Japanese','Droid Sans Thai',
					'Google Sans','Latin Modern Math','Libertinus Math','Noto Sans Mono CJK JP','Noto Sans Mono CJK KR',
					'Noto Sans Mono CJK SC','Noto Sans Mono CJK TC','STIX Math','STIX Two Math','STIXGeneral',
					'TeX Gyre Bonum Math','TeX Gyre Pagella Math','TeX Gyre Schola','TeX Gyre Termes Math','XITS Math',
			*/
		],
		'linux': [
			// self
			'Noto Sans','Noto Serif',
			// + always
			'Arial','Courier','Courier New',
			// + common notos
			'Noto Emoji','Noto Sans Tibetan',
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
		'mac': [
			'Academy Engraved LET','Adelle Sans Devanagari','AkayaKanadaka','AkayaTelivigala','Annai MN','Apple LiGothic',
				'Apple LiSung','Arima Koshi','Arima Madurai','Athelas','Avenir Next Condensed',
			'Bai Jamjuree','Baloo 2','Baloo Bhai 2','Baloo Bhaijaan','Baloo Bhaina 2','Baloo Chettan 2','Baloo Da 2','Baloo Paaji 2',
				'Baloo Tamma 2','Baloo Tammudu 2','Baloo Thambi 2','Baoli SC','Baoli TC','BiauKaiHK','BiauKaiTC','BIZ UDGothic',
				'BIZ UDMincho','BM Dohyeon','BM Hanna 11yrs Old','BM Hanna Air','BM Hanna Pro','BM Jua','BM Kirang Haerang','BM Yeonsung','Brill',
			'Cambay Devanagari','Canela','Canela Deck','Canela Text','Chakra Petch','Charm','Charmonman',
			'Domaine Display',
			'Fahkwang','Founders Grotesk','Founders Grotesk Condensed','Founders Grotesk Text',
			'Gotu','Grantha Sangam MN','Graphik','Graphik Compact','GungSeo',
			'Hannotate SC','Hannotate TC','HanziPen SC','HanziPen TC','HeadLineA','Hei','Herculanum','Hiragino Kaku Gothic ProN','Hiragino Sans CNS','Hubballi',
			'Jaini','Jaini Purva',
			'Iowan Old Style',
			'K2D','Kai','Kaiti SC','Kaiti TC','Katari','Kavivanar','Kigelia','Kigelia Arabic','Klee','Kodchasan','KoHo','Krub',
			'Lahore Gurmukhi','Lantinghei SC','Lantinghei TC','Lava Devanagari','Lava Kannada','Lava Telugu',
				'LiHei Pro','LiSong Pro','Libian SC','Libian TC','LingWai SC','LingWai TC',
			'Maku','Mali','Marion','Modak','Mukta','Mukta Malar','Mukta Vaani','Myriad Arabic',
			'Nanum Brush Script','Nanum Gothic','Nanum Myeongjo','Nanum Pen Script','Niramit','Noto Serif Kannada',
			'October Compressed Devanagari','October Compressed Gujarati','October Compressed Gurmukhi','October Compressed Kannada',
				'October Compressed Meetei Mayek','October Compressed Odia','October Compressed Ol Chiki','October Compressed Tamil','October Compressed Telugu',
			'October Condensed Devanagari','October Condensed Gujarati','October Condensed Gurmukhi','October Condensed Kannada',
				'October Condensed Meetei Mayek','October Condensed Odia','October Condensed Ol Chiki','October Condensed Tamil','October Condensed Telugu',
			'October Devanagari','October Gujarati','October Gurmukhi','October Kannada',
				'October Meetei Mayek','October Odia','October Ol Chiki','October Tamil','October Telugu',
			'Osaka','Osaka-Mono',
			'Padyakke Expanded One','Party LET','PCMyungjo','PilGi','Produkt','Proxima Nova','PSL Ornanong Pro','Publico Headline','Publico Text',
			'Quotes Caps','Quotes Script',
			'Sama Devanagari','Sama Gujarati','Sama Gurmukhi','Sama Kannada','Sama Malayalam','Sama Tamil','Sarabun','Sauber Script','Seravek',
				'Shobhika','SimSong','Spot Mono','Srisakdi','STFangsong','STHeiti','STIX Two Math','STIX Two Text','STKaiti','Superclarendon',
			'Tiro Bangla','Tiro Devanagari Hindi','Tiro Devanagari Marathi','Tiro Devanagari Sanskrit','Tiro Gurmukhi',
				'Tiro Kannada','Tiro Tamil','Tiro Telugu','Toppan Bunkyu Gothic','Toppan Bunkyu Midashi Gothic',
				'Toppan Bunkyu Midashi Mincho','Toppan Bunkyu Mincho','Tsukushi A Round Gothic','Tsukushi B Round Gothic',
			'Wawati SC','Wawati TC','Weibei SC','Weibei TC',
			'Xingkai SC','Xingkai TC',
			'Yuanti SC','Yuanti TC','YuGothic','YuKyokasho','YuKyokasho Yoko','YuMincho','YuMincho +36p Kana','Yuppy SC','Yuppy TC',
		],
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
			// fontSubs
			'KaiTi_GB2312', // simplified chinese
			// fontSubs redundant
				// '標準明朝', // ＭＳ 明朝 -> MS Mincho
				// 'FangSong_GB2312',
			// MS products
			'Arial Unicode MS','MS Reference Specialty','MS Outlook','Gill Sans','Gill Sans MT',
			// MS downloads
			'Cascadia Code','Cascadia Mono', // 11
		],
	},
	// help determine OS
	"mini": [
		//'Dancing Script','Roboto', // also help determine isPlatformFont for android
		'-apple-system',
		'MS Shell Dlg \\32',
	],
}

function get_fntCodes(name) {
	let list = fntCodePoints[name], str = ""
	list.forEach(function(code) {str += String.fromCodePoint(code)})
	return str
}

function set_fntList(os = isOS) {
	let fntListBaseName = isTB ? "allowlist" : "kBaseFonts"
	let build = (gLoad || isFontSizesMore !== isFontSizesPrevious)

	if (build) {
		isFontSizesPrevious = isFontSizesMore

		fntData = {
			"system": [], "bundled": [], "base": [], "unexpected": [], "full": [],
			"control": [], "control_name": [], "generic": [], 
		}

		// baseSize: add fallback for misconfigured/missing
		// isPlatformFont: expected + can't be blocked + differs vs most fonts
			// no entropy loss: size collisions of expected system fonts e.g. Tahoma
			// means not detected/recorded - but we _know_ it should be there
		let isPlatformFont
		let baseSize = ['monospace','sans-serif','serif']
		let tofu = get_fntCodes("tofu")
		if ("windows" === os) {
			// Mō = 124 +"á" = 125 +"Ω" = 127 (win7)
			// Mō - 141 +"á" = 142 +"Ω" = 144 | Mō - 141 +tofu = 154 | (win11: have 182/186 fonts
			fntString = isTB ? "?-"+ tofu : "Mō"+ tofu
			if (!isFontSizesMore) {isPlatformFont = "MS Shell Dlg \\32"}
			if (isTB) {isPlatformFont = undefined} // detect all fonts: cost 188->226 measurements taken
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
		} else if ("android" == os) {
			// see android list notes: Roboto is not guaranteed unless Android 9+
			// ToDo: we should test a mini set of android fonts and use a detected one
			if (!isFontSizesMore) {isPlatformFont = "Dancing Script"}
			fntString = '?-'+ tofu
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
			let array = []
			if (os == "android") {
				// android
				// build notos
				fntMaster.android.notoboth.forEach(function(fnt) {array.push("Noto Sans "+ fnt, "Noto Serif "+ fnt)})
				fntMaster.android.notosans.forEach(function(fnt) {array.push("Noto Sans "+ fnt)})
				fntMaster.android.notoserif.forEach(function(fnt) {array.push("Noto Serif "+ fnt)})
				// add extras
				array = array.concat(fntMaster["system"][os])
				fntData["full"] = array
				fntData["full"].push(fntFake)
			} else if (isTB) {
				// desktop TB
				let aBundled = []
				fntMaster.bundled.notoboth.forEach(function(fnt) {aBundled.push("Noto Sans "+ fnt, "Noto Serif "+ fnt)})
				fntMaster.bundled.notosans.forEach(function(fnt) {aBundled.push("Noto Sans "+ fnt)})
				fntMaster.bundled.notoserif.forEach(function(fnt) {aBundled.push("Noto Serif "+ fnt)})
				aBundled = aBundled.concat(fntMaster["bundled"][os])
				array = array.concat(aBundled)
				fntData["bundled"] = array
				fntData["system"] = fntMaster["allowlist"][os]
				array = array.concat(fntMaster["allowlist"][os])
				fntData["base"] = array
				fntMaster["blocklist"][os].push(fntFake)
				fntData["unexpected"] = fntMaster["blocklist"][os]
				array = array.concat(fntMaster["blocklist"][os])
				fntData["full"] = array
			} else {
				// desktop FF
				array = fntMaster["base"][os]
				fntData["base"] = array
				array = array.concat(fntMaster["system"][os])
				fntData["full"] = array
				fntData["full"].push(fntFake)
			}
			// -control from lists
			if (isPlatformFont !== undefined) {
				let fntKeys = ["base","full","system","bundled"]
				fntKeys.forEach(function(key) {
					if (fntData[key] !== undefined) {
					let array = fntData[key]
					 fntData[key] = array.filter(x => ![isPlatformFont].includes(x))
					}
				})
			}
			// dupes
			let aCheck = fntData["full"]
			aCheck = aCheck.filter(function(item, position) {return aCheck.indexOf(item) === position})
			if (aCheck.length !== fntData["full"].length) {
				log_alert(SECT12, "dupes in "+ os +" font list")
				fntData["full"] = aCheck
			}
			// sort
			fntData["bundled"].sort()
			fntData["system"].sort()
			fntData["unexpected"].sort()
			fntData["base"].sort()
			fntData["full"].sort()
			// fntBtns
			let str = "fonts_"+ os, fntBtnBundled, fntBtnSystem, fntBtnBase, fntBtnUnexpected, fntBtnAll
			fntBtnBundled = addButton(12, str +"_bundled", fntData["bundled"].length, "btnc", "lists")
			fntBtnSystem = addButton(12, str +"_system", fntData["system"].length, "btnc", "lists")
			fntBtnUnexpected = addButton(12, str +"_unexpected", fntData["unexpected"].length, "btnc", "lists")
			fntBtnBase = addButton(12, str +"_"+ fntListBaseName, fntData["base"].length, "btnc", "lists")
			fntBtnAll = addButton(12, str, fntData["full"].length, "btnc", "lists")
			// fntBtn
			if (os == "android") {
				fntBtn = fntBtnAll
			} else if (isTB) {
				if (os == "linux") {
					fntBtn = fntBtnBundled +" + "+ fntBtnUnexpected +" = "+ fntBtnAll
				} else {
					fntBtn = fntBtnSystem +" + "+ fntBtnBundled +" = "+ fntBtnBase +" + "+ fntBtnUnexpected + " = "+ fntBtnAll					
				}
 			} else {
				fntBtn = (os !== "linux" ? fntBtnBase : "") + fntBtnAll
			}
		}
	}
	// bail
	if (os === undefined) {return}

	// fnt*Btn data
	if (gRun || build) {
		let str = "fonts_"+ os
		addDetail(str +"_system", fntData["system"], "lists")
		addDetail(str +"_bundled", fntData["bundled"], "lists")
		addDetail(str +"_"+ fntListBaseName, fntData["base"], "lists")
		addDetail(str +"_unexpected", fntData["unexpected"], "lists")
		addDetail(str, fntData["full"], "lists")
	}
}

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

const get_font_sizes = (isMain = true) => new Promise(resolve => {
	/* https://github.com/abrahamjuliot/creepjs */
	try {
		fntBases = {} // reset
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
		const detectedViaDomRectBounding = new Set()
		const detectedViaDomRectBoundingRange = new Set()
		const detectedViaDomRectClient = new Set()
		const detectedViaDomRectClientRange = new Set()
		const style = getComputedStyle(span)
		const range = document.createRange()
		range.selectNode(span)

		let getDimensions = (span, style) => {
			const transform = style.transformOrigin.split(' ')
			const perspective = style.perspectiveOrigin.split(' ')
			const dimensions = {
					// keep in sorted order for base objects
					// + Math.floor(Math.random() * 10), //
				clientHeight: span.clientHeight,
				clientWidth: span.clientWidth,
				domrectboundingHeight: span.getBoundingClientRect().height,
				domrectboundingWidth: span.getBoundingClientRect().width,
				domrectboundingrangeHeight: range.getBoundingClientRect().height,
				domrectboundingrangeWidth: range.getBoundingClientRect().width,
				domrectclientHeight: span.getClientRects()[0].height,
				domrectclientWidth: span.getClientRects()[0].width,
				domrectclientrangeHeight: range.getClientRects()[0].height,
				domrectclientrangeWidth: range.getClientRects()[0].width,
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

		if (runST) {
			getDimensions = (span, style) => {
				const transform = style.transformOrigin.split(' ')
				const perspective = style.perspectiveOrigin.split(' ')
				const dimensions = {
					clientHeight: NaN,
					clientWidth: NaN,
					domrectboundingHeight: '',
					domrectboundingWidth: ' ',
					domrectboundingrangeHeight: 0, // zero detected
					domrectboundingrangeWidth: 0,
					domrectclientHeight: [1],
					domrectclientWidth: [],
					domrectclientrangeHeight: range.getClientRects()[0].height, // so we fiddle with isDomRect
					domrectclientrangeWidth: range.getClientRects()[0].width,
					nperspectiveHeight: '1',
					nperspectiveWidth: [1],
					npixelHeight: {},
					npixelWidth: {1:1},
					npixelsizeHeight: pixelsToNumber(style.blockSize), // 1 size: we set this later
					npixelsizeWidth: pixelsToNumber(style.inlineSize),
					ntransformHeight: true,
					ntransformWidth: null,
					offsetHeight: span.offsetHeight, // a real one
					offsetWidth: span.offsetWidth,
					perspectiveHeight: undefined,
					perspectiveWidth: Infinity,
					pixelHeight: true,
					pixelWidth: null,
					pixelsizeHeight: 100, // none: everything matches
					pixelsizeWidth: 100,
					scrollHeight: span.scrollHeight, // all: we set this later
					scrollWidth: span.scrollWidth,
					transformHeight: undefined,
					transformWidth: -Infinity,
				}
				return dimensions
			}
		}

		let fntGeneric = [], fntTest = [], fntControl = []
		let aTests = [], aTestsValid = [], aRemove = []
		if (isMain) {
			fntControl = fntData["control"]
			fntGeneric = fntData["generic"]
			fntTest = fntData["full"]
			aTests = [
				["client", detectedViaClient],
				["domrectbounding", detectedViaDomRectBounding],
				["domrectboundingrange", detectedViaDomRectBoundingRange],
				["domrectclient", detectedViaDomRectClient],
				["domrectclientrange", detectedViaDomRectClientRange],
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
		} else {
			fntControl = ['monospace, Consolas, Menlo, "Courier New\"','sans-serif, Arial','serif, "Times New Roman\"']
			fntGeneric = fntControl
			fntTest = ["--00"+ rnd_string()]
			fntTest = fntTest.concat(fntMaster["mini"])
			aTests = [
				["nperspective", detectedViaPerspectiveNumber],
			]
		}

		// base sizes
		let base = fntGeneric.reduce((acc, font) => {
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
		span.style.font = "" // reset

		// copy base into new object, regroup by hashs
		let baseObj = {}, oTempBase = {}
		if (isMain) {
			for (const k of Object.keys(base)) {
				baseObj[k] = {}
				for (const j of Object.keys(base[k])) {baseObj[k][j] = base[k][j]}
			}
			for (const k of Object.keys(baseObj)) {
				let tmpHash = mini(baseObj[k])
				if (oTempBase[tmpHash] == undefined) {
					oTempBase[tmpHash] = {"bases": [k], "metrics": baseObj[k]}
				} else {
					oTempBase[tmpHash]["bases"].push(k)
				}
			}
		}
		//console.log(base)
		//console.log(oTempBase)

		// test validity
		let baseStyle = "monospace" // we need a base style: we'll always have monospace
		aTests.forEach(function(pair) {
			let wName = pair[0] +"Width", hName = pair[0] +"Height"
			let wValue = base[baseStyle][wName], hValue = base[baseStyle][hName]
			let wType = typeFn(wValue)
			let hType = typeFn(hValue)
			if ("number" == wType && "number" == hType) {
				if (wValue < 1 || hValue < 1) {
					pair[1].clear()
					pair[1].add("invalid size")
					aRemove.push(wName, hName)
				} else {
					aTestsValid.push(pair)
				}
			} else {
				pair[1].clear()
				pair[1].add("mismatch:"+ zErrType + (wType == hType ? wType : wType +" x "+ hType ))
				aRemove.push(wName, hName)
			}
		})

		if (isMain) {
			// expand removals, take out the garbage + stash in fntBases
			if (aDomRect[0] == false) {aRemove.push('domrectboundingHeight','domrectboundingWidth')}
			if (aDomRect[1] == false) {aRemove.push('domrectclientHeight','domrectclientWidth')}
			if (aDomRect[2] == false) {aRemove.push('domrectboundingrangeHeight','domrectboundingrangeWidth')}
			if (aDomRect[3] == false) {aRemove.push('domrectclientrangeHeight','domrectclientrangeWidth')}
			aRemove = aRemove.filter(function(item, position) {return aRemove.indexOf(item) === position})
			aRemove.forEach(function(m) {
				for (const k of Object.keys(oTempBase)) {delete oTempBase[k]["metrics"][m]}
			})
			fntBases = oTempBase
			// return if not doing font sizes
			if (!fntTest.length || fntDocEnabled == false) {
				return resolve("baseonly")
			}
		}

		// measure
//let counter = 0
		if (aTestsValid.length) {
			let isDetected = false, intDetected = 0, intDetectedMax = aTestsValid.length
			fntTest.forEach(font => {
				isDetected = false // have we found it
				intDetected = 0 // in all valid methods
				fntControl.forEach(basefont => {
					if (isDetected) {return}
//counter++
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
//console.log(counter)

		// tidy lies: none/all in Sets
		if (isMain) {
			aTests.forEach(function(pair) {
				if (pair[1].size == 0) {
					pair[1].clear()
					pair[1].add("none")
				} else if (pair[1].size == fntData["full"].length) {
					pair[1].clear()
					pair[1].add("all") // includes fake font
				}
			})
		}

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
		const fontsDomRectBounding = [...detectedViaDomRectBounding]
		const fontsDomRectBoundingRange = [...detectedViaDomRectBoundingRange]
		const fontsDomRectClient = [...detectedViaDomRectClient]
		const fontsDomRectClientRange = [...detectedViaDomRectClientRange]
		if (isMain) {
			return resolve({
				// match display order so we output detail links for the first of each hash
				fontsClient,
				fontsOffset,
				fontsPerspective,
				fontsPixel,
				fontsPixelSize,
				fontsScroll,
				fontsTransform,
				fontsPixelNumber,
				fontsPixelSizeNumber,
				fontsPerspectiveNumber,
				fontsTransformNumber,
				fontsDomRectBounding,
				fontsDomRectBoundingRange,
				fontsDomRectClient,
				fontsDomRectClientRange,
			})
		} else {
			return resolve({fontsPerspectiveNumber})
		}
	} catch(e) {
		log_error(SECT12, "fontsizes", e)
		return resolve(zErr)
	}
})

const get_fonts = () => new Promise(resolve => {
	let t0 = nowFn()
	const METRIC = "fontsizes"
	const METRICG = METRIC +"_groups"
	const METRICB = METRIC +"_base"
	const METRICN = "fontnames"
	let badnotation = (isSmart ? (isTB ? tb_red : rfp_red) : "") 
	let goodnotation = (isSmart ? (isTB ? tb_green : rfp_green) : "") 
	let aRemove = []

	// functions
	function exit(value) {
		addDataDisplay(12, METRIC, value)
		addData(12, METRICN, value)
		log_display(12, METRICN, value + badnotation)
		addData(12, METRICG, value)
		log_display(12, METRICG, value + badnotation)
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
			let bType = typeFn(fntBases)
			if ("object" == bType) {
				let len = Object.keys(fntBases).length // recorded earlier
				if (fntData["full"].length && fntDocEnabled) {
					// fntBases will need changes and rehashes
					// if we found more garbage
					if (aRemove.length) {
						console.log("WE NEED TO CHECK & UPDATE fntBASES")
						console.log(aRemove)
					}
				}
				// cleanup: final rehash & sort
				let tmpBases = {}
				for (const h of Object.keys(fntBases)) {
					let key = fntBases[h]["bases"].join(" ")
					let hash = mini(fntBases[h]["metrics"])
					tmpBases[key] = {
						hash: hash,
						metrics: fntBases[h]["metrics"]
					}
				}
				fntBases = {}
				for (const k of Object.keys(tmpBases).sort()) {fntBases[k] = tmpBases[k]}
				display = mini(fntBases)
				baseBtn = addButton(12, METRICB, len +"/"+ fntData["generic"].length)
				addData(12, METRICB, fntBases, display, true)
			} else {
				display = log_error(SECT12, METRICB, zErrType + bType)
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
		let rType = typeFn(res)
		if ("baseonly" === res) {
			exit(zNA)
			return
		} else if ("string" === rType) {
			exit(zErr)
			return
		}
		let firstBaseFont = fntData["control_name"][0]

		if (runST) {
			// simulate same dimensions + all
			res["fontsPixelSizeNumber"] = ["A:"+ firstBaseFont+":1 x 1", "B:"+firstBaseFont+":1 x 1"]
			res["fontsScroll"] = ["all"]
		}
		/* test groupfonts
		res["fontsPixel"] = ["all"]
		res["fontsTransformNumber"] = ["none"]
		res["fontsPixelSizeNumber"] = ["A:"+ firstBaseFont+":1 x 1", "B:"+firstBaseFont+":1 x 2"]
		res["fontsScroll"] = ["C:"+firstBaseFont+"4 x 5", "D:"+firstBaseFont+":5 x 6"]
		//*/

		//console.log(res)
		let oData = {}, aIgnore = [], aSimpleLies = [], oValid = {}
		let ignoreList = ["none", "all", "invalid size", "unknown"]
		if ("object" === rType) {
			for (let name in res) {
				let data = res[name], hash = "unknown"
				// note: do not sort: these are "fontnames:size" and fntList was already sorted
				if (data.length == 0) {
					aSimpleLies.push(name)
					aIgnore.push(name +":"+ hash) // fallback
				} else if (ignoreList.includes(data[0])) {
					aSimpleLies.push(name) // record all/none/fake dimensions as lies
					hash = data[0]
					aIgnore.push(name +":"+ hash)
				} else if (data.length == 1 && data[0].split(":")[0] == "mismatch") {
					hash = data[0].slice(9)
					aIgnore.push(name +":"+ hash)
				} else {
					// group by hash
					hash = mini(data)
					oValid[name] = hash
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
		} else {
			// ToDo: we need to check baseFonts: could be an error or we could add it
			// atm it just displays + records zErr
			log_error(SECT12, METRIC, zErrType + rType)
			exit(zErr)
			return
		}

		// collect size buckets, font names
			// handle mutiple sizes per font: e.g. monospace, serif
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
						// ^ no need: we never force 3-pass per font, i.e we stop after first detection
					//if (!oSizes[size].includes(font)) {
						oSizes[size].push(fontitem)
					//}
				}
			})
			let sizebuckets = Object.keys(oSizes).length
			if (sizebuckets == 1) {
				// add more simple lies + remove from oData
				(oData[k]["names"]).forEach(function(item) {
					aSimpleLies.push(item)
					aIgnore.push(item +":single size ["+ Object.keys(oSizes)[0] +"]")
					delete oData[k]
					delete oValid[item]
				})
			} else {
				let aNew = {}
				for (const j of Object.keys(oSizes).sort()) {aNew[j] = oSizes[j]}
				oData[k]["newdata"] = aNew
				oData[k]["sizecount"] = sizebuckets
				oData[k]["hash"] = mini(aNew)
				// dedupe
				if (isFontSizesMore) {
					aFontNames = aFontNames.filter(function(item, position) {return aFontNames.indexOf(item) === position})
				}
				oData[k][METRICN] = aFontNames
			}
		}

		// output ignored + simple lies
		aIgnore.forEach(function(item) {
			let parts = item.split(":")
			let el = parts[0], value
			let msg = parts.slice(1).join(":")
			if (aSimpleLies.includes(el)) {
				if (isSmart) {
					value = colorFn(msg)
					log_known(SECT12, "fontsizes_"+ el)
				} else {
					value = msg
				}
			} else {
				value = log_error(SECT12, METRIC +"_"+ el, msg)
			}
			log_display(12, el, value)
			// addfor removal for fntBases
				// some are already purged (and domrect lies are already done)
				// but who cares about perf if people lie
			aRemove.push(el) 
		})

		// baseReturn
		get_baseHash()

		// determine most trustworthy result (or none): multiple fallbacks
		// 1st choice: domrect: any one will do (we have isDomRect)
			// also remove any lies from valid
		let selected
		let oDOMgroup = {0: "fontsDomRectBounding", 1: "fontsDomRectClient", 2: "fontsDomRectBoundingRange", 3: "fontsDomRectClientRange"}
		for (let i=0; i < 4; i++) {
			let method = oDOMgroup[i]
			if (aDomRect[i] == true && oValid[method] !== undefined) {
				selected = method
			} else {
				delete oValid[method]
			}
		}

		// fontsize_group: this gives us any tampering entropy
			// not to be confused with errors/lies which are recorded
			// ToDo: "known lie methods/data" to be added later
		let aNames = [ // sorted by group then name
			'fontsClient','fontsOffset','fontsPerspective','fontsPixel','fontsPixelSize','fontsScroll','fontsTransform',
			'fontsPixelNumber','fontsPixelSizeNumber',
			'fontsPerspectiveNumber','fontsTransformNumber',
			'fontsDomRectBounding','fontsDomRectBoundingRange','fontsDomRectClient','fontsDomRectClientRange',
		]
		let oGroups = {}, oIndex = {}, counter = 0
		aNames.forEach(function(k) {
			if (oValid[k] !== undefined) {
				let indexKey = oData[oValid[k]].hash
				if (oIndex[indexKey] == undefined) {
					counter++
					oIndex[indexKey] = (counter+"").padStart(2,"0")
				}
				let groupKey = oIndex[indexKey]
				if (oGroups[groupKey] == undefined) {oGroups[groupKey] = []}
				oGroups[groupKey].push(k)
			}
		})
		if (Object.keys(oGroups).length) {
			let grouphash = mini(oGroups)
			let aGood = ['b2e75cc4','421e59bc'] // sometimes the 4x "numbers" are the same
			let notation = (isSmart ? (aGood.includes(grouphash) ? "" : default_red) : "") // only notate badness
			addData(12, METRICG, oGroups, grouphash)
			let grpBtn = addButton(12, METRICG)
			log_display(12, METRICG, grouphash + grpBtn + notation)
		} else {
			log_display(12, METRICG, "none" + (isSmart ? default_red : ""))
			addData(12, METRICG, "none")
		}

		// 1st fallback: perspectiveNumber
		if (selected == undefined) {
			if (oValid['fontsPerspective'] === oValid['fontsTransform']) { // bases must match
				if (oValid['fontsPerspectiveNumber'] === oValid['fontsTransformNumber']) { // numbers must match
					// bases must match at least two of 5 others for a majority 4/7
					

				}
			}
		}
		// 2nd fallback: pixelNumber

		//console.log(oData)
		//console.log("ignore", aIgnore)
		//console.log("simple lies", aSimpleLies)
		//console.log("seems valid", oValid)
		//console.log("groups", oGroups)
		//console.log("selected", selected)

		// output valid results (may be lies)
		for (const k of Object.keys(oData)) {
			let aList = oData[k]["names"]
			for (let i=0; i < aList.length; i++) {
				let isLies = false
				// style domrect lies
					// record lies to be consistent (even though it's redundant with aDomRect)
				if (isSmart) {
					if (aDomRect[0] == false && aList[i] == "fontsDomRectBounding") {isLies = true
					} else if (aDomRect[1] == false && aList[i] == "fontsDomRectClient") {isLies = true
					} else if (aDomRect[2] == false && aList[i] == "fontsDomRectBoundingRange") {isLies = true
					} else if (aDomRect[3] == false && aList[i] == "fontsDomRectClientRange") {isLies = true
					}
					if (isLies) {log_known(SECT12, "fontsizes_"+ aList[i])}
				}
				let btn = ""
				if (i == 0) {
					let tmpName = METRIC +"_"+ aList[i]
					addDetail(tmpName, oData[k]["newdata"])
					btn = addButton(12, tmpName, oData[k]["sizecount"])
				}
				log_display(12, aList[i], (isLies ? colorFn(oData[k]["hash"]) : oData[k]["hash"]) + btn)

				if (aList[i] == selected) {
					// names: not needed in FP but include for upstream
					let fontNameHash = mini(oData[k][METRICN])
					let fontNameLen = oData[k][METRICN].length
					addData(12, METRICN, oData[k][METRICN], fontNameHash)
					fontNameHash += addButton(12, METRICN, fontNameLen)

					// names: notate if we have base fonts
					if (isSmart && fntData["base"].length) {
						let aNotInBase = oData[k][METRICN], aMissing = [], aMissingSystem = []
						// ToDo: windows and maybe mac
							// add missing system fonts: they are all expected
							// ... but I use MS Shell Dlg \\32, so some will be missing: Tahoma for example
							// I will need to exempt them
						aNotInBase = aNotInBase.filter(x => !fntData["base"].includes(x))
						if (isTB) {
							aMissing = fntData["bundled"]
							aMissing = aMissing.filter(x => !oData[k][METRICN].includes(x))
							if (fntData["system"].length) {
								aMissingSystem = fntData["system"]
								aMissingSystem = aMissingSystem.filter(x => !oData[k][METRICN].includes(x))
							}
						}
						let count = aNotInBase.length + aMissing.length + aMissingSystem.length
						if (count > 0) {
							let tmpName = METRICN +"_health", tmpObj = {}
							if (aMissing.length) {tmpObj["missing_bundled"] = aMissing}
							if (aMissingSystem.length) {tmpObj["missing_system"] = aMissingSystem}
							if (aNotInBase.length) {tmpObj["unexpected"] = aNotInBase}
							addDetail(tmpName, tmpObj)
							let brand = isTB ? (isMullvad ? "MB" : "TB") : "RFP"
							fontNameHash += addButton("bad", tmpName, "<span class='health'>"+ cross + "</span> "+ count +" "+ brand)
						} else {
							fontNameHash += goodnotation
						}
					}
					// sizes
					let sizeHash = oData[k]["hash"]
					addData(12, METRIC, oData[k]["newdata"], sizeHash)
					log_display(12, METRIC, sizeHash + addButton(12, METRIC, oData[k]["sizecount"]))
					log_display(12, METRICN, fontNameHash)
				}
			}
		}

		// nothing
		if (!Object.keys(oData).length || selected == undefined) {
			log_display(12, METRIC, "unknown")
			log_display(12, METRICN, "unknown" + badnotation)
			addData(12, METRIC, zLIE)
			addData(12, METRICN, zLIE)
			if (isSmart) {
				log_known(SECT12, METRIC)
				log_known(SECT12, METRICN)
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
	const METRIC = "graphite"
	let res = "", notation = ""
	function exit() {
		log_display(12, METRIC, res + notation)
		return resolve([METRIC, res])
	}
	if (fntDocEnabled) {
		// ToDo: handle when font face is blocked
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

const get_script_defaults = () => new Promise(resolve => {
	const METRIC = "script_defaults"
	if (!isGecko) {
		addDataDisplay(4, METRIC, zNA)
		return resolve()
	}
	const styles = ["monospace","sans-serif","serif"]
	const scripts = {
		arabic: "ar", armenian: "hy", bengali: "bn", cyrillic: "ru", devanagari: "hi", ethiopic: "gez",
		georgian: "ka", greek: "el", gujurati: "gu", gurmukhi: "pa", hebrew: "he", japanese: "ja",
		kannada: "kn", khmer: "km", korean: "ko", latin: "en", malayalam: "ml", mathematics: "x-math",
		odia: "or", other: "my", "simplified chinese": "zh-CN", sinhala: "si", tamil: "ta", telugu: "te",
		thai: "th", tibetan: "bo","traditional chinese (hong kong)": "zh-HK",
		"traditional chinese (taiwan)": "zh-TW","unified canadian syllabary": "cr",
	}
	let notation = isSmart ? default_red : ""
	try {
		const el = dom.dfsize,
			elpro = dom.dfproportion
		let data = {}
		for (const k of Object.keys(scripts)) {
			let lang = scripts[k]
			elpro.style.fontFamily = ""
			elpro.setAttribute('lang', lang)
			let font = getComputedStyle(elpro).getPropertyValue("font-family")
			let tmp = [font]
			el.setAttribute('lang', lang)
			styles.forEach(function(style) {
				// always clear
				el.style.fontSize = ""
				el.removeAttribute('font-family')
				el.style.fontFamily = ""
				el.style.fontFamily = style
				let size = getComputedStyle(el).getPropertyValue("font-size").slice(0,-2)
				tmp.push(size)
			})
			let key = tmp.join("-")
			if (data[key] == undefined) {data[key] = [k]} else {data[key].push(k)}
		}
		let newobj = {}
		for (const k of Object.keys(data).sort()) {newobj[k] = data[k]} // sort obj
		let hash = mini(newobj)
		addData(12, METRIC, newobj, hash)
		if (isSmart) {
			if (isOS == "windows" && hash == "e5179dbb") {notation = default_green
			} else if (isOS == "linux" && hash =="a4253645") {notation = default_green
			} else if (isOS == "mac" && hash = "884ca29d") {notation = default_green
			} else if (isOS == "android" && hash =="632e080a") {notation = default_green
			}
		}
		log_display(12, METRIC, hash + addButton(12, METRIC) + notation)
		return resolve()
	} catch(e) {
		log_display(12, METRIC, log_error(SECT12, METRIC, e))
		return resolve([METRIC, zErr])
	}
})

const get_system_fonts = (os = isOS) => new Promise(resolve => {
	// 1802957: FF109+: -moz no longer applied but keep for regression testing
		// add bogus '-default-font' to check they are falling back to actual default
	let oList = {
		moz: [
			'-default-font','-moz-button','-moz-button-group','-moz-desktop','-moz-dialog','-moz-document','-moz-field',
			'-moz-info','-moz-list','-moz-message-bar','-moz-pull-down-menu','-moz-window','-moz-workspace',
		],
		system: ['caption','icon','menu','message-box','small-caption','status-bar']
	}
	let aProps = ['font-size','font-style','font-weight','font-family']
	let isTBSmart = (isSmart && isTB)

	for (const k of Object.keys(oList)) {
		let notation = ""
		if (isTBSmart) {notation = k == "moz" ? default_red: tb_red}
		const METRIC = k +"_fonts" 
		let oRes = {}
		try {
			let el = dom.sysFont
			if (runSE) {foo++}
			oList[k].forEach(function(name){
				let aKeys = []
				el.style.font = "" // always clear in case a font is invalid/deprecated
				el.style.font = name
				for (const j of aProps) {aKeys.push(getComputedStyle(el)[j])}
				let key = aKeys.join(" ")
				if (oRes[key] == undefined) {oRes[key] = [name]} else {oRes[key].push(name)}
			})
			let newobj = {}, count = 0
			for (const k of Object.keys(oRes).sort()) {newobj[k] = oRes[k]; count += newobj[k].length}
			let hash = mini(newobj)
			if (isTBSmart) {
				if (k == "moz") {
					if (os == "windows" || os == "mac" || os == "linux") {
						if (hash == "062ff345") {notation = default_green} // "16px normal 400 serif"
					} else if (os == "android") {
						if (hash == "49b80107") {notation = default_green} // "16px normal 400 sans-serif"
					}
				} else {
					if (os == "windows") {
						if (hash == "a75e7a17") {notation = tb_green} // "12px normal 400 sans-serif"
					} else if (os == "mac") {
						if (hash == "0b6c0dbe") {notation = tb_green}
						/* mac
						"11px normal 400 -apple-system": ["message-box", "status-bar"],
						"11px normal 700 -apple-system": ["small-caption"],
						"12px normal 400 -apple-system": ["icon"],
						"13px normal 400 -apple-system": ["caption", "menu"]
						*/
					} else if (os == "linux") {
						if (hash == "48e3d1b4") {notation = tb_green} // "15px normal 400 sans-serif"
					} else if (os == "android") {
						// regression: TBA computedStyle font-family is missing
						// ^ https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41646
						if (hash == "") {notation = tb_green}
					}
				}
			}
			addData(12, METRIC, newobj, hash)
			log_display(12, METRIC, hash + addButton(12, METRIC, Object.keys(newobj).length +"/"+ count) + notation)
		} catch(e) {
			log_display(12, METRIC, log_error(SECT12, METRIC, e) + notation)
			addData(12, METRIC, zErr)
		}
	}
	return resolve()
})

const get_widget_fonts = (os = isOS) => new Promise(resolve => {
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
	const METRIC = "widget_fonts"
	let aList = [
		'button','checkbox','color','date','datetime-local','email','file','hidden','image','month',
		'number','password','radio','range','reset','search','select','submit','tel','text','textarea','time','url','week',
	]
	let notation = (isSmart && isTB ? tb_red : "")
	try {
		if (runSE) {foo++}
		let oRes = {}
		aList.forEach(function(name) {
			let el = dom["wgt"+ name]
			let key = getComputedStyle(el).getPropertyValue("font-family")
				+" "+ getComputedStyle(el).getPropertyValue("font-size")
			if (oRes[key] == undefined) {oRes[key] = [name]} else {oRes[key].push(name)}
		})
		let newobj = {}, count = 0
		for (const k of Object.keys(oRes).sort()) {newobj[k] = oRes[k]; count += newobj[k].length}
		let hash = mini(newobj)
		if (isSmart && isTB) {
			if (os == "windows") {
				/* 
				"monospace 13.3333px": ["date", "datetime-local", "time"],
				"monospace 13px": ["textarea"],
				"sans-serif 13.3333px": [19 items],
				"sans-serif 13px": ["image"]
				*/
				if (hash == "24717aa8") {notation = tb_green}
			} else if (os == "mac") {
				/*
				"-apple-system 13.3333px": [19 items],
				"monospace 13.3333px": ["date", "datetime-local", "time"],
				"monospace 13px": ["textarea"],
				"sans-serif 13px": ["image"]
				*/
				if (hash == "12e7f88a") {notation = tb_green}
			} else if (os == "linux" || os == "android") {
				/*
				"monospace 12px": ["textarea"],
				"monospace 13.3333px": ["date", "datetime-local", "time"],
				"sans-serif 13.3333px": [19 items],
				"sans-serif 13px": ["image"]
				*/
				// regression: TBA13 is missing font-family on the 19 items
				// ^ https://gitlab.torproject.org/tpo/applications/tor-browser/-/issues/41646
				if (hash == "99054729") {notation = tb_green}
			}
		}
		addData(12, METRIC, newobj, hash)
		log_display(12, METRIC, hash + addButton(12, METRIC, Object.keys(newobj).length +"/"+ count) + notation)
		return resolve()
	} catch(e) {
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
		styles.forEach(function(style) {newobj[style] = {}})
		if (name == "offset" || name == "clientrect") {
			data.forEach(function(item) {
				//newobj[item[0]].push([item[1], item[2], item[3]]) // width + height
				newobj[item[0]][item[1]] = [item[2], item[3]] // width + height
			})
		} else {
			// width only
			data.forEach(function(item) {
				if (oTM[name]["all"]) {
					newobj[item[0]][item[1]] = item[2]
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

	let oObject = {}
	function output() {
		let res = []
		let aList = [["offset", aOffset], ["clientrect", aClient]]
		for (const n of Object.keys(oTM)) {	aList.push([n])}
		aList.forEach(function(array) {
			const name = array[0]
			let prefix = (name == "width" || name == "clientrect" || name == "offset") ? "glyphs_" : ""
			const METRIC = prefix + name
			let isString = true
			let data = array[1] == undefined ? oTM[name]["data"] : array[1]

			let display = "", value = ""
			let errCheck = oCatch[name]
			if (errCheck !== undefined) {
				display = errCheck
				if (isTB && isSmart && name.slice(0,6) == "actual") {
					display += tb_red
				}
				value = zErr
			} else if (data.length) {
				let value = group(name, METRIC, data)
				// lies
				let isLies = false
				if (isSmart) {
					if (isDomRect == -1 && name == "clientrect") {isLies = true
					} else if (isProxy && sData[SECT99].includes("TextMetrics." + name)) {isLies = true}
				}
				if (isLies) {
					value = colorFn(value)
					log_known(SECT12, METRIC)
					sDetail[isScope][METRIC] = oObject[METRIC]["data"]
					addData(12, METRIC, zLIE)
				} else {
					addData(12, METRIC, oObject[METRIC]["data"], oObject[METRIC]["hash"])
				}
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
			log_display(12, METRIC, display)
		})
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

	let bigint = 9007199254740991
	try {bigint = BigInt(9007199254740991)} catch(e) {}
	const oTypeTest = {
		'width': bigint,
		'actualBoundingBoxAscent': '',
		'actualBoundingBoxDescent': Infinity,
		'actualBoundingBoxLeft': 'a',
		'actualBoundingBoxRight': ' ',
		'alphabeticBaseline': [],
		'emHeightAscent': {},
		'emHeightDescent': [1],
		'fontBoundingBoxAscent': {1:2},
		'fontBoundingBoxDescent': null,
		'hangingBaseline': true,
		'ideographicBaseline': undefined,
	}

	function run() {
		let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot,
			canvas = dom.ugCanvas, ctx = canvas.getContext("2d")
		let rangeH, rangeW, wType, hType, width, height

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
						width = span.offsetWidth
						height = div.offsetHeight
						if (runSE) {foo++} else if (runST) {width = null, height = true}
						wType = typeFn(width)
						hType = typeFn(height)
						if ("number" === wType && "number" === hType) {
							aOffset.push([stylename, code, width, height])
						} else {
							isOffset = false // stop checking
							oCatch["offset"] = log_error(SECT12, "glyphs_offset", zErrType + (wType == hType ? wType : wType +" x "+ hType))
						}
					} catch(e) {
						oCatch["offset"] = log_error(SECT12, "glyphs_offset", e)
						isOffset = false
					}
				}
				// clientrect
				if (isClient) {
					try {
						if (isDomRect > 1) {
							rangeH = document.createRange()
							rangeH.selectNode(div)
							rangeW = document.createRange()
							rangeW.selectNode(span)
						}
						if (isDomRect < 1) { // get a result regardless
							height = div.getBoundingClientRect().height
							width = span.getBoundingClientRect().width
						} else if (isDomRect == 1) {
							height = div.getClientRects()[0].height
							width = span.getClientRects()[0].width
						} else if (isDomRect == 2) {
							height = rangeH.getBoundingClientRect().height
							width = rangeW.getBoundingClientRect().width
						} else if (isDomRect > 2) {
							height = rangeH.getClientRects()[0].height
							width = rangeW.getClientRects()[0].width
						}
						if (runSE) {foo++} else if (runST) {width = NaN, height = [1]}
						wType = typeFn(width)
						hType = typeFn(height)
						if ("number" === wType && "number" === hType) {
							aClient.push([stylename, code, width, height])
						} else {
							isClient = false // stop checking
							oCatch["clientrect"] = log_error(SECT12, "glyphs_clientrect", zErrType + (wType == hType ? wType : wType +" x "+ hType))
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
								let prefix = k == "width" ? "glyphs_" : ""
								try {
									let isOnce = oTM[k]["all"] == false && isFirst
									if (oTM[k]["all"] || isOnce) {
										let measure = tm[k]
										if (runST) {measure = oTypeTest[k]}
										let mType = typeFn(measure)
										if (runST) {measure = undefined}
										if ("number" === mType) {
											if (isOnce) {
												oTM[k]["data"].push([stylename, measure])
											} else {
												oTM[k]["data"].push([stylename, code, measure])
											}
										} else {
											oTM[k]["proceed"] = false // stop checking
											let len = (k == "width" || k == "alphabeticBaseline") ? 50 : 25
											oCatch[k] = log_error(SECT12, prefix + k, zErrType + mType, isScope, len)
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
								let m = (k == "width" ? "glyphs_" : "") + k
								let len = (k == "width" || k == "alphabeticBaseline") ? 50 : 25
								oCatch[k] = log_error(SECT12, m, e, isScope, len)
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
		let reduceStart = nowFn()
		// check likely unsupported scripts: e.g. win7: 12/21, +RFP = 20/21
		let fntReducePossible = [
			'0x007F','0x058F','0x0700','0x08E4','0x097F','0x09B3','0x0B82','0x0D02','0x10A0','0x115A','0x17DD',
			'0x1C50','0x1CDA','0x20BD','0x2C7B','0xA73D','0xA830','0xF003','0xF810','0xFBEE','0xFFF9',
		]
		try {
			let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot
			slot.style.fontFamily = "none"
			slot.textContent = String.fromCodePoint('0xFFFF')
			let tofuWidth = span.offsetWidth,
				tofuHeight = div.offsetHeight
			fntReducePossible.forEach(function(code) {
				slot.textContent = String.fromCodePoint(code)
				if (span.offsetWidth == tofuWidth && div.offsetHeight == tofuHeight) {
					fntReduce.push(code)
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

const outputFonts = () => new Promise(resolve => {
	let t0 = nowFn()
	set_fntList()
	Promise.all([
		get_document_fonts(), // sets fntDocEnabled
		get_script_defaults(),
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
		return resolve(SECT12)
	})
})

countJS(SECT12)
