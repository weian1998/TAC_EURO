
var testClientContext = function () {
    var testContainsCommonStr = function () {
        if (contextservice.containsKey("userPrettyName")) {
            //it says it contains it... let's verify:
            var val = contextservice.getValue('userPrettyName');
            if (!val) {
                failMsg.push('containsKey said it contained the key - but it did not return a value');
                return false;
            }
            return true;
        }
        return false;
    };

    var testDoesNotContainBogusStr = function () {
        if (contextservice.containsKey('bogusstring')) {
            failMsg.push('containsKey said it contained a bogus string that probably did not exists - should verify: bogusstring');
            return false;
        }
        return true;
    }

    var testReturnsKeys = function () {
        var keys = contextservice.getKeys();
        if (!keys) {
            failMsg.push('getKeys returned falsey');
            return false;
        }
        return true;
    };

    var testCanAdd = function () {
        contextservice.add('foo', 'bar');
        if (!contextservice.containsKey('foo')) {
            failMsg.push('testCanAdd failed - added a key and it says it does not exist');
            return false;
        }
        if (contextservice.getValue('foo') !== 'bar') {
            failMsg.push('testCanAdd failed - added a key and it did not return the correct value');
            return false;
        }
        return true;
    }


    var testsComplete = 0, testsPassed = 0, failMsg = [];
    var contextservice = Sage.Services.getService("ClientContextService");
    if (!contextservice) {
        console.warn('ClientContextService was not available - aborting test');
        return;
    }

    var tests = [];
    tests.push(testContainsCommonStr);
    tests.push(testDoesNotContainBogusStr);
    tests.push(testReturnsKeys);
    tests.push(testCanAdd);

    for (var i = 0; i < tests.length; i++) {
        var passed = tests[i].call();
        if (passed) {
            testsPassed++;
        }
        testsComplete++;
    }

    if (testsPassed < testsComplete) {
        console.warn(dojo.string.substitute('Some ClientContextServices tests failed. \n messages: ${0}', [failMsg.join('\n')]));
    } else {
        console.log(dojo.string.substitute('ClientContextService tests finished completed: ${0} tests and passed: ${1} ', [testsComplete, testsPassed]));
    }
}

