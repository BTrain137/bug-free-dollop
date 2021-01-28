module.exports.isDeliveryMealCorrect = async (charge, index) => {
  try {
    const { customer_id, customer_email } = charge;
    const subscriptions = await getActiveSubscriptionByCustomerId(
      customer_id,
      index
    );
    const [mealPlan] = subscriptions.filter((subscription) =>
      subscription.product_title.includes("Meals: ")
    );

    if (!mealPlan) {
      console.log("NO Meal Plan", customer);
      const [rechargeCustomerProfile] = await findCustomerByEmail(
        customer_email
      );
      console.log(rechargeCustomerProfile);
      if (rechargeCustomerProfile.status !== "INACTIVE") {
        console.log("Customer Inactive but yet has no meals");
        await logErrors({
          customer_id,
          customer_email,
          notes: "ISSUE: Customer Inactive but yet has no meals",
          function_name: "isDeliveryMealCorrect",
          json_data: { customer },
        });
      }
      return;
    }

    const { next_charge_scheduled_at } = mealPlan;
    const isAllNextChargeDateTheSame = subscriptions.every(
      (subscription) =>
        subscription.next_charge_scheduled_at === next_charge_scheduled_at
    );

    if (!isAllNextChargeDateTheSame) {
      console.log("What.......... why aren't they all the same");
      await logErrors({
        customer_id,
        customer_email,
        notes: "ISSUE: What.......... why aren't they all the same",
        function_name: "moveChargeDateForUpcomingSkipped",
        json_data: {
          customer,
          subscriptions,
        },
      });
    }

    subscriptions.forEach((subscription) => {
      const { id } = subscription;
      console.log(id);
    });

    // console.log("Dry Run - Processed skipped", customer_email, weeklyDeliveries, processedSubscription);
    // return;
    
    return "okay";
  } catch (error) {
    console.log("Error: isDeliveryMealCorrect", error);
    throw error;
  }
};
