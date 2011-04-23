using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Sage.Entity.Interfaces; 

namespace TACEURO
{
    public class Extentions
       
    {
         // Example of target method signature
        public static void ReProcess(IEmailArchive emailarchive, out String result)
        {

            result = "Completed Message";

        }
    }
}
