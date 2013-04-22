define([
    'dojo/string',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dijit/layout/ContentPane',
    'dojox/layout/TableContainer',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'dojo/store/Memory',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/ComboBoxAdvancedPropertyEditor'
], function(
    string,
    declare,
    lang,
    array,
    ContentPane,
    TableContainer,
    TextBox,
    NumberTextBox,
    Select,
    Memory,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.ComboBoxAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlLabelPlacementTooltipText %}">',
                        '<label>{%= $.controlLabelPlacementText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_controlLabelPlacement" data-dojo-attach-event="onChange:_onControlLabelPlacementChange">',
                        '{% for (var placement in $.labelPlacementText) { %}',
                            '<span value="{%= placement %}">{%= $.labelPlacementText[placement] %}</span>',
                        '{% } %}',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.visibleTooltipText %}">',
                        '<label>{%= $.visibleText %}</label>',
                        '<div data-dojo-attach-point="_visible" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onVisibleChange"></div>',
                    '</div>',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.behaviorText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.enabledTooltipText %}">',
                        '<label>{%= $.enabledText %}</label>',
                        '<div data-dojo-attach-point="_enabled" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onEnabledChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.itemGroupText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.dataSourceTooltipText %}">',
                        '<label>{%= $.dataSourceText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_dataSource" data-dojo-attach-event="onChange:_onDataSourceChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.itemsTooltipText %}">',
                        '<label>{%= $.itemsText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_items" data-dojo-attach-event="onChange:_onItemsChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.textFieldTooltipText %}">',
                        '<label>{%= $.textFieldText %}</label>',
                        '<div data-dojo-type="dijit.form.ComboBox" data-dojo-attach-point="_textField" data-dojo-attach-event="onChange:_onTextFieldChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.valueFieldTooltipText %}">',
                        '<label>{%= $.valueFieldText %}</label>',
                        '<div data-dojo-type="dijit.form.ComboBox" data-dojo-attach-point="_valueField" data-dojo-attach-event="onChange:_onValueFieldChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.dataText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.defaultDataBindingTooltipText %}">',
                        '<label>{%= $.defaultDataBindingText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_defaultDataBinding" data-dojo-attach-event="onChange:_onDefaultDataBindingChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.controlInfoText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlIdTooltipText %}">',
                        '<label>{%= $.controlIdText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_controlId" data-dojo-attach-event="onChange:_onControlIdChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.controlTypeTooltipText %}">',
                        '<label>{%= $.controlTypeText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_controlType" data-dojo-attach-event="onChange:_onControlTypeChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
            '</fieldset>'
        ]),

        _controlId: null,
        _controlLabelPlacement: null,
        _controlType: null,
        _dataSource: null,
        _defaultDataBinding: null,
        _enabled: null,
        _items: null,
        _textField: null,
        _valueField: null,
        _visible: null,

        //Localization
        titleText: 'Advanced',

        appearanceText: 'Appearance',
        behaviorText: 'Behavior',
        controlInfoText: 'Control Info',
        dataText: 'Data',
        itemGroupText: 'Items',

        controlIdText: 'Control Id:',
        controlIdTooltipText: 'Identifier for this control.',
        controlLabelPlacementText: 'Label Placement:',
        controlLabelPlacementTooltipText: 'Label position in relation to the control.',
        controlTypeText: 'Control Type:',
        controlTypeTooltipText: 'Sage SalesLogix control type.',
        dataSourceText: 'Data Source:',
        dataSourceTooltipText: 'Source of the data for this control such as another control or an entity.',
        defaultDataBindingText: 'Data Bindings:',
        defaultDataBindingTooltipText: 'Data field(s) in the database used by this control.',
        enabledText: 'Enabled:',
        enabledTooltipText: 'Allows user to interact with this control.',
        itemsText: 'Items:',
        itemsTooltipText: 'Values the user can select.',
        textFieldText: 'Text Field:',
        textFieldTooltipText: 'The name of the data source field used to populate the visible text portion of the list items.',
        valueFieldText: 'Value Field:',
        valueFieldTooltipText: 'The name of the data source field used to populate the value portion of the list items.',
        visibleText: 'Visible:',
        visibleTooltipText: 'Show or hide this control on the form.',
        labelPlacementText: {
            'left': 'Left',
            'right': 'Right',
            'top': 'Top',
            'none': 'None'
        },
        hasItemsText: 'Set',
        noItemsText: 'Not Set',

        constructor: function() {
            lang.mixin(this, localization);
        },

        setup: function(){
            this.inherited(arguments);

            this._controlId.set('value', this._designer.get('controlId'));
            this._controlLabelPlacement.set('value', this._designer.get('controlLabelPlacement'));
            this._controlType.set('value', this._designer.get('controlName'));
            this._enabled.set('value', this._designer.get('enabled'));
            this._items.set('value', this._designer.get('hasItems')? this.hasItemsText : this.noItemsText);
            this._visible.set('value', this._designer.get('visible'));

            var binding = this._designer.get('defaultDataBinding');
            this._defaultDataBinding.set('value', (binding && binding['DataItemName']) || '');

            this.setDataSources();
            this._dataSource.set('value', this._designer.get('dataSource'));
            this._textField.set('value', this._designer.get('textField'));
            this._valueField.set('value', this._designer.get('valueField'));
        },

        setDataSources: function(){
            var dataSources = this.getDataSources(),
                dataSourceNode = this._dataSource;

            dataSourceNode.removeOption(dataSourceNode.getOptions());

            // Add Empty option for user resetting
            dataSourceNode.addOption({
                label: '',
                value: '_-1'
            });
            dataSourceNode.addOption({
                label: 'MainEntity',
                value: 'MainEntity'
            });

            array.forEach(dataSources, function(source){
                this.addOption(lang.mixin({
                    label: source.get('controlId'),
                    value: source.get('controlId')
                }, source.entry));
            }, dataSourceNode);

            // Disabled until support for Items and DataSources Added
            //dataSourceNode.set('disabled', false);
        },
        getDataSources: function(){
            var controls = this._designer.get('form').get('controls'),
                sources = [];
            array.forEach(controls, function(control){
                if (control instanceof Sage.QuickForms.Design.DataSourceDesigner)
                    this.push(control);
            }, sources);

            return sources;
        },
        getSelectedItem: function(value){
            var dataSourceNode = this._dataSource;
            for(var i = 0; i < dataSourceNode.options.length; i++)
            {
                var item = dataSourceNode.options[i];
                if (item.value === value)
                    return item || null;
            }
            return null;
        },
        updateFieldStore: function(field, store, searchAttr){
            field.store.destroy && field.store.destroy();
            field.set('store', store);
            field.set('searchAttr', searchAttr);
            field.set('disabled', false);
        },
        createSDataPropertyStore: function(entity){
            return new Sage.Data.SDataStore({
                service: Sage.Data.SDataServiceRegistry.getService('metadata'),
                collection: '$resources.0.properties.$resources',
                resourceKind: 'entities',
                resourcePredicate: string.substitute("'${0}'", [entity])
            });
        },

        _onControlIdChange: function(value){
        },
        _onControlLabelPlacementChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('controlLabelPlacement', value);
        },
        _onControlTypeChange: function(value){
        },
        _onDefaultDataBindingChange: function(value){
        },
        _onDataSourceChange: function(value){
            // Disabled until support for Items and DataSources Added
            /*
            var item = this.getSelectedItem(value),
                entity = (item && item.EntityTypeName) || null,
                textFieldNode = this._textField,
                valueFieldNode = this._valueField,
                store = (entity)
                    ? this.createSDataPropertyStore(entity)
                    : new Memory(); // empty store

            this.updateFieldStore(textFieldNode, store, 'propertyName');
            this.updateFieldStore(valueFieldNode, store, 'propertyName');

            if (this.isSuspended()) return;

            textFieldNode.set('value', '');
            valueFieldNode.set('value', '');
            this._designer.set('dataSource', item.ControlId || value);
            */
        },
        _onEnabledChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('enabled', value);
        },
        _onItemsChange: function(value){
        },
        _onTextFieldChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('textField', value);
        },
        _onValueFieldChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('valueField', value);
        },
        _onVisibleChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('visible', value);
        }
    });
});