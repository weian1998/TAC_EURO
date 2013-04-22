define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    './TextBoxControlDesigner',
    './Editors/LayoutPropertyEditor',
    './Editors/TextBoxBasicPropertyEditor',
    './Editors/TextBoxAdvancedPropertyEditor',
    'dojo/i18n!./nls/UrlControlDesigner'
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
    return declare('Sage.QuickForms.Design.UrlControlDesigner', [TextBoxControlDesigner], {
        designSupport: {
            visible: true
        },
        editors: [
            TextBoxBasicPropertyEditor,
            TextBoxAdvancedPropertyEditor,
            LayoutPropertyEditor
        ],
        widgetTemplate: new Simplate([
            '<div class="{%= $.fieldClass %} design-url" data-dojo-attach-point="containerNode">',
            '<div class="{%= $.fieldClass %}-caption" data-dojo-attach-point="designCaptionNode"></div>',
            '<div class="{%= $.fieldClass %}-field">',
                '<span data-dojo-attach-point="designBindingNode"></span>',
                '<div class="design-url-icon"></div>',
            '</div>',
            '</div>'
        ]),

        helpTopicName: 'URL_control',
        quickFormControlType: 'Sage.SalesLogix.QuickForms.QFControls.QFSLXUrl, Sage.SalesLogix.QuickForms.QFControls',

        //Localization
        displayNameText: 'Url',

        constructor: function() {
            lang.mixin(this, localization);
        }
    });
});