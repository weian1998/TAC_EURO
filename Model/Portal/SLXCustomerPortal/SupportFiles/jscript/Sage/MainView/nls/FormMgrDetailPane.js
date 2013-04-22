define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            layoutTabText: 'Layout',
            propertiesTabText: 'Properties',
            toolsTabText: 'Tool Bar',
            usageTabText: 'Usage by Pages',
            columnText: 'Column',
            rowText: 'Row',
            fieldNameText: 'Field Name',
            displayNameText: 'Display Name',
            visibleText: 'Visible',
            rowspanText: 'Row Span',
            colspanText: 'Column Span',
            controlTypeText: 'Control Type',
            buttonAlignmentText: 'Button Alignment:',
            rightText: 'Right',
            centerText: 'Center',
            leftText: 'Left',
            helpText: 'Help',
            positionText: 'Position',
            portalText: 'Portal',
            pageText: 'Page',
            entityText: 'Entity',
            workspaceText: 'Target Workspace',
            modeText: 'Show in Mode',
            rolesText: 'Role Access'
        }
    };
    return lang.mixin(LanguageList, nls);
});