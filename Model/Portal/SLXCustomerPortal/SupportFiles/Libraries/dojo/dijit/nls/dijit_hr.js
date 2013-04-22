require({cache:{
'dijit/form/nls/hr/validate':function(){
define(
"dijit/form/nls/hr/validate", ({
	invalidMessage: "Unesena vrijednost nije važeća.",
	missingMessage: "Potrebna je ova vrijednost.",
	rangeMessage: "Ova vrijednost je izvan raspona."
})
);

},
'dijit/_editor/nls/hr/commands':function(){
define(
"dijit/_editor/nls/hr/commands", ({
	'bold': 'Podebljaj',
	'copy': 'Kopiraj',
	'cut': 'Izreži',
	'delete': 'Izbriši',
	'indent': 'Uvuci',
	'insertHorizontalRule': 'Vodoravno ravnalo',
	'insertOrderedList': 'Numerirani popis',
	'insertUnorderedList': 'Popis s grafičkim oznakama',
	'italic': 'Kurziv',
	'justifyCenter': 'Centriraj',
	'justifyFull': 'Poravnaj',
	'justifyLeft': 'Poravnaj lijevo',
	'justifyRight': 'Poravnaj desno',
	'outdent': 'Izvuci',
	'paste': 'Zalijepi',
	'redo': 'Ponovno napravi',
	'removeFormat': 'Ukloni oblikovanje',
	'selectAll': 'Izaberi sve',
	'strikethrough': 'Precrtaj',
	'subscript': 'Indeks',
	'superscript': 'Superskript',
	'underline': 'Podcrtaj',
	'undo': 'Poništi',
	'unlink': 'Ukloni vezu',
	'createLink': 'Kreiraj vezu',
	'toggleDir': 'Prebaci smjer',
	'insertImage': 'Umetni sliku',
	'insertTable': 'Umetni/Uredi tablicu',
	'toggleTableBorder': 'Prebaci rub tablice',
	'deleteTable': 'Izbriši tablicu',
	'tableProp': 'Svojstvo tablice',
	'htmlToggle': 'HTML izvor',
	'foreColor': 'Boja prednjeg plana',
	'hiliteColor': 'Boja pozadine',
	'plainFormatBlock': 'Stil odlomka',
	'formatBlock': 'Stil odlomka',
	'fontSize': 'Veličina fonta',
	'fontName': 'Ime fonta',
	'tabIndent': 'Tabulator uvlačenja',
	"fullScreen": "Prebaci na potpun ekran",
	"viewSource": "Pogledaj HTML izvor",
	"print": "Ispis",
	"newPage": "Nova stranica",
	/* Error messages */
	'systemShortcut': '"${0}" akcija je dostupna jedino u vašem pregledniku upotrebom prečice tipkovnice. Koristite ${1}.',
	'ctrlKey':'ctrl+${0}',
	'appleKey':'\u2318${0}' // "command" or open-apple key on Macintosh
})
);

},
'dijit/nls/hr/loading':function(){
define(
({
	loadingState: "Učitavanje...",
	errorState: "Žao nam je, došlo je do pogreške"
})
);

},
'dijit/form/nls/hr/ComboBox':function(){
define(
({
		previousMessage: "Prethodni izbori",
		nextMessage: "Više izbora"
})
);

},
'dijit/nls/hr/common':function(){
define(
"dijit/nls/hr/common", ({
	buttonOk: "OK",
	buttonCancel: "Opoziv",
	buttonSave: "Spremi",
	itemClose: "Zatvori"
})
);

}}});
define("dijit/nls/dijit_hr", [], 1);
