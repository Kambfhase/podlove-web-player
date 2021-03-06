/**
 * Timecode as described in http://podlove.org/deep-link/
 *  and http://www.w3.org/TR/media-frags/#fragment-dimensions
 */
var timecodeRegExp = /(?:(\d+):)?(\d+):(\d+)(\.\d+)?([,\-](?:(\d+):)?(\d+):(\d+)(\.\d+)?)?/;

/**
 * return number as string lefthand filled with zeros
 * @param number number
 * @param width number
 * @return string
 **/
var zeroFill = function (number, width) {
  var s = number.toString();
  while (s.length < width) {
    s = "0" + s;
  }
  return s;
};

/**
 * convert an array of string to timecode
 * @param {Array} parts
 * @returns {number}
 */
function extractTime(parts) {
  var time = 0;
  // hours
  time += parts[1] ? parseInt(parts[1], 10) * 60 * 60 : 0;
  // minutes
  time += parseInt(parts[2], 10) * 60;
  // seconds
  time += parseInt(parts[3], 10);
  // milliseconds
  time += parts[4] ? parseFloat(parts[4]) : 0;
  // no negative time
  time = Math.max(time, 0);
  return time;
}

/**
 * convert a timestamp to a timecode in ${insert RFC here} format
 * @param {Number} time
 * @param {Boolean} leadingZeros
 * @param {Boolean} [forceHours] force output of hours, defaults to false
 * @param {Boolean} [showMillis] output milliseconds separated with a dot from the seconds - defaults to false
 * @return {string}
 **/
function ts2tc(time, leadingZeros, forceHours, showMillis) {
  var timecode = '',
    hours, minutes, seconds, milliseconds;

  if (time === 0) {
    return (forceHours ? '00:00:00' : '00:00');
  }

  // prevent negative values from player
  if (!time || time <= 0) {
    return (forceHours ? '--:--:--' : '--:--');
  }


  hours = Math.floor(time / 60 / 60);
  minutes = Math.floor(time / 60) % 60;
  seconds = Math.floor(time % 60) % 60;
  milliseconds = Math.floor(time % 1 * 1000);

  console.log(hours, minutes, seconds, milliseconds);

  if (showMillis && milliseconds) {
    timecode = '.' + zeroFill(milliseconds, 3);
  }

  timecode = ':' + zeroFill(seconds, 2) + timecode;

  if (hours == 0 && !forceHours && !leadingZeros ) {
    return minutes.toString() + timecode;
  }

  timecode = zeroFill(minutes, 2) + timecode;

  if (hours == 0 && !forceHours) {
    // required (minutes : seconds)
    return timecode;
  }

  if (leadingZeros) {
    return zeroFill(hours, 2) + ':' + timecode;
  }

  return hours + ':' + timecode;
}

module.exports = {

  /**
   * convenience method for converting timestamps to
   * @param {Number} timestamp
   * @returns {String} timecode
   */
  fromTimeStamp: function (timestamp) {
    return ts2tc(timestamp, true, true);
  },

  /**
   * accepts array with start and end time in seconds
   * returns timecode in deep-linking format
   * @param {Array} times
   * @param {Boolean} leadingZeros
   * @param {Boolean} [forceHours]
   * @return {string}
   **/
  generate: function (times, leadingZeros, forceHours) {
    if (times[1] > 0 && times[1] < 9999999 && times[0] < times[1]) {
      return ts2tc(times[0], leadingZeros, forceHours) + ',' + ts2tc(times[1], leadingZeros, forceHours);
    }
    return ts2tc(times[0], leadingZeros, forceHours);
  },


  /**
   * parses time code into seconds
   * @param {String} timecode
   * @return {Array}
   **/
  parse: function (timecode) {
    var parts, startTime, endTime;
    if (!timecode) {
      return [false, false];
    }

    parts = timecode.match(timecodeRegExp);
    if (!parts || parts.length < 10) {
      return [false, false];
    }
    startTime = extractTime(parts);

    // if there only a startTime but no endTime
    if (parts[5] === undefined) {
      return [startTime, false];
    }

    endTime = extractTime(parts.splice(6));

    return (endTime > startTime) ? [startTime, endTime] : [startTime, false];
  },

  getStartTimeCode: function getStartTimecode(start) {
      return this.parse(start)[0];
  }
};
