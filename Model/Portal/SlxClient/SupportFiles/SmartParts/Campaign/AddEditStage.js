Sage.namespace("Sage.UI.Forms");
require([
        'Sage/UI/Dialogs',
        'dojo/string'
    ],
    function (dialogs, dojoString) {
        if (typeof AddEditStage_Strings === 'undefined') {
            AddEditStage_Strings = {};
        }
        Sage.UI.Forms.AddEditStage = {
            CS_OnCodeChange: function (sender) {
                dialogs.raiseQueryDialog(
                    'SalesLogix',
                    dojoString.substitute(AddEditStage_Strings.CodeChangeMSG, ['<br/>']),
                    function (result) {
                        if (!result) {
                            sender.value = sender.defaultValue;
                        }
                    },
                    AddEditStage_Strings.cmdSave_Caption,
                    AddEditStage_Strings.cmdCancel_Caption
                );
            }
        };
    });
if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();