
//Fix for IE9 Standards mode...
//came from a sencha forum post:  http://www.sencha.com/forum/showthread.php?125869-Menu-shadow-probolem-in-IE9&p=579336
if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function (html) {
        var frag = document.createDocumentFragment(),
		    div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
    };
}
//End IE9 Standards mode...

// Ext 3.x functions reimplemented for 2.1 rollback
if (typeof Ext.isDefined === 'undefined') {
    Ext.isDefined = function(val) {
        return typeof val != 'undefined';
    }
}

if (typeof Ext.isString === 'undefined') {
    Ext.isString = function(val) {
        return typeof val === 'string';
    }
}

if (typeof Ext.isBoolean === 'undefined') {
    Ext.isBoolean = function(val) {
        return typeof val === 'boolean';
    }
}

if (typeof Ext.isFunction === 'undefined') {
    Ext.isFunction = function(val) {
        return typeof val === 'function';
    }
}

if (typeof Ext.isObject === 'undefined') {
    Ext.isObject = function(val) {
        return typeof val === 'object';
    }
}

if (Ext.version == 2.1) {
    // Fixes an issue with modal alert dialogs appearing behind loading masks.

    //Ext.WindowMgr.zseed = 50000; //this caused picklist drop downs to appear behind the dialog. so removing for now  

    // Fixes issue described here: http://extjs.com/forum/showthread.php?t=33896
    // This issue caused problems in DateTimePicker changing h:mm AM values to h:00 PM.

    // private
    Date.createParser = function(format) {
        var funcName = "parse" + Date.parseFunctions.count++;
        var regexNum = Date.parseRegexes.length;
        var currentGroup = 1;
        Date.parseFunctions[format] = funcName;

        var code = "Date." + funcName + " = function(input){\n"
          + "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1, ms = -1, o, z, u, v;\n"
          + "input = String(input);var d = new Date();\n"
          + "y = d.getFullYear();\n"
          + "m = d.getMonth();\n"
          + "d = d.getDate();\n"
          + "var results = input.match(Date.parseRegexes[" + regexNum + "]);\n"
          + "if (results && results.length > 0) {";
        var regex = "";

        var special = false;
        var ch = '';
        for (var i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            }
            else if (special) {
                special = false;
                regex += String.escape(ch);
            }
            else {
                var obj = Date.formatCodeToRegex(ch, currentGroup);
                currentGroup += obj.g;
                regex += obj.s;
                if (obj.g && obj.c) {
                    code += obj.c;
                }
            }
        }

        code += "if (u){\n"
          + "v = new Date(u * 1000);\n" // give top priority to UNIX time
          + "}else if (y >= 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0 && ms >= 0){\n"
          + "v = new Date(y, m, d, h, i, s, ms);\n"
          + "}else if (y >= 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0){\n"
          + "v = new Date(y, m, d, h, i, s);\n"
          + "}else if (y >= 0 && m >= 0 && d > 0 && h >= 0 && i >= 0){\n"
          + "v = new Date(y, m, d, h, i);\n"
          + "}else if (y >= 0 && m >= 0 && d > 0 && h >= 0){\n"
          + "v = new Date(y, m, d, h);\n"
          + "}else if (y >= 0 && m >= 0 && d > 0){\n"
          + "v = new Date(y, m, d);\n"
          + "}else if (y >= 0 && m >= 0){\n"
          + "v = new Date(y, m);\n"
          + "}else if (y >= 0){\n"
          + "v = new Date(y);\n"
          + "}\n}\nreturn (v && (z || o))?" // favour UTC offset over GMT offset
          + " (Ext.type(z) == 'number' ? v.add(Date.SECOND, -v.getTimezoneOffset() * 60 - z) :" // reset to UTC, then add offset
          + " v.add(Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn))) : v;\n" // reset to GMT, then add offset
          + "}";

        Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$", "i");
        eval(code);
    };

    // private
    Ext.apply(Date.parseCodes, {
        j: {
            g: 1,
            c: "d = parseInt(results[{0}], 10);\n",
            s: "(\\d{1,2})" // day of month without leading zeroes (1 - 31)
        },
        M: function() {
            for (var a = [], i = 0; i < 12; a.push(Date.getShortMonthName(i)), ++i); // get localised short month names
            return Ext.applyIf({
                s: "(" + a.join("|") + ")"
            }, Date.formatCodeToRegex("F"));
        },
        n: {
            g: 1,
            c: "m = parseInt(results[{0}], 10) - 1;\n",
            s: "(\\d{1,2})" // month number without leading zeros (1 - 12)
        },
        o: function() {
            return Date.formatCodeToRegex("Y");
        },
        g: function() {
            return Date.formatCodeToRegex("G");
        },
        h: function() {
            return Date.formatCodeToRegex("H");
        },
        P: {
            g: 1,
            c: [
              "o = results[{0}];",
              "var sn = o.substring(0,1);", // get + / - sign
              "var hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60);", // get hours (performs minutes-to-hour conversion also, just in case)
              "var mn = o.substring(4,6) % 60;", // get minutes
              "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + String.leftPad(hr, 2, '0') + String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
          ].join("\n"),
            s: "([+\-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
        }
    });

    // private
    Date.formatCodeToRegex = function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for Date.parseCodes above)
        var p = Date.parseCodes[character];

        if (p) {
            p = Ext.type(p) == 'function' ? p() : p;
            Date.parseCodes[character] = p; // reassign function result to prevent repeated execution      
        }

        return p ? Ext.applyIf({
            c: p.c ? String.format(p.c, currentGroup || "{0}") : p.c
        }, p) : {
            g: 0,
            c: null,
            s: Ext.escapeRe(character) // treat unrecognised characters as literals
        }
    };

    Date.prototype.getGMTOffset = function(colon) {
        return (this.getTimezoneOffset() > 0 ? "-" : "+")
            + String.leftPad(Math.abs(Math.floor(this.getTimezoneOffset() / 60)), 2, "0")
            + (colon ? ":" : "")
            + String.leftPad(Math.abs(this.getTimezoneOffset() % 60), 2, "0");
    };

    // If browser is IE 7, ExtJs is doing a calculation for the width of the button text and
    // emitting an inline style that is incorrect.  Specifically the style was "width: 19px",
    // which caused the word "Cancel" on an Ext.Msg.prompt to look like "Car". See SlxDefect
    // 1-67721.  The additional checks in the first "if" block were taken from Ext ver. 3.0.
    // The 3.0 version changes the autoWidth property to a function named doAutoWidth().
    Ext.override(Ext.Button, {
        autoWidth: function() {
            if (this.el && this.text && typeof this.width == 'undefined') {
                this.el.setWidth("auto");
                if (Ext.isIE7 && Ext.isStrict) {
                    var ib = this.btnEl;
                    if (ib && ib.getWidth() > 20) {
                        ib.clip();
                        ib.setWidth(Ext.util.TextMetrics.measure(ib, this.text).width + ib.getFrameWidth('lr'));
                    }
                }
                if (this.minWidth) {
                    if (this.el.getWidth() < this.minWidth) {
                        this.el.setWidth(this.minWidth);
                    }
                }
            }
        }
    }); 
    
    //Need override to add isIE8 condition to this autoWidth
    Ext.override(Ext.menu.Menu, {
     autoWidth : function(){
	        var el = this.el, ul = this.ul;
	        if(!el){
	            return;
	        }
	        var w = this.width;
	        if(w){
	            el.setWidth(w);	            
	        }else if(Ext.isIE && !isIE8){
	            el.setWidth(this.minWidth);
	            var t = el.dom.offsetWidth;
	            el.setWidth(ul.getWidth()+el.getFrameWidth("lr"));
	        }
	    }
    });
    
    // In ExtJS 2.0 is not aware of IE8.  This causes all of our isIE6 checks to fail and all 
    // IE6 specific styles are applied in IE8
    // Override isIE6 variable to become aware of IE8 and of isIE7 variable to be true in IE8 scenario
    var isIE6;
    var isIE7; 
    var isIE8;       
    function IECheck() 
    {    
        ua = navigator.userAgent.toLowerCase(),
        check = function(r){
            return r.test(ua);
        };
        var isOpera = check(/opera/);
        var isIE = !isOpera && check(/msie/);
            isIE7 = isIE && check(/msie 7/) || check(/msie 8/);
            isIE8 = isIE && check(/msie 8/);
            isIE6 = isIE && !isIE7 && !isIE8;       
    }
    
    IECheck();
    Ext.isIE6 = isIE6;
    Ext.isIE7 = isIE7;
    Ext.isIE8 = isIE8;

    Ext.override(Ext.grid.GridView, {
        renderUI: function() {

            var header = this.renderHeaders();
            var body = this.templates.body.apply({ rows: '' });


            var html = this.templates.master.apply({
                body: body,
                header: header
            });

            var g = this.grid;

            g.getGridEl().dom.innerHTML = html;

            this.initElements();


            this.mainBody.dom.innerHTML = this.renderRows();
            this.processRows(0, true);

            if (this.deferEmptyText !== true) {
                this.applyEmptyText();
            }

            Ext.fly(this.innerHd).on("click", this.handleHdDown, this);
            this.mainHd.on("mouseover", this.handleHdOver, this);
            this.mainHd.on("mouseout", this.handleHdOut, this);
            this.mainHd.on("mousemove", this.handleHdMove, this);

            this.scroller.on('scroll', this.syncScroll, this);
            if (g.enableColumnResize !== false) {
                this.splitone = new Ext.grid.GridView.SplitDragZone(g, this.mainHd.dom);
            }

            if (g.enableColumnMove) {
                this.columnDrag = new Ext.grid.GridView.ColumnDragZone(g, this.innerHd);
                this.columnDrop = new Ext.grid.HeaderDropZone(g, this.mainHd.dom);
            }

            if (g.enableHdMenu !== false) {
                if (g.enableColumnHide !== false) {
                    this.colMenu = new Ext.menu.Menu({ id: g.id + "-hcols-menu" });
                    this.colMenu.on("beforeshow", this.beforeColMenuShow, this);
                    this.colMenu.on("itemclick", this.handleHdMenuClick, this);
                }
                this.hmenu = new Ext.menu.Menu({ id: g.id + "-hctx" });
                this.hmenu.add(
                { id: "asc", text: this.sortAscText, cls: "xg-hmenu-sort-asc" },
                { id: "desc", text: this.sortDescText, cls: "xg-hmenu-sort-desc" }
            );
                if (g.enableColumnHide !== false) {
                    this.hmenu.add('-',
                    { id: "columns", text: this.columnsText, menu: this.colMenu, iconCls: 'x-cols-icon', handler: function() { return false; } }
                );
                }
                this.hmenu.on("itemclick", this.handleHdMenuClick, this);

            }

            if (g.enableDragDrop || g.enableDrag) {
                this.dragZone = new Ext.grid.GridDragZone(g, {
                    ddGroup: g.ddGroup || 'GridDD'
                });
            }

            this.updateHeaderSortState();

        },

        doRender: function(cs, rs, ds, startRow, colCount, stripe) {
            var ts = this.templates, ct = ts.cell, rt = ts.row, last = colCount - 1;
            var tstyle = 'width:' + this.getTotalWidth() + ';';
            var buf = [], cb, c, p = {}, rp = { tstyle: tstyle }, r;
            for (var j = 0, len = rs.length; j < len; j++) {
                r = rs[j]; cb = [];
                if (typeof r === "undefined")
                    continue;
                if (this.id && r) {
                    rp.id = (this.activeView != "list")
                    ? [this.id, "row", r.id].join("_")
                    : [this.id, "row" + r.id, r.data[this.ds.converter.meta.keyfield]].join("_");
                }
                var rowIndex = (j + startRow);
                for (var i = 0; i < colCount; i++) {
                    c = cs[i];
                    p.id = c.id;
                    p.css = i == 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
                    p.attr = p.cellAttr = "";
                    p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
                    p.style = c.style;
                    if (p.value == undefined || p.value === "") p.value = "&#160;";
                    if (r.dirty && typeof r.modified[c.name] !== 'undefined') {
                        p.css += ' x-grid3-dirty-cell';
                    }
                    cb[cb.length] = ct.apply(p);
                }
                var alt = [];
                if (stripe && ((rowIndex + 1) % 2 == 0)) {
                    alt[0] = "x-grid3-row-alt";
                }
                if (r.dirty) {
                    alt[1] = " x-grid3-dirty-row";
                }
                rp.cols = colCount;
                if (this.getRowClass) {
                    alt[2] = this.getRowClass(r, rowIndex, rp, ds);
                }
                rp.alt = alt.join(" ");
                rp.cells = cb.join("");
                buf[buf.length] = rt.apply(rp);
            }
            return buf.join("");
        }
    });

    // 3.2 compatibility
    Ext.override(Ext.Panel, {
        update: function(html, loadScripts, callback) {
            if (Ext.isString(html)) {
                this.body.dom.innerHTML = html;
            } else {
                if (Ext.isString(html.html)) {
                    this.body.dom.innerHTML = html.html;
                } else {
                    if (html.html) {
                        this.body.dom.innerHTML = html.html();
                    }
                }
            }
            if (typeof callback === 'function') callback(this);
        },
        
        getFooterToolbar: function() {
            return this.getBottomToolbar();
        },
        
        removeAll : function(autoDestroy){
            this.initItems();
            var item, items = [];
            while((item = this.items.last())){
                items.unshift(this.remove(item, autoDestroy));
            }
            return items;
        }

    });

    //ext 2 has no getStore()
    Ext.override(Ext.form.ComboBox, {
        getStore: function () {
            return this.store;
        }
    });

    //no radiogroup or checkboxgroup xtype in 2.1, 
    //no events for them 2.2
    //and no working setvalue() methods until 3
    //had to recreate all of them here
    //implement checkboxgroup
    Ext.form.CheckboxGroup = Ext.extend(Ext.form.Field, {
        columns: 'auto',
        vertical: false,
        allowBlank: true,
        blankText: "You must select at least one item in this group",
        defaultType: 'checkbox',
        groupCls: 'x-form-check-group',
        initComponent: function () {
            this.addEvents(
                'change'
            );
            Ext.form.CheckboxGroup.superclass.initComponent.call(this);
        },
        onRender: function (ct, position) {
            if (!this.el) {
                var panelCfg = {
                    cls: this.groupCls,
                    layout: 'column',
                    border: false,
                    renderTo: ct
                };
                var colCfg = {
                    defaultType: this.defaultType,
                    layout: 'form',
                    border: false,
                    defaults: {
                        hideLabel: true,
                        anchor: '100%'
                    }
                }

                if (this.items[0].items) {
                    Ext.apply(panelCfg, {
                        layoutConfig: { columns: this.items.length },
                        defaults: this.defaults,
                        items: this.items
                    })
                    for (var i = 0, len = this.items.length; i < len; i++) {
                        Ext.applyIf(this.items[i], colCfg);
                    };

                } else {

                    var numCols, cols = [];

                    if (typeof this.columns == 'string') { // 'auto' so create a col per item
                        this.columns = this.items.length;
                    }
                    if (!Ext.isArray(this.columns)) {
                        var cs = [];
                        for (var i = 0; i < this.columns; i++) {
                            cs.push((100 / this.columns) * .01); // distribute by even %
                        }
                        this.columns = cs;
                    }

                    numCols = this.columns.length;

                    // Generate the column configs with the correct width setting
                    for (var i = 0; i < numCols; i++) {
                        var cc = Ext.apply({ items: [] }, colCfg);
                        cc[this.columns[i] <= 1 ? 'columnWidth' : 'width'] = this.columns[i];
                        if (this.defaults) {
                            cc.defaults = Ext.apply(cc.defaults || {}, this.defaults)
                        }
                        cols.push(cc);
                    };

                    // Distribute the original items into the columns
                    if (this.vertical) {
                        var rows = Math.ceil(this.items.length / numCols), ri = 0;
                        for (var i = 0, len = this.items.length; i < len; i++) {
                            if (i > 0 && i % rows == 0) {
                                ri++;
                            }
                            if (this.items[i].fieldLabel) {
                                this.items[i].hideLabel = false;
                            }
                            cols[ri].items.push(this.items[i]);
                        };
                    } else {
                        for (var i = 0, len = this.items.length; i < len; i++) {
                            var ci = i % numCols;
                            if (this.items[i].fieldLabel) {
                                this.items[i].hideLabel = false;
                            }
                            cols[ci].items.push(this.items[i]);
                        };
                    }

                    Ext.apply(panelCfg, {
                        layoutConfig: { columns: numCols },
                        items: cols
                    });
                }

                this.panel = new Ext.Panel(panelCfg);
                this.panel.ownerCt = this;
                this.el = this.panel.getEl();

                if (this.forId && this.itemCls) {
                    var l = this.el.up(this.itemCls).child('label', true);
                    if (l) {
                        l.setAttribute('htmlFor', this.forId);
                    }
                }

                var fields = this.panel.findBy(function (c) {
                    return c.isFormField;
                }, this);

                this.items = new Ext.util.MixedCollection();
                this.items.addAll(fields);
            }
            Ext.form.CheckboxGroup.superclass.onRender.call(this, ct, position);
        },
        afterRender: function () {
            Ext.form.CheckboxGroup.superclass.afterRender.call(this);
            this.items.each(function (item) {
                item.on('check', this.fireChecked, this);
            }, this);
        },
        fireChecked: function () {
            var arr = [];
            this.items.each(function (item) {
                if (item.checked) {
                    arr.push(item);
                }
            });
            this.fireEvent('change', this, arr);
        },
        validateValue: function (value) {
            if (!this.allowBlank) {
                var blank = true;
                this.items.each(function (f) {
                    if (f.checked) {
                        return blank = false;
                    }
                }, this);
                if (blank) {
                    this.markInvalid(this.blankText);
                    return false;
                }
            }
            return true;
        },
        onDestroy: function () {
            Ext.destroy(this.panel);
            Ext.form.CheckboxGroup.superclass.onDestroy.call(this);
        },
        onDisable: function () {
            this.items.each(function (item) {
                item.disable();
            })
        },
        onEnable: function () {
            this.items.each(function (item) {
                item.enable();
            })
        },
        isDirty: function () {
            //override the behaviour to check sub items.
            if (this.disabled || !this.rendered) {
                return false;
            }
            var dirty = false;
            this.items.each(function (item) {
                if (item.isDirty()) {
                    dirty = true;
                    return false;
                }
            });
            return dirty;
        },
        onResize: function (w, h) {
            this.panel.setSize(w, h);
            this.panel.doLayout();
        },
        reset: function () {
            Ext.form.CheckboxGroup.superclass.reset.call(this);
            this.items.each(function (c) {
                if (c.reset) {
                    c.reset();
                }
            }, this);
        },
        initValue: Ext.emptyFn,
        getValue: Ext.emptyFn,
        getRawValue: Ext.emptyFn,
        setValue: function (id, value) {
            if (this.rendered) {
                if (arguments.length == 1) {
                    if (Ext.isArray(id)) {
                        //an array of boolean values
                        Ext.each(id, function (val, idx) {
                            var item = this.items.itemAt(idx);
                            if (item) {
                                item.setValue(val);
                            }
                        }, this);
                    } else if (Ext.isObject(id)) {
                        //set of name/value pairs
                        for (var i in id) {
                            var f = this.getBox(i);
                            if (f) {
                                f.setValue(id[i]);
                            }
                        }
                    } else {
                        this.setValueForItem(id);
                    }
                } else {
                    var f = this.getBox(id);
                    if (f) {
                        f.setValue(value);
                    }
                }
            } else {
                this.values = arguments;
            }
            return this;
        },
        setValueForItem: function (val) {
            val = String(val).split(',');
            this.eachItem(function (item) {
                if (val.indexOf(item.inputValue) > -1) {
                    item.setValue(true);
                }
            });
        },
        getBox: function (id) {
            var box = null;
            this.eachItem(function (f) {
                if (id == f || f.dataIndex == id || f.id == id || f.getName() == id) {
                    box = f;
                    return false;
                }
            });
            return box;
        },
        getValue: function () {
            var out = [];
            this.eachItem(function (item) {
                if (item.checked) {
                    out.push(item);
                }
            });
            return out;
        },
        eachItem: function (fn) {
            if (this.items && this.items.each) {
                this.items.each(fn, this);
            }
        },
        setRawValue: Ext.emptyFn
    });
    Ext.reg('checkboxgroup', Ext.form.CheckboxGroup);

    //implement radiogroup --extends checkboxgroup
    Ext.form.RadioGroup = Ext.extend(Ext.form.CheckboxGroup, {
        allowBlank: true,
        blankText: "You must select one item in this group",
        defaultType: 'radio',
        groupCls: 'x-form-radio-group',
        initComponent: function () {
            this.addEvents('change');
            Ext.form.RadioGroup.superclass.initComponent.call(this);
        },
        fireChecked: function () {
            if (!this.checkTask) {
                this.checkTask = new Ext.util.DelayedTask(this.bufferChecked, this);
            }
            this.checkTask.delay(10);
        },
        bufferChecked: function () {
            var out = null;
            this.items.each(function (item) {
                if (item.checked) {
                    out = item;
                    return false;
                }
            });
            this.fireEvent('change', this, out);
        },
        onDestroy: function () {
            if (this.checkTask) {
                this.checkTask.cancel();
                this.checkTask = null;
            }
            Ext.form.RadioGroup.superclass.onDestroy.call(this);
        }
    });
    Ext.reg('radiogroup', Ext.form.RadioGroup);

    //override to fix where there are no items an arrat to be added
    Ext.override(Ext.Container, {
        initComponent: function() {
            Ext.Container.superclass.initComponent.call(this);

            this.addEvents(

                'afterlayout',

                'beforeadd',

                'beforeremove',

                'add',

                'remove'
            );


            var items = this.items;
            if (items) {
                delete this.items;
                if (Ext.isArray(items)) {
                    if (items.length > 0) {
                        this.add.apply(this, items);
                    }
                } else {
                    this.add(items);
                }
            }
        }
    });

    Ext.lib.Dom.setXY = function(el, xy) {  //override mechanism doesn't work on the lib.Dom object
        if (typeof xy == 'undefined') return;
        el = Ext.fly(el, '_setXY');
        el.position();
        var pts = el.translatePoints(xy);
        if (xy[0] !== false) {
            el.dom.style.left = isNaN(pts.left) ? 0 : pts.left + "px";
        }
        if (xy[1] !== false) {
            el.dom.style.top = isNaN(pts.top) ? 0 : pts.top + "px";
        }
    };


    //override to fix where there is an ef but no getVersion
    Ext.override(Ext.ux.data.BufferedJsonReader, {
        readRecords: function(o) {
            var s = this.meta;
            if (s.versionProperty && (!this.ef || !this.getVersion)) {
                this.getVersion = this.getJsonAccessor(s.versionProperty);
            }
            // shorten for future calls
            if (!this.__readRecords) {
                this.__readRecords = Ext.ux.data.BufferedJsonReader.superclass.readRecords;
            }
            var intercept = this.__readRecords.call(this, o);
            if (s.versionProperty) {
                var v = this.getVersion(o);
                intercept.version = (v === undefined || v === "") ? null : v;
            }
            return intercept;
        }

    });

    Ext.override(Ext.form.TimeField, {
        initComponent: function () {
            Ext.form.TimeField.superclass.initComponent.call(this);

            if (typeof this.minValue == "string") {
                this.minValue = this.parseDate(this.minValue);
            }
            if (typeof this.maxValue == "string") {
                this.maxValue = this.parseDate(this.maxValue);
            }

            if (!this.store) {
                var min = this.parseDate(this.minValue);
                if (!min) {
                    min = new Date().clearTime();
                }
                var max = this.parseDate(this.maxValue);
                if (!max) {
                    max = new Date().clearTime().add('mi', (24 * 60) - 1);
                }
                var times = [];
                while (min <= max) {
                    times.push([min.dateFormat(this.format)]);
                    var newmin = min.add('mi', this.increment);
                    if ((newmin < min) && (this.increment > 0)) { //dst change -- calc on a different day to avoid the looping issue
                        newmin = newmin.add('h', 25);
                        max = max.add('h', 24);
                    }
                    min = newmin;
                }
                this.store = new Ext.data.SimpleStore({
                    fields: ['text'],
                    data: times
                });
                this.displayField = 'text';
            }
        }

    });
}