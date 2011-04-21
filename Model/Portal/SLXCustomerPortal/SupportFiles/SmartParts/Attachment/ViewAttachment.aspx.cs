using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Web;
using Microsoft.Win32;
using Sage.Entity.Interfaces;
using Sage.Platform;
using Sage.SalesLogix;
using Sage.SalesLogix.LegacyBridge.FileSync;
using System.Text.RegularExpressions;

public partial class ViewAttachment : System.Web.UI.Page
{
    /// <summary>
    /// The type of attachment link.
    /// </summary>
    private enum AttachmentLink
    {
        /// <summary>
        /// Create a file name based on the attachment description.
        /// </summary>
        alDescription,
        /// <summary>
        /// Create a file name based on the attachment file name.
        /// </summary>
        alFileName
    }


    private const string commonHtmlFmt = @"
<html xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <title>Request File</title>
    <link rel=""stylesheet"" type=""text/css"" href=""../../css/SlxBase.css"" />
    <style type=""text/css"">
    .msg {{ padding: 50px 50px; width: 600px; text-align:center;  }}
    H1 {{ font-size : 150%; color: #01795E; }}
    INPUT {{ width : 100px }}
    </style>
</head>
<body>
{0}
</body>
</html>
";

    /// <summary>
    /// The default type of attachment file name to create when the user clicks the attachment hyperlink.
    /// This value can be set here.
    /// </summary>
    private AttachmentLink _attachmentLinkType = AttachmentLink.alDescription; // AttachmentLink.alFileName;

    /// <summary>
    /// Handles the Load event of the Page control.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">The <see cref="System.EventArgs"/> instance containing the event data.</param>
    protected void Page_Load(object sender, EventArgs e)
    {
        string requestfilesync = Request.QueryString["requestfilesync"];
        if (!string.IsNullOrEmpty(requestfilesync))
        {
            RequestFileSync();
            return;
        }
        OpenAttachment();
    }

    /// <summary>
    /// Gets the type of the attachment.
    /// </summary>
    /// <param name="DataType">Type of the data.</param>
    /// <returns></returns>
    protected static string GetAttachmentType(string DataType)
    {
        switch (DataType)
        {
            case "R":
                return "Attachment";
            case "T":
                return "Template";
            case "D":
                return "Data";
            case "F":
                return "general"; //virtual directory
            case "FA":
                return "Attachment";
            case "FS":
                return "Library";
            default:
                return String.Empty;
        }
    }

    /// <summary>
    /// Gets the file extension.
    /// </summary>
    /// <param name="file">The file.</param>
    /// <returns></returns>
    protected static string GetFileExtension(string file)
    {
        return Path.GetExtension(file);
    }

   

    private bool IsRemote()
    {
        var systemInfo = SystemInformationRules.GetSystemInfo();
        if (systemInfo != null)
        {
            return (systemInfo.DatabaseType == 2);
        }
        return false;
    }

    private void RequestFileSync()
    {
        if (IsRemote())
        {
            string DataType = GetAttachmentType(Request.QueryString["DataType"]);
            if (DataType == "Library")
            {
                var fileId = Request.QueryString["fileId"];
                //set status
                var libraryDoc = EntityFactory.GetById<ILibraryDocs>(fileId);
                if ((libraryDoc.Status != null) && ((libraryDoc.Status == LibraryDocsStatus.Ordered) || (libraryDoc.Status == LibraryDocsStatus.RevisionOrdered)))
                {
                    WriteFileSyncRequested();
                    return;
                }
                if ((libraryDoc.Status == null) || (libraryDoc.Status == LibraryDocsStatus.Available))
                {
                    libraryDoc.Status = LibraryDocsStatus.Ordered;
                    libraryDoc.Save();
                }
                else if (libraryDoc.Status == LibraryDocsStatus.Revised)
                {
                    libraryDoc.Status = LibraryDocsStatus.RevisionOrdered;
                    libraryDoc.Save();
                }
                //log sync request...
                var synclogger = new FileSyncRequest();
                synclogger.LogLibraryFileRequest(fileId);

                WriteFileSyncRequested();
                return;
            }
        }
        WriteErrorMessage(string.Empty);        
    }
    private void WriteErrorMessage(string message)
    {
        Response.ContentType = "text/html";
        Response.Write(string.Format(commonHtmlFmt, string.Format("<div class=\"msg\"><h1>{0}</h1></div>", message)));
    }

    private void WriteFileNotFound(string filename, string fileid)
    {
        string DataType = GetAttachmentType(Request.QueryString["DataType"]);
        if (!IsRemote() || (DataType != "Library"))
        {
            WriteErrorMessage(string.Format(GetLocalResourceObject("Error_RequestedFileNotFoundFmt").ToString(), filename));
            return;
        }

        var libraryDoc = EntityFactory.GetById<ILibraryDocs>(fileid);
        if ((libraryDoc.Status != null) && ((libraryDoc.Status == LibraryDocsStatus.Ordered) || (libraryDoc.Status == LibraryDocsStatus.RevisionOrdered)))
        {
            WriteFileSyncRequested();
            return;
        }

        //let them request the sync of the Library file...
        const string htmlFmt =
            @"
    <form id=""RequestFile"" action=""ViewAttachment.aspx?requestfilesync=true&filename={1}&fileid={2}&DataType={3}"" method=""POST"">
    <div class=""msg"">
        <h1>{0}</h1>
        <br />
        <input type=""submit"" id=""submit"" value=""{4}"" />
        <input type=""button"" id=""cancel"" value=""{5}"" onclick=""window.close();"" />
    </div>
    </form>
";
        string content = string.Format(htmlFmt, GetLocalResourceObject("RequestFileMsg"), filename, fileid,
                                       Request.QueryString["DataType"], GetLocalResourceObject("Yes"),
                                       GetLocalResourceObject("No"));

        Response.ContentType = "text/html";
        Response.Write(string.Format(commonHtmlFmt, content));
    }

    private void WriteFileSyncRequested()
    {
        const string htmlFmt = @"
    <div class=""msg"">
        <h1>{0}</h1>
        <br />
        <input type=""button"" id=""cancel"" value=""{1}"" onclick=""window.close();"" />
    </div>
";
        Response.ContentType = "text/html";
        string htmlBody = string.Format(htmlFmt, GetLocalResourceObject("FileRequested"), GetLocalResourceObject("OK"));
        Response.Write(string.Format(commonHtmlFmt, htmlBody));
    }


    /// <summary>
    /// Opens the attachment.
    /// </summary>
    protected void OpenAttachment()
    {
        try
        {
            Response.Buffer = true;
            Response.Clear();
            Response.ClearContent();
            Response.ClearHeaders();
            string fileName = Request.QueryString["Filename"];
            //string fileDesc = Request.QueryString["Description"];
            string historyid = Request.QueryString["historyid"];
            if (string.IsNullOrEmpty(fileName) && string.IsNullOrEmpty(historyid))
            {
                WriteErrorMessage(string.Concat(GetLocalResourceObject("Error_NoFileRequested_lz"), "<br />",
                    Request.PathInfo, "?", Request.QueryString));
                return;
            }
            if (!string.IsNullOrEmpty(fileName))
            {
                //remove backslash from file name
                if (fileName.IndexOf("/") == 0)
                    fileName = fileName.Remove(0, 1);
                fileName = fileName.Replace("..", "").Replace("%", "").Replace("\\", "");  //Regex.Replace(fileName, "\W", "_");   //\/\?\=\<\>\\\:\*\|
            }
            else if (!string.IsNullOrEmpty(historyid))
            {
                var history = EntityFactory.GetById<IHistory>(historyid);
                if (history != null)
                {
                    IList<IAttachment> attachments =
                        Sage.SalesLogix.Attachment.Rules.GetAttachmentsFor(typeof(IHistory), history.HistoryId);
                    if (attachments != null)
                    {
                        IAttachment attachment = null;
                        foreach (IAttachment att in attachments)
                        {
                            if (att.FileName.ToUpper().EndsWith(".MSG"))
                            {
                                fileName = att.FileName;
                                attachment = att;
                                break;
                            }
                        }
                        if (attachment == null)
                        {
                            WriteErrorMessage(GetLocalResourceObject("Error_EmailMsgAttachment").ToString());
                            return;
                        }
                    }
                    else
                    {
                        WriteErrorMessage(GetLocalResourceObject("Error_EmailMsgAttachment").ToString());
                        return;
                    }
                }
            }

            string filePath = String.Empty;
            string DataType = GetAttachmentType(Request.QueryString["DataType"]);
            if (DataType.Equals("Library"))
            {
                object fileId = Request.QueryString["fileId"];
                //can't use query string to get library directory as Whats New attachment/documents won't contain that property
                string libraryPath = Sage.SalesLogix.Attachment.Rules.GetLibraryPath();
                ILibraryDocs libraryDoc = EntityFactory.GetRepository<ILibraryDocs>().Get(fileId);
                if (libraryDoc != null)
                {
                    filePath = String.Format("{0}{1}\\", libraryPath, libraryDoc.Directory.FullPath);
                    if (IsRemote())
                    {
                        if (File.Exists(filePath + fileName))
                        {
                            //Do we check for Revised and ask if they want to request the revised version?
                            //if ((libraryDoc.Status == null) || (libraryDoc.Status == LibraryDocsStatus.Delivered))
                            //{
                                libraryDoc.Status = LibraryDocsStatus.DeliveredRead;
                                libraryDoc.Save();
                            //}
                        }
                    }
                }
            }
            else
                filePath = Sage.SalesLogix.Attachment.Rules.GetAttachmentPath();
            
            if (DataType.Equals("Template"))
                filePath += "Word Templates/";

            string tempPath = Sage.SalesLogix.Attachment.Rules.GetTempAttachmentPath();
            if (File.Exists(tempPath + fileName))
                filePath = tempPath;

            if (File.Exists(filePath + fileName))
            {
                FileStream fileStream = new FileStream(filePath + fileName, FileMode.Open, FileAccess.Read, FileShare.Read);
                try
                {
                    const int CHUNK_SIZE = 1024 * 10;
                    long iFileLength = fileStream.Length;

                    if (iFileLength < 1)
                    {
                        WriteFileNotFound(fileName, Request.QueryString["fileId"]);
                        return;
                    }


                    BinaryReader binaryReader = new BinaryReader(fileStream);
                    try
                    {
                        Response.Buffer = false;
                        Response.Clear();
                        Response.ClearContent();
                        Response.ClearHeaders();

                        string strFilePart = string.Empty;
                        switch (_attachmentLinkType)
                        {
                            case AttachmentLink.alDescription:
                                strFilePart = MakeValidFileName(fileName);
                                if (string.IsNullOrEmpty(strFilePart))
                                    strFilePart = GetLocalResourceObject("DefaultUnknownFileName").ToString();
                                break;
                            case AttachmentLink.alFileName:
                                strFilePart = Path.GetFileNameWithoutExtension(filePath + fileName);
                                if (string.IsNullOrEmpty(strFilePart))
                                    strFilePart = GetLocalResourceObject("DefaultUnknownFileName").ToString();
                                const int ATTACHMENTID_LENGTH = 13;
                                if (strFilePart.StartsWith("!") && (strFilePart.Length > ATTACHMENTID_LENGTH))
                                    // Grab everything after the Attachment ID.
                                    strFilePart = strFilePart.Substring(ATTACHMENTID_LENGTH);
                                else
                                {
                                    // If it's not a regular attachment then check to see if it's a mail merge attachment... 
                                    if (!fileName.ToUpper().StartsWith("MAIL MERGE\\"))
                                        strFilePart = GetLocalResourceObject("DefaultUnknownFileName").ToString();
                                }
                                break;
                        }

                        if (string.IsNullOrEmpty(strFilePart))
                            strFilePart = GetLocalResourceObject("DefaultUnknownFileName").ToString();

                        if (strFilePart.Equals(GetLocalResourceObject("DefaultUnknownFileName").ToString()))
                            // Just in case the translation contains invalid file name characters.
                            strFilePart = MakeValidFileName(strFilePart);

                        string strExtPart = Path.GetExtension(filePath + fileName);
                        if (string.IsNullOrEmpty(strExtPart))
                            strExtPart = ".dat";

                        Response.ContentType = GetMIMEFromReg(strExtPart);

                        if (IsIE())
                        {
                            // Note: Internet Explorer will only allow 20 characters to be used for the file name (including extension)
                            //       when double byte characters are used. However, if more than 20 characters are used the Save As dialog
                            //       will show an invalid file name and an invalid file extension under the following conditions:
                            //       http://support.microsoft.com/kb/897168. The code below handles the truncation of the file name when
                            //       the file name contains double byte characters, which works around this bug.

                            // Will return false if there were any double byte characters. 
                            bool bCanUseFullFileName;
                            try
                            {
                                bCanUseFullFileName = Sage.Platform.Data.DataUtil.CalculateStorageLengthRequired(fileName).Equals(fileName.Length);
                            }
                            catch (Exception)
                            {
                                bCanUseFullFileName = false;
                            }

                            if (bCanUseFullFileName.Equals(false))
                            {
                                int iExtLength = strExtPart.Length;
                                int iCopyLength = 20 - iExtLength;
                                // We can only use 20 characters for the filename + ext if there were double byte characters.
                                if (strFilePart.Length > iCopyLength)
                                {
                                    strFilePart = strFilePart.Substring(0, iCopyLength);
                                }
                            }
                        }

                        fileName = strFilePart.Replace("+", "%20");

                        Response.Clear();
                        Response.Charset = String.Empty;
                        Encoding headerEncoding = Encoding.GetEncoding(1252);
                        Response.HeaderEncoding = headerEncoding;

                        Response.AddHeader("Content-Disposition",
                            string.Format("attachment; filename{0}=\"", (IsFirefox() || IsMozilla()) ? "*" : "") + fileName + "\";");

                        binaryReader.BaseStream.Seek(0, SeekOrigin.Begin);
                        int iMaxCount = (int)Math.Ceiling((iFileLength + 0.0) / CHUNK_SIZE);
                        for (int i = 0; i < iMaxCount && Response.IsClientConnected; i++)
                        {
                            Response.BinaryWrite(binaryReader.ReadBytes(CHUNK_SIZE));
                            Response.Flush();
                        }
                        HttpContext.Current.ApplicationInstance.CompleteRequest();
                    }
                    finally
                    {
                        binaryReader.Close();
                    }
                    fileStream.Close();
                }
                finally
                {
                    fileStream.Dispose();
                }
            }
            else
            {
                WriteFileNotFound(fileName, Request.QueryString["fileId"]);
                return;
            }
        }
        catch (Exception ex)
        {
            if (ex.Message.IndexOf("because it is being used by another") > 0)
            {
                WriteErrorMessage(string.Concat(GetLocalResourceObject("Error_FileInUse_lz").ToString(), "\r\n", ex.Message));
            }
            else
            {
                WriteErrorMessage(string.Concat(GetLocalResourceObject("Error_NoFileRequested_lz").ToString(), "\r\n{0}",
                        Request.PathInfo, "?", Request.QueryString));
            }
        }
    }

    /// <summary>
    /// Returns a name that can be used as a valid file name.
    /// </summary>
    /// <param name="name">The name.</param>
    /// <returns></returns>
    private static string MakeValidFileName(string name)
    {
        const string BAD_FILENAME_CHARS = "\\/:*?\"<>|";
        if (!string.IsNullOrEmpty(name))
        {
            char[] badChars = BAD_FILENAME_CHARS.ToCharArray();
            char[] nameChars = name.ToCharArray();
            int i = 0;
            bool bModified = false;
            foreach (char chName in nameChars)
            {
                foreach (char chBad in badChars)
                {
                    if (chName.Equals(chBad))
                    {
                        nameChars[i] = '_';
                        bModified = true;
                        break;
                    }
                }
                i++;
            }
            if (bModified)
            {
                return new string(nameChars);
            }
        }
        return name;
    }

    /// <summary>
    /// Determines if the client browser is Mozilla.
    /// </summary>
    /// <returns>
    /// 	<c>true</c> if the client browser is Mozilla; otherwise, <c>false</c>.
    /// </returns>
    private bool IsMozilla()
    {
        string strUpperUserAgent = Request.UserAgent;
        if (!string.IsNullOrEmpty(strUpperUserAgent))
        {
            return ((strUpperUserAgent.Contains("MOZILLA")).Equals(true) &&
                    (strUpperUserAgent.Contains("COMPATIBLE;")).Equals(false));
        }
        return false;
    }

    /// <summary>
    /// Determines if the client browser is IE.
    /// </summary>
    /// <returns>
    /// 	<c>true</c> if the client browser is IE; otherwise, <c>false</c>.
    /// </returns>
    private bool IsIE()
    {
        return Request.Browser.Browser.ToUpper().Equals("IE");
    }

    /// <summary>
    /// Determines if the client browser is Firefox.
    /// </summary>
    /// <returns>
    /// 	<c>true</c> if the client browser is Firefox; otherwise, <c>false</c>.
    /// </returns>
    private bool IsFirefox()
    {
        return Request.Browser.Browser.ToUpper().Equals("FIREFOX");
    }

    /// <summary>
    /// Gets the MIME from reg.
    /// </summary>
    /// <param name="aExt">A ext.</param>
    /// <returns></returns>
    protected static String GetMIMEFromReg(String aExt)
    {
        string result = "";
        RegistryKey rootkey = Registry.ClassesRoot.OpenSubKey(aExt, false);
        if (rootkey != null)
        {
            object key = rootkey.GetValue("Content Type");
            if (key != null)
                result = key.ToString();
            if (result == "")
            {
                switch (aExt)
                {
                    case ".xslx":
                        result = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        break;
                    case ".docm":
                        result = "application/vnd.ms-word.document.macroEnabled.12";
                        break;
                    case ".docx":
                        result = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        break;
                    case ".dotm":
                        result = "application/vnd.ms-word.template.macroEnabled.12";
                        break;
                    case ".dotx":
                        result = "application/vnd.openxmlformats-officedocument.wordprocessingml.template";
                        break;
                    case ".ppsm":
                        result = "application/vnd.ms-powerpoint.slideshow.macroEnabled.12";
                        break;
                    case ".ppsx":
                        result = "application/vnd.openxmlformats-officedocument.presentationml.slideshow";
                        break;
                    case ".pptm":
                        result = "application/vnd.ms-powerpoint.presentation.macroEnabled.12";
                        break;
                    case ".pptx":
                        result = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                        break;
                    case ".xlsb":
                        result = "application/vnd.ms-excel.sheet.binary.macroEnabled.12";
                        break;
                    case ".xlsm":
                        result = "application/vnd.ms-excel.sheet.macroEnabled.12";
                        break;
                    case ".xlsx":
                        result = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        break;
                    case ".xps":
                        result = "application/vnd.ms-xpsdocument";
                        break;
                    default:
                        result = "application/octet-stream";
                        break;
                }
            }
        }
        return result;
    }
}