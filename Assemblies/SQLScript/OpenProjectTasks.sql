Select actualclose,dateopened,DateDiff(d,DateOpened,Isnull(ActualClose,Getdate())) from sysdba.Opportunity

SELECT A1.OPPORTUNITYID, A1.DESCRIPTION,  DateDiff(d,DateOpened,Isnull(ActualClose,Getdate())) + 1 DAYSOPEN3 FROM sysdba.OPPORTUNITY A1 ORDER BY A1.DESCRIPTION ASC, A1.CLOSEPROBABILITY DESC 

Create view sysdba.VOpportunityRemainingTasks
as
SELECT     COUNT(*) AS NumRemainingTasks, OPPORTUNITYID
FROM         sysdba.OPPFULFILTASK
Where completeddate is null
GROUP BY OPPORTUNITYID

Select * from 
sysdba.OPPFULFILSTAGE