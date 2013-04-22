require({cache:{
'dojox/grid/enhanced/nls/fi/Filter':function(){
define(
"dojox/grid/enhanced/nls/fi/Filter", ({
	"clearFilterDialogTitle": "Tyhjennä suodatin",
	"filterDefDialogTitle": "Suodata",
	"ruleTitleTemplate": "Sääntö ${0}",
	"conditionEqual": "on yhtä suuri",
	"conditionNotEqual": "ei ole yhtä suuri",
	"conditionLess": "on pienempi kuin",
	"conditionLessEqual": "pienempi tai yhtä suuri",
	"conditionLarger": "on suurempi kuin",
	"conditionLargerEqual": "suurempi tai yhtä suuri",
	"conditionContains": "sisältää",
	"conditionIs": "on",
	"conditionStartsWith": "alkaa merkillä",
	"conditionEndWith": "loppuu merkkiin",
	"conditionNotContain": "ei sisällä",
	"conditionIsNot": "ei ole",
	"conditionNotStartWith": "ei ala merkillä",
	"conditionNotEndWith": "ei lopu merkkiin",
	"conditionBefore": "ennen",
	"conditionAfter": "jälkeen",
	"conditionRange": "sallittu alue",
	"conditionIsEmpty": "on tyhjä",
	"all": "kaikki",
	"any": "mikä tahansa",
	"relationAll": "kaikki säännöt",
	"waiRelAll": "Vastaa kaikkia seuraavia sääntöjä:",
	"relationAny": "mitkä tahansa säännöt",
	"waiRelAny": "Vastaa jotakin seuraavista säännöistä:",
	"relationMsgFront": "Vastine:",
	"relationMsgTail": "",
	"and": "ja",
	"or": "tai",
	"addRuleButton": "Lisää sääntö",
	"waiAddRuleButton": "Lisää uusi sääntö",
	"removeRuleButton": "Poista sääntö",
	"waiRemoveRuleButtonTemplate": "Poista sääntö ${0}",
	"cancelButton": "Peruuta",
	"waiCancelButton": "Peruuta tämä valintaikkuna",
	"clearButton": "Tyhjennä",
	"waiClearButton": "Tyhjennä suodatin",
	"filterButton": "Suodata",
	"waiFilterButton": "Lähetä suodatin",
	"columnSelectLabel": "Sarake",
	"waiColumnSelectTemplate": "Sarake säännölle ${0}",
	"conditionSelectLabel": "Ehto",
	"waiConditionSelectTemplate": "Ehto säännölle ${0}",
	"valueBoxLabel": "Arvo",
	"waiValueBoxTemplate": "Anna suodatusarvo säännölle ${0}",
	"rangeTo": "-",
	"rangeTemplate": "${0} - ${1}",
	"statusTipHeaderColumn": "Sarake",
	"statusTipHeaderCondition": "Säännöt",
	"statusTipTitle": "Suodatinpalkki",
	"statusTipMsg": "Napsauta suodatinpalkkia tässä ja suodata arvot kohteessa ${0}.",
	"anycolumn": "mikä tahansa sarake",
	"statusTipTitleNoFilter": "Suodatinpalkki",
	"statusTipTitleHasFilter": "Suodata",
	"statusTipRelAny": "Vastaa jotakin sääntöä.",
	"statusTipRelAll": "Vastaa kaikkia sääntöjä.",
	"defaultItemsName": "kohteet",
	"filterBarMsgHasFilterTemplate": "${0} / ${1} ${2} näkyy.",
	"filterBarMsgNoFilterTemplate": "Ei suodatinta käytössä",
	"filterBarDefButton": "Määritä suodatin",
	"waiFilterBarDefButton": "Suodata taulukko",
	"a11yFilterBarDefButton": "Suodata...",
	"filterBarClearButton": "Tyhjennä suodatin",
	"waiFilterBarClearButton": "Tyhjennä suodatin",
	"closeFilterBarBtn": "Sulje suodatinpalkki",
	"clearFilterMsg": "Poistaa suodattimen ja näyttää kaikki käytettävissä olevat tietueet.",
	"anyColumnOption": "Mikä tahansa sarake",
	"trueLabel": "Tosi",
	"falseLabel": "Epätosi"
})
);

},
'dojox/grid/enhanced/nls/fi/EnhancedGrid':function(){
define(
"dojox/grid/enhanced/nls/fi/EnhancedGrid", ({
	singleSort: "Yksinkertainen lajittelu",
	nestedSort: "Sisäkkäinen lajittelu",
	ascending: "Lajittele nousevaan järjestykseen napsauttamalla",
	descending: "Lajittele laskevaan järjestykseen napsauttamalla",
	sortingState: "${0} - ${1}",
	unsorted: "Älä lajittele tätä saraketta",
	indirectSelectionRadio: "Rivi ${0}, yksi valinta, valintanappi",
	indirectSelectionCheckBox: "Rivi ${0}, useita valintoja, valintaruutu",
	selectAll: "Valitse kaikki"
})
);

},
'dojox/grid/enhanced/nls/fi/Pagination':function(){
define(
"dojox/grid/enhanced/nls/fi/Pagination", ({
	"descTemplate": "${2} - ${3} / ${1} ${0}",
	"firstTip": "Ensimmäinen sivu",
	"lastTip": "Viimeinen sivu",
	"nextTip": "Seuraava sivu",
	"prevTip": "Edellinen sivu",
	"itemTitle": "kohteet",
	"singularItemTitle": "kohde",
	"pageStepLabelTemplate": "Sivu ${0}",
	"pageSizeLabelTemplate": "${0} kohdetta sivulla",
	"allItemsLabelTemplate": "Kaikki kohteet",
	"gotoButtonTitle": "Siirry tietylle sivulle",
	"dialogTitle": "Siirry sivulle",
	"dialogIndication": "Määritä sivunumero",
	"pageCountIndication": " (${0} sivua)",
	"dialogConfirm": "Siirry",
	"dialogCancel": "Peruuta",
	"all": "Kaikki"
})
);

},
'dojox/form/nls/fi/Uploader':function(){
define(
"dojox/form/nls/fi/Uploader", ({
	label: "Valitse tiedostot..."
})
);

}}});
define("dojox/nls/dojox_fi", [], 1);
