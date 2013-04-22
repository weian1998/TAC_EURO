define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            dangerousValueWarn: 'A potentially dangerous form value was detected.  Please avoid invalid character combinations.'+
            'Example: "&lt;script&gt;&lt;/script&gt;" Also avoid invalid characters in filenames: \\ / : * ? " &lt; &gt; | '
            
        }
    };
    return lang.mixin(LanguageList, nls);
});
