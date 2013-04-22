define([
    'dojo/query',
    'dojo/keys',
    'dojo/string',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/event',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/dom-geometry',
    'dojo/dom-construct',
    'dojo/NodeList-traverse',
    'dojo/NodeList-manipulate',
    'dijit/registry',
    'dijit/focus',
    'dijit/layout/_LayoutWidget',
    'dijit/Menu',
    'dijit/MenuItem',
    'dijit/MenuSeparator',
    'dijit/PopupMenuItem',
    'Sage/_EventMapMixin',
    'dojo/dnd/Source',
    'dojo/dnd/Manager',
    './ControlDesignerRegistry',
    './ControlDesigner',
    './FormDesigner',
    './RowDesigner',
    './ColumnDesigner',
    'dojo/i18n!./nls/DesignSurface'
], function(
    query,
    keys,
    string,
    topic,
    declare,
    array,
    lang,
    event,
    domAttr,
    domClass,
    domStyle,
    domGeometry,
    domConstruct,
    nodeListTraverse,
    nodeListManipulate,
    registry,
    focus,
    _LayoutWidget,
    Menu,
    MenuItem,
    MenuSeparator,
    PopupMenuItem,
    _EventMapMixin,
    Source,
    Manager,
    ControlDesignerRegistry,
    ControlDesigner,
    FormDesigner,
    RowDesigner,
    ColumnDesigner,
    localization
) {
    var _Source = declare([Source], {
        owner: null,
        accept: ['designer', 'property'],
        constructor: function() {
            this.creator = true; /* flag to enable use of _normalizedCreator */
        },
        checkAcceptance: function(fromSource, nodes) {
            if (fromSource == this) return false;

            return this.inherited(arguments);
        },
        onDropInternal: function(fromSource, nodes, copy) {
            /* do nothing */
        },
        onDropExternal: function(fromSource, nodes, copy) {
            if (fromSource.isInstanceOf(_Source))
            {
                var node = nodes[0],
                    item = node && fromSource.getItem(node.id);
                if (item)
                {
                    fromSource.selectNone();
                    this.selectNone();
                    this.onDropDesigner(this, registry.byId(item.data));
                }
            }
            else
            {
                var node = nodes[0],
                    item = node && fromSource.getItem(node.id);
                if (item && array.indexOf(item.type, 'property') >= 0)
                {
                    fromSource.selectNone();
                    this.selectNone();
                    this.onDropProperty(this, item.context);
                }
            }
        },
        onDropProperty: function(toSource, propertyContext) {
        },
        onDropDesigner: function(toSource, widget) {

        },
        onDndStart: function(fromSource, nodes, copy) {
            this.inherited(arguments);
        },
        onDndCancel: function() {
            this.inherited(arguments);
        },
        /**
         * The `_normalizedCreator` method is used to generate a separate, style-able, avatar, instead of
         * overriding avatar creation globally or swapping methods in and out on drag start and cancel.
         *
         * @unsafe
         */
        _normalizedCreator: function(data, hint) {
            var widget = registry.byId(data),
                contentNode = domConstruct.toDom(widget.domNode.parentNode.innerHTML),
                containerNode = domConstruct.create('div', {
                    'class': 'design-surface-dnd-avatar'
                });

            /* todo: we could pull width/height from the original node via. lookup by id of `contentNode` as it is the same, unfortunately */

            domConstruct.place(contentNode, containerNode);

            return {node: containerNode};
        },
        onDraggingOver: function() {
            this.inherited(arguments);

            /* only need to check over when the cell is empty, otherwise, we check based on inner positioning. */
            if (this.empty)
            {
                var manager = Manager.manager();
                if (manager.source.isInstanceOf(_Source))
                {
                    var result = this.owner.validateMoveFromSource(this, manager.source);

                    /* todo: add processing for the error result to add indicator bisected cells */

                    manager.canDrop(!result);
                }
                else
                {
                    /* always accept */
                }
            }
        },
        onMouseMove: function(e) {
            var before,
                targetAnchor;

            /* only need to check based on positioning when the cell is not empty. */
            if (this.isDragging && !this.empty)
            {
                before = this.before;
                targetAnchor = this.targetAnchor;
            }

            this.inherited(arguments);

            if (this.isDragging && !this.empty)
            {
                /* the target and/or position has changed, re-check acceptance */
                if (this.targetAnchor != targetAnchor || this.before != before)
                {
                    var manager = Manager.manager();
                    if (manager.source.isInstanceOf(_Source))
                    {
                        var result = this.owner.validateMoveFromSource(this, manager.source);

                        /* todo: add processing for the error result to add indicator bisected cells */

                        manager.canDrop(!result);
                    }
                    else
                    {
                        /* always accept */
                    }
                }
            }
        }
    });

    var _CellContextMenu = declare([Menu], {
        owner: null,

        aboveText: 'Above',
        belowText: 'Below',
        leftText: 'Left',
        rightText: 'Right',
        insertRowText: 'Insert Row',
        insertColumnText: 'Insert Column',

        constructor: function() {
            lang.mixin(this, localization);
        },
        postCreate: function() {
            this.inherited(arguments);

            var rowSubMenu = new Menu(),
                columnSubMenu = new Menu();

            rowSubMenu.addChild(new MenuItem({
                label: this.aboveText,
                onClick: lang.hitch(this, this._insertRow, true)
            }));

            rowSubMenu.addChild(new MenuItem({
                label: this.belowText,
                onClick: lang.hitch(this, this._insertRow, false)
            }));

            columnSubMenu.addChild(new MenuItem({
                label: this.leftText,
                onClick: lang.hitch(this, this._insertColumn, true)
            }));

            columnSubMenu.addChild(new MenuItem({
                label: this.rightText,
                onClick: lang.hitch(this, this._insertColumn, false)
            }));

            this.addChild(new PopupMenuItem({
                label: this.insertRowText,
                popup: rowSubMenu
            }));

            this.addChild(new PopupMenuItem({
                label: this.insertColumnText,
                popup: columnSubMenu
            }));
        },
        _insertColumn: function(before) {
            if (this.owner)
                this.owner.insertColumnAround(this.target, before);
        },
        _insertRow: function(before) {
            if (this.owner)
                this.owner.insertRowAround(this.target, before);
        },
        open: function(target, node, coords) {
            this.target = target;

            if (this.target) this._scheduleOpen(node, null, coords);
        }
    });

    var _RowContextMenu = declare([Menu], {
        owner: null,

        aboveText: 'Above',
        belowText: 'Below',
        insertRowText: 'Insert Row',
        deleteRowText: 'Delete Row',

        constructor: function() {
            lang.mixin(this, localization);
        },
        postCreate: function() {
            this.inherited(arguments);

            var rowSubMenu = new Menu();

            rowSubMenu.addChild(new MenuItem({
                label: this.aboveText,
                onClick: lang.hitch(this, this._insertRow, true)
            }));

            rowSubMenu.addChild(new MenuItem({
                label: this.belowText,
                onClick: lang.hitch(this, this._insertRow, false)
            }));

            this.addChild(new PopupMenuItem({
                label: this.insertRowText,
                popup: rowSubMenu
            }));

            this.addChild((this._delete = new MenuItem({
                label: this.deleteRowText,
                onClick: lang.hitch(this, this._deleteRow, false)
            })));
        },
        open: function(target, node, coords) {
            this.target = target;

            if (this.target)
            {
                this._delete.set('disabled', this.owner.validateDeleteRowAt(this.target.index));

                this._scheduleOpen(node, null, coords);
            }
        },
        _insertRow: function(before) {
            if (this.owner)
            {
                var index = before
                    ? this.target.get('index')
                    : this.target.get('index') + 1;
                this.owner.insertRowAt(index);
            }
        },
        _deleteRow: function() {
            if (this.owner)
                this.owner.deleteRowAt(this.target.index);
        }
    });

    var _ColumnContextMenu = declare([Menu], {
        owner: null,

        leftText: 'Left',
        rightText: 'Right',
        insertColumnText: 'Insert Column',
        deleteColumnText: 'Delete Column',

        constructor: function() {
            lang.mixin(this, localization);
        },
        postCreate: function() {
            this.inherited(arguments);

            var columnSubMenu = new Menu();

            columnSubMenu.addChild(new MenuItem({
                label: this.leftText,
                onClick: lang.hitch(this, this._insertColumn, true)
            }));

            columnSubMenu.addChild(new MenuItem({
                label: this.rightText,
                onClick: lang.hitch(this, this._insertColumn, false)
            }));

            this.addChild(new PopupMenuItem({
                label: this.insertColumnText,
                popup: columnSubMenu
            }));

            this.addChild((this._delete = new MenuItem({
                label: this.deleteColumnText,
                onClick: lang.hitch(this, this._deleteColumn)
            })));
        },
        open: function(target, node, coords) {
            this.target = target;

            if (this.target)
            {
                this._delete.set('disabled', !!this.owner.validateDeleteColumnAt(this.target.index));

                this._scheduleOpen(node, null, coords);
            }
        },
        _insertColumn: function(before) {
            if (this.owner)
            {
                var index = before
                    ? this.target.get('index')
                    : this.target.get('index') + 1;
                this.owner.insertColumnAt(index);
            }
        },
        _deleteColumn: function() {
            if (this.owner)
                this.owner.deleteColumnAt(this.target.index);
        }
    });

    var DesignSurface = declare('Sage.QuickForms.Design.DesignSurface', [_LayoutWidget, _EventMapMixin], {
        events: {
            'click': '_onClick',
            'keydown': '_onKeyDown',
            '.design-surface-selector-cell[data-select-row]:contextmenu': '_onRowContextMenu',
            '.design-surface-selector-cell[data-select-column]:contextmenu': '_onColumnContextMenu',
            '.dojoDndSource:contextmenu': '_onCellContextMenu'
        },

        _designGroup: null,
        _designGroupTopics: null,
        _rowContextMenu: null,
        _columnContextMenu: null,
        _cellContextMenu: null,
        baseClass: 'design-surface',
        selections: null,
        form: null,
        columns: null,
        rows: null,
        columnCount: 3,
        currentLayout: null,
        tableNode: null,
        singleSelection: true,
        designGroup: 'default',

        bisectionErrorText: 'The placement will cause another control to be bisected.',
        rowBoundsErrorText: 'The chosen row is out of bounds.',
        columnBoundsErrorText: 'The chosen column is out of bounds.',
        rowSpanBoundsErrorText: 'The chosen row span is out of bounds.',
        columnSpanBoundsErrorText: 'The chosen column span is out of bounds.',
        occupiedErrorText: 'There is not enough empty space for the chosen size.',

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
        _onRowContextMenu: function(evt) {
            event.stop(evt);

            if (this._rowContextMenu)
                this._rowContextMenu.open(
                    this.findDesignerByNode(evt.target),
                    evt.target,
                    {x: evt.pageX, y: evt.pageY}
                );
        },
        _onColumnContextMenu: function(evt) {
            event.stop(evt);

            if (this._columnContextMenu)
                this._columnContextMenu.open(
                    this.findDesignerByNode(evt.target),
                    evt.target,
                    {x: evt.pageX, y: evt.pageY}
                );
        },
        _onCellContextMenu: function(evt) {
            event.stop(evt);

            if (this._cellContextMenu)
                this._cellContextMenu.open(
                    this.findDesignerByNode(evt.target),
                    evt.target,
                    {x: evt.pageX, y: evt.pageY}
                );
        },
        constructor: function() {
            this.selections = [];
            lang.mixin(this, localization);
        },
        buildRendering: function() {
            this.inherited(arguments);

            domAttr.set(this.domNode, 'tabIndex', 0);
        },
        createContextMenus: function() {
            this._rowContextMenu = new _RowContextMenu({ owner: this });
            this._rowContextMenu.startup();

            this._columnContextMenu = new _ColumnContextMenu({ owner: this });
            this._columnContextMenu.startup();

            this._cellContextMenu = new _CellContextMenu({ owner: this });
            this._cellContextMenu.startup();
        },
        postCreate: function() {
            this.inherited(arguments);
        },
        uninitialize: function() {
            if (this._sources)
            {
                array.forEach(this._sources, function(source) {
                    source.destroy();
                });
            }

            if (this._contextMenu) this._contextMenu.destroyRecursive();

            this._sources = [];

            this.inherited(arguments);
        },
        startup: function() {
            if (this._started) {
                return;
            }

            this.inherited(arguments);

            this.createContextMenus();
        },
        resize: function() {
            this.inherited(arguments); // calls layout

            array.forEach(this.getChildren(), function(child) {
                if (typeof child.resize == 'function') {
                    child.resize();
                }
            });

            if (this._sources)
            {
                array.forEach(this._sources, function(source) {
                    source.sync();
                });
            }
        },
        _buildKeyHandlerMap: function() {
            var map = {};
            map[this.isLeftToRight() ? keys.LEFT_ARROW : keys.RIGHT_ARROW] = "_onLeftArrow";
            map[this.isLeftToRight() ? keys.RIGHT_ARROW : keys.LEFT_ARROW] = "_onRightArrow";
            map[keys.UP_ARROW]="_onUpArrow";
            map[keys.DOWN_ARROW]="_onDownArrow";
            return map;
        },
        _onKeyDown: function(evt) {
            var key = evt.keyCode,
                map = this._keyHandlerMap || (this._keyHandlerMap = this._buildKeyHandlerMap());
            if (map[key] && this[map[key]])
            {
                this[map[key]](evt);
                event.stop(evt);
            }
        },
        _onLeftArrow: function(evt) {
            this._moveSelectionIndicator('l');
        },
        _onRightArrow: function(evt) {
            this._moveSelectionIndicator('r');
        },
        _onUpArrow: function(evt) {
            this._moveSelectionIndicator('u');
        },
        _onDownArrow: function(evt) {
            this._moveSelectionIndicator('d');
        },
        _moveSelectionIndicator: function(direction) {
            /* a *single* selection is required for this */
            var selection = this.selections.length == 1 ? this.selections[0] : null,
                designer = selection && selection.designer;
            if (designer && designer.isInstanceOf(ControlDesigner))
            {
                var next = this._findNextWidget(designer, direction),
                    cell = next && query(next.domNode).closest('.design-surface-cell')[0];
                if (next) this._handleSelectionOf(next, false, cell, next.domNode);
            }
        },
        _findNextWidget: function(fromWidget, direction) {
            /* direction: u,d,l,r */
            var layout = this.currentLayout,
                fromWidgetRow = fromWidget.get('row') || 0,
                fromWidgetColumn = fromWidget.get('column') || 0,
                fromWidgetRowSpan = fromWidget.get('rowSpan') || 1,
                fromWidgetColumnSpan = fromWidget.get('columnSpan') || 1,
                spanV = [fromWidgetRow, fromWidgetRow + fromWidgetRowSpan - 1],
                spanH = [fromWidgetColumn, fromWidgetColumn + fromWidgetColumnSpan - 1],
                boundR, deltaR, boundC, deltaC;

            switch (direction)
            {
                case 'u':
                    boundR = [fromWidgetRow - 1, 0]; // 2, 0 or 2, 10
                    deltaR = -1;
                    boundC = spanH;
                    deltaC = 1;
                    break;
                case 'd':
                    boundR = [fromWidgetRow + fromWidgetRowSpan, layout.rows.length - 1];
                    deltaR = 1;
                    boundC = spanH;
                    deltaC = 1;
                    break;
                case 'l':
                    boundR = spanV;
                    deltaR = 1;
                    boundC = [fromWidgetColumn - 1, 0];
                    deltaC = -1;
                    break;
                case 'r':
                    boundR = spanV;
                    deltaR = 1;
                    boundC = [fromWidgetColumn + fromWidgetColumnSpan, layout.columnCount - 1];
                    deltaC = 1;
                    break;
            }

            for (var row = boundR[0]; deltaR*row <= boundR[1]; row += deltaR)
            {
                for (var column = boundC[0]; deltaC*column <= boundC[1]; column += deltaC)
                {
                    var data = this._readFromLayout(layout, row, column);

                    /* empty cell - skip */
                    if (!data) continue;

                    var widget = data.widget;

                    /* encountered self - skip */
                    if (widget === fromWidget) continue;

                    return widget;
                }
            }

            return null;
        },
        _handleSelectionOf: function(designer, append, styleNode, focusNode) {
            if (designer)
            {
                var selected = array.some(this.selections, function(selection) { return (selection.designer === designer); });

                if (append && !this.singleSelection)
                {
                    if (!selected)
                    {
                        array.forEach(this.selections, function(selection) {
                            selection.focusNode && domAttr.set(selection.focusNode, 'tabIndex', '-1');
                        });

                        this.selections.push({designer: designer, styleNode: styleNode, focusNode: focusNode});

                        if (focusNode)
                        {
                            domAttr.set(focusNode, 'tabIndex', 0);

                            focus.focus(focusNode);
                        }

                        if (styleNode)
                        {
                            domClass.add(styleNode, 'design-surface-cell-selected');
                        }

                        this.onSelectionChanged(this.selections, true);

                        topic.publish(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), designer, true, this);
                    }
                }
                else
                {
                    this._clearSelectionDom();
                    this._clearSelectionState(false);

                    this.selections = [{designer: designer, styleNode: styleNode, focusNode: focusNode}];

                    if (focusNode)
                    {
                        domAttr.set(focusNode, 'tabIndex', 0);

                        focus.focus(focusNode);
                    }

                    if (styleNode)
                    {
                        domClass.add(styleNode, 'design-surface-cell-selected');
                    }

                    this.onSelectionChanged(this.selections, false);

                    topic.publish(string.substitute('/quickforms/design/${0}/designerSelected', [this._designGroup]), designer, false, this);
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
        findDesignerByNode: function(target) {
            var result = this._findSelectableDesignerByNode(target);
            return result && result.designer;
        },
        _findSelectableDesignerByNode: function(target) {
            var cell = query(target).closest('.design-surface-cell')[0],
                node = cell && query('.dojoDndItem > *', cell)[0],
                designer = node && registry.byNode(node);

            if (designer)
                return {
                    designer: designer,
                    styleNode: cell,
                    focusNode: designer.domNode
                };

            if (cell && domAttr.has(cell, 'data-select-row'))
                return {
                    designer: this.form && this.form.get('rows')[parseInt(domAttr.get(cell, 'data-select-row'))],
                    styleNode: cell,
                    focusNode: cell
                };

            if (cell && domAttr.has(cell, 'data-select-column'))
                return {
                    designer: this.form && this.form.get('columns')[parseInt(domAttr.get(cell, 'data-select-column'))],
                    styleNode: cell,
                    focusNode: cell
                };

            return null;
        },
        _onClick: function(evt) {
            var append = evt.shiftKey,
                result = this._findSelectableDesignerByNode(evt.target);
            if (result)
            {
                if (result.designer.isInstanceOf(ControlDesigner))
                    this._handleSelectionOf(result.designer, append, result.styleNode, result.focusNode);
                else
                    this._handleSelectionOf(result.designer, false, result.styleNode, result.focusNode);
            }
            else
            {
                this._handleSelectionOf(this.form, append);
            }
        },
        onSelectionChanged: function(selections, append) {

        },
        _clearSelectionDom: function() {
            if (this.selections.length > 0)
            {
                array.forEach(this.selections, function(selection) {
                    selection.focusNode && domAttr.set(selection.focusNode, 'tabIndex', '-1');
                    selection.styleNode && domClass.remove(selection.styleNode, 'design-surface-cell-selected');
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
        _syncDomWithSelectionState: function() {
            array.forEach(this.selections, function(selection) {
                var designer = selection.designer;
                if (designer.isInstanceOf(ControlDesigner))
                {
                    selection.styleNode = query(designer.domNode).closest('.design-surface-cell')[0];
                    selection.focusNode = designer.domNode;
                }
                else if (designer.isInstanceOf(RowDesigner))
                {
                    selection.styleNode = query(string.substitute('.design-surface-selector-cell[data-select-row="${0}"]', [designer.index]), this.domNode)[0];
                    selection.focusNode = selection.styleNode;
                }
                else if (designer.isInstanceOf(ColumnDesigner))
                {
                    selection.styleNode = query(string.substitute('.design-surface-selector-cell[data-select-column="${0}"]', [designer.index]), this.domNode)[0];
                    selection.focusNode = selection.styleNode;
                }

                domAttr.set(selection.focusNode, 'tabIndex', 0);

                focus.focus(selection.focusNode);

                domClass.add(selection.styleNode, 'design-surface-cell-selected');
            }, this);
        },
        _onDesignerSelected: function(designer, append, source) {
            if (designer && source !== this)
            {
                this._clearSelectionDom();
                this._clearSelectionState(false);
            }
        },
        /**
         * Creates a layout containing a uniform, sparse, matrix with span information.
         * @param children
         */
        _buildLayoutFor: function(children) {
            var rows = [],
                columnCount = this.form ? this.form.get('columnCount') : this.columnCount;

            array.forEach(children, function(child) {
                var designRow = child.get('row') || 0,
                    designColumn = child.get('column') || 0,
                    designRowSpan = child.get('rowSpan') || 1,
                    designColumnSpan = child.get('columnSpan') || 1,
                    row, edge, i, j;

                if (designRowSpan > 1 || designColumnSpan > 1)
                {
                    edge = [designColumn, designColumn + (designColumnSpan - 1)];

                    for (i = 0; i < designRowSpan; i++)
                    {
                        row = rows[designRow + i] || (rows[designRow + i] = []);

                        for (j = 0; j < designColumnSpan; j++)
                        {
                            /* todo: remove span/edge data as no longer needed? */
                            row[designColumn + j] = {
                                widget: child,
                                span: (i > 0 || j > 0),
                                edge: edge // reference to edge data for widget
                            };
                        }
                    }
                }
                else
                {
                    row = rows[designRow] || (rows[designRow] = []);

                    /* todo: remove span/edge data as no longer needed? */
                    row[designColumn] = {
                        widget: child,
                        span: false,
                        edge: [designColumn, designColumn]
                    };
                }

                if ((designColumn + designColumnSpan) > columnCount) columnCount = (designColumn + designColumnSpan);

            }, this);

            //console.log('built: %o', rows);

            return {rows: rows, columnCount: columnCount, children: children};
        },
        _syncNonVisibleDesigners: function(layout) {
            if (!this.form) return;

            var layoutRows = layout.rows,
                layoutRowCount = layoutRows.length,
                layoutColumnCount = layout.columnCount;

            if (this.form.get('rowCount') > layoutRowCount)
            {
                // remove any added row designers

                var rows = this.form.get('rows');

                for (var i = (rows.length - 1); i > (layoutRowCount - 1); i--)
                {
                    if (rows[i].added)
                        this.form.removeRow(i);
                    else
                        break; /* promote any previous auto-added ones */
                }
            }
            else if (this.form.get('rowCount') < layoutRowCount)
            {
                // add row designers for newly added rows

                var rows = this.form.get('rows'),
                    count = rows.length;

                for (var i = 0; i < (layoutRowCount - count); i++)
                {
                    this.form.addRow(new RowDesigner({
                        entry: {
                            'Height': 35,
                            'SizeType': 'Absolute'
                        },
                        form: this.form,
                        index: count + i,
                        added: true
                    }));
                }
            }

            if (this.form.get('columnCount') > layoutColumnCount)
            {
                // remove any added column designers

                var columns = this.form.get('columns');

                for (var i = (columns.length - 1); i > (layoutColumnCount - 1); i--)
                {
                    if (columns[i].added)
                        this.form.removeColumn(i);
                    else
                        break; /* promote any previous auto-added ones */
                }
            }
            else if (this.form.get('columnCount') < layoutColumnCount)
            {
                // add column designers for newly added columns

                var columns = this.form.get('columns'),
                    count = columns.length;

                for (var i = 0; i < (layoutColumnCount - count); i++)
                {
                    this.form.addColumn(new ColumnDesigner({
                        entry: {
                            'Width': 10.0,
                            'SizeType': 'Percent'
                        },
                        form: this.form,
                        index: count + i,
                        added: true
                    }));
                }
            }
        },
        _renderLayout: function(layout) {
            //console.log('applying layout.');

            // destroy existing DnD sources
            if (this._sources)
            {
                array.forEach(this._sources, function(source) {
                    source.destroy();
                });
            }

            this._sources = [];

            var rows = layout.rows,
                children = layout.children,
                rowCount = Math.max((this.form && this.form.get('rowCount')) || 0, rows.length),
                columnCount = Math.max((this.form && this.form.get('columnCount')) || 0, layout.columnCount),
                tableNode = domConstruct.create('table', {
                    'class': 'design-surface-table'
                }, this.domNode),
                tableColGroupNode = domConstruct.create('colgroup', null, tableNode),
                tableBodyNode = domConstruct.create('tbody', null, tableNode),
                tableRowNode,
                tableCellNode,
                containerNode,
                source;

            domConstruct.create('col', {
            }, tableColGroupNode);

            /* todo: process actual column widths */
            var columnWidth = 100 / columnCount;
            for (var j = 0; j < columnCount; j++)
            {
                domConstruct.create('col', {
                    'width': columnWidth + '%'
                }, tableColGroupNode);
            }

            var placements = [];

            if (rows.length > 0)
            {
                tableRowNode = domConstruct.create('tr', {
                    'class': 'design-surface-selector-row'
                }, tableBodyNode);

                for (var i = 0; i < columnCount + 1; i++)
                {
                    tableCellNode = domConstruct.create('td', {
                        'class': 'design-surface-cell design-surface-selector-cell',
                        'data-select-column': i-1
                    }, tableRowNode);
                }
            }

            for (var j = 0; j < rowCount; j++)
            {
                var row = rows[j];

                tableRowNode = domConstruct.create('tr', {
                    'class': 'design-surface-row'
                }, tableBodyNode);

                tableCellNode = domConstruct.create('td', {
                    'class': 'design-surface-cell design-surface-selector-cell',
                    'data-select-row': j
                }, tableRowNode);

                for (var i = 0; i < columnCount; i++)
                {
                    var cell = row && row[i];
                    if (cell)
                    {
                        // do not do anything for spanned cells
                        if (cell.span) continue;

                        var widget = cell.widget,
                            designRow = widget.get('row') || 0,
                            designRowSpan = widget.get('rowSpan') || 1,
                            designColumn = widget.get('column') || 0,
                            designColumnSpan = widget.get('columnSpan') || 1;

                        tableCellNode = domConstruct.create('td', {
                            'colspan': designColumnSpan,
                            'rowspan': designRowSpan,
                            'class': 'design-surface-cell',
                            'data-design-row': designRow,
                            'data-design-column': designColumn
                        }, tableRowNode);

                        placements.push({
                            node: tableCellNode,
                            widget: widget
                        });
                    }
                    else
                    {
                        tableCellNode = domConstruct.create('td', {
                            'class': 'design-surface-cell design-surface-cell-empty'
                        }, tableRowNode);
                    }

                    // create DnD source
                    source = new DesignSurface.Source(tableCellNode, {
                        owner: this,
                        empty: !cell,
                        row: j,
                        column: i,
                        copyOnly: true,
                        selfAccept: false,
                        onDropProperty: lang.hitch(this, this._onDropProperty),
                        onDropDesigner: lang.hitch(this, this._onDropDesigner)
                    });

                    source.startup();

                    this._sources.push(source);
                }
            }

            /* we do placement at this point so that sizing can be calculated correctly */
            array.forEach(placements, function(placement) {
                var placementStyle = domStyle.getComputedStyle(placement.node),
                    placementBox = domGeometry.getMarginBox(placement.node, placementStyle),
                    placementPadExtents = domGeometry.getPadExtents(placement.node, placementStyle),
                    placementBorderExtents = domGeometry.getBorderExtents(placement.node, placementStyle);

                containerNode = domConstruct.create('div', {
                    'dndType': 'designer',
                    'dndData': placement.widget.id,
                    'class': 'dojoDndItem',
                    'style': {
                        'padding': '0px' // MUST be zero
                    }
                }, placement.node);

                var containerStyle = domStyle.getComputedStyle(containerNode),
                    containerBorderExtents = domGeometry.getBorderExtents(containerNode, containerStyle);

                domGeometry.setContentSize(containerNode, {
                    h: (placementBox.h - placementPadExtents.h - placementBorderExtents.h - containerBorderExtents.h)
                });

                containerNode.appendChild(placement.widget.domNode);
            }, this);

            if (this.tableNode)
                this.tableNode.parentNode.removeChild(this.tableNode);

            array.forEach(children, function(child) {
                if (typeof child.layout == 'function') child.layout();
            });

            this.currentLayout = layout;
            this.tableNode = tableNode;

            if (this._sources)
            {
                array.forEach(this._sources, function(source) {
                    source.sync();
                });
            }
        },
        _readFromLayout: function(layout, row, column) {
            return (layout.rows[row] && layout.rows[row][column]);
        },
        _applyPushToConnectionTree: function(amount, parent, result) {
            result = result || {};

            for (var i = 0; i < parent.children.length; i++)
            {
                var connection = parent.children[i],
                    displacement = amount - connection.distance,
                    node = connection.node;

                if (result[node.id])
                {
                    if (displacement > result[node.id].value)
                        result[node.id].value = displacement;
                }
                else
                {
                    result[node.id] = {
                        widget: node.widget,
                        value: displacement
                    };
                }

                this._applyPushToConnectionTree(displacement, node, result);
            }

            return result;
        },
        _buildConnectionTree: function(layout, parent, nodes, root) {
            /* node: {widget: null, row: 0, column: 0, rowSpan: 0, columnSpan: 0, children:[{distance: 0, node: null}]} */

            var span = [parent.column, parent.column + parent.columnSpan],
                rowCount = layout.rows.length,
                columnCount = layout.columnCount,
                encountered = {},
                nodes = nodes || {},
                root = root || parent;

            //console.log('build col:%d to %d, row:%d', span[0], span[1], parent.row);

            for (var column = span[0]; column < span[1]; column++)
            {
                for (var row = (parent.row + parent.rowSpan); row < rowCount; row++)
                {
                    var data = this._readFromLayout(layout, row, column);

                    /* empty cell - skip */
                    if (!data) continue;

                    var widget = data.widget;

                    /* encountered self (i.e. due to scan from top of root) - skip */
                    if (widget === parent.widget) continue;

                    /* encountered the node being moved (also this tree's root) - skip */
                    if (widget === root.widget) continue;

                    /* already encountered (i.e. spanned cell in layout) - skip */
                    if (encountered[widget.id]) continue;

                    encountered[widget.id] = true;

                    if (nodes[widget.id])
                    {
                        /* re-using an existing node, no need to build child tree */
                        parent.children.push({
                            distance: row - (parent.row + parent.rowSpan),
                            node: nodes[widget.id]
                        });
                    }
                    else
                    {
                        var node = {
                            id: widget.id,
                            widget: widget,
                            row: widget.get('row'),
                            rowSpan: widget.get('rowSpan') || 1,
                            column: widget.get('column'),
                            columnSpan: widget.get('columnSpan') || 1,
                            children: []
                        };

                        nodes[widget.id] = node;

                        parent.children.push({
                            distance: row - (parent.row + parent.rowSpan),
                            node: node
                        });

                        this._buildConnectionTree(layout, node, nodes, root);
                    }

                    break;
                }
            }
        },
        moveWidget: function(widget, targetRow, targetColumn) {
            var layout = this.currentLayout,
                widgetRowSpan = widget.get('rowSpan') || 1,
                widgetColumnSpan = widget.get('columnSpan') || 1,
                root = {
                    id: widget.id,
                    widget: widget,
                    row: targetRow,
                    rowSpan: 0, /* always start scan from top of root */
                    column: targetColumn,
                    columnSpan: widgetColumnSpan,
                    children: []
                };

            this._buildConnectionTree(layout, root);

            var push = this._applyPushToConnectionTree(widgetRowSpan, root);

            //console.log('tree: %o', root);
            //console.log('push: %o', push);

            /* apply push values to widgets */
            for (var name in push)
            {
                var pushed = push[name].widget,
                    value = push[name].value;
                if (value > 0)
                {
                    pushed.unchecked(function() {
                        this.set('row', this.get('row') + value);
                    });
                }
            }

            widget.unchecked(function() {
                this.set('row', targetRow);
                this.set('column', targetColumn);
            });

            topic.publish(string.substitute('/quickforms/design/${0}/designerMoved', [this._designGroup]), widget, this);

            /* delay to allow other dnd functionality to stop */
            /* todo: is there an event/message to listen to for this? */
            setTimeout(lang.hitch(this, function() {
                this.layout(true);
            }), 50);
        },
        _onDropProperty: function(toSource, propertyContext) {
            var ctor = ControlDesignerRegistry.getDesignerForDataType(propertyContext.data['dataTypeId']);

            if (!ctor) return;

            var designer = new ctor({
                form: this.form
            });

            designer.setupFor(propertyContext);

            this.form.addControl(designer);

            this.addChild(designer);

            this._handleSelectionOf(designer, false);

            this._onDropDesigner(toSource, designer);
        },
        _onDropDesigner: function(toSource, widget) {
            var layout = this.currentLayout,
                columnCount = layout.columnCount,
                toData = this._readFromLayout(layout, toSource.row, toSource.column),
                toWidget = toData && toData.widget,
                toRowSpan = (toWidget && toWidget.get('rowSpan')) || 1,
                widgetRowSpan = (widget && widget.get('rowSpan')) || 1,
                widgetColumnSpan = (widget && widget.get('columnSpan')) || 1,
                /* if we are dropping before a widget, or if there is no widget, the target row is the dropped row */
                targetRow = (!toData || toSource.before)
                    ? toSource.row
                    : toSource.row + toRowSpan,
                targetColumn = ((toSource.column + widgetColumnSpan) > columnCount)
                    ? columnCount - widgetColumnSpan
                    : toSource.column;

            this.moveWidget(widget, targetRow, targetColumn);
        },
        insertRowAround: function(widget, before) {
            var widgetRow = widget.get('row') || 0,
                widgetRowSpan = widget.get('rowSpan') || 1,
                targetRow = before ? widgetRow : widgetRow + widgetRowSpan;

            this.insertRowAt(targetRow);
        },
        insertRowAt: function(targetRow) {
            this.form.addRow(new RowDesigner({
                entry: {
                    'Height': 35,
                    'SizeType': 'Absolute'
                },
                form: this.form,
                index: targetRow
            }), targetRow);

            array.forEach(this.getChildren(), function(childWidget) {
                var childRow = childWidget.get('row') || 0;
                if (childRow >= targetRow)
                {
                    childWidget.unchecked(function() {
                        this.set('row', this.get('row') + 1);
                    });

                    topic.publish(string.substitute('/quickforms/design/${0}/designerMoved', [this._designGroup]), childWidget, this);
                }
            }, this);

            /* delay to allow other dnd functionality to stop */
            /* todo: is there an event/message to listen to for this? */
            setTimeout(lang.hitch(this, function() {
                this.layout(true);
            }), 50);
        },
        deleteRowAt: function(targetRow) {
            var layout = this.currentLayout,
                rowCount = layout.rows.length,
                columnCount = layout.columnCount;

            for (var column = 0; column < columnCount; column++)
            {
                var currentData = this._readFromLayout(layout, targetRow, column);
                if (currentData) return; /* not empty */
            }

            this.form.removeRow(targetRow);

            array.forEach(this.getChildren(), function(childWidget) {
                var childRow = childWidget.get('row') || 0;
                if (childRow >= targetRow)
                {
                    childWidget.unchecked(function() {
                        this.set('row', this.get('row') - 1);
                    });

                    topic.publish(string.substitute('/quickforms/design/${0}/designerMoved', [this._designGroup]), childWidget, this);
                }
            }, this);

            /* delay to allow other dnd functionality to stop */
            /* todo: is there an event/message to listen to for this? */
            setTimeout(lang.hitch(this, function() {
                this.layout(true);
            }), 50);
        },
        validateDeleteRowAt: function(targetRow) {
            var layout = this.currentLayout,
                rowCount = layout.rows.length,
                columnCount = layout.columnCount;

            for (var column = 0; column < columnCount; column++)
            {
                var currentData = this._readFromLayout(layout, targetRow, column);
                if (currentData) return {error: 'occupied'};
            }

            return false;
        },
        insertColumnAround: function(widget, before) {
            var widgetColumn = widget.get('column') || 0,
                widgetColumnSpan = widget.get('columnSpan') || 1,
                targetColumn = before ? widgetColumn : widgetColumn + widgetColumnSpan;

            this.insertColumnAt(targetColumn);
        },
        insertColumnAt: function(targetColumn) {
            this.form.addColumn(new ColumnDesigner({
                entry: {
                    'Width': 10.0,
                    'SizeType': 'Percent'
                },
                form: this.form,
                index: targetColumn
            }), targetColumn);

            array.forEach(this.getChildren(), function(childWidget) {
                var childColumn = childWidget.get('column') || 0;
                if (childColumn >= targetColumn)
                {
                    childWidget.unchecked(function() {
                        this.set('column', this.get('column') + 1);
                    });

                    topic.publish(string.substitute('/quickforms/design/${0}/designerMoved', [this._designGroup]), childWidget, this);
                }
            }, this);

            /* delay to allow other dnd functionality to stop */
            /* todo: is there an event/message to listen to for this? */
            setTimeout(lang.hitch(this, function() {
                this.layout(true);
            }), 50);
        },
        deleteColumnAt: function(targetColumn) {
            var layout = this.currentLayout,
                rowCount = layout.rows.length,
                columnCount = layout.columnCount;

            for (var row = 0; row < rowCount; row++)
            {
                var currentData = this._readFromLayout(layout, row, targetColumn);
                if (currentData) return; /* not empty */
            }

            this.form.removeColumn(targetColumn);

            array.forEach(this.getChildren(), function(childWidget) {
                var childColumn = childWidget.get('column') || 0;
                if (childColumn >= targetColumn)
                {
                    childWidget.unchecked(function() {
                        this.set('column', this.get('column') - 1);
                    });

                    topic.publish(string.substitute('/quickforms/design/${0}/designerMoved', [this._designGroup]), childWidget, this);
                }
            }, this);

            /* delay to allow other dnd functionality to stop */
            /* todo: is there an event/message to listen to for this? */
            setTimeout(lang.hitch(this, function() {
                this.layout(true);
            }), 50);
        },
        validateDeleteColumnAt: function(targetColumn) {
            var layout = this.currentLayout,
                rowCount = layout.rows.length,
                columnCount = layout.columnCount;

            for (var row = 0; row < rowCount; row++)
            {
                var currentData = this._readFromLayout(layout, row, targetColumn);
                if (currentData) return {error: 'occupied'};
            }

            return false;
        },
        validateSize: function(widget, targetRowSpan, targetColumnSpan) {
            var layout = this.currentLayout,
                rowCount = layout.rows.length,
                columnCount = layout.columnCount,
                widgetRow = widget.get('row') || 0,
                widgetRowSpan = widget.get('rowSpan') || 1,
                widgetColumn = widget.get('column') || 0,
                widgetColumnSpan = widget.get('columnSpan') || 1;

            //console.log('row: %d, col: %d, rSpan: %d, cSpan: %d', widgetRow, widgetColumn, widgetRowSpan, widgetColumnSpan);

            if (targetRowSpan < 1)
                return { error: 'bounds', what: 'rowSpan', message: this.rowSpanBoundsErrorText };

            if (targetColumnSpan < 1)
                return { error: 'bounds', what: 'columnSpan', message: this.columnSpanBoundsErrorText };

            /* size being reduced, no need to validate beyond minimum */
            if (targetRowSpan <= widgetRowSpan && targetColumnSpan <= widgetColumnSpan)
                return false;

            if (columnCount < (widgetColumn + targetColumnSpan))
                return { error: 'bounds', what: 'column', message: this.columnBoundsErrorText };

            //console.log('checking row %d to %d', widgetRow, widgetRow + targetRowSpan - 1);

            for (var row = widgetRow; row < (widgetRow + targetRowSpan) && row < rowCount; row++)
            {
                var span = [
                    row < (widgetRow + widgetRowSpan)
                        ? widgetColumn + widgetColumnSpan
                        : widgetColumn,
                    widgetColumn + targetColumnSpan
                ];

                //console.log('row %d checking column %d to %d', row, span[0], span[1]);

                for (var column = span[0]; column < span[1]; column++)
                {
                    var currentData = this._readFromLayout(layout, row, column);

                    /* empty cell - skip */
                    if (!currentData) continue;

                    var currentWidget = currentData.widget;

                    /* encountered self - skip */
                    if (currentWidget === widget) continue;

                    /* since we do not push on widget resize, return an error as we've encountered something */
                    return { error: 'occupied', what: currentWidget.id, message: this.occupiedErrorText };
                }
            }

            return false;
        },
        validateMove: function(widget, targetRow, targetColumn) {
            var layout = this.currentLayout,
                columnCount = layout.columnCount,
                widgetColumnSpan = widget.get('columnSpan') || 1,
                /* if we are dropping before a widget, or if there is no widget, the target row is the dropped row */
                encountered = {};

            if (targetRow < 0)
                return { error: 'bounds', what: 'row', message: this.rowBoundsErrorText };

            if (targetColumn < 0)
                return { error: 'bounds', what: 'column', message: this.columnBoundsErrorText };

            if (columnCount < (targetColumn + widgetColumnSpan))
                return { error: 'bounds', what: 'column', message: this.columnBoundsErrorText };

            for (var column = targetColumn; column < (targetColumn + widgetColumnSpan); column++)
            {
                var currentData = this._readFromLayout(layout, targetRow, column);

                /* empty cell - skip */
                if (!currentData) continue;

                var currentWidget = currentData.widget;

                /* encountered self - skip */
                if (currentWidget === widget) continue;

                if (currentData.span)
                {
                    if (encountered[currentWidget.id]) continue;

                    /* encountered bisection - error */
                    return {
                        error: 'bisection',
                        what: currentWidget.id,
                        message: this.bisectionErrorText
                    };
                }

                encountered[currentWidget.id] = true;
            }

            return false;
        },
        validateMoveFromSource: function(toSource, fromSource) {
            var layout = this.currentLayout,
                columnCount = layout.columnCount,
                toData = this._readFromLayout(layout, toSource.row, toSource.column),
                toWidget = toData && toData.widget,
                toRowSpan = (toWidget && toWidget.get('rowSpan')) || 1,
                fromRow = fromSource.row,
                fromColumn = fromSource.column,
                fromData = this._readFromLayout(layout, fromRow, fromColumn),
                fromWidget = fromData && fromData.widget,
                fromRowSpan = (fromWidget && fromWidget.get('rowSpan')) || 1,
                fromColumnSpan = (fromWidget && fromWidget.get('columnSpan')) || 1,
                /* if we are dropping before a widget, or if there is no widget, the target row is the dropped row */
                targetRow = (!toData || toSource.before)
                    ? toSource.row
                    : toSource.row + toRowSpan,
                targetColumn = ((toSource.column + fromColumnSpan) > columnCount)
                    ? columnCount - fromColumnSpan
                    : toSource.column;

            return this.validateMove(fromWidget, targetRow, targetColumn);
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

            this.form = null;

            this.layout();
        },
        layout: function(force) {
            if(!this._borderBox || !this._borderBox.h) return;

            var layout = this.currentLayout,
                children = this.getChildren(),
                lookup = {},
                update = false;

            if (layout)
            {
                array.forEach(layout.children, function(child) {
                    lookup[child.id] = true;
                });

                for (var i = 0; i < children.length; i++)
                {
                    if (!lookup[children[i].id]) break;
                }

                update = (children.length != i) || (children.length != layout.children.length);
            }
            else
            {
                update = true;
            }

            if (update || force)
            {
                layout = this._buildLayoutFor(children);

                this._syncNonVisibleDesigners(layout);
                this._renderLayout(layout);
                this._syncDomWithSelectionState();
            }
        }
    });

    DesignSurface.Source = _Source;
    DesignSurface.RowContextMenu = _RowContextMenu;
    DesignSurface.ColumnContextMenu = _ColumnContextMenu;
    DesignSurface.CellContextMenu = _CellContextMenu;

    return DesignSurface;
});