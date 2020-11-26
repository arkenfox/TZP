'use strict';

let	fntCode = ['0x20B9','0x2581','0x20BA','0xA73D','0xFFFD','0x20B8','0x05C6',
	'0x1E9E','0x097F','0xF003','0x1CDA','0x17DD','0x23AE','0x0D02','0x0B82','0x115A',
	'0x2425','0x302E','0xA830','0x2B06','0x21E4','0x20BD','0x2C7B','0x20B0','0xFBEE',
	'0xF810','0xFFFF','0x007F','0x10A0','0x1D790','0x0700','0x1950','0x3095','0x532D',
	'0x061C','0x20E3','0xFFF9','0x0218','0x058F','0x08E4','0x09B3','0x1C50','0x2619'],
	fntStrA = "mmmLLLmmmWWWwwwmmmllliii",
	fntStrB = "",
	fntList = [],
	fntHead = "  glyph        default     sans-serif          serif"
		+ "      monospace        cursive        fantasy<br>  -----"

function set_fntList() {
	let t0 = performance.now()
	// set once
	if (isFF && fntList.length == 0) {
		let fntListWindows = [
			'Aharoni Bold','Aldhabi','AlternateGothic2 BT','Andalus','Angsana New','Angsana New Bold','Angsana New Bold Italic','Angsana New Italic','AngsanaUPC','AngsanaUPC Bold','AngsanaUPC Bold Italic','AngsanaUPC Italic','Aparajita','Aparajita Bold','Aparajita Bold Italic','Aparajita Italic','Arabic Typesetting','Arial','Arial Black','Arial Bold','Arial Bold Italic','Arial Italic','Arial Narrow','Arial Narrow Bold','Arial Narrow Bold Italic','Arial Narrow Italic','Arial Nova','Arial Nova Bold','Arial Nova Bold Italic','Arial Nova Cond','Arial Nova Cond Bold','Arial Nova Cond Bold Italic','Arial Nova Cond Italic','Arial Nova Cond Light','Arial Nova Cond Light Italic','Arial Nova Italic','Arial Nova Light','Arial Nova Light Italic','Arial Unicode MS','BIZ UDGothic','BIZ UDGothic Bold','BIZ UDMincho','BIZ UDMincho Medium','BIZ UDPGothic','BIZ UDPGothic Bold','BIZ UDPMincho','BIZ UDPMincho Medium','Bahnschrift','Bahnschrift Light','Bahnschrift SemiBold','Bahnschrift SemiLight','Batang','BatangChe','Browallia New','Browallia New Bold','Browallia New Bold Italic','Browallia New Italic','BrowalliaUPC','BrowalliaUPC Bold','BrowalliaUPC Bold Italic','BrowalliaUPC Italic','Calibri','Calibri Bold','Calibri Bold Italic','Calibri Italic','Calibri Light','Calibri Light Italic','Cambria','Cambria Bold','Cambria Bold Italic','Cambria Italic','Cambria Math','Candara','Candara Bold','Candara Bold Italic','Candara Italic','Candara Light','Candara Light Italic','Comic Sans MS','Comic Sans MS Bold','Comic Sans MS Bold Italic','Comic Sans MS Italic','Consolas','Consolas Bold','Consolas Bold Italic','Consolas Italic','Constantia','Constantia Bold','Constantia Bold Italic','Constantia Italic','Corbel','Corbel Bold','Corbel Bold Italic','Corbel Italic','Corbel Light','Corbel Light Italic','Cordia New','Cordia New Bold','Cordia New Bold Italic','Cordia New Italic','CordiaUPC','CordiaUPC Bold','CordiaUPC Bold Italic','CordiaUPC Italic','Courier','Courier New','Courier New Bold','Courier New Bold Italic','Courier New Italic','DFKai-SB','DaunPenh','David','David Bold','DengXian','DengXian Bold','DengXian Light','DilleniaUPC','DilleniaUPC Bold','DilleniaUPC Bold Italic','DilleniaUPC Italic','DokChampa','Dotum','DotumChe','Ebrima','Ebrima Bold','EmojiOne Mozilla','Estrangelo Edessa','EucrosiaUPC','EucrosiaUPC Bold','EucrosiaUPC Bold Italic','EucrosiaUPC Italic','Euphemia','FangSong','FrankRuehl','Franklin Gothic Medium','Franklin Gothic Medium Italic','FreesiaUPC','FreesiaUPC Bold','FreesiaUPC Bold Italic','FreesiaUPC Italic','Gabriola','Gadugi','Gadugi Bold','Gautami','Gautami Bold','Georgia','Georgia Bold','Georgia Bold Italic','Georgia Italic','Georgia Pro','Georgia Pro Black','Georgia Pro Black Italic','Georgia Pro Bold','Georgia Pro Bold Italic','Georgia Pro Cond','Georgia Pro Cond Black','Georgia Pro Cond Black Italic','Georgia Pro Cond Bold','Georgia Pro Cond Bold Italic','Georgia Pro Cond Italic','Georgia Pro Cond Light','Georgia Pro Cond Light Italic','Georgia Pro Cond Semibold','Georgia Pro Cond Semibold Italic','Georgia Pro Italic','Georgia Pro Light','Georgia Pro Light Italic','Georgia Pro Semibold','Georgia Pro Semibold Italic','Gill Sans Nova','Gill Sans Nova Bold','Gill Sans Nova Bold Italic','Gill Sans Nova Cond','Gill Sans Nova Cond Bold','Gill Sans Nova Cond Bold Italic','Gill Sans Nova Cond Italic','Gill Sans Nova Cond Lt','Gill Sans Nova Cond Lt Italic','Gill Sans Nova Cond Ultra Bold','Gill Sans Nova Cond XBd','Gill Sans Nova Cond XBd Italic','Gill Sans Nova Italic','Gill Sans Nova Light','Gill Sans Nova Light Italic','Gill Sans Nova Ultra Bold','Gisha','Gisha Bold','Gulim','GulimChe','Gungsuh','GungsuhChe','Helvetica','HoloLens MDL2 Assets','Impact','Ink Free','IrisUPC','IrisUPC Bold','IrisUPC Bold Italic','IrisUPC Italic','Iskoola Pota','Iskoola Pota Bold','JasmineUPC','JasmineUPC Bold','JasmineUPC Bold Italic','JasmineUPC Italic','Javanese Text','KaiTi','Kalinga','Kalinga Bold','Kartika','Kartika Bold','Khmer UI','Khmer UI Bold','KodchiangUPC','KodchiangUPC Bold','KodchiangUPC Bold Italic','KodchiangUPC Italic','Kokila','Kokila Bold','Kokila Bold Italic','Kokila Italic','Lao UI','Lao UI Bold','Latha','Latha Bold','Leelawadee','Leelawadee Bold','Leelawadee UI','Leelawadee UI Bold','Leelawadee UI Leelawadee UI','Leelawadee UI Semilight','Levenim MT','Levenim MT Bold','LilyUPC','LilyUPC Bold','LilyUPC Bold Italic','LilyUPC Italic','Lucida Console','Lucida Sans Unicode','MS Gothic','MS Mincho','MS PGothic','MS PMincho','MS Sans Serif','MS Serif','MS UI Gothic','MV Boli','Malgun Gothic','Malgun Gothic Bold','Malgun Gothic Semilight','Mangal','Mangal Bold','Marlett','Meiryo','Meiryo Bold','Meiryo Bold Italic','Meiryo Italic','Meiryo UI','Meiryo UI Bold','Meiryo UI Bold Italic','Meiryo UI Italic','Microsoft Himalaya','Microsoft JhengHei','Microsoft JhengHei Bold','Microsoft JhengHei Light','Microsoft JhengHei Regular','Microsoft JhengHei UI','Microsoft JhengHei UI Bold','Microsoft JhengHei UI Light','Microsoft JhengHei UI Regular','Microsoft New Tai Lue','Microsoft New Tai Lue Bold','Microsoft PhagsPa','Microsoft PhagsPa Bold','Microsoft Sans Serif','Microsoft Tai Le','Microsoft Tai Le Bold','Microsoft Uighur','Microsoft Uighur Bold','Microsoft YaHei','Microsoft YaHei Bold','Microsoft YaHei Light','Microsoft YaHei UI','Microsoft YaHei UI Bold','Microsoft YaHei UI Light','Microsoft Yi Baiti','MingLiU','MingLiU-ExtB','MingLiU_HKSCS','MingLiU_HKSCS-ExtB','Miriam','Miriam Fixed','Mongolian Baiti','MoolBoran','Myanmar Text','Myanmar Text Bold','NSimSun','Narkisim','Neue Haas Grotesk Text Pro','Neue Haas Grotesk Text Pro Bold','Neue Haas Grotesk Text Pro Bold Italic','Neue Haas Grotesk Text Pro Italic','Neue Haas Grotesk Text Pro Medium','Neue Haas Grotesk Text Pro Medium Italic','Nirmala UI','Nirmala UI Bold','Nirmala UI Semilight','Noto Sans Buginese','Noto Sans Khmer','Noto Sans Lao','Noto Sans Myanmar','Noto Sans Yi','Nyala','PMingLiU','PMingLiU-ExtB','Palatino Linotype','Palatino Linotype Bold','Palatino Linotype Bold Italic','Palatino Linotype Italic','Plantagenet Cherokee','Raavi','Raavi Bold','Rockwell Nova','Rockwell Nova Bold','Rockwell Nova Bold Italic','Rockwell Nova Cond','Rockwell Nova Cond Bold','Rockwell Nova Cond Bold Italic','Rockwell Nova Cond Italic','Rockwell Nova Cond Light','Rockwell Nova Cond Light Italic','Rockwell Nova Extra Bold','Rockwell Nova Extra Bold Italic','Rockwell Nova Italic','Rockwell Nova Light Italic','Rockwell Nova Rockwell','Rod','Roman','Sakkal Majalla','Sakkal Majalla Bold','Sanskrit Text','Segoe MDL2 Assets','Segoe Print','Segoe Print Bold','Segoe Pseudo','Segoe Script','Segoe Script Bold','Segoe UI','Segoe UI Black','Segoe UI Black Italic','Segoe UI Bold','Segoe UI Bold Italic','Segoe UI Emoji','Segoe UI Historic','Segoe UI Italic','Segoe UI Light','Segoe UI Light Italic','Segoe UI Semibold','Segoe UI Semibold Italic','Segoe UI Semilight','Segoe UI Semilight Italic','Segoe UI Symbol','Shonar Bangla','Shonar Bangla Bold','Shruti','Shruti Bold','SimHei','SimSun','SimSun-ExtB','Simplified Arabic','Simplified Arabic Bold','Simplified Arabic Fixed','Sitka Banner','Sitka Banner Bold','Sitka Banner Bold Italic','Sitka Banner Italic','Sitka Display','Sitka Display Bold','Sitka Display Bold Italic','Sitka Display Italic','Sitka Heading','Sitka Heading Bold','Sitka Heading Bold Italic','Sitka Heading Italic','Sitka Small','Sitka Small Bold','Sitka Small Bold Italic','Sitka Small Italic','Sitka Subheading','Sitka Subheading Bold','Sitka Subheading Bold Italic','Sitka Subheading Italic','Sitka Text','Sitka Text Bold','Sitka Text Bold Italic','Sitka Text Italic','Small Fonts','Sylfaen','Symbol','Tahoma','Tahoma Bold','Times','Times New Roman','Times New Roman Bold','Times New Roman Bold Italic','Times New Roman Italic','Traditional Arabic','Traditional Arabic Bold','Trebuchet MS','Trebuchet MS Bold','Trebuchet MS Bold Italic','Trebuchet MS Italic','Tunga','Tunga Bold','Twemoji Mozilla','UD Digi Kyokasho','UD Digi Kyokasho N-B','UD Digi Kyokasho N-R','UD Digi Kyokasho NK-B','UD Digi Kyokasho NK-R','UD Digi Kyokasho NP-B','UD Digi Kyokasho NP-R','Urdu Typesetting','Urdu Typesetting Bold','Utsaah','Utsaah Bold','Utsaah Bold Italic','Utsaah Italic','Vani','Vani Bold','Verdana','Verdana Bold','Verdana Bold Italic','Verdana Italic','Verdana Pro','Verdana Pro Black','Verdana Pro Black Italic','Verdana Pro Bold','Verdana Pro Bold Italic','Verdana Pro Cond','Verdana Pro Cond Black','Verdana Pro Cond Black Italic','Verdana Pro Cond Bold','Verdana Pro Cond Bold Italic','Verdana Pro Cond Italic','Verdana Pro Cond Light','Verdana Pro Cond Light Italic','Verdana Pro Cond SemiBold','Verdana Pro Cond SemiBold Italic','Verdana Pro Italic','Verdana Pro Light','Verdana Pro Light Italic','Verdana Pro SemiBold','Verdana Pro SemiBold Italic','Vijaya','Vijaya Bold','Vrinda','Vrinda Bold','Webdings','Wingdings','Yu Gothic','Yu Gothic Bold','Yu Gothic Light','Yu Gothic Medium','Yu Gothic Regular','Yu Gothic UI','Yu Gothic UI Bold','Yu Gothic UI Light','Yu Gothic UI Regular','Yu Gothic UI Semibold','Yu Gothic UI Semilight','Yu Mincho','Yu Mincho Demibold','Yu Mincho Light','Yu Mincho Regular','宋体','微软雅黑','新細明體','細明體','굴림','굴림체','바탕','ＭＳ ゴシック','ＭＳ 明朝','ＭＳ Ｐゴシック','ＭＳ Ｐ明朝',
		]
		let fntListMac = [
			'.Aqua Kana','.Aqua Kana Bold','.Helvetica LT MM','.Helvetica Neue Desk UI','.Helvetica Neue Desk UI Bold','.Helvetica Neue Desk UI Bold Italic','.Helvetica Neue Desk UI Italic','.Helvetica Neue DeskInterface','.Times LT MM','Al Bayan','Al Bayan Bold','Al Bayan Plain','Al Nile','Al Nile Bold','Al Tarikh','Al Tarikh Regular','American Typewriter','American Typewriter Bold','American Typewriter Condensed','American Typewriter Condensed Bold','American Typewriter Condensed Light','American Typewriter Light','American Typewriter Semibold','Andale Mono','Apple Braille','Apple Braille Outline 6 Dot','Apple Braille Outline 8 Dot','Apple Braille Pinpoint 6 Dot','Apple Braille Pinpoint 8 Dot','Apple Chancery','Apple Color Emoji','Apple LiGothic Medium','Apple LiSung Light','Apple SD Gothic Neo','Apple SD Gothic Neo Bold','Apple SD Gothic Neo Heavy','Apple SD Gothic Neo Light','Apple SD Gothic Neo Medium','Apple SD Gothic Neo Regular','Apple SD Gothic Neo SemiBold','Apple SD Gothic Neo Thin','Apple SD Gothic Neo UltraLight','Apple SD GothicNeo ExtraBold','Apple Symbols','AppleGothic','AppleGothic Regular','AppleMyungjo','AppleMyungjo Regular','Arial','Arial Black','Arial Bold','Arial Bold Italic','Arial Hebrew','Arial Hebrew Bold','Arial Hebrew Light','Arial Hebrew Scholar','Arial Hebrew Scholar Bold','Arial Hebrew Scholar Light','Arial Italic','Arial Narrow','Arial Narrow Bold','Arial Narrow Bold Italic','Arial Narrow Italic','Arial Rounded MT Bold','Arial Unicode MS','Athelas Bold','Athelas Bold Italic','Athelas Italic','Athelas Regular','Avenir','Avenir Black','Avenir Black Oblique','Avenir Book','Avenir Book Oblique','Avenir Heavy','Avenir Heavy Oblique','Avenir Light','Avenir Light Oblique','Avenir Medium','Avenir Medium Oblique','Avenir Next','Avenir Next Bold','Avenir Next Bold Italic','Avenir Next Condensed Bold','Avenir Next Condensed Bold Italic','Avenir Next Condensed Demi Bold','Avenir Next Condensed Demi Bold Italic','Avenir Next Condensed Heavy','Avenir Next Condensed Heavy Italic','Avenir Next Condensed Italic','Avenir Next Condensed Medium','Avenir Next Condensed Medium Italic','Avenir Next Condensed Regular','Avenir Next Condensed Ultra Light','Avenir Next Condensed Ultra Light Italic','Avenir Next Demi Bold','Avenir Next Demi Bold Italic','Avenir Next Heavy','Avenir Next Heavy Italic','Avenir Next Italic','Avenir Next Medium','Avenir Next Medium Italic','Avenir Next Regular','Avenir Next Ultra Light','Avenir Next Ultra Light Italic','Avenir Oblique','Avenir Roman','Ayuthaya','Baghdad','Baghdad Regular','Bangla MN','Bangla MN Bold','Bangla Sangam MN','Bangla Sangam MN Bold','Baoli SC Regular','Baoli TC Regular','Baskerville','Baskerville Bold','Baskerville Bold Italic','Baskerville Italic','Baskerville SemiBold','Baskerville SemiBold Italic','Beirut','Beirut Regular','BiauKai','Big Caslon Medium','Bodoni 72','Bodoni 72 Bold','Bodoni 72 Book','Bodoni 72 Book Italic','Bodoni 72 Oldstyle','Bodoni 72 Oldstyle Bold','Bodoni 72 Oldstyle Book','Bodoni 72 Oldstyle Book Italic','Bodoni 72 Smallcaps','Bodoni 72 Smallcaps Book','Bodoni Ornaments','Bradley Hand','Bradley Hand Bold','Brush Script MT','Brush Script MT Italic','Chalkboard','Chalkboard Bold','Chalkboard SE','Chalkboard SE Bold','Chalkboard SE Light','Chalkboard SE Regular','Chalkduster','Charcoal CY','Charter','Charter Black','Charter Black Italic','Charter Bold','Charter Bold Italic','Charter Italic','Charter Roman','Cochin','Cochin Bold','Cochin Bold Italic','Cochin Italic','Comic Sans MS','Comic Sans MS Bold','Copperplate','Copperplate Bold','Copperplate Light','Corsiva Hebrew','Corsiva Hebrew Bold','Courier','Courier Bold','Courier Bold Oblique','Courier New','Courier New Bold','Courier New Bold Italic','Courier New Italic','Courier Oblique','DIN Alternate','DIN Alternate Bold','DIN Condensed','DIN Condensed Bold','Damascus','Damascus Bold','Damascus Light','Damascus Medium','Damascus Regular','Damascus Semi Bold','DecoType Naskh','DecoType Naskh Regular','Devanagari MT','Devanagari MT Bold','Devanagari Sangam MN','Devanagari Sangam MN Bold','Didot','Didot Bold','Didot Italic','Diwan Kufi','Diwan Kufi Regular','Diwan Mishafi','Diwan Thuluth','Diwan Thuluth Regular','EmojiOne Mozilla','Euphemia UCAS','Euphemia UCAS Bold','Euphemia UCAS Italic','Farah','Farah Regular','Farisi','Farisi Regular','Futura','Futura Bold','Futura Condensed ExtraBold','Futura Condensed Medium','Futura Medium','Futura Medium Italic','GB18030 Bitmap','Geeza Pro','Geeza Pro Bold','Geeza Pro Regular','Geneva','Geneva CY','Georgia','Georgia Bold','Georgia Bold Italic','Georgia Italic','Gill Sans','Gill Sans Bold','Gill Sans Bold Italic','Gill Sans Italic','Gill Sans Light','Gill Sans Light Italic','Gill Sans SemiBold','Gill Sans SemiBold Italic','Gill Sans UltraBold','Gujarati MT','Gujarati MT Bold','Gujarati Sangam MN','Gujarati Sangam MN Bold','GungSeo Regular','Gurmukhi MN','Gurmukhi MN Bold','Gurmukhi MT','Gurmukhi Sangam MN','Gurmukhi Sangam MN Bold','Hannotate SC Bold','Hannotate SC Regular','Hannotate TC Bold','Hannotate TC Regular','HanziPen SC Bold','HanziPen SC Regular','HanziPen TC Bold','HanziPen TC Regular','HeadLineA Regular','Hei Regular','Heiti SC','Heiti SC Light','Heiti SC Medium','Heiti TC','Heiti TC Light','Heiti TC Medium','Helvetica','Helvetica Bold','Helvetica Bold Oblique','Helvetica CY Bold','Helvetica CY BoldOblique','Helvetica CY Oblique','Helvetica CY Plain','Helvetica Light','Helvetica Light Oblique','Helvetica Neue','Helvetica Neue Bold','Helvetica Neue Bold Italic','Helvetica Neue Condensed Black','Helvetica Neue Condensed Bold','Helvetica Neue Italic','Helvetica Neue Light','Helvetica Neue Light Italic','Helvetica Neue Medium','Helvetica Neue Medium Italic','Helvetica Neue Thin','Helvetica Neue Thin Italic','Helvetica Neue UltraLight','Helvetica Neue UltraLight Italic','Helvetica Oblique','Herculanum','Hiragino Kaku Gothic Pro W3','Hiragino Kaku Gothic Pro W6','Hiragino Kaku Gothic ProN','Hiragino Kaku Gothic ProN W3','Hiragino Kaku Gothic ProN W6','Hiragino Kaku Gothic Std W8','Hiragino Kaku Gothic StdN W8','Hiragino Maru Gothic Pro W4','Hiragino Maru Gothic ProN','Hiragino Maru Gothic ProN W4','Hiragino Mincho Pro W3','Hiragino Mincho Pro W6','Hiragino Mincho ProN','Hiragino Mincho ProN W3','Hiragino Mincho ProN W6','Hiragino Sans','Hiragino Sans CNS W3','Hiragino Sans CNS W6','Hiragino Sans GB','Hiragino Sans GB W3','Hiragino Sans GB W6','Hiragino Sans W0','Hiragino Sans W1','Hiragino Sans W2','Hiragino Sans W3','Hiragino Sans W4','Hiragino Sans W5','Hiragino Sans W6','Hiragino Sans W7','Hiragino Sans W8','Hiragino Sans W9','Hoefler Text','Hoefler Text Black','Hoefler Text Black Italic','Hoefler Text Italic','Hoefler Text Ornaments','ITF Devanagari','ITF Devanagari Bold','ITF Devanagari Book','ITF Devanagari Demi','ITF Devanagari Light','ITF Devanagari Marathi','ITF Devanagari Marathi Bold','ITF Devanagari Marathi Book','ITF Devanagari Marathi Demi','ITF Devanagari Marathi Light','ITF Devanagari Marathi Medium','ITF Devanagari Medium','Impact','InaiMathi','InaiMathi Bold','Iowan Old Style Black','Iowan Old Style Black Italic','Iowan Old Style Bold','Iowan Old Style Bold Italic','Iowan Old Style Italic','Iowan Old Style Roman','Iowan Old Style Titling','Kai Regular','Kailasa','Kailasa Bold','Kailasa Regular','Kaiti SC Black','Kaiti SC Bold','Kaiti SC Regular','Kaiti TC Black','Kaiti TC Bold','Kaiti TC Regular','Kannada MN','Kannada MN Bold','Kannada Sangam MN','Kannada Sangam MN Bold','Kefa','Kefa Bold','Kefa Regular','Keyboard','Khmer MN','Khmer MN Bold','Khmer Sangam MN','Klee Demibold','Klee Medium','Kohinoor Bangla','Kohinoor Bangla Bold','Kohinoor Bangla Light','Kohinoor Bangla Medium','Kohinoor Bangla Semibold','Kohinoor Devanagari','Kohinoor Devanagari Bold','Kohinoor Devanagari Light','Kohinoor Devanagari Medium','Kohinoor Devanagari Regular','Kohinoor Devanagari Semibold','Kohinoor Telugu','Kohinoor Telugu Bold','Kohinoor Telugu Light','Kohinoor Telugu Medium','Kohinoor Telugu Semibold','Kokonor','Kokonor Regular','Krungthep','KufiStandardGK','KufiStandardGK Regular','Lantinghei SC Demibold','Lantinghei SC Extralight','Lantinghei SC Heavy','Lantinghei TC Demibold','Lantinghei TC Extralight','Lantinghei TC Heavy','Lao MN','Lao MN Bold','Lao Sangam MN','LastResort','LiHei Pro','LiSong Pro','Libian SC Regular','Libian TC Regular','LingWai SC Medium','LingWai TC Medium','Lucida Grande','Lucida Grande Bold','Luminari','Malayalam MN','Malayalam MN Bold','Malayalam Sangam MN','Malayalam Sangam MN Bold','Marion Bold','Marion Italic','Marion Regular','Marker Felt','Marker Felt Thin','Marker Felt Wide','Menlo','Menlo Bold','Menlo Bold Italic','Menlo Italic','Menlo Regular','Microsoft Sans Serif','Mishafi','Mishafi Gold','Mishafi Gold Regular','Mishafi Regular','Monaco','Mshtakan','Mshtakan Bold','Mshtakan BoldOblique','Mshtakan Oblique','Muna','Muna Black','Muna Bold','Muna Regular','Myanmar MN','Myanmar MN Bold','Myanmar Sangam MN','Myanmar Sangam MN Bold','Myriad Arabic','Myriad Arabic Black','Myriad Arabic Black Italic','Myriad Arabic Bold','Myriad Arabic Bold Italic','Myriad Arabic Italic','Myriad Arabic Light','Myriad Arabic Light Italic','Myriad Arabic Semibold','Myriad Arabic Semibold Italic','Nadeem','Nadeem Regular','Nanum Brush Script','Nanum Pen Script','NanumGothic','NanumGothic Bold','NanumGothic ExtraBold','NanumMyeongjo','NanumMyeongjo Bold','NanumMyeongjo ExtraBold','New Peninim MT','New Peninim MT Bold','New Peninim MT Bold Inclined','New Peninim MT Inclined','Noteworthy','Noteworthy Bold','Noteworthy Light','Noto Nastaliq Urdu','Noto Sans Armenian','Noto Sans Bengali','Noto Sans Buginese','Noto Sans Canadian Aboriginal','Noto Sans Cherokee','Noto Sans Devanagari','Noto Sans Ethiopic','Noto Sans Gujarati','Noto Sans Gurmukhi','Noto Sans Kannada','Noto Sans Khmer','Noto Sans Lao','Noto Sans Malayalam','Noto Sans Mongolian','Noto Sans Myanmar','Noto Sans Oriya','Noto Sans Sinhala','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Thaana','Noto Sans Tibetan','Noto Sans Yi','Optima','Optima Bold','Optima Bold Italic','Optima ExtraBlack','Optima Italic','Optima Regular','Oriya MN','Oriya MN Bold','Oriya Sangam MN','Oriya Sangam MN Bold','Osaka','Osaka-Mono','PCMyungjo Regular','PT Mono','PT Mono Bold','PT Sans','PT Sans Bold','PT Sans Bold Italic','PT Sans Caption','PT Sans Caption Bold','PT Sans Italic','PT Sans Narrow','PT Sans Narrow Bold','PT Serif','PT Serif Bold','PT Serif Bold Italic','PT Serif Caption','PT Serif Caption Italic','PT Serif Italic','Palatino','Palatino Bold','Palatino Bold Italic','Palatino Italic','Papyrus','Papyrus Condensed','Phosphate','Phosphate Inline','Phosphate Solid','PilGi Regular','PingFang HK','PingFang HK Light','PingFang HK Medium','PingFang HK Regular','PingFang HK Semibold','PingFang HK Thin','PingFang HK Ultralight','PingFang SC','PingFang SC Light','PingFang SC Medium','PingFang SC Regular','PingFang SC Semibold','PingFang SC Thin','PingFang SC Ultralight','PingFang TC','PingFang TC Light','PingFang TC Medium','PingFang TC Regular','PingFang TC Semibold','PingFang TC Thin','PingFang TC Ultralight','Plantagenet Cherokee','Raanana','Raanana Bold','Rockwell','Rockwell Bold','Rockwell Bold Italic','Rockwell Italic','STFangsong','STHeiti','STIX Math','STIX Two Math','STIX Two Text','STIX Two Text Bold','STIX Two Text Bold Italic','STIX Two Text Italic','STIXGeneral','STIXGeneral-Bold','STIXGeneral-BoldItalic','STIXGeneral-Italic','STIXGeneral-Regular','STIXIntegralsD','STIXIntegralsD-Bold','STIXIntegralsD-Regular','STIXIntegralsSm','STIXIntegralsSm-Bold','STIXIntegralsSm-Regular','STIXIntegralsUp','STIXIntegralsUp-Bold','STIXIntegralsUp-Regular','STIXIntegralsUpD','STIXIntegralsUpD-Bold','STIXIntegralsUpD-Regular','STIXIntegralsUpSm','STIXIntegralsUpSm-Bold','STIXIntegralsUpSm-Regular','STIXNonUnicode','STIXNonUnicode-Bold','STIXNonUnicode-BoldItalic','STIXNonUnicode-Italic','STIXNonUnicode-Regular','STIXSizeFiveSym','STIXSizeFiveSym-Regular','STIXSizeFourSym','STIXSizeFourSym-Bold','STIXSizeFourSym-Regular','STIXSizeOneSym','STIXSizeOneSym-Bold','STIXSizeOneSym-Regular','STIXSizeThreeSym','STIXSizeThreeSym-Bold','STIXSizeThreeSym-Regular','STIXSizeTwoSym','STIXSizeTwoSym-Bold','STIXSizeTwoSym-Regular','STIXVariants','STIXVariants-Bold','STIXVariants-Regular','STKaiti','STSong','STXihei','Sana','Sana Regular','Sathu','Savoye LET','Savoye LET Plain CC.:1.0','Savoye LET Plain:1.0','Seravek','Seravek Bold','Seravek Bold Italic','Seravek ExtraLight','Seravek ExtraLight Italic','Seravek Italic','Seravek Light','Seravek Light Italic','Seravek Medium','Seravek Medium Italic','Shree Devanagari 714','Shree Devanagari 714 Bold','Shree Devanagari 714 Bold Italic','Shree Devanagari 714 Italic','SignPainter','SignPainter-HouseScript','SignPainter-HouseScript Semibold','Silom','Sinhala MN','Sinhala MN Bold','Sinhala Sangam MN','Sinhala Sangam MN Bold','Skia','Skia Black','Skia Black Condensed','Skia Black Extended','Skia Bold','Skia Condensed','Skia Extended','Skia Light','Skia Light Condensed','Skia Light Extended','Skia Regular','Snell Roundhand','Snell Roundhand Black','Snell Roundhand Bold','Songti SC','Songti SC Black','Songti SC Bold','Songti SC Light','Songti SC Regular','Songti TC','Songti TC Bold','Songti TC Light','Songti TC Regular','Sukhumvit Set','Sukhumvit Set Bold','Sukhumvit Set Light','Sukhumvit Set Medium','Sukhumvit Set Semi Bold','Sukhumvit Set Text','Sukhumvit Set Thin','Superclarendon Black','Superclarendon Black Italic','Superclarendon Bold','Superclarendon Bold Italic','Superclarendon Italic','Superclarendon Light','Superclarendon Light Italic','Superclarendon Regular','Symbol','System Font Bold','System Font Regular','Tahoma','Tahoma Bold','Tahoma Negreta','Tamil MN','Tamil MN Bold','Tamil Sangam MN','Tamil Sangam MN Bold','Telugu MN','Telugu MN Bold','Telugu Sangam MN','Telugu Sangam MN Bold','Thonburi','Thonburi Bold','Thonburi Light','Times','Times Bold','Times Bold Italic','Times Italic','Times New Roman','Times New Roman Bold','Times New Roman Bold Italic','Times New Roman Italic','Times Roman','Toppan Bunkyu Gothic Demibold','Toppan Bunkyu Gothic Regular','Toppan Bunkyu Midashi Gothic Extrabold','Toppan Bunkyu Midashi Mincho Extrabold','Toppan Bunkyu Mincho Regular','Trattatello','Trebuchet MS','Trebuchet MS Bold','Trebuchet MS Bold Italic','Trebuchet MS Italic','Tsukushi A Round Gothic Bold','Tsukushi A Round Gothic Regular','Tsukushi B Round Gothic Bold','Tsukushi B Round Gothic Regular','Twemoji Mozilla','Verdana','Verdana Bold','Verdana Bold Italic','Verdana Italic','Waseem','Waseem Light','Waseem Regular','Wawati SC Regular','Wawati TC Regular','Webdings','Weibei SC Bold','Weibei TC Bold','Wingdings','Wingdings 2','Wingdings 3','Xingkai SC Bold','Xingkai SC Light','Xingkai TC Bold','Xingkai TC Light','YuGothic Bold','YuGothic Medium','YuKyokasho Bold','YuKyokasho Medium','YuKyokasho Yoko Bold','YuKyokasho Yoko Medium','YuMincho +36p Kana Demibold','YuMincho +36p Kana Extrabold','YuMincho +36p Kana Medium','YuMincho Demibold','YuMincho Extrabold','YuMincho Medium','Yuanti SC Bold','Yuanti SC Light','Yuanti SC Regular','Yuanti TC Bold','Yuanti TC Light','Yuanti TC Regular','Yuppy SC Regular','Yuppy TC Regular','Zapf Dingbats','Zapfino',
		]
		let fntListLinux = [
			'AR PL UKai CN','AR PL UKai HK','AR PL UKai TW','AR PL UKai TW MBE','AR PL UMing CN','AR PL UMing HK','AR PL UMing TW','AR PL UMing TW MBE','Abyssinica SIL','Aharoni CLM','AlArabiya','AlBattar','AlHor','AlManzomah','AlYarmook','Amiri','Amiri Quran','Amiri Quran Colored','Ani','AnjaliOldLipi','Arab','Arial','Arimo','Bitstream Charter','C059','Caladea','Caladings CLM','Cantarell','Cantarell Extra Bold','Cantarell Light','Cantarell Thin','Carlito','Century Schoolbook L','Chandas','Chilanka','Comfortaa','Comfortaa Light','Cortoba','Courier','Courier 10 Pitch','Courier New','Cousine','D050000L','David CLM','DejaVu Math TeX Gyre','DejaVu Sans','DejaVu Sans Condensed','DejaVu Sans Light','DejaVu Sans Mono','DejaVu Serif','DejaVu Serif Condensed','Dimnah','Dingbats','Droid Arabic Kufi','Droid Sans','Droid Sans Armenian','Droid Sans Devanagari','Droid Sans Ethiopic','Droid Sans Fallback','Droid Sans Georgian','Droid Sans Hebrew','Droid Sans Japanese','Droid Sans Tamil','Droid Sans Thai','Drugulin CLM','Dyuthi','Electron','Ellinia CLM','EmojiOne Mozilla','Ezra SIL','Ezra SIL SR','Frank Ruehl CLM','FreeMono','FreeSans','FreeSerif','Furat','Gargi','Garuda','Gayathri','Gayathri Thin','Georgia','Granada','Graph','Gubbi','Hadasim CLM','Hani','Haramain','Homa','Hor','Jamrul','Japan','Jet','Jomolhari','KacstArt','KacstBook','KacstDecorative','KacstDigital','KacstFarsi','KacstLetter','KacstNaskh','KacstOffice','KacstOne','KacstPen','KacstPoster','KacstQurn','KacstScreen','KacstTitle','KacstTitleL','Kalapi','Kalimati','Karumbi','Kayrawan','Keraleeyam','Keter YG','Khalid','Khmer OS','Khmer OS Battambang','Khmer OS Bokor','Khmer OS Content','Khmer OS Fasthand','Khmer OS Freehand','Khmer OS Metal Chrieng','Khmer OS Muol','Khmer OS Muol Light','Khmer OS Muol Pali','Khmer OS Siemreap','Khmer OS System','Kinnari','LKLUG','Laksaman','Liberation Mono','Liberation Sans','Liberation Sans Narrow','Liberation Serif','Likhan','Lohit Assamese','Lohit Bengali','Lohit Devanagari','Lohit Gujarati','Lohit Gurmukhi','Lohit Kannada','Lohit Malayalam','Lohit Odia','Lohit Tamil','Lohit Tamil Classical','Lohit Telugu','Loma','Manjari','Manjari Thin','Mashq','Mashq-Bold','Meera','Metal','Mingzat','Miriam CLM','Miriam Mono CLM','Mitra Mono','Montserrat','Montserrat Black','Montserrat ExtraBold','Montserrat ExtraLight','Montserrat Light','Montserrat Medium','Montserrat SemiBold','Montserrat Thin','Mukti Narrow','Mukti Narrow Bold','Nachlieli CLM','Nada','Nagham','Nakula','Navilu','Nazli','Nice','Nimbus Mono L','Nimbus Mono PS','Nimbus Roman','Nimbus Roman No9 L','Nimbus Sans','Nimbus Sans L','Nimbus Sans Narrow','Norasi','Noto Color Emoji','Noto Mono','Noto Naskh Arabic','Noto Sans Armenian','Noto Sans Bengali','Noto Sans Buginese','Noto Sans CJK HK','Noto Sans CJK HK Black','Noto Sans CJK HK DemiLight','Noto Sans CJK HK Light','Noto Sans CJK HK Medium','Noto Sans CJK HK Thin','Noto Sans CJK JP','Noto Sans CJK JP Black','Noto Sans CJK JP DemiLight','Noto Sans CJK JP Light','Noto Sans CJK JP Medium','Noto Sans CJK JP Thin','Noto Sans CJK KR','Noto Sans CJK KR Black','Noto Sans CJK KR DemiLight','Noto Sans CJK KR Light','Noto Sans CJK KR Medium','Noto Sans CJK KR Thin','Noto Sans CJK SC','Noto Sans CJK SC Black','Noto Sans CJK SC DemiLight','Noto Sans CJK SC Light','Noto Sans CJK SC Medium','Noto Sans CJK SC Thin','Noto Sans CJK TC','Noto Sans CJK TC Black','Noto Sans CJK TC DemiLight','Noto Sans CJK TC Light','Noto Sans CJK TC Medium','Noto Sans CJK TC Thin','Noto Sans Canadian Aboriginal','Noto Sans Cherokee','Noto Sans Devanagari','Noto Sans Ethiopic','Noto Sans Georgian','Noto Sans Gujarati','Noto Sans Gurmukhi','Noto Sans Hebrew','Noto Sans JP Regular','Noto Sans KR Regular','Noto Sans Kannada','Noto Sans Khmer','Noto Sans Lao','Noto Sans Malayalam','Noto Sans Mongolian','Noto Sans Mono CJK HK','Noto Sans Mono CJK JP','Noto Sans Mono CJK KR','Noto Sans Mono CJK SC','Noto Sans Mono CJK TC','Noto Sans Myanmar','Noto Sans Oriya','Noto Sans SC Regular','Noto Sans Sinhala','Noto Sans TC Regular','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Thaana','Noto Sans Thai','Noto Sans Tibetan','Noto Sans Yi','Noto Serif Armenian','Noto Serif CJK JP','Noto Serif CJK JP Black','Noto Serif CJK JP ExtraLight','Noto Serif CJK JP Light','Noto Serif CJK JP Medium','Noto Serif CJK JP SemiBold','Noto Serif CJK KR','Noto Serif CJK KR Black','Noto Serif CJK KR ExtraLight','Noto Serif CJK KR Light','Noto Serif CJK KR Medium','Noto Serif CJK KR SemiBold','Noto Serif CJK SC','Noto Serif CJK SC Black','Noto Serif CJK SC ExtraLight','Noto Serif CJK SC Light','Noto Serif CJK SC Medium','Noto Serif CJK SC SemiBold','Noto Serif CJK TC','Noto Serif CJK TC Black','Noto Serif CJK TC ExtraLight','Noto Serif CJK TC Light','Noto Serif CJK TC Medium','Noto Serif CJK TC SemiBold','Noto Serif Khmer','Noto Serif Lao','Noto Serif Thai','Nuosu SIL','OpenSymbol','Ostorah','Ouhod','Ouhod-Bold','P052','PT Sans','PT Sans Narrow','Padauk','Padauk Book','Pagul','PakType Naskh Basic','Petra','Phetsarath OT','Pothana2000','Purisa','Rachana','RaghuMalayalamSans','Rasa','Rasa Light','Rasa Medium','Rasa SemiBold','Rasheeq','Rasheeq-Bold','Rehan','Rekha','STIX','STIX Two Math','STIX Two Text','Saab','Sahadeva','Salem','Samanata','Samyak Devanagari','Samyak Gujarati','Samyak Malayalam','Samyak Tamil','Sarai','Sawasdee','Scheherazade','Shado','Sharjah','Shofar','Simple CLM','Sindbad','Source Code Pro','Source Code Pro Black','Source Code Pro ExtraLight','Source Code Pro Light','Source Code Pro Medium','Source Code Pro Semibold','Stam Ashkenaz CLM','Stam Sefarad CLM','Standard Symbols L','Standard Symbols PS','Suruma','Symbola','Tarablus','Tholoth','Tibetan Machine Uni','Tinos','Titr','Tlwg Mono','Tlwg Typewriter','Tlwg Typist','Tlwg Typo','Twemoji Mozilla','UKIJ 3D','UKIJ Basma','UKIJ Bom','UKIJ CJK','UKIJ Chechek','UKIJ Chiwer Kesme','UKIJ Diwani','UKIJ Diwani Kawak','UKIJ Diwani Tom','UKIJ Diwani Yantu','UKIJ Ekran','UKIJ Elipbe','UKIJ Elipbe_Chekitlik','UKIJ Esliye','UKIJ Esliye Chiwer','UKIJ Esliye Neqish','UKIJ Esliye Qara','UKIJ Esliye Tom','UKIJ Imaret','UKIJ Inchike','UKIJ Jelliy','UKIJ Junun','UKIJ Kawak','UKIJ Kawak 3D','UKIJ Kesme','UKIJ Kesme Tuz','UKIJ Kufi','UKIJ Kufi 3D','UKIJ Kufi Chiwer','UKIJ Kufi Gul','UKIJ Kufi Kawak','UKIJ Kufi Tar','UKIJ Kufi Uz','UKIJ Kufi Yay','UKIJ Kufi Yolluq','UKIJ Mejnun','UKIJ Mejnuntal','UKIJ Merdane','UKIJ Moy Qelem','UKIJ Nasq','UKIJ Nasq Zilwa','UKIJ Orqun Basma','UKIJ Orqun Yazma','UKIJ Orxun-Yensey','UKIJ Qara','UKIJ Qolyazma','UKIJ Qolyazma Tez','UKIJ Qolyazma Tuz','UKIJ Qolyazma Yantu','UKIJ Ruqi','UKIJ Saet','UKIJ Sulus','UKIJ Sulus Tom','UKIJ Teng','UKIJ Tiken','UKIJ Title','UKIJ Tor','UKIJ Tughra','UKIJ Tuz','UKIJ Tuz Basma','UKIJ Tuz Gezit','UKIJ Tuz Kitab','UKIJ Tuz Neqish','UKIJ Tuz Qara','UKIJ Tuz Tom','UKIJ Tuz Tor','UKIJ Zilwa','UKIJ_Mac Basma','UKIJ_Mac Ekran','URW Bookman','URW Bookman L','URW Chancery L','URW Gothic','URW Gothic L','URW Palladio L','Ubuntu','Ubuntu Condensed','Ubuntu Light','Ubuntu Mono','Ubuntu Thin','Umpush','Uroob','Vemana2000','Verdana','Waree','Yehuda CLM','Yrsa','Yrsa Light','Yrsa Medium','Yrsa SemiBold','Z003','aakar','mry_KacstQurn','ori1Uni','padmaa','padmaa-Bold.1.1','padmmaa','utkal','מרים','गार्गी','नालिमाटी','অনি Dvf','মিত্র','মুক্তি','মুক্তি পাতনা',
		]
		let fntListAndroid = [
			'Droid Sans','Droid Sans Mono','Droid Serif','EmojiOne Mozilla','Noto Color Emoji','Noto Emoji','Noto Kufi Arabic','Noto Mono','Noto Naskh Arabic','Noto Nastaliq Urdu','Noto Sans','Noto Sans Adlam','Noto Sans Adlam Unjoined','Noto Sans Anatolian Hieroglyphs','Noto Sans Arabic','Noto Sans Armenian','Noto Sans Avestan','Noto Sans Balinese','Noto Sans Bamum','Noto Sans Batak','Noto Sans Bengali','Noto Sans Brahmi','Noto Sans Buginese','Noto Sans Buhid','Noto Sans CJK JP','Noto Sans CJK KR','Noto Sans CJK SC','Noto Sans CJK SC Regular','Noto Sans CJK TC','Noto Sans Canadian Aboriginal','Noto Sans Carian','Noto Sans Chakma','Noto Sans Cham','Noto Sans Cherokee','Noto Sans Coptic','Noto Sans Cuneiform','Noto Sans Cypriot','Noto Sans Deseret','Noto Sans Devanagari','Noto Sans Display','Noto Sans Egyptian Hieroglyphs','Noto Sans Ethiopic','Noto Sans Georgian','Noto Sans Glagolitic','Noto Sans Gothic','Noto Sans Gujarati','Noto Sans Gurmukhi','Noto Sans Hanunoo','Noto Sans Hebrew','Noto Sans Imperial Aramaic','Noto Sans Inscriptional Pahlavi','Noto Sans Inscriptional Parthian','Noto Sans JP Regular','Noto Sans Javanese','Noto Sans KR Regular','Noto Sans Kaithi','Noto Sans Kannada','Noto Sans Kayah Li','Noto Sans Kharoshthi','Noto Sans Khmer','Noto Sans Lao','Noto Sans Lepcha','Noto Sans Limbu','Noto Sans Linear B','Noto Sans Lisu','Noto Sans Lycian','Noto Sans Lydian','Noto Sans Malayalam','Noto Sans Mandaic','Noto Sans Meetei Mayek','Noto Sans Mongolian','Noto Sans Mono','Noto Sans Myanmar','Noto Sans NKo','Noto Sans New Tai Lue','Noto Sans Ogham','Noto Sans Ol Chiki','Noto Sans Old Italic','Noto Sans Old Persian','Noto Sans Old South Arabian','Noto Sans Old Turkic','Noto Sans Oriya','Noto Sans Osage','Noto Sans Osmanya','Noto Sans Phags Pa','Noto Sans Phoenician','Noto Sans Rejang','Noto Sans Runic','Noto Sans SC Regular','Noto Sans Samaritan','Noto Sans Saurashtra','Noto Sans Shavian','Noto Sans Sinhala','Noto Sans Sundanese','Noto Sans Syloti Nagri','Noto Sans Symbols','Noto Sans Symbols2','Noto Sans Syriac Eastern','Noto Sans Syriac Estrangela','Noto Sans Syriac Western','Noto Sans TC Regular','Noto Sans Tagalog','Noto Sans Tagbanwa','Noto Sans Tai Le','Noto Sans Tai Tham','Noto Sans Tai Viet','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Thaana','Noto Sans Thai','Noto Sans Tibetan','Noto Sans Tifinagh','Noto Sans Ugaritic','Noto Sans Vai','Noto Sans Yi','Noto Serif','Noto Serif Armenian','Noto Serif Bengali','Noto Serif CJK JP','Noto Serif CJK KR','Noto Serif CJK SC','Noto Serif CJK TC','Noto Serif Devanagari','Noto Serif Display','Noto Serif Ethiopic','Noto Serif Georgian','Noto Serif Gujarati','Noto Serif Hebrew','Noto Serif Kannada','Noto Serif Khmer','Noto Serif Lao','Noto Serif Malayalam','Noto Serif Myanmar','Noto Serif Sinhala','Noto Serif Tamil','Noto Serif Telugu','Noto Serif Thai','Roboto','Roboto Condensed','Twemoji Mozilla'
		]
		// set
		if (isOS == "windows") {fntList = fntListWindows}
		if (isOS == "mac") {fntList = fntListMac}
		if (isOS == "linux") {fntList = fntListLinux}
		if (isOS == "android") {fntList = fntListAndroid}
		// sort + keep en-US order, de-dupe
		fntList.sort(Intl.Collator("en-US").compare)
		fntList = fntList.filter(function(font, position) {
			return fntList.indexOf(font) === position
		})
	}
}

function set_fallback_string() {
	let strA = "",
	list = ['0x0000','0x0080','0x0100','0x0180','0x0250','0x02B0','0x0300','0x0370','0x0400',
	'0x0500','0x0530','0x0590','0x0600','0x0700','0x0750','0x0780','0x07C0','0x0800','0x0840',
	'0x08A0','0x0900','0x0980','0x0A00','0x0A80','0x0B00','0x0B80','0x0C00','0x0C80','0x0D00',
	'0x0D80','0x0E00','0x0E80','0x0F00','0x1000','0x10A0','0x1100','0x1200','0x1380','0x13A0',
	'0x1400','0x1680','0x16A0','0x1700','0x1720','0x1740','0x1760','0x1780','0x1800','0x18B0',
	'0x1900','0x1950','0x1980','0x19E0','0x1A00','0x1A20','0x1AB0','0x1B00','0x1B80','0x1BC0',
	'0x1C00','0x1C50','0x1CC0','0x1CD0','0x1D00','0x1D80','0x1DC0','0x1E00','0x1F00','0x2000',
	'0x2070','0x20A0','0x20D0','0x2100','0x2150','0x2190','0x2200','0x2300','0x2400','0x2440',
	'0x2460','0x2500','0x2580','0x25A0','0x2600','0x2700','0x27C0','0x27F0','0x2800','0x2900',
	'0x2980','0x2A00','0x2B00','0x2C00','0x2C60','0x2C80','0x2D00','0x2D30','0x2D80','0x2DE0',
	'0x2E00','0x2E80','0x2F00','0x2FF0','0x3000','0x3040','0x30A0','0x3100','0x3130','0x3190',
	'0x31A0','0x31C0','0x31F0','0x3200','0x3300','0x3400','0x4DC0','0x4E00','0xA000','0xA490',
	'0xA4D0','0xA500','0xA640','0xA6A0','0xA700','0xA720','0xA800','0xA830','0xA840','0xA880',
	'0xA8E0','0xA900','0xA930','0xA960','0xA980','0xA9E0','0xAA00','0xAA60','0xAA80','0xAAE0',
	'0xAB00','0xAB30','0xAB70','0xABC0','0xAC00','0xD7B0','0xD800','0xDB80','0xDC00','0xE000',
	'0xF900','0xFB00','0xFB50','0xFE00','0xFE10','0xFE20','0xFE30','0xFE50','0xFE70','0xFF00',
	'0xFFF0','0x10000','0x10080','0x10100','0x10140','0x10190','0x101D0','0x10280','0x102A0',
	'0x102E0','0x10300','0x10330','0x10350','0x10380','0x103A0','0x10400','0x10450','0x10480',
	'0x10500','0x10530','0x10600','0x10800','0x10840','0x10860','0x10880','0x108E0','0x10900',
	'0x10920','0x10980','0x109A0','0x10A00','0x10A60','0x10A80','0x10AC0','0x10B00','0x10B40',
	'0x10B60','0x10B80','0x10C00','0x10C80','0x10E60','0x11000','0x11080','0x110D0','0x11100',
	'0x11150','0x11180','0x111E0','0x11200','0x11280','0x112B0','0x11300','0x11480','0x11580',
	'0x11600','0x11680','0x11700','0x118A0','0x11AC0','0x12000','0x12400','0x12480','0x13000',
	'0x14400','0x16800','0x16A40','0x16AD0','0x16B00','0x16F00','0x1B000','0x1BC00','0x1BCA0',
	'0x1D000','0x1D100','0x1D200','0x1D300','0x1D360','0x1D400','0x1D800','0x1E800','0x1EE00',
	'0x1F000','0x1F030','0x1F0A0','0x1F100','0x1F200','0x1F300','0x1F600','0x1F650','0x1F680',
	'0x1F700','0x1F780','0x1F800','0x1F900','0x20000','0x2A700','0x2B740','0x2B820','0x2F800',
	'0xE0000','0xE0100','0xF0000','0x100000']

	// [43] dcf
	for (let i=0; i < fntCode.length; i++) {
		strA += "</span>\n<span>" + String.fromCodePoint(fntCode[i])
	}
	// [1] fpjs2
	strA += "</span>\n<span>" + fntStrA
	// [262] arthur
	let getCodePoints = function* () {
		let codePoints = list
			.map(s => s.trim())
			.filter(s => s.length > 0)
			.map(x => parseInt(x))
			.map(x => x + 1)
		codePoints[0] = 77
		return codePoints
	}
	// combine
	if (fntStrB.length == 0) {
		spawn(function* () {
			let codePoints = yield getCodePoints()
			fntStrB = codePoints.map(x => String.fromCodePoint(x)).join("</span>\n<span>")
			fntStrB += strA
		})
	}
}

function reset_fonts() {
	// glyphs
	let r = ""
	for (let i=0; i < fntCode.length; i++) {
		let c = "u+"+fntCode[i].substr(2)
		r += "\n"+c.padStart(7)
	}
	dom.ug10.innerHTML = fntHead + r
	// fpjs2: hide/color: dont shrink elements
	dom.fontFPJS2label = "...pending..."
	dom.fontFPJS2Found.style.color = zhide
}

let spawn = (function() {
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

function get_fpjs2() {
	/* based on https://github.com/Valve/fingerprintjs2 */
	return new Promise(resolve => {
		if (isFF) {
			// vars
			let baseFonts = ['monospace','sans-serif','serif'],
				t0 = performance.now()
			// elements
			let h = document.getElementsByTagName('body')[0]
			let baseFontsDiv = document.createElement('div')
			let fontsDiv = document.createElement('div')
			let defaultWidth = {}
			let defaultHeight = {}
			let createSpan = function() {
				let s = document.createElement('spanFP')
				s.style.position = "absolute"
				s.style.left = "-9999px"
				s.style.fontSize = "256px"
				s.style.fontStyle = "normal"
				s.style.fontWeight = "normal"
				s.style.letterSpacing = "normal"
				s.style.lineBreak = "auto"
				s.style.lineHeight = "normal"
				s.style.textTransform = "none"
				s.style.textAlign = "left"
				s.style.textDecoration = "none"
				s.style.textShadow = "none"
				s.style.whiteSpace = "normal"
				s.style.wordBreak = "normal"
				s.style.wordSpacing = "normal"
				s.innerHTML = fntStrA
				return s
			}
			// creates a span and load the font to detect and a base font for fallback
			let createSpanWithFonts = function(fontToDetect, baseFont) {
				let s = createSpan()
				s.style.fontFamily = "'" + fontToDetect + "'," + baseFont
				return s
			}
			// creates spans for the base fonts and adds them to baseFontsDiv
			let initializeBaseFontsSpans = function() {
				let spans = []
				for (let index=0, length=baseFonts.length; index<length; index++) {
					let s = createSpan()
					s.style.fontFamily = baseFonts[index]
					baseFontsDiv.appendChild(s)
					spans.push(s)
				}
				return spans
			}
			// creates spans for the fonts to detect and adds them to fontsDiv
			let initializeFontsSpans = function() {
				let spans = {}
				for (let i = 0; i < fntList.length; i++) {
					let fontSpans = []
					for (let j=0, numDefaultFonts = baseFonts.length; j< numDefaultFonts; j++) {
						let s = createSpanWithFonts(fntList[i], baseFonts[j])
						fontsDiv.appendChild(s)
						fontSpans.push(s)
					}
					spans[fntList[i]] = fontSpans // Stores {fontName : [spans for that font]}
				}
				return spans
			}
			// compare
			let present = function(fontSpans) {
				let r = false
				for (let i=0; i < baseFonts.length; i++) {
					r = (fontSpans[i].offsetWidth !== defaultWidth[baseFonts[i]] || fontSpans[i].offsetHeight !== defaultHeight[baseFonts[i]])
					if (r) {return r}
				}
				return r
			}
			// stuff
			let baseFontsSpans = initializeBaseFontsSpans()
			h.appendChild(baseFontsDiv)
			for (let index=0, length = baseFonts.length; index<length; index++) {
				defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth // width for the default font
				defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight // height for the default font
			}
			let fontsSpans = initializeFontsSpans()
			h.appendChild(fontsDiv)
			// detect
			let found = []
			for (let i=0; i < fntList.length; i++) {
				if (present(fontsSpans[fntList[i]])) {found.push(fntList[i])}
			}
			// cleanup
			h.removeChild(fontsDiv)
			h.removeChild(baseFontsDiv)
			// output
			let hash = sha1(found.join())
			dom.fontFPJS2label = hash
			dom.fontFPJS2Found.innerHTML = (found.length > 0 ? found.join(", ") : "no fonts detected")
			dom.fontFPJS2.innerHTML = hash + s12 + "["+found.length+"/"+fntList.length+"]" + sc
			// unhide
			dom.fontFPJS2Found.style.color = zshow
			// cleanup details
			if (stateFNT == true) {showhide("table-row","F1","&#9650; hide")}
			// perf
			if (logPerf) {debug_log("fpjs2 [fonts]",t0,gt0)}
			return resolve("fonts:" + hash)
		} else {
			// non-FF
			return resolve("fonts:" + zNA)
		}
	})
}

function get_fallback(list) {
	// list passed as we need to do a priming run
	/* https://github.com/arthuredelstein/tordemos */
	let width0 = null,
		t = dom.fontFBTest,
		outputB = document.getElementById("fontFB"),
		outputD = document.getElementById("fontFBFound"),
		t0 = performance.now()
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
		let width1 = measure("'" + font + "', fontFallback")
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
		let hash = sha1(found.join())
		dom.fontFBlabel = hash
		dom.fontFB.innerHTML = hash + s12 + "["+found.length+"/"+fntList.length+"]" + sc
		dom.fontFBFound.innerHTML = (found.length > 0 ? found.join(", ") : "no fonts detected")
		// unhide style
		dom.fontFBFound.style.color = zshow
		// cleanup details
		if (stateFNT == true) {showhide("table-row","F1","&#9650; hide")}
		// perf
	}
}

function get_unicode() {
	/* code based on work by David Fifield (dcf) and Serge Egelman (2015)
		https://www.bamsoftware.com/talks/fc15-fontfp/fontfp.html#demo */
	let offset = [], bounding = [], client = [],
		diffsb = [], diffsc = [], display = "",
		t0 = performance.now()
	let isCanvas = true, isBound = true, isClient = true, isTM = true

	// textMetrics
	function supported(property) {return TextMetrics.prototype.hasOwnProperty(property)}
	let tmres = {
		tmres0: [], tmres1: [], tmres2: [], tmres3: [], tmres4: [], tmres5: [],
		tmres6: [], tmres7: [], tmres8: [], tmres9: [], tmres10: [], tmres11: [],
	}
	let tmSupport = []
	let tmTypes = ["width","actualBoundingBoxAscent","actualBoundingBoxDescent",
		"actualBoundingBoxLeft","actualBoundingBoxRight","alphabeticBaseline",
		"emHeightAscent","emHeightDescent","fontBoundingBoxAscent",
		"fontBoundingBoxDescent","hangingBaseline","ideographicBaseline"]
	for (let i = 0; i < tmTypes.length; i++) {tmSupport.push(supported(tmTypes[i]))}

	function output() {
		// textmetrics
		let tmhash = []
		for (let i=0; i < tmTypes.length; i++) {
			let el = document.getElementById("tm"+i),
				array = tmres["tmres"+i],
				output = sha1(array.join())
			if (tmSupport[i]) {
				if (isCanvas) {
					array = array.filter(function(item, position) {return array.indexOf(item) === position})
					let hashchk = sha1(array.join())
					if (hashchk == "da39a3ee5e6b4b0d3255bfef95601890afd80709") {
						output = "undefined" // different to canvas blocking
						if (i == 0) {isTM = false}
					}
				} else {
					output = "blocked"
				}
			} else {
				output = zNS
			}
			el.innerHTML = output
			tmhash.push(tmTypes[i] +": " + output)
		}
		dom.ug2.innerHTML = sha1(tmhash.join()) + (isCanvas ? "" : sb+"[canvas]"+sc)
		//console.log("HASH: TM combined: " + sha1(tmhash.join()) + "\n - " + tmhash.join("\n - "))

		// de-dupe
		let unique = tmres["tmres0"]
		unique = unique.filter(function(item, position) {return unique.indexOf(item) === position})
		diffsb = diffsb.filter(function(item, position) {return diffsb.indexOf(item) === position})
		diffsc = diffsc.filter(function(item, position) {return diffsc.indexOf(item) === position})
		// show/hide
		let bhash = sha1(bounding.join()), chash = sha1(client.join())
		if (bhash == chash) {
			dom.togUG.style.display = "none"; dom.labelUG = "domrect"
		} else {
			dom.togUG.style.display = "table-row"; dom.labelUG = "getBoundingClientRect"
		}
		// the rest
		let total = "|"+ unique.length +" diffs]"+ sc, r = ""
		dom.ug1 = sha1(offset.join())
		r = (isBound ? "" : zB)
		if (isBound && isCanvas && isTM) {r = s12 +"["+ diffsb.length + total}
		dom.ug3.innerHTML = bhash + r
		r = (isClient ? "" : zB)
		if (isClient && isCanvas && isTM) {r = s12 +"["+ diffsc.length + total}
		dom.ug4.innerHTML = chash + r
		dom.ug10.innerHTML = fntHead + display

		// log
		if (logExtra && isCanvas && isTM) {
			r = ""
			if (isBound) {r = "measuretext vs bounding\n" + diffsb.join("\n")}
			if (isClient && isClient !== isBound) {r += "measuretext vs clientrects\n" + diffsc.join("\n")}
			//if (r !== "") {console.log(r)}
		}
		// perf
		if (logPerf) {debug_log("unicode glyphs [fonts]",t0)}
	}

	function run() {
		let styles = ["none","sans-serif","serif","monospace","cursive","fantasy"],
			div = dom.ugDiv, span = dom.ugSpan, slot = dom.ugSlot, m = "",
			canvas = dom.ugCanvas, ctx = canvas.getContext("2d")
		// each char
		for (let i=0; i < fntCode.length; i++) {
			let	c = String.fromCodePoint(fntCode[i]),
				cp = "u+" + (fntCode[i]).substr(2)
			display += "<br>" + cp.padStart(7)
			// each style
			for (let j=0; j < styles.length; j++) {
				// set
				slot.style.fontFamily = styles[j]
				slot.textContent = c
				let m = ""
				// offsets: w=span h=div
				let w = span.offsetWidth, h = div.offsetHeight
				offset.push((j==0 ? cp+"-" : "" ) + w+"x"+h)
				display += (w.toString()).padStart(8) +" x "+ (h.toString()).padStart(4)
				if (j == 5) {display += "    " + c}
				// measureText
				if (isCanvas) {
					try {
						ctx.font = "normal normal 22000px " + styles[j]
						let tm = ctx.measureText(c)
						m = tm.width
						// no perf gain by checking tmSupport
						tmres["tmres0"].push(m)
						tmres["tmres1"].push(tm.actualBoundingBoxAscent)
						tmres["tmres2"].push(tm.actualBoundingBoxDescent)
						tmres["tmres3"].push(tm.actualBoundingBoxLeft)
						tmres["tmres4"].push(tm.actualBoundingBoxRight)
						tmres["tmres5"].push(tm.alphabeticBaseline)
						tmres["tmres6"].push(tm.emHeightAscent)
						tmres["tmres7"].push(tm.emHeightDescent)
						tmres["tmres8"].push(tm.fontBoundingBoxAscent)
						tmres["tmres9"].push(tm.fontBoundingBoxDescent)
						tmres["tmres10"].push(tm.hangingBaseline)
						tmres["tmres11"].push(tm.ideographicBaseline)
					} catch(err) {
						if (err.message == "ctx is undefined") {
							isCanvas = false
						} else {
							console.debug("measureText", err.name, err.message)
						}
					}
				}
				// bounding: w=div h=span
				if (isBound) {
					let bDiv = div.getBoundingClientRect()
					let bSpan = span.getBoundingClientRect()
					try {
						w = bSpan.width; h = bDiv.height
						bounding.push(w+"x"+h)
						if (m !== w) {diffsb.push(m+" vs "+w)}
					} catch(err) {isBound = false}
				}
				// client: w=span, h=div
				if (isClient) {
					let cDiv = div.getClientRects()
					let cSpan = span.getClientRects()
					try {
						w = cSpan[0].width; h = cDiv[0].height
						client.push(w+"x"+h )
						if (m !== w) {diffsc.push(m+" vs "+w)}
					} catch(err) {isClient = false}
				}
			}
		}
		dom.ugSlot = ""
		output()
	}
	run()
}

function get_woff() {
	return new Promise(resolve => {
		let el = dom.woffno,
			control = el.offsetWidth,
			count = 0,
			maxcount = 31, // 800ms
			t0 = performance.now()
		if (isOS == "android" | isTB) {maxcount = 59} // 1500ms
		// output
		function output_woff(state) {
			dom.fontWoff2.innerHTML = state
			if (logPerf) {debug_log("woff [fonts]",t0)}
			return resolve("woff:" + state)
		}
		// check
		el = dom.woffyes
		function check_woff() {
			if (count < maxcount) {
				if (control !== el.offsetWidth) {
					clearInterval(checking)
					output_woff(zE)
				}
			} else {
				// timed out: pref removed FF69
				clearInterval(checking)
				let str = (isVer < 69 ? zD+" [or blocked]" : "blocked")
				output_woff(str)
			}
			count++
		}
		let checking = setInterval(check_woff, 25)
	})
}

function outputFontsFB() {
	// IDK why, but when blocking document fonts: we need a primer and a delay
	if (isFF) {
		dom.fontFB.innerHTML = "test is running... please wait"
		dom.fontFBlabel = "...pending..."
		dom.fontFBFound.style.color = zhide
		// set interval allows ^^ to paint
		function run_primer() {
			clearInterval(checking)
			get_fallback(['orange','banana']) // primer
			function run_real() {
				get_fallback(fntList)
				clearInterval(checking2)
			}
			let checking2 = setInterval(run_real, 25)
		}
		let checking = setInterval(run_primer, 1)
	}
}

function outputFonts() {
	let t0 = performance.now(),
		section = [], r = ""

	if (!isFF) {
		dom.fontFPJS2 = zNA
		dom.fontFB = zNA
		dom.fontFPJS2 = zNA
	}
	set_fallback_string()
	set_fntList()

	// proportional
	r = window.getComputedStyle(document.body,null).getPropertyValue("font-family")
	dom.fontFCprop = r
	section.push("proportional:" + r)

	// sizes
	dom.df1 = fntStrA
	dom.df2 = fntStrA
	let el = dom.df1
	r = "serif/sans-serif, " + getComputedStyle(el).getPropertyValue("font-size")
	el = dom.df2
	r += " | monospace, " + getComputedStyle(el).getPropertyValue("font-size")
	dom.fontFCsize = r
	section.push("sizes:" + r)	

	// css font loading
	r = ("FontFace" in window ? zE : zD)
	dom.fontCSS = r
	section.push("font_loading:" + r)

	// doc fonts
	el = dom.spanLH
	r = getComputedStyle(el).getPropertyValue("font-family")
	r = (r.slice(1,16) == "Times New Roman" ? zE : zD)
	dom.fontDoc = r
	section.push("document_fonts:" + r)	

	get_unicode() //ToDo: promisify and add to section hash

	// other
	Promise.all([
		get_fpjs2(),
		get_woff()
	]).then(function(results){
		results.forEach(function(currentResult) {
			section.push(currentResult)
		})
		section_info("fonts", t0, gt0, section)
	})
}

outputFonts()
