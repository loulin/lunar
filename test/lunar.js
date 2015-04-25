var lunar = require('../');
var expect = require('chai').expect;

describe('Lunar Converter', function() {

  var dates = [
    [new Date(2015, 1, 19), [2015, 0, 1, false], '农历乙未年正月初一'],
    [new Date(2015, 1, 18), [2014, 11, 30, false], '农历甲午年腊月三十'],
    [new Date(2014, 9, 24), [2014, 8, 1, true], '农历甲午年闰九月初一'],
    [new Date(2014, 8, 24), [2014, 8, 1, false], '农历甲午年九月初一'],
    [new Date(1985, 0, 19), [1984, 10, 29, false], '农历甲子年冬月廿九']
  ];

  it('should convert solar date to lunar date', function() {
    dates.forEach(function(date) {
      var lunarDate = lunar(date[0]);
      expect(lunarDate.toJSON({
        type: 'array'
      })).to.eql(date[1]);
      expect(lunarDate.toString()).to.equal(date[2]);
    });
  });

  it('should convert lunar date to solar date', function() {
    dates.forEach(function(date) {
      expect(lunar(date[1]).toDate()).to.eql(date[0]);
    });
  });
});
