/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'Sage/_Templated',
        'dijit/layout/ContentPane',
        'dijit/form/Textarea',
        'Sage/UI/TextBox',
        'Sage/UI/Controls/DateTimePicker',
        'dijit/form/FilteringSelect',
        'Sage/UI/SDataLookup',
        'dojox/layout/TableContainer',
        'Sage/UI/Controls/SingleSelectPickList',
        'dijit/Dialog',
        'dojo/_base/declare',
        'dojo/i18n!./nls/QuickCompleteEditor'
],

function (
    _Widget,
    _Templated,
    ContentPane,
    Textarea,
    TextBox,
    DateTimePicker,
    FilteringSelect,
    SDataLookup,
    TableContainer,
    SingleSelectPickList,
    Dialog,
    declare,
    nlsResources
) {

    //dojo.requireLocalization("Sage.MainView.ActivityMgr", "QuickCompleteEditor");
    var quickCompleteEditor = declare('Sage.MainView.ActivityMgr.QuickCompleteEditor', [_Widget, _Templated], {

        _currentUserId: null,
        _individuallyHandler: false,
        _nowHandler: false,
        _asScheduledHandler: false,
        _selectionContext: false,
        //l18n strings.
        lblcmdMessageText: '',
        lblInfoMessageText: '',
        lblResultText: 'Result:',
        lblNoteText: 'Note (append to all items):',
        btnCompleteIndividuallyText: 'Individually',
        btnAsScheduledText: 'As Scheduled',
        btnCompleteNowText: 'Now',
        btnCancelText: 'Cancel',
        btnCloseText: 'Close',
        btnHelpText: 'Help',
        resultCompletedText: 'Complete',
        titleText:'Quick Complete',
        //end l18n strings.
        widgetsInTemplate: true,
        selectionContext: null,
        widgetTemplate: new Simplate([
            '<div>',
                 '<div data-dojo-type="dijit.Dialog" id="{%= $.id%}_qucikCompleteDialog" title="Quick Complete" dojoAttachPoint="_dialog" >',
                   '<div class="quickComplete-dialog">', //body
                     '<div data-dojo-type="dijit.layout.ContentPane" id="{%= $.id%}_cp_General" title="" dojoAttachPoint="cp_General">',
                          '<div data-dojo-type="dojox.layout.TableContainer" orientation="horiz" cols="1" class="controlPropForm" labelWidth="140">',
                               '<div id="{%= $.id%}_div_actionMessage"  name="div_actionMessage" dojoAttachPoint="div_actionMessage"></div>',
                               '<br>',
                               '<select label="{%= $. lblResultText %}" id="{%= $.id%}_pk_Result" data-dojo-type="Sage.UI.Controls.SingleSelectPickList" dojoAttachPoint="pk_Result" canEditText="true" itemMustExist="false" pickListName="To Do Result Codes" ></select>',
                                '<div data-dojo-type="dijit.form.SimpleTextarea"" label="{%= $.lblNoteText %}" id="{%= $.id%}_ta_Note" name="tb_Note" dojoAttachPoint="ta_Note"></div>',
                           '</div>',
                          '<br>',
                          '<div id="{%= $.id%}_div_cmdMessage"  name="div_cmdMessage" dojoAttachPoint="div_cmdMessage" style="font-weight:bold"></div>',
                          '<br>',
                          '<div class="button-bar alignright">',
                              '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_CompleteIndividually" name="btn_CompleteIndividually" dojoAttachPoint="btn_CompleteIndividually" dojoAttachEvent="onClick:_onCompleteIndividually" style="align:left" >{%= $.btnCompleteIndividuallyText %}</div>',
                              '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_btnAsScheduled" name="btn_AsScheduled" dojoAttachPoint="btn_AsScheduled" dojoAttachEvent="onClick:_onAsScheduled">{%= $.btnAsScheduledText %}</div>',
                              '<div data-dojo-type="dijit.form.Button" id="{%= $.id%}_btn_CompleteNow" name="btn_CompleteNow" dojoAttachPoint="btn_CompleteNow" dojoAttachEvent="onClick:_onCompleteNow">{%= $.btnCompleteNowText %}</div>',
                              '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_Cancel" name="btn_Cancel" dojoAttachPoint="btn_Cancel" dojoAttachEvent="onClick:_cancelClick">{%= $. btnCancelText %}</div>',
                          '</div>',
                      '</div>',
                      '<div data-dojo-type="dijit.layout.ContentPane" id="{%= $.id%}_cp_processing" title="" dojoAttachPoint="cp_processing">',
                           '<div id="{%= $.id%}_div_processingMessage"  name="div_processingMessage" dojoAttachPoint="div_processingMessage"></div>',
                          '<div class="button-bar alignright">',
                             '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_Close" name="btn_Close" dojoAttachPoint="btn_Close" dojoAttachEvent="onClick:_cancelClick">{%= $. btnCloseText %}</div>',
                          '</div>',
                      '</div>',
                  '</div>',
                '</div>',
           '</div>'
        ]),
        constructor: function (config) {
            dojo.mixin(this, nlsResources);
            this._currentUserId = Sage.Utility.getClientContextByKey('userID') || '';
        },
        destroy: function () {
            this._dialog.destroyRecursive();
            this.destroyRecursive();
        },
        show: function () {

            if (this.selectionContext) {
                this.div_actionMessage.innerHTML = String.format('Only activities that you have permission to complete will be completed.');
                this.div_cmdMessage.innerHTML = String.format('Complete all {0} selected activities:', this.selectionContext.count);
                this._dialog.set('title', this.titleText);
            }

            //this.pk_Result.set('value', this.resultCompletedText);
            dojo.style(this.cp_processing.domNode, "display", "none");
            this._dialog.show();
        },
        hide: function () {
            // this._dialog.hide();
            this.destroy();
        },
        resize: function () {

        },
        _showProcessing: function () {
            dojo.style(this.cp_General.domNode, "display", "none");
            dojo.style(this.cp_processing.domNode, "display", "block");
            this.div_processingMessage.innerHTML = String.format(' Processing all {0} selected activities please wait...', this._selectionContext.count);
        },

        // ... region click/action handlers
        _onCompleteIndividually: function () {
            this.onCompleteIndividually();
            this._dialog.hide();
        },
        _onCompleteNow: function () {
            this._showProcessing();
            var options = {
                //scope: this,
                selectionContext: this.selectionContext,
                note: this.ta_Note.value,
                resultCode: this.pk_Result.get('value')
            };
            this.onCompleteNow(options);
            //           if(this._nowHandler){
            //              this._nowHandler(options);           
            //           }
            this._dialog.hide();
        },
        _onAsScheduled: function () {
            this._showProcessing();
            var options = {
                //scope: this,
                selectionContext: this.selectionContext,
                note: this.ta_Note.value,
                resultCode: this.pk_Result.get('value')
            };
            this.onCompleteAsScheduled(options);
            //           if(this._asScheduledHandler){
            //              this._asScheduledHandler(options);           
            //           }
            this._dialog.hide();
        },
        _cancelClick: function () {
            this.onCancel();
            this._dialog.hide();
        },
        onCompleteIndividually: function () { },
        onCompleteNow: function (args) { },
        onCompleteAsScheduled: function (args) { },
        onCancel: function () { }

        // ... endregion      

    });
    return quickCompleteEditor;
});