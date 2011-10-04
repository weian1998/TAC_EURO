<script type="text/javascript">
   
    function onTargetWins()
    {
        $(".rdoTargetWins").attr('checked', true);
    }

    function onSourceWins()
    {
        $(".rdoSourceWins").attr('checked', true);
    }
    
    function ShowAll_Click()
    {
        var lnkShowAll = document.getElementById("@lnkShowAllId");
        var lnkShowAllWizard = document.getElementById("@lnkShowAllWizardId");
        var txtShowAll = document.getElementById("@txtShowAllId");
        if (txtShowAll != null)
        {
            if (txtShowAll.value == "true")
            {
                txtShowAll.value = "false";
                UpdateText(lnkShowAll, "@lnkShowAllCaption");
                UpdateText(lnkShowAllWizard, "@lnkShowAllCaption");
            }
            else
            {
                txtShowAll.value = "true";
                UpdateText(lnkShowAll, "@lnkHideDupsCaption");
                UpdateText(lnkShowAllWizard, "@lnkHideDupsCaption");
            }
        }
    }
    
    function UpdateText(control, text)
    {
        if (control != null)
        {
            control.innerText = text;
        }
    }

</script>
