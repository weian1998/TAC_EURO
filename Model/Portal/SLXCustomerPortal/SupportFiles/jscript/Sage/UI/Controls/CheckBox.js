/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/CheckBox',
       'dojo/_base/declare'
],
function(checkBox, declare) {
    var widget = declare('Sage.UI.Controls.CheckBox', checkBox, {
        hotKey: '',
        //.Net control behavior
        autoPostBack: false,
        labelText: '',
        labelPlacement: '',
        // @property {boolean} - Indicates whether the implementation should publish that it has dirty data to the ClientBindingManagerService.
        // default = true
        shouldPublishMarkDirty: true,
        constructor: function() {
            this.inherited(arguments);
        },
        postCreate: function () {
            if(this.hotKey !== '') {
                this.focusNode.accessKey = this.hotKey;
            }

            this.connect(this, 'onChange', this.onChanged);

            this._insertLabel();

            this.inherited(arguments);
        },
        _insertLabel: function() {
            var position = 'before',
                labelNode = null;

            if(this.labelPlacement === 'right') {
                position = 'after';
            }

            if(this.labelPlacement !== 'none') {
                labelNode = dojo.create('label', {'for': this.id, innerHTML: this.labelText}, this.domNode, position);
                if(this.labelPlacement === 'top') {
                    // Insert a break after the label, so it appears on top of the checkbox
                    dojo.create('br', null, labelNode, 'after');
                }
            }
        },
        onChanged: function (e) {
            // If configured to do so, publishes the markDirty event, showing that there is un-saved data. 
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            if (this.autoPostBack) {
                if (Sys) {
                    Sys.WebForms.PageRequestManager.getInstance()._doPostBack(this.id, '');
                }
            }
        }
    });
    
    return widget;
});

