const moment = require("moment");

/**
 * @description Get this week day of the week's date
 * @example
 * // Week 7-12 -- 7-18
 * getThisWeekDayOccurrence("2020-07-14"); // "2020-07-15"
 * getThisWeekDayOccurrence("2020-07-12"); // "2020-07-15"
 * getThisWeekDayOccurrence("2020-07-16"); // "2020-07-15"
 * getThisWeekDayOccurrence("10/11/2020"); // "2020-10-14"
 */
const getThisWeekDayOccurrence = (date, day, format) => {
  const d = new Date(date);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  if (days.includes(day)) {
    const modifier = (d.getDay() - days.indexOf(day)) % 8;
    d.setDate(d.getDate() - modifier);
  }

  if(format === "american") {
    return moment(d).format("MM/DD/YYYY");
  }
  else {
    return moment(d).format("YYYY-MM-DD");
  }
};

module.exports = getThisWeekDayOccurrence;
