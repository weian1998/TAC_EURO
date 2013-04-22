/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'Sage/UI/Dashboard/WidgetDefinition',
        'dojo/i18n',
        'dojo/_base/lang',
        'dijit/form/TextBox',
        'dijit/form/CheckBox',
        'dojox/charting/widget/Chart2D',
        'dojox/charting/action2d/Highlight',
        'dojox/charting/action2d/MoveSlice',
        'dojox/charting/action2d/Tooltip',
        'dojox/charting/action2d/Magnify',
        'dojox/charting/widget/Legend',
        'dojox/charting/themes/Julie',
        'dojo/i18n!./nls/DashboardWidget'
    ],
function (
        declare,
        widgetDefinition,
        i18n,
        lang
    ) {
    var widget = declare('Sage.UI.Dashboard.DashboardWidget', null, {
        constructor: function (config) {
            dojo.safeMixin(this, config);
            this._setDefinition();
            this._winResize = dojo.connect(window, 'onresize', this, function () {
                if (!this.parentCell.open || !this.parentCell._started) { return; }
                if (this.parentCell.refresh) {
                    this.parentCell.refresh(true);
                }
            });
            this.dropSub = dojo.subscribe('/ui/widget/dropped', this, function (id, p, c, i) {
                if (id === this.parentCell.id) {
                    if (!this.parentCell.open || !this.parentCell._started) { return; }
                    if (this.parentCell.refresh) {
                        this.parentCell.refresh(true);
                    }
                }
            });
        },
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.UI.Dashboard", "DashboardWidget"));
        },
        _getInstanceData: function () {
            if (this.parentCell.isNew && this.definition.editor) {
                this.definition.editor(this.parentCell);
                if(this.parentCell._settingsWidget) { // Default widget, for example, doesn't have a dialog to toggle
                    this.parentCell._settingsWidget.toggle();
                }
                else {
                    this.parentCell._editorAdded();
                }
                return;
            }
            if (!this.definition.isStatic) {
                // get the the 36 data here
                var that = this;
                // do I have a datasource? if so use it for an XHR call
                if (this.options.datasource) {
                    dojo.xhrGet({
                        url: this.options.datasource,
                        handleAs: 'json',
                        load: function (data) {
                            if (data) {
                                that._setInstanceData(data);
                            } else {
                                that.parentCell.set(
                                    'content', this.noQueryDataText + this.options.datasource); //'The server has no data for query ' 
                            }
                        },
                        error: function(data) {
                            that._setInstanceData(null);
                        }
                    });
                } else { // I am a new widget in need of a datasource or a StaticXhr
                    this.parentCell._setContent(this.initializingText || '', true);
                    if (this.definition.isStaticXhr) {
                        // widget handles xhr and cell rendering itself
                        this._setInstanceData(null);
                    }
                    // TODO how to use editor here?
                    if (this.definition.editor) {
                        this.definition.editor(this.parentCell);
                    }
                }
            } else {
                this._setInstanceData();
            }
        },
        _setDefinition: function () {
            // WidgetDefinition is a factory function,
            // the second argument is a callback with the returned definition
            widgetDefinition(
                Sage.UI.WidgetDefinitions[this.options.name], lang.hitch(this, function (definition) {
                    this.definition = definition;
                    this._getInstanceData();
            }));
        },
        _setInstanceData: function (data) {
            // check for isStatic, and if true then just inject the 
            // return from the html() method
            if (this.definition.isStatic) {
                this.parentCell.set('content', this.definition.html(this.parentCell));
                // add the editor after if exists
                if (this.definition.editor) {
                    this.definition.editor(this.parentCell);
                }
            } else {
                // hand off to the widget's html() to handle rendering.
                this.definition.html(this.parentCell, data);
            }
        }
    });

    return widget;
});


