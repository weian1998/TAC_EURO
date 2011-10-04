dojo.provide('Sage.UI.Columns.SlxLink');
dojo.require("dojox.grid.cells._base");
dojo.require('Sage.Format');
(function() {        

//----------------------- move this -----------------------------------------------

Sage.Region = {
    decimalSeparator : '.',
    numberGroupSeparator : ',',
    numberGroupDigits : 3,
    decimalDigits : 2,
    currencySymbol : '$',
    //this.Code = currCode;
    positiveCurrencyPattern : 0,
    negativeCurrencyPattern : 0,
    numberNegativeSign : '-'
}

//---------------------------------------------------------------------------------


    dojo.declare("Sage.UI.Columns.SlxLink", dojox.grid.cells.Cell, {
		// summary:
		// grid cell that provides a link to an entity page
        
        // displayFields: Array
        //      Array of field names to use with string formatter for building up a display value with more than one property.
        //      If this array does not contain any items, the defined field will be used without formatting.
        displayFields: [],
        // displayFormatString: string,
        //      The formatstring to use in formatting the values from the displayFields
        displayFormatString : '',
        // idField: string
        //      The name of the field to be used as the entityid in the querystring
        idField: '',
        // pageName: string
        //      The name of the entity page to generate the link to
        pageName: '',
        // appliedSecurity: string
        //      The 'key' of the secured action the user must have in order to follow the link.
        //      If the user does not have access to the action specified, this field will contain only text.
        appliedSecurity: '',
		// urlFields: Array
		//      Array of field names to use with string formatter for building up the URL.
		urlFields : [],
		// urlFormatString: string
		//      The format string to use with urlFields for building up the url.
		urlFormatString : '{0}',
		// target: string
		//      the 'target' for the link.  If something is specified, a target attribute will be applied to the link.  
		//      Thus enabling the link to open a new tab/window.
		target: '',
		

        getPageName: function() {
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
		formatEditing: function(inDatum, inRowIndex){
//			this.needFormatNode(inDatum, inRowIndex);
//			var h = [ '<select class="dojoxGridSelect">' ];
//			for (var i=0, o, v; ((o=this.options[i]) !== undefined)&&((v=this.values[i]) !== undefined); i++){
//				h.push("<option", (inDatum==v ? ' selected' : ''), ' value="' + v + '"', ">", o, "</option>");
//			}
//			h.push('</select>');
//			return h.join('');
            //debugger;
		},
		format: function(inRowIndex, inItem){
			// summary:
			//	provides the html for a given grid cell.
			// inRowIndex: int
			// grid row index
			// returns: html for a given grid cell
			if (inItem === null) { return this.defaultValue; }
			var f,
			entName,
			entKey,
			dispVal,
			vals = [],
			target = '',
			i=this.grid.edit.info,
			idx = 0,
			d=this.get ? this.get(inRowIndex, inItem) : (this.value || this.defaultValue);
			//build up display string if formatstring was specified...
			if ((this.displayFormatString) && (this.displayFormatString !== '')) {
			    if (this.displayFields.length < 1) {
			        vals.push[d];
			    }
			    for(var idx = 0; idx < this.displayFields.length; idx++) {
			        vals.push(Sage.Utility.getValue(inItem, this.displayFields[idx]));
			    }
			    d = Sage.Format.stringFromArray(this.displayFormatString, vals);
			}
			
			//handle target...
			if (this.target !== '') {
			    //target = String.format(' target="{0}" ', this.target);
                target = dojo.string.substitute(' target="${0}" ', [this.target]);
			}
			
			d = (d && d.replace && this.grid.escapeHTMLInData) ? d.replace(/&/g, '&amp;').replace(/</g, '&lt;') : d;
			if(this.editable && (this.alwaysEditing || (i.rowIndex==inRowIndex && i.cell==this))){
				return this.formatEditing(d, inRowIndex);
			} else {
			    dispVal = this._defaultFormat(d, [d, inRowIndex, this]);
			    //check security access...
			    if (this.appliedSecurity !== '') {
                    var svc = Sage.Services.getService("RoleSecurityService");
                    if (svc) {
                        if (!svc.hasAccess(this.appliedSecurity)) {
                            return dispVal;
                        }
                    }
			    }
			    
			    
			    var pagename = this.getPageName();
                if ((this.urlFormatString !== '{0}') && (this.urlFormatString !== '')) {
                    //binding to url field(s) for linking...
                    vals = [];
                    if (this.urlFields.length < 1) {
                        vals.push[d];
                    }
                    for (idx = 0; idx < this.urlFields.length; idx++) {
                        vals.push(encodeURIComponent(Sage.Utility.getValue(inItem, this.urlFields[idx])));
                    }
                    //return String.format('<a href="{0}"{1}>{2}</a>', Sage.Format.stringFromArray(this.urlFormatString, vals), target, dispVal);
                    return dojo.string.substitute('<a href="${0}"${1}>${2}</a>', [Sage.Format.stringFromArray(this.urlFormatString, vals), target, dispVal]);
                } else if ((pagename !== '') && (this.idField !== '')) {
                    //entity page linking...
			        entKey = Sage.Utility.getValue(inItem, this.idField);
                    if (entKey != '') {
                        //return String.format('<a href="{0}.aspx?entityid={1}&modeid=Detail"{2}>{3}</a>', pagename, entKey, target, dispVal);
                        return dojo.string.substitute('<a href="${0}.aspx?entityid=${1}&modeid=Detail"${2}>${3}</a>', [pagename, entKey, target, dispVal]);
                    }			    
                }
				return dispVal;
			}
		},
	    markupFactory : function(node, cell){
		    dojox.grid.cells.Cell.markupFactory(node, cell);
		    var d=dojo;
            var displayFields = d.trim(d.attr(node, 'displayFields')||'');
            if (displayFields) {
                var f = displayFields.split(',');
                if (f[0] != displayFields) {
                    cell.displayFields = f;
                }
            }
            cell.displayFormatString = d.trim(d.attr(node, 'displayFormatString')||"");
            cell.idField = d.trim(d.attr(node, 'idField')||'');
            cell.pageName = d.trim(d.attr(node, 'pageName')||'');
            cell.appliedSecurity = d.trim(d.attr(node, 'appliedSecurity')||'');
            var urlFields = d.trim(d.attr(node, 'urlFields')||'');
            if (urlFields) {
                var u = urlFields.split(',');
                if (u[0] !== urlFields) {
                    cell.urlFields = u;
                }
            }
            cell.urlFormatString = d.trim(d.attr(node, 'urlFormatString')||'');
            cell.target = d.trim(d.attr(node, 'target')||'');
	    }
	});

})();