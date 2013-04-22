/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_Widget',
       'Sage/_Templated',
       'Sage/UI/Controls/TextBox',
       'dojox/validate/regexp',
       'dojo/_base/declare'
],
function (_Widget, _Templated, textBox, regexp, declare) {
    var widget = declare("Sage.UI.Controls.Email", [_Widget, _Templated], {
        //using Simplate to faciliate conditional display
        widgetTemplate: new Simplate([
            '<div class="email" slxcompositecontrol="true" id="{%= $.id %}" >',
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
            ' dojoAttachEvent="onChange:_onChange, onDblClick:sendEmail" ',
            '{% } %}',
            ' regExpGen="dojox.validate.regexp.emailAddress"  tabindex="{%= $.tabIndex %}" ',
            'value="{%= $.email %}" required="{%= $.required %}" ',
            'id="{%= $.id %}_emailText" maxlength="{%= $.maxLength %}" > ',
            '{% if ($.buttonVisible && $.disabled !== "disabled") { %}',
            '<img alt="{%= $.buttonToolTip %}" tabindex="{%= $.tabIndex %}" data-dojo-attach-event="ondijitclick: sendEmail" ',
            'style="padding-left:0;cursor: pointer; vertical-align: left;" ',
            'src="{%= $.buttonImageUrl %}" ',
            'title="{%= $.buttonToolTip %}" id="{%= $.id %}_emailButton"> ',
            '{% } %}',
            '</div>'
        ]),
        shouldPublishMarkDirty: true,
        name: '',
        autoPostBack: false,
        displayMode: '',
        _class: '',
        textboxToolTip: '',
        textboxStyle: '',
        readonly: '',
        disabled: '',
        hotKey: '',
        maxLength: 128,
        buttonVisible: true,
        buttonImageUrl: '',
        buttonToolTip: '',
        buttonStyle: '',
        required: false,
        tabIndex: 0,
        email: '',
        emailId: '',
        constructor: function (options) {
            options.id = options.emailId;
        },
        postCreate: function () {
            this.formatEmail();
            this.inherited(arguments);
        },
        formatEmail: function () {
            //TODO: replace with class
            dojo.style(this.focusNode.focusNode, 'color', '#000099');
        },
        widgetsInTemplate: true,
        _onChange: function (newValue) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            this.formatEmailChange();
        },
        formatEmailChange: function () {
            //TODO: Value formatting goes here, if applicable
            if (this.email !== this.focusNode.value) {
                this.email = this.focusNode.value;
            }
        },
        sendEmail: function () {
            var email = this.email;
            email = "mailto:" + email;
            document.location.href = email;
        }
    });

    return widget;
});
