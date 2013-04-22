/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, sessionStorage */
define([
       'dijit/_TemplatedMixin',
       'dijit/_WidgetsInTemplateMixin',
       'dojo/fx',
       'dojo/date/locale',
       'dijit/_Widget',
       'dijit/form/TimeTextBox',
       'Sage/UI/Calendar',
       'Sage/Utility',
       'dijit/TooltipDialog',
       'dijit/_base/popup',
       'dijit/form/ComboBox',
       'dijit/focus',
       'dojo/data/ItemFileReadStore',
       'dojo/i18n!./nls/DateTimePicker',
       'dojo/json',
       'dojo/_base/lang',
       'dojo/_base/array',
       'dojo/_base/config',
       'dojo/_base/declare',
       'dojo/dom-construct',
       'Sage/Utility/_LocalStorageMixin',
       'dojo/text!./templates/DateTimePicker.html'
],
function (_TemplatedMixin,
    _WidgetsInTemplateMixin,
    fx,
    locale,
    _Widget,
    timeTextBox,
    calendar,
    utility,
    tooltipDialog,
    popup,
    comboBox,
    focusUtil,
    itemFileReadStore,
    nlsStrings,
    json,
    lang,
    array,
    dojoConfig,
    declare,
    domConstruct,
    _localStorageMixin,
    template) {

    var _menu, datePicker, tzDataLoader;

    tzDataLoader = declare('Sage.UI.Controls.DateTimePicker.TimeZoneDataLoader', _localStorageMixin, {
        _requests: [],
        _requestingData: false,
        _tzData: false,
        _storageNamespace: 'DateTimePickerTZ',
        constructor: function () {
            this._requests = [];
            this._requestingData = false;
            this._tzData = false;
        },
        requestTimeZones: function (callback, scope) {
            if (!this._tzData) {
                var data = this.getFromLocalStorage(this._storageNamespace, this._storageNamespace);
                if (data) {
                    this._tzData = json.parse(data);
                } else {
                    this._requests.push({
                        fn: callback,
                        scope: scope || this
                    });
                    if (!this._requestingData) {
                        dojo.xhrGet({
                            url: 'slxdata.ashx/slx/crm/-/timezones/p',
                            handleAs: 'json',
                            load: lang.hitch(this, this._receiveData),
                            error: function (err) {
                            }
                        });
                        this._requestingData = true;
                    }
                    return;
                }
            }
            callback.call(scope || this, this._tzData);
        },
        _receiveData: function (data) {
            this.saveToLocalStorage(this._storageNamespace, json.stringify(data), this._storageNamespace);
            this._tzData = data;
            var len = this._requests.length;
            for (var i = 0; i < len; i++) {
                var clbk = this._requests.pop();
                clbk.fn.call(clbk.scope, data);
            }
        }
    });

    _menu = declare('Sage.UI.Controls._DateTimePickerMenu', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Display properties
        templateString: template,
        widgetsInTemplate: true,
        textAlign: 'left',
        // localized strings
        okText: '',
        cancelText: '',
        convertText: '',
        calculatorText: '',
        timeZoneSourceText: '',
        timeZoneDestText: '',
        // end localize
        id: 'dateTimePickerMenu',
        dir: '',
        _messages: null,
        _started: false,
        _timezonesLoaded: false,
        _timezonesVisible: false,
        displayTime: false,

        constructor: function (options) {
            lang.mixin(this, nlsStrings);
            this.inherited(arguments);
        },
        startup: function () {
            this._started = true;
            this._messages = [];
            this.focus();
            this.inherited(arguments);
        },
        uninitialize: function () {
            this.dateNode.destroy(false);
            this.timeZoneSourceComboNode.destroy(false);
            this.timeZoneDestComboNode.destroy(false);
            this.timeZoneConvertButtonNode.destroy(false);
            this.timeNode.destroy(false);
            this.OKButtonNode.destroy(false);
            this.CancelButtonNode.destroy(false);

            this.inherited(arguments);
        },
        _getUTCDate: function (date) {
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        },
        _okClicked: function (options) {
            this.onExecute();
            this.onOKClicked();
        },
        onOKClicked: function () {
        },
        _onCalendarBlur: function () {
            this.calendarBlur();
        },
        calendarBlur: function () {

        },
        _onValueSelected: function () {
            if (!this.displayTime) {
                this.calendarDateSelected();
                this.onExecute();
            }
        },
        calendarDateSelected: function () {
        },
        _cancelClicked: function () {
            this.onCancel();
            this.onCancelClicked();
        },
        onFocusOut: function () {
            this.onExecute();
        },
        onCancelClicked: function () {
        },
        onCancel: function () {
        },
        onExecute: function () {
        },
        _hideTimeNode: function () {
            //  this._hideNode(this.timeContainer);
            this._hideNode(this.timeZoneContainer);
        },
        _hideDateNode: function () {
            this._hideNode(this.dateContainer);
        },
        _showTimeNode: function () {
            //this._showNode(this.timeContainer);
            this._showNode(this.timeZoneContainer);
        },
        _showDateNode: function () {
            this._showNode(this.dateContainer);
        },
        _hideNode: function (id) {
            dojo.style(id, 'visibility', 'hidden');
            dojo.style(id, 'display', 'none');
        },
        _showNode: function (id) {
            dojo.style(id, 'visibility', 'visible');
            dojo.style(id, 'display', 'block');
        },
        _convertClicked: function () {
            if (!this._timezonesLoaded) {
                return;
            }

            var self = this,
                selectedDate = this.dateNode.get('value'),
                selectedTime = this.timeNode.get('value'),
                selectedSource = this.timeZoneSourceComboNode.get('value'),
                selectedDest = this.timeZoneDestComboNode.get('value'),
                dateString = '',
                returnedDate = null,
                url = 'slxdata.ashx/slx/crm/-/timezones/convertTime?timezoneNameSource=${0}&timezoneNameDest=${1}&date=${2}';

            // Combine date/time into selectedDate
            selectedDate.setHours(selectedTime.getHours());
            selectedDate.setMinutes(selectedTime.getMinutes());
            dateString = selectedDate.toLocaleString();

            dojo.xhrGet({
                url: dojo.string.substitute(url, [escape(selectedSource), escape(selectedDest), dateString]),
                handleAs: 'json',
                load: function (data) {
                    returnedDate = utility.Convert.toDateFromString(data);
                    self.convertResultsNode.innerHTML = locale.format(returnedDate, { fullYear: true });
                },
                error: function (err) {
                    console.error(err);
                }
            });

        },
        processTimeZones: function (data) {
            var items = [];
            var initialValue = utility.getClientContextByKey('userTimeZone');
            array.forEach(data, function (item) {
                if (!item.Displayname || !item.Keyname) {
                    return;
                }
                items.push({
                    id: item.Keyname,
                    text: item.Displayname,
                    offsetHours: item.OffsetHours,
                    offsetMinutes: item.OffsetMinutes
                });
            });

            this.storeData = {
                label: 'text',
                identifier: 'id',
                items: items
            };

            this.timeZoneStore = new itemFileReadStore({
                data: this.storeData
            });

            var self = this;
            this.timeZoneSourceComboNode.set('store', this.timeZoneStore);
            this.timeZoneSourceComboNode.set('searchAttr', 'text');
            //Preselect the current time zone on source combo
            this.timeZoneSourceComboNode.store.fetch(
                {
                    query: { text: initialValue },
                    onComplete: function (items) {
                        self.timeZoneSourceComboNode.setAttribute('item', items[0]);
                    }
                });


            this.timeZoneDestComboNode.set('store', this.timeZoneStore);
            this.timeZoneDestComboNode.set('searchAttr', 'text');
        },
        loadTimeZones: function () {
            if (this._timezonesLoaded) {
                return;
            }
            this._timezonesLoaded = true;
            var loader = new tzDataLoader();
            loader.requestTimeZones(this.processTimeZones, this);
        }
    });

    datePicker = declare('Sage.UI.Controls.DateTimePicker', [comboBox], {
        id: 'dateTimePicker',

        buttonToolTip: 'Calendar',
        toolTip: '',

        // TODO: Add get/set attr
        displayDate: true,
        displayTime: true,

        initialDate: null,
        initialTime: null,
        initialTextValue: '',

        dateFormat: '', // Used for ASP.NET control

        timeZoneStore: null,
        storeData: null,

        dropDown: false,
        _opened: false,

        readOnly: false,
        enabled: true,
        required: false,

        renderAsHyperlink: false,
        shouldPublishMarkDirty: true,
        handles: null,
        store: null,
        dateOnlyHanlde: null,
        documentClickHandle: null,
        dropdownIconClicked: false,
        popupElements: null,
        minDate: null,
        constructor: function (options) {
            //console.log("datetimepicker :: construct"); 
            this.buttonToolTip = nlsStrings.buttonToolTip;

            this.handles = [];
            this.documentClickHandle = [];
            this.dateOnlyHanlde = [];
            this.store = {}; // required by ComboBox - do not remove or IE8 error will occur.

            this.inherited(arguments);
        },
        _onChanged: function (e) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
        },
        uninitialize: function () {
            //console.log('DateTimePicker :: uninitialize');
            this.inherited(arguments);
        },
        startup: function () {
            //console.log("datetimepicker :: startup"); 
            this.inherited(arguments);
            this.dropDown = new _menu({ id: this.id + '_Popout', displayTime: this.displayTime });
            this.handles.push(this.connect(this, 'onChange', this._onChanged));
            this.handles.push(dojo.connect(this.dropDown, 'onOKClicked', this, '_displayCurrentValue'));
            this.handles.push(dojo.connect(this.focusNode, 'onkeyup', this, '_onFocusKeyUp', true));
            this.handles.push(dojo.connect(this.focusNode, 'onblur', this, '_onFocusBlur', true));

            this.focusNode.value = this.initialTextValue;

            var date = utility.Convert.toDateFromString(this.initialDate) || new Date();
            var time = utility.Convert.toDateFromString(this.initialTime) || new Date();

            this.dropDown.dateNode.set('value', date.toDateString());
            this.dropDown.timeNode.set('value', time);

            if (this.displayDate) {
                this.dropDown._showDateNode();
            } else {
                this.dropDown._hideDateNode();
            }

            if (this.displayTime) {
                this.dropDown._showTimeNode();
            } else {
                //Attach event to calendar date select event and assign the date in combobox
                this.dateOnlyHanlde.push(dojo.connect(this.dropDown, 'calendarDateSelected', this, '_displayCurrentValue'));
                this.dropDown._hideTimeNode();
            }

            var nodesList = [];
            //Recursive function to get all child nodes of passed in node
            var getChildElements = function (node) {
                if (node && node.children && node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if (node.children[i])
                            nodesList.push(node.children[i]);
                        getChildElements(node.children[i]);
                    }
                }
                return nodesList;
            };
            //Get the list of all child elements of popup window
            this.popupElements = getChildElements(this.dropDown.domNode);
            this.popupElements.push(this.dropDown.domNode);
            this.popupElements.push(this._buttonNode.parentNode);

            //handle closing the popup
            this.documentClickHandle.push(dojo.connect(document, 'onclick', this, '_documentOnClick'));

            this._setupRenderAsHyperlink();
            this._setupDropDownIcon();
        },
        _documentOnClick: function (evt) {
            // summary:
            //		Handles popup window close on clicking outside popup window
            // description:
            // 		Listen to document click event and close popup if clicked out side
            var e = evt || window.event;
            var element = e.target || e.srcElement;

            //If clicked node is in the list child  nodes, return true
            //Else if there is a parent node, check the parent node(recursive)
            //Else return false
            var isPresent = function (popupElements, node) {
                if (dojo.indexOf(popupElements, node) > -1) {
                    return true;
                } else if (node.parentNode) {
                    return isPresent(popupElements, node.parentNode);
                } else {
                    return false;
                }
            };
            //Timepicker elements and Calendar month labels are dynamic, checking by their class name
            if ((element && element.className &&
                (element.className.indexOf('dijitTimePickerItemInner') > -1 ||
                            element.className.indexOf('dijitCalendarMonthLabel') > -1)) ||
                (element && element.id &&
                        (element.id.indexOf("_Popout-TzSelectSource_popup") > -1 ||
                         element.id.indexOf("_Popout-TzSelectDest_popup") > -1))) {
                //If clicked element is on popup window, stop event
                e.cancelBubble = true;
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                e.preventDefault = true;
            } else {
                //TimeNode popup won't be available during startup
                if (this.dropDown && this.dropDown.timeNode && this.dropDown.timeNode.dropDown) {
                    if (dojo.indexOf(this.popupElements, this.dropDown.timeNode.dropDown.domNode) == -1) {
                        this.popupElements.push(this.dropDown.timeNode.dropDown.domNode);
                    }
                }

                //Check if the clicked node is part of pop up window
                if (!isPresent(this.popupElements, element)) {
                    this.closeDropDown();
                } else {
                    e.cancelBubble = true;
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    e.preventDefault = true;
                }
            }
        },
        _setupDropDownIcon: function () {
            if (this.renderAsHyperlink) {
                return;
            }

            domConstruct.create('div', {
                'class': 'Global_Images icon16x16 icon_Calendar_16x16',
                title: this.buttonToolTip,
                tabIndex: 0
            }, this._buttonNode, 'only');

            dojo.addClass(this._buttonNode, "smCalendarIconTxtBox");

            this.handles.push(this.connect(this._buttonNode, 'ondijitclick', function () {

                if (!this.displayTime) {
                    dojo.style(this.dropDown.domNode, "height", "226px");
                } else {
                    dojo.style(this.dropDown.domNode, "height", "266px");
                }

                if (!this.dropdownIconClicked) {
                    this.openDropDown();
                    this.dropdownIconClicked = true;
                }

            }));
        },
        _displayCurrentValue: function () {
            if (!this._started) {
                return;
            }
            var selectedDate = this.getDateValue(),
                selectedTime = this.getTimeValue(),
                results,
                options = { fullYear: true };

            if (!selectedDate) {
                return;
            }

            selectedDate.setHours(selectedTime.getHours());
            selectedDate.setMinutes(selectedTime.getMinutes());
            selectedDate.setSeconds(selectedTime.getSeconds());

            if (this.displayDate && this.displayTime) {
                options.selector = 'date and time';
            } else if (this.displayDate) {
                options.selector = 'date';
            } else if (this.displayTime) {
                options.selector = 'time';
            }

            results = locale.format(selectedDate, options);

            if (this.renderAsHyperlink) {
                var node = dojo.byId(this.id + '-Link');
                node.innerHTML = results;
            } else {
                this.focusNode.value = results;
            }

            if ((!this.value.getTime) || this.value.getTime() !== selectedDate.getTime()) {
                this.value = selectedDate;
                this.onChange(selectedDate);
            }
        },
        _setupRenderAsHyperlink: function () {
            if (!this.renderAsHyperlink) {
                return;
            }

            // Insert a hyperlink as a replace for the focusNode, make sure it fires open on the dropdown when clicked. Hide other combobox visuals
            // by replacing them.
            dojo.style(this.domNode, 'border', 'none');
            var node = dojo.create('a', { id: this.id + '-Link', innerHTML: this.focusNode.value }, this.domNode, 'only');

            dojo.style(node, 'cursor', 'pointer');
            this.handles.push(dojo.connect(node, 'onclick', this, function () {

                if (!this.displayTime) {
                    dojo.style(this.dropDown.domNode, "height", "226px");
                } else {
                    dojo.style(this.dropDown.domNode, "height", "266px");
                }

                this.openDropDown();
            }));
        },
        loadDropDown: function () {
            // overrides ComboBox
        },
        isLoaded: function () {
            // overrides ComboBox
            return true;
        },
        _setBlurValue: function () {
            // overrides ComboBox
            //console.log('DateTimePicker :: _setBlurValue hit');
        },
        closeDropDown: function () {
            // overrides ComboBox
            popup.close(this.dropDown);
            this._opened = false;
            this.dropdownIconClicked = false;

            //Detach document click event handler when closing window
            dojo.forEach(this.documentClickHandle, function (handle) {
                dojo.disconnect(handle);
            });

        },
        _openResultList: function () {
            // overrides ComboBox
            //console.log('DateTimePicker :: _openResultList hit');
        },
        _showResultList: function () {
            // overrides ComboBox
            //console.log('DateTimePicker :: _showResultList hit');
        },
        _onBlur: function () {
            // TODO: Why is this firing when clicking nodes in the dropdown?
        },
        triggerOnFocusBlur: function (currentLocale) {
            //For unit testing - date input value formatting
            //dojoConfig.locale = currentLocale;
            this._validateInputDate(currentLocale);
        },
        _validateInputDate: function (currentLocale) {
            if (!this._opened && !this.readOnly && this.dropDown && this.focusNode.value !== '') {
                // Combo is not opened, fire okClicked so any connections to it can be notified.

                var text = this.focusNode.value;
                if (text === this.initialTextValue) {
                    return;
                }

                //code = e.charOrCode;
                var parsedDate = null;
                var selectorString = "date";
                if (text.indexOf(":") > 0) {
                    selectorString = "datetime";
                }
                currentLocale = currentLocale || dojoConfig.locale;
                parsedDate = dojo.date.locale.parse(text, { selector: selectorString, locale: currentLocale });
                //console.log("minDate: %o,text: %o,parsedDate : %o,selectorString : %o, locale:%o", this.minDate, text, parsedDate, selectorString, dojoConfig.locale);

                // Only set if we have a valid dropdown and the date is parsed correctly.
                // invalidDate.getDate() will return NaN if invalid.
                if (this.dropDown && parsedDate !== null && isNaN(parsedDate.getDate()) === false) {
                    if (parsedDate.getFullYear() >= (new Date().getFullYear() - 259)) {
                        this.dropDown.dateNode.set('value', parsedDate);
                        this.dropDown.timeNode.set('value', parsedDate);
                    }
                }

                this.dropDown.onOKClicked();
            }
        },
        _onFocusBlur: function () {
            // Focus node onblur event
            //console.log("this._opened :%o,this.MCDropDown :%o,this.focusNode.value:%o", this._opened, this.dropDown, this.focusNode.value);
            this._validateInputDate();
           
            if (this._opened) {
                focusUtil.focus(dojo.query('.dijitCalendarContainer', this.dropDown.dateContainer)[0]);
            }
        },
        _onFocusKeyUp: function (e) {

        },
        _onKey: function (e) {
            // overrides ComboBox
        },
        openDropDown: function () {
            // overrides ComboBox
            this._opened = true;
            var self = this;
            popup.open({
                popup: this.dropDown,
                around: this.domNode,
                onExecute: function () {
                    self.closeDropDown();
                    focusUtil.focus(self.focusNode);
                },
                onCancel: function () {
                    self.closeDropDown();
                    focusUtil.focus(self.focusNode);
                },
                onClose: function () {
                }
            });
            this.documentClickHandle.push(dojo.connect(document, 'onclick', this, '_documentOnClick'));

            if (this.displayTime) {
                this.dropDown.loadTimeZones();
            }

            focusUtil.focus(dojo.query('.dijitCalendarContainer', this.dropDown.dateContainer)[0]);
            popup._stack[0].handlers[0].remove();
        },
        _getUTCDate: function (date) {
            return this.dropDown._getUTCDate(date);
        },
        getDateValue: function () {
            return this.dropDown.dateNode.get('value');
        },
        getTimeValue: function () {
            var timeVal = this.dropDown.timeNode.get('value') || new Date(Date.now());
            if (timeVal) {
                timeVal.setSeconds(this.dropDown.timeNode['seconds'] || 0);
            }

            return timeVal;
        },
        getMinDate: function () {
            this.minDate = Sage.Utility.Activity.formatDateAdd(new Date(), 'year', -259);
            return this.minDate;
        },
        _getValueAttr: function () {
            var d = this.getDateValue();
            var t = this.getTimeValue();
            d.setHours(t.getHours());
            d.setMinutes(t.getMinutes());
            d.setSeconds(t.getSeconds());
            return d;
        },
        _setValueAttr: function (val) {
            if (val && val.toDateString) {
                if (this.dropDown) {
                    this.dropDown.dateNode.set('value', val);
                    this.dropDown.timeNode.set('value', val);
                    this.dropDown.timeNode['seconds'] = val.getSeconds();
                    this._displayCurrentValue();
                }
                if ((!this.value.getTime) || this.value.getTime() !== val.getTime()) {
                    this.value = val;
                    this.onChange(val);
                }
            }
        },
        _setDisplayDateAttr: function (displayDate) {
            this.displayDate = displayDate;
            this._displayCurrentValue();
            if (this.dropDown) {
                if (this.displayDate) {
                    this.dropDown._showDateNode();
                } else {
                    this.dropDown._hideDateNode();
                }
            }
        },
        _getDisplayDateAttr: function () {
            return this.displayDate;
        },
        _setToolTipAttr: function (toolTip) {
            if (toolTip && toolTip !== '') {
                this.set('title', toolTip);
            }
        },
        _getToolTipAttr: function () {
            return this.toolTip;
        },
        _setDisabledAttr: function (disabled) {
            if (disabled) {
                dojo.style(this._buttonNode, 'visibility', 'hidden');
                dojo.style(this._buttonNode, 'display', 'none');
            } else {
                dojo.style(this._buttonNode, 'visibility', '');
                dojo.style(this._buttonNode, 'display', '');
            }
            this.inherited(arguments);
        },
        _setReadOnlyAttr: function (readOnly) {
            if (readOnly) {
                dojo.style(this._buttonNode, 'visibility', 'hidden');
                dojo.style(this._buttonNode, 'display', 'none');
            }
            this.inherited(arguments);
        },
        _setDisplayTimeAttr: function (displayTime) {
            this.displayTime = displayTime;
            this._displayCurrentValue();
            if (this.dropDown) {
                if (this.displayDate) {
                    this.dropDown._showDateNode();
                } else {
                    this.dropDown._hideDateNode();
                }

                //Detach event which sets the selected date when clicking any date in calendar
                dojo.forEach(this.dateOnlyHanlde, function (handle) {
                    dojo.disconnect(handle);
                });

                if (this.displayTime) {
                    this.dropDown.displayTime = true;
                    this.dropDown._showTimeNode();
                } else {
                    this.dropDown.displayTime = false;
                    //Attach event to onclick of any date in calendar to set the date in combo box 
                    this.dateOnlyHanlde.push(dojo.connect(this.dropDown, 'calendarDateSelected', this, '_displayCurrentValue'));
                    //this.dateOnlyHanlde.push(dojo.connect(this.dropDown, 'calendarBlur', this, '_closeDropDownOnDateOnly'));
                    this.dropDown._hideTimeNode();
                }
            }

        },
        _getDisplayTimeAttr: function () {
            return this.displayTime;
        },
        getValueForASPNET: function () {
            // ASP.NET control puts this value into a hidden input
            // format: "Year,Month,Day,Hours,Min"
            var values = [];
            var date = this.getDateValue();
            values.push(date.getFullYear());
            values.push(date.getMonth() + 1);
            values.push(date.getDate());

            var time = this.getTimeValue();
            values.push(time.getHours());
            values.push(time.getMinutes());

            return values.join(',');
        },
        destroy: function () {
            //console.log("datetimepicker :: destroy");
            dojo.forEach(dijit.findWidgets(this.domNode), function (wid) {
                wid.destroy(false);
            });

            dojo.forEach(this.handles, function (handle) {
                dojo.disconnect(handle);
            });

            this.inherited(arguments);
        },

        // OLD script functions
        fmtDateForASPNET: function () {
            var date = this.getDateValue();
            var time = this.getTimeValue();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = time.getHours();
            var minutes = time.getMinutes();

            var result = '';

            if (this.displayDate) {
                var divChar = this.getDivChar();
                var strMon = month;
                var strDat = day;

                if (this.dateFormat.substring(0, 1).toUpperCase() == 'MM') {
                    strMon = (strMon < 10) ? '0' + strMon : strMon;
                }
                if (this.dateFormat.substring(0, 1).toUpperCase == 'DD') {
                    strDat = (strDat < 10) ? '0' + strDat : strDat;
                }

                if (this.dateFormat.substring(0, 1) == 'M' || this.dateFormat.substring(0, 1) == 'm') {
                    result = strMon + divChar + strDat + divChar + date.getFullYear();
                }
                if (this.dateFormat.substring(0, 1) == 'D' || this.dateFormat.substring(0, 1) == 'd') {
                    result = strDat + divChar + strMon + divChar + date.getFullYear();
                }
                if (this.dateFormat.substring(0, 1) == 'Y' || this.dateFormat.substring(0, 1) == 'y') {
                    result = date.getFullYear() + divChar + strMon + divChar + strDat;
                }
                if (this.displayTime) {
                    result += " ";
                }
            }

            if (this.displayTime) {
                var timeDivStr = this.getTimeDivChar();
                var strHour = hours;
                var strMin = minutes;
                if (strMin < 10) { strMin = '0' + strMin; }
                if (this.dateFormat.indexOf('H') > -1) {
                    result += strHour + timeDivStr + strMin;
                } else if (this.dateFormat.indexOf('h') > -1) {
                    var str12Hour = hours;
                    if (this.Hours === 0) {
                        str12Hour = '12';
                    }

                    var strMeridian = 'AM';
                    if (hours >= 12) {
                        if (hours > 12) {
                            str12Hour = (hours - 12);
                        }

                        strMeridian = 'PM';
                    }

                    result += str12Hour + timeDivStr + strMin + " " + strMeridian;
                } else {
                    result += time.toLocaleTimeString();
                }
            }

            return result;
        },
        getDivChar: function () {
            /* this function determines date separator for the date format supplied  */
            var divChar = '';
            for (var i = 0; i < this.dateFormat.length; i++) {
                if (isNaN(this.dateFormat.charAt(i))) {
                    if ((this.dateFormat.charAt(i) < 'A' || this.dateFormat.charAt(i) > 'Z') && (this.dateFormat.charAt(i) < 'a' || this.dateFormat.charAt(i) > 'z')) {
                        divChar = this.dateFormat.charAt(i);
                        break;
                    }
                }
            }
            return divChar;
        },
        getTimeDivChar: function () {
            /* this function determines time separator for the date format supplied  */
            if (this.displayTime) {
                var fmtParts = this.dateFormat.split(" ");
                if (fmtParts.length > 1) {
                    var timeFmt = fmtParts[1];
                    for (var i = 0; i < timeFmt.length; i++) {
                        if (isNaN(timeFmt.charAt(i))) {
                            if ((timeFmt.charAt(i) < 'A' || timeFmt.charAt(i) > 'Z') && (timeFmt.charAt(i) < 'a' || timeFmt.charAt(i) > 'z')) {
                                return timeFmt.charAt(i);
                            }
                        }
                    }
                }
            }
            return ":";
        }
    });


    return datePicker;
});
