define([
    'dojo/string'
], function(
    string
) {
    return {
        defaultTarget: 'MCWebHelp',
        defaultTopic: null,
        defaultSubSystem: null,

        defaultUrlFormat: 'help/WebClient_CSH.htm#${0}',
        subSystemUrlFormat: 'help/Subsystems/${1}/${1}_CSH.htm#${0}',

        open: function(topic, subSystem, target) {
            /* only open help at the root level (non-subSystem) */
            var url = Sage.Link.getHelpUrl(topic, subSystem); // subSystem ? this.subSystemUrlFormat : this.defaultUrlFormat;
            window.open(url, target || this.defaultTarget);
        }
    };
});