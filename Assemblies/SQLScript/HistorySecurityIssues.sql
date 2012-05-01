Select * from sysdba.SECTABLEDEFS 
WHERE TABLENAME = 'HISTORY'

--SELECT * FROM sysdba.RESYNCTABLEDEFS 
--WHERE TABLENAME = 'HISTORY'

--Update sysdba.RESYNCTABLEDEFS set secure = 'T'where tablename = 'HISTORY'

--uPDATE sysdba.SECTABLEDEFS 
--sET FIELDOFFSET = FIELDINDEX 
--WHERE TABLENAME = 'HISTORY'

Select * from sysdba.userinfo
order by username
-- 'Bruno UEUROA000004
select * from sysdba.SECCODE 
-- President Team FEUROA00002B

Select * from sysdba.ACCOUNT where ACCOUNTMANAGERID = 'UEUROA000004'

Update sysdba.ACCOUNT set SECCODEID = 'FEUROA00002B'
where ACCOUNTMANAGERID = 'UEUROA000004'

Update sysdba.CONTACT
SET     SECCODEID = sysdba.ACCOUNT.SECCODEID
FROM         sysdba.CONTACT INNER JOIN
                      sysdba.ACCOUNT ON sysdba.CONTACT.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
                      
Update sysdba.OPPORTUNITY
SeT     SECCODEID= sysdba.ACCOUNT.SECCODEID 
FROM         sysdba.OPPORTUNITY INNER JOIN
                      sysdba.ACCOUNT ON sysdba.OPPORTUNITY.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID     

Update sysdba.HISTORY                      
SET     SECCODEID =  sysdba.ACCOUNT.SECCODEID 
FROM         sysdba.HISTORY INNER JOIN
                      sysdba.ACCOUNT ON sysdba.HISTORY.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID                                  



Update sysdba.HISTORY
SELECT     sysdba.HISTORY.SECCODEID, sysdba.ACCOUNT.SECCODEID AS Expr1
FROM         sysdba.HISTORY INNER JOIN
                      sysdba.ACCOUNT ON sysdba.HISTORY.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
WHERE     (sysdba.HISTORY.SECCODEID = 'SYST00000001')


delete from sysdba.HISTORY 
where HISTORYID  in (
SELECT     sysdba.HISTORY.HISTORYID
FROM         sysdba.HISTORY INNER JOIN
                      sysdba.EMAILARCHIVE ON sysdba.HISTORY.EMAILARCHIVEID = sysdba.EMAILARCHIVE.EMAILARCHIVEID
WHERE     (ISLINKEDHISTORY  = 'F'))

Update sysdba.HISTORY 
SET     SECCODEID= sysdba.ACCOUNT.SECCODEID 
FROM         sysdba.HISTORY INNER JOIN
                      sysdba.ACCOUNT ON sysdba.HISTORY.ACCOUNTID = sysdba.ACCOUNT.ACCOUNTID
WHERE     (sysdba.HISTORY.EMAILARCHIVEID IS NULL)

--Update sysdba.EMAILARCHIVE set ISLINKEDHISTORY = 'F'
 --where ISLINKEDHISTORY  ='T'
 Select COUNT(*) from sysdba.EMAILARCHIVE where ISLINKEDHISTORY ='F'
 
 
 Select * from sysdba.SECCODE 
 where SECCODETYPE = 'G' and LEFT(SECCODEDESC,1) <> 'z' 
