/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([],
    function () {
        //summary: Validate Utility will recursively run the validation method
        //          on all qualifying widgets inside the node provided.
        Sage.namespace('Utility.Validate');
        dojo.mixin(Sage.Utility.Validate, {
            findNestedWidgets: function (initialNode) {
                return dojo.query("[widgetid]", initialNode)
                    .map(dijit.byNode)
                    //Filter out invalid widget ids that yield undefined.
                    .filter(function (wid) { return wid; });  
            },
            shouldSubmit: function () {
                // Called from the onSubmit of the <form>. Checks success of validation performed at Save Click.
                if (!this._isValid) {
                    //Set _isValid to true to prepare for the next validation attempt and to allow for navigation.
                    this._isValid = true;
                    return false;
                }
                return true;
            },
            _isValid: true,
            _getWorkspaceNode: function (workspace) {
                var node;
                switch (workspace) {
                    case 'Sage.Platform.WebPortal.Workspaces.DialogWorkspace':
                        node = 'DialogWorkspace_window';
                    break;
                    default:
                        //Sage.Platform.WebPortal.Workspaces.MainContentWorkspace 
                        //Sage.Platform.WebPortal.Workspaces.TabWorkspaces
                        node = 'mainform';
                }
                return node;
            },
            onWorkSpaceSave: function (workspace) {
                var node = this._getWorkspaceNode(workspace);
                this._isValid = this.runValidation(node);
            },
            runValidation: function (node) {
                //summary: Validates all dojo based controls inside the provided node.
                var widgets = this.findNestedWidgets(dojo.byId(node)),
                stateErrors = false;
                
                dojo.forEach(widgets, function (widget) {
                    if (widget.validate) {
                        // Need to set this so that "required" widgets get their state set.
                        widget._hasBeenBlurred = true;
                        //TODO: How do we handle readOnly fields that get populated by other actions? // widget.readOnly ||
                        var valid = widget.disabled || !widget.validate || widget.validate();
                        if (!valid && !stateErrors) {
                            // Set focus of the first non-valid widget
                            dojo.window.scrollIntoView(widget.containerNode || widget.domNode);
                            widget.focus();
                            stateErrors = true;
                        }
                    }
                }, this);
                if (stateErrors) {
                    return false;
                }
                return true;
            }
        });
    });