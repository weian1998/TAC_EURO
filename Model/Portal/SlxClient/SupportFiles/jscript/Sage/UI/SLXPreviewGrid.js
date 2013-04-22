/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        './SLXPreviewGrid/Grid',
        './SLXPreviewGrid/FilterPanel',
        './SLXPreviewGrid/Filter/DateRange',
        './SLXPreviewGrid/Filter/Text'
],
function (Grid, FilterPanel, DateRange, Text) {
    // Dirty hack because SLXPreviewGrid was not done properly.
    return {
        Grid: Grid,
        FilterPanel: FilterPanel,
        Filter: {
            DateRange: DateRange,
            Text: Text
        }
    };
});
