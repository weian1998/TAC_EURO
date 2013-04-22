<%@ Control Language="C#" AutoEventWireup="true" CodeFile="GroupListTasklet.ascx.cs" Inherits="SmartParts_TaskPane_GroupList_GroupListTasklet" EnableTheming="false" ViewStateMode="Disabled" %>
<div style="display:none">
    <asp:Panel ID="GroupListTasklet_RTools" runat="server"></asp:Panel>
</div>
<style type="text/css">
    #<%= ClientID %> .x-panel-body
    {
    	height: 200px;
    }
    #TaskPane_item_GroupListTasklet_pane
    {
    	padding: 0px;
    }
    .displayNone
    {
    	display: none;
    }
</style>
<div id="GroupList_node"></div>

<script type="text/javascript">
    require([
            'Sage/TaskPane/GroupListTasklet',
            'dojo/ready',
            'dijit/registry',
            'dojo/dom'
            ],
        function (GroupListTasklet, ready, registry, dom) {
            var id = 'GroupList',
                init = function () {
                    var list = registry.byId(id),
                        createList = function (id) {
                            return new GroupListTasklet({
                                id: id,
                                keyAlias: '<%= KeyAlias %>',
                                columnAlias: '<%= ColumnAlias %>',
                                columnDisplayName: '<%= ColumnDisplayName %>',
                                entityDisplayName: '<%= EntityDisplayName %>'
                            });
                        };

                    if (!list) {
                        createList(id);
                    }
                };

            ready(init);
        }
    );
</script>