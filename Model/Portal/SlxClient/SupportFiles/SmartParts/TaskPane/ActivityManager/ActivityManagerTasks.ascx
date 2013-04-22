<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ActivityManagerTasks.ascx.cs" Inherits="SmartParts_TaskPane_ActivityManager_Tasks" %>

<div data-dojo-type="Sage.TaskPane.ActivityManagerTasklet" id="primaryTasks" configurationProviderType="Sage.TaskPane.ActivityTaskConfigurationProvider"></div>

<script type="text/javascript">
   require([
       'Sage/TaskPane/ActivityManagerTasklet',
       'Sage/TaskPane/ActivityTaskConfigurationProvider',
       'dojo/on' 
       ], 
       function(
            ActivityManagerTasklet,
            ActivityTaskConfigurationProvider,
            on
        ){
            
       }
   );
      
</script>