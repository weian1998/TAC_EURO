/*global Sage Ext $ console alert Sys XPathResult mainViewport*/
//A FUNCTIONAL CONSTRUCTOR FOR WIDGET OBJECTS
Sage.Analytics.DashboardWidget = Ext.extend(Ext.util.Observable, {
    constructor: function (options) {
        this.config = {};
        //append the values from options
        this.config.name = options.name || '';
        this.config.family = options.family || '';
        this.config.cell = options.cell;
        this.config.panel = options.cell.id;
        this.guid = Sage.Analytics.generateString('wgt');
        this._options = options || {};
        this.listeners = options.listeners;
        this.addEvents({
            "afterdisplay": true,
            "persist": true
        });
        Sage.Analytics.DashboardWidget.superclass.constructor.call(this, options);
    },
    //what to call if no global widgetdefinition exists for a widget name
    getWidgetDefinition: function (forceEditor) {
        var that = this;
        $.ajax({
            type: "GET",
            url: "DashboardService.asmx/GetWidgetByName",
            data: { name: this.config.name,
                family: this.config.family
            },
            dataType: "xml",
            error: function (request, status, error) {
            },
            success: function (data, status) {
                var res = {};
                if (Ext.isIE) {
                    res.html = data.selectSingleNode("Module/Content").text;
                    res.title = data.selectSingleNode("Module/ModulePrefs").attributes.getNamedItem('title').text;
                } else {
                    res.html = data.evaluate("Module/Content", data, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
                    res.title = data.evaluate("Module/ModulePrefs", data, null, XPathResult.ANY_TYPE, null).iterateNext().attributes.title.textContent;
                }
                Sage.Analytics.WidgetDefinitions[that.config.name] = Sys.Serialization.JavaScriptSerializer.deserialize(res.html);
                Sage.Analytics.WidgetDefinitions[that.config.name].title = res.title;
                that.load(false, (forceEditor === true));
            }
        });
    }, //end getWidgetDefinition
    //check for the existance of the widget type in the widgetdefinitions global object
    //go get a def from the db if not
    init: function (forceEditor) {
        if (!Sage.Analytics.WidgetDefinitions[this.config.name]) {
            this.getWidgetDefinition((forceEditor === true));
        } else {
            this.load(false, (forceEditor === true));
        }
    }, //end init
    //the display logic for widgets
    load: function (simple, forceEditor) {
        //where am I?
        var panel = Ext.ComponentMgr.get(this.config.panel), $getData;
        //short-circuit for simple redraws
        if (simple) {
            return this.definition.html(this.config, panel);
        }
        //set loading here
        if (!this.config.loaded || !this.definition.isStatic) {
            if (panel.body) {
                panel.body.dom.innerHTML = '<div style="padding:10px;"><div class="loading-indicator">' +
                    Sage.Analytics.WidgetResource.loading + '</div></div>';
            }
        }
        if (!this.config.defined && Sage.Analytics.WidgetDefinitions[this.config.name]) {
            this.config.defined = true;
            if (this.config.defined && !this.definition) {
                //we have a definition, but not defined yet...
                //DO NOT put the definition in the config
                this.definition =
                    Sage.Analytics.createObject(Sage.Analytics.WidgetDefinitions[this.config.name]);
                //hoist the editor up to 'this'
                this.editor = this.definition.editor;
                if (typeof (this.editor) !== 'function') {
                    this.editor = function () { this.fireEvent('persist'); };
                }
            }
        }
        if (!this.definition.isStatic) {
            //I am not a static widget, therefore I will have, or need, a datasource
            if ((!this._options.datasource) || (forceEditor === true)) {
                //I am a new widget in need of a datasource
                this.editor(Sage.Analytics.generateString('dwEditor')); //callback here? scope issues if yes
            }
            //I am a saved widget or I am being edited
            if (this._options.datasource) {
                $getData = this.setData();
                //hand off to the widget def to render itself
                $getData(panel, this.config, this.definition);
            }
        }
        else {
            //a static widget, display it
            this.setData();
            //is panel avail?
            if (panel) {
                //should static widgets respond to resize?
                panel.update(this.definition.html(this.config, panel), false);
                this.config.loaded = true;
                panel.setTitle(Sage.Analytics.localize(this.config.title) || '');
                this.fireEvent("afterdisplay");
                if (forceEditor === true) {
                    this.editor(Sage.Analytics.generateString('dwEditor'));
                }
            }
        }
    }, //end load
    //many checks for existing data as a widget may pass thru here in various states.
    //i.e. on creation or after being edited etc...
    //the method sets various attributes in preping a widget for display
    setData: function () {
        var self = this;
        //set the name and family if init() didn't
        if (this.config.name === '') { this.config.name = this.definition.name; }
        if (this.config.family === '') { this.config.family = this.definition.family; }
        //set the data from a persisted object
        var att;
        //set all ._options to config
        for (att in this._options) {
            //filter out unwanted...
            if (att && this._options.hasOwnProperty(att)) {
                this.config[att] = this._options[att];
            }
        }
        if (this.config.datasource) {
            var getData = function (panel, config, def, $resize) {
                $.ajax({
                    dataType: 'json',
                    cache: false,
                    url: config.datasource,
                    success: function (data) {
                        //the template will need the returned object
                        config.data = data;
                        if (panel) {
                            //hand off to widget def to render itself
                            def.html(config, panel);
                        }
                        self.fireEvent("afterdisplay");
                    },
                    error: function (a, b, c) {
                        var markup = '<div class="widget-exception">' +
                        Sage.Analytics.WidgetResource.noData + '</div>';
                        panel.removeAll(true);
                        panel.setTitle('');
                        panel.body.dom.innerHTML = '';
                        panel.add({
                            cls: 'sage-widget-no-border',
                            html: markup
                        });
                        panel.doLayout();
                        if (panel.getInnerWidth()) {
                            panel.body.setStyle('width', panel.getInnerWidth() - 2);
                        }
                    }
                }); //end .ajax 
            }; //end var getdata
            return getData;
        }
    }, //end setData
    //refresh action for all widgets
    refresh: function (simple) { //the 'simple' arg will only be true in calls to refresh which do not require a data refresh
        this.load(simple);
    }
}); //end dashboardwidget object
