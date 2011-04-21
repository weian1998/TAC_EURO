<%@ Control Language="C#" CodeFile="SecuredActionTasklet.ascx.cs" Inherits="SecuredActionTaskletControl" %>
<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="SAG">
<ContentTemplate>

<ul id="securedActionTaskletContainer" class="task-pane-item-common-tasklist">
    <li><asp:LinkButton id="lnkAddSecuredActionsToRole" runat="server" Text="<%$ Resources: addtorole_link %>"></asp:LinkButton></li>
</ul>

<script type="text/javascript" language="javascript">
    $(document).ready(function () {
        var config = {
            'links': [{
                'id': '<%= lnkAddSecuredActionsToRole.ClientID %>',
                'linkText': '<%= GetLocalResourceObject("addtorole_link") %>',
                'hasAccess': '<%= HasAccess("Entities\\SecuredAction\\Add") %>',
                'viewModes': ['list'],
                'serverCommand': 'AddSecuredActionsToRole'
            }],
            'entityType': 'ISecuredAction',
            'linkContainer': $("#securedActionTaskletContainer") 
        };

        var securedActionTasklet = new Sage.TaskPane.Tasklet(config);
        securedActionTasklet.showLinks();

    });

</script>
<asp:HiddenField ID="selkey" runat="server" />
</ContentTemplate>
</asp:UpdatePanel>