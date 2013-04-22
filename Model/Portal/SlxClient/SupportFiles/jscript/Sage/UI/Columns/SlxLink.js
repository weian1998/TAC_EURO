/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Format',
    'Sage/Utility',
    'dojo/_base/declare',
    'dojox/grid/cells/_base'
],
function (Format, Utility, declare, cellsBase) {
    Sage.Region = {
        decimalSeparator: '.',
        numberGroupSeparator: ',',
        numberGroupDigits: 3,
        decimalDigits: 2,
        currencySymbol: '$',
        positiveCurrencyPattern: 0,
        negativeCurrencyPattern: 0,
        numberNegativeSign: '-'
    };
    var widget = declare("Sage.UI.Columns.SlxLink", dojox.grid.cells.Cell, {
        _dataTypeChecked: null,
        _layout: null,
        _getDisplayValue: function (inRowIndex, inItem, value) {
            var sValue = value || "";
            if (this._layout == null) {
                if (Utility.getModeId() == "list") {
                    var oList = dijit.byId("list");
                    if (oList && Utility.isDefined(oList) && Utility.isDefined(oList._configuration))
                        this._layout = oList._configuration.list.layout[this.layoutIndex];
                    else
                        return sValue;
                } else {
                    var sTemp = this.get ? this.get(inRowIndex, inItem) : (this.value || this.defaultValue);
                    if (this._dataTypeChecked == null && Utility.isStringWithLength(sTemp)) {
                        this._dataTypeChecked = true;
                        if (convert.isDateString(sTemp)) {
                            this._layout = {
                                "fieldType": "DateTime",
                                "format": "DateTime",
                                "formatString": this.displayFormatString || ""
                            };
                        } else
                            return sValue;
                    }
                    else
                        return sValue;
                }
            }
            // Is this a DateTime column that is linked?
            if (this._layout.fieldType === "DateTime" && this._layout.format === "DateTime") {
                var sDate = this.get ? this.get(inRowIndex, inItem) : (this.value || this.defaultValue);
                if (dojo.isString(sDate) && convert.isDateString(sDate)) {
                    var oDate = convert.toDateFromString(sDate);
                    // Assumes UTC (i.e. SecTableDefs.DateTimeType == NULL or U).
                    // TODO: Get and cache the SecTableDefs.DateTimeType value.
                    oDate = new Date(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate());
                    if (Utility.isStringWithLength(this._layout.formatString)) {
                        try {
                            return dojo.date.locale.format(oDate, { selector: "date", datePattern: this._layout.formatString });
                        } catch (e) {
                            if (typeof console !== "undefined")
                                console.warn("Error calling dojo.date.locale.format with a datePattern of %o. %o", this._layout.formatString, e);
                            return dojo.date.locale.format(oDate, { selector: "date", fullYear: true });
                        }
                    } else
                        return dojo.date.locale.format(oDate, { selector: "date", fullYear: true });
                }
            }
            return sValue;
        },
        // summary:
        // grid cell that provides a link to an entity page

        // displayFields: Array
        //		Array of field names to use with string formatter for building up a display value with more than one property.
        //		If this array does not contain any items, the defined field will be used without formatting.
        displayFields: [],
        // displayFormatString: string,
        //		The formatstring to use in formatting the values from the displayFields
        displayFormatString: '',
        // idField: string
        //		The name of the field to be used as the entityid in the querystring
        idField: '',
        // pageName: string
        //		The name of the entity page to generate the link to
        pageName: '',
        // appliedSecurity: string
        //		The 'key' of the secured action the user must have in order to follow the link.
        //		If the user does not have access to the action specified, this field will contain only text.
        appliedSecurity: '',
        // urlFields: Array
        //		Array of field names to use with string formatter for building up the URL.
        urlFields: [],
        // urlFormatString: string
        //		The format string to use with urlFields for building up the url.
        urlFormatString: '',
        // target: string
        //		the 'target' for the link.	If something is specified, a target attribute will be applied to the link.	
        //		Thus enabling the link to open a new tab/window.
        target: '',
        // image: string
        //      an optional image url to use as the display portion of the link.
        image: '',
        // queryParams: string || object
        //      additional query parameters to add to the link.  This can be a string that is in proper url format
        //      or it can be an object that will be serialized as name-value parameters to the querystring.
        queryParams: null,
        getPageName: function () {
            if (this.pageName === '') {
                //use the current page if none is specified...
                var url = document.location.href;
                if (url.indexOf('?') > -1) {
                    url = url.substring(0, url.indexOf('?'));
                }
                url = url.substring(url.lastIndexOf('/') + 1);
                this.pageName = url.replace('.aspx', '');
            }
            return this.pageName;
        },
        formatEditing: function (inDatum, inRowIndex) {
            //			this.needFormatNode(inDatum, inRowIndex);
            //			var h = [ '<select class="dojoxGridSelect">' ];
            //			for (var i=0, o, v; ((o=this.options[i]) !== undefined)&&((v=this.values[i]) !== undefined); i++){
            //				h.push("<option", (inDatum==v ? ' selected' : ''), ' value="' + v + '"', ">", o, "</option>");
            //			}
            //			h.push('</select>');
            //			return h.join('');
            //debugger;
        },
        format: function (inRowIndex, inItem) {
            // summary:
            //	provides the html for a given grid cell.
            // inRowIndex: int
            // grid row index
            // returns: html for a given grid cell
            if (inItem === null) { return this.defaultValue; }
            var entName,
			    entKey,
			    dispVal,
			    vals = [],
			    target = '',
                queryParams = '',
                moreQuerystring = '',
			    i = this.grid.edit.info,
			    idx = 0,
			    d = this.get ? this.get(inRowIndex, inItem) : (this.value || this.defaultValue);
            
            //build up display string if formatstring was specified...
            if ((this.displayFormatString) && (this.displayFormatString !== '')) {
                if (this.displayFields.length < 1) {
                    vals.push(d);
                }
                for (idx; idx < this.displayFields.length; idx++) {
                    vals.push(Utility.getValue(inItem, this.displayFields[idx].trim()));
                }
                d = dojo.string.substitute(this.displayFormatString, vals);
            }
            //handle target...
            if (this.target !== '') {
                //target = String.format(' target="{0}" ', this.target);
                target = dojo.string.substitute(' target="${0}" ', [this.target]);
            }
            //handle additional querystring parameters
            if (this.queryParams) {
                if (typeof this.queryParams === 'object') {
                    moreQuerystring = "&" + dojo.objectToQuery(this.queryParams);
                } else if (typeof this.queryParams === 'string') {
                    moreQuerystring = "&" + this.queryParams;
                }
            }
            d = (d && d.replace && this.grid.escapeHTMLInData) ? d.replace(/&/g, '&amp;').replace(/</g, '&lt;') : d;
            if (this.editable && (this.alwaysEditing || (i.rowIndex == inRowIndex && i.cell == this))) {
                return this.formatEditing(d, inRowIndex);
            } else {
                dispVal = this._defaultFormat(d, [d, inRowIndex, this]);
                if (this.image !== '') {
                    dispVal = dojo.string.substitute('<img src="${0}" alt="${1}" />', [this.image.replace(/^~\//, ''), dispVal]);
                }
                //check security access...
                if (this.appliedSecurity !== '') {
                    var svc = Sage.Services.getService("RoleSecurityService");
                    if (svc) {
                        if (!svc.hasAccess(this.appliedSecurity)) {
                            dispVal = this._getDisplayValue(inRowIndex, inItem, dispVal);
                            return dispVal;
                        }
                    }
                }
                if (this.idField !== '') {
                    //entity page linking...
                    var pagename = this.getPageName();
                    entKey = Utility.getValue(inItem, this.idField);
                    if (!entKey) {
                        var keyname = (this.idField === 'id') ? '$key' : this.idField.replace(/\.[iI]d/g, '.$key');
                        entKey = Utility.getValue(inItem, keyname);
                    }
                    if (entKey) {
                        dispVal = this._getDisplayValue(inRowIndex, inItem, dispVal);

                        if (pagename.toUpperCase() === 'HISTORY') {
                            return dojo.string.substitute('<a href="javascript:Sage.Link.editHistory(\'${0}\')" id="${0}" title="${1}">${1}</a>', [entKey, dispVal]);
                        }
                        else {
                            return dojo.string.substitute('<a href="${0}.aspx?entityid=${1}&modeid=Detail${2}"${3} id="${1}" title="${4}">${4}</a>', [pagename, entKey, moreQuerystring, target, dispVal]);
                        }
                    }
                } else {
                    //binding to url field(s) for linking...
                    var urlFmt = (this.urlFormatString !== '') ? this.urlFormatString : '${0}';
                    vals = [];
                    if (this.urlFields.length < 1) {
                        vals.push(d);
                    }
                    for (idx = 0; idx < this.urlFields.length; idx++) {
                        vals.push(Utility.getValue(inItem, dojo.trim(this.urlFields[idx])));
                    }
                    dispVal = this._getDisplayValue(inRowIndex, inItem, dispVal);
                    return dojo.string.substitute('<a href="http://${0}${1}"${2}>${3}</a>', [dojo.string.substitute(this.urlFormatString, vals), moreQuerystring, target, dispVal]);
                }
                return dispVal;
            }
        },
        markupFactory: function (node, cell) {
            dojox.grid.cells.Cell.markupFactory(node, cell);
            var d = dojo;
            var displayFields = d.trim(d.attr(node, 'displayFields') || '');
            if (displayFields) {
                var f = displayFields.split(',');
                //if (f[0] != displayFields) {
                cell.displayFields = f;
                //}
            }
            cell.displayFormatString = d.trim(d.attr(node, 'displayFormatString') || "");
            cell.idField = d.trim(d.attr(node, 'idField') || '');
            cell.pageName = d.trim(d.attr(node, 'pageName') || '');
            cell.appliedSecurity = d.trim(d.attr(node, 'appliedSecurity') || '');
            cell.image = d.trim(d.attr(node, 'image') || '');
            var urlFields = d.trim(d.attr(node, 'urlFields') || '');
            if (urlFields) {
                var u = urlFields.split(',');
                //if (u[0] !== urlFields) {
                cell.urlFields = u;
                //}
            }
            cell.urlFormatString = d.trim(d.attr(node, 'urlFormatString') || '');
            cell.target = d.trim(d.attr(node, 'target') || '');
            if (d.hasAttr(node, 'queryParams')) {
                cell['queryParams'] = d.trim(d.attr(node, 'queryParams') || '');
            }
        }
    });

    var convert = Utility.Convert;

    return widget;
});
