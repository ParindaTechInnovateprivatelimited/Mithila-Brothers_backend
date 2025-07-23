const admin = require('firebase-admin');
const serviceAccount = require('./ecomm-241c2-firebase-adminsdk-259nh-3de4db7745.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
