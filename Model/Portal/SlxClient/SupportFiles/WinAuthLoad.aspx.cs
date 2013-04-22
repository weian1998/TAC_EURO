using System;
using System.Web.UI;

public partial class WinAuthLoad : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        HiddenField1.Value = Request.Params["next_url"];
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        var url = Uri.UnescapeDataString(Request.Params["next_url"]);
        Response.Redirect(url);
    }
}