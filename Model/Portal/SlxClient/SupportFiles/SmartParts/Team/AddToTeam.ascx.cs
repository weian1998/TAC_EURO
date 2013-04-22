using System;
using System.Collections.Generic;
using System.Web.UI;
using Sage.Platform.WebPortal.SmartParts;
using Sage.Platform.Application.UI;
using Sage.Entity.Interfaces;

public partial class AddToTeam : Sage.Platform.WebPortal.SmartParts.SmartPartInfoProvider
{
    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public override ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        foreach (Control c in AddUsers_Tools.Controls)
        {
            tinfo.RightTools.Add(c);
        }
        tinfo.Title = GetTitle();
        return tinfo;
    }

    /// <summary>
    /// Raises the <see cref="E:PreRender"/> event.
    /// </summary>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        LoadView();
    }

    /// <summary>
    /// Handles the Click event of the ok button control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void OK_Click(object sender, EventArgs e)
    {
        Type context = GetContext();
        if(context == typeof(IUser))
        {
            UserAddToTeam();
        }
        else if (context == typeof(ITeam))
        {
            TeamAddToTeam();
        }
        else if (context == typeof(IDepartment))
        {
            DepAddToTeam();
        }
       
        DialogService.CloseEventHappened(this, null);
    }

    private void TeamAddToTeam()
    {
        ITeam targetTeam = null;
        string teamId = string.Empty;
        if (lueTeam.LookupResultValue != null)
        {
            teamId = lueTeam.LookupResultValue.ToString();
            targetTeam = Sage.Platform.EntityFactory.GetById<ITeam>(teamId);
        }
        if (targetTeam == null) return;
        IList<string> selectedTeams = GetTargets();
        if (selectedTeams != null)
        {
            foreach (string selectedId in selectedTeams)
            {
                ITeam selectedTeam = Sage.Platform.EntityFactory.GetById<ITeam>(selectedId);
                if (selectedTeam != null)
                {
                    if (selectedTeam.Id != targetTeam.Id)
                    {
                        targetTeam.AddMember(selectedTeam.Owner);
                    }
                }
            }
            Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "Team", teamId), false);
        }
    }

    private void UserAddToTeam()
    {
        ITeam targetTeam = null;
        string teamId = string.Empty;
        if (lueTeam.LookupResultValue != null)
        {
            teamId = lueTeam.LookupResultValue.ToString();
            targetTeam = Sage.Platform.EntityFactory.GetById<ITeam>(teamId);
        }
        if (targetTeam != null)
        {
            IList<string> selectedUsers = GetTargets();
            if (selectedUsers != null)
            {
                foreach (string selectedId in selectedUsers)
                {
                    IUser selectedUser = Sage.Platform.EntityFactory.GetById<IUser>(selectedId);
                    if (selectedUser != null)
                    {
                        if ((selectedUser.Type == UserType.Retired) || (selectedUser.Type == UserType.Template))
                        {
                            throw new Sage.Platform.Application.ValidationException(GetLocalResourceObject("InvalidUserContext").ToString());
                        }
                        Sage.SalesLogix.Team.Rules.SetAddManagerWithMemberOption(targetTeam, chkAddManager.Checked ? bool.TrueString : bool.FalseString);
                        targetTeam.AddMember(selectedUser.DefaultOwner);
                    }
                }
                Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "Team", teamId), false);
            }
        }
    }

    private void DepAddToTeam()
    {

        ITeam targetTeam = null;
        string teamId = string.Empty;
        if (lueTeam.LookupResultValue != null)
        {
            teamId = lueTeam.LookupResultValue.ToString();
            targetTeam = Sage.Platform.EntityFactory.GetById<ITeam>(teamId);
        }
        if (targetTeam != null)
        {
            IList<string> selectedDeps = GetTargets();
            if (selectedDeps != null)
            {
                foreach (string selectedId in selectedDeps)
                {
                    IDepartment selectedDep = Sage.Platform.EntityFactory.GetById<IDepartment>(selectedId);
                    if (selectedDep != null)
                    {
                        if (!targetTeam.ContainsMember(selectedDep.Owner))
                        {
                            targetTeam.AddMember(selectedDep.Owner);
                        }
                    }
                }
                Response.Redirect(string.Format("~/{0}.aspx?entityId={1}", "Team", teamId), false);
            }
        }
    }
        
    private IList<string> GetTargets()
    {
        IList<string> ids = null;
        if (DialogService.DialogParameters.ContainsKey("selectedIds"))
        {
            ids = DialogService.DialogParameters["selectedIds"] as IList<string>;
        }
        return ids;
    }

    private Type GetContext()
    {
        Type context = DialogService.DialogParameters.ContainsKey("context")
                           ? DialogService.DialogParameters["context"] as Type
                           : null;
        return context;
    }

    private  string GetTitle()
    {
        Type context = GetContext();
        int count = GetSelectCount();
        string desc = GetEntityName(context, count);
        return string.Format(GetLocalResourceObject("Title_Add.Caption").ToString(), desc);
    }

    private string GetDescription()
    {
        int count = GetSelectCount();
        Type context = GetContext();
        string desc = GetEntityName(context, count);
        return string.Format(GetLocalResourceObject("Add_Description").ToString(), count, desc);
    }

    private string GetEntityName(Type entityType, int selectCount )
    {
        string desc = string.Empty;
        try
        {
            Type context = entityType;
            if (context == typeof(IUser))
            {
                desc = selectCount > 1 ? GetLocalResourceObject("Users").ToString() : GetLocalResourceObject("User").ToString();
            }
            else if (context == typeof(ITeam))
            {
                desc = selectCount > 1 ? GetLocalResourceObject("Teams").ToString() : GetLocalResourceObject("Team").ToString();
            }
            else if (context == typeof(IDepartment))
            {
                desc = selectCount > 1 ? GetLocalResourceObject("Departments").ToString() : GetLocalResourceObject("Department").ToString();
            }

            return desc;
        }
        catch (Exception)
        { }
        return "";
    }

    private int GetSelectCount()
    {
        int count = 0;
        IList<string> ids = GetTargets();
        if (ids != null)
        {
            count = ids.Count;
        }
        return count;
    }

    protected void CANCEL_Click(object sender, EventArgs e)
    {
        //Response.Redirect(string.Format("~/{0}.aspx?", "Team"), false);    
    }

    protected override void OnWireEventHandlers()
    {
        base.OnWireEventHandlers();
         btnCancel.Click += new EventHandler(DialogService.CloseEventHappened);
    }

    private void LoadView()
    {
        Type context = GetContext();
        if (context == typeof(IUser))
        {
            ITeam team = Sage.Platform.EntityFactory.Create<ITeam>();
            bool addManager;
            Sage.SalesLogix.Team.Rules.GetAddManagerWithMemberOption(team, out addManager);
            chkAddManager.Checked = addManager;
        }
        else
        {
            chkAddManager.Visible = false;
        }

        if (DialogService.DialogParameters.Count > 0 )
        {
            if (DialogService.DialogParameters.ContainsKey("selectedIds"))
            {
                lblDescription.Text = GetDescription();
            }
        }
        if ((lueTeam.LookupResultValue == null) || (lueTeam.LookupResultValue.ToString() == string.Empty))
        {
            btnOk.Enabled = false;
        }
        else
        {
            btnOk.Enabled = true;
            lueTeam.LookupResultValue = lueTeam.LookupResultValue;
        }
    }
}