/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_Widget',
    'dojo/_base/declare',
    'Sage/Utility/Activity'
],
function (_Widget, declare, activityUtility) {
    var dataBinding = declare('Sage.MainView.DataBinding', _Widget, {
        boundEntity: false,
        boundWidget: false,
        widgetEvent: 'onChange',
        widgetProperty: 'value',
        entityProperty: false,
        defaultValue: '',
        // if twoWay is true, when the user changes the value in the control, 
        // it will update the bound entity.  If it is false, it will not listen
        // for changes in the control.
        twoWay: true,
        _connection: false,
        bind: function () {
            if (this.boundWidget && this.boundEntity && this.entityProperty) {
                this.boundWidget.set(this.widgetProperty, this._formatValueFromEntity(Sage.Utility.getValue(this.boundEntity, this.entityProperty, this.defaultValue)));
                if (this.twoWay && !this._connection) {
                    this._connection = dojo.connect(this.boundWidget, this.widgetEvent, dojo.hitch(this, 'applyWidgetChange', this.boundWidget));
                }
            }
        },
        _formatValueFromEntity: function (val) {
            //override this function to handle special formatting such as dates or other data type conversions.
            return val;
        },
        applyWidgetChange: function (widget, newValue) {
            if (!newValue) {
                newValue = widget.get(this.widgetProperty);
            }
            var oldValue = Sage.Utility.getValue(this.boundEntity, this.entityProperty);
            var formatted = this._formatValueFromControl(newValue);
            if (oldValue != formatted) {
                //console.log('setting new value to entity' + this.entityProperty + ': %o  %o', this.boundEntity, newValue);
                Sage.Utility.setValue(this.boundEntity, this.entityProperty, formatted);
                this.onChange(this.boundEntity, this.entityProperty, oldValue, newValue);
            }
        },
        _formatValueFromControl: function (val) {
            //override this function to handle special formatting such as dates or other data type conversions.
            return val;
        },
        _setBoundEntityAttr: function (entity) {
            this.boundEntity = entity;
            this.bind();
        },
        destroy: function () {
            dojo.disconnect(this._connection);
            this.inherited(arguments);
        },
        onChange: function (entity, propertyName, oldValue, newValue) {

        }
    });
    var dateDataBinding = declare('Sage.MainView.DateDataBinding', dataBinding, {
        //Use this type of databinding when the value needs to be converted to and from SData standard string formats
        // to date types for the controls.
        _formatValueFromEntity: function (val) {
            var dateval = Sage.Utility.Convert.toDateFromString(val);
            if (dateval && activityUtility.isDateFiveSecondRuleTimeless(dateval)) {
                dateval = new Date(dateval.getUTCFullYear(), dateval.getUTCMonth(), dateval.getUTCDate(), 0, 0, 5);
            }
            return dateval;
        },
        _formatValueFromControl: function (val) {
            if (!val || !val.getUTCFullYear) {
                val = this.boundWidget.get(this.widgetProperty);
                if (!val || !val.getUTCFullYear) {
                    return '';
                }
            }
            return Sage.Utility.Convert.toIsoStringFromDate(val);
        }
    });

    var bindingManager = declare('Sage.MainView.BindingsManager', null, {
        constructor: function (opts) {
            //_entity: false,
            this._bindings = [];
            this._connections = [];
            this.boundEntity = false;
            this._defaultBindingOptions = {
                boundEntity: false,
                boundWidget: false,
                widgetEvent: 'onChange',
                widgetProperty: 'value',
                entityProperty: false,
                defaultValue: '',
                twoWay: true,
                dataType: 'string'
            };

            var o = opts || {};
            var def = dojo.mixin(this._defaultBindingOptions, o.defaultBinding || {});
            var bdgs = o.items || [];
            for (var i = 0; i < bdgs.length; i++) {
                this._addNew(dojo.mixin({}, def, bdgs[i]));
            }
        },
        add: function (binding) {
            if (binding instanceof Sage.MainView.DataBinding) {
                this._connections.push(dojo.connect(binding, 'onChange', this, 'onChange'));
                this._bindings.push(binding);
            }
        },
        _addNew: function (bindingConfig) {
            if (bindingConfig.dataType === 'date') {
                this.add(new dateDataBinding(bindingConfig));
            } else {
                this.add(new dataBinding(bindingConfig));
            }
        },
        addBindings: function (configs) {
            if (dojo.isArray(configs)) {
                for (var i = 0; i < configs.length; i++) {
                    this._addNew(dojo.mixin(this._defaultBindingOptions, configs[i]));
                }
            } else {
                this._addNew(dojo.mixin(this._defaultBindingOptions, configs));
            }
        },
        bind: function () {
            for (var i = 0; i < this._bindings.length; i++) {
                if (this._bindings[i] instanceof Sage.MainView.DataBinding) {
                    this._bindings[i].bind();
                }
            }
        },
        setBoundEntity: function (entity) {
            this._entity = entity;
            for (var i = 0; i < this._bindings.length; i++) {
                if (this._bindings[i] instanceof Sage.MainView.DataBinding) {
                    this._bindings[i].set('boundEntity', entity);  //it binds itself in its setter...
                }
            }
        },
        destroy: function () {
            // disconnect change listeners...
            var i, l = this._connections.length;
            for (i = 0; i < l; i++) {
                dojo.disconnect(this._connections.length);
            }
            this._connections = [];
            //destroy bindings...
            l = this._bindings.length;
            for (i = 0; i < l; i++) {
                var item = this._bindings.pop();
                item.destroy();
            }
            this._bindings = [];
            //this.inherited(arguments);
        },
        onChange: function (entity, propertyName, oldValue, newValue) {
        }
    });

    return bindingManager;
});