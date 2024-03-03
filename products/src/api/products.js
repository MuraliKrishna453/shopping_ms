const { PublishCustomerEvent, PublishShoppingEvent, PublishMessage} = require('../utils/index');
const UserAuth = require('./middlewares/auth')
const ProductService = require('../services/product-service');
const { CUSTOMER_BINDING_KEY, SHOPPING_BINDING_KEY } = require('../config');


module.exports = (app, channel) => {
    
    const service = new ProductService();


    app.post('/create', async(req,res,next) => {
        
        try {
            const { name, desc, type, unit,price, available, suplier, banner } = req.body; 
            // validation
            const { data } =  await service.CreateProduct({ name, desc, type, unit,price, available, suplier, banner });
            return res.json(data);
            
        } catch (err) {
            next(err)    
        }
        
    });

    app.get('/category/:type', async(req,res,next) => {
        
        const type = req.params.type;
        
        try {
            const { data } = await service.GetProductsByCategory(type)
            return res.status(200).json(data);

        } catch (err) {
            next(err)
        }

    });

    app.get('/:id', async(req,res,next) => {
        
        const productId = req.params.id;

        try {
            const { data } = await service.GetProductDescription(productId);
            return res.status(200).json(data);

        } catch (err) {
            next(err)
        }

    });

    app.post('/ids', async(req,res,next) => {

        try {
            const { ids } = req.body;
            const products = await service.GetSelectedProducts(ids);
            return res.status(200).json(products);
            
        } catch (err) {
            next(err)
        }
       
    });
     
    app.put('/wishlist',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        const productId = req.body._id;


        
        try {
            // publish add to wishlist event
            const { data } = await service.GetProductPayload(_id, { productId }, 'ADD_TO_WISHLIST');

            PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(data));
            return res.status(200).json(data.data.product);
        } catch (err) {
            next(err)
        }
    });
    
    app.delete('/wishlist/:id',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        const productId = req.params.id;

        try {
            const { data } = await service.GetProductPayload(_id, { productId }, 'REMOVE_FROM_WISHLIST');

            // PublishCustomerEvent(data);
            PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(data));
            return res.status(200).json({"message": "Product removed successfully"});
        } catch (err) {
            next(err)
        }
    });


    app.put('/cart',UserAuth, async (req,res,next) => {
        
        const { _id } = req.user;
        const { qty } = req.body;
        const productId = req.body._id
        
        try {     
            const { data } = await service.GetProductPayload(_id, { productId, qty }, 'ADD_TO_CART');

            PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(data));
            PublishMessage(channel, SHOPPING_BINDING_KEY, JSON.stringify(data));
            // PublishCustomerEvent(data);
            // PublishShoppingEvent(data);

            const response = {
                product: data.data.product,
                unit: data.data.qty
            };
    
            return res.status(200).json(response);
            
        } catch (err) {
            next(err)
        }
    });
    
    app.delete('/cart/:id',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        const productId = req.params.id;

        try {
            const { data } = await service.GetProductPayload(_id, { productId }, 'REMOVE_FROM_CART'); 
            // PublishCustomerEvent(data);
            // PublishShoppingEvent(data); 
            
            PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(data));
            PublishMessage(channel, SHOPPING_BINDING_KEY, JSON.stringify(data));
             
            return res.status(200).json({"message": "Product removed successfully"});
        } catch (err) {
            next(err)
        }
    });

    //get Top products and category
    app.get('/', async (req,res,next) => {
        //check validation
        try {
            const { data} = await service.GetProducts();        
            return res.status(200).json(data);
        } catch (error) {
            next(err)
        }
        
    });
    
}