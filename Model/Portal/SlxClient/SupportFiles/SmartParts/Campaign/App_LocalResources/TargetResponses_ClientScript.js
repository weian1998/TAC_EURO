<script language="javascript" type="text/javascript">
            
    function ResetFilters()
    {    
        var control = dojo.byId("@chkShowContacts");
        if (control != null)
        {
            control.checked = false;
        }
        control = dojo.byId("@chkShowLeads");
        if (control != null)
        {
            control.checked = false;
        }
        control = dojo.byId("@chkLeadSource");
        if (control != null)
        {
            control.checked = false;
        }
        control = dojo.byId("@lbxLeadSource");
        if (control != null)
        {
            control.options[0].selected = true;
        }
        control = dojo.byId("@chkMethod");
        if (control != null)
        {
            control.checked = false;
        }
        control = dojo.byId("@lbxMethod");
        if (control != null)
        {
            control.options[0].selected = true;
        }
        control = dojo.byId("@chkStage");
        if (control != null)
        {
            control.checked = false;
        }
        control = dojo.byId("@lbxStage");
        if (control != null)
        {
            control.options[0].selected = true;
        }
        control = dojo.byId("@chkName");
        if (control != null)
        {
            control.checked = false;
        }
        control = dojo.byId("@txtName");
        if (control != null)
        {
            control.value = "";
        }
    }
    function ct_SetStyleDisplay(controlId, displayType)
    {
        var control = dojo.byId(controlId)
        if (control != null)
        {
            control.style.display = displayType;
        }
    }
    function ShowHideFilters()
    {
        var txtShowFilters = dojo.byId("@tr_txtShowFilterId");
        var lnkFilters = dojo.byId("@tr_lnkFiltersId");
        if (txtShowFilters != null)
        {
            if (txtShowFilters.value == "true")
            {
                txtShowFilters.value = "false";
                ct_SetStyleDisplay("@tr_filterDivId", "none");
                lnkFilters.innerText = "@tr_lnkShowFilters";            
            }
            else
            {
                txtShowFilters.value = "true";
                ct_SetStyleDisplay("@tr_filterDivId", "inline");
                lnkFilters.innerText = "@tr_lnkHideFilters";
            }
        }
    }
        
</script>