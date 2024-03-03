const { ShoppingRepository } = require("../database");
const { FormateData } = require("../utils");
const { APIError } = require("../utils/app-errors");

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async GetCart(customerId) {
    try {
      const cartItems = await this.repository.GetCart(customerId);
      return FormateData(cartItems);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async PlaceOrder(userInput) {
    const { _id, txnNumber } = userInput;

    // Verify the txn number with payment logs

    try {
      const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);
      return FormateData(orderResult);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetOrders(customerId) {
    try {
      const orders = await this.repository.Orders(customerId);
      return FormateData(orders);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async ManageCart(customerId, product, qty, isRemove) {
    try {
      const result = await this.repository.AddCartItem(customerId, product, qty, isRemove);
      return FormateData(result);
    } catch (err) {
      console.log(err, 'err.....')
      throw new APIError("Data Not found", err);
    }
  }


  async SubscribeEvents(payload){
 
    payload = JSON.parse(payload);
    const { event, data } =  payload;

    const { userId, product, qty } = data;

    switch(event){
        case 'ADD_TO_CART':
            this.ManageCart(userId,product, qty, false);
            break;
        case 'REMOVE_FROM_CART':
            this.ManageCart(userId,product,qty, true);
            break;
        case 'TESTING':
            console.log('Shopping Listener test ====== ');
            break;
        default:
            break;
    }
  }

  async GetOrderPayload(userId, order, event) {
    if (order) {
        const payload = {
            event,
            data: { userId, order}
        }

        return FormateData(payload);
    } else {
        return FormateData({ error: 'No order found'});
    }
}
}

module.exports = ShoppingService;
