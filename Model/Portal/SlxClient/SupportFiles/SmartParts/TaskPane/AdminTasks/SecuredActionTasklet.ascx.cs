using System;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.SalesLogix.Web.Controls;

public partial class SecuredActionTaskletControl : TaskletControl
{
    protected override void ProcessRequest(string commandName, string selectionInfoKey)
    {
        if (CurrentEntityType == "ISecuredAction")
        {
            IList<string> selIdList = base.GetSelectedIds(selectionInfoKey);
            switch (commandName)
            {
                case "AddSecuredActionsToRole":
                    AddSecuredActionsToRole(selIdList);
                    break;
            }
        }
    }

    protected void AddSecuredActionsToRole(IList<string> targetIdList)
    {
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetIdList);
        Dialog.DialogParameters.Add("targetEntityType", typeof(ISecuredAction));
        Dialog.EntityType = typeof(IRole);
        Dialog.EntityID = EntityFactory.GetRepository<IRole>().FindAll()[0].Id.ToString();
        Dialog.SetSpecs(180, 350, "SelectRole", GetLocalResourceObject("selectrole_dialogtitle").ToString());
        Dialog.ShowDialog();
    }

}