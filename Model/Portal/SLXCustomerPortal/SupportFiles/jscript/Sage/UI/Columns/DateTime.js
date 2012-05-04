/*globals Sage, dojo, dojox, dijit */
dojo.provide('Sage.UI.Columns.DateTime');
dojo.require('dojox.grid.cells.dijit');
dojo.require('dojo.date.locale');
dojo.require('Sage.Utility');

(function () {
    dojo.declare('Sage.UI.Columns.DateTime', dojox.grid.cells.Cell, {
        // summary:
        //  Read-only date/time display column.
        //  The following configuration properties may be included when setting up the column:
        //  * formatType (date, time, or date/time - defaults to date/time)
        timelessField: '',
        timelessText: '',
        dateOnly: false,
        utc: true,
        useFiveSecondRuleToDetermineTimeless: false,
        format: function (inRowIndex, inItem) {
            // summary:
            //	if given a date, convert it to local time and provide corresponding HTML
            if (!inItem)
                return '';
            var d = this.get ? this.get(inRowIndex, inItem) : (this.value || this.defaultValue);
            if (!d)
                return '';
            d = convert.toDateFromString(d);
            if (!d || d.constructor !== Date) {
                return '';
            }
            var tless = false;
            if (this.timelessField && this.timelessField !== '') {
                tless = convert.toBoolean(Sage.Utility.getValue(inItem, this.timelessField, 'F'));
            }
            if (this.useFiveSecondRuleToDetermineTimeless) {
                tless = ((d.getUTCHours() === 0) && (d.getUTCMinutes() === 0) && (d.getUTCSeconds() === 5));
            }
            // TODO: edit mode?    
            if (!this.dateOnly) {
                if (!tless) {
                    return dojo.date.locale.format(d, { selector: this.formatType || 'date/time' }); //datePattern: Sys.CultureInfo.CurrentCulture.dateTimeFormat.ShortDatePattern, timePattern: Sys.CultureInfo.CurrentCulture.dateTimeFormat.ShortTimePattern,
                } else {
                    var timelessDate = d;
                    if (this.utc) {                        
                        timelessDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                    }
                    return dojo.date.locale.format(timelessDate, { selector: 'date' }) + this.timelessText;  //datePattern: Sys.CultureInfo.CurrentCulture.dateTimeFormat.ShortDatePattern,
                }
            }
            else {
                if (this.utc) {
                    var dateOnly = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                    return dojo.date.locale.format(dateOnly, { selector: 'date' });
                }
                else {
                    return dojo.date.locale.format(d, { selector: 'date' });
                }
            }
        }
    });

    // conversion helper is used locally, and also registered under Sage.UI.Columns.DateTime.
    // It's a bit of a kludge, ideally these functions should be shared at a utility level
    var convert = Sage.Utility.Convert;
})();

