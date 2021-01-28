const moment = require("moment");
/**
 * @description Add months to start date by months
 * @param  {String} start     Date formate: August 24, 2023
 * @param  {Number} frequency How many months
 * @return {String}           Date as month long day is number and year is number
 * @example
 * calculateEndDate("May 31, 2020", 3)  // August 31, 2020
 * calculateEndDate("May 31, 2020", 12) // May 31, 2021
 */

const calculateEndDate = (start, frequency) => {
  const momentFormat = moment(start, "ll").isValid()
    ? moment(start, "ll")
    : moment(start, "YYYY-MM-DDTHH:mm:ssZ");

  const endDate = momentFormat.add(parseInt(frequency, 10), "month").calendar();

  return moment(endDate, "MM-DD-YYYY").format("MMMM DD, YYYY");
};

module.exports = calculateEndDate;
