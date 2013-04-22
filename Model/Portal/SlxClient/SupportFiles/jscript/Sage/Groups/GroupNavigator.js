/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/_Templated',
    'dijit/_Widget',
    'Sage/UI/ToolBarLabel',
    'Sage/UI/ImageButton',
    'Sage/Groups/GroupContextService',
    'Sage/Services/ClientEntityContext',
    'dojo/i18n!./nls/GroupNavigator',
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/topic'
],
function (_Templated, _Widget, ToolBarlabel, ImageButton, GroupContextService, ClientEntityContext, nls, lang, declare, topic) {
    var groupNavigator = declare('Sage.Groups.GroupNavigator', [_Widget, _Templated], {
        widgetsInTemplate: true,
        //i18n strings...
        firstText: 'Move First',
        previousText: 'Move Previous',
        nextText: 'Move Next',
        lastText: 'Move Last',
        listText: 'List View',
        labelFmtText: '${0} of ${1}',
        noRecordsText: 'No Records',
        id: 'groupNavigator',
        //end i18n strings
        _entityContextService: false,
        _groupContextService: false,
        _entityChangedHandle: false,
        _groupChangedHandle: false,
        widgetTemplate: new Simplate([
            '<span class="list-panel-tbar">',
                '<div id="{%= $.id %}-Start" data-dojo-type="Sage.UI.ImageButton" imageClass="icon_Start_16x16" tooltip="{%= $.firstText %}" alt="{%= $.firstText %}" dojoAttachPoint="_firstButton" dojoAttachEvent="onClick:_moveFirst"></div>',
                '<div id="{%= $.id %}-Previous"  data-dojo-type="Sage.UI.ImageButton" imageClass="icon_Browse_Previous_16x16" tooltip="{%= $.previousText %}" alt="{%= $.previousText %}" dojoAttachPoint="_previousButton" dojoAttachEvent="onClick:_movePrevious"></div>',
                '<div id="{%= $.id %}-Label"  data-dojo-type="Sage.UI.ToolBarLabel" label="" dojoAttachPoint="_groupNavLabel"></div>',
                '<div id="{%= $.id %}-Next"  data-dojo-type="Sage.UI.ImageButton" imageClass="icon_Browse_Next_16x16" tooltip="{%= $.nextText %}" alt="{%= $.nextText %}" dojoAttachPoint="_nextButton" dojoAttachEvent="onClick:_moveNext"></div>',
                '<div id="{%= $.id %}-End"  data-dojo-type="Sage.UI.ImageButton" imageClass="icon_End_16x16" tooltip="{%= $.lastText %}" alt="{%= $.lastText %}" dojoAttachPoint="_lastButton" dojoAttachEvent="onClick:_moveLast"></div>',
                '<div id="{%= $.id %}-Switcher"  data-dojo-type="Sage.UI.ImageButton" imageClass="icon_Switch_to_List_View_16x16" tooltip="{%= $.listText %}" alt="{%= $.listText %}" dojoAttachPoint="_listButton" dojoAttachEvent="onClick:_moveToList"></div>',
            '</span>'  //Toolbar
        ]),
        //        constructor: function() {
        //            //console.log('constructing the GroupNavigator');
        //        },
        startup: function () {
            /*
             * This control lives in an update panel. That means it will get destroyed and re-created when:
             *  1) We change groups
             *  2) We navigate to different records
             *
             *  Startup will get called each time to set the label. Do not set the label on the group context change event
             *  as it will cause a double refresh of the label.
             */
            this._setLabel();
        },
        destroy: function () {
            if (this._groupChangedHandle) {
                dojo.disconnect(this._groupChangedHandle);
                this._groupChangedHandle = false;
            }
            this.inherited(arguments);
        },
        postMixInProperties: function () {
            this._entityContextService = Sage.Services.getService('ClientEntityContext');
            this._groupContextService = Sage.Services.getService('ClientGroupContext');
            lang.mixin(this, nls);
        },
        _setLabel: function (args) {
            var groupCtx = this._getGroupContext(),
                position = groupCtx.CurrentEntityPosition,
                count = groupCtx.CurrentGroupCount,
                eCtx = this._entityContextService.getContext();

            this._enableButtons();
            if (this._groupNavLabel && groupCtx) {

                if (count === 0) {
                    position = 0;
                }

                var lbl = dojo.string.substitute(this.labelFmtText, [position, count]);
                this._groupNavLabel.set('label', lbl);

                // Disable the appropriate buttons if we are at the 
                // end or beginning of the group.
                if (position === 0 || position === 1) {
                    this._previousButton.set('disabled', true);
                    this._firstButton.set('disabled', true);
                }
                if (position === groupCtx.CurrentGroupCount || position === 0) {
                    this._nextButton.set('disabled', true);
                    this._lastButton.set('disabled', true);
                }
            }
        },
        _enableButtons: function () {
            this._nextButton.set('disabled', false);
            this._lastButton.set('disabled', false);
            this._previousButton.set('disabled', false);
            this._firstButton.set('disabled', false);
        },
        _moveFirst: function () {
            var groupCtx = this._getGroupContext();
            var eCtx = this._entityContextService.getContext();
            if (groupCtx.FirstEntityID !== '' && groupCtx.FirstEntityID != eCtx.EntityId) {
                this._publishTopic("/group/nav/first", groupCtx.FirstEntityID, eCtx.EntityId, groupCtx.CurrentEntityPosition, groupCtx.CurrentGroupCount);
                this._entityContextService.navigateSLXGroupEntity(groupCtx.FirstEntityID, eCtx.EntityId);
            }
        },
        _movePrevious: function () {
            var groupCtx = this._getGroupContext();
            var eCtx = this._entityContextService.getContext();
            if (groupCtx.PreviousEntityID !== '' && groupCtx.PreviousEntityID != eCtx.EntityId) {
                this._publishTopic("/group/nav/previous", groupCtx.PreviousEntityID, eCtx.EntityId, groupCtx.CurrentEntityPosition, groupCtx.CurrentGroupCount);
                this._entityContextService.navigateSLXGroupEntity(groupCtx.PreviousEntityID, eCtx.EntityId);
            }
        },
        _moveNext: function () {
            var groupCtx = this._getGroupContext();
            var eCtx = this._entityContextService.getContext();
            if (groupCtx.NextEntityID !== '' && groupCtx.NextEntityID != eCtx.EntityId) {
                this._publishTopic("/group/nav/next", groupCtx.NextEntityID, eCtx.EntityId, groupCtx.CurrentEntityPosition, groupCtx.CurrentGroupCount);
                this._entityContextService.navigateSLXGroupEntity(groupCtx.NextEntityID, eCtx.EntityId);
            }
        },
        _moveLast: function () {
            var groupCtx = this._getGroupContext();
            var eCtx = this._entityContextService.getContext();
            if (groupCtx.LastEntityID !== '' && groupCtx.LastEntityID != eCtx.EntityId) {
                this._publishTopic("/group/nav/last", groupCtx.LastEntityID, eCtx.EntityId, groupCtx.CurrentEntityPosition, groupCtx.CurrentGroupCount);
                this._entityContextService.navigateSLXGroupEntity(groupCtx.LastEntityID, eCtx.EntityId);
            }
        },
        _moveToList: function () {
            Sage.Link.toListView();
        },
        _getGroupContext: function () {
            return this._groupContextService.getContext();
        },
        _publishTopic: function (key, toEntityID, currentEntityID, currentPosition, count){
            topic.publish(key, { 'toEntityId': toEntityID, 'fromEntityId': currentEntityID, 'position': currentPosition, 'count': count });
        }
    });
    return groupNavigator;
});
