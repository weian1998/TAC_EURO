/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define(['dijit/layout/TabContainer',
        'dojo/topic',
        'dojo/_base/lang',
        'dojo/_base/declare'
],
function (TabContainer, topic, lang, declare) {
    var groupTabPane = declare("Sage.UI.GroupTabPane", TabContainer, {
        useMenu: false,
        _children: null,
        constructor: function (options) {
            this._children = [];
            this.inherited(arguments);
        },
        addChild: function (widget) {
            // TODO: Call addChildren instead
            this._children.push(widget);
            topic.publish(this.id+"-addChild", widget, this._children.length);
            this._setupChild(widget);
            
            if(!this.selectedChildWidget){
                this.selectChild(widget);
            }

            if (this.doLayout) {
                this.layout();
            }
            
            this.onAddChildrenComplete();
        },
        addChildren: function (widgets) {
            var len = widgets.length,
                filtered,
                chunkSize = 100,
                chunk,
                pos = 0,
                last = false;

            // Split the tabs into chunks, and render that many at one time.
            // Throwing each chunk in a defer to prevent IE8 from throwing a long running script warning.
            while (pos < len) {
                if (pos < len - chunkSize) {
                    chunk = widgets.splice(0, chunkSize);
                } else {
                    chunk = widgets.splice(0, len - pos);
                    last = true;
                }

                pos = pos + chunkSize;

                this.defer((function(chunk, self, last) {
                    return lang.hitch(self, function () {
                        var i,
                            chunkLength = chunk.length,
                            childLen = this._children.length;
                        for (i = 0; i < chunkLength; i++) {
                            if (this._started) {
                                topic.publish(this.id+"-addChild", chunk[i], childLen + i);
                                this._setupChild(chunk[i]);
                                
                                if(!this.selectedChildWidget){
                                    this.selectChild(chunk[i]);
                                }
                                
                                this._children.push(chunk[i]);
                            }
                        }

                        if (last) {
                            if (this.doLayout) {
                                this.layout();
                            }
                            
                            this.onAddChildrenComplete();
                        }
                    });
                })(chunk, this, last));
            }
        },
        onAddChildrenComplete: function () {
        },
        getChildren: function () {
            /* overrides _WidgetBase getChildren */
            return this._children;
        },
        removeChildren: function () {
            var i = 0,
                widget;
            for (i = 0; i < this._children.length; i++) {
                widget = this._children[i];
                topic.publish(this.id + "-removeChild", widget);// publish
                widget.destroyDescendants();
            }

            this._children = [];
            this.destroyDescendants();
            
            if (this.doLayout) {
                this.layout();
            }
        }
    });
    return groupTabPane;
});