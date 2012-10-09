using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;
using Sage.Entity.Interfaces;
using NHibernate;
using System.Data.OleDb;


namespace TACEURO
{
    public class Ticket
    {
        public static void EuroGetTicketOriginatorTeam(ITicket ticket, out String result)
        {

            //Get Current user
            Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
            if (currentuser.Id.ToString() == "ADMIN       ")
            {
                //Set it to the default Assigned to
                result = GetField<string>("ASSIGNEDTOID", "EUROTICKETDEFAULTS", "");
            }
            else
            {
                //Not the Admin User
                result = Extentions.GetField<string>("ORIGINATORSECCODEID", "EUROXTICKETMAPPING", "USERID = '" + currentuser.Id.ToString() + "'");
                if (result == string.Empty)
                {
                    //Set it to the default Assigned to as there is no Origniator Team to be found.
                    result = GetField<string>("ASSIGNEDTOID", "EUROTICKETDEFAULTS", "");
                }



            }

        }

        public static void EuroGetTicketITCompanyId(ITicket ticket, out String result)
        {

            //Get the Default IT Company Accountid
            result = GetField<string>("ITACCOUNTID", "EUROTICKETDEFAULTS", "");

        }
        public static void EuroGetTicketITContactId(ITicket ticket, out String result)
        {
            //Get the Default IT Contactid
            result = GetField<string>("ITCONTACTID", "EUROTICKETDEFAULTS", "");
        }

        public static void EuroGetTicketDefaultArea(ITicket ticket, out String result)
        {
            //Get the Default Area
            result = GetField<string>("AREA", "EUROTICKETDEFAULTS", "");
        }
        public static void EuroGetTicketDefaultTicketLevel(ITicket ticket, out String result)
        {
            //Get the Default ITTICKETLEVEL
            result = GetField<string>("ITTICKETLEVEL", "EUROTICKETDEFAULTS", "");
        }


        public static void EuroGetTicketAssignedtoid(ITicket ticket, out String result)
        {
            //Get the Default ITTICKETLEVEL
            result = GetField<string>("ASSIGNEDTOID", "EUROTICKETDEFAULTS", "");
        }

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
        public static void EuroOnAfterTicketInsert(ITicket ticket)
        {
            string result;
            //Get Current user
            Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
            if (currentuser.Id.ToString() == "ADMIN       ")
            {
                //Set it to the default Assigned to
                result = GetField<string>("ASSIGNEDTOID", "EUROTICKETDEFAULTS", "");
            }
            else
            {
                //Not the Admin User
                result = Extentions.GetField<string>("ORIGINATORSECCODEID", "EUROXTICKETMAPPING", "USERID = '" + currentuser.Id.ToString() + "'");
                if (result == string.Empty)
                {
                    //Set it to the default Assigned to as there is no Origniator Team to be found.
                    result = GetField<string>("ASSIGNEDTOID", "EUROTICKETDEFAULTS", "");
                }



            }
            Sage.Entity.Interfaces.IOwner MyOwner = Sage.Platform.EntityFactory.GetById<Sage.Entity.Interfaces.IOwner>(result);
            ticket.Owner = MyOwner;
            ticket.Save();
        }

        public static Boolean IsMember(string TeamName, string Type)
        {
            Boolean blnReturn = false; // Intialize False
            //Get Current user
            Sage.SalesLogix.Security.SLXUserService usersvc = (Sage.SalesLogix.Security.SLXUserService)Sage.Platform.Application.ApplicationContext.Current.Services.Get<Sage.Platform.Security.IUserService>();
            Sage.Entity.Interfaces.IUser currentuser = usersvc.GetUser();
            // get the DataService to get a connection string to the database
            string SQL = "";
            SQL ="select accessid from secrights where seccodeid = " ;
            SQL +=       " (select seccodeid from seccode where (seccodedesc = '" + TeamName  + "') " ;
            SQL += "a nd (seccodetype = '" + Type + "')) and (accessid = '" + currentuser.Id.ToString() + "')";

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
                        if (reader["accessid"].ToString() != string.Empty)
                        {
                            blnReturn = true;
                        }
                       

                    }
                    reader.Close();
                }
            }
            return blnReturn;
        }
    }
}