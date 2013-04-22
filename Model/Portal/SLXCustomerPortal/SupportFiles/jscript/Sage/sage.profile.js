var profile = (function(){
    var testResourceRe = /\/tests\//,
        groupBuilderRe = /Sage\/GroupBuilder\/*./,
        copyOnly = function(filename, mid){
            var list = {
                "Sage/sage.profile":1,
                "Sage/package.json":1,
                "Sage/tests":1,
                "Sage/GroupBuilder":1,
                "Sage/testLoader":1,
                "Sage/runTests.html":1,
                "Sage/Layout/Wizard":1,
                "Sage/UI/Columns/SlxUser":1
            };
            return (mid in list) || /(png|jpg|jpeg|gif|tiff)$/.test(filename) || groupBuilderRe.test(mid);
        };

    return {
        resourceTags:{
            test: function(filename, mid){
                return testResourceRe.test(mid);
            },

            copyOnly: function(filename, mid){
                return copyOnly(filename, mid);
            },

            amd: function(filename, mid){
                return !testResourceRe.test(mid) && !copyOnly(filename, mid) && /\.js$/.test(filename);
            }
            
            //miniExclude: function(filename, mid) {
            //}
        },

        trees:[
            [".", ".", /(\/\.)|(~$)/]
        ]
    };
})();
