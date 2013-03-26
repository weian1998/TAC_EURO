<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Quota.aspx.cs" Inherits="SmartParts_Dashboard_Quota" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/dojo/1.8.3/dijit/themes/claro/claro.css"
        media="screen">
</head>
<body>
    <!-- load Dojo -->
    <script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.3/dojo/dojo.js" data-dojo-config="async: true"></script>
    <script>
        //dojo.require("dojox.charting.themes.PrimaryColors");
        require([
        // Require the basic chart class
    "dojox/charting/Chart",

        // Require the theme of our choosing
        //"dojox/charting/themes/Claro",
    "dojox/charting/themes/PrimaryColors",


        //  We want to plot Lines
        //"dojox/charting/plot2d/Lines",
        //  We want to plot Columns
    "dojox/charting/plot2d/ClusteredColumns",

        // Load the Legend, Tooltip, and Magnify classes
    "dojox/charting/widget/Legend",
    "dojox/charting/action2d/Tooltip",
    "dojox/charting/action2d/Magnify",

        //  We want to use Markers
    "dojox/charting/plot2d/Markers",

        //  We'll use default x/y axes
    "dojox/charting/axis2d/Default",

        // Wait until the DOM is ready
    "dojo/domReady!"
], function (Chart, theme, ClusteredColumns, Legend, Tooltip, Magnify) {

    // Define the data
    var chartData = [10000, 9200, 11811, 12000, 7662, 13887, 14200, 12222, 12000, 10009, 11288, 12099];
    var chartData2 = [3000, 12000, 17733, 9876, 12783, 12899, 13888, 13277, 14299, 12345, 12345, 15763];
    var chartData3 = [3000, 12000, 17733, 9876, 12783, 12899, 13888, 13277, 14299, 12345, 12345, 15763].reverse();

    // Create the chart within it's "holding" node
    var chart = new Chart("chartNode");

    // Set the theme
    chart.setTheme(theme);

    // Add the only/default plot
    chart.addPlot("default", {
        type: ClusteredColumns,
        markers: true,
        gap: 4
    });

    // Add axes
    chart.addAxis("x");
    chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major" });

    // Add the series of data
    chart.addSeries("Monthly Sales - 2010", chartData); //TotalSales
    chart.addSeries("Monthly Sales - 2009", chartData2); //TotalTarget
    //chart.addSeries("Monthly Sales - 2008", chartData3);

    // Create the tooltip
    var tip = new Tooltip(chart, "default");

    // Create the magnifier
    var mag = new Magnify(chart, "default");

    // Render the chart!
    chart.render();

    // Create the legend
    var legend = new Legend({ chart: chart }, "legend");
});</script>
    <script language="javascript" type="text/javascript">
        //Reference of the GridView. 
        var TargetBaseControl = null;
        //Total no of checkboxes in a particular column inside the GridView.
        var CheckBoxes;
        //Total no of checked checkboxes in a particular column inside the GridView.
        var CheckedCheckBoxes;
        //Array of selected item's Ids.
        var SelectedItems;
        //Hidden field that wil contain string of selected item's Ids separated by '|'.
        var SelectedValues;

        window.onload = function () {
            //Get reference of the GridView. 
            try {
                TargetBaseControl = document.getElementById('<%= this.GridView1.ClientID %>');
            }
            catch (err) {
                TargetBaseControl = null;
            }

            //Get total no of checkboxes in a particular column inside the GridView.
            try {
                CheckBoxes = parseInt('<%= this.GridView1.Rows.Count %>');
            }
            catch (err) {
                CheckBoxes = 0;
            }

            //Get total no of checked checkboxes in a particular column inside the GridView.
            CheckedCheckBoxes = 0;

            //Get hidden field that wil contain string of selected item's Ids separated by '|'.
            SelectedValues = document.getElementById('<%= this.hdnFldSelectedValues.ClientID %>');

            //Get an array of selected item's Ids.
            if (SelectedValues.value == '')
                SelectedItems = new Array();
            else
                SelectedItems = SelectedValues.value.split('|');

            //Restore selected CheckBoxes' states.
            if (TargetBaseControl != null)
                RestoreState();
        }

        //    function HeaderClick(CheckBox) {
        //        //Get all the control of the type INPUT in the base control.
        //        var Inputs = TargetBaseControl.getElementsByTagName('input');

        //        //Checked/Unchecked all the checkBoxes in side the GridView & modify selected items array.
        //        for (var n = 0; n < Inputs.length; ++n)
        //            if (Inputs[n].type == 'checkbox' && Inputs[n].id.indexOf('chkSelect', 0) >= 0) {
        //            Inputs[n].checked = CheckBox.checked;
        //            if (CheckBox.checked)
        //                SelectedItems.push(document.getElementById(Inputs[n].id.replace('chkSelect', 'hdnFldId')).value);
        //            else
        //                DeleteItem(document.getElementById(Inputs[n].id.replace('chkSelect', 'hdnFldId')).value);
        //        }

        //        //Update Selected Values. 
        //        SelectedValues.value = SelectedItems.join('|');

        //        //Reset Counter
        //        CheckedCheckBoxes = CheckBox.checked ? CheckBoxes : 0;
        //    }
        function SelectAllCheckboxes(spanChk) {

            // Added as ASPX uses SPAN for checkbox

            var oItem = spanChk.children;
            var theBox = (spanChk.type == "checkbox") ?
        spanChk : spanChk.children.item[0];
            xState = theBox.checked;
            elm = theBox.form.elements;

            for (i = 0; i < elm.length; i++)
                if (elm[i].type == "checkbox" &&
              elm[i].id != theBox.id) {
                    //elm[i].click();

                    if (elm[i].checked != xState)
                        elm[i].click();
                    //elm[i].checked=xState;

                }
        }

        function ChildClick(CheckBox, Id) {
            var hiddenRefreshControl = '<%= this.hdnREFRESH.ClientID %>';
            var mytest;
            mytest = document.getElementById(hiddenRefreshControl).value;
            if (mytest == "REFRESH") {
                SelectedItems.splice(0); //Intialize the array
                SelectedValues.value = ""; // Intialize the string
                document.getElementById(hiddenRefreshControl).value = ""; //Set the RefreshFlag Back
            }
            //alert(Id);
            //Modify selected items array.
            if (CheckBox.checked)
                SelectedItems.push(Id);
            else
                DeleteItem(Id);

            //Update Selected Values.
            SelectedValues.value = SelectedItems.join('|');
            //alert(SelectedValues.value);
            //Get hidden field that wil contain string of selected item's Ids separated by '|'.
            // the value of the javascript variable
            var hiddenControl = '<%= this.hdnFldSelectedValues.ClientID %>';
            document.getElementById(hiddenControl).value = SelectedValues.value;
        }

        //    function RestoreState() {
        //        //Get all the control of the type INPUT in the base control.
        //        var Inputs = TargetBaseControl.getElementsByTagName('input');

        //        //Header CheckBox
        //        var HCheckBox = null;

        //        //Restore previous state of the all checkBoxes in side the GridView.
        //        for (var n = 0; n < Inputs.length; ++n)
        //            if (Inputs[n].type == 'checkbox' && Inputs[n].id.indexOf('chkSelect', 0) >= 0)
        //            if (IsItemExists(document.getElementById(Inputs[n].id.replace('chkSelect', 'hdnFldId')).value) > -1) {
        //            Inputs[n].checked = true;
        //            CheckedCheckBoxes++;
        //        }
        //        else
        //            Inputs[n].checked = false;
        //        else if (Inputs[n].type == 'checkbox' && Inputs[n].id.indexOf('chkAll', 0) >= 0)
        //            HCheckBox = Inputs[n];

        //        //Change state of the header CheckBox.
        //        if (CheckedCheckBoxes < CheckBoxes)
        //            HCheckBox.checked = false;
        //        else if (CheckedCheckBoxes == CheckBoxes)
        //            HCheckBox.checked = true;
        //    }

        function DeleteItem(Text) {
            var n = IsItemExists(Text);
            if (n > -1)
                SelectedItems.splice(n, 1);
        }

        function IsItemExists(Text) {
            for (var n = 0; n < SelectedItems.length; ++n)
                if (SelectedItems[n] == Text)
                    return n;

            return -1;
        }
    

    </script>
    <form id="form1" runat="server">
    <table>
        <tr>
            <td>
                Label for Chart
            </td>
            <td>
                &nbsp;</td>
        </tr>
        <tr>
            <td>
                <div id="chartNode" style="width: 400px; height: 400px;">
                </div>
                <div id="legend">
                </div>
            </td>
            <td>
                Quota Type:
                <asp:DropDownList ID="ddlQuotaType" runat="server">
                    <asp:ListItem>Value of Sales</asp:ListItem>
                    <asp:ListItem>Number Closed Sales</asp:ListItem>
                    <asp:ListItem>Number Open Opportunties</asp:ListItem>
                    <asp:ListItem>Number Quotes (New Opportunities)</asp:ListItem>
                    <asp:ListItem>Opportunity Close Ratio</asp:ListItem>
                </asp:DropDownList>
                <br />
                Period:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <asp:DropDownList ID="ddlPeriod" runat="server">
                    <asp:ListItem>Fiscal YTD</asp:ListItem>
                    <asp:ListItem>Fiscal QTD</asp:ListItem>
                    <asp:ListItem>Fiscal MTD</asp:ListItem>
                    <asp:ListItem>Last 90 Days</asp:ListItem>
                    <asp:ListItem>Last 60 Days</asp:ListItem>
                    <asp:ListItem>Last 30 Days</asp:ListItem>
                    <asp:ListItem>Custom Dates</asp:ListItem>
                </asp:DropDownList>
                <asp:GridView ID="GridView1" runat="server" Width="400px" 
                    OnRowDataBound="GridView1_RowDataBound" onrowcreated="GridView1_RowCreated">
                </asp:GridView>
                <asp:Button ID="Button1" runat="server" Text="Refresh" OnClick="Button1_Click" />
            </td>
        </tr>
    </table>
    <asp:HiddenField ID="hdnFldSelectedValues" runat="server" />
    <asp:HiddenField ID="hdnREFRESH" runat="server" />
    <asp:HiddenField ID="hiddenTotalSalesValues" runat="server" />
    <asp:HiddenField ID="hiddenTotalTargetValues" runat="server" />
    <asp:HiddenField ID="hiddenMonthValues" runat="server" />
    </form>
</body>
</html>
