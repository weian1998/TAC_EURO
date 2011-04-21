/*
 * SagePlatform
 * Copyright(c) 2009, Sage Software.
 */


if(!window.Sage){Sage={};}
Sage.OnGearsInitialized=[];Sage.installDesktopFeatures=function(){top.location="Libraries/DesktopIntegration/SlxDesktopIntegrationSetup.exe";}
function initGears(){if(window.Sage&&Sage.gears){return;}
var factory=null;if(typeof SageGearsFactory!='undefined'){factory=new SageGearsFactory();}else{try{factory=new ActiveXObject('SageGears.Factory');if(factory.getBuildInfo().indexOf('ie_mobile')!=-1){factory.privateSetGlobalObject(this);}}catch(e){if((typeof navigator.mimeTypes!='undefined')&&navigator.mimeTypes["application/x-googlegears"]){factory=document.createElement("object");factory.style.display="none";factory.width=0;factory.height=0;factory.type="application/x-googlegears";document.documentElement.appendChild(factory);if(factory&&(typeof factory.create=='undefined')){factory=null;}}}}
if(!factory){return;}
if(!Sage.gears){Sage.gears={factory:factory};if(Sage.OnGearsInitialized){for(var i=0;i<Sage.OnGearsInitialized.length;i++){Sage.OnGearsInitialized[i]();}}}}