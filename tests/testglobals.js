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

// timezones
let gTimezones = [
// no regional prefix
"CET","CST6CDT","Cuba","EET","EST","EST5EDT","Egypt","Eire","Factory","GB","GB-Eire","GMT","GMT+0","GMT-0","GMT0",
"Greenwich","HST","Hongkong","Iceland","Iran","Israel","Jamaica","Japan","Kwajalein","Libya","MET","MST","MST7MDT",
"NZ","NZ-CHAT","Navajo","PRC","PST8PDT","Poland","Portugal","ROC","ROK","Singapore","Turkey","UCT","UTC","Universal",
"W-SU","WET","Zulu",

// THE REST
"Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Algiers","Africa/Asmara","Africa/Asmera","Africa/Bamako",
"Africa/Bangui","Africa/Banjul","Africa/Bissau","Africa/Blantyre","Africa/Brazzaville","Africa/Bujumbura","Africa/Cairo",
"Africa/Casablanca","Africa/Ceuta","Africa/Conakry","Africa/Dakar","Africa/Dar_es_Salaam","Africa/Djibouti","Africa/Douala",
"Africa/El_Aaiun","Africa/Freetown","Africa/Gaborone","Africa/Harare","Africa/Johannesburg","Africa/Juba","Africa/Kampala",
"Africa/Khartoum","Africa/Kigali","Africa/Kinshasa","Africa/Lagos","Africa/Libreville","Africa/Lome","Africa/Luanda",
"Africa/Lubumbashi","Africa/Lusaka","Africa/Malabo","Africa/Maputo","Africa/Maseru","Africa/Mbabane","Africa/Mogadishu",
"Africa/Monrovia","Africa/Nairobi","Africa/Ndjamena","Africa/Niamey","Africa/Nouakchott","Africa/Ouagadougou",
"Africa/Porto-Novo","Africa/Sao_Tome","Africa/Timbuktu","Africa/Tripoli","Africa/Tunis","Africa/Windhoek",

"America/Adak","America/Anchorage","America/Anguilla","America/Antigua","America/Araguaina","America/Argentina/Buenos_Aires",
"America/Argentina/Catamarca","America/Argentina/ComodRivadavia","America/Argentina/Cordoba","America/Argentina/Jujuy",
"America/Argentina/La_Rioja","America/Argentina/Mendoza","America/Argentina/Rio_Gallegos","America/Argentina/Salta",
"America/Argentina/San_Juan","America/Argentina/San_Luis","America/Argentina/Tucuman","America/Argentina/Ushuaia",
"America/Aruba","America/Asuncion","America/Atikokan","America/Atka","America/Bahia","America/Bahia_Banderas",
"America/Barbados","America/Belem","America/Belize","America/Blanc-Sablon","America/Boa_Vista","America/Bogota",
"America/Boise","America/Buenos_Aires","America/Cambridge_Bay","America/Campo_Grande","America/Cancun","America/Caracas",
"America/Catamarca","America/Cayenne","America/Cayman","America/Chicago","America/Chihuahua","America/Ciudad_Juarez",
"America/Coral_Harbour","America/Cordoba","America/Costa_Rica","America/Creston","America/Cuiaba","America/Curacao",
"America/Danmarkshavn","America/Dawson","America/Dawson_Creek","America/Denver","America/Detroit","America/Dominica",
"America/Edmonton","America/Eirunepe","America/El_Salvador","America/Ensenada","America/Fort_Nelson","America/Fort_Wayne",
"America/Fortaleza","America/Glace_Bay","America/Godthab","America/Goose_Bay","America/Grand_Turk","America/Grenada",
"America/Guadeloupe","America/Guatemala","America/Guayaquil","America/Guyana","America/Halifax","America/Havana",
"America/Hermosillo","America/Indiana/Indianapolis","America/Indiana/Knox","America/Indiana/Marengo",
"America/Indiana/Petersburg","America/Indiana/Tell_City","America/Indiana/Vevay","America/Indiana/Vincennes",
"America/Indiana/Winamac","America/Indianapolis","America/Inuvik","America/Iqaluit","America/Jamaica","America/Jujuy",
"America/Juneau","America/Kentucky/Louisville","America/Kentucky/Monticello","America/Knox_IN","America/Kralendijk",
"America/La_Paz","America/Lima","America/Los_Angeles","America/Louisville","America/Lower_Princes","America/Maceio",
"America/Managua","America/Manaus","America/Marigot","America/Martinique","America/Matamoros","America/Mazatlan",
"America/Mendoza","America/Menominee","America/Merida","America/Metlakatla","America/Mexico_City","America/Miquelon",
"America/Moncton","America/Monterrey","America/Montevideo","America/Montreal","America/Montserrat","America/Nassau",
"America/New_York","America/Nipigon","America/Nome","America/Noronha","America/North_Dakota/Beulah",
"America/North_Dakota/Center","America/North_Dakota/New_Salem","America/Nuuk","America/Ojinaga","America/Panama",
"America/Pangnirtung","America/Paramaribo","America/Phoenix","America/Port-au-Prince","America/Port_of_Spain",
"America/Porto_Acre","America/Porto_Velho","America/Puerto_Rico","America/Punta_Arenas","America/Rainy_River",
"America/Rankin_Inlet","America/Recife","America/Regina","America/Resolute","America/Rio_Branco","America/Rosario",
"America/Santa_Isabel","America/Santarem","America/Santiago","America/Santo_Domingo","America/Sao_Paulo",
"America/Scoresbysund","America/Shiprock","America/Sitka","America/St_Barthelemy","America/St_Johns","America/St_Kitts",
"America/St_Lucia","America/St_Thomas","America/St_Vincent","America/Swift_Current","America/Tegucigalpa",
"America/Thule","America/Thunder_Bay","America/Tijuana","America/Toronto","America/Tortola","America/Vancouver",
"America/Virgin","America/Whitehorse","America/Winnipeg","America/Yakutat","America/Yellowknife",

"Antarctica/Casey","Antarctica/Davis","Antarctica/DumontDUrville","Antarctica/Macquarie","Antarctica/Mawson",
"Antarctica/McMurdo","Antarctica/Palmer","Antarctica/Rothera","Antarctica/South_Pole","Antarctica/Syowa",
"Antarctica/Troll","Antarctica/Vostok","Arctic/Longyearbyen",

"Asia/Aden","Asia/Almaty","Asia/Amman","Asia/Anadyr","Asia/Aqtau","Asia/Aqtobe","Asia/Ashgabat","Asia/Ashkhabad",
"Asia/Atyrau","Asia/Baghdad","Asia/Bahrain","Asia/Baku","Asia/Bangkok","Asia/Barnaul","Asia/Beirut","Asia/Bishkek",
"Asia/Brunei","Asia/Calcutta","Asia/Chita","Asia/Choibalsan","Asia/Chongqing","Asia/Chungking","Asia/Colombo",
"Asia/Dacca","Asia/Damascus","Asia/Dhaka","Asia/Dili","Asia/Dubai","Asia/Dushanbe","Asia/Famagusta","Asia/Gaza",
"Asia/Harbin","Asia/Hebron","Asia/Ho_Chi_Minh","Asia/Hong_Kong","Asia/Hovd","Asia/Irkutsk","Asia/Istanbul",
"Asia/Jakarta","Asia/Jayapura","Asia/Jerusalem","Asia/Kabul","Asia/Kamchatka","Asia/Karachi","Asia/Kashgar",
"Asia/Kathmandu","Asia/Katmandu","Asia/Khandyga","Asia/Kolkata","Asia/Krasnoyarsk","Asia/Kuala_Lumpur","Asia/Kuching",
"Asia/Kuwait","Asia/Macao","Asia/Macau","Asia/Magadan","Asia/Makassar","Asia/Manila","Asia/Muscat","Asia/Nicosia",
"Asia/Novokuznetsk","Asia/Novosibirsk","Asia/Omsk","Asia/Oral","Asia/Phnom_Penh","Asia/Pontianak","Asia/Pyongyang",
"Asia/Qatar","Asia/Qostanay","Asia/Qyzylorda","Asia/Rangoon","Asia/Riyadh","Asia/Saigon","Asia/Sakhalin",
"Asia/Samarkand","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Srednekolymsk","Asia/Taipei","Asia/Tashkent",
"Asia/Tbilisi","Asia/Tehran","Asia/Tel_Aviv","Asia/Thimbu","Asia/Thimphu","Asia/Tokyo","Asia/Tomsk","Asia/Ujung_Pandang",
"Asia/Ulaanbaatar","Asia/Ulan_Bator","Asia/Urumqi","Asia/Ust-Nera","Asia/Vientiane","Asia/Vladivostok","Asia/Yakutsk",
"Asia/Yangon","Asia/Yekaterinburg","Asia/Yerevan",

"Atlantic/Azores","Atlantic/Bermuda","Atlantic/Canary","Atlantic/Cape_Verde","Atlantic/Faeroe","Atlantic/Faroe",
"Atlantic/Jan_Mayen","Atlantic/Madeira","Atlantic/Reykjavik","Atlantic/South_Georgia","Atlantic/St_Helena",
"Atlantic/Stanley",

"Australia/ACT","Australia/Adelaide","Australia/Brisbane","Australia/Broken_Hill","Australia/Canberra","Australia/Currie",
"Australia/Darwin","Australia/Eucla","Australia/Hobart","Australia/LHI","Australia/Lindeman","Australia/Lord_Howe",
"Australia/Melbourne","Australia/NSW","Australia/North","Australia/Perth","Australia/Queensland","Australia/South",
"Australia/Sydney","Australia/Tasmania","Australia/Victoria","Australia/West","Australia/Yancowinna",

"Brazil/Acre","Brazil/DeNoronha","Brazil/East","Brazil/West",

"Canada/Atlantic","Canada/Central","Canada/Eastern","Canada/Mountain","Canada/Newfoundland","Canada/Pacific",
"Canada/Saskatchewan","Canada/Yukon",

"Chile/Continental","Chile/EasterIsland",

"Etc/GMT","Etc/GMT+0","Etc/GMT+1","Etc/GMT+10","Etc/GMT+11","Etc/GMT+12","Etc/GMT+2","Etc/GMT+3","Etc/GMT+4",
"Etc/GMT+5","Etc/GMT+6","Etc/GMT+7","Etc/GMT+8","Etc/GMT+9","Etc/GMT-0","Etc/GMT-1","Etc/GMT-10","Etc/GMT-11",
"Etc/GMT-12","Etc/GMT-13","Etc/GMT-14","Etc/GMT-2","Etc/GMT-3","Etc/GMT-4","Etc/GMT-5","Etc/GMT-6","Etc/GMT-7",
"Etc/GMT-8","Etc/GMT-9","Etc/GMT0","Etc/Greenwich","Etc/UCT","Etc/UTC","Etc/Universal","Etc/Zulu",

"Europe/Amsterdam","Europe/Andorra","Europe/Astrakhan","Europe/Athens","Europe/Belfast","Europe/Belgrade","Europe/Berlin",
"Europe/Bratislava","Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Busingen","Europe/Chisinau",
"Europe/Copenhagen","Europe/Dublin","Europe/Gibraltar","Europe/Guernsey","Europe/Helsinki","Europe/Isle_of_Man",
"Europe/Istanbul","Europe/Jersey","Europe/Kaliningrad","Europe/Kiev","Europe/Kirov","Europe/Kyiv","Europe/Lisbon",
"Europe/Ljubljana","Europe/London","Europe/Luxembourg","Europe/Madrid","Europe/Malta","Europe/Mariehamn","Europe/Minsk",
"Europe/Monaco","Europe/Moscow","Europe/Nicosia","Europe/Oslo","Europe/Paris","Europe/Podgorica","Europe/Prague","Europe/Riga",
"Europe/Rome","Europe/Samara","Europe/San_Marino","Europe/Sarajevo","Europe/Saratov","Europe/Simferopol","Europe/Skopje",
"Europe/Sofia","Europe/Stockholm","Europe/Tallinn","Europe/Tirane","Europe/Tiraspol","Europe/Ulyanovsk","Europe/Uzhgorod",
"Europe/Vaduz","Europe/Vatican","Europe/Vienna","Europe/Vilnius","Europe/Volgograd","Europe/Warsaw","Europe/Zagreb",
"Europe/Zaporozhye","Europe/Zurich",

"Indian/Antananarivo","Indian/Chagos","Indian/Christmas","Indian/Cocos","Indian/Comoro","Indian/Kerguelen",
"Indian/Mahe","Indian/Maldives","Indian/Mauritius","Indian/Mayotte","Indian/Reunion",

"Mexico/BajaNorte","Mexico/BajaSur","Mexico/General",

"Pacific/Apia","Pacific/Auckland","Pacific/Bougainville","Pacific/Chatham","Pacific/Chuuk","Pacific/Easter","Pacific/Efate",
"Pacific/Enderbury","Pacific/Fakaofo","Pacific/Fiji","Pacific/Funafuti","Pacific/Galapagos","Pacific/Gambier",
"Pacific/Guadalcanal","Pacific/Guam","Pacific/Honolulu","Pacific/Johnston","Pacific/Kanton","Pacific/Kiritimati",
"Pacific/Kosrae","Pacific/Kwajalein","Pacific/Majuro","Pacific/Marquesas","Pacific/Midway","Pacific/Nauru",
"Pacific/Niue","Pacific/Norfolk","Pacific/Noumea","Pacific/Pago_Pago","Pacific/Palau","Pacific/Pitcairn","Pacific/Pohnpei",
"Pacific/Ponape","Pacific/Port_Moresby","Pacific/Rarotonga","Pacific/Saipan","Pacific/Samoa","Pacific/Tahiti",
"Pacific/Tarawa","Pacific/Tongatapu","Pacific/Truk","Pacific/Wake","Pacific/Wallis","Pacific/Yap",

"US/Alaska","US/Aleutian","US/Arizona","US/Central","US/East-Indiana","US/Eastern","US/Hawaii","US/Indiana-Starke",
"US/Michigan","US/Mountain","US/Pacific","US/Samoa"
]

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

