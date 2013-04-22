/*globals Sage, define */
define([
        'dijit/tree/ForestStoreModel',
        'Sage/Data/SDataServiceRegistry',
        'dojo/string',
        'dojo/_base/array',
        'dojo/_base/declare',
        'dojo/_base/lang'
],
function (
    ForestStoreModel,
    SDataServiceRegistry,
    dString,
    array,
    declare,
    lang
    ) {
    return declare("Sage.Data.QBTreeStoreModel", ForestStoreModel, {
        insertedChildren: null,
        constructor: function() {
            this.insertedChildren = [];
        },
        convertDescriptionToFilter: function(parentNode) {
            // Just ensure the descriptor exists, otherwise this is the root node
            if(parentNode.$descriptor) {
                var dataPath = parentNode.$descriptor;
                dataPath = dataPath.replace(this.rootId + ':', '');
                return dataPath;
            }
            return parentNode.id;
        },
        getChildren: function (parentItem, complete_cb, error_cb) {
            this.store.fetch({
                queryArgs: { "_pathFilter": this.convertDescriptionToFilter(parentItem) },
                resourcePredicate: parentItem.root ? undefined : '',
                onComplete: lang.hitch(this, function (data, obj) {
                    var service = SDataServiceRegistry.getSDataService('metadata', false, true, false),
                        request,
                        table,
                        i,
                        temp,
                        fields = [],
                        transforms,
                        makeFn;

                    table = parentItem.id || parentItem.toTable;

                    array.forEach(this.insertedChildren, lang.hitch(this, function (child) {
                        if (child.parentItem === parentItem) {
                            data.push(child);
                        }
                    }));

                    // Array of transform functions to run on the data
                    transforms = [
                        // Invert if needed
                        function (item) {
                            if (item.toTable === table) {
                                item.toTable = item.fromTable;
                                temp = item.toField;
                                item.toField = item.fromField;
                                item.fromTable = table;
                                item.fromField = temp;
                            }
                        },
                        // Add a label property
                        function(item) {
                            var joinTypeChar = item.joinType,
                                joinTypeMap = {
                                    /* <join char> : <label> */
                                    'Left': '[left]',
                                    '>': '[left]',
                                    'Inner': '[inner]',
                                    '=': '[inner]',
                                    'Right': '[right]',
                                    '<': '[right]'
                                },
                                joinType = joinTypeMap[joinTypeChar];

                            if (item.toTable) {
                                item.label = dString.substitute("${2} (${1} -> ${3})${4}", [item.fromTable, item.fromField, item.toTableDisplayName, item.toField, joinType]);
                            }
                        },
                        // Add parent item
                        function (item) {
                            item.parentItem = parentItem;
                        },
                        // Add child property
                        function (item) {
                            item.children = [];
                        },
                        // Add dataPathSegment property
                        function (item) {
                            var joinTypeChar = item.joinType,
                                joinTypeMap = {
                                    'Left': '>',
                                    'Inner': '=',
                                    'Right': '<',
                                },
                                joinType = joinTypeMap[joinTypeChar] || item.joinType;
                            item.dataPathSegment = dString.substitute("${0}${1}${2}.${3}", [item.fromField, joinType, item.toField, item.toTable]);
                        },
                        // Add displayPathSegment (ToTable)
                        function (item) {
                            item.displayPathSegment = dString.substitute("${0}", [item.toTable]);
                        },
                        // Add full dataPath
                        function (item) {
                            var results;

                            function GetDataPath(path, _item) {
                                if (_item.root) {
                                    if (path && path.length > 0) {
                                        if (path.startsWith("!")) {
                                            path = path.substring(1, path.length);
                                        }
                                    }
                                    return _item.id + ":" + path;
                                }

                                return GetDataPath(dString.substitute("!${0}", [_item.dataPathSegment]) + path, _item.parentItem);
                            }

                            results = GetDataPath("!", item);
                            item.dataPath = results;
                            item['$descriptor'] = item['$descriptor'] || results;
                        },
                        // Add full display path
                        function (item) {
                            var results;
                            function GetDisplayPath(path, _item) {
                                if (_item.root) {
                                    return _item.id + path;
                                }
                                
                                return GetDisplayPath(dString.substitute(".${0}${1}", [_item.displayPathSegment, path]), _item.parentItem);
                            }

                            results = GetDisplayPath("", item);
                            item.displayPath = results;
                        }
                    ];

                    // Clojure for our transform loop
                    makeFn = function (item) {
                        return function(func) {
                            func(item);
                        };
                    };
                    
                    for (i = 0; i < data.length; i++) {
                        array.forEach(transforms, lang.hitch(this, makeFn(data[i])));
                    }
                    // Filter out data that includes a relationship that's already in the existing
                    // branch (ACCOUNT -> CONTACT -> ACCOUNT, ACCOUNT -> ADDRESS -> ACCOUNT, etc.)
                    data = array.filter(data, lang.hitch(this, function(item) {
                        var parentItem = item.parentItem;
                        while(!parentItem.root) {
                            if(item.fromField === parentItem.fromField) {
                                return false;
                            }
                            parentItem = parentItem.parentItem;
                        }
                        // check against the root item's id field instead
                        if(item.fromField === parentItem.id) {
                            return false;
                        }
                        return true;
                    }));

                    data.sort(function(a, b) {
                        if(a.toTable < b.toTable) {
                            return -1;
                        }

                        if(a.toTable > b.toTable) {
                            return 1;
                        }

                        return 0;
                    });
                   
                    parentItem.children = data;
                    complete_cb(data, obj);
                }),
                onError: error_cb
            });
        },
        getIdentity: function (item) {
            return item.$descriptor;
        },
        mayHaveChildren: function (item) {
            return item.root || true;
        },
        newItem: function (args, parentNode) {
            var child = {
                "$descriptor": args.fromtable,
                "$etag": "",
                "$httpStatus": 200,
                "fromTable": args.fromtable,
                "fromField": args.fromfield,
                "toTable": args.totable,
                "toTableDisplayName": args.fromtable,
                "toField": args.tofield,
                "cascadeType": args.cascadetype,
                "joinType": args.jointype,
                "parentItem": parentNode.item,
                "children": []
            };
            this.insertedChildren.push(child);
            this.addItemToStore(child, parentNode.item);
        },
        addItemToStore: function (childItem, newParentItem) {
            var store = this.store,
                parentAttr = this.childrenAttrs[0],// name of "children" attr in parent item
                children = store.getValue(newParentItem, parentAttr),
                updated;

            // modify target item's children attribute to include this item
            if(newParentItem){
                if (children) {
                    updated = children.slice(0);
                    updated.push(childItem);
                    store.setValue(newParentItem, parentAttr, updated);
                }
            }
        }
    });
});