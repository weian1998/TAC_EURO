using System;
using System.Collections.Generic;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.SalesLogix.Client.GroupBuilder.Controls;

public partial class UserTaskletControl : TaskletControl
{
    protected override void ProcessRequest(string commandName, string selectionInfoKey)
    {
        if (CurrentEntityType == "IUser")
        {
            IList<string> selIdList = base.GetSelectedIds(selectionInfoKey);
            switch (commandName)
            {
                case "AddUsersToRole":
                    AddUsersToRole(selIdList);
                    break;
            }
        }
    }

    private void AddUsersToRole(IList<string> targetIds)
    {
        Dialog.DialogParameters.Clear();
        Dialog.DialogParameters.Add("selectedIds", targetIds);
        Dialog.DialogParameters.Add("targetEntityType", typeof(IUser));
        Dialog.EntityType = typeof(IRole);
        Dialog.EntityID = EntityFactory.GetRepository<IRole>().FindAll()[0].Id.ToString();
        Dialog.SetSpecs(180, 350, "SelectRole", GetLocalResourceObject("selectrole_dialogtitle").ToString());
        Dialog.ShowDialog();
    }

}