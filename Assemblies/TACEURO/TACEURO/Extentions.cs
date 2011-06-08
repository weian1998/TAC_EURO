using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Sage.Entity.Interfaces;
using Sage.Platform;
using System.Data.OleDb;
using System.Text.RegularExpressions;
using NHibernate;
using Sage.Platform.ChangeManagement;
using Sage.Platform.Security;


namespace TACEURO
{
    public class Extentions
    {
        #region Opportunity Events
        // Example of target method signature
        public static void TACOpportunityOnBeforeUpdate(IOpportunity Opportunity, ISession session)
        {
            ////TAC Code here

            IChangedState state = Opportunity as IChangedState;

            if (state != null)
            {

                PropertyChange chgDeliveryDate = state.GetChangedState().FindPropertyChange("DeliveryDate");
                if (chgDeliveryDate != null)
                {
                    //DateTime oldValue = (DateTime)chgDueDate.OldValue;
                    //DateTime newValue = (DateTime)chgDueDate.NewValue;

                    //Update the Linked Activity if there is one.
                    string StageID = GetField<string>("OPPFULFILSTAGEID", "OPPFULFILSTAGE", "OPPORTUNITYID = '" + Opportunity.Id.ToString() + "'");


                    Sage.Entity.Interfaces.IOppFulFilStage Stage = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IOppFulFilStage>(StageID);
                    if (Stage != null)
                    {
                        foreach (IOppFulFilTask tmpTask in Stage.OppFulFilTasks)
                        {
                            tmpTask.DueDate = Opportunity.DeliveryDate.Value.AddDays(-(double)tmpTask.DaysFromDeliveryDate);
                            tmpTask.Save();
                        }
                    }

                    // do something to compare oldValue with newValue...
                }


            }
        }
        #endregion


        #region Utility
        public static T GetField<T>(string Field, string Table, string Where)
        {
            string sql = string.Format("select {0} from {1} where {2}", Field, Table, (Where.Equals(string.Empty) ? "1=1" : Where));

            //get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (OleDbCommand cmd = new OleDbCommand(sql, conn))
                {
                    object fieldval = cmd.ExecuteScalar();
                    return fieldval == DBNull.Value ? default(T) : (T)fieldval;
                }
            }
        }
        private static DateTime Timelessize(DateTime dt)
        {
            DateTime timelessized = new DateTime(dt.Year, dt.Month, dt.Day, 00, 00, 05);
            return timelessized;
        }
        public static string Left(string text, int length)
        {
            if (text != null)
            {

                if (length < 0)
                    throw new ArgumentOutOfRangeException("length", length, "length must be > 0");
                else if (length == 0 || text.Length == 0)
                    return "";
                else if (text.Length <= length)
                    return text;
                else
                    return text.Substring(0, length);
            }
            else
            { 
                //Null String entered
                return string.Empty;
            }
        }
        #endregion


        #region Tasks and Activity Entity Events

        


        // Example of target method signature
        public static void OnAfterInsert(IOppFulFilTask oppfulfiltask)
        {
            //TAC Code Here to Create the Linked Activity.
            // Create Activity Record
            Sage.Entity.Interfaces.IActivity todo = Sage.Platform.EntityFactory.Create<Sage.Entity.Interfaces.IActivity>();
            todo.AccountId = oppfulfiltask.Opportunity.Account.Id.ToString();
            todo.AccountName = oppfulfiltask.Opportunity.Account.AccountName;
            todo.OpportunityId = oppfulfiltask.Opportunity.Id.ToString();
            todo.OpportunityName = oppfulfiltask.Opportunity.Description;
            //todo.ContactId = histContactID;
            //todo.ContactName = histContactName;
            todo.Type = ActivityType.atToDo;
            //todo.Category = histCategory;
            todo.UserId = oppfulfiltask.Opportunity.AccountManager.Id.ToString();

            todo.Duration = 15;
            todo.StartDate = (System.DateTime)oppfulfiltask.DueDate;
            //todo.OriginalDate = histArchiveDate;
            //todo.CompletedDate = histArchiveDate;
            //todo.CompletedUser = UserID;
            todo.AlarmTime = oppfulfiltask.DueDate.Value.AddMinutes(-15);
            todo.Timeless = true;
            //todo.Result = "Complete";
            String Description = "Stage: " + oppfulfiltask.OppFulFilStage.Description + " :Task: " + oppfulfiltask.Description;
            todo.Description = Left(Description, 64);
            todo.LongNotes = oppfulfiltask.Notes;
            todo.Notes = Left(oppfulfiltask.Notes,255);
            todo.FulfilmentTaskID = oppfulfiltask.Id.ToString();

            try
            {
                todo.Save();

            }
            catch (Exception)
            {

                //Exception But Continue
            }


        }

        // Example of target method signature
        public static void OnBeforeUpdate(IOppFulFilTask OppFulFilTask, ISession session)
        {
            ////TAC Code here
            
            IChangedState state = OppFulFilTask as IChangedState;

            if (state != null)
            {

                PropertyChange chgDueDate = state.GetChangedState().FindPropertyChange("DueDate");
                if (chgDueDate != null)
                {
                    //DateTime oldValue = (DateTime)chgDueDate.OldValue;
                    //DateTime newValue = (DateTime)chgDueDate.NewValue;
                    OppFulFilTask.DueDate = Timelessize ((DateTime )OppFulFilTask.DueDate );
                    //Update the Linked Activity if there is one.
                    string ToDoID = GetField<string>("ACTIVITYID", "ACTIVITY", "FULFILMENTTASKID = '" + OppFulFilTask.Id.ToString() + "'");


                    Sage.Entity.Interfaces.IActivity ToDo = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IActivity>(ToDoID);
                    if (ToDo != null)
                    {
                        if (ToDo.StartDate != OppFulFilTask.DueDate )
                        {
                            // Set the Linked Activity Start Date If it exists.

                            ToDo.StartDate = (DateTime)OppFulFilTask.DueDate;
                            ToDo.AlarmTime = (DateTime)OppFulFilTask.DueDate;
                            ToDo.Save();
                        }
                    }

                    // do something to compare oldValue with newValue...
                }

            }

        }


        public static void CompleteLinkedOppFulfilTask(IActivity activity, string userId, string result, string resultCode, DateTime completeDate, ref IHistory hresult)
        {
            Sage.Entity.Interfaces.IOppFulFilTask Task = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IOppFulFilTask>(activity.FulfilmentTaskID);
            if (Task != null)
            {
                if (Task.Completed  != "T")
                {
                    // Complete the Linked Activity.
                    Task.CompleteTask();
                    Task.Save();
                }
            }

        }
        // Example of target method signature
        public static void TACOnBeforeUpdate(IActivity Activity, ISession session)
        {
            ////TAC Code here
            IChangedState state = Activity as IChangedState;

            if (state != null)
            {

                PropertyChange chgDueDate = state.GetChangedState().FindPropertyChange("StartDate");
                if (chgDueDate != null)
                {
                    DateTime oldValue = (DateTime)chgDueDate.OldValue;
                    DateTime newValue = (DateTime)chgDueDate.NewValue;

                    //Update the Linked Task if there is one.



                    Sage.Entity.Interfaces.IOppFulFilTask  Task = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IOppFulFilTask>(Activity.FulfilmentTaskID);
                    if (Task != null)
                    {
                        if (Task.DueDate  != newValue)
                        {
                            // Set the Linked Activity Start Date If it exists.
                            Task.DueDate  = newValue;
                            
                            Task.Save();
                        }
                    }

                    // do something to compare oldValue with newValue...
                }

            }

        }


        #endregion

        

        #region Task Stage Complete Methods
        // Example of target method signature
        public static void CompleteTask(IOppFulFilTask oppfulfiltask)
        {
            if (oppfulfiltask.Completed == "T")
            {
                //Do Nothing because the Task is Allready Completed
            }
            else
            {
                Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
                Sage.Entity.Interfaces.IUser user = usersvc.GetUser();
                //Custom Code Here
                oppfulfiltask.Completed = "T";
                oppfulfiltask.CompletedBy = user.Id.ToString();
                oppfulfiltask.CompletedDate = System.DateTime.Now.ToUniversalTime();
                oppfulfiltask.Status = "Completed";
               
                // complete corresponding Activity if needed
                //Update the Linked Activity if there is one.
                string ToDoID = GetField<string>("ACTIVITYID", "ACTIVITY", "FULFILMENTTASKID = '" + oppfulfiltask.Id.ToString() + "'");
                Sage.Entity.Interfaces.IActivity ToDo = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IActivity>(ToDoID);
                if (ToDo != null)
                {

                    ToDo.Complete(user.Id.ToString(), "Complete", "", (DateTime)oppfulfiltask.CompletedDate);
                }
            }

            //=========================================================
            // Complete Activiy (ToDo) that May be linked to this Task
            //=========================================================


        }
        // Example of target method signature
        public static void CompleteStage(IOppFulFilStage oppfulfilstage)
        {
            //Custom Code Here
        }
        #endregion


        #region ReProcess Email Archives

        public static void PurgeEmailArchives(IEmailArchive emailarchive, String ReprocessNoteCondition)
        {
            String EmailArchiveID = String.Empty;
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select *  from EMAILARCHIVE where ISLINKEDHISTORY = 'F' AND REPROCESSNOTE ='" + ReprocessNoteCondition + "'", conn))
                {
                    OleDbDataReader reader = cmd.ExecuteReader();
                    //loop through the reader
                    while (reader.Read())
                    {
                        EmailArchiveID = reader["EMAILARCHIVEID"].ToString();
                        Sage.Entity.Interfaces.IEmailArchive _entity = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IEmailArchive>(EmailArchiveID);
                        _entity.Delete();
                        
                    }
                    reader.Close();
                }
            }

        }

        public static void ReprocessContactEmails(IEmailArchive emailarchive)
        {
            String   UserName = String.Empty ;
            String  UserID = String.Empty ;
            String   ContactID = String.Empty;
            String ContactName = String.Empty;
            String AccountID = String.Empty;
            String AccountName = String.Empty;
            String ContactType = String.Empty;

            if (IsUserFound(emailarchive.ToAddress.ToString(), out UserName, out UserID))
            {
                if (IsContactFound(emailarchive.FromAddress.ToString(), out ContactID, out ContactName, out AccountID, out AccountName, out ContactType))
                {
                    // ReProcess by Email Address 
                    EmailArchiveProcess("Email", "", emailarchive.FromAddress.ToString());
                }
            }
            else
            {
                if (IsUserFound(emailarchive.FromAddress.ToString(), out UserName, out UserID))
                {
                    if (IsContactFound(emailarchive.ToAddress.ToString(), out ContactID, out ContactName, out AccountID, out AccountName, out ContactType))
                    {
                        // ReProcess by Email Address 
                        EmailArchiveProcess("Email", "", emailarchive.ToAddress.ToString());
                    }
                }
            }


        }

        private static bool IsUserFound(string p, string UserName, string UserID)
        {
            throw new NotImplementedException();
        }
        // Example of target method signature
        public static void ReProcess(IEmailArchive emailarchive, out String result)
        {
            EmailArchiveProcess("ALL", "","");
            result = "Completed Message";
        }
        // Example of target method signature
        public static void ReprocessSingle(IEmailArchive emailarchive)
        {
            EmailArchiveProcess("Single", emailarchive.Id.ToString(),"");
        }



        private static void EmailArchiveProcess(String Type, String Value,String EmailAddress)
        {
            //====================================
            // Variables
            //====================================
            String EmailArchiveID = String.Empty;
            String UserID = String.Empty;
            String UserName = String.Empty;
            Boolean blnIsUserFoundinFrom = false;
            Boolean blnIsUserFoundinTo = false;

            String histContactID = String.Empty;
            String histAccountID = String.Empty;
            String histContactName = String.Empty;
            String histAccountName = String.Empty;
            String histContactType = String.Empty;
            String histCategory = String.Empty;
            String histSeccodeID = String.Empty;
            String histLongNotes = String.Empty;
            String histNotes = String.Empty;
            String histDescription = String.Empty;
            int i = 0;
            DateTime histArchiveDate = DateTime.Now;
            String ReProcessNote = String.Empty;
            String SQL = String.Empty;

            //Get All Email That do not have an Email Address in the Exclude and are not History Linked
            // get the DataService to get a connection string to the database
            switch (Type)
            {
                case "Single":
                    SQL = "SELECT     EMAILARCHIVEID, CREATEUSER, CREATEDATE, MODIFYUSER, MODIFYDATE, FROMADDRESS, TOADDRESS, MESSAGEBODY, SUBJECT, " +
                          "                      ISLINKEDHISTORY, ORIGTOADDRESS, ORIGFROMADDRESS, SHORTNOTES, REPROCESSNOTE" +
                          " FROM         sysdba.EMAILARCHIVE" +
                          " WHERE     (TOADDRESS NOT IN " +
                          "             (SELECT     EMAILADDRESS " +
                          "               FROM          sysdba.EMAILEXCLUDELIST)) AND (FROMADDRESS NOT IN" +
                          "             (SELECT     EMAILADDRESS" +
                          "  FROM          sysdba.EMAILEXCLUDELIST AS EMAILEXCLUDELIST_1)) AND (EMAILARCHIVEID = '" + Value + "')";

                    break;
                case "ALL":
                    SQL = "Select * from EMAILARCHIVE  where ISLINKEDHISTORY = 'F' and TOADDRESS not in (Select EMAILADDRESS  from EMAILEXCLUDELIST )and FROMADDRESS  not in (Select EMAILADDRESS  from EMAILEXCLUDELIST )";

                    break;
                case "Email":
                    SQL = "SELECT     EMAILARCHIVEID, CREATEUSER, CREATEDATE, MODIFYUSER, MODIFYDATE, FROMADDRESS, TOADDRESS, MESSAGEBODY, SUBJECT, " +
                          "                      ISLINKEDHISTORY, ORIGTOADDRESS, ORIGFROMADDRESS, SHORTNOTES, REPROCESSNOTE " +
                          " FROM         sysdba.EMAILARCHIVE " +
                          " WHERE     (ISLINKEDHISTORY = 'F') AND (TOADDRESS NOT IN" +
                          "           (SELECT     EMAILADDRESS" +
                          "                FROM          sysdba.EMAILEXCLUDELIST)) AND (FROMADDRESS NOT IN" +
                          "           (SELECT     EMAILADDRESS" +
                          "             FROM          sysdba.EMAILEXCLUDELIST AS EMAILEXCLUDELIST_1))" +
                          " AND (TOADDRESS = '" + EmailAddress + "')" +
                          " OR " +
                          "(FROMADDRESS = '" + EmailAddress + "')";

                    break;
                default:
                    break;
            }


            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand(SQL, conn))
                {
                    OleDbDataReader reader = cmd.ExecuteReader();
                    //loop through the reader
                    while (reader.Read())
                    {
                        blnIsUserFoundinTo = false; // Intialize
                        blnIsUserFoundinFrom = false;
                        EmailArchiveID = reader["EMAILARCHIVEID"].ToString();
                        RemoveHistoryLinkedtoEmailArchive(EmailArchiveID);
                        //===========================================================================
                        // Special Case for Now all Single reprocess will Clear out existing History
                        //===========================================================================

                        histArchiveDate = (DateTime)reader["CREATEDATE"];
                        //===========================================
                        // Check to See if the User Is Found
                        //===========================================
                        if (IsUserFound(reader["FROMADDRESS"].ToString(), out UserName, out UserID))
                        {
                            blnIsUserFoundinFrom = true;
                            histCategory = "EMail Sent";
                            //==================================================================================
                            // Get Contact Information
                            //==================================================================================
                            if (IsContactFound(reader["TOADDRESS"].ToString(), out histContactID, out histContactName, out histAccountID, out histAccountName, out histContactType))
                            {
                                //=========================================================
                                // Set Remaining History record Information
                                //=========================================================
                                histDescription = reader["SUBJECT"].ToString();
                                histLongNotes = reader["MESSAGEBODY"].ToString();
                                histNotes = reader["SHORTNOTES"].ToString();

                                //=====================================
                                // Is Contact Employee
                                //===================================
                                if (histContactType == "EMPL")
                                {
                                    //Get User Private Team
                                    histSeccodeID = GetUserPrivateSeccode(UserID);
                                    CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, histSeccodeID);
                                    UpdateEmailArchiveLinked(EmailArchiveID, "", true);
                                    //======================================================
                                    // Create Accompanying History record Employee Contact
                                    //======================================================

                                    if (IsContactFound(reader["FROMADDRESS"].ToString(), out histContactID, out histContactName, out histAccountID, out histAccountName, out histContactType))
                                    {
                                        histSeccodeID = GetUserPrivateSeccode(UserID);
                                        CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, histSeccodeID);
                                        UpdateEmailArchiveLinked(EmailArchiveID, "", true);
                                    }


                                }
                                else
                                {
                                    // Not an Employee so Default Everyone
                                    histSeccodeID = "SYST00000001";
                                    CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, histSeccodeID);
                                    UpdateEmailArchiveLinked(EmailArchiveID, "", true);
                                }

                            }
                            else
                            {
                                // Contact Not Found
                                ReProcessNote = "Contact Not Found";
                                UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote, false);
                            }
                        }

                        //=======================================================================================
                        // Process Both user in To And From
                        //=======================================================================================
                        if (IsUserFound(reader["TOADDRESS"].ToString(), out UserName, out UserID))
                        {
                            blnIsUserFoundinFrom = true;
                            histCategory = "EMail History Added";
                            //==================================================================================
                            // Get Contact Information
                            //==================================================================================
                            if (IsContactFound(reader["FROMADDRESS"].ToString(), out histContactID, out histContactName, out histAccountID, out histAccountName, out histContactType))
                            {
                                //=========================================================
                                // Set Remaining History record Information
                                //=========================================================
                                histDescription = reader["SUBJECT"].ToString();
                                histLongNotes = reader["MESSAGEBODY"].ToString();
                                histNotes = reader["SHORTNOTES"].ToString();

                                //=====================================
                                // Is Contact Employee
                                //===================================
                                if (histContactType == "EMPL")
                                {
                                    //Get User Private Team
                                    histSeccodeID = GetUserPrivateSeccode(UserID);
                                    CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, histSeccodeID);
                                    UpdateEmailArchiveLinked(EmailArchiveID, "", true);
                                    //======================================================
                                    // Create Accompanying History record Employee Contact
                                    //======================================================

                                    if (IsContactFound(reader["TOADDRESS"].ToString(), out histContactID, out histContactName, out histAccountID, out histAccountName, out histContactType))
                                    {
                                        histSeccodeID = GetUserPrivateSeccode(UserID);
                                        CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, histSeccodeID);
                                        UpdateEmailArchiveLinked(EmailArchiveID, "", true);
                                    }



                                }
                                else
                                {
                                    // Not an Employee so Default Everyone
                                    histSeccodeID = "SYST00000001";
                                    CreateHistoryRecord(histAccountID, histAccountName, histContactID, histContactName, histCategory, UserID, UserName, histArchiveDate, histDescription, histLongNotes, histNotes, EmailArchiveID, histSeccodeID);
                                    UpdateEmailArchiveLinked(EmailArchiveID, "", true);

                                }

                            }
                            else
                            {
                                // Contact Not Found
                                ReProcessNote = "Contact Not Found";
                                UpdateEmailArchiveLinked(EmailArchiveID, ReProcessNote, false);
                            }
                        }




                        i++; // Increment the counter

                    }
                    reader.Close();


                }
            }

            throw new Exception("Completed Reprocess " + i + " Records");


        }
        private static Boolean IsContactEmployee(String contact, out String SeccodeId)
        {
            SeccodeId = "";
            return false;
        }
        private static void CreateHistoryRecord(String histAccountID, String histAccountName,
                                                String histContactID, String histContactName,
                                                String histCategory, String UserID,
                                                String UserName, DateTime histArchiveDate,
                                                String Description,
                                                    String LongNotes, String ShortNotes,
                                                String EmailArchiveID, String SeccodeId)
        {
            // Create History Record
            Sage.Entity.Interfaces.IHistory history = Sage.Platform.EntityFactory.Create<Sage.Entity.Interfaces.IHistory>();
            history.AccountId = histAccountID;
            history.AccountName = histAccountName;
            history.ContactId = histContactID;
            history.ContactName = histContactName;
            history.Type = HistoryType.atEMail;
            history.Category = histCategory;
            history.UserId = UserID;
            history.UserName = UserName;
            history.Duration = 1;
            history.StartDate = histArchiveDate;
            history.OriginalDate = histArchiveDate;
            history.CompletedDate = histArchiveDate;
            history.CompletedUser = UserID;
            history.Timeless = false;
            history.Result = "Complete";
            history.Description = Description;
            history.LongNotes = LongNotes;
            history.Notes = ShortNotes;
            history.EMAILARCHIVEID = EmailArchiveID;
            history.SeccodeId = SeccodeId;
            try
            {
                history.Save();
                UpdateEmailArchiveLinked(EmailArchiveID, String.Empty, true);
            }
            catch (Exception)
            {

                //Exception But Continue
            }
        }


        private static void UpdateEmailArchiveLinked(String EmailArchiveID, String ReProcessNote, Boolean IsLinkedHistory)
        {
            Sage.Entity.Interfaces.IEmailArchive EmailArchive = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IEmailArchive>(EmailArchiveID);
            EmailArchive.IsLinkedHistory = IsLinkedHistory;
            EmailArchive.ReprocessNote = ReProcessNote;
            EmailArchive.Save();
        }

        //public static Boolean IsExcludeEmail(string Emailaddress)
        //{
        //    Boolean returnValue = false; // Initialize
        //    // get the DataService to get a connection string to the database
        //    Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
        //    using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))

        //    {
        //        conn.Open();
        //        using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select * from EMAILEXCLUDELIST where EMAILADDRESS = '" + Emailaddress + "'", conn))
        //        {
        //            object o = cmd.ExecuteScalar () ;
        //            if (o != null) returnValue  = true ; //
        //        }
        //    }

        //    return returnValue;
        //}
        private static Boolean IsUserFound(String Emailaddress, out String UserName, out String UserID)
        {
            Boolean returnValue = false; // Initialize
            UserName = String.Empty;
            UserID = String.Empty;
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select USERID,USERNAME  from USERINFO where EMAIL = '" + Emailaddress + "'", conn))
                {
                    OleDbDataReader reader = cmd.ExecuteReader();
                    //loop through the reader
                    while (reader.Read())
                    {
                        UserID = reader["USERID"].ToString();
                        UserName = reader["USERNAME"].ToString();
                        returnValue = true;
                    }
                    reader.Close();
                }
            }

            return returnValue;
        }
        public static bool IsValidEmail(string strIn)
        {
            // Return true if strIn is in valid e-mail format.
            return Regex.IsMatch(strIn,
                   @"^(?("")("".+?""@)|(([0-9a-zA-Z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-zA-Z])@))" +
                   @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,6}))$");
        }

        private static Boolean IsContactFound(String Emailaddress, out String ContactID, out String ContactName, out String AccountID, out String Account, out String ContactType)
        {
            Boolean returnValue = false; // Initialize
            ContactID = String.Empty;
            ContactName = String.Empty;
            AccountID = String.Empty;
            Account = String.Empty;
            ContactType = String.Empty;
            String SQL = "SELECT     CONTACT.TYPE, CONTACT.ACCOUNTID, CONTACT.ACCOUNT, CONTACT.CONTACTID, " +
                                     "ISNULL(CONTACT.FIRSTNAME, '') + ', ' + ISNULL(CONTACT.LASTNAME, '') AS CNAME" +
                        " FROM         CONTACT LEFT OUTER JOIN" +
                        "                EMAILEXTRA ON CONTACT.CONTACTID = EMAILEXTRA.CONTACTID" +
                        " WHERE     (CONTACT.EMAIL = '" + Emailaddress + "') OR" +
                        "           (CONTACT.SECONDARYEMAIL = '" + Emailaddress + "') OR" +
                        "           (CONTACT.EMAIL3 = '" + Emailaddress + "') OR" +
                        "           (EMAILEXTRA.EMAIL = '" + Emailaddress + "')";
            //"Select TYPE,ACCOUNTID,ACCOUNT,CONTACTID, ISNULL(FIRSTNAME,'') + ', ' + ISNULL(LASTNAME,'') AS CNAME  from CONTACT where EMAIL = '" + Emailaddress + "'";

            //================================================
            // Validate the Email Address
            //================================================
            if (IsValidEmail(Emailaddress))
            {
                //Valid So Continue
            }
            else
            {
                // Invalid
                return false; // Failed
            }
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand(SQL, conn))
                {
                    OleDbDataReader reader = cmd.ExecuteReader();
                    //loop through the reader
                    while (reader.Read())
                    {

                        ContactID = reader["CONTACTID"].ToString();
                        ContactName = reader["CNAME"].ToString();
                        AccountID = reader["ACCOUNTID"].ToString();
                        Account = reader["ACCOUNT"].ToString();
                        ContactType = reader["TYPE"].ToString();

                        returnValue = true;
                    }
                    reader.Close();
                }
            }

            return returnValue;
        }
        private static String GetUserPrivateSeccode(String UserID)
        {
            String returnValue = String.Empty;  // Initialize
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Select PRIVATESECCODEID  from EUROUSERPRIVATEMAP Where USERID = '" + UserID + "'", conn))
                {
                    object o = cmd.ExecuteScalar();
                    if (o != null) returnValue = o.ToString(); //
                }
            }
            if (returnValue == String.Empty)
            {
                // Set Default of Everyone
                returnValue = "SYST00000001";
            }

            return returnValue;
        }
        private static void RemoveHistoryLinkedtoEmailArchive(String EmailArchiveid)
        {
            String returnValue = String.Empty;  // Initialize
            // get the DataService to get a connection string to the database
            Sage.Platform.Data.IDataService datasvc = Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Data.IDataService>();
            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(datasvc.GetConnectionString()))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("Delete from HISTORY where EMAILARCHIVEID ='" + EmailArchiveid + "'", conn))
                {
                    object o = cmd.ExecuteNonQuery();
                    //if (o != null) returnValue = o.ToString(); //
                }
            }


        }
        #endregion
    }


}
