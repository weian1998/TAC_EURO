define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/layout/ContentPane',
    'dijit/form/TextBox',
    'dojo/data/ItemFileWriteStore',
    'Sage/_Templated',
    './_PropertyEditor',
    'dojo/i18n!./nls/FormBasicPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TextBox,
    ItemFileWriteStore,
    _Templated,
    _PropertyEditor,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.FormBasicPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.generalText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.activeControlTooltipText %}">',
                        '<label>{%= $.activeControlText %}</label>',
                        '<div data-dojo-type="dijit.form.ComboBox" data-dojo-attach-point="_activeControl" data-dojo-attach-event="onChange:_onActiveControlChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.nameTooltipText %}">',
                        '<label>{%= $.nameText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_name" data-dojo-attach-event="onChange:_onNameChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.descriptionTooltipText %}">',
                        '<label>{%= $.descriptionText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_description" data-dojo-attach-event="onChange:_onDescriptionChange"></div>',
                    '</div>',
                '</div>',
            '</fieldset>'
        ]),

        _activeControl: null,
        _description: null,
        _name: null,

        // Localization
        titleText: 'Basic',
        generalText: 'General',

        activeControlText: 'Active Control:',
        activeControlTooltipText: 'The control the user\'s cursor starts on.',
        descriptionText: 'Description:',
        descriptionTooltipText: 'Optional description of the purpose of the form.',
        nameText: 'Name:',
        nameTooltipText: 'Form identifier used by the system.',

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function() {
            this.inherited(arguments);

            this.setActiveControlList();

            this._activeControl.set('value', this._designer.get('activeControl'));
            this._description.set('value', this._designer.get('description'));
            this._name.set('value', this._designer.get('name'));
        },

        setActiveControlList: function(){
            var controls = this._designer.get('controls'),
                options = new ItemFileWriteStore({
                    data: {
                        identifier: 'key',
                        label: 'name',
                        items: []
                    }
            });

            for (var i = 0; i < controls.length; i++)
            {
                var control = controls[i];
                if (control.entry && control.entry['ControlId'])
                    options.newItem({
                        key: 'control_'+i,
                        name: control.entry['ControlId']
                    });
            }

            this._activeControl.set({
                store: options,
                disabled: false
            });
        },

        _onActiveControlChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('activeControl', value);
        },
        _onNameChange: function(value){
        },
        _onDescriptionChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('description', value);
        }
    });
});