/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys */
dojo.provide("Sage.UI.CurrencyTextBox");
dojo.require("dijit.form.CurrencyTextBox");
dojo.require("dojo.currency");

dojo.declare("Sage.UI.CurrencyTextBox",
    [dijit.form.CurrencyTextBox, Sage.UI.NumberTextBox],
	{  }
);
