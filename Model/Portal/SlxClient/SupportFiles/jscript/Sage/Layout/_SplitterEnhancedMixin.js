/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/_base/connect',
        'dojox/storage/LocalStorageProvider',
        'dojo/dom-style',
        'dojo/_base/sniff'
],
function (declare, connect, LocalStorageProvider, domStyle, has) {
    // Uncomment to clear for testing.
    //    var localStore = new LocalStorageProvider();
    //    localStore.initialize();
    //    localStore.clear();
    return declare('Sage.Layout._SplitterEnhancedMixin', null, {
        postCreate: function () {
            this.inherited(arguments);
            this.storageId = this.id;
        },
        startup: function () {
            this.inherited(arguments);
            if (has('ie')) {
                this._widthPadding = 19;
            }

            if (this.splitter === true) {
                this._addEventHandlers();
                this._addEventSubscribers();
                //Check for saved dimensions of the BorderContainer and apply them if available.
                var dim = this._getFromLocalStorage(this.storageId);
                if (dim === null) {
                    dim = { h: this.domNode.scrollHeight + 5, w: this.domNode.scrollWidth };
                }

                this._setupStyle(dim);
                this.resize(dim);
                this._setDefaults(dim);
            }
        },
        splitterDblClick: null,
        splitterStopDrag: null,
        storageId: null,
        // Default Height is reset when user adjusts splitter.  Value applied to position when workspace is toggled.
        _defaultHeight: 310,
        _defaultWidth: 180,
        _widthPadding: 2,
        _setDefaults: function (dim) {
            // summary: Save the drag point as default value for toggle events. 
            // Important!: The first click of the splitter DblClick event raises as a StopDrag event. Check that the default sizes
            // do not get set to the minSizes.
            if ((this.region === 'top' || this.region === 'bottom') && dim.h !== this.minSize) {
                this._defaultHeight = dim.h;
            }
            if ((this.region === 'right' || this.region === 'left') && dim.w > this.minSize + this._widthPadding) {
                this._defaultWidth = dim.w;
            }
        },
        // Default Width is reset when user adjusts splitter.  Value applied to position when workspace is toggled.
        _addEventHandlers: function () {
            var splitter = dijit.byId([this.id, '_splitter'].join(''));
            if (typeof splitter !== 'undefined') {
                //Splitter drag stop event.
                if (this.splitterStopDrag === null) {
                    this.splitterStopDrag = this.connect(splitter, '_stopDrag', function () {
                        if(this.region === 'top') {
                            if(this.h === this.minSize) {
                                connect.publish(['Sage/events/', this.id, '/splitterMinSize'].join(''), this);
                            }
                            else {
                                connect.publish(['Sage/events/', this.id, '/splitterMovedNotMin'].join(''), this);
                            }
                        }
                        this._setDefaults({ h: this.h, w: this.w });
                        this._saveToLocalStorage(this.storageId, { h: this.h, w: this.w });
                    });
                }
                //Splitter double click event.
                if (this.splitterDblClick === null) {
                    this.splitterDblClick = this.connect(splitter, 'onDblClick', function () {
                        this.toggleSplitter();
                        connect.publish(['Sage/events/', this.id, '/splitterToggled'].join(''), this);
                    });
                }
            }
        },
        _addEventSubscribers: function () {
            //Subscribe to an event that matches the id.  This way buttons can determine which splitter to interact with.
            connect.subscribe(['Sage/events/', this.id, '/toggleSplitter'].join(''), this, "toggleSplitter");
        },
        toggleSplitter: function () {
            var dim = {},
                splitter = dijit.byId([this.id, '_splitter'].join('')),
                viewport = dijit.byId("Viewport");
                
            if (typeof splitter !== 'undefined' && splitter !== null) {
                // If this is a top or bottom region, set the height.
                if (this.region === 'top' || this.region === 'bottom') {
                    dim = (this.h === this.minSize) ? { h: this._defaultHeight, w: this.w} : { h: this.minSize, w: this.w };
                }
                // If this is a right or left region, set the width.
                if (this.region === 'right' || this.region === 'left') {
                    dim = (this.w < this.minSize + this._widthPadding) ? { h: this.h, w: this._defaultWidth} : { h: this.h, w: this.minSize };
                }

                if (dim.w === 19) {
                    dim.w = this._defaultWidth;
                }
                
                this._setupStyle(dim);
                this.resize(dim);
                viewport.resize();
                //Save dimensions by key = mainview id.
                this._saveToLocalStorage(this.storageId, dim);
            }
        },
        _setupStyle: function (dim) {
            if (!this.domNode) {
                return;
            }
            
            var hidden = false;
            
            if (this.region === 'top' || this.region === 'bottom') {
                hidden = (dim.h === this.minSize);
            }
            
            if (this.region === 'right' || this.region === 'left') {
                hidden = (dim.w < this.minSize + this._widthPadding);
            }

            if (hidden) {
                domStyle.set(this.domNode, 'overflow', 'hidden');
            } else {
                domStyle.set(this.domNode, 'overflow', 'auto');
            }
        },
        _saveToLocalStorage: function (key, value) {
            var localStore = new LocalStorageProvider();
            localStore.initialize();
            localStore.put(key, value, function (status, key, message) {
                if (status === localStore.FAILED) {
                    console.error('Failed writing key: ' + key + ' in local storage. Message: ' + message);
                }
            });  //Add Name space param.
        },
        _getFromLocalStorage: function (key, value) {
            var localStore = new LocalStorageProvider();
            localStore.initialize();
            return localStore.get(key, value); // returns null if key does not exist. 
        }
    });

});