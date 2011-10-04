/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys */
dojo.provide("Sage.UI.NumberTextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dojo.number");

dojo.declare("Sage.UI.NumberTextBox",
	dijit.form.NumberTextBox,
	{
        textAlign: '',
	    _getValueAttr: function () {
	        var v = this.inherited(arguments);
	        // the inherited stuff is too picky about decimal digits, we handle it our way,
	        // when dojo doesn't like the number of digits, it returns undefined.
	        if ((typeof v === 'undefined' || isNaN(v)) && this.textbox.value !== '') {
	            var tbVal = this.textbox.value;
	            if (tbVal.lastIndexOf(Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator) === tbVal.length - 1) {
	                tbVal = tbVal.slice(0, tbVal.length - 1);
	            }
	            v = dojo.number.parse(tbVal, { locale: Sys.CultureInfo.CurrentCulture.name });
	            if (isNaN(v)) {
	                v = this.value;
	            }
	            //v = dojo.number.format(v, dojo.mixin(this.constraints, { locale: Sys.CultureInfo.CurrentCulture.name }));
	        }
	        return v;
	    },
	    _setValueAttr: function (v) {
	        this.constraints['locale'] = Sys.CultureInfo.CurrentCulture.name;
	        this.inherited(arguments);
	    },
	    // summary:
	    // A custom validating number textbox
	    _onBlur: function () {
	        // summary:
	        // Restrict value to the decimal digit specified on the control 
	        if (this.constraints.places) {
	            this.textbox.value = Sage.Utility.restrictDecimalDigit(this.textbox.value, this.constraints.places);
	            this.textbox.value = Sage.Utility.maximizeDecimalDigit(this.textbox.value, this.constraints.places);
	            //this.focusNode.value = this.textbox.value;
	            this.value = this.textbox.value;
	        }	        
	        return this.inherited(arguments);
	    },
	    _sageUINumberTextBox_IsValid: function () {
	        //summary:
            // 	        
	        //In IE dojo makes two passes through validation.  Only on the second pass is the new value present.
	        if (dojo.isIE) {
	            if (this.oldValue !== this.textbox.value) {
	                var trim = this._restrictDD();
                    if (trim !== this.textbox.value) {
                        this.textbox.value = trim;
                    }
	            }
	            this.oldValue = this.textbox.value;
	        }
	        else {
	            this.textbox.value = this._restrictDD();
	        }
	    },
	    _restrictDD: function () {
	        var retVal;
	        if (this.constraints.places) {
	            retVal = Sage.Utility.restrictDecimalDigit(this.textbox.value, this.constraints.places);
	        }
	        else if (this.constraints.maxPlaces) {
	            retVal = Sage.Utility.restrictDecimalDigit(this.textbox.value, this.constraints.maxPlaces);
	        }
	        return retVal
	    },
	    _sageUINumberTextBox_KeyPress: function (/*Event*/e) {
	        if (!Sage.Utility.restrictToNumberOnKeyPress(e, (typeof this.formatType !== 'undefined') ? this.formatType.toLowerCase() : 'currency')) {
	            dojo.stopEvent(e);
	        }
	    },
	    _sageUINumberTextBox_OnFocus: function (/*Event*/e) {
	        // Templated widgets are having difficulty remaining selectable in IE.  Reset their attribute to ensure access.
	        dojo.setSelectable(this.domNode, true);
	    },
	    postCreate: function () {
	        this.inherited(arguments);
	        //summary:
	        // Wire up event handlers and to add keystroke restrictions.
	        var self = this;

	        //Set the text alignment preference from the configuration object.
	        dojo.style(self.focusNode, 'textAlign', self.textAlign);

	        //Event handlers
	        dojo.connect(self, 'isValid', self._sageUINumberTextBox_IsValid);
	        dojo.connect(self, 'onKeyPress', self._sageUINumberTextBox_KeyPress);
	        dojo.connect(self, 'onFocus', self._sageUINumberTextBox_OnFocus);
	    }
	}
);