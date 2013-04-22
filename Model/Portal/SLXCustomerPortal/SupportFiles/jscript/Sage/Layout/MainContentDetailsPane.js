/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/dom-style',
        'Sage/Layout/ContentPane'
],
function (declare, domStyle, ContentPane) {
    var mainPane = declare('Sage.Layout.MainContentDetailsPane', [ContentPane], {
        postCreate: function () {
            this.inherited(arguments);
            // Maintain a unique storage id for each MainView.  Splitter should be positioned by view.
            var clientEntityContextSvc = Sage.Services.getService('ClientEntityContext');
            if (clientEntityContextSvc) {
                var eContext = clientEntityContextSvc.getContext();
                this.storageId = [eContext.EntityType.replace(/\./g, "_"), "_", this.id].join('');
            }
            this.connect(this, 'startup', this.noContentResize);
        },
        mainPaneChildrenExist: true,
        tabPaneChildrenExist: true,
        noContentResize: function () {
            var dim = { h: this.domNode.scrollHeight, w: this.domNode.scrollWidth },
                self = this;
            var adjustSplitter = function () {
                // Minimize the empty pane and hide(do not destroy!) the splitter.
                self.resize(dim);
                domStyle.set(self._splitterWidget.domNode, 'display', 'none');
            };
            //The Tab Pane does not contain any SmartParts.
            if (!this.tabPaneChildrenExist) {
                var centerContent = dijit.byId('centerContent');
                dim = { h: centerContent.domNode.scrollHeight, w: this.domNode.scrollWidth };
                adjustSplitter();
            }
            //The Main Content Details Pane does not contain any SmartParts.  Minimize it and hide(don't destroy) the splitter.
            if (!this.mainPaneChildrenExist) {
                dim = { h: 1, w: this.domNode.scrollWidth };
                adjustSplitter();
            }
        },
        startup: function () {
            var viewport = dijit.byId("Viewport");
            //Check inside Main Content and Tabs to see if there are any SmartPart nodes.
            // Count all the child elements in the _inner div of the MainContent content div .
            // Then make sure that they are not QuickForm generated, i.e. '.formtable'
            var mainContent = dojo.query('[id$=_inner]',
                dojo.query('.mainContentContent')[0])[0];

            // mainContent doesn't always exist (for instance, User Options pages)
            if (mainContent) {
                this.mainPaneChildrenExist = (mainContent.children.length > 1 || dojo.query('#MainContent .formtable').length > 0 || mainContent.id === 'GeneralExceptioncontents_inner');
            }
            else {
                this.mainPaneChildrenExist = false;
            }
            
            this.tabPaneChildrenExist = (dijit.byId('tabContent').domNode.children.length > 0);
            // Set splitter to false to keep events from being connected in inherited startup.
            if (!this.tabPaneChildrenExist || !this.mainPaneChildrenExist) {
                this.set('splitter', false);
            }
            
            if(this.splitter) {
                var otherToggles = dojo.query('[class$=SecondaryToggle]');
                if(otherToggles) {
                    for(var i = 0; i < otherToggles.length; i++) {
                        dojo.style(otherToggles[i], 'display', 'none');
                    }
                }
            }
            
            if(viewport) {
                // this was originally only called if a splitter wasn't present,
                // but some pages (Lead Detail) cause the splitter to appear
                // way farther down the page than it should
                viewport.resize();
            }
            
            this.inherited(arguments);
        }
    });


    return mainPane;
});