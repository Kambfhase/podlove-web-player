var assert = require('assert');

function processChapterStart(timeString) {
    var reg = /^((\d?\d):)?([0-5]\d):([0-5]\d)\.(\d{3})$/;
    if (!timeString.match(reg)) return -1;
    var matches = reg.exec(timeString)
        , parsedMatches = matches.map(function (a) { return parseInt(a,10); })
        , withoutHours = isNaN(parsedMatches[2])
        , hours = withoutHours ? 0 : parsedMatches[2]
        , minutes = parsedMatches[3]
        , seconds = parsedMatches[4]
        , millis = parsedMatches[5]
        ;

    return ((hours * 60  + minutes) * 60 + seconds) * 1000 + millis;
}

describe('A Visit', function() {
    var assertions = [
        {test:"00:00:00.000", expected: 0},
        {test:"00:00:00.001", expected: 1},
        {test:"00:00:01.000", expected: 1000},
        {test:"00:01:00.000", expected: 60000},
        {test:"01:00:00.000", expected: 3600000},
        {test:"00:00:01.999", expected: 1999},
        {test:"00:00:60.000", expected: -1},
        {test:"00:60:00.000", expected: -1},
        {test:"24:00:00.000", expected: 86400000},
        {test:"1:00:00.000",  expected: 3600000},
        {test:"12:34.567",    expected: 754567},
        {test:"12:34:56.789", expected: 45296789}
    ];

    function testRunner(e) {
        it('converts ' + e.test + ' to ' + e.expected, function() {
            assert.equal(e.expected, processChapterStart(e.test));
        });

    }

    describe('processChapterStart', function() {
        assertions.map(testRunner);
    });
});


