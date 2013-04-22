using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Entity.Interfaces;
using Sage.SalesLogix.Security;
using Sage.SalesLogix.Web.Controls.Lookup;

public partial class CopyProfileParameters : UserControl
{
    void Page_Load(object sender, EventArgs e)
    {

    }
    protected override void OnPreRender(EventArgs e)
    {
        if (Request.Form["ctl00$DialogWorkspace$CopyUserProfile$copyProfileParameter$UserTypeRadioGroup"] == "templateOption")
        {
            templateOption.Checked = true;
            templateListContainer.Style[HtmlTextWriterStyle.Display] = "inline";
            userListContainer.Style[HtmlTextWriterStyle.Display] = "none";
        }
        else
        {
            userOption.Checked = true;
            templateListContainer.Style[HtmlTextWriterStyle.Display] = "none";
            userListContainer.Style[HtmlTextWriterStyle.Display] = "inline";
        }

        base.OnPreRender(e);
    }
    public LookupControl UserLookupControl
    {
        get { return lueUser; }
    }
    public LookupControl TemplateLookupControl
    {
        get { return lueTemplate; }
    }
    public Label ValidationLabel
    {
        get { return lblMessage; }
    }
    public string SelectedUserId
    {
        get
        {
            if (userOption.Checked && lueUser.LookupResultValue != null)
                return ((IUser)lueUser.LookupResultValue).Id.ToString(); 
            else if (templateOption.Checked && lueTemplate.LookupResultValue != null)
                return ((IUser)lueTemplate.LookupResultValue).Id.ToString();
            else
                return "";
        }
    }
    public AddUserOptions UserOptions
    {
        get
        {
            AddUserOptions options = new AddUserOptions();
            options.UseCalendarProfile = chkCalendar.Checked;
            options.UseTeamsProfile = chkTeams.Checked;
            options.UseSecurityProfile = chkSecurity.Checked;
            options.UseGeneralProfile = chkGeneral.Checked;
            options.UseClientOptionsProfile = chkClientOptions.Checked;
            //options.UseCustomProfile = chkCustom.Checked;
            options.UseEmployeeProfile = chkEmployee.Checked;
            options.UseSupportProfile = chkServiceSupport.Checked;
            options.UseFunctionSecurityProfile = false;
            options.UseSyncProfile = false;

            return options;
        }
    }
    public bool IsValid
    {
        set 
        {
            if (value == false)
            {
                lblMessage.Style[HtmlTextWriterStyle.Display] = "inline";
                lblMessage.Style[HtmlTextWriterStyle.MarginLeft] = "38px";
            }
            else
            {
                lblMessage.Style[HtmlTextWriterStyle.Display] = "none";
            }
        } 
    }
    public RadioButton UserRadioButton
    {
        get { return userOption; }
    }
    public RadioButton TemplateRadioButton
    {
        get { return templateOption; }
    }
}
