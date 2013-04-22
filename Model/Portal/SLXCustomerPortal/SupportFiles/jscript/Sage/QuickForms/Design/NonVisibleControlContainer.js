define([
    'dojo/query',
    'dojo/topic',
    'dojo/string',
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/event',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/NodeList-traverse',
    'dojo/NodeList-manipulate',
    'dijit/registry',
    'dijit/focus',
    'dijit/layout/_LayoutWidget',
    'Sage/_EventMapMixin',
    'Sage/_Templated',
    'dojo/i18n!./nls/NonVisibleControlContainer'
], function(
    query,
    topic,
    string,
    declare,
    array,
    lang,
    event,
    domAttr,
    domClass,
    nodeListTraverse,
    nodeListManipulate,
    registry,
    focus,
    _LayoutWidget,
    _EventMapMixin,
    _Templated,
    localization
) {
    return declare('Sage.QuickForms.Design.NonVisibleControlContainer', [_LayoutWidget, _EventMapMixin, _Templated], {
        events: {
            'click': '_onClick',
            'keydown': '_onKeyDown'
        },
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="design-hidden-container">',
            '<div class="design-hidden-container-header dijit dijitToolbar">{%: $.headerText %}</div>',
            '<div class="design-hidden-container-content" data-dojo-attach-point="containerNode"></div>',
            '<div>'
        ]),

        _designGroup: null,
        _designGroupTopics: null,
        selections: null,
        singleSelection: false,
        designGroup: 'default',

        headerText: 'Non-Visual Controls',

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
                this.subscribe(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), this._onDesignerSelected)
            ];
        },
        constructor: function() {
            this.selections = [];
            lang.mixin(this, localization);
        },
        buildRendering: function() {
            this.inherited(arguments);

            domAttr.set(this.domNode, 'tabIndex', 0);
        },
        _onKeyDown: function(evt) {
        },
        _handleSelectionFor: function(widget, append) {
            if (widget)
            {
                var selected = (array.indexOf(this.selections, widget) > -1);

                if (append && !this.singleSelection)
                {
                    if (!selected)
                    {
                        array.forEach(this.selections, function(selection) {
                            query(selection.domNode).attr('tabIndex', '-1');
                        });

                        this.selections.push(widget);

                        domAttr.set(widget.domNode, 'tabIndex', 0);

                        focus.focus(widget.domNode);

                        domClass.add(widget.domNode, 'design-hidden-item-selected');

                        this.onSelectionChanged(this.selections, true);

                        topic.publish(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), widget, true, this);
                    }
                }
                else
                {
                    this._clearSelectionDom();
                    this._clearSelectionState(false);

                    this.selections = [widget];

                    domAttr.set(widget.domNode, 'tabIndex', 0);

                    focus.focus(widget.domNode);

                    domClass.add(widget.domNode, 'design-hidden-item-selected');

                    this.onSelectionChanged(this.selections);

                    topic.publish(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), widget, true, this);
                }
            }
            else
            {
                if (this.singleSelection || !append)
                {
                    this._clearSelectionDom();
                    this._clearSelectionState();
                }
            }
        },
        _onClick: function(evt) {
            var node = query(evt.target).closest('.dijitLayoutContainer-child')[0],
                widget = node && registry.byNode(node),
                append = evt.shiftKey;

            this._handleSelectionFor(widget, append);
        },
        onSelectionChanged: function(selections, append) {

        },
        _clearSelectionDom: function() {
            if (this.selections.length > 0)
            {
                array.forEach(this.selections, function(selection) {
                    query(selection.domNode)
                        .attr('tabIndex', '-1')
                        .removeClass('design-hidden-item-selected');
                });
            }
        },
        _clearSelectionState: function(notify) {
            if (this.selections.length > 0)
            {
                this.selections = [];

                if (notify !== false)
                {
                    this.onSelectionChanged(this.selections);

                    topic.publish(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), false, false, this);
                }
            }
        },
        _onDesignerSelected: function(designer, append, source) {
            if (designer && source !== this)
            {
                this._clearSelectionDom();
                this._clearSelectionState(false);
            }
        },
        clearSelections: function() {
            this._clearSelectionDom();
            this._clearSelectionState();
        },
        clear: function() {
            this._clearSelectionState();

            array.forEach(this.getChildren(), function(child) {
                this.removeChild(child);
            }, this);

            this.layout();
        }
    });
});