dojo.provide('Sage.Utility');
dojo.require("dojo.parser");
(function(){
    var nameToPathCache = {};
    var nameToPath = function(name) {
        if (typeof name !== 'string') return [];
        if (nameToPathCache[name]) return nameToPathCache[name];
        var parts = name.split('.');
        var path = [];
        for (var i = 0; i < parts.length; i++)
        {
            var match = parts[i].match(/([a-zA-Z0-9_$]+)\[([^\]]+)\]/);
            if (match)
            {
                path.push(match[1]);
                if (/^\d+$/.test(match[2]))
                    path.push(parseInt(match[2]));
                else
                    path.push(match[2]);
            }
            else
            {
                path.push(parts[i]);
            }
        }
        return (nameToPathCache[name] = path.reverse());
    };

    var getValue = function(o, name, defaultValue) {
        defaultValue = (typeof defaultValue !== 'undefined' && defaultValue !== null) ? defaultValue : '';
        var path = nameToPath(name).slice(0);
        var current = o;
        while (current && path.length > 0)
        {
            var key = path.pop();
            if (typeof current[key] !== 'undefined' && current[key] !== null) current = current[key]; else return defaultValue;
        }
        return current;
    };
    
    var setValue = function(o, name, val) {
        var current = o;
        var path = nameToPath(name).slice(0);
        while ((typeof current !== "undefined") && path.length > 1)
        {
            var key = path.pop();
            if (path.length > 0)
            {
                var next = path[path.length - 1];
                current = current[key] = (typeof current[key] !== "undefined") ? current[key] : (typeof next === "number") ? [] : {};
            }
        }
        if (current != null && typeof path[0] !== "undefined")
            current[path[0]] = val;
        return o;
    };

    /*
    * Original version of .extend from...
    * jQuery 1.2.6 - New Wave Javascript
    *
    * Copyright (c) 2008 John Resig (jquery.com)
    * Dual licensed under the MIT (MIT-LICENSE.txt)
    * and GPL (GPL-LICENSE.txt) licenses.
    *
    * $Date: 2008-05-24 14:22:17 -0400 (Sat, 24 May 2008) $
    * $Rev: 5685 $
    */
    var extend = function () {
        // copy reference to target object
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

        // Handle a deep copy situation
        if (target.constructor == Boolean) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target != "object" && typeof target != "function")
            target = {};

        // Single parameter extends Sage.Utilities 
        if (length == i) {
            target = this;
            --i;
        }

        for (; i < length; i++)
        // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null)
            // Extend the base object
                for (var name in options) {
                    var src = target[name], copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy)
                        continue;

                    // Recurse if we're merging object values
                    if (deep && copy && typeof copy == "object" && !copy.nodeType)
                        target[name] = Sage.Utility.extend(deep,
                    // Never move original objects, clone them
					        src || (copy.length != null ? [] : {})
				        , copy);

                    // Don't bring in undefined values
                    else if (copy !== undefined)
                        target[name] = copy;

                }

        // Return the modified object
        return target;
    };
    
    var getCurrentEntityId = function() {
        var contextservice = Sage.Services.getService('ClientEntityContext');
        var eContext = contextservice.getContext();
        return eContext.EntityId;    
    };

    var getClientContextByKey = function(key) {
      var res = '';
      if (Sage.Services) { 
        var contextservice = Sage.Services.getService("ClientContextService");
        if ((contextservice) && (contextservice.containsKey(key))) {
           res = contextservice.getValue(key);
        } 
      }
      return res;
    };
    
    var getVirtualDirectoryName = function() {
        // returns the name of the virtual directory from the url to the current page.
        var reg = new RegExp(window.location.host + "/([A-Za-z0-9\-_]+)/");
        var arr = reg.exec(window.location.href);
        if (arr)
            return arr[1];
        return '';
    };
    
    var getSDataService = function(contract, keepUnique, useJson) {
        // returns the instance of the service for the specific contract requested.
        // For example, if the data source needs an SData service for the dynamic or system feeds,
        // the code would pass 'dynamic' or 'system' to this method.
        //the proxy datastore needs to always keep it's own unique instance of the service.
        if (contract === 'proxy') {
            keepUnique = true;
        }
        
        contract = contract || 'dynamic';
        var svcKey = "SDataService_" + contract;

        if (Sage.Services.hasService(svcKey) && !keepUnique) {
            return Sage.Services.getService(svcKey);
        }
        
        var bJson = true;
        if (typeof useJson === 'boolean') {
            bJson = useJson;
        }

        svc = new Sage.SData.Client.SDataService({
            serverName: window.location.hostname,
            virtualDirectory: Sage.Utility.getVirtualDirectoryName() + '/slxdata.ashx',
            applicationName: 'slx',
            contractName: contract,
            port: window.location.port && window.location.port != 80 ? window.location.port : false,
            protocol: /https/i.test(window.location.protocol) ? 'https' : false,
            json: bJson //true
        });               
        if (!keepUnique) {
            Sage.Services.addService(svcKey, svc);
        }
        return svc;
    }

    // BEGIN Ajax/Dojo Patch.  Notifies dojo to reparse partial postback content. 
    var appLoadHandler = function (sender, args) {
    	    Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(Sage.Utility.pageLoaded);
    	    Sys.WebForms.PageRequestManager.getInstance().add_pageLoading(Sage.Utility.pageLoading);
    };

    var pageLoaded = function (sender, args) {
        var updatedPanels = args.get_panelsUpdated();
        if (typeof (updatedPanels) === "undefined") {
            return;
        }
        //call the dojo parser on the newly loaded html
        //in each panel so the new elements are instantiated
        for (i = 0; i < updatedPanels.length; i++) {
            dojo.parser.parse(updatedPanels[i]);
        }
    };

    var pageLoading = function (sender, args) {
        var updatedPanels = args.get_panelsUpdating();
        if (typeof (updatedPanels) === "undefined") {
            return;
        }
        //remove all the widgets in the outgoing panel
        //so the dojo parser doesn't throw
        //an error when it reloads them.
        for (i = 0; i < updatedPanels.length; i++) {
            var unloadPanel = dojo.byId(updatedPanels[i].id);
            if (!unloadPanel) {
                continue;
            }

            var nodeList = dojo.query('[widgetId]', unloadPanel);
            dojo.forEach(nodeList, function(widget) { Sage.Utility.destroyWidget(widget) });
        }
    };

    var destroyWidget = function (widget) {
        var widgetId = dojo.attr(widget, 'widgetId');
        if (dijit.byId(widgetId)) {
            dijit.byId(widgetId).destroy(true);
        }
    };
     // END Ajax/Dojo Patch. 

    var getModeId = function () {
    //summary:
    //Retrieves the current mode from the Client Context Service.
        var ctxSvc = Sage.Services.getService('ClientContextService');
            if (ctxSvc) {
                var mode = ctxSvc.getValue('modeid');
                return mode.toLowerCase();
            }
    };

    var isAllowedNavigationKey = function(charCode) {
    return (charCode == 8   // backspace
        || charCode == 9    // tab
        || charCode == 46   // delete
        || charCode == 37   // left arrow
        || charCode == 39); // right arrow
    };

    var restrictDecimalDigit = function (value, decimalDigits, decimalSeparator) {    
        var dif;
        var retVal = value;
        if (typeof decimalDigits === 'undefined') {
            decimalDigits = Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalDigits;
        }
        if (typeof decimalSeparator === 'undefined') {
            decimalSeparator = Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator;
        }
        var restriction = value.lastIndexOf(decimalSeparator) + 1 + decimalDigits;
        if (decimalDigits == 0) {
            restriction = restriction - 1;
        }
        if (value.lastIndexOf(decimalSeparator) > -1) {            
            retVal = value.substr(0, restriction);
        }        
        return retVal;

    };

    var maximizeDecimalDigit = function (value, decimalDigits, decimalSeparator) {    
        var dif;
        var retVal = value;
        if (typeof decimalDigits === 'undefined') {
            decimalDigits = Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalDigits;
        }
        if (typeof decimalSeparator === 'undefined') {
            decimalSeparator = Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator;
        }
        //If there isn't a seperator but we require a decimal digit position, place the seperator before adding digits.
        if (decimalDigits > 0 && value.lastIndexOf(decimalSeparator) == -1 && value.length > 0) { 
            retVal = [value, decimalSeparator].join('');
        }

        var restriction = retVal.lastIndexOf(decimalSeparator) + 1 + decimalDigits;
        if (retVal.lastIndexOf(decimalSeparator) > -1) {            
            diff = restriction - retVal.length ;
            if (diff > 0) {
                for(var i=0; i<diff ;i++){
                    retVal += 0;
                }
            }
        }  
        return retVal;
    };

    var restrictToNumber = function (e, /*currency, number, percent*/ type) {        
        var SystemFormat = Sys.CultureInfo.CurrentCulture.numberFormat;
        var code = e.charCode || e.keyCode;
        var keyChar = e.keyChar;
        
        if (e.keyCode && Sage.Utility.isAllowedNavigationKey(e.keyCode)) return true;
        // 0-9 Keyboard and numberpad.
        if ((code >= 48 && code <= 57) || (code >= 96 && code <= 105)) return true;  
        // Negative, ".", "-"
        if (keyChar === SystemFormat.NegativeSign || code == 109 || code == 110) return true;   
        //Separators
        switch (type)
        {
            case 'currency':
                if (keyChar == SystemFormat.CurrencyGroupSeparator || keyChar == SystemFormat.CurrencyDecimalSeparator) return true;
            break;
            case 'percent':
                if (keyChar == SystemFormat.PercentGroupSeparator || keyChar == SystemFormat.PercentDecimalSeparator) return true;
            break;
            default: //number
                if (keyChar == SystemFormat.NumberGroupSeparator || keyChar == SystemFormat.NumberDecimalSeparator) return true;
            break;
        }
        return false;                 
    };


    var restrictToNumberOnKeyPress = function(e, type) {
        if (e.keyCode && Sage.Utility.isAllowedNavigationKey(e.keyCode)) return true;

        var SystemFormat = Sys.CultureInfo.CurrentCulture.numberFormat;
        var code = e.charCode || e.keyCode;
        var keyChar = String.fromCharCode(code);
        var validChar = '0123456789' + SystemFormat.NegativeSign;
        switch(type) {
            case 'currency':
                validChar += SystemFormat.CurrencyGroupSeparator + SystemFormat.CurrencyDecimalSeparator;
                break;
            case 'percent':
                validChar += SystemFormat.PercentGroupSeparator + SystemFormat.PercentDecimalSeparator;
                break;
            default: //number
                validChar += SystemFormat.NumberGroupSeparator + SystemFormat.NumberDecimalSeparator;
                break;
        }
        return (validChar.indexOf(keyChar) >= 0);
    }

    

    var loadDetailsDialog = function (obj) {
        ClientLinkHandler.request({ request: 'ShowDialog', type: obj.entityType, smartPart: obj.smartPart, entityId: obj.entityId, dialogTitle: obj.dialogTitle, 
            isCentered: obj.isCentered, dialogTop: obj.dialogTop, dialogLeft: obj.dialogLeft, dialogHeight: obj.dialogHeight, dialogWidth: obj.dialogWidth });
    };

 /* ------------------------------------- writeEmail functionality ----------------------------------  */

/**
* Attempt to retrieve a reference to the Outlook application automation interface.
* If one cannot be obtained, return null.
*/
        var getOutlookApplication = function () {
            if (Sage.gears) {
                // Sage - this is preferred, if available, because it will bypass the security dialog
                try {
                    var cf = Sage.gears.factory.create("com.factory");
                    return cf.newActiveXObject("Outlook.Application");
                } catch (e) { }
            }
            // IE
            if (typeof ActiveXObject != "undefined") {
                try {
                    return new ActiveXObject("Outlook.Application");
                } catch (e) { }
            }
            return null;
        };
        /**
        * Add all strings in parts to str
        * @param {String} str - current value we need to add to
        * @param {Array} parts
        * @param {Number} maxLength
        * @param {String} (optional) separator.  Note the separator is not url encoded.
        * @param {bool} (optional) doEncode.  Defaults to true.  If false, strings won't be url encoded.
        * @param {bool} (optional partialOk.  Defaults to true.  If false, only whole strings from the parts array will be included.
        */
        var addUrlComponents = function (str, parts, maxLength, separator, doEncode, partialOk) {
            if (typeof parts == "string")
                parts = [parts];
            if (doEncode === false)
                var encode = function (x) { return x };
            else
                var encode = function (x) { return encodeURIComponent(x) };
            for (var i = 0; i < parts.length && str.length < maxLength; i++) {
                var left = maxLength - str.length;
                var part = parts[i];
                if (i > 0 && separator)
                    left--;
                if (left == 0 || (partialOk === false && left < part.length))
                    continue;
                part = part.substr(0, left);

                var ns = encode(part);
                if (str.length + ns.length > maxLength) {
                    if (partialOk === false)
                        continue;
                    var right = 0;
                    var overflow = ns.length - left;
                    while (overflow > 0) {
                        right++;
                        overflow -= encode(part.charAt(part.length - right)).length;
                    }
                    if (right >= part.length)
                        continue;
                    ns = encode(part.substr(0, part.length - right));
                }
                if (i > 0 && separator)
                    str += separator;
                str += ns;
            }
            return str;
        };
        var olBCC = 3, olCC = 2, olTo = 1;
        var addRecipients = function(message, recipients, type) {
            if (!dojo.isArray(recipients)) {
                recipients = [recipients];
            }
            for (var i = recipients.length - 1; i >= 0; i--) {
                var r = message.Recipients.Add(recipients[i]);
                if ((type === olBCC) || (type === olCC)) {
                    r.Type = type;
                }
            }                
        };
        var flattenRecipients = function(recipients) {
            var retArr = [];
            var flattenItem = function(item) {
            if (typeof item === 'string') {
                    retArr.push(item);
                } else {
                    for (var i = 0; i < item.length; i++) {
                        retArr.push(item[i]);
                    }
                }
            }
            if (typeof recipients === 'string') {
                return [recipients];
            }
            if (dojo.isArray(recipients)) {
                return recipients;
            }
            if (typeof recipients === 'object') {
                if (recipients.hasOwnProperty('to')) {
                    flattenItem(recipients.to);
                }
                if (recipients.hasOwnProperty('cc')) {
                    flattenItem(recipients.cc);
                }
                if (recipients.hasOwnProperty('bcc')) {
                    flattenItem(recipients.bcc);
                }
                return retArr;
            }
        }
        /**
        * writeEmail - generate an email with subject, body and one or more recipients
        * @param {object || array} recipent - if it is a string or array all items are added to the "To"
        *       if it is an object it can have the following properties whose values can be a single string or array of strings: to, cc, bcc
        * @param {string} subject - the subject line of the email
        * @param {string} body - the body of the email can be plain text or html if it is html, use isFormatted
        * @param {bool} isFormatted - if true, the body will be treated as formatted html
        */
        writeEmail = function (recipient, subject, body, isFormatted) {
            /*
                example:

                Sage.Utility.writeEmail(
                    {
                        to: ['bob@mycompany.com', 'sally@mycompany'],
                        cc: 'billy@othercompany.com',
                        bcc: 'mom@hotmail.com'
                    },
                    'This is a good email - read it',
                    'Hello all,<br />This is the <b>best</b> email you have ever gotten.<br /><br /> <span style="font-size:26px;font-weight:bold;">Pass it on to all of your contacts or you will have bad luck.</span>',
                    true);

            */
            var outlook = getOutlookApplication();
            if (outlook) {
                try {
                    var msg = outlook.CreateItem(0);
                    if (subject) {
                        msg.Subject = subject;
                    }
                    if (body) {
                        if (isFormatted) {
                            msg.HTMLBody = body;
                        } else {
                            msg.Body = body;
                        }
                    }
                    if (dojo.isArray(recipient) || (typeof recipient === "string")) {
                        //all recipients are in the "to"
                        // if the recipient is an empty string, outlook throws an exception ("method not supported" ???) but passing a few spaces seems to get past that...
                        if (recipient === '') {
                            recipient = '   ';
                        }
                        addRecipients(msg, recipient, olTo);
                    } else {
                        if (recipient.hasOwnProperty('to')) {
                            addRecipients(msg, recipient.to, olTo);
                        }
                        if (recipient.hasOwnProperty('bcc')) {
                            addRecipients(msg, recipient.bcc, olBCC);
                        }
                        if (recipient.hasOwnProperty('cc')) {
                            addRecipients(msg, recipient.cc, olCC);
                        }
                    }
                    msg.Display();
                    return;
                } catch (e) {
                    // probably they denied some permission in Outlook
                }
            }
            var maxRecipLen = (subject || body) ? 1500 : 2040;
            var recipients = flattenRecipients(recipient);
            var url = addUrlComponents("mailto:", recipients, maxRecipLen, ";", false, false);
            if (subject) {
                url += "?subject=";
                url = addUrlComponents(url, subject, 1700);
            }
            if (body) {
                url += "&body=";
                url = addUrlComponents(url, body, 2000);
            }
            location.href = url;
        };
 /*   ---------------------------------------- end writeEmail ----------------------------------------------- */

 /* Sage.Utility.Convert methods...  */
        convert = function() {
            var trueRE = /^(true|T)$/i,
                isoDate = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|(-|\+)(\d{2}):(\d{2}))/,
                isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/,
                jsonDate = /\/Date\((-?\d+)(?:(-|\+)(\d{2})(\d{2}))?\)\//,
                pad = function(n) { return n < 10 ? '0' + n : n };

            return {
                toBoolean: function(value) {
                    return trueRE.test(value);
                },
                isDateString: function(value) {
                    if (typeof value !== 'string')
                        return false;
            
                    return isoDate.test(value) || isoDateOnly.test(value) || jsonDate.test(value);
                },
                toIsoStringFromDate: function(value) {
                    // adapted from: https://developer.mozilla.org/en/JavaScript/Reference/global_objects/date
                    return value.getUTCFullYear() + '-'
                        + pad(value.getUTCMonth() + 1 ) + '-'
                        + pad(value.getUTCDate()) + 'T'
                        + pad(value.getUTCHours()) + ':'
                        + pad(value.getUTCMinutes()) + ':'
                        + pad(value.getUTCSeconds()) + 'Z';
                },
                toJsonStringFromDate: function(value) {
                    return '/Date(' + value.getTime() + ')/';
                },
                toDateFromString: function(value) {
                    if (typeof value !== 'string')
                        return value;

                    //console.debug("toDateFromString(%o)", value);

                    var match,
                        utc,
                        h, m;

                    if ((match = jsonDate.exec(value)))
                    {
                        utc = new Date(parseInt(match[1]));

                        // todo: may not be needed
                        /*
                        if (match[2])
                        {
                            h = parseInt(match[3]);
                            m = parseInt(match[4]);

                            if (match[2] === '-')
                                utc.addMinutes((h * 60) + m);
                            else
                                utc.addMinutes(-1 * ((h * 60) + m));
                        }
                        */

                        value = utc;

                        //console.debug("jsonDate.exec: %o", value);
                    }
                    else if ((match = isoDate.exec(value)))
                    {
                        utc = new Date(Date.UTC(
                            parseInt(match[1]),
                            parseInt(match[2], 10) - 1, // zero based
                            parseInt(match[3], 10),
                            parseInt(match[4], 10),
                            parseInt(match[5], 10),
                            parseInt(match[6], 10)
                        ));

                        if (match[8] !== 'Z')
                        {
                            h = parseInt(match[10], 10);
                            m = parseInt(match[11], 10);
                    
                            if (match[9] === '-')
                                utc.addMinutes((h * 60) + m);
                            else
                                utc.addMinutes(-1 * ((h * 60) + m));
                        }

                        value = utc;

                        //console.debug("isoDate.exec: %o", value);
                    }
                    else if ((match = isoDateOnly.exec(value))) {
                        value = new Date();
                        value.setYear(parseInt(match[1]));
                        value.setMonth(parseInt(match[2], 10) -1);                       
                        value.setDate(parseInt(match[3], 10));                        
                        value.setHours(0, 0, 0, 0);   
                        /*console.debug("match[1]: %o; match[2]: %o; match[3]: %o", match[1], match[2], match[3]);
                        console.debug("Year: %o; Month: %o; Date: %o", parseInt(match[1]), parseInt(match[2], 10) -1, parseInt(match[3], 10));
                        console.debug("isoDateOnly: %o", value);*/
                    }

                    return value;
                }
            };
        }





    dojo.mixin(Sage.Utility, {
        getValue: getValue,
        setValue: setValue,
        extend: extend,
        getCurrentEntityId: getCurrentEntityId,
        getClientContextByKey: getClientContextByKey,
        getVirtualDirectoryName: getVirtualDirectoryName,
        getSDataService : getSDataService,
        appLoadHandler: appLoadHandler,
        pageLoaded: pageLoaded,
        pageLoading: pageLoading,
        destroyWidget: destroyWidget,
        getModeId: getModeId,
        loadDetailsDialog: loadDetailsDialog,
        restrictToNumber: restrictToNumber,
        restrictToNumberOnKeyPress : restrictToNumberOnKeyPress,
        isAllowedNavigationKey: isAllowedNavigationKey,
        restrictDecimalDigit: restrictDecimalDigit,
        maximizeDecimalDigit: maximizeDecimalDigit,
        writeEmail: writeEmail,
        Convert: convert()
    });
})();

        // Ajax/Dojo Patch.  Notifies dojo to reparse partial postback content.
        dojo.ready(function () {
            Sage.Utility.appLoadHandler();
        });
        // This option did not provide the right timing in all browsers. (IE8 )
        //if (typeof(Sys) != "undefined") {            
        //  Sys.Application.add_load(Sage.Utility.appLoadHandler);
        // }
