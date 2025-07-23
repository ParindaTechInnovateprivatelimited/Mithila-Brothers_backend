require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cronMiddleware = require('./middlewares/OrderDeletion');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

const allowedOrigins = ['https://elitezone.in', 'https://www.elitezone.in', 'http://localhost:3000'];

const corsOptionsRestricted = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

const corsOptionsAllowAll = {
    origin: true,
    credentials: true,
};

app.use(cors(corsOptionsAllowAll));


app.use(express.json());

connectDB();

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true
}));


app.use(cronMiddleware)

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.use('/', require('./routes/user/auth'));
app.use('/order', require('./routes/user/address'));
app.use('/user', require('./routes/user/user'));
app.use('/user', require('./routes/user/cart'));
app.use('/user', require('./routes/user/wishlist'));

app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/category'));
app.use('/order', require('./routes/user/orders'));

app.use('/admin', require('./routes/admin/adminRoutes'));
app.use('/admin', require('./routes/upload'));

app.use('/', require('./routes/user/paymentRoutes'));

app.use('/products', require('./routes/reviewRoutes'));

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

