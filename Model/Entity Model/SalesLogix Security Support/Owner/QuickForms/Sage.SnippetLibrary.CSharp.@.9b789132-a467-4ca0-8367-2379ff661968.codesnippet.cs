/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="9b789132-a467-4ca0-8367-2379ff661968">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>cmdOK_OnClickReplaceOwner</name>
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
    /// This is called on the load action of the replace owner form.
    /// </summary>
    public static partial class ReplaceOwnerEventHandlers
    {
		/// <summary>
    	/// Executes the ReplaceOwner business rule.
    	/// </summary>
    	/// <param name="form">The replace owner form.</param>
    	/// <param name="args">The <see cref="System.EventArgs"/> instance containing the event data.</param>
        public static void cmdOK_OnClickReplaceOwner(IReplaceOwner form, EventArgs args)
        {
            IOwner replaceOwner = form.lueSource.LookupResultValue as IOwner;
			IOwner replaceWithOwner = form.lueReplaceWith.LookupResultValue as IOwner;
			if (replaceOwner != null && replaceWithOwner != null)
			{
				replaceOwner.ReplaceOwner(replaceWithOwner);
			}
        }
    }
}