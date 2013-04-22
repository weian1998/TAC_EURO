define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    './TextBoxControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/TextBoxBasicPropertyEditor',
    './Editors/TextBoxAdvancedPropertyEditor',
    'dojo/i18n!./nls/EmailControlDesigner'
], function(
    declare,
    array,
    lang,
    TextBoxControlDesigner,
    LayoutPropertyEditor,
    TextBoxBasicPropertyEditor,
    TextBoxAdvancedPropertyEditor,
    localization
) {
    return declare('Sage.QuickForms.Design.EmailControlDesigner', [TextBoxControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            TextBoxBasicPropertyEditor,
            TextBoxAdvancedPropertyEditor,
            LayoutPropertyEditor
        ],
        widgetTemplate: new Simplate([
            '<div class="{%= $.fieldClass %} design-email" data-dojo-attach-point="containerNode">',
            '<div class="{%= $.fieldClass %}-caption" data-dojo-attach-point="designCaptionNode"></div>',
            '<div class="{%= $.fieldClass %}-field">',
                '<span data-dojo-attach-point="designBindingNode"></span>',
                '<div class="design-email-icon"></div>',
            '</div>',
            '</div>'
        ]),

        helpTopicName: 'Email_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFSLXEmail, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Email',

        constructor: function() {
            lang.mixin(this, localization);
        }
    });
});