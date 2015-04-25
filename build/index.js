'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/*!
 * Chinese lunar calendar converter
 * Support date from 1891.01.01 to 2100.12.31
 *
 * @author Lin Lou <lin.lou@hotmail.com>
 * @license MIT
 */

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _data = require('./data');

var _data2 = _interopRequireWildcard(_data);

function extract(bin, info) {
  info.map = bin & (1 << 13) - 1;
  info.day = bin >> 13 & 31;
  info.month = bin >> 18 & 1;
  info.leapMonth = bin >> 20 & 15;
  info.hasLeapMonth = !!(bin & 1 << 19);
}

/* // not accurate, don't use
function getSolarPeriods(date) {
  let periods = [];
  let diffTime = 31556925974.7 * (date.getFullYear() - 1890) + new Date(1890, 0, 5, 16, 2, 31).getTime();
  for (let index = 0; index < 24; index = index + 1) {
    let newDate = new Date(diffTime + data.solarPeriodsMap[index] * 60000);
    periods[(index + 22) % 24] = newDate;
  }

  return periods;
}
*/

function extend(lunarDate) {
  var offsetYear = lunarDate.year - 1890 + 26;
  /*
  let date = lunarDate._date;
  let offsetMonth = (date.getFullYear() - 1890) * 12 + date.getMonth() + 12;
  let offsetDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000 + 29219 + 18;
  */

  lunarDate.gYear = offsetYear % 10;
  lunarDate.zYear = offsetYear % 12;
  /*
  lunarDate.gMonth = offsetMonth % 10;
  lunarDate.zMonth = offsetMonth % 12;
  lunarDate.gDay = offsetDay % 10;
  lunarDate.zDay = offsetDay % 12;
  lunarDate.solarPeriods = getSolarPeriods(date);
  */

  lunarDate.animal = lunarDate.zYear;
  return lunarDate;
}

function convertSolar(lunarDate) {
  var sy = lunarDate._date.getFullYear();
  var sm = lunarDate._date.getMonth();
  var sd = lunarDate._date.getDate();
  var map = _data2['default'].map;

  var index = sy - _data2['default'].YEAR_MIN;
  var yearInfo = {};

  lunarDate.year = sy;
  extract(map[index], yearInfo);

  if (sm < yearInfo.month || sm === yearInfo.month && sd < yearInfo.day) {
    index = index - 1;
    lunarDate.year = sy - 1;
    extract(map[index], yearInfo);
  }

  var firstDay = new Date(lunarDate.year, yearInfo.month, yearInfo.day);
  var diffDays = (lunarDate._date.getTime() - firstDay.getTime()) / 86400000 >> 0;
  var days = 0;
  var lunarDays = 0;
  var m = 0;

  while (m < 14) {
    lunarDays = yearInfo.map & 1 << m ? 30 : 29;
    days = days + lunarDays;
    if (diffDays < days) {
      lunarDate.day = lunarDays - (days - diffDays) + 1;
      break;
    }

    m = m + 1;
  }

  lunarDate.leap = false;
  if (yearInfo.hasLeapMonth) {
    if (m === yearInfo.leapMonth + 1) {
      lunarDate.leap = true;
    }

    if (m > yearInfo.leapMonth) {
      m = m - 1;
    }
  }

  lunarDate.month = m;
  extend(lunarDate);

  return lunarDate;
}

function convertLunar(lunarDate) {
  var index = lunarDate.year - _data2['default'].YEAR_MIN;
  var yearInfo = {};
  var m = 0;
  var days = 0;
  var toMonth = lunarDate.month;

  extract(_data2['default'].map[index], yearInfo);

  if (yearInfo.hasLeapMonth && (lunarDate.month > yearInfo.leapMonth || lunarDate.leap && lunarDate.month === yearInfo.leapMonth)) {
    toMonth = toMonth + 1;
  }

  if (!yearInfo.hasLeapMonth || yearInfo.hasLeapMonth && lunarDate.month !== yearInfo.leapMonth) {
    lunarDate.leap = false;
  }

  while (m < toMonth) {
    days = days + (yearInfo.map & 1 << m ? 30 : 29);
    m = m + 1;
  }

  days = days + lunarDate.day - 1;

  var firstDay = new Date(lunarDate.year, yearInfo.month, yearInfo.day);
  lunarDate._date = new Date(firstDay.getTime() + days * 86400000);
  extend(lunarDate);

  return lunarDate;
}

var Lunar = (function () {
  function Lunar(date) {
    _classCallCheck(this, Lunar);

    if (!date) {
      return this;
    }

    if (date instanceof Date) {
      this._date = date;
      convertSolar(this);
    } else {
      if (date instanceof Array) {
        this.year = date[0] >> 0;
        this.month = date[1] >> 0;
        this.day = date[2] >> 0;
        this.leap = !!date[3];
      } else {
        this.year = date.year >> 0;
        this.month = date.month >> 0;
        this.day = date.day >> 0;
        this.leap = !!date.leap;
      }

      convertLunar(this);
    }

    return this;
  }

  _createClass(Lunar, [{
    key: 'convert',
    value: function convert() {
      return convertSolar(this);
    }
  }, {
    key: 'toDate',
    value: function toDate() {
      return this._date;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      return !!this._date;
    }
  }, {
    key: 'format',
    value: function format(f) {
      if (!this._date) {
        return 'Invalid Date';
      }

      f = f || '农历gYzY年MD';

      return f.replace('gY', _data2['default'].heavenlyStems[this.gYear]).replace('zY', _data2['default'].earthlyBranches[this.zYear]).replace('gM', _data2['default'].heavenlyStems[this.gMonth]).replace('zM', _data2['default'].earthlyBranches[this.zMonth]).replace('gD', _data2['default'].heavenlyStems[this.gDay]).replace('zD', _data2['default'].earthlyBranches[this.zDay]).replace('M', (this.leap ? '闰' : '') + _data2['default'].monthNames[this.month]).replace('D', _data2['default'].dayNames[this.day]);
    }
  }, {
    key: 'toJSON',
    value: function toJSON(options) {
      var _this = this;
      if (options.chinese) {
        _this = {
          year: _data2['default'].heavenlyStems[this.gYear] + _data2['default'].earthlyBranches[this.zYear],
          month: _data2['default'].monthNames[this.month],
          day: _data2['default'].dayNames[this.day],
          gYear: _data2['default'].heavenlyStems[this.gYear],
          zYear: _data2['default'].earthlyBranches[this.zYear],
          /*gMonth: data.heavenlyStems[this.gMonth],
          zMonth: data.earthlyBranches[this.zMonth],
          gDay: data.heavenlyStems[this.gDay],
          zDay: data.earthlyBranches[this.zDay],*/
          animal: _data2['default'].animals[this.animal],
          leap: this.leap ? '闰' : ''
        };
      }

      if (options.type === 'array') {
        return [_this.year, _this.month, _this.day, _this.leap];
      }

      return _import2['default'].pick(_this, ['year', 'month', 'day', 'leap', 'gYear', 'zYear', /*'gMonth', 'zMonth', 'gDay', 'zDay',*/'animal']);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.format();
    }
  }]);

  return Lunar;
})();

var lunar = function lunar(date) {
  if (!date) {
    date = new Date();
  } else if (date instanceof Date || date instanceof Array || date instanceof Object) {
    date = date;
  } else {
    throw new Error('date parameter must be Date/Array/Object');
  }

  return new Lunar(date);
};

exports['default'] = lunar;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map