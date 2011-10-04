/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="fc615c1b-9171-4592-b323-c0bac151e46a">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnLoadStep</name>
 <references>
  <reference>
   <assemblyName>Sage.Entity.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\interfaces\bin\Sage.Entity.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Form.Interfaces.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\formInterfaces\bin\Sage.Form.Interfaces.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.Platform.dll</assemblyName>
   <hintPath>%BASEBUILDPATH%\assemblies\Sage.Platform.dll</hintPath>
  </reference>
  <reference>
   <assemblyName>Sage.SalesLogix.API.dll</assemblyName>
  </reference>
 </references>
</snippetHeader>
*/

#region Usings
using System;
using Sage.Entity.Interfaces;
using Sage.Form.Interfaces;
using Sage.SalesLogix.API;
using Sage.Platform.WebPortal.Services;
using Sage.Platform;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
	/// This method is invoked when a Sync cycle is launched from the Accounting Systems tab view.
	/// </summary>
	public static partial class SyncConfirmationEventHandlers
	{
		/// <summary>
		/// Assigns the new job id to the link control.
		/// </summary>
		/// <param name="form">The SyncConfirmation form.</param>
		/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
		public static void OnLoadStep(ISyncJobConfirmation form, EventArgs args)
		{
			IWebDialogService dialogService = form.Services.Get<IWebDialogService>();
            if (dialogService.DialogParameters.ContainsKey("NewSyncJobName"))
            {
                var jobName = dialogService.DialogParameters["NewSyncJobName"];
                if (jobName != null)
                {
                    ISyncJob syncJob = EntityFactory.GetRepository<ISyncJob>().FindFirstByProperty("JobName", jobName.ToString());
                    if (syncJob != null)
                    {
                        form.lnkViewSyncJob.EntityId = syncJob.Id.ToString();
                        form.lnkViewSyncJob.Text = String.Format(form.GetResource("jobName.Caption").ToString(), jobName);
                    }
                    else
                    {
                        form.lnkViewSyncJob.Visible = false;
                        form.lblMessage.Text = form.GetResource("DialogHeader.Caption").ToString();
                    }
                    dialogService.DialogParameters.Remove("NewSyncJobName");
                }
            }
		}
	}
}
