<%@ Control Language="C#" AutoEventWireup="true" CodeFile="UserTasklet.ascx.cs" Inherits="UserTaskletControl" %>
<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="SAG">
<ContentTemplate>

<ul id="userTaskletContainer" class="task-pane-item-common-tasklist">
    <li><asp:LinkButton id="lnkAddUserToRole" runat="server" Text="<%$ Resources: addtorole_link %>"></asp:LinkButton></li>
</ul>

<script type="text/javascript" language="javascript">
    $(document).ready(function () {
        var config = {
            'links': [{
                'id': '<%= lnkAddUserToRole.ClientID %>',
                'linkText': '<%= GetLocalResourceObject("addtorole_link") %>',
                'hasAccess': '<%= HasAccess("Entities\\User\\Add") %>',
                'viewModes': ['list'],
                'serverCommand': 'AddUsersToRole'
            }],
            'entityType': 'IUser',
            'linkContainer': $("#userTaskletContainer") // specify which container to use
        };

        var userTasklet = new Sage.TaskPane.Tasklet(config);
        userTasklet.showLinks();

    });

</script>
<asp:HiddenField ID="selkey" runat="server" />
</ContentTemplate>
</asp:UpdatePanel>