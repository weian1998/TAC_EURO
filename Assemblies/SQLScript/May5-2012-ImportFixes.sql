--========================================================
-- Import Fixes while Onsite May 5, 2012
--========================================================
                      
Update sysdba.Opportunity                      
SET     ACCOUNTMANAGERID= sysdba.ACCOUNT.ACCOUNTMANAGERID 
FROM         sysdba.OPPORTUNITY INNER JOIN
                      sysdba.ACCOUNT ON sysdba.OPPORTUNITY.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
WHERE     (sysdba.OPPORTUNITY.ACCOUNTMANAGERID NOT IN
                          (SELECT     USERID
                            FROM          sysdba.USERINFO))
                            
Update sysdba.CONTACT 
Set FIRSTNAME = '*'                            
Where FIRSTNAME is null or FIRSTNAME = ''

Update sysdba.CONTACT 
Set LASTNAME = '*'
Where LASTNAME is null or LASTNAME = ''