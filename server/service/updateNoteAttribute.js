// "note_attributes": [
//   { "name": "DB ID", "value": "1102" },
//   { "name": "Delivery Date", "value": "10/11/2020" },
//   { "name": "Delivery Day", "value": "Sunday" },
//   { "name": "Zip Code", "value": "33306" },
//   { "name": "Store", "value": "Ft. Lauderdale" },
//   { "name": "Order Sequence", "value": "1" },
//   { "name": "Package Size", "value": "Medium" },
//   { "name": "Number of Meals", "value": "6" },
//   { "name": rSubscription Type", "value": "Weekly" },
// ],

const { restApiRequest } = require("../util/restApiRequest");
const { SHOP, ACCESS_TOKEN, RECHARGE_ACCESS_TOKEN } = process.env;

module.exports.updateNoteAttributeShopify = async function (
  orderId,
  note_attributes,
  newNotes
) {
  // Updating notes only not adding. Keeping the same note_attributes the way it is
  const updateAttributeNotes = note_attributes.map((note) => {
    if (newNotes[note.name]) {
      note.value = newNotes[note.name];
    }
    return note;
  });
  try {
    const options = {
      url: `https://${SHOP}.myshopify.com/admin/api/2020-04/orders/${orderId}.json`,
      headers: {
        "X-Shopify-Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: {
        order: {
          id: orderId,
          note_attributes: updateAttributeNotes,
        },
      },
    };

    const results = await restApiRequest(options);
    return results;
  } catch (error) {
    throw error;
  }
};

module.exports.updateNoteAttributeRecharge = async function (
  addressId,
  note_attributes,
  newNotes
) {
  // Updating notes only not adding. Keeping the same note_attributes the way it is
  const updateAttributeNotes = note_attributes.map((note) => {
    if (newNotes[note.name]) {
      note.value = newNotes[note.name];
    }
    return note;
  });
  try {
    const options = {
      url: `https://api.rechargeapps.com/addresses/${addressId}`,
      headers: {
        "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: {
        note_attributes: updateAttributeNotes,
      },
    };

    const results = await restApiRequest(options);
    return results;
  } catch (error) {
    throw error;
  }
};
