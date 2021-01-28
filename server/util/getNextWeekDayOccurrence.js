const moment = require("moment");

/**
 * @description Get Next week day of the week's date
 * @example
 * getNextWeekDayOccurrence("2020-07-14"); // "2020-07-15"
 * getNextWeekDayOccurrence("2020-07-12"); // "2020-07-15"
 * getNextWeekDayOccurrence("2020-07-16"); // "2020-07-15"
 */
const getNextWeekDayOccurrence = (date, day, format) => {
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
    d.setDate(d.getDate() - modifier + days.length);
  }

  if(format === "american") {
    return moment(d).format("MM/DD/YYYY");
  }
  else {
    return moment(d).format("YYYY-MM-DD");
  }
};

module.exports = getNextWeekDayOccurrence;
