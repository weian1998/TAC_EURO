define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/json',
    'dojo/string',
    'dojo/topic',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/dom-attr',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'dijit/form/Select',
    'Sage/Services/_ServiceMixin',
    'Sage/_Templated',
    'Sage/Utility',
    'Sage/UI/ImageButton',
    './Help',
    './DesignSurface',
    './FormDesigner',
    './NonVisibleControlContainer',
    './PropertyEditorContainer',
    'dojo/i18n!./nls/DesignPanel'
], function (
    declare,
    array,
    lang,
    json,
    string,
    topic,
    domConstruct,
    domClass,
    domAttr,
    BorderContainer,
    ContentPane,
    Select,
    _ServiceMixin,
    _Templated,
    Utility,
    ImageButton,
    Help,
    DesignSurface,
    FormDesigner,
    NonVisibleControlContainer,
    PropertyEditorContainer,
    localization
) {
    return declare('Sage.QuickForms.Design.DesignPanel', [BorderContainer, _ServiceMixin, _Templated], {
        serviceMap: {
            'dataService': { type: 'sdata', name: 'metadata' }
        },
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<div class="design-panel-toolbar" data-dojo-type="dijit.Toolbar" data-dojo-props="region: \'top\', align: \'right\', splitter: false">',
            '<span class="design-panel-culture-label">{%: $.cultureText %}</span><div class="design-panel-culture" data-dojo-type="dijit.form.Select" data-dojo-attach-point="_cultureSelect" data-dojo-attach-event="onChange:_onCultureChange"></div>',
            '<div data-dojo-type="Sage.UI.ImageButton" icon="images/icons/Save_16x16.gif" tooltip="{%: $.saveText %}" data-dojo-attach-point="saveIcon" data-dojo-attach-event="onClick:save" class="design-panel-save"></div>',
            '<div data-dojo-type="Sage.UI.ImageButton" icon="images/icons/Help_16x16.png" tooltip="{%: $.helpText %}" data-dojo-attach-event="onClick:help" class="design-panel-help"></div>',
            '</div>',
            '<div class="design-panel-surface" data-dojo-type="Sage.QuickForms.Design.DesignSurface"  data-dojo-attach-point="designSurface" data-dojo-props="region: \'center\'"></div>',
            '<div class="design-panel-hidden" data-dojo-type="Sage.QuickForms.Design.NonVisibleControlContainer" data-dojo-attach-point="nonVisibleContainer" data-dojo-props="region: \'bottom\', layoutPriority:2, splitter: true"></div>',
            '<div class="design-panel-editor" data-dojo-type="Sage.QuickForms.Design.PropertyEditorContainer" data-dojo-attach-point="editorContainer" data-dojo-props="region: \'bottom\', layoutPriority:1, splitter: true"></div>'
        ]),
        loadingTemplate: new Simplate([
            '<div class="design-panel-loading-indicator"><span>{%: $.loadingText %}</span></div>'
        ]),
        savingTemplate: new Simplate([
            '<div class="design-panel-saving-indicator"><span>{%: $.savingText %}</span></div>'
        ]),

        _designGroup: null,
        _designGroupTopics: null,
        _cultureSelect: null,
        _previousName: null,
        _previousEntry: null,
        currentCulture: 'iv',
        designSurface: null,
        nonVisibleContainer: null,
        editorContainer: null,
        form: null,
        formDirty: false,
        helpTopicName: 'Working_with_forms',
        helpSubSystemName: 'WebForms',
        designGroup: 'default',
        _saveMode: false,

        cultureList: [
            'iv',
            'de-DE',
            'fr-FR',
            'it-IT',
            'ru-RU'
        ],
        cultureListText: {
            'iv': '[invariant]',
            'de_DE': 'de-DE',
            'fr_FR': 'fr-FR',
            'it_IT': 'it-IT',
            'ru_RU': 'ru-RU'
        },

        helpText: 'Help',
        saveText: 'Save',
        cultureText: 'Culture:',
        loadingText: 'Loading...',
        savingText: 'Saving...',
        saveErrorText: 'An error occurred saving the form.',
        readErrorText: 'Could not load the requested form.',
        cultureReloadConfirmText: 'You have unsaved changes.  Are you sure you want to reload the form with a different culture?',

        constructor: function () {
            lang.mixin(this, localization);
        },
        _getDesignGroupAttr: function () {
            return this._designGroup;
        },
        _setDesignGroupAttr: function (value) {
            if (this._designGroupTopics) {
                array.forEach(this._designGroupTopics, function (topic) {
                    this.unsubscribe(topic);
                }, this);
            }

            this._designGroup = value;
            this._designGroupTopics = [
                this.subscribe('/quickforms/design/designerModified', this._onDesignerModified)
            ];
        },
        _ignoreModifiedOn: {
            'focused': true
        },
        _onDesignerModified: function (designer, name, value, result, source) {
            if (!this._ignoreModifiedOn[name] && designer.get('form') === this.form)
                this.formDirty = true;
        },
        buildRendering: function () {
            this.inherited(arguments);

            domClass.add(this.domNode, 'design-panel');

            domConstruct.place(this.loadingTemplate.apply(this), this.designSurface.domNode);
            domConstruct.place(this.savingTemplate.apply(this), this.designSurface.domNode);
        },
        startup: function () {
            this.inherited(arguments);

            array.forEach(this.cultureList, function (item) {
                this._cultureSelect.addOption({
                    value: item,
                    label: this.cultureListText[item.replace('-', '_')] || item,
                    selected: item == this.currentCulture
                });
            }, this);
        },
        _onCultureChange: function (value) {
            if (this.currentCulture === value) return;

            if (this.form && this.formDirty) {
                if (!confirm(this.cultureReloadConfirmText)) {
                    this._cultureSelect._onChangeActive = false;
                    this._cultureSelect.set('value', this.currentCulture);
                    this._cultureSelect._onChangeActive = true;

                    return;
                }
            }

            this.currentCulture = value;

            if (this._previousName)
                this.read(this._previousName);
            else if (this._previousEntry)
                this.load(this._previousEntry);
        },
        help: function () {
            Help.open(this.helpTopicName, this.helpSubSystemName);
        },
        save: function () {
            console.info('original:');
            if (this._saveMode) {
                return;
            }
            this._saveMode = true;
            console.info(json.toJson(this.original, true));
            console.info('updated to be sent:');
            console.info(json.toJson(this.form.entry, true));

            var request = new Sage.SData.Client.SDataSingleResourceRequest(this.dataService)
                .setResourceKind('forms')
                .setResourceSelector(string.substitute('"${0}"', [this.form.get('name')]))
                .setQueryArg('language', this.currentCulture != 'iv' ? this.currentCulture : '');

            var entry = lang.clone(this.form.get('entry'));

            entry['$etag'] = entry['etag'];

            delete entry['etag'];
            delete entry['ifMatch'];
            delete entry['httpStatus'];

            this._showSavingIndicator();
            request.update(entry, {
                success: lang.hitch(this, this._onSaveFormSuccess, this.form),
                failure: lang.hitch(this, this._onSaveFormFailure, this.form)
            });
        },
        _onSaveFormSuccess: function (form, entry) {
            this._hideSavingIndicator();
            this._saveMode = false;
            console.info('update success, this is the new result:');
            console.info(json.toJson(entry, true));
            /* two options: update etag from result, though etag is not currently require, or... */
            form.set('etag', entry['etag']);
            this.formDirty = false;
            /* ...completely reload in order to load any (unlikely) server changes that have occurred. */
            /* this.load(entry); */
        },
        _onSaveFormFailure: function (form, xhr) {
            this._hideSavingIndicator();
            this._saveMode = false;
            alert(this.saveErrorText);
        },
        _showLoadingIndicator: function () {
            domClass.add(this.domNode, 'design-panel-loading');
        },
        _showSavingIndicator: function () {
            domAttr.set(this.saveIcon, "disabled", true);
            domClass.add(this.domNode, 'design-panel-saving');
        },
        _hideLoadingIndicator: function () {
            domClass.remove(this.domNode, 'design-panel-loading');
        },
        _hideSavingIndicator: function () {
            domClass.remove(this.domNode, 'design-panel-saving');
            domAttr.set(this.saveIcon, "disabled", false);
        },
        read: function (form) {
            this.clear();

            this._previousName = form;
            this._previousEntry = null;

            var request = new Sage.SData.Client.SDataSingleResourceRequest(this.dataService)
                .setResourceKind('forms')
                .setResourceSelector(string.substitute('"${0}"', [form]))
                .setQueryArg('language', this.currentCulture != 'iv' ? this.currentCulture : '');

            this._showLoadingIndicator();
            request.read({
                success: lang.hitch(this, this._onRequestFormSuccess),
                failure: lang.hitch(this, this._onRequestFormFailure)
            });
        },
        _onRequestFormSuccess: function (entry) {
            this._hideLoadingIndicator();
            this._apply(entry);
        },
        _onRequestFormFailure: function (xhr) {
            this._hideLoadingIndicator();
            alert(this.readErrorText);
        },
        clear: function () {
            topic.publish(string.substitute('/quickforms/design/${0}/clear', [this._designGroup]), this);

            this.designSurface.clear();
            this.nonVisibleContainer.clear();
            this.editorContainer.clear();

            if (this.form) this.form.destroy();

            this.form = null;
            this.formDirty = false;
        },
        load: function (entry) {
            this.clear();

            this._previousName = null;
            this._previousEntry = entry;

            this._apply(entry);
        },
        _apply: function (entry) {
            this.original = entry;

            this.form = new FormDesigner({
                entry: lang.clone(entry)
            });

            this.designSurface.set('form', this.form);

            array.forEach(this.form.get('controls'), function (control) {
                if (control.designSupport && control.designSupport.visible) {
                    this.designSurface.addChild(control);
                }
                else {
                    this.nonVisibleContainer.addChild(control);
                }
            }, this);

            this.designSurface.layout();
            this.nonVisibleContainer.layout();

            topic.publish(string.substitute('/quickforms/design/${0}/load', [this._designGroup]), entry, this);
            topic.publish(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), this.form, false, this);
        }
    });
});