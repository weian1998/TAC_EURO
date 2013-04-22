/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       "dijit/_Widget",
       "Sage/_Templated",
       "dijit/form/ValidationTextBox",
       "dojox/validate/regexp",
       "Sage/UI/Controls/TextBox",
       "dojo/_base/declare"
],
function (_Widget, _Templated, ValidationTextBox, regexp, TextBox, declare) {
    //TODO: This hook will be depricated once ClientBindingManagerService has been converted with Dojo.
    dojo.mixin(ValidationTextBox.prototype.attributeMap, { slxchangehook: 'focusNode' });

    var widget = declare("Sage.UI.URL", [_Widget, _Templated], {
        //using Simplate to faciliate conditional display
        widgetTemplate: new Simplate([
            '<div class="urlcontrol" slxcompositecontrol="true" id="{%= $.id %}" >',
            '<input data-dojo-type="Sage.UI.Controls.TextBox" name="{%= $.name %}" ',
            // textWithIcons allows for styling to be applied to a textbox where an icon accompanies the text inside the box.
            'data-dojo-props="textWithIcons: {%= $.buttonVisible %}"',
            'dojoAttachPoint="focusNode" type="text" style="" ',
            'hotKey="{%= $.hotKey %}" ',
             '{% if($.disabled === "disabled") { %} ',
                'disabled="disabled" ',
             '{% } %}',
            '{% if($.readonly === "readonly") { %} ',
                'readonly="readonly" ',
            '{% } %}',
            '{% if ($.disabled !== "disabled") { %} ',
            ' dojoAttachEvent="onChange:formatURLChange, onDblClick:launchWebSite" ',
            '{% } %}',
            ' regExpGen="dojox.validate.regexp.url" tabindex="{%= $.tabIndex %}" ',
            'value="{%= $.url %}" required="{%= $.required %}" ',
            'id="{%= $.id %}_urlText" maxlength="{%= $.maxLength %}" > ',
            '{% if ($.buttonVisible && $.disabled !== "disabled") { %}',
            '<img alt="{%= $.buttonToolTip %}" data-dojo-attach-event="ondijitclick: launchWebSite"   ',
            ' tabindex="{%= $.tabIndex %}" alt="{%= $.buttonToolTip %}" ',
            'src="{%= $.buttonImageUrl %}" title="{%= $.buttonToolTip %}" id="{%= $.id %}_urlButton"> ',
            '{% } %}',
            '</div>'
        ]),
        name: '',
        autoPostBack: false,
        readonly: '',
        disabled: '',
        hotKey: '',
        buttonVisible: true,
        maxLength: 128,
        buttonImageUrl: '',
        buttonToolTip: 'WWW',
        required: false,
        tabIndex: 0,
        url: '',
        webAddressId: '',
        constructor: function (options) {
            options.id = options.webAddressId;
        },
        postCreate: function () {
            this.formatURL();
            this.inherited(arguments);
        },
        widgetsInTemplate: true,
        attributeMap: {
            slxchangehook: { node: 'focusNode', type: 'attribute', attribute: 'slxchangehook'}//,        
        },
        formatURL: function () {
            //TODO: replace with class
            dojo.style(this.focusNode.focusNode, 'color', '#000099');
            dojo.style(this.focusNode.focusNode, 'font-family', 'Tahoma');
        },
        formatURLChange: function () {
            //TODO: Value formatting goes here, if applicable
            if (this.url !== this.focusNode.value) {
                this.url = this.focusNode.value;
            }
        },
        launchWebSite: function () {
            var url = this.url;
            if (url.length < 1) { return; }
            var startURL = "http://";
            var startURL2 = "https://";
            var winH;
            if (url.indexOf(startURL) === -1 && url.indexOf(startURL2) === -1) {
                url = startURL + url;
            }
            winH = window.open(url, '', [
                'dependent=no',
                'directories=yes',
                'location=yes',
                'menubar=yes',
                'resizeable=yes',
                'pageXOffset=0px',
                'pageYOffset=0px',
                'scrollbars=yes',
                'status=yes',
                'titlebar=yes',
                'toolbar=yes'
            ].join(',')
            );
        }
    });

    return widget;
});
