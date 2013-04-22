/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([],
function () {
    if (typeof Array.prototype.swap === 'undefined') {
        Array.prototype.swap = function (d, s) {
            if (d > this.length || s > this.length) {
                console.warn('Illegal index given');
                return;
            }
            var tmp = this[d];
            this[d] = this[s];
            this[s] = tmp;
            return this;
        };
    }

    if (typeof Array.prototype.getIndexByProp === 'undefined') {
        Array.prototype.getIndexByProp = function (str, prop) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (prop && prop === 'key') {
                    if (str in this[i]) {
                        return i;
                    }
                } else if (prop && prop === 'value') {
                    for (var p in this[i]) {
                        if (this[i].hasOwnProperty(p)) {
                            if (this[i][p] === str) {
                                return i;
                            }
                        }
                    }
                }
            }
        };
    }


    if (typeof Array.prototype.placeByAttr === 'undefined') {
        Array.prototype.placeByAttr = function (obj, attr) {
            var placed = false;
            if (!this.length) {
                this.push(obj);
                return; 
            }
            for (var i = 0, len = this.length; i < len; i++) {
                if (this[i][attr] >= obj[attr]) {
                    placed = true;
                    this.splice(i, 0, obj);
                    break;
                }
            }
            if (!placed) {
                this.push(obj); 
            }
        };
    }

    if (typeof Array.prototype.removeByAttr === 'undefined') {
        Array.prototype.removeByAttr = function (attr, arg) {
            if (!this.length) {
                return; 
            }
            for (var i = 0, len = this.length; i < len; i++) {
                if (this[i][attr] === arg) {
                    this.splice(i, 1);
                    break;
                }
            }
        };
    }

    //To support IE8
    if (typeof Array.prototype.filter === 'undefined') {
        Array.prototype.filter = function (fun /*, thisp */) {
            "use strict";

            if (this == null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun != "function")
                throw new TypeError();

            var res = [];
            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, t))
                        res.push(val);
                }
            }

            return res;
        };
    }
    return Array;
});
