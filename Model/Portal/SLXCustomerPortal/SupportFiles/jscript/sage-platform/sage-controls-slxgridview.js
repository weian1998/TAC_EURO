require([
        'dojo/dnd/Moveable',
        'dojo/dom',
        'dojo/on',
        'dojo/query',
        'dojo/dom-class',
        'dojo/dom-style',
        'dojo/dom-geometry',
        'dojo/_base/lang'
    ], function(
        Moveable,
        dom,
        on,
        query,
        domClass,
        domStyle,
        domGeom,
        lang
    ){

    String.prototype.trim = function() {
        return this.replace( /^\s+|\s+$/g , '');
    };

    window.slxdatagrid = function(gridID) {
        this.gridID = gridID;
        this.containerId = gridID + '_container';
        this.expandAllCell = null;
        this.expandable = false;
        this.table = null;
        this.expandclassname = 'slxgridrowexpand';
        this.expandnoiconclassname = 'slxgridrowexpandnoicon';
        this.collapseclassname = 'slxgridrowcollapse';
        this.collapsenoiconclassname = 'slxgridrowcollapsenoicon';
        this.contentdivclassname = 'cellcontents';
        this.pagerclassname = 'gridPager';
        this.collapsedheight = '16px';
        this.wids = [];
        this.key = '';
        this.expandHandle = null;

        this.__idIndexer = 0;
        this.HeaderRow = null;
        var tbl = dom.byId(gridID);
        if (tbl) {
            this.table = tbl;
            if (tbl.getAttribute('key')) {
                this.key = tbl.getAttribute('key');
            }

            if ((tbl.rows.length > 0) && (tbl.rows[0].cells.length > 0)) {
                var cell = (domClass.contains(tbl.rows[0], this.pagerclassname)) ?
                    tbl.rows[1].cells[0] : tbl.rows[0].cells[0];

                this.expandable = (domClass.contains(cell, this.expandclassname) ||
                    domClass.contains(cell, this.expandnoiconclassname) ||
                        domClass.contains(cell, this.collapseclassname) ||
                            domClass.contains(cell, this.collapsenoiconclassname));
                // set up listeners for click events on row expanders
                if (this.expandable) {
                    this.expandAllCell = cell;
                    if (this.expandHandle) {
                        this.expandHandle.remove();
                    }

                    this.expandHandle = on(cell, 'click', lang.hitch(this, this.expandCollapseAll), true);
                }
            }

            this.setHeaderRow();
            this.initColWidths();
            this.setSortIDs();
            this.attachResizeEvent();

        }
    };

    slxdatagrid.prototype.GridKey = function() {
        return this.gridID + this.key;
    };

    slxdatagrid.prototype.dispose = function() {
        this.table = null;
        this.expandAllCell = null;
    };

    slxdatagrid.prototype.getColIndexStart = function() {
        return (this.expandable) ? 1 : 0;
    };

    slxdatagrid.prototype.setSortIDs = function() {
        if ((this.table.rows.length > 0) && (this.HeaderRow)) {
            var idx = (this.table.id.lastIndexOf('_') > 0) ? this.table.id.lastIndexOf('_') + 1 : 0;
            var idRoot = this.table.id.substring(idx);
            for (var i = 0; i < this.HeaderRow.cells.length; i++) {
                var links = query('A', dom.byId(this.HeaderRow.cells[i]));
                for (var j = 0; j < links.length; j++) {
                    links[j].id = idRoot + this.__idIndexer++;
                }
            }
        }
    };

    // ----------------------- row expand/collapse section---------------------------------------------------------------- //
    slxdatagrid.prototype.expandCollapseAll = function () {
        var i;
        if (domClass.contains(this.expandAllCell, this.expandclassname)) {
            //expand all
            for (i = 1; i < this.table.rows.length; i++) {
                this.expandRow(this.table.rows[i]);
            }

            domClass.remove(this.expandAllCell, this.expandclassname);
            domClass.add(this.expandAllCell, this.collapseclassname);
        } else if (domClass.contains(this.expandAllCell, this.collapseclassname)) {
            //collapse all
            for (i = 1; i < this.table.rows.length; i++) {
                this.collapseRow(this.table.rows[i]);
            }

            domClass.remove(this.expandAllCell, this.collapseclassname);
            domClass.add(this.expandAllCell, this.expandclassname);
        }
    };

    function expandCollapseRow() {
        var row = this.gridobj.getRow(this.idx);
        this.gridobj.toggleRow(row);
    }

    slxdatagrid.prototype.toggleRow = function(row) {
        if (row) {
            if (domClass.contains(row.cells[0], this.expandclassname) ||
                domClass.contains(row.cells[0], this.expandnoiconclassname)) {
                this.expandRow(row);
            } else if (domClass.contains(row.cells[0], this.collapseclassname) ||
                domClass.contains(row.cells[0], this.collapsenoiconclassname)) {
                this.collapseRow(row);
            }
        }
    };

    slxdatagrid.prototype.expandRow = function(row) {

        if (row) {
            var cell = row.cells[0];
            if (domClass.contains(cell, this.collapseclassname) || (!domClass.contains(cell, this.expandclassname) && !domClass.contains(cell, this.expandnoiconclassname))) {
                return;
            }

            var collapseH = this.collapsedheight.replace('px', '');

            for (var i = this.getColIndexStart(); i < row.cells.length; i++) {
                cell = row.cells[i];
                if (cell.childNodes[0]) {
                    if (domClass.contains(cell.childNodes[0], this.contentdivclassname)) {
                        if (cell.childNodes[0].scrollHeight > collapseH) {
                            domStyle.set(cell.childNodes[0], 'height', '100%');
                        }
                    }
                }
            }
            var expandoCell = row.cells[0];

            if (domClass.contains(expandoCell, this.expandclassname)) {
                domClass.remove(expandoCell, this.expandclassname);
                domClass.add(expandoCell, this.collapseclassname);
            } else {
                domClass.remove(expandoCell, this.expandnoiconclassname);
                domClass.add(expandoCell, this.collapsenoiconclassname);
            }
        }
    };

    slxdatagrid.prototype.collapseRow = function(row) {
        if (row) {
            var cell = row.cells[0];
            if (domClass.contains(cell, this.expandclassname) || (!domClass.contains(cell, this.collapseclassname) && !domClass.contains(cell, this.collapsenoiconclassname))) {
                return;
            }
            var collapseH = this.collapsedheight.replace('px', '');
            var setH = collapseH;
            for (var i = this.getColIndexStart(); i < row.cells.length; i++) {
                cell = row.cells[i];
                if (cell.childNodes[0]) {
                    if (domClass.contains(cell.childNodes[0], this.contentdivclassname)) {
                        setH = (collapseH < cell.childNodes[0].scrollHeight) ? collapseH : cell.childNodes[0].scrollHeight;
                        domStyle.set(cell.childNodes[0], 'height', setH + 'px');
                    }
                }
            }

            var expandoCell = row.cells[0];

            if (domClass.contains(expandoCell, this.collapseclassname)) {
                domClass.remove(expandoCell, this.collapseclassname);
                domClass.add(expandoCell, this.expandclassname);
            } else {
                domClass.remove(expandoCell, this.collapsenoiconclassname);
                domClass.add(expandoCell, this.expandnoiconclassname);
            }
        }
    };

    slxdatagrid.prototype.getRow = function(idx) {
        if ((this.table) && (this.table.rows.length > idx)) {
            return this.table.rows[idx];
        }
        return null;
    };

    // ----------------------- end row expand/collapse section---------------------------------------------------------------- //

    // ----------------------- start column resize section-------------------------------------------------------------------- //

    // ------------remembering column widths...

    slxdatagrid.prototype.initColWidths = function() {
        if (this.HeaderRow) {
            if (this.getWidthsFromCookie()) {
                if (this.expandable) {
                    this.setWidth(0, '20', false);
                }
                for (var i = this.getColIndexStart(); i < this.HeaderRow.cells.length; i++) {
                    this.setWidth(i, this.wids[i], false);
                }
            } else {
                this.fillSpace();
            }
        }
    };

    slxdatagrid.prototype.fillSpace = function() {
        if (this.HeaderRow) {
            if (this.expandable) {
                this.setWidth(0, '20', false);
            }

            var cont = dom.byId(this.containerId);
            var container = this.getRegion(cont);
            var containerW = container.right - container.left;

            var tbl = this.getRegion(this.table);
            this.doResize();
            var spaceWidth = container.right - tbl.right;

            var divCols = this.HeaderRow.cells.length;
            if (this.expandable) {
                divCols--;
            }

            var increaseBy = Math.round(spaceWidth / divCols);
            increaseBy--;
            this.getCurrentWidths();
            var start = (this.expandable) ? 1 : 0;
            if (increaseBy > 3) {
                for (var i = start; i < this.HeaderRow.cells.length; i++) {
                    var newtableregion = this.getRegion(this.table);
                    if (newtableregion.right > container.right - increaseBy) {
                        increaseBy = container.right - newtableregion.right - 2;
                    }
                    if (newtableregion.right > container.right - 4) {
                        return;
                    }
                    var newWidth = this.wids[i] + increaseBy;
                    if (this.wids[i]) {
                        this.setWidth(i, newWidth, false);
                        //did we grow too big?
                        //this takes care of IE6
                        if (cont.scrollWidth > containerW) {
                            this.setWidth(i, newWidth - (cont.scrollWidth - containerW), false);
                            return;
                        }
                        //now to take care of FireFox and IE7
                        newtableregion = this.getRegion(this.table);
                        var tblWidth = newtableregion.right - newtableregion.left - 2;
                        if (tblWidth >= containerW) {
                            var newNewWidth = newWidth - (tblWidth - containerW + 5);
                            this.setWidth(i, newNewWidth, false);
                            return;
                        }
                    }
                }
            }
        }
    };

    slxdatagrid.prototype.getCurrentWidths = function() {
        if (this.HeaderRow) {
            this.wids = [];
            for (var i = 0; i < this.HeaderRow.cells.length; i++) {
                this.wids.push(this.getColumnWidth(i));
            }
        }
    };

    slxdatagrid.prototype.getColumnWidth = function(colIndex) {
        if (this.HeaderRow) {
            if (this.HeaderRow.cells[colIndex]) {
                var region = this.getRegion(this.HeaderRow.cells[colIndex]);
                return region.right - region.left;
            }
        }
        return 0;
    };

    slxdatagrid.prototype.getRegion = function(node) {
        var pos = domGeom.position(node, true);

        // Transform our position object into what the old YAHOO.util.Region object looked like
        var results = {
            bottom: pos.y - pos.h,
            left: pos.x,
            right: pos.x + pos.w,
            top: pos.y
        };

        return results;
    };

    slxdatagrid.prototype.getWidthsFromCookie = function () {
        var widthcookie =  cookie.getCookie('GRIDCW');
        if (widthcookie) {
            var grids = widthcookie.split('||');
            for (var i = 0; i < grids.length; i++) {
                var widthdef = grids[i].split('!');
                if (widthdef[0] == this.GridKey()) {
                    if (widthdef[1]) {
                        this.wids = widthdef[1].split(':');
                        return true;
                    }
                }
            }
        }
        //if we get here, it means we don't have the widths in the cookie
        //this.getCurrentWidths(); // add the current widths to the wids array.
        return false;
    };

    slxdatagrid.prototype.setWidthsToCookie = function() {
        this.getCurrentWidths(); // make sure the wids array is up-to-date.
        var widthcookie = cookie.getCookie('GRIDCW');
        if (widthcookie) {
            var grids = widthcookie.split('||');
            widthcookie = '';
            var needtoadd = true;
            for (var i = 0; i < grids.length; i++) {
                var widthdef = grids[i].split('!');
                if (widthdef[0] == this.GridKey()) {
                    widthdef[1] = this.generateWidthCookieString();
                    needtoadd = false;
                }
                widthcookie += (i > 0) ? '||' : '';
                widthcookie += widthdef[0] + '!' + widthdef[1];
            }
            if (needtoadd) {
                widthcookie += (widthcookie !== '') ? '||' : '';
                widthcookie += this.GridKey() + '!' + this.generateWidthCookieString();
            }
        } else {
            widthcookie = this.GridKey() + '!' + this.generateWidthCookieString();
        }
        document.cookie = 'GRIDCW=' + widthcookie;
    };

    slxdatagrid.prototype.generateWidthCookieString = function() {
        var str = '';
        for (var i = 0; i < this.wids.length; i++) {
            str += (i > 0) ? ':' : '';
            var num = this.wids[i];
            num = Math.round(num);
            str += num;
        }

        return str;
    };

    slxdatagrid.prototype.setWidth = function(colIdx, width, persist) {
        if (!isNaN(width)) {
            width = width + 'px';
        }

        if (this.HeaderRow) {
            for (var r = 0; r < this.table.rows.length; r++) {
                if (this.table.rows[r].cells[colIdx]) {
                    var cell = dom.byId(this.table.rows[r].cells[colIdx]);
                    cell.style.width = width;
                    cell.style.position = '';
                }
            }

            if (persist) {
                this.setWidthsToCookie();
            }
        }
    };

    slxdatagrid.prototype.setHeaderRow = function() {
        for (var r = 0; r < this.table.rows.length; r++) {
            if (this.table.rows[r].getAttribute('HeaderRow')) {
                this.HeaderRow = this.table.rows[r];
                return;
            }
        }
    };

    slxdatagrid.prototype.doResize = function() {
        var cont = dom.byId(this.containerId);
        var container = this.getRegion(cont);

        var tbl = this.getRegion(this.table);

        if ((tbl.right - tbl.left) > (container.right - container.left)) {
            if (cont.style.height === '') {
                var tblheight = tbl.bottom - tbl.top;
                dom.byId(this.containerId).style.height = (tblheight + 20) + 'px';
            }
        }
    };

    slxdatagrid.prototype.attachResizeEvent = function() {
        var viewport = window['mainViewport'];
        var panel = (viewport ? viewport.findById('center_panel_center') : false);

        if (panel) {
            panel.on('resize', function(panel, adjWidth, adjHeight, width, height) {
                this.doResize();
            }, this);
        }
    };

    slxdatagridcolumn = function(headerColId, datagrid, colIdx) {
        if (headerColId) {
            this.datagrid = datagrid;
            this.colIndex = colIdx;
            this.headerColId = headerColId;
            this.handleElId = headerColId;
            this.isMoving = false;

            var node = dom.byId(headerColId);
            if (node) {
                this.domNode = node;
                this.position = domGeom.position(this.domNode);

                this.moveable = new Moveable(node);

                // dojo drag events
                this.onMoveHandle = this.moveable.on('Move', lang.hitch(this, this.onMove));
                this.onFirstMoveHandle = this.moveable.on('FirstMove', lang.hitch(this, this.onFirstMove));
                this.onMoveStopHandle = this.moveable.on('MoveStop', lang.hitch(this, this.onMoveStop));

                // dom mouse events
                this.onmouseoverHandle = on(node, 'mouseover', lang.hitch(this, this.onmouseover));
                this.onmouseoutHandle = on(node, 'mouseout', lang.hitch(this, this.onmouseout));
            }
        }
    };

    slxdatagridcolumn.prototype.refreshPosition = function() {
        var node = dom.byId(this.headerColId);
        if (node) {
            this.domNode = node;
            this.position = domGeom.position(this.domNode);
        }
    };

    slxdatagridcolumn.prototype.dispose = function() {
        this.datagrid = null;
        this.onMoveHandle.remove();
        this.onFirstMoveHandle.remove();
        this.onMoveStopHandle.remove();
        this.onmouseoverHandle.remove();
        this.onmouseoutHandle.remove();

        this.moveable.destroy();
    };

    slxdatagridcolumn.prototype.onFirstMove = function(mover, e) {
        this.startWidth = mover.node.offsetWidth;
        this.startPosX = e.clientX;
        this.startTop = mover.node.style.top;
        this.startLeft = mover.node.style.left;
    };

    slxdatagridcolumn.prototype.onMove = function(mover, leftTop, e) {
        this.isMoving = true;

        // Lock in left/top positions
        mover.node.style.top = this.startTop;
        mover.node.style.left = this.startLeft;

        var newWidth = e.clientX - this.position.x;
        newWidth = newWidth * 1.1;
        domStyle.set(mover.node, 'width', (newWidth + 'px'));

        this.datagrid.setWidth(this.colIndex, mover.node.style.width, true);
        this.refreshPosition();

        this.isMoving = false;
    };

    slxdatagridcolumn.prototype.onMoveStop = function() {
        this.isMoving = false;
    };

    slxdatagridcolumn.prototype.onmouseover = function(e) {
        if (!this.isMoving && this.isDraggableRegion(e.clientX)) {
            this.domNode.style.cursor = 'col-resize';
        } else {
            this.domNode.style.cursor = '';
        }
    };

    slxdatagridcolumn.prototype.isDraggableRegion = function(clientX) {
        this.refreshPosition();

        var rightPos = this.position.x + this.position.w;
        var padding = 6;

        // We must fall in between the rows
        if (clientX > (rightPos - padding) && clientX < (rightPos + padding)) {
            return true;
        }

        return false;
    };

    slxdatagridcolumn.prototype.onmouseout = function() {
        this.domNode.style.cursor = '';
    };
});