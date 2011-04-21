<?xml version="1.0" encoding="utf-8"?>
<project path="" name="Sage SalesLogix Mail Merge" author="Sage Software" version="7.5.2" copyright="$projectName&#xD;&#xA;Copyright(c) 2010, $author.&#xD;&#xA;&#xD;&#xA;" output="$project\sage-mailmerge" source="False" source-dir="$output\source" minify="False" min-dir="$output\min" doc="False" doc-dir="$output\docs" master="true" master-file="$output\yui-ext.js" zip="true" zip-file="$output\yuo-ext.$version.zip">
  <directory name="jscript" />
  <file name="jscript\sage-mailmerge\sage-mailmerge-service.js" path="" />
  <file name="jscript\sage-mailmerge\sage-mailmerge-context.js" path="" />
  <file name="jscript\sage-mailmerge\sage-mailmerge-test.js" path="" />
  <target name="Sage Mail Merge" file="sage-mailmerge\sage-mailmerge.js" debug="True" shorthand="False" shorthand-list="">
    <include name="sage-mailmerge\sage-mailmerge-service.js" />
    <include name="sage-mailmerge\sage-mailmerge-context.js" />
    <include name="sage-mailmerge\sage-mailmerge-test.js" />
  </target>
  <directory name="" />
  <file name="sage-mailmerge\sage-mailmerge-service.js" path="" />
  <file name="sage-mailmerge\sage-mailmerge-context.js" path="" />
</project>