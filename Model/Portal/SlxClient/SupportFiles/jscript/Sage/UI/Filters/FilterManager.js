/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/string',
        'dojo/date',
        'dojo/date/locale',
        'Sage/Utility',
        'Sage/Utility/Filters'
],
function (
        lang,
        declare,
        array,
        dString,
        dojoDate,
        dateLocale,
        Utility,
        FiltersUtil) {
    var widget = declare('Sage.UI.Filters.FilterManager', null, {
        _connects: null,
        _subscribes: null,
        _owner: null,
        _timeout: null,
        _applied: null,
        _definitionSet: null,
        refreshBufferDelay: 500,
        filterGroup: 'default',
        owner: null,
        nullName: 'SLX_NULL',
        emptyName: 'SLX_EMPTY',

        constructor: function (options) {
            lang.mixin(this, options);

            this._applied = {};
            this._definitionSet = {};

            var filterStore = Utility.getValue(window, 'Sage.UI.DataStore.Filters'),
                applied = null,
                definitionSet = null;

            if (filterStore && filterStore[this.filterGroup]) {
                applied = filterStore[this.filterGroup].applied;
                definitionSet = filterStore[this.filterGroup].definitionSet;

                if (applied) {
                    this._applied = applied;
                }

                if (definitionSet) {
                    this._definitionSet = definitionSet;
                }
            }

            /*
            events:
            change: filter changed
            clear: clear filters
            refresh: refresh data bound to filters
            apply: apply new state
            */
            this._connects = [];
            this._subscribes = [];
            this._subscribes.push(
                dojo.subscribe(dString.substitute("/ui/filters/${0}/change", [this.filterGroup]), this, this._onChange),
                dojo.subscribe(dString.substitute("/ui/filters/${0}/clear", [this.filterGroup]), this, this._onClear),
                dojo.subscribe(dString.substitute("/ui/filters/${0}/apply", [this.filterGroup]), this, this._onApply));
        },
        destroy: function () {
            array.forEach(this._connects, function (handle) {
                handle.remove();
            });

            array.forEach(this._subscribes, function (handle) {
                handle.remove();
            });

            this.uninitialize();
        },
        uninitialize: function () {

        },
        // todo: total hack for attribute support
        'set': function (name, value) {
            this['_' + name] = value;
        },
        'get': function (name) {
            return this['_' + name];
        },
        _onClear: function (definition, source) {
            var key = definition && definition.$key;
            if (key && this._applied[key]) {
                delete this._applied[key];
            } else {
                this._applied = {};
            }
        },
        _onApply: function (applied, definitionSet, source) {
            this._applied = applied || {};
            this._definitionSet = definitionSet || {}; // todo: pre-load the definition set
        },
        _onChange: function (definition, name, value, source) {
            if (this._timeout) {
                clearTimeout(this._timeout);
            }

            var key = definition && definition.$key,
                container = null;

            if (key) {
                this._definitionSet[key] = definition;
                this._applied[key] = this._applied[key] || {};
                container = this._applied[key];
                if ((definition.details.userLookupFilter) || (definition.details.lookupFilter)) {
                    container['value'] = value
                }else if (value !== false) {
                    container[name] = value;
                } else {
                    delete container[name];
                }
            }

            this._timeout = setTimeout(lang.hitch(this, this._onTimeout), this.refreshBufferDelay);
        },
        _onTimeout: function () {
            dojo.publish(dString.substitute("/ui/filters/${0}/refresh", [this.filterGroup]), [this._applied, this._definitionSet, this]);
        },
        _escapeString: function (expression, quote) {
            quote = quote || '"';
            return expression.replace(quote, quote + quote);
        },
        _transformValue: function (type, value, quote) {
            if (value) {
                quote = quote || '"';
                if (type === 'string' || type === 'key' || type === 'enum' || type === 'boolean') {
                    return quote + this._escapeString(value, quote) + quote;
                }

                if (type === 'date') {
                    quote = '@';
                    return quote + this._transformDate(value) + quote;
                }
            }

            return value;
        },
        _transformDate: function (value) {
            var today = new Date(Date.now()),
                parsedDate;

            if (this.specialDates.hasOwnProperty(value)) {
                return Utility.Convert.toIsoStringFromDate(this.specialDates[value](today));
            } else {
                parsedDate = dateLocale.parse(value);
                if (parsedDate) {
                    return Utility.Convert.toIsoStringFromDate(parsedDate);
                } else {
                    return value;
                }
            }
        },
        /* static object */
        specialDates: {
            // today and todaystart are the same
            ':today': function (today) {
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':todaystart': function (today) {
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':todayend': function (today) {
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            // yesterday and yesterdaystart are the same
            ':yesterday': function (today) {
                today.setDate(today.getDate() - 1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':yesterdaystart': function (today) {
                today.setDate(today.getDate() - 1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':yesterdayend': function (today) {
                today.setDate(today.getDate() - 1);
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            // tomorrow and tomorrowstart are the same
            ':tomorrow': function (today) {
                today.setDate(today.getDate() + 1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':tomorrowstart': function (today) {
                today.setDate(today.getDate() + 1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':tomorrowend': function (today) {
                today.setDate(today.getDate() + 1);
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':thisweekstart': function (today) {
                today.setDate(today.getDate() - today.getDay());
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':thisweekend': function (today) {
                today.setDate(today.getDate() + (6 - today.getDay()));
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':thismonthstart': function (today) {
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':thismonthend': function (today) {
                today.setDate(dojoDate.getDaysInMonth(today));
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':thisyearstart': function (today) {
                today.setDate(1);
                today.setMonth(0);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':thisyearend': function (today) {
                today.setDate(31);
                today.setMonth(11);
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':thisquarterstart': function (today) {
                // 1 | jan (0), feb (1), march (2)
                // 2 | april (3), may (4), june (5)
                // 3 | july (6), august (7), sept (8)
                // 4 | oct (9), nov (10), dec (11)
                var month = today.getMonth(),
                    mod = month % 3;
                today.setMonth(month - mod);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':thisquarterend': function (today) {
                var month = today.getMonth(),
                    mod = 2 - (month % 3);
                today.setMonth(month + mod);
                today.setDate(dojoDate.getDaysInMonth(today));
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':nextweekstart': function (today) {
                today.setDate(today.getDate() + (7 - today.getDay()));
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':nextweekend': function (today) {
                today.setDate(today.getDate() + (7 - today.getDay()) + 6);
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':nextmonthstart': function (today) {
                today.setMonth(today.getMonth() + 1);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':nextmonthend': function (today) {
                today.setMonth(today.getMonth() + 1);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':nextyearstart': function (today) {
                today.setFullYear(today.getFullYear() + 1);
                today.setMonth(0);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':nextyearend': function (today) {
                today.setFullYear(today.getFullYear() + 1);
                today.setMonth(11);
                today.setDate(31);
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':nextquarterstart': function (today) {
                var month = today.getMonth(),
                    mod = 2 - (month % 3);
                today.setMonth(month + mod + 1);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':nextquarterend': function (today) {
                var month = today.getMonth(),
                    mod = 2 - (month % 3);
                today.setMonth(month + mod + 3);
                today.setDate(dojoDate.getDaysInMonth(today));
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':lastweekstart': function (today) {
                today.setDate(today.getDate() - today.getDay() - 7);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':lastweekend': function (today) {
                today.setDate(today.getDate() - today.getDay() - 1);
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':lastmonthstart': function (today) {
                today.setMonth(today.getMonth() - 1);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':lastmonthend': function (today) {
                today.setMonth(today.getMonth() - 1);
                today.setDate(dojoDate.getDaysInMonth(today));
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':lastyearstart': function (today) {
                today.setFullYear(today.getFullYear() - 1);
                today.setMonth(0);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':lastyearend': function (today) {
                today.setFullYear(today.getFullYear() - 1);
                today.setMonth(11);
                today.setDate(31);
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            },
            ':lastquarterstart': function (today) {
                var month = today.getMonth(),
                    mod = month % 3;
                today.setMonth(month - mod - 3);
                today.setDate(1);
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                return today;
            },
            ':lastquarterend': function (today) {
                var month = today.getMonth(),
                    mod = month % 3;
                today.setMonth(month - mod - 1);
                today.setDate(dojoDate.getDaysInMonth(today));
                today.setHours(23);
                today.setMinutes(59);
                today.setSeconds(59);
                return today;
            }
        },
        resolveProperty: function (propertyName, dataPath /* optional */) {
            if (this._owner && this._owner.resolveProperty) {
                return this._owner.resolveProperty(propertyName, dataPath);
            }

            return propertyName;
        },
        resolveTimelessProperty: function (propertyName) {
            if (this._owner) {
                if (this._owner._configuration) {
                    if (this._owner._configuration.getTimelessProperty) {
                        return this._owner._configuration.getTimelessProperty(propertyName);
                    }
                }
            }
            return false;
        },
        resolveDataType: function (dataTypeId) {
            return FiltersUtil.resolveDataType(dataTypeId);
        },
        createRangeFragment: function (definition, propertyName, applied, dataPath) {
            var propertyType = this.resolveDataType(definition.propertyDataTypeId),
                resolvedName = this.resolveProperty(propertyName, dataPath),
                details = definition.details.rangeFilter,
                timelessProperty = false,
                values = [],
                segments = [],
                multiSegmentOperator = 'and',
                sub = dString.substitute,
                name = null,
                range = null,
                options = null,
                transform = function (p) { return p; },
                strippedValues = [],
                characters = details.characters > 0 ? details.characters : 1;

            if (propertyType === 'string') {
                transform = function (p) {
                    return sub("substring(${0}, 1, ${1})", [p, characters]);
                };
            }

            for (name in applied) {
                if (applied.hasOwnProperty(name)) {
                    range = applied[name];
                    if (typeof range === 'undefined' || range === null) {
                        continue;
                    }
                    if (propertyType === 'date') {
                        timelessProperty = this.resolveTimelessProperty(resolvedName);
                    }
                    if (timelessProperty) {
                        var lowerTimelessDate = new Date(Date.now());
                        var upperTimelessDate = new Date(Date.now());
                        var quote = '@';
                        var s_lowerTimelessDate = '';
                        var s_upperTimelessDate = '';

                        if (range.lower === range.upper) {
                            values.push(this._transformValue(propertyType, range.lower));
                        } else {

                            if (this.specialDates.hasOwnProperty(range.lower)) {
                                lowerTimelessDate = this.specialDates[range.lower](lowerTimelessDate);
                                lowerTimelessDate.setHours(0);
                                lowerTimelessDate.setMinutes(0);
                                lowerTimelessDate.setSeconds(0);
                                s_lowerTimelessDate = quote + Utility.Convert.toIsoStringFromDateNonUTC(lowerTimelessDate) + quote;

                            }
                            if (this.specialDates.hasOwnProperty(range.upper)) {
                                upperTimelessDate = this.specialDates[range.upper](upperTimelessDate);
                                upperTimelessDate.setHours(23);
                                upperTimelessDate.setMinutes(59);
                                upperTimelessDate.setSeconds(59);
                                s_upperTimelessDate = quote + Utility.Convert.toIsoStringFromDateNonUTC(upperTimelessDate) + quote;
                            }
                            options = [
                                timelessProperty,
                                transform(resolvedName),
                                this._transformValue(propertyType, range.lower),
                                this._transformValue(propertyType, range.upper),
                                s_lowerTimelessDate,
                                s_upperTimelessDate
                            ];

                            if (range.lower === null) {
                                segments.push(sub('((${0} eq false and ${1} le ${3}) or (${0} eq true and ${1} le ${4}))', options));                                
                            } else if (range.upper === null) {
                                segments.push(sub('((${0} eq false and ${1} ge ${2}) or (${0} eq true and ${1} le ${5}))', options));                                
                            } else {
                                segments.push(sub('((${0} eq false and ${1} between ${2} and ${3}) or (${0} eq true and ${1} between ${4} and ${5}))', options));                               
                            }
                            multiSegmentOperator = 'or';
                        }
                    } else {
                        if (range.lower === range.upper) {
                            if (range.lower !== null && typeof range.lower !== 'undefined') {
                                values.push(this._transformValue(propertyType, range.lower));
                            }
                        } else {
                            options = [
                            transform(resolvedName),
                            this._transformValue(propertyType, range.lower),
                            this._transformValue(propertyType, range.upper)
                        ];

                            if (range.lower === null) {
                                segments.push(sub('${0} le ${2}', options));
                            } else if (range.upper === null) {
                                segments.push(sub('${0} ge ${1}', options));
                            } else {
                                segments.push(sub('${0} between ${1} and ${2}', options));
                            }

                            multiSegmentOperator = 'or';
                        }
                    }
                }
            }

            if (values.length > 0) {
                if (propertyType === 'string') {
                    array.forEach(values, function (value) {
                        if (value && value.length > 2) {
                            // Substring will include the starting quote (characters + 1)
                            strippedValues.push(value.substring(0, characters + 1) + '"');
                        }
                    });

                    values = strippedValues;
                }

                segments.push(sub('${0} in (${1})', [transform(resolvedName), values.join(',')]));
            }

            return segments.length > 0 ? '(' + segments.join(') ' + multiSegmentOperator + ' (') + ')' : false;
        },
        createDistinctFragment: function (definition, propertyName, applied, dataPath) {
            var propertyType = this.resolveDataType(definition.propertyDataTypeId),
                sub = dString.substitute,
                name = null,
                values = [],
                additional = null,
                results = false,
                resolvedProperty = this.resolveProperty(propertyName, dataPath);

            for (name in applied) {
                if (applied.hasOwnProperty(name)) {
                    if (name === this.nullName) {
                        additional = sub('${0} eq null', [resolvedProperty]);
                    } else if (name === this.emptyName) {
                        values.push("''");
                    } else {
                        values.push(this._transformValue(propertyType, applied[name]));
                    }
                }
            }

            if(values.length > 0) {
                results = sub('${0} in (${1})', [resolvedProperty, values.join(',')]);
            }

            if (additional && values.length > 0) {
                results = sub('(${0} or ${1})', [results, additional]);
            } else if (additional) {
                results =  additional;
            }

            return results;
        },
        createLookupFragment: function (definition, propertyName, applied, dataPath) {
            var propertyType = this.resolveDataType(definition.propertyDataTypeId),
                operator,
                value = '',
                prop = this.resolveProperty(propertyName, dataPath),
                results = '',
                values = [],
                name;
                          
            if (applied.hasOwnProperty('value')) {
                operator = applied['value'].operator
                value = applied['value'].value;
            }

            if ((value === '') || (value === null)) {
                return false;
            }
            
            if (typeof value === 'string') {
                prop = 'upper(' + prop + ')';
                value = value.toUpperCase();
            }

            results = dString.substitute('${0} ${1}', [prop, this._transformLookupOperator(operator, value, propertyType)]);
            return results;
        },
        _transformLookupOperator: function (operator, value, propertyType) {
            var results = '',
                lhs,
                rhs = '${0}';

            switch (operator) {
                case 'Equal':
                    lhs = 'eq';
                    break;
                case 'NotEqual':
                    lhs = 'ne';
                    break;
                case 'LessThan':
                    lhs = 'lt';
                    break;
                case 'LessThanEqual':
                    lhs = 'le';
                    break;
                case 'GreaterThan':
                    lhs = 'gt';
                    break;
                case 'GreaterThanEqual':
                    lhs = 'ge';
                    break;
                case 'StartsWith':
                    lhs = 'like';
                    rhs = '${0}%';
                    break;
                case 'EndsWith':
                    lhs = 'like';
                    rhs = '%${0}';
                    break;
                case 'Contains':
                    lhs = 'like';
                    rhs = '%${0}%';
                    break;
                default:
                    lhs = 'eq';
                    break;
            }

            // wrap string in quotes
            if (propertyType === 'string' || propertyType === 'key') {
                rhs = '"' + rhs + '"';
            }

            // transform the right hand side
            rhs = dString.substitute(rhs, [value]);

            // combine operator (lhs) with rhs and return
            return dString.substitute('${0} ${1}', [lhs, rhs]);
        },
        createQuery: function () {
            var segments = [],
                key,
                applied,
                definition,
                propertyName,
                details,
                segment,
                dataPath;
            for (key in this._applied) {
                if (this._applied.hasOwnProperty(key)) {
                    applied = this._applied[key];
                    definition = this._definitionSet[key];
                    propertyName = definition.propertyName;
                    details = definition.details;
                    dataPath = definition.dataPath;

                    if (details.rangeFilter) {
                        segment = this.createRangeFragment(definition, propertyName, applied, dataPath);
                    } else if (details.distinctFilter) {
                        segment = this.createDistinctFragment(definition, propertyName, applied, dataPath);
                    } else if ((details.userLookupFilter) || (details.lookupFilter)) {
                        segment = this.createLookupFragment(definition, propertyName, applied, dataPath);
                    }

                    if (segment) {
                        segments.push(segment);
                    }
                }
            }

            return segments.length > 0 ? '(' + segments.join(') and (') + ')' : false;
        },
        createValueSet: function () {
           var result = [],
                applied,
                definition,
                details,
                filterType,
                filter,
                name,
                key;

            for (key in this._applied) {
                if (this._applied.hasOwnProperty(key)) {
                    applied = this._applied[key];
                    definition = this._definitionSet[key];
                    details = definition.details;
                    filterType = (details.rangeFilter && 'rangeFilter') || (details.distinctFilter && 'distinctFilter') || (details.userLookupFilter && 'lookupFilter');

                    filter = {
                        'filterId': definition.$key,
                        'filterName': definition.filterName,
                        'appliedValues': [],
                        'operator': null
                    };

                    switch (filterType) {
                        case 'rangeFilter':
                            for (name in applied) {
                                if (applied.hasOwnProperty(name)) {
                                    filter.appliedValues.push(applied[name] && applied[name].rangeId);
                                }
                            }

                            break;
                        case 'distinctFilter':
                            for (name in applied) {
                                if (applied.hasOwnProperty(name)) {
                                    filter.appliedValues.push(name);
                                }
                            }

                            break;
                        case 'lookupFilter':
                            for (name in applied) {
                                if (applied.hasOwnProperty(name)) {
                                    if (applied[name].hasOwnProperty('operator')) {
                                        filter.appliedValues.push(applied[name]);
                                        filter.operator = applied[name].operator;
                                    }
                                }
                            }

                            break;
                        default:
                            break;
                    }

                    result.push(filter);
                }
            }

            return result;
        }       
    });

    return widget;
});
