/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        "dijit/form/DateTextBox",
        "dijit/_Widget",
        "dijit/_Templated",
        'Sage/UI/SLXPreviewGrid/Filter/_previewGridFilterMixin',
        'dojo/_base/declare'
],
function (DateTextBox, _Widget, _Templated, _filterMixin, declare) {
    var DateRange = declare("Sage.UI.SLXPreviewGrid.Filter.DateRange", [_Widget, _Templated, _filterMixin], {
        // summary:
        //  Date range filter
        templateString: "<div>" +
        "<input data-dojo-type='dijit.form.DateTextBox' dojoAttachPoint='dteFrom' style='width:90px'> - " +
        "<input data-dojo-type='dijit.form.DateTextBox' dojoAttachPoint='dteTo' style='width:90px'>" +
        "</div>",
        widgetsInTemplate: true,

        /////////////////////////////////////
        // Public API
        getQuery: function () {
            var toIsoStringFromDate = function (value, isUpperBound) {
                // format to ISO
                // if isUpperBound is true it will add 1 day (used for upper bound in date range)
                if (!value) {
                    return '';
                }
                if (value.constructor !== Date) {
                    value = Date.parse(value);
                }
                if (isUpperBound) {
                    value.setUTCDate(value.getUTCDate() + 1);
                }
                var pad = function (n) { return n < 10 ? '0' + n : n; };
                // adapted from: https://developer.mozilla.org/en/JavaScript/Reference/global_objects/date
                return value.getUTCFullYear() + '-'
                        + pad(value.getUTCMonth() + 1) + '-'
                        + pad(value.getUTCDate()) + 'T'
                        + pad(value.getUTCHours()) + ':'
                        + pad(value.getUTCMinutes()) + ':'
                        + pad(value.getUTCSeconds()) + 'Z';
            };
            var dFrom = toIsoStringFromDate(this.dteFrom.get('value'));
            var dTo = toIsoStringFromDate(this.dteTo.get('value'), true);



            var qry = '';
            if (dFrom) {
                qry = this.field + " ge '" + dFrom + "'";
            }
            if (dTo) {
                if (qry) {
                    qry += " and ";
                }
                qry += this.field + " lt '" + dTo + "'";
            }

            if (this.params["getTimeless"]) {
                if (qry) {
                    var fDate = false;
                    qry = "((" + qry + " and not Timeless) or (";
                    var dFromTimeless = Sage.Utility.Activity.formatTimelessStartDate(this.dteFrom.get('value'));
                    var dToTimeless = Sage.Utility.Activity.formatTimelessEndDate(this.dteTo.get('value'));
                    if (dFromTimeless) {
                        qry += this.field + " gt '" + dFromTimeless + "'";
                        fDate = true;
                    }
                    if (dToTimeless) {
                        if (fDate) {
                            qry += " and ";
                        }
                        qry += this.field + " lt '" + dToTimeless + "'";
                    }
                    qry += " and Timeless))";

                }
            }
            return qry;
        },

        reset: function () {
            this.dteFrom.set('value', 0);
            this.dteTo.set('value', 0);
        },
        getState: function () {
            return {
                'dFrom': this.dteFrom.get('value'),
                'dTo': this.dteTo.get('value')
            };
        },
        applyState: function (state) {
            if (state) {
                if (state['dFrom']) {
                    this.dteFrom.set('value', state['dFrom']);
                }
                if (state['dTo']) {
                    this.dteTo.set('value', state['dTo']);
                }
            }
        }
    });

    return DateRange;
});

