using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Resources;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.Platform.Application;
using Sage.Platform.Application.Services;
using Sage.Platform.Application.UI.Web;
using Sage.Platform.WebPortal;
using Sage.Platform.WebPortal.Services;
using Sage.SalesLogix.Services;
using Sage.SalesLogix.Web.Controls;
using Sage.SalesLogix.Web.Controls.Lookup;
using Sage.SalesLogix.Web.Controls.PickList;

public class FormHelper
{
    public static void Disable(ControlCollection controls)
    {
        foreach (Control c in controls)
        {
            if (c is TextBox
                || c is DropDownList
                || c is RadioButton
                || c is CheckBox
                || c is DateTimePicker
                || c is LookupControl
                || c is DurationPicker
                || c is PickListControl
                || c is SlxUserControl
                || c is ListBox
                || c is Button)
            {
                ((WebControl)c).Enabled = false;
            }
        }
    }

    public static void RefreshMainListPanel(Page page, Type type)
    {
        const string script = @"
            if (Sage && Sage.SalesLogix && Sage.SalesLogix.Controls && Sage.SalesLogix.Controls.ListPanel) {
                var panel = Sage.SalesLogix.Controls.ListPanel.find('MainList');
                if (panel)
                    panel.refresh();
            }";
        ScriptManager.RegisterStartupScript(page, type, "RefreshMainListPanelScript", script, true);
    }

    public static string GetConfirmDeleteScript()
    {
        return string.Format("return confirm('{0}');", PortalUtil.JavaScriptEncode(SalesLogix.ConfirmDelete));
    }

    ///// <summary>
    ///// Gets the system info option.
    ///// </summary>
    ///// <param name="optionName">Name of the option.</param>
    ///// <returns></returns>
    //public static Boolean GetSystemInfoOption(String optionName)
    //{
        //This function has been depricated, use ISystemOptionsService instead.
        //SystemInformation systemInfo = SystemInformationRules.GetSystemInfo();
        //DelphiStreamReader stream = new DelphiStreamReader(systemInfo.Data);
        //TValueType valueType;
        //if (stream.FindProperty(optionName, out valueType))
        //    return valueType.Equals(TValueType.vaTrue);
        //return false;
    //}

    /// <summary>
    /// Adds the base and user currency rates to client context.
    /// </summary>
    /// <description>
    ///  Assemble the multi-currency rate information and add it to the ClientContextService for use by the currency control and column.
    /// </description>
    /// <param name="pageWorkItem">The page work item.</param>  
    public static void AddBaseUserCurrencyRatesToClientContext(PageWorkItem pageWorkItem)
    {
        //Assemble the multi-currency rate information and add it to the ClientContextService for use by the 
        //Currency column control.
        var ccs = pageWorkItem.Services.Get<ClientContextService>();

        //Get Exchange Rate Type: Base Rate.  
        var optionSvc = ApplicationContext.Current.Services.Get<ISystemOptionsService>();
        var baseCode = optionSvc.BaseCurrency;
        if (!string.IsNullOrEmpty(baseCode))
        {
            //Set the rate from My Rate code.
            var erBase = EntityFactory.GetById<IExchangeRate>(baseCode);
            var baseRate = erBase.Rate.GetValueOrDefault(1).ToString();
            if (baseRate == "0") baseRate = "1";
            //Set Base Rate and Code on the service.
            if (ccs.CurrentContext.ContainsKey("BaseRateCode"))
            {
                ccs.CurrentContext["BaseRateCode"] = baseCode;
            }
            else
            {
                ccs.CurrentContext.Add("BaseRateCode", baseCode);
            }

            if (ccs.CurrentContext.ContainsKey("BaseRate"))
            {
                ccs.CurrentContext["BaseRate"] = baseRate;
            }
            else
            {
                ccs.CurrentContext.Add("BaseRate", baseRate);
            }
        }

        //Get Exchange Rate Type, My Rate from User Options Service.  
        var userOption = ApplicationContext.Current.Services.Get<IUserOptionsService>();
        var userExCode = !string.IsNullOrEmpty(userOption.GetCommonOption("Currency", "General"))
                             ? userOption.GetCommonOption("Currency", "General")
                             : baseCode;
        if (!string.IsNullOrEmpty(userExCode))
        {
            //Set the rate from My Rate code.
            var er = EntityFactory.GetById<IExchangeRate>(userExCode);
            var userExRate = er.Rate.GetValueOrDefault(1).ToString();
            if (userExRate == "0") userExRate = "1";
            //Set My Rate and Code on the service.
            if (ccs.CurrentContext.ContainsKey("MyRateCode"))
            {
                ccs.CurrentContext["MyRateCode"].Equals(userExCode);
            }
            else
            {
                ccs.CurrentContext.Add("MyRateCode", userExCode);
            }

            if (ccs.CurrentContext.ContainsKey("MyRate"))
            {
                ccs.CurrentContext["MyRate"].Equals(userExRate);
            }
            else
            {
                ccs.CurrentContext.Add("MyRate", userExRate);
            }
        }
    }
}