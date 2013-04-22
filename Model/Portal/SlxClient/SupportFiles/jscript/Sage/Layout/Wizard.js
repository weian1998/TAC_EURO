/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
dojo.provide("Sage.Layout.Wizard");

dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dojo.i18n");
dojo.requireLocalization('Sage.Layout', 'Wizard');

    dojo.declare('Sage.Layout.Wizard', [dijit.layout.StackContainer, dijit._Templated], {
        // summary:
        //      A set of panels that display either sequentially, or as directed by conditions evaluated by the panel in view.
        //      By default it is a step-by-step process ending with some procedure intiated by the done button.
        widgetsInTemplate: true,
        templateString: [
            '<div class="sageWizard" dojoAttachPoint="wizardNode">',
                '<div class="sageWizardContainer" dojoAttachPoint="containerNode"></div>',
                '<div class="sageWizardButtons" dojoAttachPoint="wizardNav">',
                    '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachPoint="backButton">${backButtonLabel}</button>',
                    '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachPoint="nextButton">${nextButtonLabel}</button>',
                    '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachPoint="doneButton" style="display:none" dojoAttachEvent="onClick:_fireFinish">${doneButtonLabel}</button>',
                    '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachPoint="cancelButton" dojoAttachEvent="onClick:_fireCancel">${cancelButtonLabel}</button>',
                '</div>',
            '</div>'
        ].join(''),
	
	    // nextButtonLabel: String
	    //		Label override for the "Next" button.
	    nextButtonLabel: "",

	    // backButtonLabel: String
	    //		Label override for the "Previous" button.
	    backButtonLabel: "",

	    // cancelButtonLabel: String
	    //		Label override for the "Cancel" button.
	    cancelButtonLabel: "",

	    // doneButtonLabel: String
	    //		Label override for the "Done" button.
	    doneButtonLabel: "",


	    // hideDisabled: Boolean
	    //		If true, disabled buttons are hidden; otherwise, they are assigned the
	    //		"WizardButtonDisabled" CSS class
        hideDisabled: true,

        // useDefaultNavigation: Bool
        //      If true, the path through the wizard will be handled by the wizard and will
        //      follow the order of the panes contained inside.  Otherwise, the consumer of 
        //      the wizard will be in control of the steps of the wizard by handling the onNext, 
        //      onPrevious, onFinish, and onCancel events.  The OnNext and OnPrevious events only
        //      fire if this is set to false.
        useDefaultNavigation: true,
        _defaultConnections: { next: false, back: false },
        _customNavConnections: { next: false, back: false },
        // canContinue : bool
        //      Indicates whether the wizard can continue to the next pane.
        canContinue: true,
        // canGoBack: bool
        //      Indicates whether the wizard can return to the previous pane.
        canGoBack: false,
        // canFinish: bool
        //      Indicates whether the wizard is at a point where the finish method can run.
        canFinish: false,
        // canCancel: bool
        //      Indicates whether the wizard can be canceled by use of the cancel button.
        canCancel: false,
        // _stateBag: object
        //      The internal state bag that is available to wizard contents via the addState and getState methods
        // tags:
        //      private
        _stateBag: {},
        _started: false,
        _subscription: false,
	    postMixInProperties: function(){
		    this.inherited(arguments);
		    dojo.mixin(this, dojo.i18n.getLocalization("Sage.Layout", "Wizard"));
	    },
        startup: function() {
            if (this._started) {
                return;
            }
            this.inherited(arguments);
            this._connectNavigation();
            this._checkButtons();
            if (!this._subscription) {
                this._subscription = dojo.subscribe(this.id + "-selectChild", dojo.hitch(this,"_newPane"));
            }
            this._started = true;
        },
        _connectNavigation: function() {
            if (this.useDefaultNavigation) {
                //connect internal next/back listeners
                if (!this._defaultConnections['next']) {
                    this._defaultConnections["next"] = dojo.connect(this.nextButton, 'onClick', this, '_defaultNext');
                }
                if (!this._defaultConnections['back']) {
                    this._defaultConnections['back'] = dojo.connect(this.backButton, 'onClick', this, '_defaultBack');
                }
                //disconnect next/back event model
                if (this._customNavConnections['next']) {
                    dojo.disconnect(this._customNavConnections['next']);
                    this._customNavConnections['next'] = false;
                }
                if (this._customNavConnections['back']) {
                    dojo.disconnect(this._customNavConnections['back']);
                    this._customNavConnections['back'] = false;
                }           
            } else {
                //disconnect internal next/back handling
                if (this._defaultConnections['next']) {
                    dojo.disconnect(this._defaultConnections['next']);
                    this._defaultConnections['next'] = false;
                }
                if (this._defaultConnections['back']) {
                    dojo.disconnect(this._defaultConnections['back']);
                    this._defaultConnections['back'] = false;
                }
                //connect next/back event model
                if (!this._customNavConnections['next']) {
                    this._customNavConnections["next"] = dojo.connect(this.nextButton, 'onClick', this, '_fireCustomNext');
                }
                if (!this._customNavConnections['back']) {
                    this._customNavConnections['back'] = dojo.connect(this.backButton, 'onClick', this, '_fireCustomBack');
                }                
            }
        },
        _newPane: function() {
            //reset wizard progress ability from the new child
            var sw = this.selectedChildWidget;
            this.canContinue = sw.canContinue;
            this.canGoBack = sw.canGoBack;
            this._checkButtons();
        },
        _checkButtons: function() {
            var sw = this.selectedChildWidget;
		    //Next button
            var stopProgres = (sw.isLastChild || !sw.canContinue || !this.canContinue);
		    this.nextButton.set("disabled", stopProgres);
		    this._setButtonClass(this.nextButton);
            //Back Button
            var stopReverse = (sw.isFirstChild || !sw.canGoBack || !this.canGoBack);
            this.backButton.set('disabled', stopReverse);
            this._setButtonClass(this.backButton);
            //Done Button
            var canFinish = (sw.canFinish || this.canFinish);
            this.doneButton.set('disabled', !canFinish);
            this._setButtonClass(this.doneButton);
        },

	    _setButtonClass: function(button){
		    button.domNode.style.display = (this.hideDisabled && button.disabled) ? "none" : "";	
	    },
        _setUseDefaultNavigationAttr: function(useDefaultNav) {
            this.useDefaultNavigation = useDefaultNav;
            this._connectNavigation();
        },
        _setCanGoBackAttr: function(canGoBack) {
            this.canGoBack = canGoBack;
            this.backButton.set('disabled', !canGoBack);
            this._setButtonClass(this.backButton);
        },
        _setCanContinueAttr: function(canContinue) {
            this.canContinue = canContinue;
            this.nextButton.set('disabled', !canContinue);
            this._setButtonClass(this.nextButton);
        },
        _setCanFinishAttr: function(canFinish) {
            this.canFinish = canFinish;
            this.doneButton.set('disabled', !canFinish);
            this._setButtonClass(this.doneButton);
        },
        addState: function(name, value) {
            // summary:
            //      Provides an access point for wizard contents to be able to add state items to the wizard's state bag.
            // name: string
            //      The name of this value.  This name will be passed to the getState method to retrieve this value later.
            // value: string | object
            //      The value being added to the statebag.
            this._stateBag[name] = value;
        },
        getState: function(name) {
            // summary:
            //      Returns a property from the Wizard's state bag by the key provided.
            // name: string
            //      The name/key of the state item that was previously added to the statebag via the addState method.
            // returns: string | object | or false if the key is not found.
            if (this._stateBag.hasOwnProperty(name)) {
                return this._stateBag[name];
            }
            return false;
        },
//        //navigation
        _fireCustomNext: function() {
            var sw = this.selectedChildWidget;
            var next = false;
            var panes = this.getChildren();
            for (var i = 0; i < panes.length; i++) {
                if (sw.id === panes[i].id) {
                    if (panes[i + 1]) {
                        next = panes[i + 1];
                        break;
                    }
                }
            }
            this.onNext(sw, next);
        },
        _fireCustomBack: function() {
            var sw = this.selectedChildWidget;
            var prev = false;
            var panes = this.getChildren();
            for (var i = 0; i < panes.length; i++) {
                if (sw.id === panes[i].id) {
                    if (i === 0) {
                        break;
                    }
                    if (panes[i - 1]) {
                        prev = panes[i - 1];
                        break;
                    }
                }
            }            
            this.onBack(sw, prev);
        },
        _fireCancel: function() {
            this.onCancel();
        },
        _fireFinish: function() {
            this.onFinish();
        },
        _defaultNext: function() {
            //summary:  Default handling of the 'Next' behavior.  Navigates to the next pane in the wizard based on panel order.
            //  This is only called if useDefaultNavigation is set to true.
            this.forward();
            //}
        },
        _defaultBack: function() {
            //summary:  
            //      Default handling of the 'Back' behavior.  Navigates to the previous pane in the wizard based on panel order.
            //      This is only called if useDefaultNavigation is set to true.
            this.back();
        },
        onNext: function(currentPane, nextPane) {
            // summary: 
            //      This event is fired when the user clicks the 'Next' button if useDefaultNavigation is set to false.
            // currentPane: object
            //      The WizardPane object that is currently in view.
            // nextPane: object | false
            //      The WizardPane object that is in the next position, if available.
        },
        onBack: function(currentPane, previousPane) {
            // summary: 
            //      This event is fired when the user clicks the 'Back' button if useDefaultNavigation is set to false.
            // currentPane: object
            //      The WizardPane object that is currently in view.
            // previousPane: object | false
            //      The WizardPane object that is in the previous position, if available.
        },
        onCancel: function() {
            // summary: This event is fired when the user clicks the 'Cancel' button.
        },
        onFinish: function() {
            // summary: This event is fired when the user clicks the 'Done' button.
        }
    });

    dojo.declare("Sage.Layout.WizardPane", dijit.layout.ContentPane, {
	// summary: A panel of a `Sage.Layout.Wizard`
	//
	// description:
	//	An extended ContentPane with additional hooks for controlling navigation
    //    through the wizard.
	//
	// canGoBack: Boolean
	//		If true, then the wizard can move back to a previous panel (by clicking the 'Back' button)
    //      Sage.Layout.Wizard calls this function to decide whether to show or hide the 'Back' button.
	canGoBack: true,

    // canFinish: Boolean
    //      If true, then the wizard can finish (by clicking the 'Done' button)
    //      Sage.Layout.Wizard calls this function to decide whether to show or hide the 'Done' button.
    canFinish: false,

    // canContinue: Boolean
    //      If true, the wizard can continue (by clicking the 'Next' button)
    //      Sage.Layout.Wizard calls this function to decide whether to show or hide the 'Next' button.
    canContinue: true,

	_onShow: function(){
        // summary: callback when this panel comes into view in the Wizard.  This is called regardless
        //      if the panel is coming into view from the previous pane (via the 'Next') button,
        //      or if the user clicked the 'Back' button on the next pane.
        if(this.isFirstChild){ this.canGoBack = false; }
        if(this.isLastChild) { this.canContinue = false; }
		this.inherited(arguments);
	},

    _setCanGoBackAttr: function(canGoBack) {
        this.canGoBack = canGoBack;
    },
    _setcanContinueAttr: function(canContinue) {
        this.canContinue = canContinue;
    },
    _setcanFinishAttr: function(canFinish) {
        this.canFinish = canFinish;
    }
});
