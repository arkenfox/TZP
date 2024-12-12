'use strict';

let fntCodes = { // sorted
	// actualBoundingBox, width
	a: [
		'0x007F','0x0218','0x058F','0x05C6','0x061C','0x0700','0x08E4','0x097F','0x09B3',
		'0x0B82','0x0D02','0x10A0','0x115A','0x17DD','0x1950','0x1C50','0x1CDA','0x1D790',
		'0x1E9E','0x20B0','0x20B8','0x20B9','0x20BA','0x20BD','0x20E3','0x21E4','0x23AE',
		'0x2425','0x2581','0x2619','0x2B06','0x2C7B','0x302E','0x3095','0x532D','0xA73D',
		'0xA830','0xF003','0xF810','0xFBEE',
		/* ignore: https://en.wikipedia.org/wiki/Specials_(Unicode_block)#Replacement_character
			problematic e.g windows 1st use
			'0xFFF9','0xFFFD',
		//*/
		'0xFFFF',
	],
	// baseline, emHeight, fontBoundingBox
	b: ['0xFFFF'],
	e: [],
	f: [],
}

let fntData = {},
	fntFaceData = {},
	fntSize = '512px',
	fntString = '-\uffff',
	fntBtn ='',
	fntFake,
	fntDocEnabled = false,
	fntBase = {},
	fntBaseInvalid = {},
	fntBaseMin = [],
	fntPlatformFont // undefined

let fntMaster = {
	// android core noto
	android: {
		notoboth: [
			// sans: 5+ except CJK JP + Gujarati + Gurmukhi + Tibetan 9+
			// serifs: 9+ except tibetan 12+
			'Armenian','Bengali','CJK JP','Devanagari','Ethiopic','Georgian','Gujarati','Gurmukhi','Hebrew','Kannada',
			'Khmer','Lao','Malayalam','Myanmar','Sinhala','Tamil','Telugu','Thai','Tibetan'],
		notosans: [
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
			'Grantha','Gunjala Gondi','Hanifi Rohingya','Khojki','Masaram Gondi','Medefaidrin','Modi','Soyombo','Takri','Wancho','Warang Citi'],
		notoserif: ['Dogra','Nyiakeng Puachue Hmong','Yezidi'], // 12+
	},
	// TB13 bundled: reuse for android/linux
	bundled: {
		// all: win/mac/linux: 80sans-only 4serif-only 17both: total 118, sorted hash: 8949a424
		notoboth: [
			'Balinese','Bengali','Devanagari','Ethiopic','Georgian','Grantha','Gujarati','Gurmukhi','Kannada','Khmer',
			'Khojki','Lao','Malayalam','Myanmar','Sinhala','Tamil','Telugu'],
		notosans: [
			'Adlam','Bamum','Bassa Vah','Batak','Buginese','Buhid','Canadian Aboriginal','Chakma','Cham','Cherokee',
			'Coptic','Deseret','Elbasan','Gunjala Gondi','Hanifi Rohingya','Hanunoo','Javanese','Kayah Li','Khudawadi',
			'Lepcha','Limbu','Lisu','Mahajani','Mandaic','Masaram Gondi','Medefaidrin','Meetei Mayek','Mende Kikakui',
			'Miao','Modi','Mongolian','Mro','Multani','NKo','New Tai Lue','Newa','Ol Chiki','Oriya','Osage','Osmanya',
			'Pahawh Hmong','Pau Cin Hau','Rejang','Runic','Samaritan','Saurashtra','Sharada','Shavian','Sora Sompeng',
			'Soyombo','Sundanese','Syloti Nagri','Symbols','Symbols 2','Syriac','Tagalog','Tagbanwa','Tai Le','Tai Tham',
			'Tai Viet','Takri','Thaana','Tifinagh','Tifinagh APT','Tifinagh Adrar','Tifinagh Agraw Imazighen',
			'Tifinagh Ahaggar','Tifinagh Air','Tifinagh Azawagh','Tifinagh Ghat','Tifinagh Hawad','Tifinagh Rhissa Ixa',
			'Tifinagh SIL','Tifinagh Tawellemmet','Tirhuta','Vai','Wancho','Warang Citi','Yi','Zanabazar Square'],
		notoserif: ['Dogra','NP Hmong','Tibetan','Yezidi'],
		android: [],
		// notos then linux +16, mac +5, win +4
		linux: [
			'Arimo','Cousine','Noto Naskh Arabic','Noto Sans Armenian','Noto Sans Hebrew','Noto Sans JP','Noto Sans KR',
			'Noto Sans SC','Noto Sans TC','Noto Sans Thai','Noto Serif Armenian','Noto Serif Hebrew','Noto Serif Thai',
			'STIX Two Math','Tinos','Twemoji Mozilla'],
		mac: ['Noto Sans Armenian','Noto Sans Hebrew','Noto Serif Armenian','Noto Serif Hebrew','STIX Two Math',],
		windows: ['Noto Naskh Arabic','Noto Sans','Noto Serif','Twemoji Mozilla'],
	},
	// TB whitelist system
	allowlist: {
		android: [],
		linux: [
			'Arial','Courier','Courier New','Helvetica','Times','Times New Roman' // aliases
		],
		linuxface: [
			// bundled
			'Arimo Regular','Cousine','Cousine Regular','Noto Sans JP', 'Noto Sans Symbols Regular','Tinos','Tinos Regular',
		],
		mac: [
			'AppleGothic','Apple Color Emoji','Arial','Arial Black','Arial Narrow','Courier','Courier New',
			'Geneva','Georgia','Heiti TC','Helvetica','Helvetica Neue','Hiragino Kaku Gothic ProN',
			'Kailasa','Lucida Grande','Menlo','Monaco','PingFang HK','PingFang SC','PingFang TC','Songti SC',
			'Songti TC','Tahoma','Thonburi','Times','Times New Roman','Verdana',
			// always
			'-apple-system',
			/* variants
			'Hiragino Kaku Gothic ProN W3','Hiragino Kaku Gothic ProN W6',
			*/
		],
		windows: [
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
			// fntPlatformFont
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
		],
		windowsface: [
			// weighted
			'Arial Black','Segoe UI Light','Segoe UI Semibold', // 7
			'Segoe UI Semilight', // 8
			'Microsoft JhengHei Light','Microsoft YaHei Light','Segoe UI Black', // 8.1
			'Malgun Gothic Semilight', // 10
			// other
			'Georgia','MS Gothic','Tahoma', // system
			'Noto Sans Gujarati','Noto Serif Dogra','Twemoji Mozilla', // bundled
		],
	},
	// TB unexpected
	blocklist: {
		android: [],
		linux: [
			'Noto Color Emoji','Noto Emoji','Noto Mono','Noto Sans','Noto Serif', // notos
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX', // fedora
			'Dingbats','FreeMono','Ubuntu', // ubuntu
			'Bitstream Charter','C059','Nimbus Sans','P052','Quicksand', // debian
			'Liberation Mono','Liberation Sans','Liberation Serif', // popular
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math', // TB12 fontnames
		],
		linuxface: [
			'Arimo', // Arimo without regular seems not to work, double check it.
			'Arial','Arial Regular','Courier New','Courier New Regular', // aliases, expected not to work!
			// common linux fonts
			'Cantarell Regular','DejaVu Sans', // fedora
			'Ubuntu', // ubuntu
			'Nimbus Sans','Nimbus Sans Regular', // debian
			'FreeSans','Liberation Sans', // popular
		],
		mac: [
			'Apple Symbols','Avenir','Charter','Impact','Palatino','Rockwell', // system
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math', // TB12 fontnames
			'.Helvetica Neue DeskInterface', // dot-prefixed font families on mac = hidden // tb#42377
		],
		windows: [
			'Calibri','Candara', // system
			'MS Shell Dlg', // system alias == Microsoft Sans Serif
			'Gill Sans','Gill Sans MT', // MS bundled
			// other
			'Noto Sans Symbols2', // TB12 bundled
		],
		windowsface: [
			// weighted
			// 'Arial Narrow', // ToDo: uncomment once we block it
			'Calibri Light', // 8
			'Microsoft JhengHei UI Light','Nirmala UI Semilight', // 8.1
			'Candara Light','Corbel Light','Yu Gothic UI Light', // 10
			// other
			'Corbel','Ebrima', // system
			'Gill Sans','Gill Sans MT', // MS bundled
			'Noto Serif Hmong Nyiakeng', // TB12 bundled
			'Arabic Transparent', // fontSubstitutes do not apply even if allowed
			'MS Serif','Roman', // system aliases do not apply even if allowed
		],
	},
	// kBaseFonts: https://searchfox.org/mozilla-central/search?path=StandardFonts*.inc
	base: {
		android: [],
		linux: [],
		mac: [
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
			'STIX Two Math', // FF133+ 1902570
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
		windows: [
			'AlternateGothic2 BT', // ?
			// 7
			'Arial','Calibri','Cambria','Cambria Math','Candara','Comic Sans MS','Consolas','Constantia','Corbel','Courier New','Ebrima',
			'Gabriola','Georgia','Impact','Lucida Console','Lucida Sans Unicode','MS Gothic','MS PGothic','MS UI Gothic','MV Boli',
			'Malgun Gothic','Marlett','Microsoft Himalaya','Microsoft JhengHei','Microsoft New Tai Lue','Microsoft PhagsPa',
			'Microsoft Sans Serif','Microsoft Tai Le','Microsoft YaHei','Microsoft Yi Baiti','MingLiU-ExtB','MingLiU_HKSCS-ExtB',
			'Mongolian Baiti','NSimSun','PMingLiU-ExtB','Palatino Linotype','Segoe Print','Segoe Script','Segoe UI','Segoe UI Symbol',
			'SimSun','SimSun-ExtB','Sylfaen','Symbol','Tahoma','Times New Roman','Trebuchet MS','Verdana','Webdings','Wingdings',
			// 8
			'Gadugi','Nirmala UI','Microsoft JhengHei UI','Microsoft YaHei UI','Myanmar Text',
			// 8.1
			'Javanese Text','Leelawadee UI','Segoe UI Emoji','Sitka Banner','Sitka Display',
			'Sitka Heading','Sitka Small','Sitka Subheading','Sitka Text','Yu Gothic',
			// 10
			'Bahnschrift','HoloLens MDL2 Assets','Segoe MDL2 Assets','Segoe UI Historic','Yu Gothic UI',
			// localized: kBase: detected FF119+: 1850672
			'微软雅黑','ＭＳ ゴシック','ＭＳ Ｐゴシック','宋体','游ゴシック', // Microsoft YaHei, MS Gothic, MS PGothic, SimSun, Yu Gothic 
			// fntPlatformFont
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
			//'Franklin Gothic Medium', // 7 not detected if font-vis < 3: 1720408
			//*/
		],
		windowsface :[
			// weighted
			'Arial Black','Arial Narrow','Segoe UI Light','Segoe UI Semibold', // 7
			'Calibri Light','Segoe UI Semilight', // 8
			// 8.1
			'Leelawadee UI Semilight','Microsoft JhengHei Light','Microsoft JhengHei UI Light',
			'Microsoft YaHei Light','Microsoft YaHei UI Light','Nirmala UI Semilight','Segoe UI Black','Yu Gothic Light',
			// 10
			'Candara Light','Corbel Light','Malgun Gothic Semilight',
			'Yu Gothic Medium','Yu Gothic UI Light','Yu Gothic UI Semilight','Yu Gothic UI Semibold',
			/* ignore: not detected by font face
				'Bahnschrift Light','Bahnschrift SemiBold','Bahnschrift SemiLight',
			//*/
		]
	},
	// kLangPackFonts
	baselang: {
		android: [], linux: [], mac: [],
		windows: [
			'Aharoni','Aldhabi','Andalus','Angsana New','AngsanaUPC','Aparajita','Arabic Typesetting','BIZ UDGothic','BIZ UDMincho',
			'BIZ UDPGothic','BIZ UDPMincho','Batang','BatangChe','Browallia New','BrowalliaUPC','Cordia New','CordiaUPC','DFKai-SB',
			'DaunPenh','David','DengXian','DilleniaUPC','DokChampa','Dotum','DotumChe','Estrangelo Edessa','EucrosiaUPC','Euphemia',
			'FangSong','FrankRuehl','FreesiaUPC','Gautami','Gisha','Gulim','GulimChe','Gungsuh','GungsuhChe','IrisUPC','Iskoola Pota',
			'JasmineUPC','KaiTi','Kalinga','Kartika','Khmer UI','KodchiangUPC','Kokila','Lao UI','Latha','Leelawadee','Levenim MT',
			'LilyUPC','MS Mincho','MS PMincho','Mangal','Meiryo','Meiryo UI','Microsoft Uighur','MingLiU','MingLiU_HKSCS','Miriam',
			'Miriam Fixed','MoolBoran','Narkisim','Nyala','PMingLiU','Plantagenet Cherokee','Raavi','Rod','Sakkal Majalla','Sanskrit Text',
			'Shonar Bangla','Shruti','SimHei','Simplified Arabic','Traditional Arabic','Tunga','UD Digi Kyokasho N-B','UD Digi Kyokasho N-R',
			'UD Digi Kyokasho NK-B','UD Digi Kyokasho NK-R','UD Digi Kyokasho NP-B','UD Digi Kyokasho NP-R','Urdu Typesetting','Utsaah',
			'Vani','Vijaya','Vrinda','Yu Mincho',
			// localized from ^
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
		],
		windowsface: [
			'BIZ UDMincho Medium','BIZ UDPMincho Medium','DengXian Light','Yu Mincho Demibold','Yu Mincho Light'
		],
	},
	system: {
		android: [
			// all
			'AndroidClock Regular','Carrois Gothic SC','Cutive Mono','Dancing Script','Droid Sans Mono',
			'Noto Color Emoji','Noto Naskh Arabic', // ignore 'Coming Soon Regular', see 'Coming Soon'
			// 9+
			'Coming Soon','Noto Naskh Arabic UI','Roboto',
			// 12+
			'Noto Color Emoji Flags','Source Sans Pro Regular',
			// +common +self
			'Droid Sans','Droid Serif','Noto Sans','Noto Serif','Roboto Condensed',
			// +vendor: ToDo: SamsungOneUI*, SamsungNeo*, vendor specific
			'SamsungKorean_v2.0', // 1674683
			'SamsungKorean_v3.0',
			'SamsungColorEmoji', // 1872510
			'One UI Sans KR VF', // 1865238
			// +me
			'Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC',
			// +defaults
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
		linux: [
			// self
			'Noto Sans','Noto Serif',
			// +always
			'Arial','Courier','Courier New',
			// +common notos
			'Noto Emoji','Noto Sans Tibetan',
			// +selective kBase ubuntu or fedora
				// notos
			'Noto Color Emoji','Noto Mono','Noto Serif CJK JP','Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC',
				// western/symbols
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX','STIX Two Text','Symbola', // fedora
			'Dingbats','FreeMono','Jamrul','Kinnari','Ubuntu', // ubuntu
				// other
			'OpenSymbol', // openoffice
			'Amiri', // libreoffice
			'Liberation Mono','Liberation Sans','Liberation Serif',
				// scripts
				// ubuntu
			'KacstNaskh','PakType Naskh Basic', // arabic
			'Likhan','Mitra Mono','Mukti Narrow', // bengali
			'Chandas','Kalimati','Samanata', // devangari 'Gargi','Nakula','Rachana','Sahadeva','Sarai',
			'Rekha','Saab','Samyak Gujarati', // gujarati
			'Lohit Gurmukhi', // gurmukhi
			'Gubbi','Navilu', // kannada
			'Phetsarath OT', // lao
			'Chilanka','Gayathri','Suruma', // malayalam 'Dyuthi','Karumbi','Keraleeyam','Manjari','Uroob',
			'ori1Uni','utkal', // oriya
			'LKLUG','padmaa', // sinhala
			'Samyak Tamil', // tamil
			'Pothana2000','Vemana2000', // telugu
			'Laksaman','Purisa','Umpush', // thai 'Norasi','Tlwg Mono',
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
			// debian
			'Bitstream Charter','C059','Courier 10 Pitch','D050000L',
			'DejaVu Math TeX Gyre','Nimbus Mono PS','Nimbus Roman',
			'Nimbus Sans','P052','Quicksand','Standard Symbols PS',
			'URW Bookman','URW Gothic','Z003',
			// ToDo: expand
		],
		mac: [
			'Academy Engraved LET','Adelle Sans Devanagari','AkayaKanadaka','AkayaTelivigala','Annai MN','Apple LiGothic',
				'Apple LiSung','Arima Koshi','Arima Madurai','Athelas','Avenir Next Condensed',
			'Bai Jamjuree','Baloo 2','Baloo Bhai 2','Baloo Bhaijaan','Baloo Bhaina 2','Baloo Chettan 2','Baloo Da 2','Baloo Paaji 2',
				'Baloo Tamma 2','Baloo Tammudu 2','Baloo Thambi 2','Baoli SC','Baoli TC','BiauKaiHK','BiauKaiTC','BIZ UDGothic',
				'BIZ UDMincho','BM Dohyeon','BM Hanna 11yrs Old','BM Hanna Air','BM Hanna Pro','BM Jua','BM Kirang Haerang','BM Yeonsung','Brill',
			'Cambay Devanagari','Canela','Canela Deck','Canela Text','Chakra Petch','Charm','Charmonman',
			'Dash','Domaine Display',
			'Fahkwang','Founders Grotesk','Founders Grotesk Condensed','Founders Grotesk Text',
			'Gotu','Grantha Sangam MN','Graphik','Graphik Compact','GungSeo',
			'Hannotate SC','Hannotate TC','HanziPen SC','HanziPen TC','HeadLineA','Hei','Herculanum','Hiragino Kaku Gothic ProN','Hiragino Sans CNS','Hiragino Sans TC','Hubballi',
			'Jaini','Jaini Purva',
			'Iowan Old Style',
			'K2D','Kai','Kaiti SC','Kaiti TC','Katari','Kavivanar','Kigelia','Kigelia Arabic','Klee','Kodchasan','KoHo','Krub',
			'Lahore Gurmukhi','Lantinghei SC','Lantinghei TC','Lava Devanagari','Lava Kannada','Lava Telugu',
				'LiHei Pro','LiSong Pro','Libian SC','Libian TC','LingWai SC','LingWai TC',
			'Maku','Mali','Marion','Modak','Mukta','Mukta Malar','Mukta Vaani','Myriad Arabic',
			'Nanum Brush Script','Nanum Gothic','Nanum Myeongjo','Nanum Pen Script','Niramit','Nom Na Tong','Noto Serif Kannada','November Bangla Traditonal',
			'October Compressed Devanagari','October Compressed Gujarati','October Compressed Gurmukhi','October Compressed Kannada',
				'October Compressed Meetei Mayek','October Compressed Odia','October Compressed Ol Chiki','October Compressed Tamil','October Compressed Telugu',
			'October Condensed Devanagari','October Condensed Gujarati','October Condensed Gurmukhi','October Condensed Kannada',
				'October Condensed Meetei Mayek','October Condensed Odia','October Condensed Ol Chiki','October Condensed Tamil','October Condensed Telugu',
			'October Devanagari','October Gujarati','October Gurmukhi','October Kannada',
				'October Meetei Mayek','October Odia','October Ol Chiki','October Tamil','October Telugu',
			'Osaka','Osaka-Mono',
			'Padyakke Expanded One','Party LET','PCMyungjo','PilGi','PingFang MO','Produkt','Proxima Nova','PSL Ornanong Pro','Publico Headline','Publico Text',
			'Quotes Caps','Quotes Script',
			'Sama Devanagari','Sama Gujarati','Sama Gurmukhi','Sama Kannada','Sama Malayalam','Sama Tamil','Sarabun','Sauber Script','Seravek',
				'Shobhika','SimSong','Spot Mono','Srisakdi','STFangsong','STHeiti','STIX Two Text','STKaiti','Superclarendon',
			'Tiro Bangla','Tiro Devanagari Hindi','Tiro Devanagari Marathi','Tiro Devanagari Sanskrit','Tiro Gurmukhi',
				'Tiro Kannada','Tiro Tamil','Tiro Telugu','Toppan Bunkyu Gothic','Toppan Bunkyu Midashi Gothic',
				'Toppan Bunkyu Midashi Mincho','Toppan Bunkyu Mincho','Tsukushi A Round Gothic','Tsukushi B Round Gothic',
			'Wawati SC','Wawati TC','Weibei SC','Weibei TC',
			'Xingkai SC','Xingkai TC',
			'Yuanti SC','Yuanti TC','YuGothic','YuKyokasho','YuKyokasho Yoko','YuMincho','YuMincho +36p Kana','Yuppy SC','Yuppy TC',
		],
		windows: [
			'Arial Nova','Georgia Pro','Gill Sans Nova','Ink Free','Neue Haas Grotesk Text Pro','Rockwell Nova',
			'Segoe Fluent Icons','Segoe UI Variable Display','Segoe UI Variable Small','Segoe UI Variable Text',
			'Simplified Arabic Fixed','Verdana Pro',
			// win11
			'Sans Serif Collection',
			// MS products
			'Arial Unicode MS','MS Reference Specialty','MS Outlook','Gill Sans','Gill Sans MT',
			// MS downloads
			'Cascadia Code','Cascadia Mono', // 11
		],
		windowsface: [
			'Arial Nova Cond','Arial Nova Light',
			'Georgia Pro Black','Georgia Pro Cond','Georgia Pro Light','Georgia Pro Semibold',
			'Gill Sans Nova Cond','Gill Sans Nova Light',
			//'Neue Haas Grotesk Text Pro UltraThin','Neue Haas Grotesk Text Pro Light',
			'Rockwell Nova Cond','Rockwell Nova Extra Bold','Rockwell Nova Light',
			'Verdana Pro Black','Verdana Pro Light',
			// the above are all supplemental, so to properly test font face is not leaking
			// we need to add some non-weighted fonts: not much to work with :-(
			'Ink Free'
		],
	},
	// isOS
	mini: [
		'-apple-system',
		'Dancing Script', // android fallback // 'Roboto'
		'MS Shell Dlg \\32',
	],
}

function set_fntList() {
	let build = (gLoad || isFontSizesMore !== isFontSizesPrevious)

	if (build) {
		isFontSizesPrevious = isFontSizesMore
		fntData = {
			bundled: [], base: [], baselang: [],
			control: [], 'control_name': [], generic: [], 'generic_name': [],
			fpp: [], full: [], system: [], unexpected: [], 
		}
		fntFaceData = {base: [], baselang: [], fpp: [], full: [], unexpected: []}

		// fntString
		if (isTB || 'android' == isOS || 'linux' == isOS) {
			//  isTB: all maxed: linux: 120/140 | windows 131/183 | mac 135/150
			// nonTB: seems to work well so far
			fntString = '-'
		} else {
			if ('windows' == isOS) {fntString = 'MōΩ' // 158/190 = max
			} else {fntString = 'Mō-'} // mac: 441/464 = almost max | Mōá?- + tofu = 443
		}
		fntString = fntString +'\uffff'

		// baseSize: add fallback for misconfigured/missing
		// fntPlatformFont: expected + isn't/can't be blocked
			// when used forces a single fallback font to compare to instead of trying up to
			// three (monospace, sans-serif, serif). No entropy is lost as lack of aliases or
			// FontSubtitutes (e.g. Tahoma) is expected - we _know_ they are there
		let baseSize = ['monospace','sans-serif','serif']
		fntPlatformFont = undefined // reset
		if ('windows' == isOS) {
			if (!isFontSizesMore) {fntPlatformFont = 'MS Shell Dlg \\32'}
			if (isTB) {fntPlatformFont = undefined} // force TB to detect all fonts for health
			baseSize = [
				'monospace, Consolas, Courier, \"Courier New\", \"Lucida Console\"',
				'sans-serif, Arial',
				'serif, Times, Roman'
			]
		} else if ('mac' == isOS) {
			if (!isFontSizesMore) {fntPlatformFont = '-apple-system'}
			baseSize = [
				'monospace, Menlo, Courier, \"Courier New\", Monaco',
				'sans-serif',
				'serif'
			]
		} else if ('android' == isOS) {
			// Roboto is not guaranteed unless Android 9+
			if (!isFontSizesMore) {fntPlatformFont = 'Dancing Script'}
		}

		// control: 1-pass or 3-pass | control_name: remove fallbacks e.g. 'serif, X' -> 'serif'
		fntData.control = fntPlatformFont == undefined ? baseSize : [fntPlatformFont]
		fntData.control.forEach(function(name) {fntData['control_name'].push(name.split(',')[0])})
		
		// generic: expand baseSize
			//'ui-monospace','ui-rounded','ui-serif','math','emoji','none' // redundant
		baseSize = baseSize.concat(['cursive','fantasy','fangsong','system-ui'])
		baseSize = baseSize.concat(isSystemFont)
		if (fntPlatformFont !== undefined) {baseSize.push(fntPlatformFont)}
		fntData.generic = baseSize.sort()
		baseSize.forEach(function(name) {fntData['generic_name'].push(name.split(',')[0])})

		// lists
		if (isOS !== undefined) {
			fntFake = '--00'+ rnd_string()
			let array = [], osface = isOS +'face'
			if ('android' == isOS) {
				// notos
				fntMaster.android.notoboth.forEach(function(fnt) {array.push('Noto Sans '+ fnt, 'Noto Serif '+ fnt)})
				fntMaster.android.notosans.forEach(function(fnt) {array.push('Noto Sans '+ fnt)})
				fntMaster.android.notoserif.forEach(function(fnt) {array.push('Noto Serif '+ fnt)})
				// +extras
				array = array.concat(fntMaster.system[isOS])
				fntData.full = array
				fntData.full.push(fntFake)
			} else if (isTB) {
				// desktop TB
				let aBundled = []
				fntMaster.bundled.notoboth.forEach(function(fnt) {aBundled.push('Noto Sans '+ fnt, 'Noto Serif '+ fnt)})
				fntMaster.bundled.notosans.forEach(function(fnt) {aBundled.push('Noto Sans '+ fnt)})
				fntMaster.bundled.notoserif.forEach(function(fnt) {aBundled.push('Noto Serif '+ fnt)})
				aBundled = aBundled.concat(fntMaster.bundled[isOS])
				array = array.concat(aBundled)
				fntData.bundled = array
				fntData.system = fntMaster.allowlist[isOS]
				array = array.concat(fntMaster.allowlist[isOS])
				fntData.base = array
				fntMaster.blocklist[isOS].push(fntFake)
				fntData.unexpected = fntMaster.blocklist[isOS]
				array = array.concat(fntMaster.blocklist[isOS])
				fntData.full = array
				// faces
				array = fntMaster.allowlist[osface]
				if (undefined !== array) {
					fntFaceData.base = array.sort()
					let aUnexpected = fntMaster.blocklist[osface]
					fntFaceData.unexpected = aUnexpected.sort()
					fntFaceData.full = array.concat(aUnexpected).sort()
				}
			} else {
				// desktop FF
				array = fntMaster.base[isOS]
				fntData.base = array
				array = array.concat(fntMaster.baselang[isOS])
				fntData.fpp = array // windows FPP (mac FPP = same as base)
				fntData.baselang = fntMaster.baselang[isOS]
				fntMaster.system[isOS].push(fntFake)
				array = array.concat(fntMaster.system[isOS])
				fntData.unexpected = fntMaster.system[isOS]
				fntData.full = array
				// faces
				array = fntMaster.base[osface]
				if (undefined !== array) {
					fntFaceData.base = array.sort()
					let aBaseLang = fntMaster.baselang[osface]
					fntFaceData.baselang = aBaseLang.sort()
					array = array.concat(aBaseLang)
					fntFaceData.fpp = array.sort()
					let aUnexpected = fntMaster.system[osface]
					fntFaceData.unexpected = aUnexpected.sort()
					array = array.concat(aUnexpected)
					fntFaceData.full = array.sort()
				}
			}
			// -control from lists
			if (fntPlatformFont !== undefined) {
				let fntKeys = ['base','full','fpp','system','bundled']
				fntKeys.forEach(function(key) {
					if (fntData[key] !== undefined) {
					let array = fntData[key]
					 fntData[key] = array.filter(x => ![fntPlatformFont].includes(x))
					}
				})
			}
			// dupes
			if (gLoad) {
				let aCheck = fntData.full
				aCheck = aCheck.filter(function(item, position) {return aCheck.indexOf(item) === position})
				if (aCheck.length !== fntData.full.length) {
					log_alert(12, 'set_fntList', 'dupes in '+ isOS, isScope, true) // persist since we only do this once
					fntData.full = aCheck
				}
			}
			// sort
			fntData.bundled.sort()
			fntData.system.sort()
			fntData.unexpected.sort()
			fntData.base.sort()
			fntData.baselang.sort()
			fntData.fpp.sort()
			fntData.full.sort()

			// fntBtn
			let fntobj = {}
			if ('android' == isOS || !isTB && 'linux' == isOS) {
				fntobj = fntData.full
			} else if (isTB || 'windows' == isOS) {
				if (isTB) {
					fntobj = {'1. system': {count: fntData.system.length, 'fonts': fntData.system},
						'2. bundled': {count: fntData.bundled.length, 'fonts': fntData.bundled},
						'3. allowlist': {count: fntData.base.length, 'fonts': fntData.base},
					}
				} else {
					fntobj = {'1. kBaseFonts': {count: fntData.base.length, 'fonts': fntData.base},
					'2. kLangPackFonts': {count: fntData.baselang.length, 'fonts': fntData.baselang},
					'3. FPP': {count: fntData.fpp.length, 'fonts': fntData.fpp},
					}
				}
				fntobj['4. unexpected'] = {count: fntData.unexpected.length, 'fonts': fntData.unexpected}
				fntobj['5. tested'] = {count: fntData.full.length, 'fonts': fntData.full}
			} else {
				//mac
				fntobj = {'1. kBaseFonts': {count: fntData.base.length, 'fonts': fntData.base},
					'2. unexpected': {count: fntData.unexpected.length, 'fonts': fntData.unexpected},
					'3. tested': {count: fntData.full.length, 'fonts': fntData.full},
				}
			}
			fntData['summary'] = fntobj
			fntBtn = addButton(12, 'fonts_'+ isOS, fntData.full.length +' fonts', 'btnc', 'lists')

			// fontFaces
			if (fntFaceData.full.length) {
				if (isTB) {
					fntobj = {'1. allowlist': {count: fntFaceData.base.length, 'fonts': fntFaceData.base},
						'2. unexpected': {count: fntFaceData.unexpected.length, 'fonts': fntFaceData.unexpected},
						'3. tested': {count: fntFaceData.full.length, 'fonts': fntFaceData.full}
					}
				} else {
					fntobj = {'1. kBaseFonts': {count: fntFaceData.base.length, 'fonts': fntFaceData.base},
						'2. kLangPackFonts': {count: fntFaceData.baselang.length, 'fonts': fntFaceData.baselang},
						'3. FPP': {count: fntFaceData.fpp.length, 'fonts': fntFaceData.fpp},
						'4. unexpected': {count: fntFaceData.unexpected.length, 'fonts': fntFaceData.unexpected},
						'5. tested': {count: fntFaceData.full.length, 'fonts': fntFaceData.full}
					}
				}
				fntFaceData['summary'] = fntobj
				fntBtn = addButton(12, 'font_faces_'+ isOS, fntFaceData.full.length +' faces', 'btnc', 'lists') +' | '+ fntBtn 
			}
		}
	}
	// bail
	if (isOS == undefined) {return}

	// fnt*Btn data
	if (gRun || build) {
		addDetail('fonts_'+ isOS, fntData.summary, 'lists')
		addDetail('font_faces_'+ isOS, fntFaceData.summary, 'lists')
	}
}

function get_document_fonts(METRIC) {
	fntDocEnabled = false // reset
	let value, data, fntTest = '\"test font name\"'
	try {
		if (runSE) {foo++}
		dom.tzpDiv.style.fontFamily = fntTest
		let font = getComputedStyle(dom.tzpDiv).getPropertyValue('font-family'),
			fontnoquotes = font.slice(0, fntTest.length - 2) // ext may strip quotes marks
		fntDocEnabled = (font == fntTest || fontnoquotes == fntTest ? true : false)
		value = (fntDocEnabled ? zE : zD) +' | '+ font
	} catch(e) {
		value = e; data = zErrLog
	}
	addBoth(12, METRIC, value,'', (fntDocEnabled ? default_green : default_red), data)
	return
}

const get_fontfaces = (METRIC) => new Promise(resolve => {
	// testing non regular fonts + font face leaks (i.e not just light/black etc)
		// it is problematic to test weighted fonts because you don't know
		// if it's synthesized, a variable font, or an actual font(name)
	// blocking document fonts does not affect this test

	let t0 = nowFn()
	// start with a letter or it throws "SyntaxError: An invalid or illegal string was specified"
	let fntFaceFake = 'a'+ rnd_string()
	async function testLocalFontFamily(font) {
		try {
			const fontFace = new FontFace(font, `local("${font}")`)
			await fontFace.load()
			return fntFaceFake
		} catch(e) {
			return e+''
		}
	}
	function getLocalFontFamily(font) {
		return new FontFace(font, `local("${font}")`)
			.load()
			.then((font) => font.family)
			.catch(() => null)
	}
	function loadFonts(fonts) {
		return Promise.all(fonts.map(getLocalFontFamily))
			.then(list => list.filter(font => font !== null))
	}
	function exit(value, btn, notation, data, isLies) {
		addBoth(12, METRIC, value, btn, notation, data, isLies)
		log_perf(12, METRIC, t0)
		return resolve()
	}

	Promise.all([
		testLocalFontFamily(fntFaceFake),
	]).then(function(res){
		let value ='', data = '', btn='', notation = '', isLies = false
		let fntList = fntFaceData.full
		let isNotate = fntList.length > 0
		// only notate if we're testing it
		let badnotation = !isNotate ? '' : isTB ? tb_red : rfp_red
		let goodnotation = !isNotate ? '' : isTB ? tb_green : rfp_green

		try {
			let test = res[0]
			if (fntFaceFake == test) {throw zErrInvalid +'fake font detected'
			} else if ('NetworkError: A network error occurred.' !== test) {throw test
			} else if (0 == fntList.length) {
				exit(zNA, btn, badnotation, data, isLies)
			} else {
				loadFonts(fntFaceData.full).then(function(results){
					if (results.length) {
						if (results.includes(fntFaceFake)) {isLies = true}
						data = results, value = mini(results)
						btn = addButton(12, METRIC, results.length)
						if (fntFaceData.base.length) {
							notation = goodnotation
							let aNotInBase = results, aMissing = []
							aNotInBase = aNotInBase.filter(x => !fntFaceData.base.includes(x))
								if (isTB) {
								aMissing = fntFaceData.base
								aMissing = aMissing.filter(x => !results.includes(x))
							}
							let count = aNotInBase.length + aMissing.length
							if (count > 0) {
								let tmpName = METRIC +'_health', tmpobj = {}
								if (aMissing.length) {tmpobj['missing'] = aMissing}
								if (aNotInBase.length) {tmpobj['unexpected'] = aNotInBase}
								addDetail(tmpName, tmpobj)
								let brand = isTB ? (isMullvad ? 'MB' : 'TB') : 'RFP'
								notation = addButton('bad', tmpName, "<span class='health'>"+ cross + '</span> '+ count +' '+ brand)
								// FFP if all unexpected are in baselang then we're fpp_green
								if (fntFaceData.baselang.length) {
									let aNotInBaseLang = aNotInBase.filter(x => !fntFaceData.baselang.includes(x))
									if (aNotInBaseLang.length == 0) {notation = fpp_green}
								}
							}
						}
					} else {
						// ToDo: once we allow fontFace in TB this will always be badnotation
						notation = isTB ? goodnotation : badnotation
						value = 'none'
					}
					exit(value, btn, notation, data, isLies)
				})
			}
		} catch(e) {
			exit(log_error(12, METRIC, e), btn, notation, zErr, false)
		}
	})
})

function get_fonts_base(METRICB, selected) {
	// selected can be: 'unknown', 'n/a' or any of the domrect or perspective or pixel

	// if n/a: try to calculate selected: same logic as font_sizes
		// in order, exclude lies + errors, limit to domrect + perspective or pixel
	if (selected == zNA) {
		let oDomList = {0: 'domrectbounding', 1: 'domrectclient', 2: 'domrectboundingrange', 3: 'domrectclientrange'}
		let order = [
			'domrectbounding','domrectboundingrange','domrectclient','domrectclientrange','perspective','pixel'
		]
		if (isSmart) {
			for (const k of Object.keys(oDomList)) {
				if (!aDomRect[k]) {order = order.filter(x => ![oDomList[k]].includes(x))} // remove from list
			}
		}
		for (let i=0; i < order.length; i++) {
			let value = order[i]
			if (!fntBaseInvalid.hasOwnProperty(order[i])) {selected = value; break}
		}
	}
	let isSelected = selected !== zNA && selected !== 'unknown'
	// if we have fntBaseMin data _and_ nothing is invalid, output one of each method group
	let useMin = fntBaseMin.length > 0 && Object.keys(fntBaseInvalid).length == 0

	// rebuild base fonts sizes: fntBase is already ordered: do first so hashes are correct
	// for each base combine w + h, replace with fntBaseInvalid errors (but not lies)
	let newBase = {}, hashBase = {}, finalBase = {}, selectBase = {}
	for (const base in fntBase) {
		newBase[base] = {}
		for (const m of Object.keys(fntBase[base])) {
			if ('Width' == m.slice(-5)) { // for each pair
				let method = m.slice(0,-5), value
				if(zLIE !== fntBaseInvalid[method]) {value = fntBaseInvalid[method]}
				if (undefined == value) {value = [fntBase[base][m], fntBase[base][method +'Height']]}
				if (useMin && fntBaseMin.includes(method) || !useMin) {
					newBase[base][method] = value
				}
			}
		}
	}
	// group by hash
	for (const base in newBase) {
		let tmphash = mini(newBase[base])
		if (undefined == hashBase[tmphash]) {hashBase[tmphash] = {'bases': [base], 'data': newBase[base]}
		} else {hashBase[tmphash].bases.push(base)}
	}
	// use base as keys | bases are already sorted since fntData.generic is too
	for (const oldhash in hashBase) {
		let newhash = mini(hashBase[oldhash].data)
		finalBase[hashBase[oldhash].bases.join(' ')] = {'hash': newhash, 'metrics': hashBase[oldhash].data}
		// build selected
		if (isSelected) {selectBase[hashBase[oldhash].bases.join(' ')] = hashBase[oldhash].data[selected]}
	}
	//console.log('newBase', newBase)
	//console.log('hashBase', hashBase)
	//console.log('finalBase', finalBase)
	//console.log('selectBase', selectBase)

	// display all that hard work!!
		// unless we had an error which means we never end up here, we will have fntBase data
	let btnAll = addButton(12, METRICB +'_reported', Object.keys(finalBase).length +'/'+ fntData.generic_name.length)
	addDetail(METRICB +'_reported', finalBase)
	addDisplay(12, METRICB+ '_reported', mini(finalBase), btnAll)

	// add selected/unknown/n/a
	if (isSelected) {
		let newobj = {}
		newobj[selected] = selectBase
		let hash = mini(newobj)
		let btn = addButton(12, METRICB, Object.keys(selectBase).length +'/'+ fntData.generic_name.length)
		addBoth(12, METRICB, hash, btn,'', newobj)
	} else {
		addBoth(12, METRICB, selected)
	}
}

const get_fonts_size = (isMain = true, METRIC = 'font_sizes') => new Promise(resolve => {
	/* getDimensions code based on https://github.com/abrahamjuliot/creepjs */
	// reset
	fntBaseInvalid = {}
	fntBaseMin = []
	const id = 'element-fp'
	// note: element-fp has a transform: this only affects domrect
	try {
		if (runSE) {foo++}
		const doc = document // or iframe.contentWindow.document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		dom[id].innerHTML = `
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
		const pixelsToNumber = pixels => +pixels.replace('px','')
		const originPixelsToNumber = pixels => 2*pixels.replace('px', '')
		const style = getComputedStyle(span)
		const range = document.createRange()
		range.selectNode(span)

		let getDimensions = (span, style) => {
			const transform = style.transformOrigin.split(' ')
			const perspective = style.perspectiveOrigin.split(' ')
			const dimensions = {
				// keep sorted for font_sizes_base_reported
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
				offsetHeight: span.offsetHeight,
				offsetWidth: span.offsetWidth,
				perspectiveHeight: originPixelsToNumber(perspective[1]),
				perspectiveWidth: originPixelsToNumber(perspective[0]),
				pixelHeight: pixelsToNumber(style.height),
				pixelWidth: pixelsToNumber(style.width),
				pixelsizeHeight: pixelsToNumber(style.blockSize),
				pixelsizeWidth: pixelsToNumber(style.inlineSize),
				scrollHeight: span.scrollHeight,
				scrollWidth: span.scrollWidth,
				transformHeight: originPixelsToNumber(transform[1]),
				transformWidth: originPixelsToNumber(transform[0]),
			}
			return dimensions
		}

		// simulate errors: don't test isFontSizesMore not used in production
		if (runSF && isMain && !isFontSizesMore) {
			getDimensions = (span, style) => {
				const transform = style.transformOrigin.split(' ')
				const perspective = style.perspectiveOrigin.split(' ')
				const dimensions = {
					clientHeight: span.clientHeight, // same size: engineered below
					clientWidth: span.clientWidth,
					domrectboundingHeight: null, // TypeError: empty string x null
					domrectboundingWidth: '',
					domrectboundingrangeHeight: range.getBoundingClientRect().height,
					domrectboundingrangeWidth: range.getBoundingClientRect().width,
					domrectclientHeight: span.getClientRects()[0].height, // fake font detected: engineered below
					domrectclientWidth: span.getClientRects()[0].width,
					domrectclientrangeHeight: 100, // none
					domrectclientrangeWidth: 200,
					offsetHeight: NaN, // TypeError: NaN (same)
					offsetWidth: NaN,
					perspectiveHeight: undefined, // TypeError: Infinity x undefined (different)
					perspectiveWidth: Infinity,
					pixelHeight: pixelsToNumber(style.height),
					pixelWidth: pixelsToNumber(style.width),
					pixelsizeHeight: pixelsToNumber(style.blockSize),
					pixelsizeWidth: pixelsToNumber(style.inlineSize),
					scrollHeight: 0, // Invalid: width or height < 1
					scrollWidth: 50,
					transformHeight: originPixelsToNumber(transform[1]) + ((Math.random() * 100) / 100), // all
					transformWidth: originPixelsToNumber(transform[0]),
				}
				return dimensions
			}
		}

		// set parameters
		let fntGeneric = [], fntTest = [], fntControl = [], fntControlObj = {}, oTests = {}, aTests = []
		if (isMain) {
			fntData.control.forEach(function(item) {
				let key = item.split(',')[0]
				fntControl.push(key)
				fntControlObj[key] = item
			})
			fntGeneric = fntData.generic
			fntTest = fntData.full
			// match display order so btn links = first of each hash
			oTests = {
				'client': {},
				'offset': {},
				'scroll': {},
				'pixel': {},
				'pixelsize': {},
				'perspective': {},
				'transform': {},
				'domrectbounding': {},
				'domrectboundingrange': {},
				'domrectclient': {},
				'domrectclientrange': {},
			}
		} else {
			fntControl = ['monospace', "sans-serif", "serif"]
			fntControlObj = {
				"monospace": 'monospace, Consolas, Courier, "Courier New", "Lucida Console"',
				"sans-serif": 'sans-serif, Arial',
				"serif": 'serif, "Times New Roman\"',
			}
			fntGeneric = fntControl
			fntTest = ['--00'+ rnd_string()]
			fntTest = fntTest.concat(fntMaster.mini)
			oTests = {'perspective': {}}
		}

		// base sizes
		fntBase = fntGeneric.reduce((acc, font) => {
			if (isSystemFont.includes(font)) { // not a family
				span.style.setProperty('--font', '')
				span.style.font = font
			} else {
				span.style.font =''
				span.style.setProperty('--font', font)
			}
			const dimensions = getDimensions(span, style)
			acc[font.split(',')[0]] = dimensions // use only first name, i.e w/o fallback
			return acc
		}, {})
		span.style.font ='' // reset

		// test validity
		for (const k of Object.keys(oTests)) {
			// assume we always have fntBase.monospace
			let wValue = fntBase.monospace[k +'Width'], wType = typeFn(wValue),
				hValue = fntBase.monospace[k +'Height'], hType = typeFn(hValue)
			try {
				if ('number' !== wType || 'number' !== hType) {
					throw zErrType + (wType == hType ? wType : wType +' x '+ hType)
				} else if (wValue < 1 || hValue < 1) {throw zErrInvalid + 'width or height < 1'
				} else if (wValue == hValue < 1) {throw zErrInvalid + 'width == height'}
				aTests.push(k)
			} catch(e) {
				fntBaseInvalid[k] = zErr
				oTests[k]['error'] = e+''
				addDisplay(12, METRIC +'_'+ k, log_error(12, METRIC +'_'+ k, e))
			}
		}

		// base only: after validity so we know what to use in lookup
		if (isMain) {
			if (!fntTest.length || false == fntDocEnabled) {
				removeElementFn(id)
				return resolve('baseonly')
			}
		}

		// measure
		if (aTests.length) {
			let intDetected = 0, intDetectedMax = aTests.length
			fntTest.forEach(font => {
				intDetected = 0 // reset per font
				for (const basefont of fntControl) {
					intDetected = 0 // reset per control
					span.style.setProperty('--font', "'"+ font +"', "+ fntControlObj[basefont])
					const style = getComputedStyle(span)
					const dimensions = getDimensions(span, style)
					aTests.forEach(function(method) {
						let wName = method +'Width', hName = method +'Height'
						if (dimensions[wName] != fntBase[basefont][wName] || dimensions[hName] != fntBase[basefont][hName]) {
							if (isFontSizesMore) {
								// every basefont result
								if (undefined == oTests[method][font]) {oTests[method][font] = {}}
								oTests[method][font][basefont] = [dimensions[wName], dimensions[hName]]
							} else {
								// always one result per font
								oTests[method][font] = [dimensions[wName], dimensions[hName]]
							}
							intDetected++
						}
					})
					if (intDetected == intDetectedMax && !isFontSizesMore) {break}
				}
			})
		}

		// exit isOS check
		if (!isMain) {
			removeElementFn(id)
			return resolve(oTests['perspective'])
		}

		// sim fake font + same sizes
		if (runSF && !isFontSizesMore) {
			oTests['domrectclient'][fntFake] = [700, 800]
			for (const k of Object.keys(oTests['client'])) {oTests['client'][k] = [700, 800]}
		}

		// catch more errors
		for (const k of Object.keys(oTests)) {
			let obj = oTests[k],
				objcount = Object.keys(obj).length
			try {
				if (0 == objcount) {throw zErrInvalid +'none'
				} else if (objcount == fntData.full.length) {throw zErrInvalid +'all'
				} else if (obj.hasOwnProperty(fntFake)) {throw zErrInvalid +'fake font detected'}
			} catch(e) {
				// we don't have to emmpty it
				for (const prop in obj) {if (obj.hasOwnProperty(prop)) {delete obj[prop]}} 
				fntBaseInvalid[k] = zErr
				oTests[k]['error'] = e+''
				addDisplay(12, METRIC +'_'+ k, log_error(12, METRIC +'_'+ k, e))
			}
		}

		// add domrect lies if not already an error
		if (isSmart) {
			// in order of aDomRect
			let domrectnames = ['domrectbounding','domrectclient','domrectboundingrange','domrectclientrange']
			for (let i=0; i < domrectnames.length; i++) {
				let name = domrectnames[i]
				if (!aDomRect[i] && undefined == fntBaseInvalid[name]) {fntBaseInvalid[name] = zLIE}
			}
		}

		removeElementFn(id)
		return resolve(oTests)
	} catch(e) {
		removeElementFn(id)
		if (isMain) {
			log_error(12, METRIC, e)
			log_error(12, METRIC +'_methods', e)
			log_error(12, METRIC +'_base', e)
		}
		return resolve(zErr)
	}
})

function get_fonts(METRIC) {
	/*
	- only notate font_names == not a metric but is picked up health
	- sizes we record all errors + lies per method. This is all we need for method
		results/entropy - sizes is either something or unknown: so never notate or lies
	- sizes_base + sizes_methods: never notate or lies: it is simply a reflection
		of what happened in sizes
	*/

	let t0 = nowFn()
	const METRICM = METRIC +'_methods'
	const METRICB = METRIC +'_base'
	const METRICN = 'font_names'
	let badnotation = isTB ? tb_red : rfp_red
	let goodnotation = isTB ? tb_green : rfp_green

	// functions
	function exit(value) {
		addBoth(12, METRIC, value)
		addBoth(12, METRICM, value)
		add_font_names(value)
		if (value == zNA) {
			get_fonts_base(METRICB, value)
		} else {
			addBoth(12, METRICB, value)
		}
		log_perf(12, METRIC, t0)
		return
	}
	function add_font_names(value) {
		// fontnames: always notate for health
		// display only: so always add a lookup
		sDetail.document.lookup[METRICN] = value
		addDisplay(12, METRICN, value,'', badnotation)
	}

	get_fonts_size().then(res => {
		//console.log("res", res)
		// quick exits
		let typeCheck = typeFn(res)
		if ('string' === typeCheck) {exit(('baseonly' == res ? zNA : zErr)); return}
		if ('object' !== typeCheck) {log_error(12, METRIC, zErrType + typeCheck); exit(zErr); return}

		// organize oData: note: everything is already sorted
		let oData = {}, oValid = {}
		for (let name in res) {
			let data = res[name]
			if (!data.hasOwnProperty('error')) {
				// group by hash
				let hash = mini(data)
				oValid[name] = hash
				if (oData[hash] == undefined) {oData[hash] = {'names': [name], 'data': data}
				} else {oData[hash].names.push(name)}
			}
		}

		// per hash: do stuff: font names, same size, handle isFontSizesMore
		for (const h of Object.keys(oData)) {
			oData[h].datacount = Object.keys(oData[h].data).length
			oData[h].datafonts = []
			let oTmpSize = {}, setSize = new Set(), oGroups = {}
			for (const f of Object.keys(oData[h].data)) {
				oData[h].datafonts.push(f)
				// only do size buckets if not isFontSizesMore
				if (!isFontSizesMore) {
					let sizekey = oData[h].data[f].join('x')
					if (undefined == oTmpSize[sizekey]) {oTmpSize[sizekey] = [f], setSize.add(sizekey)
					} else {oTmpSize[sizekey].push(f)}
				}
			}
			// use size buckets to detect more garbage
			if (isFontSizesMore || setSize.size > 1) {
				oData[h].sizedata = [] // for detailed items
				oData[h].sizecount = setSize.size
				for (const k of Object.keys(oTmpSize)) {
					let tmpFonts = oTmpSize[k]
					let tmpSize = oData[h].data[tmpFonts[0]]
					oData[h].sizedata.push([tmpFonts, tmpSize])
				}
			} else {
				(oData[h].names).forEach(function(name) {
					let lookup = oData[h].data[oData[h].datafonts[0]]
					let error = zErrInvalid +'same size ['+ lookup.join(' x ') +']'
					fntBaseInvalid[name] = zErr
					addDisplay(12, METRIC +'_'+ name, log_error(12, METRIC +'_'+ name, error))
				})
				delete oData[h]
			}
		}

		// sync fntBaseInvalid and oValid
		for (name in fntBaseInvalid) {delete oValid[name]}
		
		// fallback: first valid domrect in order of display as that gets the btn
			// fntBaseInvalid: is errors, plus lies if not an error and isSmart
		let selected
		let aDomList = ['domrectbounding','domrectboundingrange','domrectclient','domrectclientrange']
		for (let i=0; i < aDomList.length; i++) {
			let domname = aDomList[i]
			if (undefined !== oValid[domname]) {selected = domname; break}
		}

		// font_size_methods: this gives us any tampering entropy
			// not to be confused with errors/lies which are already recorded
		let oMethods = {}, oIndex = {}, counter = 0
		let aNames = [ // sorted by expected group then name
			'client','offset','scroll','pixel','pixelsize','perspective','transform',
			'domrectbounding','domrectboundingrange','domrectclient','domrectclientrange',
		]
		aNames.forEach(function(k) {
			if (undefined !== oValid[k]) {
				let indexKey = oValid[k] // the method hash
				if (oIndex[indexKey] == undefined) {
					oIndex[indexKey] = (counter+'').padStart(2,'0'); counter++
				}
				let mKey = oIndex[indexKey]
				if (oMethods[mKey] == undefined) {
					oMethods[mKey] = [k]
					fntBaseMin.push(k) // first of each
				} else {
					oMethods[mKey].push(k)
				}
			}
		})
		let mHash = 'unknown', mBtn ='', mData =''
		if (Object.keys(oMethods).length) {
			mHash = mini(oMethods); mBtn = addButton(12, METRICM); mData = oMethods
		}
		addBoth(12, METRICM, mHash, mBtn, '', mData)

		// fallbacks: matching valid *Number pairs
		if (selected == undefined) {
			let items = [['perspective', 'transform'], ['pixel', 'pixelsize']]
			for (let i=0; i < items.length; i++) {
				let ctrlName = items[i][0], ctrlHash = oValid[ctrlName]
				let testName = items[i][1], testHash = oValid[testName]
				if (ctrlHash !== undefined && ctrlHash == testHash) {
					selected = ctrlName; break // we have a valid *Number pair
				}
			}
		}
		//console.log('oData', oData)
		//console.log('oValid', oValid)
		//console.log('fntBaseInvalid', fntBaseInvalid)

		// no more fallbacks
		// output oData = not-errors
		for (const k of Object.keys(oData)) {
			let aList = oData[k].names
			for (let i=0; i < aList.length; i++) {
				let method = aList[i]
				let fntmethod = METRIC +'_'+ method
				// style + record lies to be consistent
				let isLies = false, btn =''
				if ('domrect' == method.slice(0,7)) {
					isLies = fntBaseInvalid.hasOwnProperty(method)
					if (isLies) {
						// we don't need to record domrect lie data: just that its a lie
						log_known(12, fntmethod, '')
					}
				}
				//add btn to first of each hash
				if (i == 0) {
					addDetail(fntmethod, oData[k].data)
					btn = addButton(12, fntmethod, oData[k].datacount)
					if (!isFontSizesMore) {
						addDetail(fntmethod +'_grouped', oData[k].sizedata)
						btn += addButton(12, fntmethod +'_grouped', oData[k].sizecount)
					}
				}
				addDisplay(12, fntmethod, k, btn,'', isLies)

				// FP data: not lies
				if (method == selected) {
					let notation =''
					if (fntData.base.length) {
						notation = goodnotation
						let aNotInBase = oData[k].datafonts, aMissing = [], aMissingSystem = []
						aNotInBase = aNotInBase.filter(x => !fntData.base.includes(x))
						if (isTB) {
							aMissing = fntData.bundled
							aMissing = aMissing.filter(x => !oData[k].datafonts.includes(x))
							if (fntData.system.length) {
								aMissingSystem = fntData.system
								aMissingSystem = aMissingSystem.filter(x => !oData[k].datafonts.includes(x))
							}
						}
						let count = aNotInBase.length + aMissing.length + aMissingSystem.length
						if (count > 0) {
							let tmpName = METRICN +'_health', tmpobj = {}
							if (aMissing.length) {tmpobj['missing_bundled'] = aMissing}
							if (aMissingSystem.length) {tmpobj['missing_system'] = aMissingSystem}
							if (aNotInBase.length) {tmpobj['unexpected'] = aNotInBase}
							addDetail(tmpName, tmpobj)
							let brand = isTB ? (isMullvad ? 'MB' : 'TB') : 'RFP'
							notation = addButton('bad', tmpName, "<span class='health'>"+ cross + '</span> '+ count +' '+ brand)
							// FFP if all unexpected are in baselang then we're fpp_green
							if (fntData.baselang.length) {
								let aNotInBaseLang = aNotInBase.filter(x => !fntData.baselang.includes(x))
								if (aNotInBaseLang.length == 0) {notation = fpp_green}
							}
						}
					}
					// names
					let btn = addButton(12, METRICN, oData[k].datacount)
					sDetail.document[METRICN] = oData[k].datafonts
					addDisplay(12, METRICN, mini(oData[k].datafonts), btn, notation)

					// data
					btn = addButton(12, METRIC, oData[k].datacount)
					if (!isFontSizesMore) {
						addDetail(METRIC +'_grouped', oData[k].sizedata)
						btn += addButton(12, METRIC +'_grouped', oData[k].sizecount)
					}
					addBoth(12, METRIC, k, btn,'', oData[k].data)
				}
			}
		}

		// nothing
		if (!Object.keys(oData).length || selected == undefined) {
			addBoth(12, METRIC, 'unknown')
			add_font_names('unknown')
			get_fonts_base(METRICB, 'unknown')
		} else {
			get_fonts_base(METRICB, selected)
		}

		log_perf(12, METRIC, t0)
		return
	})
}

function get_formats() {
	// FF105+: layout.css.font-tech.enabled
	const oList = {
		'font-format': ['collection','embeddedopentype','opentype','svg','truetype','woff','woff2'],
		'font-tech': ['color-CBDT','color-COLRv0','color-COLRv1','color-SVG','color-sbix',
			'features-aat','features-graphite','features-opentype','incremental','palettes','variations']
	}
	for (const k of Object.keys(oList)) {
		let list = oList[k]
		const METRIC = k
		let hash, btn ='', data = []
		try {
			if (runSE) {foo++}
			list.forEach(function(item) {if (CSS.supports(k +'('+ item + ')')) {data.push(item)}})
			if (data.length) {
				hash = mini(data); btn = addButton(12, METRIC, data.length)
			} else {
				hash = zNA; data =''
			}
		} catch(e) {
			hash = e; data = zErrLog
		}
		addBoth(12, METRIC, hash, btn,'', data)
	}
	return
}

function get_glyphs(METRIC) {
	/* NOTES
	FF131+ nightly: 1900175 + 1403931 ride the train
		- Enable USER_RESTRICTED for content processes on Nightly
		- security.sandbox.content.level > 7
		- this affected (FF win11 at least) clientrect
			- 0x3095 + 0x532D (2 CJK chars)
			- almost always both in every style except cursive never affected
			- only changed in http(s), file:// not affected
		- so reminder that generally we should always be using https for final testing/analysis
	*/
	let t0 = nowFn()
	let styles = ['cursive','monospace','sans-serif','serif','system-ui',]
	/* Notes
		unique sizes: win11 all system fonts FF
		sans-serif = 34 + cursive = 66 + serif = 84 + system-ui = 102 + monospace = 112 + fantasy = 115
	
	- all the same: 'emoji','math','none','ui-monospace','ui-rounded','ui-sans-serif','ui-serif'
		- ui-* not added to gecko yet
		- math is basically slated for deprecation
		- emoji - we're not testing any emojis here
		- do not increase unique sizes
	- 'fangsong': does not add to unique sizes, we would need a different set of code points
	- 'fantasy': only added 3 more sizes
	*/

	const id = 'element-fp'
	let hash, btn ='', data = {}, strSizes =''
	try {
		if (runSE) {foo++}
		const doc = document
		const div = doc.createElement('div')
		div.setAttribute('id', id)
		doc.body.appendChild(div)
		div.innerHTML = '<span id="glyphs-span" style="font-size: 22000px;"><span id="glyphs-slot"></span></span>'
		const span = dom['glyphs-span'], slot = dom['glyphs-slot']

		let oData = {}, tmpobj = {}, newobj = {}, setSize = new Set(), aCodes = fntCodes.a
		let methoddiv, methodspan, rangeH, rangeW, width, height
		styles.forEach(function(stylename) {
			slot.style.fontFamily = stylename
			oData[stylename] = {}
			let isFirst = stylename == styles[0]
			aCodes.forEach(function(code) {
				let codeString = String.fromCodePoint(code)
				slot.textContent = codeString
				// always get span width, div height
				if (isDomRect > 1) {
					rangeH = document.createRange()
					rangeH.selectNode(div)
					rangeW = document.createRange()
					rangeW.selectNode(span)
				}
				if (isDomRect < 1) { // get a result regardless
					methoddiv = div.getBoundingClientRect()
					methodspan = span.getBoundingClientRect()
				} else if (isDomRect == 1) {
					methoddiv = div.getClientRects()[0]
					methodspan = span.getClientRects()[0]
				} else if (isDomRect == 2) {
					methoddiv = rangeH.getBoundingClientRect()
					methodspan = rangeW.getBoundingClientRect()
				} else if (isDomRect > 2) {
					methoddiv = rangeH.getClientRects()[0]
					methodspan = rangeW.getClientRects()[0]
				}
				width = methodspan.width, height = methoddiv.height
				// only typecheck once: first char on first style
				if (code == aCodes[0] && isFirst) {
					if (runST) {width = NaN, height = [1]}
					let wType = typeFn(width), hType = typeFn(height)
					if ('number' !== wType || 'number' !== hType) {
						throw zErrType + (wType == hType ? wType : wType +' x '+ hType)
					}
				}
				oData[stylename][code] = [width, height]
				setSize.add(width+'x'+height)
			})
		})
		for (const k of Object.keys(oData)) {
			let hash = mini(oData[k])
			if (tmpobj[hash] == undefined) {tmpobj[hash] = {'names': [k], 'data': oData[k]}
			} else {tmpobj[hash].names.push(k)}
		}
		for (const k of Object.keys(tmpobj)) {newobj[tmpobj[k].names.join(' ')] = tmpobj[k].data}
		for (const k of Object.keys(newobj).sort()) {data[k] = newobj[k]}

		hash = mini(data), strSizes = gRun ? setSize.size + ' unique sizes' : ''
		btn = addButton(12, METRIC)
	} catch(e) {
		hash = e; data = zErrLog
	}
	removeElementFn(id)
	addBoth(12, METRIC, hash, btn,'', data, (isDomRect == -1))
	log_perf(12, METRIC, t0,'', strSizes)
	return
}

function get_graphite(METRIC) {
	let hash, data ='', notation = isTB ? tb_red : ''
	try {
		if (!fntDocEnabled) {throw zErrInvalid + 'document fonts disabled'}
		// ToDo: handle when font face is blocked
		let el = dom.tzpGraphite,
			test = el.children[0].offsetWidth,
			control = el.children[1].offsetWidth
		if (runST) {test = NaN; control = NaN}
		let wType = typeFn(test), hType = typeFn(control)
		if ('number' !== wType || 'number' !== hType) {throw zErrType + wType +' | '+ hType}
		hash = (control == test ? zF : zS)
		if (isTB) {notation = hash == zS ? tb_standard : tb_safer}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(12, METRIC, hash,'', notation, data)
	return
}

function get_script_defaults(METRIC) {
	// this is zoom resistant
		// except with "zoom text only" and you zoom from default

	const styles = ['monospace','sans-serif','serif']
	const scripts = {
		arabic: 'ar', armenian: 'hy', bengali: 'bn', cyrillic: 'ru', devanagari: 'hi', ethiopic: 'gez',
		georgian: 'ka', greek: 'el', gujurati: 'gu', gurmukhi: 'pa', hebrew: 'he', japanese: 'ja',
		kannada: 'kn', khmer: 'km', korean: 'ko', latin: 'en', malayalam: 'ml', mathematics: 'x-math',
		odia: 'or', other: 'my', 'simplified chinese': 'zh-CN', sinhala: 'si', tamil: 'ta', telugu: 'te',
		thai: 'th', tibetan: 'bo', 'traditional chinese (hong kong)': 'zh-HK',
		'traditional chinese (taiwan)': 'zh-TW', 'unified canadian syllabary': 'cr',
	}

	let hash = zNA, btn ='', data ='', notation = default_red
	if (isGecko) {
		data = {}
		try {
			const el = dom.tzpScript

			// family typecheck
			let test = getComputedStyle(el).getPropertyValue('font-family')
			if (runST) {test =''}
			let typeCheck = typeFn(test)
			if ('string' !== typeCheck) {throw zErrType + 'font-family: '+ typeCheck}

			// size typecheck
			test = getComputedStyle(el).getPropertyValue('font-size').trim()
			if (runSI) {test = '16ppx'}
			let originalvalue = test
			typeCheck = typeFn(test)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (test.slice(-2) !== 'px') {throw zErrInvalid + 'got '+ originalvalue} // missing px
			test = test.slice(0, -2)
			if (test.length > 0) {test = test * 1}
			if ('number' !== typeFn(test)) {throw zErrInvalid + 'got '+ originalvalue} // missing number

			// loop
			let tmpdata = {}
			el.style.fontSize ='' // reset size
			for (const k of Object.keys(scripts)) {
				let lang = scripts[k]
				el.style.fontFamily ='' // each lang reset fanily
				el.setAttribute('lang', lang)
				let font = getComputedStyle(el).getPropertyValue('font-family')
				let tmp = [font]
				styles.forEach(function(style) {
					el.style.fontFamily = style
					let size = getComputedStyle(el).getPropertyValue('font-size').slice(0,-2)
					tmp.push(size)
				})
				let key = tmp.join('-')
				if (tmpdata[key] == undefined) {tmpdata[key] = [k]} else {tmpdata[key].push(k)}
			}
			for (const k of Object.keys(tmpdata).sort()) {data[k] = tmpdata[k]} // sort obj
			hash = mini(data); btn = addButton(12, METRIC)
			// notation
			if ('windows' == isOS && 'e5179dbb' == hash) {notation = default_green
			} else if ('linux' == isOS && 'a4253645' == hash) {notation = default_green
			} else if ('mac' == isOS && '884ca29d' == hash) {notation = default_green
			} else if ('android' == isOS && '632e080a' == hash) {notation = default_green
			}
		} catch(e) {
			hash = e; data = zErrLog
		}
	}
	addBoth(12, METRIC, hash, btn, notation, data)
	return
}

function get_system_fonts(METRIC) {
	// 1802957: FF109+: -moz no longer applied but keep for regression testing
		// add bogus '-default-font' to check they are falling back to actual default
	let oList = {
		'fonts_moz': [
			'-default-font','-moz-bullet-font','-moz-button','-moz-button-group','-moz-desktop','-moz-dialog','-moz-document',
			'-moz-field','-moz-info','-moz-list','-moz-message-bar','-moz-pull-down-menu','-moz-window','-moz-workspace',
		],
		'fonts_system': ['caption','icon','menu','message-box','small-caption','status-bar']
	}
	let aProps = ['font-size','font-style','font-weight','font-family']
	let hash, btn ='', data = {}, notation = 'moz_fonts' == METRIC ? default_red : rfp_red

	try {
		let tmpdata = {}
		let el = dom.tzpDiv
		// typecheck
		for (const j of aProps) {
			let test = getComputedStyle(el)[j]
			if (runST) {test =''}
			let typeCheck = typeFn(test)
			if ('string' !== typeCheck) {throw zErrType + j +': '+ typeCheck}
		}
		oList[METRIC].forEach(function(name){
			let aKeys = []
			el.style.font ='' // always clear in case a font is invalid/deprecated
			el.style.font = name
			for (const j of aProps) {aKeys.push(getComputedStyle(el)[j])}
			let key = aKeys.join(' ')
			if (tmpdata[key] == undefined) {tmpdata[key] = [name]} else {tmpdata[key].push(name)}
		})
		let count = 0
		for (const k of Object.keys(tmpdata).sort()) {data[k] = tmpdata[k]; count += tmpdata[k].length}
		hash = mini(data)
		// moz: defaults since at least 115 on win/linux: assume android/mac the same: i.e switch to generic font-families
		if ('fonts_moz' == METRIC) {
			if ('windows' == isOS || 'mac' == isOS || 'linux' == isOS) {
				if ('fe778289' == hash) {notation = default_green} // 16px normal 400 serif
			} else if ('android' == isOS) {
				if ('7e76c987' == hash) {notation = default_green} // 16px normal 400 sans-serif
			}
		} else {
			// RFP FF128+
			if ('windows' == isOS) {
				if ('a75e7a17' == hash) {notation = rfp_green} // 12px normal 400 sans-serif
			} else if ('mac' == isOS) {
				if ('0b6c0dbe' == hash) {notation = rfp_green}
				/* mac
				11px normal 400 -apple-system: [message-box, status-bar],
				11px normal 700 -apple-system: [small-caption],
				12px normal 400 -apple-system: [icon],
				13px normal 400 -apple-system: [caption, menu]
				*/
			} else if ('linux' == isOS) {
				if (isTB) {
					// TB14: due to font config aliases
					if ('ea0ea5d7' == hash) {notation = rfp_green} // 15px normal 400 Arimo
				} else {
					if ('48e3d1b4' == hash) {notation = rfp_green} // 15px normal 400 sans-serif
				}
			} else if ('android' == isOS) {
				if ('7e83ef35' == hash) {notation = rfp_green} // 12px normal 400 Roboto
			}
		}
		if (isSmart) {count = (count +'').padStart(2,' ')} // aesthetics: align the last three "font" health metrics
		btn = addButton(12, METRIC, Object.keys(data).length +'/'+ count)
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(12, METRIC, hash, btn, notation, data)
	return
}

function get_textmetrics(METRIC) {
	/* https://www.bamsoftware.com/talks/fc15-fontfp/fontfp.html#demo */
	/* NOTES
	FF86+: 1676966: gfx.font_rendering.fallback.async
		- set chars directly in HTML to force fallback ASAP
	*/
	let t0 = nowFn()
	let oMetrics = {
		actualboundingbox: ['actualBoundingBoxAscent','actualBoundingBoxDescent','actualBoundingBoxLeft','actualBoundingBoxRight'],
		baseline: ['alphabeticBaseline','hangingBaseline','ideographicBaseline'],
		emheight: ['emHeightAscent','emHeightDescent'],
		fontboundingbox: ['fontBoundingBoxAscent','fontBoundingBoxDescent'],
		// width is mostly identical to glyphs domrect width (untransformed). A handful of font widths
		// differ by a tiny amount e.g. ±0.0001220703125 or -0.00006103515625. This is not going to add
		// much entropy if any, so drop for now
		//width: ['width'],
	}
	let oData = {}, aValid = [], aCodes

	try {
		if (runSE) {foo++}
		// check supported + type
		let aNonsense = ['', Infinity,' ', [], true, undefined, {1:2}, null, 'a']
		let canvas = dom.tzpTextmetrics, ctx = canvas.getContext('2d')
		// transform: skew(1.787542deg, 3.263901deg)
		let tm = ctx.measureText('a')
		ctx.setTransform(1, 0.2, 0.8, 1, 0, 0)
		for (const k of Object.keys(oMetrics)) {
			oData[k] = {}
			let oSet = new Set()
			for (const j of oMetrics[k]) {
				let isSupported = runST ? Math.random() < 0.5 : TextMetrics.prototype.hasOwnProperty(j)
				if (isSupported) {
					let typeCheck = typeFn(tm[j])
					if (runST && Math.random() < 0.5) {
						let x = aNonsense[Math.floor(Math.random() *10 )]
						typeCheck = typeFn(x)
					}
					if ('number' !== typeCheck) {
						isSupported = zErr
						let suffix = 'baseline' == k ? j.slice(0, j.length-8) : j.slice(k.length)
						if ('width' == k) {
							addBoth(12, METRIC +'_'+ k, log_error(12, METRIC +'_'+ k, zErrType + typeCheck))
						} else {
							log_error(12, METRIC +'_'+ k +'_'+ suffix.toLowerCase(), zErrType + typeCheck)
						}
					}
				}
				oData[k][j] = isSupported
				oSet.add(isSupported)
			}
			if (1 == oSet.size && oSet.has(true)) {aValid.push(k) // test
			} else if (1 == oSet.size && oSet.has(false)) {addBoth(12, METRIC +'_'+ k, zNA) // not supported
			} else if ('width' == k) { // error: we already added width
			} else if (1 == oSet.size && oSet.has(zErr)) {addBoth(12, METRIC +'_'+ k, zErr +'s') // errors
			} else {
				let summary = []
				for (const j of oMetrics[k]) {summary.push(oData[k][j])}
				addBoth(12, METRIC +'_'+ k, summary.join(', ')) // mixed
			}
		}
		if (0 == aValid.length) {return}

		let styles = ['cursive','monospace','sans-serif','serif','system-ui']
		// don't use 'none': this is default style + font per style for each language
			// and is already present in covering monospace/sans-serif/serif
			// fantasy vs sans-serif | fangsong vs serif both add very little

		oData = {} // clear
		aValid.forEach(function(k){
			oData[k] = {}
			styles.forEach(function(s){oData[k][s] = {}})
		})

		let aSet = [], aList = ['actualboundingbox', 'width']
		aList.forEach(function(m) {if (aValid.includes(m)) {aSet.push(m)}})
		if (aSet.length) {
			aCodes = fntCodes.a
			styles.forEach(function(s) { // each style
				aCodes.forEach(function(code) { // each code
					let codeString = String.fromCodePoint(code)
					ctx.font = 'normal normal 22000px '+ s
					let tm = ctx.measureText(codeString)
					// textmetrics
					aSet.forEach(function(k){
						let data = [], props = oMetrics[k]
						props.forEach(function(p) {data.push(tm[p])})
						oData[k][s][code] = data
					})
				})
			})
		}

		// ToDo: use a different set of unicode points (per aList if need be) that give different results
			// for now just return one value
		aSet = [], aList = ['baseline', 'emheight', 'fontboundingbox']
		aList.forEach(function(m) {if (aValid.includes(m)) {aSet.push(m)}})
		if (aSet.length) {
			aCodes = [] = fntCodes.b
			styles.forEach(function(s) { // each style
				aCodes.forEach(function(code) { // each code
					let codeString = String.fromCodePoint(code)
					ctx.font = 'normal normal 22000px '+ s
					let tm = ctx.measureText(codeString)
					// textmetrics
					aSet.forEach(function(k){
						let data = [], props = oMetrics[k]
						props.forEach(function(p) {data.push(tm[p])})
						//oData[k][s][code] = data
						oData[k][s] = data // we're only getting a single codepoint
					})
				})
			})
		}
		//console.log(oData)

		aValid.forEach(function(k) {
			let tmpobj = {}, newobj = {}, data = {}, isLies = false
			// group hashes
			for (const s of Object.keys(oData[k])) {
				let hash = mini(oData[k][s])
				if (undefined == tmpobj[hash]) {tmpobj[hash] = {'data': oData[k][s], 'names': [s]}
				} else {tmpobj[hash].names.push(s)}
			}
			for (const k of Object.keys(tmpobj)) {newobj[tmpobj[k].names.join(' ')] = tmpobj[k].data} // group by name
			for (const k of Object.keys(newobj).sort()) {data[k] = newobj[k]} // sort by name
			oMetrics[k].forEach(function(name){if (isProxyLie('TextMetrics.' + name)) {isLies = true}})
			let hash = mini(data), btn = addButton(12, METRIC +'_'+ k)
			addBoth(12, METRIC +'_'+ k, hash, btn,'', data, isLies)
		})
	

	} catch(e) {
		for (const k of Object.keys(oMetrics)) {
			addBoth(12, METRIC +'_'+ k, log_error(12, METRIC +'_'+ k, e))
		}
	}
	log_perf(12, METRIC, t0)
	try {dom.tzpTextmetrics.height = 0} catch(e) {} // hide the fixed canvas after use
	return
}

function get_widget_fonts(METRIC) {
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
	let aList = [
		'button','checkbox','color','date','datetime-local','email','file','hidden','image','month','number',
		'password','radio','range','reset','search','select','submit','tel','text','textarea','time','url','week',
	]
	let aProps = ['font-family','font-size']
	let hash, btn='', data = {}, notation = rfp_red
	try {
		let tmpdata = {}
		let target = dom.tzpWidget
		for (let i=0; i < aList.length; i++) {
			let el = target.children[i], name = aList[i]
			let aKeys = []
			for (const j of aProps) {
				let value = getComputedStyle(el)[j]
				// type check first item
				if (name == aList[0]) {
					if (runST) {value =''}
					let typeCheck = typeFn(value)
					if ('string' !== typeCheck) {throw zErrType + j +': '+ typeCheck}
				}
				aKeys.push(value)
			}
			let key = aKeys.join(' ')
			if (tmpdata[key] == undefined) {tmpdata[key] = [name]} else {tmpdata[key].push(name)}
		}
		let count = 0
		for (const k of Object.keys(tmpdata).sort()) {data[k] = tmpdata[k]; count += tmpdata[k].length}
		hash = mini(data)
		btn = addButton(12, METRIC, Object.keys(data).length +'/'+ count)
		// RFP FF128+
		if ('windows' == isOS && '24717aa8' == hash) {notation = rfp_green
		/*monospace 13.3333px: [date, datetime-local, time],
			monospace 13px: [textarea],
			sans-serif 13.3333px: [19 items],
			sans-serif 13px: [image]*/
		} else if ('mac' == isOS && '12e7f88a' == hash) {notation = rfp_green
		/*-apple-system 13.3333px: [19 items],
			monospace 13.3333px: [date, datetime-local, time],
			monospace 13px: [textarea],
			sans-serif 13px: [image] */
		} else if ('linux' == isOS) {
			if (isTB) {
			// TB14: due to font config aliases
			/*Arimo 13.3333px: [19 items],
				monospace 12px: [textarea],
				monospace 13.3333px: [date, datetime-local, time],
				sans-serif 13px: [image]*/
				if ('edeba276' == hash) {notation = rfp_green}
			} else {
			/*monospace 12px: [textarea],
				monospace 13.3333px: [date, datetime-local, time],
				sans-serif 13.3333px: [19 items],
				sans-serif 13px: [image]*/
				if ('99054729' == hash) {notation = rfp_green}
			}
		} else if ('android' == isOS && '0833dc19' == hash) {notation = rfp_green
		/*Roboto 13.3333px: [19 items],
			monospace 12px: [textarea],
			monospace 13.3333px: [date, datetime-local, time],
			sans-serif 13px: [image]*/
		}
	} catch(e) {
		hash = e; data = zErrLog
	}
	addBoth(12, METRIC, hash, btn, notation, data)
	return
}

const get_woff2 = (METRIC) => new Promise(resolve => {
	try {
		const supportsWoff2 = (function(){
			const font = new FontFace('t', 'url("data:font/woff2;base64,d09GMgABAAAAAADwAAoAAAAAAiQAAACoAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAALAogOAE2AiQDBgsGAAQgBSAHIBuDAciO1EZ3I/mL5/+5/rfPnTt9/9Qa8H4cUUZxaRbh36LiKJoVh61XGzw6ufkpoeZBW4KphwFYIJGHB4LAY4hby++gW+6N1EN94I49v86yCpUdYgqeZrOWN34CMQg2tAmthdli0eePIwAKNIIRS4AGZFzdX9lbBUAQlm//f262/61o8PlYO/D1/X4FrWFFgdCQD9DpGJSxmFyjOAGUU4P0qigcNb82GAAA") format("woff2")', {});
			font.load().catch(err => {
				// NetworkError: A network error occurred. < woff2 disabled/downloadable | fonts blocked e.g. uBO
				// ReferenceError: FontFace is not defined < layout.css.font-loading-api.enabled
				addDisplay(12, METRIC, log_error(12, METRIC, err))
			})
			return font.status == 'loaded' || font.status == 'loading'
		})()
		let value = (supportsWoff2 ? zS : zF)
		addBoth(12, METRIC, value)
		return resolve()
	} catch(e) {
		addBoth(12, METRIC, e,'','', zErrLog)
		return resolve()
	}
})

const outputFonts = () => new Promise(resolve => {
	set_fntList()
	Promise.all([
		get_document_fonts('document_fonts'), // sets fntDocEnabled
		get_script_defaults('script_defaults'),
		get_fonts('font_sizes'), // uses fntDocEnabled
		get_system_fonts('fonts_moz'),
		get_system_fonts('fonts_system'),
		get_widget_fonts('fonts_widget'),
		get_formats(),
		get_woff2('woff2'),
		get_graphite('graphite'), // uses fntDocEnabled
	]).then(function(){
		// allow more time for font async fallback
		Promise.all([
			get_fontfaces('font_faces'),
			get_glyphs('glyphs'),
			get_textmetrics('textmetrics'),
		]).then(function(){
			if (fntBtn.length) {addDisplay(12, 'fntBtn', fntBtn)}
			return resolve()
		})
	})
})

countJS(12)
