<?xml version="1.0" encoding="utf-8"?>
<project path="" name="SagePlatform" author="Sage Software" version="8.0.0" copyright="" output="$project\sage-platform" source="False" source-dir="$output\source" minify="False" min-dir="$output\docs" doc="False" doc-dir="$output\docs" master="true" master-file="$output\yui-ext.js" zip="true" zip-file="$output\yuo-ext.$version.zip">
  <directory name="sage-platform" />
  <directory name="..\..\..\..\Platform\Client\Web\Libraries" />
  <directory name="..\..\..\..\..\Libraries" />
  <target name="Sage Platform" file="$output\sage-platform.js" debug="True" shorthand="False" shorthand-list="YAHOO.util.Dom.setStyle&#xD;&#xA;YAHOO.util.Dom.getStyle&#xD;&#xA;YAHOO.util.Dom.getRegion&#xD;&#xA;YAHOO.util.Dom.getViewportHeight&#xD;&#xA;YAHOO.util.Dom.getViewportWidth&#xD;&#xA;YAHOO.util.Dom.get&#xD;&#xA;YAHOO.util.Dom.getXY&#xD;&#xA;YAHOO.util.Dom.setXY&#xD;&#xA;YAHOO.util.CustomEvent&#xD;&#xA;YAHOO.util.Event.addListener&#xD;&#xA;YAHOO.util.Event.getEvent&#xD;&#xA;YAHOO.util.Event.getTarget&#xD;&#xA;YAHOO.util.Event.preventDefault&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Event.stopPropagation&#xD;&#xA;YAHOO.util.Event.stopEvent&#xD;&#xA;YAHOO.util.Anim&#xD;&#xA;YAHOO.util.Motion&#xD;&#xA;YAHOO.util.Connect.asyncRequest&#xD;&#xA;YAHOO.util.Connect.setForm&#xD;&#xA;YAHOO.util.Dom&#xD;&#xA;YAHOO.util.Event">
    <include name="sage-platform\sage-platform-servicecontainer.js" />
    <include name="sage-platform\gears_init.js" />
    <include name="sage-platform\sage-platform-maincontentworkspace.js" />
    <include name="sage-platform\sage-platform-standardworkspace.js" />
    <include name="sage-platform\sage-platform-tabworkspace.js" />
    <include name="sage-platform\sage-platform-objectconnectionservice.js" />
    <include name="sage-platform\sage-platform-integrationcontractservice.js" />
    <include name="sage-platform\sage-controls-slxgridview.js" />
    <include name="sage-platform\sage-controls-timeline.js" />
    <!-- Third party libs -->
    <include name="..\..\..\..\Platform\Client\Web\Libraries\sdata\Base64.js" />
    <include name="..\..\..\..\Platform\Client\Web\Libraries\sdata\ObjTree.js" />
    <include name="..\..\..\..\Platform\Client\Web\Libraries\sdata\sdata-client.js" />
    <include name="..\..\..\..\Platform\Client\Web\Libraries\Simplate.min.js" />
    <include name="..\..\..\..\..\Libraries\dhtmlxScheduler_v30\codebase\dhtmlxscheduler.js" />
    <include name="..\..\..\..\..\Libraries\dhtmlxScheduler_v30\codebase\ext\dhtmlxscheduler_timeline.js" />
    <include name="FusionCharts.js" />
  </target>
  <file name="sage-platform\sage-platform-servicecontainer.js" />
  <file name="sage-platform\gears_init.js" />
  <file name="sage-platform\sage-platform-maincontentworkspace.js" />
  <file name="sage-platform\sage-platform-standardworkspace.js" />
  <file name="sage-platform\sage-platform-tabworkspace.js" />
  <file name="sage-platform\sage-platform-objectconnectionservice.js" />
  <file name="sage-platform\sage-platform-integrationcontractservice.js" />
  <file name="sage-platform\sage-controls-slxgridview.js" />
  <file name="sage-platform\sage-controls-timeline.js" />
  <!-- Third party libs -->
  <file name="..\..\..\..\Platform\Client\Web\Libraries\sdata\Base64.js" />
  <file name="..\..\..\..\Platform\Client\Web\Libraries\sdata\ObjTree.js" />
  <file name="..\..\..\..\Platform\Client\Web\Libraries\sdata\sdata-client.js" />
  <file name="..\..\..\..\Platform\Client\Web\Libraries\Simplate.min.js" path="" />
  <file name="..\..\..\..\..\Libraries\dhtmlxScheduler_v30\codebase\dhtmlxscheduler.js" />
  <file name="..\..\..\..\..\Libraries\dhtmlxScheduler_v30\codebase\ext\dhtmlxscheduler_timeline.js" />
  <file name="FusionCharts.js" />
</project>