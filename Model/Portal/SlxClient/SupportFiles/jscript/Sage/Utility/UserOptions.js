/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Utility'
    ],
    function (sageUtility) {
        Sage.namespace('Utility.UserOptions');
        return Sage.Utility.UserOptions = {
            getConvertedOptionValue: function (optionName, value) {
                value = value.toLowerCase();
                var retValue = value;
                
                switch (optionName.toUpperCase()) {
                    case "DEFAULTCALENDARVIEW":
                        var monthRE = /^(month|2)$/i;
                        var weekRE = /^(week|1)$/i;
                        var workweekRE = /^(workweek|3)$/i;
                        var dayRE = /^(day|0)$/i;

                        if (monthRE.test(value)) retValue = "month";
                        else if (weekRE.test(value)) retValue = "week";
                        else if (workweekRE.test(value)) retValue = "workweek";
                        else if (dayRE.test(value)) retValue = "day";
                        else retValue = "day";
                        break;
                    case "WORKWEEKSUN":
                    case "WORKWEEKMON":
                    case "WORKWEEKTUE":
                    case "WORKWEEKWED":
                    case "WORKWEEKTHU":
                    case "WORKWEEKFRI":
                    case "WORKWEEKSAT":
                    case "REMEMBERUSERS":
                    case "SHOWONOPPORTUNITIES":
                    case "SHOWONREGARDING":
                    case "SHOWONPHONENUMBER":
                    case "SHOWONTIME":
                        var trueRE = /^(true|yes|T|1)$/i;
                        retValue = trueRE.test(value); // = sageUtility.Convert.toBoolean(value);
                        break;
                    case "LOADHISTORYONSTART":
                        var trueRE1 = /^(true|yes|T|Y|0)$/i;
                        retValue = trueRE1.test(value); // = sageUtility.Convert.toBoolean(value);
                        break;
                    case 'DAYSTARTTIME':
                        retValue = this.getHourPart(value);
                        if (retValue > 24) retValue = 9;
                        break;
                    case 'DAYENDTIME':
                        retValue = this.getHourPart(value);
                        if (retValue > 24) retValue = 17;
                        break;
                    case "NUMEVENTS":
                    case "DEFAULTINTERVAL":
                        retValue = parseInt(value);
                        break;
                    default:
                        retValue = value;
                }
                return retValue;
            },
            getHourPart: function (value) {
                var dt = value.split(" ");
                var t, h;
                if (dt.length > 1 && value.indexOf("-") > 0) {
                    t = dt[1];
                    if (t) {
                        h = t.split(":")[0];
                    }
                } else {
                    h = value.split(":")[0];
                }
                if (value.indexOf('pm') > 0 || value.indexOf('PM') > 0) {
                    h = parseInt(h) + 12;
                }
                return parseInt(h, 10);
            },
            getDay: function (value) {
                var retValue = value;
                if (value.length > 1) {
                    var daysArr = [];
                    daysArr["SUNDAY"] = 0;
                    daysArr["MONDAY"] = 1;
                    daysArr["TUESDAY"] = 2;
                    daysArr["WEDNESDAY"] = 3;
                    daysArr["THURSDAY"] = 4;
                    daysArr["FRIDAY"] = 5;
                    daysArr["SATURDAY"] = 6;
                    retValue = daysArr[value.toUpperCase()];
                }
                if (!retValue) retValue = 1;
                return retValue;

            },
            arraySort: function (a, b) {
                return a - b;
            }

        };
    });