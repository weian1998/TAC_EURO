using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Sage.Platform.WebPortal.Services;
using Sage.Platform.Application.UI;
using Sage.Platform.Application;
using Sage.Platform.WebPortal.SmartParts;
using log4net;
using Sage.SalesLogix.Services.Import.Actions;
using Sage.SalesLogix.Services.Import;
using Sage.Entity.Interfaces;

public partial class StepGroupActions : UserControl, ISmartPartInfoProvider
{
    static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodInfo.GetCurrentMethod().DeclaringType);

    #region Public Methods

    /// <summary>
    /// Gets the smart part info.
    /// </summary>
    /// <param name="smartPartInfoType">Type of the smart part info.</param>
    /// <returns></returns>
    public ISmartPartInfo GetSmartPartInfo(Type smartPartInfoType)
    {
        ToolsSmartPartInfo tinfo = new ToolsSmartPartInfo();
        return tinfo;
    }

    /// <summary>
    /// Gets or sets an instance of the Dialog Service.
    /// </summary>
    /// <value>The dialog service.</value>
    [ServiceDependency]
    public IWebDialogService DialogService { get; set; }

    /// <summary>
    /// Gets or sets the entity context.
    /// </summary>
    /// <value>The entity context.</value>
    /// <returns>The specified <see cref="T:System.Web.HttpContext"></see> object associated with the current request.</returns>
    [ServiceDependency]
    public IContextService ContextService { get; set; }

    /// <summary>
    /// Sets the state of the action.
    /// </summary>
    public void SetActionsState()
    {
        ImportManager im = GetImportManager();
        if (im != null)
        {
            grdActions.DataSource = im.ActionManager.GetActions();
            grdActions.DataBind();
        }
    }

    /// <summary>
    /// Saves the state of the actions.
    /// </summary>
    public void SaveActionsState()
    {
        ImportManager im = GetImportManager();
        if (im != null)
        {
            foreach (IAction action in im.ActionManager.GetActions())
            {
                string active = Request.Form["chkActionActive_" + action.Name];
                action.Active = active != null;
            }
            Page.Session["importManager"] = im;
        }
    }

    #endregion

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
    }

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
    protected override void OnPreRender(EventArgs e)
    {
        SetActionsState();
        base.OnPreRender(e);
    }

    /// <summary>
    /// Handles the OnRowEditing event of the grdActions control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewEditEventArgs"/> instance containing the event data.</param>
    protected void grdActions_OnRowEditing(object sender, GridViewEditEventArgs e)
    {
        grdActions.SelectedIndex = e.NewEditIndex;
    }

    /// <summary>
    /// Handles the OnRowCommand event of the grdActions control.
    /// </summary>
    /// <param name="source">The source of the event.</param>
    /// <param name="e">The <see cref="System.Web.UI.WebControls.GridViewCommandEventArgs"/> instance containing the event data.</param>
    protected void grdActions_OnRowCommand(object source, GridViewCommandEventArgs e)
    {
        SaveActionsState();
        string command = e.CommandName;
        if (command == "Edit")
        {
            int rowIndex = Convert.ToInt32(e.CommandArgument);
            string actionName = grdActions.DataKeys[rowIndex].Values[0].ToString();
            switch (actionName)
            {
                case "AddNote":
                    cmdEditNote();
                    break;
                case "AddTarget":
                    cmdEditTarget();
                    break;
                case "AddResponse":
                    cmdEditResponse();
                    break;
                case "SchedulePhoneCall":
                    ScheduleActivity("SchedulePhoneCall");
                    break;
                case "ScheduleMeeting":
                    ScheduleActivity("ScheduleMeeting");
                    break;
                case "ScheduleToDo":
                    ScheduleActivity("ScheduleToDo");
                    break;
            }
        }
    }

    /// <summary>
    /// CMDs the edit note.
    /// </summary>
    private void cmdEditNote()
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(0, 0, 275, 600, "ImportActionAddNote", String.Empty, true);
            DialogService.EntityType = typeof(IImportHistory);
            DialogService.ShowDialog();
        }
    }

    /// <summary>
    /// CMDs the edit target.
    /// </summary>
    private void cmdEditTarget()
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(0, 0, 150, 400, "ImportActionAddTarget", String.Empty, true);
            DialogService.EntityType = typeof(IImportHistory);
            DialogService.ShowDialog();
        }
    }

    /// <summary>
    /// CMDs the edit response.
    /// </summary>
    private void cmdEditResponse()
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(0, 0, 450, 450, "ImportActionAddResponse", String.Empty, true);
            DialogService.EntityType = typeof(IImportHistory);
            DialogService.ShowDialog();
        }
    }

    /// <summary>
    /// Schedules the activity.
    /// </summary>
    /// <param name="actionName">Name of the action.</param>
    private void ScheduleActivity(string actionName)
    {
        if (DialogService != null)
        {
            DialogService.SetSpecs(0, 0, 290, 750, "ImportActionScheduleActivity", String.Empty, true);
            DialogService.EntityType = typeof(IImportHistory);
            DialogService.DialogParameters.Remove("ActionName");
            DialogService.DialogParameters.Add("ActionName", actionName);
            DialogService.ShowDialog();
        }
    }

    /// <summary>
    /// Gets the import manager.
    /// </summary>
    /// <returns></returns>
    private ImportManager GetImportManager()
    {
        ImportManager importManager = Page.Session["importManager"] as ImportManager;
        if (importManager != null && importManager.ActionManager == null)
        {
            ActionManager actionManager = new ActionManager();
            actionManager.AddAction(new ActionAddNote("AddNote",
                                                      GetLocalResourceObject("Action_AddNote.Caption").ToString(), false));
            actionManager.AddAction(new ActionAddResponse("AddResponse",
                                                          GetLocalResourceObject("Action_AddResponse.Caption").ToString(),
                                                          false));
            actionManager.AddAction(new ActionAddTarget("AddTarget",
                                                        GetLocalResourceObject("Action_AddTarget.Caption").ToString(),
                                                        false));
            actionManager.AddAction(new ActionScheduleActivity("SchedulePhoneCall",
                                                               GetLocalResourceObject("SchedulePhoneCall.Caption").
                                                                   ToString(), false, ActivityType.atPhoneCall));
            actionManager.AddAction(new ActionScheduleActivity("ScheduleMeeting",
                                                               GetLocalResourceObject("ScheduleMeeting.Caption").
                                                                   ToString(), false, ActivityType.atAppointment));
            actionManager.AddAction(new ActionScheduleActivity("ScheduleToDo",
                                                               GetLocalResourceObject("ScheduleToDo.Caption").ToString(),
                                                               false, ActivityType.atToDo));
            importManager.ActionManager = actionManager;
        }
        return importManager;
    }

    /// <summary>
    /// Creates the property check box.
    /// </summary>
    /// <param name="data">The data.</param>
    /// <returns></returns>
    protected string CreatePropertyCheckBox(object data)
    {
        string control = String.Empty;
        if (data != null)
        {
            IAction action = data as IAction;
            string strOptions = string.Empty;
            if (action.Active)
            {
                strOptions = "CHECKED";
            }

            if (!action.Initialized)
            {
                strOptions =  strOptions + " DISABLED";
            }

            control = string.Format("<input type='checkbox' id='chkActionActive_{0}' name='chkActionActive_{0}' value='Yes' {1} />", action.Name, strOptions);
        }
        return control;
    }

    /// <summary>
    /// Gets the command text.
    /// </summary>
    /// <param name="data">The data.</param>
    /// <returns></returns>
    protected string GetCommandText(object data)
    {
        string commandText = string.Empty;
        if (data != null)
        {
            IAction action = data as IAction;
            commandText = action.Initialized ? "Edit" : "Define";
        }
        return commandText;
    }

    /// <summary>
    /// Determines whether [is action defined] [the specified data].
    /// </summary>
    /// <param name="data">The data.</param>
    /// <returns>
    /// 	<c>true</c> if [is action defined] [the specified data]; otherwise, <c>false</c>.
    /// </returns>
    protected bool IsActionDefined(object data)
    {
        bool isDefined = false;
        if (data != null)
        {
            IAction action = data as IAction;
            if (action.Initialized)
            {
                isDefined = true;
            }            
        }
        return isDefined;
    }
}