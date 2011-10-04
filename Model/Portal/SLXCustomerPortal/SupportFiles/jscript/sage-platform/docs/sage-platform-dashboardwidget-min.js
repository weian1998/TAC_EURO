/*
 * SagePlatform
 * Copyright(c) 2009, Sage Software.
 */


Sage.Analytics.DashboardWidget=Ext.extend(Ext.util.Observable,{constructor:function(options){this.config={};this.config.name=options.name||'';this.config.family=options.family||'';this.config.cell=options.cell;this.config.panel=options.cell.id;this.guid=Sage.Analytics.generateString('wgt');this._options=options||{};this.listeners=options.listeners;this.addEvents({"afterdisplay":true,"persist":true});Sage.Analytics.DashboardWidget.superclass.constructor.call(this,options);},getWidgetDefinition:function(forceEditor){var that=this;$.ajax({type:"GET",url:"slxdata.ashx/slx/crm/-/dashboard/widget",data:{name:this.config.name,family:this.config.family},dataType:"xml",error:function(request,status,error){},success:function(data,status){var res={};if(Ext.isIE){res.html=data.selectSingleNode("Module/Content").text;res.title=data.selectSingleNode("Module/ModulePrefs").attributes.getNamedItem('title').text;}else{res.html=data.evaluate("Module/Content",data,null,XPathResult.ANY_TYPE,null).iterateNext().textContent;res.title=data.evaluate("Module/ModulePrefs",data,null,XPathResult.ANY_TYPE,null).iterateNext().attributes.title.textContent;}
Sage.Analytics.WidgetDefinitions[that.config.name]=Sys.Serialization.JavaScriptSerializer.deserialize(res.html);Sage.Analytics.WidgetDefinitions[that.config.name].title=res.title;that.load(false,(forceEditor===true));}});},init:function(forceEditor){if(!Sage.Analytics.WidgetDefinitions[this.config.name]){this.getWidgetDefinition((forceEditor===true));}else{this.load(false,(forceEditor===true));}},load:function(simple,forceEditor){var panel=Ext.ComponentMgr.get(this.config.panel),$getData;if(simple){return this.definition.html(this.config,panel);}
if(!this.config.loaded||!this.definition.isStatic){if(panel.body){panel.body.dom.innerHTML='<div style="padding:10px;"><div class="loading-indicator">'+
Sage.Analytics.WidgetResource.loading+'</div></div>';}}
if(!this.config.defined&&Sage.Analytics.WidgetDefinitions[this.config.name]){this.config.defined=true;if(this.config.defined&&!this.definition){this.definition=Sage.Analytics.createObject(Sage.Analytics.WidgetDefinitions[this.config.name]);this.editor=this.definition.editor;if(typeof(this.editor)!=='function'){this.editor=function(){this.fireEvent('persist');};}}}
if(!this.definition.isStatic){if((!this._options.datasource)||(forceEditor===true)){this.editor(Sage.Analytics.generateString('dwEditor'));}
if(this._options.datasource){$getData=this.setData();$getData(panel,this.config,this.definition);}}
else{this.setData();if(panel){panel.update(this.definition.html(this.config,panel),false);this.config.loaded=true;panel.setTitle(Sage.Analytics.localize(this.config.title)||'');this.fireEvent("afterdisplay");if(forceEditor===true){this.editor(Sage.Analytics.generateString('dwEditor'));}}}},setData:function(){var self=this;if(this.config.name===''){this.config.name=this.definition.name;}
if(this.config.family===''){this.config.family=this.definition.family;}
var att;for(att in this._options){if(att&&this._options.hasOwnProperty(att)){this.config[att]=this._options[att];}}
if(this.config.datasource){var getData=function(panel,config,def,$resize){$.ajax({dataType:'json',cache:false,url:config.datasource,success:function(data){config.data=data;if(panel){def.html(config,panel);}
self.fireEvent("afterdisplay");},error:function(a,b,c){var markup='<div class="widget-exception">'+
Sage.Analytics.WidgetResource.noData+'</div>';panel.removeAll(true);panel.setTitle('');panel.body.dom.innerHTML='';panel.add({cls:'sage-widget-no-border',html:markup});panel.doLayout();if(panel.getInnerWidth()){panel.body.setStyle('width',panel.getInnerWidth()-2);}}});};return getData;}},refresh:function(simple){this.load(simple);}});