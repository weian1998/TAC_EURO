<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AttachmentList.ascx.cs" Inherits="AttachmentList" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
                        
<div style="clear:both"></div>

    <div style="display: none">
        <asp:TextBox runat="server" ID="dataCarrierId" CssClass="AttachmentList_DataCarrier" />
    </div>

    <div id="AttachmentList_Grid" runat="server" style="width:100%;height:100%;" ></div>
