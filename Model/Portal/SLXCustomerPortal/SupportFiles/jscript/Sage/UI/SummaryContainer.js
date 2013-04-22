/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'Sage/_Templated',
        'Sage/UI/SummaryContents',
        'dojo/_base/declare'
],
function (_Widget, _Templated, summaryContents, declare) {
    var summaryContainer = declare('Sage.UI.SummaryContainer', [_Widget, _Templated], {
        widgetsInTemplate: false,
        templateLocation: '', // 'SummaryTemplates/Account.html',
        contentNode: null,
        paneContents: null,
        entity: null,
        postProcessCallBack: false,
        attributeMap: {
            'content': { node: 'contentNode', type: 'innerHTML' }
        },
        widgetTemplate: new Simplate([
            '<div class="EntityCard">',
                '<div dojoAttachPoint="contentNode">Loading...</div>',
            '</div>'
        ]),
        _setEntityAttr: function (entity) {
            this.entity = entity;
            var pane = new summaryContents({
                templateLocation: this.templateLocation,
                entity: entity
            });
            dojo.place(pane.domNode, this.contentNode, 'only');
            pane.startup();
            this.paneContents = pane;
            if (this.postProcessCallBack) {
                this.postProcessCallBack(this.entity);
            }
        },
        startup: function () {
            if (this.entity) {
                var pane = new summaryContents({
                    templateLocation: this.templateLocation,
                    entity: this.entity
                });
                dojo.place(pane.domNode, this.contentNode, 'only');
                pane.startup();
                this.paneContents = pane;
                if (this.postProcessCallBack) {
                    this.postProcessCallBack(this.entity);
                }
            }
        },
        destroy: function () {
            if (this.paneContents) {
                this.paneContents.destroy(arguments);
            }
            this.inherited(arguments);
        }
    });

    return summaryContainer;
});
