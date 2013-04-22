require({cache:{
'dojox/grid/enhanced/nls/fi/Filter':function(){
define(
"dojox/grid/enhanced/nls/fi/Filter", //begin v1.x content
({
	"clearFilterDialogTitle": "Tyhjennä suodatin",
	"filterDefDialogTitle": "Suodatin",
	"ruleTitleTemplate": "Sääntö ${0}",
	
	"conditionEqual": "yhtä suuri kuin",
	"conditionNotEqual": "ei ole yhtä suuri kuin",
	"conditionLess": "on pienempi kuin",
	"conditionLessEqual": "pienempi tai yhtä suuri kuin",
	"conditionLarger": "on suurempi kuin",
	"conditionLargerEqual": "suurempi tai yhtä suuri kuin",
	"conditionContains": "sisältää",
	"conditionIs": "on",
	"conditionStartsWith": "alussa on",
	"conditionEndWith": "lopussa on",
	"conditionNotContain": "ei sisällä",
	"conditionIsNot": "ei ole",
	"conditionNotStartWith": "alussa ei ole",
	"conditionNotEndWith": "lopussa ei ole",
	"conditionBefore": "ennen",
	"conditionAfter": "jälkeen",
	"conditionRange": "vaihtelualue",
	"conditionIsEmpty": "on tyhjä",
	
	"all": "kaikki",
	"any": "mikä tahansa",
	"relationAll": "kaikki säännöt",
	"waiRelAll": "Täsmäytä kaikki seuraavat säännöt:",
	"relationAny": "mitkä tahansa säännöt",
	"waiRelAny": "Täsmäytä mitkä tahansa seuraavista säännöistä:",
	"relationMsgFront": "Vastine",
	"relationMsgTail": "",
	"and": "ja",
	"or": "tai",
	
	"addRuleButton": "Lisää sääntö",
	"waiAddRuleButton": "Lisää uusi sääntö",
	"removeRuleButton": "Poista sääntö",
	"waiRemoveRuleButtonTemplate": "Poista sääntö ${0}",
	
	"cancelButton": "Peruuta",
	"waiCancelButton": "Peruuta keskustelu",
	"clearButton": "Tyhjennä",
	"waiClearButton": "Tyhjennä suodatin",
	"filterButton": "Suodata",
	"waiFilterButton": "Lähetä suodatin",
	
	"columnSelectLabel": "Sarake",
	"waiColumnSelectTemplate": "Säännön ${0} sarake",
	"conditionSelectLabel": "Ehto",
	"waiConditionSelectTemplate": "Säännön ${0} ehto",
	"valueBoxLabel": "Arvo",
	"waiValueBoxTemplate": "Syötä säännön ${0} suodatettava arvo",
	
	"rangeTo": "kohde",
	"rangeTemplate": "lähde ${0}, kohde ${1}",
	
	"statusTipHeaderColumn": "Sarake",
	"statusTipHeaderCondition": "Säännöt",
	"statusTipTitle": "Suodatinpalkki",
	"statusTipMsg": "Napsauta suodatinpalkkia kohteen ${0} arvojen suodattamiseksi.",
	"anycolumn": "mikä tahansa sarake",
	"statusTipTitleNoFilter": "Suodatinpalkki",
	"statusTipTitleHasFilter": "Suodatin",
	"statusTipRelAny": "Vastaa jotakin sääntöä.",
	"statusTipRelAll": "Vastaa kaikkia sääntöjä.",
	
	"defaultItemsName": "nimikkeet",
	"filterBarMsgHasFilterTemplate": "näkyvissä ${0} / ${1} ${2}.",
	"filterBarMsgNoFilterTemplate": "Mikään suodatin ei ole käytössä",
	
	"filterBarDefButton": "Määritä suodatin",
	"waiFilterBarDefButton": "Suodata taulukko",
	"a11yFilterBarDefButton": "Suodata...",
	"filterBarClearButton": "Tyhjennä suodatin",
	"waiFilterBarClearButton": "Tyhjennä suodatin",
	"closeFilterBarBtn": "Sulje suodatinpalkki",
	
	"clearFilterMsg": "Tämä toimenpide poistaa suodattimen ja näyttää kaikki saatavilla olevat tallenteet.",
	"anyColumnOption": "Mikä tahansa sarake",
	
	"trueLabel": "Tosi",
	"falseLabel": "Epätosi"
})
//end v1.x content
);

},
'dojox/grid/enhanced/nls/fi-fi/Filter':function(){
define('dojox/grid/enhanced/nls/fi-fi/Filter',{});
},
'dojox/grid/enhanced/nls/fi/EnhancedGrid':function(){
define(
"dojox/grid/enhanced/nls/fi/EnhancedGrid", //begin v1.x content
({
	singleSort: "Yksinkertainen lajittelu",
	nestedSort: "Sisäkkäinen lajittelu",
	ascending: "Nouseva",
	descending: "Laskeva",
	sortingState: "${0} - ${1}",
	unsorted: "Älä lajittele tätä saraketta",
	indirectSelectionRadio: "Rivi ${0}, yksittäisvalinta, ruutu",
	indirectSelectionCheckBox: "Rivi ${0}, monivalinta, valintaruutu",
	selectAll: "Valitse kaikki"
})
//end v1.x content
);


},
'dojox/grid/enhanced/nls/fi-fi/EnhancedGrid':function(){
define('dojox/grid/enhanced/nls/fi-fi/EnhancedGrid',{});
},
'dojox/grid/enhanced/nls/fi/Pagination':function(){
define(
"dojox/grid/enhanced/nls/fi/Pagination", //begin v1.x content
({
	"descTemplate": "${2} - ${3} / ${1} ${0}",
	"firstTip": "Ensimmäinen sivu",
	"lastTip": "Viimeinen sivu",
	"nextTip": "Seuraava sivu",
	"prevTip": "Edellinen sivu",
	"itemTitle": "nimikkeet",
	"singularItemTitle": "kohde",
	"pageStepLabelTemplate": "Sivu ${0}",
	"pageSizeLabelTemplate": "${0} nimikettä sivua kohti",
	"allItemsLabelTemplate": "Kaikki nimikkeet",
	"gotoButtonTitle": "Siirry tietylle sivulle",
	"dialogTitle": "Siirry sivulle",
	"dialogIndication": "Kirjoita sivunumero",
	"pageCountIndication": " (${0} sivua)",
	"dialogConfirm": "Siirry",
	"dialogCancel": "Peruuta",
	"all": "kaikki"
})
//end v1.x content
);

},
'dojox/grid/enhanced/nls/fi-fi/Pagination':function(){
define('dojox/grid/enhanced/nls/fi-fi/Pagination',{});
},
'dojox/form/nls/fi/Uploader':function(){
define(
"dojox/form/nls/fi/Uploader", ({
	label: "Valitse tiedostot..."
})
);

},
'dojox/form/nls/fi-fi/Uploader':function(){
define('dojox/form/nls/fi-fi/Uploader',{});
}}});
define("dojox/nls/dojox_fi-fi", [], 1);
