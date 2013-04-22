/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Dashboard/BaseWidget',
    'Sage/Utility',
    'dojo/i18n',
    'dojo/_base/declare',
    'dojo/i18n!./nls/WidgetDefinition',
    'dojo/number'
],
function (baseWidget, util, i18n, declare) {
    //dojo.requireLocalization("Sage.UI.Dashboard", "WidgetDefinition");
    var widget = declare('Sage.UI.Dashboard.ChartingWidget', [baseWidget], {
        _chartTpl: new Simplate([
            '<table border="0" style="width:100%; height:100%">',
              '<tr>',
                '<td id="{%= $.id %}_chart" style="width:{%= $.chartWidth %}"></td>',
                '<td style="display:{%= $.legendDisplay %};font-size:10px;"><div class="dojoxGridScrollbox" style="height:{%= $.chartHeight %};overflow-y:auto;"><span id="{%= $.id %}_legend"></span></div></td>',
              '</tr>',
            '</table>'
        ]),
        _noDataTable: new Simplate([
            '<table border="0" style="width:100%; height:100%">',
              '<tr>',
                '<td>{%= $.NoDataMessage %}</td>',
              '</tr>',
            '</table>'
        ]),
        _baseEditor: function (parentCell, config) {
            // charting classes specific logic here
            var mkup = this._getEditorString(config, parentCell.id);
            // get a doc frag to add listeners to
            var frag = util.fragger(mkup);
            // parse it into a dijit
            var _dijits = util.fragToDijits(frag);
            // add it to the parent cell
            parentCell.addChild(_dijits[0], 0);
            if (parentCell.isNew) {
                parentCell._editorAdded();            
            }
        },
        _getPaneSize: function () {
            // NOTE: this.pane must already be set via html()
            return {
                w: dojo.style(this.pane, 'width'),
                h: dojo.style(this.pane, 'height')
            };
        },
        html: function (parentCell, data) {
            this.paneId = parentCell.id + '_pane';
            this.parentCellId = parentCell.id;
            this.pane = dojo.byId(this.paneId);
            this.chartId = parentCell.id + '_chart';
            this.legendId = parentCell.id + '_legend';
            this.options = parentCell.widgetOptions;
            this.showLegend = this.options.showLegend === 'true';
            this.showLabels = this.options.showLabels === 'true';
            var size = this._getPaneSize();
            this.paneWidth = size.w;
            // set the new height
            var h = Math.floor(size.w * this.prefHeight) + 'px';
            dojo.style(this.pane, 'height', h);
            // do I have data?
            if (data) {
                this.values = [];
                this._labels = [];
                
                if(this.name === 'Pie Chart') {
                    this.cumulativeValues = 0;
                    for(var i = 0; i < data.total_count; i++) {
                        data.items[i].value = Math.max(0, data.items[i].value);
                        this.cumulativeValues += Math.floor(data.items[i].value);
                    }
                }
                
                for (var i = 0; i < data.total_count; i++) {
                    var curr = data.items[i];
                    var fVal = Math.floor(curr.value);
                    var tmp = {};
                    if (this.showLabels) {
                        tmp.text = this.options.truncLabels === 'true' ?
                            this.truncate(curr.displayName,
                                this.options.truncNum || 7) :
                                curr.displayName;
                    }
                    if(this.name === 'Pie Chart') {
                        if(fVal <= 0) {
                            // No slice on the chart
                            continue;
                        }
                        
                        tmp.y = fVal;
                        var percentileVal = 0;
                        if(this.cumulativeValues > 0) {
                            percentileVal = fVal / this.cumulativeValues * 100;
                        }
                        tmp.tooltip = curr.displayName + ', ' + dojo.number.format(percentileVal, {
                            places: 2
                        }) + '%';
                        
                        var formattedValue = fVal;
                        if(formattedValue >= 1000000) {
                            formattedValue = dojo.number.format((formattedValue / 1000000), {places: 1}) + 'M';
                        }
                        else {
                            formattedValue = dojo.number.format(fVal);
                        }
                        
                        tmp.legend = '<label>' + curr.displayName + '</label><label style="float:right; margin-left:10px; margin-top:2px;">' + formattedValue + '</label>'; // Styling here for the value to be on the right
                    }
                    else {
                        var formattedValue = fVal;
                        if(formattedValue >= 1000000) {
                            formattedValue = dojo.number.format((formattedValue / 1000000), {places: 1}) + 'M';
                        }
                        else {
                            formattedValue = dojo.number.format(fVal);
                        }
                        tmp.value = i + 1; // non-zero based
                        tmp.y = fVal;
                        tmp.tooltip = curr.displayName + ', ' + formattedValue;
                    }
                    this._labels.push(tmp);
                    this.values.push(fVal); // Values is really only used for Line Charts now
                }
                
                if(data.total_count > 0) {
                    // put the table for the chart in the portlet
                    parentCell.set('content', this._chartTpl.apply({
                        id: parentCell.id,
                        chartWidth: parentCell.chartWidth,
                        legendDisplay: parentCell.legendDisplay,
                        chartHeight: h
                    }));
                    // assemble and render the chart
                    this._doChart(parentCell, data);
                }
                else {
                    var resources = Sage.UI.DataStore.Dashboard.WidgetResources;
                    dojo.style(this.pane, 'height', '20px');
                    parentCell.set('content', this._noDataTable.apply({
                        NoDataMessage: resources.noDataToDisplay
                    }));
                    this.editor(parentCell);
                }
            }
            else {
                var resources = Sage.UI.DataStore.Dashboard.WidgetResources;
                dojo.style(this.pane, 'height', '20px');
                parentCell.set('content', this._noDataTable.apply({
                    NoDataMessage: resources.noDataToDisplay
                }));
                this.editor(parentCell);
            }
            
            //Set up the footer before we go.
            this._addFooter();
        },
        _addFooter: function () {
            var _widgetDefinitionResource = i18n.getLocalization("Sage.UI.Dashboard", "WidgetDefinition");
            var portletContent = ['#', this.parentCellId, ' .dijitTitlePaneContentOuter'].join('');
            if (this.options.groupname && this.options.resource) {
                var footerHtml = String.format('<div class="dijitTitlePaneTitle" id="{0}" style="border:0;font-weight:normal;">',
                                    this.parentCellId + '_footer');
                
                if(this.options.entity !== 'Sage.Entity.Interfaces.IHistory' &&
                    this.options.groupname && this.options.resource) {
                        footerHtml += String.format('<span style="float:left; margin-top:3px;"><a href="{0}.aspx?modeid=list&gname={1}">{2}</a></span>',
                                this.options.resource,
                                this.options.groupname,
                                _widgetDefinitionResource.viewGroupText || 'View Group');
                }
                
                // DateTime Stamp Region
                footerHtml += '<span style="float:right; margin-top:3px;">' + dojo.date.locale.format(new Date(), {fullYear: true}) + '</span>';
                
                footerHtml += '</div>';

                var footer = dojo.byId(this.parentCellId + '_footer');
                if (!footer) {
                    dojo.place(footerHtml, dojo.query(portletContent)[0], 'last');
                }
                else {
                    dojo.place(footerHtml, footer, 'replace');
                }
            }
        },
        truncate: function (str, n) {
            return str.length > n ? str.slice(0, n) + '...' : str;
        }
    });
    
    return widget;
});
