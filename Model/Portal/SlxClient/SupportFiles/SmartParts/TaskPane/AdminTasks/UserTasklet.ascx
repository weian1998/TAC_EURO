<%@ Control Language="C#" AutoEventWireup="true" CodeFile="UserTasklet.ascx.cs" Inherits="UserTaskletControl" %>

<asp:HiddenField ID="hfSelections" runat="server" Value="" />
<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="SAG">
    <ContentTemplate>
        <div data-dojo-type="Sage.TaskPane.UserTasklet" id="userTasklet"></div>
        <asp:Button runat="server" OnClick="tskAddUserToRole_Click" ID="tskAddUserToRole" CausesValidation="false" style="display:none;" />
        <asp:Button runat="server" OnClick="tskResetUsers_Click" ID="tskResetUsers" CausesValidation="false" style="display:none;" />

        <script type="text/javascript">
            var userTaskletActions;
            require(['Sage/TaskPane/UserTasklet'],
                function (UserTasklet) {
                    dojo.ready(function () {
                        if (!userTaskletActions) {
                            userTaskletActions = new UserTasklet({
                                id: "userTaskletActions",
                                clientId: "<%= ClientID %>"
                            });
                        }
                    });
                }
            );
        </script>
    </ContentTemplate>
</asp:UpdatePanel>