require({cache:{
'dojox/grid/enhanced/nls/th/Filter':function(){
define(
"dojox/grid/enhanced/nls/th/Filter", ({
	"clearFilterDialogTitle": "ลบตัวกรอง",
	"filterDefDialogTitle": "ตัวกรอง",
	"ruleTitleTemplate": "กฏ ${0}",
	"conditionEqual": "เท่ากับ",
	"conditionNotEqual": "ไม่เท่ากับ",
	"conditionLess": "น้อยกว่า",
	"conditionLessEqual": "น้อยกว่าหรือเท่ากับ",
	"conditionLarger": "มากกว่า",
	"conditionLargerEqual": "มากกว่าหรือเท่ากับ",
	"conditionContains": "ประกอบด้วย",
	"conditionIs": "เป็น",
	"conditionStartsWith": "เริ่มต้นด้วย",
	"conditionEndWith": "ลงท้ายด้วย",
	"conditionNotContain": "ไม่ประกอบด้วย",
	"conditionIsNot": "ไม่",
	"conditionNotStartWith": "ไม่เริ่มต้นด้วย",
	"conditionNotEndWith": "ไม่ลงท้ายด้วย",
	"conditionBefore": "ก่อน",
	"conditionAfter": "หลัง",
	"conditionRange": "ช่วง",
	"conditionIsEmpty": "ว่างอยู่",
	"all": "ทั้งหมด",
	"any": "ใด",
	"relationAll": "กฏทั้งหมด",
	"waiRelAll": "ตรงกับกฏทั้งหมดต่อไปนี้:",
	"relationAny": "กฏใดๆ",
	"waiRelAny": "ตรงกับกฏใดๆต่อไปนี้:",
	"relationMsgFront": "ตรงกัน:",
	"relationMsgTail": "",
	"and": "และ",
	"or": "หรือ",
	"addRuleButton": "เพิ่มกฏ",
	"waiAddRuleButton": "เพิ่มกฏใหม่",
	"removeRuleButton": "ลบกฏ",
	"waiRemoveRuleButtonTemplate": "ลบกฏ ${0}",
	"cancelButton": "ยกเลิก",
	"waiCancelButton": "ยกเลิกไดอะล็อกนี้",
	"clearButton": "ลบ",
	"waiClearButton": "ลบตัวกรอง",
	"filterButton": "ตัวกรอง",
	"waiFilterButton": "ส่งตัวกรอง",
	"columnSelectLabel": "คอลัมน์",
	"waiColumnSelectTemplate": "คอลัมน์สำหรับกฏ ${0}",
	"conditionSelectLabel": "เงื่อนไข",
	"waiConditionSelectTemplate": "เงื่อนไขสำหรับกฏ ${0}",
	"valueBoxLabel": "ค่า",
	"waiValueBoxTemplate": "ป้อนค่าให้กับตัวกรองสำหรับกฏ ${0}",
	"rangeTo": "ถึง",
	"rangeTemplate": "จาก ${0} ถึง ${1}",
	"statusTipHeaderColumn": "คอลัมน์",
	"statusTipHeaderCondition": "กฏ",
	"statusTipTitle": "แถบตัวกรอง",
	"statusTipMsg": "คลิกที่แถบตัวกรองที่นี่เพื่อกรองค่าใน ${0}",
	"anycolumn": "คอลัมน์ใดๆ",
	"statusTipTitleNoFilter": "แถบตัวกรอง",
	"statusTipTitleHasFilter": "ตัวกรอง",
	"statusTipRelAny": "ตรงกับกฏใดๆ",
	"statusTipRelAll": "ตรงกับทุกกฏ",
	"defaultItemsName": "ไอเท็ม",
	"filterBarMsgHasFilterTemplate": "${0} ของ ${1} ${2} จะถูกแสดง",
	"filterBarMsgNoFilterTemplate": "ไม่นำตัวกรองไปใช้",
	"filterBarDefButton": "กำหนดตัวกรอง",
	"waiFilterBarDefButton": "กรองตาราง",
	"a11yFilterBarDefButton": "ตัวกรอง...",
	"filterBarClearButton": "ลบตัวกรอง",
	"waiFilterBarClearButton": "ลบตัวกรอง",
	"closeFilterBarBtn": "ปิดแถบตัวกรอง",
	"clearFilterMsg": "ซึ่งจะลบตัวกรองออกและแสดงเร็กคอร์ดที่พร้อมใช้งานทั้งหมด",
	"anyColumnOption": "คอลัมน์ใดๆ",
	"trueLabel": "จริง",
	"falseLabel": "เท็จ"
})
);

},
'dojox/grid/enhanced/nls/th/EnhancedGrid':function(){
define(
"dojox/grid/enhanced/nls/th/EnhancedGrid", ({
	singleSort: "เรียงลำดับแบบเดี่ยว",
	nestedSort: "เรียงลำดับที่ซับซ้อน",
	ascending: "คลิกเพื่อเรียงจากมากไปน้อย",
	descending: "คลิกเพื่อเรียงจากน้อยไปมาก",
	sortingState: "${0} - ${1}",
	unsorted: "ห้ามเรียงลำดับคอลัมน์นี้",
	indirectSelectionRadio: "แถว ${0}, การเลือกเดียว, กล่องวิทยุ",
	indirectSelectionCheckBox: "แถว ${0}, การเลือกจำนวนมาก, เช็กบ็อกซ์",
	selectAll: "เลือกทั้งหมด"
})
);

},
'dojox/grid/enhanced/nls/th/Pagination':function(){
define(
"dojox/grid/enhanced/nls/th/Pagination", ({
	"descTemplate": "${2} - ${3} จาก ${1} ${0}",
	"firstTip": "หน้าแรก",
	"lastTip": "หน้าสุดท้าย",
	"nextTip": "หน้าถัดไป",
	"prevTip": "หน้าก่อนหน้านี้",
	"itemTitle": "ไอเท็ม",
	"singularItemTitle": "ไอเท็ม",
	"pageStepLabelTemplate": "หน้า ${0}",
	"pageSizeLabelTemplate": "${0} ไอเท็มต่อหน้า",
	"allItemsLabelTemplate": "ไอเท็มทั้งหมด",
	"gotoButtonTitle": "ไปที่หน้าที่ระบุ",
	"dialogTitle": "ไปที่หน้า",
	"dialogIndication": "ระบุหมายเลขหน้า",
	"pageCountIndication": " (${0} หน้า)",
	"dialogConfirm": "ไปที่",
	"dialogCancel": "ยกเลิก",
	"all": "ทั้งหมด"
})
);

},
'dojox/form/nls/th/Uploader':function(){
define(
"dojox/form/nls/th/Uploader", ({
	label: "เลือกไฟล์..."
})
);

}}});
define("dojox/nls/dojox_th", [], 1);
