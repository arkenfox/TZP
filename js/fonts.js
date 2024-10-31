'use strict';

let fntCodePoints = {
	tofu: ['0xFFFF'],
	tbwindows: ['0x0374'], // or '0x0375': +1 more size: not worth it
}

let fntCodes = [ // sorted
	'0x007F','0x0218','0x058F','0x05C6','0x061C','0x0700','0x08E4','0x097F','0x09B3',
	'0x0B82','0x0D02','0x10A0','0x115A','0x17DD','0x1950','0x1C50','0x1CDA','0x1D790',
	'0x1E9E','0x20B0','0x20B8','0x20B9','0x20BA','0x20BD','0x20E3','0x21E4','0x23AE',
	'0x2425','0x2581','0x2619','0x2B06','0x2C7B','0x302E','0x3095','0x532D','0xA73D',
	'0xA830','0xF003','0xF810','0xFBEE',
	/* ignore: https://en.wikipedia.org/wiki/Specials_(Unicode_block)#Replacement_character
		problematic e.g windows 1st use /applying translations
		'0xFFF9','0xFFFD',
	//*/
	'0xFFFF',
]

let fntData = {},
	fntSize = '512px',
	fntString = 'Mōá?-'+ get_fntCodes('tofu'),
	fntBtn = '',
	fntFake,
	fntDocEnabled = false,
	fntBases = {},
	fntBasesRaw = {},
	fntBasesValid = {}

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
			/* variants
				'Arial Black','Arial Narrow','Segoe UI Light','Segoe UI Semibold', // 7
				'Segoe UI Semilight', // 8
				'Microsoft JhengHei Light','Microsoft YaHei Light','Segoe UI Black', // 8.1
				'Malgun Gothic Semilight', // 10
			*/
		],
	},
	// TB unexpected
	blocklist: {
		android: [],
		linux: [
			'Noto Color Emoji','Noto Emoji','Noto Mono','Noto Sans','Noto Serif', // notos
			'Cantarell','DejaVu Sans','DejaVu Serif','Droid Sans','STIX', // fedora
			'Dingbats','FreeMono','Ubuntu', // ubuntu
			'Liberation Mono','Liberation Sans','Liberation Serif', // popular
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math', // TB12 fontnames
		],
		mac: [
			'Apple Symbols','Avenir','Charter','Impact','Palatino','Rockwell', // system
			'Noto Serif Hmong Nyiakeng','Noto Sans Symbols2','STIX Math', // TB12 fontnames
			'.Helvetica Neue DeskInterface', // dot-prefixed font families on mac = hidden // tb#42377
		],
		windows: [
			'Calibri', 'Candara', // 'Corbel','Ebrima','Gabriola', // system
			'MS Dlg Shell', // system that should point to Microsoft Sans Serif
			'Gill Sans','Gill Sans MT', // MS bundled
			'Noto Serif Hmong Nyiakeng', // 'Noto Sans Symbols2', // TB12 fontnames
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
				'Franklin Gothic Medium', // 7 not detected if font-vis < 3: 1720408
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
				// other
			'Liberation Mono','Liberation Sans','Liberation Serif',
			'OpenSymbol', // openoffice
			'Amiri', // libreoffice
			// ToDo: expand
		],
		mac: [
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
	},
	// isOS
	mini: [
		'-apple-system',
		'Dancing Script', // android fallback // 'Roboto'
		'MS Shell Dlg \\32',
	],
}

function get_fntCodes(name) {
	let list = fntCodePoints[name], str =''
	list.forEach(function(code) {str += String.fromCodePoint(code)})
	return str
}

function set_fntList() {
	let fntListBaseName = isTB ? 'allowlist' : 'kBaseFonts'
	let build = (gLoad || isFontSizesMore !== isFontSizesPrevious)

	if (build) {
		isFontSizesPrevious = isFontSizesMore
		fntData = {
			system: [], bundled: [], base: [], baselang: [], fpp: [], unexpected: [], full: [],
			control: [], 'control_name': [], generic: [], 
		}

		// baseSize: add fallback for misconfigured/missing
		// isPlatformFont: expected + isn't/can't be blocked
			// no entropy loss: size collisions of expected system fonts e.g. Tahoma
			// means not detected/recorded - but we _know_ it should be there
		let isPlatformFont
		let baseSize = ['monospace','sans-serif','serif']
		let tofu = get_fntCodes('tofu')
		if ('windows' == isOS) {
			// Mō + tofu = 157/189 fonts win11 || áΩ
			fntString = isTB ? '?-'+ tofu : 'Mō'+ tofu
			if (!isFontSizesMore) {isPlatformFont = 'MS Shell Dlg \\32'}
			if (isTB) {isPlatformFont = undefined} // force TB to detect all fonts for health
			baseSize = [
				'monospace, Consolas, Courier, \"Courier New\", \"Lucida Console\"',
				'sans-serif, Arial',
				'serif, Times, Roman'
			]
		} else if ('mac' == isOS) {
			if (!isFontSizesMore) {isPlatformFont = '-apple-system'}
			baseSize = ['monospace, Menlo, Courier, \"Courier New\", Monaco','sans-serif','serif']
		} else if ('android' == isOS) {
			// Roboto is not guaranteed unless Android 9+
			if (!isFontSizesMore) {isPlatformFont = 'Dancing Script'}
			fntString = '?-'+ tofu
		}

		// baseCtrl: 1-pass or 3-pass
		// baseCtrlNames: remove fallback e.g. 'serif, X' -> 'serif'
		let baseCtrl = isPlatformFont == undefined ? baseSize : [isPlatformFont]
		fntData.control = baseCtrl
		let baseCtrlNames = []
		baseCtrl.forEach(function(name) {
			baseCtrlNames.push(name.split(',')[0])
		})
		fntData['control_name'] = baseCtrlNames
		
		// generic: expand baseSize
			//'ui-monospace','ui-rounded','ui-serif','math','emoji','none' // redundant
		baseSize = baseSize.concat(['cursive','fantasy','fangsong','system-ui'])
		baseSize = baseSize.concat(isSystemFont)
		if (isPlatformFont !== undefined) {baseSize.push(isPlatformFont)}
		fntData.generic = baseSize.sort()

		// lists
		if (isOS !== undefined) {
			fntFake = '--00'+ rnd_string()
			let array = []
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

			}
			// -control from lists
			if (isPlatformFont !== undefined) {
				let fntKeys = ['base','full','fpp','system','bundled']
				fntKeys.forEach(function(key) {
					if (fntData[key] !== undefined) {
					let array = fntData[key]
					 fntData[key] = array.filter(x => ![isPlatformFont].includes(x))
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
			// fntBtns
			let str = 'fonts_'+ isOS, fntBtnBundled, fntBtnSystem, fntBtnBase, fntBtnBaseLang, fntBtnFPP, fntBtnUnexpected, fntBtnAll
			fntBtnBundled = addButton(12, str +'_bundled', fntData.bundled.length, 'btnc', 'lists')
			fntBtnSystem = addButton(12, str +'_system', fntData.system.length, 'btnc', 'lists')
			fntBtnUnexpected = addButton(12, str +'_unexpected', fntData.unexpected.length, 'btnc', 'lists')
			fntBtnBase = addButton(12, str +'_'+ fntListBaseName, fntData.base.length, 'btnc', 'lists')
			fntBtnBaseLang = addButton(12, str +'_kLangPackFonts', fntData.baselang.length, 'btnc', 'lists')
			fntBtnFPP = addButton(12, str +'_FPP', fntData.fpp.length, 'btnc', 'lists')
			fntBtnAll = addButton(12, str, fntData.full.length, 'btnc', 'lists')
			// fntBtn
			if ('android' == isOS) {
				fntBtn = fntBtnAll
			} else if (isTB) {
				fntBtn = fntBtnSystem +' + '+ fntBtnBundled +' = '+ fntBtnBase +' + '+ fntBtnUnexpected +' = '+ fntBtnAll					
 			} else if ('windows' == isOS) {
				fntBtn = fntBtnBase +' + '+ fntBtnBaseLang +' = '+ fntBtnFPP +' + '+ fntBtnUnexpected +' = '+ fntBtnAll
			} else {
				fntBtn = (isOS !== 'linux' ? fntBtnBase : '') + fntBtnAll
			}
		}
	}
	// bail
	if (isOS == undefined) {return}

	// fnt*Btn data
	if (gRun || build) {
		let str = 'fonts_'+ isOS
		addDetail(str +'_system', fntData.system, 'lists')
		addDetail(str +'_bundled', fntData.bundled, 'lists')
		addDetail(str +'_'+ fntListBaseName, fntData.base, 'lists')
		addDetail(str +'_kLangPackFonts', fntData.baselang, 'lists')
		addDetail(str +'_FPP', fntData.fpp, 'lists')
		addDetail(str +'_unexpected', fntData.unexpected, 'lists')
		addDetail(str, fntData.full, 'lists')
	}
}

function get_document_fonts(METRIC) {
	fntDocEnabled = false // reset
	const fntTest = '\"Arial Black\"'
	let value, data, notation = default_red
	try {
		if (runSE) {foo++}
		let font = getComputedStyle(dom.divDocFont).getPropertyValue('font-family')
		fntDocEnabled = (font == fntTest ? true : false)
		if (!fntDocEnabled) {
			if ('Arial Black' == font.slice(0,11)) {fntDocEnabled = true} // ext may strip quotes marks
		}
		value = (fntDocEnabled ? zE : zD) +' | '+ font
		if (zE +' | '+ fntTest == value) {notation = default_green}
	} catch(e) {
		value = e; data = zErrLog
	}
	addBoth(12, METRIC, value,'', notation, data)
	return
}

const get_font_sizes = (isMain = true, METRIC = 'font_sizes') => new Promise(resolve => {
	/* getDimensions code based on https://github.com/abrahamjuliot/creepjs */
	const id = 'font-fp'
	try {
		// reset
		fntBases = {} 
		fntBasesRaw = {}
		fntBasesValid = {}

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
				// keep in order for font_sizes_base_reported
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

		if (isMain && runSF) {
			getDimensions = (span, style) => {
				const transform = style.transformOrigin.split(' ')
				const perspective = style.perspectiveOrigin.split(' ')
				const dimensions = {
					clientHeight: span.clientHeight,
					clientWidth: span.clientWidth,
					domrectboundingHeight: null,
					domrectboundingWidth: '',
					domrectboundingrangeHeight: range.getBoundingClientRect().height,
					domrectboundingrangeWidth: range.getBoundingClientRect().width,
					domrectclientHeight: span.getClientRects()[0].height, // same size: engineered below
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
					offsetHeight: NaN, // TypeError: NaN (same)
					offsetWidth: NaN,
					perspectiveHeight: undefined, // TypeError: Infinity x undefined (different)
					perspectiveWidth: Infinity,
					pixelHeight: pixelsToInt(style.height) + ((Math.random() * 100) / 100), // all
					pixelWidth: pixelsToInt(style.width),
					pixelsizeHeight: 100, // none
					pixelsizeWidth: 200,
					scrollHeight: 0, // Invalid: width or height < 1
					scrollWidth: 50,
					transformHeight: originPixelsToInt(transform[1]), // fake font detected: engineered below
					transformWidth: originPixelsToInt(transform[0]),
				}
				return dimensions
			}
		}

		let fntGeneric = [], fntTest = [], fntControl = []
		let aTests = [], aTestsValid = []
		if (isMain) {
			fntControl = fntData.control
			fntGeneric = fntData.generic
			fntTest = fntData.full
			aTests = [
				['client', detectedViaClient, 'fontsClient'],
				['domrectbounding', detectedViaDomRectBounding, 'fontsDomRectBounding'],
				['domrectboundingrange', detectedViaDomRectBoundingRange, 'fontsDomRectBoundingRange'],
				['domrectclient', detectedViaDomRectClient, 'fontsDomRectClient'],
				['domrectclientrange', detectedViaDomRectClientRange, 'fontsDomRectClientRange'],
				['offset', detectedViaOffset, 'fontsOffset'],
				['npixel', detectedViaPixelNumber, 'fontsPixelNumber'],
				['npixelsize', detectedViaPixelSizeNumber, 'fontsPixelSizeNumber'],
				['nperspective', detectedViaPerspectiveNumber, 'fontsPerspectiveNumber'],
				['ntransform', detectedViaTransformNumber, 'fontsTransformNumber'],
				['pixel', detectedViaPixel, 'fontsPixel'],
				['pixelsize', detectedViaPixelSize, 'fontsPixelSize'],
				['perspective', detectedViaPerspective, 'fontsPerspective'],
				['scroll', detectedViaScroll, 'fontsScroll'],
				['transform', detectedViaTransform, 'fontsTransform'],
			]
		} else {
			fntControl = ['monospace, Consolas, Menlo, \"Courier New\"','sans-serif, Arial','serif, \"Times New Roman\"']
			fntGeneric = fntControl
			fntTest = ['--00'+ rnd_string()]
			fntTest = fntTest.concat(fntMaster.mini)
			aTests = [
				['nperspective', detectedViaPerspectiveNumber],
			]
		}

		// base sizes
		let base = fntGeneric.reduce((acc, font) => {
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

		// group base by hash
		let oTempBase = {}
		if (isMain) {
			for (const k of Object.keys(base)) {
				fntBasesRaw[k] = {}
				for (const j of Object.keys(base[k])) {fntBasesRaw[k][j] = base[k][j]}
			}
			for (const k of Object.keys(fntBasesRaw)) {
				let tmpHash = mini(fntBasesRaw[k])
				if (oTempBase[tmpHash] == undefined) {
					oTempBase[tmpHash] = {bases: [k], metrics: fntBasesRaw[k]}
				} else {
					oTempBase[tmpHash].bases.push(k)
				}
			}
		}
		//console.log(base)
		//console.log(oTempBase)

		// test validity
		let baseStyle = 'monospace' // we need a base style: we'll always have monospace
		aTests.forEach(function(item) {
			let name = item[2], error
			let wName = item[0] +'Width', hName = item[0] +'Height'
			let wValue = base[baseStyle][wName], hValue = base[baseStyle][hName]
			let wType = typeFn(wValue)
			let hType = typeFn(hValue)
			if ('number' == wType && 'number' == hType) {
				if (wValue < 1 || hValue < 1) {
					error = zErrInvalid + 'width or height < 1'
				} else if (wValue == hValue < 1) {
					error = zErrInvalid + 'width == height'
				} else {
					aTestsValid.push(item)
					fntBasesValid[name] = item[0]
				}
			} else {
				error = zErrType + (wType == hType ? wType : wType +' x '+ hType)
			}
			if (error !== undefined) {
				item[1].clear()
				item[1].add(zErr)
				addDisplay(12, name, log_error(12, METRIC +'_'+ (name.slice(5).toLowerCase()), error))
			}
		})

		if (isMain) {
			// reorder oTempBase => fntBases
			let tmpBases = {}
			for (const h of Object.keys(oTempBase)) {
				let key = oTempBase[h].bases.join(' ')
				let hash = mini(oTempBase[h].metrics)
				tmpBases[key] = {hash: hash, metrics: oTempBase[h].metrics}
			}
			for (const k of Object.keys(tmpBases).sort()) {fntBases[k] = tmpBases[k]}
			if (runSF) {detectedViaTransform.add(fntFake +':'+ fntControl[0] +':700 x 800')} // fake font detected
			if (!fntTest.length || false == fntDocEnabled) {
				return resolve('baseonly')
			}
		}

		// measure
		if (aTestsValid.length) {
			let isDetected = false, intDetected = 0, intDetectedMax = aTestsValid.length
			fntTest.forEach(font => {
				isDetected = false // have we found it
				intDetected = 0 // in all valid methods
				fntControl.forEach(basefont => {
					if (isDetected) {return}
					intDetected = 0 // reset per control
					const family = "'"+ font +"', "+ basefont	
					span.style.setProperty('--font', family)
					const style = getComputedStyle(span)
					const dimensions = getDimensions(span, style)
					basefont = basefont.split(',')[0] // switch to short generic name
					aTestsValid.forEach(function(pair) {
						let wName = pair[0] +'Width', hName = pair[0] +'Height'
						if (dimensions[wName] != base[basefont][wName] || dimensions[hName] != base[basefont][hName]) {
							pair[1].add(font +':'+ basefont +':'+ dimensions[wName] +' x '+ dimensions[hName])
							intDetected++
						}
					})
					if (intDetected == intDetectedMax && !isFontSizesMore) {isDetected = true}
					//isDetected = false // force max passes per font
				})
			})
		}
		// exit isOS check
		if (!isMain) {
			return resolve([...detectedViaPerspectiveNumber])
		}

		if (runSF) {
			// modify domrect client so all the sizes are the same
			let tmp = []
			detectedViaDomRectClient.forEach(function(item) {
				let parts = item.split(':')
				tmp.push(parts[0] +':'+ parts[1] +':700 x 800')
			})
			detectedViaDomRectClient.clear()
			tmp.forEach(function(item) {
				detectedViaDomRectClient.add(item)
			})
		}

		aTestsValid.forEach(function(item) {
			let name = item[2], error
			if (0 == item[1].size) {
				error = zErrInvalid +'none'
			} else if (item[1].size == fntData.full.length) {
				error = zErrInvalid +'all'
			} else {
				let firstDetected = [...item[1]][0]
				if (firstDetected.includes(fntFake)) {
					error = zErrInvalid +'fake font detected'
				}
			}
			if (error !== undefined) {
				item[1].clear()
				item[1].add(zErr)
				addDisplay(12, name, log_error(12, METRIC +'_'+ (name.slice(5).toLowerCase()), error))
				delete fntBasesValid[name]
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
		const fontsDomRectBounding = [...detectedViaDomRectBounding]
		const fontsDomRectBoundingRange = [...detectedViaDomRectBoundingRange]
		const fontsDomRectClient = [...detectedViaDomRectClient]
		const fontsDomRectClientRange = [...detectedViaDomRectClientRange]
		return resolve({
			// match display order so btn links = first of each hash
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
	} catch(e) {
		if (isMain) {log_error(12, METRIC, e)} else {console.error(e)}
		return resolve(zErr)
	}
})

function get_fonts(METRIC) {
	let t0 = nowFn()
	const METRICG = METRIC +'_groups'
	const METRICB = METRIC +'_base'
	const METRICN = 'font_names'
	let badnotation = isTB ? tb_red : rfp_red
	let goodnotation = isTB ? tb_green : rfp_green
	let oDomList = {
		0: 'fontsDomRectBounding',
		1: 'fontsDomRectClient',
		2: 'fontsDomRectBoundingRange',
		3: 'fontsDomRectClientRange',
	}

	// functions
	function exit(value) {
		addBoth(12, METRIC, value)
		addBoth(12, METRICN, value,'', badnotation)
		addBoth(12, METRICG, value,'', badnotation)
		if (value == zNA) {
			add_basesizes(value)
		} else {
			addBoth(12, METRICB, value)
		}
		log_perf(12, METRIC, t0)
		return
	}

	function add_basesizes(type) {
		let select
		if (type == zNA) {
			let order = [
				'fontsDomRectBounding','fontsDomRectBoundingRange','fontsDomRectClient','fontsDomRectClientRange',
				'fontsPerspectiveNumber','fontsTransformNumber','fontsPixelNumber','fontsPixelSizeNumber'
			]
			// exclude domrect lies
			for (const k of Object.keys(oDomList)) {
				if (!aDomRect[k]) {order = order.filter(x => ![oDomList[k]].includes(x))} // remove from list
			}
			for (let i=0; i < order.length; i++) {
				let value = fntBasesValid[order[i]]
				if (value !== undefined) {select = value; type = order[i]; break}
			}
		} else {
			select = fntBasesValid[type]
		}

		let hashAll = mini(fntBases)
		let lookup = fntData.generic
		let btnBaseAll = ' | '+ hashAll + addButton(12, METRICB +'_reported', Object.keys(fntBases).length +'/'+ lookup.length)
		addDetail(METRICB +'_reported', fntBases)

		if (select !== undefined) {
			// rebuild: base names from fntData.generic, data from fntBase
			let oHash = {}, oFont = {}, newobj = {}, lookup = fntData.generic
			// get select method + group by hash
			for (let i=0; i < lookup.length; i++) {
				let font = lookup[i].split(',')[0], items = fntBasesRaw[font]
				let w = items[select +'Width'], h = items[select +'Height']
				let tmphash = mini([w, h])
				if (oHash[tmphash] == undefined) {oHash[tmphash] = {data: [w, h], group: [font]}} else {oHash[tmphash]['group'].push(font)}
			}
			// group by fonts, then sort
			for (const k of Object.keys(oHash)) {oFont[oHash[k].group.join(' ')] = oHash[k].data}
			for (const k of Object.keys(oFont).sort()) {newobj[k] = oFont[k]}
			//console.log(oHash, oFont)
			let hash = mini(newobj)
			let method = ' ['+ type.slice(5).toLowerCase() +']'
			let btn = addButton(12, METRICB, Object.keys(newobj).length +'/'+ lookup.length)
			addBoth(12, METRICB, hash, btn + method + btnBaseAll,'', newobj)
		} else {
			addBoth(12, METRICB, 'unknown', btnBaseAll,'','', true)
		}
	}

	// run
	get_font_sizes().then(res => {
		removeElementFn('font-fp')
		// quick exits
		let typeCheck = typeFn(res)
		if ('string' === typeCheck) {exit(('baseonly' == res ? zNA : zErr)); return}
		if ('object' !== typeCheck) {log_error(12, METRIC, zErrType + typeCheck); exit(zErr); return}

		//console.log(res)
		let firstBaseFont = fntData['control_name'][0]
		let oData = {}, oValid = {}
		// note: do not sort: these are font_names:size and fntList was already sorted
		for (let name in res) {
			let data = res[name]
			if (data.length > 1 && data[0] !== zErr) { // non-errors
				// group by hash
				let hash = mini(data)
				oValid[name] = hash
				if (oData[hash] == undefined) {oData[hash] = {'names': [], 'rawdata': data}}
				oData[hash].names.push(name)
			}
		}
		// per hash: collect size buckets, font names, handle isFontSizesMore etc
		for (const k of Object.keys(oData)) {
			let aOriginal = oData[k].rawdata
			let aFontNames = []
			let oSizes = {}
			aOriginal.forEach(function(item) {
				let font = item.split(':')[0],
					basefont = item.split(':')[1],
					size = item.split(':')[2]
				aFontNames.push(font)
				let fontitem = (basefont == firstBaseFont && !isFontSizesMore ? font : font +' '+ basefont) // strip off 1st pass noise
				if (isFontSizesMore) {
					// just record each font + size
					if (oSizes[font] == undefined) {oSizes[font] = {}}
					oSizes[font][basefont] =[size.split(' x ')[0] *1, size.split(' x ')[1] *1]
				} else {
					if (oSizes[size] == undefined) {oSizes[size] = []}
					oSizes[size].push(fontitem)
				}
			})
			// use sizebuckets to catch more fuckery
			let sizebuckets = Object.keys(oSizes).length
			if (1 == sizebuckets) {
				(oData[k].names).forEach(function(name) {
					let error = zErrInvalid +'same size ['+ Object.keys(oSizes)[0].trim() +']'
					addDisplay(12, name, log_error(12, METRIC +'_'+ (name.slice(5).toLowerCase()), error))
					delete oValid[name]
					delete fntBasesValid[name]
				})
				delete oData[k]
			} else {
				let aNew = {}
				for (const j of Object.keys(oSizes).sort()) {aNew[j] = oSizes[j]}
				oData[k].newdata = aNew
				oData[k].sizecount = Object.keys(oSizes).length
				oData[k].hash = mini(aNew)
				// dedupe
				if (isFontSizesMore) {
					aFontNames = aFontNames.filter(function(item, position) {return aFontNames.indexOf(item) === position})
				}
				oData[k][METRICN] = aFontNames
			}
		}

		// 1st choice: domrect that is not a lie
			// remove any lies from valid
		let selected
		let aDomOrder = [3,1,2,0] // reverse order so final match is highest index
		aDomOrder.forEach(function(key) {
			let method = oDomList[key]
			if (aDomRect[key] == true && oValid[method] !== undefined) {selected = method} else {delete oValid[method]}
		})

		// fontsize_group: this gives us any tampering entropy
			// not to be confused with errors/lies which are already recorded
		let aNames = [ // sorted by expected group then name
			'Client','Offset','Perspective','Pixel','PixelSize','Scroll','Transform',
			'PixelNumber','PixelSizeNumber',
			'PerspectiveNumber','TransformNumber',
			'DomRectBounding','DomRectBoundingRange','DomRectClient','DomRectClientRange',
		]
		let oGroups = {}, oIndex = {}, counter = 0
		aNames.forEach(function(n) {
			let k = 'fonts'+ n
			if (oValid[k] !== undefined) {
				let indexKey = oData[oValid[k]].hash
				if (oIndex[indexKey] == undefined) {
					counter++
					oIndex[indexKey] = (counter+'').padStart(2,'0')
				}
				let groupKey = oIndex[indexKey]
				if (oGroups[groupKey] == undefined) {oGroups[groupKey] = []}
				oGroups[groupKey].push(k)
			}
		})
		let grphash = 'unknown', grpbtn ='', grpdata =''
		if (Object.keys(oGroups).length) {
			grphash = mini(oGroups); grpbtn = addButton(12, METRICG); grpdata = oGroups
		}
		addBoth(12, METRICG, grphash, grpbtn, '', oGroups)
		//console.log(oData)
		//console.log(oValid)
		//console.log(selected)

		// fallbacks
		if (selected == undefined) {
			// use raw initial data hashes from remaining oValid (i.e not errors/lies)
			let items = [
				['Perspective', 'Transform', ['Client','Offset','Pixel','PixelSize','Scroll']],
				['Pixel', 'PixelSize', ['Client','Offset','Perspective','Scroll','Transform']],
			]
			for (let i=0; i < items.length; i++) {
				let ctrlName = 'fonts'+ items[i][0], ctrlHash = oValid[ctrlName +'Number']
				let testName = 'fonts'+ items[i][1], testHash = oValid[testName +'Number']
				// *Number versions are not undefined + hashes match
				if (ctrlHash !== undefined && ctrlHash == testHash) {
					// base versions are not undefined and match
					ctrlHash = oValid[ctrlName]
					if (ctrlHash !== undefined && ctrlHash == oValid[testName]) {
						// at least 2/5 more bases versions must match for a majority of 4/7
						let baseTests = items[i][2], matchCount = 0
						for (let j=0; j < baseTests.length; j++) {
							if (ctrlHash == oValid['fonts'+ baseTests[j]]) {matchCount++}
						}
						if (matchCount > 1) {selected = ctrlName +'Number'; break}
					}
				}
			}
		}

		// no more fallbacks
		// output basesizes
		add_basesizes(selected)

		// output oData = not-errors
		for (const k of Object.keys(oData)) {
			let aList = oData[k].names
			for (let i=0; i < aList.length; i++) {
				let method = aList[i]
				// display lines
					// style + record lies to be consistent
				let isLies = false, btn =''
				if (!aDomRect[0] && 'fontsDomRectBounding' == method) {isLies = true
				} else if (!aDomRect[1] && 'fontsDomRectClient' == method) {isLies = true
				} else if (!aDomRect[2] && 'fontsDomRectBoundingRange' == method) {isLies = true
				} else if (!aDomRect[3] && 'fontsDomRectClientRange' == method) {isLies = true}
				let fntmethod = METRIC +'_'+ (method.slice(5).toLowerCase())
				if (isLies) {log_known(12, fntmethod, {'hash': oData[k].hash, 'metrics': oData[k].newdata})}
				//add btn to first of each hash
				if (i == 0) {
					addDetail(fntmethod, oData[k].newdata)
					btn = addButton(12, fntmethod, oData[k].sizecount)
				}
				addDisplay(12, method, oData[k].hash, btn,'', isLies)

				// FP data: not lies
				if (method == selected) {
					let notation = ''
					if (fntData.base.length) {
						notation = goodnotation
						// names: not needed in FP but include for upstream
						let aNotInBase = oData[k][METRICN], aMissing = [], aMissingSystem = []
						aNotInBase = aNotInBase.filter(x => !fntData.base.includes(x))
						if (isTB) {
							aMissing = fntData.bundled
							aMissing = aMissing.filter(x => !oData[k][METRICN].includes(x))
							if (fntData.system.length) {
								aMissingSystem = fntData.system
								aMissingSystem = aMissingSystem.filter(x => !oData[k][METRICN].includes(x))
							}
						}
						let count = aNotInBase.length + aMissing.length + aMissingSystem.length
						if (count > 0) {
							let tmpName = METRICN +'_health', tmpObj = {}
							if (aMissing.length) {tmpObj['missing_bundled'] = aMissing}
							if (aMissingSystem.length) {tmpObj['missing_system'] = aMissingSystem}
							if (aNotInBase.length) {tmpObj['unexpected'] = aNotInBase}
							addDetail(tmpName, tmpObj)
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
					let hash = mini(oData[k][METRICN])
					let btn = addButton(12, METRICN, oData[k][METRICN].length)
					addBoth(12, METRICN, hash, btn, notation, oData[k][METRICN])
					// sizes
					let sizeHash = oData[k].hash
					let sizeBtn = addButton(12, METRIC, oData[k].sizecount)
					addBoth(12, METRIC, sizeHash, sizeBtn,'', oData[k].newdata)
				}
			}
		}
		// nothing
		if (!Object.keys(oData).length || selected == undefined) {
			addBoth(12, METRIC, 'unknown','','','', true)
			addBoth(12, METRICN, 'unknown','','','', true)
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
		let hash, btn = '', data = []
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

function get_graphite(METRIC) {
	let hash, data ='', notation = isTB ? tb_red : ''
	try {
		if (!fntDocEnabled) {throw zErrInvalid + 'document fonts disabled'}
		// ToDo: handle when font face is blocked
		let test = dom.testGraphite.offsetWidth,
			control = dom.ctrlGraphite.offsetWidth
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
	const styles = ['monospace','sans-serif','serif']
	const scripts = {
		arabic: 'ar', armenian: 'hy', bengali: 'bn', cyrillic: 'ru', devanagari: 'hi', ethiopic: 'gez',
		georgian: 'ka', greek: 'el', gujurati: 'gu', gurmukhi: 'pa', hebrew: 'he', japanese: 'ja',
		kannada: 'kn', khmer: 'km', korean: 'ko', latin: 'en', malayalam: 'ml', mathematics: 'x-math',
		odia: 'or', other: 'my', 'simplified chinese': 'zh-CN', sinhala: 'si', tamil: 'ta', telugu: 'te',
		thai: 'th', tibetan: 'bo','traditional chinese (hong kong)': 'zh-HK',
		'traditional chinese (taiwan)': 'zh-TW','unified canadian syllabary': 'cr',
	}
	let hash = zNA, btn ='', data = '', notation = default_red
	if (isGecko) {
		data = {}
		try {
			const el = dom.dfsize,
				elpro = dom.dfproportion
			let tmpdata = {}
			// family typecheck
			let test = getComputedStyle(elpro).getPropertyValue('font-family')
			if (runST) {test = ''}
			let typeCheck = typeFn(test)
			if ('string' !== typeCheck) {throw zErrType + 'font-family: '+ typeCheck}
			// size typecheck
			test = getComputedStyle(el).getPropertyValue('font-size')
			if (runSI) {test = '16ppx'}
			let originalvalue = test
			typeCheck = typeFn(test)
			if ('string' !== typeCheck) {throw zErrType + typeCheck}
			if (test.slice(-2) !== 'px') {throw zErrInvalid + 'got '+ originalvalue} // missing px
			test = test.slice(0, -2)
			if (test.length > 0) {test = test * 1}
			if ('number' !== typeFn(test)) {throw zErrInvalid + 'got '+ originalvalue} // missing number
			// loop
			for (const k of Object.keys(scripts)) {
				let lang = scripts[k]
				elpro.style.fontFamily = ''
				elpro.setAttribute('lang', lang)
				let font = getComputedStyle(elpro).getPropertyValue('font-family')
				let tmp = [font]
				el.setAttribute('lang', lang)
				styles.forEach(function(style) {
					el.style.fontSize = '' // always clear
					el.removeAttribute('font-family')
					el.style.fontFamily = ''
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
		let el = dom.sysFont
		// typecheck
		for (const j of aProps) {
			let test = getComputedStyle(el)[j]
			if (runST) {test = ''}
			let typeCheck = typeFn(test)
			if ('string' !== typeCheck) {throw zErrType + j +': '+ typeCheck}
		}
		oList[METRIC].forEach(function(name){
			let aKeys = []
			el.style.font = '' // always clear in case a font is invalid/deprecated
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
		aList.forEach(function(name) {
			let el = dom['wgt'+ name]
			let aKeys = []
			for (const j of aProps) {
				let value = getComputedStyle(el)[j]
				// type check first item
				if (name == aList[0]) {
					if (runST) {value = ''}
					let typeCheck = typeFn(value)
					if ('string' !== typeCheck) {throw zErrType + j +': '+ typeCheck}
				}
				aKeys.push(value)
			}
			let key = aKeys.join(' ')
			if (tmpdata[key] == undefined) {tmpdata[key] = [name]} else {tmpdata[key].push(name)}
		})
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

function get_unicode() {
	/* https://www.bamsoftware.com/talks/fc15-fontfp/fontfp.html#demo */
	/* NOTES
	FF86+: 1676966: gfx.font_rendering.fallback.async
		- set chars directly in HTML to force fallback ASAP
  FF131+ nightly: 1900175 + 1403931 ride the train
		- Enable USER_RESTRICTED for content processes on Nightly
		- security.sandbox.content.level > 7
		- this affected (FF win11 at least) clientrect/offset + actualBounding
			- 0x3095 + 0x532D (2 CJK chars)
			- almost always both in every style except cursive never affected
			- only changed in http(s), file:// not affected
		- so reminder that generally we should always be using https for final testing/analysis
	*/

	let t0 = nowFn()
	let styles = ['cursive','monospace','sans-serif','serif','system-ui'] // system-ui = FF92+
	// don't use 'none': this is default style + font per style for each language
		// and is already present in covering monospace/sans-serif/serif
		// fantasy vs sans-serif | fangsong vs serif both add very little

	function group(name, objname, data) {
		// group by style then char
		let newobj = {}
		styles.forEach(function(style) {newobj[style] = {}})
		if ('offset' == name || 'clientrect' == name) {
			data.forEach(function(item) {
				newobj[item[0]][item[1]] = [item[2], item[3]] // width + height
			})
		} else {
			// width only
			data.forEach(function(item) {
				if (oTM[name]['all']) {
					newobj[item[0]][item[1]] = item[2]
				} else {
					newobj[item[0]] = item[1]
				}
			})
		}
		let hash = mini(newobj)
		// record valid results
		oObject[objname] = {'data': newobj, 'hash': hash}
		return hash
	}

	let oObject = {}
	function output() {
		// offset first so we can get the str to append to clientrect
		let aList = [['offset', aOffset], ['clientrect', aClient]], offsetStr = ''
		for (const n of Object.keys(oTM)) {	aList.push([n])}
		aList.forEach(function(array) {
			const name = array[0]
			let prefix = 'glyphs_'
			const METRIC = prefix + name
			let data = array[1] == undefined ? oTM[name]['data'] : array[1]

			let str ='', btn ='', isLies = false
			if (oCatch[name] !== undefined) {
				str = oCatch[name]; data = zErrLog
			} else if (0 == data.length) {
				// empty object
				if ('offset' !== name && 'clientrect' !== name) {
					if (!TextMetrics.prototype.hasOwnProperty(name)) {
						str = zNA; data = zNA
					}
				}
			} else {
				// group into new obj
				str = group(name, METRIC, data); btn = addButton(12, METRIC, ('offset' == name ? 'offset' : 'details'))
				data = oObject[METRIC]['data']
				if ('offset' == name) {
					offsetStr = ' | '+ str + btn
					sDetail.document[METRIC] = data
				}
				// lies
				if (isDomRect == -1 && 'clientrect' == name) {isLies = true
				} else if (isProxyLie('TextMetrics.' + name)) {isLies = true}
			}
			if ('offset' !== name) {
				if ('clientrect' == name) {btn += offsetStr}
				addBoth(12, METRIC, str, btn,'', data, isLies)
			}
		})
		log_perf(12, 'glyphs', t0)
		return
	}

	// vars
	let oCatch = {}, aOffset = [], aClient = []
	let isClient = true, isOffset = true, isCanvas = true
	let oTM = {
		width: {},
		actualBoundingBoxAscent: {},
		actualBoundingBoxDescent: {},
		actualBoundingBoxLeft: {},
		actualBoundingBoxRight: {},
		alphabeticBaseline: {},
		emHeightAscent: {},
		emHeightDescent: {},
		fontBoundingBoxAscent: {},
		fontBoundingBoxDescent: {},
		hangingBaseline: {},
		ideographicBaseline: {},
	}
	// items not in aAll only get the first glyph measurement
	let aAll = [
		'width','actualBoundingBoxAscent','actualBoundingBoxDescent',
		'actualBoundingBoxLeft','actualBoundingBoxRight',
	]
	for (const k of Object.keys(oTM)) {
		oTM[k]['data'] = []
		oTM[k]['proceed'] = TextMetrics.prototype.hasOwnProperty(k)
		oTM[k]['all'] = aAll.includes(k)
	}

	let bigint = 9007199254740991
	try {bigint = BigInt(9007199254740991)} catch(e) {}
	const oTypeTest = {
		width: bigint,
		actualBoundingBoxAscent: '',
		actualBoundingBoxDescent: Infinity,
		actualBoundingBoxLeft: 'a',
		actualBoundingBoxRight: ' ',
		alphabeticBaseline: [],
		emHeightAscent: {},
		emHeightDescent: [1],
		fontBoundingBoxAscent: {1:2},
		fontBoundingBoxDescent: null,
		hangingBaseline: true,
		ideographicBaseline: undefined,
	}

	let div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot,
		canvas = dom.ugCanvas, ctx = canvas.getContext('2d')
	let rangeH, rangeW, wType, hType, width, height

	// each style
	styles.forEach(function(stylename) {
		slot.style.fontFamily = stylename
		let isFirst = stylename == styles[0]
		// each code
		fntCodes.forEach(function(code) {
			let	codeString = String.fromCodePoint(code)
			slot.textContent = codeString // set once
			//slot.style.fontFamily = stylename			

			// only typecheck once: first char on first style
			let isFirstCode = code == fntCodes[0]
			let isTypeCheck = (isFirst && isFirstCode)
			// offset: span width, div height
				// offset is just purely for info purposes: redundant with clientrect
			if (isOffset) {
				try {
					width = span.offsetWidth
					height = div.offsetHeight
					if (isTypeCheck) {
						if (runST) {width = null, height = true}
						wType = typeFn(width)
						hType = typeFn(height)
						if ('number' !== wType || 'number' !== hType) {
							throw zErrType + (wType == hType ? wType : wType +' x '+ hType)
						}
					}
					aOffset.push([stylename, code, width, height])
				} catch(e) {
					// don't log offset error, we catch this in other tests
					//oCatch['offset'] = e
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
					if (isTypeCheck) {
						if (runST) {width = NaN, height = [1]}
						wType = typeFn(width)
						hType = typeFn(height)
						if ('number' !== wType || 'number' !== hType) {
							throw zErrType + (wType == hType ? wType : wType +' x '+ hType)
						}
					}
					aClient.push([stylename, code, width, height])
				} catch(e) {
					oCatch['clientrect'] = e
					isClient = false
				}
			}
			// canvas
			if (isCanvas) {
				try {
					ctx.font = 'normal normal 22000px '+ stylename
					if (runSE) {foo++}
					let tm = ctx.measureText(codeString)
					// textmetrics
					for (const k of Object.keys(oTM)) {
						if (oTM[k]['proceed']) {
							let prefix = k == 'width' ? 'glyphs_' : ''
							try {
								let isOnce = oTM[k]['all'] == false && isFirstCode
								if (oTM[k]['all'] || isOnce) {
									let measure = tm[k]
									if (isTypeCheck) {
										if (runST) {measure = oTypeTest[k]}
										let typeCheck = typeFn(measure)
										if ('number' !== typeCheck) {throw zErrType + typeCheck}
									}
									if (isOnce) {
										oTM[k]['data'].push([stylename, measure])
									} else {
										oTM[k]['data'].push([stylename, code, measure])
									}
								}
							} catch(e) {
								oCatch[k] = e
								oTM[k]['proceed'] = false
							}
						}
					}
				} catch(e) {
					for (const k of Object.keys(oTM)) {
						if (oTM[k]['proceed']) {
							let m = (k == 'width' ? 'glyphs_' : '') + k
							oCatch[k] = e
						}
					}
					isCanvas = false
				}
			}
		})
	})
	canvas.height = 0 // hide the fixed canvas after use
	dom.ugSlot =''
	output()
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
		Promise.all([
			get_unicode() // allow more time for font async fallback
		]).then(function(){
			removeElementFn('font-fp')
			if (fntBtn.length) {addDisplay(12, 'fntBtn', fntBtn)}
			return resolve()
		})
	})
})

countJS(12)
