const {
  createSubscriptionsBulk,
  deleteSubscriptionBulk,
} = require("./subscriptionController");

const processAddon = (addons, nextChargeDate) => {
  return addons.map((addon) => {
    const { qty, recharge_id, variantId } = addon;
    const shopify_variant_id = recharge_id || variantId;
    return {
      charge_interval_frequency: "1",
      next_charge_scheduled_at: nextChargeDate.replace("T00:00:00", ""),
      order_interval_frequency: "1",
      order_interval_unit: "week",
      quantity: parseInt(qty, 10),
      shopify_variant_id: parseInt(shopify_variant_id),
    };
  });
};

const buildDeleteAddon = (addons) => {
  return addons.map((addon) => {
    return {
      id: addon.id,
      send_email: 0,
    };
  });
};

module.exports.addAddon = async (addons, nextChargeDate, addressId) => {
  try {
    const processedAddon = processAddon(addons, nextChargeDate);
    await createSubscriptionsBulk(processedAddon, addressId);
    return "okay";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.removeAddon = async (currentAddons, addressId) => {
  try {
    const processedAddon = buildDeleteAddon(currentAddons);
    await deleteSubscriptionBulk(processedAddon, addressId);
    return "okay";
  } catch (error) {
    console.log(error);
    throw error;
  }
};
