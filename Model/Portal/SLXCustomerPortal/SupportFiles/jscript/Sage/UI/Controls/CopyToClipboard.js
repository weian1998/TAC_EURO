/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_TemplatedMixin',
       'dijit/_WidgetsInTemplateMixin',
       'dijit/_Widget',
       'dijit/Dialog',
       'dijit/layout/TabContainer',
       'dijit/layout/ContentPane',
       'dijit/form/SimpleTextarea',
       'dijit/form/Button',
       'dojo/_base/lang',
       'Sage/Format',
       'Sage/Utility',
       'Sage/Utility/Email',
       'Sage/Data/SDataServiceRegistry',
       'dojo/_base/sniff',
       'dojo/text!./templates/CopyToClipboard.html',
       'dojo/i18n!./nls/CopyToClipboard',
       'dojo/_base/declare'
],
function (
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _Widget,
        dialog,
        tabContainer,
        contentPane,
        simpleTextArea,
        button,
        lang,
        format,
        util,
        email,
        sDataServiceRegistry,
        has,
        template,
        nlsStrings,
        declare) {
    var widget = declare('Sage.UI.Controls.CopyToClipboard', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // Display properties
        templateString: template,
        widgetsInTemplate: true,

        textAlign: 'left',
        calendarName: 'calendar1',
        timeTextBoxName: 'timeTextBox1',

        textNode: null,
        contentNode: null,

        // localized strings
        closeText: '',
        dialogTitle: '',
        helpText: '',
        // end localize

        // mashup props
        mashupName: '',
        queryName: '',
        service: null,
        template: '',
        entity: null,
        widgetTemplate: null,
        // end mashup props
        
        id: 'copyToClipboard',
        
        constructor: function (options) {
            this.service = sDataServiceRegistry.getSDataService('mashups');
            this.inherited(arguments);
        },
        postMixInProperties: function () {
            lang.mixin(this, nlsStrings);
            this.inherited(arguments);
        },

        show: function () {
            // Don't show the dialog for IE9, that has access to clipBoardData
            if (!window.clipboardData) {
                this.dialogNode.set('title', this.dialogTitle);
                this.dialogNode.show();
            }

            this._readMashupFeed();
        },
        // Callback is optional for email functionality
        _readMashupFeed: function (callback) {
            var request = new Sage.SData.Client.SDataNamedQueryRequest(this.service),
                mashupName = this.mashupName || 'SummaryViewQueries',
                clientService = Sage.Services.getService("ClientEntityContext"),
                clientContext = clientService.getContext(),
                entityId = clientContext.EntityId,
                self = this;

            request.setApplicationName('$app');
            request.setResourceKind('mashups');
            request.uri.setCollectionPredicate("'" + this.mashupName + "'");
            request.setQueryName('execute');
            request.setQueryArg('_resultName', this.queryName);
            request.setQueryArg('_ids', "'" + entityId + "'");

            request.read({
                success: dojo.hitch(self, function (data) {
                    this._mixinTemplateLocale();
                    this.entity = data.$resources[0];
                    this._buildTemplateWidget();
                    this._setContentToCopy();

                    if (callback && (typeof callback === 'function')) {
                        callback.call(this, data);
                    }
                }),
                failure: dojo.hitch(self, function (data) {
                    this.dialogNode.hide();
                })
            });
        },
        _mixinTemplateLocale: function () {
            var moduleNameParts = ['Sage'],
                templateParts = this.template.split('/'),
                i;

            for (i = 0; i < templateParts.length - 1; i++) {
                moduleNameParts.push(templateParts[i]);
            }
            var path = 'dojo/i18n!' + moduleNameParts.join('/') + '/nls/' + templateParts[templateParts.length - 1].replace('.html', '');
            require([path],
                lang.hitch(this, function (nls) {
                    lang.mixin(this, nls);
                })
            );
        },
        _buildTemplateWidget: function () {
            var contentString = dojo['cache']('Sage', this.template),
                temp = eval(contentString);
            this.widgetTemplate = new Simplate(temp);
        },
        _setContentToCopy: function () {
            var val = this.widgetTemplate.apply(this),
                clipString;
            this.contentNode.innerHTML = val;
            this.textNode.set('value', val);

            if (window.clipboardData) {
                // IE allows us to set the clipboard data.
                try {
                    clipString = this.contentNode.innerText;

                    window.clipboardData.setData("text", clipString);
                    this.dialogNode.hide();
                } catch (e) {
                    // Ignore error and just allow user to copy manually like other browsers
                }
            }
        },
        _closeClicked: function (options) {
            this.onCloseClicked();
        },
        onCloseClicked: function () {
        },
        destroy: function () {
            var dialog = dijit.byId(this.dialogNode.id);
            if (dialog) {
                setTimeout(function () { dialog.destroyRecursive(false); }, 1);
                this.inherited(arguments);
            }
        },
        // ripped from old control
        OnEmailContentReady: function (baseControlId) {
            this._readMashupFeed(function () {
                var emailToElem = dojo.byId(baseControlId + '_to'),
                    emailTo = (emailToElem) ? emailToElem.value : '',

                    emailCCElem = dojo.byId(baseControlId + '_cc'),
                    emailCC = (emailCCElem) ? emailCCElem.value : '',

                    emailBCCElem = dojo.byId(baseControlId + '_bcc'),
                    emailBCC = (emailBCCElem) ? emailBCCElem.value : '',

                    emailSubjectElem = dojo.byId(baseControlId + '_subject'),
                    emailSubject = (emailSubjectElem) ? emailSubjectElem.value : '',

                    emailBody = util.getPlainText(this.contentNode),
                    recip = {};
                if (emailTo !== '') {
                    recip.to = emailTo;
                }

                if (emailCC !== '') {
                    recip.cc = emailCC;
                }

                if (emailBCC !== '') {
                    recip.bcc = emailBCC;
                }

                email.writeEmail(recip, emailSubject, emailBody, false);
            });

        }
    });

    return widget;
});
