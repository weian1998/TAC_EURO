using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

public partial class SLX_IFRAME : System.Web.UI.UserControl
{
    private string _URL = "http://google.ca";
    public string URL
    {
        get { return _URL; }
        set { _URL = value; }
    }

    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected override void OnPreRender(EventArgs e)
    {
        fslx.Attributes["src"] = _URL;
        base.OnPreRender(e);
    }
}
