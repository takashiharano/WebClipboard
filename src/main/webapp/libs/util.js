/*!
 * util.js
 * Copyright 2019 Takashi Harano
 * Released under the MIT license
 * https://github.com/takashiharano/util.js
 */
var util = util || {};
util.v = '202001232152';

util.DFLT_FADE_SPEED = 500;
util.LS_AVAILABLE = false;
util.mouseX = 0;
util.mouseY = 0;

/*\
|*| Polyfill which enables the passage of arbitrary arguments to the
|*| callback functions of JavaScript timers (HTML5 standard syntax).
|*|
|*| https://developer.mozilla.org/en-US/docs/DOM/window.setInterval
|*|
|*| Syntax:
|*| var timeoutID = window.setTimeout(func, delay[, param1, param2, ...]);
|*| var timeoutID = window.setTimeout(code, delay);
|*| var intervalID = window.setInterval(func, delay[, param1, param2, ...]);
|*| var intervalID = window.setInterval(code, delay);
\*/
(function() {
  setTimeout(function(arg1) {
    if (arg1 === 'test') {
      // feature test is passed, no need for polyfill
      return;
    }
    var __nativeST__ = window.setTimeout;
    window.setTimeout = function(vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
      var aArgs = Array.prototype.slice.call(arguments, 2);
      return __nativeST__(vCallback instanceof Function ? function() {
        vCallback.apply(null, aArgs);
      } : vCallback, nDelay);
    };
  }, 0, 'test');

  var interval = setInterval(function(arg1) {
    clearInterval(interval);
    if (arg1 === 'test') {
      // feature test is passed, no need for polyfill
      return;
    }
    var __nativeSI__ = window.setInterval;
    window.setInterval = function(vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
      var aArgs = Array.prototype.slice.call(arguments, 2);
      return __nativeSI__(vCallback instanceof Function ? function() {
        vCallback.apply(null, aArgs);
      } : vCallback, nDelay);
    };
  }, 0, 'test');
}());

//-----------------------------------------------------------------------------
// Date & Time
//-----------------------------------------------------------------------------
util.MINUTE = 60000;
util.HOUR = 3600000;
util.DAY = 86400000;

util.MINUTE_SEC = 60;
util.HOUR_SEC = 3600;
util.DAY_SEC = 86400;

util.SUNDAY = 0;
util.MONDAY = 1;
util.TUESDAY = 2;
util.WEDNESDAY = 3;
util.THURSDAY = 4;
util.FRIDAY = 5;
util.SATURDAY = 6;
util.WDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

util.DateTime = function(dt) {
  if ((dt == undefined) || (dt === '')) {
    dt = new Date();
  } else if (!(dt instanceof Date)) {
    dt = new Date(dt);
  }
  this.timestamp = dt.getTime();
  this.offset = dt.getTimezoneOffset();
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  var day = dt.getDate();
  var hours = dt.getHours();
  var minutes = dt.getMinutes();
  var seconds = dt.getSeconds();
  var milliseconds = dt.getMilliseconds();

  this.year = year;
  this.month = month;
  this.day = day;
  this.hours = hours;
  this.minutes = minutes;
  this.seconds = seconds;
  this.milliseconds = milliseconds;

  this.yyyy = year + '';
  this.mm = ('0' + month).slice(-2);
  this.dd = ('0' + day).slice(-2);
  this.hh = ('0' + hours).slice(-2);
  this.mi = ('0' + minutes).slice(-2);
  this.ss = ('0' + seconds).slice(-2);
  this.sss = ('00' + milliseconds).slice(-3);
  this.wday = dt.getDay(); // Sunday - Saturday : 0 - 6
  this.WDAYS = util.WDAYS;
};
util.DateTime.prototype = {
  setWdays: function(wdays) {
    this.WDAYS = wdays;
  },
  toString: function(fmt) {
    if (!fmt) fmt = '%Y-%M-%D %H:%m:%S.%s';
    var s = fmt;
    s = s.replace(/%Y/, this.yyyy);
    s = s.replace(/%M/, this.mm);
    s = s.replace(/%D/, this.dd);
    s = s.replace(/%W/, this.WDAYS[this.wday]);
    s = s.replace(/%H/, this.hh);
    s = s.replace(/%m/, this.mi);
    s = s.replace(/%S/, this.ss);
    s = s.replace(/%s/, this.sss);
    return s;
  }
};

/**
 * Returns DateTime object
 * dt: timestamp / Date object
 */
util.getDateTime = function(dt) {
  return new util.DateTime(dt);
};

/**
 * Returns current timestamp
 */
util.now = function() {
  return new Date().getTime();
};

/**
 * Returns Date-Time string
 * t: timestamp / Date object
 * fmt: '%Y-%M-%D %H:%m:%S.%s'
 */
util.getDateTimeString = function(t, fmt) {
  var d = util.getDateTime(t);
  return d.toString(fmt);
};
util.getDateTimeStringFromSec = function(s, fmt) {
  var t = util.sec2ms(s);
  return util.getDateTimeString(t, fmt);
};

/**
 * '12:34:56.987' -> DateTime object
 * offset: -1 -> Yesterday
 *          0 -> Today
 *          1 -> Tomorrow
 */
util.getDateTimeFromTime = function(timeString, offset) {
  var ts = util.getTimeStampOfDay(timeString, offset);
  return util.getDateTime(ts);
};

/**
 * '12:34:56.987' -> timestamp(milli sec)
 * offset: -1 -> Yesterday
 *          0 -> Today
 *          1 -> Tomorrow
 */
util.getTimeStampOfDay = function(timeString, offset) {
  var tm = timeString.replace(/:/g, '').replace(/\./, '');
  var hh = tm.substr(0, 2);
  var mi = tm.substr(2, 2);
  var ss = tm.substr(4, 2);
  var sss = tm.substr(6, 3);
  var d = util.getDateTime();
  var d1 = new Date(d.yyyy, (d.mm | 0) - 1, d.dd, hh, mi, ss, sss);
  var ts = d1.getTime();
  if (offset != undefined) {
    ts += (offset * util.DAY);
  }
  return ts;
};

//-----------------------------------------------------------------------------
util.Time = function(t) {
  if (typeof t == 'string') {
    // HH:MI:SS.sss
    var wk = t.split('.');
    var sss = wk[1];
    if (sss) {
      sss = (sss + '000').substr(0, 3);
    }
    wk = wk[0].split(':');
    var hh = wk[0] | 0;
    var mi = wk[1] | 0;
    var ss = wk[2] | 0;
    t = hh * 3600000 + mi * 60000 + ss * 1000 + sss;
  }
  this.time = t;
  var tm = util.ms2struct(t);
  this.sign = tm.sign;
  this.days = tm.d;
  this.hrs = tm.hr;
  this.hours = tm.hh;
  this.minutes = tm.mi;
  this.seconds = tm.ss;
  this.milliseconds = tm.sss;
};
util.Time.prototype = {
  toString: function(fmt) {
    if (!fmt) fmt = '%H:%m:%S.%s';
    var h = this.hours;
    if (h < 10) h = '0' + h;
    var m = ('0' + this.minutes).slice(-2);
    var s = ('0' + this.seconds).slice(-2);
    var ms = ('00' + this.milliseconds).slice(-3);
    var r = fmt;
    r = r.replace(/%H/, h);
    r = r.replace(/%m/, m);
    r = r.replace(/%S/, s);
    r = r.replace(/%s/, ms);
    return r;
  }
};

util.ms2struct = function(ms) {
  var wk = ms;
  var sign = false;
  if (ms < 0) {
    sign = true;
    wk *= (-1);
  }
  var d = (wk / 86400000) | 0;
  var hh = 0;
  if (wk >= 3600000) {
    hh = (wk / 3600000) | 0;
    wk -= (hh * 3600000);
  }
  var mi = 0;
  if (wk >= 60000) {
    mi = (wk / 60000) | 0;
    wk -= (mi * 60000);
  }
  var ss = (wk / 1000) | 0;
  var sss = wk - (ss * 1000);
  var tm = {
    sign: sign,
    d: d,
    hr: hh - d * 24,
    hh: hh,
    mi: mi,
    ss: ss,
    sss: sss
  };
  return tm;
};

/**
 * 123456.789
 * '123456.789'
 * -> 123456789
 */
util.sec2ms = function(sec) {
  return parseFloat(sec) * 1000;
};

/**
 * 1200
 * '1200'
 * -> 1.2
 * -> '1.200' (toString)
 */
util.ms2sec = function(ms, toString) {
  ms += '';
  var len = ms.length;
  var s;
  if (len <= 3) {
    s = '0.' + ('00' + ms).slice(-3);
  } else {
    s = ms.substr(0, len - 3) + '.' + ms.substr(len - 3);
  }
  if (!toString) {
    s = parseFloat(s);
  }
  return s;
};

//------------------------------------------------
// Time calculation
//------------------------------------------------
/**
 * ClockTime Class
 */
util.ClockTime = function(secs, days, integratedSt, clocklikeSt) {
  this.secs = secs;
  this.days = days;
  this.integratedSt = integratedSt;
  this.clocklikeSt = clocklikeSt;
};
util.ClockTime.prototype = {
  // byTheDay=true
  //         '01:00:00.000 (+1 Day)'
  // (HM   ) '01:00'
  // (HMS  ) '01:00:00'
  // (HMSs ) '01:00:00.000'
  // (HMSsD) '01:00:00.000 (+1 Day)'
  //
  // byTheDay=false
  //         '25:00:00.000'
  // (HM   ) '25:00'
  // (HMS  ) '25:00:00'
  // (HMSs ) '25:00:00.000'
  // (HMSsD) '25:00:00.000'
  toString: function(fmt) {
    if (!fmt) fmt = '%H:%m:%S.%s (%d)';
    var byTheDay = fmt.match(/%d/) != null;

    var h = this.toHoursStr(byTheDay);
    var m = this.toMinutesStr(byTheDay);
    var s = this.toSecondsStr(byTheDay);
    var ms = this.toMillisecondsStr(byTheDay);

    if ((this.secs < 0) && !byTheDay) {
      h = '-' + h;
    }

    var r = fmt;
    r = r.replace(/%H/, h);
    r = r.replace(/%m/, m);
    r = r.replace(/%S/, s);
    r = r.replace(/%s/, ms);

    if (byTheDay && (this.days > 0)) {
      var d = this.toDaysStr();
      r = r.replace(/%d/, d);
    }
    return r;
  },

  toDaysStr: function() {
    var days;
    if (this.secs < 0) {
      days = '-';
    } else {
      days = '+';
    }
    days += this.days + ' ' + util.plural('Day', this.days);
    return days;
  },

  toHoursStr: function(byTheDay) {
    var h;
    var hh;
    if (byTheDay === undefined) {
      byTheDay = false;
    }
    if (byTheDay) {
      h = this.clocklikeSt['hours'];
    } else {
      h = this.integratedSt['hrs'];
    }
    if (h < 10) {
      hh = ('0' + h).slice(-2);
    } else {
      hh = h + '';
    }
    return hh;
  },

  toMinutesStr: function(byTheDay) {
    if (byTheDay === undefined) {
      byTheDay = false;
    }
    var st = (byTheDay ? this.clocklikeSt : this.integratedSt);
    return ('0' + st['minutes']).slice(-2);
  },

  toSecondsStr: function(byTheDay) {
    if (byTheDay === undefined) {
      byTheDay = false;
    }
    var st = (byTheDay ? this.clocklikeSt : this.integratedSt);
    return ('0' + st['seconds']).slice(-2);
  },

  toMillisecondsStr: function(byTheDay) {
    if (byTheDay === undefined) {
      byTheDay = false;
    }
    var st = (byTheDay ? this.clocklikeSt : this.integratedSt);
    return ('00' + ((st['milliseconds'] * 1000) | 0)).slice(-3);
  }
};

// Addition
// '12:00' + '01:30' -> '13:30'
// '12:00' + '13:00' -> '01:00 (+1 Day)' / '25:00'
// fmt:
// '10:00:00.000 (+1 Day)'
//  %H:%m:%S.%s (%d)
util.addTimeStr = function(t1, t2, fmt) {
  if (!fmt) fmt = '%H:%m';
  var t = util.addTime(t1, t2);
  return t.toString(fmt);
};

// Add time: Returns ClockTime object
// '12:00' + '01:30' -> '13:30'
// '12:00' + '13:00' -> '01:00 (+1 Day)' / '25:00'
// util.addTime('10:00:00.000', '20:00:00.000').toString('%H:%m');
util.addTime = function(t1, t2) {
  var s1 = util.time2sec(t1);
  var s2 = util.time2sec(t2);
  return util._addTime(s1, s2);
};

util._addTime = function(t1, t2) {
  var totalSecs = t1 + t2;
  var wkSecs = totalSecs;
  var days = 0;
  if (wkSecs >= util.DAY_SEC) {
    days = (wkSecs / util.DAY_SEC) | 0;
    wkSecs -= days * util.DAY_SEC;
  }
  return util._calcTime(totalSecs, wkSecs, days);
};

// Subtraction
// '12:00' - '01:30' -> '10:30'
// '12:00' - '13:00' -> '23:00 (-1 Day)' / '-01:00'
// fmt:
// '10:00:00.000 (-1 Day)'
//  %H:%m:%S.%s (%d)
util.subTimeStr = function(t1, t2, fmt) {
  if (!fmt) fmt = '%H:%m';
  var t = util.subTime(t1, t2);
  return t.toString(fmt);
};

// Sub time: Returns ClockTime object
// '12:00' - '01:30' -> '10:30'
// '12:00' - '13:00' -> '23:00 (-1 Day)' / '-01:00'
// util.subTime('10:00:00.000', '20:00:00.000').toString('%H:%m');
util.subTime = function(t1, t2) {
  var s1 = util.time2sec(t1);
  var s2 = util.time2sec(t2);
  return util._subTime(s1, s2);
};

util._subTime = function(t1, t2) {
  var totalSecs = t1 - t2;
  var wkSecs = totalSecs;
  var days = 0;

  if (wkSecs < 0) {
    wkSecs *= -1;
    days = (wkSecs / util.DAY_SEC) | 0;
    days = days + ((wkSecs % util.DAY_SEC == 0) ? 0 : 1);
    if (t1 != 0) {
      if ((wkSecs % util.DAY_SEC == 0) && (wkSecs != util.DAY_SEC)) {
        days += 1;
      }
    }
    wkSecs = util.DAY_SEC - (wkSecs - days * util.DAY_SEC);
  }

  return util._calcTime(totalSecs, wkSecs, days);
};

// Calc time (convert to struct)
util._calcTime = function(totalSecs, wkSecs, days) {
  var integratedSt = util.sec2struct(totalSecs);
  var clocklikeSt = util.sec2struct(wkSecs);
  var ret = new util.ClockTime(totalSecs, days, integratedSt, clocklikeSt);
  return ret;
};

// '09:00', '10:00' -> -1
// '10:00', '10:00' -> 0
// '10:00', '09:00' -> 1
util.timecmp = function(t1, t2) {
  var s1 = util.time2sec(t1);
  var s2 = util.time2sec(t2);
  var d = s1 - s2;
  if (d == 0) {
    return 0;
  } else if (d < 0) {
    return -1;
  }
  return 1;
};

// timestr: 'HH:MI:SS.sss'
// '01:00'        -> 3600.0
// '01:00:30'     -> 3630.0
// '01:00:30.123' -> 3630.123
// '0100'         -> 3600.0
// '010030'       -> 3630.0
// '010030.123'   -> 3630.123
util.time2sec = function(timestr) {
  var hour = 0;
  var min = 0;
  var sec = 0;
  var msec = 0;
  var s = '0';
  var times;
  var ss;
  var tm;

  if (timestr.match(/:/)) {
    times = timestr.split(':');
    if (times.length == 3) {
      hour = times[0] | 0;
      min = times[1] | 0;
      s = times[2];
    } else if (times.length == 2) {
      hour = times[0] | 0;
      min = times[1] | 0;
    } else {
      return null;
    }
    ss = s.split('.');
    sec = ss[0] | 0;
    if (ss.length >= 2) {
      msec = parseFloat('0.' + ss[1]);
    }
  } else {
    tm = timestr.split('.');
    times = tm[0];
    if (tm.length >= 2) {
      msec = parseFloat('0.' + tm[1]);
    }

    if (times.length == 6) {
      hour = times.substr(0, 2) | 0;
      min = times.substr(2, 2) | 0;
      sec = times.substr(4, 2) | 0;
    } else if (times.length == 4) {
      hour = times.substr(0, 2) | 0;
      min = times.substr(2, 2) | 0;
    } else {
      return null;
    }
  }

  var time = (hour * util.HOUR_SEC) + (min * util.MINUTE_SEC) + sec + msec;
  return time;
};

util.time2ms = function(t) {
  return util.time2sec(t) * 1000;
};

// 86567.123
// -> {'sign': false, 'days': 1, 'hrs': 24, 'hours': 0, 'minutes': 2, 'seconds': 47, 'milliseconds': 0.123}
util.sec2struct = function(seconds) {
  var wk = seconds;
  var sign = false;
  if (seconds < 0) {
    sign = true;
    wk *= (-1);
  }

  var days = (wk / util.DAY_SEC) | 0;
  var hh = 0;
  if (wk >= util.HOUR_SEC) {
    hh = (wk / util.HOUR_SEC) | 0;
    wk -= (hh * util.HOUR_SEC);
  }

  var mi = 0;
  if (wk >= util.MINUTE_SEC) {
    mi = (wk / util.MINUTE_SEC) | 0;
    wk -= (mi * util.MINUTE_SEC);
  }

  var ss = wk | 0;
  var ms = util.round(wk - ss, 3);
  var tm = {
    sign: sign,
    days: days,
    hrs: hh,
    hours: hh - days * 24,
    minutes: mi,
    seconds: ss,
    milliseconds: ms
  };
  return tm;
};

//-----------------------------------------------------------------------------
// ['0000', '12:00', '1530'] ->
// {
//   time: '12:00',
//   datetime: DateTime object
// }
util.calcNextTime = function(times) {
  var now = util.getDateTime();
  times.sort();
  var ret = {
    time: null,
    datetime: null
  };
  for (var i = 0; i < times.length; i++) {
    var t = times[i];
    t = t.replace(/T/, '').replace(/:/g, '');
    var tmstr = t.substr(0, 2) + t.substr(2, 2) + '5959.999';
    var tgt = util.getDateTimeFromTime(tmstr);
    if (now.timestamp <= tgt.timestamp) {
      ret.time = times[i];
      ret.datetime = tgt;
      return ret;
    }
  }
  ret.time = times[0];
  ret.datetime = util.getDateTimeFromTime(times[0], 1);
  return ret;
};

//-----------------------------------------------------------------------------
/**
 * 0.12345, 3 -> 0.123
 * 0.12345, 4 -> 0.1235
 * 12345, -1  -> 12350
 * 12345, -2-  > 12300
 */
util.round = function(number, precision) {
  precision |= 0;
  return util._shift(Math.round(util._shift(number, precision, false)), precision, true);
};

util._shift = function(number, precision, reverseShift) {
  if (reverseShift) {
    precision = -precision;
  }
  var numArray = ('' + number).split('e');
  return +(numArray[0] + 'e' + (numArray[1] ? (+numArray[1] + precision) : precision));
};

// 123   , 1 -> '123.0'
// 123.4 , 1 -> '123.4'
// 123.45, 1 -> '123.5'
util.decimalAlignment = function(v, scale, zero) {
  v = util.round(v, scale);
  if (zero && v == 0) return 0;
  v = util.decimalPadding(v, scale);
  return v;
};

// 123  , 1 -> '123.0'
// 123  , 2 -> '123.00'
// 123.4, 1 -> '123.4'
// 123.4, 2 -> '123.40'
util.decimalPadding = function(v, scale) {
  var r = v + '';
  if (scale == undefined) scale = 1;
  if (scale <= 0) return r;
  var w = r.split('.');
  var i = w[0];
  var d = (w[1] == undefined ? '' : w[1]);
  d = util.strPadding(d, '0', scale);
  r = i + '.' + d;
  return r;
};

/**
 * 360 -> 0
 * 361 -> 1
 * -1  -> 359
 */
util.roundAngle = function(v) {
  if (v < 0) v = 360 + (v % 360);
  if (v >= 360) v = v % 360;
  return v;
};

//-----------------------------------------------------------------------------
util.random = function(min, max) {
  min = parseInt(min);
  max = parseInt(max);
  if (isNaN(min)) {
    min = 0;
    max = 0x7fffffff;
  } else if (isNaN(max)) {
    max = min;
    min = 0;
  }
  return parseInt(Math.random() * (max - min + 1)) + min;
};

util.getRandomString = function(min, max, tbl) {
  var DFLT_MAX_LEN = 8;
  if (!tbl) tbl = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (typeof tbl == 'string') tbl = tbl.split('');
  if (min == undefined) {
    min = DFLT_MAX_LEN;
    max = min;
  }
  if (max == undefined) max = min;
  var s = '';
  var len = util.random(min, max);
  if (tbl.length > 0) {
    for (var i = 0; i < len; i++) {
      s += tbl[Math.floor(Math.random() * tbl.length)];
    }
  }
  return s;
};

//-----------------------------------------------------------------------------
util.fromJSON = function(j, r) {
  if (!j) return j;
  return JSON.parse(j, r);
};

util.toJSON = function(o, r, s) {
  return JSON.stringify(o, r, s);
};

util.loadObject = function(key) {
  if (util.LS_AVAILABLE) {
    return JSON.parse(localStorage.getItem(key));
  }
  return null;
};

util.saveObject = function(key, obj) {
  if (util.LS_AVAILABLE) {
    localStorage.setItem(key, JSON.stringify(obj));
  }
};

util.clearObject = function(key) {
  if (util.LS_AVAILABLE) {
    localStorage.removeItem(key);
  }
};

util.startsWith = function(s, p, o) {
  if (o) s = s.substr(o);
  if ((s == '') && (p == '')) return true;
  if (p == '') return false;
  return (s.substr(0, p.length) == p);
};
util.endsWith = function(s, p) {
  if ((s == '') && (p == '')) return true;
  if (p == '') return false;
  return (s.substr(s.length - p.length) == p);
};

util.repeatCh = function(c, n) {
  var s = '';
  for (var i = 0; i < n; i++) s += c;
  return s;
};

util.strPadding = function(str, ch, len, pos) {
  var t = str + '';
  var d = len - t.length;
  if (d <= 0) return t;
  var pd = util.repeatCh(ch, d);
  if (pos == 'L') {
    t = pd + t;
  } else {
    t += pd;
  }
  return t;
};

util.countStr = function(s, p) {
  var i = 0;
  var t = Object.prototype.toString.call(p);
  if (t == '[object RegExp]') {
    var m = s.match(p);
    if (m) i = m.length;
  } else {
    var pos = s.indexOf(p);
    while ((p != '') && (pos != -1)) {
      i++;
      pos = s.indexOf(p, pos + p.length);
    }
  }
  return i;
};

util.lenB = function(s) {
  return (new Blob([s], {type: 'text/plain'})).size;
};

util.convertNewLine = function(s, nl) {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, nl);
};

util.toHalfWidth = function(s) {
  var h = s.replace(/　/g, ' ').replace(/”/g, '"').replace(/’/g, '\'').replace(/‘/g, '`').replace(/￥/g, '\\');
  h = h.replace(/[！-～]/g, function(wk) {return String.fromCharCode(wk.charCodeAt(0) - 65248);});
  return h;
};

util.toFullWidth = function(s) {
  var f = s.replace(/ /g, '　').replace(/"/g, '”').replace(/'/g, '’').replace(/`/g, '‘').replace(/\\/g, '￥');
  f = f.replace(/[!-~]/g, function(wk) {return String.fromCharCode(wk.charCodeAt(0) + 65248);});
  return f;
};

util.getUnicodePoints = function(str) {
  var code = '';
  for (var i = 0; i < str.length; i++) {
    var p = util.getCodePoint(str.charAt(i), true);
    if (i > 0) code += ' ';
    code += 'U+' + util.formatHex(p, true, '', 4);
  }
  return code;
};

util.getCodePoint = function(c, hex) {
  var p;
  if (String.prototype.codePointAt) {
    p = c.codePointAt(0);
  } else {
    p = c.charCodeAt(0);
  }
  if (hex) p = util.toHex(p, true, '', 0);
  return p;
};

util.toHex = function(v, uc, pFix, d) {
  var hex = parseInt(v).toString(16);
  return util.formatHex(hex, uc, pFix, d);
};

util.formatDec = function(v) {
  var v0 = v + '';
  var v1 = '';
  if (v0.match(/\./)) {
    var a = v0.split('.');
    v0 = a[0];
    v1 = '.' + a[1];
  }
  var len = v0.length;
  var r = '';
  for (var i = 0; i < len; i++) {
    if ((i != 0) && ((len - i) % 3 == 0)) {
      if (!((i == 1) && (v0.charAt(0) == '-'))) {
        r += ',';
      }
    }
    r += v0.charAt(i);
  }
  r += v1;
  return r;
};
util.formatHex = function(hex, uc, pFix, d) {
  if (uc) hex = hex.toUpperCase();
  if ((d) && (hex.length < d)) {
    hex = (util.repeatCh('0', d) + hex).slice(d * (-1));
  }
  if (pFix) hex = '0x' + hex;
  return hex;
};

util.array2set = function(array) {
  var set = [];
  for (var i = 0; i < array.length; i++) {
    var val = array[i];
    if (!util.hasValue(set, val)) {
      set.push(val);
    }
  }
  return set;
};

util.hasValue = function(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) {
      return true;
    }
  }
  return false;
};

util.plural = function(s, n) {
  return (n >= 2 ? (s + 's') : s);
};

util.copy2clpbd = function(s) {
  var b = document.body;
  var ta = document.createElement('textarea');
  ta.style.position = 'fixed';
  ta.style.left = '-9999';
  ta.value = s;
  b.appendChild(ta);
  ta.select();
  var r = document.execCommand('copy');
  b.removeChild(ta);
  return r;
};

/**
 *   1  -> 'A'
 *   2  -> 'B'
 *  26  -> 'Z'
 *  27  -> 'AA'
 * 'A'  ->  1
 * 'B'  ->  2
 * 'Z'  -> 26
 * 'AA' -> 27
 */
util.xlsCol = function(c) {
  var f = (isNaN(c) ? util.xlsColA2N : util.xlsColN2A);
  return f(c);
};
util.xlsColA2N = function(c) {
  var t = util.A2Z();
  return util.pIndex(t, c.trim().toUpperCase());
};
util.xlsColN2A = function(n) {
  var t = util.A2Z();
  var a = util.strp(t, n);
  if (n <= 0) a = '';
  return a;
};
util.A2Z = function() {
  var t = [];
  for (var i = 65; i <= 90; i++) {
    t.push(String.fromCharCode(i));
  }
  return t;
};

/**
 * pIndex(['A', 'B', 'C'], 'A')  -> 1
 * pIndex(['A', 'B', 'C'], 'B')  -> 2
 * pIndex(['A', 'B', 'C'], 'AA') -> 4
 */
util.pIndex = function(tbl, ptn) {
  var len = ptn.length;
  var rdx = tbl.length;
  var idx = 0;
  for (var i = 0; i < len; i++) {
    var d = len - i - 1;
    var c = ptn.substr(d, 1);
    var v = tbl.indexOf(c);
    if (v == -1) return 0;
    v++;
    var n = v * Math.pow(rdx, i);
    idx += n;
  }
  return idx;
};

/**
 * strp(['A', 'B', 'C'], 1)  -> 'A'
 * strp(['A', 'B', 'C'], 2)  -> 'B'
 * strp(['A', 'B', 'C'], 4) -> 'AA'
 */
util.strp = function(tbl, idx) {
  var len = tbl.length;
  var a = [-1];
  for (var i = 0; i < idx; i++) {
    var j = 0;
    var cb = 1;
    while (j < a.length) {
      if (cb) {
        a[j]++;
        if (a[j] > len - 1) {
          a[j] = 0;
          if (a.length <= j + 1) {
            a[j + 1] = -1;
          }
        } else {
          cb = 0;
        }
      }
      j++;
    }
  }
  var s = '';
  for (i = a.length - 1; i >= 0; i--) {
    s += tbl[a[i]];
  }
  return s;
};

//-----------------------------------------------------------------------------
util.getElement = function(target, idx) {
  var el;
  idx |= 0;
  if (typeof target == 'string') {
    el = document.querySelectorAll(target).item(idx);
  } else {
    el = target;
  }
  return el;
};
util.el = util.getElement;

util.getElVal = function(target, idx) {
  var el = util.getElement(target, idx);
  if (el) {
    return el.value;
  }
  return null;
};

util.setElVal = function(target, idx, val) {
  var el = util.getElement(target, idx);
  if (el) {
    el.value = val;
  }
};

util.escHTML = function(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

util.addClass = function(el, n) {
  if (util.hasClass(el, n)) return;
  if (el.className == '') {
    el.className = n;
  } else {
    el.className += ' ' + n;
  }
};

util.removeClass = function(el, n) {
  var names = el.className.split(' ');
  var nm = '';
  for (var i = 0; i < names.length; i++) {
    if (names[i] != n) {
      if (i > 0) nm += ' ';
      nm += names[i];
    }
  }
  el.className = nm;
};

util.hasClass = function(el, n) {
  var names = el.className.split(' ');
  for (var i = 0; i < names.length; i++) {
    if (names[i] == n) return true;
  }
  return false;
};

util.getClientWidth = function() {
  return document.documentElement.clientWidth;
};

util.getClientHeight = function() {
  return document.documentElement.clientHeight;
};

util.center = function(el) {
  if (!el) return;
  var cliW = util.getClientWidth();
  var cliH = util.getClientHeight();
  var rect = el.getBoundingClientRect();
  var w = rect.width;
  var h = rect.height;
  var x = cliW / 2 - w / 2;
  var y = cliH / 2 - h / 2;
  if (x < 0) {
    x = 0;
  }
  if (y < 0) {
    y = 0;
  }
  util.setPos(el, x, y);
};

util.setPos = function(el, x, y) {
  var style = {
    left: x + 'px',
    top: y + 'px'
  };
  util.setStyles(el, style);
};

util.textarea = {};
util.textarea.addStatusInfo = function(textarea, infoarea) {
  textarea = util.getElement(textarea);
  if (!textarea) return;
  infoarea = util.getElement(infoarea);
  if (!infoarea) return;
  textarea.infoarea = infoarea;
  textarea.addEventListener('input', util.textarea.onInput);
  textarea.addEventListener('change', util.textarea.onInput);
  textarea.addEventListener('keydown', util.textarea.onInput);
  textarea.addEventListener('keyup', util.textarea.onInput);
  textarea.addEventListener('click', util.textarea.onInput);
};
util.textarea.onInput = function(e) {
  util.updateTextAreaInfo(e.target);
};
util.updateTextAreaInfo = function(textarea) {
  if (!textarea) return;
  var txt = textarea.value;
  var len = txt.length;
  var lenB = util.lenB(txt);
  var lfCnt = (txt.match(/\n/g) || []).length;
  var lenWoLf = len - lfCnt;
  var st = textarea.selectionStart;
  var ed = textarea.selectionEnd;
  var sl = ed - st;
  var ch = txt.substr(st, 1);
  var cd = util.getCodePoint(ch);
  var cd16 = util.getUnicodePoints(ch, true);
  var cp = '';
  if (cd) cp = (cd == 10 ? 'LF' : ch) + ':' + cd16 + '(' + cd + ')';
  var slct = (sl ? 'Selected=' + sl : '');
  textarea.infoarea.innerText = 'LEN=' + lenWoLf + ' (w/RET=' + len + ') ' + lenB + ' bytes ' + cp + ' ' + slct;
};

//-----------------------------------------------------------------------------
// Form
//-----------------------------------------------------------------------------
util.submit = function(url, method, params, enc) {
  var form = document.createElement('form');
  form.action = url;
  form.method = method;
  for (var key in params) {
    var input = document.createElement('input');
    var val = params[key];
    if (enc) val = encodeURIComponent(val);
    input.type = 'hidden';
    input.name = key;
    input.value = val;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
};

//-----------------------------------------------------------------------------
// URL / Query
//-----------------------------------------------------------------------------
util.getProtocol = function() {
  return location.protocol;
};
util.getHost = function() {
  return location.host.split(':')[0];
};
util.getPort = function() {
  return location.port;
};
util.getParentPath = function() {
  return location.href.replace(/(.*\/).*/, '$1');
};
util.getQuery = function(k) {
  var s = window.location.search.substr(1);
  if (!k) return s;
  var q = s.split('&');
  var a = [];
  for (var i = 0; i < q.length; i++) {
    var p = q[i].split('=');
    if (p[0] == k) a.push(p[1]);
  }
  var v = null;
  if (a.length == 1) {
    v = a[0];
  } else if (a.length > 1) {
    v = a;
  }
  return v;
};
util.getUrlHash = function() {
  var s = window.location.hash;
  if (s) s = s.substr(1);
  return s;
};

//-----------------------------------------------------------------------------
// HTTP
//-----------------------------------------------------------------------------
//  var param = {
//    key1: val1,
//    key2: val2
//  };
//
//  var req = {
//    url: 'xxx',
//    method: 'POST',
//    data: param,
//    responseType: 'json',
//    cb: callback,
//    onsuccess: callback,
//    onerror: callback
//  };
//
//  util.http(req);
//
//  callback = function(xhr, res, req) {
//    if (xhr.status != 200) {
//      return;
//    }
//  };
util.http = function(rq) {
  var trc = util.http.trace;
  var trcid = util.getRandomString(8, 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  rq.trcid = trcid;
  if (!rq.method) rq.method = 'GET';
  var data = null;
  if ((rq.data != undefined) && (rq.data != '')) {
    data = rq.data;
  }
  if (trc) {
    if (!data) data = {};
    if (typeof data == 'string') {
      data += '&_trcid=' + trcid;
    } else {
      data._trcid = trcid;
    }
  }
  if (data instanceof Object) {
    data = util.http.buildParam(data);
  }
  var url = rq.url;
  if (data && (rq.method == 'GET')) {
    url += '?' + data;
  }
  if (rq.async == undefined) rq.async = true;
  rq.method = rq.method.toUpperCase();
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var res = xhr.responseText;
      if (util.http.log) {
        var m = res;
        if (m) {
          if (m.length > util.http.LOG_LIMIT) {
            m = '(size=' + m.length + ')';
          } else if (m.length > util.http.logMaxLen) {
            m = m.substr(0, util.http.logMaxLen) + '...';
          }
        }
        m = util.escHTML(m);
        util._log.v('<= [' + trcid + '] ' + m);
      }
      if (xhr.status == 200) {
        var ct = xhr.getResponseHeader('Content-Type');
        if (ct) ct = ct.split(';')[0];
        if ((rq.responseType == 'json') || ((!rq.responseType) && (ct == 'application/json'))) {
          res = util.fromJSON(res);
        }
      }
      if (rq.cb) rq.cb(xhr, res, rq);
      if (((xhr.status >= 200) && (xhr.status < 300)) || (xhr.status == 304)) {
        if (rq.onsuccess) rq.onsuccess(xhr, res, rq);
      } else {
        if (rq.onerror) rq.onerror(xhr, res, rq);
      }
    }
  };
  xhr.open(rq.method, url, rq.async, rq.user, rq.pass);
  var contentType = 'application/x-www-form-urlencoded';
  if (rq.contentType) {
    contentType = rq.contentType;
  }
  xhr.setRequestHeader('Content-Type', contentType);
  if (!rq.cache) {
    xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
  }
  if (rq.userAgent) {
    xhr.setRequestHeader('User-Agent', rq.userAgent);
  }
  if (rq.user && rq.pass) {
    var c = util.encodeB64(rq.user + ':' + rq.pass);
    xhr.setRequestHeader('Authorization', 'Basic ' + c);
  }
  if (util.http.log) {
    util._log.v('=> [' + trcid + '] ' + rq.url);
    if (data) util._log.v('[DATA] ' + data.substr(0, util.http.logLen));
  }
  xhr.send(data);
};

util.http.buildParam = function(p) {
  var s = '';
  var cnt = 0;
  for (var key in p) {
    if (cnt > 0) {
      s += '&';
    }
    s += key + '=' + encodeURIComponent(p[key]);
    cnt++;
  }
  return s;
};

util.http.log = false;
util.http.LOG_LIMIT = 3145728;
util.http.logMaxLen = 4096;
util.http.trace = false;

//-----------------------------------------------------------------------------
util.infotip = {};
util.infotip.obj = {
  el: {
    body: null,
    pre: null
  },
  msg: null
};
util.infotip.opt = null;
util.infotip.timerId = 0;

util.infotip.registerStyle = function() {
  var style = '.infotip-wrp {';
  style += '  position: fixed !important;';
  style += '  display: inline-block !important;';
  style += '  max-width: calc(100vw - 35px) !important;';
  style += '  max-height: calc(100vh - 35px) !important;';
  style += '  overflow: auto !important;';
  style += '  padding: 4px !important;';
  style += '  box-sizing: content-box !important;';
  style += '  z-index: 2147483647 !important;';
  style += '  box-shadow: 8px 8px 10px rgba(0,0,0,.3) !important;';
  style += '  border-radius: 3px !important;';
  style += '  color: #fff! important;';
  style += '  background: rgba(0,0,0,0.65) !important;';
  style += '}';
  style += '.infotip {';
  style += '  width: auto !important;';
  style += '  height: auto !important;';
  style += '  min-height: 1em !important;';
  style += '  margin: 0 !important;';
  style += '  padding: 0 !important;';
  style += '  line-height: 1.2 !important;';
  style += '  color: #fff !important;';
  style += '  font-size: 12px !important;';
  style += '  font-family: Consolas !important;';
  style += '}';
  util.registerStyle(style);
};

util.infotip.create = function(obj, style) {
  var div = document.createElement('div');
  div.className = 'infotip-wrp';
  var pre = document.createElement('pre');
  pre.className = 'infotip';
  if (style) {
    for (var p in style) {
      util.setStyle(pre, p, style[p]);
    }
  }
  div.appendChild(pre);
  obj.el.body = div;
  obj.el.pre = pre;
  document.body.appendChild(div);
};

/**
 * show("message");
 * show("message", 3000);
 * show("message", 0, {pos: {x: 100, y: 200});
 * show("message", 0, {pos: 'pointer', offset: {x: 5, y: -8}});
 * show("message", 0, {pos: 'active'});
 * show("message", 0, {style: {'font-size': '18px'}});
 */
util.infotip.show = function(msg, duration, opt) {
  var DFLT_DURATION = 1500;
  var x;
  var y;
  var style;
  var offset;

  if (duration == undefined) {
    duration = DFLT_DURATION;
  }

  if (opt) {
    if (opt.pos) {
      if (opt.pos == 'pointer') {
        x = util.mouseX;
        y = util.mouseY;
        if (!opt.offset) {
          opt.offset = {
            x: 5,
            y: -8
          };
        }
        offset = opt.offset;
      } else if (opt.pos == 'active') {
        var el = document.activeElement;
        var rect = el.getBoundingClientRect();
        x = rect.left;
        y = rect.top;
      } else if (opt.pos.x != undefined) {
        x = opt.pos.x;
      }

      if (opt.pos.y != undefined) {
        y = opt.pos.y;
      }
    }

    if (opt.style) {
      style = opt.style;
    }
  }

  var obj = util.infotip.obj;
  obj.msg = msg;
  util.infotip._show(obj, style);

  if ((x != undefined) && (y != undefined)) {
    util.infotip._move(obj, x, y, offset);
  } else {
    util.infotip._center(obj);
  }
  util.infotip.opt = opt;
  util.fadeIn(obj.el.body, util.DFLT_FADE_SPEED);
  if (duration > 0) {
    if (util.infotip.timerId) {
      clearTimeout(util.infotip.timerId);
    }
    util.infotip.timerId = setTimeout(util.infotip.hide, duration);
  }
};

util.infotip._show = function(obj, style) {
  if (!obj.el.body) {
    util.infotip.create(obj, style);
  }
  obj.msg = (obj.msg + '').replace(/\\n/g, '\n');
  obj.el.pre.innerHTML = obj.msg;
  document.body.appendChild(obj.el.body);
};

/**
 * move
 */
util.infotip.move = function(x, y, offset) {
  util.infotip._move(util.infotip.obj, x, y, offset);
};

util.infotip._move = function(obj, x, y, offset) {
  var ttBody = obj.el.body;
  if (!ttBody) return;
  var rect = ttBody.getBoundingClientRect();
  if (offset) {
    x += offset.x;
    y += offset.y;
    if (offset.y < 0) {
      y -= rect.height;
    }
  }
  if (y < 0) {
    y = 0;
  }
  ttBody.style.left = x + 'px';
  ttBody.style.top = y + 'px';
};

util.infotip.center = function() {
  util.infotip._center(util.infotip.obj);
};

util.infotip._center = function(obj) {
  var infotip = obj.el.body;
  util.center(infotip);
};

/**
 * Hide a infotip
 */
util.infotip.hide = function() {
  var delay = util.DFLT_FADE_SPEED;
  util.fadeOut(util.infotip.obj.el.body, delay);
  util.infotip.timerId = setTimeout(util.infotip.onFadeOutCompleted, delay);
};
util.infotip.onFadeOutCompleted = function() {
  util.infotip._hide(util.infotip.obj);
};

util.infotip._hide = function(obj) {
  var div = obj.el.body;
  if ((div != null) && (div.parentNode)) {
    document.body.removeChild(div);
    obj.msg = null;
  }
  obj.el.pre = null;
  obj.el.body = null;
  obj.msg = null;
  util.infotip.opt = null;
};

util.infotip.isVisible = function() {
  return util.infotip.obj.el != null;
};

util.infotip.adjust = function() {
  if (util.infotip.isVisible()) {
    util.infotip.center();
  }
};

util.infotip.onMouseMove = function(x, y) {
  if (util.infotip.opt && util.infotip.opt.pos == 'pointer') {
    util.infotip.move(x, y, util.infotip.opt.offset);
  }
};

//-----------------------------------------------------------------------------
// Tooltip
//-----------------------------------------------------------------------------
util.tooltip = {};
util.tooltip.offset = {
  x: 5,
  y: -8
};
util.tooltip.targetEl = null;
util.tooltip.timerId = 0;
util.tooltip.obj = {
  el: {
    body: null,
    pre: null
  },
  msg: null
};

util.tooltip.show = function(el, msg, x, y) {
  if (el == util.tooltip.targetEl) {
    util.infotip._move(util.tooltip.obj, x, y, util.tooltip.offset);
  } else {
    util.tooltip.targetEl = el;
    util.tooltip.obj.msg = msg;
    if (!util.tooltip.obj.el.body) {
      if (util.tooltip.timerId) {
        clearTimeout(util.tooltip.timerId);
      }
      util.tooltip.timerId = setTimeout(util.tooltip._show, util.DFLT_FADE_SPEED);
    } else {
      util.tooltip._show();
    }
  }
};

util.tooltip._show = function() {
  var x = util.mouseX;
  var y = util.mouseY;
  var el = document.elementFromPoint(x, y);
  if (!el || (el != util.tooltip.targetEl)) {
    return;
  }
  util.infotip._show(util.tooltip.obj);
  util.infotip._move(util.tooltip.obj, x, y, util.tooltip.offset);
};

util.tooltip.hide = function() {
  util.infotip._hide(util.tooltip.obj);
  util.tooltip.targetEl = null;
};

util.tooltip.onMouseMove = function(x, y) {
  var el = document.elementFromPoint(x, y);
  var tooltip = ((el && el.dataset) ? el.dataset.tooltip : null);
  if (tooltip) {
    util.tooltip.show(el, tooltip, x, y);
  } else if (util.tooltip.obj.el.body) {
    util.tooltip.hide();
  }
};

//-----------------------------------------------------------------------------
// Fade in / out
//-----------------------------------------------------------------------------
util.registerFadeStyle = function() {
  var style = '.fadein {';
  style += '  opacity: 1 !important;';
  style += '}';
  style += '.fadeout {';
  style += '  opacity: 0 !important;';
  style += '}';
  util.registerStyle(style);
};

util.fadeIn = function(el, speed, cb, arg) {
  if (!el) return;
  if ((speed == undefined) || (speed < 0)) {
    speed = util.DFLT_FADE_SPEED;
  }
  util.addClass(el, 'fadeout');
  setTimeout(util._fadeIn, 0, el, speed, cb, arg);
};
util._fadeIn = function(el, speed, cb, arg) {
  var t = speed / 1000;
  util.setStyle(el, 'transition', 'opacity ' + t + 's ease');
  util.removeClass(el, 'fadeout');
  util.addClass(el, 'fadein');
  if (cb) {
    var dat = {cb: cb, el: el, arg: arg};
    setTimeout(util.__fadeIn, speed, dat);
  }
};
util.__fadeIn = function(dat) {
  dat.cb(dat.el, dat.arg);
};

util.fadeOut = function(el, speed, cb, arg) {
  if (!el) return;
  if ((speed == undefined) || (speed < 0)) {
    speed = util.DFLT_FADE_SPEED;
  }
  util.removeClass(el, 'fadein');
  setTimeout(util._fadeOut, 0, el, speed, cb, arg);
};
util._fadeOut = function(el, speed, cb, arg) {
  var t = speed / 1000;
  util.setStyle(el, 'transition', 'opacity ' + t + 's ease');
  util.removeClass(el, 'fadein');
  util.addClass(el, 'fadeout');
  if (cb) {
    var dat = {cb: cb, el: el, arg: arg};
    setTimeout(util.__fadeOut, speed, dat);
  }
};
util.__fadeOut = function(dat) {
  dat.cb(dat.el, dat.arg);
};

//-----------------------------------------------------------------------------
// Screen Fader
//-----------------------------------------------------------------------------
util.SCREEN_FADER_ZINDEX = 99999999;
util.fadeScreenEl = null;
util.initScreenFader = function() {
  var el = util.fadeScreenEl;
  if (!el) {
    el = util.createFadeScreenEl();
    util.fadeScreenEl = el;
  }
  document.body.appendChild(el);
};

util.fadeScreenIn = function(speed, cb) {
  if (speed == undefined) {
    speed = util.DFLT_FADE_SPEED + 300;
  }
  var el = util.fadeScreenEl;
  if (!el) {
    el = util.createFadeScreenEl();
    util.fadeScreenEl = el;
  }
  document.body.appendChild(el);
  util.fadeScreenIn.cb = cb;
  util.fadeOut(el, speed, util._fadeScreenIn);
};
util._fadeScreenIn = function() {
  document.body.removeChild(util.fadeScreenEl);
  util.fadeScreenEl = null;
  var cb = util.fadeScreenIn.cb;
  util.fadeScreenIn.cb = null;
  if (cb) cb();
};

util.fadeScreenOut = function(speed, cb) {
  if (speed == undefined) {
    speed = util.DFLT_FADE_SPEED;
  }
  var el = util.fadeScreenEl;
  if (!el) {
    el = util.createFadeScreenEl();
    util.fadeScreenEl = el;
  }
  document.body.appendChild(el);
  util.fadeIn(el, speed, cb);
};

util.createFadeScreenEl = function() {
  var el = document.createElement('div');
  var style = {
    'position': 'fixed',
    'width': '100vw',
    'height': '100vh',
    'top': '0',
    'left': '0',
    'background': '#fff',
    'z-index': util.SCREEN_FADER_ZINDEX
  };
  util.setStyles(el, style);
  return el;
};

//-----------------------------------------------------------------------------
// Base64
//-----------------------------------------------------------------------------
util.Base64 = {};
util.Base64.encode = function(arr) {
  var len = arr.length;
  if (len == 0) return '';
  var tbl = {64: 61, 63: 47, 62: 43};
  for (var i = 0; i < 62; i++) {
    tbl[i] = (i < 26 ? i + 65 : (i < 52 ? i + 71 : i - 4));
  }
  var str = '';
  for (i = 0; i < len; i += 3) {
    str += String.fromCharCode(
      tbl[arr[i] >>> 2],
      tbl[(arr[i] & 3) << 4 | arr[i + 1] >>> 4],
      tbl[(i + 1) < len ? (arr[i + 1] & 15) << 2 | arr[i + 2] >>> 6 : 64],
      tbl[(i + 2) < len ? (arr[i + 2] & 63) : 64]
    );
  }
  return str;
};
util.Base64.decode = function(str) {
  var arr = [];
  if (str.length == 0) return arr;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (!(((c >= 0x30) && (c <= 0x39)) || ((c >= 0x41) && (c <= 0x5A)) || ((c >= 0x61) && (c <= 0x7A)) || (c == 0x2B) || (c == 0x2F) || (c == 0x3D))) {
      util._log.e('invalid b64 char: 0x' + c.toString(16).toUpperCase() + ' at ' + i);
      return arr;
    }
  }
  var tbl = {61: 64, 47: 63, 43: 62};
  for (i = 0; i < 62; i++) {
    tbl[i < 26 ? i + 65 : (i < 52 ? i + 71 : i - 4)] = i;
  }
  var buf = [];
  for (i = 0; i < str.length; i += 4) {
    for (var j = 0; j < 4; j++) {
      buf[j] = tbl[str.charCodeAt(i + j) || 0];
    }
    arr.push(
      buf[0] << 2 | (buf[1] & 63) >>> 4,
      (buf[1] & 15) << 4 | (buf[2] & 63) >>> 2,
      (buf[2] & 3) << 6 | buf[3] & 63
    );
  }
  if (buf[3] == 64) {
    arr.pop();
    if (buf[2] == 64) {
      arr.pop();
    }
  }
  return arr;
};

util.encodeBase64 = function(s) {
  var r;
  try {
    r = btoa(s);
  } catch (e) {
    r = btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, function(match, p1) {return String.fromCharCode('0x' + p1);}));
  }
  return r;
};
util.decodeBase64 = function(s) {
  var r = '';
  if (!window.atob) return r;
  try {
    r = decodeURIComponent(Array.prototype.map.call(atob(s), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    r = atob(s);
  }
  return r;
};

//-----------------------------------------------------------------------------
// UTF-8
//-----------------------------------------------------------------------------
util.UTF8 = {};
util.UTF8.toByte = function(s) {
  var a = [];
  if (!s) return a;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c <= 0x7F) {
      a.push(c);
    } else if (c <= 0x07FF) {
      a.push(((c >> 6) & 0x1F) | 0xC0);
      a.push((c & 0x3F) | 0x80);
    } else {
      a.push(((c >> 12) & 0x0F) | 0xE0);
      a.push(((c >> 6) & 0x3F) | 0x80);
      a.push((c & 0x3F) | 0x80);
    }
  }
  return a;
};
util.UTF8.fmByte = function(a) {
  if (!a) return null;
  var s = '';
  var i, c;
  while (i = a.shift()) {
    if (i <= 0x7F) {
      s += String.fromCharCode(i);
    } else if (i <= 0xDF) {
      c = ((i & 0x1F) << 6);
      c += a.shift() & 0x3F;
      s += String.fromCharCode(c);
    } else if (i <= 0xE0) {
      c = ((a.shift() & 0x1F) << 6) | 0x800;
      c += a.shift() & 0x3F;
      s += String.fromCharCode(c);
    } else {
      c = ((i & 0x0F) << 12);
      c += (a.shift() & 0x3F) << 6;
      c += a.shift() & 0x3F;
      s += String.fromCharCode(c);
    }
  }
  return s;
};

//-----------------------------------------------------------------------------
// bit operation
//-----------------------------------------------------------------------------
util.bit8 = {};
util.bit8.rotateL = function(v, n) {
  n = n % 8;
  return ((v << n) | (v >> (8 - n))) & 255;
};
util.bit8.rotateR = function(v, n) {
  n = n % 8;
  return ((v >> n) | (v << (8 - n))) & 255;
};
util.bit8.invert = function(v) {
  return (~v) & 255;
};

//-----------------------------------------------------------------------------
// BSB64
//-----------------------------------------------------------------------------
util.encodeBSB64 = function(s, n) {
  var a = util.UTF8.toByte(s);
  return util.BSB64.encode(a, n);
};
util.decodeBSB64 = function(s, n) {
  if (s.match(/\$\d+$/)) {
    var v = s.split('$');
    s = v[0];
    n = v[1];
  }
  var a = util.BSB64.decode(s, n);
  return util.UTF8.fmByte(a);
};
util.BSB64 = {};
util.BSB64.encode = function(a, n) {
  var fn = util.bit8.rotateL;
  if (n % 8 == 0) fn = util.bit8.invert;
  var b = [];
  for (var i = 0; i < a.length; i++) {
    b.push(fn(a[i], n));
  }
  return util.Base64.encode(b);
};
util.BSB64.decode = function(s, n) {
  var fn = util.bit8.rotateR;
  if (n % 8 == 0) fn = util.bit8.invert;
  var b = util.Base64.decode(s);
  var a = [];
  for (var i = 0; i < b.length; i++) {
    a.push(fn(b[i], n));
  }
  return a;
};

//-----------------------------------------------------------------------------
// Styles
//-----------------------------------------------------------------------------
util.CSS = '';

util.registerStyle = function(style) {
  util.CSS += style;
};

util.setupStyle = function() {
  util._registerStyle();
  util.infotip.registerStyle();
  util.registerFadeStyle();
  util.loader.registerStyle();

  var head = document.head || document.getElementsByTagName('head').item(0);
  var style = document.createElement('style');
  var firstStyle = document.getElementsByTagName('style').item(0);
  if (firstStyle) {
    head.insertBefore(style, firstStyle);
  } else {
    head.appendChild(style);
  }
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = util.CSS;
  } else {
    style.appendChild(document.createTextNode(util.CSS));
  }
};

util.setStyle = function(el, n, v) {
  el.style.setProperty(n, v, 'important');
};
util.setStyles = function(el, s) {
  for (var k in s) {
    util.setStyle(el, k, s[k]);
  }
};

util._registerStyle = function() {
  var style = '.pointable:hover {';
  style += 'cursor: pointer !important;';
  style += '}';
  style += '.pseudo-link {';
  style += 'cursor: pointer;';
  style += 'color: #00c;';
  style += '}';
  style += '.pseudo-link:hover {';
  style += 'text-decoration: underline;';
  style += '}';
  style += '.blink {';
  style += 'animation: blinker 1.5s step-end infinite;';
  style += '}';
  style += '@keyframes blinker {';
  style += '50% {';
  style += 'opacity: 0;';
  style += '}';
  style += '100% {';
  style += 'opacity: 0;';
  style += '}';
  style += '}';
  util.registerStyle(style);
};

//-----------------------------------------------------------------------------
// Loader Indication
//-----------------------------------------------------------------------------
util.loader = {};
util.loader.timerId = 0;
util.loader.count = 0;
util.loader.el = null;

util.loader.registerStyle = function() {
  var style = '@keyframes loader-rotate {';
  style += '  0% {';
  style += '    transform: rotate(0);';
  style += '  }';
  style += '  100% {';
  style += '    transform: rotate(360deg);';
  style += '  }';
  style += '}';
  style += '.loader {';
  style += '  display: block;';
  style += '  width: 46px;';
  style += '  height: 46px;';
  style += '  border: 4px solid rgba(204, 204, 204, 0.25);';
  style += '  border-top-color: #ccc;';
  style += '  border-radius: 50%;';
  style += '  position: fixed;';
  style += '  top: 0;';
  style += '  left: 0;';
  style += '  right: 0;';
  style += '  bottom: 0;';
  style += '  margin: auto;';
  style += '  animation: loader-rotate 1s linear infinite;';
  style += '}';
  style += '.loading {';
  style += '  cursor: progress !important;';
  style += '}';
  util.registerStyle(style);
};

util.loader.show = function(delay) {
  if (delay == undefined) {
    delay = 500;
  }
  util.loader.count++;
  if (util.loader.count > 1) {
    return;
  }
  util.loader.timerId = setTimeout(util.loader._show, delay);
};
util.loader._show = function() {
  util.loader.timerId = 0;
  var el = util.loader.el;
  if (!el) {
    el = util.loader.create();
    util.loader.el = el;
  }
  util.addClass(document.body, 'loading');
  document.body.appendChild(el);
  util.fadeIn(el);
};

util.loader.create = function() {
  var el = document.createElement('div');
  el.className = 'loader';
  return el;
};

util.loader.hide = function(force) {
  if (force) {
    util.loader.count = 0;
  } else if (util.loader.count > 0) {
    util.loader.count--;
  }
  if (util.loader.count == 0) {
    if (util.loader.timerId > 0) {
      clearTimeout(util.loader.timerId);
      util.loader.timerId = 0;
    }
    util.removeClass(document.body, 'loading');
    util.fadeOut(util.loader.el, 0, util.loader._hide);
  }
};

util.loader._hide = function() {
  if (util.loader.el) {
    document.body.removeChild(util.loader.el);
    util.loader.el = null;
  }
};

//-----------------------------------------------------------------------------
// Modal
//-----------------------------------------------------------------------------
util.MODAL_ZINDEX = 1000;
util.modal = function(child, addCloseHandler, style) {
  this.sig = 'modal';
  var el = document.createElement('div');
  var dfltStyle = {
    'position': 'fixed',
    'top': '0',
    'left': '0',
    'width': '100vw',
    'height': '100vh',
    'background': 'rgba(0,0,0,0.6)',
    'z-index': util.MODAL_ZINDEX
  };
  util.setStyles(el, dfltStyle);
  if (style) {
    util.setStyles(el, style);
  }
  el.style.opacity = '0';
  if (addCloseHandler) {
    el.addEventListener('click', this.onClick);
  }
  if (child) {
    el.appendChild(child);
  }
  el.ctx = this;
  this.el = el;
};
util.modal.prototype = {
  show: function() {
    var el = this.el;
    document.body.appendChild(el);
    util.fadeIn(el, 200);
    return this;
  },

  hide: function() {
    var el = this.el;
    var ctx = el.ctx;
    if (!ctx.closing) {
      ctx.closing = true;
      util.fadeOut(el, 200, ctx._hide);
    }
  },
  _hide: function(el) {
    document.body.removeChild(el);
  },

  appendChild: function(el) {
    this.el.appendChild(el);
  },

  removeChild: function(el) {
    this.el.removeChild(el);
  },

  getElement: function() {
    return this.el;
  },

  onClick: function(e) {
    var el = e.target;
    if (el.ctx && (el.ctx.sig == 'modal')) {
      el.ctx.hide();
    }
  }
};
util.modal.show = function(el, closeAnywhere, style) {
  var m = new util.modal(el, closeAnywhere, style).show();
  return m;
};

//-----------------------------------------------------------------------------
// Dialog
//-----------------------------------------------------------------------------
/**
 * opt {
 *   style: {
 *     name: value,
 *     ...
 *   },
 *   modal: {
 *     closeAnywhere: true|false,
 *     style: {
 *       name: value,
 *       ...
 *     }
 *   }
 * }
 */
util.dialog = function(content, buttons, opt, title, cbData) {
  var ctx = this;
  ctx.cbData = cbData;
  var body = ctx.createDialogBody(ctx, content, buttons, opt, title);
  ctx.el = ctx.create(ctx, body, opt);

  var closeAnywhere = false;
  var modalStyle;
  if (opt) {
    var modalOpt = opt.modal;
    if (modalOpt) {
      if (modalOpt.closeAnywhere) {
        closeAnywhere = true;
      }
      modalStyle = modalOpt.style;
    }
  }

  ctx.modal = util.modal.show(ctx.el, closeAnywhere, modalStyle);
  setTimeout(util.dialog.focusBtn, 10);
};
util.dialog.prototype = {
  create: function(ctx, body, opt) {
    var base = document.createElement('div');
    var style = {
      'position': 'fixed',
      'border-radius': '3px',
      'padding': util.dialog.PADDING + 'px',
      'background': '#fff',
      'color': '#000',
      'z-index': '1100'
    };
    util.setStyles(base, style);

    if (opt && opt.style) {
      for (var key in opt.style) {
        util.setStyle(base, key, opt.style[key]);
      }
    }
    base.appendChild(body);

    setTimeout(util.dialog.show, 0);
    base.style.opacity = 0;
    return base;
  },

  createDialogBody: function(ctx, content, buttons, opt, title) {
    var body = document.createElement('div');
    var style;
    if (title) {
      var titleArea = document.createElement('div');
      titleArea.innerHTML = title;
      style = {
        'margin-bottom': '0.5em',
        'font-weight': 'bold'
      };
      util.setStyles(titleArea, style);
      body.appendChild(titleArea);
    }

    var contentArea = document.createElement('pre');
    if (title) {
      style = {'margin': '0'};
    } else {
      style = {'margin': '10px 0'};
    }
    util.setStyles(contentArea, style);

    if (typeof content == 'string') {
      contentArea.innerHTML = content;
    } else {
      contentArea.appendChild(content);
    }
    body.appendChild(contentArea);

    if (buttons) {
      for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        var btnEl = document.createElement('button');
        style = {
          'margin-top': '1em',
          'margin-bottom': '0',
        };
        if (i > 0) {
          style['margin-left'] = '0.5em';
        }
        util.setStyles(btnEl, style);
        btnEl.className = 'dialog-btn';
        btnEl.addEventListener('click', ctx.defaultBtnCb);
        btnEl.innerText = button.label;
        btnEl.cb = button.cb;
        btnEl.ctx = ctx;
        body.appendChild(btnEl);
        if (button.focus) util.dialog.focusTargetBtn = btnEl;
      }
    }

    return body;
  },

  close: function(ctx) {
    ctx.modal.removeChild(ctx.el);
    ctx.modal.hide();
  },

  center: function(ctx) {
    util.center(ctx.el);
  },

  defaultBtnCb: function(e) {
    var el = e.target;
    var ctx = el.ctx;
    ctx.close(ctx);
    if (el.cb) el.cb(ctx, ctx.cbData);
  }
};
util.dialog.PADDING = 10;
util.dialog.instances = [];
util.dialog.focusTargetBtn = null;
util.dialog.focusBtn = function() {
  if (util.dialog.focusTargetBtn) {
    util.dialog.focusTargetBtn.focus();
    util.dialog.focusTargetBtn = null;
  }
};
util.dialog.getTopDialog = function() {
  var dialog = null;
  var instances = util.dialog.instances;
  if (instances.length > 0) {
    dialog = instances[instances.length - 1];
  }
  return dialog;
};
util.dialog.adjust = function() {
  var d = util.dialog.getTopDialog();
  if (d) d.center(d);
};
util.dialog.show = function() {
  var d = util.dialog.getTopDialog();
  d.el.style.opacity = 1;
  util.dialog.adjust();
};

// buttons = [
//   {
//     label: 'Yes',
//     focus: true,
//     cb: cbYes
//   },
//   ...
// ];
// opt = {
//   style: {
//     styles
//   },
//   modal: {
//     closeAnywhere: true|false,
//     style: {
//       name: value,
//       ...
//     }
//   }
// }
util.dialog.open = function(content, buttons, opt, title, cbData) {
  var DEFAULT_OPT = {
    style: {
      'min-width': '200px',
      'min-height': '50px',
      'text-align': 'center'
    }
  };
  if (!opt) {
    opt = DEFAULT_OPT;
  }

  var dialog = new util.dialog(content, buttons, opt, title, cbData);
  util.dialog.instances.push(dialog);

  return dialog;
};

util.dialog.close = function() {
  var dialog = util.dialog.instances.pop();
  if (dialog) {
    dialog.close(dialog);
  }
};

//-----------------------------------------------------------------------------
/**
 * util.dialog.ok('message');
 * util.dialog.ok('message', null, 'title');
 * util.dialog.ok('message', cb, 'title');
 * util.dialog.ok('message', cb, 'title', cbData);
 */
util.dialog.ok = function(content, cb, title, cbData, opt) {
  var buttons = [
    {
      label: 'OK',
      focus: true,
      cb: cb
    }
  ];
  content = util.convertNewLine(content, '<br>');
  util.dialog.open(content, buttons, opt, title, cbData);
};

//-----------------------------------------------------------------------------
/**
 * util.dialog.yesno('message', cb);
 * util.dialog.yesno('message', cb, 'title');
 * util.dialog.yesno('message', cb, 'title', cbData);
 * util.dialog.yesno('message', cb, 'title', cbData, true);
 *
 * cb = function(yes, cbData) {
 *   if (yes) {
 *     // Yes
 *   } else {
 *     // No
 *   }
 * };
 */
util.dialog.yesno = function(content, cb, title, cbData, focusNo, opt) {
  var dialog = new util.dialog.yesnoDialog(content, cb, title, cbData, focusNo, opt);
  return dialog;
};
util.dialog.yesnoDialog = function(content, cb, title, cbData, focusNo, opt) {
  var ctx = this;
  ctx.cb = cb;

  var buttons = [
    {
      label: 'Yes',
      cb: ctx.yesnoCbY
    },
    {
      label: 'No',
      cb: ctx.yesnoCbN
    }
  ];

  var focusIdx = 0;
  if (focusNo) {
    focusIdx = 1;
  }
  buttons[focusIdx].focus = true;

  content = util.convertNewLine(content, '<br>');
  var dialog = util.dialog.open(content, buttons, opt, title, cbData);
  dialog.yesNoCtx = ctx;
};
util.dialog.yesnoDialog.prototype = {
  yesnoCbY: function(ctx, cbData) {
    var yesNoCtx = ctx.yesNoCtx;
    if (yesNoCtx.cb) yesNoCtx.cb(true, cbData);
  },
  yesnoCbN: function(ctx, cbData) {
    var yesNoCtx = ctx.yesNoCtx;
    if (yesNoCtx.cb) yesNoCtx.cb(false, cbData);
  }
};

//-----------------------------------------------------------------------------
// Write HTML
//-----------------------------------------------------------------------------
/**
 * Write HTML and Fade in
 * util.writeHTML('#id', 'text');
 * util.writeHTML('#id', 'text', 300);
 *
 * Clear and Fade out
 * util.writeHTML('#id', '');
 * util.writeHTML('#id', '', 200);
 */
util.writeHTML = function(target, html, speed) {
  var el = target;
  if (typeof target == 'string') {
    el = document.querySelector(target);
  }
  if (!el) return;
  if (speed == 0) {
    el.innerHTML = html;
    return;
  }
  if (html == '') {
    util.clearHTML(el, speed);
  } else {
    el.innerHTML = '';
    var cbData = {html: html, speed: speed};
    util.fadeOut(el, 0, util._writeHTML, cbData);
  }
};
util._writeHTML = function(target, cbData) {
  var DFLT_SPEED = 250;
  var speed = cbData.speed;
  if (speed == undefined) {
    speed = DFLT_SPEED;
  }
  target.innerHTML = cbData.html;
  setTimeout(util.__writeHTML, 10, target, speed);
};
util.__writeHTML = function(target, speed) {
  util.fadeIn(target, speed);
};

// Fade out and Clear
util.clearHTML = function(target, speed) {
  var DFLT_SPEED = 200;
  if (speed == undefined) {
    speed = DFLT_SPEED;
  }
  util.fadeOut(target, speed, util._clearHTML);
};
util._clearHTML = function(el) {
  el.innerHTML = '';
  util.removeClass(el, 'fadeout');
};

//-----------------------------------------------------------------------------
// Events
//-----------------------------------------------------------------------------
// NAMESPACE.cb = function(ev) {
//   log(ev);
// }
//
// util.event.addListener('EVENT_NAME', NAMESPACE.cb);
//
// var data = {
//   msg: 'abc'
// };
// util.event.send('EVENT_NAME', data);
//-----------------------------------------------------------------------------
util.event = {};
util.event.listeners = {};
util.event.events = [];

util.event.addListener = function(name, fn) {
  if (!util.event.listeners[name]) {
    util.event.listeners[name] = [];
  }
  util.event.listeners[name].push(fn);
};

util.event.removeListener = function(name, fn) {
  var listeners = util.event.listeners[name];
  if (!listeners) {
    return;
  }
  var newList = [];
  for (var i = 0; i < listeners.length; i++) {
    if (listeners[i] != fn) {
      newList.push(listeners[i]);
    }
  }
  util.event.listeners[name] = newList;
};

util.event.send = function(name, data) {
  var e = {
    name: name,
    data: data
  };
  util.event.events.push(e);
  setTimeout(util.event._send, 0);
};

util.event._send = function() {
  var ev = util.event.events.shift();
  if (!ev) {
    return;
  }

  var e = {
    name: ev.name,
    data: ev.data
  };

  var listeners = util.event.listeners[ev.name];
  if (listeners) {
    util.event.callListeners(listeners, e);
  }

  listeners = util.event.listeners['*'];
  if (listeners) {
    util.event.callListeners(listeners, e);
  }
};

util.event.callListeners = function(listeners, e) {
  for (var i = 0; i < listeners.length; i++) {
    var f = listeners[i];
    f(e);
  }
};

//-----------------------------------------------------------------------------
// Geo Location
//-----------------------------------------------------------------------------
util.geo = {};
util.geo.DFLT_OPT = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
util.geo.watchId = null;
util.geo.count = 0;
util.geo.cbOK = null;
util.geo.cbERR = null;

util.geo.getPosition = function(cbOK, cbERR, opt) {
  if (!opt) {
    opt = util.geo.DFLT_OPT;
  }
  util.geo.cbOK = cbOK;
  util.geo.cbERR = cbERR;
  navigator.geolocation.getCurrentPosition(util.geo.onGetPosOK, util.geo.onGetPosERR, opt);
};

util.geo.onGetPosOK = function(pos) {
  var coords = pos.coords;
  var speed = coords.speed;
  var kmh = null;
  if (speed != null) {
    kmh = speed * 60 * 60 / 1000;
    kmh = Math.round(kmh * 10) / 10;
  }

  var data = {
    'timestamp': pos.timestamp,
    'latitude': coords.latitude,
    'longitude': coords.longitude,
    'altitude': coords.altitude,
    'accuracy': coords.accuracy,
    'altitudeAccuracy': coords.altitudeAccuracy,
    'heading': coords.heading,
    'speed': coords.speed, // m/s
    'speed_kmh': kmh
  };

  if (util.geo.cbOK) {
    util.geo.cbOK(data);
  }
};

util.geo.onGetPosERR = function(err) {
  if (util.geo.cbERR) {
    util.geo.cbERR(err);
  }
};

util.geo.startWatchPosition = function(cbOK, cbERR, opt) {
  if (util.geo.watchId != null) return;
  if (!opt) {
    opt = util.geo.DFLT_OPT;
  }
  util.geo.cbOK = cbOK;
  util.geo.cbERR = cbERR;
  util.geo.watchId = navigator.geolocation.watchPosition(util.geo.onGetPosOK, util.geo.onGetPosERR, opt);
  util.geo.count = 0;
};

util.geo.stopWatchPosition = function() {
  if (util.geo.watchId != null) {
    navigator.geolocation.clearWatch(util.geo.watchId);
    util.geo.watchId = null;
    util.geo.count = 0;
  }
};

// '35.681237, 139.766985'
// ->
// {
//   'latitude': 35.681237,
//   'longitude': 139.766985
// }
util.parseCoordinate = function(location) {
  location = location.replace(/ /g, '');
  var loc = location.split(',');
  var lat = parseFloat(loc[0]);
  var lon = parseFloat(loc[1]);
  var coordinate = {
    'latitude': lat,
    'longitude': lon
  };
  return coordinate;
};

// '35.681237, 139.766985'
// -> 35.681237
util.latitude = function(location) {
  var c = util.parseCoordinate(location);
  return c['latitude'];
};

// '35.681237, 139.766985'
// -> 139.766985
util.longitude = function(location) {
  var c = util.parseCoordinate(location);
  return c['longitude'];
};

// m/s -> km/h
util.ms2kmh = function(speed) {
  var kmh = speed * 60 * 60 / 1000;
  kmh = Math.round(kmh * 10) / 10;
  return kmh;
};

/**
 * 269, 0, 180 -> false
 * 270, 0, 180 -> true
 *   0, 0, 180 -> true
 *  90, 0, 180 -> true
 *  91, 0, 180 -> false
 */
util.isForwardMovement = function(azimuth, heading, range) {
  azimuth = util.roundAngle(azimuth);
  heading = util.roundAngle(heading);
  range = util.roundAngle(range);
  var rangeL = heading - (range / 2);
  if (rangeL < 0) {
    rangeL += 360;
  }
  var rangeR = heading + (range / 2);
  if (rangeR >= 360) {
    rangeR -= 360;
  }

  if (rangeR < rangeL) {
    if ((azimuth >= rangeL) || (azimuth <= rangeR)) {
      return true;
    }
  } else {
    if ((azimuth >= rangeL) && (azimuth <= rangeR)) {
      return true;
    }
  }
  return false;
};

//-----------------------------------------------------------------------------
util.onMouseMove = function(e) {
  var x = e.clientX;
  var y = e.clientY;
  util.mouseX = x;
  util.mouseY = y;
  util.infotip.onMouseMove(x, y);
  util.tooltip.onMouseMove(x, y);
};

//-----------------------------------------------------------------------------
util.keyHandlers = {
  down: [],
  press: [],
  up: []
};


// combination = {
//   ctrl: true
// }
// 'down', 83, fn, combination
// fn(e)
util.addKeyHandler = function(type, keyCode, fn, combination) {
  if ((type != 'down') && (type != 'press') && (type != 'up')) {
    return;
  }
  var handler = {
    keyCode: keyCode,
    combination: combination,
    fn: fn
  };
  util.keyHandlers[type].push(handler);
};

util.onKeyDown = function(e) {
  util.callKeyHandlers(e, 'down');
};

util.onKeyPress = function(e) {
  util.callKeyHandlers(e, 'press');
};

util.onKeyUp = function(e) {
  util.callKeyHandlers(e, 'up');
};

util.callKeyHandlers = function(e, type) {
  var handlers = util.keyHandlers[type];
  for (var i = 0; i < handlers.length; i++) {
    var handler = handlers[i];
    if (util.isTargetKey(e, handler)) {
      if (handler.fn) handler.fn(e);
    }
  }
};

util.isTargetKey = function(e, handler) {
  if (handler.keyCode == e.keyCode) {
    var combination = handler.combination;
    if (!combination ||
        ((combination.shift == undefined) || (e.shiftKey == combination.shift)) &&
        ((combination.ctrl == undefined) || (e.ctrlKey == combination.ctrl)) &&
        ((combination.alt == undefined) || (e.altKey == combination.alt)) &&
        ((combination.meta == undefined) || (e.metaKey == combination.meta))) {
      return true;
    }
  }
  return false;
};

//-----------------------------------------------------------------------------
util.loadScript = function(path) {
  var s = document.createElement('script');
  s.src = path;
  document.body.appendChild(s);
};

//-----------------------------------------------------------------------------
util.setupLogs = function() {
  if (!window.log) {
    window.log = function(o) {
      console.log(o);
    };
    window.log.v = function(o) {
      console.log(o);
    };
    window.log.d = function(o) {
      console.log(o);
    };
    window.log.i = function(o) {
      console.info(o);
    };
    window.log.w = function(o) {
      console.warn(o);
    };
    window.log.e = function(o) {
      console.error(o);
    };
  }
  util._log = function(o) {
    window.log(o);
  };
  util._log.v = function(o) {
    window.log.v(o);
  };
  util._log.d = function(o) {
    window.log.d(o);
  };
  util._log.i = function(o) {
    window.log.i(o);
  };
  util._log.w = function(o) {
    window.log.w(o);
  };
  util._log.e = function(o) {
    window.log.e(o);
  };
};

//-----------------------------------------------------------------------------
util.onResize = function() {
  util.infotip.adjust();
  util.dialog.adjust();
};

util.onReady = function() {
  util.setupStyle();
};

util.onB4Unload = function() {};
util.onUnload = function() {};

//-----------------------------------------------------------------------------
util.init = function() {
  util.setupLogs();
  try {
    if (typeof window.localStorage != 'undefined') {
      util.LS_AVAILABLE = true;
    }
  } catch (e) {}
  window.addEventListener('DOMContentLoaded', util.onReady, true);
  window.addEventListener('mousemove', util.onMouseMove, true);
  window.addEventListener('keydown', util.onKeyDown, true);
  window.addEventListener('keypress', util.onKeyPress, true);
  window.addEventListener('keyup', util.onKeyUp, true);
  window.addEventListener('resize', util.onResize, true);
  window.addEventListener('beforeunload', util.onB4Unload, true);
  window.addEventListener('unload', util.onUnload, true);
};

util.init();
