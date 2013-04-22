/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojo/data/ItemFileReadStore',
       'dojox/widget/Portlet',
       'Sage/UI/Controls/_DialogHelpIconMixin',
       'dojo/_base/declare',
       'dojo/i18n!./Dashboard/nls/WidgetDefinition',
       'dojo/dom-style',
       'dojo/on',
       'dojo/_base/lang'
],
function (itemFileReadStore, portlet, _DialogHelpIconMixin, declare, widgetDefinition, domStyle, on, lang) {
    var widget = declare('Sage.UI.WidgetEditor', [dojox.widget.PortletDialogSettings], {
        _grpUrl: new Simplate('slxdata.ashx/slx/crm/-/groups/context/grouplist/{%= $.grp %}'),
        _dimUrl: new Simplate('slxdata.ashx/slx/crm/-/analytics/dimension/{%= $.dim %}'),
        _metUrl: new Simplate('slxdata.ashx/slx/crm/-/analytics/metric/{%= $.met %}'),
        _entityUrl: 'slxdata.ashx/slx/crm/-/groups/context/entityList?filter=analytics',
        _getStore: function (uri) {
            return new itemFileReadStore({
                url: uri
            });
        },
        // bit of a hack, but more efficient than querying the store for it
        _addEnt: function (str) {
            return 'Sage.Entity.Interfaces.I' + str;
        },
        _remEnt: function (str) {
            return str.replace('Sage.Entity.Interfaces.I', '');
        },
        // remove '&' if it is the last character 
        _remAmp: function (str) {
            return str[str.length - 1] === '&' ? str.slice(0, -1) : str;
        },
        _pushEnt: function (val) {
            this._entStr = dojo.string.substitute('entity=${0}&', [val]);
        },
        _pushGrp: function (val) {
            this._grpStr = dojo.string.substitute('groupname=${0}&', [val]);
        },
        _pushDim: function (val) {
            this._dimStr = dojo.string.substitute('dimension=${0}&', [val]);
        },
        _pushMet: function (val) {
            this._metStr = dojo.string.substitute('metric=${0}&', [val]);
        },
        _pushLim: function (val) {
            this._limStr = dojo.string.substitute('limit=${0}&', [val]);
        },
        _pushOth: function (val) {
            this._othStr = dojo.string.substitute('combineother=${0}', [val]);
        },
        _checkHydrate: function () {
            var opts = this.portlet.widgetOptions;
            if (opts.groupname && this._grpField) {
                if(this._originalGroup) {
                    opts.groupname = this._originalGroup;
                }
                var groupField = this._grpField;
                groupField.store.fetch({
                    query: { groupName: opts.groupname },
                    onComplete: function (i, r) {
                        groupField.set('value', groupField.store.getValue(i[0], 'displayName'));
                    },
                    queryOptions: { deep: true }
                });
                this._originalGroup = opts.groupname;
            }
            if (opts.dimension && this._dimField) {
                if(this._originalDimension) {
                    opts.dimension = this._originalDimension;
                }
                var df = this._dimField;
                df.store.fetch({
                    query: { name: opts.dimension },
                    onComplete: function (i, r) {
                        df.set('value', df.store.getValue(i[0], 'displayName'));
                    },
                    queryOptions: { deep: true }
                });
                this._originalDimension = opts.dimension;
            }
            if (opts.metric && this._metField) {
                if(this._originalMetric) {
                    opts.metric = this._originalMetric;
                }
                var mf = this._metField;
                mf.store.fetch({
                    query: { name: opts.metric },
                    onComplete: function (i, r) {
                        mf.set('value', mf.store.getValue(i[0], 'displayName'));
                    },
                    queryOptions: { deep: true }
                });
                this._originalMetric = opts.metric;
            }
            this._hydrateChecked = true;
        },
        // TODO perhaps implement this as a hash. this is not a data intensive 
        // period in the page cycle though, so it may not matter
        _setFields: function (child) {
            switch (child.id) {
                case this.portlet.id + '_ttlField':
                    this._ttlField = child;
                    break;
                case this.portlet.id + '_subField':
                    this._subField = child;
                    break;
                case this.portlet.id + '_entCombo':
                    this._entField = child;
                    on.once(this._entField._buttonNode, 'click', lang.hitch(this, function() {
                        var entityFieldLoading = dojo.byId(this.portlet.id + '_loading');
                        domStyle.set(entityFieldLoading, 'display', 'block');
                        this._entField.set('store', this._getStore(this._entityUrl));
                        this._entField.store.fetch({
                            query: '',
                            onComplete: function() {
                                domStyle.set(entityFieldLoading, 'display', 'none');
                                // Ensure the drop-down opens now
                                // and add focus so clicking away closes it, too
                                entityField.loadAndOpenDropDown();
                                entityField.focus();
                        }});
                    }));
                    break;
                case this.portlet.id + '_grpCombo':
                    this._grpField = child;
                    break;
                case this.portlet.id + '_dimCombo':
                    this._dimField = child;
                    break;
                case this.portlet.id + '_metCombo':
                    this._metField = child;
                    break;
                case this.portlet.id + '_goalField':
                    this._goalField = child;
                    break;
                case this.portlet.id + '_xField':
                    this._xField = child;
                    break;
                case this.portlet.id + '_yField':
                    this._yField = child;
                    break;
                case this.portlet.id + '_numberMaximum':
                    this._numberMaximum = child;
                    this._numberMaximum.constraints.min = 1; // ensure this is positive
                    break;
                case this.portlet.id + '_rdoOthY':
                    this._rdoOthY = child;
                    break;
                case this.portlet.id + '_rdoOthN':
                    this._rdoOthN = child;
                    break;
                case this.portlet.id + '_rdoLegY':
                    this._rdoLegY = child;
                    break;
                case this.portlet.id + '_rdoLegN':
                    this._rdoLegN = child;
                    break;
                case this.portlet.id + '_rdoLabY':
                    this._rdoLabY = child;
                    break;
                case this.portlet.id + '_rdoLabN':
                    this._rdoLabN = child;
                    break;
                case this.portlet.id + '_rdoTruY':
                    this._rdoTruY = child;
                    break;
                case this.portlet.id + '_rdoTruN':
                    this._rdoTruN = child;
                    break;
                case this.portlet.id + '_truncField':
                    this._truncField = child;
                    this._truncField.constraints.min = 1; // ensure this is positive
                    break;
                case this.portlet.id + '_btnOK':
                    this._btnOK = child;
                    break;
                case this.portlet.id + '_btnCancel':
                    this._btnCancel = child;
                    this._btnCancel.set('style', 'margin-left:10px;');
                    break;
                default:
                    //Add custom dijits to the widget editor
                    this[child.id] = child;
                    
                    if(!this.customOptions) {
                        this.customOptions = [];
                    }
                    
                    var splitValue = child.id.split(this.portlet.id);
                    if(splitValue.length == 2) {
                        if(splitValue[1].indexOf('_') == 0) {
                            splitValue[1] = splitValue[1].substring(1);
                        }
                        
                        this.customOptions.push({id: child.id, option: splitValue[1]});
                    }
                    
                    break;
            }
        },
        _validateOOTBRequired: function () {
            // Ent/Grp/Dim/Met require a lookup if change event 
            // not fired
            var retVal = true;
            if (this._entField && !this._entField.isValid()) {
                this._entField.set('state', 'Error');
                retVal = false;
            }
            if (this._grpField && !this._grpField.isValid()) {
                this._grpField.set('state', 'Error');
                retVal = false;
            }
            if (this._dimField && !this._dimField.isValid()) {
                this._dimField.set('state', 'Error');
                retVal = false;
            }
            if (this._metField && !this._metField.isValid()) {
                this._metField.set('state', 'Error');
                retVal = false;
            }
            return retVal;
        },
        toggle: function () {
            var that = this;
            var dashboardPage = dijit.byId(that.portlet._parentId);
            if(dashboardPage.permission) {
                // which fields do I have?
                if (!this._childWidgets) {
                    this._childWidgets = this.getChildren();
                    // cycle through and assign names for manipulation
                    // as we will have a limited number of types predefined
                    for (var i = 0, len = this._childWidgets.length; i < len; i++) {
                        this._setFields(this._childWidgets[i]);
                    }
                }
                // Shows and hides the Dialog box.
                if (!this.dialog) {
                    dojo.require("dijit.Dialog");
                    this.dialog = new dijit.Dialog({ title: this.title });
                    this.dialog.containerNode.style.height = this.dimensions[1] + "px";
                    if(!this.dialog.helpIcon) {
                        dojo.mixin(this.dialog, new _DialogHelpIconMixin());
                        this.dialog.createHelpIconByTopic('Using_Widgets');
                    }
                    
                    dojo.body().appendChild(this.dialog.domNode);
                    // Move this widget inside the dialog
                    this.dialog.containerNode.appendChild(this.domNode);
                    dojo.style(this.dialog.domNode, {
                        "width": this.dimensions[0] + "px",
                        "height": (this.dimensions[1] + 50) + "px"
                    });
                    dojo.style(this.domNode, "display", "");
                }
                // CLOSE the dialog
                if (this.dialog.open) {
                    // reset hydrate_check
                    this._hydrateChecked = false;
                    this.dialog.hide();
                } else {
                    // OPEN the dialog
                    // NOTE parentCell = this.portlet
                    var opts = this.portlet.widgetOptions;
                    this.dialog.show(this.domNode);
                    // hydrate title
                    if (opts.title && this._ttlField) {
                        var resourceTitleString = opts.title.replace(/'/g, '_').replace(/ /g, '_');
                        this._ttlField.set('value', widgetDefinition[resourceTitleString] || opts.title);
                    }
                    // Do I have an entity field?
                    if (this._entField) {
                        // Do not assume all four fields.  But if they are all there,
                        // their events will be chained to one another.
                        // set the change listeners
                        if (this._entField && !this._entChange) {
                            this._entChange = dojo.connect(this._entField,
                                "onChange", this, function (arg) {
                                    var fullEntityName = this._entField.item ? this._entField.item.fullName[0] : this._addEnt(arg),
                                        entityName = this._remEnt(fullEntityName);
                                    this._pushEnt(fullEntityName);
                                    opts.entity = fullEntityName;
                                    opts.resource = entityName;
                                    if (this._grpField) {
                                        this._grpField.set('store', this._getStore(this._grpUrl.apply({ grp: entityName })));
                                        this._grpField.store.urlPreventCache = true;
                                        this._grpField.set('value', '');
                                    }
                                    if (this._dimField) {
                                        this._dimField.set('store', this._getStore(this._dimUrl.apply({ dim: entityName })));
                                        this._dimField.set('value', '');
                                    }
                                    if (this._metField) {
                                        this._metField.set('store', this._getStore(this._metUrl.apply({ met: entityName })));
                                        this._metField.set('value', '');
                                    }
                                    this._checkHydrate();
                                });
                        }
                        if (this._grpField && !this._grpChange) {
                            this._grpChange = dojo.connect(this._grpField,
                                "onChange", this, function (arg) {
                                    if (!this._grpField.isValid()) {
                                        return false;
                                    }
                                    var store = this._grpField.store;
                                    store.fetch({
                                        query: { displayName: arg },
                                        onComplete: function (i, r) {
                                            var gn = store.getValue(
                                                i[0], 'groupName');
                                            that._pushGrp(gn);
                                            opts.groupname = gn;
                                        },
                                        queryOptions: { deep: true }
                                    });
                                });
                        }
                        if (this._dimField && !this._dimChange) {
                            this._dimChange = dojo.connect(this._dimField,
                                "onChange", this, function (arg) {
                                    if (!this._dimField.isValid()) {
                                        return false;
                                    }
                                    var store = this._dimField.store;
                                    store.fetch({
                                        query: { displayName: arg },
                                        onComplete: function (i, r) {
                                            var n = store.getValue(
                                                i[0], 'name');
                                            that._pushDim(n);
                                            opts.dimension = n;
                                        },
                                        queryOptions: { deep: true }
                                    });
                                });
                        }
                        if (this._metField && !this._metChange) {
                            this._metChange = dojo.connect(this._metField,
                                "onChange", this, function (arg) {
                                    if (!this._metField.isValid()) {
                                        return false;
                                    }
                                    var store = this._metField.store;
                                    store.fetch({
                                        query: { displayName: arg },
                                        onComplete: function (i, r) {
                                            var m = store.getValue(
                                                i[0], 'name');
                                            that._pushMet(m);
                                            opts.metric = m;
                                        },
                                        queryOptions: { deep: true }
                                    });
                                });
                        }
                        // hydrate the ent field if defined
                        if (opts.entity) {
                            if(this._originalEntity) {
                                if(this._originalEntity === opts.entity) {
                                    this._checkHydrate();
                                }
                                else {
                                    this._entField.set('value',
                                        this._remEnt(this._originalEntity));
                                }
                            }
                            else {
                                this._entField.set('value',
                                    this._remEnt(opts.entity));
                                this._originalEntity = opts.entity;
                            }                        
                        }
                    } // end ent/grp/dim/met
                    // hydrate subtitle
                    if (this._subField) {
                        if (opts.subtitle) {
                            this._subField.set('value',
                            opts.subtitle);
                        }
                        else {
                            this._subField.set('value', '');
                        }
                    }
                    // hydrate axes
                    if (this._xField) {
                        if (opts.xAxisName) {
                            this._xField.set('value',
                            opts.xAxisName);
                        }
                        else {
                            this._xField.set('value', '');
                        }
                    }
                    if (this._yField) {
                        if (opts.yAxisName) {
                            this._yField.set('value',
                            opts.yAxisName);
                        }
                        else {
                            this._yField.set('value', '');
                        }
                    }
                    if (this._numberMaximum) {
                        if(opts.numberMaximum) {
                            this._numberMaximum.set('value',
                                opts.numberMaximum);
                        }
                        else {
                            this._numberMaximum.set('value', '10');
                        }
                    }
                    // hydrate goal
                    if (this._goalField) {
                        if (opts.goal) {
                            this._goalField.set('value',
                            opts.goal);
                        }
                        else {
                            this._goalField.set('value', '');
                        }
                    }
                    // do I have a radio Other?
                    if (this._rdoOthY) {
                        if (!opts.combineother) {
                            this._rdoOthN.set('checked', true);
                        } else {
                            if (opts.combineother === 'true') {
                                this._rdoOthY.set('checked', true);
                            } else {
                                this._rdoOthN.set('checked', true);
                            }
                        }
                    }
                    // do I have a radio Legend?
                    if (this._rdoLegY) {
                        if (!opts.showLegend) {
                            this._rdoLegN.set('checked', true);
                        } else {
                            if (opts.showLegend === 'true') {
                                this._rdoLegY.set('checked', true);
                            } else {
                                this._rdoLegN.set('checked', true);
                            }
                        }
                    }
                    // do I have a radio Labels?
                    if (this._rdoLabY) {
                        if (!opts.showLabels) {
                            this._rdoLabN.set('checked', true);
                        } else {
                            if (opts.showLabels === 'true') {
                                this._rdoLabY.set('checked', true);
                            } else {
                                this._rdoLabN.set('checked', true);
                            }
                        }
                    }
                    // do I have a radio truncate?
                    if (this._rdoTruY) {
                        if (!opts.truncLabels) {
                            this._rdoTruN.set('checked', true);
                        } else {
                            if (opts.truncLabels === 'true') {
                                this._rdoTruY.set('checked', true);
                            } else {
                                this._rdoTruN.set('checked', true);
                            }
                        }
                    }
                    // hydrate trunc number
                    if (this._truncField) {
                        if (opts.truncNum) {
                            this._truncField.set('value',
                            opts.truncNum);
                        }
                        else {
                            this._truncField.set('value', '');
                        }
                    }
                    // hydrate custom options
                    if(this.customOptions) {
                        for(var i = 0; i < this.customOptions.length; i++) {
                            // TO-DO: check control type, as setting of the Value could be different
                            //        if this isn't a TextBox-style control
                            var optionName = this.customOptions[i].option,
                                optionId = this.customOptions[i].id;
                            if(opts[optionName]) {
                                this[optionId].set('value', opts[optionName]);
                            }
                        }
                    }
                    
                    //Run any 'API' init methods.             
                    for (var i = 0; i < this._childWidgets.length; i++) {
                        if (this._childWidgets[i]._myEditRowInit) {
                            this._childWidgets[i]._myEditRowInit(opts);
                        }
                    }

                    //OK and Cancel buttons
                    if (!this._cancelClick) {
                        this._cancelClick = dojo.connect(this._btnCancel, 'onClick',
                            this, function () {
                                //Run any 'API' cancel methods.             
                                for (var i = 0; i < this._childWidgets.length; i++) {
                                    if (this._childWidgets[i]._myEditRowCancel) {
                                        this._childWidgets[i]._myEditRowCancel(opts);
                                    }
                                }
                                //Close dialog.
                                this.toggle();
                                // If you are cancelling the initial configuration of the widget we are going 
                                // to clean it up for you.  We don't want non-configured widgets hanging around.
                                if (this.portlet.isNew) {
                                    this.portlet.onClose();
                                    this.portlet.destroy();
                                }
                            });
                    }
                    if (!this._okClick) {
                        this._okClick = dojo.connect(this._btnOK, 'onClick',
                            this, function () {
                                var _uri = ['slxdata.ashx/slx/crm/-/analytics?'];
                                // assume a title field
                                if (this._ttlField) {
                                    if(!this._ttlField.isValid()) { return false; }
                                    var nTitle = this._ttlField.get('value');
                                    var resourceTitleString = opts.title.replace(/'/g, '_').replace(/ /g, '_');
                                    
                                    if (nTitle) {
                                        this.portlet.set('title', nTitle);
                                        
                                        if(nTitle != widgetDefinition[resourceTitleString]) {
                                            opts.title = nTitle;
                                        }
                                    }
                                }
                                if (this._subField) {
                                    var sub = this._subField.get('value');
                                    if (sub) {
                                        opts.subtitle = sub;
                                    }
                                    else {
                                        opts.subtitle = '';
                                    }
                                    if (!this._subField.isValid()) { return false; }
                                }
                                if (this._xField) {
                                    var xa = this._xField.get('value');
                                    if (xa) {
                                        opts.xAxisName = xa;
                                    }
                                    else {
                                        opts.xAxisName = '';
                                    }
                                    if (!this._xField.isValid()) { return false; }
                                }
                                if (this._yField) {
                                    var ya = this._yField.get('value');
                                    if (ya) {
                                        opts.yAxisName = ya;
                                    }
                                    else {
                                        opts.yAxisName = '';
                                    }
                                    if (!this._yField.isValid()) { return false; }
                                }
                                if(this._numberMaximum) {
                                    var maximum = this._numberMaximum.get('value');
                                    if(maximum) {
                                        opts.numberMaximum = maximum;
                                    }
                                    else {
                                        opts.numberMaximum = '5';
                                    }
                                    this._pushLim(opts.numberMaximum);
                                    if(!this._numberMaximum.isValid()) { return false; }
                                }
                                if (this._goalField) {
                                    var gl = this._goalField.get('value');
                                    if (gl) {
                                        opts.goal = gl;
                                    }
                                    else {
                                        opts.goal = '';
                                    }
                                    if (!this._goalField.isValid()) { return false; }
                                }
                                if (this._rdoLabY) {
                                    var labChkY = this._rdoLabY.get('value');
                                    if (labChkY) {
                                        opts.showLabels = 'true';
                                    } else {
                                        opts.showLabels = 'false';
                                    }
                                }
                                if (this._rdoTruY) {
                                    var truChkY = this._rdoTruY.get('value');
                                    if (truChkY) {
                                        opts.truncLabels = 'true';
                                    } else {
                                        opts.truncLabels = 'false';
                                    }
                                }
                                if (this._rdoOthY) {
                                    var othChkY = this._rdoOthY.get('value');
                                    if (othChkY) {
                                        opts.combineother = 'true';
                                        this._pushOth('true');
                                    } else {
                                        opts.combineother = 'false';
                                        this._pushOth('false');
                                    }
                                }
                                if (this._rdoLegY) {
                                    var legChkY = this._rdoLegY.get('value');
                                    if (legChkY) {
                                        opts.showLegend = 'true';
                                    } else {
                                        opts.showLegend = 'false';
                                    }
                                }
                                if (this._truncField) {
                                    var num = this._truncField.get('value');
                                    if (num) {
                                        opts.truncNum = num;
                                    }
                                    if (!this._truncField.isValid()) { return false; }
                                }

                                if (!this._validateOOTBRequired()) { return false; }

                                if (this._grpField) {
                                    if (!this._grpStr) {
                                        this._grpField.store.fetch({
                                            query: { displayName: this._grpField.get('value') },
                                            onComplete: function (i, r) {
                                                that._pushGrp(that._grpField.store.getValue(
                                                    i[0], 'groupName'));
                                            },
                                            queryOptions: { deep: true }
                                        });
                                    }
                                }
                                if (this._dimField) {
                                    if (!this._dimStr) {
                                        this._dimField.store.fetch({
                                            query: { displayName: this._dimField.get('value') },
                                            onComplete: function (i, r) {
                                                that._pushDim(that._dimField.store.getValue(
                                                    i[0], 'name'));
                                            },
                                            queryOptions: { deep: true }
                                        });
                                    }
                                }
                                if (this._metField) {
                                    if (!this._metStr) {
                                        this._metField.store.fetch({
                                            query: { displayName: this._metField.get('value') },
                                            onComplete: function (i, r) {
                                                that._pushMet(that._metField.store.getValue(
                                                    i[0], 'name'));
                                            },
                                            queryOptions: { deep: true }
                                        });
                                    }
                                }
                                
                                if(this.customOptions) {
                                    for(var i = 0; i < this.customOptions.length; i++) {
                                        var optionName = this.customOptions[i].option,
                                            optionId = this.customOptions[i].id;
                                        opts[optionName] = this[optionId].value;
                                    }
                                }

                                //Run any 'API' save methods.             
                                for (var i = 0; i < this._childWidgets.length; i++) {
                                    if (this._childWidgets[i]._myEditRowSave) {
                                        this._childWidgets[i]._myEditRowSave(opts);
                                    }
                                }

                                if (this._dimStr) { _uri.push(this._dimStr); } // Dimension 
                                if (this._metStr) { _uri.push(this._metStr); } // Metric
                                if (this._entStr) { _uri.push(this._entStr); } // Entity
                                if (this._grpStr) { _uri.push(this._grpStr); } // Group
                                if (this._limStr) { _uri.push(this._limStr); }
                                if (this._othStr) { _uri.push(this._othStr); }
                                opts.datasource = this._remAmp(_uri.join(''));
                                //console.log(this._remAmp(_uri.join('')));
                                dojo.publish('/ui/dashboard/pageSave', [this.portlet._page]);
                                // Editor values have been posted. 
                                // Now the portlet is no longer new.
                                if (this.portlet.isNew) {
                                    this.portlet.isNew = false;
                                }
                                this.portlet.refresh(true);
                                // close the editor
                                this.toggle();
                            });
                    }
                }
            }
            else {
                dashboardPage._raisePermissionInvalidMessage();
            }
        }
    });

    return widget;
});