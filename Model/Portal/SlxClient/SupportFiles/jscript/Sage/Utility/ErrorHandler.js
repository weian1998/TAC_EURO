/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Utility',
        'Sage/UI/Dialogs',
        'dojo/io-query',
        'dojo/string',
        'dojo/_base/array'
    ],
//TODO: Localization
// ReSharper disable InconsistentNaming
    function (Utility, Dialogs, ioQuery, dString, array) {
        // ReSharper restore InconsistentNaming
        Sage.namespace('Utility.ErrorHandler');
        dojo.mixin(Sage.Utility.ErrorHandler, {
            _debugEndRequest: false, // Set to true for development only.
            _configuration: {
                isDebug: false /* See base.master for isDebug setting. */,
                preemption: {
                    enabled: true,
                    allowAuthRedirect: true,
                    handledStatusCodes: "577,578,579,580,581,582",
                    showPreemptedErrorMsg: false,
                    showInternalServerErrorMsg: false,
                    showUnhandledMessagingServiceExceptionMsg: true
                },
                authenticationRedirectUrl: null,
                showExtendedValidationException: false,
                showExtendedRoleAccessDeniedException: false
            },
            _fmtSlxErrorId: function (slxErrorId) {
                if (Sage.Utility.isStringWithLength(slxErrorId)) {
                    if (this._configuration.isDebug) {
                        return dString.substitute("\r\n\r\nSalesLogix Error Id: <a href=\"SLXErrorLookupService.asmx/GetEventLogError?slxErrorId=${0}\" target=\"_blank\">${0}</a>",
                            [slxErrorId]);
                    } else {
                        return dString.substitute("\r\n\r\nSalesLogix Error Id: ${0}", [slxErrorId]);
                    }
                }
                return "";
            },
            _fmtStackTrace: function (stackTrace) {
                if (this._configuration.isDebug && Sage.Utility.isStringWithLength(stackTrace)) {
                    var stack = Sage.Utility.htmlEncode(stackTrace).replace(/(\r\n)/g, "&#13;&#10;").trim();
                    return dString.substitute("\r\n\r\nStack trace:\r\n<textarea id=\"StackTrace\" cols=\"20\" name=\"StackTrace\" readonly=\"readonly\" rows=\"1\" style=\"width: 100%; height: 200px; font-family: 'Courier New', Courier, monospace; font-size: small; background-color: #F2F2F2; color: #444444; 1px: ; opacity: 0.8; -moz-box-sizing: border-box; box-sizing: border-box;\" unselectable=\"off\" wrap=\"off\">${0}</textarea>", [stack]);
                }
                return "";
            },
            _mixinConfig: function () {
                if (window.errorHandlerConfig && typeof window.errorHandlerConfig === "object") {
                    dojo.mixin(this._configuration, window.errorHandlerConfig);
                }
            },
            _preemptError: function (xhr, o) {
                try {
                    var oHttpInfo = this.getHttpStatusInfo(xhr, o);
                    if (this._configuration.isDebug && typeof console !== "undefined") {
                        console.debug("Sage.Utility.ErrorHandler._preemptError: xhr=%o; o=%o; oHttpInfo=%o", xhr, o, oHttpInfo);
                    }
                    if (!(oHttpInfo && typeof oHttpInfo === "object" && oHttpInfo.hasOwnProperty("sdataError"))) {
                        return false;
                    }
                    var fnGetHeaderValue = function (response, header) {
                        if (response && typeof response === "object" && typeof xhr.getResponseHeader !== "undefined" && header && dojo.isString(header)) {
                            var sUrl = response.getResponseHeader(header);
                            if (sUrl && Sage.Utility.isStringWithLength(sUrl)) {
                                return sUrl;
                            }
                        }
                        return null;
                    };
                    var fnGetExceptionRedirect = function (response) {
                        return fnGetHeaderValue(response, "Sage-SalesLogix-Exception-Redirect");
                    };
                    var fnGetSalesLogixErrorId = function (response) {
                        return fnGetHeaderValue(response, "Sage-SalesLogix-Error-Id");
                    };
                    var fnRedirect = function (url) {
                        if (typeof console !== "undefined") {
                            console.debug("Redirecting to %o", url);
                        }
                        window.location = url;
                    };
                    var sRedirect;

                    // First, check to see if we have an SData Diagnoses that was sent via the UnhandledMessagingServiceException handler.
                    if ((this.isSDataExceptionDiagnoses(oHttpInfo.sdataError.applicationCode) && (oHttpInfo.status == 500) &&
                        this._configuration.preemption.showUnhandledMessagingServiceExceptionMsg)) {
                        this.showStatusInfoError(oHttpInfo);
                        return true;
                    }

                    switch (oHttpInfo.status) {
                        case 401:
                            // 401: Unauthorized
                            if (typeof console !== "undefined") {
                                console.error("Unauthorized (401): %o", oHttpInfo.url);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 403:
                            // 403: Forbidden (used in many HttpHanders when IAuthenticationProvider::IsAuthenticated returns false). 
                            // NOTE: Only redirect if the HTTP response was coming from the current client.
                            if (typeof console !== "undefined") {
                                console.error("Forbidden (403): %o", oHttpInfo.url);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 404:
                            // 404: Not Found 
                            if (typeof console !== "undefined") {
                                console.error("Not Found (404): %o", oHttpInfo.url);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 408:
                            // 408: Request Timeout (this type of error is not handled anywhere else).
                            if (typeof console !== "undefined") {
                                console.error("Request Timeout: %o", oHttpInfo.url);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 500:
                            if (typeof console !== "undefined") {
                                console.error("Internal Server Error (500) - HTTP Info: %o", oHttpInfo);
                            }
                            if ((this.isSDataExceptionDiagnoses(oHttpInfo.sdataError.applicationCode) &&
                            this._configuration.preemption.showUnhandledMessagingServiceExceptionMsg) ||
                                this._configuration.preemption.showInternalServerErrorMsg) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 575:
                            // AuthTokenNullException
                            if (typeof console !== "undefined") {
                                console.error("AuthTokenNullException (575) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this._configuration.preemption.allowAuthRedirect) {
                                sRedirect = fnGetExceptionRedirect(xhr);
                                if (sRedirect !== null) {
                                    fnRedirect(sRedirect);
                                    return true;
                                }
                            }
                            return false;
                        case 576:
                            // BaseException (i.e. Exception.GetBaseException())                    
                            if (typeof console !== "undefined") {
                                console.error("BaseException (576) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this._configuration.preemption.showPreemptedErrorMsg) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 577:
                            // RoleAccessDeniedException
                            if (typeof console !== "undefined") {
                                console.error("RoleAccessDeniedException (577) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 578:
                            // ValidationException
                            if (typeof console !== "undefined") {
                                console.error("ValidationException (578) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 579:
                            // UserObservableException
                            if (typeof console !== "undefined") {
                                console.error("UserObservableException (579) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 580:
                            // HttpRequestValidationException
                            if (typeof console !== "undefined") {
                                console.error("HttpRequestValidationException (580) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 581:
                            // StringOrBinaryDataWouldBeTruncatedException (OleDbException)
                            if (typeof console !== "undefined") {
                                console.error("StringOrBinaryDataWouldBeTruncatedException (581) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        case 582:
                            // AccessException
                            if (typeof console !== "undefined") {
                                console.error("AccessException (582) - SalesLogix Error Id: %o; HTTP Info: %o", fnGetSalesLogixErrorId(xhr), oHttpInfo);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                        default:
                            if (typeof console !== "undefined") {
                                console.debug("%o (%o) - HTTP Info: %o", oHttpInfo.statusText, oHttpInfo.status, oHttpInfo);
                            }
                            if (this.isConfiguredToHandle(oHttpInfo.status)) {
                                this.showStatusInfoError(oHttpInfo);
                                return true;
                            }
                            return false;
                    }
                } catch (e) {
                    if (typeof console !== "undefined") {
                        console.warn("Error in _preemptError(): %o", e);
                    }
                    return false;
                }
            },
            init: function () {
                this._mixinConfig();
                if (this._configuration.preemption.enabled) {

                    if (typeof console !== 'undefined') {
                        console.debug('init preemption');
                    }

                    // Note: Native calls to XMLHttpRequest cannot be preempted (e.g. new XMLHttpRequest()).
                    // You can add a call to ErrorHelper.handleHttpError() in the error handler of the XMLHttpRequest object.
                    // The recommendation is to use either Sage.SData.Client.* or the dojo.xhr* methods.

                    // Handle dojo XMLHTTPRequest errors
                    if (window.dojoConfig && window.dojoConfig.ioPublish && typeof window.dojoConfig.ioPublish === "boolean" && window.dojoConfig.ioPublish === true) {
                        dojo.subscribe("/dojo/io/error", function (dfd, response) {
                            if (dfd && typeof dfd === "object" && typeof dfd.ioArgs === "object") {
                                if ((Sage.Utility.ErrorHandler._hasErrorHandler(dfd.ioArgs.url) == false) || (dfd.ioArgs.xhr.status === 575)) {
                                    Sage.Utility.ErrorHandler._preemptError(dfd.ioArgs.xhr, { url: dfd.ioArgs.url });
                                }
                            }
                            return response;
                        });
                    } else {
                        (function () {
                            var oldRequest = dojo.xhr;
                            // ReSharper disable UnusedParameter
                            dojo.xhr = function (/*String*/method, /*dojo.__XhrArgs*/args, /*Boolean?*/hasBody) {
                                // ReSharper restore UnusedParameter
                                return oldRequest.apply(dojo, arguments).addErrback(function (err) {
                                    if (err && typeof err === "object" && (err instanceof Error) && typeof err.xhr === "object") {
                                        var sUrl = (args && args.url) ? args.url || "" : "";
                                        if ((Sage.Utility.ErrorHandler._hasErrorHandler(sUrl) == false) || (err.xhr.status === 575)) {
                                            Sage.Utility.ErrorHandler._preemptError(err.xhr, { url: sUrl });
                                        }
                                    }
                                    return err;
                                });
                            };
                        })();
                    }

                    // Handle Sage.SData.Client.Ajax XMLHTTPRequest errors
                    (function () {
                        var oldRequest = Sage.SData.Client.Ajax.request;
                        Sage.SData.Client.Ajax.request = function (o) {
                            dojo.mixin(o, {
                                // The .__failure property stores the original .failure callback, if any.
                                __failure: null,
                                // The .__failureHandler function defines the callback that is called for any AJAX failure. If the original
                                // request included a .failure callback the original .failure callback is called unless there was an
                                // unhandled server-side exception (i.e. 5xx) redirected to here from App_Code\Global.cs that requires
                                // either a redirection to Login.aspx or other special error handling.
                                __failureHandler: function (response, opt) {
                                    if (opt.__failure && typeof opt.__failure === "function") {
                                        try {
                                            opt.__failure.call(opt.scope || this, response, opt);
                                        } catch (e) {
                                            if (typeof console !== "undefined") {
                                                console.error("There was an error calling the original failure() handler: %o", e);
                                            }
                                        }
                                    }
                                    var sUrl = opt.url;
                                    if ((Sage.Utility.ErrorHandler._hasErrorHandler(sUrl) == false) || (response.status === 575)) {
                                        Sage.Utility.ErrorHandler._preemptError(response, opt);
                                    }
                                    return response;
                                }
                            });
                            if (typeof o.failure === "function") {
                                o.__failure = o.failure;
                            }
                            o.failure = o.__failureHandler;
                            return oldRequest.apply(this, arguments);
                        };
                    })();

                    // Handle $ajax XMLHTTPRequest errors
                    // Note: See also dojo.jq (jQuery compatibility layer) and its ajaxError handling.
                    if (typeof $ === 'function') {
                        $(function () {
                            // http://api.jquery.com/ajaxError/
                            // ReSharper disable UnusedParameter
                            jQuery(this).ajaxError(function (event, jqXhr, ajaxSettings, thrownError) {
                                // ReSharper restore UnusedParameter
                                var sUrl = (typeof ajaxSettings === "object") ? (ajaxSettings.url || "") : "";
                                var options = { url: sUrl };
                                if ((Sage.Utility.ErrorHandler._hasErrorHandler(sUrl) == false) || (jqXhr.status === 575)) {
                                    Sage.Utility.ErrorHandler._preemptError(jqXhr, options);
                                }
                            });
                        });
                    }
                }
            },
            _getInternalHttpStatus: function (statusInfo) {
                if (statusInfo && typeof statusInfo === "object" && statusInfo.hasOwnProperty("status") && (isNaN(statusInfo.status) == false)) {
                    if (typeof statusInfo.sdataError === "object" &&
                        this.isSDataExceptionDiagnoses(statusInfo.sdataError.applicationCode) &&
                            typeof statusInfo.sdataError.appInfo === "object" && typeof statusInfo.sdataError.appInfo.exceptionKind === "string") {

                        switch (statusInfo.sdataError.appInfo.exceptionKind) {
                            case "AuthTokenNullException":
                                return 575;
                            case "BaseException":
                                if (Number(statusInfo.status) == 500) {
                                    return 576;
                                }
                                else {
                                    return Number(statusInfo.status);
                                }
                            case "RoleAccessDeniedException":
                                return 577;
                            case "ValidationException":
                                return 578;
                            case "UserObservableException":
                                return 579;
                            case "HttpRequestValidationException":
                                return 580;
                            case "StringOrBinaryDataWouldBeTruncatedException":
                                return 581;
                            case "AccessException":
                                return 582;
                            default:
                                return Number(statusInfo.status);
                        }
                    } else {
                        return Number(statusInfo.status);
                    }
                }
                return -1;
            },
            _getStatusInfoOptions: function (opt) {
                var options = {
                    "message": "",
                    "url": ""
                };
                if (opt && dojo.isObject(opt)) {
                    dojo.mixin(options, opt);
                }
                return options;
            },
            _handleAsDojoXhrHttpError: function (error, ioargs, opt) {
                var options = this._getStatusInfoOptions(opt);
                var sError = "";
                if (error && dojo.isObject(error)) {
                    sError = error.message || "";
                }
                if (sError != "" && options.message != "")
                    options.message = options.message + " " + sError;
                else
                    options.message = sError;
                var xhr = (ioargs && dojo.isObject(ioargs) && ioargs.xhr && dojo.isObject(ioargs.xhr)) ? ioargs.xhr : null;
                if (options.url == "" && xhr != null && dojo.isString(ioargs.url))
                    options.url = ioargs.url;
                this._handleAsHttpError(xhr, null, options);
            },
            _handleAsHttpError: function (xhr, sdata, options) {
                var oStatusInfo = this.getHttpStatusInfo(xhr, sdata);
                if (oStatusInfo != null)
                    this.showStatusInfoError(oStatusInfo, options);
                else {
                    var sMessage = (options && dojo.isObject(options) && Sage.Utility.isStringWithLength(options.message)) ? options.message : "There was an unknown error in response to an HTTP request.";
                    Dialogs.showError(sMessage);
                }
            },
            _hasErrorHandler: function (url) {
                var hasErrorHandler = 'HASERRORHANDLER'; //DNL
                if (url && dojo.isString(url) && url.toUpperCase().indexOf(hasErrorHandler) != -1) {
                    var query = url.substring(url.indexOf('?') + 1, url.length);
                    if (query != '') {
                        var queryObject = ioQuery.queryToObject(query.toUpperCase());
                        if (queryObject && dojo.isObject(queryObject)) {
                            return queryObject[hasErrorHandler] === 'TRUE';
                        }
                    }
                }
                return false;
            },
            handleEndRequestError: function (args) {
                // IMPORTANT: This method is called from the callback Sage.Utility.hideRequestIndicator which is
                //            setup via Sys.WebForms.PageRequestManager.getInstance().add_endRequest(). The args
                //            may or may [not] represent an error.

                if (this._debugEndRequest && typeof console !== 'undefined') {
                    console.debug('handleEndRequestError: args=%o', args);
                }

                if (args && typeof args === 'object' && typeof args.get_error === 'function' && args.get_error() !== null) {

                    try {

                        function cleanMessage(msg) {
                            if (msg && dojo.isString(msg)) {
                                // See C:\Program Files (x86)\Microsoft ASP.NET\ASP.NET 2.0 AJAX Extensions\v1.0.61025
                                // \MicrosoftAjaxLibrary\System.Web.Extensions\1.0.61025.0\MicrosoftAjaxWebForms.debug.js
                                return msg
                                    .replace('Sys.WebForms.PageRequestManagerServerErrorException: ', '')
                                    .replace('Sys.WebForms.PageRequestManagerParserErrorException: ', '')
                                    .replace('Sys.WebForms.PageRequestManagerTimeoutException: ', '');
                            }
                            return msg;
                        }

                        switch (args.get_error().name) {
                            case 'Sys.WebForms.PageRequestManagerTimeoutException':
                            case 'Sys.WebForms.PageRequestManagerParserErrorException':
                                Dialogs.showError(cleanMessage(args.get_error().message));
                                args.set_errorHandled(true);
                                return;
                        }

                        var message = cleanMessage(args.get_error().message);
                        var httpStatusCode = args.get_error().httpStatusCode;
                        if (message === '${AjaxLoginRedirect}' || message === '${LoginRedirect}' || httpStatusCode == 401 || httpStatusCode == 575) {
                            if (this._configuration.preemption.allowAuthRedirect) {
                                var redirectUrl = this._configuration.authenticationRedirectUrl || 'Login.aspx';
                                if (typeof console !== 'undefined') {
                                    console.debug('handleEndRequestError: ' + message + ' - Redirecting to ' + redirectUrl);
                                }
                                args.set_errorHandled(true);
                                window.location = redirectUrl;
                                return;
                            }
                        }

                        // Handle Sys.WebForms.PageRequestManagerServerErrorException
                        var hasResponse = args.get_response() !== null;
                        // Is it possible there can be a timeout event if the get_error().name is not
                        // Sys.WebForms.PageRequestManagerTimeoutException?
                        var timedout = hasResponse ? args.get_response().get_timedOut() : false;
                        var aborted = hasResponse ? args.get_response().get_aborted() : false;
                        var statusCode = hasResponse ? args.get_response().get_statusCode() : -1;
                        var responseAvaiable = hasResponse ? args.get_response().get_responseAvailable() : false;

                        if (this._debugEndRequest && typeof console !== 'undefined') {
                            console.debug('hasResponse: %o', hasResponse);
                            console.debug('statusCode: %o', statusCode);
                            console.debug('responseAvaiable: %o', responseAvaiable);
                            console.debug('name: %o', args.get_error().name);
                            console.debug('timedout: %o', timedout);
                            console.debug('aborted: %o', aborted);
                        }

                        // HTTP request was interrupted or aborted
                        if (statusCode == 0 || aborted) {
                            args.set_errorHandled(true);
                            return;
                        }

                        var hasXhr = responseAvaiable ?
                            (args.get_response().hasOwnProperty('_xmlHttpRequest') && args.get_response()._xmlHttpRequest !== null)
                            : false;

                        if (this._debugEndRequest && typeof console !== 'undefined') {
                            console.debug('hasXhr: %o', hasXhr);
                        }

                        if (hasXhr || timedout) {

                            var xhr = args.get_response()._xmlHttpRequest;
                            if (this._debugEndRequest && typeof console !== 'undefined') {
                                console.debug('xhr: %o', xhr);
                            }

                            if (statusCode == 200 || timedout) {
                                // NOTE: If the statusCode is 200 it means the Exception was handled by the
                                //       ScriptManager.AsyncPostBackError error handler. The AsyncPostBackError
                                //       handler does not appear to handle the System.Web.HttpRequestValidationException
                                //       exception type, so that type bubbles to the server and then we'll get the
                                //       SalesLogix JSON Error Response with a statusCode of 580. The reason for this 
                                //       appears to be that the HttpRequestValidationException is raised in the
                                //       HttpRequest object, which means the AsyncPostBackError error handler is 
                                //       never reached; however, EndRequest is still called, but with the XHR that
                                //       contains the SalesLogix JSON Error Response and statusCode.
                                if (this._debugEndRequest && typeof console !== 'undefined') {
                                    console.debug('message [1]: %o', cleanMessage(args.get_error().message));
                                }
                                Dialogs.showError(cleanMessage(args.get_error().message));
                                args.set_errorHandled(true);
                                return;
                            }

                            // Is the ErrorHandler configured to handle the statusCode?
                            // Note: isConfiguredToHandle() also takes into consideration whether or not preemption is enabled.
                            var canBeHandled = this.isConfiguredToHandle(statusCode, xhr);

                            if (this._debugEndRequest && typeof console !== 'undefined') {
                                console.debug('canBeHandled: %o', canBeHandled);
                            }

                            // Handle HTTP responses other than those with a statusCode of 200 (e.g. 580).

                            // If preemption is enabled and the status code is set up to be handled by preemption, then call
                            // _preemptError(); otherwise, call handleHttpError().               
                            if (canBeHandled) {
                                if (this._debugEndRequest && typeof console !== 'undefined') {
                                    console.debug('calling this._preemptError(xhr)');
                                }
                                this._preemptError(xhr);
                            } else {
                                if (this._debugEndRequest && typeof console !== 'undefined') {
                                    console.debug('this.handleHttpError(xhr)');
                                }
                                this.handleHttpError(xhr);
                            }
                            args.set_errorHandled(true);
                            return;
                        }

                        if (this._debugEndRequest && typeof console !== 'undefined') {
                            console.debug('message [2]: %o', cleanMessage(args.get_error().message));
                        }

                        // Failsafe
                        Dialogs.showError(cleanMessage(args.get_error().message));
                        args.set_errorHandled(true);

                    } catch (e) {
                        if (typeof console !== 'undefined') {
                            console.error('There was an error in handleEndRequestError(): %o', e);
                        }
                    }
                } else {
                    if (this._debugEndRequest && typeof console !== 'undefined') {
                        console.debug('No error in handleEndRequestError to handle');
                    }
                }
            },
            handleHttpError: function (arg1, arg2, options) {
                var bFirstArgIsXhr = (arg1 && dojo.isObject(arg1) && typeof arg1.getResponseHeader !== "undefined");
                if (bFirstArgIsXhr)
                    this._handleAsHttpError(arg1, arg2, options);
                else
                    this._handleAsDojoXhrHttpError(arg1, arg2, options);
            },
            getInterceptedError: function (responseText, isJson) {
                if (!Sage.Utility.isStringWithLength(responseText)) {
                    return null;
                }
                if (Sage.Utility.isTrue(isJson)) {
                    var obj = dojo.fromJson(responseText);
                    if (obj && typeof obj === "object") {
                        return obj;
                    }
                } else {
                    return { "text": responseText };
                }
                return null;
            },
            getSDataDiagnosis: function (responseText, isXml) {
                if (!Sage.Utility.isStringWithLength(responseText)) {
                    return null;
                }
                var obj;
                if (Sage.Utility.isTrue(isXml)) {
                    var xml = new XML.ObjTree();
                    obj = xml.parseXML(responseText);
                    if (obj && typeof obj === "object" && obj.hasOwnProperty("sdata:diagnoses")) {
                        obj = obj["sdata:diagnoses"]["sdata:diagnosis"];
                        if (!obj || typeof obj !== "object") {
                            return null;
                        }
                        var fnGetProp = function (prop) {
                            var value = obj.hasOwnProperty(prop) ? obj[prop] : "";
                            // "value" could be an object with a property named -xsi:nil which represents an empty nullable string.
                            // Make sure we have a string.
                            if (value && dojo.isString(value)) {
                                if (prop === "stackTrace") {
                                    if (!this._configuration.isDebug) {
                                        return "";
                                    }
                                }
                                return value;
                            }
                            return "";
                        };
                        return {
                            "severity": fnGetProp("sdata:severity"),
                            "sdataCode": fnGetProp("sdata:sdataCode"),
                            "applicationCode": fnGetProp("sdata:applicationCode"),
                            "message": fnGetProp("sdata:message"),
                            "stackTrace": fnGetProp("sdata:stackTrace"),
                            "payloadPath": fnGetProp("sdata:payloadPath")
                        };
                    }
                } else {
                    obj = dojo.fromJson(responseText);
                    if (obj && dojo.isArray(obj) && obj.length > 0 && typeof obj[0] === "object" && obj[0].hasOwnProperty("sdataCode")) {
                        return obj[0];
                    }
                }
                return null;
            },
            getHttpStatusInfo: function (xhr, sdata) {
                var bIsXhr = (xhr && dojo.isObject(xhr) && typeof xhr.getResponseHeader !== "undefined");
                if (!bIsXhr) {
                    return null;
                }
                var iStatus = this.safeGetPropValue(xhr, "status", -1);
                var sStatusText = this.safeGetPropValue(xhr, "statusText", "Unknown HTTP status. Possible timeout.");
                var oStatusInfo = {
                    "message": dString.substitute("HTTP status: ${0} (${1}).", [sStatusText, iStatus]),
                    "status": iStatus,
                    "statusText": sStatusText,
                    "url": (sdata && dojo.isObject(sdata) && dojo.isString(sdata.url)) ? sdata.url : "",
                    "sdataError": {}
                };
                if (xhr.readyState !== 4) {
                    return oStatusInfo;
                }
                var sContentType = xhr.getResponseHeader("Content-Type");
                if (dojo.isString(sContentType)) {
                    var self = this;
                    switch (iStatus) {
                        case 576:
                            // Exception.GetBaseException()
                        case 577:
                            // RoleAccessDeniedException
                        case 578:
                            // ValidationException
                        case 579:
                            // UserObservableException
                        case 580:
                            // HttpRequestValidationException
                        case 581:
                            // StringOrBinaryDataWouldBeTruncatedException (OleDbException)
                        case 582:
                            // AccessException
                            var oErrorInfo;
                            var fnGetErrorInfo = function (isJson) {
                                var sResponseText = self.safeGetPropValue(xhr, "responseText", "");
                                return self.getInterceptedError(sResponseText, isJson);
                            };
                            if (sContentType.indexOf("application/json") !== -1) {
                                oErrorInfo = fnGetErrorInfo(true);
                            } else if (sContentType.indexOf("text/plain") !== -1) {
                                oErrorInfo = fnGetErrorInfo(false);
                                if (oErrorInfo && typeof oErrorInfo === "object" && oErrorInfo.hasOwnProperty("text")) {
                                    if (iStatus === 576) {
                                        oStatusInfo.message += "\r\n\r\n" + oErrorInfo.text;
                                    } else {
                                        oStatusInfo.message = oErrorInfo.text;
                                    }
                                    return oStatusInfo;
                                }
                            } else {
                                return oStatusInfo;
                            }
                            if (oErrorInfo && typeof oErrorInfo === "object" && oErrorInfo.hasOwnProperty("slxErrorId")) {
                                oStatusInfo.errorInfo = oErrorInfo;
                            }
                            break;
                        default:
                            var oDiagnosis;
                            var fnGetDiagnosis = function (isXml) {
                                var sResponseText = self.safeGetPropValue(xhr, "responseText", "");
                                return self.getSDataDiagnosis(sResponseText, isXml);
                            };
                            if (sContentType.indexOf("application/json") !== -1) {
                                oDiagnosis = fnGetDiagnosis(false);
                            } else if (sContentType.indexOf("application/xml") !== -1) {
                                oDiagnosis = fnGetDiagnosis(true);
                            } else {
                                return oStatusInfo;
                            }
                            if (oDiagnosis && typeof oDiagnosis === "object" && oDiagnosis.hasOwnProperty("sdataCode")) {
                                var sdataError = {
                                    "severity": "",
                                    "sdataCode": "",
                                    "applicationCode": "",
                                    "message": "",
                                    "stackTrace": "",
                                    "payloadPath": "",
                                    fmtError: function () {
                                        var arrProp = [];
                                        for (var prop in this) {
                                            // "message" and "stackTrace" are handled separately, so exclude them.
                                            if (prop == "message" || prop == "stackTrace" || prop == "fmtError")
                                                continue;
                                            var value = this[prop];
                                            if (dojo.isString(value) && value != "")
                                                arrProp.push(dString.substitute("${0}=${1}", [prop.toString(), value]));
                                        }
                                        return (arrProp.length > 0) ? arrProp.join("; ") : "";
                                    }
                                };

                                oStatusInfo.sdataError = sdataError;
                                dojo.mixin(oStatusInfo.sdataError, oDiagnosis);

                                if (oStatusInfo.sdataError.applicationCode && this.isSDataExceptionDiagnoses(oStatusInfo.sdataError.applicationCode)) {
                                    var fnGetInfo = function () {
                                        var obj = {};
                                        var arrAppData = oStatusInfo.sdataError.applicationCode.split("; ");
                                        array.forEach(arrAppData, function (item) {
                                            if (item && dojo.isString(item) && item.indexOf("=") !== -1) {
                                                var arrItem = item.split("=");
                                                var name = arrItem[0].trim();
                                                var value = arrItem[1].trim();
                                                obj[name] = value;
                                            }
                                        });
                                        return obj;
                                    };
                                    oStatusInfo.sdataError.appInfo = fnGetInfo();
                                    if (oStatusInfo.sdataError.appInfo.hasOwnProperty("code") && oStatusInfo.sdataError.appInfo.source) {
                                        oStatusInfo.sdataError.applicationCode = oStatusInfo.sdataError.appInfo.code + "|" +
                                        oStatusInfo.sdataError.appInfo.source;
                                    } else {
                                        oStatusInfo.sdataError.applicationCode = oStatusInfo.sdataError.appInfo.source;
                                    }
                                    if (oStatusInfo.sdataError.appInfo.source) {
                                        delete oStatusInfo.sdataError.appInfo.source;
                                    }
                                }

                                var sSeverity = "UNKNOWN";
                                if (Sage.Utility.isStringWithLength(oStatusInfo.sdataError.severity)) {
                                    sSeverity = oStatusInfo.sdataError.severity.toUpperCase();
                                }
                                var oDescriptionMap = {
                                    "INFO": "Informational message",
                                    "WARNING": "Warning message",
                                    "TRANSIENT": "Transient error",
                                    "ERROR": "Operation failed",
                                    "FATAL": "Severe error",
                                    "UNKNOWN": "Unknown"
                                };
                                var sDescription = oDescriptionMap[sSeverity] || oDescriptionMap["UNKNOWN"];
                                var sMessage = oStatusInfo.sdataError.message;
                                if (dojo.isString(sMessage)) {
                                    if (sMessage.trim().match("." + "$") != ".") {
                                        sMessage += ".";
                                    }
                                }
                                if (this._configuration.isDebug) {
                                    oStatusInfo.message = dString.substitute(
                                    "The following SData diagnosis occurred: Description=${0}. Message=${1} HTTP status: ${2} (${3}).",
                                    [sDescription, sMessage, oStatusInfo.statusText, oStatusInfo.status]);
                                } else {
                                    var internalStatus = this._getInternalHttpStatus(oStatusInfo);
                                    var showHttpStatus = true;
                                    switch (internalStatus) {
                                        // RoleAccessDeniedException                                                                                      
                                        case 577:
                                            if (!this._configuration.showExtendedRoleAccessDeniedException) {
                                                showHttpStatus = false;
                                            }
                                            break;
                                        // ValidationException                                                                                      
                                        case 578:
                                            if (!this._configuration.showExtendedValidationException) {
                                                showHttpStatus = false;
                                            }
                                            break;
                                        // AccessException                                                                                     
                                        case 582:
                                            showHttpStatus = false;
                                            break;
                                    }
                                    if (showHttpStatus) {
                                        oStatusInfo.message = dString.substitute("${0} HTTP status: ${1} (${2}).",
                                        [sMessage, oStatusInfo.statusText, oStatusInfo.status]);
                                    } else {
                                        oStatusInfo.message = sMessage;
                                    }
                                }
                            }
                            break;
                    }
                }
                return oStatusInfo;
            },
            isConfiguredToHandle: function (statusCode, xhr) {
                var result = false;
                if (this._configuration.preemption.enabled == false) return false;
                if (statusCode && isNaN(statusCode) == false) {
                    switch (Number(statusCode)) {
                        case 500:
                            if (this._configuration.preemption.showInternalServerErrorMsg) {
                                return true;
                            }
                            if (this._configuration.preemption.showUnhandledMessagingServiceExceptionMsg) {
                                var statusInfo = this.getHttpStatusInfo(xhr);
                                if (!(statusInfo && typeof statusInfo === "object" && statusInfo.hasOwnProperty("sdataError"))) {
                                    return false;
                                }
                                return this.isSDataExceptionDiagnoses(statusInfo.sdataError.applicationCode);
                            }
                            break;
                        case 575:
                            return this._configuration.preemption.allowAuthRedirect;
                        case 576:
                            return this._configuration.preemption.showPreemptedErrorMsg;
                        default:
                            if (this._configuration.preemption.handledStatusCodes != '') {
                                var arrStatusCodes = this._configuration.preemption.handledStatusCodes.split(',');
                                array.some(arrStatusCodes, function (sc) {
                                    if (sc == statusCode) {
                                        result = true;
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });
                            }
                            break;
                    }
                }
                return result;
            },
            isSDataExceptionDiagnoses: function (applicationCode) {
                if (applicationCode && typeof applicationCode === "string" && applicationCode.indexOf("SDataExceptionDiagnoses") != -1) {
                    return true;
                }
                return false;
            },
            preemptError: function (xhr, o) {
                this._preemptError(xhr, o);
            },
            safeGetPropValue: function (obj, prop, defaultValue) {
                /* This function was created to address an issue where reading from a valid XmlHttpRequest object
                * raises an exception if the XmlHttpRequest object represents an HTTP session that has timed out
                * or when the xhr.readyState is != 4. Some of the problematic properties include xhr.status,
                * xhr.statusText, xhr.getResponseHeader() and xhr.responseText. Not all browsers have the same behavior.
                * http://msdn.microsoft.com/en-us/library/windows/desktop/ms753800(v=vs.85).aspx
                * 'In MSXML 3.0 and later, reading the status property after loading has commenced but has not
                * yet completed (for example, at the LOADED or INTERACTIVE state) returns the following error:
                * "The data necessary to complete this operation is not yet available."' */
                try {
                    return obj[prop];
                } catch (e) {
                    return defaultValue;
                }
            },
            showStatusInfoError: function (statusInfo, opt) {
                var options = this._getStatusInfoOptions(opt);
                var sMessage = options.message;

                var sPlainTextStackTrace = "";
                var sStackTraceWithTextArea = "";

                var sPlainSlxErrorIdMsg = "";
                var sSlxErrorIdMsgWithLink = "";

                // The internalStatus should [not] be used for display purposes. The Sage.Integration.Server sends
                // an HTTP status of 500 for all of its errors. The _getInternalHttpStatus() function translates
                // the statusInfo.sdataError.appInfo.exceptionKind into the exception kind that should be handled (e.g. 576, 577, etc.).
                var internalStatus = this._getInternalHttpStatus(statusInfo);

                if ((internalStatus == 575) && this._configuration.preemption.allowAuthRedirect) {
                    window.location = this._configuration.authenticationRedirectUrl || 'Login.aspx';
                    return;
                }

                if (statusInfo && dojo.isObject(statusInfo) && dojo.isString(statusInfo.message)) {

                    sMessage += (sMessage == "") ? statusInfo.message : " " + statusInfo.message;

                    switch (internalStatus) {
                        case 575:
                            // AuthTokenNullException
                        case 576:
                            // BaseException
                        case 577:
                            // RoleAccessDeniedException
                        case 578:
                            // ValidationException
                        case 579:
                            // UserObservableException
                        case 580:
                            // HttpRequestValidationException
                        case 581:
                            // StringOrBinaryDataWouldBeTruncatedException (OleDbException)
                        case 582:
                            // AccessException
                            sMessage = Sage.Utility.htmlEncode(statusInfo.message);
                            if (typeof statusInfo.errorInfo === "object") {
                                sMessage = Sage.Utility.htmlEncode(statusInfo.errorInfo.message);
                            }
                            switch (internalStatus) {
                                case 577:
                                    if (!this._configuration.showExtendedRoleAccessDeniedException) {
                                        Dialogs.showError(sMessage);
                                        return;
                                    }
                                    break;
                                case 578:
                                    if (!this._configuration.showExtendedValidationException) {
                                        Dialogs.showError(sMessage);
                                        return;
                                    }
                                case 579:
                                    break;
                                case 576:
                                case 580:
                                case 581:
                                    if (statusInfo.status != 500) {
                                        sMessage += dString.substitute(" HTTP status: ${info.statusText} (${info.status}).", { info: statusInfo });
                                    }
                                    break;
                                case 582:
                                    Dialogs.showError(sMessage);
                                    return;
                            }
                            break;
                    }

                    if (typeof statusInfo.sdataError === "object" && typeof statusInfo.sdataError.appInfo === "object") {
                        sPlainSlxErrorIdMsg = dString.substitute("\r\n\r\nSalesLogix Error Id: ${0}", [statusInfo.sdataError.appInfo.slxErrorId]);
                        sSlxErrorIdMsgWithLink = this._fmtSlxErrorId(statusInfo.sdataError.appInfo.slxErrorId);
                        sMessage += sSlxErrorIdMsgWithLink;
                    }
                    if (typeof statusInfo.errorInfo === "undefined") {
                        var sUrl = null;
                        if (Sage.Utility.isStringWithLength(statusInfo.url)) {
                            if (sMessage.indexOf(decodeURIComponent(statusInfo.url)) == -1) {
                                sUrl = decodeURIComponent(statusInfo.url);
                            }
                        } else if (Sage.Utility.isStringWithLength(options.url)) {
                            if (sMessage.indexOf(decodeURIComponent(options.url)) == -1) {
                                sUrl = decodeURIComponent(options.url);
                            }
                        }
                        if (sUrl !== null) {
                            sMessage += dString.substitute("\r\n\r\nURL: ${0}", [sUrl]);
                        }
                    }
                    if (this._configuration.isDebug) {
                        // Are we dealing with an SData error object?
                        if (typeof statusInfo.sdataError === "object") {
                            if (dojo.isFunction(statusInfo.sdataError.fmtError)) {
                                sMessage += dString.substitute("\r\n\r\nExtended SData diagnosis information: ${0}.", [statusInfo.sdataError.fmtError()]);
                            }
                            if (typeof statusInfo.sdataError.appInfo === "object") {
                                sMessage += dString.substitute("\r\n\r\nException type: ${info.exceptionType}\r\n\r\nSource: ${info.exceptionSource}",
                                    { info: statusInfo.sdataError.appInfo });
                            }
                            if (statusInfo.sdataError.stackTrace) {
                                sPlainTextStackTrace = statusInfo.sdataError.stackTrace;
                                sStackTraceWithTextArea = this._fmtStackTrace(statusInfo.sdataError.stackTrace);
                                sMessage += sStackTraceWithTextArea;
                            }
                        }
                    }
                    var mail = { subject: "SalesLogix Exception Details" };
                    // Are we dealing with an ErrorInfo object?
                    if (typeof statusInfo.errorInfo === "object") {
                        sPlainSlxErrorIdMsg = dString.substitute("\r\n\r\nSalesLogix Error Id: ${0}", [statusInfo.errorInfo.slxErrorId]);
                        sSlxErrorIdMsgWithLink = this._fmtSlxErrorId(statusInfo.errorInfo.slxErrorId);
                        sMessage += sSlxErrorIdMsgWithLink;
                        sMessage += dString.substitute("\r\n\r\nURL: ${info.request.url}", { info: statusInfo.errorInfo });
                        if (this._configuration.isDebug) {
                            if (statusInfo.errorInfo.stackTrace) {
                                sPlainTextStackTrace = statusInfo.errorInfo.stackTrace;
                                sStackTraceWithTextArea = this._fmtStackTrace(statusInfo.errorInfo.stackTrace);
                                statusInfo.errorInfo.__stackTrace = sStackTraceWithTextArea;
                                sMessage += dString.substitute("\r\n\r\nException type: ${info.type}\r\n\r\nSource: ${info.source}${info.__stackTrace}\r\n\r\nTarget site: ${info.targetSite}", { info: statusInfo.errorInfo });
                            }
                        }
                        mail.subject = dString.substitute("SalesLogix Exception Details (SalesLogix Error Id: ${0})", [statusInfo.errorInfo.slxErrorId]);
                    }
                    mail.subject = encodeURIComponent(mail.subject);
                    if (sPlainTextStackTrace != "") {
                        sPlainTextStackTrace = dString.substitute("\r\n\r\nStack trace:\r\n${0}", [sPlainTextStackTrace]);
                    }
                    mail.message = encodeURIComponent(Sage.Utility.htmlDecode(sMessage
                            .replace(sStackTraceWithTextArea, sPlainTextStackTrace)
                            .replace(sSlxErrorIdMsgWithLink, sPlainSlxErrorIdMsg)));
                    mail.linkCaption = "Mail details of this exception to your administrator";
                    sMessage += dString.substitute("\r\n\r\n<a href=\"mailto:?subject=${info.subject}&amp;body=${info.message}\">${info.linkCaption}</a>", { info: mail });
                }
                if (sMessage == "") {
                    sMessage = "There was an unknown error.";
                }
                sMessage = sMessage.replace(/(\r\n)/g, "<br />");
                Dialogs.showError(sMessage);
            }
        });

        Sage.Utility.ErrorHandler.init();

        return Sage.Utility.ErrorHandler;
    }
);
