const {CartModel, OrderModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, BadRequestError, STATUS_CODES } = require('../../utils/app-errors')


//Dealing with data base operations
class ShoppingRepository {

    // payment

    async Orders(customerId){
        try{
            const orders = await OrderModel.find({customerId });        
            return orders;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
        }
    }

    async GetCart(customerId){
        try{
            const cart = await CartModel.find({customerId });        
            return cart;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Cart')
        }
    }

    async AddCartItem(customerId, product, qty, isRemove) {
        let cartSaveResult;

        try {
          const cart = await CartModel.findOne({customerId});
    
          if (cart) {
            const cartItem = {
              product,
              unit: qty,
            };
    
            let cartItems = cart.items || [];
    
            let isExist = false;
            cartItems.map((item) => {
              if (item.product._id.toString() === product._id.toString()) {
                if (isRemove) {
                  cartItems.splice(cartItems.indexOf(item), 1);
                } else {
                  item.unit = qty;
                }
                isExist = true;
              }
            });
  
            if (!isExist && !isRemove) {
              cartItems.push(cartItem);
            }

            cart.items = cartItems;
            cartSaveResult = await cart.save();
          } else {
            const payload = {
              customerId,
              items: [{product, unit: qty}]
            };

            cartSaveResult = await CartModel.create(payload);
          }

          return cartSaveResult;
        } catch (err) {
          console.log(err, 'err')
          throw new APIError(
            "API Error",
            STATUS_CODES.INTERNAL_ERROR,
            "Unable to Create Cart"
          );
        }
      }
 
 
    async CreateNewOrder(customerId, txnId){

        //check transaction for payment Status
        
        try{
            const cart = await CartModel.findOne({customerId});
    
            if(cart){
                
                let amount = 0;   
    
                let cartItems = cart.items;
    
                if(cartItems.length > 0){
                    //process Order
                    cartItems.map(item => {
                        amount += parseInt(item.product.price) *  parseInt(item.unit);   
                    });
        
                    const orderId = uuidv4();
        
                    const order = new OrderModel({
                        orderId,
                        customerId,
                        amount,
                        txnId,
                        status: 'received',
                        items: cartItems
                    })
        
                    const orderResult = await order.save();
    
                    await cart.deleteOne();
    
                    return orderResult;
                }
              }
    
              throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Cart')

        } catch(err){
          console.log(err, 'errrr');
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to create order')
        }
    }
}

module.exports = ShoppingRepository;