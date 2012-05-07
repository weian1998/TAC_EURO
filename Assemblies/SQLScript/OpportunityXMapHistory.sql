Update sysdba.Opportunity
SET     SECCODEID = sysdba.EUROXHISTORYMAPPING.XHISTORYSECCODEID
FROM         sysdba.OPPORTUNITY INNER JOIN
                      sysdba.ACCOUNT ON sysdba.OPPORTUNITY.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID INNER JOIN
                      sysdba.EUROXHISTORYMAPPING ON sysdba.ACCOUNT.SECCODEID = sysdba.EUROXHISTORYMAPPING.MAINACCOUNTSECCODEID