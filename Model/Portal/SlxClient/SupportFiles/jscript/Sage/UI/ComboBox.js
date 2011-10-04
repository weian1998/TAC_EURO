/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys */
dojo.provide("Sage.UI.ComboBox");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.currency");

dojo.declare("Sage.UI.ComboBox",
    [dijit.form.ComboBox],
	{
	    _onKeyPress: function (e) {
	        //ToDo: Enable option to allow free text
	        //ToDo: Fix tab out option to auto complete on elements that do not allow free text.
	        // if (option to allow free text (i.e. picklist) === false) {
	        //if (e.constructor.DOM_VK_DOWN !== e.charOrCode && e.constructor.DOM_VK_IP !== e.charOrCode) {
	        dojo.stopEvent(e);
            //}
	        // }
	    }
	}
);
