 Sage.namespace("Sage.UI.Forms");
    Sage.UI.Forms.ActivityOptions = {
       _workSpace:{},
       init: function (workSpace) {
         this._workSpace = workSpace;
       },
      
       togglePastDue: function(){
           var pastDue = dojo.byId(this._workSpace.chkPastDueID);
          
       },

       toggleAutoRolloverMeeting: function(){
           var timeless = dojo.byId(this._workSpace.chkTimelessMeetingID);
           var rollover = dojo.byId(this._workSpace.chkRolloverMeetingID);
           rollover.disabled = !timeless.checked;
       },

       toggleAutoRolloverPhoneCall: function(){
           var timeless = dojo.byId(this._workSpace.chkTimelessPhoneCallID);
           var rollover = dojo.byId(this._workSpace.chkRolloverPhoneCallID);
           rollover.disabled = !timeless.checked;;
       },

       toggleAutoRolloverToDo: function(){
           var timeless = dojo.byId(this._workSpace.chkTimelessToDoID);
           var rollover = dojo.byId(this._workSpace.chkRolloverToDoID);
           rollover.disabled = !timeless.checked;;
       },
       
       toggleAutoRolloverPersonal: function(){
           var timeless = dojo.byId(this._workSpace.chkTimelessPersonalID);
           var rollover = dojo.byId(this._workSpace.chkRolloverPersonalID);
           rollover.disabled = !timeless.checked;;
       }
   
    };