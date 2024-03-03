const ProductService = require('../services/product-service');

module.exports = (app) => {

    const service = new ProductService();

    app.use('/app-events', async (req, res, next) => {
        const {payload} = req.body;

        console.log('==== Product Service Received Event =====');
        console.log(payload, 'payload');
        console.log('==== End of Product Service Event =====');
        return res.status(200).json(payload);
    })
}