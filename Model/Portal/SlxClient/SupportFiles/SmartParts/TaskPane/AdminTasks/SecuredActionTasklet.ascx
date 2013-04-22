<%@ Control Language="C#" CodeFile="SecuredActionTasklet.ascx.cs" Inherits="SecuredActionTaskletControl" %>

<asp:HiddenField ID="hfSelections" runat="server" Value="" />
<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="SAG">
    <ContentTemplate>
        <div data-dojo-type="Sage.TaskPane.SecuredActionTasklet" id="securedActionTasks"></div>
        <asp:Button runat="server" OnClick="tskAddSecuredActionsToRole_Click" ID="tskAddSecuredActionsToRole" CausesValidation="false" style="display:none;" />

        <script type="text/javascript">
            var securedActionTaskletActions;
            require(['Sage/TaskPane/SecuredActionTasklet'],
                   function (SecuredActionTasklet) {
                       dojo.ready(function () {
                           if (!securedActionTaskletActions) {
                               securedActionTaskletActions = new SecuredActionTasklet({
                                   id: "securedActionTaskletActions",
                                   clientId: "<%= ClientID %>"
                               });
                           }
                       });
                   }
               );
        </script>
    </ContentTemplate>
</asp:UpdatePanel>