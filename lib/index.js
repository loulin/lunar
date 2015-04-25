/*!
 * Chinese lunar calendar converter
 * Support date from 1891.01.01 to 2100.12.31
 *
 * @author Lin Lou <lin.lou@hotmail.com>
 * @license MIT
 */

import _ from 'lodash';
import data from './data';

function extract(bin, info) {
  info.map = bin & ((1 << 13) - 1);
  info.day = (bin >> 13) & 31;
  info.month = bin >> 18 & 1;
  info.leapMonth = (bin >> 20) & 15;
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
  let offsetYear = lunarDate.year - 1890 + 26;
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
  let sy = lunarDate._date.getFullYear();
  let sm = lunarDate._date.getMonth();
  let sd = lunarDate._date.getDate();
  let map = data.map;

  let index = sy - data.YEAR_MIN;
  let yearInfo = {};

  lunarDate.year = sy;
  extract(map[index], yearInfo);

  if (sm < yearInfo.month || (sm === yearInfo.month && sd < yearInfo.day)) {
    index = index - 1;
    lunarDate.year = sy - 1;
    extract(map[index], yearInfo);
  }

  let firstDay = new Date(lunarDate.year, yearInfo.month, yearInfo.day);
  let diffDays = (lunarDate._date.getTime() - firstDay.getTime()) / 86400000 >> 0;
  let days = 0;
  let lunarDays = 0;
  let m = 0;

  while (m < 14) {
    lunarDays = (yearInfo.map & 1 << m) ? 30 : 29;
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
  let index = lunarDate.year - data.YEAR_MIN;
  let yearInfo = {};
  let m = 0;
  let days = 0;
  let toMonth = lunarDate.month;

  extract(data.map[index], yearInfo);

  if (yearInfo.hasLeapMonth && (lunarDate.month > yearInfo.leapMonth || (lunarDate.leap && lunarDate.month === yearInfo.leapMonth))) {
    toMonth = toMonth + 1;
  }

  if (!yearInfo.hasLeapMonth || (yearInfo.hasLeapMonth && lunarDate.month !== yearInfo.leapMonth)) {
    lunarDate.leap = false;
  }

  while (m < toMonth) {
    days = days + ((yearInfo.map & 1 << m) ? 30 : 29);
    m = m + 1;
  }

  days = days + lunarDate.day - 1;

  let firstDay = new Date(lunarDate.year, yearInfo.month, yearInfo.day);
  lunarDate._date = new Date(firstDay.getTime() + days * 86400000);
  extend(lunarDate);

  return lunarDate;
}

class Lunar {
  constructor(date) {
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

  convert() {
    return convertSolar(this);
  }

  toDate() {
    return this._date;
  }

  isValid() {
    return !!this._date;
  }

  format(f) {
    if (!this._date) {
      return 'Invalid Date';
    }

    f = f || '农历gYzY年MD';

    return f.replace('gY', data.heavenlyStems[this.gYear])
      .replace('zY', data.earthlyBranches[this.zYear])
      .replace('gM', data.heavenlyStems[this.gMonth])
      .replace('zM', data.earthlyBranches[this.zMonth])
      .replace('gD', data.heavenlyStems[this.gDay])
      .replace('zD', data.earthlyBranches[this.zDay])
      .replace('M', (this.leap ? '闰' : '') + data.monthNames[this.month])
      .replace('D', data.dayNames[this.day]);
  }

  toJSON(options) {
    let _this = this;
    if (options.chinese) {
      _this = {
        year: data.heavenlyStems[this.gYear] + data.earthlyBranches[this.zYear],
        month: data.monthNames[this.month],
        day: data.dayNames[this.day],
        gYear: data.heavenlyStems[this.gYear],
        zYear: data.earthlyBranches[this.zYear],
        /*gMonth: data.heavenlyStems[this.gMonth],
        zMonth: data.earthlyBranches[this.zMonth],
        gDay: data.heavenlyStems[this.gDay],
        zDay: data.earthlyBranches[this.zDay],*/
        animal: data.animals[this.animal],
        leap: this.leap ? '闰' : ''
      };
    }

    if (options.type === 'array') {
      return [_this.year, _this.month, _this.day, _this.leap];
    }

    return _.pick(_this, ['year', 'month', 'day', 'leap', 'gYear', 'zYear', /*'gMonth', 'zMonth', 'gDay', 'zDay',*/ 'animal']);
  }

  toString() {
    return this.format();
  }
}

let lunar = function(date) {
  if (!date) {
    date = new Date();
  } else if (date instanceof Date || date instanceof Array || date instanceof Object) {
    date = date;
  } else {
    throw new Error('date parameter must be Date/Array/Object');
  }

  return new Lunar(date);
};

export default lunar;
