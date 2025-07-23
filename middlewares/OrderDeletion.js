const cron = require('node-cron');
const Order = require('../Models/user/Order');

const cronMiddleware = (req, res, next) => {
    if (!global.isCronStarted) {
        global.isCronStarted = true;

        cron.schedule('*/10 * * * * *', async () => {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

            try {
                const ordersToDelete = await Order.find({ status: 'Created', createdAt: { $lt: tenMinutesAgo } });

                if (ordersToDelete.length > 0) {
                    ordersToDelete.forEach(async (order) => {
                        await Order.findByIdAndDelete(order._id);
                        console.log(`Order ${order._id} has been deleted as it was not updated within 10 minutes.`);
                    });
                }
            } catch (err) {
                console.error("Error while deleting old orders: ", err);
            }
        });

        console.log('Cron job started to check and delete orders every 10 seconds');
    }
    next();
};

module.exports = cronMiddleware;

