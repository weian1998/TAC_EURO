define([
    'dojo/string',
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dijit/layout/TabContainer',
    'dijit/layout/BorderContainer',
    'Sage/_EventMapMixin',
    'Sage/_Templated',
    'Sage/Utility',
    './ControlDesigner',
    './Help',
    'dojo/i18n!./nls/PropertyEditorContainer'
], function(
    string,
    declare,
    array,
    lang,
    domClass,
    domConstruct,
    TabContainer,
    BorderContainer,
    _EventMapMixin,
    _Templated,
    Utility,
    ControlDesigner,
    Help,
    localization
) {
    return declare('Sage.QuickForms.Design.PropertyEditorContainer', [BorderContainer, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<div class="design-editor-container-toolbar" data-dojo-type="dijit.Toolbar" data-dojo-props="region: \'top\', align: \'right\', splitter: false">',
            '<span class="design-editor-title" data-dojo-attach-point="titleNode"></span>',
            '<div data-dojo-type="Sage.UI.ImageButton" icon="images/icons/Help_16x16.png" tooltip="{%: $.helpText %}" data-dojo-attach-event="onClick:help" class="design-panel-help"></div>',
            '</div>',
            '<div data-dojo-type="dijit.layout.TabContainer" data-dojo-attach-point="editorTabContainer" data-dojo-props="region: \'center\'"></div>'
        ]),
        _setTitleAttr: {
            node: 'titleNode', type: 'innerText'
        },

        _designGroup: null,
        _designGroupTopics: null,
        _designer: null,
        _designerSource: null,

        editorTabContainer: null,
        titleNode: null,

        helpTopicName: 'webFormDesigner',
        helpSubSystemName: 'WebForms',
        designGroup: 'default',

        specificTitleFormatText: '${0} Properties (${1})',
        genericTitleFormatText: '${0} Properties',

        constructor: function() {
            lang.mixin(this, localization);
        },

        _getDesignGroupAttr: function() {
            return this._designGroup;
        },
        _setDesignGroupAttr: function(value) {
            if (this._designGroupTopics)
            {
                array.forEach(this._designGroupTopics, function(topic) {
                    this.unsubscribe(topic);
                }, this);
            }

            this._designGroup = value;
            this._designGroupTopics = [
                this.subscribe(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), this._onDesignerSelected),
                this.subscribe(string.substitute('/quickforms/design/${0}/designerMoved', [this._designGroup]), this._onDesignerMoved)
            ];
        },
        help: function() {
            if (this._designer)
            {
                Help.open(this._designer.helpTopicName, this.helpSubSystemName);
            }
            else
            {
                Help.open(this.helpTopicName, this.helpSubSystemName);
            }
        },
        buildRendering: function() {
            this.inherited(arguments);

            domClass.add(this.domNode, 'design-editor-container');
        },
        uninitialize: function() {
            this.inherited(arguments);
        },
        clear: function() {
            array.forEach(this.editorTabContainer.getChildren(), function(child) {
                this.editorTabContainer.removeChild(child);
                child.destroyRecursive(false); // todo: keep editor instances around
            }, this);

            this._designer = null;

            this.set('title', '');

            this.layout();
        },
        _setDesignerAttr: function(value, source) {
            if (value === this._designer) return;

            var previous = this.editorTabContainer.selectedChildWidget && this.editorTabContainer.selectedChildWidget.constructor,
                active;

            this.clear();

            array.forEach(value.editors, function(editor) {
                var instance = new editor({
                    /* designer: value */
                });

                this.editorTabContainer.addChild(instance);

                if (editor === previous) {
                    active = instance;
                }
            }, this);

            if (value.get('controlId'))
                this.set('title', string.substitute(this.specificTitleFormatText, [value.displayNameText, value.get('controlId')]));
            else
                this.set('title', string.substitute(this.genericTitleFormatText, [value.displayNameText]));

            this._designer = value;
            this._designerSource = source;

            if (active) this.editorTabContainer.selectChild(active);

            this.layout();

            array.forEach(this.editorTabContainer.getChildren(), function(editor) {
                editor.set('designer', this._designer);
            }, this);
        },
        _getDesignerAttr: function() {
            return this._designer;
        },
        _onDesignerSelected: function(designer, append, source) {
            if (designer && designer.editors)
            {
                this.set('designer', designer, source);
            }
            else
            {
                this.clear();
            }
        },
        _onDesignerMoved: function(designer, source) {
            if (designer !== this._designer) return; /* only update if it is the current one */

            array.forEach(this.editorTabContainer.getChildren(), function(editor) {
                editor.set('designer', this._designer);
            }, this);
        }
    });
});