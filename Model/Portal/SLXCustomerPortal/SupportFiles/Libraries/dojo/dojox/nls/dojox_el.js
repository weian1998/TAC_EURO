require({cache:{
'dojox/grid/enhanced/nls/el/Filter':function(){
define(
"dojox/grid/enhanced/nls/el/Filter", ({
	"clearFilterDialogTitle": "Εκκαθάριση φίλτρου",
	"filterDefDialogTitle": "Φίλτρο",
	"ruleTitleTemplate": "Κανόνας ${0}",
	"conditionEqual": "ίσο",
	"conditionNotEqual": "όχι ίσο",
	"conditionLess": "είναι μικρότερο από",
	"conditionLessEqual": "μικρότερο ή ίσο",
	"conditionLarger": "είναι μεγαλύτερο από",
	"conditionLargerEqual": "μεγαλύτερο ή ίσο",
	"conditionContains": "περιέχει",
	"conditionIs": "είναι",
	"conditionStartsWith": "αρχίζει από",
	"conditionEndWith": "τελειώνει σε",
	"conditionNotContain": "δεν περιέχει",
	"conditionIsNot": "δεν είναι",
	"conditionNotStartWith": "δεν αρχίζει από",
	"conditionNotEndWith": "δεν τελειώνει σε",
	"conditionBefore": "πριν",
	"conditionAfter": "μετά",
	"conditionRange": "εύρος",
	"conditionIsEmpty": "είναι κενό",
	"all": "όλα",
	"any": "οποιοδήποτε",
	"relationAll": "όλοι οι κανόνες",
	"waiRelAll": "Αντιστοιχία με όλους τους παρακάτω κανόνες:",
	"relationAny": "οποιοσδήποτε κανόνας",
	"waiRelAny": "Αντιστοιχία με οποιονδήποτε από τους παρακάτω κανόνες:",
	"relationMsgFront": "Επιστροφή:",
	"relationMsgTail": "",
	"and": "και",
	"or": "ή",
	"addRuleButton": "Προσθήκη κανόνα",
	"waiAddRuleButton": "Προσθήκη νέου κανόνα",
	"removeRuleButton": "Αφαίρεση κανόνα",
	"waiRemoveRuleButtonTemplate": "Αφαίρεση κανόνα ${0}",
	"cancelButton": "Ακύρωση",
	"waiCancelButton": "Ακύρωση αυτού του πλαισίου διαλόγου",
	"clearButton": "Εκκαθάριση",
	"waiClearButton": "Εκκαθάριση του φίλτρου",
	"filterButton": "Φίλτρο",
	"waiFilterButton": "Υποβολή του φίλτρου",
	"columnSelectLabel": "Στήλη",
	"waiColumnSelectTemplate": "Στήλη για τον κανόνα ${0}",
	"conditionSelectLabel": "Συνθήκη",
	"waiConditionSelectTemplate": "Συνθήκη για τον κανόνα ${0}",
	"valueBoxLabel": "Τιμή",
	"waiValueBoxTemplate": "Καταχωρήστε τιμή φίλτρου για τον κανόνα ${0}",
	"rangeTo": "έως",
	"rangeTemplate": "από ${0} έως ${1}",
	"statusTipHeaderColumn": "Στήλη",
	"statusTipHeaderCondition": "Κανόνες",
	"statusTipTitle": "Γραμμή φίλτρου",
	"statusTipMsg": "Πατήστε στη γραμμή φίλτρου για φιλτράρισμα με βάση τις τιμές στο ${0}.",
	"anycolumn": "οποιαδήποτε στήλη",
	"statusTipTitleNoFilter": "Γραμμή φίλτρου",
	"statusTipTitleHasFilter": "Φίλτρο",
	"statusTipRelAny": "Αντιστοιχία με οποιουσδήποτε κανόνες.",
	"statusTipRelAll": "Αντιστοιχία με όλους τους κανόνες.",
	"defaultItemsName": "στοιχεία",
	"filterBarMsgHasFilterTemplate": "Εμφανίζονται ${0} από ${1} ${2}.",
	"filterBarMsgNoFilterTemplate": "Δεν έχει εφαρμοστεί φίλτρο",
	"filterBarDefButton": "Ορισμός φίλτρου",
	"waiFilterBarDefButton": "Φιλτράρισμα του πίνακα",
	"a11yFilterBarDefButton": "Φιλτράρισμα...",
	"filterBarClearButton": "Εκκαθάριση φίλτρου",
	"waiFilterBarClearButton": "Εκκαθάριση του φίλτρου",
	"closeFilterBarBtn": "Κλείσιμο γραμμής φίλτρου",
	"clearFilterMsg": "Με την επιλογή αυτή θα αφαιρεθεί το φίλτρο και θα εμφανιστούν όλες οι διαθέσιμες εγγραφές.",
	"anyColumnOption": "Οποιαδήποτε στήλη",
	"trueLabel": "Αληθές",
	"falseLabel": "Ψευδές"
})
);

},
'dojox/grid/enhanced/nls/el/EnhancedGrid':function(){
define(
"dojox/grid/enhanced/nls/el/EnhancedGrid", ({
	singleSort: "Απλή ταξινόμηση",
	nestedSort: "Ένθετη ταξινόμηση",
	ascending: "Πατήστε εδώ για ταξινόμηση σε αύξουσα σειρά",
	descending: "Πατήστε εδώ για ταξινόμηση σε φθίνουσα σειρά",
	sortingState: "${0} - ${1}",
	unsorted: "Χωρίς ταξινόμηση αυτής της στήλης",
	indirectSelectionRadio: "Γραμμή ${0}, μία επιλογή, κουμπί επιλογής",
	indirectSelectionCheckBox: "Γραμμή ${0}, πολλαπλές επιλογές, τετραγωνίδιο επιλογής",
	selectAll: "Επιλογή όλων"
})
);

},
'dojox/grid/enhanced/nls/el/Pagination':function(){
define(
"dojox/grid/enhanced/nls/el/Pagination", ({
	"descTemplate": "${2} - ${3} από ${1} ${0}",
	"firstTip": "Πρώτη σελίδα",
	"lastTip": "Τελευταία σελίδα",
	"nextTip": "Επόμενη σελίδα",
	"prevTip": "Προηγούμενη σελίδα",
	"itemTitle": "στοιχεία",
	"singularItemTitle": "στοιχείο",
	"pageStepLabelTemplate": "Σελίδα ${0}",
	"pageSizeLabelTemplate": "${0} στοιχεία ανά σελίδα",
	"allItemsLabelTemplate": "Όλα τα στοιχεία",
	"gotoButtonTitle": "Μετάβαση σε συγκεκριμένη σελίδα",
	"dialogTitle": "Μετάβαση σε σελίδα",
	"dialogIndication": "Καθορίστε τον αριθμό της σελίδας",
	"pageCountIndication": " (${0} σελίδες)",
	"dialogConfirm": "Μετάβαση",
	"dialogCancel": "Ακύρωση",
	"all": "Όλα"
})
);

},
'dojox/form/nls/el/Uploader':function(){
define(
"dojox/form/nls/el/Uploader", ({
	label: "Επιλογή αρχείων..."
})
);

}}});
define("dojox/nls/dojox_el", [], 1);
