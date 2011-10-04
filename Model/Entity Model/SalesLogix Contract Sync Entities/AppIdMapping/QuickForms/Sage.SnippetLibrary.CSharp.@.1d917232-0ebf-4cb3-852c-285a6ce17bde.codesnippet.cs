/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="1d917232-0ebf-4cb3-852c-285a6ce17bde">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnLoadSynchronization</name>
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
using Sage.Platform.Application;
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
    /// This method is invoked when the Synchronization page is loaded.
    /// </summary>
    public static partial class SynchronizationEventHandlers
    {
		/// <summary>
        /// Loads the synchronization sync interval from the configuration file.
        /// </summary>
        /// <param name="form">The Synchronization form.</param>
        /// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void OnLoadSynchronization(ISynchronization form, EventArgs args)
        {
            IAppIdMapping appIdMapping = form.CurrentEntity as IAppIdMapping;
			try
			{
				form.txtInterval.Text = appIdMapping.GetSyncCycleInterval().ToString();
			}
			catch (FormatException)
			{
				form.txtInterval.Text = "60";
				//throw new ValidationException(form.GetResource("Error_Invalid_Number").ToString());
			}
        }
    }
}