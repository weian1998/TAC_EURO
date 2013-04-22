/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Utility',
    'Sage/Data/SDataServiceRegistry',
    'Sage/UI/Dialogs',
    'dojo/parser',
    'dojox/validate/regexp',
    'dojo/i18n!./nls/Email'
],
// ReSharper disable InconsistentNaming
function (Utility, SDataServiceRegistry, Dialogs, parser, regexp, nls) {

    Sage.namespace('Utility.Email');
    dojo.mixin(Sage.Utility.Email, {
        resources: nls,
        /* ------------------------------------- writeEmail functionality ----------------------------------  */

        /**
        * writeEmail - generate an email with subject, body and one or more recipients
        * @param {string || object || array [of string] || array [of object]} recipent - if it is a string or array all items are added to the "To"
        *       if it is an object it can have the following properties whose values can be a single string, array of strings, single
        *       object or array of objects: to, cc, bcc
        * @param {string} subject - the subject line of the email
        * @param {string} body - the body of the email can be plain text or html if it is html, use isFormatted
        * @param {bool} isFormatted - if true, the body will be treated as formatted html
        * @param {number} nameOrder - 0 = format name as "John Abbott"; 1 = format name as "Abbott, John"
        */

        /*
        example:
        Sage.Utility.Email.writeEmail(
        {
        to: ['bob@mycompany.com', 'sally@mycompany'],
        cc: 'billy@othercompany.com',
        bcc: 'mom@hotmail.com'
        },
        'This is a good email - read it',
        'Hello all,<br />This is the <b>best</b> email you have ever gotten.<br /><br /> <span style="font-size:26px;font-weight:bold;">Pass it on to all of your contacts or you will have bad luck.</span>',
        true, 1);
        */
        writeEmail: function (recipient, subject, body, isFormatted, nameOrder) {

            if (dojo.isString(recipient) && (recipient.length > 0)) {
                // First, check to see if the recipient string represents a JSON object (such as would be passed when writeEmail is called from code behind).
                // Since we're not expecting JSON every time, there is no need to call JSON.parse for each request.
                if ((recipient.indexOf("{", 0) == 0) && (recipient.lastIndexOf("}") == recipient.length - 1)) {
                    try {
                        var objValue = dojo.fromJson(recipient);
                        if (dojo.isObject(objValue))
                            recipient = objValue;
                    } catch(e) {
                        Dialogs.showError(dojo.substitute(Utility.Email.resources.RecipientInfoError, [e.message]));
                        if (typeof console !== "undefined") {
                            console.error("There was an error attempting to parse the recipient data as JSON: %o", e); //DNL
                            console.error("recipient parameter: %o", recipient); //DNL
                        }
                        return;
                    }
                }
                    // Does the string represent an array passed as a string?
                else if ((recipient.indexOf("[", 0) == 0) && (recipient.lastIndexOf("]") == recipient.length - 1)) {
                    recipient = eval(recipient);
                }
            }

            var self = this;

            require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Service'], function (Helper, DesktopService) {

                // 0 = FirstLast (e.g. John Abbott <jabbot@abbott.demo>)
                // 1 = LastFirst (e.g. Abbott, John <jabbot@abbott.demo>) 
                var iNameOrder = 0;
                if (typeof nameOrder !== "undefined") {
                    if (!isNaN(nameOrder)) {
                        if (Number(nameOrder) == 1)
                            iNameOrder = 1;
                    }
                }
                var olBCC = 3, olCC = 2, olTo = 1; // Microsoft Outlook constants. These constants are also used below generically (for any e-mail client).
                var arrProps = ["to", "cc", "bcc"];
                var iRecipientType = 0;
                var sType = (dojo.isArray(recipient)) ? "array" : typeof recipient;
                var bHasRecipient = (sType !== "undefined") && (recipient != null);

                var oRecipients = {
                    "to": [],
                    "cc": [],
                    "bcc": []
                };

                // Helper function to add the recipient to the correct array (i.e. TO, CC, or BCC).
                var fnAddRecipient = function (type, firstName, lastName, emailAddress) {
                    if (self.isValidEmailAddress(emailAddress || "")) {
                        var fnAddToArray = function (array) {
                            array.push({ "firstName": firstName || "", "lastName": lastName || "", "emailAddress": emailAddress || "" });
                        };
                        switch (type) {
                            case olCC:
                                fnAddToArray(oRecipients.cc);
                                break;
                            case olBCC:
                                fnAddToArray(oRecipients.bcc);
                                break;
                            default:
                                fnAddToArray(oRecipients.to);
                                break;
                        }
                    } else {
                        if (typeof console !== "undefined")
                            console.warn(dojo.string.substitute("Invalid or missing e-mail for ${0} ${1}. E-mail address: ${2}.", [firstName, lastName, emailAddress]));
                    }
                };

                // Parse the recipient parameter and add the corresponding data to the oRecipients object.
                if (bHasRecipient) {
                    var fnAddEmailObj = function (type, email) {
                        if (dojo.isObject(email))
                            fnAddRecipient(type, email.firstName || "", email.lastName || "", email.emailAddress || "");
                    };
                    switch (sType) {
                        case "string":
                            if (recipient != "")
                                fnAddRecipient(olTo, "", "", recipient);
                            break;
                        case "array":
                            dojo.forEach(recipient, function (email) {
                                if (dojo.isString(email))
                                    fnAddRecipient(olTo, "", "", email);
                                else if (dojo.isObject(email))
                                    fnAddEmailObj(olTo, email);
                            });
                            break;
                        case "object":
                            iRecipientType = 0;
                            dojo.forEach(arrProps, function (prop) {
                                iRecipientType++; // olTo = 1; olCC = 2; olBCC = 3                            
                                if (recipient.hasOwnProperty(prop)) {
                                    switch ((dojo.isArray(recipient[prop])) ? "array" : typeof recipient[prop]) {
                                        case "string":
                                            fnAddRecipient(iRecipientType, "", "", recipient[prop]);
                                            break;
                                        case "array":
                                            dojo.forEach(recipient[prop], function (obj) {
                                                if (dojo.isString(obj))
                                                    fnAddRecipient(iRecipientType, "", "", obj);
                                                else if (dojo.isObject(obj))
                                                    fnAddEmailObj(iRecipientType, obj);
                                            });
                                            break;
                                        case "object":
                                            fnAddEmailObj(iRecipientType, recipient[prop]);
                                            break;
                                    }
                                }
                            });
                            break;
                    }
                }

                // Ensure that the recipient parameter is not used incorrectly after this point; the oRecipients object has the data we want now.
                recipient = undefined;

                // Sort proc used for sorting the recipient arrays.
                var fnCompare = function (obj1, obj2) {
                    var iCompare;
                    switch (iNameOrder) {
                        // LastFirst (e.g. Abbott, John <jabbot@abbott.demo>)         
                        case 1:
                            iCompare = (obj1.lastName || "").toLocaleUpperCase().localeCompare((obj2.lastName || "").toLocaleUpperCase());
                            if (iCompare == 0)
                                iCompare = (obj1.firstName || "").toLocaleUpperCase().localeCompare((obj2.firstName || "").toLocaleUpperCase());
                            break;
                        // FirstLast (e.g. John Abbott <jabbot@abbott.demo>)         
                        default:
                            iCompare = (obj1.firstName || "").toLocaleUpperCase().localeCompare((obj2.firstName || "").toLocaleUpperCase());
                            if (iCompare == 0)
                                iCompare = (obj1.lastName || "").toLocaleUpperCase().localeCompare((obj2.lastName || "").toLocaleUpperCase());
                    }
                    return iCompare;
                };

                var iRecipientLength = oRecipients.to.length + oRecipients.cc.length + oRecipients.bcc.length;
                bHasRecipient = (iRecipientLength > 0);

                // Use SageGears with Desktop Integration if it and Microsoft Outlook are available.
                var oService = Helper.GetDesktopService(false /* Do not show an error if the service cannot be loaded. */);
                if (oService) {
                    if (typeof oService.MailMergeGUI !== "undefined") {
                        // Make sure that at least the 8.x version of SLXMMGUIW.DLL being used.
                        if (typeof oService.MailMergeGUI().OutlookIsAvailable !== "undefined" && oService.MailMergeGUI().OutlookIsAvailable) {
                            // SageGears does not like NULL parameters when it's expecting an IDispatch interface, so create an empty array.
                            var arrRecipients = oService.NewActiveXObject("SLXMMGUIW.MultidimensionalArray");
                            var iColumnCount = 4;
                            arrRecipients.Resize(0, iColumnCount);
                            if (bHasRecipient) {
                                arrRecipients.Resize(iRecipientLength, iColumnCount);
                                iRecipientType = 0;
                                var iRow = 0;
                                dojo.forEach(arrProps, function (prop) {
                                    iRecipientType++; // olTo = 1; olCC = 2; olBCC = 3 
                                    var arrRecipientObjs = oRecipients[prop];
                                    if (dojo.isArray(arrRecipientObjs) && arrRecipientObjs.length > 0) {
                                        arrRecipientObjs.sort(fnCompare);
                                        dojo.forEach(arrRecipientObjs, function (obj) {
                                            arrRecipients.SetValue(iRow, 0, obj.firstName || "");
                                            arrRecipients.SetValue(iRow, 1, obj.lastName || "");
                                            arrRecipients.SetValue(iRow, 2, obj.emailAddress || "");
                                            arrRecipients.SetValue(iRow, 3, iRecipientType);
                                            iRow++;
                                        });
                                    }
                                });
                            }
                            var sSubject = (dojo.isString(subject)) ? subject : "";
                            // Note: body can be plain text or HTML (e.g. <HTML>Hello <B>World</B></HTML>).
                            var sBody = (dojo.isString(body)) ? body : "";
                            // Use Extended MAPI to access the Outlook recipients and other properties; if we do not do
                            // this there will be a security prompt, depending on Outlook version and heuristics.                            
                            oService.MailMergeGUI().WriteEmailEx(arrRecipients, sSubject, sBody, iNameOrder);
                            return;
                        } else {
                            if (typeof console !== "undefined") {
                                // SLXMMGUIW.DLL is installed, but it's an older version.
                                if (typeof oService.MailMergeGUI().OutlookIsAvailable === "undefined")
                                    console.error("The request to e-mail could not be processed by Desktop Integration. An older version of SLXMMGUIW.DLL appears to be installed."); //DNL
                                else
                                // If Microsoft Outlook is unavailable.
                                    console.warn("The request to e-mail could not be processed by Desktop Integration. Microsoft Outlook is unavailable."); //DNL
                            }
                        }
                    }
                }

                // If we get this far it means that Desktop Integration was [not] used to create the e-mail message. We'll use the mailto: protocol instead.
                if (typeof console !== "undefined")
                    console.info("Falling back to the mailto: protocol to create the e-mail message."); //DNL

                /*
                //BEGIN Supporting writeEmail functions
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
                    var encode;
                    if (doEncode === false)
                        encode = function (x) { return x; };
                    else
                        encode = function (x) { return encodeURIComponent(x); };
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

                // Format the recipient text as it will appear in the e-mail TO, CC, and BCC fields.
                var fnGetRecipientText = function (firstName, lastName, email) {
                    var sResult = "";
                    var sFirstName = firstName || "";
                    var sLastName = lastName || "";
                    var sEmail = email || "";
                    if (sFirstName != "" && sLastName != "") {
                        // iNameOrder: 0 = FirstLast; 1 = LastFirst.
                        switch (iNameOrder) {
                            case 1:
                                sResult = sLastName + ", " + sFirstName;
                                break;
                            default:
                                sResult = sFirstName + " " + sLastName;
                                break;
                        }
                    } else if (sLastName == "" && sFirstName != "") sResult = sFirstName;
                    else if (sLastName != "" && sFirstName == "") sResult = sLastName;
                    if (sResult == "") return sEmail;
                    sResult = dojo.string.substitute("${0} <${1}>", [sResult, sEmail]);
                    return sResult;
                };

                // Get the recipients for each type (i.e. TO, CC, or BCC).
                var fnGetRecipients = function (type) {
                    var arrMailRecipients = [];
                    var arrRecipientsByType;
                    switch (type) {
                        case olCC:
                            arrRecipientsByType = oRecipients.cc;
                            break;
                        case olBCC:
                            arrRecipientsByType = oRecipients.bcc;
                            break;
                        default:
                            arrRecipientsByType = oRecipients.to;
                            break;
                    }
                    if (dojo.isArray(arrRecipientsByType) && arrRecipientsByType.length > 0) {
                        // Sort the recipients
                        arrRecipientsByType.sort(fnCompare);
                        dojo.forEach(arrRecipientsByType, function (obj) {
                            var sMailTo = fnGetRecipientText(obj.firstName || "", obj.lastName || "", obj.emailAddress || "");
                            arrMailRecipients.push(sMailTo);
                        });
                    }
                    return arrMailRecipients;
                };

                //END Supporting writeEmail functions
                var maxRecipLen = (subject || body) ? 1500 : 2040;
                var arrTo = fnGetRecipients(olTo);
                // To:
                var url = addUrlComponents("mailto:", (dojo.isArray(arrTo) ? arrTo : []), maxRecipLen, ";", false, false);
                var bQueryStringInitialized = false;
                var fnAddParameter = function (param) {
                    var sParam = (bQueryStringInitialized) ? "&" : "?";
                    sParam += param + "=";
                    bQueryStringInitialized = true;
                    return sParam;
                };
                // Subject
                if (dojo.isString(subject) && subject != "") {
                    url += fnAddParameter("subject");
                    url = addUrlComponents(url, subject, 1700);
                }
                // CC:
                var arrCarbonCopy = fnGetRecipients(olCC);
                if (dojo.isArray(arrCarbonCopy) && arrCarbonCopy.length > 0) {
                    url += fnAddParameter("cc");
                    url = addUrlComponents(url, arrCarbonCopy, maxRecipLen, ";", false, false);
                }
                // BCC:
                var arrBlindCopy = fnGetRecipients(olBCC);
                if (dojo.isArray(arrBlindCopy) && arrBlindCopy.length > 0) {
                    url += fnAddParameter("bcc");
                    url = addUrlComponents(url, arrBlindCopy, maxRecipLen, ";", false, false);
                }
                // Body
                if (dojo.isString(body) && body != "") {
                    url += fnAddParameter("body");
                    url = addUrlComponents(url, body, 2000);
                }
                if (typeof console !== "undefined") {
                    console.debug("mailto: protocol URL length = %o", url.length);
                    console.debug("url: %o", url);
                }
                try {
                    location.href = url;
                } catch (e) {
                    //Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIDOMLocation.href]
                    Dialogs.showError(dojo.string.substitute(Utility.Email.resources.MailToProtocolError,
                        [url.length, (typeof e.toMessage == "function") ? e.toMessage() : e.message]));
                }
            });
        }, // End writeEmail

        // isWriteEmailToIdsSupported
        isWriteEmailToIdsSupported: function (maintable) {
            if (!dojo.isString(maintable) || maintable == "") {
                if (typeof console !== "undefined")
                    console.error("The maintable argument is invalid in isWriteEmailToIdsSupported(maintable)."); //DNL
            }
            // Currently only Contact or Lead is supported for writeEmailToIds.               
            var sMainTable = (dojo.isString(maintable)) ? maintable.toUpperCase() : "";
            return (sMainTable == "CONTACT" || sMainTable == "LEAD");
        },

        // isValidEmailAddress
        __emailValidationRegEx: null,
        isValidEmailAddress: function (email) {
            if (this.__emailValidationRegEx === null)
                this.__emailValidationRegEx = new RegExp(dojox.validate.regexp.emailAddress());
            if (dojo.isString(email))
                return this.__emailValidationRegEx.test(email);
            return false;
        },

        // writeEmailToIds
        writeEmailToIds: function (arrEntityIds, maintable, subject, body, nameOrder, emailField) {
            if (!this.isWriteEmailToIdsSupported(maintable)) {
                Dialogs.showError(Utility.Email.resources.InvalidContextError);
                return;
            }
            if (!dojo.isArray(arrEntityIds)) {
                Dialogs.showError(Utility.Email.resources.InvalidArgumentError);
                return;
            }

            var self = this;

            require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Service'], function (Helper, DesktopService) {

                console.debug('in it');

                var sMainTable = maintable.toUpperCase();

                // Remove duplicate entity ids.
                var iDuplicateCount = 0;
                arrEntityIds.sort();
                var arrEntityIdsNoDupes = [];
                dojo.forEach(arrEntityIds, function (id) {
                    if (dojo.indexOf(arrEntityIdsNoDupes, id) == -1)
                        arrEntityIdsNoDupes.push(id);
                    else {
                        iDuplicateCount++;
                        if (typeof console !== "undefined")
                            console.info("Filtering out duplicate entity Id: %o", id);
                    }
                });
                arrEntityIds = arrEntityIdsNoDupes;

                // Quote each id for the SData query.
                dojo.forEach(arrEntityIds, function (id, idx) {
                    arrEntityIds[idx] = "'" + id + "'";
                });

                // Determine the number of HTTP SData requests that will be required.
                // NOTE: SData supports a maximum of 100 items for an IN clause.
                var iRequestCount = 1;
                if (arrEntityIds.length > 100) {
                    iRequestCount = Math.floor(arrEntityIds.length / 100);
                    if ((arrEntityIds.length % 100) != 0)
                        iRequestCount++;
                }

                // 0 = FirstLast; 1 = LastFirst.
                var iNameOrder = 0;
                if (typeof nameOrder !== "undefined") {
                    if (!isNaN(nameOrder)) {
                        if (Number(nameOrder) == 1)
                            iNameOrder = 1;
                    }
                }

                var bIsContactEntity = (sMainTable == "CONTACT");
                var sEmailField = "Email"; //DNL            
                if (dojo.isString(emailField) && emailField != "" && bIsContactEntity) {
                    var sEmailFieldUpper = emailField.toUpperCase();
                    switch (sEmailFieldUpper) {
                        case "SECONDARYEMAIL":
                            sEmailField = "SecondaryEmail"; //DNL
                            if (typeof console !== "undefined")
                                console.info("Using the Contact.SecondaryEmail field."); //DNL
                            break;
                        case "EMAIL3":
                            sEmailField = "Email3"; //DNL
                            if (typeof console !== "undefined")
                                console.info("Using the Contact.Email3 field."); //DNL
                            break;
                        default:
                            if (sEmailFieldUpper != "EMAIL")
                                if (typeof console !== "undefined")
                                    console.warn("Invalid Contact e-mail field: %o", sEmailField); //DNL
                            if (typeof console !== "undefined")
                                console.log("Using the Contact.Email field."); //DNL
                            break;
                    }
                }

                var iMissingOrInvalidEmailCount = 0; // The number of entities that had an invaild or missing e-mail address.
                var iCannotSolicitCount = 0; // The number of entities that were marked DoNotEmail or DoNotSolicit.
                var iRequest; // The current request.
                var iResponseCount = 0; // The number of successful HTTP responses.

                var oSelectedEntities = { "data": [] }; // Temporary entity store.            
                var fnAddEntityData = function (key, firstName, lastName, emailAddress) {
                    oSelectedEntities.data.push({ "key": key || "", "firstName": firstName || "", "lastName": lastName || "", "emailAddress": emailAddress || "" });
                };

                // Desktop Integration
                var oService = Helper.GetDesktopService(false /* Do not show an error if the service cannot be loaded. */);

                // Process each SData request.
                for (iRequest = 0; iRequest < iRequestCount; iRequest++) {
                    var fnProcessRequest = function () {
                        var iArraySize = 100;
                        if (arrEntityIds.length < 100)
                            iArraySize = arrEntityIds.length;
                        var arrRequestIds = new Array(iArraySize);
                        var iEntityId;
                        for (iEntityId = 0; iEntityId < iArraySize; iEntityId++)
                            arrRequestIds[iEntityId] = arrEntityIds.shift();
                        var sFmtString = (arrRequestIds.length > 1) ? "Id in (${0})" : "Id eq ${0}";
                        var sWhere = dojo.string.substitute(sFmtString, [arrRequestIds.join(",")]);
                        var oSDataService = Sage.Data.SDataServiceRegistry.getSDataService("dynamic");
                        var oSDataRequest = new Sage.SData.Client.SDataResourceCollectionRequest(oSDataService);
                        oSDataRequest.setResourceKind((sMainTable == "LEAD") ? "leads" : "contacts");
                        var sFields = "FirstName,LastName,DoNotSolicit,DoNotEmail," + sEmailField;
                        oSDataRequest.setQueryArg("select", sFields);
                        oSDataRequest.setQueryArg("where", sWhere);
                        oSDataRequest.read({
                            httpMethodOverride: true,
                            success: function (data) {
                                iResponseCount++;
                                var oResources = (typeof data !== "undefined" && data != null) ? data["$resources"] : null;
                                if (dojo.isArray(oResources) && oResources.length > 0) {
                                    var iEntity;
                                    for (iEntity = 0; iEntity < oResources.length; iEntity++) {
                                        var sEntityId = oResources[iEntity].$key || "";
                                        var sEmailAddress;
                                        switch (sEmailField) {
                                            case "SecondaryEmail":
                                                //DNL
                                                sEmailAddress = oResources[iEntity].SecondaryEmail || "";
                                                break;
                                            case "Email3":
                                                //DNL
                                                sEmailAddress = oResources[iEntity].Email3 || "";
                                                break;
                                            default:
                                                sEmailAddress = oResources[iEntity].Email || "";
                                                break;
                                        }
                                        var sFirstName = oResources[iEntity].FirstName || "";
                                        var sLastName = oResources[iEntity].LastName || "";
                                        var bDoNotEmail = oResources[iEntity].DoNotEmail || false;
                                        var bDoNotSolicit = oResources[iEntity].DoNotSolicit || false;
                                        if (sEmailAddress != "" && self.isValidEmailAddress(sEmailAddress) && !bDoNotEmail && !bDoNotSolicit)
                                            fnAddEntityData(sEntityId, sFirstName, sLastName, sEmailAddress);
                                        else {
                                            if (bDoNotEmail || bDoNotSolicit) {
                                                iCannotSolicitCount++;
                                                if (typeof console !== "undefined")
                                                    console.warn(dojo.string.substitute("Cannot solicit ${0} ${1} (${2}).", [sFirstName, sLastName, sEntityId]));
                                            } else {
                                                iMissingOrInvalidEmailCount++;
                                                if (typeof console !== "undefined")
                                                    console.warn(dojo.string.substitute("Invalid e-mail for ${0} ${1} (${2}). E-mail address: ${3}.", [sFirstName, sLastName, sEntityId, sEmailAddress]));
                                            }
                                        }
                                    }
                                }
                                // Has the FINAL SData response been processed?
                                if (iResponseCount == iRequestCount) {
                                    var sExclusions = null;
                                    if (iCannotSolicitCount > 0 || iMissingOrInvalidEmailCount > 0 || iDuplicateCount > 0)
                                        sExclusions = dojo.string.substitute(Utility.Email.resources.FilteredOutMsg, [iCannotSolicitCount, iMissingOrInvalidEmailCount, iDuplicateCount]);
                                    var enumRecipientType = {
                                        rtTo: 0,
                                        rtCC: 1,
                                        rtBCC: 2
                                    };
                                    var oRecipients = {
                                        "to": [],
                                        "cc": [],
                                        "bcc": []
                                    };
                                    // Add the recipient to one of the arrays in oRecipients.
                                    var fnAddRecipient = function (type, firstName, lastName, emailAddress) {
                                        var fnAddToArray = function (array) {
                                            array.push({ "firstName": firstName || "", "lastName": lastName || "", "emailAddress": emailAddress || "" });
                                        };
                                        switch (type) {
                                            case enumRecipientType.rtCC:
                                                fnAddToArray(oRecipients.cc);
                                                break;
                                            case enumRecipientType.rtBCC:
                                                fnAddToArray(oRecipients.bcc);
                                                break;
                                            default:
                                                // enumRecipientType.rtTo
                                                fnAddToArray(oRecipients.to);
                                                break;
                                        }
                                    };
                                    var oRecipient;
                                    if (oSelectedEntities.data.length > 1) {
                                        if (iMissingOrInvalidEmailCount > 0)
                                            if (typeof console !== "undefined")
                                                console.warn(dojo.string.substitute("Total number of entities that had an invalid or missing e-mail address: ${0}. These entities have been excluded.", [iMissingOrInvalidEmailCount])); //DNL
                                        if (iCannotSolicitCount > 0)
                                            if (typeof console !== "undefined")
                                                console.warn(dojo.string.substitute("Total number of entities that were marked as DoNotEmail or DoNotSolicit: ${0}. These entities have been excluded.", [iCannotSolicitCount])); //DNL
                                        if (iDuplicateCount > 0)
                                            if (typeof console !== "undefined")
                                                console.info(dojo.string.substitute("Total number of entities excluded because they were duplicates: ${0}.", [iDuplicateCount])); //DNL
                                        var i;
                                        // If Desktop Integration is available we'll prompt the user with the selection dialog.                                    
                                        if (oService) {
                                            var oSelectEmailInfo = new Sage.SelectEmailInfo();
                                            dojo.forEach(oSelectedEntities.data, function (entity) {
                                                oSelectEmailInfo.AddInfo("", "", entity.key, entity.emailAddress, entity.firstName, entity.lastName, "", "", false);
                                            });
                                            var sStatusText = (dojo.isString(sExclusions)) ? sExclusions : "";
                                            // NOTE: The oService.SelectEmailNames() dialog filters out duplicate entity ids and the entities will be sorted.
                                            var oSelectedInfo = oService.SelectEmailNames(oSelectEmailInfo, MaxTo.maxNoMax, sStatusText);
                                            if (oSelectedInfo != null && oSelectedInfo.Recipients.length > 0) {
                                                for (i = 0; i < oSelectedInfo.Recipients.length; i++) {
                                                    oRecipient = oSelectedInfo.Recipients[i];
                                                    // Note: CASE is different between Desktop Integration and non-Desktop Integration.
                                                    fnAddRecipient(oRecipient.Type, oRecipient.FirstName, oRecipient.LastName, oRecipient.EmailAddress);
                                                }
                                            } else
                                            // The user canceled or did not select any entities.
                                                return;
                                        }
                                        // NON-Desktop Integration. In the future we may create a dojo based dialog.
                                        else {
                                            dojo.forEach(oSelectedEntities.data, function (entity) {
                                                // Note: CASE is different between Desktop Integration and non-Desktop Integration.
                                                fnAddRecipient(enumRecipientType.rtTo, entity.firstName, entity.lastName, entity.emailAddress);
                                            });
                                        }
                                    } else {
                                        if (oSelectedEntities.data.length == 1) {
                                            oRecipient = oSelectedEntities.data[0];
                                            // Note: CASE is different between Desktop Integration and non-Desktop Integration.
                                            fnAddRecipient(enumRecipientType.rtTo, oRecipient.firstName, oRecipient.lastName, oRecipient.emailAddress);
                                        } else {
                                            var sFailureMsg = Utility.Email.resources.AllInvalidEmailError;
                                            if (bIsContactEntity && sEmailField != "Email") //DNL
                                                sFailureMsg += dojo.string.substitute(" " + Utility.Email.resources.EmailFieldQueried, ["Contact." + sEmailField]);
                                            Dialogs.showInfo(sFailureMsg);
                                            return;
                                        }
                                    }
                                    var sSubject = (dojo.isString(subject)) ? subject : "";
                                    // Note: body can be plain text or HTML (e.g. <HTML>Hello <B>World</B></HTML>).                                                   
                                    var sBody = (dojo.isString(body)) ? body : "";
                                    // "<HTML></HTML>"
                                    var bFormatted = (sBody.length > 13) ? (sBody.indexOf("<HTML", sBody.substring(0, 4).toUpperCase()) == 0) : false;
                                    self.writeEmail(oRecipients, sSubject, sBody, bFormatted, iNameOrder);
                                }
                            },
                            failure: function (xhr, sdata) {
                                var options = { message: Utility.Email.resources.EntityInfoError };
                                Utility.ErrorHandler.handleHttpError(xhr, sdata, options);
                            },
                            scope: this
                        });
                    };
                    fnProcessRequest();
                }
            });
        }, // End writeEmailToIds

        // writeEmailToGroupSelection
        writeEmailToGroupSelection: function (subject, body, nameOrder, emailField) {
            if (Utility.getModeId() != "list") {
                Dialogs.showInfo(Utility.Email.resources.CapabilityModeError);
                return;
            }
            var oGroupContext = Sage.Services.getService("ClientGroupContext");
            if (!dojo.isObject(oGroupContext)) return;
            var sMainTable = oGroupContext.getContext().CurrentTable;
            if (!this.isWriteEmailToIdsSupported(sMainTable)) {
                Dialogs.showError(Utility.Email.resources.CapabilityEntityError);
                return;
            }
            var oPanel = dijit.byId("list");
            if (!dojo.isObject(oPanel)) return;
            var oSelectionInfo = oPanel.getSelectionInfo();
            if (!dojo.isObject(oSelectionInfo) || !oSelectionInfo.hasOwnProperty("selectionCount") || oSelectionInfo.selectionCount <= 0) {
                Dialogs.showInfo(Utility.Email.resources.NoRowsSelectedError);
                return;
            }
            var arrEntityIds = new Array(oSelectionInfo.selections.length);
            dojo.forEach(oSelectionInfo.selections, function (item, idx) {
                arrEntityIds[idx] = item.id;
            });
            this.writeEmailToIds(arrEntityIds, sMainTable, subject, body, nameOrder, emailField);
        }
    });

    return Sage.Utility.Email;
});