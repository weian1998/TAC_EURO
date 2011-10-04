/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="9cf68f6b-e657-4280-a31d-609fb82ddd37">
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
#endregion Usings

namespace Sage.BusinessRules.CodeSnippets
{
	/// <summary>
    /// This is called on the load action of the Accounting Integration entity page.
    /// </summary>
    public static partial class SlxEndPointDetailsEventHandlers
    {
		/// <summary>
    	/// Encrypts the SalesLogix end points password.
    	/// </summary>
    	/// <param name="form">The Accounting Integration details form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void btnSave_OnClickStep(ISlxEndPointDetails form, EventArgs args)
        {
            IAppIdMapping appIdMapping = form.CurrentEntity as IAppIdMapping;
			if (appIdMapping != null)
			{
				appIdMapping.EncryptAccountingSystemPassword(form.txtPassword.Text);
			}
			appIdMapping.Save();
        }
    }
}