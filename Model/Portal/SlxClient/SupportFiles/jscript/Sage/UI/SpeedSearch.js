/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_TemplatedMixin',
       'dijit/_WidgetsInTemplateMixin',
       'dojo/i18n',
       'dojo/text',
       'dijit/_Widget',
       'Sage/UI/TextBox',
       'Sage/UI/ImageButton',
       'Sage/UI/ToggleButton',
       'dojo/i18n!./nls/SpeedSearch',
       'dojo/text!../templates/SpeedSearch.html',
       'dojo/_base/declare'
],
function (_TemplatedMixin, _WidgetsInTemplateMixin, i18n, text, _Widget, TextBox, ImageButton, ToggleButton, nls, template, declare) {
    //dojo.requireLocalization('Sage.UI', 'SpeedSearch');

    /**
    * @class Sage.UI.SpeedSearch
    * This class is a composite object made up of:
    * @see Sage.UI.TextBox
    * @see Sage.UI.ImageButton
    * @see Sage.UI.ToggleButton
    */
    var speedSearchWidget = declare('Sage.UI.SpeedSearch', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        standardText: 'standard',
        advancedText: 'advanced',
        speedSearchText: 'SpeedSearch',
        /**
        * Mixin the localization object for this locale
        */
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization('Sage.UI', 'SpeedSearch'));
            this.inherited(arguments);
        },
        /**
        * create instances of the cosumed UI elemets and display them
        */
        postCreate: function () {

            var that = this;
            // Are we on the SpeedSearch page?
            var re = /SpeedSearch\.aspx|speedsearch\.aspx/;
            this.isSS = re.test(window.location.pathname);
            // grab a ref to the query string
            this.QS = window.location.search;
            // use dojo's method to convert to hash if present
            if (this.QS) {
                this.queryObject = dojo.queryToObject(this.QS.substring(1, this.QS.length));
            }

            var toggleBtn = new ToggleButton({
                showLabel: true,
                checked: false,
                'class': 'quick-speedsearch-toggle',
                onClick: function () {
                    if (this.getValue() === that.standardText) {
                        this.setValue(that.advancedText);
                        if (that.isSS) { that.toggleAdv(); }
                    } else {
                        this.setValue(that.standardText);
                        if (that.isSS) { that.toggleAdv(); }
                    }
                },
                label: this.queryObject ? this.queryObject.type :
                    this.standardText
            },
            "ss-btn-toggle");

            toggleBtn.set('class', 'displaynone');
            //wen the SS page is loaded, open the Advanced div if selected
            if (toggleBtn.getValue() === this.advancedText && this.isSS) {
                this.toggleAdv();
            }

            var txtbox = new TextBox({
                watermark: true,
                value: this.speedSearchText,
                'class': 'quick-speedsearch-text',
                onKeyDown: function (event) {
                    if (event.keyCode === 13) {
                        that._goSearch(txtbox.getValue(), toggleBtn.getValue());
                    }
                }
            }, 'txt_ss');

            // if there is a query string object hydrate the searchbox
            // and force focus it
            if (this.queryObject) { txtbox.forceFocus(this.queryObject.terms); }

            var imgBtn = new ImageButton({
                imageClass: 'icon_SpeedSearch_16x16',
                'class': 'quick-speedsearch-button',
                onClick: function () {
                    that._goSearch(txtbox.getValue(), toggleBtn.getValue());
                }
            }, 'ss-btn-image');


            this.inherited(arguments);
        },
        /**
        * Utility method which appends arguments to the query string
        * and sends the user to the Speed Search.aspx page
        */
        _goSearch: function (terms, type) {
            if (terms !== this.speedSearchText) {
                window.location = "SpeedSearch.aspx?terms=" + terms +
                    "&type=" + type;
            }
        },
        toggleAdv: function () {
            ToggleAdvanced();
        }
    });

    return speedSearchWidget;
});
