// Mocked
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,'');
}

window.Sys = {
    CultureInfo: {
        CurrentCulture: {
            name: "en-us",
            numberFormat: "en-us"
        }
    },
    WebForms: {
        PageRequestManager: {
            getInstance: function () {
                return {
                    add_pageLoaded: function () { },
                    add_endRequest: function () { },
                    add_pageLoading: function () { },
                    add_initializeRequest: function() {}
                };
            }
        }
    }
};

window.AutoLogout = false;

window.Sage = {
    Services : {
        getService: function() {
            return {
                getContext: function() {
                    return {
                        EntityId: ''
                    };
                },
                containsKey: function () {
                }
            };
        },
        addService: function() {},
        hasService: function() {}
    },
    SData: {
        Client: {
            Ajax: {
            },
            SDataService: function () {
                return {
                    on: function () {}
                };
            },
            SDataServiceOperationRequest: function () {
                return {
                    setOperationName: function () {
                        return {
                            execute: function () {}
                        };
                    }
                };
            },
            SDataNamedQueryRequest: function() {
                return {
                    setApplicationName: function () {},
                    setResourceKind: function () {},
                    uri: {
                        setCollectionPredicate: function () {}
                    },
                    setQueryName: function () {},
                    setQueryArg: function () {},
                    read: function () {}
                };
            },
            SDataUri: {
                QueryArgNames: {
                    StartIndex: 1
                }
            }
        }
    },
    namespace: function (){},
    Data: {},
    Utility: {
        restrictDecimalDigit : function(val) { return val; },
        maximizeDecimalDigit : function(val) { return val; },
        restrictToNumberOnKeyPress : function(val) { return true; },
        Convert: {},
        Filters: {},
        ErrorHandler: {}
    },
    Link: {
        getHelpUrlTarget: function () {
            return '';
        },
        getHelpUrl: function () {
            return '';
        }
    },
    MailMerge: {
        Helper: {}
    },
    UI: {
    }
};