# lunar (beta)

公历与农历转换

## Quick Examples

公历转农历
```javascript
var lunar = require('lunar');

var date = lunar(new Date(2014, 9, 24));

console.log(date.toJSON());
console.log(date.toString()); // 农历甲午年闰九月初一
```

农历转公历
```javascript
var lunar = require('lunar');

// 农历甲午年闰九月初一
var date = lunar([2014, 8, 1, true]);

console.log(date.toDate()); // Fri Oct 24 2014 00:00:00 GMT+0800 (CST)
```