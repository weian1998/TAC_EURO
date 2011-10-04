/*
 * This metadata is used by the Sage platform.  Do not remove.
<snippetHeader xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" id="0de7b90d-8e9a-4e10-8c00-dc63a41214c4">
 <assembly>Sage.SnippetLibrary.CSharp</assembly>
 <name>OnLoad1Step</name>
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
    public static partial class UserDetailsEventHandlers
    {
        public static void OnLoad1Step( IUserDetails form,  EventArgs args)
        {
            
			IUser user = form.CurrentEntity as IUser;

		    form.lblLicenseCount.Text = MySlx.Security.GetLicenseInfoMsg(user.Type);
		     
		   
		   bool isEnabled = EnableUI(user);
		   form.UserName.Enabled = isEnabled;
		   form.lbxUserType.Enabled = isEnabled;
		   form.chkLoginActive.Enabled = isEnabled;
		   form.cbxIsUserManager.Enabled = isEnabled;
		   form.slxUserManager.Enabled = isEnabled;
		   form.pnName.Enabled = isEnabled;	
		   form.pklDivision.Enabled = isEnabled;
		   form.pklREegion.Enabled = isEnabled;
		   form.btnChangePassword.Enabled = EnablePassword(user);
		
			if(user.Type == UserType.AddOn)
			{
			   form.cbxIsUserManager.Enabled = false;			
			}
			if(user.Type == UserType.Template)
			{
			     form.lbxUserType.Enabled = false;
				 form.chkLoginActive.Enabled = false;
		         form.QFSLXEmail.Enabled = false;
				 form.pklUserTitle.Enabled = false;
		         form.btnChangePassword.Enabled = false;
				 form.cbxIsUserManager.Enabled = false;	
			}
		    if(user.Type == UserType.WebViewer)
			{
			     form.cbxIsUserManager.Enabled = false;	
			}
			 
            if(user.Id.ToString().TrimEnd() != "ADMIN")
            {
                if (form.lbxUserType.Items.Count == 9)
                {
                    // removes the Administrator type
					form.lbxUserType.Items.RemoveAt(8);
                }
            }
        }
		
		public static bool EnablePassword(IUser user)
		{
			bool returnVal = false;
			if (MySlx.Security.CurrentSalesLogixUser.UserName == "ADMIN" || user.UserName != "ADMIN")
			   returnVal = true;
			
			return returnVal;
		}
		
		
		public static bool EnableUI(IUser user)
		{
			bool returnVal = false;
		   if(user.UserName != "ADMIN")
			   returnVal = true;
		   
			return returnVal;
		
		}
    }
}
