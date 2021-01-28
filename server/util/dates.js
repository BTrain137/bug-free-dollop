const moment = require("moment");
const getNextWeekDayOccurrence = require("./getNextWeekDayOccurrence");
const getThisWeekDayOccurrence = require("./getThisWeekDayOccurrence");

/**
 * Trying to be most accurate to east coast.
 */

module.exports.getNextChargeDate = () => {
  const now = new Date();
  const eastCoast = now.toLocaleString("en-US", {
    hour12: false,
    timeZone: "America/New_York",
  });
  const [date, time] = eastCoast.split(", ");
  const [month, day, year] = date.split("/");
  const correctedFormate = `${year}-${month}-${day}`;
  const todaysDay = new Date(correctedFormate).getDay();
  if (todaysDay <= 2 || todaysDay == 6) {
    return getThisWeekDayOccurrence(correctedFormate, "Wednesday");
  } else {
    return getNextWeekDayOccurrence(correctedFormate, "Wednesday");
  }
};

module.exports.getEastCoastDate = () => {
  const now = new Date();
  const eastCoast = now.toLocaleString("en-US", {
    hour12: false,
    timeZone: "America/New_York",
  });
  const [date, time] = eastCoast.split(", ");
  const [month, day, year] = date.split("/");
  const correctedDay = day.length === 1 ? `0${day}` : day;
  const correctedFormate = `${year}-${month}-${correctedDay}`;
  return correctedFormate;
}

/**
 * @description Get last week day of the week's date
 */
module.exports.getLastWeekDayOccurrence = (date, day, format) => {
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
    d.setDate(d.getDate() - modifier - days.length);
  }

  if(format === "american") {
    return moment(d).format("MM/DD/YYYY");
  }
  else {
    return moment(d).format("YYYY-MM-DD");
  }
};
