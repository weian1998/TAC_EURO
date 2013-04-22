<%@ Control Language="C#" AutoEventWireup="true" CodeFile="Library.ascx.cs" Inherits="SmartParts_Library_Library" %>    

<link rel="stylesheet" type="text/css" href="css/library.css" />

<%-- ReSharper disable InconsistentNaming --%>
<script type="text/javascript">
    require([
            'Sage/Library/Manager',            
            'Sage/UI/Dialogs'
        ],
        function(Manager, Dialogs) {
            try {
                Manager.createView();
            } catch(e) {
                Dialogs.showError(e);
            }
        }
    );
</script>
<div id="filePicker" name="filePicker"></div>

<table width="100%">
    <tr>
        <td width="30%" style="vertical-align: top;">                      
            <div class="detail-panel-toolbar listPanelToolbar rightTools" id="treeToolbarRoot">                        
                <span id="treeToolbar"></span>
            </div>  
            <div id="libraryTreeRoot">                
            </div>
        </td>
        <td width="70%" style="vertical-align: top;">
            <div class="detail-panel-toolbar listPanelToolbar rightTools" id="gridToolbarRoot">  
                <span id="gridToolbar"></span>
            </div>
            <div id="libraryGridPlaceHolder" style="width: 100%; height:400px">                
            </div>
        </td>
    </tr>
</table>

