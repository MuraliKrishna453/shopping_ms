const { CUSTOMER_BINDING_KEY } = require("../config");
const ShoppingService = require("../services/shopping-service");
const { PublishCustomerEvent, SubscribeMessage, PublishMessage } = require('../utils/index');
const UserAuth = require('./middlewares/auth');

module.exports = (app, channel) => {
    
    const service = new ShoppingService();
    SubscribeMessage(channel, service);

    app.post('/shopping/order',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        const { txnNumber } = req.body;


        try {
            const { data } = await service.PlaceOrder({_id, txnNumber});
            const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER');
            PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload.data));
            // PublishCustomerEvent(payload.data);
            return res.status(200).json(data);
            
        } catch (err) {
            next(err)
        }

    });

    app.get('/shopping/orders',UserAuth, async (req,res,next) => {

        const { _id } = req.user;

        try {
            const { data } = await service.GetOrders(_id);
            return res.status(200).json(data.orders);
        } catch (err) {
            next(err);
        }

    });
       
    
    app.get('/shopping/cart', UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        try {
            const { data } = await service.GetCart(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });
}