/*globals define, window  */
define([
    'dojo/_base/declare',
    'dojox/widget/Standby'
],
function (declare, Standby) {
    return declare('Sage.UI._DialogLoadingMixin', null, {
        _standby: false,
        showLoading: function () {
            if (!this._standby && this.domNode) {
                var hideNode = this.domNode;
                if (this.containerNode) {
                    hideNode = this.containerNode;
                }
                this._standby = new Standby({
                    target: hideNode,
                    color: 'white',
                    image: 'images/loader_lg.gif',
                    duration: 50
                });
                document.body.appendChild(this._standby.domNode);
                this._standby.startup();
            }
            var self = this;
            window.setTimeout(function () {
                self._standby.show();
            }, 0);
        },
        hideLoading: function () {
            var self = this;
            window.setTimeout(function () {
                if (self._standby) {
                    self._standby.hide();
                }
            }, 1);
        }

    });
});