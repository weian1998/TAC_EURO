<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CommonTasksTasklet.ascx.cs" Inherits="SmartParts_TaskPane_CommonTasks_CommonTasksTasklet" EnableViewState="true" ViewStateMode="Enabled" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="SalesLogix" %>

<asp:HiddenField ID="hfSelections" runat="server" Value="" />
<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="SAG">
<ContentTemplate>
    <span runat="server" id='selectionDisplay' class="task-pane-item-common-selectioncount">
        <div id="Div1" runat="server" class="task-pane-item-common-tasklist">
            <span id='selectionCount'>0</span>
            <%# GetLocalResourceObject("EditResponse_DialogCaption").ToString() %> 
            <asp:Label ID='selectionText' runat='server'></asp:Label>
        </div>
    </span>
    <a id="clearSelection" href="#" class="task-pane-item-common-clearselection">
        <asp:Literal ID='clearText' runat='server' Text=""/>
    </a>
    <ul id="<%= ClientID %>" class="task-pane-item-common-tasklist">
        <asp:Repeater runat="server" ID="items" onitemdatabound="items_ItemDataBound"  
            onitemcommand="items_ItemCommand">
            <HeaderTemplate>
                <asp:Literal ID="headerLine" runat="server" Text="<hr />"></asp:Literal>
            </HeaderTemplate>
            <ItemTemplate>  
                <li class="task-pane-item-common-tasklist task-pane-item-common-taskitem">
                    <asp:LinkButton runat="server" ID="Action" meta:resourcekey="ActionResource1" CausesValidation="False"></asp:LinkButton>
                </li>
            </ItemTemplate>
        </asp:Repeater>
    </ul>
    <asp:Button ID="tskExportToExcel" runat="server" style="display:none;" />

    <script type="text/javascript">
        var commonTaskActions;
        require([
                'Sage/TaskPane/CommonTasksTasklet',
                'dojo/on',
                'dojo/_base/lang',
                'dojo/ready',
                'Sage/Utility',
                'dojo/dom-construct',
                'dojo/topic',
                'Sage/Utility/Dashboard'
            ],
            function (CommonTasksTasklet, on, lang, ready, Utility, construct, topic) {
                var prm = Sys.WebForms.PageRequestManager.getInstance(),
                    getSelected = function () {
                        var countSpan = dojo.byId('selectionCount'),
                            listPanel = dijit.byId('list');
                        if (countSpan && listPanel) {
                            countSpan.innerHTML = listPanel.getTotalSelectionCount();
                        }
                    },
                    init = function () {
                        getSelected();
                        var clearSel = dojo.byId('clearSelection'),
                            mode = Utility.getModeId();

                        if (!commonTaskActions) {
                            commonTaskActions = new CommonTasksTasklet({
                                id: "commonTaskActions",
                                clientId: "<%= ClientID %>"
                            });
                        }

                        topic.subscribe('/sage/ui/list/selectionChanged', function (listPanel) {
                            getSelected();
                        });

                        if (clearSel) {
                            if (mode === 'detail') {
                                construct.destroy(clearSel);
                            } else {
                                on(clearSel, 'click', function () {
                                    var listPanel = dijit.byId('list');
                                    if (listPanel) {
                                        listPanel._listGrid.selection.clear();
                                    }
                                });
                            }
                        }

                        if (!window.groupContextChanged) {
                            window.groupContextChanged = topic.subscribe('/group/context/changed', function () {
                                window.groupContextChanged = window.groupContextChanged.remove();
                                __doPostBack("<%= ClientID %>", "");
                            });
                        }
                    };

                if (prm) {
                    prm.add_endRequest(init);
                }
                ready(init);
            });
    </script>
</ContentTemplate>
</asp:UpdatePanel>