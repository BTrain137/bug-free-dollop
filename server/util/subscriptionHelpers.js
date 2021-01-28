module.exports.getMealPlanAndMealFromSubscriptions = (subscriptions) => {
  const mealPlanAndMeal = subscriptions.filter((subscription) => {
    const { price, product_title } = subscription;
    return price == 0 || product_title.includes(" Meals: ");
  });
  return mealPlanAndMeal;
};

module.exports.getMealPlanFromSubscriptions = (subscriptions) => {
  const [mealPlan] = subscriptions.filter((subscription) => {
    const { product_title } = subscription;
    return product_title.toLowerCase().includes(" meals:");
  });
  return mealPlan;
};

module.exports.getSubscriptionsIds = (subscriptions) => {
  const subscriptionIds = subscriptions.map((subscription) => {
    return {
      id: subscription.id,
    };
  });
  return subscriptionIds;
};

module.exports.processWeeklyDeliveriesForPlanChange = (
  weekly_deliveries,
  nextChargeDate,
  mealPlanVariantId
) => {
  return new Promise((resolve, reject) => {
    try {
      const weeklyDeliveries = JSON.parse(weekly_deliveries);
      const weeks = Object.keys(weeklyDeliveries);
      const nextChargeDateFormWeeklies = weeks[0];

      let newWeeklies;
      if (nextChargeDate === nextChargeDateFormWeeklies) {
        newWeeklies = weeklyDeliveries[nextChargeDate];
      } else {
        newWeeklies = weeklyDeliveries[nextChargeDate]
          ? weeklyDeliveries[nextChargeDate]
          : weeklyDeliveries[nextChargeDateFormWeeklies];
      }

      if (newWeeklies) {
        const subscriptions = newWeeklies.map((subscription) => {
          let shopifyVariantId = "";
          let qty = "";
          for (const key in subscription) {
            if (subscription.hasOwnProperty(key)) {
              const element = subscription[key];
              if (key === "qty") {
                qty = element;
              } else {
                shopifyVariantId = element;
              }
            }
          }
          return {
            charge_interval_frequency: "1",
            next_charge_scheduled_at: nextChargeDate,
            order_interval_frequency: "1",
            order_interval_unit: "week",
            quantity: parseInt(qty, 10),
            shopify_variant_id: shopifyVariantId,
          };
        });

        subscriptions.push({
          charge_interval_frequency: "1",
          next_charge_scheduled_at: nextChargeDate,
          order_interval_frequency: "1",
          order_interval_unit: "week",
          quantity: 1,
          shopify_variant_id: mealPlanVariantId,
        });
        resolve(subscriptions);
      } else {
        resolve([
          {
            charge_interval_frequency: "1",
            next_charge_scheduled_at: nextChargeDate,
            order_interval_frequency: "1",
            order_interval_unit: "week",
            quantity: 1,
            shopify_variant_id: mealPlanVariantId,
          },
        ]);
      }
    } catch (error) {
      reject(error);
    }
  });
};
