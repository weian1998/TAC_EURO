<%@ Page AutoEventWireup="true" Language="c#" MasterPageFile="~/Masters/Login.master" CodeFile="ChangePassword.aspx.cs" Inherits="SlxClient.ChangePasswordPage" Culture="auto" UICulture="auto" %>
<%@ Assembly Name="System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" %>

<asp:Content ID="Content1" runat="server" ContentPlaceHolderID="ContentPlaceHolderArea" >

<div id="splashimg">
      <div style="position:relative; top: 110px; left: 42px; width: 100%; z-index: 2; font-family:Arial; font-size:14px; color: #000000">

            <table style="table-layout:fixed; width:100%">   
                <tr>
                    <td style="text-align:right; width=25%">
                        <asp:Label ID="lblUserNameLabel" runat="server" Text="<%$ resources: UserName %>" ></asp:Label>  
                    </td>
                    <td style="width:70%">
                        <asp:Label ID="lblUserNameText" runat="server" />
                    </td>
                </tr>
                 <tr>
                    <td style="text-align:right">
                        <asp:Label ID="lblCurrentPassword" runat="server" AssociatedControlID="lblCurrentPassword" Text="<%$ resources: CurrentPassword %>" />
                    </td>
                    <td>
                        <asp:TextBox ID="txtCurrentPassword" runat="server" CssClass="editCtl" TextMode="Password" AutoComplete="off"></asp:TextBox>
                    </td>
                 </tr>
                 <tr>
                    <td style="text-align:right"></td>
                    <td></td>
                 </tr>  
                 <tr>
                    <td style="text-align:right">
                        <asp:Label ID="lblNewPassword" runat="server" AssociatedControlID="txtNewPassword" Text="<%$ resources: NewPassword %>" />
                    </td>
                    <td>
                        <asp:TextBox ID="txtNewPassword" runat="server" CssClass="editCtl" TextMode="Password" AutoComplete="off"></asp:TextBox>
                    </td>
                 </tr>
                  <tr>
                    <td style="text-align:right">
                        <asp:Label ID="lblReEnterNewPassword" runat="server" AssociatedControlID="txtReEnterNewPassword" Text="<%$ resources: ConfirmNewPassword %>" />
                    </td>
                    <td>
                        <asp:TextBox ID="txtReEnterNewPassword" runat="server" CssClass="editCtl" TextMode="Password" AutoComplete="off"></asp:TextBox>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align:right"></td>
                    <td style="text-align:left">
                        <asp:Button ID="btnChangePassword" runat="server"  CssClass="okButton" Text="<%$ resources: ChangePassword %>" OnClick="btnChangePassword_Click"  />
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align:right"></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colspan="2">
                         <div id="Div1" class="loginmsg">
                            <asp:Literal ID="PasswordFailureMsg" runat="server" EnableViewState="False" ></asp:Literal>
                            &nbsp;
                        </div>
                    </td>
                  
                  </tr>
            </table>
             
            <div id="loginMsgRow" class="loginmsg">
                    <asp:Literal ID="FailureTextMsg" runat="server" EnableViewState="False" ></asp:Literal>
                    &nbsp;
            </div>
              
        </div>          
    </div>

</asp:Content>