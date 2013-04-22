define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/layout/ContentPane',
    'dojox/layout/TableContainer',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/Select',
    'dojo/data/ItemFileWriteStore',
    'Sage/_Templated',
    './_PropertyEditor',
    '../PropertyValueError',
    'dojo/i18n!./nls/PickListAdvancedPropertyEditor'
], function(
    declare,
    lang,
    ContentPane,
    TableContainer,
    TextBox,
    NumberTextBox,
    Select,
    ItemFileWriteStore,
    _Templated,
    _PropertyEditor,
    PropertyValueError,
    localization)
{
    return declare('Sage.QuickForms.Design.Editors.PickListAdvancedPropertyEditor', [ContentPane, _PropertyEditor, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<fieldset><legend>{%= $.appearanceText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.displayModeTooltipText %}">',
                        '<label>{%= $.displayModeText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_displayMode" data-dojo-attach-event="onChange:_onDisplayModeChange">',
                        '{% for (var mode in $.displayModeTypeText) { %}',
                            '<span value="{%= mode %}">{%= $.displayModeTypeText[mode] %}</span>',
                        '{% } %}',
                        '</div>',
                    '</div>',
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
                    '<div class="editor-field" title="{%= $.allowMultiplesTooltipText %}">',
                        '<label>{%= $.allowMultiplesText %}</label>',
                        '<div data-dojo-attach-point="_allowMultiples" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onAllowMultiplesChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.canEditTextTooltipText %}">',
                        '<label>{%= $.canEditTextText %}</label>',
                    '<div data-dojo-attach-point="_canEditText" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onCanEditTextChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.enabledTooltipText %}">',
                        '<label>{%= $.enabledText %}</label>',
                        '<div data-dojo-attach-point="_enabled" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onEnabledChange"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.mustExistInListTooltipText %}">',
                        '<label>{%= $.mustExistInListText %}</label>',
                        '<div data-dojo-attach-point="_mustExistInList" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onMustExistInListChange"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.maxLengthTooltipText %}">',
                        '<label>{%= $.maxLengthText %}</label>',
                        '<div data-dojo-type="dijit.form.NumberTextBox" data-dojo-attach-point="_maxLength" data-dojo-attach-event="onChange:_onMaxLengthChange" data-dojo-props="constraints:{min:-1,places:0}"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.requiredTooltipText %}">',
                        '<label>{%= $.requiredText %}</label>',
                        '<div data-dojo-attach-point="_required" data-dojo-type="dijit.form.CheckBox" data-dojo-attach-event="onChange:_onRequiredChange"></div>',
                    '</div>',
                '</div>',
            '</fieldset>',

            '<fieldset><legend>{%= $.dataText %}</legend>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.defaultDataBindingTooltipText %}">',
                        '<label>{%= $.defaultDataBindingText %}</label>',
                        '<div data-dojo-type="dijit.form.TextBox" data-dojo-attach-point="_defaultDataBinding" data-dojo-attach-event="onChange:_onDefaultDataBindingChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                    '<div class="editor-field" title="{%= $.pickListNameTooltipText %}">',
                        '<label>{%= $.pickListNameText %}</label>',
                        '<div data-dojo-type="dijit.form.ComboBox" data-dojo-attach-point="_pickListName" data-dojo-attach-event="onChange:_onPickListNameChange" data-dojo-props="disabled:true"></div>',
                    '</div>',
                '</div>',
                '<div class="editor-content-half">',
                    '<div class="editor-field" title="{%= $.storageModeTooltipText %}">',
                        '<label>{%= $.storageModeText %}</label>',
                        '<div data-dojo-type="dijit.form.Select" data-dojo-attach-point="_storageMode" data-dojo-attach-event="onChange:_onStorageModeChange" data-dojo-props="disabled:true">',
                        '{% for (var mode in $.storageModeTypeText) { %}',
                            '<span value="{%= mode %}">{%= $.storageModeTypeText[mode] %}</span>',
                        '{% } %}',
                        '</div>',
                    '</div>',
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

        _allowMultiples: null,
        _canEditText: null,
        _controlType: null,
        _controlId: null,
        _controlLabelPlacement: null,
        _defaultDataBinding: null,
        _displayMode: null,
        _enabled: null,
        _maxLength: null,
        _mustExistInList: null,
        _pickListName: null,
        _required: null,
        _storageMode: null,
        _visible: null,

        pickListRequest: null,

        //Localization
        titleText: 'Advanced',

        appearanceText: 'Appearance',
        behaviorText: 'Behavior',
        controlInfoText: 'Control Info',
        dataText: 'Data',

        allowMultiplesText: 'Allow Multiple Selections:',
        allowMultiplesTooltipText: 'Allows user to select more than one item.',
        canEditTextText: 'Can Edit Text:',
        canEditTextTooltipText: 'Allows user to type value.',
        controlIdText: 'Control Id:',
        controlIdTooltipText: 'Identifier for this control.',
        controlLabelPlacementText: 'Label Placement:',
        controlLabelPlacementTooltipText: 'Label position in relation to the control.',
        controlTypeText: 'Control Type:',
        controlTypeTooltipText: 'Sage SalesLogix control type.',
        defaultDataBindingText: 'Data Bindings:',
        defaultDataBindingTooltipText: 'Data field(s) in the database used by this control.',
        displayModeText: 'Display Mode:',
        displayModeTooltipText: 'Mode of display of control: text box, hyperlink, or plain text.',
        enabledText: 'Enabled:',
        enabledTooltipText: 'Allows user to interact with this control.',
        maxLengthText: 'Max Length:',
        maxLengthTooltipText: 'Maximum number of characters user can enter.',
        mustExistInListText: 'Item Must Exist:',
        mustExistInListTooltipText: 'Requires typed value to be on list.',
        pickListNameText: 'Pick List Name:',
        pickListNameTooltipText: 'Name of the list of values the user can select from when entering data.',
        requiredText: 'Required:',
        requiredTooltipText: 'Requires a value when saving data.',
        storageModeText: 'Storage Mode:',
        storageModeTooltipText: 'How the value is stored: Text, Id, or Code.',
        visibleText: 'Visible:',
        visibleTooltipText: 'Show or hide this control on the form.',
        labelPlacementText: {
            'left': 'Left',
            'right': 'Right',
            'top': 'Top',
            'none': 'None'
        },
        displayModeTypeText: {
            'AsControl': 'As Control',
            'AsText': 'As Text',
            'AsHyperlink': 'As Hyperlink'
        },
        storageModeTypeText: {
            'Text': 'Text',
            'Id': 'ID',
            'Code': 'Code'
        },
        pickListRequestErrorText: 'Unable to retrieve picklists from server.',


        constructor: function() {
            lang.mixin(this, localization);
        },
        setup: function(){
            this.inherited(arguments);

            // set to readonly until support is added
            //this.requestPickListNames();


            this._allowMultiples.set('value', this._designer.get('allowMultiples'));
            this._canEditText.set('value', this._designer.get('canEditText'));
            this._controlType.set('value', this._designer.get('controlName'));
            this._controlId.set('value', this._designer.get('controlId'));
            this._controlLabelPlacement.set('value', this._designer.get('controlLabelPlacement'));
            this._displayMode.set('value', this._designer.get('displayMode'));
            this._enabled.set('value', this._designer.get('enabled'));
            this._maxLength.set('value', this._designer.get('maxLength'));
            this._mustExistInList.set('value', this._designer.get('mustExistInList'));
            this._pickListName.set('value', this._designer.get('pickListName'));
            this._required.set('value', this._designer.get('required'));
            this._storageMode.set('value', this._designer.get('storageMode'));
            this._visible.set('value', this._designer.get('visible'));

            var binding = this._designer.get('defaultDataBinding');
            this._defaultDataBinding.set('value', (binding && binding['DataItemName']) || '');
        },
        destroy: function(){
            if(this.pickListRequest)
                this.pickListRequest.abort();

            this.inherited(arguments);
        },

        createPickListRequest: function(){
            var request = new Sage.SData.Client.SDataResourceCollectionRequest(this.dataService)
                .setCount(300)
                .setStartIndex(0);

            request.setResourceKind('picklists');
            request.setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.OrderBy, 'name asc');

            return request;
        },
        requestPickListNames: function(){
            var request = this.createPickListRequest();
            if (request)
                this.pickListRequest = request.read({
                    success: this.onRequestPickListNamesSuccess,
                    failure: this.onRequestPickListNamesFailure,
                    scope: this
                });
        },
        onRequestPickListNamesSuccess: function(feed){
            this.pickListRequest = null;
            this.processPickListFeed(feed);
        },
        onRequestPickListNamesFailure: function(response, o){
            this.pickListRequest = null;
            alert(string.substitute(this.pickListRequestErrorText, [response, o]));
        },
        processPickListFeed: function(feed){
            if (!feed['$resources']) return;

            var options = new ItemFileWriteStore({
                data: {
                    identifier: '$key',
                    label: 'name',
                    items: []
                }
            });

            for (var i = 0; i < feed['$resources'].length; i++)
            {
                var entry = feed['$resources'][i];
                if (entry.name)
                    options.newItem(entry);
            }

            this._pickListName.set({
                store: options,
                disabled: false
            });
        },


        _onAllowMultiplesChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('allowMultiples', value);
        },
        _onCanEditTextChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('canEditText', value);
        },
        _onControlTypeChange: function(value){
        },
        _onControlIdChange: function(value){
        },
        _onControlLabelPlacementChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('controlLabelPlacement', value);
        },
        _onDefaultDataBindingChange: function(value){
        },
        _onDisplayModeChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('displayMode', value);
        },
        _onEnabledChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('enabled', value);
        },
        _onMaxLengthChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('maxLength', value);
        },
        _onMustExistInListChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('mustExistInList', value);
        },
        _onPickListNameChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('pickListName', value);

            var selectedItem = this._pickListName.get('item');
            this._designer.set('pickListId', selectedItem['$key'][0]);
        },
        _onRequiredChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('required', value);
        },
        _onStorageModeChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('storageMode', value);
        },
        _onVisibleChange: function(value){
            if (this.isSuspended()) return;
            this._designer.set('visible', value);
        }
    });
});