
module.exports.removeOldDateFromMetaObject = function(metafield, date) {
  const currentDate = new Date(date);
  for (const date in metafield) {
    let keyDate = new Date(date);
    keyDate.setDate(keyDate.getDate() + 10);
    if(keyDate < currentDate) {
      delete metafield[date];
    }
  }

  return metafield;
}