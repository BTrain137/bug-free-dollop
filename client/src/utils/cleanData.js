
export const cleanDeliveryDays = (stores) => {
  return stores.map(store => {
    return {
      ...store,
      "delivery-days": JSON.parse(store["delivery-days"]).join(", "),
    }
  });
}
