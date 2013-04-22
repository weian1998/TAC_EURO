<%@ Control Language="C#" ClassName="LeadQualifications" Inherits="SmartParts_Lead_LeadQualifications"
    CodeFile="LeadQualifications.ascx.cs" %>

<%--Used to store true/false confirmation from the dialog displayed via javascript for the cboQualifications control.--%>
<asp:HiddenField runat="server" ID="htxtConfirmation" Value="" />
<asp:HiddenField runat="server" ID="txtCurrentLeadId" Value="" />

<table border="0" cellpadding="1" cellspacing="0" width="100%">
    <col style="width: 50%"/>
    <col style="width: 50%"/>
    <tr>
        <td colspan="2">
            <span class="lbl">
                <asp:Label ID="cboQualifications_lz" runat="server" Text="<%$ resources: cboQualifications.Caption %>"></asp:Label>
            </span> 
            <span class="textcontrol">
                <asp:ListBox runat="server" ID="cboQualifications" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control"></asp:ListBox>
            </span>
        </td>
    </tr>
    <tr>
        <td colspan="2">
            <span>
                <asp:LinkButton runat="server" ID="cmdConvertLeadLink" Text="<%$ resources: cmdConvertLeadLink.Caption %>" />
            </span>
        </td>
    </tr>
    <tr id="container1" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected1" Text="" AutoPostBack="True" />
            </span>
            <span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected1_lz" AssociatedControlID="chkQualificationSelected1"
                    runat="server" Text="<%$ resources: chkQualificationSelected1.Caption %>">
                </asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox runat="server" ID="txtQualificationDescription1" AutoPostBack="True" dojoType="Sage.UI.Controls.TextBox"/>&nbsp;
            </span>
        </td>
    </tr>
    <tr id="container2" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected2" Text="" AutoPostBack="True" />
            </span>
            <span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected2_lz" AssociatedControlID="chkQualificationSelected2"
                    runat="server" Text="<%$ resources: chkQualificationSelected2.Caption %>">
                </asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox Style="display: none" runat="server" ID="txtQualificationDescription2" AutoPostBack="True" Wrap="False" dojoType="Sage.UI.Controls.TextBox"/>
            </span>
        </td>
    </tr>
    <tr id="container3" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected3" Text="" AutoPostBack="True" />
            </span>
            <span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected3_lz" AssociatedControlID="chkQualificationSelected3"
                    runat="server" Text="<%$ resources: chkQualificationSelected3.Caption %>">
                </asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox Style="display: none" runat="server" ID="txtQualificationDescription3" AutoPostBack="True" Wrap="False" dojoType="Sage.UI.Controls.TextBox"/>
            </span>
        </td>
    </tr>
    <tr id="container4" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected4" Text="" AutoPostBack="True" />
            </span>
            <span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected4_lz" AssociatedControlID="chkQualificationSelected4"
                    runat="server" Text="<%$ resources: chkQualificationSelected4.Caption %>">
                </asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox Style="display: none" runat="server" ID="txtQualificationDescription4" AutoPostBack="True" Wrap="False" dojoType="Sage.UI.Controls.TextBox"/>
            </span>
        </td>
    </tr>
    <tr id="container5" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected5"
                    Text="" AutoPostBack="True" />
            </span><span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected5_lz" AssociatedControlID="chkQualificationSelected5"
                    runat="server" Text="<%$ resources: chkQualificationSelected5.Caption %>"></asp:Label></span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox Style="display: none" runat="server" ID="txtQualificationDescription5" AutoPostBack="True" Wrap="False" dojoType="Sage.UI.Controls.TextBox"/>
            </span>
        </td>
    </tr>
    <tr id="container6" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected6" Text="" AutoPostBack="True" />
            </span>
            <span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected6_lz" AssociatedControlID="chkQualificationSelected6"
                    runat="server" Text="<%$ resources: chkQualificationSelected6.Caption %>">
                </asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox Style="display: none" runat="server" ID="txtQualificationDescription6" AutoPostBack="True" Wrap="False" dojoType="Sage.UI.Controls.TextBox"/>
            </span>
        </td>
    </tr>
    <tr id="container7" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected7" Text="" AutoPostBack="True" />
            </span>
            <span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected7_lz" AssociatedControlID="chkQualificationSelected7"
                    runat="server" Text="<%$ resources: chkQualificationSelected7.Caption %>">
                </asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox Style="display: none" runat="server" ID="txtQualificationDescription7" AutoPostBack="True" Wrap="False" dojoType="Sage.UI.Controls.TextBox"/>
            </span>
        </td>
    </tr>
    <tr id="container8" runat="server">
        <td>
            <span>
                <asp:CheckBox Style="display: none" runat="server" ID="chkQualificationSelected8" Text="" AutoPostBack="True" />
            </span><span class="lblright">
                <asp:Label Style="display: none" ID="chkQualificationSelected8_lz" AssociatedControlID="chkQualificationSelected8"
                    runat="server" Text="<%$ resources: chkQualificationSelected8.Caption %>">
                </asp:Label>
            </span>
        </td>
        <td>
            <span class="textcontrol">
                <asp:TextBox Style="display: none" runat="server" ID="txtQualificationDescription8" AutoPostBack="True" Wrap="False" dojoType="Sage.UI.Controls.TextBox"/>
            </span>
        </td>
    </tr>
</table>