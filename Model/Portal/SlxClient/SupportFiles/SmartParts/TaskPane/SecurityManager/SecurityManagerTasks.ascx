<div data-dojo-type="Sage.TaskPane.SecurityManagerTasksTasklet" id="securityManagerTasks"></div>

<script type="text/javascript">
    var securityManagerTasksActions;
    require(['Sage/TaskPane/SecurityManagerTasksTasklet'],
        function (SecurityManagerTasksTasklet) {
            dojo.ready(function () {
                if (!securityManagerTasksActions) {
                    securityManagerTasksActions = new SecurityManagerTasksTasklet({
                        id: "securityManagerTasksActions",
                        clientId: "<%= ClientID %>"
                    });
                }
            });
        }
    );
</script>

<div class="displaynone">
    <div dojoType="dijit.Dialog" id="secProfileDlg" title="<%= GetLocalResourceObject("dialogTitle")%>" execute="">
        <div dojoType="dijit.form.Form" id="secProfileForm" method="POST" onSubmit="return true;">
            <table cellspacing="10">
                <tr>
                    <td>
                        <label for="Description"><%= GetLocalResourceObject("SPDescription")%>:</label>
                    </td>
                    <td>
                        <input type="text" id="secDlg_Description" name="profileDescription" required="true" dojoType="dijit.form.TextBox" style="width:100%;" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="Type"><%= GetLocalResourceObject("SPType")%>:</label>
                    </td>
                    <td>
                        <select dojoType="dijit.form.Select" name="profileType" id="secDlg_Type" style="width:98%; box-sizing:border-box; -moz-box-sizing:border-box;">
                            <option value="UserDefined"><%= GetLocalResourceObject("User")%></option>
                            <option value="System"><%= GetLocalResourceObject("System")%></option>
                        </select>
                    </td>
                </tr>
            </table>
            <div align="right">
		        <div id="btnOk" dojoType="dijit.form.Button" onclick="javascript:return securityManagerTasksActions.saveAndClose();"><%= GetLocalResourceObject("OK")%></div>
		        <div dojoType="dijit.form.Button" style="margin-left:5px;" id="btnCancel" onclick="dijit.byId('secProfileDlg').hide();"><%= GetLocalResourceObject("Cancel")%></div>
	        </div>
        </div>
    </div>
</div>