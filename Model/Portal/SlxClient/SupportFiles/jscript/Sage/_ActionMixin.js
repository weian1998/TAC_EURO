/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/NodeList-traverse',
    'dojo/_base/declare'
], function (nodeListTraverse, declare) {
    // not inheriting from dijit._Templated, but using similar functionality.
    // this is required for contentTemplate to work property.
    var _actionMixin = declare('Sage._ActionMixin', null, {
        actionsFrom: 'click',
        postCreate: function () {
            // todo: add delegation
            dojo.forEach(this.actionsFrom.split(','), function (event) {
                this.connect(this.domNode, event, this._initiateActionFromEvent);
            }, this);
        },
        _isValidElementForAction: function (el) {
            var contained = this.domNode.contains
                ? this.domNode != el && this.domNode.contains(el)
                : !!(this.domNode.compareDocumentPosition(el) && 16);

            return (this.domNode === el) || contained;
        },
        _initiateActionFromEvent: function (evt) {
            var el = dojo.query(evt.target).closest('[data-action]')[0],
                action = el && dojo.attr(el, 'data-action');

            if (action && this._isValidElementForAction(el) && this._hasAction(action, evt, el)) {
                var parameters = this._getParametersForAction(action, evt, el);

                this._invokeAction(action, parameters, evt, el);

                dojo.stopEvent(evt);
            }
        },
        _getParametersForAction: function (name, evt, el) {
            var parameters = {
                $event: evt,
                $source: el
            };

            for (var i = 0, attrLen = el.attributes.length; i < attrLen; i++) {
                var attributeName = el.attributes[i].name;
                if (/^((?=data-action)|(?!data))/.test(attributeName)) continue;

                /* transform hyphenated names to pascal case, minus the data segment, to be in line with HTML5 dataset naming conventions */
                /* see: http://dev.w3.org/html5/spec/elements.html#embedding-custom-non-visible-data */
                /* todo: remove transformation and use dataset when browser support is there */
                var parameterName = attributeName.substr('data-'.length).replace(/-(\w)(\w+)/g, function ($0, $1, $2) { return $1.toUpperCase() + $2; });

                parameters[parameterName] = dojo.attr(el, attributeName);
            }

            return parameters;
        },
        _hasAction: function (name, evt, el) {
            return (typeof this[name] === 'function');
        },
        _invokeAction: function (name, parameters, evt, el) {
            return this[name].apply(this, [parameters, evt, el]);
        }
    });
    return _actionMixin;
});
