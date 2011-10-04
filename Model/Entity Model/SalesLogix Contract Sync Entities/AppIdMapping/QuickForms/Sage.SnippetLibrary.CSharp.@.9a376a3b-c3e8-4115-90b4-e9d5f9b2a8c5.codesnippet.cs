/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="9a376a3b-c3e8-4115-90b4-e9d5f9b2a8c5">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>btnTestFeed_OnClick</name>
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
    /// This method is invoked when the the Test Feed button is selected.
    /// </summary>
    public static partial class AddEditAccountingSystemEventHandlers
    {
		/// <summary>
        /// Validates the accounting feed input can be successfully tested.
        /// </summary>
        /// <param name="form">The Add Edit Accounting System form.</param>
        /// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void btnTestFeed_OnClick(IAddEditAccountingSystem form, EventArgs args)
        {
            IAppIdMapping appIdMapping = form.CurrentEntity as IAppIdMapping;
            //ensure the passwod is encrypted
            appIdMapping.EncryptAccountingSystemPassword(form.txtPassword.Text);
			form.txtStatus.Text = appIdMapping.TestAccountingFeed();
        }
    }
}