/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojo/i18n',
       'dojo/i18n!./nls/DashboardWidgetCell',
       'Sage/UI/WidgetEditor',
       'Sage/UI/Dashboard/DashboardWidget',
       'dojox/data/dom',
       'dojox/widget/Portlet',
       'dojo/_base/declare'
],
function (i18n, DashboardWidgetCell, widgetEditor, dashboardWidget, dom, portlet, declare) {
    // dojo.requireLocalization("Sage.UI", "DashboardWidgetCell");
    var widget = declare('Sage.UI.Dashboard.DashboardWidgetCell', [portlet], {
        //summary:
        //		Class responsible for the housing of widgets, this class augments
        //		the default titlepane template with a toolbar as well as a 
        //		div specifically intended to be a target for the rendering 
        //		of a dojox.chart. We also override a few methods pertaining to XHR
        //		from the original classes
        //options: Object
        //		A container of information about this container's child 
        //		DashboardWidget class instance

        onClose: function (evt) {
            // remove *this* from the parentCell childWidget collection
            // get the parent page
            var pg = dijit.byId(this._parentId);
            pg._childWidgets.removeByAttr('id', this.id);
            dojo.publish('/ui/dashboard/pageSave', [pg._page]);
            this.inherited(arguments);
        },
        _onShow: function() {
            this.inherited(arguments);
            if(this.redrawOnShow) {
                this.redrawOnShow = false;
                this.refresh(true);
            }
        },
        onHide: function() {
            this.redrawOnShow = true;
            this.inherited(arguments)
        },
        onDownloadEnd: function (data) {
            if (data) {
                var doc = data.documentElement;
                // iterate over the childNodes and
                // get the definition
                for (var i = 0, len = doc.childNodes.length; i < len; i++) {
                    if (doc.childNodes[i].tagName === 'Content') {
                        var textContent = dom.textContent(doc.childNodes[i]);
                        // set the UI definition first
                        // TODO look into local storage for these
                        // TODO get the definitions while in this loop as well
                        Sage.UI.WidgetDefinitions[this.widgetOptions.name] =
                            dojo.fromJson(textContent);

                        this.widgetDefined = true;
                        dojo.publish('/ui/widget/defined');
                        this._widgetInit();
                    }
                }
            } else {
                console.warn('Error fetching widget definition for' +
                        this.widgetOptions.name);
            }
        },
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.UI.Dashboard", "DashboardWidgetCell"));
            // am I on a hidden tab? This will actually not preload but
            // will ensure widget loading on show (because of the _selectedChild shortcircuit)
            if (this._page >= 0) { this.preload = true; }
            this.href = 'slxdata.ashx/slx/crm/-/dashboard/widget';
            this.ioArgs = {
                handleAs: 'xml',
                content: {
                    name: this.widgetOptions.name,
                    family: this.widgetOptions.family || 'system'
                }
            };
            this._drawLegend();
            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
            this.subscribe('/ui/widget/dropped', function (id, p, c, i) {
                // don't listen to myself
                if (id === this.id) { return; }
                // not my page
                if (p !== this._page) { return; }
                // not my column
                if (c !== this.column) { return; }
                // index > than mine
                if (i > this.index) { return; }
                this._indexUp();
            });
            // Prevent dragging of the portlet if it's within the content,
            //  as scrollbars within the content won't be scrollable
            this.connect(this.containerNode, "onmousedown", function(evt){
                if (dojo.hasClass(evt.target, "dojoxGridScrollbox")) {
                    dojo.stopEvent(evt);
                    return false;
                }
                return true;
            });
            this.arrowNode.title = this.minimizeTooltipText;
        },
        refresh: function (redraw) {
            if (redraw) {
                var dashboardWidget = this._dashboardWidget;
                if(dashboardWidget) {
                    dojo.disconnect(dashboardWidget._winResize);
                    dojo.unsubscribe(dashboardWidget.dropSub);
                }
                // delete the portletSettings
                this.destroyDescendants();
                this._removeIcons();
            }
            this.inherited(arguments);
            this._drawLegend();
        },
        _drawLegend: function() {
            if (this.widgetOptions.showLegend === 'true') {
                this.chartWidth = '67';
                this.legendDisplay = 'block';
            } else {
                this.chartWidth = '100';
                this.legendDisplay = 'none';
            }
        },
        _redrawCharts: function () {
            // call refresh on charting types only
            if (this._dashboardWidget && this._dashboardWidget.definition &&
                this._dashboardWidget.definition.declaredClass === 'Sage.UI.Dashboard.ChartingWidget') {
                this.refresh(true);
            }
        },
        _createIcon: function (clazz, hoverClazz, fn) {
            var imgTooltip = '';
            
            if(clazz === 'dojoxPortletSettingsIcon') {
                imgTooltip = this.settingsTooltipText;
            }
            else if(clazz === 'dojoxCloseNode') {
                imgTooltip = this.closeTooltipText;
            }
            
            if (!this._tbarIcons) { this._tbarIcons = []; }
			
            var icon = dojo.create("div", {
                "class": "dojoxPortletIcon " + clazz,
                "waiRole": "presentation",
                "title": imgTooltip
            });
            
			// If this is a newly created widget, the order of settings icon and close icon is flipped
			if(this.isNew) {
				if(clazz === 'dojoxPortletSettingsIcon' || this._tbarIcons.length < 1) {
					dojo.place(icon, this.arrowNode, "before");
				}
				else {
					dojo.place(icon, this._tbarIcons[0], "before");
				}
			}
			else if(this._tbarIcons.length == 1 && clazz === 'dojoxPortletSettingsIcon') {
				try {
					dojo.place(icon, this._tbarIcons[0], "replace");
				}
				catch(e) { // Widgets with the same name will try a replace which will error out
					dojo.place(icon, this.arrowNode, "before");
				}
			}
			else {
				dojo.place(icon, this.arrowNode, "before");
			}
            
            if (hoverClazz) {
                this.iconMouseOverEvent = this.connect(icon, "onmouseover", function () {
                    dojo.addClass(icon, hoverClazz);
                });
                this.iconMouseOutEvent = this.connect(icon, "onmouseout", function () {
                    dojo.removeClass(icon, hoverClazz);
                });
            }
            // NOTE (help,refresh) go here as well
            if (clazz === 'dojoxPortletSettingsIcon') {
                if(this._tbarIcons.length == 1) {
                    this._tbarIcons[0] = icon;
                }
                else {
                    this._tbarIcons.push(icon);
                }
                
                this.iconClickEvent = this.connect(icon, "onclick", fn);
            }
            else {
                this.connect(icon, "onclick", fn);
            }
            return icon;
        },
        _removeIcons: function () {
            this.disconnect(this.iconClickEvent);
            this.disconnect(this.iconMouseOverEvent);
            this.disconnect(this.iconMouseOutEvent);
            if(this._tbarIcons.length > 0) {
                dojo.empty(this._tbarIcons[0]);
            }
        },
        _editorAdded: function () {
            // widgets created with 'add content' should call this
            var children = this.getChildren();
            this._placeSettingsWidgets();

            // Start up the children
            dojo.forEach(children, function (child) {
                try {
                    if (!child.started && !child._started) {
                        child.startup();
                    }
                }
                catch (e) {
                    console.log(this.id + ":" + this.declaredClass, e);
                }
            });
        },
        _load: function () {
            if(!this.preventRender) {
                // summary:
                //		Load/reload the href specified in this.href. we redefine this
                //		method for our widget as the xhr process is a bit more complex
                //		than the OOB version expected by content/title panes
                this._setContent(this.onDownloadStart(), true);
                // don't actually make the request if one has already been made
                if (!Sage.UI.WidgetDefinitions[this.widgetOptions.name] &&
                        !this.requestPending) {
                    this.requestPending = true;
                    var that = this;
                    var getArgs = {
                        preventCache: false,
                        url: this.href
                    };
                    if (dojo.isObject(this.ioArgs)) {
                        dojo.mixin(getArgs, this.ioArgs);
                    }
                    var hand = (this._xhrDfd = (this.ioMethod || dojo.xhrGet)(getArgs));
                    hand.addCallback(function (data) {
                        try {
                            that._isDownloaded = true;
                            that.requestPending = false;
                            that._setContent(that.processingData || '', true);
                            that.onDownloadEnd(data);
                        } catch (err) {
                            that._onError('Content', err); // onContentError
                        }
                        delete that._xhrDfd;
                        //return html;
                    });
                    hand.addErrback(function (err) {
                        if (!hand.canceled) {
                            // show error message in the pane
                            that._onError('Download', err); // onDownloadError
                        }
                        delete that._xhrDfd;
                        return err;
                    });
                    // Remove flag saying that a load is needed
                    delete this._hrefChanged;
                } else if (this.requestPending) {
                    this._waitForDefinition();
                } else {
                    this.widgetDefined = true;
                    this._widgetInit();
                }
            }
        },
        _setColumn: function (n) {
            this.column = n;
        },
        _setIndex: function (n) {
            this.index = n;
        },
        _indexUp: function () {
            this.index += 1;
        },
        _waitForDefinition: function () {
            this.subscription = this.subscribe('/ui/widget/defined', this,
                function () {
                    this.widgetDefined = true;
                    this._widgetInit();
                });
        },
        _widgetInit: function () {
            //summary:
            //		Method to instantiate a new dashboard widget and append it to
            //		this DashboardWidgetCell 
            //tags:
            //		protected
            if (this.widgetDefined && !this._Widget) {
                this._dashboardWidget = new dashboardWidget({
                    options: this.widgetOptions,
                    parentCell: this
                });
            }
        }
    });
    
    return widget;
});



