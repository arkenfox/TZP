'use strict';

var dom;

let sDetail = {}

// css
let s0 = " <span class='",
	sb = s0+"bad'>",
	sg = s0+"good'>",
	sf = s0+"faint'>",
	sn = s0+"neutral'>",
	snc = s0+"no_color'>",
	s1 = s0+"s1'>",
	s2 = s0+"s2'>",
	s3 = s0+"s3'>",
	s4 = s0+"s4'>",
	s5 = s0+"s5'>",
	s6 = s0+"s6'>",
	s7 = s0+"s7'>",
	s8 = s0+"s8'>",
	s9 = s0+"s9'>",
	s10 = s0+"s10'>",
	s11 = s0+"s11'>",
	s12 = s0+"s12'>",
	s13 = s0+"s13'>",
	s14 = s0+"s14'>",
	s15 = s0+"s15'>",
	s16 = s0+"s16'>",
	s17 = s0+"s17'>",
	s18 = s0+"s18'>",
	s99 = s0+"s99'>",
	sc = "</span>",
// test icons
	green_tick = "<span style='font-size: 10px;'><b>" + s9.trim() +" \u2713"+ sc + "</b></span>",
	red_cross = "<span style='font-size: 10px;'><b>" + sb.trim() +" \u2715"+ sc + "</b></span>",
	yellow_block = "<span style='font-size: 10px;'><b>" + s4.trim() +" \u2715"+ sc + "</b></span>",
	white_na =  "<span style='font-size: 10px;'><b>" + snc.trim() +" \u2715"+ sc + "</b></span>",
// common results
	zErr = "error",
	zNA = "n/a",
	zU = "undefined",
	zUQ = "\"undefined\"",
	zNEW = sb+"[NEW]"+sc,
// other
	canPerf = false,
	is95 = false,
	isEngine = "",
	isEnginePretty = "", // results string with perf
	isFF = false,
	isFFpretty = "", // results string with perf
	isFFvalid = false, // no errors
	isFile = false,
	isOS = "",
	isRFP = false,
	isSecure = false,
	isTB = false,
	isVer = "",
	isVerMax = ""

// language/locale tests
var gLocales = [
	// ISO_639-1 alpha-2 codes
	// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	//* not supported in FF
"aa,afar",
"ab,abkhazian",
"ae,avestan",
"an,aragonese",
"av,avaric",
"ay,aymara",
"ba,bashkir",
"bi,bislama",
"ch,chamorro",
"co,corsican",
"cr,cree",
"cu,church slavic",
"dv,divehi",
"fj,fijian",
"gn,guarani",
"ho,hiri motu",
"ht,haitian",
"hz,herero",
"ik,inupiaq",
"io,ido",
"iu,inuktitut",
"kg,kongo",
"kj,kuanyama",
"kr,kanuri",
"kv,komi",
"la,latin",
"li,limburgan",
"mh,marshallese",
"na,nauru",
"ng,ndonga",
"nr,south ndebele",
"nv,navajo",
"ny,chichewa",
"oj,ojibwa",
"pi,pali",
"sm,samoan",
"ss,siswati",
"st,southern sotho",
"tn,tswana",
"ts,tsonga",
"ty,tahitian",
"ve,venda",
"vo,volapük",
"wa,walloon",
	//*/

"af,afrikaans",
"ak,akan",
"am,amharic",
"ar,arabic",
"as,assamese",
"az,azerbaijani",
"be,belarusian",
"bg,bulgarian",
"bm,bambara",
"bn,bengali",
"bo,tibetan",
"br,breton",
"bs,bosnian",
"ca,catalan",
"ce,chechen",
"cs,czech",
"cv,chuvash",
"cy,welsh",
"da,danish",
"de,german",
"dz,dzongkha",
"ee,éwé",
"el,greek",
"en,english",
"eo,esperanto",
"es,spanish",
"et,estonian",
"eu,basque",
"fa,persian",
"ff,fulah",
"fi,finnish",
"fo,faroese",
"fr,french",
"fy,frisian",
"ga,irish",
"gd,scottish gaelic",
"gl,galician",
"gu,gujarati",
"gv,manx",
"ha,hausa",
"he,hebrew",
"hi,hindi",
"hr,croatian",
"hu,hungarian",
"hy,armenian",
"ia,interlingua",
"id,indonesian",
"ie,interlingue",
"ig,igbo",
"ii,sichuan yi",
"is,icelandic",
"it,italian",
"ja,japanese",
"jv,javanese",
"ka,georgian",
"ki,kikuyu",
"kk,kazakh",
"kl,greenlandic",
"km,khmer",
"kn,kannada",
"ko,korean",
"ks,kashmiri",
"ku,kurdish",
"kw,cornish",
"ky,kyrgyz",
"lb,luxembourgish",
"lg,ganda",
"ln,lingala",
"lo,lao",
"lt,lithuanian",
"lu,luba-katanga",
"lv,latvian",
"mg,malagasy",
"mi,maori",
"mk,macedonian",
"ml,malayalam",
"mn,mongolian",
"mr,marathi",
"ms,malay",
"mt,maltese",
"my,burmese",
"nb,norwegian bokmål",
"nd,north ndebele",
"ne,nepali",
"nl,dutch",
"nn,norwegian nynorsk",
"no,norwegian",
"oc,occitan",
"om,oromo",
"or,odia",
"os,ossetian",
"pa,punjabi",
"pl,polish",
"ps,pashto",
"pt,portuguese",
"qu,quechua",
"rm,rhaeto-romanic",
"rn,kirundi",
"ro,romanian",
"ru,russian",
"rw,kinyarwanda",
"sa,sanskrit",
"sc,sardinian",
"sd,sindhi",
"se,northern sami",
"sg,sango",
"si,sinhala",
"sk,slovak",
"sl,slovenian",
"sn,shona",
"so,somali",
"sq,albanian",
"sr,serbian",
"su,sundanese",
"sv,swedish",
"sw,swahili",
"ta,tamil",
"te,telugu",
"tg,tajik",
"th,thai",
"ti,tigrinya",
"tk,turkmen",
"tl,tagalog",
"to,tongan",
"tr,turkish",
"tt,tatar",
"tw,twi",
"ug,uighur",
"uk,ukrainian",
"ur,urdu",
"uz,uzbek",
"vi,vietnamese",
"wo,wolof",
"xh,xhosa",
"yi,yiddish",
"yo,yoruba",
"za,zhuang",
"zh,chinese",
"zu,zulu",

	// ISO_639-2 alph-3 codes
	// https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes
	// only add the ones supported in FF
"ast,asturian",
"bas,basaa",
"bem,bemba",
"bho,bhojpuri",
"ceb,cebuano",
"chr,cherokee",
"doi,dogri",
"dsb,lower sorbian",
"dua,duala",
"ewo,ewondo",
"fil,filipino",
"fur,friulian",
"gsw,swiss german",
"haw,hawaiian",
"hsb,upper sorbian",
"kab,kabyle",
"kam,kamba",
"kok,konkani",
"luo,luo",
"mai,maithili",
"mas,maasai",
"mni,meitei",
"nyn,nyankole",
"raj,rajasthani",
"sah,yakut",
"sat,santali", // 1731528, 1852843
"sco,scots", // 1714293
"smn,inari sámi",
"vai,vai",
"zgh,standard moroccan tamazight",

	// other alpha-3
"agq,aghem",
"asa,asu",
"bcg,haryanvi",
"bez,bena",
"bgc,haryanvi",
"brx,bodo",
"cak,kaqchikel",
"ccp,chakma",
"cgg,chiga",
"cho,choctaw",
"ckb,central kurdish",
"dav,taita",
"dje,zarma",
"dyo,jola-fonyi",
"ebu,embu",
"guz,gusii",
"jgo,ngomba",
"jmc,machame",
"kde,makonde",
"kea,kabuverdianu",
"kgp,kaingang",
"khq,koyra chiini",
"kkj,kako",
"kln,kalenjin",
"ksb,shambala",
"ksf,bafia",
"ksh,colognian",
"lag,langi",
"lij,ligurian",
"lkt,lakota",
"lrc, northern luri",
"ltg,latgalian",
"luy,luyia",
"mer,meru",
"mfe,morisyen",
"mgh,makhuwa-meetto",
"mgo,meta'",
"mix,mixtepec mixtec",
"mua,mundang",
"mzn,mazanderani",
"naq,nama",
"nmg,kwasio",
"nnh,ngiemboon",
"nus,nuer",
"pap,papiamento",
"pcm,nigerian",
"rof,rombo",
"rwk,rwa",
"saq,samburu",
"sbp,sangu",
"seh,sena",
"shi,tachelhit",
"skr,saraiki", // 1808127
"ses,koyraboro senni",
"szl,silesian", // 1691695
"teo,teso",
"trs,triqui", // 1583177
"twq,tasawaq",
"tzm,central atlas tamazight",
"vun,vunjo",
"wae,walser",
"xog,soga",
"yav,yangben",
"yue,cantonese",
"yrl,nhengatu",
"zh-cn,chinese (china)",
"zh-hans,chinese (simplified)",
"zh-hant,chinese (traditional)",
"zh-hk,chinese (hong kong)",
"zh-sg,chinese (singapore)",
"zh-tw,chinese (taiwan)",

/* ignore: maps to already listed items in expanded tests
"prs,dari", // fa-af
"sh,serbo-croatian", // sr-latn
"swc,congo", // sw-cd
//*/
]

