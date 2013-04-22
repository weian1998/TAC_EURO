<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default"
    Debug="true" MasterPageFile="~/Masters/Main.master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolderArea" runat="server">
     <div id="LogoffContainer">
      <div id="splashimg">
    
            <div id="splashCenterBox">   
                <div id="LoginForm">
                     <div id="ISTitle" runat="server"></div>
                     <div id="ISMessage">

                      <asp:Panel ID="intellisyncDownload" runat="server">
                       
                            <asp:HyperLink ID="lnkDownloads" runat="server" Text="Download the Intellisync Client" NavigateUrl="Downloads/IntellisyncInstall.zip" meta:ResourceKey="lnkDownloads"></asp:HyperLink>
                        </asp:Panel>
                     </br>
                     <asp:HyperLink NavigateUrl="~/Diagnostics.aspx" ID="lnkDiagnostics" runat="server" Text="View Intellisync Diagnostics"  meta:ResourceKey="lnkDiagnostics"/></div>
         </div>
          <div id="ISVersionSection">						 
							<div class="info">
                                <div><asp:Label ID="lblVersion" runat="server" Text="Version"  meta:ResourceKey="lblVersion"></asp:Label></div>
								<div><asp:Label ID="lblCopyright" runat="server" Text="Copyright 1997-2012" meta:ResourceKey="lblCopyright"></asp:Label></div>
								<div><asp:Label ID="lblCompany" runat="server" Text="Sage Software, Inc."  meta:ResourceKey="lblCompany"></asp:Label></div>
							    <div><asp:Label ID="lblRights" runat="server" Text="All Rights Reserved"  meta:ResourceKey="lblRights"></asp:Label></div>
							</div>					    
			 </div>               
      </div>
     
        </div>
    </div>
</asp:Content>
