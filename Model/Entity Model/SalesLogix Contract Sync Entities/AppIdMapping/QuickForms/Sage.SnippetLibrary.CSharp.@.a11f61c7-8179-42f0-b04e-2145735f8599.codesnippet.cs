/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="a11f61c7-8179-42f0-b04e-2145735f8599">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnSave_OnClickStep</name>
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
    /// This method is invoked from the save button of the Synchronization tab page.
    /// </summary>
    public static partial class SynchronizationEventHandlers
    {
		/// <summary>
        /// Saves the synchronization interval to the configuration file.
        /// </summary>
        /// <param name="form">The Synchronization form.</param>
        /// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void btnSave_OnClickStep(ISynchronization form, EventArgs args)
        {
            IAppIdMapping appIdMapping = form.CurrentEntity as IAppIdMapping;
			try
			{
				int syncInterval = Convert.ToInt32(form.txtInterval.Text);
				appIdMapping.SaveSyncConfiguration(syncInterval);
			}
			catch (FormatException)
			{
				throw new ValidationException(form.GetResource("Error_Invalid_Number").ToString());
			}
        }
    }
}
